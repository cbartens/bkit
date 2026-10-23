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
  normalize,
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
  ".bkit/stats.jsonl": ["compliance", "counter", "outcome", "chat", "run"],
};

/**
 * The one ledger rows are REMOVED from (`bkit harvest` drains it), and therefore
 * the one that must NOT carry `merge=union` in the shipped block — union would
 * resurrect rows a drain deleted. Every other ledger in {@link LEDGERS} is
 * strictly append-only and must carry it.
 */
const DRAINED_LEDGER = ".bkit/friction.jsonl";

/**
 * Top-section fields gated here: the ones every reader needs to route, attribute
 * and dedupe a row (`.bkit/jsonl.md` § Generic Fields). `by` is NOT gated: some
 * rows were authored outside any phase workflow, with no `by.step`; tracked as
 * `ledger-envelope-workflow-field-not-universal`. A row without `schema` is one
 * `bkit upgrade` has not migrated yet (a union merge can bring one back).
 */
const ENVELOPE = ["schema", "ts", "kind", "repo", "bkit"] as const;

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

/** Envelope problems (missing fields, non-numeric ts) for every parseable row of a ledger. */
function envelopeProblems(rel: string): string[] {
  // Unparseable lines are reported by the parse test.
  return parsed(rel).flatMap(({ line, row }) => {
    const out: string[] = [];
    const missing = ENVELOPE.filter((f) => row?.[f] === undefined);
    const numericTsOk = row?.ts === undefined || typeof row.ts === "number";
    if (row !== undefined && missing.length > 0) {
      out.push(`${rel}:${line}: missing ${missing.join(", ")}`);
    }
    if (row !== undefined && !numericTsOk) {
      out.push(`${rel}:${line}: ts is ${typeof row.ts}, not number`);
    }
    return out;
  });
}

/** Rows whose string `kind` is not legal in this ledger. */
function wrongKindRows(rel: string, kinds: string[]): string[] {
  return parsed(rel).flatMap(({ line, row }) => {
    const kind = row?.kind;
    const isWrong = typeof kind === "string" && !kinds.includes(kind);
    return isWrong ? [`${rel}:${line}: kind=${kind}`] : [];
  });
}

/** Parseable rows (line + object) across every ledger; unparseable lines are skipped. */
function allParsedRows(): Array<{ rel: string; line: number; row: Record<string, unknown> }> {
  return Object.keys(LEDGERS).flatMap((rel) =>
    parsed(rel).flatMap(({ line, row }) => (row === undefined ? [] : [{ rel, line, row }])),
  );
}

/** Raw ledger lines that carry a shell substitution outside any JSON string. */
function unexpandedSubstitutionLines(): string[] {
  return Object.keys(LEDGERS).flatMap((rel) =>
    rows(rel)
      // A substitution inside a JSON string is prose (a row may quote a
      // command); one outside quotes is an append that never expanded.
      .filter(({ raw }) => /\$\(|\$\{/.test(raw.replace(/"(?:[^"\\]|\\.)*"/g, '""')))
      .map(({ line }) => `${rel}:${line}`),
  );
}

/** Rows whose numeric ts lies after `now`. */
function futureTsRows(now: number): string[] {
  return allParsedRows().flatMap(({ rel, line, row }) => {
    const ts = row.ts;
    return typeof ts === "number" && ts > now
      ? [`${rel}:${line}: ts=${ts} (${new Date(ts).toISOString()})`]
      : [];
  });
}

/** Rows at or after `from` whose numeric ts is a whole second. */
function wholeSecondTsRows(from: number): string[] {
  return allParsedRows().flatMap(({ rel, line, row }) => {
    const ts = row.ts;
    const gated = typeof ts === "number" && ts >= from;
    return gated && ts % 1000 === 0
      ? [`${rel}:${line}: ts=${ts} (${new Date(ts).toISOString()}) is whole-second`]
      : [];
  });
}

/** True for a deferral event a reviewer marked `unjustified`. */
function isUnjustifiedDeferral(e: { kind?: string; reason?: unknown }): boolean {
  return e.kind === "deferral" && e.reason === UNJUSTIFIED_REASON;
}

/** True when a folded entity was once `unjustified` but no longer carries that reason. */
function dropsUnjustified(row: Record<string, unknown>, everUnjustified: Set<string>): boolean {
  return everUnjustified.has(identity(row as never)) && row.reason !== UNJUSTIFIED_REASON;
}

/** True when a folded deferral carries a `reason` outside the enum. */
function hasReasonOutsideEnum(row: Record<string, unknown>): boolean {
  return row.reason !== undefined && !DEFERRAL_REASONS.has(row.reason as string);
}

/** True when a folded deferral updated at or after `from` carries no `reason`. */
function lacksReasonSince(row: Record<string, unknown>, from: number): boolean {
  return typeof row.ts === "number" && row.ts >= from && !row.reason;
}

/** The row's `by.subagent`, in either row shape. */
const subagentOf = (row: Record<string, unknown>): unknown =>
  (normalize(row)["by"] as Record<string, unknown> | undefined)?.["subagent"];

/** True when a folded deferral updated at or after `from` names a writer outside the sanctioned list. */
function hasUnsanctionedWriterSince(row: Record<string, unknown>, from: number): boolean {
  const subagent = subagentOf(row);
  return (
    typeof row.ts === "number" &&
    row.ts >= from &&
    typeof subagent === "string" &&
    !DEFERRAL_WRITERS.has(subagent)
  );
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
        expect(envelopeProblems(rel)).toEqual([]);
      });

      it("every row's kind belongs in this ledger", () => {
        expect(wrongKindRows(rel, kinds).slice(0, 10)).toEqual([]);
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
        .filter(hasReasonOutsideEnum)
        .map((row) => `${String(row.key)}: reason=${JSON.stringify(row.reason)}`);
      expect(bad).toEqual([]);
    });

    // `unjustified` is set by a reviewer on someone else's deferral and carried forward
    // by every later same-`key` row (`.bkit/jsonl.md` § Field Semantics).
    it("no entity drops an `unjustified` verdict a later row was meant to carry", () => {
      const raw = fs.readFileSync(path.join(REPO_ROOT, "docs/deferrals.jsonl"), "utf-8");
      const { events } = parse(raw);
      const everUnjustified = new Set(events.filter(isUnjustifiedDeferral).map((e) => identity(e)));
      const dropped = entities()
        .filter((row) => dropsUnjustified(row, everUnjustified))
        .map((row) => `${String(row.key)}: now reason=${JSON.stringify(row.reason)}`);
      expect(dropped).toEqual([]);
    });

    it("every entity updated since the field landed carries a reason", () => {
      const bare = entities()
        .filter((row) => lacksReasonSince(row, REASON_REQUIRED_FROM))
        .map((row) => `${String(row.key)}: ts=${String(row.ts)}`);
      expect(bare).toEqual([]);
    });

    // The writer list is exhaustive. Same cutoff as above.
    it("no entity since the cutoff names an unsanctioned writer", () => {
      const rogue = entities()
        .filter((row) => hasUnsanctionedWriterSince(row, REASON_REQUIRED_FROM))
        .map((row) => `${String(row.key)}: subagent=${String(subagentOf(row))}`);
      expect(rogue).toEqual([]);
    });
  });

  it("no row smuggles an unexpanded shell substitution into a field", () => {
    expect(unexpandedSubstitutionLines()).toEqual([]);
  });

  // A future `ts` is permanent: `fold()` is last-wins by `ts`, so the row outranks
  // every same-`key` correction that follows it and can never be superseded. Under
  // `merge=union` that is not recoverable by editing either — the stale line
  // survives the merge beside its replacement and still wins. Caught once already
  // and repaired; this is the gate that keeps it caught.
  it("no row carries a ts in the future", () => {
    // Unparseable lines are reported by the parse test above.
    expect(futureTsRows(Date.now())).toEqual([]);
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
    // Unparseable lines are reported by the parse test above.
    expect(wholeSecondTsRows(HANDTYPED_TS_GATED_FROM)).toEqual([]);
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
