<!-- bkit:anchor
baseSha: 53f80ca33a108b4d0a72376f2a915a35ce1402bc
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->
Verdict: CONCERNS
<!-- verdict:end -->

# Build: Accepted Base-Branch Test Failures Unblock the Gate — Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

A consumer's `/bkit-build` got stuck at its first task group because `dev` already had 3 failing unit tests that the branch did not cause. The owner answered `Accept` at the Decision Pause, the pause wrote a `docs/decisions.jsonl` row, and the next group gate failed on the same 3 tests anyway. The second pause offered only `Try again` (a round in which no code can change) or `Stop`, so groups 2-6 never started.

Why, in the code:

- `bkit tests run` takes its verdict from the gate's exit code alone (`.bkit/core/engine/commands/workflow/tests.ts:1873`). It never reads an owner's accept.
- `.bkit/core/workflows/bkit-build.md` Step 8 sub-steps 10-11 and Step 12 sub-step 4 send every gate FAIL to another round or to a pause. The Decision Pause writes no item for a group-gate failure ("A group-gate failure is never an item, because it is always fixed") and none for a failing suite (`TESTS_LOOP`).
- `.bkit/core/.bkit/workflows.md` § Group gate says "Strict, no exceptions … Add an exception mechanism only once a real case shows a legitimate red group gate." This issue is that real case.

Goals:

- Give the owner a one-time `Accept` for named failing test cases that the branch did not cause, recorded by bkit from the JUnit reports `tests run` already reads (`parseJunit`, `tests.ts:582`).
- Make the group gates (Step 8), the gaps-remediate gate (Step 9), the final run (Step 12) and debug's gate (`bkit-debug.md` Step 3) treat those exact cases as known, and still fail on any other failing case and on any failure that has no test name.
- Make the checks that also run the gate on the way to ship treat the same cases as known: the agents' `bkit tests changed` runs in holistic verify, gaps-remediate and debug-remediate (whose fallback is the full `bkit:gate:static-unit`), and the pre-push hook's gate on every `branches push` the build, debug and ship workflows run.
- Keep the gate's exit code truthful: the gate itself skips the accepted cases, so every later stage of a chained gate (`&&`) still runs. A gate that cannot skip them keeps failing, and the pause says so plainly with no `Try again`.
- Show the accepted cases to the owner at `/bkit-ship` before merge.

The plan diverges from the issue comment's decision 3 ("`tests run` … returns PASS when every failing case is accepted"). A verdict override in the engine gives a false PASS whenever a gate chains stages with `&&`, because the chain stops at the failing tier: this repo's own `bkit:gate:static-unit` would never run `pnpm bkit:test:bats`, and Step 12's `bkit:gate:static-unit-integration` would never run `pnpm test:integration`. `Open Questions & Assumptions` Q2 puts both options to the owner. Because B reverses the owner's recorded decision 3, the build does not start until the owner answers Q2 at Gate 1; Q2 names the tasks that change if the owner picks A.

There is no design doc. The issue is a bug-shape issue, so `Narrative` and `Success Criteria` are taken word for word from its `What should happen` section.

**Related Issues:**

- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (OPEN)
- #843 — Friction triage (OPEN)
- #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (CLOSED)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

When a gate fails only on tests that also fail on the base branch, the build says so plainly and lets the owner accept them once.

### Success Criteria

1. the group gates and the Step 12 run treat those exact tests as known, and stop only on new failures;
2. every other failing test still fails the gate;
3. `/bkit-ship` still shows the accepted tests to the owner before merge.
4. The pause also stops offering `Try again` when the only failures are accepted base-branch failures, because no round can change them.

### Process Sketch

- **WHEN** a group gate fails and its JUnit reports name the failing cases **→ THEN** the Decision Pause lists those cases as one `Accept` / `Fix now` / `Stop` question and says an accept covers only these named tests.
- **WHEN** the owner answers `Accept` **→ THEN** bkit records the exact cases (`classname` + `name`) for the feature, and the gate's step runs again (Step 8 for a group gate, Step 12 for the final run).
- **WHEN** a later gate runs (Step 8, Step 9's remediate gate, Step 12, debug Step 3, an agent's `bkit tests changed`, the pre-push gate of a workflow's `branches push`) **→ THEN** the gate receives the accepted cases in `$BKIT_ACCEPTED_TESTS`, skips them, and passes when nothing else fails; groups 2+ start, and the build's pushes go through.
- **IF** a new test fails, or a failure has no test name (lint, typecheck) **→ THEN** the gate still fails and routes as today.
- **IF** the gate fails and every failing case is already accepted (the runner ignores `$BKIT_ACCEPTED_TESTS`) **→ THEN** the pause offers no `Try again` and says the gate does not skip accepted tests.
- **WHEN** `/bkit-ship` runs for the feature **→ THEN** it lists the accepted cases to the owner before the merge gate.

### Concrete Example

**Setup:** The owner of a consumer repo starts `/bkit-build` on an issue with 6 task groups. `dev` has 3 failing unit tests in `scripts/registry.test.mjs` and `scripts/ceiling.test.mjs`. The consumer's `bkit:gate:static-unit` runner honours `$BKIT_ACCEPTED_TESTS` (`docs/testing.md` § Accepted failures).

**Steps:**

1. Group 1 is built and verified → `tests run` for `build-group-gate-1` exits 1; its test-run row records the 3 failing cases with their `classname` and `name`.
2. Step 9 runs one remediate round → the gate fails on the same 3 cases, and the verify limit is used up → the Decision Pause asks: "3 tests failed in the group gate … Accept them as already failing on the base branch?" with `Options: A) Accept / B) Fix now / C) Stop` and `No recommendation — only you can say these tests already fail on dev`.
3. The owner answers `A` with a reason → bkit runs `tests accept`, which writes an `accepted-failures` row naming the 3 cases, and appends one `docs/decisions.jsonl` row → Step 8 runs again.
4. `tests run --accepted-from` hands the gate the 3 cases; the runner skips them, and the gate exits 0 → `GATE_VERDICT` = PASS → Step 7 briefs group 2.
5. Groups 2-6 build; Step 12 passes with the same 3 cases skipped. Steps 15 and 16 run `branches push --accepted-from`, so the consumer's pre-push gate skips the same 3 cases and the push goes through. `/bkit-ship` prints "Built with 3 test(s) accepted as already failing on the base branch" and names each before the merge gate.

**Outcome:** All 6 groups are built, and the 3 accepted cases are named in the build's decision file, in `status.jsonl` and in the ship session before merge.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A failure with no test name: lint, type checks and other steps that write no JUnit report (issue comment, decision 2) | No `Accept` item: the pause says the failure has no test names, so an accept cannot cover it, and the gate still fails |
| A new test fails beside the accepted ones | The gate fails; the pause lists only the not-yet-accepted cases |
| The gate's runner ignores `$BKIT_ACCEPTED_TESTS`, so accepted cases still fail | `tests run` reports `onlyAccepted: true`; Step 8 goes straight to the Decision Pause with no remediate round; the pause writes one hard-blocker item ("the gate does not skip accepted tests") with `Fix now` / `Stop` and no loop question, so no `Try again`. The item also says a failure with no test names (lint, typecheck) may sit beside the accepted ones, since `onlyAccepted` counts JUnit cases only. Success Criterion 1 is not met for this runner until the consumer wires it as `docs/testing.md` § Accepted failures says |
| More than 100 failing cases in one run | The row records the first 100 and `failedCasesTruncated: true`; `tests accept` refuses, so the owner fixes the base branch or answers `Fix now` |
| A test file is renamed or a case is renamed after the accept | The renamed case no longer matches the accepted `classname` + `name`, so it fails the gate and the pause asks again |
| An accepted test starts passing (the base branch was fixed and merged in) | The gate passes; the accept is harmless and stays on record |
| Headless run (`ask` = false, or a cloud runtime) | The `Accept` item is a hard blocker with no recommendation, so `decisions apply --by=headless` exits 4: a headless runtime goes to the **Failure Path**, and an `ask` = false run that is not headless asks the owner the hard blocker. Today the same pause has no item and takes `Stop` (a resumable handover); see Breaking Changes |
| Two cases share a `name` in different files | Only the case whose `classname` and `name` both match is accepted |
| `tests run` without `--accepted-from` (a by-hand run, CI) | No accepted cases are passed, and the verdict comes from the exit code exactly as before |
| `--accepted-from` names a status file with no `accepted-failures` rows | The gate gets an empty list, and behaviour is unchanged |
| `tests run --ci-run --accepted-from` (debug Step 3 in CI-evidence mode) | The flag is accepted, no list is written, and the CI `test-run` row and exit code are as today |
| A workflow's `branches push` runs the consumer's pre-push hook while the base branch holds accepted red tests | `branches push --accepted-from` passes `$BKIT_ACCEPTED_TESTS` in the `git push` environment, the hook's `bkit ci push-gate` hands it to the gate, and the push goes through when nothing else fails (Q4) |
| A by-hand `git push` from the feature branch | Not a workflow push, so no accepted cases are passed, and the pre-push gate fails on the base-red tests as today |
| An agent's `bkit tests changed` self-check meets an accepted case | With `--accepted-from` from its Context, the case is skipped, so the agent neither edits it nor reports `BLOCKED` |
| The owner's reason holds a quote, a backtick or `$(` | `tests accept --reason-file` reads it from a file the orchestrator writes, so no shell runs it, and the row holds it byte for byte |
| A per-group verify gap and the named-failure item both name the gate's failing tests | The named-failure item wins: the pause lists no separate gap for the gate's failing tests, so an `Accept` always runs `tests accept` |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `parseJunit` reads each case's `classname` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| The two existing `parseJunit` cases expect `classname` on every parsed case (`"f"` from the fixture helpers, `""` on a bare `<testcase>`) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| A FAIL records each failing case's `classname` and `name` on the test-run row and in the output | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| More than 100 failing cases are capped and flagged `failedCasesTruncated` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `tests accept` writes an `accepted-failures` row with the step's latest failing cases, the reason and the decision reference | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `tests accept` writes only the cases not already accepted | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `tests accept` matches an earlier accept on `classname` + `name`, so a same-named case in another file is still written | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `tests accept` refuses a run whose failure has no test names (failures null) with exit 1 and the named reason | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `tests accept` refuses a truncated run and a PASS run, each with exit 1 and the named reason | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `tests accept --reason-file` writes a reason holding a quote, a backtick and `$(` byte for byte | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| An `accepted-failures` row adds no step minutes | Unit | `.bkit/core/engine/commands/workflow/run-facts.test.ts` | 2 |
| Harvest's `MARK_ROWS` copy holds `accepted-failures` and stays equal to the engine's | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 2 |
| `--accepted-from` hands the gate every accepted case of the status file as `$BKIT_ACCEPTED_TESTS` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| A FAIL whose named failing cases are all accepted reports `onlyAccepted: true`, puts `acceptedFailing` on the row, logs the one `onlyAccepted` line and stays FAIL | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| A new failing case beside accepted ones fails with `onlyAccepted: false` and lists the case as unaccepted | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| `tests run` without `--accepted-from` passes no `BKIT_ACCEPTED_TESTS` and takes its verdict from the exit code as before | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| An accept of `a.test.ts > x` leaves a failing `b.test.ts > x` unaccepted | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| `--accepted-from` naming a status file with no `accepted-failures` rows hands the gate an empty list | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| `tests run --ci-run --accepted-from` exits as today, writes the same CI `test-run` row and writes no accepted list | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| A gate red on cases goes green once they are accepted and the runner skips them (real CLI, real status file) | Integration | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | 3 |
| A new failing case still fails the gate after an accept, and `unaccepted` names it (real CLI) | Integration | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | 3 |
| `tests failures` lists the latest run's failing cases of a step, each with its `accepted` flag, plus `named`, `truncated` and `onlyAccepted` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `tests failures` reports `named: false` for a FAIL with no test names | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `tests failures` reports `onlyAccepted` when every failing case is accepted | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `tests failures` exits 2 with a message naming the step that has no test-run row | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `decisions pending` lists the feature's accepted failing tests from its `status.jsonl` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 5 |
| `decisions pending` prints an empty `acceptedTests` when the log has no `accepted-failures` row | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 5 |
| `tests changed` hands the changed-file gate or its fallback `$BKIT_ACCEPTED_TESTS` only with `--accepted-from` | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 6 |
| The list `tests changed --accepted-from` writes holds every accepted case of the status file | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 6 |
| A `branches push --accepted-from` runs the pre-push hook's gate with the accepted cases skipped, and the push goes through (real `git push`, real hook) | Integration | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | 7 |
| A `branches push --accepted-from` is still refused when a not-accepted case fails in the hook's gate | Integration | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | 7 |
| The Decision Pause writes a gate or suite accept through `bkit tests accept --reason-file` and lists named failures as one hard-blocker item | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| The Decision Pause reads named failures with `bkit tests failures` for `VERIFY_GAPS` and `TESTS_LOOP` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| The pause composes no loop question (no `Try again`) when `onlyAccepted` is true | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| The pause says a failure with no test names cannot be accepted | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| The named-failure item wins over a verify gap naming the gate's failing tests | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| Every build and debug gate call of `tests run` passes `--accepted-from="{STATUS}"` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 9 |
| The Step 9 `Group gate` command in the gaps-remediate Context passes `--accepted-from="{STATUS}"` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 9 |
| Step 8 sends a group-gate FAIL with `onlyAccepted` true straight to the Decision Pause, with no remediate round | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 9 |
| Ship's Confirm Assumed Items step lists the accepted tests from `decisions pending` before the merge gate | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 10 |
| Every prompt that runs `bkit tests changed` passes `--accepted-from` when its Context names an accepted-from status file | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 11 |
| Every build and debug Context that dispatches a prompt running `bkit tests changed` names the status file to accept from | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 11 |
| Every `branches push` call site of build, debug and ship passes `--accepted-from="{STATUS}"` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 12 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

No breaking change: every addition is opt-in or additive, and a consumer that never accepts a failure sees today's behaviour. The proposed names:

<!-- prettier-ignore -->
| Name | Kind | Notes |
| --- | --- | --- |
| `BKIT_ACCEPTED_TESTS` | env var passed to every `bkit:gate:*` that `tests run --accepted-from` or `tests changed --accepted-from` runs, and to the `git push` that `branches push --accepted-from` runs (its pre-push hook and `bkit ci push-gate` inherit it) | New consumer-facing contract beside `BKIT_TEST_REPORT_DIR`; a consumer opts in by making its runners skip the listed cases. Set only in the build's, debug's and ship's own gate runs, agent self-checks and pushes; a by-hand push and CI never see it. |
| `bkit tests run --accepted-from=<status.jsonl>` | CLI flag | Additive. |
| `bkit tests changed --accepted-from=<status.jsonl>` | CLI flag | Additive. |
| `bkit branches push --accepted-from=<status.jsonl>` | CLI flag | Additive (Q4). |
| `bkit tests failures` | CLI verb (`use: workflow`) | Reads the latest `test-run` row of a step. |
| `bkit tests accept` | CLI verb (`use: workflow`) | Writes one `accepted-failures` row; the owner's reason comes from `--reason-file`, a file the orchestrator writes, so no shell runs it. |
| `accepted-failures` | `status.jsonl` row type | New mark row. |
| `failedCases`, `failedCasesTruncated`, `acceptedFailing` | `test-run` row and `tests run` output fields | Additive; `testRunProblem` (`.bkit/core/engine/ledgers/status.ts:121`) ignores unknown fields. |
| `onlyAccepted`, `unaccepted` | `tests run` output fields | Additive. |
| `acceptedTests` | `decisions pending` output field | Additive. |

Behaviour changes to confirm:

- § Group gate in `.bkit/workflows.md` drops "Strict, no exceptions" for owner-accepted named cases.
- The Decision Pause gains items for gate and suite failures that it never asked about before.
- Headless and `ask` = false runs: a stuck `TESTS_LOOP` or verify pause with no items today composes `Try again` / `Stop` with `Stop` recommended, so `decisions apply --by=headless` takes `Stop` (a resumable handover). With a named-failure or `onlyAccepted` hard-blocker item, the options become `Try again` / `Decide` with `Decide` recommended, so `decisions apply --by=headless` exits 4: a headless runtime goes to the **Failure Path**, and an `ask` = false run that is not headless now asks the owner the hard blocker.
- Step 8 sends a group-gate FAIL whose failing cases are all accepted (`onlyAccepted` true) straight to the Decision Pause, with no remediate round.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1:** Does bkit check that a failing case also fails on the base branch before it offers `Accept`? → the owner decides at plan review.
  - **Options:** A) No check: the owner judges, and bkit records the exact cases from the JUnit reports — no extra run, but an owner can accept a failure the branch caused, and CI on the PR still shows it · B) At the pause only, run the failing cases' test files once on the base commit through `bkit:test:file` and recommend `Accept` for the cases that also fail there — trustworthy and safe headless, but needs a base worktree and a case-to-file map that not every runner writes · C) Run the whole gate on the base branch after every red gate and compare — the most trustworthy, but it doubles every red gate's run time.
  - **Recommended:** A) No check — the issue comment chose it (decision 1, with C rejected for its run time), and the item stays a hard blocker, so no run accepts without the owner.
  - **Default if unanswered:** A.
- **Open Question Q2:** How does an accepted case stop failing the gate? → the owner decides at plan review; this changes the issue comment's decision 3.
  - **Options:** A) Engine verdict override, as the comment says: `tests run` returns PASS when every failing JUnit case is accepted — no consumer change, but a gate that chains stages with `&&` stops at the failing tier, so later stages never run and the gate reads PASS (this repo's `bkit:gate:static-unit` would skip `pnpm bkit:test:bats`; Step 12's `bkit:gate:static-unit-integration` would skip `pnpm test:integration`) · B) Runner-side skip: `tests run --accepted-from` hands the gate the accepted cases in `$BKIT_ACCEPTED_TESTS`, each runner skips them, and the verdict still comes from the exit code — every stage runs and the exit code stays truthful, but each consumer wires its runners once (a few lines per runner, documented in `docs/testing.md`), and an unwired runner keeps failing as today, with the pause saying why · C) A, plus a rule that the override applies only to the group gate — Step 8 unblocks with no consumer change, but the false PASS remains for any `&&` stage after the unit tier, and Step 12 stays stuck.
  - **Recommended:** B) Runner-side skip — it is the only option where "every other failing test still fails the gate" holds for chained gates, and an unwired runner fails safe.
  - **Default if unanswered:** B, but B reverses the owner's recorded decision 3, so the build does not start until the owner answers Q2 at Gate 1. The runbook below is written for B, and `docs/decisions.jsonl` `891-accepted-tests-skipped-by-the-gate-runner` records B as the plan's recommendation pending this answer.
  - **If the owner picks A:** the runbook changes as follows. Task 3 drops `BKIT_ACCEPTED_TESTS` and the `{log}.accepted.json` list and returns PASS when every failing case is accepted; tasks 6, 7, 11 and 12 drop out (nothing to hand the self-checks or the pushes); task 3's § Accepted failures section in `docs/testing.md` goes; task 8's `onlyAccepted` item and task 9's `onlyAccepted` routing arm go.
- **Open Question Q3:** Does `/bkit-debug` also offer an `Accept`, or only honour accepts the build recorded? → the owner decides at plan review.
  - **Options:** A) Honour only: debug Step 3 passes `--accepted-from`, and debug writes no new accept — debug's Loop Question is unchanged, but a base-red test first seen in debug still loops · B) Also offer `Accept` at debug's Loop Question — debug unblocks on its own, but it adds a pause item and an accept path to a second workflow.
  - **Recommended:** A) Honour only — the issue comment scopes debug to "the same handling" of the `tests run` verb, and build is where the accept is asked.
  - **Default if unanswered:** A.
- **Open Question Q4:** How do the build's own pushes get past the consumer's pre-push gate while the base branch holds the accepted red tests? → the owner decides at plan review. Build Steps 15 and 16 (`bkit-build.md:1082`, `:1183`), ship's pushes (`bkit-ship.md:274` and later) and debug's pushes run `branches push`, which runs `git push` without `--no-verify` (`branches.ts:1069`), so the shipped pre-push hook (`.bkit/templates/.husky/pre-push`) runs `bkit ci push-gate` on the full gate, which fails on the accepted tests.
  - **Options:** A) `branches push --accepted-from="{STATUS}"` writes the feature's accepted list and passes `BKIT_ACCEPTED_TESTS` in the `git push` environment; the hook and `bkit ci push-gate` (which spawns the gate with the inherited environment, `push-gate.ts:94-96`) hand it to the gate, so no hook template change is needed — the pushes go through and the Concrete Example and Success Criterion 3 hold, but every `branches push` call in build, debug and ship gains the flag (tasks 7 and 12) · B) The build stops at the push and says the pre-push gate fails on accepted tests — no new push path, but the Concrete Example stops at Step 15 and `/bkit-ship` is never reached, so Success Criterion 3 cannot be shown · C) The owner pushes by hand with `git push --no-verify` — no code, but it skips every pre-push check, not only the accepted tests, and the workflow has no step for it.
  - **Recommended:** A) Hand the accepted list to the pre-push gate — it is the only option under which Success Criterion 3 is reached, and the hook still fails on any not-accepted case.
  - **Default if unanswered:** A. Tasks 7 and 12 implement it.
- **Open Question Q5:** Are bkit's own builds (this repo's `bkit:gate:static-unit` chaining Vitest, bats and awake with `&&`) outside Success Criterion 1? → the owner decides at plan review.
  - **Options:** A) Yes: bkit's own runners stay unwired (Out of Scope row, deferral `891-bkit-repo-runners-skip-accepted-tests`) — the change stays consumer-facing, but a `/bkit-build` of bkit itself on a red `dev` still stops at the "the gate does not skip accepted tests" item · B) No: add a runbook task wiring bkit's Vitest config to `$BKIT_ACCEPTED_TESTS` — bkit's own builds unblock, at the cost of one more task and the same per-runner precision limits § Accepted failures documents for Vitest.
  - **Recommended:** A) Keep bkit's own runners out of this plan — the issue is a consumer's report, and the deferral keeps the work visible.
  - **Default if unanswered:** A.
- **Assumption:** Common runners can skip cases by name from an environment variable (Vitest `test.testNamePattern` in its config, Jest `testNamePattern`, pytest `-k` through `PYTEST_ADDOPTS`, a custom script by reading the JSON file) → if a consumer's runner cannot, its accepted cases keep failing, and the pause tells the owner the gate does not skip them; the build stays as stuck as today for that runner.
- **Assumption:** A JUnit case's `classname` + `name` identifies one test across gate runs → if a runner writes no `classname`, the match falls back to an empty `classname`, and two same-named cases in different files are accepted together. bkit matches on both fields, but a runner's skip can be coarser: Vitest's `testNamePattern` matches the full test name, not the file, so that wiring also skips a same-named case in another file; `docs/testing.md` § Accepted failures states the precision per runner and shows a setup-file skip that reads `classname`.
- **Assumption:** The pre-push hook and `bkit ci push-gate` pass the `git push` environment through to the gate (`push-gate.ts:94-96` spawns it with `gitEnv()`, a copy of `process.env`) → if a consumer's own hook clears the environment, Q4 A does not reach its gate, and the build's push fails on the accepted tests as today.
- **Assumption:** 100 named cases per test-run row is enough → a base branch with more than 100 failing cases cannot be accepted; the owner fixes the base branch first.
- **Assumption:** `/bkit-ship`'s merge gate (`bkit runs gate`) still needs green CI, and CI on the PR runs the same red tests while `dev` is red → ship refuses the merge until `dev` is fixed and the branch is synced. The accept unblocks the build, not the merge. If the owner expects ship to merge over the red tests, this plan does not do that.
- **Assumption:** Build and debug for one feature share `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`bkit-build.md:429`, `bkit-debug.md:318`) → if debug ran on a different status file, it would not see build's accepts.
- **Assumption:** One pause item covers all named failing cases of one gate run → an owner who wants to accept only some answers `Fix now` with directions for the rest; if per-case answers are needed, the item shape changes.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Why not chosen |
| --- | --- |
| Engine verdict override: `tests run` returns PASS when every failing JUnit case is accepted (issue comment, decision 3) | A gate that chains stages with `&&` stops at the failing tier, so later stages never run and the gate reads PASS. This repo's `bkit:gate:static-unit` (`package.json:60`) would skip `pnpm bkit:test:bats`; Step 12's `bkit:gate:static-unit-integration` (`package.json:61`) would skip `pnpm test:integration`. That breaks "every other failing test still fails the gate". Q2 option A. |
| Override for the group gate only | Step 8 unblocks, but Step 12 stays stuck, and any stage after the unit tier is still skipped. Q2 option C. |
| Run the whole gate on the base branch after every red gate and compare | The most trustworthy, but it doubles every red gate's run time (issue comment, decision 1). Q1 option C. |
| Run only the failing cases' files on the base commit at the pause | Trustworthy and headless-safe, but it needs a base worktree and a case-to-file map that not every runner writes (a runner-less `node` file names its one case after the file). Q1 option B; recommended for a later phase if owners accept the wrong failures. |
| Skip or quarantine the tests in the consumer's test files | The audit templates forbid it (`.bkit/core/docs/templates/bkit-audit-flakes.md:14`), it changes code outside the issue, and it leaks into CI. The runner-side skip lives only in the build's and debug's gate runs and leaves the test files and CI untouched. |
| Keep the accepted cases in a separate ledger | A second store for one feature's run state; `status.jsonl` is already the feature's committed run log and is shared by build and debug. |

Recommendation for a future phase: if owners report accepting failures the branch caused, add Q1 option B as a recommendation source, so headless runs can accept base-red cases safely.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Docs line: a runner-less test file needs one JUnit case per planned test name (`isNamedCase`, `tests.ts:602`) | The issue marks it "Related, not part of this fix"; no Success Criterion needs it | Deferral `891-runner-less-tests-need-one-junit-case-per-test-name` |
| Run the failing cases on the base commit before offering `Accept` (Q1 option B) | Success Criteria need the owner's accept to stick, not a base check; the issue comment chose no base run | Deferral `891-check-accepted-failures-on-the-base-commit`, a future plan |
| `/bkit-debug` offering its own `Accept` (Q3 option B) | Success Criteria name the group gates, Step 12 and ship; debug only honours the build's accepts | Deferral `891-debug-loop-question-offers-accept` |
| bkit's own Vitest, bats and `node:test` runners skipping `$BKIT_ACCEPTED_TESTS` | The runner contract is consumer-owned; the Integration row proves it with a fixture gate, and no Success Criterion needs bkit's own repo wired, pending the owner's answer to Q5 | Deferral `891-bkit-repo-runners-skip-accepted-tests` |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The status-holes sweep misses numbered and named `If` arms in workflow routing | `docs/failures.jsonl` `status-holes-misses-numbered-and-named-if-arms` (from #699, CLOSED; the row is still open) | Tasks 8 and 9 add routing arms to `.bkit/core/workflows/bkit-build.md` § Decision Pause and Step 8 | Keep deferred; the new arms reuse existing finish blocks, so the sweep's gap does not grow |
| The status-holes sweep flags `tasks tick` between two finish lines | `docs/failures.jsonl` `status-holes-tasks-tick-between-two-finish-lines` (#699) | `bkit-build.md` Step 8, which task 9 edits | Keep deferred; task 9 does not move the `tasks tick` block |
| Load-sensitive tests need a budget that holds under the full gate | #814 — Give load-sensitive tests a budget that holds under the full gate (OPEN) | Red group gates on a loaded machine are a different cause of a stuck gate; an accept must not be used to wave them through | Keep separate; the pause text says an accept is for tests already failing on the base branch |
| Friction triage parent | #843 — Friction triage (OPEN) | Parent of this issue | No action; this plan closes one of its items |
| Run boundary keys on the last run overall | `docs/deferrals.jsonl` `58-status-jsonl-run-boundary-keys-on-last-run-overall` (TRIAGED, MEDIUM) | Tasks 2 and 4 find the active run of a status file that build and debug share | Keep separate; tasks 2 and 4 key on the last `workflow-started` row of the same `--workflow`, as `appendTestRun` does (`tests.ts:196-198`), so an interleaved debug run cannot hide the build's latest `test-run` row |
| Decision Pause renumber drift | `docs/deferrals.jsonl` `705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279` (LOW) | Task 8 edits § Decision Pause | Keep deferred; task 8 adds no header and changes no step number |
| One shared `MARK_ROWS` source (an engine export that harvest reads) | Plan review (regression lens) | Task 2 edits both hand-kept copies, which the harvest parity test pins equal | Keep separate; the parity test catches drift, and a shared source changes harvest's packaging |
| An install or `bkit check` advisory when the declared `bkit:gate:*` runners do not honour `$BKIT_ACCEPTED_TESTS` (the `gate-changed-script-missing` pattern) | Plan scope check | Task 3's runner contract | Keep separate; owners would find the opt-in before a build gets stuck, but no Success Criterion needs it |
| The build summary (`@bkit-build-summary`) lists the accepted cases beside the assumed items | Plan scope check | Task 10's ship listing | Keep separate; ship already shows them before merge, which Success Criterion 3 needs |

## Security & Privacy

- [ ] **New API Route** — not applicable: bkit has no API.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable as a server input; the owner's reason reaches `tests accept --reason-file` as a file the orchestrator writes with its file-write tool, never inside a shell argument, so a quote, a backtick or `$(` in it runs nothing; the verb checks the file holds a non-empty reason before writing it.
- [ ] **PII** — not applicable: test case names and the owner's reason, no personal data.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable: `BKIT_ACCEPTED_TESTS` carries a file path, not a secret.

None — no new routes, DB writes, secrets, or user input. JUnit case names come from the consumer's own test reports; the Decision Pause quotes them as data inside the question text, per `docs/security.md` § Untrusted Content & Prompt Injection, and never acts on their wording.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added; `package.json` and `pnpm-lock.yaml` stay in sync.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-08) lists `oxlint` 1.89.0 → 1.90.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6 and `vite` 6.4.5 → 8.3.5, all dev-only; none blocks this change. Toolchain: Node v24.16.0, pnpm 10.34.7.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the runbook names exists in this worktree and was opened while planning; no user information is missing beyond Q1-Q3.
- [ ] **Project Context:** `docs/decisions.jsonl` `build-group-gate-unit-tier-only` (the group gate runs `bkit:gate:static-unit` only) read; `docs/knowledge.jsonl` holds no row on base-branch failures or JUnit case identity.
- [ ] **Testing & Quality:** engine behaviour at Unit (`*.test.ts`, real temp git repo and fake gate scripts) and one Integration file spawning the real CLI against a real `status.jsonl`; workflow text at Unit through the existing workflow audits (`docs/testing.md` § Which tier does a behaviour need?).
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable. `BKIT_ACCEPTED_TESTS` is a path to a file bkit writes, not a secret.
- [ ] **Schema State:** not applicable; bkit has no database. The new `accepted-failures` status row and the new `test-run` fields are status-log rows (`.bkit/jsonl.md` scope is the ledgers, not `status.jsonl`).
- [ ] **Architecture & UI:** no new component; the change stays inside `commands/workflow/` and the workflow sources (`docs/architecture.md`). No UI.
- [ ] **Observability:** the new row and fields land in `status.jsonl`, which `bkit stats` and the summary read; no new log stream (`docs/observability.md`).
- [ ] **Notifications:** not applicable.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database, and `docs/data-schema.md` has no table to change. The change adds fields and one row type to the per-feature status log `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, which `bkit` writes and reads through `readStatusRows` (`.bkit/core/engine/commands/workflow/status.ts:75`).

### Data Schema Usage

- **Input (Read):** `test-run` rows (`step`, `verdict`, `failures`, the new `failedCases` / `failedCasesTruncated`) and the new `accepted-failures` rows of the feature's `status.jsonl`.
- **Output (Write):** `test-run.failedCases`, `test-run.failedCasesTruncated`, `test-run.acceptedFailing` (on a FAIL run with `--accepted-from`), and `accepted-failures` rows. One `docs/decisions.jsonl` `decision` row per owner accept (existing Decision Pause write, `by.step` = `build-decision`).

### Data Schema Changes

None in `docs/data-schema.md`. Status-log shape changes, documented in `.bkit/core/.bkit/workflows.md` § `status.jsonl` — workflow state SoT (the event table's `test-run` row and a new `accepted-failures` row; the write / read table's `bkit tests accept` writer):

- **ADD:** `test-run.failedCases` — array of `{classname, name}`, at most 100, written on FAIL only.
- **ADD:** `test-run.failedCasesTruncated` — `true` when the run had more than 100 failing cases.
- **ADD:** `test-run.acceptedFailing` — count of failing cases that were on the accepted list (FAIL with `--accepted-from` only).
- **ADD:** row type `accepted-failures` — `{type, workflow, at, step, cases: [{classname, name}], reason, decision}`; a mark row (`MARK_ROWS` in `run-facts.ts` and its harvest copy in `scripts/harvest/bkit-harvest.mjs`), so step minutes skip it.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Record each failing case's `classname` + `name` on a FAIL | `.bkit/core/engine/commands/workflow/tests.ts` | Serena overview and `grep -n` in `tests.ts` for `parseJunit`, `countReportFailures` and `appendTestRun`; `grep -rn 'classname' .bkit/core/engine` (only test fixtures); `docs/capabilities.md` | `parseJunit` (`tests.ts:582`) reads `name` / state but drops `classname`; `countReportFailures` (`tests.ts:156`) counts but keeps no names; `appendTestRun` (`tests.ts:178`) writes the row | EXTEND | `JunitCase` gains `classname`; a sibling of `countReportFailures` returns the failing cases; `appendTestRun` carries `failedCases` / `failedCasesTruncated` / `acceptedFailing` through its existing `evidence` spread |
| Hand the gate the accepted cases | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rlnE` over `.bkit/core`, `.bkit/templates`, `scripts` and `vitest*.ts` for `quarantin`, `knownFail`, `BKIT_ACCEPTED`, `accepted-failures`, `testNamePattern` and `expected-red` (no mechanism; the audit templates forbid quarantine); `REPORT_DIR_ENV` pattern in `tests.ts:85` | `tests run` already passes `$BKIT_TEST_REPORT_DIR` through `runToLog`'s `env` (`tests.ts:124`, `:1863`) | EXTEND | Add `--accepted-from`; write the list next to the log and pass `BKIT_ACCEPTED_TESTS` in the same `env` object |
| Write an owner accept as a status row | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rn` over `.bkit/core/engine` for `"owner-pause"` and `MARK_ROWS`; `bkit status row --type=` in `status.ts:718`; `decisions apply` in `decisions.ts:435` | `status row` writes free-form rows but cannot read the test-run row's cases; `decisions apply --by=owner` writes ledger rows for assumed items only | EXTEND | New `accept` verb on the existing `testsCommand` (`tests.ts:1622`), which owns the `test-run` row it reads |
| List a step's latest failing cases for the pause | `.bkit/core/engine/commands/workflow/tests.ts` | `status route --require=verdict` (prints step-done rows only, `bkit-build.md:767`); `grep -n 'TEST_RUN_ROW' tests.ts` | No verb prints a `test-run` row's cases | EXTEND | New `failures` verb on `testsCommand`, reading the rows with `readStatusRows` as `appendTestRun` does |
| Keep the new row out of step minutes | `.bkit/core/engine/commands/workflow/run-facts.ts` | `grep -rn 'MARK_ROWS' .bkit/core/engine` | `MARK_ROWS` (`run-facts.ts:338`) lists the mark rows | EXTEND | Add `accepted-failures` |
| Keep harvest's step minutes equal to the engine's | `scripts/harvest/bkit-harvest.mjs` | `grep -rn 'MARK_ROWS' scripts/harvest`; `docs/knowledge.jsonl` `mark-rows-copies-must-stay-in-parity` | The hand-kept copy at `bkit-harvest.mjs:1479-1485`, pinned equal by `bkit-harvest.test.mjs` `MARK_ROWS is the engine's` | EXTEND | Add `accepted-failures` to the copy in the same change |
| Hand agents' changed-file self-checks the accepted cases | `.bkit/core/engine/commands/workflow/tests-changed.ts` | Read `testsChangedVerb` and `runLogged` (`tests-changed.ts:60-100`); `grep -n 'tests changed'` in `.bkit/core/prompts/bkit-build-plan-verify.md`, `bkit-build-plan-gaps-remediate.md` and `bkit-debug-failure-remediate.md` | `runLogged` already spawns the gate with `{...process.env, ...env}` | EXTEND | Add `--accepted-from`, writing the list with task 3's helper and passing `BKIT_ACCEPTED_TESTS` in the same `env` |
| Hand the pre-push gate the accepted cases | `.bkit/core/engine/commands/workflow/branches.ts` | Read `runPush` (`branches.ts:871-888`) and the push at `:1069`; `grep -rln 'push-gate' .bkit/core/engine/commands`; read `push-gate.ts:94-96` and `runGit` (`commands/lib.ts:666`); read `.bkit/templates/.husky/pre-push` | `runPush` already passes extra env to `git push` through `runGit`; `bkit ci push-gate` spawns the gate with `gitEnv()`, a copy of the inherited environment | EXTEND | Add `--accepted-from` to `branches push`, writing the list with task 3's helper and adding `BKIT_ACCEPTED_TESTS` to `runPush`'s env; no hook template or `push-gate` change |
| Pass accepts to agents' self-checks | `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `.bkit/core/prompts/bkit-debug-failure-remediate.md` | `grep -n 'tests changed'` in `.bkit/core/prompts/`; `grep -n 'Context:'` in `bkit-build.md` and `bkit-debug.md` | Each prompt runs `bkit tests changed --fallback=bkit:gate:static-unit`; their Contexts are dispatched at `bkit-build.md:679`, `:792`, `:836`, `:1030` and `bkit-debug.md:581` | EXTEND | Add `--accepted-from` when Context names the status file, and name it in each Context |
| Pass accepts to every workflow push | `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md` | `grep -n 'branches push'` in the three workflows | Build `:1082`, `:1183`; debug `:637`, `:667`, `:739`, `:750`, `:779`; ship `:274`, `:436`, `:567`, `:630`, `:792` | EXTEND | Add `--accepted-from="{STATUS}"` to each call |
| Show the accepted cases at ship | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n` in `.bkit/core/workflows/bkit-ship.md` for `tests run`, `accepted`, `Accept` and `assumed`; `decisions pending` (`decisions.ts:527`) | `decisions pending` lists assumed accepts from the feature's log folder at ship's Confirm Assumed Items step | EXTEND | `pending` also reads `{logDir}/status.jsonl` and prints `acceptedTests` |
| Ask the owner to accept named failures | `.bkit/core/workflows/bkit-build.md` | Read § Decision Pause (`bkit-build.md:127-298`); `grep -n 'PAUSE_QUESTION' bkit-build.md` | The pause's `VERIFY_GAPS` / `TESTS_LOOP` items and step 5 Accept | EXTEND | Add the named-failure item, the `onlyAccepted` item and the `tests accept` write |
| Pass accepts to every gate run | `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md` | `grep -n 'tests run' bkit-build.md bkit-debug.md` | Step 8 sub-step 8, Step 9 sub-step 3 Context, Step 12 sub-step 2, debug Step 3 sub-step 1 | EXTEND | Add `--accepted-from="{STATUS}"` to each call |
| Print accepted cases at ship | `.bkit/core/workflows/bkit-ship.md` | Read § Confirm Assumed Items (`bkit-ship.md:335-385`) | Step 1 already runs `decisions pending` | EXTEND | Hold `acceptedTests` and narrate them before routing |
| Document the runner contract | `.bkit/shared/docs/testing.md` | `grep -rln 'JUnit reports for bkit'` (source is `.bkit/shared/docs/testing.md`, mirrored to `docs/testing.md`) | § JUnit reports for bkit documents `$BKIT_TEST_REPORT_DIR` | EXTEND | Add § Accepted failures beside it |
| Document the group-gate exception and row fields | `.bkit/core/.bkit/workflows.md` | Read § Group gate (`workflows.md:1590-1597`), § Local gate scripts (`:1520`), the status-log event table (`:286-308`), the write / read table (`:317-328`), § Decision Pause (`:979-993`), the Step 8 row (`:766`) and the ship Confirm Assumed Items row (`:1119`) | "Strict, no exceptions" bullet; the `test-run` row shape (`:301`); "Group-gate failures are never items" (`:989`) | EXTEND | Rewrite the bullet to the owner-accept exception; add the new fields and row to the status-log tables; update the pause, Step 8 and ship rows |
| Integration test of the accept flow through the real CLI | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/*.integration.test.ts`; `grep -n` in `tests-lock.integration.test.ts` for `describe(` and `it(` | `tests-lock.integration.test.ts` spawns the CLI, but its fixture wraps every gate in `bkit-machine-lock.sh` and asserts lock events | NEW | Reason (b): its contract is the tests lock, and its callers (every case in it) assert lock start / end events; accept-flow cases would run inside a lock wrapper they do not test, and a lock-fixture change would break them. `branches-lock.integration.test.ts` was checked for the push cases (task 7) on the same grounds: its contract is the push's lock wait |

## Architecture & Component Changes

**Ledger rows:** `891-accepted-tests-skipped-by-the-gate-runner`, `891-accepted-test-identity-is-junit-classname-and-name`, `891-group-gate-named-failures-accepted-at-the-decision-pause`, `891-runner-less-tests-need-one-junit-case-per-test-name`, `891-check-accepted-failures-on-the-base-commit`, `891-debug-loop-question-offers-accept`, `891-bkit-repo-runners-skip-accepted-tests`, `891-tests-changed-honours-accepted-tests`

### Database Migrations

None. bkit has no database; status-log fields are listed under `Data Schema Changes`.

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** exists; `parseJunit` at `:582`, `countReportFailures` at `:156`, `appendTestRun` at `:178`, `testsCommand` at `:1622`, the `run` verb's verdict at `:1873`.
- `JunitCase` gains `classname: string` (`""` when the `<testcase>` has none); `parseJunit` reads it with `attr`. `judgeRed` / `judgeGreen` and `isNamedCase` keep matching on `name` only.
- New exported `failingCases(dir)`: every failing or erroring case across the report folder as `{classname, name}`, de-duplicated, in report order; `countReportFailures` keeps its contract (callers: the `run` verb only).
- New exported constant `ACCEPTED_ENV = "BKIT_ACCEPTED_TESTS"` and `MAX_FAILED_CASES = 100`.
- New exported helpers, the one place the accepted list is read, written and matched (tasks 4, 6 and 7 import them): `acceptedCases(statusFile)` (every `accepted-failures` row's cases, all workflows; `[]` when the file has none), `writeAcceptedList(path, cases)` (the JSON array `BKIT_ACCEPTED_TESTS` points at) and `matchAccepted(failing, accepted)` (splits failing cases into accepted and `unaccepted` on `classname` + `name`, and returns `onlyAccepted`).
- `run` verb:
  - New flag `--accepted-from` (string: a `status.jsonl`). It reads the cases with `acceptedCases`, writes them to `{log}.accepted.json` with `writeAcceptedList` (emptied each run, like `{log}.reports`), and passes its absolute path as `BKIT_ACCEPTED_TESTS` in the `runToLog` env. Without the flag, nothing is written or passed.
  - With `--ci-run`, the flag is accepted and ignored: the verb records the CI evidence and returns at `:1828` as today, writing no list.
  - The verdict still comes from the exit code (`:1873` unchanged).
  - On FAIL with named cases: output and row carry `failedCases` (first 100) and `failedCasesTruncated`; with `--accepted-from`, output carries `acceptedFailing` (count), `unaccepted` (cases) and `onlyAccepted` (every named failing case was on the list), and the row carries `acceptedFailing`. `onlyAccepted` logs one line: the gate's runners do not skip `$BKIT_ACCEPTED_TESTS` (`docs/testing.md` § Accepted failures, which task 3 writes).
- New verb `failures` (`use: "workflow"`): flags `--file`, `--workflow`, `--step`. Prints the latest `test-run` row of `--step` in the active run of `--workflow` (after its last `workflow-started` row, as `appendTestRun` finds it): `verdict`, `cases` (`{classname, name, accepted}`, matched with `matchAccepted`), `named` (`failures` non-null and cases recorded), `truncated`, `onlyAccepted`. Exit 0; exit 2 with a message naming the step when no row exists.
- New verb `accept` (`use: "workflow"`): flags `--file`, `--workflow`, `--step`, `--reason-file` (a file holding the owner's reason, which the orchestrator writes with its file-write tool), `--decision` (the decision file and question, for example `build-decision-1-2.md#Q2`). Reads the same latest row, takes its named cases not already accepted on `classname` + `name`, and appends one `accepted-failures` row with the reason byte for byte. Exit 0 written; exit 1 refused (verdict not FAIL, `failures` null, no recorded cases, or `failedCasesTruncated`), naming the reason; exit 2 usage (a missing flag, an empty reason file, no row).

#### [MODIFY] `.bkit/core/engine/commands/workflow/run-facts.ts`

- **Existence Check:** exists; `MARK_ROWS` at `:338`.
- Add `"accepted-failures"` to `MARK_ROWS`, so step minutes skip it.

#### [MODIFY] `scripts/harvest/bkit-harvest.mjs`

- **Existence Check:** exists; the hand-kept `MARK_ROWS` copy at `:1479-1485`, used at `:1629`.
- Add `"accepted-failures"`, so harvest's step minutes match the engine's; `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` pins the two equal.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests-changed.ts`

- **Existence Check:** exists; `testsChangedVerb` at `:97`, `runLogged` at `:63`.
- New flag `--accepted-from` (a `status.jsonl`): writes the accepted list with `writeAcceptedList` into the verb's temp dir and adds `BKIT_ACCEPTED_TESTS` to the env `runLogged` spawns `bkit:gate:changed` or the `--fallback` gate with. Without the flag, nothing is passed.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** exists; `runPush` at `:871`, the push at `:1069`.
- `push` verb gains `--accepted-from` (a `status.jsonl`): writes the accepted list with `writeAcceptedList` to a temp file and adds `BKIT_ACCEPTED_TESTS` to the env `runPush` hands `git push`, so the consumer's pre-push hook and its `bkit ci push-gate` gate inherit it (`push-gate.ts:94-96`). No change to `.bkit/templates/.husky/pre-push` or `push-gate.ts`. Without the flag, nothing is passed (Q4 A).

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** exists; `pending` verb at `:527`.
- `pending` also reads `{logDir}/status.jsonl` (when present) and prints `acceptedTests`: `[{step, classname, name, reason, decision}]`, one entry per accepted case, in row order. `count` and `--defer` stay about assumed items only.

#### [new] `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Integration test of the accept flow through the real CLI", reason (b).
- Spawns the real CLI with `requireTsx()` against a temp git repo whose `package.json` declares a `bkit:gate:static-unit` that writes JUnit into `$BKIT_TEST_REPORT_DIR` and skips the cases in `$BKIT_ACCEPTED_TESTS`; asserts the `status.jsonl` rows and exit codes (`docs/testing.md` § Spawning `bkit` from tests). The push cases (task 7) add a bare remote and a pre-push hook that runs the same fixture gate, and assert that `branches push --accepted-from` goes through, and is refused when a not-accepted case fails.

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** exists; § Decision Pause `:127-298`, Step 8 `:658-744`, Step 9 `:746-820`, Step 10 `:822-860`, Step 12 `:936-984`, Steps 15-16 pushes `:1082`, `:1183`.
- § Decision Pause step 2:
  - `VERIFY_GAPS` with `GATE_VERDICT` = FAIL, and `TESTS_LOOP`: run `tests failures --step=build-group-gate-{GROUP}` (verify) or `--step=build-run-tests` (tests). `onlyAccepted` = true → one hard-blocker item ("the gate does not skip accepted tests"; a failure with no test names may sit beside them), options `["Fix now", "Stop"]`, and drop `{LOOP_FLAGS}`, so no `Try again`. Else `named` = true and `truncated` = false → one hard-blocker item listing the not-yet-accepted cases, options `["Accept", "Fix now", "Stop"]`, saying an accept covers only these named tests. Else → no item, and the question text says the failure has no test names.
  - The named-failure item wins over a verify gap that names the gate's failing tests: write no separate gap item for them.
  - Replace "A group-gate failure is never an item, because it is always fixed." and "write no items, because failing suites are always fixed".
- § Decision Pause step 5, Accept by the owner, for a named-failure item: write the owner's reason to `{OUTBOX}/accept-reason-{DECISION}-{n}.txt` with the file-write tool, then run `tests accept --step=… --reason-file="{OUTBOX}/accept-reason-{DECISION}-{n}.txt" --decision="build-decision-{RUN}-{DECISION}.md#Q{n}"` before the `docs/decisions.jsonl` row; exit non-zero → **Failure Path**. The run then goes back to the gate's step: Step 8 for `From: verify`, Step 12 for `From: tests`.
- Step 8 sub-step 8, Step 9 sub-step 3 (`Group gate` command in Context) and Step 12 sub-step 2: add `--accepted-from="{STATUS}"`.
- Step 8 sub-step 8 holds `onlyAccepted` as `GATE_ONLY_ACCEPTED`; sub-step 11's route gains a first arm: exit 0 **and** a gate FAIL with `GATE_ONLY_ACCEPTED` = true → the Decision Pause with `VERIFY_GAPS`, with no Step 9 round.
- Contexts of `@bkit-build-plan-verify` (`:679`, `:836`), `@bkit-build-plan-gaps-remediate` (`:792`) and `@bkit-debug-failure-remediate` (`:1030`): name `Accepted from`: `"{STATUS}"`.
- Steps 15 and 16 `branches push`: add `--accepted-from="{STATUS}"`.
- § Gate — Decision Pause: add a checkbox for the accept write.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** exists; Step 3 sub-step 1 at `:367-378`; the remediate Context at `:581`; `branches push` at `:637`, `:667`, `:739`, `:750`, `:779`.
- Add `--accepted-from="{STATUS}"` to the `tests run` call and to each `branches push`. Name `Accepted from`: `"{STATUS}"` in the `@bkit-debug-failure-remediate` Context. Debug writes no accept (Q3 A).

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** exists; § Confirm Assumed Items `:335-385`; `branches push` at `:274`, `:436`, `:567`, `:630`, `:792`.
- Step 1 holds `acceptedTests` as `ACCEPTED_TESTS`. **If** it is not empty → narrate `Built with {n} test(s) accepted as already failing on the base branch:` and one line per case, before routing. Routing on `ASSUMED_COUNT` is unchanged.
- Add `--accepted-from="{STATUS}"` to each `branches push` (Q4 A).

### Prompts

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `.bkit/core/prompts/bkit-debug-failure-remediate.md`

- **Existence Check:** exist; `bkit tests changed` at `bkit-build-plan-verify.md:84`, `bkit-build-plan-gaps-remediate.md:104`, `bkit-debug-failure-remediate.md:77`.
- **If** Context names `Accepted from` → add `--accepted-from="{that file}"` to the `bkit tests changed` call, so the self-check skips the owner-accepted cases instead of the agent editing them or reporting `BLOCKED`.

### Docs

#### [MODIFY] `.bkit/shared/docs/testing.md`

- **Existence Check:** exists; § JUnit reports for bkit at `:329`.
- New § Accepted failures (task 3): the `$BKIT_ACCEPTED_TESTS` contract (a JSON array of `{classname, name}`; skip each listed case; unset → run everything) with one example each for Vitest (`test.testNamePattern` from the file, plus a setup-file skip that reads `classname`), Jest and pytest (`PYTEST_ADDOPTS=-k`); the precision of each runner's skip (Vitest's `testNamePattern` matches the full name, not the file, so it also skips a same-named case in another file); and what happens when a runner ignores it.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** exists; the status-log event table `:286-308` (`test-run` row `:301`), the write / read table `:317-328`, Step 8 row `:766`, § Decision Pause `:979-993`, ship Confirm Assumed Items row `:1119`, § Local gate scripts `:1520`, § Group gate `:1590`.
- § Group gate: replace the "Strict, no exceptions" bullet with the owner-accept exception for named cases.
- § `status.jsonl` event table: the `test-run` row gains `failedCases`, `failedCasesTruncated` and `acceptedFailing`; a new `accepted-failures` row, marked "Step minutes skip it". The write / read table: `accepted-failures` → `bkit tests accept --file=`.
- § Decision Pause: `:981` names gate and suite failures among the pause causes, `:988` adds the named-failure and `onlyAccepted` hard blockers, and `:989` "Group-gate failures are never items" is replaced.
- Step 8 row (`:766`): a group-gate FAIL with `onlyAccepted` goes straight to the Decision Pause. Ship Confirm Assumed Items row (`:1119`): it lists the accepted tests.
- § Local gate scripts: only `--accepted-from` (on `tests run`, `tests changed` and `branches push`) and a pointer to `docs/testing.md` § Accepted failures for `$BKIT_ACCEPTED_TESTS`. Build Step 12 / debug Step 3 table rows mention `--accepted-from`.

#### [MODIFY] `.bkit/core/.bkit/prompts.md`

- **Existence Check:** exists; the purpose rows at `:337` (`bkit-build-plan-verify`), `:338` (`bkit-build-plan-gaps-remediate`) and `:351` (`bkit-debug-failure-remediate`).
- Each of the three purpose rows says its `bkit tests changed` self-check skips the owner-accepted cases when Context names `Accepted from`, as the `Index updates` rule requires with a prompt edit.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. The architecture has no `[DELETE]` row: the change extends `tests run`, the Decision Pause and `decisions pending`, and replaces two sentences of workflow text ("A group-gate failure is never an item …", "Strict, no exceptions …") in place.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None at plan time; the build's agents add a row if a runner's skip wiring has a gotcha. |
| `docs/decisions.jsonl` | Three rows written at plan time (`**Ledger rows:**`); plan review updated `891-accepted-tests-skipped-by-the-gate-runner` to cover the self-checks and pushes and to mark it pending Q2. The Decision Pause keeps writing one row per owner accept. |
| `docs/architecture.md` | None: no new component or boundary. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None: bkit has no database. |
| `docs/design.md` | None: no UI. |
| `.bkit/shared/docs/testing.md` (mirrored to `docs/testing.md`) | New § Accepted failures: the `$BKIT_ACCEPTED_TESTS` contract, per-runner examples and each runner's skip precision (task 3, with the variable it documents). |
| `docs/testing.md` (project section below `bkit:end`) | § Key test files: the new `tests.test.ts` behaviours, `tests-changed.test.ts` `--accepted-from`, `decisions.test.ts` `acceptedTests`, and the new `tests-accepted.integration.test.ts` row (task 13). |
| `docs/observability.md` | None: the new fields land in `status.jsonl`, no new log stream. |
| `.bkit/core/.bkit/workflows.md` (mirrored to `.bkit/workflows.md`) | § Group gate exception; § `status.jsonl` event table (`test-run` fields, new `accepted-failures` row, "Step minutes skip it") and write / read table (`accepted-failures` → `bkit tests accept --file=`); § Decision Pause (`:981`, `:988`, `:989`); the Step 8 row (`:766`); the ship Confirm Assumed Items row (`:1119`); § Local gate scripts `--accepted-from` and the `$BKIT_ACCEPTED_TESTS` pointer only; the build Step 12 and debug Step 3 table rows (task 13). This is the workflow index the `Index updates` rule requires with any workflow edit. |
| `.bkit/core/.bkit/prompts.md` (mirrored to `.bkit/prompts.md`) | The purpose rows of the three prompts that run `bkit tests changed` say the self-check skips the owner-accepted cases (task 13). |
| `.bkit/core/.bkit/cli.md` (mirrored to `.bkit/cli.md`) | Regenerated by `pnpm cli:sync` in each task that adds a verb or flag (tasks 2, 3, 4, 6 and 7). |
| `docs/capabilities.md` | Refreshed with `pnpm bkit:graph:refresh` (staged files first) for the new exports and verbs (task 13). |

## Rollback Strategy

Code-only — `git revert` sufficient.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | bkit has no database. |
| **Code** | `git revert {COMMIT}` of the feature's squash commit, then `pnpm build` and `bkit upgrade` in consumers | Leftover `accepted-failures` rows and the extra `test-run` fields are ignored by a reverted engine; old status logs stay readable. |
| **Risk window** | None | Consumers pick the change up on `bkit upgrade`; a consumer that never wires `$BKIT_ACCEPTED_TESTS` behaves as before. |

## Agent Execution Runbook

Build order: the engine records, accepts and passes the cases (group 1); the engine lists them and hands them to self-checks and pushes (group 2); the workflows and prompts use them (group 3); the docs and generated outputs follow (group 4). Each group leaves `bkit:gate:static-unit` green: every task that adds a verb or flag regenerates `.bkit/core/.bkit/cli.md` (`cli-doc.test.ts`), and every task that edits `.bkit/core/engine/**/*.ts` rebuilds `dist/` in its own commit (`.agents/rules.md` § Engine builds; the pre-commit hook runs `pnpm bkit:check:dist`). Integration shape (advice only): one PR for all groups is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine — record, accept and pass accepted test cases

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Record each failing JUnit case's `classname` and `name` on a FAIL
  - **UPDATE:** `JunitCase` in `.bkit/core/engine/commands/workflow/tests.ts`: add `classname` (`""` when the `<testcase>` has none)
  - **UPDATE:** `parseJunit` in `.bkit/core/engine/commands/workflow/tests.ts`: read `classname` with `attr`
  - **UPDATE:** `countReportFailures` in `.bkit/core/engine/commands/workflow/tests.ts`: add an exported sibling `failingCases(dir)` returning the de-duplicated failing and erroring `{classname, name}` cases; `countReportFailures` keeps its count contract
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb puts `failedCases` (at most `MAX_FAILED_CASES` = 100) and `failedCasesTruncated` on a FAIL's output and, through `appendTestRun`'s `evidence`, on its `test-run` row; the `output` help names both fields
  - **UPDATE:** `reads names, outcomes and failure messages, decoding entities` in `.bkit/core/engine/commands/workflow/tests.test.ts`: each expected `JunitCase` gains `classname` (`"f"` from the `passed` / `failed` helpers, `""` on a bare `<testcase>`); additive, no expectation removed
  - **UPDATE:** `keeps a failure's text as detail, CDATA as written and tags stripped` in `.bkit/core/engine/commands/workflow/tests.test.ts`: each expected `JunitCase` gains `classname: ""`; additive, no expectation removed
  - **READ:** `appendTestRun` in `.bkit/core/engine/commands/workflow/tests.ts`: the `evidence` spread the new fields ride on
  - **DONE WHEN:** a FAIL `test-run` row holds `failedCases` with `classname` and `name`; a PASS row holds neither field; `pnpm build && git add dist/` ran in the task's commit and `pnpm bkit:check:dist` exits 0; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reads each case's classname` fails on parsed cases carrying no `classname`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reads names, outcomes and failure messages, decoding entities` fails on the parsed cases carrying no `classname` where the updated expectation holds `"f"` and `""`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `keeps a failure's text as detail, CDATA as written and tags stripped` fails on the parsed cases carrying no `classname` where the updated expectation holds `""`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a FAIL records each failing case's classname and name on the test-run row` fails on the row having no "failedCases" field
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `caps the recorded failing cases at 100 and flags the run truncated` fails on all 101 cases being recorded with no "failedCasesTruncated" flag

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add `bkit tests accept`, which writes one `accepted-failures` status row
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: new `accept` verb (`use: "workflow"`) with `--file`, `--workflow`, `--step`, `--reason-file`, `--decision`; it reads the latest `test-run` row of `--step` in the active run of `--workflow` (after that workflow's last `workflow-started` row), takes its named failing cases not already in an `accepted-failures` row on `classname` + `name`, and appends `{type: "accepted-failures", workflow, at, step, cases, reason, decision}` with the reason read from `--reason-file` byte for byte; exit 1 naming the reason when the row is not FAIL ("not a FAIL"), has `failures` null ("has no test names"), has no `failedCases` or is truncated ("truncated"); exit 2 on a missing flag, an empty reason file or a missing row
  - **UPDATE:** `MARK_ROWS` in `.bkit/core/engine/commands/workflow/run-facts.ts`: add `"accepted-failures"`
  - **UPDATE:** `MARK_ROWS` in `scripts/harvest/bkit-harvest.mjs`: add `"accepted-failures"` to the hand-kept copy (`:1479-1485`), so harvest's step minutes match the engine's
  - **UPDATE:** `MARK_ROWS is the engine's` in `scripts/harvest/bkit-harvest.test.mjs`: add `"accepted-failures"` to the list of rows asserted as mark rows (`:3028`); additive
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **READ:** `appendTestRun` in `.bkit/core/engine/commands/workflow/tests.ts`: how the active run's rows are found (last `workflow-started` row of the same workflow, `tests.ts:196-198`)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit tests accept` appends exactly one `accepted-failures` row per call that names cases, and refuses the four cases above with exit 1 and the named reason; `pnpm test:harvest` passes; `cli-doc.test.ts` passes; `pnpm build && git add dist/` ran in the task's commit and `pnpm bkit:check:dist` exits 0; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `writes one accepted-failures row with the step's latest failing cases, reason and decision` fails on no "accepted-failures" row being appended
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `writes only the cases not already accepted` fails on an already accepted case being written a second time
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `writes a same-named case from another file as not yet accepted` fails on the case being treated as accepted when only its `name` matches an earlier accept
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `refuses a run whose failures have no test names` fails on the call not exiting 1 with "has no test names" for a FAIL with `failures` null
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `refuses a truncated run` fails on the call not exiting 1 with "truncated" for a run flagged `failedCasesTruncated`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `refuses a PASS run` fails on the call not exiting 1 with "not a FAIL" for a PASS
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `writes the reason from --reason-file byte for byte` fails on the row's `reason` differing from a file holding a quote, a backtick and `$(`
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `an accepted-failures row adds no step minutes` fails on the minutes before an `accepted-failures` row being counted to the next step
    - `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` fails on "accepted-failures is a mark row" when harvest's copy lacks the row type

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `bkit tests run --accepted-from` hands the gate the accepted cases as `$BKIT_ACCEPTED_TESTS`
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts`: the accept flow through the real CLI (`requireTsx()`), with a fixture gate that writes JUnit into `$BKIT_TEST_REPORT_DIR` and skips the cases listed in `$BKIT_ACCEPTED_TESTS`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: new exported helpers `acceptedCases(statusFile)`, `writeAcceptedList(path, cases)` and `matchAccepted(failing, accepted)` — the one place the accepted list is read, written and matched on `classname` + `name`, which tasks 4, 6 and 7 import
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb gains `--accepted-from` (a `status.jsonl`); it collects every `accepted-failures` row's cases with `acceptedCases`, writes them with `writeAcceptedList` to `{log}.accepted.json` (emptied each run), and passes the absolute path as `BKIT_ACCEPTED_TESTS` in the `runToLog` env; with `--ci-run` the flag is accepted and no list is written; on FAIL it emits `acceptedFailing`, `unaccepted` and `onlyAccepted` from `matchAccepted`, puts `acceptedFailing` on the row, and logs one line when `onlyAccepted` is true saying the gate's runners do not skip `$BKIT_ACCEPTED_TESTS` (`docs/testing.md` § Accepted failures); the verdict still comes from the exit code
  - **UPDATE:** `.bkit/shared/docs/testing.md`: new § Accepted failures after § JUnit reports for bkit — the variable holds a path to a JSON array of `{classname, name}`; each runner in a gate skips the listed cases; unset → run everything; one example each for Vitest (`test.testNamePattern` built from the file in its config, plus a setup-file skip that reads `classname`), Jest (`testNamePattern`) and pytest (`PYTEST_ADDOPTS="-k not …"`); the precision of each runner's skip (Vitest's `testNamePattern` matches the full test name, not the file, so it also skips a same-named case in another file); a runner that ignores it keeps failing, and the build's pause says so
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **READ:** `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts`: the `env` object `$BKIT_TEST_REPORT_DIR` already rides in
  - **READ:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb's `--ci-run` branch (`:1790-1828`) returns before any gate runs
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** a gate run with `--accepted-from` sees `BKIT_ACCEPTED_TESTS` pointing at a file holding the accepted cases; a gate run without the flag sees no such variable; a `--ci-run --accepted-from` call exits and writes its row as today; `docs/testing.md` § Accepted failures exists in the shared source; `cli-doc.test.ts` passes; `pnpm build && git add dist/` ran in the task's commit and `pnpm bkit:check:dist` exits 0; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `hands the gate every accepted case as BKIT_ACCEPTED_TESTS` fails on the gate seeing no `BKIT_ACCEPTED_TESTS` variable
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a FAIL whose named failing cases are all accepted reports onlyAccepted` fails on "onlyAccepted" being absent or false, on the row carrying no "acceptedFailing", or on no line saying the runners do not skip `$BKIT_ACCEPTED_TESTS`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a new failing case beside accepted ones reports onlyAccepted false and lists it as unaccepted` fails on the new case missing from "unaccepted"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `passes BKIT_ACCEPTED_TESTS only to a run with --accepted-from` fails on the flagged run seeing no `BKIT_ACCEPTED_TESTS`, or on the next run without the flag still seeing it or taking a verdict other than its exit code
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `an accept of a.test.ts > x leaves a failing b.test.ts > x unaccepted` fails on the `b.test.ts` case missing from "unaccepted"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `hands the gate an empty list when the status file has no accepted-failures rows` fails on the gate seeing no `BKIT_ACCEPTED_TESTS`, or its file not holding an empty array
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `with --ci-run, --accepted-from is accepted and writes no list` fails on the call refusing the flag, writing an accepted list, or writing a CI `test-run` row that differs from today's
    - `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` `a gate red on cases goes green once they are accepted and the gate skips them` fails on the second gate run exiting 1 after `tests accept`
    - `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` `a new failing case still fails the gate after an accept` fails on the gate passing while a not-accepted case fails, or on "unaccepted" not naming the new case

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Engine — list accepted cases, show them at ship, hand them to self-checks and pushes

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Add `bkit tests failures`, which prints a step's latest failing cases for the Decision Pause
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: new `failures` verb (`use: "workflow"`) with `--file`, `--workflow`, `--step`; it prints the latest `test-run` row of `--step` in the active run of `--workflow` (after that workflow's last `workflow-started` row) as `verdict`, `cases` (`{classname, name, accepted}`), `named` (`failures` non-null and `failedCases` recorded), `truncated` and `onlyAccepted`; exit 0; exit 2 with a message naming the step and saying it has "no test-run row" when no row exists
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: `matchAccepted`, which task 3 adds — the one `onlyAccepted` rule, shared with `tests run`, so the pause and the gate cannot disagree
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** `bkit tests failures` prints the four fields for a FAIL row and exits 2 naming the step for a step with no row; `cli-doc.test.ts` passes; `pnpm build && git add dist/` ran in the task's commit and `pnpm bkit:check:dist` exits 0; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `lists the latest run's failing cases of a step with their accepted flags` fails on "cases" missing or every `accepted` flag false after an accept
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reports named false for a FAIL with no test names` fails on "named" being true for a FAIL with `failures` null
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reports onlyAccepted when every failing case is accepted` fails on "onlyAccepted" being false when every recorded case is accepted
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `exits 2 when the step has no test-run row` fails on stderr saying `unknown verb` instead of naming the step with "no test-run row"

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `bkit decisions pending` lists the feature's accepted failing tests
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `pending` verb also reads `{logDir}/status.jsonl` when present and prints `acceptedTests` (`[{step, classname, name, reason, decision}]`, row order); `count` and `--defer` stay about assumed items
  - **READ:** `decisionFiles` in `.bkit/core/engine/commands/workflow/decisions.ts`: how `logDir` is resolved from `--root`, `--month` and `--fid`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `decisions pending` prints `acceptedTests` with one entry per accepted case, and `[]` when none; `pnpm build && git add dist/` ran in the task's commit and `pnpm bkit:check:dist` exits 0; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `pending lists the feature's accepted failing tests from status.jsonl` fails on "acceptedTests" being absent from the output
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `pending prints an empty acceptedTests when the log has no accepted-failures row` fails on "acceptedTests" being undefined instead of an empty list

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `bkit tests changed --accepted-from` hands agents' changed-file self-checks the accepted cases
  - **UPDATE:** `testsChangedVerb` in `.bkit/core/engine/commands/workflow/tests-changed.ts`: new flag `--accepted-from` (a `status.jsonl`); it writes the accepted cases with `acceptedCases` and `writeAcceptedList` into the verb's temp dir and adds `BKIT_ACCEPTED_TESTS` to the `env` `runLogged` spawns `bkit:gate:changed` or the `--fallback` gate with; without the flag, nothing is passed
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: `acceptedCases` and `writeAcceptedList`, which task 3 adds — they read the status file's accepted cases and write the list `BKIT_ACCEPTED_TESTS` points at
  - **DEPENDS ON:** 3
  - **DONE WHEN:** a `tests changed --accepted-from` run's gate sees `BKIT_ACCEPTED_TESTS` pointing at the accepted cases, and a run without the flag sees none; `cli-doc.test.ts` passes; `pnpm build && git add dist/` ran in the task's commit and `pnpm bkit:check:dist` exits 0; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `passes BKIT_ACCEPTED_TESTS to the gate only with --accepted-from` fails on the flagged run's gate seeing no `BKIT_ACCEPTED_TESTS`, or the run without the flag seeing it
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `the accepted list holds every accepted case of the status file` fails on the list file missing a case an `accepted-failures` row names

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `bkit branches push --accepted-from` hands the pre-push gate the accepted cases (Q4 A)
  - **UPDATE:** `branchesCommand` in `.bkit/core/engine/commands/workflow/branches.ts`: the `push` verb gains `--accepted-from` (a `status.jsonl`); it writes the accepted cases with `acceptedCases` and `writeAcceptedList` to a temp file removed after the push; without the flag, nothing is passed
  - **UPDATE:** `runPush` in `.bkit/core/engine/commands/workflow/branches.ts`: adds `BKIT_ACCEPTED_TESTS` to the env it hands `git push` through `runGit`, so the consumer's pre-push hook and its `bkit ci push-gate` gate inherit it
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts`: the push cases — a bare remote and a pre-push hook that runs the same fixture gate
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **READ:** `.bkit/core/engine/commands/ci/push-gate.ts`: the gate spawn at `:94-96` passes the inherited environment (`gitEnv()`), so no change is needed there
  - **READ:** `.bkit/templates/.husky/pre-push`: the hook runs `bkit ci push-gate` with the environment `git push` gave it, so no template change is needed
  - **DEPENDS ON:** 3
  - **DONE WHEN:** a `branches push --accepted-from` goes through a pre-push gate that skips the accepted cases, and is refused when a not-accepted case fails; `cli-doc.test.ts` passes; `pnpm build && git add dist/` ran in the task's commit and `pnpm bkit:check:dist` exits 0; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` `a branches push with --accepted-from goes through a pre-push gate that skips the accepted cases` fails on the push being refused by the hook's gate, or on the remote not holding the pushed commit
    - `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` `a branches push with --accepted-from is refused when a not-accepted case fails in the hook's gate` fails on the push failing for a reason other than the hook's gate naming the not-accepted case

<!-- bkit:task 7 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Workflows and prompts — ask, pass and show the accepted cases

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** The build Decision Pause asks the owner to accept named gate and suite failures, and writes the accept
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 2 — for `VERIFY_GAPS` with `GATE_VERDICT` = FAIL and for `TESTS_LOOP`, run `"{BKIT}" tests failures --file="{STATUS}" --workflow=build --step={build-group-gate-{GROUP} | build-run-tests}`; `onlyAccepted` = true → one hard-blocker item (the gate does not skip accepted tests; a failure with no test names, such as lint or a type check, may sit beside them; `docs/testing.md` § Accepted failures), options `["Fix now", "Stop"]`, and `{LOOP_FLAGS}` empty so no `Try again`; else `named` = true and `truncated` = false → one hard-blocker item listing the not-yet-accepted cases, options `["Accept", "Fix now", "Stop"]`, whose question says an accept covers only these named tests and only you can say they already fail on the base branch; else no item, and the loop question says the failure has no test names, so an accept cannot cover it. The named-failure item wins over a verify gap that names the gate's failing tests: write no separate gap item for them, so an `Accept` always runs `tests accept`. Replace the two sentences "A group-gate failure is never an item, because it is always fixed." and "write no items, because failing suites are always fixed".
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 5, Accept by the owner on a named-failure item — first write the owner's reason to `{OUTBOX}/accept-reason-{DECISION}-{n}.txt` with the file-write tool, then run `"{BKIT}" tests accept --file="{STATUS}" --workflow=build --step=… --reason-file="{OUTBOX}/accept-reason-{DECISION}-{n}.txt" --decision="build-decision-{RUN}-{DECISION}.md#Q{n}"` (step from the decision file's `From` and `Group` headers, so a resumed pause writes it too; exit non-zero → **Failure Path**), then the existing `docs/decisions.jsonl` row; the run then goes back to the gate's step: Step 8 for `From: verify`, Step 12 for `From: tests`; § Gate — Decision Pause gains `- [ ] Named failures accepted through \`tests accept\``
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file bkit-build.md` before editing sentences in `bkit-build.md` (`.agents/rules.md` § Shared instructions)
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** § Decision Pause holds the `tests failures` read, the three item shapes, the `tests accept --reason-file` write and the return to Step 8 or Step 12; `vitest run .bkit/core/engine/render` passes against the regenerated snapshot; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the Decision Pause writes a gate or suite accept through bkit tests accept` fails on the pause holding no "tests accept" call with `--reason-file`
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the Decision Pause reads named failures with bkit tests failures for VERIFY_GAPS and TESTS_LOOP` fails on the pause holding no "tests failures" call for either question
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the pause drops the loop question when onlyAccepted is true` fails on no `onlyAccepted` branch setting `{LOOP_FLAGS}` empty
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the pause says a failure with no test names cannot be accepted` fails on the no-names branch writing an item or not saying the failure "has no test names"
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the named-failure item wins over a verify gap naming the gate's failing tests` fails on the `VERIFY_GAPS` branch still writing a gap item for the gate's failing tests

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Every build and debug gate run passes `--accepted-from="{STATUS}"`, and Step 8 sends an all-accepted FAIL straight to the pause
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8, the Step 9 sub-step 3 `Group gate` command in the subagent Context, and Step 12 sub-step 2 each add `--accepted-from="{STATUS}"` to `tests run`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 holds `onlyAccepted` as `GATE_ONLY_ACCEPTED`; sub-step 11's route gains a first arm — exit 0 **and** `GATE_VERDICT` = FAIL **and** `GATE_ONLY_ACCEPTED` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**, with no Step 9 round, because no round can change accepted cases
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 3 sub-step 1 adds `--accepted-from="{STATUS}"` to `tests run` (both the local and the CI-evidence mode, which task 3 makes accept the flag)
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with the same command
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file bkit-build.md` and `pnpm instructions:show --file bkit-debug.md` before editing sentences in them
  - **DEPENDS ON:** 3, 8
  - **DONE WHEN:** every `tests run --gate` call in `bkit-build.md` (Step 8 sub-step 8, the Step 9 Context `Group gate` command, Step 12 sub-step 2) and in `bkit-debug.md` (Step 3) carries `--accepted-from="{STATUS}"`; Step 8 sub-step 11 routes `GATE_ONLY_ACCEPTED` = true to the Decision Pause; `vitest run .bkit/core/engine/render` passes against the regenerated snapshots; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every build and debug tests run gate call passes --accepted-from with the status file` fails on a `tests run --gate` call with no "--accepted-from" flag
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the Step 9 Group gate command in Context passes --accepted-from` fails on the prose `Context:` line's `Group gate` command carrying no "--accepted-from" flag
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `Step 8 sends a gate FAIL with onlyAccepted straight to the Decision Pause` fails on sub-step 11 holding no `GATE_ONLY_ACCEPTED` arm that routes to the Decision Pause before the Step 9 arm

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** `/bkit-ship` shows the accepted tests to the owner before the merge gate
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: § Confirm Assumed Items step 1 holds `acceptedTests` as `ACCEPTED_TESTS`; **If** it is not empty → narrate `Built with {n} test(s) accepted as already failing on the base branch:` and one line per case (`{classname} > {name}`, its reason) before the existing routing; the routing on `ASSUMED_COUNT` is unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file bkit-ship.md` before editing sentences in `bkit-ship.md`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the ship step holds and narrates `ACCEPTED_TESTS`; `vitest run .bkit/core/engine/render` passes against the regenerated snapshot; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship lists the accepted tests from decisions pending before the merge gate` fails on the Confirm Assumed Items step holding no "acceptedTests" value

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** The verify and remediate agents' `bkit tests changed` self-checks pass the accepted cases
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the `bkit tests changed` step (`:84`) — **If** Context names `Accepted from` → add `--accepted-from="{that file}"`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: the `bkit tests changed` step (`:104`), the same way
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: the `bkit tests changed` step (`:77`), the same way
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the Contexts of `@bkit-build-plan-verify` (`:679`, `:836`), `@bkit-build-plan-gaps-remediate` (`:792`) and `@bkit-debug-failure-remediate` (`:1030`) name `Accepted from`: `"{STATUS}"`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `@bkit-debug-failure-remediate` Context (`:581`) names `Accepted from`: `"{STATUS}"`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with the same command
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file {basename}` for each of the three prompts and the two workflows before editing sentences in them
  - **DEPENDS ON:** 6, 9
  - **DONE WHEN:** each of the three prompts passes `--accepted-from` to `bkit tests changed` when Context names `Accepted from`; each of the five Contexts names it; `vitest run .bkit/core/engine/render` passes against the regenerated snapshots; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every prompt that runs bkit tests changed passes --accepted-from from its Context` fails on a prompt's `bkit tests changed` step with no "--accepted-from"
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every Context that dispatches a prompt running bkit tests changed names Accepted from` fails on a build or debug `Context:` line for those prompts with no "Accepted from"

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Every build, debug and ship `branches push` passes `--accepted-from="{STATUS}"` (Q4 A)
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Steps 15 and 16 `branches push` (`:1082`, `:1183`) add `--accepted-from="{STATUS}"`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: each `branches push` (`:637`, `:667`, `:739`, `:750`, `:779`) adds `--accepted-from="{STATUS}"`
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: each `branches push` (`:274`, `:436`, `:567`, `:630`, `:792`) adds `--accepted-from="{STATUS}"`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with the same command
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with the same command
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file {basename}` for the three workflows before editing sentences in them
  - **DEPENDS ON:** 7, 10, 11
  - **DONE WHEN:** every `branches push` call site in `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md` carries `--accepted-from="{STATUS}"`; `vitest run .bkit/core/engine/render` passes against the regenerated snapshots; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every branches push call site passes --accepted-from with the status file` fails on a build, debug or ship `branches push` call with no "--accepted-from" flag

<!-- bkit:task 12 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Docs and generated outputs

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Document the accept path in the workflow and prompt catalogs, and regenerate the generated outputs
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate replaces the "Strict, no exceptions" bullet with the owner-accept exception for named cases
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § `status.jsonl` event table (`:286-308`) — the `test-run` row (`:301`) gains `failedCases`, `failedCasesTruncated` and `acceptedFailing`, and a new `accepted-failures` row is marked "Step minutes skip it"; the write / read table (`:317-328`) gains `accepted-failures` → `bkit tests accept --file=`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Decision Pause — `:981` names gate and suite failures among the pause causes, `:988` adds the named-failure and `onlyAccepted` hard blockers, and `:989` "Group-gate failures are never items" is replaced by the named-failure rule
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the Step 8 row (`:766`) names the `onlyAccepted` route to the Decision Pause; the ship Confirm Assumed Items row (`:1119`) names the accepted-tests listing; the build Step 12 and debug Step 3 table rows name `--accepted-from`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Local gate scripts names only `--accepted-from` (on `tests run`, `tests changed` and `branches push`) and points to `docs/testing.md` § Accepted failures for `$BKIT_ACCEPTED_TESTS`
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the purpose rows of `bkit-build-plan-verify` (`:337`), `bkit-build-plan-gaps-remediate` (`:338`) and `bkit-debug-failure-remediate` (`:351`) say the `bkit tests changed` self-check skips the owner-accepted cases when Context names `Accepted from`
  - **UPDATE:** `docs/testing.md`: the project § Key test files row for `commands/workflow/tests.test.ts` names the accept, failures and `--accepted-from` behaviours; the `tests-changed.test.ts` row names `--accepted-from`; a new row lists `commands/workflow/tests-accepted.integration.test.ts` (Integration)
  - **UPDATE:** `docs/capabilities.md`: refreshed with `pnpm bkit:graph:refresh` after staging the engine files, for the new exports and verbs
  - **DEPENDS ON:** 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  - **DONE WHEN:** `.bkit/workflows.md` holds no "Group-gate failures are never items" line and its event table holds an `accepted-failures` row; `pnpm bkit:generate` (build, `cli:sync`, `instructions:sync`, `bkit upgrade` mirrors, render snapshots) leaves no further diff on a second run; `pnpm bkit:graph:check` exits 0; `pnpm bkit check` and `pnpm bkit:check:dist` exit 0 as the final check
  - **TEST FIRST:** n/a — docs and regenerated outputs only (catalogs, mirrors, capability register); no behaviour change

<!-- bkit:task 13 end -->

<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened; a gate run without `--accepted-from` behaves exactly as before.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** the new `test-run` fields and the `accepted-failures` row appear in `status.jsonl` as `docs/observability.md` describes for status rows.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared `bkit:gate:*` script that runs the integration tier), `pnpm bkit check` and `pnpm bkit:check:dist` pass.
- [ ] **Test Synchronization:** no E2E test exists for these surfaces; the workflow audits `local-gate-audit.test.ts` and `ship-invariants.test.ts` and the render snapshots for `bkit-build`, `bkit-debug` and `bkit-ship` are updated in tasks 8-12.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` holds `**/*.test.ts`, which keeps `tests-accepted.integration.test.ts` and its fixture gate out of `dist/`; `pnpm bkit:check:dist` confirms `dist/` holds no test file.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/tests.test.ts`):** `classname` parsing (new and updated cases), `failedCases` recording and its cap, `tests accept` with its `classname` + `name` matching, `--reason-file` and its refusals, `--accepted-from` and `BKIT_ACCEPTED_TESTS` (with, without, empty list, `--ci-run`), `onlyAccepted`, and `tests failures`; each case uses its own temp dir and status file.
- [ ] **Unit (`tests-changed.test.ts`, `run-facts.test.ts`, `decisions.test.ts`, `scripts/harvest/bkit-harvest.test.mjs`):** `tests changed --accepted-from` hands the gate the list; the `accepted-failures` mark row adds no step minutes in the engine and in harvest; `decisions pending` prints `acceptedTests`.
- [ ] **Unit (`local-gate-audit.test.ts`, `ship-invariants.test.ts`):** the build pause, the Step 8 `onlyAccepted` arm, the gate calls and Contexts of build and debug, the prompts' `tests changed` calls, every workflow `branches push`, and ship's listing hold the new commands.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts`):** the real CLI runs a fixture gate red, accepts its cases, and runs it green; a new failing case still fails and is named in `unaccepted`; a `branches push --accepted-from` goes through a real pre-push hook that skips the accepted cases and is refused on a not-accepted one; temp dirs are removed after each test.
- [ ] **Apply local migrations:** not applicable; the change adds no database migration.
- [ ] **Run all tests:** `pnpm test`, `pnpm test:integration` and `pnpm test:harvest` pass.
- [ ] **Dogfood:** after `pnpm build`, in a scratch consumer directory, `node dist/cli.js tests run --gate=<fake gate>` fails on two named cases, `tests accept --step=… --reason-file=…` writes one `accepted-failures` row, and `tests run --accepted-from=<status.jsonl>` passes with a gate that skips the cases in `$BKIT_ACCEPTED_TESTS`, and fails with `onlyAccepted` true with a gate that ignores it; `branches push --accepted-from=<status.jsonl>` goes through a pre-push hook whose gate skips the cases.
- [ ] **Completeness:** on a dogfood build that pauses on named failures, `bkit completeness check` reports the new `tests failures` / `tests accept` journal entries of § Decision Pause as matching the workflow contract (`checks/status-holes.ts` `workflowCalls`); the check is advisory, so a mismatch is otherwise unseen.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a consumer repo whose `dev` has one red unit test and whose Vitest config reads `$BKIT_ACCEPTED_TESTS` into `testNamePattern` (`docs/testing.md` § Accepted failures), start `/bkit-build` on an issue with 2 task groups; the group-1 pause asks once about the named test with `Accept`, `Fix now` and `Stop`.
- [ ] **Step 2:** Answer `Accept` with a reason; `status.jsonl` holds one `accepted-failures` row naming the test, and group 1's gate passes on the next round.
- [ ] **Step 3:** Group 2 and the Step 12 run pass with the accepted test skipped; a test the build breaks still fails its gate; the Step 15 push goes through the consumer's pre-push hook.
- [ ] **Step 4:** `/bkit-ship` lists the accepted test with its reason before its merge gate.
- [ ] **Step 5:** With a runner that ignores `$BKIT_ACCEPTED_TESTS`, the pause says the gate does not skip accepted tests and offers no `Try again`.
