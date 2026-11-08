package br.imperiourbano.web;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

/** Produção: site e saúde abertos; a API continua exigindo jogador autenticado. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class PublicSiteAccessTest {

    @Autowired
    MockMvcTester mvc;

    @Test
    void healthIsOpenForTheHost() {
        assertThat(mvc.get().uri("/actuator/health").exchange()).hasStatusOk()
                .bodyJson().extractingPath("$.status").isEqualTo("UP");
    }

    @Test
    void siteFilesDoNotRequireLogin() {
        // Nos testes não há build do site: o arquivo falta (404), mas não é barrado (401).
        assertThat(mvc.get().uri("/index.html").exchange().getResponse().getStatus()).isNotEqualTo(401);
        assertThat(mvc.get().uri("/assets/index-abc.js").exchange().getResponse().getStatus()).isNotEqualTo(401);
        assertThat(mvc.get().uri("/models/board/x.glb").exchange().getResponse().getStatus()).isNotEqualTo(401);
    }

    @Test
    void foldersOfTheSiteAreServedFromTheirOwnFolder(@Autowired org.springframework.core.io.ResourceLoader loader) throws Exception {
        // Um arquivo de teste em static/models/ precisa sair em /models/ (e não ser procurado em static/).
        assertThat(loader.getResource("classpath:/static/models/probe.txt").exists()).isTrue();
        assertThat(mvc.get().uri("/models/probe.txt").exchange()).hasStatusOk()
                .hasHeader("Cache-Control", "no-cache");
        assertThat(mvc.get().uri("/assets/probe.txt").exchange()).hasStatusOk()
                .hasHeader("Cache-Control", "max-age=31536000, public, immutable");
    }

    @Test
    void apiStillRequiresAPlayer() {
        assertThat(mvc.get().uri("/api/wallet").exchange()).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/api/games/public").exchange()).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void otherActuatorEndpointsAreNotExposed() {
        assertThat(mvc.get().uri("/actuator/env").exchange().getResponse().getStatus()).isIn(401, 404);
        assertThat(mvc.get().uri("/actuator/beans").exchange().getResponse().getStatus()).isIn(401, 404);
    }
}
