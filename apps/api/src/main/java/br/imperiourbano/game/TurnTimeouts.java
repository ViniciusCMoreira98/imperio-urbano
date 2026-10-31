package br.imperiourbano.game;

import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import java.time.Duration;
import java.util.Optional;

/**
 * Prazos do turno e a ação que o servidor executa quando acabam. Dívida não tem prazo:
 * falência automática seria punitiva demais (decisão pendente).
 */
public record TurnTimeouts(Duration roll, Duration decision) {

    public record Timeout(Duration duration, GameCommand defaultCommand) {
    }

    public Optional<Timeout> forState(GameState state) {
        if (state.status() != GameStatus.IN_PROGRESS || state.phase() == null) return Optional.empty();
        return Optional.ofNullable(switch (state.phase()) {
            case AWAITING_ROLL -> new Timeout(roll, new GameCommand.RollDice());
            // Rolar os dados recusa a viagem.
            case AWAITING_TRAVEL_DESTINATION -> new Timeout(roll, new GameCommand.RollDice());
            case AWAITING_PURCHASE -> new Timeout(decision, new GameCommand.DeclinePurchase());
            case AWAITING_BUILD -> new Timeout(decision, new GameCommand.SkipBuild());
            case AWAITING_OLYMPICS_HOST -> new Timeout(decision, new GameCommand.SkipOlympics());
            case AWAITING_END_TURN, AWAITING_DEBT_RESOLUTION -> null;
        });
    }
}
