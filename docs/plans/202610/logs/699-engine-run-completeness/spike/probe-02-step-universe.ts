// PROBE 2 — does the md-derived step universe agree with WORKFLOW_STEPS, and how many
// `"{BKIT}"` call sites does each workflow name?
//
// The design rests on: "The step universe is cross-checked against WORKFLOW_STEPS[workflow]
// (numbers, titles, --step= keys); drift is reported, not fatal", and on the volume claim
// (~100 extra journal rows per run).
import fs from "node:fs";
import { WORKFLOW_STEPS } from "../../../../../../.bkit/core/engine/commands/workflow/step-table.js";

const ROOT = new URL("../../../../../../", import.meta.url).pathname;
const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
const md = (n: string) => fs.readFileSync(`${ROOT}.bkit/core/workflows/bkit-${n}.md`, "utf8");

function stepSections(text: string): Array<{ number: number; title: string; body: string }> {
  const lines = text.split("\n");
  const heading = /^#{2,3} \S+ Step (\d+) — (.+)$/;
  const out: Array<{ number: number; title: string; body: string }> = [];
  lines.forEach((l, i) => {
    const m = heading.exec(l);
    if (!m) return;
    const end = lines.findIndex((x, j) => j > i && /^#{2,3} /.test(x) && !x.startsWith("### 🔒"));
    out.push({
      number: Number(m[1]),
      title: m[2]!,
      body: lines.slice(i, end === -1 ? undefined : end).join("\n"),
    });
  });
  return out;
}

const nouns = new Set<string>();
const pairs = new Set<string>();
let sites = 0;
let allMatch = true;

for (const phase of PHASES) {
  const text = md(phase);
  const sections = stepSections(text);
  const table = WORKFLOW_STEPS[phase];
  const dedup = [...new Map(table.map((s) => [s.number, s.title])).entries()];
  const derived = sections.map((s) => [s.number, s.title]);
  const same = JSON.stringify(dedup) === JSON.stringify(derived);
  if (!same) allMatch = false;

  // `--step=` keys per derived section vs the table's entries for that number.
  const stepKeys = (t: string) =>
    new Set([...t.matchAll(/--step=([a-z0-9-]+)/g)].map((m) => m[1]!));
  const keyProblems: string[] = [];
  for (const s of sections) {
    const inMd = stepKeys(s.body);
    const inTable = new Set(
      table.filter((t) => t.number === s.number && t.step).map((t) => t.step!),
    );
    for (const k of inMd)
      if (!inTable.has(k)) keyProblems.push(`Step ${s.number}: md --step=${k} not in table`);
    for (const k of inTable)
      if (!inMd.has(k)) keyProblems.push(`Step ${s.number}: table ${k} not in md section`);
  }

  const calls = [...text.matchAll(/"{BKIT}" ([a-z]+) ([a-z-]+)/g)];
  for (const c of calls) {
    sites++;
    nouns.add(c[1]!);
    pairs.add(`${c[1]} ${c[2]}`);
  }

  console.log(
    `${phase.padEnd(6)} sections=${String(sections.length).padStart(2)} tableEntries=${String(table.length).padStart(2)} dedup=${dedup.length} numbers+titlesEqual=${same} stepKeyProblems=${keyProblems.length} callSites=${calls.length}`,
  );
  for (const p of keyProblems) console.log(`        ${p}`);
}

console.log(
  `\nTOTAL "{BKIT}" call sites: ${sites}; distinct nouns: ${nouns.size}; distinct noun+verb pairs: ${pairs.size}`,
);
console.log(`all workflows: derived numbers+titles == deduped WORKFLOW_STEPS: ${allMatch}`);
