package br.imperiourbano.engine;

/**
 * Dados do jogador que pertencem às regras. Avatar, cor e conexão ficam na camada de sala.
 * {@code restPasses} (Passe Livre) e {@code rentWaivers} (Aluguel Zero) são itens guardados das cartas
 * de evento (07/11/2026); snapshots antigos, sem esses campos, leem 0.
 */
public record PlayerState(
        String id,
        String nickname,
        int credits,
        int position,
        boolean bankrupt,
        int skipTurns,
        boolean travelPending,
        int restPasses,
        int rentWaivers) {

    static PlayerState starting(String id, String nickname, int credits) {
        return new PlayerState(id, nickname, credits, 0, false, 0, false, 0, 0);
    }

    PlayerState withCredits(int value) {
        return new PlayerState(id, nickname, value, position, bankrupt, skipTurns, travelPending, restPasses, rentWaivers);
    }

    PlayerState withPosition(int value) {
        return new PlayerState(id, nickname, credits, value, bankrupt, skipTurns, travelPending, restPasses, rentWaivers);
    }

    PlayerState withSkipTurns(int value) {
        return new PlayerState(id, nickname, credits, position, bankrupt, value, travelPending, restPasses, rentWaivers);
    }

    PlayerState withTravelPending(boolean value) {
        return new PlayerState(id, nickname, credits, position, bankrupt, skipTurns, value, restPasses, rentWaivers);
    }

    PlayerState withRestPasses(int value) {
        return new PlayerState(id, nickname, credits, position, bankrupt, skipTurns, travelPending, value, rentWaivers);
    }

    PlayerState withRentWaivers(int value) {
        return new PlayerState(id, nickname, credits, position, bankrupt, skipTurns, travelPending, restPasses, value);
    }

    /** Falido perde tudo, inclusive os itens guardados. */
    PlayerState asBankrupt() {
        return new PlayerState(id, nickname, 0, position, true, 0, false, 0, 0);
    }
}
