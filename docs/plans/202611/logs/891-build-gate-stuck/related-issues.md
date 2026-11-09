## #743 — Build group gate re-runs integration tests after every group (closed)

### Narrative

After every task group except the last, the build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) runs `bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit`. The deepest declared gate wins, so in any repo that declares an integration gate, every group re-runs the whole integration suite. Step 12 then runs it once more. Build 701 ran 8 group gates at about 135s of integration tests each (`docs/plans/202610/logs/701-engine-work-build/build-group-gate-9-1.md`), so roughly 18 minutes went on integration before Step 12 even started.

The group gate should run static checks and the unit tier only (`bkit:gate:static-unit`). Integration runs once at Step 12, then again at pre-push and in CI before anything merges. Unit tests import the same code and catch most breaks a later group would hit. The cost is that a break only an integration test catches surfaces at Step 12, against the whole build's changes rather than the group that caused it.

### Success Criteria

- Step 8's group gate and the gate command Step 9 hands `@bkit-build-plan-gaps-remediate` run `bkit:gate:static-unit` only.
- Step 12 still runs the deepest declared build gate, integration included.
- `.bkit/workflows.md` § Group gate and the gate tables say which tier each step runs, and why.
- Debug Step 3 and `.husky/pre-push` are unchanged.

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Rendered bkit-build workflow matches the snapshot | unit | `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Unit-only group gate
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Group gate and its fix-round handoff run `bkit:gate:static-unit` only
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 and Step 9 Context gate command
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate, the local gate script table, the build/debug candidate table
  - **UPDATE:** `.bkit/core/.bkit/pipeline.md`: group gate line
  - **UPDATE:** `BKIT_BUILD_GATES` in `.bkit/core/engine/install/manifest.ts`: doc comment
  - **DONE WHEN:** `pnpm bkit:gate:static-unit-integration` and `bkit check` exit 0 with regenerated mirrors and snapshot
  - **TEST FIRST:**
    - n/a — workflow text and docs only; covered by the render snapshot
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Out of Scope

- Choosing integration suites per group from the files it touched: no reliable file-to-suite map exists.
- Builds already in progress (699, 715): they keep the old gate until they rebase.

### References

- #723 — Build asks the owner needless questions and repeats fix rounds — https://github.com/cbartens/bkit/issues/723
- `.bkit/workflows.md` § Group gate
- `docs/decisions.jsonl` key `build-group-gate-unit-tier-only`

Done on dev in 6c115b758 (not pushed yet).

**What changed**
- The build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) now runs `bkit tests run --gate=bkit:gate:static-unit`: static checks and unit tests only. When the gate fails, Step 9 gives the fix agent the same command.
- Step 12 still runs the deepest gate the repo declares, integration included. Pre-push and CI also still run integration, and debug Step 3 is unchanged.
- The group gate's gate list is now its own constant, `BKIT_GROUP_GATES` in `.bkit/core/engine/install/manifest.ts`. `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` checks each build call site against its own list, and fails if a new `tests run` call site appears without a check.
- `.bkit/workflows.md` § Group gate explains the new split and what it costs. The gate tables and `.bkit/pipeline.md` match it.
- The decision is recorded in `docs/decisions.jsonl` under the key `build-group-gate-unit-tier-only`.

**What we give up:** a break that only an integration test catches now shows up at Step 12, against the whole build's changes. Before, it showed up at the group that caused it. A failing test at Step 12 also asks the owner (`TESTS_LOOP`) before a fix round, unless `bkit.workflows.build.tests.ask` is false.

**Checks run**
- Full gate on the first version: everything passed except two tests, which this commit updates (the local gate audit and the instructions coverage check).
- After the fix: those two test files, the render snapshots and the ledger check passed (354 passed, 2 skipped), plus `typecheck`, `lint` on the changed files and `bkit check`.
- I didn't re-run the full gate after the fix. Pre-push runs it before anything is pushed.

Builds already in progress (699, 715) keep the old gate until they rebase.

## #510 — Test gate and dependency install: stack-neutral gate lookup and safe exit handling (closed)

## Goal

Make test-gate resolution and dependency installation handle non-TypeScript and non-Node consumer stacks safely without assuming all repos use TypeScript or fail on missing scripts.

## Problem

Workflows read as stack-agnostic, but execute pnpm/Node-specific commands:
1. `.bkit/scripts/bkit-runtime.sh:820-829` (`bkit_resolve_gate`, called from `bkit-build.md:702,1161` and `bkit-debug.md:454`) searches for gate scripts exclusively in `package.json` and prepends `pnpm`. A `--ci`-only install or a repo without `bkit:gate:*` scripts exits with status 2, causing `/bkit-build` Step 14 to fail every time. The error message directs consumers to install the TypeScript module (`pnpm bkit install --typescript`), which is invalid for non-TypeScript repos.
2. If gate scripts exist but cannot execute (exit status 126 or 127), bkit records `TEST_VERDICT=FAIL`. The remediation loop then attempts to fix code for tests that never ran, and debug escalates into `SOAK`.
3. `bkit-ship.md:1310` (Step 13, Switch to Dev) executes `pnpm install --frozen-lockfile` as the final command after PR merge. If this install fails, the step exits with an error, applies the `bkit:failed` label, and aborts worktree cleanup and closing bookkeeping (Steps 14–15) even though the pull request has already merged into `dev`.
4. Prompts and workflows call bkit via `pnpm bkit …` (e.g., `bkit-build.md:1658`, `bkit-ship.md:1626`, `.bkit/scripts/bkit-workflow-telemetry.sh:25,55`), which fails or prints "summary unavailable" if pnpm is not in the execution path.

## Proposed changes

- Update `bkit_resolve_gate`: if no `bkit:gate:*` scripts are declared, provide actionable guidance telling the consumer to declare gate scripts in their `package.json`, rather than advising `--typescript`.
- Treat gate execution exit codes 126 and 127 as "gate could not run" (routing to Failure Path or setup warning), never as a test failure (`TEST_VERDICT=FAIL`).
- Change `bkit-ship.md:1310` post-merge dependency install to warn on failure rather than aborting workflow close.
- Support resolving the `bkit` binary directly from `PATH`, falling back to `node_modules/.bin/bkit` or package manager execution.
- Update prompt references to run the abstract gate (e.g. `static-unit`) rather than hardcoding `pnpm bkit:gate:*`.

Note: The gate runner and worktree setup changes are coordinated with the #467 refactoring.

Related: #498, #467
Parent: #498

## Analysis

I checked each of the five proposed changes against the current tree. Two are already done by the #467 refactor, one needs a small behaviour change, one needs a fallback, and one I recommend declining as written. Details:

### 1. Gate lookup guidance — already done

`.bkit/scripts/bkit-runtime.sh` and `bkit_resolve_gate` no longer exist (removed by #467). Test-gate resolution is now `bkit tests run` (`.bkit/core/engine/commands/workflow/tests.ts`). When no candidate is declared it exits 3 with stack-neutral guidance (`tests.ts:27-29`): "declare a bkit:gate:* script in package.json that runs your stack's checks". The `--typescript` advice is gone. Nothing to change.

### 2. Exit 126 / 127 — already done

`COULD_NOT_RUN_EXIT_CODES` (`.bkit/core/engine/shared/package-manager.ts`) maps 126 / 127 to exit 4 with `verdict: null`, and the command logs "no tests executed; this is not a FAIL verdict". Build Step 14 and Debug route anything other than exit 0 / 1 to the Failure Path, so a gate that could not run no longer becomes `TEST_VERDICT=FAIL`. Nothing to change.

### 3. Ship post-merge dependency install — needs a change (the real bug)

Today `bkit-ship.md` Step 13 runs `bkit branches switch … || exit 1`. `branches switch` performs the frozen install in the main checkout and returns exit 16 on failure (`branches.ts:66, 817`), which routes the whole workflow to the Failure Path — after the PR already merged. That labels the issue `bkit:failed` and skips Steps 14–15 (worktree cleanup, close bookkeeping). Gate 13 and `.bkit/workflows.md:958` document this as intended, and `branches.test.ts:1222` ("a failed install stops ship (16)") asserts it.

Plan: install failure becomes a warning. `branches switch` still reports `installed: false` in its JSON, but exits 0; the Failure Path is reserved for real dev-checkout failures (fetch / pull / push). Update the workflow row text, Gate 13 wording, and the test.

### 4. `bkit` binary resolution — fallback missing

Circular `pnpm bkit …` CLI calls are already gone from workflows and scripts: blocks now run `"{BKIT}" <noun> <verb>`, where `{BKIT}` is printed by `bkit repo info` as `<repoRoot>/node_modules/.bin/bkit` (`repo.ts:123`), with the same path as the pre-Step-1 fallback in every workflow preamble. The gap: if that pinned binary is missing (a checkout whose `node_modules` was pruned, or bkit installed globally), every later block calls a path that does not exist.

Plan: keep the repo-pinned binary first — it matches the version the repo installed, and a stale global `bkit` should not silently take over — and fall back to `bkit` on `PATH` when the pinned path is absent. Same fallback in the one prompt that resolves its own binary (`bkit-ship-conflict-resolve.md:47`).

### 5. Prompt gate references (`pnpm bkit:gate:*`) — recommend no change

The premise pre-dates the #509 decision. pnpm is now a declared requirement in every consumer repo (`498-pnpm-required-consumer-tooling`), and the invocation the prompts use is the documented convention everywhere:

- `.agents/rules.md:106` (managed, shipped): "**Local pre-push:** `pnpm bkit:gate:static-unit`, then `bkit check`."
- `.husky/pre-push` runs `bkit:gate:static-unit` the same way.
- `.bkit/core/.bkit/templates.md:118` documents the gate chain as `pnpm` scripts.
- `.bkit/core/.bkit/workflows.md` § Local gate scripts: a cargo / go / uv consumer wraps its checks in the script body (`"bkit:gate:static-unit": "ruff check && pytest"`), and the runner stays pnpm.

Prompts naming the gate (`bkit:gate:static-unit`) is the stack-agnostic part; `pnpm` is the runner the #509 decision centralised — for bkit's own commands in `shared/package-manager.ts`, and for humans and subagents in `rules.md`. Reversing that decision would be a one-file change for commands plus one prose sweep; prompts already match the convention, so changing only them would make them inconsistent with `rules.md` and the husky hooks. I will leave them unchanged and note this in the closing comment.

## Plan

- Change `branches switch`: warn on failed install, exit 0; keep `installed: false`.
- Update `branches.test.ts`, `.bkit/core/.bkit/workflows.md` (Step 13 row), `bkit-ship.md` (Step 13 + Gate 13).
- Add the `PATH` fallback to `repo.ts` (+ test) and `bkit-ship-conflict-resolve.md`.
- Rebuild `dist/`, run the affected tests, run `pnpm wording:sync`, commit (no push).

## Work done

Commit `76e47302` (`fix(510): a failed post-merge install warns; bkit on PATH is a fallback`, local only, not pushed).

### Ship post-merge install now warns instead of aborting

- `branches switch` no longer exits 16: `EXIT_INSTALL_FAILED` is removed, and a failed or unrunnable install logs what happened plus the command to run by hand ("continuing without it (run it yourself in `<root>`)"), releases the dev lock, and exits 0. The JSON still reports `installed: false`, so the caller can see it. The Failure Path remains for real dev-checkout failures (fetch / pull / push).
- `bkit-ship.md` Gate 13 and the `.bkit/workflows.md` Step 13 row now say the install failure warns and is never fatal.
- Tests: the inline "failed install stops ship (16)" case became "a failed install only warns", covering exit 1 (install failed) and the missing-package-manager case (covers 126/127 semantics via `COULD_NOT_RUN_EXIT_CODES`).

### bkit binary resolution

- `bkit repo info` still returns the repo-pinned `<repoRoot>/node_modules/.bin/bkit` first (version consistency with what the repo installed), and now falls back to `bkit` on `PATH` when that path is absent — a pruned `node_modules` or a globally installed bkit no longer breaks every later `{BKIT}` block. When neither exists the pinned path is still returned, so the error names the expected location.
- `bkit-ship-conflict-resolve.md` resolves its own binary the same way (`[ -x "$BKIT" ] || BKIT="$(command -v bkit || echo "$BKIT")"`).

### Items already covered by #467 (no change needed)

- Stack-neutral no-gate guidance: `bkit tests run` exits 3 with "declare a bkit:gate:* script in package.json that runs your stack's checks" — no `--typescript` advice.
- Exit 126/127: mapped to exit 4 with `verdict: null` ("not a FAIL verdict"); build Step 14 and debug route it to the Failure Path.

### Item 5 (prompt gate references) — not changed, as explained in the analysis comment

pnpm is the declared runner in every consumer repo (#509 decision), and prompts match `.agents/rules.md:106`, the husky hooks, and the seeded scripts. Changing only the prompts would desynchronise them from the rules file.

## Verification

- `npx vitest run .bkit/core/engine/commands/workflow/branches.test.ts` → 115 passed.
- `npx vitest run .bkit/core/engine/commands/workflow/repo.test.ts` → 22 passed.
- `npx vitest run .bkit/core/engine/audits/workflows/` → 26 files, 651 tests passed (covers ship-invariants and the workflow audits).
- `npx tsc --noEmit` → clean; `pnpm build` rebuilt `dist/` and the staged `dist/commands/workflow/{branches,repo}.js` match source.

Closing as completed.

## Correction — the install-warn change is reverted

While working the next issue I found the ledger row `467-install-failure-stops-build-debug-ship` (owner decision, 2026-10-10): "A failed dependency install stops build, debug and ship", implemented in `625e4bdf` as `bkit branches switch` exit 16 — it explicitly replaced an earlier "warns, never fails" post-merge install. This issue's proposed change 3 asked for the opposite, so the audit proposal is superseded by the recorded decision.

Reverted in `df4f1374` (`fix(510): keep the owner's failed-install-stops-ship rule`): `EXIT_INSTALL_FAILED` / exit 16, the Step 13 row, Gate 13 text, and the test all go back to "a failed install stops ship". Explicit, not accidental: the decision row wins over the audit-derived suggestion.

Still standing from `76e47302`:

- `bkit repo info` falls back to `bkit` on `PATH` when the repo-pinned binary is absent (proposed change 4), plus the same fallback in `bkit-ship-conflict-resolve.md`.
- The stack-neutral no-gate guidance and 126/127 handling were already shipped by #467 (proposed changes 1 and 2).

Not changed: proposed change 5 (prompt gate references), per the analysis comment above — pnpm is the declared runner and the prompts match `.agents/rules.md:106` and the husky hooks.

Net result for this issue: changes 1 and 2 were already done, change 4 is implemented, change 3 is rejected by the owner decision, change 5 is declined. The issue remains closed.

## #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (closed)

### Failing test or CI run

none yet. Read from `.bkit/core/workflows/bkit-build.md` and seen on a real run (Evidence).

### What happened

`/bkit-build` checks each task group on its own (Step 8, Plan Verify), and then checks the whole feature once (Step 10, Plan Verify Holistic). The two checks are handled very differently when they find a problem:

- **Step 8 has a fix loop.** Fixable gaps go to Step 9 (`@bkit-build-plan-gaps-remediate`), the group is checked again, and gaps that can't be fixed go to the Decision Pause so the owner can decide (`bkit-build.md` Step 8 sub-step 11).
- **Step 10 has none.** Anything except PASS or CONCERNS goes straight to the Failure Path, and the run ends (`bkit-build.md` Step 10 sub-step 5).

Five defects follow from this:

1. **No fix step after the holistic check.** A problem that only shows up across groups, such as two groups that each pass alone but don't fit together, or docs one group made stale, aborts the build. Nothing tries to fix it.
2. **`Fixable` is written but never read.** The holistic report writes `Fixable:` in its header, but Step 10 only holds `fields.Tasks`. A report that says every gap is fixable ends the run the same way as one that says none is.
3. **An owner decision can't be asked.** A holistic gap only the owner can settle (one outside the plan's files, say) goes to the Failure Path, not the Decision Pause. The Decision Pause couldn't list it anyway. Its `VERIFY_GAPS` branch only reads per-group reports (`build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`), not `build-plan-verify-holistic.md`.
4. **Step 10 can't run twice.** `--attempt=1` is hard-coded, the artifact name has no attempt number, and sub-step 1 skips to Step 11 whenever a verdict already exists. So even with a fix step, the check could never run again to confirm the fix.
5. **Later fixes skip the whole-feature check.** For the same reason as 4, the fix groups Build Challenge adds (Step 11 → Step 7 → Step 8/9) go back through Step 10, find a verdict already recorded, and skip it. Nothing checks how those fixes fit with the rest of the feature.

### What should happen

- A holistic FAIL with fixable gaps is fixed and checked again, the way Step 8/9 does for a group, within `build.verify.maxAttempts`.
- A holistic gap that can't be fixed, or one still open when the attempts run out, is asked at the Decision Pause, which lists the gaps from the holistic report. It is not an abort.
- Each holistic attempt writes its own report, so earlier reports stay readable.
- Fix groups added after the holistic check passed are checked as a whole feature again before the run goes on.

### Steps to reproduce

1. Run `/bkit-build` on a plan where every group passes Step 8, but the combined diff leaves something stale across groups. For example, docs one group should have updated after another group's change.
2. Step 10 writes `Verdict: FAIL`, `Fixable: true`.
3. The run calls `workflows fail` and stops at Step 10.

### How often

Every run whose holistic check finds any gap.

### Affected area

- `.bkit/core/workflows/bkit-build.md`: Step 10, the Decision Pause (`VERIFY_GAPS` items, the route back), and the Step 7 "no group left" exit.
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` (holistic mode) and `.bkit/core/prompts/bkit-build-plan-verify.md` (holistic attempts).
- `bkit-auto` gets the same behaviour, because it hands off to `/bkit-build`. No other workflow has a holistic check.

### Where and when

Local `/bkit-build` on 6.1.1, 2026-11-08.

### Evidence

- A run on 2026-11-08 passed all 9 groups, then the holistic report gave `Verdict: FAIL`, `Failures: 4`, `Fixable: true`. Three gaps were fixable doc and comment drift, and one needed an owner decision. The run went to the Failure Path at Step 10 sub-step 5.

### References

- #843 — Friction triage — https://github.com/cbartens/bkit/issues/843
- `.bkit/core/workflows/bkit-build.md` § Step 8 — Plan Verify, § Step 9 — Plan Gaps Remediate, § Step 10 — Plan Verify Holistic, § Decision Pause

Fixed in commit 68178c1f9 on `dev` (not pushed yet).

**What changed**

- Step 10 (holistic verify) no longer goes to the Failure Path on gaps. Fixable gaps go to a holistic fix round (`bkit-build-plan-gaps-remediate` in holistic mode), then the holistic check runs again — the same shape as Steps 8-9. No new plan tasks are created; the fix round works on the plan tasks the holistic report names.
- Gaps the fixer cannot close, a fix round that changes no source file, or a used-up limit go to the Decision Pause, which lists the holistic report's gaps as its questions (`From: holistic`).
- Each holistic round writes its own report (`build-plan-verify-holistic-{N}.md`) and fix log (`build-plan-gaps-remediate-holistic-{N}-log.md`).
- Step 10 always runs again after later groups, so Build Challenge's fix groups get checked too. Holistic rounds count against `build.verify.maxAttempts` only since the last holistic round that found no problems (new `--since-clean` flag on `counters route`, `grant` and `progress`), so a re-check after a fix group starts with a fresh allowance.
- The verify prompt now logs each integration gap and failing test as a gap line ending `Fixable: true|false`, so the fix round has gaps to work from.
- Resume works for a holistic pause, a "Try again" from it, and a stopped fix round.

**Checked:** typecheck clean; all 9,162 engine tests pass; `bkit check` and the capability-register check pass.

**Known limits, not changed here**

- The STANDARD → PIVOT → FINAL strategy ladder for the holistic fix round is not reset after a clean holistic round, so a later re-check starts higher up the ladder.
- The holistic progress line in the decision file shows the round count without "of max".

## #805 — Add a test that pins Check Capability Register to pull_request runs (closed)

### Narrative

The `Check Capability Register` step in the `bkit-tests-static` job now runs on every CI event, pull requests included, and checks the PR's test merge (`175807e91`, `81aecbf14`, from #444). Before that fix, a pull request could ship a stale capability register and only `dev` went red afterwards (`docs/failures.jsonl` key `capability-register-drift-shipped-by-pr-708-reds-dev-capstone`).

Nothing stops the regression from coming back. No test reads the step: `git grep 'Check Capability Register' HEAD -- '*.test.ts'` hits only `runs.test.ts` (failed-step parsing) and a pre-push comment. A later edit that adds an event filter to the step or its job, so it skips `pull_request`, would pass every gate.

This issue adds that test, for both copies of the workflow: the repo's `.github/workflows/bkit-ci.yml` and the shipped template `.bkit/templates/.github/workflows/bkit-ci.yml`.

### Success Criteria

- A unit test fails when the `Check Capability Register` step, or the job that holds it, gains an `if:` that can skip `pull_request` runs.
- The same test fails when the workflow's `on:` drops `pull_request`.
- The test covers both `.github/workflows/bkit-ci.yml` and `.bkit/templates/.github/workflows/bkit-ci.yml`.
- The existing `hashFiles('scripts/graphify/bkit-graphify.sh') != ''` step guard and the repo job's `run_level != 'none'` job guard still pass, because neither filters on the event.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Step `if:` adds `github.event_name != 'pull_request'` | Test fails |
| Job `if:` adds `github.event_name == 'push'` | Test fails |
| `on:` loses `pull_request` | Test fails |
| Step is renamed | Test fails with a "step not found" message, not a pass |
| Only the `hashFiles(...)` guard is present | Test passes |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Capability-register step runs on pull_request in the repo workflow | unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` |
| Capability-register step runs on pull_request in the template workflow | unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` |
| An event filter on the step or job is detected | unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Pin the capability-register step to pull_request runs
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add a test that parses both workflows and asserts the step can run on `pull_request`
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`: new `describe` that finds the job holding the `Check Capability Register` step, then asserts `pull_request` is in `on:` and that neither the job `if:` nor the step `if:` names `github.event_name` / `GITHUB_EVENT_NAME`
  - **READ:** `.github/workflows/bkit-ci.yml`: step at `:546-559`, job `bkit-tests-static`
  - **READ:** `.bkit/templates/.github/workflows/bkit-ci.yml`: step at `:285-298`
  - **DONE WHEN:** the new tests pass on `HEAD`, and fail when an event filter is added to either copy by hand
  - **TEST FIRST:**
    - `template-ci-yml.test.ts` `capability register runs on pull_request in both workflows` fails on a step or job `if:` that filters out `pull_request`
    - `template-ci-yml.test.ts` `flags an event filter on the capability-register step` fails on an in-memory workflow whose step `if:` skips `pull_request` being passed as clean
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumption: a string check for `event_name` in the `if:` expressions is enough, because no current guard names the event.

### Out of Scope

- Running the capability-register check locally (`bash scripts/graphify/bkit-graphify.sh check`).

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-1)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- #444, the fix: `175807e91`, `81aecbf14`
- `docs/failures.jsonl` key `capability-register-drift-shipped-by-pr-708-reds-dev-capstone`
- CI run 41363058876 at `79b96cfcb`: `Check Capability Register` success

Done in 00e258265 (on `dev`).

`.bkit/core/engine/audits/templates/template-ci-yml.test.ts` now checks that the capability-register step still runs on pull requests, in both the repo's own CI workflow and the shipped template. The test fails if any of these happens:
- `pull_request` is removed from `on:`
- the job's `if:` filters on the event
- the step's `if:` filters on the event
- the step is renamed so it can't be found

Each of those cases is covered by a mutation test, and the `docs/testing.md` row is updated.

## #226 — Quality gates: pre-commit ⊆ pre-push ⊆ CI chain (closed)

## Problem

An audit of our three gates (pre-commit / pre-push / CI) — triggered by a `lint:slop` finding that only surfaced in CI — found that several "gates" don't actually enforce anything, and that local gates aren't a subset of CI, so **"a green local push = a green CI run" is aspirational, not true** — for both bkit-self and the scaffold we ship to consumers.

### Dead / leaky gates found

<!-- prettier-ignore -->
| Gate | Current reality |
| --- | --- |
| **`lint:slop`** | `slop-scan scan .` is **report-only** — no failure mode exists (no threshold flag). The enforcing command is a *different* one: `slop-scan delta --base <ref> --fail-on added,worsened`. We run `scan` at pre-commit **and** CI → enforces nothing, anywhere. |
| **`lint:prose` (vale)** | Neither `ci.yml` installs vale, so `pnpm lint:prose` hits `command -v vale` → guard-skips → exit 0 → **dead gate in CI too** (not just locally). |
| **`slop:delta` script** | The shipped pre-push template tells consumers to scope with `pnpm slop:delta` — **no such script is defined**. Dangling reference. |
| **graceful-skip (`ᵍ`)** | vale/actionlint exit 0 when the binary is absent. For actionlint (which CI *does* hard-run) this is the classic green-local / red-CI / wasted-minutes trap. |
| **no full local mirror** | prose/slop run only at commit; typecheck/test only at push. `commit --no-verify` then `push` re-checks neither. |

## Ideal future state

**Legend:** ✅ hard-fail · — not run · **(bkit only)** = not shipped/recommended to consumers · `ᵖ` provisioned tool (auto-download pinned binary; loud-skip *only* if provisioning is impossible — never a silent pass) · scoping conditions inline

<!-- prettier-ignore -->
| Check | pre-commit (fast, staged) | pre-push (full deterministic CI mirror) | CI — consumer (scaffold) | CI — bkit-self |
| --- | --- | --- | --- | --- |
| format staged (lint-staged) | ✅ | — | — | — |
| format:check (tree) | — | ✅ | ✅ | ✅ |
| lint:prose (vale) `ᵖ` | ✅ if md changed | ✅ if md changed | ✅ +Install Vale | ✅ +Install Vale |
| **slop:delta** (gate) | ✅ vs HEAD | ✅ vs base | ✅ vs base `[PR]` | ✅ vs base |
| typecheck | — | ✅ | ✅ | ✅ |
| unit test | — | ✅ | ✅ | ✅ |
| **check:dist** | ✅ if `.bkit/src` staged · **(bkit only)** | ✅ **(bkit only)** | — **(bkit only)** | ✅ |
| bkit check (drift) | — | ✅ | ✅ | ✅ |
| actionlint `ᵖ` | — | ✅ if workflow changed | ✅ | ✅ |
| integration / E2E / @live | — | — | ✅ gated `web_affected`/`run_level` | —² |
| bkit-tests-check (capstone) | — | — | ✅ sole required check | ✅ |

**Footnotes**
- **`ᵖ` provisioned:** vale & actionlint are binaries, not npm deps. The hook downloads the *pinned* binary on first need into a cache (`.bkit/bin/`), then hard-fails like any gate. `ᵍ` graceful-skip survives **only** as a fallback when provisioning genuinely can't happen (offline / unsupported platform), and it skips *loudly* with the install command — never silently, never when CI would enforce it. CI installs both unconditionally → always ✅ there.
- **slop:** the enforcing gate is `slop-scan delta --fail-on added,worsened` (needs a real `slop:delta` script). A non-gating *full scan* advisory baseline may still run in CI; it's omitted here because it gates nothing.
- **(bkit only) — `check:dist`:** consumers ship no TS to compile; `dist/` is bkit's own build artifact. Only fully bkit-only row.
- **² bkit-self is a CLI:** no web/DB/deploy, so no integration/E2E/@live suite. `bkit-tests-check` still runs (degenerate but present) → ✅.

## The invariant

Each column is a **subset of the one to its right** (pre-commit ⊆ pre-push ⊆ CI) for every deterministic check — so a green push *guarantees* a green CI run, for both bkit-self and consumers, instead of merely hoping for it. `ᵖ` provisioning + scope-to-diff keep the friction that originally justified graceful-skip from coming back.

---

Implementation is split into two comments below:
- **(a)** get **bkit-self** to this standard
- **(b)** update the **consumer** pre-commit/pre-push/CI scaffolding + advisories to match

# (a) Get bkit-self to this standard

Grouped by file. **Strict** = bkit-self provisions its own tools and **hard-fails** (maintainers are online) — no silent skips.

## Scripts — `package.json`
- [ ] **Define `slop:delta`.** `slop-scan delta` compares two **working trees** (or two report JSONs), *not* git refs — so a base must be materialised. Two shapes:
  - **Worktree** (matches the CI scaffold): `git worktree add --detach $TMP $(git merge-base HEAD origin/dev)` → `slop-scan delta --base $TMP --head . --fail-on added,worsened` → teardown.
  - **Baseline report** (lighter for hooks): commit a `.bkit/slop-baseline.json`, run `slop-scan delta --base-report .bkit/slop-baseline.json --head . --fail-on added,worsened`; regen on intentional changes.
  - **Decision needed:** base strategy. Recommend worktree in CI, merge-base worktree (or baseline-report) in hooks.
- [ ] Move gate usage off `lint:slop` (`scan`, report-only) onto `slop:delta`. `lint:slop` may stay as the advisory full-scan.

## CI — `.github/workflows/ci.yml`
- [ ] **Add `Install Vale`** (pinned tarball + `vale sync`) before "Run Vale Prose Lint" (~line 299). Today vale is never installed → prose silently skips → **dead gate**. Without this step prose enforces nothing.
- [ ] Swap `Run Slop Scan` (~line 301) to **delta**: fetch base → materialise base worktree → `slop:delta --fail-on added,worsened`. (actionlint install ~line 311, check:dist, bkit check already present — keep.)

## pre-commit — `.husky/pre-commit`
- [ ] Scope `lint:prose` to **staged md** only.
- [ ] Swap slop `scan` → `slop:delta` vs HEAD.
- [ ] Strict: provision vale to `.bkit/bin/` and **hard-fail** if absent (no graceful skip in bkit-self).

## pre-push — `.husky/pre-push`
- [ ] **Add `lint:prose`** (scoped to md changed in the push range) — currently absent.
- [ ] **Add `slop:delta` vs base** — currently absent.
- [ ] Scope actionlint to runs where `.github/workflows/*` changed; strict-provision + hard-fail (today `lint:workflows` graceful-skips).
- [ ] Keep typecheck / test / format:check / bkit check / check:dist.

## Shared helpers
- [ ] **Provisioner:** cache pinned vale + actionlint into `.bkit/bin/` (reused by hooks). bkit-self: download failure = hard error.
- [ ] **Diff-scope filter:** `git diff --name-only <base>...HEAD` so prose runs only on md changes, actionlint only on workflow changes — mirrors `check:dist`'s `.bkit/src`-staged guard.

## Done when
- [ ] pre-commit ⊆ pre-push ⊆ CI holds for bkit-self; prose + slop are real gates; a green push provably can't red-CI.

# (b) Update consumer scaffolding + advisories to match

Same model — but tool provisioning **degrades gracefully** (loud skip, *never* silent): a consumer who hasn't installed a binary isn't blocked, and turning a gate off is an explicit edit to their owned (seed-or-print) hook, not a side-effect of a missing tool.

## Shipped hooks — `.bkit/templates/.husky/`
- [ ] **pre-push:** add `lint:prose` (scoped) + `slop:delta` vs base + scoped actionlint. Today it runs only typecheck/test/format:check/bkit check — so the scaffold's own "same `lint:prose` pre-push runs (local==CI)" claim is **false**. This closes it.
- [ ] **pre-commit:** scope prose to staged md; swap slop `scan` → `slop:delta` vs HEAD.
- [ ] Provisioning = graceful: provision the pinned binary; if impossible, **loud-skip with the install command** (consumer-pain rule — don't hard-block someone who opted out).

## Shipped CI — `.bkit/templates/.github/workflows/ci.yml`
- [ ] **Activate `Install Vale`** (today only in the commented `[U]` reference, ~line 372) — otherwise consumer prose is a dead gate too.
- [ ] **Activate the slop `delta` step** + Materialise Base Worktree (the commented "the real gate `[PR]`"); today only `scan` (~line 167) is active.
- [ ] actionlint install already active — keep.

## Shipped scripts
- [ ] Seed a real `slop:delta` script into consumer `package.json` — resolves the **dangling `pnpm slop:delta`** the shipped pre-push already references. (Confirm where bkit seeds consumer scripts: `bkit-modules` / postinstall.)

## Authoring SoT + tests
- [ ] `.bkit/src/bkit-modules.ts` (+ `bkit-upgrade-preservation.integration.test.ts`) author/assert hook content — update there too; regenerate mirrors via `pnpm bkit install` (batch at session end, not per-edit).
- [ ] Fixtures: `tests/fixtures/heavy-customised-prepush`, `tests/fixtures/heavy-customised-ci` + integration assertions need updating for the new hook/CI bodies.

## Advisories + docs
- [ ] Update hook header comments + ci.yml **FULL CI SCAFFOLD REFERENCE** to describe the new model (prose+slop at pre-push, provisioning, scope-to-diff). Keep advisory text free of tracker refs.
- [ ] `docs/deployments.md` (pre-commit/pre-push gate description, ~line 282), `docs/testing.md` (CI order), and the **README** "same commands in both places → green push = green CI" line — make all three describe reality once shipped.

## Migration caveat (seed-or-print)
- [ ] Hooks + ci.yml are **seed-or-print**: the improved pre-push only seeds for **new** installs; existing consumers keep their old hook. Advisories regenerate every install (reach everyone), hooks don't. Decide whether to surface a one-time upgrade advisory pointing existing consumers at the new pre-push — they're the ones still leaking findings to CI.

## Implemented on `dev` ✅ (4 commits)

<!-- prettier-ignore -->
| Commit | Scope |
| --- | --- |
| `11824ff` | **bkit-self gates real** — `scripts/tooling/slop-delta.sh` + `slop:delta` script; pre-push gains `lint:prose` + `slop:delta`, pre-commit drops the dead `lint:slop` scan; ci.yml gains `Install Vale` + `vale sync`, `Run Slop Delta` (PR), `fetch-depth: 0` |
| `2370ee1` | **consumer scaffolding** — ship the helper via the core templates pass (like `bkit-protect-main.sh`, +x preserved); seed `slop:delta` via `runLintModule` + lint `managedKeys`; template pre-push + prose/slop:delta; template ci.yml + Install Vale + Run Slop Delta; hook reference-strings + `deployments.md` gate table synced |
| `adffa24` | **gate-robustness fix** (see below) |
| `f9153d3` | **advisories synced** — first-install note, `lint-package-json-missing` advisory, and ci.yml setup-help now list `slop:delta` |

### Resolved from this issue
- ✅ slop `scan` → enforcing `slop:delta` (real `slop-scan delta` gate)
- ✅ `Install Vale` added to **both** ci.yml files — prose was a dead gate in CI (vale never installed); now enforces
- ✅ dangling `pnpm slop:delta` reference now resolves (script + helper shipped; `slop-scan` stays a managed consumer devDep so it's safe)
- ✅ template pre-push now runs prose + slop:delta — closes the "scaffold claims local==CI but pre-push runs neither" gap
- ✅ `ᵖ`-style asymmetry honoured: bkit-self CI installs vale (hard); consumer local prose stays graceful (guard-skips when absent)
- ✅ advisories / hook merge-instructions updated to describe the new gate set

### The dogfood catch (commit `adffa24`)
Live-running the gate on its own commit exposed a real defect: **slop-scan 0.3.0's delta is position-keyed**, so editing above a pre-existing finding reports it as `resolved@old + added@new` (net zero) — `--fail-on added,worsened` false-positived on innocent line-shifts (flagged 2 pre-existing empty-catches that the edits merely shifted). Fixed by gating on `summary.netFindingCount` / `netRepoScore` via `node`: a pure shift nets to zero and passes; a genuinely new/worse finding fails. Verified both ways.

### Verification
Full suite **1215 pass**, `bkit check` (drift) **0**, `check:dist` clean, `format:check` clean (my files), `lint:prose` 0/0/0, actionlint clean on bkit-self ci.yml — green at every commit.

### Deliberate deviations from the original table
- **slop runs at pre-push, not pre-commit** — a worktree checkout per *commit* is too heavy; per *push* is fine (pre-commit ⊆ pre-push still holds).
- The shipped slop:delta uses the same worktree helper for hooks **and** CI (consumer CI calls `pnpm slop:delta "$BASE_SHA"`), rather than inlining a separate base-worktree step.

### Still open
- **Two CI steps only a real PR confirms** — the `Install Vale` tarball+sync and the slop:delta worktree-against-base run on the runner (locally unverifiable; actionlint passes).
- **Seed-or-print migration to existing consumers** — hooks + ci.yml don't auto-update existing installs; they get the new gates via the (now-updated) merge-instruction advisories when they next run `bkit install`. Whether to surface a louder one-time upgrade advisory is the remaining decision.

Leaving this issue **open** for the migration item.

## Advisory + docs completeness pass (3 more commits)

Swept every surface that lists the gate set or describes the gates. Now complete:

<!-- prettier-ignore -->
| Surface | Status |
| --- | --- |
| **Install** — first-install note, `lint-package-json-missing` advisory, `runLintModule` script seeding | ✅ all list/seed `slop:delta` |
| **Upgrade** — `HUSKY_PRE_COMMIT`/`PRE_PUSH` + `CI_YML` merge-instructions (seed-or-print won't overwrite, so these are how existing consumers learn) | ✅ describe prose + slop:delta; `CI_YML` gained an **explicit action #7** calling out the new `Install Vale` + `Run Slop Delta` + `fetch-depth: 0` steps (not just the script) |
| **Scaffold comments** — template + bkit-self `.husky/*` headers, template `ci.yml` step comments, `docs/deployments.md` gate table, shipped `templates/docs/deployments.md` revert line, `docs/technology.md` slop-scan row | ✅ updated (technology.md also corrected — it wrongly said slop-scan lints "markdown phrasing"; that's vale) |

Commits: `f9153d3` (lint-script advisory lists), `23880d0` (upgrade CI-step advisory + technology.md), `ec1c836` (shipped deployments template revert line).

## "Anything else we forgot?" — honest ledger

**By convention, at release cut (not forgotten):**
- **CHANGELOG entry + version bump** — CHANGELOG is only ever touched by `chore(release):` commits, so it's written when the next version is cut, bundling this work. Not a per-feature dev edit.

**Deliberately deferred (were in the ideal model; consciously out of this scope):**
- **Local `ᵖ` tool-provisioning** — hooks still graceful-skip vale/actionlint when the binary is absent, rather than auto-downloading the pinned binary. CI installs vale (hard), so the gates enforce there; local strictness is the follow-on.
- **Diff-scoping** — pre-push runs `lint:prose` + `slop:delta` unconditionally (not "only when md/workflow files changed"). Fine for now (both are fast); the scoping optimisation is deferred.
- **actionlint local strictness** — `lint:workflows` still guard-skips locally; unchanged this cycle.

**Genuinely open (needs a decision/real run):**
- **Seed-or-print migration to existing consumers** — hooks + ci.yml don't auto-update existing installs; they adopt the gates via the (now-updated) merge-instruction advisories on next `bkit install`. Whether to surface a louder one-time upgrade advisory is the remaining call.
- **Two CI steps only a real PR confirms** — `Install Vale`+`vale sync` and the slop:delta worktree-against-base run on the runner (locally unverifiable; actionlint passes).
- **No dedicated regression test** for the net-delta gating logic — verified live (new finding → net +1 → fail; line-shift → net 0 → pass) but not codified as a test.

Issue stays **open** for the migration decision.

## Decisions on the three open items

1. **Seed-or-print migration to existing consumers → no new mechanism.** Hooks/ci.yml are Tier-3 by design (never auto-overwrite consumer-owned files). The `slop:delta` script + helper *do* auto-install (add-if-missing + core pass), so an upgrading consumer already has `pnpm slop:delta` working; the (updated) merge-instruction advisories hand them the one line to wire it in. Non-adoption is harmless (an old hook just doesn't run the gate). A version-gated nag would cut against the Tier-3 contract for marginal gain — **not building it.**

2. **CI runtime confirmation → confirm by watching, no code change.** De-risked: the pinned vale `3.9.1` Linux tarball URL returns **HTTP 200**, the install shape is copied from the working `.cursor/Dockerfile`, and the slop:delta worktree is proven locally. Plan: watch the first dev-CI run's `Install Vale` + prose steps; slop:delta-in-CI is confirmed on the next real PR (PR-gated, belt-and-braces behind the locally-proven pre-push gate).

3. **Regression test → added.** New `slop-delta-gate.integration.test.ts` pins slop-scan's `delta --json` contract (`netFindingCount`/`netRepoScore` must exist) and the net-gating decision across 4 cases: contract fields present; new finding → net>0 → FAIL; identical tree → net 0 → PASS; **line-shifted pre-existing finding → net 0 → PASS** (the #226 fix). Guards against the worst failure mode — a slop-scan schema bump silently turning the gate into a no-op. 4/4 green locally (full suite 1220 pass). Commit is pending only because an unrelated in-flight `bkit-preflight.ts` change has left `dist/` stale (the `check:dist` gate); it lands clean once that settles.

## #607 — Test full-mode runs gate on every non-success final-check result (closed)

From the 2026-10 testing audit (#480): finding `testing-4`, HIGH. Report: `docs/audits/202610/testing.md`, audited at `5f5a097c`.

## What's wrong

`/bkit-ship` runs full-mode `runs gate` before it merges (`.bkit/core/workflows/bkit-ship.md:472`). The gate must refuse unless the final CI check (`bkit-tests-check`) ended in `success`. The code does this at `.bkit/core/engine/commands/workflow/runs.ts:879`. But the test fixtures in `tests/fixtures/gh/jobs/*.json` only ever give that check `success` or `failure`. `cancelled` and `in_progress` are tested, but only for `--capstone-only` mode (`runs.test.ts:571-594`). In the audit, changing the gate to refuse only `failure` still passed all 5624 tests. A cancelled or timed-out CI run would then let a merge through.

## Fix

Add an `it.each` in full mode over the GitHub conclusions `cancelled`, `skipped`, `timed_out`, `neutral`, `action_required`, `stale` and `startup_failure`, asserting that each one is refused. This is a test-only change.

## Done when

Changing `!== "success"` to `=== "failure"` at `runs.ts:879` makes the suite fail.

Logged in `docs/failures.jsonl` under key `audit-testing-runs-gate-non-success-conclusions-untested`.

Next step: `shortcut:build`.

## Plan

**Goal:** if anyone changes the ship gate so that it refuses only a `failure`, at least one test must fail.

### Where the gap is

- In full mode (no `--capstone-only`), `runs gate` first checks the whole run's conclusion (`.bkit/core/engine/commands/workflow/runs.ts:847-862`).
- Only after that does it check the final job, `bkit-tests-check` (`runs.ts:879`).
- So the gap opens when **the run reports `success` but the final job does not**. A realistic way to get there: the final job is `skipped` because its `if:` turned false, while the run still shows green.
- None of today's tests builds that combination. The non-success cases in `runs.test.ts:568-597` all live in the `--capstone-only` block.

### Steps

1. **Test first.** In `.bkit/core/engine/commands/workflow/runs.test.ts`, add a full-mode `it.each` that runs once per non-success conclusion GitHub can give a job: `cancelled`, `skipped`, `timed_out`, `neutral`, `action_required`, `stale`, `startup_failure`.
   - **Fixture:** a completed run with conclusion `success` whose `bkit-tests-check` job has that conclusion.
   - **Expect:** exit code `12` (`GATE.FAILED`, `runs.ts:460`), and stderr containing `concluded '<conclusion>' (not success)`.
   - **Helpers:** reuse `fixtureRun` / `capstone` from the `--capstone-only` block (`runs.test.ts:507-543`). If that needs them moved up to the enclosing `describe`, move them; don't copy them.
2. **Prove it can fail.** Temporarily change `runs.ts:879` from `capstone.conclusion !== "success"` to `capstone.conclusion === "failure"`. Run the file and watch the new cases fail. Then put the line back, and check `git diff runs.ts` is empty.
3. **Docs.** Update the `runs` row in `docs/testing.md` § Key test files, only if it lists the gate's covered cases.

### Done when

- The new cases pass, and they fail under the step-2 change.
- `pnpm bkit:gate:static-unit` and `bkit check` are green, apart from failures in files other agents are editing.
- One commit on `dev`, containing only the files this issue touched.

Ledger key to close: `audit-testing-runs-gate-non-success-conclusions-untested`.

Done in 8240a4e8, with the docs row in 61e35593 (on dev, not pushed).

- A new full-mode it.each in runs.test.ts covers a green run whose final job concluded cancelled, skipped, timed_out, neutral, action_required, stale or startup_failure. Each case expects exit 12.
- Changing runs.ts:879 to refuse only failure made all 7 cases fail.
- Re-checked by me: 144/144 pass. Ledger row closed.

## #593 — Test that the local static gate and the shipped CI static job match (closed)

From the October 2026 duplication audit (#473), finding `duplication-3` (HIGH). Report: `docs/audits/202610/duplication.md`, audited at `5f5a097c`.

## The problem

Two checks that are meant to match don't.

**`bkit:gate:static`** (`.bkit/core/engine/install/manifest.ts:226-230`) is the local check run before a push. Its comment says it "Mirrors the bkit-tests-static CI job". It runs:
- typecheck
- `lint`
- format check
- prose lint
- slop delta

**`bkit-tests-static`** in the shipped CI template (`.bkit/templates/.github/workflows/bkit-ci.yml:35`) runs:
- typecheck
- format check
- prose lint
- `lint:slop`
- slop delta
- actionlint
- `bkit check`
- a dependency audit

The CI job has **no `pnpm lint` step**. `rg -n 'pnpm lint\b'` only finds `lint:prose` and `lint:slop`. The comment at `bkit-ci.yml:65` refers to "lint … steps below" that don't exist.

So a consumer with an ESLint config only gets linted by the local check before a push. A push that skips hooks lands on `dev` without lint, and nothing in CI notices. Examples: a cloud agent, or `--no-verify`.

Nothing ties the two lists together except that comment. `templates-content.test.ts:579` checks the gate scripts against the script list in `templates.md`, not against CI.

## Decision needed

- **A.** Add a `pnpm lint` step to the template's static job.
- **B.** Keep lint local-only, and say so in the gate's comment.

## What to change (either way)

- Add a test asserting that each part of `bkit:gate:static` either has a matching CI step or is on a named list of local-only steps.
- Fix the `bkit-ci.yml:65` comment.
- If A: `bkit-ci.yml` is a template consumers own, so check whether consumers need a migration note (`docs/migrations.md`).

## Done when

- [ ] The gate and the CI job agree, or the difference is named in both places.
- [ ] A test fails if either side gains or drops a step without the other.

**Size:** S. **Next step:** `/bkit-design` (choose A or B first).

Parent: #473

## Plan

### Decision: add lint to CI (option A)

- **The template already expects a lint step.** The comment at `.bkit/templates/.github/workflows/bkit-ci.yml:65` tells non-Node users to replace "the typecheck / lint / test steps below". There just isn't one.
- **The local gate already runs `pnpm lint` unconditionally.** Any consumer whose push passes the local check therefore has a `lint` script. Adding the step can't break CI for a repo that already passes locally.
- **Keeping lint local-only (option B) leaves the gap open.** Any push that skips hooks lands unlinted: cloud agents, `--no-verify`, edits in the GitHub web UI.

No earlier decision about this is recorded in `docs/decisions.jsonl`.

### Steps

1. **Template.** In `.bkit/templates/.github/workflows/bkit-ci.yml`, add a `Run Lint` step (`run: pnpm lint`) to `bkit-tests-static`, straight after `Run Typecheck`, with the same `if:` / `env:` shape. Update the lane's header comment (`:33`) and the "Keep this group (typecheck → prettier → vale → slop → bkit check)" comment so they list lint.
2. **bkit's own copy.** Make the same edit in `.github/workflows/bkit-ci.yml`. It's bkit's adopted copy of the template, and the differences allowed between the two are pinned in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts:76`.
3. **The tie test.** Add a test, next to the existing gate-script checks in `.bkit/core/engine/audits/templates/`, that:
   - splits `BKIT_GATE_SCRIPTS["bkit:gate:static"]` (`.bkit/core/engine/install/manifest.ts:230`) into its `pnpm <script>` parts;
   - asserts each one has a `run: pnpm <script>` step inside the template's `bkit-tests-static` job (`slop:delta` may carry an argument);
   - allows exceptions only through a named list in the test, with a reason per entry (empty today).
   Adding a part to the gate without adding it to CI then fails the test, and so does removing one from CI.
4. **Comment in `manifest.ts`.** Point the "Mirrors the bkit-tests-static CI job" comment at `manifest.ts:226` to the new test, so the claim is enforced rather than just stated.
5. **Docs.** Check `docs/deployments.md` and `.bkit/templates.md` for a list of what the static job runs, and add lint where one exists. Add one row to `docs/decisions.jsonl`: the local static gate and the CI static job run the same steps, enforced by the new test.

### Existing consumers

`bkit-ci.yml` is copy-and-own: a consumer's adopted copy isn't rewritten by `bkit upgrade`, so existing consumers won't get the new step automatically. This change doesn't include a migration. If you want one (for example, a `bkit check` advisory when an adopted `bkit-ci.yml` static job has no lint step), it can be a follow-up.

### Done when

- [ ] The template and bkit's own CI both run `pnpm lint` in the static job.
- [ ] The new test fails if `bkit:gate:static` and the CI static job get out of step.
- [ ] Full suite passes (`pnpm vitest run`), `pnpm bkit:gate:static` passes, actionlint is clean, and `bkit check` is clean.
- [ ] Ledger row `audit-duplication-static-gate-vs-ci-static-lane-lint` in `docs/failures.jsonl` is closed.

Work is going to a Sonnet subagent, committing straight to `dev`.

## Done

The CI static job now runs `pnpm lint`, and a test fails if the local static gate and that job get out of step.

- **CI (`aa2b23b6`):**
  - `bkit-tests-static` has a "Run Lint" step (`pnpm lint`) straight after typecheck.
  - It's in both the template `.bkit/templates/.github/workflows/bkit-ci.yml` and bkit's own `.github/workflows/bkit-ci.yml`.
  - The dogfood test's allowed-difference count goes from 2 to 3.
- **Tie test:** in `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`.
  - It splits `bkit:gate:static` into its `pnpm` scripts and fails when the template's static job has no step for one of them.
  - Exceptions go in `GATE_PARTS_ABSENT_FROM_CI`, with a reason each. The list is empty.
  - Checked both ways: the test fails before the CI edit, and fails again when a step is removed.
- **Comment (`64ba94ba`):** the comment in `manifest.ts` now names that test instead of just saying the gate "mirrors" CI.
- **Docs:**
  - The static-lane lists in `docs/testing.md`, `docs/deployments.md`, `.bkit/templates.md` and `.bkit/comparison.md` now include lint.
  - The pre-push checklist gained a Lint row, so the gates after it are renumbered. `500c4dcd` fixes one leftover "Gate 5" reference.
- **Checks:** 70 of 70 tests pass across the two affected test files, and actionlint is clean.
- **Ledger and decision:** `audit-duplication-static-gate-vs-ci-static-lane-lint` is closed. Decision `593-static-gate-and-ci-static-job-run-the-same-steps` is recorded in `500c4dcd`.
- **Existing consumers:** an adopted `bkit-ci.yml` is copy-and-own, so existing consumers keep their copy unchanged. No migration ships with this.

Not pushed yet.

## #830 — Debug: diagnose a named red CI run before rerunning local tests (closed)

### Problem

`/bkit-debug` treats the local test rerun (Step 3 — Run Tests, `.bkit/core/workflows/bkit-debug.md:319`) as the gate that decides whether there is anything to fix. A local PASS routes to Summary (Step 10) and Close (Step 11), which pushes the branch and waits for CI. The steps that read the evidence, Fetch Context (Step 4, `bkit-debug.md:385`, `**Run only if** TEST_VERDICT = FAIL or REPRO = true`), Diagnose (Step 6) and Remediate (Step 7), never run.

When the owner names a red CI run in the prompt, that run's logs are the primary evidence (the diagnose prompt says so: "The CI and runtime logs are the primary signal", `.bkit/core/prompts/bkit-debug-failure-diagnose.md:63`), yet Steps 1–3 never read the run id. The `ci` and `diff` context blocks that would fetch its job logs and the diff against the last green commit sit in Step 4, behind the local FAIL.

For a failure that only happens on CI, this is backwards:

- The local tests cannot show the failure, so they pass.
- The run closes, pushes, and CI goes red again for the same reason.
- Nobody has read the red run the owner pointed at.

Observed on #748 (Brand every consumer-facing script, check and style name bkit-*, https://github.com/cbartens/bkit/issues/748), run 1, prompt `/bkit-debug #748 https://github.com/cbartens/bkit/actions/runs/41405235221 red on tests-integration`:

- Step 3 ran the deepest gate, `bkit:gate:static-unit-integration-e2e-live`, although only `bkit-tests-integration` (and the dependent `bkit-tests-check`) was red. 1731 tests across 50 files passed locally.
- The agent then read the CI log on its own and found the cause: all 19 failures are `fatal: invalid object name 'v6.0.0'`. Four test helpers call `git show v6.0.0:<path>` (`.bkit/core/engine/commands/install/upgrade.integration.test.ts:1087`, `:1162`; `.bkit/core/engine/install/modules/core.integration.test.ts:1786`, `:1957`). The tag exists in the local checkout and not in the CI checkout.
- The workflow offered two exits: close as passed (pushes, CI goes red again) or restart with `[repro]`. Neither reaches Diagnose with the evidence already in hand, so the agent stopped and asked.

The order the owner expects is: read what is already red, form a theory, attempt a fix, check the fix, push and let CI give the verdict.

### Outcome

A `/bkit-debug` run that is given a red CI run (in the prompt, or found on the issue) reads that run first, diagnoses from its logs and the diff against the last green commit, applies a fix, checks the fix with the local lane that was red, and only then pushes. The local test run stops deciding whether there is a problem; CI already settled that.

The local test run keeps two jobs:

- Discovery, when no CI run is named and the issue holds none: running the tests locally is the only way to find the failure. Today's Step 3 behaviour stays for this case.
- Post-fix check, after Remediate: run the lane that was red, or the deepest gate when the lane is unknown. PASS means the fix did not break that lane further, not that the bug is gone. FAIL loops back to Diagnose as today.

### Success criteria

- A prompt naming a red run reaches Fetch Context and Diagnose without a local FAIL, and the diagnosis cites the run's job logs.
- A run with no CI run named behaves as today: local tests first, FAIL routes to Fetch Context.
- After a fix, the local check runs the red lane only when the consumer declares a gate for it, and otherwise the deepest declared gate.
- Gate 3's `Live fail-then-pass observed` is satisfied for a CI-only failure by the red run before and the green CI run after the push, not by a local fail.
- The close step still gates the pushed commit's CI run, so a fix that did not work still lands on the Failure Path with the new red run id.

### Constraints and non-goals

- bkit hardcodes no CI host, workflow filename, branch name or e2e framework (`.agents/context.md` § Contexts). Reading the run's logs stays in the consumer's `ci` context-fetch block; the workflow only has to reach that block earlier and hand it the run id.
- Mapping a red CI job to a local gate needs a consumer-declared mapping. Without one, the post-fix check runs the deepest declared gate, as today.
- No change to `/bkit-build` Step 12 (Run Tests): a build has no red run to read.
- The `[repro]` flag keeps its meaning (write a failing test first). It is not the fix for this issue, since the failure here is already reproduced by the CI run.
- The one-off cause on #748 (tests reading the `v6.0.0` tag) is fixed on that branch, not here.

### Decisions already made

- The local test run never gates a run that was given a red CI run. The red run is the evidence; local tests are a post-fix check.
- When no run is named, local tests remain the discovery step.
- Fail-then-pass for a CI-only failure is observed on CI, after the push, by the existing close.
- Any `.github/workflows/` change a diagnosis proposes still needs the owner's sign-off; this issue does not loosen that.

### Open questions

- How Step 1 learns the run id when the prompt names none: the latest failed run on the branch, the PR's failing checks, or an `actions/runs/<id>` link in the issue body or comments? Which wins when they disagree?
- Does `bkit status route --prompt-file` grow a `ciRun` output, or does a new `fids`-style parse verb own the URL?
- Where the lane-to-gate mapping lives (`package.json` `bkit.*`, or the `ci` context block's `# Customise:` knobs), and whether `bkit tests run` gains a `--gate=<one name>` call path for it or already covers it.
- Whether a cheap local reproduction attempt is still worth running early when the red lane has a local gate, since a failure that does reproduce locally gives a much faster fix loop (minutes per try against a full CI round trip).
- How the Loop Question and `debug.fix.maxAttempts` count when the first attempt starts at Diagnose instead of Run Tests.

### References

- `.bkit/core/workflows/bkit-debug.md` Step 3 (`:319`), Step 4 (`:383`), Step 9 (`:564`), Step 10 (`:589`), Gate 3 (`:374`)
- `.bkit/core/prompts/bkit-debug-failure-diagnose.md:56-63` (external context first; CI logs are the primary signal)
- `.agents/context.md` § Contexts (`ci`, `diff` blocks)
- `.bkit/workflows.md` § `debug-run-tests` artifact row
- `docs/testing.md:554` (debug gates on the declared live tier)
- Red run: https://github.com/cbartens/bkit/actions/runs/41405235221 (commit `9630471bf`, `bkit-tests-integration` and `bkit-tests-check` failed; scope, unit and static passed)
- #748 Brand every consumer-facing script, check and style name bkit-* — https://github.com/cbartens/bkit/issues/748 (the run that hit this)
- Parent: #750 Workflow optimisation — https://github.com/cbartens/bkit/issues/750

# Diagnose a named red CI run before rerunning local tests — Implementation Plan

> **Purpose:** Implement evidence-first debugging while preserving branch safety, explicit reproduction requests, and the final check on CI.
> **Rules:** Follow `.agents/rules.md`, `docs/templates/bkit-plan.md`, and the applicable sections of `.bkit/authoring.md`. This comment is the implementation plan; its task markers are inputs to the build workflow.

**Related issue:** [#830 — Debug: diagnose a named red CI run before rerunning local tests](https://github.com/cbartens/bkit/issues/830).

**Revision:** Addresses the review's six concerns: workflow selection, branch alignment, resume state, unavailable evidence, `[repro]`, and reproducible verification. Reuses the existing `bkit.testing.ciWorkflow` setting. No implementation has been performed or tests claimed as passing by this plan update.

## Context & Goals

A known red continuous integration (CI) run is evidence of a failure even when every local test passes. Debug should collect that evidence and diagnose it before running local gates. A gate is a consumer-declared package script that runs a set of checks. Local gates check a fix; the CI run on the pushed commit proves whether a CI-only failure was resolved.

Keep the existing local discovery path when a successful lookup establishes that there is no relevant red run, or the owner explicitly chooses `[local]`. An unavailable lookup is not a successful lookup with no failures.

## Acceptance Scenario

### Narrative

The owner runs `/bkit-debug #N`, optionally naming an existing branch, a run, or a pull request (PR). Debug resolves the relevant CI evidence, verifies that it belongs to the branch under repair, and diagnoses its logs before local tests. After remediation, debug runs the smallest declared gate covering the failed tiers and checks CI on the pushed commit before reporting success.

### Success Criteria

1. A selected red run reaches Fetch Context and Diagnose with logs for that exact repository, run, attempt and commit, without a discovery gate running first.
2. A newer successful run from an unrelated workflow cannot hide the configured CI workflow's failure. Missing tools, inaccessible logs and mismatched evidence cannot produce a clean outcome.
3. Debug edits only the adopted branch after validating its relationship to the selected run or PR. Resume retains the selected evidence and its progress; an explicit change cannot reuse a previous selection's fix or reproduction.
4. `[local]` explicitly replaces saved CI selection, and `[repro]` still requests a failing regression test before remediation. Post-fix local checks use declared gates and preserve `[live=off]`.
5. Completion requires the existing pushed-head CI gate and verification of the selected workflow when it differs from that gate. A new red result reports the new run and does not close as fixed.

### Process Sketch

- **WHEN** the owner names a branch → validate it and adopt it through the existing worktree path.
- **WHEN** CI evidence is selected → validate its branch and identity, record a CI failure round, and fetch its logs.
- **IF** `[repro]` is present → run Failure Reproduce after fetching evidence and before remediation.
- **WHEN** a fix for the current selection is complete → run local checks, then the existing summary, push and close sequence.
- **IF** evidence cannot be read or aligned → preserve the reference and stop with the missing information; do not substitute a local pass.
- **WHEN** the pushed commit passes the required CI checks → report both the original red run and the verifying green run.

### Concrete Example

Use a scratch checkout with the existing branch belonging to [#748 — Brand every consumer-facing script, check and style name bkit-*](https://github.com/cbartens/bkit/issues/748). Supply that exact existing branch with `branch=<actual-branch>` and explicitly pin [run 41405235221](https://github.com/cbartens/bkit/actions/runs/41405235221).

The first test-round artifact identifies the red run; it contains no invented local test result. Fetch Context contains the selected attempt's `fatal: invalid object name 'v6.0.0'` failures. Diagnosis cites those logs. If the branch already contains the fix, diagnosis reports that fact rather than manufacturing another change. This historical replay proves selection and diagnosis only; Task 9 separately verifies the complete fix-to-CI sequence with controlled fixtures.

## Selection and State Contract

### Reference precedence

Apply these rules in order:

1. `[local]` is an explicit override, including on resume and when run or PR references are also present.
2. A run reference in the prompt wins over a PR reference in the prompt.
3. With no prompt reference, retain an active run's saved selection, including a saved explicit local choice. Do not rediscover a newer run during an ordinary resume.
4. For a fresh selection, use a run reference, then a PR reference, from the issue's current description and human comments produced by `issues text`. Generated workflow comments do not supply references.
5. Otherwise, discover on the adopted branch using the existing `readBkitConfig(root).ciWorkflow`, sourced from `package.json` `bkit.testing.ciWorkflow`.

Two distinct references of the winning kind and source are ambiguous. Stop and request one reference. Ignore lower-priority references when a higher-priority source wins. Validate numeric IDs and repository identity. A named URL into another repository is a reported mismatch, not an ignored token followed by unrelated branch discovery. `[local]` intentionally overrides those references.

### CI lookup

- Use the existing GitHub transport in `runs.ts`. Workflow prose remains provider-neutral and log retrieval remains in the consumer's context block; this change adds no CI provider framework.
- Branch discovery lists the configured workflow's completed runs on the adopted branch, taking the newest one. The query includes the workflow selector. A successful unrelated workflow cannot mask the result.
- A PR lookup resolves its head repository, branch and commit first, then selects the configured workflow's run at that head. Do not copy `runContext`'s unfiltered five-run lookup unchanged.
- An explicit run identifies its workflow from the run metadata and retains it as the verification target, even if it differs from the configured workflow.
- Red conclusions are `failure`, `timed_out` and `startup_failure`. Capture the run attempt. An `/attempts/<n>` URL pins that attempt; otherwise select and freeze the attempt returned by the lookup. Job and log reads use that same attempt.
- For automatic branch discovery, a successfully read green, cancelled, skipped or empty result selects local discovery. An in-progress run does not displace the latest completed run of that workflow.
- An explicitly named run or PR with no completed red run is reported to the owner; it does not silently select local discovery. The owner can choose `[local]`.
- A network, authentication, scope, pagination, parsing or tool failure is unavailable evidence. Return the existing MCP fallback signal when appropriate. If the mapped read fallback cannot obtain the evidence, stop as blocked.
- Paginate failed jobs to completion. A truncated or failed page is partial evidence, not a complete failed-job list.

### Branch alignment

`branches parse` reads `branch=<name>` or a whitespace-delimited token containing `/` that is a valid existing local or `origin/` branch. URLs are excluded. An explicit missing branch stops; two existing candidates stop. Debug still creates no branch and refuses `main`.

After worktree adoption and before any test or source edit, compare the selected evidence's repository and head branch with the adopted branch. An explicit branch and run or PR that disagree stop with both identities. A run or PR reference alone does not silently change the adopted branch: tell the owner the required branch selector when they differ. A pre-existing worktree on another branch also stops rather than overriding the requested branch. Fork-head repositories and deleted or unavailable branches stop with a precise mismatch explanation.

Compare the selected run commit with the adopted branch head. Equal is current. An older commit is usable only after proving it is an ancestor; narrate that it is historical evidence and check whether intervening commits already fix the cause. A divergent commit, or unavailable ancestry because history is missing, blocks remediation until resolved. Do not label every unequal commit as merely older.

### Atomic saved selection

Store one validated `ciSelection` object on `workflow-meta`, rather than independent `ciRun` and `redTiers` fields:

```json
{
  "mode": "ci",
  "provider": "github",
  "repo": "owner/repo",
  "runId": "123",
  "runAttempt": 1,
  "runUrl": "https://github.com/owner/repo/actions/runs/123/attempts/1",
  "workflowId": "456",
  "workflowPath": ".github/workflows/consumer-ci.yml",
  "headBranch": "feat/example",
  "headSha": "<validated commit id>",
  "conclusion": "failure",
  "redTiers": ["integration"],
  "via": "prompt-run"
}
```

The local variant is `{ "mode": "local", "reason": "explicit-local" }` or a recorded successful discovery reason. The sample commit text is explanatory; validation accepts only a real commit ID. No selection in an older status log means the existing local path until discovery runs.

`status meta --ci-selection-file=<path>` validates and writes the entire selection atomically. The engine adds a monotonically increasing `ciGeneration` within the active debug run when the evidence identity or mode changes. The CI identity is provider, repository, workflow, run, attempt and commit. A repeated write of the same identity preserves the generation. Transport errors never overwrite the previous selection.

`status route --prompt-file` reads the active selection and exposes `ciRun`, `redTiers`, `ciGeneration` and the ordered gates as derived outputs. `[local]` immediately suppresses saved CI values in routing; Step 2 persists the local selection. A finished workflow's selection never carries into a new run.

An ordinary resume keeps the identity fixed even if the branch now has newer runs. An explicit different reference replaces it and increments the generation. Stamp CI rounds, reproduction, diagnosis, remediation and soak rows with that generation through the existing `steps finish --field` facility. Only DONE reproduction or fix rows in the active run and generation count for the selected evidence. Prior rows remain as history; global fix-attempt limits still count every actual fix attempt.

### Tests, reproduction and proof

- Before a fix for the current CI generation, `tests run` writes a `FAIL` evidence round with `source: ci`, `scope: ci:<id>`, `exitCode: null`, `failures: null`, the run attempt and the generation. It executes no local gate and does not invent a numeric failure count.
- After a DONE remediation or soak row for that generation, it executes a local gate and emits `source: local`.
- Failed job names matching the existing `bkit-tests-<tier>` convention supply tiers. `bkit-tests-check` is not a tier. Unknown failed jobs force the default deepest gate order because their required coverage is unknown; do not narrow from a partially mapped failure set.
- Otherwise, candidate gates from `BKIT_DEBUG_GATES` that cover every red tier come first, shallowest first, followed by the defaults without duplicates. Preserve `[live=off]`. Consumers with no declared covering gate fall back to the deepest declared default.
- `[repro]` still means write and observe a failing regression test before remediation. With CI evidence, Fetch Context routes to Failure Reproduce once per generation, even though the CI round is FAIL. `Reproduced: YES` routes directly to Diagnose or Soak using the observed reproduction and CI logs. `Reproduced: NO` with known red CI stops with a reproduction blocker; it never routes to Summary as passed. The owner may explicitly withdraw `[repro]` to continue from CI evidence alone.
- Gate 3 checks that evidence was recorded or local tests ran, as appropriate. It does not require a future green CI result before diagnosis can start. The final fail-then-pass assertion belongs at Close.
- A local pass after the fix is provisional. Close preserves the existing configured CI gate and additionally requires success of the selected workflow on the pushed commit when that workflow differs. Missing, skipped, cancelled or red verification does not prove the fix. Link the old red run and new green or red run separately.

## Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected behavior |
| --- | --- |
| Newer green release or Renovate run, configured CI red | Select the configured CI failure. |
| Prompt names one run and the issue names another | The prompt wins. |
| No prompt reference, active selection, newer red run | Resume the saved run and attempt. |
| `[local]` with saved CI state or an explicit run | Local selection wins and is persisted; no saved tiers leak back. |
| Explicit new run after a previous fix | New generation; earlier fix and reproduction rows do not authorize local-only routing or remediation. |
| Same run ID has a new attempt | Resume remains on its saved attempt; explicitly selecting the new attempt creates a new generation. |
| Named run or PR belongs to another branch | Stop before tests or edits and identify both branches. |
| Explicit branch conflicts with an existing worktree | Stop without switching or replacing that worktree. |
| Red run is an ancestor of the current head | Fetch that exact run; disclose the age and inspect intervening changes. |
| Red run is divergent, from a fork, or ancestry is unknown | Stop before remediation with the mismatch or missing history. |
| Lookup unavailable with a known run | Preserve reference, attempt the mapped read fallback, otherwise block. |
| Lookup unavailable with no reference | Report CI discovery unavailable; do not claim no red run. `[local]` remains the explicit escape. |
| Branch lookup succeeds with no relevant red run | Existing local-first path and default gate order. |
| Explicit reference is green, incomplete or nonexistent | Report the reference state; do not silently repair something else. |
| Old consumer CI block ignores the pin | Customise its temporary execution copy to fetch and identify the selected evidence; validate the output identity. If that cannot be done, block before diagnosis. |
| Logs are empty, expired, partial or for another attempt | Evidence is unavailable or partial; do not claim successful collection or diagnose a different run. |
| `[repro]` plus red CI | Fetch the logs, then request and observe a failing regression test before remediation. |
| `[repro]` cannot reproduce a known red run | Preserve the red evidence and stop; no successful Summary. |
| Unknown failed job alongside a mapped tier | Default deepest gate order. |
| Final CI remains red | Failure Path names the new red run and preserves the original evidence link. |

## Pre-Flight / Dependencies

- Read the current workflow, status-row contracts, `.agents/context.md`, `docs/testing.md`, and the active knowledge and decision rows relevant to these surfaces before implementation.
- Read `.bkit/authoring.md` sections for each workflow, prompt or documentation edit. Run `pnpm instructions:show --file <basename>` before changing shared instructions.
- Locate all readers of test-run `exitCode`, `source`, `scope` and workflow metadata. Update typed row schemas and validators together. Do not assume nullable exit codes or arbitrary fields are accepted everywhere.
- Verify `steps finish` and status audit behavior for CI rounds without a local clamp record. The round still requires its artifact and normal step row.
- Use source files under `.bkit/core/`; regenerate mirrors once at the end. Do not edit managed portions of `.agents/context.md` or `.bkit/workflows.md` directly.
- No new dependency, database migration, automatic consumer-block migration, or `.github/workflows/` change is required. A later diagnosis proposing a CI workflow change still requires the owner's sign-off.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Existing owner | Decision |
| --- | --- | --- |
| Consumer CI selector | `readBkitConfig` in `.bkit/core/engine/shared/settings.ts`; `ciDeclared`, workflow-filtered wait/gate queries in `commands/workflow/runs.ts` | EXTEND the callers; reuse `bkit.testing.ciWorkflow`, with no new config key. |
| Branch adoption | `.bkit/core/engine/commands/workflow/worktrees.ts` | EXTEND its existing debug adoption and ship `--branch` machinery. |
| CI and PR reads | `.bkit/core/engine/commands/workflow/runs.ts` | EXTEND with `locate`; reuse transport and identity checks, not the unfiltered `runContext` selection. |
| Resume and routing | `debugStart` and metadata folding in `.bkit/core/engine/commands/workflow/status.ts` | EXTEND with one atomic selection and generation. |
| Test-round recording | `.bkit/core/engine/commands/workflow/tests.ts` | EXTEND with a recorded CI evidence round and generation-scoped fix lookup. |
| Context execution | `.bkit/core/engine/commands/workflow/context.ts` and `.bkit/templates/context/bkit-github.md` | EXTEND with a pinned identity and validation of fetched evidence. |
| Reproduction | Existing Failure Reproduce step and `.bkit/core/prompts/bkit-debug-failure-reproduce.md` | REUSE its failing-test contract; extend routing to reach it for a CI round. |
| Final verification | `runs dispatch`, `runs wait`, `runs gate` | REUSE exact pushed-head checking; extend only where selecting another workflow requires carrying its selector. |

The searches for this revision inspected `debugStart`, `runContext`, `BKIT_DEBUG_GATES`, the existing `ciWorkflow` setting and query sites, the Debug workflow, the reproduction prompt, and the context blocks. Recheck changed symbol locations before implementation; line numbers from the original plan are not contracts.

## Derived Test Matrix

Paths in this table are relative to `.bkit/core/engine/`.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Branch tokens, explicit missing branch, ambiguous branches, URL exclusion | Unit | `commands/workflow/branches.test.ts` | 1 |
| Adopt existing branch; refuse missing/main and conflicting existing worktree without mutation | Unit | `commands/workflow/worktrees.test.ts` | 1 |
| Reference precedence, issue references, `[local]`, ambiguity, repository and attempt validation | Unit | `commands/workflow/runs.test.ts` | 2 |
| Configured workflow red while unrelated workflow green; PR selection at exact head | Unit | `commands/workflow/runs.test.ts` | 2 |
| Explicit workflow identity; branch mismatch, fork, ancestor, divergent and unknown-history cases | Unit | `commands/workflow/runs.test.ts` | 2 |
| Lookup failures never become no-red; fallback evidence validation; paginated jobs | Unit | `commands/workflow/runs.test.ts` | 2 |
| Atomic selection, stable resume, explicit clear, explicit replacement, new attempt, finished-run isolation | Unit | `commands/workflow/status.test.ts` | 3 |
| Gate order for one/multiple tiers, unknown failed job and `[live=off]` | Unit | `commands/workflow/status.test.ts` | 3 |
| CI evidence round executes no gate; matching fix runs gate; old-generation fix does not | Unit | `commands/workflow/tests.test.ts` | 4 |
| Invalid/no active debug state refused; CI rows accepted by row/schema readers | Unit | `commands/workflow/tests.test.ts`, relevant ledger tests | 4 |
| CI-only evidence artifact and step completion work without a local clamp; local clamp enforcement preserved | Unit | `commands/workflow/steps.test.ts`, `checks/status-holes.test.ts` | 4 |
| Context env is pinned and absent without selection; old/mismatched/empty/partial evidence rejected | Unit | `commands/workflow/context-fetch.test.ts` | 5 |
| Template fetches selected attempt without branch discovery; unpinned discovery uses configured workflow | Unit | `audits/templates/context-github-ci-block.test.ts` | 6 |
| Adopted CI block equals the shipped block; pinned diff ends at the selected commit | Unit | `audits/templates/context-github-ci-block.test.ts` | 6 |
| `[repro]` CI routing, generation-scoped reproduction, and NO cannot reach successful Summary | Unit | `audits/workflows/` existing debug contract suite | 7 |
| Close checks pushed SHA, preserves configured gate, verifies selected other workflow, retains both run links | Unit | `commands/workflow/runs.test.ts`, debug workflow audit suite | 7 |
| Complete CI round → logs → fix → local gate → close, with green and red final CI variants | Integration | `audits/workflows/debug-ci-evidence.integration.test.ts` | 9 |
| Resume and explicit replacement across serialized status files; unavailable evidence blocks before edits | Integration | `audits/workflows/debug-ci-evidence.integration.test.ts` | 9 |
| Docs, CLI help, mirrors and ledger rows agree with final contracts | Static | existing CLI, workflow, render and ledger audits | 8–9 |
| Explicit historical-run replay reaches diagnosis with matching logs and no local discovery gate | Smoke | scratch consumer artifacts | 9 |

## Agent Execution Runbook

For every code task, write the named behavioral tests first, run them and observe the intended failure, then implement and run the targeted tests. A missing test file or compile/import error is not the intended red. Commit only the task's files after its checks. Every new CLI verb or flag needs its help, output fields and exit codes per `commands/conventions.test.ts`.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine — selection, state and recorded evidence

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Parse and safely adopt an explicitly named branch.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: add `parse --prompt-file` with `branch`, `via` and `where` outputs. Validate candidates with `git check-ref-format --branch` and exact `refs/heads/` or `refs/remotes/origin/` existence checks. Deduplicate the same branch found locally and remotely.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: accept `--branch` for debug, preserving ship behavior and keeping `--issue` ship-only. An existing worktree must match the requested branch. Reuse the existing adoption path; do not switch a conflicting checkout or create a missing branch.
  - **EXIT CONTRACT:** `branches parse`: 0 for one branch or no candidate, 3 for a missing explicit branch, 8 for ambiguity. Existing setup refusal codes remain documented. Ambiguous or conflicting user input stops before edits.
  - **DEPENDS ON:** none.
  - **DONE WHEN:** matrix rows for Task 1 pass, including a sentinel proving a conflicting worktree and its branch remain unchanged; CLI help documents debug branch adoption.
  - **TEST FIRST:** tests fail because valid explicit adoption is refused, ambiguity is not surfaced, or a conflicting worktree is accepted. Include implicit non-branch paths and a URL so branch parsing cannot consume them.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Locate and validate the relevant CI evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: add pure reference parsing and `runs locate --prompt-file --issue-text-file --branch --repo --file --selection-out`. `--file` is the active status log when available; `--selection-out` writes the validated candidate selection JSON for Task 3. Inputs and output paths are explicit; do not change active metadata from this read operation.
  - **IMPLEMENT:** apply Reference precedence and CI lookup above. Read `readBkitConfig(root).ciWorkflow`; branch and PR discovery filter by that workflow. Reuse `runGh`, existing workflow-filtered queries and pagination helpers. Fetch selected-attempt metadata and jobs, retaining the workflow ID/path, head repository, head branch and head commit.
  - **VALIDATE:** branch alignment and commit ancestry before emitting an actionable CI selection. Treat an ancestry check error distinctly from proven non-ancestry. Unknown failed jobs yield `redTiers: []` for default gate order and remain listed in `failedJobs`.
  - **OUTPUT:** `selection`, `runId`, `runUrl`, `runAttempt`, `workflowId`, `workflowPath`, `headSha`, `headRelation` (`current`, `ancestor`, `divergent`, `unknown`), `failedJobs`, `tiers`, `via`, `reason`, `selectionFile`. CI summary fields are null or empty for local selection.
  - **EXIT CONTRACT:** 0 for validated red selection; 1 only for a valid local selection (`[local]`, saved local, successful automatic no-red, or no configured CI). Exit 2 for invalid arguments, 8 for ambiguous/conflicting user references, 80 for unavailable transport eligible for the existing read fallback, and 82 when the named evidence or alignment needs owner action. A malformed response or incomplete required read is never exit 1.
  - **FALLBACK:** add `--evidence-file` for a bounded, normalized response collected through the mapped GitHub read tools after exit 80. Validate it with the same parser and branch checks as the CLI response. Its schema carries the lookup request, selected run/attempt metadata and complete jobs, or an explicit successful no-red result with the inspected selector/head. Reject mismatched selectors and missing identity fields. Record the single transport transition with the existing transport-row mechanism and independently re-read the selected identity before proceeding.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: place the shared selection type, validation and identity helper alongside the existing status-row contract, with focused cases in its existing test file. Both `runs.ts` and `status.ts` consume these helpers; do not make `status.ts` import `runs.ts`, which already imports `status.ts`.
  - **IMPLEMENT:** read an active run's saved object through the existing metadata-folding helpers. Task 3 extends the metadata writer and routing; lookup does not depend on those future writer changes to read fixture state.
  - **DEPENDS ON:** none.
  - **DONE WHEN:** Task 2 matrix rows pass; a newer unrelated green workflow cannot change selection; unavailable and partially paged evidence cannot emit local selection; help documents every result and exit code.
  - **TEST FIRST:** use injected transport fixtures for unrelated workflows, explicit run/attempt, conflicting branches, PR heads, paginated jobs, no configured workflow, successful no-red, auth/network errors and fallback shape mismatch. Assert the workflow/head/attempt query arguments and selection identity, not merely exit status.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Persist selection atomically and route by its generation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: implement `status meta --ci-selection-file` and generation assignment under Atomic saved selection. Extend `debugStart` and `status route` to expose the derived values and reorder `BKIT_DEBUG_GATES`.
  - **UPDATE:** existing status/ledger row types and validators wherever metadata is constrained. Reuse the active-run predicate from `debugStart`; an unrelated or finished run cannot provide evidence or progress.
  - **IMPLEMENT:** mode changes or changed CI identities increment `ciGeneration`; identical identities preserve it. A local variant replaces the whole object, removing stale tiers and references. Route `[local]` before reading saved CI fields. Validate the complete object before appending any row.
  - **IMPLEMENT:** expose current-generation reproduction and fix completion in routing so the workflow does not perform its own unscoped search. Keep global attempt counters unchanged; they count actual fixes across generations and runs.
  - **DEPENDS ON:** 2.
  - **DONE WHEN:** Task 3 matrix rows pass; serialized/reloaded state preserves the same identity and generation; replacement makes prior fix/reproduction rows ineligible; existing no-CI routing is unchanged.
  - **TEST FIRST:** seed an active run with CI evidence and fix rows, then test `[local]`, identical write, a new run, a new attempt of the same run, malformed selection and a finished workflow. Assert both persisted state and computed routing.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Record a CI round without pretending to execute local tests.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add `tests run --ci-run --ci-url`; require `--file`, an active debug run and a matching validated saved CI selection. Reject a flag/metadata mismatch. Read the current generation and its DONE remediation/soak rows.
  - **IMPLEMENT:** before a matching fix, create the evidence artifact identifying repository, workflow, run, attempt, commit and URL. State that the local gate was not run. Append the test-run row defined in Tests, reproduction and proof; emit `source`, `verdict`, `scope`, `gate: null`, nullable `failures`, `runAttempt`, `ciGeneration`; return 1. After a matching fix, use the normal local gate runner and emit `source: local`.
  - **UPDATE:** `appendTestRun`, row types and telemetry/status validators to accept this bounded CI variant. Preserve numeric local exit codes and existing local validation. Do not loosen schemas for unrelated row kinds.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts` and its tests only where needed to complete a CI evidence round without a local clamp record. Validate the CI source, artifact and selection identity; preserve local clamp requirements. Workflow Step 3 passes the clamp argument only for local output.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Task 4 matrix rows pass; a local-gate marker is absent before a matching fix and present after one; status audit, summary and telemetry accept the CI variant without treating it as a zero-failure local pass.
  - **TEST FIRST:** seed current/old-generation remediation and soak rows, exercise both branches, and assert exact row/artifact contents. Exercise missing status, closed run, mismatched run flags and local clamp enforcement.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Pin and validate context evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: add `context fetch --ci-selection-file`. Validate the same selection schema. Set `BKIT_CI_RUN_ID`, `BKIT_CI_RUN_ATTEMPT`, `BKIT_CI_REPO` and `BKIT_CI_HEAD_SHA` in the child environment for a selected CI run; remove inherited values of these variables when no CI selection is supplied.
  - **CONTRACT:** a selected `ci` block emits one machine-readable identity line, `bkit-ci-evidence: <JSON>`, with `provider`, `repo`, `runId`, `runAttempt`, `headSha`, `workflowId`, and `complete: true`, followed by the logs. The block emits `complete: true` only after every required metadata/job/log read succeeds. Parse and compare the identity with the selection. Empty logs, skip breadcrumbs, partial evidence or mismatched identity cannot count as fetched evidence for diagnosis.
  - **COMPATIBILITY:** existing consumer-owned blocks are not rewritten automatically. Step 4 already customises a temporary script; adapt that script to honor the selected identity and emit the receipt. If the block's provider or available tools cannot supply it, retain the output as unchecked evidence and stop before diagnosis. A matching header with no logs is insufficient.
  - **FALLBACK:** use the existing mapped metadata/log read tools when the block cannot use `gh`, preserving the repository, attempt, workflow and commit. Feed the normalized result through the same identity/content validation before producing a checked artifact; do not bypass validation by manually claiming CHECKED.
  - **UPDATE:** `.bkit/core/.agents/context.md` (managed source) with the input environment and identity-line contract. Locate its source references before editing. Update the self-contained-block wording so the optional input pin is explicit; blocks still share no mutable state.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Task 5 matrix rows pass; a legacy block returning another run is rejected; a correctly adapted temporary block succeeds; unavailable logs cannot route to Diagnose.
  - **TEST FIRST:** execute fixture blocks with matching identity and logs, wrong run/attempt/commit, no identity, empty logs, a skip breadcrumb and partial status. Assert child env cleanup with stale inherited values and validate the fallback output through the same path.

<!-- bkit:task 5 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Templates, workflow, documentation and verification

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Make the shipped evidence blocks honor the selection.
  - **UPDATE:** `.bkit/templates/context/bkit-github.md`, the `context=ci` block: when pinned, read the exact repository/run/attempt and do not call branch discovery. Validate returned metadata before fetching complete, bounded job logs. Include failed/timed-out/startup-failure evidence where available; missing logs remain unavailable, not a clean result.
  - **UPDATE:** its unpinned discovery to use the consumer's existing configured workflow selector. Resolve the setting through the existing configuration convention; do not add a second default filename or setting. Preserve no-config and tool-unavailable breadcrumbs.
  - **UPDATE:** the `context=diff` block to use the selected failing commit as the diff endpoint when pinned. Find a successful baseline of the same selected workflow on the configured baseline branch at or before the failing run; validate ancestry. Report an unavailable baseline honestly rather than diffing unrelated or newer code. Unpinned behavior retains the existing discovery path.
  - **UPDATE:** bkit's adopted blocks below `bkit:end` in `.agents/context.md` to match the shipped blocks. Do not edit the managed header; Task 5 changes its source and regeneration writes the mirror.
  - **CREATE:** `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts`: execute the actual bash blocks with a stub `gh` and temporary Git history. Assert repository/attempt pinning, query selectors, complete evidence receipts, multiple jobs, errors and baseline/end commit choice. Verify adopted/template equality.
  - **DEPENDS ON:** 5.
  - **DONE WHEN:** Task 6 matrix rows pass and existing context-fetch preflight tests report no unbounded command regression. A pin cannot be ignored without failing the test.
  - **TEST FIRST:** pinned CI calls `gh run view` or the attempt-specific API and never `gh run list`; unpinned CI includes the configured workflow; an older selected failure produces a diff ending at its SHA rather than current HEAD; a wrong attempt and partial job read fail validation.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Wire selection, reproduction and final proof through Debug.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md` header and Steps 1–2: parse branch input, adopt safely, resolve evidence with prompt/current issue text/active status, and validate branch alignment. Persist the validated selection, then rederive gates. Run this resolution before resuming a downstream step so explicit reference or `[local]` overrides cannot be skipped on resume.
  - **UPDATE:** Step 2 routing: exit 1 means an explicit local choice or a proven no-red result; exit 80 enters the existing mapped read fallback, not local-first; unresolved unavailable evidence stops with its reference. Ambiguous references or branch conflicts use an owner stop before tests or edits. Record fallback transport and pause state using existing mechanisms.
  - **UPDATE:** Step 3: pass CI flags only for the saved CI selection, record `source` and `ciGeneration`, and condition local clamp arguments on `source: local`. Preserve attempt counters and normal local FAIL loops. A changed CI generation restarts evidence collection regardless of previous fix rows.
  - **UPDATE:** Step 4: pass the selection file to every applicable fetch, require validated selected-run logs before diagnosis, and record explicit unavailable/partial outcomes. Capture current-generation context; do not let an older context artifact satisfy the evidence check.
  - **UPDATE:** Steps 4–5: route `[repro]` with known CI evidence to Failure Reproduce once for the current generation. Stamp its row. YES proceeds to Diagnose/Soak without an unnecessary discovery gate; NO stops with the reproduction blocker. Keep the existing local-only reproduction path. Do not clear `REPRO` merely because CI is red.
  - **UPDATE:** Steps 6–8: supply the selected evidence identity and stamp diagnosis, remediation and soak rows with `ciGeneration`. The DONE fix row authorizes the next local gate only for that generation.
  - **UPDATE:** Gate 3: verify the current evidence/test round and its artifact. Move the CI fail-then-pass requirement to Gate 11 after push and verification. Do not claim a future green result at Gate 3.
  - **UPDATE:** Steps 10–11 and `.bkit/core/engine/commands/workflow/runs.ts` only where necessary: retain the configured pushed-head gate; carry the selected workflow's ID/path through wait/gate for an explicit different workflow. Keep input evidence IDs separate from `VERIFY_RUN_ID`/verification URL. A completed red, skipped, cancelled, absent or unavailable verifying run cannot complete the CI-only fix. Close comments and the final report name both the original failure and the verifying run.
  - **CHECK:** `.bkit/core/workflows/bkit-auto.md` dispatch. Its debug invocation must preserve the exact run it is acting on instead of assuming later branch discovery finds the same run. If it currently omits that reference, pass the existing held run explicitly and update the workflow catalog and audits in this task; do not change auto's routing policy.
  - **UPDATE:** existing debug workflow audits, status-hole tests and CLI tests for any expanded wait/gate parameters. Read diagnose/remediate/soak prompts for conflicts with the new evidence contract; edit only a conflicting input/routing statement, updating `.bkit/core/.bkit/prompts.md` if a prompt changes.
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6.
  - **DONE WHEN:** Task 7 matrix rows pass; no CI-reproduction NO path reaches successful Summary; no path declares CI-only resolution before the pushed-head checks. Existing local-only debug and auto dispatch tests still pass.
  - **TEST FIRST:** audit the actual routing blocks and exercise their command sequences with fixtures. Assert `[repro]` ordering, generation fields, conditional clamp handling and both old/new run links. Unit-test an explicit other-workflow target so a green configured workflow alone is insufficient.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Update the documentation, reference rows and decision record.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md` source: Debug modes, Steps 1–8 and Close, branch adoption, the evidence-round artifact contract, current-generation progress and local gate ordering. Include auto's exact-run handoff if Task 7 changes it.
  - **UPDATE:** `.bkit/core/.bkit/templates.md` for the changed CI/diff block inputs and evidence output contract. Update `.bkit/core/.bkit/prompts.md` only if Task 7 changes a prompt. Regenerate the installed catalogs.
  - **UPDATE:** `docs/testing.md`: distinguish CI evidence, explicit reproduction, local post-fix checks and pushed-head proof. Document the new integration test and the retained `[live=off]`/live-skipped behavior.
  - **UPDATE:** CLI documentation through `pnpm cli:sync`, never by hand. Document the existing `bkit.testing.ciWorkflow` selector and the new selection-file flags, row fields, environment inputs, identity receipt and exit behavior in their canonical homes.
  - **CREATE:** one decision row through `bkit ledgers append --ledger=decisions --rows=-`, using an engine-generated timestamp and key `830-red-ci-run-is-the-first-test-round`. Reference the related issue with its title and URL. Record evidence-first routing, configured workflow filtering, branch validation, stable selection/generation, explicit local/repro precedence, unavailable-evidence blocking and final CI proof. Do not add a migration row.
  - **DEPENDS ON:** 7.
  - **DONE WHEN:** CLI-doc and ledger-integrity tests, prose lint and formatting pass. No edited catalog says all blocks independently discover their run, `[repro]` is ignored for CI, or an unavailable CI read proves there is no red run.
  - **TEST FIRST:** n/a for prose and ledger text; existing documentation and schema audits verify their format. Behavioral rules are covered by Tasks 1–7.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Verify the complete sequence and regenerate the shipped output.
  - **CREATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`. Follow existing workflow-snippet integration fixtures: use a fresh temporary consumer, real CLI commands/status files/context execution, the actual workflow command blocks and an argv-checking fake CI transport. Stub the remote boundary and agent-produced fix artifact, not selection, metadata folding, gate execution, context validation or final gate evaluation.
  - **TEST FIRST:** first fixture is a red selected integration run with a newer unrelated successful workflow. Assert that no local-gate sentinel exists before diagnosis, the context identity matches, a matching remediation row enables the selected local gate, and the final verifier queries the exact pushed commit. Run the final response once green and once red; only green may complete.
  - **TEST FIRST:** persist and reload an active run with a completed fix, then explicitly replace the evidence. Assert that a new CI generation reaches context/diagnosis again, even if a local gate would pass. Cover `[local]` clearing, `[repro]` ordering/failure, missing logs and wrong-branch selection without source edits.
  - **UPDATE:** generated outputs via the existing `pnpm bkit:generate` once after source edits. Run the prescribed build, CLI/instruction sync, mirror generation, snapshots and graph refresh through that script; inspect the generated diff. Do not hand-edit mirrors.
  - **VERIFY:** run the unit and integration tests named by the matrix, then `pnpm bkit:gate:static-unit-integration` and `bkit check`. Run generation again only to prove idempotence or after a change; it must add no new delta. Inspect that the working tree contains only intended changes.
  - **DOGFOOD:** build the actual distributable, install it into a fresh scratch consumer, and run the relevant built CLI commands. Inspect the selection metadata, evidence artifact, context logs, conditional local-gate sentinel and generated host files on disk. Keep fixtures under the repo's temporary directory and use no production mutation.
  - **HISTORICAL SMOKE:** in a scratch checkout, pass the exact existing branch and explicitly pinned historical run from Concrete Example. Record the selected attempt and confirm the fetched identity and diagnosis. Do not rely on that branch's latest run. If logs have expired or the branch is gone, report this smoke check as unavailable; the deterministic integration proof still runs and the historical replay is not falsely reported as passing.
  - **DEPENDS ON:** 8.
  - **DONE WHEN:** the complete deterministic green and red sequences pass, all matrix rows are covered, required gates pass, generated files are stable, and fresh-consumer artifacts demonstrate the shipped behavior. Report historical smoke availability separately from automated verification.

<!-- bkit:task 9 end -->

<!-- bkit:group 2 end -->

## Breaking Changes & Naming

- New verbs: `branches parse`, `runs locate`.
- Extended flags: debug `worktrees setup --branch`; `runs locate` prompt/issue/status/selection/fallback inputs; `status meta --ci-selection-file`; `tests run --ci-run/--ci-url`; `context fetch --ci-selection-file`; existing workflow-specific verification options only where needed.
- New status contract: atomic `ciSelection`, engine-owned `ciGeneration`, generation-stamped evidence/reproduction/fix steps, CI test-run `source`, nullable CI `exitCode`, and `scope: ci:<id>`.
- New block inputs: `BKIT_CI_RUN_ID`, `BKIT_CI_RUN_ATTEMPT`, `BKIT_CI_REPO`, `BKIT_CI_HEAD_SHA`. CI output adds the validated `bkit-ci-evidence` identity line.
- Existing configuration: reuse `bkit.testing.ciWorkflow`; no additional selector setting.
- New prompt behavior: branch selection and CI-first automatic discovery; explicit `[local]` wins, including on resume. `[repro]` retains its request for a failing test.
- Consumer-owned blocks are adapted only in the temporary execution copy unless the owner requests an adopted-block update. A block that cannot fetch the selected identity causes an explicit blocker. No automatic migration is included.

## Open Questions & Assumptions

- No product decision remains open for the six review findings. The contracts above are the implementation targets for this requested revision.
- GitHub lookup remains in the existing GitHub transport; context blocks own log retrieval. Other CI providers keep their existing behavior. Adding another provider's discovery is outside this change.
- The existing tier-name convention is the mapping contract. Unknown names use the deepest declared gate rather than a new configurable job mapping.
- Historical logs and branches can disappear. Their availability affects the advisory replay only; deterministic full-sequence verification is required and cannot be replaced with a diagnosis-only smoke run.
- A synthetic integration fixture proves bkit's orchestration and state handling, not an actual remote CI service. Final implementation reporting must distinguish fixture verification, fresh-consumer dogfood and any real CI evidence observed.

## Security & Privacy

- Validate reference IDs, repository/workflow identity and branch names before use. Pass external values as process arguments, not interpolated shell program text.
- Treat logs, issue text and fallback payloads as untrusted data. Keep existing secret redaction and bounded output. Read operations do not gain mutation permissions.
- Reject mismatched or incomplete evidence before allowing source changes. Preserve existing approval requirements for CI workflow edits and pushes outside pre-authorized workflows.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why Exempt | Where it belongs |
| --- | --- | --- |
| The historical tag-reading test fix | This plan changes debug orchestration | [#748 — Brand every consumer-facing script, check and style name bkit-*](https://github.com/cbartens/bkit/issues/748) |
| A new CI provider framework or arbitrary job mapping system | Existing GitHub transport, selector and gate convention cover this change | Separate provider/configuration work |
| Prose branch interpretation such as “on dev” | Explicit selectors and existing slash-containing branches have deterministic meanings | Separate parsing work |
| Build's local test step and ship's branch parser | Neither is needed for evidence-first debugging | Their own workflow changes |
| Automatic migration of consumer-owned context blocks | Temporary adaptation and identity checks safely cover execution | Owner-requested migration work |

## Verification and Rollback

- Implementation gates: each task's tests, the full matrix, static/unit/integration gate, clean drift check, stable generated output and fresh-consumer dogfood.
- Evidence gate: selected repository/workflow/run/attempt/commit matches fetched logs; a missing or mismatched receipt blocks diagnosis.
- Completion gate: current-generation fix or an explicitly diagnosed already-fixed state, provisional local pass, then required green CI on the pushed commit. An already-fixed diagnosis must record that conclusion through a generation-stamped remediation/soak result before the local verification path; no fabricated source edit is required.
- Rollback is code-only: revert the implementation and regenerate distributables/mirrors. No database or consumer-block migration is introduced. Confirm that older readers tolerate the additive row fields during Task 4; if they do not, document the compatibility boundary before shipping.

## References

- [#830 — Debug: diagnose a named red CI run before rerunning local tests](https://github.com/cbartens/bkit/issues/830)
- `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-auto.md`
- `.bkit/core/engine/commands/workflow/{branches,worktrees,runs,status,tests,steps,context}.ts`
- `.bkit/core/engine/shared/settings.ts` (`readBkitConfig`, `ciWorkflow`)
- `.bkit/core/engine/install/manifest.ts` (`BKIT_DEBUG_GATES`)
- `.bkit/core/prompts/bkit-debug-failure-reproduce.md`
- `.bkit/templates/context/bkit-github.md`, `.bkit/core/.agents/context.md`, `.agents/context.md`
- `.bkit/workflows.md` § Debug and § Local gate scripts; `.bkit/jsonl.md` § Write Idiom
- `docs/templates/bkit-plan.md`, `docs/testing.md`, `.bkit/authoring.md`

## #744 — Build agents re-run the whole unit suite after every change (closed)

### Problem

The build's agents check their work by running a whole local gate. After each change they make, `@bkit-build-plan-gaps-remediate` and `@bkit-build-plan-verify` run `pnpm bkit:gate:static-unit`, which is every static check plus the whole unit suite. `@bkit-build-plan-execute` runs `bkit:gate:static`. `@bkit-debug-failure-remediate` does the same as gaps-remediate (`.bkit/workflows.md` § Local gate scripts). A fix that touches one file and its one test still pays for the whole suite, and pays again on every fix round. The orchestrator then re-runs the gate itself at the group gate (Step 8) and at Step 12, so an agent's whole-suite run duplicates a check that follows anyway.

bkit has no gate for "only what this change affects". The `bkit:gate:*` names are the contract consumers declare, and each one runs a fixed scope.

### Outcome

The build and debug agents check a change by running only the checks and tests the change affects. The full scope runs only where the orchestrator gates: the group gate, Step 12, debug Step 3, pre-push and CI.

### Success criteria

- An agent's own check after a change runs the tests that import the changed code, plus tests that name a changed file's path, and static checks on the changed files.
- Its run time scales with the change, not with the suite.
- Leaving the new gate undeclared keeps today's behaviour, so the change is opt-in.
- No orchestrator gate gets weaker: the group gate, Step 12 and pre-push keep their current scope.

### Constraints and non-goals

- Stack-agnostic: bkit cannot write one default for "which tests does this change affect" (vitest has `--changed`, other runners differ). Like `bkit:test:file`, it is a consumer-declared script name with an I/O contract, and bkit seeds no implementation.
- Tests that read files as text (workflow markdown, config) have to be found too. An import graph alone misses them.
- Another session's uncommitted edits in the same checkout widen the selection. That costs extra tests but never gives a wrong answer.

### Decisions already made

- The build group gate runs `bkit:gate:static-unit` only, and integration runs once at Step 12: #743 — Build group gate re-runs integration tests after every group — https://github.com/cbartens/bkit/issues/743
- `bkit:test:file` runs one runner per call and picks it by file type in bkit's own repo (`scripts/ci/bkit-test-file.mjs`): #723 — Build asks the owner needless questions and repeats fix rounds — https://github.com/cbartens/bkit/issues/723

### Open questions

- Name and contract: a new gate name (for example `bkit:gate:changed`) that takes the changed files as arguments, or one that works them out itself from `git`?
- Which agents switch to it: execute, gaps-remediate, verify and debug-remediate, or only the fix-round agents?
- What counts as changed: the agent's own commits since the step started, or everything uncommitted?
- Whether `bkit install` / `bkit check` should advise on it the way `test-file-script-missing` advises on `bkit:test:file`.

### References

- `.bkit/workflows.md` § Local gate scripts (which agent runs which gate)
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` step 8, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-build-plan-execute.md`
- `package.json` `bkit:test:file`, `bkit:lint:file`; `scripts/ci/bkit-test-file.mjs`
- `.agents/rules.md` § Project Rules `Verify before complete` (the repo's own commit-time check)

Fixed in 52bab3514 (`fix(99): build and plan friction from the 699 and 715 runs`). It is merged to local `dev` and not pushed yet.

**What changed**
- New verb `bkit tests changed` (`.bkit/core/engine/commands/workflow/tests-changed.ts`). It works out which files the current step changed and hands that list to the project's `bkit:gate:changed` script, as decided. Build agents now run the tests for what they touched instead of the whole unit suite after every change.
- This repo's own `bkit:gate:changed` script is `scripts/gate/bkit-gate-changed.mjs`, registered in `package.json`. Each consumer supplies its own script, so bkit stays stack-independent.
- Install now warns with `gate-changed-script-missing` when a project has no `bkit:gate:changed` script. The script name lives in `manifest.ts` as `BKIT_GATE_CHANGED_SCRIPT`.
- The build and remediate prompts (`bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-remediate`) tell agents to use it.

**How it was checked**
- Static gate passed. Unit and integration tests (vitest): 8389 passed, 2 skipped. bats: 0 failures. The new `tests-changed.test.ts` and the install advisory test are among them.
- Tried it in a scratch repo: `tests changed` passed the right file list.

**Not done**
- Two of the guard tests were written after the code, not before it.
- Consumers have no `bkit:gate:changed` script until they add one. The install advisory says so, but no migration writes one for them.

## #723 — Build asks the owner needless questions and repeats fix rounds (closed)

### Problem

The build's test-first audit (`bkit tests green`) sends the owner TEST EXCEPTION questions for tests that were correctly written first and whose assertions never changed. In builds 701 and 705 the owner answered 10 test-order exception questions; 7 of them were false alarms and 3 were real plan problems.

Five causes, from `docs/plans/202610/logs/*/build-decision-*.md` and `build-tests-green-*.md`:

1. **Whole-file comparison.** `tests red` saves a copy of the entire test file (`.bkit/core/engine/commands/workflow/tests.ts:1355`). `tests green` raises `test-changed` when that file differs at all from the copy (`tests.ts:1636`). So any later edit anywhere in the file flags every earlier test in it: another task's new test, a shared helper, a lint tidy-up. Across 650, 700, 701, 703 and 705 the logs hold 263 `test-changed` rows, against 30 `no-red` and 4 `red-mismatch`. The verifier must read every diff. Its rule (`.bkit/core/prompts/bkit-build-plan-verify.md:69-70`) knows only "formatting only → no gap" and "assertions weakened / removed / rewritten → `Fixable: false`". It has no case for "assertions identical, setup moved into a helper". Example: 701 group 4 had 13 flags, all caused by an edit to the shared `asPlan()` helper, and they were cleared. Example: 705 groups 1-2 had 7 flags of the same kind, and they were escalated with "No recommendation".
2. **Lint after red, with no way out.** In 705 the execute agent recorded a red, then the static gate rule `vitest(no-conditional-in-test)` forced it to move test logic into module-level helpers. That rewrite is `test-changed`. Re-recording the red yields `late-red`, because the task's code commit already exists. Only an owner exception ends the loop (`705-build-plan-convert/build-decision-1-1.md` Q5, `build-decision-1-2.md`).
3. **Same-build pre-emption reads as `no-red`.** When one task's code already makes a later task's test pass, `tests red` refuses with `passed`. The verifier's already-landed override (`bkit-build-plan-verify.md:72`) applies only when plan-currency reports the task `Broken`, and plan-currency checks only changes landed before the build started. Cases: 701 TASK 14, made green by TASK 13 (`701-engine-work-build/build-decision-1-2.md`), and 701 TASK 23, a challenge-appended task that duplicated TASK 21 (`build-decision-1-5.md`).
4. **Plan review never asks "can this test fail today?"** The plan reviewers check `TEST FIRST` format, matrix coverage, tiers, and whether a test can *pass* (`.bkit/core/prompts/bkit-plan-review-2.md:73`, "Unpassable checks"). No reviewer checks the reverse: that each named test *fails* on current code, and is not made green by an earlier task's code. Two misses follow:
   - 705 TASK 3's `TEST FIRST` named a test that already passed on the stale code, so no red could exist (`705-build-plan-convert/build-decision-1-3.md`; the owner fixed the plan line).
   - 701 TASK 14's test was made green by TASK 13's code in the same group (cause 3). The runbook rule "no task leaves its tests to a later one" covers the reverse direction only.
5. **Challenge-appended tasks skip plan review.** Tasks the challenge merge appends go straight into the plan. 701 TASK 12-18 arrived without `Derived Test Matrix` rows (`701-engine-work-build/build-decision-1-3.md`), and TASK 23 duplicated TASK 21's fix (`build-decision-1-5.md`).

Three more causes, from builds 699 and 715 (both run on the engine with causes 1-5 fixed):

6. **Tests the audit cannot run.** `tests red` / `tests green` run one file through `bkit:test:file`, which in this repo (`package.json` `bkit:test:file`) runs vitest only. Plain-node `.test.mjs` files (`scripts/harvest/bkit-harvest.test.mjs`) and `.bats` files (`tests/*.bats`) never get a red or a green. `bkit:lint:file` also exits 1 on a `.bats` file (oxlint: "No files found to lint"), so `tests red` refuses it before it runs. Every task naming such a test reaches the owner, twice per test (`no-red` plus `not-green` "did not run"): 9 questions across 699 TASK 1 and 13 and 715 TASK 11 (`699-engine-run-completeness/build-decision-1-1.md`, `-1-7.md`; `715-retire-lite-workflows/build-decision-1-2.md`).
7. **A CONCERNS verify round asks before fixing.** In `.bkit/core/workflows/bkit-build.md` Step 8 sub-step 11, a FAIL verdict whose gaps include fixable ones goes straight to a fix round, but a CONCERNS verdict (every gap fixable) pauses with `VERIFY_LOOP` "another fix round?", on the first round too, with no trend to judge. 699 group 8 paused on one fixable gap with recommendation "Try again" (`699-engine-run-completeness/build-decision-1-8.md`). No decision records why CONCERNS asks.
8. **Group-gate failures surface one per round.** The fix round's `@bkit-build-plan-gaps-remediate` is told to re-run the group gate before finishing (`.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` step 8), but nothing hands it the command or checks that it ran. In 715 group 6 the fix rounds took 1-5 minutes against a 10-15 minute gate, so they ran only targeted tests. The gate also stops at its first failing stage, so the integration tests never ran until the fourth gate. Result: 4 of 715's 9 gate runs failed, three in a row in group 6, each exposing a different test that assumed one `workflows close` line in `bkit-build.md` (`715-retire-lite-workflows/build-group-gate-6-2.md` … `-6-4.md`, `build-plan-gaps-remediate-6-2-log.md` … `-6-4-log.md`).

### Outcome

Test-order exception questions reach the owner only when a planned test's own assertions or the setup it runs changed after its red, or when no task in the build ever produced its red. A fix round starts without asking while rounds are left, and ends only once the group gate passes in full.

### Success criteria

- Editing a test file outside a planned test's own body, or outside helpers or setup it runs, raises no `test-changed` gap for that test.
- A lint or static-gate rewrite cannot leave a recorded red unrecoverable: the test is checked against the static gate before its red is recorded, or the audit accepts a re-recorded red whose assertions match.
- A `no-red` whose test was made green by another task's code commit in the same build is classed as already landed, with that commit named, and does not reach the owner.
- Plan review flags a `TEST FIRST` test that passes on current code, or that an earlier task's code would make pass. The same check runs on tasks appended by a challenge merge, alongside their matrix rows and an overlap check against existing tasks.
- Replaying the 701 and 705 logs through the changed audit leaves only the genuine cases: none of the 7 `test-changed` questions.
- `bkit tests red` and `bkit tests green` record and judge a named test in a `.bats` file and in `scripts/harvest/bkit-harvest.test.mjs`; `bkit:lint:file` passes a file its linter does not cover.
- A CONCERNS verify verdict with rounds left goes to a fix round without a Decision Pause.
- A fix round after a group-gate failure gets the gate command, runs it until it exits 0 (or logs `BLOCKED`), and logs the passing run; the fixer looks for every other test sharing a failing assumption before finishing.

### Constraints and non-goals

- Stack-agnostic: bkit ships to non-vitest consumers, so cutting out a test's body or linting one test file cannot assume vitest, TypeScript or ESLint. Consumer-declared scripts follow the existing `bkit:test:file` contract.
- The test-first rule itself stays as strict: a test never seen failing before its code still needs an owner exception.
- No weakening of `tests green` gap kinds; this narrows false positives only.
- The group gate keeps running the full gate scope after every group; selecting only changed tests would miss tests that read workflow markdown as text (the 715 group-6 failures).
- Builds in flight run older workflow text against the main checkout's engine: engine changes stay backward-compatible (`decisions compose --loop=verify` stays accepted).

### Decisions already made

- The verifier keeps the final judgement on diffs (#701 — Engine work in build verify and ship: emit the facts, keep the judgement — https://github.com/cbartens/bkit/issues/701); the engine's job is to emit fewer false facts.

### Open questions

- How to compare only a planned test's own body across languages: a consumer-declared extractor script, a language-agnostic heuristic (named block by test-name match plus indentation), or keep whole-file comparison and pass the verifier a per-test diff summary instead.
- Lint before red: a new consumer script (e.g. `bkit:lint:file`) run by `tests red`, or let `tests red` re-record a red over an earlier one when assertions are byte-identical, without counting it `late-red`.
- "Fails on current code" in plan review: reviewer judgement from reading the code under test, or an engine dry run of each named test against the plan's base commit (only possible for tests that already exist).
- Same-build pre-emption: detect it in `tests green` from the `tests red` `passed` refusal plus the plan-execute commit history, or extend plan-currency to re-run between groups.

### References

- `.bkit/core/engine/commands/workflow/tests.ts` § `tests red` (snapshot at `:1355`), § `tests green` gap checks (`:1590-1650`), `onlyAddsLines` (`:687`)
- `.bkit/core/prompts/bkit-build-plan-verify.md:69-72`
- `.bkit/core/prompts/bkit-build-plan-execute.md:93-97`
- `.bkit/core/workflows/bkit-build.md:109` (test-order gap question shape), Step 8 sub-step 11 (verify round routing), Step 9 (fix round)
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` step 8
- `.bkit/core/prompts/bkit-plan-review-2.md:71-73`, `.bkit/core/prompts/bkit-plan-scope-check.md:43` (current `TEST FIRST` checks)
- `package.json` `bkit:test:file`, `bkit:lint:file`
- `docs/plans/202610/logs/701-engine-work-build/build-decision-1-2.md`, `build-decision-1-5.md`, `build-tests-green-4-1.md`
- `docs/plans/202610/logs/705-build-plan-convert/build-decision-1-1.md`, `build-decision-1-2.md`, `build-decision-1-3.md`
- `feat/699-engine-run-completeness` `docs/plans/202610/logs/699-engine-run-completeness/build-decision-1-*.md`
- `feat/715-retire-lite-workflows` `docs/plans/202610/logs/715-retire-lite-workflows/build-decision-1-*.md`, `build-group-gate-6-*.md`
- #705 — Build: plan-convert plan-current get their own numbered steps comments — https://github.com/cbartens/bkit/issues/705
- #699 — Engine run completeness check + auto friction/failure on errors — https://github.com/cbartens/bkit/issues/699
- #715 — Retire lite workflows; add build publish true/false — https://github.com/cbartens/bkit/issues/715

Implemented on `dev` as working-tree edits. Nothing is staged or committed yet.

**What changes**

1. **Per-test diff, not per-file.** New `.bkit/core/engine/commands/workflow/test-blocks.ts` finds a test by its name and indentation. It then follows the helpers, hooks and imports that test calls. `bkit tests green` only raises `test-changed` when *that test's* body, or code it runs, changed since its red. The Changed-since-red value is now one of `test body`, `code it runs`, `outside the test only` (no gap), or `added lines only` (whole-file fallback when the name can't be found). Editing a neighbouring test in a shared file no longer raises a false question.
2. **Lint before red.** New package script `bkit:lint:file` (this repo: oxlint with the test config). `bkit tests red` lints the test first. If lint fails, the red is refused with `refused: "lint"` and nothing is recorded. So a lint rewrite can no longer land *after* the red and look like a test change. Note: re-recording a red after such a rewrite was never an option, because the test then passes. If the script is undeclared, the red still runs with a note, and install shows a new `lint-file-script-missing` advisory.
3. **Already landed.** A red refused because the test already passes is now recorded as a `build-task-red-passed` row. The row holds the test, the commit the run was on, and which files were uncommitted at the time. At green, the test is reported as "already landed by TASK m", with no gap, only when all three of these hold:
   - another task's code commit was already in history at that moment;
   - that commit touched one of this task's CREATE/UPDATE files;
   - none of this task's own files were uncommitted.

   Otherwise it stays a `no-red` gap, with the reason spelled out. That covers the 701 TASK 14 case (code written before the red in the same group). The audit report gets an "Already landed" section, and the JSON gets an `alreadyLanded` list.
4. **"Can this test fail?" stays prose, not a run.** Tests are not run in plan mode. Instead, `bkit-plan-review-2` flags a TEST FIRST test whose logic already passes against current or earlier-task code as CRITICAL: a task adding behaviour must name a new test. Both challenge reviewers must read the test's logic against the code the diff leaves, and the test must fail there. The execute and verify prompts handle the passed refusal and the new Changed-since-red values.

Docs: `.bkit/workflows.md`, `prompts.md`, `templates.md`, `install.md`, `docs/migrations.md` (detect-only guard), shared `testing.md`, CHANGELOG.

**Checks:** typecheck, lint and prettier are clean, and so is the instructions check. The full vitest suite passes: 207 files, 8248 passed, 1 skipped. The mirrors were refreshed by `bkit upgrade`, and `bkit check` is clean.

Committed on `dev` as 5d34db5f4 (not pushed yet). It contains the changes described in the comment above. All pre-commit hooks passed, including prettier and the `dist/` freshness check. Closing as done.

Causes 6–8 are fixed on dev in 5d5ef8656 (not pushed yet).

**6. The test-first audit couldn't run `.bats` or `.mjs` tests.** `bkit:test:file` now goes through `scripts/ci/bkit-test-file.mjs`, which picks the runner from the file type: bats for `.bats`, `node --test` for `.mjs`, vitest for everything else. Each one writes its JUnit report to `$BKIT_TEST_REPORT` when that variable is set. When it is unset, no report flag is passed at all. Before this, an empty value made the runner treat the test file as the report path and overwrite it. `bkit:lint:file` now exits 0 on files Oxlint doesn't cover (`--no-error-on-unmatched-pattern`). `scripts/harvest/bkit-harvest.test.mjs` moved onto `node:test` so it emits real test cases. The shipped guidance in `.bkit/shared/docs/testing.md` covers both points for consumers.

**7. A CONCERNS verdict with rounds left asked the owner first.** Build sub-step 11 now goes straight to the Step 9 fix round whenever verify returns gaps and a round is left. The `VERIFY_LOOP` Decision Pause is gone from the workflow. The owner is asked only when rounds run out (`VERIFY_GAPS`) or when a gap can't be fixed. The engine still accepts `decisions compose --loop=verify`, because runs already in flight (699, 715) use their own copy of the old workflow text. **Follow-up:** remove that engine path once 699 and 715 have landed. The ledger refused this as a deferral row because it came from outside a build or ship run, so it is recorded only here.

**8. After a group-gate failure, the fixer ran only targeted tests.** On a gate failure, Step 9 now passes the exact gate command to the fixer (`bkit-build-plan-gaps-remediate`). The fixer has to re-run it after each fix until it exits 0, search for other tests that rely on the same broken assumption, and log `DONE — Group gate: exit 0 (log)` or `BLOCKED — Group gate: reason`. Without that line it cannot report PASS. Only the prompt enforces this, not the engine; Step 8's own gate re-run is still the real check.

**Not changed:** the full gate still runs once per group. "One question per test" was dropped. The doubled questions came only from the runner problem in cause 6, and merging them would put two different decisions into one question: allowing a test-order exception, and accepting a test that isn't green.

**Tiers run:** `pnpm bkit:gate:static-unit-integration` exit 0 (unit 6619 passed / 1 skipped, integration 1672 passed, bats 32/32). `bkit check` exit 0. New `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` passes 10/10.

### Follow-up: the last challenge round no longer stops to ask "fix now?"

**What was wrong.** In the 699 run, round 2 of the build challenge found one fixable MEDIUM problem (task 25). The run recommended "Fix now" itself, but still stopped to ask, because the last challenge round was written never to fix anything without the owner saying so. That is the same kind of stop this issue already removed from the verify step. Nothing recorded why the last round had to ask.

**What changed (not committed yet).**
- `bkit challenge merge` (`.bkit/core/engine/commands/workflow/challenge.ts`) now returns `fix` whenever every new task is fixable, in any round. It returns `pause` only when a task can't be fixed by an agent, or when there are more findings than one merge can take.
- `.bkit/core/workflows/bkit-build.md` Step 11: a `fix` in the last round sets `CHALLENGE_DONE`, so after the fix group the run goes on to the test run instead of starting a third challenge round. The Decision Pause asks only about unfixable tasks.
- If a run is stopped and resumed after the fix starts, it already picks up the right place: a last-round challenge followed by `build-plan-execute` counts as done (new case in `step-table.test.ts`).
- The catalogue text in `.bkit/core/.bkit/workflows.md` and `.bkit/core/.bkit/pipeline.md` is updated to match.
- A fix made in the last round still goes through the test-first audit, verify and the test run. Challenge reviewers don't look at it again.

**Tests.** Unit: `challenge.test.ts`, `step-table.test.ts`, `workflow-shape.test.ts`, `render/trackers.test.ts` (build baseline refreshed), 409 passed. They failed before the engine change. `tsc` is clean.

**Not done yet.**
- Not committed, because another agent is editing `workflows.md` and `pipeline.md` at the same time.
- The `.claude` / `.cursor` / `.opencode` copies have not been regenerated with `bkit install`, for the same reason.
- A run still using the old workflow text that reaches a fixable last-round finding would fix it, then try a third round and end in the Failure Path. Resuming that run puts it on the new text, which goes straight to the test run.

**Other stops of the same kind (not changed).** These ask "another fix round?" while rounds are left, even when the last round made progress:
- build test loop (Step 12, `TESTS_LOOP`)
- debug fix loop (`Q1 — Fix: another fix attempt?`) and soak loop
- ship merge fix round (`Q1 — Merge`)

Kept on purpose: test-order gaps (only the owner can grant a test exception), a fix round that changed nothing, and the round limit running out.

### Follow-up 2: fix loops ask only when there is something to decide

This covers everything since the commit that fixed the verify step (5d5ef8656). It includes the challenge change from the previous comment, so it replaces that one as the record. **Nothing is committed yet** (see "Not done" below).

**The rule now.** A run stops to ask only when one of these is true:
- something only the owner can decide: a test exception, accepting a gap, a finding no agent can fix
- the last round made no progress
- a real review gate, such as the design interview or the draft acceptance

The `maxAttempts` limits haven't changed. Running out of rounds still goes to the Failure Path; it never turns into a question.

"Made no progress" is worked out by `bkit counters progress`, not judged by an agent. It reports `stuck` (no fewer failures, or the code didn't change) or `worse` (more failures than the first round). A first round, or a round with fewer failures, counts as progress.

#### 1. Build challenge, last round (Step 11)
- **Before:** every finding in the last round stopped the run with "Fix now?", even fixable ones where the run itself recommended "Fix now". Task 25 in the 699 run is the example.
- **Now:** `bkit challenge merge` returns `fix` whenever every task is fixable, in any round. It pauses only for an unfixable task, or when there are more findings than one merge takes. A fix in the last round marks the challenge as finished, so the run goes on to the test run instead of starting a third round. That fix still goes through the test-first audit, verify and the test run; the challenge reviewers don't look at it again.
- **Files:** `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/workflows/bkit-build.md` (Limits line, Decision Pause items, Step 11 sub-step 6).

#### 2. Build test loop (Step 12)
- **Before:** every failed test round with a round left stopped at the Decision Pause with "Another fix round?".
- **Now:** Step 12 runs `counters progress --check=build-run-tests --fix=build-failure-remediate`. On `stuck` or `worse` it goes to the Decision Pause (`TESTS_LOOP`). Otherwise it goes straight to Step 13, diagnose and fix.
- **File:** `.bkit/core/workflows/bkit-build.md`.

#### 3. Debug fix and soak loops (Loop Question)
- **Before:** "another fix attempt?" before every fix attempt from the second one on, and before every soak attempt, including the first.
- **Now:** the Loop Question first runs `counters progress --check=debug-run-tests --fix={LOOP_FIX}`. Unless the trend is `stuck` or `worse`, it records that the attempt was taken without asking, with the failure counts, and carries on. When it does ask, the question now reads "Stop here instead of another attempt?" with Stop recommended, so a plain "yes" still means the recommended answer.
- **File:** `.bkit/core/workflows/bkit-debug.md` (Loop Question, Step 3 sub-steps 4 and 5, gate).

#### 4. Ship merge fix round (Step 11)
- **Before:** "Run a fix round?" after every failed merge.
- **Now:** the diagnosis verdict decides. `PASS` (root cause found, concrete fix) → the fix round runs without asking. `CONCERNS` or `FAIL` → it asks "Stop here instead of a fix round?" with Stop recommended.
- **File:** `.bkit/core/workflows/bkit-ship.md` (Step 11, Gate 11).

#### Docs
- `.bkit/core/.bkit/workflows.md`: the Step 11 and Step 12 rows, the Decision Pause intro, the Ask points table, the Loop question line, the debug Step 3 row and the loop limits table. That includes the verify row, which still said "Decision Pause before each further round" after the verify fix.
- `.bkit/core/.bkit/pipeline.md`: the challenge merge line.

#### Tests
- **New or changed unit tests:**
  - `challenge.test.ts`: a fixable task in the last round → `fix`; an unfixable one → `pause`.
  - `step-table.test.ts`: a run stopped and resumed after a last-round fix goes on to the test run.
  - `workflow-shape.test.ts`: one shape test per loop.
- **Red first:** each new test failed before the change and passes now.
- **Last full run:** unit tests across `.bkit/core/engine/audits`, `render` and `commands/workflow` (1421 tests) all passed, before another agent's in-progress edits landed. `tsc` and prettier are clean.

#### Not done
- **Not committed:** another agent is editing the same files in parallel: the three workflow files (changing wording to "ALWAYS" / "NEVER"), `workflows.md`, `pipeline.md` and the rules template. Its edits are in progress and currently fail 5 render baseline tests and the rules parity test. My changes need to be committed apart from its edits, or after it finishes.
- **Copies not regenerated:** the `.claude` / `.cursor` / `.opencode` copies haven't been rebuilt with `bkit install`, for the same reason.
- **Runs already under way:** runs still on the old workflow text keep asking the old questions until they're restarted or resumed. One case ends badly: a run on the old text that hits a fixable last-round challenge finding will fix it, then try a third round and end in the Failure Path. Resuming that run puts it on the new text, which goes straight to the test run.
