import { BoardScene } from '../board/BoardScene';
import { ViewControls } from '../hud/ViewControls';

// Layout da seção 11: tabuleiro ao centro, jogadores à esquerda, propriedade à direita, ações embaixo.
export function App() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <BoardScene />

      <header className="pointer-events-none absolute inset-x-0 top-0 p-4 text-center">
        <h1 className="text-xl font-bold tracking-wide">Império Urbano — Edição Brasil</h1>
      </header>

      <aside className="absolute left-4 top-16 w-56 rounded-xl bg-black/40 p-3 text-sm backdrop-blur">
        Jogadores
      </aside>

      <aside className="absolute right-4 top-16 w-64 rounded-xl bg-black/40 p-3 text-sm backdrop-blur">
        Selecione um estado
      </aside>

      <footer className="absolute inset-x-0 bottom-4 flex justify-center">
        <div className="rounded-xl bg-black/40 px-4 py-2 text-sm backdrop-blur">Ações da partida</div>
      </footer>

      <div className="absolute bottom-4 right-4">
        <ViewControls />
      </div>
    </div>
  );
}
