// TAB-REQ-005: the configuration dialog — the chart's options, the common view options and the
// appearance, generated from the host catalog; it answers the page with the settings as JSON.
import { CHARTS } from './catalog.generated';
import { formFields, readSettings, settingsFromForm, writeSettings, type Field } from './settings';

const chart = CHARTS[new URLSearchParams(location.search).get('chart') ?? ''];
const form = document.getElementById('form') as HTMLFormElement;

function control(field: Field, current: unknown): HTMLElement {
  const id = `f-${field.name}`;
  const label = document.createElement('label');
  label.htmlFor = id;
  label.append(field.label);
  let input: HTMLInputElement | HTMLSelectElement;
  if (field.kind === 'enum' || field.kind === 'boolean') {
    const select = document.createElement('select');
    const values = field.kind === 'boolean' ? ['true', 'false'] : (field.values ?? []);
    const labels = field.kind === 'boolean' ? ['Yes', 'No'] : (field.labels ?? values);
    select.add(new Option(field.default !== undefined ? `Default (${String(field.default)})` : 'Default', ''));
    values.forEach((v, i) => select.add(new Option(labels[i] ?? v, v)));
    select.value = current === undefined ? '' : String(current);
    input = select;
  } else {
    input = document.createElement('input');
    input.type = field.kind === 'number' ? 'number' : 'text';
    input.value = current === undefined ? '' : String(current);
  }
  input.id = id;
  input.name = field.name;
  label.append(input);
  if (field.doc) {
    const small = document.createElement('small');
    small.textContent = field.doc.replace(/`/g, '');
    label.append(small);
  }
  return label;
}

const payload = await tableau.extensions.initializeDialogAsync();
if (chart) {
  const saved = readSettings(payload);
  const groups: Record<Field['group'], string> = { chart: chart.title, view: 'View', appearance: 'Appearance' };
  for (const group of ['chart', 'view', 'appearance'] as const) {
    const set = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = groups[group];
    set.append(legend);
    for (const field of formFields(chart).filter((f) => f.group === group)) {
      set.append(control(field, group === 'appearance' ? saved.appearance[field.name] : saved.options[field.name]));
    }
    form.append(set);
  }
  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.innerHTML = '<button type="button" id="cancel">Cancel</button><button type="submit">Save</button>';
  form.append(actions);
  document.getElementById('cancel')!.addEventListener('click', () => tableau.extensions.ui.closeDialog(payload));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const entries = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v)]));
    tableau.extensions.ui.closeDialog(writeSettings(settingsFromForm(chart, entries)));
  });
}
