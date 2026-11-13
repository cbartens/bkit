import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { WORKFLOW_STEPS, runProgress, type ResumableWorkflow } from "./step-table";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const SHA = "a".repeat(40);
let clock = 0;
const at = () => new Date(Date.UTC(2026, 9, 1, 0, 0, clock++)).toISOString().replace(".000", "");
const started = (workflow: string) => ({ type: "workflow-started", workflow, at: at() });
const done = (workflow: string, step: string, extra: Record<string, unknown> = {}) => ({
  type: "step-done",
  workflow,
  step,
  status: "DONE",
  at: at(),
  parentSha: SHA,
  artifacts: [],
  ...extra,
});

/** A status.jsonl holding these rows. */
function log(rows: object[]) {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-resume-")));
  dirs.push(d);
  const file = path.join(d, "status.jsonl");
  fs.writeFileSync(file, rows.map((r) => `${JSON.stringify(r)}\n`).join(""));
  return file;
}

async function resume(workflow: string, file: string) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(
    ["status", "resume", `--workflow=${workflow}`, `--file=${file}`, "--json"],
    COMMANDS,
    {
      classicVerbs: new Set(["status"]),
      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
    },
  );
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** A run that has started and been through its setup steps (1-2). */
const setUp = (workflow: ResumableWorkflow) => [
  started(workflow),
  ...WORKFLOW_STEPS[workflow].filter((s) => s.setup).map((s) => done(workflow, s.step!)),
];

describe("workflow progress", () => {
  it("workflow progress runProgress flat workflow", () => {
    expect(runProgress({ workflow: "ship", step: "ship-merge-pr" })).toMatchObject({
      percent: 83,
      progressLine: "Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR",
    });
  });

  it("runProgress build groups", () => {
    expect(
      runProgress({ workflow: "build", step: "build-plan-verify", groups: [1, 2, 3], group: 2 })
        .progressLine,
    ).toBe("Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3");
    expect(
      runProgress({ workflow: "build", step: "build-plan-verify", groups: [1, 5], group: 5 })
        .progressLine,
    ).toBe("Progress: ██████░░░░ 58% · Step 8/16 Plan Verify · Group 2 of 2");
  });

  it("runProgress groups added", () => {
    const before = runProgress({ workflow: "build", step: "build-challenge", groups: [1] });
    const after = runProgress({ workflow: "build", step: "build-challenge", groups: [1, 2, 3] });
    expect(before.percent).toBe(69);
    expect(after.percent).toBe(77);
    expect(after.progressLine).toBe("Progress: ████████░░ 77% · Step 11/16 Build Challenge");
  });

  it("runProgress loop back", () => {
    const before = runProgress({
      workflow: "build",
      step: "build-plan-gaps-remediate",
      groups: [1, 2],
      group: 1,
    });
    const after = runProgress({
      workflow: "build",
      step: "build-plan-verify",
      groups: [1, 2],
      group: 1,
      attempt: 2,
      max: 3,
    });
    expect(after.percent).toBeLessThan(before.percent);
    expect(after.progressLine).toBe(
      "Progress: ████░░░░░░ 42% · Step 8/16 Plan Verify · Group 1 of 2 · Attempt 2 of 3",
    );
  });

  it("runProgress bar width", () => {
    for (const workflow of Object.keys(WORKFLOW_STEPS) as ResumableWorkflow[]) {
      for (const position of WORKFLOW_STEPS[workflow]) {
        const { progressLine } = runProgress({ workflow, number: position.number });
        const prefix = progressLine.split(" · ")[0]!;
        expect(prefix).toMatch(/^Progress: [█░]{10} \d{1,3}%$/);
        expect(prefix.length).toBeLessThanOrEqual(25);
      }
    }
  });

  it("workflow progress runProgress all workflow numbers", () => {
    const totals = { design: 12, plan: 8, build: 16, debug: 11, ship: 12 };
    for (const workflow of Object.keys(totals) as ResumableWorkflow[]) {
      for (const position of WORKFLOW_STEPS[workflow]) {
        const result = runProgress({ workflow, number: position.number });
        expect(result.percent).toBe(Math.round((100 * position.number) / totals[workflow]));
        expect(result.progressLine).toContain(
          `Step ${position.number}/${totals[workflow]} ${position.title}`,
        );
      }
    }
    expect(runProgress({ workflow: "ship", number: 3 }).progressLine).toBe(
      "Progress: ███░░░░░░░ 25% · Step 3/12 Base Check",
    );
    expect(runProgress({ workflow: "ship", number: 9 }).progressLine).toBe(
      "Progress: ████████░░ 75% · Step 9/12 Re-validate",
    );
    expect(runProgress({ workflow: "build", step: "build-plan-tests" }).percent).toBe(
      runProgress({ workflow: "build", step: "build-plan-tasks" }).percent,
    );
  });

  it("runProgress missing plan fallback", () => {
    const missing = runProgress({ workflow: "build", step: "build-plan-verify", group: 1 });
    const empty = runProgress({
      workflow: "build",
      step: "build-plan-verify",
      groups: [],
      group: 1,
    });
    expect(missing.progressLine).toBe(
      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
    );
    expect(empty).toEqual(missing);
  });

  it("workflow progress runProgress attempt suffix", () => {
    expect(
      runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 1, max: 3 }).progressLine,
    ).toBe("Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR");
    expect(
      runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 2, max: 3 }).progressLine,
    ).toBe("Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR · Attempt 2 of 3");
    expect(runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 2 }).progressLine).toBe(
      "Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR · Attempt 2",
    );
  });

  it("runProgress final completion only", () => {
    const groups = Array.from({ length: 1000 }, (_, index) => index + 1);
    const nonfinal = runProgress({ workflow: "build", step: "build-summary", groups });
    expect(nonfinal.percent).toBe(99);
    expect(nonfinal.progressLine).not.toContain("100%");
    for (const workflow of Object.keys(WORKFLOW_STEPS) as ResumableWorkflow[]) {
      const final = WORKFLOW_STEPS[workflow].at(-1)!;
      expect(runProgress({ workflow, number: final.number, groups }).progressLine).toBe(
        `Progress: ██████████ 100% · Step ${final.number}/${final.number} ${final.title}`,
      );
    }
  });
});

describe("bkit status resume", () => {
  it("a build stopped after build-challenge resumes at the challenge merge (Step 11)", async () => {
    const file = log([
      ...setUp("build"),
      done("build", "build-plan-verify-holistic"),
      done("build", "build-challenge"),
    ]);
    const r = await resume("build", file);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      step: "build-challenge",
      number: 11,
      title: "Build Challenge",
      after: "build-challenge",
      active: true,
    });
  });

  it("a build that stopped after Plan Convert resumes at Plan Convert (Step 4)", async () => {
    const file = log([...setUp("build"), done("build", "build-plan-convert")]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-plan-convert",
      number: 4,
      title: "Plan Convert",
      after: "build-plan-convert",
    });
  });

  it("a build that stopped after Plan Current resumes at Install Skills (Step 6)", async () => {
    const file = log([...setUp("build"), done("build", "build-plan-current")]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-install-skills",
      number: 6,
      title: "Install Skills",
    });
  });

  it("a build that stopped after Plan Verify resumes at Plan Verify (Step 8)", async () => {
    const file = log([...setUp("build"), done("build", "build-plan-verify", { group: 1 })]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-plan-verify",
      number: 8,
      title: "Plan Verify",
      group: 1,
    });
  });

  it("the challenge round comes from status.jsonl, not the plan files", async () => {
    // No plan file exists here: the round is read from the build-challenge row alone.
    const round = async (rows: object[]) => (await resume("build", log(rows))).json.challengeRound;
    const verified = [...setUp("build"), done("build", "build-plan-verify-holistic")];
    expect(await round([...verified, done("build", "build-challenge", { round: 2 })])).toBe(2);
    expect(await round([...verified, done("build", "build-challenge", { round: 1 })])).toBe(1);
    expect(await round(verified)).toBe(1);
    // A round-1 challenge that sent the build back to Step 7 (route fix), or to a decision.
    const fixed = [...verified, done("build", "build-challenge", { round: 1 })];
    expect(await round([...fixed, done("build", "build-plan-tasks")])).toBe(2);
    expect(await round([...fixed, done("build", "build-decision")])).toBe(2);
    // A round-1 challenge that passed on to Run Tests (route none) wrote no tasks.
    const passed = [...fixed, done("build", "build-run-tests"), done("build", "build-plan-tasks")];
    expect(await round(passed)).toBe(1);
    expect((await resume("plan", log(setUp("plan")))).json.challengeRound).toBeNull();
  });

  it("a build-decision row's route places the resume point", async () => {
    const challenged = [
      ...setUp("build"),
      done("build", "build-plan-verify-holistic"),
      done("build", "build-challenge", { round: 1 }),
    ];
    const after = async (route?: string) =>
      (await resume("build", log([...challenged, done("build", "build-decision", { route })])))
        .json;
    expect(await after("fix")).toMatchObject({
      step: "build-plan-tasks",
      number: 7,
      after: "build-decision",
      challengeRound: 2,
    });
    expect(await after("tests")).toMatchObject({
      step: "build-run-tests",
      number: 12,
      after: "build-decision",
    });
    // No route: the row places nothing, as before.
    expect(await after()).toMatchObject({ step: "build-challenge", after: "build-challenge" });
    // A verify decision resumes the verify of the group the pause came from.
    const verified = log([
      ...setUp("build"),
      done("build", "build-plan-verify", { group: 2 }),
      done("build", "build-decision", { route: "verify" }),
    ]);
    expect((await resume("build", verified)).json).toMatchObject({
      step: "build-plan-verify",
      number: 8,
      after: "build-decision",
      group: 2,
    });
  });

  it.each([
    ["build-plan-verify", { step: "build-plan-gaps-remediate", number: 9, group: 2 }],
    ["build-group-gate", { step: "build-plan-gaps-remediate", number: 9, group: 2 }],
    ["build-run-tests", { step: "build-failure-diagnose", number: 13 }],
  ])("a retry decision after %s resumes at that loop's fix step", async (prior, expected) => {
    const file = log([
      ...setUp("build"),
      done("build", prior, { group: 2 }),
      done("build", "build-decision", { route: "retry" }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      ...expected,
      after: "build-decision",
    });
  });

  it("bkit status resume ignores ship rows for the removed failure steps", async () => {
    const file = log([
      ...setUp("ship"),
      done("ship", "ship-merge-pr"),
      done("ship", "ship-failure-diagnose"),
      done("ship", "ship-failure-remediate", { verdict: "PASS" }),
    ]);
    expect((await resume("ship", file)).json).toMatchObject({
      step: "ship-merge-pr",
      number: 10,
      after: "ship-merge-pr",
    });
  });

  it("a retry decision with no loop row before it places no resume point", async () => {
    const file = log([
      ...setUp("build"),
      done("build", "build-plan-current"),
      done("build", "build-decision", { route: "retry" }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-install-skills",
      after: "build-plan-current",
    });
  });

  it.each([
    ["PASS", { step: "build-challenge", number: 11 }],
    ["CONCERNS", { step: "build-plan-verify-holistic", number: 10 }],
    ["FAIL", { step: "build-plan-verify-holistic", number: 10 }],
  ])("a holistic verify %s row resumes at %o", async (verdict, expected) => {
    const file = log([...setUp("build"), done("build", "build-plan-verify-holistic", { verdict })]);
    expect((await resume("build", file)).json).toMatchObject({
      ...expected,
      after: "build-plan-verify-holistic",
    });
  });

  it("a holistic gaps fix resumes at the holistic verify that judges it", async () => {
    const file = log([
      ...setUp("build"),
      done("build", "build-plan-verify-holistic", { verdict: "FAIL" }),
      done("build", "build-plan-gaps-remediate-holistic", { strategy: "STANDARD" }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-plan-verify-holistic",
      number: 10,
      after: "build-plan-gaps-remediate-holistic",
    });
  });

  it.each([
    ["build-plan-verify-holistic", "retry", "build-plan-gaps-remediate-holistic"],
    ["build-plan-gaps-remediate-holistic", "retry", "build-plan-gaps-remediate-holistic"],
    ["build-plan-verify-holistic", "holistic", "build-plan-verify-holistic"],
  ])("a decision after %s with route %s resumes at %s", async (prior, route, step) => {
    const file = log([
      ...setUp("build"),
      done("build", prior, { verdict: "FAIL" }),
      done("build", "build-decision", { route }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      step,
      number: 10,
      after: "build-decision",
    });
  });

  it("challengeDone is true once a round-2 challenge has merged", async () => {
    const doneOf = async (rows: object[]) => (await resume("build", log(rows))).json.challengeDone;
    const r1 = [...setUp("build"), done("build", "build-challenge", { round: 1 })];
    expect(await doneOf(r1)).toBe(false);
    const r2 = [
      ...r1,
      done("build", "build-plan-tasks"),
      done("build", "build-challenge", { round: 2 }),
    ];
    expect(await doneOf(r2)).toBe(false);
    expect(await doneOf([...r2, done("build", "build-decision", { route: "fix" })])).toBe(true);
    expect(await doneOf([...r2, done("build", "build-plan-tasks")])).toBe(true);
    expect(await doneOf([...r2, done("build", "build-run-tests")])).toBe(true);
    expect((await resume("plan", log(setUp("plan")))).json.challengeDone).toBeNull();
  });

  it("old reconcile, remediate or tests rows resume at Run Tests (Step 12)", async () => {
    for (const old of ["reconcile", "remediate", "tests"].map((s) => `build-challenge-${s}`)) {
      const file = log([...setUp("build"), done("build", "build-challenge"), done("build", old)]);
      expect((await resume("build", file)).json, old).toMatchObject({
        step: "build-run-tests",
        number: 12,
        title: "Run Tests",
        after: old,
      });
    }
  });

  it("ignores plan rows for steps the plan workflow no longer has", async () => {
    const file = log([
      ...setUp("plan"),
      done("plan", "plan-review"),
      done("plan", "plan-draft-check"),
      done("plan", "plan-split-check"),
    ]);
    expect((await resume("plan", file)).json).toMatchObject({
      step: "plan-apply-review",
      number: 6,
      after: "plan-review",
    });
  });

  it("a plan run stopped after the old complexity steps resumes at Summary, Step 7", async () => {
    const file = log([
      ...setUp("plan"),
      done("plan", "plan-apply-review"),
      done("plan", "plan-complexity-check"),
      done("plan", "plan-complexity-split"),
    ]);
    expect((await resume("plan", file)).json).toMatchObject({
      step: "plan-summary",
      number: 7,
      after: "plan-apply-review",
    });
  });

  it("ignores rows that are not steps of the table (a red-test row, the decision)", async () => {
    const file = log([
      ...setUp("build"),
      done("build", "build-plan-tasks", { group: 2 }),
      done("build", "build-tests-red", { group: 2 }),
      done("build", "build-decision"),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      number: 8,
      after: "build-plan-tasks",
      group: 2,
    });
  });

  it("build-plan-tests is step 7 Plan Execute resuming at build-plan-tests", async () => {
    const file = log([...setUp("build"), done("build", "build-plan-tests", { group: 2 })]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-plan-tests",
      number: 7,
      title: "Plan Execute",
      after: "build-plan-tests",
      group: 2,
    });
  });

  it("a HANDOVER execute resumes at Plan Execute with the same group; PASS goes on to verify", async () => {
    let file = log([
      ...setUp("build"),
      done("build", "build-plan-tasks", { group: 2, verdict: "HANDOVER" }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-plan-tasks",
      number: 7,
      after: "build-plan-tasks",
      group: 2,
    });
    file = log([
      ...setUp("build"),
      done("build", "build-plan-tasks", { group: 2, verdict: "PASS" }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-plan-verify",
      number: 8,
      group: 2,
    });
  });

  for (const workflow of Object.keys(WORKFLOW_STEPS) as ResumableWorkflow[]) {
    // Each step that resumes at the next one, with that next step (itself when last).
    const table = WORKFLOW_STEPS[workflow];
    const cases = table
      .filter((s) => s.step !== undefined && s.setup === undefined && s.resumeAt === undefined)
      .map((entry) => {
        const next = table.find((s) => s.number > entry.number) ?? entry;
        return {
          done: entry.step!,
          number: next.number,
          title: next.title,
          step: next.step ?? null,
        };
      });

    it(`${workflow}: a completed step resumes at the next one`, async () => {
      for (const c of cases) {
        const file = log([...setUp(workflow), done(workflow, c.done)]);
        expect((await resume(workflow, file)).json, c.done).toMatchObject({
          number: c.number,
          title: c.title,
          step: c.step,
        });
      }
    });

    it(`${workflow}: no rows resumes at Step 1; setup rows alone at Step 3`, async () => {
      const missing = path.join(log([]), "..", "absent.jsonl");
      expect((await resume(workflow, missing)).json).toMatchObject({
        number: 1,
        after: null,
        active: false,
      });
      expect((await resume(workflow, log([started(workflow)]))).json).toMatchObject({
        number: 1,
        active: true,
      });
      expect((await resume(workflow, log(setUp(workflow)))).json).toMatchObject({ number: 3 });
    });
  }

  it("a finished run, or another workflow's run, resumes at Step 1", async () => {
    const closed = log([
      ...setUp("build"),
      done("build", "build-summary"),
      { type: "workflow-done", workflow: "build", at: at() },
    ]);
    expect((await resume("build", closed)).json).toMatchObject({ number: 1, active: false });
    const other = log([...setUp("build"), done("build", "build-summary"), ...setUp("ship")]);
    expect((await resume("build", other)).json).toMatchObject({ number: 1, active: false });
  });

  it("refuses an unknown workflow, and a malformed log (exit 3)", async () => {
    expect((await resume("lite", log([]))).code).toBe(2);
    const bad = log([]);
    fs.writeFileSync(bad, "not json\n");
    expect((await resume("build", bad)).code).toBe(3);
  });
});
