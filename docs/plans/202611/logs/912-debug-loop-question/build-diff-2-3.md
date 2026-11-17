diff --git a/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
index 52e3fdcf7..587f200b2 100644
--- a/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
+++ b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
@@ -79,6 +79,7 @@ function consumer() {
     `const fs = require("node:fs");
 fs.appendFileSync("events.jsonl", JSON.stringify({kind:"local-gate", gate:process.argv[2]}) + "\\n");
 const control = JSON.parse(fs.readFileSync("control.json", "utf8"));
+if (control.failLocal) process.exit(1);
 if (!control.local && fs.readFileSync("source.txt", "utf8").trim() !== "fixed") process.exit(1);
 console.log("consumer checks passed");
 `,
@@ -113,6 +114,8 @@ console.log("consumer checks passed");
     finalHead: head,
     verifyingId: 301,
     local: false,
+    secondFailedJob: false,
+    failLocal: false,
   };
   const save = () => write("control.json", JSON.stringify(control));
   save();
@@ -144,7 +147,7 @@ const run=id=>({id,run_attempt:2,workflow_id:777,path:".github/workflows/special
   html_url:"https://github.com/example/example/actions/runs/"+id,created_at:"2026-11-01T01:00:00Z",updated_at:"2026-11-01T01:01:00Z"});
 if(args[0]==="auth") process.exit(0);
 if(args[0]==="run" && args[1]==="view"){
-  if(!args.includes("--log-failed") || flag("--repo")!=="example/example" || flag("--attempt")!=="2" || flag("--job")!=="501") reject("unpinned context log request");
+  if(!args.includes("--log-failed") || flag("--repo")!=="example/example" || flag("--attempt")!=="2" || !["501","502","503"].includes(flag("--job"))) reject("unpinned context log request");
   if(!state.logs) reject("selected logs unavailable");
   process.stdout.write("integration fixture failure in run "+args[2]+" attempt 2\\n");process.exit(0);
 }
@@ -158,7 +161,10 @@ if(endpoint.includes("/actions/workflows/")){
 if(endpoint.includes("/jobs")){
   if(endpoint.includes("/201/")){emit({total_count:1,jobs:[{id:1,name:"bkit-tests-check",status:"completed",conclusion:"success"}]});process.exit(0)}
   if(!endpoint.includes("/attempts/2/jobs")) reject("jobs require the selected attempt");
-  const value={total_count:1,jobs:[{id:501,name:"bkit-tests-integration",status:"completed",conclusion:"failure"}]};
+  const jobs=[{id:501,name:"bkit-tests-integration",status:"completed",conclusion:"failure"}];
+  if(state.secondFailedJob) jobs.push({id:502,name:"bkit-tests-unit",status:"completed",conclusion:"failure"});
+  jobs.push({id:503,name:"bkit-tests-check",status:"completed",conclusion:"failure"});
+  const value={total_count:jobs.length,jobs};
   emit(args.includes("--slurp")?[value]:value);process.exit(0);
 }
 const match=endpoint.match(new RegExp("/actions/runs/([0-9]+)(?:/attempts/([0-9]+))?"));
@@ -335,6 +341,7 @@ reject("unsupported fixture endpoint "+endpoint);
     agent,
     gate,
     execute,
+    runLine,
   };
 }
 
@@ -367,6 +374,34 @@ describe("Debug CI evidence sequence", () => {
     expect.soft(finished, finished.err).toMatchObject({ code: 0, json: { pass: true } });
   });
 
+  it("records the failed job count and reads an uncounted local round as unknown", () => {
+    const f = consumer();
+    f.control.secondFailedJob = true;
+    f.save();
+    expect(f.select().state).toMatchObject({ ciRun: "123", ciGeneration: 1 });
+    const ciRound = f.round();
+    expect(ciRound).toMatchObject({ code: 1, json: { source: "ci", failures: 2 } });
+    expect(ciRound.json.row.failures).toBe(2);
+    expect(f.finishRound(), "finish CI round").toMatchObject({ code: 0, json: { pass: true } });
+    expect(f.context().json.outcome).toBe("checked");
+    expect(f.agent("diagnose").code).toBe(0);
+    expect(f.agent("remediate").code).toBe(0);
+    f.vars.DEBUG_ATTEMPT = "2";
+    f.control.local = true;
+    f.control.failLocal = true;
+    f.save();
+    const local = f.round();
+    expect(local).toMatchObject({ code: 1, json: { source: "local", failures: null } });
+    expect(f.finishRound().code).toBe(0);
+    f.vars.LOOP_FIX = "debug-failure-remediate";
+    const question = /^\s*"\{BKIT\}" counters progress .*$/m.exec(WORKFLOW)?.[0];
+    expect(question).toBeTruthy();
+    const progress = f.runLine(String(question).trim());
+    expect(progress.code).toBe(0);
+    expect(progress.json).toMatchObject({ counts: "2 → ?", trend: "unknown" });
+    expect(progress.json.recommend).not.toBe("stop");
+  });
+
   it("finishes replacement CI evidence with the unchanged debug run number", () => {
     const f = consumer();
     expect(f.select().state).toMatchObject({ ciGeneration: 1, debugAttempt: 1 });
diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index 0cbc5d32f..5777446d7 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -1066,6 +1066,75 @@ describe("check — hole classes", () => {
     expect(check(forged, contract).verdict).toBe("HOLEY");
   });
 
+  it("a counted CI round with its step-done row raises no CI evidence hole", () => {
+    const md = [
+      "## Step 1 — Run Tests",
+      ...fence(
+        "tests run --ci-run=123 --ci-url=https://github.com/example/example/actions/runs/123/attempts/2",
+        "steps finish --workflow=debug --step=debug-run-tests --number=1",
+      ),
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
+      failedJobCount: 2,
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
+        failures: 2,
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
+        failures: 2,
+        attempt: 1,
+        ciGeneration: 1,
+        artifacts: ["logs/ci-round-1.md"],
+      }),
+    ];
+    const contract = deriveContract(md, "debug");
+    const holes = check(rows, contract).evidenceHoles;
+    expect(holes.filter((hole) => hole.step === "debug-run-tests")).toEqual([]);
+    expect(holes.some((hole) => JSON.stringify(hole).includes("tests run --ci-run"))).toBe(false);
+  });
+
   const contextSelection = {
     mode: "ci",
     provider: "github",
diff --git a/.bkit/core/engine/commands/workflow/runs.test.ts b/.bkit/core/engine/commands/workflow/runs.test.ts
index 4228f50e8..8222b0df9 100644
--- a/.bkit/core/engine/commands/workflow/runs.test.ts
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -572,6 +572,67 @@ describe("bkit runs locate", () => {
     expect(issue.selected()).toMatchObject({ runId: "101" });
   });
 
+  it("saves the failed job count without the capstone job", async () => {
+    const f = locateFixture();
+    f.data.jobs = [
+      { id: 1, name: "bkit-tests-integration", status: "completed", conclusion: "failure" },
+      { id: 2, name: "bkit-tests-unit", status: "completed", conclusion: "failure" },
+      { id: 3, name: "bkit-tests-static", status: "completed", conclusion: "success" },
+      { id: 4, name: "bkit-tests-check", status: "completed", conclusion: "failure" },
+    ];
+    expect((await f.locate()).code).toBe(0);
+    expect(f.selected()).toMatchObject({ mode: "ci", failedJobCount: 2 });
+  });
+
+  it("counts the capstone job when it is the only failed job", async () => {
+    const f = locateFixture();
+    f.data.jobs = [
+      { id: 1, name: "bkit-tests-integration", status: "completed", conclusion: "success" },
+      { id: 2, name: "bkit-tests-check", status: "completed", conclusion: "failure" },
+    ];
+    expect((await f.locate()).code).toBe(0);
+    expect(f.selected()).toMatchObject({ mode: "ci", failedJobCount: 1 });
+  });
+
+  it("saves no failed job count when no job failed", async () => {
+    const f = locateFixture();
+    f.data.jobs = [
+      { id: 1, name: "bkit-tests-integration", status: "completed", conclusion: "success" },
+      { id: 2, name: "bkit-tests-check", status: "completed", conclusion: "success" },
+    ];
+    expect((await f.locate()).code).toBe(0);
+    const selected = f.selected() as Record<string, unknown>;
+    expect(selected.mode).toBe("ci");
+    expect("failedJobCount" in selected).toBe(false);
+  });
+
+  it("counts fallback evidence jobs without the capstone job", async () => {
+    const f = locateFixture();
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/actions/runs/101/attempts/2");
+    const evidence = path.join(f.cwd, "evidence.json");
+    fs.writeFileSync(
+      evidence,
+      JSON.stringify({
+        request: {
+          repo: "example/example",
+          branch: "fix/ci",
+          kind: "run",
+          runId: "101",
+          runAttempt: 2,
+        },
+        run: f.data.runs[0],
+        jobs: [
+          { id: 1, name: "bkit-tests-integration", status: "completed", conclusion: "failure" },
+          { id: 2, name: "bkit-tests-check", status: "completed", conclusion: "failure" },
+        ],
+        complete: true,
+      }),
+    );
+    f.data.error = true;
+    expect((await f.locate(`--evidence-file=${evidence}`)).code).toBe(0);
+    expect(f.selected()).toMatchObject({ mode: "ci", failedJobCount: 1 });
+  });
+
   it("rejects ambiguous cross-repository and malformed attempt references", async () => {
     const f = locateFixture();
     fs.writeFileSync(
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index 693724eb9..f588d4782 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -511,6 +511,7 @@ function locateCi(ctx: RunContext): number {
     headSha: text(run.head_sha),
     conclusion: text(run.conclusion) as Extract<CiSelection, { mode: "ci" }>["conclusion"],
     redTiers: tiers,
+    ...(failedJobs.length > 0 ? { failedJobCount: Math.max(1, mapped.length) } : {}),
     via,
   };
   if (
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 82744a2d2..403d94502 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -111,7 +111,7 @@ function ciFinishFixture() {
     scope: "ci:123",
     gate: null,
     exitCode: null,
-    failures: null,
+    failures: null as number | null,
     ciRun: "123",
     ciUrl: selection.runUrl,
     runAttempt: 2,
@@ -213,6 +213,32 @@ describe("test-round completion evidence", () => {
     expect((await run(forged.cwd, forged.args)).code).not.toBe(0);
   });
 
+  it("finishes a CI round only with its own failed job count", async () => {
+    const stepDone = (f: ReturnType<typeof ciFinishFixture>) =>
+      fs
+        .readFileSync(path.join(f.cwd, "logs/status.jsonl"), "utf-8")
+        .includes('"type":"step-done"');
+    const counted = ciFinishFixture();
+    counted.row.failures = 2;
+    counted.save();
+    const finished = await run(counted.cwd, [...counted.args, "--failures=2"]);
+    expect(finished.code).toBe(0);
+    expect(finished.json.row).toMatchObject({ step: "debug-run-tests", source: "ci", failures: 2 });
+    expect(stepDone(counted)).toBe(true);
+
+    const different = ciFinishFixture();
+    different.row.failures = 2;
+    different.save();
+    const wrong = await run(different.cwd, [...different.args, "--failures=3"]);
+    expect(wrong.code).not.toBe(0);
+    expect(stepDone(different)).toBe(false);
+
+    const uncounted = ciFinishFixture();
+    const refused = await run(uncounted.cwd, [...uncounted.args, "--failures=2"]);
+    expect(refused.code).not.toBe(0);
+    expect(stepDone(uncounted)).toBe(false);
+  });
+
   it("preserves local clamp enforcement when completing test rounds", async () => {
     const cwd = repo();
     write(
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 5df738b8c..60eb09970 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -1238,7 +1238,9 @@ async function finish(ctx: RunContext): Promise<number> {
         extras.source === "ci" &&
         extras.ciGeneration === active.ciGeneration &&
         verdict === "FAIL" &&
-        failures === undefined &&
+        (typeof round.failures === "number"
+          ? failures === round.failures
+          : failures === undefined) &&
         extras.scope === round.scope &&
         artifacts.includes(String(round.artifact));
       if (!matching)
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 0b8f846a0..4ea9fd867 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -201,6 +201,36 @@ describe("CI evidence test rounds", () => {
     expect(result.json.clamp).toBeNull();
   });
 
+  it("records the selected run's failed job count", async () => {
+    const f = ciRoundFixture();
+    const counted = { ...f.selection, failedJobCount: 2 };
+    fs.writeFileSync(
+      f.file,
+      [
+        { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
+        {
+          type: "workflow-meta",
+          workflow: "debug",
+          at: "2026-10-01T00:00:01Z",
+          ciSelection: counted,
+          ciGeneration: 2,
+        },
+      ]
+        .map((row) => JSON.stringify(row))
+        .join("\n") + "\n",
+    );
+    const result = await run(f.args);
+    expect(result.code).toBe(1);
+    expect(result.json).toMatchObject({ source: "ci", scope: "ci:123", failures: 2 });
+    expect(result.json.row).toMatchObject({ type: "test-run", source: "ci", failures: 2 });
+    const rows = fs
+      .readFileSync(f.file, "utf-8")
+      .trim()
+      .split("\n")
+      .map((line) => JSON.parse(line) as Record<string, unknown>);
+    expect(rows.find((row) => row.type === "test-run")).toMatchObject({ failures: 2 });
+  });
+
   it("runs local gates only after current-generation remediation or soak", async () => {
     const f = ciRoundFixture();
     f.fix(1);
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index b8c6fed88..3340554a7 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -1592,7 +1592,7 @@ export const testsCommand: CommandSpec = {
         exitCode: "the gate's exit code",
         gate: "the script that ran",
         scope: "the command that ran, as status rows record it",
-        failures: `0 on PASS; on FAIL the failing + erroring test cases in the JUnit reports, or null when no report counts any (unknown, never 0)`,
+        failures: `0 on PASS; on FAIL the failing + erroring test cases in the JUnit reports, or null when no report counts any (unknown, never 0); a CI evidence round: the selected run's failed jobs without the capstone, or null`,
         reports: `{log}.reports — emptied before the run and passed to the gate as $${REPORT_DIR_ENV}`,
         log: "where the full output was saved (as given); the untouched original",
         logBytes: "size of the saved output",
@@ -1705,7 +1705,7 @@ export const testsCommand: CommandSpec = {
               source: "ci",
               verdict: "FAIL",
               exitCode: null,
-              failures: null,
+              failures: selection.failedJobCount ?? null,
               scope,
               log: logArg,
               artifact,
@@ -1716,7 +1716,7 @@ export const testsCommand: CommandSpec = {
               verdict: "FAIL",
               scope,
               exitCode: null,
-              failures: null,
+              failures: selection.failedJobCount ?? null,
               ...evidence,
               artifact,
               log: logArg,
diff --git a/.bkit/core/engine/ledgers/status.test.ts b/.bkit/core/engine/ledgers/status.test.ts
index c26a755b9..a718e8eb4 100644
--- a/.bkit/core/engine/ledgers/status.test.ts
+++ b/.bkit/core/engine/ledgers/status.test.ts
@@ -70,6 +70,32 @@ describe("CI evidence selection contract", () => {
     expect(identity).not.toBe(ciSelectionIdentity({ ...selection, headSha: "b".repeat(40) }));
     expect(identity).not.toBe(ciSelectionIdentity({ mode: "local", reason: "explicit-local" }));
   });
+
+  it("validates failedJobCount as a positive whole number outside the identity", () => {
+    const selection = {
+      mode: "ci" as const,
+      provider: "github" as const,
+      repo: "example/example",
+      runId: "123",
+      runAttempt: 2,
+      runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+      workflowId: "456",
+      workflowPath: ".github/workflows/consumer-ci.yml",
+      headBranch: "fix/ci",
+      headSha: "a".repeat(40),
+      conclusion: "failure" as const,
+      redTiers: ["integration" as const],
+      via: "prompt-run",
+    };
+    expect(validateCiSelection(selection)).toBe(true);
+    expect(validateCiSelection({ ...selection, failedJobCount: 2 })).toBe(true);
+    expect(validateCiSelection({ ...selection, failedJobCount: 0 })).toBe(false);
+    expect(validateCiSelection({ ...selection, failedJobCount: -1 })).toBe(false);
+    expect(validateCiSelection({ ...selection, failedJobCount: 1.5 })).toBe(false);
+    expect(ciSelectionIdentity({ ...selection, failedJobCount: 2 })).toBe(
+      ciSelectionIdentity(selection),
+    );
+  });
 });
 
 describe("fold — event log → run array", () => {
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index a4562d27c..f672231b5 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -39,6 +39,8 @@ export type CiSelection =
       headSha: string;
       conclusion: "failure" | "timed_out" | "startup_failure";
       redTiers: CiTier[];
+      /** Failed jobs of the selected run, the capstone left out (1 when only it failed). */
+      failedJobCount?: number;
       via: string;
     };
 
@@ -77,6 +79,8 @@ export function validateCiSelection(value: unknown): value is CiSelection {
     ["failure", "timed_out", "startup_failure"].includes(stringField("conclusion")) &&
     Array.isArray(v.redTiers) &&
     v.redTiers.every((tier) => CI_TIERS.some((known) => known === tier)) &&
+    (v.failedJobCount === undefined ||
+      (Number.isSafeInteger(v.failedJobCount) && Number(v.failedJobCount) > 0)) &&
     typeof v.via === "string" &&
     v.via.trim().length > 0
   );
@@ -295,7 +299,7 @@ export function testRunProblem(value: unknown): string | null {
       r.step !== "debug-run-tests" ||
       r.verdict !== "FAIL" ||
       r.exitCode !== null ||
-      r.failures !== null ||
+      (r.failures !== null && !positive(r.failures)) ||
       r.gate !== null ||
       !positive(r.ciGeneration) ||
       !positive(r.runAttempt) ||
diff --git a/.bkit/core/engine/ledgers/telemetry.test.ts b/.bkit/core/engine/ledgers/telemetry.test.ts
index 4fa28041c..89ab2ff58 100644
--- a/.bkit/core/engine/ledgers/telemetry.test.ts
+++ b/.bkit/core/engine/ledgers/telemetry.test.ts
@@ -105,6 +105,38 @@ describe("test-run status row validation", () => {
     expect(testRunProblem({ ...local, exitCode: 0.5 })).not.toBeNull();
     expect(testRunProblem({ ...local, failures: -1 })).not.toBeNull();
   });
+
+  it("accepts a counted CI evidence round and refuses 0", () => {
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
+      failures: 2,
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
+    expect(testRunProblem({ ...ci, failures: null })).toBeNull();
+    expect(testRunProblem({ ...ci, failures: 0 })).not.toBeNull();
+    expect(testRunProblem({ ...ci, failures: -1 })).not.toBeNull();
+    expect(testRunProblem({ ...ci, failures: 1.5 })).not.toBeNull();
+  });
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index ffd628caf..3e22abcc0 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -164,3 +164,6 @@
 {"schema":3,"ts":1794353215422,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":8,"lastConfirmed":1794353215422}
 {"schema":3,"ts":1794364076173,"kind":"friction","key":"ci-push-gate/ci-push-gate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"ci-push-gate"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"bkit ci push-gate exited 75","description":"`bkit ci push-gate` exited 75 at ci-push-gate; the code is not one the command declares as routing.","source":"orchestrator","status":"OPEN","run":{"parentSha":"221dbfaaa9c1e59f77cab37b8a2e9ff3d80faf11"},"recurrenceCount":1}
 {"schema":3,"ts":1794355443743,"kind":"friction","key":"tests-plan-check/tests-plan-check","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"tests-plan-check"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"bkit tests plan-check threw an unhandled error","description":"`bkit tests plan-check` threw an unhandled error at tests-plan-check; the code is not one the command declares as routing.","source":"orchestrator","status":"OPEN","run":{"parentSha":"bd43a0dafddead86b875c8ef72c883350b2e808d"},"recurrenceCount":2,"lastConfirmed":1794355443743}
+{"schema":3,"ts":1794491062773,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":11,"lastConfirmed":1794491062773}
+{"schema":3,"ts":1794523948078,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":3,"lastConfirmed":1794523948078}
+{"schema":3,"ts":1794523952561,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":4,"lastConfirmed":1794523952561}
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index c0c144abb..ec8096fc8 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -348,6 +348,7 @@ function locateCi(ctx) {
         headSha: text(run.head_sha),
         conclusion: text(run.conclusion),
         redTiers: tiers,
+        ...(failedJobs.length > 0 ? { failedJobCount: Math.max(1, mapped.length) } : {}),
         via,
     };
     if (saved?.mode === "ci" &&
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 06e5aa4ea..d2f8789e8 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -980,7 +980,9 @@ async function finish(ctx) {
                 extras.source === "ci" &&
                 extras.ciGeneration === active.ciGeneration &&
                 verdict === "FAIL" &&
-                failures === undefined &&
+                (typeof round.failures === "number"
+                    ? failures === round.failures
+                    : failures === undefined) &&
                 extras.scope === round.scope &&
                 artifacts.includes(String(round.artifact));
             if (!matching)
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 0d734fc00..e19c35016 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -1193,7 +1193,7 @@ export const testsCommand = {
                 exitCode: "the gate's exit code",
                 gate: "the script that ran",
                 scope: "the command that ran, as status rows record it",
-                failures: `0 on PASS; on FAIL the failing + erroring test cases in the JUnit reports, or null when no report counts any (unknown, never 0)`,
+                failures: `0 on PASS; on FAIL the failing + erroring test cases in the JUnit reports, or null when no report counts any (unknown, never 0); a CI evidence round: the selected run's failed jobs without the capstone, or null`,
                 reports: `{log}.reports — emptied before the run and passed to the gate as $${REPORT_DIR_ENV}`,
                 log: "where the full output was saved (as given); the untouched original",
                 logBytes: "size of the saved output",
@@ -1292,7 +1292,7 @@ export const testsCommand = {
                             source: "ci",
                             verdict: "FAIL",
                             exitCode: null,
-                            failures: null,
+                            failures: selection.failedJobCount ?? null,
                             scope,
                             log: logArg,
                             artifact,
@@ -1303,7 +1303,7 @@ export const testsCommand = {
                             verdict: "FAIL",
                             scope,
                             exitCode: null,
-                            failures: null,
+                            failures: selection.failedJobCount ?? null,
                             ...evidence,
                             artifact,
                             log: logArg,
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index 56228b68c..d366dfba8 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -56,6 +56,8 @@ export function validateCiSelection(value) {
         ["failure", "timed_out", "startup_failure"].includes(stringField("conclusion")) &&
         Array.isArray(v.redTiers) &&
         v.redTiers.every((tier) => CI_TIERS.some((known) => known === tier)) &&
+        (v.failedJobCount === undefined ||
+            (Number.isSafeInteger(v.failedJobCount) && Number(v.failedJobCount) > 0)) &&
         typeof v.via === "string" &&
         v.via.trim().length > 0);
 }
@@ -218,7 +220,7 @@ export function testRunProblem(value) {
             r.step !== "debug-run-tests" ||
             r.verdict !== "FAIL" ||
             r.exitCode !== null ||
-            r.failures !== null ||
+            (r.failures !== null && !positive(r.failures)) ||
             r.gate !== null ||
             !positive(r.ciGeneration) ||
             !positive(r.runAttempt) ||
