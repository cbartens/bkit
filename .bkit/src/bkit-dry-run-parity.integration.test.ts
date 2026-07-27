import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dispatchModules, type ModuleContext } from "./bkit-modules";
import { parseModelLookup, parseOpencodeModelLookup, parseEffortMap } from "./bkit-install";
import type { WriteSet } from "./bkit-tiers";
import type { ModuleFlag, CloudVariant } from "./bkit-cli";

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
  fs.mkdirSync(path.join(tmpDir, ".bkit", "templates"), { recursive: true });
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
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
    advisories: [],
    ws,
    logPrefix: dryRun ? "[bkit-check]" : "[bkit-install]",
    postDispatch: [],
    issueTracker: "none",
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
// Cloud variant parity: dry-run path-set must match install path-set for each variant
// ---------------------------------------------------------------------------

function makeCloudModuleCtx(
  dryRun: boolean,
  ws: WriteSet,
  cloudVariant: CloudVariant,
): ModuleContext {
  return {
    dryRun,
    tokens: {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "acme/test-project",
    },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
    advisories: [],
    ws,
    logPrefix: dryRun ? "[bkit-check]" : "[bkit-install]",
    postDispatch: [],
    issueTracker: cloudVariant === "cursor" ? "linear" : "github",
    cloudVariant,
  };
}

describe("check ≡ install writeset parity — cloud=claude (dry-run parity, T1.10)", () => {
  it("check --cloud=claude writeset ≡ install --cloud=claude writeset", () => {
    const cwd = process.cwd();

    const wsCheck = { writes: [] } as WriteSet;
    dispatchModules(new Set(["core", "cloud"]), makeCloudModuleCtx(true, wsCheck, "claude"));
    const checkPaths = wsCheck.writes.map((e) => path.relative(cwd, e.path)).sort();

    const wsInstall = { writes: [] } as WriteSet;
    dispatchModules(new Set(["core", "cloud"]), makeCloudModuleCtx(false, wsInstall, "claude"));
    const installPaths = wsInstall.writes.map((e) => path.relative(cwd, e.path)).sort();

    expect(checkPaths).toEqual(installPaths);
    // cloud=claude ships bkit-cloud.yml + cloud-bootstrap.sh (not .cursor/*)
    expect(installPaths.some((p) => p.includes("bkit-cloud.yml"))).toBe(true);
    expect(installPaths.some((p) => p.includes("cloud-bootstrap.sh"))).toBe(true);
    expect(installPaths.some((p) => p.includes("Dockerfile"))).toBe(false);
  });
});

describe("check ≡ install writeset parity — cloud=cursor (dry-run parity, T1.10)", () => {
  it("check --cloud=cursor writeset ≡ install --cloud=cursor writeset", () => {
    const cwd = process.cwd();

    const wsCheck = { writes: [] } as WriteSet;
    dispatchModules(new Set(["core", "cloud"]), makeCloudModuleCtx(true, wsCheck, "cursor"));
    const checkPaths = wsCheck.writes.map((e) => path.relative(cwd, e.path)).sort();

    const wsInstall = { writes: [] } as WriteSet;
    dispatchModules(new Set(["core", "cloud"]), makeCloudModuleCtx(false, wsInstall, "cursor"));
    const installPaths = wsInstall.writes.map((e) => path.relative(cwd, e.path)).sort();

    expect(checkPaths).toEqual(installPaths);
    // cloud=cursor ships .cursor/Dockerfile + .cursor/environment.json (not bkit-cloud.yml)
    expect(installPaths.some((p) => p.includes("Dockerfile"))).toBe(true);
    expect(installPaths.some((p) => p.includes("environment.json"))).toBe(true);
    expect(installPaths.some((p) => p.includes("bkit-cloud.yml"))).toBe(false);
  });
});

describe("check ≡ install writeset parity — cloud=opencode (dry-run parity, #245)", () => {
  it("check --cloud=opencode writeset ≡ install --cloud=opencode writeset", () => {
    const cwd = process.cwd();

    const wsCheck = { writes: [] } as WriteSet;
    dispatchModules(new Set(["core", "cloud"]), makeCloudModuleCtx(true, wsCheck, "opencode"));
    const checkPaths = wsCheck.writes.map((e) => path.relative(cwd, e.path)).sort();

    const wsInstall = { writes: [] } as WriteSet;
    dispatchModules(new Set(["core", "cloud"]), makeCloudModuleCtx(false, wsInstall, "opencode"));
    const installPaths = wsInstall.writes.map((e) => path.relative(cwd, e.path)).sort();

    expect(checkPaths).toEqual(installPaths);
    // cloud=opencode ships bkit-cloud.yml only (no bootstrap.sh, no cursor files)
    expect(installPaths.some((p) => p.includes("bkit-cloud.yml"))).toBe(true);
    expect(installPaths.some((p) => p.includes("cloud-bootstrap.sh"))).toBe(false);
    expect(installPaths.some((p) => p.includes("Dockerfile"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MED-8 — runPayload WriteSet threading (DEFERRED placeholder)
// ---------------------------------------------------------------------------

it.todo(
  "MED-8: WriteSet records core/payload writes once copyAdditive+runPayload are merged — see docs/pending.md MED-8",
);

// ---------------------------------------------------------------------------
// --opencode dry-run parity (Task 2.2 "Done when" — bkit-dry-run-parity)
// ---------------------------------------------------------------------------

describe("check ≡ install writeset parity — --opencode=ollama-local (Task 2.2)", () => {
  const PROMPTS_MD = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "..",
    "prompts.md",
  );
  const CATALOG_MODEL_LOOKUP = parseModelLookup(PROMPTS_MD);
  const OPENCODE_MODEL_LOOKUP = parseOpencodeModelLookup(PROMPTS_MD);
  const EFFORT_MAP = parseEffortMap(PROMPTS_MD);

  function makeOpencodeModuleCtx(dryRun: boolean, ws: WriteSet): ModuleContext {
    return {
      dryRun,
      tokens: {
        NODE_VERSION: "22",
        DEFAULT_BRANCH: "main",
        PROJECT_NAME: "test-project",
        REPO_SLUG: "acme/test-project",
      },
      modelLookup: CATALOG_MODEL_LOOKUP,
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      effortMap: EFFORT_MAP,
      opencodeProvider: "ollama-local",
      advisories: [],
      ws,
      logPrefix: dryRun ? "[bkit-check]" : "[bkit-install]",
      postDispatch: [],
      issueTracker: "none",
    };
  }

  it("check --opencode writeset ≡ install --opencode writeset (tier-writer path-set equality)", () => {
    const cwd = process.cwd();

    // dry-run (check mode)
    const wsCheck = { writes: [] } as WriteSet;
    dispatchModules(new Set(["opencode"]), makeOpencodeModuleCtx(true, wsCheck));
    const checkPaths = wsCheck.writes.map((e) => path.relative(cwd, e.path)).sort();

    // live-run (install mode) — same starting state since dry-run didn't write anything
    const wsInstall = { writes: [] } as WriteSet;
    dispatchModules(new Set(["opencode"]), makeOpencodeModuleCtx(false, wsInstall));
    const installPaths = wsInstall.writes.map((e) => path.relative(cwd, e.path)).sort();

    // Both modes must predict/write exactly the same set of tier-writer + mirror paths.
    // Host agent/command mirrors push would-writes into ws.writes so `bkit check` exits 1
    // on content drift (same path-set on dry-run and install).
    expect(checkPaths).toEqual(installPaths);

    // The tier-writer paths for opencode are opencode.json (Tier-2) and gateguard.js (Tier-1)
    expect(installPaths.some((p) => p === path.join(".opencode", "opencode.json"))).toBe(true);
    expect(installPaths.some((p) => p === path.join(".opencode", "plugin", "gateguard.js"))).toBe(
      true,
    );
  });
});
