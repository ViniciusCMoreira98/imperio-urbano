// Links para os Termos de Uso e a Política de Privacidade (páginas estáticas em public/, 19/11/2026).
// Abrem em outra aba para não derrubar a sessão nem a partida.
export function LegalLinks({ prefix, className }: { prefix?: string; className?: string }) {
  return (
    <p className={`legal-links ${className ?? ''}`}>
      {prefix}
      <a href="/termos.html" target="_blank" rel="noopener">Termos de Uso</a>
      {' e a '}
      <a href="/privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>
    </p>
  );
}
