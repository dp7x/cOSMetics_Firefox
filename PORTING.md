# Firefox port — cOSMetics 2.02

Aligned with the Chrome 2.02 sources on 5 November 2026, including Bricks drawing and snapping, Sensei tag review, Ockham simplification, automatic grid display and page-local panel activation.

Firefox adaptations retained:

- Native `browser.*` APIs and promise-based storage.
- JSON strings for page/content-script event payloads.
- Direct reading of iD's exported OSMChange Blob, avoiding CSP-blocked `fetch(blob:)`.
- Extension-owned PMTiles buffers and bundled fflate gzip decoding.
- Safe DOM creation for popup layer fields and restricted translated markup.
- Shadow-panel CSS installed separately from markup; shared window-based dragging.
- Existing AMO ID `{9d40858a-d02a-4a1c-96e6-af64b68ff68f}`, permissions and Firefox desktop minimum version 140.

The technical manifest version is `2.0.2` (no leading zeros). The popup and
release documentation retain the display label `2.02`.
No new permissions were added. The add-on is intended for desktop Firefox;
Android has not been validated.

Build: `npm ci`, then `npm run build`. Run regression checks with `npm test`.
The included bundle is ready for temporary installation without building.

Automated checks cover the new tools, JSON bridge startup, grid replacement,
six languages, comment generation, hashtags, Blob access and PMTiles decoding.
This port has not yet been tested interactively in Firefox with the real iD
editor. Complete the checks in `FIREFOX_TESTING.md` before store submission.
