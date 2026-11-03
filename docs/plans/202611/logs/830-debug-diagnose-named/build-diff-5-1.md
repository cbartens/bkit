diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index fddff2ff2..d7d7ebc45 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -305,9 +305,14 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 ## 🤖 Step 3 — Run Tests
 
-1. Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+1. Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
    ```bash
-   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=debug --step=debug-run-tests --position=next
+   ```
+   Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
+   Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+   ```bash
+   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}
    ```
    Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
    Hold `source` as `TEST_SOURCE` and `ciGeneration` as `CI_GENERATION` (retain the saved generation if absent). A CI source records evidence; no local gate executed.
@@ -315,7 +320,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
    - **Else** → **Failure Path**.
-2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{DEBUG_ATTEMPT}` only when `source` = `local`; otherwise empty:
+2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-run-tests --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --field=source={TEST_SOURCE} --field=ciGeneration={CI_GENERATION} --attempt=next --artifact=docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md {CLAMP_FLAG} --commit=none --number=3 --post --title="Run Tests"
    ```
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 22f672f4c..602f1638a 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -305,9 +305,14 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 ## 🤖 Step 3 — Run Tests
 
-1. Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+1. Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
    ```bash
-   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=debug --step=debug-run-tests --position=next
+   ```
+   Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
+   Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+   ```bash
+   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}
    ```
    Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
    Hold `source` as `TEST_SOURCE` and `ciGeneration` as `CI_GENERATION` (retain the saved generation if absent). A CI source records evidence; no local gate executed.
@@ -315,7 +320,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
    - **Else** → **Failure Path**.
-2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{DEBUG_ATTEMPT}` only when `source` = `local`; otherwise empty:
+2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-run-tests --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --field=source={TEST_SOURCE} --field=ciGeneration={CI_GENERATION} --attempt=next --artifact=docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md {CLAMP_FLAG} --commit=none --number=3 --post --title="Run Tests"
    ```
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 524224a1f..97b5ccb5e 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -998,6 +998,10 @@ Every point where a run can ask the owner has two settings under `package.json`
 
 **Ladder + cutover:** `NORMAL` (diagnose + remediate) and `SOAK` (accumulating-context instrument-or-fix). There is no observe mode; `[DEBUG-OBSERVE]` appears only in the soak agent loop. SOAK entry: invocation start (fix attempts used up across the feature's runs, or `[soak]`); mid-run Step-6 `Mode: SOAK` (`Verdict` != PASS); `FIX_ATTEMPT` over `debug.fix.maxAttempts` (STANDARD → PIVOT → FINAL) — final SOAK escalation before handover. `bkit status meta --debug-mode=SOAK` records the switch; `SOAK_ATTEMPT` counts soak rows across every debug run of the feature against `debug.soak.maxAttempts` — nothing resets it (default worst case without asking: 2 fix + 2 soak attempts per feature, over 1 to 4 runs). With `debug.fix.ask` / `debug.soak.ask` true and not headless, the Loop Question asks before each further attempt (`Try again` / `Stop`; Stop → handover, run stays `IN_PROGRESS`). Used-up soak attempts with `debug.soak.ask` true in a session → the Loop Question too; `Try again` grants one more allowance of soak attempts (§ Ask points). SOAK is terminal: the switch is one-way. Soak loops on whatever Run Tests fails on (live or mocked). Diagnose recommends; the orchestrator decides.
 
+**Test round identity:** Step 3 derives `NORMAL_ATTEMPT` with `counters derive --position=next` before running tests and uses it for both the test-run row and completion. `DEBUG_ATTEMPT` remains the workflow run number and names its context artifacts. Every executed local gate emits `source: local`; its clamp record uses `NORMAL_ATTEMPT`.
+
+**Verification provenance:** The additional selected-workflow gate accepts only runs whose repository and head repository match the saved repository, whose branch and commit match the verification target, and whose event matches `--event` when supplied. A missing head-repository identity or a fork result cannot establish success.
+
 **Local discovery loop:** Step 3 Run Tests (head; iter 1 = reproduce) → FAIL with budget → Step 4 Fetch Context → fix step (`NORMAL` → Diagnose 6 + Remediate 7; `SOAK` → Soak 8) → loop Step 3. PASS after fix → Push 9 → Summary 10 → Close 11; PASS no fix → can't-reproduce → Summary (CONCERNS); with `REPRO` → Fetch Context 4 → Reproduce 5: reproduced → test committed → loop Step 3 (records the red; a PASS there with no fix → Summary (CONCERNS)); not reproduced → test changes removed → Summary (CONCERNS). Soak loops only on a failing Run Tests, never a green suite. Reproduce run spends one `NORMAL_ATTEMPT`. Fix attempts used up → SOAK; soak attempts used up → Failure Path. Close asserts no `[DEBUG-OBSERVE]` survives debug diff (no-leak) before CI push.
 
 **Live tier (Step 3):** appends the declared `test:integration:live` / `test:e2e:live` / `test:live` unless `[live=off]`, recorded verbatim in `scope`. No live tier → CONCERNS + `testsLiveSkipped` at close, never a silent pass. To learn whether live ran, read `scope` after the fact.
diff --git a/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
index 65243238e..52e3fdcf7 100644
--- a/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
+++ b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
@@ -247,6 +247,22 @@ reject("unsupported fixture endpoint "+endpoint);
     return { found, state: state.json };
   };
   const round = () => {
+    // Hold any round counter the workflow declares before running tests. This
+    // reads the shipped command and its real result, independent of its name.
+    const preparation = command(3, "tests run");
+    const beforeRun = stepText(3).slice(0, stepText(3).indexOf(preparation));
+    for (const match of beforeRun.matchAll(/"\{BKIT\}" (counters route --name=([A-Z_]+)[^\n]*)/g)) {
+      const counter = execute(3, match[1]!);
+      if (counter.code !== 0) throw new Error(`Prepare test round: ${counter.err}`);
+      vars[match[2]!] = String(counter.json.value);
+    }
+    for (const match of beforeRun.matchAll(
+      /"\{BKIT\}" (counters derive[^\n]*)\n\s*```\n\s*Hold `value` as `([A-Z_]+)`/g,
+    )) {
+      const counter = execute(3, match[1]!);
+      if (counter.code !== 0) throw new Error(`Prepare test round: ${counter.err}`);
+      vars[match[2]!] = String(counter.json.value);
+    }
     const result = execute(3, "tests run");
     if (!result.json) throw new Error(`Run tests exited ${result.code}: ${result.err}`);
     vars.TEST_SOURCE = result.json.source ?? "local";
@@ -323,6 +339,82 @@ reject("unsupported fixture endpoint "+endpoint);
 }
 
 describe("Debug CI evidence sequence", () => {
+  it("finishes local-only rounds through the actual Debug Step 3 commands", () => {
+    const fresh = consumer();
+    fresh.prompt("/bkit-debug #1 [local] [live=off]\n");
+    expect(fresh.select().state.ciRun).toBeNull();
+    fresh.control.local = true;
+    fresh.save();
+    const first = fresh.round();
+    expect(first).toMatchObject({ code: 0, json: { verdict: "PASS", exitCode: 0 } });
+    expect.soft(first.json.source).toBe("local");
+    expect.soft(first.json.row.source).toBe("local");
+    const firstFinished = fresh.finishRound();
+    expect.soft(firstFinished, firstFinished.err).toMatchObject({ code: 0, json: { pass: true } });
+    expect(fresh.events().filter((event) => event.kind === "local-gate")).toHaveLength(1);
+
+    const override = consumer();
+    expect(override.select().state.ciRun).toBe("123");
+    override.prompt("/bkit-debug #1 [local] [live=off]\n");
+    expect(override.select().state).toMatchObject({ ciRun: null, ciGeneration: 2 });
+    override.control.local = true;
+    override.save();
+    const local = override.round();
+    expect(local).toMatchObject({ code: 0, json: { verdict: "PASS", exitCode: 0 } });
+    expect.soft(local.json.source).toBe("local");
+    expect.soft(local.json.row.source).toBe("local");
+    const finished = override.finishRound();
+    expect.soft(finished, finished.err).toMatchObject({ code: 0, json: { pass: true } });
+  });
+
+  it("finishes replacement CI evidence with the unchanged debug run number", () => {
+    const f = consumer();
+    expect(f.select().state).toMatchObject({ ciGeneration: 1, debugAttempt: 1 });
+    expect(f.round()).toMatchObject({ code: 1, json: { source: "ci", ciGeneration: 1 } });
+    expect(f.finishRound().code).toBe(0);
+    f.prompt(
+      "/bkit-debug #1 https://github.com/example/example/actions/runs/124/attempts/2 [live=off]\n",
+    );
+    expect(f.select().state).toMatchObject({ ciRun: "124", ciGeneration: 2, debugAttempt: 1 });
+    expect(f.vars.DEBUG_ATTEMPT).toBe("1");
+    const replacement = f.round();
+    expect(replacement).toMatchObject({
+      code: 1,
+      json: { source: "ci", ciGeneration: 2, ciRun: "124" },
+    });
+    const finished = f.finishRound();
+    expect(finished, finished.err).toMatchObject({ code: 0, json: { pass: true } });
+    expect(finished.json.row.attempt).toBe(replacement.json.row.attempt);
+    expect(finished.json.row).toMatchObject({ ciGeneration: 2, scope: "ci:124" });
+    expect(f.events().filter((event) => event.kind === "local-gate")).toEqual([]);
+  });
+
+  it("finishes the first CI evidence round of the second debug run", () => {
+    const f = consumer();
+    f.write(
+      `${LOG}/status.jsonl`,
+      [
+        { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
+        { type: "workflow-done", workflow: "debug", at: "2026-10-01T00:01:00Z" },
+        { type: "workflow-started", workflow: "debug", at: "2026-11-01T00:00:00Z" },
+      ]
+        .map((row) => JSON.stringify(row))
+        .join("\n") + "\n",
+    );
+    f.vars.DEBUG_ATTEMPT = "2";
+    expect(f.select().state).toMatchObject({ ciRun: "123", debugAttempt: 2 });
+    const round = f.round();
+    expect(round).toMatchObject({
+      code: 1,
+      json: { source: "ci", runAttempt: 2, ciGeneration: 1 },
+    });
+    const finished = f.finishRound();
+    expect(finished, finished.err).toMatchObject({ code: 0, json: { pass: true } });
+    expect(finished.json.row.attempt).toBe(round.json.row.attempt);
+    expect(finished.json.row).toMatchObject({ ciGeneration: 1, scope: "ci:123" });
+    expect(f.events().filter((event) => event.kind === "local-gate")).toEqual([]);
+  });
+
   it("checks the complete selected CI fix sequence against green and red final runs", () => {
     const f = consumer();
     expect(f.select().state).toMatchObject({
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index aec0d209c..b8f8b91f6 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -142,7 +142,7 @@ describe("gate logs", () => {
     ],
     [
       "debug",
-      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}',
+      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}',
     ],
   ];
 
diff --git a/.bkit/core/engine/commands/workflow/runs.test.ts b/.bkit/core/engine/commands/workflow/runs.test.ts
index eee2d4696..5a6815917 100644
--- a/.bkit/core/engine/commands/workflow/runs.test.ts
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -85,6 +85,128 @@ async function cli(cwd: string, argv: string[]) {
 // The fixture gh stub (tests/gh-stub-smoke.bats) — the gate tests rest on it
 // ---------------------------------------------------------------------------
 
+function verificationProvenanceFixture() {
+  const f = locateFixture();
+  const candidate = (
+    id: number,
+    conclusion: string,
+    extra: Record<string, unknown> = {},
+  ): Record<string, unknown> => ({
+    id,
+    run_attempt: 1,
+    workflow_id: 777,
+    path: ".github/workflows/special-ci.yml",
+    head_sha: f.head,
+    head_branch: "fix/ci",
+    repository: { full_name: "example/example" },
+    head_repository: { full_name: "example/example" },
+    event: "push",
+    status: "completed",
+    conclusion,
+    created_at: `2026-11-01T00:00:${String(id - 300).padStart(2, "0")}Z`,
+    updated_at: `2026-11-01T00:00:${String(id - 300).padStart(2, "0")}Z`,
+    html_url: `https://github.com/example/example/actions/runs/${id}`,
+    ...extra,
+  });
+  const state = {
+    selected: [
+      candidate(301, "failure"),
+      candidate(302, "success", {
+        event: "pull_request",
+        head_repository: { full_name: "a-fork/example" },
+      }),
+    ],
+  };
+  const dataFile = path.join(f.cwd, "provenance.json");
+  const callsFile = path.join(f.cwd, "provenance-calls.jsonl");
+  const bin = path.join(f.cwd, "provenance-bin");
+  fs.mkdirSync(bin);
+  fs.writeFileSync(callsFile, "");
+  fs.writeFileSync(
+    path.join(bin, "gh"),
+    `#!${process.execPath}
+const fs=require("node:fs"), args=process.argv.slice(2);
+fs.appendFileSync(${JSON.stringify(callsFile)},JSON.stringify(args)+"\\n");
+const data=JSON.parse(fs.readFileSync(${JSON.stringify(dataFile)},"utf8"));
+const endpoint=args.find(value=>value.startsWith("/repos/")) || "";
+const emit=value=>process.stdout.write(JSON.stringify(value));
+if(args[0]!=="api" || !endpoint.startsWith("/repos/example/example/")) process.exit(3);
+if(endpoint.includes("/201/jobs")) {
+  emit({total_count:1,jobs:[{id:1,name:"bkit-tests-check",status:"completed",conclusion:"success"}]});
+} else if(endpoint.includes("/workflows/777/")) {
+  if(!endpoint.includes("head_sha=${f.head}")) process.exit(3);
+  emit({total_count:data.selected.length,workflow_runs:data.selected});
+} else if(endpoint.includes("/workflows/consumer-ci.yml/")) {
+  emit({total_count:1,workflow_runs:[{id:201,workflow_id:456,head_sha:${JSON.stringify(f.head)},head_branch:"fix/ci",event:"push",status:"completed",conclusion:"success",repository:{full_name:"example/example"},head_repository:{full_name:"example/example"}}]});
+} else {process.stderr.write("unexpected provenance fixture endpoint "+endpoint);process.exit(3)}
+`,
+    { mode: 0o755 },
+  );
+  env({ PATH: `${bin}${path.delimiter}${process.env.PATH}` });
+  fs.writeFileSync(
+    f.selection,
+    JSON.stringify({
+      mode: "ci",
+      provider: "github",
+      repo: "example/example",
+      runId: "123",
+      runAttempt: 2,
+      runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+      workflowId: "777",
+      workflowPath: ".github/workflows/special-ci.yml",
+      headBranch: "fix/ci",
+      headSha: f.ancestor,
+      conclusion: "failure",
+      redTiers: ["integration"],
+      via: "prompt-run",
+    }),
+  );
+  const gate = async (...flags: string[]) => {
+    fs.writeFileSync(dataFile, JSON.stringify(state));
+    return cli(f.cwd, [
+      "gate",
+      "--repo=example/example",
+      `--head=${f.head}`,
+      "--branch=fix/ci",
+      `--ci-selection-file=${f.selection}`,
+      ...flags,
+    ]);
+  };
+  return { state, candidate, gate };
+}
+
+it("rejects fork verification runs that shadow a red selected workflow at the same head", async () => {
+  const f = verificationProvenanceFixture();
+  const implicit = await f.gate();
+  expect.soft(implicit.code).not.toBe(0);
+  expect.soft(implicit.json).toMatchObject({ passed: false, verifyingRunId: 301 });
+  const pushed = await f.gate("--event=push");
+  expect.soft(pushed.code).not.toBe(0);
+  expect.soft(pushed.json).toMatchObject({ passed: false, verifyingRunId: 301 });
+  f.state.selected[1] = f.candidate(302, "success", { head_repository: undefined });
+  const absent = await f.gate();
+  expect.soft(absent.code).not.toBe(0);
+  expect.soft(absent.json).toMatchObject({ passed: false, verifyingRunId: 301 });
+  f.state.selected[1] = f.candidate(302, "success", {
+    repository: { full_name: "a-fork/example" },
+  });
+  const wrongRepository = await f.gate();
+  expect.soft(wrongRepository.code).not.toBe(0);
+  expect.soft(wrongRepository.json).toMatchObject({ passed: false, verifyingRunId: 301 });
+});
+
+it("preserves the requested event for selected-workflow verification", async () => {
+  const f = verificationProvenanceFixture();
+  f.state.selected[1] = f.candidate(302, "success", { event: "pull_request" });
+  const pushed = await f.gate("--event=push");
+  expect.soft(pushed.code).not.toBe(0);
+  expect.soft(pushed.json).toMatchObject({ passed: false, verifyingRunId: 301 });
+  f.state.selected.push(f.candidate(303, "success"));
+  const green = await f.gate("--event=push");
+  expect(green.code).toBe(0);
+  expect(green.json).toMatchObject({ passed: true, originalRunId: "123", verifyingRunId: 303 });
+});
+
 it("requires selected other-workflow success at the exact pushed head", async () => {
   const f = locateFixture();
   const state = { selected: "success", configured: "success", sha: f.head, absent: false };
@@ -108,7 +230,7 @@ if (endpoint.includes("/jobs")) {
   emit({total_count: 1, jobs: [{id: 1, name: "bkit-tests-check", status: "completed", conclusion: endpoint.includes("301") ? state.selected : state.configured}]});
 } else if (endpoint.includes("/actions/workflows/")) {
   const sha = selected ? state.sha : ${JSON.stringify(f.head)};
-  const runs = selected && state.absent ? [] : [{id: selected ? 301 : 201, run_attempt: 1, workflow_id: selected ? 777 : 456, head_sha: sha, head_branch: "fix/ci", event: "push", status: "completed", conclusion, html_url: "https://github.com/example/example/actions/runs/" + (selected ? 301 : 201)}];
+  const runs = selected && state.absent ? [] : [{id: selected ? 301 : 201, run_attempt: 1, workflow_id: selected ? 777 : 456, head_sha: sha, head_branch: "fix/ci", repository: {full_name: "example/example"}, head_repository: {full_name: "example/example"}, event: "push", status: "completed", conclusion, html_url: "https://github.com/example/example/actions/runs/" + (selected ? 301 : 201)}];
   emit({total_count: runs.length, workflow_runs: runs});
 } else { process.stderr.write("unhandled gate fixture " + endpoint); process.exit(1); }
 `,
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index 909eecdc4..64d8f0138 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -2137,7 +2137,12 @@ function runGate(ctx: RunContext): number {
           .filter(
             (value) =>
               String(obj(value).workflow_id) === selection.workflowId &&
-              (!str(f.branch) || obj(value).head_branch === str(f.branch)),
+              text(obj(obj(value).repository).full_name).toLowerCase() ===
+                selection.repo.toLowerCase() &&
+              text(obj(obj(value).head_repository).full_name).toLowerCase() ===
+                selection.repo.toLowerCase() &&
+              obj(value).head_branch === (str(f.branch) ?? selection.headBranch) &&
+              (str(f.event) === undefined || obj(value).event === str(f.event)),
           )
           .map(toRun)
           .filter((run) => run.head_sha === head && run.id !== null);
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 23248a645..e124774a7 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -293,6 +293,7 @@ describe("bkit tests run", () => {
     const r = await run(BUILD);
     expect(r.code).toBe(0);
     expect(r.json).toEqual({
+      source: "local",
       verdict: "PASS",
       exitCode: 0,
       gate: DEEP,
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 39bfcff72..c661935eb 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -1658,7 +1658,7 @@ export const testsCommand: CommandSpec = {
         { name: "ci-url", type: "string", help: "selected GitHub evidence attempt URL" },
       ],
       output: {
-        source: "ci for pinned red evidence; local after its current-generation fix",
+        source: "ci for pinned red evidence; local for every executed gate",
         runAttempt: "selected CI attempt for a CI evidence round",
         ciGeneration: "active selection generation for a CI evidence round",
         ciRun: "selected CI run ID for a CI evidence round",
@@ -1870,10 +1870,10 @@ export const testsCommand: CommandSpec = {
                 scope,
                 log: logArg,
                 artifact,
-                ...(ctx.flags.ciRun === undefined ? {} : { source: "local" as const }),
+                source: "local",
               });
         ctx.emit({
-          ...(ctx.flags.ciRun === undefined ? {} : { source: "local" }),
+          source: "local",
           verdict,
           exitCode,
           gate,
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index 51b5d83e4..74ecfa4c5 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -270,9 +270,14 @@ _No tracker connected, skip step._
 
 ## 🤖 Step 3 — Run Tests
 
-1. Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+1. Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
    ```bash
-   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=debug --step=debug-run-tests --position=next
+   ```
+   Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
+   Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+   ```bash
+   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}
    ```
    Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
    Hold `source` as `TEST_SOURCE` and `ciGeneration` as `CI_GENERATION` (retain the saved generation if absent). A CI source records evidence; no local gate executed.
@@ -280,7 +285,7 @@ _No tracker connected, skip step._
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
    - **Else** → **Failure Path**.
-2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{DEBUG_ATTEMPT}` only when `source` = `local`; otherwise empty:
+2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-run-tests --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --field=source={TEST_SOURCE} --field=ciGeneration={CI_GENERATION} --attempt=next --artifact=docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md {CLAMP_FLAG} --commit=none --number=3 --post --title="Run Tests"
    ```
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index 57261769b..6e949641b 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -347,9 +347,14 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 ## 🤖 Step 3 — Run Tests
 
-1. Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+1. Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
    ```bash
-   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=debug --step=debug-run-tests --position=next
+   ```
+   Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
+   Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+   ```bash
+   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}
    ```
    Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
    Hold `source` as `TEST_SOURCE` and `ciGeneration` as `CI_GENERATION` (retain the saved generation if absent). A CI source records evidence; no local gate executed.
@@ -357,7 +362,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
    - **Else** → **Failure Path**.
-2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{DEBUG_ATTEMPT}` only when `source` = `local`; otherwise empty:
+2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-run-tests --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --field=source={TEST_SOURCE} --field=ciGeneration={CI_GENERATION} --attempt=next --artifact=docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md {CLAMP_FLAG} --commit=none --number=3 --post --title="Run Tests"
    ```
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 3be2c4efc..6f4834af0 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -9804,7 +9804,8 @@ Repro decided
 Open the run inside the worktree:
 Record the runtime and the run's modes, then finish:
 Runtime row written and asserted
-Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
+Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
 **If** `TEST_VERDICT` = PASS → route on the fix and reproduce rows in the active run:
 **If** exit 1 **and** it printed `step-9` → Step 9.
 **If** exit 1 **and** it printed `step-10` → Step 10.
diff --git a/.bkit/version b/.bkit/version
index aabb7eb5e..e9f07a968 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -25,7 +25,7 @@
     "docs/design.md": "05d888d6188c44f518bd1d10b4c01ae6af373a6ce79da72fbaf10d5d45154e15",
     ".claude/commands/bkit-auto.md": "20135709a2b7129c61303affe27f6cedf3239c4f09107f7ee7df7eaae347e0a3",
     ".claude/commands/bkit-build.md": "c40d7ce9ebabee268d3162fef41459fe06b2c4a165276cb009a86fbdceb606b0",
-    ".claude/commands/bkit-debug.md": "9a31a19b648df77325e9d313058827d51c11bbecf5d69c1b50e04dca312b72af",
+    ".claude/commands/bkit-debug.md": "6290576e5189f3492fc29c4421f2a9045f64ace86e0f17b3c8aced4425743d84",
     ".claude/commands/bkit-design.md": "f1bdf372f6226877037902ba395d5bc01b9aca784cef3f1e0cbbb9939c068a8c",
     ".claude/commands/bkit-plan.md": "0e6ce306b016e4241d16379638a0ca776358d8b1b209202d7b6075092f19b7b3",
     ".claude/commands/bkit-ship.md": "9aae4f2aa76205821934bec573d2b97d6944cc6d39480acc9f20682c3dbee5ec",
@@ -57,7 +57,7 @@
     ".claude/agents/bkit-utility-update-documentation.md": "0b3d4145acaf8ce46ace5328fe2e13f904d3c8aba8823aa1c2bff6a4cc5f7d3e",
     ".cursor/commands/bkit-auto.md": "d20d3f7448199aad2252b4782521bbad8c054039a8c19c84d2649ca4f9cb7ef0",
     ".cursor/commands/bkit-build.md": "984d8d56ddb67968862c703d331aadcac114bf11661c9e7cf27038638be0a580",
-    ".cursor/commands/bkit-debug.md": "50270c20330cf4eef7b11003647ff9a7da7e4b9bc338ed0e4d85fabed5d0a597",
+    ".cursor/commands/bkit-debug.md": "274983f676a02e65ae306405e321a537086231fcd27ed5e37d531700b90e7cd4",
     ".cursor/commands/bkit-design.md": "6fc9344768b275f1f76585a816d4fa7775b789edd3085a87056abbea789c2b50",
     ".cursor/commands/bkit-plan.md": "c2580c73e36848a5f7a830ebf1491daf97400ab90cc9934eac9341f242ce3c93",
     ".cursor/commands/bkit-ship.md": "3723c3e9e7a2fd7e612ce8ac73ffdd0438b9713c420b6aeed84ac93267c0d04b",
@@ -115,7 +115,7 @@
     ".opencode/agents/bkit-utility-update-documentation.md": "e494bd347aa52ca97786a094d9083721ad264070f1e3a0c90efeac23789dcc2a",
     ".opencode/commands/bkit-auto.md": "5d7a2c2c164ff4bdc862a1748a8cfb6261b20c3cc90b6eb6f98851fa111381cd",
     ".opencode/commands/bkit-build.md": "e44c5272f6a12c3355af0111a6610779e642ace02687a3814258feeab3cf1294",
-    ".opencode/commands/bkit-debug.md": "93e5ab37f67802f3494f8ca1454a1cbf31e3cd86dd1e6dbce319c11616a59afe",
+    ".opencode/commands/bkit-debug.md": "a6cb75f17d6bd361f05637466347d8f44da9ca373e625c2c2b32cf3d19f37e86",
     ".opencode/commands/bkit-design.md": "741a2ac077cdfb19c79146314fd32ae2961d930ccff9563df81ebc90bdbb81f1",
     ".opencode/commands/bkit-plan.md": "afa884bb468e4411e9914be71e3783b906c53734f9dede7af92b0c98af89bd76",
     ".opencode/commands/bkit-ship.md": "878681a251cfcc4ba1cef3bce1db1b6cb8029c9072e09bd26b72d34b1890c09d",
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "f55e9e3e06f53afec0ba2aed6d0981307469cfc4c1aba7b99f176cc3a8cde6eb",
     ".bkit/prompts.md": "05bef1112ac15f6ffdb8877f132d0b85e2718ca682be4dca0a7dbebdd798ab05",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "48dfb4d8aeb07fbb1caaf32d5c9b4f5c6a8e8429ebaacff3c327e741d61dc1ba",
+    ".bkit/workflows.md": "61c678ab496707dedfce09e46f70ba642a37e91244a184261074f35a4d004f61",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 83889b73c..821bd54f5 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -998,6 +998,10 @@ Every point where a run can ask the owner has two settings under `package.json`
 
 **Ladder + cutover:** `NORMAL` (diagnose + remediate) and `SOAK` (accumulating-context instrument-or-fix). There is no observe mode; `[DEBUG-OBSERVE]` appears only in the soak agent loop. SOAK entry: invocation start (fix attempts used up across the feature's runs, or `[soak]`); mid-run Step-6 `Mode: SOAK` (`Verdict` != PASS); `FIX_ATTEMPT` over `debug.fix.maxAttempts` (STANDARD → PIVOT → FINAL) — final SOAK escalation before handover. `bkit status meta --debug-mode=SOAK` records the switch; `SOAK_ATTEMPT` counts soak rows across every debug run of the feature against `debug.soak.maxAttempts` — nothing resets it (default worst case without asking: 2 fix + 2 soak attempts per feature, over 1 to 4 runs). With `debug.fix.ask` / `debug.soak.ask` true and not headless, the Loop Question asks before each further attempt (`Try again` / `Stop`; Stop → handover, run stays `IN_PROGRESS`). Used-up soak attempts with `debug.soak.ask` true in a session → the Loop Question too; `Try again` grants one more allowance of soak attempts (§ Ask points). SOAK is terminal: the switch is one-way. Soak loops on whatever Run Tests fails on (live or mocked). Diagnose recommends; the orchestrator decides.
 
+**Test round identity:** Step 3 derives `NORMAL_ATTEMPT` with `counters derive --position=next` before running tests and uses it for both the test-run row and completion. `DEBUG_ATTEMPT` remains the workflow run number and names its context artifacts. Every executed local gate emits `source: local`; its clamp record uses `NORMAL_ATTEMPT`.
+
+**Verification provenance:** The additional selected-workflow gate accepts only runs whose repository and head repository match the saved repository, whose branch and commit match the verification target, and whose event matches `--event` when supplied. A missing head-repository identity or a fork result cannot establish success.
+
 **Local discovery loop:** Step 3 Run Tests (head; iter 1 = reproduce) → FAIL with budget → Step 4 Fetch Context → fix step (`NORMAL` → Diagnose 6 + Remediate 7; `SOAK` → Soak 8) → loop Step 3. PASS after fix → Push 9 → Summary 10 → Close 11; PASS no fix → can't-reproduce → Summary (CONCERNS); with `REPRO` → Fetch Context 4 → Reproduce 5: reproduced → test committed → loop Step 3 (records the red; a PASS there with no fix → Summary (CONCERNS)); not reproduced → test changes removed → Summary (CONCERNS). Soak loops only on a failing Run Tests, never a green suite. Reproduce run spends one `NORMAL_ATTEMPT`. Fix attempts used up → SOAK; soak attempts used up → Failure Path. Close asserts no `[DEBUG-OBSERVE]` survives debug diff (no-leak) before CI push.
 
 **Live tier (Step 3):** appends the declared `test:integration:live` / `test:e2e:live` / `test:live` unless `[live=off]`, recorded verbatim in `scope`. No live tier → CONCERNS + `testsLiveSkipped` at close, never a silent pass. To learn whether live ran, read `scope` after the fact.
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index 5513dc297..26ccc8efd 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -304,9 +304,14 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 ## 🤖 Step 3 — Run Tests
 
-1. Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+1. Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
    ```bash
-   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=debug --step=debug-run-tests --position=next
+   ```
+   Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
+   Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+   ```bash
+   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}
    ```
    Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
    Hold `source` as `TEST_SOURCE` and `ciGeneration` as `CI_GENERATION` (retain the saved generation if absent). A CI source records evidence; no local gate executed.
@@ -314,7 +319,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
    - **Else** → **Failure Path**.
-2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{DEBUG_ATTEMPT}` only when `source` = `local`; otherwise empty:
+2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-run-tests --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --field=source={TEST_SOURCE} --field=ciGeneration={CI_GENERATION} --attempt=next --artifact=docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md {CLAMP_FLAG} --commit=none --number=3 --post --title="Run Tests"
    ```
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index daf717d58..3d2f37c44 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -303,9 +303,14 @@ Debug Feature — Autonomous diagnosis and remediation
 
 ## 🤖 Step 3 — Run Tests
 
-1. Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+1. Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
    ```bash
-   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=debug --step=debug-run-tests --position=next
+   ```
+   Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
+   Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+   ```bash
+   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}
    ```
    Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
    Hold `source` as `TEST_SOURCE` and `ciGeneration` as `CI_GENERATION` (retain the saved generation if absent). A CI source records evidence; no local gate executed.
@@ -313,7 +318,7 @@ Debug Feature — Autonomous diagnosis and remediation
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
    - **Else** → **Failure Path**.
-2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{DEBUG_ATTEMPT}` only when `source` = `local`; otherwise empty:
+2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-run-tests --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --field=source={TEST_SOURCE} --field=ciGeneration={CI_GENERATION} --attempt=next --artifact=docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md {CLAMP_FLAG} --commit=none --number=3 --post --title="Run Tests"
    ```
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index b8b294fb4..84cb8826a 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -307,9 +307,14 @@ $ARGUMENTS
 
 ## 🤖 Step 3 — Run Tests
 
-1. Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+1. Derive this run's next test round independently of `{DEBUG_ATTEMPT}`, which numbers workflow runs:
    ```bash
-   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=debug --step=debug-run-tests --position=next
+   ```
+   Hold `value` as `NORMAL_ATTEMPT`. Exit non-zero → **Failure Path**.
+   Run the deepest declared gate, or record the selected CI failure before a current-generation fix. `{GATE_FLAGS}` = one `--gate=<name>` per `GATES` entry, in order. `{CI_TEST_FLAGS}` = `--ci-run={CI_RUN_ID} --ci-url="{CI_RUN_URL}"` only for the saved CI selection, else empty:
+   ```bash
+   "{BKIT}" tests run {GATE_FLAGS} {CI_TEST_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}
    ```
    Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
    Hold `source` as `TEST_SOURCE` and `ciGeneration` as `CI_GENERATION` (retain the saved generation if absent). A CI source records evidence; no local gate executed.
@@ -317,7 +322,7 @@ $ARGUMENTS
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
    - **Else** → **Failure Path**.
-2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{DEBUG_ATTEMPT}` only when `source` = `local`; otherwise empty:
+2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-run-tests --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --field=source={TEST_SOURCE} --field=ciGeneration={CI_GENERATION} --attempt=next --artifact=docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md {CLAMP_FLAG} --commit=none --number=3 --post --title="Run Tests"
    ```
diff --git a/README.md b/README.md
index 1435b1f2b..4c170fe19 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 30e71585ea04fb206ff3661d0d6ef35c418c93f2 — do not edit
+  %% Generated by bkit-graphify-rollup.py from ad10a9ded8c27c8abae79258c18276781c0ab771 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index d2e19108e..63c32c7a0 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -1603,7 +1603,12 @@ function runGate(ctx) {
                 const payload = jsonOrUndefined(response.stdout);
                 const candidates = arr(obj(payload).workflow_runs)
                     .filter((value) => String(obj(value).workflow_id) === selection.workflowId &&
-                    (!str(f.branch) || obj(value).head_branch === str(f.branch)))
+                    text(obj(obj(value).repository).full_name).toLowerCase() ===
+                        selection.repo.toLowerCase() &&
+                    text(obj(obj(value).head_repository).full_name).toLowerCase() ===
+                        selection.repo.toLowerCase() &&
+                    obj(value).head_branch === (str(f.branch) ?? selection.headBranch) &&
+                    (str(f.event) === undefined || obj(value).event === str(f.event)))
                     .map(toRun)
                     .filter((run) => run.head_sha === head && run.id !== null);
                 verifyingRun = latest(candidates.filter((run) => run.status === "completed"));
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index b84c6d3f9..7d14f3044 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -1238,7 +1238,7 @@ export const testsCommand = {
                 { name: "ci-url", type: "string", help: "selected GitHub evidence attempt URL" },
             ],
             output: {
-                source: "ci for pinned red evidence; local after its current-generation fix",
+                source: "ci for pinned red evidence; local for every executed gate",
                 runAttempt: "selected CI attempt for a CI evidence round",
                 ciGeneration: "active selection generation for a CI evidence round",
                 ciRun: "selected CI run ID for a CI evidence round",
@@ -1435,10 +1435,10 @@ export const testsCommand = {
                         scope,
                         log: logArg,
                         artifact,
-                        ...(ctx.flags.ciRun === undefined ? {} : { source: "local" }),
+                        source: "local",
                     });
                 ctx.emit({
-                    ...(ctx.flags.ciRun === undefined ? {} : { source: "local" }),
+                    source: "local",
                     verdict,
                     exitCode,
                     gate,
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 3788a1a0d..ac1a7a036 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `30e71585e`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `ad10a9ded`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 30e71585ea04fb206ff3661d0d6ef35c418c93f2 — do not edit
+  %% Generated by bkit-graphify-rollup.py from ad10a9ded8c27c8abae79258c18276781c0ab771 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 30e71585ea04fb206ff3661d0d6ef35c418c93f2 — do not edit
+  %% Generated by bkit-graphify-rollup.py from ad10a9ded8c27c8abae79258c18276781c0ab771 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
