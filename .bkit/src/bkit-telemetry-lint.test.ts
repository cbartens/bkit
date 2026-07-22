/**
 * Tests for bkit-telemetry-lint.ts — the read-only DE-<n>/KN-<n> alias-collision
 * scan (issue: the retired scan-highest-and-increment scheme let concurrent
 * workflows mint the same number, and merge=union appended both silently).
 *
 * The load-bearing repro is the real consumer shape: `DE-114` claimed by three
 * unrelated rows. Boundary: real filesystem for lintLedgers; pure calls for scanRows.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  lintLedgers,
  ownLegacyId,
  scanRows,
  MINTED_KEY_RE,
  type LedgerRow,
} from "./bkit-telemetry-lint.js";

const REPO = "acme/app";
let tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
  tmpDirs = [];
});

function row(over: Partial<LedgerRow> & { key: string }): LedgerRow {
  return { ts: 1, kind: "decision", repo: REPO, workflow: "plan", bkitVersion: "4.5.0", ...over };
}

function writeLedgers(rows: { decisions?: LedgerRow[]; knowledge?: LedgerRow[] }): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lint-test-"));
  tmpDirs.push(dir);
  fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
  if (rows.decisions) {
    fs.writeFileSync(
      path.join(dir, "docs", "decisions.jsonl"),
      rows.decisions.map((r) => JSON.stringify(r)).join("\n") + "\n",
    );
  }
  if (rows.knowledge) {
    fs.writeFileSync(
      path.join(dir, "docs", "knowledge.jsonl"),
      rows.knowledge.map((r) => JSON.stringify(r)).join("\n") + "\n",
    );
  }
  return dir;
}

describe("ownLegacyId", () => {
  it("reads the deprecated aliases[] field first", () => {
    expect(ownLegacyId(row({ key: "de-114-sentry", aliases: ["DE-114"] }))).toBe("DE-114");
  });
  it("falls back to the key's numbered prefix, uppercased", () => {
    expect(ownLegacyId(row({ key: "de-114-sentry" }))).toBe("DE-114");
    expect(ownLegacyId(row({ key: "kn-core-7-thing" }))).toBe("KN-CORE-7");
  });
  it("returns null for a content slug with no number", () => {
    expect(ownLegacyId(row({ key: "sentry-adopted-as-observability-plane" }))).toBeNull();
  });
  it("does NOT read references[] (those point at OTHER rows)", () => {
    // A row whose key owns no number but references DE-7 as a pointer must not
    // be counted as owning DE-7.
    expect(ownLegacyId(row({ key: "some-slug", references: ["DE-7"] }))).toBeNull();
  });
});

describe("scanRows — collisions", () => {
  it("flags DE-114 claimed by three unrelated rows (the real repro)", () => {
    const { collisions } = scanRows([
      row({ key: "de-114-sentry-adopted", aliases: ["DE-114"] }),
      row({ key: "de-114-523-e2e-parallelism", aliases: ["DE-114"] }),
      row({ key: "de-114-523-three-invocation-step", aliases: ["DE-114"] }),
    ]);
    expect(collisions).toHaveLength(1);
    expect(collisions[0]?.id).toBe("DE-114");
    expect(collisions[0]?.keys).toHaveLength(3);
  });

  it("detects a collision from the key prefix alone (no aliases[] field)", () => {
    const { collisions } = scanRows([
      row({ key: "de-90-first-decision" }),
      row({ key: "de-90-unrelated-second" }),
    ]);
    expect(collisions).toHaveLength(1);
    expect(collisions[0]?.id).toBe("DE-90");
  });

  it("does NOT flag a unique number as a collision", () => {
    const { collisions } = scanRows([
      row({ key: "de-3-distribution" }),
      row({ key: "de-5-schema" }),
    ]);
    expect(collisions).toHaveLength(0);
  });

  it("folds same-key recurrence to one entity — not a self-collision", () => {
    const { collisions, rowCount } = scanRows([
      row({ key: "de-7-decision", ts: 1 }),
      row({ key: "de-7-decision", ts: 2 }), // update / recurrence, same key
    ]);
    expect(collisions).toHaveLength(0);
    expect(rowCount).toBe(1);
  });

  it("a references[] pointer to a number does not manufacture a collision", () => {
    const { collisions } = scanRows([
      row({ key: "alpha-slug", references: ["DE-7"] }),
      row({ key: "beta-slug", references: ["DE-7"] }),
    ]);
    expect(collisions).toHaveLength(0);
  });
});

describe("scanRows — minted keys (WARN, not a collision)", () => {
  it("flags a numbered key written by a non-migrate workflow", () => {
    const { mintedKeys, collisions } = scanRows([
      row({ key: "de-36-universal-input", workflow: "plan" }),
    ]);
    expect(collisions).toHaveLength(0); // unique → not a collision
    expect(mintedKeys).toHaveLength(1);
    expect(mintedKeys[0]?.key).toBe("de-36-universal-input");
  });

  it("EXEMPTS numbered keys from the one-shot migration", () => {
    const { mintedKeys } = scanRows([row({ key: "de-3-distribution", workflow: "migrate" })]);
    expect(mintedKeys).toHaveLength(0);
  });

  it("MINTED_KEY_RE matches de-/kn-/kn-core- prefixes but not content slugs", () => {
    expect(MINTED_KEY_RE.test("de-114-x")).toBe(true);
    expect(MINTED_KEY_RE.test("kn-43-x")).toBe(true);
    expect(MINTED_KEY_RE.test("kn-core-7-x")).toBe(true);
    expect(MINTED_KEY_RE.test("gh-mcp-401-after-rotation")).toBe(false);
    expect(MINTED_KEY_RE.test("681-e2e-parallelism")).toBe(false);
  });
});

describe("lintLedgers — filesystem", () => {
  it("ok=false and reports the collision across both ledgers", () => {
    const dir = writeLedgers({
      decisions: [
        row({ key: "de-114-a", aliases: ["DE-114"] }),
        row({ key: "de-114-b", aliases: ["DE-114"] }),
      ],
      knowledge: [row({ key: "kn-1-clean", kind: "knowledge", workflow: "migrate" })],
    });
    const r = lintLedgers(dir);
    expect(r.ok).toBe(false);
    expect(r.collisions).toHaveLength(1);
    expect(r.lines.some((l) => l.includes("FAIL"))).toBe(true);
    expect(r.lines.some((l) => l.includes("DE-114"))).toBe(true);
  });

  it("ok=true on a clean ledger", () => {
    const dir = writeLedgers({
      decisions: [
        row({ key: "de-3-distribution", workflow: "migrate" }),
        row({ key: "content-slug-decision", workflow: "plan" }),
      ],
    });
    const r = lintLedgers(dir);
    expect(r.ok).toBe(true);
    expect(r.collisions).toHaveLength(0);
  });

  it("ok=true (warn only) when a minted key exists but nothing collides", () => {
    const dir = writeLedgers({
      decisions: [row({ key: "de-36-universal-input", workflow: "plan" })],
    });
    const r = lintLedgers(dir);
    expect(r.ok).toBe(true);
    expect(r.mintedKeys).toHaveLength(1);
    expect(r.lines.some((l) => l.includes("WARN"))).toBe(true);
  });

  it("reports no ledgers when the files are absent", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lint-test-"));
    tmpDirs.push(dir);
    const r = lintLedgers(dir);
    expect(r.ok).toBe(true);
    expect(r.scanned).toHaveLength(0);
  });
});
