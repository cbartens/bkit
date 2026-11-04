import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { getPkgRoot, getTemplatesRoot } from "../../shared/package-roots";

const template = path.join(getTemplatesRoot(), "context/bkit-vercel.md");
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function block(kind: "start" | "provision"): string {
  const text = fs.readFileSync(template, "utf8");
  const found = new RegExp(
    `<!-- context-fetch:${kind} vercel(?: context=runtime)? -->\\s*\x60\x60\x60bash\\n([\\s\\S]*?)\\n\x60\x60\x60`,
  ).exec(text);
  if (!found) throw new Error(`Missing Vercel ${kind} block`);
  return found[1]!;
}

const log = (message: string, level = "error") => ({
  type: "log",
  data: {
    timestamp: "2026-11-01T01:00:00.000Z",
    level,
    source: "function",
    traceId: "fixture-trace",
    message,
  },
});
const summary = (
  recordsReturned: number,
  next: string | null = null,
  excludedIntervals: object[] = [],
) => ({
  type: "summary",
  recordsReturned,
  timeRange: { start: "2026-11-01T00:00:00.000Z", end: "2026-11-01T04:00:00.000Z" },
  pagination: { hasMore: next !== null, next },
  excludedIntervals,
});

function createFixture(pages: object[][], shell: string) {
  const scratch = path.join(getPkgRoot(), "tmp");
  fs.mkdirSync(scratch, { recursive: true });
  const cwd = fs.mkdtempSync(path.join(scratch, "vercel-context-"));
  dirs.push(cwd);
  fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ type: "commonjs" }));
  const bin = path.join(cwd, "bin");
  fs.mkdirSync(bin);
  const callsFile = path.join(cwd, "calls.jsonl");
  fs.writeFileSync(callsFile, "");
  const data = { pages, failPage: 0, version: "65.0.0" };
  fs.writeFileSync(
    path.join(bin, "vercel"),
    `#!${process.execPath}
const fs = require("node:fs");
const path = require("node:path");
const root = path.dirname(__dirname);
const data = JSON.parse(fs.readFileSync(path.join(root, "data.json"), "utf8"));
const args = process.argv.slice(2);
if (args[0] === "--version") { console.log(data.version); process.exit(0); }
const calls = path.join(root, "calls.jsonl");
fs.appendFileSync(calls, JSON.stringify(args) + "\\n");
const page = fs.readFileSync(calls, "utf8").trim().split("\\n").length;
if (args.some(arg => ["--no-branch", "--level", "--source"].includes(arg))) {
  console.error("fixture: removed CLI option"); process.exit(2);
}
if (args.includes("--next") && args.some(arg => ["--project", "--deployment", "--environment", "--query", "--since", "--until"].includes(arg))) {
  console.error("fixture: cursor conflicts with query options"); process.exit(2);
}
if (page === data.failPage) { console.error("fixture: unavailable page"); process.exit(1); }
for (const row of data.pages[page - 1] || []) console.log(JSON.stringify(row));
`,
    { mode: 0o755 },
  );
  return {
    data,
    calls: () =>
      fs
        .readFileSync(callsFile, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as string[]),
    run: (env: NodeJS.ProcessEnv = {}, kind: "start" | "provision" = "start") => {
      fs.writeFileSync(path.join(cwd, "data.json"), JSON.stringify(data));
      return spawnSync(shell, ["-c", block(kind)], {
        cwd,
        encoding: "utf8",
        timeout: 10_000,
        env: {
          PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
          HOME: cwd,
          TMPDIR: cwd,
          VERCEL_TOKEN: "fixture-token",
          VERCEL_SCOPE: "fixture-team",
          SINCE: "2026-11-01T00:00:00Z",
          UNTIL: "2026-11-01T04:00:00Z",
          ...env,
        },
      });
    },
  };
}

describe.each(["bash", "/bin/sh"])("Vercel runtime context block (%s)", (shell) => {
  const fixture = (pages: object[][]) => createFixture(pages, shell);

  it("preserves records and reports an unread remainder when no continuation is available", () => {
    const f = fixture([
      [
        log("available without continuation"),
        { ...summary(1), pagination: { hasMore: true, next: null } },
      ],
    ]);
    const result = f.run();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("available without continuation");
    expect(result.stdout).toMatch(/TRUNCATED.*continuation.*unread/i);
    expect(result.stderr).toContain("truncated");
    expect(f.calls()).toHaveLength(1);
  });
  it("reads wrapped errors with the current query and preserves separate events without IDs", () => {
    const f = fixture([
      [
        log("fixture error"),
        log("fixture fatal", "fatal"),
        log("fixture info", "info"),
        summary(3),
      ],
    ]);
    const result = f.run();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("fixture error");
    expect(result.stdout).toContain("fixture fatal");
    expect(result.stdout).not.toContain("fixture info");
    expect(result.stdout).toContain("fixture-trace");
    expect(f.calls()[0]).toEqual(
      expect.arrayContaining([
        "--query",
        "level:(error OR fatal)",
        "--environment",
        "preview",
        "--limit",
        "50",
      ]),
    );
  });

  it("follows summary cursors even when the first page is shorter than the limit", () => {
    const f = fixture([
      [log("first"), summary(1, "cursor-two")],
      [log("second"), summary(1)],
    ]);
    const result = f.run({ VERCEL_PROJECT: "fixture-project" });
    expect(result.stdout).toContain("second");
    expect(f.calls()).toHaveLength(2);
    expect(f.calls()[0]).toEqual(expect.arrayContaining(["--project", "fixture-project"]));
    expect(f.calls()[1]).toEqual(
      expect.arrayContaining(["--next", "cursor-two", "--scope", "fixture-team"]),
    );
    expect(result.stdout).not.toContain("TRUNCATED");
  });

  it("reports excluded intervals as unread even when pagination finishes", () => {
    const gap = { start: "2026-11-01T02:00:00Z", end: "2026-11-01T03:00:00Z" };
    const result = fixture([[log("available"), summary(1, null, [gap])]]).run();
    expect(result.stdout).toContain("available");
    expect(result.stdout).toContain("TRUNCATED");
    expect(result.stdout).toContain(gap.start);
    expect(result.stderr).toContain("truncated");
  });

  it("retains earlier evidence and reports the unread remainder when a later page fails", () => {
    const f = fixture([[log("first"), summary(1, "cursor-two")]]);
    f.data.failPage = 2;
    const result = f.run();
    expect(result.stdout).toContain("first");
    expect(result.stdout).toMatch(/TRUNCATED.*page 2.*failed/);
    expect(result.stderr).toMatch(/truncated.*unread/i);
  });

  it("reports an unread remainder at the page cap", () => {
    const f = fixture([[log("first"), summary(1, "cursor-two")]]);
    const result = f.run({ VERCEL_MAX_PAGES: "1" });
    expect(f.calls()).toHaveLength(1);
    expect(result.stdout).toMatch(/TRUNCATED.*VERCEL_MAX_PAGES=1/);
    expect(result.stderr).toMatch(/unread/i);
  });

  it("treats a summary-only result as inconclusive pending a known-hit control", () => {
    const result = fixture([[summary(0)]]).run();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/0 lines/);
    expect(result.stdout).toMatch(/known.*error|positive.control/i);
    expect(result.stdout).not.toContain("TRUNCATED");
    expect(result.stderr).not.toContain("skipped");
  });

  it("self-skips explicitly for an incompatible installed CLI without attempting logs", () => {
    const f = fixture([]);
    f.data.version = "50.0.0";
    const result = f.run();
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/skipped.*unsupported.*50\.0\.0/i);
    expect(f.calls()).toEqual([]);
  });

  it("rejects missing summaries instead of treating them as empty results", () => {
    const result = fixture([[log("unverified")]]).run();
    expect(result.stderr).toMatch(/skipped.*summary|skipped.*invalid/i);
    expect(result.stdout).not.toContain("0 lines");
  });

  it("reports a failed first page as unavailable", () => {
    const f = fixture([]);
    f.data.failPage = 1;
    const result = f.run();
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/skipped.*non-zero/i);
  });

  it("pins provisioning and refuses an unsupported installed CLI without replacing it", () => {
    expect(block("provision")).toMatch(/pnpm add -g vercel@65\.\d+\.\d+/);
    const f = fixture([]);
    f.data.version = "50.0.0";
    const result = f.run({}, "provision");
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/unsupported.*50\.0\.0/i);
  });
});
