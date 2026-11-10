package br.imperiourbano.game;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.engine.PropertyState;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

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

    /** Uma política de bot por catálogo (o motor é imutável, então pode ser compartilhado). */
    private static final Map<Catalog, BotPolicy> BOTS = new ConcurrentHashMap<>();

    public Optional<Timeout> forState(GameState state, boolean automaticMode) {
        if (state.status() != GameStatus.IN_PROGRESS || state.phase() == null) return Optional.empty();
        // Bot da vez (10/11/2026): joga a própria política, depois de "pensar" um instante.
        if (Bots.isBot(state.currentPlayer().id())) {
            GameCommand move = BOTS.computeIfAbsent(catalog, BotPolicy::new).command(state, this);
            return move == null ? Optional.empty() : Optional.of(new Timeout(Bots.THINK, move));
        }
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
     * Sem decisão a tempo (pedido do usuário): vende estados inteiros, do que rende menos ao que rende mais,
     * até a soma com o saldo pagar a dívida. Nem vendendo tudo: falência.
     */
    GameCommand debtStep(GameState state) {
        String playerId = state.currentPlayer().id();
        int missing = state.pendingDebt().amount() - state.player(playerId).credits();
        List<PropertyState> cheapestFirst = state.propertiesOf(playerId).stream()
                .sorted(Comparator.comparingInt((PropertyState p) -> GameEngine.saleRefund(catalog, p)).thenComparing(PropertyState::stateId))
                .toList();
        List<String> chosen = new ArrayList<>();
        int total = 0;
        for (PropertyState property : cheapestFirst) {
            if (total >= missing) break;
            chosen.add(property.stateId());
            total += GameEngine.saleRefund(catalog, property);
        }
        return total >= missing && !chosen.isEmpty() ? new GameCommand.SellStates(chosen) : new GameCommand.DeclareBankruptcy();
    }
}
