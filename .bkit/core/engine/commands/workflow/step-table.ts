// The ordered steps of each workflow, and where a stopped run resumes.
//
// `bkit status resume` folds the active run and names the step to continue at.
// The rule: take the run's last DONE row for a step this table knows (rows for
// steps a workflow no longer has are ignored, except the retired steps mapped
// below, and Decision Pause rows that record their route), skip the setup steps
// (1-2 run again on every resume), and resume at the
// step after it — or at its `resumeOnVerdict` entry for the row's verdict, or its
// `resumeAt`, for a step whose next step depends on a verdict or that loops back. `workflow-shape.test.ts` holds this table to the
// workflows' `## Step N — Title` headings and `--step=` calls.

import type { WorkflowRun } from "../../ledgers/status.js";
import { CONFIG_DEFAULTS } from "../../shared/settings.js";

/** One row-writing step of a workflow, or a numbered step that writes no row (`step` absent). */
export interface WorkflowStep {
  /** The `--step=` its status row carries. */
  step?: string;
  number: number;
  /** The step heading's title, after `Step N — `. */
  title: string;
  /** Steps 1-2: run again on every resume, so their rows place no resume point. */
  setup?: true;
  /** The step a run whose last DONE row is this one resumes at, when not the next step. */
  resumeAt?: string;
  /** The step a run resumes at when this DONE row's `verdict` is a key here, before `resumeAt`. */
  resumeOnVerdict?: Readonly<Record<string, string>>;
}

export type ResumableWorkflow = "plan" | "design" | "build" | "debug" | "ship";

export const WORKFLOW_STEPS: Readonly<Record<ResumableWorkflow, readonly WorkflowStep[]>> = {
  plan: [
    { step: "plan-start-workflow", number: 1, title: "Start Workflow", setup: true },
    { step: "plan-worktree-setup", number: 2, title: "Worktree Setup", setup: true },
    { step: "plan-generate", number: 3, title: "Generate Plan" },
    { step: "plan-fetch-context", number: 4, title: "Fetch Context" },
    { step: "plan-review", number: 5, title: "Review Plan" },
    { step: "plan-apply-review", number: 6, title: "Apply Review" },
    { step: "plan-summary", number: 7, title: "Summary" },
    { step: "plan-close-workflow", number: 8, title: "Close Workflow" },
  ],
  design: [
    { step: "design-start-workflow", number: 1, title: "Start Workflow", setup: true },
    { step: "design-worktree-setup", number: 2, title: "Worktree Setup", setup: true },
    { step: "design-grill", number: 3, title: "Grill" },
    { step: "design-brainstorm-ideate", number: 4, title: "Brainstorm & Ideate" },
    { step: "design-generate", number: 5, title: "Generate Design" },
    { step: "design-review", number: 6, title: "Design Review" },
    { step: "design-spike", number: 7, title: "Spike" },
    { step: "design-apply-review", number: 8, title: "Apply Review" },
    { step: "design-organise", number: 9, title: "Design Organise" },
    { step: "design-summary", number: 10, title: "Summary" },
    { step: "design-workstream-suggest", number: 11, title: "Suggest Plans" },
    { step: "design-close-workflow", number: 12, title: "Close Workflow" },
  ],
  build: [
    { step: "build-start-workflow", number: 1, title: "Start Workflow", setup: true },
    { step: "build-worktree-setup", number: 2, title: "Worktree Setup", setup: true },
    { step: "build-branch-sync", number: 3, title: "Branch Sync" },
    // A converted plan is checked again: Step 4 runs its plan check once more.
    {
      step: "build-plan-convert",
      number: 4,
      title: "Plan Convert",
      resumeAt: "build-plan-convert",
    },
    { step: "build-plan-current", number: 5, title: "Plan Current" },
    { step: "build-install-skills", number: 6, title: "Install Skills" },
    // A group's start commit is recorded before its execute runs: Step 7 again.
    {
      step: "build-group-start",
      number: 7,
      title: "Plan Execute",
      resumeAt: "build-plan-execute",
    },
    // A handover stops a group part-done: Step 7 runs again with a fresh brief.
    {
      step: "build-plan-execute",
      number: 7,
      title: "Plan Execute",
      resumeOnVerdict: { HANDOVER: "build-plan-execute" },
    },
    // Verify, its group gate and the gaps fix route on the verify verdict: Step 8 again.
    { step: "build-plan-verify", number: 8, title: "Plan Verify", resumeAt: "build-plan-verify" },
    { step: "build-group-gate", number: 8, title: "Plan Verify", resumeAt: "build-plan-verify" },
    {
      step: "build-plan-gaps-remediate",
      number: 9,
      title: "Plan Gaps Remediate",
      resumeAt: "build-plan-verify",
    },
    { step: "build-plan-verify-holistic", number: 10, title: "Plan Verify Holistic" },
    // The reports are written: Step 11 continues at `bkit challenge merge`.
    { step: "build-challenge", number: 11, title: "Build Challenge", resumeAt: "build-challenge" },
    // Run Tests routes on its own verdict, and a fix loops back to it.
    { step: "build-run-tests", number: 12, title: "Run Tests", resumeAt: "build-run-tests" },
    { step: "build-failure-diagnose", number: 13, title: "Failure Diagnose" },
    {
      step: "build-failure-remediate",
      number: 14,
      title: "Failure Remediate",
      resumeAt: "build-run-tests",
    },
    { step: "build-summary", number: 15, title: "Summary" },
    { step: "build-create-pr", number: 16, title: "Close Workflow & Create PR" },
    { step: "build-close-workflow", number: 16, title: "Close Workflow & Create PR" },
  ],
  debug: [
    { step: "debug-start-workflow", number: 1, title: "Start Workflow", setup: true },
    { step: "debug-worktree-setup", number: 2, title: "Worktree Setup", setup: true },
    // Run Tests routes on its own verdict, and every fix loops back to it.
    { step: "debug-run-tests", number: 3, title: "Run Tests", resumeAt: "debug-run-tests" },
    { step: "context-fetch", number: 4, title: "Fetch Context" },
    { step: "debug-failure-reproduce", number: 5, title: "Failure Reproduce" },
    { step: "debug-failure-diagnose", number: 6, title: "Failure Diagnose" },
    {
      step: "debug-failure-remediate",
      number: 7,
      title: "Failure Remediate",
      resumeAt: "debug-run-tests",
    },
    {
      step: "debug-failure-soak",
      number: 8,
      title: "Failure Remediate Soak",
      resumeAt: "debug-run-tests",
    },
    { step: "debug-push-remediation", number: 9, title: "Push Remediation" },
    { step: "debug-summary", number: 10, title: "Summary" },
    { step: "debug-create-pr", number: 11, title: "Close Workflow" },
    { step: "debug-close-workflow", number: 11, title: "Close Workflow" },
  ],
  ship: [
    { step: "ship-start-workflow", number: 1, title: "Start Workflow", setup: true },
    {
      step: "ship-worktree-setup",
      number: 2,
      title: "Verify PR (Worktree Setup + Regression Guard)",
      setup: true,
    },
    {
      step: "ship-regression-guard",
      number: 2,
      title: "Verify PR (Worktree Setup + Regression Guard)",
      setup: true,
    },
    { number: 3, title: "Base Check" },
    { step: "ship-conflict-resolve", number: 4, title: "Integrate (Path B only)" },
    { step: "ship-deferred-sweep", number: 5, title: "Deferred Sweep" },
    // Docs and summary are one step: the summary half still has to run.
    {
      step: "ship-update-docs",
      number: 6,
      title: "Update Docs & Summary",
      resumeAt: "ship-summary",
    },
    { step: "ship-summary", number: 6, title: "Update Docs & Summary" },
    { step: "ship-prune-skills", number: 7, title: "Prune Skills" },
    { step: "ship-bookkeeping-push", number: 8, title: "Commit + Push Bookkeeping" },
    { number: 9, title: "Re-validate" },
    // The merge gate reads the PR state again: a merged PR goes on to Step 13.
    {
      step: "ship-merge-pr",
      number: 10,
      title: "Merge Gate + Merge PR",
      resumeAt: "ship-merge-pr",
    },
    { step: "ship-failure-diagnose", number: 11, title: "Failure Diagnose" },
    // A PASS fix is committed and pushed at Step 12 sub-step 4 (a re-run commits nothing
    // new), then re-validated at Step 9; any other verdict re-reads the PR at Step 10.
    {
      step: "ship-failure-remediate",
      number: 12,
      title: "Failure Remediate",
      resumeAt: "ship-merge-pr",
      resumeOnVerdict: { PASS: "ship-failure-remediate" },
    },
    { step: "ship-switch-to-dev", number: 13, title: "Update Local Dev" },
    { step: "ship-close-workflow", number: 14, title: "Close Workflow" },
  ],
};

/**
 * Rows of steps a workflow no longer has that still place a resume point: the
 * old build challenge steps ran after the reports, so a run stopped in them
 * resumes at Run Tests.
 */
export const RETIRED_STEPS: Readonly<Partial<Record<ResumableWorkflow, Record<string, string>>>> = {
  build: {
    "build-challenge-reconcile": "build-run-tests",
    "build-challenge-remediate": "build-run-tests",
    "build-challenge-tests": "build-run-tests",
  },
};

/**
 * Decision Pause rows (`build-decision`, no step number) that place a resume point: the
 * row's `route` names the step the decision sent the run to, either directly or keyed on
 * the step of the last non-decision row before it (the loop the pause came from). A row
 * without a known `route`, or a keyed route with no matching prior row, places none.
 */
export const DECISION_ROUTES: Readonly<
  Partial<
    Record<
      ResumableWorkflow,
      { step: string; routes: Record<string, string | Readonly<Record<string, string>>> }
    >
  >
> = {
  build: {
    step: "build-decision",
    routes: {
      fix: "build-plan-execute",
      verify: "build-plan-verify",
      tests: "build-run-tests",
      // Try again: a verify loop goes on to its gaps fix (Step 9), a tests loop to Step 13.
      retry: {
        "build-plan-verify": "build-plan-gaps-remediate",
        "build-group-gate": "build-plan-gaps-remediate",
        "build-run-tests": "build-failure-diagnose",
      },
    },
  },
};

export const isResumable = (w: string): w is ResumableWorkflow => w in WORKFLOW_STEPS;

export interface ResumePoint {
  /** The step to continue at: its row name (null for a step that writes no row), number and title. */
  step: string | null;
  number: number;
  title: string;
  /** The DONE row that placed the point, or null when none did (resume at Step 1). */
  after: string | null;
  /** That row's task group, or null. */
  group: number | null;
  /** Whether the latest run is this workflow, still IN_PROGRESS. */
  active: boolean;
  /** Build only (null otherwise): the round Step 11's challenge runs as — see `challengeRound`. */
  challengeRound: number | null;
  /** Build only (null otherwise): the last allowed round has merged, so Step 11 goes on to Step 12. */
  challengeDone: boolean | null;
}

const CHALLENGE_ROUTES = new Set(["build-plan-execute", "build-decision", "build-run-tests"]);
const roundOf = (s: WorkflowRun["steps"][number]): number => {
  const round = Number((s as { round?: unknown }).round);
  return Number.isInteger(round) && round >= 1 ? round : 1;
};

/** The run's DONE `build-challenge` rows and the route rows after them, in order. */
const challengeRows = (steps: WorkflowRun["steps"]) =>
  steps.filter(
    (s) => s.status === "DONE" && (s.step === "build-challenge" || CHALLENGE_ROUTES.has(s.step)),
  );

/** Whether a challenge row at round `max` or later has a route row after it: no round is left. */
function challengeDone(steps: WorkflowRun["steps"], max: number): boolean {
  const rows = challengeRows(steps);
  return rows.some(
    (s, i) => s.step === "build-challenge" && roundOf(s) >= max && rows[i + 1] !== undefined,
  );
}

/**
 * The build challenge's round, read from the run's `build-challenge` rows (each carries the
 * `round` it ran as; a row without one counts as round 1) and the step row after each: the
 * next of `build-plan-execute` (route fix), `build-decision` (route pause) or
 * `build-run-tests` (route none). A challenge row with no such row after it has not merged
 * yet, so the run keeps that row's round. Otherwise one past the highest round whose merge
 * wrote tasks (route fix or pause), or that ran past round 1; at most `max`
 * (`bkit.workflows.build.challenge.maxAttempts`).
 */
function challengeRound(steps: WorkflowRun["steps"], max: number): number {
  const rows = challengeRows(steps);
  const last = rows.at(-1);
  if (last?.step === "build-challenge") return roundOf(last);
  const done = rows
    .filter(
      (s, i) =>
        s.step === "build-challenge" && (roundOf(s) > 1 || rows[i + 1]?.step !== "build-run-tests"),
    )
    .map(roundOf);
  return done.length === 0 ? 1 : Math.min(Math.max(...done) + 1, max);
}

/** Where `workflow`'s active run resumes; Step 1 when no run is active or no known step is DONE. */
export function resumePoint(
  runs: WorkflowRun[],
  workflow: ResumableWorkflow,
  challengeMax = CONFIG_DEFAULTS.asks["build.challenge"].max,
): ResumePoint {
  const table = WORKFLOW_STEPS[workflow];
  const retired = RETIRED_STEPS[workflow] ?? {};
  const decision = DECISION_ROUTES[workflow];
  const byStep = new Map(table.filter((s) => s.step !== undefined).map((s) => [s.step!, s]));
  const latest = runs.at(-1);
  const active = latest?.workflow === workflow && latest.status === "IN_PROGRESS";
  const steps = active ? latest.steps : [];
  const at = (entry: WorkflowStep, after: string | null, group: number | null) => ({
    step: entry.step ?? null,
    number: entry.number,
    title: entry.title,
    after,
    group,
    active,
    challengeRound: workflow === "build" ? challengeRound(steps, challengeMax) : null,
    challengeDone: workflow === "build" ? challengeDone(steps, challengeMax) : null,
  });
  const routeOf = (s: WorkflowRun["steps"][number]): string | undefined => {
    if (decision === undefined || s.step !== decision.step) return undefined;
    const route = decision.routes[String((s as { route?: unknown }).route)];
    if (typeof route !== "object") return route;
    const prior = steps
      .slice(0, steps.lastIndexOf(s))
      .filter((r) => r.status === "DONE" && r.step !== decision.step && byStep.has(r.step))
      .at(-1);
    return prior === undefined ? undefined : route[prior.step];
  };
  const done = steps.filter(
    (s) =>
      s.status === "DONE" && (byStep.has(s.step) || s.step in retired || routeOf(s) !== undefined),
  );
  const last = done.filter((s) => byStep.get(s.step)?.setup !== true).at(-1) ?? done.at(-1);
  if (last === undefined) return at(table[0]!, null, null);
  const routed = routeOf(last);
  if (routed !== undefined) {
    // A decision row carries no group: the group is the one the paused step worked on.
    const before = done.slice(0, done.lastIndexOf(last)).reverse();
    const prior = before.find((s) => (s.group ?? s.subPlan) !== undefined);
    return at(byStep.get(routed)!, last.step, prior?.group ?? prior?.subPlan ?? null);
  }
  const group = last.group ?? last.subPlan ?? null;
  const verdict = String(last.verdict);
  const target =
    retired[last.step] ??
    byStep.get(last.step)!.resumeOnVerdict?.[verdict] ??
    byStep.get(last.step)!.resumeAt;
  if (target !== undefined) return at(byStep.get(target)!, last.step, group);
  const own = byStep.get(last.step)!;
  const next = table.find((s) => s.number > own.number);
  return at(next ?? own, last.step, group);
}
