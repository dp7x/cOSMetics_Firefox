# Firefox port — cOSMetics 1.90.2

Based on `dp7x/cOSMetics_Chrome` commit `ccaa2617182f678b4961d88717ba123ea812b416` (9 October 2026). Port prepared on 21 October 2026. Independent repository target: `dp7x/cOSMetics_Firefox`.

Changes from Chrome:

- Native `browser.*` promise APIs, including preference loading and saving.
- JSON string payloads for all page/content-script events, avoiding Firefox's cross-context object access restrictions. Page requests remain validated by the iD bridge.
- Firefox add-on ID `cosmetics-firefox@dp7x.github.io`; desktop minimum version 140. Android has a separate minimum of 142 for manifest compatibility, but this release is intended and documented for desktop, not validated for Android.
- Built-in consent declaration for map-location transmission to Nominatim/Overture. No telemetry, Strava integration or authentication-cookie permissions.
- Correct 64-pixel icon declaration. Popup layer fields use DOM creation and translated help text uses a limited safe markup parser.
- PMTiles fetch buffers are copied into extension-owned memory, with bundled fflate gzip decoding for both archive directories and vector tiles. No new permissions.
- Overture bundle rebuilt for Firefox 140 using the same pinned dependencies and unchanged third-party license notices.
- Firefox installation instructions, privacy policy, regression tests and source build files included.

Version 1.90.2 fixes Firefox PMTiles buffer ownership and gzip decoding; the Chrome functionality baseline remains 1.90. No Chrome source files were changed by this port.

The add-on package is unsigned and intended for temporary loading through `about:debugging`. Store signing and publication have not been performed. Before AMO submission, complete the manual checks in `FIREFOX_TESTING.md` and choose desktop support only.


## Validation completed on 21 October 2026

- Mozilla `web-ext` 10.8.0 lint: zero errors, zero notices, zero warnings.
- Seven Node regression suites: comments/matrix/ranking, six-language comments, GeoJSON grid, geometry bridge, native hashtag changes PMTiles buffer/gzip handling and local OSMChange Blob reading.
- Firefox 158.0.1 with geckodriver 0.37.1 in a disposable test profile: temporary add-on installation, MAIN/ISOLATED JSON transport, building creation in a simulated iD context, popup rendering, fixed Save footer, preference persistence and hashtag prefilling without changing a manual comment. External network was blocked for this test. The test copy changed only the match patterns to a local fixture and added a test probe; those changes are absent from the deliverable.
- Production Overture tile loading and the real authenticated iD upload UI still require the manual checks in `FIREFOX_TESTING.md`. No changesets were uploaded and no store submission was made.

- Firefox 158.0.1 regression: reproduced the constructor permission error before the fix; the corrected build loads a generated PMTiles v3 fixture over HTTP byte ranges, decompresses the gzip directory and tile, and renders one building. This is a local fixture, not a live Overture service test.

- Firefox 1.90.2: capture iD export Blobs until URL revocation and read the current OSMChange export directly through the JSON bridge, avoiding fetch(blob:) under the website CSP. No CSP or permission changes. Both comment analysis and coordinate fallback use this reader.
- Firefox 158.0.1 regression with connect-src *: confirmed fetch(blob:) fails, then clicked Suggest and verified the generated tree comment; the same session also loaded the PMTiles fixture successfully.
