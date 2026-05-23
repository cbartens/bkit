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

  it("--full flag parsed → all modules resolved (renovate is opt-in, excluded)", () => {
    const result = parseArgs(["install", "--full"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
    expect(result.modules.has("renovate")).toBe(false);
  });

  it("no module flags → resolves to all modules (--full equivalent; renovate excluded)", () => {
    const result = parseArgs(["install"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
    expect(result.modules.has("renovate")).toBe(false);
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
  it("help output lists all module flags (including opt-in --renovate)", () => {
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

  it("uninstall with no flags resolves to all modules (--full equivalent)", () => {
    const result = parseArgs(["uninstall"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
  });

  it("uninstall with --ci --lint resolves to core + ci + lint", () => {
    const result = parseArgs(["uninstall", "--ci", "--lint"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("claude")).toBe(false);
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

  it("module flags work with uninstall (--full mirrors install)", () => {
    const withFull = parseArgs(["uninstall", "--full"]);
    const noFlags = parseArgs(["uninstall"]);
    expect([...withFull.modules].sort()).toEqual([...noFlags.modules].sort());
  });
});
