import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isSchemaLedger, migrateLedgerText, migrateLedgers, SCHEMA_LEDGERS } from "./migrate.js";
import { normalize, SCHEMA } from "./telemetry.js";

const OLD_DEFERRAL = {
  ts: 1718900000123,
  kind: "deferral",
  repo: "cbartens/bkit",
  bkitVersion: "4.2.0",
  workflow: "build",
  step: "build-challenge",
  subagent: "bkit-build-challenge-remediate",
  model: "sonnet",
  key: "flaky-retry",
  category: "testing",
  severity: "LOW",
  reason: "low-severity",
  description: "retry is flaky",
};

const OLD_OUTCOME = {
  ts: 1718900000456,
  kind: "outcome",
  repo: "cbartens/bkit",
  bkitVersion: "4.2.0",
  workflow: "ship",
  step: "ship-close-workflow",
  parentSha: "a1b2c3d",
};

const line = (o: unknown): string => JSON.stringify(o);

describe("migrateLedgerText", () => {
  it("rewrites every pre-schema row through normalize", () => {
    const { text, rewritten } = migrateLedgerText(`${line(OLD_DEFERRAL)}\n${line(OLD_OUTCOME)}\n`);
    expect(rewritten).toBe(2);
    const rows = text
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(rows[0]).toEqual(normalize(OLD_DEFERRAL));
    expect(rows[1]).toEqual(normalize(OLD_OUTCOME));
    expect(rows.every((r) => r["schema"] === SCHEMA)).toBe(true);
    expect(rows[0]?.["by"]).toEqual({
      workflow: "build",
      step: "build-challenge",
      subagent: "bkit-build-challenge-remediate",
      model: "sonnet",
    });
    expect(rows[0]?.["ts"]).toBe(OLD_DEFERRAL.ts);
  });

  it("is idempotent: a second pass changes nothing", () => {
    const once = migrateLedgerText(`${line(OLD_DEFERRAL)}\n${line(OLD_OUTCOME)}\n`).text;
    expect(migrateLedgerText(once)).toEqual({ text: once, rewritten: 0 });
  });

  it("keeps malformed, non-object, blank and schema lines byte-for-byte", () => {
    const schemaRow = line(normalize(OLD_DEFERRAL));
    const input = ["{not json", "[1,2]", "42", "", schemaRow, ""].join("\n");
    expect(migrateLedgerText(input)).toEqual({ text: input, rewritten: 0 });
  });

  it("preserves CRLF line endings and a missing final newline", () => {
    const { text } = migrateLedgerText(`${line(OLD_DEFERRAL)}\r\n${line(OLD_OUTCOME)}`);
    const [first, second] = text.split("\n");
    expect(first?.endsWith("\r")).toBe(true);
    expect(second?.endsWith("}")).toBe(true);
    expect(text.endsWith("\n")).toBe(false);
  });
});

describe("migrateLedgers", () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-migrate-"));
    fs.mkdirSync(path.join(root, "docs"));
    fs.mkdirSync(path.join(root, ".bkit"));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it("rewrites old-shape ledgers in place and reports counts", () => {
    fs.writeFileSync(path.join(root, "docs/deferrals.jsonl"), `${line(OLD_DEFERRAL)}\n`);
    fs.writeFileSync(path.join(root, ".bkit/stats.jsonl"), `${line(OLD_OUTCOME)}\n{bad\n`);
    expect(migrateLedgers(root, false)).toEqual([
      { file: ".bkit/stats.jsonl", rewritten: 1 },
      { file: "docs/deferrals.jsonl", rewritten: 1 },
    ]);
    const stats = fs.readFileSync(path.join(root, ".bkit/stats.jsonl"), "utf-8");
    expect(stats).toBe(`${line(normalize(OLD_OUTCOME))}\n{bad\n`);
    expect(migrateLedgers(root, false)).toEqual([]);
    expect(fs.readdirSync(path.join(root, ".bkit"))).toEqual(["stats.jsonl"]);
  });

  it("dry run counts without writing", () => {
    const file = path.join(root, "docs/failures.jsonl");
    const before = `${line({ ...OLD_DEFERRAL, kind: "failure", reason: undefined })}\n`;
    fs.writeFileSync(file, before);
    expect(migrateLedgers(root, true)).toEqual([{ file: "docs/failures.jsonl", rewritten: 1 }]);
    expect(fs.readFileSync(file, "utf-8")).toBe(before);
  });

  it("skips missing ledgers and a ledger path that is a directory", () => {
    fs.mkdirSync(path.join(root, "docs/knowledge.jsonl"));
    expect(migrateLedgers(root, false)).toEqual([]);
  });
});

describe("isSchemaLedger", () => {
  it("is true for every ledger and false for anything else", () => {
    for (const f of SCHEMA_LEDGERS) expect(isSchemaLedger(f)).toBe(true);
    expect(isSchemaLedger("docs/roadmap.md")).toBe(false);
    expect(isSchemaLedger(".bkit/status.jsonl")).toBe(false);
  });
});
