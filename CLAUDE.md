# silverpoint-tableau — context for agents

Read [`specs/constitution.md`](specs/constitution.md) before proposing or writing code. It inherits
H-1..H-8 from silverpoint (`changes/feature-007-bi-hosts/repositories/README.md` §3: one engine, a
pinned line, generated manifests, conformance, nothing lost on the way in, the host's rules, specs as
the source, shown not inferred) and adds:

- **TAB-Art. 1 — Sandbox-ready.** THE PAGE SHALL request nothing but its own origin's files and the Tableau Extensions API library it ships, so that it could run in a sandboxed host unchanged. It SHALL send worksheet data nowhere.
- **TAB-Art. 2 — A released URL never changes.** Each release is served under its own path (`/v0.1/`); a `.trex` in someone's workbook keeps working after the next release.

Draws with: `silverpoint-embed.full.js`, served from the extension's own origin.

Stack: TypeScript; Vite (a static multi-file build); the Extensions API library, vendored; Vitest; Playwright against a mock of the Extensions API.

Specs: `specs/prd.md` (TAB-REQ-001..TAB-REQ-010), `specs/technical-design.md`, `specs/tasks.md`.
`specs/spec-pack.md` is the pack as written in silverpoint's `changes/feature-007-bi-hosts/repositories/`;
the four files are its split, unchanged.

## Status

Implemented 2026-11-21: TAB-T-01, -03..-07 (ledger and deviations in `specs/tasks.md`; the API calls
in `specs/poc.md`). Validated 2026-11-28: `check` (55 manifests, vendor ok), `typecheck`, 14 unit tests,
`build`, 9 e2e tests (conformance kit 76/0 in Chromium against `dist/`).

Open, and not doable from this repo alone:
- TAB-T-02's Desktop half: load a `.trex` in Tableau Desktop 2024.2+ and run `specs/poc.md`'s behaviours
  (resize, settings persistence, Format Extension, selection); TAB-OQ-2 (Tableau Public).
- TAB-T-08: `v0.1.0` released 2026-11-28 (release with 55 `.trex` and a zip; build pushed to `gh-pages`
  `/v0.1/`). GitHub Pages must still be enabled on `gh-pages` (Settings → Pages) for the URL to serve.

Commands: `npm run check` (manifests and vendored engine current), `npm run typecheck`, `npm test`
(Vitest, `test/*.test.ts` only — `vitest.config.ts`), `npm run build` (copies `vendor/` scripts into
`public/`, then Vite → `dist/`), `npm run e2e` (Playwright, Chromium, against `test/e2e/tableau-mock.js`;
needs `npm run build` first and `npx playwright install chromium` once).

- `vendor/` is written only by `scripts/vendor.mjs`; `trex/` and `src/catalog.generated.ts` only by
  `scripts/make-trex.ts`. `public/` and `dist/` are build output (git-ignored).
- The page may load only its own origin's files (TAB-Art. 1); the e2e request-log test enforces it.
- Don't rely on npm `pre*`/`post*` hooks: the maintainer's `.npmrc` has `ignore-scripts=true`, which
  skips them. Chain steps inside the script itself.
- `npm audit` reports dev-only advisories in Vitest 3's toolchain; fixing them is a Vitest major bump.

## Working rules

- Test-first; every task and test cites the TAB-REQ it implements or verifies (H-7, H-8).
- Every list of charts, roles, options and appearance values is generated from the pinned
  `host-catalog.json`, with a `--check` CI runs (H-3). Nothing in those lists is typed by hand.
- The engine is one pinned version of one silverpoint line, verified against `integrity.json` (H-2);
  the hosts kit is the zip attached to each silverpoint GitHub release.
- Specs and code are written in English.
