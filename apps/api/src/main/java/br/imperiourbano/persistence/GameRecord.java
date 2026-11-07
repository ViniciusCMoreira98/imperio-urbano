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

    /** Aposta de cada jogador (0 = sem aposta, partidas antigas). */
    @Column(nullable = false, updatable = false)
    private int stake;

    /** Aparece na lista de salas públicas (entrada sem código). */
    @Column(name = "public_room", nullable = false, updatable = false)
    private boolean publicRoom;

    @Column(name = "host_player_id")
    private String hostPlayerId;

    /** Fim da contagem do início automático (só na sala; nulo com menos de 2 jogadores). */
    @Column(name = "starts_at")
    private Instant startsAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GameRecord() {
    }

    GameRecord(String id, String inviteCode, String mode, String status, String hostPlayerId, int stake, boolean publicRoom) {
        this.id = id;
        this.publicRoom = publicRoom;
        this.stake = stake;
        this.inviteCode = inviteCode;
        this.mode = mode;
        this.status = status;
        this.hostPlayerId = hostPlayerId;
        this.createdAt = Instant.now();
        this.updatedAt = createdAt;
    }

    GameInfo info() {
        return new GameInfo(id, inviteCode, mode, status, version, hostPlayerId, stake, publicRoom, createdAt);
    }
}
