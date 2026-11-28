// TAB-REQ-002, TAB-REQ-004 (TAB-T-04): Tableau's encodings and summary data → a table binding.
import { describe, expect, test } from 'vitest';
import { bindingFor, encodingFields, rowsFromPage } from '../src/bind';
import { CHARTS } from '../src/catalog.generated';

const page = {
  columns: [{ fieldName: 'Region', index: 0 }, { fieldName: 'SUM(Sales)', index: 1 }, { fieldName: 'Order Date', index: 2 }],
  data: [
    [{ value: 'East', nativeValue: 'East' }, { value: 10, nativeValue: 10 }, { value: '2026-01-01', nativeValue: new Date(Date.UTC(2026, 0, 1)) }],
    [{ value: 'West', nativeValue: 'West' }, { value: '%null%', nativeValue: null }, { value: '2026-02-01', nativeValue: new Date(Date.UTC(2026, 1, 1)) }],
  ],
};

describe('bind', () => {
  test('summary data pages become rows keyed by field name, native values first', () => {
    expect(rowsFromPage(page)).toEqual([
      { Region: 'East', 'SUM(Sales)': 10, 'Order Date': new Date(Date.UTC(2026, 0, 1)) },
      { Region: 'West', 'SUM(Sales)': null, 'Order Date': new Date(Date.UTC(2026, 1, 1)) },
    ]);
  });

  test('the visual specification gives the fields on each encoding of the active marks card', () => {
    const spec = {
      activeMarksSpecificationIndex: 1,
      marksSpecifications: [
        { encodings: [{ id: 'x', field: { name: 'Nope' } }] },
        { encodings: [{ id: 'x', field: { name: 'Region' } }, { id: 'value', field: { name: 'SUM(Sales)' } }, { id: 'color', field: { name: 'Region' } }] },
      ],
    };
    expect(encodingFields(spec)).toEqual({ x: ['Region'], value: ['SUM(Sales)'], color: ['Region'] });
    expect(encodingFields({ activeMarksSpecificationIndex: -1, marksSpecifications: [] })).toEqual({});
  });

  test('TAB-REQ-002 · a binding with the mapped fields, the saved options and the viz area\'s size', () => {
    const result = bindingFor(CHARTS['bar-chart'], { x: ['Region'], value: ['SUM(Sales)'] }, rowsFromPage(page), { options: { orientation: 'rows' }, appearance: { ground: 'cyanotype' } }, { width: 600, height: 400 });
    expect(result).toEqual({
      kind: 'binding',
      binding: {
        chart: 'bar-chart',
        table: { rows: rowsFromPage(page) },
        roles: { x: 'Region', value: 'SUM(Sales)' },
        options: { chrome: 'bare', orientation: 'rows' },
        appearance: { ground: 'cyanotype' },
        size: { width: 600, height: 400 },
        id: 'tableau-bar-chart',
      },
    });
  });

  test('TAB-REQ-004 · an empty required encoding names the tiles to fill, by display name', () => {
    expect(bindingFor(CHARTS['line-chart'], { secondary: ['B'] }, [], { options: {}, appearance: {} }, { width: 1, height: 1 })).toEqual({ kind: 'missing', tiles: ['X', 'Value'] });
  });

  test('a multiple role keeps every field, in order', () => {
    const result = bindingFor(CHARTS['parallel-coordinates-chart'], { label: ['Model'], dimensions: ['Mass', 'Price'] }, [], { options: {}, appearance: {} }, { width: 1, height: 1 });
    expect(result.kind === 'binding' && result.binding.roles).toEqual({ label: 'Model', dimensions: ['Mass', 'Price'] });
  });
});
