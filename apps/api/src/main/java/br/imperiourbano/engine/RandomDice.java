package br.imperiourbano.engine;

import java.security.SecureRandom;
import java.util.random.RandomGenerator;

public final class RandomDice implements Dice {

    private final RandomGenerator random;

    public RandomDice() {
        this(new SecureRandom());
    }

    public RandomDice(RandomGenerator random) {
        this.random = random;
    }

    @Override
    public DiceRoll roll() {
        return new DiceRoll(1 + random.nextInt(6), 1 + random.nextInt(6));
    }
}
