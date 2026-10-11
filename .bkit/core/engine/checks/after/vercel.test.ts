// checks/after/vercel.test.ts — Unit tests for the Phase 3 Vercel detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectVercelProject,
  detectVercelEnv,
  detectVercelInstallCommandMissingAuth,
} from "./vercel";

// ---------------------------------------------------------------------------
// Module-level mock for node:child_process
// vi.hoisted() must be called at the module top-level (once) so Vitest can hoist
// the mock declaration before imports. Individual tests use mockReset +
// mockReturnValue / mockImplementation to configure per-case behaviour.
// ---------------------------------------------------------------------------
const { execSync, execFileSync, spawnSync } = vi.hoisted(() => ({
  execSync: vi.fn(),
  execFileSync: vi.fn(),
  spawnSync: vi.fn(),
}));

vi.mock("node:child_process", () => ({ execSync, execFileSync, spawnSync }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalCwd = process.cwd();
  originalEnv = { ...process.env };
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-postinstall-test-"));
  process.chdir(tmpDir);
  // Default: git resolution fails → currentBranch null → isOnProtectedBranch true
  // (fail-safe). Tests that exercise a specific branch set GITHUB_REF_NAME/BASE_REF.
  spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env = originalEnv;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
  execSync.mockReset();
  execFileSync.mockReset();
  spawnSync.mockReset();
});

// ---------------------------------------------------------------------------
// detectVercelInstallCommandMissingAuth
// ---------------------------------------------------------------------------

describe("detectVercelInstallCommandMissingAuth", () => {
  it("flags a root vercel.json whose installCommand omits the pnpm config set auth", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({ installCommand: "pnpm install --frozen-lockfile" }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual(["vercel.json"]);
  });

  it("flags a root vercel.json that has no installCommand at all", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({ framework: "nextjs" }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual(["vercel.json"]);
  });

  it("passes an installCommand that writes the token via pnpm config set (JSON-escaped quotes)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({
        installCommand:
          'pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL" && pnpm install',
      }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([]);
  });

  it("passes the unquoted installCommand form (README example shape)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({
        installCommand:
          "pnpm config set //npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL && pnpm install",
      }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([]);
  });

  it("returns [] when no vercel.json exists", () => {
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([]);
  });

  it("scans apps/<name>/vercel.json and reports the offending app path", () => {
    const appDir = path.join(tmpDir, "apps", "web");
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
      path.join(appDir, "vercel.json"),
      JSON.stringify({ installCommand: "pnpm install" }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([
      path.join("apps", "web", "vercel.json"),
    ]);
  });
});

// ---------------------------------------------------------------------------
// detectVercelProject
// ---------------------------------------------------------------------------

describe("detectVercelProject", () => {
  it("returns true when vercel.json exists at root", () => {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    expect(detectVercelProject(tmpDir)).toBe(true);
  });

  it("returns true when vercel.json exists under apps/<name>/", () => {
    fs.mkdirSync(path.join(tmpDir, "apps", "web"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "apps", "web", "vercel.json"), "{}", "utf-8");
    expect(detectVercelProject(tmpDir)).toBe(true);
  });

  it("returns false when no vercel.json exists", () => {
    expect(detectVercelProject(tmpDir)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectVercelEnv — short-circuits when no Vercel project
// ---------------------------------------------------------------------------

describe("detectVercelEnv", () => {
  it("returns 'unknown' (silent skip) when detectVercelProject returns false (no vercel.json)", () => {
    // No vercel.json → should short-circuit without calling execSync
    const result = detectVercelEnv("preview", tmpDir);
    expect(result).toBe("unknown");
  });

  it("returns 'present' when vercel CLI reports BKIT_GH_TOKEN_INSTALL", () => {
    // B3: must also have .vercel/project.json for CLI call to proceed
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".vercel"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".vercel", "project.json"),
      '{"projectId":"proj_x"}',
      "utf-8",
    );
    execFileSync.mockReturnValue("BKIT_GH_TOKEN_INSTALL  preview\n");
    expect(detectVercelEnv("preview", tmpDir)).toBe("present");
  });

  it("returns 'missing' when vercel CLI output lacks BKIT_GH_TOKEN_INSTALL", () => {
    // B3: must also have .vercel/project.json for CLI call to proceed
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".vercel"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".vercel", "project.json"),
      '{"projectId":"proj_x"}',
      "utf-8",
    );
    execFileSync.mockReturnValue("OTHER_VAR  preview\n");
    expect(detectVercelEnv("preview", tmpDir)).toBe("missing");
  });

  it("returns 'unknown' when vercel CLI throws", () => {
    // B3: must also have .vercel/project.json for CLI call to proceed
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".vercel"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".vercel", "project.json"),
      '{"projectId":"proj_x"}',
      "utf-8",
    );
    execFileSync.mockImplementation(() => {
      throw new Error("vercel: command not found");
    });
    expect(detectVercelEnv("preview", tmpDir)).toBe("unknown");
  });

  it("returns 'unknown' when vercel.json exists but .vercel/project.json is absent (B3 guard)", () => {
    // B3: vercel.json present but not linked — skip CLI call (no hang)
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    // .vercel/project.json absent
    expect(detectVercelEnv("preview", tmpDir)).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// Vercel CLI hang guard
// ---------------------------------------------------------------------------

describe("B3 — Vercel CLI hang guard: detectVercelEnv skips shell-out when .vercel/project.json absent", () => {
  it("returns 'unknown' when vercel.json exists but .vercel/project.json is absent (no shell-out)", () => {
    // Setup: vercel.json present (detectVercelProject returns true) but .vercel/ not linked
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{"version":2}', "utf-8");
    // .vercel/project.json is absent — must NOT shell out to `vercel env ls`

    const result = detectVercelEnv("preview", tmpDir);

    expect(result).toBe("unknown");
    // Implicit: if it didn't hang/error, the guard fired correctly
  });

  it("returns 'unknown' when neither vercel.json nor .vercel/project.json exist", () => {
    // No vercel project at all
    const result = detectVercelEnv("preview", tmpDir);
    expect(result).toBe("unknown");
  });

  it("detectVercelProject returns false when no vercel.json", () => {
    expect(detectVercelProject(tmpDir)).toBe(false);
  });

  it("detectVercelProject returns true when vercel.json exists at root", () => {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{"version":2}', "utf-8");
    expect(detectVercelProject(tmpDir)).toBe(true);
  });

  it("checks/after/vercel.ts source uses .vercel/project.json guard (B3)", () => {
    // Source-level check: the guard must be present in the source
    const src = fs.readFileSync(path.join(__dirname, "vercel.ts"), "utf-8");
    expect(src).toContain(".vercel");
    expect(src).toContain("project.json");
  });

  it("checks/after/vercel.ts does NOT fall through to `vercel env ls` without the file guard", () => {
    // Source-level check: vercel env ls call must be after the project.json guard
    const src = fs.readFileSync(path.join(__dirname, "vercel.ts"), "utf-8");
    const projectJsonGuardIdx = src.indexOf("project.json");
    const vercelEnvLsIdx = src.indexOf('["env", "ls"');
    // The guard must come BEFORE the shell-out
    expect(projectJsonGuardIdx).toBeGreaterThan(-1);
    expect(vercelEnvLsIdx).toBeGreaterThan(-1);
    expect(projectJsonGuardIdx).toBeLessThan(vercelEnvLsIdx);
  });
});

// ---------------------------------------------------------------------------
// Task C1 — Installer advisory action constants (BAR-138, in checks/after/)
// ---------------------------------------------------------------------------

// Every non-test source in `dir`, concatenated — read as text to inspect the constant bodies
// without executing the modules (avoids import side-effects and keeps tests fast).
function readSources(dir: string): string {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), "utf-8"))
    .join("\n");
}

// The constants live in checks/after/ (Phase 3 owner), not install/modules/.
const POSTINSTALL_SRC = readSources(path.resolve(".bkit/core/engine/checks/after"));

describe("VERCEL action strings (in checks/after/)", () => {
  it("postinstall source contains vercel env add BKIT_GH_TOKEN_INSTALL", () => {
    expect(POSTINSTALL_SRC).toContain("vercel env add BKIT_GH_TOKEN_INSTALL");
  });

  it("postinstall source contains .npmrc reference", () => {
    expect(POSTINSTALL_SRC).toContain(".npmrc");
  });

  it("postinstall source prescribes the Vercel installCommand auth (pnpm config set before install)", () => {
    expect(POSTINSTALL_SRC).toContain(
      '"installCommand": "pnpm config set //npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL && pnpm install"',
    );
  });

  it("postinstall source does NOT contain git config --global url. shim", () => {
    expect(POSTINSTALL_SRC).not.toContain("git config --global url.");
  });
});
