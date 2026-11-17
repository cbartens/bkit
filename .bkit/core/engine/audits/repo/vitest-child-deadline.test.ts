// audits/repo/vitest-child-deadline.test.ts — `withChildDeadline` (vitest.child-deadline.ts)
// gives a synchronous child call the running test's remaining time when the caller set none.
//
// Each probe wraps a copy of the real `node:child_process` functions and runs a real
// `sleep 30` child, so a missing limit shows as the call blocking, not as a mocked value.

import * as childProcess from "node:child_process";
import { describe, expect, it } from "vitest";
import { withChildDeadline } from "../../../../../vitest.child-deadline";

function wrapped(remainingMs: () => number) {
  const target = {
    spawnSync: childProcess.spawnSync,
    execSync: childProcess.execSync,
    execFileSync: childProcess.execFileSync,
  };
  withChildDeadline(target, remainingMs);
  return target;
}

describe("withChildDeadline", () => {
  it("stops a spawnSync with no timeout at the remaining time and names it", () => {
    const cp = wrapped(() => 300);
    const started = Date.now();
    let message = "";
    try {
      cp.spawnSync("sleep", ["30"]);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(message).toContain("sleep");
    expect(message).toContain("30");
    expect(message).toMatch(/\b300\s*ms/);
  });

  it("leaves an explicit timeout as the caller set it", () => {
    const cp = wrapped(() => 60_000);
    const started = Date.now();
    const result = cp.spawnSync("sleep", ["30"], { timeout: 200 });
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(result.error).toBeDefined();
    expect((result.error as NodeJS.ErrnoException).code).toBe("ETIMEDOUT");
  });

  it("limits execSync and execFileSync the same way", () => {
    const cp = wrapped(() => 300);
    const started = Date.now();
    expect(() => cp.execSync("sleep 30")).toThrow(/sleep 30/);
    expect(() => cp.execFileSync("sleep", ["30"])).toThrow(/sleep/);
    expect(Date.now() - started).toBeLessThan(10_000);
  });

  it("uses at least 1ms when the limit has already passed", () => {
    const cp = wrapped(() => -50);
    const started = Date.now();
    let message = "";
    try {
      cp.spawnSync("sleep", ["30"]);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(message).toMatch(/\b1\s*ms/);
  });

  it("stops a child that ignores SIGTERM at the remaining time", () => {
    const cp = wrapped(() => 300);
    const started = Date.now();
    let message = "";
    try {
      cp.spawnSync("sh", ["-c", "trap '' TERM; sleep 30"]);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(message).toContain("did not finish within");
    expect(message).toMatch(/\b300\s*ms/);
  });
});
