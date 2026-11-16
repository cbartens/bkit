Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 59b3a3629fba45ef5166e4fbadb34415143d91779c4b816e749ba7893a5b1b6e
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

- TASK 1: `injectOpencodeDerivedAllows` in `.bkit/core/engine/install/modules/opencode.ts` no longer writes `permission.bash` `curl *{base}*` / `wget *{base}*`; the `permission.webfetch` `*{base}*` loop is unchanged (decision `551-opencode-unanchored-host-allows-accepted-risk`). The doc comments, both `opencode.integration.test.ts` tests, the `index.integration.test.ts` parity test and comments, the `cloud-env.integration.test.ts` comment, `providers.md` (`:488`, `:510`) and `workflows.md` (`:1618`) are updated. `git grep -n 'curl \*{domain}\*' -- .bkit/core/.bkit/` returns nothing. `pnpm bkit:check:dist` exits 0. The `.opencode/opencode.json` regenerate has no diff, which is expected: reconcile deep-merges existing keys, so the legacy shell keys stay until Task 10 and the `webfetch` keys are unchanged.
- TASK 2: `detectOpencodeSubstringFetchGrants`, `isOpencodeSubstringFetchKey` (the exported matcher for `uninstall.ts`) and `redactUrlParts` are in `.bkit/core/engine/checks/before/files.ts`, read with `readJsonFile` and never write. `runPreflight` pushes the finding beside `detectPlaywrightReporterHostile`. The `providers.md` OpenCode row describes legacy entries in words. The upgrade integration test spawns the real CLI (`install --opencode=openrouter`, then `upgrade --auto-apply`) over a seeded legacy file. The checklist printer (`.bkit/core/engine/checks/after/index.ts:139`) prints `Action:` for every finding, so the removal action reaches the output.
- Tests: the 5 touched files (`opencode.integration.test.ts`, `index.integration.test.ts`, `files.test.ts`, `cloud-env.integration.test.ts`, `checks/before/index.test.ts`) pass with 240 of 240 tests, and the `upgrade.integration.test.ts` #803 test passes.
- Test-first audit `build-tests-green-1-1.md`: `Enforced: true`, 0 gaps, 0 unproven, all 8 planned tests went red and then green.
- Derived Test Matrix: all 8 rows for Tasks 1 and 2 map to the tests their `TEST FIRST` names. The Group 1 Documentation Updates rows (`providers.md` `:488` / `:510` and the Task 2 legacy sentence, `workflows.md` `:1618`) are done. Host mirrors are deferred to Task 10.
- `docs/observability.md`: no new log name. The detector returns null on an unparseable file, so no error path needs a log.
- A scratch-consumer dogfood run of `dist/cli.js` was denied by the permission system. The upgrade integration test runs the same CLI path, so the evidence is still complete.
- No decision records, earlier verify reports or remediate logs were supplied.

## Identified Gaps Log

None
