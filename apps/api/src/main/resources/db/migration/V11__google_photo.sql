-- Foto de perfil do Google (07/11/2026): aparece no card do jogador na partida. Atualizada a cada login.
ALTER TABLE guest_sessions ADD COLUMN photo_url VARCHAR(1024);
