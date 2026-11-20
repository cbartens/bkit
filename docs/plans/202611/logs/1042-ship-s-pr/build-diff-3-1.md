diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 9665d176e..589988091 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -128,8 +128,8 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
   - **If** the server refuses (any other `[remote rejected]`, `returned error: 403`, a `GH0nn` rule) → take the caller's refused route.
   - **If** the push gets no server answer (network, credentials) → return to the caller. Nothing landed, and there is no PR.
   - `bkit branches land`: design / plan close (`merge --squash -X ours {BRANCH}`, `docs({FID}): {phase} DONE bkit [skip ci]`); refused → PR merge.
-  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused).
-  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused). From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
+  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, gated by the landing gate before the branch push, and its open PR reused).
+  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, gated by the landing gate before the branch push, and its open PR reused). From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
   - `bkit roadmap mirror`: build / debug; an attempt that committed nothing never counts as mirrored.
   - `bkit branches land` reads `RUNTIME_DEVPUSHES` from the run's `runtime-resolved` row (no row → fresh detect). It picks the default `{BRANCH}` (`true` → `feat/{FID}`, `false` → the current branch) and gates only what surrounds the landing: stray-artifact check, local `dev` fast-forward, worktree + `feat/{FID}` teardown.
 - **PR-mode design / plan closes must push before `bkit prs open`:** PR creation and `gh pr merge` act on the remote, so a close commit that is only committed locally never enters the PR and never reaches `dev`. The direct push lands one commit built off `origin/dev` and is unaffected; the PR branch produces two local commits (`chore({FID}): close-workflow` carrying the `status.jsonl` rows and close telemetry, then `docs({FID}): {phase} roadmap update` carrying `.bkit/issues.jsonl` + `docs/roadmap.md`) and needs an explicit `bkit branches push --mode=feature` to publish them. The push sits after the stray guard, so nothing unvetted is published, and before `bkit prs open --existing=reuse`. The build / debug close already pushes the feature branch. Leaving the push out silently loses every design / plan close on the PR path.
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index c5b860231..4b1e00178 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -2996,6 +2996,36 @@ describe("bkit workflows handover", () => {
     expect(git(remote, "show", `dev:.bkit/issues.jsonl`)).not.toContain("planted");
   });
 
+  it("--flush refused by dev runs the landing gate on a merged leftover tip", async () => {
+    let tip = "";
+    const { remote, wt } = refusedAfter((rm) => {
+      // dev declares the min gate: it fails when the run's log folder holds a poison.md.
+      const clone = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-gate-")));
+      dirs.push(clone);
+      git(clone, "clone", "-q", rm, ".");
+      git(clone, "config", "user.email", "t@t");
+      git(clone, "config", "user.name", "t");
+      git(clone, "checkout", "-q", "dev");
+      write(
+        clone,
+        "package.json",
+        JSON.stringify({ name: "t", scripts: { "bkit:gate:min": `test ! -e ${REL}/poison.md` } }),
+      );
+      git(clone, "add", "-A");
+      git(clone, "commit", "-qm", "chore: declare the min gate");
+      git(clone, "push", "-q", "origin", "dev");
+      tip = leftBranch(rm, `ship-failed/${FID}`, { ...earlier, [`${REL}/poison.md`]: "poison\n" });
+    });
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(`ship-failed/${FID}`);
+    expect(r.err).toContain("bkit:gate:min");
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+    expect(gh.calls().some((c) => c.startsWith("pr create"))).toBe(false);
+  });
+
   describe("route and message: every exit the handover reaches ends the run as a stop", () => {
     const notPushed = (tree: string) =>
       `Record not pushed: the handover commit is only in ${tree}, and the links in this run's comments open once it is pushed`;
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 7f20e760c..dfd55503a 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -54,6 +54,9 @@ import {
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { ASK_POINTS, readBkitConfig } from "../../shared/settings.js";
 import { gradeCompliance } from "../comply.js";
+import { minPushOutside, minPushPathspecs } from "../ci/ci.js";
+import { requiredPushGate, runPushGate } from "../ci/push-gate.js";
+import { readPackageJson } from "../../shared/package-json.js";
 import { fetchDev, landDir, pushToDev, sleep, type DevPush } from "../land.js";
 import {
   CommandError,
@@ -1677,6 +1680,25 @@ export function closeWorkflow(
   };
 }
 
+/**
+ * The landing gate `checkLanding` picks, run on the merged leftover tip before
+ * it is pushed. Returns why it must not be pushed, or null.
+ */
+function gateMerged(dir: string, branch: string): string | null {
+  const head = headSha(dir);
+  const base = git(dir, ["rev-parse", `origin/${DEV}`]);
+  if (base === null || !readPackageJson(dir).ok)
+    return `landing gate for ${branch} cannot run: no base or unreadable package.json — nothing pushed`;
+  const diff = minPushOutside(dir, base, head, minPushPathspecs(readBkitConfig(dir)));
+  if (!diff.ok) return `landing gate for ${branch} cannot classify the merge: ${diff.stderr}`;
+  const gate = diff.outside.length === 0 ? "bkit:gate:min" : requiredPushGate(dir);
+  if (!gate) return `${branch} has no declared landing gate — nothing pushed`;
+  const status = runPushGate(dir, gate, () => {});
+  if (status !== 0)
+    return `landing ${gate} failed (exit ${status}) on the merge of ${branch} — nothing pushed`;
+  return null;
+}
+
 /**
  * Publish a commit dev refused through its own `branch` PR titled `title`,
  * merged with an empty body. Builds on a branch an earlier attempt left: its
@@ -1731,6 +1753,9 @@ async function closePr(
       runGit(dir, ["merge", "--abort"]);
       return { failed: `merge commit of origin's ${branch} at ${tip} failed: ${made.stderr}` };
     }
+    // The merge commit is pushed without checkLanding, and a [skip ci] squash runs no CI.
+    const gated = gateMerged(dir, branch);
+    if (gated !== null) return { failed: gated };
   }
   const head = headSha(dir);
   if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 60975bac7..bee3bbacc 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -128,8 +128,8 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
   - **If** the server refuses (any other `[remote rejected]`, `returned error: 403`, a `GH0nn` rule) → take the caller's refused route.
   - **If** the push gets no server answer (network, credentials) → return to the caller. Nothing landed, and there is no PR.
   - `bkit branches land`: design / plan close (`merge --squash -X ours {BRANCH}`, `docs({FID}): {phase} DONE bkit [skip ci]`); refused → PR merge.
-  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused).
-  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused). From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
+  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, gated by the landing gate before the branch push, and its open PR reused).
+  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, gated by the landing gate before the branch push, and its open PR reused). From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
   - `bkit roadmap mirror`: build / debug; an attempt that committed nothing never counts as mirrored.
   - `bkit branches land` reads `RUNTIME_DEVPUSHES` from the run's `runtime-resolved` row (no row → fresh detect). It picks the default `{BRANCH}` (`true` → `feat/{FID}`, `false` → the current branch) and gates only what surrounds the landing: stray-artifact check, local `dev` fast-forward, worktree + `feat/{FID}` teardown.
 - **PR-mode design / plan closes must push before `bkit prs open`:** PR creation and `gh pr merge` act on the remote, so a close commit that is only committed locally never enters the PR and never reaches `dev`. The direct push lands one commit built off `origin/dev` and is unaffected; the PR branch produces two local commits (`chore({FID}): close-workflow` carrying the `status.jsonl` rows and close telemetry, then `docs({FID}): {phase} roadmap update` carrying `.bkit/issues.jsonl` + `docs/roadmap.md`) and needs an explicit `bkit branches push --mode=feature` to publish them. The push sits after the stray guard, so nothing unvetted is published, and before `bkit prs open --existing=reuse`. The build / debug close already pushes the feature branch. Leaving the push out silently loses every design / plan close on the PR path.
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 7ff3c22a0..f5e393bfd 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -28,6 +28,9 @@ import { check as checkCompleteness, deriveContract, parseRows, readCompleteness
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { ASK_POINTS, readBkitConfig } from "../../shared/settings.js";
 import { gradeCompliance } from "../comply.js";
+import { minPushOutside, minPushPathspecs } from "../ci/ci.js";
+import { requiredPushGate, runPushGate } from "../ci/push-gate.js";
+import { readPackageJson } from "../../shared/package-json.js";
 import { fetchDev, landDir, pushToDev, sleep } from "../land.js";
 import { CommandError, DEV, EXIT, git, isSharedBranch, parseJson, repoRoot, runGh, runGit, statusLocation, statusRelPath, } from "../lib.js";
 import { anchorBkitStatus, pushBranch, readAnchor, restoreBranchRows, stampAnchor, } from "./branches.js";
@@ -1325,6 +1328,26 @@ export function closeWorkflow(cwd, o, log) {
         ...(progressLine === undefined ? {} : { progressLine }),
     };
 }
+/**
+ * The landing gate `checkLanding` picks, run on the merged leftover tip before
+ * it is pushed. Returns why it must not be pushed, or null.
+ */
+function gateMerged(dir, branch) {
+    const head = headSha(dir);
+    const base = git(dir, ["rev-parse", `origin/${DEV}`]);
+    if (base === null || !readPackageJson(dir).ok)
+        return `landing gate for ${branch} cannot run: no base or unreadable package.json — nothing pushed`;
+    const diff = minPushOutside(dir, base, head, minPushPathspecs(readBkitConfig(dir)));
+    if (!diff.ok)
+        return `landing gate for ${branch} cannot classify the merge: ${diff.stderr}`;
+    const gate = diff.outside.length === 0 ? "bkit:gate:min" : requiredPushGate(dir);
+    if (!gate)
+        return `${branch} has no declared landing gate — nothing pushed`;
+    const status = runPushGate(dir, gate, () => { });
+    if (status !== 0)
+        return `landing ${gate} failed (exit ${status}) on the merge of ${branch} — nothing pushed`;
+    return null;
+}
 /**
  * Publish a commit dev refused through its own `branch` PR titled `title`,
  * merged with an empty body. Builds on a branch an earlier attempt left: its
@@ -1379,6 +1402,10 @@ async function closePr(ctx, dir, o) {
             runGit(dir, ["merge", "--abort"]);
             return { failed: `merge commit of origin's ${branch} at ${tip} failed: ${made.stderr}` };
         }
+        // The merge commit is pushed without checkLanding, and a [skip ci] squash runs no CI.
+        const gated = gateMerged(dir, branch);
+        if (gated !== null)
+            return { failed: gated };
     }
     const head = headSha(dir);
     if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
diff --git a/docs/security.md b/docs/security.md
index 0b2154d8a..49e9b1ad1 100644
--- a/docs/security.md
+++ b/docs/security.md
@@ -90,6 +90,8 @@ Action SHA-pinning and the dependency-update pipeline (Renovate / Dependabot, Tr
 - `bkit-cloud.yml` does not dispatch on Renovate PRs.
 - As a result, a compromised dependency PR cannot reach agent API credentials.
 
+**No workflow on a `[skip ci]` push to `dev`:** no workflow runs on it, the secret scan included. A landing's content is checked only by the local landing gate (`bkit:gate:min` or the full push gate) before the push, including the merge of a leftover `ship-close/{FID}` or `ship-failed/{FID}` tip.
+
 **Scanner isolation:** The CI vulnerability scanner (e.g. `bkit-trivy.yml`) runs with `contents: read`, `persist-credentials: false` and no secret. Its image or action is pinned by digest, never by a floating tag. Setup is in `.bkit/templates.md` § Trivy.
 
 The shared untrusted-content contract lives in `.bkit/prompts.md` § Untrusted Content & Prompt Injection.
