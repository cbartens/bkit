// cli.test.ts — CLI dispatch surface (module flags + comply/telemetry verbs).
// Surface: install requires ≥1 module flag (guard lives in main(), not parseArgs);
// core implicit; --auto is the cloud flag;
// the internal module names (--core, --lint, --cloud) are unknown flags.
// comply verb: --phase=<design|plan|build|debug|ship>.
// telemetry verb: `bkit telemetry summary`.

import { describe, expect, it, vi } from "vitest";
import {
  parseArgs,
  printUsage,
  resolveModules,
  parseComplyPhase,
  COMPLY_PHASES,
  parseTelemetrySubverb,
  TELEMETRY_SUBVERBS,
  type ModuleFlag,
  validateModuleFlagsForVerb,
} from "./cli";
import type { Verb } from "./cli";

/** Run `fn`, asserting it triggers process.exit(1); returns the joined console.error text. */
function expectExit(fn: () => void): string {
  const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
    throw new Error("process.exit called");
  });
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    expect(fn).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    return errorSpy.mock.calls.map((c) => c[0]).join(" ");
  } finally {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  }
}

// ---------------------------------------------------------------------------
// parseArgs — verb parsing
// ---------------------------------------------------------------------------

describe("parseArgs — verb parsing", () => {
  it("install verb is parsed correctly", () => {
    expect(parseArgs(["install", "--claude"]).verb).toBe("install");
  });

  it("check verb is parsed correctly", () => {
    expect(parseArgs(["check"]).verb).toBe("check");
  });

  it("upgrade verb is parsed correctly", () => {
    expect(parseArgs(["upgrade"]).verb).toBe("upgrade");
  });

  it("help verb is parsed correctly", () => {
    expect(parseArgs(["help"]).verb).toBe("help");
  });

  it("--help flag is parsed as help verb", () => {
    expect(parseArgs(["--help"]).verb).toBe("help");
  });

  it("-h flag is parsed as help verb", () => {
    expect(parseArgs(["-h"]).verb).toBe("help");
  });

  it("no args defaults to help", () => {
    expect(parseArgs([]).verb).toBe("help");
  });

  it("doctor verb is parsed correctly", () => {
    expect(parseArgs(["doctor"]).verb).toBe("doctor");
  });
});

// ---------------------------------------------------------------------------
// parseArgs — module flags
// ---------------------------------------------------------------------------

describe("parseArgs — module flags", () => {
  it("--claude → claude + implicit core; recorded in moduleFlags", () => {
    const result = parseArgs(["install", "--claude"]);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("core")).toBe(true); // implicit
    expect(result.moduleFlags.has("claude")).toBe(true);
  });

  it("--cursor → cursor + implicit core", () => {
    const result = parseArgs(["install", "--cursor"]);
    expect([...result.modules].sort()).toEqual(["core", "cursor"]);
    expect(result.moduleFlags.has("cursor")).toBe(true);
  });

  it("hosts compose: --claude --cursor --codex → every named host + core", () => {
    const result = parseArgs(["install", "--claude", "--cursor", "--codex"]);
    expect([...result.modules].sort()).toEqual(["claude", "codex", "core", "cursor"]);
  });

  it("bare `install` records zero module flags (the ≥1 guard lives in main())", () => {
    const result = parseArgs(["install"]);
    expect(result.verb).toBe("install");
    expect(result.moduleFlags.size).toBe(0);
    // resolveModules still adds implicit core; main() rejects the empty case.
    expect([...result.modules]).toEqual(["core"]);
  });

  it("--auto=claude → cloud + core only; cloudVariant=claude", () => {
    const result = parseArgs(["install", "--auto=claude"]);
    expect([...result.modules].sort()).toEqual(["cloud", "core"]);
    expect(result.cloudVariant).toBe("claude");
    expect(result.moduleFlags.has("cloud")).toBe(true);
  });

  it("--auto=cursor → cloud + core only; cloudVariant=cursor", () => {
    const result = parseArgs(["install", "--auto=cursor"]);
    expect([...result.modules].sort()).toEqual(["cloud", "core"]);
    expect(result.cloudVariant).toBe("cursor");
  });

  it("bare --auto (install) → error (variant required)", () => {
    const msg = expectExit(() => parseArgs(["install", "--auto"]));
    expect(msg).toMatch(/--auto requires an explicit variant/);
  });

  it("--auto=<bad> → rejected", () => {
    const msg = expectExit(() => parseArgs(["install", "--auto=banana"]));
    expect(msg).toMatch(/Unknown cloud variant/);
  });

  it("parseArgs returns resolved modules as a Set", () => {
    const result = parseArgs(["install", "--claude"]);
    expect(result.modules).toBeInstanceOf(Set);
    expect([...result.modules].sort()).toEqual(["claude", "core"]);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — unknown flags error
// ---------------------------------------------------------------------------

describe("parseArgs — internal module names are not flags", () => {
  for (const flag of ["--core", "--lint", "--cloud", "--cloud=claude", "--typescript"]) {
    it(`${flag} → Unknown flag`, () => {
      const msg = expectExit(() => parseArgs(["install", flag]));
      expect(msg).toMatch(/Unknown flag/);
    });
  }

  it("uninstall --typescript → Unknown flag (the retired lint module's flag)", () => {
    const msg = expectExit(() => parseArgs(["uninstall", "--typescript"]));
    expect(msg).toMatch(/Unknown flag/);
  });
});

// ---------------------------------------------------------------------------
// Host composition
// ---------------------------------------------------------------------------

describe("parseArgs — host composition", () => {
  it("install --claude --codex composes with hosts", () => {
    const result = parseArgs(["install", "--claude", "--codex"]);
    expect([...result.modules].sort()).toEqual(["claude", "codex", "core"]);
  });

  it("uninstall --codex → {codex} only (targeted, core preserved)", () => {
    const result = parseArgs(["uninstall", "--codex"]);
    expect([...result.modules]).toEqual(["codex"]);
  });
});

// ---------------------------------------------------------------------------
// resolveModules — verb-aware matrix
// ---------------------------------------------------------------------------

describe("resolveModules — verb-aware resolution", () => {
  const set = (...m: ModuleFlag[]) => new Set<ModuleFlag>(m);

  it("install: named modules + implicit core", () => {
    expect([...resolveModules(set("claude"), "install")].sort()).toEqual(["claude", "core"]);
    expect([...resolveModules(set("codex"), "install")].sort()).toEqual(["codex", "core"]);
  });

  it("install: empty flags → core only (main() guards the empty case)", () => {
    expect([...resolveModules(set(), "install")]).toEqual(["core"]);
  });

  it("uninstall (bare): every module incl. opt-ins + core (zero footprint)", () => {
    const all = resolveModules(set(), "uninstall");
    for (const m of ["core", "claude", "cursor", "cloud", "opencode", "codex"] as ModuleFlag[]) {
      expect(all.has(m), `bare uninstall should include ${m}`).toBe(true);
    }
  });

  it("uninstall (targeted): named modules ONLY — core is NOT added", () => {
    expect([...resolveModules(set("claude"), "uninstall")]).toEqual(["claude"]);
    expect([...resolveModules(set("codex"), "uninstall")]).toEqual(["codex"]);
    expect([...resolveModules(set("cloud"), "uninstall")]).toEqual(["cloud"]);
  });

  it("check/upgrade: core implicit + named (main() rejects stray module flags)", () => {
    expect([...resolveModules(set(), "check")]).toEqual(["core"]);
    expect([...resolveModules(set(), "upgrade")]).toEqual(["core"]);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — unknown flag / verb rejection
// ---------------------------------------------------------------------------

describe("parseArgs — unknown flag / verb rejection", () => {
  it("unknown flag --foo → exit 1", () => {
    expect(expectExit(() => parseArgs(["install", "--foo"]))).toMatch(/Unknown flag/);
  });

  it("unknown verb → exit 1", () => {
    expect(expectExit(() => parseArgs(["deploy"]))).toMatch(/Unknown verb/);
  });

  it("`bkit codex` is not a verb", () => {
    expect(expectExit(() => parseArgs(["codex"]))).toMatch(/Unknown verb/);
  });
});

// ---------------------------------------------------------------------------
// printUsage — help output
// ---------------------------------------------------------------------------

describe("printUsage — help output", () => {
  function usage(): string {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      expect(logSpy).toHaveBeenCalledTimes(1);
      return logSpy.mock.calls[0]?.[0] as string;
    } finally {
      logSpy.mockRestore();
    }
  }

  it("lists the new module flags", () => {
    const output = usage();
    expect(output).toContain("--claude");
    expect(output).toContain("--cursor");
    expect(output).toContain("--opencode=");
    expect(output).toContain("renovate.json5");
    expect(output).toContain("dependabot.yml");
    expect(output).toContain("--auto=");
  });

  it("documents compose + core examples", () => {
    const output = usage();
    expect(output).toContain("--claude --cursor");
    expect(output).toMatch(/[Cc]ore \(implicit/);
  });

  it("lists opencode-zen and opencode-go (not bare opencode) as supported providers", () => {
    const output = usage();
    expect(output).toContain("opencode-zen");
    expect(output).toContain("opencode-go");
    // The single-gateway help phrase must be absent.
    expect(output).not.toContain("opencode (opencode-native gateway");
  });

  it("documents install requires ≥1 module flag", () => {
    expect(usage()).toMatch(/at least one module flag is REQUIRED/i);
  });

  it("includes doctor, status, uninstall verbs + uninstall flags", () => {
    const output = usage();
    expect(output).toContain("doctor");
    expect(output).toContain("status");
    expect(output).toContain("uninstall");
    expect(output).toContain("--dry-run");
    expect(output).toContain("--nuke");
  });

  it("documents the --auto-apply upgrade flag", () => {
    expect(usage()).toContain("--auto-apply");
  });
});

// ---------------------------------------------------------------------------
// parseArgs — uninstall verb
// ---------------------------------------------------------------------------

describe("parseArgs — uninstall verb", () => {
  it("uninstall verb is parsed correctly", () => {
    expect(parseArgs(["uninstall"]).verb).toBe("uninstall");
  });

  it("bare uninstall → all modules incl. opt-in add-ons + core (zero footprint)", () => {
    const result = parseArgs(["uninstall"]);
    for (const m of ["core", "claude", "cursor", "cloud", "opencode", "codex"] as ModuleFlag[]) {
      expect(result.modules.has(m), `bare uninstall should include ${m}`).toBe(true);
    }
  });

  it("uninstall --claude → claude ONLY (no core)", () => {
    const result = parseArgs(["uninstall", "--claude"]);
    expect([...result.modules]).toEqual(["claude"]);
  });

  it("uninstall --auto (bare) → cloud only; no variant needed", () => {
    const result = parseArgs(["uninstall", "--auto"]);
    expect([...result.modules]).toEqual(["cloud"]);
    expect(result.cloudVariant).toBeNull();
  });

  it("uninstall --dry-run sets dryRun flag", () => {
    expect(parseArgs(["uninstall", "--dry-run"]).uninstallFlags.dryRun).toBe(true);
  });

  it("uninstall --force sets force flag", () => {
    expect(parseArgs(["uninstall", "--force"]).uninstallFlags.force).toBe(true);
  });

  it("uninstall --nuke sets nuke flag", () => {
    expect(parseArgs(["uninstall", "--nuke"]).uninstallFlags.nuke).toBe(true);
  });

  it("uninstall --yes sets yes flag", () => {
    expect(parseArgs(["uninstall", "--yes"]).uninstallFlags.yes).toBe(true);
  });

  it("uninstall --nuke --yes --force compose correctly", () => {
    const result = parseArgs(["uninstall", "--nuke", "--yes", "--force"]);
    expect(result.uninstallFlags.nuke).toBe(true);
    expect(result.uninstallFlags.yes).toBe(true);
    expect(result.uninstallFlags.force).toBe(true);
  });

  it("uninstall flags default to false when not specified", () => {
    const { uninstallFlags } = parseArgs(["uninstall"]);
    expect(uninstallFlags.dryRun).toBe(false);
    expect(uninstallFlags.force).toBe(false);
    expect(uninstallFlags.nuke).toBe(false);
    expect(uninstallFlags.yes).toBe(false);
  });

  it("install --auto-revert sets autoRevert flag", () => {
    expect(parseArgs(["install", "--claude", "--auto-revert"]).uninstallFlags.autoRevert).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// parseArgs — upgrade flags
// ---------------------------------------------------------------------------

describe("parseArgs — upgrade flags", () => {
  it("--auto-apply sets the non-interactive upgrade mode", () => {
    expect(parseArgs(["upgrade", "--auto-apply"]).upgradeFlags.nonInteractive).toBe(true);
  });

  it("--dry-run sets the upgrade dry-run mode", () => {
    expect(parseArgs(["upgrade", "--dry-run"]).upgradeFlags.dryRun).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — --opencode flag
// ---------------------------------------------------------------------------

describe("parseArgs — --opencode flag", () => {
  it("--opencode=opencode-go → opencode + core; provider recorded", () => {
    const result = parseArgs(["install", "--opencode=opencode-go"]);
    expect([...result.modules].sort()).toEqual(["core", "opencode"]);
    expect(result.opencodeProvider).toBe("opencode-go");
    expect(result.moduleFlags.has("opencode")).toBe(true);
  });

  it("--opencode=openrouter → opencode + core, provider=openrouter (#245 named provider)", () => {
    const result = parseArgs(["install", "--opencode=openrouter"]);
    expect(result.modules.has("opencode")).toBe(true);
    expect(result.opencodeProvider).toBe("openrouter");
  });

  it("--opencode=gemini → rejected (still descoped — not in the strict allowlist)", () => {
    expect(expectExit(() => parseArgs(["install", "--opencode=gemini"]))).toMatch(
      /unsupported provider/,
    );
  });

  it("bare --opencode (no value) on install is rejected — provider required", () => {
    expect(expectExit(() => parseArgs(["install", "--opencode"]))).toMatch(
      /--opencode requires an explicit provider/,
    );
  });

  it("--claude --opencode=opencode-go compose", () => {
    const result = parseArgs(["install", "--claude", "--opencode=opencode-go"]);
    expect([...result.modules].sort()).toEqual(["claude", "core", "opencode"]);
    expect(result.opencodeProvider).toBe("opencode-go");
  });

  it("opencode is NOT installed implicitly (additive opt-in)", () => {
    expect(parseArgs(["install", "--claude"]).modules.has("opencode")).toBe(false);
  });

  it("uninstall --opencode (bare) → opencode only (no provider needed)", () => {
    const result = parseArgs(["uninstall", "--opencode"]);
    expect([...result.modules]).toEqual(["opencode"]);
    expect(result.opencodeProvider).toBeNull();
  });

  it("bare uninstall reaches opencode (full opt-in removal)", () => {
    expect(parseArgs(["uninstall"]).modules.has("opencode")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — --opencode provider strict allowlist (OPENCODE_PROVIDERS)
// ---------------------------------------------------------------------------

describe("parseArgs — --opencode provider strict allowlist", () => {
  // The full allowlist — openrouter + ollama (npm driver) and both opencode gateways.
  const accepted = ["openrouter", "ollama"] as const;
  for (const value of accepted) {
    it(`--opencode=${value} is accepted`, () => {
      expect(parseArgs(["install", `--opencode=${value}`]).opencodeProvider).toBe(value);
    });
  }

  // opencode-native gateways — two providers `opencode-zen` + `opencode-go`, both auth via
  // BKIT_OPENCODE_API_KEY; render path is the npm-driver custom-provider format (explicit baseURL).
  it("--opencode=opencode-zen is accepted", () => {
    expect(parseArgs(["install", "--opencode=opencode-zen"]).opencodeProvider).toBe("opencode-zen");
  });
  it("--opencode=opencode-go is accepted", () => {
    expect(parseArgs(["install", "--opencode=opencode-go"]).opencodeProvider).toBe("opencode-go");
  });

  const rejected: Array<[string, string]> = [
    ["gemini", "still descoped — not added in #245"],
    ["openai", "well-formed but unsupported (Codex CLI lane, #247)"],
    ["anthropic", "well-formed but unsupported"],
    ["my-provider", "arbitrary user slug — no generic fallback"],
    ["ollama-cloud", "near-miss (cloud key is the bare `ollama`)"],
    ["MY_PROVIDER", "uppercase"],
    ["provider with spaces", "spaces"],
    ["x$y", "special character"],
    ["1openrouter", "starts with digit"],
    ["opencode", "not a provider key (Zen is opencode-zen)"],
    ["zen", "not a provider key (Zen is opencode-zen)"],
    ["go", "not a provider key (Go is opencode-go)"],
  ];
  for (const [value, why] of rejected) {
    it(`--opencode=${value} → rejected (${why})`, () => {
      expect(expectExit(() => parseArgs(["install", `--opencode=${value}`]))).toMatch(
        /unsupported provider/,
      );
    });
  }

  it("--opencode= (empty value after equals) → 'requires a provider value'", () => {
    expect(expectExit(() => parseArgs(["install", "--opencode="]))).toMatch(
      /requires a provider value/,
    );
  });
});

// ---------------------------------------------------------------------------
// parseArgs — status verb
// ---------------------------------------------------------------------------

describe("parseArgs — status verb", () => {
  it("status verb is parsed correctly", () => {
    expect(parseArgs(["status"]).verb).toBe("status");
  });
});

// ---------------------------------------------------------------------------
// parseArgs — launcher verbs (cursor / opencode)
// ---------------------------------------------------------------------------

describe("parseArgs — launcher verbs", () => {
  it("cursor verb is parsed correctly", () => {
    expect(parseArgs(["cursor"]).verb).toBe("cursor");
  });

  it("opencode verb (launcher) is parsed correctly", () => {
    expect(parseArgs(["opencode"]).verb).toBe("opencode");
  });

  it("cursor with no flags → empty moduleFlags", () => {
    const result = parseArgs(["cursor"]);
    expect(result.moduleFlags.size).toBe(0);
  });

  it("opencode with no flags → empty moduleFlags", () => {
    const result = parseArgs(["opencode"]);
    expect(result.moduleFlags.size).toBe(0);
  });

  it("cursor with a flag → exit 1 (no flags allowed)", () => {
    const msg = expectExit(() => parseArgs(["cursor", "--claude"]));
    expect(msg).toMatch(/takes no flags/);
  });

  it("opencode with a flag → exit 1 (no flags allowed)", () => {
    const msg = expectExit(() => parseArgs(["opencode", "--openrouter"]));
    expect(msg).toMatch(/takes no flags/);
  });
});

describe("printUsage — launcher verbs in help text", () => {
  function usage(): string {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      return logSpy.mock.calls[0]?.[0] as string;
    } finally {
      logSpy.mockRestore();
    }
  }

  it("documents bkit cursor", () => {
    expect(usage()).toContain("bkit cursor");
  });

  it("documents bkit opencode as a launcher", () => {
    const output = usage();
    // Distinct from --opencode= module flag — checks that the launcher verb appears
    expect(output).toMatch(/bkit opencode\s/);
  });

  it("documents BKIT_CURSOR_BIN override", () => {
    expect(usage()).toContain("BKIT_CURSOR_BIN");
  });

  it("documents BKIT_OPENCODE_BIN override", () => {
    expect(usage()).toContain("BKIT_OPENCODE_BIN");
  });

  it("mentions launchctl fallback", () => {
    expect(usage()).toContain("launchctl");
  });
});

describe("printUsage — status + opencode in help text", () => {
  function usage(): string {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      return logSpy.mock.calls[0]?.[0] as string;
    } finally {
      logSpy.mockRestore();
    }
  }

  it("lists bkit status as read-only / writes-nothing", () => {
    const output = usage();
    expect(output).toContain("status");
    expect(output).toMatch(
      /status.*[Rr]ead-only|[Rr]ead-only.*status|Writes nothing.*status|status.*Writes nothing/s,
    );
  });

  it("describes opencode as additive + provider-required", () => {
    const output = usage();
    expect(output).toMatch(/opencode/i);
    expect(output).toMatch(/additive/i);
    expect(output).toMatch(/REQUIRED|required/);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — upgrade self-bump flags (--to=<version> / --latest)
// ---------------------------------------------------------------------------

describe("parseArgs — upgrade --to/--latest", () => {
  it("parses --to=<version> on upgrade", () => {
    const r = parseArgs(["upgrade", "--to=4.2.0"]);
    expect(r.verb).toBe("upgrade");
    expect(r.upgradeFlags.toVersion).toBe("4.2.0");
    expect(r.upgradeFlags.latest).toBe(false);
  });

  it("parses --latest on upgrade", () => {
    const r = parseArgs(["upgrade", "--latest"]);
    expect(r.upgradeFlags.latest).toBe(true);
    expect(r.upgradeFlags.toVersion).toBeNull();
  });

  it("defaults to no self-bump on a bare upgrade", () => {
    const r = parseArgs(["upgrade"]);
    expect(r.upgradeFlags.toVersion).toBeNull();
    expect(r.upgradeFlags.latest).toBe(false);
  });

  it("rejects --to=<version> on a non-upgrade verb (e.g. check)", () => {
    const msg = expectExit(() => parseArgs(["check", "--to=4.2.0"]));
    expect(msg).toContain("only valid for `bkit upgrade`");
  });

  it("rejects --latest on install", () => {
    const msg = expectExit(() => parseArgs(["install", "--claude", "--latest"]));
    expect(msg).toContain("only valid for `bkit upgrade`");
  });

  it("rejects --to and --latest together (mutually exclusive)", () => {
    const msg = expectExit(() => parseArgs(["upgrade", "--to=4.2.0", "--latest"]));
    expect(msg).toContain("mutually exclusive");
  });

  it("rejects an empty --to= value", () => {
    const msg = expectExit(() => parseArgs(["upgrade", "--to="]));
    expect(msg).toContain("requires a version value");
  });
});

// ---------------------------------------------------------------------------
// parseArgs — comply verb + --phase flag
// ---------------------------------------------------------------------------

describe("parseArgs — comply verb", () => {
  it("comply verb is parsed correctly", () => {
    expect(parseArgs(["comply", "--phase=ship"]).verb).toBe("comply");
  });

  it("comply --phase=ship parses to {verb:'comply', complyPhase:'ship'}", () => {
    const result = parseArgs(["comply", "--phase=ship"]);
    expect(result.verb).toBe("comply");
    expect(result.complyPhase).toBe("ship");
  });

  it("comply --phase=design parses correctly", () => {
    const result = parseArgs(["comply", "--phase=design"]);
    expect(result.complyPhase).toBe("design");
  });

  it("comply --phase=plan parses correctly", () => {
    expect(parseArgs(["comply", "--phase=plan"]).complyPhase).toBe("plan");
  });

  it("comply --phase=build parses correctly", () => {
    expect(parseArgs(["comply", "--phase=build"]).complyPhase).toBe("build");
  });

  it("comply --phase=debug parses correctly", () => {
    expect(parseArgs(["comply", "--phase=debug"]).complyPhase).toBe("debug");
  });

  it("comply --phase=<unknown> exits cleanly with exit 1", () => {
    const msg = expectExit(() => parseArgs(["comply", "--phase=deploy"]));
    expect(msg).toMatch(/Unknown phase/);
  });

  it("bare --phase (no value) exits with error", () => {
    const msg = expectExit(() => parseArgs(["comply", "--phase"]));
    expect(msg).toMatch(/--phase requires a value/);
  });

  it("--phase on non-comply verb exits with error", () => {
    const msg = expectExit(() => parseArgs(["install", "--claude", "--phase=ship"]));
    expect(msg).toMatch(/--phase is only valid with the .comply. and .telemetry. verbs/);
  });

  it("complyPhase is null for non-comply verbs", () => {
    expect(parseArgs(["install", "--claude"]).complyPhase).toBeNull();
    expect(parseArgs(["check"]).complyPhase).toBeNull();
  });

  it("complyPhase is null for comply with no --phase (missing phase)", () => {
    // parseArgs itself does not require --phase on comply (main() can enforce that).
    expect(parseArgs(["comply"]).complyPhase).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseComplyPhase helper
// ---------------------------------------------------------------------------

describe("parseComplyPhase", () => {
  it("accepts all valid phases", () => {
    for (const phase of COMPLY_PHASES) {
      expect(parseComplyPhase(phase)).toBe(phase);
    }
  });

  it("returns null for unknown phase", () => {
    expect(parseComplyPhase("deploy")).toBeNull();
  });

  it("returns null for non-string input", () => {
    expect(parseComplyPhase(null)).toBeNull();
    expect(parseComplyPhase(undefined)).toBeNull();
    expect(parseComplyPhase(42)).toBeNull();
  });

  it("COMPLY_PHASES contains exactly 5 phases", () => {
    expect(COMPLY_PHASES).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// printUsage — comply verb in help text
// ---------------------------------------------------------------------------

describe("printUsage — comply verb in help text", () => {
  function usage(): string {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      return logSpy.mock.calls[0]?.[0] as string;
    } finally {
      logSpy.mockRestore();
    }
  }

  it("documents bkit comply --phase=<phase>", () => {
    expect(usage()).toContain("comply");
  });

  it("documents --phase= in help output", () => {
    expect(usage()).toContain("--phase");
  });

  it("documents that comply is advisory / never gates", () => {
    const output = usage();
    expect(output).toMatch(/[Aa]dvisory|never gate/);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — harvest verb
// ---------------------------------------------------------------------------

describe("parseArgs — harvest verb (WS4-T5)", () => {
  it("harvest verb is parsed correctly", () => {
    expect(parseArgs(["harvest"]).verb).toBe("harvest");
  });

  it("harvest verb sets no module flags", () => {
    const result = parseArgs(["harvest"]);
    expect(result.moduleFlags.size).toBe(0);
  });

  it("harvest verb sets complyPhase to null", () => {
    expect(parseArgs(["harvest"]).complyPhase).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseArgs — analysis verb
// ---------------------------------------------------------------------------

describe("parseArgs — analysis verb (WS4-T5)", () => {
  it("analysis verb is parsed correctly", () => {
    expect(parseArgs(["analysis"]).verb).toBe("analysis");
  });

  it("analysis verb sets no module flags", () => {
    const result = parseArgs(["analysis"]);
    expect(result.moduleFlags.size).toBe(0);
  });

  it("analysis verb sets complyPhase to null", () => {
    expect(parseArgs(["analysis"]).complyPhase).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// printUsage — harvest + analysis verbs in help text (WS4-T5)
// ---------------------------------------------------------------------------

describe("printUsage — harvest + analysis verbs in help text (WS4-T5)", () => {
  function usage(): string {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      return logSpy.mock.calls[0]?.[0] as string;
    } finally {
      logSpy.mockRestore();
    }
  }

  it("documents bkit harvest", () => {
    expect(usage()).toContain("harvest");
  });

  it("documents bkit analysis", () => {
    expect(usage()).toContain("analysis");
  });

  it("documents that harvest never writes to consumer repos", () => {
    // The help text may span lines; use a combined check for key terms
    const text = usage();
    expect(text).toMatch(/harvest/);
    expect(text).toMatch(/[Nn]ever/);
    expect(text).toMatch(/consumer/);
  });
});

// ---------------------------------------------------------------------------
// telemetry verb — `bkit telemetry summary`
// ---------------------------------------------------------------------------

describe("parseArgs — telemetry verb", () => {
  it("telemetry summary → verb=telemetry, telemetrySubverb=summary", () => {
    const result = parseArgs(["telemetry", "summary"]);
    expect(result.verb).toBe("telemetry");
    expect(result.telemetrySubverb).toBe("summary");
  });

  it("telemetry with no sub-verb → exit(1)", () => {
    expectExit(() => parseArgs(["telemetry"]));
  });

  it("telemetry with unknown sub-verb → exit(1)", () => {
    const errText = expectExit(() => parseArgs(["telemetry", "unknown-verb"]));
    expect(errText).toMatch(/unknown telemetry sub-verb/i);
  });

  for (const removed of ["migrate", "validate", "normalise"]) {
    it(`telemetry ${removed} is an unknown sub-verb → exit(1)`, () => {
      expectExit(() => parseArgs(["telemetry", removed]));
    });
  }
});

describe("parseTelemetrySubverb", () => {
  it("summary → TelemetrySubverb", () => {
    expect(parseTelemetrySubverb("summary")).toBe("summary");
  });

  it("unknown → null", () => {
    expect(parseTelemetrySubverb("unknown")).toBeNull();
  });

  it("null → null", () => {
    expect(parseTelemetrySubverb(null)).toBeNull();
  });

  it("TELEMETRY_SUBVERBS is exactly summary", () => {
    expect([...TELEMETRY_SUBVERBS]).toEqual(["summary"]);
  });
});

describe("validateModuleFlagsForVerb — #252 Step 2/3 verb/module-flag validation", () => {
  const flags = (mods: ModuleFlag[] = []) => new Set<ModuleFlag>(mods);

  it("errors when install is given zero module flags", () => {
    const err = validateModuleFlagsForVerb("install", flags());
    expect(err).not.toBeNull();
    expect(err).toContain("`bkit install` requires at least one module flag");
  });

  it("passes when install is given at least one module flag", () => {
    expect(validateModuleFlagsForVerb("install", flags(["claude"]))).toBeNull();
  });

  it("errors when check is given a module flag", () => {
    const err = validateModuleFlagsForVerb("check", flags(["claude"]));
    expect(err).not.toBeNull();
    expect(err).toContain("`bkit check` takes no module flags");
  });

  it("errors when upgrade is given a module flag", () => {
    const err = validateModuleFlagsForVerb("upgrade", flags(["cursor"]));
    expect(err).not.toBeNull();
    expect(err).toContain("`bkit upgrade` takes no module flags");
  });

  it("passes when check/upgrade are given zero module flags", () => {
    expect(validateModuleFlagsForVerb("check", flags())).toBeNull();
    expect(validateModuleFlagsForVerb("upgrade", flags())).toBeNull();
  });

  it("does not constrain other verbs (uninstall, doctor, help, ...)", () => {
    const otherVerbs: Verb[] = ["uninstall", "doctor", "help", "status", "harvest"];
    for (const verb of otherVerbs) {
      expect(validateModuleFlagsForVerb(verb, flags())).toBeNull();
      expect(validateModuleFlagsForVerb(verb, flags(["claude", "cursor"]))).toBeNull();
    }
  });
});
