-- Salas públicas (07/11/2026): aparecem na lista para qualquer jogador entrar sem código.
-- Salas já existentes continuam privadas; as novas escolhem na criação (padrão pública).
ALTER TABLE games ADD COLUMN public_room BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX games_public_lobby_idx ON games (created_at DESC) WHERE public_room AND status = 'LOBBY';
