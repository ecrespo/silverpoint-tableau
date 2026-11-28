// Vendors the hosts kit of `@silverpoint/embed` X.Y.Z into vendor/ (H-2): the standalone script the page loads.
//   node scripts/vendor.mjs 0.11.0          the hosts kit of the GitHub release vX.Y.Z
//   node scripts/vendor.mjs --from PATH     a silverpoint checkout, after `pnpm build`
//   node scripts/vendor.mjs --check         the checked-in files against integrity.json (CI)
// Every script is verified against integrity.json (SHA-384) before anything is written.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const VENDOR = join(ROOT, 'vendor');
export const SCRIPTS = ['silverpoint-embed.full.js'];
export const DATA = ['host-catalog.json', 'conformance.json', 'integrity.json'];
const RELEASE = (v) => `https://github.com/ecrespo/silverpoint/releases/download/v${v}/silverpoint-hosts-kit-${v}.zip`;

const sri = (bytes) => `sha384-${createHash('sha384').update(bytes).digest('base64')}`;
const json = (dir, name) => JSON.parse(readFileSync(join(dir, name), 'utf8'));

/** Problems with a vendored folder: digests, versions, the line package.json states. */
export function verify(dir) {
  const problems = [];
  const integrity = json(dir, 'integrity.json');
  const catalog = json(dir, 'host-catalog.json');
  for (const name of SCRIPTS) {
    const bytes = readFileSync(join(dir, name));
    if (integrity[name] !== sri(bytes)) problems.push(`${name}: digest ${sri(bytes)} is not integrity.json's ${integrity[name]}`);
    const banner = /@silverpoint\/embed (\d+\.\d+\.\d+(?:-[\w.]+)?)/.exec(bytes.subarray(0, 400).toString('utf8'));
    if (!banner || banner[1] !== catalog.version) problems.push(`${name}: version ${banner?.[1]} is not the host catalog's ${catalog.version}`);
  }
  if (json(dir, 'conformance.json').version !== catalog.version) problems.push('conformance.json and host-catalog.json disagree on the version');
  const pkg = json(ROOT, 'package.json');
  if (pkg.silverpoint?.engine !== catalog.version) problems.push(`package.json silverpoint.engine ${pkg.silverpoint?.engine} is not ${catalog.version}`);
  if (pkg.silverpoint?.line !== catalog.version.split('.').slice(0, 2).join('.')) problems.push(`package.json silverpoint.line ${pkg.silverpoint?.line} is not ${catalog.version}'s line`);
  return problems;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--check') {
    const problems = verify(VENDOR);
    for (const p of problems) console.log('✗', p);
    console.log(problems.length === 0 ? 'vendor ok' : `${problems.length} problem(s)`);
    process.exit(problems.length === 0 ? 0 : 1);
  }
  const staging = mkdtempSync(join(tmpdir(), 'sp-vendor-'));
  try {
    if (args[0] === '--from') {
      const dist = join(args[1], 'packages/embed/dist');
      for (const name of [...SCRIPTS, ...DATA]) copyFileSync(join(dist, name), join(staging, name));
    } else if (args[0]) {
      const response = await fetch(RELEASE(args[0]));
      if (!response.ok) throw new Error(`${RELEASE(args[0])}: ${response.status}`);
      const zip = join(staging, 'kit.zip');
      writeFileSync(zip, Buffer.from(await response.arrayBuffer()));
      execFileSync('unzip', ['-q', '-o', zip, ...SCRIPTS, ...DATA, '-d', staging]);
    } else {
      throw new Error('give a version, --from PATH or --check');
    }
    const catalog = json(staging, 'host-catalog.json');
    const pkg = json(ROOT, 'package.json');
    pkg.silverpoint = { line: catalog.version.split('.').slice(0, 2).join('.'), engine: catalog.version };
    writeFileSync(join(ROOT, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
    const problems = verify(staging);
    if (problems.length > 0) {
      for (const p of problems) console.log('✗', p);
      process.exit(1);
    }
    if (!existsSync(VENDOR)) mkdirSync(VENDOR);
    for (const name of [...SCRIPTS, ...DATA]) copyFileSync(join(staging, name), join(VENDOR, name));
    console.log(`vendored ${catalog.version}; now run: npm run generate`);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
