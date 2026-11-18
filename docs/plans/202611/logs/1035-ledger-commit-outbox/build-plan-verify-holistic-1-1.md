Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: 7e7d63c7016f9cd46cb5f5ea5d7b712784442dfeb9eca6ba69dd52392b7bee38
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

0. The three groups work together: group 1's `monthAndFid` guards the three CLI handlers, group 2's owner-only folder and file modes sit on the same outbox paths that group 1's commands never touch, and group 3's docs describe the code groups 1 and 2 landed.

## Previously Attempted

None for the holistic scope. Group reports: `build-plan-verify-1-1.md` (PASS, tasks 1-3), `build-plan-verify-2-1.md` (PASS, tasks 4-5), `build-plan-verify-3-1.md` (CONCERNS, 2 LOW doc-wording gaps), `build-plan-verify-3-2.md` (CONCERNS, 1 LOW doc-wording gap), `build-plan-verify-3-3.md` (PASS, task 6). The group 3 gaps were closed by `build-plan-gaps-remediate-3-1-log.md` and `build-plan-gaps-remediate-3-2-log.md`.

## Notes

Judged against `tmp/bkit-diff-1035-ledger-commit-outbox.md` and the codebase at `0fc023b50`.

- TASK 1: `monthAndFid` in `.bkit/core/engine/commands/workflow/ledgers.ts:229` checks `--month` against `/^[0-9]{6}$/` and `--fid` against `FID_PATTERNS.none` (`/^[a-z0-9][a-z0-9-]*$/`, `fids.ts:51`), and throws `EXIT.USAGE` naming the flag. `commit` and `onlyBookkeeping` call it; the only remaining `required(ctx, "month"|"fid")` calls are inside the helper and in `triage` (out of scope). `FID_PATTERNS` is read only inside the helper. The `MONTH_FLAG` / `FID_FLAG` help text names the shapes.
- TASK 2: `decisions pending` calls `monthAndFid`. `decisions.ts` holds no inline `/^[0-9]{6}$/` check.
- TASK 3: `commitBookkeeping` (`ledgers.ts:1308-1318`) adds only `ls-files --deleted` paths ending `.bkit-lock`. The listing of cached and untracked files still excludes `**/*.bkit-lock`.
- TASK 4: `privateDir` is exported from `.bkit/core/engine/ledgers/status.ts` and runs `chmodSync(dir, 0o700)`. `writeInvocation` calls it and holds no `fs.mkdirSync`.
- TASK 5: `correctionBook` runs `fs.chmodSync(file, 0o600)` after the create call.
- TASK 6: `docs/security.md`, `docs/observability.md`, the three `docs/testing.md` rows and `.bkit/core/.bkit/workflows.md:147` carry the edits. Line 147 of `.bkit/workflows.md` is identical to the source. `docs/deferrals.jsonl` has exactly one `CLOSED` row for `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`.
- Cross-group checks:
  - Internal callers pass `"*"` or call `commitBookkeeping` / `bookPathspecs` / `checkOnlyBookkeeping` directly, so the handler check never reaches them: `ci.ts:613`, `ci.ts:828`, `workflows.ts:790` and `:1553`, and `branches.ts:2433`, `:2889` and `:3025`.
  - Every workflow call site of the three verbs passes `{FID}` and `{YYYYMM}`, for example `bkit-ship.md:378`, `:413` and `:643`.
  - The built CLI loads across the `fids.ts` → `locks.ts` → `ledgers.ts` module cycle. `node dist/cli.js` exits 2 naming the flag for `ledgers commit --fid=../../x`, `decisions pending --fid=../x` and `ledgers only-bookkeeping --month=*`.
  - `dist/` carries the matching hunks, and `git status` shows no `dist/` change.
- Tests: I ran `pnpm vitest run` on `ledgers.test.ts`, `decisions.test.ts`, `commands/lib.test.ts` and `ledgers/journal.integration.test.ts`. All 4 files and 305 tests passed. That run covers all 8 `Derived Test Matrix` rows, and each row's test is in its task's `TEST FIRST` and inside the file its `DONE WHEN` names. Both group gates (`build-group-gate-1-1.md`, `build-group-gate-2-1.md`) report "every stage passed". This step did not run the full suite: the holistic gate covers it.
- Test-first audits: no holistic audit report was supplied. The group audits `build-tests-green-1-1.md`, `-2-1.md`, `-3-1.md`, `-3-2.md` and `-3-3.md` all have `Enforced: true`, `Verdict: PASS`, 0 gaps and 0 unproven tests, with no taken-over, changed-by-a-code-step or updated tests.
- The group 1 code step changed the space-in-path test from `--fid=446 space` to `--fid=446-space` with the file `my status.jsonl`. This is TASK 1 fixing a test it broke, and the test still proves that a path with a space is staged.
- Observability: each new refusal is a `CommandError` that exits 2 before any write. That matches `docs/observability.md` § Bookkeeping effects and receipts.
- Edge case not tested on its own (no matrix row, so not a gap): a deleted tracked lock while `*.bkit-lock` is in `.gitignore`. git stages the removal of a tracked path whatever the ignore rules say.
- `build-decision-1-1.md` chose Try again and Fix now. It accepts no gap.

## Identified Gaps Log

None
