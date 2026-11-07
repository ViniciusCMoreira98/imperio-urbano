package br.imperiourbano.persistence;

import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameStatus;

/** Dados da partida fora do motor: código de convite, anfitrião, aposta e versão gravada. */
public record GameInfo(String id, String inviteCode, GameMode mode, GameStatus status, long version, String hostPlayerId,
        int stake, boolean publicRoom, java.time.Instant createdAt) {

    GameInfo(String id, String inviteCode, String mode, String status, long version, String hostPlayerId, int stake,
            boolean publicRoom, java.time.Instant createdAt) {
        this(id, inviteCode, GameMode.valueOf(mode), GameStatus.valueOf(status), version, hostPlayerId, stake,
                publicRoom, createdAt);
    }
}
