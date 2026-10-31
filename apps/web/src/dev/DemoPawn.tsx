import { Pawn } from '../board/Pawn';
import { useDemoStore } from './demoStore';

export function DemoPawn() {
  const position = useDemoStore((s) => s.position);
  const arrive = useDemoStore((s) => s.arrive);
  return <Pawn position={position} color="#e63946" onArrive={arrive} />;
}
