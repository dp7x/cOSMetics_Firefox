const assert = require('node:assert/strict');
const vm = require('node:vm');
const { gzipSync } = require('node:zlib');
const { buildSync } = require('esbuild');
const code = buildSync({ entryPoints: ['src/pmtiles-firefox.js'], bundle: true,
  format: 'cjs', platform: 'browser', write: false }).outputFiles[0].text;
const context = vm.createContext({ module: { exports: {} }, exports: {} });
vm.runInContext(code, context);
const { ownedBuffer, decompress } = context.module.exports;

(async () => {
  // The module and these inputs have distinct JavaScript realms.
  const input = new Uint8Array([99, 1, 2, 3, 88]);
  const copy = ownedBuffer(input.subarray(1, 4));
  assert.deepEqual([...new Uint8Array(copy)], [1, 2, 3]);
  input[1] = 42;
  assert.equal(new Uint8Array(copy)[0], 1);
  assert.equal(vm.runInContext('ArrayBuffer', context).prototype, Object.getPrototypeOf(copy));
  const expected = Buffer.from('gzip PMTiles directory and vector tile');
  assert.deepEqual(Buffer.from(await decompress(gzipSync(expected), 2)), expected);
  assert.deepEqual([...new Uint8Array(await decompress(new Uint8Array([7, 8]).buffer, 1))], [7, 8]);
  await assert.rejects(decompress(new ArrayBuffer(0), 3), /not supported/);
  await assert.rejects(decompress(new Uint8Array([1, 2]).buffer, 2));
  console.log('PASS: cross-realm buffers, byte offsets, independent storage, gzip decoding and unsupported/corrupt data.');
})().catch(error => { console.error(error); process.exitCode = 1; });
