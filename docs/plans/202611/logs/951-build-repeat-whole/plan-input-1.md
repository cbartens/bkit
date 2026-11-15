## Session Prompt — this run's, newer than everything below

/bkit-plan #951

## Issue description — oldest

### Narrative

**Rule:** while a build works, it tests only what changed. The full suite runs once, at Step 12, after everything is built and verified. The Step 16 push does not run it again when Step 12 already passed on the same code. CI on the PR still runs everything.

**Why.** Since commit `6fc6a44b8` ([#889 — Build: a holistic verify FAIL aborts the run instead of fixing it](https://github.com/cbartens/bkit/issues/889)), Step 10 (holistic verify, the whole-feature check after the last group) runs as a check → fix → check loop, and again after every Build Challenge round that adds fix groups. The loop catches real problems. The cost is the tests each round runs.

Measured from the Claude Code transcripts of all 12 holistic check and fix agents in `923-pre-push-block` (14 Nov):

<!-- prettier-ignore -->
|  | Minutes | Share |
| --- | --- | --- |
| Running or waiting on tests (including `tests` lock waits and polling loops) | 372 | 84% |
| `pnpm bkit:generate` | 35 | 8% |
| Reading logs, judging, writing reports | 35 | 8% |

- The cause is the verify prompt's `bkit tests changed --base=origin/dev`. It runs the tests for every file the feature changed (40 files by the end), on every round.
- Holistic check 4 took 107 minutes. About 100 of them were three tries at that run, stuck behind another build's lock. The 7 test files that mattered then ran in 3.7 minutes.
- Step 12's full suite took 8 minutes in the same build.
- 923 ran 8 holistic checks, not 6. The first run failed at 06:02 and restarted. The restart counted from 1 again and overwrote `build-plan-verify-holistic-1.md` and `-2.md`.

**The same waste in four more places:**

- **Holistic limit.** It counts against `build.verify.maxAttempts`, which is 2 by default (`.bkit/core/engine/shared/settings.ts:209`) and 5 in bkit's own `package.json`. `--since-clean` resets the count after every check that passes, and a restart resets it as well. The worst case is 15 checks per run. Every other limit is 2 with no reset.
- **Step 8 group gate.** It runs the whole `bkit:gate:static-unit` after every group but the last.
- **Debug soak.** After a fix, `bkit-debug-failure-soak` runs the whole `pnpm bkit:gate:static-unit`, and debug Step 3 then runs the full suite again. `bkit-debug-failure-remediate` already runs only `bkit tests changed`.
- **Push.** After Step 12 passes, the Step 16 push runs `bkit:gate:static-unit-integration` again in `.husky/pre-push`. The only difference is the close commit's logs and ledgers. `bkit ci push-gate` receipts cannot carry Step 12's pass across, because a new branch with code always runs the full gate (`.bkit/core/engine/commands/ci/push-gate.ts` `hasVerifiedIncrement`).

**What changes:**

1. **Holistic tests.** The first holistic check tests the whole feature's changed files (`--base=origin/dev`). Each later check tests only the files changed since the commit of the last holistic check that found no problems. A check that found gaps never moves this starting commit: the changes it checked are not proven yet, so the next check tests them again together with the fix.
2. **Holistic limit.** It becomes one allowance per build: a new ask point `build.holistic` (`ask: true`, max 2). It counts holistic fix rounds across every run of the build and never resets. Each fix round is followed by one check, so a build runs at most 1 + 2 challenge rounds + 2 fix rounds = 5 holistic checks. Every limit is 2: bkit's own `package.json` `build.verify.maxAttempts` goes from 5 to 2, and an upgrade migration lowers any consumer's `build.verify.maxAttempts` above 2 to 2.
3. **Group gate.** Step 8 tests only the group's own changes, since the group's start commit (`GROUP_BASE`), and still writes its `build-group-gate` row.
4. **Debug soak.** Step 6 of `bkit-debug-failure-soak` runs `bkit tests changed --fallback=bkit:gate:static-unit`, the same as remediate.
5. **Step 12 proof.** A Step 12 pass records a full-gate receipt for its commit. The Step 16 push of the new feature branch skips the full gate when every commit after that one touches bookkeeping paths only.
6. **Holistic report numbers.** Holistic reports and fix-round logs are numbered across every run of the build, the same way the allowance counts. Today the number comes from `counters derive --step=build-plan-verify-holistic --position=next`, which counts only the current run, so a restart starts from 1 again and writes over the earlier run's `build-plan-verify-holistic-{N}.md` and `build-plan-gaps-remediate-holistic-{N}-log.md`.

**What it costs.** A break far from the change shows up at Step 12 instead of earlier, and Steps 13–14 fix it there. This covers repo-wide checks (`bkit:lint:prose`, `bkit:slop:delta`, `format:tables:check`), the coverage floor, and tests that read files by folder instead of importing them. Two of 923's three holistic gaps were this kind: `.bkit/core/engine/render/trackers.test.ts` and `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`. If a build stops early, its code can hold a failing test outside the change, but pre-push and CI still run everything before anything merges.

### Success Criteria

- A repeat holistic check runs only the tests for files changed since the last holistic check that found no problems. The first check covers the whole feature diff.
- Holistic fix rounds count once per build, across restarts, with no reset. The third fix round the build needs goes to the Decision Pause (or to the Failure Path when `ask` is false). A restart writes no holistic report or fix log over one from an earlier run.
- The Step 8 group gate and the soak agent's post-fix run check only changed files. Build Step 12 and debug Step 3 still run the full suite.
- After Step 12 passes, the Step 16 push skips the full pre-push gate when the commits after the Step 12 commit touch bookkeeping paths only. Any code change after it runs the full gate.
- On a build shaped like 923 (two challenge rounds, each adding a fix group), the repeat holistic rounds take at least half less time, measured from the step rows with owner waits excluded.

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

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `build.holistic` defaults to `ask: true`, max 2 | unit | `.bkit/core/engine/shared/settings.test.ts` |
| Holistic fix rounds count across runs and do not reset after a clean check | unit | `.bkit/core/engine/commands/workflow/counters.test.ts` |
| The last-clean holistic base is the `parentSha` of the newest holistic row with 0 failures, else `origin/dev` | unit | `.bkit/core/engine/commands/workflow/status.test.ts` |
| A holistic row with gaps does not move the base | unit | `.bkit/core/engine/commands/workflow/status.test.ts` |
| Upgrade lowers `build.verify.maxAttempts` above 2 to 2 and leaves 2 or less alone | integration | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| `tests run --changed-since` runs `bkit:gate:changed` on the files changed since that commit and writes a `test-run` row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| A passing `tests run` of the required push gate on a clean tree records a push-gate receipt | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| A new branch whose only commits after a receipted ancestor are bookkeeping qualifies for the minimum push gate | unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` |
| A new branch with code after the receipted ancestor still needs the full gate | unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` |
| The holistic verify prompt takes its test base from Context, not `origin/dev` | unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` |
| The build Step 8 group gate runs the changed-files scope from `GROUP_BASE` | unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` |
| The soak prompt runs `bkit tests changed --fallback=bkit:gate:static-unit`, with the exit-81 line | unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` |
| Step 10 derives the holistic report number with `--all-runs`, at sub-step 1 and at the sub-step 7 resume read-back | unit | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Limits and the holistic base
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** One holistic allowance per build
  - **UPDATE:** `asks` in `.bkit/core/engine/shared/settings.ts`: add `build.holistic` (`ask: true`, max 2)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.ts`: count `build-plan-gaps-remediate-holistic` rounds across every run of the build, with no `--since-clean` reset
  - **UPDATE:** `package.json`: `bkit.workflows.build.verify.maxAttempts` 5 → 2
  - **DONE WHEN:** `counters route --point=build.holistic` exits 1 on the third holistic fix round of a build, including across a restart
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/settings.test.ts` `build.holistic defaults to ask true, max 2` fails on the missing ask point
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `holistic fix rounds count across runs without a reset` fails on the count restarting after a clean check
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Read the last clean holistic commit
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: print the `parentSha` of the newest `build-plan-verify-holistic` row with 0 failures, across runs, else `origin/dev`
  - **DONE WHEN:** Step 10 can hold the printed value as `HOLISTIC_BASE`, and a check with gaps leaves it unchanged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `last clean holistic base is the newest zero-failure row` fails on no such output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `a holistic row with gaps does not move the base` fails on no such output
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Upgrade lowers verify limits above 2
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: a migration called by `seedCorePackageJsonScripts` sets `package.json` `bkit.workflows.build.verify.maxAttempts` above 2 to 2, logs one line naming the old value, keeps the original indent, and leaves 2 or less alone
  - **UPDATE:** `docs/migrations.md`: one row for it
  - **DONE WHEN:** `bkit upgrade` on a `package.json` with `maxAttempts: 5` writes 2, and a second run writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrade lowers build.verify.maxAttempts above 2 to 2` fails on the value kept at 5
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->
### TASK GROUP 2: Changed-files test runs and push proof
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Changed-files scope for `tests run`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: `tests run --changed-since=<sha>` runs `bkit:gate:changed` on the files changed since that commit (the `--gate` when it is undeclared) and writes the same `test-run` row
  - **READ:** `.bkit/core/engine/commands/workflow/tests-changed.ts`: `changedFiles`
  - **DONE WHEN:** a group gate row records the changed-files scope
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since runs the changed gate on changed files and writes a test-run row` fails on the unknown flag
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Step 12 records a full-gate receipt
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: a passing run of the gate `requiredPushGate` names, on a clean tree, writes the push-gate receipt for HEAD
  - **READ:** `.bkit/core/engine/commands/ci/push-gate.ts`: receipt format and `runPushGate`
  - **DONE WHEN:** after Step 12 passes, the receipt for its commit exists
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a passing required push gate records a receipt` fails on no receipt
<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->
- [ ] **TASK 6:** A new branch reuses a receipted ancestor
  - **UPDATE:** `hasVerifiedIncrement` in `.bkit/core/engine/commands/ci/push-gate.ts`: a new branch qualifies when it has a receipted ancestor and every commit after it touches min-push paths only
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: `min-push` uses it for new-branch updates
  - **DONE WHEN:** the Step 16 push of a build whose Step 12 passed runs `bkit:gate:min`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a new branch with only bookkeeping after a receipted ancestor takes the minimum gate` fails on the full gate
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a new branch with code after the receipted ancestor needs the full gate` fails on a wrongly accepted push
<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->
### TASK GROUP 3: Workflows and prompts
<!-- bkit:task 7 start -->
- [ ] **TASK 7:** Holistic checks test only what changed
  - **UPDATE:** Step 10 in `.bkit/core/workflows/bkit-build.md`: hold `HOLISTIC_BASE` (Task 2) and pass it in the verify Context; route sub-step 6 and the Decision Pause grant on `build.holistic`, without `--since-clean`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the holistic test run uses the Context's test base instead of `origin/dev`
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** a repeat holistic check runs `bkit tests changed --base=<last clean commit>`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `holistic verify takes its test base from Context` fails on `--base=origin/dev`
<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->
- [ ] **TASK 8:** The group gate tests the group's own changes
  - **UPDATE:** Step 8 sub-step 8 and the Step 9 gate command in `.bkit/core/workflows/bkit-build.md`: `tests run --changed-since={GROUP_BASE}`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the group gate's row scope names the changed-files gate
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `group gate runs the changed-files scope from GROUP_BASE` fails on the whole static-unit gate
<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->
- [ ] **TASK 9:** Soak tests only what it changed
  - **UPDATE:** step 6 and the `Verdict` lines in `.bkit/core/prompts/bkit-debug-failure-soak.md`: `bkit tests changed --fallback=bkit:gate:static-unit`, with the exit-81 line remediate has
  - **DONE WHEN:** the soak prompt names no whole-gate run
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `soak runs the changed-files gate` fails on `pnpm bkit:gate:static-unit`
<!-- bkit:task 9 end -->
<!-- bkit:task 10 start -->
- [ ] **TASK 10:** Holistic reports keep every run's number
  - **UPDATE:** Step 10 in `.bkit/core/workflows/bkit-build.md`: sub-step 1's `counters derive --step=build-plan-verify-holistic --position=next` and the sub-step 7 resume read-back (`--position=current`) both take `--all-runs`
  - **READ:** `.bkit/core/engine/commands/workflow/counters.ts`: `derive` already takes `--all-runs`
  - **DEPENDS ON:** 7
  - **DONE WHEN:** after a restart, the first holistic check writes `build-plan-verify-holistic-{N+1}.md`, where N is the earlier run's last number
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` `holistic report number counts every run` fails on the derive without `--all-runs`
<!-- bkit:task 10 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->
### TASK GROUP 4: Docs and decisions
<!-- bkit:task 11 start -->
- [ ] **TASK 11:** Docs state the new rule
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate (changed-files scope, Step 12 as the full check), the Step 10 row, the ask points table (`build.holistic`, every limit 2), § Local gate scripts
  - **UPDATE:** `docs/deployments.md`: the pre-push full-gate paragraph (Step 12 receipt reuse)
  - **DEPENDS ON:** 7, 8, 9, 10
  - **DONE WHEN:** no doc says the group gate runs the whole suite or that holistic rounds reset after a clean round
  - **TEST FIRST:**
    - n/a — docs only
<!-- bkit:task 11 end -->
<!-- bkit:task 12 start -->
- [ ] **TASK 12:** Record the decisions
  - **UPDATE:** `docs/decisions.jsonl`: one row for the rule (test what changed while building, one full run at Step 12, pre-push reuses it); update key `build-group-gate-unit-tier-only`; one row for the `build.holistic` allowance and every limit at 2
  - **DONE WHEN:** each decision has a row naming this issue
  - **TEST FIRST:**
    - n/a — ledger rows only
<!-- bkit:task 12 end -->
<!-- bkit:group 4 end -->

### Open Questions & Assumptions

- Assumed: `build.holistic` is a new ask point rather than a reuse of `build.verify`, so the holistic and group limits are counted apart. It needs no migration of its own: no consumer file sets it yet, so every consumer gets the default 2.

### Out of Scope

- Trimming the logs the holistic verifier reads (8% of the time).
- Running regen commands for mechanical gaps instead of a fix round (option E).
- Skipping the holistic check between challenge rounds (option D).
- The ship-time completeness check: [#840 — Ship deferred sweep: keep, slim, or drop after build verify?](https://github.com/cbartens/bkit/issues/840).

### References

- `.bkit/core/workflows/bkit-build.md` § Step 8 — Plan Verify, § Step 10 — Plan Verify Holistic, § Step 12 — Run Tests, § Step 16 — Close Workflow & Create PR
- `.bkit/core/workflows/bkit-debug.md` § Step 3 — Run Tests, § Step 8 — Failure Remediate Soak
- `.bkit/core/.bkit/workflows.md` § Group gate
- `docs/decisions.jsonl` key `build-group-gate-unit-tier-only`
- `docs/plans/202611/logs/923-pre-push-block/status.jsonl`
- [#889 — Build: a holistic verify FAIL aborts the run instead of fixing it](https://github.com/cbartens/bkit/issues/889)
- [#952 — Stats: split build time into work, tests, lock waits and owner waits](https://github.com/cbartens/bkit/issues/952)
- [#750 — Workflow optimisation](https://github.com/cbartens/bkit/issues/750)

## Issue comment — posted 2026-11-15T03:07:34.000Z

Rewrote the body as a change issue with the agreed scope, and moved the label from `next:design` to `next:plan`. The earlier body listed options A–E. The rewrite settles them into one rule: while a build works, it tests only what changed. The full suite runs once at Step 12, and the push reuses that pass.

**What the measurement showed.** I timed all 12 holistic check and fix agents in `923-pre-push-block` from their Claude Code transcripts. Tests (runs, `tests` lock waits and polling) took 372 of 442 minutes (84%). Reading and judging took 35 minutes, and `pnpm bkit:generate` took another 35. So the earlier open question "is it reading, tests or lock waits?" has its answer: it is tests. That points at scoping the test runs (old option B), not at trimming what the verifier reads.

**Scope added beyond the original issue:**

- One holistic allowance per build (`build.holistic`, max 2, counted across restarts, no reset). The earlier constraint "`build.verify.maxAttempts` stays as it is" no longer holds.
- The Step 8 group gate tests only the group's own changes.
- The debug soak agent's post-fix run uses `bkit tests changed`, the same as remediate.
- Step 12 records a full-gate receipt so the Step 16 push does not run the full suite again.

**Left out on purpose:** options D and E, trimming the verifier's inputs, and restarts overwriting earlier runs' holistic reports. That last one is a separate bug and needs its own issue.

Next step: `/bkit-plan #951`.
