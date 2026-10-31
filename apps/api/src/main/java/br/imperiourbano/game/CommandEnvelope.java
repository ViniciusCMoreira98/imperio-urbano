package br.imperiourbano.game;

import br.imperiourbano.engine.GameCommand;

/**
 * Comando enviado pelo cliente. {@code commandId} (gerado pelo cliente) torna o reenvio seguro;
 * {@code expectedVersion} é a versão do snapshot que o jogador via ao decidir.
 */
public record CommandEnvelope(String commandId, long expectedVersion, GameCommand command) {
}
