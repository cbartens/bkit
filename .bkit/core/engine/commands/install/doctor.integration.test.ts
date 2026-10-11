// commands/install/doctor.integration.test.ts — Integration test for `bkit doctor` verb (P1.T1).
// Tests the read-only advisory replay on a stale-pin scratch consumer fixture.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const bkitInstallPath = path.resolve(__dirname, "../../cli.ts");
const tsxBin = path.resolve(__dirname, "../../../../../node_modules/.bin/tsx");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-doctor-integration-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function seedMinimalConsumer(dir: string): void {
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "test-consumer" }),
    "utf-8",
  );
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
}

function seedStaleVersionPin(dir: string): void {
  // Create a stale .bkit/version (older than installed)
  fs.mkdirSync(path.join(dir, ".bkit"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".bkit", "version"),
    JSON.stringify({ pinnedVersion: "0.4.1" }),
    "utf-8",
  );
  // Create a newer installed bkit in node_modules
  const bkitDir = path.join(dir, "node_modules", "@cbartens", "bkit");
  fs.mkdirSync(bkitDir, { recursive: true });
  fs.writeFileSync(
    path.join(bkitDir, "package.json"),
    JSON.stringify({ name: "@cbartens/bkit", version: "0.6.0" }),
    "utf-8",
  );
}

// ---------------------------------------------------------------------------
// doctor verb integration tests
// ---------------------------------------------------------------------------

describe("bkit doctor — integration", () => {
  it("exits 0 on a minimal consumer (no crash)", () => {
    if (!fs.existsSync(tsxBin)) return; // skip if tsx not available (CI without devDeps)

    seedMinimalConsumer(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(
      result.status,
      `doctor crashed (exit ${result.status}):\n${result.stdout}\n${result.stderr}`,
    ).toBe(0);
  });

  it("prints [bkit-doctor] log prefix", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.stdout).toContain("[bkit-doctor]");
  });

  it("prints Payload roots line (WS5-T1)", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.stdout).toContain("[bkit-doctor] Payload roots:");
  });

  it("emits bkit-version-pin-stale advisory when installed version > on-disk version", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);
    seedStaleVersionPin(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    // doctor exits 0 even when advisories are found (read-only)
    expect(result.status, `doctor crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);

    // Should contain the stale-pin advisory
    const combinedOutput = result.stdout + result.stderr;
    expect(combinedOutput).toContain("bkit-version-pin-stale");
  });

  it("writes only the .bkit/advisories.md artifact (no other side effects)", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);

    // Capture all files before
    const filesBefore = listFilesRecursive(tmpDir);

    spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    const filesAfter = listFilesRecursive(tmpDir);
    const newFiles = filesAfter.filter((f) => !filesBefore.includes(f));

    // The only permitted new file is the advisories artifact (referenceable
    // snapshot of the doctor run). Everything else must remain untouched.
    const advisoryPath = path.join(tmpDir, ".bkit", "advisories.md");
    expect(newFiles).toEqual([advisoryPath]);
    expect(fs.readFileSync(advisoryPath, "utf-8")).toContain("# bkit advisories");
  });
});

// ---------------------------------------------------------------------------
// bkit status — write-zero assertion (Task 4.1)
// ---------------------------------------------------------------------------

describe("bkit status — integration", () => {
  it("exits 0 and prints [bkit-status] prefix", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "status"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(
      result.status,
      `status crashed (exit ${result.status}):\n${result.stdout}\n${result.stderr}`,
    ).toBe(0);
    expect(result.stdout).toContain("[bkit-status]");
  });

  it("writes zero files (purely read-only — write-set assertion)", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);

    const filesBefore = listFilesRecursive(tmpDir);

    spawnSync(tsxBin, [bkitInstallPath, "status"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    const filesAfter = listFilesRecursive(tmpDir);
    const newFiles = filesAfter.filter((f) => !filesBefore.includes(f));

    // status must write ZERO files — strictly read-only.
    expect(newFiles).toEqual([]);
  });

  it("reports installed hosts (at minimum claude and cursor on a fresh consumer)", () => {
    if (!fs.existsSync(tsxBin)) return;

    // Seed a consumer with .claude and .cursor directories
    seedMinimalConsumer(tmpDir);
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });

    const result = spawnSync(tsxBin, [bkitInstallPath, "status"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("claude");
    expect(result.stdout).toContain("cursor");
  });

  it("reports opencode as absent when .opencode/ does not exist", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "status"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("absent");
  });
});

function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFilesRecursive(p));
    else out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// BAR-167 Phase 1 — doctor surfaces the tier2-json-drift advisory
// ---------------------------------------------------------------------------

import { detectDirenvMissing, detectDirenvNotAllowed } from "../../checks/before/env";
import { runPreflight } from "../../checks/before/index";
import { runPostInstallCheck } from "../../checks/after/index";

describe("bkit doctor — BAR-167 Phase 1 advisory surface", () => {
  it("tier2-json-drift surfaces through runPreflight", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }), "utf-8");
    // .cursor/hooks.json missing bkit content (tier2-json-drift)
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "hooks.json"),
      JSON.stringify({ customKey: "consumer-only" }),
      "utf-8",
    );

    const modules = new Set<import("../../cli").ModuleFlag>(["claude", "cursor"]);
    const { advisories } = runPreflight(modules, tmpDir, "2.0.0");

    const ids = advisories.map((a) => a.id);
    expect(ids).toContain("tier2-json-drift");
  });

  it("no drift advisory when consumer is fully contained", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
    const templateSettings = path.join(pkgRoot, ".bkit", "shared", ".claude", "settings.json");
    const templateHooks = path.join(pkgRoot, ".bkit", "shared", ".cursor", "hooks.json");

    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }), "utf-8");
    // Copy templates as-is → fully contained
    fs.copyFileSync(templateSettings, path.join(tmpDir, ".claude", "settings.json"));
    fs.copyFileSync(templateHooks, path.join(tmpDir, ".cursor", "hooks.json"));

    const modules = new Set<import("../../cli").ModuleFlag>(["claude", "cursor"]);
    const { advisories } = runPreflight(modules, tmpDir, "2.0.0");

    const ids = advisories.map((a) => a.id);
    expect(ids).not.toContain("tier2-json-drift");
  });
});

// ---------------------------------------------------------------------------
// BAR-260 — doctor surfaces [mcp-env] advisories
// ---------------------------------------------------------------------------

describe("bkit doctor — [mcp-env] advisory surface", () => {
  it("mcp-env-missing-dotenv surfaces through runPostInstallCheck when .env.example exists but .env absent", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "BKIT_GH_TOKEN=\n", "utf-8");
    // No .bkit/.env

    const findings = runPostInstallCheck([], tmpDir);
    expect(findings.some((a) => a.id === "mcp-env-missing-dotenv")).toBe(true);
  });

  it("mcp-env-blank-key advisories surface when .bkit/.env has blank values (Linear tracker → both required keys)", () => {
    // Linear tracker so BKIT_LINEAR_API_KEY is a required key.
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "linear" } }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=\nBKIT_GH_TOKEN_INSTALL=\nBKIT_LINEAR_API_KEY=\n",
      "utf-8",
    );

    const findings = runPostInstallCheck([], tmpDir);
    const ids = findings.map((a) => a.id);
    expect(ids).toContain("mcp-env-blank-key-bkit_gh_token");
    expect(ids).toContain("mcp-env-blank-key-bkit_linear_api_key");
  });

  it("github tracker: mcp-env-blank-key does NOT flag BKIT_LINEAR_API_KEY (issue #138)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "github" } }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=\nBKIT_GH_TOKEN_INSTALL=\nBKIT_LINEAR_API_KEY=\n",
      "utf-8",
    );

    const findings = runPostInstallCheck([], tmpDir);
    const ids = findings.map((a) => a.id);
    expect(ids).toContain("mcp-env-blank-key-bkit_gh_token");
    expect(ids).not.toContain("mcp-env-blank-key-bkit_linear_api_key");
  });

  it("no mcp-env advisories when .bkit/.env has all keys populated and no .envrc", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=ghp_test\nBKIT_GH_TOKEN_INSTALL=ghp_bkit\nBKIT_LINEAR_API_KEY=lin_key\n",
      "utf-8",
    );

    const findings = runPostInstallCheck([], tmpDir);
    expect(findings.some((a) => a.id === "mcp-env-missing-dotenv")).toBe(false);
    expect(findings.some((a) => a.id.startsWith("mcp-env-blank-key-"))).toBe(false);
    // direnv advisories depend on system state — we only check the non-system advisories
  });

  it("direnv-not-allowed skips in CI environment", () => {
    const originalCI = process.env.CI;
    process.env.CI = "true";
    try {
      fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
      const f = detectDirenvNotAllowed(tmpDir);
      expect(f).toBeNull();
    } finally {
      if (originalCI === undefined) delete process.env.CI;
      else process.env.CI = originalCI;
    }
  });

  it("direnv-missing skips in CI environment", () => {
    const originalCI = process.env.CI;
    process.env.CI = "true";
    try {
      fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
      const f = detectDirenvMissing(tmpDir);
      expect(f).toBeNull();
    } finally {
      if (originalCI === undefined) delete process.env.CI;
      else process.env.CI = originalCI;
    }
  });

  it("doctor subprocess surfaces mcp-env advisory in output when .env.example present without .env", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "BKIT_GH_TOKEN=\n", "utf-8");

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env, CI: "true" },
    });

    expect(result.status, `doctor crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
    const combined = result.stdout + result.stderr;
    expect(combined).toContain("mcp-env-missing-dotenv");
  });
});

// ---------------------------------------------------------------------------
// bkit doctor — Ollama memory-safety check (read-only; never mutates server env)
// These vars govern the Ollama SERVER daemon, not opencode.json — doctor only inspects.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// status and doctor show ALL installed providers
// ---------------------------------------------------------------------------

function seedMultiProvider(dir: string): void {
  // package.json with two providers; openrouter is active
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: "test-consumer",
      bkit: {
        opencodeProvider: "openrouter",
        opencodeProviders: ["openrouter", "ollama"],
      },
    }),
    "utf-8",
  );
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
  // opencode.json with both provider blocks present
  fs.mkdirSync(path.join(dir, ".opencode"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".opencode", "opencode.json"),
    JSON.stringify({
      provider: {
        openrouter: {
          npm: "@ai-sdk/openai-compatible",
          name: "OpenRouter",
          options: {
            baseURL: "https://integrate.api.openrouter.com/v1",
            apiKey: "{env:BKIT_OPENROUTER_API_KEY}",
          },
        },
        ollama: {
          npm: "@ai-sdk/openai-compatible",
          name: "Ollama (Local)",
          options: { baseURL: "http://localhost:11434/v1" },
        },
      },
    }),
    "utf-8",
  );
}

describe("bkit status — multi-provider (Task 5 / #281)", () => {
  it("shows both providers with (active) marker on the active one", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMultiProvider(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "status"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.status, `status crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
    // Must say "providers:" (plural) when multiple are installed
    expect(result.stdout).toMatch(/providers:/);
    // Active provider has (active) label
    expect(result.stdout).toMatch(/openrouter \(active\)/);
    // Second provider is listed without (active)
    expect(result.stdout).toContain("ollama");
    // (active) appears exactly once (only on the active provider)
    const activeMatches = (result.stdout.match(/\(active\)/g) ?? []).length;
    expect(activeMatches).toBe(1);
  });

  it("keeps singular provider: format when only one provider installed", () => {
    if (!fs.existsSync(tsxBin)) return;

    // Single-provider fixture
    seedMinimalConsumer(tmpDir);
    fs.mkdirSync(path.join(tmpDir, ".opencode"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".opencode", "opencode.json"),
      JSON.stringify({
        provider: {
          openrouter: {
            npm: "@ai-sdk/openai-compatible",
            name: "OpenRouter",
            options: {
              baseURL: "https://integrate.api.openrouter.com/v1",
              apiKey: "{env:BKIT_OPENROUTER_API_KEY}",
            },
          },
        },
      }),
      "utf-8",
    );

    const result = spawnSync(tsxBin, [bkitInstallPath, "status"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.status).toBe(0);
    // Singular label when only one provider
    expect(result.stdout).toMatch(/provider:/);
    expect(result.stdout).not.toMatch(/\(active\)/);
  });
});

describe("bkit doctor — multi-provider cred check (Task 5 / #281)", () => {
  it("checks credentials for ALL installed providers", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMultiProvider(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.status, `doctor crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
    const combined = result.stdout + result.stderr;
    // active provider key check
    expect(combined).toMatch(/BKIT_OPENROUTER_API_KEY/);
    // secondary installed provider key check
    expect(combined).toMatch(/BKIT_OLLAMA_API_KEY/);
  });

  it("marks the active provider with (active) label in doctor output", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMultiProvider(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
    });

    expect(result.status, `doctor crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
    const combined = result.stdout + result.stderr;
    expect(combined).toMatch(/openrouter.*\(active\)/);
    expect(combined).toMatch(/ollama.*\(installed\)/);
  });
});
