// commands/stats.test.ts — `bkit stats` reads this repo's ledgers only and writes `.bkit/stats.md`.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { STATS_REPORT, buildRepoStats, runStatsCommand } from "./stats";

let root: string;
let cwd: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stats-"));
  fs.mkdirSync(path.join(root, ".bkit"));
  cwd = process.cwd();
});

afterEach(() => {
  process.chdir(cwd);
  fs.rmSync(root, { recursive: true, force: true });
});

const row = (ts: number, kind: string, extra: Record<string, unknown> = {}): string =>
  JSON.stringify({
    schema: 2,
    ts,
    kind,
    repo: "acme/app",
    bkit: { version: "4.1.4" },
    by: { workflow: "build", step: "build-close-workflow" },
    ...extra,
  });

describe("bkit stats", () => {
  it("reports close-time rows and leaves chat / run rows out", () => {
    fs.writeFileSync(
      path.join(root, ".bkit", "stats.jsonl"),
      [
        row(1_700_000_000_001, "outcome", {
          run: { parentSha: "a".repeat(40) },
          time: { totalMinutes: 12 },
        }),
        row(1_700_000_000_002, "chat", { key: "claude-code:s1", repo: "fp:0123456789ab" }),
        row(1_700_000_000_003, "run", { key: "fp:x:build:1", repo: "fp:0123456789ab" }),
      ].join("\n") + "\n",
    );

    const md = buildRepoStats(root);

    expect(md).toContain("| outcome | 1 |");
    expect(md).not.toContain("| chat |");
    expect(md).not.toContain("| run |");
    expect(md).toContain("## Run durations");
  });

  it("prints each table unpadded under a prettier-ignore marker", () => {
    fs.writeFileSync(
      path.join(root, ".bkit", "stats.jsonl"),
      [row(1_700_000_000_001, "outcome"), row(1_700_000_000_002, "outcome")].join("\n") + "\n",
    );

    const md = buildRepoStats(root);

    expect(md).toContain(
      [
        "## Rows",
        "",
        "<!-- prettier-ignore -->",
        "| Kind | Rows |",
        "| --- | --- |",
        "| outcome | 2 |",
        "",
        "<!-- prettier-ignore -->",
        "| Workflow | Rows |",
        "| --- | --- |",
        "| build | 2 |",
        "",
        "## Run durations",
      ].join("\n"),
    );
  });

  it("counts build challenges by size, small ones having skipped challenge-1", () => {
    const gate = (ts: number, size: string) =>
      row(ts, "outcome", {
        run: { parentSha: String(ts).padStart(40, "0") },
        build: {
          challenge: {
            verdict: "PASS",
            findings: null,
            gate: { size, linesChanged: 1, filesChanged: 1, skipped: size === "small" },
          },
        },
      });
    fs.writeFileSync(
      path.join(root, ".bkit", "stats.jsonl"),
      [gate(1_700_000_000_001, "small"), gate(1_700_000_000_002, "large")].join("\n") + "\n",
    );
    const md = buildRepoStats(root);
    expect(md).toContain("## Build challenge size");
    expect(md).toContain("| 2 | 1 | 1 |");
  });

  it("shows each agent type's context peak against the 160000-token cap", () => {
    const withCtx = (ts: number, byAgent: Record<string, { peak: number; runs: number }>) =>
      row(ts, "outcome", {
        run: { parentSha: String(ts).padStart(40, "0") },
        context: { host: "claude-code", byAgent },
      });
    fs.writeFileSync(
      path.join(root, ".bkit", "stats.jsonl"),
      [
        withCtx(1_700_000_000_001, {
          "bkit-build-plan-execute": { peak: 120_000, runs: 2 },
          "bkit-build-plan-verify": { peak: 40_000, runs: 1 },
        }),
        withCtx(1_700_000_000_002, { "bkit-build-plan-execute": { peak: 171_000, runs: 3 } }),
        row(1_700_000_000_003, "outcome", { run: { parentSha: "c".repeat(40) } }),
      ].join("\n") + "\n",
    );
    const md = buildRepoStats(root);
    expect(md).toContain("## Agent context peaks");
    expect(md).toContain("Cap: 160000 tokens per agent. 2 of 3 runs recorded context.");
    expect(md).toContain("| bkit-build-plan-execute | 5 | 2 | 171000 | 1 |");
    expect(md).toContain("| bkit-build-plan-verify | 1 | 1 | 40000 | 0 |");
  });

  it("says there is no context data when no outcome row records any", () => {
    fs.writeFileSync(
      path.join(root, ".bkit", "stats.jsonl"),
      row(1_700_000_000_001, "outcome", { run: { parentSha: "a".repeat(40) } }) + "\n",
    );
    const md = buildRepoStats(root);
    expect(md).toContain("## Agent context peaks");
    expect(md).toContain("No context data.");
  });

  it("says there are no rows yet when the ledger is missing", () => {
    expect(buildRepoStats(root)).toContain("No rows yet.");
  });

  it("never reads harvest/", () => {
    fs.mkdirSync(path.join(root, "harvest"));
    fs.writeFileSync(
      path.join(root, "harvest", "stats.jsonl"),
      row(1_700_000_000_001, "outcome") + "\n",
    );

    expect(buildRepoStats(root)).toContain("No rows yet.");
  });

  it("writes .bkit/stats.md, and the same ledgers give the same file", () => {
    fs.writeFileSync(
      path.join(root, ".bkit", "stats.jsonl"),
      row(1_700_000_000_001, "outcome") + "\n",
    );
    process.chdir(root);

    runStatsCommand();
    const first = fs.readFileSync(path.join(root, STATS_REPORT), "utf-8");
    runStatsCommand();

    expect(fs.readFileSync(path.join(root, STATS_REPORT), "utf-8")).toBe(first);
    expect(first.startsWith("# bkit stats\n")).toBe(true);
  });
});
