const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const listeners = {}, replies = [];
let link, counter = 0, revoked;
const urls = {
  createObjectURL: () => `blob:test-${++counter}`,
  revokeObjectURL: url => { revoked = url; }
};
const context = { window: {}, URL: urls, Blob,
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  document: { querySelector: () => link,
    addEventListener: (type, listener) => { listeners[type] = listener; },
    dispatchEvent: event => { replies.push(JSON.parse(event.detail)); } }
};
vm.runInNewContext(fs.readFileSync('src/id-bridge.js', 'utf8'), context);
async function read(url, requestId = 'test') {
  await listeners['cosmetics:read-osmchange']({ detail: JSON.stringify({ url, requestId }) });
  return replies.at(-1);
}
(async () => {
  const xml = '<osmChange><create><node id="-1"/></create></osmChange>';
  const url = urls.createObjectURL(new Blob([xml]));
  link = { href: url };
  assert.deepEqual(await read(url), { requestId: 'test', text: xml });
  const other = urls.createObjectURL(new Blob(['unrelated data']));
  assert((await read(other)).error);
  urls.revokeObjectURL(url);
  assert.equal(revoked, url);
  assert((await read(url)).error);
  assert((await read('https://example.com/')).error);
  console.log('PASS: direct local Blob reading, request correlation, current export restriction and revocation cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
