// audits/repo/vitest-timeout-budget.test.ts — the repo's test budget is load-scaled, capped,
// and re-read per test file, and every runner that carries it stays wired.
//
// Mirror of a consumer's test-timeout-budget wiring test:
// fail-closed on the wiring, so a config or setup that silently drops the re-read is caught
// here rather than as a flake on a loaded box.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { loadFactor, planUnitLoad, plannedLoadPerCore } from "../../../../../vitest.timeout-budget";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");
// Whole-line `//` and block comments only, so a mention in prose cannot satisfy a code
// assertion and a `https://` inside a string is never mistaken for a comment.
const code = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

describe("the test budget is load-scaled, capped, and CI-pinned", () => {
  const budget = code("vitest.timeout-budget.ts");

  it("pins the factor to 1 under CI", () => {
    expect(budget).toMatch(/env\.CI === "true" \|\| env\.CI === "1"/);
  });

  it("never exceeds the cap", () => {
    expect(budget).toMatch(/Math\.min\(\s*MAX_LOAD_FACTOR,\s*Math\.max\(1,/);
  });

  it("keeps the 5s unit and 30s integration bases", () => {
    expect(budget).toMatch(/UNIT_TEST_TIMEOUT_MS = 5_000/);
    expect(budget).toMatch(/INTEGRATION_TEST_TIMEOUT_MS = 30_000/);
  });
});

describe("the run declares the load it is about to add", () => {
  it("projects the load now plus one core per worker, over the cores", () => {
    expect(plannedLoadPerCore(9, 3, 10)).toBeCloseTo(1.2);
    expect(plannedLoadPerCore(9, 25, 10)).toBeCloseTo(3.4);
  });

  it("raises the factor above a quiet reading", () => {
    expect(loadFactor(3, 10, { UNIT_PLANNED_LOAD_PER_CORE: "3.40" })).toBeCloseTo(3.4);
  });

  it("sets the planned load from vitest's default of a worker per core but one", () => {
    const env: NodeJS.ProcessEnv = {};
    expect(planUnitLoad(env, 25, 10)).toBe("3.40");
    expect(env.UNIT_PLANNED_LOAD_PER_CORE).toBe("3.40");
  });

  it("keeps a planned load a caller already set", () => {
    const env: NodeJS.ProcessEnv = { UNIT_PLANNED_LOAD_PER_CORE: "2.00" };
    expect(planUnitLoad(env, 25, 10)).toBe("2.00");
    expect(env.UNIT_PLANNED_LOAD_PER_CORE).toBe("2.00");
  });

  it("vitest.config.ts plans the load before it reads the budget", () => {
    const config = code("vitest.config.ts");
    expect(config).toMatch(/planUnitLoad\(\);/);
    expect(config.indexOf("planUnitLoad();")).toBeLessThan(config.indexOf("...unitTimeouts()"));
  });

  it("CONTROL — a config that never plans the load is caught", () => {
    const bad = `import { defineConfig } from "vitest/config";\nexport default defineConfig({ test: { ...unitTimeouts() } });\n`;
    expect(/planUnitLoad\(\);/.test(bad)).toBe(false);
  });
});

describe("the runners re-read the budget per test file", () => {
  it("vitest.config.ts spreads the load-scaled unit budget", () => {
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
