// TAB-REQ-005: the configuration dialog's fields (generated catalog) and the settings saved with the
// workbook under one key, as JSON.
import { APPEARANCE, COMMON } from './catalog.generated';
import type { CatalogChart, CatalogOption } from './catalog-types';

export const SETTINGS_KEY = 'silverpoint';
export interface Settings {
  readonly options: Readonly<Record<string, unknown>>;
  readonly appearance: Readonly<Record<string, string>>;
}
export interface Field {
  readonly name: string;
  readonly label: string;
  readonly doc: string;
  readonly group: 'chart' | 'view' | 'appearance';
  readonly kind: string;
  readonly values?: readonly string[];
  readonly labels?: readonly string[];
  readonly default?: unknown;
}

const VIEW = new Set(['title', 'label', 'description', 'dataTable', 'chrome', 'locale']);
const fromOption = (group: Field['group']) => (o: CatalogOption): Field => ({ name: o.name, label: o.label, doc: o.doc, group, kind: o.kind, ...(o.values ? { values: o.values } : {}), ...(o.default !== undefined ? { default: o.default } : {}) });

export function formFields(chart: CatalogChart): Field[] {
  const own = new Set(chart.options.map((o) => o.name));
  const substrates = [...new Map(APPEARANCE.grounds.flatMap((g) => g.substrates.map((s) => [s.name, s.label] as const))).entries()];
  return [
    ...chart.options.map(fromOption('chart')),
    ...COMMON.filter((o) => VIEW.has(o.name) && !own.has(o.name)).map(fromOption('view')),
    { name: 'ground', label: 'Ground', doc: '', group: 'appearance', kind: 'enum', values: APPEARANCE.grounds.map((g) => g.name), labels: APPEARANCE.grounds.map((g) => g.label) },
    { name: 'substrate', label: 'Substrate', doc: 'Ignored by a ground with one substrate.', group: 'appearance', kind: 'enum', values: substrates.map(([n]) => n), labels: substrates.map(([, l]) => l) },
    { name: 'mode', label: 'Mode', doc: 'Precision is used anyway when the system asks for high contrast.', group: 'appearance', kind: 'enum', values: APPEARANCE.modes.map((m) => m.name), labels: APPEARANCE.modes.map((m) => m.label) },
    { name: 'palette', label: 'Palette', doc: '', group: 'appearance', kind: 'enum', values: APPEARANCE.palettes.map((p) => p.name), labels: APPEARANCE.palettes.map((p) => p.label) },
  ];
}

/** Form entries (strings) → settings; an empty entry means "the chart's default" and is dropped. */
export function settingsFromForm(chart: CatalogChart, entries: Readonly<Record<string, string>>): Settings {
  const options: Record<string, unknown> = {};
  const appearance: Record<string, string> = {};
  for (const field of formFields(chart)) {
    const raw = entries[field.name];
    if (raw === undefined || raw === '') continue;
    if (field.group === 'appearance') appearance[field.name] = raw;
    else options[field.name] = field.kind === 'boolean' ? raw === 'true' : field.kind === 'number' ? Number(raw) : raw;
  }
  return { options, appearance };
}

export const writeSettings = (settings: Settings): string => JSON.stringify(settings);

export function readSettings(raw: string | undefined): Settings {
  try {
    const value = raw ? JSON.parse(raw) : {};
    return { options: value.options ?? {}, appearance: value.appearance ?? {} };
  } catch {
    return { options: {}, appearance: {} };
  }
}
