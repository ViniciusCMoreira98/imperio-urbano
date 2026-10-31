package br.imperiourbano.catalog;

/** {@code stateId} só existe em casas PROPERTY; {@code name} só nas especiais. */
public record TileDefinition(int index, TileType type, String stateId, String name) {
}
