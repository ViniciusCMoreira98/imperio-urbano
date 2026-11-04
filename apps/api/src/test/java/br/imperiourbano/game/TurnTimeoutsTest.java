package br.imperiourbano.game;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameState;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Ações padrão por fase; na dívida (com prazo ou no modo automático), vende antes de falir. */
class TurnTimeoutsTest {

    private final Catalog catalog = CatalogLoader.load();
    private final GameEngine engine = new GameEngine(catalog);
    private final TurnTimeouts timeouts = new TurnTimeouts(Duration.ofSeconds(10), Duration.ofSeconds(15), Duration.ofSeconds(12),
            Duration.ofSeconds(2), catalog);

    /** Ana devendo ao banco, com os bens informados (eventos aplicados pelo motor). */
    private GameState anaInDebt(GameEvent... holdings) {
        List<GameEvent> log = new ArrayList<>();
        log.add(engine.start("g1", GameMode.CLASSIC, List.of(new StartingPlayer("ana", "Ana"), new StartingPlayer("bia", "Bia"))));
        log.addAll(List.of(holdings));
        log.add(new GameEvent.DebtIncurred("ana", null, 9_999));
        return engine.replay(log);
    }

    private GameCommand automaticCommand(GameState state) {
        return timeouts.forState(state, true).orElseThrow().defaultCommand();
    }

    @Test
    void rollUsesTheRollDeadlineAndAutomaticModeIsFaster() {
        GameState inDebt = anaInDebt();
        GameState rolling = engine.replay(List.of(engine.start("g1", GameMode.CLASSIC,
                List.of(new StartingPlayer("ana", "Ana"), new StartingPlayer("bia", "Bia")))));

        assertThat(timeouts.forState(rolling, false)).hasValue(new TurnTimeouts.Timeout(Duration.ofSeconds(10), new GameCommand.RollDice()));
        assertThat(timeouts.forState(rolling, true)).hasValue(new TurnTimeouts.Timeout(Duration.ofSeconds(2), new GameCommand.RollDice()));
        assertThat(timeouts.forState(inDebt, false)).as("conectado em dívida: prazo próprio e venda automática")
                .hasValue(new TurnTimeouts.Timeout(Duration.ofSeconds(12), new GameCommand.DeclareBankruptcy()));
    }

    @Test
    void debtSellsTheCheapestFirst() {
        // Acre (o banco paga 50) sai antes de uma casa de SP (125).
        GameState state = anaInDebt(
                new GameEvent.PropertyPurchased("ana", "AC", 100),
                new GameEvent.PropertyPurchased("ana", "SP", 500),
                new GameEvent.HouseBuilt("ana", "SP", 2, 500));

        assertThat(automaticCommand(state)).isEqualTo(new GameCommand.SellProperty("AC"));
    }

    @Test
    void debtSellsACheapBuildingBeforeAnExpensiveState() {
        // Casa do Acre (25) antes do Espírito Santo (200).
        GameState state = anaInDebt(
                new GameEvent.PropertyPurchased("ana", "ES", 400),
                new GameEvent.PropertyPurchased("ana", "AC", 100),
                new GameEvent.HouseBuilt("ana", "AC", 1, 50));

        assertThat(automaticCommand(state)).isEqualTo(new GameCommand.SellBuilding("AC"));
    }

    @Test
    void aStateWithBuildingsLosesTheBuildingsBeforeTheStateItself() {
        GameState state = anaInDebt(
                new GameEvent.PropertyPurchased("ana", "SP", 500),
                new GameEvent.HouseBuilt("ana", "SP", 2, 500));

        assertThat(automaticCommand(state)).isEqualTo(new GameCommand.SellBuilding("SP"));
    }

    @Test
    void automaticDebtSellsStatesWhenThereAreNoBuildings() {
        GameState state = anaInDebt(new GameEvent.PropertyPurchased("ana", "AC", 100));

        assertThat(automaticCommand(state)).isEqualTo(new GameCommand.SellProperty("AC"));
    }

    @Test
    void automaticDebtWithNothingToSellDeclaresBankruptcy() {
        assertThat(automaticCommand(anaInDebt())).isEqualTo(new GameCommand.DeclareBankruptcy());
    }
}
