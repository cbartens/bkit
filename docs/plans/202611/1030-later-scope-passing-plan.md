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
| Build diagnose FAIL, later `build-run-tests` PASS, 0 failures, same scope | A concern: verdict CONCERNS, reason `build-failure-diagnose FAIL, tests passed since (build-run-tests)`. |
| Debug diagnose FAIL, later `debug-run-tests` PASS, 0 failures, same scope | Still a FAIL: verdict FAIL, reason `debug-failure-diagnose FAIL`. |
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
| a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| a diagnose FAIL with no later passing same-scope test run is still a FAIL | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |
| a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |

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

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 3 start -->

- [x] **TASK 3:** A diagnose agent reports FAIL because its recommended fix leaves an unhandled break in a dependent surface such as middleware or routing, or flags a `security` rot signal, the remediate agent applies the fix, the gate goes green on suites that never exercise that surface, and the summary drops the FAIL to PASS and the build opens the PR
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:84` · **Round:** 1
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: when the later same-scope passing test run answers a `build/build-failure-diagnose` or `debug/debug-failure-diagnose` FAIL, push `{label} FAIL, tests passed since ({answering step})` onto `concerns` instead of listing the FAIL under Resolved Findings. The diagnose keys stay in `RESOLVED_BY` and `SAME_SCOPE`, so the existing rule decides which run answers the FAIL; the engine reads no report section. `build/build-failure-remediate`, `debug/debug-failure-remediate` and `debug/debug-failure-soak` keep their current handling.
  - **UPDATE:** `RESOLVED_BY` in `.bkit/core/engine/commands/workflow/summary.ts`: its comment says a later same-scope passing run turns a failed diagnose step into a concern, and clears a failed test fix.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: the two diagnose cases Task 1 added expect the concern, and one new case keeps an unanswered diagnose FAIL a FAIL, written with the existing `diagnoseCase` and `scopedRun` helpers.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the Resolution evidence row Task 2 changed says a failed diagnose step answered by a later same-scope passing run is reported as a concern, not cleared.
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/summary.test.ts` row Task 2 changed says the same.
  - **READ:** `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-3.md`: the owner's decision on this finding.
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the three tests below pass; `pnpm vitest run .bkit/core/engine/commands/workflow/summary.test.ts` passes; `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have run and re-rendered `.bkit/workflows.md` (never edited by hand); `docs/decisions.jsonl` is unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` fails on the verdict coming out PASS with no `build-failure-diagnose FAIL, tests passed since (build-run-tests)` reason, when it expects verdict CONCERNS and that reason
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` fails on the verdict coming out PASS with no `debug-failure-diagnose FAIL, tests passed since (debug-run-tests)` reason, when it expects verdict CONCERNS and that reason
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a diagnose FAIL with no later passing same-scope test run is still a FAIL` fails on a diagnose FAIL followed only by a passing run on another scope coming out CONCERNS or PASS instead of verdict FAIL with `build-failure-diagnose FAIL` in `reasons`

<!-- bkit:task 3 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 2 findings

<!-- bkit:task 4 start -->

- [x] **TASK 4:** A debug run on `dev` whose diagnose step reported FAIL for an unhandled break in a dependent surface such as middleware or routing applies the fix anyway, passes the gate on suites that never exercise that surface, gets the summary verdict CONCERNS, and the Step 11 close pushes the fix straight to the shared `dev` branch with no PR and no human, where before the diff the FAIL sent the run to the Failure Path and the fix commits stayed local
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
<!-- bkit:group 3 end -->

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
