import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  migrateConfigMdToContext,
  migrateContextFetchBlocks,
  migrateContextFetchToContext,
  renameLegacyContextFetchMarkers,
} from "./bkit-context-migrate";

// Minimal config.md with a managed block + consumer tail (matches the shipped shape).
const CONTEXT_BASE = "<!-- bkit:start -->\n# Config\n\n<!-- bkit:end -->\n\n## Enabled blocks\n";

// observability.md managed block ending in bkit:end (post-relocation pointer shape).
const OBS_MANAGED = "<!-- bkit:start -->\n# Observability\n\n<!-- bkit:end -->\n";

const VERCEL_FETCH =
  "<!-- context-fetch:start vercel -->\n```bash\nvercel logs --json\n```\n<!-- context-fetch:end -->";
const VERCEL_PROVISION =
  "<!-- context-fetch:provision vercel -->\n```bash\ncommand -v vercel || pnpm add -g vercel\n```\n<!-- context-fetch:end -->";

describe("migrateContextFetchBlocks (pure)", () => {
  it("no-ops when observability.md has no managed block", () => {
    const r = migrateContextFetchBlocks("# consumer-owned\n\n" + VERCEL_FETCH + "\n", CONTEXT_BASE);
    expect(r.migrated).toBe(false);
    expect(r.blockCount).toBe(0);
  });

  it("no-ops when there are no consumer-section context-fetch blocks", () => {
    const r = migrateContextFetchBlocks(OBS_MANAGED + "\n## Scope\n\nsome prose\n", CONTEXT_BASE);
    expect(r.migrated).toBe(false);
    expect(r.newContext).toBe(CONTEXT_BASE);
  });

  it("no-ops when config.md has no managed block (nothing to append below)", () => {
    const r = migrateContextFetchBlocks(OBS_MANAGED + "\n" + VERCEL_FETCH + "\n", "# raw config\n");
    expect(r.migrated).toBe(false);
  });

  it("moves a fetch block out of observability into config", () => {
    const obs = OBS_MANAGED + "\n## Consumer\n\n" + VERCEL_FETCH + "\n";
    const r = migrateContextFetchBlocks(obs, CONTEXT_BASE);
    expect(r.migrated).toBe(true);
    expect(r.blockCount).toBe(1);
    // Removed from observability, but non-context-fetch prose kept.
    expect(r.newObservability).not.toContain("context-fetch:start vercel");
    expect(r.newObservability).toContain("## Consumer");
    // Appended to config, verbatim.
    expect(r.newContext).toContain("context-fetch:start vercel");
    expect(r.newContext).toContain("vercel logs --json");
  });

  it("moves fetch + provision + none blocks together", () => {
    const obs =
      OBS_MANAGED +
      "\n" +
      VERCEL_FETCH +
      "\n\n" +
      VERCEL_PROVISION +
      "\n\n<!-- context-fetch:none intentional -->\n";
    const r = migrateContextFetchBlocks(obs, CONTEXT_BASE);
    expect(r.blockCount).toBe(3);
    expect(r.newContext).toContain("context-fetch:provision vercel");
    expect(r.newContext).toContain("context-fetch:none intentional");
    expect(r.newObservability).not.toContain("context-fetch:");
  });

  it("is idempotent — a second pass over the migrated pair is a no-op", () => {
    const obs = OBS_MANAGED + "\n" + VERCEL_FETCH + "\n";
    const first = migrateContextFetchBlocks(obs, CONTEXT_BASE);
    expect(first.migrated).toBe(true);
    const second = migrateContextFetchBlocks(first.newObservability, first.newContext);
    expect(second.migrated).toBe(false);
    expect(second.newContext).toBe(first.newContext);
  });

  it("dedups — a block already present in config is removed from observability, not duplicated", () => {
    const obs = OBS_MANAGED + "\n" + VERCEL_FETCH + "\n";
    const config = CONTEXT_BASE + "\n" + VERCEL_FETCH + "\n"; // already migrated
    const r = migrateContextFetchBlocks(obs, config);
    expect(r.migrated).toBe(true); // observability still gets cleaned
    expect(r.newObservability).not.toContain("context-fetch:start vercel");
    // config.md must contain the block exactly once (no duplicate append).
    const occurrences = r.newContext.split("context-fetch:start vercel").length - 1;
    expect(occurrences).toBe(1);
  });

  it("leaves a malformed (unclosed) block untouched", () => {
    const obs = OBS_MANAGED + "\n<!-- context-fetch:start vercel -->\n```bash\nno close marker\n";
    const r = migrateContextFetchBlocks(obs, CONTEXT_BASE);
    expect(r.migrated).toBe(false);
  });
});

describe("migrateContextFetchToContext (filesystem)", () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-context-migrate-"));
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
    expect(migrateContextFetchToContext(tmpDir, false)).toBeNull(); // no context.md
  });

  it("moves blocks and writes both files", () => {
    write("docs/observability.md", OBS_MANAGED + "\n" + VERCEL_FETCH + "\n");
    write(".agents/context.md", CONTEXT_BASE);
    const line = migrateContextFetchToContext(tmpDir, false);
    expect(line).toContain("migrated 1 context-fetch block");
    expect(fs.readFileSync(path.join(tmpDir, ".agents/context.md"), "utf-8")).toContain(
      "vercel logs --json",
    );
    expect(fs.readFileSync(path.join(tmpDir, "docs/observability.md"), "utf-8")).not.toContain(
      "context-fetch:start vercel",
    );
  });

  it("dry-run reports but writes nothing", () => {
    write("docs/observability.md", OBS_MANAGED + "\n" + VERCEL_FETCH + "\n");
    write(".agents/context.md", CONTEXT_BASE);
    const before = fs.readFileSync(path.join(tmpDir, "docs/observability.md"), "utf-8");
    const line = migrateContextFetchToContext(tmpDir, true);
    expect(line).toContain("migrated 1 context-fetch block");
    expect(fs.readFileSync(path.join(tmpDir, "docs/observability.md"), "utf-8")).toBe(before);
    expect(fs.readFileSync(path.join(tmpDir, ".agents/context.md"), "utf-8")).toBe(CONTEXT_BASE);
  });

  it("returns null (no-op) when there is nothing to migrate", () => {
    write("docs/observability.md", OBS_MANAGED + "\n## Scope\n\nprose\n");
    write(".agents/context.md", CONTEXT_BASE);
    expect(migrateContextFetchToContext(tmpDir, false)).toBeNull();
  });
});

// The `debug-fetch:` marker vocabulary, as a consumer's own config.md carries it.
const LEGACY_CONSUMER =
  "<!-- debug-fetch:start vercel context=runtime -->\n" +
  "```bash\n" +
  'command -v vercel || { echo "[debug-fetch:vercel] skipped — no CLI" >&2; exit 0; }\n' +
  "vercel logs --json\n" +
  "```\n" +
  "<!-- debug-fetch:end -->";

describe("renameLegacyContextFetchMarkers (pure)", () => {
  it("renames all four markers and the self-skip breadcrumb in one pass", () => {
    const out = renameLegacyContextFetchMarkers(
      "<!-- debug-fetch:start a -->\n<!-- debug-fetch:end -->\n" +
        "<!-- debug-fetch:provision a -->\n<!-- debug-fetch:none e2e -->\n" +
        'echo "[debug-fetch:a] skipped — nope"',
    );
    expect(out).not.toContain("debug-fetch:");
    expect(out).toContain("<!-- context-fetch:start a -->");
    expect(out).toContain("<!-- context-fetch:end -->");
    expect(out).toContain("<!-- context-fetch:provision a -->");
    expect(out).toContain("<!-- context-fetch:none e2e -->");
    expect(out).toContain("[context-fetch:a] skipped");
  });

  it("leaves the word debug alone everywhere else", () => {
    const src = "# Debugging\n\nRun `pnpm debug-fetcher` and read debug-fetch.log\n";
    expect(renameLegacyContextFetchMarkers(src)).toBe(src);
  });
});

describe("migrateConfigMdToContext (filesystem)", () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-configmd-migrate-"));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function write(rel: string, content: string): void {
    const abs = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
  }
  const read = (rel: string): string => fs.readFileSync(path.join(tmpDir, rel), "utf-8");
  const exists = (rel: string): boolean => fs.existsSync(path.join(tmpDir, rel));

  it("returns null when there is no legacy config.md (the steady state)", () => {
    write(".agents/context.md", CONTEXT_BASE);
    expect(migrateConfigMdToContext(tmpDir, false)).toBeNull();
  });

  it("moves the whole file when context.md does not exist yet", () => {
    write(".agents/config.md", CONTEXT_BASE + "\n" + LEGACY_CONSUMER + "\n");
    const line = migrateConfigMdToContext(tmpDir, false);
    expect(line).toContain("moved .agents/config.md → .agents/context.md");
    expect(exists(".agents/config.md")).toBe(false);
    expect(read(".agents/context.md")).toContain(
      "<!-- context-fetch:start vercel context=runtime -->",
    );
    expect(read(".agents/context.md")).not.toContain("debug-fetch:");
  });

  it("carries the consumer section across when the render already wrote context.md", () => {
    write(".agents/config.md", CONTEXT_BASE + "\n" + LEGACY_CONSUMER + "\n");
    write(".agents/context.md", CONTEXT_BASE);
    const line = migrateConfigMdToContext(tmpDir, false);
    expect(line).toContain("merged .agents/config.md consumer section");
    expect(exists(".agents/config.md")).toBe(false);
    const out = read(".agents/context.md");
    expect(out).toContain("vercel logs --json");
    expect(out).toContain("[context-fetch:vercel] skipped");
    expect(out).not.toContain("debug-fetch:");
    // The fresh managed block is bkit's and must not be duplicated by the carry.
    expect(out.match(/<!-- bkit:end -->/g)).toHaveLength(1);
  });

  it("deletes the legacy file even when it has nothing to carry", () => {
    write(".agents/config.md", CONTEXT_BASE);
    write(".agents/context.md", CONTEXT_BASE);
    const line = migrateConfigMdToContext(tmpDir, false);
    expect(line).toContain("removed superseded .agents/config.md");
    expect(exists(".agents/config.md")).toBe(false);
    expect(read(".agents/context.md")).toBe(CONTEXT_BASE);
  });

  it("treats a fully consumer-owned config.md (no managed block) as all-consumer", () => {
    write(".agents/config.md", "## My blocks\n\n" + LEGACY_CONSUMER + "\n");
    write(".agents/context.md", CONTEXT_BASE);
    migrateConfigMdToContext(tmpDir, false);
    const out = read(".agents/context.md");
    expect(out).toContain("## My blocks");
    expect(out).toContain("<!-- context-fetch:start vercel context=runtime -->");
  });

  it("dry-run reports but writes nothing and keeps the legacy file", () => {
    write(".agents/config.md", CONTEXT_BASE + "\n" + LEGACY_CONSUMER + "\n");
    write(".agents/context.md", CONTEXT_BASE);
    const line = migrateConfigMdToContext(tmpDir, true);
    expect(line).toContain("merged .agents/config.md consumer section");
    expect(exists(".agents/config.md")).toBe(true);
    expect(read(".agents/context.md")).toBe(CONTEXT_BASE);
  });

  it("is idempotent — a second run is a no-op", () => {
    write(".agents/config.md", CONTEXT_BASE + "\n" + LEGACY_CONSUMER + "\n");
    write(".agents/context.md", CONTEXT_BASE);
    migrateConfigMdToContext(tmpDir, false);
    const after = read(".agents/context.md");
    expect(migrateConfigMdToContext(tmpDir, false)).toBeNull();
    expect(read(".agents/context.md")).toBe(after);
  });

  it("does not double-append when context.md already holds the carried blocks", () => {
    const consumer = renameLegacyContextFetchMarkers(LEGACY_CONSUMER);
    write(".agents/config.md", CONTEXT_BASE + "\n" + LEGACY_CONSUMER + "\n");
    write(".agents/context.md", CONTEXT_BASE + "\n" + consumer + "\n");
    migrateConfigMdToContext(tmpDir, false);
    const out = read(".agents/context.md");
    expect(out.match(/context-fetch:start vercel/g)).toHaveLength(1);
  });
});

describe("migrateContextFetchBlocks — legacy marker vocabulary (#454 back-compat)", () => {
  const LEGACY_OBS_BLOCK =
    "<!-- debug-fetch:start sentry -->\n```bash\ncurl -s https://sentry.io/\n```\n<!-- debug-fetch:end -->";

  it("moves blocks still written as debug-fetch, renaming them on the way out", () => {
    const r = migrateContextFetchBlocks(
      OBS_MANAGED + "\n## Keep me\n\n" + LEGACY_OBS_BLOCK + "\n",
      CONTEXT_BASE,
    );
    expect(r.migrated).toBe(true);
    expect(r.blockCount).toBe(1);
    expect(r.newContext).toContain("<!-- context-fetch:start sentry -->");
    expect(r.newContext).not.toContain("debug-fetch:");
    expect(r.newObservability).not.toContain("sentry.io");
    expect(r.newObservability).toContain("## Keep me");
  });

  it("does not re-append a legacy block the consumer already carries renamed", () => {
    const already = CONTEXT_BASE + "\n" + renameLegacyContextFetchMarkers(LEGACY_OBS_BLOCK) + "\n";
    const r = migrateContextFetchBlocks(OBS_MANAGED + "\n" + LEGACY_OBS_BLOCK + "\n", already);
    expect(r.newContext.match(/context-fetch:start sentry/g)).toHaveLength(1);
  });

  it("handles a mixed file — one legacy block, one already renamed", () => {
    const r = migrateContextFetchBlocks(
      OBS_MANAGED + "\n" + LEGACY_OBS_BLOCK + "\n\n" + VERCEL_FETCH + "\n",
      CONTEXT_BASE,
    );
    expect(r.blockCount).toBe(2);
    expect(r.newContext).toContain("context-fetch:start sentry");
    expect(r.newContext).toContain("context-fetch:start vercel");
    expect(r.newContext).not.toContain("debug-fetch:");
  });
});
