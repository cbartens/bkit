Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: 8c2ea006768ae3798b7d70c065430fa1fec0f2f6a17e63fce14bf0aaaabf9e35
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Group 1 (TASKS 1-3) judged against `build-diff-1-1.md`; all three tasks are satisfied.

- TASK 1: `monthAndFid` is exported next to `required` in `.bkit/core/engine/commands/workflow/ledgers.ts`. It checks `--month` against `/^[0-9]{6}$/` and `--fid` against `FID_PATTERNS.none`, and throws `CommandError(EXIT.USAGE, ...)` naming the flag and the shape. `commit` and `onlyBookkeeping` call it, and neither calls `required(ctx, "month")` / `required(ctx, "fid")` any more. `FID_PATTERNS` is imported but read only inside the helper at call time, never at module load. `MONTH_FLAG` / `FID_FLAG` help text names the shapes. `bookPathspecs` is unchanged. Every tracker's FID shape in `fids.ts` (github, linear, jira, any) is a subset of `none`, so no valid FID is refused.
- TASK 2: the `pending` handler in `.bkit/core/engine/commands/workflow/decisions.ts` calls `monthAndFid`. `decisions.ts` no longer holds the inline `/^[0-9]{6}$/` check.
- TASK 3: `commitBookkeeping` runs `git ls-files -z --deleted -- <specs>` and adds only paths ending `.bkit-lock`, so the existing `git add --pathspec-from-file` stages the deletion. The `:(exclude,glob)**/*.bkit-lock` on the cached/others listing still keeps an untracked or changed lock out. The leftover-lock test still passes.
- `dist/commands/workflow/ledgers.js` and `dist/commands/workflow/decisions.js` match the source changes and are committed in `ed9ba3c6a`.
- I ran `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/decisions.test.ts`: 2 files, 203 tests passed, including every existing `commit`, `only-bookkeeping` and `pending` case.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven. It has no `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- The code step (`ed9ba3c6a`) changed one existing, unplanned test in `ledgers.test.ts`, the space-in-path case. It now uses `--fid=446-space` and the file `my status.jsonl` in place of the old `--fid=446 space`. This is the task fixing a test it broke: a FID with a space is now refused on purpose. The test still checks that a path with a space is staged, so nothing was loosened.
- No decision records, earlier verify reports or remediation logs were supplied.

## Identified Gaps Log

None
