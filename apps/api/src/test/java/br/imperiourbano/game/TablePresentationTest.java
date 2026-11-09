package br.imperiourbano.game;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.engine.DiceRoll;
import br.imperiourbano.engine.GameEvent;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;

/** O prazo espera a mesa: dados rolando e personagens andando casa a casa ou num salto. */
class TablePresentationTest {

    private static final int TILES = 34;

    @Test
    void rollAndWalkAddUpWithAMargin() {
        // 6 + 2: dados (0,9 s) + 8 saltos de 0,44 s + folga de 0,5 s.
        var events = List.<GameEvent>of(new GameEvent.DiceRolled("ana", new DiceRoll(6, 2)),
                new GameEvent.PlayerMoved("ana", 0, 8, 0, false));
        assertThat(TablePresentation.of(events, TILES)).isEqualTo(Duration.ofMillis(900 + 8 * 440 + 500));
    }

    @Test
    void travelWalksFastTileByTileAndRestIsASingleLeap() {
        var travel = List.<GameEvent>of(new GameEvent.TravelChosen("ana", 20, 50), new GameEvent.PlayerMoved("ana", 26, 20, 200, false));
        // 26 -> 20 passando pelo Início: 28 casas da viagem acelerada.
        assertThat(TablePresentation.of(travel, TILES)).isEqualTo(Duration.ofMillis(28 * 180 + 500));
        var rest = List.<GameEvent>of(new GameEvent.PlayerMoved("ana", 5, 17, 0, true));
        assertThat(TablePresentation.of(rest, TILES)).isEqualTo(Duration.ofMillis(1_000 + 500));
    }

    @Test
    void theOpponentsTurnInTheSameBatchAlsoCounts() {
        // Jogada automática do adversário e passagem da vez no mesmo lote: o prazo de quem joga agora espera.
        var events = List.<GameEvent>of(new GameEvent.DiceRolled("bia", new DiceRoll(3, 1)),
                new GameEvent.PlayerMoved("bia", 32, 2, 200, false),
                new GameEvent.TurnEnded("bia", "ana", 3));
        assertThat(TablePresentation.of(events, TILES)).isEqualTo(Duration.ofMillis(900 + 4 * 440 + 500));
    }

    @Test
    void nothingToShowAddsNothingAndLongBatchesAreCapped() {
        assertThat(TablePresentation.of(List.of(new GameEvent.TurnEnded("ana", "bia", 1)), TILES)).isZero();
        var many = new java.util.ArrayList<GameEvent>();
        for (int i = 0; i < 10; i++) {
            many.add(new GameEvent.DiceRolled("ana", new DiceRoll(6, 6)));
            many.add(new GameEvent.PlayerMoved("ana", 0, 12, 0, false));
        }
        assertThat(TablePresentation.of(many, TILES)).isEqualTo(TablePresentation.MAX);
    }
}
