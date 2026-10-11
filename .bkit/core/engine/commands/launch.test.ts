// commands/launch.test.ts — unit tests for the bkit cursor / bkit opencode launcher.
// Covers: loadBkitEnv (incl. .bkit/.env parsing), resolveBinaryPath, isAlreadyRunning, launchApp.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock node:child_process before importing launch.ts (Vitest hoists vi.mock calls).
const mockSpawnSync = vi.fn();
const mockSpawn = vi.fn();
vi.mock("node:child_process", () => ({
  spawnSync: (...args: unknown[]) => mockSpawnSync(...args),
  spawn: (...args: unknown[]) => mockSpawn(...args),
}));

import { loadBkitEnv, resolveBinaryPath, isAlreadyRunning, launchApp } from "./launch.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-launch-test-"));
  vi.clearAllMocks();
  // Default spawn mock: returns a fake child with unref()
  mockSpawn.mockReturnValue({ unref: () => {} });
  // Default spawnSync mock: pgrep returns "not running" (exit 1, empty stdout)
  mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function writeBkitEnv(content: string): void {
  const dir = path.join(tmpDir, ".bkit");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, ".env"), content, "utf-8");
}

function makeFakeBin(name: string): string {
  const p = path.join(tmpDir, name);
  fs.writeFileSync(p, "#!/bin/sh\n", "utf-8");
  return p;
}

// ---------------------------------------------------------------------------
// loadBkitEnv — .bkit/.env parsing
// ---------------------------------------------------------------------------

function loadFile(content: string): NodeJS.ProcessEnv {
  writeBkitEnv(content);
  return loadBkitEnv(tmpDir, {});
}

describe("loadBkitEnv — .bkit/.env parsing", () => {
  it("parses a simple key=value", () => {
    expect(loadFile("FOO=bar")).toEqual({ FOO: "bar" });
  });

  it("skips blank lines", () => {
    expect(loadFile("\n\nFOO=bar\n\n")).toEqual({ FOO: "bar" });
  });

  it("skips comment lines", () => {
    expect(loadFile("# comment\nFOO=bar")).toEqual({ FOO: "bar" });
  });

  it("strips double-quoted value", () => {
    expect(loadFile(`KEY="hello world"`)["KEY"]).toBe("hello world");
  });

  it("strips single-quoted value", () => {
    expect(loadFile(`KEY='hello world'`)["KEY"]).toBe("hello world");
  });

  it("does NOT strip mismatched quotes", () => {
    expect(loadFile(`KEY="hello'`)["KEY"]).toBe(`"hello'`);
  });

  it("handles multiple keys", () => {
    expect(loadFile("A=1\nB=2\nC=3")).toEqual({ A: "1", B: "2", C: "3" });
  });

  it("skips lines without '='", () => {
    expect(loadFile("NOEQUALSSIGN\nFOO=bar")).toEqual({ FOO: "bar" });
  });

  it("value may contain '=' characters", () => {
    expect(loadFile("KEY=a=b=c")["KEY"]).toBe("a=b=c");
  });

  it("loads `export KEY=value` lines under KEY", () => {
    expect(loadFile("export MY_TOKEN=secret\nOTHER=1")).toEqual({ MY_TOKEN: "secret", OTHER: "1" });
  });
});

// ---------------------------------------------------------------------------
// loadBkitEnv
// ---------------------------------------------------------------------------

describe("loadBkitEnv — merge .bkit/.env over baseEnv", () => {
  it("returns copy of baseEnv when .bkit/.env absent", () => {
    const base = { EXISTING: "yes" };
    const merged = loadBkitEnv(tmpDir, base);
    expect(merged["EXISTING"]).toBe("yes");
    expect(Object.keys(merged)).toEqual(["EXISTING"]);
  });

  it("injects keys absent from baseEnv", () => {
    writeBkitEnv("MY_TOKEN=secret");
    const merged = loadBkitEnv(tmpDir, {});
    expect(merged["MY_TOKEN"]).toBe("secret");
  });

  it("process.env (baseEnv) wins over file value for same key", () => {
    writeBkitEnv("MY_TOKEN=from-file");
    const merged = loadBkitEnv(tmpDir, { MY_TOKEN: "from-env" });
    expect(merged["MY_TOKEN"]).toBe("from-env");
  });

  it("injects key when baseEnv has it blank", () => {
    writeBkitEnv("MY_TOKEN=from-file");
    const merged = loadBkitEnv(tmpDir, { MY_TOKEN: "" });
    expect(merged["MY_TOKEN"]).toBe("from-file");
  });

  it("does not inject blank file values (placeholders stay out)", () => {
    writeBkitEnv("PLACEHOLDER=");
    const merged = loadBkitEnv(tmpDir, {});
    expect(merged["PLACEHOLDER"]).toBe("");
  });

  it("merged env contains both baseEnv keys and new file keys", () => {
    writeBkitEnv("NEW_KEY=value");
    const merged = loadBkitEnv(tmpDir, { OLD_KEY: "old" });
    expect(merged["OLD_KEY"]).toBe("old");
    expect(merged["NEW_KEY"]).toBe("value");
  });
});

// ---------------------------------------------------------------------------
// resolveBinaryPath
// ---------------------------------------------------------------------------

describe("resolveBinaryPath — binary path resolution", () => {
  it("returns error when override path does not exist", () => {
    const result = resolveBinaryPath("cursor", {
      BKIT_CURSOR_BIN: "/nonexistent/Cursor-xyz",
    });
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toMatch(/cursor binary not found/i);
      expect(result.error).toContain("BKIT_CURSOR_BIN");
    }
  });

  it("returns binPath when override path exists (real file)", () => {
    const fakeBin = makeFakeBin("fake-cursor");
    const result = resolveBinaryPath("cursor", { BKIT_CURSOR_BIN: fakeBin });
    expect("binPath" in result).toBe(true);
    if ("binPath" in result) {
      expect(result.binPath).toBe(fakeBin);
    }
  });

  it("opencode uses BKIT_OPENCODE_BIN override", () => {
    const result = resolveBinaryPath("opencode", {
      BKIT_OPENCODE_BIN: "/nonexistent/opencode-xyz",
    });
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("BKIT_OPENCODE_BIN");
    }
  });

  it("opencode returns binPath when override exists", () => {
    const fakeBin = makeFakeBin("fake-opencode");
    const result = resolveBinaryPath("opencode", { BKIT_OPENCODE_BIN: fakeBin });
    expect("binPath" in result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isAlreadyRunning
// ---------------------------------------------------------------------------

describe("isAlreadyRunning — process detection", () => {
  it("returns false for a path that cannot be running (pgrep exit 1)", () => {
    mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
    expect(isAlreadyRunning("/nonexistent/app-that-cannot-be-running-xyz")).toBe(false);
  });

  it("returns false when pgrep exits 1 with empty stdout", () => {
    mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
    expect(isAlreadyRunning("/some/binary")).toBe(false);
  });

  it("returns true when pgrep exits 0 with non-empty stdout", () => {
    mockSpawnSync.mockReturnValue({ status: 0, stdout: "12345\n", stderr: "" });
    expect(isAlreadyRunning("/Applications/Cursor.app/Contents/MacOS/Cursor")).toBe(true);
  });

  it("returns false when pgrep exits 0 but stdout is empty", () => {
    mockSpawnSync.mockReturnValue({ status: 0, stdout: "", stderr: "" });
    expect(isAlreadyRunning("/some/binary")).toBe(false);
  });

  it("returns false when spawnSync sets result.error (pgrep absent on non-POSIX)", () => {
    mockSpawnSync.mockReturnValue({
      status: null,
      stdout: "",
      stderr: "",
      error: new Error("ENOENT"),
    });
    expect(isAlreadyRunning("/some/binary")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// launchApp — exit paths
// ---------------------------------------------------------------------------

function withExit(fn: () => Promise<void>): Promise<string> {
  const exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
    throw new Error("process.exit called");
  });
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  return fn()
    .then(() => {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
      return "";
    })
    .catch((e) => {
      const errors = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
      exitSpy.mockRestore();
      errorSpy.mockRestore();
      if ((e as Error).message === "process.exit called") return errors;
      throw e;
    });
}

describe("launchApp — exit 1 when binary not found", () => {
  it("exits non-zero when override binary path does not exist", async () => {
    // Set BKIT_CURSOR_BIN to a nonexistent path so binary lookup fails reliably
    const origEnv = process.env["BKIT_CURSOR_BIN"];
    process.env["BKIT_CURSOR_BIN"] = "/nonexistent/cursor-bin-xyz";
    try {
      const errors = await withExit(() => launchApp("cursor", tmpDir));
      expect(errors).toMatch(/not found/i);
    } finally {
      if (origEnv === undefined) delete process.env["BKIT_CURSOR_BIN"];
      else process.env["BKIT_CURSOR_BIN"] = origEnv;
    }
  });
});

describe("launchApp — warns but still launches when app already running", () => {
  it("warns about env but still spawns the app", async () => {
    const fakeBin = makeFakeBin("fake-app");
    process.env["BKIT_CURSOR_BIN"] = fakeBin;
    mockSpawnSync.mockReturnValue({ status: 0, stdout: "99999\n", stderr: "" });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("cursor", tmpDir);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0]![0]).toMatch(/already running/i);
      expect(warnSpy.mock.calls[0]![0]).toMatch(/will NOT take effect/i);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
    } finally {
      delete process.env["BKIT_CURSOR_BIN"];
      warnSpy.mockRestore();
      logSpy.mockRestore();
    }
  });

  it("opencode: names the shared 2.0 background server as the reason env is stale", async () => {
    const fakeBin = makeFakeBin("fake-opencode");
    process.env["BKIT_OPENCODE_BIN"] = fakeBin;
    mockSpawnSync.mockReturnValue({ status: 0, stdout: "99999\n", stderr: "" });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("opencode", tmpDir);
      const msg = String(warnSpy.mock.calls[0]![0]);
      expect(msg).toMatch(/already running/i);
      // OpenCode 2.0's shared background server is why the fresh .bkit/.env is ignored.
      expect(msg).toMatch(/shared background server/i);
      expect(msg).toMatch(/2\.0/);
      expect(msg).toMatch(/pkill -f opencode/);
    } finally {
      delete process.env["BKIT_OPENCODE_BIN"];
      warnSpy.mockRestore();
      logSpy.mockRestore();
    }
  });

  it("cursor: does NOT mention the opencode background server", async () => {
    const fakeBin = makeFakeBin("fake-cursor-2");
    process.env["BKIT_CURSOR_BIN"] = fakeBin;
    mockSpawnSync.mockReturnValue({ status: 0, stdout: "99999\n", stderr: "" });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("cursor", tmpDir);
      expect(String(warnSpy.mock.calls[0]![0])).not.toMatch(/shared background server/i);
    } finally {
      delete process.env["BKIT_CURSOR_BIN"];
      warnSpy.mockRestore();
      logSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// launchApp — spawn call assertions
// ---------------------------------------------------------------------------

describe("launchApp — does NOT use `open -a`", () => {
  it("spawn is called with binary path directly, never via `open`", async () => {
    const fakeBin = makeFakeBin("fake-cursor");
    process.env["BKIT_CURSOR_BIN"] = fakeBin;
    // pgrep returns not-running
    mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("cursor", tmpDir);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      const [calledCmd] = mockSpawn.mock.calls[0]!;
      expect(calledCmd).not.toBe("open");
      expect(calledCmd).not.toMatch(/^open$/);
    } finally {
      delete process.env["BKIT_CURSOR_BIN"];
      logSpy.mockRestore();
    }
  });
});

describe("launchApp — cursor passes cwd as positional arg", () => {
  it("cursor spawn includes cwd as first positional arg", async () => {
    const fakeBin = makeFakeBin("fake-cursor");
    process.env["BKIT_CURSOR_BIN"] = fakeBin;
    mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
    vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("cursor", tmpDir);
      const [, capturedArgs] = mockSpawn.mock.calls[0]!;
      expect(capturedArgs).toContain(tmpDir);
    } finally {
      delete process.env["BKIT_CURSOR_BIN"];
    }
    vi.restoreAllMocks();
  });
});

describe("launchApp — opencode passes no positional args", () => {
  it("opencode spawn has empty args array", async () => {
    const fakeBin = makeFakeBin("fake-opencode");
    process.env["BKIT_OPENCODE_BIN"] = fakeBin;
    mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
    vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("opencode", tmpDir);
      const [, capturedArgs] = mockSpawn.mock.calls[0]!;
      expect(capturedArgs).toEqual([]);
    } finally {
      delete process.env["BKIT_OPENCODE_BIN"];
    }
    vi.restoreAllMocks();
  });
});

describe("launchApp — env merge from .bkit/.env", () => {
  it("spawned process receives tokens from .bkit/.env", async () => {
    const fakeBin = makeFakeBin("fake-cursor");
    process.env["BKIT_CURSOR_BIN"] = fakeBin;
    writeBkitEnv("MY_SECRET_TOKEN=abc123");
    mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
    vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("cursor", tmpDir);
      const [, , capturedOpts] = mockSpawn.mock.calls[0]!;
      expect((capturedOpts as { env?: Record<string, string> }).env?.["MY_SECRET_TOKEN"]).toBe(
        "abc123",
      );
    } finally {
      delete process.env["BKIT_CURSOR_BIN"];
    }
    vi.restoreAllMocks();
  });

  it("does not pass plain `open` as command (asserts direct exec)", async () => {
    const fakeBin = makeFakeBin("fake-cursor");
    process.env["BKIT_CURSOR_BIN"] = fakeBin;
    mockSpawnSync.mockReturnValue({ status: 1, stdout: "", stderr: "" });
    vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await launchApp("cursor", tmpDir);
      const [calledCmd] = mockSpawn.mock.calls[0]!;
      expect(calledCmd).toBe(fakeBin);
    } finally {
      delete process.env["BKIT_CURSOR_BIN"];
    }
    vi.restoreAllMocks();
  });
});
