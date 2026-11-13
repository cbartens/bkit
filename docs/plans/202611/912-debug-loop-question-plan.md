<!-- bkit:anchor
baseSha: f6914f3c9c88e68faa4b8806406c0d562d2d6c7c
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

# Honest Loop Trend for Unknown and Incomparable Test Rounds Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

A consumer's `/bkit-debug` run reached the Loop Question after fix attempt 2 of 2. It printed `Failures per test round: ? → ? (trend: stuck)`, said "The last fix attempt left no fewer failures" and recommended Stop. Neither test round had a failure count, and the two rounds ran different tests (round 1 was the selected CI run, round 2 a local gate). The owner took the recommendation and stopped a run that had no evidence of being stuck.

Root causes, read in this session:

<!-- prettier-ignore -->
| Cause | Where | Effect |
| --- | --- | --- |
| An unknown count reads as `stuck` | `loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts` (`if (first === undefined \|\| last === undefined) return "stuck";`) | `loopProgress` sets `recommend: "stop"`, and the debug Loop Question asks |
| Rounds of different scopes are compared | `loopTrend` compares `rounds[0]` with `rounds.at(-1)` whatever their `scope` | A CI round (`scope: ci:<run id>`) is compared with a local gate round |
| A CI evidence round never records a count | `tests run` CI branch in `.bkit/core/engine/commands/workflow/tests.ts` writes `failures: null`; `testRunProblem` in `.bkit/core/engine/ledgers/status.ts` refuses any other value; `steps finish` in `.bkit/core/engine/commands/workflow/steps.ts` refuses `--failures` on a CI round | The first debug round from CI is always `?`, although `runs locate` already reads the failed jobs |
| The question wording is fixed | `.bkit/core/workflows/bkit-debug.md` § Loop Question: three `Q1` texts say "left no fewer failures" | The question claims what the counts do not show; `stuck` also covers "count fell but no code changed", where the claim is false too |

Goals:

- An unknown or incomparable count produces a separate trend, `unknown`, that never recommends Stop.
- The trend compares only rounds that ran the same tests (same `scope`).
- A CI evidence round records the selected run's failed job count when `runs locate` read the jobs.
- Every loop question states what the counts show, in one engine-written sentence (`trendLine`), instead of a fixed claim.

Loop surfaces checked (the issue asks to check build and ship too):

<!-- prettier-ignore -->
| Workflow | Reads `counters progress`? | Effect of this plan |
| --- | --- | --- |
| `/bkit-debug` § Loop Question | Yes (`trend`, `counts`) | `unknown` takes the attempt without asking; the question and narration use `trendLine` |
| `/bkit-build` Step 12 (`TESTS_LOOP`) and every `decisions compose --loop` pause | Yes (`counters progress`, and `loopProgress` inside `decisions compose`) | `unknown` goes to Step 13 without a pause (the existing `Else` route); `compose` writes `trendLine` and an honest reason |
| `/bkit-ship` | No: its merge loop routes on the diagnosis verdict (`DIAGNOSE_VERDICT`), not on a trend | None |

The local gate's count stays the JUnit count `tests run` already takes from `$BKIT_TEST_REPORT_DIR` (`.bkit/workflows.md` § Failure count from JUnit reports). Round 2 in the incident had no JUnit report, so it stays `?`, and the trend now reads `unknown` instead of `stuck`. The issue's bullet asking for a local gate count "from its output" is therefore met only for gates that write JUnit reports; a gate with no report stays uncounted (Open Question Q3, decision `912-local-gate-count-stays-junit-only`).

A CI evidence round's count is in a different unit from a local round's: failed CI jobs, the capstone left out, not failing test cases. The same-scope rule keeps the two from ever being compared.

**Related Issues:**

- #912 — Debug loop question asks Stop with failure counts "? → ?" (open)
- #895 — One question format for every owner question in the workflows (open)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

The owner runs `/bkit-debug` from a red CI run, and when the fix loop reaches the Loop Question, the question states what the test rounds' failure counts show. When a round recorded no count, or the rounds ran different tests, the owner is not told the last fix attempt "left no fewer failures" and is not advised to Stop on that missing evidence.

### Success Criteria

- Each test round records a failure count whenever one can be worked out. For a CI round that is at least the number of failed jobs. For a local gate that is the failed-test count from its output.
  - "The failed-test count from its output" is the count from the gate's JUnit report (Open Question Q3, default A).
- When a count is unknown, the trend is not `stuck`. It is a separate state, for example `unknown`, that never recommends Stop by itself.
- The question wording matches what is known. It never says "left no fewer failures" when the counts are `?`.
- Rounds with different scopes (CI vs local gate, or two different gates) are not compared as if they were the same test.

### Process Sketch

- **WHEN** a debug fix loop reaches the Loop Question and a compared round has no failure count **→ THEN** `counters progress` prints `trend: unknown` and `recommend: null`, and the attempt is taken without asking, with a narration that names the unknown count.
- **WHEN** the rounds ran different tests (the CI round, then a local gate) **→ THEN** the trend compares only the rounds whose `scope` matches the last round's, and reads `unknown` when fewer than two match.
- **WHEN** a debug run's first round is recorded from the selected CI run **→ THEN** its `failures` is the run's failed job count, and `Failures per test round` shows it instead of `?`.
- **WHEN** the trend is `stuck` or `worse` and the Loop Question asks **→ THEN** `Q1` states the engine's `trendLine` for that case, never "left no fewer failures" as a fixed text.
- **IF** the soak attempts are used up while the trend is `unknown` **→ THEN** the Loop Question still asks, recommends Stop because no attempt is left, and states the unknown count.
- **IF** a `steps finish` call for a CI round passes a `--failures` that differs from the round's `test-run` row **→ THEN** it is refused and no row is written.

### Concrete Example

**Setup:** The owner runs `/bkit-debug #N` from a red CI run with two failed jobs plus the failed capstone job `bkit-tests-check`. The consumer's local gate `bkit:gate:static-unit-integration-e2e-live` writes no JUnit report. `debug.fix` is `{ ask: true, maxAttempts: 2 }`.

**Steps:**

1. Step 2 runs `runs locate` → the saved CI selection carries `failedJobCount: 2` (the capstone job left out).
2. Step 3, round 1 → `tests run` records the CI evidence round with `failures: 2`, `scope: ci:<run id>`; `steps finish --failures=2` writes the `step-done` row.
3. Steps 6-7 run fix attempt 1. Step 3, round 2 → the local gate exits 1 with no JUnit report → `failures: null`, `scope: pnpm bkit:gate:static-unit-integration-e2e-live`.
4. Fix attempt 2 is next, so the Loop Question runs `counters progress` → `counts: "2 → ?"`, `trend: "unknown"`, `recommend: null`, `trendLine` saying the two rounds ran different tests and cannot be compared.
5. `LOOP_TREND` is neither `stuck` nor `worse` → the workflow narrates `debug fix: attempt 2 of 2, taken without asking (failures 2 → ?: {trendLine})` and runs fix attempt 2.

**Outcome:** The owner is not told the fix "left no fewer failures", and no Stop is recommended on missing evidence. The attempt limit still bounds the loop: once the fix attempts are used up, the run moves to soak as before.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A compared round has no failure count (a local gate with no JUnit report, or a CI selection saved before this change) | `trend: unknown`, `recommend: null`; `trendLine` names the unknown count; the debug loop takes the attempt without asking; the build test loop goes to Step 13 without a pause |
| The rounds have different `scope` values (CI round then local gate, or a gate with and without the live tier) | The trend compares only the rounds whose `scope` equals the last round's; fewer than two such rounds → `unknown`, and `trendLine` says the rounds ran different tests |
| Rounds `ci:123` (2), local gate (5), local gate (2), code changed between the local rounds | `trend: closing`, from the two local rounds; `codeChanged` is judged between those two rounds |
| Check rows carry no `scope` (the build verify and holistic loops) | They compare with each other as today; the trend for known counts is unchanged |
| The count fell but no source code changed | `trend: stuck` as today; `trendLine` says the count fell but no source code changed, not "no fewer failures" |
| The soak attempts are used up and the trend is `unknown` | The Loop Question asks (`LOOP_LIMIT`), recommends Stop because no attempt is left, and `Q1` states the unknown-count `trendLine` |
| A build Decision Pause composed with `--loop` while the trend is `unknown` | The pause fires only when the loop's limit is used up. `Q1` recommends by Open Question Q5 (default `Try again`); its reason says the limit is used up and the counts cannot show whether the rounds helped, built from `trendLine`, and never says "the last round made progress" or that a round is left |
| A build verify-loop pause (`decisions compose --loop=verify`) whose group gate row has no failure count (#891's combined round count is `?`) | `trend: unknown` (was `stuck`), `recommend: null`; `Q1` recommends by Open Question Q5, with the same used-up-limit reason |
| Both causes hold: the scopes differ and a compared round has no count | `trendLine` gives the different-scopes sentence; different scopes win over a missing count |
| Holistic rounds read with `--since-clean` carry no `scope` | They compare with each other as today, so known counts keep their trend |
| Only the capstone job `bkit-tests-check` failed in the selected run | `failedJobCount: 1` |
| Jobs read from the exit-80 fallback `--evidence-file` include a failed capstone | The same rule as the jobs API path: the capstone is left out of `failedJobCount` |
| A CI selection saved before this change (no `failedJobCount`) | `validateCiSelection` still accepts it, and the CI round records `failures: null` |
| A CI round with `failures: 2` and its matching `step-done` row | The completeness check (`status-holes`) raises no `tests run --ci-run` evidence hole |
| The selected run has no failed job (a `startup_failure` with no jobs) | `failedJobCount` is absent, and the CI round records `failures: null` |
| A selection file carries `failedJobCount` 0, a negative number or a fraction | `validateCiSelection` refuses it, so the selection is not saved or read as evidence |
| `failedJobCount` changes between two reads of the same run | The evidence identity (`ciSelectionIdentity`) is unchanged, so no new CI generation starts |
| `steps finish` for a CI round passes `--failures` that differs from the round's `test-run` row, or passes `--failures` when the row has `failures: null` | Refused with `CI evidence does not match the active selection`; no `step-done` row is written |
| A `test-run` row with `source: ci` carries `failures: 0` | `testRunProblem` refuses it (a red CI round never has 0 failures) |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `loopTrend` reads a compared round with no count as `unknown`, not `stuck` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| `counters progress` with a round that has no count prints `trend: unknown` and `recommend: null` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| `counters progress` on a #891 verify loop whose red group gate row has no count reads `unknown`, not `stuck` (the two existing `loopProgress with a gate` cases, updated) | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| `counters progress` does not compare a CI round with a local gate round: `trend: unknown` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 2 |
| `counters progress` compares the last round with the earliest round of the same `scope` (CI, 5, 2 → `closing`) | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 2 |
| `codeChanged` is judged between the compared same-scope pair's `parentSha`, not from the first round of the run | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 2 |
| `counters progress --since-clean` over unscoped holistic rounds still compares them | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 2 |
| `trendLine` names an unknown count instead of claiming the count did not fall | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| `trendLine` says the rounds ran different tests when their scopes differ | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| `trendLine` gives the different-scopes sentence when the scopes differ and a count is missing | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| `trendLine` for a fall without a code change says no source code changed | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| `validateCiSelection` accepts a positive whole `failedJobCount` and a selection without it, and refuses 0, negatives and fractions; the identity ignores it | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 4 |
| `runs locate` saves `failedJobCount` without the capstone job, and 1 when only the capstone failed | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 4 |
| `runs locate` omits `failedJobCount` when the selected run has no failed job | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 4 |
| `runs locate --evidence-file` leaves a failed capstone out of `failedJobCount` | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 4 |
| `tests run` records the selected run's `failedJobCount` as the CI round's `failures` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `testRunProblem` accepts a CI round with a positive count or `null`, and refuses 0 | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 5 |
| A counted CI round with its matching `step-done` row raises no `tests run --ci-run` evidence hole | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 5 |
| `steps finish` finishes a CI round whose `--failures` equals its `test-run` row, and refuses a different count or any `--failures` when the row has no count | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 6 |
| Debug Step 3 commands record the CI round's failed job count with the failed capstone left out, and the Loop Question's `counters progress` then reads `unknown` after a local round with no count (the incident replayed through the real CLI) | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 10 |
| `decisions compose --loop` on an `unknown` trend recommends `Try again` with a reason built from `trendLine` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `decisions compose --loop` on an `unknown` trend says the limit is used up, never that a round is left | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `decisions compose --loop=verify` with a red group gate that has no count reads `unknown` and recommends by the Q5 rule, not `Decide` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| The debug Loop Question holds `trendLine` and states it in every `Q1`, with no fixed "left no fewer failures" text | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 8 |
| The debug Loop Question's `LOOP_LIMIT` `Q1` (soak attempts used up) states `{LOOP_TREND_LINE}` and still recommends Stop | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 8 |
| Typecheck, lint, prose, instructions coverage and mirror drift (`pnpm bkit:gate:static`, `node dist/cli.js check`) pass on the changed sources | Static | `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/instructions.md` | 9 |
| bkit decisions compose > --loop=verify on an unknown trend below the limit does not say the limit is used up | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |

The GitHub Actions jobs boundary that `runs locate` reads has no automated non-mock test: bkit declares no `@live` tier (`docs/testing.md` § Tiers, `bkit-tests-live` N/A for bkit). Manual Verification Step 3 runs `runs locate` against a real red run and reports the check as available or unavailable.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

No database structure or layout changes. The contract changes and new names, all additive for readers that ignore unknown values:

<!-- prettier-ignore -->
| Name or change | Kind | Who reads it | Breaks? |
| --- | --- | --- | --- |
| `trend: "unknown"` from `counters progress` | New enum value | `bkit-debug.md` § Loop Question (`LOOP_TREND`), `bkit-build.md` Step 12 (`TEST_TREND`), `decisions compose --loop` | No: both workflows route on `stuck` / `worse` only, so `unknown` takes the existing no-ask route; a consumer's own script that treats every non-`closing` value as Stop would now continue on `unknown` |
| `trendLine` on `counters progress` | New output field | `bkit-debug.md` § Loop Question (`LOOP_TREND_LINE`) | No |
| `rounds[].scope` on `counters progress` | New output field | Nobody yet | No |
| `recommend: null` on `unknown` | Changed value (was `stop` for an unknown count) | `decisions compose --loop` | Intended: no Stop on missing evidence. A build verify-loop pause after a red group gate with no count (#891) now recommends by Open Question Q5 instead of `Decide` / `Stop` |
| `test-run.failures` / `step-done.failures` on a `source: ci` round count failed CI jobs | Second unit for one field | `counters progress` (`counts`), the debug summary (`failures 2, ran ci:…`), `Failures per test round` | No for routing: the same-scope rule never compares a job count with a test count. The count stays unlabelled in owner-facing text (Open Question Q4) |
| `CiSelection.failedJobCount` | New optional field | `tests run` | No: older selections lack it and still validate; not part of the evidence identity, so no CI generation changes |
| `test-run.failures` on a `source: ci` row may be a positive number | Widened contract | `testRunProblem`, `ciRoundMatches`, `steps finish` | No for readers. A `status.jsonl` written by this version and read by an older bkit fails that older `testRunProblem`; only a run resumed across a bkit downgrade meets it |
| `steps finish` on a CI round requires `--failures` to equal the round's count | Tightened check | `bkit-debug.md` Step 3 (`{FAILURES_FLAG}`) | No: Step 3 already passes `--failures` exactly when `tests run` prints a count |
| The debug Loop Question `Q1` texts | Owner-visible wording | The owner | Wording only; options and routing unchanged |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q2 — What the debug loop does when the trend is `unknown` and attempts are left:** → The owner resolves it at plan review.
  - **Options:** A) Take the attempt without asking, and narrate the count and `trendLine` — matches `first-round` and `closing`, and the attempt limit still bounds the loop, but the owner sees no question · B) Ask with `No recommendation — {trendLine}` — the owner always decides, at the cost of a pause per attempt on every consumer whose gate writes no JUnit report · C) Ask and recommend `Try again` — a pause that "yes" always answers the same way
  - **Recommended:** A) Take the attempt without asking — the Loop Question exists to stop a loop with evidence of no progress, and an unknown count is no such evidence.
  - **Default if unanswered:** A).
- **Open Question Q3 — Where a local gate's count comes from when the gate writes no JUnit report:** → The owner resolves it at plan review.
  - **Options:** A) Keep the JUnit report as the only source, so the count stays `null` and the trend reads `unknown` — stack-agnostic, and keeps the recorded rule "never a guessed number" (`.bkit/workflows.md` § Failure count from JUnit reports) · B) Parse common runner summary lines (Vitest, Jest, pytest, Playwright) from the log — counts more consumers, but names app stacks in the engine, which `.agents/rules.md` § Stack-agnostic forbids · C) Record 1 for any red gate with no count — always a number, but a fake one, and `1 → 1` reads as `stuck` again
  - **Recommended:** A) JUnit only — the missing-report hint `tests run` already prints tells the consumer how to get a count.
  - **Default if unanswered:** A).
- **Open Question Q4 — What a CI evidence round counts:** → The owner resolves it at plan review.
  - **Options:** A) The selected run's failed jobs, the capstone job `bkit-tests-check` left out (1 when only the capstone failed) — `runs locate` already reads the jobs, but the unit is jobs, not tests · B) Leave CI rounds uncounted — no contract change, but the issue asks for a count, and the first round stays `?` · C) Failing test cases from JUnit files the CI run publishes — the right unit, but it needs consumers to publish JUnit artifacts (the open deferral `891-ci-junit-artifact-settles-red-base-runs`)
  - **Recommended:** A) Failed jobs — the issue names it as the minimum, and the same-scope rule keeps a job count from ever being compared with a test count.
  - **Default if unanswered:** A).
  - **Unit in owner-facing text:** under A the count stays unlabelled in `counts`, `Failures per test round: 2 → ?` and the debug summary's `failures 2, ran ci:…`; the different-scopes `trendLine` names the `ci:<run id>` scope, so the owner can tell the CI round from a local round. → If owners read the CI number as failing tests, a later change labels it (for example "2 failed CI jobs").
- **Open Question Q5 — What a build `decisions compose --loop` pause recommends on an `unknown` trend:** The verify and holistic pauses run only when the limit is used up (`bkit-build.md` Step 8 and Step 10 limit lines: exit 1, or the round counter at `PAUSE_MAX`), and Step 12 sends `unknown` to Step 13, so its tests-loop pause on `unknown` also comes only from the limit line. Every `unknown` pause therefore comes at a used-up limit, and a `Try again` answer runs `counters grant`, which gives a full new allowance. → The owner resolves it at plan review.
  - **Options:** A) `Try again`, with a reason that says the limit is used up and the counts cannot show whether the rounds helped (from `trendLine`) — the same option `first-round` gets today, so headless runs keep a recommendation to take, but a headless build takes a full new allowance on no evidence · B) `Decide` / `Stop`, with the same reason — matches debug, which recommends Stop at a used-up soak limit with an `unknown` trend "because no attempt is left", but a headless build stops on a loop that may be making progress · C) `No recommendation — {trendLine}` — honest, but `apply --by=headless` then leaves a hard blocker and a headless build stops
  - **Recommended:** A) `Try again` — the build's limits still bound the loop, and the reason no longer claims progress or a round left.
  - **Default if unanswered:** A).
- **Assumption A1:** #891 (`docs/plans/202611/891-build-gate-stuck-plan.md`, branch `feat/891-build-gate-stuck`) merges before this plan is built. It changes `loopProgress` (a `gate` step prefix, `gateCounts`), `decisions compose --loop` (`trendReason`, the base-check reason) and `bkit-build.md` Step 12. → If it merges after, the builder rebases these tasks onto its `loopProgress` and `compose` shape, and its recorded decision `891-verify-loop-progress-counts-group-gate-tests` ("a gate row with a null failure count makes the round's count unknown (`?`), which the trend reads as stuck") is superseded by this plan's `unknown` trend. On #891's shape (`a8b0f055c` on `feat/891-build-gate-stuck`), `loopProgress` folds a gate row's count into each verify round (`failures = r.failures + g`, and `undefined` when the gate count is `null`), so Task 1's `unknown` rule reads that combined round count, not only `Step.failures`; the two `loopProgress with a gate` cases in `counters.test.ts` that assert `stuck` for `2 → ?` change to `unknown` in Task 1. Pre-Flight checks the base before Task 1.
- **Assumption A2:** #895 (`docs/plans/202611/895-one-question-format-plan.md`) rewrites the debug Loop Question's options and its `Recommended` line, and plans the reason "the last attempt left no fewer failures". → If #895 merges after this plan, that reason re-adds the fixed claim; whichever change merges second builds the reason from `{LOOP_TREND_LINE}`.
- **Assumption A3:** The `step-done` rows of test-loop check steps (`debug-run-tests`, `build-run-tests`) carry `scope` (both workflows pass `--scope="{TEST_SCOPE}"`), and verify-loop check rows carry none. → If a verify row gains a `scope`, verify rounds with different scopes would read `unknown` instead of comparing. If a build group's gate scope changes between rounds (for example, a gate fallback after a consumer edits `package.json` scripts mid-run), the trend reads `unknown` and Step 12 never pauses on it; only `build.tests.maxAttempts` then bounds the loop. A debug round's `parentSha` advances only through later steps' commits (`debug-run-tests` finishes with `--commit=none`), so `codeChanged` between a debug pair depends on those commits (deferral `58-debug-run-tests-parentsha-advances-only-transitively`).
- **Assumption A4:** The capstone job is named `bkit-tests-check`, as `runs locate` already assumes when it maps red tiers. → If a consumer's capstone has another name, the count is one higher than the failing test jobs; the count is shown, never compared with a local round.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| A new `unknown` trend in `loopTrend`, a same-scope comparison in `loopProgress`, and one engine-written `trendLine` every loop question reads | **Chosen** | Fixes the cause where the trend is computed, so debug, build and every `compose --loop` pause get it at once; the wording has one source |
| Keep `stuck` for unknown counts and only reword the debug question | Rejected | The build's `TESTS_LOOP` pause and `compose` would still recommend Stop / Decide on missing evidence |
| Read an unknown count as 0 | Rejected | `0 → 3` reads as `worse` and `3 → 0` as `closing`: a guessed number, which `.bkit/workflows.md` § Failure count from JUnit reports rules out |
| Drop rounds with no count and compare the rest | Rejected | Hides the gap: two known rounds around an unknown one would claim a trend the owner cannot check, and `counts` would no longer match the trend |
| Compare rounds by `source` (`ci` / `local`) instead of `scope` | Rejected | Two local rounds can run different gates (with and without the live tier), and two CI rounds can be different runs; `scope` already names exactly what ran |
| Keep each loop question's wording in its workflow, with one text per trend | Rejected | `stuck` covers two cases ("no fewer" and "fewer but no code changed"), and the counts and scopes belong in the sentence; prose cannot compute them, and three copies drift |
| Parse runner summary lines for a local count | Rejected | Names app stacks in the engine (`.agents/rules.md` § Stack-agnostic); see Open Question Q3 |

**Future phase:** a test count for CI rounds from published JUnit artifacts (`docs/deferrals.jsonl` `891-ci-junit-artifact-settles-red-base-runs`) would replace the job count with the same unit the local gate uses.

## Out of Scope

None. Every item in the issue's "What should happen" and "Affected area" is in the runbook. The ship loop needs no change because it does not read `counters progress` (`Context & Goals`). The Loop Question's option and recommendation layout belongs to #895's own plan, and Assumption A2 covers how the two meet. The issue's local gate count "from its output" is met only for gates that write JUnit reports: parsing runner output is a rejected approach (Open Question Q3, `.agents/rules.md` § Stack-agnostic), not deferred work.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Apply the base-commit check to `/bkit-debug`'s Loop Question | `docs/deferrals.jsonl` `891-debug-base-red-label` (open) | `bkit-debug.md` § Loop Question (Task 8) | Keep deferred; it adds a new input to the question, not an honest reading of the counts |
| Publish CI JUnit reports so CI rounds count tests, not jobs | `docs/deferrals.jsonl` `891-ci-junit-artifact-settles-red-base-runs` (open) | The CI round count (Tasks 4-5) | Keep deferred; it needs consumers to publish artifacts, and the job count meets the issue's minimum |
| Drop the STANDARD / PIVOT / FINAL strategy labels from fix loops | #907 (open) | `loopProgress` `lastStrategy` / `nextStrategy` / `finalSpent` (Tasks 1-3 edit the same function) | Keep separate; the builder of whichever lands second rebases |
| Owner Stop writes the full handover in debug, build and ship | #913 (open) | `bkit-debug.md` § Loop Question step 5 (Task 8 edits steps 2-3) | Keep separate |
| One question format for every owner question | #895 (open; plan closed, not built) | `bkit-debug.md` § Loop Question options and `Recommended` line; `decisions compose` `itemLines` | Keep separate; Assumption A2 sets which change adapts to the other |
| Show every choice made without asking in each workflow's summary | #902 (open) | The "taken without asking" narration on an `unknown` trend (Task 8) | Keep separate; the narration this plan writes is the input #902 would summarise |
| `debug-run-tests` `parentSha` advances only through later steps' commits | `docs/deferrals.jsonl` `58-debug-run-tests-parentsha-advances-only-transitively` (open) | Task 2 judges `codeChanged` between `debug-run-tests` rows' `parentSha` | Keep deferred; Assumption A3 names the dependence |
| The `status.jsonl` run boundary keys on the last run overall | `docs/deferrals.jsonl` `58-status-jsonl-run-boundary-keys-on-last-run-overall` (triaged) | `loopProgress` reads active-run rounds, which an interleaved debug run can reset | Keep separate |
| A live round trip of the debug CI evidence path | `docs/deferrals.jsonl` `650-debug-dev-ci-live-round-trip` (triaged) | The debug CI evidence path Tasks 4-6 change | Keep separate |
| None-render baselines miss the read-only helper recovery text | `docs/failures.jsonl` `workflow-none-render-baselines-miss-read-only-helper-recovery` (open) | The `bkit-debug.none.txt` / `bkit-build.none.txt` baselines Tasks 8-9 regenerate | Human decides; Tasks 8-9 update only their two baselines and check the diff, so this row is not absorbed (Pre-Flight) |
| Instructions checks time out under the full gate | `docs/failures.jsonl` `instructions-corpus-store-timeout-under-full-gate`, `instructions-retired-clause-timeout-under-full-gate` (triaged) | The instructions checks Tasks 8-9 run under the full gate | Keep separate (owned by #814) |
| Give load-sensitive tests a budget that holds under the full gate | #814 (open) | New `runs.test.ts` cases (Task 4) and the spawn-heavy integration test (Task 6) | Keep separate |
| Compare the two newest counted same-scope rounds instead of the earliest | Plan review (regression-risk lens) | An earliest same-scope round with no count fixes the trend at `unknown` for the rest of the run (Task 2) | Human decides; it is a separate design question, since this plan rejects dropping uncounted rounds |

## Security & Privacy

- [ ] **New API Route** — n/a.
- [ ] **New DB Table/Column** — n/a.
- [ ] **Role-Gated Mutation** — n/a.
- [ ] **User Input** — n/a as a new input; the one new value read from outside the engine, `failedJobCount` in the selection file, is validated by `validateCiSelection` before any reader uses it (Task 4).
- [ ] **PII** — n/a; job counts and gate scopes hold no personal data.
- [ ] **Redirect URL** — n/a.
- [ ] **Webhook** — n/a.
- [ ] **New Secret/Env Var** — n/a.

None — no new routes, DB writes, secrets, or user input. The GitHub job list `runs locate` reads is untrusted external data (`.agents/rules.md` § External input); only the count of its failed entries is kept, and it is validated as a positive whole number.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added; `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-10): `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.90.0, `vitest` 5.0.5 → 5.1.0, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5, all dev dependencies; none blocks this change. Toolchain: Node v24.16.0 (`engines.node` `>=24`), pnpm 10.34.7 (`packageManager` `pnpm@10.34.7`). The `gh` CLI is used only by `runs locate`, whose unit tests run against the in-file `locateFixture` in `runs.test.ts`, and whose integration path runs against the fake `gh` in `debug-ci-evidence.integration.test.ts`.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the runbook names was opened in this session; no user information is missing beyond Open Questions Q2-Q5.
- [ ] **Project Context:** read `docs/decisions.jsonl` `891-verify-loop-progress-counts-group-gate-tests` (unknown gate count reads as stuck), `554-red-green-judged-by-junit-named-test`; `docs/deferrals.jsonl` `891-debug-base-red-label`, `891-ci-junit-artifact-settles-red-base-runs` (open), `891-debug-loop-question-offers-accept` (closed); `docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits` and `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` (each edited standing workflow line needs its `.bkit/instructions.md` local entry edited by hand); `docs/knowledge.jsonl` `kn-7-dist-staleness-pnpm-build-must-run-before-push-for-bk` (`dist/` must be rebuilt with the engine edit). The #830 plan that added the CI evidence round says the round "does not invent a numeric failure count"; this plan keeps that rule (no guessed number) and gives the round a counted number of failed jobs, which `.bkit/core/.bkit/workflows.md` § Failure count from JUnit reports and `docs/testing.md` § JUnit reports for bkit then state (Task 9).
- [ ] **Testing & Quality:** tiers follow `docs/testing.md` § Tiers: the engine logic is Unit (`*.test.ts`, CLI driven in-process against `os.tmpdir()` files), and the debug Step 3 sequence is Integration (`debug-ci-evidence.integration.test.ts` runs the real built CLI, `dist/cli.js`, with commands taken from the workflow against a fresh temporary consumer, so each engine task rebuilds `dist/` before it is done). No E2E or @live tier applies: bkit has no deploy. The GitHub jobs API boundary in `runs locate` is checked by Manual Verification Step 3, reported as available or unavailable.
- [ ] **Prerequisite Plans:** `docs/plans/202611/891-build-gate-stuck-plan.md` (#891) fully built, verified and merged into `dev` (Assumption A1). Check before Task 1: `grep -n "gateCounts\|gateFailuresOf" .bkit/core/engine/commands/workflow/counters.ts` finds both names. **If** it finds neither → stop and rebase onto #891 before Task 1.
- [ ] **Render baselines:** `docs/failures.jsonl` `workflow-none-render-baselines-miss-read-only-helper-recovery` is OPEN; it records that the none-tracker baselines can drift from the rendered recovery text. On 2026-11-10 `vitest run .bkit/core/engine/render/trackers.test.ts -t "none render matches its baseline"` passes all five baselines on this base. Rerun it on the rebased base before Task 8. **If** it is red → leave the other baselines and that failure row to their own fix, and update only the two baselines Tasks 8-9 name.

### Conditional

- [ ] **Secrets & Env Vars:** n/a — no credential is added.
- [ ] **Schema State:** n/a — no database; the changed records are `status.jsonl` rows (`test-run`, `step-done`) and the saved CI selection, covered in `Data Schema Integration`.
- [ ] **Architecture & UI:** no new file and no UI; every change edits an existing engine module or workflow in the place `docs/architecture.md` already gives it.
- [ ] **Observability:** no new log name; `tests run` and `counters progress` print through `ctx.log` / `ctx.emit` as today.
- [ ] **Notifications:** n/a — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database (`docs/data-schema.md` does not apply). The records this plan reads and writes are append-only NDJSON rows in a feature's `status.jsonl` (`.bkit/core/engine/ledgers/status.ts`) and the saved CI selection the debug run stores through `status meta --ci-selection-file`. Each change is additive and optional, so rows and selections written before it still read.

### Data Schema Usage

- **Input (Read):** `step-done.failures`, `step-done.scope`, `step-done.parentSha`, `step-done.attempt`, `step-done.at` (the check rounds `loopProgress` reads); `step-done.strategy` (fix rounds); the active run's `ciSelection` (`runId`, `runUrl`, `failedJobCount`); `test-run.failures`, `test-run.scope`, `test-run.source` (read by `steps finish` for a CI round).
- **Output (Write):** `test-run.failures` on a `source: ci` round; `step-done.failures` on that round's `steps finish`; `ciSelection.failedJobCount` in the selection file `runs locate` writes.

### Data Schema Changes

- **ADD:** `CiSelection.failedJobCount` (optional positive whole number): failed jobs of the selected run attempt, the capstone job `bkit-tests-check` left out, or 1 when only the capstone failed; absent when no job failed or the jobs were not read. Not part of `ciSelectionIdentity`.
- **MODIFY:** `test-run.failures` on a `source: ci` row: `null` or a positive whole number (was `null` only); 0 stays refused.
- **MODIFY:** `step-done.failures` on a CI evidence round: must equal its `test-run` row's `failures`, and stays absent when that is `null` (was: always absent).
- **MODIFY:** `counters progress` output: `trend` gains `unknown`; new `trendLine` (string); `rounds[]` items gain `scope` (string or `null`); `recommend` is `null` on `unknown`.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| An `unknown` trend that never recommends Stop | `.bkit/core/engine/commands/workflow/counters.ts` | `grep -rln "loopProgress\|loopTrend" .bkit/core/engine scripts`; `grep -rn "counters progress\|LOOP_TREND\|TEST_TREND" .bkit/core/workflows/*.md`; read `loopTrend`, `loopProgress`, `LoopTrend`, `LoopProgress` | `loopTrend` — computes the trend; missing a state for an unknown count | EXTEND | Add `unknown` to `LoopTrend`; `loopProgress` maps it to `recommend: null` |
| Compare only rounds that ran the same tests | `.bkit/core/engine/commands/workflow/counters.ts` | read `Step` in `.bkit/core/engine/ledgers/status.ts` (`scope?: string`); `grep -n "scope" .bkit/core/workflows/bkit-debug.md .bkit/core/workflows/bkit-build.md` (both pass `--scope="{TEST_SCOPE}"` to `steps finish`) | `loopProgress` — picks `rounds[0]` and `rounds.at(-1)`; the rows already carry `scope` | EXTEND | Pick the comparison pair from the rounds whose `scope` equals the last round's; report each round's `scope` |
| One plain sentence describing the trend | `.bkit/core/engine/commands/workflow/counters.ts` | `grep -rn "no fewer\|trendLine\|made progress" .bkit/core .bkit/authoring.md`; read the `trendLine` map in the `compose` verb of `.bkit/core/engine/commands/workflow/decisions.ts` | `trendLine` map in `decisions compose` — one fixed sentence per trend, no counts, no scopes, unreachable from the debug workflow | EXTEND | Move the sentence into `loopProgress` output as `trendLine`, with the counts and the reason; `compose` reads it (the local map is removed, see `Supersession Inventory`) |
| Failed job count of the selected CI run | `.bkit/core/engine/commands/workflow/runs.ts` | `grep -rn "failedJobs\|redTiers" .bkit/core/engine/commands/workflow/runs.ts .bkit/core/engine/ledgers/status.ts`; read `locateCi` | `locateCi` — already filters `failedJobs` and drops `bkit-tests-check` when it maps tiers; the count is printed, never saved | EXTEND | Save `failedJobCount` on the selection `locateCi` builds |
| A selection field validated before use | `.bkit/core/engine/ledgers/status.ts` | read `CiSelection`, `validateCiSelection`, `ciSelectionIdentity`; `grep -rn "validateCiSelection" .bkit/core/engine/commands/workflow` | `validateCiSelection` — checks every identity field | EXTEND | Add the optional field to `CiSelection` and check it; leave `ciSelectionIdentity` unchanged |
| A count on the CI evidence round | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n "failures" .bkit/core/engine/commands/workflow/tests.ts`; read the CI branch of the `run` verb and `appendTestRun` | `run` verb CI branch — writes `failures: null` | EXTEND | Write `selection.failedJobCount ?? null` |
| The CI `test-run` row contract | `.bkit/core/engine/ledgers/status.ts` | read `testRunProblem`, `ciRoundMatches` | `testRunProblem` — refuses any CI `failures` but `null` | EXTEND | Accept a positive whole number |
| `steps finish` for a CI round with a count | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n "failures" .bkit/core/engine/commands/workflow/steps.ts`; read the CI check in `finish` and `failuresProblem` | `finish` — requires `failures === undefined` on a CI round | EXTEND | Require `failures` to equal the round's `test-run.failures` (absent when that is `null`) |
| The debug Loop Question wording | `.bkit/core/workflows/bkit-debug.md` | `grep -rn "no fewer" .bkit/core .bkit/authoring.md .bkit/instructions.md` | § Loop Question — three fixed `Q1` texts | EXTEND | Hold `trendLine` as `LOOP_TREND_LINE` and state it in each `Q1` and in the narration |
| The build loop pause wording | `.bkit/core/engine/commands/workflow/decisions.ts` | read the `compose` verb's `--loop` block (and the #891 branch's `trendReason`) | `compose` — writes the progress block, `Q1` and its reason | EXTEND | Use `p.trendLine` in `Q1`; on `unknown` / `first-round` build the reason from it instead of "the last round made progress" |

## Architecture & Component Changes

Every change edits an existing engine module, workflow or doc; no file is added or deleted. The engine edits land in `dist/` through `pnpm build`, and the workflow and doc sources reach `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/` and `.bkit/` through `pnpm tsx .bkit/core/engine/cli.ts upgrade`.

**Ledger rows:** `912-unknown-count-is-an-unknown-trend`, `912-loop-trend-compares-same-scope-rounds`, `912-trend-line-written-by-the-engine`, `912-ci-round-counts-failed-jobs`, `912-local-gate-count-stays-junit-only`

### Database Migrations

None — bkit has no database, and the `status.jsonl` and selection fields are optional additions that older rows satisfy.

### Engine — loop trend

#### [MODIFY] `.bkit/core/engine/commands/workflow/counters.ts`

- **Existence Check:** the file exists; `LoopTrend`, `loopTrend`, `LoopProgress`, `loopProgress` and the `progress` verb of `countersCommand` were read.
- `LoopTrend` gains `"unknown"`.
- `loopTrend(rounds, codeChanged)`: two or more rounds, and the first or last compared round has no `failures` → `unknown`. `first-round`, `worse`, `closing` and `stuck` keep their rules for known counts. On #891's shape the round's `failures` is the combined count `loopProgress` builds (check row plus gate row, `undefined` when the gate count is `null`), so a red group gate with no count also reads `unknown`.
- `loopProgress`: the compared pair is the earliest round whose `scope` equals the last round's `scope` (two absent scopes count as equal) and the last round. Fewer than two such rounds, with two or more rounds in all → `unknown`. `codeChanged` is judged between the compared pair's `parentSha` values; `minutesPerRound` stays over all rounds.
- `LoopProgress.rounds[]` items gain `scope: string | null`; new `trendLine: string`; `recommend` is `null` on `first-round` and `unknown`, `try-again` on `closing`, `stop` on `stuck` and `worse`.
- `trendLine` texts (counts filled from the compared pair, scopes from the rows). They name no unit, because the debug and build test loops count failures while `decisions compose --loop=verify` / `--loop=holistic` count problems. E.g.:
  - `first-round`: "This was the first round, so there is no trend yet."
  - `closing`: "The count fell between the first and the last round ({a} → {b}), and the code changed."
  - `stuck`, count not lower: "The count did not fall between the first and the last round ({a} → {b})."
  - `stuck`, count lower but no source change: "The count fell ({a} → {b}), but no source code changed between the rounds."
  - `worse`: "The count rose between the first and the last round ({a} → {b})."
  - `unknown`, missing count: "A round recorded no count ({counts}), so progress cannot be judged."
  - `unknown`, different scopes: "The rounds ran different tests ({first scope}, then {last scope}), so their counts cannot be compared."
- `unknown` precedence: when the scopes differ and a count is missing, the different-scopes sentence wins, because no count could make the rounds comparable.
- `progress` verb `output` help: `trend` lists `unknown`; `trendLine` and `rounds` (`scope`) described; `recommend` "null on the first round or an unknown trend".

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists; the `compose` verb's `--loop` block was read here and on `feat/891-build-gate-stuck` (`trendReason`).
- Task 1 adds an `unknown` key to the local per-trend `trendLine` map, so the map indexed by `LoopTrend` still typechecks at the Group 1 gate; Task 7 then deletes the map.
- `compose --loop`: `Q1`'s question ends with `p.trendLine`.
- [DELETE] the per-trend `trendLine` map local to the `compose` verb (Task 7), superseded by `p.trendLine`.
- On `unknown` the reason is built from `p.trendLine` and says the limit is used up (every `--loop` pause on `unknown` fires at a used-up limit, Open Question Q5), e.g. "the limit is used up, and the counts cannot show whether the rounds helped: {trendLine}". It never says "the last round made progress" or that a round is left; `loopRecommended` stays `Try again` (Open Question Q5 default).
- The progress block's `Trend:` line prints `unknown` as is.

### Engine — CI round count

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`

- **Existence Check:** the file exists; `CiSelection`, `validateCiSelection`, `ciSelectionIdentity`, `testRunProblem` and `ciRoundMatches` were read.
- `CiSelection` (`mode: "ci"`) gains optional `failedJobCount?: number`.
- `validateCiSelection`: `failedJobCount` absent, or a safe integer > 0.
- `ciSelectionIdentity`: unchanged (the count is not identity).
- `testRunProblem`, CI branch: `r.failures` is `null` or a safe integer > 0 (was `null` only).

#### [MODIFY] `.bkit/core/engine/commands/workflow/runs.ts`

- **Existence Check:** the file exists; `locateCi` (the `failedJobs` filter and the `bkit-tests-check` exclusion) was read.
- `locateCi` sets `failedJobCount` on the selection it builds: the failed jobs other than `bkit-tests-check`; 1 when that is 0 and the capstone failed; omitted when no job failed. The same rule applies to jobs from the exit-80 fallback evidence file, which flows through the same filter.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** the file exists; the CI branch of the `run` verb in `testsCommand` and `appendTestRun` were read.
- CI branch: `failures: selection.failedJobCount ?? null` in both the `appendTestRun` call and the emitted object; the `failures` output help names the CI case.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** the file exists; the CI round check in `finish` was read.
- CI round check: `failures === undefined` becomes "`failures` equals `round.failures` when that is a number, and is undefined when it is `null`". The error text stays `CI evidence does not match the active selection`.

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** the file exists; § Loop Question, § Gate — Loop Question and § Step 3 — Run Tests were read.
- § Loop Question step 2: hold `trendLine` as `LOOP_TREND_LINE`; the no-ask narration becomes `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS}: {LOOP_TREND_LINE})`.
- § Loop Question step 3, the three trend `Q1` texts:
  - `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`
  - `soak`, attempt 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`
  - `soak`, later → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`
  - The `LOOP_LIMIT` text keeps its wording and adds `{LOOP_TREND_LINE}` after the first sentence.
- § Step 3 is unchanged: `{FAILURES_FLAG}` already passes `--failures` whenever `tests run` prints a count, which now includes the CI round.
- § Gate — Loop Question is unchanged (asked only on `stuck` / `worse`, or the soak limit used up).

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists; Step 12 route 4 was read.
- Step 12: the trailing sentence "a failed test round after a round that made progress is always fixed, never asked" becomes "a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is fixed without asking". Routing is unchanged.

### Docs and agent-read references

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; the `Progress report` table (`trend`, `recommend` rows) and § Selected CI loop were read.
- `trend` row: `unknown` = a compared round has no count, or fewer than two rounds share the last round's `scope`; the compared pair is the earliest same-scope round and the last.
- `recommend` row: `null` on `first-round` and `unknown`.
- `codeChanged` row: the `git diff` is between the compared same-scope pair's `parentSha`, not the first and last check rows'.
- New `trendLine` row: the engine's sentence, stated by the debug Loop Question and `decisions compose --loop`.
- § Selected CI loop: the CI round records `failures` = the selected run's failed job count when known.
- § Failure count from JUnit reports: the JUnit count is a local round's `failures`; a `source: ci` round's `failures` counts the selected run's failed jobs, the capstone `bkit-tests-check` left out, and is `null` when the jobs were not read.
- `/bkit-build` Step 12 row: the no-ask route covers `unknown`.

#### [MODIFY] `.bkit/core/.bkit/authoring.md`

- **Existence Check:** the file exists; the Loop Question example under § Human questions was read.
- The example's `Q1` becomes a filled `trendLine`, e.g. `**Q1 — Fix:** The count did not fall between the first and the last round (3 → 3). Stop here instead of trying again?`.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** the file exists; the debug Loop Question local entries (the narration and the three `Q1` lines) were read.
- Each edited standing line of `bkit-debug.md` and `bkit-build.md` gets its local entry edited by hand (`docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits`).

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists; § Counter derivation test coverage and § JUnit reports for bkit were read.
- `commands/workflow/counters.test.ts` row: add the `progress` trend (incl. `unknown`), the same-scope comparison and `trendLine`.
- § JUnit reports for bkit: the JUnit count is a local round's `failures`; a `source: ci` round counts failed CI jobs, the capstone left out.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The per-trend `trendLine` map inside the `compose` verb of `.bkit/core/engine/commands/workflow/decisions.ts` | `trendLine` on `loopProgress` output in `.bkit/core/engine/commands/workflow/counters.ts` | DELETE | One sentence source for every loop question; removed in Task 7 |
| The three fixed "left no fewer failures" `Q1` texts in `.bkit/core/workflows/bkit-debug.md` § Loop Question | `{LOOP_TREND_LINE}` in the same lines | DELETE | The fixed claim is the reported bug; replaced in place in Task 8 |

No file is deleted.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None from planning; the build writes a row if it meets a trap |
| `docs/decisions.jsonl` | Written at plan time: the five `912-*` rows on the `Ledger rows` line |
| `docs/architecture.md` | None: no topology or component change |
| `docs/technology.md` | None |
| `docs/data-schema.md` | None: bkit has no database |
| `docs/design.md` | None: no UI |
| `docs/testing.md` | § Counter derivation test coverage: the `counters.test.ts` row adds the `progress` trend (incl. `unknown`), the same-scope comparison and `trendLine`; § JUnit reports for bkit: a `source: ci` round counts failed CI jobs, the capstone left out (Task 9) |
| `docs/observability.md` | None: no new log names |
| `.bkit/core/.bkit/workflows.md` (mirrored to `.bkit/workflows.md`) | `Progress report` table (`trend`, `recommend`, `codeChanged` between the compared pair, new `trendLine` row); § Selected CI loop (CI round count); § Failure count from JUnit reports (a `source: ci` round counts failed jobs); `/bkit-build` Step 12 row (no-ask route covers `unknown`) (Task 9) |
| `.bkit/core/.bkit/authoring.md` (mirrored to `.bkit/authoring.md`) | The debug Loop Question example under § Human questions shows a filled `trendLine` (Task 8) |
| `.bkit/instructions.md` | Local entries for every edited standing line of `bkit-debug.md` and `bkit-build.md` (Tasks 8, 9) |
| `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`, `bkit-build.none.txt` | Updated one baseline at a time with a test-name filter (Tasks 8, 9); the other three baselines stay untouched, and each updated baseline's diff holds only this plan's lines |
| `CHANGELOG.md` | None in this change: entries are written at release under `## [version]` sections, with no `Unreleased` section. The release's `Upgrade Notes` should carry the `Breaking Changes` row on consumer scripts that treat every non-`closing` trend as Stop |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database change |
| **Code** | `git revert {COMMIT}` of the merge, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` | A `status.jsonl` that already holds a CI `test-run` row with a positive `failures` fails the reverted `testRunProblem`; finish or restart that debug run before reverting, or start a new debug run after it |
| **Risk window** | None | No deploy; consumers take the change with their next `bkit upgrade` |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the trend in the engine (Group 1), then the CI round count (Group 2), then the questions, docs and generated mirrors (Group 3). Build on a branch that already holds #891 (Assumption A1, checked in Pre-Flight). Every task that edits `.bkit/core/engine/**/*.ts` rebuilds `dist/` before it is done, because the Task 6 integration test runs `dist/cli.js` and `.agents/rules.md` § Engine builds puts `dist/` in the same commit. Tasks 5 and 6 land in one commit: between them `tests run` prints a CI count that debug Step 3 passes as `--failures`, and `steps finish` still refuses it. One PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: An honest loop trend in the engine

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Read an unknown failure count as trend `unknown`, which recommends nothing
  - **UPDATE:** `LoopTrend` in `.bkit/core/engine/commands/workflow/counters.ts`: add `"unknown"`
  - **UPDATE:** `loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts`: two or more rounds with no `failures` on the first or last compared round → `unknown`; on #891's shape the round's `failures` is the combined check-plus-gate count `loopProgress` builds
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: `recommend` is `null` on `first-round` and `unknown`
  - **UPDATE:** `countersCommand` in `.bkit/core/engine/commands/workflow/counters.ts`: the `progress` verb's `trend` and `recommend` output help name `unknown`
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: add an `unknown` key to the `compose` verb's per-trend `trendLine` map, so the map indexed by `LoopTrend` typechecks (Task 7 deletes the map)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: the `loopTrend` case `loopTrend([r(5), r()], true)` now expects `unknown`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: the #891 cases `loopProgress with a gate > a red gate row with no failure count makes the round unknown` and `loopProgress with a gate > a red gate row with 0 counted failures makes the round unknown` now expect `trend: "unknown"` (was `stuck`), and `recommend: null` where asserted
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: any #891 `--loop` case whose status holds a round with no count and pins `Decide` now expects the Open Question Q5 recommendation (none at `a8b0f055c`: the `stuckStatus` rows carry counts); a verify-loop pause on such a round now recommends `Try again`
  - **DONE WHEN:** `loopTrend([r(5), r()], true)` returns `unknown`; `counters progress` on a log whose last round has no `failures` prints `trend: unknown` and `recommend: null`; the two #891 gate cases read `unknown`; `decisions compose --loop=verify` on a red group gate with no count prints `Trend: unknown` and recommends by Open Question Q5 (default `Try again`), not `Decide` on the trend; `counters.test.ts` and `decisions.test.ts` pass; `pnpm typecheck` passes; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopTrend > a missing count is unknown, not stuck` fails on a round with no count still returning "stuck"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > a round with no count reports unknown and no recommendation` fails on `recommend` being "stop" for counts `5 → ?`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop=verify with an uncounted group gate reads unknown` fails on the pause reading "Trend: stuck" and recommending `Decide` for a red group gate row with no count (#891 shape)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Compare only rounds that ran the same tests
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: the compared pair is the earliest round whose `scope` equals the last round's (two absent scopes are equal) and the last round; fewer than two such rounds → `unknown`; `codeChanged` is judged between the pair's `parentSha` values
  - **UPDATE:** `LoopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: `rounds[]` items gain `scope: string | null`
  - **UPDATE:** `countersCommand` in `.bkit/core/engine/commands/workflow/counters.ts`: the `progress` verb's `rounds` and `codeChanged` output help name the scope rule
  - **READ:** `Step` in `.bkit/core/engine/ledgers/status.ts`: `scope` on `step-done` rows
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: add a `--since-clean` case over unscoped holistic rounds with known counts that still reads its trend as today (a regression guard, not a red test)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a log with rounds `ci:123` (2) and `pnpm bkit:gate:static-unit` (`?`) prints `trend: unknown`; rounds `ci:123` (2), local (5), local (2) print `trend: closing`; with distinct `parentSha` values and no source change between the two local rounds the same counts print `codeChanged: false`, `trend: stuck`; the `--since-clean` case passes; every existing `bkit counters progress` case (rows with no `scope`) still passes; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > does not compare a CI round with a local gate round` fails on rounds `ci:123` (3) and a local gate (3) reading "stuck"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > compares the last round with the earliest round of the same scope` fails on rounds CI (2), local (5), local (2) not reading "closing"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > reports each round's scope` fails on `rounds` items carrying no `scope`
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > judges codeChanged between the compared same-scope rounds` fails on the trend reading "closing" when it should read `stuck`, for a git repo (as in `judges codeChanged on source only, from the rounds' parent commits`) with a source change between the CI round and the first local round and none between the two local rounds

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Print `trendLine`, one plain sentence with the counts and the reason
  - **UPDATE:** `LoopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: add `trendLine: string`
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: build `trendLine` per `Architecture & Component Changes` § Engine — loop trend (first round, closing, stuck with a count not lower, stuck with a lower count and no source change, worse, unknown count, different scopes), unit-free, with different scopes winning over a missing count
  - **UPDATE:** `countersCommand` in `.bkit/core/engine/commands/workflow/counters.ts`: the `progress` verb's output help adds `trendLine`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `counters progress` prints a `trendLine` for every trend; no `trendLine` says the count did not fall unless both compared counts are known and the last is not lower; no `trendLine` contains "failures" or "problems"; with different scopes and a missing count, `trendLine` is the different-scopes sentence; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine names an unknown count instead of claiming no fewer failures` fails on `trendLine` lacking "recorded no count"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine says the rounds ran different tests` fails on `trendLine` lacking "ran different tests"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine for a fall without a code change says no source code changed` fails on `trendLine` lacking "no source code changed"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine for the same count states both counts` fails on `trendLine` lacking "(21 → 21)"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine prefers different scopes over a missing count` fails on rounds `ci:123` (2) and a local gate (`?`) giving `trendLine` "recorded no count" instead of "ran different tests"

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: A failure count for the CI evidence round

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Save the selected run's failed job count on the CI selection
  - **UPDATE:** `CiSelection` in `.bkit/core/engine/ledgers/status.ts`: optional `failedJobCount?: number` on the `mode: "ci"` variant
  - **UPDATE:** `validateCiSelection` in `.bkit/core/engine/ledgers/status.ts`: `failedJobCount` absent or a safe integer > 0
  - **READ:** `ciSelectionIdentity` in `.bkit/core/engine/ledgers/status.ts`: stays unchanged, so the count never starts a new CI generation
  - **UPDATE:** `locateCi` in `.bkit/core/engine/commands/workflow/runs.ts`: set `failedJobCount` = failed jobs other than `bkit-tests-check`, 1 when only the capstone failed, omitted when none failed; the jobs from the exit-80 fallback `--evidence-file` go through the same filter
  - **DONE WHEN:** a located selection with two failed test jobs and a failed capstone saves `failedJobCount: 2`; a capstone-only failure saves 1; a run with no failed job saves no `failedJobCount`; a `--evidence-file` envelope with one failed test job and a failed capstone saves 1; `validateCiSelection` refuses 0, -1 and 1.5 and accepts a selection without the field; `ciSelectionIdentity` returns the same value with and without the field; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/status.test.ts` `CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity` fails on a selection with `failedJobCount: 0` being accepted
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `saves the failed job count without the capstone job` fails on the saved selection carrying no `failedJobCount`
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `counts the capstone job when it is the only failed job` fails on `failedJobCount` being absent instead of 1
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `saves no failed job count when no job failed` fails on a run with no failed job saving a `failedJobCount` of 0 or 1 instead of none
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `counts fallback evidence jobs without the capstone job` fails on a `--evidence-file` selection carrying no `failedJobCount`, or a count that includes `bkit-tests-check`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Record the failed job count on the CI `test-run` row
  - **UPDATE:** `testRunProblem` in `.bkit/core/engine/ledgers/status.ts`: a `source: ci` row's `failures` is `null` or a safe integer > 0
  - **READ:** `ciRoundMatches` in `.bkit/core/engine/ledgers/status.ts`: calls `testRunProblem`, so a counted round still matches its selection
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb's CI branch writes `failures: selection.failedJobCount ?? null` to `appendTestRun` and the emitted object; the `failures` output help names the CI case
  - **READ:** `.bkit/core/engine/checks/status-holes.ts`: the completeness check reads `ciRoundMatches`, so a counted CI round must raise no evidence hole
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `tests run --ci-run` with a selection holding `failedJobCount: 2` prints and records `failures: 2`; with no count it records `null` as before; `testRunProblem` refuses a CI row with `failures: 0`; a CI round with `failures: 2` and its matching `step-done` row raises no `tests run --ci-run` hole; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0; Task 6 lands in the same commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `CI evidence test rounds > records the selected run's failed job count` fails on the CI round recording `failures` null when the selection holds 2
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `test-run status row validation > accepts a counted CI evidence round and refuses 0` fails on "invalid CI evidence round" for a CI row with `failures: 2`
    - `.bkit/core/engine/checks/status-holes.test.ts` `check — hole classes > a counted CI round with its step-done row raises no CI evidence hole` fails on a `tests run --ci-run` hole reported for a CI round with `failures: 2`

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Finish a counted CI round only with its own failed job count
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: on a CI round, `failures` must equal the `test-run` row's `failures` when that is a number, and be absent when it is `null`; the error text stays `CI evidence does not match the active selection`
  - **READ:** `.bkit/core/workflows/bkit-debug.md`: § Step 3 `{FAILURES_FLAG}` already passes `--failures` whenever `tests run` prints a count
  - **DEPENDS ON:** 2, 5
  - **DONE WHEN:** `steps finish --failures=2` on a CI round whose row holds 2 writes the `step-done` row with `failures: 2`; `--failures=3` on that round is refused with no row written; `--failures=2` on a CI round whose row holds `failures: null` is refused with no row written; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0,; Task 10 lands the integration test that replays the incident through `dist/cli.js`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finishes a CI round only with its own failed job count` fails on a `--failures=2` that matches the round's row being refused with a usage exit; the same test asserts that `--failures` on a row with `failures: null` and a different count are both refused
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown` fails on the CI round recording no failure count; Task 10 corrects that test's second round, and this line keeps Task 6's recorded red in step with the corrected test

<!-- bkit:task 6 end -->

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Prove the incident's sequence end to end with an uncounted local round that fails
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: the fake `gh` jobs fixture fails `bkit-tests-check` alongside the failed test jobs, as a real red run does; the test's second round runs a local gate that exits 1 and writes no JUnit report (a `control.failLocal` switch in the fixture's `gate.cjs`), so `tests run` records `failures: null`, instead of a passing gate that records `failures: 0`
  - **DEPENDS ON:** 2, 5, 6
  - **DONE WHEN:** the integration test replays Step 3 twice with the capstone failed, runs the Loop Question's `counters progress`, sees the CI round's `failures` without the capstone, a local round with `failures: null`, `counts: "2 → ?"` and `trend: "unknown"`, and passes against the built `dist/cli.js`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown` fails on the second round passing and recording `failures: 0`, where the test expects the uncounted `failures: null`

<!-- bkit:task 10 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Loop questions, docs and generated copies

<!-- bkit:task 7 start -->

- [x] **TASK 7:** State `trendLine` at every build loop pause, and never claim progress on an unknown trend
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `compose` verb's `--loop` block ends `Q1`'s question with `p.trendLine`; on `unknown` it builds the reason from `p.trendLine`, says the limit is used up, and keeps `Try again` (Open Question Q5 default)
  - **DELETE:** `trendLine` in `.bkit/core/engine/commands/workflow/decisions.ts`: the per-trend map local to the `compose` verb, superseded by `p.trendLine`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: existing `--loop` cases that match the old fixed sentences now match `trendLine`
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** `decisions compose --loop=tests` on an `unknown` trend writes `Recommended: … Try again` with a reason that says the limit is used up and contains neither "the last round made progress" nor "a round is left"; the `--loop=verify` pause on an uncounted group gate gives the same reason; `Q1` holds the counts from `trendLine`; `decisions.test.ts` passes; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop on an unknown trend recommends Try again without claiming progress` fails on the reason reading "the last round made progress"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop on an unknown trend says the limit is used up` fails on the reason claiming "a round is left", or lacking "limit is used up"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop states the engine's trendLine in Q1` fails on `Q1` lacking the counts "(5 → 2)"

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [x] **TASK 8:** Make the debug Loop Question state what the counts show
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 2 holds `trendLine` as `LOOP_TREND_LINE` and adds it to the no-ask narration; step 3's `Q1` texts state `{LOOP_TREND_LINE}` per `Architecture & Component Changes` § Workflows, with no "left no fewer failures"
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: the § Human questions Loop Question example shows a filled `trendLine`
  - **UPDATE:** `.bkit/instructions.md`: the local entries of each edited `bkit-debug.md` standing line
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: add the Loop Question cases beside `debug takes a further fix or soak attempt without asking unless the trend is stuck or worse`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: updated alone with `vitest run .bkit/core/engine/render/trackers.test.ts -u -t "bkit-debug: the none render matches its baseline"`, never with a folder-wide `-u`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `grep -n "left no fewer failures" .bkit/core/workflows/bkit-debug.md .bkit/core/.bkit/authoring.md .bkit/instructions.md` finds nothing; `workflow-shape.test.ts` passes; `pnpm tsx .bkit/core/engine/tools/instructions.ts` (check mode, no `--write`) exits 0; `git diff --stat .bkit/core/engine/render/__snapshots__/` lists only `bkit-debug.none.txt`, and its diff holds only the Loop Question and narration lines.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Loop Question states the engine's trend line, never a fixed claim` fails on the `Q1` texts still saying "left no fewer failures"
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Loop Question at the used-up soak limit states the trend line` fails on the `LOOP_LIMIT` `Q1` lacking "{LOOP_TREND_LINE}" or no longer recommending Stop

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [x] **TASK 9:** Update the build route sentence and the docs, and regenerate every built and mirrored copy
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 12's trailing sentence says a failed round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is fixed without asking
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `Progress report` table (`trend` with `unknown` and the scope rule, `recommend` `null` on `unknown`, `codeChanged` judged between the compared same-scope pair, new `trendLine` row); § Selected CI loop (the CI round's failed job count); § Failure count from JUnit reports (a `source: ci` round's `failures` counts failed jobs, the capstone left out); the `/bkit-build` Step 12 row
  - **UPDATE:** `docs/testing.md`: § Counter derivation test coverage, `commands/workflow/counters.test.ts` row; § JUnit reports for bkit (a `source: ci` round counts failed CI jobs, the capstone left out)
  - **UPDATE:** `.bkit/instructions.md`: the local entry of the edited `bkit-build.md` line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: updated alone with `vitest run .bkit/core/engine/render/trackers.test.ts -u -t "bkit-build: the none render matches its baseline"`
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8
  - **DONE WHEN:** the parts of `pnpm bkit:generate` other than its folder-wide render `-u` ran (`pnpm build && pnpm cli:sync && pnpm instructions:sync && pnpm bkit upgrade`, and `pnpm bkit:graph:refresh` when `graphify` is installed); the `bkit-build` baseline was updated alone; `git diff --stat .bkit/core/engine/render/__snapshots__/` lists only `bkit-debug.none.txt` and `bkit-build.none.txt`, and their diffs hold only the Loop Question, narration and Step 12 lines; `git add dist/` has run, so `pnpm bkit:check:dist` exits 0; `vitest run .bkit/core/engine/render` passes; `pnpm bkit:gate:static` passes; and `node dist/cli.js check` reports no drift.
  - **TEST FIRST:** n/a — docs, workflow wording with no routing change, and regenerated `dist/`, mirrors and snapshots; covered by the Static tier

<!-- bkit:task 9 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 1 findings

<!-- bkit:task 11 start -->

- [x] **TASK 11:** A build loop pause on an unknown trend tells the owner "the limit is used up" when rounds are still left (Step 8 GATE_RERUN re-ask, Step 9 VERIFY_FIXED = 0 with a red gate, Step 12 GATE_RERUN re-ask)
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:464` · **Round:** 1
  - **DONE WHEN:** decisions compose --loop on an unknown trend says the limit is used up only when --attempt >= --max (both numeric); below the limit, or with --max absent, the reason states p.trendLine without any claim about the limit or a round left; decisions.test.ts passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop=verify on an unknown trend below the limit does not say the limit is used up`

<!-- bkit:task 11 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (this plan adds none).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened; the CI round check in `steps finish` was tightened, not relaxed.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** no new log names; `tests run` still prints its missing-report hint for a local gate with no JUnit report.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate (no doc added or removed).
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `node dist/cli.js check` pass.
- [ ] **Test Synchronization:** the existing cases in `counters.test.ts` (`loopTrend`, and #891's two `loopProgress with a gate` cases), `decisions.test.ts` (`--loop`) and `workflow-shape.test.ts` (debug and build loop routes) are updated alongside; no E2E suite exists for bkit. The build test loop's no-pause route on `unknown` is evidenced by the existing, unchanged `workflow-shape.test.ts` case `build takes a further test round without asking unless the trend is stuck or worse`, which still passes after Task 9.
- [ ] **Build Configuration:** test files stay out of `dist/` (`tsconfig.json` builds the engine; tests type-check through `tsconfig.test.json`).
- [ ] **Unit (`.bkit/core/engine/commands/workflow/counters.test.ts`):** the `unknown` trend, the same-scope comparison and every `trendLine` case; each test writes its own `status.jsonl` under `os.tmpdir()`.
- [ ] **Unit (`status.test.ts`, `telemetry.test.ts`, `runs.test.ts`, `tests.test.ts`, `steps.test.ts`, `status-holes.test.ts`):** the CI selection field, the CI `test-run` contract, the `runs locate` count through the in-file `locateFixture` (jobs API path and `--evidence-file` fallback), the `steps finish` equality check, and no evidence hole for a counted CI round.
- [ ] **Integration (`.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`):** the incident's sequence through the real built CLI commands taken from `bkit-debug.md`, in a fresh temporary consumer, with the fake `gh` failing the capstone alongside the test jobs.
- [ ] **Apply local migrations:** n/a — no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch consumer, write a `status.jsonl` with a `workflow-started` row and two `debug-run-tests` `step-done` rows, the first `scope: ci:123`, `failures: 2`, the second `scope: pnpm bkit:gate:static-unit` with no `failures`; run `node dist/cli.js counters progress --file=status.jsonl --workflow=debug --check=debug-run-tests --fix=debug-failure-remediate` and check `counts: "2 → ?"`, `trend: "unknown"`, `recommend: null` and a `trendLine` that says the rounds ran different tests.
- [ ] **Step 2:** Run `pnpm build`, then `node dist/cli.js install` in a fresh scratch consumer; read its installed `bkit-debug` workflow and check that every Loop Question `Q1` states `{LOOP_TREND_LINE}`.
- [ ] **Step 3 (GitHub jobs boundary):** with `gh` authenticated against `cbartens/bkit`, run `node dist/cli.js runs locate --prompt-file={file} --repo=cbartens/bkit --selection-out={file}` (the debug Step 2 command) with a prompt file naming the historical red run `https://github.com/cbartens/bkit/actions/runs/41405235221` (it failed `bkit-tests-integration` and `bkit-tests-check`), and compare the saved `failedJobCount` with the failed non-capstone job count from `gh api repos/cbartens/bkit/actions/runs/41405235221/jobs` (expected 1). Report the check as available (with both numbers) or unavailable (with the reason, for example the run's logs or jobs expired).
