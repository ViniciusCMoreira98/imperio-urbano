package br.imperiourbano.game;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Quem está conectado a cada partida (um jogador pode ter várias abas). Alimentado pelo canal
 * WebSocket; usado no snapshot ("conectado"), no modo automático e no encerramento por abandono.
 * Publica {@link Changed} quando a partida fica vazia ou volta a ter alguém.
 */
@Component
public class Presence {

    /** {@code anyone} falso = o último jogador saiu. */
    public record Changed(String gameId, boolean anyone) {
    }

    /** gameId → playerId → número de conexões abertas. */
    private final Map<String, Map<String, Integer>> games = new ConcurrentHashMap<>();
    private final ApplicationEventPublisher publisher;

    Presence(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void joined(String gameId, String playerId) {
        boolean wasEmpty = !anyone(gameId);
        games.computeIfAbsent(gameId, id -> new ConcurrentHashMap<>()).merge(playerId, 1, Integer::sum);
        if (wasEmpty) publisher.publishEvent(new Changed(gameId, true));
    }

    public void left(String gameId, String playerId) {
        boolean hadSomeone = anyone(gameId);
        games.computeIfPresent(gameId, (id, players) -> {
            players.computeIfPresent(playerId, (p, count) -> count > 1 ? count - 1 : null);
            return players.isEmpty() ? null : players;
        });
        if (hadSomeone && !anyone(gameId)) publisher.publishEvent(new Changed(gameId, false));
    }

    public Set<String> connected(String gameId) {
        return Set.copyOf(games.getOrDefault(gameId, Map.of()).keySet());
    }

    public boolean anyone(String gameId) {
        return !games.getOrDefault(gameId, Map.of()).isEmpty();
    }
}
