// Animação do dinheiro (pedido do usuário, 11/11/2026): notas voam de quem paga para quem recebe (ou
// banco), o saldo conta até o valor novo e um "−R$ 120" / "+R$ 120" sobe no card. Dispara quando o saldo
// MOSTRADO muda, então respeita o mesmo momento do painel (aluguel quando o peão pousa, carta quando fecha).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { formatCredits } from '../property-card/tileInfo';
import { BANK, pairPayments } from './moneyFlights';
import banknoteArt from './art/money/banknote-v1.webp';
import './moneyMotion.css';

/** Duração do voo das notas e da contagem do saldo. */
const FLIGHT_MS = 750;
const COUNT_MS = 900;
const NOTES = 5;

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Saldo que conta até o valor novo, com a variação subindo por cima. */
export function AnimatedBalance({ playerId, value, resync }: { playerId: string; value: number; resync: number }) {
  const [shown, setShown] = useState(value);
  const [float, setFloat] = useState<{ id: number; delta: number } | null>(null);
  const from = useRef(value);
  const lastResync = useRef(resync);
  const shownRef = useRef(value);
  shownRef.current = shown;

  useEffect(() => {
    // Reconexão ou primeiro saldo: troca direto, sem animar.
    if (resync !== lastResync.current || reducedMotion()) {
      lastResync.current = resync;
      from.current = value;
      setShown(value);
      return;
    }
    if (value === from.current) return;
    const start = shownRef.current;
    const delta = value - from.current;
    from.current = value;
    setFloat({ id: performance.now(), delta });
    // Quem recebe espera as notas chegarem para começar a contar.
    const wait = delta > 0 ? FLIGHT_MS * 0.7 : 0;
    let frame = 0;
    let began = 0;
    const step = (now: number) => {
      if (!began) began = now;
      const t = Math.min(1, (now - began) / COUNT_MS);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(start + (value - start) * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => (frame = requestAnimationFrame(step)), wait);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, resync]);

  return (
    <span className="money-balance" data-balance-of={playerId}>
      {formatCredits(shown)}
      {float && (
        <span
          key={float.id}
          className={`money-float ${float.delta < 0 ? 'money-float-out' : 'money-float-in'}`}
          style={{ animationDelay: float.delta > 0 ? `${FLIGHT_MS * 0.7}ms` : undefined }}
          onAnimationEnd={() => setFloat(null)}
          aria-hidden
        >
          {float.delta < 0 ? '−' : '+'}
          {formatCredits(Math.abs(float.delta))}
        </span>
      )}
    </span>
  );
}

/** Ponto de saída ou chegada: o saldo no card do jogador, ou o miolo do tabuleiro para o banco. */
function anchor(id: string): { x: number; y: number } | null {
  const el =
    id === BANK
      ? document.querySelector<HTMLElement>('.board-center-slot')
      : document.querySelector<HTMLElement>(`[data-balance-of="${CSS.escape(id)}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Notas voando de um ponto a outro, em arco, uma atrás da outra. */
function flyNotes(from: { x: number; y: number }, to: { x: number; y: number }) {
  for (let i = 0; i < NOTES; i++) {
    const note = document.createElement('img');
    note.className = 'money-note';
    note.src = banknoteArt;
    note.alt = '';
    note.draggable = false;
    note.setAttribute('aria-hidden', 'true');
    document.body.appendChild(note);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    // Arco para cima, sem sair da tela quando os cards ficam no topo.
    const lift = Math.max(0, Math.min(120, Math.hypot(dx, dy) * 0.3, from.y + dy / 2 - 16));
    const jitter = (i - (NOTES - 1) / 2) * 6;
    const animation = note.animate(
      [
        { transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) scale(.6) rotate(-10deg)`, opacity: 0 },
        { opacity: 1, offset: 0.12 },
        {
          transform: `translate(${from.x + dx / 2 + jitter}px, ${from.y + dy / 2 - lift}px) translate(-50%, -50%) scale(1.15) rotate(8deg)`,
          offset: 0.5,
        },
        { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(.7) rotate(-6deg)`, opacity: 0.2 },
      ],
      { duration: FLIGHT_MS, delay: i * 70, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'both' },
    );
    animation.onfinish = () => note.remove();
    animation.oncancel = () => note.remove();
  }
}

/**
 * Compara os saldos mostrados com os anteriores e faz o dinheiro voar entre os cards. Reconexão
 * ({@code resync}) e o primeiro saldo não animam.
 */
export function useMoneyFlights(shown: Readonly<Record<string, number>>, resync: number) {
  // Carrega o pequeno sprite antes do primeiro pagamento, sem mudar a hora em que o voo dispara.
  useEffect(() => { const image = new Image(); image.src = banknoteArt; }, []);
  const previous = useRef<Record<string, number> | null>(null);
  const lastResync = useRef(resync);
  const key = JSON.stringify(shown);
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { ...shown };
    if (!before || resync !== lastResync.current || reducedMotion()) {
      lastResync.current = resync;
      return;
    }
    const deltas: Record<string, number> = {};
    for (const [id, value] of Object.entries(shown)) if (id in before && value !== before[id]) deltas[id] = value - before[id];
    for (const flight of pairPayments(deltas)) {
      const from = anchor(flight.from);
      const to = anchor(flight.to);
      if (from && to) flyNotes(from, to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, resync]);
}
