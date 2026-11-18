Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8
Loosened: none
Fingerprint: bd8c0e0f4dca3ad2bff0b1fbbe53f82464b86697d92205b09f824710d9aba9ba
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups).

## Integration Gaps

0. The four groups work together. Group 1's `monthAndFid` and group 4's `checkMonthFid` share one pattern pair: `commitBookkeeping` (`ledgers.ts:1217`) and `checkOnlyBookkeeping` (`ledgers.ts:2393`) run `checkMonthFid` themselves, so every caller (`runs.ts:1282`, `workflows.ts:790` and `:1553`, `branches.ts:2433`, `:2530`, `:2889` and `:3025`, `ci.ts:828`, and the `ledgers` handlers) is covered from one place. Group 1's lock-deletion staging and group 4's `removedLocks` filter are one code path: deleted tracked locks never reach `ownSet` and are appended after the recorded-path filter. Group 2's owner-only modes sit on outbox paths that groups 1 and 4 never touch. Group 3's docs describe the code that groups 1, 2 and 4 landed.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: PASS for tasks 1-6, run when the plan had 3 groups (before the challenge added group 4).
- Group reports: `build-plan-verify-1-1.md`, `-2-1.md`, `-3-1.md`, `-3-2.md`, `-3-3.md`, `-4-1.md` (CONCERNS, 1 gap on TASK 8, closed by `build-plan-gaps-remediate-4-1-log.md`) and `-4-2.md` (PASS, tasks 7-8).

## Notes

Judged against `tmp/bkit-diff-1035-ledger-commit-outbox.md` and the codebase at `7fb6c07b4`. The working tree has no engine or `dist/` change against HEAD.

- Tests: `pnpm exec vitest run` on `ledgers.test.ts`, `decisions.test.ts`, `commands/lib.test.ts`, `ledgers/journal.integration.test.ts`, `runs.test.ts`, `workflows.test.ts`, `branches.test.ts` and `ci/ci.test.ts` passed: 8 files, 1091 tests. All 11 `Derived Test Matrix` tests exist once in the file their row names, each in its task's `TEST FIRST`, and pass, as do the kept tests the DONE WHEN fields name (`the correction-events file has mode 0600`, the leftover-lock test). The full suite was not run here: the holistic gate covers it.
- TASK 1: `monthAndFid` (`ledgers.ts`) checks through `checkMonthFid`; `FID_PATTERNS` is read only inside the function; the flag help names the shapes. The `commit` handler reads `required(ctx, "month")` / `required(ctx, "fid")` again, which TASK 1's DONE WHEN wording forbids. TASK 8's direction (decision `build-decision-1-2.md`, "remove its own `monthAndFid` call" where the shared function gives the same refusal) supersedes it, and `commitBookkeeping` refuses the same input, so this is no gap.
- TASK 2: `decisions pending` calls `monthAndFid`; `decisions.ts` holds no inline `[0-9]{6}` check.
- TASK 3 and TASK 7: `ls-files -z --deleted` paths ending `.bkit-lock` go into `removedLocks`, recorded paths are filtered out, and the rest are appended after the `rec` filtering, never into the list handed to `ownSet`.
- TASK 4: `privateDir` is exported from `.bkit/core/engine/ledgers/status.ts` and runs `chmodSync(dir, 0o700)`; `writeInvocation` calls it and holds no `fs.mkdirSync`.
- TASK 5: `correctionBook` runs `fs.chmodSync(file, 0o600)` after the create call.
- TASK 6: `docs/security.md`, `docs/observability.md`, the three `docs/testing.md` rows and `.bkit/core/.bkit/workflows.md:147` carry the edits; line 147 of `.bkit/workflows.md` matches the source; `docs/deferrals.jsonl` has the `CLOSED` row for `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`.
- TASK 8: `checkMonthFid` is split out of `monthAndFid` with no second pattern; only `checkOnlyBookkeeping` passes the `*` month exemption; the `onlyBookkeeping` handler keeps `monthAndFid` because the shared function lets `*` through; no caller source file was edited.
- `dist/` carries `checkMonthFid` (`dist/commands/workflow/ledgers.js`), both `chmodSync` calls and the `privateDir` import in `dist/commands/lib.js`.
- `bkit runs gate --validated --month=*` still reaches the `*` exemption through `runs.ts:1282`, as at the base commit. Closing it needs a `runs.ts` edit that TASK 8's DONE WHEN keeps out of the footprint. Reported for the owner, not a gap.
- Decision records: `build-decision-1-1.md` (group 3 verify loop, Fix now; accepts no gap) and `build-decision-1-2.md` (TASK 8 direction (a), the orchestrator's assumption while the owner was away, not the owner's decision; accepts no gap).
- Test-first audit: no holistic audit report was supplied. The group audits reported by earlier verify steps (`build-tests-green-1-1.md` through `-4-2.md`) are `Enforced: true` with 0 gaps and 0 unproven tests.
- Observability: every new refusal is a `CommandError` exiting 2 before any write, as `docs/observability.md` § Bookkeeping effects and receipts describes.

## Identified Gaps Log

None
