Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 17, 8, 9, 10, 11, 12, 13, 14, 15, 16

<!-- verdict:end -->

# Plan Verification

## Scope

`Holistic`

## Groups Verified

8 of 8 (the plan has 8 groups: 1-8; tasks 1-17).

## Integration Gaps

0. The cross-group contracts line up:

- Config → resolver → workflow: `settings.ts` `buildPublish` (Task 1) feeds `status route` `publishRoute` (Task 4), which `bkit-build.md` Step 2 sub-step 3 calls after `runtime row` and holds as `PUBLISH` / `PUBLISH_SOURCE` (Task 12). The `coerced` warning is wired. Step 2 runs again on every resume, so nothing is carried in a shell variable.
- Seed ↔ parser ↔ advisory: the install seed `{ remote: true, local: true }` merged beside the ask blocks (`core.ts:577`, Task 6) is the shape `readBkitConfig` parses and `detectBuildPublish` accepts silently (Task 3). This repo's own `package.json` carries it after the dogfood install (Task 16).
- Summary → close: Step 15 passes `--publish={PUBLISH}` to `workflows summary` (Task 5). The held fence passes `--ending=held --publish=false` to `workflows close` (Task 10). Both flags exist in `dist/cli.js` help. `roadmap feature --root --workflow --fid` exists with those flags.
- Close rows → telemetry → harvest: `workflow-done` `ending?: "done" | "held"` / `publish?` (`status.ts:63`) match the close's rows. `OUTCOME_ENDINGS` / `RUN_ENDINGS` accept `held`. Harvest `endingOf` (`bkit-harvest.mjs:1454`) reads the same `workflow-done.ending`. `jsonl.md` and `docs/observability.md` describe both fields.
- Payload retirement: `BKIT_CANONICAL_DOCS` no longer lists `lite.md` (Task 7), the manifest entry and source doc are gone (Task 17), uninstall keeps the retired path (Task 9), and the docs index rows are removed (Tasks 8, 14). `bkit check` exits 0 with `0 write(s) would occur`.
- End to end: `close-squash.integration.test.ts` runs the shipped Step 15 line and Step 16 held fence against a real repo and bare remote. `ship-verdict.integration.test.ts` runs ship's no-PR route, `runs gate` and `prs merge --match-head` against a bare origin. Both pass.

## Previously Attempted

None for the holistic pass (first attempt). Per-group verifications this pass builds on: `build-plan-verify-1-1.md` (PASS, 1-3), `build-plan-verify-2-1.md` (PASS, 4-5), `build-plan-verify-3-1.md` to `3-4.md` (final PASS, 6, 7, 17), `build-plan-verify-4-1.md` / `4-2.md` (PASS, 8-9), `build-plan-verify-5-1.md` / `5-2.md` (final PASS, 10-11), `build-plan-verify-6-1.md` to `6-5.md` (final PASS, 12-13), `build-plan-verify-7-1.md` to `7-3.md` (final PASS, 14-15), `build-plan-verify-8-1.md` (PASS, 16).

## Notes

- **Mode:** `Holistic`, judged against the codebase at `d9e1b2290` plus the working-tree plan edit that ticks Task 16. Since `f621d3736` (the group 8 verify) only `docs/plans/**` log files changed. `tmp/bkit-diff-715-retire-lite-workflows.md` is partial diff coverage: 204 files, the 20 largest shown. Code was read directly where the diff file was cut.
- **Suite command:** `bkit tests changed` is not a verb in this CLI (`[bkit-tests] unknown verb "changed"`), so the fallback ran: `pnpm bkit:gate:static-unit` → exit 0 (static, 162 unit files with 6749 passed and 2 skipped, bats).
- **Other runs this pass:**
  - The five integration files named in DONE WHEN (`core.integration`, `upgrade.integration`, `install.integration`, `close-squash.integration`, `ship-verdict.integration`): 5 files, 243 passed.
  - `pnpm test:harvest`: 61/61 passed.
  - `node dist/cli.js check`: exit 0, `0 write(s) would occur`, no `DRIFT DETECTED`.
  - `bkit tests plan-check`: 0 problems. Its 3 existence findings (`migrateShortcutsToLite` and `.bkit/core/.bkit/lite.md` are gone) are the intended result of Tasks 7 and 17.
  - Every DONE WHEN `grep`: Task 8, Task 14 sources, Task 15 and the absence of `.bkit/lite.md` all return nothing as required. The engine-wide `:lite` grep returns only this plan's own guard-test titles and patterns, which group 7's verify judged met in intent.
  - `pnpm bkit:gate:static-unit-integration` is not re-run here. `build-plan-verify-8-1.md` ran it green at `f621d3736`, and no code changed since then.
- **Derived Test Matrix:** all 76 rows map to a task whose DONE WHEN runs that file. All 74 `TEST FIRST` titles exist in their named files (the `trackers.test.ts` title is the parameterised `${wf}: the none render matches its baseline byte for byte`).
- **Documentation Updates:** every row is done:
  - `docs/decisions.jsonl`: 4 rows, both old decisions superseded.
  - `docs/deferrals.jsonl`: 7 `715-*` rows.
  - `docs/migrations.md`: the "Lite workflows retired" row.
  - `docs/observability.md` and `.bkit/core/.bkit/jsonl.md`: `held` and `publish`.
  - `README.md`: the hold row, held handoff and batch recipe.
  - `.bkit/core/.bkit/README.md`: the held usage and batch recipe.
  - `.bkit/core/.bkit/workflows.md`: the build Output and § Publish resolution.
  - Every source in `trackers.md`, `templates.md`, `authoring.md`, `prompts.md`, `rules.md`, `docs.md`, the three prompts, both issue forms and `.bkit/instructions.md` returns empty for the lite grep.
- **Test-first audit:** none was supplied for this pass. Each group's gaps were decided in its own verify. The owner accepted them in `build-decision-1-1.md` (group 3, Q2-Q9), `build-decision-1-2.md` (group 5, Q1-Q6), `build-decision-1-3.md` (group 6, Q1-Q6) and `build-decision-1-4.md` (group 7, Q1-Q8). All are `Decision: Accept` from the owner; none is `Accept (assumed)`. The matching TEST EXCEPTION fields are in the plan.
- **Observability:** the new errors surface as `CommandError` usage messages and the telemetry `validate` reason (`outcome publish must be a boolean …`), per `docs/observability.md`. No new log line is needed.
- **Plan checkboxes (for the orchestrator, not a gap):** Tasks 3, 5, 6, 7, 17, 9, 10 and 11 are still `[ ]` in the plan. Their group verifies passed them (`1-1`, `2-1`, `3-4`, `4-2`, `5-2`), and this pass confirms each DONE WHEN against the codebase. The workflow's tick step appears not to have applied those ticks; the `Tasks` line above lists all 17.
- **Out of scope, propose separately:**
  - `origin/dev..HEAD` carries 16 non-715 commits from other issues (e.g. `fix(766)`, `fix(787)`, `fix(disk)`, `feat(770-784)` audit-template commits, `chore(cleanup)`). They inflate the PR diff and were not judged here.
  - On the held path, the Step 15 `steps finish --post --link-ref={BRANCH}` comment and the held close's `--tree={BRANCH}` artifact links point at a branch that is not on `origin` until `/bkit-ship` pushes it, so those links do not resolve until then. The plan does not address this. No DONE WHEN covers it.
  - The held close passes no `{LABEL_FLAGS}`, so a held close never carries the `bkit [auto route]` marker. This was noted in `build-plan-verify-6-5.md` and fits the design, but the plan does not record it.

## Identified Gaps Log

None
