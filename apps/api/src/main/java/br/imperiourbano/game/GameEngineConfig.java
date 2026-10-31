package br.imperiourbano.game;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.engine.GameEngine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class GameEngineConfig {

    /** O motor é imutável e sem estado de partida: uma instância serve a todas as salas. */
    @Bean
    GameEngine gameEngine(Catalog catalog) {
        return new GameEngine(catalog);
    }
}
