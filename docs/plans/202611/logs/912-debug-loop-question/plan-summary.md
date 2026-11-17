Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

PASS

- No unresolved finding, failing check, open task, accepted limitation or open deferral.

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/912-debug-loop-question/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/912-debug-loop-question/plan-v1-draft.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/912-debug-loop-question/related-deferrals.md`, `docs/plans/202611/logs/912-debug-loop-question/related-failures.md`, `docs/plans/202611/logs/912-debug-loop-question/related-issues.md` |
| plan-review | CONCERNS | 11 | 1 | `docs/plans/202611/logs/912-debug-loop-question/plan-review-1.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-review-2.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/912-debug-loop-question/plan-v2-reviewed.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/912-debug-loop-question/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/912-debug-loop-question/plan-v1-draft.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/912-debug-loop-question/related-deferrals.md`, `docs/plans/202611/logs/912-debug-loop-question/related-failures.md`, `docs/plans/202611/logs/912-debug-loop-question/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/912-debug-loop-question/plan-review-1.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-review-2.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/912-debug-loop-question/plan-v2-reviewed.md`, `docs/plans/202611/logs/912-debug-loop-question/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

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

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1 — Narrative and Success Criteria:** #912 is a bug-shape issue, which has no `Narrative` or `Success Criteria` fields, and there is no design or audit, so both read `⚠️ MISSING`. → The owner resolves it at plan review.
  - **Options:** A) Adopt the issue's four "What should happen" bullets word for word as the Success Criteria, and write a Narrative from "What happened" — fastest, and the criteria are the owner's own words · B) The owner writes both — most precise, costs a review round · C) Re-file #912 in the change shape — the issue becomes the spec, but it duplicates this plan's work
  - **Recommended:** A) Adopt the "What should happen" bullets — they already state four measurable outcomes, and each one maps to a `Derived Test Matrix` row.
  - **Default if unanswered:** the plan stays blocked at Gate 1 with both fields `⚠️ MISSING`.
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

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #912
```
