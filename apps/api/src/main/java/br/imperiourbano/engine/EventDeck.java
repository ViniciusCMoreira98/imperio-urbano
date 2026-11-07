package br.imperiourbano.engine;

import java.util.List;

/**
 * Baralho de eventos embaralhado no início da partida. Ao acabar, recomeça na mesma ordem.
 * A ordem é informação oculta: não deve ir para o snapshot enviado aos clientes.
 * {@code pendingCardId}: carta já revelada que espera o jogador escolher um estado (essa vai no snapshot).
 */
public record EventDeck(List<String> order, int next, String pendingCardId) {

    public EventDeck {
        order = List.copyOf(order);
    }

    public EventDeck(List<String> order, int next) {
        this(order, next, null);
    }

    String peek() {
        return order.get(next % order.size());
    }

    EventDeck advanced() {
        return new EventDeck(order, (next + 1) % order.size(), pendingCardId);
    }

    EventDeck withPending(String cardId) {
        return new EventDeck(order, next, cardId);
    }
}
