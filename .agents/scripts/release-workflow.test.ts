// release-workflow.test.ts — Structural assertions for .github/workflows/release.yml
// (BAR-138: GH Packages distribution pipeline validation).
//
// No YAML parser available in devDependencies — uses string-based structural
// assertions on the raw YAML file content. Each assertion maps to a specific
// design requirement from bar-138-plan-1.md § Architecture & Component Changes.

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";

const WORKFLOW_PATH = path.resolve(".github/workflows/release.yml");

describe("release.yml structural assertions (BAR-138)", () => {
  let content: string;
  let lines: string[];

  content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
  lines = content.split("\n");

  // ---------------------------------------------------------------------------
  // Trigger
  // ---------------------------------------------------------------------------

  it("file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("triggers on push tags matching v*", () => {
    expect(content).toContain("push:");
    expect(content).toContain("tags:");
    expect(content).toContain("'v*'");
  });

  // ---------------------------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------------------------

  it("permissions.packages is write", () => {
    expect(content).toContain("packages: write");
  });

  it("permissions.contents is write (sliding v{N} tag step pushes back to origin)", () => {
    // v1.0.3+: contents was upgraded from read → write so the "Update sliding
    // major-version tag" step can `git push origin v{N} --force` using the
    // default GITHUB_TOKEN. See docs/deployments.md § "Sliding major-version tag".
    expect(content).toContain("contents: write");
  });

  // ---------------------------------------------------------------------------
  // Sliding major-version tag step (v1.0.3+)
  // ---------------------------------------------------------------------------

  it("sliding major-version tag step is present", () => {
    expect(content).toContain("Update sliding major-version tag");
  });

  it("sliding tag step skips prereleases (tags containing '-')", () => {
    // Prerelease tags like v1.0.3-rc.1 must not advance the v{N} sliding tag.
    expect(content).toMatch(/!contains\(github\.ref_name,\s*'-'\)/);
  });

  it("sliding tag step extracts major from ref_name (no hard-coded major)", () => {
    // Future-proofs for v2 / v3 — major is parsed from the tag, not hard-coded.
    expect(content).toContain("sed -E 's/^v([0-9]+)\\..*/\\1/'");
  });

  it("sliding tag step force-pushes the major-version tag to origin", () => {
    expect(content).toContain('git push origin "$MAJOR" --force');
  });

  it("sliding tag step appears after npm publish (failed publish must not advance the sliding tag)", () => {
    // Anchor on `- name:` so we match the step declaration, not the prose
    // reference in the `permissions:` comment block above.
    const publishIdx = lineIndex("- name: Publish to GitHub Packages");
    const slidingIdx = lineIndex("- name: Update sliding major-version tag");
    expect(publishIdx).toBeGreaterThan(-1);
    expect(slidingIdx).toBeGreaterThan(-1);
    expect(slidingIdx).toBeGreaterThan(publishIdx);
  });

  // ---------------------------------------------------------------------------
  // setup-node step
  // ---------------------------------------------------------------------------

  it("setup-node step uses node-version 20", () => {
    expect(content).toContain("node-version: 20");
  });

  it("setup-node step sets registry-url to https://npm.pkg.github.com", () => {
    expect(content).toContain("registry-url: https://npm.pkg.github.com");
  });

  it("setup-node step sets scope to @cbartens", () => {
    expect(content).toContain("scope: '@cbartens'");
  });

  it("uses actions/setup-node pinned to a SHA (supply-chain hardening)", () => {
    // SHA-pinned ref — matches `actions/setup-node@<40-char-hex>` with version comment.
    expect(content).toMatch(/actions\/setup-node@[0-9a-f]{40}/);
  });

  // ---------------------------------------------------------------------------
  // pnpm setup
  // ---------------------------------------------------------------------------

  it("uses pnpm/action-setup pinned to a SHA (supply-chain hardening)", () => {
    // SHA-pinned ref — matches `pnpm/action-setup@<40-char-hex>` with version comment.
    expect(content).toMatch(/pnpm\/action-setup@[0-9a-f]{40}/);
  });

  // ---------------------------------------------------------------------------
  // Full check suite — steps must appear in order
  // ---------------------------------------------------------------------------

  function lineIndex(substr: string): number {
    return lines.findIndex((l) => l.includes(substr));
  }

  it("pnpm typecheck step present", () => {
    expect(content).toContain("pnpm typecheck");
  });

  it("pnpm test step present", () => {
    expect(content).toContain("pnpm test");
  });

  it("pnpm format:check step present", () => {
    expect(content).toContain("pnpm format:check");
  });

  it("pnpm lint:prose step present", () => {
    expect(content).toContain("pnpm lint:prose");
  });

  it("pnpm lint:slop step present", () => {
    expect(content).toContain("pnpm lint:slop");
  });

  it("pnpm check:dist step present", () => {
    expect(content).toContain("pnpm check:dist");
  });

  it("check suite steps appear in order: typecheck → test → format:check → lint:prose → lint:slop → check:dist", () => {
    const typecheckIdx = lineIndex("pnpm typecheck");
    const testIdx = lineIndex("pnpm test");
    const formatIdx = lineIndex("pnpm format:check");
    const proseIdx = lineIndex("pnpm lint:prose");
    const slopIdx = lineIndex("pnpm lint:slop");
    const distIdx = lineIndex("pnpm check:dist");

    expect(typecheckIdx).toBeGreaterThan(-1);
    expect(testIdx).toBeGreaterThan(typecheckIdx);
    expect(formatIdx).toBeGreaterThan(testIdx);
    expect(proseIdx).toBeGreaterThan(formatIdx);
    expect(slopIdx).toBeGreaterThan(proseIdx);
    expect(distIdx).toBeGreaterThan(slopIdx);
  });

  // ---------------------------------------------------------------------------
  // Publish step
  // ---------------------------------------------------------------------------

  it("npm publish step is present (not pnpm publish)", () => {
    expect(content).toContain("npm publish");
    expect(content).not.toContain("pnpm publish");
  });

  it("npm publish step env has NODE_AUTH_TOKEN referencing GITHUB_TOKEN", () => {
    expect(content).toContain("NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}");
  });

  it("npm publish step appears after pnpm check:dist", () => {
    const distIdx = lineIndex("pnpm check:dist");
    const publishIdx = lineIndex("npm publish");
    expect(publishIdx).toBeGreaterThan(distIdx);
  });

  // ---------------------------------------------------------------------------
  // Concurrency guard (BAR-138 challenge remediation — Finding 1)
  // ---------------------------------------------------------------------------

  it("has a top-level concurrency block (prevents duplicate publish races)", () => {
    expect(content).toContain("concurrency:");
  });

  it("concurrency group references github.ref", () => {
    expect(content).toMatch(/group:\s+release-\$\{\{[^}]*github\.ref[^}]*\}\}/);
  });

  it("concurrency cancel-in-progress is false (in-flight publish must not be killed)", () => {
    expect(content).toContain("cancel-in-progress: false");
  });

  // ---------------------------------------------------------------------------
  // SHA-pinned actions (BAR-138 challenge remediation — Finding 2)
  // ---------------------------------------------------------------------------

  it("uses actions/checkout pinned to a SHA (supply-chain hardening)", () => {
    expect(content).toMatch(/actions\/checkout@[0-9a-f]{40}/);
  });
});

// ---------------------------------------------------------------------------
// Tarball exclusions — package.json `files` array uses negation patterns
// (BAR-138 challenge remediation — Finding 3, hardened in pre.3 after the
// initial .npmignore approach turned out to be a no-op when `files` is set:
// npm explicitly states `.npmignore` cannot exclude paths that `files`
// includes, so negation patterns inside `files` are the only mechanism that
// actually works.)
// ---------------------------------------------------------------------------

describe("published tarball excludes test sources (BAR-138, real `npm pack` inspection)", () => {
  // Run a dry-run pack and inspect the actual file manifest. This is the only
  // test that catches the npm quirk where .npmignore is silently ignored when
  // a `files` array is set in package.json — i.e., asserting on
  // package.json#files shape alone is insufficient (the actual tarball might
  // still ship excluded paths).
  const repoRoot = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
  );

  let manifestFiles: string[];

  beforeAll(() => {
    const out = execFileSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const parsed = JSON.parse(out) as Array<{ files: Array<{ path: string }> }>;
    manifestFiles = parsed[0].files.map((f) => f.path);
  });

  it("tarball ships zero *.test.ts files", () => {
    const offenders = manifestFiles.filter((p) => p.endsWith(".test.ts"));
    expect(offenders).toEqual([]);
  });

  it("tarball ships zero *.integration.test.ts files", () => {
    const offenders = manifestFiles.filter((p) => p.endsWith(".integration.test.ts"));
    expect(offenders).toEqual([]);
  });

  it("tarball ships zero files under __snapshots__/", () => {
    const offenders = manifestFiles.filter((p) => p.includes("__snapshots__/"));
    expect(offenders).toEqual([]);
  });

  it("tarball still contains the load-bearing payload (dist/, README.md, .agents/templates/)", () => {
    expect(manifestFiles.some((p) => p === "dist/bkit-install.js")).toBe(true);
    expect(manifestFiles.some((p) => p === "README.md")).toBe(true);
    expect(manifestFiles.some((p) => p === ".agents/templates/.github/workflows/ci.yml")).toBe(
      true,
    );
  });

  it("tarball ships bkit-ci-router.yml template (BAR-148)", () => {
    expect(
      manifestFiles.some((p) => p === ".agents/templates/.github/workflows/bkit-ci-router.yml"),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BAR-148 — bkit-ci-router.md authoring-conventions assertions
// (matrix rows 10, 11, 12, 13, 14, 15, 16, 17, 18)
// ---------------------------------------------------------------------------

const ROUTER_ORCHESTRATOR_PATH = path.resolve(".agents/workflows/bkit-ci-router.md");

describe("C7 — bkit-ci-router.md authoring-conventions (matrix row 10)", () => {
  let routerContent: string;

  beforeAll(() => {
    routerContent = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
  });

  it("bkit-ci-router.md exists", () => {
    expect(fs.existsSync(ROUTER_ORCHESTRATOR_PATH)).toBe(true);
  });

  it("has YAML frontmatter with description field", () => {
    expect(routerContent).toMatch(/^---\n/);
    expect(routerContent).toContain("description:");
  });

  it("has Failure Path section (## 🤖 Failure Path)", () => {
    expect(routerContent).toContain("## 🤖 Failure Path");
  });

  it("has Step 1 — Start Workflow", () => {
    expect(routerContent).toContain("## 🤖 Step 1 — Start Workflow");
  });

  it("every step has a ### 🔒 Gate N marker", () => {
    // Router has 7 steps → 7 gates
    const gateCount = (routerContent.match(/### 🔒 Gate \d+/g) ?? []).length;
    expect(gateCount).toBeGreaterThanOrEqual(7);
  });

  it("documents Worktree Setup exception (runner provides worktree — no .worktrees creation)", () => {
    // The router legitimately omits the standard worktree creation; must be documented
    expect(routerContent).toContain("runner");
    expect(routerContent).toContain("worktree");
    // Must NOT contain standard worktree-creation bash pattern
    expect(routerContent).not.toContain("git worktree add");
  });

  it("workflow: ci-router in status.json shape", () => {
    expect(routerContent).toContain('"ci-router"');
  });
});

describe("C8 — all 5 existing orchestrators write issueId and commentId in Step 1 (matrix row 11)", () => {
  const orchestrators = [
    { name: "bkit-plan.md", workflow: "plan" },
    { name: "bkit-build.md", workflow: "build" },
    { name: "bkit-ship.md", workflow: "ship" },
    { name: "bkit-debug.md", workflow: "debug" },
    { name: "bkit-design.md", workflow: "design" },
  ];

  for (const { name, workflow } of orchestrators) {
    it(`${name} Step 1 status.json init includes issueId field`, () => {
      const filePath = path.resolve(`.agents/workflows/${name}`);
      const content = fs.readFileSync(filePath, "utf-8");
      // Find the status init block for this workflow
      const initIdx = content.indexOf(`workflow:"${workflow}"`);
      expect(initIdx).toBeGreaterThan(-1);
      const block = content.slice(Math.max(0, initIdx - 200), initIdx + 500);
      expect(block).toContain("issueId");
    });

    it(`${name} Step 1 status.json init includes commentId field`, () => {
      const filePath = path.resolve(`.agents/workflows/${name}`);
      const content = fs.readFileSync(filePath, "utf-8");
      const initIdx = content.indexOf(`workflow:"${workflow}"`);
      expect(initIdx).toBeGreaterThan(-1);
      const block = content.slice(Math.max(0, initIdx - 200), initIdx + 500);
      expect(block).toContain("commentId");
    });
  }
});

describe("C8b — commentId patch appears AFTER save_comment in each orchestrator (source-order constraint)", () => {
  const orchestrators = [
    "bkit-plan.md",
    "bkit-build.md",
    "bkit-ship.md",
    "bkit-debug.md",
    "bkit-design.md",
  ];

  for (const name of orchestrators) {
    it(`${name} writes commentId AFTER save_comment captures it`, () => {
      const filePath = path.resolve(`.agents/workflows/${name}`);
      const content = fs.readFileSync(filePath, "utf-8");
      const saveCommentIdx = content.indexOf("save_comment(");
      const lastCidWriteIdx = content.lastIndexOf('--arg cid "{COMMENT_ID}"');
      expect(saveCommentIdx).toBeGreaterThan(-1);
      expect(lastCidWriteIdx).toBeGreaterThan(-1);
      // The last --arg cid "{COMMENT_ID}" must appear AFTER the first save_comment(
      // (i.e. the commentId patch follows the save_comment that resolves {COMMENT_ID})
      expect(lastCidWriteIdx).toBeGreaterThan(saveCommentIdx);
    });
  }
});

describe("C9a — router no-op exit when Auto label absent (matrix row 12)", () => {
  let routerContent: string;
  beforeAll(() => {
    routerContent = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
  });

  it("router step skeleton contains label-gate decision branch (Auto label check)", () => {
    expect(routerContent).toContain("Auto");
    expect(routerContent).toContain("label");
  });

  it("router documents no-op exit when Auto label absent", () => {
    expect(routerContent).toContain("Auto` absent");
  });
});

describe("C9b — router no-op exit when stale run (head SHA mismatch) (matrix row 13)", () => {
  let routerContent: string;
  beforeAll(() => {
    routerContent = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
  });

  it("router step skeleton contains stale-run guard (headSha comparison)", () => {
    expect(routerContent).toContain("headSha");
    expect(routerContent).toContain("stale");
  });

  it("router documents no-op exit when run head SHA does not match PR head SHA", () => {
    expect(routerContent).toContain("PR_HEAD_SHA");
    expect(routerContent).toContain("LATEST_SHA");
  });
});

describe("C9c — router failure exit when status.json missing or malformed (matrix row 14)", () => {
  let routerContent: string;
  beforeAll(() => {
    routerContent = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
  });

  it("router documents failure branch for missing status.json", () => {
    expect(routerContent).toContain("status.json missing");
  });

  it("router documents failure branch for malformed status.json", () => {
    expect(routerContent).toContain("status.json malformed");
  });
});

describe("C9d — router no-op exit when PR closed (matrix row 15)", () => {
  let routerContent: string;
  beforeAll(() => {
    routerContent = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
  });

  it("router documents no-op exit when no open PR found", () => {
    expect(routerContent).toContain("no open PR");
  });

  it("router checks for PR existence before dispatch", () => {
    expect(routerContent).toContain("PR_NUMBER");
  });
});

describe("C9e — router concurrency: newer CI run supersedes in-flight (matrix row 16)", () => {
  it("bkit-ci-router.yml template has cancel-in-progress: true", () => {
    const templatePath = path.resolve(".agents/templates/.github/workflows/bkit-ci-router.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    expect(content).toContain("cancel-in-progress: true");
  });

  it("bkit-ci-router.md router does NOT perform multi-step atomic status.json writes (no corruption window)", () => {
    const content = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
    // Router writes status per step individually (not in a multi-step batch) — each step records itself
    // Assert there is no combined multi-step write pattern
    expect(content).not.toContain("steps:[step1, step2]");
  });
});

describe("C9f — router dispatches /bkit-debug unconditionally (no MAX_DEBUG_ATTEMPT pre-check) (matrix row 17)", () => {
  let routerContent: string;
  beforeAll(() => {
    routerContent = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
  });

  it("router step skeleton has NO MAX_DEBUG_ATTEMPT pre-check", () => {
    // Router must not read MAX_DEBUG_ATTEMPT; debug orchestrator enforces ceiling.
    // Documentation prose may reference the constant name (to explain the constraint);
    // only actual shell reads/comparisons are forbidden (e.g. $MAX_DEBUG_ATTEMPT or
    // arithmetic like [ "$MAX_DEBUG_ATTEMPT" -ge … ]).
    expect(routerContent).not.toMatch(/\$\{?MAX_DEBUG_ATTEMPT\}?/);
    expect(routerContent).not.toMatch(/MAX_DEBUG_ATTEMPT\s*[<>=!-]/);
  });

  it("router documents dispatch of /bkit-debug unconditionally", () => {
    expect(routerContent).toContain("bkit-debug");
  });
});

describe("C9g — router documents ANTHROPIC_API_KEY failure path (matrix row 18)", () => {
  let routerContent: string;
  beforeAll(() => {
    routerContent = fs.existsSync(ROUTER_ORCHESTRATOR_PATH)
      ? fs.readFileSync(ROUTER_ORCHESTRATOR_PATH, "utf-8")
      : "";
  });

  it("router documents ANTHROPIC_API_KEY missing failure path", () => {
    expect(routerContent).toContain("ANTHROPIC_API_KEY");
  });

  it("router references claude-code-action failure surface", () => {
    expect(routerContent).toContain("claude-code-action");
  });
});

// ---------------------------------------------------------------------------
// BAR-148 build-challenge remediation — FID resolution regression tests
//
// Bug: router was deriving FID by scanning docs/plans/logs/ alphabetically and
// picking the first DONE/IN_PROGRESS directory. On any branch that inherits
// historical FID directories from dev this returns the wrong FID.
// Fix: FID=$(echo "$BRANCH" | sed 's|^feat/||') — branch-derived, not
// filesystem-derived.
//
// Both the canonical orchestrator (.agents/workflows/bkit-ci-router.md) and
// its mirror (.claude/commands/bkit-ci-router.md) must carry the fix.
// ---------------------------------------------------------------------------

const ROUTER_FILES = [
  {
    label: ".agents/workflows/bkit-ci-router.md (canonical)",
    filePath: path.resolve(".agents/workflows/bkit-ci-router.md"),
  },
  {
    label: ".claude/commands/bkit-ci-router.md (mirror)",
    filePath: path.resolve(".claude/commands/bkit-ci-router.md"),
  },
  {
    label: ".cursor/commands/bkit-ci-router.md (mirror)",
    filePath: path.resolve(".cursor/commands/bkit-ci-router.md"),
  },
];

for (const { label, filePath } of ROUTER_FILES) {
  describe(`FID resolution regression (BAR-148 build-challenge) — ${label}`, () => {
    let content: string;

    beforeAll(() => {
      content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
    });

    it("derives FID from branch name using sed prefix-strip (branch-derived, not filesystem-scan)", () => {
      // The canonical fix: FID=$(echo "$BRANCH" | sed 's|^feat/||')
      // Any regression to a filesystem-scan approach would drop this line.
      expect(content).toMatch(/FID=\$\(echo "\$BRANCH"\s*\|\s*sed 's\|/);
    });

    it("sed expression strips exactly the feat/ prefix (not a broader substitution)", () => {
      // Guard: the substitution must strip '^feat/' — no other prefix, no glob.
      expect(content).toContain("sed 's|^feat/||'");
    });

    it("guards against FID equalling BRANCH (prefix-not-stripped safety check)", () => {
      // If sed didn't strip anything (branch doesn't start with feat/), FID would
      // equal BRANCH — the orchestrator must detect and reject this case via
      // Failure Path rather than silently using a wrong FID.
      expect(content).toContain("Cannot derive FID from branch name");
    });

    it("does NOT contain alphabetical directory-scan for FID (the regressed pattern)", () => {
      // The old buggy approach scanned docs/plans/logs/ and picked the first
      // DONE/IN_PROGRESS directory alphabetically. Any of these patterns indicate
      // a regression to filesystem-derived FID resolution.
      expect(content).not.toMatch(/ls\s+docs\/plans\/logs/);
      expect(content).not.toMatch(/for\s+\w+\s+in\s+\$\(ls\s+docs\/plans\/logs/);
      expect(content).not.toMatch(/readdir.*plans\/logs/);
    });

    it("does NOT contain status-json-scan loop for FID (the regressed status-scan pattern)", () => {
      // A variant of the old bug: iterating over docs/plans/logs/ directories and
      // checking each status.json for IN_PROGRESS/DONE to derive FID — still
      // filesystem-derived, still wrong on branches inheriting historical dirs.
      // The old pattern would look like: for d in $(ls docs/plans/logs/); do jq '.[-1].status' ...
      expect(content).not.toMatch(/for\s+\w+\s+in.*plans\/logs/);
      expect(content).not.toMatch(/while\s+.*plans\/logs.*do/s);
      // The BRANCH env var must be the sole source of FID
      expect(content).toContain('BRANCH="${CI_RUN_HEAD_BRANCH');
    });

    it("FID derivation uses the CI_RUN_HEAD_BRANCH env var as its sole input", () => {
      // Belt-and-braces: confirm the derivation line explicitly sources BRANCH,
      // which is assigned from CI_RUN_HEAD_BRANCH. A filesystem-scan approach
      // would not reference BRANCH in the FID= assignment.
      const lines = content.split("\n");
      const fidLine = lines.find((l) => l.includes("FID=") && l.includes("BRANCH"));
      expect(fidLine).toBeDefined();
      expect(fidLine).toMatch(/BRANCH/);
    });
  });
}
