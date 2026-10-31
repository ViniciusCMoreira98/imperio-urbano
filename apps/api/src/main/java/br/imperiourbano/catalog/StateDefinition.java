package br.imperiourbano.catalog;

public record StateDefinition(
        String id,
        String abbreviation,
        String name,
        Region region,
        String colorGroup,
        int price,
        RentTable rent,
        int houseCost,
        int hotelCost) {
}
