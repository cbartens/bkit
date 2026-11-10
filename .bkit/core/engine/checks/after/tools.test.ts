// checks/after/tools.test.ts — Unit tests for the Phase 3 local-tooling detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectValeMissing,
  detectValePackageNotSynced,
  detectWorkflowLintToolsMissing,
  detectBkitStubs,
  buildDepUpdaterSetupAdvisory,
  detectProjectDocs,
} from "./tools";
import { LEGACY_STARTER_SOURCE_REVISION, syncProjectDocs } from "../../install/project-docs";

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

// Pass-through wrapper over node:fs that records every readFileSync path. The module
// namespace cannot be spied on, so the recording lives in the mock factory instead.
const { fsReads } = vi.hoisted(() => ({ fsReads: [] as string[] }));

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  const readFileSync = ((...args: Parameters<typeof actual.readFileSync>) => {
    fsReads.push(String(args[0]));
    return actual.readFileSync(...args);
  }) as typeof actual.readFileSync;
  return { ...actual, readFileSync, default: { ...actual, readFileSync } };
});

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
// detectValeMissing
// ---------------------------------------------------------------------------

describe("detectValeMissing", () => {
  const writeScripts = (scripts: Record<string, string>) =>
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ scripts }));

  it("returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH", () => {
    writeScripts({ "bkit:lint:prose": "bkit ci prose --glob='docs/*.md'" });
    spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
    const result = detectValeMissing(tmpDir);
    expect(result!.id).toBe("vale-not-installed");
    expect(result!.detect).toContain("bkit:lint:prose");
    expect(result!.action).toContain("vale sync");
  });

  it("returns null when vale is on PATH", () => {
    writeScripts({ "bkit:lint:prose": "bkit ci prose" });
    spawnSync.mockReturnValue({ status: 0, stdout: "" } as ReturnType<typeof spawnSync>);
    expect(detectValeMissing(tmpDir)).toBeNull();
  });

  it("returns null when bkit:lint:prose does not run bkit ci prose, or package.json is absent", () => {
    spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
    expect(detectValeMissing(tmpDir)).toBeNull();
    writeScripts({ "bkit:lint:prose": "echo none" });
    expect(detectValeMissing(tmpDir)).toBeNull();
  });
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

  it("reads the workflow named by bkit.testing.ciWorkflow and names its path", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { testing: { ciWorkflow: "ci.yml" } } }),
    );
    const dir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(dir, { recursive: true });
    const content = [
      "      - name: Run E2E Tests",
      "        run: pnpm test:e2e",
      "      # bkit-stub:vercel-await — header",
      "      # - name: Await Vercel Preview",
    ].join("\n");
    fs.writeFileSync(path.join(dir, "bkit-ci.yml"), content);
    expect(detectBkitStubs(tmpDir)).toEqual([]);
    fs.writeFileSync(path.join(dir, "ci.yml"), content);
    const findings = detectBkitStubs(tmpDir);
    expect(findings.map((f) => f.id).sort()).toEqual([
      "bkit-stub-pair-e2e-without-vercel",
      "bkit-stub-vercel-await",
    ]);
    for (const f of findings) {
      expect(f.detect).toContain(".github/workflows/ci.yml");
      expect(`${f.detect}${f.action}`).not.toContain("bkit-ci.yml");
    }
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
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { dependencies: { updater: "renovate" } } }),
    );
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

  const setUpdater = (updater: unknown): void =>
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { dependencies: { updater } } }),
    );
  const renovateConfig = (): void => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), "{}\n");
  };

  it("stays quiet when bkit.dependencies.updater is 'none' and no config is present", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    setUpdater("none");
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it("stays quiet when bkit.dependencies.updater names the config that is present", () => {
    renovateConfig();
    setUpdater("renovate");
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it.each([[""], [undefined], ["Renovate"]])(
    "blocks (dep-updater-unset) when a Renovate config is present and the updater is %j",
    (updater) => {
      renovateConfig();
      setUpdater(updater);
      const result = buildDepUpdaterSetupAdvisory(tmpDir);
      expect(result).toMatchObject({ id: "dep-updater-unset", severity: "blocker" });
      expect(result?.detect).toContain(".github/renovate.json5");
      expect(result?.action).toContain('"renovate"');
    },
  );

  it.each([["dependabot"], ["none"]])(
    "blocks (dep-updater-mismatch) when a Renovate config is present and the updater is %s",
    (updater) => {
      renovateConfig();
      setUpdater(updater);
      const result = buildDepUpdaterSetupAdvisory(tmpDir);
      expect(result).toMatchObject({ id: "dep-updater-mismatch", severity: "blocker" });
      expect(result?.detect).toContain(`"${updater}"`);
      expect(result?.action).toContain('"renovate"');
    },
  );

  it("blocks (dep-updater-mismatch) when the updater names a config that is not present", () => {
    setUpdater("dependabot");
    const result = buildDepUpdaterSetupAdvisory(tmpDir);
    expect(result).toMatchObject({ id: "dep-updater-mismatch", severity: "blocker" });
    expect(result?.detect).toMatch(/no Dependabot config/);
    expect(result?.action).toContain(".bkit/templates/.github/dependabot.yml");
  });

  it("finds a Renovate config at the repo root, not only under .github/", () => {
    fs.writeFileSync(path.join(tmpDir, "renovate.json"), "{}\n");
    setUpdater("renovate");
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
    // Only actionlint is missing: it exits 1, every other tool exits 0.
    spawnSync.mockImplementation((cmd: string) => ({ status: Number(cmd === "actionlint") }));
    const f = detectWorkflowLintToolsMissing(tmpDir);
    expect(f?.id).toBe("workflow-lint-tools-missing");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("actionlint");
  });
});

// ---------------------------------------------------------------------------
// detectProjectDocs — adoption and population advisories for the project documents
// ---------------------------------------------------------------------------

const STARTER_DIR = path.resolve(__dirname, "../../../../templates/docs");

const INDEX_HEAD =
  "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n" +
  "| Doc | Design | Plan | Build | Debug | Ship | Scope |\n| --- | --- | --- | --- | --- | --- | --- |\n";

function writeIndex(rows: Array<{ doc: string; scope?: string }>): void {
  fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
  const body = rows
    .map((r) => `| \`${r.doc}\` | ○ | ○ | ○ | ○ | ○ | ${r.scope ?? "Project doc."} |\n`)
    .join("");
  fs.writeFileSync(path.join(tmpDir, ".agents", "docs.md"), INDEX_HEAD + body);
}

function writeDoc(rel: string, text: string): void {
  const abs = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, text);
}

const POPULATED =
  "# Security\n\nAuth uses session cookies issued by the api service; rate limits live in the edge proxy.\n" +
  "Secrets come from the host secret store and never reach the repo.\n";

function stripLegacyWrapper(text: string): string {
  return text
    .split("\n")
    .filter(
      (l) =>
        l !== "<!-- bkit:start -->" &&
        l !== "<!-- bkit:end -->" &&
        !l.startsWith("<!-- bkit:managed"),
    )
    .join("\n");
}

function allText(findings: Array<{ detect: string; action: string }>): string {
  return findings.map((f) => `${f.detect}\n${f.action}`).join("\n");
}

describe("detectProjectDocs", () => {
  it("distinguishes missing and empty project documentation from populated candidates", () => {
    writeDoc("docs/security.md", POPULATED);
    writeDoc("docs/testing.md", "   \n\n");
    writeDoc("docs/setup.md", "");
    writeIndex([{ doc: "docs/security.md" }, { doc: "docs/testing.md" }, { doc: "docs/setup.md" }]);

    const findings = detectProjectDocs(tmpDir);

    // Every finding is an advisory with a detect and an action, never a blocker.
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) {
      expect(f.severity).toBe("advisory");
      expect(f.id).toMatch(/^project-docs-/);
      expect(f.detect.length).toBeGreaterThan(0);
      expect(f.action.length).toBeGreaterThan(0);
    }

    const missing = findings.find((f) => f.id === "project-docs-missing");
    expect(missing).toBeDefined();
    expect(missing!.detect).toContain("docs/architecture.md");
    expect(missing!.detect).toContain("docs/deployments.md");
    expect(missing!.detect).not.toContain("docs/security.md");
    expect(missing!.detect).not.toContain("docs/testing.md");
    expect(missing!.action).toContain(".bkit/templates/docs/");
    expect(missing!.action).toContain(".agents/docs.md");

    const empty = findings.find((f) => f.id === "project-docs-empty");
    expect(empty).toBeDefined();
    expect(empty!.detect).toContain("docs/testing.md");
    expect(empty!.detect).toContain("docs/setup.md");
    expect(empty!.detect).not.toContain("docs/security.md");

    // The populated, indexed document is named by no finding.
    expect(allText(findings)).not.toContain("docs/security.md");
    // No claim that populated content is semantically complete.
    expect(allText(findings).toLowerCase()).not.toContain("complete");
    expect(findings.some((f) => f.id === "project-docs-index-missing")).toBe(false);
  });

  it("recognizes current and migrated untouched starters", async () => {
    const starter = fs.readFileSync(path.join(STARTER_DIR, "architecture.md"), "utf-8");
    // Current starter copied verbatim; a lightly edited placeholder-only copy of another starter.
    writeDoc("docs/architecture.md", starter);
    const techStarter = fs.readFileSync(path.join(STARTER_DIR, "technology.md"), "utf-8");
    writeDoc("docs/technology.md", `${techStarter}\n\n\n`);
    // A project that really wrote its document.
    writeDoc("docs/security.md", POPULATED);
    writeIndex([
      { doc: "docs/architecture.md" },
      { doc: "docs/technology.md" },
      { doc: "docs/security.md" },
    ]);

    const cp = await vi.importActual<typeof import("node:child_process")>("node:child_process");
    const legacy = cp.execFileSync(
      "git",
      ["show", `${LEGACY_STARTER_SOURCE_REVISION}:.bkit/shared/docs/noise.md`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], cwd: originalCwd },
    );
    // Migrated: the ownership wrapper lines are gone, the text is the shipped legacy text.
    const migrated = stripLegacyWrapper(legacy);
    writeDoc("docs/noise.md", migrated);
    writeIndex([
      { doc: "docs/architecture.md" },
      { doc: "docs/technology.md" },
      { doc: "docs/security.md" },
      { doc: "docs/noise.md" },
    ]);

    const findings = detectProjectDocs(tmpDir);
    const unpopulated = findings.find((f) => f.id === "project-docs-unpopulated");
    expect(unpopulated).toBeDefined();
    expect(unpopulated!.severity).toBe("advisory");
    expect(unpopulated!.detect).toContain("docs/architecture.md");
    expect(unpopulated!.detect).toContain("docs/technology.md");
    expect(unpopulated!.detect).toContain("docs/noise.md");
    expect(unpopulated!.detect).not.toContain("docs/security.md");
    // The action names the repair and the alternative evidence.
    expect(unpopulated!.action).toContain("docs/architecture.md");
    expect(unpopulated!.action.toLowerCase()).toContain("equivalent");
    // Indexed-but-untouched still warns even though the index lists it.
    expect(findings.some((f) => f.id === "project-docs-missing")).toBe(true);
    expect(allText(findings)).not.toContain("docs/security.md");
  });

  it("resolves an indexed equivalent without a missing default warning", () => {
    writeDoc("handbook/security.md", POPULATED);
    writeDoc("handbook/ops-testing.md", POPULATED);
    writeIndex([
      { doc: "handbook/security.md" },
      { doc: "handbook/ops-testing.md", scope: "Equivalent to docs/testing.md" },
    ]);

    const findings = detectProjectDocs(tmpDir);
    const missing = findings.find((f) => f.id === "project-docs-missing");
    expect(missing).toBeDefined();
    expect(missing!.detect).not.toContain("docs/security.md");
    expect(missing!.detect).not.toContain("docs/testing.md");
    expect(missing!.detect).toContain("docs/architecture.md");
    expect(allText(findings)).not.toContain("handbook/security.md");

    // An out-of-tree target is never read: its content reaches no finding, and the finding
    // names the unsafe path instead of calling the topic populated.
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
    try {
      fs.writeFileSync(path.join(outside, "design.md"), "OUTSIDE-SECRET-CONTENT\n".repeat(20));
      fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
      fs.symlinkSync(path.join(outside, "design.md"), path.join(tmpDir, "docs", "design.md"));
      writeIndex([
        { doc: "docs/design.md" },
        { doc: "../escape/noise.md", scope: "Equivalent to docs/noise.md" },
      ]);
      fsReads.length = 0;
      const again = detectProjectDocs(tmpDir);
      const reads = [...fsReads];
      expect(reads.some((r) => r.startsWith(outside))).toBe(false);
      expect(allText(again)).not.toContain("OUTSIDE-SECRET-CONTENT");
      const ambiguous = again.find((f) => f.id === "project-docs-ambiguous");
      expect(ambiguous).toBeDefined();
      expect(ambiguous!.detect).toContain("docs/design.md");
      expect(ambiguous!.severity).toBe("advisory");
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it("keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace", () => {
    writeDoc("handbook/security.md", POPULATED);
    writeDoc("handbook/ops-testing.md", POPULATED);
    writeIndex([
      { doc: "handbook/security.md" },
      { doc: "handbook/ops-testing.md", scope: "Equivalent to docs/testing.md" },
    ]);
    fsReads.length = 0;
    const findings = detectProjectDocs(tmpDir);
    const missing = findings.find((f) => f.id === "project-docs-missing");
    expect(missing).toBeDefined();
    expect(missing!.detect).not.toContain("docs/security.md");
    expect(missing!.detect).not.toContain("docs/testing.md");
    expect(missing!.detect).toContain("docs/architecture.md");

    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
    try {
      fs.writeFileSync(path.join(outside, "noise.md"), "OUTSIDE-SECRET-CONTENT\n".repeat(20));
      writeIndex([{ doc: "../escape/noise.md", scope: "Equivalent to docs/noise.md" }]);
      fsReads.length = 0;
      const again = detectProjectDocs(tmpDir);
      expect(fsReads.some((r) => r.startsWith(outside))).toBe(false);
      expect(allText(again)).not.toContain("OUTSIDE-SECRET-CONTENT");
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
  /** The v6.1.1 shipped text of a topic as it was rendered into a consumer repo. */
  async function renderedV611(topic: string, branch: string): Promise<string> {
    const cp = await vi.importActual<typeof import("node:child_process")>("node:child_process");
    const raw = cp.execFileSync("git", ["show", `v6.1.1:.bkit/shared/docs/${topic}.md`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      cwd: originalCwd,
    });
    return raw
      .replace(
        "{{BKIT_MANAGED_MARKER}}",
        "<!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->",
      )
      .replace(/\{\{DEFAULT_BRANCH\}\}/g, branch);
  }

  it("recognizes the v6.1.1 untouched security starter as unpopulated", async () => {
    writeDoc("docs/security.md", await renderedV611("security", "main"));
    writeIndex([{ doc: "docs/security.md" }]);
    const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id === "project-docs-unpopulated");
    expect(unpopulated).toBeDefined();
    expect(unpopulated!.detect).toContain("docs/security.md");
  });

  it("recognizes a legacy deployments starter rendered with default branch dev", async () => {
    writeDoc("docs/deployments.md", await renderedV611("deployments", "dev"));
    writeIndex([{ doc: "docs/deployments.md" }]);
    const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id === "project-docs-unpopulated");
    expect(unpopulated).toBeDefined();
    expect(unpopulated!.detect).toContain("docs/deployments.md");
  });

  it("returns an advisory instead of throwing when docs is a regular file", () => {
    fs.writeFileSync(path.join(tmpDir, "docs"), "not a directory\n");
    writeIndex([{ doc: "docs/security.md" }]);
    let findings: ReturnType<typeof detectProjectDocs> = [];
    expect(() => {
      findings = detectProjectDocs(tmpDir);
    }).not.toThrow();
    const ambiguous = findings.find((f) => f.id === "project-docs-ambiguous");
    expect(ambiguous).toBeDefined();
    expect(ambiguous!.severity).toBe("advisory");
    expect(ambiguous!.detect).toContain("docs/");
  });

  it("does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent", () => {
    writeDoc("docs/security.md", POPULATED);
    writeDoc("engineering/security.md", POPULATED);
    writeIndex([{ doc: "engineering/security.md", scope: "Equivalent to docs/security.md" }]);
    syncProjectDocs(tmpDir, { dryRun: false });
    const promised = detectProjectDocs(tmpDir)
      .filter((f) => f.id === "project-docs-unindexed")
      .filter((f) => f.detect.includes("docs/security.md"))
      .map((f) => f.action)
      .join("\n");
    // Sync either registered the doc (no advisory) or the advisory must not promise upgrade will.
    expect(promised).not.toContain("bkit upgrade");
  });

  it("reports an ambiguous legacy wrapper left in a project document", () => {
    writeDoc(
      "docs/security.md",
      "<!-- bkit:start -->\n# Security\n\nAuth uses session cookies issued by the api service.\n",
    );
    writeIndex([{ doc: "docs/security.md" }]);
    const findings = detectProjectDocs(tmpDir);
    const text = allText(findings);
    expect(text).toContain("docs/security.md");
    expect(text).toContain("bkit:start");
    const cleanup = findings.find((f) => f.detect.includes("bkit:start"));
    expect(cleanup).toBeDefined();
    expect(cleanup!.severity).toBe("advisory");
  });

  it("does not promise bkit upgrade for an unindexed doc whose wrapper is ambiguous", () => {
    writeDoc(
      "docs/security.md",
      "<!-- bkit:start -->\n# Security\n\nAuth uses session cookies issued by the api service.\n",
    );
    writeIndex([]);
    const findings = detectProjectDocs(tmpDir);
    expect(findings.some((f) => f.id === "project-docs-cleanup")).toBe(true);
    const actions = findings
      .filter((f) => f.id === "project-docs-unindexed")
      .map((f) => f.action)
      .join("\n");
    expect(actions).toContain("once the wrapper is gone");
    expect(actions).not.toContain("to register the default paths");
  });

  it("reports an index row through a regular file as ambiguous instead of throwing", () => {
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# readme\n");
    writeIndex([{ doc: "README.md/security.md" }]);
    let findings: ReturnType<typeof detectProjectDocs> = [];
    expect(() => {
      findings = detectProjectDocs(tmpDir);
    }).not.toThrow();
    const ambiguous = findings.find((f) => f.id === "project-docs-ambiguous");
    expect(ambiguous).toBeDefined();
    expect(ambiguous!.severity).toBe("advisory");
  });

  it("reports a NUL-byte index path as ambiguous instead of throwing", () => {
    writeIndex([{ doc: "docs/a\u0000/security.md" }]);
    let findings: ReturnType<typeof detectProjectDocs> = [];
    expect(() => {
      findings = detectProjectDocs(tmpDir);
    }).not.toThrow();
    const ambiguous = findings.find((f) => f.id === "project-docs-ambiguous");
    expect(ambiguous).toBeDefined();
    expect(ambiguous!.severity).toBe("advisory");
  });

  it("consults a later valid same-topic row when the first indexed row is stale", () => {
    writeDoc("eng/security.md", POPULATED);
    writeIndex([{ doc: "old/security.md" }, { doc: "eng/security.md" }]);
    const findings = detectProjectDocs(tmpDir);
    const missing = findings.find((f) => f.id === "project-docs-missing");
    expect(missing).toBeDefined();
    expect(missing!.detect).not.toContain("docs/security.md");
    expect(missing!.detect).toContain("docs/architecture.md");
  });

  it("consults a later valid equivalent row when the first is out of tree", () => {
    writeDoc("eng/security.md", POPULATED);
    writeIndex([
      { doc: "../shared/security.md", scope: "Equivalent to docs/security.md" },
      { doc: "eng/security.md", scope: "Equivalent to docs/security.md" },
    ]);
    const findings = detectProjectDocs(tmpDir);
    expect(findings.some((f) => f.id === "project-docs-ambiguous")).toBe(false);
    expect(allText(findings)).not.toContain("../shared/security.md");
    const missing = findings.find((f) => f.id === "project-docs-missing");
    expect(missing).toBeDefined();
    expect(missing!.detect).not.toContain("docs/security.md");
  });

  it("classifies a starter copy that differs only in whitespace as unpopulated", () => {
    const starter = fs.readFileSync(path.join(STARTER_DIR, "security.md"), "utf-8");
    const lines = starter.split("\n");
    const i = lines.findIndex((l) => /^[A-Za-z]\S* \S/.test(l));
    expect(i).toBeGreaterThanOrEqual(0);
    lines[i] = lines[i]!.replace(" ", "  ");
    writeDoc("docs/security.md", lines.join("\n"));
    writeIndex([{ doc: "docs/security.md" }]);
    const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id === "project-docs-unpopulated");
    expect(unpopulated).toBeDefined();
    expect(unpopulated!.detect).toContain("docs/security.md");
  });

  it("classifies an indented legacy starter copy as unpopulated", async () => {
    const cp = await vi.importActual<typeof import("node:child_process")>("node:child_process");
    const legacy = cp.execFileSync(
      "git",
      ["show", `${LEGACY_STARTER_SOURCE_REVISION}:.bkit/shared/docs/security.md`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], cwd: originalCwd },
    );
    const lines = stripLegacyWrapper(legacy).split("\n");
    const i = lines.findIndex((l) => /^[A-Za-z]/.test(l));
    expect(i).toBeGreaterThanOrEqual(0);
    lines[i] = `  ${lines[i]}`;
    writeDoc("docs/security.md", lines.join("\n"));
    writeIndex([{ doc: "docs/security.md" }]);
    const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id === "project-docs-unpopulated");
    expect(unpopulated).toBeDefined();
    expect(unpopulated!.detect).toContain("docs/security.md");
  });

  it("reads the Scope of a row without a trailing pipe", () => {
    writeDoc("eng/sec-notes.md", POPULATED);
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "docs.md"),
      INDEX_HEAD + "| `eng/sec-notes.md` | ○ | ○ | ○ | ○ | ○ | Equivalent to docs/security.md\n",
    );
    const findings = detectProjectDocs(tmpDir);
    const missing = findings.find((f) => f.id === "project-docs-missing");
    expect(missing).toBeDefined();
    expect(missing!.detect).not.toContain("docs/security.md");
    expect(missing!.detect).toContain("docs/architecture.md");
  });
});
