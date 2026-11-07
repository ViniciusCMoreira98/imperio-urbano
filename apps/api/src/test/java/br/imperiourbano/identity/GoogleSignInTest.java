package br.imperiourbano.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import br.imperiourbano.TestcontainersConfiguration;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

/** Login com Google com o verificador simulado: "cred-X" vira a conta Google de sub "X". */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class GoogleSignInTest {

    @Autowired
    MockMvcTester mvc;

    @MockitoBean
    GoogleIdentity google;

    @BeforeEach
    void fakeGoogle() {
        given(google.enabled()).willReturn(true);
        given(google.clientId()).willReturn("cliente-teste.apps.googleusercontent.com");
        given(google.verify(anyString())).willAnswer(call -> {
            String credential = call.getArgument(0);
            if (!credential.startsWith("cred-")) return Optional.empty();
            String sub = credential.substring(5);
            return Optional.of(new GoogleIdentity.GoogleAccount(sub, sub + "@gmail.com", "Maria Clara",
                    "https://lh3.googleusercontent.com/a/" + sub));
        });
    }

    private static String field(MvcTestResult result, String name) throws Exception {
        return result.getResponse().getContentAsString().replaceAll(".*\"" + name + "\":\"([^\"]*)\".*", "$1");
    }

    private MvcTestResult guest(String nickname) {
        return mvc.post().uri("/api/sessions").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nickname\":\"" + nickname + "\"}").exchange();
    }

    private MvcTestResult signIn(String credential, String token) {
        var request = mvc.post().uri("/api/sessions/google").contentType(MediaType.APPLICATION_JSON)
                .content("{\"credential\":\"" + credential + "\"}");
        if (token != null) request = request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        return request.exchange();
    }

    private MvcTestResult me(String token) {
        return mvc.get().uri("/api/sessions/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + token).exchange();
    }

    private static String unique() {
        return java.util.UUID.randomUUID().toString();
    }

    @Test
    void configExposesTheClientId() {
        assertThat(mvc.get().uri("/api/sessions/config").exchange())
                .bodyJson().extractingPath("$.googleClientId").isEqualTo("cliente-teste.apps.googleusercontent.com");
    }

    @Test
    void guestLinksGoogleAndKeepsThePlayer() throws Exception {
        MvcTestResult created = guest("Ana");
        String playerId = field(created, "playerId");
        String sub = unique();

        MvcTestResult linked = signIn("cred-" + sub, field(created, "token"));

        assertThat(linked).hasStatusOk();
        assertThat(field(linked, "playerId")).isEqualTo(playerId);
        assertThat(field(linked, "nickname")).isEqualTo("Ana");
        assertThat(field(linked, "outcome")).isEqualTo("LINKED");
        assertThat(me(field(linked, "token"))).bodyJson().extractingPath("$.google").isEqualTo(true);
        assertThat(me(field(linked, "token"))).bodyJson().extractingPath("$.email").isEqualTo(sub + "@gmail.com");
        assertThat(field(linked, "photoUrl")).isEqualTo("https://lh3.googleusercontent.com/a/" + sub);
        assertThat(me(field(linked, "token"))).bodyJson().extractingPath("$.photoUrl").isEqualTo("https://lh3.googleusercontent.com/a/" + sub);
        assertThat(me(field(created, "token"))).bodyJson().extractingPath("$.photoUrl").isEqualTo("https://lh3.googleusercontent.com/a/" + sub);
        // O token original do convidado continua valendo.
        assertThat(me(field(created, "token"))).hasStatusOk();
    }

    @Test
    void anotherDeviceRecoversTheSameAccount() throws Exception {
        MvcTestResult created = guest("Bia");
        String sub = unique();
        signIn("cred-" + sub, field(created, "token"));

        MvcTestResult otherDevice = signIn("cred-" + sub, null);

        assertThat(field(otherDevice, "playerId")).isEqualTo(field(created, "playerId"));
        assertThat(field(otherDevice, "outcome")).isEqualTo("SIGNED_IN");
        assertThat(me(field(otherDevice, "token"))).bodyJson().extractingPath("$.nickname").isEqualTo("Bia");
    }

    @Test
    void accountOfAnotherPlayerSwitchesAndLeavesTheGuestAlone() throws Exception {
        MvcTestResult owner = guest("Caio");
        String sub = unique();
        signIn("cred-" + sub, field(owner, "token"));
        MvcTestResult other = guest("Davi");

        MvcTestResult switched = signIn("cred-" + sub, field(other, "token"));

        assertThat(field(switched, "playerId")).isEqualTo(field(owner, "playerId"));
        assertThat(field(switched, "outcome")).isEqualTo("SIGNED_IN");
        assertThat(me(field(other, "token"))).bodyJson().extractingPath("$.google").isEqualTo(false);
    }

    @Test
    void newAccountWithoutGuestCreatesAPlayerWithTheGoogleName() throws Exception {
        MvcTestResult created = signIn("cred-" + unique(), null);

        assertThat(created).hasStatusOk();
        assertThat(field(created, "outcome")).isEqualTo("CREATED");
        assertThat(field(created, "nickname")).isEqualTo("Maria Clara");
        assertThat(mvc.get().uri("/api/wallet").header(HttpHeaders.AUTHORIZATION, "Bearer " + field(created, "token")).exchange())
                .hasStatusOk();
    }

    @Test
    void guestAlreadyLinkedToAnotherGoogleGetsANewPlayer() throws Exception {
        MvcTestResult created = guest("Eva");
        signIn("cred-" + unique(), field(created, "token"));

        MvcTestResult second = signIn("cred-" + unique(), field(created, "token"));

        assertThat(field(second, "outcome")).isEqualTo("CREATED");
        assertThat(field(second, "playerId")).isNotEqualTo(field(created, "playerId"));
    }

    @Test
    void invalidCredentialIsRejected() throws Exception {
        MvcTestResult rejected = signIn("falso", null);

        assertThat(rejected).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(rejected).bodyJson().extractingPath("$.detail").asString().contains("conta Google");
    }

    @Test
    void logoutEndsOnlyThisDevice() throws Exception {
        MvcTestResult created = guest("Gil");
        String sub = unique();
        MvcTestResult linked = signIn("cred-" + sub, field(created, "token"));
        MvcTestResult phone = signIn("cred-" + sub, null);

        assertThat(mvc.post().uri("/api/sessions/logout")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + field(phone, "token")).exchange()).hasStatus(HttpStatus.NO_CONTENT);

        assertThat(me(field(phone, "token"))).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(me(field(linked, "token"))).hasStatusOk();
    }

    @Test
    void googlePhotoShowsUpForTheSeatedPlayer() throws Exception {
        MvcTestResult guestOnly = guest("Hugo");
        MvcTestResult created = guest("Iris");
        String sub = unique();
        MvcTestResult linked = signIn("cred-" + sub, field(created, "token"));

        MvcTestResult room = mvc.post().uri("/api/games").contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + field(linked, "token")).content("{\"mode\":\"CLASSIC\"}").exchange();
        MvcTestResult joined = mvc.post().uri("/api/games/join").contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + field(guestOnly, "token"))
                .content("{\"inviteCode\":\"" + field(room, "inviteCode") + "\"}").exchange();

        assertThat(joined).bodyJson().extractingPath("$.players[0].photoUrl").isEqualTo("https://lh3.googleusercontent.com/a/" + sub);
        assertThat(joined).bodyJson().extractingPath("$.players[1].photoUrl").isNull();
    }

    @Test
    void onlyGooglePhotoUrlsAreKept() {
        assertThat(GuestSessionService.safePhotoUrl("https://lh3.googleusercontent.com/a/abc=s96-c")).isNotNull();
        assertThat(GuestSessionService.safePhotoUrl("http://lh3.googleusercontent.com/a/abc")).isNull();
        assertThat(GuestSessionService.safePhotoUrl("https://evil.com/googleusercontent.com.png")).isNull();
        assertThat(GuestSessionService.safePhotoUrl("https://googleusercontent.com.evil.com/a")).isNull();
        assertThat(GuestSessionService.safePhotoUrl("javascript:alert(1)")).isNull();
        assertThat(GuestSessionService.safePhotoUrl(null)).isNull();
    }

    @Test
    void googleNamesBecomeValidNicknames() {
        assertThat(GuestSessionService.nicknameFromGoogle("José")).isEqualTo("José");
        assertThat(GuestSessionService.nicknameFromGoogle("Ana ✨ <b>")).isEqualTo("Ana b");
        assertThat(GuestSessionService.nicknameFromGoogle("Maximiliano Alexandre Souza")).hasSizeLessThanOrEqualTo(20);
        assertThat(GuestSessionService.nicknameFromGoogle("✨")).isEqualTo("Jogador");
        assertThat(GuestSessionService.nicknameFromGoogle(null)).isEqualTo("Jogador");
    }
}
