// Avisos rápidos da mesa (08/11/2026): Aluguel Zero usado, ação que faltou saldo e dados iguais. Como os
// sons, cada aviso espera a mesa mostrar a jogada: os dados iguais aparecem quando os dados param; os
// demais, quando o personagem pousa (e a carta da vez fecha). Todos no meio da tela, um de cada vez; somem sozinhos, pelo × ou
// com um toque fora. Ressincronia (reconexão) descarta a fila.
import { useEffect, useRef, useState } from 'react';
import rentWaiverArt from '../event-art/art/aluguel-zero-v1.webp';
import { type TableNotice, tableNotices } from '../game/tableNotices';
import { cardPending, useCardStore } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { usePawnStore } from '../store/pawnStore';

/** Tempo na tela: os dados iguais são só um lembrete; os outros pedem leitura. */
const SHOW_MS: Record<TableNotice['kind'], number> = { doubles: 2500, rentWaiver: 4500, noFunds: 4500, tax: 3500, saque: 3500 };

/** Ícone de cada aviso (o Aluguel Zero usa a arte da carta). */
const NOTICE_ICONS: Partial<Record<TableNotice['kind'], string>> = { doubles: '🎲', noFunds: '💸', tax: '🏦', saque: '💰' };

/** Cor da borda e do título de cada aviso. */
const TONES: Record<TableNotice['kind'], string> = {
  doubles: 'border-amber-300/70 text-amber-200',
  rentWaiver: 'border-emerald-300/60 text-emerald-200',
  noFunds: 'border-rose-300/70 text-rose-200',
  tax: 'border-orange-300/70 text-orange-200',
  saque: 'border-emerald-300/70 text-emerald-200',
};

const ready = (notice: TableNotice) => {
  if (useDiceStore.getState().rolling) return false;
  if (notice.after === 'dice') return true;
  return Object.keys(usePawnStore.getState().moving).length === 0 && !cardPending(useCardStore.getState().doneId, useGameStore.getState().cards);
};

export function TableNotices({ myId }: { myId: string }) {
  const [shown, setShown] = useState<TableNotice | null>(null);
  const [queue, setQueue] = useState<TableNotice[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const name = (id: string) => useGameStore.getState().snapshot?.players.find((p) => p.id === id)?.nickname ?? 'Alguém';
    // Adiado: os dados e os personagens marcam o movimento na mesma notificação que trouxe os eventos.
    const recheck = () => setTimeout(() => setTick((t) => t + 1), 0);

    const offGame = useGameStore.subscribe((state, previous) => {
      if (state.resync !== previous.resync) {
        setQueue([]);
        setShown(null);
        return;
      }
      if (!state.snapshot || state.eventsVersion === null || previous.eventsVersion === null || state.eventsVersion <= previous.eventsVersion) return;
      const fresh = state.log.slice(-(state.eventsVersion - previous.eventsVersion));
      const found = tableNotices(fresh, previous.eventsVersion + 1, state.snapshot, myId, name);
      // Entra na fila só depois que dados e personagens marcarem o movimento (como os sons).
      if (found.length) setTimeout(() => setQueue((q) => [...q, ...found]), 0);
    });
    const offDice = useDiceStore.subscribe(recheck);
    const offPawns = usePawnStore.subscribe(recheck);
    const offCards = useCardStore.subscribe(recheck);
    return () => {
      offGame();
      offDice();
      offPawns();
      offCards();
    };
  }, [myId]);

  // Mostra o próximo da fila quando a mesa chega no ponto que ele espera.
  useEffect(() => {
    if (shown || queue.length === 0 || !ready(queue[0])) return;
    setShown(queue[0]);
    setQueue((q) => q.slice(1));
  }, [shown, queue, tick]);

  // Tocar fora do aviso também fecha, para não esperar o tempo acabar.
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!shown) return;
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setShown(null);
    };
    window.addEventListener('pointerdown', onDown, true);
    return () => window.removeEventListener('pointerdown', onDown, true);
  }, [shown]);

  // Some sozinho depois de um tempo.
  useEffect(() => {
    if (!shown) return;
    const id = setTimeout(() => setShown(null), SHOW_MS[shown.kind]);
    return () => clearTimeout(id);
  }, [shown]);

  if (!shown) return null;
  const close = () => setShown(null);

  const tone = TONES[shown.kind];
  return (
    // No miolo do tabuleiro (BoardCenterSlot), sem camada por cima dos estados.
      <div
        ref={panelRef}
        role="status"
        aria-live="polite"
        className={`table-notice table-notice-${shown.kind} hud-panel relative flex w-[22rem] items-center gap-3 rounded-2xl border py-2 pl-3 pr-9 text-left text-white shadow-2xl ${tone.split(' ')[0]}`}
      >
        {shown.kind === 'rentWaiver' ? (
          <img src={rentWaiverArt} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <span aria-hidden className="text-4xl">{NOTICE_ICONS[shown.kind]}</span>
        )}
        <span className="leading-tight">
          <strong className={`block text-base font-black ${tone.split(' ')[1]}`}>{shown.title}</strong>
          <span className="text-sm">{shown.text}</span>
        </span>
        <CloseButton onClick={close} />
      </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Fechar aviso"
      onClick={onClick}
      className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-white/80 hover:bg-white/10 hover:text-white"
    >
      ×
    </button>
  );
}
