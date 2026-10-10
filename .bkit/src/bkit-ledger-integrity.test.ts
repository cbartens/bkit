/**
 * bkit-ledger-integrity.test.ts — the repo's LIVE ledgers stay machine-readable.
 *
 * Ledger appends are best-effort and exit 0 by design (`.bkit/jsonl.md`
 * § Best-effort append), so a malformed row raises no signal at write time and
 * nothing downstream notices until a reader fails. One invalid line (e.g. a
 * `ts` that is a literal, unexpanded `$(date +%s)000`) makes `jq` reject the
 * WHOLE file, so `bkit harvest`, the analysis pass, and every fold over that
 * ledger fail. A row with no `kind` cannot be routed to its ledger.
 *
 * `bkit-telemetry-lint.test.ts` covers the codec against fixtures; this file
 * asserts the real files on disk. Fixtures cannot catch a hand-appended row.
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
} from "./bkit-telemetry";

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
 * The one ledger rows are REMOVED from (`bkit harvest` drains it), and therefore
 * the one that must NOT carry `merge=union` in the shipped block — union would
 * resurrect rows a drain deleted. Every other ledger in {@link LEDGERS} is
 * strictly append-only and must carry it.
 */
const DRAINED_LEDGER = ".bkit/friction.jsonl";

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

  // `reason` (`.bkit/jsonl.md` § Deferral Reason) is what makes a deferral's claim
  // to be out-of-scope adjudicable rather than self-granted. `validate()` gates it
  // on programmatic writes, but every live deferral row is appended by an agent via
  // `jq >>`, which never touches the codec — so the file itself is the only place
  // the enum can be enforced.
  describe("docs/deferrals.jsonl reason", () => {
    // Rows appended before the field existed cannot grow one: the ledger is
    // append-only and backfilling would invent a justification nobody gave. The
    // cutoff is the day the field landed; every row already on disk predates it.
    const REASON_REQUIRED_FROM = 1785456000000; // 2026-07-31T00:00:00Z

    // FOLDED, not per-line: a superseded row keeps whatever it said, by design
    // (`.bkit/jsonl.md` § Updating a Row — "older rows = history"), so a value
    // corrected by same-`key` append must not keep failing from the line it was
    // corrected on. What has to hold is the CURRENT state of each entity.
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

    // `unjustified` is the one reason its own writer cannot assign — a reviewer
    // sets it on someone else's deferral. `fold()` is last-write-wins over the
    // whole row, so the next same-`key` append silently decides whether the
    // verdict survives, and the party it judges is usually the one appending.
    // `.bkit/jsonl.md` § Field Semantics states the carry-forward; nothing but
    // this test enforces it, and the rate in `computeDeferralDiscipline` counts
    // the folded entity, so a dropped verdict erases the finding outright.
    it("no entity drops an `unjustified` verdict a later row was meant to carry", () => {
      const raw = fs.readFileSync(path.join(REPO_ROOT, "docs/deferrals.jsonl"), "utf-8");
      const { events } = parse(raw);
      const everUnjustified = new Set(
        events
          .filter((e) => (e as Record<string, unknown>)["reason"] === UNJUSTIFIED_REASON)
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

    // The writer list is exhaustive, and prose alone did not hold it: the plan
    // executor wrote rows despite a contract line forbidding it, turning blocked
    // plan tasks into ledger entries the build loop reads as settled. Same cutoff
    // as above — the rows that predate the rule stay as the record of why it exists.
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
   * A BACKDATED `ts` is the milder twin of the future one above, and the gate
   * there cannot see it: a fabricated past value is indistinguishable from a
   * real one, so it passes silently while still reordering the last-wins fold.
   *
   * What separates them is precision. `now*1000|floor` (`.bkit/jsonl.md`
   * § Write Idiom) lands on a whole second once in a thousand rows; a
   * hand-typed one is round, because a model writing a number by hand reaches
   * for `…T00:00:00Z` and increments. The live ledgers carry the split as a
   * controlled experiment: `.bkit/stats.jsonl`, appended only by the workflow
   * shell via the idiom, is 0-for-63 whole-second, while the agent-appended
   * ledgers — whose prompts say "in `.bkit/jsonl.md` format" and hand the model
   * a JSON shape to author — are 44-for-270, including two decisions stamped
   * the identical midnight value and three deferrals at a sequential
   * `00:00:10/11/12`.
   *
   * Rows below the cutoff are that evidence and stay: the ledgers are
   * append-only, and re-minting history would invent the very data this gate
   * exists to keep out.
   *
   * Limits, stated rather than papered over: this catches round numbers, not
   * dishonesty in general — a hand-typed `…006903` still passes, as does a
   * fabricated round value backdated below the cutoff. It also fails the
   * genuine 1-in-1000 mint. That one is not worth an escape hatch: re-run the
   * append and take the new `ts`. Never hand-edit a digit to clear this test.
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

  for (const rel of [".gitattributes", ".bkit/templates/.gitattributes"]) {
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
