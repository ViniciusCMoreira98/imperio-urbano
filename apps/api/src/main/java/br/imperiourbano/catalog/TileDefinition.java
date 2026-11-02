package br.imperiourbano.catalog;

/**
 * {@code id} é estável: a sigla nos estados e o ID visual nas especiais (START, TAX, AIRPORT…).
 * {@code stateId} só existe em casas PROPERTY; {@code name} só nas especiais.
 */
public record TileDefinition(int index, String id, TileType type, String stateId, String name) {
}
