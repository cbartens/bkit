Verdict: CONCERNS
Failures: 4
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **(plan edit) `Acceptance Scenario` § Narrative and § Success Criteria are missing.** Both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`. The marker is correct: #912 is a bug-shape issue (`.bkit/trackers.md` § Issue shapes, row `bug`), so it has no `Narrative` or `Success Criteria` field, and there is no design or audit. The scenario has no stated contract, though, and Gate 1 cannot pass until the owner answers Open Question Q1. Once the owner answers, plan-update writes the answer into both subsections: either option A (adopt the issue's four "What should happen" bullets word for word) or text the owner writes. Plan-update MUST NOT write either subsection itself.
2. **(plan edit) Task 1 breaks the Group 1 typecheck, and the task that fixes it, Task 7, is in Group 3.** Task 1 adds `"unknown"` to `LoopTrend` (`.bkit/core/engine/commands/workflow/counters.ts:251`). The `compose --loop` block in `.bkit/core/engine/commands/workflow/decisions.ts:395-400` builds `const trendLine = { "first-round", closing, stuck, worse }[p.trend]`, an object literal indexed by `LoopTrend`. Once the union gains a fifth member that has no key, the index fails to typecheck, so the Group 1 gate's static tier fails before Groups 2-3 run. Fix option A: Task 1 adds an `unknown` key to that map, or moves its `UPDATE` onto `decisionsCommand`. Fix option B: move Task 7 into Group 1 after Task 3. Check this against the #891 shape of `compose` (Assumption A1) if that merges first.
3. **(plan edit) An in-scope edge case has a build task but no verification: a selected run with no failed job.** Edge Cases row "The selected run has no failed job (a `startup_failure` with no jobs) → `failedJobCount` is absent, and the CI round records `failures: null`". Task 4's `UPDATE` on `locateCi` builds "omitted when none failed", but no `Derived Test Matrix` row, Task 4 `DONE WHEN` or `TEST FIRST` test covers it. Add a matrix row and a Task 4 `TEST FIRST` test in `.bkit/core/engine/commands/workflow/runs.test.ts`. Task 4 then has 4 tests across 2 files, which is within the per-task caps.
4. **(plan edit) An in-scope edge case has a build task but no verification: `codeChanged` judged between the compared pair.** Edge Cases row "Rounds `ci:123` (2), local gate (5), local gate (2), code changed between the local rounds → `trend: closing`, from the two local rounds; `codeChanged` is judged between those two rounds". Task 2 builds "`codeChanged` is judged between the pair's `parentSha` values". Task 2's test `compares the last round with the earliest round of the same scope` only checks for `closing`. A fixture with no `parentSha` leaves `codeChanged` at `null`, which also reads `closing` (`loopTrend`: `codeChanged !== false`). So the test cannot catch a build that still diffs `rounds[0]` against the last round. Add a `TEST FIRST` test whose rounds have distinct `parentSha` values: no source change between the two local rounds, a change between the CI round and the first local round. It should fail on the trend reading "closing" when it should read `stuck`. Add a matching matrix row for Task 2.

## OPTIONAL

1. **The precedence between the two `unknown` `trendLine` texts is not stated.** The Concrete Example's step 4 has both a missing count (`2 → ?`) and different scopes, and expects the "ran different tests" sentence. `Architecture & Component Changes` § Engine — loop trend lists both sentences with no rule for which wins, and Task 3's `DONE WHEN` does not pin one. Add the rule (for example: different scopes win over a missing count) and a test case that has both.
2. **Some `Derived Test Matrix` rows lack a real target file.** The last row's `Target file` is `pnpm bkit:gate:static` and `pnpm bkit check`, which are commands, not a file.
3. **No matrix row covers the soak limit used up while the trend is `unknown`.** That is the Process Sketch `IF` line and the Edge Cases row "The soak attempts are used up and the trend is `unknown`". The Task 8 `workflow-shape.test.ts` test checks only the wording ("every `Q1`"). Name the `LOOP_LIMIT` `Q1` in that test, so the edge case's "states the unknown-count `trendLine`" is pinned.
4. **No matrix row covers the build test loop on `unknown`.** The Edge Cases row says "the build test loop goes to Step 13 without a pause". The plan relies on the existing `workflow-shape.test.ts` build route case (Verification Plan § Test Synchronization) but names no test. Add that existing case as the evidence, or add a row.
5. **The `Supersession Inventory` `DELETE` row has no `[DELETE]` entry.** The row for the `trendLine` map in `decisions.ts` appears in `Architecture & Component Changes` only as a sentence under `[MODIFY]` ("which is removed"), not as a `[DELETE]` entry. It is a symbol inside a modified file, so a labelled bullet (`[DELETE] trendLine map in compose`) under the `[MODIFY]` heading would keep the two in step.
6. **Assumption A3 risk in the build loop.** `build-run-tests` rows carry `scope` (`--scope="{TEST_SCOPE}"`). If a build group's gate scope changes between rounds (for example, a gate fallback after a consumer edits `package.json` scripts mid-run), the trend reads `unknown` and Step 12 never pauses. Only `build.verify` / test-loop attempt limits then bound the loop. Name this in A3's "what breaks", or add a test that two build rounds with the same scope still compare.
7. **`steps finish` passing `--failures` when the `test-run` row has `failures: null` is not tested.** That is the Edge Cases row's second clause. Today's code already refuses it (`steps.ts:1197` `failures === undefined`), so an existing case may cover it. Task 6's `DONE WHEN` names only the `--failures=3` mismatch. Name the existing test, or extend the Task 6 test.

## OUT OF SCOPE

None
