diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index 7df64f77f..d077d26c4 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -150,9 +150,9 @@ These blocks have the same name and the same shape on `outcome` and `run`:
 | `counter` | `run:{parentSha}`, `counter:{name, value:number, source:"model-self-report"\|"shell-bus"}`. |
 | `outcome` | `run:{parentSha, pr?}` (`pr` ship-only), `time` (`null` = no start row), `ending:"done"\|"close-failed"\|"held"` (`close-failed` = work done, its close's CI never started; `held` = a local build that published nothing), `publish?:boolean` (a build's resolved publish value; `false` with `held`), `lines?\|null`, `steps?`, `ci?`, `ledgers:{deferrals:{repo,added?}, failures:{repo,added?}, friction:{added?}}` (`repo` = the repo's distinct folded entries at close, not lines; `added` = distinct keys this run added — rows of `by.workflow` at or after its start; absent when the start is unknown), `plan?` (plan / build / ship), `build?` (build), `context?:{host:"claude-code", byAgent:{<agent type>:{peak, runs}}}` (the run's subagents per agent type: `runs` = subagents with a model call in the run, `peak` = largest input + cache write + cache read tokens of one model call in the run; read at close from the subagent transcripts of the closing Claude chat and of every chat the run's `session` status rows name, each call counted when its own timestamp falls between the run's start and the close; absent on other hosts or with no data; `bkit stats` judges peaks against 160,000 tokens), `ship?:{coverage?:{unit?,integration?,e2e?}}` (each `{lines,branches,functions,statements}` %; a tier absent when its coverage report is not produced). The close's CI dispatch re-appends it: dispatch added to `ci`, `ending` `close-failed` when CI never started; newer row supersedes (§ Identity / Dedup). |
 | `compliance` | `run:{parentSha}`, `rule:{id, verdict:"pass"\|"fail"\|"n/a", evidence?}` (`evidence` on fail rows). |
-| `friction` | `key`, `category` (§ Categories), `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (see § Updating a Row), `confidence?:number`, `lastConfirmed?:number`, `recurrenceCount?:number`. |
-| `deferral` | `key`, `type:"issue"\|"feature"`, `category` (§ Categories), `severity`, `reason` (§ Deferral Reason), `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?`. |
-| `failure` | `key`, `category?` (§ Categories; `"testing"` = flaky / intermittent test), `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?`. |
+| `friction` | `key`, `category` (§ Categories), `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (default `OPEN` on append; see § Updating a Row), `confidence?:number`, `lastConfirmed?:number`, `recurrenceCount?:number`. |
+| `deferral` | `key`, `type:"issue"\|"feature"`, `category` (§ Categories), `severity`, `reason` (§ Deferral Reason), `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?` (default `OPEN` on append). |
+| `failure` | `key`, `category?` (§ Categories; `"testing"` = flaky / intermittent test), `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (default `OPEN` on append). |
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Antigravity, Cursor); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
@@ -344,6 +344,8 @@ To update a row, copy the prior row, change what changed, and append it. Through
 
 **`TRIAGED` is still open work.** Open-entry counts (the audit debt lens, the age report) test `status != "CLOSED"`. Only `CLOSED` is done.
 
+`bkit ledgers append` writes `status: "OPEN"` on a `friction` / `deferral` / `failure` row that gives none; a given `status` is kept.
+
 The ladder is not used on `knowledge` or `decision`: both use `ACTIVE` / `SUPERSEDED`. An absent `status` = `ACTIVE`.
 
 **Readers** of either ledger: Fold by `key`, with the highest `ts` winning. Read only the winning rows whose `status` is `ACTIVE` or absent, and never read any other rows.
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 272c7912f..e8db05ae7 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1422,6 +1422,59 @@ describe("bkit ledgers append", () => {
       expect(row).not.toHaveProperty("updates");
     }
   });
+
+  it("append writes status OPEN on a friction row given none", async () => {
+    const r = repo();
+    const friction = {
+      kind: "friction",
+      by: { workflow: "ship", step: "ship-close-gate" },
+      key: "f-open",
+      summary: "s",
+      severity: "LOW",
+    };
+    expect((await append(r, "friction", [friction])).code).toBe(0);
+    expect(lines(r, ".bkit/friction.jsonl")[0]).toMatchObject({ status: "OPEN" });
+  });
+
+  it("append writes status OPEN on a deferral row given none", async () => {
+    const r = repo();
+    const deferral = {
+      kind: "deferral",
+      key: "701-deferred-guard",
+      by: { workflow: "build", step: "build-close-workflow" },
+      references: ["701", "src/a.ts"],
+      type: "issue",
+      category: "correctness",
+      severity: "MEDIUM",
+      reason: "scope-declared",
+      summary: "guard a call",
+      description: "the call is unguarded",
+      remediation: "Add the check in src/a.ts beside the guard, then a test in src/a.test.ts.",
+    };
+    const res = await append(r, "deferrals", [deferral]);
+    expect(res.code).toBe(0);
+    expect(lines(r, "docs/deferrals.jsonl")[0]).toMatchObject({ status: "OPEN" });
+  });
+
+  it("append writes status OPEN on a failure row given none", async () => {
+    const r = repo();
+    const { status: _status, ...noStatus } = failure();
+    expect((await append(r, "failures", [noStatus])).code).toBe(0);
+    expect(lines(r, "docs/failures.jsonl")[0]).toMatchObject({ status: "OPEN" });
+  });
+
+  it("append keeps a given status next to a defaulted one", async () => {
+    const r = repo();
+    const { status: _status, ...noStatus } = failure({ key: "no-status" });
+    const res = await append(r, "failures", [
+      failure({ key: "given", status: "TRIAGED" }),
+      noStatus,
+    ]);
+    expect(res.code).toBe(0);
+    const [given, defaulted] = lines(r, "docs/failures.jsonl");
+    expect(given).toMatchObject({ key: "given", status: "TRIAGED" });
+    expect(defaulted).toMatchObject({ key: "no-status", status: "OPEN" });
+  });
 });
 
 describe("bkit ledgers compact", () => {
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 01f1cd8b8..84973564b 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -26,6 +26,7 @@ import {
   queryLedger,
   mintTs,
   resolveRepoSlug,
+  SEVERITY_KINDS,
   validate,
   withLineage,
   writerProblem,
@@ -1794,6 +1795,8 @@ export function appendLedgerRows(
       const row: Record<string, unknown> = {};
       for (const k of TOP_ORDER) if (filled[k] !== undefined) row[k] = filled[k];
       for (const [k, v] of Object.entries(filled)) if (!(k in row)) row[k] = v;
+      if (row["status"] === undefined && SEVERITY_KINDS.has(String(row["kind"])))
+        row["status"] = "OPEN";
       const v = validate(row);
       if (!v.ok) throw reject(v.reason ?? "invalid", i + 1);
       const who = writerProblem(row);
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index f29ab7700..0288cf082 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -150,9 +150,9 @@ These blocks have the same name and the same shape on `outcome` and `run`:
 | `counter` | `run:{parentSha}`, `counter:{name, value:number, source:"model-self-report"\|"shell-bus"}`. |
 | `outcome` | `run:{parentSha, pr?}` (`pr` ship-only), `time` (`null` = no start row), `ending:"done"\|"close-failed"\|"held"` (`close-failed` = work done, its close's CI never started; `held` = a local build that published nothing), `publish?:boolean` (a build's resolved publish value; `false` with `held`), `lines?\|null`, `steps?`, `ci?`, `ledgers:{deferrals:{repo,added?}, failures:{repo,added?}, friction:{added?}}` (`repo` = the repo's distinct folded entries at close, not lines; `added` = distinct keys this run added — rows of `by.workflow` at or after its start; absent when the start is unknown), `plan?` (plan / build / ship), `build?` (build), `context?:{host:"claude-code", byAgent:{<agent type>:{peak, runs}}}` (the run's subagents per agent type: `runs` = subagents with a model call in the run, `peak` = largest input + cache write + cache read tokens of one model call in the run; read at close from the subagent transcripts of the closing Claude chat and of every chat the run's `session` status rows name, each call counted when its own timestamp falls between the run's start and the close; absent on other hosts or with no data; `bkit stats` judges peaks against 160,000 tokens), `ship?:{coverage?:{unit?,integration?,e2e?}}` (each `{lines,branches,functions,statements}` %; a tier absent when its coverage report is not produced). The close's CI dispatch re-appends it: dispatch added to `ci`, `ending` `close-failed` when CI never started; newer row supersedes (§ Identity / Dedup). |
 | `compliance` | `run:{parentSha}`, `rule:{id, verdict:"pass"\|"fail"\|"n/a", evidence?}` (`evidence` on fail rows). |
-| `friction` | `key`, `category` (§ Categories), `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (see § Updating a Row), `confidence?:number`, `lastConfirmed?:number`, `recurrenceCount?:number`. |
-| `deferral` | `key`, `type:"issue"\|"feature"`, `category` (§ Categories), `severity`, `reason` (§ Deferral Reason), `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?`. |
-| `failure` | `key`, `category?` (§ Categories; `"testing"` = flaky / intermittent test), `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?`. |
+| `friction` | `key`, `category` (§ Categories), `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (default `OPEN` on append; see § Updating a Row), `confidence?:number`, `lastConfirmed?:number`, `recurrenceCount?:number`. |
+| `deferral` | `key`, `type:"issue"\|"feature"`, `category` (§ Categories), `severity`, `reason` (§ Deferral Reason), `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?` (default `OPEN` on append). |
+| `failure` | `key`, `category?` (§ Categories; `"testing"` = flaky / intermittent test), `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (default `OPEN` on append). |
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Antigravity, Cursor); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
@@ -344,6 +344,8 @@ To update a row, copy the prior row, change what changed, and append it. Through
 
 **`TRIAGED` is still open work.** Open-entry counts (the audit debt lens, the age report) test `status != "CLOSED"`. Only `CLOSED` is done.
 
+`bkit ledgers append` writes `status: "OPEN"` on a `friction` / `deferral` / `failure` row that gives none; a given `status` is kept.
+
 The ladder is not used on `knowledge` or `decision`: both use `ACTIVE` / `SUPERSEDED`. An absent `status` = `ACTIVE`.
 
 **Readers** of either ledger: Fold by `key`, with the highest `ts` winning. Read only the winning rows whose `status` is `ACTIVE` or absent, and never read any other rows.
diff --git a/.bkit/version b/.bkit/version
index fbe7f2afc..3996bb507 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -210,7 +210,7 @@
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
     ".bkit/install.md": "08d1daa2edba56dc34470d8462418aa5e1d479ac1b5bc596b69debdac025be94",
-    ".bkit/jsonl.md": "4d7671fb6bebda2ac336b7408347fb0174ef76421ba2f21ef453dd04711c4ed2",
+    ".bkit/jsonl.md": "8f90c4ae229846bfda05a51465ab9ec8505da8dfdf9d493bbac533b1dd8b4e00",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "85913cc84a994cd14a6c0948a8f6b63611a776b1be80cf9a902e5cb994add0c2",
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 37a70cc9c..0f6a2b732 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -15,7 +15,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { readBkitVersion } from "../../install/version-file.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
+import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, SEVERITY_KINDS, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
 import { CORRECTION_REJECTED_ROW, CORRECTION_SUCCEEDED_ROW, actionHash, appendHeld, appendLine, correctionScope, ledgerEffect, ledgerIntent, ledgerOperation, ledgerOperationsFile, pendingLedgerIntentsFor, recordLedgerIntent, recordLedgerOperation, statusTimestamp, withTargetLock, writePrepared, } from "../../ledgers/status.js";
 import { CommandError, CorrectionExhausted, EXIT, INVOCATION_FLAG, invocationDir, isIgnoredPath, isSharedBranch, NoWriteRejection, parseJson, UncertainEffect, wholeNumber, } from "../lib.js";
@@ -1447,6 +1447,8 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
             for (const [k, v] of Object.entries(filled))
                 if (!(k in row))
                     row[k] = v;
+            if (row["status"] === undefined && SEVERITY_KINDS.has(String(row["kind"])))
+                row["status"] = "OPEN";
             const v = validate(row);
             if (!v.ok)
                 throw reject(v.reason ?? "invalid", i + 1);
diff --git a/docs/testing.md b/docs/testing.md
index aa3d79203..dbc6b1cf1 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -832,7 +832,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
 | `commands/workflow/issues.test.ts` | Unit | `bkit issues text / labels / comment`: generated drop before the last-marker cut, oldest-first sort; phase vs additive label arithmetic, `merged` clears `bkit:failed`, board payloads from `bkit.tracker.github.project`; comment bodies, defused cut marker, fenced stderr, `--error-file`. Never shells out, because tracker writes stay on MCP. |
 | `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub, stub `gh`) | `bkit runs gate / mirror / wait / dispatch / revalidate / context / declared` — see § Ship merge-gate. Locate: a CI selection keeps the failed job names in `failedJobs`, capstone left out. Gate `--pr` / `--squash-of` heads, title skip token (18), `--snapshot` written before deciding, `--record` refusal / `ship-merge-ci` rows (none while CI is missing or still running), unreadable PR (20); revalidate with no head move, unreadable PR (1), 80, bad `--reason`; auto context BRIEF / CI_DEV (slug refused, 9) / CI (marker, branch fallback, not open 7, no run 8, unknown phase 3, 80); dispatch `--file` / `--step` row + close transport. |
-| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, fills `firstTs` / `updates` from the entry's earlier rows (across calls, within one batch, after compaction; supplied values replaced; none on other kinds), keeps a row's own `repo`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`, a `CLOSED` row stays `Exempt` with no test result and no write, an already-adjudicated `unjustified` row reports `Lazy` (never `Exempt`) and writes nothing on a re-run; a plan with no task blocks exits 1 with the no-markers reason, and a plan whose task blocks do not parse exits 2 naming the line, both writing nothing. `compact`: every keyed ledger by default with per-ledger counts, `--ledger` narrows, `--dry-run` writes nothing, a second run changes nothing, an unknown `--ledger` exits 2. |
+| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, fills `firstTs` / `updates` from the entry's earlier rows (across calls, within one batch, after compaction; supplied values replaced; none on other kinds), keeps a row's own `repo`, writes `status: "OPEN"` on a friction, deferral or failure row that gives none and keeps a given `status`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`, a `CLOSED` row stays `Exempt` with no test result and no write, an already-adjudicated `unjustified` row reports `Lazy` (never `Exempt`) and writes nothing on a re-run; a plan with no task blocks exits 1 with the no-markers reason, and a plan whose task blocks do not parse exits 2 naming the line, both writing nothing. `compact`: every keyed ledger by default with per-ledger counts, `--ledger` narrows, `--dry-run` writes nothing, a second run changes nothing, an unknown `--ledger` exits 2. |
 | `commands/workflow/context.test.ts` | Unit (boundary: real `bash` for blocks, real temp git repos for `diff`) | `bkit context clamp / clamp-log / ledger-scan / diff / brief / list-blocks / run-block / finalise` (`fetch` in `context-fetch.test.ts`): both profiles read against the clamped file, in-place loss markers, ceiling; ranked ledger scan; `diff` writes `{base}...HEAD` without `docs/plans/**` with `--numstat` totals, `--base` narrows to a group's start sha (a `build-group-start` row's `parentSha` via `status route`), unknown base exits 5 and writes nothing, empty range writes a one-line note, past the 10000-line guard a `partial diff coverage` first line + `--stat` + the largest files first cut to 500 lines each, `topFiles` / `totalLines` ceiling, record in the clamp log; `brief` `--next` picks the first group with an open task (none open: nothing written, `group: null`), leaves out a task with a `DONE — TASK N` log line, carries one-line summaries of earlier `DEPENDS ON` tasks, the note file under Deviations, the reds already recorded, the Reuse Inventory rows and Architecture entries naming the open tasks' files (past the 8 KB work cap left out and counted), prints only path / size / group / tasks / `workBytes` / `workCap`, an unknown group exits 2; block parsing by ordinal; fence written byte-for-byte, clamp inside the fence; finalise verdict / contexts / records; `finalise --record` writes + commits the `context-fetch` row and prints the comment (`--file` required). |
 | `commands/workflow/roadmap.test.ts` | Unit (real fixture ledgers, real git remote for `mirror`) | `bkit roadmap fold`: ledger projection, deterministic regenerate, `ABANDONED` hidden, fail-open on malformed / absent ledger and unwritable board, consumer text preserved, notes blocks, `## Shipped` cap, marker self-heal. `feature --strict` (exit 1 when not appended); `feature` fills `firstTs` / `updates` from the same-identity rows. `mirror`: worktree row then the same row committed in a throwaway `origin/dev` checkout and pushed as `dev`, skipped only on `dev`, a refused push never fails the close. |
 | `.bkit/core/engine/ledgers/migrate.test.ts` | Unit | Ledger rows without `schema` rewritten through `normalize` (idempotent; malformed, non-object, blank and schema lines kept byte-for-byte; CRLF and missing final newline kept; an old line whose rewrite the file holds dropped, repeated old lines with none kept); `migrateLedgers` rewrites in place via temp file, dry run counts only, missing ledgers skipped; `isSchemaLedger` covers every ledger. |
