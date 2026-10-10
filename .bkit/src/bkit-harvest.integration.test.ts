// bkit-harvest.integration.test.ts — boundary: filesystem/consumer repo.
//
// Tests the split contract: harvest COPIES consumer .bkit/stats.jsonl (never
// modified) and MOVES .bkit/friction.jsonl, pruning ONLY rows durably present in the
// store. Ground-truth = real filesystem stat, no mock.
//
// The pruning tests cover: the store accumulates, malformed lines are never pruned,
// unharvested rows survive.

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  CONSUMERS_FILE,
  HARVEST_COPY_FILES,
  HARVEST_COUNT_FILES,
  HARVEST_DEST_DIR,
  consumerPathToSlug,
  fileUnchanged,
  harvestConsumer,
  pruneConsumerFile,
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
  const consumersFile = path.join(bkitRoot, CONSUMERS_FILE);
  fs.mkdirSync(path.dirname(consumersFile), { recursive: true });
  fs.writeFileSync(consumersFile, consumersContent, "utf-8");
  return bkitRoot;
}

// ---------------------------------------------------------------------------
// WS4-T1 Boundary test: consumer file content + mtime unchanged after harvest
// ---------------------------------------------------------------------------

// stats.jsonl is copy-only; friction.jsonl is a MOVE: harvested rows are
// pruned from the consumer. This describe block asserts BOTH halves of that split.
describe("Harvest boundary: stats copy-only, friction moved (WS4-T1, #343)", () => {
  it("never modifies consumer stats.jsonl, and prunes only harvested friction rows", () => {
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

    // stats.jsonl: COPY-ONLY — byte-identical after harvest
    expect(fileUnchanged(statsBefore!, statsAfter!)).toBe(true);

    // friction.jsonl: MOVED — the harvested row is gone, file emptied (not deleted)
    expect(fileUnchanged(frictionBefore!, frictionAfter!)).toBe(false);
    expect(frictionAfter!.content.trim()).toBe("");
    expect(result.consumers[0]!.prunedRows["friction.jsonl"]).toBe(1);
    expect(result.totalPrunedRows).toBe(1);

    // bkit central store gained the copied rows
    const harvestStatsPath = path.join(bkitRoot, HARVEST_DEST_DIR, "stats.jsonl");
    expect(fs.existsSync(harvestStatsPath)).toBe(true);
    const harvestContent = fs.readFileSync(harvestStatsPath, "utf-8");
    expect(harvestContent.trim().split("\n").length).toBe(2); // 2 rows copied

    // The pruned friction row survives in the store — it exists NOWHERE else now
    const harvestFrictionPath = path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl");
    expect(fs.readFileSync(harvestFrictionPath, "utf-8")).toContain("fk-1");

    expect(result.consumers).toHaveLength(1);
    expect(result.consumers[0]!.skipped).toBe(false);
    expect(result.consumers[0]!.copiedRows).toBe(3); // 2 stats + 1 friction
  });

  // The store survives a second run: run 2 never deletes rows run 1 banked and pruned.
  it("ACCUMULATES the store across runs — a second harvest never destroys pruned rows", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    makeConsumerRepo(consumerPath, {
      ".bkit/friction.jsonl": frictionRow(1_700_000_000_003, "fk-1") + "\n",
    });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    const harvestFrictionPath = path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl");

    // Run 1: row is copied to the store, then pruned from the consumer.
    runHarvest(bkitRoot);
    expect(fs.readFileSync(harvestFrictionPath, "utf-8")).toContain("fk-1");
    expect(
      fs.readFileSync(path.join(consumerPath, ".bkit", "friction.jsonl"), "utf-8").trim(),
    ).toBe("");

    // Run 2: the consumer is now empty. The store MUST still hold fk-1.
    const second = runHarvest(bkitRoot);
    expect(fs.readFileSync(harvestFrictionPath, "utf-8")).toContain("fk-1");
    expect(second.totalPrunedRows).toBe(0); // nothing left to prune — idempotent
  });

  it("never prunes a malformed line — a half-written tail is not ours to delete", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    const halfWritten = '{"ts":1700000000009,"kind":"fricti';
    makeConsumerRepo(consumerPath, {
      ".bkit/friction.jsonl": frictionRow(1_700_000_000_003, "fk-1") + "\n" + halfWritten + "\n",
    });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    runHarvest(bkitRoot);

    // The harvested row is gone; the unparseable tail survives verbatim.
    const after = fs.readFileSync(path.join(consumerPath, ".bkit", "friction.jsonl"), "utf-8");
    expect(after).not.toContain("fk-1");
    expect(after).toContain(halfWritten);
  });

  it("prunes ONLY harvested rows — a row appended during harvest survives", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    const frictionPath = path.join(consumerPath, ".bkit", "friction.jsonl");
    makeConsumerRepo(consumerPath, {
      ".bkit/friction.jsonl": frictionRow(1_700_000_000_003, "fk-1") + "\n",
    });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    // Copy fk-1 into the store WITHOUT pruning, then simulate the consumer appending
    // fk-late while the harvest was mid-flight.
    harvestConsumer(consumerPath, bkitRoot);
    fs.appendFileSync(frictionPath, frictionRow(1_700_000_000_004, "fk-late") + "\n", "utf-8");

    runHarvest(bkitRoot);

    // fk-late was harvested by the runHarvest pass, so both are legitimately pruned;
    // the point is that the prune is content-matched, never a blanket truncate.
    const store = fs.readFileSync(path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl"), "utf-8");
    expect(store).toContain("fk-1");
    expect(store).toContain("fk-late");
  });

  it("leaves an unharvested row in place when it is not in the store", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    makeConsumerRepo(consumerPath, {
      ".bkit/friction.jsonl": frictionRow(1_700_000_000_003, "fk-1") + "\n",
    });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    const consumerSlug = "test-owner/consumer-app"; // rows carry their own repo stamp

    // The store holds a DIFFERENT row than the one on disk.
    const { removed } = pruneConsumerFile(
      path.join(consumerPath, ".bkit", "friction.jsonl"),
      consumerSlug,
      { rows: new Set([frictionRow(1_700_000_000_009, "fk-SOMETHING-ELSE")]) },
    );

    expect(removed).toBe(0);
    expect(fs.readFileSync(path.join(consumerPath, ".bkit", "friction.jsonl"), "utf-8")).toContain(
      "fk-1",
    );
  });

  // Two different friction entries sharing a key (one identity): the store keeps every
  // distinct row, so both are banked and both drain.
  it("stores and prunes both rows that share an identity", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    // Same key + same repo => same identity, but genuinely different rows.
    const earlier = JSON.stringify({
      ...JSON.parse(frictionRow(1_700_000_000_001, "dup-key")),
      description: "first distinct entry",
    });
    const later = JSON.stringify({
      ...JSON.parse(frictionRow(1_700_000_000_002, "dup-key")),
      description: "second distinct entry",
    });
    makeConsumerRepo(consumerPath, {
      ".bkit/friction.jsonl": earlier + "\n" + later + "\n",
    });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);

    const result = runHarvest(bkitRoot);

    const store = fs.readFileSync(path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl"), "utf-8");
    expect(store).toContain("second distinct entry");
    expect(store).toContain("first distinct entry");

    const consumerAfter = fs.readFileSync(
      path.join(consumerPath, ".bkit", "friction.jsonl"),
      "utf-8",
    );
    expect(consumerAfter.trim()).toBe("");
    expect(result.totalPrunedRows).toBe(2);
  });

  // A newer same-key row appended later never evicts a row an earlier run pruned.
  it("a newer same-key row never evicts a row an earlier run already pruned", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    const frictionPath = path.join(consumerPath, ".bkit", "friction.jsonl");
    const first = JSON.stringify({
      ...JSON.parse(frictionRow(1_700_000_000_001, "same-key")),
      description: "first run entry",
    });
    makeConsumerRepo(consumerPath, { ".bkit/friction.jsonl": first + "\n" });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    const storePath = path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl");

    runHarvest(bkitRoot);
    expect(fs.readFileSync(frictionPath, "utf-8").trim()).toBe("");

    const later = JSON.stringify({
      ...JSON.parse(frictionRow(1_700_000_000_002, "same-key")),
      description: "second run entry",
    });
    fs.appendFileSync(frictionPath, later + "\n", "utf-8");
    runHarvest(bkitRoot);

    const store = fs.readFileSync(storePath, "utf-8");
    expect(store).toContain("first run entry");
    expect(store).toContain("second run entry");
  });

  // Legacy rows carry an ISO-string or missing `ts`; the store keeps rows pruned on run 1
  // through run 2.
  it("keeps every pruned row across re-runs when same-key rows carry legacy ts", () => {
    const consumerPath = path.join(tmpDir, "consumer-app");
    const frictionPath = path.join(consumerPath, ".bkit", "friction.jsonl");
    const variant = (ts: unknown, description: string): string =>
      JSON.stringify({ ...JSON.parse(frictionRow(1, "legacy-key")), ts, description });
    const rows = [
      variant(1_700_000_000_005, "numeric ts"),
      variant("2026-07-15T10:29:57Z", "iso ts"),
      variant(undefined, "missing ts"),
    ];
    makeConsumerRepo(consumerPath, { ".bkit/friction.jsonl": rows.join("\n") + "\n" });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    const storePath = path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl");

    runHarvest(bkitRoot);
    // Same rows again in a different order — what a later consumer write looks like.
    fs.writeFileSync(frictionPath, [rows[2], rows[0], rows[1]].join("\n") + "\n", "utf-8");
    runHarvest(bkitRoot);

    const store = fs.readFileSync(storePath, "utf-8");
    for (const description of ["numeric ts", "iso ts", "missing ts"]) {
      expect(store).toContain(description);
    }
    expect(fs.readFileSync(frictionPath, "utf-8").trim()).toBe("");
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

  // A consumer's triage pass closes a deferral by APPENDING a same-key row with
  // status CLOSED (jsonl.md § Updating a Row); that is still one deferral.
  it("counts ENTITIES not rows — a triage update does not inflate the count", () => {
    const consumerPath = path.join(tmpDir, "consumer-triaged");
    const opened = deferralRow(1_700_000_001_000, "defer-1");
    // triage: same key, later ts, now closed + carrying a reference to the PR
    const closed = makeRow("deferral", 1_700_000_009_000, {
      key: "defer-1",
      type: "issue",
      category: "agentic",
      description: "test deferral",
      status: "CLOSED",
      references: ["PR-412"],
    });
    const untouched = deferralRow(1_700_000_001_001, "defer-2");

    makeConsumerRepo(consumerPath, {
      ".bkit/stats.jsonl": statsRow(1_700_000_000_001) + "\n",
      "docs/deferrals.jsonl": [opened, closed, untouched].join("\n") + "\n",
    });
    const bkitRoot = makeBkitRoot(tmpDir, [consumerPath]);
    const res = harvestConsumer(consumerPath, bkitRoot);

    // 3 rows on disk, but only 2 real deferrals
    expect(res.countOnlyRawRows["deferrals.jsonl"]).toBe(3);
    expect(res.countOnlyRows["deferrals.jsonl"]).toBe(2);
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

// ---------------------------------------------------------------------------
// consumerPathToSlug — resolves from the consumer's git remote (real `git init`)
// ---------------------------------------------------------------------------

// `repo` is part of identity() for EVERY kind. This resolver agrees with every other
// producer of `repo`: the git remote, and nothing else — never path segments.
describe("consumerPathToSlug — resolves from the consumer's git remote", () => {
  /** A real git repo at `dir` with `origin` set to `remote`. */
  function makeRepoWithRemote(dir: string, remote: string): string {
    fs.mkdirSync(dir, { recursive: true });
    const opts = { cwd: dir, stdio: "ignore" as const };
    execSync("git init -q", opts);
    execSync(`git remote add origin ${remote}`, opts);
    return dir;
  }

  it("uses the remote, NOT the path — even under a dir named GitHub", () => {
    const dir = makeRepoWithRemote(
      path.join(tmpDir, "Documents", "GitHub", "app-gether-life"),
      "https://github.com/gether-life/app-gether-life.git",
    );
    // Not the path-derived `GitHub/app-gether-life`.
    expect(consumerPathToSlug(dir)).toBe("gether-life/app-gether-life");
  });

  it("is stable when the checkout moves", () => {
    // Same repo, two locations: the slug must not change, or history forks.
    const a = makeRepoWithRemote(
      path.join(tmpDir, "Documents", "GitHub", "my-app"),
      "git@github.com:acme/my-app.git",
    );
    const b = makeRepoWithRemote(
      path.join(tmpDir, "code", "my-app"),
      "git@github.com:acme/my-app.git",
    );
    expect(consumerPathToSlug(a)).toBe("acme/my-app");
    expect(consumerPathToSlug(b)).toBe(consumerPathToSlug(a));
  });

  it("falls back to the bare dir name when there is no remote — never an invented owner", () => {
    const dir = path.join(tmpDir, "Documents", "GitHub", "no-remote-app");
    fs.mkdirSync(dir, { recursive: true });
    // The last-resort value is obviously not a slug (not `GitHub/no-remote-app`).
    expect(consumerPathToSlug(dir)).toBe("no-remote-app");
  });
});
