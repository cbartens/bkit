import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it, vi } from "vitest";

import { testLockDecision, testWorkers } from "../../../../../vitest.test-lock";

const probeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-workers-"));
afterAll(() => fs.rmSync(probeRoot, { recursive: true, force: true }));

/** An env whose PATH answers the script's core probe with `cores`, for the real slots reader. */
function coreProbe(cores: number): NodeJS.ProcessEnv {
  const bin = path.join(probeRoot, `cores-${cores}`);
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(
    path.join(bin, "getconf"),
    `#!/bin/sh\n[ "$1" = _NPROCESSORS_ONLN ] || exit 1\nprintf "${cores}\\n"\n`,
    { mode: 0o755 },
  );
  return { PATH: bin + path.delimiter + (process.env.PATH ?? "") };
}

const files = new Set(["src/a.test.ts", "src/b.integration.test.ts"]);
const decision = (
  overrides: {
    filters?: string[];
    env?: NodeJS.ProcessEnv;
    exists?: (file: string) => boolean;
    alive?: (pid: number) => boolean;
    watch?: boolean;
  } = {},
) =>
  testLockDecision({
    filters: [],
    env: {},
    exists: (file: string) => files.has(file),
    alive: () => false,
    watch: false,
    ...overrides,
  }).take;

describe("raw Vitest lock decisions", () => {
  it("a run whose every filter is an existing test file is light and takes no lock", () => {
    const exists = vi.fn((file: string) => files.has(file));
    expect(decision({ filters: ["src/a.test.ts"], exists })).toBe(false);
    expect(decision({ filters: ["src/a.test.ts:12", "src/b.integration.test.ts:2"], exists })).toBe(
      false,
    );
    expect(exists).toHaveBeenCalledWith("src/a.test.ts");
    expect(exists).toHaveBeenCalledWith("src/b.integration.test.ts");
    expect(exists).not.toHaveBeenCalledWith("src/a.test.ts:12");
    expect(exists).not.toHaveBeenCalledWith("src/b.integration.test.ts:2");
  });

  it("a run with no filters, or a pattern filter, is heavy and takes the tests lock", () => {
    expect(decision()).toBe(true);
    expect(decision({ filters: ["src/"] })).toBe(true);
    expect(decision({ filters: ["*.test.ts"] })).toBe(true);
    expect(decision({ filters: ["src/a.test.ts", "missing.test.ts"] })).toBe(true);
    expect(decision({ filters: ["src/a.test.ts", "workflow"] })).toBe(true);
  });

  it("a run started under a live tests-lock owner takes no lock", () => {
    const alive = vi.fn((pid: number) => pid === 123);
    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER_tests: "123" }, alive })).toBe(false);
    expect(alive).toHaveBeenCalledWith(123);
    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER_tests: "456" }, alive })).toBe(true);
    expect(alive).toHaveBeenCalledWith(456);
    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER_tests: "not-a-pid" }, alive })).toBe(true);
    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER: "123" }, alive })).toBe(true);
  });

  it("CI=true takes no lock", () => {
    expect(decision({ env: { CI: "true" } })).toBe(false);
    expect(decision({ env: { CI: "false" } })).toBe(true);
  });

  it("CI=1 takes no lock", () => {
    expect(decision({ env: { CI: "1" } })).toBe(false);
    expect(decision({ env: { CI: "0" } })).toBe(true);
  });

  it("an inherited BKIT_TEST_WORKERS beats the script's workers", () => {
    const read = vi.fn(() => "slots=2 workers=4\n");
    expect(testWorkers({ BKIT_TEST_WORKERS: "7" }, read)).toEqual({ maxWorkers: 7 });
    expect(testWorkers({ BKIT_TEST_WORKERS: "1" }, read)).toEqual({ maxWorkers: 1 });
    expect(testWorkers({ BKIT_TEST_WORKERS: "7", CI: "true" }, read)).toEqual({ maxWorkers: 7 });
    expect(read).not.toHaveBeenCalled();
    for (const invalid of ["", "0", "-2", "1.5", "invalid"])
      expect(testWorkers({ BKIT_TEST_WORKERS: invalid }, read)).toEqual({ maxWorkers: 4 });
  });

  it("testWorkers reads the script's slots output and returns four workers on 10 local cores", () => {
    const read = vi.fn(() => "slots=2 workers=4\n");
    const env = { BKIT_RUNTIME: "LOCAL" };
    expect(testWorkers(env, read)).toEqual({ maxWorkers: 4 });
    expect(read).toHaveBeenCalledWith(env);
    expect(testWorkers({ ...coreProbe(10), BKIT_RUNTIME: "LOCAL" })).toEqual({ maxWorkers: 4 });
  });

  it("testWorkers returns cores - 1 with BKIT_TEST_SLOTS=1 or a cloud runtime, and no limit under CI", () => {
    const tenCores = coreProbe(10);
    expect(testWorkers({ ...tenCores, BKIT_RUNTIME: "LOCAL", BKIT_TEST_SLOTS: "1" })).toEqual({
      maxWorkers: 9,
    });
    expect(testWorkers({ ...tenCores, BKIT_RUNTIME: "CURSOR" })).toEqual({ maxWorkers: 9 });
    expect(testWorkers({ ...tenCores, CLAUDE_CODE_REMOTE: "true" })).toEqual({ maxWorkers: 9 });
    expect(testWorkers({ ...coreProbe(4), BKIT_RUNTIME: "LOCAL" })).toEqual({ maxWorkers: 3 });
    const read = vi.fn(() => "slots=2 workers=4\n");
    expect(testWorkers({ CI: "true" }, read)).toEqual({});
    expect(testWorkers({ CI: "1" }, read)).toEqual({});
    expect(read).not.toHaveBeenCalled();
  });

  it("testWorkers throws when the script prints no workers", () => {
    expect(() => testWorkers({}, () => "")).toThrow(/slots/);
    expect(() => testWorkers({}, () => "slots=2 workers=0\n")).toThrow(/slots/);
  });

  it("a watch-mode run takes no lock", () => {
    expect(decision({ watch: true })).toBe(false);
    expect(decision({ watch: false })).toBe(true);
  });
});
