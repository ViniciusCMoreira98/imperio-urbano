-- Vitórias do jogador (07/11/2026), mostradas no card do jogador no menu.
-- wins: partidas vencidas (empate conta para cada vencedor). wins_counted: impede contar duas vezes.
ALTER TABLE guest_sessions ADD COLUMN wins INT NOT NULL DEFAULT 0 CHECK (wins >= 0);
ALTER TABLE games ADD COLUMN wins_counted BOOLEAN NOT NULL DEFAULT FALSE;
