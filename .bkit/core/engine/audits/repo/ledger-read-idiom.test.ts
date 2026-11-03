import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getCoreRoot } from "../../shared/package-roots";

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

function runReader(contents: string) {
  const doc = readFileSync(path.join(getCoreRoot(), ".bkit/jsonl.md"), "utf8");
  const script = doc
    .split("## Read Idiom\n")[1]
    ?.split("## ")[0]
    ?.match(/```python\n([\s\S]*?)```/)?.[1];
  expect(script, "the documented ledger reader must be executable").toBeDefined();
  const root = mkdtempSync(path.join(os.tmpdir(), "bkit-ledger-reader-"));
  roots.push(root);
  mkdirSync(path.join(root, "docs"));
  for (const name of ["decisions", "knowledge"]) {
    writeFileSync(path.join(root, `docs/${name}.jsonl`), contents);
  }
  const result = spawnSync("python3", ["-c", script ?? ""], { cwd: root, encoding: "utf8" });
  for (const name of ["decisions", "knowledge"]) {
    expect(readFileSync(path.join(root, `docs/${name}.jsonl`), "utf8")).toBe(contents);
  }
  return result;
}

describe("documented read-only ledger helper", () => {
  it("keeps numeric winners, later ties and implicit ACTIVE rows before filtering", () => {
    const rows = [
      { key: "first", ts: 10, summary: "first numeric row" },
      { key: "first", ts: 5, summary: "older" },
      { key: "first", ts: 20, summary: "newer" },
      { key: "first", ts: 20, summary: "later tie", status: "ACTIVE" },
      { key: "closed", ts: 1, status: "ACTIVE" },
      { key: "closed", ts: 2, status: "SUPERSEDED" },
      { key: "implicit", ts: 3, summary: "active by default" },
    ];
    const result = runReader(rows.map((row) => JSON.stringify(row)).join("\n") + "\n\n");
    expect(result.status, result.stderr).toBe(0);
    expect(
      result.stdout
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line)),
    ).toEqual([rows[3], rows[6], rows[3], rows[6]]);
  });

  it("reads empty ledgers without inventing rows", () => {
    const result = runReader("\n");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe("");
  });

  it("reports malformed input as an error", () => {
    const result = runReader("not json\n");
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("JSONDecodeError");
  });

  it.each([
    ["missing timestamp", '{"key":"a"}'],
    ["string timestamps", '{"key":"a","ts":"9"}\n{"key":"a","ts":"10"}'],
    ["boolean timestamp", '{"key":"a","ts":true}'],
    ["null timestamp", '{"key":"a","ts":null}'],
    ["nonfinite timestamp", '{"key":"a","ts":NaN}'],
    ["infinite timestamp", '{"key":"a","ts":Infinity}'],
    ["empty key", '{"key":"","ts":1}'],
    ["numeric key", '{"key":1,"ts":1}'],
  ])("rejects %s instead of reporting a successful read", (_name, contents) => {
    const result = runReader(contents);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/KeyError|ValueError/);
    expect(result.stdout).toBe("");
  });
});
