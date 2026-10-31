package br.imperiourbano.catalog;

public record RentTable(int base, int house1, int house2, int house3, int house4, int hotel) {

    /** Aluguel para o nível de construção: 0–4 casas, 5 = hotel. */
    public int forLevel(int buildingLevel) {
        return switch (buildingLevel) {
            case 0 -> base;
            case 1 -> house1;
            case 2 -> house2;
            case 3 -> house3;
            case 4 -> house4;
            case 5 -> hotel;
            default -> throw new IllegalArgumentException("Nível de construção inválido: " + buildingLevel);
        };
    }

    int[] ladder() {
        return new int[] {base, house1, house2, house3, house4, hotel};
    }
}
