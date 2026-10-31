package br.imperiourbano.engine;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.RulesConfig;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.catalog.TileDefinition;
import br.imperiourbano.catalog.TileType;
import br.imperiourbano.engine.GameCommand.Build;
import br.imperiourbano.engine.GameCommand.BuildHotel;
import br.imperiourbano.engine.GameCommand.BuyProperty;
import br.imperiourbano.engine.GameCommand.DeclinePurchase;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.HostOlympics;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.SkipBuild;
import br.imperiourbano.engine.GameCommand.SkipOlympics;
import br.imperiourbano.engine.GameEvent.BuildSkipped;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.DiceRolled;
import br.imperiourbano.engine.GameEvent.GameStarted;
import br.imperiourbano.engine.GameEvent.HotelBuilt;
import br.imperiourbano.engine.GameEvent.HouseBuilt;
import br.imperiourbano.engine.GameEvent.OlympicsHostSelected;
import br.imperiourbano.engine.GameEvent.OlympicsSkipped;
import br.imperiourbano.engine.GameEvent.PlayerMoved;
import br.imperiourbano.engine.GameEvent.PropertyPurchased;
import br.imperiourbano.engine.GameEvent.PurchaseDeclined;
import br.imperiourbano.engine.GameEvent.RentPaid;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TurnEnded;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Motor de regras puro (sem Spring, sem I/O). {@link #decide} valida um comando e produz eventos;
 * {@link #apply} aplica um evento ao estado. Humanos e futuros bots usam o mesmo caminho.
 */
public final class GameEngine {

    private final Catalog catalog;
    private final RulesConfig rules;
    private final int tileCount;
    private final int restTile;

    public GameEngine(Catalog catalog) {
        this.catalog = catalog;
        this.rules = catalog.rules();
        this.tileCount = catalog.board().tileCount();
        this.restTile = catalog.board().tiles().stream()
                .filter(t -> t.type() == TileType.REST)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Tabuleiro sem casa de Descanso"))
                .index();
    }

    public record Result(GameState state, List<GameEvent> events) {
    }

    /** Acumula eventos aplicando cada um, para que as regras seguintes vejam o estado já atualizado. */
    private final class Decision {
        private GameState state;
        private final List<GameEvent> events = new ArrayList<>();

        Decision(GameState state) {
            this.state = state;
        }

        void emit(GameEvent event) {
            events.add(event);
            state = apply(state, event);
        }
    }

    /** Evento inicial da partida, com os jogadores já na ordem de jogo. */
    public GameStarted start(String gameId, GameMode mode, List<StartingPlayer> turnOrder) {
        int count = turnOrder.size();
        if (count < rules.players().min() || count > rules.players().max()) {
            throw new RuleViolationException("A partida precisa de %d a %d jogadores."
                    .formatted(rules.players().min(), rules.players().max()));
        }
        if (new HashSet<>(turnOrder.stream().map(StartingPlayer::id).toList()).size() != count) {
            throw new RuleViolationException("Jogadores repetidos na partida.");
        }
        return new GameStarted(gameId, mode, turnOrder, rules.startingCredits());
    }

    public List<GameEvent> decide(GameState state, String playerId, GameCommand command, Dice dice) {
        return run(state, playerId, command, dice).events;
    }

    public Result execute(GameState state, String playerId, GameCommand command, Dice dice) {
        Decision decision = run(state, playerId, command, dice);
        return new Result(decision.state, List.copyOf(decision.events));
    }

    /** Reconstrói o estado a partir do log completo, começando pelo GameStarted. */
    public GameState replay(List<GameEvent> events) {
        GameState state = null;
        for (GameEvent event : events) {
            state = apply(state, event);
        }
        return state;
    }

    public GameState apply(GameState state, GameEvent event) {
        GameState next = switch (event) {
            case GameStarted e -> initialState(e);
            case DiceRolled e -> state.withDice(e.dice(), e.dice().isDouble() ? state.doublesInRow() + 1 : 0);
            case PlayerMoved e -> {
                GameState moved = state.updatePlayer(e.playerId(),
                        p -> p.withPosition(e.to()).withCredits(p.credits() + e.startBonus()));
                if (e.sentToRest()) {
                    yield moved.withDice(moved.lastDice(), 0).withPhase(TurnPhase.AWAITING_END_TURN);
                }
                PlayerState player = moved.player(e.playerId());
                GameState visited = ownedPropertyHere(moved, player)
                        .map(p -> moved.withProperty(p.withOwnerVisit()))
                        .orElse(moved);
                yield visited.withPhase(phaseAfterLanding(visited, player));
            }
            case PropertyPurchased e -> state
                    .updatePlayer(e.playerId(), p -> p.withCredits(p.credits() - e.price()))
                    .withProperty(PropertyState.purchased(e.stateId(), e.playerId()))
                    .withPhase(TurnPhase.AWAITING_END_TURN);
            case PurchaseDeclined e -> state.withPhase(TurnPhase.AWAITING_END_TURN);
            case HouseBuilt e -> {
                PropertyState property = state.property(e.stateId()).orElseThrow();
                yield state.updatePlayer(e.playerId(), p -> p.withCredits(p.credits() - e.cost()))
                        .withProperty(property.withLevel(property.buildingLevel() + e.count()))
                        .withPhase(TurnPhase.AWAITING_END_TURN);
            }
            case HotelBuilt e -> state
                    .updatePlayer(e.playerId(), p -> p.withCredits(p.credits() - e.cost()))
                    .withProperty(state.property(e.stateId()).orElseThrow().withLevel(PropertyState.HOTEL_LEVEL))
                    .withPhase(TurnPhase.AWAITING_END_TURN);
            case BuildSkipped e -> state.withPhase(TurnPhase.AWAITING_END_TURN);
            case OlympicsHostSelected e -> state
                    .updatePlayer(e.playerId(), p -> p.withCredits(p.credits() - e.fee()))
                    .withOlympics(new OlympicsState(e.edition(), e.stateId(), e.playerId(), e.multiplier()))
                    .withPhase(TurnPhase.AWAITING_END_TURN);
            case OlympicsSkipped e -> state.withPhase(TurnPhase.AWAITING_END_TURN);
            case RentPaid e -> state
                    .updatePlayer(e.fromId(), p -> p.withCredits(p.credits() - e.amount()))
                    .updatePlayer(e.toId(), p -> p.withCredits(p.credits() + e.amount()));
            case DebtIncurred e -> state
                    .withPendingDebt(new Debt(e.debtorId(), e.creditorId(), e.amount()))
                    .withPhase(TurnPhase.AWAITING_DEBT_RESOLUTION);
            case TurnEnded e -> {
                int nextIndex = state.indexOf(e.nextPlayerId());
                boolean sameTurn = nextIndex == state.currentPlayerIndex();
                yield state.withTurn(nextIndex, e.round(), TurnPhase.AWAITING_ROLL, sameTurn ? state.doublesInRow() : 0);
            }
        };
        return next.nextVersion();
    }

    /** Aluguel atual do estado (zero se pertence ao banco), já com bônus de grupo e multiplicador olímpico. */
    public int rentFor(GameState state, String stateId) {
        return state.property(stateId).map(property -> {
            StateDefinition definition = catalog.state(stateId);
            int rent = definition.rent().forLevel(property.buildingLevel());
            if (property.buildingLevel() == 0 && ownsWholeGroup(state, property.ownerId(), definition.colorGroup())) {
                rent *= rules.construction().fullGroupBaseRentMultiplier();
            }
            if (state.olympics().isHost(stateId)) {
                rent *= state.olympics().multiplier();
            }
            return rent;
        }).orElse(0);
    }

    private Decision run(GameState state, String playerId, GameCommand command, Dice dice) {
        if (state.status() != GameStatus.IN_PROGRESS) {
            throw new RuleViolationException("A partida não está em andamento.");
        }
        if (!state.currentPlayer().id().equals(playerId)) {
            throw new RuleViolationException("Não é a sua vez.");
        }
        Decision decision = new Decision(state);
        switch (command) {
            case RollDice ignored -> rollDice(decision, dice);
            case BuyProperty c -> buyProperty(decision, c.houses());
            case DeclinePurchase ignored -> declinePurchase(decision);
            case Build c -> build(decision, c.houses());
            case BuildHotel ignored -> buildHotel(decision);
            case SkipBuild ignored -> skipBuild(decision);
            case HostOlympics c -> hostOlympics(decision, c.stateId());
            case SkipOlympics ignored -> skipOlympics(decision);
            case EndTurn ignored -> endTurn(decision);
        }
        return decision;
    }

    private GameState initialState(GameStarted e) {
        List<PlayerState> players = e.turnOrder().stream()
                .map(p -> new PlayerState(p.id(), p.nickname(), e.startingCredits(), 0, false, 0))
                .toList();
        return new GameState(e.gameId(), e.mode(), GameStatus.IN_PROGRESS, 0, 1, players, 0,
                TurnPhase.AWAITING_ROLL, null, 0, Map.of(), OlympicsState.NONE, null);
    }

    private void rollDice(Decision d, Dice dice) {
        requirePhase(d.state, TurnPhase.AWAITING_ROLL, "Você não pode rolar os dados agora.");
        PlayerState player = d.state.currentPlayer();
        DiceRoll roll = dice.roll();
        d.emit(new DiceRolled(player.id(), roll));

        if (d.state.doublesInRow() >= rules.dice().maxDoublesInRow()) {
            d.emit(new PlayerMoved(player.id(), player.position(), restTile, 0, true));
            return;
        }
        int steps = player.position() + roll.total();
        int bonus = steps >= tileCount ? rules.passStartBonus() : 0;
        d.emit(new PlayerMoved(player.id(), player.position(), steps % tileCount, bonus, false));
        resolveLanding(d);
    }

    /** Efeitos automáticos da casa de chegada. Decisões do jogador ficam para a fase definida em apply. */
    private void resolveLanding(Decision d) {
        PlayerState player = d.state.currentPlayer();
        TileDefinition tile = catalog.tile(player.position());
        if (tile.type() != TileType.PROPERTY) return;

        d.state.property(tile.stateId())
                .filter(property -> !property.ownerId().equals(player.id()))
                .ifPresent(property -> chargeRent(d, player, property));
    }

    private void chargeRent(Decision d, PlayerState payer, PropertyState property) {
        int rent = rentFor(d.state, property.stateId());
        if (payer.credits() >= rent) {
            d.emit(new RentPaid(payer.id(), property.ownerId(), property.stateId(), rent));
        } else {
            d.emit(new DebtIncurred(payer.id(), property.ownerId(), rent));
        }
    }

    /** Compra e, na mesma visita, até {@code firstVisitMaxHouses} casas (primeira etapa, D4). */
    private void buyProperty(Decision d, int houses) {
        requirePhase(d.state, TurnPhase.AWAITING_PURCHASE, "Não há estado para comprar agora.");
        int maxHouses = rules.construction().firstVisitMaxHouses();
        if (houses < 0 || houses > maxHouses) {
            throw new RuleViolationException("Na compra é possível construir de 0 a %d casas.".formatted(maxHouses));
        }
        PlayerState player = d.state.currentPlayer();
        StateDefinition definition = catalog.state(catalog.tile(player.position()).stateId());
        int housesCost = houses * definition.houseCost();
        if (player.credits() < definition.price() + housesCost) {
            throw new RuleViolationException("Saldo insuficiente para comprar " + definition.name() + ".");
        }
        d.emit(new PropertyPurchased(player.id(), definition.id(), definition.price()));
        if (houses > 0) {
            d.emit(new HouseBuilt(player.id(), definition.id(), houses, housesCost));
        }
    }

    private void build(Decision d, int houses) {
        requirePhase(d.state, TurnPhase.AWAITING_BUILD, "Você só pode construir ao parar no próprio estado.");
        PlayerState player = d.state.currentPlayer();
        PropertyState property = ownedPropertyHere(d.state, player).orElseThrow();
        int allowed = buildOptions(property).houses();
        if (allowed == 0) {
            throw new RuleViolationException("Não é possível construir casas neste estado agora.");
        }
        if (houses < 1 || houses > allowed) {
            throw new RuleViolationException("Você pode construir de 1 a %d casa(s) agora.".formatted(allowed));
        }
        int cost = houses * catalog.state(property.stateId()).houseCost();
        requireCredits(player, cost);
        d.emit(new HouseBuilt(player.id(), property.stateId(), houses, cost));
    }

    private void buildHotel(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_BUILD, "Você só pode construir ao parar no próprio estado.");
        PlayerState player = d.state.currentPlayer();
        PropertyState property = ownedPropertyHere(d.state, player).orElseThrow();
        if (!buildOptions(property).hotel()) {
            throw new RuleViolationException("O hotel exige quatro casas e uma nova visita ao estado.");
        }
        int cost = catalog.state(property.stateId()).hotelCost();
        requireCredits(player, cost);
        d.emit(new HotelBuilt(player.id(), property.stateId(), cost));
    }

    private void skipBuild(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_BUILD, "Não há construção para recusar agora.");
        PlayerState player = d.state.currentPlayer();
        d.emit(new BuildSkipped(player.id(), catalog.tile(player.position()).stateId()));
    }

    private void declinePurchase(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_PURCHASE, "Não há compra para recusar agora.");
        PlayerState player = d.state.currentPlayer();
        d.emit(new PurchaseDeclined(player.id(), catalog.tile(player.position()).stateId()));
    }

    private void hostOlympics(Decision d, String stateId) {
        requirePhase(d.state, TurnPhase.AWAITING_OLYMPICS_HOST, "Você só pode organizar as Olimpíadas ao parar na casa Olimpíadas.");
        PlayerState player = d.state.currentPlayer();
        boolean owns = stateId != null
                && d.state.property(stateId).map(p -> p.ownerId().equals(player.id())).orElse(false);
        if (!owns) {
            throw new RuleViolationException("Escolha um estado que você possui para sediar as Olimpíadas.");
        }
        int fee = rules.olympics().hostFee();
        requireCredits(player, fee);
        int edition = d.state.olympics().edition() + 1;
        d.emit(new OlympicsHostSelected(player.id(), stateId, edition,
                rules.olympics().multiplierForEdition(edition), fee));
    }

    private void skipOlympics(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_OLYMPICS_HOST, "Não há Olimpíadas para recusar agora.");
        d.emit(new OlympicsSkipped(d.state.currentPlayer().id()));
    }

    private void endTurn(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_END_TURN, "Termine as ações do turno antes de passar a vez.");
        GameState state = d.state;
        PlayerState player = state.currentPlayer();
        boolean extraRoll = state.lastDice() != null && state.lastDice().isDouble() && state.doublesInRow() > 0;
        if (extraRoll) {
            d.emit(new TurnEnded(player.id(), player.id(), state.round()));
            return;
        }
        int current = state.currentPlayerIndex();
        int next = nextActivePlayer(state, current);
        int round = next <= current ? state.round() + 1 : state.round();
        d.emit(new TurnEnded(player.id(), state.players().get(next).id(), round));
    }

    /** Construções permitidas agora, considerando etapa e visitas (D4), sem olhar o saldo. */
    public record BuildOptions(int houses, boolean hotel) {
    }

    public BuildOptions buildOptions(PropertyState property) {
        RulesConfig.ConstructionRules construction = rules.construction();
        int level = property.buildingLevel();
        int houses = 0;
        if (level < construction.firstVisitMaxHouses()) {
            houses = construction.firstVisitMaxHouses() - level;
        } else if (level < construction.maxHouses() && property.reachedInEarlierVisit()) {
            houses = 1;
        }
        boolean hotel = level == construction.maxHouses() && property.reachedInEarlierVisit();
        return new BuildOptions(houses, hotel);
    }

    /**
     * Fase após parar: Olimpíadas (possui estado e paga a taxa), compra (estado livre e saldo),
     * construção (próprio estado com opção pagável) ou fim do turno.
     */
    private TurnPhase phaseAfterLanding(GameState state, PlayerState player) {
        TileDefinition tile = catalog.tile(player.position());
        if (tile.type() == TileType.OLYMPICS) {
            boolean canHost = state.ownsAnyProperty(player.id()) && player.credits() >= rules.olympics().hostFee();
            return canHost ? TurnPhase.AWAITING_OLYMPICS_HOST : TurnPhase.AWAITING_END_TURN;
        }
        if (tile.type() != TileType.PROPERTY) return TurnPhase.AWAITING_END_TURN;
        StateDefinition definition = catalog.state(tile.stateId());
        Optional<PropertyState> property = state.property(tile.stateId());
        if (property.isEmpty()) {
            return player.credits() >= definition.price() ? TurnPhase.AWAITING_PURCHASE : TurnPhase.AWAITING_END_TURN;
        }
        if (!property.get().ownerId().equals(player.id())) return TurnPhase.AWAITING_END_TURN;
        BuildOptions options = buildOptions(property.get());
        boolean canAfford = (options.houses() > 0 && player.credits() >= definition.houseCost())
                || (options.hotel() && player.credits() >= definition.hotelCost());
        return canAfford ? TurnPhase.AWAITING_BUILD : TurnPhase.AWAITING_END_TURN;
    }

    private Optional<PropertyState> ownedPropertyHere(GameState state, PlayerState player) {
        TileDefinition tile = catalog.tile(player.position());
        if (tile.type() != TileType.PROPERTY) return Optional.empty();
        return state.property(tile.stateId()).filter(p -> p.ownerId().equals(player.id()));
    }

    private static void requireCredits(PlayerState player, int amount) {
        if (player.credits() < amount) {
            throw new RuleViolationException("Saldo insuficiente.");
        }
    }

    private boolean ownsWholeGroup(GameState state, String ownerId, String colorGroup) {
        return catalog.states().stream()
                .filter(s -> s.colorGroup().equals(colorGroup))
                .allMatch(s -> state.property(s.id()).map(p -> p.ownerId().equals(ownerId)).orElse(false));
    }

    private static int nextActivePlayer(GameState state, int from) {
        int size = state.players().size();
        for (int step = 1; step <= size; step++) {
            int candidate = (from + step) % size;
            if (!state.players().get(candidate).bankrupt()) return candidate;
        }
        return from;
    }

    private static void requirePhase(GameState state, TurnPhase expected, String message) {
        if (state.phase() != expected) {
            throw new RuleViolationException(message);
        }
    }
}
