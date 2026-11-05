package br.imperiourbano.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CatalogLoaderTest {

    private final Catalog catalog = CatalogLoader.load();

    @Test
    void loadsConsistentCatalogFromGameData() {
        assertThat(CatalogValidator.validate(catalog)).isEmpty();
        assertThat(catalog.states()).hasSize(26);
        assertThat(catalog.board().tileCount()).isEqualTo(34);
        assertThat(catalog.rules().startingCredits()).isEqualTo(1500);
    }

    @Test
    void findsStatesAndTilesByKey() {
        StateDefinition sp = catalog.state("SP");
        assertThat(sp.name()).isEqualTo("São Paulo");
        assertThat(sp.region()).isEqualTo(Region.SUDESTE);
        assertThat(catalog.tile(0).type()).isEqualTo(TileType.START);
        assertThat(catalog.tile(34)).isEqualTo(catalog.tile(0));
    }

    @Test
    void readsQuickModeRoundLimitAndOpenEndedClassic() {
        assertThat(catalog.rules().modes().get(GameMode.QUICK).roundLimit()).isEqualTo(15);
        assertThat(catalog.rules().modes().get(GameMode.CLASSIC).roundLimit()).isNull();
    }

    @Test
    void rentForEachBuildingLevel() {
        RentTable rent = catalog.state("AC").rent();
        assertThat(rent.forLevel(0)).isEqualTo(rent.base());
        assertThat(rent.forLevel(5)).isEqualTo(rent.hotel());
    }

    @Test
    void olympicsMultiplierStopsAtMaximum() {
        RulesConfig.OlympicsRules olympics = catalog.rules().olympics();
        assertThat(olympics.multiplierForEdition(1)).isEqualTo(2);
        assertThat(olympics.multiplierForEdition(9)).isEqualTo(10);
        assertThat(olympics.multiplierForEdition(15)).isEqualTo(10);
    }
}
