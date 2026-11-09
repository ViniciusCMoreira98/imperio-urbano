package br.imperiourbano.game;

import br.imperiourbano.engine.GameEvent;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Quanto tempo a mesa leva para mostrar um lote de eventos (dados rolando e personagens andando), para
 * o prazo do turno só começar a contar quando a jogada termina na tela. Espelha os tempos do cliente:
 * {@code dice/rollPlan.ts} (ROLL_SECONDS) e {@code board/Pawn.tsx} (HOP e LEAP) com a regra de
 * {@code game/moves.ts} (até 12 casas anda casa a casa; a viagem do Aeroporto também, acelerada; Descanso e
 * avanço maior são um salto),
 * mais o tempo da carta de evento na tela.
 */
final class TablePresentation {

    static final Duration ROLL = Duration.ofMillis(900);
    /** Um salto casa a casa: virar (0,12) + voo (0,24) + pouso (0,08). */
    static final Duration HOP = Duration.ofMillis(440);
    /**
     * Um salto da viagem do Aeroporto (TRAVEL no Pawn.tsx): virar (0,04) + voo (0,11) + pouso (0,03). Contar a
     * viagem como um salto só fazia o prazo da compra acabar no servidor enquanto o personagem ainda andava
     * na tela: o jogador clicava em comprar e recebia erro (08/11/2026).
     */
    static final Duration TRAVEL_HOP = Duration.ofMillis(180);
    /** O salto direto ao destino: virar (0,18) + voo (0,7) + pouso (0,12). */
    static final Duration LEAP = Duration.ofMillis(1_000);
    /** Carta de evento na tela ({@code hud/CardReveal.tsx}, CARD_MS): o que vem depois dela espera ela sumir. */
    static final Duration CARD = Duration.ofMillis(4_500);
    /** Folga para a rede e para o jogador ver onde parou. */
    static final Duration MARGIN = Duration.ofMillis(500);
    /** Teto: um lote muito longo não segura a partida indefinidamente. */
    static final Duration MAX = Duration.ofSeconds(12);
    private static final int MAX_WALK_STEPS = 12;

    private TablePresentation() {
    }

    static Duration of(List<GameEvent> events, int tileCount) {
        Duration total = Duration.ZERO;
        Set<String> traveling = new HashSet<>();
        for (GameEvent event : events) {
            switch (event) {
                case GameEvent.DiceRolled rolled -> total = total.plus(ROLL);
                case GameEvent.EventCardDrawn card -> total = total.plus(CARD);
                case GameEvent.TravelChosen travel -> traveling.add(travel.playerId());
                case GameEvent.PlayerMoved moved -> {
                    int steps = Math.floorMod(moved.to() - moved.from(), tileCount);
                    boolean flew = traveling.remove(moved.playerId());
                    boolean walk = !moved.sentToRest() && !flew && steps > 0 && steps <= MAX_WALK_STEPS;
                    Duration move = flew && !moved.sentToRest() && steps > 0 ? TRAVEL_HOP.multipliedBy(steps)
                            : walk ? HOP.multipliedBy(steps) : LEAP;
                    total = total.plus(move);
                }
                default -> {
                }
            }
        }
        if (total.isZero()) return Duration.ZERO;
        total = total.plus(MARGIN);
        return total.compareTo(MAX) > 0 ? MAX : total;
    }
}
