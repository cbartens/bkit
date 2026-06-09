// bkit-cli.test.ts — v4-3 scope (CLI dispatch surface).
// Stubs created in v4-2 Phase 0; filled by v4-3 Phase 3.
import { describe, expect, it, vi } from "vitest";
import { parseArgs, printUsage, resolveModules, type ParsedArgs } from "./bkit-cli";

// ---------------------------------------------------------------------------
// parseArgs — verb parsing
// ---------------------------------------------------------------------------

describe("parseArgs — verb parsing", () => {
  it("install verb is parsed correctly", () => {
    const result = parseArgs(["install"]);
    expect(result.verb).toBe("install");
  });

  it("check verb is parsed correctly", () => {
    const result = parseArgs(["check"]);
    expect(result.verb).toBe("check");
  });

  it("help verb is parsed correctly", () => {
    const result = parseArgs(["help"]);
    expect(result.verb).toBe("help");
  });

  it("--help flag is parsed as help verb", () => {
    const result = parseArgs(["--help"]);
    expect(result.verb).toBe("help");
  });

  it("-h flag is parsed as help verb", () => {
    const result = parseArgs(["-h"]);
    expect(result.verb).toBe("help");
  });

  it("no args defaults to help", () => {
    const result = parseArgs([]);
    expect(result.verb).toBe("help");
  });

  it("doctor verb is parsed correctly (P1.T1 — BAR-142 §A3)", () => {
    const result = parseArgs(["doctor"]);
    expect(result.verb).toBe("doctor");
  });
});

// ---------------------------------------------------------------------------
// parseArgs — module flags
// ---------------------------------------------------------------------------

describe("parseArgs — module flags", () => {
  it("--core flag parsed", () => {
    const result = parseArgs(["install", "--core"]);
    expect(result.modules.has("core")).toBe(true);
  });

  it("--claude flag parsed", () => {
    const result = parseArgs(["install", "--claude"]);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("core")).toBe(true); // implicit
  });

  it("--cursor flag parsed", () => {
    const result = parseArgs(["install", "--cursor"]);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("core")).toBe(true);
  });

  it("--ci flag parsed", () => {
    const result = parseArgs(["install", "--ci"]);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("core")).toBe(true);
  });

  it("--lint flag parsed", () => {
    const result = parseArgs(["install", "--lint"]);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("core")).toBe(true);
  });

  it("--git-hooks flag parsed", () => {
    const result = parseArgs(["install", "--git-hooks"]);
    expect(result.modules.has("git-hooks")).toBe(true);
    expect(result.modules.has("core")).toBe(true);
  });

  it("--full flag parsed → all modules resolved (renovate + dependabot + cloud opt-in, excluded)", () => {
    const result = parseArgs(["install", "--full"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
    expect(result.modules.has("renovate")).toBe(false);
    expect(result.modules.has("dependabot")).toBe(false);
    expect(result.modules.has("cloud")).toBe(false);
  });

  it("no module flags → resolves to all modules (--full equivalent; renovate + dependabot + cloud excluded)", () => {
    const result = parseArgs(["install"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
    expect(result.modules.has("renovate")).toBe(false);
    expect(result.modules.has("dependabot")).toBe(false);
    expect(result.modules.has("cloud")).toBe(false);
  });

  it("--renovate alone → renovate + core only (not full stack)", () => {
    const result = parseArgs(["install", "--renovate"]);
    expect([...result.modules].sort()).toEqual(["core", "renovate"]);
  });

  it("--full --renovate → all modules + renovate (opt-in alongside full stack)", () => {
    const result = parseArgs(["install", "--full", "--renovate"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
    expect(result.modules.has("renovate")).toBe(true);
  });

  it("--ci --renovate → ci + core + renovate (compose without --full)", () => {
    const result = parseArgs(["install", "--ci", "--renovate"]);
    expect([...result.modules].sort()).toEqual(["ci", "core", "renovate"]);
  });

  it("--cloud=claude alone → cloud + core only (not full stack)", () => {
    const result = parseArgs(["install", "--cloud=claude"]);
    expect([...result.modules].sort()).toEqual(["cloud", "core"]);
    expect(result.cloudVariant).toBe("claude");
  });

  it("--cloud=cursor alone → cloud + core only (not full stack)", () => {
    const result = parseArgs(["install", "--cloud=cursor"]);
    expect([...result.modules].sort()).toEqual(["cloud", "core"]);
    expect(result.cloudVariant).toBe("cursor");
  });

  it("bare --cloud (install) → error (must use --cloud=claude or --cloud=cursor)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    expect(() => parseArgs(["install", "--cloud"])).toThrow();
    exitSpy.mockRestore();
  });

  it("--full --cloud=claude → all modules + cloud (opt-in alongside full stack)", () => {
    const result = parseArgs(["install", "--full", "--cloud=claude"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("cloud")).toBe(true);
    expect(result.modules.has("renovate")).toBe(false);
    expect(result.modules.has("dependabot")).toBe(false);
    expect(result.cloudVariant).toBe("claude");
  });

  it("--ci --cloud=claude → ci + core + cloud (compose without --full)", () => {
    const result = parseArgs(["install", "--ci", "--cloud=claude"]);
    expect([...result.modules].sort()).toEqual(["ci", "cloud", "core"]);
    expect(result.cloudVariant).toBe("claude");
  });

  it("--dependabot alone → dependabot + core only (mirror of --renovate single-purpose UX)", () => {
    const result = parseArgs(["install", "--dependabot"]);
    expect([...result.modules].sort()).toEqual(["core", "dependabot"]);
  });

  it("--full --dependabot → all modules + dependabot (opt-in alongside full stack)", () => {
    const result = parseArgs(["install", "--full", "--dependabot"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("dependabot")).toBe(true);
    expect(result.modules.has("renovate")).toBe(false);
  });

  it("--renovate --dependabot together is rejected (mutually exclusive)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["install", "--renovate", "--dependabot"])).toThrow(
        "process.exit called",
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      const errMsg = errorSpy.mock.calls.map((c) => c[0]).join(" ");
      expect(errMsg).toMatch(/mutually exclusive/);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("--full --renovate --dependabot is also rejected (combo with full)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["install", "--full", "--renovate", "--dependabot"])).toThrow(
        "process.exit called",
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("--full ≡ no flags (writeset equality)", () => {
    const withFull = parseArgs(["install", "--full"]);
    const noFlags = parseArgs(["install"]);
    expect([...withFull.modules].sort()).toEqual([...noFlags.modules].sort());
  });

  it("--ci --lint compose correctly: core + ci + lint only", () => {
    const result = parseArgs(["install", "--ci", "--lint"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("claude")).toBe(false);
    expect(result.modules.has("cursor")).toBe(false);
    expect(result.modules.has("git-hooks")).toBe(false);
  });

  it("parseArgs returns all module flags in returned modules Set", () => {
    // Test that parseArgs correctly returns the module list
    const result = parseArgs(["install", "--claude"]);
    // modules is a Set<ModuleFlag> containing resolved modules
    expect(result.modules).toBeInstanceOf(Set);
    expect([...result.modules].sort()).toEqual(["claude", "core"]);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — unknown flag / verb rejection (covers retired init + --host=)
// ---------------------------------------------------------------------------

describe("parseArgs — unknown flag rejection", () => {
  it("unknown flag --foo causes process.exit(1)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["install", "--foo"])).toThrow("process.exit called");
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("unknown verb causes process.exit(1)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["deploy"])).toThrow("process.exit called");
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("retired `init` verb is rejected as unknown (use `install --full`)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["init"])).toThrow("process.exit called");
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("retired `--host=claude` is rejected as unknown flag (use `--claude`)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["install", "--host=claude"])).toThrow("process.exit called");
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("retired `--host=cursor` is rejected as unknown flag (use `--cursor`)", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["install", "--host=cursor"])).toThrow("process.exit called");
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// printUsage — help output
// ---------------------------------------------------------------------------

describe("printUsage — help output", () => {
  it("help output lists all module flags (including opt-in --renovate, --dependabot and --cloud)", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      expect(logSpy).toHaveBeenCalledTimes(1);
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("--core");
      expect(output).toContain("--claude");
      expect(output).toContain("--cursor");
      expect(output).toContain("--ci");
      expect(output).toContain("--lint");
      expect(output).toContain("--git-hooks");
      expect(output).toContain("--renovate");
      expect(output).toContain("--dependabot");
      expect(output).toContain("--cloud");
      expect(output).toContain("--full");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("help output includes compose examples", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("--ci --lint");
      expect(output).toContain("--claude");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("help output includes doctor verb description (P1.T1 — BAR-142 §A3)", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("doctor");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("help output includes uninstall verb (P2.T6)", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("uninstall");
      expect(output).toContain("--dry-run");
      expect(output).toContain("--nuke");
    } finally {
      logSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// parseArgs — uninstall verb (P2.T6)
// ---------------------------------------------------------------------------

describe("parseArgs — uninstall verb (P2.T6)", () => {
  it("uninstall verb is parsed correctly", () => {
    const result = parseArgs(["uninstall"]);
    expect(result.verb).toBe("uninstall");
  });

  it("uninstall with no flags resolves to all modules INCLUDING opt-in add-ons (zero footprint)", () => {
    const result = parseArgs(["uninstall"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
    // Asymmetry vs install: full uninstall reaches opt-in add-ons so no bkit footprint remains.
    expect(result.modules.has("renovate")).toBe(true);
    expect(result.modules.has("dependabot")).toBe(true);
    expect(result.modules.has("cloud")).toBe(true);
  });

  it("opt-in asymmetry: install --full EXCLUDES opt-in add-ons; uninstall --full INCLUDES them", () => {
    const inst = parseArgs(["install", "--full"]);
    const unin = parseArgs(["uninstall", "--full"]);
    expect(inst.modules.has("renovate")).toBe(false);
    expect(inst.modules.has("dependabot")).toBe(false);
    expect(inst.modules.has("cloud")).toBe(false);
    expect(unin.modules.has("renovate")).toBe(true);
    expect(unin.modules.has("dependabot")).toBe(true);
    expect(unin.modules.has("cloud")).toBe(true);
  });

  it("uninstall --cloud alone → core + cloud only (bare --cloud accepted for uninstall)", () => {
    const result = parseArgs(["uninstall", "--cloud"]);
    expect([...result.modules].sort()).toEqual(["cloud", "core"]);
    // uninstall doesn't need a variant — it reads from package.json
    expect(result.cloudVariant).toBeNull();
  });

  it("uninstall with --ci --lint resolves to core + ci + lint", () => {
    const result = parseArgs(["uninstall", "--ci", "--lint"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("claude")).toBe(false);
  });

  it("uninstall --renovate alone → core + renovate only (targeted is symmetric, not full stack)", () => {
    const result = parseArgs(["uninstall", "--renovate"]);
    expect([...result.modules].sort()).toEqual(["core", "renovate"]);
  });

  it("uninstall --dry-run sets dryRun flag", () => {
    const result = parseArgs(["uninstall", "--dry-run"]);
    expect(result.uninstallFlags.dryRun).toBe(true);
  });

  it("uninstall --force sets force flag", () => {
    const result = parseArgs(["uninstall", "--force"]);
    expect(result.uninstallFlags.force).toBe(true);
  });

  it("uninstall --nuke sets nuke flag", () => {
    const result = parseArgs(["uninstall", "--nuke"]);
    expect(result.uninstallFlags.nuke).toBe(true);
  });

  it("uninstall --yes sets yes flag", () => {
    const result = parseArgs(["uninstall", "--yes"]);
    expect(result.uninstallFlags.yes).toBe(true);
  });

  it("uninstall --package sets stripPackage flag", () => {
    const result = parseArgs(["uninstall", "--package"]);
    expect(result.uninstallFlags.stripPackage).toBe(true);
  });

  it("uninstall --nuke --yes --force compose correctly", () => {
    const result = parseArgs(["uninstall", "--nuke", "--yes", "--force"]);
    expect(result.uninstallFlags.nuke).toBe(true);
    expect(result.uninstallFlags.yes).toBe(true);
    expect(result.uninstallFlags.force).toBe(true);
  });

  it("uninstall flags default to false when not specified", () => {
    const result = parseArgs(["uninstall"]);
    expect(result.uninstallFlags.dryRun).toBe(false);
    expect(result.uninstallFlags.force).toBe(false);
    expect(result.uninstallFlags.nuke).toBe(false);
    expect(result.uninstallFlags.yes).toBe(false);
    expect(result.uninstallFlags.stripPackage).toBe(false);
  });

  it("install --auto-revert sets autoRevert flag", () => {
    const result = parseArgs(["install", "--auto-revert"]);
    expect(result.uninstallFlags.autoRevert).toBe(true);
  });

  it("uninstall --full === uninstall (no flags) — both resolve the complete set incl. opt-in", () => {
    const withFull = parseArgs(["uninstall", "--full"]);
    const noFlags = parseArgs(["uninstall"]);
    expect([...withFull.modules].sort()).toEqual([...noFlags.modules].sort());
  });
});

// ---------------------------------------------------------------------------
// parseArgs — --opencode flag (Task 2.3 "Done when")
// ---------------------------------------------------------------------------

describe("parseArgs — --opencode flag (Task 2.3)", () => {
  it("--opencode=ollama alone → opencode + core only (opt-in, additive)", () => {
    const result = parseArgs(["install", "--opencode=ollama"]);
    expect([...result.modules].sort()).toEqual(["core", "opencode"]);
    expect(result.opencodeProvider).toBe("ollama");
  });

  it("--opencode=nvidia → opencode + core, provider=nvidia", () => {
    const result = parseArgs(["install", "--opencode=nvidia"]);
    expect(result.modules.has("opencode")).toBe(true);
    expect(result.modules.has("core")).toBe(true);
    expect(result.opencodeProvider).toBe("nvidia");
  });

  it("--opencode=openrouter → opencode + core, provider=openrouter", () => {
    const result = parseArgs(["install", "--opencode=openrouter"]);
    expect(result.modules.has("opencode")).toBe(true);
    expect(result.opencodeProvider).toBe("openrouter");
  });

  it("--opencode=gemini → opencode + core, provider=gemini", () => {
    const result = parseArgs(["install", "--opencode=gemini"]);
    expect(result.modules.has("opencode")).toBe(true);
    expect(result.opencodeProvider).toBe("gemini");
  });

  it("bare --opencode (no value) on install is rejected — provider required", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["install", "--opencode"])).toThrow("process.exit called");
      expect(exitSpy).toHaveBeenCalledWith(1);
      const errMsg = errorSpy.mock.calls.map((c) => c[0]).join(" ");
      expect(errMsg).toMatch(/--opencode requires an explicit provider/);
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("--full --opencode=ollama → all modules + opencode (opt-in alongside full stack)", () => {
    const result = parseArgs(["install", "--full", "--opencode=ollama"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("opencode")).toBe(true);
    expect(result.opencodeProvider).toBe("ollama");
  });

  it("--ci --opencode=ollama → ci + core + opencode (compose without --full)", () => {
    const result = parseArgs(["install", "--ci", "--opencode=ollama"]);
    expect([...result.modules].sort()).toEqual(["ci", "core", "opencode"]);
    expect(result.opencodeProvider).toBe("ollama");
  });

  it("--full without --opencode → opencode NOT included (additive opt-in, not default)", () => {
    const result = parseArgs(["install", "--full"]);
    expect(result.modules.has("opencode")).toBe(false);
  });

  it("install (no flags) → opencode NOT included (additive opt-in, not in ALL_MODULES)", () => {
    const result = parseArgs(["install"]);
    expect(result.modules.has("opencode")).toBe(false);
  });

  it("uninstall --opencode alone → core + opencode only (bare --opencode accepted for uninstall)", () => {
    const result = parseArgs(["uninstall", "--opencode"]);
    expect([...result.modules].sort()).toEqual(["core", "opencode"]);
    expect(result.opencodeProvider).toBeNull();
  });

  it("uninstall (no flags) → opencode IS included (full uninstall reaches all opt-in modules)", () => {
    const result = parseArgs(["uninstall"]);
    expect(result.modules.has("opencode")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseArgs — status verb (Task 4.1)
// ---------------------------------------------------------------------------

describe("parseArgs — status verb (Task 4.1)", () => {
  it("status verb is parsed correctly", () => {
    const result = parseArgs(["status"]);
    expect(result.verb).toBe("status");
  });

  it("status verb with no module flags is fine (read-only, no modules needed)", () => {
    const result = parseArgs(["status"]);
    expect(result.verb).toBe("status");
    // status is read-only — module flags are resolved but irrelevant
  });
});

// ---------------------------------------------------------------------------
// printUsage — status verb listed in help text (Task 4.1)
// ---------------------------------------------------------------------------

describe("printUsage — status verb in help text (Task 4.1)", () => {
  it("help text lists bkit status", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("status");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("help text describes status as read-only (writes nothing)", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      const output = logSpy.mock.calls[0]?.[0] as string;
      // status description should mention writes-nothing or read-only
      expect(output).toMatch(
        /status.*[Rr]ead-only|[Rr]ead-only.*status|Writes nothing.*status|status.*Writes nothing/s,
      );
    } finally {
      logSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// printUsage — --opencode listed in help text (Task 2.3)
// ---------------------------------------------------------------------------

describe("printUsage — --opencode in help text (Task 2.3)", () => {
  it("help text lists --opencode=<provider>", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("--opencode");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("help text describes opencode as additive and opt-in", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      printUsage();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toMatch(/opencode/i);
      // additive / opt-in language
      expect(output).toMatch(/additive|opt-in/i);
    } finally {
      logSpy.mockRestore();
    }
  });
});
