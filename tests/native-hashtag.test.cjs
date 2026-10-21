const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('./src/id-bridge.js','utf8');let handler,reply,shown=false,fieldsAvailable=true,prefs={},calls=0;
const context={changeset:{tags:{comment:'A manually written comment',hashtags:'#Other'},update({tags}){return {...this,tags}}},maxCharsForTagValue:()=>255};
const field={on:key=>key==='change'?function(changed){calls++;let tags={...context.changeset.tags};if(changed.hashtags===undefined)delete tags.hashtags;else tags.hashtags=changed.hashtags;context.changeset=context.changeset.update({tags});prefs.hashtags=tags.hashtags;shown=!!tags.hashtags}:null};
const commentInput={dispatchEvent(){shown=!!context.changeset.tags.hashtags}};
const panel={querySelector:selector=>selector==='.wrap-form-field-hashtags'?(shown&&fieldsAvailable?{__data__:field}:null):commentInput};
vm.runInNewContext(source.slice(source.indexOf('  function bridgeEvent'),source.indexOf('  let context;')) + source.slice(source.indexOf('  // Use iD\'s own changeset'),source.indexOf('  function attach(api)')),{context,document:{querySelector:()=>panel,addEventListener:(name,fn)=>handler=fn,dispatchEvent:e=>{assert.equal(typeof e.detail,'string');reply=JSON.parse(e.detail)}},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o.detail}},Event:class{},console});
function apply(hashtag,previous=''){handler({detail:JSON.stringify({hashtag,previous})});return reply.ok}
assert(apply('#MissingMaps'));assert.equal(context.changeset.tags.hashtags,'#Other;#MissingMaps');assert.equal(prefs.hashtags,'#Other;#MissingMaps');assert.equal(context.changeset.tags.comment,'A manually written comment');assert(shown);assert.equal(calls,1);
assert(apply('#missingmaps'));assert.equal(context.changeset.tags.hashtags,'#Other;#MissingMaps');
assert(apply('#New','#MissingMaps'));assert.equal(context.changeset.tags.hashtags,'#Other;#New');assert(apply('','#New'));assert.equal(context.changeset.tags.hashtags,'#Other');assert.equal(prefs.hashtags,'#Other');
context.changeset=context.changeset.update({tags:{comment:'Manual'}});shown=false;assert(apply('#Tag'));assert.equal(context.changeset.tags.hashtags,'#Tag');assert(shown);assert.equal(prefs.hashtags,'#Tag');assert(apply('','#Tag'));assert(!context.changeset.tags.hashtags);assert.equal(prefs.hashtags,undefined);
shown=false;fieldsAvailable=false;const before=context.changeset.tags;assert(!apply('#Tag'));assert.deepEqual(context.changeset.tags,before);assert(!apply('#two tags'));fieldsAvailable=true;
context.changeset=context.changeset.update({tags:{comment:'Manual',hashtags:'#'+ 'x'.repeat(253)}});shown=true;assert(!apply('#New'));assert.equal(context.changeset.tags.hashtags.length,254);
console.log('PASS: standard field callback, hidden-field reveal, metadata/prefs, manual comment, deduplication, replace/clear, other tags and rollback.');
