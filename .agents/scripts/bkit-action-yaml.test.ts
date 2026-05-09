// bkit-action-yaml.test.ts — Offline acceptance test for setup-auth/action.yml (P4.T8).
//
// Tests: Derived Test Matrix row
//   "`setup-auth/action.yml` schema parse (offline)" (P4.T8)
//
// Validates the GitHub Actions composite action YAML offline:
//   - File exists at .github/actions/setup-auth/action.yml
//   - Parses as valid YAML structure (key:value format)
//   - Has required `inputs` with `token` and `registry`
//   - Has `runs: using: composite` declaration
//   - Has at least one step under `runs.steps`
//
// No network calls. All checks are local file system + string parsing.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ACTION_YAML_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../.github/actions/setup-auth/action.yml",
);

// ---------------------------------------------------------------------------
// Minimal YAML structural parser (offline — no yaml package required)
//
// Strategy: parse the action.yml as text using a simple line-based approach
// that extracts top-level keys and their nested structure. This is sufficient
// for the assertion contract (inputs have token + registry; runs.using=composite).
// ---------------------------------------------------------------------------

/**
 * Extract all lines starting with a given indent prefix that contain `key: value`.
 * Returns a map of key → trimmed value string (may be empty for block scalars).
 */
function extractYamlKeys(content: string, indentLevel: number): Map<string, string> {
  const indent = " ".repeat(indentLevel);
  const map = new Map<string, string>();
  for (const line of content.split("\n")) {
    const m = line.match(new RegExp(`^${indent}(\\w[^:]*):(.*)$`));
    if (m) {
      map.set(m[1]!.trim(), m[2]!.trim());
    }
  }
  return map;
}

/**
 * Check whether content contains a line matching the given pattern at the given indent level.
 */
function hasYamlKey(content: string, indentLevel: number, key: string): boolean {
  const indent = " ".repeat(indentLevel);
  return content.split("\n").some((line) => {
    const m = line.match(new RegExp(`^${indent}${key}:`));
    return !!m;
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("P4.T8 — setup-auth/action.yml offline acceptance", () => {
  it("action.yml file exists at expected path", () => {
    expect(fs.existsSync(ACTION_YAML_PATH), `action.yml must exist at ${ACTION_YAML_PATH}`).toBe(
      true,
    );
  });

  it("action.yml is non-empty and readable", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("action.yml has top-level `name` field", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "name")).toBe(true);
  });

  it("action.yml has top-level `description` field", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "description")).toBe(true);
  });

  it("action.yml has top-level `inputs` section", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "inputs")).toBe(true);
  });

  it("action.yml inputs has `token` input", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    // inputs.token is at indent level 2
    expect(hasYamlKey(content, 2, "token")).toBe(true);
  });

  it("action.yml inputs has `registry` input", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    // inputs.registry is at indent level 2
    expect(hasYamlKey(content, 2, "registry")).toBe(true);
  });

  it("action.yml `token` input has `required: true`", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    // Find the `inputs:` block, then look for `  token:` followed by `required: true`
    const inputsIdx = content.indexOf("\ninputs:");
    expect(inputsIdx).toBeGreaterThan(-1);
    const afterInputs = content.slice(inputsIdx);
    const tokenIdx = afterInputs.indexOf("\n  token:");
    expect(tokenIdx).toBeGreaterThan(-1);
    const afterToken = afterInputs.slice(tokenIdx, tokenIdx + 500);
    expect(afterToken).toContain("required: true");
  });

  it("action.yml `registry` input has a default value", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    const registryIdx = content.indexOf("  registry:");
    expect(registryIdx).toBeGreaterThan(-1);
    const afterRegistry = content.slice(registryIdx, registryIdx + 300);
    expect(afterRegistry).toContain("default:");
  });

  it("action.yml has top-level `runs` section", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "runs")).toBe(true);
  });

  it("action.yml `runs.using` is `composite`", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    const runsIdx = content.indexOf("runs:");
    expect(runsIdx).toBeGreaterThan(-1);
    const afterRuns = content.slice(runsIdx, runsIdx + 500);
    expect(afterRuns).toContain('using: "composite"');
  });

  it("action.yml has at least one step under `runs.steps`", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    // Steps are listed under `runs.steps:` with `    - name:` or `    - uses:`
    const stepsIdx = content.indexOf("  steps:");
    expect(stepsIdx).toBeGreaterThan(-1);
    const afterSteps = content.slice(stepsIdx);
    // A step starts with `    - name:` or `    - uses:` (4 spaces + dash)
    expect(afterSteps).toMatch(/    - (name|uses|shell|run):/);
  });

  it("action.yml uses BKIT_READ_TOKEN env var (not GH_BKIT_TOKEN directly)", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    // The action wraps the PAT-shim by exporting BKIT_READ_TOKEN
    expect(content).toContain("BKIT_READ_TOKEN");
  });

  it("action.yml references secrets via inputs.token in the runs block (not hardcoded secret name)", () => {
    const content = fs.readFileSync(ACTION_YAML_PATH, "utf-8");
    // The action uses ${{ inputs.token }} in the runs block
    expect(content).toContain("${{ inputs.token }}");
    // The `runs.steps` block should not contain secrets — only inputs
    const runsIdx = content.indexOf("\nruns:");
    expect(runsIdx).toBeGreaterThan(-1);
    const runsBlock = content.slice(runsIdx);
    // Within the runs block, secrets.GH_BKIT_TOKEN must not appear
    expect(runsBlock).not.toContain("secrets.GH_BKIT_TOKEN");
  });
});

// ---------------------------------------------------------------------------
// Downstream: ci.yml template uses setup-auth@v1
// ---------------------------------------------------------------------------

describe("P4.T8 — ci.yml template uses setup-auth@v1", () => {
  const CI_TEMPLATE_PATH = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../.agents/templates/.github/workflows/ci.yml",
  );

  it("ci.yml template exists", () => {
    expect(fs.existsSync(CI_TEMPLATE_PATH)).toBe(true);
  });

  it("ci.yml template references setup-auth@v1 action", () => {
    const content = fs.readFileSync(CI_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("cbartens/bkit/.github/actions/setup-auth@v1");
  });

  it("ci.yml template passes GH_BKIT_TOKEN to setup-auth", () => {
    const content = fs.readFileSync(CI_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("secrets.GH_BKIT_TOKEN");
  });
});

// ---------------------------------------------------------------------------
// test-action.yml meta-test workflow exists
// ---------------------------------------------------------------------------

describe("P4.T8 — test-action.yml meta-test workflow", () => {
  const TEST_ACTION_PATH = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../.github/workflows/test-action.yml",
  );

  it("test-action.yml exists", () => {
    expect(fs.existsSync(TEST_ACTION_PATH)).toBe(true);
  });

  it("test-action.yml triggers on workflow_dispatch", () => {
    const content = fs.readFileSync(TEST_ACTION_PATH, "utf-8");
    expect(content).toContain("workflow_dispatch");
  });

  it("test-action.yml references the setup-auth action", () => {
    const content = fs.readFileSync(TEST_ACTION_PATH, "utf-8");
    // References local path since this is within the same repo
    expect(content).toContain("setup-auth");
  });
});

// ---------------------------------------------------------------------------
// C5 — BAR-148: bkit-ci-router.yml template structural assertions (matrix row 6)
// ---------------------------------------------------------------------------

const ROUTER_TEMPLATE_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../.agents/templates/.github/workflows/bkit-ci-router.yml",
);

describe("C5 — bkit-ci-router.yml template structural assertions (BAR-148, matrix row 6)", () => {
  it("template file exists at .agents/templates/.github/workflows/bkit-ci-router.yml", () => {
    expect(fs.existsSync(ROUTER_TEMPLATE_PATH)).toBe(true);
  });

  it("template is non-empty and readable", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("template has top-level `name` field", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "name")).toBe(true);
  });

  it("template has top-level `on` field", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "on")).toBe(true);
  });

  it("template has top-level `permissions` field", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "permissions")).toBe(true);
  });

  it("template has top-level `concurrency` field", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "concurrency")).toBe(true);
  });

  it("template has top-level `jobs` field", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(hasYamlKey(content, 0, "jobs")).toBe(true);
  });

  it("template does NOT have unexpected top-level keys beyond name/on/permissions/concurrency/jobs", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    const EXPECTED_TOP_KEYS = new Set(["name", "on", "permissions", "concurrency", "jobs"]);
    for (const line of content.split("\n")) {
      const m = line.match(/^(\w[\w-]*):/);
      if (m) {
        expect(EXPECTED_TOP_KEYS.has(m[1]!)).toBe(true);
      }
    }
  });

  it("template on.workflow_run.workflows is [CI]", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("workflows: [CI]");
  });

  it("template on.workflow_run.types is [completed]", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("types: [completed]");
  });

  it("template on.workflow_run.branches includes feat/**", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("feat/**");
  });

  it("template concurrency.cancel-in-progress is true", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("cancel-in-progress: true");
  });

  it("template jobs.route.timeout-minutes is ≤ 240", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    const m = content.match(/timeout-minutes:\s*(\d+)/);
    expect(m).not.toBeNull();
    const timeout = parseInt(m![1]!, 10);
    expect(timeout).toBeLessThanOrEqual(240);
  });

  it("template jobs.route.if filters on success or failure conclusion", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("conclusion == 'success'");
    expect(content).toContain("conclusion == 'failure'");
  });

  it("template uses anthropics/claude-code-action@v1", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("anthropics/claude-code-action@v1");
  });

  it("template passes /bkit-ci-router as prompt", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain('prompt: "/bkit-ci-router"');
  });

  it("template passes ANTHROPIC_API_KEY via secrets", () => {
    const content = fs.readFileSync(ROUTER_TEMPLATE_PATH, "utf-8");
    expect(content).toContain("ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}");
  });
});

// ---------------------------------------------------------------------------
// C5b — BAR-148: dogfood bkit-ci-router.yml matches template byte-for-byte (matrix row 7)
// ---------------------------------------------------------------------------

const ROUTER_DOGFOOD_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../.github/workflows/bkit-ci-router.yml",
);

describe("C5b — dogfood bkit-ci-router.yml matches template byte-for-byte (BAR-148, matrix row 7)", () => {
  it("dogfood file exists at .github/workflows/bkit-ci-router.yml", () => {
    expect(fs.existsSync(ROUTER_DOGFOOD_PATH)).toBe(true);
  });

  it("dogfood and template are byte-identical (no drift between dogfood and template)", () => {
    const templateContent = fs.readFileSync(ROUTER_TEMPLATE_PATH);
    const dogfoodContent = fs.readFileSync(ROUTER_DOGFOOD_PATH);
    expect(dogfoodContent.equals(templateContent)).toBe(true);
  });
});
