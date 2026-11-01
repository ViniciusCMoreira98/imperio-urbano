import { describe, expect, it, vi } from 'vitest';
import { BoxGeometry, Color, DataTexture, Group, LinearFilter, Mesh, MeshStandardMaterial, NoColorSpace } from 'three';
import { PAWN_COLORS } from '../game/presentation';
import { characterManifest, manifestProblems } from './characterManifest';
import { UNIFORM_FRAGMENT, UNIFORM_VERTEX, applyUniformTint, prepareUniformMask } from './uniformTint';

const LUANA_UNIFORM = { mask: '/models/characters/m.png', referenceLuminance: 0.02695356, localYRange: [-0.57, 0.07] as [number, number] };

/** Modelo de teste com o material "do cache" (o mesmo objeto que o useGLTF guardaria). */
function cachedModel() {
  const albedo = new DataTexture(new Uint8Array(4), 1, 1);
  const cached = new MeshStandardMaterial({ map: albedo, color: '#ffffff' });
  const scene = new Group();
  scene.add(new Mesh(new BoxGeometry(), cached));
  return { cached, albedo, copy: () => scene.clone(true) };
}

function compiled(material: MeshStandardMaterial) {
  const shader = {
    uniforms: {} as Record<string, { value: unknown }>,
    vertexShader: 'void main() {\n#include <begin_vertex>\n}',
    fragmentShader: 'void main() {\n#include <map_fragment>\n}',
  };
  material.onBeforeCompile(shader as never, undefined as never);
  return shader;
}

describe('uniforme na cor do jogador', () => {
  it('máscara: canal R linear, sem mipmaps, sem inverter, filtro linear', () => {
    const mask = prepareUniformMask(new DataTexture(new Uint8Array(4), 1, 1));
    expect(mask.colorSpace).toBe(NoColorSpace);
    expect(mask.flipY).toBe(false);
    expect(mask.generateMipmaps).toBe(false);
    expect(mask.minFilter).toBe(LinearFilter);
    expect(mask.magFilter).toBe(LinearFilter);
  });

  it('injeta a fórmula do contrato antes da iluminação, com a proteção por altura da geometria original', () => {
    const { copy } = cachedModel();
    const tint = applyUniformTint(copy(), new DataTexture(new Uint8Array(4), 1, 1), LUANA_UNIFORM, PAWN_COLORS.AZUL.hex);
    const shader = compiled(tint.materials[0] as MeshStandardMaterial);
    expect(shader.vertexShader).toContain(UNIFORM_VERTEX.afterBeginVertex);
    expect(shader.fragmentShader).toContain(UNIFORM_FRAGMENT.afterMap);
    expect(shader.fragmentShader).toContain('clamp(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)) / uniformReference, 0.15, 2.0)');
    expect(shader.fragmentShader).toContain('step(uniformLocalYRange.x, uniformLocalY) * step(uniformLocalY, uniformLocalYRange.y)');
    expect(shader.uniforms.uniformReference.value).toBe(0.02695356);
    expect(shader.uniforms.uniformLocalYRange.value).toMatchObject({ x: -0.57, y: 0.07 });
  });

  it('as seis cores viram a cor linear do jogador, sem mexer no material do cache', () => {
    const { cached, copy } = cachedModel();
    const before = cached.color.getHex();
    for (const [name, { hex }] of Object.entries(PAWN_COLORS)) {
      const tint = applyUniformTint(copy(), new DataTexture(new Uint8Array(4), 1, 1), LUANA_UNIFORM, hex);
      const color = compiled(tint.materials[0] as MeshStandardMaterial).uniforms.uniformPlayerColor.value as Color;
      expect(color.equals(new Color(hex)), name).toBe(true);
      expect(tint.materials[0]).not.toBe(cached);
    }
    expect(cached.color.getHex()).toBe(before);
    expect(cached.onBeforeCompile.toString()).not.toContain('uniformMask');
  });

  it('cópias simultâneas têm materiais e cores independentes; trocar a cor de uma não muda a outra', () => {
    const { copy, albedo } = cachedModel();
    const mask = new DataTexture(new Uint8Array(4), 1, 1);
    const ana = applyUniformTint(copy(), mask, LUANA_UNIFORM, PAWN_COLORS.VERDE.hex);
    const bia = applyUniformTint(copy(), mask, LUANA_UNIFORM, PAWN_COLORS.VERMELHO.hex);
    const anaShader = compiled(ana.materials[0] as MeshStandardMaterial);
    const biaShader = compiled(bia.materials[0] as MeshStandardMaterial);
    expect(ana.materials[0]).not.toBe(bia.materials[0]);

    ana.setColor(PAWN_COLORS.ROXO.hex);
    expect((anaShader.uniforms.uniformPlayerColor.value as Color).equals(new Color(PAWN_COLORS.ROXO.hex))).toBe(true);
    expect((biaShader.uniforms.uniformPlayerColor.value as Color).equals(new Color(PAWN_COLORS.VERMELHO.hex))).toBe(true);
    // Texturas compartilhadas: o albedo e a máscara são os mesmos objetos nas duas cópias.
    expect((ana.materials[0] as MeshStandardMaterial).map).toBe(albedo);
    expect(anaShader.uniforms.uniformMask.value).toBe(biaShader.uniforms.uniformMask.value);
  });

  it('liberar uma cópia descarta só os materiais dela, nunca as texturas compartilhadas', () => {
    const { copy, albedo } = cachedModel();
    const mask = new DataTexture(new Uint8Array(4), 1, 1);
    const albedoDispose = vi.spyOn(albedo, 'dispose');
    const maskDispose = vi.spyOn(mask, 'dispose');
    const ana = applyUniformTint(copy(), mask, LUANA_UNIFORM, PAWN_COLORS.VERDE.hex);
    const bia = applyUniformTint(copy(), mask, LUANA_UNIFORM, PAWN_COLORS.AZUL.hex);
    const materialDispose = vi.spyOn(ana.materials[0], 'dispose');
    const otherDispose = vi.spyOn(bia.materials[0], 'dispose');
    ana.dispose();
    expect(materialDispose).toHaveBeenCalled();
    expect(otherDispose).not.toHaveBeenCalled();
    expect(albedoDispose).not.toHaveBeenCalled();
    expect(maskDispose).not.toHaveBeenCalled();
  });

  it('sem faixa de altura, a proteção não corta nada', () => {
    const { copy } = cachedModel();
    const tint = applyUniformTint(copy(), new DataTexture(new Uint8Array(4), 1, 1), { mask: '/models/m.png', referenceLuminance: 0.03 }, '#ffffff');
    const range = compiled(tint.materials[0] as MeshStandardMaterial).uniforms.uniformLocalYRange.value as { x: number; y: number };
    expect(range.x).toBeLessThan(-1000);
    expect(range.y).toBeGreaterThan(1000);
  });

  it('manifesto: a Luana tem o uniforme do contrato; erros de uniforme são acusados', () => {
    const luana = characterManifest.characters.find((c) => c.avatarId === 'avatar-3')!;
    expect(luana.uniform).toEqual({
      mask: '/models/characters/steampunk-brasil-v01-uniform-mask-v04.png',
      referenceLuminance: 0.02695356,
      localYRange: [-0.57, 0.07],
    });
    const broken = {
      ...characterManifest,
      characters: characterManifest.characters.map((c) =>
        c.avatarId === 'avatar-3' ? { ...c, uniform: { mask: 'mascara.jpg', referenceLuminance: 0, localYRange: [0.5, 0.1] as [number, number] } } : c,
      ),
    };
    const problems = manifestProblems(broken).join('\n');
    expect(problems).toMatch(/máscara do uniforme/);
    expect(problems).toMatch(/referenceLuminance/);
    expect(problems).toMatch(/localYRange/);
  });
});
