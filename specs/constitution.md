# `silverpoint-tableau` — Constitution

> Split from `specs/spec-pack.md` (silverpoint feature-007, `repositories/`), content unchanged.

## Constitution

H-1..H-8, and:

- **TAB-Art. 1 — Sandbox-ready.** THE PAGE SHALL request nothing but its own origin's files and the
  Tableau Extensions API library it ships, so that it could run in a sandboxed host unchanged. It
  SHALL send worksheet data nowhere.
- **TAB-Art. 2 — A released URL never changes.** Each release is served under its own path
  (`/v0.1/`); a `.trex` in someone's workbook keeps working after the next release.

Stack: TypeScript; Vite (a static multi-file build); the Extensions API library, vendored; Vitest;
Playwright against a mock of the Extensions API.

## Identity

| Field | Value |
|---|---|
| **Repository** | `github.com/ecrespo/silverpoint-tableau` |
| **Published as** | One `.trex` per chart on GitHub Releases; the extension's page on GitHub Pages (silverpoint D5) |
| **Licence** | MIT |
| **Description** | Tableau viz extensions that draw silverpoint charts on a worksheet. |
| **Draws with** | `silverpoint-embed.full.js`, served from the extension's own origin |
| **Wave** | 2 |
| **Ids** | `TAB-REQ-nnn`, `TAB-DD-nn`, `TAB-T-nn` |
| **Status** | `APPROVED` gate-1 pack, 2026-11-20 (user decision); re-read against the released API in T-328 |
