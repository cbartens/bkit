import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { COMPACT_LEDGERS, compactLedgerText, compactLedgers } from "./compact.js";
import { fold, parse } from "./telemetry.js";

const row = (key: string, ts: number, o: Record<string, unknown> = {}) => ({
  schema: 3,
  ts,
  kind: "failure",
  key,
  repo: "o/r",
  bkit: { version: "6.0.0" },
  by: { step: "manual" },
  severity: "LOW",
  description: `${key} at ${ts}`,
  ...o,
});

const line = (o: unknown): string => JSON.stringify(o);
const text = (...rows: unknown[]): string => rows.map((r) => `${line(r)}\n`).join("");
const rowsOf = (t: string) =>
  t
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => JSON.parse(l) as Record<string, unknown>);
const withoutLineage = (state: Map<string, unknown>) =>
  [...state]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => {
      const { firstTs: _f, updates: _u, ...rest } = v as Record<string, unknown>;
      return [k, rest];
    });

describe("compactLedgerText", () => {
  it("keeps each entry's fold winner in place and drops its superseded rows", () => {
    const before = text(
      row("a", 1001, { status: "OPEN" }),
      row("b", 1002),
      row("a", 1003, { status: "TRIAGED" }),
      row("a", 1004, { status: "CLOSED" }),
    );
    const out = compactLedgerText(before);
    expect(out).toMatchObject({ rows: 4, dropped: 2, stamped: 2 });
    expect(rowsOf(out.text).map((r) => [r["key"], r["ts"]])).toEqual([
      ["b", 1002],
      ["a", 1004],
    ]);
  });

  it("is reader-invisible: the fold is unchanged apart from firstTs / updates", () => {
    const before = text(
      row("a", 1001),
      row("b", 1002),
      row("a", 1005, { status: "CLOSED" }),
      row("b", 1003, { severity: "HIGH" }),
    );
    const out = compactLedgerText(before);
    expect(withoutLineage(fold(parse(out.text).events))).toEqual(
      withoutLineage(fold(parse(before).events)),
    );
  });

  it("stamps firstTs and updates right after ts, so age and recurrence survive", () => {
    const out = compactLedgerText(text(row("a", 1001), row("a", 1002), row("a", 1009)));
    expect(rowsOf(out.text)[0]).toMatchObject({ ts: 1009, firstTs: 1001, updates: 3 });
    expect(rowsOf(out.text).map((r) => Object.keys(r).slice(0, 4))).toEqual([
      ["schema", "ts", "firstTs", "updates"],
    ]);
  });

  it("stamps a single-row entry too: firstTs = ts, updates = 1", () => {
    const out = compactLedgerText(text(row("a", 1001)));
    expect(out).toMatchObject({ dropped: 0, stamped: 1 });
    expect(rowsOf(out.text)[0]).toMatchObject({ ts: 1001, firstTs: 1001, updates: 1 });
  });

  it("breaks a ts tie the way fold does: the later line wins", () => {
    const out = compactLedgerText(
      text(row("a", 1001, { status: "OPEN" }), row("a", 1001, { status: "CLOSED" })),
    );
    expect(rowsOf(out.text)).toHaveLength(1);
    expect(rowsOf(out.text)[0]?.["status"]).toBe("CLOSED");
  });

  it("is idempotent: a second pass changes nothing", () => {
    const once = compactLedgerText(text(row("a", 1001), row("b", 1002), row("a", 1003))).text;
    expect(compactLedgerText(once)).toEqual({ text: once, rows: 2, dropped: 0, stamped: 0 });
  });

  it("keeps malformed, non-object, blank, keyless and other-kind lines byte-for-byte", () => {
    const keyless = line({ ...row("x", 1000), key: undefined });
    const friction = line({ ...row("a", 1000), kind: "friction" });
    const before = [
      "{not json",
      "[1,2]",
      "",
      "   ",
      keyless,
      keyless,
      friction,
      line(row("a", 1001)),
      line(row("a", 1002)),
      "",
    ].join("\n");
    const after = compactLedgerText(before).text.split("\n");
    expect(after.slice(0, 7)).toEqual([
      "{not json",
      "[1,2]",
      "",
      "   ",
      keyless,
      keyless,
      friction,
    ]);
    expect(after).toHaveLength(9);
    expect(after[8]).toBe("");
  });

  it("writes a winner that already carries the right values byte-for-byte", () => {
    const stamped = ` ${line(row("a", 1002, { firstTs: 1001, updates: 2 }))}`;
    expect(compactLedgerText(`${stamped}\n`).text).toBe(`${stamped}\n`);
  });

  it("keeps CRLF endings and a missing final newline", () => {
    const out = compactLedgerText(`${line(row("a", 1001))}\r\n${line(row("a", 1002))}\r\n`).text;
    expect(out.endsWith("}\r\n")).toBe(true);
    expect(out.split("\r\n")).toHaveLength(2);
    const bare = compactLedgerText(`${line(row("a", 1001))}\n${line(row("a", 1002))}`).text;
    expect(bare.endsWith("}")).toBe(true);
  });

  it("re-run after a union merge brings the dropped rows back: drops them again, count kept", () => {
    const original = [row("a", 1001), row("a", 1002), row("a", 1003)];
    const compacted = compactLedgerText(text(...original)).text;
    // merge=union of a branch cut before the compaction: the old lines return beside the winner.
    const resurrected = compacted + text(...original);
    const out = compactLedgerText(resurrected);
    expect(out.dropped).toBe(3);
    expect(rowsOf(out.text)).toEqual(rowsOf(compacted));
  });

  it("counts two parallel same-key updates both, where each branch wrote updates N+1", () => {
    const base = row("a", 1002, { firstTs: 1001, updates: 2 });
    const left = row("a", 1003, { firstTs: 1001, updates: 3, status: "TRIAGED" });
    const right = row("a", 1004, { firstTs: 1001, updates: 3, status: "CLOSED" });
    const [winner] = rowsOf(compactLedgerText(text(base, left, right)).text);
    expect(winner).toMatchObject({ ts: 1004, status: "CLOSED", firstTs: 1001, updates: 4 });
  });

  it("counts identical-ts copies of one row once", () => {
    const [winner] = rowsOf(
      compactLedgerText(text(row("a", 1001), row("a", 1002), row("a", 1002), row("a", 1003))).text,
    );
    expect(winner?.["updates"]).toBe(3);
  });

  it("folds a row written without schema with its schema'd successors, by identity", () => {
    const old = {
      ts: 1001,
      kind: "failure",
      key: "a",
      repo: "o/r",
      bkitVersion: "4.2.0",
      step: "manual",
      severity: "LOW",
      description: "old",
    };
    const out = compactLedgerText(text(old, row("a", 1002)));
    expect(out.dropped).toBe(1);
    expect(rowsOf(out.text)[0]).toMatchObject({ ts: 1002, firstTs: 1001, updates: 2 });
  });

  it("stamps a winner written without schema in its own shape", () => {
    const old = { ts: 1001, kind: "knowledge", key: "k", repo: "o/r", summary: "s" };
    const [winner] = rowsOf(compactLedgerText(text(old)).text);
    expect(winner).toEqual({
      ts: 1001,
      firstTs: 1001,
      updates: 1,
      kind: "knowledge",
      key: "k",
      repo: "o/r",
      summary: "s",
    });
  });
});

describe("compactLedgers", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });
  const tmp = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-compact-"));
    dirs.push(d);
    return d;
  };
  const put = (root: string, rel: string, body: string) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), body);
  };

  it("names the five keyed ledgers", () => {
    expect(COMPACT_LEDGERS).toEqual({
      knowledge: "docs/knowledge.jsonl",
      decisions: "docs/decisions.jsonl",
      deferrals: "docs/deferrals.jsonl",
      failures: "docs/failures.jsonl",
      issues: ".bkit/issues.jsonl",
    });
  });

  it("rewrites in place via a temp file, leaving no temp file behind", () => {
    const root = tmp();
    put(root, "docs/failures.jsonl", text(row("a", 1001), row("a", 1002)));
    const [r] = compactLedgers(root, ["failures"], false);
    expect(r).toEqual({
      ledger: "failures",
      file: "docs/failures.jsonl",
      rows: 2,
      dropped: 1,
      stamped: 1,
      written: true,
    });
    expect(rowsOf(fs.readFileSync(path.join(root, "docs/failures.jsonl"), "utf-8"))).toHaveLength(
      1,
    );
    expect(fs.readdirSync(path.join(root, "docs"))).toEqual(["failures.jsonl"]);
  });

  it("dry run counts only", () => {
    const root = tmp();
    const before = text(row("a", 1001), row("a", 1002));
    put(root, "docs/failures.jsonl", before);
    const [r] = compactLedgers(root, ["failures"], true);
    expect(r).toMatchObject({ dropped: 1, stamped: 1, written: false });
    expect(fs.readFileSync(path.join(root, "docs/failures.jsonl"), "utf-8")).toBe(before);
  });

  it("leaves an already-compact ledger untouched and reports a missing one", () => {
    const root = tmp();
    const done = text(row("a", 1001, { firstTs: 1001, updates: 1 }));
    put(root, ".bkit/issues.jsonl", done.replace('"failure"', '"feature"'));
    const mtime = fs.statSync(path.join(root, ".bkit/issues.jsonl")).mtimeMs;
    const [issues, knowledge] = compactLedgers(root, ["issues", "knowledge"], false);
    expect(issues).toMatchObject({ rows: 1, dropped: 0, stamped: 0, written: false });
    expect(fs.statSync(path.join(root, ".bkit/issues.jsonl")).mtimeMs).toBe(mtime);
    expect(knowledge).toEqual({
      ledger: "knowledge",
      file: "docs/knowledge.jsonl",
      rows: 0,
      dropped: 0,
      stamped: 0,
      written: false,
    });
  });
});
