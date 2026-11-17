Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-input-3.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v1-draft.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/related-deferrals.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-failures.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-issues.md` |
| plan-review | CONCERNS | 13 | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-review-1.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-review-2.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/891-build-gate-stuck/plan-input-3.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v1-draft.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/891-build-gate-stuck/related-deferrals.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-failures.md`, `docs/plans/202611/logs/891-build-gate-stuck/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-review-1.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-review-2.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md`, `docs/plans/202611/logs/891-build-gate-stuck/plan-update-check.md` |

## Acceptance Scenario

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
- **IF** the base check cannot decide (no JUnit report, a red gate with no failing test case, no `bkit:test:file`, no install or no base run possible) **→ THEN** the trend rule recommends, and the pause says the cause is unknown and why.
- **WHEN** the owner resumes into a pause about a red gate **→ THEN** the build re-runs that gate first: green continues without asking, red asks the pause again with fresh numbers.
- **WHEN** any pause follows a red gate or suite **→ THEN** it holds no `Accept` item for a failing test, and the group-mode verify agent logs no gap for one.

### Concrete Example

**Setup:** The owner runs `/bkit-build` in adopt mode (`RUNTIME_WORKTREES=false`, working on the branch in place) on a consumer repo. The branch started from a `dev` commit whose unit tier has 3 red tests in 2 files: a dead-code registry missing two new files, and a suppression-count ceiling that was not raised. No CI run exists at that commit.

**Steps:**

1. The build builds and verifies task group 1 → verify passes, and the group gate exits 1 with 3 failing tests.
2. A fix round (Step 9) changes no source file → the build reaches the Decision Pause, runs `bkit tests base` on the 2 failing files in a detached checkout of the base commit, and all 3 tests fail there too.
3. The owner reads the pause → it shows `Problems after each round: 3` (the one verify round, with its gate's 3 failing tests counted; the fix round ran no second verify round), `Group gate failures after each round: 3`, `Also red on base {sha}: 3 of 3 (local run)`, options `Try again` / `Stop`, and recommends `Stop`: "these 3 tests fail on `dev` too; no round here can fix them. Fix `dev`, then resume." plus "merge `dev` into the branch before resuming." No `Accept` item appears.
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
| A completed `success` CI run exists at the exact base sha, with no skipped lane. | Verdict `none`, source `ci`; no local run, no detached checkout. The repo for the CI lookup comes from `resolveOwnerRepo` (`gh repo view`, then the `origin` remote URL). |
| A CI run at the base sha is red, still running, or skipped a lane; the CI query fails (a `gh` API error); or no repo resolves. | The CI result is not used; the failing files run locally at the base commit. |
| A failing test's file does not exist at the base commit. | Its cases count as caused by the branch. |
| A failing case passes, or is absent, in its file's run at the base commit. | That case counts as caused by the branch. |
| A failing case's file cannot be resolved (no `file` attribute, a `classname` that is no repo path and matches no single tracked basename). | That case is undetermined; with 0 base-red cases the verdict is `unknown` (reason names the unresolved case count). |
| A failing case's `file` attribute or `classname` names an untracked or outside-repo path (`../x.test.ts`, an absolute path). | The path is not used, so the runner never runs a file outside the repo; the case is undetermined unless a later rule resolves it to a tracked file. |
| The gate's `failures` count is null (the runner crashed before writing a report). | The round's progress count reads `?`, the trend reads `stuck`, and the base check returns `unknown` with reason `no JUnit report`. |
| The gate is red with 0 failing JUnit cases (a static check failed after the unit run, a coverage threshold failed, or the runner hit an unhandled error). | The round's progress count reads `?` and the trend reads `stuck`, as for a null count; the base check returns `unknown` with reason `gate red with no failing test case`, never `all`. |
| The branch has no merge-base with the `dev` ref that `devBase` names. | Verdict `unknown` with reason `no base commit`; no checkout is added. |
| A `worktreeCopy` entry (for example `.env`) exists in the main checkout. | It is copied into the base checkout before the base run, so a test that reads it behaves as it does on `dev`. |
| `worktreeInstall` is off. | Verdict `unknown` with reason `no install at the base commit (worktreeInstall off)`; no file runs against a checkout without dependencies, so an environment failure never reads as `all`. |
| The frozen install at the base commit fails (the store lacks a package and the network is off). | Verdict `unknown` with reason `base install failed (exit N)`; the detached checkout is removed. |
| A file run at the base commit writes no JUnit report. | Verdict `unknown` with reason `no report from the base run`. |
| The run is interrupted (SIGINT / SIGTERM) during the base run. | The detached checkout is removed before the process exits. `withCleanup` does this, and `ci.test.ts` already covers its signal path; the base-run body stays synchronous inside it, so no new signal test is planned. |
| A holistic, challenge, unproven or summary pause. | No base check and no `Gate: FAIL` header; the pause behaves as today. |
| Resume into an open pause without a `Gate: FAIL` header (an older pause file, or a non-gate pause). | It is asked again as today. |
| The re-run gate on resume is still red. | The build goes straight to the Decision Pause with fresh round numbers and a fresh base check; no fix round runs first. |
| The re-run gate on resume is green. | The build continues to the next group (Step 8) or past Step 12 without asking, and `GATE_RERUN` is cleared. |
| The resume re-run writes a second `build-group-gate` row under the same verify attempt. | `steps finish` accepts the repeat, and the completeness check reports no hole for the run. |
| The resume is interrupted after `steps finish --step=build-decision` and before `decisions apply --by=rerun`. | The pause file is still `Status: OPEN` with `Gate: FAIL`, so the next resume re-runs the gate again. |
| Resume in worktree mode. | Step 2's `bkit worktrees setup` rebases the branch onto `dev` first, so the re-run gate sees the fix; adopt mode gets no rebase or merge, only the pause's merge-`dev` sentence. |
| `--base-check` points to a missing file or a file that is not the verb's JSON shape. | `decisions compose` exits with a usage error that names the problem (the missing file, or the missing or invalid field), and the workflow takes the Failure Path. |
| `decisions apply --by=rerun` on a decision file without `Gate: FAIL` or not `Status: OPEN`. | Usage error naming the missing `Gate: FAIL` header or the file's status; nothing written. |
| `bkit tests base` without a required flag (`--log`, `--file` or `--workflow`). | Usage error; nothing runs. |

## Open Questions

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
- **Assumption:** The owner accepts today's headless `Stop` routing for this plan: Decision Pause step 6 routes a headless `Stop` by `From:` (re-run Step 8 or Step 12), so a headless run with verdict `all` re-runs the red gate until its loop limit sends it to the Failure Path, which costs rounds but builds nothing wrong → if wrong (the owner needs a headless `Stop` to end the run at once), this plan's `all` → `Stop` recommendation burns rounds on every base-red gate in headless runs, and the Suggested Scope Expansion row for a headless Stop route must join the plan.
- **Assumption:** A base run with no install cannot be trusted, so `worktreeInstall` off makes the verdict `unknown` → if wrong (a consumer with `worktreeInstall` off shares dependencies into each checkout another way), that consumer's base check always reads `unknown` and its pauses fall back to the trend rule; no verdict is ever a wrong `all`.
- **Assumption:** The repo for the CI lookup resolves through `resolveOwnerRepo` (`gh repo view`, then the `origin` remote URL) → if wrong (neither names the GitHub repo), every base check skips CI and runs locally, which costs the local run's time but never gives a wrong verdict.
- **Assumption:** A base run costs about 8 s in bkit (1 s checkout, 2 s install, 5 s per test file) and runs once per pause, not once per round → if a consumer's install is far slower, each red-gate pause waits for it; the cost is bounded by one install plus the failing files.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #891
```

Or, to address the reasons first: `/bkit-plan #891`
