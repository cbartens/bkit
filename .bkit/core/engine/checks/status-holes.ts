// checks/status-holes.ts — Tier-3 advisory status-hole detector.
//
// A fail-open advisory that compares the steps RECORDED in each run of a
// status.jsonl against the steps the workflow PROSE says should be there. It
// derives the expected set from .bkit/core/workflows/bkit-{workflow}.md at
// runtime (headings + --step= literals) — NEVER a hand-maintained table
// (decision 384-tier3-promotion). Each run's workflow is inferred from its rows.
//
// ADVISORY / FAIL-OPEN: the CLI exits 0 unconditionally — even when holes are
// found (decision 384-tier3-promotion).
//
// Path-conditional expectations:
//   - Path A (dev is ancestor): skips ship-conflict-resolve.
//   - Path B (dev moved): includes ship-conflict-resolve.
//   - MERGED-on-entry (Step 2 detects state=MERGED → Step 13): skips the entire
//     middle (base check, integrate, deferred-sweep, the pre-merge docs /
//     summary / prune / bookkeeping-push steps, merge-pr).
//   - Aborted (workflow-failed row present): no post-abort holes expected.
//   - ship-failure-diagnose / ship-failure-remediate are NEVER mandatory — they
//     appear only in the merge-retry loop.
//
// Usage (advisory CI step or manual):
//   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
//   # exits 0 always; prints advisory report to stdout

import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { DECISION_ROUTES, WORKFLOW_STEPS } from "../commands/workflow/step-table.js";
import type { IssueTracker } from "../install/manifest.js";
import { substituteWorkflow } from "../render/trackers.js";
import { parseJson } from "../shared/json.js";
import { getWorkflowsRoot } from "../shared/package-roots.js";

// ---------------------------------------------------------------------------
// Canonical ship step order (mirrors audits/workflows/ship-invariants.test.ts
// CANONICAL_SHIP_STEP_KEYS — the frozen schema). The detector cross-checks its
// source-derived set against this. Renaming a key resets attempt counters across
// three repos and orphans the detector corpus.
// ---------------------------------------------------------------------------

export const SHIP_STEP_ORDER = [
  "ship-start-workflow",
  "ship-worktree-setup",
  "ship-regression-guard",
  "ship-conflict-resolve",
  "ship-deferred-sweep",
  "ship-update-docs",
  "ship-summary",
  "ship-prune-skills",
  "ship-bookkeeping-push",
  "ship-merge-pr",
  "ship-failure-diagnose",
  "ship-failure-remediate",
  "ship-switch-to-dev",
  "ship-close-workflow",
] as const;

/** Steps that appear only in the merge-retry loop — never mandatory, never holes. */
const RETRY_LOOP_STEPS = new Set<string>(["ship-failure-diagnose", "ship-failure-remediate"]);

/** The step that Path A skips (dev is ancestor → no integration needed). */
const PATH_B_ONLY_STEPS = new Set<string>(["ship-conflict-resolve"]);

/**
 * The steps a MERGED-on-entry resume skips entirely.
 *
 * bkit-ship.md Step 2 routes to Step 13 at sub-step 5 (`state` = MERGED), which
 * is BEFORE sub-step 8 writes `ship-worktree-setup` + `ship-regression-guard` —
 * so those two are absent too, not just the middle. The pre-merge docs,
 * summary, prune and bookkeeping-push steps (6-8) ride the PR, so a PR that is
 * already merged skips them too.
 */
const MERGED_ON_ENTRY_SKIP = new Set<string>([
  "ship-worktree-setup",
  "ship-regression-guard",
  "ship-conflict-resolve",
  "ship-deferred-sweep",
  "ship-update-docs",
  "ship-summary",
  "ship-prune-skills",
  "ship-bookkeeping-push",
  "ship-merge-pr",
  // failure-diagnose/remediate are already in RETRY_LOOP_STEPS (never expected)
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RunPath =
  "PATH_A" | "PATH_B" | "MERGED_ON_ENTRY" | "COMPLETED" | "ABORTED" | "IN_PROGRESS";

export interface StatusRow {
  type: string;
  workflow?: string;
  step?: string;
  status?: string;
  parentSha?: string;
  [key: string]: unknown;
}

export interface HoleReport {
  /** The workflow the run belongs to. */
  workflow?: string;
  /** Steps the prose says should be present but were not recorded. */
  missing: string[];
  /** Steps recorded but NOT in the source-derived universe (invented names). */
  unexpected: string[];
  /** Which path the run was classified as. */
  path: RunPath;
  /** All ship steps observed in this run's status rows. */
  observed: string[];
  /** All steps the source says exist (from headings + literals). */
  sourceUniverse: string[];
  /** True if the source-derived set disagrees with the frozen canonical set. */
  sourceCanonicalDrift: string[];
  /** Steps the source records but never numbers under a `## … Step N` heading. */
  orphanSteps: string[];
}

// ---------------------------------------------------------------------------
// Contract derivation — parse the workflow markdown into steps + required calls.
// ---------------------------------------------------------------------------

/** One `"{BKIT}" noun verb --flag` call the markdown names, reduced to words (flag values dropped). */
export interface RequiredCall extends WorkflowCall {
  /** `post` when written below the section's last `steps finish` / `steps done --step=` line off every route arm. */
  position: "pre" | "post";
  /** R1: under a `- **If**` / `- **Else**` bullet or `N. **If**` sub-step, in a sub-step a route line names as its target, or in a `**Name:**` block an `**If**` line picks. */
  branch: boolean;
}

export interface WorkflowCall {
  noun: string;
  verb: string;
  flags: string[];
}

export interface ContractStep {
  number: number;
  title: string;
  /** The `--step=` / `step:"` row keys the section writes. */
  keys: string[];
  /** The subset of `keys` the section writes: `steps finish|done --step=` and `step:"` literals. */
  writes: string[];
  /** Every `"{BKIT}"` call in the section, in order. */
  calls: RequiredCall[];
  /** True under a column-0 `**Run only if**` / `**Skip if**` line, or a `(Path X only)` heading. */
  conditional: boolean;
}

export interface Contract {
  workflow: string;
  steps: ContractStep[];
  /** Deduped row keys across the step sections, sorted. */
  universe: string[];
  /** Calls in sections no step owns (opening lines, Failure Path, Decision Pause ...). */
  workflowCalls: WorkflowCall[];
  /** `ANYWHERE_CALLS` the `**Contract:**` block names; matched like `workflowCalls`, never required. */
  anywhereCalls: WorkflowCall[];
  /** sha256 of the workflow markdown the contract was derived from. */
  sourceSha: string;
  /** Decision Pause row keys (`DECISION_ROUTES`) the markdown writes outside every numbered step. */
  pauseRows: string[];
  /** Row keys an engine verb a step calls writes on that step's behalf (`VERB_ROWS`). */
  subRows: string[];
  /** Row keys written outside every numbered step section, other than `pauseRows`. */
  orphanSteps: string[];
  /** Disagreements with the deduped `WORKFLOW_STEPS[workflow]` keys; reported, never fatal. */
  drift: string[];
}

/**
 * Step rows an engine verb writes itself, keyed by noun + verb: `tests red` writes the
 * `RED_STEP` row of `commands/workflow/tests.ts` inside build Step 7.
 */
const VERB_ROWS: Readonly<Record<string, readonly string[]>> = {
  "tests red": ["build-tests-red"],
};
// A step that reads a verb row (`counters derive --step=build-tests-red`) does not own it.
const VERB_ROW_KEYS: ReadonlySet<string> = new Set(Object.values(VERB_ROWS).flat());

/**
 * Calls the orchestrator may run at any point of a run, active when the workflow's
 * `**Contract:**` block names them as `` `bkit {noun} {verb}` `` (the **Friction** bullet's
 * `bkit ledgers append`). The Contract also names step-bound calls, so it is not read wholesale.
 */
const ANYWHERE_CALLS: readonly string[] = ["ledgers append"];

// A key followed by `{` is a templated log label (`build-group-gate-{GROUP}`), not a row key.
const STEP_KEY_RE = /(?:step:"|--step=)([a-z][a-z0-9-]*)(\{)?/g;

/** The words of one `"{BKIT}" ...` call: shell-split, quotes kept, stopped at the first unquoted operator. */
export function callWords(rest: string): string[] {
  const words: string[] = [];
  let word = "";
  let quote = "";
  for (const ch of rest) {
    if (quote) {
      word += ch;
      if (ch === quote) quote = "";
    } else if (ch === '"' || ch === "'") {
      word += ch;
      quote = ch;
    } else if ("|;&><)`".includes(ch)) break;
    else if (/\s/.test(ch)) {
      if (word) words.push(word);
      word = "";
    } else word += ch;
  }
  if (word) words.push(word);
  return words;
}

/** Each `Step N — Title` heading, with the text up to the next step or section heading. */
export function stepSections(text: string): Array<{ number: number; title: string; body: string }> {
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

/** Each `"{BKIT}"` call in `text` as noun / verb / flag names. */
function requiredCalls(text: string): WorkflowCall[] {
  const joined = text.replace(/\\\n\s*/g, " ");
  return joined
    .split('"{BKIT}"')
    .slice(1)
    .map((call) => {
      const [noun = "", verb = "", ...rest] = callWords(call.replace(/^ /, ""));
      const flags = rest.flatMap((w) => {
        const f = /^--([a-z][a-z0-9-]*)/.exec(w)?.[1];
        return f ? [f] : [];
      });
      return { noun, verb: verb.startsWith("--") ? "" : verb, flags };
    });
}

/** R1: per line of a step section, true when it sits on an `If` / `Else` arm. */
function branchLines(lines: string[]): boolean[] {
  const branch = lines.map(() => false);
  const targets = new Set<number>();
  const blocks = new Set<string>();
  let ifIndent: number | null = null;
  lines.forEach((l, i) => {
    if (l.trim() === "") {
      branch[i] = ifIndent !== null;
      return;
    }
    const indent = l.length - l.trimStart().length;
    if (ifIndent !== null && indent <= ifIndent) ifIndent = null;
    if (/^\s*(?:- |\d+\. )\*\*(If|Else)\*\*/.test(l)) ifIndent = indent;
    branch[i] = ifIndent !== null;
    if (/\*\*(If|Else)\*\*/.test(l)) {
      for (const m of l.matchAll(/sub-step (\d+)/g)) targets.add(Number(m[1]));
      for (const m of l.matchAll(/→ \*\*([^*]+)\*\*/g)) blocks.add(m[1]!);
    }
  });
  let sub: number | null = null;
  let block = false;
  lines.forEach((l, i) => {
    const m = /^(\d+)\. /.exec(l);
    if (m) sub = Number(m[1]);
    else if (l.startsWith("#")) sub = null;
    if (sub !== null && targets.has(sub)) branch[i] = true;
    // A `**Name:**` block an `**If**` line routes to runs to the next such block or heading.
    const label = /^\*\*([^*]+):\*\*/.exec(l)?.[1];
    if (label !== undefined && blocks.has(label)) block = true;
    else if (/^#{2,} /.test(l)) block = false;
    if (block) branch[i] = true;
  });
  return branch;
}

/**
 * Per `"{BKIT}"` call in `text`, true when it sits after an inline `**If** … →` / `**Else** →`
 * in the same sentence (`→ add `Group gate`: `"{BKIT}" tests run …``). A call in the fence
 * below such a line stays required: there the condition may only change the call.
 */
function inlineArms(text: string): boolean[] {
  const parts = text.split('"{BKIT}"');
  return parts.slice(1).map((_, i) => {
    const before = parts.slice(0, i + 1).join('"{BKIT}"');
    const lead = [...before.matchAll(/\*\*(?:If|Else)\*\*/g)].at(-1);
    if (lead?.index === undefined) return false;
    const clause = before.slice(lead.index).replace(/`[^`]*`/g, "");
    return clause.includes("→") && !/\.\s/.test(clause);
  });
}

/** The `"{BKIT}"` calls of one step section, each tagged with its position (R3) and branch flag (R1). */
function sectionCalls(body: string): Array<RequiredCall & { line: number }> {
  const lines = body.split("\n");
  const branch = branchLines(lines);
  const logical: Array<{ text: string; branch: boolean }> = [];
  for (let i = 0; i < lines.length; i++) {
    let text = lines[i]!;
    const start = i;
    while (text.endsWith("\\") && i + 1 < lines.length) {
      i += 1;
      text = `${text.slice(0, -1)} ${lines[i]!.trimStart()}`;
    }
    logical.push({ text, branch: branch[start]! });
  }
  const perLine = logical.map((l) => requiredCalls(l.text));
  const isFinish = (c: WorkflowCall) =>
    c.noun === "steps" && (c.verb === "finish" || (c.verb === "done" && c.flags.includes("step")));
  // An optional finish below the step's own (a route arm's row) does not move the line.
  const finishes = perLine.flatMap((calls, i) => (calls.some(isFinish) ? [i] : []));
  const plain = finishes.filter((i) => !logical[i]!.branch);
  const lastFinish = (plain.length > 0 ? plain : finishes).at(-1) ?? -1;
  return perLine.flatMap((calls, i) => {
    const inline = inlineArms(logical[i]!.text);
    return calls.map((c, j) => ({
      ...c,
      position: i > lastFinish && lastFinish !== -1 ? ("post" as const) : ("pre" as const),
      branch: logical[i]!.branch || inline[j]!,
      line: i,
    }));
  });
}

/** Row keys a section writes (not merely names in a `steps gate --step=` read). */
function stepWrites(text: string): string[] {
  const joined = text.replace(/\\\n\s*/g, " ");
  const found = joined.split("\n").flatMap((line) => {
    const viaCall = /"\{BKIT\}" steps (?:finish|done)\b/.test(line) ? stepKeys(line) : [];
    return [...viaCall, ...[...line.matchAll(/step:"([a-z][a-z0-9-]*)"/g)].map((m) => m[1]!)];
  });
  return [...new Set(found)];
}

const stepKeys = (text: string): string[] => [
  ...new Set([...text.matchAll(STEP_KEY_RE)].filter((m) => !m[2]).map((m) => m[1]!)),
];

/** A step is conditional under a column-0 marker line anywhere in its section, or a `(Path X only)` heading. */
export function isConditionalSection(body: string): boolean {
  const lines = body.split("\n");
  return (
    /\(Path [A-Z] only\)/.test(lines[0] ?? "") ||
    lines.some((l) => /^\*\*(Run only if|Skip if)\*\*/.test(l))
  );
}

/**
 * Derive the contract of one workflow from its markdown: the step sections, the
 * row keys and `"{BKIT}"` calls each holds, and the calls no step owns. The
 * universe is cross-checked against the deduped `WORKFLOW_STEPS[workflow]`; a
 * disagreement is reported as drift, never thrown. With a `tracker`, the markdown is
 * first rendered for it, so a consumer is held to the calls its installed workflow names.
 */
export function deriveContract(
  sourceMd: string,
  workflow: string,
  tracker?: IssueTracker,
): Contract {
  const workflowMd =
    tracker === undefined ? sourceMd : substituteWorkflow(sourceMd, tracker).output;
  const sections = stepSections(workflowMd);
  // The journal window runs from the first `workflows start` call to the `workflows close`
  // call: a call written above or below it is matched when journaled, never required.
  const lineOf = (offset: number) => workflowMd.slice(0, offset).split("\n").length - 1;
  const absLine = (s: { body: string }, line: number) => lineOf(workflowMd.indexOf(s.body)) + line;
  const marks = (noun: string, verb: string) =>
    sections.flatMap((s) =>
      sectionCalls(s.body)
        .filter((c) => c.noun === noun && c.verb === verb)
        .map((c) => absLine(s, c.line)),
    );
  const starts = marks("workflows", "start");
  const closes = marks("workflows", "close");
  const windowStart = starts.length > 0 ? Math.min(...starts) : -1;
  const windowEnd = closes.length > 0 ? Math.max(...closes) : Number.POSITIVE_INFINITY;
  const outsideWindow: WorkflowCall[] = [];
  const steps: ContractStep[] = sections.map((s) => {
    const inside: RequiredCall[] = [];
    for (const { line, ...c } of sectionCalls(s.body)) {
      const at = absLine(s, line);
      // `workflows start` itself is outside: a fresh run has no active run to journal it under.
      const isStart = c.noun === "workflows" && c.verb === "start";
      if (isStart || at < windowStart || at > windowEnd) outsideWindow.push(c);
      else inside.push(c);
    }
    return {
      number: s.number,
      title: s.title,
      keys: stepKeys(s.body).filter((k) => !VERB_ROW_KEYS.has(k)),
      writes: stepWrites(s.body),
      calls: inside,
      conditional: isConditionalSection(s.body),
    };
  });
  const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();

  // Text outside every step section: the md minus each section body.
  let outside = workflowMd;
  for (const s of sections) outside = outside.replace(s.body, "");
  const table = (WORKFLOW_STEPS as Record<string, readonly { step?: string }[] | undefined>)[
    workflow
  ];
  const tableKeys = new Set((table ?? []).flatMap((s) => (s.step ? [s.step] : [])));
  const drift: string[] = [];
  if (table) {
    for (const k of tableKeys) if (!universe.includes(k)) drift.push(`table-but-not-source:${k}`);
    for (const k of universe) if (!tableKeys.has(k)) drift.push(`source-but-not-table:${k}`);
  }
  const outsideKeys = stepKeys(outside).filter(
    (k) => k.startsWith(`${workflow}-`) && !universe.includes(k),
  );
  const pause = (DECISION_ROUTES as Record<string, { step: string } | undefined>)[workflow]?.step;
  const pauseRows = pause !== undefined && outsideKeys.includes(pause) ? [pause] : [];
  const named = new Set(sections.flatMap((s) => sectionCalls(s.body)).map(callKey));
  const contractBlock =
    /^\*\*Contract:\*\*[\s\S]*?(?=^#{1,3} |(?![\s\S]))/m.exec(workflowMd)?.[0] ?? "";
  const anywhereCalls = ANYWHERE_CALLS.filter((call) =>
    contractBlock.includes(`\`bkit ${call}\``),
  ).map((call) => {
    const [noun = "", verb = ""] = call.split(" ");
    return { noun, verb, flags: [] };
  });
  const subRows = Object.entries(VERB_ROWS)
    .filter(([call]) => named.has(call))
    .flatMap(([, keys]) => keys.filter((k) => k.startsWith(`${workflow}-`)));
  return {
    workflow,
    steps,
    universe,
    workflowCalls: [...requiredCalls(outside), ...outsideWindow],
    anywhereCalls,
    sourceSha: createHash("sha256").update(workflowMd).digest("hex"),
    pauseRows,
    subRows,
    orphanSteps: outsideKeys.filter((k) => !pauseRows.includes(k)).sort(),
    drift,
  };
}

// ---------------------------------------------------------------------------
// Completeness check — rows + contract → verdict
// ---------------------------------------------------------------------------

export interface CallRef {
  noun: string;
  verb: string;
}

export interface EvidenceHole {
  step: string;
  number: number;
  /** 1-based occurrence among the run's rows for this step (group-loop and retry repeats). */
  index: number;
  group?: number;
  missing: WorkflowCall[];
}

export interface CompletenessVerdict {
  workflow: string;
  verdict: "CLEAN" | "HOLEY";
  /** True on an evidence hole or a step hole; unexercised arms never count. */
  holey: boolean;
  preJournal: boolean;
  journalSuspect: boolean;
  observed: { steps: number; calls: number };
  evidenceHoles: EvidenceHole[];
  stepHoles: string[];
  unexercised: Array<{ step: string; call: CallRef }>;
  unexpected: Array<CallRef | { step: string }>;
  unattributable: CallRef[];
  sourceSha: string;
  workflowCalls: CallRef[];
}

export interface CheckOptions {
  /** True when the closing engine itself journals (close path only). */
  journalSuspect?: boolean;
}

/** The `completeness` verb journals itself; it is neither expected nor ever unexpected. */
const SELF_NOUN = "completeness";

const callKey = (c: CallRef): string => `${c.noun} ${c.verb}`;

/**
 * One row-owning unit of a contract. A key belongs to the first section that writes it
 * (else the last that names it); a later writer lists it as `shared`. A section owning
 * no key folds its calls into the section owning its first key, so a step whose row
 * another section writes is still checked as one unit (design Step 1 folds into Step 2).
 */
export interface Unit {
  number: number;
  /** Row keys this unit owns, in section order. */
  keys: string[];
  /** Row keys this unit also writes that another unit owns (build Step 9 rewrites `build-plan-tests`). */
  shared: string[];
  calls: RequiredCall[];
  conditional: boolean;
}

export function contractUnits(contract: Contract): Unit[] {
  const owner = new Map<string, ContractStep>();
  for (const k of contract.universe) {
    const writers = contract.steps.filter((s) => s.writes.includes(k));
    const namers = contract.steps.filter((s) => s.keys.includes(k));
    const first = writers.length > 0 ? writers[0] : namers.at(-1);
    if (first) owner.set(k, first);
  }
  const owners = contract.steps.filter((s) => [...owner.values()].includes(s));
  return owners.map((s) => {
    const keys = s.keys.filter((k) => owner.get(k) === s);
    const folded = contract.steps.filter(
      (f) => !owners.includes(f) && f.keys[0] !== undefined && owner.get(f.keys[0]) === s,
    );
    const calls = [
      ...folded.filter((f) => f.number < s.number).flatMap((f) => f.calls),
      ...s.calls,
      ...folded
        .filter((f) => f.number > s.number)
        .flatMap((f) => f.calls.map((c) => ({ ...c, position: "post" as const }))),
    ];
    const shared = s.writes.filter((k) => owner.has(k) && owner.get(k) !== s);
    return { number: s.number, keys, shared, calls, conditional: s.conditional };
  });
}

interface Visit {
  unit: Unit;
  /** Item indices of this visit's rows. */
  rows: number[];
}

type Item =
  | { kind: "call"; call: CallRef }
  | { kind: "step"; key: string; row: StatusRow; unit: Unit | undefined };

/**
 * Classify one run's rows against its contract. Consecutive rows of one unit form a
 * visit (a repeat of a key starts a new one, so each group-loop repeat owns its own
 * gaps). A visit owns the calls before its first row and between its rows, and the
 * calls after its last row that are one of its `post` calls (R3); the rest belong to
 * the next visit. Matching is on noun + verb (R2). `holey` keys on `evidenceHoles` +
 * `stepHoles` only. Never throws and never filters by age.
 */
export function check(
  rows: StatusRow[],
  contract: Contract,
  options: CheckOptions = {},
): CompletenessVerdict {
  const workflow = contract.workflow;
  const own = rows.filter((r) => r.workflow === workflow);
  const units = contractUnits(contract).map((u) => ({
    ...u,
    calls: u.calls.filter((c) => c.noun !== SELF_NOUN),
  }));
  const unitOf = new Map<string, Unit>();
  for (const u of units) for (const k of u.keys) unitOf.set(k, u);
  const writersOf = new Map<string, Unit[]>();
  for (const u of units)
    for (const k of [...u.keys, ...u.shared]) writersOf.set(k, [...(writersOf.get(k) ?? []), u]);
  const workflowCalls = contract.workflowCalls.filter((c) => c.noun !== SELF_NOUN);
  const workflowKeys = new Set([...workflowCalls, ...contract.anywhereCalls].map(callKey));
  const subRows = new Set(contract.subRows);
  const pauseRows = new Set(contract.pauseRows);

  // A sub-row sits inside the visit of the step whose call wrote it, so it is no visit boundary.
  // A pause row is a boundary owned by no step, like a row outside the contract.
  const items: Item[] = own.flatMap((r): Item[] => {
    if (r.type === "engine-call" && r["noun"] !== SELF_NOUN) {
      return [{ kind: "call", call: { noun: String(r["noun"]), verb: String(r["verb"]) } }];
    }
    if (r.type === "step-done" && typeof r.step === "string" && !subRows.has(r.step)) {
      return [{ kind: "step", key: r.step, row: r, unit: unitOf.get(r.step) }];
    }
    return [];
  });
  const stepRowCount = own.filter(
    (r) => r.type === "step-done" && typeof r.step === "string",
  ).length;
  const callCount = items.filter((i) => i.kind === "call").length;
  const preJournal = callCount === 0;
  // A journal that starts mid-run (an engine upgrade, the kill switch lifted) leaves the
  // visits that finished before its first `engine-call` row with no evidence to judge.
  const firstCall = items.findIndex((i) => i.kind === "call");

  // Visits over the step rows, in order; a row outside the contract closes the current visit.
  const visits: Visit[] = [];
  const visitOfRow = new Map<number, Visit>();
  let current: Visit | undefined;
  const keysInCurrent = new Set<string>();
  // A row two units write joins the open visit of one of them, else the unit that also
  // writes the next row, else its owner.
  const unitOfRow = (key: string, owner: Unit, i: number): Unit => {
    const writers = writersOf.get(key) ?? [owner];
    if (writers.length === 1) return owner;
    if (current && writers.includes(current.unit) && !keysInCurrent.has(key)) return current.unit;
    const next = items.slice(i + 1).find((x) => x.kind === "step" && x.unit !== undefined);
    const nextWriters = next?.kind === "step" ? (writersOf.get(next.key) ?? []) : [];
    return writers.find((w) => nextWriters.includes(w)) ?? owner;
  };
  items.forEach((item, i) => {
    if (item.kind !== "step") return;
    if (!item.unit) {
      current = undefined;
      return;
    }
    const unit = unitOfRow(item.key, item.unit, i);
    const sameUnit = current?.unit === unit && !keysInCurrent.has(item.key);
    if (!sameUnit) {
      current = { unit, rows: [] };
      keysInCurrent.clear();
      visits.push(current);
    }
    current!.rows.push(i);
    keysInCurrent.add(item.key);
    visitOfRow.set(i, current!);
  });

  interface Slots {
    plain: Map<string, number>;
    arm: Map<string, number>;
  }
  const postSlots = new Map<Visit, Slots>();
  const freshSlots = (v: Visit): Slots => {
    const slots: Slots = { plain: new Map(), arm: new Map() };
    for (const c of v.unit.calls) {
      if (c.position !== "post") continue;
      const m = c.branch ? slots.arm : slots.plain;
      m.set(callKey(c), (m.get(callKey(c)) ?? 0) + 1);
    }
    postSlots.set(v, slots);
    return slots;
  };
  const take = (m: Map<string, number>, key: string): boolean => {
    const n = m.get(key) ?? 0;
    if (n > 0) m.set(key, n - 1);
    return n > 0;
  };
  const stepIdx = items.flatMap((it, i) => (it.kind === "step" ? [i] : []));
  const owned = new Map<Visit, Set<string>>();
  const unexpectedCalls = new Map<string, CallRef>();
  const unattributable = new Map<string, CallRef>();
  items.forEach((item, i) => {
    if (item.kind !== "call") return;
    const key = callKey(item.call);
    const prevIdx = stepIdx.filter((x) => x < i).at(-1) ?? -1;
    const nextIdx = stepIdx.find((x) => x > i) ?? -1;
    const prevVisit = visitOfRow.get(prevIdx);
    const nextVisit = visitOfRow.get(nextIdx);
    // Each post call of a visit absorbs one journaled call: a noun + verb written both
    // below one step's finish line and above the next step's is charged once to each.
    // A route-arm post call absorbs more only while the next visit names no such call.
    const slots =
      prevVisit === undefined ? undefined : (postSlots.get(prevVisit) ?? freshSlots(prevVisit));
    const nextNames = (armsToo: boolean): boolean =>
      nextVisit?.unit.calls.some((c) => callKey(c) === key && (armsToo || !c.branch)) === true;
    const claimsPost =
      prevVisit !== undefined &&
      prevVisit.rows.at(-1) === prevIdx &&
      slots !== undefined &&
      (take(slots.plain, key) ||
        (prevVisit.unit.calls.some(
          (c) => c.position === "post" && c.branch && callKey(c) === key,
        ) &&
          !nextNames(false) &&
          (take(slots.arm, key) || !nextNames(true))));
    const insideVisit = prevVisit !== undefined && prevVisit === nextVisit ? prevVisit : undefined;
    // A post call journaled between its visit's own rows (above an arm's row) uses its slot.
    if (insideVisit !== undefined && slots !== undefined) {
      if (!take(slots.plain, key)) take(slots.arm, key);
    }
    const owner = insideVisit ?? (claimsPost ? prevVisit : nextVisit);
    const required = owner?.unit.calls.some((c) => callKey(c) === key) === true;
    if (owner && required) {
      owned.set(owner, (owned.get(owner) ?? new Set<string>()).add(key));
    } else if (workflowKeys.has(key)) {
      // R4: a workflow-level call is never charged to a step and never unexpected.
    } else if (owner === undefined) {
      unattributable.set(key, item.call);
    } else {
      unexpectedCalls.set(key, item.call);
    }
  });

  const evidenceHoles: EvidenceHole[] = [];
  const occurrence = new Map<Unit, number>();
  const exercised = new Map<Unit, Set<string>>();
  for (const v of visits) {
    const index = (occurrence.get(v.unit) ?? 0) + 1;
    occurrence.set(v.unit, index);
    const beforeJournal = firstCall !== -1 && v.rows.every((r) => r < firstCall);
    if (beforeJournal) continue;
    const got = owned.get(v) ?? new Set<string>();
    // A visit whose own row-writing call (`steps finish` / `steps done`) left no journaled
    // call is judged on its step row alone: the journal did not see this visit's commands.
    // A writer outside the journal window is never required, so there a visit with no
    // journaled call at all is judged the same way.
    const isWriter = (k: string): boolean => k === "steps finish" || k === "steps done";
    const writerInWindow = v.unit.calls.some((c) => !c.branch && isWriter(callKey(c)));
    if (writerInWindow ? ![...got].some(isWriter) : got.size === 0) continue;
    const pool = exercised.get(v.unit) ?? new Set<string>();
    for (const k of got) pool.add(k);
    exercised.set(v.unit, pool);
    const rowsOf = v.rows.map((i) => items[i]).flatMap((x) => (x?.kind === "step" ? [x.row] : []));
    const done = rowsOf.some((r) => r.status === undefined || r.status === "DONE");
    if (preJournal || !done) continue;
    const missing = new Map<string, WorkflowCall>();
    for (const c of v.unit.calls) {
      if (!c.branch && !got.has(callKey(c)) && !missing.has(callKey(c))) {
        missing.set(callKey(c), { noun: c.noun, verb: c.verb, flags: c.flags });
      }
    }
    if (missing.size === 0) continue;
    const group = rowsOf.map((r) => r["group"]).find((g) => typeof g === "number");
    evidenceHoles.push({
      step: rowsOf[0]?.step ?? v.unit.keys[0] ?? "",
      number: v.unit.number,
      index,
      ...(typeof group === "number" ? { group } : {}),
      missing: [...missing.values()],
    });
  }

  const unexercised: Array<{ step: string; call: CallRef }> = [];
  if (!preJournal) {
    for (const u of units) {
      const pool = exercised.get(u);
      if (pool === undefined) continue;
      const required = new Set(u.calls.filter((c) => !c.branch).map(callKey));
      const reported = new Set<string>();
      for (const c of u.calls) {
        const k = callKey(c);
        if (c.branch && !required.has(k) && !pool.has(k) && !reported.has(k)) {
          reported.add(k);
          unexercised.push({ step: u.keys[0] ?? "", call: { noun: c.noun, verb: c.verb } });
        }
      }
    }
  }

  const observed = new Set(items.flatMap((i) => (i.kind === "step" ? [i.key] : [])));
  const closed = observed.has(`${workflow}-close-workflow`);
  const failed = own.some((r) => r.type === "workflow-failed");
  const lastNumber = Math.max(0, ...visits.map((v) => v.unit.number));
  const stepHoles = units
    .filter((u) => !u.conditional && !u.keys.some((k) => observed.has(k)))
    .filter((u) => closed || (failed && u.number < lastNumber))
    .map((u) => u.keys[0]!);

  const unexpected: Array<CallRef | { step: string }> = [
    ...[...observed]
      .filter((k) => !unitOf.has(k) && !pauseRows.has(k))
      .sort()
      .map((step) => ({ step })),
    ...(preJournal ? [] : unexpectedCalls.values()),
  ];
  const holey = evidenceHoles.length > 0 || stepHoles.length > 0;
  return {
    workflow,
    verdict: holey ? "HOLEY" : "CLEAN",
    holey,
    preJournal,
    journalSuspect: preJournal && options.journalSuspect === true,
    observed: { steps: stepRowCount, calls: callCount },
    evidenceHoles,
    stepHoles,
    unexercised,
    unexpected,
    unattributable: [...unattributable.values()],
    sourceSha: contract.sourceSha,
    workflowCalls: workflowCalls.map((c) => ({ noun: c.noun, verb: c.verb })),
  };
}

export interface StoredOrComputed {
  verdict: CompletenessVerdict;
  source: "stored" | "computed";
}

/**
 * The verdict of a run: its last stored `completeness` row, recomputed when a
 * `step-done` or `engine-call` row follows it (the closing `workflow-done` row and
 * the `completeness` verb's own journal row do not).
 */
export function readCompleteness(
  rows: StatusRow[],
  contract: Contract,
  options: CheckOptions = {},
): StoredOrComputed {
  const own = rows.filter((r) => r.workflow === contract.workflow);
  const at = own.map((r) => r.type).lastIndexOf("completeness");
  const stored = at === -1 ? undefined : own[at];
  const followed = own
    .slice(at + 1)
    .some((r) => r.type === "step-done" || (r.type === "engine-call" && r["noun"] !== SELF_NOUN));
  if (!stored || followed) return { verdict: check(rows, contract, options), source: "computed" };
  const list = (key: string): never[] =>
    Array.isArray(stored[key]) ? (stored[key] as never[]) : [];
  const holey = stored["verdict"] === "HOLEY";
  const observed = stored["observed"] as CompletenessVerdict["observed"] | undefined;
  return {
    source: "stored",
    verdict: {
      workflow: contract.workflow,
      verdict: holey ? "HOLEY" : "CLEAN",
      holey,
      preJournal: stored["preJournal"] === true,
      journalSuspect: stored["journalSuspect"] === true,
      observed: observed ?? { steps: 0, calls: 0 },
      evidenceHoles: list("evidenceHoles"),
      stepHoles: list("stepHoles"),
      unexercised: list("unexercised"),
      unexpected: list("unexpected"),
      unattributable: list("unattributable"),
      sourceSha: typeof stored["sourceSha"] === "string" ? stored["sourceSha"] : "",
      workflowCalls: list("workflowCalls"),
    },
  };
}

// ---------------------------------------------------------------------------
// Run classification + path-conditional expected sets
// ---------------------------------------------------------------------------

/**
 * Classify a run based on the observed step set and whether a workflow-failed
 * row was emitted. Classification logic mirrors bkit-ship.md's routing:
 *
 * - close-workflow present → completed (sub-classify by the Step 2 marker)
 *   - no regression-guard → MERGED_ON_ENTRY (Step 2 jumped to 13)
 *   - conflict-resolve present → PATH_B
 *   - else → PATH_A
 * - workflow-failed present (and no close-workflow) → ABORTED
 * - else → IN_PROGRESS
 *
 * MERGED_ON_ENTRY is decided by the explicit `ship-merged-on-entry` row that
 * bkit-ship.md Step 2 sub-step 5 writes on the `state` = MERGED route. It does NOT
 * key on the absence of `ship-merge-pr` / `ship-deferred-sweep`.
 *
 * For corpus rows without the marker, it falls back to requiring BOTH
 * `ship-worktree-setup` and `ship-regression-guard` to be absent (Step 2 writes those
 * two in a single fenced block); a run that dropped only one stays Path A/B.
 */
export function classifyRun(
  observedSteps: Set<string>,
  hasWorkflowFailed: boolean,
  hasMergedOnEntryMarker = false,
): RunPath {
  if (observedSteps.has("ship-close-workflow")) {
    if (hasMergedOnEntryMarker) return "MERGED_ON_ENTRY";
    if (!observedSteps.has("ship-worktree-setup") && !observedSteps.has("ship-regression-guard")) {
      return "MERGED_ON_ENTRY";
    }
    if (observedSteps.has("ship-conflict-resolve")) {
      return "PATH_B";
    }
    return "PATH_A";
  }
  if (hasWorkflowFailed) return "ABORTED";
  return "IN_PROGRESS";
}

/**
 * Compute the set of MANDATORY steps for a given path. Steps NOT in this set
 * are optional and their absence is never a hole.
 */
export function computeMandatoryForPath(path: RunPath, sourceUniverse: string[]): Set<string> {
  const universe = new Set(sourceUniverse);

  switch (path) {
    case "PATH_A":
      // Skip conflict-resolve + retry-loop steps
      return new Set(
        [...universe].filter((s) => !PATH_B_ONLY_STEPS.has(s) && !RETRY_LOOP_STEPS.has(s)),
      );

    case "PATH_B":
      // Include conflict-resolve, skip retry-loop steps
      return new Set([...universe].filter((s) => !RETRY_LOOP_STEPS.has(s)));

    case "MERGED_ON_ENTRY":
      // Skip the entire middle + retry-loop steps
      return new Set(
        [...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s) && !RETRY_LOOP_STEPS.has(s)),
      );

    case "COMPLETED":
      // Non-ship runs derive their mandatory set from the contract (auditRun)
      return new Set(universe);

    case "ABORTED":
      // No mandatory steps — the run terminated; post-abort absences are expected
      return new Set();

    case "IN_PROGRESS":
      // Run not done — can't determine holes
      return new Set();
  }
}

// ---------------------------------------------------------------------------
// Hole detection
// ---------------------------------------------------------------------------

/**
 * Detect holes: missing mandatory steps + unexpected (invented) steps.
 *
 * For ABORTED runs, the expected set is every step at or before the last
 * observed step in canonical order (minus path-conditional skips). This catches
 * holes BEFORE the abort point (e.g. a run that aborted at merge-pr but skipped
 * regression-guard earlier).
 */
export function detectHoles(
  observed: Set<string>,
  sourceUniverse: string[],
  path: RunPath,
): { missing: string[]; unexpected: string[] } {
  const universeSet = new Set(sourceUniverse);

  // Unexpected = observed but not in the source universe
  const unexpected = [...observed].filter((s) => !universeSet.has(s)).sort();

  // Missing = mandatory but not observed
  if (path === "ABORTED") {
    // Determine the last observed step in canonical order
    const lastObservedIdx = SHIP_STEP_ORDER.reduce((lastIdx, key, idx) => {
      if (observed.has(key)) return idx;
      return lastIdx;
    }, -1);

    if (lastObservedIdx < 0) return { missing: [], unexpected };

    // For aborted runs, expected = everything before the last step, minus
    // retry-loop steps and minus conflict-resolve (unless it was observed)
    const skipSet = new Set<string>([...RETRY_LOOP_STEPS]);
    if (!observed.has("ship-conflict-resolve")) skipSet.add("ship-conflict-resolve");

    const missing: string[] = [];
    for (let i = 0; i <= lastObservedIdx; i++) {
      const key = SHIP_STEP_ORDER[i];
      if (skipSet.has(key)) continue;
      if (!observed.has(key)) missing.push(key);
    }
    return { missing, unexpected };
  }

  if (path === "IN_PROGRESS") {
    return { missing: [], unexpected };
  }

  const mandatory = computeMandatoryForPath(path, sourceUniverse);
  const missing = [...mandatory].filter((s) => !observed.has(s)).sort();
  return { missing, unexpected };
}

// ---------------------------------------------------------------------------
// Full audit — parse status.jsonl + workflow md, classify, detect, report
// ---------------------------------------------------------------------------

export function parseRows(statusJsonl: string): StatusRow[] {
  const rows: StatusRow[] = [];
  for (const line of statusJsonl.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Unparseable lines are skipped (advisory — never throw).
    const row = parseJson(trimmed);
    if (row.ok) rows.push(row.value as StatusRow);
  }
  return rows;
}

/** Audit one run's rows against the contract derived from its workflow markdown. */
export function auditRun(rows: StatusRow[], workflow: string, workflowMd: string): HoleReport {
  const contract = deriveContract(workflowMd, workflow);
  const stepRows = rows.filter(
    (r) => r.type === "step-done" && r.workflow === workflow && typeof r.step === "string",
  );
  const hasWorkflowFailed = rows.some(
    (r) => r.type === "workflow-failed" && r.workflow === workflow,
  );
  const observed = new Set<string>();
  for (const r of stepRows) if (r.step) observed.add(r.step);
  const sorted = [...observed].sort();
  const side = new Set([...contract.pauseRows, ...contract.subRows]);

  if (workflow === "ship") {
    const hasMergedOnEntryMarker = rows.some(
      (r) => r.type === "ship-merged-on-entry" && r.workflow === "ship",
    );
    const runPath = classifyRun(observed, hasWorkflowFailed, hasMergedOnEntryMarker);
    const { missing, unexpected } = detectHoles(observed, contract.universe, runPath);
    return {
      workflow,
      missing,
      unexpected: unexpected.filter((k) => !side.has(k)),
      path: runPath,
      observed: sorted,
      sourceUniverse: contract.universe,
      sourceCanonicalDrift: contract.drift,
      orphanSteps: contract.orphanSteps,
    };
  }

  const closeKey = `${workflow}-close-workflow`;
  const runPath: RunPath = observed.has(closeKey)
    ? "COMPLETED"
    : hasWorkflowFailed
      ? "ABORTED"
      : "IN_PROGRESS";
  const missing =
    runPath === "COMPLETED"
      ? contract.steps
          .filter(
            (s) => s.keys.length > 0 && !s.conditional && !s.keys.some((k) => observed.has(k)),
          )
          .map((s) => s.keys[0]!)
          .sort()
      : [];
  return {
    workflow,
    missing,
    unexpected: sorted.filter((k) => !contract.universe.includes(k) && !side.has(k)),
    path: runPath,
    observed: sorted,
    sourceUniverse: contract.universe,
    sourceCanonicalDrift: contract.drift,
    orphanSteps: contract.orphanSteps,
  };
}

/** `workflow`'s rows split into runs: each `workflow-started` opens a run that ends at the next one; rows before the first start form their own run. */
export function runsOf(rows: StatusRow[], workflow: string): StatusRow[][] {
  const at = (r: StatusRow) => (typeof r["at"] === "string" ? r["at"] : "");
  const own = rows
    .filter((r) => r.workflow === workflow)
    .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
  const runs: StatusRow[][] = [];
  for (const row of own) {
    const current = runs.at(-1);
    if (current === undefined || row.type === "workflow-started") runs.push([row]);
    else current.push(row);
  }
  return runs;
}

/** Audit a status.jsonl as a ship run against `shipMd`. */
export function auditStatusJsonl(statusJsonl: string, shipMd: string): HoleReport {
  return auditRun(parseRows(statusJsonl), "ship", shipMd);
}

/** The workflows a status.jsonl holds runs of, inferred from its own rows. */
export function inferWorkflows(rows: StatusRow[]): string[] {
  const known = new Set<string>(Object.keys(WORKFLOW_STEPS));
  const found = new Set<string>();
  for (const r of rows)
    if (typeof r.workflow === "string" && known.has(r.workflow)) found.add(r.workflow);
  return [...found].sort();
}

// ---------------------------------------------------------------------------
// Advisory report formatter
// ---------------------------------------------------------------------------

export function formatAdvisoryReport(report: HoleReport): string {
  const lines: string[] = [];
  lines.push("[bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)");
  if (report.workflow) lines.push(`  workflow: ${report.workflow}`);
  lines.push(`  path: ${report.path}`);
  lines.push(`  observed: ${report.observed.length} step(s)`);

  if (report.sourceCanonicalDrift.length > 0) {
    lines.push(`  ⚠ source/canonical drift: ${report.sourceCanonicalDrift.join(", ")}`);
  }

  if (report.orphanSteps.length > 0) {
    lines.push(`  ⚠ recorded outside any numbered step: ${report.orphanSteps.join(", ")}`);
  }

  if (report.missing.length > 0) {
    lines.push(`  missing (mandatory for ${report.path}): ${report.missing.join(", ")}`);
  } else {
    lines.push(`  missing: none`);
  }

  if (report.unexpected.length > 0) {
    lines.push(`  unexpected (invented names): ${report.unexpected.join(", ")}`);
  } else {
    lines.push(`  unexpected: none`);
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// CLI entry — always exits 0 (advisory / fail-open)
// ---------------------------------------------------------------------------

export function main(argv: string[]): void {
  // Every positional is a status.jsonl to audit — one report per run of each
  // workflow in each file, so a whole corpus can be swept in one advisory CI step.
  const statusPaths = argv.slice(2).filter((a) => !a.startsWith("--"));
  if (statusPaths.length === 0) {
    process.stdout.write("[bkit-status-holes] no status.jsonl path given — skipping (advisory)\n");
    return; // exit 0
  }

  const mdCache = new Map<string, string | null>();
  const loadMd = (workflow: string): string | null => {
    if (!mdCache.has(workflow)) {
      try {
        mdCache.set(
          workflow,
          fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"),
        );
      } catch {
        mdCache.set(workflow, null);
      }
    }
    return mdCache.get(workflow) ?? null;
  };

  let holeyRuns = 0;
  for (const statusPath of statusPaths) {
    // Read inputs (advisory — missing files = skip, never fail)
    let statusJsonl = "";
    try {
      statusJsonl = fs.readFileSync(statusPath, "utf-8");
    } catch {
      process.stdout.write(`[bkit-status-holes] ${statusPath} not found — skipping (advisory)\n`);
      continue; // exit 0
    }

    const rows = parseRows(statusJsonl);
    const workflows = inferWorkflows(rows);
    process.stdout.write(`\n${statusPath}\n`);
    if (workflows.length === 0) {
      process.stdout.write(
        `[bkit-status-holes] ${statusPath}: no workflow rows — skipping (advisory)\n`,
      );
      continue;
    }
    for (const workflow of workflows) {
      const md = loadMd(workflow);
      if (md === null) {
        process.stdout.write(
          `[bkit-status-holes] bkit-${workflow}.md not found — skipping ${workflow} run (advisory)\n`,
        );
        continue;
      }
      for (const run of runsOf(rows, workflow)) {
        const report = auditRun(run, workflow, md);
        if (report.missing.length > 0) holeyRuns += 1;
        process.stdout.write(formatAdvisoryReport(report) + "\n");
      }
    }
  }
  process.stdout.write(
    `[bkit-status-holes] sweep: ${statusPaths.length} file(s), ${holeyRuns} holey\n`,
  );
  // ALWAYS exit 0 — this is advisory / fail-open
}

// Run if invoked directly (ESM-compatible main-module detection)
if (process.argv[1]) {
  try {
    if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
      main(process.argv);
    }
  } catch (_e) {
    void _e; // realpathSync can fail on symlinks — skip (advisory, never crash)
  }
}
