// Claim 4 probe: `bkit stats` figures and the `docs/roadmap.md` render are unchanged when
// the four ledgers become the migrated brain (claim 3's output) plus zero-byte stubs.
// Uses the engine's real runAnalysis / renderStatsMarkdown / buildRepoStats / foldRoadmap.
// Usage: tsx c4-stats-roadmap-parity.ts <repo-root> <migrated-brain> <scratch-dir>
import * as fs from "node:fs";
import * as path from "node:path";

const [root = "", brain = "", scratch = ""] = process.argv.slice(2);
const S = await import(path.join(root, ".bkit/core/engine/commands/stats.ts"));
const A = await import(path.join(root, ".bkit/core/engine/commands/analysis.ts"));
const R = await import(path.join(root, ".bkit/core/engine/commands/workflow/roadmap.ts"));

const HARVEST_KINDS = new Set(["chat", "run"]);
const render = (files: string[]): string =>
  S.renderStatsMarkdown(A.runAnalysis(files, HARVEST_KINDS), "bkit stats", "HEADER");

const before = render(
  [".bkit/stats.jsonl", ".bkit/friction.jsonl", "docs/deferrals.jsonl"].map((f) =>
    path.join(root, f),
  ),
);
// The brain in place of docs/deferrals.jsonl: the one source-path change plan 1 makes to STATS_SOURCES.
const afterBrain = render([
  path.join(root, ".bkit/stats.jsonl"),
  path.join(root, ".bkit/friction.jsonl"),
  brain,
]);
console.log(
  `stats report bytes before: ${before.length}, with brain as the deferral source: ${afterBrain.length}`,
);
console.log(`stats report identical (brain as source): ${before === afterBrain}`);
fs.mkdirSync(scratch, { recursive: true });
fs.writeFileSync(path.join(scratch, "stats-before.md"), before);
fs.writeFileSync(path.join(scratch, "stats-brain-source.md"), afterBrain);
// Same swap, with the brain's non-deferral kinds left out: what a kind-filtered brain reader feeds runAnalysis.
const filtered = path.join(scratch, "brain-deferrals-only.jsonl");
fs.writeFileSync(
  filtered,
  fs
    .readFileSync(brain, "utf-8")
    .split("\n")
    .filter((l) => l !== "" && JSON.parse(l).kind === "deferral")
    .join("\n") + "\n",
);
const afterFiltered = render([
  path.join(root, ".bkit/stats.jsonl"),
  path.join(root, ".bkit/friction.jsonl"),
  filtered,
]);
console.log(`stats report identical (brain, deferral kind only): ${before === afterFiltered}`);

// Unchanged engine on the post-upgrade layout (STATS_SOURCES still names docs/deferrals.jsonl).
for (const side of ["before", "after"] as const) {
  const dir = path.join(scratch, side);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, ".bkit"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
  for (const f of [
    ".bkit/stats.jsonl",
    ".bkit/friction.jsonl",
    ".bkit/issues.jsonl",
    "docs/roadmap.md",
  ])
    fs.copyFileSync(path.join(root, f), path.join(dir, f));
  for (const f of ["decisions", "deferrals", "failures", "knowledge"]) {
    const p = path.join(dir, "docs", `${f}.jsonl`);
    if (side === "before") fs.copyFileSync(path.join(root, "docs", `${f}.jsonl`), p);
    else fs.writeFileSync(p, "");
  }
  if (side === "after") fs.copyFileSync(brain, path.join(dir, "docs", "brain.jsonl"));
}
const unchangedEngineBefore = S.buildRepoStats(path.join(scratch, "before"));
const unchangedEngineAfter = S.buildRepoStats(path.join(scratch, "after"));
console.log(
  `unchanged engine, buildRepoStats identical before/after upgrade layout: ${unchangedEngineBefore === unchangedEngineAfter}`,
);
const dline = (s: string) =>
  s
    .split("\n")
    .filter((l) => /deferral/i.test(l))
    .slice(0, 6);
console.log("  before deferral lines:", JSON.stringify(dline(unchangedEngineBefore)));
console.log("  after deferral lines: ", JSON.stringify(dline(unchangedEngineAfter)));

// Roadmap render
const logs: string[] = [];
const rb = R.foldRoadmap(path.join(scratch, "before"), (m: string) => logs.push(`before: ${m}`));
const ra = R.foldRoadmap(path.join(scratch, "after"), (m: string) => logs.push(`after: ${m}`));
const mb = fs.readFileSync(path.join(scratch, "before", "docs", "roadmap.md"), "utf-8");
const ma = fs.readFileSync(path.join(scratch, "after", "docs", "roadmap.md"), "utf-8");
console.log(
  `roadmap fold before: ${JSON.stringify({ written: rb.written, counts: rb.counts, malformed: rb.malformed })}`,
);
console.log(
  `roadmap fold after:  ${JSON.stringify({ written: ra.written, counts: ra.counts, malformed: ra.malformed })}`,
);
console.log(`roadmap.md bytes before=${mb.length} after=${ma.length} identical=${mb === ma}`);
for (const l of logs) console.log(`  log ${l}`);
