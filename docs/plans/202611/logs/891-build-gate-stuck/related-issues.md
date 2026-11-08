## #743 — Build group gate re-runs integration tests after every group (closed)

### Narrative

After every task group except the last, the build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) runs `bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit`. The deepest declared gate wins, so in any repo that declares an integration gate, every group re-runs the whole integration suite. Step 12 then runs it once more. Build 701 ran 8 group gates at about 135s of integration tests each (`docs/plans/202610/logs/701-engine-work-build/build-group-gate-9-1.md`), so roughly 18 minutes went on integration before Step 12 even started.

The group gate should run static checks and the unit tier only (`bkit:gate:static-unit`). Integration runs once at Step 12, then again at pre-push and in CI before anything merges. Unit tests import the same code and catch most breaks a later group would hit. The cost is that a break only an integration test catches surfaces at Step 12, against the whole build's changes rather than the group that caused it.

### Success Criteria

- Step 8's group gate and the gate command Step 9 hands `@bkit-build-plan-gaps-remediate` run `bkit:gate:static-unit` only.
- Step 12 still runs the deepest declared build gate, integration included.
- `.bkit/workflows.md` § Group gate and the gate tables say which tier each step runs, and why.
- Debug Step 3 and `.husky/pre-push` are unchanged.

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Rendered bkit-build workflow matches the snapshot | unit | `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Unit-only group gate
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Group gate and its fix-round handoff run `bkit:gate:static-unit` only
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 and Step 9 Context gate command
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate, the local gate script table, the build/debug candidate table
  - **UPDATE:** `.bkit/core/.bkit/pipeline.md`: group gate line
  - **UPDATE:** `BKIT_BUILD_GATES` in `.bkit/core/engine/install/manifest.ts`: doc comment
  - **DONE WHEN:** `pnpm bkit:gate:static-unit-integration` and `bkit check` exit 0 with regenerated mirrors and snapshot
  - **TEST FIRST:**
    - n/a — workflow text and docs only; covered by the render snapshot
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Out of Scope

- Choosing integration suites per group from the files it touched: no reliable file-to-suite map exists.
- Builds already in progress (699, 715): they keep the old gate until they rebase.

### References

- #723 — Build asks the owner needless questions and repeats fix rounds — https://github.com/cbartens/bkit/issues/723
- `.bkit/workflows.md` § Group gate
- `docs/decisions.jsonl` key `build-group-gate-unit-tier-only`

Done on dev in 6c115b758 (not pushed yet).

**What changed**
- The build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) now runs `bkit tests run --gate=bkit:gate:static-unit`: static checks and unit tests only. When the gate fails, Step 9 gives the fix agent the same command.
- Step 12 still runs the deepest gate the repo declares, integration included. Pre-push and CI also still run integration, and debug Step 3 is unchanged.
- The group gate's gate list is now its own constant, `BKIT_GROUP_GATES` in `.bkit/core/engine/install/manifest.ts`. `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` checks each build call site against its own list, and fails if a new `tests run` call site appears without a check.
- `.bkit/workflows.md` § Group gate explains the new split and what it costs. The gate tables and `.bkit/pipeline.md` match it.
- The decision is recorded in `docs/decisions.jsonl` under the key `build-group-gate-unit-tier-only`.

**What we give up:** a break that only an integration test catches now shows up at Step 12, against the whole build's changes. Before, it showed up at the group that caused it. A failing test at Step 12 also asks the owner (`TESTS_LOOP`) before a fix round, unless `bkit.workflows.build.tests.ask` is false.

**Checks run**
- Full gate on the first version: everything passed except two tests, which this commit updates (the local gate audit and the instructions coverage check).
- After the fix: those two test files, the render snapshots and the ledger check passed (354 passed, 2 skipped), plus `typecheck`, `lint` on the changed files and `bkit check`.
- I didn't re-run the full gate after the fix. Pre-push runs it before anything is pushed.

Builds already in progress (699, 715) keep the old gate until they rebase.

## #607 — Test full-mode runs gate on every non-success final-check result (closed)

From the 2026-10 testing audit (#480): finding `testing-4`, HIGH. Report: `docs/audits/202610/testing.md`, audited at `5f5a097c`.

## What's wrong

`/bkit-ship` runs full-mode `runs gate` before it merges (`.bkit/core/workflows/bkit-ship.md:472`). The gate must refuse unless the final CI check (`bkit-tests-check`) ended in `success`. The code does this at `.bkit/core/engine/commands/workflow/runs.ts:879`. But the test fixtures in `tests/fixtures/gh/jobs/*.json` only ever give that check `success` or `failure`. `cancelled` and `in_progress` are tested, but only for `--capstone-only` mode (`runs.test.ts:571-594`). In the audit, changing the gate to refuse only `failure` still passed all 5624 tests. A cancelled or timed-out CI run would then let a merge through.

## Fix

Add an `it.each` in full mode over the GitHub conclusions `cancelled`, `skipped`, `timed_out`, `neutral`, `action_required`, `stale` and `startup_failure`, asserting that each one is refused. This is a test-only change.

## Done when

Changing `!== "success"` to `=== "failure"` at `runs.ts:879` makes the suite fail.

Logged in `docs/failures.jsonl` under key `audit-testing-runs-gate-non-success-conclusions-untested`.

Next step: `shortcut:build`.

## Plan

**Goal:** if anyone changes the ship gate so that it refuses only a `failure`, at least one test must fail.

### Where the gap is

- In full mode (no `--capstone-only`), `runs gate` first checks the whole run's conclusion (`.bkit/core/engine/commands/workflow/runs.ts:847-862`).
- Only after that does it check the final job, `bkit-tests-check` (`runs.ts:879`).
- So the gap opens when **the run reports `success` but the final job does not**. A realistic way to get there: the final job is `skipped` because its `if:` turned false, while the run still shows green.
- None of today's tests builds that combination. The non-success cases in `runs.test.ts:568-597` all live in the `--capstone-only` block.

### Steps

1. **Test first.** In `.bkit/core/engine/commands/workflow/runs.test.ts`, add a full-mode `it.each` that runs once per non-success conclusion GitHub can give a job: `cancelled`, `skipped`, `timed_out`, `neutral`, `action_required`, `stale`, `startup_failure`.
   - **Fixture:** a completed run with conclusion `success` whose `bkit-tests-check` job has that conclusion.
   - **Expect:** exit code `12` (`GATE.FAILED`, `runs.ts:460`), and stderr containing `concluded '<conclusion>' (not success)`.
   - **Helpers:** reuse `fixtureRun` / `capstone` from the `--capstone-only` block (`runs.test.ts:507-543`). If that needs them moved up to the enclosing `describe`, move them; don't copy them.
2. **Prove it can fail.** Temporarily change `runs.ts:879` from `capstone.conclusion !== "success"` to `capstone.conclusion === "failure"`. Run the file and watch the new cases fail. Then put the line back, and check `git diff runs.ts` is empty.
3. **Docs.** Update the `runs` row in `docs/testing.md` § Key test files, only if it lists the gate's covered cases.

### Done when

- The new cases pass, and they fail under the step-2 change.
- `pnpm bkit:gate:static-unit` and `bkit check` are green, apart from failures in files other agents are editing.
- One commit on `dev`, containing only the files this issue touched.

Ledger key to close: `audit-testing-runs-gate-non-success-conclusions-untested`.

Done in 8240a4e8, with the docs row in 61e35593 (on dev, not pushed).

- A new full-mode it.each in runs.test.ts covers a green run whose final job concluded cancelled, skipped, timed_out, neutral, action_required, stale or startup_failure. Each case expects exit 12.
- Changing runs.ts:879 to refuse only failure made all 7 cases fail.
- Re-checked by me: 144/144 pass. Ledger row closed.

## #814 — Give load-sensitive tests a budget that holds under the full gate (open)

### Failing test or CI run

none yet. Each test fails only under the full parallel gate and passes when run alone.

### What happened

Eight open `docs/failures.jsonl` rows each record one test that times out when the whole suite runs on a busy machine:

<!-- prettier-ignore -->
| Key | Test file |
| --- | --- |
| `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite` | `runs.test.ts` |
| `gateguard-opencode-patch-tests-flaky-under-full-audits-run` | gateguard opencode patch tests |
| `runs-wait-cli-found-flaky-under-full-gate` | `runs.test.ts` |
| `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate` | `ci-scripts.test.ts` |
| `instructions-retired-clause-timeout-under-full-gate` | `instructions.test.ts` |
| `instructions-corpus-store-timeout-under-full-gate` | `instructions.test.ts` |
| `disk-prune-wait-test-flaky-under-load` | `disk-prune.test.ts` |
| `json-parse-owner-audit-timeout-under-load` | json-parse owner audit test |

All of them start processes or scan the whole repo. New rows keep landing (2026-10-14 to 2026-11-02), and every cited test title still exists at `HEAD`.

### What should happen

The full gate passes on a loaded laptop without any test hitting its time limit, and without a test being skipped or its limit raised by hand one at a time.

### Steps to reproduce

1. On a laptop, start other CPU work, or run two worktrees' gates at once.
2. Run the full unit gate.
3. One or more of the tests above fail with a timeout. Each passes when run alone.

### How often

Intermittent, under load only. Not seen on CI, where `loadFactor` is pinned to 1.

### Affected area

`vitest.timeout-budget.ts`. `loadFactor` (`:28-40`) is `loadAverage / cores`, floored at 1 and capped at `MAX_LOAD_FACTOR = 6`. On a 10-core machine, a load average under 10 leaves the idle budget unchanged, even though a spawn-heavy test can be several times slower. The closed sibling row `resolve-push-base-uses-last-green-run-timeout-under-full-gate` states the same cause. Some cases are load-scaled and still time out (`instructions.test.ts:55` `CORPUS_CASE`); others keep fixed budgets (`ci-scripts.test.ts:260` `timeout: 30_000`).

### Evidence

- Workaround on record: knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` (ACTIVE).
- The budget shortfall per test has not been measured.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-7)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- #801 — Build friction: undo per-file test locking and hard stops on missing proof (https://github.com/cbartens/bkit/issues/801), touches the same test harness
- The audit names this class as the top gate candidate for `bkit-audit-gates`.

## #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (closed)

### Failing test or CI run

none yet. Read from `.bkit/core/workflows/bkit-build.md` and seen on a real run (Evidence).

### What happened

`/bkit-build` checks each task group on its own (Step 8, Plan Verify), and then checks the whole feature once (Step 10, Plan Verify Holistic). The two checks are handled very differently when they find a problem:

- **Step 8 has a fix loop.** Fixable gaps go to Step 9 (`@bkit-build-plan-gaps-remediate`), the group is checked again, and gaps that can't be fixed go to the Decision Pause so the owner can decide (`bkit-build.md` Step 8 sub-step 11).
- **Step 10 has none.** Anything except PASS or CONCERNS goes straight to the Failure Path, and the run ends (`bkit-build.md` Step 10 sub-step 5).

Five defects follow from this:

1. **No fix step after the holistic check.** A problem that only shows up across groups, such as two groups that each pass alone but don't fit together, or docs one group made stale, aborts the build. Nothing tries to fix it.
2. **`Fixable` is written but never read.** The holistic report writes `Fixable:` in its header, but Step 10 only holds `fields.Tasks`. A report that says every gap is fixable ends the run the same way as one that says none is.
3. **An owner decision can't be asked.** A holistic gap only the owner can settle (one outside the plan's files, say) goes to the Failure Path, not the Decision Pause. The Decision Pause couldn't list it anyway. Its `VERIFY_GAPS` branch only reads per-group reports (`build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`), not `build-plan-verify-holistic.md`.
4. **Step 10 can't run twice.** `--attempt=1` is hard-coded, the artifact name has no attempt number, and sub-step 1 skips to Step 11 whenever a verdict already exists. So even with a fix step, the check could never run again to confirm the fix.
5. **Later fixes skip the whole-feature check.** For the same reason as 4, the fix groups Build Challenge adds (Step 11 → Step 7 → Step 8/9) go back through Step 10, find a verdict already recorded, and skip it. Nothing checks how those fixes fit with the rest of the feature.

### What should happen

- A holistic FAIL with fixable gaps is fixed and checked again, the way Step 8/9 does for a group, within `build.verify.maxAttempts`.
- A holistic gap that can't be fixed, or one still open when the attempts run out, is asked at the Decision Pause, which lists the gaps from the holistic report. It is not an abort.
- Each holistic attempt writes its own report, so earlier reports stay readable.
- Fix groups added after the holistic check passed are checked as a whole feature again before the run goes on.

### Steps to reproduce

1. Run `/bkit-build` on a plan where every group passes Step 8, but the combined diff leaves something stale across groups. For example, docs one group should have updated after another group's change.
2. Step 10 writes `Verdict: FAIL`, `Fixable: true`.
3. The run calls `workflows fail` and stops at Step 10.

### How often

Every run whose holistic check finds any gap.

### Affected area

- `.bkit/core/workflows/bkit-build.md`: Step 10, the Decision Pause (`VERIFY_GAPS` items, the route back), and the Step 7 "no group left" exit.
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` (holistic mode) and `.bkit/core/prompts/bkit-build-plan-verify.md` (holistic attempts).
- `bkit-auto` gets the same behaviour, because it hands off to `/bkit-build`. No other workflow has a holistic check.

### Where and when

Local `/bkit-build` on 6.1.1, 2026-11-08.

### Evidence

- A run on 2026-11-08 passed all 9 groups, then the holistic report gave `Verdict: FAIL`, `Failures: 4`, `Fixable: true`. Three gaps were fixable doc and comment drift, and one needed an owner decision. The run went to the Failure Path at Step 10 sub-step 5.

### References

- #843 — Friction triage — https://github.com/cbartens/bkit/issues/843
- `.bkit/core/workflows/bkit-build.md` § Step 8 — Plan Verify, § Step 9 — Plan Gaps Remediate, § Step 10 — Plan Verify Holistic, § Decision Pause

Fixed in commit 68178c1f9 on `dev` (not pushed yet).

**What changed**

- Step 10 (holistic verify) no longer goes to the Failure Path on gaps. Fixable gaps go to a holistic fix round (`bkit-build-plan-gaps-remediate` in holistic mode), then the holistic check runs again — the same shape as Steps 8-9. No new plan tasks are created; the fix round works on the plan tasks the holistic report names.
- Gaps the fixer cannot close, a fix round that changes no source file, or a used-up limit go to the Decision Pause, which lists the holistic report's gaps as its questions (`From: holistic`).
- Each holistic round writes its own report (`build-plan-verify-holistic-{N}.md`) and fix log (`build-plan-gaps-remediate-holistic-{N}-log.md`).
- Step 10 always runs again after later groups, so Build Challenge's fix groups get checked too. Holistic rounds count against `build.verify.maxAttempts` only since the last holistic round that found no problems (new `--since-clean` flag on `counters route`, `grant` and `progress`), so a re-check after a fix group starts with a fresh allowance.
- The verify prompt now logs each integration gap and failing test as a gap line ending `Fixable: true|false`, so the fix round has gaps to work from.
- Resume works for a holistic pause, a "Try again" from it, and a stopped fix round.

**Checked:** typecheck clean; all 9,162 engine tests pass; `bkit check` and the capability-register check pass.

**Known limits, not changed here**

- The STANDARD → PIVOT → FINAL strategy ladder for the holistic fix round is not reset after a clean holistic round, so a later re-check starts higher up the ladder.
- The holistic progress line in the decision file shows the round count without "of max".

## #771 — Catch green test lanes whose runner failed in gates/testing audits (closed)

### Narrative

Two consumer B runs (gates, testing) found CI test lanes that went green while the test runner reported failures (consumer B `docs/audits/202610/gates.md:717-718`, `testing.md:540`, `:543`). The templates can't see this:

- `bkit-audit-gates.md:146` lists hollow step shapes as `echo`, `true` and `|| exit 0`, and never compares the runner's report with the step's conclusion.
- `bkit-audit-testing.md:125-137` has no "exit status swallowed by a wrapper" shape, and `:154` ("every test file has a lane") counts only files the runner knows about.

Line numbers are at `f2805f4c2`, in `.bkit/core/docs/templates/`.

### Success Criteria

- Gates Step 12 — Health: "For each test lane, compare the runner report's failure count with the step conclusion; `success` with failures is `CRITICAL`." Hollow shapes also include a trailing `; :` or `|| :`, `continue-on-error: true` on a test step, and a skip guard on a file that may be deleted (e.g., `if: hashFiles(...)`).
- Testing Step 7 — Shapes gains "exit status swallowed by a wrapper".
- Testing Step 9 — Runs includes test files outside the runner (e.g., `*.test.sh`).

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Lane has no machine-readable runner report | Record it as `Not Checked`, not as clean |
| `continue-on-error` on a non-test step | Not a finding under this rule |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Templates still pass shape and coverage tests | unit | `.bkit/core/engine/audits/templates/templates.test.ts` (existing) |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Report-versus-conclusion checks
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Gates Step 12 report check and hollow shapes
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-gates.md`: Step 12 — Health
  - **DONE WHEN:** `bkit install` and `bkit check` clean
  - **TEST FIRST:** n/a — template text
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Testing Step 7 shape and Step 9 scope
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-testing.md`: Step 7 — Shapes, Step 9 — Runs
  - **DONE WHEN:** `bkit install` and `bkit check` clean
  - **TEST FIRST:** n/a — template text
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### References

- **Audit reports:** docs/audits/202610/audit-improvements-20261031T034130Z.md (findings audit-improvements-5)
- Parent: #627 — Audit improvements

Fixed on branch `feat/627` in commit f4b3bc933 (not pushed yet).

- **Gates audit, Step 12:** compares what the test runner reported with the CI step's own result, so a lane that shows green while its runner actually failed now gets caught. It also lists more of the hollow shapes that cause this.
- **Testing audit, Step 7:** adds three shapes: an exit code that gets swallowed, an "absence" check that runs before the thing could have appeared, and a listener attached after the event already fired.
- **Testing audit, Step 9:** counts the test files that sit outside the runner, so tests that never run are visible.

Files: `.bkit/core/docs/templates/bkit-audit-gates.md` and `bkit-audit-testing.md`, plus their `docs/templates/` copies.

## #707 — Build: engine TS edits are refused by bkit:check:dist at the per-step commit (closed)

# Build: engine TS edits are refused by `bkit:check:dist` at the per-step commit, and no plan step rebuilds `dist/`

## Summary

A `/bkit-build` run on #700 aborted at Step 6 (Plan Execute), sub-step 4, because `bkit steps finish` exited 8 (`EXIT_COMMIT`) after group 1 edited `.bkit/core/engine/**/*.ts`.

The repo pre-commit runs `pnpm bkit:check:dist` whenever a staged non-test engine `.ts` exists (`.husky/pre-commit:18-23`). The committed `dist/` was stale, so the commit was refused. The step's own gate passed (`pass: true`, `verdict: PASS`) — only the commit failed.

This issue records the defect, the two follow-ups it exposed, and the fix.

## What happened

- **Stopped:** Step 6 (Plan Execute), sub-step 4.
- **Failed:** `bkit steps finish` for the `build-plan-execute` group 1 → exit 8 (`EXIT_COMMIT`: the step row was written, its commit was refused).
- **Not retried:** `bkit counters derive --position=next` returns `2`, because the attempt-1 `step-done` row was already written. Re-running the finish block would write a bogus attempt 2 rather than complete attempt 1.
- **Failure Path ran:** workflow-failed row in `status.jsonl`, comment on #700, `bkit:failed` label added, lock released.
- **Record commit `e9beb84ad` was not pushed:** pre-push refused on `bkit check` mirror drift, because the plan's Task 5 (`bkit install` mirror refresh) had not run. The branch `feat/700-session-start-nudge` is currently 12 ahead / 3 behind `origin`.

## Root cause

The plan for #700 had no task to rebuild `dist/`, and nothing in the workflow machinery told the planner or the executor that one was needed.

Three claims in the abort report are wrong or stale, and the real gap is narrower than reported:

1. **"kn-7 names `.bkit/src/*.ts` only" — false at the branch's tip.** `docs/knowledge.jsonl` already carries a superseding kn-7 row naming `.bkit/core/engine/**/*.ts` (ts `1791974712691`). `docs/deployments.md:503` and `.husky/pre-commit:18` are likewise engine-aware. The gotcha ledger, the docs and the hook are all correct.
2. **"the plan template and prompts never mention the engine tree" — true, but for a stronger reason.** `grep -rn 'dist/\|pnpm build\|check:dist' .bkit/core/prompts/ .bkit/core/workflows/` returns **zero hits**. `docs/templates/bkit-plan.md:334` names only "deepest declared `bkit:gate:*` script and `bkit check`", and `bkit:check:dist` is deliberately not a `bkit:gate:*` script.
3. **"the abort commit folded code into a `[skip ci]` docs commit" — true and still outstanding.** `e9beb84ad` is titled `docs(700-session-start-nudge): build aborted bkit [skip ci]` but carries the group-1 engine source, `dist/`, tests, `slop-scan.config.json`, the `.prettierignore` change and 31 plan logs.

## Findings and scope

<!-- prettier-ignore -->
| # | Finding | Scope | Evidence | Fix |
| --- | --- | --- | --- | --- |
| 1 | `steps finish` `EXIT_COMMIT` is not idempotent: the row is appended **before** the commit, so a refused commit leaves a row claiming DONE and `--position=next` then returns 2 | universal (engine) | `.bkit/core/engine/commands/workflow/steps.ts:462` (append) then `:480-486` (commit); `counters.ts:114,272` (`next = count(DONE rows) + 1`). The refusal-before-append guard at `:447-459` covers only the foreign-path case, not a commit refused by a hook | deferred — see Follow-ups |
| 2 | `docs/plans/*/logs/*/build-task-red-*.md` is missing from the ignore list, so `format:check` fails on the raw red-command output | universal | the red command ships in `.bkit/core/workflows/bkit-build.md:465` (and every mirror); `.bkit/templates/.prettierignore` lists the sibling gate logs (`run-tests-*`, `build-group-gate-*`, `build-subplan-gate-*`, `context-tests-local-*`) but not `build-task-red-*` | drafted; the abandoned `e9beb84ad` already contains the correct change |
| 3 | No plan/prompt/workflow surface mentions a `dist/` rebuild for engine edits | bkit-repo | the grep in Root cause #2; `bkit:check:dist` is source-repo only (`deployments.md:486,503,511`) and never seeded (`BKIT_GATE_SCRIPTS`, `manifest.ts:238`) | the drafted project rule below |
| 4 | The plan-execute subagent self-authorized a `.prettierignore` + `slop-scan.config.json` + `workflows.md` gate-config change | universal (governance) | friction row `build-plan-execute-self-authorized-format-gate-config-change` | fix #2 removes the trigger; the plan-execute prompt still needs to say what to do when a mandated command writes a file that breaks a gate |

Finding #1 is the generalisable engine defect: any consumer whose per-step commit is refused by their own gate (their `bkit:gate:format`, or `bkit check` drift) wedges identically. Findings #2 and #4 are also not bkit-only. Finding #3 is the only bkit-repo-specific one.

## Fix

### 3. bkit-repo surfaces — DRAFTED, not yet added

`bkit:check:dist` must not be named in `docs/templates/bkit-plan.md`: that template ships to consumers, who have no `dist/` and no such script. The correct home is the bkit-repo-only project rules — `.agents/rules.md` → `## Project Rules` → `### Universal Rules` → `#### Repo Authoring`. That section is consumer-owned and never overwritten (`bkit install`; `bkit check` drift stays clean), and the shipped payload `.bkit/core/.agents/rules.md` leaves it empty.

Draft rule, to sit with the existing `Repo Authoring` rules (after **Install to mirror**):

```markdown
- **Engine builds:** Editing `.bkit/core/engine/**/*.ts` → ALWAYS `pnpm build && git add dist/` in the same commit; the repo pre-commit runs `bkit:check:dist` whenever a staged non-test engine `.ts` exists and refuses the commit while the committed `dist/` is stale, so any build-plan task that touches the engine carries the rebuild in that task, never in a close-out step.
```

**Not added yet — awaiting owner review.**

### 2. Universal ignore fix

Add `docs/plans/*/logs/*/build-task-red-*.md` to `.prettierignore` and `.bkit/templates/.prettierignore`, and update the `.prettierignore` sentence in `.bkit/core/.bkit/workflows.md` (plus its `.bkit/workflows.md` mirror). `e9beb84ad` already carries exactly this; it needs lifting onto `dev` rather than re-authoring.

## Follow-ups

- **Finding #1 (engine):** make `steps finish` idempotent on the commit-failure path — either roll the row back when the commit is refused, or record it in a state `counters` does not count as DONE, so a retry completes attempt 1.
- **Finding #4 (governance):** state in the plan-execute prompt what to do when a mandated command writes a file a gate then rejects.
- **#700 itself:** run Task 5 so `bkit check` is drift-clean, then split the group-1 code out of the `[skip ci]` record commit and push.

## References

- Aborted run: #700, Step 6, `build-plan-execute` group 1.
- Friction rows: `build-steps-finish-commit-blocked-by-dist-staleness` (HIGH, scoped `bkit-repo`), `build-plan-execute-self-authorized-format-gate-config-change` (MEDIUM, scoped `bkit-repo` — #2/#4 suggest both should be `universal`).
- Related: #704 (KIND_WRITERS writer table), `docs/failures.jsonl` `precommit-check-dist-blocks-parallel-agents` (OPEN).
- Record commit: `e9beb84ad` on `feat/700-session-start-nudge`.

Work landed on `dev` — commit `ed91cace`. Covers finding #3.

## `.agents/rules.md`

Appended to `## Project Rules` › `### Universal Rules` › `#### Repo Authoring`, after **Verify before complete**, verbatim:

```markdown
- **Engine builds:** Editing `.bkit/core/engine/**/*.ts` → ALWAYS `pnpm build && git add dist/` in the same commit.
```

## `.bkit/instructions.md`

Required companion. The instructions store mirrors every `## Project Rules` bullet by position (`checkRules`, `.bkit/core/engine/tools/instructions-sources.ts:227`), and `syncRules` only rewrites existing entries — "a deleted or added bullet is fixed by hand". Added store entry `P18` (`### engine-builds`) at the matching position, last before `## Clauses`. Without it `instructions-sources.test.ts:144` (`expect(checkRules(STORE, MASTERS, exists)).toEqual([])`) fails.

## Verification

`pnpm vitest run .bkit/core/engine/tools/instructions-sources.test.ts .bkit/core/engine/tools/instructions.test.ts .bkit/core/engine/tools/instructions-coverage.test.ts` → **3 files, 139 tests passed**.

Not a `dist/` change: neither edited file is `.bkit/core/engine/**/*.ts`, so no rebuild applies to this commit.

Not pushed. Pre-push `bkit:check:dist` rebuilds from the whole working tree and diffs the index, so it reds on another session's uncommitted engine edits.

## Still open

- **#1** engine: `steps finish` `EXIT_COMMIT` is not idempotent — the row is appended before the commit (`steps.ts:462`, `:480-486`), so a refused commit leaves a DONE row and `counters --position=next` returns 2.
- **#2** universal: `docs/plans/*/logs/*/build-task-red-*.md` missing from `.prettierignore` and `.bkit/templates/.prettierignore`. `e9beb84ad` already holds the correct change and needs lifting onto `dev`.
- **#4** governance: plan-execute prompt says nothing about a mandated command writing a file a gate then rejects.
- **#700**: Task 5 (`bkit install` mirrors) still unrun, so `bkit check` drift stands and `e9beb84ad` still carries code under `[skip ci]`.

## Fixes landed on `dev`

`ed91caceb` (the rule, finding #3) and `ee0687d3d` (findings #1, #2, #4) — 46 files, +116/−80.

### #1 — a refused step commit no longer leaves a row

`writeStepRow` (`.bkit/core/engine/commands/workflow/steps.ts:462`) now records `status.jsonl`'s size before appending and rolls the row back on every post-append failure: the own-path refusal, the own-path commit failure, and the plain commit failure. It skips the truncate when the file no longer ends with its own line, so a concurrent append is never clobbered.

Exit 8 therefore means **nothing written, nothing committed**, so `counters --position=next` returns the same attempt and re-running the block after fixing the cause lands attempt 1 once instead of opening attempt 2.

- One helper, four callers: `steps done` / `steps finish`, `runs`, `workflows`, `context --record`.
- Also closes a latent inconsistency: the own-path refusal returned `EXIT_FOREIGN_PATH` ("nothing written, nothing committed") *after* appending a row.
- Exit-8 help text corrected in `steps.ts` (both sites) and `context.ts`.
- Route added to the **Finish** clause master (`.bkit/instructions.md` § Clauses, `workflow-finish`): *"Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged."* `pnpm instructions:sync` propagated it to all five workflows, their `.claude` / `.cursor` / `.opencode` / `.agents` mirrors, and the five `render/__snapshots__/bkit-*.none.txt` baselines. Catalogue rows updated in `.bkit/core/.bkit/workflows.md` (the Finish row and the verdict-validation note).
- Tests: `steps.test.ts` "reports a failed commit with exit 8 without writing the row" now asserts the row is absent; the shared-branch hook-refusal test asserts the same.

### #2 — `build-task-red-*.md` ignored

`.prettierignore`, `.bkit/templates/.prettierignore`, and the `.prettierignore` sentence in `.bkit/core/.bkit/workflows.md` (+ its mirror). Lifted byte-for-byte from `e9beb84ad` and applied cleanly.

### #4 — no change needed

`.bkit/core/prompts/bkit-build-plan-execute.md:71` (`Fix code not gates`) already ends *"Confirmation unavailable inside `/bkit-*` workflows: Record the block per your own blocker contract, and continue; NEVER self-authorize the opt-out."* The subagent violated an existing rule. This issue's own remediation for #4 was to ship the ignore pattern — that is #2.

## Verification

<!-- prettier-ignore -->
| Check | Result |
| --- | --- |
| `pnpm vitest run` | 198 files, 7848 passed, 1 skipped |
| `pnpm bkit:gate:static` | green — typecheck, lint, format:check, format:tables:check, lint:prose, slop:delta |
| `pnpm bkit check` | exit 0, drift-clean |
| pre-commit `bkit:check:dist` | passed on `ee0687d3d` |

The last row is the new rule in `ed91caceb` being exercised: the commit staged the rebuilt `dist/` in the same change.

## State

- `dev` is 3 ahead of `origin/dev`; nothing pushed.
- #700 remediation still open: Task 5 mirrors unrun, `e9beb84ad` still carries group-1 code under `[skip ci]`, branch 12 ahead / 3 behind origin.

## Review of the landed work (28 Oct 2026)

Code review of #707's fixes, checked against `dev` at `8e73232bf` together with #700 and #705.

**Where the fixes ended up:** the commit hashes in the comments above (`ed91caceb`, `ee0687d3d`, `bf144fffb`) are no longer on any branch.
- The rule and the rollback reached `dev` inside #700's squash commit `2790b4181` (PR #708).
- The `build-diff-*` failure row is in `3305fbed4`.
- The `build-diff-*` prettier-ignore line itself arrived later, in `b34498193` (#711).

### Findings (none fixed yet)

The basic case works. When a hook refuses the commit, bkit takes the step record back off disk and out of git's staging area, then exits 8. All the problems below are in edge cases.

The reviewer reproduced each one in a throwaway repo whose pre-commit hook refuses the commit, and I re-checked each against the code. All are in `writeStepRow` (`.bkit/core/engine/commands/workflow/steps.ts:482-523`).

1. **MEDIUM: the record stays staged if `status.jsonl` was already staged.**
   - On a failed commit, bkit unstages only the files that weren't staged before (`unstageStaged`). But by then it has already re-staged `status.jsonl` with the new record in it.
   - Result: exit 8, the file on disk is back to its old records, but git's staging area still holds the new one. The next commit that doesn't name specific files records a step that isn't on disk.
   - The same thing throws away any partial staging the user had in other files.
   - Fix: save the staging area with `git write-tree` before staging, and restore it with `git read-tree` on failure.
2. **MEDIUM: it reports "no row written" when the record is still there.**
   - If another writer adds to the file during the commit, the rollback correctly leaves the file alone.
   - But `:521` still logs `no row written to …` and exits 8, which promises nothing was written.
   - A re-run after fixing the cause then writes a second `step-done` record for the same step. That's the double-attempt problem this issue set out to fix.
3. **MEDIUM: the rollback can delete other writers' records.**
   - If `status.jsonl` didn't exist before, the rollback deletes the whole file (`rmSync`) without checking that only our record is in it. Reproduced: a hook adds `{"type":"other-writer"}` and then refuses the commit, and that row is gone.
   - If the file did exist, it's cut back to the size it had just before our write (`:483`). That also cuts anything another writer added in the short gap before our write.
4. **LOW: the rollback can crash before it reports the failure.**
   - If `status.jsonl` disappears during the commit, the rollback's `readFileSync` throws: `[bkit-install] Unhandled error: ENOENT`.
   - The run exits 1 instead of 8, the hook's own error message is never shown, and the staging area is left as it was.
5. **LOW: the unstage can unstage the caller's own files.**
   - `git reset -- <paths>` treats each path as a pattern. So a staged `src/[id].tsx` also matches `src/i.tsx`.
   - After exit 8, the caller's `src/i.tsx` is no longer staged.
6. **LOW: the failure ledger is out of date.** `docs/failures.jsonl:194` and `:199` still list `build-diff-artifact-missing-from-prettier-ignore` as OPEN, but both `.prettierignore` files have the `build-diff-*` line at `:50`.

### Who is affected
- `runs.ts`, `workflows.ts` and `tests.ts` call `writeStepRow` with `commit: "none"`, so the rollback never runs for them.
- `steps done`, `steps finish` and `context --record` return the new exit 8 correctly.
- No doc still gives the old meaning of exit 8 ("the record was written but the commit failed").

**Not part of this review:** your open question in the last comment, whether the root `.prettierignore` should be managed by install, or whether `bkit upgrade` / `bkit check` should flag bkit-owned lines missing from it. That's a design decision for you.

The summary for this whole review round is on #551.

---
_Generated by [Claude Code](https://claude.ai/code)_

### Review fix: done

The one #707 finding is fixed in `74ce6a48d`, on the local branch `review-fixes-deepseek`, which is **not yet pushed**.

**The stale failure row is closed.** `docs/failures.jsonl` held two OPEN rows for `build-diff-artifact-missing-from-prettier-ignore`, but `.prettierignore` already carries the line, added in `b34498193`. A CLOSED row now records that.

**Checks:** the full gate on the branch is green, including `ledger-integrity`.

---
_Generated by [Claude Code](https://claude.ai/code)_

## #706 — Build: engine TS edits are refused by bkit:check:dist at the per-step commit (closed)

# Build: engine TS edits are refused by `bkit:check:dist` at the per-step commit, and no plan step rebuilds `dist/`

## Summary

A `/bkit-build` run on #700 aborted at Step 6 (Plan Execute), sub-step 4, because `bkit steps finish` exited 8 (`EXIT_COMMIT`) after group 1 edited `.bkit/core/engine/**/*.ts`.

The repo pre-commit runs `pnpm bkit:check:dist` whenever a staged non-test engine `.ts` exists (`.husky/pre-commit:18-23`). The committed `dist/` was stale, so the commit was refused. The step's own gate passed (`pass: true`, `verdict: PASS`) — only the commit failed.

This issue records the defect, the two follow-ups it exposed, and the fix.

## What happened

- **Stopped:** Step 6 (Plan Execute), sub-step 4.
- **Failed:** `bkit steps finish` for the `build-plan-execute` group 1 → exit 8 (`EXIT_COMMIT`: the step row was written, its commit was refused).
- **Not retried:** `bkit counters derive --position=next` returns `2`, because the attempt-1 `step-done` row was already written. Re-running the finish block would write a bogus attempt 2 rather than complete attempt 1.
- **Failure Path ran:** workflow-failed row in `status.jsonl`, comment on #700, `bkit:failed` label added, lock released.
- **Record commit `e9beb84ad` was not pushed:** pre-push refused on `bkit check` mirror drift, because the plan's Task 5 (`bkit install` mirror refresh) had not run. The branch `feat/700-session-start-nudge` is currently 12 ahead / 3 behind `origin`.

## Root cause

The plan for #700 had no task to rebuild `dist/`, and nothing in the workflow machinery told the planner or the executor that one was needed.

Three claims in the abort report are wrong or stale, and the real gap is narrower than reported:

1. **"kn-7 names `.bkit/src/*.ts` only" — false at the branch's tip.** `docs/knowledge.jsonl` already carries a superseding kn-7 row naming `.bkit/core/engine/**/*.ts` (ts `1791974712691`). `docs/deployments.md:503` and `.husky/pre-commit:18` are likewise engine-aware. The gotcha ledger, the docs and the hook are all correct.
2. **"the plan template and prompts never mention the engine tree" — true, but for a stronger reason.** `grep -rn 'dist/\|pnpm build\|check:dist' .bkit/core/prompts/ .bkit/core/workflows/` returns **zero hits**. `docs/templates/bkit-plan.md:334` names only "deepest declared `bkit:gate:*` script and `bkit check`", and `bkit:check:dist` is deliberately not a `bkit:gate:*` script.
3. **"the abort commit folded code into a `[skip ci]` docs commit" — true and still outstanding.** `e9beb84ad` is titled `docs(700-session-start-nudge): build aborted bkit [skip ci]` but carries the group-1 engine source, `dist/`, tests, `slop-scan.config.json`, the `.prettierignore` change and 31 plan logs.

## Findings and scope

<!-- prettier-ignore -->
| # | Finding | Scope | Evidence | Fix |
| --- | --- | --- | --- | --- |
| 1 | `steps finish` `EXIT_COMMIT` is not idempotent: the row is appended **before** the commit, so a refused commit leaves a row claiming DONE and `--position=next` then returns 2 | universal (engine) | `.bkit/core/engine/commands/workflow/steps.ts:462` (append) then `:480-486` (commit); `counters.ts:114,272` (`next = count(DONE rows) + 1`). The refusal-before-append guard at `:447-459` covers only the foreign-path case, not a commit refused by a hook | deferred — see Follow-ups |
| 2 | `docs/plans/*/logs/*/build-task-red-*.md` is missing from the ignore list, so `format:check` fails on the raw red-command output | universal | the red command ships in `.bkit/core/workflows/bkit-build.md:465` (and every mirror); `.bkit/templates/.prettierignore` lists the sibling gate logs (`run-tests-*`, `build-group-gate-*`, `build-subplan-gate-*`, `context-tests-local-*`) but not `build-task-red-*` | drafted; the abandoned `e9beb84ad` already contains the correct change |
| 3 | No plan/prompt/workflow surface mentions a `dist/` rebuild for engine edits | bkit-repo | the grep in Root cause #2; `bkit:check:dist` is source-repo only (`deployments.md:486,503,511`) and never seeded (`BKIT_GATE_SCRIPTS`, `manifest.ts:238`) | the drafted project rule below |
| 4 | The plan-execute subagent self-authorized a `.prettierignore` + `slop-scan.config.json` + `workflows.md` gate-config change | universal (governance) | friction row `build-plan-execute-self-authorized-format-gate-config-change` | fix #2 removes the trigger; the plan-execute prompt still needs to say what to do when a mandated command writes a file that breaks a gate |

Finding #1 is the generalisable engine defect: any consumer whose per-step commit is refused by their own gate (their `bkit:gate:format`, or `bkit check` drift) wedges identically. Findings #2 and #4 are also not bkit-only. Finding #3 is the only bkit-repo-specific one.

## Fix

### 3. bkit-repo surfaces — DRAFTED, not yet added

`bkit:check:dist` must not be named in `docs/templates/bkit-plan.md`: that template ships to consumers, who have no `dist/` and no such script. The correct home is the bkit-repo-only project rules — `.agents/rules.md` → `## Project Rules` → `### Universal Rules` → `#### Repo Authoring`. That section is consumer-owned and never overwritten (`bkit install`; `bkit check` drift stays clean), and the shipped payload `.bkit/core/.agents/rules.md` leaves it empty.

Draft rule, to sit with the existing `Repo Authoring` rules (after **Install to mirror**):

```markdown
- **Engine builds:** Editing `.bkit/core/engine/**/*.ts` → ALWAYS `pnpm build && git add dist/` in the same commit; the repo pre-commit runs `bkit:check:dist` whenever a staged non-test engine `.ts` exists and refuses the commit while the committed `dist/` is stale, so any build-plan task that touches the engine carries the rebuild in that task, never in a close-out step.
```

**Not added yet — awaiting owner review.**

### 2. Universal ignore fix

Add `docs/plans/*/logs/*/build-task-red-*.md` to `.prettierignore` and `.bkit/templates/.prettierignore`, and update the `.prettierignore` sentence in `.bkit/core/.bkit/workflows.md` (plus its `.bkit/workflows.md` mirror). `e9beb84ad` already carries exactly this; it needs lifting onto `dev` rather than re-authoring.

## Follow-ups

- **Finding #1 (engine):** make `steps finish` idempotent on the commit-failure path — either roll the row back when the commit is refused, or record it in a state `counters` does not count as DONE, so a retry completes attempt 1.
- **Finding #4 (governance):** state in the plan-execute prompt what to do when a mandated command writes a file a gate then rejects.
- **#700 itself:** run Task 5 so `bkit check` is drift-clean, then split the group-1 code out of the `[skip ci]` record commit and push.

## References

- Aborted run: #700, Step 6, `build-plan-execute` group 1.
- Friction rows: `build-steps-finish-commit-blocked-by-dist-staleness` (HIGH, scoped `bkit-repo`), `build-plan-execute-self-authorized-format-gate-config-change` (MEDIUM, scoped `bkit-repo` — #2/#4 suggest both should be `universal`).
- Related: #704 (KIND_WRITERS writer table), `docs/failures.jsonl` `precommit-check-dist-blocks-parallel-agents` (OPEN).
- Record commit: `e9beb84ad` on `feat/700-session-start-nudge`.

Duplicate of #707: same title, word-for-word identical body, opened 5 seconds apart. All work and discussion is on #707, so closing this one.

---
_Generated by [Claude Code](https://claude.ai/code)_

## #593 — Test that the local static gate and the shipped CI static job match (closed)

From the October 2026 duplication audit (#473), finding `duplication-3` (HIGH). Report: `docs/audits/202610/duplication.md`, audited at `5f5a097c`.

## The problem

Two checks that are meant to match don't.

**`bkit:gate:static`** (`.bkit/core/engine/install/manifest.ts:226-230`) is the local check run before a push. Its comment says it "Mirrors the bkit-tests-static CI job". It runs:
- typecheck
- `lint`
- format check
- prose lint
- slop delta

**`bkit-tests-static`** in the shipped CI template (`.bkit/templates/.github/workflows/bkit-ci.yml:35`) runs:
- typecheck
- format check
- prose lint
- `lint:slop`
- slop delta
- actionlint
- `bkit check`
- a dependency audit

The CI job has **no `pnpm lint` step**. `rg -n 'pnpm lint\b'` only finds `lint:prose` and `lint:slop`. The comment at `bkit-ci.yml:65` refers to "lint … steps below" that don't exist.

So a consumer with an ESLint config only gets linted by the local check before a push. A push that skips hooks lands on `dev` without lint, and nothing in CI notices. Examples: a cloud agent, or `--no-verify`.

Nothing ties the two lists together except that comment. `templates-content.test.ts:579` checks the gate scripts against the script list in `templates.md`, not against CI.

## Decision needed

- **A.** Add a `pnpm lint` step to the template's static job.
- **B.** Keep lint local-only, and say so in the gate's comment.

## What to change (either way)

- Add a test asserting that each part of `bkit:gate:static` either has a matching CI step or is on a named list of local-only steps.
- Fix the `bkit-ci.yml:65` comment.
- If A: `bkit-ci.yml` is a template consumers own, so check whether consumers need a migration note (`docs/migrations.md`).

## Done when

- [ ] The gate and the CI job agree, or the difference is named in both places.
- [ ] A test fails if either side gains or drops a step without the other.

**Size:** S. **Next step:** `/bkit-design` (choose A or B first).

Parent: #473

## Plan

### Decision: add lint to CI (option A)

- **The template already expects a lint step.** The comment at `.bkit/templates/.github/workflows/bkit-ci.yml:65` tells non-Node users to replace "the typecheck / lint / test steps below". There just isn't one.
- **The local gate already runs `pnpm lint` unconditionally.** Any consumer whose push passes the local check therefore has a `lint` script. Adding the step can't break CI for a repo that already passes locally.
- **Keeping lint local-only (option B) leaves the gap open.** Any push that skips hooks lands unlinted: cloud agents, `--no-verify`, edits in the GitHub web UI.

No earlier decision about this is recorded in `docs/decisions.jsonl`.

### Steps

1. **Template.** In `.bkit/templates/.github/workflows/bkit-ci.yml`, add a `Run Lint` step (`run: pnpm lint`) to `bkit-tests-static`, straight after `Run Typecheck`, with the same `if:` / `env:` shape. Update the lane's header comment (`:33`) and the "Keep this group (typecheck → prettier → vale → slop → bkit check)" comment so they list lint.
2. **bkit's own copy.** Make the same edit in `.github/workflows/bkit-ci.yml`. It's bkit's adopted copy of the template, and the differences allowed between the two are pinned in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts:76`.
3. **The tie test.** Add a test, next to the existing gate-script checks in `.bkit/core/engine/audits/templates/`, that:
   - splits `BKIT_GATE_SCRIPTS["bkit:gate:static"]` (`.bkit/core/engine/install/manifest.ts:230`) into its `pnpm <script>` parts;
   - asserts each one has a `run: pnpm <script>` step inside the template's `bkit-tests-static` job (`slop:delta` may carry an argument);
   - allows exceptions only through a named list in the test, with a reason per entry (empty today).
   Adding a part to the gate without adding it to CI then fails the test, and so does removing one from CI.
4. **Comment in `manifest.ts`.** Point the "Mirrors the bkit-tests-static CI job" comment at `manifest.ts:226` to the new test, so the claim is enforced rather than just stated.
5. **Docs.** Check `docs/deployments.md` and `.bkit/templates.md` for a list of what the static job runs, and add lint where one exists. Add one row to `docs/decisions.jsonl`: the local static gate and the CI static job run the same steps, enforced by the new test.

### Existing consumers

`bkit-ci.yml` is copy-and-own: a consumer's adopted copy isn't rewritten by `bkit upgrade`, so existing consumers won't get the new step automatically. This change doesn't include a migration. If you want one (for example, a `bkit check` advisory when an adopted `bkit-ci.yml` static job has no lint step), it can be a follow-up.

### Done when

- [ ] The template and bkit's own CI both run `pnpm lint` in the static job.
- [ ] The new test fails if `bkit:gate:static` and the CI static job get out of step.
- [ ] Full suite passes (`pnpm vitest run`), `pnpm bkit:gate:static` passes, actionlint is clean, and `bkit check` is clean.
- [ ] Ledger row `audit-duplication-static-gate-vs-ci-static-lane-lint` in `docs/failures.jsonl` is closed.

Work is going to a Sonnet subagent, committing straight to `dev`.

## Done

The CI static job now runs `pnpm lint`, and a test fails if the local static gate and that job get out of step.

- **CI (`aa2b23b6`):**
  - `bkit-tests-static` has a "Run Lint" step (`pnpm lint`) straight after typecheck.
  - It's in both the template `.bkit/templates/.github/workflows/bkit-ci.yml` and bkit's own `.github/workflows/bkit-ci.yml`.
  - The dogfood test's allowed-difference count goes from 2 to 3.
- **Tie test:** in `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`.
  - It splits `bkit:gate:static` into its `pnpm` scripts and fails when the template's static job has no step for one of them.
  - Exceptions go in `GATE_PARTS_ABSENT_FROM_CI`, with a reason each. The list is empty.
  - Checked both ways: the test fails before the CI edit, and fails again when a step is removed.
- **Comment (`64ba94ba`):** the comment in `manifest.ts` now names that test instead of just saying the gate "mirrors" CI.
- **Docs:**
  - The static-lane lists in `docs/testing.md`, `docs/deployments.md`, `.bkit/templates.md` and `.bkit/comparison.md` now include lint.
  - The pre-push checklist gained a Lint row, so the gates after it are renumbered. `500c4dcd` fixes one leftover "Gate 5" reference.
- **Checks:** 70 of 70 tests pass across the two affected test files, and actionlint is clean.
- **Ledger and decision:** `audit-duplication-static-gate-vs-ci-static-lane-lint` is closed. Decision `593-static-gate-and-ci-static-job-run-the-same-steps` is recorded in `500c4dcd`.
- **Existing consumers:** an adopted `bkit-ci.yml` is copy-and-own, so existing consumers keep their copy unchanged. No migration ships with this.

Not pushed yet.

## #780 — Add weakened-gate history search and per-run counts to gates audit (closed)

### Narrative

Consumer B's gates run (consumer B `docs/audits/202610/gates.md:719`, `:721`) found two gaps in `.bkit/core/docs/templates/bkit-audit-gates.md` (lines at `f2805f4c2`):

- Step 11 — Re-Review (`:145`) reads only decisions and prior reports, so a gate step that was quietly removed or weakened in git history, with no decision row, goes unseen (`-37`).
- Step 9 — Sequence (`:130-132`) sets a false-positive-rate bar for report-only gates, but nothing makes those gates print a count per run, so `Health` cannot compute the rate (`-38`).

### Success Criteria

- Step 11: "Also search history for removed or weakened gate steps (e.g., `git log -S`); one with no decision row is a finding."
- Step 9: "Each report-only gate prints its finding count per run, so `Health` can compute the rate."

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Shallow clone | State the boundary commit and that older history is unread (`.agents/rules.md` § Shallow history) |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Template still passes shape and coverage tests | unit | `.bkit/core/engine/audits/templates/templates.test.ts` (existing) |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Gates template
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Apply the two changes
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-gates.md`: Step 9 — Sequence, Step 11 — Re-Review
  - **DONE WHEN:** `bkit install` and `bkit check` clean
  - **TEST FIRST:** n/a — template text
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### References

- **Audit reports:** docs/audits/202610/audit-improvements-20261031T034130Z.md (findings audit-improvements-37, audit-improvements-38)
- Parent: #627 — Audit improvements

Fixed on branch `feat/627` in commits f4b3bc933 and fd1298c1d (not pushed yet).

In `.bkit/core/docs/templates/bkit-audit-gates.md`:

- **Step 11:** searches git history (e.g., `git log -S` on the gate script or workflow step) for gate steps that were removed or weakened. One that has no `docs/decisions.jsonl` row behind it is a finding.
- **Step 9:** asks each report-only gate for a per-run count, so you can tell whether anyone would notice it getting worse.

fd1298c1d split one sentence in Step 11 so it gives one instruction at a time.

## #744 — Build agents re-run the whole unit suite after every change (closed)

### Problem

The build's agents check their work by running a whole local gate. After each change they make, `@bkit-build-plan-gaps-remediate` and `@bkit-build-plan-verify` run `pnpm bkit:gate:static-unit`, which is every static check plus the whole unit suite. `@bkit-build-plan-execute` runs `bkit:gate:static`. `@bkit-debug-failure-remediate` does the same as gaps-remediate (`.bkit/workflows.md` § Local gate scripts). A fix that touches one file and its one test still pays for the whole suite, and pays again on every fix round. The orchestrator then re-runs the gate itself at the group gate (Step 8) and at Step 12, so an agent's whole-suite run duplicates a check that follows anyway.

bkit has no gate for "only what this change affects". The `bkit:gate:*` names are the contract consumers declare, and each one runs a fixed scope.

### Outcome

The build and debug agents check a change by running only the checks and tests the change affects. The full scope runs only where the orchestrator gates: the group gate, Step 12, debug Step 3, pre-push and CI.

### Success criteria

- An agent's own check after a change runs the tests that import the changed code, plus tests that name a changed file's path, and static checks on the changed files.
- Its run time scales with the change, not with the suite.
- Leaving the new gate undeclared keeps today's behaviour, so the change is opt-in.
- No orchestrator gate gets weaker: the group gate, Step 12 and pre-push keep their current scope.

### Constraints and non-goals

- Stack-agnostic: bkit cannot write one default for "which tests does this change affect" (vitest has `--changed`, other runners differ). Like `bkit:test:file`, it is a consumer-declared script name with an I/O contract, and bkit seeds no implementation.
- Tests that read files as text (workflow markdown, config) have to be found too. An import graph alone misses them.
- Another session's uncommitted edits in the same checkout widen the selection. That costs extra tests but never gives a wrong answer.

### Decisions already made

- The build group gate runs `bkit:gate:static-unit` only, and integration runs once at Step 12: #743 — Build group gate re-runs integration tests after every group — https://github.com/cbartens/bkit/issues/743
- `bkit:test:file` runs one runner per call and picks it by file type in bkit's own repo (`scripts/ci/bkit-test-file.mjs`): #723 — Build asks the owner needless questions and repeats fix rounds — https://github.com/cbartens/bkit/issues/723

### Open questions

- Name and contract: a new gate name (for example `bkit:gate:changed`) that takes the changed files as arguments, or one that works them out itself from `git`?
- Which agents switch to it: execute, gaps-remediate, verify and debug-remediate, or only the fix-round agents?
- What counts as changed: the agent's own commits since the step started, or everything uncommitted?
- Whether `bkit install` / `bkit check` should advise on it the way `test-file-script-missing` advises on `bkit:test:file`.

### References

- `.bkit/workflows.md` § Local gate scripts (which agent runs which gate)
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` step 8, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-build-plan-execute.md`
- `package.json` `bkit:test:file`, `bkit:lint:file`; `scripts/ci/bkit-test-file.mjs`
- `.agents/rules.md` § Project Rules `Verify before complete` (the repo's own commit-time check)

Fixed in 52bab3514 (`fix(99): build and plan friction from the 699 and 715 runs`). It is merged to local `dev` and not pushed yet.

**What changed**
- New verb `bkit tests changed` (`.bkit/core/engine/commands/workflow/tests-changed.ts`). It works out which files the current step changed and hands that list to the project's `bkit:gate:changed` script, as decided. Build agents now run the tests for what they touched instead of the whole unit suite after every change.
- This repo's own `bkit:gate:changed` script is `scripts/gate/bkit-gate-changed.mjs`, registered in `package.json`. Each consumer supplies its own script, so bkit stays stack-independent.
- Install now warns with `gate-changed-script-missing` when a project has no `bkit:gate:changed` script. The script name lives in `manifest.ts` as `BKIT_GATE_CHANGED_SCRIPT`.
- The build and remediate prompts (`bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-remediate`) tell agents to use it.

**How it was checked**
- Static gate passed. Unit and integration tests (vitest): 8389 passed, 2 skipped. bats: 0 failures. The new `tests-changed.test.ts` and the install advisory test are among them.
- Tried it in a scratch repo: `tests changed` passed the right file list.

**Not done**
- Two of the guard tests were written after the code, not before it.
- Consumers have no `bkit:gate:changed` script until they add one. The install advisory says so, but no migration writes one for them.
