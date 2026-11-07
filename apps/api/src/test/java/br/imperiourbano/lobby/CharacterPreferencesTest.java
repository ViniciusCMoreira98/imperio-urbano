package br.imperiourbano.lobby;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.identity.GuestSessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/** Personagem escolhido no menu (07/11/2026): o jogador já entra na sala com ele. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class CharacterPreferencesTest {

    @Autowired
    GuestSessionService sessions;

    @Autowired
    LobbyService lobby;

    @Autowired
    CharacterPreferences characters;

    private GuestPrincipal guest(String nickname) {
        return sessions.create(nickname).player();
    }

    private LobbyView.Member seat(LobbyView room, GuestPrincipal player) {
        return room.players().stream().filter(m -> m.playerId().equals(player.playerId())).findFirst().orElseThrow();
    }

    @Test
    void newPlayerHasTheDefaultAvatarAndNoColorPreference() {
        assertThat(characters.of(guest("Ana").playerId()))
                .isEqualTo(new CharacterPreferences.Character("avatar-1", null));
    }

    @Test
    void creatingAndJoiningUseTheChosenCharacter() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        characters.save(ana.playerId(), "avatar-3", PawnColor.values()[2]);
        characters.save(bia.playerId(), "avatar-5", PawnColor.values()[4]);

        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, true);
        assertThat(seat(room, ana).avatarId()).isEqualTo("avatar-3");
        assertThat(seat(room, ana).pawnColor()).isEqualTo(PawnColor.values()[2]);

        LobbyView joined = lobby.joinPublic(bia, room.gameId());
        assertThat(seat(joined, bia).avatarId()).isEqualTo("avatar-5");
        assertThat(seat(joined, bia).pawnColor()).isEqualTo(PawnColor.values()[4]);
    }

    @Test
    void aTakenColorFallsBackToTheFirstFreeOne() {
        GuestPrincipal ana = guest("Ana");
        GuestPrincipal bia = guest("Bia");
        characters.save(ana.playerId(), "avatar-2", PawnColor.values()[0]);
        characters.save(bia.playerId(), "avatar-4", PawnColor.values()[0]);

        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, true);
        LobbyView joined = lobby.joinPublic(bia, room.gameId());

        assertThat(seat(joined, bia).avatarId()).isEqualTo("avatar-4");
        assertThat(seat(joined, bia).pawnColor()).isEqualTo(PawnColor.values()[1]);
    }

    @Test
    void changingInTheRoomBecomesTheNewPreference() {
        GuestPrincipal ana = guest("Ana");
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, true);
        lobby.customize(ana, room.gameId(), "avatar-4", PawnColor.values()[3]);

        assertThat(characters.of(ana.playerId()))
                .isEqualTo(new CharacterPreferences.Character("avatar-4", PawnColor.values()[3]));
    }

    @Test
    void unknownAvatarIsRejected() {
        GuestPrincipal ana = guest("Ana");
        assertThatThrownBy(() -> characters.save(ana.playerId(), "avatar-9", PawnColor.values()[0]))
                .isInstanceOf(LobbyException.class).hasMessage("Avatar inválido.");
    }
}
