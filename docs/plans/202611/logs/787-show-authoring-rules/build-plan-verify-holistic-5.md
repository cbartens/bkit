Verdict: FAIL
Failures: 9
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (groups 1, 2 and 3; the plan has 3 groups).

## Integration Gaps

8 integration gaps, all `Fixable: false`, one per failing test, with one root cause:

1-8. **The full-suite gate fails on load-dependent timeouts in suites this plan does not own (TASK 12, group 3).** The gate's `related` run (16:47-17:05, load average 35-60 on 10 cores while other repos' gates ran) timed out 8 tests at 67800 ms: 2 in `tracker.integration.test.ts`, 1 in `check.integration.test.ts`, 2 in `install.integration.test.ts` and 3 in `upgrade.integration.test.ts`. The same 8 tests pass in the same gate's `named` run on the same tree minutes later (227 files, 9266 passed, 2 skipped), so this change did not break them. No failing test is a planned case or sits in a file this plan changed. The holistic-3 and holistic-4 remediation rounds hit the same timeouts in the same files and logged them BLOCKED. Under the plan, a retry pass does not count as success and global timeout policy stays separate. A fix round therefore has nothing in scope to change. The owner decides: rerun the gate on a quiet machine, accept the failures, or authorise separate timeout work.

The holistic-4 root cause is closed. The analysis deadline in `.bkit/core/hooks/guardrails-shell.js` now counts the process's own CPU time (`process.cpuUsage`), with a 4x wall-clock backstop. `retains lexical context for nested shell edits` (TASK 1) passed in both gate runs at load average 35-60, and `stops at the cooperative deadline and keeps earlier targets` still passes. Cross-group contracts still hold. `pnpm bkit check` exits 0, so the four re-rendered guardrails copies (`.claude/`, `.cursor/`, `.codex/`, `.agents/plugins/bkit/`) match their source. All 28 Derived Test Matrix tests sit in their named target files, and every hook, adapter, install and merge suite passed in both runs.

## Previously Attempted

- Holistic attempt 1: `build-plan-verify-holistic-1.md` (CONCERNS, 4 integration gaps), remediated in `build-plan-gaps-remediate-holistic-1-log.md`; owner decision `build-decision-1-5.md` sent `stops analysis at each internal bound` back to the tests step.
- Holistic attempt 2: `build-plan-verify-holistic-2.md` (CONCERNS, 6 gaps), remediated in `build-plan-gaps-remediate-holistic-2-log.md` (commit 5c5aba58d).
- Holistic attempt 3: `build-plan-verify-holistic-3.md` (CONCERNS, 3 gaps, TASK 4 timeout under the full gate), remediated in `build-plan-gaps-remediate-holistic-3-log.md` (commit 13a13c0a1, private TMPDIR for hook test files in `vitest.setup.ts`).
- Holistic attempt 4: `build-plan-verify-holistic-4.md` (CONCERNS, 3 gaps sharing one root cause: the 200 ms wall-clock analysis deadline dropped `src/real.ts` in `retains lexical context for nested shell edits` under load). Remediation `build-plan-gaps-remediate-holistic-4-log.md` (commit 5a7f84680) moved the deadline onto process CPU time with a 4x wall-clock backstop, re-rendered the four guardrails copies, and logged the group gate BLOCKED on unrelated load timeouts (`tracker.integration.test.ts`, `check.integration.test.ts`, `upgrade.integration.test.ts`).
- Per-group rounds: group 1 `build-plan-verify-1-1.md` to `-1-4.md`, group 2 `build-plan-verify-2-1.md` to `-2-3.md`, group 3 `build-plan-verify-3-1.md` to `-3-6.md` (each final PASS).

## Notes

- Mode `Holistic`: all 3 groups and 13 tasks, and every task carries `[x]` in the plan. The only shipped change since holistic-4 is commit 5a7f84680. It moves the `guardrails-shell.js` deadline onto CPU time, with `startWall` / `startCpu` and a 4x wall backstop, and re-renders the four guardrails copies and `.bkit/version`. The run's diff `tmp/bkit-diff-787-show-authoring-rules.md` has partial diff coverage, so I read the commit with `git show` / `git diff 42fbdeba9 5a7f84680`.
- **`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`** (run once, with `LOCAL_STACK_LOCK_WAIT_S=5400` so it could queue for the machine lock) waited about 17 min for the lock, then exited 1 with `failed: related`. Related run: 8 failed, 9289 passed, 2 skipped (229 files, 1075 s). Named run: 227 files, 9266 passed, 2 skipped (464 s). Node, lint, format and typecheck passed. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/tests-changed-5.log`. `pnpm bkit check` exited 0 with advisories only and left the tree clean (log `bkit-check-5.log` in the same scratchpad).
- **Tasks line:** TASK 1 is now met, because its four cases passed in both runs under heavy load. TASKS 2-11 and 13 stay met, because every named case passed in both runs. TASK 12 is left off, because only the full-suite part of its DONE WHEN fails (see the gaps log). The rest of TASK 12 holds: both parity cases pass, and `pnpm bkit check` exits 0. The build and fresh scratch-consumer dogfood of `build-plan-gaps-remediate-holistic-3-log.md` still cover the shipped surface: `dist/` and `package.json` are unchanged since 13a13c0a1, and the only payload change, `guardrails-shell.js`, reaches consumers through the install integration suites that passed in the named run.
- **Deadline design note, no gap:** `stops at the cooperative deadline and keeps earlier targets` mocks `Date.now` with +1000 ms, so the case now trips the 800 ms wall-clock backstop, not the 200 ms CPU path. No test drives the CPU-time path directly. TASK 3's "cooperative 200 ms deadline" is now 200 ms of CPU time, with a stalled process cut off after at most 800 ms of wall time. `bounds rendered cold-start time and complete response size` still holds every adapter within min(1 s, a quarter of its timeout). The holistic-4 gap text proposed this approach.
- **Derived Test Matrix:** all 28 rows have their named test in the named target file, inside the owning task's TEST FIRST, and all 28 passed.
- **Documentation Updates:** all five rows remain done. On errors, the hooks stay fail-open with no new log store, which matches the plan's Observability pre-flight and `docs/observability.md`.
- **Decision records:** `build-decision-1-1.md` to `build-decision-1-5.md` all chose Fix now or Try again. None of them accepts a gap in this report, and no `Accept (assumed)` record exists.
- **Test-first audit:** none supplied for this round. Unproven from earlier rounds: TASK 13 `upgrades shipped registrations without dropping consumer hook groups or permissions`, which the owner answers at the end of the build.
- **Machine contention:** the lock log shows other repos' runs holding the tests lock back to back. A further bkit gate (`891-build-gate-stuck`) was running while the related run was executing. The run's cloud-setup also reported `db unavailable: 3 GB free, needs 10 GB`, which means the disk is low.
- **Out-of-scope observation carried from holistic-2, not logged:** `mergeManagedList` drops a consumer hook group whose command runs a file named like a template's bkit hook. The plan does not decide whether such a group is the consumer's own.

## Identified Gaps Log

9 gaps, all `Fixable: false`, sharing one root cause: the full-suite gate's `related` run timed out 8 tests in 4 files at 67800 ms while other repos' gates ran on the shared machine (load average 35-60 on 10 cores, 16:47-17:05). All 8 pass in the same gate's `named` run on the same tree (227 files, 9266 passed, 2 skipped), none sits in a planned test or a file this plan changed, and the plan keeps global timeout-policy changes separate. Closing the gap needs an owner choice the plan does not make (rerun the gate on a quiet machine, accept the load-dependent failures, or authorise out-of-scope timeout work).

- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps clean build progress and completion to two comments` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/install/check.integration.test.ts` `clean install → check exits 0` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/install/install.integration.test.ts` `` `bkit install --tracker=jira` alone switches the tracker on every installed host `` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/install/install.integration.test.ts` `` `bkit install --claude --tracker=github` also re-renders the installed cursor host `` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `an install with every host and cloud lane creates no template outside .bkit/templates/` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `check flags an old marker; upgrade restamps every marker with no conflict; check is then clean` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- INTEGRATION: full-suite gate (TASK 12, group 3) vs unrelated suites under machine load: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade creates a file a newer release adds to an installed opt-in host (#550)` timed out (67800 ms) in the related run; passes in the named run on the same tree — Fixable: false
- TASK 12: DONE WHEN "Report known load-dependent failures from the full suite; an isolated or retry pass does not establish full-suite success" — `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 (`failed: related`) on the 8 load-dependent timeouts above; every planned Unit and Integration case passes in both runs, so only the full-suite part is unmet, and the passing named run cannot stand in for it — Fixable: false
