// TAB-REQ-005 (TAB-T-05): the configuration dialog's fields and the saved settings.
import { describe, expect, test } from 'vitest';
import { CHARTS } from '../src/catalog.generated';
import { formFields, readSettings, settingsFromForm, SETTINGS_KEY, writeSettings } from '../src/settings';

describe('settings', () => {
  test('the dialog offers the chart\'s options, the common view options and the appearance', () => {
    const fields = formFields(CHARTS['line-chart']);
    const names = fields.map((f) => f.name);
    expect(names).toEqual(expect.arrayContaining(['curve', 'series', 'connectNulls', 'title', 'dataTable', 'ground', 'substrate', 'mode', 'palette']));
    expect(fields.find((f) => f.name === 'curve')).toMatchObject({ group: 'chart', kind: 'enum', values: ['monotone', 'linear', 'natural', 'step'], default: 'monotone' });
    expect(fields.find((f) => f.name === 'ground')).toMatchObject({ group: 'appearance', kind: 'enum' });
  });

  test('a form becomes settings: empty fields dropped, booleans and numbers typed, appearance apart', () => {
    const s = settingsFromForm(CHARTS['line-chart'], { curve: 'step', connectNulls: 'true', title: '', ground: 'cyanotype', palette: '' });
    expect(s).toEqual({ options: { curve: 'step', connectNulls: true }, appearance: { ground: 'cyanotype' } });
  });

  test('settings round-trip through the workbook\'s string store; garbage reads as empty', () => {
    const s = { options: { curve: 'step' }, appearance: { mode: 'precision' } };
    expect(readSettings(writeSettings(s))).toEqual(s);
    expect(readSettings(undefined)).toEqual({ options: {}, appearance: {} });
    expect(readSettings('{not json')).toEqual({ options: {}, appearance: {} });
    expect(SETTINGS_KEY).toBe('silverpoint');
  });
});
