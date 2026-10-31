package br.imperiourbano.catalog;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class CatalogConfig {

    @Bean
    Catalog catalog() {
        return CatalogLoader.load();
    }
}
