// Tabuleiro da partida: a cena de 33 casas da arte (câmera fixa, seleção pelo id visual) com as
// construções e os personagens da engenharia injetados dentro dela.
import { board } from '@imperio/game-data';
import { useViewStore } from '../store/viewStore';
import { tileIndexOf } from './layout';
import { Buildings, Pawns } from './Pieces';
import { ReferenceBoardScene } from './reference33/ReferenceBoardScene';

export function GameBoard() {
  const selectedTile = useViewStore((s) => s.selectedTile);
  const selectTile = useViewStore((s) => s.selectTile);
  const selectedId = selectedTile === null ? null : board.tiles[selectedTile]?.id ?? null;

  return (
    <ReferenceBoardScene
      selectedId={selectedId}
      onSelect={(id) => {
        const index = tileIndexOf(id);
        if (index !== null) selectTile(index);
      }}
      // Os dados da partida entram na E25 (animação a partir do resultado oficial); até lá, nenhum.
      diceValues={null}
    >
      <Buildings />
      <Pawns />
    </ReferenceBoardScene>
  );
}
