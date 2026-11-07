package br.imperiourbano.engine;

import br.imperiourbano.catalog.CardEffect;
import br.imperiourbano.catalog.CardEffectType;
import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.EventCard;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.RulesConfig;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.catalog.TileDefinition;
import br.imperiourbano.catalog.TileType;
import br.imperiourbano.engine.GameCommand.Build;
import br.imperiourbano.engine.GameCommand.BuildHotel;
import br.imperiourbano.engine.GameCommand.BuyProperty;
import br.imperiourbano.engine.GameCommand.ChooseEventTarget;
import br.imperiourbano.engine.GameCommand.ChooseTravel;
import br.imperiourbano.engine.GameCommand.DeclareBankruptcy;
import br.imperiourbano.engine.GameCommand.DeclinePurchase;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.HostOlympics;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.SellBuilding;
import br.imperiourbano.engine.GameCommand.SellProperty;
import br.imperiourbano.engine.GameCommand.SkipBuild;
import br.imperiourbano.engine.GameCommand.SkipEventTarget;
import br.imperiourbano.engine.GameCommand.SkipOlympics;
import br.imperiourbano.engine.GameCommand.UseRestPass;
import br.imperiourbano.engine.GameEvent.BlackoutStarted;
import br.imperiourbano.engine.GameEvent.BuildSkipped;
import br.imperiourbano.engine.GameEvent.BuildingSold;
import br.imperiourbano.engine.GameEvent.CreditsFromBank;
import br.imperiourbano.engine.GameEvent.CreditsToBank;
import br.imperiourbano.engine.GameEvent.CreditsTransferred;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.DebtSettled;
import br.imperiourbano.engine.GameEvent.DiceRolled;
import br.imperiourbano.engine.GameEvent.GameAbandoned;
import br.imperiourbano.engine.GameEvent.TimeLimitReached;
import br.imperiourbano.engine.GameEvent.EventCardDrawn;
import br.imperiourbano.engine.GameEvent.EventCardWithoutEffect;
import br.imperiourbano.engine.GameEvent.EventTargetRequested;
import br.imperiourbano.engine.GameEvent.EventTargetSkipped;
import br.imperiourbano.engine.GameEvent.GameFinished;
import br.imperiourbano.engine.GameEvent.GameStarted;
import br.imperiourbano.engine.GameEvent.HotelBuilt;
import br.imperiourbano.engine.GameEvent.HouseBuilt;
import br.imperiourbano.engine.GameEvent.OlympicsHostAppointed;
import br.imperiourbano.engine.GameEvent.OlympicsHostSelected;
import br.imperiourbano.engine.GameEvent.OlympicsSkipped;
import br.imperiourbano.engine.GameEvent.PlayerBankrupt;
import br.imperiourbano.engine.GameEvent.PlayerMoved;
import br.imperiourbano.engine.GameEvent.PropertyPurchased;
import br.imperiourbano.engine.GameEvent.PropertyBurned;
import br.imperiourbano.engine.GameEvent.PropertySold;
import br.imperiourbano.engine.GameEvent.RestLeft;
import br.imperiourbano.engine.GameEvent.RestPassGranted;
import br.imperiourbano.engine.GameEvent.RestPassUsed;
import br.imperiourbano.engine.GameEvent.RestTurnLost;
import br.imperiourbano.engine.GameEvent.TaxPaid;
import br.imperiourbano.engine.GameEvent.TravelChosen;
import br.imperiourbano.engine.GameEvent.TravelDeclined;
import br.imperiourbano.engine.GameEvent.PurchaseDeclined;
import br.imperiourbano.engine.GameEvent.RentPaid;
import br.imperiourbano.engine.GameEvent.RentWaived;
import br.imperiourbano.engine.GameEvent.RentWaiverGranted;
import br.imperiourbano.engine.GameEvent.SaqueCollected;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TurnEnded;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.random.RandomGenerator;

/**
 * Motor de regras puro (sem Spring, sem I/O). {@link #decide} valida um comando e produz eventos;
 * {@link #apply} aplica um evento ao estado. Humanos e futuros bots usam o mesmo caminho.
 */
public final class GameEngine {

    /** Movimentos encadeados por cartas (ex.: carta que leva a outra casa de Eventos). */
    private static final int MAX_CHAINED_LANDINGS = 3;

    private final Catalog catalog;
    private final RandomGenerator shuffler;
    private final RulesConfig rules;
    private final int tileCount;
    private final int restTile;

    public GameEngine(Catalog catalog) {
        this(catalog, new SecureRandom());
    }

    /** {@code shuffler} só embaralha o baralho no início; dados vêm de {@link Dice} a cada rolagem. */
    public GameEngine(Catalog catalog, RandomGenerator shuffler) {
        this.catalog = catalog;
        this.shuffler = shuffler;
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
        return start(gameId, mode, turnOrder, java.time.Instant.now());
    }

    /** {@code now}: início da partida, base do relógio dos modos por tempo. */
    public GameStarted start(String gameId, GameMode mode, List<StartingPlayer> turnOrder, java.time.Instant now) {
        int count = turnOrder.size();
        if (count < rules.players().min() || count > rules.players().max()) {
            throw new RuleViolationException("A partida precisa de %d a %d jogadores."
                    .formatted(rules.players().min(), rules.players().max()));
        }
        if (new HashSet<>(turnOrder.stream().map(StartingPlayer::id).toList()).size() != count) {
            throw new RuleViolationException("Jogadores repetidos na partida.");
        }
        List<String> deck = new ArrayList<>(catalog.eventCards().stream().map(EventCard::id).toList());
        Collections.shuffle(deck, shuffler);
        Integer minutes = rules.modes().get(mode).timeLimitMinutes();
        Long endsAt = minutes == null ? null : now.plus(java.time.Duration.ofMinutes(minutes)).toEpochMilli();
        return new GameStarted(gameId, mode, turnOrder, rules.startingCredits(), deck, endsAt);
    }

    /** Encerramento por abandono (decidido pelo servidor, não por um jogador). */
    public List<GameEvent> abandon(GameState state) {
        if (state.status() != GameStatus.IN_PROGRESS) {
            throw new RuleViolationException("A partida não está em andamento.");
        }
        return List.of(new GameAbandoned());
    }

    /**
     * Relógio esgotado (decidido pelo servidor). Antes de o jogador da vez agir (rolar ou viajar), encerra
     * já; no meio da vez, só marca o fim e a partida encerra quando a vez passar.
     */
    public List<GameEvent> timeUp(GameState state) {
        if (state.status() != GameStatus.IN_PROGRESS || state.endsAt() == null || state.timeUp()) {
            throw new RuleViolationException("A partida não tem relógio a encerrar.");
        }
        if (state.phase() == TurnPhase.AWAITING_ROLL || state.phase() == TurnPhase.AWAITING_TRAVEL_DESTINATION) {
            return List.of(new TimeLimitReached(), new GameFinished(winnersByEquity(state)));
        }
        return List.of(new TimeLimitReached());
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
                        p -> arrive(p.withPosition(e.to()).withCredits(p.credits() + e.startBonus())));
                if (e.sentToRest()) {
                    yield moved.withDice(moved.lastDice(), 0).withPhase(TurnPhase.AWAITING_END_TURN);
                }
                PlayerState player = moved.player(e.playerId());
                GameState visited = ownedPropertyHere(moved, player)
                        .map(p -> moved.withProperty(p.withOwnerVisit()))
                        .orElse(moved);
                yield visited.withPhase(phaseAfterLanding(visited, player));
            }
            case RestTurnLost e -> state
                    .updatePlayer(e.playerId(), p -> p.withSkipTurns(p.skipTurns() - 1))
                    .withPhase(TurnPhase.AWAITING_END_TURN);
            case RestLeft e -> state
                    .updatePlayer(e.playerId(), p -> p.withSkipTurns(0))
                    .withDice(state.lastDice(), 0);
            case RestPassGranted e -> state.updatePlayer(e.playerId(), p -> p.withRestPasses(p.restPasses() + 1));
            // A fase continua AWAITING_ROLL: o jogador rola normalmente, já fora do Descanso.
            case RestPassUsed e -> state.updatePlayer(e.playerId(),
                    p -> p.withSkipTurns(0).withRestPasses(p.restPasses() - 1));
            case RentWaiverGranted e -> state.updatePlayer(e.playerId(), p -> p.withRentWaivers(p.rentWaivers() + 1));
            case RentWaived e -> state.updatePlayer(e.playerId(), p -> p.withRentWaivers(p.rentWaivers() - 1));
            case TravelChosen e -> state.updatePlayer(e.playerId(),
                    p -> p.withCredits(p.credits() - e.fee()).withTravelPending(false));
            case TravelDeclined e -> state
                    .updatePlayer(e.playerId(), p -> p.withTravelPending(false))
                    .withPhase(TurnPhase.AWAITING_ROLL);
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
                    .withPendingDebt(new Debt(e.debtorId(), e.creditorId(), e.amount(), e.toTaxPool()))
                    .withPhase(TurnPhase.AWAITING_DEBT_RESOLUTION);
            case EventCardDrawn e -> state.withEventDeck(state.eventDeck().advanced());
            case EventTargetRequested e -> state
                    .withEventDeck(state.eventDeck().withPending(e.cardId()))
                    .withPhase(TurnPhase.AWAITING_EVENT_TARGET);
            case EventCardWithoutEffect e -> state;
            case EventTargetSkipped e -> cardResolved(state);
            case PropertyBurned e -> {
                GameState burned = cardResolved(state).withoutProperty(e.stateId());
                yield state.olympics().isHost(e.stateId()) ? burned.withOlympics(burned.olympics().withoutHost()) : burned;
            }
            case OlympicsHostAppointed e -> cardResolved(state)
                    .withOlympics(new OlympicsState(e.edition(), e.stateId(), e.ownerId(), e.multiplier()));
            case BlackoutStarted e -> cardResolved(state)
                    .withProperty(state.property(e.stateId()).orElseThrow().withBlackout(e.visits()));
            case CreditsFromBank e -> state.updatePlayer(e.playerId(), p -> p.withCredits(p.credits() + e.amount()));
            case CreditsToBank e -> state.updatePlayer(e.playerId(), p -> p.withCredits(p.credits() - e.amount()));
            case TaxPaid e -> state
                    .updatePlayer(e.playerId(), p -> p.withCredits(p.credits() - e.amount()))
                    .withTaxPool(state.taxPool() + e.amount());
            case SaqueCollected e -> state
                    .updatePlayer(e.playerId(), p -> p.withCredits(p.credits() + e.amount()))
                    .withTaxPool(state.taxPool() - e.amount());
            case CreditsTransferred e -> state
                    .updatePlayer(e.fromId(), p -> p.withCredits(p.credits() - e.amount()))
                    .updatePlayer(e.toId(), p -> p.withCredits(p.credits() + e.amount()));
            case BuildingSold e -> state
                    .updatePlayer(e.playerId(), p -> p.withCredits(p.credits() + e.refund()))
                    .withProperty(state.property(e.stateId()).orElseThrow().downgraded());
            case PropertySold e -> {
                GameState sold = state
                        .updatePlayer(e.playerId(), p -> p.withCredits(p.credits() + e.refund()))
                        .withoutProperty(e.stateId());
                yield state.olympics().isHost(e.stateId()) ? sold.withOlympics(sold.olympics().withoutHost()) : sold;
            }
            case DebtSettled e -> {
                GameState paid = state.updatePlayer(e.debtorId(), p -> p.withCredits(p.credits() - e.amount()));
                if (e.creditorId() != null) {
                    paid = paid.updatePlayer(e.creditorId(), p -> p.withCredits(p.credits() + e.amount()));
                }
                if (state.pendingDebt() != null && state.pendingDebt().toTaxPool()) {
                    paid = paid.withTaxPool(paid.taxPool() + e.amount());
                }
                yield paid.withPendingDebt(null).withPhase(TurnPhase.AWAITING_END_TURN);
            }
            case PlayerBankrupt e -> applyBankruptcy(state, e);
            case GameFinished e -> state.finished(e.winnerIds());
            case GameAbandoned e -> state.finished(List.of());
            case TimeLimitReached e -> state.withTimeUp();
            case TurnEnded e -> {
                int nextIndex = state.indexOf(e.nextPlayerId());
                boolean sameTurn = nextIndex == state.currentPlayerIndex();
                yield state.withTurn(nextIndex, e.round(), turnStartPhase(state.players().get(nextIndex)),
                        sameTurn ? state.doublesInRow() : 0);
            }
        };
        return next.nextVersion();
    }

    /** Carta que pedia um estado foi resolvida (ou perdeu o prazo): o turno segue para o fim. */
    private static GameState cardResolved(GameState state) {
        return state.withEventDeck(state.eventDeck().withPending(null)).withPhase(TurnPhase.AWAITING_END_TURN);
    }

    /** Aluguel atual do estado (zero se pertence ao banco ou está no apagão), já com bônus de grupo e multiplicador olímpico. */
    public int rentFor(GameState state, String stateId) {
        return state.property(stateId).filter(property -> !property.blackout()).map(property -> {
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
            case ChooseTravel c -> chooseTravel(decision, c.tileIndex());
            case BuyProperty c -> buyProperty(decision, c.houses());
            case DeclinePurchase ignored -> declinePurchase(decision);
            case Build c -> build(decision, c.houses());
            case BuildHotel ignored -> buildHotel(decision);
            case SkipBuild ignored -> skipBuild(decision);
            case HostOlympics c -> hostOlympics(decision, c.stateId());
            case SkipOlympics ignored -> skipOlympics(decision);
            case ChooseEventTarget c -> chooseEventTarget(decision, c.stateId());
            case SkipEventTarget ignored -> skipEventTarget(decision);
            case SellBuilding c -> sellBuilding(decision, c.stateId());
            case SellProperty c -> sellProperty(decision, c.stateId());
            case DeclareBankruptcy ignored -> declareBankruptcy(decision);
            case UseRestPass ignored -> useRestPass(decision);
            case EndTurn ignored -> endTurn(decision);
        }
        return decision;
    }

    private GameState initialState(GameStarted e) {
        List<PlayerState> players = e.turnOrder().stream()
                .map(p -> PlayerState.starting(p.id(), p.nickname(), e.startingCredits()))
                .toList();
        return new GameState(e.gameId(), e.mode(), GameStatus.IN_PROGRESS, 0, 1, players, 0,
                TurnPhase.AWAITING_ROLL, null, 0, Map.of(), OlympicsState.NONE,
                new EventDeck(e.eventDeck(), 0), null, List.of(), 0, e.endsAt(), false);
    }

    /** D11: credor recebe saldo e estados (com construções); banco como credor libera os estados. D8: sede perde o marcador. */
    private GameState applyBankruptcy(GameState state, PlayerBankrupt e) {
        PlayerState debtor = state.player(e.playerId());
        Map<String, PropertyState> properties = new HashMap<>(state.properties());
        for (PropertyState property : state.propertiesOf(e.playerId())) {
            if (e.creditorId() == null) {
                properties.remove(property.stateId());
            } else {
                properties.put(property.stateId(), property.transferredTo(e.creditorId()));
            }
        }
        GameState next = state.withProperties(properties)
                .updatePlayer(e.playerId(), PlayerState::asBankrupt)
                .withPendingDebt(null);
        if (e.creditorId() != null) {
            next = next.updatePlayer(e.creditorId(), p -> p.withCredits(p.credits() + debtor.credits()));
        } else if (state.pendingDebt() != null && state.pendingDebt().toTaxPool()) {
            // Falência na Taxa: o saldo que sobrou vai para o fundo do Saque.
            next = next.withTaxPool(next.taxPool() + Math.max(0, debtor.credits()));
        }
        if (e.playerId().equals(state.olympics().hostPlayerId())) {
            next = next.withOlympics(next.olympics().withoutHost());
        }
        return next;
    }

    private void rollDice(Decision d, Dice dice) {
        if (d.state.phase() != TurnPhase.AWAITING_ROLL && d.state.phase() != TurnPhase.AWAITING_TRAVEL_DESTINATION) {
            throw new RuleViolationException("Você não pode rolar os dados agora.");
        }
        PlayerState player = d.state.currentPlayer();
        if (player.travelPending()) {
            d.emit(new TravelDeclined(player.id()));
        }
        DiceRoll roll = dice.roll();
        d.emit(new DiceRolled(player.id(), roll));

        if (player.skipTurns() > 0) {
            if (!roll.isDouble()) {
                d.emit(new RestTurnLost(player.id()));
                return;
            }
            d.emit(new RestLeft(player.id()));
        } else if (d.state.doublesInRow() >= rules.dice().maxDoublesInRow()) {
            d.emit(new PlayerMoved(player.id(), player.position(), restTile, 0, true));
            return;
        }
        moveForward(d, roll.total(), 0);
    }

    /** Passe Livre: só no Descanso, antes de rolar. Sai sem perder a vez; a rolagem seguinte é normal. */
    private void useRestPass(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_ROLL, "Use o Passe Livre antes de rolar os dados.");
        PlayerState player = d.state.currentPlayer();
        if (player.skipTurns() <= 0) {
            throw new RuleViolationException("O Passe Livre só serve para sair do Descanso.");
        }
        if (player.restPasses() <= 0) {
            throw new RuleViolationException("Você não tem Passe Livre.");
        }
        d.emit(new RestPassUsed(player.id()));
    }

    private void chooseTravel(Decision d, int tileIndex) {
        requirePhase(d.state, TurnPhase.AWAITING_TRAVEL_DESTINATION, "Não há viagem disponível agora.");
        PlayerState player = d.state.currentPlayer();
        // Só estados são destino da viagem (pedido do usuário, 06/11/2026); a casa atual é o Aeroporto.
        if (tileIndex < 0 || tileIndex >= tileCount || catalog.tile(tileIndex).type() != TileType.PROPERTY) {
            throw new RuleViolationException("Escolha um estado como destino da viagem.");
        }
        int fee = rules.nationalTravel().fee();
        requireCredits(player, fee);
        d.emit(new TravelChosen(player.id(), tileIndex, fee));
        moveForward(d, Math.floorMod(tileIndex - player.position(), tileCount), 0);
    }

    /** Efeitos de chegar a uma casa: Descanso faz perder jogadas; o Aeroporto (Viagem Nacional) libera a viagem seguinte. */
    private PlayerState arrive(PlayerState player) {
        return switch (catalog.tile(player.position()).type()) {
            case REST -> player.withSkipTurns(rules.rest().turnsLost());
            case NATIONAL_TRAVEL -> player.withTravelPending(true);
            default -> player;
        };
    }

    /** Viagem pendente e taxa pagável abrem a escolha do destino; senão o turno começa pela rolagem. */
    private TurnPhase turnStartPhase(PlayerState player) {
        return player.travelPending() && player.credits() >= rules.nationalTravel().fee()
                ? TurnPhase.AWAITING_TRAVEL_DESTINATION
                : TurnPhase.AWAITING_ROLL;
    }

    /** Avança no sentido do percurso, pagando o bônus ao passar ou parar no Início. */
    private void moveForward(Decision d, int steps, int depth) {
        PlayerState player = d.state.currentPlayer();
        int target = player.position() + steps;
        int bonus = target >= tileCount ? rules.passStartBonus() : 0;
        d.emit(new PlayerMoved(player.id(), player.position(), target % tileCount, bonus, false));
        resolveLanding(d, depth);
    }

    /** Efeitos automáticos da casa de chegada. Decisões do jogador ficam para a fase definida em apply. */
    private void resolveLanding(Decision d, int depth) {
        PlayerState player = d.state.currentPlayer();
        TileDefinition tile = catalog.tile(player.position());
        switch (tile.type()) {
            case PROPERTY -> d.state.property(tile.stateId())
                    .filter(property -> !property.ownerId().equals(player.id()))
                    .ifPresent(property -> chargeRent(d, player, property));
            case EVENT -> {
                if (depth < MAX_CHAINED_LANDINGS) drawEventCard(d, depth);
            }
            case TAX -> payTax(d, player, rules.tax().amount());
            case SAQUE -> {
                if (d.state.taxPool() > 0) d.emit(new SaqueCollected(player.id(), d.state.taxPool()));
            }
            default -> {
            }
        }
    }

    /**
     * Revela a carta do topo e aplica o efeito. Cartas que pedem um estado abrem a escolha no tabuleiro;
     * sem candidato (ou, na visita, sem sede), a carta fica sem efeito (decisão do usuário, 06/11/2026).
     */
    private void drawEventCard(Decision d, int depth) {
        PlayerState player = d.state.currentPlayer();
        EventCard card = topCard(d.state.eventDeck());
        d.emit(new EventCardDrawn(player.id(), card.id()));
        CardEffect effect = card.effect();
        switch (effect.type()) {
            case GAIN -> d.emit(new CreditsFromBank(player.id(), effect.amount()));
            case PAY -> payBank(d, player, effect.amount());
            case VISIT_OLYMPICS_HOST -> {
                String host = d.state.olympics().hostStateId();
                if (host == null) {
                    d.emit(new EventCardWithoutEffect(player.id(), card.id()));
                } else {
                    // Passar pelo Início no caminho paga o bônus, como qualquer avanço.
                    moveForward(d, Math.floorMod(catalog.tileIndex(host) - player.position(), tileCount), depth + 1);
                }
            }
            case BURN_PROPERTY, CHOOSE_OLYMPICS_HOST, BLACKOUT -> {
                if (eventTargets(d.state, player.id(), effect).isEmpty()) {
                    d.emit(new EventCardWithoutEffect(player.id(), card.id()));
                } else {
                    d.emit(new EventTargetRequested(player.id(), card.id()));
                }
            }
            // Descanso merecido: como a 3ª dupla, vai direto ao Descanso, sem bônus do Início e sem nova jogada.
            case GO_TO_REST -> d.emit(new PlayerMoved(player.id(), player.position(), restTile, 0, true));
            case GRANT_REST_PASS -> d.emit(new RestPassGranted(player.id()));
            case GRANT_RENT_WAIVER -> d.emit(new RentWaiverGranted(player.id()));
        }
    }

    /**
     * Carta do topo. Partidas criadas com um baralho que não existe mais (ids antigos) tiram a carta
     * atual na mesma posição, para não travarem ao cair em Eventos.
     */
    private EventCard topCard(EventDeck deck) {
        String id = deck.peek();
        return catalog.eventCards().stream()
                .filter(c -> c.id().equals(id))
                .findFirst()
                .orElseGet(() -> catalog.eventCards().get(deck.next() % catalog.eventCards().size()));
    }

    /**
     * Estados que a carta permite escolher: Incêndio e Apagão, os de adversários; Escolha da sede,
     * qualquer estado com dono (inclusive os do próprio jogador).
     */
    public List<String> eventTargets(GameState state, String playerId, CardEffect effect) {
        return state.properties().values().stream()
                .filter(p -> switch (effect.type()) {
                    case BURN_PROPERTY, BLACKOUT -> !p.ownerId().equals(playerId);
                    case CHOOSE_OLYMPICS_HOST -> true;
                    default -> false;
                })
                .map(PropertyState::stateId)
                .sorted()
                .toList();
    }

    private void chooseEventTarget(Decision d, String stateId) {
        requirePhase(d.state, TurnPhase.AWAITING_EVENT_TARGET, "Não há carta esperando a escolha de um estado.");
        PlayerState player = d.state.currentPlayer();
        EventCard card = catalog.eventCard(d.state.eventDeck().pendingCardId());
        CardEffect effect = card.effect();
        if (stateId == null || !eventTargets(d.state, player.id(), effect).contains(stateId)) {
            throw new RuleViolationException(effect.type() == CardEffectType.CHOOSE_OLYMPICS_HOST
                    ? "Escolha um estado que tenha dono para sediar as Olimpíadas."
                    : "Escolha um estado de um oponente.");
        }
        PropertyState property = d.state.property(stateId).orElseThrow();
        switch (effect.type()) {
            case BURN_PROPERTY -> d.emit(new PropertyBurned(player.id(), stateId, property.ownerId()));
            case BLACKOUT -> d.emit(new BlackoutStarted(player.id(), stateId, effect.visits()));
            case CHOOSE_OLYMPICS_HOST -> {
                int edition = d.state.olympics().edition() + 1;
                d.emit(new OlympicsHostAppointed(player.id(), stateId, property.ownerId(), edition,
                        rules.olympics().multiplierForEdition(edition)));
            }
            default -> throw new IllegalStateException("Carta sem escolha de estado: " + card.id());
        }
    }

    private void skipEventTarget(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_EVENT_TARGET, "Não há carta esperando a escolha de um estado.");
        d.emit(new EventTargetSkipped(d.state.currentPlayer().id(), d.state.eventDeck().pendingCardId()));
    }

    private void payBank(Decision d, PlayerState player, int amount) {
        if (d.state.player(player.id()).credits() >= amount) {
            d.emit(new CreditsToBank(player.id(), amount));
        } else {
            d.emit(new DebtIncurred(player.id(), null, amount));
        }
    }

    /** Taxa vai para o fundo do Saque; sem saldo, vira dívida com o mesmo destino. */
    private void payTax(Decision d, PlayerState player, int amount) {
        if (d.state.player(player.id()).credits() >= amount) {
            d.emit(new TaxPaid(player.id(), amount));
        } else {
            d.emit(new DebtIncurred(player.id(), null, amount, true));
        }
    }

    private void chargeRent(Decision d, PlayerState payer, PropertyState property) {
        int rent = rentFor(d.state, property.stateId());
        if (rent == 0) return; // apagão: não gasta o Aluguel Zero
        if (d.state.player(payer.id()).rentWaivers() > 0) {
            d.emit(new RentWaived(payer.id(), property.ownerId(), property.stateId(), rent));
            return;
        }
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

    private void sellBuilding(Decision d, String stateId) {
        requireDebt(d.state);
        PlayerState player = d.state.currentPlayer();
        PropertyState property = ownedBy(d.state, player, stateId);
        if (property.buildingLevel() == 0) {
            throw new RuleViolationException("Não há construções para vender neste estado.");
        }
        StateDefinition definition = catalog.state(stateId);
        int cost = property.buildingLevel() == PropertyState.HOTEL_LEVEL ? definition.hotelCost() : definition.houseCost();
        d.emit(new BuildingSold(player.id(), stateId, cost / 2));
        settleDebtIfPossible(d);
    }

    private void sellProperty(Decision d, String stateId) {
        requireDebt(d.state);
        PlayerState player = d.state.currentPlayer();
        PropertyState property = ownedBy(d.state, player, stateId);
        int refund = (catalog.state(stateId).price() + investedIn(property)) / 2;
        d.emit(new PropertySold(player.id(), stateId, refund));
        settleDebtIfPossible(d);
    }

    /** Vender ao banco só serve para pagar uma dívida que o saldo não cobre (D10). */
    private static void requireDebt(GameState state) {
        requirePhase(state, TurnPhase.AWAITING_DEBT_RESOLUTION, "Só é possível vender ao banco para pagar uma dívida.");
    }

    private void settleDebtIfPossible(Decision d) {
        Debt debt = d.state.pendingDebt();
        if (debt != null && d.state.player(debt.debtorId()).credits() >= debt.amount()) {
            d.emit(new DebtSettled(debt.debtorId(), debt.creditorId(), debt.amount()));
        }
    }

    private void declareBankruptcy(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_DEBT_RESOLUTION,
                "Só é possível declarar falência com uma dívida que não pode ser paga.");
        d.emit(new PlayerBankrupt(d.state.currentPlayer().id(), d.state.pendingDebt().creditorId()));
        passTurn(d);
    }

    private void endTurn(Decision d) {
        requirePhase(d.state, TurnPhase.AWAITING_END_TURN, "Termine as ações do turno antes de passar a vez.");
        GameState state = d.state;
        PlayerState player = state.currentPlayer();
        boolean extraRoll = state.lastDice() != null && state.lastDice().isDouble() && state.doublesInRow() > 0;
        if (extraRoll && !state.timeUp()) {
            d.emit(new TurnEnded(player.id(), player.id(), state.round()));
            return;
        }
        passTurn(d);
    }

    /** Passa a vez ou encerra a partida: resta um jogador, o limite de rodadas do Rápido ou o fim do relógio. */
    private void passTurn(Decision d) {
        GameState state = d.state;
        List<PlayerState> active = state.activePlayers();
        if (active.size() == 1) {
            d.emit(new GameFinished(List.of(active.getFirst().id())));
            return;
        }
        int current = state.currentPlayerIndex();
        int next = nextActivePlayer(state, current);
        int round = next <= current ? state.round() + 1 : state.round();
        Integer roundLimit = rules.modes().get(state.mode()).roundLimit();
        if (state.timeUp() || (roundLimit != null && round > roundLimit)) {
            d.emit(new GameFinished(winnersByEquity(state)));
            return;
        }
        d.emit(new TurnEnded(state.currentPlayer().id(), state.players().get(next).id(), round));
    }

    /** Maior patrimônio; empate desempatado pelo saldo; persistindo, todos os empatados vencem (D14). */
    private List<String> winnersByEquity(GameState state) {
        Comparator<PlayerState> ranking = Comparator
                .comparingInt((PlayerState p) -> equity(state, p.id()))
                .thenComparingInt(PlayerState::credits);
        List<PlayerState> active = state.activePlayers();
        PlayerState best = active.stream().max(ranking).orElseThrow();
        return active.stream().filter(p -> ranking.compare(p, best) == 0).map(PlayerState::id).toList();
    }

    /**
     * Patrimônio = saldo + para cada estado: preço + valor investido em construções + aluguel que cobra hoje
     * (com sede olímpica; zero no apagão). O aluguel faz quem investiu valer mais que o custo (07/11/2026).
     */
    public int equity(GameState state, String playerId) {
        int assets = state.propertiesOf(playerId).stream()
                .mapToInt(p -> catalog.state(p.stateId()).price() + investedIn(p) + rentFor(state, p.stateId()))
                .sum();
        return state.player(playerId).credits() + assets;
    }

    private int investedIn(PropertyState property) {
        StateDefinition definition = catalog.state(property.stateId());
        int houses = Math.min(property.buildingLevel(), rules.construction().maxHouses());
        int hotel = property.buildingLevel() == PropertyState.HOTEL_LEVEL ? definition.hotelCost() : 0;
        return houses * definition.houseCost() + hotel;
    }

    private static PropertyState ownedBy(GameState state, PlayerState player, String stateId) {
        return (stateId == null ? Optional.<PropertyState>empty() : state.property(stateId))
                .filter(p -> p.ownerId().equals(player.id()))
                .orElseThrow(() -> new RuleViolationException("Você só pode vender estados que possui."));
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
