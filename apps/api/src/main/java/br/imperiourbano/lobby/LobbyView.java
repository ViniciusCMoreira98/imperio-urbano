package br.imperiourbano.lobby;

import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameStatus;
import java.util.List;

/** O que os jogadores da sala veem: membros, escolhas e se o anfitrião já pode iniciar. */
public record LobbyView(
        String gameId,
        String inviteCode,
        GameMode mode,
        /** Aposta de cada jogador; o vencedor leva aposta × jogadores. */
        int stake,
        /** Aparece na lista de salas públicas; privada só entra com o código. */
        boolean publicRoom,
        GameStatus status,
        String hostPlayerId,
        List<Member> players,
        boolean canStart,
        /** Milissegundos até o início automático; nulo com menos de 2 jogadores (ou fora da sala). */
        Long startsInMs) {

    public record Member(String playerId, String nickname, int seat, String avatarId, PawnColor pawnColor, boolean ready) {
    }
}
