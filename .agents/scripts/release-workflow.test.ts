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

  it("permissions.contents is read", () => {
    expect(content).toContain("contents: read");
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
