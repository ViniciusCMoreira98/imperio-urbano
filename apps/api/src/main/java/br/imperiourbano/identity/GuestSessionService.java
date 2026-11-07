package br.imperiourbano.identity;

import br.imperiourbano.catalog.Catalog;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Sessões de convidado (D15): o jogador escolhe um apelido e recebe um token opaco, guardado no navegador
 * e usado para reconectar. Sem senha; o banco guarda só o hash do token.
 */
@Service
public class GuestSessionService {

    public static final int NICKNAME_MIN = 2;
    public static final int NICKNAME_MAX = 20;
    private static final Pattern NICKNAME = Pattern.compile("[\\p{L}\\p{N} _.-]+");
    private static final int TOKEN_BYTES = 32;

    private final GuestSessionRepository sessions;
    private final SecureRandom random = new SecureRandom();
    private final int startingCoins;

    GuestSessionService(GuestSessionRepository sessions, Catalog catalog) {
        this.sessions = sessions;
        this.startingCoins = catalog.rules().economy().guestStartingCoins();
    }

    /** {@code token} só existe neste retorno; depois disso apenas o hash fica no banco. */
    public record NewSession(GuestPrincipal player, String token) {
    }

    @Transactional
    public NewSession create(String rawNickname) {
        String nickname = normalizeNickname(rawNickname);
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        GuestSessionRecord record = new GuestSessionRecord(UUID.randomUUID().toString(), nickname, hash(token), startingCoins);
        sessions.save(record);
        return new NewSession(record.principal(), token);
    }

    @Transactional
    public Optional<GuestPrincipal> authenticate(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        return sessions.findByTokenHash(hash(token)).map(record -> {
            if (record.touch(Instant.now())) sessions.save(record);
            return record.principal();
        });
    }

    static String normalizeNickname(String raw) {
        String nickname = raw == null ? "" : raw.strip().replaceAll("\\s+", " ");
        if (nickname.length() < NICKNAME_MIN || nickname.length() > NICKNAME_MAX) {
            throw new InvalidNicknameException(
                    "O apelido deve ter de %d a %d caracteres.".formatted(NICKNAME_MIN, NICKNAME_MAX));
        }
        if (!NICKNAME.matcher(nickname).matches()) {
            throw new InvalidNicknameException("Use apenas letras, números, espaço, ponto, hífen ou sublinhado.");
        }
        return nickname;
    }

    private static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}
