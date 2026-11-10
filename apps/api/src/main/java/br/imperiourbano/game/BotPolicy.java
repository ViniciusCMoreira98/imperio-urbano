package br.imperiourbano.game;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CardEffect;
import br.imperiourbano.catalog.CardEffectType;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.PlayerState;
import br.imperiourbano.engine.PropertyState;
import java.util.Comparator;
import java.util.List;

/**
 * O que o bot faz em cada fase (pedido do usuário, 10/11/2026): rola os dados e, ao parar num estado,
 * compra e constrói sempre até o maior nível permitido naquela visita que o saldo pague. Sedia as
 * Olimpíadas no próprio estado de maior aluguel; nas cartas, mira o estado mais valioso; na dívida,
 * vende como o modo automático. Não escolhe destino de viagem (rola os dados).
 */
public final class BotPolicy {

    private final Catalog catalog;
    private final GameEngine engine;

    public BotPolicy(Catalog catalog) {
        this.catalog = catalog;
        this.engine = new GameEngine(catalog);
    }

    /** Comando do bot da vez; null quando não há o que decidir (a vez passa sozinha). */
    public GameCommand command(GameState state, TurnTimeouts timeouts) {
        PlayerState bot = state.currentPlayer();
        return switch (state.phase()) {
            case AWAITING_ROLL, AWAITING_TRAVEL_DESTINATION -> new GameCommand.RollDice();
            case AWAITING_PURCHASE -> purchase(bot);
            case AWAITING_BUILD -> build(state, bot);
            case AWAITING_OLYMPICS_HOST -> host(state, bot);
            case AWAITING_EVENT_TARGET -> eventTarget(state, bot);
            case AWAITING_DEBT_RESOLUTION -> timeouts.debtStep(state);
            case AWAITING_END_TURN -> null;
        };
    }

    /** Compra com o máximo de casas da primeira etapa que o saldo pague. */
    private GameCommand purchase(PlayerState bot) {
        StateDefinition definition = catalog.state(catalog.tile(bot.position()).stateId());
        for (int houses = catalog.rules().construction().firstVisitMaxHouses(); houses >= 0; houses--) {
            if (bot.credits() >= definition.price() + houses * definition.houseCost()) {
                return new GameCommand.BuyProperty(houses);
            }
        }
        return new GameCommand.DeclinePurchase();
    }

    /** Hotel quando liberado; senão, o máximo de casas permitido que o saldo pague. */
    private GameCommand build(GameState state, PlayerState bot) {
        StateDefinition definition = catalog.state(catalog.tile(bot.position()).stateId());
        PropertyState property = state.property(definition.id()).orElse(null);
        if (property == null) return new GameCommand.SkipBuild();
        GameEngine.BuildOptions options = engine.buildOptions(property);
        if (options.hotel() && bot.credits() >= definition.hotelCost()) return new GameCommand.BuildHotel();
        for (int houses = options.houses(); houses >= 1; houses--) {
            if (bot.credits() >= houses * definition.houseCost()) return new GameCommand.Build(houses);
        }
        return new GameCommand.SkipBuild();
    }

    private GameCommand host(GameState state, PlayerState bot) {
        return state.propertiesOf(bot.id()).stream()
                .max(Comparator.comparingInt((PropertyState p) -> engine.rentFor(state, p.stateId())).thenComparing(PropertyState::stateId))
                .<GameCommand>map(p -> new GameCommand.HostOlympics(p.stateId()))
                .orElse(new GameCommand.SkipOlympics());
    }

    /** Incêndio e Apagão no estado adversário mais valioso; Escolha da sede no próprio de maior aluguel. */
    private GameCommand eventTarget(GameState state, PlayerState bot) {
        CardEffect effect = catalog.eventCard(state.eventDeck().pendingCardId()).effect();
        List<String> targets = engine.eventTargets(state, bot.id(), effect);
        Comparator<String> value = effect.type() == CardEffectType.CHOOSE_OLYMPICS_HOST
                ? Comparator.comparingInt(id -> engine.rentFor(state, id))
                : Comparator.comparingInt(id -> GameEngine.saleRefund(catalog, state.property(id).orElseThrow()));
        return targets.stream().max(value.thenComparing(Comparator.naturalOrder()))
                .<GameCommand>map(GameCommand.ChooseEventTarget::new)
                .orElse(new GameCommand.SkipEventTarget());
    }
}
