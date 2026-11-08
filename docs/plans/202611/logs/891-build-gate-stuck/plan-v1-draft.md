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
- Keep the gate's exit code truthful: the gate itself skips the accepted cases, so every later stage of a chained gate (`&&`) still runs. A gate that cannot skip them keeps failing, and the pause says so plainly with no `Try again`.
- Show the accepted cases to the owner at `/bkit-ship` before merge.

The plan diverges from the issue comment's decision 3 ("`tests run` … returns PASS when every failing case is accepted"). A verdict override in the engine gives a false PASS whenever a gate chains stages with `&&`, because the chain stops at the failing tier: this repo's own `bkit:gate:static-unit` would never run `pnpm bkit:test:bats`, and Step 12's `bkit:gate:static-unit-integration` would never run `pnpm test:integration`. `Open Questions & Assumptions` Q2 puts both options to the owner.

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
- **WHEN** the owner answers `Accept` **→ THEN** bkit records the exact cases (`classname` + `name`) for the feature, and Step 8 runs again.
- **WHEN** a later gate runs (Step 8, Step 9's remediate gate, Step 12, debug Step 3) **→ THEN** the gate receives the accepted cases in `$BKIT_ACCEPTED_TESTS`, skips them, and passes when nothing else fails; groups 2+ start.
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
5. Groups 2-6 build; Step 12 passes with the same 3 cases skipped. `/bkit-ship` prints "Built with 3 test(s) accepted as already failing on the base branch" and names each before the merge gate.

**Outcome:** All 6 groups are built, and the 3 accepted cases are named in the build's decision file, in `status.jsonl` and in the ship session before merge.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A failure with no test name: lint, type checks and other steps that write no JUnit report (issue comment, decision 2) | No `Accept` item: the pause says the failure has no test names, so an accept cannot cover it, and the gate still fails |
| A new test fails beside the accepted ones | The gate fails; the pause lists only the not-yet-accepted cases |
| The gate's runner ignores `$BKIT_ACCEPTED_TESTS`, so accepted cases still fail | `tests run` reports `onlyAccepted: true`; the pause writes one hard-blocker item ("the gate does not skip accepted tests") with `Fix now` / `Stop` and no loop question, so no `Try again` |
| More than 100 failing cases in one run | The row records the first 100 and `failedCasesTruncated: true`; `tests accept` refuses, so the owner fixes the base branch or answers `Fix now` |
| A test file is renamed or a case is renamed after the accept | The renamed case no longer matches the accepted `classname` + `name`, so it fails the gate and the pause asks again |
| An accepted test starts passing (the base branch was fixed and merged in) | The gate passes; the accept is harmless and stays on record |
| Headless run (`ask` = false, or a cloud runtime) | The `Accept` item is a hard blocker with no recommendation, so `decisions apply --by=headless` exits 4 and the run goes to the **Failure Path**, as today |
| Two cases share a `name` in different files | Only the case whose `classname` and `name` both match is accepted |
| `tests run` without `--accepted-from` (pre-push hook, a by-hand run) | No accepted cases are passed, and the verdict comes from the exit code exactly as before |
| `--accepted-from` names a status file with no `accepted-failures` rows | The gate gets an empty list, and behaviour is unchanged |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `parseJunit` reads each case's `classname` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| A FAIL records each failing case's `classname` and `name` on the test-run row and in the output | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| More than 100 failing cases are capped and flagged `failedCasesTruncated` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `tests accept` writes an `accepted-failures` row with the step's latest failing cases, the reason and the decision reference | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `tests accept` refuses a run whose failure has no test names (failures null) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `tests accept` refuses a truncated run and a PASS run | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| An `accepted-failures` row adds no step minutes | Unit | `.bkit/core/engine/commands/workflow/run-facts.test.ts` | 2 |
| `--accepted-from` hands the gate every accepted case of the status file as `$BKIT_ACCEPTED_TESTS` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| A FAIL whose named failing cases are all accepted reports `onlyAccepted: true` and stays FAIL | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| A new failing case beside accepted ones fails with `onlyAccepted: false` and lists the case as unaccepted | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| A gate red on cases goes green once they are accepted and the runner skips them, and a new failure still fails it (real CLI, real status file) | Integration | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | 3 |
| `tests failures` lists the latest run's failing cases of a step, each with its `accepted` flag, plus `named`, `truncated` and `onlyAccepted` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `decisions pending` lists the feature's accepted failing tests from its `status.jsonl` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 5 |
| The Decision Pause writes a gate or suite accept through `bkit tests accept` and lists named failures as one hard-blocker item | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 6 |
| The pause composes no loop question (no `Try again`) when `onlyAccepted` is true | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 6 |
| Every build and debug gate call of `tests run` passes `--accepted-from="{STATUS}"` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| Ship's Confirm Assumed Items step lists the accepted tests from `decisions pending` before the merge gate | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 8 |
| `decisions pending` prints an empty `acceptedTests` when the log has no `accepted-failures` row | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 5 |
| The Decision Pause reads named failures with `bkit tests failures` for `VERIFY_GAPS` and `TESTS_LOOP` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 6 |
| `tests failures` reports `named: false` for a FAIL with no test names | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `tests failures` exits 2 when the step has no test-run row | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `tests accept` writes only the cases not already accepted | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| A new failing case still fails the gate after an accept (real CLI) | Integration | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | 3 |

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
| `BKIT_ACCEPTED_TESTS` | env var passed to every `bkit:gate:*` that `tests run --accepted-from` runs | New consumer-facing contract beside `BKIT_TEST_REPORT_DIR`; a consumer opts in by making its runners skip the listed cases. Unset outside the build's and debug's gate runs, so pre-push and CI are unaffected. |
| `bkit tests run --accepted-from=<status.jsonl>` | CLI flag | Additive. |
| `bkit tests failures` | CLI verb (`use: workflow`) | Reads the latest `test-run` row of a step. |
| `bkit tests accept` | CLI verb (`use: workflow`) | Writes one `accepted-failures` row. |
| `accepted-failures` | `status.jsonl` row type | New mark row. |
| `failedCases`, `failedCasesTruncated`, `acceptedFailing` | `test-run` row and `tests run` output fields | Additive; `testRunProblem` (`.bkit/core/engine/ledgers/status.ts:121`) ignores unknown fields. |
| `onlyAccepted`, `unaccepted` | `tests run` output fields | Additive. |
| `acceptedTests` | `decisions pending` output field | Additive. |

Behaviour change to confirm: § Group gate in `.bkit/workflows.md` drops "Strict, no exceptions" for owner-accepted named cases. The Decision Pause gains items for gate and suite failures that it never asked about before.

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
  - **Default if unanswered:** B. The runbook below is written for B.
- **Open Question Q3:** Does `/bkit-debug` also offer an `Accept`, or only honour accepts the build recorded? → the owner decides at plan review.
  - **Options:** A) Honour only: debug Step 3 passes `--accepted-from`, and debug writes no new accept — debug's Loop Question is unchanged, but a base-red test first seen in debug still loops · B) Also offer `Accept` at debug's Loop Question — debug unblocks on its own, but it adds a pause item and an accept path to a second workflow.
  - **Recommended:** A) Honour only — the issue comment scopes debug to "the same handling" of the `tests run` verb, and build is where the accept is asked.
  - **Default if unanswered:** A.
- **Assumption:** Common runners can skip cases by name from an environment variable (Vitest `test.testNamePattern` in its config, Jest `testNamePattern`, pytest `-k` through `PYTEST_ADDOPTS`, a custom script by reading the JSON file) → if a consumer's runner cannot, its accepted cases keep failing, and the pause tells the owner the gate does not skip them; the build stays as stuck as today for that runner.
- **Assumption:** A JUnit case's `classname` + `name` identifies one test across gate runs → if a runner writes no `classname`, the match falls back to an empty `classname`, and two same-named cases in different files are accepted together.
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
| bkit's own Vitest, bats and `node:test` runners skipping `$BKIT_ACCEPTED_TESTS` | The runner contract is consumer-owned; the Integration row proves it with a fixture gate, and no Success Criterion needs bkit's own repo wired | Deferral `891-bkit-repo-runners-skip-accepted-tests` |
| `bkit tests changed` passing the accepted cases to agents' changed-file checks | Agent self-checks report and do not route the workflow; the orchestrator's gates, which the Success Criteria name, carry the accepts | Deferral `891-tests-changed-honours-accepted-tests` |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The status-holes sweep misses numbered and named `If` arms in workflow routing | `docs/failures.jsonl` `status-holes-misses-numbered-and-named-if-arms` (from #699, CLOSED; the row is still open) | Task 6 and 7 add routing arms to `.bkit/core/workflows/bkit-build.md` § Decision Pause and Step 8 | Keep deferred; the new arms reuse existing finish blocks, so the sweep's gap does not grow |
| The status-holes sweep flags `tasks tick` between two finish lines | `docs/failures.jsonl` `status-holes-tasks-tick-between-two-finish-lines` (#699) | `bkit-build.md` Step 8, which task 7 edits | Keep deferred; task 7 does not move the `tasks tick` block |
| Load-sensitive tests need a budget that holds under the full gate | #814 — Give load-sensitive tests a budget that holds under the full gate (OPEN) | Red group gates on a loaded machine are a different cause of a stuck gate; an accept must not be used to wave them through | Keep separate; the pause text says an accept is for tests already failing on the base branch |
| Friction triage parent | #843 — Friction triage (OPEN) | Parent of this issue | No action; this plan closes one of its items |

## Security & Privacy

- [ ] **New API Route** — not applicable: bkit has no API.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable as a server input; the owner's reason reaches `tests accept --reason` as a CLI flag, which the verb checks as a non-empty string before writing it.
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

None in `docs/data-schema.md`. Status-log shape changes, documented in `.bkit/core/.bkit/workflows.md` § Local gate scripts:

- **ADD:** `test-run.failedCases` — array of `{classname, name}`, at most 100, written on FAIL only.
- **ADD:** `test-run.failedCasesTruncated` — `true` when the run had more than 100 failing cases.
- **ADD:** `test-run.acceptedFailing` — count of failing cases that were on the accepted list (FAIL with `--accepted-from` only).
- **ADD:** row type `accepted-failures` — `{type, workflow, at, step, cases: [{classname, name}], reason, decision}`; a mark row (`MARK_ROWS`).

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Record each failing case's `classname` + `name` on a FAIL | `.bkit/core/engine/commands/workflow/tests.ts` | Serena overview and `grep -n` in `tests.ts` for `parseJunit`, `countReportFailures` and `appendTestRun`; `grep -rn 'classname' .bkit/core/engine` (only test fixtures); `docs/capabilities.md` | `parseJunit` (`tests.ts:582`) reads `name` / state but drops `classname`; `countReportFailures` (`tests.ts:156`) counts but keeps no names; `appendTestRun` (`tests.ts:178`) writes the row | EXTEND | `JunitCase` gains `classname`; a sibling of `countReportFailures` returns the failing cases; `appendTestRun` carries `failedCases` / `failedCasesTruncated` / `acceptedFailing` through its existing `evidence` spread |
| Hand the gate the accepted cases | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rlnE` over `.bkit/core`, `.bkit/templates`, `scripts` and `vitest*.ts` for `quarantin`, `knownFail`, `BKIT_ACCEPTED`, `accepted-failures`, `testNamePattern` and `expected-red` (no mechanism; the audit templates forbid quarantine); `REPORT_DIR_ENV` pattern in `tests.ts:85` | `tests run` already passes `$BKIT_TEST_REPORT_DIR` through `runToLog`'s `env` (`tests.ts:124`, `:1863`) | EXTEND | Add `--accepted-from`; write the list next to the log and pass `BKIT_ACCEPTED_TESTS` in the same `env` object |
| Write an owner accept as a status row | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rn` over `.bkit/core/engine` for `"owner-pause"` and `MARK_ROWS`; `bkit status row --type=` in `status.ts:718`; `decisions apply` in `decisions.ts:435` | `status row` writes free-form rows but cannot read the test-run row's cases; `decisions apply --by=owner` writes ledger rows for assumed items only | EXTEND | New `accept` verb on the existing `testsCommand` (`tests.ts:1622`), which owns the `test-run` row it reads |
| List a step's latest failing cases for the pause | `.bkit/core/engine/commands/workflow/tests.ts` | `status route --require=verdict` (prints step-done rows only, `bkit-build.md:767`); `grep -n 'TEST_RUN_ROW' tests.ts` | No verb prints a `test-run` row's cases | EXTEND | New `failures` verb on `testsCommand`, reading the rows with `readStatusRows` as `appendTestRun` does |
| Keep the new row out of step minutes | `.bkit/core/engine/commands/workflow/run-facts.ts` | `grep -rn 'MARK_ROWS' .bkit/core/engine` | `MARK_ROWS` (`run-facts.ts:338`) lists the mark rows | EXTEND | Add `accepted-failures` |
| Show the accepted cases at ship | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n` in `.bkit/core/workflows/bkit-ship.md` for `tests run`, `accepted`, `Accept` and `assumed`; `decisions pending` (`decisions.ts:527`) | `decisions pending` lists assumed accepts from the feature's log folder at ship's Confirm Assumed Items step | EXTEND | `pending` also reads `{logDir}/status.jsonl` and prints `acceptedTests` |
| Ask the owner to accept named failures | `.bkit/core/workflows/bkit-build.md` | Read § Decision Pause (`bkit-build.md:127-298`); `grep -n 'PAUSE_QUESTION' bkit-build.md` | The pause's `VERIFY_GAPS` / `TESTS_LOOP` items and step 5 Accept | EXTEND | Add the named-failure item, the `onlyAccepted` item and the `tests accept` write |
| Pass accepts to every gate run | `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md` | `grep -n 'tests run' bkit-build.md bkit-debug.md` | Step 8 sub-step 8, Step 9 sub-step 3 Context, Step 12 sub-step 2, debug Step 3 sub-step 1 | EXTEND | Add `--accepted-from="{STATUS}"` to each call |
| Print accepted cases at ship | `.bkit/core/workflows/bkit-ship.md` | Read § Confirm Assumed Items (`bkit-ship.md:335-385`) | Step 1 already runs `decisions pending` | EXTEND | Hold `acceptedTests` and narrate them before routing |
| Document the runner contract | `.bkit/shared/docs/testing.md` | `grep -rln 'JUnit reports for bkit'` (source is `.bkit/shared/docs/testing.md`, mirrored to `docs/testing.md`) | § JUnit reports for bkit documents `$BKIT_TEST_REPORT_DIR` | EXTEND | Add § Accepted failures beside it |
| Document the group-gate exception and row fields | `.bkit/core/.bkit/workflows.md` | Read § Group gate (`workflows.md:1590-1597`) and § Local gate scripts (`:1520`) | "Strict, no exceptions" bullet; the JUnit failure-count paragraph | EXTEND | Rewrite the bullet to the owner-accept exception; add the new fields |
| Integration test of the accept flow through the real CLI | `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/*.integration.test.ts`; `grep -n` in `tests-lock.integration.test.ts` for `describe(` and `it(` | `tests-lock.integration.test.ts` spawns the CLI, but its fixture wraps every gate in `bkit-machine-lock.sh` and asserts lock events | NEW | Reason (b): its contract is the tests lock, and its callers (every case in it) assert lock start / end events; accept-flow cases would run inside a lock wrapper they do not test, and a lock-fixture change would break them |

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
- `run` verb:
  - New flag `--accepted-from` (string: a `status.jsonl`). It reads every `accepted-failures` row in that file (all workflows), writes their cases as a JSON array to `{log}.accepted.json` (emptied each run, like `{log}.reports`), and passes its absolute path as `BKIT_ACCEPTED_TESTS` in the `runToLog` env. Without the flag, nothing is written or passed.
  - The verdict still comes from the exit code (`:1873` unchanged).
  - On FAIL with named cases: output and row carry `failedCases` (first 100) and `failedCasesTruncated`; with `--accepted-from`, output carries `acceptedFailing` (count), `unaccepted` (cases) and `onlyAccepted` (every named failing case was on the list), and the row carries `acceptedFailing`. `onlyAccepted` logs one line: the gate's runners do not skip `$BKIT_ACCEPTED_TESTS`, with the doc section to follow.
- New verb `failures` (`use: "workflow"`): flags `--file`, `--workflow`, `--step`. Prints the latest `test-run` row of `--step` in the workflow's active run: `verdict`, `cases` (`{classname, name, accepted}`), `named` (`failures` non-null and cases recorded), `truncated`, `onlyAccepted`. Exit 0; exit 2 when no row exists.
- New verb `accept` (`use: "workflow"`): flags `--file`, `--workflow`, `--step`, `--reason`, `--decision` (the decision file and question, for example `build-decision-1-2.md#Q2`). Reads the same latest row, takes its not-yet-accepted named cases, and appends one `accepted-failures` row. Exit 0 written; exit 1 refused (verdict not FAIL, `failures` null, no recorded cases, or `failedCasesTruncated`), naming the reason; exit 2 usage.

#### [MODIFY] `.bkit/core/engine/commands/workflow/run-facts.ts`

- **Existence Check:** exists; `MARK_ROWS` at `:338`.
- Add `"accepted-failures"` to `MARK_ROWS`, so step minutes skip it.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** exists; `pending` verb at `:527`.
- `pending` also reads `{logDir}/status.jsonl` (when present) and prints `acceptedTests`: `[{step, classname, name, reason, decision}]`, one entry per accepted case, in row order. `count` and `--defer` stay about assumed items only.

#### [new] `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Integration test of the accept flow through the real CLI", reason (b).
- Spawns the real CLI with `requireTsx()` against a temp git repo whose `package.json` declares a `bkit:gate:static-unit` that writes JUnit into `$BKIT_TEST_REPORT_DIR` and skips the cases in `$BKIT_ACCEPTED_TESTS`; asserts the `status.jsonl` rows and exit codes (`docs/testing.md` § Spawning `bkit` from tests).

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** exists; § Decision Pause `:127-298`, Step 8 `:658-744`, Step 9 `:746-820`, Step 12 `:936-984`.
- § Decision Pause step 2:
  - `VERIFY_GAPS` with `GATE_VERDICT` = FAIL, and `TESTS_LOOP`: run `tests failures --step=build-group-gate-{GROUP}` (verify) or `--step=build-run-tests` (tests). `onlyAccepted` = true → one hard-blocker item ("the gate does not skip accepted tests"), options `["Fix now", "Stop"]`, and drop `{LOOP_FLAGS}`, so no `Try again`. Else `named` = true and `truncated` = false → one hard-blocker item listing the not-yet-accepted cases, options `["Accept", "Fix now", "Stop"]`, saying an accept covers only these named tests. Else → no item, and the question text says the failure has no test names.
  - Replace "A group-gate failure is never an item, because it is always fixed." and "write no items, because failing suites are always fixed".
- § Decision Pause step 5, Accept by the owner, for a named-failure item: run `tests accept --step=… --reason="{human's reason}" --decision="build-decision-{RUN}-{DECISION}.md#Q{n}"` before the `docs/decisions.jsonl` row; exit non-zero → **Failure Path**.
- Step 8 sub-step 8, Step 9 sub-step 3 (`Group gate` command in Context) and Step 12 sub-step 2: add `--accepted-from="{STATUS}"`.
- § Gate — Decision Pause: add a checkbox for the accept write.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** exists; Step 3 sub-step 1 at `:367-378`.
- Add `--accepted-from="{STATUS}"` to the `tests run` call. Debug writes no accept (Q3 A).

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** exists; § Confirm Assumed Items `:335-385`.
- Step 1 holds `acceptedTests` as `ACCEPTED_TESTS`. **If** it is not empty → narrate `Built with {n} test(s) accepted as already failing on the base branch:` and one line per case, before routing. Routing on `ASSUMED_COUNT` is unchanged.

### Docs

#### [MODIFY] `.bkit/shared/docs/testing.md`

- **Existence Check:** exists; § JUnit reports for bkit at `:329`.
- New § Accepted failures: the `$BKIT_ACCEPTED_TESTS` contract (a JSON array of `{classname, name}`; skip each listed case; unset → run everything) with one example each for Vitest (`test.testNamePattern` from the file), Jest and pytest (`PYTEST_ADDOPTS=-k`), and what happens when a runner ignores it.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** exists; § Local gate scripts `:1520`, § Group gate `:1590`.
- § Group gate: replace the "Strict, no exceptions" bullet with the owner-accept exception for named cases. § Local gate scripts: add `--accepted-from`, the new `test-run` fields and the `accepted-failures` row. Build Step 12 / debug Step 3 table rows mention `--accepted-from`.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. The architecture has no `[DELETE]` row: the change extends `tests run`, the Decision Pause and `decisions pending`, and replaces two sentences of workflow text ("A group-gate failure is never an item …", "Strict, no exceptions …") in place.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None at plan time; the build's agents add a row if a runner's skip wiring has a gotcha. |
| `docs/decisions.jsonl` | Three rows written at plan time (`**Ledger rows:**`). The Decision Pause keeps writing one row per owner accept. |
| `docs/architecture.md` | None: no new component or boundary. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None: bkit has no database. |
| `docs/design.md` | None: no UI. |
| `.bkit/shared/docs/testing.md` (mirrored to `docs/testing.md`) | New § Accepted failures: the `$BKIT_ACCEPTED_TESTS` contract and per-runner examples (task 9). |
| `docs/testing.md` (project section below `bkit:end`) | § Key test files: the new `tests.test.ts` behaviours, `decisions.test.ts` `acceptedTests`, and the new `tests-accepted.integration.test.ts` row (task 9). |
| `docs/observability.md` | None: the new fields land in `status.jsonl`, no new log stream. |
| `.bkit/core/.bkit/workflows.md` (mirrored to `.bkit/workflows.md`) | § Group gate exception; § Local gate scripts fields and flag; the build Step 12 and debug Step 3 table rows (task 9). This is the workflow index the `Index updates` rule requires with any workflow edit. |
| `.bkit/core/.bkit/cli.md` (mirrored to `.bkit/cli.md`) | Regenerated by `pnpm cli:sync` for the new flag and verbs (task 9). |

## Rollback Strategy

Code-only — `git revert` sufficient.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | bkit has no database. |
| **Code** | `git revert {COMMIT}` of the feature's squash commit, then `pnpm build` and `bkit upgrade` in consumers | Leftover `accepted-failures` rows and the extra `test-run` fields are ignored by a reverted engine; old status logs stay readable. |
| **Risk window** | None | Consumers pick the change up on `bkit upgrade`; a consumer that never wires `$BKIT_ACCEPTED_TESTS` behaves as before. |

## Agent Execution Runbook

Build order: the engine records, accepts and passes the cases (group 1), then the workflows and docs use them (group 2). Each group leaves `bkit:gate:static-unit` green. Integration shape (advice only): one PR for both groups is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine — record, accept and pass accepted test cases

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Record each failing JUnit case's `classname` and `name` on a FAIL
  - **UPDATE:** `JunitCase` in `.bkit/core/engine/commands/workflow/tests.ts`: add `classname` (`""` when the `<testcase>` has none)
  - **UPDATE:** `parseJunit` in `.bkit/core/engine/commands/workflow/tests.ts`: read `classname` with `attr`
  - **UPDATE:** `countReportFailures` in `.bkit/core/engine/commands/workflow/tests.ts`: add an exported sibling `failingCases(dir)` returning the de-duplicated failing and erroring `{classname, name}` cases; `countReportFailures` keeps its count contract
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb puts `failedCases` (at most `MAX_FAILED_CASES` = 100) and `failedCasesTruncated` on a FAIL's output and, through `appendTestRun`'s `evidence`, on its `test-run` row; the `output` help names both fields
  - **READ:** `appendTestRun` in `.bkit/core/engine/commands/workflow/tests.ts`: the `evidence` spread the new fields ride on
  - **DONE WHEN:** a FAIL `test-run` row holds `failedCases` with `classname` and `name`; a PASS row holds neither field; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reads each case's classname` fails on parsed cases carrying no `classname`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a FAIL records each failing case's classname and name on the test-run row` fails on the row having no "failedCases" field
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `caps the recorded failing cases at 100 and flags the run truncated` fails on all 101 cases being recorded with no "failedCasesTruncated" flag

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add `bkit tests accept`, which writes one `accepted-failures` status row
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: new `accept` verb (`use: "workflow"`) with `--file`, `--workflow`, `--step`, `--reason`, `--decision`; it reads the latest `test-run` row of `--step` in the workflow's active run, takes its named failing cases not already in an `accepted-failures` row, and appends `{type: "accepted-failures", workflow, at, step, cases, reason, decision}`; exit 1 with the reason when the row is not FAIL, has `failures` null, has no `failedCases` or is truncated; exit 2 on a missing flag or a missing row
  - **UPDATE:** `MARK_ROWS` in `.bkit/core/engine/commands/workflow/run-facts.ts`: add `"accepted-failures"`
  - **READ:** `appendTestRun` in `.bkit/core/engine/commands/workflow/tests.ts`: how the active run's rows are found (last `workflow-started` row)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit tests accept` appends exactly one `accepted-failures` row per call that names cases, and refuses the four cases above with exit 1; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `writes one accepted-failures row with the step's latest failing cases, reason and decision` fails on no "accepted-failures" row being appended
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `writes only the cases not already accepted` fails on an already accepted case being written a second time
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `refuses a run whose failures have no test names` fails on a row being written for a FAIL with `failures` null instead of exit 1
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `refuses a truncated run` fails on a row being written for a run flagged `failedCasesTruncated`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `refuses a PASS run` fails on a row being written for a PASS
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `an accepted-failures row adds no step minutes` fails on the minutes before an `accepted-failures` row being counted to the next step

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `bkit tests run --accepted-from` hands the gate the accepted cases as `$BKIT_ACCEPTED_TESTS`
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts`: the accept flow through the real CLI (`requireTsx()`), with a fixture gate that writes JUnit into `$BKIT_TEST_REPORT_DIR` and skips the cases listed in `$BKIT_ACCEPTED_TESTS`
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb gains `--accepted-from` (a `status.jsonl`); it collects every `accepted-failures` row's cases, writes them as a JSON array to `{log}.accepted.json` (emptied each run), and passes the absolute path as `BKIT_ACCEPTED_TESTS` in the `runToLog` env; on FAIL it emits `acceptedFailing`, `unaccepted` and `onlyAccepted`, puts `acceptedFailing` on the row, and logs one line when `onlyAccepted` is true saying the gate's runners do not skip `$BKIT_ACCEPTED_TESTS` (`docs/testing.md` § Accepted failures); the verdict still comes from the exit code
  - **READ:** `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts`: the `env` object `$BKIT_TEST_REPORT_DIR` already rides in
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** a gate run with `--accepted-from` sees `BKIT_ACCEPTED_TESTS` pointing at a file holding the accepted cases; a gate run without the flag sees no such variable; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `hands the gate every accepted case as BKIT_ACCEPTED_TESTS` fails on the gate seeing no `BKIT_ACCEPTED_TESTS` variable
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a FAIL whose named failing cases are all accepted reports onlyAccepted` fails on "onlyAccepted" being absent or false
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a new failing case beside accepted ones reports onlyAccepted false and lists it as unaccepted` fails on the new case missing from "unaccepted"
    - `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` `a gate red on cases goes green once they are accepted and the gate skips them` fails on the second gate run exiting 1 after `tests accept`
    - `.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts` `a new failing case still fails the gate after an accept` fails on the gate passing while a not-accepted case fails

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Add `bkit tests failures`, which prints a step's latest failing cases for the Decision Pause
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: new `failures` verb (`use: "workflow"`) with `--file`, `--workflow`, `--step`; it prints the latest `test-run` row of `--step` in the active run as `verdict`, `cases` (`{classname, name, accepted}`), `named` (`failures` non-null and `failedCases` recorded), `truncated` and `onlyAccepted`; exit 0, exit 2 when no row exists
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** `bkit tests failures` prints the four fields for a FAIL row and exits 2 for a step with no row; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `lists the latest run's failing cases of a step with their accepted flags` fails on "cases" missing or every `accepted` flag false after an accept
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reports named false for a FAIL with no test names` fails on "named" being true for a FAIL with `failures` null
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reports onlyAccepted when every failing case is accepted` fails on "onlyAccepted" being false when every recorded case is accepted
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `exits 2 when the step has no test-run row` fails on exit 0 for a step with no row

<!-- bkit:task 4 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Workflows, ship listing and docs

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `bkit decisions pending` lists the feature's accepted failing tests
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `pending` verb also reads `{logDir}/status.jsonl` when present and prints `acceptedTests` (`[{step, classname, name, reason, decision}]`, row order); `count` and `--defer` stay about assumed items
  - **READ:** `decisionFiles` in `.bkit/core/engine/commands/workflow/decisions.ts`: how `logDir` is resolved from `--root`, `--month` and `--fid`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `decisions pending` prints `acceptedTests` with one entry per accepted case, and `[]` when none; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `pending lists the feature's accepted failing tests from status.jsonl` fails on "acceptedTests" being absent from the output
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `pending prints an empty acceptedTests when the log has no accepted-failures row` fails on "acceptedTests" being undefined instead of an empty list

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** The build Decision Pause asks the owner to accept named gate and suite failures, and writes the accept
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 2 — for `VERIFY_GAPS` with `GATE_VERDICT` = FAIL and for `TESTS_LOOP`, run `"{BKIT}" tests failures --file="{STATUS}" --workflow=build --step={build-group-gate-{GROUP} | build-run-tests}`; `onlyAccepted` = true → one hard-blocker item (the gate does not skip accepted tests; `docs/testing.md` § Accepted failures), options `["Fix now", "Stop"]`, and `{LOOP_FLAGS}` empty so no `Try again`; else `named` = true and `truncated` = false → one hard-blocker item listing the not-yet-accepted cases, options `["Accept", "Fix now", "Stop"]`, whose question says an accept covers only these named tests and only you can say they already fail on the base branch; else no item, and the loop question says the failure has no test names. Replace the two sentences "A group-gate failure is never an item, because it is always fixed." and "write no items, because failing suites are always fixed".
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 5, Accept by the owner on a named-failure item — first run `"{BKIT}" tests accept --file="{STATUS}" --workflow=build --step=… --reason="{human's reason}" --decision="build-decision-{RUN}-{DECISION}.md#Q{n}"` (step from the decision file's `From` and `Group` headers, so a resumed pause writes it too; exit non-zero → **Failure Path**), then the existing `docs/decisions.jsonl` row; § Gate — Decision Pause gains `- [ ] Named failures accepted through \`tests accept\``
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** `pnpm instructions:show --file bkit-build.md` was checked before the edit; the render snapshot is regenerated; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the Decision Pause writes a gate or suite accept through bkit tests accept` fails on the pause holding no "tests accept" call
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the Decision Pause reads named failures with bkit tests failures for VERIFY_GAPS and TESTS_LOOP` fails on the pause holding no "tests failures" call for either question
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the pause drops the loop question when onlyAccepted is true` fails on no `onlyAccepted` branch setting `{LOOP_FLAGS}` empty

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Every build and debug gate run passes `--accepted-from="{STATUS}"`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8, the Step 9 sub-step 3 `Group gate` command in the subagent Context, and Step 12 sub-step 2 each add `--accepted-from="{STATUS}"` to `tests run`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 3 sub-step 1 adds `--accepted-from="{STATUS}"` to `tests run`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with the same command
  - **DEPENDS ON:** 3, 6
  - **DONE WHEN:** `grep -c 'accepted-from' .bkit/core/workflows/bkit-build.md` counts 3 gate calls and `bkit-debug.md` 1; the render snapshots are regenerated; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every build and debug tests run gate call passes --accepted-from with the status file` fails on a `tests run --gate` call with no "--accepted-from" flag

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `/bkit-ship` shows the accepted tests to the owner before the merge gate
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: § Confirm Assumed Items step 1 holds `acceptedTests` as `ACCEPTED_TESTS`; **If** it is not empty → narrate `Built with {n} test(s) accepted as already failing on the base branch:` and one line per case (`{classname} > {name}`, its reason) before the existing routing; the routing on `ASSUMED_COUNT` is unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the ship step holds and narrates `ACCEPTED_TESTS`; the render snapshot is regenerated; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship lists the accepted tests from decisions pending before the merge gate` fails on the Confirm Assumed Items step holding no "acceptedTests" value

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Document the accept path and the `$BKIT_ACCEPTED_TESTS` contract, and regenerate the generated outputs
  - **UPDATE:** `.bkit/shared/docs/testing.md`: new § Accepted failures after § JUnit reports for bkit — the variable holds a path to a JSON array of `{classname, name}`; each runner in a gate skips the listed cases; unset → run everything; one example each for Vitest (`test.testNamePattern` built from the file in its config), Jest (`testNamePattern`) and pytest (`PYTEST_ADDOPTS="-k not …"`); a runner that ignores it keeps failing, and the build's pause says so
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate replaces the "Strict, no exceptions" bullet with the owner-accept exception for named cases; § Local gate scripts adds `--accepted-from`, the `failedCases` / `failedCasesTruncated` / `acceptedFailing` fields and the `accepted-failures` row; the build Step 12 and debug Step 3 table rows name `--accepted-from`
  - **UPDATE:** `docs/testing.md`: the project § Key test files row for `commands/workflow/tests.test.ts` names the accept, failures and `--accepted-from` behaviours, and a new row lists `commands/workflow/tests-accepted.integration.test.ts` (Integration)
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **DEPENDS ON:** 3, 4, 5, 6, 7, 8
  - **DONE WHEN:** `pnpm bkit:generate` (build, `cli:sync`, `instructions:sync`, `bkit upgrade` mirrors, render snapshots) leaves no further diff on a second run; `dist/` is rebuilt; `pnpm bkit check` and `pnpm bkit:check:dist` exit 0
  - **TEST FIRST:** n/a — docs and regenerated outputs only (`cli.md`, mirrors, `dist/`); no behaviour change

<!-- bkit:task 9 end -->

<!-- bkit:group 2 end -->

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
- [ ] **Test Synchronization:** no E2E test exists for these surfaces; the workflow audits `local-gate-audit.test.ts` and `ship-invariants.test.ts` and the render snapshots for `bkit-build`, `bkit-debug` and `bkit-ship` are updated in tasks 6-8.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` holds `**/*.test.ts`, which keeps `tests-accepted.integration.test.ts` and its fixture gate out of `dist/`; `pnpm bkit:check:dist` confirms `dist/` holds no test file.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/tests.test.ts`):** `classname` parsing, `failedCases` recording and its cap, `tests accept` and its four refusals, `--accepted-from` and `BKIT_ACCEPTED_TESTS`, `onlyAccepted`, and `tests failures`; each case uses its own temp dir and status file.
- [ ] **Unit (`run-facts.test.ts`, `decisions.test.ts`):** the `accepted-failures` mark row adds no step minutes; `decisions pending` prints `acceptedTests`.
- [ ] **Unit (`local-gate-audit.test.ts`, `ship-invariants.test.ts`):** the build pause, the gate calls of build and debug, and ship's listing hold the new commands.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/tests-accepted.integration.test.ts`):** the real CLI runs a fixture gate red, accepts its cases, and runs it green; a new failing case still fails; temp dirs are removed after each test.
- [ ] **Apply local migrations:** not applicable; the change adds no database migration.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.
- [ ] **Dogfood:** after `pnpm build`, in a scratch consumer directory, `node dist/cli.js tests run --gate=<fake gate>` fails on two named cases, `tests accept --step=…` writes one `accepted-failures` row, and `tests run --accepted-from=<status.jsonl>` passes with a gate that skips the cases in `$BKIT_ACCEPTED_TESTS`, and fails with `onlyAccepted` true with a gate that ignores it.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a consumer repo whose `dev` has one red unit test and whose Vitest config reads `$BKIT_ACCEPTED_TESTS` into `testNamePattern` (`docs/testing.md` § Accepted failures), start `/bkit-build` on an issue with 2 task groups; the group-1 pause asks once about the named test with `Accept`, `Fix now` and `Stop`.
- [ ] **Step 2:** Answer `Accept` with a reason; `status.jsonl` holds one `accepted-failures` row naming the test, and group 1's gate passes on the next round.
- [ ] **Step 3:** Group 2 and the Step 12 run pass with the accepted test skipped; a test the build breaks still fails its gate.
- [ ] **Step 4:** `/bkit-ship` lists the accepted test with its reason before its merge gate.
- [ ] **Step 5:** With a runner that ignores `$BKIT_ACCEPTED_TESTS`, the pause says the gate does not skip accepted tests and offers no `Try again`.
