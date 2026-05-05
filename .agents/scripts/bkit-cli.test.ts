// bkit-cli.test.ts — v4-3 scope (CLI dispatch surface).
// Stubs created in v4-2 Phase 0; filled by v4-3 Phase 3.
import { describe, expect, it, vi } from "vitest";
import { parseArgs, printUsage, resolveModules } from "./bkit-cli";

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

  it("--full flag parsed → all modules resolved", () => {
    const result = parseArgs(["install", "--full"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
  });

  it("no module flags → resolves to all modules (--full equivalent)", () => {
    const result = parseArgs(["install"]);
    expect(result.modules.has("core")).toBe(true);
    expect(result.modules.has("claude")).toBe(true);
    expect(result.modules.has("cursor")).toBe(true);
    expect(result.modules.has("ci")).toBe(true);
    expect(result.modules.has("lint")).toBe(true);
    expect(result.modules.has("git-hooks")).toBe(true);
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
  it("help output lists all module flags", () => {
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
});
