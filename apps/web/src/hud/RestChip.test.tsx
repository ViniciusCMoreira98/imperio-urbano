import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RestChip } from './ActionBar';

describe('aviso do Descanso', () => {
  it('mostra quantas rodadas faltam e que a dupla libera antes', () => {
    const one = renderToStaticMarkup(<RestChip turns={1} />);
    expect(one).toContain('Descanso: <strong>falta 1 rodada</strong>');
    expect(one).toContain('dupla sai antes');
    expect(renderToStaticMarkup(<RestChip turns={2} />)).toContain('faltam 2 rodadas');
  });
});
