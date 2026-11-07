// Cena da partida escolhida pela sequência completa do catálogo, sem misturar índices 33/34.
import {useMemo} from 'react';
import {board,states} from '@imperio/game-data';
import {useViewStore} from '../store/viewStore';
import {useGameStore} from '../store/gameStore';
import {currentRent} from '../game/rules';
import {formatCredits} from '../property-card/tileInfo';
import {tileIndexOf} from './layout';
import {Buildings,Pawns} from './Pieces';
import {Board34Scene,type BoardRentLabel} from './board34/Board34Scene';
import {isBoard34} from './boardVisualManifest';
import {RollingDice} from './RollingDice';
import {ChoiceHighlights} from './ChoiceHighlights';

const active34=isBoard34(board.tiles);
/** O host da engenharia fornece o saldo oficial formatado da Taxa quando integrar seu schema. */
export function GameBoard({taxPoolLabel=null}:{taxPoolLabel?:string|null}){
 const selectedTile=useViewStore(s=>s.selectedTile),selectTile=useViewStore(s=>s.selectTile),snapshot=useGameStore(s=>s.snapshot);
 const selectedId=selectedTile===null?null:board.tiles[selectedTile]?.id??null;
 const rents=useMemo<BoardRentLabel[]>(()=>{
  if(!active34||!snapshot)return[];
  return states.filter(state=>board.tiles.some(t=>t.stateId===state.id)&&snapshot.properties.some(p=>p.stateId===state.id&&p.ownerId!==null)).map(state=>({stateId:state.id,rentLabel:formatCredits(currentRent(snapshot,state))}));
 },[snapshot]);
 const onSelect=(id:string)=>{const index=tileIndexOf(id);if(index!==null)selectTile(index);};
 const pieces=<><Buildings/><ChoiceHighlights/><Pawns/><RollingDice/></>;
 if(!active34)throw Error('A partida atual exige o catálogo de 34 casas.');
 return <Board34Scene selectedId={selectedId} onSelect={onSelect} rentLabels={rents} taxPoolLabel={taxPoolLabel} diceValues={null}>{pieces}</Board34Scene>;
}
