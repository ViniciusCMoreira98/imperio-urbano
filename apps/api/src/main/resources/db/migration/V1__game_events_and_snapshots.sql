-- Persistência das partidas (ADR A3/A4): log de eventos + último snapshot + comandos processados.

CREATE TABLE games (
    id          VARCHAR(36) PRIMARY KEY,
    invite_code VARCHAR(8)  NOT NULL UNIQUE,
    mode        VARCHAR(16) NOT NULL,
    status      VARCHAR(16) NOT NULL,
    version     BIGINT      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Um evento por linha; sequence = versão do estado após aplicá-lo.
CREATE TABLE game_events (
    game_id     VARCHAR(36) NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    sequence    BIGINT      NOT NULL,
    type        VARCHAR(48) NOT NULL,
    payload     JSONB       NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (game_id, sequence)
);

-- Último estado completo da partida, para retomada rápida.
CREATE TABLE game_snapshots (
    game_id     VARCHAR(36) PRIMARY KEY REFERENCES games (id) ON DELETE CASCADE,
    version     BIGINT      NOT NULL,
    state       JSONB       NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotência: o mesmo commandId nunca é processado duas vezes.
CREATE TABLE processed_commands (
    command_id     VARCHAR(64) PRIMARY KEY,
    game_id        VARCHAR(36) NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    player_id      VARCHAR(64) NOT NULL,
    result_version BIGINT      NOT NULL,
    processed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX processed_commands_game_idx ON processed_commands (game_id);
