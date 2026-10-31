package br.imperiourbano.engine;

/** Dados do jogador que pertencem às regras. Avatar, cor e conexão ficam na camada de sala. */
public record PlayerState(
        String id,
        String nickname,
        int credits,
        int position,
        boolean bankrupt,
        int skipTurns) {

    PlayerState withCredits(int value) {
        return new PlayerState(id, nickname, value, position, bankrupt, skipTurns);
    }

    PlayerState withPosition(int value) {
        return new PlayerState(id, nickname, credits, value, bankrupt, skipTurns);
    }

    PlayerState asBankrupt() {
        return new PlayerState(id, nickname, 0, position, true, 0);
    }
}
