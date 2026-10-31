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

    /** Verdadeiro se o nível atual foi alcançado numa visita anterior à atual. */
    boolean reachedInEarlierVisit() {
        return levelReachedAtVisit < ownerVisits;
    }
}
