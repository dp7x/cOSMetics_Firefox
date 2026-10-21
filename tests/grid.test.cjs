const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('./popup-tools.js','utf8');
const context=vm.createContext({URL,URLSearchParams});
vm.runInContext(source.slice(source.indexOf('function readGridCenter'),source.indexOf('const gridSizeInput')),context);
assert.equal(vm.runInContext("readGridCenter('https://www.openstreetmap.org/edit?editor=id#map=18/43.2/13.4&layers=N').lat",context),43.2);
for(const url of ['https://openstreetmap.org.evil.example/#map=18/43/13','https://www.openstreetmap.org/#map=18//13','https://www.openstreetmap.org/#map=18/NaN/13','https://www.openstreetmap.org/#map=18/90/13'])assert.throws(()=>context.readGridCenter(url));
for(const pair of [[NaN,100],[1.5,100],[0,100],[11,100],[5,NaN],[5,99],[5,1001]])assert.throws(()=>context.generateGeoJSONGrid(13,43,...pair));
const grid=context.generateGeoJSONGrid(13,43,5,500);assert.equal(grid.features.length,25);
const ring=grid.features[0].geometry.coordinates[0];assert.deepEqual(ring[0],ring[4]);
const metersLat=(ring[0][1]-ring[1][1])*111320;assert(Math.abs(metersLat-500)<0.001);
const last=grid.features.at(-1).geometry.coordinates[0];assert(Math.abs((ring[0][0]+last[2][0])/2-13)<1e-9);assert(Math.abs((ring[0][1]+last[2][1])/2-43)<1e-9);
assert.throws(()=>context.generateGeoJSONGrid(180,43,10,1000));
const html=fs.readFileSync('./popup.html','utf8');assert.equal((html.match(/<details /g)||[]).length,4);assert(html.indexOf('</main>')<html.indexOf('id="saveButton"'));
const keys=[...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m=>m[1]);
for(const lang of ['en','it','sk','de','fr','es']){const locale=JSON.parse(fs.readFileSync(`./_locales/${lang}/messages.json`));for(const key of keys)assert(locale[key]?.message,`${lang}: ${key}`)}
console.log('PASS: map URL validation, grid bounds, dimensions, centre, GeoJSON rings, four sections, separate save footer and translated UI.');
