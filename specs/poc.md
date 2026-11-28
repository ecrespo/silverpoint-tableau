# TAB-T-02 — the Extensions API calls (TAB-DD-03)

Fixed from the Extensions API documentation and Tableau's own viz-extension samples
(`tableau/extensions-api`, `Samples/Viz/ConnectedScatterplot` and `Sankey`, library 1.17.0), and
exercised against the mock in `test/e2e/tableau-mock.js`. **Not yet run in Tableau Desktop**: that pass
(resize, settings persistence, Format Extension, selection) is the open half of this task.

| Behaviour | Call |
|---|---|
| Start | `tableau.extensions.initializeAsync({ configure })` — `configure` answers the *Format Extension* button |
| The worksheet | `tableau.extensions.worksheetContent.worksheet` (API 1.12, Tableau 2024.2) |
| Fields on each tile | `worksheet.getVisualSpecificationAsync()` → `marksSpecifications[activeMarksSpecificationIndex].encodings[]`, each `{ id, field: { name } }` (API 1.11) |
| Summary data | `worksheet.getSummaryDataReaderAsync(undefined, { ignoreSelection: true })` → `getPageAsync(i)` for each of `pageCount` pages (`columns[].fieldName`, `data[][]` of `{ value, nativeValue }`), then `releaseAsync()` |
| Redraw on change | `worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, …)` (API 1.11); encodings changing also changes the summary data |
| Settings | `tableau.extensions.settings.get/set` + `saveAsync()`, one key `silverpoint` holding JSON |
| Dialog | `tableau.extensions.ui.displayDialogAsync(url, payload, { width, height })`; in the dialog `initializeDialogAsync()` and `ui.closeDialog(payload)` |
| Selection | `worksheet.selectMarksByValueAsync([{ fieldName, value: [v] }], tableau.SelectionUpdateType.Replace)` |

Manifest: `min-api-version` **1.12** (for `worksheetContent`); **no `<permissions>`**: `full data` is
needed only for underlying data, and the page reads summary data (TAB-REQ-008). A viz extension takes
at most **four** custom encodings, so `candlestick-chart` (five roles) gets no manifest.
