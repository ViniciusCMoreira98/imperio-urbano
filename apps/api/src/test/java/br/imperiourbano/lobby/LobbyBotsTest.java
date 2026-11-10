package br.imperiourbano.lobby;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.identity.GuestSessionService;
import br.imperiourbano.wallet.WalletService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/** Partida contra bots (10/11/2026): começa na hora, sem aposta, com o jogador no primeiro assento. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class LobbyBotsTest {

    @Autowired
    GuestSessionService sessions;

    @Autowired
    LobbyService lobby;

    @Autowired
    WalletService wallet;

    @Test
    void startsRightAwayWithTheBotsAndCostsNothing() {
        GuestPrincipal ana = sessions.create("Ana").player();
        long coins = wallet.coins(ana.playerId());

        LobbyView game = lobby.createVsBots(ana, GameMode.CLASSIC, 3);

        assertThat(game.status()).isEqualTo(GameStatus.IN_PROGRESS);
        assertThat(game.stake()).isZero();
        assertThat(game.publicRoom()).isFalse();
        assertThat(game.players()).extracting(LobbyView.Member::nickname)
                .containsExactly("Ana", "Bot Sabiá", "Bot Jabuti", "Bot Caju");
        assertThat(game.players()).extracting(LobbyView.Member::pawnColor).doesNotHaveDuplicates();
        assertThat(wallet.coins(ana.playerId())).isEqualTo(coins);
        // Duas partidas ao mesmo tempo com os mesmos bots.
        assertThat(lobby.createVsBots(sessions.create("Bia").player(), GameMode.CLASSIC, 1).players()).hasSize(2);
    }

    @Test
    void needsOneToThreeBots() {
        GuestPrincipal ana = sessions.create("Ana").player();
        assertThatThrownBy(() -> lobby.createVsBots(ana, GameMode.CLASSIC, 0)).isInstanceOf(LobbyException.class);
        assertThatThrownBy(() -> lobby.createVsBots(ana, GameMode.CLASSIC, 4)).isInstanceOf(LobbyException.class);
    }
}
