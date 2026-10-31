package br.imperiourbano.engine;

/** Dados do jogador que pertencem às regras. Avatar, cor e conexão ficam na camada de sala. */
public record PlayerState(
        String id,
        String nickname,
        int credits,
        int position,
        boolean bankrupt,
        int skipTurns,
        boolean travelPending) {

    static PlayerState starting(String id, String nickname, int credits) {
        return new PlayerState(id, nickname, credits, 0, false, 0, false);
    }

    PlayerState withCredits(int value) {
        return new PlayerState(id, nickname, value, position, bankrupt, skipTurns, travelPending);
    }

    PlayerState withPosition(int value) {
        return new PlayerState(id, nickname, credits, value, bankrupt, skipTurns, travelPending);
    }

    PlayerState withSkipTurns(int value) {
        return new PlayerState(id, nickname, credits, position, bankrupt, value, travelPending);
    }

    PlayerState withTravelPending(boolean value) {
        return new PlayerState(id, nickname, credits, position, bankrupt, skipTurns, value);
    }

    PlayerState asBankrupt() {
        return new PlayerState(id, nickname, 0, position, true, 0, false);
    }
}
