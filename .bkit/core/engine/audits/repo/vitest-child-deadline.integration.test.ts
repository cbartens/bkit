// audits/repo/vitest-child-deadline.integration.test.ts — a Vitest worker stops a hung
// synchronous child at the running test's own timeout.
//
// A nested `vitest run` loads the repo's real vitest.setup.ts and runs one test that blocks on
// a `sleep 30` child with a 2s test timeout. Without the setup's child limit the nested run
// sits in the call for 30s.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, expect, it } from "vitest";

const ROOT = process.cwd();
const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

it("fails a test whose spawnSync child hangs within the test's own timeout", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-child-deadline-"));
  temps.push(dir);
  fs.writeFileSync(
    path.join(dir, "vitest.config.mjs"),
    `export default { test: { globals: true, include: ["hang.test.mjs"], testTimeout: 2000, hookTimeout: 5000, setupFiles: [${JSON.stringify(path.join(ROOT, "vitest.setup.ts"))}] } };\n`,
  );
  fs.writeFileSync(
    path.join(dir, "hang.test.mjs"),
    `import { spawnSync } from "node:child_process";\nit("hangs on a child", () => {\n  spawnSync("sleep", ["30"]);\n});\n`,
  );
  const started = Date.now();
  const run = spawnSync(
    path.join(ROOT, "node_modules/.bin/vitest"),
    ["run", "--root", dir, "--config", path.join(dir, "vitest.config.mjs")],
    { cwd: ROOT, encoding: "utf-8", timeout: 25_000, env: { ...process.env, CI: "1" } },
  );
  const output = `${run.stdout}${run.stderr}`;
  expect(run.error, output).toBeUndefined();
  expect(Date.now() - started).toBeLessThan(9_000);
  expect(run.status).not.toBe(0);
  expect(output).toContain("sleep");
  expect(output).toMatch(/30/);
});

it("gives a file's afterEach child call the hook timeout after a test that used most of its time", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-child-deadline-hook-"));
  temps.push(dir);
  fs.writeFileSync(
    path.join(dir, "vitest.config.mjs"),
    `export default { test: { globals: true, include: ["hook.test.mjs"], testTimeout: 5000, hookTimeout: 10000, setupFiles: [${JSON.stringify(path.join(ROOT, "vitest.setup.ts"))}] } };\n`,
  );
  fs.writeFileSync(
    path.join(dir, "hook.test.mjs"),
    `import { spawnSync } from "node:child_process";\nafterEach(() => {\n  spawnSync("sleep", ["2"]);\n});\nit("uses most of its time", () => {\n  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 4000);\n});\n`,
  );
  const run = spawnSync(
    path.join(ROOT, "node_modules/.bin/vitest"),
    ["run", "--root", dir, "--config", path.join(dir, "vitest.config.mjs")],
    { cwd: ROOT, encoding: "utf-8", timeout: 40_000, env: { ...process.env, CI: "1" } },
  );
  const output = `${run.stdout}${run.stderr}`;
  expect(run.error, output).toBeUndefined();
  expect(output).not.toContain("did not finish within");
  expect(run.status, output).toBe(0);
});

function nestedRun(name: string, body: string, testTimeout: number, hookTimeout: number) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-child-deadline-nested-"));
  temps.push(dir);
  fs.writeFileSync(
    path.join(dir, "vitest.config.mjs"),
    `export default { test: { globals: true, include: ["${name}.test.mjs"], testTimeout: ${testTimeout}, hookTimeout: ${hookTimeout}, setupFiles: [${JSON.stringify(path.join(ROOT, "vitest.setup.ts"))}] } };\n`,
  );
  fs.writeFileSync(path.join(dir, `${name}.test.mjs`), body);
  const run = spawnSync(
    path.join(ROOT, "node_modules/.bin/vitest"),
    ["run", "--root", dir, "--config", path.join(dir, "vitest.config.mjs")],
    { cwd: ROOT, encoding: "utf-8", timeout: 40_000, env: { ...process.env, CI: "1" } },
  );
  return { run, output: `${run.stdout}${run.stderr}` };
}

it("gives an async afterEach child call the hook timeout after an await", () => {
  const { run, output } = nestedRun(
    "asynchook",
    `import { spawnSync } from "node:child_process";\nafterEach(async () => {\n  await new Promise((r) => setTimeout(r, 10));\n  spawnSync("sleep", ["2"]);\n});\nit("uses most of its time", () => {\n  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 4000);\n});\n`,
    5000,
    10000,
  );
  expect(run.error, output).toBeUndefined();
  expect(output).not.toContain("did not finish within");
  expect(run.status, output).toBe(0);
});

it("does not take a slow beforeEach off the test body's child limit", () => {
  const { run, output } = nestedRun(
    "slowbefore",
    `import { spawnSync } from "node:child_process";\nbeforeEach(() => {\n  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 4000);\n});\nit("body child after a slow beforeEach", () => {\n  spawnSync("sleep", ["3"]);\n});\n`,
    5000,
    10000,
  );
  expect(run.error, output).toBeUndefined();
  expect(output).not.toContain("did not finish within");
  expect(run.status, output).toBe(0);
});

it("counts the body's child limit from when the body starts, not from its first child call", () => {
  const started = Date.now();
  const { run, output } = nestedRun(
    "awaitthenhang",
    `import { spawnSync } from "node:child_process";\nit("awaits then hangs on a child", async () => {\n  await new Promise((r) => setTimeout(r, 3000));\n  spawnSync("sleep", ["30"]);\n});\n`,
    5000,
    10000,
  );
  expect(run.error, output).toBeUndefined();
  expect(Date.now() - started).toBeLessThan(5000 + 3000);
  expect(run.status).not.toBe(0);
  expect(output).toContain("did not finish within");
});

it("keeps the body's child limit on the real clock when the test sets a future system time", () => {
  const { run, output } = nestedRun(
    "futureclock",
    `import { spawnSync } from "node:child_process";\nimport { vi } from "vitest";\nit("sets a future time then runs a child", () => {\n  vi.useFakeTimers({ toFake: ["Date"] });\n  vi.setSystemTime(Date.now() + 3_600_000);\n  expect(spawnSync("true").status).toBe(0);\n});\n`,
    5000,
    10000,
  );
  expect(run.error, output).toBeUndefined();
  expect(output).not.toContain("did not finish within");
  expect(run.status, output).toBe(0);
});

it("stops a hung child at the test's timeout when the test sets a past system time", () => {
  const started = Date.now();
  const { run, output } = nestedRun(
    "pastclock",
    `import { spawnSync } from "node:child_process";\nimport { vi } from "vitest";\nit("sets a past time then hangs on a child", () => {\n  vi.useFakeTimers({ toFake: ["Date"] });\n  vi.setSystemTime(new Date("2026-10-31T23:30:00-05:00"));\n  spawnSync("sleep", ["12"]);\n});\n`,
    5000,
    10000,
  );
  expect(run.error, output).toBeUndefined();
  expect(Date.now() - started).toBeLessThan(5000 + 3000);
  expect(run.status).not.toBe(0);
});
