package br.imperiourbano.engine;

/**
 * Estado de um estado comprado. Estados sem entrada no mapa pertencem ao banco.
 * {@code buildingLevel}: 0–4 casas, 5 = hotel. Visitas contam só quando o dono para na casa (D4);
 * {@code levelReachedAtVisit} limita a evolução a uma etapa por visita.
 */
public record PropertyState(String stateId, String ownerId, int buildingLevel, int ownerVisits, int levelReachedAtVisit) {

    public static final int HOTEL_LEVEL = 5;

    static PropertyState purchased(String stateId, String ownerId) {
        return new PropertyState(stateId, ownerId, 0, 1, 1);
    }

    PropertyState withOwnerVisit() {
        return new PropertyState(stateId, ownerId, buildingLevel, ownerVisits + 1, levelReachedAtVisit);
    }

    PropertyState withLevel(int level) {
        return new PropertyState(stateId, ownerId, level, ownerVisits, ownerVisits);
    }

    /** Desce um nível (venda de construção) sem alterar a contagem de visitas. */
    PropertyState downgraded() {
        return new PropertyState(stateId, ownerId, buildingLevel - 1, ownerVisits, levelReachedAtVisit);
    }

    /** Novo dono começa a contar visitas do zero, mantendo as construções. */
    PropertyState transferredTo(String newOwnerId) {
        return new PropertyState(stateId, newOwnerId, buildingLevel, 0, 0);
    }

    /** Verdadeiro se o nível atual foi alcançado numa visita anterior à atual. */
    boolean reachedInEarlierVisit() {
        return levelReachedAtVisit < ownerVisits;
    }
}
