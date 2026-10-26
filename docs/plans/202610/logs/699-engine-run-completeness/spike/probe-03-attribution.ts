// PROBE 3 — is the real corpus's run-log structure compatible with positional attribution
// ("calls between two `step-done` rows belong to the step in progress")?
//
// Per run in every corpus status.jsonl: file order vs `at` order (merge=union interleaving),
// repeated step names (group loops / retries), step rows after `workflow-done`, and the size
// of the window a journal row would land in.
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("../../../../../../", import.meta.url).pathname;
const files = fs
  .readdirSync(path.join(ROOT, "docs/plans"))
  .flatMap((month) =>
    fs
      .readdirSync(path.join(ROOT, "docs/plans", month, "logs"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(ROOT, "docs/plans", month, "logs", d.name, "status.jsonl")),
  )
  .filter((f) => fs.existsSync(f));

type Row = Record<string, unknown>;
const ms = (t: unknown) => Date.parse(String(t));

let runs = 0;
let interleavedFiles = 0;
let runsWithRepeats = 0;
let runsWithPostDoneSteps = 0;
let totalPostDoneSteps = 0;

for (const file of files) {
  const rows: Row[] = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Row);

  let bad = 0;
  for (let i = 1; i < rows.length; i++) if (ms(rows[i]!.at) < ms(rows[i - 1]!.at)) bad++;
  if (bad) interleavedFiles++;

  let cur: Row[] = [];
  const flush = () => {
    if (!cur.length) return;
    runs++;
    const seen = new Set<string>();
    const repeats = new Set<string>();
    let doneAt = -1;
    let postDoneSteps = 0;
    cur.forEach((r, i) => {
      if (r.type === "workflow-done" || r.type === "workflow-failed") doneAt = i;
      const isStep = r.type === "step-done" || r.type === "step-start";
      if (isStep && typeof r.step === "string") {
        if (seen.has(r.step)) repeats.add(r.step);
        seen.add(r.step);
        if (doneAt !== -1 && i > doneAt) postDoneSteps++;
      }
    });
    if (repeats.size) runsWithRepeats++;
    if (postDoneSteps) {
      runsWithPostDoneSteps++;
      totalPostDoneSteps += postDoneSteps;
    }
    const start = cur[0]!;
    console.log(
      `  run ${String(runs).padStart(2)} ${String(start.workflow).padEnd(6)} rows=${String(cur.length).padStart(3)} steps=${seen.size} repeatSteps=${repeats.size}${repeats.size ? ` [${[...repeats].slice(0, 3).join(",")}]` : ""} postDoneStepRows=${postDoneSteps}`,
    );
    cur = [];
  };
  for (const r of rows) {
    if (r.type === "workflow-started" && cur.length) flush();
    cur.push(r);
  }
  flush();
}

console.log(`\ncorpus files: ${files.length}`);
console.log(`runs: ${runs}`);
console.log(
  `files with out-of-order 'at' in file order (merge=union interleave): ${interleavedFiles}/${files.length}`,
);
console.log(`runs with a repeated step name (group loop / retry): ${runsWithRepeats}/${runs}`);
console.log(
  `runs with step rows after workflow-done/failed: ${runsWithPostDoneSteps}/${runs} (${totalPostDoneSteps} rows)`,
);
