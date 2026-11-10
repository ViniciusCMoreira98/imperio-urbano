package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.game.BotPolicy;
import br.imperiourbano.game.Bots;
import br.imperiourbano.game.TurnTimeouts;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;

/** O bot sempre compra e constrói até o maior nível permitido que o saldo pague (pedido do usuário, 10/11/2026). */
class BotPolicyTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final StateDefinition SP = CATALOG.state("SP");

    private final GameEngine engine = new GameEngine(CATALOG);
    private final TurnTimeouts timeouts = new TurnTimeouts(Duration.ofSeconds(7), Duration.ofSeconds(10), Duration.ofSeconds(10),
            Duration.ofSeconds(2), CATALOG);
    private final BotPolicy policy = new BotPolicy(CATALOG);
    private GameState state = engine.apply(null, engine.start("g1", GameMode.CLASSIC,
            List.of(new StartingPlayer("bot-1", "Bot Sabiá"), new StartingPlayer("ana", "Ana"))));

    /** Bot parado em SP, com o saldo e a fase informados. */
    private void botOnSp(int credits, TurnPhase phase) {
        state = state.updatePlayer("bot-1", p -> p.withPosition(CATALOG.tileIndex("SP")).withCredits(credits)).withPhase(phase);
    }

    @Test
    void theBotIsTheOneToPlay() {
        assertThat(state.currentPlayer().id()).isEqualTo("bot-1");
        assertThat(Bots.isBot("bot-1")).isTrue();
        assertThat(Bots.isBot("ana")).isFalse();
    }

    @Test
    void buysWithTheMostHousesTheFirstVisitAllows() {
        botOnSp(99_999, TurnPhase.AWAITING_PURCHASE);
        GameCommand buy = policy.command(state, timeouts);
        assertThat(buy).isEqualTo(new GameCommand.BuyProperty(CATALOG.rules().construction().firstVisitMaxHouses()));

        GameState after = engine.execute(state, "bot-1", buy, FixedDice.of(1, 2)).state();
        assertThat(after.property("SP").orElseThrow().buildingLevel()).isEqualTo(CATALOG.rules().construction().firstVisitMaxHouses());
        assertThat(after.property("SP").orElseThrow().ownerId()).isEqualTo("bot-1");
    }

    @Test
    void withLittleMoneyBuysTheHighestLevelItCanPay() {
        botOnSp(SP.price() + SP.houseCost(), TurnPhase.AWAITING_PURCHASE);
        assertThat(policy.command(state, timeouts)).isEqualTo(new GameCommand.BuyProperty(1));

        botOnSp(SP.price(), TurnPhase.AWAITING_PURCHASE);
        assertThat(policy.command(state, timeouts)).isEqualTo(new GameCommand.BuyProperty(0));
    }

    @Test
    void buildsTheHotelWhenAllowedAndOtherwiseTheMostHouses() {
        state = state.withProperty(new PropertyState("SP", "bot-1", 4, 3, 2));
        botOnSp(99_999, TurnPhase.AWAITING_BUILD);
        assertThat(policy.command(state, timeouts)).isEqualTo(new GameCommand.BuildHotel());

        state = state.withProperty(new PropertyState("SP", "bot-1", 1, 2, 1));
        botOnSp(99_999, TurnPhase.AWAITING_BUILD);
        assertThat(policy.command(state, timeouts)).isEqualTo(new GameCommand.Build(2));
    }

    @Test
    void hostsTheOlympicsOnItsBestState() {
        state = state.withProperty(PropertyState.purchased("AC", "bot-1")).withProperty(new PropertyState("SP", "bot-1", 3, 2, 2));
        botOnSp(99_999, TurnPhase.AWAITING_OLYMPICS_HOST);
        assertThat(policy.command(state, timeouts)).isEqualTo(new GameCommand.HostOlympics("SP"));
    }

    @Test
    void theTurnTimerPlaysTheBotAfterAShortThink() {
        botOnSp(99_999, TurnPhase.AWAITING_PURCHASE);
        assertThat(timeouts.forState(state, true)).hasValue(new TurnTimeouts.Timeout(Bots.THINK,
                new GameCommand.BuyProperty(CATALOG.rules().construction().firstVisitMaxHouses())));
    }
}
