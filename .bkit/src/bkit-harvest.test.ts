// bkit-harvest.test.ts — Unit tests for harvest dedup + tolerant-tail.
//
// WS4-T2 Derived Test Matrix row:
//   "Harvest dedupes by per-`kind` composite `(ts, repo, …)` across repeat runs;
//    tolerant `parse` skips half-written tail"
//
// consumerPathToSlug (real git remote resolution) is covered in
// bkit-harvest.integration.test.ts (real `git init` subprocess).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CONSUMERS_FILE, HARVEST_COPY_FILES, HARVEST_DEST_DIR, runHarvest } from "./bkit-harvest";
import { identity, parse, type TelemetryEvent } from "./bkit-telemetry";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeRow(kind: string, ts: number, extra: Record<string, unknown> = {}): string {
  const base = {
    ts,
    kind,
    repo: "test-owner/consumer-app",
    bkitVersion: "4.1.4",
    workflow: "build",
    step: "build-close-workflow",
  };
  return JSON.stringify({ ...base, ...extra });
}

function statsRow(ts: number, prNumber = 42): string {
  return makeRow("outcome", ts, {
    prNumber,
    linesAdded: 10,
    linesDeleted: 5,
    linesChanged: 15,
    filesChanged: 3,
    taskCount: 5,
    durationSeconds: 300,
    deferrals: 0,
    failures: 0,
  });
}

function frictionRow(ts: number, key: string): string {
  return makeRow("friction", ts, {
    key,
    category: "agent-rework",
    scope: "consumer",
    description: "test friction entry",
  });
}

// ---------------------------------------------------------------------------
// Temp dir helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-harvest-unit-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeConsumerRepo(basePath: string, content: Record<string, string>): void {
  fs.mkdirSync(path.join(basePath, ".bkit"), { recursive: true });
  fs.mkdirSync(path.join(basePath, "docs"), { recursive: true });
  for (const [rel, data] of Object.entries(content)) {
    fs.writeFileSync(path.join(basePath, rel), data, "utf-8");
  }
}

function makeBkitRoot(basePath: string, consumers: string[]): string {
  const bkitRoot = path.join(basePath, "bkit");
  fs.mkdirSync(path.join(bkitRoot, ".bkit"), { recursive: true });
  const consumersContent = consumers.join("\n") + "\n";
  fs.writeFileSync(path.join(bkitRoot, CONSUMERS_FILE), consumersContent, "utf-8");
  return bkitRoot;
}

// ---------------------------------------------------------------------------
// WS4-T2 tests: dedup + tolerant-tail
// ---------------------------------------------------------------------------

describe("Harvest dedup by per-kind composite identity (WS4-T2)", () => {
  it("repeat harvest of same rows does not duplicate (idempotent)", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    const row1 = statsRow(1_700_000_001_000, 1);
    const row2 = frictionRow(1_700_000_001_001, "fk-1");
    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": row1 + "\n",
      ".bkit/friction.jsonl": row2 + "\n",
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    // First harvest
    const result1 = runHarvest(bkitRoot);
    const statsPath = path.join(bkitRoot, HARVEST_DEST_DIR, "stats.jsonl");
    const frictionPath = path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl");
    const statsCount1 = fs
      .readFileSync(statsPath, "utf-8")
      .trim()
      .split("\n")
      .filter(Boolean).length;
    const frictionCount1 = fs
      .readFileSync(frictionPath, "utf-8")
      .trim()
      .split("\n")
      .filter(Boolean).length;

    // Second harvest (same data) — should NOT duplicate
    const result2 = runHarvest(bkitRoot);
    const statsCount2 = fs
      .readFileSync(statsPath, "utf-8")
      .trim()
      .split("\n")
      .filter(Boolean).length;
    const frictionCount2 = fs
      .readFileSync(frictionPath, "utf-8")
      .trim()
      .split("\n")
      .filter(Boolean).length;

    expect(statsCount1).toBe(1);
    expect(frictionCount1).toBe(1);
    // After second harvest: still 1 (dedup works)
    expect(statsCount2).toBe(1);
    expect(frictionCount2).toBe(1);

    expect(result1.dedupedRows).toBe(2);
    expect(result2.dedupedRows).toBe(2);
  });

  it("rows with different identity keys are preserved (not over-deduped)", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    // Two outcome rows with DIFFERENT prNumber = different identity
    const row1 = statsRow(1_700_000_001_000, 1);
    const row2 = statsRow(1_700_000_001_001, 2);
    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": row1 + "\n" + row2 + "\n",
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    const result = runHarvest(bkitRoot);

    const statsPath = path.join(bkitRoot, HARVEST_DEST_DIR, "stats.jsonl");
    const count = fs.readFileSync(statsPath, "utf-8").trim().split("\n").filter(Boolean).length;
    expect(count).toBe(2); // Both distinct rows preserved
    expect(result.dedupedRows).toBe(2);
  });

  it("later row (higher ts) wins for same composite key", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    // Two friction rows with the SAME key — only later ts should survive
    const row1 = frictionRow(1_700_000_001_000, "same-key");
    const row2WithUpdate = JSON.stringify({
      ...JSON.parse(frictionRow(1_700_000_001_999, "same-key")),
      description: "updated description",
    });
    makeConsumerRepo(consumerPath, {
      ".bkit/friction.jsonl": row1 + "\n" + row2WithUpdate + "\n",
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    runHarvest(bkitRoot);

    const frictionPath = path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl");
    const lines = fs.readFileSync(frictionPath, "utf-8").trim().split("\n").filter(Boolean);
    expect(lines.length).toBe(1); // Deduped to 1
    const surviving = JSON.parse(lines[0]!) as TelemetryEvent & { description: string };
    expect(surviving.ts).toBe(1_700_000_001_999);
    expect(surviving.description).toBe("updated description");
  });
});

describe("Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2)", () => {
  it("skips a half-written trailing line without throwing", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    const good1 = statsRow(1_700_000_001_000, 1);
    const good2 = statsRow(1_700_000_001_001, 2);
    // Half-written tail (truncated JSON)
    const halfLine = '{"ts":1700000001002,"kind":"outcome","schemaVersion":1,"repo":"test';
    const content = good1 + "\n" + good2 + "\n" + halfLine;

    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": content,
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    // Must not throw
    let result: ReturnType<typeof runHarvest> | undefined;
    expect(() => {
      result = runHarvest(bkitRoot);
    }).not.toThrow();

    // 2 good rows copied, 1 malformed skipped
    const statsPath = path.join(bkitRoot, HARVEST_DEST_DIR, "stats.jsonl");
    const rows = fs.readFileSync(statsPath, "utf-8").trim().split("\n").filter(Boolean);
    expect(rows.length).toBe(2);

    // malformedLineCount accumulated
    expect(result?.consumers[0]?.malformedLineCount).toBe(1);
  });

  it("handles entirely empty .jsonl file without throwing", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": "",
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    expect(() => runHarvest(bkitRoot)).not.toThrow();
    // Dest may or may not exist; no rows
    const statsPath = path.join(bkitRoot, HARVEST_DEST_DIR, "stats.jsonl");
    if (fs.existsSync(statsPath)) {
      const content = fs.readFileSync(statsPath, "utf-8").trim();
      expect(content).toBe("");
    }
  });

  it("handles a file with only malformed lines without throwing", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": "not json\nalso not json\n",
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    expect(() => runHarvest(bkitRoot)).not.toThrow();
    expect(runHarvest(bkitRoot).consumers[0]?.malformedLineCount).toBeGreaterThanOrEqual(2);
  });
});

describe("HARVEST_COPY_FILES constant", () => {
  it("contains only the two named .jsonl ledgers", () => {
    expect(HARVEST_COPY_FILES).toContain("stats.jsonl");
    expect(HARVEST_COPY_FILES).toContain("friction.jsonl");
    expect(HARVEST_COPY_FILES).toHaveLength(2);
  });
});
