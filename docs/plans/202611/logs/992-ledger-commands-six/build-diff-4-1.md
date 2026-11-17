diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 2b68f156e..01f1cd8b8 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -1875,6 +1875,12 @@ export function appendLedgerRows(
             options.checkpoint?.("receipted");
             return result(intent, intent.block, true);
           }
+          // A rebase can move the landed block behind upstream rows; the whole block anywhere counts as landed.
+          if (have.indexOf(want) !== -1) {
+            receipt(intent);
+            options.checkpoint?.("receipted");
+            return result(intent, intent.block, true);
+          }
           // Whole lines decide "landed": rows share a byte prefix (`{"schema":3,"ts":...`), so a
           // foreign row is told apart by being a complete line that differs from ours.
           // Compare by content, without the newline and without one leading separator newline:
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index fc8c64d77..fb2192d2e 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -1047,6 +1047,36 @@ describe("replay-safe ledger appends on real files", () => {
     expect(fs.readFileSync(file, "utf-8")).toBe(bytes);
     expect(pendingLedgerIntents(ledgerOperationsFile(root)!, "docs/failures.jsonl")).toEqual([]);
   });
+
+  it("receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again", () => {
+    const root = bookRoot();
+    const file = path.join(root, "docs", "failures.jsonl");
+    const request = [failureRow({ key: "landed-then-moved" })];
+    expect(() =>
+      appendLedgerRows(root, "failures", request, undefined, {
+        operation: "op-moved",
+        checkpoint: failAt("written"),
+      }),
+    ).toThrow();
+    const landed = fs.readFileSync(file, "utf-8");
+    expect(landed).toContain("landed-then-moved");
+
+    // A merge=union rebase puts one complete upstream row line ahead of the landed bytes.
+    const other = bookRoot();
+    appendLedgerRows(other, "failures", [failureRow({ key: "upstream-row" })]);
+    const foreign = fs.readFileSync(path.join(other, "docs", "failures.jsonl"), "utf-8");
+    expect(foreign.endsWith("\n")).toBe(true);
+    fs.writeFileSync(file, `${foreign}${landed}`);
+    const before = fs.readFileSync(file, "utf-8");
+
+    const replay = appendLedgerRows(root, "failures", request, undefined, {
+      operation: "op-moved",
+    });
+    expect(replay.appended).toBe(0);
+    expect(replay.receipt).toMatchObject({ operation: "op-moved", replayed: true });
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+    expect(rows(file).map((r) => r["key"])).toEqual(["upstream-row", "landed-then-moved"]);
+  });
 });
 
 describe("persistent CI handoff on a real local remote", () => {
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index e88378b78..1c2125e19 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -268,3 +268,4 @@
 {"schema":3,"ts":1794886850180,"kind":"friction","key":"code-step-stale-dist/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1011-rules-ship-project","#1011"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code subagent left dist/ stale, so the step commit was refused once","description":"@bkit-build-plan-tasks changed .bkit/core/engine/checks/tips/detect.ts and catalogue.ts for group 3 without running pnpm build. steps finish exited 8 because the pre-commit hook's bkit:check:dist printed '[bkit] dist/ is stale — run pnpm build and commit the result'. The orchestrator ran pnpm build and re-ran the block, which committed.","remediation":"Have the code subagent's prompt or brief name pnpm build as a required last action whenever it edits engine sources in the bkit repo.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794917851130,"kind":"friction","key":"code-step-stale-dist/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["992-ledger-commands-six","#992"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code subagent left dist/ stale, so the step commit was refused once","description":"@bkit-build-plan-tasks changed .bkit/core/engine/commands/workflow/ledgers.ts and .bkit/core/engine/ledgers/status.ts for group 1 without running pnpm build. steps finish exited 8 because the pre-commit hook's bkit:check:dist printed '[bkit] dist/ is stale — run pnpm build and commit the result'. The orchestrator ran pnpm build, staged dist/ and re-ran the block, which committed. The same subagent also left a 'bkit tests changed --fallback=bkit:gate:static' run going in the background with no output after about six minutes.","remediation":"Have the code subagent's prompt or brief name pnpm build as a required last action whenever it edits engine sources in the bkit repo.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794922842976,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":30,"lastConfirmed":1794922842976}
+{"schema":3,"ts":1794950630698,"kind":"friction","key":"code-step-stale-dist/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["992-ledger-commands-six","#992"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code subagent left dist/ stale again, so the group 4 step commit was refused once","description":"@bkit-build-plan-tasks changed .bkit/core/engine/commands/workflow/ledgers.ts for group 4 without running pnpm build. steps finish exited 8 because the pre-commit hook printed '[bkit] dist/ is stale — run pnpm build and commit the result'. The orchestrator ran pnpm build, staged dist/ and re-ran the block. The same subagent's log also first lacked its '<!-- verdict:end -->' line (steps finish exit 6) and needed one header re-ask.","remediation":"Have the code subagent's prompt or brief name pnpm build as a required last action whenever it edits engine sources in the bkit repo.","source":"orchestrator","status":"OPEN"}
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 15019fc50..37a70cc9c 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -1512,6 +1512,12 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                         options.checkpoint?.("receipted");
                         return result(intent, intent.block, true);
                     }
+                    // A rebase can move the landed block behind upstream rows; the whole block anywhere counts as landed.
+                    if (have.indexOf(want) !== -1) {
+                        receipt(intent);
+                        options.checkpoint?.("receipted");
+                        return result(intent, intent.block, true);
+                    }
                     // Whole lines decide "landed": rows share a byte prefix (`{"schema":3,"ts":...`), so a
                     // foreign row is told apart by being a complete line that differs from ours.
                     // Compare by content, without the newline and without one leading separator newline:
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 3a6cc5987..b6bd07efe 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -475,3 +475,4 @@
 {"schema":3,"ts":1794890833848,"firstTs":1794614634378,"updates":2,"kind":"deferral","key":"887-idea-md-template","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["887","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope","887-idea-md-free-form-no-template"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"A template for docs/idea.md and a docs/idea.md for bkit itself","description":"Closed: the owner signed off that this work is not to be done. `docs/idea.md` stays free-form with no template (decision 887-idea-md-free-form-no-template). Original finding: docs/idea.md stays free-form with no template and bkit has none of its own, per the owner's decision on the issue.","source":"phase","status":"CLOSED"}
 {"schema":3,"ts":1794890833849,"firstTs":1794614634381,"updates":2,"kind":"deferral","key":"887-starter-vendor-content","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["887",".agents/rules.md","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"Vendor-specific starter content","description":"Closed: the owner signed off that this work is not to be done. The stack-independence rule in `.agents/rules.md` forbids the work. Original finding: Starters stay stack-agnostic and vendor names stay marked as examples, per the stack-agnostic rule in .agents/rules.md.","source":"phase","status":"CLOSED"}
 {"schema":3,"ts":1794890939718,"firstTs":1794353585868,"updates":3,"kind":"deferral","key":"803-cursor-codex-cloud-fingerprint-compare","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["#803","docs/plans/202611/803-close-codex-opencode-plan.md § Open Questions & Assumptions (Open Question 2)",".bkit/core/engine/install/cloud-env.ts renderWidenedNetworkList","803-cursor-codex-allowlist-check-follows-claude","https://github.com/cbartens/bkit/issues/803"],"type":"feature","category":"observability","severity":"LOW","reason":"needs-decision","summary":"Cursor and Codex cloud setup scripts do not compare an allowlist fingerprint","description":"Decided by the owner (decision 803-cursor-codex-allowlist-check-follows-claude): Cursor and Codex cloud get the same check, after issue 803 ships. Original finding: #803 adds the fingerprint compare to the Claude cloud SessionStart bootstrap only. The Cursor and Codex cloud docs say their dashboard allowlist is an operator assertion and unverified, and keep the derived-set stamp, but no Cursor or Codex setup script warns when the pasted list and the repo diverge. Plan Open Question 2 recommends docs only; option B adds the compare to both setup-script renders.","remediation":"The Claude check exists since issue 803 landed (`.bkit/core/engine/install/cloud-env.ts`, the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` comparison), so this is due now: add the same stale allowed-hosts check for the Cursor and Codex cloud setups, whose paste lists carry the fingerprint and compare nothing.","status":"TRIAGED"}
+{"schema":3,"ts":1794949675524,"firstTs":1794949675524,"updates":1,"kind":"deferral","key":"992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["992-ledger-commands-six"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A lock file that an older bkit already committed, and that the owner then deletes, never has its deletion committed: the new exclude also drops the `--cached` entry, so every fresh checkout brings the stale lock back and blocks appends to that target","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1273: A lock file that an older bkit already committed, and that the owner then deletes, never has its deletion committed: the new exclude also drops the `--cached` entry, so every fresh checkout brings the stale lock back and blocks appends to that target. Done when: `commitBookkeeping` still never stages an untracked `*.bkit-lock` file or a change to a tracked one, but it does stage and commit the deletion of a tracked `*.bkit-lock` under the book pathspecs that is gone from the worktree (for example, a separate `git ls-files --deleted` listing of lock paths, joined to `paths`); the existing test \"a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit\" still passes","source":".bkit/core/engine/commands/workflow/ledgers.ts:1273"}
