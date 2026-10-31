package br.imperiourbano;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.catalog.Catalog;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ImperioUrbanoApplicationTests {

    @Autowired
    Catalog catalog;

    @Test
    void contextLoadsWithCatalog() {
        assertThat(catalog.states()).hasSize(27);
    }
}
