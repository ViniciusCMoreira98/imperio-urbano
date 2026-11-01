import type { AvatarId } from '@imperio/shared-types';
import reference from '../../../../docs/referencias/visual-alvo.webp?url';

// Janelas sobre a arte fornecida pelo projeto, sem duplicar/reescrever a imagem.
// Ilustrações do HUD; não alteram a identidade, seleção ou GLB do avatar.
const WINDOWS: Record<AvatarId, [number, number, number, number]> = {
  'avatar-1': [49, 25, 66, 66],
  'avatar-2': [49, 122, 66, 66],
  'avatar-3': [49, 215, 66, 66],
  'avatar-4': [49, 308, 66, 66],
  'avatar-5': [29, 850, 66, 66],
};

export function AvatarPortrait({ avatarId }: { avatarId: AvatarId }) {
  return <svg className="hud-avatar-art" viewBox={WINDOWS[avatarId].join(' ')} aria-hidden="true" focusable="false">
    <image href={reference} width="1671" height="941"/>
  </svg>;
}

export function LeaderCrown() {
  return <svg viewBox="0 0 40 30" className="hud-leader-crown" role="img" aria-label="Líder"><path d="m4 7 9 8 7-12 7 12 9-8-4 20H8Z" fill="#ffd84b" stroke="#fff3b5" strokeWidth="2"/><path d="M9 23h22" stroke="#ce841e" strokeWidth="3"/></svg>;
}
