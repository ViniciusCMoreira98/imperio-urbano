package br.imperiourbano.lobby;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.identity.GuestSessionService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

/** Salas públicas (07/11/2026): escolha ao criar, lista só com salas em que dá para entrar, entrada sem código. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class PublicRoomsTest {

    @Autowired
    GuestSessionService sessions;

    @Autowired
    LobbyService lobby;

    @Autowired
    JdbcTemplate jdbc;

    private GuestPrincipal guest(String nickname) {
        return sessions.create(nickname).player();
    }

    private List<String> listedIds(GuestPrincipal viewer) {
        return lobby.publicRooms(viewer).stream().map(PublicRoomView::gameId).toList();
    }

    @Test
    void publicRoomIsListedWithHostModeStakeAndSeatsButNoInviteCode() {
        GuestPrincipal ana = guest("Ana");
        LobbyView room = lobby.create(ana, GameMode.TIMED_25, 200, true);
        assertThat(room.publicRoom()).isTrue();

        PublicRoomView listed = lobby.publicRooms(guest("Bia")).stream()
                .filter(r -> r.gameId().equals(room.gameId())).findFirst().orElseThrow();
        assertThat(listed).isEqualTo(new PublicRoomView(room.gameId(), "Ana", GameMode.TIMED_25, 200, 1, 4));
    }

    @Test
    void privateRoomIsNotListedAndCannotBeJoinedById() {
        GuestPrincipal ana = guest("Ana");
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, false);
        GuestPrincipal bia = guest("Bia");

        assertThat(listedIds(bia)).doesNotContain(room.gameId());
        assertThatThrownBy(() -> lobby.joinPublic(bia, room.gameId())).isInstanceOf(LobbyException.class)
                .hasMessage("Sala não encontrada.");
        assertThat(lobby.join(bia, room.inviteCode()).players()).hasSize(2);
    }

    @Test
    void joiningFromTheListSeatsThePlayer() {
        LobbyView room = lobby.create(guest("Ana"), GameMode.QUICK, 200, true);
        GuestPrincipal bia = guest("Bia");

        LobbyView joined = lobby.joinPublic(bia, room.gameId());

        assertThat(joined.players()).extracting(LobbyView.Member::nickname).containsExactly("Ana", "Bia");
        assertThat(listedIds(bia)).doesNotContain(room.gameId());
    }

    @Test
    void fullStartedOrUnaffordableRoomsAreNotListed() {
        GuestPrincipal ana = guest("Ana");
        LobbyView full = lobby.create(ana, GameMode.CLASSIC, 200, true);
        List.of("Bia", "Caio", "Duda").forEach(n -> lobby.joinPublic(guest(n), full.gameId()));

        GuestPrincipal edu = guest("Edu");
        LobbyView started = lobby.create(edu, GameMode.CLASSIC, 200, true);
        GuestPrincipal fe = guest("Fe");
        lobby.joinPublic(fe, started.gameId());
        lobby.setReady(edu, started.gameId(), true);
        lobby.setReady(fe, started.gameId(), true);
        lobby.start(edu, started.gameId());

        LobbyView expensive = lobby.create(guest("Gil"), GameMode.CLASSIC, 1000, true);
        GuestPrincipal poor = guest("Hugo");
        jdbc.update("update guest_sessions set coins = 500 where player_id = ?", poor.playerId());

        assertThat(listedIds(poor)).doesNotContain(full.gameId(), started.gameId(), expensive.gameId());
        assertThat(listedIds(guest("Ivo"))).contains(expensive.gameId());
    }
}
