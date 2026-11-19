diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index c475e4bc7..3ff218f48 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -832,7 +832,7 @@ Every command has a `🤖 Failure Path` section before Step 1. Any step, tool or

<!-- prettier-ignore -->
 | Tier | Conflict shape | Recovery | Mechanism |
 | --- | --- | --- | --- |
 | 1 | Append-only ledgers (`docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `.bkit/issues.jsonl`, `docs/roadmap.md`, `.bkit/stats.jsonl`) + per-FID `status.jsonl` (`docs/plans/**/status.jsonl`) | `merge=union` — git auto-concatenates both sides | `.gitattributes` (template at `.bkit/shared/.gitattributes`, installed to consumer roots by `bkit install`); conflict never reaches the workflow |
-| 2 | Any combination of the Tier-1 ledgers, `.bkit/friction.jsonl`, the dependency lockfile (pnpm, npm, yarn, bun, cargo, go, uv), a generated register (`docs/capabilities.md`, `REGISTERS` in `.bkit/core/engine/commands/workflow/branches.ts`), an embedding doc (a doc the register's script copies a generated block into, listed by `GRAPH_EMBED_DOCS` in the repo's `scripts/graphify/bkit-graphify.sh`; the shipped template lists none), the install record (`.bkit/version`), and this feature's own plan files (`docs/plans/{YYYYMM}/logs/{FID}/` and `docs/plans/{YYYYMM}/{FID}-plan.md`, on a branch named `feat/{FID}`; a plan-closed branch left on the remote holds the same files `dev` does) | `bkit branches rebase` — union-resolves each ledger (`git merge-file --union` over the three index stages), takes the rebase target's lockfile and regenerates it (`LOCKFILE_REGENERATE`, `.bkit/core/engine/shared/package-manager.ts`), takes the rebase target's copy of a register and carries the branch's edit to its hand-written region (the overrides block) onto it, takes the rebase target's copy of an embedding doc's generated block and merges the rest of that doc as git would, merges the install record entry by entry (each entry takes the side that changed it, and the rebase target's value when both did), takes the rebase target's copy of this feature's own plan files (`RESOLVED {path} — took the rebase target's copy`; another feature's plan logs and a plan file on a branch not named `feat/{FID}` still refuse), then drives `--continue` / `--skip` to completion. Once the rebase completes it runs the register's rebuild script (`scripts/graphify/bkit-graphify.sh refresh`) when that script exists, and commits only the paths the rebuild changed. The install record needs no rebuild: `bkit upgrade` refreshes a fingerprint left at the target's value once the file matches what bkit writes, and until then treats that file as edited by hand. When both sides changed the hand-written region, an embedding doc still conflicts outside its generated block, or a side deleted the install record, the rebase refuses, as in Tier 3. A rebuild that fails, or a missing script, leaves the target's copy and does not fail the rebase: the pre-push gate, CI and ship's `bkit:generate` still judge the register | `bkit worktrees setup` exits 3 on a conflicted resume rebase and leaves it in progress → Step 2 runs `bkit branches rebase --sentinel= --log-file= --file=` → re-runs `setup`; non-zero → Failure Path. A completed rebase writes one `engine-action` row (`action: rebase`, key `rebase/<old HEAD>`, ref the new HEAD) to `status.jsonl`, from `setup` itself or from `--file=`, so a rewritten branch history is on the record |
+| 2 | Any combination of the Tier-1 ledgers, `.bkit/friction.jsonl`, the dependency lockfile (pnpm, npm, yarn, bun, cargo, go, uv), a generated register (`docs/capabilities.md`, `REGISTERS` in `.bkit/core/engine/commands/workflow/branches.ts`), an embedding doc (a doc the register's script copies a generated block into, listed by `GRAPH_EMBED_DOCS` in the repo's `scripts/graphify/bkit-graphify.sh`; the shipped template lists none), the install record (`.bkit/version`), and this feature's own plan files (`docs/plans/{YYYYMM}/logs/{FID}/` and `docs/plans/{YYYYMM}/{FID}-plan.md`, on a branch named `feat/{FID}`; a plan-closed branch left on the remote holds the same files `dev` does) | `bkit branches rebase` — union-resolves each ledger (`git merge-file --union` over the three index stages), takes the rebase target's lockfile and regenerates it (`LOCKFILE_REGENERATE`, `.bkit/core/engine/shared/package-manager.ts`), takes the rebase target's copy of a register and carries the branch's edit to its hand-written region (the overrides block) onto it, takes the rebase target's copy of an embedding doc's generated block and merges the rest of that doc as git would, merges the install record entry by entry (each entry takes the side that changed it, and the rebase target's value when both did), takes the rebase target's copy of this feature's own plan files (`RESOLVED {path} — took the rebase target's copy`; a branch copy that differs from the target's is first kept under the outbox's `{FID}/dropped-logs/{time}/{path}` and that path is named on the `RESOLVED` line; another feature's plan logs and a plan file on a branch not named `feat/{FID}` still refuse), then drives `--continue` / `--skip` to completion. Once the rebase completes it runs the register's rebuild script (`scripts/graphify/bkit-graphify.sh refresh`) when that script exists, and commits only the paths the rebuild changed. The install record needs no rebuild: `bkit upgrade` refreshes a fingerprint left at the target's value once the file matches what bkit writes, and until then treats that file as edited by hand. When both sides changed the hand-written region, an embedding doc still conflicts outside its generated block, or a side deleted the install record, the rebase refuses, as in Tier 3. A rebuild that fails, or a missing script, leaves the target's copy and does not fail the rebase: the pre-push gate, CI and ship's `bkit:generate` still judge the register | `bkit worktrees setup` exits 3 on a conflicted resume rebase and leaves it in progress → Step 2 runs `bkit branches rebase --sentinel= --log-file= --file=` → re-runs `setup`; non-zero → Failure Path. A completed rebase writes one `engine-action` row (`action: rebase`, key `rebase/<old HEAD>`, ref the new HEAD) to `status.jsonl`, from `setup` itself or from `--file=`, so a rewritten branch history is on the record |
 | 3 | Code, configs, anything else | `bkit branches rebase` refuses (exit 3), aborts the rebase, and writes sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` → Failure Path → conditional handover (`bkit workflows fail` reports `handoverNeeded`) | Sentinel-file pattern. In `/bkit-ship` Step 4, `bkit branches sync --merge` resolves the merge's ledgers, lockfile, generated register, embedding docs and install record itself, leaves the other paths conflicted with the merge in progress, writes no sentinel and exits 24 (`pending`); the workflow then invokes `@bkit-ship-conflict-resolve`, which resolves them by hand and runs the block again, which commits the merge. A ledger, lockfile, register, embedding-doc or install-record resolution that fails aborts the merge and writes the sentinel |
 
 **Why Tier 1 `merge=union` not workflow step:** the trade-off is interleaved or duplicated rows when both sides append. Readers de-dupe on an identity tuple (`(kind, repo, key)`), so that is not a regression. `.gitattributes` is the standard git mechanism and pre-empts the conflict for all callers. It excludes `.bkit/friction.jsonl`, because same-`key` updates break the strict-append union safety.
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index b01d419c8..b88c69050 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1162,6 +1162,38 @@ describe(
       expect(r.json?.reason).toContain(PC_RULE);
       expect(inRebase(dir)).toBe(false);
     });
+
+    it("does not silently drop a later branch edit to the plan file when dev changed an adjacent line", async () => {
+      const gap = Array.from({ length: 8 }, (_, i) => `filler ${i}\n`).join("");
+      const base = `- [ ] TASK 1\n  detail one\n${gap}- [ ] TASK 3\n  detail three\n`;
+      const dir = makeRepo("pc-adjacent");
+      commit(dir, { [PC_PLAN]: base }, "plan close base");
+      git(dir, "checkout", "-q", "-b", `feat/${PC_FID}`);
+      write(dir, PC_PLAN, `- [x] TASK 1\n  detail one\n${gap}- [x] TASK 3\n  detail three\n`);
+      git(dir, "add", "-A");
+      git(dir, "commit", "-q", "-m", "build ticks");
+      git(dir, "checkout", "-q", "main");
+      write(
+        dir,
+        PC_PLAN,
+        `- [ ] TASK 1\n  detail one edited on dev\n${gap}- [ ] TASK 3\n  detail three\n`,
+      );
+      git(dir, "add", "-A");
+      git(dir, "commit", "-q", "-m", "dev edit");
+      git(dir, "checkout", "-q", `feat/${PC_FID}`);
+      git(dir, "rebase", "main");
+      const r = await run(dir, ["rebase"]);
+      const tick = "[x] TASK 3";
+      const keptPaths = Array.from(r.err.matchAll(/\S*dropped-logs\S*/g), (m) =>
+        path.resolve(dir, m[0].replace(/^[`'"(]+|[`'",.)]+$/g, "")),
+      )
+        .filter((t) => fs.existsSync(t))
+        .filter((t) => fs.statSync(t).isFile());
+      const planKept = read(dir, PC_PLAN).includes(tick);
+      const copyKept = keptPaths.some((t) => fs.readFileSync(t, "utf-8").includes(tick));
+      // Refused (code 3), or the tick survives in the plan file or in a kept copy that r.err names.
+      expect([r.code === 3, planKept, copyKept]).toContain(true);
+    });
   },
 );
 
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index 44ecb1e60..27ef56d67 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -75,6 +75,7 @@ import {
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
+import { droppedLogsDir, keepAside } from "./worktrees.js";
 import { defaultRange } from "./feature-base.js";
 import { stepBase } from "./step-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
@@ -554,6 +555,12 @@ function takeDevSide(top: string, file: string, dev: "ours" | "theirs"): boolean
     : runGit(top, ["rm", "-q", "--", file]).ok;
 }
 
+/** Keep the branch's blob of a conflicted plan file under the feature's `dropped-logs/`; its path, or null if unreadable. */
+function keptBranchCopy(top: string, fid: string, file: string, blob: string): string | null {
+  const content = spawnSync("git", ["cat-file", "blob", blob], { cwd: top, env: gitEnv() });
+  return content.status === 0 ? keepAside(droppedLogsDir(top, fid), file, content.stdout) : null;
+}
+
 /**
  * Drive an in-progress rebase to completion, auto-resolving each stop. Loops
  * because `--continue` replays the next commit, which can conflict in turn; the
@@ -603,11 +610,22 @@ export function resolveRebase(
       for (const f of conflicts) {
         const kind = classifyConflict(f, embeds, fid);
         if (kind === "planlog") {
+          // The commit being replayed (stage 3) may hold build edits the target's
+          // copy lacks: keep a differing copy aside before the target's copy wins.
+          const branchBlob = git(top, ["rev-parse", `:3:${f}`]);
+          const kept =
+            branchBlob !== null &&
+            branchBlob !== "" &&
+            branchBlob !== git(top, ["rev-parse", `:2:${f}`])
+              ? keptBranchCopy(top, fid!, f, branchBlob)
+              : null;
           if (!takeDevSide(top, f, "ours")) {
             return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
           }
           result.resolved.push({ path: f, how: "dev" });
-          log(`RESOLVED ${f} — ${REBASE_HOW.dev}`);
+          log(
+            `RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${kept}`}`,
+          );
           continue;
         }
         const settled =
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 1c3cd330b..ca3637840 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -609,6 +609,23 @@ function putJournalRowsBack(wt: string, journal: Map<string, Appended>): string
   return "";
 }
 
+/** The feature's outbox folder for a log copy that loses to the integration target's: `dropped-logs/{time}/`. */
+export function droppedLogsDir(root: string, fid: string): string {
+  return path.join(
+    path.dirname(ownershipMarker(root, fid)),
+    "dropped-logs",
+    new Date().toISOString().replace(/[:.]/g, "-"),
+  );
+}
+
+/** Write `content` to `{keepDir}/{rel}`, never deleted by bkit; returns the kept path. */
+export function keepAside(keepDir: string, rel: string, content: Buffer): string {
+  const kept = path.join(keepDir, rel);
+  fs.mkdirSync(path.dirname(kept), { recursive: true });
+  fs.writeFileSync(kept, content);
+  return kept;
+}
+
 /**
  * Commit what an earlier run left uncommitted in a resumed worktree, so the
  * resume rebase can start: a failed ship's flush lands its record on dev and
@@ -630,17 +647,11 @@ function carryLeftovers(
   const dropped = (git(wt, ["ls-files", "--others", "--exclude-standard"]) ?? "")
     .split("\n")
     .filter((f) => logs.test(f) && runGit(wt, ["cat-file", "-e", `${o.onto}:${f}`]).ok);
-  const keepDir = path.join(
-    path.dirname(ownershipMarker(wt, o.fid)),
-    "dropped-logs",
-    new Date().toISOString().replace(/[:.]/g, "-"),
-  );
+  const keepDir = droppedLogsDir(wt, o.fid);
   for (const f of dropped) {
     const file = path.join(wt, f);
     if (git(wt, ["hash-object", "--", f]) !== git(wt, ["rev-parse", `${o.onto}:${f}`])) {
-      const kept = path.join(keepDir, f);
-      fs.mkdirSync(path.dirname(kept), { recursive: true });
-      fs.cpSync(file, kept);
+      const kept = keepAside(keepDir, f, fs.readFileSync(file));
       log(`moved ${f} to ${kept}: it differs from ${o.onto}'s copy, which wins in the worktree`);
     }
     fs.rmSync(file);
diff --git a/.bkit/version b/.bkit/version
index 4f7020f41..daefcca5f 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "b4d06339ee5025038dc32a5b7b0d80b4af3016adf998be5b9f3d805306fc6ddc",
+    ".bkit/workflows.md": "f85537c8b6b3c0cff210cf40ab1d8902d042941180366e3784c0def6205d0a7f",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 95c00a439..3e832ae11 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -832,7 +832,7 @@ Every command has a `🤖 Failure Path` section before Step 1. Any step, tool or

<!-- prettier-ignore -->
 | Tier | Conflict shape | Recovery | Mechanism |
 | --- | --- | --- | --- |
 | 1 | Append-only ledgers (`docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `.bkit/issues.jsonl`, `docs/roadmap.md`, `.bkit/stats.jsonl`) + per-FID `status.jsonl` (`docs/plans/**/status.jsonl`) | `merge=union` — git auto-concatenates both sides | `.gitattributes` (template at `.bkit/shared/.gitattributes`, installed to consumer roots by `bkit install`); conflict never reaches the workflow |
-| 2 | Any combination of the Tier-1 ledgers, `.bkit/friction.jsonl`, the dependency lockfile (pnpm, npm, yarn, bun, cargo, go, uv), a generated register (`docs/capabilities.md`, `REGISTERS` in `.bkit/core/engine/commands/workflow/branches.ts`), an embedding doc (a doc the register's script copies a generated block into, listed by `GRAPH_EMBED_DOCS` in the repo's `scripts/graphify/bkit-graphify.sh`; the shipped template lists none), the install record (`.bkit/version`), and this feature's own plan files (`docs/plans/{YYYYMM}/logs/{FID}/` and `docs/plans/{YYYYMM}/{FID}-plan.md`, on a branch named `feat/{FID}`; a plan-closed branch left on the remote holds the same files `dev` does) | `bkit branches rebase` — union-resolves each ledger (`git merge-file --union` over the three index stages), takes the rebase target's lockfile and regenerates it (`LOCKFILE_REGENERATE`, `.bkit/core/engine/shared/package-manager.ts`), takes the rebase target's copy of a register and carries the branch's edit to its hand-written region (the overrides block) onto it, takes the rebase target's copy of an embedding doc's generated block and merges the rest of that doc as git would, merges the install record entry by entry (each entry takes the side that changed it, and the rebase target's value when both did), takes the rebase target's copy of this feature's own plan files (`RESOLVED {path} — took the rebase target's copy`; another feature's plan logs and a plan file on a branch not named `feat/{FID}` still refuse), then drives `--continue` / `--skip` to completion. Once the rebase completes it runs the register's rebuild script (`scripts/graphify/bkit-graphify.sh refresh`) when that script exists, and commits only the paths the rebuild changed. The install record needs no rebuild: `bkit upgrade` refreshes a fingerprint left at the target's value once the file matches what bkit writes, and until then treats that file as edited by hand. When both sides changed the hand-written region, an embedding doc still conflicts outside its generated block, or a side deleted the install record, the rebase refuses, as in Tier 3. A rebuild that fails, or a missing script, leaves the target's copy and does not fail the rebase: the pre-push gate, CI and ship's `bkit:generate` still judge the register | `bkit worktrees setup` exits 3 on a conflicted resume rebase and leaves it in progress → Step 2 runs `bkit branches rebase --sentinel= --log-file= --file=` → re-runs `setup`; non-zero → Failure Path. A completed rebase writes one `engine-action` row (`action: rebase`, key `rebase/<old HEAD>`, ref the new HEAD) to `status.jsonl`, from `setup` itself or from `--file=`, so a rewritten branch history is on the record |
+| 2 | Any combination of the Tier-1 ledgers, `.bkit/friction.jsonl`, the dependency lockfile (pnpm, npm, yarn, bun, cargo, go, uv), a generated register (`docs/capabilities.md`, `REGISTERS` in `.bkit/core/engine/commands/workflow/branches.ts`), an embedding doc (a doc the register's script copies a generated block into, listed by `GRAPH_EMBED_DOCS` in the repo's `scripts/graphify/bkit-graphify.sh`; the shipped template lists none), the install record (`.bkit/version`), and this feature's own plan files (`docs/plans/{YYYYMM}/logs/{FID}/` and `docs/plans/{YYYYMM}/{FID}-plan.md`, on a branch named `feat/{FID}`; a plan-closed branch left on the remote holds the same files `dev` does) | `bkit branches rebase` — union-resolves each ledger (`git merge-file --union` over the three index stages), takes the rebase target's lockfile and regenerates it (`LOCKFILE_REGENERATE`, `.bkit/core/engine/shared/package-manager.ts`), takes the rebase target's copy of a register and carries the branch's edit to its hand-written region (the overrides block) onto it, takes the rebase target's copy of an embedding doc's generated block and merges the rest of that doc as git would, merges the install record entry by entry (each entry takes the side that changed it, and the rebase target's value when both did), takes the rebase target's copy of this feature's own plan files (`RESOLVED {path} — took the rebase target's copy`; a branch copy that differs from the target's is first kept under the outbox's `{FID}/dropped-logs/{time}/{path}` and that path is named on the `RESOLVED` line; another feature's plan logs and a plan file on a branch not named `feat/{FID}` still refuse), then drives `--continue` / `--skip` to completion. Once the rebase completes it runs the register's rebuild script (`scripts/graphify/bkit-graphify.sh refresh`) when that script exists, and commits only the paths the rebuild changed. The install record needs no rebuild: `bkit upgrade` refreshes a fingerprint left at the target's value once the file matches what bkit writes, and until then treats that file as edited by hand. When both sides changed the hand-written region, an embedding doc still conflicts outside its generated block, or a side deleted the install record, the rebase refuses, as in Tier 3. A rebuild that fails, or a missing script, leaves the target's copy and does not fail the rebase: the pre-push gate, CI and ship's `bkit:generate` still judge the register | `bkit worktrees setup` exits 3 on a conflicted resume rebase and leaves it in progress → Step 2 runs `bkit branches rebase --sentinel= --log-file= --file=` → re-runs `setup`; non-zero → Failure Path. A completed rebase writes one `engine-action` row (`action: rebase`, key `rebase/<old HEAD>`, ref the new HEAD) to `status.jsonl`, from `setup` itself or from `--file=`, so a rewritten branch history is on the record |
 | 3 | Code, configs, anything else | `bkit branches rebase` refuses (exit 3), aborts the rebase, and writes sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` → Failure Path → conditional handover (`bkit workflows fail` reports `handoverNeeded`) | Sentinel-file pattern. In `/bkit-ship` Step 4, `bkit branches sync --merge` resolves the merge's ledgers, lockfile, generated register, embedding docs and install record itself, leaves the other paths conflicted with the merge in progress, writes no sentinel and exits 24 (`pending`); the workflow then invokes `@bkit-ship-conflict-resolve`, which resolves them by hand and runs the block again, which commits the merge. A ledger, lockfile, register, embedding-doc or install-record resolution that fails aborts the merge and writes the sentinel |
 
 **Why Tier 1 `merge=union` not workflow step:** the trade-off is interleaved or duplicated rows when both sides append. Readers de-dupe on an identity tuple (`(kind, repo, key)`), so that is not a regression. `.gitattributes` is the standard git mechanism and pre-empts the conflict for all callers. It excludes `.bkit/friction.jsonl`, because same-`key` updates break the strict-append union safety.
diff --git a/DETAILS.md b/DETAILS.md
index 5477b6122..8bba20fdd 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,14 +347,14 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1966 symbols · 58 files"]
+    n_bkit_core_engine_commands["commands<br/>1973 symbols · 58 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|475| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|432| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 22e8563e3..c4274edb7 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -30,6 +30,7 @@ import { EXIT_BASE_NOT_DEV, FORCE_BUILD, closeTransportRow, crossCheckRows, merg
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
+import { droppedLogsDir, keepAside } from "./worktrees.js";
 import { defaultRange } from "./feature-base.js";
 import { stepBase } from "./step-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
@@ -418,6 +419,11 @@ function takeDevSide(top, file, dev) {
         ? runGit(top, ["checkout", `--${dev}`, "--", file]).ok && runGit(top, ["add", "--", file]).ok
         : runGit(top, ["rm", "-q", "--", file]).ok;
 }
+/** Keep the branch's blob of a conflicted plan file under the feature's `dropped-logs/`; its path, or null if unreadable. */
+function keptBranchCopy(top, fid, file, blob) {
+    const content = spawnSync("git", ["cat-file", "blob", blob], { cwd: top, env: gitEnv() });
+    return content.status === 0 ? keepAside(droppedLogsDir(top, fid), file, content.stdout) : null;
+}
 /**
  * Drive an in-progress rebase to completion, auto-resolving each stop. Loops
  * because `--continue` replays the next commit, which can conflict in turn; the
@@ -459,11 +465,19 @@ export function resolveRebase(top, onLog = () => undefined) {
             for (const f of conflicts) {
                 const kind = classifyConflict(f, embeds, fid);
                 if (kind === "planlog") {
+                    // The commit being replayed (stage 3) may hold build edits the target's
+                    // copy lacks: keep a differing copy aside before the target's copy wins.
+                    const branchBlob = git(top, ["rev-parse", `:3:${f}`]);
+                    const kept = branchBlob !== null &&
+                        branchBlob !== "" &&
+                        branchBlob !== git(top, ["rev-parse", `:2:${f}`])
+                        ? keptBranchCopy(top, fid, f, branchBlob)
+                        : null;
                     if (!takeDevSide(top, f, "ours")) {
                         return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
                     }
                     result.resolved.push({ path: f, how: "dev" });
-                    log(`RESOLVED ${f} — ${REBASE_HOW.dev}`);
+                    log(`RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${kept}`}`);
                     continue;
                 }
                 const settled = kind === "register"
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index b03a436d6..3f5856ea7 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -486,6 +486,17 @@ function putJournalRowsBack(wt, journal) {
     }
     return "";
 }
+/** The feature's outbox folder for a log copy that loses to the integration target's: `dropped-logs/{time}/`. */
+export function droppedLogsDir(root, fid) {
+    return path.join(path.dirname(ownershipMarker(root, fid)), "dropped-logs", new Date().toISOString().replace(/[:.]/g, "-"));
+}
+/** Write `content` to `{keepDir}/{rel}`, never deleted by bkit; returns the kept path. */
+export function keepAside(keepDir, rel, content) {
+    const kept = path.join(keepDir, rel);
+    fs.mkdirSync(path.dirname(kept), { recursive: true });
+    fs.writeFileSync(kept, content);
+    return kept;
+}
 /**
  * Commit what an earlier run left uncommitted in a resumed worktree, so the
  * resume rebase can start: a failed ship's flush lands its record on dev and
@@ -504,13 +515,11 @@ function carryLeftovers(wt, o, log) {
     const dropped = (git(wt, ["ls-files", "--others", "--exclude-standard"]) ?? "")
         .split("\n")
         .filter((f) => logs.test(f) && runGit(wt, ["cat-file", "-e", `${o.onto}:${f}`]).ok);
-    const keepDir = path.join(path.dirname(ownershipMarker(wt, o.fid)), "dropped-logs", new Date().toISOString().replace(/[:.]/g, "-"));
+    const keepDir = droppedLogsDir(wt, o.fid);
     for (const f of dropped) {
         const file = path.join(wt, f);
         if (git(wt, ["hash-object", "--", f]) !== git(wt, ["rev-parse", `${o.onto}:${f}`])) {
-            const kept = path.join(keepDir, f);
-            fs.mkdirSync(path.dirname(kept), { recursive: true });
-            fs.cpSync(file, kept);
+            const kept = keepAside(keepDir, f, fs.readFileSync(file));
             log(`moved ${f} to ${kept}: it differs from ${o.onto}'s copy, which wins in the worktree`);
         }
         fs.rmSync(file);
diff --git a/docs/capabilities.md b/docs/capabilities.md
index ec9abcb40..d154b2131 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -126,14 +126,14 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1966 symbols · 58 files"]
+    n_bkit_core_engine_commands["commands<br/>1973 symbols · 58 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|475| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|432| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
@@ -269,7 +269,7 @@ flowchart LR
       n_bkit_core_engine_commands_lib["lib<br/>88 symbols · 1 files"]
       n_bkit_core_engine_commands_setup_setup[".bkit/core/engine/commands/setup/setup<br/>11 symbols · 1 files"]
       subgraph gn_bkit_core_engine_commands_workflow[".bkit/core/engine/commands/workflow"]
-        n_bkit_core_engine_commands_workflow_branches["branches<br/>131 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_branches["branches<br/>136 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_challenge["challenge<br/>37 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>92 symbols · 1 files"]
@@ -303,7 +303,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>10 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>90 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>85 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>68 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>70 symbols · 1 files"]
       end
     end
     subgraph gn_bkit_core_engine_install[".bkit/core/engine/install"]
@@ -341,7 +341,7 @@ flowchart LR
     end
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands_workflow_branches -->|123| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_branches -->|125| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|76| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|75| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|53| n_bkit_core_engine_commands_lib
@@ -357,6 +357,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_run_facts
   n_bkit_core_engine_commands_workflow_status -->|29| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_runs -->|28| n_bkit_core_engine_ledgers_status
+  n_bkit_core_engine_commands_workflow_branches -->|27| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_commands_workflow_status -->|27| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_counters -->|26| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_ledgers -->|26| n_bkit_core_engine_ledgers_telemetry
@@ -366,7 +367,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_counters -->|24| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|24| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_worktrees -->|24| n_bkit_core_engine_commands_workflow_ledgers
-  n_bkit_core_engine_commands_workflow_branches -->|23| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_commands_workflow_workflows -->|23| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_checks_after_tools -->|22| n_bkit_core_engine_install_project_docs
   n_bkit_core_engine_tools_instructions -->|22| n_bkit_core_engine_tools_instructions_sources
@@ -472,6 +472,7 @@ flowchart LR
   n_bkit_core_engine_commands_install_install -->|9| n_bkit_core_engine_checks_after_index
   n_bkit_core_engine_commands_install_uninstall -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_lib -->|9| n_bkit_core_engine_ledgers_status
+  n_bkit_core_engine_commands_workflow_branches -->|9| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_run_facts -->|9| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_runs -->|9| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_runs -->|9| n_bkit_core_engine_commands_workflow_repo
@@ -490,7 +491,6 @@ flowchart LR
   n_bkit_core_engine_ledgers_journal -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_checks_tips_detect -->|8| n_bkit_core_engine_shared_package_json
   n_bkit_core_engine_commands_install_upgrade -->|8| n_bkit_core_engine_shared_package_roots
-  n_bkit_core_engine_commands_workflow_branches -->|8| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_challenge -->|8| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|8| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_step_base -->|8| n_bkit_core_engine_commands_lib
diff --git a/docs/testing.md b/docs/testing.md
index d3cbb4125..4a93a948e 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -963,7 +963,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one. |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, adopt the linked worktree a host already made on `feat/{FID}` for every workflow (no second `git worktree add`; `worktreePath` and `logDir` point into it; a session on another branch still mints; design / plan / build run in place in the main checkout on `feat/{FID}` under `--worktrees` exit 7 with no log directory), debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. `remove --branch` still removes the worktree and deletes the local and remote branch when a later `dev` commit changed the branch's file. A plan-closed branch left on the remote: the resume rebase keeps `dev`'s copy of the feature's plan logs and the build starts, while a code conflict beside them still stops it (`worktrees.integration.test.ts`). |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
-| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, the feature's own plan logs and `{FID}-plan.md` taking the rebase target's copy (each round, an emptied commit, beside `status.jsonl`) while another feature's plan log, a plan file on a branch not named `feat/{FID}` and a code conflict beside them still refuse with the rule named, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs, and skipping a `build-takeover` row a refused finish wrote after the subagent committed. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. `notOnDev` keeps a landed branch landed after a later `dev` commit on its file, names only the file whose branch version never reached `dev`, and counts a file the branch deleted as landed when `dev` deleted it and a later commit re-added it. |
+| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, the feature's own plan logs and `{FID}-plan.md` taking the rebase target's copy (each round, an emptied commit, beside `status.jsonl`, a branch edit kept under the outbox's `{FID}/dropped-logs/{time}/` and named on the `RESOLVED` line when `dev` changed an adjacent line, nothing kept for an identical copy) while another feature's plan log, a plan file on a branch not named `feat/{FID}` and a code conflict beside them still refuse with the rule named, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs, and skipping a `build-takeover` row a refused finish wrote after the subagent committed. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. `notOnDev` keeps a landed branch landed after a later `dev` commit on its file, names only the file whose branch version never reached `dev`, and counts a file the branch deleted as landed when `dev` deleted it and a later commit re-added it. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
 | `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
