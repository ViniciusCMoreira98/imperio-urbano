package br.imperiourbano.identity;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface GuestSessionRepository extends JpaRepository<GuestSessionRecord, String> {

    Optional<GuestSessionRecord> findByTokenHash(String tokenHash);
}
