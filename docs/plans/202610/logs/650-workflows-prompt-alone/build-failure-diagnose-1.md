Verdict: PASS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

Run by the orchestrator in place of `@bkit-debug-failure-diagnose` (human instruction 2026-10-23: finish 650 without further subagents).

## Mode Reasoning

Cause localised: every failure is a 5000ms test timeout under host load, and the same files pass when re-run.

## CI Run

NOT CHECKED: local gate run, nothing pushed yet.

## Prior Attempts Reviewed

None

## Prior Knowledge

NOT CHECKED: timeout under load is evident from the log and the re-run.

## Related Issues

NOT CHECKED: no code defect to match.

## Failures

`run-tests-1.md`: 7 tests in 3 files, all `Error: Test timed out in 5000ms`:

- `.bkit/core/engine/audits/repo/resolve-push-base.test.ts`: 5 tests (git / gh fallbacks)
- `.bkit/core/engine/shared/bkit-latest.test.ts`: "is null when pnpm fails or prints something that is not a version"
- `.bkit/core/engine/commands/workflow/runs.test.ts`: "bkit runs revalidate > exits 1 when the PR head cannot be read, 80 when gh needs auth"

No assertion failed.

## Root Cause

- **Proximate:** host load. The test-timeout budget logged load average 13.5 on 10 cores during this session; `uptime` after the run showed 9.23 / 9.51 / 8.42 with other sessions active. Each timed-out test spawns child processes (`git`, `gh`, `pnpm` stubs) that ran past 5000ms.
- **Evidence it is not the change:** `pnpm exec vitest run` on the three files alone → 3 files, 190 tests passed. `resolve-push-base.test.ts` and `bkit-latest.test.ts` are untouched by #650; the `runs.test.ts` test is not one the change edited. The same `pnpm bkit:gate:static-unit-integration` passed (exit 0) earlier in this session on the same tree minus the two log-only step commits.

## Rot Signals

tests: child-process tests sit at a fixed 5000ms limit that the load scaling did not cover for these files.

## Recommended Remediation

No source change. Re-run Step 14 on a quieter host.

## Out-of-Scope Recommendations

- `.bkit/core/engine/audits/repo/resolve-push-base.test.ts`, `.bkit/core/engine/shared/bkit-latest.test.ts`: confirm these files pick up the load-scaled timeout budget; they timed out at the flat 5000ms.

## Blast Radius

Localised

## Suggested Tests

None

## Verification Commands

- `pnpm exec vitest run .bkit/core/engine/audits/repo/resolve-push-base.test.ts .bkit/core/engine/shared/bkit-latest.test.ts .bkit/core/engine/commands/workflow/runs.test.ts` → 190 passed
- Step 14 re-run: `bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit`
