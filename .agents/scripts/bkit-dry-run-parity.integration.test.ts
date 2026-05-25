import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dispatchModules, type ModuleContext } from "./bkit-modules";
import type { WriteSet } from "./bkit-tiers";
import type { ModuleFlag } from "./bkit-cli";

// ---------------------------------------------------------------------------
// Dry-run parity — `bkit check --<module>` writeset ≡ `bkit install --<module>`
//
// Parity is a property of the SINGLE install mechanism (the module dispatch +
// tier writers). Both modes run the same code with `dryRun` toggled; the only
// difference is whether bytes hit disk. We assert path-set equality between the
// two runs against identical starting state (a fresh tmpdir each time).
//
// (The legacy `runTemplates` parity tests were removed when that dead second
// mechanism was deleted — its per-file rules are now covered by writeTier2 in
// bkit-tiers.test.ts, and parity by the cross-module checks below.)
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

function makeModuleCtx(dryRun: boolean, ws: WriteSet): ModuleContext {
  return {
    dryRun,
    tokens: {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "acme/test-project",
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
