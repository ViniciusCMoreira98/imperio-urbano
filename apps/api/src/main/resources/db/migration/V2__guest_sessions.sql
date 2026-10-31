-- Sessão de convidado (D15/A8): apelido + token opaco. Só o hash SHA-256 do token é guardado.

CREATE TABLE guest_sessions (
    player_id    VARCHAR(36) PRIMARY KEY,
    nickname     VARCHAR(20) NOT NULL,
    token_hash   CHAR(64)    NOT NULL UNIQUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
