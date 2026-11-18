# Brief: group 1 — Let a passing test run answer a failed diagnose step

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
  - TASK 2: State the rule in the workflows doc and the test inventory — open

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

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** State the rule in the workflows doc and the test inventory
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Comment Lifecycle, the Summary / handover step's Resolution evidence table, the row at line 526 also covers the diagnose steps (build Step 13, debug Step 6) with the same same-scope rule and says a soak FAIL (debug Step 8) is not cleared by a later pass
  - **UPDATE:** `docs/testing.md`: § Counter derivation test coverage, the `commands/workflow/summary.test.ts` row (line 657) adds the diagnose and soak cases
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both docs name the diagnose rule and the soak exception, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have re-rendered `.bkit/workflows.md` (never edited by hand)
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A diagnose FAIL answered by a later passing run | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -n "SAME_SCOPE\|RESOLVED_BY" .bkit/core/engine/commands/workflow/summary.ts`; read lines 60-130 | `RESOLVED_BY` and `SAME_SCOPE` in `summary.ts` — cover the remediate steps, missing the two diagnose keys | EXTEND | Add `build/build-failure-diagnose` and `debug/debug-failure-diagnose` to both tables; never the soak key. |
| Diagnose and soak test cases | `.bkit/core/engine/commands/workflow/summary.test.ts` | read lines 825-935; `scopedRun` helper | `scopedRun` and the test-fix cases — cover remediate, missing diagnose and soak | EXTEND | Add the five matrix cases beside the test-fix cases with `scopedRun`. |
| The rule in the workflows doc | `.bkit/core/.bkit/workflows.md` | `grep -n "Failed test-fix" .bkit/core/.bkit/workflows.md` | Row at line 526 — covers test-fix only | EXTEND | Row also covers the diagnose steps and names the soak exception. |
| The rule in the test inventory | `docs/testing.md` | `grep -n "summary.test.ts" docs/testing.md` | Row at line 657 — lists the test-fix case | EXTEND | Row adds the diagnose and soak cases. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** the file exists; `RESOLVED_BY` at line 78, `SAME_SCOPE` at line 89.
- Add the two diagnose keys to both tables; update both comments to name diagnose.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.test.ts`

- **Existence Check:** the file exists.
- Five new cases beside lines 833-930.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists. Edit the source only; `.bkit/workflows.md` is re-rendered by `upgrade`.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists.
