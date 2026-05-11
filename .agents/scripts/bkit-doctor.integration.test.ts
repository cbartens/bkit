// bkit-doctor.integration.test.ts — Integration test for `bkit doctor` verb (P1.T1).
// Tests the read-only advisory replay on a stale-pin scratch consumer fixture.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const bkitInstallPath = path.resolve(__dirname, "bkit-install.ts");
const tsxBin = path.resolve(__dirname, "../../node_modules/.bin/tsx");

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
  // Create a stale .agents/.bkit-version (older than installed)
  fs.mkdirSync(path.join(dir, ".agents"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".agents", ".bkit-version"), "0.4.1\n", "utf-8");
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
      env: { ...process.env, GH_BKIT_TOKEN: "test-token" },
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
      env: { ...process.env, GH_BKIT_TOKEN: "test-token" },
    });

    expect(result.stdout).toContain("[bkit-doctor]");
  });

  it("emits bkit-version-pin-stale advisory when installed version > on-disk version", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);
    seedStaleVersionPin(tmpDir);

    const result = spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env, GH_BKIT_TOKEN: "test-token" },
    });

    // doctor exits 0 even when advisories are found (read-only)
    expect(result.status, `doctor crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);

    // Should contain the stale-pin advisory
    const combinedOutput = result.stdout + result.stderr;
    expect(combinedOutput).toContain("bkit-version-pin-stale");
  });

  it("does NOT write any files to the consumer directory", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedMinimalConsumer(tmpDir);

    // Capture all files before
    const filesBefore = listFilesRecursive(tmpDir);

    spawnSync(tsxBin, [bkitInstallPath, "doctor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env, GH_BKIT_TOKEN: "test-token" },
    });

    const filesAfter = listFilesRecursive(tmpDir);

    // No new files should have been written
    expect(filesAfter.sort()).toEqual(filesBefore.sort());
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
// BAR-167 Phase 1 — doctor surfaces tier2-json-drift and legacy-bkit-envelope advisories
// ---------------------------------------------------------------------------

import { detectLegacyBkitEnvelope, detectTier2JsonDrift, runPreflight } from "./bkit-preflight";

describe("bkit doctor — BAR-167 Phase 1 advisory surface", () => {
  it("tier2-json-drift and legacy-bkit-envelope-detected surface through runPreflight", () => {
    // Seed consumer with __bkit__ in settings.json (legacy envelope)
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }), "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify({ __bkit__: { hooks: {} } }),
      "utf-8",
    );
    // .cursor/hooks.json missing bkit content (tier2-json-drift)
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "hooks.json"),
      JSON.stringify({ customKey: "consumer-only" }),
      "utf-8",
    );

    const modules = new Set<import("./bkit-cli").ModuleFlag>(["claude", "cursor"]);
    const { advisories } = runPreflight(modules, tmpDir, "2.0.0");

    const ids = advisories.map((a) => a.id);
    expect(ids).toContain("legacy-bkit-envelope-detected");
    expect(ids).toContain("tier2-json-drift");
  });

  it("no drift/envelope advisories when consumer is schema-clean and fully contained", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const templateSettings = path.join(pkgRoot, ".agents", "templates", ".claude", "settings.json");
    const templateHooks = path.join(pkgRoot, ".agents", "templates", ".cursor", "hooks.json");

    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }), "utf-8");
    // Copy templates as-is → fully contained, no envelope
    fs.copyFileSync(templateSettings, path.join(tmpDir, ".claude", "settings.json"));
    fs.copyFileSync(templateHooks, path.join(tmpDir, ".cursor", "hooks.json"));

    const modules = new Set<import("./bkit-cli").ModuleFlag>(["claude", "cursor"]);
    const { advisories } = runPreflight(modules, tmpDir, "2.0.0");

    const ids = advisories.map((a) => a.id);
    expect(ids).not.toContain("legacy-bkit-envelope-detected");
    expect(ids).not.toContain("tier2-json-drift");
  });
});
