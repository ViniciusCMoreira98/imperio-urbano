package br.imperiourbano.engine;

/** Edição atual das Olimpíadas. Só um estado é sede por vez; {@code multiplier} 1 = sem sede. */
public record OlympicsState(int edition, String hostStateId, String hostPlayerId, int multiplier) {

    static final OlympicsState NONE = new OlympicsState(0, null, null, 1);

    boolean isHost(String stateId) {
        return stateId.equals(hostStateId);
    }
}
