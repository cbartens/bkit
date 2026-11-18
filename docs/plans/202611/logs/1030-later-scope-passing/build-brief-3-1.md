# Brief: group 3 — Challenge round 2 findings

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

- Group 1: Let a passing test run answer a failed diagnose step — done
  - TASK 1: Let a later same-scope passing test run answer both diagnose steps — done
  - TASK 2: State the rule in the workflows doc and the test inventory — done
- Group 2: Challenge round 1 findings — done
  - TASK 3: A diagnose agent reports FAIL because its recommended fix leaves an unhandled break in a dependent surface such as middleware or routing, or flags a `security` rot signal, the remediate agent applies the fix, the gate goes green on suites that never exercise that surface, and the summary drops the FAIL to PASS and the build opens the PR — done
- Group 3: Challenge round 2 findings — this group
  - TASK 4: A debug run on `dev` whose diagnose step reported FAIL for an unhandled break in a dependent surface such as middleware or routing applies the fix anyway, passes the gate on suites that never exercise that surface, gets the summary verdict CONCERNS, and the Step 11 close pushes the fix straight to the shared `dev` branch with no PR and no human, where before the diff the FAIL sent the run to the Failure Path and the fix commits stayed local — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A debug run on `dev` whose diagnose step reported FAIL for an unhandled break in a dependent surface such as middleware or routing applies the fix anyway, passes the gate on suites that never exercise that surface, gets the summary verdict CONCERNS, and the Step 11 close pushes the fix straight to the shared `dev` branch with no PR and no human, where before the diff the FAIL sent the run to the Failure Path and the fix commits stayed local
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:85` · **Round:** 2
  - **UPDATE:** `RESOLVED_BY` in `.bkit/core/engine/commands/workflow/summary.ts`: drop the `debug/debug-failure-diagnose` entry, so no later run answers a failed debug diagnose step, and its comment says a passing run turns a failed build diagnose step into a concern while a failed debug diagnose or soak step is never cleared.
  - **UPDATE:** `SAME_SCOPE` in `.bkit/core/engine/commands/workflow/summary.ts`: drop `debug/debug-failure-diagnose`.
  - **UPDATE:** `DIAGNOSE` in `.bkit/core/engine/commands/workflow/summary.ts`: drop `debug/debug-failure-diagnose`, so only `build/build-failure-diagnose` gets the concern line. `build/build-failure-diagnose` keeps what Task 3 built.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: the debug diagnose case Task 3 rewrote expects the FAIL to stand, and one new case proves a debug diagnose FAIL holds the debug summary at FAIL, written with the existing `diagnoseCase` and `scopedRun` helpers.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the Resolution evidence row Tasks 2 and 3 changed says the concern rule covers the build diagnose step only (build Step 13), and a failed debug diagnose step (debug Step 6) or soak step (debug Step 8) is not cleared by a later pass.
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/summary.test.ts` row Tasks 2 and 3 changed says the same.
  - **READ:** `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-4.md`: the owner's decision on this finding.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the two tests below pass; `pnpm vitest run .bkit/core/engine/commands/workflow/summary.test.ts` passes; `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have run and re-rendered `.bkit/workflows.md` (never edited by hand); `.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md` and `docs/decisions.jsonl` are unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` fails on `reasons` holding `debug-failure-diagnose FAIL, tests passed since (debug-run-tests)` and lacking `debug-failure-diagnose FAIL`, when it expects the FAIL to stand with no concern line and no `resolved by debug-run-tests` line in the markdown
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL` fails on the verdict coming out CONCERNS instead of FAIL, for `workflow: "debug"` and the rows `scopedRun("debug-run-tests", 1, "FAIL", 1, "src/a.test.ts")`, a `debug-failure-diagnose` FAIL at attempt 1, and `scopedRun("debug-run-tests", 2, "PASS", 0, "src/a.test.ts")`

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 3 (group 2, done): A diagnose agent reports FAIL because its recommended fix leaves an unhandled break in a dependent surface such as middleware or routing, or flags a `security` rot signal, the remediate agent applies the fix, the gate goes green on suites that never exercise that surface, and the summary drops the FAIL to PASS and the build opens the PR — `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/summary.test.ts`, `.bkit/core/.bkit/workflows.md`, `docs/testing.md`

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
