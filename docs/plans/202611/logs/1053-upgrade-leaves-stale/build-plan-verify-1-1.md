Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none
Fingerprint: c8040bbe8f829bf448056c8990dd383341978fecccc1bc2476b5ebe986aac6c5
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

All four group-1 tasks are satisfied against the group diff (`build-diff-1-1.md`).

- TASK 1: `listRenderedOutputs` in `.bkit/core/engine/install/modules/index.ts` lists the overwrite-mode `.bkit/*.md` docs (via the new shared `bkitDocWriteMode` in `core.ts`, which `runBkitDocs` also uses), `.bkit/allowlist.json` and the `bkit-*` host mirrors present, excluding every `.agents` path. `listStampedFiles` keeps its set through the extracted `listRenderedMirrors` (same loop). `dispatchModules` sets `ctx.renderedOutputs` after the modules and before `postDispatch`.
- TASK 2: `runUpgradeCommand` adds `listRenderedOutputs(process.cwd())` to `updated` beside `renderedDocPaths`; the upgrade test proves the mirror, doc and allowlist entries are re-recorded and the wrong `package.json` entry is left alone.
- TASK 3: the core `.bkit/version` `postDispatch` re-hashes every `ctx.renderedOutputs` path, logs `stale .bkit/version entries re-recorded: ...` and counts a differing existing entry toward `hasNewEntries`, so `bkit check` fails through the existing write-set drift path. Only an existing entry that differs triggers the write; a missing entry does not (no DONE WHEN asks for it).
- TASK 4: `mergeCanonicalHashes` prunes existing and drops fresh `.agents/` entries via `isAgentsPath`; the writer-side skips in `core.ts` and `upgrade.ts` are gone (grep finds no other `startsWith(".agents"` in the four engine files besides the intended filter in `listRenderedOutputs`).
- Every `Derived Test Matrix` row has its test in the owning task, and all nine exist in the diff.
- Tests run by this verifier, all passing: `check.integration.test.ts`, `index.integration.test.ts`, `version-file.test.ts`, `version-file.integration.test.ts` (315 tests), and `core.integration.test.ts`, `upgrade.integration.test.ts` (247 tests). This covers TASK 3's clean-install check cases for each host.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no Taken over, Changed by a code step, Updated tests or Already landed sections.
- The `.bkit/version` and `dist/` changes in the diff belong to group 2's TASK 6 and are not judged here.
- No decision records, earlier verify reports or remediation logs were supplied. No new error paths were added, so `docs/observability.md` adds no requirement.

## Identified Gaps Log

None
