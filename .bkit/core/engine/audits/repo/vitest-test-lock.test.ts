import { describe, expect, it, vi } from "vitest";

import { testLockDecision, testWorkers } from "../../../../../vitest.test-lock";

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

  it("BKIT_TEST_WORKERS sets maxWorkers when present", () => {
    expect(testWorkers({ BKIT_TEST_WORKERS: "4" })).toEqual({ maxWorkers: 4 });
    expect(testWorkers({ BKIT_TEST_WORKERS: "1" })).toEqual({ maxWorkers: 1 });
    expect(testWorkers({})).toEqual({});
    expect(testWorkers({ BKIT_TEST_WORKERS: "0" })).toEqual({});
    expect(testWorkers({ BKIT_TEST_WORKERS: "-2" })).toEqual({});
    expect(testWorkers({ BKIT_TEST_WORKERS: "1.5" })).toEqual({});
    expect(testWorkers({ BKIT_TEST_WORKERS: "invalid" })).toEqual({});
  });

  it("a watch-mode run takes no lock", () => {
    expect(decision({ watch: true })).toBe(false);
    expect(decision({ watch: false })).toBe(true);
  });
});
