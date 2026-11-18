Verdict: CONCERNS
Failures: 2
Redesign: false
Fingerprint: 812ad09e46bb79d6b44a493893fc89ee387b276ea858068c1de3003165d1b435
<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

Plan: `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md`. Plan-check (`plan-generate-check.md`) supplied 0 problems and 0 existence findings, so no plan-check finding carries over. Every section `docs/templates/bkit-plan.md` mandates is present. The orchestrator constraints were checked: `How this fits #1005` is present and blocks neither order; the link lives on the `workflow-started` row of `status.jsonl`; the `Removes:` line names the path-hash derivation and the latest-comments fallback for the Owner Answers posts; the word totals (58536, 86494) are named, and Task 5's `DONE WHEN` holds them at or below today; no new verb and no second run proof are planned. The one constraint the draft misses is Q1 (C1).

## CRITICAL

- **C1 (plan edit) — Q1 has a recommended answer but its default stops the plan; the apply step must assume A.** `plan-v1-draft.md:157` reads `Default if unanswered: the plan stops at Gate 1 until you answer`, although `:156` recommends A. The run's brief says an open question with a recommended answer is taken as assumed, and the plan says so. Fix: set Q1's `Default if unanswered` to `the plan assumes A`, add an assumption line naming what breaks if A is wrong (the Narrative would stress an outcome the owner did not intend; the criteria and tests stay valid), and replace the `⚠️ MISSING` line at `:48` with the Q1 A proposal, labelled as assumed pending the owner's answer to Q1. The proposal comes from the plan's own owner question, not a new Narrative, so nothing new is invented.
- **C2 (plan edit) — two new failure paths have no test.** The contract requires a task that adds or changes logic to name its own tests.
  - Task 2 (`plan-v1-draft.md:440`) makes `sessionPublication` throw on a session folder that exists but has no `progress-id` file, or an empty one. Today that folder works. The `Edge Cases` row at `:90` describes the outcome (association friction, standalone comment). But no `Derived Test Matrix` row and no `TEST FIRST` covers it. The existing test `records preparation and session association failures despite successful delivery` (`tracker.integration.test.ts:532`) deletes the whole folder (`:553`), so it does not prove the missing-file path.
  - Task 3 (`:453`) adds a branch to `workflows start`: when `sessionPublication` throws, print `[bkit-tracker] invocation association unavailable; progress may start fresh` and write the row without `progress`. No test names it.
  - Fix: add one matrix row and one `TEST FIRST` for each path. Put the Task 2 row in `tracker.test.ts` or `tracker.integration.test.ts`. Put the Task 3 row in `workflows.test.ts`: the start row has no `progress` and the diagnostic is printed. Task 2 then names 3 tests and Task 3 names 5, both inside the caps of 10 tests in 3 files.

## OPTIONAL

- **O1 — The Edge Cases row for two answers rounds misstates the key.** `plan-v1-draft.md:87` says "Each round's post gets its own engine-action key". The key parts are kind, step number, sub-step and attempt (`issues.ts:1340-1345`), and the Owner Answers line passes no `--attempt`. So both rounds get the key `plan/{run}/step/8/comment`, and only the body hash differs: `alreadyDone` compares key and hash (`tracker.ts:1714`), and the section id is `actionHash(key + hash)` (`tracker.ts:1561`). Reword the row. Make the two-rounds test (Task 4) also check that the second round's `engine-action` row, which repeats the key with a new hash, is written and committed.
- **O2 — One edge case has no test row.** The same-round re-run with the same body that prints `deduped: true` (`:87`) has no `Derived Test Matrix` row. Fold it into the Task 4 two-rounds test, or add a row for it.
- **O3 — The graph refresh is placed inconsistently.** `Documentation Consultation` (`:268`) says Tasks 3 and 4 run `pnpm bkit:graph:refresh`, but only Task 4's `DONE WHEN` (`:481`) runs it. Task 3 deletes `bindRunPublication` and `runPublicationFile`. Either add the refresh to Task 3 or change the row to Task 4 only.
- **O4 — Task 4 names a test that is not in `TEST FIRST` and is not marked as existing.** Task 4's `DONE WHEN` names `a --file post whose status file holds no run of the workflow exits 2` as new, but `TEST FIRST` does not list it. `commentRunProof` already refuses such a post (`tracker.ts:2010-2017`), so the test would pass before any code changes. Label it a guard test kept green, as the matrix does for the ad-hoc refusal row, so the build does not expect it to fail first.
- **O5 — Back the `runActionKey` assumption with evidence.** The assumption at `:169` (no `--file` post before its own `workflows start`) holds today: `bkit-ship.md:215` starts the run before the `--file` post at `:238`, and `bkit-build.md:1471` is a terminal post. Cite both in the assumption, or add a `workflow-shape.test.ts` check, so a later workflow edit cannot quietly key a Step 1 post to the previous run.
- **O6 — Task 6's check is loose.** Its `DONE WHEN` (`:520`) relies on `grep -rln 'run association'` "finding no such sentence", which is a judgement call, not a check. Name the exact phrases that must disappear, for example `invocation files` in `docs/security.md` and the outbox run-association sentences in `docs/architecture.md:27` and `.bkit/core/.bkit/trackers.md`.
- **O7 — Q2 opens with an identifier.** Q2 (`:158`) names `--session-dir` in its first sentence, and Q3 (`:164`) cites a decision key before its options. Open each question with the decision in plain English, then name the flag or key.

## OUT OF SCOPE

- Other phase workflows (`bkit-build`, `bkit-debug`, `bkit-ship`) may post with `--session-dir` after their own `workflows close`. The same lost-link fault would hit them. Propose a separate sweep instead of widening this plan.
- The LOW proof-hardening deferral `918-ad-hoc-agent-challenge-low-...-tracker-ts-2019` stays deferred, as the plan's `Suggested Scope Expansion` already recommends.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Q1 has a recommended answer but defaults to stopping at Gate 1; the plan must assume A
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:157` · **Round:** 1
  - **DONE WHEN:** Q1 reads 'Default if unanswered: the plan assumes A', an assumption line names what breaks if A is wrong, and the Narrative at line 48 carries the Q1 A proposal labelled as assumed pending the owner's answer.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Two new failure paths have no test: sessionPublication on a folder with no or empty progress-id (Task 2) and workflows start writing the row without progress after that error (Task 3)
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:453` · **Round:** 1
  - **DONE WHEN:** The Derived Test Matrix has one row for each path, and Task 2 and Task 3 each list the matching TEST FIRST test (Task 2 in tracker.test.ts or tracker.integration.test.ts, Task 3 in workflows.test.ts), within the caps of 10 tests in 3 files per task.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tracker.test.ts
    - .bkit/core/engine/commands/workflow/workflows.test.ts
<!-- bkit:task 2 end -->
