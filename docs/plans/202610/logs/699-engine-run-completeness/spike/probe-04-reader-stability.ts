// PROBE 4 — is the reader surgery (MARK_ROWS) load-bearing, and what exactly shifts?
//
// Takes a real corpus run (650-workflows-prompt-alone, the build run that closed), computes
// the readers' output on it, then re-computes with one synthetic `engine-call` row inserted
// immediately before every `step-done` row (a stand-in for the seam's dispatch-entry journal),
// with and without the two new types added to MARK_ROWS.
//
// Also runs the harvest's own `splitRuns` (its MARK_ROWS copy is asserted equal to the engine's).
import fs from "node:fs";
import {
  MARK_ROWS,
  stepsBlock,
} from "../../../../../../.bkit/core/engine/commands/workflow/run-facts.js";
import { splitRuns } from "../../../../../../scripts/harvest/bkit-harvest.mjs";

const ROOT = new URL("../../../../../../", import.meta.url).pathname;
const FILE = `${ROOT}docs/plans/202610/logs/650-workflows-prompt-alone/status.jsonl`;

type Row = Record<string, unknown>;
const all: Row[] = fs
  .readFileSync(FILE, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l) as Row);

// The last run in the file (starts at the last `workflow-started`).
const startIdx = all.map((r) => r.type).lastIndexOf("workflow-started");
const rows = all.slice(startIdx);
console.log(`run rows: ${rows.length} (file rows ${all.length}, run starts at ${startIdx + 1})`);

const block = (r: Row[]) => stepsBlock(r as never);
const baseline = block(rows);
console.log(`\nBASELINE stepsBlock (no journal rows):`);
console.log(JSON.stringify(baseline));

// Insert one `engine-call` row 1ms before every `step-done` row.
const injected: Row[] = [];
for (const r of rows) {
  if (r.type === "step-done") {
    injected.push({
      type: "engine-call",
      workflow: r.workflow,
      at: new Date(Date.parse(String(r.at)) - 1).toISOString().replace(/\.\d{3}Z$/, "Z"),
      noun: "steps",
      verb: "done",
      flags: ["workflow", "step", "file"],
    });
  }
  injected.push(r);
}
console.log(`\ninjected engine-call rows: ${injected.length - rows.length}`);

const withJournal = block(injected);
console.log(`\nstepsBlock WITH journal rows, MARK_ROWS UNCHANGED (current 3 entries):`);
console.log(JSON.stringify(withJournal));

// Same rows, MARK_ROWS extended with the two new types.
const EXTENDED = new Set([...MARK_ROWS, "engine-call", "completeness"]);
const blockExt = (r: Row[]) => {
  const filtered = r.filter((x) => !EXTENDED.has(String(x.type)));
  return stepsBlock(filtered as never);
};
const withJournalFixed = blockExt(injected);
console.log(`\nstepsBlock WITH journal rows, MARK_ROWS EXTENDED with engine-call + completeness:`);
console.log(JSON.stringify(withJournalFixed));

console.log(
  `\nbaseline == extended-MARK_ROWS output: ${JSON.stringify(baseline) === JSON.stringify(withJournalFixed)}`,
);
console.log(
  `baseline == unchanged-MARK_ROWS output: ${JSON.stringify(baseline) === JSON.stringify(withJournal)}`,
);

// Harvest reader: splitRuns' afterEnd / last / row count.
const runsA = splitRuns(rows);
const runsB = splitRuns(injected);
const a = runsA[runsA.length - 1]!;
const b = runsB[runsB.length - 1]!;
console.log(`\nharvest splitRuns, last run:`);
console.log(
  `  corpus : rows=${a.rows.length} afterEnd=${a.afterEnd} last=${String(a.last.at)} (${String(a.last.type)})`,
);
console.log(
  `  journal: rows=${b.rows.length} afterEnd=${b.afterEnd} last=${String(b.last.at)} (${String(b.last.type)})`,
);
