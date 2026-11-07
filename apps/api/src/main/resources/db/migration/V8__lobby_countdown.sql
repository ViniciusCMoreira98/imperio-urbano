-- Início automático da sala (07/11/2026): com 2 ou mais jogadores, a partida começa sozinha 10 s depois.
-- starts_at: quando a contagem termina; nulo enquanto a sala tem menos de 2 jogadores.
ALTER TABLE games ADD COLUMN starts_at TIMESTAMPTZ;
CREATE INDEX games_lobby_starts_idx ON games (starts_at) WHERE status = 'LOBBY' AND starts_at IS NOT NULL;
