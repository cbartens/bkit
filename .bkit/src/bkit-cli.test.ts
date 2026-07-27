// bkit-cli.test.ts — CLI dispatch surface (#252 redesign + #234 comply/telemetry verbs).
// Surface: install requires ≥1 module flag (guard lives in main(), not parseArgs);
// core implicit; --tooling expands to ci/lint/git-hooks; --auto replaces --cloud;
// --dependency= replaces bare --renovate/--dependabot; --full/--core dropped.
// comply verb: --phase=<design|plan|build|debug|ship> (WS2-T5, #234).
// telemetry verb: `bkit telemetry migrate [--dry-run]` (WS5-T2, #234).
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
} from "./bkit-cli";

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
// parseArgs — module flags (#252 surface)
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

  it("--tooling expands to ci + lint + git-hooks (+ core)", () => {
    const result = parseArgs(["install", "--tooling"]);
    expect([...result.modules].sort()).toEqual(["ci", "core", "git-hooks", "lint"]);
    // moduleFlags carries the expanded internal names, not the literal "tooling".
    expect([...result.moduleFlags].sort()).toEqual(["ci", "git-hooks", "lint"]);
  });

  it("hosts compose: --claude --cursor --tooling → both hosts + tooling + core", () => {
    const result = parseArgs(["install", "--claude", "--cursor", "--tooling"]);
    expect([...result.modules].sort()).toEqual([
      "ci",
      "claude",
      "core",
      "cursor",
      "git-hooks",
      "lint",
    ]);
  });

  it("bare `install` records zero module flags (the ≥1 guard lives in main())", () => {
    const result = parseArgs(["install"]);
    expect(result.verb).toBe("install");
    expect(result.moduleFlags.size).toBe(0);
    // resolveModules still adds implicit core; main() rejects the empty case.
    expect([...result.modules]).toEqual(["core"]);
  });

  it("--dependency=renovate → renovate + core only", () => {
    const result = parseArgs(["install", "--dependency=renovate"]);
    expect([...result.modules].sort()).toEqual(["core", "renovate"]);
    expect(result.moduleFlags.has("renovate")).toBe(true);
  });

  it("--dependency=dependabot → dependabot + core only", () => {
    const result = parseArgs(["install", "--dependency=dependabot"]);
    expect([...result.modules].sort()).toEqual(["core", "dependabot"]);
  });

  it("--dependency=<bad> → rejected", () => {
    const msg = expectExit(() => parseArgs(["install", "--dependency=snyk"]));
    expect(msg).toMatch(/Unknown dependency updater/);
  });

  it("--claude --tooling --dependency=renovate compose", () => {
    const result = parseArgs(["install", "--claude", "--tooling", "--dependency=renovate"]);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("renovate")).toBe(true);
    expect(result.modules.has("core")).toBe(true);
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

  it("--dependency=renovate + --dependency=dependabot → mutually exclusive", () => {
    const msg = expectExit(() =>
      parseArgs(["install", "--dependency=renovate", "--dependency=dependabot"]),
    );
    expect(msg).toMatch(/mutually exclusive/);
  });

  // --renovate=<mend|self> (#325) — single flag: auto-selects the renovate module + runner.
  it("--renovate=self alone → auto-selects renovate + renovateRunner=self", () => {
    const result = parseArgs(["install", "--renovate=self"]);
    expect(result.modules.has("renovate")).toBe(true);
    expect(result.renovateRunner).toBe("self");
  });

  it("--renovate=mend alone → auto-selects renovate + renovateRunner=mend", () => {
    const result = parseArgs(["install", "--renovate=mend"]);
    expect(result.modules.has("renovate")).toBe(true);
    expect(result.renovateRunner).toBe("mend");
  });

  it("--dependency=renovate --renovate=self → renovateRunner=self (explicit, equivalent)", () => {
    const result = parseArgs(["install", "--dependency=renovate", "--renovate=self"]);
    expect(result.modules.has("renovate")).toBe(true);
    expect(result.renovateRunner).toBe("self");
  });

  it("--dependency=renovate alone → renovateRunner=null (unspecified; module defaults/preserves)", () => {
    const result = parseArgs(["install", "--dependency=renovate"]);
    expect(result.renovateRunner).toBeNull();
  });

  it("--renovate=<bad> → rejected", () => {
    const msg = expectExit(() => parseArgs(["install", "--renovate=fly"]));
    expect(msg).toMatch(/Unknown renovate runner/);
  });

  it("--dependency=dependabot --renovate=self → mutually-exclusive error (renovate auto-added)", () => {
    const msg = expectExit(() =>
      parseArgs(["install", "--dependency=dependabot", "--renovate=self"]),
    );
    expect(msg).toMatch(/mutually exclusive/);
  });

  it("parseArgs returns resolved modules as a Set", () => {
    const result = parseArgs(["install", "--claude"]);
    expect(result.modules).toBeInstanceOf(Set);
    expect([...result.modules].sort()).toEqual(["claude", "core"]);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — dropped flags now error (#252: D2/D3/D4/D7)
// ---------------------------------------------------------------------------

describe("parseArgs — dropped flags reject with generic 'Unknown flag' (S1)", () => {
  const dropped = [
    "--full",
    "--core",
    // --ci is now ACCEPTED again (#265: stack-agnostic CI foundation) — see the
    // "--ci / --typescript (#265)" describe block below.
    "--lint",
    "--git-hooks",
    "--renovate",
    "--dependabot",
    "--cloud",
    "--cloud=claude",
  ];
  for (const flag of dropped) {
    it(`${flag} → Unknown flag`, () => {
      const msg = expectExit(() => parseArgs(["install", flag]));
      expect(msg).toMatch(/Unknown flag/);
    });
  }

  it("--non-interactive → Unknown flag (renamed to --auto-apply)", () => {
    const msg = expectExit(() => parseArgs(["upgrade", "--non-interactive"]));
    expect(msg).toMatch(/Unknown flag/);
  });
});

// ---------------------------------------------------------------------------
// --ci / --typescript (#265): split of --tooling into the stack-agnostic CI
// foundation (--ci) + the opt-in Node/TS toolchain (--typescript, implies --ci).
// ---------------------------------------------------------------------------

describe("parseArgs — --ci / --typescript (#265)", () => {
  it("install --ci → {ci, core}; moduleFlags = {ci}", () => {
    const result = parseArgs(["install", "--ci"]);
    expect([...result.modules].sort()).toEqual(["ci", "core"]);
    expect([...result.moduleFlags].sort()).toEqual(["ci"]);
  });

  it("install --typescript → {ci, lint, git-hooks, core} (implies --ci)", () => {
    const result = parseArgs(["install", "--typescript"]);
    expect([...result.modules].sort()).toEqual(["ci", "core", "git-hooks", "lint"]);
  });

  it("install --typescript composes with hosts", () => {
    const result = parseArgs(["install", "--claude", "--typescript"]);
    expect([...result.modules].sort()).toEqual(["ci", "claude", "core", "git-hooks", "lint"]);
  });

  it("install --ci --typescript == install --tooling", () => {
    const split = [...parseArgs(["install", "--ci", "--typescript"]).modules].sort();
    const tooling = [...parseArgs(["install", "--tooling"]).modules].sort();
    expect(split).toEqual(tooling);
  });

  it("uninstall --typescript → {lint, git-hooks} only (keeps --ci foundation + core)", () => {
    const result = parseArgs(["uninstall", "--typescript"]);
    expect([...result.modules].sort()).toEqual(["git-hooks", "lint"]);
  });

  it("uninstall --ci → {ci} only (targeted, core preserved)", () => {
    const result = parseArgs(["uninstall", "--ci"]);
    expect([...result.modules].sort()).toEqual(["ci"]);
  });
});

// ---------------------------------------------------------------------------
// resolveModules — new verb-aware matrix (#252)
// ---------------------------------------------------------------------------

describe("resolveModules — verb-aware resolution", () => {
  const set = (...m: ModuleFlag[]) => new Set<ModuleFlag>(m);

  it("install: named modules + implicit core", () => {
    expect([...resolveModules(set("claude"), "install")].sort()).toEqual(["claude", "core"]);
    expect([...resolveModules(set("ci", "lint", "git-hooks"), "install")].sort()).toEqual([
      "ci",
      "core",
      "git-hooks",
      "lint",
    ]);
  });

  it("install: empty flags → core only (main() guards the empty case)", () => {
    expect([...resolveModules(set(), "install")]).toEqual(["core"]);
  });

  it("uninstall (bare): every module incl. opt-ins + core (zero footprint)", () => {
    const all = resolveModules(set(), "uninstall");
    for (const m of [
      "core",
      "claude",
      "cursor",
      "ci",
      "lint",
      "git-hooks",
      "renovate",
      "dependabot",
      "cloud",
      "opencode",
    ] as ModuleFlag[]) {
      expect(all.has(m), `bare uninstall should include ${m}`).toBe(true);
    }
  });

  it("uninstall (targeted): named modules ONLY — core is NOT added", () => {
    expect([...resolveModules(set("claude"), "uninstall")]).toEqual(["claude"]);
    expect([...resolveModules(set("ci", "lint", "git-hooks"), "uninstall")].sort()).toEqual([
      "ci",
      "git-hooks",
      "lint",
    ]);
    expect([...resolveModules(set("renovate"), "uninstall")]).toEqual(["renovate"]);
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

  it("retired `init` verb is rejected as unknown", () => {
    expect(expectExit(() => parseArgs(["init"]))).toMatch(/Unknown verb/);
  });

  it("retired `--host=claude` is rejected (use `--claude`)", () => {
    expect(expectExit(() => parseArgs(["install", "--host=claude"]))).toMatch(/Unknown flag/);
  });
});

// ---------------------------------------------------------------------------
// printUsage — help output (#252 surface)
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
    expect(output).toContain("--ci");
    expect(output).toContain("--typescript");
    expect(output).toContain("--tooling");
    expect(output).toContain("--dependency=");
    expect(output).toContain("--renovate=");
    expect(output).toContain("--auto=");
  });

  it("does NOT advertise the dropped flags", () => {
    const output = usage();
    // The dropped bare flags must not appear as offered options. --ci / --typescript
    // ARE advertised again (#265); only --full/--core/--lint/--git-hooks stay hidden.
    expect(output).not.toMatch(/^\s*--full\b/m);
    expect(output).not.toMatch(/^\s*--core\b/m);
    expect(output).not.toMatch(/^\s*--lint\b/m);
    expect(output).not.toMatch(/^\s*--git-hooks\b/m);
  });

  it("documents compose + core examples", () => {
    const output = usage();
    expect(output).toContain("--claude --cursor --tooling");
    expect(output).toMatch(/[Cc]ore \(implicit/);
  });

  it("lists opencode-zen and opencode-go (not bare opencode) as supported providers", () => {
    const output = usage();
    expect(output).toContain("opencode-zen");
    expect(output).toContain("opencode-go");
    // Old single-gateway help phrase must be gone.
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

  it("documents the --auto-apply upgrade flag (renamed from --non-interactive)", () => {
    const output = usage();
    expect(output).toContain("--auto-apply");
    expect(output).not.toContain("--non-interactive");
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
    for (const m of [
      "core",
      "claude",
      "cursor",
      "ci",
      "lint",
      "git-hooks",
      "renovate",
      "dependabot",
      "cloud",
      "opencode",
    ] as ModuleFlag[]) {
      expect(result.modules.has(m), `bare uninstall should include ${m}`).toBe(true);
    }
  });

  it("uninstall --tooling → ci + lint + git-hooks ONLY (targeted leaves core)", () => {
    const result = parseArgs(["uninstall", "--tooling"]);
    expect([...result.modules].sort()).toEqual(["ci", "git-hooks", "lint"]);
    expect(result.modules.has("core")).toBe(false);
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

  it("uninstall --dependency=renovate → renovate only", () => {
    const result = parseArgs(["uninstall", "--dependency=renovate"]);
    expect([...result.modules]).toEqual(["renovate"]);
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

  it("uninstall --package sets stripPackage flag", () => {
    expect(parseArgs(["uninstall", "--package"]).uninstallFlags.stripPackage).toBe(true);
  });

  it("uninstall --keep-tooling sets keepTooling flag", () => {
    expect(parseArgs(["uninstall", "--keep-tooling"]).uninstallFlags.keepTooling).toBe(true);
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
    expect(uninstallFlags.stripPackage).toBe(false);
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
  it("--opencode=ollama-local → opencode + core; provider recorded", () => {
    const result = parseArgs(["install", "--opencode=ollama-local"]);
    expect([...result.modules].sort()).toEqual(["core", "opencode"]);
    expect(result.opencodeProvider).toBe("ollama-local");
    expect(result.moduleFlags.has("opencode")).toBe(true);
  });

  it("--opencode=nvidia → opencode + core, provider=nvidia", () => {
    const result = parseArgs(["install", "--opencode=nvidia"]);
    expect(result.modules.has("opencode")).toBe(true);
    expect(result.opencodeProvider).toBe("nvidia");
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

  it("--claude --opencode=ollama-local compose", () => {
    const result = parseArgs(["install", "--claude", "--opencode=ollama-local"]);
    expect([...result.modules].sort()).toEqual(["claude", "core", "opencode"]);
    expect(result.opencodeProvider).toBe("ollama-local");
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
  it("--opencode=ollama-local is accepted", () => {
    expect(parseArgs(["install", "--opencode=ollama-local"]).opencodeProvider).toBe("ollama-local");
  });

  it("--opencode=nvidia is accepted", () => {
    expect(parseArgs(["install", "--opencode=nvidia"]).opencodeProvider).toBe("nvidia");
  });

  // #245 provider expansion — these became valid (groq/cerebras free cloud; openrouter
  // re-added as a NAMED provider, not the any-endpoint fallback; ollama = cloud Ollama).
  const accepted = ["groq", "cerebras", "openrouter", "ollama"] as const;
  for (const value of accepted) {
    it(`--opencode=${value} is accepted (#245)`, () => {
      expect(parseArgs(["install", `--opencode=${value}`]).opencodeProvider).toBe(value);
    });
  }

  // #376 — GLM (zai) + Kimi (moonshot) coding-subscription gateways.
  const codingGateways = ["zai", "moonshot"] as const;
  for (const value of codingGateways) {
    it(`--opencode=${value} is accepted (#376)`, () => {
      expect(parseArgs(["install", `--opencode=${value}`]).opencodeProvider).toBe(value);
    });
  }
  it("--opencode=glm normalises to zai (family alias, #376)", () => {
    expect(parseArgs(["install", "--opencode=glm"]).opencodeProvider).toBe("zai");
  });
  it("--opencode=kimi normalises to moonshot (family alias, #376)", () => {
    expect(parseArgs(["install", "--opencode=kimi"]).opencodeProvider).toBe("moonshot");
  });

  // opencode-native gateways — two providers `opencode-zen` + `opencode-go`, both auth via
  // OPENCODE_API_KEY; render path is the npm-driver custom-provider format (explicit baseURL).
  it("--opencode=opencode-zen is accepted", () => {
    expect(parseArgs(["install", "--opencode=opencode-zen"]).opencodeProvider).toBe("opencode-zen");
  });
  it("--opencode=opencode-go is accepted", () => {
    expect(parseArgs(["install", "--opencode=opencode-go"]).opencodeProvider).toBe("opencode-go");
  });

  // Legacy aliases: bare `opencode` + `zen` normalise to opencode-zen; `go` to opencode-go.
  it("--opencode=opencode normalises to opencode-zen (legacy alias)", () => {
    expect(parseArgs(["install", "--opencode=opencode"]).opencodeProvider).toBe("opencode-zen");
  });
  it("--opencode=zen normalises to opencode-zen (legacy alias)", () => {
    expect(parseArgs(["install", "--opencode=zen"]).opencodeProvider).toBe("opencode-zen");
  });
  it("--opencode=go normalises to opencode-go (legacy alias, #282)", () => {
    expect(parseArgs(["install", "--opencode=go"]).opencodeProvider).toBe("opencode-go");
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
    ["1nvidia", "starts with digit"],
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
    const msg = expectExit(() => parseArgs(["opencode", "--nvidia"]));
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
// parseArgs — comply verb + --phase flag (#234 WS2-T5)
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
// parseArgs — harvest verb (#234 WS4-T5)
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
// parseArgs — analysis verb (#234 WS4-T5)
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
// telemetry verb — `bkit telemetry migrate [--dry-run]` (WS5-T2, #234)
// ---------------------------------------------------------------------------

describe("parseArgs — telemetry verb", () => {
  it("telemetry migrate → verb=telemetry, telemetrySubverb=migrate", () => {
    const result = parseArgs(["telemetry", "migrate"]);
    expect(result.verb).toBe("telemetry");
    expect(result.telemetrySubverb).toBe("migrate");
  });

  it("telemetry migrate --dry-run → dryRun=true", () => {
    const result = parseArgs(["telemetry", "migrate", "--dry-run"]);
    expect(result.verb).toBe("telemetry");
    expect(result.telemetrySubverb).toBe("migrate");
    expect(result.telemetryMigrateFlags.dryRun).toBe(true);
  });

  it("telemetry migrate (no --dry-run) → dryRun=false", () => {
    const result = parseArgs(["telemetry", "migrate"]);
    expect(result.telemetryMigrateFlags.dryRun).toBe(false);
  });

  it("telemetry with no sub-verb → exit(1)", () => {
    expectExit(() => parseArgs(["telemetry"]));
  });

  it("telemetry with unknown sub-verb → exit(1)", () => {
    const errText = expectExit(() => parseArgs(["telemetry", "unknown-verb"]));
    expect(errText).toMatch(/unknown telemetry sub-verb/i);
  });
});

describe("parseTelemetrySubverb", () => {
  it("migrate → TelemetrySubverb", () => {
    expect(parseTelemetrySubverb("migrate")).toBe("migrate");
  });

  it("unknown → null", () => {
    expect(parseTelemetrySubverb("unknown")).toBeNull();
  });

  it("null → null", () => {
    expect(parseTelemetrySubverb(null)).toBeNull();
  });

  it("TELEMETRY_SUBVERBS contains migrate", () => {
    expect(TELEMETRY_SUBVERBS).toContain("migrate");
  });
});

describe("printUsage — telemetry migrate in help text (WS5-T2)", () => {
  function usage(): string {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      return logSpy.mock.calls[0]?.[0] as string;
    } finally {
      logSpy.mockRestore();
    }
  }

  it("documents bkit telemetry migrate", () => {
    expect(usage()).toContain("telemetry migrate");
  });

  it("documents that migrate is destructive (parity-gated)", () => {
    const text = usage();
    expect(text).toMatch(/parity/i);
  });

  it("documents that migrate is NOT called from bkit upgrade", () => {
    const text = usage();
    // "NEVER called" and "from bkit upgrade" may be on separate lines in the help template
    expect(text).toMatch(/NEVER called[\s\S]*?from bkit upgrade|never.*?upgrade/is);
  });

  it("documents --dry-run flag", () => {
    expect(usage()).toContain("--dry-run");
  });
});
