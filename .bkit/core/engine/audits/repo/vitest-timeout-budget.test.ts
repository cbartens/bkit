// audits/repo/vitest-timeout-budget.test.ts — the repo's test budget is load-scaled, capped,
// and re-read per test file, and every runner that carries it stays wired.
//
// Mirror of app-gether-life #1392 (tooling/eslint/tests/test-timeout-budget.test.ts):
// fail-closed on the wiring, so a config or setup that silently drops the re-read is caught
// here rather than as a flake on a loaded box.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

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

describe("the runners re-read the budget per test file", () => {
  it("vitest.config.ts spreads the load-scaled unit budget", () => {
    const config = code("vitest.config.ts");
    expect(config).toMatch(/import \{ unitTimeouts \} from "\.\/vitest\.timeout-budget\.ts"/);
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
