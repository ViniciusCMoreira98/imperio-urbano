package br.imperiourbano;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.catalog.Catalog;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class ImperioUrbanoApplicationTests {

    @Autowired
    Catalog catalog;

    @Test
    void contextLoadsWithCatalogAndDatabase() {
        assertThat(catalog.states()).hasSize(27);
    }
}
