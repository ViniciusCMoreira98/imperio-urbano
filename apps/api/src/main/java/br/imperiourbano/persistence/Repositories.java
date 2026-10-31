package br.imperiourbano.persistence;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface GameRecordRepository extends JpaRepository<GameRecord, String> {

    Optional<GameRecord> findByInviteCode(String inviteCode);

    @Query("select g.id from GameRecord g where g.status = 'IN_PROGRESS'")
    List<String> findInProgressIds();

    /** Trava a linha da partida até o fim da transação (entradas simultâneas na mesma sala). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from GameRecord g where g.id = :id")
    Optional<GameRecord> lockById(@Param("id") String id);

    /** Concorrência otimista: só avança se a versão no banco ainda for a esperada. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update GameRecord g set g.version = :newVersion, g.status = :status, g.updatedAt = :now"
            + " where g.id = :id and g.version = :expectedVersion")
    int advance(@Param("id") String id, @Param("expectedVersion") long expectedVersion,
            @Param("newVersion") long newVersion, @Param("status") String status, @Param("now") Instant now);
}

interface GameEventRecordRepository extends JpaRepository<GameEventRecord, GameEventRecord.Key> {

    List<GameEventRecord> findByGameIdOrderBySequenceAsc(String gameId);
}

interface GameSnapshotRecordRepository extends JpaRepository<GameSnapshotRecord, String> {
}

interface ProcessedCommandRecordRepository extends JpaRepository<ProcessedCommandRecord, String> {
}
