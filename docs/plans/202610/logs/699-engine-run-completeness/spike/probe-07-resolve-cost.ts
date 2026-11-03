// PROBE 7 — hot-path cost of the resolve-or-skip scan the design puts on `runCommand`.
//
// The seam runs on every `bkit <noun> <verb>` invocation. This probe implements the described
// scan — walk the cwd's git toplevel for `docs/plans/*/logs/*/status.jsonl`, fold each, find the
// single IN_PROGRESS run — and times it, plus the git spawn it needs.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readRuns } from "../../../../../../.bkit/core/engine/commands/workflow/status.js";

const cwd = process.cwd();

/** The described scan: the single IN_PROGRESS run discoverable from the cwd's toplevel. */
function scan(top: string): Array<{ file: string; workflow: string }> {
  const out: Array<{ file: string; workflow: string }> = [];
  const plans = path.join(top, "docs", "plans");
  if (!fs.existsSync(plans)) return out;
  for (const month of fs.readdirSync(plans)) {
    const logs = path.join(plans, month, "logs");
    if (!fs.existsSync(logs)) continue;
    for (const fid of fs.readdirSync(logs)) {
      const file = path.join(logs, fid, "status.jsonl");
      if (!fs.existsSync(file)) continue;
      for (const run of readRuns(file)) {
        if (run.status === "IN_PROGRESS") out.push({ file, workflow: run.workflow });
      }
    }
  }
  return out;
}

const top = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd }).toString().trim();

// warm
scan(top);

const N = 200;
let t = performance.now();
for (let i = 0; i < N; i++) scan(top);
const scanMs = (performance.now() - t) / N;

t = performance.now();
for (let i = 0; i < N; i++) execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd });
const gitMs = (performance.now() - t) / N;

const found = scan(top);
console.log(`cwd: ${cwd}`);
console.log(`toplevel: ${top}`);
console.log(`IN_PROGRESS runs found from this toplevel: ${JSON.stringify(found)}`);
console.log(`\nscan (walk + fold every corpus log): ${scanMs.toFixed(2)} ms/call over ${N} calls`);
console.log(`git rev-parse --show-toplevel spawn  : ${gitMs.toFixed(2)} ms/call over ${N} calls`);
console.log(`resolve-or-skip total (git + scan)   : ${(scanMs + gitMs).toFixed(2)} ms/call`);

// The same scan run from the MAIN checkout (where a command outside the run's worktree runs):
// it must find no active run, so the call is skipped rather than misattributed.
const mainTop = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
  cwd,
})
  .toString()
  .trim()
  .replace(/\/\.git$/, "");
console.log(`\nmain checkout: ${mainTop}`);
console.log(`IN_PROGRESS runs found from the main checkout: ${JSON.stringify(scan(mainTop))}`);

// How many of the workflows' `"{BKIT}"` call sites carry --file= (the rest need the scan)?
const ROOT = new URL("../../../../../../", import.meta.url).pathname;
let sites = 0;
let withFile = 0;
for (const phase of ["design", "plan", "build", "debug", "ship"]) {
  const text = fs
    .readFileSync(`${ROOT}.bkit/core/workflows/bkit-${phase}.md`, "utf8")
    .replace(/\\\n\s*/g, " ");
  for (const call of text.split('"{BKIT}" ').slice(1)) {
    const line = call.split("\n")[0]!;
    sites++;
    if (/--file=/.test(line)) withFile++;
  }
}
console.log(
  `\ncall sites: ${sites}; carrying --file=: ${withFile}; needing the scan: ${sites - withFile}`,
);
