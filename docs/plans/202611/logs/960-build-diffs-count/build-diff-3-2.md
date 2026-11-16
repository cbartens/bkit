diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index a5900bb83..43b1891a8 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -1227,9 +1227,9 @@ This block appends the roadmap row in the worktree only, closes and commits the
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
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index 8ad0575b5..19ce5ddb5 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -266,7 +266,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty; `{NOLEAK_BASE}` = `--base={startSha}` when `startSha` is present, else `--base=origin/dev` (the no-leak scan measures everything the push publishes, including unpushed local `dev` commits).
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -678,7 +678,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index a24ae25ce..699f8f6e6 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -88,7 +88,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
 4. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-debug-abort-handover.md` using `view_file` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -483,7 +483,7 @@ Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failur
    ```
    Write the run's diff to the file the agent reads:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    Get the sweep's own invocation id from the engine and keep the printed `invocation` as `INVOCATION`. The invocation, its operations and their receipts are recorded in the book-root status file (`{STATUS}` under `$BOOK_ROOT`), so a resumed ship run reuses them:
    ```bash
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 7b747696e..cb8dc5d65 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -1227,9 +1227,9 @@ This block appends the roadmap row in the worktree only, closes and commits the
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
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 6bc61bcb9..ad8457d0c 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -266,7 +266,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty; `{NOLEAK_BASE}` = `--base={startSha}` when `startSha` is present, else `--base=origin/dev` (the no-leak scan measures everything the push publishes, including unpushed local `dev` commits).
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -678,7 +678,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index f6815104c..b09c82e29 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -88,7 +88,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
 4. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -483,7 +483,7 @@ Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failur
    ```
    Write the run's diff to the file the agent reads:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    Get the sweep's own invocation id from the engine and keep the printed `invocation` as `INVOCATION`. The invocation, its operations and their receipts are recorded in the book-root status file (`{STATUS}` under `$BOOK_ROOT`), so a resumed ship run reuses them:
    ```bash
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index ec99b64bc..d6e236c35 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
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
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 9813b7a13..e2eb9f811 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -1172,9 +1172,9 @@ This block appends the roadmap row in the worktree only, closes and commits the
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
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index e86529bb6..42b1e0059 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -232,7 +232,7 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty; `{NOLEAK_BASE}` = `--base={startSha}` when `startSha` is present, else `--base=origin/dev` (the no-leak scan measures everything the push publishes, including unpushed local `dev` commits).
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -626,7 +626,7 @@ _No tracker connected, skip step._
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index efe23a628..72c453d21 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -79,7 +79,7 @@ _No tracker connected, skip step._
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
 4. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -447,7 +447,7 @@ Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failur
    ```
    Write the run's diff to the file the agent reads:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    Get the sweep's own invocation id from the engine and keep the printed `invocation` as `INVOCATION`. The invocation, its operations and their receipts are recorded in the book-root status file (`{STATUS}` under `$BOOK_ROOT`), so a resumed ship run reuses them:
    ```bash
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
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 4d4754446..44efde66c 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10316,7 +10316,7 @@ Open-PR probe ran
 `REF` empty → `{FID}`. Hold the close's `commentFile`, `tracker` and `finalReturn` under the names sub-step 3 uses: `CLOSE_COMMENT_FILE`, `CLOSE_TRACKER`, `FINAL_RETURN`.
 **If** `CLOSE_TRACKER`.done = false → post the content of `CLOSE_COMMENT_FILE` via the tracker MCP (**Comments** fallback).
 Before creating the PR, probe for an open PR that already exists on `{BRANCH}`:
-Scan the branch for migrations:
+Scan everything the push publishes for migrations, measured from `origin/dev`:
 **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
 [commits] Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
 Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
diff --git a/.bkit/version b/.bkit/version
index 2fd83a0d1..d8ef6493d 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,11 +15,11 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
-    ".claude/commands/bkit-build.md": "e19fa533661b28c1b1f9caed5df63ba06de79106b3087657a1af821fdc93f42c",
-    ".claude/commands/bkit-debug.md": "4f41cd5826ef2a880dd8f3cba9de9bfe3d4fd7d114969a89f684951e05a488d0",
+    ".claude/commands/bkit-build.md": "6202748fbe530d92e175130dcf58732fdef0ac932bba23c1ba156c81a625fed1",
+    ".claude/commands/bkit-debug.md": "74d02aa5790abf40e18aa7f5646f5a63aef11d4f7b9cc5820fdae89e9803a702",
     ".claude/commands/bkit-design.md": "0757693c8e91c830aa36220a928a72d81aedb72cc51207364319214bd3902c6a",
     ".claude/commands/bkit-plan.md": "10d26eccf148db714a03d5883f1a95722dcab09d29c34d3532245e188ff4abe2",
-    ".claude/commands/bkit-ship.md": "ef1dbe5e65a0d289cf6a4014f0bc016667276a0658fe90b969bc6f78ef847e5e",
+    ".claude/commands/bkit-ship.md": "52e01012e29a5e258149a9410a43a303b922f5436221249e5bf0ae61d9cbeef6",
     ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
@@ -47,11 +47,11 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
-    ".cursor/commands/bkit-build.md": "62c0411e745aa287505e1c369d3f7ed74487231de0986c425bb3d8a02c50ab11",
-    ".cursor/commands/bkit-debug.md": "eec74fe3cee1540f24731402df37503604243edc7c61e200380287bfbf950d46",
+    ".cursor/commands/bkit-build.md": "6058153be102623abb03fb5ac91d6d31aedfd9ceab431f7e6028ca6ac6ec1c50",
+    ".cursor/commands/bkit-debug.md": "d0c1852766ce5ba5d2472b36a2664fed22217e1cbb8b92b9c718430116413972",
     ".cursor/commands/bkit-design.md": "8129e74e460ed742c62fb07830d099d365b6981c7094960eaeecd27811803e2b",
     ".cursor/commands/bkit-plan.md": "54493f905560e350148948e666c12b5f92b328bcab6af88608fdcee9006458c8",
-    ".cursor/commands/bkit-ship.md": "47102397a3c914fdcff5066b5c57de059b8607f4a85f0ea2c5c2f852e47cba0d",
+    ".cursor/commands/bkit-ship.md": "e1237c939d936f9ee9cd6ef14a387f3f52f76e17f0877ef64e66a5f4a5ceb874",
     ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
@@ -105,11 +105,11 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
-    ".opencode/commands/bkit-build.md": "0a87ef848c78dc50fcdfc13b3f1b03bea09fab231b48059a71d3cdbec8dee864",
-    ".opencode/commands/bkit-debug.md": "bce88564ceb9b4795c44e827f6a44cc78dbab7f3b61aba648d68a354fb9615e4",
+    ".opencode/commands/bkit-build.md": "24fbdfc460fd7e69528b07bdac23a7d2266d064f1e0a3d060e05fd3409dc78cd",
+    ".opencode/commands/bkit-debug.md": "19abeffab018f587215a24012550edb17c607934625249740948a5aad34b3122",
     ".opencode/commands/bkit-design.md": "0d78ce47215552943f6628ddb8fadcae403ab219413e331289349b65e9955953",
     ".opencode/commands/bkit-plan.md": "d7d6d757dec7dfefe9630b273ab0348de156e2af4dc723519ce33f2db751b0b8",
-    ".opencode/commands/bkit-ship.md": "da35e57e9df035ab93a8891c4b197fe1972eff5e003cecbbad6a208ec3f68d90",
+    ".opencode/commands/bkit-ship.md": "b518236286a822f34c9a944094b6e43a1b3e0d929794eaa6c4d6a796faaa951f",
     ".claude/agents/bkit-design-spike.md": "334a96f4f3fdb0a190c8d4cca32c38bee577138fd4acf51036302b325964e889",
     ".cursor/agents/bkit-design-spike.md": "06729e7a0ffa9f98b109433b56dcfc1e3d0afad12c55250a28eee91549ea45a3",
     ".opencode/agents/bkit-design-spike.md": "28e5d35f911887fe7b08a74983a48fc131cd5693b7546af8623e9bc75f8e54f4",
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
 
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index bafca1f72..b73e119a8 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -1226,9 +1226,9 @@ This block appends the roadmap row in the worktree only, closes and commits the
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
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index 6c83a6e68..8e83e5c32 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -265,7 +265,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty; `{NOLEAK_BASE}` = `--base={startSha}` when `startSha` is present, else `--base=origin/dev` (the no-leak scan measures everything the push publishes, including unpushed local `dev` commits).
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -677,7 +677,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index b3366b49b..1e6cca9e2 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -87,7 +87,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
 4. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -482,7 +482,7 @@ Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failur
    ```
    Write the run's diff to the file the agent reads:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    Get the sweep's own invocation id from the engine and keep the printed `invocation` as `INVOCATION`. The invocation, its operations and their receipts are recorded in the book-root status file (`{STATUS}` under `$BOOK_ROOT`), so a resumed ship run reuses them:
    ```bash
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 291de32de..caee40d35 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -1225,9 +1225,9 @@ This block appends the roadmap row in the worktree only, closes and commits the
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
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index 146e1eb77..6fb5cbd77 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -264,7 +264,7 @@ Debug Feature — Autonomous diagnosis and remediation
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty; `{NOLEAK_BASE}` = `--base={startSha}` when `startSha` is present, else `--base=origin/dev` (the no-leak scan measures everything the push publishes, including unpushed local `dev` commits).
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -676,7 +676,7 @@ Debug Feature — Autonomous diagnosis and remediation
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 2338f4e46..96a4d41c7 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -86,7 +86,7 @@ Ship Feature — Autonomous merge and archive
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
 4. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `/bkit-debug-abort-handover` using `Task` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -481,7 +481,7 @@ Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failur
    ```
    Write the run's diff to the file the agent reads:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    Get the sweep's own invocation id from the engine and keep the printed `invocation` as `INVOCATION`. The invocation, its operations and their receipts are recorded in the book-root status file (`{STATUS}` under `$BOOK_ROOT`), so a resumed ship run reuses them:
    ```bash
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index a437e5237..972f8e92d 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -1229,9 +1229,9 @@ This block appends the roadmap row in the worktree only, closes and commits the
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
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index 56e3e4565..05fd04389 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -268,7 +268,7 @@ $ARGUMENTS
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty; `{NOLEAK_BASE}` = `--base={startSha}` when `startSha` is present, else `--base=origin/dev` (the no-leak scan measures everything the push publishes, including unpushed local `dev` commits).
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -680,7 +680,7 @@ $ARGUMENTS
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {NOLEAK_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 30debd702..18559dbbc 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -90,7 +90,7 @@ $ARGUMENTS
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
 4. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `/bkit-debug-abort-handover` using `subagent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -485,7 +485,7 @@ Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failur
    ```
    Write the run's diff to the file the agent reads:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base=origin/dev --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    Get the sweep's own invocation id from the engine and keep the printed `invocation` as `INVOCATION`. The invocation, its operations and their receipts are recorded in the book-root status file (`{STATUS}` under `$BOOK_ROOT`), so a resumed ship run reuses them:
    ```bash
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
