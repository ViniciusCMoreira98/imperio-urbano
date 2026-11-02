import terrain from './art/terrain-v2.png';
import house1 from './art/house-1-v2.png';
import house2 from './art/house-2-v2.png';
import house3 from './art/house-3-v2.png';
import house4 from './art/house-4-v2.png';
import hotel from './art/hotel-v2.png';
import { StateHeaderArtwork } from './StateHeaderArtwork';
import coins from './art/coins-v2.png';
import rentGrowth from './art/rent-growth-v2.png';
import buildTools from './art/build-tools-v2.png';

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

