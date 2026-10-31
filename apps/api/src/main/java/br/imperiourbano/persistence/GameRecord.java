package br.imperiourbano.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "games")
class GameRecord {

    @Id
    private String id;

    @Column(name = "invite_code", nullable = false, unique = true)
    private String inviteCode;

    @Column(nullable = false)
    private String mode;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GameRecord() {
    }

    GameRecord(String id, String inviteCode, String mode, String status) {
        this.id = id;
        this.inviteCode = inviteCode;
        this.mode = mode;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = createdAt;
    }
}
