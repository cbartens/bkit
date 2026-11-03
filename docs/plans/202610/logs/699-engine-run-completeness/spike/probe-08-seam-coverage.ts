// PROBE 8 — does the dispatch seam at `runCommand` cover every `"{BKIT}"` call the workflows make?
//
// The design's seam sits in `commands/lib.ts` `runCommand`, which serves registered
// `bkit <noun> <verb>` commands only. It claims every workflow call is such a command and no
// classic verb is ever called that way (so one hook covers all of them).
import fs from "node:fs";
import { CLASSIC_VERBS } from "../../../../../../.bkit/core/engine/cli.js";
import { COMMANDS } from "../../../../../../.bkit/core/engine/commands/registry.js";

const ROOT = new URL("../../../../../../", import.meta.url).pathname;
const PHASES = ["design", "plan", "build", "debug", "ship", "auto"];

const specs = new Map(COMMANDS.map((c) => [c.noun, c]));
const nouns = new Set<string>();
const pairs = new Set<string>();
const classicNounHits: string[] = [];
const bypass: string[] = [];
const unknown: string[] = [];
let sites = 0;

for (const phase of PHASES) {
  const text = fs.readFileSync(`${ROOT}.bkit/core/workflows/bkit-${phase}.md`, "utf8");
  // Join line continuations the way the shape test does, then split on the call marker.
  for (const call of text
    .replace(/\\\n\s*/g, " ")
    .split('"{BKIT}" ')
    .slice(1)) {
    const first = call.split("\n")[0]!.trim();
    const m = /^([a-z][a-z0-9-]*)(?:\s+([a-z][a-z0-9-]*))?/.exec(first);
    if (!m) continue;
    sites++;
    const [, noun, verb] = m;
    nouns.add(noun!);
    if (verb) pairs.add(`${noun} ${verb}`);
    if (CLASSIC_VERBS.has(noun!)) classicNounHits.push(`${phase}: ${first.slice(0, 60)}`);
    const spec = specs.get(noun!);
    // lib.ts runCommand L325-327: it returns null (classic handling, no seam) only when the
    // verb is not one of the noun's verbs AND the noun is also a classic verb.
    const isVerb = verb !== undefined && spec !== undefined && Object.hasOwn(spec.verbs, verb);
    if (!spec) unknown.push(`${phase}: no such noun '${noun}' (${first.slice(0, 50)})`);
    else if (verb && !spec.verbs[verb]) unknown.push(`${phase}: ${noun} ${verb} — no such verb`);
    if (!isVerb && !(spec && CLASSIC_VERBS.has(noun!))) {
      // not a registered verb and not a classic fallback → nothing would run it at all
      bypass.push(`${phase}: ${first.slice(0, 70)}`);
    } else if (!isVerb) {
      bypass.push(`CLASSIC FALLBACK (bypasses runCommand): ${phase}: ${first.slice(0, 60)}`);
    }
  }
}

console.log(`workflow files scanned: ${PHASES.length}`);
console.log(`"{BKIT}" call sites: ${sites}`);
console.log(`distinct nouns used: ${nouns.size} — ${[...nouns].sort().join(", ")}`);
console.log(`distinct noun+verb pairs: ${pairs.size}`);
console.log(`registered nouns in COMMANDS: ${COMMANDS.length}`);
console.log(`\ncall sites whose noun is also in CLASSIC_VERBS: ${classicNounHits.length}`);
console.log(`call sites that bypass runCommand (classic fallback or unrunnable): ${bypass.length}`);
for (const b of bypass) console.log(`  ${b}`);
console.log(`\nunknown noun/verb call sites: ${unknown.length}`);
for (const u of unknown) console.log(`  ${u}`);
console.log(`\nseam at runCommand covers every call site: ${bypass.length === 0}`);
