package br.imperiourbano.catalog;

import java.util.List;

public record BoardDefinition(int version, int tilesPerSide, List<ColorGroup> colorGroups, List<TileDefinition> tiles) {

    public BoardDefinition {
        colorGroups = List.copyOf(colorGroups);
        tiles = List.copyOf(tiles);
    }

    public int tileCount() {
        return tiles.size();
    }
}
