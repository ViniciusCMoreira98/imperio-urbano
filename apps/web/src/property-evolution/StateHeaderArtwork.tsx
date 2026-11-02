import artAC from './art/states/ac-header-v1.png';
import artAL from './art/states/al-header-v1.png';
import artAM from './art/states/am-header-v1.png';
import artAP from './art/states/ap-header-v1.png';
import artBA from './art/states/ba-header-v1.png';
import artCE from './art/states/ce-header-v1.png';
import artDF from './art/states/df-header-v1.png';
import artES from './art/states/es-header-v1.png';
import artGO from './art/states/go-header-v1.png';
import artMA from './art/states/ma-header-v1.png';
import artMG from './art/states/mg-header-v1.png';
import artMS from './art/states/ms-header-v1.png';
import artMT from './art/states/mt-header-v1.png';
import artPA from './art/states/pa-header-v1.png';
import artPB from './art/states/pb-header-v1.png';
import artPE from './art/states/pe-header-v1.png';
import artPI from './art/states/pi-header-v1.png';
import artPR from './art/states/pr-header-v1.png';
import artRN from './art/states/rn-header-v1.png';
import artRO from './art/states/ro-header-v1.png';
import artRR from './art/states/rr-header-v1.png';
import artRS from './art/states/rs-header-v1.png';
import artSC from './art/states/sc-header-v1.png';
import artSE from './art/states/se-header-v1.png';
import artSP from './art/states/sp-header-v1.png';
import artRJ from './art/rio-header-v2.png';

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
