# silverpoint for Tableau

Tableau viz extensions that draw [silverpoint](https://github.com/ecrespo/silverpoint) charts on the
Marks card: one extension per chart (55 of them), each with its own tiles — *X*, *Value*, *Row*, … —
drawn by silverpoint's standalone script, served with the page from this repository's GitHub Pages.

Draws with **silverpoint 0.10** (`@silverpoint/embed` 0.10.1, `silverpoint-embed.full.js`).

## For authors

1. Download the `.trex` of the chart you want from the [latest release](https://github.com/ecrespo/silverpoint-tableau/releases) (or `silverpoint-tableau-trex-X.Y.Z.zip`, all of them).
2. In a worksheet: *Marks card → mark type → Viz Extensions → Add Extension → Access Local Viz Extensions*, and choose the file.
3. Drag fields onto the extension's tiles. Until every required tile has a field, the chart says which ones to fill.
4. *Format Extension* opens the chart's options (curve, orientation, …), the view options (title, data table) and the appearance (ground, substrate, mode, palette). They are saved with the workbook.

The chart fills the worksheet, reads by keyboard (focus it, then the arrow keys), switches to the
precision mode when the system asks for high contrast, and — for a chart with one dimension tile —
selects the matching marks when you press Enter on an item.

## For administrators

The extensions are network-enabled and read **summary data only**: the manifests request no
`full data` permission. On Tableau Server or Tableau Cloud, allow this URL in the extension settings
(*Settings → Extensions → Enable specific extensions*):

```
https://ecrespo.github.io/silverpoint-tableau/v0.1/index.html
```

Each release line has its own folder (`/v0.1/`, `/v0.2/`, …) that never changes once released, so a
workbook keeps working after the next release. The page loads two scripts, both from that origin — the
Tableau Extensions API library and silverpoint's standalone file — and sends worksheet data nowhere.

## Requirements

Tableau Desktop, Server or Cloud **2024.2** or later (Extensions API 1.12, `min-api-version` of every
manifest). `candlestick-chart` has no extension: it has five roles and a viz extension takes at most
four tiles.

## Development

Node 22+. Specs are the source: `specs/prd.md` (TAB-REQ-001..010), `specs/technical-design.md`,
`specs/tasks.md` (status, ledger and deviations), `specs/poc.md` (the Extensions API calls).

```sh
npm install
npm run vendor -- --from ../silverpoint   # or: node scripts/vendor.mjs X.Y.Z (the release's hosts kit)
npm run generate                          # trex/*.trex and src/catalog.generated.ts
npm run check                             # both are current; the vendored script matches integrity.json
npm run typecheck
npm test                                  # Vitest: test/*.test.ts
npm run build                             # copies vendor/ scripts into public/, then vite build → dist/
npx playwright install chromium           # once
npm run e2e                               # Playwright: the built page in Chromium against an API mock
```

| Path | What it is | Written by |
|---|---|---|
| `index.html`, `src/main.ts` | The page every manifest opens: reads, binds, draws, redraws, selects | hand |
| `dialog.html`, `src/dialog.ts`, `src/settings.ts` | *Format Extension*: options, view, appearance | hand |
| `src/bind.ts` | Encodings and summary data → `specFromTable`'s table binding (pure) | hand |
| `trex/*.trex`, `src/catalog.generated.ts` | One manifest per chart; the page's slim catalog | `npm run generate` only |
| `vendor/` | silverpoint's script, host catalog, conformance kit, integrity; the Extensions API library | `npm run vendor` only |
| `test/e2e/tableau-mock.js` | The Extensions API mock the e2e tests serve in place of the library | hand |

`npm run build` runs `scripts/prepare-public.mjs` itself rather than as a `prebuild` hook, so it also
works with `ignore-scripts=true` in `.npmrc`.

## Releasing

A tag `vX.Y.Z` equal to `package.json`'s version deploys the build to `/silverpoint-tableau/vX.Y/` on
the `gh-pages` branch (keeping every other folder) and attaches the `.trex` files, and one zip of them all, to the GitHub
release (`.github/workflows/release.yml`). GitHub Pages must serve the `gh-pages` branch.

Licence: MIT. Bundled: the Tableau Extensions API library (Apache-2.0,
`vendor/tableau.extensions.LICENSE.txt`) and silverpoint's script (MIT; EB Garamond under OFL-1.1).
