import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { migrateDebugFetchBlocks, migrateDebugFetchToConfig } from "./bkit-config-migrate";

// Minimal config.md with a managed block + consumer tail (matches the shipped shape).
const CONFIG_BASE = "<!-- bkit:start -->\n# Config\n\n<!-- bkit:end -->\n\n## Enabled blocks\n";

// observability.md managed block ending in bkit:end (post-relocation pointer shape).
const OBS_MANAGED = "<!-- bkit:start -->\n# Observability\n\n<!-- bkit:end -->\n";

const VERCEL_FETCH =
  "<!-- debug-fetch:start vercel -->\n```bash\nvercel logs --json\n```\n<!-- debug-fetch:end -->";
const VERCEL_PROVISION =
  "<!-- debug-fetch:provision vercel -->\n```bash\ncommand -v vercel || pnpm add -g vercel\n```\n<!-- debug-fetch:end -->";

describe("migrateDebugFetchBlocks (pure)", () => {
  it("no-ops when observability.md has no managed block", () => {
    const r = migrateDebugFetchBlocks("# consumer-owned\n\n" + VERCEL_FETCH + "\n", CONFIG_BASE);
    expect(r.migrated).toBe(false);
    expect(r.blockCount).toBe(0);
  });

  it("no-ops when there are no consumer-section debug-fetch blocks", () => {
    const r = migrateDebugFetchBlocks(OBS_MANAGED + "\n## Scope\n\nsome prose\n", CONFIG_BASE);
    expect(r.migrated).toBe(false);
    expect(r.newConfig).toBe(CONFIG_BASE);
  });

  it("no-ops when config.md has no managed block (nothing to append below)", () => {
    const r = migrateDebugFetchBlocks(OBS_MANAGED + "\n" + VERCEL_FETCH + "\n", "# raw config\n");
    expect(r.migrated).toBe(false);
  });

  it("moves a fetch block out of observability into config", () => {
    const obs = OBS_MANAGED + "\n## Consumer\n\n" + VERCEL_FETCH + "\n";
    const r = migrateDebugFetchBlocks(obs, CONFIG_BASE);
    expect(r.migrated).toBe(true);
    expect(r.blockCount).toBe(1);
    // Removed from observability, but non-debug-fetch prose kept.
    expect(r.newObservability).not.toContain("debug-fetch:start vercel");
    expect(r.newObservability).toContain("## Consumer");
    // Appended to config, verbatim.
    expect(r.newConfig).toContain("debug-fetch:start vercel");
    expect(r.newConfig).toContain("vercel logs --json");
  });

  it("moves fetch + provision + none blocks together", () => {
    const obs =
      OBS_MANAGED +
      "\n" +
      VERCEL_FETCH +
      "\n\n" +
      VERCEL_PROVISION +
      "\n\n<!-- debug-fetch:none intentional -->\n";
    const r = migrateDebugFetchBlocks(obs, CONFIG_BASE);
    expect(r.blockCount).toBe(3);
    expect(r.newConfig).toContain("debug-fetch:provision vercel");
    expect(r.newConfig).toContain("debug-fetch:none intentional");
    expect(r.newObservability).not.toContain("debug-fetch:");
  });

  it("is idempotent — a second pass over the migrated pair is a no-op", () => {
    const obs = OBS_MANAGED + "\n" + VERCEL_FETCH + "\n";
    const first = migrateDebugFetchBlocks(obs, CONFIG_BASE);
    expect(first.migrated).toBe(true);
    const second = migrateDebugFetchBlocks(first.newObservability, first.newConfig);
    expect(second.migrated).toBe(false);
    expect(second.newConfig).toBe(first.newConfig);
  });

  it("dedups — a block already present in config is removed from observability, not duplicated", () => {
    const obs = OBS_MANAGED + "\n" + VERCEL_FETCH + "\n";
    const config = CONFIG_BASE + "\n" + VERCEL_FETCH + "\n"; // already migrated
    const r = migrateDebugFetchBlocks(obs, config);
    expect(r.migrated).toBe(true); // observability still gets cleaned
    expect(r.newObservability).not.toContain("debug-fetch:start vercel");
    // config.md must contain the block exactly once (no duplicate append).
    const occurrences = r.newConfig.split("debug-fetch:start vercel").length - 1;
    expect(occurrences).toBe(1);
  });

  it("leaves a malformed (unclosed) block untouched", () => {
    const obs = OBS_MANAGED + "\n<!-- debug-fetch:start vercel -->\n```bash\nno close marker\n";
    const r = migrateDebugFetchBlocks(obs, CONFIG_BASE);
    expect(r.migrated).toBe(false);
  });
});

describe("migrateDebugFetchToConfig (filesystem)", () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-config-migrate-"));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function write(rel: string, content: string): void {
    const abs = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
  }

  it("returns null when either file is absent", () => {
    write("docs/observability.md", OBS_MANAGED + "\n" + VERCEL_FETCH + "\n");
    expect(migrateDebugFetchToConfig(tmpDir, false)).toBeNull(); // no config.md
  });

  it("moves blocks and writes both files", () => {
    write("docs/observability.md", OBS_MANAGED + "\n" + VERCEL_FETCH + "\n");
    write(".agents/config.md", CONFIG_BASE);
    const line = migrateDebugFetchToConfig(tmpDir, false);
    expect(line).toContain("migrated 1 debug-fetch block");
    expect(fs.readFileSync(path.join(tmpDir, ".agents/config.md"), "utf-8")).toContain(
      "vercel logs --json",
    );
    expect(fs.readFileSync(path.join(tmpDir, "docs/observability.md"), "utf-8")).not.toContain(
      "debug-fetch:start vercel",
    );
  });

  it("dry-run reports but writes nothing", () => {
    write("docs/observability.md", OBS_MANAGED + "\n" + VERCEL_FETCH + "\n");
    write(".agents/config.md", CONFIG_BASE);
    const before = fs.readFileSync(path.join(tmpDir, "docs/observability.md"), "utf-8");
    const line = migrateDebugFetchToConfig(tmpDir, true);
    expect(line).toContain("migrated 1 debug-fetch block");
    expect(fs.readFileSync(path.join(tmpDir, "docs/observability.md"), "utf-8")).toBe(before);
    expect(fs.readFileSync(path.join(tmpDir, ".agents/config.md"), "utf-8")).toBe(CONFIG_BASE);
  });

  it("returns null (no-op) when there is nothing to migrate", () => {
    write("docs/observability.md", OBS_MANAGED + "\n## Scope\n\nprose\n");
    write(".agents/config.md", CONFIG_BASE);
    expect(migrateDebugFetchToConfig(tmpDir, false)).toBeNull();
  });
});
