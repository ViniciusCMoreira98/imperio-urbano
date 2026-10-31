package br.imperiourbano.engine;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.RulesConfig;
import br.imperiourbano.catalog.TileType;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameEvent.DiceRolled;
import br.imperiourbano.engine.GameEvent.GameStarted;
import br.imperiourbano.engine.GameEvent.PlayerMoved;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TurnEnded;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * Motor de regras puro (sem Spring, sem I/O). {@link #decide} valida um comando e produz eventos;
 * {@link #apply} aplica um evento ao estado. Humanos e futuros bots usam o mesmo caminho.
 */
public final class GameEngine {

    private final RulesConfig rules;
    private final int tileCount;
    private final int restTile;

    public GameEngine(Catalog catalog) {
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
        if (state.status() != GameStatus.IN_PROGRESS) {
            throw new RuleViolationException("A partida não está em andamento.");
        }
        if (!state.currentPlayer().id().equals(playerId)) {
            throw new RuleViolationException("Não é a sua vez.");
        }
        return switch (command) {
            case RollDice ignored -> rollDice(state, dice);
            case EndTurn ignored -> endTurn(state);
        };
    }

    public Result execute(GameState state, String playerId, GameCommand command, Dice dice) {
        List<GameEvent> events = decide(state, playerId, command, dice);
        GameState next = state;
        for (GameEvent event : events) {
            next = apply(next, event);
        }
        return new Result(next, events);
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
                GameState moved = state
                        .updatePlayer(e.playerId(), p -> p.withPosition(e.to()).withCredits(p.credits() + e.startBonus()))
                        .withPhase(TurnPhase.AWAITING_END_TURN);
                yield e.sentToRest() ? moved.withDice(moved.lastDice(), 0) : moved;
            }
            case TurnEnded e -> {
                int nextIndex = state.indexOf(e.nextPlayerId());
                boolean sameTurn = nextIndex == state.currentPlayerIndex();
                yield state.withTurn(nextIndex, e.round(), TurnPhase.AWAITING_ROLL, sameTurn ? state.doublesInRow() : 0);
            }
        };
        return next.nextVersion();
    }

    private GameState initialState(GameStarted e) {
        List<PlayerState> players = e.turnOrder().stream()
                .map(p -> new PlayerState(p.id(), p.nickname(), e.startingCredits(), 0, false, 0))
                .toList();
        return new GameState(e.gameId(), e.mode(), GameStatus.IN_PROGRESS, 0, 1, players, 0,
                TurnPhase.AWAITING_ROLL, null, 0);
    }

    private List<GameEvent> rollDice(GameState state, Dice dice) {
        requirePhase(state, TurnPhase.AWAITING_ROLL, "Você não pode rolar os dados agora.");
        PlayerState player = state.currentPlayer();
        DiceRoll roll = dice.roll();
        List<GameEvent> events = new ArrayList<>();
        events.add(new DiceRolled(player.id(), roll));

        int doubles = roll.isDouble() ? state.doublesInRow() + 1 : 0;
        if (doubles >= rules.dice().maxDoublesInRow()) {
            events.add(new PlayerMoved(player.id(), player.position(), restTile, 0, true));
            return events;
        }
        int steps = player.position() + roll.total();
        int bonus = steps >= tileCount ? rules.passStartBonus() : 0;
        events.add(new PlayerMoved(player.id(), player.position(), steps % tileCount, bonus, false));
        return events;
    }

    private List<GameEvent> endTurn(GameState state) {
        requirePhase(state, TurnPhase.AWAITING_END_TURN, "Termine as ações do turno antes de passar a vez.");
        PlayerState player = state.currentPlayer();
        boolean extraRoll = state.lastDice() != null && state.lastDice().isDouble() && state.doublesInRow() > 0;
        if (extraRoll) {
            return List.of(new TurnEnded(player.id(), player.id(), state.round()));
        }
        int current = state.currentPlayerIndex();
        int next = nextActivePlayer(state, current);
        int round = next <= current ? state.round() + 1 : state.round();
        return List.of(new TurnEnded(player.id(), state.players().get(next).id(), round));
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
