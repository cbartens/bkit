Verdict: PASS
Failures: 0
Fixable: false
Tasks: 18, 19, 20, 21
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-6-1.md`: `CONCERNS`, 2 gaps (TASK 19 every-unusable-row advisory, TASK 21 unparsed rows on install / upgrade), Tasks 18 and 20 satisfied.
- `build-plan-gaps-remediate-6-1-log.md`: both gaps marked `DONE`; the regenerate and group-gate steps were `BLOCKED` on the machine-wide tests lock, not on a code error.

## Notes

- Mode `Group`, group 6 (Tasks 18-21), judged against `build-diff-6-2.md`. Briefs `build-brief-6-1.md` and `build-brief-6-2.md` are byte-identical and have no `Deviations` section.
- Test-first audit `build-tests-green-6-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests` or `Already landed` section. All seven planned tests went red, then green, so there are no audit gaps to decide.
- Decision records `build-decision-1-1.md` to `build-decision-1-5.md` concern groups 1 and 2 and the round-1 challenge. None of them covers a group 6 task.
- TASK 18 is satisfied. `stripUntrusted` (`.bkit/core/engine/commands/workflow/summary.ts:158`) cuts from the first `BEGIN UNTRUSTED` line to the last `END UNTRUSTED` line, or to end of file when no closer follows. The `jsonl` fence regex accepts the end of the section as a close.
- TASK 19 is satisfied, and the attempt-1 gap is closed. `detectProjectDocs` passes the in-tree, regular-file `usable` predicate to `findIndexedEquivalent`. When every candidate row is unusable, the new `listIndexedEquivalents` names them all in `project-docs-ambiguous`. A scratch fixture with two out-of-tree rows now names both `../a/security.md` and `../b/security.md`. A fixture with two stale rows names both `old/security.md` and `older/security.md` and gives no `project-docs-missing` for security. The new test `names every unusable indexed row when none of them can be read` covers this.
- TASK 20 is satisfied. `normalizeLegacyText` trims each line and collapses runs of spaces and tabs. The recomputed digests were checked independently in attempt 1, and remediation did not touch them.
- TASK 21 is satisfied, and the attempt-1 gap is closed. When `index.unparsed` is non-empty, `syncProjectDocs` sets `indexProblem`, adds no row, and `logReport` prints it as a `console.warn`. `cellPath` rejects `*` and `~`. Scratch fixtures: a prose row `| Security rules (docs/security.md) |` and a bold row `| **docs/security.md** |` both give `registered: []` with an `indexProblem` on sync, and `project-docs-ambiguous` on check. A link row and a bare row with no trailing pipe and an escaped `\|` parse correctly. The new test `adds no row and reports a problem when the index has a row it cannot read` covers this.
- Out-of-scope observation, not a gap: an underscore-emphasis row `| _docs/security.md_ |` parses as the bare path `_docs/security.md_`, so sync appends a `docs/security.md` row. Underscores are legal in file names, so this row is a valid bare path under the DONE WHEN's three forms. Propose it separately if wanted.
- I ran `pnpm exec vitest run` on `install/project-docs.test.ts`, `checks/after/tools.test.ts`, `checks/after/index.test.ts` and `commands/workflow/summary.test.ts`: 4 files and 167 tests passed. `audits/templates/template-shape.test.ts` and `audits/repo/shipped-docs-refs.test.ts` also passed (288 tests). `pnpm exec tsc --noEmit -p .` exits 0. `dist/` is rebuilt in the same diff, and no engine source change is left uncommitted.
- I could not run the install and workflow integration tests (`commands/install/*.integration.test.ts`, `workflows.integration.test.ts`). The machine-wide tests lock was held by runs in other checkouts (`787-show-authoring-rules`, `891-build-gate-stuck`, a consumer worktree), and the run gave up after a 540s wait. No planned group 6 test is in those files.
- The round-2 challenge's LOW findings were added to `docs/deferrals.jsonl` in this diff. They do not count toward any task's DONE WHEN.

## Identified Gaps Log

None

