diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 7dd0284f1..e4295631f 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1036,9 +1036,9 @@ Every point where a run can ask the owner has two settings under `package.json`
   | `codeChanged` | `git diff` of source (plan logs and ledgers excluded) between the `parentSha` of the compared same-scope pair; `null` when git cannot compare |
   | `lastStrategy` / `finalSpent` | fix rows' `strategy` |
   | `nextStrategy` | the same label `status route` gives the fix step: from the failing tests that repeat across attempts of every run |
-  | `gateCounts` | each round's gate failing tests (`build-group-gate-{GROUP}` for the verify loop, `build-holistic-gate` for the holistic loop), added to `counts`; a round is clean only when its gate also counted 0 |
+  | `gateCounts` | each round's gate failing tests (`build-group-gate-{GROUP}` for the verify loop, `build-holistic-gate` for the holistic loop), added to `counts`; a round whose gate did not run (verify `CONCERNS` or `FAIL`, so no gate ran) reads `?`, never `0`, and keeps its verify count; a round is clean only when its gate also counted 0, so once the gate ran in any round a clean verify with no gate row is not clean |
   | `minutesPerRound` | check-row timestamps |
-  | `trend` | Compares the earliest round with the last round's `scope` against the last round. `unknown` = a compared count is missing, or no earlier round shares the last round's `scope`; `worse` = count rose; `closing` = count fell and code changed; `stuck` = otherwise; `first-round` = one check row |
+  | `trend` | Compares the earliest round with the last round's `scope` against the last round. `unknown` = a compared count is missing, or no earlier round shares the last round's `scope` and gate state (the gate ran in only some of the rounds); `worse` = count rose; `closing` = count fell and code changed; `stuck` = otherwise; `first-round` = one check row |
   | `trendLine` | One plain sentence with the compared counts and the reason for the trend; every loop question states it instead of a fixed claim |
   | `recommend` | `try-again` when `closing`, else `stop`; `null` on `first-round` and `unknown` |
 
diff --git a/.bkit/core/engine/commands/workflow/counters.test.ts b/.bkit/core/engine/commands/workflow/counters.test.ts
index de8d4476a..b6b348b0d 100644
--- a/.bkit/core/engine/commands/workflow/counters.test.ts
+++ b/.bkit/core/engine/commands/workflow/counters.test.ts
@@ -1234,8 +1234,78 @@ describe("loopProgress with a gate", () => {
       verify("2026-10-01T00:30:00Z", 2, 0),
     ]);
     const r = progress(file);
-    expect(r.json.gateCounts).toBe("0 → 3");
+    expect(r.json.gateCounts).toBe("? → 3");
     expect(r.json.counts).toBe("0 → 3");
+    expect(r.json.trend).toBe("unknown");
+    expect(r.json.recommend).toBeNull();
+    expect(r.json.rounds[0].gateFailures).toBeNull();
+  });
+
+  it("a not-run gate then a red gate has no trend", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      done("build", "build-plan-verify", "2026-10-01T00:10:00Z", {
+        verdict: "CONCERNS",
+        failures: 3,
+        attempt: 1,
+        group: 1,
+        parentSha: "sha1",
+      }),
+      done("build", "build-plan-verify", "2026-10-01T00:30:00Z", {
+        verdict: "PASS",
+        failures: 0,
+        attempt: 2,
+        group: 1,
+        parentSha: "sha2",
+      }),
+      gate("2026-10-01T00:29:00Z", 2, "FAIL", 34),
+    ]);
+    const r = progress(file);
+    expect(r.json.gateCounts).toBe("? → 34");
+    expect(r.json.trend).toBe("unknown");
+    expect(r.json.recommend).toBeNull();
+    expect(r.json.rounds[0].gateFailures).toBeNull();
+    expect(r.json.trendLine).not.toMatch(/rose/i);
+  });
+
+  it("a gate that ran and counted 0 reads 0 beside a not-run round that reads ?", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      done("build", "build-plan-verify", "2026-10-01T00:10:00Z", {
+        verdict: "CONCERNS",
+        failures: 2,
+        attempt: 1,
+        group: 1,
+        parentSha: "sha1",
+      }),
+      gate("2026-10-01T00:29:00Z", 2, "PASS", 0),
+      verify("2026-10-01T00:30:00Z", 2, 1),
+    ]);
+    const r = progress(file);
+    expect(r.json.gateCounts).toBe("? → 0");
+    expect(r.json.rounds[1].gateFailures).toBe(0);
+    expect(r.json.rounds[0].gateFailures).toBeNull();
+  });
+
+  it("a red gate then a verify round with no gate run has no trend", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      gate("2026-10-01T00:09:00Z", 1, "FAIL", 5),
+      verify("2026-10-01T00:10:00Z", 1, 0),
+      done("build", "build-plan-verify", "2026-10-01T00:30:00Z", {
+        verdict: "CONCERNS",
+        failures: 1,
+        attempt: 2,
+        group: 1,
+        parentSha: "sha2",
+      }),
+    ]);
+    const r = progress(file);
+    expect(r.json.trend).toBe("unknown");
+    expect(r.json.recommend).toBeNull();
+    expect(r.json.trendLine).not.toMatch(/closing/i);
+    expect(r.json.trendLine).toMatch(/gate/i);
+    expect(r.json.trendLine).toMatch(/only|some/i);
   });
 });
 
@@ -1300,6 +1370,40 @@ describe("loopProgress with the holistic gate", () => {
     expect(p.rounds.map((r) => r.attempt)).toEqual([2, 3]);
     expect(p.counts).toBe("3 → 2");
   });
+
+  it("a clean holistic verify with no gate row stays a round of the open loop", () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      holistic("2026-10-01T00:10:00Z", 1, "FAIL", 2),
+      gate("2026-10-01T00:11:00Z", 1, "FAIL", 3),
+      holistic("2026-10-01T00:20:00Z", 2, "PASS", 0),
+      holistic("2026-10-01T00:30:00Z", 3, "FAIL", 1),
+      gate("2026-10-01T00:31:00Z", 3, "FAIL", 3),
+    ]);
+    const p = loopProgress(
+      file,
+      path.dirname(file),
+      "build",
+      "build-plan-verify-holistic",
+      "build-plan-gaps-remediate-holistic",
+      undefined,
+      true,
+      "build-holistic-gate",
+    );
+    expect(p.rounds.map((r) => r.attempt)).toEqual([1, 2, 3]);
+  });
+
+  it("a gate-mixed trend line names the holistic gate, not the group gate", () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      holistic("2026-10-01T00:10:00Z", 1, "FAIL", 2),
+      gate("2026-10-01T00:11:00Z", 1, "FAIL", 3),
+      holistic("2026-10-01T00:30:00Z", 2, "FAIL", 1),
+    ]);
+    const p = progress(file);
+    expect(p.trendLine).toMatch(/only some of the rounds/);
+    expect(p.trendLine).not.toMatch(/group gate/i);
+  });
 });
 
 describe("loopTrend", () => {
diff --git a/.bkit/core/engine/commands/workflow/counters.ts b/.bkit/core/engine/commands/workflow/counters.ts
index 397ef7e50..043559c3a 100644
--- a/.bkit/core/engine/commands/workflow/counters.ts
+++ b/.bkit/core/engine/commands/workflow/counters.ts
@@ -327,14 +327,16 @@ export function loopTrend(rounds: Step[], codeChanged: boolean | null): LoopTren
 
 /**
  * The failing tests of the latest `test-run` row for `step` and `attempt` in `workflow`'s
- * active run: 0 with no row, null when unknown (no count, or red with 0 counted failures).
+ * active run. `ran` is false when no row exists (the gate did not run: not run, never 0);
+ * `failures` is null when unknown (no count, or red with 0 counted failures) and 0 only for a
+ * row that counted 0.
  */
 function gateFailuresOf(
   file: string,
   workflow: string,
   step: string,
   attempt: number | undefined,
-): number | null {
+): { ran: boolean; failures: number | null } {
   const rows = readStatusRows(file);
   let start = -1;
   rows.forEach((r, i) => {
@@ -350,11 +352,11 @@ function gateFailuresOf(
         r.attempt === attempt,
     )
     .at(-1);
-  if (row === undefined) return 0;
+  if (row === undefined) return { ran: false, failures: null };
   const failures = row.failures;
-  if (typeof failures !== "number") return null;
-  if (row.verdict === "FAIL" && failures === 0) return null;
-  return failures;
+  if (typeof failures !== "number") return { ran: true, failures: null };
+  if (row.verdict === "FAIL" && failures === 0) return { ran: true, failures: null };
+  return { ran: true, failures };
 }
 
 export interface LoopProgress {
@@ -386,8 +388,11 @@ export interface LoopProgress {
  * `sinceClean`, only the rounds after `check`'s last clean round: a loop that reopens. With
  * `gate` (a step prefix, e.g. `build-group-gate`), each round also counts the failing tests
  * of the latest same-attempt test-run row of `{gate}-{group}`, or of `{gate}` with no group:
- * 0 with no row, and unknown (null) when that row's count is null or the row is red with 0
- * counted failures. A round is clean only when its gate also counted 0.
+ * not run (unknown, never 0) with no row, and unknown (null) when that row's count is null or
+ * the row is red with 0 counted failures. A round is clean only when its gate also counted 0,
+ * so a clean verify with no gate row (not run) is not clean once the gate ran in any round, and
+ * a `sinceClean` loop never closes on a gate that did not run. Only rounds with the same scope and the same gate state
+ * (ran or not) are compared.
  */
 export function loopProgress(
   file: string,
@@ -403,23 +408,42 @@ export function loopProgress(
   const gateStep = gate === undefined || group === undefined ? gate : `${gate}-${group}`;
   const gateOf = (r: Step) =>
     gateStep === undefined ? undefined : gateFailuresOf(file, workflow, gateStep, r.attempt);
-  const clean = (r: Step) => cleanRound(r) && (gateStep === undefined || gateOf(r) === 0);
+  // A loop whose gate ran in no round at all (every verify failed first) ignores the gate for
+  // cleanliness; once the gate ran in any round, a round without a gate row is not clean.
+  const gateRanAnywhere = () =>
+    gateStep !== undefined &&
+    activeDoneSteps(runs, workflow, { step: check, group }).some((r) => gateOf(r)?.ran === true);
+  const clean = (r: Step) => {
+    if (!cleanRound(r)) return false;
+    if (gateStep === undefined) return true;
+    const g = gateOf(r);
+    return g?.ran ? g.failures === 0 : !gateRanAnywhere();
+  };
   const done = (step: string) =>
     sinceClean
       ? activeDoneStepsSinceClean(runs, workflow, { step, group }, check, clean)
       : activeDoneSteps(runs, workflow, { step, group });
   const checked = done(check);
-  const gateFailures = checked.map(gateOf);
+  const gateResults = checked.map(gateOf);
+  const gateFailures = gateResults.map((g) => (g === undefined ? undefined : g.failures));
+  const gateRan = gateResults.map((g) => g?.ran === true);
   const rounds = checked.map((r, i) => {
-    const g = gateFailures[i];
-    if (g === undefined) return r;
-    const failures = g === null || r.failures === undefined ? undefined : r.failures + g;
+    const g = gateResults[i];
+    if (g === undefined || !g.ran) return r;
+    const failures =
+      g.failures === null || r.failures === undefined ? undefined : r.failures + g.failures;
     return { ...r, failures };
   });
   const fixes = done(fix);
   const last = rounds.at(-1);
-  // Only rounds that ran the same tests are compared: the earliest round with the last round's scope.
-  const first = last === undefined ? undefined : rounds.find((r) => r.scope === last.scope);
+  // Only rounds measured the same way are compared: the earliest round with the last round's
+  // scope and the same gate state (ran or not).
+  const lastIndex = rounds.length - 1;
+  const firstIndex =
+    last === undefined
+      ? -1
+      : rounds.findIndex((r, i) => r.scope === last.scope && gateRan[i] === gateRan[lastIndex]);
+  const first = firstIndex < 0 ? undefined : rounds[firstIndex];
   let codeChanged: boolean | null = null;
   if (first && last && first !== last && first.parentSha && last.parentSha) {
     const diff = runGit(checkoutOf(file, cwd), [
@@ -447,11 +471,13 @@ export function loopProgress(
       ? "STANDARD"
       : repeatStrategy(readStatusRows(file), workflow, testStep, current).strategy;
   const sameScope = first !== undefined && last !== undefined && first !== last;
-  const differentScopes = rounds.length >= 2 && !sameScope;
+  const incomparable = rounds.length >= 2 && !sameScope;
+  const gateMixed = incomparable && rounds.slice(0, -1).some((r) => r.scope === last?.scope);
+  const differentScopes = incomparable && !gateMixed;
   const trend: LoopTrend =
     rounds.length < 2
       ? "first-round"
-      : differentScopes
+      : incomparable
         ? "unknown"
         : loopTrend([first as Step, last as Step], codeChanged);
   const countOf = (r: Step | undefined) => (r?.failures === undefined ? "?" : String(r.failures));
@@ -460,6 +486,8 @@ export function loopProgress(
   const lastFailures = last?.failures;
   let trendLine: string;
   if (trend === "first-round") trendLine = "This was the first round, so there is no trend yet.";
+  else if (gateMixed)
+    trendLine = `The gate ran in only some of the rounds (${gateRan.map((g) => (g ? "ran" : "not run")).join(" → ")}), so their counts cannot be compared.`;
   else if (differentScopes)
     trendLine = `The rounds ran different tests (${scopeText(rounds[0]?.scope)}, then ${scopeText(last?.scope)}), so their counts cannot be compared.`;
   else if (trend === "unknown")
@@ -492,7 +520,7 @@ export function loopProgress(
       ? {}
       : {
           gateCounts: gateFailures
-            .map((g) => (g === null || g === undefined ? "?" : String(g)))
+            .map((g, i) => (g === null || g === undefined || !gateRan[i] ? "?" : String(g)))
             .join(" → "),
         }),
     codeChanged,
@@ -873,7 +901,7 @@ export const countersCommand: CommandSpec = {
         counts:
           "problem count after each round, e.g. 5 → 2 (with a gate, the gate's failing tests are added)",
         gateCounts:
-          "the group gate's failing tests after each round, e.g. 3 → 3 (absent without a gate)",
+          "the group gate's failing tests after each round, e.g. 3 → 3; a round whose gate did not run reads ? (absent without a gate)",
         codeChanged:
           "source changed between the compared rounds, the earliest and the last that ran the same tests (same scope) (null when git cannot tell)",
         lastStrategy: "strategy of the last fix round (null when none ran)",
@@ -881,7 +909,7 @@ export const countersCommand: CommandSpec = {
         finalSpent: "true when a fix round already ran FINAL",
         minutesPerRound: "average minutes between check rounds (null under two rounds)",
         trend:
-          "first-round | closing | stuck | worse | unknown (a missing count, or rounds of different scopes)",
+          "first-round | closing | stuck | worse | unknown (a missing count, rounds of different scopes, or the gate ran in only some of the rounds)",
         trendLine: "one plain sentence on what the counts show, with the counts and the reason",
         recommend:
           "try-again when closing, stop when stuck or worse (null on the first round or an unknown trend)",
diff --git a/.bkit/version b/.bkit/version
index bbe6ea173..b80023a4b 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "204034f2ae02f986d93d211852bb15364763e8be3fbadf732734634c0acaf008",
+    ".bkit/workflows.md": "f68796a66de40e34c0c593424012f8d11d31f4273741b7500cb2111e9e7466b6",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index d245b8c1f..6955be967 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1036,9 +1036,9 @@ Every point where a run can ask the owner has two settings under `package.json`
   | `codeChanged` | `git diff` of source (plan logs and ledgers excluded) between the `parentSha` of the compared same-scope pair; `null` when git cannot compare |
   | `lastStrategy` / `finalSpent` | fix rows' `strategy` |
   | `nextStrategy` | the same label `status route` gives the fix step: from the failing tests that repeat across attempts of every run |
-  | `gateCounts` | each round's gate failing tests (`build-group-gate-{GROUP}` for the verify loop, `build-holistic-gate` for the holistic loop), added to `counts`; a round is clean only when its gate also counted 0 |
+  | `gateCounts` | each round's gate failing tests (`build-group-gate-{GROUP}` for the verify loop, `build-holistic-gate` for the holistic loop), added to `counts`; a round whose gate did not run (verify `CONCERNS` or `FAIL`, so no gate ran) reads `?`, never `0`, and keeps its verify count; a round is clean only when its gate also counted 0, so once the gate ran in any round a clean verify with no gate row is not clean |
   | `minutesPerRound` | check-row timestamps |
-  | `trend` | Compares the earliest round with the last round's `scope` against the last round. `unknown` = a compared count is missing, or no earlier round shares the last round's `scope`; `worse` = count rose; `closing` = count fell and code changed; `stuck` = otherwise; `first-round` = one check row |
+  | `trend` | Compares the earliest round with the last round's `scope` against the last round. `unknown` = a compared count is missing, or no earlier round shares the last round's `scope` and gate state (the gate ran in only some of the rounds); `worse` = count rose; `closing` = count fell and code changed; `stuck` = otherwise; `first-round` = one check row |
   | `trendLine` | One plain sentence with the compared counts and the reason for the trend; every loop question states it instead of a fixed claim |
   | `recommend` | `try-again` when `closing`, else `stop`; `null` on `first-round` and `unknown` |
 
diff --git a/dist/commands/workflow/counters.js b/dist/commands/workflow/counters.js
index 9b491afda..d0556a305 100644
--- a/dist/commands/workflow/counters.js
+++ b/dist/commands/workflow/counters.js
@@ -223,7 +223,9 @@ export function loopTrend(rounds, codeChanged) {
 }
 /**
  * The failing tests of the latest `test-run` row for `step` and `attempt` in `workflow`'s
- * active run: 0 with no row, null when unknown (no count, or red with 0 counted failures).
+ * active run. `ran` is false when no row exists (the gate did not run: not run, never 0);
+ * `failures` is null when unknown (no count, or red with 0 counted failures) and 0 only for a
+ * row that counted 0.
  */
 function gateFailuresOf(file, workflow, step, attempt) {
     const rows = readStatusRows(file);
@@ -240,43 +242,64 @@ function gateFailuresOf(file, workflow, step, attempt) {
         r.attempt === attempt)
         .at(-1);
     if (row === undefined)
-        return 0;
+        return { ran: false, failures: null };
     const failures = row.failures;
     if (typeof failures !== "number")
-        return null;
+        return { ran: true, failures: null };
     if (row.verdict === "FAIL" && failures === 0)
-        return null;
-    return failures;
+        return { ran: true, failures: null };
+    return { ran: true, failures };
 }
 /**
  * A fix loop's progress in the active run: `check` counts problems, `fix` fixes them. With
  * `sinceClean`, only the rounds after `check`'s last clean round: a loop that reopens. With
  * `gate` (a step prefix, e.g. `build-group-gate`), each round also counts the failing tests
  * of the latest same-attempt test-run row of `{gate}-{group}`, or of `{gate}` with no group:
- * 0 with no row, and unknown (null) when that row's count is null or the row is red with 0
- * counted failures. A round is clean only when its gate also counted 0.
+ * not run (unknown, never 0) with no row, and unknown (null) when that row's count is null or
+ * the row is red with 0 counted failures. A round is clean only when its gate also counted 0,
+ * so a clean verify with no gate row (not run) is not clean once the gate ran in any round, and
+ * a `sinceClean` loop never closes on a gate that did not run. Only rounds with the same scope and the same gate state
+ * (ran or not) are compared.
  */
 export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean = false, gate) {
     const runs = readRuns(file);
     const gateStep = gate === undefined || group === undefined ? gate : `${gate}-${group}`;
     const gateOf = (r) => gateStep === undefined ? undefined : gateFailuresOf(file, workflow, gateStep, r.attempt);
-    const clean = (r) => cleanRound(r) && (gateStep === undefined || gateOf(r) === 0);
+    // A loop whose gate ran in no round at all (every verify failed first) ignores the gate for
+    // cleanliness; once the gate ran in any round, a round without a gate row is not clean.
+    const gateRanAnywhere = () => gateStep !== undefined &&
+        activeDoneSteps(runs, workflow, { step: check, group }).some((r) => gateOf(r)?.ran === true);
+    const clean = (r) => {
+        if (!cleanRound(r))
+            return false;
+        if (gateStep === undefined)
+            return true;
+        const g = gateOf(r);
+        return g?.ran ? g.failures === 0 : !gateRanAnywhere();
+    };
     const done = (step) => sinceClean
         ? activeDoneStepsSinceClean(runs, workflow, { step, group }, check, clean)
         : activeDoneSteps(runs, workflow, { step, group });
     const checked = done(check);
-    const gateFailures = checked.map(gateOf);
+    const gateResults = checked.map(gateOf);
+    const gateFailures = gateResults.map((g) => (g === undefined ? undefined : g.failures));
+    const gateRan = gateResults.map((g) => g?.ran === true);
     const rounds = checked.map((r, i) => {
-        const g = gateFailures[i];
-        if (g === undefined)
+        const g = gateResults[i];
+        if (g === undefined || !g.ran)
             return r;
-        const failures = g === null || r.failures === undefined ? undefined : r.failures + g;
+        const failures = g.failures === null || r.failures === undefined ? undefined : r.failures + g.failures;
         return { ...r, failures };
     });
     const fixes = done(fix);
     const last = rounds.at(-1);
-    // Only rounds that ran the same tests are compared: the earliest round with the last round's scope.
-    const first = last === undefined ? undefined : rounds.find((r) => r.scope === last.scope);
+    // Only rounds measured the same way are compared: the earliest round with the last round's
+    // scope and the same gate state (ran or not).
+    const lastIndex = rounds.length - 1;
+    const firstIndex = last === undefined
+        ? -1
+        : rounds.findIndex((r, i) => r.scope === last.scope && gateRan[i] === gateRan[lastIndex]);
+    const first = firstIndex < 0 ? undefined : rounds[firstIndex];
     let codeChanged = null;
     if (first && last && first !== last && first.parentSha && last.parentSha) {
         const diff = runGit(checkoutOf(file, cwd), [
@@ -304,10 +327,12 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
         ? "STANDARD"
         : repeatStrategy(readStatusRows(file), workflow, testStep, current).strategy;
     const sameScope = first !== undefined && last !== undefined && first !== last;
-    const differentScopes = rounds.length >= 2 && !sameScope;
+    const incomparable = rounds.length >= 2 && !sameScope;
+    const gateMixed = incomparable && rounds.slice(0, -1).some((r) => r.scope === last?.scope);
+    const differentScopes = incomparable && !gateMixed;
     const trend = rounds.length < 2
         ? "first-round"
-        : differentScopes
+        : incomparable
             ? "unknown"
             : loopTrend([first, last], codeChanged);
     const countOf = (r) => (r?.failures === undefined ? "?" : String(r.failures));
@@ -317,6 +342,8 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
     let trendLine;
     if (trend === "first-round")
         trendLine = "This was the first round, so there is no trend yet.";
+    else if (gateMixed)
+        trendLine = `The gate ran in only some of the rounds (${gateRan.map((g) => (g ? "ran" : "not run")).join(" → ")}), so their counts cannot be compared.`;
     else if (differentScopes)
         trendLine = `The rounds ran different tests (${scopeText(rounds[0]?.scope)}, then ${scopeText(last?.scope)}), so their counts cannot be compared.`;
     else if (trend === "unknown")
@@ -347,7 +374,7 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
             ? {}
             : {
                 gateCounts: gateFailures
-                    .map((g) => (g === null || g === undefined ? "?" : String(g)))
+                    .map((g, i) => (g === null || g === undefined || !gateRan[i] ? "?" : String(g)))
                     .join(" → "),
             }),
         codeChanged,
@@ -692,13 +719,13 @@ export const countersCommand = {
             output: {
                 rounds: "the check rounds counted: attempt, failures, gateFailures, scope (what the round ran), at",
                 counts: "problem count after each round, e.g. 5 → 2 (with a gate, the gate's failing tests are added)",
-                gateCounts: "the group gate's failing tests after each round, e.g. 3 → 3 (absent without a gate)",
+                gateCounts: "the group gate's failing tests after each round, e.g. 3 → 3; a round whose gate did not run reads ? (absent without a gate)",
                 codeChanged: "source changed between the compared rounds, the earliest and the last that ran the same tests (same scope) (null when git cannot tell)",
                 lastStrategy: "strategy of the last fix round (null when none ran)",
                 nextStrategy: "strategy the next fix round would use",
                 finalSpent: "true when a fix round already ran FINAL",
                 minutesPerRound: "average minutes between check rounds (null under two rounds)",
-                trend: "first-round | closing | stuck | worse | unknown (a missing count, or rounds of different scopes)",
+                trend: "first-round | closing | stuck | worse | unknown (a missing count, rounds of different scopes, or the gate ran in only some of the rounds)",
                 trendLine: "one plain sentence on what the counts show, with the counts and the reason",
                 recommend: "try-again when closing, stop when stuck or worse (null on the first round or an unknown trend)",
             },
diff --git a/docs/testing.md b/docs/testing.md
index 405e60e45..bc980c4c2 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -787,7 +787,7 @@ When adding bkit-managed file types or scope keys, extend fixture — single sou
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
-| `commands/workflow/counters.test.ts` | Unit | Row counting at the three positions (`current` refuses 0); fold dedup (retries survive / replays collapse); active-run scoping; group isolation; `--all-runs`; run numbering incl. resume + interleave; fail-closed value / max; `loopProgress` same-scope trend, `unknown` trend with `recommend` null, `trendLine` (a scope with a line break quoted on one line), the holistic gate's failing tests added to each holistic round (a clean verify with a red gate stays a round), `nextStrategy` equal to `status route`'s; `--point` (limit and `ask` from `package.json`, `ask` false when headless); `--of` + `--rows` summed |
+| `commands/workflow/counters.test.ts` | Unit | Row counting at the three positions (`current` refuses 0); fold dedup (retries survive / replays collapse); active-run scoping; group isolation; `--all-runs`; run numbering incl. resume + interleave; fail-closed value / max; `loopProgress` trend over rounds of the same scope and gate state (a round whose gate did not run reads `?`), `unknown` trend with `recommend` null, `trendLine` (a scope with a line break quoted on one line), the holistic gate's failing tests added to each holistic round (a clean verify with a red gate stays a round), `nextStrategy` equal to `status route`'s; `--point` (limit and `ask` from `package.json`, `ask` false when headless); `--of` + `--rows` summed |
 | `commands/workflow/status.test.ts` | Unit | `debugMode`/`pushMode` meta (run-level over step); last verdict / failures; all-runs strategy; `nextStrategy` and `repeatTests` from failing tests that repeat across distinct earlier attempts of every run (per group gate, a row without `failedTests` counting as none; a gate row from an older attempt or run than the round the fix follows gives `STANDARD`); `--require` failures |
 | `commands/workflow/summary.test.ts` | Unit | `bkit workflows summary` verdict from status rows: unticked build task / last test FAIL / a build with no plan file (`No plan file`) → FAIL; a FAIL a later step answers, a CONCERNS row, a Decision Pause accept or a new deferral → CONCERNS; a verify pause's `Fix now` group resolved by its verified fix tasks, an `Accept`-only pause's group resolved by the pause, an all-`Accept` holistic pause (its `Holistic verify` loop item answered `Decide`) settling the last holistic verify / remediate FAIL before it while a `Fix now` item or a `Try again` loop answer settles nothing, an all-`Accept` pause whose `Source changed` header is present and not `false` settling nothing, a red `build-holistic-gate` resolved by a later passing Step 12 run, a test-fix FAIL resolved by a later same-scope passing run, and a build diagnose FAIL answered by one reported as a concern (a different or missing scope still counts, and a `debug-failure-diagnose` or `debug-failure-soak` FAIL is never cleared); next step per workflow and verdict; issue ref per tracker; the `## Challenge` line naming a skipped challenge-1 from the latest `challenge-gate` row; `Publish: held` and `Docs: not synced` lines on a held build (`Publish: pr` otherwise), with the verdict and next step unchanged by `publish`; a documentation warning whose fields hold line breaks, tabs or a backtick in the path rendered as one capped line per field |
 | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | Unit (markdown-invariant) | No prose `Init` / `Increment`, no bare `*_ATTEMPT` comparison outside fenced blocks; counters derived in the block that routes on them, or by the routing / writing command itself (`steps finish --attempt=next` / `--attempt-of`, `counters route --of`); each derived counter maps to the right step; counted steps commit in-block or are exempted |
