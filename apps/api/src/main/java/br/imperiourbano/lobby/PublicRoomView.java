package br.imperiourbano.lobby;

import br.imperiourbano.catalog.GameMode;

/** Sala na lista pública: sem código de convite, para não abrir salas privadas por engano. */
public record PublicRoomView(String gameId, String hostName, GameMode mode, int stake, int players, int capacity) {
}
