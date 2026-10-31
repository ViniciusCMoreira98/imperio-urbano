package br.imperiourbano.identity;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
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
class SessionApiTest {

    @Autowired
    MockMvcTester mvc;

    private MvcTestResult createSession(String nicknameJson) {
        return mvc.post().uri("/api/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nickname\": " + nicknameJson + "}")
                .exchange();
    }

    private String tokenOf(MvcTestResult result) throws Exception {
        String body = result.getResponse().getContentAsString();
        return body.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
    }

    @Test
    void createsGuestSessionWithNormalizedNickname() throws Exception {
        MvcTestResult result = createSession("\"  Ana   Paula \"");

        assertThat(result).hasStatus(HttpStatus.CREATED);
        assertThat(result).bodyJson().extractingPath("$.nickname").isEqualTo("Ana Paula");
        assertThat(result).bodyJson().extractingPath("$.playerId").asString().hasSize(36);
        assertThat(tokenOf(result)).hasSize(43);
    }

    @Test
    void tokenIdentifiesThePlayer() throws Exception {
        MvcTestResult created = createSession("\"Bia\"");
        String playerId = created.getResponse().getContentAsString().replaceAll(".*\"playerId\":\"([^\"]+)\".*", "$1");

        MvcTestResult me = mvc.get().uri("/api/sessions/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOf(created))
                .exchange();

        assertThat(me).hasStatusOk();
        assertThat(me).bodyJson().extractingPath("$.playerId").isEqualTo(playerId);
        assertThat(me).bodyJson().extractingPath("$.nickname").isEqualTo("Bia");
        assertThat(me.getResponse().getContentAsString()).doesNotContain("token");
    }

    @Test
    void missingOrUnknownTokenIsUnauthorized() throws Exception {
        assertThat(mvc.get().uri("/api/sessions/me").exchange()).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/api/sessions/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token-que-nao-existe")
                .exchange()).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void otherRoutesRequireASession() throws Exception {
        assertThat(mvc.get().uri("/api/games").exchange()).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void sameNicknameGetsDistinctPlayers() throws Exception {
        String first = createSession("\"Caio\"").getResponse().getContentAsString();
        String second = createSession("\"Caio\"").getResponse().getContentAsString();

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    void invalidNicknamesAreRejected() throws Exception {
        MvcTestResult tooShort = createSession("\"A\"");
        assertThat(tooShort).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(tooShort).bodyJson().extractingPath("$.detail").isEqualTo("O apelido deve ter de 2 a 20 caracteres.");

        assertThat(createSession("\"<script>\"")).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(createSession("null")).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(createSession("\"" + "x".repeat(21) + "\"")).hasStatus(HttpStatus.BAD_REQUEST);
    }
}
