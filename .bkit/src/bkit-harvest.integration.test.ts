// bkit-harvest.integration.test.ts — boundary: filesystem/consumer repo.
//
// Tests that harvest COPIES consumer .bkit/*.jsonl and NEVER writes/truncates
// the consumer repo (consumer file mtime + content unchanged after harvest).
// Ground-truth = real filesystem stat, no mock.
//
// WS4-T1 Derived Test Matrix row:
//   "Harvest COPIES consumer `.bkit/*.jsonl` and NEVER writes/truncates the consumer
//   repo (consumer file mtime + content unchanged)"

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  CONSUMERS_FILE,
  HARVEST_COPY_FILES,
  HARVEST_COUNT_FILES,
  HARVEST_DEST_DIR,
  fileUnchanged,
  harvestConsumer,
  runHarvest,
  snapshotFile,
} from "./bkit-harvest";

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

function statsRow(ts: number, prNumber = 1): string {
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

function deferralRow(ts: number, key: string): string {
  return makeRow("deferral", ts, {
    key,
    type: "issue",
    category: "agentic",
    description: "test deferral",
  });
}

// ---------------------------------------------------------------------------
// Temp dir helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-harvest-integration-"));
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
// WS4-T1 Boundary test: consumer file content + mtime unchanged after harvest
// ---------------------------------------------------------------------------

describe("Harvest boundary: consumer file mtime + content unchanged (WS4-T1)", () => {
  it("does not write/truncate consumer .bkit/*.jsonl (mtime + content preserved)", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    // Use distinct prNumbers so the two stats rows have different identity and survive dedup
    const statsContent =
      [statsRow(1_700_000_000_001, 100), statsRow(1_700_000_000_002, 101)].join("\n") + "\n";
    const frictionContent = frictionRow(1_700_000_000_003, "fk-1") + "\n";

    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": statsContent,
      ".bkit/friction.jsonl": frictionContent,
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    // Snapshot BEFORE
    const statsBefore = snapshotFile(path.join(consumerPath, ".bkit", "stats.jsonl"));
    const frictionBefore = snapshotFile(path.join(consumerPath, ".bkit", "friction.jsonl"));
    expect(statsBefore).not.toBeNull();
    expect(frictionBefore).not.toBeNull();

    // Run harvest
    const result = runHarvest(bkitRoot);

    // Snapshot AFTER
    const statsAfter = snapshotFile(path.join(consumerPath, ".bkit", "stats.jsonl"));
    const frictionAfter = snapshotFile(path.join(consumerPath, ".bkit", "friction.jsonl"));

    // Ground-truth filesystem assertions — no mocks
    expect(statsAfter).not.toBeNull();
    expect(frictionAfter).not.toBeNull();
    expect(fileUnchanged(statsBefore!, statsAfter!)).toBe(true);
    expect(fileUnchanged(frictionBefore!, frictionAfter!)).toBe(true);

    // bkit central store gained the copied rows
    const harvestStatsPath = path.join(bkitRoot, HARVEST_DEST_DIR, "stats.jsonl");
    expect(fs.existsSync(harvestStatsPath)).toBe(true);
    const harvestContent = fs.readFileSync(harvestStatsPath, "utf-8");
    expect(harvestContent.trim().split("\n").length).toBe(2); // 2 rows copied

    expect(result.consumers).toHaveLength(1);
    expect(result.consumers[0]!.skipped).toBe(false);
    expect(result.consumers[0]!.copiedRows).toBe(3); // 2 stats + 1 friction
  });

  it("does not write to missing consumer paths (skips gracefully)", () => {
    const consumerPath = path.join(tmpDir, "nonexistent-consumer");
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    const result = runHarvest(bkitRoot);

    expect(result.consumers).toHaveLength(1);
    expect(result.consumers[0]!.skipped).toBe(true);
    expect(result.consumers[0]!.skipReason).toMatch(/not found/);
    expect(result.totalCopiedRows).toBe(0);
  });

  it("count-only aggregates deferrals.jsonl and failures.jsonl without copying prose", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    const deferralsContent =
      [deferralRow(1_700_000_001_000, "defer-1"), deferralRow(1_700_000_001_001, "defer-2")].join(
        "\n",
      ) + "\n";

    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": statsRow(1_700_000_000_001) + "\n",
      "docs/deferrals.jsonl": deferralsContent,
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    // Snapshot deferrals BEFORE
    const deferralsBefore = snapshotFile(path.join(consumerPath, "docs", "deferrals.jsonl"));

    runHarvest(bkitRoot);

    // Snapshot deferrals AFTER — must be unchanged (count-only = no write)
    const deferralsAfter = snapshotFile(path.join(consumerPath, "docs", "deferrals.jsonl"));
    expect(fileUnchanged(deferralsBefore!, deferralsAfter!)).toBe(true);

    // Verify count-only result (no prose file in harvest dest)
    const harvestDeferralsPath = path.join(bkitRoot, HARVEST_DEST_DIR, "deferrals.jsonl");
    expect(fs.existsSync(harvestDeferralsPath)).toBe(false); // NOT copied
  });

  it("does not copy .env or any file outside the named .jsonl ledgers", () => {
    const consumerPath = path.join(tmpDir, "consumer-secret");
    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": statsRow(1_700_000_000_001) + "\n",
      ".bkit/.env": "SECRET_KEY=hunter2",
      ".bkit/other.jsonl": statsRow(1_700_000_000_002) + "\n",
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    runHarvest(bkitRoot);

    const destDir = path.join(bkitRoot, HARVEST_DEST_DIR);
    const copiedFiles = fs.existsSync(destDir) ? fs.readdirSync(destDir) : [];

    // Only named .jsonl files are allowed in the harvest dest
    for (const f of copiedFiles) {
      expect(HARVEST_COPY_FILES as readonly string[]).toContain(f);
    }

    // Specifically .env and other.jsonl must NOT be copied
    expect(fs.existsSync(path.join(destDir, ".env"))).toBe(false);
    expect(fs.existsSync(path.join(destDir, "other.jsonl"))).toBe(false);
  });

  it("harvest multiple consumers and combines rows into bkit central store", () => {
    const consumer1 = path.join(tmpDir, "consumer-1");
    const consumer2 = path.join(tmpDir, "consumer-2");

    // Use distinct prNumbers so the two consumer rows have different identity and both survive dedup
    makeConsumerRepo(consumer1, {
      ".bkit/stats.jsonl": statsRow(1_700_000_001_000, 201) + "\n",
    });
    makeConsumerRepo(consumer2, {
      ".bkit/stats.jsonl": statsRow(1_700_000_002_000, 202) + "\n",
    });

    const bkitRoot = makeBkitRoot(tmpDir, [consumer1, consumer2]);

    // Snapshots BEFORE
    const c1Before = snapshotFile(path.join(consumer1, ".bkit", "stats.jsonl"));
    const c2Before = snapshotFile(path.join(consumer2, ".bkit", "stats.jsonl"));

    const result = runHarvest(bkitRoot);

    // Snapshots AFTER — both consumers unchanged
    const c1After = snapshotFile(path.join(consumer1, ".bkit", "stats.jsonl"));
    const c2After = snapshotFile(path.join(consumer2, ".bkit", "stats.jsonl"));
    expect(fileUnchanged(c1Before!, c1After!)).toBe(true);
    expect(fileUnchanged(c2Before!, c2After!)).toBe(true);

    // Both consumers harvested
    expect(result.consumers).toHaveLength(2);
    expect(result.consumers[0]!.skipped).toBe(false);
    expect(result.consumers[1]!.skipped).toBe(false);

    // Harvest store has 2 rows (one per consumer)
    const harvestStats = path.join(bkitRoot, HARVEST_DEST_DIR, "stats.jsonl");
    const rows = fs.readFileSync(harvestStats, "utf-8").trim().split("\n");
    expect(rows.length).toBe(2);
  });
});
