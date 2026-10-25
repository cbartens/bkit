// checks/after/ci-yml.test.ts — Unit tests for the Phase 3 CI workflow detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectTurboIntegrationInputs,
  detectTestIntegrationEnv,
  detectGhaFloatingTags,
  detectBkitCloudYmlAlwaysTrueGate,
  detectCiYmlMissingActionlint,
  detectCiYmlRunInjection,
  detectCiYmlCapstoneContractDrift,
  detectTaggedTestsWithoutCiHome,
  detectRunLevelsNotComposed,
} from "./ci-yml";
import type { SuppressionNote } from "./suppression";

// ---------------------------------------------------------------------------
// Module-level mock for node:child_process
// vi.hoisted() must be called at the module top-level (once) so Vitest can hoist
// the mock declaration before imports. Individual tests use mockReset +
// mockReturnValue / mockImplementation to configure per-case behaviour.
// ---------------------------------------------------------------------------
const { execSync, execFileSync, spawnSync } = vi.hoisted(() => ({
  execSync: vi.fn(),
  execFileSync: vi.fn(),
  spawnSync: vi.fn(),
}));

vi.mock("node:child_process", () => ({ execSync, execFileSync, spawnSync }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalCwd = process.cwd();
  originalEnv = { ...process.env };
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-postinstall-test-"));
  process.chdir(tmpDir);
  // Default: git resolution fails → currentBranch null → isOnProtectedBranch true
  // (fail-safe). Tests that exercise a specific branch set GITHUB_REF_NAME/BASE_REF.
  spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env = originalEnv;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
  execSync.mockReset();
  execFileSync.mockReset();
  spawnSync.mockReset();
});

// ---------------------------------------------------------------------------
// detectTurboIntegrationInputs
// ---------------------------------------------------------------------------

describe("detectTurboIntegrationInputs", () => {
  it("returns empty when turbo.json is absent", () => {
    expect(detectTurboIntegrationInputs(tmpDir)).toEqual([]);
  });

  it("returns empty when turbo.json has no test:integration task", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({ tasks: { build: { outputs: ["dist/**"] } } }),
    );
    expect(detectTurboIntegrationInputs(tmpDir)).toEqual([]);
  });

  it("flags missing external-state proxies on test:integration (turbo v2)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({ tasks: { "test:integration": { cache: true, inputs: ["src/**"] } } }),
    );
    const findings = detectTurboIntegrationInputs(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("turbo-test-integration-inputs-missing");
    expect(findings[0]!.action).toContain("supabase/migrations/**");
  });

  it("returns empty when inputs already declare a migrations proxy", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({
        tasks: {
          "test:integration": { inputs: ["src/**", "supabase/migrations/**"] },
        },
      }),
    );
    expect(detectTurboIntegrationInputs(tmpDir)).toEqual([]);
  });

  it("supports turbo v1 `pipeline` key", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({ pipeline: { "test:e2e": { inputs: ["src/**"] } } }),
    );
    const findings = detectTurboIntegrationInputs(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("turbo-test-e2e-inputs-missing");
  });
});

// ---------------------------------------------------------------------------
// detectTestIntegrationEnv
// ---------------------------------------------------------------------------

describe("detectTestIntegrationEnv", () => {
  it("returns null when package.json absent", () => {
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when test:integration script absent", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"scripts":{"test":"vitest"}}');
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("flags scripts with no real-service hints", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config=integration.config.ts"}}',
    );
    const result = detectTestIntegrationEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("test-integration-env-not-asserted");
  });

  it("returns null when script gates on TEST_REAL_APIS", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"TEST_REAL_APIS=true vitest run"}}',
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when script chains supabase start", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"supabase start && vitest run"}}',
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when the CI workflow lane provisions the real-service env", () => {
    // Script is env-agnostic; the bkit-ci.yml job that runs test:integration provisions the env.
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config vitest.integration.config.ts --passWithNoTests"}}',
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      [
        "jobs:",
        "  integration:",
        "    env:",
        '      TEST_REAL_APIS: "true"',
        "    steps:",
        "      - run: env -u SUPABASE_PROJECT_ID npx supabase start",
        "      - run: turbo run test:integration",
      ].join("\n"),
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when the vitest integration config documents the in-file guard", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config vitest.integration.config.ts"}}',
    );
    fs.writeFileSync(
      path.join(tmpDir, "vitest.integration.config.ts"),
      "// Integration tests run only when TEST_REAL_APIS=true. Guard is in each test file.\n",
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("still fires when a workflow runs test:integration but provisions no real-service env", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config vitest.integration.config.ts"}}',
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "jobs:\n  integration:\n    steps:\n      - run: turbo run test:integration\n",
    );
    expect(detectTestIntegrationEnv(tmpDir)!.id).toBe("test-integration-env-not-asserted");
  });

  it("returns null and reports a root note when the root package opts out", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        scripts: { "test:integration": "vitest run --config vitest.integration.config.ts" },
        bkit: { advisories: { ignore: ["test-integration-env-not-asserted"] } },
      }),
    );
    const notes: SuppressionNote[] = [];
    expect(detectTestIntegrationEnv(tmpDir, (n) => notes.push(n))).toBeNull();
    expect(notes).toEqual([{ id: "test-integration-env-not-asserted", scope: "." }]);
  });

  it("still fires when the opt-out names a different advisory id", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        scripts: { "test:integration": "vitest run --config vitest.integration.config.ts" },
        bkit: { advisories: { ignore: ["tagged-tests-no-ci-home"] } },
      }),
    );
    const notes: SuppressionNote[] = [];
    const found = detectTestIntegrationEnv(tmpDir, (n) => notes.push(n));
    expect(found?.id).toBe("test-integration-env-not-asserted");
    expect(notes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// detectGhaFloatingTags
// ---------------------------------------------------------------------------

describe("detectGhaFloatingTags", () => {
  it("returns null when .github/workflows is absent", () => {
    expect(detectGhaFloatingTags(tmpDir)).toBeNull();
  });

  it("returns null when no workflow uses floating tags", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "jobs:\n  run:\n    steps:\n      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1\n",
    );
    expect(detectGhaFloatingTags(tmpDir)).toBeNull();
  });

  it("flags floating-tag uses across multiple workflow files", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4.0.2\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "release.yml"),
      "      - uses: pnpm/action-setup@v4\n",
    );
    const result = detectGhaFloatingTags(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("gha-actions-floating-tags");
    expect(result!.detect).toContain("bkit-ci.yml");
    expect(result!.detect).toContain("release.yml");
  });
});

// ---------------------------------------------------------------------------
// detectRunLevelsNotComposed
// ---------------------------------------------------------------------------

describe("detectRunLevelsNotComposed", () => {
  it("returns null when bkit-ci.yml is absent", () => {
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });

  it("returns null when bkit-ci.yml has no Detect Direct Push step (no primitives to compose)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "jobs:\n  bkit-tests:\n    runs-on: ubuntu-latest\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });

  it("flags when Detect Direct Push step exists but no sibling workflow references the outputs", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "      - name: Detect Direct Push\n        run: echo detect\n",
    );
    const result = detectRunLevelsNotComposed(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("run-levels-not-composed");
  });

  it("returns null when a sibling workflow references should_force_build", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "      - name: Detect Direct Push\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "deploy.yml"),
      "    if: steps.detect.outputs.should_force_build == 'true'\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });

  it("flags when bkit-ci.yml only SETS the outputs (echo to $GITHUB_OUTPUT), no gate reads them", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "      - name: Detect Direct Push\n" +
        '        run: echo "should_force_build=true" >> "$GITHUB_OUTPUT"\n',
    );
    const result = detectRunLevelsNotComposed(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("run-levels-not-composed");
  });

  it("flags when the example E2E gate is present but commented out (shipped bkit-stub:e2e)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "      - name: Detect Direct Push\n" +
        "      #   if: steps.detect.outputs.should_run_full == 'true'\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).not.toBeNull();
  });

  it("returns null when a consumer enables an in-bkit-ci.yml gate reading the outputs", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "      - name: Detect Direct Push\n" +
        "      - name: Run E2E Tests\n" +
        "        if: steps.detect.outputs.should_run_full == 'true'\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectBkitCloudYmlAlwaysTrueGate
// ---------------------------------------------------------------------------

describe("detectBkitCloudYmlAlwaysTrueGate", () => {
  function writeCloud(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"), content);
  }
  const BROKEN =
    "jobs:\n" +
    "  run:\n" +
    "    if: |\n" +
    "      ${{\n" +
    "        github.event_name == 'workflow_dispatch'\n" +
    "      }}\n" +
    "    runs-on: ubuntu-latest\n";
  const FIXED =
    "jobs:\n" +
    "  run:\n" +
    "    if: >-\n" +
    "      github.event_name == 'workflow_dispatch'\n" +
    "    runs-on: ubuntu-latest\n";

  it("returns null when bkit-cloud.yml is absent", () => {
    expect(detectBkitCloudYmlAlwaysTrueGate(tmpDir)).toBeNull();
  });
  it("fires on the always-true block-scalar `if:` gate", () => {
    writeCloud(BROKEN);
    const f = detectBkitCloudYmlAlwaysTrueGate(tmpDir);
    expect(f?.id).toBe("bkit-auto-yml-always-true-gate");
    expect(f?.severity).toBe("advisory");
  });
  it("returns null on the fixed folded expression (no ${{ }} wrapper)", () => {
    writeCloud(FIXED);
    expect(detectBkitCloudYmlAlwaysTrueGate(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCiYmlMissingActionlint
// ---------------------------------------------------------------------------

describe("detectCiYmlMissingActionlint", () => {
  function writeCi(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"), content);
  }
  const MANAGED_NO_ACTIONLINT =
    "name: CI\n" +
    "jobs:\n" +
    "  bkit-tests:\n" +
    "    runs-on: ubuntu-latest\n" +
    "    steps:\n" +
    "      - run: pnpm test\n";

  it("returns null when bkit-ci.yml is absent", () => {
    expect(detectCiYmlMissingActionlint(tmpDir)).toBeNull();
  });
  it("returns null when bkit-ci.yml was not adopted from bkit's template (no bkit-tests job)", () => {
    writeCi("name: CI\njobs:\n  test:\n    runs-on: ubuntu-latest\n");
    expect(detectCiYmlMissingActionlint(tmpDir)).toBeNull();
  });
  it("fires on an adopted bkit-ci.yml with no actionlint step", () => {
    writeCi(MANAGED_NO_ACTIONLINT);
    const f = detectCiYmlMissingActionlint(tmpDir);
    expect(f?.id).toBe("ci-yml-missing-actionlint");
    expect(f?.severity).toBe("advisory");
  });
  it("returns null when an actionlint step is already present", () => {
    writeCi(MANAGED_NO_ACTIONLINT + '      - run: "$RUNNER_TEMP/actionlint" -color\n');
    expect(detectCiYmlMissingActionlint(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCiYmlRunInjection — GHA script-injection sink (untrusted input in run:)
// ---------------------------------------------------------------------------

describe("detectCiYmlRunInjection", () => {
  function writeCi(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"), content);
  }
  const ADOPTED =
    "name: CI\n" + "jobs:\n" + "  bkit-tests:\n" + "    runs-on: ubuntu-latest\n" + "    steps:\n";

  it("returns null when bkit-ci.yml is absent", () => {
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("returns null when bkit-ci.yml was not adopted from bkit's template (no bkit-tests job)", () => {
    writeCi(
      "name: CI\njobs:\n  test:\n    steps:\n" +
        '      - run: |\n        MSG="${{ github.event.pull_request.title }}"\n',
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("fires on an untrusted expression inlined into a run: block body", () => {
    writeCi(
      ADOPTED +
        "      - name: Detect Direct Push\n" +
        "        run: |\n" +
        '          MSG="${{ github.event.pull_request.title }}"\n' +
        '          echo "$MSG"\n',
    );
    const f = detectCiYmlRunInjection(tmpDir);
    expect(f?.id).toBe("ci-yml-run-injection");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("SECURITY");
    expect(f?.detect).toContain("github.event.pull_request.title");
  });

  it("fires on an inline run: with the sink on the same line", () => {
    writeCi(ADOPTED + '      - run: echo "${{ github.event.issue.title }}"\n');
    expect(detectCiYmlRunInjection(tmpDir)?.id).toBe("ci-yml-run-injection");
  });

  it("fires on github.head_ref inlined into a run: body", () => {
    writeCi(ADOPTED + "      - run: |\n" + '          git checkout "${{ github.head_ref }}"\n');
    expect(detectCiYmlRunInjection(tmpDir)?.id).toBe("ci-yml-run-injection");
  });

  it("returns null for the safe env-indirection form", () => {
    writeCi(
      ADOPTED +
        "      - name: Detect Direct Push\n" +
        "        env:\n" +
        "          PR_TITLE: ${{ github.event.pull_request.title }}\n" +
        "        run: |\n" +
        '          MSG="$PR_TITLE"\n',
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("returns null when github.event.* appears only in env: / if: (not a run: body)", () => {
    writeCi(
      ADOPTED +
        "      - name: Guard\n" +
        "        if: github.event.pull_request.title != ''\n" +
        "        env:\n" +
        "          DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}\n" +
        "        run: echo hi\n",
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("does not scan a YAML-commented stub (github.base_ref reference stays silent)", () => {
    writeCi(
      ADOPTED +
        "      # - name: Migrations Guard\n" +
        "      #   run: |\n" +
        '      #     git fetch origin "${{ github.base_ref }}"\n',
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("does NOT trip on the shipped bkit-ci.yml template (already env-indirected)", () => {
    const tplPath = path.resolve(
      import.meta.dirname,
      "..",
      "..",
      "..",
      "..",
      "templates",
      ".github",
      "workflows",
      "bkit-ci.yml",
    );
    writeCi(fs.readFileSync(tplPath, "utf-8"));
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCiYmlCapstoneContractDrift
// ---------------------------------------------------------------------------

describe("detectCiYmlCapstoneContractDrift", () => {
  function writeCi(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"), content);
  }
  // An adopted bkit-ci.yml whose capstone carries all three load-bearing invariants.
  const GOOD =
    "name: CI\n" +
    "concurrency:\n" +
    "  group: ci-${{ github.workflow }}-${{ github.ref }}\n" +
    "  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}\n" +
    "jobs:\n" +
    "  bkit-tests-unit:\n" +
    "    outputs:\n" +
    "      unit_ran: ${{ steps.count.outputs.unit_ran }}\n" +
    "  bkit-tests-check:\n" +
    "    if: ${{ !cancelled() }}\n" +
    "    steps:\n" +
    "      - env:\n" +
    "          UNIT_RAN: ${{ needs.bkit-tests-unit.outputs.unit_ran }}\n" +
    '        run: test "$UNIT_RAN" -gt 0\n';
  const LIVE_LANE =
    "  bkit-tests-live-web:\n" +
    "    outputs:\n" +
    "      live_ran: ${{ steps.live_count.outputs.live_ran }}\n";
  const TEMPLATE = fs.readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "..",
      "..",
      "..",
      "templates",
      ".github",
      "workflows",
      "bkit-ci.yml",
    ),
    "utf-8",
  );

  it("returns null when bkit-ci.yml is absent", () => {
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("returns null when there is no bkit-tests-check capstone", () => {
    writeCi("name: CI\njobs:\n  bkit-tests:\n    steps: []\n");
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("returns null when all invariants are present", () => {
    writeCi(GOOD);
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("fires when the capstone uses always() instead of !cancelled()", () => {
    writeCi(GOOD.replace("${{ !cancelled() }}", "${{ always() }}"));
    const f = detectCiYmlCapstoneContractDrift(tmpDir);
    expect(f?.id).toBe("ci-yml-capstone-contract-drift");
    expect(f?.severity).toBe("advisory");
    expect(f?.action).toContain("!cancelled()");
  });
  it("fires when concurrency cancels pull requests only", () => {
    writeCi(
      GOOD.replace(
        "cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}",
        "cancel-in-progress: ${{ github.event_name == 'pull_request' }}",
      ),
    );
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("one run per branch");
  });

  it("fires when concurrency cancels the default branch too (unconditional true)", () => {
    writeCi(
      GOOD.replace(
        "cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}",
        "cancel-in-progress: true",
      ),
    );
    const action = detectCiYmlCapstoneContractDrift(tmpDir)?.action;
    expect(action).toContain("one run per branch");
    expect(action).toContain("QUEUING");
  });

  it("fires when the concurrency group is keyed on github.run_id", () => {
    writeCi(GOOD.replace("github.ref", "github.run_id"));
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("github.run_id");
  });
  it("fires when the capstone has no executed-count assertion", () => {
    writeCi(
      GOOD.replace("          UNIT_RAN: ${{ needs.bkit-tests-unit.outputs.unit_ran }}\n", ""),
    );
    const action = detectCiYmlCapstoneContractDrift(tmpDir)?.action;
    expect(action).toContain("executed-count");
    expect(action).toContain("`bkit-tests-unit`");
  });
  it("fires naming only the lane whose count the capstone never reads", () => {
    writeCi(GOOD.replace("  bkit-tests-check:\n", LIVE_LANE + "  bkit-tests-check:\n"));
    const action = detectCiYmlCapstoneContractDrift(tmpDir)?.action;
    expect(action).toContain("`bkit-tests-live-web`");
    expect(action).not.toContain("`bkit-tests-unit`");
  });
  it("does not count a lane output named only in a comment", () => {
    writeCi(
      GOOD.replace("  bkit-tests-check:\n", LIVE_LANE + "  bkit-tests-check:\n") +
        "      # LIVE_RAN: ${{ needs.bkit-tests-live-web.outputs.live_ran }}\n",
    );
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("`bkit-tests-live-web`");
  });
  it("does not count a commented-out !cancelled() guard", () => {
    writeCi(
      GOOD.replace("${{ !cancelled() }}", "${{ always() }}") + "#   if: ${{ !cancelled() }}\n",
    );
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("!cancelled()");
  });
  it("returns null on the shipped template, whose capstone is a commented-out stub", () => {
    writeCi(TEMPLATE);
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("fires on the shipped template once an extra lane is enabled without reading its count", () => {
    writeCi(TEMPLATE + LIVE_LANE);
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("`bkit-tests-live-web`");
  });
});

// ---------------------------------------------------------------------------
// Configured CI workflow / capstone — package.json bkit.testing.ciWorkflow / ciCapstone
// ---------------------------------------------------------------------------

describe("CI workflow detectors read the configured bkit.testing.ciWorkflow / ciCapstone", () => {
  function configure(testing: Record<string, string>) {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { testing } }),
    );
  }
  function writeWorkflow(file: string, content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", file), content);
  }
  const ADOPTED =
    "name: CI\n" + "jobs:\n" + "  bkit-tests:\n" + "    runs-on: ubuntu-latest\n" + "    steps:\n";

  it("actionlint: fires on the configured workflow and names its path", () => {
    configure({ ciWorkflow: "ci.yml" });
    writeWorkflow("ci.yml", ADOPTED + "      - run: pnpm test\n");
    const f = detectCiYmlMissingActionlint(tmpDir);
    expect(f?.id).toBe("ci-yml-missing-actionlint");
    expect(f?.detect).toContain(".github/workflows/ci.yml");
    expect(f?.action).toContain(".github/workflows/ci.yml");
    expect(`${f?.detect}${f?.action}`).not.toContain("bkit-ci.yml");
  });

  it("actionlint: ignores a bkit-ci.yml that is not the configured workflow", () => {
    configure({ ciWorkflow: "ci.yml" });
    writeWorkflow("bkit-ci.yml", ADOPTED + "      - run: pnpm test\n");
    expect(detectCiYmlMissingActionlint(tmpDir)).toBeNull();
  });

  it("run injection: fires on the configured workflow and names its path", () => {
    configure({ ciWorkflow: "ci.yml" });
    writeWorkflow("ci.yml", ADOPTED + '      - run: echo "${{ github.head_ref }}"\n');
    const f = detectCiYmlRunInjection(tmpDir);
    expect(f?.id).toBe("ci-yml-run-injection");
    expect(f?.detect).toContain(".github/workflows/ci.yml");
    expect(f?.detect).not.toContain("bkit-ci.yml");
  });

  it("capstone drift: fires on the configured workflow and capstone job, naming both", () => {
    configure({ ciWorkflow: "ci.yml", ciCapstone: "app.gate" });
    writeWorkflow(
      "ci.yml",
      "name: CI\njobs:\n  app.gate:\n    if: ${{ always() }}\n    steps: []\n",
    );
    const f = detectCiYmlCapstoneContractDrift(tmpDir);
    expect(f?.id).toBe("ci-yml-capstone-contract-drift");
    expect(f?.detect).toContain(".github/workflows/ci.yml");
    expect(f?.detect).toContain("app.gate");
    expect(f?.detect).not.toContain("bkit-ci.yml");
    expect(f?.detect).not.toContain("bkit-tests-check");
  });

  it("capstone drift: matches the configured capstone name literally (regex-escaped)", () => {
    configure({ ciCapstone: "app.gate" });
    writeWorkflow("bkit-ci.yml", "name: CI\njobs:\n  appXgate:\n    if: ${{ always() }}\n");
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });

  it("capstone drift: a default-named job is not the configured capstone", () => {
    configure({ ciCapstone: "app-gate" });
    writeWorkflow("bkit-ci.yml", "name: CI\njobs:\n  bkit-tests-check:\n    if: ${{ always() }}\n");
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });

  it("run levels: fires on the configured workflow, names its path, and still reads siblings", () => {
    configure({ ciWorkflow: "ci.yml" });
    writeWorkflow("ci.yml", "      - name: Detect Direct Push\n        run: echo detect\n");
    const f = detectRunLevelsNotComposed(tmpDir);
    expect(f?.id).toBe("run-levels-not-composed");
    expect(`${f?.detect}${f?.action}`).toContain(".github/workflows/ci.yml");
    expect(`${f?.detect}${f?.action}`).not.toContain("bkit-ci.yml");
    writeWorkflow("bkit-ci.yml", "    if: steps.detect.outputs.should_run_full == 'true'\n");
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectTaggedTestsWithoutCiHome
// ---------------------------------------------------------------------------

describe("detectTaggedTestsWithoutCiHome", () => {
  function writePkg(relDir: string, scripts: Record<string, string>) {
    const dir = path.join(tmpDir, relDir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: relDir || "root", scripts }),
    );
  }
  function writeTest(relPath: string, content: string) {
    const full = path.join(tmpDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  function writePkgBkit(
    relDir: string,
    scripts: Record<string, string>,
    ignoreAdvisories: string[],
  ) {
    const dir = path.join(tmpDir, relDir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        name: relDir || "root",
        scripts,
        bkit: { advisories: { ignore: ignoreAdvisories } },
      }),
    );
  }

  it("returns null when there are no test files", () => {
    writePkg("", { "test:live": "vitest" });
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("returns null when @live appears but NO package declares test:live (convention inactive)", () => {
    writePkg("", { test: "vitest" });
    writeTest("packages/a/x.test.ts", 'it("@live works", () => {});');
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("fires when a package has an @live test but no test:live while another package declares it", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("packages/utils", { test: "vitest" }); // no test:live
    writeTest("packages/utils/u.test.ts", 'describe("@live", () => { it("x", () => {}); });');
    const f = detectTaggedTestsWithoutCiHome(tmpDir);
    expect(f?.id).toBe("tagged-tests-no-ci-home");
    expect(f?.severity).toBe("advisory");
    expect(f?.action).toContain("packages/utils");
  });
  it("returns null when the @live test's package declares test:live", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" });
    writeTest("packages/api/a.test.ts", 'it("@live", () => {});');
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("does not scan .worktrees roots (local git worktrees, not part of the repo)", () => {
    writePkg("", { "test:live": "vitest --project live" }); // root declares it → convention active, no homeless tags
    // A sibling git worktree checkout of the same repo, with a homeless @live test.
    writePkg(".worktrees/feat", { test: "vitest" });
    writeTest(".worktrees/feat/u.test.ts", 'it("@live works", () => {});');
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("ignores @live in comments / non-title string literals (only test titles count)", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("packages/utils", { test: "vitest" }); // no test:live
    writeTest(
      "packages/utils/u.test.ts",
      [
        "// Run the @live tier with -t @live; see docs.", // line comment
        'const TAG = "@live"; // unrelated string literal', // string literal, not a title
        'it("plain unit test", () => {});', // a real title, but untagged
      ].join("\n"),
    );
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("fires when @live is in a test title even amid comment mentions", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("packages/utils", { test: "vitest" }); // no test:live
    writeTest(
      "packages/utils/u.test.ts",
      '// @live convention note\nit("does the thing @live", () => {});',
    );
    const f = detectTaggedTestsWithoutCiHome(tmpDir);
    expect(f?.id).toBe("tagged-tests-no-ci-home");
    expect(f?.action).toContain("packages/utils");
  });
  it("returns null when @live only appears inside a fixture string literal (tag-linter package)", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("tooling/eslint", { test: "vitest run" }); // tag-linter, no test:live
    // A tag-linter embeds sample test source as a template-literal fixture to lint it —
    // the inner `describe(...)`/`it(...)` is a string, not a runnable @live test.
    writeTest(
      "tooling/eslint/rule.test.ts",
      [
        'const FIXTURE = `describe.skipIf(!LIVE_API)("@live Families", () => { it("x", () => {}); })`;',
        'it("flags a mislabelled live-tier fixture", () => { expect(lint(FIXTURE)).toHaveLength(1); });',
      ].join("\n"),
    );
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });

  it("drops the opted-out package while a sibling package still fires", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("apps/web", { test: "vitest" }); // a real homeless tagged test
    writeTest("apps/web/real.test.ts", 'it("does the thing @live", () => {});');
    // The false alarm: a test title that only MENTIONS the tag.
    writePkgBkit("tooling/eslint", { test: "vitest run" }, ["tagged-tests-no-ci-home"]);
    writeTest(
      "tooling/eslint/rule.test.ts",
      'it("R1: @live title in a non-.live. file is a filename/title mismatch", () => {});',
    );

    const notes: SuppressionNote[] = [];
    const found = detectTaggedTestsWithoutCiHome(tmpDir, (n) => notes.push(n));
    expect(found?.id).toBe("tagged-tests-no-ci-home");
    expect(found?.severity).toBe("advisory");
    expect(found?.action).toContain("apps/web");
    expect(found?.action).not.toContain("tooling/eslint");
    expect(notes).toEqual([{ id: "tagged-tests-no-ci-home", scope: "tooling/eslint" }]);
  });

  it("returns null and reports one note per package when every homeless package opts out", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkgBkit("tooling/eslint", { test: "vitest run" }, ["tagged-tests-no-ci-home"]);
    writeTest("tooling/eslint/a.test.ts", 'it("mentions @live here", () => {});');
    writeTest("tooling/eslint/b.test.ts", 'it("and @live again", () => {});'); // same package

    const notes: SuppressionNote[] = [];
    expect(detectTaggedTestsWithoutCiHome(tmpDir, (n) => notes.push(n))).toBeNull();
    expect(notes).toEqual([{ id: "tagged-tests-no-ci-home", scope: "tooling/eslint" }]);
  });

  it("still fires when the opt-out names a different advisory id", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkgBkit("tooling/eslint", { test: "vitest run" }, ["test-integration-env-not-asserted"]);
    writeTest("tooling/eslint/rule.test.ts", 'it("uses @live", () => {});');

    const notes: SuppressionNote[] = [];
    const found = detectTaggedTestsWithoutCiHome(tmpDir, (n) => notes.push(n));
    expect(found?.action).toContain("tooling/eslint");
    expect(notes).toEqual([]);
  });

  it("says how to dismiss the advisory in its action text", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("tooling/eslint", { test: "vitest run" });
    writeTest("tooling/eslint/rule.test.ts", 'it("uses @live", () => {});');
    expect(detectTaggedTestsWithoutCiHome(tmpDir)?.action).toContain(`"advisories": { "ignore"`);
  });
});
