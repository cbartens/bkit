// bkit-cli.test.ts — CLI dispatch surface (#252 redesign).
// Surface: install requires ≥1 module flag (guard lives in main(), not parseArgs);
// core implicit; --tooling expands to ci/lint/git-hooks; --auto replaces --cloud;
// --dependency= replaces bare --renovate/--dependabot; --full/--core dropped.
import { describe, expect, it, vi } from "vitest";
import { parseArgs, printUsage, resolveModules, type ModuleFlag } from "./bkit-cli";

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
    "--ci",
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
    expect(output).toContain("--tooling");
    expect(output).toContain("--dependency=");
    expect(output).toContain("--auto=");
  });

  it("does NOT advertise the dropped flags", () => {
    const output = usage();
    // The dropped bare flags must not appear as offered options.
    expect(output).not.toMatch(/^\s*--full\b/m);
    expect(output).not.toMatch(/^\s*--core\b/m);
    expect(output).not.toMatch(/^\s*--ci\b/m);
    expect(output).not.toMatch(/^\s*--lint\b/m);
    expect(output).not.toMatch(/^\s*--git-hooks\b/m);
  });

  it("includes compose + core examples", () => {
    const output = usage();
    expect(output).toContain("--claude --cursor --tooling");
    expect(output).toMatch(/[Cc]ore \(implicit/);
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

  // #245 Phase 3 — opencode-native gateway. bkit key is `opencode`; the opencode-side
  // provider id is also `opencode`. Accepted at the CLI; render path differs (built-in provider,
  // auth via OPENCODE_API_KEY).
  it("--opencode=opencode is accepted (#245 Phase 3)", () => {
    expect(parseArgs(["install", "--opencode=opencode"]).opencodeProvider).toBe("opencode");
  });

  // Legacy aliases — `zen` and `go` normalise to the canonical `opencode` key.
  it("--opencode=zen normalises to opencode (legacy alias)", () => {
    expect(parseArgs(["install", "--opencode=zen"]).opencodeProvider).toBe("opencode");
  });
  it("--opencode=go normalises to opencode (legacy alias, #282)", () => {
    expect(parseArgs(["install", "--opencode=go"]).opencodeProvider).toBe("opencode");
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
