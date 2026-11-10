Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **(plan edit) `Acceptance Scenario` › `Narrative` and `Success Criteria` are missing.** Both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds` (plan lines 41, 45). The plan is right to leave the marker instead of inventing text: there is no design doc, the issue is not in the change shape, and there is no audit report. Even so, the feature's testable contract has no measurable outcomes, and nothing in the `Derived Test Matrix` or the runbook can be traced to a criterion. Fix: once the owner answers Open Question Q1, apply the answer to the plan. Under Q1's recommended option A, the Success Criteria are the issue's three `Expected` bullets as the owner's 2026-11-10T06:56:35Z comment decided them (point 1: a cross-group change is flagged in the step that made it; point 2: a red row whose test the plan no longer names is not checked; point 3: a named `BLOCKED` line lets the step through, the change reaches the owner at the build Decision Pause, a headless run records an assumed accept that ship asks about, and an unnamed change is still refused), and the Narrative comes from the comment's `Why` paragraph. The plan cannot go to build while either section holds the marker.

2. **(plan edit) Group 1 has no task that rebuilds `dist/`, and the plan does not handle the moment `--plan` becomes required while this same build is running.** Tasks 1-3 edit `.bkit/core/engine/commands/workflow/tests.ts` and `steps.ts`, but only Task 6 (Group 2) runs `pnpm build`. `.agents/rules.md` § Engine builds requires `pnpm build && git add dist/` in the same commit as the engine edit, so Group 1's commit would ship engine sources with a stale `dist/`. The `bkit` command in this repo is `dist/cli.js` (`package.json` `bin`, plus the `"bkit": "link:."` dev dependency), so the build of this plan runs on the engine it is changing:
   - Rebuild `dist/` in Group 1, and Task 1's own `build-plan-tasks` finish, every later group's finish and the holistic finish all exit 2. The orchestrator's copy of `bkit-build.md` gains `--plan` only in Task 4, and the mirror is re-rendered only in Task 6.
   - Leave `dist/` alone until Task 6, and Group 1 breaks § Engine builds. Group 2's finish then also runs a new `dist/` against a workflow copy the orchestrator read before the change.

   Fix: add the `dist/` rebuild to Group 1's scope and give the transition its own build step. For example, move the `--plan="docs/plans/{YYYYMM}/{FID}-plan.md"` additions to `bkit-build.md` ahead of the engine requirement (the `--plan` flag already exists at `steps.ts:1713`, so passing it today is harmless), or state how the running build passes `--plan` from Group 1 on. Then name the check that proves the build's own code-step finishes still exit 0.

## OPTIONAL

1. **Edge cases with a stated behaviour but no `Derived Test Matrix` row and no `TEST FIRST` test:**
   - A step re-changes a recorded test *and* names it on a new `BLOCKED` line, so the newer lines are recorded. Only the refusal half is tested (`refuses a later code step that changes a BLOCKED change again`).
   - The tests step records a new red after a code step recorded a change, and the newer red becomes the baseline.
   - A `BLOCKED` line names a planned test the step did not change, and nothing is recorded.
   - A `BLOCKED` line names the test by the last ` > ` segment of its name. Task 2 says it matches, but no test proves it.
   - A gaps-remediate step is let through by a `Gap {N}` line at the `steps finish` level. Only the `blockedTests` parser covers the `Gap` form.
   - A red row's test is still in the plan but under a different task number, and is skipped.
   - `tests green` on a plan with no recorded change prints `changed: []` and writes no `Changed by a code step` section. Task 3's `DONE WHEN` states this, but no named test covers it.

   Each is a cheap unit test in `steps.test.ts` or `tests.test.ts` within the per-task caps: Task 2 has 8 tests over 2 files, and Task 3 has 3.
2. **The Static row of the `Derived Test Matrix` names a command (`pnpm bkit:gate:static`) as its `Target file`.** Name the files it guards, or point the row at the drift check (`node dist/cli.js check`) that Task 6's `DONE WHEN` already runs.
3. **The new tests extend a suite with an open pre-push timeout.** The `docs/failures.jsonl` row for `steps.test.ts … passes the execute step when every planned test file matches the row, and checks nothing without a row` is an open timeout in the same suite Tasks 1 and 2 extend. The plan's Suggested Scope Expansion notices this but gives the tasks no instruction. A one-line note in Tasks 1 and 2 (reuse the suite's fixtures, and no extra temp repos for each case) would lower the risk of a load-induced red at the group gate.
4. **The #891 prerequisite is an assumption with no check.** Pre-Flight lists `docs/plans/202611/891-build-gate-stuck-plan.md` as merged first, but no gate item or build-start step confirms that `feat/891-build-gate-stuck` has landed on `dev`. Add a Gate 1 checkbox for it.

## OUT OF SCOPE

1. #903 (the owner's `Fix now` answer is lost after the Decision Pause) edits the same `bkit-build.md` § Decision Pause. Keep it separate and build it after this plan, as the plan's Suggested Scope Expansion already says.
2. A `bkit tests restore --test --name` command, so a re-asked code agent can restore a planned test by command instead of by hand. This needs a design decision; file it as an idea issue if wanted.
