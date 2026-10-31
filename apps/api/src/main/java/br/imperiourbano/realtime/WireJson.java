package br.imperiourbano.realtime;

import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.persistence.GameJson;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.Arrays;
import java.util.stream.Stream;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.jsontype.NamedType;

/**
 * JSON trocado com o navegador (protocolo de packages/shared-types/src/protocol.ts).
 * Eventos e comandos levam {@code type} em MAIÚSCULAS; a ordem do baralho nunca sai do servidor.
 */
final class WireJson {

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    private interface TypedMixin {
    }

    /** Informação oculta: o cliente não pode saber a ordem das cartas. */
    @JsonIgnoreProperties("eventDeck")
    private interface GameStartedMixin {
    }

    static final JsonMapper MAPPER = JsonMapper.builder()
            .addMixIn(GameEvent.class, TypedMixin.class)
            .addMixIn(GameCommand.class, TypedMixin.class)
            .addMixIn(GameEvent.GameStarted.class, GameStartedMixin.class)
            .registerSubtypes(Stream.of(GameEvent.class, GameCommand.class)
                    .flatMap(base -> Arrays.stream(base.getPermittedSubclasses()))
                    .map(type -> new NamedType(type, GameJson.typeName(type)))
                    .toArray(NamedType[]::new))
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();

    private WireJson() {
    }
}
