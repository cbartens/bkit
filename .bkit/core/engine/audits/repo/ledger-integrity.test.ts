/**
 * audits/repo/ledger-integrity.test.ts — the repo's LIVE ledgers stay machine-readable.
 *
 * Ledger appends are best-effort and exit 0 (`.bkit/jsonl.md` § Best-effort append).
 * One invalid line (e.g. a `ts` that is a literal, unexpanded `$(date +%s)000`) makes
 * `jq` reject the WHOLE file. A row with no `kind` cannot be routed to its ledger.
 *
 * This file asserts the real files on disk.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFERRAL_REASONS,
  DEFERRAL_WRITERS,
  UNJUSTIFIED_REASON,
  foldFrom,
  identity,
  parse,
} from "../../ledgers/telemetry";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");

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
 * The one ledger rows are REMOVED from (`bkit harvest` drains it), and therefore
 * the one that must NOT carry `merge=union` in the shipped block — union would
 * resurrect rows a drain deleted. Every other ledger in {@link LEDGERS} is
 * strictly append-only and must carry it.
 */
const DRAINED_LEDGER = ".bkit/friction.jsonl";

/**
 * Envelope fields gated here: the ones every reader needs to route, attribute
 * and dedupe a row. `workflow` and `step` are NOT gated (some rows were authored
 * outside any phase workflow, `step: "manual-investigation"`); tracked as
 * `ledger-envelope-workflow-field-not-universal`.
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
 * Parse every row, KEEPING the parse error (`Unexpected token`, `Invalid numeric
 * literal`) for the failure message.
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

  // `reason` (`.bkit/jsonl.md` § Deferral Reason) is enforced on the file: `validate()`
  // gates programmatic writes, and live deferral rows are appended via `jq >>`.
  describe("docs/deferrals.jsonl reason", () => {
    // Rows appended before the cutoff (the day the field landed) are exempt.
    const REASON_REQUIRED_FROM = 1785456000000; // 2026-07-31T00:00:00Z

    // FOLDED, not per-line (`.bkit/jsonl.md` § Updating a Row): the CURRENT state of
    // each entity is checked.
    const entities = () => {
      const { state } = foldFrom([path.join(REPO_ROOT, "docs/deferrals.jsonl")]);
      return [...state.values()].map((v) => ({ ...v }) as Record<string, unknown>);
    };

    it("every entity's reason is in the enum", () => {
      const bad = entities()
        .filter((row) => row.reason !== undefined && !DEFERRAL_REASONS.has(row.reason as string))
        .map((row) => `${String(row.key)}: reason=${JSON.stringify(row.reason)}`);
      expect(bad).toEqual([]);
    });

    // `unjustified` is set by a reviewer on someone else's deferral and carried forward
    // by every later same-`key` row (`.bkit/jsonl.md` § Field Semantics).
    it("no entity drops an `unjustified` verdict a later row was meant to carry", () => {
      const raw = fs.readFileSync(path.join(REPO_ROOT, "docs/deferrals.jsonl"), "utf-8");
      const { events } = parse(raw);
      const everUnjustified = new Set(
        events
          .filter((e) => e.kind === "deferral" && e.reason === UNJUSTIFIED_REASON)
          .map((e) => identity(e)),
      );
      const dropped = entities()
        .filter(
          (row) => everUnjustified.has(identity(row as never)) && row.reason !== UNJUSTIFIED_REASON,
        )
        .map((row) => `${String(row.key)}: now reason=${JSON.stringify(row.reason)}`);
      expect(dropped).toEqual([]);
    });

    it("every entity updated since the field landed carries a reason", () => {
      const bare = entities()
        .filter(
          (row) => typeof row.ts === "number" && row.ts >= REASON_REQUIRED_FROM && !row.reason,
        )
        .map((row) => `${String(row.key)}: ts=${String(row.ts)}`);
      expect(bare).toEqual([]);
    });

    // The writer list is exhaustive. Same cutoff as above.
    it("no entity since the cutoff names an unsanctioned writer", () => {
      const rogue = entities()
        .filter(
          (row) =>
            typeof row.ts === "number" &&
            row.ts >= REASON_REQUIRED_FROM &&
            typeof row.subagent === "string" &&
            !DEFERRAL_WRITERS.has(row.subagent),
        )
        .map((row) => `${String(row.key)}: subagent=${String(row.subagent)}`);
      expect(rogue).toEqual([]);
    });
  });

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

  // A future `ts` is permanent: `fold()` is last-wins by `ts`, so the row outranks
  // every same-`key` correction that follows it and can never be superseded. Under
  // `merge=union` that is not recoverable by editing either — the stale line
  // survives the merge beside its replacement and still wins. Caught once already
  // and repaired; this is the gate that keeps it caught.
  it("no row carries a ts in the future", () => {
    const now = Date.now();
    const offenders: string[] = [];
    for (const rel of Object.keys(LEDGERS)) {
      for (const { line, raw } of rows(rel)) {
        let row: Record<string, unknown>;
        try {
          row = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          continue; // reported by the parse test above
        }
        if (typeof row.ts === "number" && row.ts > now) {
          offenders.push(`${rel}:${line}: ts=${row.ts} (${new Date(row.ts).toISOString()})`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * A whole-second `ts` (ts % 1000 == 0) at or after the cutoff fails: `now*1000|floor`
   * (`.bkit/jsonl.md` § Write Idiom) lands on a whole second once in a thousand rows.
   * Rows below the cutoff are exempt.
   *
   * Catches round numbers only; it also fails the genuine 1-in-1000 mint. Fix: re-run
   * the append and take the new `ts`. Never hand-edit a digit to clear this test.
   */
  const HANDTYPED_TS_GATED_FROM = 1787788800000; // 2026-08-27T00:00:00Z

  it("no row since the cutoff carries a hand-typed whole-second ts", () => {
    const offenders: string[] = [];
    for (const rel of Object.keys(LEDGERS)) {
      for (const { line, raw } of rows(rel)) {
        let row: Record<string, unknown>;
        try {
          row = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          continue; // reported by the parse test above
        }
        const ts = row.ts;
        if (typeof ts !== "number" || ts < HANDTYPED_TS_GATED_FROM) continue;
        if (ts % 1000 === 0) {
          offenders.push(
            `${rel}:${line}: ts=${ts} (${new Date(ts).toISOString()}) is whole-second`,
          );
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * `merge=union` is what stops two branches that each appended a row from
 * conflicting over data that never disagreed. Every append-only ledger needs it:
 * one left out blocks merges, and a consumer's only recourse is a local override
 * below `bkit:end`.
 */
describe("shipped .gitattributes covers every append-only ledger", () => {
  const managedBlock = (rel: string): string => {
    const body = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
    const start = body.indexOf("# <!-- bkit:start -->");
    const end = body.indexOf("# <!-- bkit:end -->");
    expect(start, `${rel}: no bkit:start marker`).toBeGreaterThanOrEqual(0);
    expect(end, `${rel}: no bkit:end marker`).toBeGreaterThan(start);
    return body.slice(start, end);
  };

  for (const rel of [".gitattributes", ".bkit/shared/.gitattributes"]) {
    describe(rel, () => {
      it("declares merge=union for every append-only ledger", () => {
        const block = managedBlock(rel);
        const missing = Object.keys(LEDGERS)
          .filter((ledger) => ledger !== DRAINED_LEDGER)
          .filter((ledger) => !new RegExp(`^${ledger}\\s+merge=union$`, "m").test(block));
        expect(missing).toEqual([]);
      });

      it("does NOT declare merge=union for the drained ledger", () => {
        expect(managedBlock(rel)).not.toMatch(
          new RegExp(`^${DRAINED_LEDGER}\\s+merge=union$`, "m"),
        );
      });

      it("uses no blanket *.jsonl glob", () => {
        // Union on a consumer's own non-append-only .jsonl would corrupt it.
        expect(managedBlock(rel)).not.toMatch(/^\*\.jsonl|^\*\*\/\*\.jsonl/m);
      });
    });
  }
});
