package br.imperiourbano.persistence;

/** Outra gravação avançou a partida antes desta; o chamador deve recarregar o estado. */
public class ConcurrentGameUpdateException extends RuntimeException {

    public ConcurrentGameUpdateException(String gameId, long expectedVersion) {
        super("Partida " + gameId + " não está mais na versão " + expectedVersion);
    }
}
