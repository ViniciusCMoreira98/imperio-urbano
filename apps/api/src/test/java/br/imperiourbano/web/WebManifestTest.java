package br.imperiourbano.web;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

/** App instalável: o manifesto sai do servidor real (Tomcat) com o tipo que os navegadores esperam. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
class WebManifestTest {

    @LocalServerPort
    int port;

    @Test
    void manifestIsServedAsManifestJsonWithoutLogin() {
        ResponseEntity<String> response = RestClient.create("http://localhost:" + port)
                .get().uri("/probe.webmanifest").retrieve().toEntity(String.class);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getHeaders().getContentType()).hasToString("application/manifest+json");
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-cache");
    }
}
