package br.imperiourbano.wallet;

import br.imperiourbano.identity.GuestPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
class WalletController {

    private final WalletService wallet;

    WalletController(WalletService wallet) {
        this.wallet = wallet;
    }

    /** Saldo do jogador; aplica a recarga grátis do dia se ele estiver abaixo do mínimo. */
    @GetMapping
    WalletService.Wallet current(@AuthenticationPrincipal GuestPrincipal player) {
        return wallet.current(player.playerId());
    }
}
