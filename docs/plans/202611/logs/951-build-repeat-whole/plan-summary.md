Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 4 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/951-build-repeat-whole/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/951-build-repeat-whole/related-deferrals.md`, `docs/plans/202611/logs/951-build-repeat-whole/related-failures.md`, `docs/plans/202611/logs/951-build-repeat-whole/related-issues.md` |
| plan-review | CONCERNS | 7 | 1 | `docs/plans/202611/logs/951-build-repeat-whole/plan-review-1.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-review-2.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/951-build-repeat-whole/plan-v2-reviewed.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/951-build-repeat-whole/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/951-build-repeat-whole/related-deferrals.md`, `docs/plans/202611/logs/951-build-repeat-whole/related-failures.md`, `docs/plans/202611/logs/951-build-repeat-whole/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/951-build-repeat-whole/plan-review-1.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-review-2.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/951-build-repeat-whole/plan-v2-reviewed.md`, `docs/plans/202611/logs/951-build-repeat-whole/plan-update-check.md` |

## Acceptance Scenario

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
| The last clean holistic row's `parentSha` is no longer an ancestor of HEAD (history rewritten, for example by the resume rebase) | `status route` prints `cleanBase` = `origin/dev`, so the check covers the whole feature again |
| `tests run --changed-since` finds no changed files | It writes a PASS `test-run` row with `failures` 0 and runs nothing, the same as `bkit tests changed` |
| `tests run --changed-since` names a sha that is not a commit | Usage error (exit 2), and no row is written |
| `tests run --changed-since` exits 81 (tests lock held) | Unchanged: the Step 8 and Step 9 blocks end the turn and re-run |
| Step 12 runs with uncommitted code changes (outside the min-push paths) | No receipt is written, so the push runs the full gate |
| Step 12's required push gate fails | No receipt; the `.failed` marker is written, so no later push reuses an older receipt across the failure |
| Step 12's required push gate exits 81 (tests lock held) | No receipt is written; the Step 12 block ends the turn and re-runs, as for any lock wait |
| A consumer's Step 12 gate (its deepest declared build gate) is not its required push gate | No receipt is written, so the push runs the full pre-push gate, as today; the receipt covers only a run of the exact required push gate |
| The Decision Pause re-run jumps to Step 8 sub-step 8 or Step 9 without `GROUP_BASE` held | The block re-derives `GROUP_BASE` from `status route --step=build-group-start --group={GROUP}` before the gate runs |
| A run started before this change resumes (no `build.holistic` in its frozen `workflow-started.limits`) | `counters route --point=build.holistic` falls back to the current `package.json` setting, as for any unfrozen point |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 1:** The input disagrees on whether holistic report numbering is in scope. The issue body (item 6, Success Criterion 2, the restart Edge Case and Task 10) puts it in scope. The issue comment lists "restarts overwriting earlier runs' holistic reports" as left out on purpose and "a separate bug". The supplied input (`plan-input-1.md`) labels the issue description "oldest" and dates the comment 2026-11-15T03:07:34Z, so under the input-dates rule as the input presents it, the comment wins and report numbering is out of scope. The plan's draft read the body as newer, from an edit time (2026-11-15T03:17:05Z) that the supplied input does not hold; that timestamp is unverified. The body itself still carries the report-numbering scope the comment says was removed, which fits a body edit after the comment. → The owner confirms at Gate 1.
  - **Options:** A) Keep it in scope (Task 4) — the body carries it, Success Criterion 2 needs it, and it is two flag additions in Step 10 · B) Drop it to its own issue — matches the comment and the input's own labels, but Success Criterion 2's last sentence then fails and must be cut from the contract; Task 4, its two Derived Test Matrix rows and the report-number half of the restart Edge Case go, and 4 leaves Task 12's `DEPENDS ON`.
  - **Recommended:** A) Keep it in scope — the newer body and the confirmed Success Criteria both require it.
  - **Default if unanswered:** A.
- **Open Question 2:** The issue's test `a new branch with code after the receipted ancestor needs the full gate` passes today, because a new branch with code always runs the full gate. A test that passes before the change cannot be recorded red. The existing test `rejects new code, a mixed push, new branches with code, and non-ancestor old heads` asserts the opposite of the new rule at `.bkit/core/engine/commands/ci/push-gate.test.ts:274` (a new branch whose only commit after the receipt is bookkeeping is rejected). No recorded decision gives a rationale for that rejection. → The owner confirms at Gate 1.
  - **Options:** A) Change the existing test's new-branch case to push code after the receipt, as a Task 11 `UPDATE` and `DONE WHEN` item rather than a `TEST FIRST` test, and keep it as the named regression guard for the issue's row — no unprovable red, and no removed expectation goes through the red verifier (which refuses an `updated` test that drops an assertion, `.bkit/core/engine/commands/workflow/tests.ts:2076-2080`) · B) Keep a separate test with the issue's name — it cannot go red, so it needs an owner-written `TEST EXCEPTION`.
  - **Recommended:** A) Change the existing test as a regression guard — the behaviour is asserted with no exception needed, and the new acceptance rule is proven red by Task 11's new test.
  - **Default if unanswered:** A.
- **Open Question 3:** Which uncommitted changes may a Step 12 receipt tolerate? Every engine call appends an `engine-call` row to the tracked `status.jsonl`, so the tree is never fully clean during a build; the clean-tree rule `runPushGate` uses would never write a Step 12 receipt, and Success Criterion 4 would fail. → The owner confirms at Gate 1.
  - **Options:** A) Accept uncommitted changes inside the min-push pathspecs (`minPushPathspecs`, the same bookkeeping paths a min push accepts untested) and reject any other change, before and after the run; the receipt records HEAD — the receipt proves the same code a min push would accept anyway · B) Commit the bookkeeping before Step 12 runs, then require a fully clean tree — keeps one rule, but the run's own `engine-call` and `test-run` rows dirty the tree again during the run, so the after-run check still fails · C) Keep the clean-tree rule and drop Success Criterion 4 — no receipt reuse at all · D) Accept uncommitted changes inside a narrower list (plans, audits and the ledgers) and reject the rest of the min-push pathspecs (`docs/*.md`, skill directories) — safer against a hand edit in those paths during Step 12, but a second pathspec list to keep in step with the min push, and a receipt still proves only the committed HEAD either way.
  - **Recommended:** A) Accept bookkeeping-only dirt — it is the only option that writes a receipt during a real build, and it proves exactly what the min gate trusts. `runPushGate` (the pre-push path) keeps its fully clean rule.
  - **Default if unanswered:** A.
- **Open Question 4:** Success Criterion 5 (repeat holistic rounds take at least half less time on a 923-shaped build) can only be measured on a real build after this change ships; no unit or integration test can show wall-clock savings. → The owner, after the next comparable build.
  - **Options:** A) Measure it in Manual Verification from that build's step rows, with owner waits excluded — advisory, blocks nothing · B) Wait for #952's time split and measure it there — more exact, but ties this plan's acceptance to another issue.
  - **Recommended:** A) Measure it in Manual Verification.
  - **Default if unanswered:** A.
- **Open Question 5:** "Across every run" counts every `workflow-started` run of `build` in the FID's `status.jsonl`, finished runs included. A second `/bkit-build` of the same FID after an earlier run finished would start with its holistic allowance already used and inherit the earlier run's last-clean base. The debug soak once had the same class of bug, where a finished run's rows forced a mode on a later run. → The owner confirms at Gate 1.
  - **Options:** A) Count across every run of the FID, finished ones included — matches the issue's wording and needs no new reader; a re-build of a finished FID reaches the Decision Pause sooner, where the owner grants more rounds, and the inherited base is still guarded by the ancestor check · B) Count only the runs after the FID's last `workflow-done` row — a re-build starts fresh, but `counters route --all-runs` and `status route` gain a run-window rule, which widens Tasks 1 and 2 · C) Record that a finished build is never re-run under the same FID — no code change, but nothing enforces it.
  - **Recommended:** A) Count across every run — a re-build of a finished FID is rare, its cost is one extra owner grant, and B's run-window rule is new engine scope.
  - **Default if unanswered:** A.
- **Assumption:** `build.holistic` is a new ask point rather than a reuse of `build.verify`, so the holistic and group limits are counted apart. It needs no migration of its own: install and upgrade seed its default block, and no consumer file sets it yet. → If a consumer already sets `bkit.workflows.build.holistic` to a value that meant something else, Step 10 routes on that value as written, and the third-fix-round pause of Success Criterion 2 moves to wherever that value puts it.
- **Assumption:** The decision file's progress trend for the holistic loop keeps counting rounds since the last clean round in the active run only (`sinceClean` at `.bkit/core/engine/commands/workflow/decisions.ts:474`), while its attempt line counts across every run. → If the owner expects both across every run, a restarted build's Decision Pause file shows an attempt line of 2 of 2 next to a trend over the restart's rounds only.
- **Assumption:** `counters route` and `counters grant` already accept `--all-runs` with an `--of=<step>:next` count and freeze every `build.*` ask point in `workflow-started.limits` (`ASK_POINTS.filter` in `workflows.ts`), so adding `build.holistic` to `ASK_POINTS` is the only engine change routing needs. → If the frozen limits miss the new point, a restarted run reads the current setting instead; the edge case row covers it.
- **Assumption:** bkit's own `bkit:gate:changed` vitest stages inherit `$BKIT_TEST_REPORT_DIR` (its `run()` passes `process.env`), and `vitest.config.ts` writes a pid-named JUnit file when it is set, so `tests run --changed-since` keeps a failure count. Its `node --test` and `bats` stages write no JUnit. → If wrong, a failing changed-files group gate prints `failures` null and the verify-loop trend reads unknown (decision `912-unknown-count-is-an-unknown-trend`); the test in Task 6 proves the report directory reaches the changed gate.
- **Assumption:** The first push of a build's feature branch is Step 15 sub-step 4 (`branches push --mode=feature --set-upstream`), a new-branch push, and the Step 16 push is an increment on it. The issue names the Step 16 push; the plan makes both pushes take the minimum gate. → If the first push is not a new-branch push (for example, the branch already exists on the remote), Step 15 is not the receipt's first use, Concrete Example step 6 no longer holds, and the Task 11 new-branch rule serves no build push.
- **Assumption:** A consumer whose `bkit.workflows.build.verify.maxAttempts` is above 2 accepts the upgrade lowering it, because the issue sets every limit to 2. → If a consumer depends on more verify rounds, they must set it again after the upgrade; the upgrade's log line names the old value so they can.

## Documentation Warnings

- **data-schema** (starter-only) — `docs/data-schema.md`
  - Evidence: bkit keeps no database; its stores are JSONL ledgers specified in .bkit/jsonl.md.
  - Action: None for this plan; the topic is not applicable because the change reads and writes no database.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #951
```

Or, to address the reasons first: `/bkit-plan #951`
