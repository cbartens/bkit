// checks/after/tools.test.ts — Unit tests for the Phase 3 local-tooling detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectValePackageNotSynced,
  detectWorkflowLintToolsMissing,
  detectBkitStubs,
  buildDepUpdaterSetupAdvisory,
} from "./tools";

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
// detectValePackageNotSynced
// ---------------------------------------------------------------------------

describe("detectValePackageNotSynced", () => {
  it("returns null when vale is not on PATH (spawn exits non-zero)", () => {
    spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
    expect(detectValePackageNotSynced(tmpDir)).toBeNull();
  });

  it("returns null when vale is on PATH and write-good styles exist", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "" } as ReturnType<typeof spawnSync>);
    fs.mkdirSync(path.join(tmpDir, ".vale", "styles", "write-good"), { recursive: true });
    expect(detectValePackageNotSynced(tmpDir)).toBeNull();
  });

  it("returns finding when vale is on PATH but write-good styles are absent", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "" } as ReturnType<typeof spawnSync>);
    fs.writeFileSync(path.join(tmpDir, ".vale.ini"), "Packages = write-good\n");
    // No .vale/styles/write-good directory
    const result = detectValePackageNotSynced(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("vale-package-not-synced");
    expect(result!.severity).toBe("advisory");
    expect(result!.action).toContain("vale sync");
    expect(result!.action).not.toContain(".bkit/templates/.vale.ini");
  });

  it("points at the .vale.ini template before vale sync when the repo has no .vale.ini", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "" } as ReturnType<typeof spawnSync>);
    const result = detectValePackageNotSynced(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("vale-package-not-synced");
    const action = result!.action;
    expect(action).toContain(".bkit/templates/.vale.ini");
    expect(action.indexOf(".bkit/templates/.vale.ini")).toBeLessThan(action.indexOf("vale sync"));
  });
});

// ---------------------------------------------------------------------------
// detectBkitStubs
// ---------------------------------------------------------------------------

describe("detectBkitStubs", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stubs-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty when neither bkit-ci.yml nor pre-commit exist", () => {
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("returns empty when bkit-ci.yml has no bkit-stub sentinels", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "name: CI\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm test\n",
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("returns one finding per sentinel present in bkit-ci.yml", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      [
        "name: CI",
        "      # bkit-stub:auto-force-e2e — header",
        "      # - name: Auto Force E2E",
        "      # bkit-stub:e2e — header",
        "      # - name: Run E2E",
      ].join("\n"),
    );
    const findings = detectBkitStubs(tmpDir);
    expect(findings).toHaveLength(2);
    expect(findings.map((f) => f.id).sort()).toEqual(["bkit-stub-auto-force-e2e", "bkit-stub-e2e"]);
    expect(findings[0]!.severity).toBe("advisory");
    expect(findings[0]!.action).toContain("delete the entire stub block");
  });

  it("does not fire when the sentinel line has been removed (block left uncommented in place)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      ["name: CI", "      - name: Auto Force E2E", "        run: echo enabled"].join("\n"),
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("does not match partial-prefix ids (e.g. e2e-paths step id does not trigger e2e advisory)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "      id: e2e-paths\n      run: echo ok\n",
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  // A prose line that cites a stub id is not a stub HEADER. Without the em-dash requirement
  // these fire an advisory that cannot be dismissed: the block is enabled, its header is gone,
  // and the only match left is a cross-reference nobody was told to delete.
  it("does not fire on prose back-references that merely cite a stub id", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      [
        "name: CI",
        // provenance note on an already-enabled lane (bkit's own bkit-ci.yml)
        "      # bkit-stub:coverage scaffold shipped to consumers. See testing.md.",
        // cross-reference between blocks (shipped in the consumer template)
        "# bkit-stub:coverage integration report posts from HERE, not bkit-tests-unit.",
        "      - name: Report Unit Coverage on PR",
        "        uses: davelosert/vitest-coverage-report-action@v2",
      ].join("\n"),
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("still fires on the header form regardless of indentation", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      [
        "name: CI",
        "# bkit-stub:coverage — Report vitest coverage on PRs.",
        "      # - name: X",
      ].join("\n"),
    );
    expect(detectBkitStubs(tmpDir).map((f) => f.id)).toEqual(["bkit-stub-coverage"]);
  });

  it("flags vercel-enabled-without-e2e pair conflict", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      [
        "      - name: Await Vercel Preview",
        "        run: echo enabled",
        "      # bkit-stub:e2e — header",
        "      # - name: Run E2E Tests",
      ].join("\n"),
    );
    const findings = detectBkitStubs(tmpDir);
    const ids = findings.map((f) => f.id);
    expect(ids).toContain("bkit-stub-pair-vercel-without-e2e");
    expect(ids).toContain("bkit-stub-e2e"); // e2e still commented also fires
  });

  it("flags e2e-enabled-without-vercel pair conflict", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      [
        "      - name: Run E2E Tests",
        "        run: pnpm test:e2e",
        "      # bkit-stub:vercel-await — header",
        "      # - name: Await Vercel Preview",
      ].join("\n"),
    );
    const ids = detectBkitStubs(tmpDir).map((f) => f.id);
    expect(ids).toContain("bkit-stub-pair-e2e-without-vercel");
  });
});

// ---------------------------------------------------------------------------
// buildDepUpdaterSetupAdvisory — read-only.
// ---------------------------------------------------------------------------

describe("buildDepUpdaterSetupAdvisory", () => {
  it("both configs → dep-updater-both", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "renovate.json5"),
      '{ ignorePaths: [".github/workflows/bkit-cloud.yml"] }\n',
    );
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    const result = buildDepUpdaterSetupAdvisory(tmpDir);
    expect(result?.id).toBe("dep-updater-both");
  });

  it("an updater config that does not mention bkit-cloud.yml is quiet (the workflow is the consumer's)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"), "name: cloud\n");
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), "{ enabled: false }\n");
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it("nudges (dep-updater-absent) when workflows exist but neither config is present", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    const result = buildDepUpdaterSetupAdvisory(tmpDir);
    expect(result?.id).toBe("dep-updater-absent");
    expect(result?.action).toMatch(/renovate\.json5/);
    expect(result?.action).toMatch(/dependabot\.yml/);
    expect(result?.action).not.toMatch(/bkit install --dependency/);
  });

  it("returns null when no workflows dir exists", () => {
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it("stays quiet when bkit.depUpdater is explicitly 'none'", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { depUpdater: "none" } }),
    );
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it("a bkit.depUpdater value other than none does not silence", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { depUpdater: "renovate", renovateRunner: "self" } }),
    );
    expect(buildDepUpdaterSetupAdvisory(tmpDir)?.id).toBe("dep-updater-absent");
  });

  it("config that names bkit-cloud.yml wins over a stale depUpdater=none", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "renovate.json5"),
      '{ ignorePaths: [".github/workflows/bkit-cloud.yml"] }\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { depUpdater: "none" } }),
    );
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectWorkflowLintToolsMissing
// ---------------------------------------------------------------------------

describe("detectWorkflowLintToolsMissing", () => {
  function writeWorkflow() {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"), "name: bkit-ci\n");
  }

  it("returns null when the repo has no workflows", () => {
    expect(detectWorkflowLintToolsMissing(tmpDir)).toBeNull();
  });
  it("returns null when both actionlint and shellcheck are on PATH", () => {
    writeWorkflow();
    spawnSync.mockReturnValue({ status: 0, stdout: "" } as ReturnType<typeof spawnSync>);
    expect(detectWorkflowLintToolsMissing(tmpDir)).toBeNull();
  });
  it("fires (advisory) when a tool is missing, naming it", () => {
    writeWorkflow();
    spawnSync.mockImplementation((cmd: string) => ({ status: cmd === "actionlint" ? 1 : 0 }));
    const f = detectWorkflowLintToolsMissing(tmpDir);
    expect(f?.id).toBe("workflow-lint-tools-missing");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("actionlint");
  });
});
