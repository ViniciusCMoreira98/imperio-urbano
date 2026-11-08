import { useState } from 'react';
import type { AvatarId } from '@imperio/shared-types';
const portraits=import.meta.glob('./art/avatars-c8/*.webp',{eager:true,query:'?url',import:'default'})as Record<string,string>;

// Retratos originais do projeto, sem pixels da referência sem autorização comercial.
// Prompts, fontes e hashes em art/avatars-c8/provenance.json. GLBs e seleção não são alterados.

export function AvatarPortrait({ avatarId }: { avatarId: AvatarId }) {
  return <img className="hud-avatar-art" src={portraits[`./art/avatars-c8/${avatarId}.webp`]} alt="" aria-hidden="true" draggable={false}/>;
}

/**
 * Retrato do card: a foto do Google de quem entrou com Google (pedido do usuário, 07/11/2026); o personagem
 * para o convidado ou se a foto não carregar. Sem referrer, como o Google pede para as fotos de perfil.
 */
export function PlayerPortrait({ avatarId, photoUrl }: { avatarId: AvatarId; photoUrl?: string | null }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!photoUrl || failed === photoUrl) return <AvatarPortrait avatarId={avatarId}/>;
  return (
    <img
      className="hud-avatar-art hud-avatar-photo"
      src={photoUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      referrerPolicy="no-referrer"
      onError={() => setFailed(photoUrl)}
    />
  );
}

export function LeaderCrown() {
  return <svg viewBox="0 0 40 30" className="hud-leader-crown" role="img" aria-label="Líder"><path d="m4 7 9 8 7-12 7 12 9-8-4 20H8Z" fill="#ffd84b" stroke="#fff3b5" strokeWidth="2"/><path d="M9 23h22" stroke="#ce841e" strokeWidth="3"/></svg>;
}
