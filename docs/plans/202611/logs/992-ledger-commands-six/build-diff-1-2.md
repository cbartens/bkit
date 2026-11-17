diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index 4b7bc3456..3f6cc981a 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -59,7 +59,7 @@ for name in ["decisions", "knowledge"]:
 
 ## Write Idiom
 
-**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
+**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing when the ledger still holds them, and is refused with the reason when they are gone, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
 
 - **Fills:** `schema: 3`, a minted `ts` per row, `repo` when absent, and `bkit.version` from `.bkit/version`. On `deferral` / `failure` / `knowledge` / `decision` rows, it also fills `firstTs` and `updates` from the entry's earlier rows (§ Compaction), replacing any supplied values.
 - **Checks** every row before writing any: validation, and the author against § Ledgers & Writers. One refused row → exit 8, and nothing is written.
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index bcdf5325e..7e3e6ab0d 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -2174,6 +2174,27 @@ describe("bkit ledgers query", () => {
     expect(fs.readFileSync(path.join(r, FILE), "utf-8")).toBe(bytes);
   });
 
+  it("a negative --cursor offset is refused", async () => {
+    const r = fixture();
+    const page1 = await q(r, "--status=ACTIVE", "--limit=2");
+    expect(page1.code).toBe(0);
+    const good = JSON.parse(
+      Buffer.from(page1.json.nextCursor as string, "base64url").toString("utf-8"),
+    ) as { s: string; f: string; o: number };
+    const negative = Buffer.from(JSON.stringify({ ...good, o: -1 })).toString("base64url");
+
+    const refused = await q(r, "--status=ACTIVE", "--limit=2", `--cursor=${negative}`);
+    expect(refused.code).toBe(2);
+    expect(refused.err).toMatch(/cursor/i);
+    expect(refused.json).toBeUndefined();
+
+    // An offset beyond the end is still an empty page, not an error.
+    const beyond = Buffer.from(JSON.stringify({ ...good, o: 99 })).toString("base64url");
+    const empty = await q(r, "--status=ACTIVE", "--limit=2", `--cursor=${beyond}`);
+    expect(empty.code).toBe(0);
+    expect(empty.json.rows).toEqual([]);
+  });
+
   it("marks a page with a next cursor as not clean", async () => {
     const r = repo();
     put(r, FILE, `${dec("k1", 1001, "ACTIVE")}\n${dec("k2", 1002, "ACTIVE")}\n`);
@@ -2273,6 +2294,22 @@ describe("bkit ledgers append --operation", () => {
     expect(update.json.receipt.rows[0].ts).toBe(b!["ts"]);
   });
 
+  it("a replayed operation whose rows are gone is not reported as recorded", async () => {
+    const r = repo();
+    const ledgerFile = path.join(r, "docs/failures.jsonl");
+    const first = await appendOp(r, [failure()], "op-gone");
+    expect(first.code).toBe(0);
+
+    // The ledger loses the rows the receipt names.
+    fs.writeFileSync(ledgerFile, "");
+
+    const replay = await appendOp(r, [failure()], "op-gone");
+    expect(replay.code).not.toBe(0);
+    expect(replay.err).toContain("op-gone");
+    expect(replay.json).toBeUndefined();
+    expect(fs.readFileSync(ledgerFile, "utf-8")).toBe("");
+  });
+
   it("keeps ledger operation intents and receipts out of committed book paths", () => {
     const r = repo();
     appendLedgerRows(r, "failures", [failure()], undefined, { operation: "op-1" });
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 6e6cd2303..cf54942ae 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -39,6 +39,7 @@ import {
   appendHeld,
   appendLine,
   correctionScope,
+  ledgerEffect,
   ledgerIntent,
   ledgerOperation,
   ledgerOperationsFile,
@@ -1828,13 +1829,19 @@ export function appendLedgerRows(
             `operation ${operation} was already used for a different request; nothing written`,
           );
         if (known.state === "replay") {
-          const d = (known.row as { detail?: { offset: number; bytes: number; block: string } })
-            .detail;
+          const d = ledgerEffect(ops, operation);
           if (d === undefined)
             throw new CommandError(
               EXIT_STAGE,
               `operation ${operation} has a receipt without its effect`,
             );
+          const held = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
+          const wanted = Buffer.from(d.block);
+          if (!held.subarray(d.offset, d.offset + wanted.length).equals(wanted))
+            throw new CommandError(
+              EXIT_STAGE,
+              `operation ${operation} has a receipt, but ${file} no longer holds its rows; nothing recorded`,
+            );
           return result(d, d.block, true);
         }
         const intent = ledgerIntent(ops, operation);
@@ -1848,7 +1855,7 @@ export function appendLedgerRows(
             operation,
             hash,
             ref: `${file}@${landed.offset}+${landed.bytes}`,
-            detail: { offset: landed.offset, bytes: landed.bytes, block: landed.block },
+            detail: { offset: landed.offset, bytes: landed.bytes },
           });
         if (intent !== undefined) {
           const have = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
@@ -2089,7 +2096,10 @@ function decodeCursor(text: string): { s: string; f: string; o: number } | null
   const parsed = parseJson(Buffer.from(text, "base64url").toString("utf-8"));
   if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object") return null;
   const v = parsed.value as Record<string, unknown>;
-  return typeof v["s"] === "string" && typeof v["f"] === "string" && Number.isInteger(v["o"])
+  return typeof v["s"] === "string" &&
+    typeof v["f"] === "string" &&
+    Number.isInteger(v["o"]) &&
+    (v["o"] as number) >= 0
     ? { s: v["s"], f: v["f"], o: v["o"] as number }
     : null;
 }
diff --git a/.bkit/core/engine/ledgers/status.test.ts b/.bkit/core/engine/ledgers/status.test.ts
index 31c55db0d..f5c537869 100644
--- a/.bkit/core/engine/ledgers/status.test.ts
+++ b/.bkit/core/engine/ledgers/status.test.ts
@@ -1,3 +1,4 @@
+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -12,7 +13,10 @@ import {
   alreadyDone,
   appendLine,
   fold,
+  ledgerEffect,
   ledgerOperation,
+  ledgerOperationsFile,
+  recordLedgerIntent,
   recordAction,
   recordLedgerOperation,
   testRunProblem,
@@ -22,6 +26,7 @@ import {
   foldCiHandoff,
   validateCiHandoffEvent,
 } from "./status";
+import { appendLedgerRows } from "../commands/workflow/ledgers";
 import { readStatusEvents, readStatusRows } from "../commands/workflow/status";
 
 describe("CI evidence selection contract", () => {
@@ -431,6 +436,66 @@ describe("ledger operation receipts", () => {
   });
 });
 
+describe("ledger operation effect", () => {
+  it("the row block is stored once per operation", () => {
+    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledger-once-")));
+    spawnSync("git", ["init", "-q", "-b", "main"], { cwd: root });
+    appendLedgerRows(
+      root,
+      "failures",
+      [
+        {
+          kind: "failure",
+          by: { workflow: "build", step: "build-challenge" },
+          key: "stored-once",
+          summary: "stored once",
+          severity: "HIGH",
+          status: "OPEN",
+        },
+      ],
+      undefined,
+      { operation: "op-once" },
+    );
+    const block = fs.readFileSync(path.join(root, "docs/failures.jsonl"), "utf-8");
+    const ops = ledgerOperationsFile(root);
+    expect(ops).not.toBeNull();
+    const text = fs.readFileSync(ops as string, "utf-8");
+    // The block appears in exactly one row of the operations file: the intent.
+    expect(text.split(JSON.stringify(block)).length - 1).toBe(1);
+    expect(ledgerEffect(ops as string, "op-once")).toEqual({
+      offset: 0,
+      bytes: Buffer.byteLength(block),
+      block,
+    });
+
+    // An old receipt that holds the block itself still yields it.
+    const old = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledger-old-")), "ops.jsonl");
+    const hash = actionHash("old");
+    recordLedgerOperation(old, {
+      operation: "op-old",
+      hash,
+      ref: "docs/failures.jsonl@0+8",
+      detail: { offset: 0, bytes: 8, block: '{"a":1}\n' },
+    });
+    expect(ledgerEffect(old, "op-old")).toEqual({ offset: 0, bytes: 8, block: '{"a":1}\n' });
+    recordLedgerIntent(old, {
+      operation: "op-new",
+      hash,
+      file: "docs/failures.jsonl",
+      offset: 8,
+      bytes: 8,
+      block: '{"b":2}\n',
+    });
+    recordLedgerOperation(old, {
+      operation: "op-new",
+      hash,
+      ref: null,
+      detail: { offset: 8, bytes: 8 },
+    });
+    expect(ledgerEffect(old, "op-new")).toEqual({ offset: 8, bytes: 8, block: '{"b":2}\n' });
+  });
+});
+
 describe("CI handoff events", () => {
   const SHA = "a".repeat(40);
   const NEW_SHA = "b".repeat(40);
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 51871e8f0..8e9431c64 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -729,6 +729,24 @@ function privateDir(file: string): void {
   fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
 }
 
+/**
+ * The landed effect of a receipted operation: offset and bytes from the receipt, the block from
+ * the operation's intent (or from `detail.block` of an old receipt). Undefined when unknown.
+ */
+export function ledgerEffect(
+  file: string,
+  operation: string,
+): { offset: number; bytes: number; block: string } | undefined {
+  const receipt = engineActions(file)
+    .filter((r) => r.key === ledgerOpKey(operation))
+    .at(0) as { detail?: { offset?: unknown; bytes?: unknown; block?: unknown } } | undefined;
+  const d = receipt?.detail;
+  if (d === undefined || typeof d.offset !== "number" || typeof d.bytes !== "number")
+    return undefined;
+  const block = typeof d.block === "string" ? d.block : ledgerIntent(file, operation)?.block;
+  return block === undefined ? undefined : { offset: d.offset, bytes: d.bytes, block };
+}
+
 /** Intents on `target` of this root with no receipt; none when there is no store. */
 export function pendingLedgerIntentsFor(root: string, target: string): LedgerIntent[] {
   const ops = ledgerOperationsFile(root);
@@ -787,7 +805,8 @@ export function ledgerOperation(
 /**
  * Record the receipt of a finished ledger operation. A known operation with the same
  * hash returns its original row unchanged; one with another hash throws and writes nothing.
- * `detail` rides on the row so a replay can return the original effect.
+ * `detail` rides on the row so a replay can return the original effect: the offset and byte
+ * count of the landed block. The block itself lives once, in the operation's intent row.
  */
 export function recordLedgerOperation(
   file: string,
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 7c3655018..43a4b3002 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -266,3 +266,4 @@
 {"schema":3,"ts":1794879766984,"kind":"friction","key":"host-worktree-isolation/build-plan-convert","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-convert"},"references":["1011-rules-ship-project","#1011"],"category":"tool-failure","scope":"universal","severity":"HIGH","summary":"Host worktree isolation blocks subagent writes to the minted build worktree","description":"The build ran from a Claude desktop session opened in an isolated app worktree (.claude/worktrees/cranky-lamarr-346c94). bkit worktrees setup minted .worktrees/1011-rules-ship-project in the main checkout, and the host's PreToolUse:Write guard refused every Write there as 'in the base repo checkout', twice for @bkit-build-plan-convert and once for an orchestrator probe, even after the folder was added to the session. No subagent step can write, so the run cannot proceed from this session.","remediation":"Start /bkit-build from a session opened in the main checkout (not an isolated app worktree), or adopt the session's own worktree branch in place instead of minting .worktrees/{FID}.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794885457539,"kind":"friction","key":"verify-pass-incomplete-evidence/build-plan-verify-holistic","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-verify-holistic"},"references":["1011-rules-ship-project","#1011"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"Holistic verifier wrote Verdict PASS with incomplete evidence and hand-wrote its report; a PASS row was recorded before the re-ask","description":"@bkit-build-plan-verify returned a result with judgments.Verdict PASS and evidenceComplete false (it could not run the tarball install itself) and wrote the report file by hand. bkit steps stub exited 6 with 'Verdict PASS contradicts incomplete evidence', but the orchestrator ran steps stub and steps finish in one shell call without stopping on the non-zero exit, so steps finish read the hand-written report and recorded holistic attempt 1 as PASS. The verifier was asked again, returned CONCERNS, and attempt 2 (engine-rendered) supersedes attempt 1.","remediation":"Run steps stub and steps finish as separate calls, or stop on a non-zero exit, so a refused result can never reach steps finish through a hand-written report. Consider having steps finish refuse an artifact that steps stub did not render for an agent whose result file exists.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794886850180,"kind":"friction","key":"code-step-stale-dist/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1011-rules-ship-project","#1011"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code subagent left dist/ stale, so the step commit was refused once","description":"@bkit-build-plan-tasks changed .bkit/core/engine/checks/tips/detect.ts and catalogue.ts for group 3 without running pnpm build. steps finish exited 8 because the pre-commit hook's bkit:check:dist printed '[bkit] dist/ is stale — run pnpm build and commit the result'. The orchestrator ran pnpm build and re-ran the block, which committed.","remediation":"Have the code subagent's prompt or brief name pnpm build as a required last action whenever it edits engine sources in the bkit repo.","source":"orchestrator","status":"OPEN"}
+{"schema":3,"ts":1794917851130,"kind":"friction","key":"code-step-stale-dist/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["992-ledger-commands-six","#992"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code subagent left dist/ stale, so the step commit was refused once","description":"@bkit-build-plan-tasks changed .bkit/core/engine/commands/workflow/ledgers.ts and .bkit/core/engine/ledgers/status.ts for group 1 without running pnpm build. steps finish exited 8 because the pre-commit hook's bkit:check:dist printed '[bkit] dist/ is stale — run pnpm build and commit the result'. The orchestrator ran pnpm build, staged dist/ and re-ran the block, which committed. The same subagent also left a 'bkit tests changed --fallback=bkit:gate:static' run going in the background with no output after about six minutes.","remediation":"Have the code subagent's prompt or brief name pnpm build as a required last action whenever it edits engine sources in the bkit repo.","source":"orchestrator","status":"OPEN"}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 4fdaa6e85..a59614967 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -9725,11 +9725,11 @@ A single-file mechanical utility that compresses prose in one supplied target. I
 ### plan-task-ticking-owned-by-verify
 
 - behavior: **Plan task ticking owned by verify**
-- agents: `bkit-build-plan-tasks` (ticks only applicable Pre-Flight and gate boxes), `bkit-build-plan-verify` (ticks task boxes `[ ]`→`[x]` only on verified codebase artifact)
+- agents: `bkit-build-plan-tasks` (ticks no box), `bkit-build-plan-verify` (ticks task boxes `[ ]`→`[x]` only on verified codebase artifact)
 - source: `.bkit/core/.bkit/prompts.md` § Special Behaviors (frontmatter-adjacent contracts)
 
 ```text
-Task checkboxes are verify's derived view of the codebase. The executor's durable progress record is its flat append-only log of `DONE —` lines, which keeps resume safe and keeps per-task `Edit` ticks out of its turn budget. Execute ticks each applicable Pre-Flight and gate box as that gate passes and continues without asking; it never ticks a task box or a human-confirmation box.
+Task checkboxes are verify's derived view of the codebase. The executor's durable progress record is its flat append-only log of `DONE —` lines, which keeps resume safe and keeps per-task `Edit` ticks out of its turn budget. Execute ticks no box in the plan.
 ```
 
 ### flat-append-only-log-for-source-modifiers
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 5a654c5ce..edcc55776 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -17,7 +17,7 @@ import { readBkitVersion } from "../../install/version-file.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
-import { CORRECTION_REJECTED_ROW, CORRECTION_SUCCEEDED_ROW, actionHash, appendHeld, appendLine, correctionScope, ledgerIntent, ledgerOperation, ledgerOperationsFile, pendingLedgerIntentsFor, recordLedgerIntent, recordLedgerOperation, statusTimestamp, withTargetLock, writePrepared, } from "../../ledgers/status.js";
+import { CORRECTION_REJECTED_ROW, CORRECTION_SUCCEEDED_ROW, actionHash, appendHeld, appendLine, correctionScope, ledgerEffect, ledgerIntent, ledgerOperation, ledgerOperationsFile, pendingLedgerIntentsFor, recordLedgerIntent, recordLedgerOperation, statusTimestamp, withTargetLock, writePrepared, } from "../../ledgers/status.js";
 import { CommandError, CorrectionExhausted, EXIT, INVOCATION_FLAG, invocationDir, isIgnoredPath, isSharedBranch, NoWriteRejection, parseJson, UncertainEffect, wholeNumber, } from "../lib.js";
 import { CORRECTION_LIMIT, spendCorrection } from "./counters.js";
 import { readStatusRows, str } from "./status.js";
@@ -1475,10 +1475,13 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                 if (known.state === "conflict")
                     throw new CommandError(EXIT_ROW_REFUSED, `operation ${operation} was already used for a different request; nothing written`);
                 if (known.state === "replay") {
-                    const d = known.row
-                        .detail;
+                    const d = ledgerEffect(ops, operation);
                     if (d === undefined)
                         throw new CommandError(EXIT_STAGE, `operation ${operation} has a receipt without its effect`);
+                    const held = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
+                    const wanted = Buffer.from(d.block);
+                    if (!held.subarray(d.offset, d.offset + wanted.length).equals(wanted))
+                        throw new CommandError(EXIT_STAGE, `operation ${operation} has a receipt, but ${file} no longer holds its rows; nothing recorded`);
                     return result(d, d.block, true);
                 }
                 const intent = ledgerIntent(ops, operation);
@@ -1488,7 +1491,7 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                     operation,
                     hash,
                     ref: `${file}@${landed.offset}+${landed.bytes}`,
-                    detail: { offset: landed.offset, bytes: landed.bytes, block: landed.block },
+                    detail: { offset: landed.offset, bytes: landed.bytes },
                 });
                 if (intent !== undefined) {
                     const have = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
@@ -1686,7 +1689,10 @@ function decodeCursor(text) {
     if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object")
         return null;
     const v = parsed.value;
-    return typeof v["s"] === "string" && typeof v["f"] === "string" && Number.isInteger(v["o"])
+    return typeof v["s"] === "string" &&
+        typeof v["f"] === "string" &&
+        Number.isInteger(v["o"]) &&
+        v["o"] >= 0
         ? { s: v["s"], f: v["f"], o: v["o"] }
         : null;
 }
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index 64515d7e8..aa1975856 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -528,6 +528,20 @@ export function ledgerOperationsFile(root, prepare = false) {
 function privateDir(file) {
     fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
 }
+/**
+ * The landed effect of a receipted operation: offset and bytes from the receipt, the block from
+ * the operation's intent (or from `detail.block` of an old receipt). Undefined when unknown.
+ */
+export function ledgerEffect(file, operation) {
+    const receipt = engineActions(file)
+        .filter((r) => r.key === ledgerOpKey(operation))
+        .at(0);
+    const d = receipt?.detail;
+    if (d === undefined || typeof d.offset !== "number" || typeof d.bytes !== "number")
+        return undefined;
+    const block = typeof d.block === "string" ? d.block : ledgerIntent(file, operation)?.block;
+    return block === undefined ? undefined : { offset: d.offset, bytes: d.bytes, block };
+}
 /** Intents on `target` of this root with no receipt; none when there is no store. */
 export function pendingLedgerIntentsFor(root, target) {
     const ops = ledgerOperationsFile(root);
@@ -567,7 +581,8 @@ export function ledgerOperation(file, operation, hash) {
 /**
  * Record the receipt of a finished ledger operation. A known operation with the same
  * hash returns its original row unchanged; one with another hash throws and writes nothing.
- * `detail` rides on the row so a replay can return the original effect.
+ * `detail` rides on the row so a replay can return the original effect: the offset and byte
+ * count of the landed block. The block itself lives once, in the operation's intent row.
  */
 export function recordLedgerOperation(file, a) {
     const known = ledgerOperation(file, a.operation, a.hash);
diff --git a/docs/architecture.md b/docs/architecture.md
index 186dc9775..a60f44d8a 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -217,7 +217,7 @@ Deterministic, advisory-only grader on `git diff parentSha..HEAD` → `kind:"com
 
 `references[]` = single cross-entry pointer for EVERY kind (envelope, not payload) — feature ids, tracker ids, PRs, SHAs, paths, row `key` in the same or another ledger, `KN-N` / `DE-N` ids. No separate identity field. `key` = identity; `references[]` = pointers. Contract: `.bkit/jsonl.md` § Key & References. Cite slug `key`, never bare number.
 
-**Deterministic bookkeeping:** the engine owns metadata, counts and replay accounting. Invocations are issued by `bkit status invocation` into the run's `status.jsonl` as an `invocation` event that holds no absolute path (`statusPath` and `bookRoot` are relative to the checkout top, `worktree` is a one-way fingerprint; the absolute paths stay in the private outbox receipt); `bkit ledgers append` fills `by` and the model fields from the invocation, records an operation intent and receipt in the private git-common `bkit-outbox/ledger-operations/` (a replay returns the receipt and writes nothing; no committed file carries them) and holds the ledger lock; `bkit ledgers query` reads canonical winners without writing. `ci-handoff` and correction rows live in the run's status log and are ignored by the step fold; a runless (standalone) invocation keeps its correction events in `<outbox>/invocation-context/<id>.corrections.jsonl` next to the receipt, and its two-retry budget is per invocation. Agents supply findings and judgments only.
+**Deterministic bookkeeping:** the engine owns metadata, counts and replay accounting. Invocations are issued by `bkit status invocation` into the run's `status.jsonl` as an `invocation` event that holds no absolute path (`statusPath` and `bookRoot` are relative to the checkout top, `worktree` is a one-way fingerprint; the absolute paths stay in the private outbox receipt); `bkit ledgers append` fills `by` and the model fields from the invocation, records an operation intent and receipt in the private git-common `bkit-outbox/ledger-operations/` (a replay returns the receipt and writes nothing, and only after the ledger still holds the rows; no committed file carries them) and holds the ledger lock; `bkit ledgers query` reads canonical winners without writing. `ci-handoff` and correction rows live in the run's status log and are ignored by the step fold; a runless (standalone) invocation keeps its correction events in `<outbox>/invocation-context/<id>.corrections.jsonl` next to the receipt, and its two-retry budget is per invocation. Agents supply findings and judgments only.
 
 ## Roadmap Ledger & Board
 
