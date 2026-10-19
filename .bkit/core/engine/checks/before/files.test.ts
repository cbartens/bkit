// checks/before/files.test.ts — Unit tests for the Phase 1 shared-file detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSharedRoot, getTemplatesRoot, templateRelPath } from "../../shared/package-roots";
import {
  stripBkitBlock,
  detectGitignoreBlockDuplicates,
  detectPlaywrightReporterHostile,
  MARKERED_TEXT_DRIFT_PATHS,
  detectTier2TextDrift,
} from "./files";
import { runPreflight } from "./index";

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
// stripBkitBlock (BAR-141 iter 2)
// ---------------------------------------------------------------------------

describe("stripBkitBlock", () => {
  it("removes HTML-comment-style bkit block content", () => {
    const input = "before\n<!-- bkit:start -->\ninside\n<!-- bkit:end -->\nafter";
    expect(stripBkitBlock(input)).toContain("before");
    expect(stripBkitBlock(input)).toContain("after");
    expect(stripBkitBlock(input)).not.toContain("inside");
  });

  it("removes slash-comment-style bkit block content", () => {
    const input = "before\n// bkit:start\ninside\n// bkit:end\nafter";
    expect(stripBkitBlock(input)).toContain("before");
    expect(stripBkitBlock(input)).toContain("after");
    expect(stripBkitBlock(input)).not.toContain("inside");
  });

  it("returns content unchanged when no markers present", () => {
    expect(stripBkitBlock("just content")).toBe("just content");
  });
});

describe("templates are never drift-checked", () => {
  it("MARKERED_TEXT_DRIFT_PATHS holds no template path", () => {
    expect(
      MARKERED_TEXT_DRIFT_PATHS.filter((p) =>
        fs.existsSync(path.join(getTemplatesRoot(), templateRelPath(p))),
      ),
    ).toEqual([]);
  });

  it("an adopted .prettierignore, .vale.ini or bkit-ci.yml raises no drift or marker advisory", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".prettierignore"), "node_modules\n", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".vale.ini"), "# bkit:start\nStylesPath = x\n# bkit:end\n");
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"),
      "# bkit:start main-lag-warning\nname: mine\n# bkit:end main-lag-warning\n",
    );
    const { advisories } = runPreflight(makeModules("claude"), tmpDir);
    const ids = advisories.map((f) => f.id);
    expect(ids).not.toContain("tier2-text-drift");
    expect(ids.some((id) => id.startsWith("prettierignore-"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectGitignoreBlockDuplicates — Detector C (BAR-141 iter 2)
// ---------------------------------------------------------------------------

describe("detectTier2TextDrift — .gitignore", () => {
  /** The shipped `gitignore` template (stored dot-less), its managed block and the lines after it. */
  const template = () => fs.readFileSync(path.join(getSharedRoot(), "gitignore"), "utf-8");
  const significant = (text: string) =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "" && !l.startsWith("#") && !l.startsWith("<!--"));

  it("flags a .gitignore whose bkit block dropped a template line (the template is named gitignore)", () => {
    const shipped = template();
    const dropped = significant(
      shipped.slice(shipped.indexOf("bkit:start"), shipped.indexOf("bkit:end")),
    )[1]!;
    expect(dropped).toBeTruthy();
    const drifted = shipped
      .split("\n")
      .filter((l) => l.trim() !== dropped)
      .join("\n");
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), drifted);
    const finding = detectTier2TextDrift(tmpDir, ".gitignore");
    expect(finding).toMatchObject({ id: "tier2-text-drift", severity: "advisory" });
    expect(finding!.detect).toContain(".gitignore has a bkit-managed block missing 1 line(s)");
    expect(finding!.action).toContain(".bkit/shared/gitignore");
  });

  it("stays quiet on a .gitignore carrying the whole block, with consumer lines outside it", () => {
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), `${template()}\nmy-own-dir/\n`);
    expect(detectTier2TextDrift(tmpDir, ".gitignore")).toBeNull();
  });

  it("runPreflight reports the drifted .gitignore", () => {
    const shipped = template();
    const dropped = significant(
      shipped.slice(shipped.indexOf("bkit:start"), shipped.indexOf("bkit:end")),
    )[1]!;
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, ".gitignore"),
      shipped
        .split("\n")
        .filter((l) => l.trim() !== dropped)
        .join("\n"),
    );
    const { advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(
      advisories
        .filter((f) => f.id === "tier2-text-drift")
        .some((f) => f.detect.includes(".gitignore")),
    ).toBe(true);
  });
});

describe("detectGitignoreBlockDuplicates", () => {
  it("flags when .worktrees/ appears outside the bkit block", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".gitignore"),
      ".worktrees/\nnode_modules/\n<!-- bkit:start -->\n.worktrees/\n.husky/_\n<!-- bkit:end -->\n",
      "utf-8",
    );
    const f = detectGitignoreBlockDuplicates(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("gitignore-block-duplicates");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain(".worktrees/");
  });

  it("does NOT flag when bkit lines appear only inside the block", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".gitignore"),
      "node_modules/\n# <!-- bkit:start -->\n.worktrees/\n.husky/_\n# <!-- bkit:end -->\n",
      "utf-8",
    );
    const f = detectGitignoreBlockDuplicates(tmpDir);
    expect(f).toBeNull();
  });

  it("returns null when .gitignore does not exist", () => {
    const f = detectGitignoreBlockDuplicates(tmpDir);
    expect(f).toBeNull();
  });
});

describe("detectPlaywrightReporterHostile", () => {
  function writeCiYml(content: string): void {
    const dir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "bkit-ci.yml"), content, "utf-8");
  }

  it("flags when consumer step runs `playwright test --reporter=line`", () => {
    writeCiYml(
      "jobs:\n  e2e:\n    steps:\n      - run: pnpm exec playwright test --reporter=line --workers=2\n",
    );
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("playwright-reporter-line-override-hostile");
    expect(f?.severity).toBe("advisory");
    expect(f?.action).toContain("Drop the `--reporter=line` flag");
    expect(f?.action).toContain("VERBOSE_CI");
  });

  it("does NOT flag when `playwright test` runs without --reporter", () => {
    writeCiYml("jobs:\n  e2e:\n    steps:\n      - run: pnpm exec playwright test --workers=2\n");
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when --reporter is set but not to `line`", () => {
    writeCiYml(
      "jobs:\n  e2e:\n    steps:\n      - run: pnpm exec playwright test --reporter=html\n",
    );
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when --reporter=line is only inside the bkit-managed stub region", () => {
    writeCiYml(
      "jobs:\n  e2e:\n    steps:\n      # bkit:start\n      # - run: playwright test --reporter=line\n      # bkit:end\n",
    );
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("returns null when bkit-ci.yml does not exist", () => {
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when --reporter=line appears without a playwright test invocation", () => {
    writeCiYml("jobs:\n  test:\n    steps:\n      - run: someothertool --reporter=line\n");
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
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
