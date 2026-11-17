diff --git a/.bkit/core/.bkit/trackers.md b/.bkit/core/.bkit/trackers.md
index 8e9b83958..02bdfd9ef 100644
--- a/.bkit/core/.bkit/trackers.md
+++ b/.bkit/core/.bkit/trackers.md
@@ -24,7 +24,20 @@ The engine may append routine reports to its own eligible progress comment. Owne
 
 The optional progress cache and run association live under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing this state starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
 
-Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable. Provider capacity limits remain conservative until a disposable, explicitly authorized live probe verifies them.
+Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable.
+
+### Verified provider contracts
+
+Live contract evidence version 1 verified the following boundaries through the production transports. Every selected body budget counts the complete Markdown source in UTF-16 code units, including markers and part labels. These budgets are conservative delivery ceilings, rather than promises of each provider's maximum.
+
+<!-- prettier-ignore -->
+| Provider | Selected body budget | Observed counting boundary | Inspection and edit contract |
+| --- | --- | --- | --- |
+| GitHub | 65,536 | 262,144 UTF-8 body bytes accepted; the next byte rejected for ASCII and non-BMP text. | REST create/edit and GraphQL read agree on numeric comment/author IDs, timestamps and Markdown fingerprints. `last`/`before` pagination retains newest-created order after an older edit. |
+| Linear | 100,000 | 100,000 Unicode scalars accepted; the next scalar rejected for ASCII and non-BMP text. UTF-16 counting stays conservative. | GraphQL create/edit/read return stable comment/user IDs, timestamps and Markdown fingerprints. Cursor pages are sorted by creation time before selecting the newest comments. |
+| Jira Rovo | 32,767 | The selected ASCII/non-BMP payloads pass. Markdown-to-ADF conversion changes the raw-source boundary; larger payloads can fail with `CONTENT_LIMIT_EXCEEDED`. No universal raw-source maximum is claimed. | Deployed tool schemas accept ID-based edits and `responseContentFormat: markdown`, `view: evidence`, creation ordering and offset pagination. Require returned Markdown format, stable author/comment IDs and matching fingerprints before editing. |
+
+All three preserve the generated h6 marker on the tested bodies. Repeated reads remain stable, an external edit starts fresh progress, and a terminal report creates a separate comment. Discarded acknowledgments can be recognized by bounded reads; inconclusive recognition tries a new comment and can duplicate an accepted report. Exhausted writes produce real best-effort friction and allow later reporting to continue. These probes do not establish universal notification silence: GitHub and Linear subscriber settings and Jira project notification schemes still apply.
 
 ## Marker contract
 
diff --git a/.bkit/core/engine/commands/workflow/tracker.ts b/.bkit/core/engine/commands/workflow/tracker.ts
index 5088b4287..54b9704fb 100644
--- a/.bkit/core/engine/commands/workflow/tracker.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.ts
@@ -27,9 +27,22 @@ import { git, parseJson, runGh, type FlagSpec, type GhResult, type RunContext }
 import { issueIdOf, readIssueTracker } from "./fids.js";
 import { acquirePublicationLock, readRunsLenient, releasePublicationLock } from "./locks.js";
 
-/** Jira Cloud's comment limit; longer bodies post as consecutive parts. */
+/** Conservative full Markdown UTF-16 budget, including markers and part labels. */
 export const JIRA_COMMENT_LIMIT = 32_767;
 
+/**
+ * Live contract evidence v1 (2026-11-05): GitHub accepts 262,144 UTF-8 body bytes
+ * and rejects the next byte; Linear accepts 100,000 Unicode scalars and rejects
+ * the next scalar. Jira's Markdown conversion makes its raw boundary dependent
+ * on formatting; both ASCII and non-BMP payloads pass at this safe UTF-16 budget.
+ * Keep the selected budgets conservative, rather than promising provider maxima.
+ */
+const COMMENT_BODY_BUDGETS = {
+  github: 65_536,
+  linear: 100_000,
+  jira: JIRA_COMMENT_LIMIT,
+} as const;
+
 export const JIRA_MCP_URL = "https://mcp.atlassian.com/v2/mcp";
 export const LINEAR_API_URL = "https://api.linear.app/graphql";
 
@@ -578,7 +591,11 @@ export async function postComment(
 ): Promise<PostedComment> {
   if (t.issue === null) throw new TrackerError("not-found", "no issue");
   const limit =
-    t.tracker === "linear" ? 100_000 : t.tracker === "github" ? 65_536 : JIRA_COMMENT_LIMIT;
+    t.tracker === "linear"
+      ? COMMENT_BODY_BUDGETS.linear
+      : t.tracker === "github"
+        ? COMMENT_BODY_BUDGETS.github
+        : COMMENT_BODY_BUDGETS.jira;
   if (!opts.commentId && t.tracker !== "jira" && body.length > limit) {
     const parts = splitAt(body, limit, { compact: true });
     let last: PostedComment | undefined;
@@ -1748,10 +1765,10 @@ export async function postCommentOnce(
                   outgoing = `${cached.source}\n\n${rendered.source.split("\n").slice(2).join("\n")}`;
                   const limit =
                     t.tracker === "linear"
-                      ? 100_000
+                      ? COMMENT_BODY_BUDGETS.linear
                       : t.tracker === "jira"
-                        ? JIRA_COMMENT_LIMIT
-                        : 65_536;
+                        ? COMMENT_BODY_BUDGETS.jira
+                        : COMMENT_BODY_BUDGETS.github;
                   if (outgoing.length <= limit) aggregate = true;
                   else outgoing = body;
                 } else outgoing = body;
diff --git a/.bkit/trackers.md b/.bkit/trackers.md
index 926abfb99..b095cff0c 100644
--- a/.bkit/trackers.md
+++ b/.bkit/trackers.md
@@ -24,7 +24,20 @@ The engine may append routine reports to its own eligible progress comment. Owne
 
 The optional progress cache and run association live under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing this state starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
 
-Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable. Provider capacity limits remain conservative until a disposable, explicitly authorized live probe verifies them.
+Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable.
+
+### Verified provider contracts
+
+Live contract evidence version 1 verified the following boundaries through the production transports. Every selected body budget counts the complete Markdown source in UTF-16 code units, including markers and part labels. These budgets are conservative delivery ceilings, rather than promises of each provider's maximum.
+
+<!-- prettier-ignore -->
+| Provider | Selected body budget | Observed counting boundary | Inspection and edit contract |
+| --- | --- | --- | --- |
+| GitHub | 65,536 | 262,144 UTF-8 body bytes accepted; the next byte rejected for ASCII and non-BMP text. | REST create/edit and GraphQL read agree on numeric comment/author IDs, timestamps and Markdown fingerprints. `last`/`before` pagination retains newest-created order after an older edit. |
+| Linear | 100,000 | 100,000 Unicode scalars accepted; the next scalar rejected for ASCII and non-BMP text. UTF-16 counting stays conservative. | GraphQL create/edit/read return stable comment/user IDs, timestamps and Markdown fingerprints. Cursor pages are sorted by creation time before selecting the newest comments. |
+| Jira Rovo | 32,767 | The selected ASCII/non-BMP payloads pass. Markdown-to-ADF conversion changes the raw-source boundary; larger payloads can fail with `CONTENT_LIMIT_EXCEEDED`. No universal raw-source maximum is claimed. | Deployed tool schemas accept ID-based edits and `responseContentFormat: markdown`, `view: evidence`, creation ordering and offset pagination. Require returned Markdown format, stable author/comment IDs and matching fingerprints before editing. |
+
+All three preserve the generated h6 marker on the tested bodies. Repeated reads remain stable, an external edit starts fresh progress, and a terminal report creates a separate comment. Discarded acknowledgments can be recognized by bounded reads; inconclusive recognition tries a new comment and can duplicate an accepted report. Exhausted writes produce real best-effort friction and allow later reporting to continue. These probes do not establish universal notification silence: GitHub and Linear subscriber settings and Jira project notification schemes still apply.
 
 ## Marker contract
 
diff --git a/.bkit/version b/.bkit/version
index 04d9868be..0e4afa71d 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -223,7 +223,7 @@
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
     ".bkit/providers.md": "556318e0b5573604d0d56acfa315af47ea45c26a71e2e59600514d2cb3c431fc",
     ".bkit/prompts.md": "5c584b31cb1349e80e073b44ee9ab497fbc316ed75ffbca4a58dac787e34b49b",
-    ".bkit/trackers.md": "6ef72e73d1aaac217dcbacc1b8a3d26754bc4df8377de6564d52a9a763db1616",
+    ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
     ".bkit/workflows.md": "c1ea2895be374e33798804c3e6b7e428f38060a8b1829c7ab08d35cd5261bc79",
     ".bkit/README.md": "30c3136159e0a5e8a1fa49c88de861147db7c63914fd319c52e1e7ea87437b25",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
diff --git a/dist/commands/workflow/tracker.js b/dist/commands/workflow/tracker.js
index 347d8f97c..1d27dbda2 100644
--- a/dist/commands/workflow/tracker.js
+++ b/dist/commands/workflow/tracker.js
@@ -16,8 +16,20 @@ import { readBkitConfig } from "../../shared/settings.js";
 import { git, parseJson, runGh } from "../lib.js";
 import { issueIdOf, readIssueTracker } from "./fids.js";
 import { acquirePublicationLock, readRunsLenient, releasePublicationLock } from "./locks.js";
-/** Jira Cloud's comment limit; longer bodies post as consecutive parts. */
+/** Conservative full Markdown UTF-16 budget, including markers and part labels. */
 export const JIRA_COMMENT_LIMIT = 32_767;
+/**
+ * Live contract evidence v1 (2026-11-05): GitHub accepts 262,144 UTF-8 body bytes
+ * and rejects the next byte; Linear accepts 100,000 Unicode scalars and rejects
+ * the next scalar. Jira's Markdown conversion makes its raw boundary dependent
+ * on formatting; both ASCII and non-BMP payloads pass at this safe UTF-16 budget.
+ * Keep the selected budgets conservative, rather than promising provider maxima.
+ */
+const COMMENT_BODY_BUDGETS = {
+    github: 65_536,
+    linear: 100_000,
+    jira: JIRA_COMMENT_LIMIT,
+};
 export const JIRA_MCP_URL = "https://mcp.atlassian.com/v2/mcp";
 export const LINEAR_API_URL = "https://api.linear.app/graphql";
 /** Rovo MCP tools the engine calls; `.bkit/trackers.md` names each. */
@@ -463,7 +475,11 @@ function commentEvidence(raw) {
 export async function postComment(t, body, opts = {}) {
     if (t.issue === null)
         throw new TrackerError("not-found", "no issue");
-    const limit = t.tracker === "linear" ? 100_000 : t.tracker === "github" ? 65_536 : JIRA_COMMENT_LIMIT;
+    const limit = t.tracker === "linear"
+        ? COMMENT_BODY_BUDGETS.linear
+        : t.tracker === "github"
+            ? COMMENT_BODY_BUDGETS.github
+            : COMMENT_BODY_BUDGETS.jira;
     if (!opts.commentId && t.tracker !== "jira" && body.length > limit) {
         const parts = splitAt(body, limit, { compact: true });
         let last;
@@ -1432,10 +1448,10 @@ export async function postCommentOnce(t, body, o) {
                                         };
                                     outgoing = `${cached.source}\n\n${rendered.source.split("\n").slice(2).join("\n")}`;
                                     const limit = t.tracker === "linear"
-                                        ? 100_000
+                                        ? COMMENT_BODY_BUDGETS.linear
                                         : t.tracker === "jira"
-                                            ? JIRA_COMMENT_LIMIT
-                                            : 65_536;
+                                            ? COMMENT_BODY_BUDGETS.jira
+                                            : COMMENT_BODY_BUDGETS.github;
                                     if (outgoing.length <= limit)
                                         aggregate = true;
                                     else
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index d03203976..0a0db9cf5 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -291,3 +291,4 @@
 {"schema":3,"ts":1793876802687,"firstTs":1793865220191,"updates":5,"kind":"failure","key":"tracker-new-comment-budget-shell-observation-flake","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.test.ts","tmp/bkit-826-remediate-changed.log","tmp/bkit-826-remediate-3-2-changed.log",".git/bkit-outbox/826-append-routine-workflow/build-plan-gaps-remediate-3-2-gate.log","tmp/bkit-826-spawn-trace.jsonl","tmp/bkit-826-remediate-3-3-spawn-probe.log","tmp/bkit-826-remediate-3-3-executable-probe.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker 200ms delivery test intermittently expires before its shell stub is observed","description":"The unchanged isolated test reproduced ENOENT under observation-only tracing. Actual synchronous gh POST calls received a 199ms timeout, acquired PIDs and returned ETIMEDOUT/SIGKILL around 202ms. A paired 200ms probe observed no first line on direct fresh-script launch, but observed its first line via /bin/sh.","rootCause":"The fresh-executable first-line observation is invalid as proof of attempted POST on this host: direct script startup exceeds the small budget before executing shell text. Actual POST dispatch is established by spawnSync tracing; no product deadline violation is evidenced.","remediation":"Requires owner authorization for the tests step to adapt the frozen fixture to the existing stable dispatcher or explicit interpreter while preserving the 200ms budget and every POST/count/cleanup/nonfatal/latency assertion. Product code and planned blocks remain unchanged.","status":"OPEN"}
 {"schema":3,"ts":1793877457119,"firstTs":1793868293810,"updates":3,"kind":"failure","key":"catalog-progress-authority-render-concurrency-timeout","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/audits/workflows/catalog-parity.test.ts","tmp/bkit-826-remediate-targeted.log","tmp/bkit-826-remediate-changed.log","tmp/bkit-826-remediate-3-3-render-green.log",".git/bkit-outbox/826-append-routine-workflow/build-plan-gaps-remediate-3-3-gate.log"],"category":"testing","severity":"MEDIUM","summary":"Progress authority catalog rendering times out under concurrent changed tests","description":"The later gate reproduced all three frozen catalog cases exceeding a 5700ms per-case budget while each rebuilt the same 120 variants. The corrected file prepares one immutable matrix in beforeAll and retains every variant, planned test block, assertion and timeout. All eight file cases passed both targeted and full-coverage runs; the latter completed the whole file in 7178ms.","rootCause":"Each independent assertion case repeated identical source substitution and host transformations rather than reusing immutable fixture data.","remediation":"Share and freeze the complete file-local render matrix in beforeAll and assert reuse and immutability in a separate regression case. No production cache or test configuration changes.","status":"CLOSED"}
 {"schema":3,"ts":1793877522077,"firstTs":1793865220191,"updates":6,"kind":"failure","key":"tracker-new-comment-budget-shell-observation-flake","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.test.ts","tmp/bkit-826-remediate-changed.log","tmp/bkit-826-remediate-3-2-changed.log",".git/bkit-outbox/826-append-routine-workflow/build-plan-gaps-remediate-3-2-gate.log","tmp/bkit-826-spawn-trace.jsonl","tmp/bkit-826-remediate-3-3-spawn-probe.log","tmp/bkit-826-remediate-3-3-executable-probe.log","tmp/bkit-826-remediate-3-3-changed.log",".git/bkit-outbox/826-append-routine-workflow/build-plan-gaps-remediate-3-3-gate.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker 200ms delivery test intermittently expires before its shell stub is observed","description":"The unchanged isolated test reproduced ENOENT under observation-only tracing. Actual synchronous gh POST calls received a 199ms timeout, acquired PIDs and returned ETIMEDOUT/SIGKILL around 202ms. A paired 200ms probe observed no first line on direct fresh-script launch, but observed its first line via /bin/sh. After the catalog fixture fix, the single full gate passed static checks and 7325 unit cases with two skips; this observation was its sole failure. Tracing also shows the unasserted priming POST timed out, so append state was never established and this run cannot prove append-to-create fallback. No test execution was repeated for luck.","rootCause":"The fresh-executable first-line observation is invalid as proof of attempted POST on this host: direct script startup exceeds the small budget before executing shell text. Actual POST dispatch is established by spawnSync tracing; no product deadline violation is evidenced.","remediation":"Requires owner authorization for the tests step to adapt the frozen fixture to the existing stable dispatcher or explicit interpreter while preserving the 200ms budget and every POST/count/cleanup/nonfatal/latency assertion. Product code and planned blocks remain unchanged.","status":"OPEN"}
+{"schema":3,"ts":1793916409545,"firstTs":1793865220191,"updates":7,"kind":"failure","key":"tracker-new-comment-budget-shell-observation-flake","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.test.ts","tmp/bkit-826-remediate-changed.log","tmp/bkit-826-remediate-3-2-changed.log",".git/bkit-outbox/826-append-routine-workflow/build-plan-gaps-remediate-3-2-gate.log","tmp/bkit-826-spawn-trace.jsonl","tmp/bkit-826-remediate-3-3-spawn-probe.log","tmp/bkit-826-remediate-3-3-executable-probe.log","tmp/bkit-826-remediate-3-3-changed.log",".git/bkit-outbox/826-append-routine-workflow/build-plan-gaps-remediate-3-3-gate.log","5a9d73742","docs/plans/202611/logs/826-append-routine-workflow/build-tests-red-3-2.md","docs/plans/202611/logs/826-append-routine-workflow/build-group-gate-3-5.md","tmp/bkit-826-group4-unit.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker 200ms delivery test intermittently expires before its shell stub is observed","description":"The owner-authorized tests-step repair reuses the stable dispatcher and /bin/sh for the non-executable body, asserts successful priming, and retains all 11 original assertions plus both 200ms budgets. Full static/unit verification passed 7326 tests with two skips, Bats 40 and awake 20. Final tracker acceptance passed 99/99 after evidence-backed metadata synchronization.","rootCause":"A fresh executable could time out before its first shell line, and unasserted priming could fail before the slow delivery. Stable interpreted fixture execution removes the invalid observation; no production deadline defect was established.","remediation":"Resolved by the authorized fixture repair in 5a9d73742; all product deadlines, counts, cleanup, nonfatal and latency assertions remain intact.","status":"CLOSED"}
