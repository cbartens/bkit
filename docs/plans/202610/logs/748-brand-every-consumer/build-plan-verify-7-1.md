Verdict: PASS
Failures: 0
Fixable: false
Tasks: 20, 21, 22
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 7

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Test-first audit (`build-tests-green-7-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all three tests went red and then passed. There is no `Updated tests` or `Already landed` section and nothing was loosened.
- `pnpm bkit:gate:static-unit` exited 0: 166 test files passed (6961 tests passed, 2 skipped), and the prose linter reported 0 errors. The full `core.test.ts`, `core.integration.test.ts` and `upgrade.integration.test.ts` files passed: 225/225.
- TASK 20: met. Not a gap.
  - The job-block scan at `core.ts:1191` now uses `^(?: {2}[^\s#]|[^\s#])`, so comments at column 0 and at job-key indent no longer end the block. On the planned shape the existing `    name: our trivy` is found and no second one is inserted.
  - Deviation: the planned `parseYaml` check is replaced by a count of 4-space `name:` lines in the job block (`core.ts:1196-1205`). When that count is above 1, the function logs one `console.warn` naming the file and the manual rename, then `continue`s without calling `finish`.
  - The deviation is justified. `package.json` has no `dependencies`, `yaml` is only a devDependency (2.9.1), and no non-test engine file imports `yaml`. A runtime import would therefore break on consumer installs.
  - The count meets the intent of the DONE WHEN, which is that the result never carries two job `name:` keys. A `tsx` probe in the scratchpad seeded a job with two `name:` lines and a comment between them. The file stayed byte-identical, `ws.writes` was empty, and the warn line was printed.
  - Caveat: the count uses the same block boundary as the insert. It therefore cannot catch a boundary misread the way a full parse would. In valid YAML with 2-space job keys, though, only comment and blank lines can sit at indent 2 or less inside a job, and the new scan skips both. No realistic shape is left that produces a duplicate.
- TASK 21: met. The selector lookahead at `core.ts:824` now also matches `r` and `-recursive`, and `-w` / `--workspace-root` are still rewritten (the test asserts both). `findOldScriptNames` (`core.ts:841`) still matches `pnpm -r lint:prose`, so the manual-rename warning fires.
- TASK 22: met.
  - `compositeActions()` (`core.ts:793-805`) walks `.github/actions/` at any depth and keeps only regular `action.yml` / `action.yaml` files, using `lstat`, so symlinks are skipped.
  - Its files join the reference scan at `core.ts:1061-1064`. Each hit logs one `console.warn` with `file:line` and the manual move, and the unit is not moved.
- `docs/migrations.md` rows checked against the code:
  - "Branded check names" matches `migrateBrandedCheckNames`. Column-0 comments are skipped too, which the row does not mention; it only narrows what the row describes, so this is not a gap.
  - "Branded CI script files" matches, apart from one minor imprecision: it names `.github/actions/**/action.yml` only, while the code also reads `action.yaml`. Not a gap.
  - "Branded script tokens in hooks and CI" still holds after Task 21. Its "e.g. `pnpm --filter web lint:prose`" also covers `-r`, and Task 21's DONE WHEN does not require a row edit.
- Logging follows the neighbouring `console.warn` pattern with `logPrefix` and the dry-run tag. `dist/install/modules/core.js` was rebuilt in the same diff.
- Decision record `build-decision-1-1.md` (group 3, Fix now) does not touch this group.

## Identified Gaps Log

None

