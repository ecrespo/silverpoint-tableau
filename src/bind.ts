// TAB-REQ-002, TAB-REQ-004: what Tableau gives the page — the fields on each encoding and the summary
// data — as the table binding `specFromTable` takes. Pure; the page does the API calls (TAB-DD-03).
import type { CatalogChart } from './catalog-types';
import type { Settings } from './settings';

export interface DataValue { readonly value: unknown; readonly nativeValue?: unknown }
export interface DataPage { readonly columns: readonly { readonly fieldName: string; readonly index: number }[]; readonly data: readonly (readonly DataValue[])[] }
export interface VisualSpecification {
  readonly activeMarksSpecificationIndex: number;
  readonly marksSpecifications: readonly { readonly encodings: readonly { readonly id: string; readonly field: { readonly name: string } }[] }[];
}
export type Row = Record<string, unknown>;
export interface TableBinding {
  readonly chart: string;
  readonly table: { readonly rows: readonly Row[] };
  readonly roles: Record<string, string | string[]>;
  readonly options: Readonly<Record<string, unknown>>;
  readonly appearance: Readonly<Record<string, string>>;
  readonly size: { readonly width: number; readonly height: number };
  readonly id: string;
}

/** A summary data page as rows keyed by field name; a cell's native value when Tableau gives one. */
export function rowsFromPage(page: DataPage): Row[] {
  return page.data.map((cells) => Object.fromEntries(page.columns.map((c) => {
    const cell = cells[c.index];
    return [c.fieldName, cell === undefined ? null : cell.nativeValue !== undefined ? cell.nativeValue : cell.value];
  })));
}

/** Encoding id → the names of the fields on its tile, from the active marks card. */
export function encodingFields(spec: VisualSpecification): Record<string, string[]> {
  const card = spec.marksSpecifications[spec.activeMarksSpecificationIndex];
  const fields: Record<string, string[]> = {};
  if (!card) return fields;
  for (const encoding of card.encodings) (fields[encoding.id] ??= []).push(encoding.field.name);
  return fields;
}

export function bindingFor(
  chart: CatalogChart,
  fields: Readonly<Record<string, readonly string[]>>,
  rows: readonly Row[],
  settings: Settings,
  size: { readonly width: number; readonly height: number },
): { kind: 'missing'; tiles: string[] } | { kind: 'binding'; binding: TableBinding } {
  const missing = chart.roles.filter((r) => r.required && !(fields[r.id]?.length)).map((r) => r.label);
  if (missing.length > 0) return { kind: 'missing', tiles: missing };
  const roles: Record<string, string | string[]> = {};
  for (const role of chart.roles) {
    const on = fields[role.id];
    if (on?.length) roles[role.id] = role.multiple ? [...on] : on[0]!;
  }
  return {
    kind: 'binding',
    // The worksheet has its own title and frame: the chart is drawn bare unless the author picks a card.
    binding: { chart: chart.slug, table: { rows }, roles, options: { chrome: 'bare', ...settings.options }, appearance: settings.appearance, size, id: `tableau-${chart.slug}` },
  };
}
