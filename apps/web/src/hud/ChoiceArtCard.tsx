// Cartão ilustrado da escolha no tabuleiro (arte do Codex, kits destination-v3 e selection-v3,
// 10/11/2026): destino da viagem pelo Aeroporto e sede das Olimpíadas (normal ou pela carta "Escolha
// da sede"). Moldura em nove partes, emblema e textos reais por cima; comandos e alvos são os mesmos do
// BoardChoicePrompt. Fica no miolo do tabuleiro (BoardCenterSlot), que encolhe tudo se não couber.
import { board } from '@imperio/game-data';
import type { Command } from '@imperio/shared-types';
import { type BoardChoice, choiceAction, tileName } from '../game/boardChoice';
import { formatCredits } from '../property-card/tileInfo';
import { Countdown } from './ActionBar';
import airportEmblem from './art/airport-emblem.webp';
import olympicEmblem from './art/olympic-emblem.webp';
import './choiceArt.css';

/** Escolhas com arte própria: viagem e sede das Olimpíadas (normal ou por evento). */
export function hasChoiceArt(choice: BoardChoice): boolean {
  return choice.kind === 'travel' || choice.kind === 'olympics' || (choice.kind === 'event' && choice.effect === 'CHOOSE_OLYMPICS_HOST');
}

interface Props {
  choice: BoardChoice;
  selected: number | null;
  deadline: number | null;
  offline: boolean;
  onCommand: (command: Command) => void;
}

export function ChoiceArtCard({ choice, selected, deadline, offline, onCommand }: Props) {
  const travel = choice.kind === 'travel';
  const event = choice.kind === 'event';
  const action = choiceAction(choice, selected);
  const invalid = selected !== null && !action;
  const sigla = action && selected !== null ? board.tiles[selected].stateId : null;
  const title = travel ? (action ? 'Confirme a viagem' : 'Escolha o destino') : action ? 'Confirme a sede' : 'Escolha a sede';
  const instruction = travel
    ? 'Toque no estado de destino.'
    : event
      ? 'Toque num dos seus estados destacados para sediar os jogos.'
      : 'Toque num dos seus estados destacados.';

  return (
    <section role="dialog" aria-label={title} className={`choice-art ${travel ? 'choice-art-airport' : 'choice-art-olympic'}`}>
      <header className="choice-art-intro">
        <img className="choice-art-emblem" src={travel ? airportEmblem : olympicEmblem} alt="" draggable={false} />
        <h2>{title}</h2>
        {deadline !== null && (
          <span className="choice-art-timer">
            <Countdown deadline={deadline} />
          </span>
        )}
      </header>
      {action && selected !== null ? (
        <p className="choice-art-selection">
          <span>{travel ? 'Destino' : 'Sede'}</span>
          <strong>
            {tileName(selected)} · {sigla}
          </strong>
        </p>
      ) : (
        <p className="choice-art-instruction">{instruction}</p>
      )}
      {invalid && <p className="choice-art-invalid">{choice.invalidHint}</p>}
      <div className="choice-art-actions">
        <button type="button" className="choice-art-confirm" disabled={offline || !action} onClick={() => action && onCommand(action.command)}>
          {travel ? 'Viajar' : 'Confirmar sede'}
        </button>
        {choice.kind === 'olympics' && (
          <button type="button" className="choice-art-skip" disabled={offline} onClick={() => onCommand({ type: 'SKIP_OLYMPICS' })}>
            Não sediar
          </button>
        )}
      </div>
      <p className="choice-art-cost">
        {event ? (
          <>
            Sede por evento: <b>sem taxa</b>
          </>
        ) : (
          <>
            {travel ? 'Custo da viagem' : 'Custo para sediar'}: <b>{formatCredits(choice.fee)}</b>
            {travel && <span className="choice-art-cost-extra"> · ou role os dados</span>}
          </>
        )}
      </p>
    </section>
  );
}
