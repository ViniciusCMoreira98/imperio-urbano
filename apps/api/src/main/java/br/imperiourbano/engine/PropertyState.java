package br.imperiourbano.engine;

/**
 * Estado de um estado comprado. Estados sem entrada no mapa pertencem ao banco.
 * {@code buildingLevel}: 0–4 casas, 5 = hotel. Visitas contam só quando o dono para na casa (D4).
 */
public record PropertyState(String stateId, String ownerId, int buildingLevel, int ownerVisits, int levelReachedAtVisit) {

    static PropertyState purchased(String stateId, String ownerId) {
        return new PropertyState(stateId, ownerId, 0, 1, 1);
    }
}
