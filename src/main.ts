// The page every manifest opens (TAB-REQ-002, -003, -004, -006, -007): read the chart from the URL,
// the encodings and summary data from the worksheet, bind with specFromTable, draw with the embed
// client; redraw when data, encodings, settings or the viz area change.
import { bindingFor, encodingFields, rowsFromPage, type Row } from './bind';
import { CHARTS } from './catalog.generated';
import { readSettings, SETTINGS_KEY, writeSettings } from './settings';

const target = document.getElementById('chart')!;
const notice = document.getElementById('notice')!;
const slug = new URLSearchParams(location.search).get('chart') ?? '';
const chart = CHARTS[slug];
let handle: ReturnType<typeof Silverpoint.mount> | undefined;
let rows: Row[] = [];
let fields: Record<string, string[]> = {};

function say(text: string): void {
  notice.textContent = text;
  notice.hidden = false;
  target.hidden = true;
}

async function readSummary(): Promise<Row[]> {
  const reader = await tableau.extensions.worksheetContent.worksheet.getSummaryDataReaderAsync(undefined, { ignoreSelection: true });
  const out: Row[] = [];
  try {
    for (let page = 0; page < reader.pageCount; page++) out.push(...rowsFromPage(await reader.getPageAsync(page)));
  } finally {
    await reader.releaseAsync();
  }
  return out;
}

function draw(): void {
  if (!chart) return say(`This page draws a silverpoint chart named in its address; "${slug}" is not one.`);
  const settings = readSettings(tableau.extensions.settings.get(SETTINGS_KEY));
  const size = { width: Math.max(1, Math.floor(window.innerWidth)), height: Math.max(1, Math.floor(window.innerHeight)) };
  const bound = bindingFor(chart, fields, rows, settings, size);
  if (bound.kind === 'missing') return say(`Drag a field onto ${bound.tiles.map((t) => `“${t}”`).join(' and ')} on the Marks card.`);
  const spec = Silverpoint.specFromTable(bound.binding);
  if (!spec.ok) return say(Silverpoint.specErrorMessage(spec.error));
  notice.hidden = true;
  target.hidden = false;
  if (handle) handle.update(spec.value);
  else handle = Silverpoint.mount(target, spec.value, { onSelect: select, locale: tableau.extensions.environment?.locale });
}

/** TAB-REQ-007: with one dimension encoding, choosing an item selects its marks in the worksheet. */
function select(item: { datum: Record<string, unknown> }): void {
  const dimensions = chart?.roles.filter((r) => r.kind === 'dimension' && fields[r.id]?.length === 1) ?? [];
  if (dimensions.length !== 1) return;
  const fieldName = fields[dimensions[0]!.id]![0]!;
  void tableau.extensions.worksheetContent.worksheet.selectMarksByValueAsync([{ fieldName, value: [item.datum[fieldName]] }], tableau.SelectionUpdateType.Replace);
}

async function refresh(): Promise<void> {
  const worksheet = tableau.extensions.worksheetContent.worksheet;
  const [spec, data] = await Promise.all([worksheet.getVisualSpecificationAsync(), readSummary()]);
  fields = encodingFields(spec);
  rows = data;
  draw();
}

/** TAB-REQ-005: the Format Extension button opens the dialog; its answer is saved with the workbook. */
async function configure(): Promise<void> {
  const url = new URL(`dialog.html?chart=${encodeURIComponent(slug)}`, location.href).href;
  const answer = await tableau.extensions.ui.displayDialogAsync(url, tableau.extensions.settings.get(SETTINGS_KEY) ?? writeSettings({ options: {}, appearance: {} }), { width: 520, height: 600 });
  tableau.extensions.settings.set(SETTINGS_KEY, answer);
  await tableau.extensions.settings.saveAsync();
  draw();
}

await tableau.extensions.initializeAsync({ configure: () => void configure().catch(() => undefined) });
const worksheet = tableau.extensions.worksheetContent.worksheet;
worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, () => void refresh());
window.addEventListener('resize', draw);
await refresh();
