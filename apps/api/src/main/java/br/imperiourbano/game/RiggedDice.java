package br.imperiourbano.game;

import br.imperiourbano.engine.Dice;
import br.imperiourbano.engine.DiceRoll;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Próximo lance escolhido por partida, só para testes de desenvolvimento. Fica vazio a menos que a
 * ferramenta de desenvolvedor (ligada por {@code app.dev-tools.enabled}) defina um valor; o lance
 * escolhido vale uma vez e depois os dados voltam a ser sorteados.
 */
@Component
public class RiggedDice {

    private final Map<String, DiceRoll> next = new ConcurrentHashMap<>();

    public void setNext(String gameId, DiceRoll roll) {
        next.put(gameId, roll);
    }

    /** Dados da partida: o lance escolhido (uma vez), senão o sorteio normal. */
    Dice forGame(String gameId, Dice fallback) {
        return () -> {
            DiceRoll chosen = next.remove(gameId);
            return chosen != null ? chosen : fallback.roll();
        };
    }
}
