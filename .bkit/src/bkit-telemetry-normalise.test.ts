/**
 * Tests for bkit-telemetry-normalise.ts — the one-shot, idempotent rewrite off
 * the retired sequential-alias scheme. Boundary: real filesystem temp dirs.
 *
 * Contract under test:
 *   - drops aliases[] -> references[], keeps ts, re-keys ONLY colliding rows;
 *   - after normalise the ledger has ZERO alias collisions (validated via lint);
 *   - idempotent (a second run changes nothing);
 *   - parity-gated (row count preserved; malformed lines preserved);
 *   - collision-safe re-key (two rows stripping to the same slug stay distinct).
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runNormalise, normaliseLedgerContent } from "./bkit-telemetry-normalise.js";
import { lintLedgers, scanRows, type LedgerRow } from "./bkit-telemetry-lint.js";

const REPO = "acme/app";
let tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
  tmpDirs = [];
});

function row(over: Partial<LedgerRow> & { key: string }): LedgerRow {
  return { ts: 1, kind: "decision", repo: REPO, workflow: "plan", bkitVersion: "4.5.0", ...over };
}

function fixture(decisions: LedgerRow[], knowledge: LedgerRow[] = []): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-normalise-test-"));
  tmpDirs.push(dir);
  fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "docs", "decisions.jsonl"),
    decisions.map((r) => JSON.stringify(r)).join("\n") + "\n",
  );
  if (knowledge.length > 0) {
    fs.writeFileSync(
      path.join(dir, "docs", "knowledge.jsonl"),
      knowledge.map((r) => JSON.stringify(r)).join("\n") + "\n",
    );
  }
  return dir;
}

function readRows(dir: string, file: string): LedgerRow[] {
  const p = path.join(dir, "docs", file);
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, "utf-8")
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => JSON.parse(l) as LedgerRow);
}

describe("runNormalise — clears the DE-114 x3 collision", () => {
  it("drops aliases[], demotes the number to references[], re-keys, and lint passes", async () => {
    const dir = fixture([
      row({ key: "de-114-sentry-adopted", aliases: ["DE-114"], ts: 10 }),
      row({ key: "de-114-523-e2e-parallelism", aliases: ["DE-114"], ts: 11 }),
      row({ key: "de-114-523-three-invocation-step", aliases: ["DE-114"], ts: 12 }),
    ]);

    // Before: the collision is present.
    expect(lintLedgers(dir).ok).toBe(false);

    const result = await runNormalise({ cwd: dir });
    expect(result.ok).toBe(true);
    expect(result.ran).toBe(true);

    const rows = readRows(dir, "decisions.jsonl");
    // ts preserved (identity untouched).
    expect(rows.map((r) => r.ts).sort()).toEqual([10, 11, 12]);
    // aliases[] gone everywhere; DE-114 preserved as a references[] pointer.
    for (const r of rows) {
      expect(r.aliases).toBeUndefined();
      expect(r.references).toContain("DE-114");
      // The number no longer leads the slug.
      expect(r.key?.startsWith("de-114-")).toBe(false);
    }
    // After: zero collisions.
    expect(lintLedgers(dir).ok).toBe(true);
    expect(scanRows(rows).collisions).toHaveLength(0);
  });
});

describe("runNormalise — idempotency", () => {
  it("a second run makes no change", async () => {
    const dir = fixture([
      row({ key: "de-90-a", aliases: ["DE-90"] }),
      row({ key: "de-90-b", aliases: ["DE-90"] }),
    ]);
    await runNormalise({ cwd: dir });
    const afterFirst = fs.readFileSync(path.join(dir, "docs", "decisions.jsonl"), "utf-8");

    const second = await runNormalise({ cwd: dir });
    expect(second.ran).toBe(false);
    const afterSecond = fs.readFileSync(path.join(dir, "docs", "decisions.jsonl"), "utf-8");
    expect(afterSecond).toBe(afterFirst);
  });

  it("a clean ledger (no aliases, no collisions) is a total no-op", async () => {
    const dir = fixture([
      row({ key: "de-3-distribution", workflow: "migrate", references: ["DE-3"] }),
      row({ key: "content-slug-decision", workflow: "plan" }),
    ]);
    const before = fs.readFileSync(path.join(dir, "docs", "decisions.jsonl"), "utf-8");
    const result = await runNormalise({ cwd: dir });
    expect(result.ran).toBe(false);
    expect(fs.readFileSync(path.join(dir, "docs", "decisions.jsonl"), "utf-8")).toBe(before);
  });
});

describe("runNormalise — conservative + safe", () => {
  it("drops aliases on a UNIQUE numbered row but does NOT re-key it", async () => {
    const dir = fixture([row({ key: "de-1-vertex-choice", aliases: ["DE-1"] })]);
    const result = await runNormalise({ cwd: dir });
    expect(result.ran).toBe(true);
    const [r] = readRows(dir, "decisions.jsonl");
    expect(r?.aliases).toBeUndefined();
    expect(r?.references).toContain("DE-1");
    expect(r?.key).toBe("de-1-vertex-choice"); // unique → key untouched
  });

  it("re-key stays collision-safe when two stripped keys would clash", async () => {
    // Both strip to `same-tail`; they must NOT fold into one entity.
    const dir = fixture([
      row({ key: "de-50-same-tail", aliases: ["DE-50"], ts: 1 }),
      row({ key: "de-51-same-tail", aliases: ["DE-51"], ts: 2 }),
      // force DE-50 + DE-51 to each be a collision so both get re-keyed
      row({ key: "de-50-other", aliases: ["DE-50"], ts: 3 }),
      row({ key: "de-51-other", aliases: ["DE-51"], ts: 4 }),
    ]);
    await runNormalise({ cwd: dir });
    const rows = readRows(dir, "decisions.jsonl");
    const keys = rows.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length); // all keys still distinct
    expect(scanRows(rows).collisions).toHaveLength(0);
  });

  it("preserves malformed lines and total row count (parity)", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-normalise-test-"));
    tmpDirs.push(dir);
    fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
    const content =
      JSON.stringify(row({ key: "de-90-a", aliases: ["DE-90"] })) +
      "\n" +
      "{ this is not valid json" +
      "\n" +
      JSON.stringify(row({ key: "de-90-b", aliases: ["DE-90"] })) +
      "\n";
    fs.writeFileSync(path.join(dir, "docs", "decisions.jsonl"), content);

    const result = await runNormalise({ cwd: dir });
    expect(result.ok).toBe(true);
    const out = fs
      .readFileSync(path.join(dir, "docs", "decisions.jsonl"), "utf-8")
      .split("\n")
      .filter((l) => l.trim() !== "");
    expect(out).toHaveLength(3); // 2 rows + malformed line preserved
    expect(out.some((l) => l.includes("this is not valid json"))).toBe(true);
  });

  it("dry-run writes nothing", async () => {
    const dir = fixture([
      row({ key: "de-90-a", aliases: ["DE-90"] }),
      row({ key: "de-90-b", aliases: ["DE-90"] }),
    ]);
    const before = fs.readFileSync(path.join(dir, "docs", "decisions.jsonl"), "utf-8");
    const result = await runNormalise({ cwd: dir, dryRun: true });
    expect(result.dryRun).toBe(true);
    expect(fs.readFileSync(path.join(dir, "docs", "decisions.jsonl"), "utf-8")).toBe(before);
  });

  it("leaves no .bak / .normalising temp files behind on success", async () => {
    const dir = fixture([
      row({ key: "de-90-a", aliases: ["DE-90"] }),
      row({ key: "de-90-b", aliases: ["DE-90"] }),
    ]);
    await runNormalise({ cwd: dir });
    const docs = fs.readdirSync(path.join(dir, "docs"));
    expect(docs.some((f) => f.endsWith(".bak") || f.endsWith(".normalising"))).toBe(false);
  });
});

describe("normaliseLedgerContent — pure unit", () => {
  it("no collisions in the set → only aliases dropped, keys untouched", () => {
    const raw = JSON.stringify(row({ key: "de-1-unique", aliases: ["DE-1"] })) + "\n";
    const out = normaliseLedgerContent(raw, new Set());
    expect(out.aliasesDropped).toBe(1);
    expect(out.rekeyed).toBe(0);
    const parsed = JSON.parse(out.outContent.trim()) as LedgerRow;
    expect(parsed.key).toBe("de-1-unique");
    expect(parsed.references).toContain("DE-1");
  });
});
