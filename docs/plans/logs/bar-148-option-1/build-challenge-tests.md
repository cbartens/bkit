Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

## Summary

Regression tests added to `.agents/scripts/release-workflow.test.ts` to prevent reintroduction of the FID resolution bug fixed in the BAR-148 build-challenge remediation.

**Bug fixed:** `bkit-ci-router.md` was deriving FID by scanning `docs/plans/logs/` alphabetically and picking the first DONE/IN_PROGRESS directory. On any branch that inherits historical FID directories from `dev`, this returns the wrong FID and dispatches ship/debug for the wrong feature. The fix replaced the filesystem scan with `FID=$(echo "$BRANCH" | sed 's|^feat/||')`.

**Tests added (10 new `it` blocks in a `for...of` loop over 2 files):**

Both `.agents/workflows/bkit-ci-router.md` (canonical) and `.claude/commands/bkit-ci-router.md` (mirror) are covered. Each produces a `describe` block named `FID resolution regression (BAR-148 build-challenge) — {label}` with 5 assertions:

| Test | What it catches |
| --- | --- |
| derives FID from branch name using sed prefix-strip | Regression to any non-`sed`-based FID derivation |
| sed expression strips exactly the feat/ prefix | Drift to wrong prefix or glob expression |
| guards against FID equalling BRANCH | Missing safety check — would silently accept non-`feat/` branches |
| does NOT contain alphabetical directory-scan for FID | Reintroduction of `ls docs/plans/logs` or `for d in $(ls ...)` scan |
| does NOT contain status-json-scan loop for FID | Reintroduction of directory-iteration + status.json read to pick FID |
| FID derivation uses CI_RUN_HEAD_BRANCH env var as sole input | Drift to any approach that does not source BRANCH from the runner env |

Test file count before: 66 tests in `release-workflow.test.ts`. After: 76 tests (10 added).
Full suite result: 808 tests (807 passing + 1 todo) — no regressions.

## Blockers

None
