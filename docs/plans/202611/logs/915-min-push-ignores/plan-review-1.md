Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **(plan edit) The owner-required reader inventory misses a test that reads below `<!-- bkit:end -->` and that a min push skips.**
   - The owner's 2026-11-10T06:56:41Z comment says to list every code, build and test path that reads `docs/templates/bkit-audit-*.md`, and to stop and bring it back to the owner if one reads below the marker.
   - Context & Goals row 8 says the bkit repo tests read "The source `.bkit/core/docs/templates/`, never the installed `docs/templates/` copies", and marks them "Reads below `bkit:end`? No."
   - That is wrong for `.bkit/core/engine/audits/templates/templates.test.ts:211-228` (`%s dogfood managed block differs only by the managed-version stamp`). It reads each installed `docs/templates/bkit-audit-*.md` (`fs.readFileSync(path.resolve(relPath))`, `:215`) and asserts on the text after the marker: `expect(dogfood.slice(dogfood.indexOf("<!-- bkit:end -->"))).toMatch(/^<!-- bkit:end -->\n\n## Project Instructions\n/)` (`:224-226`).
   - bkit's own `bkit:gate:min` (`package.json:58`: `format:check`, `format:tables:check`, `bkit:lint:prose`, `bkit:slop:delta`, `ledger-integrity.test.ts`) does not run that test, and a `[skip ci]` head means CI does not run it either.
   - Failure path: in the bkit repo, a below-marker audit-template edit that drops or renames the `## Project Instructions` heading, or the blank line after the marker, now passes `minPushOutside`. It goes to `dev` on the light gate and leaves a red unit test that nothing ran. So the plan's conclusion "Neither can change a gate result that a min push skips" and Open Question 1's premise for Recommended A) ("the read cannot change a gate result that a min push skips") do not hold.
   - Edits that resolve it:
     - Correct row 8 and add a row for this test.
     - Restate Open Question 1 with this reader and with remedies as lettered options. Examples: add `.bkit/core/engine/audits/templates/templates.test.ts` to bkit's own `bkit:gate:min`, which is the existing `.bkit/templates.md` § Git hooks guidance "a test that reads a min-push file goes into `bkit:gate:min`" (this becomes a runbook task with a hook or gate test). Or narrow the test's below-marker assertion. Or keep audit templates on the full gate in the bkit repo.
     - Replace its `Default if unanswered: A)` with a blocking default, since the owner said to stop: for example "none; Gate 1 stays open until the owner answers", as Open Question 2 already does.
     - Add the "below-marker edit removes the `## Project Instructions` heading" case to `Edge Cases`.

## OPTIONAL

1. **Concrete Example step order does not match the hook.** Steps 1-3 put `pnpm bkit check` first. In `.bkit/templates/.husky/pre-push` the order is `bkit ci min-push $PUSH_UPDATES` (`:151`), then the `[skip ci]` guard's `bkit ci min-push --ref` (`:161`), then `pnpm bkit check` (`:178`). Reorder the steps so the example reads as the hook runs.
2. **Task 2 `DEPENDS ON: 1` has no consumed artefact.** Task 2 edits only `minPushPathspecs`, the `output.paths` help, comments in `core.ts` and three tests. It uses nothing from `managedHead`. The order is harmless. Dropping the edge, or noting it is order-only, keeps the graph honest.
3. **`DONE WHEN` asks for `pnpm bkit:check:dist` but not for staging `dist/`.** `bkit:check:dist` (`package.json:88`) rebuilds and runs `git diff --exit-code dist/` against the index, so it fails until `dist/` is staged. Write "`pnpm build && git add dist/`" in Tasks 1-4 (`.agents/rules.md` § Engine builds).
4. **Task 1's red reason may not match what happens.** "fails on `managedHead` not existing, so the file does not load". Vitest's transform turns a missing named export into `undefined`, so the likely red is `managedHead is not a function` per test, plus a `pnpm typecheck` error. A red row that does not match risks Gate 2 "Tests unchanged". Restate the expected red.
5. **One edge case has no test row.** `Edge Cases` lists "adds a second line-anchored `<!-- bkit:end -->` or `<!-- bkit:start -->`". Task 1 tests two `bkit:end` lines and Task 3 tests a second `bkit:end`, but nothing tests a second `bkit:start` below the end marker. That is exactly the case where the text through `bkit:end` stays byte-equal, so only the marker count catches it. Add one `managedHead` case to the Task 1 matrix row (the task then has 5 tests).
6. **Task 3 is at the per-task cap** (10 tests across 2 files). Any test added to it in review needs a split. A natural split is the ci.test.ts refusals versus the two hook cases.
7. **`.bkit/core/.bkit/cli.md:118` wording.** The `min-push` summary says "every file a push changes is one bkit writes". The plan keeps it on the argument that "one bkit writes" also covers a consumer-edited project section. That is debatable, because the section is consumer-owned. If the summary stays, a short line in Task 5's `templates.md` bullet saying what "bkit writes" now includes avoids misreading it.
8. **Task 5 `READ: .bkit/instructions.md`.** The `Shared instructions` rule covers workflows, prompts, the rules block and audit templates, not `.bkit/core/.bkit/templates.md`. Running the command is harmless, but it is not required.

## OUT OF SCOPE

1. An audit run that pushes a `[skip ci]` head to a feature branch with an open PR still hits `bkit ci bookkeeping-push` (ship's `--scope=pr` allow-list, which has no `docs/audits/**`). The plan keeps this unchanged by design (second assumption). If the owner wants audit artefacts to pass that guard too, it needs its own issue, because widening `bookPathspecs` also widens ship's staging list (`docs/decisions.jsonl` `min-push-floor-is-ship-allow-list`).

## SUGGESTED SCOPE EXPANSION

- #923 (Pre-push: block in seconds when the PR conflicts, OPEN). Source: `related-issues.md`. It overlaps `.bkit/templates/.husky/pre-push`, which this plan's integration tests run but do not edit. Recommendation: keep separate.
- #818 and `docs/deferrals.jsonl` `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo` (TRIAGED). Source: `related-issues.md` and `related-deferrals.md`. They overlap the pre-push gate selection that this plan's light-gate decision feeds. Recommendation: keep deferred; it needs its own decision.
- #503 (Prompt audit) and #483 (Repo audit), both OPEN. Source: `related-issues.md`. Each run writes a `docs/audits/{YYYYMM}/*.md` report and edits a `docs/templates/bkit-audit-*.md` project section, which is exactly the push this plan admits. Recommendation: no scope change; use the next run as the live check of Manual Verification Step 3.
- `docs/failures.jsonl` `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate` (TRIAGED, LOW). Source: `related-failures.md`. It overlaps the full pre-push gate that this plan's integration cases run under. Recommendation: keep deferred; re-run a timed-out hook case alone before treating it as red. (`related-failures.md` is cut short at 12 of 42 lines, so its other rows were not read.)
