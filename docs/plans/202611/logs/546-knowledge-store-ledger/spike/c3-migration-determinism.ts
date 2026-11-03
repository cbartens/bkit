// Claim 3 probe: a throwaway mergeIntoBrain that follows the design's Migration mapping
// (fixed input order, fill status / summary, exact-key references -> links.relatedTo,
// malformed lines copied, never mint ts, drop a line whose identity and ts the brain
// already holds). Writes the brain to <out>, so two separate runs can be compared byte
// for byte. Mode "second": runs again over <out> plus stubs holding what claim 1 showed
// union brings back (all old lines) plus one straggler line.
// Usage: tsx c3-migration-determinism.ts <repo-root> <out-file> [second]
import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";

const root = process.argv[2] ?? "";
const out = process.argv[3] ?? "";
const mode = process.argv[4] ?? "first";
const T = await import(path.join(root, ".bkit/core/engine/ledgers/telemetry.ts"));

const ORDER = [
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
const DEFAULT_STATUS: Record<string, string> = {
  knowledge: "ACTIVE",
  decision: "ACTIVE",
  summary: "ACTIVE",
  assumption: "ACTIVE",
  deferral: "OPEN",
  failure: "OPEN",
};
type Row = Record<string, unknown>;
const rowOf = (line: string): Row | undefined => {
  try {
    const v = JSON.parse(line);
    return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Row) : undefined;
  } catch (e) {
    if (e instanceof SyntaxError) return undefined; // malformed line: copied byte-for-byte below
    throw e;
  }
};
const idOf = (r: Row): string =>
  BRAIN_KINDS.has(String(r["kind"])) ? `brain ${r["repo"]} ${r["key"] ?? r["ts"]}` : T.identity(r);
const firstSentence = (s: string): string => {
  const m = s.match(/^.*?[.!?](\s|$)/s);
  return (m ? m[0] : s).trim().replace(/\s+/g, " ").slice(0, 200);
};

const stats = {
  lines: 0,
  malformed: 0,
  blank: 0,
  statusFilled: 0,
  summaryFilled: 0,
  linked: 0,
  linkEdges: 0,
  dropped: 0,
  copiedVerbatim: 0,
  selfRefs: 0,
};

/** The pure mapping: brain text + the four old files' texts -> new brain text. */
function mergeIntoBrain(brainText: string, olds: string[]): string {
  const brainLines = brainText === "" ? [] : brainText.replace(/\n$/, "").split("\n");
  const held = new Set<string>();
  for (const l of brainLines) {
    const r = rowOf(l);
    if (r) held.add(`${idOf(r)}@${String(r["ts"])}`);
  }
  const inputLines = olds.flatMap((t) => (t === "" ? [] : t.replace(/\n$/, "").split("\n")));
  const keys = new Set<string>();
  for (const l of [...brainLines, ...inputLines]) {
    const r = rowOf(l);
    if (r && typeof r["key"] === "string") keys.add(r["key"]);
  }
  const mapped: string[] = [];
  for (const line of inputLines) {
    stats.lines++;
    if (line.trim() === "") {
      stats.blank++;
      mapped.push(line);
      continue;
    }
    const r = rowOf(line);
    if (!r) {
      stats.malformed++;
      mapped.push(line);
      continue;
    }
    const tag = `${idOf(r)}@${String(r["ts"])}`;
    if (held.has(tag)) {
      stats.dropped++;
      continue;
    }
    held.add(tag);
    let changed = false;
    const next: Row = { ...r };
    if (next["status"] === undefined) {
      next["status"] = DEFAULT_STATUS[String(r["kind"])];
      stats.statusFilled++;
      changed = true;
    }
    if (typeof next["summary"] !== "string" || next["summary"] === "") {
      next["summary"] = firstSentence(String(r["description"] ?? ""));
      stats.summaryFilled++;
      changed = true;
    }
    const refs = Array.isArray(r["references"]) ? (r["references"] as unknown[]) : [];
    const self = refs.filter((x) => x === r["key"]).length;
    stats.selfRefs += self;
    const related = [
      ...new Set(
        refs.filter((x): x is string => typeof x === "string" && x !== r["key"] && keys.has(x)),
      ),
    ];
    if (related.length > 0) {
      next["links"] = { relatedTo: related };
      stats.linked++;
      stats.linkEdges += related.length;
      changed = true;
    }
    if (!changed) stats.copiedVerbatim++;
    mapped.push(changed ? JSON.stringify(next) : line);
  }
  const all = [...brainLines, ...mapped];
  return all.length === 0 ? "" : all.join("\n") + "\n";
}

const read = (p: string): string => fs.readFileSync(p, "utf-8");
const sha = (s: string): string => createHash("sha256").update(s).digest("hex").slice(0, 16);
const olds = ORDER.map((f) => read(path.join(root, f)));

if (mode === "first") {
  const brain = mergeIntoBrain("", olds);
  fs.writeFileSync(out, brain);
  console.log(`input lines (wc -l sum): ${olds.reduce((n, t) => n + t.split("\n").length - 1, 0)}`);
  console.log(`output lines: ${brain.split("\n").length - 1}`);
  console.log(`output sha256/16: ${sha(brain)}`);
  console.log(JSON.stringify(stats));
  // fold parity: winners of the migrated brain vs winners of the old files, added fields stripped
  const oldWinners = T.fold(olds.flatMap((t) => T.parse(t).events)) as Map<string, Row>;
  const sorted = T.parse(brain).events.map(T.normalizeEvent).sort(T.compareTs) as Row[];
  const neu = new Map<string, Row>();
  for (const r of sorted) neu.set(idOf(r), r);
  const oldByEntry = new Map<string, Row>();
  for (const w of oldWinners.values()) oldByEntry.set(idOf(w), w);
  let same = 0;
  let differ = 0;
  for (const [id, w] of oldByEntry) {
    const n = neu.get(id);
    if (!n) {
      differ++;
      continue;
    }
    const strip = (x: Row, ref: Row): string => {
      const c: Row = { ...x };
      delete c["links"];
      if (ref["status"] === undefined) delete c["status"];
      if (typeof ref["summary"] !== "string" || ref["summary"] === "") delete c["summary"];
      return JSON.stringify(c);
    };
    if (strip(n, w) === strip(w, w) && n["ts"] === w["ts"]) same++;
    else differ++;
  }
  console.log(
    `entries old: ${oldByEntry.size}, entries new: ${neu.size}, winners equal (added fields stripped): ${same}, differ: ${differ}`,
  );
} else {
  // second run: brain from the first run, stubs refilled the way claim 1's union merge refills them
  const brain = read(out);
  const straggler = JSON.stringify({
    ...rowOf(olds[3]!.split("\n")[0]!)!,
    key: "spike-straggler-row",
    ts: 1793520000123,
    summary: "a row a pre-upgrade branch appended after the upgrade",
  });
  const stubs = [olds[0]!, olds[1]!, olds[2]!, olds[3]! + straggler + "\n"];
  const again = mergeIntoBrain(brain, stubs);
  const noStraggler = mergeIntoBrain(brain, [olds[0]!, olds[1]!, olds[2]!, olds[3]!]);
  const emptyStubs = mergeIntoBrain(brain, ["", "", "", ""]);
  console.log(`brain sha256/16 before: ${sha(brain)}`);
  console.log(`second run, empty stubs: identical=${emptyStubs === brain}`);
  console.log(`second run, stubs refilled with every old line: identical=${noStraggler === brain}`);
  console.log(
    `second run, refilled + 1 straggler: added lines=${again.split("\n").length - brain.split("\n").length}, prefix identical=${again.startsWith(brain)}`,
  );
  console.log(JSON.stringify(stats));
}
