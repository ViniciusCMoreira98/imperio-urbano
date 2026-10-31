package br.imperiourbano.catalog;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import tools.jackson.databind.json.JsonMapper;

/** Lê os JSON de packages/game-data, copiados para o classpath em {@code game-data/} pelo build. */
public final class CatalogLoader {

    private static final String BASE = "game-data/";
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private record StatesFile(int version, List<StateDefinition> states) {
    }

    private record EventsFile(int version, List<EventCard> cards) {
    }

    private CatalogLoader() {
    }

    /** Carrega e valida; falha imediatamente se o catálogo for inconsistente. */
    public static Catalog load() {
        Catalog catalog = new Catalog(
                read("states.json", StatesFile.class).states(),
                read("board.json", BoardDefinition.class),
                read("rules.json", RulesConfig.class),
                read("events.json", EventsFile.class).cards());
        List<String> errors = CatalogValidator.validate(catalog);
        if (!errors.isEmpty()) {
            throw new IllegalStateException("Catálogo inválido:\n- " + String.join("\n- ", errors));
        }
        return catalog;
    }

    private static <T> T read(String file, Class<T> type) {
        try (InputStream in = CatalogLoader.class.getClassLoader().getResourceAsStream(BASE + file)) {
            if (in == null) {
                throw new IllegalStateException("Arquivo do catálogo não encontrado no classpath: " + BASE + file);
            }
            return MAPPER.readValue(in, type);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
