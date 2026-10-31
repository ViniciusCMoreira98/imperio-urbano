package br.imperiourbano.game;

import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import java.util.List;

/**
 * Publicado (de forma síncrona) sempre que o estado da partida muda ou precisa ser reenviado.
 * {@code events} vazio = só reenvio do estado (ex.: alguém conectou).
 */
public record GameUpdated(String gameId, List<GameEvent> events, GameState state) {

    public GameUpdated {
        events = List.copyOf(events);
    }
}
