// TAB-REQ-001, TAB-REQ-008, TAB-REQ-009, H-3 (TAB-T-03): one manifest per chart, generated.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { MAX_ENCODINGS, pageUrl, releasePath, trexFor } from '../scripts/make-trex.ts';

const catalog = JSON.parse(readFileSync('vendor/host-catalog.json', 'utf8'));
const bindable = catalog.charts.filter((c: { binding: string }) => c.binding !== 'none');
const fits = bindable.filter((c: { roles: unknown[] }) => c.roles.length <= MAX_ENCODINGS);

describe('make-trex', () => {
  test('TAB-REQ-009 · the release path is the version line; a released URL never changes', () => {
    expect(releasePath('0.1.0')).toBe('/silverpoint-tableau/v0.1/');
    expect(releasePath('0.1.7')).toBe('/silverpoint-tableau/v0.1/');
    expect(pageUrl('0.1.0', 'bar-chart')).toBe('https://ecrespo.github.io/silverpoint-tableau/v0.1/index.html?chart=bar-chart');
  });

  test('TAB-REQ-001 · one .trex per bindable chart that fits Tableau\'s four encodings', () => {
    const files = readdirSync('trex').filter((f) => f.endsWith('.trex')).map((f) => f.replace('.trex', ''));
    expect(files.sort()).toEqual(fits.map((c: { slug: string }) => c.slug).sort());
    expect(bindable.length - fits.length).toBe(1); // candlestick-chart: five roles
  });

  test('TAB-REQ-001 · a worksheet extension with its id, the page URL and one encoding per role', () => {
    const xml = trexFor(catalog.charts.find((c: { slug: string }) => c.slug === 'line-chart'), '0.1.0');
    expect(xml).toContain('<worksheet-extension id="to.seraph.silverpoint.line-chart" extension-version="0.1.0">');
    expect(xml).toContain('<url>https://ecrespo.github.io/silverpoint-tableau/v0.1/index.html?chart=line-chart</url>');
    expect(xml).toContain('<min-api-version>1.12</min-api-version>');
    expect(xml.match(/<encoding id=/g)).toHaveLength(3);
    expect(xml).toMatch(/<encoding id="x">\s*<display-name>X<\/display-name>\s*<data-spec>\s*<data-type>string<\/data-type>/);
    expect(xml).toMatch(/<encoding id="value">[\s\S]*?<role-type>continuous-measure<\/role-type>[\s\S]*?<fields max-count="1"\/>/);
  });

  test('a multiple role takes any number of fields', () => {
    const xml = trexFor(catalog.charts.find((c: { slug: string }) => c.slug === 'parallel-coordinates-chart'), '0.1.0');
    const dims = xml.slice(xml.indexOf('<encoding id="dimensions">'), xml.indexOf('</encoding>', xml.indexOf('<encoding id="dimensions">')));
    expect(dims).not.toContain('max-count');
  });

  test('TAB-REQ-008 · the least permission: no full-data permission, summary data only', () => {
    for (const f of readdirSync('trex')) expect(readFileSync(`trex/${f}`, 'utf8')).not.toContain('<permission>');
  });

  test('H-3 · the generated files are current', () => {
    expect(() => execFileSync('node', ['scripts/make-trex.ts', '--check'], { stdio: 'pipe' })).not.toThrow();
  });
});
