Verdict: CONCERNS
Failures: 1
Redesign: false
Fingerprint: 888a03b408d4aa5c8697aa43feb27436fab6ef613dd977953edb8d7a9b7260a6
<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

Plan: `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md`. Plan check (`plan-generate-check.md`): Problems 0, Existence 0, so no plan-check finding carries over. Every section `docs/templates/bkit-plan.md` mandates is present and filled. Every task has scope lines (`UPDATE` / `DELETE` / `READ`), a `DONE WHEN` and a `TEST FIRST`, and every `DEPENDS ON` names a task in the same or an earlier group. No task edits inside a `bkit:start` / `bkit:end` block: `docs/deployments.md` and `docs/migrations.md` hold no managed block, and `.bkit/core/.bkit/*.md` are sources. The Narrative, Success Criteria and the issue's Edge Cases rows are copied word for word from the issue body.

## CRITICAL

1. **(plan edit)** `plan-v1-draft.md:218-223` and `plan-v1-draft.md:343`: the four `Exempt` rows in `Out of Scope` cite deferral keys `951-trim-holistic-verifier-inputs`, `951-holistic-mechanical-gap-regen-option-e`, `951-skip-holistic-between-challenge-rounds-option-d` and `951-ship-deferred-sweep-840`, and the `**Ledger rows:**` line lists them, but `docs/deferrals.jsonl` holds no row with any `951-` key (checked in the worktree and the main checkout). Each `Exempt` row needs a matching deferral row, and the Ledger rows line may list only rows that exist. The nine decision keys do exist (`docs/decisions.jsonl:842-850`). Done when: `docs/deferrals.jsonl` holds one row per key above, with `reason` `scope-declared` and a reference to the plan's `Out of Scope`, or the Ledger rows line and the `Out of Scope` cells stop naming keys that do not exist.

## OPTIONAL

1. `plan-v1-draft.md:172` (Open Question 1): the plan rests its recommendation on the issue's edit history (body edited 03:17:05Z, after the comment at 03:07:34Z). That evidence is not in the supplied input. `plan-input-1.md` labels the issue description "oldest" and dates the comment after it, so under the input-dates rule as the input presents it, the comment wins, and holistic report numbering (Task 4, the last sentence of Success Criterion 2, Derived Test Matrix row 116, the report-number half of the restart Edge Case) would be out of scope. Either cite where the edit-history timestamps came from, or restate Open Question 1 so the owner sees that the input's own labels point the other way. The options and the recommended letter can stay.
2. Edge cases with no Derived Test Matrix row or `TEST FIRST` test:
   - Row 98: the Decision Pause re-run or a resume re-derives `GROUP_BASE` from `status route --step=build-group-start` before the gate runs (Task 7). Neither Task 7 test probes the re-derive line.
   - Row 96: Step 12 with uncommitted code outside the min-push paths writes no receipt. Task 10's `DONE WHEN` says its tests assert this, but no planned test is named for it.
   - Row 99: a run with no frozen `build.holistic` limit falls back to the current `package.json` setting.
   - Task 4 changes `steps finish --attempt-of` to `:next:all` / `:current:all` for the fix-log names. Its one test checks only the `counters derive --all-runs` lines, so a missing `:all` on `steps finish` would still let a restart overwrite `build-plan-gaps-remediate-holistic-{N}-log.md`.
   Add a matrix row and a planned test for each, or name the existing test that already covers it.
3. `plan-v1-draft.md:386` and Task 10: the receipt is written only when the `tests run` gate equals `requiredPushGate(top)`, which is the pre-push gate from the `package.json` gate definition (`.bkit/core/engine/commands/ci/push-gate.ts:36`). Step 12 runs the deepest declared build gate. In a consumer where those two differ (Step 12 runs a deeper gate than pre-push, or a different one), Step 12 writes no receipt, and Success Criterion 4 quietly fails for that consumer. Add an Edge Cases row that says what happens, and either widen the match or record the limit.
4. `plan-v1-draft.md:326-337` (Reuse Inventory): every `Search performed` cell lists in-repo text and symbol searches only. None records a framework built-in or current-practice search, although Pre-Flight claims dependency and ecosystem searches. The obvious one is Vitest's own `--changed <sha>` for `tests run --changed-since`: record that it was considered and why the stack-agnostic `bkit:gate:changed` contract wins.
5. `plan-v1-draft.md:388-400`: `#### [MODIFY]` headings for `.bkit/core/engine/commands/workflow/tests-changed.ts` and `.bkit/core/engine/commands/ci/ci.ts` say "READ only; no change". Gate 2's "Extensions landed" check would then expect a diff in files the plan does not change. Drop the headings and keep these as `READ` lines in Tasks 6 and 11.
6. The `Index updates` rule asks for an update to `.bkit/prompts.md` whenever a `.bkit/core/prompts/*.md` file is edited. Tasks 3, 7 and 8 edit three prompts, and `Documentation Updates` has no `.bkit/core/.bkit/prompts.md` row. Add the row, or state that no row in it changes (for example, the `bkit-build-plan-gaps-remediate` row at `.bkit/core/.bkit/prompts.md:207` mentions group-gate lock waits).
7. `plan-v1-draft.md:188` and `:191`: two assumptions do not say what breaks if they are wrong. The first ends with "still the intended behaviour" and the fourth with "still needed". Name the failure instead, for example "Step 15 would then not be the receipt's first use, and the Concrete Example step 6 no longer holds".
8. `plan-v1-draft.md:106-131`: the issue's Derived Test Matrix rows have their `Type` changed from `unit` / `integration` to `Unit` / `Integration`. The plan states why, but the contract keeps issue rows word for word.
9. Success Criterion 5 is checked only by advisory Manual Verification Step 2 (Open Question 4 A). That is acceptable, but no automated check shows that a repeat holistic round runs a narrower `--base` than `origin/dev`, apart from the prose audit in Task 3. Consider adding one `status route` plus Step 10 integration check that runs on a real status file.

## OUT OF SCOPE

1. Letting `runPushGate` (the pre-push path) accept bookkeeping-only uncommitted changes, so a receipt can also be written outside `tests run`. The plan already lists this in Suggested Scope Expansion.
2. A general rule for when a deeper gate's pass proves a shallower push gate (OPTIONAL 3), if the plan chooses to record the limit rather than widen the match here.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Out of Scope Exempt rows and the Ledger rows line cite deferral keys with no docs/deferrals.jsonl row (plan edit)
  **Severity:** CRITICAL · **Class:** plan-edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md:218` · **Round:** 1
  - **DONE WHEN:** docs/deferrals.jsonl holds one row each for 951-trim-holistic-verifier-inputs, 951-holistic-mechanical-gap-regen-option-e, 951-skip-holistic-between-challenge-rounds-option-d and 951-ship-deferred-sweep-840 (reason scope-declared, referencing the plan's Out of Scope), or the plan's Ledger rows line (line 343) and Out of Scope cells stop naming keys that do not exist.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
