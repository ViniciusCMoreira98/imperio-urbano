package br.imperiourbano.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.domain.Persistable;

/** Somente inserção: o log de eventos nunca é reescrito. */
@Entity
@Table(name = "game_events")
@IdClass(GameEventRecord.Key.class)
class GameEventRecord implements Persistable<GameEventRecord.Key> {

    record Key(String gameId, long sequence) implements Serializable {
    }

    @Id
    @Column(name = "game_id")
    private String gameId;

    @Id
    private long sequence;

    @Column(nullable = false)
    private String type;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String payload;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Transient
    private boolean isNew = true;

    protected GameEventRecord() {
    }

    GameEventRecord(String gameId, long sequence, String type, String payload) {
        this.gameId = gameId;
        this.sequence = sequence;
        this.type = type;
        this.payload = payload;
        this.createdAt = Instant.now();
    }

    String payload() {
        return payload;
    }

    @Override
    public Key getId() {
        return new Key(gameId, sequence);
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    void markLoaded() {
        isNew = false;
    }
}
