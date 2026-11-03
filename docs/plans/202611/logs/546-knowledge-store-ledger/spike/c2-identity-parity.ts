// Claim 2 probe: re-keying the six brain kinds from (kind, repo, key) to (repo, key)
// changes no fold winner on this repo's four ledgers. Uses the engine's own parse,
// normalizeEvent, compareTs and identity; only the brain identity is new.
// Usage: tsx c2-identity-parity.ts <repo-root>
import * as fs from "node:fs";
import * as path from "node:path";

const root = process.argv[2] ?? "";
const T = await import(path.join(root, ".bkit/core/engine/ledgers/telemetry.ts"));

const FILES = [
  "docs/decisions.jsonl",
  "docs/deferrals.jsonl",
  "docs/failures.jsonl",
  "docs/knowledge.jsonl",
];
const BRAIN_KINDS = new Set([
  "knowledge",
  "decision",
  "deferral",
  "failure",
  "assumption",
  "summary",
]);

type Row = Record<string, unknown> & { kind?: string; key?: string; repo?: string; ts?: unknown };
const all: { file: string; row: Row }[] = [];
let malformed = 0;
for (const f of FILES) {
  const parsed = T.parse(fs.readFileSync(path.join(root, f), "utf-8"));
  malformed += parsed.malformedLineCount;
  for (const e of parsed.events) all.push({ file: f, row: T.normalizeEvent(e) as Row });
}
console.log(`rows read: ${all.length}, malformed: ${malformed}`);
const kinds: Record<string, number> = {};
for (const { file, row } of all)
  kinds[`${file}:${row.kind}`] = (kinds[`${file}:${row.kind}`] ?? 0) + 1;
console.log("rows per file:kind", JSON.stringify(kinds));
const repos: Record<string, number> = {};
for (const { row } of all) repos[String(row.repo)] = (repos[String(row.repo)] ?? 0) + 1;
console.log("rows per repo", JSON.stringify(repos));
console.log(
  `rows without a string key: ${all.filter(({ row }) => typeof row.key !== "string" || row.key === "").length}`,
);

const brainId = (r: Row): string =>
  BRAIN_KINDS.has(String(r.kind)) ? `brain ${r.repo} ${r.key ?? r.ts}` : T.identity(r);

function foldWith(rows: Row[], id: (r: Row) => string): Map<string, Row> {
  const sorted = [...rows].sort(T.compareTs);
  const m = new Map<string, Row>();
  for (const r of sorted) m.set(id(r), r);
  return m;
}

const rows = all.map((a) => a.row);
const oldFold = T.fold(rows) as Map<string, Row>;
const newFold = foldWith(rows, brainId);
console.log(`entries under (kind, repo, key): ${oldFold.size}`);
console.log(`entries under (repo, key): ${newFold.size}`);

// cross-kind / cross-file collisions in (repo, key) space
const byKey = new Map<string, Set<string>>();
for (const { file, row } of all) {
  const k = `${row.repo} ${row.key}`;
  if (!byKey.has(k)) byKey.set(k, new Set());
  byKey.get(k)!.add(`${file}:${row.kind}`);
}
const collisions = [...byKey].filter(([, s]) => s.size > 1);
console.log(`(repo, key) collisions across file or kind: ${collisions.length}`);
for (const [k, s] of collisions) console.log(`  ${k} -> ${[...s].join(", ")}`);

// winner parity: every old winner is a new winner, same object
const oldWinners = new Set([...oldFold.values()]);
const newWinners = new Set([...newFold.values()]);
const onlyOld = [...oldWinners].filter((w) => !newWinners.has(w));
const onlyNew = [...newWinners].filter((w) => !oldWinners.has(w));
console.log(`winners only under old identity: ${onlyOld.length}`);
console.log(`winners only under new identity: ${onlyNew.length}`);

// fields the design adds that would change ranking or recall: must be absent today
for (const f of ["proposal", "lastRecalled", "links"]) {
  console.log(`rows carrying '${f}': ${rows.filter((r) => f in r).length}`);
}
// rows with equal ts inside one new entry (tie order would decide the winner)
const tsTies = new Map<string, number>();
for (const r of rows) {
  const k = `${brainId(r)}@${String(r.ts)}`;
  tsTies.set(k, (tsTies.get(k) ?? 0) + 1);
}
console.log(`same-entry rows sharing one ts: ${[...tsTies.values()].filter((n) => n > 1).length}`);
const superseded = [...newFold.values()].filter((w) => w.status === "SUPERSEDED").length;
console.log(`SUPERSEDED winners: ${superseded}`);
const ok =
  collisions.length === 0 &&
  onlyOld.length === 0 &&
  onlyNew.length === 0 &&
  oldFold.size === newFold.size;
console.log(`PARITY: ${ok ? "HOLDS" : "BROKEN"}`);
process.exit(ok ? 0 : 1);
