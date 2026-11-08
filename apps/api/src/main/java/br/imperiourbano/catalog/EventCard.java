package br.imperiourbano.catalog;

/**
 * Carta de evento. {@code copies}: quantas vezes entra no baralho embaralhado (sem valor no catálogo = 1);
 * menos cópias deixam a carta mais rara (Aluguel Zero, decisão do usuário, 07/11/2026).
 */
public record EventCard(String id, String title, String text, CardEffect effect, int copies) {

    public EventCard {
        if (copies <= 0) copies = 1;
    }

    public EventCard(String id, String title, String text, CardEffect effect) {
        this(id, title, text, effect, 1);
    }
}
