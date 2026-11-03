diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 0d7071c2f..fd3eb832d 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -343,12 +343,50 @@ describe("Failure Path", () => {
});
});

+/** The build step table's numbers carried by more than one step, each list sorted. */
+function sharedStepNumbers(): string[][] {

- const byNumber = new Map<number, string[]>();
- for (const row of WORKFLOW_STEPS.build.filter((s) => s.step !== undefined)) {
- const steps = byNumber.get(row.number) ?? [];
- steps.push(row.step!);
- byNumber.set(row.number, steps);
- }
- return [...byNumber.values()]
- .filter((steps) => steps.length > 1)
- .map((steps) => steps.sort())
- .sort((a, b) => a[0]!.localeCompare(b[0]!));
  +}
-

+/** Finish lines in `text` posting a number or title the build step table's row does not carry. */
+function commentNumberProblems(text: string): string[] {

- const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
- const byStep = new Map(rows.map((s) => [s.step!, s]));
- const byNumber = new Map<number, string[]>();
- for (const row of rows)
- byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
- return commandLines(text, "steps finish").flatMap((line) => {
- const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
- // The Decision Pause writes its own row under the paused step's number.
- if (step === undefined || step === "build-decision") return [];
- const row = byStep.get(step);
- if (row === undefined) return [`${step}: no row in the build step table`];
- if (!line.includes(`--number=${row.number}`))
-      return [`${step}: posts a number other than ${row.number}`];
- // A number two steps share lets each post under its own title.
- if (byNumber.get(row.number)!.length > 1) return [];
- const title = row.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
- return new RegExp(`--title="?${title}"?(?=\\s)`).test(line)
-      ? []
-      : [`${step}: posts a title other than "${row.title}"`];
- });
  +}
-

describe("build", () => {
const build = workflow("build");

- it("Step 12's diagnose agent reads the committed log, not the outbox copy", () => {
- const step12 = section(build, /Step 12 — Failure Diagnose/);
- const read = step12.split("\n").find((l) => l.trim().startsWith("Read:"));

* it("Step 13's diagnose agent reads the committed log, not the outbox copy", () => {
* const step13 = section(build, /Step 13 — Failure Diagnose/);
* const read = step13.split("\n").find((l) => l.trim().startsWith("Read:"));
  expect(read).toContain("`docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`");
  expect(read).not.toContain("{OUTBOX}");
  });
  @@ -361,9 +399,9 @@ describe("build", () => {
  expect(build).not.toContain("ATTEMPT_FLAG");
  });

- it("Step 10 merges the findings into the plan and routes on the merge", () => {
- const step10 = section(build, /Step 10 — Build Challenge/);
- const merge = commandLines(step10, "challenge merge");

* it("Step 11 merges the findings into the plan and routes on the merge", () => {
* const step11 = section(build, /Step 11 — Build Challenge/);
* const merge = commandLines(step11, "challenge merge");
  expect(merge).toHaveLength(1);
  for (const flag of [
  '--report="docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md"',
  @@ -374,24 +412,24 @@ describe("build", () => {
  ])
  expect(merge[0], flag).toContain(flag);
  for (const route of [

-      "`route` = `none` → Step 11",

*      "`route` = `none` → Step 12",
       "`route` = `pause`",
       "`route` = `fix`",
       "exit 22",
  ])

-      expect(step10, route).toContain(route);
- expect(step10).toContain(
-      "`PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE`",

*      expect(step11, route).toContain(route);
* expect(step11).toContain(
*      "`PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE`",
  );
  });

- it("Step 10 records its round on the challenge row and reads it back from status.jsonl", () => {
- const step10 = section(build, /Step 10 — Build Challenge/);
- const finish = commandLines(step10, "steps finish");

* it("Step 11 records its round on the challenge row and reads it back from status.jsonl", () => {
* const step11 = section(build, /Step 11 — Build Challenge/);
* const finish = commandLines(step11, "steps finish");
  expect(finish).toHaveLength(1);
  expect(finish[0]).toContain("--field=round={CHALLENGE_ROUND}");

- expect(commandLines(step10, "status resume")).toHaveLength(1);
- expect(step10).toContain("`CHALLENGE_ROUND` = `challengeRound`");

* expect(commandLines(step11, "status resume")).toHaveLength(1);
* expect(step11).toContain("`CHALLENGE_ROUND` = `challengeRound`");
  expect(build, "the round is never searched for in plan files").not.toMatch(
  /grep -l '[^']*Round:/,
  );
  @@ -400,7 +438,7 @@ describe("build", () => {
  it("a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file", () => {
  const resumeLine = build.split("\n").find((l) => l.includes("**Resume:**"))!;
  expect(resumeLine).not.toContain("the decision file's task numbers");

- expect(resumeLine).toContain("Step 10 sub-steps 2 and 5");

* expect(resumeLine).toContain("Step 11 sub-steps 2 and 5");
  expect(resumeLine).toContain("`fixTasks` as `{CHALLENGE_TASKS}`");
  expect(resumeLine).toContain("never sub-step 6");
  });
  @@ -424,28 +462,28 @@ describe("build", () => {
  expect(pause).toContain(
  "`CHALLENGE_ROUND` = `CHALLENGE_MAX` already → `CHALLENGE_DONE` = true",
  );

- expect(section(build, /Step 10 — Build Challenge/)).toContain(

* expect(section(build, /Step 11 — Build Challenge/)).toContain(
  '"{BKIT}" counters max --point=build.challenge',
  );

- const step10 = section(build, /Step 10 — Build Challenge/);
- const first = step10.slice(step10.indexOf("\n1. "), step10.indexOf("\n2. "));
- expect(first).toContain("`CHALLENGE_DONE` = true → Step 11");

* const step11 = section(build, /Step 11 — Build Challenge/);
* const first = step11.slice(step11.indexOf("\n1. "), step11.indexOf("\n2. "));
* expect(first).toContain("`CHALLENGE_DONE` = true → Step 12");
  expect(first).toContain("`challengeDone`");
  const resumeLine = build.split("\n").find((l) => l.includes("**Resume:**"))!;
  expect(resumeLine).toContain("`CHALLENGE_DONE` = `challengeDone`");
  });

it("challenge merge exit 23 gets the same one retry as exit 22", () => {

- const step10 = section(build, /Step 10 — Build Challenge/);
- expect(step10).toMatch(/exit 22 \*\*or\*\* 23/);
- expect(step10).toContain("`problems`");

* const step11 = section(build, /Step 11 — Build Challenge/);
* expect(step11).toMatch(/exit 22 \*\*or\*\* 23/);
* expect(step11).toContain("`problems`");
  });

it("an execute cap stop is a handover, never a FAIL attempt", () => {

- const step6 = stepBody(build, /Step 6 — Plan Execute/);
- expect(step6).toContain("Hold `verdict` as `EXECUTE_VERDICT`");
- expect(step6).toContain("`EXECUTE_VERDICT` = HANDOVER");
- expect(step6).toContain("not a failed attempt");

* const step7 = stepBody(build, /Step 7 — Plan Execute/);
* expect(step7).toContain("Hold `verdict` as `EXECUTE_VERDICT`");
* expect(step7).toContain("`EXECUTE_VERDICT` = HANDOVER");
* expect(step7).toContain("not a failed attempt");
  const prompt = fs.readFileSync(
  path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-execute.md"),
  "utf-8",
  @@ -456,20 +494,20 @@ describe("build", () => {
  });

it("build challenge runs the size gate first", () => {

- const step10 = section(build, /Step 10 — Build Challenge/);
- const gate = commandLines(step10, "challenge gate");

* const step11 = section(build, /Step 11 — Build Challenge/);
* const gate = commandLines(step11, "challenge gate");
  expect(gate.map((l) => l.trim())).toEqual(['"{BKIT}" challenge gate --file="{STATUS}"']);

- expect(step10.indexOf("challenge gate")).toBeLessThan(
-      step10.indexOf("Invoke `@bkit-build-challenge-1`"),

* expect(step11.indexOf("challenge gate")).toBeLessThan(
*      step11.indexOf("Invoke `@bkit-build-challenge-1`"),
  );

- expect(step10).toContain("hold `size` as `{CHALLENGE_SIZE}`");
- const small = step10.split("\n").filter((l) => l.includes("`CHALLENGE_SIZE` = small"));

* expect(step11).toContain("hold `size` as `{CHALLENGE_SIZE}`");
* const small = step11.split("\n").filter((l) => l.includes("`CHALLENGE_SIZE` = small"));
  expect(small.join("\n")).toContain("`@bkit-build-challenge-2` only");
  expect(small.join("\n")).toContain("--agent=bkit-build-challenge-1");
  expect(small.join("\n")).toContain("--report");

- expect(commandLines(step10, "steps finish")).toHaveLength(1);
- expect(commandLines(step10, "challenge merge")).toHaveLength(1);
- expect(step10).toContain("Change sized (`challenge gate`)");

* expect(commandLines(step11, "steps finish")).toHaveLength(1);
* expect(commandLines(step11, "challenge merge")).toHaveLength(1);
* expect(step11).toContain("Change sized (`challenge gate`)");
  });

it("names no removed challenge agent, step or limit", () => {
@@ -481,17 +519,65 @@ describe("build", () => {
expect(build, gone).not.toContain(gone);
});

- it("Branch Sync checks the plan, converts one with no task markers, and checks again", () => {

* it("Branch Sync merges docs and finishes as its own step", () => {
  const step3 = section(build, /Step 3 — Branch Sync/);

- const checks = commandLines(step3, "tests plan-check");

* expect(step3).toContain('"{BKIT}" branches sync --merge-docs');
* expect(step3).not.toContain("tests plan-check");
* expect(step3).not.toContain("Invoke `@bkit-build-plan-convert`");
* const finish = commandLines(step3, "steps finish");
* expect(finish).toHaveLength(1);
* expect(finish[0]).toContain("--step=build-branch-sync");
* expect(finish[0]).toContain("--number=3");
* expect(finish[0]).toContain('--post --title="Branch Sync"');
* // Its gate names the docs merge alone; the plan check gates Plan Convert.
* expect(stepBody(build, /Gate 3 — Branch Sync/)).not.toContain("plan-check");
* });
*
* it("Plan Convert checks the plan, converts one with no task markers, and re-checks", () => {
* const step4 = section(build, /Step 4 — Plan Convert/);
* const checks = commandLines(step4, "tests plan-check");
  expect(checks.length).toBeGreaterThanOrEqual(1);
  for (const line of checks) expect(line).toContain('--plan="docs/plans/{YYYYMM}/{FID}-plan.md"');

- const convert = step3.indexOf("Invoke `@bkit-build-plan-convert`");

* const convert = step4.indexOf("Invoke `@bkit-build-plan-convert`");
  expect(convert, "no convert dispatch").toBeGreaterThan(-1);

- expect(step3.indexOf('"{BKIT}" tests plan-check')).toBeLessThan(convert);
- // The converted plan goes back through the same check before Step 3 finishes.
- expect(step3.slice(convert)).toMatch(/re-run sub-step 2/);
- expect(step3).toContain("`markers`");

* expect(step4.indexOf('"{BKIT}" tests plan-check')).toBeLessThan(convert);
* // The converted plan goes back through the same check before the step finishes.
* expect(step4.slice(convert)).toMatch(/re-run sub-step 1/);
* expect(step4).toContain("`markers`");
* });
*
* it("Plan Convert leaves a valid plan with no newer comments alone", () => {
* const step4 = section(build, /Step 4 — Plan Convert/);
* const skip =
*      "**If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.";
* expect(step4).toContain(skip);
* // That route leaves the step at once: no dispatch, no row and no comment.
* expect(step4.indexOf(skip)).toBeLessThan(step4.indexOf("Invoke `@bkit-build-plan-convert`"));
* expect(commandLines(step4, "steps finish")).toHaveLength(1);
* expect(step4.indexOf("--step=build-plan-convert")).toBeGreaterThan(
*      step4.indexOf("Invoke `@bkit-build-plan-convert`"),
* );
* });
*
* it("build's comment numbers match the step table", () => {
* // One number per step; only the pairs sharing a step heading share one.
* expect(sharedStepNumbers()).toEqual([
*      ["build-close-workflow", "build-create-pr"],
*      ["build-group-gate", "build-plan-verify"],
*      ["build-group-start", "build-plan-execute"],
* ]);
* // Each finish line posts the number and title of its own table row.
* expect(commentNumberProblems(build)).toEqual([]);
* });
*
* it("the convert step posts under Plan Convert's number and title", () => {
* const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish").filter(
*      (l) => l.includes("--step=build-plan-convert"),
* );
* expect(finish).toHaveLength(1);
* expect(finish[0]).toContain("--number=4");
* expect(finish[0]).toContain('--post --title="Plan Convert"');
* expect(section(build, /Step 3 — Branch Sync/)).not.toContain("--step=build-plan-convert");
  });

it("issue comments newer than a valid plan send the build through convert once", () => {
@@ -500,11 +586,11 @@ describe("build", () => {
expect(section(build, /Step 2 — Worktree Setup/)).toContain(
"Hold `newerThanPlan` as `{NEWER_COMMENTS}`.",
);

- const step3 = section(build, /Step 3 — Branch Sync/);
- expect(step3).toContain(
-      "**If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.",

* const step4 = section(build, /Step 4 — Plan Convert/);
* expect(step4).toContain(
*      "**If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.",
  );

- expect(step3).toMatch(

* expect(step4).toMatch(
  /`CONVERTED` is not held \*\*and\*\* \(exit 0 with `NEWER_COMMENTS` > 0,/,
  );
  });
  @@ -518,33 +604,33 @@ describe("build", () => {
  expect(build).not.toMatch(/sub-plan|SUB_PLAN|SUB_COUNT|NEW_SUB_PLAN/i);
  });

- it("Step 6 takes the next group's brief and hands execute its path", () => {
- const step6 = stepBody(build, /Step 6 — Plan Execute/);
- const brief = commandLines(step6, "context brief");

* it("Step 7 takes the next group's brief and hands execute its path", () => {
* const step7 = stepBody(build, /Step 7 — Plan Execute/);
* const brief = commandLines(step7, "context brief");
  expect(brief).toHaveLength(1);
  expect(brief[0]).toContain("--next");
  expect(brief[0]).toContain('--plan="docs/plans/{YYYYMM}/{FID}-plan.md"');
  expect(brief[0]).toContain('--note-file="{SESSION_DIR}/brief-note.md"');

- expect(step6).toContain("drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist");
- expect(step6).toContain("`{BRIEF}`");
- expect(step6.indexOf("context brief")).toBeLessThan(
-      step6.indexOf("Invoke `@bkit-build-plan-execute`"),

* expect(step7).toContain("drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist");
* expect(step7).toContain("`{BRIEF}`");
* expect(step7.indexOf("context brief")).toBeLessThan(
*      step7.indexOf("Invoke `@bkit-build-plan-execute`"),
  );

- const finish = commandLines(step6, "steps finish");

* const finish = commandLines(step7, "steps finish");
  expect(finish).toHaveLength(1);
  expect(finish[0]).toContain("--group={GROUP}");
  });

- it("Step 7 verifies a diff cut from the group's start commit", () => {
- const step7 = stepBody(build, /Step 7 — Plan Verify/);
- const diff = commandLines(step7, "context diff");

* it("Step 8 verifies a diff cut from the group's start commit", () => {
* const step8 = stepBody(build, /Step 8 — Plan Verify/);
* const diff = commandLines(step8, "context diff");
  expect(diff).toHaveLength(1);
  expect(diff[0]).toContain("--base={GROUP_BASE}");

- expect(step7).toMatch(/status route --step=build-group-start --group=\{GROUP\}/);
- expect(step7.indexOf("context diff")).toBeLessThan(
-      step7.indexOf("Invoke `@bkit-build-plan-verify`"),

* expect(step8).toMatch(/status route --step=build-group-start --group=\{GROUP\}/);
* expect(step8.indexOf("context diff")).toBeLessThan(
*      step8.indexOf("Invoke `@bkit-build-plan-verify`"),
  );

- const green = commandLines(step7, "tests green");

* const green = commandLines(step8, "tests green");
  expect(green).toHaveLength(1);
  expect(green[0]).toContain("--group={GROUP}");
  });
  @@ -585,7 +671,7 @@ describe("build", () => {
  expect(input).toBeDefined();
  for (const flag of ["--prompt-file=", "--description-file=", "--comments-file=", "--plan="])
  expect(input, flag).toContain(flag);

- expect(section(build, /Step 3 — Branch Sync/)).not.toContain("workflows input");

* expect(section(build, /Step 4 — Plan Convert/)).not.toContain("workflows input");
  });

describe("convert and plan-generate prompts", () => {
@@ -735,10 +821,10 @@ describe("diff per reader", () => {
const BASE_FLAG: Record<string, string> = { build: "", debug: " --base={DIFF_BASE}", ship: "" };
const READERS: Array<[string, RegExp, string, string[]]> = [
["build", /Failure Path/, "abort-handover", ["bkit-debug-abort-handover"]],

- ["build", /Step 9 — /, "build-plan-verify-holistic", ["bkit-build-plan-verify"]],

* ["build", /Step 10 — /, "build-plan-verify-holistic", ["bkit-build-plan-verify"]],
  [
  "build",

-      /Step 10 — Build Challenge/,

*      /Step 11 — Build Challenge/,
       "build-challenge",
       ["bkit-build-challenge-1", "bkit-build-challenge-2"],

  ],
  @@ -769,7 +855,7 @@ describe("diff per reader", () => {
  );

  it("build group verify cuts its own diff from the group's start, right before the agent", () => {

- const text = stepBody(workflow("build"), /Step 7 — /);

* const text = stepBody(workflow("build"), /Step 8 — /);
  const [line, ...more] = commandLines(text, "context diff");
  expect(more).toEqual([]);
  expect(line).toContain(
  @@ -1398,9 +1484,9 @@ describe("issue-less runs", () => {
  }
  });

- it("build 15.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty", () => {

* it("build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty", () => {
  for (const [name, step] of [

-      ["build", /Step 15 — Close Workflow/],

*      ["build", /Step 16 — Close Workflow/],
       ["debug", /Step 11 — Close Workflow/],
  ] as const) {
  const lines = section(workflow(name), step).split("\n");
  diff --git a/.bkit/core/engine/commands/workflow/step-table.test.ts b/.bkit/core/engine/commands/workflow/step-table.test.ts
  index 2360803f6..f8504123b 100644
  --- a/.bkit/core/engine/commands/workflow/step-table.test.ts
  +++ b/.bkit/core/engine/commands/workflow/step-table.test.ts
  @@ -58,7 +58,7 @@ const setUp = (workflow: ResumableWorkflow) => [
  ];

describe("bkit status resume", () => {

- it("a build stopped after build-challenge resumes at the challenge merge (Step 10)", async () => {

* it("a build stopped after build-challenge resumes at the challenge merge (Step 11)", async () => {
  const file = log([
  ...setUp("build"),
  done("build", "build-plan-verify-holistic"),
  @@ -68,13 +68,42 @@ describe("bkit status resume", () => {
  expect(r.code).toBe(0);
  expect(r.json).toMatchObject({
  step: "build-challenge",

-      number: 10,

*      number: 11,
       title: "Build Challenge",
       after: "build-challenge",
       active: true,

  });
  });

* it("a build that stopped after Plan Convert resumes at Plan Convert (Step 4)", async () => {
* const file = log([...setUp("build"), done("build", "build-plan-convert")]);
* expect((await resume("build", file)).json).toMatchObject({
*      step: "build-plan-convert",
*      number: 4,
*      title: "Plan Convert",
*      after: "build-plan-convert",
* });
* });
*
* it("a build that stopped after Plan Current resumes at Install Skills (Step 6)", async () => {
* const file = log([...setUp("build"), done("build", "build-plan-current")]);
* expect((await resume("build", file)).json).toMatchObject({
*      step: "build-install-skills",
*      number: 6,
*      title: "Install Skills",
* });
* });
*
* it("a build that stopped after Plan Verify resumes at Plan Verify (Step 8)", async () => {
* const file = log([...setUp("build"), done("build", "build-plan-verify", { group: 1 })]);
* expect((await resume("build", file)).json).toMatchObject({
*      step: "build-plan-verify",
*      number: 8,
*      title: "Plan Verify",
*      group: 1,
* });
* });
* it("the challenge round comes from status.jsonl, not the plan files", async () => {
  // No plan file exists here: the round is read from the build-challenge row alone.
  const round = async (rows: object[]) => (await resume("build", log(rows))).json.challengeRound;
  @@ -107,13 +136,13 @@ describe("bkit status resume", () => {
  .json;
  expect(await after("fix")).toMatchObject({
  step: "build-plan-execute",

-      number: 6,

*      number: 7,
       after: "build-decision",
       challengeRound: 2,
  });
  expect(await after("tests")).toMatchObject({
  step: "build-run-tests",

-      number: 11,

*      number: 12,
       after: "build-decision",
  });
  // No route: the row places nothing, as before.
  @@ -126,16 +155,16 @@ describe("bkit status resume", () => {
  ]);
  expect((await resume("build", verified)).json).toMatchObject({
  step: "build-plan-verify",

-      number: 7,

*      number: 8,
       after: "build-decision",
       group: 2,

  });
  });

  it.each([

- ["build-plan-verify", { step: "build-plan-gaps-remediate", number: 8, group: 2 }],
- ["build-group-gate", { step: "build-plan-gaps-remediate", number: 8, group: 2 }],
- ["build-run-tests", { step: "build-failure-diagnose", number: 12 }],

* ["build-plan-verify", { step: "build-plan-gaps-remediate", number: 9, group: 2 }],
* ["build-group-gate", { step: "build-plan-gaps-remediate", number: 9, group: 2 }],
* ["build-run-tests", { step: "build-failure-diagnose", number: 13 }],
  ])("a retry decision after %s resumes at that loop's fix step", async (prior, expected) => {
  const file = log([
  ...setUp("build"),
  @@ -188,12 +217,12 @@ describe("bkit status resume", () => {
  expect((await resume("plan", log(setUp("plan")))).json.challengeDone).toBeNull();
  });

- it("old reconcile, remediate or tests rows resume at Run Tests (Step 11)", async () => {

* it("old reconcile, remediate or tests rows resume at Run Tests (Step 12)", async () => {
  for (const old of ["reconcile", "remediate", "tests"].map((s) => `build-challenge-${s}`)) {
  const file = log([...setUp("build"), done("build", "build-challenge"), done("build", old)]);
  expect((await resume("build", file)).json, old).toMatchObject({
  step: "build-run-tests",

-        number: 11,

*        number: 12,
         title: "Run Tests",
         after: old,
       });

@@ -236,7 +265,7 @@ describe("bkit status resume", () => {
done("build", "build-decision"),
]);
expect((await resume("build", file)).json).toMatchObject({

-      number: 7,

*      number: 8,
       after: "build-plan-execute",
       group: 2,
  });
  @@ -249,7 +278,7 @@ describe("bkit status resume", () => {
  ]);
  expect((await resume("build", file)).json).toMatchObject({
  step: "build-plan-execute",

-      number: 6,

*      number: 7,
       after: "build-plan-execute",
       group: 2,
  });
  @@ -259,7 +288,7 @@ describe("bkit status resume", () => {
  ]);
  expect((await resume("build", file)).json).toMatchObject({
  step: "build-plan-verify",

-      number: 7,

*      number: 8,
       group: 2,
  });
  });
  diff --git a/.bkit/core/engine/commands/workflow/step-table.ts b/.bkit/core/engine/commands/workflow/step-table.ts
  index 6ce52659c..3daab82b8 100644
  --- a/.bkit/core/engine/commands/workflow/step-table.ts
  +++ b/.bkit/core/engine/commands/workflow/step-table.ts
  @@ -57,49 +57,54 @@ export const WORKFLOW_STEPS: Readonly<Record<ResumableWorkflow, readonly Workflo
  build: [
  { step: "build-start-workflow", number: 1, title: "Start Workflow", setup: true },
  { step: "build-worktree-setup", number: 2, title: "Worktree Setup", setup: true },

- // A converted plan is checked again: Step 3 runs its plan check once more.
- { step: "build-plan-convert", number: 3, title: "Branch Sync", resumeAt: "build-branch-sync" },
  { step: "build-branch-sync", number: 3, title: "Branch Sync" },
- { step: "build-plan-current", number: 4, title: "Plan Current" },
- { step: "build-install-skills", number: 5, title: "Install Skills" },
- // A group's start commit is recorded before its execute runs: Step 6 again.

* // A converted plan is checked again: Step 4 runs its plan check once more.
* {
*      step: "build-plan-convert",
*      number: 4,
*      title: "Plan Convert",
*      resumeAt: "build-plan-convert",
* },
* { step: "build-plan-current", number: 5, title: "Plan Current" },
* { step: "build-install-skills", number: 6, title: "Install Skills" },
* // A group's start commit is recorded before its execute runs: Step 7 again.
  {
  step: "build-group-start",

-      number: 6,

*      number: 7,
       title: "Plan Execute",
       resumeAt: "build-plan-execute",
  },

- // A handover stops a group part-done: Step 6 runs again with a fresh brief.

* // A handover stops a group part-done: Step 7 runs again with a fresh brief.
  {
  step: "build-plan-execute",

-      number: 6,

*      number: 7,
       title: "Plan Execute",
       resumeOnVerdict: { HANDOVER: "build-plan-execute" },
  },

- // Verify, its group gate and the gaps fix route on the verify verdict: Step 7 again.
- { step: "build-plan-verify", number: 7, title: "Plan Verify", resumeAt: "build-plan-verify" },
- { step: "build-group-gate", number: 7, title: "Plan Verify", resumeAt: "build-plan-verify" },

* // Verify, its group gate and the gaps fix route on the verify verdict: Step 8 again.
* { step: "build-plan-verify", number: 8, title: "Plan Verify", resumeAt: "build-plan-verify" },
* { step: "build-group-gate", number: 8, title: "Plan Verify", resumeAt: "build-plan-verify" },
  {
  step: "build-plan-gaps-remediate",

-      number: 8,

*      number: 9,
       title: "Plan Gaps Remediate",
       resumeAt: "build-plan-verify",
  },

- { step: "build-plan-verify-holistic", number: 9, title: "Plan Verify Holistic" },
- // The reports are written: Step 10 continues at `bkit challenge merge`.
- { step: "build-challenge", number: 10, title: "Build Challenge", resumeAt: "build-challenge" },

* { step: "build-plan-verify-holistic", number: 10, title: "Plan Verify Holistic" },
* // The reports are written: Step 11 continues at `bkit challenge merge`.
* { step: "build-challenge", number: 11, title: "Build Challenge", resumeAt: "build-challenge" },
  // Run Tests routes on its own verdict, and a fix loops back to it.

- { step: "build-run-tests", number: 11, title: "Run Tests", resumeAt: "build-run-tests" },
- { step: "build-failure-diagnose", number: 12, title: "Failure Diagnose" },

* { step: "build-run-tests", number: 12, title: "Run Tests", resumeAt: "build-run-tests" },
* { step: "build-failure-diagnose", number: 13, title: "Failure Diagnose" },
  {
  step: "build-failure-remediate",

-      number: 13,

*      number: 14,
       title: "Failure Remediate",
       resumeAt: "build-run-tests",
  },

- { step: "build-summary", number: 14, title: "Summary" },
- { step: "build-create-pr", number: 15, title: "Close Workflow & Create PR" },
- { step: "build-close-workflow", number: 15, title: "Close Workflow & Create PR" },

* { step: "build-summary", number: 15, title: "Summary" },
* { step: "build-create-pr", number: 16, title: "Close Workflow & Create PR" },
* { step: "build-close-workflow", number: 16, title: "Close Workflow & Create PR" },
  ],
  debug: [
  { step: "debug-start-workflow", number: 1, title: "Start Workflow", setup: true },
  @@ -209,7 +214,7 @@ export const DECISION_ROUTES: Readonly<
  fix: "build-plan-execute",
  verify: "build-plan-verify",
  tests: "build-run-tests",

-      // Try again: a verify loop goes on to its gaps fix (Step 8), a tests loop to Step 12.

*      // Try again: a verify loop goes on to its gaps fix (Step 9), a tests loop to Step 13.
       retry: {
         "build-plan-verify": "build-plan-gaps-remediate",
         "build-group-gate": "build-plan-gaps-remediate",

@@ -232,9 +237,9 @@ export interface ResumePoint {
group: number | null;
/** Whether the latest run is this workflow, still IN_PROGRESS. */
active: boolean;

- /** Build only (null otherwise): the round Step 10's challenge runs as — see `challengeRound`. */

* /** Build only (null otherwise): the round Step 11's challenge runs as — see `challengeRound`. */
  challengeRound: number | null;

- /** Build only (null otherwise): the last allowed round has merged, so Step 10 goes on to Step 11. */

* /** Build only (null otherwise): the last allowed round has merged, so Step 11 goes on to Step 12. */
  challengeDone: boolean | null;
  }

diff --git a/.bkit/core/engine/render/**snapshots**/bkit-build.none.txt b/.bkit/core/engine/render/**snapshots**/bkit-build.none.txt
index a50e25c11..3f25e1dbd 100644
--- a/.bkit/core/engine/render/**snapshots**/bkit-build.none.txt
+++ b/.bkit/core/engine/render/**snapshots**/bkit-build.none.txt
@@ -23,8 +23,8 @@ description: "Build Feature — Autonomous implementation"

- **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
- **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
  -- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
  -- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
  +- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
  +- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.
- **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
- **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
  @@ -33,7 +33,7 @@ description: "Build Feature — Autonomous implementation"

_No tracker connected, skip step._

-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.

**Rules:** Copied word for word from `.agents/rules.md`.

@@ -147,15 +147,15 @@ _No tracker connected, skip step._
Record the decision and its route; counts carry on:

    ```bash

- "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --message="chore({FID}): decision <attempt>" --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body

* "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
  ```

  ```

7.  Route:

- - **If** `DECISION_ROUTE` = `fix` → Step 6.
- - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.
- - **If** `DECISION_ROUTE` = `retry` → Step 12.
- - **If** `DECISION_ROUTE` = `verify` → re-run Step 7.
- - **Else** → Step 11.

* - **If** `DECISION_ROUTE` = `fix` → Step 7.
* - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
* - **If** `DECISION_ROUTE` = `retry` → Step 13.
* - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
* - **Else** → Step 12.

8.  Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
    ```bash
    "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
    ```

@@ -259,7 +259,7 @@ _No tracker connected, skip step._ 5. Finish:
```bash
"{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1

- "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --message="chore({FID}): worktree-setup bkit [skip ci]" --number=2 --post --title="Worktree Setup" --tree={BRANCH}

* "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
  ```

  ```

### 🔒 Gate 2 — Worktree Setup

@@ -276,44 +276,55 @@ _No tracker connected, skip step._
`bash
    "{BKIT}" branches sync --merge-docs || exit 1
    `
-2. Check the plan is in task-block form, within the group caps:
+2. Finish:

- ```bash

  ```
- "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --number=3 --post --title="Branch Sync" --tree={BRANCH} --message="chore({FID}): branch-sync"
- ```

  ```
-

+### 🔒 Gate 3 — Branch Sync +
+- [ ] Docs synced (`branches sync`)
+- [ ] Mechanical checks passed (`steps finish`) +
+--- +
+## 🧠 Step 4 — Plan Convert +
+1. Check the plan is in task-block form, within the group caps:
`bash
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    `
Route:

- - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
- - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
- - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.

* - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
* - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.
* - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
  - **Else** → **Failure Path** naming each problem in the report.
    -3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
    +2. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    -4. Finish, then re-run sub-step 2 with `CONVERTED` = true:

- ```bash

  ```
- "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
- ```

  ```

-5. Finish:
+3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}

* "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
  ```

  ```

-### 🔒 Gate 3 — Branch Sync
+### 🔒 Gate 4 — Plan Convert

-- [ ] Docs synced (`branches sync`)
-- [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Plan checked (`tests plan-check`)
+- [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Converted plan checked again (`tests plan-check`)

- [ ] Mechanical checks passed (`steps finish`)

---

-## 🧠 Step 4 — Plan Current
+## 🧠 Step 5 — Plan Current

1.  Resolve plan base commit and collect code landed since:
    ```bash
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:

- - **If** exit 12 → Step 5.

* - **If** exit 12 → Step 6.
  - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
  - **Else** → **Failure Path**.

2.  **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
    @@ -322,11 +333,11 @@ _No tracker connected, skip step._
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
3.  Finish:
    ```bash

    ```

- "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --message="chore({FID}): plan-current" --number=4 --post --title="Plan Current"

* "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
  ```

  ```

-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.
+4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.

-### 🔒 Gate 4 — Plan Current
+### 🔒 Gate 5 — Plan Current

- [ ] Base commit resolved
- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
      @@ -336,7 +347,7 @@ _No tracker connected, skip step._

---

-## 🧠 Step 5 — Install Skills
+## 🧠 Step 6 — Install Skills

**Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.

@@ -346,10 +357,10 @@ _No tracker connected, skip step._
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash). 2. Finish:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --message="chore({FID}): install-skills" --number=5 --post --title="Install Skills"

* "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --number=6 --post --title="Install Skills" --message="chore({FID}): install-skills"
  ```

  ```

-### 🔒 Gate 5 — Install Skills
+### 🔒 Gate 6 — Install Skills

- [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
- [ ] New skills installed
      @@ -357,19 +368,19 @@ _No tracker connected, skip step._

---

-## Group Loop — Steps 6-8
+## Group Loop — Steps 7-9

-One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.
+One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.

---

-### 🧠 Step 6 — Plan Execute
+### 🧠 Step 7 — Plan Execute

1.  Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
    ```bash
    "{BKIT}" context brief --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --next --dir="docs/plans/{YYYYMM}/logs/{FID}" --file="{STATUS}" --note-file="{SESSION_DIR}/brief-note.md"
    ```

- Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.

* Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.

2.  Record the group's start commit, once per group:
    ```bash
    "{BKIT}" status route --step=build-group-start --group={GROUP} --file="{STATUS}" --workflow=build
    ```

@@ -385,14 +396,14 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`. 4. Finish:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"

* "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --number=7 --post --title="Plan Execute" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
  ```
  Hold `verdict` as `EXECUTE_VERDICT`.
  ```

-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:

- - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
- - **Else** → Step 7.
    +5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:

* - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.
* - **Else** → Step 8.

-### 🔒 Gate 6 — Plan Execute
+### 🔒 Gate 7 — Plan Execute

- [ ] Group briefed (`context brief`), start commit recorded
- [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
      @@ -401,7 +412,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr

---

-### 🧠 Step 7 — Plan Verify
+### 🧠 Step 8 — Plan Verify

1.  Derive the attempt the verify artifact is named for:
    ```bash

    ```

@@ -428,7 +439,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. 5. Finish:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"

* "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
  ```
  Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
  ```

6.  Route:
    @@ -447,25 +458,25 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    - **Else** → **Failure Path**.
7.  Finish:
    ```bash

    ```

- "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"

* "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
  ```

  ```

-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open). 10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
`bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     `

- Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 7, `PAUSE_POINT` = `build.verify`. Route — first match wins:

* Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`. Route — first match wins:
  - **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
  - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** (`VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX`) → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.

- - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).
- - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.

* - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).
* - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.
  - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** (no round left to fix the group gate).
  - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
  - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
  - **Else** → **Failure Path**.

11. **Else** → **Failure Path**.

-### 🔒 Gate 7 — Plan Verify
+### 🔒 Gate 8 — Plan Verify

- [ ] Test-first reds audited (`tests green`)
- [ ] Group diff cut from its start commit (`context diff`)
      @@ -477,9 +488,9 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr

---

-### 🧠 Step 8 — Plan Gaps Remediate
+### 🧠 Step 9 — Plan Gaps Remediate

-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here. +**Run only if** Step 8 sub-step 10 or the **Decision Pause** routed here.

1.  Read status.jsonl and derive next `STRATEGY`:
    ```bash

    ```

@@ -505,7 +516,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`. 3. Finish — the header's `Strategy` is recorded:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>" --number=8 --post --title="Plan Gaps Remediate"

* "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
  ```
  Hold `fields.Fixed` as `VERIFY_FIXED`.
  ```

4.  Check the attempt changed source, not only logs and ledgers:
    @@ -513,11 +524,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
    Route:
    ```

- - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
- - **If** exit 0 → re-run Step 7.

* - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
* - **If** exit 0 → re-run Step 8.
  - **Else** → **Failure Path**.

-### 🔒 Gate 8 — Plan Gaps Remediate
+### 🔒 Gate 9 — Plan Gaps Remediate

- [ ] Strategy computed before invocation
- [ ] Verify round read back on resume
      @@ -527,7 +538,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr

---

-## 🧠 Step 9 — Plan Verify Holistic
+## 🧠 Step 10 — Plan Verify Holistic

Runs once, after the last group; challenge fix groups pass through here on the way back to Build Challenge.

@@ -535,7 +546,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
`bash
    "{BKIT}" status route --step=build-plan-verify-holistic --file="{STATUS}" --workflow=build
    `

- **If** `verdict` non-null → Step 10.

* **If** `verdict` non-null → Step 11.

2.  Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```

@@ -546,26 +557,26 @@ Runs once, after the last group; challenge fix groups pass through here on the w
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`. 3. Finish:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"

* "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic"
  ```

  ```

4.  Route:

- - **If** `verdict` = PASS or CONCERNS → Step 10.

* - **If** `verdict` = PASS or CONCERNS → Step 11.
  - **Else** → **Failure Path**.

-### 🔒 Gate 9 — Plan Verify Holistic
+### 🔒 Gate 10 — Plan Verify Holistic

- [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
- [ ] Mechanical checks passed (`steps finish`)

---

-## 🧠 Step 10 — Build Challenge
+## 🧠 Step 11 — Build Challenge

-1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
+1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
`bash
    "{BKIT}" status resume --workflow=build --file="{STATUS}"
    `

- `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:

* `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:
  ```bash
  "{BKIT}" counters max --point=build.challenge
  ```

@@ -591,7 +602,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`. 4. Wait for all subagents to complete, then finish — `verdict` = worst of the reports (`FAIL > CONCERNS > PASS`), `failures` = their sum. **If** `CHALLENGE_SIZE` = small → drop the `--agent=bkit-build-challenge-1` / `--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md` pair:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --message="chore({FID}): build-challenge attempt <attempt>" --number=10 --post --title="Build Challenge"

* "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --number=11 --post --title="Build Challenge" --message="chore({FID}): build-challenge attempt <attempt>"
  ```

  ```

5.  Merge the findings into the plan — `CRITICAL` / `HIGH` / `MEDIUM` findings become task blocks in new groups of <= `{MAX_TASKS_PER_GROUP}` tasks, `LOW` ones deferral rows. **If** `CHALLENGE_SIZE` = small → drop the `--report` for `build-challenge-1.md`:
    ```bash

    ```

@@ -604,12 +615,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w - exit 23 (a finding names no test or passes the test caps) → hold the printed `problems` → `Your last findings failed the plan check: {problems}. Give every finding a TEST FIRST within the plan caps.` - **Else** → **Failure Path**. 6. Clear `CHALLENGE_REFORMAT`. Route:

- - **If** `route` = `none` → Step 11.
- - **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
- - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.

* - **If** `route` = `none` → Step 12.
* - **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
* - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.
  - **Else** → **Failure Path**.

-### 🔒 Gate 10 — Build Challenge
+### 🔒 Gate 11 — Build Challenge

- [ ] Round limit read (`counters max --point=build.challenge`) before sizing
- [ ] Change sized (`challenge gate`)
      @@ -620,7 +631,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🤖 Step 11 — Run Tests
+## 🤖 Step 12 — Run Tests

1.  Derive the attempt the test log is named for:
    ```bash

    ```

@@ -637,21 +648,21 @@ Runs once, after the last group; challenge fix groups pass through here on the w - **Else** → **Failure Path**. 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
```bash

- "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --message="chore({FID}): run-tests attempt <attempt>" --number=11 --post --title="Run Tests"

* "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
  ```

  ```

4.  Route:

- - **If** `TEST_VERDICT` = PASS → Step 14.

* - **If** `TEST_VERDICT` = PASS → Step 15.
  - **If** `TEST_VERDICT` = FAIL → route on test rounds:
    ```bash
    "{BKIT}" counters route --name=TEST_ATTEMPT --of=build-run-tests:current --file="{STATUS}" --workflow=build --point=build.tests --continue=decision-pause --exceeded=failure-path
    ```
    Hold `value` as `{TEST_ROUNDS}`, `max` as `{PAUSE_MAX}`.
    - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** (`build.tests.maxAttempts` used up; no round left).

-     - **If** exit 0 → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.

*     - **If** exit 0 → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
      - **Else** → **Failure Path**.
  - **Else** → **Failure Path**.

-### 🔒 Gate 11 — Run Tests
+### 🔒 Gate 12 — Run Tests

- [ ] Tests executed
- [ ] Mechanical checks passed (`steps finish`)
      @@ -660,9 +671,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🧠 Step 12 — Failure Diagnose
+## 🧠 Step 13 — Failure Diagnose

-**Run only if** Step 11 tests FAIL. +**Run only if** Step 12 tests FAIL.

1.  Read status.jsonl and derive next `STRATEGY`:
    ```bash

    ```

@@ -679,10 +690,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`. 3. Finish:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --message="chore({FID}): failure-diagnose attempt <attempt>" --number=12 --post --title="Failure Diagnose"

* "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --number=13 --post --title="Failure Diagnose" --message="chore({FID}): failure-diagnose attempt <attempt>"
  ```

  ```

-### 🔒 Gate 12 — Failure Diagnose
+### 🔒 Gate 13 — Failure Diagnose

- [ ] Strategy computed before invocation
- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
      @@ -690,9 +701,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🧠 Step 13 — Failure Remediate
+## 🧠 Step 14 — Failure Remediate

-**Run only if** Step 11 tests FAIL. +**Run only if** Step 12 tests FAIL.

1.  Read the strategy the diagnosis was written for:
    ```bash

    ```

@@ -708,12 +719,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
Update: Source and test files.
Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
-3. Finish → re-run Step 11:
+3. Finish → re-run Step 12:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --message="chore({FID}): failure-remediate attempt <attempt>" --number=13 --post --title="Failure Remediate"

* "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --number=14 --post --title="Failure Remediate" --message="chore({FID}): failure-remediate attempt <attempt>"
  ```

  ```

-### 🔒 Gate 13 — Failure Remediate
+### 🔒 Gate 14 — Failure Remediate

- [ ] Strategy read before invocation
- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
      @@ -722,9 +733,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🧠 Step 14 — Summary
+## 🧠 Step 15 — Summary

-**Run only if** all Step 11 tests PASS. +**Run only if** all Step 12 tests PASS.

1.  Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash

    ```

@@ -733,7 +744,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
**If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`. 2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
```bash

- "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --message="chore({FID}): summary" --number=14 --post --title=Summary --link-ref={BRANCH} --comment-body

* "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
  ````
  ```bash
  "{BKIT}" prs probe --base=dev
  ````

@@ -747,11 +758,11 @@ Runs once, after the last group; challenge fix groups pass through here on the w
"{BKIT}" branches push --mode=feature --set-upstream
``` 4. Route:

- - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 15.

* - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
  - **If** `SUMMARY_VERDICT` = FAIL → display `build-summary.md` content verbatim as final message to user → **Failure Path**.
  - **Else** → **Failure Path**.

-### 🔒 Gate 14 — Summary
+### 🔒 Gate 15 — Summary

- [ ] `workflows summary` printed a verdict
- [ ] Mechanical checks passed (`steps finish`)
      @@ -761,7 +772,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🤖 Step 15 — Close Workflow & Create PR
+## 🤖 Step 16 — Close Workflow & Create PR

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

@@ -784,7 +795,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w 3. Re-read labels, then mirror the roadmap row to `dev`, close the run (telemetry, report, artifact links) and commit it — the subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto` — push with the HEAD-Subject Assertion, release the lock; `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired:
```bash
"{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1

- "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=15 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1

* "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
  "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
  "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
  ```

  ```

@@ -830,7 +841,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w 11. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.

-### 🔒 Gate 15 — Close Workflow & Create PR
+### 🔒 Gate 16 — Close Workflow & Create PR

````bash
"{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 654a9254f..2199f86d7 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -23,8 +23,8 @@ description: "Build Feature — Autonomous implementation"

- **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
- **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
-- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
+- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.
- **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
- **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
@@ -58,7 +58,7 @@ description: "Build Feature — Autonomous implementation"

<!-- bkit:tracker true end -->

-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.

**Rules:** Copied word for word from `.agents/rules.md`.

@@ -174,15 +174,15 @@ description: "Build Feature — Autonomous implementation"
   Record the decision and its route; counts carry on:

   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --message="chore({FID}): decision <attempt>" --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
   ```

7. Route:
-   - **If** `DECISION_ROUTE` = `fix` → Step 6.
-   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.
-   - **If** `DECISION_ROUTE` = `retry` → Step 12.
-   - **If** `DECISION_ROUTE` = `verify` → re-run Step 7.
-   - **Else** → Step 11.
+   - **If** `DECISION_ROUTE` = `fix` → Step 7.
+   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
+   - **If** `DECISION_ROUTE` = `retry` → Step 13.
+   - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
+   - **Else** → Step 12.
8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
   ```bash
   "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -342,7 +342,7 @@ description: "Build Feature — Autonomous implementation"
5. Finish:
   ```bash
   "{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --message="chore({FID}): worktree-setup bkit [skip ci]" --number=2 --post --title="Worktree Setup" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
   ```

### 🔒 Gate 2 — Worktree Setup
@@ -359,44 +359,55 @@ description: "Build Feature — Autonomous implementation"
   ```bash
   "{BKIT}" branches sync --merge-docs || exit 1
   ```
-2. Check the plan is in task-block form, within the group caps:
+2. Finish:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --number=3 --post --title="Branch Sync" --tree={BRANCH} --message="chore({FID}): branch-sync"
+   ```
+
+### 🔒 Gate 3 — Branch Sync
+
+- [ ] Docs synced (`branches sync`)
+- [ ] Mechanical checks passed (`steps finish`)
+
+---
+
+## 🧠 Step 4 — Plan Convert
+
+1. Check the plan is in task-block form, within the group caps:
   ```bash
   "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
   ```
   Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
-   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
+   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.
+   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
   - **Else** → **Failure Path** naming each problem in the report.
-3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
+2. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
   Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
   Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
-4. Finish, then re-run sub-step 2 with `CONVERTED` = true:
-   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
-   ```
-5. Finish:
+3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
   ```

-### 🔒 Gate 3 — Branch Sync
+### 🔒 Gate 4 — Plan Convert

-- [ ] Docs synced (`branches sync`)
-- [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Plan checked (`tests plan-check`)
+- [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Converted plan checked again (`tests plan-check`)
- [ ] Mechanical checks passed (`steps finish`)

---

-## 🧠 Step 4 — Plan Current
+## 🧠 Step 5 — Plan Current

1. Resolve plan base commit and collect code landed since:
   ```bash
   "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
   ```
   Route:
-   - **If** exit 12 → Step 5.
+   - **If** exit 12 → Step 6.
   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
   - **Else** → **Failure Path**.
2. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
@@ -405,11 +416,11 @@ description: "Build Feature — Autonomous implementation"
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
3. Finish:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --message="chore({FID}): plan-current" --number=4 --post --title="Plan Current"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
   ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.
+4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.

-### 🔒 Gate 4 — Plan Current
+### 🔒 Gate 5 — Plan Current

- [ ] Base commit resolved
- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
@@ -419,7 +430,7 @@ description: "Build Feature — Autonomous implementation"

---

-## 🧠 Step 5 — Install Skills
+## 🧠 Step 6 — Install Skills

**Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.

@@ -429,10 +440,10 @@ description: "Build Feature — Autonomous implementation"
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
2. Finish:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --message="chore({FID}): install-skills" --number=5 --post --title="Install Skills"
+   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --number=6 --post --title="Install Skills" --message="chore({FID}): install-skills"
   ```

-### 🔒 Gate 5 — Install Skills
+### 🔒 Gate 6 — Install Skills

- [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
- [ ] New skills installed
@@ -440,19 +451,19 @@ description: "Build Feature — Autonomous implementation"

---

-## Group Loop — Steps 6-8
+## Group Loop — Steps 7-9

-One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.
+One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.

---

-### 🧠 Step 6 — Plan Execute
+### 🧠 Step 7 — Plan Execute

1. Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
   ```bash
   "{BKIT}" context brief --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --next --dir="docs/plans/{YYYYMM}/logs/{FID}" --file="{STATUS}" --note-file="{SESSION_DIR}/brief-note.md"
   ```
-   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.
+   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.
2. Record the group's start commit, once per group:
   ```bash
   "{BKIT}" status route --step=build-group-start --group={GROUP} --file="{STATUS}" --workflow=build
@@ -468,14 +479,14 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`.
4. Finish:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --number=7 --post --title="Plan Execute" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
   ```
   Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
-   - **Else** → Step 7.
+5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.
+   - **Else** → Step 8.

-### 🔒 Gate 6 — Plan Execute
+### 🔒 Gate 7 — Plan Execute

- [ ] Group briefed (`context brief`), start commit recorded
- [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
@@ -484,7 +495,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr

---

-### 🧠 Step 7 — Plan Verify
+### 🧠 Step 8 — Plan Verify

1. Derive the attempt the verify artifact is named for:
   ```bash
@@ -511,7 +522,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
5. Finish:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
   ```
   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
6. Route:
@@ -530,25 +541,25 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
   - **Else** → **Failure Path**.
8. Finish:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
+   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
   ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open).
10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
    ```bash
    "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
    ```
-    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 7, `PAUSE_POINT` = `build.verify`. Route — first match wins:
+    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`. Route — first match wins:
    - **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** (`VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX`) → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.
    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** (no round left to fix the group gate).
    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
    - **Else** → **Failure Path**.
11. **Else** → **Failure Path**.

-### 🔒 Gate 7 — Plan Verify
+### 🔒 Gate 8 — Plan Verify

- [ ] Test-first reds audited (`tests green`)
- [ ] Group diff cut from its start commit (`context diff`)
@@ -560,9 +571,9 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr

---

-### 🧠 Step 8 — Plan Gaps Remediate
+### 🧠 Step 9 — Plan Gaps Remediate

-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 8 sub-step 10 or the **Decision Pause** routed here.

1. Read status.jsonl and derive next `STRATEGY`:
   ```bash
@@ -588,7 +599,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
3. Finish — the header's `Strategy` is recorded:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>" --number=8 --post --title="Plan Gaps Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
   ```
   Hold `fields.Fixed` as `VERIFY_FIXED`.
4. Check the attempt changed source, not only logs and ledgers:
@@ -596,11 +607,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
   ```
   Route:
-   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-   - **If** exit 0 → re-run Step 7.
+   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 0 → re-run Step 8.
   - **Else** → **Failure Path**.

-### 🔒 Gate 8 — Plan Gaps Remediate
+### 🔒 Gate 9 — Plan Gaps Remediate

- [ ] Strategy computed before invocation
- [ ] Verify round read back on resume
@@ -610,7 +621,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr

---

-## 🧠 Step 9 — Plan Verify Holistic
+## 🧠 Step 10 — Plan Verify Holistic

Runs once, after the last group; challenge fix groups pass through here on the way back to Build Challenge.

@@ -618,7 +629,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   ```bash
   "{BKIT}" status route --step=build-plan-verify-holistic --file="{STATUS}" --workflow=build
   ```
-   **If** `verdict` non-null → Step 10.
+   **If** `verdict` non-null → Step 11.
2. Write the run's diff to the file the agent reads:
   ```bash
   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
@@ -629,26 +640,26 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
3. Finish:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic"
   ```
4. Route:
-   - **If** `verdict` = PASS or CONCERNS → Step 10.
+   - **If** `verdict` = PASS or CONCERNS → Step 11.
   - **Else** → **Failure Path**.

-### 🔒 Gate 9 — Plan Verify Holistic
+### 🔒 Gate 10 — Plan Verify Holistic

- [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
- [ ] Mechanical checks passed (`steps finish`)

---

-## 🧠 Step 10 — Build Challenge
+## 🧠 Step 11 — Build Challenge

-1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
+1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
   ```bash
   "{BKIT}" status resume --workflow=build --file="{STATUS}"
   ```
-   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:
+   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:
   ```bash
   "{BKIT}" counters max --point=build.challenge
   ```
@@ -674,7 +685,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
4. Wait for all subagents to complete, then finish — `verdict` = worst of the reports (`FAIL > CONCERNS > PASS`), `failures` = their sum. **If** `CHALLENGE_SIZE` = small → drop the `--agent=bkit-build-challenge-1` / `--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md` pair:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --message="chore({FID}): build-challenge attempt <attempt>" --number=10 --post --title="Build Challenge"
+   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --number=11 --post --title="Build Challenge" --message="chore({FID}): build-challenge attempt <attempt>"
   ```
5. Merge the findings into the plan — `CRITICAL` / `HIGH` / `MEDIUM` findings become task blocks in new groups of <= `{MAX_TASKS_PER_GROUP}` tasks, `LOW` ones deferral rows. **If** `CHALLENGE_SIZE` = small → drop the `--report` for `build-challenge-1.md`:
   ```bash
@@ -687,12 +698,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
     - exit 23 (a finding names no test or passes the test caps) → hold the printed `problems` → `Your last findings failed the plan check: {problems}. Give every finding a TEST FIRST within the plan caps.`
   - **Else** → **Failure Path**.
6. Clear `CHALLENGE_REFORMAT`. Route:
-   - **If** `route` = `none` → Step 11.
-   - **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
-   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.
+   - **If** `route` = `none` → Step 12.
+   - **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
+   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.
   - **Else** → **Failure Path**.

-### 🔒 Gate 10 — Build Challenge
+### 🔒 Gate 11 — Build Challenge

- [ ] Round limit read (`counters max --point=build.challenge`) before sizing
- [ ] Change sized (`challenge gate`)
@@ -703,7 +714,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🤖 Step 11 — Run Tests
+## 🤖 Step 12 — Run Tests

1. Derive the attempt the test log is named for:
   ```bash
@@ -720,21 +731,21 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   - **Else** → **Failure Path**.
3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --message="chore({FID}): run-tests attempt <attempt>" --number=11 --post --title="Run Tests"
+   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
   ```
4. Route:
-   - **If** `TEST_VERDICT` = PASS → Step 14.
+   - **If** `TEST_VERDICT` = PASS → Step 15.
   - **If** `TEST_VERDICT` = FAIL → route on test rounds:
     ```bash
     "{BKIT}" counters route --name=TEST_ATTEMPT --of=build-run-tests:current --file="{STATUS}" --workflow=build --point=build.tests --continue=decision-pause --exceeded=failure-path
     ```
     Hold `value` as `{TEST_ROUNDS}`, `max` as `{PAUSE_MAX}`.
     - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** (`build.tests.maxAttempts` used up; no round left).
-     - **If** exit 0 → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
+     - **If** exit 0 → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
     - **Else** → **Failure Path**.
   - **Else** → **Failure Path**.

-### 🔒 Gate 11 — Run Tests
+### 🔒 Gate 12 — Run Tests

- [ ] Tests executed
- [ ] Mechanical checks passed (`steps finish`)
@@ -743,9 +754,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🧠 Step 12 — Failure Diagnose
+## 🧠 Step 13 — Failure Diagnose

-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.

1. Read status.jsonl and derive next `STRATEGY`:
   ```bash
@@ -762,10 +773,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
3. Finish:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --message="chore({FID}): failure-diagnose attempt <attempt>" --number=12 --post --title="Failure Diagnose"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --number=13 --post --title="Failure Diagnose" --message="chore({FID}): failure-diagnose attempt <attempt>"
   ```

-### 🔒 Gate 12 — Failure Diagnose
+### 🔒 Gate 13 — Failure Diagnose

- [ ] Strategy computed before invocation
- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
@@ -773,9 +784,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🧠 Step 13 — Failure Remediate
+## 🧠 Step 14 — Failure Remediate

-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.

1. Read the strategy the diagnosis was written for:
   ```bash
@@ -791,12 +802,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
   Update: Source and test files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
-3. Finish → re-run Step 11:
+3. Finish → re-run Step 12:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --message="chore({FID}): failure-remediate attempt <attempt>" --number=13 --post --title="Failure Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --number=14 --post --title="Failure Remediate" --message="chore({FID}): failure-remediate attempt <attempt>"
   ```

-### 🔒 Gate 13 — Failure Remediate
+### 🔒 Gate 14 — Failure Remediate

- [ ] Strategy read before invocation
- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
@@ -805,9 +816,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🧠 Step 14 — Summary
+## 🧠 Step 15 — Summary

-**Run only if** all Step 11 tests PASS.
+**Run only if** all Step 12 tests PASS.

1. Write `build-summary.md` from this run's status rows and the plan's tasks:
   ```bash
@@ -816,7 +827,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --message="chore({FID}): summary" --number=14 --post --title=Summary --link-ref={BRANCH} --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
   ```
   ```bash
   "{BKIT}" prs probe --base=dev
@@ -830,11 +841,11 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   "{BKIT}" branches push --mode=feature --set-upstream
   ```
4. Route:
-   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 15.
+   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
   - **If** `SUMMARY_VERDICT` = FAIL → display `build-summary.md` content verbatim as final message to user<!-- bkit:tracker true start -->. Line 1 of the final message = the no-issue warning, when one was emitted.<!-- bkit:tracker true end --> → **Failure Path**.
   - **Else** → **Failure Path**.

-### 🔒 Gate 14 — Summary
+### 🔒 Gate 15 — Summary

- [ ] `workflows summary` printed a verdict
- [ ] Mechanical checks passed (`steps finish`)
@@ -844,7 +855,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w

---

-## 🤖 Step 15 — Close Workflow & Create PR
+## 🤖 Step 16 — Close Workflow & Create PR

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

@@ -875,7 +886,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
   <!-- bkit:tracker true end -->
   ```bash
   "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=15 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
   ```
@@ -917,7 +928,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
7. <!-- bkit:tracker true start -->
   **Skip if** `ISSUE_ID` empty. Comment:
   ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=15 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
   ```
   <!-- bkit:tracker true end -->
8. <!-- bkit:tracker true start -->
@@ -945,7 +956,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
11. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke.
12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.

-### 🔒 Gate 15 — Close Workflow & Create PR
+### 🔒 Gate 16 — Close Workflow & Create PR

```bash
"{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
diff --git a/dist/commands/workflow/step-table.js b/dist/commands/workflow/step-table.js
index 1f6bacdca..c88e28f94 100644
--- a/dist/commands/workflow/step-table.js
+++ b/dist/commands/workflow/step-table.js
@@ -37,49 +37,54 @@ export const WORKFLOW_STEPS = {
    build: [
        { step: "build-start-workflow", number: 1, title: "Start Workflow", setup: true },
        { step: "build-worktree-setup", number: 2, title: "Worktree Setup", setup: true },
-        // A converted plan is checked again: Step 3 runs its plan check once more.
-        { step: "build-plan-convert", number: 3, title: "Branch Sync", resumeAt: "build-branch-sync" },
        { step: "build-branch-sync", number: 3, title: "Branch Sync" },
-        { step: "build-plan-current", number: 4, title: "Plan Current" },
-        { step: "build-install-skills", number: 5, title: "Install Skills" },
-        // A group's start commit is recorded before its execute runs: Step 6 again.
+        // A converted plan is checked again: Step 4 runs its plan check once more.
+        {
+            step: "build-plan-convert",
+            number: 4,
+            title: "Plan Convert",
+            resumeAt: "build-plan-convert",
+        },
+        { step: "build-plan-current", number: 5, title: "Plan Current" },
+        { step: "build-install-skills", number: 6, title: "Install Skills" },
+        // A group's start commit is recorded before its execute runs: Step 7 again.
        {
            step: "build-group-start",
-            number: 6,
+            number: 7,
            title: "Plan Execute",
            resumeAt: "build-plan-execute",
        },
-        // A handover stops a group part-done: Step 6 runs again with a fresh brief.
+        // A handover stops a group part-done: Step 7 runs again with a fresh brief.
        {
            step: "build-plan-execute",
-            number: 6,
+            number: 7,
            title: "Plan Execute",
            resumeOnVerdict: { HANDOVER: "build-plan-execute" },
        },
-        // Verify, its group gate and the gaps fix route on the verify verdict: Step 7 again.
-        { step: "build-plan-verify", number: 7, title: "Plan Verify", resumeAt: "build-plan-verify" },
-        { step: "build-group-gate", number: 7, title: "Plan Verify", resumeAt: "build-plan-verify" },
+        // Verify, its group gate and the gaps fix route on the verify verdict: Step 8 again.
+        { step: "build-plan-verify", number: 8, title: "Plan Verify", resumeAt: "build-plan-verify" },
+        { step: "build-group-gate", number: 8, title: "Plan Verify", resumeAt: "build-plan-verify" },
        {
            step: "build-plan-gaps-remediate",
-            number: 8,
+            number: 9,
            title: "Plan Gaps Remediate",
            resumeAt: "build-plan-verify",
        },
-        { step: "build-plan-verify-holistic", number: 9, title: "Plan Verify Holistic" },
-        // The reports are written: Step 10 continues at `bkit challenge merge`.
-        { step: "build-challenge", number: 10, title: "Build Challenge", resumeAt: "build-challenge" },
+        { step: "build-plan-verify-holistic", number: 10, title: "Plan Verify Holistic" },
+        // The reports are written: Step 11 continues at `bkit challenge merge`.
+        { step: "build-challenge", number: 11, title: "Build Challenge", resumeAt: "build-challenge" },
        // Run Tests routes on its own verdict, and a fix loops back to it.
-        { step: "build-run-tests", number: 11, title: "Run Tests", resumeAt: "build-run-tests" },
-        { step: "build-failure-diagnose", number: 12, title: "Failure Diagnose" },
+        { step: "build-run-tests", number: 12, title: "Run Tests", resumeAt: "build-run-tests" },
+        { step: "build-failure-diagnose", number: 13, title: "Failure Diagnose" },
        {
            step: "build-failure-remediate",
-            number: 13,
+            number: 14,
            title: "Failure Remediate",
            resumeAt: "build-run-tests",
        },
-        { step: "build-summary", number: 14, title: "Summary" },
-        { step: "build-create-pr", number: 15, title: "Close Workflow & Create PR" },
-        { step: "build-close-workflow", number: 15, title: "Close Workflow & Create PR" },
+        { step: "build-summary", number: 15, title: "Summary" },
+        { step: "build-create-pr", number: 16, title: "Close Workflow & Create PR" },
+        { step: "build-close-workflow", number: 16, title: "Close Workflow & Create PR" },
    ],
    debug: [
        { step: "debug-start-workflow", number: 1, title: "Start Workflow", setup: true },
@@ -180,7 +185,7 @@ export const DECISION_ROUTES = {
            fix: "build-plan-execute",
            verify: "build-plan-verify",
            tests: "build-run-tests",
-            // Try again: a verify loop goes on to its gaps fix (Step 8), a tests loop to Step 12.
+            // Try again: a verify loop goes on to its gaps fix (Step 9), a tests loop to Step 13.
            retry: {
                "build-plan-verify": "build-plan-gaps-remediate",
                "build-group-gate": "build-plan-gaps-remediate",
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index e1048d60b..7c06bac19 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -307,3 +307,5 @@
{"schema":2,"ts":1792718454116,"kind":"knowledge","key":"tracker-true-block-between-group-and-false-block-breaks-none-render","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"build","step":"build-challenge-remediate","subagent":"bkit-build-challenge-remediate","model":"claude-sonnet-5-5"},"summary":"A standalone tracker true block placed between a github/linear/jira group and its false block makes the none render print a spurious No tracker connected stub","rootCause":"The tracker renderer pairs the github, linear and jira blocks with a false block only when the false block follows the group directly; anything between them leaves the group unpaired and it renders the NONE_STUB line under none, while the false block then renders as a separate standalone block.","remediation":"Order a Step 1 tracker region as github, linear, jira, false, then any standalone true block. After editing workflow sources, run the none render baselines (trackers.test.ts) and read the snapshot diff for a stray stub line.","status":"ACTIVE"}
{"schema":2,"ts":1792718455123,"kind":"knowledge","key":"wording-retired-prefix-of-new-text-and-loose-list-items","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"build","step":"build-challenge-remediate","subagent":"bkit-build-challenge-remediate","model":"claude-sonnet-5-5"},"summary":"A retired wording that is a prefix of its new text makes pnpm wording:sync re-expand synced lines; a blank line inside a workflow list item makes prettier pad every block in it","rootCause":"wording:sync rewrites any line that starts with a retired text into the clause text, so a retired block equal to the first part of the new text appends the new tail again on every run. Separately, one blank line inside a markdown list item makes prettier treat the item as loose and insert blank lines around every block in it, including tracker marker lines that must stay tight.","remediation":"When the old clause text is a prefix of the new one, leave the old text out of the retired block. In a tracker-block list item, keep the block free of blank lines (put the else-case in the lead-in sentence or as a Route bullet), then run prettier --check on the workflow files and wording:sync twice to confirm it is idempotent.","status":"ACTIVE"}
{"schema":2,"ts":1792747332665,"kind":"knowledge","key":"identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-knowledge","model":"claude-opus-5-5"},"references":["343","234","scripts/harvest/ledgers.ts",".bkit/core/engine/ledgers/telemetry.ts (identity, VALID_KINDS)","docs/observability.md § [bkit-harvest] prefix","8badea26","abe49983","683"],"summary":"A prune gated on identity destroys rows the dedup fold dropped — friction keys truncate to ~68 chars and collide, so two distinct entries share one identity and only one is ever stored","description":"Found while making bkit harvest MOVE consumer friction (#343). fold() is last-write-wins per identity(), so colliding rows collapse to ONE stored row. An identity-gated prune then deletes EVERY colliding row from the consumer while the store kept one — the loser exists nowhere. Reproduced against live consumer-a data: 'Plan Step 11: close-workflow STRAY guard rejects protocol-mandated docs/pending.md edit' (ts 1783944967776) and a different entry about docs/decisions.md + docs/pending.md edits truncate to the byte-identical key 'friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma'; the first was destroyed. Harmless under the old copy-only harvest, fatal the moment harvest deletes. Second instance of the same shape: identity() has no default branch, so rows whose kind is outside VALID_KINDS all collide on undefined — live data has kind:'tool-failure' and kind:'agent-rework' rows in consumer-a friction, and the newer evicted the older from the store.","rootCause":"identity() is a lossy projection of a row (kind+repo+key, or ts when key is absent), and fold() treats an identity match as an upsert. Anything gating a DELETE on that projection deletes rows the projection cannot distinguish. Two independent sources of collision: (1) friction keys are truncated at write time, so distinct content yields identical keys; (2) identity() returns undefined for kinds outside VALID_KINDS, mapping every unknown-kind row onto a single fold slot.","remediation":"Gate any destructive drain on byte-for-byte row CONTENT read back off disk, never on identity, and keep a store of every DISTINCT row (content dedup), never of fold winners — `scripts/harvest/ledgers.ts` header invariants (the harvest, `pnpm harvest`). The same gate covers friction rows and the `chat` / `run` rows pruned from `.bkit/stats.jsonl`. A fold loser is then stored and safe to prune; consumer lines not in the store stay and are logged (`kept N line(s) not in the store`). `identity()` (`.bkit/core/engine/ledgers/telemetry.ts`) still has no branch for kinds outside VALID_KINDS — never gate a delete on it. General rule: an identity used for dedup/upsert is NOT safe as a delete gate.","status":"ACTIVE"}
+{"schema":3,"ts":1793021911995,"kind":"knowledge","key":"red-snapshot-freezes-the-test-file-write-it-lint-clean-first","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts (onlyAddsLines, redRows)","docs/plans/202610/logs/705-build-plan-convert/status.jsonl","705"],"summary":"`bkit tests red` snapshots the test file; a later non-additive edit to it makes `tests green` report `test-changed`","description":"Each red row stores a copy of the test file and `tests green` compares it with the current file: only inserted lines are tolerated (`onlyAddsLines`), so a test rewritten after its red — even for a lint fix — leaves a `test-changed` test-order gap on that task.","remediation":"Write the test lint-clean and typecheck-clean before running `tests red` for it, and touch neither the test file nor its fixtures afterwards; a needed rewrite is a human TEST EXCEPTION, never a re-run of the red.","status":"ACTIVE"}
+{"schema":3,"ts":1793021911996,"kind":"knowledge","key":"renumbering-a-workflow-leaves-instructions-md-local-entries-stale","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"references":[".bkit/instructions.md (Local Instructions, per-file `- source:` blocks)",".bkit/core/engine/tools/instructions-coverage.test.ts",".bkit/core/engine/tools/instructions.ts (syncCoverage)","705"],"summary":"Renumbering a workflow's steps leaves `.bkit/instructions.md` local entries quoting lines the file no longer holds, and `pnpm instructions:sync` exits 1 without fixing them","description":"Every standing line (routes, gate items, step prose) is listed verbatim under that file's `- source:` block; `syncCoverage` adds new lines and rewrites clause copies but never drops an entry whose line is gone, so `instructions-coverage.test.ts` fails with `local entry no longer in the file` until the block is rewritten by hand.","remediation":"Rewrite the edited workflow's `- source:` block in `.bkit/instructions.md` in the same change (delete the retired lines, add the new wording), then re-run `pnpm instructions:sync` and `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts`.","status":"ACTIVE"}
````
