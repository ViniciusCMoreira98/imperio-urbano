package br.imperiourbano.lobby;

import static org.assertj.core.api.Assertions.assertThat;

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
import org.springframework.jdbc.core.JdbcTemplate;

/** Início automático (07/11/2026): com 2 ou mais jogadores, a partida começa sozinha 10 s depois. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class LobbyCountdownTest {

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

    /** Faz a contagem da sala vencer agora, sem esperar os 10 s. */
    private void expire(String gameId) {
        jdbc.update("update games set starts_at = now() - interval '1 second' where id = ?", gameId);
    }

    @Test
    void countdownStartsWithTheSecondPlayerAndStopsWhenOnlyOneIsLeft() {
        GuestPrincipal ana = guest("Ana");
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, true);
        assertThat(room.startsInMs()).isNull();

        GuestPrincipal bia = guest("Bia");
        LobbyView joined = lobby.joinPublic(bia, room.gameId());
        assertThat(joined.startsInMs()).isBetween(9_000L, 10_000L);

        lobby.leave(bia, room.gameId());
        assertThat(lobby.view(ana, room.gameId()).startsInMs()).isNull();
    }

    @Test
    void aThirdPlayerDoesNotRestartTheCountdown() {
        GuestPrincipal ana = guest("Ana");
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, true);
        lobby.joinPublic(guest("Bia"), room.gameId());
        jdbc.update("update games set starts_at = now() + interval '3 seconds' where id = ?", room.gameId());

        LobbyView third = lobby.joinPublic(guest("Caio"), room.gameId());
        assertThat(third.startsInMs()).isLessThanOrEqualTo(3_000L);
    }

    @Test
    void whenTheCountdownEndsTheGameStartsWithoutReadyAndChargesTheStake() {
        GuestPrincipal ana = guest("Ana");
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, true);
        GuestPrincipal bia = guest("Bia");
        lobby.joinPublic(bia, room.gameId());

        lobby.autoStart(room.gameId());
        assertThat(lobby.view(ana, room.gameId()).status()).isEqualTo(GameStatus.LOBBY);

        expire(room.gameId());
        assertThat(lobby.dueLobbies()).contains(room.gameId());
        lobby.autoStart(room.gameId());

        LobbyView started = lobby.view(ana, room.gameId());
        assertThat(started.status()).isEqualTo(GameStatus.IN_PROGRESS);
        assertThat(started.startsInMs()).isNull();
        assertThat(wallet.coins(ana.playerId())).isEqualTo(800);
        assertThat(wallet.coins(bia.playerId())).isEqualTo(800);
        assertThat(lobby.dueLobbies()).doesNotContain(room.gameId());
    }

    @Test
    void roomsWaitingMoreThanFiveMinutesAreClosedButNotTheOnesAboutToStart() {
        GuestPrincipal ana = guest("Ana");
        LobbyView stale = lobby.create(ana, GameMode.CLASSIC, 200, true);
        LobbyView fresh = lobby.create(guest("Caio"), GameMode.CLASSIC, 200, true);
        LobbyView starting = lobby.create(guest("Duda"), GameMode.CLASSIC, 200, true);
        lobby.joinPublic(guest("Edu"), starting.gameId());
        jdbc.update("update games set created_at = now() - interval '6 minutes' where id in (?, ?)",
                stale.gameId(), starting.gameId());

        assertThat(lobby.closeStaleLobbies()).isGreaterThanOrEqualTo(1);

        assertThat(jdbc.queryForObject("select count(*) from games where id = ?", Integer.class, stale.gameId())).isZero();
        assertThat(jdbc.queryForObject("select count(*) from game_players where game_id = ?", Integer.class, stale.gameId())).isZero();
        assertThat(jdbc.queryForObject("select count(*) from games where id = ?", Integer.class, fresh.gameId())).isOne();
        // Contagem ligada (2 jogadores): começa em instantes, não é fechada.
        assertThat(jdbc.queryForObject("select count(*) from games where id = ?", Integer.class, starting.gameId())).isOne();
        // Nada foi cobrado: a aposta só sai no início.
        assertThat(wallet.coins(ana.playerId())).isEqualTo(1000);
    }

    @Test
    void whoCanNoLongerPayLeavesAndWithOnePlayerLeftTheRoomKeepsWaiting() {
        GuestPrincipal ana = guest("Ana");
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 1000, true);
        GuestPrincipal bia = guest("Bia");
        lobby.joinPublic(bia, room.gameId());
        jdbc.update("update guest_sessions set coins = 100 where player_id = ?", bia.playerId());

        expire(room.gameId());
        lobby.autoStart(room.gameId());

        LobbyView after = lobby.view(ana, room.gameId());
        assertThat(after.status()).isEqualTo(GameStatus.LOBBY);
        assertThat(after.players()).extracting(LobbyView.Member::nickname).containsExactly("Ana");
        assertThat(after.startsInMs()).isNull();
        assertThat(wallet.coins(ana.playerId())).isEqualTo(1000);
    }
}
