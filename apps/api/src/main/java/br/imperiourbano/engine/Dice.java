package br.imperiourbano.engine;

/** Fonte de aleatoriedade do motor. O resultado vira evento, então o replay é determinístico. */
@FunctionalInterface
public interface Dice {

    DiceRoll roll();
}
