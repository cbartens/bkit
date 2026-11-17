# Build Gate Pause: Base-Commit Evidence and Resume Re-Run Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

When `/bkit-build` pauses because a group gate or the final test run is red, the owner is told whether those failing tests also fail on the commit the branch started from. The recommendation follows from that: `Stop` and fix `dev` when no round here can help, or `Try again` when a round can. After the owner fixes `dev` and resumes, the build re-runs the red gate and carries on if it's now green, instead of looping on the old pause.

### Success Criteria

1. At a pause after a red group gate (Step 8) or a red final run (Step 12), the pause says how many failing tests also fail on the base commit: all, some, none, or "can't tell" with the reason.
2. When all failing tests are also red on the base commit, the pause recommends `Stop` and tells the owner to fix `dev` first. In adopt mode it also tells them to merge `dev` into the branch before resuming. `Try again` is still offered in every case.
3. The pause's "problems after each round" numbers include the group gate's failing tests, so a red gate never shows as "0 → 0".
4. Resuming into a pause about a red gate re-runs that gate first. If it passes, the build continues without asking. If it's still red, the pause is asked again with fresh numbers.
5. A group-gate or final-run failure is never offered as an `Accept` item, and the verify agent doesn't log gate failures as verify gaps.

### Process Sketch

- **WHEN** the build pauses after a red group gate or a red final run **→ THEN** the pause counts the gate's failing tests in each round's numbers and says how many of them also fail on the base commit: all, some, none, or "can't tell" with the reason.
- **IF** every failing test also fails on the base commit **→ THEN** the pause recommends `Stop`, says no round here can fix them and tells the owner to fix `dev` and resume, adding the merge-`dev` sentence in adopt mode; `Try again` is still offered.
- **IF** only some fail on the base commit **→ THEN** the pause says how many a round can fix and how many will still stop the build.
- **IF** the base check cannot decide (no JUnit report, no `bkit:test:file`, no base run possible) **→ THEN** the trend rule recommends, and the pause says the cause is unknown and why.
- **WHEN** the owner resumes into a pause about a red gate **→ THEN** the build re-runs that gate first: green continues without asking, red asks the pause again with fresh numbers.
- **WHEN** any pause follows a red gate or suite **→ THEN** it holds no `Accept` item for a failing test, and the group-mode verify agent logs no gap for one.

### Concrete Example

**Setup:** The owner runs `/bkit-build` in adopt mode (`RUNTIME_WORKTREES=false`, working on the branch in place) on a consumer repo. The branch started from a `dev` commit whose unit tier has 3 red tests in 2 files: a dead-code registry missing two new files, and a suppression-count ceiling that was not raised. No CI run exists at that commit.

**Steps:**

1. The build builds and verifies task group 1 → verify passes, and the group gate exits 1 with 3 failing tests.
2. A fix round (Step 9) changes no source file → the build reaches the Decision Pause, runs `bkit tests base` on the 2 failing files in a detached checkout of the base commit, and all 3 tests fail there too.
3. The owner reads the pause → it shows `Problems after each round: 3 → 3`, `Also red on base {sha}: 3 of 3 (local run)`, options `Try again` / `Stop`, and recommends `Stop`: "these 3 tests fail on `dev` too; no round here can fix them. Fix `dev`, then resume." plus "merge `dev` into the branch before resuming." No `Accept` item appears.
4. The owner answers `Stop` → the build writes its handover and releases its lock.
5. The owner fixes `dev`, merges `dev` into the branch and runs `/bkit-build` again → the resume records `Decision: Re-run gate` on the open pause and re-runs group 1's gate, which passes.

**Outcome:** The build continues to group 2 without asking, and groups 2-6 build. The run never returns to the old pause.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| **some** → say so: "a round can fix 2 of 5; the build will still stop on the 3 from `dev`." The owner chooses between `Try again` and stopping now. | The pause prints that sentence with the real counts; the loop question keeps both options, and its recommendation follows the trend rule (Open Question Q1). |
| **can't tell** (no JUnit report, no `bkit:test:file` script, no base run possible) → today's trend rule, and say the cause is unknown. | Verdict `unknown` with a reason; the loop question recommends by the trend rule and its reason says `cause unknown: {reason}`. |
| Never use "the last CI run on `dev`" as evidence. Most bkit commits are `[skip ci]`, so that run is often many commits old. | Only a CI run at the exact base sha is read; any other run is ignored. |
| A completed `success` CI run exists at the exact base sha, with no skipped lane. | Verdict `none`, source `ci`; no local run, no detached checkout. |
| A CI run at the base sha is red, still running, or skipped a lane. | The CI result is not used; the failing files run locally at the base commit. |
| A failing test's file does not exist at the base commit. | Its cases count as caused by the branch. |
| A failing case passes, or is absent, in its file's run at the base commit. | That case counts as caused by the branch. |
| A failing case's file cannot be resolved (no `file` attribute, a `classname` that is no repo path and matches no single tracked basename). | That case is undetermined; with 0 base-red cases the verdict is `unknown` (reason names the unresolved case count). |
| The gate's `failures` count is null (the runner crashed before writing a report). | The round's progress count reads `?`, the trend reads `stuck`, and the base check returns `unknown` with reason `no JUnit report`. |
| The frozen install at the base commit fails (the store lacks a package and the network is off). | Verdict `unknown` with reason `base install failed (exit N)`; the detached checkout is removed. |
| The run is interrupted (SIGINT / SIGTERM) during the base run. | The detached checkout is removed before the process exits. |
| A holistic, challenge, unproven or summary pause. | No base check and no `Gate: FAIL` header; the pause behaves as today. |
| Resume into an open pause without a `Gate: FAIL` header (an older pause file, or a non-gate pause). | It is asked again as today. |
| The re-run gate on resume is still red. | The build goes straight to the Decision Pause with fresh round numbers and a fresh base check; no fix round runs first. |
| Resume in worktree mode. | Step 2's `bkit worktrees setup` rebases the branch onto `dev` first, so the re-run gate sees the fix; adopt mode gets no rebase or merge, only the pause's merge-`dev` sentence. |
| `--base-check` points to a missing file or a file that is not the verb's JSON shape. | `decisions compose` exits with a usage error, and the workflow takes the Failure Path. |
| `decisions apply --by=rerun` on a decision file without `Gate: FAIL` or not `Status: OPEN`. | Usage error, nothing written. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. Unit files may drive real `git` and the `pnpm.cjs` gate fixture in an `os.tmpdir()` folder (`Unit (boundary: real temp git repo)`); spawning `bkit` through `tsx` is Integration. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `parseJunit` keeps each case's `classname` and `file` attribute | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| a prefer-offline frozen install adds `--prefer-offline` after `--frozen-lockfile` | Unit | `.bkit/core/engine/shared/package-manager.test.ts` | 2 |
| verify loop progress adds the group gate's failing tests to each round (`3 → 3`, never `0 → 0`) | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a red gate row with a null failure count makes the round `?` and the trend `stuck` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a verify round whose gate did not run adds no gate failures | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| `decisions compose --loop=verify` prints the group gate's failing tests per round | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 3 |
| verdict `all` when every failing case also fails at base | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| verdict `some` with base-red and branch counts | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| verdict `none` when each case passes, is absent, or its file is absent at base | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| verdict `unknown` with a reason when 0 cases are base-red and one is undetermined | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| a case's file resolves from `file`, then a `classname` repo path, then one matching tracked basename | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| a `classname` matching two tracked basenames leaves the case undetermined | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| `bkit tests base` reports `all` from a local run at the merge-base, through a real temp git repo and the gate fixture | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a failing file absent at the base commit makes its cases the branch's (`none`) | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a `success` CI run at the exact base sha with no skipped lane settles `none` (source `ci`) with no worktree added | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a CI run at the base sha that skipped a lane falls back to the local run | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| no JUnit report under `{log}.reports` → `unknown` "no JUnit report" | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| `bkit:test:file` undeclared → `unknown` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a failed base install → `unknown` "base install failed" and the detached worktree removed | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| the base install runs `install --frozen-lockfile --prefer-offline` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| the output's `adopt` follows the run's `runtimeWorktrees` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| `--base-check` verdict `all` with no items recommends `Stop` and says the tests fail on `dev` too | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| `--base-check` verdict `all` with items recommends `Decide` with the same reason | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| adopt mode adds "merge `dev` into the branch before resuming." | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| verdict `some` names how many a round can fix and how many come from `dev` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| verdict `none` keeps the trend recommendation and says the failures come from this branch | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| verdict `unknown` keeps the trend recommendation and says `cause unknown: {reason}` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| `Try again` is an option for every verdict | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| a `--base-check` file that is not the verb's JSON shape is a usage error | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 6 |
| `decisions apply --by=rerun` writes `Decision: Re-run gate` under Q1 and sets `Status: DECIDED` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `apply --by=rerun` refuses a file without `Gate: FAIL` or not `Status: OPEN`, writing nothing | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `openDecision` returns `gate` from the `Gate:` header | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| `openDecision` returns `gate: null` for a pause file without the header | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| the Decision Pause runs `tests base` and passes `--base-check` and `Gate=FAIL` only for a red-gate or `TESTS_LOOP` pause | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |
| Step 9's no-progress route after a red gate sets `PAUSE_LOOP` = `verify` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |
| the Decision Pause writes no item for a gate or suite failure and offers only the file's options | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |
| a resume into a `Gate: FAIL` pause runs `apply --by=rerun`, finishes `build-decision` and re-runs Step 8 or Step 12 | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 10 |
| a re-run gate that is still red goes straight to the Decision Pause (Steps 8 and 12) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 10 |
| group-mode verify logs no gap for a test the group gate runs; holistic mode keeps the #889 rule | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 11 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

No breaking change. Every CLI and type change adds; a decision file written before this change resumes as it does today.

**New names:**

<!-- prettier-ignore -->
| Name | Kind | Notes |
| --- | --- | --- |
| `bkit tests base` | CLI verb (`use: workflow`) | Flags `--log`, `--file`, `--workflow`, `--out`; output `verdict`, `reason`, `base`, `source`, `failing`, `baseRed`, `branch`, `undetermined`, `adopt`, `cases`. |
| `.bkit/core/engine/commands/workflow/tests-base.ts` | engine file | Exports `testsBaseVerb`, `caseFile`, `baseVerdict`. |
| `decisions compose --base-check=<json>` | CLI flag | Reads the `tests base` output. |
| `decisions apply --by=rerun` | CLI flag value | Joins `headless` and `owner`. |
| `Gate: FAIL` | decision-file header | Written only on a pause after a red group gate or a red final run. |
| `Decision: Re-run gate — …` | decision-file line | Written by `apply --by=rerun` under Q1. |
| `openDecision.gate` | `workflows start` output field | `FAIL` or null. |
| `GATE_RERUN`, `GATE_LOG`, `{BASE_FLAGS}` | workflow-held values | Build workflow only. |
| `JunitCase.classname`, `JunitCase.file`; `LoopProgress.gateCounts`, `rounds[].gateFailures`; `latestRuntimeRow` | engine types and helper | Internal. |

**Behaviour changes a consumer sees:**

- The verify loop's `Problems after each round` numbers now include the group gate's failing tests, so the trend (and the recommendation) can change on the same history.
- A no-progress fix round after a red group gate now pauses with the loop question (`PAUSE_LOOP` = `verify`) instead of a decision file with no question.
- A resume into a `Gate: FAIL` pause re-runs the gate instead of asking the stale question.
- Group-mode verify no longer logs a gate-run test failure as a gap unless a task's `DONE WHEN` or `TEST FIRST` names that test.
- `.bkit/workflows.md` § Group gate no longer invites an exception mechanism for red gates.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1:** What does the loop question recommend when only some failing tests also fail on the base commit? → The owner decides at plan review.
  - **Options:** A) The trend rule, with the "a round can fix X of N; the build will still stop on the Y from `dev`" sentence as the reason's lead — a headless run still has a recommendation to take, and the owner sees the split · B) No recommendation — matches "the owner chooses" most literally, but a loop question without one is a hard blocker, so a headless run goes to the Failure Path at every such pause · C) Always `Try again` — fixes the branch's share first, but recommends a round even when the trend says the round is stuck.
  - **Recommended:** A) The trend rule — the split is shown either way, and only A keeps headless runs moving without overriding the trend.
  - **Default if unanswered:** A.
- **Open Question Q2:** What does the loop question recommend when none of the failing tests fail on the base commit? → The owner decides at plan review.
  - **Options:** A) The trend rule, with the reason "the failures come from this branch" — keeps the existing stuck/closing logic · B) Always `Try again` — every failure is the branch's, but a stuck round would be recommended again.
  - **Recommended:** A) The trend rule — the base verdict says a round *can* help, the trend says whether the last one *did*.
  - **Default if unanswered:** A.
- **Open Question Q3:** Which install does the base run use? → The owner decides at plan review.
  - **Options:** A) `pnpm install --frozen-lockfile --prefer-offline` — takes packages from the local store and downloads only what is missing · B) `pnpm install --frozen-lockfile --offline` — never touches the network, but fails (verdict `unknown`) whenever the store lacks a package only the base commit uses · C) `pnpm install --frozen-lockfile` — always checks the registry, slowest.
  - **Recommended:** A) `--prefer-offline` — the issue's ~8 s measurement was an offline-store install; A keeps that speed and still works when the store is missing an old version.
  - **Default if unanswered:** A.
- **Open Question Q4:** How does a resume record that it re-ran the gate instead of asking? → The owner decides at plan review.
  - **Options:** A) `decisions apply --by=rerun` writes `Decision: Re-run gate — the owner resumed the run, so the gate runs again first ({date})` under Q1 and sets `Status: DECIDED` — no new status; `statusOf`, `pending` and the build summary stay as they are · B) A new `Status: RERUN` with a `Re-run:` line — distinct in the file, but `statusOf`, `apply`, `pending` and the build summary's "no decision recorded" check (`.bkit/core/engine/commands/workflow/summary.ts`) all have to learn it.
  - **Recommended:** A) — the resume is an answer to the pause's question, so it belongs on a `Decision:` line, and nothing else changes.
  - **Default if unanswered:** A.
- **Assumption:** The group gate runs only when verify passed (Step 8 sub-step 8 is reached only with `VERIFY_VERDICT` = PASS), so a pause after a red gate holds no verify gap items → if wrong, a red-gate pause can also hold gap items; the compose still works (it recommends `Decide` instead of `Stop` with items), so only the wording changes.
- **Assumption:** The gate's `{log}.reports` folder under `{OUTBOX}` still exists when the Decision Pause composes in the same session → if wrong, every base check reads `unknown` "no JUnit report" and the pause falls back to today's trend rule.
- **Assumption:** The consumer's JUnit reports carry a `file` attribute or a `classname` that resolves to a tracked file (Vitest writes the file path as `classname`; bats writes the file's name) → if wrong, cases stay undetermined and the verdict reads `unknown`, never a wrong `all`.
- **Assumption:** `bkit:test:file {file}` at the base commit runs one file and writes JUnit to `$BKIT_TEST_REPORT`, as `docs/testing.md` § Test first (**Declare `bkit:test:file`**) requires → if the base commit's `package.json` lacks the script, the verdict reads `unknown` with that reason.
- **Assumption:** `shipGate`'s query of GitHub Actions at a sha is unchanged and already proven by `/bkit-ship`; this plan's tests reach it through the `tests/fixtures/gh/bin/gh` stub, and bkit has no `@live` tier → if the real query shape drifted, `/bkit-ship` would break first; the base check would read a wrong CI verdict only when the stub and GitHub disagree.
- **Assumption:** A headless pause that takes the `Stop` recommendation routes as today (Decision Pause step 6 sets the `verify` or `tests` route from `From:`) → if wrong, a headless run with verdict `all` re-runs the red gate until its loop limit sends it to the Failure Path, which costs rounds but builds nothing wrong. Listed under Suggested Scope Expansion.
- **Assumption:** A base run costs about 8 s in bkit (1 s checkout, 2 s install, 5 s per test file) and runs once per pause, not once per round → if a consumer's install is far slower, each red-gate pause waits for it; the cost is bounded by one install plus the failing files.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Rejected path | Why rejected |
| --- | --- |
| Accept red tests and build past them (accepted-failure records, `$BKIT_ACCEPTED_TESTS` through every runner and the pre-push hook) — the superseded plan | The owner dropped it: CI on the PR runs the same red tests, so `/bkit-ship` still cannot merge until `dev` is fixed. Its three decision rows are `SUPERSEDED`. |
| Rebase or merge `dev` into the branch on resume in adopt mode | The owner ruled it out; the pause text tells the owner to merge instead. |
| Use the latest CI run on `dev` as evidence | Most bkit commits are `[skip ci]`, so that run is often many commits old. Only a run at the exact base sha counts. |
| Re-run the whole gate at the base commit | Runs every static and unit check instead of the failing files, and a static failure has no per-test identity to compare. |
| Let `decisions compose` run the base check itself | Puts git, gh and an install inside a verb that today only writes a file; a separate `tests base` verb keeps the evidence in its own JSON that the pause log keeps. |
| Show gate failures only as an extra line, outside the round counts | The trend and the recommendation would still ignore the gate, so SC3 would fail. |
| A new `Status: RERUN` for the resume | Q4 B: `statusOf`, `apply`, `pending` and the build summary would all need to learn it. |
| Settle `all` / `some` from a red CI run at the base sha | CI keeps no per-test list bkit can read; deferral `891-ci-junit-artifact-settles-red-base-runs`. |

**Recommendations for a later phase:** reuse `bkit tests base` at `/bkit-ship`'s CI wait as advice only (`891-ship-base-red-notice`), and decide separately whether `/bkit-debug` can label base-red failures (`891-debug-base-red-label`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The base-commit check at `/bkit-debug`'s Loop Question | No Success Criterion or matrix row needs it, and the issue declares it out of scope: debug often runs to fix exactly a base-red failure, so a "came from `dev`" label would be wrong when that failure is the job. | Deferral `891-debug-base-red-label` (`scope-declared`, citing the issue comment's Out of scope line). |
| A base-red notice at `/bkit-ship`'s CI wait | No Success Criterion or matrix row needs it, and the issue declares it out of scope: ship still needs green CI as today. | Deferral `891-ship-base-red-notice` (`scope-declared`, citing the same line). |
| Settling `all` / `some` from a red CI run at the base sha via published JUnit artifacts | The issue's scope asks only for "a CI run on that exact commit" when one exists; a passing run settles `none` here, and every other case runs locally, so every criterion is met without it. It is plan-sized: it changes the shipped CI template to upload reports, adds a `gh run download` reader and a mapping from CI cases to gate cases. | Deferral `891-ci-junit-artifact-settles-red-base-runs` (`own-cycle`). |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| A headless pause that takes `Stop` on the loop question has no Stop route: Decision Pause step 6 routes it by `From:` (re-run Step 8 or Step 12), so a headless run with verdict `all` re-runs the red gate until its loop limit sends it to the Failure Path. | This plan's investigation (Decision Pause steps 3, 5-7) | Decision Pause step 6 routing; Task 9 | Needs a design decision: route a headless `Stop` to the Failure Path at once, or to step 8's handover. More frequent once `all` recommends `Stop`. |
| `decisions compose` writes a decision file with no question when called with no items and no `--loop`, which is what Step 9's no-progress route did after a red gate. | This plan's investigation (`compose` verb) | `decisions.ts` `compose`; Task 6 | Fold in only as a guard (usage error on zero questions) if the owner wants one; Task 9 already removes the one known caller that produced it. |
| A runner-less test file needs one JUnit case per planned test name. | `docs/deferrals.jsonl` `891-runner-less-tests-need-one-junit-case-per-test-name` | JUnit case identity read by `parseJunit` and `tests base` | Keep deferred; unrelated to the pause, per the issue. |
| Completeness check charges build Step 8's tasks tick to the next step when no group-gate row follows. | `docs/failures.jsonl` `status-holes-tasks-tick-between-two-finish-lines` | Step 8 group-gate rows; Task 10 adds a second `build-group-gate` row per attempt on a resume re-run | Keep separate; check the completeness report on a resumed run during the build. |
| A Decision Pause composed before a step renumber resumes with its old `Pause step`. | `docs/deferrals.jsonl` `705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279` | `openDecision` in `workflows.ts`; Task 8 | Keep deferred; this plan adds a field and no renumber. |
| The "start a new run?" test keys on the last run overall, not the last run of this workflow. | `docs/deferrals.jsonl` `58-status-jsonl-run-boundary-keys-on-last-run-overall` | Resume and `openDecision` run selection; Task 10 | Keep deferred; a resume re-run reads the same run boundary as today. |
| Load-sensitive test budget under the full gate. | #814 (open) | The new spawn-heavy `tests-base` suites; Tasks 4-5 | Keep separate; the new suites use `tierTimeouts(true).testTimeout` as the knowledge row asks. |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable.
- [x] **User Input** — the new flags (`tests base --log/--file/--workflow/--out`, `compose --base-check`, `apply --by=rerun`) are validated in their handlers; `--base-check`'s JSON shape is checked before use, and a bad file is a usage error. Test file paths come from JUnit reports and are used only when they are tracked files (`git ls-files`), so a report cannot point the runner outside the repo.
- [ ] **PII** — not applicable: logs carry test names, file paths and shas only.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable: the CI lookup reuses `shipGate`'s read-only `gh` query with the existing login.

The base run executes the base commit's own `bkit:test:file` script and install in a detached checkout. That is the same code the owner's `dev` already runs, under hooks off (`withoutHooks`), and the checkout is always removed.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** No package is added or removed. `--prefer-offline` is a flag of the existing `pnpm` runner, and `pnpm-lock.yaml` stays as it is.
- [ ] **Dependency Versions:** Node v24.16.0, pnpm 10.34.7, gh 2.102.0 and git 2.56.0 are installed. `pnpm bkit:deps:outdated` lists only dev dependencies (oxlint-tsgolint 7.0.2004 → 7.0.2005, oxlint 1.89 → 1.90, @types/node 24.19.2 → 26.6.6, vite 6.4.5 → 8.3.5); none blocks this plan's build.
- [ ] **Existing-Solution Search (reuse over duplicate):** The searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** Every file the runbook reads or changes was opened in this worktree (`/Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck`). The owner's answers to Q1-Q4 are the only missing input; each has a default.
- [ ] **Project Context:** The `docs/decisions.jsonl` rows keyed `891-*` were read (the three accepted-failure rows are `SUPERSEDED`), as were the `891-*` deferral rows and knowledge rows on `dist/` staleness (`kn-7-dist-staleness-pnpm-build-must-run-before-push-for-bk`) and spawn-heavy unit suites (`spawn-heavy-unit-suite-needs-its-own-budget-under-load`).
- [ ] **Testing & Quality:** The tiers follow `docs/testing.md` § Which tier does a behaviour need? and § Tiers: pure logic at Unit, the verb through `tsx` at Integration, real temp git repos with the `useGateRunner` fixture and the gh stub, and no mocking library. Spawn-heavy unit suites use `describe(..., { timeout: tierTimeouts(true).testTimeout })` from `vitest.timeout-budget.ts`.
- [ ] **Prerequisite Plans:** None. The #889 holistic-loop change (`6fc6a44b8`) is already on `dev` and in this branch.

### Conditional

- [ ] **Secrets & Env Vars:** Not applicable. The CI lookup uses the `gh` login the workflow already has; no new secret.
- [ ] **Schema State:** Not applicable. bkit has no database; `status.jsonl` rows are read, and no new row type is written.
- [ ] **Architecture & UI:** `docs/architecture.md` places `bkit <noun> <verb>` workflow commands in `.bkit/core/engine/commands/workflow/`, which holds the new `tests-base.ts`. No UI.
- [ ] **Observability:** The base check narrates through the verb's log callback and its JSON output; no new log name, span or audit table (`docs/observability.md`).
- [ ] **Notifications:** Not applicable. The pause text is the decision file the workflow already prints.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database, and `docs/data-schema.md` describes none of the files this plan touches. The plan reads existing `status.jsonl` rows (`test-run`, `runtime-resolved`, `step-done`) whose shapes `.bkit/workflows.md` and `.bkit/jsonl.md` own, and adds no row type or field.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Name each failing JUnit case's file | `.bkit/core/engine/commands/workflow/tests.ts` | references to `parseJunit` / `JunitCase`; `grep -n 'classname' .bkit/core/engine/commands/workflow/tests.ts` | `parseJunit` — reads `name`, `state`, `message`, `detail`; drops `classname` and `file` | EXTEND | Add `classname` and `file` to `JunitCase`, parsed from the same `<testcase>` tag. |
| Run one test file and read its cases | `.bkit/core/engine/commands/workflow/tests.ts` | references to `runTestFile`; `grep -n 'BKIT_TEST_FILE_SCRIPT'` in the workflow commands | `runTestFile(top, test, log)` — runs `bkit:test:file` with `$BKIT_TEST_REPORT` and parses the report; private | EXTEND | Export it; the base run calls it with the base worktree as `top`. |
| Install dependencies offline-first | `.bkit/core/engine/shared/package-manager.ts` | `grep -rln -e prefer-offline -e preferOffline .bkit/core/engine` (no hit); references to `installCommand` | `installCommand({frozen})` — no offline-first flag | EXTEND | Add an optional `preferOffline` that appends `--prefer-offline`. |
| Run the frozen install in a checkout | `.bkit/core/engine/commands/workflow/worktrees.ts` | references to `installCommand`; `grep -n 'function install'` in `worktrees.ts` | `install(wt, log)` — spawns the frozen install, logs the tail on failure; private | EXTEND | Export it with an optional `{ preferOffline }` passed to `installCommand`. |
| Copy `worktreeCopy` entries into a checkout | `.bkit/core/engine/commands/workflow/worktrees.ts` | references to `readBkitConfig().worktreeCopy`; `grep -n 'function copyListed'` | `copyListed(root, wt, entries, log)` — skips bkit's own env and paths outside the checkout; private | EXTEND | Export it unchanged. |
| Remove a temporary checkout on every exit, signals included | `.bkit/core/engine/commands/ci/ci.ts` | `grep -rln '"--detach"' .bkit/core/engine` (`ci/ci.ts`, `land.ts`); references to `withCleanup`, `dropLandTree` | `withCleanup(body, cleanup)` in `ci/ci.ts` (private); `dropLandTree` and `withoutHooks` in `land.ts` (exported) | EXTEND | Export `withCleanup`; call `dropLandTree` and `withoutHooks` as they are. |
| Read the run's worktree mode | `.bkit/core/engine/commands/workflow/runtime.ts` | `grep -rn 'runtimeWorktrees' .bkit/core/engine` | the `runtime assert` verb filters the latest `runtime-resolved` row inline | EXTEND | Extract that filter as an exported `latestRuntimeRow(file, workflow)`, used by `runtime assert` and `tests base`. |
| CI verdict at an exact sha | `.bkit/core/engine/commands/workflow/runs.ts` | references to `shipGate`; `grep -n 'head_sha'` in `runs.ts` | `shipGate(o, gh, log)` — queries Actions at `o.head`, reports `passed` and skipped lanes | EXTEND | Called as is with `head` = the base sha; no change to `runs.ts`. |
| The branch's base commit | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -rln 'merge-base' .bkit/core/engine`; references to `devBase` | `devBase(cwd, log)` — the `dev` ref; `git merge-base` callers in `ci/ci.ts`, `branches.ts` | EXTEND | `devBase` called as is; `git merge-base HEAD {devBase}` in the new verb. |
| Classify failing cases against the base run and run it | `.bkit/core/engine/commands/workflow/tests-base.ts` | `grep -rn -e 'base commit' -e merge-base .bkit/core/engine/commands/workflow/tests*.ts` (no hit); `docs/capabilities.md` (no base-run capability); references to `testsCommand` verbs | None — no verb runs failing tests on another commit | NEW | (a) The searches find no candidate; the file follows the `tests-changed.ts` verb-file pattern and registers in `testsCommand`. |
| Unit tests of the classification | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | `ls .bkit/core/engine/commands/workflow/tests-*.test.ts` | None for the new module | NEW | (a) A new module has no test file; tier suffix per `docs/testing.md` § Tiers. |
| Integration tests of the verb | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/tests-*.integration.test.ts` | None for the new verb | NEW | (a) A new verb has no integration file. |
| Pass script arguments through the gate fixture | `tests/fixtures/gates/pnpm.cjs` | `grep -n 'sh", \["-c"' tests/fixtures/gates/pnpm.cjs`; references to `useGateRunner` | `pnpm.cjs` — runs a script through `/bin/sh -c` and drops extra arguments | EXTEND | Append the extra arguments as `pnpm` does, so `bkit:test:file {file}` gets its file. |
| Gate failures in the verify loop's progress | `.bkit/core/engine/commands/workflow/counters.ts` | references to `loopProgress`, `loopTrend`; `grep -rn '"test-run"' .bkit/core/engine` | `loopProgress` — counts `failures` from the check step's rows only | EXTEND | Optional gate step prefix; add the latest same-attempt `test-run` row's `failures`. |
| Loop config and the pause's wording | `.bkit/core/engine/commands/workflow/decisions.ts` | references to `LOOPS`, the `compose` and `apply` verbs | `LOOPS.verify`; `compose` (loop question, progress block); `apply --by=headless\|owner` | EXTEND | `LOOPS.verify.gate`; `compose --base-check`; `apply --by=rerun`. |
| Tell a resume the pause was about a red gate | `.bkit/core/engine/commands/workflow/workflows.ts` | references to `openDecision`, `OpenDecision` | `openDecision` — reads header fields of the open pause file | EXTEND | Add `gate` from the `Gate:` header. |
| Route the pause and the resume | `.bkit/core/workflows/bkit-build.md` | `grep -n -e 'Decision Pause' -e PAUSE_LOOP -e openDecision` in the workflow | Decision Pause steps 2 and 6, Contract **Resume**, Steps 8, 9, 12 | EXTEND | Base check before compose, `Gate=FAIL` header, Step 9 `PAUSE_LOOP`, resume re-run, `GATE_RERUN` routes, item wording. |
| Keep gate failures out of verify gaps | `.bkit/core/prompts/bkit-build-plan-verify.md` | `grep -n -e Group -e Holistic -e gap` in the prompt | Process step 6 (Group mode) | EXTEND | One group-mode rule; holistic step 7 unchanged. |

## Architecture & Component Changes

**Ledger rows:** `891-base-commit-check-at-the-decision-pause`, `891-verify-loop-progress-counts-group-gate-tests`, `891-resume-reruns-a-red-gate-pause`, `891-gate-failures-never-pause-items`, `891-debug-base-red-label`, `891-ship-base-red-notice`, `891-ci-junit-artifact-settles-red-base-runs`

### Database Migrations

None. bkit has no database.

### Engine — tests

The new `bkit tests base` verb and the JUnit and runner pieces it needs.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** the file exists; `JunitCase` (line 543), `parseJunit` (line 582), private `runTestFile` (line 1122) and `testsCommand` (line 1622, verb map at line 1627).
- `JunitCase` gains `classname: string | null` and `file: string | null`, read from the `<testcase>` tag's `classname` and `file` attributes.
- `runTestFile` is exported unchanged.
- `testsCommand.verbs` registers `base: testsBaseVerb`.

#### [new] `.bkit/core/engine/commands/workflow/tests-base.ts`

- **Reuse Check:** `Reuse Inventory` row "Classify failing cases against the base run and run it", reason (a).
- Exports `testsBaseVerb: VerbSpec` (pattern of `testsChangedVerb` in `tests-changed.ts`), plus the pure helpers `caseFile(c, tracked)` and `baseVerdict(cases)` for unit tests.
- Flags: `--log` (required, the gate log; reports are read from `{log}.reports`), `--file` (required, `status.jsonl`), `--workflow` (required), `--out` (optional; writes the output JSON there for `decisions compose --base-check`). Each flag is validated in the handler; a missing required flag is `EXIT.USAGE`.
- Steps: read failing cases (`failure` / `error`) from every JUnit file in `{log}.reports` → resolve each case's file (`file` attribute, then a `classname` that is a tracked path, then a `classname` matching exactly one `git ls-files` basename, else undetermined) → base sha = `git merge-base HEAD {devBase(cwd)}` → `shipGate({ root, head: base }, gh, log)`: passed with no skipped lane → verdict `none`, source `ci`, no local run → else a local run: `withCleanup` around `withoutHooks` + `git worktree add -q --detach {tmp} {base}` in an `os.tmpdir()` folder named `bkit-base-*`, `copyListed(mainCheckoutRoot(cwd) ?? top, tmp, worktreeCopy, log)`, `install(tmp, log, { preferOffline: true })` when `worktreeInstall` is on and `package.json` exists, `runTestFile(tmp, file, log)` per resolved file present at base, and `dropLandTree(top, tmp)` as the cleanup.
- Output (also written to `--out`): `verdict` (`all | some | none | unknown`), `reason` (string, or null for `all` / `some` / `none`), `base` (sha or null), `source` (`ci | local | null`), `failing`, `baseRed`, `branch`, `undetermined` (counts), `adopt` (`runtimeWorktrees` = false on the run's latest `runtime-resolved` row, via `latestRuntimeRow`), `cases` (`{name, file, atBase: red | pass | absent | unknown}`).
- Exit 0 for every verdict; only usage errors exit non-zero. `unknown` reasons: `no JUnit report`, `bkit:test:file not declared at the base commit`, `no base commit`, `base checkout failed`, `base install failed (exit N)`, `N case(s) with no resolvable file`, `no report from the base run`.

### Engine — shared helpers

Small exports and one option so the base run reuses what setup, landing and the CI slop check already do.

#### [MODIFY] `.bkit/core/engine/shared/package-manager.ts`

- **Existence Check:** the file exists; `installCommand` at line 23.
- `installCommand(opts: { frozen: boolean; preferOffline?: boolean })` appends `--prefer-offline` when `preferOffline` is true. Existing callers pass no `preferOffline` and keep their argv.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** the file exists; private `copyListed` (line 519) and `install` (line 640).
- Export `copyListed` unchanged. Export `install(wt, log, opts?: { preferOffline?: boolean })`, passing `preferOffline` to `installCommand`; `worktrees setup` keeps calling it with no options.

#### [MODIFY] `.bkit/core/engine/commands/ci/ci.ts`

- **Existence Check:** the file exists; private `withCleanup` at line 250, `CLEANUP_SIGNALS` at line 101.
- Export `withCleanup` unchanged.

#### [MODIFY] `.bkit/core/engine/commands/workflow/runtime.ts`

- **Existence Check:** the file exists; the `assert` verb filters `runtime-resolved` rows inline (around line 296).
- Extract `latestRuntimeRow(events, workflow?)` and export it; `runtime assert` calls it, with the same output and exit codes.

### Engine — decisions and counters

#### [MODIFY] `.bkit/core/engine/commands/workflow/counters.ts`

- **Existence Check:** the file exists; `loopTrend` (line 257), `LoopProgress` and `loopProgress` (lines 283-336).
- `loopProgress` gains an optional `gate` step prefix (after `sinceClean`). Per check round it finds the latest `test-run` row (`readStatusRows`) of step `{gate}-{group}` with the round's `attempt` in the active run, and adds its `failures`; no row adds 0; a row with `failures` null makes the round's `failures` null (`?`, trend `stuck`). `LoopProgress.rounds[]` gains `gateFailures: number | null`, and `LoopProgress` gains `gateCounts` (the per-round gate failures joined by ` → `). `counters progress` keeps its flags; no workflow calls it for the verify loop.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists; `LOOPS` (lines 173-197), the `compose` verb (lines 326-440), the `apply` verb (from line 445).
- `LOOPS.verify.gate = "build-group-gate"`, passed to `loopProgress`; the progress block adds `Group gate failures after each round: {gateCounts}` for the verify loop.
- `compose --base-check=<json>`: reads the `tests base` output (shape validated in the handler; a bad file is `EXIT.USAGE`), adds `Also red on base {base}: {baseRed} of {failing} ({source} run)` to the progress block, and sets the loop question's recommendation and reason by verdict: `all` → `Stop` (`Decide` with items) with "these N tests fail on `dev` too; no round here can fix them. Fix `dev`, then resume." plus " In adopt mode: merge `dev` into the branch before resuming." when `adopt`; `some` → the trend recommendation, reason led by "a round can fix X of N; the build will still stop on the Y from `dev`."; `none` → the trend recommendation, reason led by "the failures come from this branch"; `unknown` → the trend recommendation, reason led by "cause unknown: {reason}". Options stay `["Try again", "Stop"]` / `["Try again", "Decide"]`.
- `apply --by=rerun --file=<decision>`: refuses a file whose header lacks `Gate: FAIL` or whose `Status` is not `OPEN` (`EXIT.USAGE`, nothing written); else writes `Decision: Re-run gate — the owner resumed the run, so the gate runs again first ({date})` under Q1 and sets `Status: DECIDED`. Output `status`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** the file exists; `OpenDecision` and `openDecision` (lines 245-298), the `openDecision` output help (line 2084).
- `OpenDecision.gate: string | null` from the `Gate:` header; the output help names it.

### Workflow and prompt

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists; Contract **Resume** (line 43), Decision Pause (lines 127-311), Step 8 (sub-steps 8-11, lines 714-744), Step 9 sub-step 5 (line 818), Step 12 (lines 996-1044).
- Decision Pause step 2: the two item rules read "A failing group-gate test is never an item; the loop question and the base check cover it." and "**If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items; a failing suite test is never an item." Before the compose, a gate pause (`PAUSE_QUESTION` = `TESTS_LOOP`, or `PAUSE_LOOP` = `verify` with `GATE_VERDICT` = FAIL) runs `"{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"` (non-zero → **Failure Path**) and adds `{BASE_FLAGS}` = `--base-check="{OUTBOX}/base-check.json" --header=Gate=FAIL` to the compose call; `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` or `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`.
- Decision Pause step 4: offer only the options the decision file holds; never add an item or an option.
- Step 9 sub-step 5: the no-progress route sets `PAUSE_LOOP` = `verify` when `GATE_VERDICT` = FAIL, so that pause holds the loop question instead of an empty file.
- Contract **Resume**: **If** `openDecision.gate` = `FAIL` → run `decisions apply --by=rerun` on it, set `DECISION_ROUTE` = `verify` (`from` = `verify`) or `tests`, run Decision Pause step 6's `steps finish --step=build-decision` block, hold `GATE_RERUN` = true, and re-run Step 8 sub-step 8 with `VERIFY_VERDICT` = PASS under the same `VERIFY_ATTEMPT`, or Step 12. No `counters grant`.
- Step 8 sub-step 11 and Step 12 sub-step 4: a first route **If** `GATE_RERUN` = true and the gate is still red → straight to the **Decision Pause** (`PAUSE_LOOP` = `verify` / `PAUSE_QUESTION` = `TESTS_LOOP`); every route clears `GATE_RERUN`.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-verify.md`

- **Existence Check:** the file exists; Process step 6 (Group mode, line 71) and step 7 (Holistic, line 77).
- Group mode gains: "A test failure the group gate also runs is not a gap; log one only when a task's `DONE WHEN` or `TEST FIRST` names that test." Holistic mode's #889 rule (each failing test is a gap) is unchanged.

### Test fixtures

#### [MODIFY] `tests/fixtures/gates/pnpm.cjs`

- **Existence Check:** the file exists; the script branch runs `/bin/sh -c {script}`.
- Pass the arguments after the script name through (`sh -c '{script} "$@"' pnpm ...args`), as `pnpm run` does.

### Docs and generated files

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; build step table rows 968-969, § Decision Pause (line 980), § Group gate **Strict, no exceptions** (line 1597).
- Step 8 / 9 rows and § Decision Pause describe the base check, the `Gate: FAIL` header, the resume re-run and gate failures in the round counts; **Strict, no exceptions** says a red gate that also fails on the base commit is fixed on `dev`, and drops "Add an exception mechanism only once a real case shows a legitimate red group gate."

#### [MODIFY] `.bkit/cli.md`, `docs/testing.md`, `docs/capabilities.md`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `dist/`, host mirrors

- **Existence Check:** each exists.
- Regenerated by `pnpm cli:sync`, `vitest run .bkit/core/engine/render -u`, `pnpm bkit:graph:refresh`, `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade`; `docs/testing.md`'s key-test-files table gains the two `tests-base` files.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. No artifact is replaced: the Architecture lists no `[DELETE]`. The superseded accepted-failure plan was never built, and its decision rows are already `SUPERSEDED`.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None planned; the build adds a row only if it finds a gotcha. |
| `docs/decisions.jsonl` | Done at plan time: `891-base-commit-check-at-the-decision-pause`, `891-verify-loop-progress-counts-group-gate-tests`, `891-resume-reruns-a-red-gate-pause` (new rows, same keys); `891-gate-failures-never-pause-items` stands. |
| `docs/architecture.md` | None: `commands/workflow/` already holds every `bkit <noun> <verb>` workflow command. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None: no database. |
| `docs/design.md` | None: no UI. |
| `docs/testing.md` | The key-test-files table gains `commands/workflow/tests-base.test.ts` (Unit (boundary: real temp git repo)) and `commands/workflow/tests-base.integration.test.ts` (Integration), each with what it covers. |
| `docs/observability.md` | None: no new log name or span. |
| `.bkit/core/.bkit/workflows.md` (mirrored to `.bkit/workflows.md`) | Build step table rows 8 and 9, § Decision Pause (base check, `Gate: FAIL`, resume re-run, gate failures in round counts), § Group gate **Strict, no exceptions**. |
| `.bkit/cli.md` | Generated region regenerated by `pnpm cli:sync` for `tests base`, `compose --base-check`, `apply --by=rerun`, `openDecision.gate`. |
| `docs/capabilities.md` | Regenerated by `pnpm bkit:graph:refresh` for the new module. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None: no database. | — |
| **Code** | `git revert {COMMIT}` of the squash merge, then `pnpm build` and `bkit upgrade` so `dist/` and the mirrors follow. | A decision file that carries `Gate: FAIL` after a revert is asked again as an ordinary pause; nothing reads the header any more. |
| **Risk window** | None: no migration and no deploy. Consumers get the change on their next `bkit upgrade`. | — |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Engine tasks come before the workflow edits that call them, so `workflow-shape.test.ts`'s engine-calls check passes at every group gate. Each task that changes a command spec runs `pnpm cli:sync` itself, and each workflow edit regenerates the render snapshot itself, so no group ends with a stale generated file. Integration shape (advice only): one PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine evidence the pause reads

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Keep each JUnit case's `classname` and `file`, and export `runTestFile`
  - **UPDATE:** `JunitCase` in `.bkit/core/engine/commands/workflow/tests.ts`: add `classname: string | null` and `file: string | null`
  - **UPDATE:** `parseJunit` in `.bkit/core/engine/commands/workflow/tests.ts`: read both attributes from each `<testcase>` tag, null when absent
  - **UPDATE:** `runTestFile` in `.bkit/core/engine/commands/workflow/tests.ts`: export it unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: the existing `parseJunit` `toEqual<JunitCase[]>` expectations gain the two fields
  - **DONE WHEN:** `parseJunit` returns `classname` and `file` for every case, `runTestFile` is exported, and `vitest run .bkit/core/engine/commands/workflow/tests.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `parseJunit > keeps each case's classname and file attribute` fails on the case's `file` being undefined instead of the report's path

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Base-run helpers: an offline-first install and the exports the base run reuses
  - **UPDATE:** `installCommand` in `.bkit/core/engine/shared/package-manager.ts`: optional `preferOffline` appends `--prefer-offline`
  - **UPDATE:** `install` in `.bkit/core/engine/commands/workflow/worktrees.ts`: export it with an optional `{ preferOffline }` passed to `installCommand`
  - **UPDATE:** `copyListed` in `.bkit/core/engine/commands/workflow/worktrees.ts`: export it unchanged
  - **UPDATE:** `withCleanup` in `.bkit/core/engine/commands/ci/ci.ts`: export it unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runtime.ts`: extract the `assert` verb's latest-row filter as exported `latestRuntimeRow(events, workflow?)`, and call it from `assert`
  - **DONE WHEN:** `installCommand({ frozen: true, preferOffline: true })` returns `pnpm install --frozen-lockfile --prefer-offline`, the four helpers are exported, `pnpm typecheck` passes, and the existing `runtime assert`, `worktrees setup` and package-manager tests pass unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/package-manager.test.ts` `a prefer-offline frozen install adds --prefer-offline` fails on the argv ending at `--frozen-lockfile` without "--prefer-offline"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Count the group gate's failing tests in the verify loop's progress
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: optional `gate` step prefix; per round add the latest same-attempt `test-run` row's `failures` for step `{gate}-{group}`, 0 with no row, null when the row's count is null
  - **UPDATE:** `LoopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: `rounds[].gateFailures` and `gateCounts`
  - **UPDATE:** `LOOPS` in `.bkit/core/engine/commands/workflow/decisions.ts`: `verify.gate = "build-group-gate"`, passed to `loopProgress`
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `compose` prints `Group gate failures after each round: {gateCounts}` for the verify loop
  - **READ:** `readStatusRows` in `.bkit/core/engine/commands/workflow/status.ts`: the `test-run` rows
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: existing `bkit counters progress` expectations that compare whole outputs gain the new fields
  - **DONE WHEN:** a verify round with a red gate of 3 failures and 0 verify problems counts 3, a null gate count reads `?` with trend `stuck`, the compose progress block prints the gate line, and `counters.test.ts` and `decisions.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > adds the group gate's failing tests to each verify round` fails on the counts reading 0 → 0 instead of "3 → 3"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > a red gate row with no failure count makes the round unknown` fails on the round counting 0 instead of `?` and the trend not being "stuck"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > a verify round whose gate did not run adds no gate failures` fails on `gateCounts` being absent instead of "0 → 3"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > prints the group gate's failing tests per round for the verify loop` fails on the file lacking a "Group gate failures after each round" line

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The base check and its wording

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Classify failing cases against the base run
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-base.ts`: pure `caseFile(c, tracked)` (file attribute, then a tracked `classname` path, then exactly one matching tracked basename, else null) and `baseVerdict(cases)` (`all | some | none | unknown`, counts, and a reason for `unknown`)
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-base.test.ts`: unit tests of both helpers
  - **READ:** `JunitCase` in `.bkit/core/engine/commands/workflow/tests.ts`: the case shape from Task 1
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `caseFile` and `baseVerdict` are exported from `tests-base.ts` and `vitest run .bkit/core/engine/commands/workflow/tests-base.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > all when every failing case also fails at base` fails on the verdict not being "all"
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > some with the base-red and branch counts` fails on the counts not splitting into 3 base-red and 2 from the branch
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > none when each case passes, is absent, or its file is absent at base` fails on a case absent at base counting as undetermined
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > unknown with a reason when no case is base-red and one is undetermined` fails on the verdict reading `none` with no reason
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > resolves from file, then a classname path, then one matching tracked basename` fails on the bats-style `classname` resolving to null
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > a classname matching two tracked basenames leaves the case undetermined` fails on the first of two matching files being picked

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** The `bkit tests base` verb
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-base.ts`: `testsBaseVerb` — flags `--log`, `--file`, `--workflow`, `--out`, validated in the handler; reads `{log}.reports`; base sha `git merge-base HEAD {devBase}`; `shipGate` at the base sha (passed with no skipped lane → `none`, source `ci`); else the local run in a detached `os.tmpdir()` worktree under `withoutHooks` and `withCleanup`, `copyListed`, `install(…, { preferOffline: true })`, `runTestFile` per resolved file present at base, `dropLandTree` on every exit; `adopt` from `latestRuntimeRow`; output written to `--out`; exit 0 for every verdict
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: register `base: testsBaseVerb`
  - **UPDATE:** `tests/fixtures/gates/pnpm.cjs`: pass the arguments after the script name to the script, as `pnpm` does
  - **UPDATE:** `.bkit/cli.md`: the generated region, by `pnpm cli:sync`
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`: real temp git repos with a `dev` branch, `useGateRunner`, and the `tests/fixtures/gh/bin/gh` stub with `BKIT_FAKE_GH_FIXTURE_ROOT` pointing at per-test `runs/{sha}.json` and `jobs/{id}.json`
  - **READ:** `shipGate` in `.bkit/core/engine/commands/workflow/runs.ts`: the CI verdict at a sha
  - **READ:** `devBase` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the `dev` ref
  - **READ:** `dropLandTree` in `.bkit/core/engine/commands/land.ts`: worktree removal
  - **READ:** `withoutHooks` in `.bkit/core/engine/commands/land.ts`: hooks off for git children
  - **READ:** `mainCheckoutRoot` in `.bkit/core/engine/commands/lib.ts`: the copy source
  - **READ:** `useGateRunner` in `vitest.gate-fixture.ts`: the package-runner fixture
  - **DEPENDS ON:** 1, 2, 4
  - **DONE WHEN:** `bkit tests base` is listed in `.bkit/cli.md`, `cli-doc.test.ts` passes, `vitest run .bkit/core/engine/commands/workflow/tests-base.integration.test.ts` passes, no `bkit-base-*` worktree is left registered after the suite, and every existing suite that uses `useGateRunner` still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > reports all from a local run at the merge-base` fails on the verdict not being "all" for 3 cases red on `dev`
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a failing file absent at the base commit is the branch's` fails on the case counting as base-red or undetermined
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a passing CI run at the exact base sha settles none without a local run` fails on `source` not being "ci" or a worktree being added
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a CI run that skipped a lane falls back to the local run` fails on `source` reading `ci` for a run with a skipped lane
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > no JUnit report reads unknown` fails on the reason not being "no JUnit report"
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > an undeclared bkit:test:file reads unknown` fails on the verdict not being `unknown` when the base `package.json` lacks the script
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a failed base install reads unknown and removes the worktree` fails on the reason not naming "base install failed" or the worktree still being registered
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > installs at base with --frozen-lockfile --prefer-offline` fails on `fixture-install-args` lacking `--prefer-offline`
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > adopt follows the run's runtimeWorktrees` fails on `adopt` being false for a `runtimeWorktrees` = false row

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `decisions compose --base-check` words the loop question from the verdict
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `compose --base-check=<json>` — shape validated in the handler (usage error otherwise); progress line `Also red on base {base}: {baseRed} of {failing} ({source} run)`; `all` → `Stop` (`Decide` with items) with the `dev` reason and the adopt sentence when `adopt`; `some` / `none` / `unknown` → the trend recommendation with their reason leads; options unchanged
  - **UPDATE:** `.bkit/cli.md`: the generated region, by `pnpm cli:sync`
  - **DEPENDS ON:** 3, 5
  - **DONE WHEN:** a compose with each verdict writes the recommendation and reason the Architecture names, `Try again` is an option in every file, and `decisions.test.ts` and `cli-doc.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check all with no items recommends Stop` fails on the recommendation following the trend, with no "fail on `dev` too" reason
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check all with items recommends Decide` fails on the recommendation not being `Decide` with the `dev` reason
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check all in adopt mode adds the merge sentence` fails on the file lacking "merge `dev` into the branch before resuming"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check some names the split` fails on the file lacking "a round can fix 2 of 5"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check none keeps the trend and names the branch` fails on the reason lacking "the failures come from this branch"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check unknown keeps the trend and says why` fails on the reason lacking "cause unknown: no JUnit report"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > Try again is offered for every base verdict` fails on a verdict whose options drop `Try again`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > a malformed base check is a usage error` fails on the compose writing a file instead of exiting with a usage error

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Engine support for the resume re-run

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `decisions apply --by=rerun`
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `apply --by=rerun` refuses a file without `Gate: FAIL` or not `Status: OPEN` (usage error, nothing written); else writes `Decision: Re-run gate — the owner resumed the run, so the gate runs again first ({date})` under Q1 and sets `Status: DECIDED`; the `--by` help names `rerun`
  - **UPDATE:** `.bkit/cli.md`: the generated region, by `pnpm cli:sync`
  - **DEPENDS ON:** 6
  - **DONE WHEN:** `apply --by=rerun` on a `Gate: FAIL` file prints `status: DECIDED` and the file holds the `Decision: Re-run gate` line, and `decisions.test.ts` and `cli-doc.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` fails on `--by=rerun` being refused as an unknown `--by` value and no "Decision: Re-run gate" line written
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > refuses a file without Gate: FAIL or not OPEN` fails on a non-gate file being rewritten

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `openDecision.gate`
  - **UPDATE:** `OpenDecision` in `.bkit/core/engine/commands/workflow/workflows.ts`: add `gate: string | null`
  - **UPDATE:** `openDecision` in `.bkit/core/engine/commands/workflow/workflows.ts`: read it from the `Gate:` header; the `workflows start` output help for `openDecision` names `gate`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the existing `bkit workflows start — resume facts` `toEqual` expectation gains `gate: null`
  - **UPDATE:** `.bkit/cli.md`: the generated region, by `pnpm cli:sync`
  - **DONE WHEN:** `workflows start` on a resumed run with an open `Gate: FAIL` pause prints `openDecision.gate` = `FAIL`, and `workflows.test.ts` and `cli-doc.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows start — resume facts > openDecision carries the Gate header` fails on `gate` being undefined instead of "FAIL"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows start — resume facts > openDecision gate is null without the header` fails on `gate` being undefined instead of null

<!-- bkit:task 8 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Workflow and prompt

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** The Decision Pause runs the base check, and Step 9's no-progress route asks the loop question
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 2 — the two item rules reworded (a failing group-gate or suite test is never an item), `GATE_LOG`, the `tests base` block (non-zero → **Failure Path**) and `{BASE_FLAGS}` on the compose call for a red-gate or `TESTS_LOOP` pause; step 4 — offer only the file's options; Step 9 sub-step 5 — `PAUSE_LOOP` = `verify` when `GATE_VERDICT` = FAIL; the Decision Pause gate checklist names the base check
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated by `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: existing expectations on the reworded item lines follow the new wording
  - **DEPENDS ON:** 5, 6
  - **DONE WHEN:** `bkit-build.md` holds the `tests base` call and `{BASE_FLAGS}` only under the gate-pause condition, and `workflow-shape.test.ts` (engine calls included), `.bkit/core/engine/checks/status-holes.test.ts` and the render tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > the Decision Pause checks a red gate against the base commit before composing` fails on the Decision Pause holding no "tests base --log=" call
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > a no-progress round after a red gate pauses with the loop question` fails on Step 9 sub-step 5 not setting `PAUSE_LOOP` = `verify`
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > a failing gate or suite test is never a pause item` fails on step 2 still reading "because it is always fixed" and step 4 lacking the file-options rule

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A resume into a red-gate pause re-runs the gate
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Contract **Resume** — `openDecision.gate` = `FAIL` → `decisions apply --by=rerun`, `DECISION_ROUTE` from `from`, Decision Pause step 6's `steps finish --step=build-decision` block, `GATE_RERUN` = true, then Step 8 sub-step 8 (`VERIFY_VERDICT` = PASS, same `VERIFY_ATTEMPT`) or Step 12, with no `counters grant`; Step 8 sub-step 11 and Step 12 sub-step 4 — a first route sends a still-red re-run straight to the **Decision Pause**, and every route clears `GATE_RERUN`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated by `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `resume facts` test's field list gains `gate`
  - **DEPENDS ON:** 7, 8, 9
  - **DONE WHEN:** the Contract **Resume** bullet routes a `Gate: FAIL` pause to the re-run, Steps 8 and 12 route a still-red re-run to the pause, and `workflow-shape.test.ts`, `.bkit/core/engine/checks/status-holes.test.ts` and the render tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `resume facts > build re-runs a red gate pause instead of asking it` fails on the Resume bullet holding no "decisions apply --by=rerun" call
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > a re-run gate that is still red goes straight to the Decision Pause` fails on Step 8 sub-step 11 or Step 12 sub-step 4 lacking the `GATE_RERUN` route

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Group-mode verify logs no gap for a test the group gate runs
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: Process step 6 (Group mode) gains the rule; step 7 (Holistic) unchanged
  - **DONE WHEN:** the prompt's Group-mode step holds the rule, its Holistic step still logs each failing test as a gap, and `workflow-shape.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > group-mode verify logs no gap for a test the group gate runs` fails on the Group-mode step lacking "not a gap" for a gate-run test

<!-- bkit:task 11 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Docs, generated files and mirrors

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Update the catalog and test docs, and regenerate `dist/`, the capability register and the host mirrors
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: build step table rows 8 and 9, § Decision Pause (base check, `Gate: FAIL`, resume re-run, gate failures in the round counts), § Group gate **Strict, no exceptions** (a red gate that also fails on the base commit is fixed on `dev`; the "Add an exception mechanism" sentence removed)
  - **UPDATE:** `docs/testing.md`: the key-test-files table gains `commands/workflow/tests-base.test.ts` and `commands/workflow/tests-base.integration.test.ts`
  - **UPDATE:** `docs/capabilities.md`: regenerated by `pnpm bkit:graph:refresh`
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`
  - **UPDATE:** `.bkit/workflows.md`: refreshed by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, which also refreshes the host mirrors of `bkit-build.md` and `bkit-build-plan-verify.md`
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
  - **DONE WHEN:** `.bkit/core/.bkit/workflows.md` no longer holds "Add an exception mechanism only once a real case shows a legitimate red group gate", `docs/testing.md` names both `tests-base` files, `pnpm bkit:check:dist` exits 0, and `bkit check` exits 0 with no `DRIFT DETECTED`.
  - **TEST FIRST:** n/a — docs and regenerated files only; no behaviour change.

<!-- bkit:task 12 end -->

<!-- bkit:group 5 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** the base check's reasons reach the decision file and the verb's log, per `docs/observability.md`.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `bkit check` pass.
- [ ] **Test Synchronization:** No E2E tier exists in bkit. The existing suites that use `useGateRunner` pass with the argument-forwarding `pnpm.cjs` fixture.
- [ ] **Build Configuration:** The new test files use the `*.test.ts` / `*.integration.test.ts` suffixes that `tsconfig.json` and the build leave out of `dist/`; `pnpm bkit:check:dist` shows no test file in `dist/`.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/tests-base.test.ts`, `counters.test.ts`, `decisions.test.ts`, `workflows.test.ts`, `tests.test.ts`, `.bkit/core/engine/shared/package-manager.test.ts`):** the classification, the gate counts, the compose wording per verdict, `apply --by=rerun` and `openDecision.gate`. Temp folders are removed in `afterEach`.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`):** the Decision Pause base check, the Step 9 loop question, the resume re-run, the `GATE_RERUN` routes and the group-mode verify rule.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`):** `bkit tests base` through `tsx` against real temp git repos, the `pnpm.cjs` fixture and the gh stub; each test asserts no `bkit-base-*` worktree remains registered.
- [ ] **Apply local migrations:** Not applicable: no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch consumer repo, make one unit test red on `dev`, branch off, and run `/bkit-build` on a two-group plan → the first pause shows the gate failures in `Problems after each round`, `Also red on base {sha}: 1 of 1 (local run)`, and recommends `Stop` with the fix-`dev` reason; no `Accept` item.
- [ ] **Step 2:** Answer `Stop`, fix the test on `dev`, merge `dev` into the branch (adopt mode) and resume → the decision file gains `Decision: Re-run gate`, the gate re-runs green, and group 2 starts without a question.
- [ ] **Step 3:** Repeat Step 1 with the test red only on the branch → the pause says the failures come from this branch and recommends by the trend.
