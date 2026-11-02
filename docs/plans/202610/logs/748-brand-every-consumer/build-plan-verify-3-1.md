Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged Tasks 6, 7 and 8 against `build-diff-3-1.md`. No decision records, no earlier group 3 verify reports and no group 3 remediation logs exist.
- Test run (scratchpad, this attempt): the 31 test files the group touches (templates, branding, dogfood-templates, core / upgrade / index / template-copies integration, version-file, core.test, templates-content, `.bkit/core/engine/checks/**`): 1565 passed, 2 failed. The 2 failures are the two not-green gaps below; nothing else broke, and `#459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file` and `index.integration.test.ts` pass.
- TASK 6 satisfied: `grep -rnw "House" .bkit/templates .bkit/core/.bkit .bkit/core/engine --exclude='*.test.ts'` is empty. Both style dirs hold only `Bkit/` (renames at 100% similarity). `template-copies.integration.test.ts` passes, as do all 6 TEST FIRST tests. `pnpm bkit:lint:prose` exits 0 with 46 `write-good.ThereIs` warnings and no Bkit-rule hits in the corpus, so no rule id prints. `vale ls-config` lists only `Bkit.*` checks, and a stdin probe printed `Bkit.Hedging` and `Bkit.LLMSlop`, so the style resolves under the new name.
- Test-first audit `delete-still-referenced` (8 entries, Task 6, `Fixable: null`): no gap. Every hit names a Vale rule (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) that now lives in `Bkit/` under the same file name, or is an unrelated English word (`catalogue.ts:199` "Filler and dead code", `.bkit/core/.bkit/workflows.md` / `SKILL.md` "Verbose"). The only remaining `styles/House` paths are in the installed mirrors `.bkit/templates.md:57,340` and `.bkit/README.md:230`, which TASK 12 regenerates. History ledgers and `CHANGELOG.md` keep it as history.
- TASK 7: the code matches every field. `WriteEntry.unhashed?: true` is in `write.ts`. Both hash collectors skip unhashed entries (`core.ts` postDispatch loop, `upgrade.ts` `renderedDocPaths`). `migrateBrandedFileTokens` is wired in `runBkitDocs`. The exception is stated in `templates.md:11` and in the comments in `version-file.ts` / `version-file.test.ts`. The index describe is renamed, and the `docs/migrations.md` row is present. It is left off `Tasks` only because of the not-green TEST FIRST test (gap below).
- TASK 8: the code matches every field. `SHIPPED_CI_SCRIPT_HASHES` equals, entry for entry, the sha256 set recomputed this attempt from `git ls-tree` across every `v*` tag. The only historical path is `.bkit/templates/scripts/ci/`. `CI_SCRIPT_UNITS` / `CI_SCRIPT_RENAMES` are exported, `migrateBrandedTemplateFiles` runs before `migrateBrandedFileTokens` and passes it the renames, and both `docs/migrations.md` rows are present. The shipped `bkit-check-capstone.mjs` + `.test.mjs` pair, copied into a scratch `scripts/ci/`, ran with `node scripts/ci/bkit-check-capstone.test.mjs`: 35 passed, exit 0. It is left off `Tasks` only because of the not-green TEST FIRST test (gap below).
- Both not-green gaps are in planned tests whose assertions reach beyond the migration: a second-run output check that also matches unrelated advisories, and a whole-tree snapshot that includes the cache-bust line bkit rewrites in `.claude/bkit-cloud.md` on every upgrade. The test lines need scoping, which goes through the tests step, because no code step may rewrite a planned test.
- Observability: the migrations report through `console.log` / `console.warn` with `logPrefix`, the same pattern as the existing `runBkitDocs` migrations.
- Unproven: 0. Enforced: true. No `Updated tests` or `Already landed` sections.

## Identified Gaps Log

2 gaps.

TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` — not-green (line 1059 `expect(combinedOutput(second)).not.toContain(".husky/pre-push")` fails because every upgrade of the bare scratch consumer prints advisories naming `.husky/pre-push` ("copy .bkit/templates/.husky/pre-push to .husky/"); the hook, CI file and canonicalHashes assertions all pass, so the code meets the DONE WHEN and the assertion needs scoping to the migration's own log line, e.g. `core: .husky/pre-push — branded`) — Fixable: true
TASK 8: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing` — not-green (line 1147 whole-tree `snapshotTree()` equality fails only on `.claude/bkit-cloud.md` `# cache-bust 2026-11-02-2` -> `-3`, which `renderCloudCacheBust` in `.bkit/core/engine/install/cloud-env.ts:335` bumps on every regeneration by design; `scripts/ci/`, the hooks and the CI workflow are unchanged, so the snapshot needs to leave out `.claude/bkit-cloud.md` or cover only the migrated paths) — Fixable: true
