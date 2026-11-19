Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: 577df97fcee8ded909af0483df9cd55522ccfbe90260f4c1bf697229ea4643c1
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

Group 1 (tasks 1-3) judged against `build-diff-1-1.md`, with the brief's `Deviations` (orchestrator option B on an empty `PUSH_DEV_SHA`) as the owner's instructions.

- TASK 1: `scripts/gate/bkit-check-dist.mjs` parses `--ref=<value>` (any other argument throws `[bkit] unknown argument`), refuses an empty or `-`-leading value, resolves with `git rev-parse --verify --end-of-options <value>^{commit}` and checks the result is a full hash, fills a temporary index (`GIT_INDEX_FILE` + `git read-tree`) that feeds `ls-files`, `checkout-index` and `ls-files -s dist/`, and removes it in `finally`. With no ref it reads the real index. `node scripts/gate/bkit-check-dist.mjs --ref=-x` exits 1 with `[bkit] --ref value is not a commit` (run here). The test file has 10 tests (6 existing + 4 new), including `without --ref the check still reads the index and not the commit`.
- TASK 2: `.husky/pre-push` lines 396-405 set `DIST_REF="${PUSH_DEV_SHA:-$PUSH_BRANCH_SHA}"`, clear an all-zero value, and run the `--ref="$DIST_REF"` call or the no-argument call; the comment is reworded. `grep -rln "check:dist" .bkit/templates` lists nothing. The test file changes only the `.husky/pre-push min push` block: one changed expectation and two added tests, as the deviation allows.
- TASK 3: `docs/deployments.md` lines 617 and 619 and `docs/testing.md` line 924 name `--ref`; `pnpm bkit:text:ceiling check` passes (`prompts 86494, workflows 58535`).
- Run here: `pnpm exec vitest run` on both test files, 2 files and 146 tests passed (220.81s).
- Derived Test Matrix: all 7 rows have a test named in the task 1 or task 2 `DONE WHEN` / `TEST FIRST`, and every one of those tests exists and passes.
- Documentation Updates: both rows done.
- Observability: the new errors go to stderr with the script's existing `[bkit]` prefix, the same as its other messages.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven, all 5 TEST FIRST tests red then green. The tests log lists two tests that passed before the code changed: `without --ref the check still reads the index and not the commit` (the script already read the index, a regression guard) and `.husky/pre-push: a push with no dev or branch commit runs the dist check with no argument` (the hook already made the no-argument call). Neither is in TEST FIRST; both are named in DONE WHEN. No gap.
- Files changed stay inside the deviation's allowed list; `package.json` and `.bkit/templates/**` are unchanged.
- Decision records: none were supplied.

## Identified Gaps Log

None
