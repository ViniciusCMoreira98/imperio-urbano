-- Carteira do jogador e aposta da sala (07/11/2026).
-- coins: moedas de aposta. Convidado começa com rules.economy.guestStartingCoins; os já existentes recebem 1.000.
-- diamonds: comprados na loja (ainda não existe), sempre 0 por enquanto.
-- last_refill_on: dia (horário de Brasília) da última recarga grátis.

ALTER TABLE guest_sessions ADD COLUMN coins BIGINT NOT NULL DEFAULT 0 CHECK (coins >= 0);
ALTER TABLE guest_sessions ADD COLUMN diamonds BIGINT NOT NULL DEFAULT 0 CHECK (diamonds >= 0);
ALTER TABLE guest_sessions ADD COLUMN last_refill_on DATE;
UPDATE guest_sessions SET coins = 1000;

-- stake: aposta de cada jogador, cobrada ao iniciar; o vencedor leva o pote. Partidas antigas: 0 (sem aposta).
-- stake_settled: pote já pago (ou perdido, se abandonada); impede pagar duas vezes.
ALTER TABLE games ADD COLUMN stake INT NOT NULL DEFAULT 0 CHECK (stake >= 0);
ALTER TABLE games ADD COLUMN stake_settled BOOLEAN NOT NULL DEFAULT FALSE;
