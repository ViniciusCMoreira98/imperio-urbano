package br.imperiourbano.game;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.engine.Dice;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.RandomDice;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class GameEngineConfig {

    /** O motor é imutável e sem estado de partida: uma instância serve a todas as salas. */
    @Bean
    GameEngine gameEngine(Catalog catalog) {
        return new GameEngine(catalog);
    }

    /** Dados do servidor (o cliente nunca decide o resultado). Testes substituem por dados fixos. */
    @Bean
    Dice dice() {
        return new RandomDice();
    }
}
