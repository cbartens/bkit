# Brief: group 6 — Challenge round 1 findings

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
- Group 6: Challenge round 1 findings — this group
  - TASK 15: A green affected-only `pull_request` CI run at the base sha settles verdict `none` (source `ci`) while the failing tests are red on `dev` — open
  - TASK 16: The `all` loop reason reads as if the base-red tests explain the whole red gate, but a gate can also be red on a non-test stage (coverage threshold, a static check after the unit run) that `tests base` cannot see — open
  - TASK 17: A base file run that crashes (non-zero exit, report written without the failing case, e.g. a load error in the fresh checkout) counts the case `absent`, so the verdict reads `none` and the pause says "the failures come from this branch" — open
  - TASK 18: `withoutHooks` wraps the whole base run, so `GIT_CONFIG_COUNT` / `core.hooksPath=/dev/null` leaks into the install and every base test process; a test that drives git hooks fails at base only and reads `red`, turning a branch-caused failure into `all` — open
  - TASK 19: A `Gate: FAIL` line smuggled into a pause item's text makes a resume close a non-gate pause (a challenge or verify-gap pause with hard blockers) as "Re-run gate" and continue without the owner's answer — open

## The work

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** A green affected-only `pull_request` CI run at the base sha settles verdict `none` (source `ci`) while the failing tests are red on `dev`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:204` · **Round:** 1
  - **DONE WHEN:** `tests base` calls `shipGate` with `event: "push"`, so only a push-event run at the exact base sha (a full run per `docs/testing.md` `pr-affected-only` row: "A PR runs ... unit ... for affected packages. A push runs everything.") can settle `none`; a `pull_request` or `workflow_dispatch` run at that sha falls back to the local run.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a pull_request-event CI run at the base sha does not settle none` fails on `source` reading `ci` and verdict `none` for a green `event: "pull_request"` run at the base sha whose failing case is red in the local base run (expected `source` `local`, verdict `all`, one install run)

<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** The `all` loop reason reads as if the base-red tests explain the whole red gate, but a gate can also be red on a non-test stage (coverage threshold, a static check after the unit run) that `tests base` cannot see
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:181` · **Round:** 1
  - **DONE WHEN:** The owner chose to narrow the claim with no change to the gate script contract (`build-decision-1-3.md`, refined 2026-11-10). With verdict `all`, `decisions compose --base-check` (`.bkit/core/engine/commands/workflow/decisions.ts:473`) still recommends `Stop` (Success Criterion 2), and its reason claims only the failing tests: they all fail on the base commit too, so no round here can fix them. The reason adds one sentence: if the gate is still red after `dev` is fixed and the run resumed, the rest comes from this branch, and the resume's gate re-run shows it. The reason never says or implies that those tests are the gate's only failure. `tests base` is unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check all says a gate still red after resume comes from this branch` fails on the `all` reason lacking the sentence that a gate still red after `dev` is fixed and the run resumed comes from this branch, while the recommendation stays `Stop`

<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->

- [ ] **TASK 17:** A base file run that crashes (non-zero exit, report written without the failing case, e.g. a load error in the fresh checkout) counts the case `absent`, so the verdict reads `none` and the pause says "the failures come from this branch"
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:265` · **Round:** 1
  - **DONE WHEN:** `baseRun` keeps each file's `runTestFile` `exitCode`, and a case missing from a file run that exited non-zero reads `atBase: "unknown"` (verdict `unknown` with a reason naming the base run's exit), while a case missing from a file run that exited 0 still reads `absent`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a base file run that exits non-zero without the failing case reads unknown` fails on verdict `none` with `atBase: "absent"` when the base runner writes an empty `<testsuite>` report and exits 1

<!-- bkit:task 17 end -->

<!-- bkit:task 18 start -->

- [ ] **TASK 18:** `withoutHooks` wraps the whole base run, so `GIT_CONFIG_COUNT` / `core.hooksPath=/dev/null` leaks into the install and every base test process; a test that drives git hooks fails at base only and reads `red`, turning a branch-caused failure into `all`
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:247` · **Round:** 1
  - **DONE WHEN:** Hooks are off only for the git calls that manage the base checkout (for example `-c core.hooksPath=/dev/null` on `worktree add`), the install and the `runTestFile` children see the same environment the gate saw, and `withCleanup` still wraps the synchronous body.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > the base test run does not inherit the hooks-off git config` fails on verdict `all` for a base case that passes only when `GIT_CONFIG_COUNT` is unset (expected `none`)

<!-- bkit:task 18 end -->

<!-- bkit:task 19 start -->

- [ ] **TASK 19:** A `Gate: FAIL` line smuggled into a pause item's text makes a resume close a non-gate pause (a challenge or verify-gap pause with hard blockers) as "Re-run gate" and continue without the owner's answer
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:583` · **Round:** 1
  - **DONE WHEN:** `decisions apply --by=rerun` (`decisions.ts:583`) and `openDecision` (`workflows.ts:296`, `field("Gate")`) read `Gate:` only from the decision file's header block (the lines before the first blank line that `compose` writes), so a `Gate: FAIL` line in an item's title, question or reason never marks a pause as a red-gate pause; and `composeItems` collapses CR/LF in item `title`, `question`, `reason` and `noRecommendation` to spaces, so no item text can start a new line that mimics a header. Today both readers use a multiline `^Gate:` regex over the whole file, and `composeItems` keeps embedded newlines, so an item question such as `"…\nGate: FAIL"` (item text the orchestrator builds from verify and challenge findings, which come from diff and tracker text) yields `openDecision.gate` = `FAIL`; the Contract **Resume** route then runs `apply --by=rerun`, which writes `Status: DECIDED` with only a Q1 `Re-run gate` line, and Step 12 or Step 8 continues without asking — the owner's pending items (including CRITICAL challenge hard blockers) are never answered.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > refuses a file whose only Gate: FAIL line is in an item body` fails on a file composed without `--header=Gate=FAIL`, whose item question holds `"Fix it?\nGate: FAIL"`, being rewritten to `Status: DECIDED` with exit 0 instead of a usage error naming the missing `Gate: FAIL` header and the file left byte for byte unchanged
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows start — resume facts > openDecision gate ignores a Gate line below the header` fails on `openDecision.gate` reading `"FAIL"` instead of null for an OPEN pause file with no `Gate:` header and a body line `Gate: FAIL`

<!-- bkit:task 19 end -->
