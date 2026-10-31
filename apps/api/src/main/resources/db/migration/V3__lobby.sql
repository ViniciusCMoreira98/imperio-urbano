-- Salas (E16): anfitrião da partida e jogadores com assento, avatar, cor do peão e "pronto".

ALTER TABLE games ADD COLUMN host_player_id VARCHAR(36) REFERENCES guest_sessions (player_id);

CREATE TABLE game_players (
    game_id    VARCHAR(36) NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    player_id  VARCHAR(36) NOT NULL REFERENCES guest_sessions (player_id),
    nickname   VARCHAR(20) NOT NULL,
    seat       SMALLINT    NOT NULL,
    avatar_id  VARCHAR(16) NOT NULL,
    pawn_color VARCHAR(16) NOT NULL,
    ready      BOOLEAN     NOT NULL DEFAULT FALSE,
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (game_id, player_id),
    UNIQUE (game_id, seat),
    UNIQUE (game_id, pawn_color)
);

CREATE INDEX game_players_player_idx ON game_players (player_id);
