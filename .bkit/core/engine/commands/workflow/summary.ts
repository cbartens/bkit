// The summary a phase workflow writes at its Summary step (`bkit workflows summary`):
// verdict, reasons and the recommended next command, from the run's status rows,
// its log files, the plan and the ledger rows it added. Pure: the caller reads the
// disk and passes `read` for the log files.

import { coversList, type Plan, type Workstream } from "./plans.js";
import { issueIdOf, type FidTracker } from "./fids.js";
import { parseDecisionItems } from "./decisions.js";
import { parsePlanBlocks } from "./plan-blocks.js";

export const SUMMARY_WORKFLOWS = ["plan", "design", "build", "debug", "ship"] as const;
export type SummaryWorkflow = (typeof SUMMARY_WORKFLOWS)[number];
export type SummaryVerdict = "PASS" | "CONCERNS" | "FAIL";

/** A next step: a command (followed by the ref), an alternative command, or a fixed line. */
export interface NextStep {
  command?: string;
  or?: string;
  line?: string;
}

/** Per workflow and verdict, the next command the summary recommends. */
export const NEXT_STEP: Readonly<Record<SummaryWorkflow, Record<SummaryVerdict, NextStep>>> = {
  plan: {
    PASS: { command: "/bkit-build" },
    CONCERNS: { command: "/bkit-build", or: "/bkit-plan" },
    FAIL: { command: "/bkit-plan" },
  },
  design: {
    PASS: { command: "/bkit-plan" },
    CONCERNS: { command: "/bkit-plan", or: "/bkit-design" },
    FAIL: { command: "/bkit-design" },
  },
  debug: {
    PASS: { command: "/bkit-ship" },
    CONCERNS: { command: "/bkit-ship", or: "/bkit-debug" },
    FAIL: { line: "Manual handover — no bkit command; see the debug handover." },
  },
  build: {
    PASS: { command: "/bkit-ship" },
    CONCERNS: { command: "/bkit-ship" },
    FAIL: { command: "/bkit-debug" },
  },
  ship: {
    PASS: { line: "No further bkit command — feature shipped." },
    CONCERNS: { line: "No further bkit command — feature shipped." },
    FAIL: { command: "/bkit-ship" },
  },
};

/**
 * The issue reference a FID carries: `160-slug` → `#160`, `abc-123-slug` →
 * `ABC-123`; undefined when the FID has no issue segment for `tracker`.
 */
export function refOf(fid: string, tracker: FidTracker = "any"): string | undefined {
  const id = issueIdOf(fid, tracker);
  if (id === null) return undefined;
  return /^[0-9]+$/.test(id) ? `#${id}` : id;
}

/**
 * A step whose FAIL a later, non-FAIL step of the same workflow (and the same plan
 * group, when the failed row has one) answers; the run carried on past it. A build
 * challenge is answered by its fix tasks running (`build-plan-execute`) or by a
 * Decision Pause (`build-decision`); a group's execute by that group's verify, which
 * judges the group's work after the executor and after any Decision Pause on it.
 */
const ANSWERED_BY: Readonly<Record<string, readonly string[]>> = {
  "plan/plan-review": ["plan-apply-review"],
  "design/design-review": ["design-apply-review"],
  "design/design-spike": ["design-apply-review"],
  "build/build-challenge": ["build-plan-execute", "build-decision"],
  "build/build-plan-execute": ["build-plan-verify"],
};

const RUN_TESTS = new Set(["build-run-tests", "debug-run-tests"]);
const SEVERITY = /\*\*Severity:\*\*\s*(CRITICAL|HIGH|MEDIUM|LOW)\b/;
const TEST_EXCEPTION = "**TEST EXCEPTION:**";

type Row = Record<string, unknown>;

export interface SummaryInput {
  workflow: SummaryWorkflow;
  fid: string;
  /** `refOf(fid)`; undefined = no tracker reference. */
  ref?: string;
  /** This run's status rows, in `at` order. */
  rows: Row[];
  /** The plan files the run worked from, repo-relative path and text. */
  plans: Array<{ path: string; text: string }>;
  /** Deferral rows this workflow added since the run started. */
  deferrals: Row[];
  /** Distinct deferral keys this workflow added since the run started. */
  deferralsAdded: number;
  /** build and ship: every `build-decision-*.md` in the log folder, repo-relative. */
  decisionFiles: string[];
  /** A repo-relative file's text, or null when it is missing. */
  read: (rel: string) => string | null;
  /** design: the workstreams `plans parse` reads from the organised design. */
  workstreams?: Workstream[];
  /** design: the plans `plans parse` reads from the organised design. */
  suggestedPlans?: Plan[];
  /** design: the organised design's text; its `## Risks & Open Questions` becomes `## Open Questions`. */
  organised?: string;
  /** ship: the PR's size; absent when `gh` could not read it. */
  pr?: { number: number; additions: number; deletions: number; changedFiles: number };
}

export interface Summary {
  verdict: SummaryVerdict;
  failures: number;
  reasons: string[];
  nextStep: string;
  markdown: string;
}

interface StepGroup {
  label: string;
  key: string;
  step: string;
  rows: Array<{ row: Row; index: number }>;
}

const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const artifactsOf = (r: Row) =>
  Array.isArray(r.artifacts) ? r.artifacts.filter((a): a is string => typeof a === "string") : [];
/** A step row's task group (`group`, or debug's `subPlan`); undefined when it has none. */
const taskGroupOf = (r: Row) => {
  const taskGroup = r.group ?? r.subPlan;
  return typeof taskGroup === "number" ? taskGroup : undefined;
};

/** The run's step rows grouped per step (and task group), in first-seen order. */
function stepGroups(rows: Row[]): StepGroup[] {
  const groups = new Map<string, StepGroup>();
  rows.forEach((row, index) => {
    const step = str(row.step);
    if (row.type !== "step-done" || step === undefined) return;
    const sub = taskGroupOf(row);
    const key = sub === undefined ? step : `${step}#${sub}`;
    const g = groups.get(key) ?? {
      label: sub === undefined ? step : `${step} (group ${sub})`,
      key,
      step,
      rows: [],
    };
    g.rows.push({ row, index });
    groups.set(key, g);
  });
  return [...groups.values()];
}

const lastOf = (g: StepGroup) => g.rows.at(-1)!;

/** A level-2 section whose heading matches `title`, minus the template's non-content subsections. */
function planSection(text: string, title: RegExp): string | undefined {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /^## /.test(l) && title.test(l));
  if (start < 0) return undefined;
  const out: string[] = [];
  let skip = false;
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break;
    if (/^### /.test(line)) skip = /Derived Test Matrix|Human Confirmation/.test(line);
    if (!skip) out.push(line);
  }
  return out.join("\n").trim();
}

export function buildSummary(input: SummaryInput): Summary {
  const { workflow } = input;
  const groups = stepGroups(input.rows);
  const fails: string[] = [];
  const concerns: string[] = [];
  const read = (rel: string) => input.read(rel);

  // Debug: a reproduce step that could not reproduce is a re-run, not a failure.
  const reproduce = groups.find((g) => g.step === "debug-failure-reproduce");
  const reproText = reproduce ? read(artifactsOf(lastOf(reproduce).row)[0] ?? "") : null;
  const notReproduced = reproText !== null && /^Reproduced:\s*NO\b/m.test(reproText);
  if (notReproduced) concerns.push("Reproduced: NO");

  // Plan tasks: every unticked task of the plan files; a build always has a plan.
  const tasks = input.plans.flatMap((p) =>
    parsePlanBlocks(p.text).tasks.map((t) => ({ ...t, path: p.path })),
  );
  if (workflow === "build" && input.plans.length === 0) fails.push("No plan file");
  if (workflow === "build")
    for (const t of tasks.filter((x) => !x.done)) {
      const sev = SEVERITY.exec(t.text)?.[1];
      fails.push(
        `Task ${t.task} not done (${t.path})${sev === undefined ? "" : ` — ${sev} challenge finding`}`,
      );
    }

  for (const g of groups) {
    const { row, index } = lastOf(g);
    if (RUN_TESTS.has(g.step)) {
      if (row.verdict === "FAIL") fails.push(`${g.label} FAIL`);
      continue;
    }
    if (row.verdict === "CONCERNS") concerns.push(`${g.label} CONCERNS`);
    if (row.verdict !== "FAIL") continue;
    if (g.step === "debug-failure-reproduce" && notReproduced) continue;
    const answers = ANSWERED_BY[`${workflow}/${g.step}`] ?? [];
    const sub = taskGroupOf(row);
    const answeredBy = input.rows.find(
      (r, i) =>
        i > index &&
        r.type === "step-done" &&
        answers.includes(String(r.step)) &&
        r.verdict !== "FAIL" &&
        (sub === undefined || taskGroupOf(r) === sub),
    )?.step;
    if (answeredBy !== undefined)
      concerns.push(`${g.label} FAIL, answered by ${String(answeredBy)}`);
    else fails.push(`${g.label} FAIL`);
  }

  // The Decision Pause: accepted items in this run's decision files.
  const decided = groups
    .filter((g) => g.step === "build-decision")
    .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)));
  const acceptItems = decided.flatMap((rel) =>
    parseDecisionItems(read(rel) ?? "")
      .filter((i) => /^Accept\b/.test(i.decision ?? ""))
      .map((i) => ({ assumed: i.assumed, line: `${rel}: Decision: ${i.decision}` })),
  );
  // `Accept (assumed)`: taken without the owner (`ask: false` or headless); ship asks to confirm.
  const assumed = acceptItems.filter((a) => a.assumed).map((a) => a.line);
  const accepted = acceptItems.filter((a) => !a.assumed).map((a) => a.line);
  if (accepted.length > 0)
    concerns.push(`${accepted.length} item(s) accepted at the Decision Pause`);
  if (assumed.length > 0)
    concerns.push(
      `${assumed.length} item(s) accepted without the owner (assumed; ship asks to confirm)`,
    );
  // Ship: assumed Accepts the owner rejected or never confirmed; ship merged anyway.
  const unconfirmed =
    workflow === "ship"
      ? input.decisionFiles.flatMap((rel) =>
          parseDecisionItems(read(rel) ?? "")
            .filter((i) => i.assumed)
            .map((i) => `\`${rel}\` Q${i.n} — ${i.title}${i.rejected ? " (rejected)" : ""}`),
        )
      : [];
  if (unconfirmed.length > 0)
    concerns.push(`shipped with ${unconfirmed.length} assumed item(s) the owner did not confirm`);
  if (input.deferralsAdded > 0)
    concerns.push(`${input.deferralsAdded} deferral(s) written this run`);

  const verdict: SummaryVerdict =
    fails.length > 0 ? "FAIL" : concerns.length > 0 ? "CONCERNS" : "PASS";
  const reasons = [...fails, ...concerns];

  // Next step.
  const step = NEXT_STEP[workflow][verdict];
  const withRef = (cmd: string) => (input.ref === undefined ? cmd : `${cmd} ${input.ref}`);
  let nextStep = step.command === undefined ? (step.line ?? "") : withRef(step.command);
  if (workflow === "debug" && notReproduced) nextStep = `${withRef("/bkit-debug")} [repro]`;
  const suggested = input.suggestedPlans ?? [];
  if (workflow === "design" && step.command === "/bkit-plan" && suggested.length > 1)
    nextStep = "File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>";

  // Sections.
  const out: string[] = [
    `Verdict: ${verdict}`,
    `Failures: ${fails.length}`,
    "<!-- verdict:end -->",
    "",
    `# ${workflow[0]!.toUpperCase()}${workflow.slice(1)} Summary`,
    "",
    "## Verdict",
    "",
    verdict,
    "",
    ...(reasons.length > 0
      ? reasons.map((r) => `- ${r}`)
      : ["- No failing step, open task, accepted item or new deferral."]),
  ];
  if (workflow === "build")
    out.push(
      "",
      input.plans.length === 0
        ? "Plan tasks: no plan file."
        : `Plan tasks: ${tasks.filter((t) => t.done).length} of ${tasks.length} ticked in ${input.plans.map((p) => `\`${p.path}\``).join(", ")}.`,
    );

  out.push(
    "",
    "## Steps",
    "",
    "| Step | Verdict | Failures | Attempts | Artifact |",
    "| --- | --- | --- | --- | --- |",
  );
  for (const g of groups) {
    const { row } = lastOf(g);
    const artifact = artifactsOf(row)
      .map((a) => `\`${a}\``)
      .join(", ");
    out.push(
      `| ${g.label} | ${str(row.verdict) ?? "-"} | ${typeof row.failures === "number" ? row.failures : "-"} | ${g.rows.length} | ${artifact || "-"} |`,
    );
  }

  if (workflow === "build") {
    const appended = tasks.filter((t) => SEVERITY.test(t.text));
    const low = input.deferrals.filter(
      (r) => (r.by as Row | undefined)?.step === "build-challenge",
    );
    const gate = input.rows.filter((r) => r.type === "challenge-gate").at(-1);
    const skipped = gate?.skipped === true;
    out.push("", "## Challenge", "");
    if (skipped)
      out.push(
        `- challenge-1 skipped: small change (${String(gate.linesChanged)} lines, ${String(gate.filesChanged)} files)`,
      );
    if (appended.length === 0 && low.length === 0 && !skipped) out.push("None");
    for (const t of appended)
      out.push(
        `- Task ${t.task} — ${SEVERITY.exec(t.text)![1]} — ${t.done ? "ticked" : "not ticked"} (\`${t.path}\`)`,
      );
    for (const r of low)
      out.push(`- LOW, deferred: ${String(r.key ?? "")} — ${String(r.description ?? "")}`);
  }

  if (workflow === "build" || workflow === "debug") {
    const runs = groups.filter((g) => RUN_TESTS.has(g.step)).flatMap((g) => g.rows);
    out.push("", "## Tests", "");
    if (runs.length === 0) out.push("None recorded.");
    for (const { row } of runs)
      out.push(
        `- Attempt ${String(row.attempt ?? "?")}: ${str(row.verdict) ?? "-"}, failures ${typeof row.failures === "number" ? row.failures : "-"}, ran \`${str(row.scope) ?? "unknown"}\``,
      );
  }

  if (workflow === "plan") {
    const final = input.plans.at(-1)?.text ?? "";
    out.push(
      "",
      "## Acceptance Scenario",
      "",
      planSection(final, /Acceptance Scenario/) || "None",
      "",
      "## Open Questions",
      "",
      planSection(final, /Open Questions/) || "None",
    );
  }

  if (workflow === "design") {
    out.push("", "## Suggested Plans", "");
    if (suggested.length === 0) out.push("None");
    for (const p of suggested)
      out.push(
        `### ${p.id}: ${p.name}`,
        "",
        `Covers: ${coversList(p, input.workstreams ?? []) || "None"}`,
        `Requires: ${p.requiresText || "None"}`,
        "",
      );
    out.push(
      "",
      "## Open Questions",
      "",
      planSection(input.organised ?? "", /Risks & Open Questions/) || "None",
    );
  }

  if (workflow === "ship" && input.pr !== undefined) {
    const pr = input.pr;
    out.push(
      "",
      "## Pull Request",
      "",
      `PR #${pr.number}: +${pr.additions} / -${pr.deletions} lines across ${pr.changedFiles} files.`,
    );
  }
  if (unconfirmed.length > 0)
    out.push(
      "",
      "## Ship Completed with Assumed Items",
      "",
      "Accepted without the owner and not confirmed; each is a `needs-decision` deferral.",
      "",
      ...unconfirmed.map((u) => `- ${u}`),
    );

  // Risks and action items.
  const items: string[] = [];
  for (const g of groups) {
    for (const rel of artifactsOf(lastOf(g).row).filter((a) => a.endsWith("-log.md"))) {
      for (const line of (read(rel) ?? "").split("\n").filter((l) => /^BLOCKED\b/.test(l)))
        items.push(`- ${line} (\`${rel}\`)`);
    }
  }
  items.push(...accepted.map((a) => `- Accepted: ${a}`));
  items.push(...assumed.map((a) => `- Assumed, not confirmed: ${a}`));
  for (const rel of workflow === "build" ? input.decisionFiles : []) {
    if (!/^Decision:/m.test(read(rel) ?? "")) items.push(`- \`${rel}\`: no decision recorded`);
  }
  for (const p of input.plans) {
    for (const line of p.text.split("\n").filter((l) => l.includes(TEST_EXCEPTION)))
      items.push(`- \`${p.path}\`: ${line.trim()}`);
  }
  out.push("", "## Risks and Action Items", "", ...(items.length > 0 ? items : ["None"]));

  out.push("", "## Recommended Next Step", "", "```text", nextStep, "```");
  if (step.or !== undefined && !notReproduced)
    out.push("", `Or, to address the reasons first: \`${withRef(step.or)}\``);

  return { verdict, failures: fails.length, reasons, nextStep, markdown: `${out.join("\n")}\n` };
}
