// Claim 5 probe: `bkit brain context --files` (design steps 1-7, throwaway) costs fewer
// tokens (characters / 4) than reading every current docs/knowledge.jsonl row, on three
// recorded tasks' file lists; plus the design's coverage figures (93% / 96% path reach,
// >100 rows on telemetry.ts). Output goes through the engine's real clampFile "ledger".
// Usage: tsx c5-context-cost.ts <repo-root> <migrated-brain> <scratch-dir> <task-files-dir>
import * as fs from "node:fs";
import * as path from "node:path";

const [root = "", brainFile = "", scratch = "", tasksDir = ""] = process.argv.slice(2);
const T = await import(path.join(root, ".bkit/core/engine/ledgers/telemetry.ts"));
const C = await import(path.join(root, ".bkit/core/engine/commands/workflow/context.ts"));

type Row = Record<string, unknown>;
const TERMINAL = new Set(["SUPERSEDED", "CLOSED", "FALSIFIED", "FADED"]);
const tok = (s: string): number => Math.ceil(s.length / 4);

// 1. readBrain: fold under (repo, key), keep current winners
const sorted = (
  T.parse(fs.readFileSync(brainFile, "utf-8")).events.map(T.normalizeEvent) as Row[]
).sort(T.compareTs);
const fold = new Map<string, Row>();
for (const r of sorted) fold.set(`brain ${r["repo"]} ${r["key"]}`, r);
const current = [...fold.values()].filter((r) => !TERMINAL.has(String(r["status"])));
console.log(`brain entries: ${fold.size}, current: ${current.length}`);

// 2. normalise references
const norm = (ref: string): string =>
  ref
    .replace(/ §.*$/, "")
    .replace(/:\d+(-\d+)?$/, "")
    .replace(/^\.\//, "")
    .replace(/\/$/, "");
const isPath = (ref: string): boolean => {
  const n = norm(ref);
  return n.includes("/") || fs.existsSync(path.join(root, n));
};
const refsOf = (r: Row): string[] =>
  Array.isArray(r["references"])
    ? (r["references"] as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

// coverage figures the design cites
for (const kind of ["knowledge", "decision"]) {
  const rows = current.filter((r) => r["kind"] === kind);
  const withPath = rows.filter((r) => refsOf(r).some(isPath)).length;
  console.log(
    `current ${kind}: ${rows.length}, with >=1 path reference: ${withPath} (${((100 * withPath) / rows.length).toFixed(1)}%)`,
  );
}
const hot = ".bkit/core/engine/ledgers/telemetry.ts";
const matches = (r: Row, file: string): number | undefined => {
  let best: number | undefined;
  for (const ref of refsOf(r)) {
    const n = norm(ref);
    if (n === "") continue;
    if (n === file) return 0;
    if (file.startsWith(n + "/")) {
      const depth = file.slice(n.length + 1).split("/").length;
      best = best === undefined ? depth : Math.min(best, depth);
    }
  }
  return best;
};
console.log(
  `current rows matching ${hot}: ${current.filter((r) => matches(r, hot) !== undefined).length}`,
);

// before figure: every current docs/knowledge.jsonl row (and every line of the file)
const knowledgeLines = fs.readFileSync(path.join(root, "docs/knowledge.jsonl"), "utf-8");
const kFold = T.fold(T.parse(knowledgeLines).events) as Map<string, Row>;
const kCurrent = [...kFold.values()].filter((r) => !TERMINAL.has(String(r["status"])));
const beforeText = kCurrent.map((r) => JSON.stringify(r) + "\n").join("");
console.log(
  `BEFORE: whole docs/knowledge.jsonl = ${tok(knowledgeLines)} tokens (${knowledgeLines.length} chars); current knowledge rows (${kCurrent.length}) = ${tok(beforeText)} tokens`,
);

const KIND_ORDER = ["failure", "knowledge", "assumption", "decision", "deferral", "summary"];
fs.mkdirSync(scratch, { recursive: true });
for (const task of fs.readdirSync(tasksDir).sort()) {
  const files = fs
    .readFileSync(path.join(tasksDir, task), "utf-8")
    .split("\n")
    .filter((l) => l !== "");
  // 3-4. select and rank
  const picked = current
    .map((r) => {
      const ds = files.map((f) => matches(r, f)).filter((d): d is number => d !== undefined);
      return ds.length === 0 ? undefined : { r, d: Math.min(...ds) };
    })
    .filter((x): x is { r: Row; d: number } => x !== undefined)
    .sort(
      (a, b) =>
        a.d - b.d ||
        KIND_ORDER.indexOf(String(a.r["kind"])) - KIND_ORDER.indexOf(String(b.r["kind"])) ||
        Number(b.r["ts"]) - Number(a.r["ts"]),
    );
  // 5. always-loaded part, capped at 2,000 tokens
  const always: Row[] = [];
  let alwaysTok = 0;
  const pathless = current
    .filter(
      (r) =>
        ["summary", "knowledge", "assumption"].includes(String(r["kind"])) &&
        !refsOf(r).some(isPath),
    )
    .sort((a, b) => Number(b["ts"]) - Number(a["ts"]));
  for (const r of pathless) {
    const t = tok(JSON.stringify(r) + "\n");
    if (alwaysTok + t > 2000) break;
    always.push(r);
    alwaysTok += t;
  }
  const text = [...picked.map((p) => p.r), ...always].map((r) => JSON.stringify(r) + "\n").join("");
  // 6. clamp through the engine's ledger profile
  const out = path.join(scratch, `${task}.md`);
  fs.writeFileSync(out, text);
  const rec = C.clampFile(out, "ledger", out);
  const final = fs.readFileSync(out, "utf-8");
  console.log(
    `TASK ${task}: files=${files.length} selected=${picked.length} (exact=${picked.filter((p) => p.d === 0).length}) pathless-candidates=${pathless.length} always-loaded=${always.length} (${alwaysTok} tok) ` +
      `pre-clamp=${tok(text)} tok, clamped=${rec.clamped}, origLines=${rec.origLines}, keptLines=${rec.keptLines}, AFTER=${tok(final)} tok, ratio after/before(current knowledge)=${(tok(final) / tok(beforeText)).toFixed(3)}`,
  );
}
