package br.imperiourbano.game;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.RulesConfig;
import br.imperiourbano.engine.Dice;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.RandomDice;
import java.time.Duration;
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

    /** Tempo sem ninguém conectado até encerrar a partida (rules.json); testes usam um tempo curto. */
    @Bean
    AbandonmentWatcher.Policy abandonmentPolicy(Catalog catalog) {
        return new AbandonmentWatcher.Policy(Duration.ofSeconds(catalog.rules().abandonment().seconds()));
    }

    /** Prazos vindos de rules.json; testes substituem por prazos curtos. */
    @Bean
    TurnTimeouts turnTimeouts(Catalog catalog) {
        RulesConfig.TurnTimers timers = catalog.rules().turnTimers();
        return new TurnTimeouts(Duration.ofSeconds(timers.rollSeconds()), Duration.ofSeconds(timers.decisionSeconds()),
                Duration.ofSeconds(timers.automaticSeconds()));
    }
}
