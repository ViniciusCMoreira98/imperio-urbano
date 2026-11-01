const DOTS: Record<number, [number,number][]> = {
  1:[[24,24]], 2:[[14,14],[34,34]], 3:[[14,14],[24,24],[34,34]],
  4:[[14,14],[34,14],[14,34],[34,34]], 5:[[14,14],[34,14],[24,24],[14,34],[34,34]],
  6:[[14,13],[34,13],[14,24],[34,24],[14,35],[34,35]],
};

/** Representação estática do resultado recebido; não sorteia e não anima a partida. */
export function DiceFaces({ values }: { values: [number,number] | null }) {
  if (!values) return null;
  return <span className="hud-dice" role="img" aria-label={`Dados: ${values[0]} e ${values[1]}`}>
    {values.map((value,index) => <svg key={index} viewBox="0 0 54 58" aria-hidden="true"><rect x="3" y="7" width="48" height="48" rx="10" fill="#bcb7c6"/><rect x="3" y="2" width="48" height="48" rx="10" fill="#fff9ed" stroke="#fff" strokeWidth="1.5"/><g transform="translate(3 2)">{(DOTS[value] ?? []).map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#202238"/>)}</g></svg>)}
  </span>;
}
