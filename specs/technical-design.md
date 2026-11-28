# `silverpoint-tableau` — Technical design

> Split from `specs/spec-pack.md` (silverpoint feature-007, `repositories/`), content unchanged.

## Design decisions

- **TAB-DD-01 — One manifest per chart, one page.** A viz extension's Marks-card tiles are fixed by
  its manifest, and Tableau's own viz extensions are one chart each. Generating a `.trex` per chart
  gives every chart its exact tiles; they all open the same hosted page (H-3:
  `scripts/make-trex.ts`).
- **TAB-DD-02 — Network-enabled on GitHub Pages.** The simplest host that satisfies HTTPS. An
  administrator must allow the URL on Tableau Server or Cloud: a documented cost of D5.
- **TAB-DD-03 — The API calls are verified first.** This pack names behaviours, not methods: the
  exact Extensions API calls for reading encodings and summary data, and the minimum API version
  for viz extensions, are fixed by TAB-T-02 against the current Extensions API documentation and
  recorded in the technical design before any manifest is generated.
