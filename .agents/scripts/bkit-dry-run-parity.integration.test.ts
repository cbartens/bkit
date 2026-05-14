import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runTemplates, type WriteSet } from "./bkit-install";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-parity-test-"));
  process.chdir(tmpDir);
  fs.mkdirSync(path.join(tmpDir, ".agents", "templates"), { recursive: true });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Root-cause comment (Reviewer 2 C1 investigation):
// The 14-vs-15 mismatch surfaced in a consumer repo was caused by runTemplates rule 3a
// (append-block path). In dry-run mode, the append-block branch DID write the
// entry to `writes++` BEFORE the `continue`, so the count was correct. However
// the WriteSet accumulator (introduced in v4-2) must track the *path* of each
// predicted write, not just the count, so that `check` and `install` produce
// the same set of { path, action } entries. The regression test below pins this
// by asserting path-set equality, not just count equality.
//
// After investigation: runTemplates already increments writes++ in rule 3a
// before continue (lines 425-443 of original). The parity fix in v4-2 surfaces
// the shared WriteSet accumulator so both paths populate an identical record,
// enabling path-level comparison rather than just count comparison.
// ---------------------------------------------------------------------------

describe("Dry-run parity — check writeset ≡ install writeset", () => {
  it("rule 1 (dest missing): dry-run and live run report same path", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "templates", "README.md"),
      "# Template content\n",
      "utf-8",
    );

    const checkResult = runTemplates(true);
    // Reset: no dest should exist yet (dry-run didn't write)
    const installResult = runTemplates(false);

    expect(checkResult.writes).toBe(installResult.writes);
    expect(checkResult.writeSet.map((e) => e.path).sort()).toEqual(
      installResult.writeSet.map((e) => e.path).sort(),
    );
  });

  it("rule 3a (dest no markers, template has block): dry-run predicts append correctly — 14-vs-15 regression", () => {
    // This is the specific regression scenario surfaced in a consumer repo:
    // .gitignore exists with consumer entries, template has a bkit block.
    // Both dry-run AND live-run should report the same writeset entry.
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "templates", "gitignore"),
      "# bkit:start\nnode_modules/\n# bkit:end\n",
      "utf-8",
    );
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), "# Project ignores\n.env\n", "utf-8");

    const checkResult = runTemplates(true);
    expect(checkResult.writes).toBe(1);

    // Now reset the .gitignore to original state and do a live run
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), "# Project ignores\n.env\n", "utf-8");
    const installResult = runTemplates(false);
    expect(installResult.writes).toBe(1);

    // Path-level equality
    expect(checkResult.writeSet.map((e) => e.path).sort()).toEqual(
      installResult.writeSet.map((e) => e.path).sort(),
    );
  });

  it("rule 2 (dest has markers, block differs): both runs predict same update", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "templates", "CLAUDE.md"),
      "<!-- bkit:start -->\nnew content\n<!-- bkit:end -->\n",
      "utf-8",
    );
    fs.writeFileSync(
      path.join(tmpDir, "CLAUDE.md"),
      "# Header\n<!-- bkit:start -->\nold content\n<!-- bkit:end -->\n",
      "utf-8",
    );

    const checkResult = runTemplates(true);
    expect(checkResult.writes).toBe(1);

    // Reset dest to original for live run
    fs.writeFileSync(
      path.join(tmpDir, "CLAUDE.md"),
      "# Header\n<!-- bkit:start -->\nold content\n<!-- bkit:end -->\n",
      "utf-8",
    );
    const installResult = runTemplates(false);
    expect(installResult.writes).toBe(1);

    expect(checkResult.writeSet.map((e) => e.path).sort()).toEqual(
      installResult.writeSet.map((e) => e.path).sort(),
    );
  });

  it("multiple-file scenario: all paths match between check and install runs", () => {
    // Setup: 3 templates, various states
    // Template 1: dest missing (rule 1)
    fs.writeFileSync(path.join(tmpDir, ".agents", "templates", "AGENTS.md"), "# Agents\n", "utf-8");

    // Template 2: dest has markers (rule 2 — block differs)
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "templates", "CLAUDE.md"),
      "<!-- bkit:start -->\nnew block\n<!-- bkit:end -->\n",
      "utf-8",
    );
    fs.writeFileSync(
      path.join(tmpDir, "CLAUDE.md"),
      "<!-- bkit:start -->\nold block\n<!-- bkit:end -->\n",
      "utf-8",
    );

    // Template 3: dest no markers, template has block (rule 3a)
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "templates", "gitignore"),
      "# bkit:start\nnode_modules/\n# bkit:end\n",
      "utf-8",
    );
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), "# consumer entries\n", "utf-8");

    const checkResult = runTemplates(true);
    expect(checkResult.writes).toBe(3);

    // Reset mutable dests to original state for live run
    fs.rmSync(path.join(tmpDir, "AGENTS.md"), { force: true });
    fs.writeFileSync(
      path.join(tmpDir, "CLAUDE.md"),
      "<!-- bkit:start -->\nold block\n<!-- bkit:end -->\n",
      "utf-8",
    );
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), "# consumer entries\n", "utf-8");

    const installResult = runTemplates(false);
    expect(installResult.writes).toBe(3);

    expect(checkResult.writeSet.map((e) => e.path).sort()).toEqual(
      installResult.writeSet.map((e) => e.path).sort(),
    );
  });
});

// ---------------------------------------------------------------------------
// Cross-module dry-run parity — promoted in v4-3 Phase 4
//
// These tests verify that `bkit check --<module>` produces the same writeset
// as `bkit install --<module>` by running both dispatchModules calls against
// identical starting state (fresh tmpdir each time) and comparing relative paths.
// ---------------------------------------------------------------------------

import { dispatchModules, type ModuleContext } from "./bkit-modules";
import type { ModuleFlag } from "./bkit-cli";

function makeModuleCtx(dryRun: boolean, ws: WriteSet): ModuleContext {
  return {
    dryRun,
    tokens: {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
    },
    modelLookup: new Map(),
    advisories: [],
    ws,
    logPrefix: dryRun ? "[bkit-check]" : "[bkit-install]",
    postDispatch: [],
  };
}

function runParityCheck(modules: Set<ModuleFlag>, testLabel: string): void {
  describe(`check ≡ install writeset parity — ${testLabel} (cross-module parity, v4-3)`, () => {
    it(`check --${testLabel} writeset ≡ install --${testLabel} writeset`, () => {
      // Capture cwd before dispatch (it changes inside modules)
      const cwd = process.cwd();

      // dry-run (check mode)
      const wsCheck = { writes: [] } as WriteSet;
      dispatchModules(modules, makeModuleCtx(true, wsCheck));
      const checkPaths = wsCheck.writes.map((e) => path.relative(cwd, e.path)).sort();

      // live-run (install mode) — same starting state since dry-run didn't write anything
      const wsInstall = { writes: [] } as WriteSet;
      dispatchModules(modules, makeModuleCtx(false, wsInstall));
      const installPaths = wsInstall.writes.map((e) => path.relative(cwd, e.path)).sort();

      // Both modes must predict/write exactly the same set of paths
      expect(checkPaths).toEqual(installPaths);
    });
  });
}

runParityCheck(new Set(["core", "ci"]), "ci");
runParityCheck(new Set(["core", "claude"]), "claude");
runParityCheck(new Set(["core", "lint"]), "lint");
runParityCheck(new Set(["core", "git-hooks"]), "git-hooks");
runParityCheck(new Set(["core"]), "core");

// ---------------------------------------------------------------------------
// MED-8 — runPayload WriteSet threading (DEFERRED placeholder)
// ---------------------------------------------------------------------------

it.todo(
  "MED-8: WriteSet records core/payload writes once copyAdditive+runPayload are merged — see docs/pending.md MED-8",
);
