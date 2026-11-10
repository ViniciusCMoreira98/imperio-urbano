-- Partidas contra bots (pedido do usuário, 10/11/2026): três jogadores fixos do servidor ocupam os assentos.
-- Não têm token de verdade: o token_hash não é hexadecimal, então nenhum SHA-256 bate com ele (ninguém entra como bot).
INSERT INTO guest_sessions (player_id, nickname, token_hash, avatar_id, pawn_color) VALUES
    ('bot-1', 'Bot Sabiá',  'bot-1-sem-login-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'avatar-2', 'AZUL'),
    ('bot-2', 'Bot Jabuti', 'bot-2-sem-login-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'avatar-3', 'VERDE'),
    ('bot-3', 'Bot Caju',   'bot-3-sem-login-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'avatar-4', 'VERMELHO')
ON CONFLICT (player_id) DO NOTHING;
