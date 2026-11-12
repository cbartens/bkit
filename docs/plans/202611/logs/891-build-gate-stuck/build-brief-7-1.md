# Brief: group 7 — Challenge round 2 findings

Plan: Build Gate Pause: Base-Commit Evidence and Resume Re-Run Implementation Plan

## Why and what

### Context & Goals

A consumer's `dev` carried 3 red unit tests that the build's branch did not cause. `/bkit-build` built and verified task group 1, and then its group gate (`bkit:gate:static-unit`) failed on those 3 tests. The first Decision Pause offered an `Accept` that the workflow never defines, and the second pause offered only `Try again` or `Stop`. No fix round on the branch could change the result, so groups 2-6 never started. The owner's rescope (issue comment of 2026-11-09) drops the accepted-failure design of the superseded plan and keeps the workflow's shape: a failure a round can fix gets `Try again`, and a failure no round can fix gets a plain `Stop` recommendation, so the owner fixes the cause and resumes.

The defects this plan closes, as the issue found them by reading the code:

<!-- prettier-ignore -->
| # | Defect | Where |
| --- | --- | --- |
| 1 | The loop question recommends from the problem-count trend alone and never asks whether the failing tests also fail on the commit the branch started from. | `loopTrend` / `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts` |
| 2 | The verify loop's progress numbers count only the verify agent's problems, so a red group gate after two clean verify rounds shows `0 → 0`. | `LOOPS.verify.check` in `.bkit/core/engine/commands/workflow/decisions.ts` |
| 3 | A resume after the owner fixes `dev` returns to the stale open pause. `Try again` starts a fix round that changes nothing, and that round routes back to the pause, so the build loops. | Contract **Resume** and Step 9 sub-step 5 in `.bkit/core/workflows/bkit-build.md` |
| 4 | The pause offered `Accept` for a gate failure that the Decision Pause rules exclude, either invented by the orchestrator or logged as a gap by the verify agent. | Decision Pause step 2 in `.bkit/core/workflows/bkit-build.md`; `.bkit/core/prompts/bkit-build-plan-verify.md` |

**Goals:**

- At every pause after a red group gate (Step 8) or a red final run (Step 12), check the failing tests against the base commit, and let that verdict steer the recommendation and its wording. A CI run at that exact commit may settle it; the last CI run on `dev` never does.
- Count the group gate's failing tests in the verify loop's progress numbers.
- On a resume into a pause about a red gate, re-run that gate first and continue when it is green.
- Keep gate and suite failures out of the pause's items, and out of the verify agent's gaps in group mode.

Items 1, 2 and 4 change only the information the pause shows. Item 3 is the one route change. The plan adds no option, no owner answer and no way to build past a red test.

**Related Issues:**

- #743 — Build group gate re-runs integration tests after every group (closed)
- #607 — Test full-mode runs gate on every non-success final-check result (closed)
- #510 — Test gate and dependency install: stack-neutral gate lookup and safe exit handling (closed)
- #814 — Give load-sensitive tests a budget that holds under the full gate (open)
- #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (closed)
- #771 — Catch green test lanes whose runner failed in gates/testing audits (closed)
- #346 — CI gate: block on open CRITICAL failures, age old deferrals (closed)
- #755 — Workflow optimisation: CI, tests and gates (done) (closed)
- #226 — Quality gates: pre-commit ⊆ pre-push ⊆ CI chain (closed)
- #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW (closed)

---

### Narrative

When `/bkit-build` pauses because a group gate or the final test run is red, the owner is told whether those failing tests also fail on the commit the branch started from. The recommendation follows from that: `Stop` and fix `dev` when no round here can help, or `Try again` when a round can. After the owner fixes `dev` and resumes, the build re-runs the red gate and carries on if it's now green, instead of looping on the old pause.

### Success Criteria

1. At a pause after a red group gate (Step 8) or a red final run (Step 12), the pause says how many failing tests also fail on the base commit: all, some, none, or "can't tell" with the reason.
2. When all failing tests are also red on the base commit, the pause recommends `Stop` and tells the owner to fix `dev` first. In adopt mode it also tells them to merge `dev` into the branch before resuming. `Try again` is still offered in every case.
3. The pause's "problems after each round" numbers include the group gate's failing tests, so a red gate never shows as "0 → 0".
4. Resuming into a pause about a red gate re-runs that gate first. If it passes, the build continues without asking. If it's still red, the pause is asked again with fresh numbers.
5. A group-gate or final-run failure is never offered as an `Accept` item, and the verify agent doesn't log gate failures as verify gaps.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The base-commit check at `/bkit-debug`'s Loop Question | No Success Criterion or matrix row needs it, and the issue declares it out of scope: debug often runs to fix exactly a base-red failure, so a "came from `dev`" label would be wrong when that failure is the job. | Deferral `891-debug-base-red-label` (`scope-declared`, citing the issue comment's Out of scope line). |
| A base-red notice at `/bkit-ship`'s CI wait | No Success Criterion or matrix row needs it, and the issue declares it out of scope: ship still needs green CI as today. | Deferral `891-ship-base-red-notice` (`scope-declared`, citing the same line). |
| Settling `all` / `some` from a red CI run at the base sha via published JUnit artifacts | The issue's scope asks only for "a CI run on that exact commit" when one exists; a passing run settles `none` here, and every other case runs locally, so every criterion is met without it. It is plan-sized: it changes the shipped CI template to upload reports, adds a `gh run download` reader and a mapping from CI cases to gate cases. | Deferral `891-ci-junit-artifact-settles-red-base-runs` (`own-cycle`). |

## Where it fits

- Group 1: Engine evidence the pause reads — done
  - TASK 1: Move the JUnit reader and the one-file runner into the leaf module `junit.ts`, keep each case's `classname` and `file`, and split out `reportFailures` — done
  - TASK 2: Base-run helpers: an offline-first install and the exports the base run reuses — done
  - TASK 3: Count the group gate's failing tests in the verify loop's progress — done
  - TASK 14: Widen the planned TASK 3 test's `gateFailures` type label so `pnpm typecheck` passes — done
- Group 2: The base check — done
  - TASK 4: Classify failing cases against the base run — done
  - TASK 5: The `bkit tests base` verb and its local run at the base commit — done
  - TASK 6: CI evidence at the base sha, the run's mode and its install setting — done
- Group 3: The pause's wording and engine support for the resume re-run — done
  - TASK 7: `decisions compose --base-check` words the loop question from the verdict — done
  - TASK 8: `decisions apply --by=rerun` — done
  - TASK 9: `openDecision.gate` — done
- Group 4: Workflow and prompt — done
  - TASK 10: The Decision Pause runs the base check, and Step 9's no-progress route asks the loop question — done
  - TASK 11: A resume into a red-gate pause re-runs the gate — done
  - TASK 12: Group-mode verify logs no gap for a test the group gate runs — done
- Group 5: Docs, generated files and mirrors — done
  - TASK 13: Update the catalog and test docs, and regenerate `dist/`, the capability register and the host mirrors — done
- Group 6: Challenge round 1 findings — done
  - TASK 15: A green affected-only `pull_request` CI run at the base sha settles verdict `none` (source `ci`) while the failing tests are red on `dev` — done
  - TASK 16: The `all` loop reason reads as if the base-red tests explain the whole red gate, but a gate can also be red on a non-test stage (coverage threshold, a static check after the unit run) that `tests base` cannot see — done
  - TASK 17: A base file run that crashes (non-zero exit, report written without the failing case, e.g. a load error in the fresh checkout) counts the case `absent`, so the verdict reads `none` and the pause says "the failures come from this branch" — done
  - TASK 18: `withoutHooks` wraps the whole base run, so `GIT_CONFIG_COUNT` / `core.hooksPath=/dev/null` leaks into the install and every base test process; a test that drives git hooks fails at base only and reads `red`, turning a branch-caused failure into `all` — done
  - TASK 19: A `Gate: FAIL` line smuggled into a pause item's text makes a resume close a non-gate pause (a challenge or verify-gap pause with hard blockers) as "Re-run gate" and continue without the owner's answer — done
- Group 7: Challenge round 2 findings — this group
  - TASK 20: The owner stops at a red-gate verify pause that also holds hard-blocker gaps (`test-loosened`, `exception-refused`, `no-test-first`), fixes `dev` and resumes; the resume writes `Decision: Re-run gate` under Q1 (with no loop question, that is the first hard blocker itself), sets `Status: DECIDED`, forces `VERIFY_VERDICT` = PASS, and a green re-run builds the next group with every gap unanswered — open
  - TASK 21: A failing case that is skipped at the base commit (an `it.skipIf` on an env var or a gitignored artefact the fresh checkout lacks) reads `pass`, so the verdict is `none` and the pause says "the failures come from this branch" with no evidence either way — open
  - TASK 22: With one case red at base and the rest undetermined (their base file run crashed, or no file resolved), the verdict is `some` with reason null, so the pause says "a round can fix 4 of 5" for 4 cases nothing is known about, and the crash reason that Task 17 added is dropped — open

## The work

<!-- bkit:task 20 start -->
- [ ] **TASK 20:** The owner stops at a red-gate verify pause that also holds hard-blocker gaps (`test-loosened`, `exception-refused`, `no-test-first`), fixes `dev` and resumes; the resume writes `Decision: Re-run gate` under Q1 (with no loop question, that is the first hard blocker itself), sets `Status: DECIDED`, forces `VERIFY_VERDICT` = PASS, and a green re-run builds the next group with every gap unanswered
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:582` · **Round:** 2
  - **DONE WHEN:** `decisions apply --by=rerun` refuses, with a usage error naming each undecided question number and the file left byte for byte unchanged, any `Gate: FAIL` file whose Q1 is not a loop question (no `## Progress` block) or that holds a question other than the loop question without a `Decision:` line; and the Contract **Resume** route in `.bkit/core/workflows/bkit-build.md:43` takes the `OPEN_GATE` = `FAIL` re-run only for a pause whose only undecided question is the loop question, else resumes at **Decision Pause** step 3 as for any open pause. Today the Decision Pause writes `--header=Gate=FAIL` whenever the base check ran (`GATE_VERDICT` = FAIL), including a `VERIFY_GAPS` pause routed without `PAUSE_LOOP` (Step 8 sub-step 11, `VERIFY_FIXABLE` = false), whose items start at Q1 (`decisions.ts:513`); `--by=rerun` writes the re-run line under Q1 and `Status: DECIDED` without `statusOf`, and the Resume route sets `VERIFY_VERDICT` = PASS, so the hard blockers the workflow says only the owner may settle are closed by a fabricated decision. The existing test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` composes an item-only `Gate: FAIL` file (`[ITEMS[1]]`, no `--loop`) and expects success, so it encodes this bypass and must be reshaped to a loop-only file.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > refuses a Gate: FAIL file whose Q1 is an item, not the loop question` fails on a file composed with `--header=Gate=FAIL` and `[BLOCKER]` and no `--loop` being rewritten to `Status: DECIDED` with `Decision: Re-run gate` under the blocker and exit 0, instead of exit 2 naming Q1 and the file unchanged
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > refuses a loop file with an undecided item question` fails on a file composed with `--header=Gate=FAIL`, `--loop=verify` and `[BLOCKER]` being rewritten to `Status: DECIDED` with Q2 undecided and exit 0, instead of exit 2 naming Q2 and the file unchanged
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `resume facts > build re-runs a red gate pause only when the loop question is its only undecided question` fails on the Resume bullet's `OPEN_GATE` = `FAIL` route holding no condition on the pause's undecided item questions
<!-- bkit:task 20 end -->

<!-- bkit:task 21 start -->
- [ ] **TASK 21:** A failing case that is skipped at the base commit (an `it.skipIf` on an env var or a gitignored artefact the fresh checkout lacks) reads `pass`, so the verdict is `none` and the pause says "the failures come from this branch" with no evidence either way
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:287` · **Round:** 2
  - **DONE WHEN:** A base case whose JUnit state is `skipped` reads `atBase: "unknown"`, never `pass`, as decision `891-base-commit-check-at-the-decision-pause` states ("a case passing or absent at base ... is the branch's; anything else is undetermined"); only state `passed` reads `pass`; with no base-red case the verdict is `unknown` with a reason naming the skipped case count.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a case skipped at the base commit reads unknown, not the branch's` fails on verdict `none` with `atBase: "pass"` when the base commit's runner writes `<testcase name="x"><skipped/></testcase>` for the gate's failing case `x` (expected verdict `unknown`, `atBase: "unknown"`, `branch` 0)
<!-- bkit:task 21 end -->

<!-- bkit:task 22 start -->
- [ ] **TASK 22:** With one case red at base and the rest undetermined (their base file run crashed, or no file resolved), the verdict is `some` with reason null, so the pause says "a round can fix 4 of 5" for 4 cases nothing is known about, and the crash reason that Task 17 added is dropped
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:92` · **Round:** 2
  - **DONE WHEN:** `baseVerdict` returns `some` with a reason naming the undetermined count whenever `undetermined` > 0, the verb keeps its crash / no-report / unresolved reason for `some` as it does for `unknown`, and `decisions compose --base-check` (`readBaseCheck` and the `some` branch in `.bkit/core/engine/commands/workflow/decisions.ts`) reads `branch` and words the split as "a round can fix {branch} of {failing}; the build will still stop on the {baseRed} from `dev`", adding "{undetermined} could not be checked: {reason}" when undetermined > 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > some with an undetermined case names it in the reason` fails on `reason` being null for cases `[red, pass, unknown]` (expected verdict `some` and a reason naming 1 undetermined case)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check some with undetermined cases counts only the branch's as fixable` fails on the reason reading "a round can fix 2 of 3" for `{verdict: "some", failing: 3, baseRed: 1, branch: 1, undetermined: 1}` (expected "a round can fix 1 of 3" and a sentence naming the 1 case that could not be checked)
<!-- bkit:task 22 end -->
