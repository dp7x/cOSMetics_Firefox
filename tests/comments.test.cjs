const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('./content.js','utf8');
const en=JSON.parse(fs.readFileSync('./_locales/en/messages.json','utf8'));
class Element {constructor(name,attrs={},children=[]){this.tagName=name;this.attrs=attrs;this.children=children}getAttribute(k){return this.attrs[k]??null}getElementsByTagName(k){return this.children.flatMap(e=>[...(e.tagName===k?[e]:[]),...e.getElementsByTagName(k)])}}
const tag=(k,v)=>new Element('tag',{k,v}),node=(id,tags={})=>new Element('node',{id:String(id)},Object.entries(tags).map(([k,v])=>tag(k,v))),way=(id,n,tags)=>new Element('way',{id:String(id)},[...Array.from({length:n},(_,i)=>new Element('nd',{ref:String(id*100+i)})),...Object.entries(tags).map(([k,v])=>tag(k,v))]),rel=(id,members,tags)=>new Element('relation',{id:String(id)},[...members.map(([type,ref])=>new Element('member',{type,ref:String(ref)})),...Object.entries(tags).map(([k,v])=>tag(k,v))]);
let docTree,parents=[],loaded={};const listeners={};const document={querySelector:()=>({href:'blob:test'}),addEventListener:(k,f)=>listeners[k]=f,removeEventListener:k=>delete listeners[k],dispatchEvent:e=>{if(e.type==='cosmetics:modified-node-parents')listeners['cosmetics:modified-node-parents-result']?.({detail:JSON.stringify({parents})});if(e.type==='cosmetics:geometry-points')listeners['cosmetics:geometry-points-result']?.({detail:JSON.stringify({points:loaded})})}};
const ctx=vm.createContext({document,CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail}},fetch:async()=>({text:async()=>''}),DOMParser:class{parseFromString(){return docTree}},console:{log(){},error(){}},browser:{i18n:{getUILanguage:()=> 'en',getMessage:k=>en[k]?.message||''}},commentMessages:async()=>en});
const helper=source.slice(source.indexOf('    function commentText'),source.indexOf('// Gets geographic area'));
const generator=source.slice(source.indexOf('    async function generateComment'),source.indexOf('   // Updated version of insertSuggestedComment'));
vm.runInContext(source.slice(source.indexOf('  function bridgeEvent'),source.indexOf('    const t ='))+'\n'+helper+'\n'+generator,ctx);
async function analyze(created=[],modified=[]){docTree=new Element('osmChange',{},[new Element('create',{},created),new Element('modify',{},modified)]);return vm.runInContext('analyzeChangesFromOsmChange()',ctx)}
async function comment(data){ctx.input=data;return vm.runInContext("generateComment(input,'Roma',true)",ctx)}
(async()=>{
let data=await analyze([node(-1,{natural:'tree',leaf_type:'broadleaved',leaf_cycle:'deciduous'}),node(-2,{natural:'tree'}),node(-3,{natural:'tree'}),node(-4,{natural:'tree'}),way(-10,12,{natural:'wood'}),way(-11,14,{natural:'wood'}),way(-12,6,{building:'yes'}),way(-13,7,{building:'yes'}),way(-14,5,{landuse:'farmland'}),way(-15,5,{landuse:'farmland'}),node(-50,{amenity:'school'})],[way(1,4,{highway:'path',service:'driveway'})]);
assert.equal(await comment(data),'Created trees, woods, buildings, farmlands + modified highways + other improvements in Roma area');
assert.equal(data.created['natural=tree'],4);assert.equal(data.createdPoints['natural=wood'],26);assert(!('leaf_type' in data.created));
data=await analyze([way(-1,6,{landuse:'farmland'}),way(-2,9,{building:'yes'}),way(-3,15,{natural:'wood'}),way(-4,3,{waterway:'river'})]);assert.equal(await comment(data),'Created woods, buildings, farmlands, rivers in Roma area');
// No tail when four categories in each section are all shown.
assert(!(await comment({created:{building:2,natural:1},modified:{highway:3,shop:1}})).includes('other improvements'));
// Closure point counted once.
const closed=way(-6,4,{building:'yes'});closed.children.splice(4,0,new Element('nd',{ref:'-600'}));data=await analyze([closed]);assert.equal(data.createdPoints.building,4);
// Relation fallback, with local member geometries and duplicate/cyclic members.
const r=rel(-20,[['way',-21],['way',-21],['relation',-20]],{type:'multipolygon'});data=await analyze([r,way(-21,8,{})]);assert.equal(data.created.type,1);assert.equal(data.createdPoints.type,8);assert.equal(await comment(data),'Created relations in Roma area');
loaded={'r-20':40};data=await analyze([r]);assert.equal(data.createdPoints.type,40);loaded={};
data=await analyze([rel(-22,[],{type:'route',route:'hiking'})]);assert.equal(data.created['route=hiking'],1);assert(!data.created.type);
// Geometry-only nodes classify parent ways once, skipping ways already in modify.
parents=[{id:'w10',tags:{natural:'wood'},pointCount:25},{id:'w11',tags:{highway:'residential'},pointCount:7}];data=await analyze([],[node(100),node(101),way(11,7,{highway:'residential'})]);assert.equal(data.modified['natural=wood'],1);assert.equal(data.modified.highway,1);assert.equal(await comment(data),'Modified woods, highways in Roma area');parents=[];data=await analyze([],[node(1)]);assert.equal(await comment(data),'Modified geometries in Roma area');
// New values supplied by the user and unknown future master.
data=await analyze([node(-8,{amenity:'place_of_worship'}),node(-9,{historic:'monument'}),node(-10,{tourism:'attraction'}),node(-11,{AI:'chatgpt'})]);assert.equal(await comment(data),'Created places of worship, monuments, attractions, AI in Roma area');
// Stable ordering when both count and point sum are tied.
assert.equal(await comment({created:{shop:1,building:1},createdPoints:{shop:5,building:5}}),'Created shops, buildings in Roma area');
console.log('PASS: matrix labels, master selection, frequency/complexity ranking, four-category limit, omissions, closed ways, relations, parent ways, future keys.');
})().catch(e=>{console.error(e);process.exit(1)});
