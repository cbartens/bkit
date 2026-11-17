diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index 3f6cc981a..7df64f77f 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -59,7 +59,7 @@ for name in ["decisions", "knowledge"]:
 
 ## Write Idiom
 
-**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing when the ledger still holds them, and is refused with the reason when they are gone, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
+**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing when the ledger still holds them, and is refused as recorded earlier, with the instruction not to retry it under a new id, when they are gone, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
 
 - **Fills:** `schema: 3`, a minted `ts` per row, `repo` when absent, and `bkit.version` from `.bkit/version`. On `deferral` / `failure` / `knowledge` / `decision` rows, it also fills `firstTs` and `updates` from the entry's earlier rows (§ Compaction), replacing any supplied values.
 - **Checks** every row before writing any: validation, and the author against § Ledgers & Writers. One refused row → exit 8, and nothing is written.
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 827b8aade..272c7912f 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -2375,6 +2375,40 @@ describe("bkit ledgers append --operation", () => {
     expect(fs.readFileSync(ledgerFile, "utf-8")).toBe("");
   });
 
+  it("a replayed operation whose rows a rebase moved is still reported as recorded", async () => {
+    const r = repo();
+    const ledgerFile = path.join(r, "docs/failures.jsonl");
+    const first = await appendOp(r, [failure()], "op-1");
+    expect(first.code).toBe(0);
+    const bytes = fs.readFileSync(ledgerFile, "utf-8");
+
+    // A merge=union rebase leaves upstream lines first, then ours.
+    const foreign = `${JSON.stringify({ schema: 3, key: "upstream-row", ts: 1 })}\n`;
+    fs.writeFileSync(ledgerFile, foreign + bytes);
+
+    const replay = await appendOp(r, [failure()], "op-1");
+    expect(replay.code).toBe(0);
+    expect(replay.json.receipt).toMatchObject({ operation: "op-1", replayed: true });
+    expect(replay.json.appended).toBe(0);
+    expect(fs.readFileSync(ledgerFile, "utf-8")).toBe(foreign + bytes);
+  });
+
+  it("a replayed operation whose rows are gone says it was recorded and must not be retried under a new id", async () => {
+    const r = repo();
+    const ledgerFile = path.join(r, "docs/failures.jsonl");
+    const first = await appendOp(r, [failure()], "op-gone");
+    expect(first.code).toBe(0);
+    fs.writeFileSync(ledgerFile, "");
+
+    const replay = await appendOp(r, [failure()], "op-gone");
+    expect(replay.code).not.toBe(0);
+    expect(replay.err).toContain("op-gone");
+    expect(replay.err).toContain("recorded earlier");
+    expect(replay.err).toContain("new operation id");
+    expect(replay.err).not.toContain("nothing recorded");
+    expect(fs.readFileSync(ledgerFile, "utf-8")).toBe("");
+  });
+
   it("keeps ledger operation intents and receipts out of committed book paths", () => {
     const r = repo();
     appendLedgerRows(r, "failures", [failure()], undefined, { operation: "op-1" });
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index c020bf21c..2b68f156e 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -1838,10 +1838,11 @@ export function appendLedgerRows(
             );
           const held = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
           const wanted = Buffer.from(d.block);
-          if (!held.subarray(d.offset, d.offset + wanted.length).equals(wanted))
+          // A rebase can put upstream rows ahead of the block, so the block counts as held anywhere.
+          if (held.indexOf(wanted) === -1)
             throw new CommandError(
               EXIT_STAGE,
-              `operation ${operation} has a receipt, but ${file} no longer holds its rows; nothing recorded`,
+              `operation ${operation} was recorded earlier, but ${file} no longer holds its rows; do not retry it under a new operation id`,
             );
           return result(d, d.block, true);
         }
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index 94abb885c..f29ab7700 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -59,7 +59,7 @@ for name in ["decisions", "knowledge"]:
 
 ## Write Idiom
 
-**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing when the ledger still holds them, and is refused with the reason when they are gone, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
+**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing when the ledger still holds them, and is refused as recorded earlier, with the instruction not to retry it under a new id, when they are gone, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
 
 - **Fills:** `schema: 3`, a minted `ts` per row, `repo` when absent, and `bkit.version` from `.bkit/version`. On `deferral` / `failure` / `knowledge` / `decision` rows, it also fills `firstTs` and `updates` from the entry's earlier rows (§ Compaction), replacing any supplied values.
 - **Checks** every row before writing any: validation, and the author against § Ledgers & Writers. One refused row → exit 8, and nothing is written.
diff --git a/.bkit/version b/.bkit/version
index 6c44d2aa7..fbe7f2afc 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -210,7 +210,7 @@
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
     ".bkit/install.md": "08d1daa2edba56dc34470d8462418aa5e1d479ac1b5bc596b69debdac025be94",
-    ".bkit/jsonl.md": "23ed4f34eb65b1e07140a76f29b3f5f0db7c6643bd210fd51da5650cc37b8f8c",
+    ".bkit/jsonl.md": "4d7671fb6bebda2ac336b7408347fb0174ef76421ba2f21ef453dd04711c4ed2",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "85913cc84a994cd14a6c0948a8f6b63611a776b1be80cf9a902e5cb994add0c2",
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 3102ddfb6..15019fc50 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -1481,8 +1481,9 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                         throw new CommandError(EXIT_STAGE, `operation ${operation} has a receipt without its effect`);
                     const held = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
                     const wanted = Buffer.from(d.block);
-                    if (!held.subarray(d.offset, d.offset + wanted.length).equals(wanted))
-                        throw new CommandError(EXIT_STAGE, `operation ${operation} has a receipt, but ${file} no longer holds its rows; nothing recorded`);
+                    // A rebase can put upstream rows ahead of the block, so the block counts as held anywhere.
+                    if (held.indexOf(wanted) === -1)
+                        throw new CommandError(EXIT_STAGE, `operation ${operation} was recorded earlier, but ${file} no longer holds its rows; do not retry it under a new operation id`);
                     return result(d, d.block, true);
                 }
                 const intent = ledgerIntent(ops, operation);
diff --git a/docs/architecture.md b/docs/architecture.md
index a60f44d8a..762e0605d 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -217,7 +217,7 @@ Deterministic, advisory-only grader on `git diff parentSha..HEAD` → `kind:"com
 
 `references[]` = single cross-entry pointer for EVERY kind (envelope, not payload) — feature ids, tracker ids, PRs, SHAs, paths, row `key` in the same or another ledger, `KN-N` / `DE-N` ids. No separate identity field. `key` = identity; `references[]` = pointers. Contract: `.bkit/jsonl.md` § Key & References. Cite slug `key`, never bare number.
 
-**Deterministic bookkeeping:** the engine owns metadata, counts and replay accounting. Invocations are issued by `bkit status invocation` into the run's `status.jsonl` as an `invocation` event that holds no absolute path (`statusPath` and `bookRoot` are relative to the checkout top, `worktree` is a one-way fingerprint; the absolute paths stay in the private outbox receipt); `bkit ledgers append` fills `by` and the model fields from the invocation, records an operation intent and receipt in the private git-common `bkit-outbox/ledger-operations/` (a replay returns the receipt and writes nothing, and only after the ledger still holds the rows; no committed file carries them) and holds the ledger lock; `bkit ledgers query` reads canonical winners without writing. `ci-handoff` and correction rows live in the run's status log and are ignored by the step fold; a runless (standalone) invocation keeps its correction events in `<outbox>/invocation-context/<id>.corrections.jsonl` next to the receipt, and its two-retry budget is per invocation. Agents supply findings and judgments only.
+**Deterministic bookkeeping:** the engine owns metadata, counts and replay accounting. Invocations are issued by `bkit status invocation` into the run's `status.jsonl` as an `invocation` event that holds no absolute path (`statusPath` and `bookRoot` are relative to the checkout top, `worktree` is a one-way fingerprint; the absolute paths stay in the private outbox receipt); `bkit ledgers append` fills `by` and the model fields from the invocation, records an operation intent and receipt in the private git-common `bkit-outbox/ledger-operations/` (a replay returns the receipt and writes nothing, and only after the ledger still holds the rows anywhere in the file, otherwise it is refused as recorded earlier and not to be retried under a new id; no committed file carries them) and holds the ledger lock; `bkit ledgers query` reads canonical winners without writing. `ci-handoff` and correction rows live in the run's status log and are ignored by the step fold; a runless (standalone) invocation keeps its correction events in `<outbox>/invocation-context/<id>.corrections.jsonl` next to the receipt, and its two-retry budget is per invocation. Agents supply findings and judgments only.
 
 ## Roadmap Ledger & Board
 
