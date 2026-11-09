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

    /** Dívida que o saldo não cobre por {@code missing}. */
    private GameState anaShortBy(int missing, GameEvent... holdings) {
        List<GameEvent> log = new ArrayList<>();
        log.add(engine.start("g1", GameMode.CLASSIC, List.of(new StartingPlayer("ana", "Ana"), new StartingPlayer("bia", "Bia"))));
        log.addAll(List.of(holdings));
        // As compras já descontaram o preço: a dívida passa o saldo atual em {@code missing}.
        int credits = engine.replay(log).player("ana").credits();
        log.add(new GameEvent.DebtIncurred("ana", null, credits + missing));
        return engine.replay(log);
    }

    @Test
    void debtSellsWholeStatesFromTheCheapestUntilItIsCovered() {
        // RO (80% de 120 = 96) sozinho não cobre 150; com AC (80% de 140 = 112) cobre. MA fica.
        GameState state = anaShortBy(150,
                new GameEvent.PropertyPurchased("ana", "AC", 140),
                new GameEvent.PropertyPurchased("ana", "RO", 120),
                new GameEvent.PropertyPurchased("ana", "MA", 350));

        assertThat(automaticCommand(state)).isEqualTo(new GameCommand.SellStates(List.of("RO", "AC")));
    }

    @Test
    void buildingsCountInTheStateValueAndAreSoldWithIt() {
        // SP com 2 casas vale (240 + 300) × 80% = 432, mais que o MA vazio (280): o MA sai primeiro.
        GameState state = anaShortBy(100,
                new GameEvent.PropertyPurchased("ana", "SP", 240),
                new GameEvent.HouseBuilt("ana", "SP", 2, 300),
                new GameEvent.PropertyPurchased("ana", "MA", 350));

        assertThat(automaticCommand(state)).isEqualTo(new GameCommand.SellStates(List.of("MA")));
    }

    @Test
    void automaticDebtThatEvenEverythingCannotCoverDeclaresBankruptcy() {
        GameState state = anaShortBy(10_000, new GameEvent.PropertyPurchased("ana", "AC", 140));

        assertThat(automaticCommand(state)).isEqualTo(new GameCommand.DeclareBankruptcy());
    }

    @Test
    void automaticDebtWithNothingToSellDeclaresBankruptcy() {
        assertThat(automaticCommand(anaInDebt())).isEqualTo(new GameCommand.DeclareBankruptcy());
    }
}
