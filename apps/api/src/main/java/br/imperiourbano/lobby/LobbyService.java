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
import java.time.Duration;
import java.time.Instant;
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
    static final String DEFAULT_AVATAR = "avatar-1";
    /** Sem I, O, 0 e 1, para o código ser fácil de ditar. */
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final int PUBLIC_LIST_LIMIT = 50;
    /** Contagem do início automático, a partir de 2 jogadores na sala (pedido do usuário, 07/11/2026). */
    public static final Duration AUTO_START = Duration.ofSeconds(10);
    /** Sala que não começou em 5 minutos desde a criação é fechada (pedido do usuário, 09/11/2026). */
    public static final Duration STALE_LOBBY = Duration.ofMinutes(5);

    private final GameStore store;
    private final LobbyMemberRepository members;
    private final GameEngine engine;
    private final int minPlayers;
    private final int maxPlayers;
    private final ApplicationEventPublisher publisher;
    private final WalletService wallet;
    private final CharacterPreferences characters;
    private final SecureRandom random = new SecureRandom();

    LobbyService(GameStore store, LobbyMemberRepository members, GameEngine engine, Catalog catalog,
            ApplicationEventPublisher publisher, WalletService wallet, CharacterPreferences characters) {
        this.store = store;
        this.characters = characters;
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
    public LobbyView create(GuestPrincipal player, GameMode mode, int stake, boolean publicRoom) {
        if (!wallet.validStake(stake)) {
            throw new LobbyException(HttpStatus.BAD_REQUEST, "Aposta inválida.");
        }
        requireCoins(player, stake);
        String gameId = UUID.randomUUID().toString();
        store.createGame(gameId, newInviteCode(), mode, player.playerId(), stake, publicRoom);
        CharacterPreferences.Character preferred = characters.of(player.playerId());
        members.save(new LobbyMemberRecord(gameId, player.playerId(), player.nickname(), 0,
                preferred.avatarId(), seatColor(preferred, EnumSet.allOf(PawnColor.class))));
        return view(gameId);
    }

    @Transactional
    public LobbyView join(GuestPrincipal player, String inviteCode) {
        String code = inviteCode == null ? "" : inviteCode.strip().toUpperCase(Locale.ROOT);
        return join(player, store.findByInviteCode(code).orElseThrow(LobbyException::notFound));
    }

    /** Entrada pela lista de salas públicas: só vale para sala pública (privada responde "não encontrada"). */
    @Transactional
    public LobbyView joinPublic(GuestPrincipal player, String gameId) {
        GameInfo game = store.find(gameId).filter(GameInfo::publicRoom).orElseThrow(LobbyException::notFound);
        return join(player, game);
    }

    private LobbyView join(GuestPrincipal player, GameInfo found) {
        GameInfo game = lockGame(found.id());
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
        CharacterPreferences.Character preferred = characters.of(player.playerId());
        members.save(new LobbyMemberRecord(game.id(), player.playerId(), player.nickname(), seat,
                preferred.avatarId(), seatColor(preferred, free)));
        members.flush();
        refreshCountdown(game.id());
        return view(game.id());
    }

    /** A cor preferida do jogador, se ninguém da sala estiver com ela; senão, a primeira livre. */
    private static PawnColor seatColor(CharacterPreferences.Character preferred, Set<PawnColor> free) {
        return preferred.pawnColor() != null && free.contains(preferred.pawnColor())
                ? preferred.pawnColor() : free.iterator().next();
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
        // A troca na sala vira a preferência: a próxima sala já começa com ela.
        characters.save(player.playerId(), avatarId, color);
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

    /**
     * Sair da sala antes de começar: libera o assento (a sala volta à lista pública e some de "Suas partidas"
     * de quem saiu). Saindo o anfitrião, o próximo assento assume; saindo o último, a sala é fechada.
     * Depois do início não há saída: a partida segue e o jogador pode voltar a ela.
     */
    @Transactional
    public void leave(GuestPrincipal player, String gameId) {
        GameInfo game = lockGame(gameId);
        LobbyMemberRecord me = requireMember(gameId, player);
        requireLobby(game);
        members.delete(me);
        members.flush();
        List<LobbyMemberRecord> rest = members.findByGameIdOrderBySeatAsc(gameId);
        if (rest.isEmpty()) {
            store.deleteLobby(gameId);
            return;
        }
        if (player.playerId().equals(game.hostPlayerId())) {
            store.changeHost(gameId, rest.getFirst().playerId());
        }
        refreshCountdown(gameId);
    }

    /**
     * Início automático (pedido do usuário, 07/11/2026): com 2 ou mais jogadores a contagem de 10 s liga;
     * caindo para 1, desliga. Quem entra durante a contagem não a reinicia.
     */
    private void refreshCountdown(String gameId) {
        int seated = members.findByGameIdOrderBySeatAsc(gameId).size();
        boolean running = store.startsAt(gameId).isPresent();
        if (seated >= minPlayers && !running) {
            store.setStartsAt(gameId, Instant.now().plus(AUTO_START));
        } else if (seated < minPlayers && running) {
            store.setStartsAt(gameId, null);
        }
    }

    /**
     * Fecha salas que não começaram em {@link #STALE_LOBBY} desde a criação (pedido do usuário, 09/11/2026).
     * A aposta só é cobrada no início, então não há nada a devolver; quem ainda estiver na sala volta ao menu
     * (a sala passa a responder "não encontrada").
     */
    @Transactional
    public int closeStaleLobbies() {
        return store.deleteStaleLobbies(Instant.now().minus(STALE_LOBBY));
    }

    /** Salas com a contagem vencida (o relógio da sala chama {@link #autoStart} para cada uma). */
    @Transactional(readOnly = true)
    public List<String> dueLobbies() {
        return store.dueLobbies(Instant.now());
    }

    /**
     * Fim da contagem: começa sem exigir "pronto" nem o anfitrião. Quem não tem mais moedas para a aposta
     * sai da sala; sobrando menos de 2, a contagem desliga e a sala segue esperando.
     */
    @Transactional
    public void autoStart(String gameId) {
        GameInfo game = store.lock(gameId).orElse(null);
        if (game == null || game.status() != GameStatus.LOBBY) return;
        Instant startsAt = store.startsAt(gameId).orElse(null);
        if (startsAt == null || startsAt.isAfter(Instant.now())) return;
        List<LobbyMemberRecord> seated = members.findByGameIdOrderBySeatAsc(gameId);
        List<LobbyMemberRecord> broke = seated.stream().filter(m -> wallet.coins(m.playerId()) < game.stake()).toList();
        if (!broke.isEmpty()) {
            members.deleteAll(broke);
            members.flush();
            seated = members.findByGameIdOrderBySeatAsc(gameId);
            if (seated.isEmpty()) {
                store.deleteLobby(gameId);
                return;
            }
            if (seated.stream().noneMatch(m -> m.playerId().equals(game.hostPlayerId()))) {
                store.changeHost(gameId, seated.getFirst().playerId());
            }
        }
        if (seated.size() < minPlayers) {
            store.setStartsAt(gameId, null);
            return;
        }
        begin(game, seated);
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
        begin(game, seated);
        return view(gameId);
    }

    /** Cobra a aposta de todos e começa a partida na ordem dos assentos. */
    private void begin(GameInfo game, List<LobbyMemberRecord> seated) {
        String gameId = game.id();
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
    }

    /**
     * Salas públicas em que o jogador pode entrar agora: esperando jogadores, com vaga, aposta que cabe no
     * saldo e sem ele já sentado. Não inclui o código de convite.
     */
    @Transactional(readOnly = true)
    public List<PublicRoomView> publicRooms(GuestPrincipal player) {
        record Room(GameInfo game, List<LobbyMemberRecord> seated) {
        }
        long coins = wallet.coins(player.playerId());
        return store.publicLobbies(PUBLIC_LIST_LIMIT).stream()
                .filter(game -> game.stake() <= coins)
                .map(game -> new Room(game, members.findByGameIdOrderBySeatAsc(game.id())))
                .filter(room -> room.seated().size() < maxPlayers
                        && room.seated().stream().noneMatch(m -> m.playerId().equals(player.playerId())))
                .map(room -> new PublicRoomView(room.game().id(), hostName(room.game(), room.seated()),
                        room.game().mode(), room.game().stake(), room.seated().size(), maxPlayers))
                .toList();
    }

    private static String hostName(GameInfo game, List<LobbyMemberRecord> seated) {
        return seated.stream().filter(m -> m.playerId().equals(game.hostPlayerId())).findFirst()
                .or(() -> seated.stream().findFirst()).map(LobbyMemberRecord::nickname).orElse("—");
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
        // Tempo restante (e não o horário), para o relógio do aparelho não precisar bater com o do servidor.
        Long startsInMs = game.status() != GameStatus.LOBBY ? null : store.startsAt(gameId)
                .map(at -> Math.max(0, Duration.between(Instant.now(), at).toMillis())).orElse(null);
        return new LobbyView(game.id(), game.inviteCode(), game.mode(), game.stake(), game.publicRoom(), game.status(), game.hostPlayerId(),
                seated.stream().map(m -> new LobbyView.Member(m.playerId(), m.nickname(), m.seat(),
                        m.avatarId(), m.pawnColor(), m.ready(), m.photoUrl())).toList(),
                canStart, startsInMs);
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
