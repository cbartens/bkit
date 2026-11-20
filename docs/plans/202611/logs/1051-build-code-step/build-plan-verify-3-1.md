Verdict: CONCERNS
Failures: 1
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

- Mode `Group`, judged against `build-diff-3-1.md` (`steps.ts`, `steps.test.ts`, `.bkit/core/.bkit/workflows.md` and its rendered `.bkit/workflows.md`, `.bkit/version`, `dist/commands/workflow/steps.js`, `docs/testing.md`). No prompt, workflow or install file changed. The brief's `Deviations` are the run rules; the diff keeps to the files they allow.
- `pnpm exec vitest run .bkit/core/engine/commands/workflow/steps.test.ts`: 197 passed. All seven `TEST FIRST` tests exist with the planned names. Test-first audit `build-tests-green-3-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`.
- Already landed: task 5 "outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json". The tests step's reason: it pins unchanged behaviour that the existing exit-13 path already satisfies, so no red is due. No gap.
- Task 6 is satisfied. `recordGenerateFriction` keys its row `steps-finish-generate/<step>` (at most 56 characters, under the 60-character key limit). The exit-11 writer keeps the `frictionKey` default `steps-finish/<step>`, so `appendFrictionRow`'s same-key fold no longer merges the two.
- Task 5: the set-aside, generate and write-back flow, the own-repo guard (`isBkitOwnRepo`), the shared-checkout guard (`recordedPath`) and the unchanged path outside bkit's own repo all match the DONE WHEN. The doc source, the rendered doc, the `exitCodes` help, the `docs/testing.md` row and `dist/` are updated. `.bkit/cli.md` does not carry the exit-13 text, and `pnpm exec tsx .bkit/core/engine/tools/cli-doc.ts` exits 0, so no `cli:sync` was due. One gap stays open: the result of the write-back is never checked (see the log).
- Task 5 also adds a private `writeWorkflows` that always writes 2-space indent and a trailing newline. The engine has no exported `package.json` writer: `writePackageJsonLike` is private in `install/modules/core.ts`, a file outside this task's allowed files, and `uninstall.ts:846` writes the same fixed format. This path runs only in bkit's own repo, whose `package.json` uses that format, so this is not logged as a gap. The fix for the logged gap (write back the original bytes) would also make the file byte-identical in every format.
- Task 5's design comes from `build-decision-1-2.md` Q1 ("B, fix now"), which the orchestrator recorded as an assumption for the owner: assumed, not the owner's acceptance. The challenge finding's `Fixable: false` is answered by that decision and is not a gap.
- `docs/observability.md` exists; the gap cites its § Error tracking.

## Identified Gaps Log

TASK 5: `.bkit/core/engine/commands/workflow/steps.ts` `finish` ignores the `false` that `writeWorkflows` returns when it writes the kept working `bkit.workflows` back (both the failed-generate branch near line 1528 and the generate-differs branch near line 1537), so when the write-back fails (for example a `bkit:generate` that leaves `package.json` unparseable, which makes `readPackage` return `null`), the agent's own reading is silently discarded and finish exits 13 telling it to "restore HEAD's values", against the DONE WHEN "writes the kept working reading back so nothing the agent wrote is lost" and `docs/observability.md` § Error tracking ("The command reports its failure to the caller"); fix by keeping the working file's original bytes and writing those back, and by logging and refusing when the write-back fails, with a test in `steps.test.ts` — Fixable: true
