// PROBE 1 — can step conditionality be derived from the workflow markdown alone?
//
// Review CRITICAL 1 proposes the rule: a step is conditional iff
//   (a) its section's first body line is `**Run only if** ...`, or
//   (b) its heading carries a `(Path X only)` marker.
// and asserts `**Skip if**` is never a step-level signal.
//
// Falsification targets:
//   1. a step whose section carries a column-0 `**Run only if**` / `**Skip if**`
//      line that the rule does not classify as conditional (false step hole);
//   2. a step the rule classifies conditional whose section has no such line
//      (over-classification).
import fs from "node:fs";

const ROOT = new URL("../../../../../../", import.meta.url).pathname;
const PHASES = ["design", "plan", "build", "debug", "ship"];
const md = (n: string) => fs.readFileSync(`${ROOT}.bkit/core/workflows/bkit-${n}.md`, "utf8");

interface Section {
  number: number;
  title: string;
  lines: string[];
}

/** The `stepSections` idiom copied verbatim from workflow-shape.test.ts L632-647. */
function stepSections(text: string): Section[] {
  const lines = text.split("\n");
  const heading = /^#{2,3} \S+ Step (\d+) — (.+)$/;
  const out: Section[] = [];
  lines.forEach((l, i) => {
    const m = heading.exec(l);
    if (!m) return;
    const end = lines.findIndex((x, j) => j > i && /^#{2,3} /.test(x) && !x.startsWith("### 🔒"));
    out.push({
      number: Number(m[1]),
      title: m[2]!,
      lines: lines.slice(i, end === -1 ? undefined : end),
    });
  });
  return out;
}

const RULE_A = /^\*\*Run only if\*\*/;
const RULE_B = /\((Path [A-Z](?: and [A-Z])? only)\)/;
const SKIP_LINE = /^\*\*Skip if\*\*/;
const ANY_STEP_LEVEL_MARKER = /^\*\*(Run only if|Skip if)\*\*/;

let misses = 0;
let over = 0;

for (const phase of PHASES) {
  const text = md(phase);
  const sections = stepSections(text);
  console.log(`\n=== ${phase} (${sections.length} step sections) ===`);
  for (const s of sections) {
    const firstBody = s.lines.slice(1).find((l) => l.trim() !== "") ?? "";
    const heading = s.lines[0]!;
    const ruleA = RULE_A.test(firstBody);
    const ruleB = RULE_B.test(heading);
    const classified = ruleA || ruleB;
    const col0Markers = s.lines.slice(1).filter((l) => ANY_STEP_LEVEL_MARKER.test(l));
    const col0Skip = s.lines.slice(1).filter((l) => SKIP_LINE.test(l));
    const signal = col0Markers.length > 0;
    const flags = [
      ruleA ? "ruleA" : "",
      ruleB ? "ruleB" : "",
      col0Skip.length ? `col0-skip x${col0Skip.length}` : "",
      !classified && signal ? "*** MISS ***" : "",
      classified && !signal && !ruleB ? "*** OVER ***" : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (!classified && signal) misses++;
    if (classified && !signal && !ruleB) over++;
    console.log(
      `  Step ${String(s.number).padStart(2)} ${s.title.slice(0, 34).padEnd(34)} ${flags.padEnd(30)} | ${firstBody.slice(0, 84)}`,
    );
    if (!classified && signal) {
      for (const l of col0Markers) console.log(`        missed marker: ${l.slice(0, 110)}`);
    }
  }
}

console.log(`\nTOTAL rule-misses (step-level marker not classified conditional): ${misses}`);
console.log(`TOTAL over-classifications: ${over}`);

// Every column-0 conditional marker, and the section that owns it. Proves the rule's
// coverage domain: a marker must never sit outside a step section, and no step section
// may hold one the rule misses.
console.log(`\n=== every column-0 conditional marker and its owner ===`);
let owned = 0;
for (const phase of PHASES) {
  const text = md(phase);
  const lines = text.split("\n");
  const sectionAt = new Map<number, string>();
  let owner = "(before first section)";
  lines.forEach((l, i) => {
    const m = /^#{2,3} (?:.* )?Step (\d+) — (.+)$/.exec(l);
    if (m) owner = `Step ${m[1]} ${m[2]}`;
    else if (/^#{2} /.test(l)) owner = `NON-STEP SECTION: ${l.replace(/^## /, "")}`;
    sectionAt.set(i, owner);
  });
  lines.forEach((l, i) => {
    if (!ANY_STEP_LEVEL_MARKER.test(l)) return;
    owned++;
    console.log(
      `  ${phase.padEnd(6)} L${String(i + 1).padStart(4)} ${sectionAt.get(i)} :: ${l.slice(0, 70)}`,
    );
  });
}
console.log(`TOTAL column-0 conditional markers: ${owned}`);
