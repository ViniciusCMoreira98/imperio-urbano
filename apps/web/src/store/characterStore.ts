// Personagem preferido do jogador (avatar e cor), escolhido no menu antes de entrar numa sala.
// O servidor guarda a escolha; a sala de espera já começa com ela.
import { create } from 'zustand';
import type { AvatarId, PawnColor } from '@imperio/shared-types';
import { api, type Character } from '../net/api';

interface CharacterState {
  character: Character | null;
  pickerOpen: boolean;
  load: (token: string) => Promise<void>;
  save: (token: string, avatarId: AvatarId, pawnColor: PawnColor) => Promise<void>;
  openPicker: () => void;
  closePicker: () => void;
}

export const useCharacterStore = create<CharacterState>()((set) => ({
  character: null,
  pickerOpen: false,
  load: async (token) => {
    try {
      set({ character: await api.character(token) });
    } catch {
      // Sem resposta (servidor fora): o menu segue com o avatar padrão.
    }
  },
  save: async (token, avatarId, pawnColor) => {
    set({ character: await api.saveCharacter(token, avatarId, pawnColor) });
  },
  openPicker: () => set({ pickerOpen: true }),
  closePicker: () => set({ pickerOpen: false }),
}));

/** Avatar a mostrar no menu (o padrão até a resposta do servidor). */
export const useMenuAvatar = (): AvatarId => useCharacterStore((s) => s.character?.avatarId ?? 'avatar-1');
