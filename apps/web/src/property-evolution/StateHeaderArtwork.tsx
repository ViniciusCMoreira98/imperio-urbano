import artAC from './art/optimized/ac-header-v1.webp';
import artAL from './art/optimized/al-header-v1.webp';
import artAM from './art/optimized/am-header-v1.webp';
import artAP from './art/optimized/ap-header-v1.webp';
import artBA from './art/optimized/ba-header-v1.webp';
import artCE from './art/optimized/ce-header-v1.webp';
import artDF from './art/optimized/df-header-v1.webp';
import artES from './art/optimized/es-header-v1.webp';
import artGO from './art/optimized/go-header-v1.webp';
import artMA from './art/optimized/ma-header-v1.webp';
import artMG from './art/optimized/mg-header-v1.webp';
import artMS from './art/optimized/ms-header-v1.webp';
import artMT from './art/optimized/mt-header-v1.webp';
import artPA from './art/optimized/pa-header-v1.webp';
import artPB from './art/optimized/pb-header-v1.webp';
import artPE from './art/optimized/pe-header-v1.webp';
import artPI from './art/optimized/pi-header-v1.webp';
import artPR from './art/optimized/pr-header-v1.webp';
import artRN from './art/optimized/rn-header-v1.webp';
import artRO from './art/optimized/ro-header-v1.webp';
import artRR from './art/optimized/rr-header-v1.webp';
import artRS from './art/optimized/rs-header-v1.webp';
import artSC from './art/optimized/sc-header-v1.webp';
import artSE from './art/optimized/se-header-v1.webp';
import artSP from './art/optimized/sp-header-v1.webp';
import artRJ from './art/optimized/rio-header-v2.webp';

/** Arte original de cada UF do percurso aprovado, sem fallback para a imagem do RJ. */
export const STATE_HEADER_ART = {
  AC: { name: "Acre", src: artAC },
  AL: { name: "Alagoas", src: artAL },
  AM: { name: "Amazonas", src: artAM },
  AP: { name: "Amapá", src: artAP },
  BA: { name: "Bahia", src: artBA },
  CE: { name: "Ceará", src: artCE },
  DF: { name: "Distrito Federal", src: artDF },
  ES: { name: "Espírito Santo", src: artES },
  GO: { name: "Goiás", src: artGO },
  MA: { name: "Maranhão", src: artMA },
  MG: { name: "Minas Gerais", src: artMG },
  MS: { name: "Mato Grosso do Sul", src: artMS },
  MT: { name: "Mato Grosso", src: artMT },
  PA: { name: "Pará", src: artPA },
  PB: { name: "Paraíba", src: artPB },
  PE: { name: "Pernambuco", src: artPE },
  PI: { name: "Piauí", src: artPI },
  PR: { name: "Paraná", src: artPR },
  RN: { name: "Rio Grande do Norte", src: artRN },
  RO: { name: "Rondônia", src: artRO },
  RR: { name: "Roraima", src: artRR },
  RS: { name: "Rio Grande do Sul", src: artRS },
  SC: { name: "Santa Catarina", src: artSC },
  SE: { name: "Sergipe", src: artSE },
  SP: { name: "São Paulo", src: artSP },
  RJ: { name: "Rio de Janeiro", src: artRJ },
} as const;

export type StateArtworkCode = keyof typeof STATE_HEADER_ART;
export interface StateHeaderArtEntry { name: string; src: string }

export function getStateHeaderArt(stateCode: string): StateHeaderArtEntry | undefined {
  return Object.prototype.hasOwnProperty.call(STATE_HEADER_ART, stateCode)
    ? STATE_HEADER_ART[stateCode as StateArtworkCode]
    : undefined;
}

export function StateHeaderArtwork({ stateCode }: { stateCode: string }) {
  const art = getStateHeaderArt(stateCode);
  return art ? <img className="pe-landscape" src={art.src} alt="" aria-hidden="true" data-state-art={stateCode} draggable={false}/> : null;
}
