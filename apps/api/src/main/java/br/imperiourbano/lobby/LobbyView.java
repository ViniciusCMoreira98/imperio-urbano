package br.imperiourbano.lobby;

import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameStatus;
import java.util.List;

/** O que os jogadores da sala veem: membros, escolhas e se o anfitrião já pode iniciar. */
public record LobbyView(
        String gameId,
        String inviteCode,
        GameMode mode,
        GameStatus status,
        String hostPlayerId,
        List<Member> players,
        boolean canStart) {

    public record Member(String playerId, String nickname, int seat, String avatarId, PawnColor pawnColor, boolean ready) {
    }
}
