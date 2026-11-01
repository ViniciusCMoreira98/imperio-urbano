// Manifesto dos personagens (contrato com a arte 3D: docs/08-contratos-claude-codex.md).
// Único lugar com caminhos e ajustes de modelo; o resto do jogo pede o personagem pelo avatar.
import type { AvatarId } from '@imperio/shared-types';
import raw from './characters.json';

export type CharacterStatus = 'candidate' | 'validated' | 'approved' | 'published';

export interface CharacterAsset {
  id: string;
  avatarId: AvatarId | null;
  file: string;
  /** Altura no tabuleiro, em unidades da cena (uma casa tem 1 de largura). */
  height: number;
  /** Correção de frente, em radianos (o jogo espera a frente em +Z). */
  rotationY: number;
  /** Ajuste fino do pivô depois da normalização. */
  offset: [number, number, number];
  /** Clip de "parado", se o modelo tiver; nulo quando não há animação. */
  idleClip: string | null;
  status: CharacterStatus;
  license: string;
}

export interface CharacterManifest {
  schemaVersion: 1;
  fallback: string;
  characters: CharacterAsset[];
}

const AVATAR_IDS: AvatarId[] = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5'];
const STATUSES: CharacterStatus[] = ['candidate', 'validated', 'approved', 'published'];

/** Lista os problemas do manifesto (vazia = válido). Usado no teste e na carga. */
export function manifestProblems(manifest: CharacterManifest): string[] {
  const problems: string[] = [];
  if (manifest.schemaVersion !== 1) problems.push(`schemaVersion ${manifest.schemaVersion} não suportada`);
  const ids = new Set<string>();
  const avatars = new Set<string>();
  for (const c of manifest.characters) {
    const where = `personagem "${c.id}"`;
    if (!c.id || ids.has(c.id)) problems.push(`${where}: id vazio ou repetido`);
    ids.add(c.id);
    if (c.avatarId !== null) {
      if (!AVATAR_IDS.includes(c.avatarId)) problems.push(`${where}: avatarId desconhecido ${c.avatarId}`);
      if (avatars.has(c.avatarId)) problems.push(`${where}: ${c.avatarId} usado por mais de um personagem`);
      avatars.add(c.avatarId);
    }
    if (!/^\/models\/.+\.(glb|gltf)$/.test(c.file)) problems.push(`${where}: arquivo deve ser .glb/.gltf em /models/`);
    if (!(c.height > 0 && c.height < 3)) problems.push(`${where}: altura fora do intervalo (0, 3)`);
    if (!Number.isFinite(c.rotationY)) problems.push(`${where}: rotationY inválida`);
    if (c.offset.length !== 3 || !c.offset.every(Number.isFinite)) problems.push(`${where}: offset deve ter 3 números`);
    if (!STATUSES.includes(c.status)) problems.push(`${where}: status desconhecido ${c.status}`);
  }
  for (const id of AVATAR_IDS) if (!avatars.has(id)) problems.push(`${id} sem personagem`);
  if (!ids.has(manifest.fallback)) problems.push(`fallback "${manifest.fallback}" não existe`);
  return problems;
}

export const characterManifest = raw as CharacterManifest;

const byAvatar = new Map(characterManifest.characters.filter((c) => c.avatarId).map((c) => [c.avatarId!, c]));
const fallback = characterManifest.characters.find((c) => c.id === characterManifest.fallback)!;

/** Personagem do avatar; sem entrada no manifesto, o personagem reserva. */
export function characterFor(avatarId: AvatarId): CharacterAsset {
  return byAvatar.get(avatarId) ?? fallback;
}

export function fallbackCharacter(): CharacterAsset {
  return fallback;
}

/** Arquivos distintos usados pelos avatares (para pré-carregar uma vez cada). */
export function characterFiles(): string[] {
  return [...new Set(characterManifest.characters.map((c) => c.file))];
}
