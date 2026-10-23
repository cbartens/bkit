// Ledger rows written before `schema: 2` rewritten in place into the current shape
// (`docs/migrations.md`). Each line goes through `normalize`; a line that already
// carries `schema`, does not parse, or is not a JSON object stays byte-for-byte,
// so a second run changes nothing. Readers still normalize: a union merge can
// bring an old line back from a branch that predates the rewrite.

import * as fs from "node:fs";
import * as path from "node:path";

import { parseJson } from "../shared/json.js";
import { normalize } from "./telemetry.js";

/** Every repo ledger whose rows carry the shared top section (`.bkit/jsonl.md`). */
export const SCHEMA_LEDGERS = [
  ".bkit/stats.jsonl",
  ".bkit/friction.jsonl",
  ".bkit/issues.jsonl",
  "docs/decisions.jsonl",
  "docs/deferrals.jsonl",
  "docs/failures.jsonl",
  "docs/knowledge.jsonl",
] as const;

/** True for a repo ledger path: append-only data, never a bkit-managed file. */
export const isSchemaLedger = (relPath: string): boolean =>
  (SCHEMA_LEDGERS as readonly string[]).includes(relPath.split(path.sep).join("/"));

/** `text` with every pre-schema row rewritten; `rewritten` counts the lines changed. */
export function migrateLedgerText(text: string): { text: string; rewritten: number } {
  let rewritten = 0;
  const lines = text.split("\n").map((line) => {
    const body = line.replace(/\r$/, "");
    if (body.trim() === "") return line;
    const parsed = parseJson(body);
    const row = parsed.ok ? parsed.value : undefined;
    if (row === null || typeof row !== "object" || Array.isArray(row)) return line;
    if ((row as Record<string, unknown>)["schema"] !== undefined) return line;
    rewritten++;
    return JSON.stringify(normalize(row)) + line.slice(body.length);
  });
  return { text: lines.join("\n"), rewritten };
}

/**
 * Rewrite the pre-schema rows of every {@link SCHEMA_LEDGERS} file under `root`;
 * with `dryRun`, only count them. Returns the files that have (or had) such rows,
 * with their line counts. Writes via temp file + rename, so an interrupted run
 * never leaves a torn ledger.
 */
export function migrateLedgers(
  root: string,
  dryRun: boolean,
): Array<{ file: string; rewritten: number }> {
  const out: Array<{ file: string; rewritten: number }> = [];
  for (const file of SCHEMA_LEDGERS) {
    const abs = path.join(root, file);
    if (!fs.lstatSync(abs, { throwIfNoEntry: false })?.isFile()) continue;
    const { text, rewritten } = migrateLedgerText(fs.readFileSync(abs, "utf-8"));
    if (rewritten === 0) continue;
    if (!dryRun) {
      const tmp = `${abs}.bkit-migrate.tmp`;
      fs.writeFileSync(tmp, text, "utf-8");
      fs.renameSync(tmp, abs);
    }
    out.push({ file, rewritten });
  }
  return out;
}
