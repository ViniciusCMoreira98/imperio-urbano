package br.imperiourbano.persistence;

/** O commandId já foi processado; o reenvio deve ser respondido sem reaplicar o comando. */
public class DuplicateCommandException extends RuntimeException {

    public DuplicateCommandException(String commandId) {
        super("Comando já processado: " + commandId);
    }
}
