// audits/repo/test-file-script.integration.test.ts — bkit's own `bkit:test:file` and
// `bkit:lint:file` scripts take every test file kind the repo holds.
//
// `bkit tests red` / `bkit tests green` run one test file through `bkit:test:file` with a JUnit
// report at $BKIT_TEST_REPORT, after `bkit:lint:file` on the same file. Each probe runs the real
// script on a real test file and reads the report the way the audit does.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { judgeGreen, parseJunit, REPORT_ENV } from "../../commands/workflow/tests.js";

const ROOT = process.cwd();

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-file-"));
  temps.push(dir);
  return dir;
}

function pnpm(env: NodeJS.ProcessEnv, ...args: string[]) {
  return spawnSync("pnpm", ["-s", ...args], {
    cwd: ROOT,
    encoding: "utf-8",
    env: { ...process.env, ...env },
  });
}

const FILES = [
  {
    kind: "bats",
    file: "tests/gh-stub-smoke.bats",
    test: "stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list",
  },
  {
    kind: "node",
    file: "scripts/harvest/bkit-harvest.test.mjs",
    test: "slugFromRemote reads ssh and https remotes",
  },
  {
    kind: "vitest",
    file: ".bkit/core/engine/audits/repo/config-keys.test.ts",
    test: "declares bkit.testing.ciCapstone 'bkit-tests-check'",
  },
];

describe("bkit:test:file runs every test file kind into a JUnit report", () => {
  it.each(FILES)(
    "$kind — $file reports its named test passed",
    { timeout: 120_000 },
    ({ file, test }) => {
      const report = path.join(tempDir(), "junit.xml");
      const res = pnpm({ [REPORT_ENV]: report }, "bkit:test:file", file);
      expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
      expect(judgeGreen(parseJunit(fs.readFileSync(report, "utf-8")), test)).toBeNull();
    },
  );

  it.each(FILES)(
    "$kind — with no report path the test file is left as it was",
    { timeout: 120_000 },
    ({ file }) => {
      const before = fs.readFileSync(path.join(ROOT, file), "utf-8");
      const res = pnpm({ [REPORT_ENV]: "" }, "bkit:test:file", file);
      expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
      expect(fs.readFileSync(path.join(ROOT, file), "utf-8")).toBe(before);
    },
  );

  it("a run naming files of two kinds is refused as a usage error", () => {
    const res = pnpm(
      { [REPORT_ENV]: path.join(tempDir(), "junit.xml") },
      "bkit:test:file",
      FILES[0].file,
      FILES[1].file,
    );
    expect(res.status).toBe(2);
    expect(res.stderr).toContain("one runner");
  });
});

describe("bkit:lint:file passes a test file its linter does not cover", () => {
  it.each(FILES)("$kind — $file lints clean", { timeout: 120_000 }, ({ file }) => {
    const res = pnpm({}, "bkit:lint:file", file);
    expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
  });
});
