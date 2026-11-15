# Build: Test Only What Changed While Building Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

Since #889, build Step 10 (holistic verify, the whole-feature check after the last group) runs as a check, fix and check loop, and it runs again after every Build Challenge round that adds fix groups. Every round runs `bkit tests changed --base=origin/dev`, so each round re-tests every file the feature changed. In `923-pre-push-block`, tests and test-lock waits took 372 of the 442 minutes the holistic agents spent (84%). The same whole-suite re-run happens in four more places: the holistic limit resets after each clean check and on restart; the Step 8 group gate runs the whole `bkit:gate:static-unit`; the debug soak agent runs the whole `pnpm bkit:gate:static-unit`; and the push after Step 12 runs the full pre-push gate again.

Goals:

- Scope every test run inside the build loop to the files changed since the last proven point: the last clean holistic commit, the group's start commit, or the soak agent's own changes.
- Keep exactly one full-suite run per build (Step 12), and let the branch's first push reuse it through a push-gate receipt.
- Make the holistic limit one non-resetting allowance per build (`build.holistic`, max 2), counted across restarts, and set every limit to 2.
- Number holistic reports and fix logs across every run, so a restart overwrites nothing.

Investigation findings that shape the plan:

- The branch's first push is Step 15 sub-step 4 (`branches push --mode=feature --set-upstream`), a new-branch push. The Step 16 push is an increment on an existing branch, which the existing `hasVerifiedIncrement` logic already handles once a receipt exists. The new-branch receipt reuse therefore takes effect at Step 15, and Step 16 follows from it.
- Every engine call appends an `engine-call` row to the tracked `status.jsonl`, so the working tree is never clean while a build runs. A receipt that demands a fully clean tree (the rule `runPushGate` uses) would never be written at Step 12. The Step 12 receipt therefore accepts uncommitted changes inside the min-push (bookkeeping) paths only (Open Question 3).
- bkit's own `bkit:gate:changed` vitest stages already inherit `$BKIT_TEST_REPORT_DIR`, and `vitest.config.ts` writes a JUnit file when it is set, so a changed-files group gate keeps its failure count.

**Related Issues:**

- #951 — Build: repeat whole-feature checks re-check everything, costing hours (OPEN)
- #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (CLOSED)
- #952 — Stats: split build time into work, tests, lock waits and owner waits (OPEN)
- #750 — Workflow optimisation (OPEN)
- #840 — Ship deferred sweep: keep, slim, or drop after build verify? (OPEN)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

**Rule:** while a build works, it tests only what changed. The full suite runs once, at Step 12, after everything is built and verified. The Step 16 push does not run it again when Step 12 already passed on the same code. CI on the PR still runs everything.

### Success Criteria

- A repeat holistic check runs only the tests for files changed since the last holistic check that found no problems. The first check covers the whole feature diff.
- Holistic fix rounds count once per build, across restarts, with no reset. The third fix round the build needs goes to the Decision Pause (or to the Failure Path when `ask` is false). A restart writes no holistic report or fix log over one from an earlier run.
- The Step 8 group gate and the soak agent's post-fix run check only changed files. Build Step 12 and debug Step 3 still run the full suite.
- After Step 12 passes, the Step 16 push skips the full pre-push gate when the commits after the Step 12 commit touch bookkeeping paths only. Any code change after it runs the full gate.
- On a build shaped like 923 (two challenge rounds, each adding a fix group), the repeat holistic rounds take at least half less time, measured from the step rows with owner waits excluded.

### Process Sketch

- **WHEN** a holistic check runs after an earlier clean holistic check **→ THEN** it tests only the files changed since that clean check's commit; the first check, or one with no clean check before it, tests the whole feature diff from `origin/dev`.
- **WHEN** a holistic check finds gaps **→ THEN** the base does not move, and the fix round counts against `build.holistic` across every run of the build, so the third fix round goes to the Decision Pause (or the Failure Path when `ask` is false).
- **WHEN** the build restarts **→ THEN** the allowance, the last-clean commit and the report number are read across every run, and the next report is numbered after the last run's.
- **WHEN** the Step 8 group gate or the soak agent's post-fix run checks the code **→ THEN** it runs `bkit:gate:changed` on the changed files, or the `--fallback` whole gate when the script is undeclared; Step 12 and debug Step 3 still run the whole deepest gate.
- **WHEN** Step 12 passes on a commit whose only uncommitted changes are bookkeeping **→ THEN** it records a full-gate receipt, and a push whose commits after that commit touch bookkeeping paths only runs `bkit:gate:min`.
- **IF** code lands after the receipted commit, or the gate definition changed **→ THEN** the push runs the full pre-push gate.

### Concrete Example

**Setup:** A build like `923-pre-push-block`: four groups, two Build Challenge rounds that each add one fix group, `ask: true` at every ask point, and bkit's own `bkit:gate:changed` declared.

**Steps:**

1. The orchestrator reaches Step 10 for the first time → System derives report number 1 across every run, finds no clean holistic row, and holds `HOLISTIC_BASE` = `origin/dev`. The verifier runs `bkit tests changed --base=origin/dev` over the whole feature and finds two gaps.
2. The orchestrator routes the fix round → `counters route --of=build-plan-gaps-remediate-holistic:next --all-runs --point=build.holistic` prints 1 of 2, and fix round 1 runs. The re-check (report 2) still uses `origin/dev`, because no check has been clean yet, and it is clean.
3. Build Challenge round 1 adds fix group 5 → System runs the Step 8 group gate with `tests run --changed-since={GROUP_BASE}`, which tests only group 5's files. The third holistic check (report 3) takes `HOLISTIC_BASE` = the commit of report 2 and tests only group 5's files.
4. The build fails and restarts → System numbers the restart's first holistic report 4, not 1, and the fix-round count stays at 1.
5. Step 12 runs the whole `bkit:gate:static-unit-integration` and passes → System records a push-gate receipt for the Step 12 commit.
6. Step 15 pushes the new feature branch, whose commits after the Step 12 commit hold only logs and ledgers → pre-push runs `bkit:gate:min`. The Step 16 push is a bookkeeping increment and also runs `bkit:gate:min`.

**Outcome:** The repeat holistic checks tested only group 5's files, no report was overwritten by the restart, and neither push re-ran the full suite. CI on the PR still ran everything.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No holistic check has passed yet (the first one found gaps) | The re-check after the fix still uses `--base=origin/dev` |
| A holistic check finds gaps after an earlier clean check | The next check keeps the clean check's commit as its base, so it tests the unproven changes and the fix together |
| A consumer's `package.json` sets `build.verify.maxAttempts` above 2 | `bkit upgrade` lowers it to 2 and prints one line naming the old value; 2 or less is left alone |
| Decision Pause "Fix now" adds tasks to an earlier group after a clean holistic check | Those changes are commits after the clean commit, so the next check covers them |
| The build fails and restarts (a new `workflow-started` row) | The holistic allowance, the last-clean commit and the report number are read across every run of the build, so the restart's first check is numbered after the last run's |
| `bkit tests changed` exits 81 (tests lock held) | Unchanged: wait and run again |
| A consumer declares no `bkit:gate:changed` | `bkit tests changed` runs the `--fallback` whole gate, as today |
| A code commit lands after Step 12 passed | Steps 13–14 re-run Step 12, or pre-push runs the full gate |
| The gate definition in `package.json` changed after the Step 12 receipt | The receipt does not count (existing fingerprint check), so the full gate runs |
| A new branch has code commits after the receipted commit | Full pre-push gate |
| The last clean holistic row's `parentSha` no longer names a commit (history rewritten) | `status route` prints `cleanBase` = `origin/dev`, so the check covers the whole feature again |
| `tests run --changed-since` finds no changed files | It writes a PASS `test-run` row with `failures` 0 and runs nothing, the same as `bkit tests changed` |
| `tests run --changed-since` names a sha that is not a commit | Usage error (exit 2), and no row is written |
| `tests run --changed-since` exits 81 (tests lock held) | Unchanged: the Step 8 and Step 9 blocks end the turn and re-run |
| Step 12 runs with uncommitted code changes (outside the min-push paths) | No receipt is written, so the push runs the full gate |
| Step 12's required push gate fails | No receipt; the `.failed` marker is written, so no later push reuses an older receipt across the failure |
| The Decision Pause re-run jumps to Step 8 sub-step 8 or Step 9 without `GROUP_BASE` held | The block re-derives `GROUP_BASE` from `status route --step=build-group-start --group={GROUP}` before the gate runs |
| A run started before this change resumes (no `build.holistic` in its frozen `workflow-started.limits`) | `counters route --point=build.holistic` falls back to the current `package.json` setting, as for any unfrozen point |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. The issue's rows keep their wording; their `Type` is written as `docs/testing.md` writes the tier. Every test in `.bkit/core/engine/commands/ci/` and `.bkit/core/engine/commands/workflow/tests.test.ts` drives real temporary git repositories and real gate scripts, with no git or filesystem mocks.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `build.holistic` defaults to `ask: true`, max 2 | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Holistic fix rounds count across runs and do not reset after a clean check | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| The decision file's holistic loop line names `build holistic` and its max | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| The last-clean holistic base is the `parentSha` of the newest holistic row with 0 failures, else `origin/dev` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| A holistic row with gaps does not move the base | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| A clean row whose `parentSha` names no commit falls back to `origin/dev` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| The holistic verify prompt takes its test base from Context, not `origin/dev` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 3 |
| Step 10 routes and grants holistic rounds on `build.holistic` across every run, with no `--since-clean` | Unit | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | 3 |
| Step 10 derives the holistic report number with `--all-runs`, at sub-step 1 and at the sub-step 7 resume read-back | Unit | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | 4 |
| `counters route` and `counters grant` refuse `--since-clean` as an unknown flag | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 5 |
| `tests run --changed-since` runs `bkit:gate:changed` on the files changed since that commit and writes a `test-run` row | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` runs the resolved `--gate` whole when `bkit:gate:changed` is undeclared | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` with no changed files writes a PASS row and runs nothing | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` counts failures from the changed gate's JUnit reports | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` refuses a sha that names no commit | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| The build Step 8 group gate runs the changed-files scope from `GROUP_BASE` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| The Step 9 group-gate command handed to remediate runs the changed-files scope from `GROUP_BASE` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| The soak prompt runs `bkit tests changed --fallback=bkit:gate:static-unit`, with the exit-81 line | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| Upgrade lowers `build.verify.maxAttempts` above 2 to 2 and leaves 2 or less alone | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A passing `tests run` of the required push gate on a clean tree records a push-gate receipt | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A passing required push gate with only bookkeeping paths uncommitted records a receipt for HEAD | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A failing `tests run` of the required push gate leaves the `.failed` marker for HEAD | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A new branch whose only commits after a receipted ancestor are bookkeeping qualifies for the minimum push gate | Unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` | 11 |
| A new branch with code after the receipted ancestor still needs the full gate | Unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` | 11 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Change | Kind | Who notices |
| --- | --- | --- |
| New ask point `build.holistic` (`bkit.workflows.build.holistic.maxAttempts` / `.ask`, default `ask: true`, max 2) | new name | Consumers reading the ask points table; holistic pauses now name `build.holistic` as `PAUSE_POINT` instead of `build.verify` |
| Holistic fix rounds count across every run with no reset after a clean check | behaviour | A build that used to get up to 15 holistic checks per run now gets at most 5 per build before the Decision Pause |
| `bkit upgrade` lowers `bkit.workflows.build.verify.maxAttempts` above 2 to 2 | config migration (one-way) | Consumers who set a higher verify limit; one log line names the old value |
| bkit's own `package.json` `build.verify.maxAttempts` 5 → 2 | config | bkit's own builds |
| `counters route` and `counters grant` no longer accept `--since-clean` (exit 2, unknown flag) | removed flag | Any hand-written script calling them with it; no shipped workflow does after Task 3 |
| New flag `bkit tests run --changed-since=<sha>` | new name | Workflow authors |
| New `bkit status route` output `cleanBase` | new output field | Workflow authors |
| The decision file's holistic loop line reads `build holistic: attempt N of M` | output text | Owners reading the Decision Pause file |
| Step 8 group gate and Step 9 remediate gate test only the group's changes; repo-wide checks and folder-reading tests surface at Step 12 instead | behaviour | Builds whose group-level breaks used to appear one group earlier |
| The debug soak agent's post-fix run tests only its changes | behaviour | Debug runs; debug Step 3 still runs the full suite |
| A passing Step 12 records a push-gate receipt, and a new branch whose commits after a receipted ancestor are bookkeeping only runs `bkit:gate:min` at pre-push (reverses the expectation at `.bkit/core/engine/commands/ci/push-gate.test.ts:274`, which has no recorded rationale) | behaviour | Anyone pushing a fresh branch after a full local gate pass |
| Holistic reports and fix logs are numbered across runs, so a restarted build's files continue from the last number | file naming | Owners reading `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{N}.md` |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 1:** The input disagrees on whether holistic report numbering is in scope. The issue body (item 6, Success Criterion 2, the restart Edge Case and Task 10) puts it in scope. The issue comment lists "restarts overwriting earlier runs' holistic reports" as left out on purpose and "a separate bug". The issue's edit history shows the body was last edited at 2026-11-15T03:17:05Z, after the comment (03:07:34Z), so the body is the newer source and wins under the input-dates rule. → The owner confirms at Gate 1.
  - **Options:** A) Keep it in scope (Task 4) — the body is newer, Success Criterion 2 needs it, and it is two flag additions in Step 10 · B) Drop it to its own issue — matches the comment, but Success Criterion 2's last sentence then fails and must be cut from the contract.
  - **Recommended:** A) Keep it in scope — the newer body and the confirmed Success Criteria both require it.
  - **Default if unanswered:** A.
- **Open Question 2:** The issue's test `a new branch with code after the receipted ancestor needs the full gate` passes today, because a new branch with code always runs the full gate. A test that passes before the change cannot be recorded red. The existing test `rejects new code, a mixed push, new branches with code, and non-ancestor old heads` asserts the opposite of the new rule at `.bkit/core/engine/commands/ci/push-gate.test.ts:274` (a new branch whose only commit after the receipt is bookkeeping is rejected). No recorded decision gives a rationale for that rejection. → The owner confirms at Gate 1.
  - **Options:** A) Update the existing test so its new-branch case pushes code after the receipt (recorded as an `updated` existing test in Task 11) — it covers the issue's row without an unprovable red · B) Keep a separate test with the issue's name — it cannot go red, so it needs an owner-written `TEST EXCEPTION`.
  - **Recommended:** A) Update the existing test — the behaviour is asserted with no exception needed.
  - **Default if unanswered:** A.
- **Open Question 3:** Which uncommitted changes may a Step 12 receipt tolerate? Every engine call appends an `engine-call` row to the tracked `status.jsonl`, so the tree is never fully clean during a build; the clean-tree rule `runPushGate` uses would never write a Step 12 receipt, and Success Criterion 4 would fail. → The owner confirms at Gate 1.
  - **Options:** A) Accept uncommitted changes inside the min-push pathspecs (`minPushPathspecs`, the same bookkeeping paths a min push accepts untested) and reject any other change, before and after the run; the receipt records HEAD — the receipt proves the same code a min push would accept anyway · B) Commit the bookkeeping before Step 12 runs, then require a fully clean tree — keeps one rule, but the run's own `engine-call` and `test-run` rows dirty the tree again during the run, so the after-run check still fails · C) Keep the clean-tree rule and drop Success Criterion 4 — no receipt reuse at all.
  - **Recommended:** A) Accept bookkeeping-only dirt — it is the only option that writes a receipt during a real build, and it proves exactly what the min gate trusts. `runPushGate` (the pre-push path) keeps its fully clean rule.
  - **Default if unanswered:** A.
- **Open Question 4:** Success Criterion 5 (repeat holistic rounds take at least half less time on a 923-shaped build) can only be measured on a real build after this change ships; no unit or integration test can show wall-clock savings. → The owner, after the next comparable build.
  - **Options:** A) Measure it in Manual Verification from that build's step rows, with owner waits excluded — advisory, blocks nothing · B) Wait for #952's time split and measure it there — more exact, but ties this plan's acceptance to another issue.
  - **Recommended:** A) Measure it in Manual Verification.
  - **Default if unanswered:** A.
- **Assumption:** `build.holistic` is a new ask point rather than a reuse of `build.verify`, so the holistic and group limits are counted apart. It needs no migration of its own: no consumer file sets it yet, so every consumer gets the default 2. → If a consumer already sets `bkit.workflows.build.holistic`, its value is used as written, which is still the intended behaviour.
- **Assumption:** `counters route` and `counters grant` already accept `--all-runs` with an `--of=<step>:next` count and freeze every `build.*` ask point in `workflow-started.limits` (`ASK_POINTS.filter` in `workflows.ts`), so adding `build.holistic` to `ASK_POINTS` is the only engine change routing needs. → If the frozen limits miss the new point, a restarted run reads the current setting instead; the edge case row covers it.
- **Assumption:** bkit's own `bkit:gate:changed` vitest stages inherit `$BKIT_TEST_REPORT_DIR` (its `run()` passes `process.env`), and `vitest.config.ts` writes a pid-named JUnit file when it is set, so `tests run --changed-since` keeps a failure count. Its `node --test` and `bats` stages write no JUnit. → If wrong, a failing changed-files group gate prints `failures` null and the verify-loop trend reads unknown (decision `912-unknown-count-is-an-unknown-trend`); the test in Task 6 proves the report directory reaches the changed gate.
- **Assumption:** The first push of a build's feature branch is Step 15 sub-step 4 (`branches push --mode=feature --set-upstream`), a new-branch push, and the Step 16 push is an increment on it. The issue names the Step 16 push; the plan makes both pushes take the minimum gate. → If Step 15 stops pushing, the new-branch change is still needed for any first push after Step 12.
- **Assumption:** A consumer whose `bkit.workflows.build.verify.maxAttempts` is above 2 accepts the upgrade lowering it, because the issue sets every limit to 2. → If a consumer depends on more verify rounds, they must set it again after the upgrade; the upgrade's log line names the old value so they can.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Alternative | Why rejected |
| --- | --- |
| Keep `--base=origin/dev` and only fix lock waits (#914, #928, #921) | Lock waits were about 100 of the 372 test minutes; the remaining test time is re-testing unchanged files every round. |
| Reuse `build.verify` for the holistic limit, with `--since-clean` removed | The group and holistic loops would share one count per group key, and a group's verify rounds would eat holistic rounds. The issue's assumption keeps them apart. |
| Step 12 calls `bkit ci push-gate` instead of `bkit tests run` | Loses the `test-run` row, the JUnit failure count, the artifact copy and the lock classification that Steps 12–14 route on. |
| Make `runPushGate` (pre-push) also accept bookkeeping-only dirt | Not needed for any Success Criterion; the pre-push path keeps its stricter rule. Listed in Suggested Scope Expansion. |
| A new verb (`bkit tests changed --row`) for the group gate | `tests run` already writes the `test-run` row, artifact and lock classification the group gate needs; a flag on it keeps one verb. |
| Derive `HOLISTIC_BASE` in prose from `status.jsonl` | Counting in prose is what the counter-prose audit forbids; `status route` already reads `parentSha` and gains `cleanBase`. |
| Skip holistic between challenge rounds (option D) or regen instead of a fix round (option E) | Out of Scope by the issue. |

**Recommendations for a future phase:** measure Success Criterion 5 with #952's time split once it lands, and consider whether the pre-push path should share the bookkeeping-tolerant receipt rule.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Trimming the logs the holistic verifier reads (8% of the time) — deferral `951-trim-holistic-verifier-inputs` | No Success Criterion, Edge Case or test row needs it; the measured cost is in test runs, which this plan scopes | #951 § Out of Scope; a future issue if reading time grows |
| Running regen commands for mechanical gaps instead of a fix round (option E) — deferral `951-holistic-mechanical-gap-regen-option-e` | The allowance and scoped tests meet the goal without it | #951 § Out of Scope; a future design issue |
| Skipping the holistic check between challenge rounds (option D) — deferral `951-skip-holistic-between-challenge-rounds-option-d` | Scoped holistic rounds meet the time goal while keeping the check | #951 § Out of Scope; revisit after measuring |
| The ship-time completeness check — deferral `951-ship-deferred-sweep-840` | It is a ship-phase decision no build criterion depends on | #840 — Ship deferred sweep: keep, slim, or drop after build verify? |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Build: test lock fires late across groups, BLOCKED escape unread | #914 | The tests lock the group gate and holistic runs wait on (Tasks 6-7) | Keep separate |
| Tests lock: a hung run holds it forever | #928 | Lock waits behind `tests run` and `bkit tests changed` | Keep separate |
| Machine wide test lock despite low CPU usage | #921 | Lock waits, about 100 of 923's 372 test minutes | Keep separate |
| Decide pre-push lint/typecheck scope | #818 | `.husky/pre-push` gate choice next to the receipt reuse (Tasks 10-11) | Needs a design decision; keep separate |
| Batch push support | #939 | The push path that reads receipts | Keep separate |
| Stats: split build time into work, tests, lock waits and owner waits | #952 | Measuring Success Criterion 5 | Keep separate; use it for the measurement once it lands |
| Soak FAIL resolved by a later passing run | `docs/deferrals.jsonl` `903-debug-soak-fail-resolved-by-later-passing-run` (needs-decision) | The soak prompt Task 8 edits | Needs a design decision; keep deferred |
| Intermittent push-gate overlap failure | `docs/failures.jsonl` `push-gate-overlap-later-failure-intermittent` | `.bkit/core/engine/commands/ci/push-gate.test.ts`, which Task 11 edits | Keep separate; watch it when Task 11's tests run |
| Pre-push path accepts bookkeeping-only dirt for its receipt | This plan, Open Question 3 | `runPushGate` (Task 10 keeps it strict) | Needs a design decision; keep separate |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable as a request schema; the new `--changed-since` value is validated in the verb handler with `git rev-parse -q --verify {sha}^{commit}` before use, and changed file names reach the gate as argv entries, never through a shell string (`docs/security.md` § Shell Injection).
- [ ] **PII** — not applicable: the new log lines carry a setting value and a commit sha.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

None — no new routes, DB writes, secrets, or user input. The one trust change is that a local receipt now lets a new branch's first push skip the full gate; the receipt lives in the local outbox, is bound to the commit, tree and gate fingerprint, and CI on the PR still runs every tier.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed; `package.json` changes only `bkit.workflows.build.verify.maxAttempts`, so `pnpm-lock.yaml` is unaffected.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` reports `@types/node` 24.19.2 → 26.6.6 and `vite` 6.4.5 → 8.3.6; neither blocks this build. Toolchain: node v24.16.0 (Node >= 24 per `docs/technology.md`), pnpm 10.34.9, git 2.56.0, gh 2.102.0, bkit 6.1.1.
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the plan reads or changes is in this worktree and readable; no user information is missing.
- [ ] **Project Context:** decisions `build-group-gate-unit-tier-only`, `husky-hook-template-gate-shape`, `724-gate-changed-wrapped-in-tests-lock`, `724-tests-changed-lock-wait-exit-81`, `801-used-up-limit-asks-and-grants-allowance`, `671-ask-points-hard-limits-assumed-accepts`, `891-verify-loop-progress-counts-group-gate-tests`, `912-unknown-count-is-an-unknown-trend` and `915-min-push-audit-template-project-section` are read; `docs/knowledge.jsonl` holds no row on push-gate receipts, holistic verify or `bkit:gate:changed`.
- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through the `.agents/docs.md` index, and the plan's strategy matches `docs/testing.md` (lowest sufficient tier, test first). Each source is recorded in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no credential or env var is added.
- [ ] **Schema State:** not applicable — no database is read or written.
- [ ] **Architecture & UI:** the changed files stay in `.bkit/core/engine/commands/workflow/`, `.bkit/core/engine/commands/ci/`, `.bkit/core/engine/shared/` and `.bkit/core/engine/install/modules/`, as `docs/architecture.md` places engine verbs, settings and install modules; there is no UI.
- [ ] **Observability:** the migration's log line and the receipt's log line use the `[bkit]` / `[bkit-<noun>]` stderr prefixes of `docs/observability.md` § Log Format.
- [ ] **Deployments & Setup:** the pre-push gate contract in `docs/deployments.md` (full pre-push gate and Min push paragraphs) is updated in Task 12; no local-setup change.
- [ ] **Notifications:** not applicable — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| index | `.agents/docs.md` | yes | `.agents/docs.md` | covered | None |
| architecture | `docs/architecture.md` | yes | `docs/architecture.md` (engine layout: `commands/workflow/`, `commands/ci/`, `shared/`, `install/modules/`) | covered | None — no new file kind |
| technology | `docs/technology.md` | yes | `docs/technology.md` (Node >= 24, TypeScript, pnpm, vitest) | covered | None |
| security | `docs/security.md` | yes | `docs/security.md` § Shell Injection | covered | None — git and gate calls keep argv arrays; the receipt stays in local git metadata |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Which tier does a behaviour need?, § Test first, counter coverage | covered | None |
| data schema | `docs/data-schema.md` | no — no database is read or written | `docs/data-schema.md` (starter, no tables) | none | Not applicable; the starter state is recorded under Documentation Warnings |
| design | `docs/design.md` | no — no UI | none | none | None |
| observability | `docs/observability.md` | yes | `docs/observability.md` § Log Format | covered | None |
| deployments | `docs/deployments.md` | yes | `docs/deployments.md` full pre-push gate paragraph and Min push paragraph | covered | Update both paragraphs for Step 12 receipt reuse (Task 12) |
| migrations | `docs/migrations.md` | yes | `docs/migrations.md` (columns `Migration`, `Where`, `What it rewrites`, `Releases`, `Test`) | covered | Add the verify-limit row (Task 9) |
| managed workflow guide | `.bkit/core/.bkit/workflows.md` | yes | § Group gate, Step 10 row, ask points table, Allowance bullet, loop table, § Local gate scripts | covered | Update each for the changed-files scope and `build.holistic` (Task 12) |
| managed templates guide | `.bkit/core/.bkit/templates.md` | yes | push-gate receipt contract (lines 308-309) | covered | Add the new-branch case and the `tests run` receipt (Task 12) |
| noise / setup | `docs/noise.md`, `docs/setup.md` | no — no new noise filter or setup step | none | none | None |

Carry each required read and each doc update into the runbook task that needs it (`READ:` and `UPDATE:` lines).

## Documentation Warnings

```jsonl
{"topic": "data-schema", "gap": "starter-only", "recommendedPath": "docs/data-schema.md", "alternativeEvidence": "bkit keeps no database; its stores are JSONL ledgers specified in .bkit/jsonl.md.", "action": "None for this plan; the topic is not applicable because the change reads and writes no database."}
```

## Data Schema Integration

No database. The feature reads and writes workflow status rows (`status.jsonl`, specified in `.bkit/jsonl.md`), push-gate receipts in the outbox and `package.json`.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A holistic allowance per build | `.bkit/core/engine/shared/settings.ts` | `ASK_POINTS` and `CONFIG_DEFAULTS.asks` read; `grep -rl 'build\.challenge'` over `.ts`, `.md`, `.json`, `.mjs`; references to `askPoint`, `frozenAskSetting` | `ASK_POINTS` / `CONFIG_DEFAULTS.asks` — every ask point, frozen per run by `workflows.ts` | EXTEND | Add `"build.holistic": { ask: true, max: 2 }`. |
| Counting holistic fix rounds across runs | `.bkit/core/engine/commands/workflow/counters.ts` | `derivedOf`, `grantCount`, `pointLimit`, `SINCE_CLEAN_FLAG` read; `grep -n -- '--since-clean'` in workflows, prompts and docs | `counters route` / `grant` with `--of=<step>:next --all-runs` | EXTEND | No logic change: Step 10 calls the existing flags with the new point; `--since-clean` is removed from route and grant (Supersession). |
| Holistic loop line in the decision file | `.bkit/core/engine/commands/workflow/decisions.ts` | `LOOPS` read; `loop.point` references | `LOOPS.holistic` | EXTEND | `point: "holistic"`, so the line reads `build holistic: attempt N of M`. |
| Last clean holistic base | `.bkit/core/engine/commands/workflow/status.ts` | `route()` read; `cleanRound`, `lastCleanRound`, `allRunsDoneSteps` in `.bkit/core/engine/ledgers/status.ts` | `status route --step` (prints `parentSha`); `cleanRound` | EXTEND | Add output `cleanBase`: the newest `cleanRound` DONE row's `parentSha` across every run, else `origin/dev`. |
| Changed-files group gate with a `test-run` row | `.bkit/core/engine/commands/workflow/tests.ts` | `tests run` verb read; `changedFiles` and `testsChangedVerb` in `tests-changed.ts`; `resolveGate`; `BKIT_GATE_CHANGED_SCRIPT` | `bkit tests changed` (no row); `bkit tests run` (row, whole gate only) | EXTEND | Add `--changed-since=<sha>` to `tests run`, reusing `changedFiles`. |
| Step 12 push-gate receipt | `.bkit/core/engine/commands/ci/push-gate.ts` | `runPushGate`, `cleanHead`, `receiptPath`, `validReceipt` read; callers in `ci.ts` and `land.ts` | `runPushGate` writes receipts inline | EXTEND | Extract its receipt, `.running` and `.failed` writing into one exported helper that takes the tolerated pathspecs; `runPushGate` passes none and `tests run` passes `minPushPathspecs`. |
| New-branch receipt reuse | `.bkit/core/engine/commands/ci/push-gate.ts` | `hasVerifiedIncrement` read; `minPushUpdates` in `ci.ts:733-753`; `push-gate.test.ts` | `hasVerifiedIncrement` (existing branches only) | EXTEND | For an all-zero old sha, search the ancestors of the new sha for a valid receipt. |
| Upgrade lowering `build.verify.maxAttempts` | `.bkit/core/engine/install/modules/core.ts` | `seedCorePackageJsonScripts` and `pruneMinPushPaths` read; `docs/migrations.md` rows | `pruneMinPushPaths` (same read, rewrite and log pattern) | EXTEND | Add `lowerVerifyMaxAttempts` to the same module, called from `seedCorePackageJsonScripts`. |
| Holistic test base and soak scope in prompts | `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-debug-failure-soak.md` | `grep -n 'origin/dev\|static-unit'` in both; `bkit-debug-failure-remediate.md` lines 87-88 | remediate's `bkit tests changed --fallback=bkit:gate:static-unit` and its exit-81 line | EXTEND | Verify reads `Test base` from Context; soak copies remediate's command and exit-81 line. |
| Workflow wiring | `.bkit/core/workflows/bkit-build.md` | Step 8 sub-steps 3 and 8, Step 9 sub-step 3, Step 10, Decision Pause and resume mapping read | existing `GROUP_BASE` hold, `counters derive`, `steps finish --attempt-of` with `:all` | EXTEND | Edit the existing blocks; no new step. |

## Architecture & Component Changes

Every engine change lands in `.bkit/core/engine/**` and is rebuilt into `dist/` with `pnpm build`; every workflow, prompt or managed-doc change is mirrored to the host copies, `.bkit/instructions.md`, `.bkit/core/.bkit/cli.md` and the render snapshots by `pnpm bkit:generate`.

**Ledger rows:** `951-test-what-changed-full-suite-once`, `build-group-gate-unit-tier-only`, `951-build-holistic-allowance-every-limit-2`, `951-holistic-base-last-clean-check`, `951-holistic-report-numbers-all-runs`, `951-retire-counters-since-clean`, `951-tests-run-changed-since`, `951-tests-run-records-push-receipt`, `951-new-branch-receipted-ancestor`, `951-trim-holistic-verifier-inputs`, `951-holistic-mechanical-gap-regen-option-e`, `951-skip-holistic-between-challenge-rounds-option-d`, `951-ship-deferred-sweep-840`

### Database Migrations

None — no database. The only migration is the `package.json` config migration in § Install.

### Settings and counters

The holistic loop gets its own ask point and the decision file names it.

#### [MODIFY] `.bkit/core/engine/shared/settings.ts`

- **Existence Check:** the file exists; `ASK_POINTS` at lines 88-96 and `CONFIG_DEFAULTS.asks` at lines 207-215.
- Add `"build.holistic"` to `ASK_POINTS` and `"build.holistic": { ask: true, max: 2 }` to `CONFIG_DEFAULTS.asks`; `askSettings`, `invalidAskSettings` and the `workflow-started.limits` freeze pick it up through their existing iteration. Setting key: `bkit.workflows.build.holistic.maxAttempts` / `.ask`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists; `LOOPS.holistic` at line 205.
- `LOOPS.holistic.point` = `"holistic"`; `sinceClean: true` stays, because the progress trend still compares rounds since the last clean round.

#### [MODIFY] `.bkit/core/engine/commands/workflow/counters.ts`

- **Existence Check:** the file exists.
- Remove `SINCE_CLEAN_FLAG` from `VALUE_FLAGS` (route and grant), the `--since-clean` branch of `derivedOf`, the `sinceClean` parameter of `grantCount` and `sinceCleanStep`. `progress --since-clean`, `loopProgress`'s `sinceClean` and `activeDoneStepsSinceClean` stay.

#### [MODIFY] `package.json`

- **Existence Check:** the file exists.
- `bkit.workflows.build.verify.maxAttempts` 5 → 2.

### Status

#### [MODIFY] `.bkit/core/engine/commands/workflow/status.ts`

- **Existence Check:** the file exists; `route()` prints `parentSha` from the step's last DONE row in the active run.
- Add output `cleanBase`: the `parentSha` of the newest DONE row of `--step` that `cleanRound` accepts, across every run of the workflow in the file; `origin/dev` when there is none or when `git rev-parse -q --verify {sha}^{commit}` fails.

### Test runs and push proof

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** the file exists; the `tests run` verb.
- New flag `--changed-since=<sha>`: validates the sha names a commit (usage error otherwise); when `bkit:gate:changed` is declared, runs it with `changedFiles(top, sha)` as arguments under the same `BKIT_TEST_REPORT_DIR`, lock-wait and lock-holder environment, and records `scope` as the changed gate's command; zero changed files → a PASS row with `failures` 0 and nothing run; undeclared → runs the resolved `--gate` whole, as today.
- When the resolved gate equals `requiredPushGate(top)` and `--changed-since` is not set, calls the push-gate receipt helper around the run, passing `minPushPathspecs(readBkitConfig(top))` as the tolerated pathspecs.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests-changed.ts`

- **Existence Check:** the file exists; `changedFiles` is already exported. READ only; no change.

#### [MODIFY] `.bkit/core/engine/commands/ci/push-gate.ts`

- **Existence Check:** the file exists (222 lines).
- Extract the `.running` / `.failed` marker writing, the before/after clean-and-fingerprint check and the receipt write from `runPushGate` into one exported helper. It takes the tolerated pathspecs: uncommitted paths outside them make the run record no receipt. `runPushGate` passes none, so its rule is unchanged.
- `hasVerifiedIncrement`: when `oldSha` is all zeros, search `git rev-list --max-count=128 {newSha}` for a valid receipt, then require `outsideOf(sha, newSha)` to be empty and `noLaterFailure`; a non-zero `oldSha` keeps today's path.

#### [MODIFY] `.bkit/core/engine/commands/ci/ci.ts`

- **Existence Check:** the file exists; `minPushPathspecs` (line 611) and `minPushUpdates` (line 733) already pass new-branch updates to `hasVerifiedIncrement`. READ only; no change expected.

### Install

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** the file exists; `seedCorePackageJsonScripts` (line 547) and `pruneMinPushPaths` (line 1569).
- Add `lowerVerifyMaxAttempts`, called after `migrateBkitLayout`: when `bkit.workflows.build.verify.maxAttempts` is an integer above 2, set it to 2, keep the file's indent (`writePackageJsonLike`), push a `ws.writes` update and log `[bkit] core: lowered bkit.workflows.build.verify.maxAttempts {old} → 2`; `[dry-run]` prefix and no write under `dryRun`; 2 or less, absent or non-integer → no write.

### Workflows and prompts

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists.
- Resume mapping (line 49): drop the `holistic` → `build.verify` special case, so `PAUSE_POINT` = `build.holistic`.
- Limits paragraph (line 85): names `build.holistic`.
- Decision Pause holistic grant (lines 279-283): `counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --all-runs --point=build.holistic`.
- Step 8 sub-step 8 (line 748) and Step 9 sub-step 3 Context `Group gate` (line 837): add `--changed-since={GROUP_BASE}`; when `GROUP_BASE` is not held (the Decision Pause re-run or a resume), re-derive it from `status route --step=build-group-start --group={GROUP}` first.
- Step 10: intro (line 869) names `build.holistic`; sub-step 1 derives the report number with `--all-runs` and holds `cleanBase` from `status route --step=build-plan-verify-holistic` as `HOLISTIC_BASE`; sub-step 2 passes `Test base: {HOLISTIC_BASE}`; sub-steps 3 and 9 use `--attempt-of=build-plan-verify-holistic:next:all` / `:current:all`; sub-step 6 routes with `--of=build-plan-gaps-remediate-holistic:next --all-runs --point=build.holistic`, and `PAUSE_POINT` = `build.holistic` at lines 908, 911, 912 and 943; sub-step 7's resume read-back takes `--all-runs`.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-verify.md`

- **Existence Check:** the file exists.
- Line 85: `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`; line 77 describes the group gate's changed-files scope.

#### [MODIFY] `.bkit/core/prompts/bkit-debug-failure-soak.md`

- **Existence Check:** the file exists.
- Step 6 (line 80) and the Verdict lines (88, 90): `bkit tests changed --fallback=bkit:gate:static-unit`, plus the exit-81 line from `bkit-debug-failure-remediate.md` lines 87-88.

### Docs

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/templates.md`, `docs/deployments.md`, `docs/migrations.md`

- **Existence Check:** each file exists.
- See `Documentation Updates`.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `--since-clean` on `counters route` and `counters grant` (`SINCE_CLEAN_FLAG` in `VALUE_FLAGS`, the `derivedOf` branch, `grantCount`'s `sinceClean` parameter and `sinceCleanStep` in `.bkit/core/engine/commands/workflow/counters.ts`), with its tests in `describe("bkit counters route --since-clean")` in `counters.test.ts` | `--of=build-plan-gaps-remediate-holistic:next --all-runs --point=build.holistic` | DELETE | Step 10 and the Decision Pause were its only callers (Task 5). `counters progress --since-clean` is not replaced and stays. |
| Holistic routing on `build.verify` and the `holistic` → `build.verify` resume special case in `.bkit/core/workflows/bkit-build.md` | `build.holistic` | DELETE | The new point replaces it (Task 3). |
| `--base=origin/dev` in `.bkit/core/prompts/bkit-build-plan-verify.md` | `--base={Test base}` from Context | DELETE | Task 3. |
| Whole `bkit:gate:static-unit` in Step 8 sub-step 8 and Step 9's `Group gate` Context | `tests run --changed-since={GROUP_BASE}` | DELETE | Task 7. |
| `pnpm bkit:gate:static-unit` in `.bkit/core/prompts/bkit-debug-failure-soak.md` | `bkit tests changed --fallback=bkit:gate:static-unit` | DELETE | Task 8. |
| The receipt-writing body of `runPushGate` in `.bkit/core/engine/commands/ci/push-gate.ts` | the extracted receipt helper | DELETE | Moved, not duplicated (Task 10). |
| The new-branch rejection asserted at `.bkit/core/engine/commands/ci/push-gate.test.ts:274` | the new-branch receipted-ancestor rule | DELETE | Updated in Task 11. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | § Group gate: changed-files scope since `GROUP_BASE`, Step 12 as the one full run; Step 10 row (line 974): last-clean base and `build.holistic`; Allowance bullet (line 1001): holistic grants on `build.holistic` with `--all-runs`, no `--since-clean`; ask points table (lines 1014-1019): new `build.holistic` row, `build.verify` row reads verify rounds per group only, every limit 2; loop table (lines 1852ff): holistic point; § Local gate scripts: `bkit:gate:changed` callers gain the Step 8 group gate (through `tests run --changed-since`) and soak, the "orchestrator's gates still run whole gates" sentence names Step 12, debug Step 3, pre-push and CI only, the `static-unit` row's "build Step 8 (group gate)" becomes the undeclared fallback, and the contract states that `tests run --changed-since` passes `$BKIT_TEST_REPORT_DIR` to the changed gate. |
| `.bkit/core/.bkit/templates.md` | Receipt contract (lines 308-309): a new branch also qualifies when every commit after a receipted ancestor is bookkeeping; `bkit tests run` of the required push gate records receipts and tolerates uncommitted min-push paths only. |
| `.bkit/core/.bkit/cli.md` | Regenerated by `pnpm cli:sync`: `--since-clean` leaves route and grant, `--changed-since` joins `tests run`. |
| `docs/deployments.md` | Full pre-push gate paragraph (line 541) and Min push paragraph (line 569): Step 12 receipt reuse and the new-branch case. |
| `docs/migrations.md` | One row for `lowerVerifyMaxAttempts`. |
| `docs/decisions.jsonl` | Written at plan time (see `Ledger rows`). |
| `docs/knowledge.jsonl` | None. |
| `docs/architecture.md` | None — no new file kind or component. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None — no database. |
| `docs/design.md` | None — no UI. |
| `docs/testing.md` | None — no new test pattern or tier. |
| `docs/observability.md` | None — the new log lines use the existing prefixes. |
| Cron / scheduled-jobs doc | None — no scheduled task. |

## Rollback Strategy

Code-only — `git revert` sufficient.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database. |
| **Code** | `git revert {COMMIT}` of the feature's commits | Reverting restores the old routing, gates and receipts; `pnpm bkit:generate` refreshes the mirrors. |
| **Risk window** | A consumer upgraded with the migration keeps `build.verify.maxAttempts` = 2 after a revert | The migration is a one-way config lowering; its log line names the old value, so a consumer restores it by hand. Push-gate receipts written under the new rule are ignored by the reverted `hasVerifiedIncrement` for new branches. |

## Agent Execution Runbook

Build order: engine counting and status first, then the workflow that calls them, then the changed-files gate, then push proof and docs. Group 1 holds the new ask point and the workflow lines that pass `--point=build.holistic` together, because the counter-prose audit "2. ask points: none dead, none unknown" fails while a point has no caller. Integration advice: one PR for every task is fine; one commit per task keeps reverts small.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Holistic allowance, base and report numbers

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** One holistic allowance per build
  - **UPDATE:** `ASK_POINTS` in `.bkit/core/engine/shared/settings.ts`: add `build.holistic`
  - **UPDATE:** `CONFIG_DEFAULTS` in `.bkit/core/engine/shared/settings.ts`: `asks["build.holistic"]` = `{ ask: true, max: 2 }`
  - **UPDATE:** `LOOPS` in `.bkit/core/engine/commands/workflow/decisions.ts`: `holistic.point` = `"holistic"`, `sinceClean` kept
  - **UPDATE:** `package.json`: `bkit.workflows.build.verify.maxAttempts` 5 → 2
  - **READ:** `derivedOf` in `.bkit/core/engine/commands/workflow/counters.ts`: `--of=<step>:next --all-runs` already counts across runs
  - **READ:** `pointLimit` in `.bkit/core/engine/commands/workflow/counters.ts`: frozen max times one plus the grants, so no counting logic changes
  - **READ:** `docs/testing.md`: § Which tier does a behaviour need?
  - **DONE WHEN:** `counters route --of=build-plan-gaps-remediate-holistic:next --all-runs --point=build.holistic` exits 1 on the third holistic fix round of a build, including across a restart; `package.json` holds `maxAttempts: 2`; `pnpm build` refreshes `dist/`; the tests below pass, and every existing settings or counters test that enumerates the ask points is updated for the new point
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/settings.test.ts` `build.holistic defaults to ask true, max 2` fails on the missing ask point
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `holistic fix rounds count across runs without a reset` fails on the route refusing the point with "unknown point build.holistic"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop=holistic names build holistic in the attempt line` fails on the line reading "build verify: attempt"

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Read the last clean holistic commit
  - **UPDATE:** `route` in `.bkit/core/engine/commands/workflow/status.ts`: output `cleanBase`, the `parentSha` of the newest DONE row of `--step` that `cleanRound` accepts, across every run, else `origin/dev`; `origin/dev` also when the sha no longer names a commit
  - **READ:** `cleanRound` in `.bkit/core/engine/ledgers/status.ts`: the clean-round rule
  - **READ:** `allRunsDoneSteps` in `.bkit/core/engine/ledgers/status.ts`: the all-runs reader
  - **DONE WHEN:** `status route --step=build-plan-verify-holistic` prints `cleanBase`, a check with gaps leaves it unchanged, `pnpm build` refreshes `dist/`, and the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `last clean holistic base is the newest zero-failure row` fails on no `cleanBase` output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `a holistic row with gaps does not move the base` fails on no `cleanBase` output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `holistic base falls back to origin/dev with no clean row` fails on no `cleanBase` output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `holistic base falls back to origin/dev when the clean sha names no commit` fails on the vanished sha being printed as the base

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Holistic checks test only what changed
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 10 sub-step 1 holds `cleanBase` from `status route --step=build-plan-verify-holistic` as `HOLISTIC_BASE`; sub-step 2's verify Context passes `Test base: {HOLISTIC_BASE}`; sub-step 6 routes with `--of=build-plan-gaps-remediate-holistic:next --all-runs --point=build.holistic`, without `--since-clean` and without the `HOLISTIC_ROUNDS = PAUSE_MAX` pause branch; `PAUSE_POINT` = `build.holistic` at each holistic pause; the Step 10 intro and the Limits paragraph name `build.holistic`; the Decision Pause holistic grant is `counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --all-runs --point=build.holistic`; the resume mapping drops the `holistic` → `build.verify` special case
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the holistic run is `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`, with the Context field documented
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** a repeat holistic check runs `bkit tests changed --base=<last clean commit>`; `.bkit/core/workflows/bkit-build.md` holds no `--since-clean`; the counter-prose audit section "2. ask points: none dead, none unknown" passes; `pnpm bkit:generate` refreshes the host mirrors, `.bkit/instructions.md` and the render snapshots, and `bkit check` reports no mirror drift; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `holistic verify takes its test base from Context` fails on the prompt's `--base=origin/dev`
    - `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` `holistic rounds route and grant on build.holistic across every run` fails on the route reading "--since-clean" on `build.verify`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Holistic reports keep every run's number
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 10 sub-step 1's `counters derive --step=build-plan-verify-holistic --position=next` and the sub-step 7 resume read-back (`--position=current`) both take `--all-runs`; sub-step 3's `steps finish --attempt-of=build-plan-verify-holistic:next` becomes `:next:all` and sub-step 9's `:current` becomes `:current:all`
  - **READ:** `.bkit/core/engine/commands/workflow/counters.ts`: `derive` already takes `--all-runs`
  - **READ:** `.bkit/core/engine/commands/workflow/steps.ts`: `--attempt-of` already takes `<step>:<next|current|count>:all`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** after a restart, the first holistic check writes `build-plan-verify-holistic-{N+1}.md`, where N is the earlier run's last number, and its fix log `build-plan-gaps-remediate-holistic-{N+1}-log.md`; `pnpm bkit:generate` refreshes the mirrors and `bkit check` reports no drift; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` `holistic report number counts every run` fails on the derive without `--all-runs`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Retire `--since-clean` from route and grant
  - **DELETE:** `SINCE_CLEAN_FLAG` in `.bkit/core/engine/commands/workflow/counters.ts`: the route and grant flag; the `progress` verb's own `since-clean` flag stays
  - **DELETE:** `sinceCleanStep` in `.bkit/core/engine/commands/workflow/counters.ts`: its only callers are the removed flag paths
  - **UPDATE:** `derivedOf` in `.bkit/core/engine/commands/workflow/counters.ts`: drop the `--since-clean` branch
  - **UPDATE:** `grantCount` in `.bkit/core/engine/commands/workflow/counters.ts`: drop the `sinceClean` parameter
  - **READ:** `.bkit/core/engine/commands/workflow/challenge.ts`: its `grantCount` call at line 671 passes no `sinceClean` and stays unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: remove the route `--since-clean` tests of the removed flag; the `progress --since-clean` test stays
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `counters route --since-clean` and `counters grant --since-clean` exit 2; `counters progress --since-clean` still works; `.bkit/core/.bkit/cli.md` lists `--since-clean` only on `progress`; `cli-doc.test.ts` passes; `pnpm build` refreshes `dist/`; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `route refuses --since-clean as an unknown flag` fails on the flag being accepted instead of "unknown flag --since-clean"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `grant refuses --since-clean as an unknown flag` fails on the flag being accepted instead of "unknown flag --since-clean"

<!-- bkit:task 5 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Changed-files test runs and the verify-limit migration

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Changed-files scope for `tests run`
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb's `--changed-since=<sha>` validates the sha, runs `bkit:gate:changed` with `changedFiles(top, sha)` as arguments under the same `BKIT_TEST_REPORT_DIR` and lock environment, writes the same `test-run` row with the changed gate as `scope`; zero files → PASS row, nothing run; undeclared → the resolved `--gate` whole
  - **READ:** `changedFiles` in `.bkit/core/engine/commands/workflow/tests-changed.ts`: the changed-file list
  - **READ:** `resolveGate` in `.bkit/core/engine/commands/workflow/tests.ts`: declared-gate resolution
  - **READ:** `docs/security.md`: § Shell Injection
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **DONE WHEN:** a group gate row records the changed-files scope; `pnpm build` refreshes `dist/`; the tests below pass against real temporary git repositories and real gate scripts
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since runs the changed gate on changed files and writes a test-run row` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since runs the --gate whole when bkit:gate:changed is undeclared` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since with no changed files writes a PASS row and runs nothing` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since counts failures from the changed gate's JUnit reports` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since refuses a sha that names no commit` fails on the usage error naming the flag instead of the sha

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** The group gate tests the group's own changes
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 and Step 9 sub-step 3's `Group gate` Context run `tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE}`; when `GROUP_BASE` is not held (Decision Pause re-run or resume), each re-derives it from `status route --step=build-group-start --group={GROUP}` first
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: line 77 describes the group gate's changed-files scope
  - **DEPENDS ON:** 6
  - **DONE WHEN:** the group gate's row scope names the changed-files gate; the existing local-gate-audit probes for `build-group-gate-` and `build-run-tests` pass, with Step 12 still running the whole deepest gate; `pnpm bkit:generate` refreshes the mirrors and render snapshots and `bkit check` reports no drift; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `group gate runs the changed-files scope from GROUP_BASE` fails on the whole static-unit gate
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the remediate group gate runs the changed-files scope from GROUP_BASE` fails on the Context's whole static-unit gate

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Soak tests only what it changed
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-soak.md`: step 6 and the `Verdict` lines run `bkit tests changed --fallback=bkit:gate:static-unit`, with the exit-81 line remediate has
  - **READ:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: its `bkit tests changed` command and exit-81 line (lines 87-88)
  - **UPDATE:** `GATE_CALLERS` in `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: add the soak prompt's `--fallback=bkit:gate:static-unit` call site
  - **DONE WHEN:** the soak prompt names no whole-gate run; `.bkit/core/workflows/bkit-debug.md` Step 3 still runs the deepest declared gate whole; `pnpm bkit:generate` refreshes the mirrors and `bkit check` reports no drift; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `soak runs the changed-files gate` fails on `pnpm bkit:gate:static-unit`

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Upgrade lowers verify limits above 2
  - **UPDATE:** `seedCorePackageJsonScripts` in `.bkit/core/engine/install/modules/core.ts`: call a new `lowerVerifyMaxAttempts` after `migrateBkitLayout`, built like `pruneMinPushPaths`; it sets `bkit.workflows.build.verify.maxAttempts` above 2 to 2, logs one `[bkit] core:` line naming the old value, keeps the original indent, honours `dryRun` and leaves 2 or less alone
  - **UPDATE:** `docs/migrations.md`: one row for it (`Where` `.bkit/core/engine/install/modules/core.ts`, `Releases` up to 6.1.x, `Test` the test below)
  - **READ:** `docs/observability.md`: § Log Format
  - **DONE WHEN:** `bkit upgrade` on a `package.json` with `maxAttempts: 5` writes 2 and logs the old value, a second run writes nothing, and a file with `maxAttempts: 2` is untouched; `pnpm build` refreshes `dist/`; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrade lowers build.verify.maxAttempts above 2 to 2 and leaves 2 or less alone` fails on the value kept at 5

<!-- bkit:task 9 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Push proof and docs

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Step 12 records a full-gate receipt
  - **UPDATE:** `runPushGate` in `.bkit/core/engine/commands/ci/push-gate.ts`: extract the `.running` / `.failed` markers, the before/after HEAD and fingerprint check and the receipt write into one exported helper that takes tolerated pathspecs; `runPushGate` passes none, so its behaviour is unchanged
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: when the `run` verb's resolved gate equals `requiredPushGate(top)` and `--changed-since` is not set, it runs the gate through the helper with `minPushPathspecs(readBkitConfig(top))` as the tolerated pathspecs
  - **READ:** `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: the bookkeeping pathspecs
  - **READ:** `.bkit/core/engine/commands/land.ts`: its `requiredPushGate` / `runPushGate` calls stay correct
  - **DEPENDS ON:** 6
  - **DONE WHEN:** after Step 12 passes, the receipt for its commit exists under `{outbox}/push-gates/`; the tests below pass and also assert no receipt for an uncommitted code change or a non-required gate; the existing `push-gate.test.ts` receipt tests pass unchanged; `pnpm build` refreshes `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a passing required push gate records a receipt` fails on no receipt
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a passing required push gate with only bookkeeping uncommitted records a receipt` fails on no receipt
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a failing required push gate leaves the failed marker` fails on no `.failed` marker for HEAD

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** A new branch reuses a receipted ancestor
  - **UPDATE:** `hasVerifiedIncrement` in `.bkit/core/engine/commands/ci/push-gate.ts`: an all-zero old sha searches the ancestors of the new sha for a valid receipt and qualifies when every commit after it touches min-push paths only and no later failure exists
  - **READ:** `minPushUpdates` in `.bkit/core/engine/commands/ci/ci.ts`: already passes new-branch updates to `hasVerifiedIncrement`
  - **DEPENDS ON:** 10
  - **DONE WHEN:** the first push of a build branch whose Step 12 passed, and the Step 16 push after it, run `bkit:gate:min`; a new branch with code after the receipt runs the full gate; `pnpm build` refreshes `dist/`; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a new branch with only bookkeeping after a receipted ancestor takes the minimum gate` fails on the full gate
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `rejects new code, a mixed push, new branches with code, and non-ancestor old heads` fails on a new branch with code after the receipt being accepted (updated existing test: its new-branch case pushes code after the receipt instead of bookkeeping)

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Docs state the new rule
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate (changed-files scope, Step 12 as the full check), the Step 10 row, the Allowance bullet, the ask points table (`build.holistic`, every limit 2), the loop table, § Local gate scripts (callers, the "still run whole gates" sentence, the `static-unit` row, the `$BKIT_TEST_REPORT_DIR` contract for `tests run --changed-since`)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: the receipt contract (new-branch case, `tests run` receipts, tolerated bookkeeping paths)
  - **UPDATE:** `docs/deployments.md`: the full pre-push gate paragraph and the Min push paragraph (Step 12 receipt reuse)
  - **READ:** `docs/deployments.md`: the full pre-push gate and Min push paragraphs
  - **DEPENDS ON:** 3, 4, 5, 7, 8, 11
  - **DONE WHEN:** no doc says the group gate runs the whole suite, that holistic rounds reset after a clean round, or that a new branch with a receipted ancestor always runs the full gate; `pnpm bkit:generate` refreshes the mirrors and `.bkit/instructions.md`; `bkit check` reports no drift; `pnpm bkit:lint:prose` passes
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 12 end -->

<!-- bkit:group 3 end -->

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
- [ ] **Verify observability:** the migration and receipt log lines use the `docs/observability.md` § Log Format prefixes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `bkit check` pass.
- [ ] **Test Synchronization:** no E2E suite exists for this surface; the counter-prose and local-gate audits, `cli-doc.test.ts` and the render snapshot tests are updated alongside (snapshots regenerated by `pnpm bkit:generate`, never as a planned test).
- [ ] **Build Configuration:** the test files stay `*.test.ts` / `*.integration.test.ts`, which the root `tsconfig.json` `exclude` (`**/*.test.ts`) keeps out of `dist/`.
- [ ] **Unit (`.bkit/core/engine/shared/settings.test.ts`, `.bkit/core/engine/commands/workflow/counters.test.ts`, `decisions.test.ts`, `status.test.ts`, `tests.test.ts`, `.bkit/core/engine/commands/ci/push-gate.test.ts`, the two workflow audits):** every Derived Test Matrix row; `tests.test.ts` and `push-gate.test.ts` use real temporary git repositories and gate scripts.
- [ ] **Integration (`.bkit/core/engine/install/modules/core.integration.test.ts`):** the migration runs through `seedCorePackageJsonScripts` on a real temporary `package.json`, including a second idempotent run.
- [ ] **Apply local migrations:** not applicable — no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** On the next build with Build Challenge fix groups, read `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`: each repeat holistic check's `bkit tests changed` line names `--base=` the commit of the last clean holistic row, and each `build-group-gate-{N}` row's `scope` names `bkit:gate:changed`.
- [ ] **Step 2:** On that build, compare the repeat holistic rounds' step-row durations, owner waits excluded, with `923-pre-push-block`'s; they take at least half less time (Success Criterion 5, Open Question 4).
- [ ] **Step 3:** After its Step 12 passes, confirm `{outbox}/push-gates/{Step 12 sha}.json` exists and the Step 15 and Step 16 pushes print `bkit:gate:min` from `.husky/pre-push`.
- [ ] **Step 4:** Run `bkit upgrade` in a scratch consumer whose `package.json` sets `bkit.workflows.build.verify.maxAttempts` to 5; it prints one line naming 5 and writes 2.
