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
  detectOpencodeSubstringFetchGrants,
  detectCloudBootstrapFingerprintMissing,
  redactUrlParts,
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

  it("reads the workflow named by bkit.testing.ciWorkflow and names its path", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { testing: { ciWorkflow: "ci.yml" } } }),
    );
    const dir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(dir, { recursive: true });
    const hostile = "jobs:\n  e2e:\n    steps:\n      - run: playwright test --reporter=line\n";
    fs.writeFileSync(path.join(dir, "bkit-ci.yml"), hostile);
    expect(detectPlaywrightReporterHostile(tmpDir)).toBeNull();
    fs.writeFileSync(path.join(dir, "ci.yml"), hostile);
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f?.id).toBe("playwright-reporter-line-override-hostile");
    expect(f?.detect).toContain(".github/workflows/ci.yml");
    expect(f?.detect).not.toContain("bkit-ci.yml");
  });
});

describe("detectOpencodeSubstringFetchGrants", () => {
  const OC_REL = path.join(".opencode", "opencode.json");

  function writeOpencode(content: string): string {
    const abs = path.join(tmpDir, OC_REL);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
    return abs;
  }

  function writeBash(bash: Record<string, string>, webfetch?: Record<string, string>): string {
    return writeOpencode(
      JSON.stringify({ permission: { bash, ...(webfetch ? { webfetch } : {}) } }, null, 2),
    );
  }

  it("reports each substring curl and wget allow with its removal action", () => {
    writeBash({ "curl *": "ask", "curl *github.com*": "allow", "wget *github.com*": "allow" });
    const f = detectOpencodeSubstringFetchGrants(tmpDir);
    expect(f).not.toBeNull();
    expect(f?.id).toBe("opencode-substring-fetch-grants");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("curl *github.com*");
    expect(f?.detect).toContain("wget *github.com*");
    expect(f?.detect).toContain(OC_REL);
    expect(f?.action).toContain("permission.bash");
    expect(f?.action).toMatch(/remove|delete/i);
  });

  it("ignores webfetch, non-allow and unrelated consumer entries", () => {
    writeBash(
      {
        "curl *": "ask",
        "curl *x*": "ask",
        "git status*": "allow",
        "npm run *": "allow",
      },
      { "*": "ask", "*github.com*": "allow", "https://api.example.com/*": "allow" },
    );
    expect(detectOpencodeSubstringFetchGrants(tmpDir)).toBeNull();
  });

  it("redacts URL credentials and query strings in a reported key", () => {
    writeBash({ "curl *https://user:tok@example.com/p?k=v*": "allow" });
    const f = detectOpencodeSubstringFetchGrants(tmpDir);
    expect(f).not.toBeNull();
    const text = `${f?.detect}\n${f?.action}`;
    expect(text).not.toContain("user:tok");
    expect(text).not.toContain("k=v");
    expect(text).toContain("example.com");
    const red = redactUrlParts("curl *https://user:tok@example.com/p?k=v*");
    expect(red).not.toContain("user:tok");
    expect(red).not.toContain("k=v");
  });

  it("redacts schemeless user-info in a reported key", () => {
    writeBash({ "curl *user:tok@example.com*": "allow" });
    const f = detectOpencodeSubstringFetchGrants(tmpDir);
    expect(f).not.toBeNull();
    const text = `${f?.detect}\n${f?.action}`;
    expect(text).not.toContain("user:tok");
    expect(text).toContain("example.com");
  });

  it("redactUrlParts drops user-info with no scheme", () => {
    const red = redactUrlParts("wget *user:tok@example.com/p*");
    expect(red).not.toContain("user:tok");
    expect(red).toContain("example.com");
  });

  it("reports nothing and writes nothing for an absent, unparseable or map-less file", () => {
    expect(detectOpencodeSubstringFetchGrants(tmpDir)).toBeNull();
    expect(fs.existsSync(path.join(tmpDir, OC_REL))).toBe(false);

    for (const content of [
      "{ not json",
      JSON.stringify({ permission: { bash: "allow" } }),
      JSON.stringify({ permission: "allow" }),
      JSON.stringify({}),
    ]) {
      const abs = writeOpencode(content);
      const before = fs.readFileSync(abs, "utf-8");
      expect(detectOpencodeSubstringFetchGrants(tmpDir)).toBeNull();
      expect(fs.readFileSync(abs, "utf-8")).toBe(before);
    }

    // A reported file is never rewritten either.
    const abs = writeBash({ "curl *github.com*": "allow" });
    const before = fs.readFileSync(abs, "utf-8");
    expect(detectOpencodeSubstringFetchGrants(tmpDir)).not.toBeNull();
    expect(fs.readFileSync(abs, "utf-8")).toBe(before);
  });
});

describe("detectCloudBootstrapFingerprintMissing", () => {
  const BOOTSTRAP_REL = path.join(".claude", "hooks", "bkit-cloud-bootstrap.sh");

  function writeBootstrap(body: string): void {
    const abs = path.join(tmpDir, BOOTSTRAP_REL);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body, "utf-8");
  }

  it("reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT", () => {
    // A bootstrap copied from the pre-fingerprint template: the trust check, no compare.
    writeBootstrap(
      "#!/usr/bin/env bash\nset -euo pipefail\ncat >/dev/null\n" +
        'if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then exit 0; fi\n' +
        "pnpm install --frozen-lockfile\n",
    );
    const f = detectCloudBootstrapFingerprintMissing(tmpDir);
    expect(f).not.toBeNull();
    expect(f?.id).toBe("cloud-bootstrap-fingerprint-missing");
    expect(f?.detect).toContain(BOOTSTRAP_REL);
    expect(f?.detect).toContain("BKIT_CLOUD_ALLOWLIST_FINGERPRINT");
    expect(f?.action).toContain(".bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh");
  });

  it("accepts a customised bootstrap that reads the variable", () => {
    // Rewritten, not byte-equal to the template, but it compares the variable itself.
    writeBootstrap(
      "#!/usr/bin/env bash\nmy_custom_setup() { :; }\n" +
        'if [ "${BKIT_CLOUD_ALLOWLIST_FINGERPRINT:-}" = "$(my_stamp)" ]; then echo same; fi\n',
    );
    expect(detectCloudBootstrapFingerprintMissing(tmpDir)).toBeNull();
  });

  it("stays silent when no bootstrap is adopted", () => {
    expect(fs.existsSync(path.join(tmpDir, BOOTSTRAP_REL))).toBe(false);
    expect(detectCloudBootstrapFingerprintMissing(tmpDir)).toBeNull();
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
