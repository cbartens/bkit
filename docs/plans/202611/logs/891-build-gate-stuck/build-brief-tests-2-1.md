# Brief: group 2 — The base check (tests)

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
- Group 2: The base check — this group
  - TASK 4: Classify failing cases against the base run — open
  - TASK 5: The `bkit tests base` verb and its local run at the base commit — open
  - TASK 6: CI evidence at the base sha, the run's mode and its install setting — open
- Group 3: The pause's wording and engine support for the resume re-run — next
  - TASK 7: `decisions compose --base-check` words the loop question from the verdict — open
  - TASK 8: `decisions apply --by=rerun` — open
  - TASK 9: `openDecision.gate` — open
- Group 4: Workflow and prompt — later
  - TASK 10: The Decision Pause runs the base check, and Step 9's no-progress route asks the loop question — open
  - TASK 11: A resume into a red-gate pause re-runs the gate — open
  - TASK 12: Group-mode verify logs no gap for a test the group gate runs — open
- Group 5: Docs, generated files and mirrors — later
  - TASK 13: Update the catalog and test docs, and regenerate `dist/`, the capability register and the host mirrors — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Classify failing cases against the base run
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-base.ts`: pure `caseFile(c, tracked)` (a `file` attribute that is a tracked repo-relative path, then a tracked `classname` path, then exactly one matching tracked basename, else null; an untracked, absolute or `..` path is never returned) and `baseVerdict(cases)` (`all | some | none | unknown`, counts, and a reason for `unknown`; an empty failing set is `unknown` with reason `gate red with no failing test case`)
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-base.test.ts`: unit tests of both helpers
  - **READ:** `JunitCase` in `.bkit/core/engine/commands/workflow/junit.ts`: the case shape from Task 1, imported with `import type`, so `tests-base.ts` adds no runtime import edge
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `caseFile` and `baseVerdict` are exported from `tests-base.ts`, `tests-base.ts` has no import of `tests.ts`, `vitest run .bkit/core/engine/commands/workflow/tests-base.test.ts` passes, and `pnpm build` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > all when every failing case also fails at base` fails on the verdict not being "all"
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > some with the base-red and branch counts` fails on the counts not splitting into 3 base-red and 2 from the branch
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > none when each case passes, is absent, or its file is absent at base` fails on a case absent at base counting as undetermined
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > unknown with a reason when no case is base-red and one is undetermined` fails on the verdict reading `none` with no reason
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > resolves from file, then a classname path, then one matching tracked basename` fails on the bats-style `classname` resolving to null
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > a classname matching two tracked basenames leaves the case undetermined` fails on the first of two matching files being picked
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > an untracked or outside-repo file attribute leaves the case undetermined` fails on `../x.test.ts` or an absolute path being returned as the case's file
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > unknown when a red gate has no failing case` fails on an empty failing set reading `all` instead of the reason "gate red with no failing test case"

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** The `bkit tests base` verb and its local run at the base commit
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-base.ts`: `testsBaseVerb` — flags `--log`, `--file`, `--workflow`, `--out`, validated in the handler (a missing required flag is a usage error); failing cases from `reportFailures({log}.reports)`; base sha `git merge-base HEAD {devBase}` (none → `unknown` "no base commit"); the local run as `withoutHooks(() => withCleanup(baseRun, () => dropLandTree(top, tmp)))` with a synchronous `baseRun` (detached `os.tmpdir()` worktree `bkit-base-*`, `copyListed`, `install(…, { preferOffline: true })`, `runTestFile(tmp, file, {log}.base/{n}.log)` per resolved file present at base), because `withCleanup` runs its body without `await`; output written to `--out`; exit 0 for every verdict
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: register `base: testsBaseVerb`
  - **UPDATE:** `tests/fixtures/gates/pnpm.cjs`: pass the arguments after the script name to the script, as `pnpm` does
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated region, by `pnpm cli:sync`
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`: real temp git repos whose base commit is reachable as `refs/remotes/origin/dev` (set with `git update-ref`, so `devBase` returns `origin/dev` and `git merge-base HEAD origin/dev` finds it), a `worktreeCopy` `.env` in the main checkout, and `useGateRunner`
  - **READ:** `reportFailures` in `.bkit/core/engine/commands/workflow/junit.ts`: the failing cases, the same set the gate's `test-run` row counts
  - **READ:** `runTestFile` in `.bkit/core/engine/commands/workflow/junit.ts`: one file's run and cases
  - **READ:** `devBase` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the `dev` ref, `origin/dev` unless local `dev` is strictly ahead
  - **READ:** `dropLandTree` in `.bkit/core/engine/commands/land.ts`: worktree removal
  - **READ:** `withoutHooks` in `.bkit/core/engine/commands/land.ts`: hooks off for git children
  - **READ:** `withCleanup` in `.bkit/core/engine/commands/ci/ci.ts`: cleanup on every exit, signals included, for a synchronous body
  - **READ:** `mainCheckoutRoot` in `.bkit/core/engine/commands/lib.ts`: the copy source
  - **READ:** `useGateRunner` in `vitest.gate-fixture.ts`: the package-runner fixture
  - **DEPENDS ON:** 1, 2, 4
  - **DONE WHEN:** `bkit tests base` is listed in `.bkit/core/.bkit/cli.md`, `cli-doc.test.ts` passes, `tests-base.ts` has no static import of `tests.ts` or `runs.ts`, `tests-base.test.ts` imports `tests-base.ts` first and passes, `vitest run .bkit/core/engine/commands/workflow/tests-base.integration.test.ts` passes, no `bkit-base-*` worktree is left registered after the suite, `pnpm test` and `pnpm test:integration` pass (every existing suite that uses `useGateRunner` still passes with the argument-forwarding fixture), and `pnpm build` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > reports all from a local run at the merge-base` fails on the verdict not being "all" for 3 cases red on `dev`
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a failing file absent at the base commit is the branch's` fails on the case counting as base-red or undetermined
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > no JUnit report reads unknown` fails on the reason not being "no JUnit report"
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > an undeclared bkit:test:file reads unknown` fails on the verdict not being `unknown` when the base `package.json` lacks the script
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a failed base install reads unknown and removes the worktree` fails on the reason not naming "base install failed" or the worktree still being registered
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > installs at base with --frozen-lockfile --prefer-offline` fails on `fixture-install-args` lacking `--prefer-offline`
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > copies the worktreeCopy entries into the base checkout` fails on a base-run test that passes only when `.env` exists failing there, so the verdict reads `all` instead of "none"
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > no origin/dev ref reads unknown` fails on the reason not being "no base commit" or a worktree being added
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a base file run that writes no report reads unknown` fails on the reason not being "no report from the base run"
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a missing required flag is a usage error` fails on the verb running without `--log` instead of exiting with a usage error

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** CI evidence at the base sha, the run's mode and its install setting
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-base.ts`: in `testsBaseVerb`, before the local run, repo = `resolveOwnerRepo(top)`; with a repo, `shipGate({ root, head: base, repo }, gh, log)` reached through `await import("./runs.js")` inside the handler (passed with no skipped lane → `none`, source `ci`, no worktree; any refusal, red, in-progress or skipped-lane result → the local run); `worktreeInstall` off → `unknown` "no install at the base commit (worktreeInstall off)" before any checkout; `adopt` from `latestRuntimeRow`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`: the fixture repo gets an `origin` remote URL `https://github.com/{o}/{r}.git` (no fetch), so `resolveOwnerRepo` resolves the repo from the remote when the stub's `gh repo view` exits 1; the `tests/fixtures/gh/bin/gh` stub with `BKIT_FAKE_GH_FIXTURE_ROOT` pointing at per-test `runs/{sha}.json` and `jobs/{id}.json`
  - **READ:** `shipGate` in `.bkit/core/engine/commands/workflow/runs.ts`: the CI verdict at a sha; with no `repo` it runs `gh repo view` and refuses when that fails
  - **READ:** `resolveOwnerRepo` in `.bkit/core/engine/commands/workflow/repo.ts`: `gh repo view`, then the `origin` remote URL
  - **READ:** `.bkit/core/engine/commands/workflow/runtime.ts`: `latestRuntimeRow` from Task 2, the run's `runtimeWorktrees`
  - **DEPENDS ON:** 2, 4, 5
  - **DONE WHEN:** `tests-base.ts` has no static import of `runs.ts`, `vitest run .bkit/core/engine/commands/workflow/tests-base.integration.test.ts` and `vitest run .bkit/core/engine/commands/workflow/tests-base.test.ts` pass, no `bkit-base-*` worktree is left registered after the suite, and `pnpm build` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a passing CI run at the exact base sha settles none without a local run` fails on `source` not being "ci" or a worktree being added
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a CI run that cannot settle the base falls back to the local run` fails on `source` reading `ci` for a run that skipped a lane, is red or still running, or for a `gh` API error or an unresolvable repo
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > adopt follows the run's runtimeWorktrees` fails on `adopt` being false for a `runtimeWorktrees` = false row
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > worktreeInstall off reads unknown` fails on the base files running without an install instead of the reason "no install at the base commit"

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Move the JUnit reader and the one-file runner into the leaf module `junit.ts`, keep each case's `classname` and `file`, and split out `reportFailures` — `.bkit/core/engine/commands/workflow/junit.ts`, `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/tests.test.ts`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`
- TASK 2 (group 1, done): Base-run helpers: an offline-first install and the exports the base run reuses — `.bkit/core/engine/shared/package-manager.ts`, `.bkit/core/engine/commands/workflow/worktrees.ts`, `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/core/engine/commands/workflow/runtime.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| verdict `all` when every failing case also fails at base | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| verdict `some` with base-red and branch counts | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| verdict `none` when each case passes, is absent, or its file is absent at base | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| verdict `unknown` with a reason when 0 cases are base-red and one is undetermined | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| verdict `unknown` with reason `gate red with no failing test case` when the failing set is empty | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| a case's file resolves from a tracked `file`, then a tracked `classname` repo path, then one matching tracked basename | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| a `classname` matching two tracked basenames leaves the case undetermined | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| an untracked or outside-repo `file` attribute (`../x.test.ts`, an absolute path) is never used | Unit | `.bkit/core/engine/commands/workflow/tests-base.test.ts` | 4 |
| `bkit tests base` reports `all` from a local run at the merge-base, through a real temp git repo whose `refs/remotes/origin/dev` points at the base commit, and the gate fixture | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a failing file absent at the base commit makes its cases the branch's (`none`) | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| no JUnit report under `{log}.reports` → `unknown` "no JUnit report" | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| `bkit:test:file` undeclared → `unknown` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a failed base install → `unknown` "base install failed" and the detached worktree removed | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| the base install runs `install --frozen-lockfile --prefer-offline` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a `worktreeCopy` entry is copied into the base checkout: a base-run test that passes only when `.env` exists makes the verdict `none`, not `all` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| no `origin/dev` ref → `unknown` "no base commit" and no worktree added | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a base file run that writes no report → `unknown` "no report from the base run" | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a missing required flag is a usage error and runs nothing | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 5 |
| a `success` CI run at the exact base sha with no skipped lane settles `none` (source `ci`) with no worktree added; the repo comes from the fixture's `origin` remote URL through `resolveOwnerRepo` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 6 |
| a CI run at the base sha that skipped a lane, is red or is still running, a `gh` API error, or no resolvable repo falls back to the local run | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 6 |
| the output's `adopt` follows the run's `runtimeWorktrees` | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 6 |
| `worktreeInstall` off → `unknown` "no install at the base commit" and no file run | Integration | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` | 6 |
