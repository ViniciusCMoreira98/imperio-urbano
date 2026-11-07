package br.imperiourbano.wallet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.identity.GuestSessionService;
import br.imperiourbano.lobby.LobbyException;
import br.imperiourbano.lobby.LobbyService;
import br.imperiourbano.lobby.LobbyView;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class WalletTest {

    @Autowired
    GuestSessionService sessions;

    @Autowired
    LobbyService lobby;

    @Autowired
    WalletService wallet;

    @Autowired
    JdbcTemplate jdbc;

    private GuestPrincipal guest(String nickname) {
        return sessions.create(nickname).player();
    }

    private void setCoins(GuestPrincipal player, long coins) {
        jdbc.update("update guest_sessions set coins = ? where player_id = ?", coins, player.playerId());
    }

    private LobbyView readyRoom(GuestPrincipal host, GuestPrincipal guest, int stake) {
        LobbyView room = lobby.create(host, GameMode.CLASSIC, stake);
        lobby.join(guest, room.inviteCode());
        lobby.setReady(host, room.gameId(), true);
        lobby.setReady(guest, room.gameId(), true);
        return room;
    }

    @Test
    void newGuestStartsWithOneThousandCoinsAndNoDiamonds() {
        assertThat(wallet.current(guest("Ana").playerId())).isEqualTo(new WalletService.Wallet(1000, 0));
    }

    @Test
    void roomStakeMustBeAllowedAndAffordable() {
        GuestPrincipal ana = guest("Ana");
        assertThatThrownBy(() -> lobby.create(ana, GameMode.CLASSIC, 300)).isInstanceOf(LobbyException.class)
                .hasMessage("Aposta inválida.");
        assertThatThrownBy(() -> lobby.create(ana, GameMode.CLASSIC, 5000)).isInstanceOf(LobbyException.class)
                .hasMessage("Moedas insuficientes para essa aposta.");
        assertThat(lobby.create(ana, GameMode.QUICK, 1000).stake()).isEqualTo(1000);
    }

    @Test
    void joiningNeedsCoinsForTheStake() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 1000);
        setCoins(bia, 999);
        assertThatThrownBy(() -> lobby.join(bia, room.inviteCode())).isInstanceOf(LobbyException.class)
                .hasMessage("Moedas insuficientes para essa aposta.");
    }

    @Test
    void stakeIsChargedFromEveryoneOnlyWhenTheGameStarts() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        LobbyView room = readyRoom(ana, bia, 200);
        assertThat(wallet.coins(ana.playerId())).isEqualTo(1000);

        assertThat(lobby.start(ana, room.gameId()).status()).isEqualTo(GameStatus.IN_PROGRESS);
        assertThat(wallet.coins(ana.playerId())).isEqualTo(800);
        assertThat(wallet.coins(bia.playerId())).isEqualTo(800);
    }

    @Test
    void whenSomeoneCannotPayNobodyIsChargedAndTheGameDoesNotStart() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        LobbyView room = readyRoom(ana, bia, 1000);
        setCoins(bia, 500);

        assertThatThrownBy(() -> lobby.start(ana, room.gameId())).isInstanceOf(LobbyException.class)
                .hasMessage("Bia não tem moedas para a aposta.");
        assertThat(wallet.coins(ana.playerId())).isEqualTo(1000);
        assertThat(lobby.view(ana, room.gameId()).status()).isEqualTo(GameStatus.LOBBY);
    }

    @Test
    void winnerTakesThePotOnlyOnce() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        LobbyView room = readyRoom(ana, bia, 1000);
        lobby.start(ana, room.gameId());

        wallet.settle(room.gameId(), 2, List.of(bia.playerId()));
        wallet.settle(room.gameId(), 2, List.of(bia.playerId()));
        assertThat(wallet.coins(bia.playerId())).isEqualTo(2000);
        assertThat(wallet.coins(ana.playerId())).isZero();
    }

    @Test
    void tiedWinnersSplitThePot() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        GuestPrincipal caio = guest("Caio");
        LobbyView room = lobby.create(ana, GameMode.QUICK, 200);
        lobby.join(bia, room.inviteCode());
        lobby.join(caio, room.inviteCode());
        List.of(ana, bia, caio).forEach(p -> lobby.setReady(p, room.gameId(), true));
        lobby.start(ana, room.gameId());

        wallet.settle(room.gameId(), 3, List.of(ana.playerId(), bia.playerId()));
        assertThat(wallet.coins(ana.playerId())).isEqualTo(800 + 300);
        assertThat(wallet.coins(bia.playerId())).isEqualTo(800 + 300);
        assertThat(wallet.coins(caio.playerId())).isEqualTo(800);
    }

    @Test
    void abandonedGameLosesThePot() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        LobbyView room = readyRoom(ana, bia, 200);
        lobby.start(ana, room.gameId());

        wallet.settle(room.gameId(), 2, List.of());
        wallet.settle(room.gameId(), 2, List.of(ana.playerId()));
        assertThat(wallet.coins(ana.playerId())).isEqualTo(800);
    }

    @Test
    void dailyRefillOnlyBelowTheMinimumAndOncePerDay() {
        GuestPrincipal ana = guest("Ana");
        setCoins(ana, 150);
        assertThat(wallet.current(ana.playerId()).coins()).isEqualTo(1000);

        setCoins(ana, 50);
        assertThat(wallet.current(ana.playerId()).coins()).isEqualTo(50);

        GuestPrincipal bia = guest("Bia");
        setCoins(bia, 200);
        assertThat(wallet.current(bia.playerId()).coins()).isEqualTo(200);
    }
}
