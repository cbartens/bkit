// commands/install/check.integration.test.ts
//
// `bkit check` drift-gates the opencode host: a consumer weakening
// `.opencode/opencode.json` (provider block + tracker-filtered mcp + the permission
// sandbox) — or a tampered gateguard.js — fails `check`.
//
// `bkit check` takes no `--opencode=` flag; the render inputs fall back to the installed
// provider (package.json `bkit.opencodeProvider`, the authoritative signal for the opencode
// gateway whose on-disk block is keyed `opencode`) and the recorded tracker, so a clean
// install checks green across providers.
//
// Strategy (in-test dogfood): spawn the real install + check binaries against a tmpdir
// consumer. getPkgRoot resolves to THIS repo, so install renders the real sources into the
// tmpdir; check then runs read-only over them.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, afterAll, beforeAll } from "vitest";
import { findMissingOwnedHooks, detectOwnedHookMissing } from "../../checks/after/managed";
import type { ModuleFlag, CloudVariant } from "../../cli";
import { dispatchModules, type ModuleContext } from "../../install/modules/index";
import { parseModelLookup, buildOpencodeModelLookup, parseEffortMap } from "../../render/models";
import type { WriteSet } from "../../install/write";
import { getBkitDocsRoot } from "../../shared/package-roots";
import { requireTsx } from "../../../../../vitest.tsx-bin";

let tmpDir: string;
let originalCwd: string;

const getInstallPath = () =>
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
function runBkit(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(requireTsx(), [getInstallPath(), ...args], {
    cwd: tmpDir,
    encoding: "utf-8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
    timeout: 90_000,
  });
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "", status: result.status };
}

const opencodeJsonPath = () => path.join(tmpDir, ".opencode", "opencode.json");

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-check-opencode-"));
  // Minimal consumer prerequisites: package.json + a .git marker so the preflight
  // not-a-git-repo blocker is satisfied. The bkit.* manifest fields are written by install.
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "check-opencode-consumer", version: "0.0.0" }, null, 2) + "\n",
    "utf-8",
  );
  fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("#255 #8 — bkit check gates opencode drift (no false positives)", () => {
  // A clean install must check GREEN for every provider/tracker shape — proving the
  // render-input fallback uses the INSTALLED provider, not the ollama default.
  it("clean install (openrouter + github) → check exits 0, zero would-write drift", () => {
    const install = runBkit(["install", "--claude", "--opencode=openrouter", "--tracker=github"]);
    expect(install.status).toBe(0);
    expect(fs.existsSync(opencodeJsonPath())).toBe(true);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
    expect(`${check.stdout}${check.stderr}`).not.toContain("DRIFT DETECTED");
  });

  // opencode renders an `opencode`-keyed provider block, read through package.json, not the
  // opencode.json provider-block key.
  it("clean install (opencode-go gateway, opencode-go block keyed by provider) → check exits 0, no false drift", () => {
    const install = runBkit(["install", "--claude", "--opencode=opencode-go", "--tracker=github"]);
    expect(install.status).toBe(0);
    // opencode-go renders a built-in block keyed `opencode-go` — confirm the fixture exercises it.
    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as {
      provider?: Record<string, unknown>;
    };
    expect(cfg.provider?.["opencode-go"]).toBeDefined();

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // A keyless provider with tracker=none (no mcp block) must also check green.
  it("clean install (ollama, no tracker) → check exits 0, no false drift", () => {
    const install = runBkit(["install", "--opencode=opencode-go"]);
    expect(install.status).toBe(0);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // A consumer who drops the bkit permission sandbox from opencode.json FAILS check.
  it("dropped permission block in opencode.json → check exits 1 (drift detected)", () => {
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    delete cfg.permission; // consumer weakened the sandbox — bkit-owned key removed
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toContain(".opencode/opencode.json");
  });

  // gateguard.js is Tier-2 markered-text: bkit owns only the content between
  // `// bkit:start` / `// bkit:end`. Tampering INSIDE the block is drift (check must
  // fail); tampering OUTSIDE it is the consumer's own driver code (check must pass).
  it("tampered gateguard.js INSIDE the managed block → check exits 1 (drift detected)", () => {
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const gateguard = path.join(tmpDir, ".opencode", "plugin", "bkit-gateguard.js");
    const original = fs.readFileSync(gateguard, "utf-8");
    expect(original).toContain(
      'const EDIT_TOOLS = new Set(["write", "edit", "patch", "apply_patch"]);',
    );
    fs.writeFileSync(
      gateguard,
      original.replace(
        'const EDIT_TOOLS = new Set(["write", "edit", "patch", "apply_patch"]);',
        'const EDIT_TOOLS = new Set(["write"]);', // consumer weakened the managed block
      ),
      "utf-8",
    );

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toContain(".opencode/plugin/bkit-gateguard.js");
  });

  it("tampered gateguard.js OUTSIDE the managed block → check exits 0 (consumer-owned)", () => {
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const gateguard = path.join(tmpDir, ".opencode", "plugin", "bkit-gateguard.js");
    fs.appendFileSync(gateguard, "\n// consumer's own extra logic\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
  });

  // Host agent/command mirrors push would-writes into ws.writes — content drift (marker
  // still current) must fail check, not only managed-version-marker stale.
  it("tampered agent mirror content → check exits 1 (writeset drift)", () => {
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const agentFile = fs.readdirSync(agentDir).find((f) => f.endsWith(".md"));
    expect(agentFile).toBeDefined();
    fs.appendFileSync(path.join(agentDir, agentFile!), "\n<!-- consumer tampered -->\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toMatch(/write\(s\) would occur|DRIFT DETECTED/);
  });

  // An adding-extra-keys edit is NOT drift: opencode.json is Tier-2 deep-contained, so a
  // consumer's own extra keys are theirs to keep. (Locks in the deep-contain contract so a
  // future over-eager gate doesn't start failing on benign consumer additions.)
  it("consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift)", () => {
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    cfg.theme = "consumer-custom-theme"; // a key bkit does not own
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // No default provider. `bkit check` / `bkit upgrade` take no `--opencode=` flag and read
  // what the consumer installed; a repo carrying .opencode/ with no recorded provider is
  // reported as a broken install, never rendered against a substitute.
  it("opencode installed but no provider recorded → check exits 1 and names the fix", () => {
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    // Erase both provider signals: the package.json manifest field and the opencode.json block.
    const pkgPath = path.join(tmpDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
      bkit?: { opencodeProvider?: unknown; opencodeProviders?: unknown };
    };
    delete pkg.bkit?.opencodeProvider;
    delete pkg.bkit?.opencodeProviders;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    delete cfg.provider;
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    const combined = `${check.stdout}${check.stderr}`;
    expect(combined).toMatch(/no provider is recorded/);
    expect(combined).toMatch(/bkit install --opencode=<provider>/);
    // The message must list the real allowlist so the fix is actionable.
    expect(combined).toMatch(/openrouter, ollama, opencode-zen, opencode-go/);
  });

  it("a consumer with no opencode host at all is not failed for a missing provider", () => {
    expect(runBkit(["install", "--claude", "--tracker=github"]).status).toBe(0);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(`${check.stdout}${check.stderr}`).not.toMatch(/no provider is recorded/);
  });
});

// ---------------------------------------------------------------------------
// Antigravity stays detected without its plugin manifest: `bkit check` reports the missing
// `plugin.json`, a weakened `hooks.json` and a missing hook file, and `bkit status` still
// lists the host.
// ---------------------------------------------------------------------------

describe("bkit check — antigravity detected from any plugin file", () => {
  const plugin = (rel: string) => path.join(tmpDir, ".agents", "plugins", "bkit", rel);

  it("deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each", () => {
    expect(runBkit(["install", "--antigravity"]).status).toBe(0);
    expect(runBkit(["check"]).status).toBe(0);

    fs.rmSync(plugin("plugin.json"));
    const manifestOnly = runBkit(["check"]);
    expect(manifestOnly.status).toBe(1);
    expect(manifestOnly.stdout).toContain(".agents/plugins/bkit/plugin.json");
    const status = runBkit(["status"]);
    expect(status.stdout).toMatch(/antigravity: INSTALLED/);

    type HookGroup = { hooks: { command: string }[] };
    const hooksDoc = JSON.parse(fs.readFileSync(plugin("hooks.json"), "utf-8")) as {
      hooks: { PreToolUse: HookGroup[] };
    };
    const rail = hooksDoc.hooks.PreToolUse.flatMap((g) => g.hooks).find((h) =>
      h.command.includes("bkit-guardrails.cjs"),
    );
    expect(rail).toBeDefined();
    rail!.command = "true";
    fs.writeFileSync(plugin("hooks.json"), JSON.stringify(hooksDoc, null, 2) + "\n");
    fs.rmSync(plugin("hooks/bkit-guardrails.cjs"));
    const check = runBkit(["check"]);
    const out = `${check.stdout}${check.stderr}`;
    expect(check.status).toBe(1);
    expect(out).toContain(".agents/plugins/bkit/plugin.json");
    expect(out).toContain(".agents/plugins/bkit/hooks.json");
    expect(out).toContain("check: .agents/plugins/bkit/hooks/bkit-guardrails.cjs is missing");
  }, 180_000);
});

// ---------------------------------------------------------------------------
// check-owned-hooks
// ---------------------------------------------------------------------------
// check-owned-hooks — `bkit check` fails on a missing owned hook
//
// The claude and codex hook commands are `test -f <file> && node <file> || true`. `bkit check`
// exits 1 and names a missing file.
// The required set follows what is installed: the hook files of each detected host, plus
// `.claude/hooks/bkit-cloud-bootstrap.sh` only when `bkit.cloudAgents` is `claude`.
//
// Strategy: unit-test findMissingOwnedHooks against hand-built trees, then spawn the real
// install + check binaries against a tmpdir consumer for the exit code and message.
describe("check-owned-hooks", () => {
  const getInstallPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
  function runBkit(cwd: string, args: string[]): { combined: string; status: number | null } {
    const result = spawnSync(requireTsx(), [getInstallPath(), ...args], {
      cwd,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
    return { combined: `${result.stdout ?? ""}\n${result.stderr ?? ""}`, status: result.status };
  }

  function makeConsumer(prefix: string, bkitField?: Record<string, unknown>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "owned-hooks-consumer", version: "0.0.0", bkit: bkitField }, null, 2),
    );
    fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
    return dir;
  }

  function touch(dir: string, rel: string): void {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), "");
  }

  describe("findMissingOwnedHooks", () => {
    let dir: string;
    beforeEach(() => {
      dir = makeConsumer("bkit-owned-hooks-unit-");
    });
    afterEach(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    const paths = (modules: ModuleFlag[]) =>
      findMissingOwnedHooks(dir, new Set<ModuleFlag>(["core", ...modules])).map((h) => h.path);

    it("requires the hook files of each installed host, and only those", () => {
      expect(paths(["claude"]).sort()).toEqual([
        ".claude/hooks/bkit-gateguard.cjs",
        ".claude/hooks/bkit-guardrails.cjs",
        ".claude/hooks/bkit-preflight.sh",
        ".claude/hooks/bkit-readguard.cjs",
      ]);
      expect(paths(["cursor"]).sort()).toEqual([
        ".cursor/hooks/bkit-gateguard.cjs",
        ".cursor/hooks/bkit-guardrails.cjs",
        ".cursor/hooks/bkit-preflight.sh",
        ".cursor/hooks/bkit-readguard.cjs",
      ]);
      expect(paths(["codex"]).sort()).toEqual([
        ".codex/hooks/bkit-gateguard.cjs",
        ".codex/hooks/bkit-guardrails.cjs",
        ".codex/hooks/bkit-readguard.cjs",
      ]);
      expect(paths(["opencode"]).sort()).toEqual([
        ".opencode/plugin/bkit-gateguard.js",
        ".opencode/plugin/bkit-readguard.js",
      ]);
    });

    it("a host that is not installed is not required", () => {
      expect(paths([])).toEqual([]);
      expect(paths(["claude"]).some((p) => p.startsWith(".codex/"))).toBe(false);
    });

    it("present files are not reported", () => {
      touch(dir, ".codex/hooks/bkit-gateguard.cjs");
      touch(dir, ".codex/hooks/bkit-guardrails.cjs");
      touch(dir, ".codex/hooks/bkit-readguard.cjs");
      expect(paths(["codex"])).toEqual([]);
    });

    it("never requires bkit-cloud-bootstrap.sh — it is a copy-and-own template", () => {
      // The `.claude/settings.json` SessionStart entry references bkit-cloud-bootstrap.sh
      // guarded (`test -f … || true`), but the script ships as a template: no module
      // writes it, so a missing copy is the consumer's choice, never a check failure.
      touch(dir, ".claude/settings.json");
      for (const cloudAgents of ["cursor", "claude"]) {
        fs.writeFileSync(
          path.join(dir, "package.json"),
          JSON.stringify({ name: "x", bkit: { cloudAgents } }),
        );
        expect(findMissingOwnedHooks(dir, new Set<ModuleFlag>(["core"]))).toEqual([]);
      }
    });

    it("detectOwnedHookMissing is a blocker naming every missing file, null when none", () => {
      expect(detectOwnedHookMissing([])).toBeNull();
      const finding = detectOwnedHookMissing(
        findMissingOwnedHooks(dir, new Set<ModuleFlag>(["core", "opencode"])),
      );
      expect(finding?.severity).toBe("blocker");
      expect(finding?.detect).toContain(".opencode/plugin/bkit-gateguard.js");
    });
  });

  describe("bkit check — exit code on a missing owned hook", () => {
    let dir: string;

    beforeAll(() => {
      dir = makeConsumer("bkit-owned-hooks-check-");
      const install = runBkit(dir, [
        "install",
        "--claude",
        "--cursor",
        "--codex",
        "--opencode=openrouter",
        "--tracker=github",
        "--auto=claude",
      ]);
      expect(install.status, install.combined).toBe(0);
    }, 120_000);

    afterAll(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    it("clean install → check exits 0", () => {
      const check = runBkit(dir, ["check"]);
      expect(check.status, check.combined).toBe(0);
      expect(check.combined).not.toContain("owned-hook-missing");
    });

    it.each([
      ".claude/hooks/bkit-guardrails.cjs",
      ".cursor/hooks/bkit-gateguard.cjs",
      ".codex/hooks/bkit-guardrails.cjs",
      ".opencode/plugin/bkit-gateguard.js",
    ])("missing %s → check exits 1 and names it", (rel) => {
      const abs = path.join(dir, rel);
      const saved = fs.readFileSync(abs);
      fs.rmSync(abs);
      try {
        const check = runBkit(dir, ["check"]);
        expect(check.status, check.combined).toBe(1);
        expect(check.combined).toContain(`check: ${rel} is missing`);
      } finally {
        fs.writeFileSync(abs, saved);
      }
    });

    it("claude host without the cloud module → no bkit-cloud-bootstrap.sh required", () => {
      const claudeOnly = makeConsumer("bkit-owned-hooks-claude-");
      try {
        expect(runBkit(claudeOnly, ["install", "--claude"]).status).toBe(0);
        expect(fs.existsSync(path.join(claudeOnly, ".claude/hooks/bkit-cloud-bootstrap.sh"))).toBe(
          false,
        );
        const check = runBkit(claudeOnly, ["check"]);
        expect(check.status, check.combined).toBe(0);
      } finally {
        fs.rmSync(claudeOnly, { recursive: true, force: true });
      }
    });
  });
});

// ---------------------------------------------------------------------------
// dry-run-parity
// ---------------------------------------------------------------------------

describe("dry-run-parity", () => {
  // ---------------------------------------------------------------------------
  // Dry-run parity — `bkit check --<module>` writeset ≡ `bkit install --<module>`
  //
  // Parity is a property of the SINGLE install mechanism (the module dispatch +
  // tier writers). Both modes run the same code with `dryRun` toggled; the only
  // difference is whether bytes hit disk. We assert path-set equality between the
  // two runs against identical starting state (a fresh tmpdir each time).
  //
  // Per-file tier rules are covered by writeTier2 in install/write.test.ts, and
  // parity by the cross-module checks below.
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

  // Paths a module applied to the repo, leaving out the `.bkit/templates/` copies core makes.
  const applied = (paths: string[]) =>
    paths.filter((p) => !p.startsWith(path.join(".bkit", "templates") + path.sep));

  function makeModuleCtx(dryRun: boolean, ws: WriteSet): ModuleContext {
    return {
      dryRun,
      tokens: {
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

  runParityCheck(new Set(["core", "claude"]), "claude");
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
      const writtenPaths = applied(installPaths);
      // cloud=claude writes no files: bkit-cloud-bootstrap.sh, the workflow and the Cursor
      // Background Agent files are all copy-and-own templates.
      expect(writtenPaths.some((p) => p.includes("bkit-cloud-bootstrap.sh"))).toBe(false);
      expect(
        writtenPaths.some((p) => p === path.join(".github", "workflows", "bkit-cloud.yml")),
      ).toBe(false);
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
      const writtenPaths = applied(installPaths);
      // cloud=cursor writes no files: .cursor/Dockerfile + environment.json are templates
      expect(writtenPaths).not.toContain(path.join(".cursor", "Dockerfile"));
      expect(writtenPaths).not.toContain(path.join(".cursor", "environment.json"));
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
      const writtenPaths = applied(installPaths);
      // cloud=opencode writes no files: the cloud workflow is a template
      expect(writtenPaths.some((p) => p.includes("bkit-cloud-bootstrap.sh"))).toBe(false);
      expect(writtenPaths).not.toContain(path.join(".github", "workflows", "bkit-cloud.yml"));
    });
  });

  // ---------------------------------------------------------------------------
  // --opencode dry-run parity (Task 2.2 "Done when" — bkit-dry-run-parity)
  // ---------------------------------------------------------------------------

  describe("check ≡ install writeset parity — --opencode=opencode-go (Task 2.2)", () => {
    const PROMPTS_MD = path.join(getBkitDocsRoot(), "prompts.md");
    const CATALOG_MODEL_LOOKUP = parseModelLookup(PROMPTS_MD);
    const OPENCODE_MODEL_LOOKUP = buildOpencodeModelLookup(PROMPTS_MD, "opencode-zen");
    const EFFORT_MAP = parseEffortMap(PROMPTS_MD);

    function makeOpencodeModuleCtx(dryRun: boolean, ws: WriteSet): ModuleContext {
      return {
        dryRun,
        tokens: {
          DEFAULT_BRANCH: "main",
          PROJECT_NAME: "test-project",
          REPO_SLUG: "acme/test-project",
        },
        modelLookup: CATALOG_MODEL_LOOKUP,
        opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
        effortMap: EFFORT_MAP,
        opencodeProvider: "ollama",
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

      // The tier-writer paths for opencode are opencode.json (Tier-2) and
      // bkit-gateguard.js (Tier-1)
      expect(installPaths.some((p) => p === path.join(".opencode", "opencode.json"))).toBe(true);
      expect(
        installPaths.some((p) => p === path.join(".opencode", "plugin", "bkit-gateguard.js")),
      ).toBe(true);
    });
  });
});

describe("Scenario 4 — stale consumer prompts.md tolerated on upgrade", () => {
  it("bkit check with stale consumer prompts.md does not emit Missing model lookup", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    // Mark as a git repo to satisfy not-git-repo blocker (--core requires it).
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    // Stale consumer .agents/prompts.md — empty Models table (the worst-case
    // version of the v0.4.x → v0.5.0 skew that triggered the original bug).
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "prompts.md"),
      "# Stale\n\n## Models\n\n| Name | Cursor model | Claude model |\n| --- | --- | --- |\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );

    const result = spawnSync(requireTsx(), [bkitInstallPath, "check"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 30_000,
    });

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined).not.toContain("Missing model lookup");
    // Positive signal that the binary reached dispatch (past parse).
    expect(combined).toMatch(/\[bkit-(check|install)\]/);
  });
});

// ---------------------------------------------------------------------------
// Scenario: managed-version marker gate, branch-scoped
// `bkit check` hard-fails (exit 1) on main/dev when a stamped file's (here a rendered
// mirror's) managed-version marker is older than the installing bkit version. On a feature
// branch the same drift is a NON-blocking advisory — see isOnProtectedBranch.
// ---------------------------------------------------------------------------

describe("Scenario: bkit check stale-marker gate is branch-scoped (#256)", () => {
  // Build a scratch consumer with one old claude mirror marker (the
  // installing version under tsx is the repo's package.json version, far newer)
  // and run `bkit check`, forcing the effective branch via GH Actions env.
  // Returns null when tsx is unavailable (skip).
  function runStaleCheck(branchEnv: Record<string, string>): {
    combined: string;
    status: number | null;
  } {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-foo.md"),
      "---\nname: bkit-foo\n---\n<!-- bkit:managed v0.0.1 — do not edit; run `bkit upgrade` to refresh -->\n\nbody\n",
    );

    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "../../cli.ts");

    // Force the branch deterministically: clear any ambient CI branch env first.
    const env: NodeJS.ProcessEnv = { ...process.env, NODE_NO_WARNINGS: "1" };
    delete env.GITHUB_BASE_REF;
    delete env.GITHUB_REF_NAME;
    Object.assign(env, branchEnv);

    const result = spawnSync(requireTsx(), [bkitInstallPath, "check"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env,
      timeout: 60_000,
    });
    return { combined: `${result.stdout ?? ""}\n${result.stderr ?? ""}`, status: result.status };
  }

  it("on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER", () => {
    const r = runStaleCheck({ GITHUB_REF_NAME: "main" });
    expect(r.combined, r.combined).toContain("[blocker] bkit-managed-stale");
    expect(r.combined).toContain("bkit-managed files are stale (managed-version marker drift)");
    expect(r.status, `expected exit 1, got ${r.status}:\n${r.combined}`).toBe(1);
  });

  it("on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line", () => {
    const r = runStaleCheck({ GITHUB_REF_NAME: "feat/296-file-upload" });
    expect(r.combined, r.combined).toContain("[advisory] bkit-managed-stale");
    expect(r.combined).toContain("non-blocking on this feature branch");
    // The blocker-only stderr drift line is gated on severity===blocker, so it must
    // NOT appear here even though other writes may still flag generic drift.
    expect(r.combined).not.toContain("bkit-managed files are stale (managed-version marker drift)");
  });
});
