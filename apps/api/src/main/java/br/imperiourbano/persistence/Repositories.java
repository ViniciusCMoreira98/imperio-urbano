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

    @Query("select g from GameRecord g where g.publicRoom = true and g.status = 'LOBBY' order by g.createdAt desc")
    List<GameRecord> findPublicLobbies(org.springframework.data.domain.Pageable page);

    /** Só as do tabuleiro atual: as de um tabuleiro antigo não continuam. */
    @Query("select g.id from GameRecord g where g.status = 'IN_PROGRESS' and g.id in "
            + "(select s.gameId from GameSnapshotRecord s where s.boardVersion = :boardVersion)")
    List<String> findInProgressIds(@Param("boardVersion") int boardVersion);

    /** Trava a linha da partida até o fim da transação (entradas simultâneas na mesma sala). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from GameRecord g where g.id = :id")
    Optional<GameRecord> lockById(@Param("id") String id);

    /** Novo anfitrião quando o atual sai da sala (só antes de começar). */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update GameRecord g set g.hostPlayerId = :host where g.id = :id and g.status = 'LOBBY'")
    int changeHost(@Param("id") String id, @Param("host") String host);

    /** Liga (horário) ou desliga (nulo) a contagem do início automático da sala. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update GameRecord g set g.startsAt = :startsAt where g.id = :id and g.status = 'LOBBY'")
    int setStartsAt(@Param("id") String id, @Param("startsAt") Instant startsAt);

    @Query("select g.startsAt from GameRecord g where g.id = :id")
    Optional<Instant> findStartsAt(@Param("id") String id);

    /** Salas com a contagem vencida, prontas para começar sozinhas. */
    @Query("select g.id from GameRecord g where g.status = 'LOBBY' and g.startsAt <= :now")
    List<String> findDueLobbies(@Param("now") Instant now);

    /** Sala que ficou vazia antes de começar; os assentos saem junto (ON DELETE CASCADE). */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from GameRecord g where g.id = :id and g.status = 'LOBBY'")
    int deleteLobby(@Param("id") String id);

    /**
     * Salas paradas: criadas antes de {@code cutoff}, ainda sem começar e sem contagem do início automático
     * ligada (quem acabou de completar 2 jogadores não perde a sala). Assentos saem junto (ON DELETE CASCADE).
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from GameRecord g where g.status = 'LOBBY' and g.startsAt is null and g.createdAt < :cutoff")
    int deleteStaleLobbies(@Param("cutoff") Instant cutoff);

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
