// `bkit ledgers compact`: the five keyed ledgers rewritten to their fold winners
// (`.bkit/jsonl.md` § Compaction). A superseded same-identity row is dropped; the
// winner stays in place and gains `firstTs` + `updates` from every row of its entry,
// so age and recurrence survive the drop. Malformed, non-object, blank and keyless
// lines, and rows of kinds outside `AGED_KINDS`, stay byte-for-byte, as does a
// winner already carrying the right values, so a second run changes nothing. A
// union merge that brings dropped rows back is undone by the next run.

import * as fs from "node:fs";
import * as path from "node:path";

import { parseJson } from "../shared/json.js";
import {
  APPEND_LEDGERS,
  compareTs,
  identity,
  isAgedRow,
  lineage,
  normalize,
  placeLineage,
  type TelemetryEvent,
} from "./telemetry.js";

/** The ledgers compaction rewrites, by `--ledger` name. */
export const COMPACT_LEDGERS = {
  knowledge: APPEND_LEDGERS.knowledge.file,
  decisions: APPEND_LEDGERS.decisions.file,
  deferrals: APPEND_LEDGERS.deferrals.file,
  failures: APPEND_LEDGERS.failures.file,
  issues: ".bkit/issues.jsonl",
} as const;

export type CompactLedger = keyof typeof COMPACT_LEDGERS;

export interface CompactCounts {
  /** Lines holding a row this run folds. */
  rows: number;
  /** Superseded rows removed. */
  dropped: number;
  /** Winners whose `firstTs` / `updates` were set or corrected. */
  stamped: number;
}

/** A line's row when it is a JSON object, else undefined. */
function rowOf(body: string): Record<string, unknown> | undefined {
  const parsed = parseJson(body);
  const row = parsed.ok ? parsed.value : undefined;
  return row !== null && typeof row === "object" && !Array.isArray(row)
    ? (row as Record<string, unknown>)
    : undefined;
}

/** `text` with each entry's superseded rows dropped and its winner stamped, plus the counts. */
export function compactLedgerText(text: string): CompactCounts & { text: string } {
  const lines = text.split("\n");
  // `row` = the line read through `normalize`, as the fold reads it; `raw` = as written.
  type Entry = { i: number; row: Record<string, unknown>; raw: Record<string, unknown> };
  const groups = new Map<string, Entry[]>();
  lines.forEach((line, i) => {
    const body = line.replace(/\r$/, "");
    if (body.trim() === "") return;
    const raw = rowOf(body);
    if (raw === undefined) return;
    const row = normalize(raw);
    if (!isAgedRow(row)) return;
    const id = identity(row as TelemetryEvent);
    groups.set(id, [...(groups.get(id) ?? []), { i, row, raw }]);
  });

  const drop = new Set<number>();
  const replace = new Map<number, string>();
  let rows = 0;
  let stamped = 0;
  for (const group of groups.values()) {
    rows += group.length;
    // The fold's winner: highest `ts`, the later line on a tie.
    const winner = group.reduce((best, r) =>
      compareTs({ ts: r.row["ts"] }, { ts: best.row["ts"] }) >= 0 ? r : best,
    );
    for (const r of group) if (r !== winner) drop.add(r.i);
    const l = lineage(group.map((r) => r.row));
    if (winner.row["firstTs"] === l.firstTs && winner.row["updates"] === l.updates) continue;
    const crlf = (lines[winner.i] ?? "").endsWith("\r") ? "\r" : "";
    replace.set(winner.i, JSON.stringify(placeLineage(winner.raw, l)) + crlf);
    stamped++;
  }

  const out = lines.flatMap((line, i) => (drop.has(i) ? [] : [replace.get(i) ?? line]));
  return { text: out.join("\n"), rows, dropped: drop.size, stamped };
}

export interface CompactResult extends CompactCounts {
  ledger: CompactLedger;
  file: string;
  /** False when the file is absent, or `dryRun` / nothing to change left it as it was. */
  written: boolean;
}

/**
 * Compact each named ledger under `root`; with `dryRun`, only count. Writes via temp
 * file + rename, and only when the text changes, so an interrupted run never leaves a
 * torn ledger. A missing ledger is reported with zero counts.
 */
export function compactLedgers(
  root: string,
  ledgers: readonly CompactLedger[],
  dryRun: boolean,
): CompactResult[] {
  return ledgers.map((ledger) => {
    const file = COMPACT_LEDGERS[ledger];
    const abs = path.join(root, file);
    if (!fs.lstatSync(abs, { throwIfNoEntry: false })?.isFile()) {
      return { ledger, file, rows: 0, dropped: 0, stamped: 0, written: false };
    }
    const { text, ...counts } = compactLedgerText(fs.readFileSync(abs, "utf-8"));
    const change = counts.dropped + counts.stamped > 0;
    if (change && !dryRun) {
      const tmp = `${abs}.bkit-compact.tmp`;
      fs.writeFileSync(tmp, text, "utf-8");
      fs.renameSync(tmp, abs);
    }
    return { ledger, file, ...counts, written: change && !dryRun };
  });
}
