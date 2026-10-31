package br.imperiourbano.identity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Duration;
import java.time.Instant;

@Entity
@Table(name = "guest_sessions")
class GuestSessionRecord {

    /** Evita uma escrita no banco a cada requisição só para registrar o último acesso. */
    private static final Duration LAST_SEEN_RESOLUTION = Duration.ofMinutes(1);

    @Id
    @Column(name = "player_id")
    private String playerId;

    @Column(nullable = false)
    private String nickname;

    @Column(name = "token_hash", nullable = false, unique = true, columnDefinition = "bpchar(64)")
    private String tokenHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    protected GuestSessionRecord() {
    }

    GuestSessionRecord(String playerId, String nickname, String tokenHash) {
        this.playerId = playerId;
        this.nickname = nickname;
        this.tokenHash = tokenHash;
        this.createdAt = Instant.now();
        this.lastSeenAt = createdAt;
    }

    /** Retorna verdadeiro se o registro mudou e precisa ser salvo. */
    boolean touch(Instant now) {
        if (Duration.between(lastSeenAt, now).compareTo(LAST_SEEN_RESOLUTION) < 0) return false;
        lastSeenAt = now;
        return true;
    }

    GuestPrincipal principal() {
        return new GuestPrincipal(playerId, nickname);
    }
}
