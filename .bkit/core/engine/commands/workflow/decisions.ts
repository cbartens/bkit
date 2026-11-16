// bkit decisions compose|apply|skip|pending — the build's decision files, from question to ship.
// `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
//
// A decision file (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{N}.md`) holds header
// lines, an optional progress block, then one item per question:
//
//   **Q{n} — {title}:** {question}
//   A) {name} — {what happens if it is picked}
//   B) {name} — {what happens if it is picked}
//   Recommended: A) {name} — {reason}    (a hard blocker: `Recommended: none — {why}`)
//   Default if unanswered: {what happens}
//   Decision: {answer} — {words}         (once decided)
//   Fix task: {N}                        (a `Fix now` item: the plan task that carries its fix)
//
// The old layout is still read: one `Options: A) {A} / B) {B}` line in place of the option lines,
// and `No recommendation — {why}` in place of `Recommended: none — {why}`.
//
// `apply --by=headless` takes each recommendation when nobody can or should be asked: an
// `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
// `docs/decisions.jsonl` row or a `TEST EXCEPTION`: only the owner's words do. Ship lists the
// assumed items with `pending`; the owner confirms each (`apply --by=owner --confirm`, which
// writes the real acceptance) or rejects it, and `pending --defer` writes one `needs-decision`
// deferral per item nobody confirmed.

import * as fs from "node:fs";
import * as path from "node:path";

import { readJsonFile, readTextFile } from "../../shared/json.js";
import { oneLine } from "../../shared/text.js";
import { CommandError, EXIT, git, type CommandSpec } from "../lib.js";
import { loopProgress } from "./counters.js";
import { appendLedgerRows } from "./ledgers.js";
import { LOOPS, loopGateStep } from "./loops.js";
import {
  ITEM_SPLIT,
  letterAt,
  parseDecisionItems,
  skipProblem,
  undecidedBesidesLoop,
  type DecisionItem,
} from "./open-decision.js";
import { classifyAt } from "./runtime.js";
import { positiveInt, str } from "./status.js";

/** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
export const EXIT_HARD_BLOCKERS = 4;

/** Options one item may hold: one per letter, `A` to `Z`. */
const MAX_OPTIONS = 26;
/** The option list as it is written: `A) {A} / B) {B}`. */
const letteredOptions = (options: string[]): string =>
  options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
/** The letter `name` holds in `options`, or null when it is not one of them. */
const letterOf = (options: string[], name: string): string | null =>
  options.includes(name) ? letterAt(options.indexOf(name)) : null;

/** `Status:` set to `status`. */
const withStatus = (text: string, status: string) =>
  /^Status:.*$/m.test(text)
    ? text.replace(/^Status:.*$/m, `Status: ${status}`)
    : `Status: ${status}\n${text}`;

/** `extra` lines added under item `n`'s last line. */
function addUnder(text: string, n: number, extra: string[], replace?: RegExp): string {
  const parts = text.split(ITEM_SPLIT);
  const i = parts.findIndex((p) => p.startsWith(`**Q${n} — `));
  if (i < 0) throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
  const body = parts[i]!.trimEnd().split("\n");
  const kept = replace === undefined ? body : body.filter((l) => !replace.test(l));
  const trail = parts[i]!.slice(parts[i]!.trimEnd().length) || "\n\n";
  parts[i] = [...kept, ...extra].join("\n") + trail;
  return parts.join("");
}

/** The status a file's items leave it in. */
function statusOf(items: DecisionItem[]): "OPEN" | "ASSUMED" | "DECIDED" {
  if (items.some((i) => i.decision === null)) return "OPEN";
  return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
}

const today = () => new Date().toISOString().slice(0, 10);
const readText = (file: string) => {
  if (!fs.existsSync(file)) throw new CommandError(EXIT.USAGE, `${file} does not exist`);
  return fs.readFileSync(file, "utf-8");
};

/** `FID` and run/decision numbers from a `.../logs/{FID}/build-decision-{RUN}-{N}.md` path. */
function fileRef(file: string): { fid: string; ref: string } {
  const fid = path.basename(path.dirname(file));
  const m = /build-decision-(\d+)-(\d+)\.md$/.exec(file);
  return { fid, ref: m ? `run ${m[1]} decision ${m[2]}` : path.basename(file) };
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

// ---------------------------------------------------------------------------
// compose
// ---------------------------------------------------------------------------

interface ComposeOption {
  name: string;
  effect: string;
}

interface ComposeItem {
  title: string;
  question: string;
  options: ComposeOption[];
  recommended?: string;
  reason?: string;
  /** Set for a hard blocker: why no agent can settle it. No recommendation is written. */
  noRecommendation?: string;
}

interface BaseCheck {
  verdict: "all" | "some" | "none" | "unknown";
  reason: string | null;
  base: string | null;
  source: string | null;
  failing: number;
  baseRed: number;
  branch: number;
  undetermined: number;
  adopt: boolean;
}

/** The `bkit tests base` output, checked field by field; a bad file is a usage error naming it. */
function readBaseCheck(file: string): BaseCheck {
  const read = readJsonFile(file);
  if (!read.ok) throw new CommandError(EXIT.USAGE, `--base-check ${file} is missing or not JSON`);
  const o = read.value as Record<string, unknown> | null;
  const bad = (field: string, want: string) =>
    new CommandError(EXIT.USAGE, `--base-check ${file}: field "${field}" ${want}`);
  if (typeof o !== "object" || o === null || Array.isArray(o))
    throw new CommandError(EXIT.USAGE, `--base-check ${file} must hold a JSON object`);
  const verdict = o.verdict;
  if (verdict !== "all" && verdict !== "some" && verdict !== "none" && verdict !== "unknown")
    throw bad("verdict", "must be all, some, none or unknown");
  const { failing, baseRed, adopt } = o;
  const count = (k: string, fallback: number): number => {
    const v = o[k];
    if (v === undefined) return fallback;
    if (typeof v !== "number" || !Number.isFinite(v)) throw bad(k, "must be a number");
    return v;
  };
  if (typeof failing !== "number" || !Number.isFinite(failing))
    throw bad("failing", "must be a number");
  if (typeof baseRed !== "number" || !Number.isFinite(baseRed))
    throw bad("baseRed", "must be a number");
  if (typeof adopt !== "boolean") throw bad("adopt", "must be true or false");
  const text = (k: string): string | null => {
    const v = o[k];
    if (v === null) return null;
    if (typeof v !== "string") throw bad(k, "must be a string or null");
    return v;
  };
  return {
    verdict,
    reason: text("reason"),
    base: text("base"),
    source: text("source"),
    failing,
    baseRed,
    branch: count("branch", failing - baseRed),
    undetermined: count("undetermined", 0),
    adopt,
  };
}

/** The effect a bare fixed option name gets. */
const FIXED_EFFECTS: Record<string, string> = {
  Accept: "the item is recorded as accepted and the build moves on",
  "Fix now": "one more fix round runs before the build moves on",
  Stop: "the run ends here with a handover; the next run resumes here",
  "Try again": "one more fix round runs",
  Decide: "the questions below are asked instead of another round",
};

function composeItems(raw: unknown): ComposeItem[] {
  if (!Array.isArray(raw)) throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
  return raw.map((r, i) => {
    const o = (r ?? {}) as Record<string, unknown>;
    const s = (k: string) => (typeof o[k] === "string" ? oneLine(o[k] as string) : "");
    const rawOptions: unknown[] = Array.isArray(o.options) ? o.options : [];
    if (s("title") === "" || s("question") === "" || rawOptions.length === 0)
      throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
    if (rawOptions.length > MAX_OPTIONS)
      throw new CommandError(EXIT.USAGE, `item ${i + 1}: at most ${MAX_OPTIONS} options (A-Z)`);
    const options: ComposeOption[] = rawOptions.map((x, k) => {
      const bad = () =>
        new CommandError(
          EXIT.USAGE,
          `item ${i + 1} (Q${i + 1}): option ${letterAt(k)} needs a name and an effect`,
        );
      let name: string;
      let effect: string;
      if (typeof x === "string") {
        name = x.trim();
        const fixed = FIXED_EFFECTS[name];
        if (fixed === undefined) throw bad();
        effect = fixed;
      } else {
        const ob = (x ?? {}) as Record<string, unknown>;
        if (typeof ob.name !== "string" || typeof ob.effect !== "string") throw bad();
        name = oneLine(ob.name);
        effect = oneLine(ob.effect);
        if (name === "" || effect === "") throw bad();
      }
      if (name.includes("—"))
        throw new CommandError(
          EXIT.USAGE,
          `item ${i + 1} (Q${i + 1}): option name "${name}" must not contain a dash (—); put it in the effect`,
        );
      return { name, effect };
    });
    if (s("noRecommendation") === "" && !options.some((x) => x.name === s("recommended")))
      throw new CommandError(
        EXIT.USAGE,
        `item ${i + 1}: recommended must be one of its options, or set noRecommendation`,
      );
    return {
      title: s("title"),
      question: s("question"),
      options,
      recommended: s("recommended"),
      reason: s("reason"),
      noRecommendation: s("noRecommendation"),
    };
  });
}

const itemLines = (n: number, it: ComposeItem): string[] => {
  const rec = it.recommended ?? "";
  const names = it.options.map((o) => o.name);
  const letter = letterOf(names, rec);
  return [
    `**Q${n} — ${it.title}:** ${it.question}`,
    ...it.options.map((o, i) => `${letterAt(i)}) ${o.name} — ${o.effect}`),
    it.noRecommendation
      ? `Recommended: none — ${it.noRecommendation}`
      : `Recommended: ${letter === null ? rec : `${letter}) ${rec}`} — ${it.reason || "the orchestrator's call"}`,
    it.noRecommendation || letter === null
      ? "Default if unanswered: the run waits for you; the run stops when nobody can be asked"
      : `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
  ];
};

const fixed = (name: string): ComposeOption => ({ name, effect: FIXED_EFFECTS[name]! });

// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------

/** Each undecided item's recommendation written in; hard blockers left for the owner. */
export function applyRecommendations(
  text: string,
  runtime: string,
  why: "ask:false" | "headless",
): { text: string; applied: number[]; hardBlockers: number[]; loop: string | null } {
  const items = parseDecisionItems(text);
  const loopItem = items.find((i) => i.options.includes("Try again"));
  const loop = loopItem?.decision?.split(" — ")[0] ?? loopItem?.recommended ?? null;
  const applied: number[] = [];
  const hardBlockers: number[] = [];
  let out = text;
  for (const it of items) {
    if (it.decision !== null) continue;
    // `Try again` settles the loop alone; the items wait for the next round.
    if (it !== loopItem && loop === "Try again") continue;
    if (it.recommended === null) {
      hardBlockers.push(it.n);
      continue;
    }
    const line =
      it.recommended === "Accept"
        ? `Decision: Accept (assumed) — ${it.reason} (${why}, ${runtime}, ${today()})`
        : `Decision: ${it.recommended} — recommended; applied without asking (${runtime})`;
    out = addUnder(out, it.n, [line]);
    applied.push(it.n);
  }
  out = withStatus(out, statusOf(parseDecisionItems(out)));
  return { text: out, applied, hardBlockers, loop };
}

/** The `decision` row an owner's confirmation writes. */
function decisionRow(file: string, it: DecisionItem, reason: string): Record<string, unknown> {
  const { fid, ref } = fileRef(file);
  return {
    kind: "decision",
    key: `${slug(fid)}-accepted-${slug(it.title)}`,
    by: { workflow: "ship", step: "ship-confirm-decisions" },
    references: [fid, file],
    summary: `${fid}: ${it.title} accepted (${ref}, confirmed at ship)`,
    rationale: `accepted by owner: ${reason}`,
    status: "ACTIVE",
  };
}

/** The `deferral` row an unconfirmed assumed item becomes. */
function deferralRow(file: string, it: DecisionItem): Record<string, unknown> {
  const { fid, ref } = fileRef(file);
  const severity = /\b(CRITICAL|HIGH|MEDIUM|LOW)\b/.exec(it.text)?.[1] ?? "MEDIUM";
  return {
    kind: "deferral",
    key: `${slug(fid)}-assumed-${slug(it.title)}`,
    by: { workflow: "ship", step: "ship-confirm-decisions" },
    references: [fid, file],
    type: "issue",
    category: "other",
    severity,
    reason: "needs-decision",
    summary: `${fid}: ${it.title} accepted without the owner (${ref})`,
    description: `Decision needed: accept or fix "${it.title}". Options: ${letteredOptions(it.options)}. ${it.rejected ? "The owner rejected the assumed accept at ship." : "Nobody confirmed the assumed accept before the merge."} Item: ${it.text.split("\n")[0]}`,
    status: "OPEN",
  };
}

/** Every `build-decision-*.md` under `logDir`, in name order. */
function decisionFiles(logDir: string): string[] {
  return fs.existsSync(logDir)
    ? fs
        .readdirSync(logDir)
        .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((f) => path.join(logDir, f))
    : [];
}

const root = (cwd: string, flag: unknown) =>
  path.resolve(
    cwd,
    str(flag as string | undefined) ?? git(cwd, ["rev-parse", "--show-toplevel"]) ?? ".",
  );

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export const decisionsCommand: CommandSpec = {
  noun: "decisions",
  summary: "Build decision files: write questions, apply recommendations, list assumed items.",
  verbs: {
    compose: {
      summary: "Write a decision file in the one question layout, with loop progress when asked.",
      use: "workflow",
      flags: [
        { name: "out", type: "string", required: true, help: "the decision file to write" },
        {
          name: "header",
          type: "string",
          repeatable: true,
          help: "Key=Value header line (Status: OPEN is written first)",
        },
        {
          name: "items",
          type: "string",
          help: "JSON file: [{title, question, options: [{name, effect}], recommended, reason} | {…, noRecommendation}]",
        },
        {
          name: "loop",
          type: "string",
          help: "verify | holistic | tests: add the progress block and the loop question as Q1",
        },
        { name: "file", type: "string", help: "status.jsonl, with --loop" },
        { name: "group", type: "string", help: "with --loop=verify: the task group" },
        { name: "attempt", type: "string", help: "with --loop: the attempt just failed" },
        { name: "max", type: "string", help: "with --loop: the point's maxAttempts" },
        {
          name: "base-check",
          type: "string",
          help: "with --loop: the `bkit tests base` output JSON; adds the base-commit line and steers the recommendation",
        },
      ],
      output: {
        file: "the decision file written",
        questions: "number of questions",
        loopRecommended: "Try again | Decide (with --loop), else null",
      },
      run: (ctx) => {
        const out = path.resolve(ctx.cwd, String(ctx.flags.out));
        const headers = ((ctx.flags.header as string[] | undefined) ?? []).map((h) => {
          const eq = h.indexOf("=");
          if (eq <= 0) throw new CommandError(EXIT.USAGE, `--header ${h}: must be Key=Value`);
          return `${h.slice(0, eq)}: ${h.slice(eq + 1)}`;
        });
        let items: ComposeItem[] = [];
        if (ctx.flags.items !== undefined) {
          const read = readJsonFile(path.resolve(ctx.cwd, String(ctx.flags.items)));
          if (!read.ok) throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
          items = composeItems(read.value);
        }
        const baseFlag = str(ctx.flags.baseCheck);
        const baseCheck =
          baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
        const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
        let loopRecommended: string | null = null;
        const loopName = str(ctx.flags.loop);
        if (loopName !== undefined) {
          const loop = LOOPS[loopName];
          if (loop === undefined)
            throw new CommandError(EXIT.USAGE, "--loop must be verify, holistic or tests");
          if (ctx.flags.file === undefined)
            throw new CommandError(EXIT.USAGE, "--loop needs --file");
          const group = positiveInt(ctx.flags.group, "group");
          // A grouped gate counts only for a named group.
          const gate = loopGateStep(loop, group) === undefined ? undefined : loop.gate;
          const p = loopProgress(
            path.resolve(ctx.cwd, String(ctx.flags.file)),
            ctx.cwd,
            "build",
            loop.check,
            loop.fix,
            group,
            loop.sinceClean === true,
            gate,
          );
          const attempt = str(ctx.flags.attempt) ?? String(p.rounds.length);
          const max = str(ctx.flags.max) ?? "?";
          const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
          loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
          const attemptNum = Number(attempt);
          const maxNum = Number(max);
          const limitUsed =
            Number.isFinite(attemptNum) && Number.isFinite(maxNum) && attemptNum >= maxNum;
          const trendReason =
            p.trend === "unknown"
              ? limitUsed
                ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
                : `the counts cannot show whether the rounds helped (${p.trendLine})`
              : loopRecommended === "Try again"
                ? "the last round made progress"
                : "another round is unlikely to close the remaining items";
          let reason = trendReason;
          let baseLine: string[] = [];
          if (baseCheck !== undefined) {
            const b = baseCheck;
            const at = b.base ?? "unknown";
            baseLine = [
              b.verdict === "unknown"
                ? `Also red on base ${at}: can't tell (${b.reason ?? "no reason given"})`
                : `Also red on base ${at}: ${b.baseRed} of ${b.failing} (${b.source ?? "unknown"} run)`,
            ];
            if (b.verdict === "all") {
              loopRecommended = items.length > 0 ? "Decide" : "Stop";
              reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
            } else if (b.verdict === "some") {
              const unchecked =
                b.undetermined > 0
                  ? ` ${b.undetermined} could not be checked: ${b.reason ?? "no reason given"}.`
                  : "";
              reason = `a round can fix ${b.branch} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`.${unchecked} ${trendReason}`;
            } else if (b.verdict === "none") {
              reason = `the failures come from this branch, so a round can fix them. ${trendReason}`;
            } else {
              reason = `cause unknown: ${b.reason ?? "no reason given"}. ${trendReason}`;
            }
          }
          lines.push(
            `build ${loop.point}: attempt ${attempt} of ${max}`,
            "",
            "## Progress",
            "",
            `Problems after each round: ${p.counts || "none recorded"}`,
            ...(p.gateCounts === undefined
              ? []
              : [`${loop.gateTitle ?? "Gate"} failures after each round: ${p.gateCounts}`]),
            `Code changed: ${changed}`,
            `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`,
            `Minutes per round: ${p.minutesPerRound ?? "unknown"}`,
            `Trend: ${p.trend}`,
            ...baseLine,
            "",
            ...itemLines(1, {
              title: loop.title,
              question:
                loopRecommended === "Try again"
                  ? `another fix round? ${p.trendLine}`
                  : `decide the items below instead of another round? ${p.trendLine}`,
              options:
                items.length > 0
                  ? [fixed("Try again"), fixed("Decide")]
                  : [fixed("Try again"), fixed("Stop")],
              recommended:
                items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
              reason,
            }),
            "",
          );
          if (items.length === 0 && loopRecommended === "Decide") loopRecommended = "Stop";
        }
        const first = loopName === undefined ? 1 : 2;
        items.forEach((it, i) => lines.push(...itemLines(first + i, it), ""));
        const questionCount = items.length + (loopName === undefined ? 0 : 1);
        lines.push(
          'Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.',
        );
        if (questionCount >= 3) lines.push('Or say "one by one" and I\'ll ask them one at a time.');
        lines.push("");
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, lines.join("\n"), "utf-8");
        ctx.emit({
          file: path.relative(ctx.cwd, out),
          questions: items.length + (loopName === undefined ? 0 : 1),
          loopRecommended,
        });
        return EXIT.OK;
      },
    },
    apply: {
      summary:
        "Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item.",
      use: "workflow",
      flags: [
        { name: "file", type: "string", required: true, help: "the decision file" },
        { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
        { name: "q", type: "string", help: "--by=owner: the question number" },
        { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
        { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
        { name: "reason", type: "string", help: "--by=owner: the owner's words" },
        {
          name: "root",
          type: "string",
          help: "--by=owner: the checkout the ledgers live in (default: the repo top)",
        },
      ],
      output: {
        status: "the file's Status after the call: OPEN | ASSUMED | DECIDED",
        applied: "--by=headless: question numbers settled on their recommendation",
        hardBlockers: "--by=headless: question numbers with no recommendation, left for the owner",
        loop: "--by=headless: the loop answer (Try again | Decide | Stop), or null",
        fixNow: "--by=headless: question numbers settled as Fix now",
        decisionKey: "--by=owner --confirm: key of the decision row written",
      },
      exitCodes: {
        [EXIT_HARD_BLOCKERS]:
          "--by=headless: hard blockers remain (headless → Failure Path; a session asks them)",
      },
      run: (ctx) => {
        const file = path.resolve(ctx.cwd, String(ctx.flags.file));
        const text = readText(file);
        const by = String(ctx.flags.by);
        if (by === "headless") {
          const runtime = classifyAt(ctx.cwd);
          const r = applyRecommendations(
            text,
            runtime,
            runtime === "GITHUB_ACTION" ? "headless" : "ask:false",
          );
          fs.writeFileSync(file, r.text, "utf-8");
          const after = parseDecisionItems(r.text);
          ctx.emit({
            status: /^Status:[ \t]*(\S+)/m.exec(r.text)?.[1] ?? "OPEN",
            applied: r.applied,
            hardBlockers: r.hardBlockers,
            loop: r.loop,
            fixNow: after.filter((i) => i.decision?.startsWith("Fix now")).map((i) => i.n),
          });
          if (r.hardBlockers.length > 0)
            ctx.log(`hard blockers need the owner: Q${r.hardBlockers.join(", Q")}`);
          return r.hardBlockers.length > 0 ? EXIT_HARD_BLOCKERS : EXIT.OK;
        }
        if (by === "rerun") {
          const name = path.basename(file);
          if (!/^Gate:[ \t]*FAIL\b/m.test(text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? ""))
            throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
          const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
          if (status !== "OPEN")
            throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
          const { hasLoop, undecided } = undecidedBesidesLoop(text);
          if (!hasLoop)
            throw new CommandError(
              EXIT.USAGE,
              `${name}: Q1 is not the loop question (no ## Progress block), so a re-run cannot answer it; undecided: ${undecided.join(", ") || "none"}`,
            );
          if (undecided.length > 0)
            throw new CommandError(
              EXIT.USAGE,
              `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`,
            );
          const out = withStatus(
            addUnder(text, 1, [
              `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
            ]),
            "DECIDED",
          );
          fs.writeFileSync(file, out, "utf-8");
          ctx.emit({ status: "DECIDED" });
          return EXIT.OK;
        }
        if (by !== "owner")
          throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
        const n = positiveInt(ctx.flags.q, "q");
        const reason = str(ctx.flags.reason);
        if (
          n === undefined ||
          reason === undefined ||
          (ctx.flags.confirm === true) === (ctx.flags.reject === true)
        )
          throw new CommandError(
            EXIT.USAGE,
            "--by=owner needs --q, --reason and one of --confirm / --reject",
          );
        const it = parseDecisionItems(text).find((i) => i.n === n);
        if (it === undefined || !it.assumed)
          throw new CommandError(
            EXIT.USAGE,
            `Q${n} is not an assumed Accept in ${path.basename(file)}`,
          );
        let out: string;
        let decisionKey: string | null = null;
        if (ctx.flags.confirm === true) {
          const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
          appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
          decisionKey = String(row.key);
          out = addUnder(
            text,
            n,
            [`Decision: Accept — ${reason} (owner, confirmed at ship, ${today()})`],
            /^(Decision|Rejected):/,
          );
        } else {
          out = addUnder(text, n, [`Rejected: ${reason} (owner, ${today()})`], /^Rejected:/);
        }
        out = withStatus(out, statusOf(parseDecisionItems(out)));
        fs.writeFileSync(file, out, "utf-8");
        ctx.emit({ status: /^Status:[ \t]*(\S+)/m.exec(out)?.[1] ?? "OPEN", decisionKey });
        return EXIT.OK;
      },
    },
    skip: {
      summary:
        "Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails.",
      use: "workflow",
      flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
      output: {
        route: "continue when every condition holds, else null",
        problem:
          "null, or the first fact that fails: From not verify or holistic, an item not Accept or Accept (assumed), the loop question not Decide, a Gate: FAIL header, or a Source changed header missing or not false",
      },
      run: (ctx) => {
        const file = path.resolve(ctx.cwd, String(ctx.flags.file));
        const read = readTextFile(file);
        if (!read.ok) throw new CommandError(EXIT.USAGE, `${file} is missing or unreadable`);
        const problem = skipProblem(read.text);
        if (problem !== null) ctx.log(`${path.basename(file)}: ${problem}`);
        ctx.emit({ route: problem === null ? "continue" : null, problem });
        return problem === null ? EXIT.OK : EXIT.NO;
      },
    },
    pending: {
      summary:
        "List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item.",
      use: "workflow",
      flags: [
        { name: "fid", type: "string", required: true, help: "feature id" },
        { name: "month", type: "string", required: true, help: "YYYYMM of the feature's logs" },
        {
          name: "root",
          type: "string",
          help: "the checkout the plans and ledgers live in (default: the repo top)",
        },
        {
          name: "defer",
          type: "boolean",
          help: "write a deferral row per listed item and mark it Deferred",
        },
      ],
      output: {
        items: "[{file, q, title, reason, state: pending|rejected}]",
        count: "items listed",
        deferred: "--defer: deferral keys written",
      },
      run: (ctx) => {
        const top = root(ctx.cwd, ctx.flags.root);
        const month = String(ctx.flags.month);
        if (!/^[0-9]{6}$/.test(month)) throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
        const logDir = path.join(top, "docs", "plans", month, "logs", String(ctx.flags.fid));
        const items: Record<string, unknown>[] = [];
        const rows: Record<string, unknown>[] = [];
        for (const abs of decisionFiles(logDir)) {
          const rel = path.relative(top, abs);
          let text = fs.readFileSync(abs, "utf-8");
          for (const it of parseDecisionItems(text)) {
            if (!it.assumed || it.deferred) continue;
            items.push({
              file: rel,
              q: it.n,
              title: it.title,
              reason: it.reason,
              state: it.rejected ? "rejected" : "pending",
            });
            if (ctx.flags.defer === true) {
              rows.push(deferralRow(rel, it));
              text = addUnder(text, it.n, [`Deferred: needs-decision (${today()})`]);
            }
          }
          if (ctx.flags.defer === true) {
            text = withStatus(text, statusOf(parseDecisionItems(text)));
            fs.writeFileSync(abs, text, "utf-8");
          }
        }
        const deferred = rows.length > 0 ? appendLedgerRows(top, "deferrals", rows).keys : [];
        ctx.emit({ items, count: items.length, deferred });
        return EXIT.OK;
      },
    },
  },
};
