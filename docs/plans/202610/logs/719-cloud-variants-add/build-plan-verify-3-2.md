Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5, 6, 19, 20
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3 — tasks 4, 5, 6, 19 and 20, judged against `build-brief-3-1.md`, `build-brief-3-2.md` and `build-diff-3-2.md`.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-3-1.md` verified tasks 4 and 5 and reported the stale Codex footprint assertion and incomplete changed-files check. `build-plan-gaps-remediate-3-1-log.md` preserved both gaps after source-only remediation could not correct the planned test and another checkout held the tests lock. Both gaps are resolved by the completed work below.

## Notes

- TASK 4 is satisfied. Source and built variant lists include codex, both `CLASSIC_VERB_HELP` entries include it, and the generated CLI references match. `build-tests-green-3-2.md` records all three named tests passing. Independent `node dist/cli.js install --help` output lists codex and the wired-tracker guidance. The required `git grep` for `OPENCODE_PROVIDER_KEY` in `cli.ts` returns no matches. The currency report's additional help-table requirement is implemented, and the existing CLI-doc assertion was corrected to retain its pipe-escaping check with the added variant.
- TASK 5 is satisfied. The group diff implements the variant guidance table and `trackerAdvisoryLines`, reuses `OPENCODE_PROVIDER_DEFAULTS` for the OpenCode credential name, records the selected cloud agent, and retains copy-and-own setup. Source and installed env examples contain the commented `BKIT_OPENAI_API_KEY` row. All five named tests pass in the green audit; their real-filesystem integration cases cover every variant/tracker combination, provider-specific credentials and the persisted cloud fact.
- TASK 6 is satisfied. The validator rejects tracker `none`, and Codex/OpenCode prerequisites permit the host installed in the same invocation. Both checks execute before manifest writes and emit actionable bracket-prefixed errors. The required `git grep` finds no `validateCloudTrackerMatch` under `.bkit/core`. All six named tests pass in the green audit. `build-tests-red-3-3.md` also records the complete install integration file passing all 62 tests against the current implementation.
- TASK 19 is satisfied. `build-decision-2-1.md` records the owner's explicit `Fix now — yes` decision for correcting the stale footprint expectation. The corrected case retains its name, exit 0, Jira tracker and codex-agent assertions and now requires `.codex/hooks.json`. The current Codex module writes that hook file and explicitly excludes `.codex/config.toml`. This implements the approved test correction; no requested behavior assertion was weakened and no retired host file was added. The full install integration file passes.
- TASK 20 is satisfied. The same decision record explicitly requires completing verification. After the unrelated lock holder exited, generation completed successfully: `tmp/group3-finish-generate-recovery.log` contains the build, synchronization, upgrade, 288 passing render tests across four files and completed graph refresh. `tmp/group3-finish-changed-final.log` reports exit 0 and PASS, with 3,885 tests across 53 files, five Bats cases and formatting passing. Its selected changes are generated `DETAILS.md`, `docs/capabilities.md` and workflow artifacts; this is a completed changed-files check, not a claim that the full static/unit gate has run. The workflow's normal post-verification static/unit gate remains the next step. No full gate was repeated by this verifier.
- The execution log's `Verdict: FAIL` preserves an initial generation failure while waiting for another checkout's tests lock. Its later DONE entry and raw recovery evidence demonstrate successful completion, so that historical header does not establish an unresolved task gap. The earlier synchronous Git fixture stall remains recorded with an unconfirmed cause; targeted cases and the completed changed checks pass without a speculative source fix. Scratch Jira/Codex installation evidence records exit 0, saved tracker/agent facts and the current hook footprint.
- Test-first enforcement is active: `build-tests-green-3-2.md` reports PASS, zero gaps and zero unproven cases. Its Already landed entries both name `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=jira --codex --auto=codex exits 0 and records codex`: TASK 6 passed because the existing implementation satisfies the planned behavior, and TASK 19 passed because the existing Codex module already writes the corrected hook output. The tests step preserved earlier red evidence and did not undo implementation to manufacture another failure. There are no Updated tests entries or test-loosened gaps.
- Each Derived Test Matrix row for tasks 4–6 and 19 maps to its task's named DONE WHEN tests. Five tasks and 15 TEST FIRST entries fit the supplied caps, including the shared case on tasks 6 and 19. Documentation Updates rows assign remaining documentation work to later groups or ledger writers; none adds unfinished documentation work to this group. Architecture, security, test-tier and observability contracts are satisfied for these install changes; no database or new external-request boundary is introduced. Independent `git diff --check` exits 0.

## Identified Gaps Log

None
