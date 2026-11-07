-- Login com Google (07/11/2026): o jogador (guest_sessions) pode ter uma conta Google ligada.
-- google_sub é o identificador estável do Google ("sub" do ID token); o e-mail é só para exibir.
ALTER TABLE guest_sessions
    ADD COLUMN google_sub VARCHAR(255) UNIQUE,
    ADD COLUMN email      VARCHAR(320);

-- Tokens extras do mesmo jogador: cada aparelho que entra com Google recebe o seu, sem derrubar os outros.
-- O token original do convidado continua em guest_sessions.token_hash.
CREATE TABLE session_tokens (
    token_hash   CHAR(64)    PRIMARY KEY,
    player_id    VARCHAR(36) NOT NULL REFERENCES guest_sessions (player_id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_tokens_player_idx ON session_tokens (player_id);
