# Brief: group 1 — Let a passing test run answer a failed diagnose step (tests)

Plan: Let a later passing test run answer a failed diagnose step Implementation Plan

## Why and what

### Context & Goals

`bkit workflows summary` keeps a run at FAIL while a FAIL row has no later answer. A failed test-fix step (`build/build-failure-remediate`, `debug/debug-failure-remediate`) is already answered by a later passing same-scope test run. The diagnose steps before the fix (`build/build-failure-diagnose`, build Step 13; `debug/debug-failure-diagnose`, debug Step 6) are not in the table, so their FAIL stays on the verdict after the fix and the tests pass. Goal: add both diagnose steps to the table, keep `debug/debug-failure-soak` out, and state both rules in the workflows doc.

**Related Issues:**

- #1030 — later scope passing (this plan)
- #903 — Build: owner's Fix now answer is lost after the Decision Pause

---

### Narrative

A run whose diagnose agent reported FAIL, and whose fix and later full test run then passed on the same scope, gets a summary verdict that ignores the diagnose FAIL and lists it as resolved history. A soak FAIL still holds the verdict at FAIL.

### Success Criteria

- A build run with a `build-failure-diagnose` FAIL and a later `build-run-tests` PASS, 0 failures, same scope: the verdict does not count the diagnose FAIL, and the markdown says it was resolved by the later run.
- The same holds for `debug-failure-diagnose` and `debug-run-tests`.
- A diagnose FAIL followed by a passing run on a different or missing scope still counts.
- A `debug-failure-soak` FAIL followed by a passing same-scope run still counts.
- `.bkit/core/.bkit/workflows.md` § Comment Lifecycle (the Summary / handover step paragraph) states both rules.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Clearing a soak FAIL by any means | The owner decided a later pass does not clear it | Deferral `903-debug-soak-fail-resolved-by-later-passing-run` |
| Changing the scope rule for remediate or the verification steps | The goal only adds diagnose to the existing rule | None |
| Closing the deferral `903-debug-soak-fail-resolved-by-later-passing-run` | Stays open as decided | None |

## Where it fits

- Group 1: Let a passing test run answer a failed diagnose step — this group
  - TASK 1: Let a later same-scope passing test run answer both diagnose steps — open
  - TASK 2: State the rule in the workflows doc and the test inventory — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Let a later same-scope passing test run answer both diagnose steps
  - **UPDATE:** `RESOLVED_BY` in `.bkit/core/engine/commands/workflow/summary.ts`: adds `"build/build-failure-diagnose": ["build-run-tests"]` and `"debug/debug-failure-diagnose": ["debug-run-tests"]`, never `debug/debug-failure-soak`, and its comment names diagnose
  - **UPDATE:** `SAME_SCOPE` in `.bkit/core/engine/commands/workflow/summary.ts`: adds both diagnose keys, and its comment names diagnose
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: the diagnose and soak cases next to the test-fix cases (lines 833-930), written with the existing `scopedRun(step, attempt, verdict, failures, scope)` helper
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/summary.test.ts` passes, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` fails on the FAIL still counting
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` fails on the FAIL still counting
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a diagnose FAIL followed by a passing run on a different scope still counts` fails on the scope check being skipped for diagnose
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a diagnose FAIL followed by a passing run with no scope still counts` fails on a missing scope being treated as a match
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-soak FAIL followed by a passing same-scope run still counts` fails on soak being cleared by a later pass

<!-- bkit:task 1 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a diagnose FAIL followed by a passing run on a different scope still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a diagnose FAIL followed by a passing run with no scope still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a debug-failure-soak FAIL followed by a passing same-scope run still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
