package br.imperiourbano.lobby;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.persistence.GameStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class LobbyApiTest {

    @Autowired
    MockMvcTester mvc;

    @Autowired
    GameStore store;

    /** Cria um convidado e devolve o cabeçalho de autorização. */
    private String login(String nickname) throws Exception {
        String body = mvc.post().uri("/api/sessions").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nickname\":\"" + nickname + "\"}").exchange()
                .getResponse().getContentAsString();
        return "Bearer " + body.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
    }

    private MvcTestResult post(String auth, String uri, String json) {
        return mvc.post().uri(uri).header(HttpHeaders.AUTHORIZATION, auth)
                .contentType(MediaType.APPLICATION_JSON).content(json).exchange();
    }

    private MvcTestResult put(String auth, String uri, String json) {
        return mvc.put().uri(uri).header(HttpHeaders.AUTHORIZATION, auth)
                .contentType(MediaType.APPLICATION_JSON).content(json).exchange();
    }

    private static String field(MvcTestResult result, String name) throws Exception {
        return result.getResponse().getContentAsString().replaceAll(".*?\"" + name + "\":\"([^\"]+)\".*", "$1");
    }

    private record Room(String id, String code) {
    }

    private Room createRoom(String hostAuth, String mode) throws Exception {
        MvcTestResult created = post(hostAuth, "/api/games", "{\"mode\":\"" + mode + "\"}");
        assertThat(created).hasStatus(HttpStatus.CREATED);
        return new Room(field(created, "gameId"), field(created, "inviteCode"));
    }

    private MvcTestResult join(String auth, String code) {
        return post(auth, "/api/games/join", "{\"inviteCode\":\"" + code + "\"}");
    }

    @Test
    void hostCreatesRoomAndTakesTheFirstSeat() throws Exception {
        String ana = login("Ana");
        MvcTestResult created = post(ana, "/api/games", "{\"mode\":\"QUICK\"}");

        assertThat(created).hasStatus(HttpStatus.CREATED);
        assertThat(created).bodyJson().extractingPath("$.status").isEqualTo("LOBBY");
        assertThat(created).bodyJson().extractingPath("$.mode").isEqualTo("QUICK");
        assertThat(created).bodyJson().extractingPath("$.inviteCode").asString().matches("[A-HJ-NP-Z2-9]{6}");
        assertThat(created).bodyJson().extractingPath("$.players[0].nickname").isEqualTo("Ana");
        assertThat(created).bodyJson().extractingPath("$.players[0].pawnColor").isEqualTo("VERDE");
        assertThat(created).bodyJson().extractingPath("$.canStart").isEqualTo(false);
    }

    @Test
    void playersJoinByCodeAndGetFreeSeatsAndColors() throws Exception {
        String ana = login("Ana");
        Room room = createRoom(ana, "CLASSIC");
        String bia = login("Bia");

        MvcTestResult joined = join(bia, room.code().toLowerCase());

        assertThat(joined).hasStatusOk();
        assertThat(joined).bodyJson().extractingPath("$.players[1].nickname").isEqualTo("Bia");
        assertThat(joined).bodyJson().extractingPath("$.players[1].seat").isEqualTo(1);
        assertThat(joined).bodyJson().extractingPath("$.players[1].pawnColor").isEqualTo("AMARELO");
        assertThat(join(bia, room.code())).bodyJson().extractingPath("$.players.length()").isEqualTo(2);
    }

    @Test
    void unknownCodeAndOutsidersSeeNothing() throws Exception {
        String ana = login("Ana");
        Room room = createRoom(ana, "CLASSIC");
        String intruso = login("Intruso");

        assertThat(join(intruso, "ZZZZZZ")).hasStatus(HttpStatus.NOT_FOUND);
        assertThat(mvc.get().uri("/api/games/" + room.id()).header(HttpHeaders.AUTHORIZATION, intruso).exchange())
                .hasStatus(HttpStatus.NOT_FOUND);
    }

    @Test
    void roomHoldsAtMostFourPlayers() throws Exception {
        String host = login("Host");
        Room room = createRoom(host, "CLASSIC");
        for (String nick : new String[] {"Dois", "Tres", "Quatro"}) {
            assertThat(join(login(nick), room.code())).hasStatusOk();
        }

        MvcTestResult fifth = join(login("Cinco"), room.code());

        assertThat(fifth).hasStatus(HttpStatus.CONFLICT);
        assertThat(fifth).bodyJson().extractingPath("$.detail").isEqualTo("A sala está cheia.");
    }

    @Test
    void avatarsMayRepeatButColorsMayNot() throws Exception {
        String ana = login("Ana");
        Room room = createRoom(ana, "CLASSIC");
        String bia = login("Bia");
        join(bia, room.code());
        String uri = "/api/games/" + room.id() + "/me";

        MvcTestResult sameAvatar = put(bia, uri, "{\"avatarId\":\"avatar-1\",\"pawnColor\":\"ROXO\"}");
        assertThat(sameAvatar).hasStatusOk();
        assertThat(sameAvatar).bodyJson().extractingPath("$.players[1].pawnColor").isEqualTo("ROXO");

        MvcTestResult takenColor = put(bia, uri, "{\"avatarId\":\"avatar-2\",\"pawnColor\":\"VERDE\"}");
        assertThat(takenColor).hasStatus(HttpStatus.CONFLICT);
        assertThat(put(bia, uri, "{\"avatarId\":\"avatar-9\",\"pawnColor\":\"AZUL\"}")).hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    void onlyTheHostStartsWithEveryoneReady() throws Exception {
        String ana = login("Ana");
        Room room = createRoom(ana, "CLASSIC");
        String startUri = "/api/games/" + room.id() + "/start";
        String readyUri = "/api/games/" + room.id() + "/me/ready";

        put(ana, readyUri, "{\"ready\":true}");
        assertThat(post(ana, startUri, "")).hasStatus(HttpStatus.CONFLICT);

        String bia = login("Bia");
        join(bia, room.code());
        assertThat(post(bia, startUri, "")).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(post(ana, startUri, "")).hasStatus(HttpStatus.CONFLICT);

        MvcTestResult biaReady = put(bia, readyUri, "{\"ready\":true}");
        assertThat(biaReady).bodyJson().extractingPath("$.canStart").isEqualTo(true);

        MvcTestResult started = post(ana, startUri, "");
        assertThat(started).hasStatusOk();
        assertThat(started).bodyJson().extractingPath("$.status").isEqualTo("IN_PROGRESS");
        assertThat(started).bodyJson().extractingPath("$.canStart").isEqualTo(false);
    }

    @Test
    void playersListTheirOpenGames() throws Exception {
        String ana = login("Ana");
        Room room = createRoom(ana, "CLASSIC");
        String bia = login("Bia");
        join(bia, room.code());

        MvcTestResult mine = mvc.get().uri("/api/games/mine").header(HttpHeaders.AUTHORIZATION, bia).exchange();

        assertThat(mine).hasStatusOk();
        assertThat(mine).bodyJson().extractingPath("$[0].gameId").isEqualTo(room.id());
        assertThat(mvc.get().uri("/api/games/mine").header(HttpHeaders.AUTHORIZATION, login("Outro")).exchange())
                .bodyJson().extractingPath("$.length()").isEqualTo(0);
    }

    @Test
    void startingCreatesTheEngineGameInSeatOrder() throws Exception {
        String ana = login("Ana");
        Room room = createRoom(ana, "QUICK");
        String bia = login("Bia");
        join(bia, room.code());
        put(ana, "/api/games/" + room.id() + "/me/ready", "{\"ready\":true}");
        put(bia, "/api/games/" + room.id() + "/me/ready", "{\"ready\":true}");

        post(ana, "/api/games/" + room.id() + "/start", "");

        GameState state = store.loadSnapshot(room.id()).orElseThrow();
        assertThat(state.players()).extracting(p -> p.nickname()).containsExactly("Ana", "Bia");
        assertThat(state.players()).allSatisfy(p -> assertThat(p.credits()).isEqualTo(1500));
        assertThat(state.version()).isEqualTo(1);
        assertThat(join(login("Atrasado"), room.code())).hasStatus(HttpStatus.CONFLICT);
    }
}
