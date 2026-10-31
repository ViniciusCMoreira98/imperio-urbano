package br.imperiourbano.engine;

public record DiceRoll(int first, int second) {

    public DiceRoll {
        if (first < 1 || first > 6 || second < 1 || second > 6) {
            throw new IllegalArgumentException("Face de dado inválida: " + first + ", " + second);
        }
    }

    public int total() {
        return first + second;
    }

    public boolean isDouble() {
        return first == second;
    }
}
