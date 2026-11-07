package br.imperiourbano.lobby;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Personagem preferido do jogador (07/11/2026), escolhido no menu antes de entrar numa sala. Ao entrar ou
 * criar uma sala, o jogador já chega com esse avatar; a cor vale se ninguém da sala estiver com ela.
 */
@Service
public class CharacterPreferences {

    /** {@code pawnColor} nulo: sem preferência (fica com a primeira cor livre). */
    public record Character(String avatarId, PawnColor pawnColor) {
    }

    private final JdbcTemplate jdbc;

    CharacterPreferences(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public Character of(String playerId) {
        List<Character> found = jdbc.query("select avatar_id, pawn_color from guest_sessions where player_id = ?",
                (rs, i) -> new Character(rs.getString(1),
                        rs.getString(2) == null ? null : PawnColor.valueOf(rs.getString(2))),
                playerId);
        return found.isEmpty() ? new Character(LobbyService.DEFAULT_AVATAR, null) : found.getFirst();
    }

    @Transactional
    public Character save(String playerId, String avatarId, PawnColor pawnColor) {
        if (!LobbyService.AVATARS.contains(avatarId)) {
            throw new LobbyException(HttpStatus.BAD_REQUEST, "Avatar inválido.");
        }
        if (pawnColor == null) {
            throw new LobbyException(HttpStatus.BAD_REQUEST, "Escolha uma cor de peão.");
        }
        jdbc.update("update guest_sessions set avatar_id = ?, pawn_color = ? where player_id = ?",
                avatarId, pawnColor.name(), playerId);
        return new Character(avatarId, pawnColor);
    }
}
