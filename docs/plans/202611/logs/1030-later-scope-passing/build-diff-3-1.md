diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index c0252aa0b..9ffa37f9d 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -523,7 +523,7 @@ Each step posts its own fenced section as a fresh comment.
 | Failed group execution or gap remediation | The latest passing verification of the same group, after the failure; a later passing holistic verification with 0 failures also covers it, because a `Fix now` can move the fix into a new group. A group that paused for the owner can also be covered by the verify-pause row below. Separate remediation warnings and flakes remain concerns. |
 | Failed group verification, group gate or holistic gate | A later passing holistic verification (verify) or a later passing Step 12 run (group gate, holistic gate), with 0 failures. |
 | Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `Fix task:` line names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the FAIL. |
-| Failed diagnose or test-fix step (build Steps 13 and 14, debug Steps 6 and 7) | A later passing test run in the same run with 0 failures on the same scope as the run the step followed clears a failed test fix. A failed diagnose step it answers is reported as a concern (`{step} FAIL, tests passed since ({run})`), not cleared, so the verdict is CONCERNS. A scope that differs or is missing keeps the FAIL. A failed soak step (debug Step 8) is not cleared by a later pass. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
+| Failed diagnose or test-fix step (build Steps 13 and 14, debug Steps 6 and 7) | A later passing test run in the same run with 0 failures on the same scope as the run the step followed clears a failed test fix. A failed build diagnose step (build Step 13) it answers is reported as a concern (`{step} FAIL, tests passed since ({run})`), not cleared, so the verdict is CONCERNS. A scope that differs or is missing keeps the FAIL. A failed debug diagnose step (debug Step 6) or soak step (debug Step 8) is not cleared by a later pass. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
 | Build challenge finding | A completed plan task with matching location, severity and challenge round, covered by a later passing verification's `Tasks` list for that group. An accepted finding remains a concern; a LOW finding's closed deferral resolves it. |
 | Plan currency | Later passing verification covers every task in the plan. A passing unrelated group does not resolve it. |
 | Deferral | The latest ledger row for that key determines whether it remains open, including a closure written by another workflow. |
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 7840fb306..5c8da5fa3 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -969,14 +969,31 @@ describe("buildSummary", () => {
         rows: [tests(1, "FAIL", 1, scope), diagnose, tests(2, "PASS", 0, scope)],
       }),
     );
-    expect(answered.reasons).not.toContain("debug-failure-diagnose FAIL");
-    expect(answered.reasons).toContain(
+    expect(answered.reasons).toContain("debug-failure-diagnose FAIL");
+    expect(answered.reasons).not.toContain(
       "debug-failure-diagnose FAIL, tests passed since (debug-run-tests)",
     );
     expect(answered.markdown).not.toContain(
       "debug-failure-diagnose FAIL, resolved by debug-run-tests",
     );
-    expect(answered.verdict).toBe("CONCERNS");
+    expect(answered.verdict).toBe("FAIL");
+  });
+
+  it("a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL", () => {
+    const { tests, diagnose, scope } = diagnoseCase("debug");
+    const summary = buildSummary(
+      input({
+        workflow: "debug",
+        rows: [
+          scopedRun("debug-run-tests", 1, "FAIL", 1, "src/a.test.ts"),
+          diagnose,
+          scopedRun("debug-run-tests", 2, "PASS", 0, "src/a.test.ts"),
+        ],
+      }),
+    );
+    expect(tests(2, "PASS", 0, scope).scope).toBe("src/a.test.ts");
+    expect(summary.verdict).toBe("FAIL");
+    expect(summary.reasons).toContain("debug-failure-diagnose FAIL");
   });
 
   it("a diagnose FAIL with no later passing same-scope test run is still a FAIL", () => {
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index 530fe45a3..c2ba02b74 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -73,7 +73,7 @@ export function refOf(fid: string, tracker: FidTracker = "any"): string | undefi
 /**
  * Review updates cover their review's findings. The same group's verification, or a
  * whole-plan verification, covers failed execution; a passing test run clears a failed
- * test fix and turns a failed diagnose into a concern; a soak FAIL has no entry. None covers a remediation agent's separate warnings or flakes.
+ * test fix and turns a failed build diagnose into a concern; a failed debug diagnose or soak step has no entry and is never cleared. None covers a remediation agent's separate warnings or flakes.
  */
 const RESOLVED_BY: Readonly<Record<string, readonly string[]>> = {
   "plan/plan-review": ["plan-apply-review"],
@@ -82,18 +82,16 @@ const RESOLVED_BY: Readonly<Record<string, readonly string[]>> = {
   "build/build-plan-gaps-remediate": ["build-plan-verify", "build-plan-verify-holistic"],
   "build/build-plan-gaps-remediate-holistic": ["build-plan-verify-holistic"],
   "build/build-failure-diagnose": ["build-run-tests"],
-  "debug/debug-failure-diagnose": ["debug-run-tests"],
   "build/build-failure-remediate": ["build-run-tests"],
   "debug/debug-failure-remediate": ["debug-run-tests"],
 };
 
-/** Diagnose steps: a later passing run leaves a concern, not a cleared finding. */
-const DIAGNOSE = new Set(["build/build-failure-diagnose", "debug/debug-failure-diagnose"]);
+/** The build diagnose step: a later passing run leaves a concern, not a cleared finding. */
+const DIAGNOSE = new Set(["build/build-failure-diagnose"]);
 
-/** Test-fix and diagnose steps whose resolving run must have run the scope of the run they followed. */
+/** Test-fix and build diagnose steps whose resolving run must have run the scope of the run they followed. */
 const SAME_SCOPE = new Set([
   "build/build-failure-diagnose",
-  "debug/debug-failure-diagnose",
   "build/build-failure-remediate",
   "debug/debug-failure-remediate",
 ]);
diff --git a/.bkit/version b/.bkit/version
index b838d6548..f7541537d 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -214,7 +214,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "85913cc84a994cd14a6c0948a8f6b63611a776b1be80cf9a902e5cb994add0c2",
-    ".bkit/workflows.md": "2471b0d7664c8fbd91ef1c3d418e35257d5f52c7e24f92f0430da89e25700db5",
+    ".bkit/workflows.md": "f2807e5c4c1de9afcb552d97f7b15def894aa9d53fae017b13de82bd27982f22",
     ".bkit/README.md": "152775312638fa028f28fb5362ba76f808ed5b17a469924cae54a594294741b9",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 8391745a7..553ef58a1 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -523,7 +523,7 @@ Each step posts its own fenced section as a fresh comment.
 | Failed group execution or gap remediation | The latest passing verification of the same group, after the failure; a later passing holistic verification with 0 failures also covers it, because a `Fix now` can move the fix into a new group. A group that paused for the owner can also be covered by the verify-pause row below. Separate remediation warnings and flakes remain concerns. |
 | Failed group verification, group gate or holistic gate | A later passing holistic verification (verify) or a later passing Step 12 run (group gate, holistic gate), with 0 failures. |
 | Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `Fix task:` line names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the FAIL. |
-| Failed diagnose or test-fix step (build Steps 13 and 14, debug Steps 6 and 7) | A later passing test run in the same run with 0 failures on the same scope as the run the step followed clears a failed test fix. A failed diagnose step it answers is reported as a concern (`{step} FAIL, tests passed since ({run})`), not cleared, so the verdict is CONCERNS. A scope that differs or is missing keeps the FAIL. A failed soak step (debug Step 8) is not cleared by a later pass. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
+| Failed diagnose or test-fix step (build Steps 13 and 14, debug Steps 6 and 7) | A later passing test run in the same run with 0 failures on the same scope as the run the step followed clears a failed test fix. A failed build diagnose step (build Step 13) it answers is reported as a concern (`{step} FAIL, tests passed since ({run})`), not cleared, so the verdict is CONCERNS. A scope that differs or is missing keeps the FAIL. A failed debug diagnose step (debug Step 6) or soak step (debug Step 8) is not cleared by a later pass. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
 | Build challenge finding | A completed plan task with matching location, severity and challenge round, covered by a later passing verification's `Tasks` list for that group. An accepted finding remains a concern; a LOW finding's closed deferral resolves it. |
 | Plan currency | Later passing verification covers every task in the plan. A passing unrelated group does not resolve it. |
 | Deferral | The latest ledger row for that key determines whether it remains open, including a closure written by another workflow. |
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index c9108514c..fdc589a72 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -62,7 +62,7 @@ export function refOf(fid, tracker = "any") {
 /**
  * Review updates cover their review's findings. The same group's verification, or a
  * whole-plan verification, covers failed execution; a passing test run clears a failed
- * test fix and turns a failed diagnose into a concern; a soak FAIL has no entry. None covers a remediation agent's separate warnings or flakes.
+ * test fix and turns a failed build diagnose into a concern; a failed debug diagnose or soak step has no entry and is never cleared. None covers a remediation agent's separate warnings or flakes.
  */
 const RESOLVED_BY = {
     "plan/plan-review": ["plan-apply-review"],
@@ -71,16 +71,14 @@ const RESOLVED_BY = {
     "build/build-plan-gaps-remediate": ["build-plan-verify", "build-plan-verify-holistic"],
     "build/build-plan-gaps-remediate-holistic": ["build-plan-verify-holistic"],
     "build/build-failure-diagnose": ["build-run-tests"],
-    "debug/debug-failure-diagnose": ["debug-run-tests"],
     "build/build-failure-remediate": ["build-run-tests"],
     "debug/debug-failure-remediate": ["debug-run-tests"],
 };
-/** Diagnose steps: a later passing run leaves a concern, not a cleared finding. */
-const DIAGNOSE = new Set(["build/build-failure-diagnose", "debug/debug-failure-diagnose"]);
-/** Test-fix and diagnose steps whose resolving run must have run the scope of the run they followed. */
+/** The build diagnose step: a later passing run leaves a concern, not a cleared finding. */
+const DIAGNOSE = new Set(["build/build-failure-diagnose"]);
+/** Test-fix and build diagnose steps whose resolving run must have run the scope of the run they followed. */
 const SAME_SCOPE = new Set([
     "build/build-failure-diagnose",
-    "debug/debug-failure-diagnose",
     "build/build-failure-remediate",
     "debug/debug-failure-remediate",
 ]);
diff --git a/docs/testing.md b/docs/testing.md
index 0b4d03228..52e6d96b8 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -654,7 +654,7 @@ When adding bkit-managed file types or scope keys, extend fixture — single sou
 | --- | --- | --- |
 | `commands/workflow/counters.test.ts` | Unit | Row counting at the three positions (`current` refuses 0); fold dedup (retries survive / replays collapse); active-run scoping; group isolation; `--all-runs`; run numbering incl. resume + interleave; fail-closed value / max; `loopProgress` same-scope trend, `unknown` trend with `recommend` null, `trendLine` (a scope with a line break quoted on one line), the holistic gate's failing tests added to each holistic round (a clean verify with a red gate stays a round), `nextStrategy` equal to `status route`'s; `--point` (limit and `ask` from `package.json`, `ask` false when headless); `--of` + `--rows` summed |
 | `commands/workflow/status.test.ts` | Unit | `debugMode`/`pushMode` meta (run-level over step); last verdict / failures; all-runs strategy; `nextStrategy` and `repeatTests` from failing tests that repeat across distinct earlier attempts of every run (per group gate, a row without `failedTests` counting as none; a gate row from an older attempt or run than the round the fix follows gives `STANDARD`); `--require` failures |
-| `commands/workflow/summary.test.ts` | Unit | `bkit workflows summary` verdict from status rows: unticked build task / last test FAIL / a build with no plan file (`No plan file`) → FAIL; a FAIL a later step answers, a CONCERNS row, a Decision Pause accept or a new deferral → CONCERNS; a verify pause's `Fix now` group resolved by its verified fix tasks, an `Accept`-only pause's group resolved by the pause, an all-`Accept` holistic pause (its `Holistic verify` loop item answered `Decide`) settling the last holistic verify / remediate FAIL before it while a `Fix now` item or a `Try again` loop answer settles nothing, an all-`Accept` pause whose `Source changed` header is present and not `false` settling nothing, a red `build-holistic-gate` resolved by a later passing Step 12 run, a test-fix FAIL resolved by a later same-scope passing run, and a diagnose FAIL answered by one reported as a concern (a different or missing scope, and a `debug-failure-soak` FAIL, still count); next step per workflow and verdict; issue ref per tracker; the `## Challenge` line naming a skipped challenge-1 from the latest `challenge-gate` row; `Publish: held` and `Docs: not synced` lines on a held build (`Publish: pr` otherwise), with the verdict and next step unchanged by `publish`; a documentation warning whose fields hold line breaks, tabs or a backtick in the path rendered as one capped line per field |
+| `commands/workflow/summary.test.ts` | Unit | `bkit workflows summary` verdict from status rows: unticked build task / last test FAIL / a build with no plan file (`No plan file`) → FAIL; a FAIL a later step answers, a CONCERNS row, a Decision Pause accept or a new deferral → CONCERNS; a verify pause's `Fix now` group resolved by its verified fix tasks, an `Accept`-only pause's group resolved by the pause, an all-`Accept` holistic pause (its `Holistic verify` loop item answered `Decide`) settling the last holistic verify / remediate FAIL before it while a `Fix now` item or a `Try again` loop answer settles nothing, an all-`Accept` pause whose `Source changed` header is present and not `false` settling nothing, a red `build-holistic-gate` resolved by a later passing Step 12 run, a test-fix FAIL resolved by a later same-scope passing run, and a build diagnose FAIL answered by one reported as a concern (a different or missing scope still counts, and a `debug-failure-diagnose` or `debug-failure-soak` FAIL is never cleared); next step per workflow and verdict; issue ref per tracker; the `## Challenge` line naming a skipped challenge-1 from the latest `challenge-gate` row; `Publish: held` and `Docs: not synced` lines on a held build (`Publish: pr` otherwise), with the verdict and next step unchanged by `publish`; a documentation warning whose fields hold line breaks, tabs or a backtick in the path rendered as one capped line per field |
 | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | Unit (markdown-invariant) | No prose `Init` / `Increment`, no bare `*_ATTEMPT` comparison outside fenced blocks; counters derived in the block that routes on them, or by the routing / writing command itself (`steps finish --attempt=next` / `--attempt-of`, `counters route --of`); each derived counter maps to the right step; counted steps commit in-block or are exempted |
 
 ## Deterministic bookkeeping test coverage
