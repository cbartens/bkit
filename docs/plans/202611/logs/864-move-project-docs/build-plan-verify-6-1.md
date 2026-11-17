Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 18, 20
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

None

## Notes

- Mode `Group`, group 6 (Tasks 18-21), judged against `build-diff-6-1.md`. Briefs `build-brief-6-1.md` and `build-brief-6-2.md` are byte-identical and carry no `Deviations` section.
- Test-first audit `build-tests-green-6-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests` or `Already landed` section. All seven planned tests went red then green, so there are no audit gaps to decide.
- Decision records `build-decision-1-1.md` to `build-decision-1-5.md` concern groups 1, 2 and the round-1 challenge. None of them covers a group 6 task.
- TASK 18 is satisfied. `stripUntrusted` (`.bkit/core/engine/commands/workflow/summary.ts:158`) now cuts from the first `BEGIN UNTRUSTED` line to the last `END UNTRUSTED` line, or to end of file when no closer follows. This matches the fence contract at `.bkit/core/engine/commands/workflow/context.ts:88`. The `jsonl` fence regex also accepts the end of the section as a close.
- TASK 20 is satisfied. `normalizeLegacyText` now trims each line and collapses runs of spaces and tabs. I recomputed every digest independently: for all ten topics, each release tag's `.bkit/shared/docs/<topic>.md` plus `LEGACY_STARTER_SOURCE_REVISION` produces exactly the digests in `LEGACY_STARTER_DIGEST_HISTORY` and `LEGACY_STARTER_DIGESTS`. The only digests missing from the list come from the non-release tag `backup/699-pre-rebase-20261101`, which is expected.
- TASK 19 fixes its two named scenarios: a valid row later in the table now wins. Its final clause is unmet, so it is logged as a gap.
- TASK 21 parses backticked, Markdown-link and bare-path rows, and takes Scope as the last non-empty cell. Unparsed rows reach `bkit check` only; install / upgrade still treats them as absent. That is logged as a gap.
- `pnpm exec tsc --noEmit -p .` exits 0. `dist/` is rebuilt in the same diff.
- I could not rerun vitest locally. Other runs (`bkit:gate:static-unit` and `bkit:gate:changed` from other worktrees) held the machine-wide tests lock through two waits of up to 540s and 580s. The green status of the planned tests rests on `build-tests-green-6-1.md`.
- Unrelated LOW findings from the round-2 challenge were appended to `docs/deferrals.jsonl` in this diff. They do not count toward any task's DONE WHEN.

## Identified Gaps Log

2 gaps.

TASK 19: `.bkit/core/engine/checks/after/tools.ts:498` — DONE WHEN clause "when every candidate row is unusable, the advisory names those rows" is unmet: the fallback `findIndexedEquivalent(rows, topic)` keeps only the first row, so two out-of-tree rows (`../a/security.md`, `../b/security.md`) name only `../a/security.md` in `project-docs-ambiguous`, and stale rows (`old/security.md`, `older/security.md`, both absent) name no row at all: `project-docs-missing` says only "No project document covers: ... docs/security.md". Reproduced with a scratch fixture against the worktree source. — Fixable: true
TASK 21: `.bkit/core/engine/install/project-docs.ts:547` — DONE WHEN clause "a row it cannot parse is reported as ambiguous rather than treated as absent" holds in `bkit check` only: `syncProjectDocs` ignores `index.unparsed`, so an index whose only row is `| Security rules (docs/security.md) | ... |` gets `registered: ["docs/security.md"]` and a second, backticked row on install / upgrade, while check reports both `project-docs-ambiguous` and `project-docs-unindexed` ("run `bkit upgrade`"). In addition, `cellPath`'s bare-path pattern `^[^\s`|()[\]]+$` accepts emphasis markers, so `| **docs/security.md** | ... |` parses as the path `**docs/security.md**` (neither matched nor reported as unparsed), and sync again appends a duplicate row. Reproduced with scratch fixtures against the worktree source. — Fixable: true
