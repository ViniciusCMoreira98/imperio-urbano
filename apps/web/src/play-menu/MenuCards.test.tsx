import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlayerMenuCard } from './MenuCards';

describe('PlayerMenuCard', () => {
  it('mostra as vitórias do jogador, no singular e no plural', () => {
    expect(renderToStaticMarkup(<PlayerMenuCard nickname="Ana" portrait={null} wins={1} />)).toContain('title="1 vitória"');
    expect(renderToStaticMarkup(<PlayerMenuCard nickname="Ana" portrait={null} wins={1234} />)).toContain('title="1.234 vitórias"');
  });

  it('sem dado do servidor, não mostra a linha de vitórias', () => {
    expect(renderToStaticMarkup(<PlayerMenuCard nickname="Ana" portrait={null} />)).not.toContain('pm-player-wins');
  });
});

describe('PlayerMenuCard com troca de personagem', () => {
  it('o retrato vira um botão "Trocar personagem" com o selo visível', () => {
    const html = renderToStaticMarkup(<PlayerMenuCard nickname="Ana" portrait={null} onEditCharacter={() => {}} />);
    expect(html).toContain('aria-label="Trocar personagem"');
    expect(html).toContain('Trocar</span>');
  });

  it('sem a ação, o retrato continua só imagem', () => {
    expect(renderToStaticMarkup(<PlayerMenuCard nickname="Ana" portrait={null} />)).not.toContain('<button');
  });
});
