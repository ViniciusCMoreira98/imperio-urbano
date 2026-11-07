package br.imperiourbano.wallet;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.RulesConfig.EconomyRules;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Carteira do jogador fora da partida (07/11/2026). Moedas: aposta das salas; o vencedor leva o pote.
 * Diamantes: comprados na loja (ainda não existe), só exibidos. Toda mudança de saldo é um UPDATE
 * atômico com condição, então duas cobranças simultâneas nunca deixam o saldo negativo.
 */
@Service
public class WalletService {

    /** O "dia" da recarga grátis segue o horário de Brasília. */
    static final ZoneId DAY_ZONE = ZoneId.of("America/Sao_Paulo");

    public record Wallet(long coins, long diamonds) {
    }

    private final JdbcTemplate jdbc;
    private final EconomyRules economy;

    WalletService(JdbcTemplate jdbc, Catalog catalog) {
        this.jdbc = jdbc;
        this.economy = catalog.rules().economy();
    }

    public List<Integer> stakes() {
        return economy.stakes();
    }

    public boolean validStake(int stake) {
        return economy.stakes().contains(stake);
    }

    /** Saldo atual, já com a recarga grátis do dia quando o jogador está abaixo do mínimo. */
    @Transactional
    public Wallet current(String playerId) {
        jdbc.update("""
                update guest_sessions set coins = ?, last_refill_on = ?
                where player_id = ? and coins < ? and (last_refill_on is null or last_refill_on < ?)""",
                economy.dailyRefill().amount(), today(), playerId, economy.dailyRefill().below(), today());
        return jdbc.queryForObject("select coins, diamonds from guest_sessions where player_id = ?",
                (rs, i) -> new Wallet(rs.getLong(1), rs.getLong(2)), playerId);
    }

    @Transactional(readOnly = true)
    public long coins(String playerId) {
        Long coins = jdbc.queryForObject("select coins from guest_sessions where player_id = ?", Long.class, playerId);
        return coins == null ? 0 : coins;
    }

    /** Desconta se houver saldo; retorna falso (sem mudar nada) se não houver. */
    @Transactional
    public boolean debit(String playerId, long amount) {
        return jdbc.update("update guest_sessions set coins = coins - ? where player_id = ? and coins >= ?",
                amount, playerId, amount) == 1;
    }

    @Transactional
    public void credit(String playerId, long amount) {
        jdbc.update("update guest_sessions set coins = coins + ? where player_id = ?", amount, playerId);
    }

    /**
     * Fim da partida: o pote (aposta × jogadores) vai para os vencedores, dividido igualmente; o resto da
     * divisão fica com o primeiro da lista. Sem vencedor (abandonada), o pote se perde. Paga uma vez só.
     */
    @Transactional
    public void settle(String gameId, int players, List<String> winnerIds) {
        Integer stake = jdbc.query("""
                update games set stake_settled = true
                where id = ? and stake_settled = false and stake > 0
                returning stake""", (rs, i) -> rs.getInt(1), gameId).stream().findFirst().orElse(null);
        if (stake == null || winnerIds.isEmpty()) return;
        long pot = (long) stake * players;
        long share = pot / winnerIds.size();
        for (int i = 0; i < winnerIds.size(); i++) {
            credit(winnerIds.get(i), share + (i == 0 ? pot % winnerIds.size() : 0));
        }
    }

    private static LocalDate today() {
        return LocalDate.now(DAY_ZONE);
    }
}
