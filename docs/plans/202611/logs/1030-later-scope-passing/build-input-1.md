## Session Prompt — this run's, newer than everything below

#1030 publish=false

## Issue description — oldest

### Narrative

`bkit workflows summary` decides whether a run's FAIL rows still count. A FAIL that a later step has answered becomes history; one that nothing answered keeps the run's verdict at FAIL. The table `RESOLVED_BY` in `.bkit/core/engine/commands/workflow/summary.ts` (line 78) says which later step answers which failed step.

Today a failed test-fix step (`build/build-failure-remediate`, `debug/debug-failure-remediate`) is answered by a later passing test run in the same run, with 0 failures, on the same scope as the test run the fix followed (`SAME_SCOPE`, line 89). The diagnose steps that come just before the fix (`build/build-failure-diagnose`, build Step 13; `debug/debug-failure-diagnose`, debug Step 6) are not in the table. So when a diagnose agent reports FAIL, and the fix and a later full test run then pass, the summary still reports the run as FAIL.

Both diagnose steps finish with `--attempt-of=build-run-tests:current` / `--attempt-of=debug-run-tests:current`, the same as remediate, so the existing same-scope rule fits them unchanged.

The soak step (`debug/debug-failure-soak`, debug Step 8) also finishes with `--attempt-of=debug-run-tests:current`, but the owner decided a later pass does not clear a soak FAIL. It stays out of the table.

Once done, a diagnose FAIL followed by a passing same-scope test run is listed as resolved history, the summary verdict follows the rest of the run, and a soak FAIL still holds the verdict at FAIL.

### Success Criteria

- A build run with a `build-failure-diagnose` FAIL followed by a later `build-run-tests` PASS, 0 failures, on the same scope, gets a summary verdict that does not count the diagnose FAIL, and the markdown says it was resolved by the later run.
- The same holds for a debug run with a `debug-failure-diagnose` FAIL and a later `debug-run-tests` PASS on the same scope.
- A diagnose FAIL followed by a passing run on a different or missing scope still counts.
- A `debug-failure-soak` FAIL followed by a passing same-scope run still counts.
- `.bkit/core/.bkit/workflows.md` § Comment Lifecycle (the Summary / handover step paragraph) states both rules.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Build diagnose FAIL, later `build-run-tests` PASS, 0 failures, same scope | Resolved; listed as history with "resolved by". |
| Debug diagnose FAIL, later `debug-run-tests` PASS, 0 failures, same scope | Resolved. |
| Diagnose FAIL, later PASS on a different scope | Still a FAIL. |
| Diagnose FAIL, later PASS whose scope is missing | Still a FAIL. |
| Diagnose FAIL, later run PASS but `failures` > 0 | Still a FAIL. |
| Diagnose FAIL, the only passing run came before it | Still a FAIL (the answer must come later). |
| Soak FAIL, later `debug-run-tests` PASS on the same scope | Still a FAIL. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` |
| a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` |
| a diagnose FAIL followed by a passing run on a different scope still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` |
| a diagnose FAIL followed by a passing run with no scope still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` |
| a debug-failure-soak FAIL followed by a passing same-scope run still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Let a passing test run answer a failed diagnose step

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
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

Decisions already made: a build-failure-diagnose or debug-failure-diagnose FAIL is resolved by a later passing test run on the same scope; a debug-failure-soak FAIL is not. One rule for every fix step, and clearing neither, are rejected (`docs/decisions.jsonl` key `903-diagnose-fail-resolved-by-later-pass-soak-not`). This is settled.

- Assumption: "same scope" means the scope of the `step-done` test-run row whose attempt matches the diagnose row's attempt, exactly as for remediate. Both diagnose steps record `--attempt-of=<run-tests>:current`, so the existing lookup finds that row.
- The deferral `903-debug-soak-fail-resolved-by-later-passing-run` stays open, as decided; this issue does not close it.

Removes: the summary FAIL that a diagnose step leaves behind after the run's tests later pass on the same scope.

### Breaking Changes & Naming

None. Runs with a diagnose FAIL and a later same-scope pass now get a verdict that ignores that FAIL; all other runs are unchanged.

### Out of Scope

- Clearing a soak FAIL by any means.
- Changing the scope rule for remediate or the verification steps.
- Closing the deferral `903-debug-soak-fail-resolved-by-later-passing-run`.

### References

- `docs/decisions.jsonl` key `903-diagnose-fail-resolved-by-later-pass-soak-not`
- `docs/decisions.jsonl` key `903-test-fix-fail-resolved-by-same-scope-passing-run`
- `docs/deferrals.jsonl` key `903-diagnose-fail-resolved-by-later-passing-run`
- `.bkit/core/.bkit/workflows.md` § Comment Lifecycle
- `docs/testing.md` § Counter derivation test coverage
- #903 — Build: owner's Fix now answer is lost after the Decision Pause

## Issue comment — posted 2026-11-17T22:37:50.000Z

Assumption made by the v6.3 run's orchestrator (2026-11-18); the owner can overturn it.

- **The question:** the build paused at its whole-change test gate after the second attempt was red. The options were Try again or Stop, and the pause recommended Stop.
- **The answer given:** Try again.
- **Why against the recommendation:** the six failures were timeouts, four in `husky-pre-push.integration.test.ts` and two in `workflows.test.ts`, while four builds ran at once and the machine load was about 15. The same tests passed on the branch when re-run with no source change. Both whole-change verifies passed.
- **Limits:** no test may be weakened, skipped or given a longer timeout. If the gate is red again with any other failure, the build stops.

Decision row: `1030-holistic-gate-timeouts-under-load-get-one-more-round` in `docs/decisions.jsonl`.

## Issue comment — posted 2026-11-17T22:45:06.000Z

Assumption made by the v6.3 run's orchestrator (2026-11-18); the owner can overturn it. It replaces the route in the earlier comment on this issue.

- **The question:** the build paused a second time at its whole-change test gate. The options were Try again or Stop.
- **The answer given:** Stop with the held handover, then resume the build so the gate runs again.
- **Why:** the earlier Try again answer started a fix round that changed no code, and the build came back to the pause without re-running the gate. Try again can only loop there. Stop releases the lock, and the resume takes the workflow's Gate rerun route. The six failures were load timeouts, four in `husky-pre-push.integration.test.ts` and two in `workflows.test.ts`.
- **Limits:** the resume waits for the 1-minute load to drop under 8. No test may be weakened, skipped or given a longer timeout. If the gate is red again with any failure that is not a timeout, the build stops.

Decision row: `1030-second-gate-pause-is-answered-stop-then-resume` in `docs/decisions.jsonl`.

## Plan — docs/plans/202611/1030-later-scope-passing-plan.md — last committed 2026-11-17T21:11:30.000Z

# Let a later passing test run answer a failed diagnose step Implementation Plan

## Context & Goals

`bkit workflows summary` keeps a run at FAIL while a FAIL row has no later answer. A failed test-fix step (`build/build-failure-remediate`, `debug/debug-failure-remediate`) is already answered by a later passing same-scope test run. The diagnose steps before the fix (`build/build-failure-diagnose`, build Step 13; `debug/debug-failure-diagnose`, debug Step 6) are not in the table, so their FAIL stays on the verdict after the fix and the tests pass. Goal: add both diagnose steps to the table, keep `debug/debug-failure-soak` out, and state both rules in the workflows doc.

**Related Issues:**

- #1030 — later scope passing (this plan)
- #903 — Build: owner's Fix now answer is lost after the Decision Pause

---

## Acceptance Scenario

### Narrative

A run whose diagnose agent reported FAIL, and whose fix and later full test run then passed on the same scope, gets a summary verdict that ignores the diagnose FAIL and lists it as resolved history. A soak FAIL still holds the verdict at FAIL.

### Success Criteria

- A build run with a `build-failure-diagnose` FAIL and a later `build-run-tests` PASS, 0 failures, same scope: the verdict does not count the diagnose FAIL, and the markdown says it was resolved by the later run.
- The same holds for `debug-failure-diagnose` and `debug-run-tests`.
- A diagnose FAIL followed by a passing run on a different or missing scope still counts.
- A `debug-failure-soak` FAIL followed by a passing same-scope run still counts.
- `.bkit/core/.bkit/workflows.md` § Comment Lifecycle (the Summary / handover step paragraph) states both rules.

### Process Sketch

- **WHEN** the summary reads a `build-failure-diagnose` FAIL and a later `build-run-tests` PASS with 0 failures on the same scope **→ THEN** the FAIL is listed as "resolved by build-run-tests" and the verdict ignores it.
- **WHEN** the summary reads a `debug-failure-diagnose` FAIL and a later `debug-run-tests` PASS with 0 failures on the same scope **→ THEN** the same.
- **IF** the later pass has a different or missing scope, or failures above 0, or came before the diagnose row **→ THEN** the FAIL still counts.
- **IF** the FAIL is `debug-failure-soak` **→ THEN** it still counts whatever later run passes.

### Concrete Example

**Setup:** A build run: `build-run-tests` attempt 1 FAIL on `src/a.test.ts`, `build-failure-diagnose` attempt 1 FAIL, `build-failure-remediate`, then `build-run-tests` attempt 2 PASS, 0 failures, on `src/a.test.ts`.

**Steps:**

1. The user runs `bkit workflows summary` → the diagnose FAIL appears under `## Resolved Findings` as "build-failure-diagnose FAIL, resolved by build-run-tests".
2. The same run with attempt 2 on `other/scope` → the reasons still contain "build-failure-diagnose FAIL".

**Outcome:** The verdict follows the rest of the run.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Build diagnose FAIL, later `build-run-tests` PASS, 0 failures, same scope | Resolved; listed as history with "resolved by". |
| Debug diagnose FAIL, later `debug-run-tests` PASS, 0 failures, same scope | Resolved. |
| Diagnose FAIL, later PASS on a different scope | Still a FAIL. |
| Diagnose FAIL, later PASS whose scope is missing | Still a FAIL. |
| Diagnose FAIL, later run PASS but `failures` > 0 | Still a FAIL. |
| Diagnose FAIL, the only passing run came before it | Still a FAIL (the answer must come later). |
| Soak FAIL, later `debug-run-tests` PASS on the same scope | Still a FAIL. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a diagnose FAIL followed by a passing run on a different scope still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a diagnose FAIL followed by a passing run with no scope still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| a debug-failure-soak FAIL followed by a passing same-scope run still counts | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |

### Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## Breaking Changes & Naming Review

None. Runs with a diagnose FAIL and a later same-scope pass now get a verdict that ignores that FAIL; all other runs are unchanged. No new names.

### Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## Open Questions & Assumptions

- **Assumption:** "same scope" means the scope of the `step-done` test-run row whose attempt matches the diagnose row's attempt, exactly as for remediate; both diagnose steps record `--attempt-of=<run-tests>:current` → if wrong, the lookup finds no scope and the FAIL stays (safe failure).
- Decided already, not open: a diagnose FAIL is resolved by a later passing same-scope run; a soak FAIL is not (`docs/decisions.jsonl` key `903-diagnose-fail-resolved-by-later-pass-soak-not`). The deferral `903-debug-soak-fail-resolved-by-later-passing-run` stays open.

### Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

Rejected (owner decision, `903-diagnose-fail-resolved-by-later-pass-soak-not`): one rule for every fix step including soak, and clearing neither diagnose nor soak.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Clearing a soak FAIL by any means | The owner decided a later pass does not clear it | Deferral `903-debug-soak-fail-resolved-by-later-passing-run` |
| Changing the scope rule for remediate or the verification steps | The goal only adds diagnose to the existing rule | None |
| Closing the deferral `903-debug-soak-fail-resolved-by-later-passing-run` | Stays open as decided | None |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no new packages.
- [ ] **Dependency Versions:** unchanged.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** files confirmed.
- [ ] **Project Context:** `docs/decisions.jsonl` rows `903-diagnose-fail-resolved-by-later-pass-soak-not` and `903-test-fix-fail-resolved-by-same-scope-passing-run` read via the issue.
- [ ] **Project Documents:** assessed in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Architecture & UI:** not applicable — engine table change only.

### Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row.
- [ ] **Reuse reasons:** no `NEW` rows.
- [ ] **Gate 1 — Verified:** every item above is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — a lookup-table change inside one existing engine command | `.agents/docs.md` index only | none | None. |
| technology | `docs/technology.md` | no — no new library or convention | `.agents/docs.md` index only | none | None. |
| security | `docs/security.md` | no — no credential, route or input | `.agents/docs.md` index only | none | None. |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Counter derivation test coverage (the `commands/workflow/summary.test.ts` row) | covered | Task 2 updates the row. |
| workflows catalog | `.bkit/core/.bkit/workflows.md` | yes | § Comment Lifecycle, Summary / handover Resolution evidence table | covered | Task 2 updates the test-fix row. |
| data-schema, design, observability, deployments, noise, setup | `docs/*.md` | no — no database, UI, logging, release or setup change | `.agents/docs.md` index only | none | None. |

## Documentation Warnings

None

## Data Schema Integration

None — no schema change.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A diagnose FAIL answered by a later passing run | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -n "SAME_SCOPE\|RESOLVED_BY" .bkit/core/engine/commands/workflow/summary.ts`; read lines 60-130 | `RESOLVED_BY` and `SAME_SCOPE` in `summary.ts` — cover the remediate steps, missing the two diagnose keys | EXTEND | Add `build/build-failure-diagnose` and `debug/debug-failure-diagnose` to both tables; never the soak key. |
| Diagnose and soak test cases | `.bkit/core/engine/commands/workflow/summary.test.ts` | read lines 825-935; `scopedRun` helper | `scopedRun` and the test-fix cases — cover remediate, missing diagnose and soak | EXTEND | Add the five matrix cases beside the test-fix cases with `scopedRun`. |
| The rule in the workflows doc | `.bkit/core/.bkit/workflows.md` | `grep -n "Failed test-fix" .bkit/core/.bkit/workflows.md` | Row at line 526 — covers test-fix only | EXTEND | Row also covers the diagnose steps and names the soak exception. |
| The rule in the test inventory | `docs/testing.md` | `grep -n "summary.test.ts" docs/testing.md` | Row at line 657 — lists the test-fix case | EXTEND | Row adds the diagnose and soak cases. |

## Architecture & Component Changes

**Ledger rows:** None

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** the file exists; `RESOLVED_BY` at line 78, `SAME_SCOPE` at line 89.
- Add the two diagnose keys to both tables; update both comments to name diagnose.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.test.ts`

- **Existence Check:** the file exists.
- Five new cases beside lines 833-930.

### Docs

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists. Edit the source only; `.bkit/workflows.md` is re-rendered by `upgrade`.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | Resolution evidence row covers diagnose steps and the soak exception. |
| `docs/testing.md` | `summary.test.ts` row lists the diagnose and soak cases. |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Let a passing test run answer a failed diagnose step

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Let a later same-scope passing test run answer both diagnose steps
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

- [x] **TASK 2:** State the rule in the workflows doc and the test inventory
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Comment Lifecycle, the Summary / handover step's Resolution evidence table, the row at line 526 also covers the diagnose steps (build Step 13, debug Step 6) with the same same-scope rule and says a soak FAIL (debug Step 8) is not cleared by a later pass
  - **UPDATE:** `docs/testing.md`: § Counter derivation test coverage, the `commands/workflow/summary.test.ts` row (line 657) adds the diagnose and soak cases
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both docs name the diagnose rule and the soak exception, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have re-rendered `.bkit/workflows.md` (never edited by hand)
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

### Gate 2: Code Implementation Check

- [ ] **No bolt-on:** no `[NEW]` files.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test red before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** none uncleared.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in Task 1's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/summary.test.ts`):** the five new cases pass.
- [ ] **Run all tests:** `pnpm test` passes.

### Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof.

### Manual Verification

- [ ] **Step 1:** run `bkit workflows summary` on a scratch status log with a diagnose FAIL then a same-scope pass, and see "resolved by" in the markdown.
