Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6, 7, 8, 9
Loosened: none
Fingerprint: 209a173193ff4e449f00094ee69d271435ecfb077024f4e62351f53719eed620
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

All four Group 2 tasks are satisfied against `build-diff-2-1.md`; no decision records, earlier group 2 verify reports or remediate logs exist.

- TASK 6: `tests run --changed-since` validates the sha with `git rev-parse -q --verify {sha}^{commit}` (an option-like value such as `--all` is refused), runs `bkit:gate:changed` with `changedFiles(top, sha)` as arguments under the same report-dir and lock environment, records `{gate} ({n} changed files)` as the scope, writes a PASS row and runs nothing on zero files, and falls back to the resolved `--gate` whole when `bkit:gate:changed` is undeclared. `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` list the flag; `dist/commands/workflow/tests.js` and `tests-changed.js` carry the change. The six tests use `tierTimeouts(true).testTimeout`, real temporary git repositories and the file's existing spawned package-runner shim.
- TASK 7: Step 8 sub-step 8 and Step 9 sub-step 3 in `.bkit/core/workflows/bkit-build.md` re-derive `GROUP_BASE` with `status route --step=build-group-start --group={GROUP}` and pass `--changed-since={GROUP_BASE}`; Step 12 (`build-run-tests`, line 1064) still runs the whole deepest gate. `bkit-build-plan-verify.md` describes the changed-files scope. Mirrors and `bkit-build.none.txt` are refreshed.
- TASK 8: the soak prompt runs `bkit tests changed --fallback=bkit:gate:static-unit` in step 6 and the `Verdict` lines, with the exit-81 line; `GATE_CALLERS` gained the soak entry and the caller count is 5. `bkit-debug.md` Step 3 (line 382) is unchanged. The execution log's follow-up added the shared `Local pre-commit` rule to the soak prompt and its `.bkit/instructions.md` carry lists; it is the shared clause, copied verbatim.
- TASK 9: `lowerVerifyMaxAttempts` runs in `seedCorePackageJsonScripts` after `pruneMinPushPaths` (itself after `migrateBkitLayout`), logs one `core:` line naming the old value, keeps the indent and honours `dryRun`; `docs/migrations.md` has its row; bkit's own `package.json` already holds `build.verify.maxAttempts: 2`.
- Evidence: `pnpm exec vitest run` on `.bkit/core/engine/commands/workflow/tests.test.ts`, `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` and `.bkit/core/engine/install/modules/core.integration.test.ts` passed (352 passed, 2 skipped, none of the skips added by this group). `node dist/cli.js check` exited 0 with advisories only and no drift. The test-first audit (`build-tests-green-2-1.md`) is `Enforced: true`, `Gaps: 0`, `Unproven: 0`.
- Every Derived Test Matrix row for tasks 6-9 maps to a `TEST FIRST` test that exists and passes. The Group 2 rows of `Documentation Updates` (`cli.md` regenerated, `docs/migrations.md` row) are done; the remaining rows belong to TASK 12 in Group 3.

## Identified Gaps Log

None
