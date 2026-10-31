package br.imperiourbano.engine;

/** Comando recusado pelas regras. A mensagem é exibida ao jogador. */
public class RuleViolationException extends RuntimeException {

    public RuleViolationException(String message) {
        super(message);
    }
}
