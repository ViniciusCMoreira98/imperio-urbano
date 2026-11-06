import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../../', import.meta.url);
const directory = 'apps/web/src/settings-art/art/';
await mkdir(new URL(directory, root), { recursive: true });
const defs = `<defs><linearGradient id="gold" x2=".15" y2="1"><stop stop-color="#fffbd2"/><stop offset=".18" stop-color="#fff13b"/><stop offset=".49" stop-color="#ffbf00"/><stop offset=".73" stop-color="#fff079"/><stop offset="1" stop-color="#a95200"/></linearGradient><linearGradient id="silver" x2=".3" y2="1"><stop stop-color="white"/><stop offset=".5" stop-color="#c1d4e9"/><stop offset="1" stop-color="#6f86a2"/></linearGradient><linearGradient id="blue" x2=".2" y2="1"><stop stop-color="#106ed6"/><stop offset=".35" stop-color="#074596"/><stop offset="1" stop-color="#001c48"/></linearGradient><linearGradient id="navy" x2=".15" y2="1"><stop stop-color="#12579b"/><stop offset=".45" stop-color="#062d60"/><stop offset="1" stop-color="#001125"/></linearGradient><linearGradient id="green" x2=".1" y2="1"><stop stop-color="#74e500"/><stop offset=".25" stop-color="#11a500"/><stop offset="1" stop-color="#004400"/></linearGradient><linearGradient id="red" x2=".1" y2="1"><stop stop-color="#ff7664"/><stop offset=".3" stop-color="#d30a12"/><stop offset="1" stop-color="#65000a"/></linearGradient><filter id="shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="1.5" flood-opacity=".65"/></filter></defs>`;
const svg = (body, width, height, stretch = false) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"${stretch ? ' preserveAspectRatio="none"' : ''}>${defs}${body}</svg>`;
const save = async (name, body, w = 128, h = 128, stretch = false) => writeFile(new URL(directory + name + '-v1.svg', root), svg(body, w, h, stretch));
const frame = (w, h, radius, fill, border = 10) => `<rect x="3" y="7" width="${w-6}" height="${h-10}" rx="${radius}" fill="#502900"/><rect x="3" y="2" width="${w-6}" height="${h-10}" rx="${radius}" fill="url(#gold)"/><rect x="8" y="7" width="${w-16}" height="${h-20}" rx="${radius-5}" fill="none" stroke="#fffedb" stroke-width="2"/><rect x="${border+3}" y="${border+2}" width="${w-2*border-6}" height="${h-2*border-10}" rx="${radius-border}" fill="url(#${fill})" stroke="${fill==='green'?'#b8f24b':'#26ccff'}" stroke-width="2"/><path d="M${radius} 6H${w-radius}" stroke="white" stroke-opacity=".65" stroke-width="2"/>`;
await save('panel-frame', frame(1200, 750, 64, 'blue', 17), 1200, 750, true);
await save('heading-frame', frame(740, 118, 59, 'navy', 11), 740, 118, true);
await save('section-frame', '<rect x="4" y="7" width="542" height="350" rx="30" fill="#000e29" fill-opacity=".7"/><rect x="3" y="3" width="544" height="350" rx="30" fill="url(#blue)" stroke="#00cbff" stroke-width="3"/><path d="M34 5h482" stroke="#b0efff" stroke-opacity=".5" stroke-width="2"/>', 550, 360, true);
for (const name of ['navy', 'green', 'red']) await save('button-' + name, frame(500, 100, 50, name, 9), 500, 100, true);
for (const [name, fill] of [['active', 'green'], ['inactive', 'navy']]) await save('tab-' + name, frame(400, 90, 45, fill, 9), 400, 90, true);
await save('close', '<g filter="url(#shadow)"><circle cx="64" cy="62" r="58" fill="url(#gold)"/><circle cx="64" cy="62" r="52" fill="url(#red)" stroke="#ffeda8" stroke-width="2"/><path d="m42 40 44 44m0-44-44 44" fill="none" stroke="white" stroke-width="12" stroke-linecap="round"/></g>');
await save('toggle-on', frame(132, 60, 30, 'green', 5) + '<path d="m73 28 12 11 23-24" fill="none" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>', 132, 60);
await save('toggle-off', '<rect x="2" y="5" width="128" height="52" rx="26" fill="#000a19"/><rect x="3" y="2" width="126" height="51" rx="25.5" fill="url(#navy)" stroke="url(#silver)" stroke-width="4"/><circle cx="29" cy="27" r="20" fill="url(#silver)" stroke="#f1f8ff" stroke-width="2"/><path d="m91 19 17 17m0-17-17 17" stroke="white" stroke-width="5" stroke-linecap="round"/>', 132, 60);
await save('slider-track', '<rect x="2" y="2" width="396" height="22" rx="11" fill="url(#navy)" stroke="#66b6e6" stroke-width="2"/>', 400, 26, true);
await save('slider-fill', '<rect x="2" y="2" width="396" height="22" rx="11" fill="url(#gold)" stroke="#fff7a4" stroke-width="2"/>', 400, 26, true);
await save('slider-thumb', '<circle cx="25" cy="27" r="23" fill="#552300" fill-opacity=".7"/><circle cx="25" cy="24" r="22" fill="url(#gold)" stroke="#fff6a6" stroke-width="2"/>', 50, 52);
await save('select-frame', frame(500, 86, 43, 'navy', 7), 500, 86, true);
await save('segment-selected', frame(180, 70, 35, 'gold', 5).replace('url(#gold)" stroke="#26ccff"', 'url(#gold)" stroke="#fff8b9"'), 180, 70, true);
const icons = {
  profile: '<circle cx="64" cy="31" r="23"/><path d="M18 115V96a46 46 0 0 1 92 0v19Z"/>',
  music: '<path d="M48 88V26l61-14v65" fill="none" stroke="url(#gold)" stroke-width="12"/><path d="m49 30 59-14v22L49 51Z"/><ellipse cx="31" cy="91" rx="22" ry="16"/><ellipse cx="92" cy="81" rx="22" ry="16"/>',
  speaker: '<path d="M9 45h23L64 20v88L32 83H9Z"/><path d="M81 42q23 22 0 44m13-60q39 38 0 76" fill="none" stroke="url(#gold)" stroke-width="9" stroke-linecap="round"/>',
  monitor: '<rect x="9" y="14" width="110" height="77" rx="9"/><rect x="20" y="24" width="88" height="54" rx="3" fill="#063677"/><path d="M55 92v13H38v9h52v-9H73V92Z"/>',
  performance: '<path d="M13 96a53 53 0 1 1 102 0l-12-4a40 40 0 1 0-77 0Z"/><path d="m64 71 31-32-18 42Z"/><circle cx="65" cy="78" r="11"/><path d="m21 61 11 4m3-33 8 9m21-21v12m29 1-8 9m21 20-11 4" fill="none" stroke="#fff5a5" stroke-width="4"/>',
  shield: '<path d="M64 9q24 14 49 13c0 45-6 68-49 93C21 90 15 67 15 22q25 1 49-13Z"/><path d="M64 24q17 9 34 10c-2 32-7 47-34 65-27-18-32-33-34-65 17-1 34-10Z" fill="#06336c"/>',
  document: '<path d="M25 10h54l24 24v82H25Z"/><path d="M79 12v24h22M39 53h50M39 70h50M39 87h31" fill="none" stroke="#574000" stroke-width="6"/>',
  lock: '<path d="M34 53V34a30 30 0 0 1 60 0v19" fill="none" stroke="url(#gold)" stroke-width="10"/><rect x="20" y="49" width="88" height="65" rx="10"/><circle cx="64" cy="76" r="9" fill="#473000"/><path d="M64 81v15" stroke="#473000" stroke-width="8"/>',
  headset: '<path d="M21 76V58a43 43 0 0 1 86 0v28q0 24-32 24" fill="none" stroke="url(#gold)" stroke-width="10"/><rect x="10" y="57" width="25" height="39" rx="9"/><rect x="93" y="57" width="25" height="39" rx="9"/><rect x="59" y="102" width="25" height="13" rx="6"/>',
  trash: '<path d="M31 35h66l-5 79H36Z" fill="url(#silver)" stroke="#53677c"/><path d="M22 27h84M47 25V12h34v13M49 46v53m15-53v53m15-53v53" fill="none" stroke="url(#silver)" stroke-width="8" stroke-linecap="round"/>',
  link: '<path d="m46 79-7 7a21 21 0 0 1-30-30l29-29a21 21 0 0 1 30 0m14 22 7-7a21 21 0 0 1 30 30L90 101a21 21 0 0 1-30 0M42 85l45-45" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round"/>',
  logout: '<path d="M57 16H20v96h37" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linejoin="round"/><path d="M48 64h68M91 37l27 27-27 27" fill="none" stroke="url(#gold)" stroke-width="11" stroke-linecap="round"/>',
  check: '<path d="m20 64 28 28 62-66" fill="none" stroke="white" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>',
  chevron: '<path d="m25 45 39 37 39-37" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>',
  reset: '<path d="M26 46a43 43 0 1 1-2 45M26 20v29H3" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>',
};
for (const [name, body] of Object.entries(icons)) await save(name, `<g fill="url(#gold)" stroke="#7b4300" stroke-width="2" stroke-linejoin="round" filter="url(#shadow)">${body}</g>`);
await save('skyline', '<g fill="#0d9adb" opacity=".65"><path d="M0 130V96h10V70h14v60h8V92h18v38h10V65h14v65h8V100h17v30h12V90h16v40h17V106h20v24h12V88h14v42h600V98h18v32h9V75h13v55h9V96h18v34h12V88h16v42h12V104h20v26h12V78h16v52h16V68h16v62h12V91h20v39h19V76h17v54Z"/><path d="M105 130q18-85 46-107 24 12 42 107Z"/><path d="M140 130q20-55 43-67 20 18 33 67Zm780 0q33-39 78-43 44-4 79 43Z"/><path d="M999 89V44h-6l-20-7 2-6 24 6 5-8 5 8 23-6 2 6-20 7h-6v45Z"/><circle cx="1004" cy="24" r="5"/></g>', 1200, 140, true);
const records=[];
for (const name of (await readdir(new URL(directory,root))).filter(n=>n.endsWith('.svg')).sort()) {
 const file=directory+name, bytes=await readFile(new URL(file,root));
 records.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await mkdir(new URL('assets/settings/',root),{recursive:true});
await writeFile(new URL('assets/settings/manifest.json',root),JSON.stringify({version:1,date:'2026-11-06',provider:'Imperio Urbano original SVG pipeline',source:'scripts/assets/settings-vectors.mjs',designReferences:['assets/menu-inicial/settings-concept-v2.png','assets/menu-inicial/settings-sound-concept-v1.png','assets/menu-inicial/settings-account-concept-v1.png'],meshyCredits:0,newImageGeneration:false,records},null,2)+'\n');
console.log(`${records.length} assets SVG de configurações gerados.`);
