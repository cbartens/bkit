diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index c3a39bfe6..199d1f02d 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -449,8 +449,10 @@ describe("diff and test base", () => {
   it("build workflow and verify prompt name no origin/dev diff or test base", () => {
     const build = fs.readFileSync(path.join(WORKFLOWS_DIR, "bkit-build.md"), "utf-8");
     const verify = fs.readFileSync(path.join(PROMPTS_DIR, "bkit-build-plan-verify.md"), "utf-8");
-    expect(build).not.toContain("--base=origin/dev");
-    expect(build).toContain("branches scan-diff --paths=");
+    // Only the migration scan names origin/dev: it measures everything the push publishes.
+    const named = build.split("\n").filter((l) => l.includes("--base=origin/dev"));
+    expect(named.length).toBe(1);
+    expect(named[0]).toContain("branches scan-diff --base=origin/dev --paths=");
     const testBase = verify.split("\n").find((l) => l.includes("Your Context names `Test base`"))!;
     expect(testBase).not.toContain("origin/dev");
     expect(testBase).toContain("start commit");
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 7696d2cf7..4f6c00065 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -1187,7 +1187,11 @@ describe("diff per reader", () => {
   // Every agent that reads the run's diff gets a fresh `tmp/bkit-diff-{FID}.md`,
   // written by `context diff` in the same sub-step, just before the agent.
   // Debug runs on dev, so its diff names the base the run started from.
-  const BASE_FLAG: Record<string, string> = { build: "", debug: " {BASE_FLAG}", ship: "" };
+  const BASE_FLAG: Record<string, string> = {
+    build: "",
+    debug: " {BASE_FLAG}",
+    ship: " --base=origin/dev",
+  };
   const READERS: Array<[string, RegExp, string, string[]]> = [
     ["build", /Failure Path/, "abort-handover", ["bkit-debug-abort-handover"]],
     ["build", /Step 10 — /, "build-plan-verify-holistic", ["bkit-build-plan-verify"]],
@@ -2049,13 +2053,30 @@ describe("debug on dev", () => {
     expect(debug).not.toContain("origin/dev..HEAD");
     expect(debug).not.toContain("DIFF_BASE");
     for (const line of commandLines(debug, "context diff")) expect(line).toContain("{BASE_FLAG}");
-    for (const line of commandLines(debug, "branches scan-diff"))
+    for (const line of commandLines(debug, "branches scan-diff").filter(
+      (l) => !l.includes('--marker="[DEBUG-OBSERVE]"'),
+    ))
       expect(line).toContain("{BASE_FLAG}");
     const step2 = section(debug, /Step 2 — Worktree Setup/);
     expect(step2).toContain("`{BASE_FLAG}` = `--base={startSha}` when `startSha` is present");
     expect(step2).not.toContain("`origin/dev` when null");
   });
 
+  it("build migration scan and debug off-dev no-leak scan pass --base=origin/dev", () => {
+    const migration = commandLines(workflow("build"), "branches scan-diff").filter((l) =>
+      l.includes("--paths="),
+    );
+    expect(migration.length).toBeGreaterThan(0);
+    for (const line of migration) expect(line).toContain("--base=origin/dev");
+    const noLeak = commandLines(debug, "branches scan-diff").filter((l) =>
+      l.includes('--marker="[DEBUG-OBSERVE]"'),
+    );
+    expect(noLeak.length).toBeGreaterThan(0);
+    for (const line of noLeak) expect(line).not.toContain("{BASE_FLAG}");
+    expect(debug).toContain("--base=origin/dev");
+    expect(debug).toContain("--base={startSha}");
+  });
+
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
@@ -2095,6 +2116,18 @@ describe("debug on dev", () => {
   });
 });
 
+describe("ship deferred sweep base", () => {
+  it("ship sweep and Failure Path context diff lines pass --base=origin/dev", () => {
+    const ship = workflow("ship");
+    const lines = commandLines(ship, "context diff");
+    for (const step of ["ship-deferred-sweep", "abort-handover"]) {
+      const hit = lines.filter((l) => l.includes(`--step=${step}`));
+      expect(hit.length, step).toBeGreaterThan(0);
+      for (const line of hit) expect(line, step).toContain("--base=origin/dev");
+    }
+  });
+});
+
 describe("input files", () => {
   const INPUT_DATES =
     "- **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.";
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 46ac139e6..0409dcd00 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -2185,6 +2185,16 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
   });
 
+  it("scan-diff without --base finds a marker the branch added when local dev already contains the branch", async () => {
+    const { clone } = withOrigin("scan-contained");
+    git(clone, "checkout", "-q", "-b", "feat/1-x");
+    commit(clone, { "src/x.ts": "log('[DEBUG-OBSERVE] x')\n" }, "probe");
+    git(clone, "branch", "-f", "dev", "HEAD");
+    const r = await run(clone, ["scan-diff", "--marker=[DEBUG-OBSERVE]", "--expect-none"]);
+    expect(r.code).toBe(1);
+    expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
+  });
+
   it("--marker reads a diff over 1 MiB", async () => {
     const { clone } = featureBranch("scan-bigdiff");
     const big = `${"x".repeat(99)}\n`.repeat(12_000);
diff --git a/.bkit/core/engine/commands/workflow/feature-base.test.ts b/.bkit/core/engine/commands/workflow/feature-base.test.ts
index 7dbf2d6b9..353416aa7 100644
--- a/.bkit/core/engine/commands/workflow/feature-base.test.ts
+++ b/.bkit/core/engine/commands/workflow/feature-base.test.ts
@@ -53,4 +53,13 @@ describe("featureBase and defaultRange", () => {
     expect(featureBase(dir)).toBe(ahead);
     expect(defaultRange(dir)).toEqual({ base: ahead, range: `${ahead}..HEAD` });
   });
+
+  it("featureBase falls back to the origin/dev meeting point when local dev already contains HEAD", () => {
+    const { dir, base } = repo();
+    commit(dir, "b.txt", "b");
+    g(dir, "branch", "-f", "dev", "HEAD");
+    const head = g(dir, "rev-parse", "HEAD");
+    expect(featureBase(dir)).not.toBe(head);
+    expect(featureBase(dir)).toBe(base);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/feature-base.ts b/.bkit/core/engine/commands/workflow/feature-base.ts
index 71f2663a5..638754d8d 100644
--- a/.bkit/core/engine/commands/workflow/feature-base.ts
+++ b/.bkit/core/engine/commands/workflow/feature-base.ts
@@ -17,6 +17,8 @@ export function featureBase(cwd: string, log: (line: string) => void = () => und
   if (o === null || o === "") return ORIGIN_DEV;
   const l = git(cwd, ["merge-base", "HEAD", "refs/heads/dev"]);
   if (l === null || l === "" || l === o) return o;
+  // Local dev already contains HEAD: its meeting point is HEAD itself, an empty range.
+  if (l === git(cwd, ["rev-parse", "HEAD"])) return o;
   const isAncestor = (a: string, b: string) =>
     git(cwd, ["merge-base", "--is-ancestor", a, b]) !== null;
   if (isAncestor(o, l)) return l;
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 3f3b42008..10f53ea7c 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -1272,9 +1272,9 @@ This block appends the roadmap row in the worktree only, closes and commits the
      - **If** one is found → **Failure Path**.
      - **Else** → sub-step 2.
    - **Else** → sub-step 2.
-2. Scan the branch for migrations:
+2. Scan everything the push publishes for migrations, measured from `origin/dev`:
    ```bash
-   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null
+   "{BKIT}" branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/' >/dev/null
    ```
    Route:
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index f148d6ef1..2978853f6 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -306,7 +306,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty; `{NOLEAK_BASE}` = `--base={startSha}` when `startSha` is present, else `--base=origin/dev` (the no-leak scan measures everything the push publishes, including unpushed local `dev` commits).
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -734,7 +734,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index bc399e228..24c9fd466 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -106,7 +106,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
 4. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -527,7 +527,7 @@ Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failur
    ```
    Write the run's diff to the file the agent reads:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    Get the sweep's own invocation id from the engine and keep the printed `invocation` as `INVOCATION`. The invocation, its operations and their receipts are recorded in the book-root status file (`{STATUS}` under `$BOOK_ROOT`), so a resumed ship run reuses them:
    ```bash
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 28a859d6f..485318f20 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -977,7 +977,7 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 | 13 — Diagnose Failure | `@bkit-debug-failure-diagnose` (only if Step 12 FAIL) | Reads the committed Step 12 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 13-14 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
 | 14 — Remediate Failure | `@bkit-debug-failure-remediate` (only if Step 12 FAIL) | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 12 (its next row is the next `TEST_ATTEMPT`). |
 | 15 — Summary | `bkit workflows summary` | Unticked plan tasks, or no plan file (`No plan file`) → FAIL. A group's execute or gaps-fix FAIL answered by that group's later non-FAIL verify, or a challenge FAIL answered by its fix tasks or a Decision Pause, is a CONCERNS reason. A group's verify FAIL is resolved by a later passing holistic verify, and a group-gate FAIL by a later passing Step 12 run, because a Decision Pause `Fix now` can move the fix into a new group so the failed group is never checked again. Commit `chore({FID}): summary` → open-PR probe → push (`-u origin {BRANCH}`). PR already open (resumed build) → push would fire CI + cloud auto-router on a branch build is still writing → probe stops run first (same probe as Step 16). `bkit-cloud.yml` backstop: no-op while build runs (`.bkit/cloud.md` § Branch-aware routing). |
-| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --paths='(^\|/)(migrations\|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --base=origin/dev --paths='(^\|/)(migrations\|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path includes handover:** when exhausted retry counts trigger it, it invokes `@bkit-debug-abort-handover` and posts the `Workflow Handover` comment.
 
@@ -1078,7 +1078,7 @@ The following table describes the local discovery route and shared step mechanic
 | 8 — Failure Remediate Soak | `@bkit-debug-failure-soak` (only if `DEBUG_MODE` = SOAK) | `SOAK_ATTEMPT` = soak rows across every debug run of the feature + 1 (`--count-field=soakAttempt=debug-failure-soak:next:all`). One accumulating context (reads its prior `debug-failure-soak-*-log.md`) applies the single next instrument-or-fix step against the failing boundary (the real model/DB/stream behind a live tier when one ran, else the failing tier the run surfaced); adds `[DEBUG-OBSERVE]` scaffolding and strips every marker before any declared fix (no-leak); commits `fix({FID}): soak {description}`. → loop to Step 3. Bounded by `debug.soak.maxAttempts`, counted across the feature's debug runs. |
 | 9 — Push Remediation | — | (PASS after a fix) Status file-only (no intermediate commit so Step 7/8's `fix(...)` stays HEAD at push). PR-mode: append `bkit [verbose ci]` to PR title if absent. Push (skipped on `dev`: the Step 11 close pushes). → Step 10. |
 | 10 — Summary | `bkit workflows summary` | Commit `chore({FID}): summary{VERBOSE_SUFFIX}` → push (skipped on `dev`). `SUMMARY_VERDICT` = PASS / CONCERNS → Step 11; FAIL → Failure Path. |
-| 11 — Close Workflow | — | A live `prs probe --head` (any base; skipped on `dev` / `main`) sets `{PR_OPEN}` and re-records `PUSH_MODE` (`bkit status meta --push-mode`); labels, the subject suffix, the title strip and `TRIGGER_PR` all key on it, not on the Step-1 value. No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`bkit branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none`, exit 1 on a hit: added lines of the run's diff, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, not a tree-wide `git grep`, so the bkit-managed prompt / command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR open: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`) via `bkit branches push --commit= --label=` (one per run, `engine-action` row). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. On `dev` the close pushes through `bkit branches push --mode=dev --require-ci` (the run's own commits; the pushed `sha` is `{DEV_SHA}` and the close is recorded against it), then `runs dispatch --sha`, `runs wait --until=completed` and `runs gate --capstone-only` on that sha run before `locks release`; `skipped: no-run-commits` (every run commit already on `origin/dev`) → narrated, no CI run gated, lock released; a red run, a refused push or a replay conflict → Failure Path naming the run. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 11 — Close Workflow | — | A live `prs probe --head` (any base; skipped on `dev` / `main`) sets `{PR_OPEN}` and re-records `PUSH_MODE` (`bkit status meta --push-mode`); labels, the subject suffix, the title strip and `TRIGGER_PR` all key on it, not on the Step-1 value. No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`bkit branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none` (`{NOLEAK_BASE}` = `--base={startSha}` in place on `dev`, else `--base=origin/dev`), exit 1 on a hit: added lines of the run's diff, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, not a tree-wide `git grep`, so the bkit-managed prompt / command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR open: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`) via `bkit branches push --commit= --label=` (one per run, `engine-action` row). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. On `dev` the close pushes through `bkit branches push --mode=dev --require-ci` (the run's own commits; the pushed `sha` is `{DEV_SHA}` and the close is recorded against it), then `runs dispatch --sha`, `runs wait --until=completed` and `runs gate --capstone-only` on that sha run before `locks release`; `skipped: no-run-commits` (every run commit already on `origin/dev`) → narrated, no CI run gated, lock released; a red run, a refused push or a replay conflict → Failure Path naming the run. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path** includes a conditional handover via `@bkit-debug-abort-handover` when max-retry is exhausted → `debug-handover.md`. In PR mode `bkit [verbose ci]` is kept (not stripped), because the investigator wants verbose CI to continue (§ `bkit [verbose ci]` Marker Propagation, cleanup invariant).
 
diff --git a/dist/commands/workflow/feature-base.js b/dist/commands/workflow/feature-base.js
index 0b762268e..81d9e4e1a 100644
--- a/dist/commands/workflow/feature-base.js
+++ b/dist/commands/workflow/feature-base.js
@@ -16,6 +16,9 @@ export function featureBase(cwd, log = () => undefined) {
     const l = git(cwd, ["merge-base", "HEAD", "refs/heads/dev"]);
     if (l === null || l === "" || l === o)
         return o;
+    // Local dev already contains HEAD: its meeting point is HEAD itself, an empty range.
+    if (l === git(cwd, ["rev-parse", "HEAD"]))
+        return o;
     const isAncestor = (a, b) => git(cwd, ["merge-base", "--is-ancestor", a, b]) !== null;
     if (isAncestor(o, l))
         return l;
