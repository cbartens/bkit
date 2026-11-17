Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (groups 1, 2 and 3; the plan has 3 groups).

## Integration Gaps

1 integration gap, `Fixable: true` (plus the TASK 1 and TASK 12 DONE WHEN entries that share its root cause):

1. **TASK 3's wall-clock analysis deadline drops a TASK 1 target under load (groups 1 and 3).** `guardrails-shell.js` stops analysis 200 ms after `newEvidence` by `Date.now()`. In the gate's named run, at load average 24.4 on 10 cores, the rendered Cursor hook hit that deadline on the trivial heredoc command in `retains lexical context for nested shell edits` and reported an analysis limit instead of `src/real.ts`. The test passed in the related run earlier in the same gate, so it is load-dependent. TASK 12 requires the full suite to pass without counting a retry, and the plan directs repairing load failures in this suite.

The holistic-3 root cause is closed: `prepares complete advice without acknowledging it` (TASK 4) passed in both the related and named runs with the private hook TMPDIR from `vitest.setup.ts`. Cross-group contracts re-checked and holding: `pnpm bkit check` exits 0, so the installed copies match their sources. All 28 Derived Test Matrix tests sit in their named target files. No shipped file changed since holistic-3, which verified the hook, adapter, install and merge integration.

## Previously Attempted

- Holistic attempt 1: `build-plan-verify-holistic-1.md` (CONCERNS, 4 integration gaps), remediated in `build-plan-gaps-remediate-holistic-1-log.md`; owner decision `build-decision-1-5.md` sent `stops analysis at each internal bound` back to the tests step.
- Holistic attempt 2: `build-plan-verify-holistic-2.md` (CONCERNS, 6 gaps), remediated in `build-plan-gaps-remediate-holistic-2-log.md` (commit 5c5aba58d).
- Holistic attempt 3: `build-plan-verify-holistic-3.md` (CONCERNS, 3 gaps sharing one root cause: the TASK 4 case `prepares complete advice without acknowledging it` timed out in the full gate). Remediation `build-plan-gaps-remediate-holistic-3-log.md` (commit 13a13c0a1, verdict FAIL) gave every `audits/hooks/` test file a private TMPDIR in `vitest.setup.ts`, fixed gaps 1-2, and left gap 3 (TASK 12 full-suite gate) BLOCKED with no clean gate run on the final tree.
- Per-group rounds: group 1 `build-plan-verify-1-1.md` to `-1-4.md`, group 2 `build-plan-verify-2-1.md` to `-2-3.md`, group 3 `build-plan-verify-3-1.md` to `-3-6.md` (each final PASS).

## Notes

- Mode `Holistic`, all 3 groups and 13 tasks; every task carries `[x]` in the plan. The only change since holistic-3 (`git diff 083ecc7ca HEAD`) is commit 13a13c0a1: `vitest.setup.ts` gives each `audits/hooks/` test file a private TMPDIR, which is removed after the file. It is a test-environment change. It raises no timeout, skips no test, edits no planned test and is not shipped (`package.json` `files` excludes it). The run's diff `tmp/bkit-diff-787-show-authoring-rules.md` is partial, so the commit was read with `git show`.
- **`pnpm bkit check`** (read-only) exited 0 with advisories only. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/bkit-check-4.log`.
- **`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`:** the first two runs exited 81 after 1200 s each, waiting on the machine-wide tests lock held by other repos' runs (logs `tests-changed-4.log`, `tests-changed-4b.log`). The third run, with `LOCAL_STACK_LOCK_WAIT_S=5400` so it could queue, exited 1. Related run: 229 files and 9297 tests passed. Named run: 1 failed, 9265 passed, 2 skipped. Node, bats, lint, format and typecheck passed (`failed: named` only). The single failure is the deadline case logged above. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/tests-changed-4c.log`. Holistic-3 remediation's failures in `upgrade.integration.test.ts`, `locks.test.ts`, `tracker.integration.test.ts` and `machine-lock.integration.test.ts` did not recur.
- **Tasks line:** TASK 4 is now met, because its two cases passed in the full gate. TASK 3 stays met, because its three named cases pass, though the deadline it added is the root cause of the TASK 1 failure. TASKS 1 and 12 are left off.
- **Derived Test Matrix:** all 28 rows have their named test in the named target file, inside the owning task's TEST FIRST. Only the TASK 1 row failed, and only under load.
- **Documentation Updates:** all five rows remain done. Errors: the hooks stay fail-open with no new log store, which matches the plan's Observability pre-flight and `docs/observability.md`.
- **Decision records:** `build-decision-1-1.md` to `build-decision-1-5.md` all chose Fix now or Try again. None accepts a gap here, and no `Accept (assumed)` record exists.
- **Test-first audit:** none supplied for this round. Unproven from earlier rounds: TASK 13 `upgrades shipped registrations without dropping consumer hook groups or permissions`, which the owner answers at the end of the build.
- **Out-of-scope observation carried from holistic-2, not logged:** `mergeManagedList` drops a consumer hook group whose command runs a file named like a template's bkit hook. The plan does not decide whether such a group is the consumer's own.

## Identified Gaps Log

3 gaps, all `Fixable: true`, sharing one root cause (the 200 ms analysis deadline is wall-clock time, so machine load alone can trip it on a trivial command).

- INTEGRATION: TASK 3 (group 1, `.bkit/core/hooks/guardrails-shell.js` `EVIDENCE_LIMITS.deadlineMs: 200` measured with `Date.now()` from `newEvidence`) vs TASK 1's planned test and the full-suite gate TASK 12 (group 3) requires: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 with `failed: named` and one failure in 9268 tests: `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `retains lexical context for nested shell edits` — line 246 `expected ... to contain 'src/real.ts'`; the rendered Cursor hook answered `Analysis limit reached (analysis took longer than 200 ms)` for `cat > src/real.ts <<'EOF' ...` at load average 24.4 on 10 cores. The same test passed in the gate's related run minutes earlier, so the failure is load-dependent, and the plan says an isolated or retry pass does not establish full-suite success and directs repairing load failures in this suite. Make a trivial command finish its analysis regardless of scheduler contention without raising test timeouts, removing the deadline or loosening the assertion (for example, count the cooperative deadline in the process's own CPU time rather than wall-clock time, keeping `stops at the cooperative deadline and keeps earlier targets` green, or have the tests step give the lexical cases a deadline they cannot hit) — Fixable: true
- TASK 1: DONE WHEN "The four named rendered-hook cases pass for the full direct-command corpus" is not met in the full gate run: `retains lexical context for nested shell edits` lost its exact target to the analysis deadline under load (see the INTEGRATION entry above) — Fixable: true
- TASK 12: DONE WHEN "with all planned Unit and Integration cases passing ... Report known load-dependent failures from the full suite; an isolated or retry pass does not establish full-suite success" is not met: the full gate run fails the planned TASK 1 case under load (see the INTEGRATION entry above). The rest holds: `pnpm bkit check` exits 0 on the current tree, and the build plus fresh scratch-consumer install of all five hosts and its `bkit check` passed in `build-plan-gaps-remediate-holistic-3-log.md`; the only later change, `vitest.setup.ts`, is not in the shipped `files` list, so that dogfood still covers the shipped surface — Fixable: true
