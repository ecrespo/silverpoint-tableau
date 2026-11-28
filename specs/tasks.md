# `silverpoint-tableau` — Tasks

> Split from `specs/spec-pack.md` (silverpoint feature-007, `repositories/`), content unchanged.

## Tasks

- [x] **TAB-T-01** Split this pack into `specs/`; `CLAUDE.md`; Vite project; Pages workflow to a versioned path. Stop for review. *H-7, TAB-Art. 2*
- [ ] **TAB-T-02** PoC in Tableau Desktop with a hand-written `.trex` for `bar-chart`: reading encodings and summary data, resize, settings; record API names, minimum API version and permission. `specs/poc.md`. *TAB-DD-03*
- [x] **TAB-T-03** `scripts/make-trex.ts` and `--check`. *TAB-REQ-001, TAB-REQ-008, H-3*
- [x] **TAB-T-04** The page: read, bind, draw, redraw, empty encodings. *TAB-REQ-002, TAB-REQ-003, TAB-REQ-004, TAB-REQ-006*
- [x] **TAB-T-05** The configuration dialog and settings. *TAB-REQ-005*
- [x] **TAB-T-06** Mark selection. *TAB-REQ-007*
- [x] **TAB-T-07** The mock of the Extensions API, keyboard and request-log tests, the kit. *TAB-REQ-010, H-4, H-5, TAB-Art. 1*
- [ ] **TAB-T-08** README for authors and administrators; release `0.1.0`. *TAB-REQ-009*

## Open questions

- **TAB-OQ-1** The extension id's reverse-domain prefix: `to.seraph.silverpoint` or another.
- **TAB-OQ-2** Whether Tableau Public allows a network-enabled viz extension from an arbitrary origin.

## Bootstrap prompt

````text
This repository will ship Tableau viz extensions that draw silverpoint charts with the silverpoint-embed standalone file. Its design is in specs/spec-pack.md, written in the silverpoint repository (~/WebstormProjects/silverpoint/changes/feature-007-bi-hosts). Read the pack, that folder's README.md, api-delta.md and repositories/README.md §3, and Tableau's viz-extension manifest documentation.

Do TAB-T-01 only: split the pack into specs/ without changing its content, write CLAUDE.md, create the Vite project and a GitHub Pages workflow that deploys to a versioned path. Show me the tree and the workflow file, then stop. TAB-T-02 is a PoC I run with you in Tableau Desktop.
````

## Implementation ledger (2026-11-21)

Built test-first against silverpoint `0.10.1`'s hosts kit (`scripts/vendor.mjs --from`). Local run:
`npm run check` (55 manifests current, vendor ok), `npm run typecheck`, `npm test` (14 unit tests),
`npm run build`, `npm run e2e` (9 tests in Chromium against the API mock, the kit 76/0 in the browser
against `dist/silverpoint-embed.full.js`). Mutation checks: removing the resize listener fails
TAB-REQ-006; disabling the selection call fails TAB-REQ-007.

### Deviations — to review

- **TAB-D1 — `candlestick-chart` has no manifest.** A viz extension takes at most four custom
  encodings and it has five roles; 55 manifests, not 56.
- **TAB-D2 — `make-trex.ts` also writes `src/catalog.generated.ts`**, the slim catalog the page and the
  dialog read, so both outputs come from one pinned file and one `--check`.
- **TAB-D3 — the API calls come from the documentation and Tableau's samples** (`specs/poc.md`), not
  yet from a Tableau Desktop session.
- **TAB-D4 — the chart is drawn `bare` by default** (the author can pick `card` in the dialog): a
  worksheet has its own title and frame, and the embed's `height` is the drawing area without the card,
  so `bare` is what fills the viz area exactly (TAB-REQ-006). Fitting a card to a box would need the
  embed to expose the core's `cellChartBox` — proposed upstream, not done here (H-1).
- **TAB-OQ-1** taken as `to.seraph.silverpoint.<slug>` (the pack's default).

### Open

- TAB-T-02's Desktop half: load a `.trex` in Tableau Desktop 2024.2+ and run the behaviours of
  `specs/poc.md`; TAB-OQ-2 (Tableau Public).
- TAB-T-08's release: tag `v0.1.0` (GitHub Pages must be enabled on the `gh-pages` branch first).


### Validation (2026-11-28)

Two fixes to the tooling, no change to the page: `npm test` also collected `test/e2e/page.spec.ts`
and failed (now `vitest.config.ts` includes `test/*.test.ts` only); `npm run build` relied on a
`prebuild` hook that `ignore-scripts=true` skips, leaving `dist/` without the two scripts and 7 of 9
e2e tests red (now `build` runs `scripts/prepare-public.mjs` itself). After both: `check`, `typecheck`,
14 unit tests, `build`, 9 e2e tests (conformance 76/0) green.
