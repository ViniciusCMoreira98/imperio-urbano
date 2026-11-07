package br.imperiourbano.game;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEvent;
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
 * Olimpíadas) e, na dívida, vende do bem mais barato ao mais caro, e só declara falência sem nada a vender.
 * Conectado, quem deve tem {@code debt} para vender por conta própria; ao acabar, o servidor faz a mesma
 * venda, toda de uma vez, até quitar (GameService.timeout).
 */
public record TurnTimeouts(Duration roll, Duration decision, Duration debt, Duration automatic, Catalog catalog) {

    public record Timeout(Duration duration, GameCommand defaultCommand) {
    }

    public Optional<Timeout> forState(GameState state, boolean automaticMode) {
        if (state.status() != GameStatus.IN_PROGRESS || state.phase() == null) return Optional.empty();
        GameCommand command = defaultCommand(state);
        if (command == null) return Optional.empty();
        if (automaticMode) return Optional.of(new Timeout(automatic, command));
        Duration duration = switch (state.phase()) {
            // Escolher o destino da viagem é a ação da casa Aeroporto: mesmo prazo das outras decisões.
            case AWAITING_ROLL -> roll;
            case AWAITING_DEBT_RESOLUTION -> debt;
            default -> decision;
        };
        return Optional.of(new Timeout(duration, command));
    }

    /**
     * Tempo que a mesa leva para mostrar estes eventos (dados e personagens). Soma-se ao prazo, que assim
     * só corre quando a jogada termina na tela (pedido do usuário, 06/11/2026).
     */
    public Duration presentation(List<GameEvent> events) {
        return TablePresentation.of(events, catalog.board().tileCount());
    }

    private GameCommand defaultCommand(GameState state) {
        return switch (state.phase()) {
            // Rolar os dados também recusa a viagem.
            case AWAITING_ROLL, AWAITING_TRAVEL_DESTINATION -> new GameCommand.RollDice();
            case AWAITING_PURCHASE -> new GameCommand.DeclinePurchase();
            case AWAITING_BUILD -> new GameCommand.SkipBuild();
            case AWAITING_OLYMPICS_HOST -> new GameCommand.SkipOlympics();
            // Sem escolha a tempo, a carta fica sem efeito.
            case AWAITING_EVENT_TARGET -> new GameCommand.SkipEventTarget();
            case AWAITING_DEBT_RESOLUTION -> debtStep(state);
            case AWAITING_END_TURN -> null;
        };
    }

    /**
     * Um passo para pagar a dívida (pedido do usuário): vende o bem mais barato primeiro. Em cada estado
     * o candidato é a última construção (casa ou hotel) ou, sem construções, o próprio estado; vale o que
     * o banco paga (50%, D10). Empate: construção antes do estado, depois a ordem do catálogo.
     */
    GameCommand debtStep(GameState state) {
        return state.propertiesOf(state.currentPlayer().id()).stream()
                .min(Comparator.comparingInt(this::saleRefund)
                        .thenComparing(p -> p.buildingLevel() == 0)
                        .thenComparing(PropertyState::stateId))
                .<GameCommand>map(p -> p.buildingLevel() > 0
                        ? new GameCommand.SellBuilding(p.stateId())
                        : new GameCommand.SellProperty(p.stateId()))
                .orElseGet(GameCommand.DeclareBankruptcy::new);
    }

    /** Quanto o banco paga pelo próximo bem a vender deste estado (mesmo cálculo do motor). */
    private int saleRefund(PropertyState property) {
        StateDefinition definition = catalog.state(property.stateId());
        if (property.buildingLevel() == 0) return definition.price() / 2;
        int cost = property.buildingLevel() == PropertyState.HOTEL_LEVEL ? definition.hotelCost() : definition.houseCost();
        return cost / 2;
    }
}
