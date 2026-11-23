# cOSMetics for iD 2.11 — reviewer build instructions

This source archive corresponds to cOSMetics-Firefox-2.11-AMO.zip.

## Requirements

- Node.js 24 (verified using 24.22.3) and npm 11 (verified using 11.19.1).
- Linux was used for the verification build.
- Internet access to the official npm registry for dependency installation.

From the root of the extracted source archive, run:

```sh
npm ci --registry=https://registry.npmjs.org
npm run build
npm test
```

`package-lock.json` pins all build dependencies. No global esbuild installation
is needed. Dependencies are downloaded by npm only; do not use npm update.

The only bundled/minified JavaScript output is `dist/overture.js`.
Its entry point is `src/overture.js`. The build bundles its imported npm
libraries and local modules, including `src/pmtiles-firefox.js`, using esbuild.
The exact esbuild command and Firefox target are in package.json.

All other runtime JavaScript, CSS, HTML, JSON and locale files are supplied
in source form and copied unchanged into the installable package. In particular,
ui-i18n.js is supplied as editable JavaScript; ui-i18n-source.json contains its
translation lookup table. It requires no separate generation step.

To verify, extract the installable AMO ZIP to a different directory and compare
its dist/overture.js byte-for-byte against the rebuilt dist/overture.js. Compare
all remaining runtime files directly with the same paths in this source archive.
The source archive additionally includes tests and build/development documents;
these are not part of the installable package. Do not package node_modules.

## Version 2.11

Fixes iD startup with Strava Heatmap enabled by retaining iD exports as own
enumerable properties when wrapping coreContext. This preserves the API when
another extension copies it with object spread. No new permissions are added.
