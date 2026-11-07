package br.imperiourbano.wallet;

import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.game.GameUpdated;
import java.util.List;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Paga o pote quando a partida termina (vitória) ou o encerra sem pagamento (abandonada). */
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
            } else if (event instanceof GameEvent.GameAbandoned) {
                wallet.settle(update.gameId(), update.state().players().size(), List.of());
            }
        }
    }
}
