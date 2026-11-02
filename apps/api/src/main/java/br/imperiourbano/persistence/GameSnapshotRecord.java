package br.imperiourbano.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "game_snapshots")
class GameSnapshotRecord {

    @Id
    @Column(name = "game_id")
    private String gameId;

    @Column(nullable = false)
    private long version;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String state;

    @Column(name = "board_version", nullable = false)
    private int boardVersion;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GameSnapshotRecord() {
    }

    GameSnapshotRecord(String gameId) {
        this.gameId = gameId;
    }

    void update(long newVersion, String newState, int newBoardVersion) {
        this.version = newVersion;
        this.state = newState;
        this.boardVersion = newBoardVersion;
        this.updatedAt = Instant.now();
    }

    String state() {
        return state;
    }

    int boardVersion() {
        return boardVersion;
    }
}
