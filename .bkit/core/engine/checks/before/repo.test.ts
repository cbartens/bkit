// checks/before/repo.test.ts — Unit tests for the Phase 1 repo-precondition detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectNoPackageJson,
  detectMalformedPackageJson,
  detectNotGitRepo,
  detectBkitNotOnPath,
  detectInvalidTaskCaps,
  detectTaskCapFormStale,
  detectUnmarkedPlans,
  taskCapDefaultsNamed,
} from "./repo";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeModules(...flags: string[]): Set<import("../../cli").ModuleFlag> {
  return new Set(flags) as Set<import("../../cli").ModuleFlag>;
}

// ---------------------------------------------------------------------------
// detectNoPackageJson
// ---------------------------------------------------------------------------

describe("detectNoPackageJson", () => {
  it("returns finding when package.json is absent", () => {
    const result = detectNoPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("no-package-json");
    expect(result!.severity).toBe("blocker");
    expect(result!.detect).toBeTruthy();
    expect(result!.action).toBeTruthy();
  });

  it("returns null when package.json exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectNoPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectMalformedPackageJson
// ---------------------------------------------------------------------------

describe("detectMalformedPackageJson", () => {
  it("returns finding when package.json contains invalid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not valid json }", "utf-8");
    const result = detectMalformedPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("malformed-package-json");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when package.json is valid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });

  it("returns null when package.json is absent (no-package-json fires instead)", () => {
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectNotGitRepo
// ---------------------------------------------------------------------------

describe("detectNotGitRepo", () => {
  it("returns finding when --core requested AND .git/ absent", () => {
    const result = detectNotGitRepo(tmpDir, makeModules("core"));
    expect(result).not.toBeNull();
    expect(result!.id).toBe("not-git-repo");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when --core requested AND .git/ exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".git"));
    expect(detectNotGitRepo(tmpDir, makeModules("core"))).toBeNull();
  });

  it("returns null when --core NOT requested (even if .git/ absent)", () => {
    // No core flag — not-git-repo should NOT fire
    expect(detectNotGitRepo(tmpDir, makeModules("claude"))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// process.env snapshot and restore around each test
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// detectBkitNotOnPath
// ---------------------------------------------------------------------------

describe("detectBkitNotOnPath", () => {
  const origEnv = { ...process.env };

  afterEach(() => {
    // Restore env after each test in this suite
    Object.keys(process.env).forEach((k) => delete process.env[k]);
    Object.assign(process.env, origEnv);
  });

  it("returns null in CI environment", () => {
    process.env.CI = "true";
    expect(detectBkitNotOnPath()).toBeNull();
  });

  it("returns null when `bkit` is on PATH (found by which)", () => {
    // Point PATH at a dir containing a fake `bkit` executable
    const fakeDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-path-test-"));
    const fakeBkit = path.join(fakeDir, "bkit");
    fs.writeFileSync(fakeBkit, "#!/bin/sh\n", "utf-8");
    fs.chmodSync(fakeBkit, 0o755);
    process.env.PATH = `${fakeDir}:${process.env.PATH}`;
    delete process.env.CI;
    delete process.env.CLAUDE_CODE_REMOTE;
    delete process.env.CURSOR_REMOTE_AGENT;
    try {
      expect(detectBkitNotOnPath()).toBeNull();
    } finally {
      fs.rmSync(fakeDir, { recursive: true, force: true });
    }
  });

  it("returns advisory when `bkit` is not on PATH", () => {
    process.env.PATH = "/nonexistent-path-for-test";
    delete process.env.CI;
    delete process.env.CLAUDE_CODE_REMOTE;
    delete process.env.CURSOR_REMOTE_AGENT;
    const finding = detectBkitNotOnPath();
    expect(finding).not.toBeNull();
    expect(finding?.id).toBe("bkit-not-on-path");
    expect(finding?.severity).toBe("advisory");
    expect(finding?.action).toContain("alias bkit='pnpm bkit'");
  });
});

// ---------------------------------------------------------------------------
// detectInvalidTaskCaps
// ---------------------------------------------------------------------------

describe("detectInvalidTaskCaps", () => {
  const pkg = (bkit: unknown) =>
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ bkit }), "utf-8");

  it("returns null with no package.json, no tasks block, or valid caps", () => {
    expect(detectInvalidTaskCaps(tmpDir)).toBeNull();
    pkg({});
    expect(detectInvalidTaskCaps(tmpDir)).toBeNull();
    pkg({
      workflows: {
        tasks: {
          maxPerGroup: 4,
          maxTestsPerGroup: 20,
          maxTestsPerTask: 12,
          maxTestFilesPerTask: 4,
        },
      },
    });
    expect(detectInvalidTaskCaps(tmpDir)).toBeNull();
  });

  it("returns an advisory naming each invalid key and the default it falls back to", () => {
    pkg({ workflows: { tasks: { maxPerGroup: 0, maxTestsPerTask: 2.5 } } });
    const finding = detectInvalidTaskCaps(tmpDir);
    expect(finding).toMatchObject({ id: "bkit-tasks-invalid", severity: "advisory" });
    expect(finding!.detect).toContain("`bkit.workflows.tasks.maxPerGroup`");
    expect(finding!.detect).toContain("`bkit.workflows.tasks.maxTestsPerTask`");
    expect(finding!.detect).not.toContain("maxTestsPerGroup");
    expect(finding!.action).toContain("`bkit.workflows.tasks.maxPerGroup` (default 3)");
    expect(finding!.action).toContain("`bkit.workflows.tasks.maxTestsPerTask` (default 10)");
  });
});

// ---------------------------------------------------------------------------
// detectTaskCapFormStale
// ---------------------------------------------------------------------------

describe("detectTaskCapFormStale", () => {
  const FORM = ".github/ISSUE_TEMPLATE/bkit-change.yml";
  const form = (perGroup: number, perTask: number) => {
    fs.mkdirSync(path.join(tmpDir, ".github/ISSUE_TEMPLATE"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, FORM),
      `description: groups of up to \`bkit.workflows.tasks.maxPerGroup\` tasks (default ${perGroup}) and \`bkit.workflows.tasks.maxTestsPerGroup\` **TEST FIRST** tests (default 15), 1 to \`bkit.workflows.tasks.maxTestsPerTask\` per task (default ${perTask}) across up to \`bkit.workflows.tasks.maxTestFilesPerTask\` test files (default 3).\n`,
      "utf-8",
    );
  };
  const pkg = (tasks: Record<string, number>) =>
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ bkit: { workflows: { tasks } } }),
      "utf-8",
    );

  it("returns null when the change form is absent", () => {
    pkg({ maxPerGroup: 5 });
    expect(detectTaskCapFormStale(tmpDir)).toBeNull();
  });

  it("returns null when every number the form shows matches package.json", () => {
    pkg({ maxPerGroup: 5, maxTestsPerTask: 8 });
    form(5, 8);
    expect(detectTaskCapFormStale(tmpDir)).toBeNull();
  });

  it("compares against the defaults when package.json sets no caps", () => {
    form(3, 10);
    expect(detectTaskCapFormStale(tmpDir)).toBeNull();
    form(4, 10);
    expect(detectTaskCapFormStale(tmpDir)?.detect).toContain(
      "`bkit.workflows.tasks.maxPerGroup` (default 4) is 3",
    );
  });

  it("names each mismatched key, the file, and the number to write", () => {
    pkg({ maxPerGroup: 5, maxTestsPerTask: 8 });
    form(3, 10);
    const finding = detectTaskCapFormStale(tmpDir);
    expect(finding).toMatchObject({ id: "bkit-tasks-form-stale", severity: "advisory" });
    expect(finding!.detect).toContain(FORM);
    expect(finding!.detect).toContain("`bkit.workflows.tasks.maxPerGroup` (default 3) is 5");
    expect(finding!.detect).toContain("`bkit.workflows.tasks.maxTestsPerTask` (default 10) is 8");
    expect(finding!.detect).not.toContain("maxTestsPerGroup");
    expect(finding!.detect).not.toContain("maxTestFilesPerTask");
    expect(finding!.action).toContain(`In ${FORM}`);
    expect(finding!.action).toContain(
      '`bkit.workflows.tasks.maxPerGroup` "(default 3)" → "(default 5)"',
    );
    expect(finding!.action).toContain(
      '`bkit.workflows.tasks.maxTestsPerTask` "(default 10)" → "(default 8)"',
    );
  });
});

describe("taskCapDefaultsNamed", () => {
  it("pairs each key with the default after it on its line, before the next key", () => {
    expect(
      taskCapDefaultsNamed(
        "`bkit.workflows.tasks.maxPerGroup` tasks (default 3) and `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests\n(default 15) `bkit.workflows.tasks.maxTestsPerTask` per task (default 10)",
      ),
    ).toEqual([
      { key: "maxPerGroup", value: 3 },
      { key: "maxTestsPerTask", value: 10 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// detectUnmarkedPlans
// ---------------------------------------------------------------------------

describe("detectUnmarkedPlans", () => {
  const MARKED = [
    "<!-- bkit:group 1 start -->",
    "### GROUP 1: Core",
    "<!-- bkit:task 1 start -->",
    "- [ ] **TASK 1:** Add it",
    "  - **UPDATE:** `foo` in `src/a.ts`: add it",
    "  - **DONE WHEN:** it works",
    "  - **TEST FIRST:**",
    "    - `src/a.test.ts` `adds it` fails on missing foo",
    "<!-- bkit:task 1 end -->",
    "<!-- bkit:group 1 end -->",
    "",
  ].join("\n");
  const UNMARKED = "# Plan\n\n## Tasks\n\n- [ ] **Task 1:** Add it\n";

  const write = (rel: string, text: string) => {
    const file = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf-8");
  };
  const ship = (month: string, fid: string, rows: object[]) =>
    write(
      `docs/plans/${month}/logs/${fid}/status.jsonl`,
      rows.map((r) => JSON.stringify(r)).join("\n") + "\n",
    );

  it("returns null with no docs/plans, or when every plan has task markers", () => {
    expect(detectUnmarkedPlans(tmpDir)).toBeNull();
    write("docs/plans/202610/1-a-plan.md", MARKED);
    expect(detectUnmarkedPlans(tmpDir)).toBeNull();
  });

  it("lists each unmarked plan, sorted, and skips archive, logs and non-plan files", () => {
    write("docs/plans/202610/2-b-plan.md", UNMARKED);
    write("docs/plans/202609/1-a-plan.md", UNMARKED);
    write("docs/plans/202610/3-c-plan.md", MARKED);
    write("docs/plans/202610/2-b-design.md", UNMARKED);
    write("docs/plans/202610/archive/20261001-4-d-plan.md", UNMARKED);
    write("docs/plans/202610/logs/2-b/build-plan.md", UNMARKED);
    const finding = detectUnmarkedPlans(tmpDir);
    expect(finding).toMatchObject({ id: "plan-task-markers-missing", severity: "advisory" });
    expect(finding!.detect).toBe(
      "2 plans have no task markers and will be converted to group and task blocks on the next `/bkit-build` of their FID: `docs/plans/202609/1-a-plan.md`, `docs/plans/202610/2-b-plan.md`.",
    );
    expect(finding!.action).toBe(
      "Nothing to do by hand: this matters only for builds still to run, and plans of shipped FIDs are not listed.",
    );
  });

  it("skips a plan whose FID has a ship workflow-done row, and keeps one only built", () => {
    write("docs/plans/202610/1-a-plan.md", UNMARKED);
    write("docs/plans/202610/2-b-plan.md", UNMARKED);
    ship("202610", "1-a", [
      { type: "workflow-done", workflow: "build", at: "2026-10-01T00:00:00Z" },
      { type: "workflow-done", workflow: "ship", at: "2026-10-02T00:00:00Z" },
    ]);
    ship("202610", "2-b", [
      { type: "workflow-done", workflow: "build", at: "2026-10-01T00:00:00Z" },
    ]);
    const finding = detectUnmarkedPlans(tmpDir);
    expect(finding!.detect).toBe(
      "1 plan has no task markers and will be converted to group and task blocks on the next `/bkit-build` of its FID: `docs/plans/202610/2-b-plan.md`.",
    );
  });

  it("reads past malformed status lines when looking for the ship row", () => {
    write("docs/plans/202610/1-a-plan.md", UNMARKED);
    write(
      "docs/plans/202610/logs/1-a/status.jsonl",
      'not json\n{"type":"workflow-done","workflow":"ship","at":"2026-10-02T00:00:00Z"}\n',
    );
    expect(detectUnmarkedPlans(tmpDir)).toBeNull();
  });
});
