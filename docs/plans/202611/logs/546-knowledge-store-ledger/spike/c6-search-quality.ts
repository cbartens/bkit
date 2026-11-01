// Claim 6 probe: on the seven recorded plan Step 4 lookups, FTS5 bm25 over the brain's
// current fold winners finds rows that the engine's real ledgerScan, fed the same winners
// serialised one per line, misses or ranks out of its kept 40.
// Decision rule, fixed before the run: the claim holds when, on >= 2 of 7 lookups,
// ledgerScan's kept output misses >= 3 of FTS5's top 10, OR >= 25% of all ledgerScan kept
// hits match their terms only through JSON keys / metadata, not the row's text fields.
// Usage: node --import tsx c6-search-quality.ts <repo-root> <migrated-brain>
import * as fs from "node:fs";
import * as path from "node:path";
import { DatabaseSync } from "node:sqlite";

const [root = "", brainFile = ""] = process.argv.slice(2);
const T = await import(path.join(root, ".bkit/core/engine/ledgers/telemetry.ts"));
const C = await import(path.join(root, ".bkit/core/engine/commands/workflow/context.ts"));

type Row = Record<string, unknown>;
const TERMINAL = new Set(["SUPERSEDED", "CLOSED", "FALSIFIED", "FADED"]);
const sorted = (
  T.parse(fs.readFileSync(brainFile, "utf-8")).events.map(T.normalizeEvent) as Row[]
).sort(T.compareTs);
const fold = new Map<string, Row>();
for (const r of sorted) fold.set(`brain ${r["repo"]} ${r["key"]}`, r);
const current = [...fold.values()].filter((r) => !TERMINAL.has(String(r["status"])));
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const body = (r: Row): string =>
  ["description", "rationale", "rootCause", "remediation", "falsifiedBy"]
    .map((f) => str(r[f]))
    .join(" ");
const refs = (r: Row): string =>
  Array.isArray(r["references"]) ? (r["references"] as unknown[]).map(String).join(" ") : "";
const textOf = (r: Row): string => `${str(r["summary"])} ${body(r)} ${refs(r)}`.toLowerCase();

const LOOKUPS = [
  "branding migration vale workflow scripts prefix",
  "codex cloud router tracker guard",
  "completeness friction status-holes engine-call journal",
  "lite workflow retire publish build PR push prompt",
  "machine lock vitest tests-lock slots",
  "session-start advisory rules-read hook preflight",
  "tests verdict fixable tasks ledgers scan-diff",
];

// FTS5 index over the same winners, design schema
const t0 = performance.now();
const db = new DatabaseSync(":memory:");
db.exec(
  "CREATE VIRTUAL TABLE rows USING fts5(key UNINDEXED, kind UNINDEXED, status UNINDEXED, summary, body, refs)",
);
const ins = db.prepare(
  "INSERT INTO rows (key, kind, status, summary, body, refs) VALUES (?, ?, ?, ?, ?, ?)",
);
for (const r of current)
  ins.run(str(r["key"]), str(r["kind"]), str(r["status"]), str(r["summary"]), body(r), refs(r));
const buildMs = performance.now() - t0;
console.log(`corpus: ${current.length} current winners; FTS5 build ${buildMs.toFixed(1)} ms`);
const q = db.prepare(
  "SELECT key, bm25(rows, 0, 0, 0, 10.0, 1.0, 1.0) AS score FROM rows WHERE rows MATCH ? ORDER BY score LIMIT 10",
);
const qCount = db.prepare("SELECT count(*) AS n FROM rows WHERE rows MATCH ?");

const serialised = current.map((r) => JSON.stringify(r)).join("\n") + "\n";
const byLine = new Map<string, Row>(current.map((r) => [JSON.stringify(r), r]));
let lookupsMissing3 = 0;
let keptTotal = 0;
let metaOnly = 0;
for (const terms of LOOKUPS) {
  const words = [
    ...new Set(
      terms
        .toLowerCase()
        .split(/ +/)
        .filter((w) => w !== ""),
    ),
  ];
  const min = words.length >= 2 ? 2 : 1;
  const match = words.map((w) => `"${w.replace(/"/g, '""')}"`).join(" OR ");
  const fts = (q.all(match) as { key: string; score: number }[]).map((x) => x.key);
  const ftsN = (qCount.get(match) as { n: number }).n;
  const scan = C.ledgerScan(serialised, terms);
  const keptLines = scan.content.split("\n").filter((l: string) => l.startsWith("{"));
  const keptKeys = keptLines.map((l: string) => str(byLine.get(l)?.["key"]));
  const missed = fts.filter((k) => !keptKeys.includes(k));
  const meta = keptLines.filter(
    (l: string) => words.filter((w) => textOf(byLine.get(l) ?? {}).includes(w)).length < min,
  ).length;
  keptTotal += keptLines.length;
  metaOnly += meta;
  if (missed.length >= 3) lookupsMissing3++;
  console.log(
    `LOOKUP "${terms}": ledgerScan total=${scan.total} kept=${scan.kept}; FTS5 matches=${ftsN}; FTS5 top10 missed by ledgerScan kept=${missed.length}/${fts.length}; ledgerScan kept hits matching only via keys/metadata=${meta}/${keptLines.length}`,
  );
  console.log(`  FTS5 top5: ${fts.slice(0, 5).join(" | ")}`);
  console.log(`  ledgerScan top5: ${keptKeys.slice(0, 5).join(" | ")}`);
  if (missed.length > 0)
    console.log(
      `  missed: ${missed.map((k) => `${k} [${str(current.find((r) => r["key"] === k)?.["summary"]).slice(0, 90)}]`).join(" || ")}`,
    );
}
const ratio = keptTotal === 0 ? 0 : metaOnly / keptTotal;
console.log(
  `SUMMARY lookups where ledgerScan missed >=3 of FTS5 top10: ${lookupsMissing3}/7; metadata-only share of ledgerScan kept hits: ${metaOnly}/${keptTotal} = ${(100 * ratio).toFixed(1)}%`,
);
console.log(
  `CLAIM (FTS5 adds retrieval ledgerScan lacks): ${lookupsMissing3 >= 2 || ratio >= 0.25 ? "HOLDS" : "DOES NOT HOLD"}`,
);
