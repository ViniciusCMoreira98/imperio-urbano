import terrain from './art/optimized/terrain-v2.webp';
import house1 from './art/optimized/house-1-v2.webp';
import house2 from './art/optimized/house-2-v2.webp';
import house3 from './art/optimized/house-3-v2.webp';
import house4 from './art/optimized/house-4-v2.webp';
import hotel from './art/optimized/hotel-v2.webp';
import { StateHeaderArtwork } from './StateHeaderArtwork';
import coins from './art/optimized/coins-v2.webp';
import rentGrowth from './art/optimized/rent-growth-v2.webp';
import buildTools from './art/optimized/build-tools-v2.webp';

const buildings = [terrain, house1, house2, house3, house4, hotel] as const;

/** Artes originais geradas individualmente; procedência e prompts em art/provenance.json. */
export function BuildingArtwork({ level }: { level: number }) {
  const image = buildings[level];
  return image ? <img className="pe-building" src={image} alt="" aria-hidden="true" draggable={false}/> : null;
}

/** Paisagem original do RJ, não utilizar como ilustração de outras UFs. */
export function RioArtwork() {
  return <StateHeaderArtwork stateCode="RJ"/>;
}

export function InvestmentArtwork({ growth = false }: { growth?: boolean }) {
  return <img src={growth ? rentGrowth : coins} alt="" aria-hidden="true" draggable={false}/>;
}

export function BuildToolsArtwork() {
  return <img className="pe-tools" src={buildTools} alt="" aria-hidden="true" draggable={false}/>;
}

