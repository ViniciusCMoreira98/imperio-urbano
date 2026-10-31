package br.imperiourbano.lobby;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "game_players")
@IdClass(LobbyMemberRecord.Key.class)
class LobbyMemberRecord {

    record Key(String gameId, String playerId) implements Serializable {
    }

    @Id
    @Column(name = "game_id")
    private String gameId;

    @Id
    @Column(name = "player_id")
    private String playerId;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private short seat;

    @Column(name = "avatar_id", nullable = false)
    private String avatarId;

    @Enumerated(EnumType.STRING)
    @Column(name = "pawn_color", nullable = false)
    private PawnColor pawnColor;

    @Column(nullable = false)
    private boolean ready;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    protected LobbyMemberRecord() {
    }

    LobbyMemberRecord(String gameId, String playerId, String nickname, int seat, String avatarId, PawnColor pawnColor) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.nickname = nickname;
        this.seat = (short) seat;
        this.avatarId = avatarId;
        this.pawnColor = pawnColor;
        this.joinedAt = Instant.now();
    }

    void customize(String newAvatarId, PawnColor newColor) {
        this.avatarId = newAvatarId;
        this.pawnColor = newColor;
    }

    void setReady(boolean value) {
        this.ready = value;
    }

    String playerId() {
        return playerId;
    }

    String nickname() {
        return nickname;
    }

    int seat() {
        return seat;
    }

    String avatarId() {
        return avatarId;
    }

    PawnColor pawnColor() {
        return pawnColor;
    }

    boolean ready() {
        return ready;
    }
}
