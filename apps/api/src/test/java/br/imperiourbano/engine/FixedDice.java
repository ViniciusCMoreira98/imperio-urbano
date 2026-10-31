package br.imperiourbano.engine;

import java.util.ArrayDeque;
import java.util.Deque;

/** Dados com resultados pré-definidos, para testes determinísticos. */
final class FixedDice implements Dice {

    private final Deque<DiceRoll> rolls = new ArrayDeque<>();

    static FixedDice of(int... faces) {
        if (faces.length % 2 != 0) throw new IllegalArgumentException("Informe pares de faces");
        FixedDice dice = new FixedDice();
        for (int i = 0; i < faces.length; i += 2) {
            dice.rolls.add(new DiceRoll(faces[i], faces[i + 1]));
        }
        return dice;
    }

    @Override
    public DiceRoll roll() {
        DiceRoll roll = rolls.poll();
        if (roll == null) throw new IllegalStateException("Sem rolagens pré-definidas");
        return roll;
    }
}
