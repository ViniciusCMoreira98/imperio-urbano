/** Isolated visual study; never enabled in a production build. */
const study=import.meta.env.DEV&&typeof window!=='undefined'?new URLSearchParams(window.location.search).get('mobileStyle'):null;
export const mobileCleanStudy=study==='clean'||study==='spacious'||study==='rectangular';
export const mobileSpaciousStudy=study==='spacious'||study==='rectangular';
export const mobileRectangularStudy=study==='rectangular';
