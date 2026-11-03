import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach } from "vitest";

/** Consumer scripts run normally; the package-manager boundary stays offline. */
export function useGateRunner(): void {
  let directory = "";
  let savedPath: string | undefined;
  beforeEach(() => {
    savedPath = process.env.PATH;
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gate-runner-"));
    fs.writeFileSync(
      path.join(directory, "pnpm"),
      `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (process.argv[2] === 'install') {
  if (!process.argv.includes('--frozen-lockfile')) process.exit(3);
  const common = spawnSync('git', ['rev-parse', '--git-common-dir'], { encoding: 'utf8' });
  if (common.status !== 0) process.exit(5);
  fs.appendFileSync(path.resolve(common.stdout.trim(), 'fixture-install-runs'), process.cwd() + '\\n');
  fs.appendFileSync(path.resolve(common.stdout.trim(), 'fixture-install-args'), JSON.stringify(process.argv.slice(2)) + '\\n');
  for (const [name, spec] of Object.entries(pkg.dependencies || {})) {
    if (!spec.startsWith('file:./')) process.exit(4);
    const target = path.join('node_modules', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(spec.slice(5), target, { recursive: true });
  }
} else {
  const script = pkg.scripts?.[process.argv[2]];
  if (typeof script !== 'string' || !script.trim()) process.exit(2);
  const result = spawnSync('/bin/sh', ['-c', script], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
`,
      { mode: 0o755 },
    );
    process.env.PATH = `${directory}${path.delimiter}${savedPath ?? ""}`;
  });
  afterEach(() => {
    process.env.PATH = savedPath;
    fs.rmSync(directory, { recursive: true, force: true });
  });
}

/** A minimal consumer still declares gates and verifies it is inside its checkout. */
export const gatePackage = {
  scripts: {
    "bkit:gate:min": "git rev-parse --verify HEAD >/dev/null",
    "bkit:gate:static-unit": "git rev-parse --verify HEAD >/dev/null",
  },
};
