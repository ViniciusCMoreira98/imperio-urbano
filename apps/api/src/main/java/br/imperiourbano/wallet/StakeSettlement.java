package br.imperiourbano.wallet;

import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.game.Bots;
import br.imperiourbano.game.GameUpdated;
import java.util.List;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Paga o pote e conta as vitórias quando a partida termina; abandonada, encerra o pote sem pagamento. */
@Component
class StakeSettlement {

    private final WalletService wallet;

    StakeSettlement(WalletService wallet) {
        this.wallet = wallet;
    }

    @EventListener
    void onUpdate(GameUpdated update) {
        for (GameEvent event : update.events()) {
            if (event instanceof GameEvent.GameFinished finished) {
                wallet.settle(update.gameId(), update.state().players().size(), finished.winnerIds());
                // Contra bots não vale vitória (10/11/2026): seria fácil acumular vencendo bots.
                boolean vsBots = update.state().players().stream().anyMatch(p -> Bots.isBot(p.id()));
                if (!vsBots) wallet.recordWins(update.gameId(), finished.winnerIds());
            } else if (event instanceof GameEvent.GameAbandoned) {
                wallet.settle(update.gameId(), update.state().players().size(), List.of());
            }
        }
    }
}
