package br.imperiourbano.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.DiceRoll;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameState;
import java.util.List;
import java.util.Random;
import org.junit.jupiter.api.Test;

class GameJsonTest {

    private static final Catalog CATALOG = CatalogLoader.load();

    /** Um exemplo de cada tipo de evento do motor. */
    private static final List<GameEvent> ONE_OF_EACH = List.of(
            new GameEvent.GameStarted("g1", GameMode.QUICK, List.of(new StartingPlayer("ana", "Ana")), 1500, List.of("carona")),
            new GameEvent.DiceRolled("ana", new DiceRoll(3, 3)),
            new GameEvent.PlayerMoved("ana", 30, 2, 200, false),
            new GameEvent.RestTurnLost("ana"),
            new GameEvent.RestLeft("ana"),
            new GameEvent.TravelChosen("ana", 35, 50),
            new GameEvent.TravelDeclined("ana"),
            new GameEvent.PropertyPurchased("ana", "SP", 500),
            new GameEvent.PurchaseDeclined("ana", "SP"),
            new GameEvent.HouseBuilt("ana", "SP", 3, 750),
            new GameEvent.HotelBuilt("ana", "SP", 500),
            new GameEvent.BuildSkipped("ana", "SP"),
            new GameEvent.OlympicsHostSelected("ana", "SP", 2, 3, 50),
            new GameEvent.OlympicsSkipped("ana"),
            new GameEvent.EventCardDrawn("ana", "carona"),
            new GameEvent.CreditsFromBank("ana", 100),
            new GameEvent.CreditsToBank("ana", 75),
            new GameEvent.CreditsTransferred("bia", "ana", 50),
            new GameEvent.RentPaid("bia", "ana", "SP", 50),
            new GameEvent.DebtIncurred("bia", null, 80),
            new GameEvent.BuildingSold("bia", "AC", 25),
            new GameEvent.PropertySold("bia", "AC", 60),
            new GameEvent.DebtSettled("bia", null, 80),
            new GameEvent.PlayerBankrupt("bia", "ana"),
            new GameEvent.GameAbandoned(),
            new GameEvent.GameFinished(List.of("ana")),
            new GameEvent.TurnEnded("ana", "bia", 2));

    @Test
    void everyEventTypeRoundTripsWithItsProtocolName() {
        assertThat(ONE_OF_EACH).hasSize(GameEvent.class.getPermittedSubclasses().length);

        for (GameEvent event : ONE_OF_EACH) {
            String json = GameJson.write(event);
            assertThat(json).contains("\"type\":\"" + GameJson.typeName(event.getClass()) + "\"");
            assertThat(GameJson.readEvent(json)).isEqualTo(event);
        }
        assertThat(GameJson.typeName(GameEvent.OlympicsHostSelected.class)).isEqualTo("OLYMPICS_HOST_SELECTED");
    }

    @Test
    void stateRoundTripsAfterPlay() {
        GameEngine engine = new GameEngine(CATALOG, new Random(7));
        GameState state = engine.apply(null, engine.start("g1", GameMode.CLASSIC, List.of(
                new StartingPlayer("ana", "Ana"), new StartingPlayer("bia", "Bia"))));
        state = engine.execute(state, "ana", new GameCommand.RollDice(), () -> new DiceRoll(4, 6)).state();
        state = engine.execute(state, "ana", new GameCommand.BuyProperty(2), () -> null).state();

        assertThat(GameJson.readState(GameJson.write(state))).isEqualTo(state);
    }
}
