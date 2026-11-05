const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
test('All MAIN-world modules start together and grid transport preserves existing custom data',()=>{
  const listeners=new Map(),responses=[];
  const document={documentElement:{dataset:{}},querySelector:()=>null,
    addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);},
    dispatchEvent(event){if(event.type.endsWith('-result')){assert.equal(typeof event.detail,'string');responses.push(JSON.parse(event.detail));}
      for(const fn of listeners.get(event.type)||[])fn(event);},removeEventListener(){}};
  let occupied=true,loaded,mode='browse';
  const layer={hasData:()=>occupied,enabled(){},setFile(ext,text){assert.equal(ext,'.geojson');loaded=JSON.parse(text);occupied=true;}};
  const editor={mode:()=>({id:mode}),editable:()=>true,layers:()=>({layer:()=>layer})};
  const scope={document,window:{addEventListener(){}},Blob,URL:{createObjectURL(){},revokeObjectURL(){}},console,setTimeout,clearTimeout,
    CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}}};
  const context=vm.createContext(scope);
  for(const file of ['simplify-core.js','fixer-core.js','src/fixer-bridge.js','src/simplify-bridge.js','src/draw-building.js','src/id-bridge.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
  scope.window.iD={coreContext:()=>editor};scope.window.iD.coreContext();
  assert.equal(document.documentElement.dataset.cosmeticsIdBridge,'ready');
  for(const type of ['cosmetics:fixer-request','cosmetics:simplify-request','cosmetics:draw-building-toggle','cosmetics:read-osmchange'])assert(listeners.has(type),type);
  function request(value){document.dispatchEvent({type:'cosmetics:grid-request',detail:JSON.stringify(value)});return responses.at(-1);}
  assert.deepEqual(request({action:'probe'}),{status:'ready',occupied:true});
  const data={type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[]},properties:{}}]};
  assert.equal(request({action:'show',data}).status,'occupied');assert.equal(loaded,undefined);
  assert.equal(request({action:'show',data,replace:true}).status,'shown');assert.deepEqual(loaded,data);
  mode='save';assert.equal(request({action:'show',data,replace:true}).status,'unavailable');
});
