// Read a build Decision Pause: the orchestrator's decision file plus the engine's rows for it in
// the folder's `status.jsonl` (`decision-counts`: Source changed, Gate, the loop question;
// `decision-answer`: one row per answer). The module returns the header, the items, the run's
// open pause, and the two rules read from them — whether a resume re-runs a red gate
// (`gateRerun`) and whether a pause may route `continue` (`skipProblem`). The row appended last
// wins for a question; `at` is never compared. An old file (`isOldLayout`) keeps its own answer
// lines; any other file settles only through rows, and only once `checkProblem` passes. The module imports
// nothing from the command modules, so `status.ts`, `steps.ts` and `workflows.ts` read it
// without an import cycle.

import * as fs from "node:fs";
import * as path from "node:path";

import {
  fold,
  parseStatusLines,
  type DecisionAnswerRow,
  type DecisionCountsRow,
  type StatusEvent,
  type StatusRow,
} from "../../ledgers/status.js";
import { CommandError } from "../lib.js";

/** Exit code: the `status.jsonl` beside the decision file is missing or has a malformed line. */
export const EXIT_NO_STATUS = 3;

/** One question of a decision file. */
export interface DecisionItem {
  n: number;
  title: string;
  /** The item's whole text, from its `**Q{n}` line to the next item. */
  text: string;
  options: string[];
  /** The recommended option; null for a hard blocker. */
  recommended: string | null;
  reason: string;
  /** The `Decision:` line's text, a lettered answer read as its option (`optionAnswer`). */
  decision: string | null;
  /** The plan task on the `Fix task:` line, else null. */
  fixTask: number | null;
  assumed: boolean;
  rejected: boolean;
  deferred: boolean;
  /** Who wrote the answer (the row's `by`); null for an unanswered or an in-file answer. */
  by: string | null;
}

/** Splits a decision file before each `**Q{n} — ` item line. */
export const ITEM_SPLIT = /^(?=\*\*Q\d+ — )/m;
const lineOf = (text: string, key: string): string | null =>
  new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;

/** `A`, `B`, … for option index `i`. */
export const letterAt = (i: number): string => String.fromCharCode(65 + i);
/** An option entry's leading letter (`A) `) dropped, so a parsed name stays bare. */
const bareName = (s: string): string => s.replace(/^[A-Z]\)[ \t]*/, "");
/** A reply opening on an option letter: `B`, `B)`, `B — …`, `B) {option} …`, `B {option} …`. */
const LETTER_REPLY = /^([A-Za-z])(?:\)|(?=[ \t—:,.-]|$))[ \t]*(?:[—:,.-][ \t]*)?/;

/**
 * An answer read as the option it names. A leading letter of `options` (either case, with or
 * without `)`) becomes the option it labels: `B`, `B) Reject` and `B — too risky` read as
 * `Reject`, `Reject` and `Reject — too risky`. Any other answer is returned unchanged; with
 * no options known, only a leading `A) ` is dropped.
 */
export function optionAnswer(answer: string, options: string[]): string {
  if (options.length === 0) return bareName(answer);
  const m = LETTER_REPLY.exec(answer);
  const name = m === null ? undefined : options[m[1]!.toUpperCase().charCodeAt(0) - 65];
  if (m === null || name === undefined) return answer;
  const rest = answer.slice(m[0].length);
  if (rest.toLowerCase().startsWith(name.toLowerCase())) return name + rest.slice(name.length);
  if (rest === "") return name;
  return /[)—:,.-]/.test(m[0]) ? `${name} — ${rest}` : answer;
}

/**
 * Whether a `Recommended:` option name marks a hard blocker: it names none of the item's
 * `options` and starts with the word `none`, so an option such as `None needed` stays an option.
 */
const isHardBlocker = (name: string, options: string[]): boolean => {
  const bare = bareName(name.trim());
  return !options.includes(bare) && /^none\b/i.test(bare);
};

/**
 * The loop question of a pause's items: `Q1` when the pause has a loop (`hasLoop`: a
 * `decision-counts` row holds one, or an old file's `## Progress` block), else none.
 */
export const loopItemOf = (items: DecisionItem[], hasLoop: boolean): DecisionItem | undefined =>
  hasLoop ? items.find((i) => i.n === 1) : undefined;

/** A `Fix task:` value as a positive integer, else null. */
const fixTaskOf = (v: string | null): number | null =>
  v !== null && /^[1-9][0-9]*$/.test(v) ? Number(v) : null;

/** The `Key: value` lines before the file's first blank line; a CRLF line reads like LF. */
export function decisionHeader(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === "" || line.startsWith("**Q")) break;
    const m = /^([A-Za-z][\w ]*):[ \t]*(.*?)[ \t]*$/.exec(line);
    if (m !== null && !(m[1]! in out)) out[m[1]!] = m[2]!;
  }
  return out;
}

/** The items of a decision file's text, in file order. */
export function parseDecisionItems(text: string): DecisionItem[] {
  return text
    .split(ITEM_SPLIT)
    .slice(1)
    .map((part) => {
      const head = /^\*\*Q(\d+) — (.+?):\*\*/.exec(part);
      const rec = lineOf(part, "Recommended");
      const [option, ...why] = (rec ?? "").split(" — ");
      const perLine = [...part.matchAll(/^[A-Z]\)[ \t]+(.+?)[ \t]*$/gm)].map((m) =>
        (m[1] ?? "").split(" — ")[0]!.trim(),
      );
      const options =
        perLine.length > 0
          ? perLine.filter(Boolean)
          : (lineOf(part, "Options") ?? "")
              .split(" / ")
              .map((o) => bareName(o.trim()))
              .filter(Boolean);
      const none = isHardBlocker(option ?? "", options);
      const answer = lineOf(part, "Decision");
      const decision = answer === null ? null : optionAnswer(answer, options);
      return {
        n: Number(head?.[1] ?? 0),
        title: head?.[2] ?? "",
        text: part.trimEnd(),
        options,
        recommended: none || rec === null ? null : bareName((option ?? "").trim()),
        reason: why.join(" — ").trim(),
        decision,
        fixTask: fixTaskOf(lineOf(part, "Fix task")),
        assumed: decision !== null && /^Accept \(assumed\)/.test(decision),
        rejected: lineOf(part, "Rejected") !== null,
        deferred: lineOf(part, "Deferred") !== null,
        by: null,
      };
    });
}

/** Reads a path's text, or null when the file is absent. */
export type ReadText = (rel: string) => string | null;
/** A decision file as its text alone (an old file, no rows) or as a reader plus the file's path. */
export type DecisionSource = string | ReadText;

const sourceOf = (
  source: DecisionSource,
  rel = "",
): { read: ReadText; rel: string; text: boolean } =>
  typeof source === "string"
    ? { read: (r) => (r === "decision.md" ? source : null), rel: "decision.md", text: true }
    : { read: source, rel, text: false };

/** Every row of the `status.jsonl` beside `rel`, in file order; none when it is absent. */
function statusRowsBeside(read: ReadText, rel: string): StatusRow[] {
  const statusRel = path.join(path.dirname(rel), "status.jsonl");
  const text = read(statusRel);
  if (text === null) return [];
  const parsed = parseStatusLines(text, statusRel);
  if ("line" in parsed)
    throw new CommandError(EXIT_NO_STATUS, `${statusRel} line ${parsed.line} is ${parsed.problem}`);
  return parsed.rows;
}

/**
 * The `decision-counts` and `decision-answer` rows naming `rel` in the `status.jsonl` beside it,
 * in file order. A row names a file by its name: the rows sit in the file's own folder.
 * `answersOf` keeps only the `decision-answer` rows of that workflow.
 */
export function decisionRows(read: ReadText, rel: string, answersOf?: string): StatusRow[] {
  const name = path.basename(rel);
  return statusRowsBeside(read, rel).filter(
    (r) =>
      (r.type === "decision-counts" || r.type === "decision-answer") &&
      typeof r.file === "string" &&
      path.basename(r.file) === name &&
      (answersOf === undefined || r.type !== "decision-answer" || r.workflow === answersOf),
  );
}

/** The value of the `workflow-started` field `decisionLayout` that marks a run whose pause answers are rows. */
export const DECISION_LAYOUT = "rows";

/**
 * Whether the run that wrote `rel` started before the engine marked its start row: run {RUN}
 * of the name `{workflow}-decision-{RUN}-{N}.md`, counted as `runNumber` counts runs in the
 * `status.jsonl` beside it, began at a `workflow-started` row with no `decisionLayout` field.
 * A resume appends no start row, so that row is the run's first. No such row, or a name with no
 * run number, is false.
 */
function startedBeforeMarker(read: ReadText, rel: string): boolean {
  const m = /^(.+)-decision-([0-9]+)-[0-9]+\.md$/.exec(path.basename(rel));
  if (m === null) return false;
  const rows = statusRowsBeside(read, rel);
  const run = fold(rows as StatusEvent[]).filter((r) => r.workflow === m[1])[Number(m[2]) - 1];
  if (run === undefined) return false;
  const start = rows.find(
    (r) => r.type === "workflow-started" && r.workflow === m[1] && r.at === run.startedAt,
  );
  return start !== undefined && !("decisionLayout" in start);
}

/**
 * Whether the file is an old layout, read as written: its header carries the `Status` line only
 * an old file has, no `decision-counts` row names it, and its run started before the marker
 * (`startedBeforeMarker`). Answer rows (owner, rerun, ship) override only the question they
 * name. Any other file's own `Status:`, `Decision:`, `Fix task:`, `Rejected:` and `Deferred:`
 * lines are never answers.
 */
const isOldLayout = (
  read: ReadText,
  rel: string,
  header: Record<string, string>,
  rows: StatusRow[],
): boolean =>
  "Status" in header &&
  !rows.some((r) => r.type === "decision-counts") &&
  startedBeforeMarker(read, rel);

interface Folded {
  items: DecisionItem[];
  header: Record<string, string>;
  hasLoop: boolean;
}

/** The last row of a type, in file order. */
const lastOf = <T>(rows: StatusRow[], type: string): T | null =>
  (rows.filter((r) => r.type === type).at(-1) as T | undefined) ?? null;

function foldDecision(read: ReadText, rel: string, answersOf?: string, textOnly = false): Folded {
  const text = read(rel) ?? "";
  const rows = decisionRows(read, rel, answersOf);
  const header = decisionHeader(text);
  const own = parseDecisionItems(text);
  const old = !textOnly && isOldLayout(read, rel, header, rows);
  if (textOnly || (old && rows.length === 0)) {
    return { items: own, header, hasLoop: hasProgress(text) };
  }
  // A file `checkProblem` refuses settles nothing: no answer row counts for it.
  const settles = old || checkProblem(read, rel) === null;
  const counts = lastOf<DecisionCountsRow>(rows, "decision-counts");
  const items: DecisionItem[] = own.map((i) =>
    old
      ? i
      : {
          ...i,
          decision: null,
          fixTask: null,
          assumed: false,
          rejected: false,
          deferred: false,
          by: null,
        },
  );
  const loop = counts?.loop;
  if (loop !== undefined && !items.some((i) => i.n === 1)) {
    items.push({
      n: 1,
      title: loop.title,
      text: [`**Q1 — ${loop.title}:**`, ...loop.options.map((o, k) => `${letterAt(k)}) ${o}`)].join(
        "\n",
      ),
      options: loop.options,
      recommended: loop.recommended,
      reason: loop.reason,
      decision: null,
      fixTask: null,
      assumed: false,
      rejected: false,
      deferred: false,
      by: null,
    });
  }
  items.sort((a, b) => a.n - b.n);
  // An answer row written before the file's first counts row answers nothing.
  const firstCounts = rows.findIndex((r) => r.type === "decision-counts");
  const answers = new Map<number, DecisionAnswerRow>();
  for (const [k, r] of rows.entries())
    if (settles && k > firstCounts && r.type === "decision-answer")
      answers.set(Number(r.q), r as DecisionAnswerRow);
  const folded = items.map((i) => {
    const a = answers.get(i.n);
    if (a === undefined) return i;
    return {
      ...i,
      decision: optionAnswer(String(a.answer), i.options),
      assumed: a.assumed === true,
      rejected: a.rejected === true,
      deferred: a.deferred !== undefined && a.deferred !== false,
      by: typeof a.by === "string" ? a.by : null,
      fixTask: fixTaskOf(a.fixTask === undefined ? null : String(a.fixTask)),
    };
  });
  const out = { ...header };
  if (!old) for (const k of ["Status", "Source changed", "Gate"]) delete out[k];
  if (counts?.sourceChanged !== undefined) out["Source changed"] = String(counts.sourceChanged);
  if (counts?.gate !== undefined) out.Gate = counts.gate;
  return { items: folded, header: out, hasLoop: loop !== undefined || (old && hasProgress(text)) };
}

/** Whether a file's text before its first item holds the `## Progress` block. */
const hasProgress = (text: string | null | undefined): boolean =>
  text != null && /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");

/**
 * The items of the decision file `rel`: its questions, the loop question `Q1` from the last
 * `decision-counts` row, each answer from the row appended last for its question. `read` returns
 * a path's text, or null when the file is absent. An old file (`isOldLayout`) is the base: its
 * in-file answers stand, and a row overrides only the question it names. Any other file reads
 * no answer while `checkProblem` refuses it. `answersOf` keeps only that workflow's answer rows.
 */
export function decisionItems(read: ReadText, rel: string, answersOf?: string): DecisionItem[] {
  return foldDecision(read, rel, answersOf).items;
}

/** The header of the decision file `rel`, `Source changed` and `Gate` read from its `decision-counts` row. */
export function decisionFileHeader(read: ReadText, rel: string): Record<string, string> {
  return foldDecision(read, rel).header;
}

/**
 * The `Status` a pause's items leave it in: `OPEN` while a question has no answer (and for a
 * file with no readable question), except that the loop question `Q1` (`hasLoop`: a
 * `decision-counts` row holds it, or an old file's `## Progress` block) answered `Try again`
 * settles the pause; then `ASSUMED` while an assumed `Accept` remains; else `DECIDED`.
 */
export function statusOf(items: DecisionItem[], hasLoop = false): "OPEN" | "ASSUMED" | "DECIDED" {
  if (items.length === 0) return "OPEN";
  const loop = loopItemOf(items, hasLoop);
  const settled = /^Try again\b/.test(loop?.decision ?? "");
  if (!settled && items.some((i) => i.decision === null)) return "OPEN";
  return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
}

/**
 * The `Status` of a pause: an old file (`isOldLayout`) that no row names is read as its
 * written `Status:` line; otherwise the status its folded items leave it in.
 */
export function pauseStatus(source: DecisionSource, rel?: string): string {
  const { read, rel: r, text } = sourceOf(source, rel);
  const header = decisionHeader(read(r) ?? "");
  const rows = decisionRows(read, r);
  if (
    header.Status !== undefined &&
    rows.length === 0 &&
    (text || isOldLayout(read, r, header, rows)) &&
    parseDecisionItems(read(r) ?? "").length > 0
  )
    return header.Status;
  const { items, hasLoop } = foldDecision(read, r, undefined, text);
  return statusOf(items, hasLoop);
}

/**
 * Whether Q1 is the loop question (a `decision-counts` row holds one, or an old file's text
 * before its first item holds the `## Progress` block), and the questions besides it that
 * nobody answered, rejected or deferred.
 */
export function undecidedBesidesLoop(
  source: DecisionSource,
  rel?: string,
): { hasLoop: boolean; undecided: string[] } {
  const { read, rel: r, text } = sourceOf(source, rel);
  const { items, hasLoop } = foldDecision(read, r, undefined, text);
  const undecided = items
    .filter(
      (i) => (hasLoop ? i.n !== 1 : true) && i.decision === null && !i.rejected && !i.deferred,
    )
    .map((i) => `Q${i.n}`);
  return { hasLoop, undecided };
}

/**
 * The first item rule a decision file breaks, naming the question, or null. Each question needs
 * lettered options in order (`A) {name} — {effect}`), a `Recommended:` line that names one of
 * them (or `none` for a hard blocker) and a `Default if unanswered:` line; no number repeats; and
 * `Q1` is the engine's when the `decision-counts` row holds the loop question, and the questions
 * start at `Q1` when it holds none.
 */
export function itemProblem(text: string, loop: { options: string[] } | null): string | null {
  const seen = new Set<number>();
  const engineHasLoop = loop !== null;
  for (const name of ["Status", "Source changed", "Gate"]) {
    if (name in decisionHeader(text))
      return `the header holds a "${name}:" line; the engine writes it as a row, so delete it`;
  }
  const stray =
    /^(?:\*\*Q\d+(?!\d| — )|#+[ \t]*Q\d+\b|[ \t]*(?:[-*+]|\d+[.)])[ \t]+\*\*Q(?:uestion[ \t]*)?\d+|\*\*Question[ \t]*\d+).*$/m.exec(
      text,
    );
  if (stray !== null)
    return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}" at the start of a line; write an em dash (—) after the number, no list marker, close the bold after the colon`;
  if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
    return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the `decision-counts` row holds no loop question)';
  const first = Math.min(...[...text.matchAll(/^\*\*Q(\d+) — /gm)].map((m) => Number(m[1])));
  if (!engineHasLoop && first > 1)
    return `the first question is Q${first}, so Q1 is a loop question, but the \`decision-counts\` row holds none; re-run \`decisions counts\` with the pause's loop flags, or number the questions from Q1`;
  if (engineHasLoop) {
    // The loop question was built for the question count `decisions counts` saw.
    const own = text.split(ITEM_SPLIT).length - 1;
    const offersStop = loop.options.includes("Stop");
    const offersDecide = loop.options.includes("Decide");
    if ((own > 0 && offersStop) || (own === 0 && offersDecide))
      return "the `decision-counts` row's loop question was built for a different question count; re-run Decision Pause step 2's `decisions counts` block with the pause's own count flags, since the last row wins and a flag left out drops what it wrote (`Gate: FAIL` from `--base-check`, the `Source changed` header from `--source-changed`), then check again; a resume does not re-run it, so there this ends in the Failure Path";
  }
  for (const part of text.split(ITEM_SPLIT).slice(1)) {
    const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
    const headLine = part.split("\n", 1)[0] ?? "";
    if (!/^\*\*Q\d+ — .+?:\*\*/.test(headLine))
      return `"${headLine.slice(0, 60)}" is not "**Q{n} — {title}:** {question}"; close the bold after the colon (\`:**\`)`;
    const q = `Q${n}`;
    if (seen.has(n)) return `${q} appears twice; number each question once`;
    seen.add(n);
    if (n === 1 && engineHasLoop)
      return "Q1 is the loop question the `decision-counts` row holds; number your questions from Q2";
    const answerLine = /^(Decision|Fix task|Rejected|Deferred):/m.exec(part);
    if (answerLine !== null)
      return `${q} holds a "${answerLine[1]}:" line; answers are rows the engine writes (\`decisions apply\`), so delete it`;
    const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
    if (optionLines.length === 0)
      return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
    for (const [i, m] of optionLines.entries()) {
      if (m[1] !== letterAt(i))
        return `${q}: option letters must run A, B, C in order; found ${m[1]}) where ${letterAt(i)}) belongs`;
      const [name, ...effect] = (m[2] ?? "").split(" — ");
      if ((name ?? "").trim() === "" || effect.join(" — ").trim() === "")
        return `${q}: option ${m[1]} needs a name and an effect: "${m[1]}) {name} — {what happens}"`;
    }
    const rec = /^Recommended:[ \t]*(.+?)[ \t]*$/m.exec(part)?.[1];
    if (rec === undefined)
      return `${q} has no Recommended: line; write "Recommended: A) {name} — {reason}" or "Recommended: none — {why}"`;
    const names = optionLines.map((m) => (m[2] ?? "").split(" — ")[0]!.trim());
    const recName = (rec.split(" — ")[0] ?? "").replace(/^[A-Z]\)[ \t]*/, "").trim();
    if (!isHardBlocker(recName, names) && !names.includes(recName))
      return `${q}: the recommended option "${recName}" is not one of its options`;
    if (!/^Default if unanswered:[ \t]*\S/m.test(part))
      return `${q} has no Default if unanswered: line`;
  }
  return null;
}

/**
 * The first rule a pause file breaks, or null: no `decision-counts` row names it, or its text
 * breaks an item rule (`itemProblem`, the loop question from the last counts row). `decisions
 * check`, `decisions apply` and the fold (`foldDecision`) refuse a file on it.
 */
export function checkProblem(read: ReadText, rel: string): string | null {
  const counts = lastOf<DecisionCountsRow>(decisionRows(read, rel), "decision-counts");
  if (counts === null)
    return `no \`decision-counts\` row names ${path.basename(rel)}; run Decision Pause step 2's \`decisions counts\` block for it, then check again`;
  return itemProblem(read(rel) ?? "", counts.loop ?? null);
}

/**
 * The `checkProblem` of a pause a resume reads; null for an old file (`isOldLayout`), which is
 * read as written. `decisions apply --by=owner` and `--by=rerun` refuse a file on it.
 */
export function pauseProblem(read: ReadText, rel: string): string | null {
  if (isOldLayout(read, rel, decisionHeader(read(rel) ?? ""), decisionRows(read, rel))) return null;
  return checkProblem(read, rel);
}

/** The checks a red-gate pause re-runs, by the decision file's `From` header. */
export const RERUN_FROM = ["verify", "holistic", "tests"] as const;
export type RerunFrom = (typeof RERUN_FROM)[number];

/**
 * Whether a resume re-runs the pause's gate instead of asking it again: its `Gate` header is
 * `FAIL`, its `Status` is `OPEN`, the loop question is its only undecided question, and its
 * `From` names a check that re-runs. `rerunFrom` is that check, null when `gateRerun` is false.
 */
export function gateRerun(
  open: Pick<OpenDecision, "gate" | "status" | "from"> | null,
  source: DecisionSource,
  rel?: string,
): { gateRerun: boolean; rerunFrom: RerunFrom | null } {
  const from = RERUN_FROM.find((f) => f === open?.from);
  const { hasLoop, undecided } = undecidedBesidesLoop(source, rel);
  const src = sourceOf(source, rel);
  const rerun =
    (src.text || pauseProblem(src.read, src.rel) === null) &&
    open?.gate === "FAIL" &&
    open.status === "OPEN" &&
    from !== undefined &&
    hasLoop &&
    undecided.length === 0;
  return { gateRerun: rerun, rerunFrom: rerun ? from! : null };
}

/** An item answer that accepts the item: `Accept` or `Accept (assumed)`, with or without words. */
const ACCEPTED = /^Accept(?: \(assumed\))?(?:$|[ \t]+—)/;

/**
 * The first fact that stops a settled pause from routing `continue`, or null when all five
 * hold: `From` is `verify` or `holistic`; every item is `Accept` or `Accept (assumed)`; the
 * loop question, when asked, is `Decide`; no `Gate: FAIL` header; and a `Source changed`
 * header that reads `false`. Headers count only in the header block, so a line inside an item
 * never stands in for one. A missing fact refuses; it is never guessed.
 */
export function skipProblem(source: DecisionSource, rel?: string): string | null {
  const { read, rel: r, text } = sourceOf(source, rel);
  const { items, header, hasLoop } = foldDecision(read, r, undefined, text);
  const from = header.From;
  if (from === undefined) return "no From header";
  if (from !== "verify" && from !== "holistic") return `From is "${from}", not verify or holistic`;
  for (const it of items) {
    if (hasLoop && it.n === 1) continue;
    if (it.rejected) return `Q${it.n} is rejected, not Accept`;
    if (it.decision === null || !ACCEPTED.test(it.decision))
      return `Q${it.n} is ${it.decision === null ? "undecided" : `"${it.decision}"`}, not Accept`;
  }
  const loop = loopItemOf(items, hasLoop);
  if (loop !== undefined && !/^Decide\b/.test(loop.decision ?? ""))
    return `the loop question Q1 is ${loop.decision === null ? "undecided" : `"${loop.decision}"`}, not Decide`;
  if (/^FAIL\b/.test(header.Gate ?? "")) return "Gate: FAIL header: the gate is red";
  const changed = header["Source changed"];
  if (changed === undefined) return "no Source changed header";
  if (changed !== "false") return `Source changed is "${changed}", not false`;
  return null;
}

/** An OPEN Decision Pause file of the current run, as `workflows start` prints it. */
export interface OpenDecision {
  file: string;
  decision: number;
  question: string | null;
  from: string | null;
  pauseStep: number | null;
  group: number | null;
  verifyAttempt: number | null;
  testAttempt: number | null;
  plan: string | null;
  gate: string | null;
  sourceChanged: string | null;
  status: string;
  /** The number of questions the pause holds, the loop question included; 0 while `pauseProblem` refuses it. */
  questions: number;
  /** Whether a `decision-counts` row names the file. */
  counted: boolean;
}

/** The pauses whose `decisions counts` takes no flags, so a resume can write their row. */
export const BARE_COUNT_QUESTIONS = ["CHALLENGE", "CHANGED_TESTS", "UNPROVEN"];

/**
 * Whether the pause file `rel` reads as never written: no `decision-counts` row names it, it
 * holds no question a resume reads (`pauseProblem` refuses it, or an old file has none), and its
 * `Question` is not one of `BARE_COUNT_QUESTIONS`. Its counts need the gate's flags, which a
 * resume does not hold, so `openDecision` skips it and the build summary does not list it.
 */
export function unwrittenPause(read: ReadText, rel: string): boolean {
  if (decisionRows(read, rel).some((r) => r.type === "decision-counts")) return false;
  const { header, items } = foldDecision(read, rel);
  if (BARE_COUNT_QUESTIONS.includes(header.Question ?? "")) return false;
  return pauseProblem(read, rel) !== null || items.length === 0;
}

/**
 * The highest-numbered `{workflow}-decision-{run}-{N}.md` in `logDir` whose header holds
 * `Status: OPEN`, or a `DECIDED` / `ASSUMED` file that none of the run's `{workflow}-decision`
 * rows names (a pause stopped after its answers were written, before the step finished), or
 * null. Only the given run's files count, so an earlier run's pause never resurfaces. A file
 * that reads as never written (`unwrittenPause`) is skipped as if absent: the step rows route
 * the resume, and a pause it reaches again takes the same number, since no `{workflow}-decision`
 * row was written for it. `file` is relative to `tree`; `finished` lists the paths the run's
 * decision rows name.
 */
export function openDecision(
  logDir: string,
  tree: string,
  workflow: string,
  run: number,
  finished: readonly string[] = [],
): OpenDecision | null {
  if (!fs.existsSync(logDir)) return null;
  const name = new RegExp(`^${workflow}-decision-${run}-([0-9]+)\\.md$`);
  const found = fs
    .readdirSync(logDir)
    .map((f) => ({ f, m: name.exec(f) }))
    .filter((x): x is { f: string; m: RegExpExecArray } => x.m !== null)
    .map(({ f, m }) => ({ f, n: Number(m[1]) }))
    .sort((a, b) => b.n - a.n);
  for (const { f, n } of found) {
    const rel = path.relative(tree, path.join(logDir, f));
    const read: ReadText = (r) => {
      const abs = path.join(tree, r);
      return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
    };
    const { header, items } = foldDecision(read, rel);
    const status = pauseStatus(read, rel);
    const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
    if ((status !== "OPEN" && !unfinished) || unwrittenPause(read, rel)) continue;
    const counted = decisionRows(read, rel).some((r) => r.type === "decision-counts");
    const questions = pauseProblem(read, rel) === null ? items.length : 0;
    const num = (key: string) => {
      const v = header[key];
      return v !== undefined && /^[0-9]+$/.test(v) ? Number(v) : null;
    };
    return {
      file: rel,
      decision: n,
      question: header.Question ?? null,
      from: header.From ?? null,
      pauseStep: num("Pause step"),
      group: num("Group"),
      verifyAttempt: num("Verify attempt"),
      testAttempt: num("Test attempt"),
      plan: header.Plan ?? null,
      gate: header.Gate ?? null,
      sourceChanged: header["Source changed"] ?? null,
      status,
      questions,
      counted,
    };
  }
  return null;
}
