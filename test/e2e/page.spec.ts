// TAB-REQ-002..007, TAB-REQ-010, H-4, H-5, TAB-Art. 1 (TAB-T-04..07): the built page and dialog in
// Chromium, against the mock of the Extensions API.
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const MOCK = readFileSync('test/e2e/tableau-mock.js', 'utf8');
const base = {
  fields: { x: ['Region'], value: ['SUM(Sales)'] },
  columns: ['Region', 'SUM(Sales)', 'Category'],
  rows: [['East', 12, 'A'], ['West', 9, 'B'], ['North', 15, 'C']],
};

async function open(page: Page, state: object, url = 'index.html?chart=bar-chart'): Promise<string[]> {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.addInitScript((s) => { (window as unknown as { __tableau: object }).__tableau = s; }, state);
  await page.route('**/tableau.extensions.1.17.0.min.js', (route) => route.fulfill({ contentType: 'text/javascript', body: MOCK }));
  await page.goto(url);
  return requests;
}

test('TAB-REQ-002 · TAB-Art. 1 · draws from the worksheet and asks only its own origin', async ({ page, baseURL }) => {
  const requests = await open(page, base);
  await expect(page.locator('#chart .sp-root svg.sp-chart')).toHaveCount(1);
  await expect(page.locator('#chart .sp-root')).toHaveAttribute('aria-label', /.+/);
  expect(requests.filter((u) => !u.startsWith(baseURL!) && !u.startsWith('data:'))).toEqual([]);
});

test('TAB-REQ-004 · an empty required tile is named', async ({ page }) => {
  await open(page, { ...base, fields: { x: ['Region'] } });
  await expect(page.locator('#notice')).toHaveText('Drag a field onto “Value” on the Marks card.');
});

test('TAB-REQ-003 · redraws in place when the summary data changes', async ({ page }) => {
  await open(page, base);
  const root = page.locator('#chart .sp-root');
  await expect(root.locator('svg.sp-chart')).toHaveCount(1);
  const before = await root.locator('svg.sp-chart').innerHTML();
  await page.evaluate(() => {
    const w = window as unknown as { __tableau: { rows: unknown[][] }; __fire: (t: string) => void };
    w.__tableau.rows = [['East', 1], ['West', 30]];
    w.__fire('summary-data-changed');
  });
  await expect.poll(() => root.locator('svg.sp-chart').innerHTML()).not.toBe(before);
  await expect(page.locator('#chart .sp-root')).toHaveCount(1);
});

test('TAB-REQ-006 · fills the viz area and follows a resize', async ({ page }) => {
  await open(page, base);
  const svg = page.locator('#chart svg.sp-chart');
  await expect(svg).toHaveAttribute('width', '800');
  await page.setViewportSize({ width: 600, height: 400 });
  await expect(svg).toHaveAttribute('width', '600');
  await expect(svg).toHaveAttribute('height', '400');
});

test('H-5 · reads by keyboard: focus announces, arrows move', async ({ page }) => {
  await open(page, base);
  const root = page.locator('#chart .sp-root');
  await root.focus();
  const live = page.locator('#chart .sp-live');
  await expect(live).not.toHaveText('');
  const first = await live.textContent();
  await page.keyboard.press('ArrowRight');
  await expect(live).not.toHaveText(first ?? '');
  expect((await new AxeBuilder({ page } as never).include('#chart').analyze()).violations).toEqual([]);
});

test('TAB-REQ-007 · choosing an item selects its marks in the worksheet', async ({ page }) => {
  await open(page, base);
  await page.locator('#chart .sp-root').focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __tableauCalls: object[] }).__tableauCalls)).toContainEqual({ select: [{ fieldName: 'Region', value: ['East'] }], type: 'select-replace' });
});

test('TAB-REQ-005 · the Format Extension button opens the dialog; its answer is saved and drawn', async ({ page }) => {
  const answer = JSON.stringify({ options: { title: 'Sales by region' }, appearance: { ground: 'cyanotype' } });
  await open(page, { ...base, dialogAnswer: answer });
  await expect(page.locator('#chart svg.sp-chart')).toHaveCount(1);
  await page.evaluate(() => (window as unknown as { __configure: () => void }).__configure());
  await expect(page.locator('#chart .sp-root')).toHaveClass(/sp-ground-cyanotype/);
  const calls = await page.evaluate(() => (window as unknown as { __tableauCalls: { dialog?: string; saved?: object }[] }).__tableauCalls);
  expect(calls.find((c) => c.dialog)?.dialog).toMatch(/dialog\.html\?chart=bar-chart$/);
  expect(calls.find((c) => c.saved)?.saved).toEqual({ silverpoint: answer });
});

test('TAB-REQ-005 · the dialog lists the generated fields and answers with settings', async ({ page }) => {
  await open(page, { ...base, dialogPayload: JSON.stringify({ options: { orientation: 'rows' }, appearance: {} }) }, 'dialog.html?chart=bar-chart');
  await expect(page.locator('#f-orientation')).toHaveValue('rows');
  await page.locator('#f-ground').selectOption('cyanotype');
  await page.getByRole('button', { name: 'Save' }).click();
  const closed = await page.evaluate(() => (window as unknown as { __tableauCalls: { closed?: string }[] }).__tableauCalls.find((c) => c.closed)?.closed);
  expect(JSON.parse(closed!)).toEqual({ options: { orientation: 'rows' }, appearance: { ground: 'cyanotype' } });
});

test('H-4 · the conformance kit passes against the deployed build\'s script', async ({ page }) => {
  const cases = JSON.parse(readFileSync('vendor/conformance.json', 'utf8'));
  await page.goto('silverpoint-embed.full.js');
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ url: '/silverpoint-embed.full.js' });
  const result = await page.evaluate(async (c) => {
    const sp = (window as unknown as { Silverpoint: { conformance: (r: (s: unknown) => string, h: undefined, c: unknown) => Promise<{ passed: number; failed: unknown[] }>; renderToSVG: (s: unknown) => { value: { svg: string } } } }).Silverpoint;
    return sp.conformance((spec) => sp.renderToSVG(spec).value.svg, undefined, c);
  }, cases);
  console.log(`conformance ${cases.version} (browser, dist): ${result.passed} passed, ${result.failed.length} failed`);
  expect(result.failed).toEqual([]);
  expect(result.passed).toBe(cases.cases.length);
});
