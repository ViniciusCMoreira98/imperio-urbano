// Engrenagem que abre as Configurações (no topo da partida e no menu principal).
import { useState } from 'react';
import { createPortal } from 'react-dom';
import gearIcon from '../main-menu/art/gear-v1.svg';
import { SettingsDialog } from './SettingsDialog';

export function SettingsButton({ inGame, className }: { inGame: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className ?? 'hud-panel grid h-8 w-8 place-items-center rounded-full p-1 hover:brightness-125'}
        aria-label="Configurações"
        title="Configurações"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <img src={gearIcon} alt="" className="h-full w-full object-contain" />
      </button>
      {/* Fora do cabeçalho da partida: os estilos dos botões do HUD não vazam para o painel. */}
      {createPortal(<SettingsDialog open={open} onClose={() => setOpen(false)} inGame={inGame} />, document.body)}
    </>
  );
}
