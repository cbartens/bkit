diff --git a/.bkit/cli.md b/.bkit/cli.md
index 4e978721b..3e2446730 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -335,7 +335,7 @@ Read and annotate a workflow's status.jsonl.
 | `path` | by hand | **`--workflow`** **`--fid`** **`--month`** | Where this workflow's status.jsonl lives. |
 | `route` | workflow | `--file` **`--workflow`** `--step` `--group` `--require` `--expect` `--prompt-file` `--fid` `--month` | Routing state: last verdict / failures / strategy of a step, debug and push mode; with --prompt-file, debug's start decisions. |
 | `resume` | by hand | **`--file`** **`--workflow`** | The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside. |
-| `meta` | workflow | **`--file`** **`--workflow`** `--debug-mode` `--push-mode` `--debug-attempt` `--opened-pr` | Append a workflow-meta row (run-level routing state). |
+| `meta` | workflow | **`--file`** **`--workflow`** `--debug-mode` `--push-mode` `--debug-attempt` `--opened-pr` `--ci-selection-file` | Append a workflow-meta row (run-level routing state). |
 | `row` | workflow | **`--file`** **`--workflow`** **`--type`** `--field` | Append a typed audit row the fold does not model (ship's gate refusals, CI probes, merge CI); an owner-pause row also logs a human-confirm friction row. |
 
 ### `steps`
@@ -370,7 +370,7 @@ Run the deepest declared local gate, or one test file to record a red and audit

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `changed` | by hand | `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run. |
-| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
+| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
 | `plan-check` | by hand | **`--plan`** `--existence` **`--log`** | Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json `bkit.workflows.tasks` (defaults: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a `Task` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 5ca18eb06..a81cbe0d7 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -335,7 +335,7 @@ Read and annotate a workflow's status.jsonl.
 | `path` | by hand | **`--workflow`** **`--fid`** **`--month`** | Where this workflow's status.jsonl lives. |
 | `route` | workflow | `--file` **`--workflow`** `--step` `--group` `--require` `--expect` `--prompt-file` `--fid` `--month` | Routing state: last verdict / failures / strategy of a step, debug and push mode; with --prompt-file, debug's start decisions. |
 | `resume` | by hand | **`--file`** **`--workflow`** | The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside. |
-| `meta` | workflow | **`--file`** **`--workflow`** `--debug-mode` `--push-mode` `--debug-attempt` `--opened-pr` | Append a workflow-meta row (run-level routing state). |
+| `meta` | workflow | **`--file`** **`--workflow`** `--debug-mode` `--push-mode` `--debug-attempt` `--opened-pr` `--ci-selection-file` | Append a workflow-meta row (run-level routing state). |
 | `row` | workflow | **`--file`** **`--workflow`** **`--type`** `--field` | Append a typed audit row the fold does not model (ship's gate refusals, CI probes, merge CI); an owner-pause row also logs a human-confirm friction row. |
 
 ### `steps`
@@ -370,7 +370,7 @@ Run the deepest declared local gate, or one test file to record a red and audit

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `changed` | by hand | `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run. |
-| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
+| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
 | `plan-check` | by hand | **`--plan`** `--existence` **`--log`** | Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json `bkit.workflows.tasks` (defaults: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a `Task` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused. |
diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index 043a54f0e..f6b09042c 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -940,6 +940,179 @@ describe("check — hole classes", () => {
   const FINISH = (key: string, n: number) =>
     `steps finish --workflow=build --step=${key} --number=${n}`;
 
+  it("audits evidence-first debug rounds without requiring a local discovery run", () => {
+    const md = [
+      "## Step 1 — Run Tests",
+      ...fence(
+        "tests run --ci-run=123 --ci-url=https://github.com/example/example/actions/runs/123/attempts/2",
+        "steps finish --workflow=debug --step=debug-run-tests --number=1",
+      ),
+      "## Step 2 — Fetch Context",
+      ...fence(
+        "context fetch --context=ci",
+        "steps finish --workflow=debug --step=context-fetch --number=2",
+      ),
+      "## Step 3 — Diagnose",
+      ...fence("steps finish --workflow=debug --step=debug-failure-diagnose --number=3"),
+      "## Step 4 — Close",
+      ...fence("steps finish --workflow=debug --step=debug-close-workflow --number=4"),
+    ].join("\n");
+    const selection = {
+      mode: "ci",
+      provider: "github",
+      repo: "example/example",
+      runId: "123",
+      runAttempt: 2,
+      runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+      workflowId: "456",
+      workflowPath: ".github/workflows/consumer-ci.yml",
+      headBranch: "fix/ci",
+      headSha: "a".repeat(40),
+      conclusion: "failure",
+      redTiers: ["integration"],
+      via: "prompt-run",
+    };
+    const rows: StatusRow[] = [
+      { type: "workflow-started", workflow: "debug", at: AT },
+      { type: "workflow-meta", workflow: "debug", at: AT, ciSelection: selection, ciGeneration: 1 },
+      callRow("debug", "tests", "run"),
+      {
+        type: "test-run",
+        workflow: "debug",
+        at: AT,
+        step: "debug-run-tests",
+        source: "ci",
+        scope: "ci:123",
+        verdict: "FAIL",
+        exitCode: null,
+        failures: null,
+        ciRun: "123",
+        ciUrl: selection.runUrl,
+        repo: selection.repo,
+        workflowId: selection.workflowId,
+        workflowPath: selection.workflowPath,
+        headSha: selection.headSha,
+        gate: null,
+        runAttempt: 2,
+        ciGeneration: 1,
+        artifact: "logs/ci-round-1.md",
+        log: "logs/ci-round-1.md",
+        attempt: 1,
+        run: 1,
+      },
+      callRow("debug", "steps", "finish"),
+      stepRow("debug", "debug-run-tests", {
+        source: "ci",
+        scope: "ci:123",
+        verdict: "FAIL",
+        attempt: 1,
+        ciGeneration: 1,
+        artifacts: ["logs/ci-round-1.md"],
+      }),
+      callRow("debug", "context", "fetch"),
+      callRow("debug", "steps", "finish"),
+      stepRow("debug", "context-fetch", { attempt: 1, artifacts: ["logs/context-ci-1.md"] }),
+      callRow("debug", "steps", "finish"),
+      stepRow("debug", "debug-failure-diagnose", {
+        attempt: 1,
+        strategy: "STANDARD",
+        ciGeneration: 1,
+      }),
+      callRow("debug", "steps", "finish"),
+      stepRow("debug", "debug-close-workflow"),
+    ];
+    const contract = deriveContract(md, "debug");
+    expect(check(rows, contract).verdict).toBe("CLEAN");
+    expect(auditRun(rows, "debug", md).missing).toEqual([]);
+    expect(
+      check(
+        rows.filter((value) => value.type !== "test-run"),
+        contract,
+      ).verdict,
+    ).toBe("HOLEY");
+    const missingContext = rows.filter((value) => value.noun !== "context");
+    expect(
+      check(missingContext, contract).evidenceHoles.some((hole) => hole.step === "context-fetch"),
+    ).toBe(true);
+    const evidenceIndex = rows.findIndex((value) => value.type === "test-run");
+    const forged = [...rows];
+    forged[evidenceIndex] = { ...rows[evidenceIndex]!, ciGeneration: 2 };
+    expect(check(forged, contract).verdict).toBe("HOLEY");
+  });
+
+  const contextSelection = {
+    mode: "ci",
+    provider: "github",
+    repo: "example/example",
+    runId: "123",
+    runAttempt: 2,
+    runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+    workflowId: "456",
+    workflowPath: ".github/workflows/consumer-ci.yml",
+    headBranch: "fix/ci",
+    headSha: "a".repeat(40),
+    conclusion: "failure",
+    redTiers: ["integration"],
+    via: "prompt-run",
+  };
+  const contextRound: StatusRow = {
+    type: "test-run",
+    workflow: "debug",
+    at: AT,
+    step: "debug-run-tests",
+    source: "ci",
+    scope: "ci:123",
+    verdict: "FAIL",
+    exitCode: null,
+    failures: null,
+    ciRun: "123",
+    ciUrl: contextSelection.runUrl,
+    repo: contextSelection.repo,
+    workflowId: contextSelection.workflowId,
+    workflowPath: contextSelection.workflowPath,
+    headSha: contextSelection.headSha,
+    gate: null,
+    runAttempt: 2,
+    ciGeneration: 1,
+    artifact: "logs/ci-round-1.md",
+    log: "logs/ci-round-1.md",
+    attempt: 1,
+    run: 1,
+  };
+
+  it.each([
+    ["local replacement", { mode: "local", reason: "explicit-local" }, 2],
+    ["new generation", contextSelection, 2],
+    ["changed identity", { ...contextSelection, headSha: "b".repeat(40) }, 1],
+    ["invalid selection", { mode: "ci" }, 1],
+  ])("ignores stale CI context-fetch requirements after %s", (_name, selection, generation) => {
+    const md = [
+      "## Step 1 — Fetch Context",
+      ...fence("steps finish --workflow=debug --step=context-fetch --number=1"),
+    ].join("\n");
+    const rows: StatusRow[] = [
+      { type: "workflow-started", workflow: "debug", at: AT },
+      {
+        type: "workflow-meta",
+        workflow: "debug",
+        at: AT,
+        ciSelection: contextSelection,
+        ciGeneration: 1,
+      },
+      contextRound,
+      {
+        type: "workflow-meta",
+        workflow: "debug",
+        at: AT,
+        ciSelection: selection,
+        ciGeneration: generation,
+      },
+      callRow("debug", "steps", "finish"),
+      stepRow("debug", "context-fetch"),
+    ];
+    expect(check(rows, deriveContract(md, "debug")).evidenceHoles).toEqual([]);
+  });
+
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
     return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index 5dea0682d..f82073188 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -33,6 +33,7 @@ import type { IssueTracker } from "../install/manifest.js";
 import { substituteWorkflow } from "../render/trackers.js";
 import { parseJson } from "../shared/json.js";
 import { getWorkflowsRoot } from "../shared/package-roots.js";
+import { ciRoundMatches } from "../ledgers/status.js";
 
 // ---------------------------------------------------------------------------
 // Canonical ship step order (mirrors audits/workflows/ship-invariants.test.ts
@@ -645,6 +646,91 @@ export function check(
   });
 
   const evidenceHoles: EvidenceHole[] = [];
+  if (workflow === "debug") {
+    rows.forEach((stepRow, position) => {
+      if (
+        stepRow.type === "step-done" &&
+        stepRow.workflow === "debug" &&
+        stepRow.step === "context-fetch"
+      ) {
+        const prior = rows.slice(0, position);
+        const previous =
+          prior
+            .map((r, i) => (r.type === "step-done" || r.type === "workflow-started" ? i : -1))
+            .filter((i) => i >= 0)
+            .at(-1) ?? -1;
+        const start =
+          prior
+            .map((r, i) => (r.type === "workflow-started" ? i : -1))
+            .filter((i) => i >= 0)
+            .at(-1) ?? -1;
+        const history = prior.slice(start + 1);
+        const meta = [...history]
+          .reverse()
+          .find(
+            (r) =>
+              r.type === "workflow-meta" && r.workflow === "debug" && r.ciSelection !== undefined,
+          );
+        const ci = history.some(
+          (r) =>
+            r.type === "test-run" &&
+            r.workflow === "debug" &&
+            ciRoundMatches(r, meta?.ciSelection, meta?.ciGeneration),
+        );
+        if (
+          ci &&
+          !prior
+            .slice(previous + 1)
+            .some((r) => r.type === "engine-call" && r.noun === "context" && r.verb === "fetch")
+        )
+          evidenceHoles.push({
+            step: "context-fetch",
+            number: unitOf.get("context-fetch")?.number ?? 2,
+            index: 1,
+            missing: [{ noun: "context", verb: "fetch", flags: ["context"] }],
+          });
+      }
+      if (
+        stepRow.type !== "step-done" ||
+        stepRow.workflow !== "debug" ||
+        stepRow.step !== "debug-run-tests" ||
+        stepRow.source !== "ci"
+      )
+        return;
+      const prior = rows.slice(0, position);
+      const start =
+        prior
+          .map((r, i) => (r.type === "workflow-started" ? i : -1))
+          .filter((i) => i >= 0)
+          .at(-1) ?? -1;
+      const history = prior.slice(start + 1).reverse();
+      const meta = history.find(
+        (r) => r.type === "workflow-meta" && r.workflow === "debug" && r.ciSelection !== undefined,
+      );
+      const round = history.find(
+        (r) =>
+          r.type === "test-run" &&
+          r.workflow === "debug" &&
+          r.step === "debug-run-tests" &&
+          r.attempt === stepRow.attempt,
+      );
+      if (
+        !round ||
+        !ciRoundMatches(round, meta?.ciSelection, meta?.ciGeneration) ||
+        stepRow.scope !== round.scope ||
+        stepRow.verdict !== "FAIL" ||
+        stepRow.ciGeneration !== meta?.ciGeneration ||
+        !Array.isArray(stepRow.artifacts) ||
+        !stepRow.artifacts.includes(round.artifact)
+      )
+        evidenceHoles.push({
+          step: "debug-run-tests",
+          number: unitOf.get("debug-run-tests")?.number ?? 1,
+          index: 1,
+          missing: [{ noun: "tests", verb: "run", flags: ["ci-run"] }],
+        });
+    });
+  }
   const occurrence = new Map<Unit, number>();
   const exercised = new Map<Unit, Set<string>>();
   for (const v of visits) {
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 4ddbd67a9..1fbf8447a 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -51,6 +51,211 @@ function log(rows: object[]) {
   return file;
 }
 
+const ciStateSelection = (extra: Record<string, unknown> = {}) => ({
+  mode: "ci",
+  provider: "github",
+  repo: "example/example",
+  runId: "123",
+  runAttempt: 2,
+  runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+  workflowId: "456",
+  workflowPath: ".github/workflows/consumer-ci.yml",
+  headBranch: "fix/ci",
+  headSha: SHA,
+  conclusion: "failure",
+  redTiers: ["integration"],
+  via: "prompt-run",
+  ...extra,
+});
+const ciStateMeta = (generation = 1, extra: Record<string, unknown> = {}) => ({
+  type: "workflow-meta",
+  workflow: "debug",
+  at: "2026-10-01T00:00:01Z",
+  ciSelection: ciStateSelection(),
+  ciGeneration: generation,
+  ...extra,
+});
+const ciStateRoute = (file: string, text = "/bkit-debug 7-x", cwd = process.cwd()) => {
+  const prompt = path.join(tmp(), "prompt.md");
+  fs.writeFileSync(prompt, text);
+  return run(
+    ["status", "route", `--file=${file}`, "--workflow=debug", `--prompt-file=${prompt}`],
+    cwd,
+  );
+};
+const ciStateWrite = (file: string, selection: object) => {
+  const input = path.join(tmp(), "selection.json");
+  fs.writeFileSync(input, JSON.stringify(selection));
+  return run([
+    "status",
+    "meta",
+    `--file=${file}`,
+    "--workflow=debug",
+    `--ci-selection-file=${input}`,
+  ]);
+};
+
+describe("debug evidence state", () => {
+  it("persists atomic selections and preserves identical evidence generations", async () => {
+    const file = log([started("debug", "2026-10-01T00:00:00Z")]);
+    const selection = ciStateSelection();
+    const first = await ciStateWrite(file, selection);
+    expect(first.code).toBe(0);
+    expect(first.json.row).toMatchObject({ ciSelection: selection, ciGeneration: 1 });
+    const repeated = await ciStateWrite(file, { ...selection, via: "issue-run" });
+    expect(repeated.code).toBe(0);
+    expect(repeated.json.row.ciGeneration).toBe(1);
+    expect(readRuns(file).at(-1)).toMatchObject({
+      ciSelection: { mode: "ci", runId: "123" },
+      ciGeneration: 1,
+    });
+    const local = { mode: "local", reason: "explicit-local" };
+    expect((await ciStateWrite(file, local)).code).toBe(0);
+    expect(readRuns(file).at(-1)).toMatchObject({ ciSelection: local, ciGeneration: 2 });
+    expect(readRuns(file).at(-1)?.ciSelection).toEqual(local);
+    const before = fs.readFileSync(file, "utf-8");
+    expect((await ciStateWrite(file, { ...selection, runAttempt: 0 })).code).not.toBe(0);
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+  });
+
+  it("resumes saved evidence and replaces it only on explicit new selection", async () => {
+    const file = log([started("debug", "2026-10-01T00:00:00Z"), ciStateMeta()]);
+    const before = fs.readFileSync(file, "utf-8");
+    const resume = await ciStateRoute(file);
+    expect(resume.code).toBe(0);
+    expect(resume.json).toMatchObject({ ciRun: "123", ciGeneration: 1, redTiers: ["integration"] });
+    expect((await ciStateRoute(file)).json).toMatchObject({ ciRun: "123", ciGeneration: 1 });
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+    const next = ciStateSelection({
+      runAttempt: 3,
+      runUrl: "https://github.com/example/example/actions/runs/123/attempts/3",
+    });
+    expect((await ciStateWrite(file, next)).code).toBe(0);
+    expect((await ciStateRoute(file)).json).toMatchObject({
+      ciRun: "123",
+      ciGeneration: 2,
+      ciFixDone: false,
+      ciReproduced: false,
+    });
+    expect(
+      (
+        await ciStateWrite(file, {
+          ...next,
+          runId: "124",
+          runUrl: "https://github.com/example/example/actions/runs/124/attempts/3",
+        })
+      ).code,
+    ).toBe(0);
+    expect((await ciStateRoute(file)).json).toMatchObject({ ciRun: "124", ciGeneration: 3 });
+  });
+
+  it("clears saved CI routing immediately for explicit local selection", async () => {
+    const file = log([started("debug", "2026-10-01T00:00:00Z"), ciStateMeta()]);
+    const before = fs.readFileSync(file, "utf-8");
+    const route = await ciStateRoute(
+      file,
+      "/bkit-debug 7-x [local] https://github.com/example/example/actions/runs/999",
+    );
+    expect(route.code).toBe(0);
+    expect(route.json).toMatchObject({
+      ciRun: null,
+      redTiers: [],
+      ciFixDone: false,
+      ciReproduced: false,
+    });
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+    expect((await ciStateWrite(file, { mode: "local", reason: "explicit-local" })).code).toBe(0);
+    expect((await ciStateRoute(file)).json).toMatchObject({
+      ciRun: null,
+      redTiers: [],
+      ciGeneration: 2,
+    });
+    expect(readRuns(file).at(-1)?.ciSelection).toEqual({ mode: "local", reason: "explicit-local" });
+  });
+
+  it("counts reproduction and fixes only in the active generation", async () => {
+    const file = log([
+      started("build", "2026-08-01T00:00:00Z"),
+      started("debug", "2026-09-01T00:00:00Z"),
+      done("debug", "debug-failure-remediate", "2026-09-01T00:01:00Z", { ciGeneration: 2 }),
+      done("debug", "debug-failure-reproduce", "2026-09-01T00:02:00Z", {
+        ciGeneration: 2,
+        reproduced: "YES",
+      }),
+      { type: "workflow-done", workflow: "debug", at: "2026-09-01T00:03:00Z" },
+      started("debug", "2026-10-01T00:00:00Z"),
+      ciStateMeta(2),
+      done("debug", "debug-failure-remediate", "2026-10-01T00:01:00Z", { ciGeneration: 1 }),
+      done("debug", "debug-failure-reproduce", "2026-10-01T00:02:00Z", {
+        ciGeneration: 1,
+        reproduced: "YES",
+      }),
+      done("build", "debug-failure-soak", "2026-10-01T00:03:00Z", { ciGeneration: 2 }),
+    ]);
+    const root = tmp();
+    fs.writeFileSync(
+      path.join(root, "package.json"),
+      JSON.stringify({ bkit: { workflows: { debug: { fix: { maxAttempts: 2 } } } } }),
+    );
+    const noCurrent = await ciStateRoute(file, "/bkit-debug 7-x [repro]", root);
+    expect(noCurrent.json).toMatchObject({
+      ciFixDone: false,
+      ciReproduced: false,
+      debugMode: "SOAK",
+    });
+    fs.appendFileSync(
+      file,
+      JSON.stringify(
+        done("debug", "debug-failure-reproduce", "2026-10-01T00:04:00Z", {
+          ciGeneration: 2,
+          reproduced: "YES",
+        }),
+      ) + "\n",
+    );
+    fs.appendFileSync(
+      file,
+      JSON.stringify(
+        done("debug", "debug-failure-remediate", "2026-10-01T00:05:00Z", { ciGeneration: 2 }),
+      ) + "\n",
+    );
+    expect((await ciStateRoute(file)).json).toMatchObject({ ciFixDone: true, ciReproduced: true });
+    fs.appendFileSync(
+      file,
+      JSON.stringify({ type: "workflow-done", workflow: "debug", at: "2026-10-01T00:06:00Z" }) +
+        "\n",
+    );
+    expect((await ciStateRoute(file)).json).toMatchObject({
+      ciRun: null,
+      redTiers: [],
+      ciFixDone: false,
+      ciReproduced: false,
+    });
+  });
+
+  it("orders covering gates for red tiers and preserves live off", async () => {
+    const file = log([
+      started("debug", "2026-10-01T00:00:00Z"),
+      ciStateMeta(1, { ciSelection: ciStateSelection({ redTiers: ["unit"] }) }),
+    ]);
+    const unit = await ciStateRoute(file);
+    expect(unit.json.gates[0]).toBe("bkit:gate:static-unit");
+    expect(new Set(unit.json.gates).size).toBe(unit.json.gates.length);
+    const integrationFile = log([started("debug", "2026-10-01T00:00:00Z"), ciStateMeta()]);
+    expect((await ciStateRoute(integrationFile)).json.gates[0]).toBe(
+      "bkit:gate:static-unit-integration",
+    );
+    const off = await ciStateRoute(integrationFile, "/bkit-debug 7-x [live=off]");
+    expect(off.json.gates.some((gate: string) => gate.endsWith("-live"))).toBe(false);
+    const unknownFile = log([
+      started("debug", "2026-10-01T00:00:00Z"),
+      ciStateMeta(1, { ciSelection: ciStateSelection({ redTiers: [] }) }),
+    ]);
+    expect((await ciStateRoute(unknownFile)).json.gates[0]).toBe(
+      "bkit:gate:static-unit-integration-e2e-live",
+    );
+  });
+});
+
 describe("bkit status path", () => {
   it("returns the main checkout's path outside a worktree, and whether it exists", async () => {
     const root = tmp();
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index c0aefe651..14a58be8f 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -9,6 +9,8 @@ import { resolveGitSha } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import {
   activeDoneSteps,
+  validateCiSelection,
+  ciSelectionIdentity,
   allRunsDoneSteps,
   appendLine,
   fold,
@@ -272,13 +274,39 @@ export function debugStart(runs: WorkflowRun[], promptText: string, fixMax: numb
       open.steps.some((s) => s.step === "debug-failure-soak" && s.status === "DONE"));
   const fixes = allRunsDoneSteps(runs, "debug", { step: "debug-failure-remediate" }).length;
   const debugMode = promptText.includes("[soak]") || soaking || fixes >= fixMax ? "SOAK" : "NORMAL";
+  const selection =
+    !promptText.includes("[local]") && validateCiSelection(open?.ciSelection)
+      ? open.ciSelection
+      : null;
+  const ci = selection?.mode === "ci" ? selection : null;
+  const ciGeneration = typeof open?.ciGeneration === "number" ? open.ciGeneration : 0;
+  const current =
+    open?.steps.filter((s) => s.status === "DONE" && s.ciGeneration === ciGeneration) ?? [];
+  const defaults = promptText.includes("[live=off]")
+    ? BKIT_DEBUG_GATES.filter((g) => !g.endsWith("-live"))
+    : [...BKIT_DEBUG_GATES];
+  const covering =
+    ci && ci.redTiers.length > 0
+      ? defaults
+          .filter((g) =>
+            ci.redTiers.every((tier) => g.slice("bkit:gate:".length).split("-").includes(tier)),
+          )
+          .reverse()
+      : [];
   return {
     debugAttempt: attempt,
     debugMode,
     repro: promptText.includes("[repro]"),
-    gates: promptText.includes("[live=off]")
-      ? BKIT_DEBUG_GATES.filter((g) => !g.endsWith("-live"))
-      : [...BKIT_DEBUG_GATES],
+    gates: [...new Set([...covering, ...defaults])],
+    ciRun: ci?.runId ?? null,
+    ciGeneration,
+    redTiers: ci?.redTiers ?? [],
+    ciFixDone:
+      ci !== null &&
+      current.some((s) => ["debug-failure-remediate", "debug-failure-soak"].includes(s.step)),
+    ciReproduced:
+      ci !== null &&
+      current.some((s) => s.step === "debug-failure-reproduce" && s.reproduced === "YES"),
   };
 }
 
@@ -422,6 +450,12 @@ export const statusCommand: CommandSpec = {
       ],
       output: {
         verdict: "PASS|CONCERNS|FAIL of the step's last DONE row in the active run, or null",
+        ciRun: "active saved CI run ID with --prompt-file, or null; explicit [local] clears it",
+        ciGeneration: "active saved selection generation with --prompt-file, or 0",
+        redTiers:
+          "active selected failed tiers with --prompt-file; empty for local or unknown jobs",
+        ciFixDone: "whether the active generation has a DONE remediation or soak",
+        ciReproduced: "whether the active generation has DONE reproduction with YES",
         failures:
           "its failures (absent on PASS|CONCERNS = 0, absent on FAIL = null: count unknown), or null",
         strategy: "the step's last strategy across ALL runs, or null",
@@ -568,6 +602,11 @@ export const statusCommand: CommandSpec = {
           help: "positive integer, or run (the active run's number)",
         },
         { name: "opened-pr", type: "boolean", help: "record openedPr: this run opened the PR" },
+        {
+          name: "ci-selection-file",
+          type: "string",
+          help: "validated atomic debug CI or local selection JSON",
+        },
       ],
       output: { row: "the appended workflow-meta row" },
       exitCodes: { [EXIT_NO_STATUS]: "status.jsonl does not exist (meta never starts a log)" },
@@ -575,6 +614,27 @@ export const statusCommand: CommandSpec = {
         const file = statusFile(ctx);
         const at = statusTimestamp();
         const fields: Record<string, unknown> = {};
+        if (ctx.flags.ciSelectionFile !== undefined) {
+          const parsed = parseJson(
+            fs.readFileSync(path.resolve(ctx.cwd, String(ctx.flags.ciSelectionFile)), "utf-8"),
+          );
+          const selection = parsed.ok ? parsed.value : null;
+          if (!validateCiSelection(selection))
+            throw new CommandError(EXIT.USAGE, "invalid CI selection");
+          const active = readRuns(file).at(-1);
+          if (
+            ctx.flags.workflow !== "debug" ||
+            active?.workflow !== "debug" ||
+            active.status !== "IN_PROGRESS"
+          )
+            throw new CommandError(EXIT.USAGE, "CI selection needs an active debug run");
+          const same =
+            validateCiSelection(active.ciSelection) &&
+            ciSelectionIdentity(active.ciSelection) === ciSelectionIdentity(selection);
+          fields.ciSelection =
+            selection.mode === "local" ? { mode: "local", reason: selection.reason } : selection;
+          fields.ciGeneration = (Number(active.ciGeneration) || 0) + (same ? 0 : 1);
+        }
         for (const { key, check } of Object.values(META_FIELDS)) {
           const v = str(ctx.flags[key]);
           // `--debug-attempt=run`: the active run's number, read once the log is known to exist.
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 25c4f51a6..c04554b94 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -79,6 +79,192 @@ const doneArgs = (...extra: string[]) => [
   ...extra,
 ];
 
+function ciFinishFixture() {
+  const cwd = repo();
+  const selection = {
+    mode: "ci",
+    provider: "github",
+    repo: "example/example",
+    runId: "123",
+    runAttempt: 2,
+    runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+    workflowId: "456",
+    workflowPath: ".github/workflows/consumer-ci.yml",
+    headBranch: "feat/1-x",
+    headSha: git(cwd, "rev-parse", "HEAD"),
+    conclusion: "failure",
+    redTiers: ["integration"],
+    via: "prompt-run",
+  };
+  const artifact = "logs/ci-round-1.md";
+  const row = {
+    type: "test-run",
+    workflow: "debug",
+    step: "debug-run-tests",
+    at: "2026-10-01T00:00:02Z",
+    attempt: 1,
+    run: 1,
+    source: "ci",
+    verdict: "FAIL",
+    scope: "ci:123",
+    gate: null,
+    exitCode: null,
+    failures: null,
+    ciRun: "123",
+    ciUrl: selection.runUrl,
+    runAttempt: 2,
+    ciGeneration: 1,
+    repo: selection.repo,
+    workflowId: selection.workflowId,
+    workflowPath: selection.workflowPath,
+    headSha: selection.headSha,
+    log: artifact,
+    artifact,
+  };
+  const rows = [
+    { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
+    {
+      type: "workflow-meta",
+      workflow: "debug",
+      at: "2026-10-01T00:00:01Z",
+      ciSelection: selection,
+      ciGeneration: 1,
+    },
+    row,
+  ];
+  const save = () =>
+    write(cwd, "logs/status.jsonl", rows.map((value) => JSON.stringify(value)).join("\n") + "\n");
+  save();
+  write(
+    cwd,
+    artifact,
+    [
+      "Verdict: FAIL",
+      "Source: ci",
+      "Scope: ci:123",
+      `Repository: ${selection.repo}`,
+      `Workflow: ${selection.workflowPath} (${selection.workflowId})`,
+      "Run: 123",
+      "Run attempt: 2",
+      "CI generation: 1",
+      `Commit: ${selection.headSha}`,
+      `URL: ${selection.runUrl}`,
+      "",
+      "<!-- verdict:end -->",
+      "",
+      "# CI evidence",
+      "",
+      "The local gate was not run.",
+      "",
+    ].join("\n"),
+  );
+  const args = [
+    "steps",
+    "finish",
+    "--file=logs/status.jsonl",
+    "--workflow=debug",
+    "--step=debug-run-tests",
+    "--attempt=1",
+    "--verdict=FAIL",
+    "--scope=ci:123",
+    `--artifact=${artifact}`,
+    "--field=source=ci",
+    "--field=ciGeneration=1",
+    "--clamp-log=debug-run-tests:1",
+    "--commit=none",
+  ];
+  return { cwd, selection, artifact, row, rows, save, args };
+}
+
+describe("test-round completion evidence", () => {
+  it("finishes validated CI evidence rounds without local clamp records", async () => {
+    const valid = ciFinishFixture();
+    const finished = await run(valid.cwd, valid.args);
+    expect(finished.code).toBe(0);
+    expect(finished.json).toMatchObject({ pass: true, verdict: "FAIL", attempt: 1 });
+    expect(finished.json.row).toMatchObject({
+      step: "debug-run-tests",
+      source: "ci",
+      ciGeneration: 1,
+      scope: "ci:123",
+    });
+    expect(finished.json.row.artifacts).toContain(valid.artifact);
+    expect(finished.json.row.failures).not.toBe(0);
+    const wrongAttempt = ciFinishFixture();
+    wrongAttempt.row.runAttempt = 3;
+    wrongAttempt.save();
+    const refused = await run(wrongAttempt.cwd, wrongAttempt.args);
+    expect(refused.code).not.toBe(0);
+    expect(
+      fs.readFileSync(path.join(wrongAttempt.cwd, "logs/status.jsonl"), "utf-8"),
+    ).not.toContain('"type":"step-done"');
+    const forged = ciFinishFixture();
+    const artifact = fs.readFileSync(path.join(forged.cwd, forged.artifact), "utf-8");
+    write(
+      forged.cwd,
+      forged.artifact,
+      artifact.replace(
+        forged.selection.runUrl,
+        "https://github.com/example/example/actions/runs/999/attempts/2",
+      ),
+    );
+    expect((await run(forged.cwd, forged.args)).code).not.toBe(0);
+  });
+
+  it("preserves local clamp enforcement when completing test rounds", async () => {
+    const cwd = repo();
+    write(
+      cwd,
+      "logs/local-round-1.md",
+      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Local checks\n\nOne local test passed.\n",
+    );
+    write(
+      cwd,
+      "logs/status.jsonl",
+      [
+        { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
+        {
+          type: "test-run",
+          workflow: "debug",
+          step: "debug-run-tests",
+          at: "2026-10-01T00:00:01Z",
+          attempt: 1,
+          run: 1,
+          source: "local",
+          verdict: "PASS",
+          exitCode: 0,
+          failures: 0,
+          scope: "pnpm bkit:gate:static-unit",
+          log: "logs/local.log",
+          artifact: "logs/local-round-1.md",
+        },
+      ]
+        .map((value) => JSON.stringify(value))
+        .join("\n") + "\n",
+    );
+    const result = await run(cwd, [
+      "steps",
+      "finish",
+      "--file=logs/status.jsonl",
+      "--workflow=debug",
+      "--step=debug-run-tests",
+      "--attempt=1",
+      "--verdict=PASS",
+      "--failures=0",
+      "--scope=pnpm bkit:gate:static-unit",
+      "--artifact=logs/local-round-1.md",
+      "--field=source=local",
+      "--clamp-log=debug-run-tests:1",
+      "--commit=none",
+    ]);
+    expect(result.code).not.toBe(0);
+    expect(`${result.err} ${JSON.stringify(result.json)}`).toMatch(/clamp/i);
+    expect(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8")).not.toContain(
+      '"type":"step-done"',
+    );
+  });
+});
+
 describe("bkit steps done", () => {
   it("captures parentSha first, writes the row, then commits on top of it", async () => {
     const cwd = repo();
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 7e6c8b77a..0b0f36414 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -18,6 +18,7 @@ import {
   activeDoneSteps,
   allRunsDoneSteps,
   appendLine,
+  ciRoundMatches,
   runNumber,
   runOrStepField,
   statusTimestamp,
@@ -62,6 +63,7 @@ import {
   nonNegativeInt,
   positiveInt,
   readRuns,
+  readStatusRows,
   readRunsAt,
   statusFile,
   str,
@@ -1027,6 +1029,63 @@ async function finish(ctx: RunContext): Promise<number> {
     );
   }
 
+  if (workflow === "debug" && step === "debug-run-tests") {
+    const active = readRuns(file).at(-1);
+    const rows = readStatusRows(file);
+    const start =
+      rows
+        .map((r, i) => (r.type === "workflow-started" && r.workflow === "debug" ? i : -1))
+        .filter((i) => i >= 0)
+        .at(-1) ?? -1;
+    const round = rows
+      .slice(start + 1)
+      .reverse()
+      .find(
+        (r) =>
+          r.type === "test-run" &&
+          r.workflow === workflow &&
+          r.step === step &&
+          r.attempt === attempt,
+      );
+    if (extras.source === "ci" || round?.source === "ci") {
+      const matching =
+        active?.workflow === "debug" &&
+        active.status === "IN_PROGRESS" &&
+        round &&
+        ciRoundMatches(round, active.ciSelection, active.ciGeneration) &&
+        extras.source === "ci" &&
+        extras.ciGeneration === active.ciGeneration &&
+        verdict === "FAIL" &&
+        failures === undefined &&
+        extras.scope === round.scope &&
+        artifacts.includes(String(round.artifact));
+      if (!matching)
+        throw new CommandError(EXIT.USAGE, "CI evidence does not match the active selection");
+      const text = fs.readFileSync(path.resolve(ctx.cwd, String(round.artifact)), "utf-8");
+      const required = [
+        "Verdict: FAIL",
+        "Source: ci",
+        `Scope: ${round.scope}`,
+        `Repository: ${round.repo}`,
+        `Workflow: ${round.workflowPath} (${round.workflowId})`,
+        `Run: ${round.ciRun}`,
+        `Run attempt: ${round.runAttempt}`,
+        `CI generation: ${round.ciGeneration}`,
+        `Commit: ${round.headSha}`,
+        `URL: ${round.ciUrl}`,
+        "The local gate was not run.",
+      ];
+      if (!required.every((line) => text.split(/\r?\n/).includes(line)))
+        throw new CommandError(EXIT.USAGE, "CI evidence artifact identity mismatch");
+      delete extras.clamped;
+    } else if (
+      (clampLog !== undefined || round !== undefined) &&
+      (!Array.isArray(extras.clamped) || extras.clamped.length === 0)
+    ) {
+      throw new CommandError(EXIT.USAGE, "local test completion needs clamp evidence");
+    }
+  }
+
   // What the gate would refuse, refused before anything is written.
   const pre: Check[] = gateChecks(ctx.cwd, {
     workflow,
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 019b07b0f..23248a645 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -97,6 +97,161 @@ async function run(argv: string[], at = cwd, verb = "run") {
 const BUILD = [...BKIT_BUILD_GATES.map((g) => `--gate=${g}`), "--log=logs/test.md"];
 const readLog = () => fs.readFileSync(path.join(cwd, "logs/test.md"), "utf-8");
 
+function ciRoundFixture() {
+  const selection = {
+    mode: "ci",
+    provider: "github",
+    repo: "example/example",
+    runId: "123",
+    runAttempt: 2,
+    runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+    workflowId: "456",
+    workflowPath: ".github/workflows/consumer-ci.yml",
+    headBranch: "fix/ci",
+    headSha: "a".repeat(40),
+    conclusion: "failure",
+    redTiers: ["integration"],
+    via: "prompt-run",
+  };
+  const file = path.join(cwd, "status.jsonl");
+  fs.writeFileSync(
+    file,
+    [
+      { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
+      {
+        type: "workflow-meta",
+        workflow: "debug",
+        at: "2026-10-01T00:00:01Z",
+        ciSelection: selection,
+        ciGeneration: 2,
+      },
+    ]
+      .map((row) => JSON.stringify(row))
+      .join("\n") + "\n",
+  );
+  const marker = path.join(cwd, "local-gate-ran");
+  fs.rmSync(marker, { force: true });
+  fs.writeFileSync(
+    path.join(bin, PACKAGE_RUNNER),
+    `#!/bin/sh\necho "$1" >> '${marker}'\nexit 0\n`,
+    { mode: 0o755 },
+  );
+  const args = [
+    ...BUILD,
+    `--file=${file}`,
+    "--workflow=debug",
+    "--step=debug-run-tests",
+    "--attempt=1",
+    "--ci-run=123",
+    `--ci-url=${selection.runUrl}`,
+    "--artifact=docs/plans/202611/logs/1-x/run-tests-1.md",
+    "--fid=1-x",
+  ];
+  const append = (row: object) => fs.appendFileSync(file, JSON.stringify(row) + "\n");
+  const fix = (generation: number, step = "debug-failure-remediate", status = "DONE") =>
+    append({
+      type: "step-done",
+      workflow: "debug",
+      step,
+      status,
+      at: "2026-10-01T00:01:00Z",
+      parentSha: selection.headSha,
+      artifacts: [],
+      ciGeneration: generation,
+    });
+  return { file, marker, selection, args, append, fix };
+}
+
+describe("CI evidence test rounds", () => {
+  it("records a CI evidence round without executing a local gate", async () => {
+    const f = ciRoundFixture();
+    const result = await run(f.args);
+    expect(result.code).toBe(1);
+    expect(result.json).toMatchObject({
+      source: "ci",
+      verdict: "FAIL",
+      scope: "ci:123",
+      gate: null,
+      exitCode: null,
+      failures: null,
+      runAttempt: 2,
+      ciGeneration: 2,
+    });
+    expect(result.json.row).toMatchObject({
+      type: "test-run",
+      workflow: "debug",
+      step: "debug-run-tests",
+      source: "ci",
+      verdict: "FAIL",
+      scope: "ci:123",
+      exitCode: null,
+      failures: null,
+      ciRun: "123",
+      runAttempt: 2,
+      ciGeneration: 2,
+    });
+    expect(fs.existsSync(f.marker)).toBe(false);
+    const artifact = fs.readFileSync(path.join(cwd, result.json.artifact), "utf-8");
+    expect(artifact).toContain(f.selection.repo);
+    expect(artifact).toContain(f.selection.workflowPath);
+    expect(artifact).toContain(f.selection.headSha);
+    expect(artifact).toContain(f.selection.runUrl);
+    expect(artifact).toMatch(/local.+(?:not run|not executed)|(?:not run|not executed).+local/i);
+    expect(result.json.clamp).toBeNull();
+  });
+
+  it("runs local gates only after current-generation remediation or soak", async () => {
+    const f = ciRoundFixture();
+    f.fix(1);
+    expect((await run(f.args)).json.source).toBe("ci");
+    expect(fs.existsSync(f.marker)).toBe(false);
+    f.fix(2, "debug-failure-remediate", "FAILED");
+    expect((await run(f.args)).json.source).toBe("ci");
+    expect(fs.existsSync(f.marker)).toBe(false);
+    f.fix(2);
+    const checked = await run(f.args);
+    expect(checked.code).toBe(0);
+    expect(checked.json).toMatchObject({
+      source: "local",
+      verdict: "PASS",
+      exitCode: 0,
+      gate: DEEP,
+    });
+    expect(fs.readFileSync(f.marker, "utf-8")).toContain(DEEP);
+    const soak = ciRoundFixture();
+    soak.fix(2, "debug-failure-soak");
+    expect((await run(soak.args)).json.source).toBe("local");
+    expect(fs.existsSync(soak.marker)).toBe(true);
+  });
+
+  it("rejects CI rounds without active matching debug selection", async () => {
+    const f = ciRoundFixture();
+    expect((await run(f.args)).code).toBe(1);
+    expect((await run(f.args.filter((arg) => !arg.startsWith("--file=")))).code).toBe(2);
+    expect(
+      (await run([...f.args.filter((arg) => !arg.startsWith("--ci-run=")), "--ci-run=999"])).code,
+    ).toBe(2);
+    expect(
+      (
+        await run([
+          ...f.args.filter((arg) => !arg.startsWith("--ci-url=")),
+          "--ci-url=https://github.com/other/repo/actions/runs/123/attempts/2",
+        ])
+      ).code,
+    ).toBe(2);
+    f.append({ type: "workflow-done", workflow: "debug", at: "2026-10-01T00:02:00Z" });
+    expect((await run(f.args)).code).toBe(2);
+    fs.writeFileSync(
+      f.file,
+      JSON.stringify({ type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" }) +
+        "\n",
+    );
+    expect((await run(f.args)).code).toBe(2);
+    expect(fs.existsSync(f.marker)).toBe(false);
+    expect(fs.readFileSync(f.file, "utf-8")).not.toContain('"type":"test-run"');
+  });
+});
+
 describe("resolveGate", () => {
   it("picks the deepest declared candidate, not the first declared in package.json", () => {
     expect(resolveGate(cwd, [DEEP, SHALLOW])).toBe(DEEP);
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index b357e1669..39bfcff72 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -24,7 +24,12 @@ import * as path from "node:path";
 
 import { BKIT_LINT_FILE_SCRIPT, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
 import { clampLogPath } from "../../ledgers/clamp-log.js";
-import { appendLine, statusTimestamp } from "../../ledgers/status.js";
+import {
+  appendLine,
+  statusTimestamp,
+  validateCiSelection,
+  testRunProblem,
+} from "../../ledgers/status.js";
 import { CommandError, EXIT, git, runGit, type CommandSpec } from "../lib.js";
 import { parseJson } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
@@ -36,6 +41,7 @@ import {
   WORKFLOW_FLAG,
   positiveInt,
   readStatusRows,
+  readRuns,
   statusFile,
   str,
 } from "./status.js";
@@ -160,11 +166,13 @@ function appendTestRun(
     step: string;
     attempt: number | undefined;
     verdict: string | null;
-    exitCode: number;
+    exitCode: number | null;
     failures: number | null;
     scope: string;
     log: string;
     artifact: string | undefined;
+    source?: "ci" | "local";
+    evidence?: Record<string, unknown>;
   },
 ): Record<string, unknown> {
   const rows = readStatusRows(file);
@@ -190,7 +198,11 @@ function appendTestRun(
     scope: r.scope,
     log: r.log,
     ...(r.artifact === undefined ? {} : { artifact: r.artifact }),
+    ...(r.source === undefined ? {} : { source: r.source }),
+    ...r.evidence,
   };
+  const problem = testRunProblem(row);
+  if (problem !== null) throw new CommandError(EXIT.USAGE, problem);
   fs.appendFileSync(file, appendLine(row));
   return row;
 }
@@ -1642,8 +1654,19 @@ export const testsCommand: CommandSpec = {
           help: "status.jsonl: append one test-run row for this run, pass or fail; needs --workflow and --step",
         },
         { name: "workflow", type: "string", help: "--file: workflow name, for the test-run row" },
+        { name: "ci-run", type: "string", help: "selected GitHub evidence run ID" },
+        { name: "ci-url", type: "string", help: "selected GitHub evidence attempt URL" },
       ],
       output: {
+        source: "ci for pinned red evidence; local after its current-generation fix",
+        runAttempt: "selected CI attempt for a CI evidence round",
+        ciGeneration: "active selection generation for a CI evidence round",
+        ciRun: "selected CI run ID for a CI evidence round",
+        ciUrl: "selected CI attempt URL for a CI evidence round",
+        repo: "selected repository for a CI evidence round",
+        workflowId: "selected workflow ID for a CI evidence round",
+        workflowPath: "selected workflow path for a CI evidence round",
+        headSha: "selected commit for a CI evidence round",
         verdict: "PASS | FAIL (null when the gate could not run)",
         exitCode: "the gate's exit code",
         gate: "the script that ran",
@@ -1682,6 +1705,99 @@ export const testsCommand: CommandSpec = {
             EXIT.USAGE,
             `--file ${statusArg} does not exist (a test-run row never starts a log)`,
           );
+        if (ctx.flags.ciRun !== undefined || ctx.flags.ciUrl !== undefined) {
+          const active = status === undefined ? undefined : readRuns(status).at(-1);
+          const selection = active?.ciSelection;
+          if (
+            !status ||
+            workflow !== "debug" ||
+            active?.workflow !== "debug" ||
+            active.status !== "IN_PROGRESS" ||
+            !validateCiSelection(selection) ||
+            selection.mode !== "ci" ||
+            ctx.flags.ciRun !== selection.runId ||
+            ctx.flags.ciUrl !== selection.runUrl ||
+            !Number.isSafeInteger(active.ciGeneration) ||
+            Number(active.ciGeneration) < 1 ||
+            !artifact
+          )
+            throw new CommandError(
+              EXIT.USAGE,
+              "CI round needs an active matching debug selection and artifact",
+            );
+          const fixed = active.steps.some(
+            (s) =>
+              s.status === "DONE" &&
+              s.ciGeneration === active.ciGeneration &&
+              ["debug-failure-remediate", "debug-failure-soak"].includes(s.step),
+          );
+          if (!fixed) {
+            const scope = `ci:${selection.runId}`;
+            const text = [
+              "Verdict: FAIL",
+              "Source: ci",
+              `Scope: ${scope}`,
+              `Repository: ${selection.repo}`,
+              `Workflow: ${selection.workflowPath} (${selection.workflowId})`,
+              `Run: ${selection.runId}`,
+              `Run attempt: ${selection.runAttempt}`,
+              `CI generation: ${active.ciGeneration}`,
+              `Commit: ${selection.headSha}`,
+              `URL: ${selection.runUrl}`,
+              "",
+              "<!-- verdict:end -->",
+              "",
+              "# CI evidence",
+              "",
+              "The local gate was not run.",
+              "",
+            ].join("\n");
+            for (const dest of new Set([artifact, logArg])) {
+              const out = path.resolve(ctx.cwd, dest);
+              fs.mkdirSync(path.dirname(out), { recursive: true });
+              fs.writeFileSync(out, text);
+            }
+            const evidence = {
+              gate: null,
+              ciRun: selection.runId,
+              ciUrl: selection.runUrl,
+              runAttempt: selection.runAttempt,
+              ciGeneration: active.ciGeneration,
+              repo: selection.repo,
+              workflowId: selection.workflowId,
+              workflowPath: selection.workflowPath,
+              headSha: selection.headSha,
+            };
+            const row = appendTestRun(status, {
+              workflow,
+              step: step!,
+              attempt,
+              source: "ci",
+              verdict: "FAIL",
+              exitCode: null,
+              failures: null,
+              scope,
+              log: logArg,
+              artifact,
+              evidence,
+            });
+            ctx.emit({
+              source: "ci",
+              verdict: "FAIL",
+              scope,
+              exitCode: null,
+              failures: null,
+              ...evidence,
+              artifact,
+              log: logArg,
+              logBytes: Buffer.byteLength(text),
+              reports: null,
+              clamp: null,
+              row,
+            });
+            return EXIT.NO;
+          }
+        }
         const tailRaw = str(ctx.flags.tail) ?? String(DEFAULT_TAIL);
         if (!/^[0-9]+$/.test(tailRaw)) {
           throw new CommandError(
@@ -1754,8 +1870,10 @@ export const testsCommand: CommandSpec = {
                 scope,
                 log: logArg,
                 artifact,
+                ...(ctx.flags.ciRun === undefined ? {} : { source: "local" as const }),
               });
         ctx.emit({
+          ...(ctx.flags.ciRun === undefined ? {} : { source: "local" }),
           verdict,
           exitCode,
           gate,
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 62bf78065..5ef46f7bf 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -113,8 +113,73 @@ export type Step = {
   failures?: number;
   strategy?: "STANDARD" | "PIVOT" | "FINAL";
   scope?: string;
+  ciGeneration?: number;
+  reproduced?: string;
 };
 
+/** Validate the bounded CI evidence variant without relaxing local exit codes. */
+export function testRunProblem(value: unknown): string | null {
+  if (!value || typeof value !== "object") return "test-run must be an object";
+  const r = value as Record<string, unknown>;
+  const positive = (v: unknown) => Number.isSafeInteger(v) && Number(v) > 0;
+  if (r.source === "ci") {
+    if (
+      r.workflow !== "debug" ||
+      r.step !== "debug-run-tests" ||
+      r.verdict !== "FAIL" ||
+      r.exitCode !== null ||
+      r.failures !== null ||
+      r.gate !== null ||
+      !positive(r.ciGeneration) ||
+      !positive(r.runAttempt) ||
+      typeof r.ciRun !== "string" ||
+      !/^[1-9][0-9]*$/.test(r.ciRun) ||
+      r.scope !== `ci:${r.ciRun}` ||
+      typeof r.artifact !== "string" ||
+      !r.artifact ||
+      typeof r.repo !== "string" ||
+      !/^[\w.-]+\/[\w.-]+$/.test(r.repo) ||
+      r.ciUrl !== `https://github.com/${r.repo}/actions/runs/${r.ciRun}/attempts/${r.runAttempt}` ||
+      typeof r.workflowId !== "string" ||
+      !/^[1-9][0-9]*$/.test(r.workflowId) ||
+      typeof r.workflowPath !== "string" ||
+      !/^\.github\/workflows\/[^/]+\.ya?ml$/.test(r.workflowPath) ||
+      typeof r.headSha !== "string" ||
+      !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(r.headSha)
+    )
+      return "invalid CI evidence round";
+    return null;
+  }
+  if (r.source !== undefined && r.source !== "local") return "invalid test source";
+  if (!Number.isSafeInteger(r.exitCode) || Number(r.exitCode) < 0)
+    return "local exitCode must be a non-negative integer";
+  if (r.failures !== null && (!Number.isSafeInteger(r.failures) || Number(r.failures) < 0))
+    return "invalid failure count";
+  return null;
+}
+
+/** A round belongs to exactly one saved evidence generation. */
+export function ciRoundMatches(
+  row: Record<string, unknown>,
+  selection: unknown,
+  generation: unknown,
+): boolean {
+  return (
+    validateCiSelection(selection) &&
+    selection.mode === "ci" &&
+    testRunProblem(row) === null &&
+    row.source === "ci" &&
+    row.ciGeneration === generation &&
+    row.ciRun === selection.runId &&
+    row.runAttempt === selection.runAttempt &&
+    row.ciUrl === selection.runUrl &&
+    row.repo === selection.repo &&
+    row.workflowId === selection.workflowId &&
+    row.workflowPath === selection.workflowPath &&
+    row.headSha === selection.headSha
+  );
+}
+
 export type WorkflowRun = {
   workflow: string;
   startedAt: string;
@@ -146,7 +211,9 @@ export type StatusEvent =
 // (workflow, step, parentSha, at); workflow-level events per (type, workflow, at).
 function identity(e: StatusEvent): string {
   if (e.type === "step-done")
-    return `S\u0000${e.workflow}\u0000${e.step}\u0000${e.parentSha}\u0000${e.at}`;
+    return `S\u0000${e.workflow}\u0000${e.step}\u0000${e.parentSha}\u0000${e.at}${e.ciGeneration === undefined ? "" : `\u0000${e.status}\u0000${e.ciGeneration}`}`;
+  if (e.type === "workflow-meta" && e.ciSelection !== undefined)
+    return `M\u0000${e.workflow}\u0000${e.at}\u0000${e.ciGeneration}\u0000${JSON.stringify(e.ciSelection)}`;
   return `W\u0000${e.type}\u0000${e.workflow}\u0000${e.at}`;
 }
 
diff --git a/.bkit/core/engine/ledgers/telemetry.test.ts b/.bkit/core/engine/ledgers/telemetry.test.ts
index 27ae881f1..d2c3c88df 100644
--- a/.bkit/core/engine/ledgers/telemetry.test.ts
+++ b/.bkit/core/engine/ledgers/telemetry.test.ts
@@ -44,6 +44,66 @@ import {
   type TelemetryEvent,
 } from "./telemetry";
 import { getBkitDocsRoot } from "../shared/package-roots";
+import { testRunProblem } from "./status";
+
+describe("test-run status row validation", () => {
+  it("accepts bounded CI evidence rows while preserving local exit validation", () => {
+    const ci = {
+      type: "test-run",
+      workflow: "debug",
+      step: "debug-run-tests",
+      at: "2026-10-01T00:00:00Z",
+      attempt: 1,
+      run: 1,
+      source: "ci",
+      verdict: "FAIL",
+      scope: "ci:123",
+      gate: null,
+      exitCode: null,
+      failures: null,
+      ciRun: "123",
+      ciUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+      runAttempt: 2,
+      ciGeneration: 1,
+      repo: "example/example",
+      workflowId: "456",
+      workflowPath: ".github/workflows/consumer-ci.yml",
+      headSha: "a".repeat(40),
+      log: "logs/run-tests-1.md",
+      artifact: "docs/plans/202611/logs/1-x/run-tests-1.md",
+    };
+    expect(testRunProblem(ci)).toBeNull();
+    expect(testRunProblem({ ...ci, workflow: "build" })).not.toBeNull();
+    expect(testRunProblem({ ...ci, exitCode: 0 })).not.toBeNull();
+    expect(testRunProblem({ ...ci, failures: 0 })).not.toBeNull();
+    expect(testRunProblem({ ...ci, verdict: "PASS" })).not.toBeNull();
+    expect(testRunProblem({ ...ci, gate: "bkit:gate:static-unit" })).not.toBeNull();
+    expect(testRunProblem({ ...ci, ciGeneration: 0 })).not.toBeNull();
+    expect(testRunProblem({ ...ci, runAttempt: 0 })).not.toBeNull();
+    expect(testRunProblem({ ...ci, scope: "ci:999" })).not.toBeNull();
+    expect(testRunProblem({ ...ci, artifact: undefined })).not.toBeNull();
+    const local = {
+      type: "test-run",
+      workflow: "build",
+      step: "build-run-tests",
+      at: ci.at,
+      attempt: 1,
+      run: 1,
+      source: "local",
+      verdict: "PASS",
+      exitCode: 0,
+      failures: 0,
+      scope: "pnpm bkit:gate:static-unit",
+      log: "logs/tests.log",
+    };
+    expect(testRunProblem(local)).toBeNull();
+    expect(testRunProblem({ ...local, source: undefined })).toBeNull();
+    expect(testRunProblem({ ...local, exitCode: null })).not.toBeNull();
+    expect(testRunProblem({ ...local, exitCode: "0" })).not.toBeNull();
+    expect(testRunProblem({ ...local, exitCode: 0.5 })).not.toBeNull();
+    expect(testRunProblem({ ...local, failures: -1 })).not.toBeNull();
+  });
+});
 
 // ---------------------------------------------------------------------------
 // Helpers
diff --git a/.bkit/version b/.bkit/version
index 218138f6a..af1ea977e 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "b16e5a2b6cd6ed6feecbb41eba95e32b8ec40b98c69c3ee4f821a844c596f299",
+    ".bkit/cli.md": "ce59ad833ef062f310bc1d46c1293d43da93175fa9322fe146dc12ccfe2864e5",
     ".claude/agents/bkit-build-plan-tests.md": "eda75f0bbc0c1ddc3e69a2cdaef8c3b00a8fff7153b968eb7db24ae5dd98b58f",
     ".cursor/agents/bkit-build-plan-tests.md": "50a613fa58a0c00db0c3f79f5e908c955515234b5ec0676c1348a3bfe188b37a",
     ".opencode/agents/bkit-build-plan-tests.md": "9e654f6a332ec5659059158a0dee0853e487a4bd55f9063c86e82aa5791a03ee",
diff --git a/README.md b/README.md
index 537c43ef9..f2aa8b9ed 100644
--- a/README.md
+++ b/README.md
@@ -354,19 +354,19 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 1050cf638c10941f2efac143030c4270c7ac13bc — do not edit
+  %% Generated by bkit-graphify-rollup.py from 2f9146f6ef588a8c5ab7a885d94dba88d2c7e196 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1651 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>280 symbols · 19 files"]
-    n_bkit_core_engine_ledgers["ledgers<br/>181 symbols · 6 files"]
+    n_bkit_core_engine_ledgers["ledgers<br/>183 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>149 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
+  n_bkit_core_engine_commands -->|347| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|346| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|339| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|198| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|157| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|131| n_bkit_core_engine_shared
@@ -383,8 +383,8 @@ flowchart LR
   n_bkit_core_engine_install -->|12| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|12| n_bkit_core_engine_cli
   n_bkit_core_engine_render -->|12| n_bkit_core_engine_shared
+  n_bkit_core_engine_checks -->|11| n_bkit_core_engine_ledgers
   n_bkit_core_engine_install -->|11| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_checks -->|8| n_bkit_core_engine_ledgers
   n_bkit_core_engine_install -->|8| n_bkit_core_engine_cli
   n_bkit_core_engine_cli -->|7| n_bkit_core_engine_install
   n_bkit_core_engine_render -->|7| n_bkit_core_engine_install
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index 9051cb341..5dcf7814f 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -30,6 +30,7 @@ import { DECISION_ROUTES, WORKFLOW_STEPS } from "../commands/workflow/step-table
 import { substituteWorkflow } from "../render/trackers.js";
 import { parseJson } from "../shared/json.js";
 import { getWorkflowsRoot } from "../shared/package-roots.js";
+import { ciRoundMatches } from "../ledgers/status.js";
 // ---------------------------------------------------------------------------
 // Canonical ship step order (mirrors audits/workflows/ship-invariants.test.ts
 // CANONICAL_SHIP_STEP_KEYS — the frozen schema). The detector cross-checks its
@@ -460,6 +461,69 @@ export function check(rows, contract, options = {}) {
         }
     });
     const evidenceHoles = [];
+    if (workflow === "debug") {
+        rows.forEach((stepRow, position) => {
+            if (stepRow.type === "step-done" &&
+                stepRow.workflow === "debug" &&
+                stepRow.step === "context-fetch") {
+                const prior = rows.slice(0, position);
+                const previous = prior
+                    .map((r, i) => (r.type === "step-done" || r.type === "workflow-started" ? i : -1))
+                    .filter((i) => i >= 0)
+                    .at(-1) ?? -1;
+                const start = prior
+                    .map((r, i) => (r.type === "workflow-started" ? i : -1))
+                    .filter((i) => i >= 0)
+                    .at(-1) ?? -1;
+                const history = prior.slice(start + 1);
+                const meta = [...history]
+                    .reverse()
+                    .find((r) => r.type === "workflow-meta" && r.workflow === "debug" && r.ciSelection !== undefined);
+                const ci = history.some((r) => r.type === "test-run" &&
+                    r.workflow === "debug" &&
+                    ciRoundMatches(r, meta?.ciSelection, meta?.ciGeneration));
+                if (ci &&
+                    !prior
+                        .slice(previous + 1)
+                        .some((r) => r.type === "engine-call" && r.noun === "context" && r.verb === "fetch"))
+                    evidenceHoles.push({
+                        step: "context-fetch",
+                        number: unitOf.get("context-fetch")?.number ?? 2,
+                        index: 1,
+                        missing: [{ noun: "context", verb: "fetch", flags: ["context"] }],
+                    });
+            }
+            if (stepRow.type !== "step-done" ||
+                stepRow.workflow !== "debug" ||
+                stepRow.step !== "debug-run-tests" ||
+                stepRow.source !== "ci")
+                return;
+            const prior = rows.slice(0, position);
+            const start = prior
+                .map((r, i) => (r.type === "workflow-started" ? i : -1))
+                .filter((i) => i >= 0)
+                .at(-1) ?? -1;
+            const history = prior.slice(start + 1).reverse();
+            const meta = history.find((r) => r.type === "workflow-meta" && r.workflow === "debug" && r.ciSelection !== undefined);
+            const round = history.find((r) => r.type === "test-run" &&
+                r.workflow === "debug" &&
+                r.step === "debug-run-tests" &&
+                r.attempt === stepRow.attempt);
+            if (!round ||
+                !ciRoundMatches(round, meta?.ciSelection, meta?.ciGeneration) ||
+                stepRow.scope !== round.scope ||
+                stepRow.verdict !== "FAIL" ||
+                stepRow.ciGeneration !== meta?.ciGeneration ||
+                !Array.isArray(stepRow.artifacts) ||
+                !stepRow.artifacts.includes(round.artifact))
+                evidenceHoles.push({
+                    step: "debug-run-tests",
+                    number: unitOf.get("debug-run-tests")?.number ?? 1,
+                    index: 1,
+                    missing: [{ noun: "tests", verb: "run", flags: ["ci-run"] }],
+                });
+        });
+    }
     const occurrence = new Map();
     const exercised = new Map();
     for (const v of visits) {
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index 202977713..f86a927df 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -5,7 +5,7 @@ import { BKIT_DEBUG_GATES } from "../../install/manifest.js";
 import { appendFrictionRow, journalEnabled, pauseFrictionRow } from "../../ledgers/journal.js";
 import { resolveGitSha } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { activeDoneSteps, allRunsDoneSteps, appendLine, fold, lastDoneStepAllRuns, lastRun, nextStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
+import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, fold, lastDoneStepAllRuns, lastRun, nextStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { CommandError, EXIT, git, parseJson, resolveActiveRun, statusLocation, } from "../lib.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 // ---------------------------------------------------------------------------
@@ -229,13 +229,32 @@ export function debugStart(runs, promptText, fixMax) {
             open.steps.some((s) => s.step === "debug-failure-soak" && s.status === "DONE"));
     const fixes = allRunsDoneSteps(runs, "debug", { step: "debug-failure-remediate" }).length;
     const debugMode = promptText.includes("[soak]") || soaking || fixes >= fixMax ? "SOAK" : "NORMAL";
+    const selection = !promptText.includes("[local]") && validateCiSelection(open?.ciSelection)
+        ? open.ciSelection
+        : null;
+    const ci = selection?.mode === "ci" ? selection : null;
+    const ciGeneration = typeof open?.ciGeneration === "number" ? open.ciGeneration : 0;
+    const current = open?.steps.filter((s) => s.status === "DONE" && s.ciGeneration === ciGeneration) ?? [];
+    const defaults = promptText.includes("[live=off]")
+        ? BKIT_DEBUG_GATES.filter((g) => !g.endsWith("-live"))
+        : [...BKIT_DEBUG_GATES];
+    const covering = ci && ci.redTiers.length > 0
+        ? defaults
+            .filter((g) => ci.redTiers.every((tier) => g.slice("bkit:gate:".length).split("-").includes(tier)))
+            .reverse()
+        : [];
     return {
         debugAttempt: attempt,
         debugMode,
         repro: promptText.includes("[repro]"),
-        gates: promptText.includes("[live=off]")
-            ? BKIT_DEBUG_GATES.filter((g) => !g.endsWith("-live"))
-            : [...BKIT_DEBUG_GATES],
+        gates: [...new Set([...covering, ...defaults])],
+        ciRun: ci?.runId ?? null,
+        ciGeneration,
+        redTiers: ci?.redTiers ?? [],
+        ciFixDone: ci !== null &&
+            current.some((s) => ["debug-failure-remediate", "debug-failure-soak"].includes(s.step)),
+        ciReproduced: ci !== null &&
+            current.some((s) => s.step === "debug-failure-reproduce" && s.reproduced === "YES"),
     };
 }
 const PUBLISH_TOKEN = /(?<![\w-])publish=(true|false)(?![\w-])/;
@@ -364,6 +383,11 @@ export const statusCommand = {
             ],
             output: {
                 verdict: "PASS|CONCERNS|FAIL of the step's last DONE row in the active run, or null",
+                ciRun: "active saved CI run ID with --prompt-file, or null; explicit [local] clears it",
+                ciGeneration: "active saved selection generation with --prompt-file, or 0",
+                redTiers: "active selected failed tiers with --prompt-file; empty for local or unknown jobs",
+                ciFixDone: "whether the active generation has a DONE remediation or soak",
+                ciReproduced: "whether the active generation has DONE reproduction with YES",
                 failures: "its failures (absent on PASS|CONCERNS = 0, absent on FAIL = null: count unknown), or null",
                 strategy: "the step's last strategy across ALL runs, or null",
                 nextStrategy: "next rung: STANDARD, PIVOT, FINAL (null without --step)",
@@ -484,6 +508,11 @@ export const statusCommand = {
                     help: "positive integer, or run (the active run's number)",
                 },
                 { name: "opened-pr", type: "boolean", help: "record openedPr: this run opened the PR" },
+                {
+                    name: "ci-selection-file",
+                    type: "string",
+                    help: "validated atomic debug CI or local selection JSON",
+                },
             ],
             output: { row: "the appended workflow-meta row" },
             exitCodes: { [EXIT_NO_STATUS]: "status.jsonl does not exist (meta never starts a log)" },
@@ -491,6 +520,22 @@ export const statusCommand = {
                 const file = statusFile(ctx);
                 const at = statusTimestamp();
                 const fields = {};
+                if (ctx.flags.ciSelectionFile !== undefined) {
+                    const parsed = parseJson(fs.readFileSync(path.resolve(ctx.cwd, String(ctx.flags.ciSelectionFile)), "utf-8"));
+                    const selection = parsed.ok ? parsed.value : null;
+                    if (!validateCiSelection(selection))
+                        throw new CommandError(EXIT.USAGE, "invalid CI selection");
+                    const active = readRuns(file).at(-1);
+                    if (ctx.flags.workflow !== "debug" ||
+                        active?.workflow !== "debug" ||
+                        active.status !== "IN_PROGRESS")
+                        throw new CommandError(EXIT.USAGE, "CI selection needs an active debug run");
+                    const same = validateCiSelection(active.ciSelection) &&
+                        ciSelectionIdentity(active.ciSelection) === ciSelectionIdentity(selection);
+                    fields.ciSelection =
+                        selection.mode === "local" ? { mode: "local", reason: selection.reason } : selection;
+                    fields.ciGeneration = (Number(active.ciGeneration) || 0) + (same ? 0 : 1);
+                }
                 for (const { key, check } of Object.values(META_FIELDS)) {
                     const v = str(ctx.flags[key]);
                     // `--debug-attempt=run`: the active run's number, read once the log is known to exist.
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 283fafb5f..a08081b4a 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -11,7 +11,7 @@
 // and print the step's tracker comment.
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { actionKey, activeDoneSteps, allRunsDoneSteps, appendLine, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
+import { actionKey, activeDoneSteps, allRunsDoneSteps, appendLine, ciRoundMatches, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
@@ -22,7 +22,7 @@ import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
 import { EXIT_FOREIGN_PATH, activeRecord, ownPathCommit, ownSet, } from "./ledgers.js";
 import { readHolder, resolveMonth, workflowLockPath } from "./locks.js";
-import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readRunsAt, statusFile, str, } from "./status.js";
+import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readStatusRows, readRunsAt, statusFile, str, } from "./status.js";
 import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, commentFileOf, postForVerb, } from "./tracker.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
 import { PLAN_TASKS_STEP, readTestFirst, touchedTests } from "./tests.js";
@@ -824,6 +824,56 @@ async function finish(ctx) {
         const fid = path.basename(path.dirname(file));
         extras.clamped = readRecords(clampLogPath(ctx.cwd, fid, clampStep, positiveInt(clampAttempt, "clamp-log attempt")), (l) => ctx.log(`skipping a malformed clamp record: ${l}`));
     }
+    if (workflow === "debug" && step === "debug-run-tests") {
+        const active = readRuns(file).at(-1);
+        const rows = readStatusRows(file);
+        const start = rows
+            .map((r, i) => (r.type === "workflow-started" && r.workflow === "debug" ? i : -1))
+            .filter((i) => i >= 0)
+            .at(-1) ?? -1;
+        const round = rows
+            .slice(start + 1)
+            .reverse()
+            .find((r) => r.type === "test-run" &&
+            r.workflow === workflow &&
+            r.step === step &&
+            r.attempt === attempt);
+        if (extras.source === "ci" || round?.source === "ci") {
+            const matching = active?.workflow === "debug" &&
+                active.status === "IN_PROGRESS" &&
+                round &&
+                ciRoundMatches(round, active.ciSelection, active.ciGeneration) &&
+                extras.source === "ci" &&
+                extras.ciGeneration === active.ciGeneration &&
+                verdict === "FAIL" &&
+                failures === undefined &&
+                extras.scope === round.scope &&
+                artifacts.includes(String(round.artifact));
+            if (!matching)
+                throw new CommandError(EXIT.USAGE, "CI evidence does not match the active selection");
+            const text = fs.readFileSync(path.resolve(ctx.cwd, String(round.artifact)), "utf-8");
+            const required = [
+                "Verdict: FAIL",
+                "Source: ci",
+                `Scope: ${round.scope}`,
+                `Repository: ${round.repo}`,
+                `Workflow: ${round.workflowPath} (${round.workflowId})`,
+                `Run: ${round.ciRun}`,
+                `Run attempt: ${round.runAttempt}`,
+                `CI generation: ${round.ciGeneration}`,
+                `Commit: ${round.headSha}`,
+                `URL: ${round.ciUrl}`,
+                "The local gate was not run.",
+            ];
+            if (!required.every((line) => text.split(/\r?\n/).includes(line)))
+                throw new CommandError(EXIT.USAGE, "CI evidence artifact identity mismatch");
+            delete extras.clamped;
+        }
+        else if ((clampLog !== undefined || round !== undefined) &&
+            (!Array.isArray(extras.clamped) || extras.clamped.length === 0)) {
+            throw new CommandError(EXIT.USAGE, "local test completion needs clamp evidence");
+        }
+    }
     // What the gate would refuse, refused before anything is written.
     const pre = gateChecks(ctx.cwd, {
         workflow,
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index fd67189d5..b84c6d3f9 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -22,13 +22,13 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { BKIT_LINT_FILE_SCRIPT, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
 import { clampLogPath } from "../../ledgers/clamp-log.js";
-import { appendLine, statusTimestamp } from "../../ledgers/status.js";
+import { appendLine, statusTimestamp, validateCiSelection, testRunProblem, } from "../../ledgers/status.js";
 import { CommandError, EXIT, git, runGit } from "../lib.js";
 import { parseJson } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { CONFIG_DEFAULTS, readBkitConfig } from "../../shared/settings.js";
-import { FILE_FLAG, GROUP_FLAG, WORKFLOW_FLAG, positiveInt, readStatusRows, statusFile, str, } from "./status.js";
+import { FILE_FLAG, GROUP_FLAG, WORKFLOW_FLAG, positiveInt, readStatusRows, readRuns, statusFile, str, } from "./status.js";
 import { NO_MARKERS_REASON, derivedTestMatrix, fenceNeverClosed, parsePlanBlocks, reuseInventory, supersessionInventory, } from "./plan-blocks.js";
 import { writeStepRow } from "./steps.js";
 import { appendRecord, clampFile } from "./context.js";
@@ -137,7 +137,12 @@ function appendTestRun(file, r) {
         scope: r.scope,
         log: r.log,
         ...(r.artifact === undefined ? {} : { artifact: r.artifact }),
+        ...(r.source === undefined ? {} : { source: r.source }),
+        ...r.evidence,
     };
+    const problem = testRunProblem(row);
+    if (problem !== null)
+        throw new CommandError(EXIT.USAGE, problem);
     fs.appendFileSync(file, appendLine(row));
     return row;
 }
@@ -1229,8 +1234,19 @@ export const testsCommand = {
                     help: "status.jsonl: append one test-run row for this run, pass or fail; needs --workflow and --step",
                 },
                 { name: "workflow", type: "string", help: "--file: workflow name, for the test-run row" },
+                { name: "ci-run", type: "string", help: "selected GitHub evidence run ID" },
+                { name: "ci-url", type: "string", help: "selected GitHub evidence attempt URL" },
             ],
             output: {
+                source: "ci for pinned red evidence; local after its current-generation fix",
+                runAttempt: "selected CI attempt for a CI evidence round",
+                ciGeneration: "active selection generation for a CI evidence round",
+                ciRun: "selected CI run ID for a CI evidence round",
+                ciUrl: "selected CI attempt URL for a CI evidence round",
+                repo: "selected repository for a CI evidence round",
+                workflowId: "selected workflow ID for a CI evidence round",
+                workflowPath: "selected workflow path for a CI evidence round",
+                headSha: "selected commit for a CI evidence round",
                 verdict: "PASS | FAIL (null when the gate could not run)",
                 exitCode: "the gate's exit code",
                 gate: "the script that ran",
@@ -1267,6 +1283,91 @@ export const testsCommand = {
                 const status = statusArg === undefined ? undefined : path.resolve(ctx.cwd, statusArg);
                 if (status !== undefined && !fs.existsSync(status))
                     throw new CommandError(EXIT.USAGE, `--file ${statusArg} does not exist (a test-run row never starts a log)`);
+                if (ctx.flags.ciRun !== undefined || ctx.flags.ciUrl !== undefined) {
+                    const active = status === undefined ? undefined : readRuns(status).at(-1);
+                    const selection = active?.ciSelection;
+                    if (!status ||
+                        workflow !== "debug" ||
+                        active?.workflow !== "debug" ||
+                        active.status !== "IN_PROGRESS" ||
+                        !validateCiSelection(selection) ||
+                        selection.mode !== "ci" ||
+                        ctx.flags.ciRun !== selection.runId ||
+                        ctx.flags.ciUrl !== selection.runUrl ||
+                        !Number.isSafeInteger(active.ciGeneration) ||
+                        Number(active.ciGeneration) < 1 ||
+                        !artifact)
+                        throw new CommandError(EXIT.USAGE, "CI round needs an active matching debug selection and artifact");
+                    const fixed = active.steps.some((s) => s.status === "DONE" &&
+                        s.ciGeneration === active.ciGeneration &&
+                        ["debug-failure-remediate", "debug-failure-soak"].includes(s.step));
+                    if (!fixed) {
+                        const scope = `ci:${selection.runId}`;
+                        const text = [
+                            "Verdict: FAIL",
+                            "Source: ci",
+                            `Scope: ${scope}`,
+                            `Repository: ${selection.repo}`,
+                            `Workflow: ${selection.workflowPath} (${selection.workflowId})`,
+                            `Run: ${selection.runId}`,
+                            `Run attempt: ${selection.runAttempt}`,
+                            `CI generation: ${active.ciGeneration}`,
+                            `Commit: ${selection.headSha}`,
+                            `URL: ${selection.runUrl}`,
+                            "",
+                            "<!-- verdict:end -->",
+                            "",
+                            "# CI evidence",
+                            "",
+                            "The local gate was not run.",
+                            "",
+                        ].join("\n");
+                        for (const dest of new Set([artifact, logArg])) {
+                            const out = path.resolve(ctx.cwd, dest);
+                            fs.mkdirSync(path.dirname(out), { recursive: true });
+                            fs.writeFileSync(out, text);
+                        }
+                        const evidence = {
+                            gate: null,
+                            ciRun: selection.runId,
+                            ciUrl: selection.runUrl,
+                            runAttempt: selection.runAttempt,
+                            ciGeneration: active.ciGeneration,
+                            repo: selection.repo,
+                            workflowId: selection.workflowId,
+                            workflowPath: selection.workflowPath,
+                            headSha: selection.headSha,
+                        };
+                        const row = appendTestRun(status, {
+                            workflow,
+                            step: step,
+                            attempt,
+                            source: "ci",
+                            verdict: "FAIL",
+                            exitCode: null,
+                            failures: null,
+                            scope,
+                            log: logArg,
+                            artifact,
+                            evidence,
+                        });
+                        ctx.emit({
+                            source: "ci",
+                            verdict: "FAIL",
+                            scope,
+                            exitCode: null,
+                            failures: null,
+                            ...evidence,
+                            artifact,
+                            log: logArg,
+                            logBytes: Buffer.byteLength(text),
+                            reports: null,
+                            clamp: null,
+                            row,
+                        });
+                        return EXIT.NO;
+                    }
+                }
                 const tailRaw = str(ctx.flags.tail) ?? String(DEFAULT_TAIL);
                 if (!/^[0-9]+$/.test(tailRaw)) {
                     throw new CommandError(EXIT.USAGE, `--tail must be a non-negative integer, got "${tailRaw}"`);
@@ -1334,8 +1435,10 @@ export const testsCommand = {
                         scope,
                         log: logArg,
                         artifact,
+                        ...(ctx.flags.ciRun === undefined ? {} : { source: "local" }),
                     });
                 ctx.emit({
+                    ...(ctx.flags.ciRun === undefined ? {} : { source: "local" }),
                     verdict,
                     exitCode,
                     gate,
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index 2e7f17be7..b511521c3 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -72,11 +72,68 @@ export function ciSelectionIdentity(selection) {
             selection.headSha,
         ]);
 }
+/** Validate the bounded CI evidence variant without relaxing local exit codes. */
+export function testRunProblem(value) {
+    if (!value || typeof value !== "object")
+        return "test-run must be an object";
+    const r = value;
+    const positive = (v) => Number.isSafeInteger(v) && Number(v) > 0;
+    if (r.source === "ci") {
+        if (r.workflow !== "debug" ||
+            r.step !== "debug-run-tests" ||
+            r.verdict !== "FAIL" ||
+            r.exitCode !== null ||
+            r.failures !== null ||
+            r.gate !== null ||
+            !positive(r.ciGeneration) ||
+            !positive(r.runAttempt) ||
+            typeof r.ciRun !== "string" ||
+            !/^[1-9][0-9]*$/.test(r.ciRun) ||
+            r.scope !== `ci:${r.ciRun}` ||
+            typeof r.artifact !== "string" ||
+            !r.artifact ||
+            typeof r.repo !== "string" ||
+            !/^[\w.-]+\/[\w.-]+$/.test(r.repo) ||
+            r.ciUrl !== `https://github.com/${r.repo}/actions/runs/${r.ciRun}/attempts/${r.runAttempt}` ||
+            typeof r.workflowId !== "string" ||
+            !/^[1-9][0-9]*$/.test(r.workflowId) ||
+            typeof r.workflowPath !== "string" ||
+            !/^\.github\/workflows\/[^/]+\.ya?ml$/.test(r.workflowPath) ||
+            typeof r.headSha !== "string" ||
+            !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(r.headSha))
+            return "invalid CI evidence round";
+        return null;
+    }
+    if (r.source !== undefined && r.source !== "local")
+        return "invalid test source";
+    if (!Number.isSafeInteger(r.exitCode) || Number(r.exitCode) < 0)
+        return "local exitCode must be a non-negative integer";
+    if (r.failures !== null && (!Number.isSafeInteger(r.failures) || Number(r.failures) < 0))
+        return "invalid failure count";
+    return null;
+}
+/** A round belongs to exactly one saved evidence generation. */
+export function ciRoundMatches(row, selection, generation) {
+    return (validateCiSelection(selection) &&
+        selection.mode === "ci" &&
+        testRunProblem(row) === null &&
+        row.source === "ci" &&
+        row.ciGeneration === generation &&
+        row.ciRun === selection.runId &&
+        row.runAttempt === selection.runAttempt &&
+        row.ciUrl === selection.runUrl &&
+        row.repo === selection.repo &&
+        row.workflowId === selection.workflowId &&
+        row.workflowPath === selection.workflowPath &&
+        row.headSha === selection.headSha);
+}
 // Identity for de-dup under union merge. `step-done` is unique per
 // (workflow, step, parentSha, at); workflow-level events per (type, workflow, at).
 function identity(e) {
     if (e.type === "step-done")
-        return `S\u0000${e.workflow}\u0000${e.step}\u0000${e.parentSha}\u0000${e.at}`;
+        return `S\u0000${e.workflow}\u0000${e.step}\u0000${e.parentSha}\u0000${e.at}${e.ciGeneration === undefined ? "" : `\u0000${e.status}\u0000${e.ciGeneration}`}`;
+    if (e.type === "workflow-meta" && e.ciSelection !== undefined)
+        return `M\u0000${e.workflow}\u0000${e.at}\u0000${e.ciGeneration}\u0000${JSON.stringify(e.ciSelection)}`;
     return `W\u0000${e.type}\u0000${e.workflow}\u0000${e.at}`;
 }
 // Index of the most-recent run matching `workflow`, or -1.
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 186b5dc3b..7a5093db6 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `1050cf638`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `2f9146f6e`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,19 +159,19 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 1050cf638c10941f2efac143030c4270c7ac13bc — do not edit
+  %% Generated by bkit-graphify-rollup.py from 2f9146f6ef588a8c5ab7a885d94dba88d2c7e196 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1651 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>280 symbols · 19 files"]
-    n_bkit_core_engine_ledgers["ledgers<br/>181 symbols · 6 files"]
+    n_bkit_core_engine_ledgers["ledgers<br/>183 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>149 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
+  n_bkit_core_engine_commands -->|347| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|346| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|339| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|198| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|157| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|131| n_bkit_core_engine_shared
@@ -188,8 +188,8 @@ flowchart LR
   n_bkit_core_engine_install -->|12| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|12| n_bkit_core_engine_cli
   n_bkit_core_engine_render -->|12| n_bkit_core_engine_shared
+  n_bkit_core_engine_checks -->|11| n_bkit_core_engine_ledgers
   n_bkit_core_engine_install -->|11| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_checks -->|8| n_bkit_core_engine_ledgers
   n_bkit_core_engine_install -->|8| n_bkit_core_engine_cli
   n_bkit_core_engine_cli -->|7| n_bkit_core_engine_install
   n_bkit_core_engine_render -->|7| n_bkit_core_engine_install
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 1050cf638c10941f2efac143030c4270c7ac13bc — do not edit
+  %% Generated by bkit-graphify-rollup.py from 2f9146f6ef588a8c5ab7a885d94dba88d2c7e196 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -350,7 +350,7 @@ flowchart LR
     subgraph gn_bkit_core_engine_ledgers[".bkit/core/engine/ledgers"]
       n_bkit_core_engine_ledgers_compact["compact<br/>8 symbols · 1 files"]
       n_bkit_core_engine_ledgers_journal["journal<br/>16 symbols · 1 files"]
-      n_bkit_core_engine_ledgers_status["status<br/>33 symbols · 1 files"]
+      n_bkit_core_engine_ledgers_status["status<br/>35 symbols · 1 files"]
     end
     subgraph gn_bkit_core_engine_render[".bkit/core/engine/render"]
       n_bkit_core_engine_render_hosts["hosts<br/>29 symbols · 1 files"]
@@ -382,11 +382,11 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_run_facts
   n_bkit_core_engine_commands_workflow_workflows -->|28| n_bkit_core_engine_commands_workflow_tracker
+  n_bkit_core_engine_commands_workflow_status -->|27| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_context -->|24| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_status -->|24| n_bkit_core_engine_ledgers_status
+  n_bkit_core_engine_commands_workflow_steps -->|24| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_status -->|23| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|22| n_bkit_core_engine_ledgers_telemetry
-  n_bkit_core_engine_commands_workflow_steps -->|22| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_checks_after_index -->|21| n_bkit_core_engine_checks_after_ci_yml
   n_bkit_core_engine_commands_workflow_counters -->|21| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_ledgers
@@ -400,6 +400,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_prs -->|18| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_roadmap -->|18| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_branches -->|17| n_bkit_core_engine_commands_workflow_worktrees
+  n_bkit_core_engine_commands_workflow_steps -->|17| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_tests -->|16| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_workflows -->|16| n_bkit_core_engine_ledgers_telemetry
@@ -414,7 +415,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_prs -->|15| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_roadmap -->|15| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|15| n_bkit_core_engine_commands_workflow_tracker
-  n_bkit_core_engine_commands_workflow_steps -->|15| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_install_modules_opencode -->|15| n_bkit_core_engine_install_write
   n_bkit_core_engine_ledgers_compact -->|15| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_managed -->|14| n_bkit_core_engine_install_managed_block
@@ -427,6 +427,7 @@ flowchart LR
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_github
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|13| n_bkit_core_engine_commands_workflow_prs
+  n_bkit_core_engine_commands_workflow_tests -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_worktrees -->|13| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_render_hosts -->|13| n_bkit_core_engine_render_models
   n_bkit_core_engine_checks_tips_catalogue -->|13| n_bkit_core_engine_checks_tips_detect
@@ -438,7 +439,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_repo -->|12| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|12| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_runtime -->|12| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_tests -->|12| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_checks_after_index -->|11| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_shared_package_roots
@@ -446,6 +446,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_runs -->|11| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
+  n_bkit_core_engine_commands_workflow_tests -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
@@ -456,7 +457,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_context -->|10| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_issues -->|10| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
-  n_bkit_core_engine_commands_workflow_tests -->|10| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|10| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_workflow_branches
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_checks_status_holes
@@ -483,6 +483,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_steps -->|9| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_workflow_plan_blocks
+  n_bkit_core_engine_commands_workflow_tests -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_worktrees -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_install_modules_antigravity -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_claude -->|9| n_bkit_core_engine_shared_package_roots
@@ -555,7 +556,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_plans -->|6| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_tests
-  n_bkit_core_engine_commands_workflow_tests -->|6| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_steps
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_plans
@@ -797,7 +797,7 @@ flowchart LR
   linkStyle 127 stroke:#59636eb3,stroke-width:3px
   linkStyle 128 stroke:#59636eb3,stroke-width:3px
   linkStyle 129 stroke:#59636eb3,stroke-width:3px
-  linkStyle 130 stroke:#59636e80,stroke-width:2px
+  linkStyle 130 stroke:#59636eb3,stroke-width:3px
   linkStyle 131 stroke:#59636e80,stroke-width:2px
   linkStyle 132 stroke:#59636e80,stroke-width:2px
   linkStyle 133 stroke:#59636e80,stroke-width:2px
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index 9c7121885..1ab0e7110 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -124,3 +124,4 @@
 {"schema":3,"ts":1793615638847,"firstTs":1793615638847,"updates":1,"kind":"failure","key":"runs-revalidate-pr-head-auth-timeout-under-audits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The existing revalidate PR-head/auth test times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 5201ms in runs.test.ts: exits 1 when the PR head cannot be read, 80 when gh needs auth. Another worktree was running audits concurrently. The unchanged file and ci-scripts.test.ts passed together, 207 tests in 29.07 seconds.","rootCause":"Concurrent host load exceeded the existing test budget; there was no assertion failure.","status":"OPEN"}
 {"schema":3,"ts":1793615638848,"firstTs":1793615638848,"updates":1,"kind":"failure","key":"runs-context-label-read-timeout-under-audits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The existing CI-context label-read test times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 5201ms in runs.test.ts: prints ref (#N on GitHub) and the labels the engine reads; a failed read is null. Another worktree was running audits concurrently. The unchanged file and ci-scripts.test.ts passed together, 207 tests in 29.07 seconds.","rootCause":"Concurrent host load exceeded the existing test budget; there was no assertion failure.","status":"OPEN"}
 {"schema":3,"ts":1793615638849,"firstTs":1793615638849,"updates":1,"kind":"failure","key":"runs-context-issue-less-timeout-under-audits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The existing issue-less CI-context refusal test times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 5201ms in runs.test.ts: runs context refuses an issue-less marker and branch naming the missing issue. Another worktree was running audits concurrently. The unchanged file and ci-scripts.test.ts passed together, 207 tests in 29.07 seconds.","rootCause":"Concurrent host load exceeded the existing test budget; there was no assertion failure.","status":"OPEN"}
+{"schema":3,"ts":1793622432042,"firstTs":1793067330089,"updates":3,"kind":"failure","key":"instructions-retired-clause-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-workflows-handover"},"references":["705","runs-wait-cli-found-flaky-under-full-gate",".bkit/core/engine/tools/instructions.test.ts:1029",".bkit/core/engine/commands/workflow/runs.test.ts:1228","814","830"],"category":"testing","summary":"instructions.test.ts \"output-cap's sentence stays inline in the abort handover prompt\" timed out under the full gate, passed on rerun","severity":"LOW","description":"Re-observed 2026-10-27 in the build workflow for 705-build-plan-convert, at the group-1 gate (`bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit`) on a worktree at .worktrees/705-build-plan-convert: `Test timed out in 5000ms` at `.bkit/core/engine/tools/instructions.test.ts:1029`. Re-running `instructions.test.ts` and `runs.test.ts` together in isolation passed 255/255 in 28.8s. Same run also hit the recorded `runs-wait-cli-found-flaky-under-full-gate` case; the machine reported load average 25.3 on 10 cores. Re-observed during the build handover for 830-debug-diagnose-named: pre-push ran 6979 unit tests, 6976 passed, 2 skipped and this case timed out at 5000ms. Push was refused; record remains local. Evidence: tmp/pre-push.log.","rootCause":"the case spawns the CLI and takes 5.4s of its 5s budget in-repo; under a full parallel gate on a heavily loaded machine it exceeds the timeout while the code under test is unaffected","remediation":"give the spawning cases in instructions.test.ts and runs.test.ts an explicit per-test timeout budget, or raise the shared unit budget for CLI-spawning suites","status":"TRIAGED"}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 45761c0a6..92acda321 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -133,3 +133,4 @@
 {"schema":3,"ts":1793523381121,"firstTs":1793004573756,"updates":2,"kind":"knowledge","key":"bkit-tests-red-snapshot-accepts-added-lines-only","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/audits/workflows/question-option-format.test.ts","#796"],"summary":"`bkit tests green` reads a test file as unchanged only when it keeps every snapshot line in order, so a fix to a rule after its recorded red must be pure addition","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports `changed: yes` and a `test-changed` gap for a test that passed its recorded red, with a `Diff since red` block, after the rule under test was corrected.\n- **Root cause:** `bkit tests red` copies the test file beside its log as `<log>.snapshot` and stores its blob; the green audit compares that snapshot with the current file through `onlyAddsLines`, which walks the snapshot's non-blank, whitespace-stripped lines as a subsequence of the current file. Inserted lines anywhere pass (`added lines only`); any modified or removed line fails. A red cannot simply be re-recorded, because `bkit tests red` refuses `passed` for a named test that now succeeds.\n- **Fix or rule:** correct a red-flagged rule by adding lines — a normalisation pass appended inside the existing function, for instance — never by editing the lines the red validated; add the new behaviour as a separate pass over the existing output and leave the old lines in order. A `TEST EXCEPTION` committed by a human is the only other way past a test-order gap.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"`onlyAddsLines` is a subsequence test over the snapshot's normalised lines, so the red evidence pins the exact byte order of the old lines: an edit breaks it, an insertion does not. `bkit tests red` will not re-record a red for a named test that now passes.","remediation":"Superseded by `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (#796): no edit to a planned test file is accepted after its red, additive or not; the code step is refused instead.","status":"SUPERSEDED"}
 {"schema":3,"ts":1793523381122,"firstTs":1793100920719,"updates":2,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md","#796"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"Superseded by `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (#796): the tests step formats the file before the red; a `prettier --write` in the code step is refused by `steps finish`, not reported at green.","status":"SUPERSEDED"}
 {"schema":3,"ts":1793524772549,"firstTs":1793524772549,"updates":1,"kind":"knowledge","key":"escaped-backticks-inside-a-code-span-are-retokenised-by-prettier","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#796",".bkit/core/prompts/bkit-build-plan-tests.md",".bkit/core/engine/audits/workflows/prompt-notation.test.ts"],"summary":"A markdown code span that escapes inner backticks (`` `PASSES — TASK {N}: \\`{file}\\`` `` style) is re-tokenised by `prettier --write`: the spaces around the words after it vanish, the line no longer matches its `.bkit/instructions.md` entry and `instructions-coverage.test.ts` fails","description":"- **Category:** tooling\n- **Symptom:** after the format gate a prompt line reads `...{why}`with Bash`echo >>`` and the coverage test reports both `no entry` and `local entry no longer in the file` for it.\n- **Cause:** prettier parses the escaped backticks as span boundaries and rewrites the line; the instructions store still holds the pre-format text.","remediation":"Write a code span that must show backticks as a double-backtick span: ``PASSES — TASK {N}: `{file}` `{name}`: {reason}``. Prettier leaves it alone and `prompt-notation.test.ts` reads it as one span.","status":"ACTIVE"}
+{"schema":3,"ts":1793623927140,"firstTs":1793623927140,"updates":1,"kind":"knowledge","key":"status-ci-evidence-identity-needs-generation-with-second-resolution-timestamps","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/ledgers/status.ts",".bkit/core/engine/commands/workflow/status.test.ts"],"summary":"Include evidence identity and generation in status event deduplication when selections can change within one second.","description":"Status timestamps have second resolution. Multiple atomic selection writes or distinct generation-specific step outcomes can share a timestamp, so the generic timestamp tuple would discard a later selection or DONE result as a duplicate.","rootCause":"The fold deduplicates before applying append order; a timestamp alone does not distinguish new evidence at the same instant.","remediation":"Keep selection and generation in workflow-meta identity, and generation and outcome in CI step identity. Preserve the existing identity for ordinary step rows. The atomic selection and current-generation fix tests cover these collisions.","status":"ACTIVE"}
