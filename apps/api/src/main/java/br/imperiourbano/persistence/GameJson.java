package br.imperiourbano.persistence;

import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.Arrays;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.jsontype.NamedType;

/**
 * Serialização de eventos e snapshots para o banco. O motor não conhece Jackson: o tipo do evento
 * é configurado aqui por mixin, com o nome em MAIÚSCULAS (ex.: DiceRolled → DICE_ROLLED), igual ao protocolo TS.
 */
public final class GameJson {

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    private interface GameEventMixin {
    }

    private static final JsonMapper MAPPER = JsonMapper.builder()
            .addMixIn(GameEvent.class, GameEventMixin.class)
            .registerSubtypes(Arrays.stream(GameEvent.class.getPermittedSubclasses())
                    .map(type -> new NamedType(type, typeName(type)))
                    .toArray(NamedType[]::new))
            // Métodos como DiceRoll.isDouble() viram propriedades derivadas no JSON; ignoradas na leitura.
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            // Snapshots salvos antes de um campo novo (ex.: apagão nas propriedades) leem o campo ausente como 0.
            .disable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
            .build();

    private GameJson() {
    }

    public static String typeName(Class<?> eventType) {
        return eventType.getSimpleName().replaceAll("([a-z])([A-Z])", "$1_$2").toUpperCase();
    }

    public static String write(GameEvent event) {
        return MAPPER.writerFor(GameEvent.class).writeValueAsString(event);
    }

    public static GameEvent readEvent(String json) {
        return MAPPER.readValue(json, GameEvent.class);
    }

    public static String write(GameState state) {
        return MAPPER.writeValueAsString(state);
    }

    public static GameState readState(String json) {
        return MAPPER.readValue(json, GameState.class);
    }
}
