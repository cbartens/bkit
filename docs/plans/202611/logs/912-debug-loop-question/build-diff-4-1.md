diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 45c0d2c3d..661cef0b7 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -424,6 +424,60 @@ describe("bkit decisions compose", () => {
     expect(text).not.toContain("a round is left");
   });
 
+  it("--loop=verify on an unknown trend below the limit does not say the limit is used up", async () => {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    const verifyRow = (at: string, attempt: number, failures: number) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      attempt,
+      failures,
+    });
+    const gateRow = {
+      type: "test-run",
+      workflow: "build",
+      at: "2026-10-01T00:29:00Z",
+      step: "build-group-gate-1",
+      attempt: 1,
+      run: 1,
+      verdict: "FAIL",
+      exitCode: 1,
+      failures: null,
+      scope: "gate",
+      log: "x.log",
+    };
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        verifyRow("2026-10-01T00:10:00Z", 1, 2),
+        gateRow,
+        verifyRow("2026-10-01T00:30:00Z", 2, 0),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { r, out } = await compose(
+      root,
+      logs,
+      [],
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+      "--attempt=1",
+      "--max=3",
+    );
+    expect(r.code).toBe(0);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("Trend: unknown");
+    expect(text).not.toContain("the limit is used up");
+    expect(text).not.toContain("a round is left");
+  });
+
   it("--loop states the engine's trendLine in Q1", async () => {
     const { root, logs } = checkout();
     const status = path.join(logs, "status.jsonl");
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 17f925cc4..a4d6b9dee 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -459,9 +459,15 @@ export const decisionsCommand: CommandSpec = {
           const max = str(ctx.flags.max) ?? "?";
           const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
           loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
+          const attemptNum = Number(attempt);
+          const maxNum = Number(max);
+          const limitUsed =
+            Number.isFinite(attemptNum) && Number.isFinite(maxNum) && attemptNum >= maxNum;
           const trendReason =
             p.trend === "unknown"
-              ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
+              ? limitUsed
+                ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
+                : `the counts cannot show whether the rounds helped (${p.trendLine})`
               : loopRecommended === "Try again"
                 ? "the last round made progress"
                 : "another round is unlikely to close the remaining items";
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index b71748c89..220edca44 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -377,8 +377,13 @@ export const decisionsCommand = {
                     const max = str(ctx.flags.max) ?? "?";
                     const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
                     loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
+                    const attemptNum = Number(attempt);
+                    const maxNum = Number(max);
+                    const limitUsed = Number.isFinite(attemptNum) && Number.isFinite(maxNum) && attemptNum >= maxNum;
                     const trendReason = p.trend === "unknown"
-                        ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
+                        ? limitUsed
+                            ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
+                            : `the counts cannot show whether the rounds helped (${p.trendLine})`
                         : loopRecommended === "Try again"
                             ? "the last round made progress"
                             : "another round is unlikely to close the remaining items";
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 8df000161..b38d09e5e 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -306,3 +306,8 @@
 {"schema":3,"ts":1794476033973,"firstTs":1794476033973,"updates":1,"kind":"deferral","key":"918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2026","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["918-ad-hoc-agent"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"An ad-hoc agent passes --kind=audit --audit-slug=x/../../.. --body-file=notes.md (a file at the repo root) and the run-proof guard accepts it, because the audit proof joins an unvalidated slug into the outbox path; only buildComment's later slug check stops the body today","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tracker.ts:2026: An ad-hoc agent passes --kind=audit --audit-slug=x/../../.. --body-file=notes.md (a file at the repo root) and the run-proof guard accepts it, because the audit proof joins an unvalidated slug into the outbox path; only buildComment's later slug check stops the body today. Done when: commentRunProof returns null unless --audit-slug matches ^[a-z0-9-]+$ before the slug is joined into <outbox>/audit-{slug}, as the plan's Architecture commentRunProof \"audit\" bullet specifies; a path-traversing slug is refused by the guard itself with the \"workflow steps only\" message, not by the later \"--kind=audit needs --audit-slug\" usage error.","source":".bkit/core/engine/commands/workflow/tracker.ts:2026"}
 {"schema":3,"ts":1794476033974,"firstTs":1794476033974,"updates":1,"kind":"deferral","key":"918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2019","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["918-ad-hoc-agent"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"An ad-hoc caller passes --kind=audit --audit-slug=x/../../.. --body-file=agenda.md and the audit run proof accepts it, because the unvalidated slug walks audit-{slug} up out of the outbox to the repo root","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tracker.ts:2019: An ad-hoc caller passes --kind=audit --audit-slug=x/../../.. --body-file=agenda.md and the audit run proof accepts it, because the unvalidated slug walks audit-{slug} up out of the outbox to the repo root. Done when: commentRunProof returns \"audit\" only when --audit-slug matches ^[a-z0-9-]+$ (the allowlist the plan's Architecture section for tracker.ts names and buildComment already applies at .bkit/core/engine/commands/workflow/issues.ts:846), so a traversal slug is refused by the guard itself with the \"workflow steps only\" message instead of relying on the later buildComment slug check to stop the comment","source":".bkit/core/engine/commands/workflow/tracker.ts:2019"}
 {"schema":3,"ts":1794476033975,"firstTs":1794476033975,"updates":1,"kind":"deferral","key":"918-ad-hoc-agent-challenge-low-docs-security-md-62","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["918-ad-hoc-agent"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"docs/security.md says an ad-hoc agent \"cannot post\" a marked comment, yet any agent passes the guard with a guessed --session-dir=.git/bkit-outbox/sessions/x (the folder need not exist) or a committed status.jsonl, so a reviewer relying on the doc treats a speed bump as a boundary","description":"LOW build challenge finding at docs/security.md:62: docs/security.md says an ad-hoc agent \"cannot post\" a marked comment, yet any agent passes the guard with a guessed --session-dir=.git/bkit-outbox/sessions/x (the folder need not exist) or a committed status.jsonl, so a reviewer relying on the doc treats a speed bump as a boundary. Done when: § Workflow comment ownership states the refusal as a misuse guard, not an authorization boundary: it says the proofs (a path under the Git-common bkit-outbox/sessions/, a run status.jsonl, an audit outbox body file) can be supplied by any local caller, and that the marker carries no provenance, matching the plan's own Assumption (\"The guard is a speed bump\")","source":"docs/security.md:62"}
+{"schema":3,"ts":1794528596569,"firstTs":1794528596569,"updates":1,"kind":"deferral","key":"912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-counters-ts-470","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["912-debug-loop-question"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The closing trendLine claims \"and the code changed\" when git could not tell (codeChanged: null: a missing parentSha or an unknown commit)","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/counters.ts:470: The closing trendLine claims \"and the code changed\" when git could not tell (codeChanged: null: a missing parentSha or an unknown commit). Done when: On closing with codeChanged = null, trendLine states the fall and says git could not tell whether the code changed; with codeChanged = true it keeps \"and the code changed\"; counters.test.ts passes.","source":".bkit/core/engine/commands/workflow/counters.ts:470"}
+{"schema":3,"ts":1794528596570,"firstTs":1794528596570,"updates":1,"kind":"deferral","key":"912-debug-loop-question-challenge-low-bkit-core-engine-ledgers-status-ts-338","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["912-debug-loop-question"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"ciRoundMatches accepts a CI test-run row whose positive failures the selection does not back, so steps finish and the status-holes check pass a CI count no evidence holds","description":"LOW build challenge finding at .bkit/core/engine/ledgers/status.ts:338: ciRoundMatches accepts a CI test-run row whose positive failures the selection does not back, so steps finish and the status-holes check pass a CI count no evidence holds. Done when: ciRoundMatches also requires row.failures to equal selection.failedJobCount ?? null (null stays accepted for a selection saved before failedJobCount existed); the steps.test.ts CI fixture's counted case sets a matching failedJobCount on its selection; status.test.ts, steps.test.ts and status-holes.test.ts pass.","source":".bkit/core/engine/ledgers/status.ts:338"}
+{"schema":3,"ts":1794528596571,"firstTs":1794528596571,"updates":1,"kind":"deferral","key":"912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-counters-ts-435","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["912-debug-loop-question"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Two CI rounds from different CI generations of one run (attempt 1, then a re-run attempt 2) share scope ci:<run id>, so the trend compares their job counts and reads closing on a flaky re-run of the same commit","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/counters.ts:435: Two CI rounds from different CI generations of one run (attempt 1, then a re-run attempt 2) share scope ci:<run id>, so the trend compares their job counts and reads closing on a flaky re-run of the same commit. Done when: loopProgress treats source: ci rounds with different ciGeneration values as different scopes, so such a pair reads unknown with the different-tests trendLine; two rounds of one generation and unscoped or local rounds compare as today; counters.test.ts passes.","source":".bkit/core/engine/commands/workflow/counters.ts:435"}
+{"schema":3,"ts":1794528596572,"firstTs":1794528596572,"updates":1,"kind":"deferral","key":"912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-counters-ts-466","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["912-debug-loop-question"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A step-done row whose free-text `scope` holds a line break plants a `Recommended:` line in the `decisions compose --loop` Q1, and `decisions apply --by=headless` then takes the planted answer","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/counters.ts:466: A step-done row whose free-text `scope` holds a line break plants a `Recommended:` line in the `decisions compose --loop` Q1, and `decisions apply --by=headless` then takes the planted answer. Done when: `trendLine` never carries a line break from a row field: each `scope` it quotes has every run of whitespace (CR, LF, tab) collapsed to one space before it is written, so `decisions compose --loop` writes Q1's question and reason as single lines and `parseDecisionItems` reads Q1's `Recommended` as the engine chose it.","source":".bkit/core/engine/commands/workflow/counters.ts:466"}
+{"schema":3,"ts":1794528596573,"firstTs":1794528596573,"updates":1,"kind":"deferral","key":"912-debug-loop-question-challenge-low-bkit-core-engine-ledgers-status-ts-350","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["912-debug-loop-question"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A hand-appended CI `test-run` row can claim any positive failure count, and `ciRoundMatches`, `steps finish` and the completeness check accept it, because the count is the one evidence field never bound to the saved selection","description":"LOW build challenge finding at .bkit/core/engine/ledgers/status.ts:350: A hand-appended CI `test-run` row can claim any positive failure count, and `ciRoundMatches`, `steps finish` and the completeness check accept it, because the count is the one evidence field never bound to the saved selection. Done when: `ciRoundMatches` also requires the row's `failures` to be `null` or equal to the selection's `failedJobCount`, so a CI round can record only the count `runs locate` saved, or no count; `steps finish`, which already requires `--failures` to equal the row, then accepts only the selection's own count.","source":".bkit/core/engine/ledgers/status.ts:350"}
