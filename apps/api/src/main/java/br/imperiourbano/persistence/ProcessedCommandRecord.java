package br.imperiourbano.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.Instant;
import org.springframework.data.domain.Persistable;

/** Somente inserção: {@link #isNew()} força INSERT, para que um id repetido viole a chave primária. */
@Entity
@Table(name = "processed_commands")
class ProcessedCommandRecord implements Persistable<String> {

    @Id
    @Column(name = "command_id")
    private String commandId;

    @Column(name = "game_id", nullable = false)
    private String gameId;

    @Column(name = "player_id", nullable = false)
    private String playerId;

    @Column(name = "result_version", nullable = false)
    private long resultVersion;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;

    @Transient
    private boolean isNew = true;

    protected ProcessedCommandRecord() {
    }

    ProcessedCommandRecord(String commandId, String gameId, String playerId, long resultVersion) {
        this.commandId = commandId;
        this.gameId = gameId;
        this.playerId = playerId;
        this.resultVersion = resultVersion;
        this.processedAt = Instant.now();
    }

    long resultVersion() {
        return resultVersion;
    }

    @Override
    public String getId() {
        return commandId;
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
