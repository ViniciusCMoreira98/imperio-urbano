package br.imperiourbano.engine;

import java.util.List;

/**
 * Baralho de eventos embaralhado no início da partida. Ao acabar, recomeça na mesma ordem.
 * Informação oculta: não deve ir para o snapshot enviado aos clientes.
 */
public record EventDeck(List<String> order, int next) {

    public EventDeck {
        order = List.copyOf(order);
    }

    String peek() {
        return order.get(next % order.size());
    }

    EventDeck advanced() {
        return new EventDeck(order, (next + 1) % order.size());
    }
}
