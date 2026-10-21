import { Compression, FetchSource, PMTiles, SharedPromiseCache } from 'pmtiles';
import { gunzipSync } from 'fflate';

// Firefox fetch/stream buffers can belong to the page compartment. Copy into
// extension-owned memory before PMTiles or Pbf calls slice/subarray on them.
export function ownedBuffer(buffer) {
  const input = ArrayBuffer.isView(buffer)
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);
  const copy = new Uint8Array(input.byteLength);
  copy.set(input);
  return copy.buffer;
}

export async function decompress(buffer, compression) {
  const own = ownedBuffer(buffer);
  if (compression === Compression.None || compression === Compression.Unknown) return own;
  if (compression === Compression.Gzip) {
    return ownedBuffer(gunzipSync(new Uint8Array(own)));
  }
  throw new Error('Compression method not supported');
}

class FirefoxFetchSource extends FetchSource {
  async getBytes(...args) {
    const response = await super.getBytes(...args);
    return { ...response, data: ownedBuffer(response.data) };
  }
}

export function createFirefoxArchive(url) {
  return new PMTiles(new FirefoxFetchSource(url),
    new SharedPromiseCache(100, true, decompress), decompress);
}
