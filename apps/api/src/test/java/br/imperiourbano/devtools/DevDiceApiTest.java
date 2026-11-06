package br.imperiourbano.devtools;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.engine.DiceRoll;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.game.CommandEnvelope;
import br.imperiourbano.game.GameService;
import java.util.UUID;
import org.junit.jupiter.api.Nested;
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

/** O lance escolhido só existe com as ferramentas de desenvolvedor ligadas. */
class DevDiceApiTest {

    abstract static class Base {
        @Autowired
        MockMvcTester mvc;

        @Autowired
        GameService games;

        String login(String nickname) throws Exception {
            String body = mvc.post().uri("/api/sessions").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"nickname\":\"" + nickname + "\"}").exchange().getResponse().getContentAsString();
            return "Bearer " + body.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
        }

        String playerId(String auth) throws Exception {
            String body = mvc.get().uri("/api/sessions/me").header(HttpHeaders.AUTHORIZATION, auth).exchange()
                    .getResponse().getContentAsString();
            return body.replaceAll(".*\"playerId\":\"([^\"]+)\".*", "$1");
        }

        MvcTestResult post(String auth, String uri, String json) {
            return mvc.post().uri(uri).header(HttpHeaders.AUTHORIZATION, auth)
                    .contentType(MediaType.APPLICATION_JSON).content(json).exchange();
        }

        static String field(MvcTestResult result, String name) throws Exception {
            return result.getResponse().getContentAsString().replaceAll(".*?\"" + name + "\":\"([^\"]+)\".*", "$1");
        }

        /** Partida de dois jogadores já começada; devolve o id. */
        String startedGame(String ana, String bia) throws Exception {
            MvcTestResult created = post(ana, "/api/games", "{\"mode\":\"CLASSIC\"}");
            String id = field(created, "gameId");
            post(bia, "/api/games/join", "{\"inviteCode\":\"" + field(created, "inviteCode") + "\"}");
            for (String auth : new String[] {ana, bia}) {
                mvc.put().uri("/api/games/" + id + "/me/ready").header(HttpHeaders.AUTHORIZATION, auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"ready\":true}").exchange();
            }
            assertThat(post(ana, "/api/games/" + id + "/start", "")).hasStatusOk();
            return id;
        }
    }

    @Nested
    @SpringBootTest
    @AutoConfigureMockMvc
    @Import(TestcontainersConfiguration.class)
    class Disabled extends Base {
        @Test
        void routeDoesNotExistByDefault() throws Exception {
            String ana = login("Ana");
            String id = startedGame(ana, login("Bia"));
            assertThat(post(ana, "/api/dev/games/" + id + "/next-dice", "{\"first\":3,\"second\":5}"))
                    .hasStatus(HttpStatus.NOT_FOUND);
        }
    }

    @Nested
    @SpringBootTest(properties = "app.dev-tools.enabled=true")
    @AutoConfigureMockMvc
    @Import(TestcontainersConfiguration.class)
    class Enabled extends Base {
        @Test
        void nextRollUsesTheChosenFacesOnce() throws Exception {
            String ana = login("Ana");
            String bia = login("Bia");
            String id = startedGame(ana, bia);
            var state = games.current(id).orElseThrow();
            String current = state.currentPlayer().id();
            String auth = current.equals(playerId(ana)) ? ana : bia;

            assertThat(post(auth, "/api/dev/games/" + id + "/next-dice", "{\"first\":3,\"second\":5}"))
                    .hasStatus(HttpStatus.NO_CONTENT);
            var outcome = games.execute(id, current,
                    new CommandEnvelope(UUID.randomUUID().toString(), state.version(), new GameCommand.RollDice()));

            assertThat(outcome.state().lastDice()).isEqualTo(new DiceRoll(3, 5));
        }

        @Test
        void rejectsInvalidFacesAndOutsiders() throws Exception {
            String ana = login("Ana");
            String id = startedGame(ana, login("Bia"));
            assertThat(post(ana, "/api/dev/games/" + id + "/next-dice", "{\"first\":7,\"second\":1}"))
                    .hasStatus(HttpStatus.BAD_REQUEST);
            assertThat(post(login("Caio"), "/api/dev/games/" + id + "/next-dice", "{\"first\":1,\"second\":1}"))
                    .hasStatus(HttpStatus.FORBIDDEN);
        }
    }
}
