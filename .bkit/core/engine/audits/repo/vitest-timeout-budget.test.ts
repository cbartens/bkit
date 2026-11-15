// audits/repo/vitest-timeout-budget.test.ts — the repo's test budget is CI-strict, a fixed
// multiple locally, and re-read per test file, and every runner that carries it stays wired.
//
// Mirror of a consumer's test-timeout-budget wiring test:
// fail-closed on the wiring, so a config or setup that silently drops the re-read is caught
// here rather than as a flake on a loaded box.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
  INTEGRATION_TEST_TIMEOUT_MS,
  LOCAL_HANG_FACTOR,
  limitFactor,
  localLimit,
  tierTimeouts,
} from "../../../../../vitest.timeout-budget";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");
// Whole-line `//` and block comments only, so a mention in prose cannot satisfy a code
// assertion and a `https://` inside a string is never mistaken for a comment.
const code = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

describe("the test budget is CI-strict and a fixed multiple locally", () => {
  const budget = code("vitest.timeout-budget.ts");

  it("limitFactor returns 1 under CI", () => {
    expect(limitFactor({ CI: "true" })).toBe(1);
    expect(limitFactor({ CI: "1" })).toBe(1);
  });

  it("limitFactor returns LOCAL_HANG_FACTOR off CI", () => {
    expect(LOCAL_HANG_FACTOR).toBe(6);
    expect(limitFactor({})).toBe(LOCAL_HANG_FACTOR);
    expect(limitFactor({ CI: "" })).toBe(LOCAL_HANG_FACTOR);
    expect(limitFactor({ CI: "false" })).toBe(LOCAL_HANG_FACTOR);
  });

  it("tierTimeouts gives the strict bases under CI", () => {
    const factor = limitFactor({ CI: "true" });
    expect(tierTimeouts(false, factor)).toEqual({ testTimeout: 5_000, hookTimeout: 10_000 });
    expect(tierTimeouts(true, factor)).toEqual({ testTimeout: 30_000, hookTimeout: 30_000 });
  });

  it("tierTimeouts gives 6x the bases locally", () => {
    const factor = limitFactor({});
    expect(tierTimeouts(false, factor)).toEqual({ testTimeout: 30_000, hookTimeout: 60_000 });
    expect(tierTimeouts(true, factor)).toEqual({ testTimeout: 180_000, hookTimeout: 180_000 });
  });

  it("localLimit scales a file's own limit locally only", () => {
    expect(localLimit(60_000, limitFactor({ CI: "true" }))).toBe(60_000);
    expect(localLimit(60_000, limitFactor({}))).toBe(360_000);
  });

  it("keeps the 5s unit and 30s integration bases", () => {
    expect(budget).toMatch(/UNIT_TEST_TIMEOUT_MS = 5_000/);
    expect(budget).toMatch(/INTEGRATION_TEST_TIMEOUT_MS = 30_000/);
  });

  it("the budget reads no load", () => {
    const readsLoad = (src: string) => /loadavg|availableParallelism|PLANNED_LOAD/.test(src);
    expect(readsLoad(budget)).toBe(false);
    // CONTROL: a source that calls os.loadavg() is caught
    expect(readsLoad("const l = os.loadavg()[0];")).toBe(true);
  });
});

describe("the configs read the fixed budget", () => {
  it("vitest.config.ts spreads unitTimeouts and plans no load", () => {
    const config = code("vitest.config.ts");
    expect(config).toMatch(/\.\.\.unitTimeouts\(\)/);
    expect(config).not.toMatch(/planUnitLoad/);
    // CONTROL: a config that still plans the load is caught
    expect(/planUnitLoad/.test("planUnitLoad();\n...unitTimeouts()")).toBe(true);
    expect(code("vitest.setup.ts")).toMatch(/vi\.setConfig\(tierTimeouts\(/);
  });

  it("the bats local default matches the integration hang limit", () => {
    const localDefault = (src: string) =>
      /else\s+export BATS_TEST_TIMEOUT="\$\{BATS_TEST_TIMEOUT:-(\d+)\}"/.exec(src)?.[1];
    const expected = String((INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_FACTOR) / 1000);
    expect(localDefault(read("tests/shell/setup_suite.bash"))).toBe(expected);
    // CONTROL: a mismatched value is caught
    const bad = 'else\n    export BATS_TEST_TIMEOUT="${BATS_TEST_TIMEOUT:-90}"\n';
    expect(localDefault(bad)).not.toBe(expected);
  });
});

const BARE = new RegExp(
  [
    String.raw`\{ ?timeout: ?[0-9][0-9_]* ?\}`,
    // a numeric literal in a multi-key option on a test, hook or suite call
    String.raw`\b(?:it|test|describe)(?:\.\w+)*\(\s*(["'\x60])[^\n]*?\1\s*,\s*\{\s*timeout:\s*[0-9][0-9_]*\s*,`,
    String.raw`\}, ?[0-9][0-9_]{3,}\);`,
    // a numeric literal bound to a constant that is then the test option or the trailing limit
    String.raw`\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*[0-9][0-9_]{3,}\s*;[\s\S]*?(?:\btimeout:\s*\2\b|\}, ?\2\);)`,
  ].join("|"),
);

describe("no test file sets a bare limit", () => {
  const SELF = ".bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts";
  const walk = (dir: string): string[] =>
    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) return e.name === "node_modules" ? [] : walk(rel);
      return e.name.endsWith(".test.ts") ? [rel] : [];
    });

  it("no test file sets a bare numeric test or hook limit", () => {
    const files = [...walk(".bkit/core/engine"), ...walk("scripts/harvest")].filter(
      (f) => f !== SELF,
    );
    const offenders = files.filter((f) => BARE.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("CONTROL — a bare numeric test limit is caught", () => {
    expect(BARE.test('it("x", { timeout: 30_000 }, fn)')).toBe(true);
    expect(BARE.test("it('x', () => {\n}, 30_000);")).toBe(true);
    expect(BARE.test('it("x", { timeout: localLimit(30_000) }, fn)')).toBe(false);
    // the wrapped form the guard accepts really is scaled by the fixed local factor
    expect(localLimit(30_000, limitFactor({}))).toBe(30_000 * LOCAL_HANG_FACTOR);
  });
});

describe("no test file sets a limit through a named constant", () => {
  const SELF = ".bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts";
  const walk = (dir: string): string[] =>
    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) return e.name === "node_modules" ? [] : walk(rel);
      return e.name.endsWith(".test.ts") ? [rel] : [];
    });
  // A numeric literal bound to a constant that is then used as a test option or a trailing limit,
  // or a numeric literal inside a multi-key `{ timeout: N, ... }` option.
  const namedLimits = (src: string): string[] => {
    const hits: string[] = [];
    for (const m of src.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*[0-9][0-9_]{3,}\s*;/g)) {
      const name = m[1] as string;
      const used = new RegExp(`\\{[^{}]*\\btimeout:\\s*${name}\\b|\\},\\s*${name}\\s*\\);`);
      if (used.test(src)) hits.push(name);
    }
    if (
      /\b(?:it|test|describe)(?:\.\w+)*\(\s*(["'`])[^\n]*?\1\s*,\s*\{\s*timeout:\s*[0-9][0-9_]*\s*,/.test(
        src,
      )
    ) {
      hits.push("multi-key");
    }
    return hits;
  };

  it("CONTROL — a test limit set through a named numeric constant is caught", () => {
    expect(namedLimits('const T = 60_000;\nit("x", { timeout: T }, fn);')).toEqual(["T"]);
    expect(namedLimits('const T = 60_000;\nit("x", () => {\n}, T);')).toEqual(["T"]);
    expect(namedLimits('it("x", { timeout: 30_000, retry: 1 }, fn);')).toEqual(["multi-key"]);
    expect(namedLimits('const T = localLimit(60_000);\nit("x", { timeout: T }, fn);')).toEqual([]);
    // the shared bare-limit guard itself must see a numeric literal bound to a constant
    expect(BARE.test('const T = 60_000;\nit("x", { timeout: T }, fn);')).toBe(true);
    expect(BARE.test('const T = 60_000;\nit("x", () => {\n}, T);')).toBe(true);
    expect(BARE.test('it("x", { timeout: 30_000, retry: 1 }, fn);')).toBe(true);
    expect(BARE.test('const T = localLimit(60_000);\nit("x", { timeout: T }, fn);')).toBe(false);
  });

  it("no test file sets a numeric test limit through a named constant", () => {
    const files = [...walk(".bkit/core/engine"), ...walk("scripts/harvest")].filter(
      (f) => f !== SELF,
    );
    const offenders = files.flatMap((f) => namedLimits(read(f)).map((n) => `${f}:${n}`));
    expect(offenders).toEqual([]);
  });
});

describe("the runners re-read the budget per test file", () => {
  it("vitest.config.ts spreads the unit budget", () => {
    const config = code("vitest.config.ts");
    expect(config).toMatch(
      /import \{[^}]*\bunitTimeouts\b[^}]*\} from "\.\/vitest\.timeout-budget\.ts"/,
    );
    expect(config).toMatch(/\.\.\.unitTimeouts\(\)/);
  });

  it("vitest.setup.ts re-reads it with vi.setConfig", () => {
    const setup = code("vitest.setup.ts");
    expect(setup).toMatch(/import \{ tierTimeouts \} from "\.\/vitest\.timeout-budget\.ts"/);
    expect(setup).toMatch(/vi\.setConfig\(tierTimeouts\(/);
  });

  it("CONTROL — a setup that hard-codes a timeout is caught", () => {
    const bad = `import { vi } from "vitest";\nvi.setConfig({ testTimeout: 30_000 });\n`;
    expect(/vi\.setConfig\(tierTimeouts\(/.test(bad)).toBe(false);
  });

  it("CONTROL — a config without the spread is caught", () => {
    const bad = `import { defineConfig } from "vitest/config";\nexport default defineConfig({ test: { include: [] } });\n`;
    expect(/\.\.\.unitTimeouts\(\)/.test(bad)).toBe(false);
  });
});
