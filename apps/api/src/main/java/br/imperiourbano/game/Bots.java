package br.imperiourbano.game;

import java.util.List;

/**
 * Jogadores do servidor para partidas contra bots (pedido do usuário, 10/11/2026). São contas fixas
 * (migração V12) sem login: ocupam assentos e o servidor joga por eles com {@link BotPolicy}.
 */
public final class Bots {

    public static final List<String> IDS = List.of("bot-1", "bot-2", "bot-3");
    /** Mesmos apelidos gravados na migração V12. */
    private static final List<String> NICKNAMES = List.of("Bot Sabiá", "Bot Jabuti", "Bot Caju");
    /** Quanto o bot "pensa" antes de agir, contado depois que a mesa mostra a jogada anterior. */
    public static final java.time.Duration THINK = java.time.Duration.ofMillis(1200);

    private Bots() {
    }

    public static String nickname(String botId) {
        return NICKNAMES.get(IDS.indexOf(botId));
    }

    public static boolean isBot(String playerId) {
        return playerId != null && IDS.contains(playerId);
    }
}
