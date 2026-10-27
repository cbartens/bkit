import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { WORKFLOW_STEPS, type ResumableWorkflow } from "./step-table";

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
    expect(await round([...fixed, done("build", "build-plan-execute")])).toBe(2);
    expect(await round([...fixed, done("build", "build-decision")])).toBe(2);
    // A round-1 challenge that passed on to Run Tests (route none) wrote no tasks.
    const passed = [
      ...fixed,
      done("build", "build-run-tests"),
      done("build", "build-plan-execute"),
    ];
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
      step: "build-plan-execute",
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

  it.each([
    ["PASS", { step: "ship-failure-remediate", number: 12, after: "ship-failure-remediate" }],
    ["FAIL", { step: "ship-merge-pr", number: 10, after: "ship-failure-remediate" }],
  ])("a ship failure-remediate %s row resumes at %o", async (verdict, expected) => {
    const file = log([
      ...setUp("ship"),
      done("ship", "ship-merge-pr"),
      done("ship", "ship-failure-diagnose"),
      done("ship", "ship-failure-remediate", { verdict }),
    ]);
    expect((await resume("ship", file)).json).toMatchObject(expected);
  });

  it("a retry decision with no loop row before it places no resume point", async () => {
    const file = log([
      ...setUp("build"),
      done("build", "build-plan-verify-holistic"),
      done("build", "build-decision", { route: "retry" }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-challenge",
      after: "build-plan-verify-holistic",
    });
  });

  it("challengeDone is true once a round-2 challenge has merged", async () => {
    const doneOf = async (rows: object[]) => (await resume("build", log(rows))).json.challengeDone;
    const r1 = [...setUp("build"), done("build", "build-challenge", { round: 1 })];
    expect(await doneOf(r1)).toBe(false);
    const r2 = [
      ...r1,
      done("build", "build-plan-execute"),
      done("build", "build-challenge", { round: 2 }),
    ];
    expect(await doneOf(r2)).toBe(false);
    expect(await doneOf([...r2, done("build", "build-decision", { route: "fix" })])).toBe(true);
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
      done("build", "build-plan-execute", { group: 2 }),
      done("build", "build-task-red"),
      done("build", "build-decision"),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      number: 8,
      after: "build-plan-execute",
      group: 2,
    });
  });

  it("a HANDOVER execute resumes at Plan Execute with the same group; PASS goes on to verify", async () => {
    let file = log([
      ...setUp("build"),
      done("build", "build-plan-execute", { group: 2, verdict: "HANDOVER" }),
    ]);
    expect((await resume("build", file)).json).toMatchObject({
      step: "build-plan-execute",
      number: 7,
      after: "build-plan-execute",
      group: 2,
    });
    file = log([
      ...setUp("build"),
      done("build", "build-plan-execute", { group: 2, verdict: "PASS" }),
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
