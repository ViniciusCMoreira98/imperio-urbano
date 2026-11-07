package br.imperiourbano.engine;

/**
 * Estado de um estado comprado. Estados sem entrada no mapa pertencem ao banco.
 * {@code buildingLevel}: 0–4 casas, 5 = hotel. Visitas contam só quando o dono para na casa (D4);
 * {@code levelReachedAtVisit} limita a evolução a uma etapa por visita.
 * {@code blackoutVisitsLeft} > 0: apagão (carta de evento), sem aluguel até o dono parar aqui essa quantidade de vezes.
 */
public record PropertyState(String stateId, String ownerId, int buildingLevel, int ownerVisits, int levelReachedAtVisit,
        int blackoutVisitsLeft) {

    public static final int HOTEL_LEVEL = 5;

    public PropertyState(String stateId, String ownerId, int buildingLevel, int ownerVisits, int levelReachedAtVisit) {
        this(stateId, ownerId, buildingLevel, ownerVisits, levelReachedAtVisit, 0);
    }

    static PropertyState purchased(String stateId, String ownerId) {
        return new PropertyState(stateId, ownerId, 0, 1, 1);
    }

    /** Visita do dono; durante o apagão, cada uma aproxima a volta da energia. */
    PropertyState withOwnerVisit() {
        return new PropertyState(stateId, ownerId, buildingLevel, ownerVisits + 1, levelReachedAtVisit,
                Math.max(0, blackoutVisitsLeft - 1));
    }

    PropertyState withLevel(int level) {
        return new PropertyState(stateId, ownerId, level, ownerVisits, ownerVisits, blackoutVisitsLeft);
    }

    /** Desce um nível (venda de construção) sem alterar a contagem de visitas. */
    PropertyState downgraded() {
        return new PropertyState(stateId, ownerId, buildingLevel - 1, ownerVisits, levelReachedAtVisit, blackoutVisitsLeft);
    }

    /** Novo dono começa a contar visitas do zero, mantendo as construções; o apagão acaba com a troca de dono. */
    PropertyState transferredTo(String newOwnerId) {
        return new PropertyState(stateId, newOwnerId, buildingLevel, 0, 0, 0);
    }

    /** Apagão (re)começa com a contagem cheia, mesmo se já houver um em andamento. */
    PropertyState withBlackout(int visits) {
        return new PropertyState(stateId, ownerId, buildingLevel, ownerVisits, levelReachedAtVisit, visits);
    }

    public boolean blackout() {
        return blackoutVisitsLeft > 0;
    }

    /** Verdadeiro se o nível atual foi alcançado numa visita anterior à atual. */
    boolean reachedInEarlierVisit() {
        return levelReachedAtVisit < ownerVisits;
    }
}
