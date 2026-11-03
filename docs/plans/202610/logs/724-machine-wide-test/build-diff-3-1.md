diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
index 42d2dc0e4..172f97f19 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
@@ -99,6 +99,7 @@ tools:
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
    - Fix those files in the same pass as the failure.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
index 6cf5ec49b..a0fc0cdb2 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
@@ -115,6 +115,9 @@ tools:
 9. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 10. Run `bkit tests changed --fallback=bkit:gate:static`. Every local lint and typecheck must pass.
+
+- **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
+
 11. **If** the tasks are verified (their tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 12. Set `Verdict` in **Create** with `Edit`:
     - `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 887481d2b..c893502e5 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -79,6 +79,7 @@ tools:
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
    - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+     - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
 8. **If** a test-first audit report is supplied (its header has `Enforced`, `Verdict` and `Gaps`) → decide each of its gaps. A gap's `fixable` stands unless it is `null`. Decide each `null` one from the diff it names:
    - `delete-still-referenced` → read each hit:
      - **If** the hit is a different thing with the same name → no gap.
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md b/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
index 7366cf6da..f54225375 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
@@ -72,6 +72,7 @@ tools:
    - Task-runner / build config → merge both sides' task definitions.
    - Ordered database migrations → resequence them so each new file sorts after every migration already applied upstream.
 8. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass.
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - **If** any declared live tests were failing → the remediation is done only when those same live tests pass.
 9. **If** the last local test run has failures → document the errors in the output, and set `Verdict` = `FAIL`.
 10. **If** the remediations are verified (the tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 8ea6d16c5..3ae5c037d 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -367,8 +367,8 @@ Run the deepest declared local gate, or one test file to record a red and audit
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `changed` | by hand | `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run. |
-| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
+| `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
+| `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
 | `plan-check` | by hand | **`--plan`** `--existence` **`--log`** | Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json `bkit.workflows.tasks` (defaults: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a `Task` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 657b2f4b8..1e6ddbaaa 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -367,8 +367,8 @@ Run the deepest declared local gate, or one test file to record a red and audit
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `changed` | by hand | `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run. |
-| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
+| `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
+| `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
 | `plan-check` | by hand | **`--plan`** `--existence` **`--log`** | Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json `bkit.workflows.tasks` (defaults: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a `Task` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused. |
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index bf97c8562..2120c078d 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -202,14 +202,14 @@ Canonical per-agent metadata, and the single source of truth for each agent's mo
 | `bkit-build-plan-current` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | judge plan vs changes landed since its base commit |
 | `bkit-build-install-skills` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | skill identifier |
 | `bkit-build-plan-tests` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | writes one task group's planned tests before its code (test files only); uses the machine lock for shared services |
-| `bkit-build-plan-tasks` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | task executor for one task group (source modifier with test loop); uses the machine lock for shared services |
-| `bkit-build-plan-verify` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 100 | verify one group, or the whole plan once, vs the plan |
-| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services |
+| `bkit-build-plan-tasks` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | task executor for one task group (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
+| `bkit-build-plan-verify` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 100 | verify one group, or the whole plan once, vs the plan; re-runs tests-lock waits |
+| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
 | `bkit-build-challenge-1` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | parallel slot 1 (bug-hunting lens) |
 | `bkit-build-challenge-2` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 200 | parallel slot 2 (security lens; depth-sensitive — both opus) |
 | `bkit-debug-failure-reproduce` | `claude-opus-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | failing tests from a bug report, no fix; opus over the sonnet test-writer tier — an off-symptom test sends the fix loop after the wrong bug |
 | `bkit-debug-failure-diagnose` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 200 | failure diagnosis (Final-strategy attempts especially benefit from depth before human handover) |
-| `bkit-debug-failure-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 200 | implement diagnosis fixes (source modifier with test loop) |
+| `bkit-debug-failure-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 200 | implement diagnosis fixes (source modifier with test loop); re-runs tests-lock waits |
 | `bkit-debug-failure-soak` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | soak fix — one accumulating-context instrument-or-fix step per iteration against the live boundary (orchestrator re-runs tests + loops) |
 | `bkit-debug-abort-handover` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | handover writer |
 | `bkit-ship-conflict-resolve` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 200 | mechanical merge-conflict resolver (source modifier with test loop) |
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 799cd7370..bc8e893a7 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -918,4 +918,5 @@ cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 - Wait: `LOCAL_STACK_LOCK_WAIT_S` when set, else 60 seconds without a TTY, else 3600 seconds. Waiting notes name the budget and holders once a minute; the give-up line names the holder again.
 - A named release records held seconds by checkout in `<name>.last`, with one tab-separated line per checkout. A waiting note and give-up line name the current holder's `last run took <N>m<N>s`, or `no earlier run`.
 - `CI=true` / `CI=1` makes every lock a no-op.
+- `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` and their run name to a wrapped gate; a tests-lock give-up of this run maps 75 → 81 with `lockHolder`, and a tests-lock refusal maps 73 → 4. A lock wait writes no `test-run` status row. Light runs (`red`, `green`, `bkit:test:file`) take no tests lock. Nested wraps reuse their live parent's tests lock. See `docs/testing.md` § Tests lock for host wait budgets.
 - Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`), because the raw command skips the lock. See `.agents/rules.md` § Shared local stack.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index b5e4d22f1..2c17d5ce9 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -284,7 +284,7 @@ Rationale: keeping per-run state on `feat/{FID}` removes the divergence between
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
-| `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. Not folded, never a step's finish row. Step minutes skip it. |
+| `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. A tests-lock wait (exit 81) writes no row. Not folded, never a step's finish row. Step minutes skip it. |
 | `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. A command git launched (a hook, seen by `GIT_EXEC_PATH` in its environment) writes none, so a hook never leaves the tracked status file dirty after a commit. Not folded; step minutes skip it. |
 | `completeness` | `{type, workflow, at, verdict, preJournal, journalSuspect, observed, evidenceHoles, stepHoles, unexercised, unexpected, unattributable, sourceSha}` | The run's completeness verdict, appended at close. `verdict` `CLEAN\|HOLEY` (evidence + step holes only); `preJournal` = the run has no `engine-call` rows (steps-only); `journalSuspect` = closing engine journals but recorded none. A run that closes twice carries one per close; the read path takes the last. Not folded; step minutes skip it. |
 | `ship-gate-refusal` | `{type, workflow, at, exitCode, head}` | One `bkit runs gate` refusal at Step 10, with the gate's exit code and the head it asserted against. Not folded. |
diff --git a/.bkit/core/docs/templates/bkit-audit-testing.md b/.bkit/core/docs/templates/bkit-audit-testing.md
index 675c3b795..8dd64224b 100644
--- a/.bkit/core/docs/templates/bkit-audit-testing.md
+++ b/.bkit/core/docs/templates/bkit-audit-testing.md
@@ -39,7 +39,7 @@ A green suite means the tests passed. It does not mean they could fail, that eve
 - Test-smell catalogue (e.g., xUnit Test Patterns, Meszaros 2007).
 - Test lint (e.g., `@vitest/eslint-plugin`, `eslint-plugin-playwright`, `eslint-plugin-testing-library`, or Oxlint's `vitest` + `typescript` plugins); record each version. typescript-eslint type-aware rules need a TypeScript version it supports; newer → Oxlint `--type-aware` (oxlint-tsgolint).
 - Network mock that fails closed (e.g., MSW); record the major read.
-- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § Test first; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs
+- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § Test first; § Tests lock; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs
 
 ### Scope
 
diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index ad45a2b15..fc826b2ef 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -123,6 +123,20 @@ const GATE_CALLERS: ReadonlyArray<readonly [string, string]> = [
 ];
 
 describe("bkit-local-gate-audit (#437)", () => {
+  it("every prompt that runs bkit tests changed routes exit 81 to a re-run of the command", () => {
+    const callers = GATE_CALLERS.filter(([, call]) => call.startsWith("--fallback=bkit:gate:"));
+    expect(callers).toHaveLength(4);
+    for (const [rel, call] of callers) {
+      const body = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
+      const steps = body.split(/\n(?=\d+\. )/);
+      const step = steps.find((part) => part.includes(call));
+      expect(step, rel).toBeDefined();
+      expect(step, rel).toMatch(/\btests changed\b/);
+      expect(step, rel).toMatch(/(?:exit(?:s)?|exit code)\s+`?81\b/i);
+      expect(step, rel).toMatch(/(?:re-run|rerun|run (?:it|the command|that command) again)/i);
+    }
+  });
+
   describe("no toolchain command is inlined at a call site", () => {
     for (const { pattern, why } of BANNED) {
       it(`\`${pattern}\` appears nowhere unexempted — ${why}`, () => {
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 904cf2b76..bcb95a4d6 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -91,6 +91,51 @@ export interface FlagSpec {
 
 export type FlagValue = string | boolean | string[] | undefined;
 
+/** Parse a whole-number flag, using its fallback only when absent. */
+export const wholeNumber = (v: FlagValue, flag: string, fallback: number, min = 0): number => {
+  if (v === undefined) return fallback;
+  const s = String(v);
+  if (!/^[0-9]+$/.test(s) || Number(s) < min) {
+    throw new CommandError(EXIT.USAGE, `--${flag} takes a whole number >= ${min} (got "${s}")`);
+  }
+  return Number(s);
+};
+
+/** The holder named by this run when its tests-lock wait gave up. */
+export function testsLockHolder(log: string, who: string): string | null {
+  const prefix = `[machine-lock] ❌ ${who} gave up after `;
+  for (const line of log.split(/\r?\n/)) {
+    if (!line.startsWith(prefix)) continue;
+    const holder = /^\d+s waiting for tests, in use by (.+)$/.exec(line.slice(prefix.length));
+    if (holder) return holder[1]!;
+  }
+  return null;
+}
+
+/** Classify only a tests-lock outcome, leaving gate and nested-lock failures intact. */
+export function classifyLockExit({
+  exitCode,
+  log,
+  who,
+}: {
+  exitCode: number;
+  log: string;
+  who: string;
+}): "gate" | "lock-wait" | "could-not-run" {
+  const lines = log.split(/\r?\n/);
+  if (exitCode === 75 && testsLockHolder(log, who) !== null) return "lock-wait";
+  if (
+    exitCode === 73 &&
+    lines.some((line) =>
+      /^\[machine-lock\] ❌ (?:could not take the lock for tests:|cannot take tests while holding )/.test(
+        line,
+      ),
+    )
+  )
+    return "could-not-run";
+  return "gate";
+}
+
 export interface RunContext {
   /** Parsed flags, keyed by camelCase name. */
   flags: Record<string, FlagValue>;
diff --git a/.bkit/core/engine/commands/workflow/issues.test.ts b/.bkit/core/engine/commands/workflow/issues.test.ts
index 6ec82ccf1..53ddbcee2 100644
--- a/.bkit/core/engine/commands/workflow/issues.test.ts
+++ b/.bkit/core/engine/commands/workflow/issues.test.ts
@@ -3,7 +3,7 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 
-import { afterEach, describe, expect, it, vi } from "vitest";
+import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
 import { runCommand } from "../lib";
 import {
@@ -803,6 +803,9 @@ describe("issues reaches the tracker only through tracker.ts", () => {
 describe("bkit issues comment --post", () => {
   const STEP = ["issues", "comment", "--step-number=3", "--step-title=Plan Verify"];
   const saved = process.env.BKIT_LINEAR_API_KEY;
+  beforeEach(() => {
+    delete process.env.BKIT_LINEAR_API_KEY;
+  });
   afterEach(() => {
     vi.unstubAllGlobals();
     if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index e057c6392..cc54ffb67 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -36,6 +36,7 @@ import {
   runGh,
   runGit,
   SKIP_CI_TOKEN,
+  wholeNumber,
   type CommandSpec,
   type FlagSpec,
   type FlagValue,
@@ -1187,15 +1188,6 @@ export const EXIT_SKIP_TOKEN = 4;
 /** Exit code: the pushed head's commit message could not be read for the body scan. */
 export const EXIT_SCAN_ERROR = 5;
 
-const wholeNumber = (v: FlagValue, flag: string, fallback: number, min = 0): number => {
-  if (v === undefined) return fallback;
-  const s = String(v);
-  if (!/^[0-9]+$/.test(s) || Number(s) < min) {
-    throw new CommandError(EXIT.USAGE, `--${flag} takes a whole number >= ${min} (got "${s}")`);
-  }
-  return Number(s);
-};
-
 const HEAD_FLAG: FlagSpec = { name: "head", type: "string", help: "commit SHA" };
 const REPO_FLAG: FlagSpec = {
   name: "repo",
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 25c4f51a6..2837749cc 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -3,7 +3,7 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 
-import { afterEach, describe, expect, it, vi } from "vitest";
+import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
 import { DEFERRAL_WRITERS, KIND_WRITERS } from "../../ledgers/telemetry";
 import { parseText } from "../../shared/text";
@@ -1019,6 +1019,9 @@ describe("bkit steps finish", () => {
 describe("bkit steps finish --post", () => {
   const LOG = "docs/plans/202610/logs/eng-4-x";
   const saved = process.env.BKIT_LINEAR_API_KEY;
+  beforeEach(() => {
+    delete process.env.BKIT_LINEAR_API_KEY;
+  });
   afterEach(() => {
     vi.unstubAllGlobals();
     if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
diff --git a/.bkit/core/engine/commands/workflow/tests-changed.test.ts b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
index 9376cd882..e23e3c127 100644
--- a/.bkit/core/engine/commands/workflow/tests-changed.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
@@ -116,6 +116,23 @@ describe("changedFiles", () => {
 });
 
 describe("tests changed", () => {
+  it("tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate", async () => {
+    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x", [STATIC]: "y" });
+    write("src/a.ts", "changed\n");
+    const results = await Promise.all(
+      ["-1", "1.5", "bad"].map((value) =>
+        changed([`--lock-wait-s=${value}`, `--fallback=${STATIC}`]),
+      ),
+    );
+    expect(results.map((result) => result.code)).toEqual([2, 2, 2]);
+    expect(results.map((result) => result.err)).toEqual([
+      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
+      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
+      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
+    ]);
+    expect(ranWith()).toBeNull();
+  });
+
   it("runs bkit:gate:changed with the changed files as its arguments", async () => {
     checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x", [STATIC]: "y" });
     write("src/a.ts", "changed\n");
diff --git a/.bkit/core/engine/commands/workflow/tests-changed.ts b/.bkit/core/engine/commands/workflow/tests-changed.ts
index 8a60f777d..d65a4e529 100644
--- a/.bkit/core/engine/commands/workflow/tests-changed.ts
+++ b/.bkit/core/engine/commands/workflow/tests-changed.ts
@@ -11,7 +11,15 @@ import * as os from "node:os";
 import * as path from "node:path";
 
 import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest.js";
-import { CommandError, EXIT, git, type VerbSpec } from "../lib.js";
+import {
+  classifyLockExit,
+  CommandError,
+  EXIT,
+  git,
+  testsLockHolder,
+  wholeNumber,
+  type VerbSpec,
+} from "../lib.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 
@@ -48,12 +56,21 @@ function declares(dir: string, name: string): boolean {
  * Run argv in `cwd` with stdout and stderr interleaved, each output line passed to `log`.
  * Exit 127 when the binary is missing; 128 + n when killed by signal n.
  */
-function runLogged(argv: string[], cwd: string, log: (line: string) => void): number {
+function runLogged(
+  argv: string[],
+  cwd: string,
+  log: (line: string) => void,
+  env: Record<string, string>,
+): number {
   const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-changed-"));
   const file = path.join(dir, "out.log");
   try {
     const fd = fs.openSync(file, "w");
-    const res = spawnSync(argv[0]!, argv.slice(1), { cwd, stdio: ["ignore", fd, fd] });
+    const res = spawnSync(argv[0]!, argv.slice(1), {
+      cwd,
+      stdio: ["ignore", fd, fd],
+      env: { ...process.env, ...env },
+    });
     fs.closeSync(fd);
     for (const line of fs
       .readFileSync(file, "utf-8")
@@ -72,9 +89,14 @@ function runLogged(argv: string[], cwd: string, log: (line: string) => void): nu
 }
 
 export const testsChangedVerb: VerbSpec = {
-  summary: `Check only the files changed since --base: run \`${BKIT_GATE_CHANGED_SCRIPT}\` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run.`,
+  summary: `Check only the files changed since --base: run \`${BKIT_GATE_CHANGED_SCRIPT}\` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held.`,
   use: "by-hand",
   flags: [
+    {
+      name: "lock-wait-s",
+      type: "string",
+      help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
+    },
     {
       name: "base",
       type: "string",
@@ -92,12 +114,21 @@ export const testsChangedVerb: VerbSpec = {
     scope: "the command that ran, without the file arguments, or null",
     exitCode: "the gate's exit code, or null when nothing ran",
     verdict: "PASS / FAIL, or null when nothing ran or the gate could not run",
+    lockHolder: "tests-lock holder when the wait gave up, else null",
   },
   exitCodes: {
     [EXIT_NO_GATE]: `neither \`${BKIT_GATE_CHANGED_SCRIPT}\` nor the --fallback gate is declared in package.json`,
     [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
   },
   run: (ctx) => {
+    const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
+    const waitS = wholeNumber(
+      waitSource,
+      ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
+        ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
+        : "lock-wait-s",
+      60,
+    );
     const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
     const base = typeof ctx.flags.base === "string" ? ctx.flags.base : "HEAD";
     if (git(top, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
@@ -113,7 +144,14 @@ export const testsChangedVerb: VerbSpec = {
     let argv: string[];
     if (declares(top, BKIT_GATE_CHANGED_SCRIPT)) {
       if (files.length === 0) {
-        ctx.emit({ files, gate: null, scope: null, exitCode: null, verdict: null });
+        ctx.emit({
+          files,
+          gate: null,
+          scope: null,
+          exitCode: null,
+          verdict: null,
+          lockHolder: null,
+        });
         return EXIT.OK;
       }
       gate = BKIT_GATE_CHANGED_SCRIPT;
@@ -130,10 +168,28 @@ export const testsChangedVerb: VerbSpec = {
     }
     const scope = scriptCommand(gate).join(" ");
     ctx.log(`running ${scope}`);
-    const exitCode = runLogged(argv, top, ctx.log);
-    const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
-    const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
-    ctx.emit({ files, gate, scope, exitCode, verdict });
+    const who = `bkit tests changed ${gate}`;
+    const lines: string[] = [];
+    const exitCode = runLogged(
+      argv,
+      top,
+      (line) => {
+        lines.push(line);
+        ctx.log(line);
+      },
+      {
+        LOCAL_STACK_LOCK_WAIT_S: String(waitS),
+        LOCAL_STACK_LOCK_WHO: who,
+      },
+    );
+    const log = lines.join("\n");
+    const lockExit = classifyLockExit({ exitCode, log, who });
+    const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
+    const lockWait = lockExit === "lock-wait";
+    const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
+    const lockHolder = lockWait ? testsLockHolder(log, who) : null;
+    ctx.emit({ files, gate, scope, exitCode, verdict, lockHolder });
+    if (lockWait) return EXIT.AGENT_WAIT;
     if (couldNotRun) return EXIT_COULD_NOT_RUN;
     return exitCode === 0 ? EXIT.OK : EXIT.NO;
   },
diff --git a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
new file mode 100644
index 000000000..e54a50a42
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
@@ -0,0 +1,400 @@
+import { type ChildProcess, spawn, spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { setTimeout as delay } from "node:timers/promises";
+
+import { afterEach, beforeEach, describe, expect, it } from "vitest";
+
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+import { requireTsx } from "../../../../../vitest.tsx-bin";
+
+const BUDGET = tierTimeouts(true);
+const CLI = path.resolve(".bkit/core/engine/cli.ts");
+const TEMPLATE = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
+const GATE = "bkit:gate:static-unit";
+const TEST = "src/planned.test.ts";
+const NAME = "planned failure";
+
+interface Result {
+  status: number | null;
+  stdout: string;
+  stderr: string;
+  ms: number;
+}
+interface GateEvent {
+  event: "start" | "end";
+  id: string;
+  at: number;
+  env: Record<string, string>;
+  nested: number | null;
+}
+let tmp: string;
+let cwd: string;
+let cache: string;
+let eventsFile: string;
+let env: NodeJS.ProcessEnv;
+let children: ChildProcess[];
+
+function git(...args: string[]): void {
+  const result = spawnSync(
+    "git",
+    [
+      "-c",
+      "user.name=Test",
+      "-c",
+      "user.email=test@example.invalid",
+      "-c",
+      "commit.gpgsign=false",
+      ...args,
+    ],
+    { cwd, env, encoding: "utf-8" },
+  );
+  expect(result.status, result.stderr).toBe(0);
+}
+
+beforeEach(() => {
+  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-lock-")));
+  cwd = path.join(tmp, "consumer");
+  cache = path.join(tmp, "cache");
+  eventsFile = path.join(tmp, "events.jsonl");
+  children = [];
+  env = {
+    ...process.env,
+    XDG_CACHE_HOME: cache,
+    BKIT_ENGINE_JOURNAL: "off",
+    GATE_EVENTS: eventsFile,
+  };
+  for (const key of Object.keys(env)) {
+    if (
+      key.startsWith("GIT_") ||
+      key.startsWith("LOCAL_STACK_LOCK_") ||
+      key.startsWith("BKIT_TEST_") ||
+      key === "CI" ||
+      key === "BKIT_LOCK_WAIT_S"
+    )
+      delete env[key];
+  }
+  fs.mkdirSync(path.join(cwd, "scripts", "ci"), { recursive: true });
+  fs.mkdirSync(path.join(cwd, "src"));
+  fs.copyFileSync(TEMPLATE, path.join(cwd, "scripts", "ci", "bkit-machine-lock.sh"));
+  fs.writeFileSync(path.join(cwd, ".gitignore"), "logs/\n");
+  fs.writeFileSync(
+    path.join(cwd, "package.json"),
+    JSON.stringify({
+      private: true,
+      scripts: {
+        [GATE]: "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs",
+        "bkit:gate:changed":
+          "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs",
+        "bkit:test:file": "node report.mjs",
+      },
+    }),
+  );
+  fs.writeFileSync(
+    path.join(cwd, "gate.mjs"),
+    [
+      'import fs from "node:fs";',
+      'import { spawnSync } from "node:child_process";',
+      'import { setTimeout as delay } from "node:timers/promises";',
+      'const record = (event, nested = null) => fs.appendFileSync(process.env.GATE_EVENTS, JSON.stringify({event, id: process.env.GATE_ID || "gate", at: Date.now(), env: Object.fromEntries(["BKIT_TEST_WORKERS", "LOCAL_STACK_LOCK_OWNER_tests", "LOCAL_STACK_LOCK_WAIT_S", "LOCAL_STACK_LOCK_WHO"].map(key => [key, process.env[key] || ""])), nested}) + "\\n");',
+      'record("start");',
+      "const deadline = Date.now() + 30000;",
+      'while (process.env.GATE_RELEASE_FILE && !fs.existsSync(process.env.GATE_RELEASE_FILE)) { if (Date.now() >= deadline) throw new Error("gate release timed out"); await delay(20); }',
+      'const nested = process.env.GATE_NESTED ? spawnSync("bash", ["scripts/ci/bkit-machine-lock.sh", "run", "nested", "--lock", "tests", "--", "node", "-e", "process.stdout.write(\\\"nested ran\\\")"], {encoding: "utf8", timeout: 3000}) : null;',
+      'if (nested) process.stdout.write(nested.stdout || "");',
+      'record("end", nested ? nested.status : null);',
+      "process.exit(Number(process.env.GATE_EXIT || 0));",
+    ].join("\n"),
+  );
+  fs.writeFileSync(
+    path.join(cwd, "report.mjs"),
+    `import fs from "node:fs";\nfs.writeFileSync(process.env.BKIT_TEST_REPORT, '<testsuite tests="1" failures="1"><testcase name="${NAME}" file="${TEST}"><failure message="planned assertion">expected one to equal two</failure></testcase></testsuite>');\nprocess.exit(1);\n`,
+  );
+  fs.writeFileSync(
+    path.join(cwd, TEST),
+    `import { it, expect } from "vitest";\nit("${NAME}", () => { expect(1).toBe(2); });\n`,
+  );
+  fs.writeFileSync(
+    path.join(cwd, "plan.md"),
+    [
+      "# Plan",
+      "<!-- bkit:group 1 start -->",
+      "### TASK GROUP 1: Example",
+      "<!-- bkit:task 1 start -->",
+      "- [ ] **TASK 1:** Implement the planned behavior",
+      "  - **DONE WHEN:** the assertion passes",
+      "  - **TEST FIRST:**",
+      `    - \`${TEST}\` \`${NAME}\` fails before implementation`,
+      "<!-- bkit:task 1 end -->",
+      "<!-- bkit:group 1 end -->",
+      "",
+    ].join("\n"),
+  );
+  fs.writeFileSync(path.join(cwd, "status.jsonl"), "");
+  git("init", "-q", "-b", "dev");
+  git("add", "--all");
+  git("commit", "-q", "-m", "fixture");
+});
+
+afterEach(() => {
+  for (const child of children) child.kill("SIGKILL");
+  fs.rmSync(tmp, { recursive: true, force: true });
+});
+
+function execute(args: string[], extra: Record<string, string> = {}): Result {
+  const started = Date.now();
+  const result = spawnSync(requireTsx(), [CLI, "tests", ...args, "--json"], {
+    cwd,
+    env: { ...env, ...extra },
+    encoding: "utf-8",
+    timeout: BUDGET.testTimeout,
+  });
+  return {
+    status: result.status,
+    stdout: result.stdout,
+    stderr: result.stderr,
+    ms: Date.now() - started,
+  };
+}
+
+function start(args: string[], extra: Record<string, string> = {}) {
+  const started = Date.now();
+  const child = spawn(requireTsx(), [CLI, "tests", ...args, "--json"], {
+    cwd,
+    env: { ...env, ...extra },
+    stdio: ["ignore", "pipe", "pipe"],
+  });
+  children.push(child);
+  let stdout = "";
+  let stderr = "";
+  child.stdout.on("data", (data: Buffer) => (stdout += data.toString()));
+  child.stderr.on("data", (data: Buffer) => (stderr += data.toString()));
+  const done = new Promise<Result>((resolve) =>
+    child.on("close", (status) => resolve({ status, stdout, stderr, ms: Date.now() - started })),
+  );
+  return { child, done };
+}
+
+async function waitForFile(file: string, text: string, child: ChildProcess): Promise<void> {
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (Date.now() < until) {
+    if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes(text)) return;
+    if (child.exitCode !== null || child.signalCode !== null)
+      throw new Error(`process exited before writing ${text} to ${file}`);
+    await delay(20);
+  }
+  throw new Error(`process did not write ${text} to ${file}`);
+}
+
+async function hold() {
+  const child = spawn(
+    "bash",
+    [
+      "-c",
+      '. scripts/ci/bkit-machine-lock.sh; take_local_stack_lock "external holder" tests || exit 1; exec sleep 30',
+    ],
+    { cwd, env, stdio: "ignore" },
+  );
+  children.push(child);
+  await waitForFile(
+    path.join(cache, "bkit", "machine-lock", "tests.lock.holder"),
+    "external holder",
+    child,
+  );
+  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
+  return { child, done };
+}
+
+const runArgs = (log = "logs/run.md") => ["run", `--gate=${GATE}`, `--log=${log}`];
+const output = (result: Result): Record<string, unknown> => JSON.parse(result.stdout);
+const events = (): GateEvent[] =>
+  fs.existsSync(eventsFile)
+    ? fs
+        .readFileSync(eventsFile, "utf-8")
+        .trim()
+        .split("\n")
+        .map((line) => JSON.parse(line) as GateEvent)
+    : [];
+
+describe("tests lock through a consumer's wrapped gate", () => {
+  it("tests run --file appends no test-run row when it exits 81 on a held tests lock", async () => {
+    await hold();
+    const result = execute([
+      ...runArgs(),
+      "--lock-wait-s=0",
+      "--file=status.jsonl",
+      "--workflow=build",
+      "--step=gate",
+    ]);
+    expect(result.status, result.stderr).toBe(81);
+    expect(output(result)).toMatchObject({
+      row: null,
+      lockHolder: expect.stringContaining("external holder"),
+    });
+    expect(fs.readFileSync(path.join(cwd, "status.jsonl"), "utf-8")).toBe("");
+    expect(events()).toEqual([]);
+  });
+
+  it("tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock", async () => {
+    await hold();
+    fs.appendFileSync(path.join(cwd, TEST), "// a change\n");
+    const result = execute(["changed", `--fallback=${GATE}`, "--lock-wait-s=0"]);
+    expect(result.status, result.stderr).toBe(81);
+    expect(output(result)).toMatchObject({
+      gate: "bkit:gate:changed",
+      lockHolder: expect.stringContaining("external holder"),
+    });
+    expect(result.stderr).toContain("external holder");
+    expect(events()).toEqual([]);
+  });
+
+  it("tests changed with an unwritable lock dir exits 4 naming the path", () => {
+    fs.writeFileSync(cache, "a file cannot hold a lock directory");
+    fs.appendFileSync(path.join(cwd, TEST), "// a change\n");
+    const result = execute(["changed", `--fallback=${GATE}`]);
+    expect(result.status, result.stderr).toBe(4);
+    expect(result.stderr).toContain(path.join(cache, "bkit", "machine-lock"));
+    expect(output(result)).toMatchObject({ verdict: null });
+    expect(events()).toEqual([]);
+  });
+
+  it("tests run waits for a held tests lock and runs the gate once the holder finishes", async () => {
+    const holder = await hold();
+    const run = start([...runArgs(), "--lock-wait-s=10"]);
+    await waitForFile(path.join(cwd, "logs/run.md"), "waiting for tests", run.child);
+    expect(events()).toEqual([]);
+    const releasedAt = Date.now();
+    holder.child.kill("SIGTERM");
+    await holder.done;
+    const result = await run.done;
+    expect(result.status, result.stderr).toBe(0);
+    expect(output(result)).toMatchObject({ verdict: "PASS", lockHolder: null });
+    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
+    expect(events()[0]!.at).toBeGreaterThanOrEqual(releasedAt);
+  });
+
+  it("tests run exits 81 naming the holder when the lock stays held past --lock-wait-s", async () => {
+    await hold();
+    const result = execute([
+      ...runArgs(),
+      "--lock-wait-s=1",
+      "--artifact=logs/artifact.md",
+      "--fid=example",
+      "--step=gate",
+    ]);
+    expect(result.status, result.stderr).toBe(81);
+    expect(output(result)).toMatchObject({
+      lockHolder: expect.stringContaining("external holder"),
+      artifact: null,
+    });
+    expect(result.stderr).toContain("external holder");
+    expect(fs.existsSync(path.join(cwd, "logs/artifact.md"))).toBe(false);
+    expect(events()).toEqual([]);
+  });
+
+  it("tests run holds the tests lock for the whole gate, so a second tests run waits", async () => {
+    const first = start([...runArgs("logs/first.md"), "--lock-wait-s=10"], {
+      GATE_ID: "first",
+      GATE_RELEASE_FILE: path.join(tmp, "release-first"),
+    });
+    await waitForFile(eventsFile, '"event":"start"', first.child);
+    const second = start([...runArgs("logs/second.md"), "--lock-wait-s=10"], { GATE_ID: "second" });
+    await waitForFile(path.join(cwd, "logs/second.md"), "waiting for tests", second.child);
+    expect(events().map((event) => event.id)).toEqual(["first"]);
+    fs.writeFileSync(path.join(tmp, "release-first"), "release");
+    const results = await Promise.all([first.done, second.done]);
+    expect(results.map((result) => result.status)).toEqual([0, 0]);
+    expect(events().map((event) => `${event.id}:${event.event}`)).toEqual([
+      "first:start",
+      "first:end",
+      "second:start",
+      "second:end",
+    ]);
+    expect(events()[2]!.at).toBeGreaterThanOrEqual(events()[1]!.at);
+  });
+
+  it("tests red runs its test file without waiting for a held tests lock", async () => {
+    const holder = await hold();
+    const result = execute([
+      "red",
+      "--file=status.jsonl",
+      "--workflow=build",
+      "--group=1",
+      "--plan=plan.md",
+      "--log=logs/red.md",
+    ]);
+    expect(result.status, result.stderr).toBe(0);
+    expect(output(result)).toMatchObject({
+      tests: [expect.objectContaining({ testName: NAME, state: "red" })],
+    });
+    expect(holder.child.exitCode).toBeNull();
+    expect(result.ms).toBeLessThan(BUDGET.testTimeout / 2);
+    expect(execute([...runArgs(), "--lock-wait-s=0"]).status).toBe(81);
+    expect(events()).toEqual([]);
+  });
+
+  it("tests run under CI=true never waits on a held tests lock", async () => {
+    const holder = await hold();
+    const result = execute(runArgs(), { CI: "true" });
+    expect(result.status, result.stderr).toBe(0);
+    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
+    expect(holder.child.exitCode).toBeNull();
+    expect(execute([...runArgs(), "--lock-wait-s=0"]).status).toBe(81);
+  });
+
+  it("tests run under CI=1 never waits on a held tests lock", async () => {
+    const holder = await hold();
+    const result = execute(runArgs(), { CI: "1" });
+    expect(result.status, result.stderr).toBe(0);
+    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
+    expect(holder.child.exitCode).toBeNull();
+    expect(events()[0]!.env.LOCAL_STACK_LOCK_OWNER_tests).toBe("");
+  });
+
+  it("tests run with an unwritable lock dir exits 4 naming the path", () => {
+    fs.writeFileSync(cache, "a file cannot hold a lock directory");
+    const result = execute(runArgs());
+    expect(result.status, result.stderr).toBe(4);
+    expect(result.stderr).toContain(path.join(cache, "bkit", "machine-lock"));
+    expect(output(result)).toMatchObject({ verdict: null });
+    expect(events()).toEqual([]);
+  });
+
+  it("tests run with --lock-wait-s=0 exits 81 at once against a held lock", async () => {
+    const holder = await hold();
+    const result = execute([...runArgs(), "--lock-wait-s=0"]);
+    expect(result.status, result.stderr).toBe(81);
+    expect(output(result).lockHolder).toEqual(expect.stringContaining("external holder"));
+    expect(result.ms).toBeLessThan(BUDGET.testTimeout / 2);
+    expect(holder.child.exitCode).toBeNull();
+    expect(events()).toEqual([]);
+  });
+
+  it("a gate that itself exits 75 is a FAIL verdict, not a lock wait", () => {
+    const result = execute(runArgs(), { GATE_EXIT: "75" });
+    expect(result.status, result.stderr).toBe(1);
+    expect(output(result)).toMatchObject({ verdict: "FAIL", exitCode: 75 });
+    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
+    expect(events()[0]!.env.LOCAL_STACK_LOCK_OWNER_tests).toMatch(/^[1-9][0-9]*$/);
+  });
+
+  it("the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait", () => {
+    const result = execute([...runArgs(), "--lock-wait-s=2", "--fid=example", "--step=gate"], {
+      GATE_NESTED: "1",
+    });
+    expect(result.status, result.stderr).toBe(0);
+    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
+    expect(events()[0]!.env).toMatchObject({
+      BKIT_TEST_WORKERS: expect.stringMatching(/^[1-9][0-9]*$/),
+      LOCAL_STACK_LOCK_OWNER_tests: expect.stringMatching(/^[1-9][0-9]*$/),
+      LOCAL_STACK_LOCK_WAIT_S: "2",
+      LOCAL_STACK_LOCK_WHO: `bkit tests run ${GATE} example gate`,
+    });
+    expect(events()[1]!.nested).toBe(0);
+    expect(fs.readFileSync(path.join(cwd, "logs/run.md"), "utf-8")).toContain("nested ran");
+    expect(fs.readFileSync(path.join(cwd, "logs/run.md"), "utf-8")).not.toContain(
+      "waiting for tests",
+    );
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 019b07b0f..70e19e1c3 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -21,6 +21,7 @@ import { taskCapDefaultsNamed } from "../../checks/before/repo";
 import {
   blockHash,
   checkPlanText,
+  classifyLockExit,
   gateScope,
   judgeGreen,
   judgeRed,
@@ -66,6 +67,7 @@ beforeEach(() => {
   fs.writeFileSync(
     path.join(bin, PACKAGE_RUNNER),
     '#!/bin/sh\necho "out: $1 in $(pwd)"\necho "err: $1" >&2\necho "arg: $2"\n' +
+      'printf "wait=%s who=%s\\n" "$LOCAL_STACK_LOCK_WAIT_S" "$LOCAL_STACK_LOCK_WHO"\n' +
       'if [ "$1" = "bkit:lint:file" ]; then exit "${FAKE_LINT_EXIT:-0}"; fi\n' +
       'if [ -n "$BKIT_TEST_REPORT" ] && [ -n "$FAKE_JUNIT" ]; then printf "%s" "$FAKE_JUNIT" > "$BKIT_TEST_REPORT"; fi\n' +
       'if [ -n "$FAKE_REPORT_A" ]; then printf "%s" "$FAKE_REPORT_A" > "$BKIT_TEST_REPORT_DIR/a.xml"; fi\n' +
@@ -134,6 +136,79 @@ describe("resolveGate", () => {
 });
 
 describe("bkit tests run", () => {
+  it("a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run", () => {
+    const who = "bkit tests run bkit:gate:static-unit";
+    const log = `[machine-lock] ❌ ${who} gave up after 0s waiting for tests, in use by another agent — /tmp/checkout (pid 123, since 12:00:00), no earlier run\n`;
+    expect(classifyLockExit({ exitCode: 75, log, who })).toBe("lock-wait");
+    expect(classifyLockExit({ exitCode: 75, log, who: who + " other" })).toBe("gate");
+    expect(classifyLockExit({ exitCode: 1, log, who })).toBe("gate");
+    expect(classifyLockExit({ exitCode: 75, log: "tests failed", who })).toBe("gate");
+  });
+
+  it("a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81", () => {
+    const who = "bkit tests run bkit:gate:static-unit";
+    const log = `[machine-lock] ❌ ${who} gave up after 0s waiting for database, in use by another agent — /tmp/tests (pid 123, since 12:00:00), no earlier run\n`;
+    expect(classifyLockExit({ exitCode: 75, log, who })).toBe("gate");
+  });
+
+  it("a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4", () => {
+    const who = "bkit tests run bkit:gate:static-unit";
+    expect(
+      classifyLockExit({
+        exitCode: 73,
+        log: "[machine-lock] ❌ could not take the lock for tests: cannot create /tmp/cache/bkit/machine-lock\n",
+        who,
+      }),
+    ).toBe("could-not-run");
+    expect(
+      classifyLockExit({
+        exitCode: 73,
+        log: "[machine-lock] ❌ could not take the lock for tests: /usr/bin/perl not found\n",
+        who,
+      }),
+    ).toBe("could-not-run");
+    expect(
+      classifyLockExit({
+        exitCode: 73,
+        log: "[machine-lock] ❌ cannot take tests while holding database: lock order is tests, other named locks, then the unnamed stack lock\n",
+        who,
+      }),
+    ).toBe("could-not-run");
+  });
+
+  it("tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate", async () => {
+    const results = await Promise.all(
+      ["-1", "1.5", "bad"].map((value) => run([...BUILD, `--lock-wait-s=${value}`])),
+    );
+    expect(results.map((result) => result.code)).toEqual([2, 2, 2]);
+    expect(results.map((result) => result.err)).toEqual([
+      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
+      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
+      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
+    ]);
+    expect(fs.existsSync(path.join(cwd, "logs/test.md"))).toBe(false);
+  });
+
+  it("tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2", async () => {
+    vi.stubEnv("BKIT_LOCK_WAIT_S", "1200");
+    const valid = await run(BUILD);
+    expect(valid.code).toBe(0);
+    expect(readLog()).toContain("wait=1200");
+    fs.rmSync(path.join(cwd, "logs/test.md"));
+    vi.stubEnv("BKIT_LOCK_WAIT_S", "bad");
+    const invalid = await run(BUILD);
+    expect(invalid.code).toBe(2);
+    expect(invalid.err).toContain("BKIT_LOCK_WAIT_S");
+    expect(fs.existsSync(path.join(cwd, "logs/test.md"))).toBe(false);
+  });
+
+  it("a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4", () => {
+    const who = "bkit tests run bkit:gate:static-unit";
+    const log =
+      "[machine-lock] ❌ could not take the lock for database: cannot create /tmp/tests/cache\n";
+    expect(classifyLockExit({ exitCode: 73, log, who })).toBe("gate");
+  });
+
   it("PASS: runs the gate through the package runner, saves stdout and stderr to the log", async () => {
     const r = await run(BUILD);
     expect(r.code).toBe(0);
@@ -149,6 +224,7 @@ describe("bkit tests run", () => {
       artifact: null,
       clamp: null,
       row: null,
+      lockHolder: null,
     });
     expect(r.json.scope).toBe(`${PACKAGE_RUNNER} ${DEEP}`);
     expect(readLog()).toContain(`out: ${DEEP}`);
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index b357e1669..3fef35458 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -25,7 +25,16 @@ import * as path from "node:path";
 import { BKIT_LINT_FILE_SCRIPT, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
 import { clampLogPath } from "../../ledgers/clamp-log.js";
 import { appendLine, statusTimestamp } from "../../ledgers/status.js";
-import { CommandError, EXIT, git, runGit, type CommandSpec } from "../lib.js";
+import {
+  classifyLockExit,
+  CommandError,
+  EXIT,
+  git,
+  runGit,
+  testsLockHolder,
+  wholeNumber,
+  type CommandSpec,
+} from "../lib.js";
 import { parseJson } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
@@ -65,6 +74,8 @@ export const TEST_RUN_ROW = "test-run";
 /** The env var naming the folder every runner a gate calls writes its JUnit XML into. */
 export const REPORT_DIR_ENV = "BKIT_TEST_REPORT_DIR";
 
+export { classifyLockExit } from "../lib.js";
+
 const NO_REPORT_HINT =
   `no JUnit report in $${REPORT_DIR_ENV} — failures unknown; turn on each test runner's JUnit ` +
   `reporter in the gate and point its output into $${REPORT_DIR_ENV} ` +
@@ -1599,7 +1610,7 @@ export const testsCommand: CommandSpec = {
     changed: testsChangedVerb,
     run: {
       summary:
-        "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run.",
+        "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held.",
       use: "by-hand",
       flags: [
         {
@@ -1620,6 +1631,11 @@ export const testsCommand: CommandSpec = {
           type: "string",
           help: `lines of the log echoed to stderr afterwards (default ${DEFAULT_TAIL}; 0 for none)`,
         },
+        {
+          name: "lock-wait-s",
+          type: "string",
+          help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
+        },
         {
           name: "artifact",
           type: "string",
@@ -1654,7 +1670,8 @@ export const testsCommand: CommandSpec = {
         logBytes: "size of the saved output",
         artifact: "--artifact as given, else null",
         clamp: "the artifact's clamp record (raw = the log, source = scope), else null",
-        row: `the ${TEST_RUN_ROW} row appended to --file ({type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}; run = this step's test-run rows in the workflow's active run, this one included), else null`,
+        row: `the ${TEST_RUN_ROW} row appended to --file ({type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}; run = this step's test-run rows in the workflow's active run, this one included), else null; a tests-lock wait writes no row`,
+        lockHolder: "tests-lock holder when the wait gave up, else null",
       },
       textOmit: ["clamp", "row"],
       exitCodes: {
@@ -1663,6 +1680,14 @@ export const testsCommand: CommandSpec = {
         [EXIT_ARTIFACT_STEP]: "--artifact could not be written, trimmed or recorded",
       },
       run: (ctx) => {
+        const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
+        const waitS = wholeNumber(
+          waitSource,
+          ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
+            ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
+            : "lock-wait-s",
+          60,
+        );
         const candidates = ctx.flags.gate as string[];
         const logArg = String(ctx.flags.log);
         if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
@@ -1706,13 +1731,27 @@ export const testsCommand: CommandSpec = {
         const reports = freshReportDir(log);
         ctx.log(`running ${scope} — full output in ${logArg}`);
         const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
-        const exitCode = runToLog(scriptCommand(gate), top, log, { [REPORT_DIR_ENV]: reports });
-        for (const line of Number(tailRaw) > 0 ? tailLines(log, Number(tailRaw)) : [])
-          ctx.log(line);
-        const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
-        const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
-        const counted = countReportFailures(reports);
-        if (counted === null) ctx.log(NO_REPORT_HINT);
+        const who = ["bkit tests run", gate, fid, step].filter(Boolean).join(" ");
+        const exitCode = runToLog(scriptCommand(gate), top, log, {
+          [REPORT_DIR_ENV]: reports,
+          LOCAL_STACK_LOCK_WAIT_S: String(waitS),
+          LOCAL_STACK_LOCK_WHO: who,
+        });
+        const logText = fs.readFileSync(log, "utf-8");
+        const lockExit = classifyLockExit({ exitCode, log: logText, who });
+        const lockWait = lockExit === "lock-wait";
+        const lockHolder = lockWait ? testsLockHolder(logText, who) : null;
+        const lines =
+          lockExit === "gate"
+            ? Number(tailRaw) > 0
+              ? tailLines(log, Number(tailRaw))
+              : []
+            : logText.split(/\r?\n/).filter((line) => line.startsWith("[machine-lock]"));
+        for (const line of lines) ctx.log(line);
+        const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
+        const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
+        const counted = lockExit === "gate" ? countReportFailures(reports) : null;
+        if (counted === null && lockExit === "gate") ctx.log(NO_REPORT_HINT);
         else if (verdict === "FAIL" && counted === 0)
           ctx.log(
             `the JUnit reports in $${REPORT_DIR_ENV} hold no failing case — the gate failed outside its reported tests; failures unknown`,
@@ -1720,7 +1759,7 @@ export const testsCommand: CommandSpec = {
         const failures = verdict === "PASS" ? 0 : counted !== null && counted > 0 ? counted : null;
         let clamp: ClampRecord | null = null;
         let artifactFailed: string | null = null;
-        if (artifact !== undefined) {
+        if (artifact !== undefined && !lockWait) {
           try {
             const out = path.resolve(ctx.cwd, artifact);
             fs.mkdirSync(path.dirname(out), { recursive: true });
@@ -1742,7 +1781,7 @@ export const testsCommand: CommandSpec = {
           }
         }
         const row =
-          status === undefined
+          status === undefined || lockWait
             ? null
             : appendTestRun(status, {
                 workflow: workflow!,
@@ -1764,17 +1803,19 @@ export const testsCommand: CommandSpec = {
           reports: `${logArg}.reports`,
           log: logArg,
           logBytes: fs.statSync(log).size,
-          artifact: artifact ?? null,
+          artifact: lockWait ? null : (artifact ?? null),
           clamp,
           row,
+          lockHolder,
         });
         if (artifactFailed !== null) {
           ctx.log(`--artifact ${artifact}: ${artifactFailed}`);
           return EXIT_ARTIFACT_STEP;
         }
+        if (lockWait) return EXIT.AGENT_WAIT;
         if (couldNotRun) {
           ctx.log(
-            `${scope} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`,
+            `${scope} could not run (exit ${exitCode}: ${lockExit === "could-not-run" ? "tests lock refused" : exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`,
           );
           return EXIT_COULD_NOT_RUN;
         }
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index 97c552f77..b61ead94d 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -101,6 +101,7 @@ autoCompactWindow: 300000
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
    - Fix those files in the same pass as the failure.
diff --git a/.bkit/core/prompts/bkit-build-plan-tasks.md b/.bkit/core/prompts/bkit-build-plan-tasks.md
index a6dbde979..c13713c4e 100644
--- a/.bkit/core/prompts/bkit-build-plan-tasks.md
+++ b/.bkit/core/prompts/bkit-build-plan-tasks.md
@@ -117,6 +117,9 @@ autoCompactWindow: 300000
 9. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 10. Run `bkit tests changed --fallback=bkit:gate:static`. Every local lint and typecheck must pass.
+
+- **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
+
 11. **If** the tasks are verified (their tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 12. Set `Verdict` in **Create** with `Edit`:
     - `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index 1654c6e97..812934c52 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -81,6 +81,7 @@ autoCompactWindow: 300000
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
    - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+     - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
 8. **If** a test-first audit report is supplied (its header has `Enforced`, `Verdict` and `Gaps`) → decide each of its gaps. A gap's `fixable` stands unless it is `null`. Decide each `null` one from the diff it names:
    - `delete-still-referenced` → read each hit:
      - **If** the hit is a different thing with the same name → no gap.
diff --git a/.bkit/core/prompts/bkit-debug-failure-remediate.md b/.bkit/core/prompts/bkit-debug-failure-remediate.md
index 86fb8ce53..764cb13ab 100644
--- a/.bkit/core/prompts/bkit-debug-failure-remediate.md
+++ b/.bkit/core/prompts/bkit-debug-failure-remediate.md
@@ -74,6 +74,7 @@ autoCompactWindow: 300000
    - Task-runner / build config → merge both sides' task definitions.
    - Ordered database migrations → resequence them so each new file sorts after every migration already applied upstream.
 8. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass.
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - **If** any declared live tests were failing → the remediation is done only when those same live tests pass.
 9. **If** the last local test run has failures → document the errors in the output, and set `Verdict` = `FAIL`.
 10. **If** the remediations are verified (the tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index ce534f07b..4c5961cc5 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -3981,6 +3981,16 @@ Run `pnpm bkit:gate:static-unit` — all local tests MUST pass.
 Run `pnpm bkit:gate:static-unit`. Every local test must pass.
 ```
 
+### tests-changed-lock-wait
+
+- prompt: where-used
+- tags: local-tests-first
+- carriers: prompt `bkit-build-plan-gaps-remediate`, `bkit-build-plan-tasks`, `bkit-build-plan-verify`, `bkit-debug-failure-remediate`
+
+```text
+**If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
+```
+
 ### remediate-verdict-fail
 
 - prompt: where-used
@@ -14286,7 +14296,7 @@ Visual and accessibility snapshots (e.g., Playwright `toHaveScreenshot` / `toMat
 Test-smell catalogue (e.g., xUnit Test Patterns, Meszaros 2007).
 Test lint (e.g., `@vitest/eslint-plugin`, `eslint-plugin-playwright`, `eslint-plugin-testing-library`, or Oxlint's `vitest` + `typescript` plugins); record each version. typescript-eslint type-aware rules need a TypeScript version it supports; newer → Oxlint `--type-aware` (oxlint-tsgolint).
 Network mock that fails closed (e.g., MSW); record the major read.
-bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § Test first; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs
+bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § Test first; § Tests lock; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs
 Build the should-test list: promises, never-events, platforms, roles, failure paths, and data that outlives the request.
 Check that each item is tested at the right tier, not only at some tier.
 Check that database rules and boundary contracts have tests, not only the guards in front of them.
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index 8e310f216..a67b07305 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -202,14 +202,14 @@ Canonical per-agent metadata, and the single source of truth for each agent's mo
 | `bkit-build-plan-current` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | judge plan vs changes landed since its base commit |
 | `bkit-build-install-skills` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | skill identifier |
 | `bkit-build-plan-tests` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | writes one task group's planned tests before its code (test files only); uses the machine lock for shared services |
-| `bkit-build-plan-tasks` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | task executor for one task group (source modifier with test loop); uses the machine lock for shared services |
-| `bkit-build-plan-verify` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 100 | verify one group, or the whole plan once, vs the plan |
-| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services |
+| `bkit-build-plan-tasks` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | task executor for one task group (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
+| `bkit-build-plan-verify` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 100 | verify one group, or the whole plan once, vs the plan; re-runs tests-lock waits |
+| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
 | `bkit-build-challenge-1` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | parallel slot 1 (bug-hunting lens) |
 | `bkit-build-challenge-2` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 200 | parallel slot 2 (security lens; depth-sensitive — both opus) |
 | `bkit-debug-failure-reproduce` | `claude-opus-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | failing tests from a bug report, no fix; opus over the sonnet test-writer tier — an off-symptom test sends the fix loop after the wrong bug |
 | `bkit-debug-failure-diagnose` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 200 | failure diagnosis (Final-strategy attempts especially benefit from depth before human handover) |
-| `bkit-debug-failure-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 200 | implement diagnosis fixes (source modifier with test loop) |
+| `bkit-debug-failure-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 200 | implement diagnosis fixes (source modifier with test loop); re-runs tests-lock waits |
 | `bkit-debug-failure-soak` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | soak fix — one accumulating-context instrument-or-fix step per iteration against the live boundary (orchestrator re-runs tests + loops) |
 | `bkit-debug-abort-handover` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | handover writer |
 | `bkit-ship-conflict-resolve` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 200 | mechanical merge-conflict resolver (source modifier with test loop) |
diff --git a/.bkit/shared/.claude/settings.json b/.bkit/shared/.claude/settings.json
index 3a147c64f..b3aaccbc4 100644
--- a/.bkit/shared/.claude/settings.json
+++ b/.bkit/shared/.claude/settings.json
@@ -1,5 +1,8 @@
 {
   "$schema": "https://json.schemastore.org/claude-code-settings.json",
+  "env": {
+    "BKIT_LOCK_WAIT_S": "1200"
+  },
   "permissions": {
     "allow": [
       "Skill(*)",
diff --git a/.bkit/shared/docs/testing.md b/.bkit/shared/docs/testing.md
index c347065aa..a9a5713cd 100644
--- a/.bkit/shared/docs/testing.md
+++ b/.bkit/shared/docs/testing.md
@@ -305,6 +305,17 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 - **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
 - **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify.
 
+## Tests lock
+
+Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bkit/templates.md` § Machine lock). The wrapped script holds the `tests` lock for the whole gate, across repositories. An unwired repository takes no lock.
+
+- `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` as `LOCAL_STACK_LOCK_WAIT_S` and their run name as `LOCAL_STACK_LOCK_WHO`; they run the declared gate without executing the lock script itself.
+- A tests-lock give-up of this run becomes exit 81 with `lockHolder`, and a tests-lock refusal becomes exit 4. A lock wait writes no `test-run` status row. A gate's own failure or a nested lock's give-up remains a test failure. A raw gate caller sees exit 75 and the holder line.
+- Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
+- `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
+- The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands).
+- The script defaults to 60 seconds without a TTY when no wait is set. Waiting notes name the holders and their checkouts' earlier run times.
+
 ## JUnit reports for bkit
 
 `bkit tests run` counts a gate's failures from JUnit XML, not from its log. It empties a report folder before each run and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`.
diff --git a/.bkit/templates.md b/.bkit/templates.md
index f90ef6be4..92b845aa9 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -918,4 +918,5 @@ cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 - Wait: `LOCAL_STACK_LOCK_WAIT_S` when set, else 60 seconds without a TTY, else 3600 seconds. Waiting notes name the budget and holders once a minute; the give-up line names the holder again.
 - A named release records held seconds by checkout in `<name>.last`, with one tab-separated line per checkout. A waiting note and give-up line name the current holder's `last run took <N>m<N>s`, or `no earlier run`.
 - `CI=true` / `CI=1` makes every lock a no-op.
+- `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` and their run name to a wrapped gate; a tests-lock give-up of this run maps 75 → 81 with `lockHolder`, and a tests-lock refusal maps 73 → 4. A lock wait writes no `test-run` status row. Light runs (`red`, `green`, `bkit:test:file`) take no tests lock. Nested wraps reuse their live parent's tests lock. See `docs/testing.md` § Tests lock for host wait budgets.
 - Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`), because the raw command skips the lock. See `.agents/rules.md` § Shared local stack.
diff --git a/.bkit/version b/.bkit/version
index 44a9dae2d..a09e016b9 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,8 +3,8 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "7b60ce0e300e1438f965c06e5de4077262b73361e7dd3a46776571218e7f4793",
-    ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
+    "docs/testing.md": "11d606f1a92b79a313ee37d478227f7247519f896cbb8a1b70687c7817690508",
+    ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
     ".agents/skills.md": "71dc53bcab370fbe1aacc3239edc3395e3cf9ff9f507c9cda49669846cf7f14b",
@@ -32,11 +32,11 @@
     ".claude/agents/bkit-build-challenge-1.md": "cdd3c2ac8dff17591adacf9cccae4162fa5b8d1fdb02f409e50acff40f8826f3",
     ".claude/agents/bkit-build-challenge-2.md": "05bd003c57e9d176ab68484d0356f730db95fb7d62536cbe2bc995c1524c349b",
     ".claude/agents/bkit-build-install-skills.md": "6e933518e6be37d8a384b9592293b47c8683247e6e96cda82e6c0bfff1fd641b",
-    ".claude/agents/bkit-build-plan-gaps-remediate.md": "306f99f0d7415caa7ffb1e0b15de16070f3057578373627addc2685641600d31",
-    ".claude/agents/bkit-build-plan-verify.md": "aab3b8ef0d74cad42f70a86834fea918308e6a593f6453915d68f89cbb3a4409",
+    ".claude/agents/bkit-build-plan-gaps-remediate.md": "b284b8088024df6d19cafc1fb63a76c2aa8ef2dca0190c776f6ea8968f1f8b8a",
+    ".claude/agents/bkit-build-plan-verify.md": "e69b3d3e3cbc6b3d75b788d6b85b3c861fdd5f5bf3e5cc2265c12582d8f2b02e",
     ".claude/agents/bkit-debug-abort-handover.md": "d5c3192877fa3e83be3a753dfa67732de465350b2ffb50588ee1bf9f8953619a",
     ".claude/agents/bkit-debug-failure-diagnose.md": "465fbe537f5193bb702fc65895c306ff602426c785506b208abd0742ace33d46",
-    ".claude/agents/bkit-debug-failure-remediate.md": "c2a2a196ce59e7a9ae78d27ba18939cb0a9a5eb2840f86322aaab9e79ccf32e5",
+    ".claude/agents/bkit-debug-failure-remediate.md": "5adf22e594b36addc035bbdc611f5db7b603b64c685b2bcd716e99a02a7a944a",
     ".claude/agents/bkit-debug-failure-soak.md": "953a7c72b0c487ca60e6c49831ac2b36e5b2ef096534551f561295bc9a7eccce",
     ".claude/agents/bkit-design-brainstorm-ideate-1.md": "750ce973cbec9257e506798a1096978bd2240b5f318bdbb84014edea0fb14933",
     ".claude/agents/bkit-design-brainstorm-ideate-2.md": "24b04375bff7e26c93571d7238033d1baaef20efeacebaaef005a80c34849e27",
@@ -64,11 +64,11 @@
     ".cursor/agents/bkit-build-challenge-1.md": "093141086374b85fd0fc944cafb575ec60a80df88fed1e471ac18640bc5cbe61",
     ".cursor/agents/bkit-build-challenge-2.md": "b4998b1d36bff4fc827cbd8310650fe9c4f2f9647685e243bca33984ddde9ef6",
     ".cursor/agents/bkit-build-install-skills.md": "b1a9b1ebb7272c08186f150fee495808bec6a2c98dd840724bf2e92ad3df5dd9",
-    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "1a9b827f6880c3fd936f58b83487e1b5705bcc81664fb126cc4b326e4b30462c",
-    ".cursor/agents/bkit-build-plan-verify.md": "334f3b398fa34ada33ede465889272ae35a495b55dbb08900854af6a9cef53fc",
+    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "14b3e665ad7ab847a47b9556c04804a46468d9452425b2d906bfc8bf40b2b892",
+    ".cursor/agents/bkit-build-plan-verify.md": "e3fae7b4e7a6dba151cb55fd29194eb2f3a28df10d3acd5621c0dbae17812fe6",
     ".cursor/agents/bkit-debug-abort-handover.md": "ba64fff85fe057551119face8d3198d0b9c4a4d2566cbb7f7909a12cfa522b0f",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "b9745705caf0edd43ce394aacf72d09eb50814ca4a52e564adb485b4930a3874",
-    ".cursor/agents/bkit-debug-failure-remediate.md": "e446624b6c1e2dff569bdd0bb2fa017e5ddff3c2aa0e9ec733001fb622cd415e",
+    ".cursor/agents/bkit-debug-failure-remediate.md": "2798aa05270d1d8131271066be04f10ba5da6e2cd1a1c1c87369dae8ae09ba5d",
     ".cursor/agents/bkit-debug-failure-soak.md": "ac86ecd8ac522bc115f7a38a7e3bba3b098670b2d8090838b92012e928660b13",
     ".cursor/agents/bkit-design-brainstorm-ideate-1.md": "a09981c350e90c72109ed798178f2a8da27745b78bfb41117520d0d662cb395b",
     ".cursor/agents/bkit-design-brainstorm-ideate-2.md": "71c47dff73cdd857fbfb4952aa70cf0060dc56722cbdb67445786234e9df548d",
@@ -90,11 +90,11 @@
     ".opencode/agents/bkit-build-challenge-1.md": "17e547063a83c16d99741be6a50483a6a4e384472bda7b13e18c97d93059a4ab",
     ".opencode/agents/bkit-build-challenge-2.md": "7e5a0830fb1423a0e3ac8ec8f6444c8ca2521c2214c61edd345de116a82b6ed8",
     ".opencode/agents/bkit-build-install-skills.md": "57b9f5432fb2b270dcd6074c8ea6a634c284131f2d4befede879e25aec9581f9",
-    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "5b3eb7a8e05eae5d052ac8f08fd2568ca0ee7d177cbe56f62a8bb96a8abb5ffc",
-    ".opencode/agents/bkit-build-plan-verify.md": "96bcedbd9a179c4d5101776168995dddcb637cbbb3c20c57862947979591927c",
+    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "ef34136b03642b5b75976a7e27be0be6660e4790640904c71177f40a2ad3194d",
+    ".opencode/agents/bkit-build-plan-verify.md": "d3e21f98d9a5ff8d113ed40e9198d4d7392ed593f8dbe4232f020b84ebee5e51",
     ".opencode/agents/bkit-debug-abort-handover.md": "1109c9c685682613cf7e694ffaa58a6b3bd769b15de0570ce6852c6627f18ceb",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "8e7941906f8d01025c1ed34a12f9ac3625a0302d0c6cb2059da7e99dc00984c7",
-    ".opencode/agents/bkit-debug-failure-remediate.md": "8130a810d0a939035defb0543582b3bd6e77e71860d14c22acf12bf9e97c0eba",
+    ".opencode/agents/bkit-debug-failure-remediate.md": "bbcf2de2819033282bba5883772af6831ce6c1b7f93e938eaa7bed21d57f1c1d",
     ".opencode/agents/bkit-debug-failure-soak.md": "3d037d60b0ff1398709f7ce93283a1b7a3473e35fbe747c4033fd7eb4e30cfd6",
     ".opencode/agents/bkit-design-brainstorm-ideate-1.md": "65ed7617b6e9c309d84fd3d96054a736746a8f1f4a09c2c1fb9faf19e1c1b690",
     ".opencode/agents/bkit-design-brainstorm-ideate-2.md": "5d3fffc740a2d46d181c0f1213d6ed05fbbe458a6c03bfd8820ebd69ed6b7451",
@@ -131,11 +131,11 @@
     ".codex/agents/bkit-build-challenge-2.toml": "6af86e33a2d74882073456bcf2881c7851d380856b04b7db8bfca7f71b323c15",
     ".codex/agents/bkit-build-install-skills.toml": "ca2c193fcdc970c5ed2045b01b873035b286a4bf0892f6231ef78412a3af2517",
     ".codex/agents/bkit-build-plan-current.toml": "f5c7afff5d03e45bff26fc041743061580a04abb602213c2cad328f013487d2f",
-    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "e06a0a3305445fcb89b1360cc394f335aa8fede167e3b5b6d4775085bb16e131",
-    ".codex/agents/bkit-build-plan-verify.toml": "d987165f7c941dc8802df7648d38e0832128a14ca9f9246751dfdffcbe3cd32a",
+    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "d3bcec5ba8792d88b413f6487f0d7594bb162485adae2d9281e60617eeb4e5b3",
+    ".codex/agents/bkit-build-plan-verify.toml": "0d103e2975b21b4c93b5ef09dd34e6bd841cdc8b84d5df7b5e8e576ac3ba1a15",
     ".codex/agents/bkit-debug-abort-handover.toml": "8200295a4f88a4aca5f679ba1a685ea09335113a50bf9e3301a26e292d841acd",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4d9787753d5e242a9b86403070be7431f640afe28eaeb685ca1e0d3607657386",
-    ".codex/agents/bkit-debug-failure-remediate.toml": "4f23ecc84114964c97e45289a96dc7976fa347be224dd60f589e78152eadf8ad",
+    ".codex/agents/bkit-debug-failure-remediate.toml": "a3ca4496aa30e6719a5e79cd38f9c3461992d529906207e9ac821143ac5c7b86",
     ".codex/agents/bkit-debug-failure-soak.toml": "a50fec5fbbddd72d616d4d062d1284ff2ef5b7acfd71b53f5f539f60b3cb0698",
     ".codex/agents/bkit-design-brainstorm-ideate-1.toml": "43797ce2e8ad4afbb514010e5abc0963ca574328227f9593a1bcab1a2ae59306",
     ".codex/agents/bkit-design-brainstorm-ideate-2.toml": "81fa0fa292ef3efb82ebd8b57140116180dd6e78337c60c2909120de740328be",
@@ -192,7 +192,7 @@
     "docs/templates/bkit-audit-security.md": "cf8b47d59a345fa8548a54e2bc7d1e211b762d94f85975044dedd9e1af3c8700",
     "docs/templates/bkit-audit-slop.md": "ed2f455d8d15f5324127a91f15958838589110098265fc58e7c6b4b2751316b5",
     "docs/templates/bkit-audit-usability.md": "4beca4d9e7c6e9599a41c99f15a97668c13ebb315f44c7cd1ed6a417c61d4b80",
-    "docs/templates/bkit-audit-testing.md": "aedb39a10ceb0c88605bcc275d89eea385aafe0b069adc2aa151097eba0dad38",
+    "docs/templates/bkit-audit-testing.md": "d4d951db7d2d5cdb0aec96486815de7e4065ff9c8ad3c548e2440f4703e117f8",
     ".opencode/agents/bkit-utility-update-roadmap.md": "ac6954d757cd5b17c83aa70c6a75450e42416b86035a2224dba5b5cdb06972a9",
     ".codex/agents/bkit-utility-update-roadmap.toml": "97bd0914205aa56e0bf99f3b5358dc50fae4f16164b37419a680837e3afe9e88",
     "docs/templates/bkit-audit-aio-seo.md": "e4c534912e661050887d5a1d1adf31798710a95bc27ecd27aa842a69e07c981c",
@@ -215,16 +215,16 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "ea7081672a0fe44a1d2eaf40958c008a7631d329345d11d6a7ca4439a156bf25",
     "docs/templates/bkit-audit-agents.md": "39f34db396db4e50742d230304ecdeb0ceb367ee99e03aaba740872ff8fdd858",
     "docs/templates/bkit-audit-prompts.md": "3323a98811ad65da0fc30d5e52f2a48cd09872dc490fcac0008adba097c37e0a",
-    ".bkit/templates.md": "7719f0474d5d93c46d20d192efcf718441cf989d476f653c081456c60039d6bd",
+    ".bkit/templates.md": "d20b967afcfdd568d859abe63e44a0db7049c6ef530137ecc8939162c90946ce",
     "docs/templates/bkit-audit-adoption.md": "09fa8636f0529f95ab7a46f4c74727da85fde7180d43979e74cdbb3ea3557794",
     ".bkit/cloud.md": "7594f46d9003bcf77650cf57c3ff934278690187434e58bc57159ccbd1c52524",
     ".bkit/comparison.md": "1ab7924388e037438a73a87c1826f5846f7ae38a5a41479eb6bb7454ae782d07",
     ".bkit/install.md": "a7b498987af7aeb1a05b019033256f81af218db1e56f3c675cb869764f5b2e2f",
     ".bkit/jsonl.md": "e2f0b02be4edceb5bbd338e4f0d3fb00cb0654cb3b8df447f7b81b9de09561fb",
     ".bkit/providers.md": "f55e9e3e06f53afec0ba2aed6d0981307469cfc4c1aba7b99f176cc3a8cde6eb",
-    ".bkit/prompts.md": "d4cb754a082bbcf5fcc6c324bc8cf1e75ec2456b01e3b58d9c5be544ca040064",
+    ".bkit/prompts.md": "1be56eab2c975275c7c494594fdd4b99468edc3fed33ac38febc33bb7ce95a96",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "3b921c1a510ee1670b677787c72a09c1a853c416aa7cb8f86d4b933e0f2e790a",
+    ".bkit/workflows.md": "33b831d38b516c045dc8fbb4353d68bc0ddd651058ea776377faec89eb0ee2a5",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
@@ -264,15 +264,15 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "fbcf361fb9f1496b5844c91ac7afa9cff78c67ad2dff7d06f1ccecce0affb77c",
+    ".bkit/cli.md": "db85ca950e6c33bf58e02b26e1e81d1967dab3a3aa86aa6dc9ecf4fc3c732414",
     ".claude/agents/bkit-build-plan-tests.md": "bde2d105b742a40d6d0271ba5849fd19bc0ab5b02c9a97c5452fda328a3262b2",
     ".cursor/agents/bkit-build-plan-tests.md": "ddd04c0aa5c0afa58baa3ba27c811e85c8811cd01f1da373973488e8d5868af4",
     ".opencode/agents/bkit-build-plan-tests.md": "5c2f3a89e3b0472cf66f2c754e73d883ff140100ed1b282d53e164381e30065c",
     ".codex/agents/bkit-build-plan-tests.toml": "9ee347b9145a2509dd63534d652ebb71a451d386d7e205d8d612426918b9cada",
-    ".claude/agents/bkit-build-plan-tasks.md": "4a5a8053f2451b76ae06c044b04ebde3be3681afc8568b5cf200eb33dc29f096",
-    ".cursor/agents/bkit-build-plan-tasks.md": "23ed7fef6acaba50a4f4086038342c61825b1603116ab7ee460197880b034b58",
-    ".opencode/agents/bkit-build-plan-tasks.md": "499537f4f96b45e8ce027d00c18e34cc0def93f0c1310d61b907d569024d1639",
-    ".codex/agents/bkit-build-plan-tasks.toml": "90acbcf13a2080f65bc5e002df64d6ccd7bee268f6acd601f641ddeaab06fd72"
+    ".claude/agents/bkit-build-plan-tasks.md": "b243abc218f690a118a0d604ea904e68d97d1d323bf883b2bcad068e610fb4ac",
+    ".cursor/agents/bkit-build-plan-tasks.md": "ee70a1bae003c13e0ac127ee5283479d879160db4e8f06895f7de11172f3a585",
+    ".opencode/agents/bkit-build-plan-tasks.md": "b3245fc48c5c1451b4e0506fb6870ae6c4001b14c2c34faf5237851b8562bba2",
+    ".codex/agents/bkit-build-plan-tasks.toml": "c41f2e488d66851ee346abf10ca43e399d306fa6ca90f4f2a243a35887d28ef0"
   },
   "claudeAllowDerived": [
     "WebFetch(domain:12factor.net)",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 2adb7006b..3ade4d66a 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -284,7 +284,7 @@ Rationale: keeping per-run state on `feat/{FID}` removes the divergence between
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
-| `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. Not folded, never a step's finish row. Step minutes skip it. |
+| `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. A tests-lock wait (exit 81) writes no row. Not folded, never a step's finish row. Step minutes skip it. |
 | `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. A command git launched (a hook, seen by `GIT_EXEC_PATH` in its environment) writes none, so a hook never leaves the tracked status file dirty after a commit. Not folded; step minutes skip it. |
 | `completeness` | `{type, workflow, at, verdict, preJournal, journalSuspect, observed, evidenceHoles, stepHoles, unexercised, unexpected, unattributable, sourceSha}` | The run's completeness verdict, appended at close. `verdict` `CLEAN\|HOLEY` (evidence + step holes only); `preJournal` = the run has no `engine-call` rows (steps-only); `journalSuspect` = closing engine journals but recorded none. A run that closes twice carries one per close; the read path takes the last. Not folded; step minutes skip it. |
 | `ship-gate-refusal` | `{type, workflow, at, exitCode, head}` | One `bkit runs gate` refusal at Step 10, with the gate's exit code and the head it asserted against. Not folded. |
diff --git a/.claude/agents/bkit-build-plan-gaps-remediate.md b/.claude/agents/bkit-build-plan-gaps-remediate.md
index 0e823fb95..9cc9d9ce7 100644
--- a/.claude/agents/bkit-build-plan-gaps-remediate.md
+++ b/.claude/agents/bkit-build-plan-gaps-remediate.md
@@ -102,6 +102,7 @@ autoCompactWindow: 300000
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
    - Fix those files in the same pass as the failure.
diff --git a/.claude/agents/bkit-build-plan-tasks.md b/.claude/agents/bkit-build-plan-tasks.md
index 4d03df19b..7dbec70ff 100644
--- a/.claude/agents/bkit-build-plan-tasks.md
+++ b/.claude/agents/bkit-build-plan-tasks.md
@@ -118,6 +118,9 @@ autoCompactWindow: 300000
 9. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 10. Run `bkit tests changed --fallback=bkit:gate:static`. Every local lint and typecheck must pass.
+
+- **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
+
 11. **If** the tasks are verified (their tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 12. Set `Verdict` in **Create** with `Edit`:
     - `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index 692778e71..aa637ba70 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -82,6 +82,7 @@ autoCompactWindow: 300000
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
    - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+     - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
 8. **If** a test-first audit report is supplied (its header has `Enforced`, `Verdict` and `Gaps`) → decide each of its gaps. A gap's `fixable` stands unless it is `null`. Decide each `null` one from the diff it names:
    - `delete-still-referenced` → read each hit:
      - **If** the hit is a different thing with the same name → no gap.
diff --git a/.claude/agents/bkit-debug-failure-remediate.md b/.claude/agents/bkit-debug-failure-remediate.md
index bf254adc9..d27d3bfad 100644
--- a/.claude/agents/bkit-debug-failure-remediate.md
+++ b/.claude/agents/bkit-debug-failure-remediate.md
@@ -75,6 +75,7 @@ autoCompactWindow: 300000
    - Task-runner / build config → merge both sides' task definitions.
    - Ordered database migrations → resequence them so each new file sorts after every migration already applied upstream.
 8. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass.
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - **If** any declared live tests were failing → the remediation is done only when those same live tests pass.
 9. **If** the last local test run has failures → document the errors in the output, and set `Verdict` = `FAIL`.
 10. **If** the remediations are verified (the tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
diff --git a/.claude/settings.json b/.claude/settings.json
index 0a7fbb813..408e0af06 100644
--- a/.claude/settings.json
+++ b/.claude/settings.json
@@ -1,5 +1,8 @@
 {
   "$schema": "https://json.schemastore.org/claude-code-settings.json",
+  "env": {
+    "BKIT_LOCK_WAIT_S": "1200"
+  },
   "permissions": {
     "allow": [
       "Skill(*)",
diff --git a/.codex/agents/bkit-build-plan-gaps-remediate.toml b/.codex/agents/bkit-build-plan-gaps-remediate.toml
index cfbb9c495..cee360fec 100644
--- a/.codex/agents/bkit-build-plan-gaps-remediate.toml
+++ b/.codex/agents/bkit-build-plan-gaps-remediate.toml
@@ -89,6 +89,7 @@ developer_instructions = """
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
    - Fix those files in the same pass as the failure.
diff --git a/.codex/agents/bkit-build-plan-tasks.toml b/.codex/agents/bkit-build-plan-tasks.toml
index 4f2670a67..debd80b85 100644
--- a/.codex/agents/bkit-build-plan-tasks.toml
+++ b/.codex/agents/bkit-build-plan-tasks.toml
@@ -105,6 +105,9 @@ developer_instructions = """
 9. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 10. Run `bkit tests changed --fallback=bkit:gate:static`. Every local lint and typecheck must pass.
+
+- **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
+
 11. **If** the tasks are verified (their tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 12. Set `Verdict` in **Create** with `Edit`:
     - `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index b7e42e696..9cb99eadb 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -69,6 +69,7 @@ developer_instructions = """
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
    - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+     - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
 8. **If** a test-first audit report is supplied (its header has `Enforced`, `Verdict` and `Gaps`) → decide each of its gaps. A gap's `fixable` stands unless it is `null`. Decide each `null` one from the diff it names:
    - `delete-still-referenced` → read each hit:
      - **If** the hit is a different thing with the same name → no gap.
diff --git a/.codex/agents/bkit-debug-failure-remediate.toml b/.codex/agents/bkit-debug-failure-remediate.toml
index 810a646bf..dfeae46a9 100644
--- a/.codex/agents/bkit-debug-failure-remediate.toml
+++ b/.codex/agents/bkit-debug-failure-remediate.toml
@@ -62,6 +62,7 @@ developer_instructions = """
    - Task-runner / build config → merge both sides' task definitions.
    - Ordered database migrations → resequence them so each new file sorts after every migration already applied upstream.
 8. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass.
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - **If** any declared live tests were failing → the remediation is done only when those same live tests pass.
 9. **If** the last local test run has failures → document the errors in the output, and set `Verdict` = `FAIL`.
 10. **If** the remediations are verified (the tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
diff --git a/.cursor/agents/bkit-build-plan-gaps-remediate.md b/.cursor/agents/bkit-build-plan-gaps-remediate.md
index c6b36bea6..12a485e10 100644
--- a/.cursor/agents/bkit-build-plan-gaps-remediate.md
+++ b/.cursor/agents/bkit-build-plan-gaps-remediate.md
@@ -99,6 +99,7 @@ tools:
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
    - Fix those files in the same pass as the failure.
diff --git a/.cursor/agents/bkit-build-plan-tasks.md b/.cursor/agents/bkit-build-plan-tasks.md
index 62d3e8cc6..c3c4717aa 100644
--- a/.cursor/agents/bkit-build-plan-tasks.md
+++ b/.cursor/agents/bkit-build-plan-tasks.md
@@ -115,6 +115,9 @@ tools:
 9. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 10. Run `bkit tests changed --fallback=bkit:gate:static`. Every local lint and typecheck must pass.
+
+- **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
+
 11. **If** the tasks are verified (their tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 12. Set `Verdict` in **Create** with `Edit`:
     - `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index eac0df68c..0728e5790 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -79,6 +79,7 @@ tools:
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
    - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+     - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
 8. **If** a test-first audit report is supplied (its header has `Enforced`, `Verdict` and `Gaps`) → decide each of its gaps. A gap's `fixable` stands unless it is `null`. Decide each `null` one from the diff it names:
    - `delete-still-referenced` → read each hit:
      - **If** the hit is a different thing with the same name → no gap.
diff --git a/.cursor/agents/bkit-debug-failure-remediate.md b/.cursor/agents/bkit-debug-failure-remediate.md
index 87bee84ed..bbc9db5b3 100644
--- a/.cursor/agents/bkit-debug-failure-remediate.md
+++ b/.cursor/agents/bkit-debug-failure-remediate.md
@@ -72,6 +72,7 @@ tools:
    - Task-runner / build config → merge both sides' task definitions.
    - Ordered database migrations → resequence them so each new file sorts after every migration already applied upstream.
 8. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass.
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - **If** any declared live tests were failing → the remediation is done only when those same live tests pass.
 9. **If** the last local test run has failures → document the errors in the output, and set `Verdict` = `FAIL`.
 10. **If** the remediations are verified (the tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
diff --git a/.opencode/agents/bkit-build-plan-gaps-remediate.md b/.opencode/agents/bkit-build-plan-gaps-remediate.md
index a6df220ed..6681ff46a 100644
--- a/.opencode/agents/bkit-build-plan-gaps-remediate.md
+++ b/.opencode/agents/bkit-build-plan-gaps-remediate.md
@@ -100,6 +100,7 @@ tools:
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
    - Fix those files in the same pass as the failure.
diff --git a/.opencode/agents/bkit-build-plan-tasks.md b/.opencode/agents/bkit-build-plan-tasks.md
index a4feef98b..1d9e13888 100644
--- a/.opencode/agents/bkit-build-plan-tasks.md
+++ b/.opencode/agents/bkit-build-plan-tasks.md
@@ -116,6 +116,9 @@ tools:
 9. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 10. Run `bkit tests changed --fallback=bkit:gate:static`. Every local lint and typecheck must pass.
+
+- **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
+
 11. **If** the tasks are verified (their tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 12. Set `Verdict` in **Create** with `Edit`:
     - `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index 34a3de524..04b8e8585 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -80,6 +80,7 @@ tools:
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
    - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+     - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
 8. **If** a test-first audit report is supplied (its header has `Enforced`, `Verdict` and `Gaps`) → decide each of its gaps. A gap's `fixable` stands unless it is `null`. Decide each `null` one from the diff it names:
    - `delete-still-referenced` → read each hit:
      - **If** the hit is a different thing with the same name → no gap.
diff --git a/.opencode/agents/bkit-debug-failure-remediate.md b/.opencode/agents/bkit-debug-failure-remediate.md
index 8559e15d8..e207dd254 100644
--- a/.opencode/agents/bkit-debug-failure-remediate.md
+++ b/.opencode/agents/bkit-debug-failure-remediate.md
@@ -73,6 +73,7 @@ tools:
    - Task-runner / build config → merge both sides' task definitions.
    - Ordered database migrations → resequence them so each new file sorts after every migration already applied upstream.
 8. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass.
+   - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - **If** any declared live tests were failing → the remediation is done only when those same live tests pass.
 9. **If** the last local test run has failures → document the errors in the output, and set `Verdict` = `FAIL`.
 10. **If** the remediations are verified (the tests pass) **and** the work found gotchas → append one row per gotcha to `docs/knowledge.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index b2c5ac9dd..8a8802eda 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -10,6 +10,8 @@ Format: `## [version] — YYYY-MM-DD`
 
 ### Added
 
+- **`bkit tests changed` recognizes the same tests-lock outcomes as `tests run`.** It accepts `--lock-wait-s`, passes the budget and its run name to the selected gate, and exits 81 with `lockHolder` when that gate gives up on the tests lock. Both commands keep a wait separate from a failing test run; `tests run --file` appends no `test-run` status row for a wait. The caller prompts re-run the command on exit 81.
+- **`bkit tests run` hands tests-lock waits back to the agent.** It passes `--lock-wait-s` and its run name to a wrapped gate, and exits 81 with `lockHolder` when that gate gives up on the tests lock. A refusal exits 4; gate failures keep their normal verdict. The wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; Claude Code ships a 1200-second budget. Light test-first runs stay unwrapped.
 - **The machine lock queues test gates across repositories.** The template is renamed `bkit-machine-lock.sh` and adds named machine-wide locks, configurable test slots, worker limits and enforced lock order. `run` exits 73 when a lock cannot be taken and 75 when its wait gives up; without a TTY, the default wait is 60 seconds. Adopted stack-lock copies keep working. To adopt the tests lock, copy `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to `scripts/ci/` and wrap each test-running `bkit:gate:*` script with `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command>`. Put chained commands in one `sh -c` string. See `.bkit/templates.md` § Machine lock.
 - **A setup tip tells you when a newer bkit is out.** `bkit tips` shows `bkit-upgrade` first, ahead of every other tip in every workflow, while the newest release `bkit repo info` last saw (cached once a day in git's common dir) is newer than `.bkit/version`. The tip only reads that cache and never asks the registry itself, so it stays quiet until a workflow has run once. It cannot be silenced: `bkit.advisories.ignore` skips it, a workflow's silence line never names it, and `BKIT_NO_UPDATE_CHECK=1` stops only the lookup, not a release already seen. Its ask points the agent at `.bkit/install.md` § Upgrade — already installed.
 - **A setup tip offers to send your bkit friction and stats to bkit's makers as one issue.** `bkit tips` shows `share-friction` while `.bkit/friction.jsonl` holds an `OPEN` entry that is not `consumer` scope. Its paste block, `.bkit/README.md` § Share friction with bkit, has the agent refresh `.bkit/stats.md`, strip each entry to the fields bkit needs, remove anything that names the project, show you the exact issue before posting, and then mark each entry `TRIAGED` with the issue link, so the tip returns only when new friction arrives. It never fires in bkit's own repo.
diff --git a/README.md b/README.md
index 24bb0b50c..c3361c716 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from c0a0b0a820b684039bd1611cdfc7f94d7005e2f2 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 272c6b63b344850d0ec6a1713f5b4b53898d2074 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index 5228b0d2c..11b5f228b 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -52,6 +52,38 @@ export class CommandError extends Error {
         this.code = code;
     }
 }
+/** Parse a whole-number flag, using its fallback only when absent. */
+export const wholeNumber = (v, flag, fallback, min = 0) => {
+    if (v === undefined)
+        return fallback;
+    const s = String(v);
+    if (!/^[0-9]+$/.test(s) || Number(s) < min) {
+        throw new CommandError(EXIT.USAGE, `--${flag} takes a whole number >= ${min} (got "${s}")`);
+    }
+    return Number(s);
+};
+/** The holder named by this run when its tests-lock wait gave up. */
+export function testsLockHolder(log, who) {
+    const prefix = `[machine-lock] ❌ ${who} gave up after `;
+    for (const line of log.split(/\r?\n/)) {
+        if (!line.startsWith(prefix))
+            continue;
+        const holder = /^\d+s waiting for tests, in use by (.+)$/.exec(line.slice(prefix.length));
+        if (holder)
+            return holder[1];
+    }
+    return null;
+}
+/** Classify only a tests-lock outcome, leaving gate and nested-lock failures intact. */
+export function classifyLockExit({ exitCode, log, who, }) {
+    const lines = log.split(/\r?\n/);
+    if (exitCode === 75 && testsLockHolder(log, who) !== null)
+        return "lock-wait";
+    if (exitCode === 73 &&
+        lines.some((line) => /^\[machine-lock\] ❌ (?:could not take the lock for tests:|cannot take tests while holding )/.test(line)))
+        return "could-not-run";
+    return "gate";
+}
 // ---------------------------------------------------------------------------
 // Flags
 // ---------------------------------------------------------------------------
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 7804590b1..e0ca86582 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -22,7 +22,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { statusTimestamp } from "../../ledgers/status.js";
-import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, isSharedBranch, parseJson, runGh, runGit, SKIP_CI_TOKEN, } from "../lib.js";
+import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, isSharedBranch, parseJson, runGh, runGit, SKIP_CI_TOKEN, wholeNumber, } from "../lib.js";
 import { ciGeneratedSteps, readBkitConfig } from "../../shared/settings.js";
 import { TIMEOUTS } from "../../shared/timeouts.js";
 import { FID_PATTERNS, fromBranch, fromMarker, issueIdOf, readIssueTracker } from "./fids.js";
@@ -836,15 +836,6 @@ export const EXIT_TRIGGER_FAILED = 5;
 export const EXIT_SKIP_TOKEN = 4;
 /** Exit code: the pushed head's commit message could not be read for the body scan. */
 export const EXIT_SCAN_ERROR = 5;
-const wholeNumber = (v, flag, fallback, min = 0) => {
-    if (v === undefined)
-        return fallback;
-    const s = String(v);
-    if (!/^[0-9]+$/.test(s) || Number(s) < min) {
-        throw new CommandError(EXIT.USAGE, `--${flag} takes a whole number >= ${min} (got "${s}")`);
-    }
-    return Number(s);
-};
 const HEAD_FLAG = { name: "head", type: "string", help: "commit SHA" };
 const REPO_FLAG = {
     name: "repo",
diff --git a/dist/commands/workflow/tests-changed.js b/dist/commands/workflow/tests-changed.js
index eebb31346..4caf3678a 100644
--- a/dist/commands/workflow/tests-changed.js
+++ b/dist/commands/workflow/tests-changed.js
@@ -9,7 +9,7 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest.js";
-import { CommandError, EXIT, git } from "../lib.js";
+import { classifyLockExit, CommandError, EXIT, git, testsLockHolder, wholeNumber, } from "../lib.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 /** Exit code: neither `bkit:gate:changed` nor the --fallback gate is declared. */
@@ -43,12 +43,16 @@ function declares(dir, name) {
  * Run argv in `cwd` with stdout and stderr interleaved, each output line passed to `log`.
  * Exit 127 when the binary is missing; 128 + n when killed by signal n.
  */
-function runLogged(argv, cwd, log) {
+function runLogged(argv, cwd, log, env) {
     const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-changed-"));
     const file = path.join(dir, "out.log");
     try {
         const fd = fs.openSync(file, "w");
-        const res = spawnSync(argv[0], argv.slice(1), { cwd, stdio: ["ignore", fd, fd] });
+        const res = spawnSync(argv[0], argv.slice(1), {
+            cwd,
+            stdio: ["ignore", fd, fd],
+            env: { ...process.env, ...env },
+        });
         fs.closeSync(fd);
         for (const line of fs
             .readFileSync(file, "utf-8")
@@ -69,9 +73,14 @@ function runLogged(argv, cwd, log) {
     }
 }
 export const testsChangedVerb = {
-    summary: `Check only the files changed since --base: run \`${BKIT_GATE_CHANGED_SCRIPT}\` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run.`,
+    summary: `Check only the files changed since --base: run \`${BKIT_GATE_CHANGED_SCRIPT}\` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held.`,
     use: "by-hand",
     flags: [
+        {
+            name: "lock-wait-s",
+            type: "string",
+            help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
+        },
         {
             name: "base",
             type: "string",
@@ -89,12 +98,17 @@ export const testsChangedVerb = {
         scope: "the command that ran, without the file arguments, or null",
         exitCode: "the gate's exit code, or null when nothing ran",
         verdict: "PASS / FAIL, or null when nothing ran or the gate could not run",
+        lockHolder: "tests-lock holder when the wait gave up, else null",
     },
     exitCodes: {
         [EXIT_NO_GATE]: `neither \`${BKIT_GATE_CHANGED_SCRIPT}\` nor the --fallback gate is declared in package.json`,
         [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
     },
     run: (ctx) => {
+        const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
+        const waitS = wholeNumber(waitSource, ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
+            ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
+            : "lock-wait-s", 60);
         const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
         const base = typeof ctx.flags.base === "string" ? ctx.flags.base : "HEAD";
         if (git(top, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
@@ -108,7 +122,14 @@ export const testsChangedVerb = {
         let argv;
         if (declares(top, BKIT_GATE_CHANGED_SCRIPT)) {
             if (files.length === 0) {
-                ctx.emit({ files, gate: null, scope: null, exitCode: null, verdict: null });
+                ctx.emit({
+                    files,
+                    gate: null,
+                    scope: null,
+                    exitCode: null,
+                    verdict: null,
+                    lockHolder: null,
+                });
                 return EXIT.OK;
             }
             gate = BKIT_GATE_CHANGED_SCRIPT;
@@ -125,10 +146,24 @@ export const testsChangedVerb = {
         }
         const scope = scriptCommand(gate).join(" ");
         ctx.log(`running ${scope}`);
-        const exitCode = runLogged(argv, top, ctx.log);
-        const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
-        const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
-        ctx.emit({ files, gate, scope, exitCode, verdict });
+        const who = `bkit tests changed ${gate}`;
+        const lines = [];
+        const exitCode = runLogged(argv, top, (line) => {
+            lines.push(line);
+            ctx.log(line);
+        }, {
+            LOCAL_STACK_LOCK_WAIT_S: String(waitS),
+            LOCAL_STACK_LOCK_WHO: who,
+        });
+        const log = lines.join("\n");
+        const lockExit = classifyLockExit({ exitCode, log, who });
+        const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
+        const lockWait = lockExit === "lock-wait";
+        const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
+        const lockHolder = lockWait ? testsLockHolder(log, who) : null;
+        ctx.emit({ files, gate, scope, exitCode, verdict, lockHolder });
+        if (lockWait)
+            return EXIT.AGENT_WAIT;
         if (couldNotRun)
             return EXIT_COULD_NOT_RUN;
         return exitCode === 0 ? EXIT.OK : EXIT.NO;
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index fd67189d5..9327a5179 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -23,7 +23,7 @@ import * as path from "node:path";
 import { BKIT_LINT_FILE_SCRIPT, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
 import { clampLogPath } from "../../ledgers/clamp-log.js";
 import { appendLine, statusTimestamp } from "../../ledgers/status.js";
-import { CommandError, EXIT, git, runGit } from "../lib.js";
+import { classifyLockExit, CommandError, EXIT, git, runGit, testsLockHolder, wholeNumber, } from "../lib.js";
 import { parseJson } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
@@ -43,6 +43,7 @@ export const EXIT_ARTIFACT_STEP = 5;
 export const TEST_RUN_ROW = "test-run";
 /** The env var naming the folder every runner a gate calls writes its JUnit XML into. */
 export const REPORT_DIR_ENV = "BKIT_TEST_REPORT_DIR";
+export { classifyLockExit } from "../lib.js";
 const NO_REPORT_HINT = `no JUnit report in $${REPORT_DIR_ENV} — failures unknown; turn on each test runner's JUnit ` +
     `reporter in the gate and point its output into $${REPORT_DIR_ENV} ` +
     "(.bkit/workflows.md § Local gate scripts)";
@@ -1186,7 +1187,7 @@ export const testsCommand = {
     verbs: {
         changed: testsChangedVerb,
         run: {
-            summary: "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run.",
+            summary: "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held.",
             use: "by-hand",
             flags: [
                 {
@@ -1207,6 +1208,11 @@ export const testsCommand = {
                     type: "string",
                     help: `lines of the log echoed to stderr afterwards (default ${DEFAULT_TAIL}; 0 for none)`,
                 },
+                {
+                    name: "lock-wait-s",
+                    type: "string",
+                    help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
+                },
                 {
                     name: "artifact",
                     type: "string",
@@ -1241,7 +1247,8 @@ export const testsCommand = {
                 logBytes: "size of the saved output",
                 artifact: "--artifact as given, else null",
                 clamp: "the artifact's clamp record (raw = the log, source = scope), else null",
-                row: `the ${TEST_RUN_ROW} row appended to --file ({type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}; run = this step's test-run rows in the workflow's active run, this one included), else null`,
+                row: `the ${TEST_RUN_ROW} row appended to --file ({type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}; run = this step's test-run rows in the workflow's active run, this one included), else null; a tests-lock wait writes no row`,
+                lockHolder: "tests-lock holder when the wait gave up, else null",
             },
             textOmit: ["clamp", "row"],
             exitCodes: {
@@ -1250,6 +1257,10 @@ export const testsCommand = {
                 [EXIT_ARTIFACT_STEP]: "--artifact could not be written, trimmed or recorded",
             },
             run: (ctx) => {
+                const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
+                const waitS = wholeNumber(waitSource, ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
+                    ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
+                    : "lock-wait-s", 60);
                 const candidates = ctx.flags.gate;
                 const logArg = String(ctx.flags.log);
                 if (logArg === "")
@@ -1287,20 +1298,34 @@ export const testsCommand = {
                 const reports = freshReportDir(log);
                 ctx.log(`running ${scope} — full output in ${logArg}`);
                 const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
-                const exitCode = runToLog(scriptCommand(gate), top, log, { [REPORT_DIR_ENV]: reports });
-                for (const line of Number(tailRaw) > 0 ? tailLines(log, Number(tailRaw)) : [])
+                const who = ["bkit tests run", gate, fid, step].filter(Boolean).join(" ");
+                const exitCode = runToLog(scriptCommand(gate), top, log, {
+                    [REPORT_DIR_ENV]: reports,
+                    LOCAL_STACK_LOCK_WAIT_S: String(waitS),
+                    LOCAL_STACK_LOCK_WHO: who,
+                });
+                const logText = fs.readFileSync(log, "utf-8");
+                const lockExit = classifyLockExit({ exitCode, log: logText, who });
+                const lockWait = lockExit === "lock-wait";
+                const lockHolder = lockWait ? testsLockHolder(logText, who) : null;
+                const lines = lockExit === "gate"
+                    ? Number(tailRaw) > 0
+                        ? tailLines(log, Number(tailRaw))
+                        : []
+                    : logText.split(/\r?\n/).filter((line) => line.startsWith("[machine-lock]"));
+                for (const line of lines)
                     ctx.log(line);
-                const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
-                const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
-                const counted = countReportFailures(reports);
-                if (counted === null)
+                const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
+                const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
+                const counted = lockExit === "gate" ? countReportFailures(reports) : null;
+                if (counted === null && lockExit === "gate")
                     ctx.log(NO_REPORT_HINT);
                 else if (verdict === "FAIL" && counted === 0)
                     ctx.log(`the JUnit reports in $${REPORT_DIR_ENV} hold no failing case — the gate failed outside its reported tests; failures unknown`);
                 const failures = verdict === "PASS" ? 0 : counted !== null && counted > 0 ? counted : null;
                 let clamp = null;
                 let artifactFailed = null;
-                if (artifact !== undefined) {
+                if (artifact !== undefined && !lockWait) {
                     try {
                         const out = path.resolve(ctx.cwd, artifact);
                         fs.mkdirSync(path.dirname(out), { recursive: true });
@@ -1322,7 +1347,7 @@ export const testsCommand = {
                         artifactFailed = err.message;
                     }
                 }
-                const row = status === undefined
+                const row = status === undefined || lockWait
                     ? null
                     : appendTestRun(status, {
                         workflow: workflow,
@@ -1344,16 +1369,19 @@ export const testsCommand = {
                     reports: `${logArg}.reports`,
                     log: logArg,
                     logBytes: fs.statSync(log).size,
-                    artifact: artifact ?? null,
+                    artifact: lockWait ? null : (artifact ?? null),
                     clamp,
                     row,
+                    lockHolder,
                 });
                 if (artifactFailed !== null) {
                     ctx.log(`--artifact ${artifact}: ${artifactFailed}`);
                     return EXIT_ARTIFACT_STEP;
                 }
+                if (lockWait)
+                    return EXIT.AGENT_WAIT;
                 if (couldNotRun) {
-                    ctx.log(`${scope} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`);
+                    ctx.log(`${scope} could not run (exit ${exitCode}: ${lockExit === "could-not-run" ? "tests lock refused" : exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`);
                     return EXIT_COULD_NOT_RUN;
                 }
                 ctx.log(`verdict ${verdict} (exit ${exitCode})`);
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 6395a6380..578ba26c1 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `c0a0b0a82`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `272c6b63b`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from c0a0b0a820b684039bd1611cdfc7f94d7005e2f2 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 272c6b63b344850d0ec6a1713f5b4b53898d2074 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from c0a0b0a820b684039bd1611cdfc7f94d7005e2f2 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 272c6b63b344850d0ec6a1713f5b4b53898d2074 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index 0f9bd59fb..b8cd9cdd1 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -130,3 +130,7 @@
 {"schema":3,"ts":1793615687299,"firstTs":1793615687299,"updates":1,"kind":"failure","key":"runs-context-issue-less-marker-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724","814",".bkit/core/engine/commands/workflow/runs.test.ts","docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-2-log.md"],"category":"testing","severity":"LOW","summary":"runs.test.ts \"runs context refuses an issue-less marker and branch naming the missing issue\" timed out under the changed-file gate and passed in a focused retry","description":"Observed in Group 2's required bkit tests changed --fallback=bkit:gate:static run: this case timed out after 5090ms. The named lane reported 4 failed, 6667 passed and 2 skipped. A focused retry of the unchanged runs.test.ts passed all 171 tests in 31.43s; its logged budget was 5087ms per test at load average 10.2 on 10 cores. Evidence: tmp/724-group2-changed.log and tmp/724-group2-runs-recheck.log. The original broad gate remains failed; the focused pass does not replace it.","rootCause":"Not established by this run. The failure depends on broad-gate execution conditions; concurrent test processes were observed while the gate ran.","remediation":"Investigate and reproduce the subprocess timeout under concurrent full-gate load; preserve the original failed gate evidence.","status":"OPEN"}
 {"schema":3,"ts":1793616544114,"firstTs":1793615687295,"updates":2,"kind":"failure","key":"runs-revalidate-pr-head-auth-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/runs.test.ts","tmp/724-group2-remediate-changed.log"],"category":"testing","severity":"LOW","summary":"PR-head authentication case timed out again in the changed-file gate","description":"The unchanged runs.test.ts case exits 1 when the PR head cannot be read, 80 when gh needs auth timed out at its 5000ms budget (5072ms reported). The named lane had 4282 passed and two failed tests. Earlier focused pass evidence remains in the prior ledger row; this broad failure is not a pass.","rootCause":"Not established; no unrelated runs source change made during the single lock-holder remediation.","remediation":"Investigate subprocess timeout under broad-gate load and preserve the failed gate evidence.","status":"OPEN"}
 {"schema":3,"ts":1793616544115,"firstTs":1793615687297,"updates":2,"kind":"failure","key":"runs-context-ref-labels-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/runs.test.ts","tmp/724-group2-remediate-changed.log"],"category":"testing","severity":"LOW","summary":"Context reference and labels case timed out again in the changed-file gate","description":"The unchanged runs.test.ts case prints ref (#N on GitHub) and the labels the engine reads; a failed read is null timed out at its 5000ms budget (5302ms reported). The named lane had 4282 passed and two failed tests. Earlier focused pass evidence remains in the prior ledger row; this broad failure is not a pass.","rootCause":"Not established; no unrelated runs source change made during the single lock-holder remediation.","remediation":"Investigate subprocess timeout under broad-gate load and preserve the failed gate evidence.","status":"OPEN"}
+{"schema":3,"ts":1793661257611,"firstTs":1791961279983,"updates":5,"kind":"failure","key":"runs-test-ci-refuses-not-open-pr-timeout-under-full-suite","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724","814",".bkit/core/engine/commands/workflow/runs.test.ts","tmp/724-group3-changed-final.log","tmp/724-group3-runs-timeout-retry.log"],"category":"testing","severity":"LOW","summary":"runs.test.ts \"CI refuses a PR that is not open (7) and a head with no CI run (8)\" timed out under the changed-file gate and passed in a focused retry","description":"Re-observed in group 3 required changed gate: related stage timed out at 5000ms in four runs cases (3594 passed, 4 failed, 2 skipped). The named stage then passed all 7109 tests with two existing skips. The original gate remains FAIL; a later pass does not replace it. Evidence: tmp/724-group3-changed-final.log.","rootCause":"Not established by this run; active concurrent fixture subprocesses were observed during the broad gate.","remediation":"Investigate the repeated subprocess timeouts under broad-gate load; preserve failed gate and focused retry evidence.","status":"OPEN"}
+{"schema":3,"ts":1793661257613,"firstTs":1793615687295,"updates":3,"kind":"failure","key":"runs-revalidate-pr-head-auth-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724","814",".bkit/core/engine/commands/workflow/runs.test.ts","tmp/724-group3-changed-final.log","tmp/724-group3-runs-timeout-retry.log"],"category":"testing","severity":"LOW","summary":"PR-head authentication case timed out again in the changed-file gate","description":"Re-observed in group 3 required changed gate: related stage timed out at 5000ms in four runs cases (3594 passed, 4 failed, 2 skipped). The named stage then passed all 7109 tests with two existing skips. The original gate remains FAIL; a later pass does not replace it. Evidence: tmp/724-group3-changed-final.log.","rootCause":"Not established by this run; active concurrent fixture subprocesses were observed during the broad gate.","remediation":"Investigate the repeated subprocess timeouts under broad-gate load; preserve failed gate and focused retry evidence.","status":"OPEN"}
+{"schema":3,"ts":1793661257614,"firstTs":1793615687297,"updates":3,"kind":"failure","key":"runs-context-ref-labels-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724","814",".bkit/core/engine/commands/workflow/runs.test.ts","tmp/724-group3-changed-final.log","tmp/724-group3-runs-timeout-retry.log"],"category":"testing","severity":"LOW","summary":"Context reference and labels case timed out again in the changed-file gate","description":"Re-observed in group 3 required changed gate: related stage timed out at 5000ms in four runs cases (3594 passed, 4 failed, 2 skipped). The named stage then passed all 7109 tests with two existing skips. The original gate remains FAIL; a later pass does not replace it. Evidence: tmp/724-group3-changed-final.log.","rootCause":"Not established by this run; active concurrent fixture subprocesses were observed during the broad gate.","remediation":"Investigate the repeated subprocess timeouts under broad-gate load; preserve failed gate and focused retry evidence.","status":"OPEN"}
+{"schema":3,"ts":1793661257615,"firstTs":1793615687299,"updates":2,"kind":"failure","key":"runs-context-issue-less-marker-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724","814",".bkit/core/engine/commands/workflow/runs.test.ts","tmp/724-group3-changed-final.log","tmp/724-group3-runs-timeout-retry.log"],"category":"testing","severity":"LOW","summary":"runs.test.ts \"runs context refuses an issue-less marker and branch naming the missing issue\" timed out under the changed-file gate and passed in a focused retry","description":"Re-observed in group 3 required changed gate: related stage timed out at 5000ms in four runs cases (3594 passed, 4 failed, 2 skipped). The named stage then passed all 7109 tests with two existing skips. The original gate remains FAIL; a later pass does not replace it. Evidence: tmp/724-group3-changed-final.log.","rootCause":"Not established by this run; active concurrent fixture subprocesses were observed during the broad gate.","remediation":"Investigate the repeated subprocess timeouts under broad-gate load; preserve failed gate and focused retry evidence.","status":"OPEN"}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 382d49bb0..6b44f5fda 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -136,3 +136,5 @@
 {"schema":3,"ts":1793609535806,"firstTs":1793609535806,"updates":1,"kind":"knowledge","key":"machine-lock-dynamic-state-must-preserve-name-identity","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"Named-lock owner and PID keys must preserve the normalized lock file identity","rootCause":"Replacing hyphens and dots with underscores only in the dynamic variable key makes distinct lock files share live-owner state, so the second take falsely succeeds without acquiring its lock.","remediation":"Escape underscores before encoding hyphens and dots in owner/PID keys. Keep simple names such as tests unchanged, and verify acquisition plus release of both distinct locks with real holder files.","status":"ACTIVE"}
 {"schema":3,"ts":1793609535807,"firstTs":1793609535807,"updates":1,"kind":"knowledge","key":"machine-lock-indirect-state-needs-unset-defaults","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"Bash indirect owner/PID reads require defaults for source callers using nounset","rootCause":"A sourced helper reading an unset dynamic variable through indirect expansion aborts bash -u before its normal empty-state check.","remediation":"Use unset-safe defaults on each indirect state read, including release; verify both named and unnamed take/release calls in a real bash -eu subprocess.","status":"ACTIVE"}
 {"schema":3,"ts":1793616226476,"firstTs":1793616226476,"updates":1,"kind":"knowledge","key":"machine-lock-holder-report-allows-empty-primary-slot","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"Holder reporting must allow an empty primary slot under bash errexit","rootCause":"After the first tests slot is released, numbered slots can still be occupied. An unconditional cat of the absent primary holder file aborts a bash -e caller before numbered holders are reported.","remediation":"Check whether the primary sidecar exists before reading it, and exercise real slot acquisition and release with holder reporting under bash -e.","status":"ACTIVE"}
+{"schema":3,"ts":1793659952583,"firstTs":1793659952583,"updates":1,"kind":"knowledge","key":"tests-command-shared-lock-classifier-import-direction","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724",".bkit/core/engine/commands/lib.ts",".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/commands/workflow/tests-changed.ts",".bkit/core/engine/commands/workflow/tests-changed.test.ts"],"summary":"Shared tests-lock helpers must not create a cycle between the test command modules","description":"Importing tests-changed.ts first exposed an undefined testsCommand.verbs.changed; all ten command cases then failed when runCommand read exitCodes. The normal CLI import order hid the problem, while the existing direct-module unit tests reproduced it.","rootCause":"tests.ts captures testsChangedVerb in its command specification during module initialization. A reciprocal static import from tests-changed.ts back to tests.ts can evaluate that capture before the exported verb constant is initialized.","remediation":"Keep the pure classifier and holder extractor in commands/lib.ts and import them directly in both command modules. tests.ts may re-export classifyLockExit for its public test API; tests-changed.ts should not depend on that re-export. Verify the direct-module tests-changed.test.ts as well as CLI integration cases.","status":"ACTIVE"}
+{"schema":3,"ts":1793660763377,"firstTs":1793660763377,"updates":1,"kind":"knowledge","key":"tracker-post-unit-tests-clear-ambient-linear-credential","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724",".bkit/core/engine/commands/workflow/issues.test.ts",".bkit/core/engine/commands/workflow/steps.test.ts"],"summary":"Tracker post unit tests must clear ambient Linear credentials before asserting missing-auth behavior","description":"With BKIT_LINEAR_API_KEY supplied by direnv, the existing failed-post cases called Linear and received not-found instead of the expected missing-auth reason. Both failures repeated in the related and named changed-gate stages.","rootCause":"The post suites restored the original credential after each test but did not clear it before cases that require no credential.","remediation":"Delete BKIT_LINEAR_API_KEY in each post suite's beforeEach and retain its existing afterEach restoration. Successful post cases explicitly set the stub credential and fake fetch. Keep missing-auth assertions independent of network responses.","status":"ACTIVE"}
diff --git a/docs/templates/bkit-audit-testing.md b/docs/templates/bkit-audit-testing.md
index 6b1020e89..95efbb823 100644
--- a/docs/templates/bkit-audit-testing.md
+++ b/docs/templates/bkit-audit-testing.md
@@ -39,7 +39,7 @@ A green suite means the tests passed. It does not mean they could fail, that eve
 - Test-smell catalogue (e.g., xUnit Test Patterns, Meszaros 2007).
 - Test lint (e.g., `@vitest/eslint-plugin`, `eslint-plugin-playwright`, `eslint-plugin-testing-library`, or Oxlint's `vitest` + `typescript` plugins); record each version. typescript-eslint type-aware rules need a TypeScript version it supports; newer → Oxlint `--type-aware` (oxlint-tsgolint).
 - Network mock that fails closed (e.g., MSW); record the major read.
-- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § Test first; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs
+- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § Test first; § Tests lock; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs
 
 ### Scope
 
diff --git a/docs/testing.md b/docs/testing.md
index e2904aced..88b55784c 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -305,6 +305,17 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 - **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
 - **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify.
 
+## Tests lock
+
+Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bkit/templates.md` § Machine lock). The wrapped script holds the `tests` lock for the whole gate, across repositories. An unwired repository takes no lock.
+
+- `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` as `LOCAL_STACK_LOCK_WAIT_S` and their run name as `LOCAL_STACK_LOCK_WHO`; they run the declared gate without executing the lock script itself.
+- A tests-lock give-up of this run becomes exit 81 with `lockHolder`, and a tests-lock refusal becomes exit 4. A lock wait writes no `test-run` status row. A gate's own failure or a nested lock's give-up remains a test failure. A raw gate caller sees exit 75 and the holder line.
+- Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
+- `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
+- The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands).
+- The script defaults to 60 seconds without a TTY when no wait is set. Waiting notes name the holders and their checkouts' earlier run times.
+
 ## JUnit reports for bkit
 
 `bkit tests run` counts a gate's failures from JUnit XML, not from its log. It empties a report folder before each run and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`.
@@ -666,6 +677,7 @@ The machine-lock integration tests in `audits/templates/machine-lock.integration
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
+| `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | Integration | Real consumer gate wrapping, wait budgets and exit mapping, lock lifetime, CI and light-run bypass, inherited workers and nested wrappers. |
 | `.bkit/core/engine/commands/install/doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 and Phase 1 and Phase 3 advisory replay. |
 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | Integration | design / plan close `branches land` line run verbatim (local runtime) against a real remote + worktree: a conflict-dropped doc keeps `feat/{FID}` and leaves `dev` unmoved; another session's uncommitted edit, staged doc, local-only `dev` commit or other checked-out branch never blocks the close and is left as it was (local `dev` fast-forwards only when it can); clean close lands the branch copy, then deletes the branch. The `bkit-build.md` held close, run verbatim: origin refs unchanged, branch and worktree kept, lock released; the rows, summary and worktree-only roadmap row recorded. |
 | `.bkit/core/engine/commands/install/uninstall.test.ts` | Unit | `runUninstall` orchestrator — format-aware decision matrix (fully-managed / markered-text / byte-equal-text), dry-run, idempotency, `--nuke`; `docs/*.md` block strip (managed marker included, consumer content kept) and `docs/templates/bkit-*.md` deletion on a full uninstall only; a managed `.bkit/lite.md` block stripped with the consumer section kept. |
