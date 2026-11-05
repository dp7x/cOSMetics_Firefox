const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('floating-panels.js','utf8');
test('Panel styles are adopted independently from HTML, including opaque dark backgrounds',()=>{
  class CSSStyleSheet{replaceSync(css){this.css=css;}}
  const context={CSSStyleSheet};vm.runInNewContext(source,context);
  for(const file of ['fixer.js','simplify.js']){
    const panel=fs.readFileSync(file,'utf8');
    const css=panel.slice(panel.indexOf('<style>')+7,panel.indexOf('</style>'));
    const shadow={adoptedStyleSheets:[]};
    context.CosmeticsFloatingPanels.mount(shadow,`<style>${css}</style><section>Panel</section>`);
    assert.equal(shadow.adoptedStyleSheets.length,1);
    assert.equal(shadow.adoptedStyleSheets[0].css,css);
    assert(!shadow.innerHTML.includes('<style>'));
    assert(css.includes('background:#fff'));
    assert(css.includes('background:#24282d'));
  }
});
test('If adopted styles are unavailable, an explicit style element receives the bundled CSS',()=>{
  let inserted;
  const context={document:{createElement(tag){assert.equal(tag,'style');return {};}}};
  vm.runInNewContext(source,context);
  const shadow={prepend(node){inserted=node;}};
  context.CosmeticsFloatingPanels.mount(shadow,'<style>.panel{background:#fff}</style><section>Panel</section>');
  assert.equal(inserted.textContent,'.panel{background:#fff}');
});
test('Dragging follows window pointer moves without pointer capture and stops on release',()=>{
  function target(){const events=new Map();return {style:{},addEventListener(k,f){if(!events.has(k))events.set(k,new Set());events.get(k).add(f);},removeEventListener(k,f){events.get(k)?.delete(f);},fire(k,e){for(const f of events.get(k)||[])f({...e,type:k});}};}
  const window=target(),heading=target();
  const context={window,innerWidth:900,innerHeight:600};vm.runInNewContext(source,context);
  const host={style:{right:'16px',bottom:'24px'},offsetWidth:310,getBoundingClientRect:()=>({left:100,top:80})};
  context.CosmeticsFloatingPanels.draggable(host,heading);
  const event={button:0,pointerId:1,clientX:110,clientY:90,target:{closest:()=>false},preventDefault(){},stopPropagation(){}};
  heading.fire('pointerdown',event);
  window.fire('pointermove',{...event,clientX:310,clientY:190});
  assert.equal(host.style.left,'300px');assert.equal(host.style.top,'180px');
  assert.equal(host.style.right,'auto');assert.equal(host.style.bottom,'auto');
  window.fire('pointermove',{...event,clientX:2000,clientY:2000});
  assert.equal(host.style.left,'590px');assert.equal(host.style.top,'555px');
  window.fire('pointerup',event);
  window.fire('pointermove',{...event,clientX:0,clientY:0});assert.equal(host.style.left,'590px');
  heading.fire('pointerdown',{...event,composedPath:()=>[{closest:()=>true}]});
  window.fire('pointermove',{...event,clientX:0,clientY:0});assert.equal(host.style.left,'590px');
});
