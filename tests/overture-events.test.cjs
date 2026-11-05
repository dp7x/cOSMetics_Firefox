const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
test('Overture creates native events with JSON payloads without recursive allocation',()=>{
  const source=fs.readFileSync('src/overture.js','utf8');
  let constructed=0;
  class CustomEvent {
    constructor(type,options){constructed++;this.type=type;this.detail=options.detail;}
  }
  const context=vm.createContext({CustomEvent});
  vm.runInContext(source.slice(0,source.indexOf('import {')),context);
  for(const [type,payload] of [
    ['cosmetics:check-buildings',{candidates:[{id:'building-1',ring:[[12,42],[12.1,42],[12,42.1],[12,42]]}]}],
    ['cosmetics:add-building',{ring:[[12,42],[12.1,42],[12,42.1],[12,42]],source:'Microsoft ML Buildings'}]
  ]){
    const event=context.bridgeEvent(type,{detail:payload});
    assert(event instanceof CustomEvent);assert.equal(event.type,type);
    assert.equal(typeof event.detail,'string');assert.deepEqual(JSON.parse(event.detail),payload);
    assert.deepEqual(JSON.parse(JSON.stringify(context.bridgeDetail(event))),payload);
  }
  assert.equal(constructed,2);
});
