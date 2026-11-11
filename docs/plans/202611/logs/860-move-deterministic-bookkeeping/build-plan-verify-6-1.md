Verdict: PASS
Failures: 0
Fixable: false
Tasks: 18, 19, 20, 21, 22
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 6`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- All five group 6 tasks (18-22) meet their `DONE WHEN`, judged against `build-diff-6-1.md`.
- TASK 18: `canonicalJson` (keys sorted at every depth, `undefined` dropped) is used for both the issued operation id (`ledgers.ts:1485`) and the stored request hash (`ledgers.ts:1587`).
- TASK 19: `auditEntries` now builds `audit-${slug}-${kebab(title)}` (`issues.ts:734`), which matches `bkit-audit-generate.md:169,172` (`audit-{slug}-{content-slug}`). A judged `priorKey` is kept as given. The `audit-` prefix means a derived key can never equal a report ID `<slug>-N`.
- TASK 20: `renderResult` throws exit 6 when `evidenceComplete` is not a boolean, and when a PASS has a blank body (`steps.ts:1660-1662,1692`). The audit agent takes its own `renderAudit` branch before that check, so the audit result JSON, which has no `evidenceComplete`, is unaffected. The older `steps.test.ts` tests changed only in the shared `resultFile` helper, which gained `evidenceComplete: true`. That is additive: no expectation was removed or loosened.
- TASK 21: all 8 named prompts page until `nextCursor` is null and route `missing` / `partial` / `unreadable`. No prompt or workflow under `.bkit/core/` still says `coverage.clean`. The `.bkit/instructions.md` entries were synced.
- TASK 22: the committed `invocation` event stores `statusPath` / `bookRoot` relative to the checkout top, and `worktree` as `worktreeFingerprint(top)` (sha256, 16 hex). `rebuildInvocation` resolves the paths against the current top and refuses a fingerprint or path mismatch. The receipt and the printed result keep absolute paths. The new test checks that the appended row has no absolute value, and that `resolveInvocation` rebuilds the receipt after it is deleted. `docs/architecture.md` was updated.
- The five planned tests pass by name. The five changed test files pass (505 tests). The full `vitest run` passes: 229 files, 9322 passed, 2 skipped.
- `dist/` matches source: `tsc --outDir` into a scratch directory, compared with `diff -rq` against `dist/`, shows no difference.
- Test-first audit (`build-tests-green-6-1.md`): `Enforced: true`, 0 gaps, 0 unproven, all five went red then green.
- Accepted per caller and not logged: host mirrors, the installed `.bkit/*.md` copies and render snapshots stay stale until `pnpm bkit:generate`.
- Process note, not a gap: the execute log says the Task 22 edits to `status.ts` and `lib.ts` were made with a one-off python script, not the Edit tool. That breaks the `Edit tools` rule. The resulting code was checked and is correct.
- Out-of-scope find, proposed separately: `test-run` rows in the run `status.jsonl` still commit an absolute `log` path (`/Users/<name>/.../.git/bkit-outbox/...`, 7 rows in this run). This is the same privacy exposure as TASK 22, but for another event type that TASK 22's `DONE WHEN` does not cover.
- The fingerprint is a short unsalted sha256 of the path. Anyone who can guess the path can confirm it. TASK 22 allows "a one-way fingerprint", so this is not a gap.
- Decision records `build-decision-1-1` to `1-5` concern earlier groups. None applies to group 6.

## Identified Gaps Log

None

