// checks/after/managed.test.ts — Unit tests for the Phase 3 managed-file detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectManagedDuplicate, detectManagedStale, isOnProtectedBranch } from "./managed";
import { stampManagedVersion, managedVersionMarker } from "../../install/version-file";

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
// detectManagedStale — managed-version marker gate over every stamped file
// ---------------------------------------------------------------------------

describe("detectManagedStale", () => {
  function write(rel: string, content: string): void {
    const p = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, "utf-8");
  }
  // A rendered mirror carrying (or omitting) a managed-version marker.
  function writeRendered(rel: string, version: string | null): void {
    const base = "---\nname: bkit-x\n---\n\nbody\n";
    write(rel, version ? stampManagedVersion(base, version) : base);
  }
  // A block-scoped file: the marker (or none) as the first line of its bkit block.
  function writeBlock(rel: string, version: string | null): void {
    const marker = version ? `${managedVersionMarker(version)}\n\n` : "";
    write(rel, `# consumer intro\n\n<!-- bkit:start -->\n\n${marker}# T\n\n<!-- bkit:end -->\n`);
  }

  it("returns null when every stamped file matches, in every comment form", () => {
    writeRendered(".claude/agents/bkit-a.md", "4.0.0");
    writeBlock("docs/testing.md", "4.0.0");
    writeBlock("AGENTS.md", "4.0.0");
    write(
      ".gitignore",
      `node_modules/\n# <!-- bkit:start -->\n\n${managedVersionMarker("4.0.0", "hash")}\n\n.worktrees/\n\n# <!-- bkit:end -->\n`,
    );
    write(
      ".claude/hooks/bkit-gateguard.cjs",
      `// driver\n// bkit:start\n\n${managedVersionMarker("4.0.0", "slash")}\n\nconst x = 1;\n\n// bkit:end\n`,
    );
    write(".bkit/workflows.md", `# Workflows\n\n${managedVersionMarker("4.0.0")}\n\nbody\n`);
    write(".codex/agents/bkit-a.toml", `${managedVersionMarker("4.0.0", "hash")}\nname = "a"\n`);
    expect(detectManagedStale(tmpDir, "4.0.0", true)).toBeNull();
  });

  it("returns a blocker on a protected branch, naming each stale file and its version", () => {
    writeRendered(".claude/agents/bkit-a.md", "4.1.0");
    writeBlock("docs/testing.md", "4.0.0");
    const f = detectManagedStale(tmpDir, "4.1.0", true);
    expect(f?.id).toBe("bkit-managed-stale");
    expect(f?.severity).toBe("blocker");
    expect(f?.detect).toContain("1 of 2");
    expect(f?.detect).toContain(`${path.join("docs", "testing.md")} (v4.0.0)`);
    expect(f?.detect).not.toContain("bkit-a.md");
    expect(f?.detect).not.toContain("non-blocking");
  });

  it("downgrades to a non-blocking advisory on a feature branch", () => {
    writeRendered(".cursor/commands/bkit-b.md", "4.0.0");
    const f = detectManagedStale(tmpDir, "4.1.0", false);
    expect(f?.id).toBe("bkit-managed-stale");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("non-blocking on this feature branch");
  });

  it("reads the hash, slash and TOML forms back", () => {
    write(
      ".claude/hooks/bkit-preflight.sh",
      `#!/usr/bin/env bash\n# <!-- bkit:start -->\n\n${managedVersionMarker("3.0.0", "hash")}\n\nexit 0\n\n# <!-- bkit:end -->\n`,
    );
    write(
      ".cursor/hooks/bkit-guardrails.cjs",
      `// bkit:start\n\n${managedVersionMarker("3.0.0", "slash")}\n\n// bkit:end\n`,
    );
    write(".codex/agents/bkit-a.toml", `${managedVersionMarker("3.0.0", "hash")}\nname = "a"\n`);
    write(".bkit/.env.example", `# env\n${managedVersionMarker("3.0.0", "hash")}\nX=\n`);
    const f = detectManagedStale(tmpDir, "4.0.0", true);
    for (const rel of [
      ".claude/hooks/bkit-preflight.sh",
      ".cursor/hooks/bkit-guardrails.cjs",
      ".codex/agents/bkit-a.toml",
      ".bkit/.env.example",
    ]) {
      expect(f?.detect).toContain(`${path.normalize(rel)} (v3.0.0)`);
    }
  });

  it("flags a whole file with no marker and a block with no marker", () => {
    writeRendered(".opencode/agents/bkit-a.md", null);
    writeBlock(".agents/rules.md", null);
    const f = detectManagedStale(tmpDir, "4.0.0", true);
    expect(f?.detect).toContain(`${path.join(".opencode", "agents", "bkit-a.md")} (no marker)`);
    expect(f?.detect).toContain(`${path.join(".agents", "rules.md")} (no marker)`);
  });

  it("skips a block-scoped file that has no bkit block (the consumer's own file)", () => {
    write("docs/testing.md", "# our testing doc\n");
    write(".gitignore", "node_modules/\n");
    write(".claude/hooks/bkit-gateguard.cjs", "// our own hook\n");
    expect(detectManagedStale(tmpDir, "4.0.0", true)).toBeNull();
  });

  it("reads the stamp from the real block when prose quotes both markers first", () => {
    write(
      "docs/testing.md",
      "Edit outside `<!-- bkit:start -->` / `<!-- bkit:end -->`.\n" +
        `<!-- bkit:start -->\n${managedVersionMarker("4.1.0")}\n\n# T\n<!-- bkit:end -->\n`,
    );
    expect(detectManagedStale(tmpDir, "4.1.0", true)).toBeNull();
  });

  it("never reads inline prose vX.Y.Z as the stamp", () => {
    write(
      "docs/architecture.md",
      "<!-- bkit:start -->\n\n# Architecture\n\ncarries `<!-- bkit:managed vX.Y.Z … -->`.\n<!-- bkit:end -->\n",
    );
    const f = detectManagedStale(tmpDir, "4.0.0", true);
    expect(f?.detect).toContain("no marker");
    expect(f?.detect).not.toContain("(vX.Y.Z)");
  });

  it("ignores files bkit does not write: user plans, non-bkit mirror files", () => {
    writeBlock("docs/plans/202605/143-feature-plan.md", "1.0.0");
    write(".claude/agents/consumer-agent.md", "no marker, not bkit-\n");
    write(".claude/agents/README.txt", "not managed\n");
    expect(detectManagedStale(tmpDir, "4.0.0", true)).toBeNull();
  });

  it("returns null when nothing is installed, and on a 0.0.0 / empty installing version", () => {
    expect(detectManagedStale(tmpDir, "4.0.0", true)).toBeNull();
    writeRendered(".claude/agents/bkit-a.md", "3.0.0");
    expect(detectManagedStale(tmpDir, "0.0.0", true)).toBeNull();
    expect(detectManagedStale(tmpDir, "", true)).toBeNull();
  });

  it("truncates the example list and reports the overflow count", () => {
    for (let i = 0; i < 8; i++) writeRendered(`.claude/agents/bkit-${i}.md`, "3.0.0");
    expect(detectManagedStale(tmpDir, "4.0.0", true)?.detect).toContain("(+3 more)");
  });
});

// ---------------------------------------------------------------------------
// isOnProtectedBranch — branch-scoped severity for the stale gates
// ---------------------------------------------------------------------------

describe("isOnProtectedBranch", () => {
  const saved = {
    base: process.env.GITHUB_BASE_REF,
    ref: process.env.GITHUB_REF_NAME,
  };
  afterEach(() => {
    if (saved.base === undefined) delete process.env.GITHUB_BASE_REF;
    else process.env.GITHUB_BASE_REF = saved.base;
    if (saved.ref === undefined) delete process.env.GITHUB_REF_NAME;
    else process.env.GITHUB_REF_NAME = saved.ref;
  });

  it("treats a push to main/dev as protected (GITHUB_REF_NAME)", () => {
    delete process.env.GITHUB_BASE_REF;
    process.env.GITHUB_REF_NAME = "main";
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
    process.env.GITHUB_REF_NAME = "dev";
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
  });

  it("treats a push to a feature branch as NOT protected", () => {
    delete process.env.GITHUB_BASE_REF;
    process.env.GITHUB_REF_NAME = "feat/296-file-upload";
    expect(isOnProtectedBranch(tmpDir)).toBe(false);
  });

  it("treats a PR INTO main/dev as protected — base ref wins over the feature head ref", () => {
    process.env.GITHUB_REF_NAME = "feat/296-file-upload"; // PR head/merge ref
    process.env.GITHUB_BASE_REF = "dev"; // merge target
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
  });

  it("fail-safe: undeterminable branch (no CI env, non-git dir) → protected", () => {
    delete process.env.GITHUB_BASE_REF;
    delete process.env.GITHUB_REF_NAME;
    // tmpDir is a fresh mkdtemp dir, not a git work tree → git HEAD resolution
    // fails → null → treated as protected so an unknown env never downgrades.
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// detectManagedDuplicate — older unmarked copy outside a managed markdown block
// ---------------------------------------------------------------------------

describe("detectManagedDuplicate", () => {
  const rows = Array.from(
    { length: 12 },
    (_, i) => `- **Rule ${i}:** ALWAYS follow the numbered rule ${i} in every agent run.`,
  ).join("\n");
  const block = `<!-- bkit:start -->\n\n# Agent Rules\n\n${rows}\n\n<!-- bkit:end -->\n`;
  function write(rel: string, content: string): void {
    const p = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, "utf-8");
  }

  it("flags an old copy above the block, naming the file and the title line", () => {
    write(".agents/rules.md", `# Agent Rules\n\n${rows}\n\n${block}`);
    const f = detectManagedDuplicate(tmpDir);
    expect(f?.id).toBe("bkit-managed-duplicate");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain(
      `${path.join(".agents", "rules.md")} (\`# Agent Rules\` at line 1)`,
    );
  });

  it("flags an old copy below the block at its own line", () => {
    write(".agents/rules.md", `${block}\n# Agent Rules\n\n${rows}\n`);
    expect(detectManagedDuplicate(tmpDir)?.detect).toContain("at line 20");
  });

  it("returns null for consumer content outside the block that only echoes it", () => {
    write(".agents/rules.md", `# consumer intro\n\n${block}\n## Project Rules\n\n${rows}\n`);
    write("docs/testing.md", "# our testing doc\n");
    expect(detectManagedDuplicate(tmpDir)).toBeNull();
  });
});
