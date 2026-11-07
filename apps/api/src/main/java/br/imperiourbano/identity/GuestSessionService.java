package br.imperiourbano.identity;

import br.imperiourbano.catalog.Catalog;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Sessões de convidado (D15): o jogador escolhe um apelido e recebe um token opaco, guardado no navegador
 * e usado para reconectar. Sem senha; o banco guarda só o hash do token.
 *
 * <p>Login com Google (07/11/2026): o jogador pode ligar uma conta Google. Cada entrada com Google gera um
 * token próprio em {@code session_tokens}, para o mesmo jogador jogar em vários aparelhos.
 */
@Service
public class GuestSessionService {

    public static final int NICKNAME_MIN = 2;
    public static final int NICKNAME_MAX = 20;
    private static final Pattern NICKNAME = Pattern.compile("[\\p{L}\\p{N} _.-]+");
    private static final Pattern NOT_NICKNAME = Pattern.compile("[^\\p{L}\\p{N} _.-]+");
    private static final String FALLBACK_NICKNAME = "Jogador";
    private static final int TOKEN_BYTES = 32;

    private final GuestSessionRepository sessions;
    private final GoogleIdentity google;
    private final JdbcTemplate jdbc;
    private final SecureRandom random = new SecureRandom();
    private final int startingCoins;

    GuestSessionService(GuestSessionRepository sessions, GoogleIdentity google, JdbcTemplate jdbc, Catalog catalog) {
        this.sessions = sessions;
        this.google = google;
        this.jdbc = jdbc;
        this.startingCoins = catalog.rules().economy().guestStartingCoins();
    }

    /** {@code token} só existe neste retorno; depois disso apenas o hash fica no banco. */
    public record NewSession(GuestPrincipal player, String token) {
    }

    /**
     * Resultado do login com Google. {@code outcome}: LINKED (o convidado atual ganhou a conta Google),
     * SIGNED_IN (a conta já era de um jogador, que passa a valer aqui) ou CREATED (jogador novo).
     */
    public record GoogleSignIn(NewSession session, String outcome, String email) {
    }

    /** Conta ligada ao jogador, para o menu mostrar "Entrar com Google" ou o e-mail. */
    public record Account(boolean google, String email) {
    }

    @Transactional
    public NewSession create(String rawNickname) {
        String nickname = normalizeNickname(rawNickname);
        String token = newToken();
        GuestSessionRecord record = new GuestSessionRecord(UUID.randomUUID().toString(), nickname, hash(token), startingCoins);
        sessions.save(record);
        return new NewSession(record.principal(), token);
    }

    @Transactional
    public Optional<GuestPrincipal> authenticate(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        String tokenHash = hash(token);
        Optional<GuestPrincipal> guest = sessions.findByTokenHash(tokenHash).map(record -> {
            if (record.touch(Instant.now())) sessions.save(record);
            return record.principal();
        });
        if (guest.isPresent()) return guest;
        Optional<GuestPrincipal> device = jdbc.query("""
                select g.player_id, g.nickname from session_tokens t
                join guest_sessions g on g.player_id = t.player_id
                where t.token_hash = ?""",
                (rs, i) -> new GuestPrincipal(rs.getString(1), rs.getString(2)), tokenHash).stream().findFirst();
        device.ifPresent(player -> jdbc.update("""
                update session_tokens set last_seen_at = now()
                where token_hash = ? and last_seen_at < now() - interval '1 minute'""", tokenHash));
        return device;
    }

    public boolean googleEnabled() {
        return google.enabled();
    }

    public String googleClientId() {
        return google.clientId();
    }

    /**
     * Entra com o ID token do Google. Conta já ligada: vale o jogador dela (o convidado atual, se houver,
     * fica como estava). Conta nova com convidado atual sem Google: liga a conta a ele, mantendo moedas,
     * vitórias e personagem. Sem convidado: cria um jogador com o primeiro nome do Google.
     */
    @Transactional
    public GoogleSignIn signInWithGoogle(String credential, GuestPrincipal current) {
        if (!google.enabled()) throw new GoogleLoginException("O login com Google não está configurado.");
        GoogleIdentity.GoogleAccount account = google.verify(credential)
                .orElseThrow(() -> new GoogleLoginException("Não foi possível confirmar a conta Google. Tente de novo."));

        String outcome;
        String playerId = playerOfGoogle(account.sub()).orElse(null);
        if (playerId != null) {
            outcome = "SIGNED_IN";
        } else if (current != null && jdbc.update(
                "update guest_sessions set google_sub = ?, email = ? where player_id = ? and google_sub is null",
                account.sub(), account.email(), current.playerId()) == 1) {
            playerId = current.playerId();
            outcome = "LINKED";
        } else {
            GuestSessionRecord record = new GuestSessionRecord(UUID.randomUUID().toString(),
                    nicknameFromGoogle(account.name()), hash(newToken()), startingCoins);
            sessions.saveAndFlush(record);
            playerId = record.principal().playerId();
            jdbc.update("update guest_sessions set google_sub = ?, email = ? where player_id = ?",
                    account.sub(), account.email(), playerId);
            outcome = "CREATED";
        }
        if (account.email() != null) {
            jdbc.update("update guest_sessions set email = ? where player_id = ?", account.email(), playerId);
        }

        String token = newToken();
        jdbc.update("insert into session_tokens (token_hash, player_id) values (?, ?)", hash(token), playerId);
        String nickname = jdbc.queryForObject("select nickname from guest_sessions where player_id = ?", String.class, playerId);
        return new GoogleSignIn(new NewSession(new GuestPrincipal(playerId, nickname), token), outcome, account.email());
    }

    public Account account(String playerId) {
        return jdbc.query("select google_sub is not null, email from guest_sessions where player_id = ?",
                (rs, i) -> new Account(rs.getBoolean(1), rs.getString(2)), playerId)
                .stream().findFirst().orElse(new Account(false, null));
    }

    /** Sair neste aparelho: apaga o token do aparelho (o token original do convidado não é apagado). */
    @Transactional
    public void signOut(String token) {
        if (token == null || token.isBlank()) return;
        jdbc.update("delete from session_tokens where token_hash = ?", hash(token));
    }

    private Optional<String> playerOfGoogle(String sub) {
        return jdbc.queryForList("select player_id from guest_sessions where google_sub = ?", String.class, sub)
                .stream().findFirst();
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

    /** Primeiro nome do Google adaptado às regras do apelido; sem nome aproveitável, "Jogador". */
    static String nicknameFromGoogle(String name) {
        if (name == null) return FALLBACK_NICKNAME;
        String cleaned = NOT_NICKNAME.matcher(Normalizer.normalize(name, Normalizer.Form.NFC)).replaceAll(" ")
                .strip().replaceAll("\\s+", " ");
        if (cleaned.length() > NICKNAME_MAX) cleaned = cleaned.substring(0, NICKNAME_MAX).strip();
        return cleaned.length() >= NICKNAME_MIN ? cleaned : FALLBACK_NICKNAME;
    }

    private String newToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
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
