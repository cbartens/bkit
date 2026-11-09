Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 5 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v1-draft.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/related-deferrals.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-failures.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-issues.md` |
| plan-review | CONCERNS | 13 | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-review-1.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-review-2.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/891-build-gate-stuck/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v1-draft.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/related-deferrals.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-failures.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-review-1.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-review-2.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

When a gate fails only on tests that also fail on the base branch, the build says so plainly and lets the owner accept them once.

### Success Criteria

1. the group gates and the Step 12 run treat those exact tests as known, and stop only on new failures;
2. every other failing test still fails the gate;
3. `/bkit-ship` still shows the accepted tests to the owner before merge.
4. The pause also stops offering `Try again` when the only failures are accepted base-branch failures, because no round can change them.

### Process Sketch

- **WHEN** a group gate fails and its JUnit reports name the failing cases **→ THEN** the Decision Pause lists those cases as one `Accept` / `Fix now` / `Stop` question and says an accept covers only these named tests.
- **WHEN** the owner answers `Accept` **→ THEN** bkit records the exact cases (`classname` + `name`) for the feature, and the gate's step runs again (Step 8 for a group gate, Step 12 for the final run).
- **WHEN** a later gate runs (Step 8, Step 9's remediate gate, Step 12, debug Step 3, an agent's `bkit tests changed`, the pre-push gate of a workflow's `branches push`) **→ THEN** the gate receives the accepted cases in `$BKIT_ACCEPTED_TESTS`, skips them, and passes when nothing else fails; groups 2+ start, and the build's pushes go through.
- **IF** a new test fails, or a failure has no test name (lint, typecheck) **→ THEN** the gate still fails and routes as today.
- **IF** the gate fails and every failing case is already accepted (the runner ignores `$BKIT_ACCEPTED_TESTS`) **→ THEN** the pause offers no `Try again` and says the gate does not skip accepted tests.
- **WHEN** `/bkit-ship` runs for the feature **→ THEN** it lists the accepted cases to the owner before the merge gate.

### Concrete Example

**Setup:** The owner of a consumer repo starts `/bkit-build` on an issue with 6 task groups. `dev` has 3 failing unit tests in `scripts/registry.test.mjs` and `scripts/ceiling.test.mjs`. The consumer's `bkit:gate:static-unit` runner honours `$BKIT_ACCEPTED_TESTS` (`docs/testing.md` § Accepted failures).

**Steps:**

1. Group 1 is built and verified → `tests run` for `build-group-gate-1` exits 1; its test-run row records the 3 failing cases with their `classname` and `name`.
2. Step 9 runs one remediate round → the gate fails on the same 3 cases, and the verify limit is used up → the Decision Pause asks: "3 tests failed in the group gate … Accept them as already failing on the base branch?" with `Options: A) Accept / B) Fix now / C) Stop` and `No recommendation — only you can say these tests already fail on dev`.
3. The owner answers `A` with a reason → bkit runs `tests accept`, which writes an `accepted-failures` row naming the 3 cases, and appends one `docs/decisions.jsonl` row → Step 8 runs again.
4. `tests run --accepted-from` hands the gate the 3 cases; the runner skips them, and the gate exits 0 → `GATE_VERDICT` = PASS → Step 7 briefs group 2.
5. Groups 2-6 build; Step 12 passes with the same 3 cases skipped. Steps 15 and 16 run `branches push --accepted-from`, so the consumer's pre-push gate skips the same 3 cases and the push goes through. `/bkit-ship` prints "Built with 3 test(s) accepted as already failing on the base branch" and names each before the merge gate.

**Outcome:** All 6 groups are built, and the 3 accepted cases are named in the build's decision file, in `status.jsonl` and in the ship session before merge.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A failure with no test name: lint, type checks and other steps that write no JUnit report (issue comment, decision 2) | No `Accept` item: the pause says the failure has no test names, so an accept cannot cover it, and the gate still fails |
| A new test fails beside the accepted ones | The gate fails; the pause lists only the not-yet-accepted cases |
| The gate's runner ignores `$BKIT_ACCEPTED_TESTS`, so accepted cases still fail | `tests run` reports `onlyAccepted: true`; Step 8 goes straight to the Decision Pause with no remediate round; the pause writes one hard-blocker item ("the gate does not skip accepted tests") with `Fix now` / `Stop` and no loop question, so no `Try again`. The item also says a failure with no test names (lint, typecheck) may sit beside the accepted ones, since `onlyAccepted` counts JUnit cases only. Success Criterion 1 is not met for this runner until the consumer wires it as `docs/testing.md` § Accepted failures says |
| More than 100 failing cases in one run | The row records the first 100 and `failedCasesTruncated: true`; `tests accept` refuses, so the owner fixes the base branch or answers `Fix now` |
| A test file is renamed or a case is renamed after the accept | The renamed case no longer matches the accepted `classname` + `name`, so it fails the gate and the pause asks again |
| An accepted test starts passing (the base branch was fixed and merged in) | The gate passes; the accept is harmless and stays on record |
| Headless run (`ask` = false, or a cloud runtime) | The `Accept` item is a hard blocker with no recommendation, so `decisions apply --by=headless` exits 4: a headless runtime goes to the **Failure Path**, and an `ask` = false run that is not headless asks the owner the hard blocker. Today the same pause has no item and takes `Stop` (a resumable handover); see Breaking Changes |
| Two cases share a `name` in different files | Only the case whose `classname` and `name` both match is accepted |
| `tests run` without `--accepted-from` (a by-hand run, CI) | No accepted cases are passed, and the verdict comes from the exit code exactly as before |
| `--accepted-from` names a status file with no `accepted-failures` rows | The gate gets an empty list, and behaviour is unchanged |
| `tests run --ci-run --accepted-from` (debug Step 3 in CI-evidence mode) | The flag is accepted, no list is written, and the CI `test-run` row and exit code are as today |
| A workflow's `branches push` runs the consumer's pre-push hook while the base branch holds accepted red tests | `branches push --accepted-from` passes `$BKIT_ACCEPTED_TESTS` in the `git push` environment, the hook's `bkit ci push-gate` hands it to the gate, and the push goes through when nothing else fails (Q4) |
| A by-hand `git push` from the feature branch | Not a workflow push, so no accepted cases are passed, and the pre-push gate fails on the base-red tests as today |
| An agent's `bkit tests changed` self-check meets an accepted case | With `--accepted-from` from its Context, the case is skipped, so the agent neither edits it nor reports `BLOCKED` |
| The owner's reason holds a quote, a backtick or `$(` | `tests accept --reason-file` reads it from a file the orchestrator writes, so no shell runs it, and the row holds it byte for byte |
| A per-group verify gap and the named-failure item both name the gate's failing tests | The named-failure item wins: the pause lists no separate gap for the gate's failing tests, so an `Accept` always runs `tests accept` |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1:** Does bkit check that a failing case also fails on the base branch before it offers `Accept`? → the owner decides at plan review.
  - **Options:** A) No check: the owner judges, and bkit records the exact cases from the JUnit reports — no extra run, but an owner can accept a failure the branch caused, and CI on the PR still shows it · B) At the pause only, run the failing cases' test files once on the base commit through `bkit:test:file` and recommend `Accept` for the cases that also fail there — trustworthy and safe headless, but needs a base worktree and a case-to-file map that not every runner writes · C) Run the whole gate on the base branch after every red gate and compare — the most trustworthy, but it doubles every red gate's run time.
  - **Recommended:** A) No check — the issue comment chose it (decision 1, with C rejected for its run time), and the item stays a hard blocker, so no run accepts without the owner.
  - **Default if unanswered:** A.
- **Open Question Q2:** How does an accepted case stop failing the gate? → the owner decides at plan review; this changes the issue comment's decision 3.
  - **Options:** A) Engine verdict override, as the comment says: `tests run` returns PASS when every failing JUnit case is accepted — no consumer change, but a gate that chains stages with `&&` stops at the failing tier, so later stages never run and the gate reads PASS (this repo's `bkit:gate:static-unit` would skip `pnpm bkit:test:bats`; Step 12's `bkit:gate:static-unit-integration` would skip `pnpm test:integration`) · B) Runner-side skip: `tests run --accepted-from` hands the gate the accepted cases in `$BKIT_ACCEPTED_TESTS`, each runner skips them, and the verdict still comes from the exit code — every stage runs and the exit code stays truthful, but each consumer wires its runners once (a few lines per runner, documented in `docs/testing.md`), and an unwired runner keeps failing as today, with the pause saying why · C) A, plus a rule that the override applies only to the group gate — Step 8 unblocks with no consumer change, but the false PASS remains for any `&&` stage after the unit tier, and Step 12 stays stuck.
  - **Recommended:** B) Runner-side skip — it is the only option where "every other failing test still fails the gate" holds for chained gates, and an unwired runner fails safe.
  - **Default if unanswered:** B, but B reverses the owner's recorded decision 3, so the build does not start until the owner answers Q2 at Gate 1. The runbook below is written for B, and `docs/decisions.jsonl` `891-accepted-tests-skipped-by-the-gate-runner` records B as the plan's recommendation pending this answer.
  - **If the owner picks A:** the runbook changes as follows. Task 3 drops `BKIT_ACCEPTED_TESTS` and the `{log}.accepted.json` list and returns PASS when every failing case is accepted; tasks 6, 7, 11 and 12 drop out (nothing to hand the self-checks or the pushes); task 3's § Accepted failures section in `docs/testing.md` goes; task 8's `onlyAccepted` item and task 9's `onlyAccepted` routing arm go.
- **Open Question Q3:** Does `/bkit-debug` also offer an `Accept`, or only honour accepts the build recorded? → the owner decides at plan review.
  - **Options:** A) Honour only: debug Step 3 passes `--accepted-from`, and debug writes no new accept — debug's Loop Question is unchanged, but a base-red test first seen in debug still loops · B) Also offer `Accept` at debug's Loop Question — debug unblocks on its own, but it adds a pause item and an accept path to a second workflow.
  - **Recommended:** A) Honour only — the issue comment scopes debug to "the same handling" of the `tests run` verb, and build is where the accept is asked.
  - **Default if unanswered:** A.
- **Open Question Q4:** How do the build's own pushes get past the consumer's pre-push gate while the base branch holds the accepted red tests? → the owner decides at plan review. Build Steps 15 and 16 (`bkit-build.md:1082`, `:1183`), ship's pushes (`bkit-ship.md:274` and later) and debug's pushes run `branches push`, which runs `git push` without `--no-verify` (`branches.ts:1069`), so the shipped pre-push hook (`.bkit/templates/.husky/pre-push`) runs `bkit ci push-gate` on the full gate, which fails on the accepted tests.
  - **Options:** A) `branches push --accepted-from="{STATUS}"` writes the feature's accepted list and passes `BKIT_ACCEPTED_TESTS` in the `git push` environment; the hook and `bkit ci push-gate` (which spawns the gate with the inherited environment, `push-gate.ts:94-96`) hand it to the gate, so no hook template change is needed — the pushes go through and the Concrete Example and Success Criterion 3 hold, but every `branches push` call in build, debug and ship gains the flag (tasks 7 and 12) · B) The build stops at the push and says the pre-push gate fails on accepted tests — no new push path, but the Concrete Example stops at Step 15 and `/bkit-ship` is never reached, so Success Criterion 3 cannot be shown · C) The owner pushes by hand with `git push --no-verify` — no code, but it skips every pre-push check, not only the accepted tests, and the workflow has no step for it.
  - **Recommended:** A) Hand the accepted list to the pre-push gate — it is the only option under which Success Criterion 3 is reached, and the hook still fails on any not-accepted case.
  - **Default if unanswered:** A. Tasks 7 and 12 implement it.
- **Open Question Q5:** Are bkit's own builds (this repo's `bkit:gate:static-unit` chaining Vitest, bats and awake with `&&`) outside Success Criterion 1? → the owner decides at plan review.
  - **Options:** A) Yes: bkit's own runners stay unwired (Out of Scope row, deferral `891-bkit-repo-runners-skip-accepted-tests`) — the change stays consumer-facing, but a `/bkit-build` of bkit itself on a red `dev` still stops at the "the gate does not skip accepted tests" item · B) No: add a runbook task wiring bkit's Vitest config to `$BKIT_ACCEPTED_TESTS` — bkit's own builds unblock, at the cost of one more task and the same per-runner precision limits § Accepted failures documents for Vitest.
  - **Recommended:** A) Keep bkit's own runners out of this plan — the issue is a consumer's report, and the deferral keeps the work visible.
  - **Default if unanswered:** A.
- **Assumption:** Common runners can skip cases by name from an environment variable (Vitest `test.testNamePattern` in its config, Jest `testNamePattern`, pytest `-k` through `PYTEST_ADDOPTS`, a custom script by reading the JSON file) → if a consumer's runner cannot, its accepted cases keep failing, and the pause tells the owner the gate does not skip them; the build stays as stuck as today for that runner.
- **Assumption:** A JUnit case's `classname` + `name` identifies one test across gate runs → if a runner writes no `classname`, the match falls back to an empty `classname`, and two same-named cases in different files are accepted together. bkit matches on both fields, but a runner's skip can be coarser: Vitest's `testNamePattern` matches the full test name, not the file, so that wiring also skips a same-named case in another file; `docs/testing.md` § Accepted failures states the precision per runner and shows a setup-file skip that reads `classname`.
- **Assumption:** The pre-push hook and `bkit ci push-gate` pass the `git push` environment through to the gate (`push-gate.ts:94-96` spawns it with `gitEnv()`, a copy of `process.env`) → if a consumer's own hook clears the environment, Q4 A does not reach its gate, and the build's push fails on the accepted tests as today.
- **Assumption:** 100 named cases per test-run row is enough → a base branch with more than 100 failing cases cannot be accepted; the owner fixes the base branch first.
- **Assumption:** `/bkit-ship`'s merge gate (`bkit runs gate`) still needs green CI, and CI on the PR runs the same red tests while `dev` is red → ship refuses the merge until `dev` is fixed and the branch is synced. The accept unblocks the build, not the merge. If the owner expects ship to merge over the red tests, this plan does not do that.
- **Assumption:** Build and debug for one feature share `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`bkit-build.md:429`, `bkit-debug.md:318`) → if debug ran on a different status file, it would not see build's accepts.
- **Assumption:** One pause item covers all named failing cases of one gate run → an owner who wants to accept only some answers `Fix now` with directions for the rest; if per-case answers are needed, the item shape changes.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #891
```

Or, to address the reasons first: `/bkit-plan #891`
