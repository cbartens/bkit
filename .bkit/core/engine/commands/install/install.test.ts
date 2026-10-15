import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  discardAllStaging,
  STAGING_ROOT,
  detectOpencodeProvider,
  detectOpencodeProviders,
  modulesToCliFlags,
  validateCloudTrackerMatch,
  getInstallingVersion,
  refreshPreflightAfterWrites,
} from "./install";
import type { ModuleFlag } from "../../cli";
import type { IssueTracker } from "../../install/manifest";

// ---------------------------------------------------------------------------
// Staging scratch area
// ---------------------------------------------------------------------------

describe("discardAllStaging", () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-staging-test-"));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes the entire STAGING_ROOT", () => {
    const stagingRoot = path.join(tmpDir, STAGING_ROOT);
    fs.mkdirSync(path.join(stagingRoot, "core"), { recursive: true });
    fs.mkdirSync(path.join(stagingRoot, "claude"), { recursive: true });
    fs.writeFileSync(path.join(stagingRoot, "core", "test.md"), "x");
    discardAllStaging(tmpDir);
    expect(fs.existsSync(stagingRoot)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// LOG_PREFIX on dry-run blocker banner
// ---------------------------------------------------------------------------

describe("B5 — LOG_PREFIX on blocker banner (source-level verification)", () => {
  it("commands/install/install.ts emits LOG_PREFIX before the blocker banner on preflight exit", () => {
    // Source-level check: the source contains the LOG_PREFIX-prefixed log before the
    // formatChecklist(blockers) call.
    const src = fs.readFileSync(".bkit/core/engine/commands/install/install.ts", "utf-8");
    // Must contain LOG_PREFIX annotation before formatChecklist(blockers)
    expect(src).toContain("LOG_PREFIX} Preflight blockers detected");
    // LOG_PREFIX line must appear before the formatChecklist(blockers) call
    const prefixIdx = src.indexOf("LOG_PREFIX} Preflight blockers detected");
    const checklistIdx = src.indexOf("formatChecklist(blockers)");
    expect(prefixIdx).toBeLessThan(checklistIdx);
  });
});

describe("modulesToCliFlags — resolved module set → recovery-hint CLI flags", () => {
  const flags = (
    mods: ModuleFlag[],
    provider: string | null = null,
    cloud: "claude" | "cursor" | "opencode" | null = null,
  ) => modulesToCliFlags(new Set<ModuleFlag>(mods), provider, cloud);

  it("emits nothing for a core-only set (core is implicit)", () => {
    expect(flags(["core"])).toBe("");
  });

  it("maps host modules to their flags", () => {
    expect(flags(["core", "claude"])).toBe("--claude");
    expect(flags(["core", "cursor"])).toBe("--cursor");
  });

  it("renders --opencode with the resolved provider, or a placeholder when unknown", () => {
    expect(flags(["opencode"], "openrouter")).toBe("--opencode=openrouter");
    expect(flags(["opencode"], null)).toBe("--opencode=<provider>");
  });

  it("maps the cloud opt-in (placeholder when the variant is unknown)", () => {
    expect(flags(["cloud"], null, "cursor")).toBe("--auto=cursor");
    expect(flags(["cloud"], null, null)).toBe("--auto=<variant>");
  });

  it("composes multiple modules in flag order", () => {
    expect(flags(["core", "claude", "cursor", "cloud"], null, "claude")).toBe(
      "--claude --cursor --auto=claude",
    );
  });
});

describe("validateCloudTrackerMatch — FINAL SCOPE decision 3/4 symmetric cloud/tracker constraint", () => {
  it("passes when no cloud variant is set", () => {
    expect(validateCloudTrackerMatch(null, true, "github")).toBeNull();
  });

  it("passes when the cloud module isn't in the install set, even with a variant", () => {
    expect(validateCloudTrackerMatch("claude", false, "linear")).toBeNull();
  });

  it("passes when cloud=claude and tracker=github (matching)", () => {
    expect(validateCloudTrackerMatch("claude", true, "github")).toBeNull();
  });

  it("passes when cloud=opencode and tracker=github (matching)", () => {
    expect(validateCloudTrackerMatch("opencode", true, "github")).toBeNull();
  });

  it("passes when cloud=cursor and tracker=linear (matching)", () => {
    expect(validateCloudTrackerMatch("cursor", true, "linear")).toBeNull();
  });

  it("errors when cloud=claude but tracker is not github", () => {
    const err = validateCloudTrackerMatch("claude", true, "linear");
    expect(err).not.toBeNull();
    expect(err).toContain("--auto=claude requires tracker=github");
  });

  it("errors when cloud=cursor but tracker is not linear", () => {
    const err = validateCloudTrackerMatch("cursor", true, "github");
    expect(err).not.toBeNull();
    expect(err).toContain("--auto=cursor requires tracker=linear");
  });

  it("suggests setting the tracker (not switching) when the tracker is still 'none' (default)", () => {
    const err = validateCloudTrackerMatch("cursor", true, "none" as IssueTracker);
    expect(err).toContain("Set the tracker first");
  });

  it("suggests re-running with the matching tracker when a different tracker is already set", () => {
    const err = validateCloudTrackerMatch("claude", true, "linear" as IssueTracker);
    expect(err).toContain("tracker switching is free");
  });
});

describe("detectOpencodeProvider — provider resolution (manifest-first)", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-provider-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const writePkg = (bkit: unknown) =>
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ bkit }), "utf-8");
  const writeOpencodeJson = (obj: unknown) => {
    fs.mkdirSync(path.join(cwd, ".opencode"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".opencode", "opencode.json"), JSON.stringify(obj), "utf-8");
  };

  it("returns null when neither package.json nor opencode.json exists", () => {
    expect(detectOpencodeProvider(cwd)).toBeNull();
  });

  it("reads a valid bkit.opencodeProvider from package.json", () => {
    writePkg({ opencodeProvider: "openrouter" });
    expect(detectOpencodeProvider(cwd)).toBe("openrouter");
  });

  it("rejects a provider key outside the allowlist (zen is not opencode-zen)", () => {
    writePkg({ opencodeProvider: "zen" });
    expect(detectOpencodeProvider(cwd)).toBeNull();
  });

  it("maps Zen's opencode.json block key `opencode` to opencode-zen", () => {
    writePkg({});
    writeOpencodeJson({ provider: { opencode: {} } });
    expect(detectOpencodeProvider(cwd)).toBe("opencode-zen");
  });

  it("ignores an out-of-allowlist provider and falls through to null", () => {
    writePkg({ opencodeProvider: "gpt-9" });
    expect(detectOpencodeProvider(cwd)).toBeNull();
  });

  it("falls back to the first opencode.json provider key when the manifest is silent", () => {
    writePkg({});
    writeOpencodeJson({ provider: { openrouter: {} } });
    expect(detectOpencodeProvider(cwd)).toBe("openrouter");
  });

  it("returns null on an unparseable package.json with no opencode.json", () => {
    fs.writeFileSync(path.join(cwd, "package.json"), "{ not json", "utf-8");
    expect(detectOpencodeProvider(cwd)).toBeNull();
  });
});

describe("detectOpencodeProviders — all installed providers", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-providers-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const writePkg = (bkit: unknown) =>
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ bkit }), "utf-8");

  it("returns [] when package.json is absent", () => {
    expect(detectOpencodeProviders(cwd)).toEqual([]);
  });

  it("reads and allowlist-filters bkit.opencodeProviders", () => {
    writePkg({ opencodeProviders: ["openrouter", "zen", "opencode-zen", "bogus"] });
    expect(detectOpencodeProviders(cwd)).toEqual(["openrouter", "opencode-zen"]);
  });

  it("returns [] when bkit.opencodeProviders is absent, whatever bkit.opencodeProvider says", () => {
    writePkg({ opencodeProvider: "openrouter" });
    expect(detectOpencodeProviders(cwd)).toEqual([]);
  });
});

describe("getInstallingVersion — bkit's own version, best-effort", () => {
  it("returns the semver from the installing package.json", () => {
    expect(getInstallingVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("refreshPreflightAfterWrites — post-write preflight re-check", () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-refresh-"));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns a blocker that only appears after the writes", () => {
    fs.mkdirSync(path.join(dir, ".git"));
    fs.writeFileSync(path.join(dir, "package.json"), '{"name":"x"}');
    const modules = new Set<ModuleFlag>(["claude"]);
    const before = refreshPreflightAfterWrites(modules, dir, undefined, 0, []);
    expect(before.blockers).toEqual([]);

    fs.writeFileSync(path.join(dir, "package.json"), "{ not json");
    const after = refreshPreflightAfterWrites(modules, dir, undefined, 0, []);
    expect(after.blockers.length).toBeGreaterThan(0);
    expect(after.blockers.every((f) => f.severity === "blocker")).toBe(true);
  });

  it("keeps module advisories pushed during dispatch and replaces the Phase 1 seeds", () => {
    fs.mkdirSync(path.join(dir, ".git"));
    fs.writeFileSync(path.join(dir, "package.json"), '{"name":"x"}');
    const seed = { id: "seed", severity: "advisory" } as never;
    const moduleAdvisory = { id: "from-module", severity: "advisory" } as never;
    const r = refreshPreflightAfterWrites(new Set<ModuleFlag>(["claude"]), dir, undefined, 1, [
      seed,
      moduleAdvisory,
    ]);
    const ids = r.advisories.map((f) => f.id);
    expect(ids).toContain("from-module");
    expect(ids).not.toContain("seed");
  });
});
