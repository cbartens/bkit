Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Task 4 is judged from `build-brief-2-2.md`, the brief that matches the plan's current task 4 (`Fixable: true`, migration chosen in `build-decision-1-2.md`). `build-brief-2-1.md` holds the earlier advisory wording and is superseded.
- Task 4 is satisfied. `migrateLintStagedSample` in `.bkit/core/engine/install/template-copies.ts` copies the package's `lintstagedrc.example.json` to the root `.lintstagedrc.json` only when `.bkit/templates/.lintstagedrc.json` exists, `scripts["bkit:gate:format"]` matches `lint-staged`, and `hasLintStagedConfig(cwd)` is false. It returns early in dogfood. It is called before `syncTemplateCopies` in install pass 3b2 (`.bkit/core/engine/install/modules/core.ts`) and in `runUpgradeCommand` (`.bkit/core/engine/commands/install/upgrade.ts`). It pushes the same write entry in a dry run without copying, and prints one line naming `.lintstagedrc.json`. It is idempotent because the written root config makes `hasLintStagedConfig` true. The `dist/` files match the source edits. `docs/migrations.md` § Migrations has the row (`up to 6.1.x`), and `docs/decisions.jsonl` has `892-template-copies-bkit-lintstaged-root-migration`. `tsc --noEmit` exits 0.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`, 0 gaps, 0 unproven, and no `Updated tests` or `Already landed` sections. Both task 4 tests went red, then passed.
- I could not re-run the task 4 tests myself. My run of `upgrade.integration.test.ts` together with `.bkit/core/engine/install/template-copies*` emptied the worktree's `node_modules/.bin`. `node_modules/.modules.yaml` and `node_modules/.bin` were rewritten at 16:20:23, which is 5 s into that run. In the first run, 6 upgrade tests passed before the wipe. After it, every CLI test fails with `tsx not found at .../node_modules/.bin/tsx; run pnpm install`. The likely cause is the task 1 test `leaves a staged template copy unchanged under plain lint-staged` (`.bkit/core/engine/install/template-copies.integration.test.ts:239`). That test symlinks the repo's `node_modules` into a dependency-less temp consumer and runs `pnpm lint-staged` there, so pnpm reconciles the shared `node_modules` against an empty manifest. This sits in group 1, outside this group's diff, so it is proposed separately and not logged as a group 2 gap. The worktree needs `pnpm install` before any later test step.
- Observation, not a gap: in the install path the migration's write entry has no `unhashed: true`, so the consumer-owned root `.lintstagedrc.json` gets a `canonicalHashes` entry in `.bkit/version`. Other copy-and-own migrations mark their writes `unhashed`. Nothing reads a hash for a path outside the manifest, so behaviour is unaffected, and the task's DONE WHEN does not require it.
- Errors are not swallowed: a failing `fs.copyFileSync` propagates, per `docs/observability.md`. The plan has no `Documentation Updates` section. Both `Derived Test Matrix` rows for task 4 are named in its TEST FIRST and exist in `upgrade.integration.test.ts`.

## Identified Gaps Log

None
