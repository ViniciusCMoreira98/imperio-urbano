-- Versão do tabuleiro de cada snapshot (P1, 33 casas). Snapshots anteriores são do tabuleiro de 36 casas
-- (versão 1): ficam guardados, mas a partida não continua, porque as posições não valem no percurso novo.

ALTER TABLE game_snapshots ADD COLUMN board_version INT NOT NULL DEFAULT 1;
