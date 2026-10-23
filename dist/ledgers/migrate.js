// Ledger rows written before `schema: 2` rewritten in place into the current shape
// (`docs/migrations.md`). Each line goes through `normalize`; a line that already
// carries `schema`, does not parse, or is not a JSON object stays byte-for-byte,
// so a second run changes nothing. Readers still normalize: a union merge can
// bring an old line back from a branch that predates the rewrite, beside its
// rewritten copy. The next run drops such a line instead of rewriting it twice.
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
];
/** True for a repo ledger path: append-only data, never a bkit-managed file. */
export const isSchemaLedger = (relPath) => SCHEMA_LEDGERS.includes(relPath.split(path.sep).join("/"));
/** A line's row when it is a JSON object, else undefined. */
function rowOf(body) {
    const parsed = parseJson(body);
    const row = parsed.ok ? parsed.value : undefined;
    return row !== null && typeof row === "object" && !Array.isArray(row)
        ? row
        : undefined;
}
/**
 * `text` with every pre-schema row rewritten; `rewritten` counts the lines changed.
 * A pre-schema row whose rewrite is already a schema line of `text` is dropped and
 * counted in `dropped`: it is that row's copy from an unmigrated branch.
 */
export function migrateLedgerText(text) {
    let rewritten = 0;
    let dropped = 0;
    const bodies = text.split("\n").map((line) => line.replace(/\r$/, ""));
    const present = new Set(bodies.filter((b) => rowOf(b)?.["schema"] !== undefined));
    const lines = text.split("\n").flatMap((line, i) => {
        const body = bodies[i] ?? "";
        if (body.trim() === "")
            return [line];
        const row = rowOf(body);
        if (row === undefined || row["schema"] !== undefined)
            return [line];
        const next = JSON.stringify(normalize(row));
        if (present.has(next)) {
            dropped++;
            return [];
        }
        rewritten++;
        return [next + line.slice(body.length)];
    });
    return { text: lines.join("\n"), rewritten, dropped };
}
/**
 * Rewrite (or drop, as {@link migrateLedgerText} does) the pre-schema rows of every {@link SCHEMA_LEDGERS} file under `root`;
 * with `dryRun`, only count them. Returns the files that have (or had) such rows,
 * with their line counts. Writes via temp file + rename, so an interrupted run
 * never leaves a torn ledger.
 */
export function migrateLedgers(root, dryRun) {
    const out = [];
    for (const file of SCHEMA_LEDGERS) {
        const abs = path.join(root, file);
        if (!fs.lstatSync(abs, { throwIfNoEntry: false })?.isFile())
            continue;
        const { text, rewritten, dropped } = migrateLedgerText(fs.readFileSync(abs, "utf-8"));
        if (rewritten + dropped === 0)
            continue;
        if (!dryRun) {
            const tmp = `${abs}.bkit-migrate.tmp`;
            fs.writeFileSync(tmp, text, "utf-8");
            fs.renameSync(tmp, abs);
        }
        out.push({ file, rewritten, dropped });
    }
    return out;
}
