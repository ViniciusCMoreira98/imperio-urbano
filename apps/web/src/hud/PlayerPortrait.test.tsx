import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerPortrait } from './AvatarPortrait';

describe('PlayerPortrait', () => {
  it('mostra a foto do Google sem referrer', () => {
    const html = renderToStaticMarkup(<PlayerPortrait avatarId="avatar-1" photoUrl="https://lh3.googleusercontent.com/a/x" />);
    expect(html).toContain('src="https://lh3.googleusercontent.com/a/x"');
    expect(html).toContain('referrerPolicy="no-referrer"');
  });

  it('mostra o personagem para o convidado', () => {
    const html = renderToStaticMarkup(<PlayerPortrait avatarId="avatar-1" photoUrl={null} />);
    expect(html).not.toContain('googleusercontent');
    expect(html).toContain('hud-avatar-art');
  });
});
