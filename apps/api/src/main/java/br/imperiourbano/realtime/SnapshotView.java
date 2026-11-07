package br.imperiourbano.realtime;

import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.Debt;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.engine.OlympicsState;
import br.imperiourbano.engine.PlayerState;
import br.imperiourbano.engine.PropertyState;
import br.imperiourbano.engine.TurnPhase;
import br.imperiourbano.lobby.LobbyView;
import br.imperiourbano.lobby.PawnColor;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Estado público da partida (GameSnapshot do protocolo TS): regras do motor + avatar, cor e conexão
 * da sala. Não inclui a ordem do baralho de eventos.
 */
record SnapshotView(
        String gameId,
        String inviteCode,
        GameMode mode,
        GameStatus status,
        long version,
        int round,
        String currentPlayerId,
        TurnPhase phase,
        int[] lastDice,
        List<Player> players,
        List<PropertyState> properties,
        OlympicsState olympics,
        Debt pendingDebt,
        List<String> winnerIds,
        /** Fundo da Taxa: quem parar no Saque leva tudo. */
        int taxPool,
        /** Carta de evento revelada que espera o jogador da vez escolher um estado; nula sem escolha pendente. */
        String pendingEventCardId,
        /** Tempo até o servidor agir pelo jogador da vez; nulo quando não há prazo. */
        Long turnTimeLeftMs) {

    record Player(
            String id,
            String nickname,
            String avatarId,
            PawnColor pawnColor,
            int seat,
            int credits,
            int position,
            boolean ready,
            boolean connected,
            boolean bankrupt,
            int skipTurns,
            boolean travelPending) {
    }

    static SnapshotView of(GameState state, String inviteCode, List<LobbyView.Member> members, Set<String> connected,
            Long turnTimeLeftMs) {
        Map<String, LobbyView.Member> byId = members.stream()
                .collect(Collectors.toMap(LobbyView.Member::playerId, Function.identity()));
        List<Player> players = state.players().stream().map(p -> player(p, byId.get(p.id()), connected)).toList();
        return new SnapshotView(
                state.gameId(),
                inviteCode,
                state.mode(),
                state.status(),
                state.version(),
                state.round(),
                state.status() == GameStatus.IN_PROGRESS ? state.currentPlayer().id() : null,
                state.phase(),
                state.lastDice() == null ? null : new int[] {state.lastDice().first(), state.lastDice().second()},
                players,
                state.properties().values().stream().sorted(Comparator.comparing(PropertyState::stateId)).toList(),
                state.olympics(),
                state.pendingDebt(),
                state.winnerIds(),
                state.taxPool(),
                state.eventDeck() == null ? null : state.eventDeck().pendingCardId(),
                turnTimeLeftMs);
    }

    private static Player player(PlayerState p, LobbyView.Member member, Set<String> connected) {
        return new Player(p.id(), p.nickname(), member.avatarId(), member.pawnColor(), member.seat(),
                p.credits(), p.position(), member.ready(), connected.contains(p.id()), p.bankrupt(),
                p.skipTurns(), p.travelPending());
    }
}
