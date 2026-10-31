package br.imperiourbano.game;

import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.engine.PropertyState;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Prazos do turno e a ação que o servidor executa quando acabam.
 *
 * <p>Modo automático (jogador da vez desconectado): o servidor joga por ele após {@code automatic}, sem
 * esperar o prazo inteiro, até ele voltar. Usa as mesmas ações padrão (rola, recusa compra/construção/
 * Olimpíadas) e, na dívida, vende uma construção, depois um estado, e só declara falência sem nada a vender.
 * Para quem está conectado, a dívida não tem prazo (falência automática seria punitiva demais).
 */
public record TurnTimeouts(Duration roll, Duration decision, Duration automatic) {

    public record Timeout(Duration duration, GameCommand defaultCommand) {
    }

    public Optional<Timeout> forState(GameState state, boolean automaticMode) {
        if (state.status() != GameStatus.IN_PROGRESS || state.phase() == null) return Optional.empty();
        GameCommand command = defaultCommand(state, automaticMode);
        if (command == null) return Optional.empty();
        if (automaticMode) return Optional.of(new Timeout(automatic, command));
        Duration duration = switch (state.phase()) {
            case AWAITING_ROLL, AWAITING_TRAVEL_DESTINATION -> roll;
            default -> decision;
        };
        return Optional.of(new Timeout(duration, command));
    }

    private static GameCommand defaultCommand(GameState state, boolean automaticMode) {
        return switch (state.phase()) {
            // Rolar os dados também recusa a viagem.
            case AWAITING_ROLL, AWAITING_TRAVEL_DESTINATION -> new GameCommand.RollDice();
            case AWAITING_PURCHASE -> new GameCommand.DeclinePurchase();
            case AWAITING_BUILD -> new GameCommand.SkipBuild();
            case AWAITING_OLYMPICS_HOST -> new GameCommand.SkipOlympics();
            case AWAITING_DEBT_RESOLUTION -> automaticMode ? debtStep(state) : null;
            case AWAITING_END_TURN -> null;
        };
    }

    /** Um passo para pagar a dívida: a construção mais cara primeiro, depois o estado mais caro. */
    private static GameCommand debtStep(GameState state) {
        List<PropertyState> owned = state.propertiesOf(state.currentPlayer().id());
        Comparator<PropertyState> byLevel = Comparator.comparingInt(PropertyState::buildingLevel);
        return owned.stream()
                .filter(p -> p.buildingLevel() > 0)
                .max(byLevel)
                .<GameCommand>map(p -> new GameCommand.SellBuilding(p.stateId()))
                .or(() -> owned.stream().findFirst().map(p -> new GameCommand.SellProperty(p.stateId())))
                .orElseGet(GameCommand.DeclareBankruptcy::new);
    }
}
