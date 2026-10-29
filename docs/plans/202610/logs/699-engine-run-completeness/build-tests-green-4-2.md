Enforced: true
Verdict: null
Gaps: 6
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 8 | `.bkit/core/engine/checks/status-holes.test.ts` "names an evidence hole with its missing calls" | recorded 2026-10-29T02:11:57Z | code it runs | passed |
| 8 | `.bkit/core/engine/checks/status-holes.test.ts` "reports a missing required step as a step hole" | recorded 2026-10-29T02:11:59Z | code it runs | passed |
| 8 | `.bkit/core/engine/checks/status-holes.test.ts` "reports unexercised calls without marking the run holey" | recorded 2026-10-29T02:12:00Z | test body | passed |
| 8 | `.bkit/core/engine/checks/status-holes.test.ts` "charges calls below a step's finish line to that step" | recorded 2026-10-29T02:12:02Z | test body | passed |
| 8 | `.bkit/core/engine/checks/status-holes.test.ts` "reports an untaken route arm as unexercised" | recorded 2026-10-29T02:12:03Z | test body | passed |
| 8 | `.bkit/core/engine/checks/status-holes.test.ts` "gives each group-loop repeat its own gaps" | recorded 2026-10-29T02:12:05Z | code it runs | passed |
| 8 | `.bkit/core/engine/checks/status-holes.test.ts` "matches workflow-level calls outside any step" | recorded 2026-10-29T02:12:06Z | code it runs | passed |
| 9 | `.bkit/core/engine/checks/status-holes.test.ts` "gives a pre-journal run a steps-only verdict" | missing | — | passed |
| 9 | `.bkit/core/engine/checks/status-holes.test.ts` "names a call no contract step owns" | missing | — | passed |
| 9 | `.bkit/core/engine/checks/status-holes.test.ts` "excludes its own journaled call" | missing | — | passed |
| 9 | `.bkit/core/engine/checks/status-holes.test.ts` "takes the last completeness row and recomputes when rows follow it" | recorded 2026-10-29T02:21:17Z | code it runs | passed |
| 9 | `.bkit/core/engine/checks/status-holes.test.ts` "reports a hole in a long-closed run with no baseline" | missing | — | passed |

## Gaps

- Task 8 `test-changed` — code "names an evidence hole with its missing calls" runs changed since its red: `import {`, `import type { StatusRow } from "./status-holes";` (diff below) — Fixable: null — log: TASK 8: `.bkit/core/engine/checks/status-holes.test.ts` `names an evidence hole with its missing calls` — test-changed — Fixable: null
- Task 8 `test-changed` — code "reports a missing required step as a step hole" runs changed since its red: `import {`, `import type { StatusRow } from "./status-holes";` (diff below) — Fixable: null — log: TASK 8: `.bkit/core/engine/checks/status-holes.test.ts` `reports a missing required step as a step hole` — test-changed — Fixable: null
- Task 8 `test-changed` — "reports unexercised calls without marking the run holey"'s own lines changed since its red (diff below) — Fixable: null — log: TASK 8: `.bkit/core/engine/checks/status-holes.test.ts` `reports unexercised calls without marking the run holey` — test-changed — Fixable: null
- Task 8 `test-changed` — code "gives each group-loop repeat its own gaps" runs changed since its red: `import {`, `import type { StatusRow } from "./status-holes";` (diff below) — Fixable: null — log: TASK 8: `.bkit/core/engine/checks/status-holes.test.ts` `gives each group-loop repeat its own gaps` — test-changed — Fixable: null
- Task 8 `test-changed` — code "matches workflow-level calls outside any step" runs changed since its red: `import {`, `import type { StatusRow } from "./status-holes";` (diff below) — Fixable: null — log: TASK 8: `.bkit/core/engine/checks/status-holes.test.ts` `matches workflow-level calls outside any step` — test-changed — Fixable: null
- Task 9 `test-changed` — code "takes the last completeness row and recomputes when rows follow it" runs changed since its red: `import type { StatusRow } from "./status-holes";` (diff below) — Fixable: null — log: TASK 9: `.bkit/core/engine/checks/status-holes.test.ts` `takes the last completeness row and recomputes when rows follow it` — test-changed — Fixable: null

## Test exceptions

- Task 8 — honoured; cleared `test-changed` for `.bkit/core/engine/checks/status-holes.test.ts` "charges calls below a step's finish line to that step", `test-changed` for `.bkit/core/engine/checks/status-holes.test.ts` "reports an untaken route arm as unexercised"
- Task 9 — honoured; cleared `no-red` for `.bkit/core/engine/checks/status-holes.test.ts` "gives a pre-journal run a steps-only verdict", `no-red` for `.bkit/core/engine/checks/status-holes.test.ts` "names a call no contract step owns", `no-red` for `.bkit/core/engine/checks/status-holes.test.ts` "excludes its own journaled call", `no-red` for `.bkit/core/engine/checks/status-holes.test.ts` "reports a hole in a long-closed run with no baseline"

## Diff since red — Task 8 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-1.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index ab34bff9c..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-1.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -28,12 +28,15 @@ import {
   check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -890,14 +893,13 @@ describe("check — hole classes", () => {
 
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
-    const contract = deriveContract(flowMd(name), name);
-    return contract.steps.flatMap((s) => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
       const take = (position: "pre" | "post") =>
-        s.calls
+        u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
-      const own = s.keys.slice(0, 1).map((k) => stepRow(name, k) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
     });
   };
@@ -998,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1010,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
@@ -1032,14 +1038,18 @@ describe("check — hole classes", () => {
     expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
     const verdict = check(replay("build", false), build);
     expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
     expect(verdict.unexercised).toContainEqual({
-      step: step12.keys[0],
+      step: unit12.keys[0],
       call: { noun: "counters", verb: "route" },
     });
     // Taking the arm as well leaves nothing unexercised for it.
     const taken = check(replay("build", true), build);
     expect(taken.holey).toBe(false);
-    expect(taken.unexercised).toEqual([]);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
   });
 
   it("gives each group-loop repeat its own gaps", () => {
@@ -1103,3 +1113,163 @@ describe("check — hole classes", () => {
     expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
   });
 });
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
````

## Diff since red — Task 8 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-2.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index ab34bff9c..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-2.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -28,12 +28,15 @@ import {
   check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -890,14 +893,13 @@ describe("check — hole classes", () => {
 
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
-    const contract = deriveContract(flowMd(name), name);
-    return contract.steps.flatMap((s) => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
       const take = (position: "pre" | "post") =>
-        s.calls
+        u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
-      const own = s.keys.slice(0, 1).map((k) => stepRow(name, k) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
     });
   };
@@ -998,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1010,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
@@ -1032,14 +1038,18 @@ describe("check — hole classes", () => {
     expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
     const verdict = check(replay("build", false), build);
     expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
     expect(verdict.unexercised).toContainEqual({
-      step: step12.keys[0],
+      step: unit12.keys[0],
       call: { noun: "counters", verb: "route" },
     });
     // Taking the arm as well leaves nothing unexercised for it.
     const taken = check(replay("build", true), build);
     expect(taken.holey).toBe(false);
-    expect(taken.unexercised).toEqual([]);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
   });
 
   it("gives each group-loop repeat its own gaps", () => {
@@ -1103,3 +1113,163 @@ describe("check — hole classes", () => {
     expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
   });
 });
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
````

## Diff since red — Task 8 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-3.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index ab34bff9c..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-3.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -28,12 +28,15 @@ import {
   check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -890,14 +893,13 @@ describe("check — hole classes", () => {
 
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
-    const contract = deriveContract(flowMd(name), name);
-    return contract.steps.flatMap((s) => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
       const take = (position: "pre" | "post") =>
-        s.calls
+        u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
-      const own = s.keys.slice(0, 1).map((k) => stepRow(name, k) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
     });
   };
@@ -998,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1010,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
@@ -1032,14 +1038,18 @@ describe("check — hole classes", () => {
     expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
     const verdict = check(replay("build", false), build);
     expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
     expect(verdict.unexercised).toContainEqual({
-      step: step12.keys[0],
+      step: unit12.keys[0],
       call: { noun: "counters", verb: "route" },
     });
     // Taking the arm as well leaves nothing unexercised for it.
     const taken = check(replay("build", true), build);
     expect(taken.holey).toBe(false);
-    expect(taken.unexercised).toEqual([]);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
   });
 
   it("gives each group-loop repeat its own gaps", () => {
@@ -1103,3 +1113,163 @@ describe("check — hole classes", () => {
     expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
   });
 });
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
````

## Diff since red — Task 8 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-4.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index ab34bff9c..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-4.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -28,12 +28,15 @@ import {
   check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -890,14 +893,13 @@ describe("check — hole classes", () => {
 
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
-    const contract = deriveContract(flowMd(name), name);
-    return contract.steps.flatMap((s) => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
       const take = (position: "pre" | "post") =>
-        s.calls
+        u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
-      const own = s.keys.slice(0, 1).map((k) => stepRow(name, k) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
     });
   };
@@ -998,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1010,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
@@ -1032,14 +1038,18 @@ describe("check — hole classes", () => {
     expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
     const verdict = check(replay("build", false), build);
     expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
     expect(verdict.unexercised).toContainEqual({
-      step: step12.keys[0],
+      step: unit12.keys[0],
       call: { noun: "counters", verb: "route" },
     });
     // Taking the arm as well leaves nothing unexercised for it.
     const taken = check(replay("build", true), build);
     expect(taken.holey).toBe(false);
-    expect(taken.unexercised).toEqual([]);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
   });
 
   it("gives each group-loop repeat its own gaps", () => {
@@ -1103,3 +1113,163 @@ describe("check — hole classes", () => {
     expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
   });
 });
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
````

## Diff since red — Task 8 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-5.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index ab34bff9c..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-5.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -28,12 +28,15 @@ import {
   check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -890,14 +893,13 @@ describe("check — hole classes", () => {
 
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
-    const contract = deriveContract(flowMd(name), name);
-    return contract.steps.flatMap((s) => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
       const take = (position: "pre" | "post") =>
-        s.calls
+        u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
-      const own = s.keys.slice(0, 1).map((k) => stepRow(name, k) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
     });
   };
@@ -998,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1010,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
@@ -1032,14 +1038,18 @@ describe("check — hole classes", () => {
     expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
     const verdict = check(replay("build", false), build);
     expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
     expect(verdict.unexercised).toContainEqual({
-      step: step12.keys[0],
+      step: unit12.keys[0],
       call: { noun: "counters", verb: "route" },
     });
     // Taking the arm as well leaves nothing unexercised for it.
     const taken = check(replay("build", true), build);
     expect(taken.holey).toBe(false);
-    expect(taken.unexercised).toEqual([]);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
   });
 
   it("gives each group-loop repeat its own gaps", () => {
@@ -1103,3 +1113,163 @@ describe("check — hole classes", () => {
     expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
   });
 });
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
````

## Diff since red — Task 8 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-6.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index ab34bff9c..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-6.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -28,12 +28,15 @@ import {
   check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -890,14 +893,13 @@ describe("check — hole classes", () => {
 
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
-    const contract = deriveContract(flowMd(name), name);
-    return contract.steps.flatMap((s) => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
       const take = (position: "pre" | "post") =>
-        s.calls
+        u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
-      const own = s.keys.slice(0, 1).map((k) => stepRow(name, k) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
     });
   };
@@ -998,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1010,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
@@ -1032,14 +1038,18 @@ describe("check — hole classes", () => {
     expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
     const verdict = check(replay("build", false), build);
     expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
     expect(verdict.unexercised).toContainEqual({
-      step: step12.keys[0],
+      step: unit12.keys[0],
       call: { noun: "counters", verb: "route" },
     });
     // Taking the arm as well leaves nothing unexercised for it.
     const taken = check(replay("build", true), build);
     expect(taken.holey).toBe(false);
-    expect(taken.unexercised).toEqual([]);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
   });
 
   it("gives each group-loop repeat its own gaps", () => {
@@ -1103,3 +1113,163 @@ describe("check — hole classes", () => {
     expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
   });
 });
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
````

## Diff since red — Task 8 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-7.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index ab34bff9c..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-8-7.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -28,12 +28,15 @@ import {
   check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -890,14 +893,13 @@ describe("check — hole classes", () => {
 
   /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
   const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
-    const contract = deriveContract(flowMd(name), name);
-    return contract.steps.flatMap((s) => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
       const take = (position: "pre" | "post") =>
-        s.calls
+        u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
-      const own = s.keys.slice(0, 1).map((k) => stepRow(name, k) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
     });
   };
@@ -998,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1010,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
@@ -1032,14 +1038,18 @@ describe("check — hole classes", () => {
     expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
     const verdict = check(replay("build", false), build);
     expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
     expect(verdict.unexercised).toContainEqual({
-      step: step12.keys[0],
+      step: unit12.keys[0],
       call: { noun: "counters", verb: "route" },
     });
     // Taking the arm as well leaves nothing unexercised for it.
     const taken = check(replay("build", true), build);
     expect(taken.holey).toBe(false);
-    expect(taken.unexercised).toEqual([]);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
   });
 
   it("gives each group-loop repeat its own gaps", () => {
@@ -1103,3 +1113,163 @@ describe("check — hole classes", () => {
     expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
   });
 });
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
````

## Diff since red — Task 9 `.bkit/core/engine/checks/status-holes.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-9-4.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index 4b7401ad4..2e4fa9395 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-4-9-4.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -36,6 +36,7 @@ import {
   readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -999,7 +1000,10 @@ describe("check — hole classes", () => {
         callRow("build", "steps", "finish"),
         stepRow("build", "build-close-workflow"),
       ] as StatusRow[],
-      deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 — Route\n`--step=build-route`'), "build"),
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
     );
     expect(verdict.unexercised).toEqual([
       { step: "build-route", call: { noun: "counters", verb: "route" } },
@@ -1011,8 +1015,9 @@ describe("check — hole classes", () => {
   it("charges calls below a step's finish line to that step", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step15 = build.steps.find((s) => s.number === 15)!;
-    expect(step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`))
-      .toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
     for (const name of FLOWS) {
       const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
       expect(verdict.evidenceHoles, name).toEqual([]);
```
