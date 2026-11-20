Verdict: PASS
Failures: 0
Fixable: false
Tasks: 10, 11
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 10: `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts` now checks the leftover tip against `:(glob)docs/plans/*/logs/${fid}/*.md` plus the ledger globs (`:(glob)docs/plans/*/logs/*/*.jsonl`, `:(glob)docs/*.jsonl`, `:(glob).bkit/*.jsonl`, `:(exclude).bkit/issues.jsonl`), the same ledger set as `UNION_PATHSPECS` with `*` stopped at `/`. A deeper `docs/plans/x/y/logs/{fid}/` folder, `.prettierrc.mjs`, `.gitattributes` and `sub/x.test.ts` fall outside and are refused before the merge. The `:(exclude)` entry is a literal path with no wildcard, so it needs no `:(glob)` to behave the same. `dist/commands/workflow/workflows.js` carries the same change.
- TASK 11: the same function refuses a tip whose `mergeBase..tip` diff has any `D` entry or a `.jsonl` row with a deleted-lines count above 0 in `--numstat`, before the merge and push. Observation, not a gap: `--numstat` runs without `-z`, so a `.jsonl` path git quotes (non-ASCII or control characters) would not match the regex; no ledger path on `dev` has such a name, since FIDs are ASCII slugs.
- Tests: the three `TEST FIRST` tests exist in `.bkit/core/engine/commands/workflow/workflows.test.ts` and pass (`-t "leftover"`: 9 passed; `-t "refused"`: 28 passed, run 2026-11-20 at load ~15).
- Test-first audit `build-tests-green-4-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. `Changed by a code step`: Task 1 `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code" — reason: setup-only addition (writes the ship FAILED record into `wt`); the added lines only add setup, no assertion changed, so no gap.
- Decision records `build-decision-1-1.md` and `build-decision-1-2.md` hold only the `VERIFY_GAPS` question header with no answers, so they accept no gap here.
- Not checked here: the close path's exit 11 for these refusals has no own test; it goes through the same `closePr` refusal the flush tests cover.

## Identified Gaps Log

None
