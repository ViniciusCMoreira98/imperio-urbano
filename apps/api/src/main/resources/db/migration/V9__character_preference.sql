-- Personagem preferido do jogador (07/11/2026): escolhido no menu, antes de entrar numa sala.
-- avatar_id: avatar usado ao entrar ou criar uma sala. pawn_color: cor preferida (vale se estiver livre na sala).
ALTER TABLE guest_sessions ADD COLUMN avatar_id VARCHAR(16) NOT NULL DEFAULT 'avatar-1';
ALTER TABLE guest_sessions ADD COLUMN pawn_color VARCHAR(16);
