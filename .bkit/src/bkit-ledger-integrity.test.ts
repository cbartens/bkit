/**
 * bkit-ledger-integrity.test.ts — the repo's LIVE ledgers stay machine-readable.
 *
 * Ledger appends are best-effort and exit 0 by design (`.bkit/jsonl.md`
 * § Best-effort append), so a malformed row raises no signal at write time and
 * nothing downstream notices until a reader fails. `.bkit/friction.jsonl`
 * carried a row whose `ts` was a literal, unexpanded `$(date +%s)000` — one
 * invalid line makes `jq` reject the WHOLE file, so `bkit harvest`, the
 * analysis pass, and every fold over that ledger had been failing since it
 * landed. Three sibling rows in the same neighbourhood used a `detail` field
 * with no `kind`, which is what routes a row to its ledger.
 *
 * `bkit-telemetry-lint.test.ts` covers the codec against fixtures; this file
 * asserts the real files on disk. Fixtures cannot catch a hand-appended row.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Ledger → the `kind` values legal in it (`.bkit/jsonl.md` § Which kind → which ledger). */
const LEDGERS: Record<string, string[]> = {
  "docs/decisions.jsonl": ["decision"],
  "docs/knowledge.jsonl": ["knowledge"],
  "docs/deferrals.jsonl": ["deferral"],
  "docs/failures.jsonl": ["failure"],
  ".bkit/friction.jsonl": ["friction"],
  ".bkit/stats.jsonl": ["compliance", "counter", "outcome"],
};

/**
 * Envelope fields gated here: the ones every reader needs to route, attribute
 * and dedupe a row. `workflow` and `step` are NOT gated — a handful of rows
 * were authored outside any phase workflow (`step: "manual-investigation"`),
 * where `workflow` has no honest value, and backfilling a phase would put
 * invented data in a ledger that feeds analysis. Reconciling that with
 * `.bkit/jsonl.md` (mark them optional, or define a manual sentinel) is
 * tracked as `ledger-envelope-workflow-field-not-universal`.
 */
const ENVELOPE = ["ts", "kind", "repo", "bkitVersion"] as const;

function rows(rel: string): { line: number; raw: string }[] {
  const abs = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readFileSync(abs, "utf-8")
    .split("\n")
    .map((raw, i) => ({ line: i + 1, raw }))
    .filter(({ raw }) => raw.trim() !== "");
}

type Parsed =
  | { line: number; row: Record<string, unknown>; error?: undefined }
  | { line: number; row?: undefined; error: string };

/**
 * Parse every row, KEEPING the parse error rather than discarding it — the
 * reason a line is unreadable (`Unexpected token`, `Invalid numeric literal`)
 * is what points at the append that wrote it.
 */
function parsed(rel: string): Parsed[] {
  return rows(rel).map(({ line, raw }) => {
    try {
      return { line, row: JSON.parse(raw) as Record<string, unknown> };
    } catch (err) {
      return { line, error: err instanceof Error ? err.message : String(err) };
    }
  });
}

describe("live ledgers are machine-readable", () => {
  for (const [rel, kinds] of Object.entries(LEDGERS)) {
    describe(rel, () => {
      it("every line parses as JSON", () => {
        const broken = parsed(rel)
          .filter((p) => p.error !== undefined)
          .map((p) => `${rel}:${p.line}: ${p.error}`);
        expect(broken).toEqual([]);
      });

      it("every row carries the full envelope with a numeric ts", () => {
        // Unparseable lines are reported by the parse test above.
        const bad = parsed(rel).flatMap(({ line, row }) => {
          if (!row) return [];
          const out: string[] = [];
          const missing = ENVELOPE.filter((f) => row[f] === undefined);
          if (missing.length) out.push(`${rel}:${line}: missing ${missing.join(", ")}`);
          if (row.ts !== undefined && typeof row.ts !== "number") {
            out.push(`${rel}:${line}: ts is ${typeof row.ts}, not number`);
          }
          return out;
        });
        expect(bad).toEqual([]);
      });

      it("every row's kind belongs in this ledger", () => {
        const wrong = parsed(rel)
          .flatMap(({ line, row }) => {
            const kind = row?.kind;
            return typeof kind === "string" && !kinds.includes(kind)
              ? [`${rel}:${line}: kind=${kind}`]
              : [];
          })
          .slice(0, 10);
        expect(wrong).toEqual([]);
      });
    });
  }

  it("no row smuggles an unexpanded shell substitution into a field", () => {
    const offenders: string[] = [];
    for (const rel of Object.keys(LEDGERS)) {
      for (const { line, raw } of rows(rel)) {
        // A substitution inside a JSON string is prose (a row may quote a
        // command); one outside quotes is an append that never expanded.
        const outsideStrings = raw.replace(/"(?:[^"\\]|\\.)*"/g, '""');
        if (/\$\(|\$\{/.test(outsideStrings)) offenders.push(`${rel}:${line}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
