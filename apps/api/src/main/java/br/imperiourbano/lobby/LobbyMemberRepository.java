package br.imperiourbano.lobby;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface LobbyMemberRepository extends JpaRepository<LobbyMemberRecord, LobbyMemberRecord.Key> {

    List<LobbyMemberRecord> findByGameIdOrderBySeatAsc(String gameId);
}
