# `silverpoint-tableau` — Prd

> Split from `specs/spec-pack.md` (silverpoint feature-007, `repositories/`), content unchanged.

## Scope

**In:** viz extensions on the Marks card, one manifest per chart, a configuration dialog for options
and appearance. **Out:** dashboard extensions; Tableau Exchange listing; a sandboxed-host deployment
(possible by TAB-Art. 1, not pursued).

## Requirements

| ID | Requirement | Priority |
|---|---|---|
| TAB-REQ-001 | THE REPOSITORY SHALL generate one `.trex` manifest per chart of the pinned host catalog whose `binding` is not `none`: a `<worksheet-extension>` with its own id (`to.seraph.silverpoint.<slug>`), the release's page URL with `?chart=<slug>`, and one `<encoding>` per role with its display name, data type, role type and field count. | MUST |
| TAB-REQ-002 | THE PAGE SHALL read the chart from its URL, the fields on each encoding from the worksheet's visual specification, and the worksheet's summary data, bind them with `specFromTable` and draw with the embed client. | MUST |
| TAB-REQ-003 | WHEN the worksheet's summary data or encodings change, THE PAGE SHALL redraw in place. | MUST |
| TAB-REQ-004 | IF a required encoding is empty, THEN THE PAGE SHALL show which tiles to fill, by their display names. | MUST |
| TAB-REQ-005 | THE EXTENSION SHALL offer a configuration dialog with the chart's options, the common view options and the appearance, generated from the host catalog, and SHALL save them in the extension's settings with the workbook. | MUST |
| TAB-REQ-006 | THE CHART SHALL fill the worksheet's viz area and redraw when it is resized. | MUST |
| TAB-REQ-007 | WHEN an item is chosen in a chart with a single dimension encoding, THE EXTENSION SHOULD select the matching marks in the worksheet. | SHOULD |
| TAB-REQ-008 | THE MANIFESTS SHALL request the least permission that lets the page read summary data, and the README SHALL tell an administrator the exact URL to allow. | MUST |
| TAB-REQ-009 | EACH RELEASE SHALL be deployed under a versioned path, and its `.trex` files attached to the GitHub release. | MUST |
| TAB-REQ-010 | CI SHALL run the conformance kit in a browser against the deployed build's script, a keyboard test against the mock, and a check that the page's request log holds only its own origin. | MUST |
