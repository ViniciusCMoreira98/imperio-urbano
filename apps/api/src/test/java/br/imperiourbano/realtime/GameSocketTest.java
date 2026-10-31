package br.imperiourbano.realtime;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.engine.Dice;
import br.imperiourbano.engine.DiceRoll;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.WebSocket;
import java.net.http.WebSocketHandshakeException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

/** Servidor real + cliente WebSocket do JDK. Dados sempre 1 + 2: do Início, para no Amapá (livre). */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import({TestcontainersConfiguration.class, GameSocketTest.FixedDiceConfig.class})
class GameSocketTest {

    @TestConfiguration
    static class FixedDiceConfig {
        @Bean
        @Primary
        Dice fixedDice() {
            return () -> new DiceRoll(1, 2);
        }
    }

    @LocalServerPort
    int port;

    private final HttpClient http = HttpClient.newHttpClient();
    private String anaToken;
    private String biaToken;
    private String anaId;
    private String gameId;
    private Client ana;
    private Client bia;

    // ---------- REST ----------

    private String call(String method, String path, String token, String json) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(json == null ? "" : json));
        if (token != null) request.header("Authorization", "Bearer " + token);
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString()).body();
    }

    private static String field(String json, String name) {
        return json.replaceAll("(?s).*?\"" + name + "\":\"([^\"]+)\".*", "$1");
    }

    private String login(String nickname) throws Exception {
        return field(call("POST", "/api/sessions", null, "{\"nickname\":\"" + nickname + "\"}"), "token");
    }

    @BeforeEach
    void startedGameWithTwoPlayers() throws Exception {
        anaToken = login("Ana");
        biaToken = login("Bia");
        anaId = field(call("GET", "/api/sessions/me", anaToken, null), "playerId");
        String room = call("POST", "/api/games", anaToken, "{\"mode\":\"CLASSIC\"}");
        gameId = field(room, "gameId");
        call("POST", "/api/games/join", biaToken, "{\"inviteCode\":\"" + field(room, "inviteCode") + "\"}");
        call("PUT", "/api/games/" + gameId + "/me/ready", anaToken, "{\"ready\":true}");
        call("PUT", "/api/games/" + gameId + "/me/ready", biaToken, "{\"ready\":true}");
        call("POST", "/api/games/" + gameId + "/start", anaToken, null);
    }

    @AfterEach
    void closeClients() {
        for (Client client : new Client[] {ana, bia}) {
            if (client != null) client.socket.abort();
        }
    }

    // ---------- WebSocket ----------

    private static final class Client implements WebSocket.Listener {
        final BlockingQueue<String> messages = new LinkedBlockingQueue<>();
        private final StringBuilder partial = new StringBuilder();
        WebSocket socket;

        @Override
        public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
            partial.append(data);
            if (last) {
                messages.add(partial.toString());
                partial.setLength(0);
            }
            webSocket.request(1);
            return null;
        }

        void send(String json) {
            socket.sendText(json, true).join();
        }

        /** Próxima mensagem do tipo pedido, descartando as outras; falha após 5 s. */
        String next(String kind) throws InterruptedException {
            long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
            while (System.nanoTime() < deadline) {
                String message = messages.poll(100, TimeUnit.MILLISECONDS);
                if (message != null && message.contains("\"kind\":\"" + kind + "\"")) return message;
            }
            throw new AssertionError("Mensagem " + kind + " não recebida");
        }

        void drain() throws InterruptedException {
            Thread.sleep(200);
            messages.clear();
        }
    }

    private Client connect(String token) throws Exception {
        Client client = new Client();
        client.socket = http.newWebSocketBuilder()
                .buildAsync(URI.create("ws://localhost:" + port + "/ws/games/" + gameId + "?token=" + token), client)
                .get(5, TimeUnit.SECONDS);
        return client;
    }

    private static String command(String commandId, long expectedVersion, String commandJson) {
        return "{\"commandId\":\"" + commandId + "\",\"expectedVersion\":" + expectedVersion
                + ",\"command\":" + commandJson + "}";
    }

    private static final String ROLL = "{\"type\":\"ROLL_DICE\"}";

    // ---------- testes ----------

    @Test
    void connectingSendsThePublicSnapshot() throws Exception {
        ana = connect(anaToken);

        String snapshot = ana.next("SNAPSHOT");

        assertThat(snapshot)
                .contains("\"version\":1", "\"phase\":\"AWAITING_ROLL\"", "\"currentPlayerId\":\"" + anaId + "\"")
                .contains("\"pawnColor\":\"VERDE\"", "\"connected\":true")
                .doesNotContain("eventDeck", "festa-junina");
    }

    @Test
    void appliedCommandReachesEveryPlayer() throws Exception {
        ana = connect(anaToken);
        bia = connect(biaToken);
        ana.drain();
        bia.drain();

        ana.send(command("c1", 1, ROLL));

        for (Client client : new Client[] {ana, bia}) {
            assertThat(client.next("EVENTS")).contains("\"DICE_ROLLED\"", "\"PLAYER_MOVED\"", "\"to\":3");
            assertThat(client.next("SNAPSHOT")).contains("\"version\":3", "\"phase\":\"AWAITING_PURCHASE\"");
        }
    }

    @Test
    void ruleViolationGoesOnlyToTheSender() throws Exception {
        ana = connect(anaToken);
        bia = connect(biaToken);
        ana.drain();
        bia.drain();

        bia.send(command("b1", 1, ROLL));

        assertThat(bia.next("COMMAND_REJECTED")).contains("\"commandId\":\"b1\"", "Não é a sua vez.");
        assertThat(ana.messages.poll(300, TimeUnit.MILLISECONDS)).isNull();
    }

    @Test
    void resendingACommandDoesNotApplyItTwice() throws Exception {
        ana = connect(anaToken);
        ana.drain();
        ana.send(command("same", 1, ROLL));
        ana.next("EVENTS");
        ana.next("SNAPSHOT");

        ana.send(command("same", 1, ROLL));

        assertThat(ana.next("SNAPSHOT")).contains("\"version\":3");
        assertThat(ana.messages.poll(300, TimeUnit.MILLISECONDS)).isNull();
    }

    @Test
    void staleVersionIsRejectedWithFreshSnapshot() throws Exception {
        ana = connect(anaToken);
        ana.drain();

        ana.send(command("old", 0, ROLL));

        assertThat(ana.next("COMMAND_REJECTED")).contains("A partida mudou");
        assertThat(ana.next("SNAPSHOT")).contains("\"version\":1");
    }

    @Test
    void reconnectingResumesTheSameGameWithoutExtraTime() throws Exception {
        ana = connect(anaToken);
        ana.drain();
        ana.send(command("r1", 1, ROLL));
        String before = ana.next("SNAPSHOT");
        ana.socket.abort();

        ana = connect(anaToken);
        String after = ana.next("SNAPSHOT");

        assertThat(after).contains("\"version\":3", "\"phase\":\"AWAITING_PURCHASE\"", "\"connected\":true");
        assertThat(timeLeft(after)).isLessThanOrEqualTo(timeLeft(before));
    }

    private static long timeLeft(String snapshot) {
        return Long.parseLong(snapshot.replaceAll("(?s).*\"turnTimeLeftMs\":(\\d+).*", "$1"));
    }

    @Test
    void othersSeeWhoDisconnected() throws Exception {
        ana = connect(anaToken);
        bia = connect(biaToken);
        ana.drain();

        bia.socket.sendClose(WebSocket.NORMAL_CLOSURE, "saindo").join();

        String snapshot = ana.next("SNAPSHOT");
        String biaEntry = snapshot.replaceAll("(?s).*(\\{[^{}]*\"nickname\":\"Bia\"[^{}]*\\}).*", "$1");
        assertThat(biaEntry).contains("\"connected\":false");
        bia = null;
    }

    @Test
    void malformedMessageIsRejected() throws Exception {
        ana = connect(anaToken);
        ana.drain();

        ana.send("{isso não é json");

        assertThat(ana.next("COMMAND_REJECTED")).contains("Mensagem inválida.");
    }

    @Test
    void handshakeRequiresAValidMemberToken() throws Exception {
        assertThat(handshakeStatus("token-invalido")).isEqualTo(401);
        assertThat(handshakeStatus(login("Intruso"))).isEqualTo(404);
    }

    private int handshakeStatus(String token) throws Exception {
        try {
            connect(token).socket.abort();
            return 101;
        } catch (ExecutionException e) {
            assertThat(e.getCause()).isInstanceOf(WebSocketHandshakeException.class);
            return ((WebSocketHandshakeException) e.getCause()).getResponse().statusCode();
        }
    }

    @Test
    void lobbyGamesHaveNoChannelYet() throws Exception {
        String room = call("POST", "/api/games", anaToken, "{}");
        gameId = field(room, "gameId");

        assertThat(handshakeStatus(anaToken)).isEqualTo(409);
    }
}
