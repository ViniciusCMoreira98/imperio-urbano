package br.imperiourbano.lobby;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent.GameStarted;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.game.GameUpdated;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.persistence.GameInfo;
import br.imperiourbano.persistence.GameStore;
import br.imperiourbano.wallet.WalletService;
import java.security.SecureRandom;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Salas privadas (E16): criar, entrar por código, escolher avatar e cor, ficar pronto e iniciar.
 * Alterações travam a linha da partida, então entradas simultâneas não disputam o mesmo assento.
 */
@Service
public class LobbyService {

    public static final Set<String> AVATARS = Set.of("avatar-1", "avatar-2", "avatar-3", "avatar-4", "avatar-5");
    private static final String DEFAULT_AVATAR = "avatar-1";
    /** Sem I, O, 0 e 1, para o código ser fácil de ditar. */
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;

    private final GameStore store;
    private final LobbyMemberRepository members;
    private final GameEngine engine;
    private final int minPlayers;
    private final int maxPlayers;
    private final ApplicationEventPublisher publisher;
    private final WalletService wallet;
    private final SecureRandom random = new SecureRandom();

    LobbyService(GameStore store, LobbyMemberRepository members, GameEngine engine, Catalog catalog,
            ApplicationEventPublisher publisher, WalletService wallet) {
        this.store = store;
        this.wallet = wallet;
        this.members = members;
        this.engine = engine;
        this.publisher = publisher;
        this.minPlayers = catalog.rules().players().min();
        this.maxPlayers = catalog.rules().players().max();
    }

    public int lowestStake() {
        return wallet.stakes().getFirst();
    }

    /** A aposta precisa ser uma das permitidas e caber no saldo de quem cria. */
    @Transactional
    public LobbyView create(GuestPrincipal player, GameMode mode, int stake) {
        if (!wallet.validStake(stake)) {
            throw new LobbyException(HttpStatus.BAD_REQUEST, "Aposta inválida.");
        }
        requireCoins(player, stake);
        String gameId = UUID.randomUUID().toString();
        store.createGame(gameId, newInviteCode(), mode, player.playerId(), stake);
        members.save(new LobbyMemberRecord(gameId, player.playerId(), player.nickname(), 0,
                DEFAULT_AVATAR, PawnColor.values()[0]));
        return view(gameId);
    }

    @Transactional
    public LobbyView join(GuestPrincipal player, String inviteCode) {
        String code = inviteCode == null ? "" : inviteCode.strip().toUpperCase(Locale.ROOT);
        GameInfo game = store.findByInviteCode(code).orElseThrow(LobbyException::notFound);
        store.lock(game.id());
        List<LobbyMemberRecord> current = members.findByGameIdOrderBySeatAsc(game.id());
        if (current.stream().anyMatch(m -> m.playerId().equals(player.playerId()))) {
            return view(game.id());
        }
        requireLobby(game);
        if (current.size() >= maxPlayers) {
            throw LobbyException.conflict("A sala está cheia.");
        }
        requireCoins(player, game.stake());
        Set<Integer> seats = current.stream().map(LobbyMemberRecord::seat).collect(Collectors.toSet());
        int seat = IntStream.range(0, maxPlayers).filter(s -> !seats.contains(s)).findFirst().orElseThrow();
        EnumSet<PawnColor> free = EnumSet.allOf(PawnColor.class);
        current.forEach(m -> free.remove(m.pawnColor()));
        members.save(new LobbyMemberRecord(game.id(), player.playerId(), player.nickname(), seat,
                DEFAULT_AVATAR, free.iterator().next()));
        return view(game.id());
    }

    @Transactional(readOnly = true)
    public LobbyView view(GuestPrincipal player, String gameId) {
        requireMember(gameId, player);
        return view(gameId);
    }

    /** Avatares podem se repetir; cores não, pois são elas que distinguem os peões. */
    @Transactional
    public LobbyView customize(GuestPrincipal player, String gameId, String avatarId, PawnColor color) {
        GameInfo game = lockGame(gameId);
        LobbyMemberRecord me = requireMember(gameId, player);
        requireLobby(game);
        if (!AVATARS.contains(avatarId)) {
            throw new LobbyException(HttpStatus.BAD_REQUEST, "Avatar inválido.");
        }
        if (color == null) {
            throw new LobbyException(HttpStatus.BAD_REQUEST, "Escolha uma cor de peão.");
        }
        boolean taken = members.findByGameIdOrderBySeatAsc(gameId).stream()
                .anyMatch(m -> !m.playerId().equals(player.playerId()) && m.pawnColor() == color);
        if (taken) {
            throw LobbyException.conflict("Essa cor já foi escolhida por outro jogador.");
        }
        me.customize(avatarId, color);
        members.save(me);
        return view(gameId);
    }

    @Transactional
    public LobbyView setReady(GuestPrincipal player, String gameId, boolean ready) {
        GameInfo game = lockGame(gameId);
        LobbyMemberRecord me = requireMember(gameId, player);
        requireLobby(game);
        me.setReady(ready);
        members.save(me);
        return view(gameId);
    }

    /** Só o anfitrião inicia, com 2–4 jogadores todos prontos. A ordem de jogo segue os assentos. */
    @Transactional
    public LobbyView start(GuestPrincipal player, String gameId) {
        GameInfo game = lockGame(gameId);
        requireMember(gameId, player);
        if (!player.playerId().equals(game.hostPlayerId())) {
            throw new LobbyException(HttpStatus.FORBIDDEN, "Só o anfitrião pode iniciar a partida.");
        }
        requireLobby(game);
        List<LobbyMemberRecord> seated = members.findByGameIdOrderBySeatAsc(gameId);
        if (seated.size() < minPlayers) {
            throw LobbyException.conflict("São necessários de %d a %d jogadores.".formatted(minPlayers, maxPlayers));
        }
        if (!seated.stream().allMatch(LobbyMemberRecord::ready)) {
            throw LobbyException.conflict("Todos os jogadores precisam estar prontos.");
        }
        // A aposta é cobrada agora; faltando saldo a alguém, nada é cobrado (a transação desfaz tudo).
        for (LobbyMemberRecord m : seated) {
            if (!wallet.debit(m.playerId(), game.stake())) {
                throw LobbyException.conflict("%s não tem moedas para a aposta.".formatted(m.nickname()));
            }
        }
        GameStarted started = engine.start(gameId, game.mode(),
                seated.stream().map(m -> new StartingPlayer(m.playerId(), m.nickname())).toList());
        GameState state = engine.apply(null, started);
        store.append(gameId, game.version(), List.of(started), state, null, null);
        // Inicia o relógio do primeiro turno.
        publisher.publishEvent(new GameUpdated(gameId, List.of(started), state));
        return view(gameId);
    }

    /** Salas e partidas ainda não encerradas do jogador, da mais recente para a mais antiga. */
    @Transactional(readOnly = true)
    public List<LobbyView> activeGames(GuestPrincipal player) {
        return members.findByPlayerIdOrderByJoinedAtDesc(player.playerId()).stream()
                .map(m -> view(m.gameId()))
                .filter(game -> game.status() != GameStatus.FINISHED)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isMember(String gameId, String playerId) {
        return members.existsById(new LobbyMemberRecord.Key(gameId, playerId));
    }

    /** Jogadores da sala com avatar e cor, para compor o snapshot enviado aos clientes. */
    @Transactional(readOnly = true)
    public List<LobbyView.Member> members(String gameId) {
        return view(gameId).players();
    }

    private LobbyView view(String gameId) {
        GameInfo game = store.find(gameId).orElseThrow(LobbyException::notFound);
        List<LobbyMemberRecord> seated = members.findByGameIdOrderBySeatAsc(gameId);
        boolean canStart = game.status() == GameStatus.LOBBY
                && seated.size() >= minPlayers
                && seated.stream().allMatch(LobbyMemberRecord::ready);
        return new LobbyView(game.id(), game.inviteCode(), game.mode(), game.stake(), game.status(), game.hostPlayerId(),
                seated.stream().map(m -> new LobbyView.Member(m.playerId(), m.nickname(), m.seat(),
                        m.avatarId(), m.pawnColor(), m.ready())).toList(),
                canStart);
    }

    private GameInfo lockGame(String gameId) {
        return store.lock(gameId).orElseThrow(LobbyException::notFound);
    }

    /** Quem não é da sala recebe "não encontrada", para não revelar salas alheias. */
    private LobbyMemberRecord requireMember(String gameId, GuestPrincipal player) {
        return members.findById(new LobbyMemberRecord.Key(gameId, player.playerId()))
                .orElseThrow(LobbyException::notFound);
    }

    private void requireCoins(GuestPrincipal player, int stake) {
        if (wallet.coins(player.playerId()) < stake) {
            throw LobbyException.conflict("Moedas insuficientes para essa aposta.");
        }
    }

    private static void requireLobby(GameInfo game) {
        if (game.status() != GameStatus.LOBBY) {
            throw LobbyException.conflict("A partida já começou.");
        }
    }

    private String newInviteCode() {
        while (true) {
            StringBuilder code = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                code.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
            }
            if (!store.inviteCodeExists(code.toString())) return code.toString();
        }
    }
}
