Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (groups 1, 2 and 3; the plan has 3 groups).

## Integration Gaps

1 integration gap, `Fixable: true` (plus the TASK 4 and TASK 12 DONE WHEN entries that share its root cause):

1. **A planned group 1 test times out in the full-suite gate (TASK 4 vs TASK 12).** `gateguard-opencode.test.ts` `prepares complete advice without acknowledging it` ran 10339ms against a 9066ms limit in the named-test run of `bkit tests changed`. It passes alone (5.85s), but TASK 12's DONE WHEN says an isolated or retry pass does not establish full-suite success, and the plan directs repairing this file's TRIAGED load-flake if it shows up.

Cross-group contracts re-checked and holding: the installed copies now match their sources (`pnpm bkit check` exit 0, so holistic-2 gaps 1-3 are closed); the fetch-plus-edit case now lives in the parity corpus with assertions that match each host's budgeted outcome (holistic-2 gap 5 closed); the four installed GateGuard hooks and the OpenCode plugin load cleanly after the `isDogfoodAgentReadPath` rename, each with one `isAgentReadPath`.

## Previously Attempted

- Holistic attempt 1: `build-plan-verify-holistic-1.md` (CONCERNS, 4 integration gaps). Remediation `build-plan-gaps-remediate-holistic-1-log.md` fixed all four (commit 49d2878e2); owner decision `build-decision-1-5.md` sent `stops analysis at each internal bound` to the tests step, which re-recorded it (commit 2f529ffee).
- Holistic attempt 2: `build-plan-verify-holistic-2.md` (CONCERNS, 6 gaps: stale installed templates, hooks and rules block; TASK 11 and TASK 12 drift; the misnamed Codex fetch-plus-edit test). Remediation `build-plan-gaps-remediate-holistic-2-log.md` (commit 5c5aba58d) ran the upgrade, moved the fetch-plus-edit case into the parity corpus, renamed the colliding dogfood-tail `isAgentReadPath` to `isDogfoodAgentReadPath`, and recorded its group gate as BLOCKED with no clean run.
- Per-group rounds: group 1 `build-plan-verify-1-1.md` to `-1-4.md` (final PASS); group 2 `build-plan-verify-2-1.md` to `-2-3.md` (final PASS); group 3 `build-plan-verify-3-1.md` to `-3-6.md` (final PASS).

## Notes

- Mode `Holistic`, all 3 groups and 13 tasks; every task carries `[x]` in the plan. The run's diff `tmp/bkit-diff-787-show-authoring-rules.md` is partial, so the holistic-2 remediation commit 5c5aba58d was read directly with `git show`.
- **`pnpm bkit check`** (read-only) exited 0 with only advisories. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/bkit-check-3.log`.
- **`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`** exited 1: related run 79 files / 4152 tests passed; named run 1 failed, 9265 passed, 2 skipped; node, bats, lint, format and typecheck passed (`failed: named` only). The single failure is the timeout logged above; holistic-2's `land.test.ts` timeout did not recur. It waited about 12 minutes for the machine-wide tests lock first. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/tests-changed-3.log`.
- **Tasks line:** tasks 1-3, 5-11 and 13 meet their DONE WHEN. TASK 11 is now met: the upgrade ran and `pnpm bkit check` passes, and `dist/` carries the latest engine source change (both last touched in 49d2878e2). TASKS 4 and 12 are left off for the timeout.
- **Derived Test Matrix:** all 28 rows have their named test exactly once in the named target file, inside the owning task's TEST FIRST; only the TASK 4 row fails, and only on time.
- **Fetch-plus-edit case** (`keeps a fetch-plus-edit command advised within each host budget`, parity corpus): Claude gets the checklist and a silent retry, Antigravity's fetch denial names `.bkit/authoring.md`, Codex stays within 2,000 bytes with the omission notice and an unacknowledged target. Cursor is not in the case; a probe of the installed `.cursor/hooks/bkit-guardrails.cjs` returns `permission: "ask"` for the off-allowlist `curl`, which is the preserved stronger decision, so no gap. The `docs/testing.md` parity row describes the case, and nothing references the deleted `guardrails-codex-fetch-edit.integration.test.ts`.
- **Documentation Updates:** all five rows remain done. Errors: the hooks stay fail-open with no new log store, which matches the plan's Observability pre-flight and `docs/observability.md`.
- **Decision records:** `build-decision-1-1.md` to `build-decision-1-5.md` all chose Fix now; none accepts a gap here, and no `Accept (assumed)` record exists.
- **Test-first audit:** none supplied for this round. Unproven from earlier rounds: TASK 13 `upgrades shipped registrations without dropping consumer hook groups or permissions`, answered by the owner at the end of the build.
- **Out-of-scope observation carried from holistic-2, not logged:** `mergeManagedList` drops a consumer hook group whose command runs a file named like a template's bkit hook; the plan does not decide whether such a group is the consumer's own.
- **Probe hygiene:** the Cursor probe ran from the scratchpad with `TMPDIR` in the scratchpad; the hook only reads the command text, so nothing was fetched or edited.

## Identified Gaps Log

3 gaps, all `Fixable: true`, sharing one root cause (a planned test that exceeds its time limit under machine load).

- INTEGRATION: TASK 4 (group 1) test vs the full-suite gate that TASK 12 (group 3) requires: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 with `failed: named` and one failure in 9268 tests: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `prepares complete advice without acknowledging it` — `Test timed out in 9066ms` (ran 10339ms at load average 6.7 on 10 cores; it passes alone in 5.85s at load 15.6, but the plan says an isolated or retry pass does not establish full-suite success). The case makes 10 plugin invocations plus a setup round in one test; the plan's Suggested Scope Expansion names this file's TRIAGED `gateguard-opencode-patch-tests-flaky-under-full-audits-run` failure and directs "reproduce and repair if encountered", so make the case finish well inside its budget under the gate's load (find what makes each invocation slow, or have the tests step split the recorded case) without raising timeouts or accepting a retry pass — Fixable: true
- TASK 4: DONE WHEN "Both named cases pass" is not met in the full gate run: `prepares complete advice without acknowledging it` timed out (see the INTEGRATION entry above); its assertions pass when run alone — Fixable: true
- TASK 12: DONE WHEN "with all planned Unit and Integration cases passing ... Report known load-dependent failures from the full suite; an isolated or retry pass does not establish full-suite success" is not met: the full gate run fails the planned TASK 4 case on a timeout (see the INTEGRATION entry above). The rest holds: `pnpm bkit check` now exits 0, and the build plus fresh scratch-consumer install and check passed in `build-plan-gaps-remediate-3-1-log.md`; that dogfood predates the install-engine change in 49d2878e2 (`mergeManagedList` hook-file matching) and the holistic hook changes, so re-run `pnpm build`, the built-CLI fresh scratch-consumer install under tmp/ and its `bkit check` on the current tree when the timeout is fixed, and record the outcome — Fixable: true
