# Docs Update

## Files Modified

- `docs/testing.md` (edited earlier this cycle, already committed in `edf98a3e6` and `e70ff7fa0`; this re-check found nothing new to change)

## Drift Resolved

History: the clone is not shallow (`git rev-parse --is-shallow-repository` prints `false`), so all of `origin/dev..HEAD` (104 commits) was read.

- `docs/testing.md` (content sync, then compress, then cross-references): the test inventory rows had not caught up with the tests this cycle added. Each row below now names the new coverage.
  - `commands/workflow/summary.test.ts`: `Publish: held` and `Docs: not synced` lines on a held build, `Publish: pr` otherwise, verdict and next step unchanged by `publish`.
  - `close-squash.integration.test.ts`: the `bkit-build.md` held close run verbatim (origin refs unchanged, branch and worktree kept, lock released, rows, summary and worktree-only roadmap row).
  - `commands/workflow/status.test.ts`: `status route --workflow=build` publish resolution (token over `publish.local`, `local` on LOCAL, non-LOCAL `false` coerced to `true`, unknown token falls through, `publishSource`).
  - `commands/workflow/repo.test.ts`: `buildPublishRemote` / `buildPublishLocal` and their defaults.
  - `commands/workflow/workflows.test.ts`: `close --ending=held --publish=false` and the `workflow-done` row.
  - `shared/settings.test.ts`: `workflows.build.publish` defaults, `local: false`, the `remote: false` coercion, invalid keys.
  - `workflow-shape.test.ts`: the build publish ending checks and the no-lite-workflow guard.
  - `ship-verdict.integration.test.ts`: deferred landing of a held build.
  - `uninstall.test.ts`, `upgrade.integration.test.ts`: the retired `.bkit/lite.md` block is stripped and the consumer section is kept.
  - `instructions-sources.test.ts`: no shipped rule, prompt or clause instructs a `next:*:lite` label.
- Already in sync, no edit needed: `docs/migrations.md` (the "Lite workflows retired" row), `docs/observability.md` (`held` ending and `publish: false`), `docs/roadmap.md` (item 20 no longer names a lite workflow), and the `.bkit/*.md` docs and `README.md` for `publish`, `held` and the retired lite surface. A scan of `docs/*.md` found no remaining `lite` workflow or `next:*:lite` mention. The only `:lite` text left is the retired fence in `.bkit/instructions.md:1015-1018`, kept on purpose.
- Left alone on purpose (out of scope, not doc drift from this cycle):
  - `docs/roadmap.md` carries three `_(refreshed ...)_` lines under `## bkit`. Two came from the merge. The roadmap tool owns that file.
  - `docs/testing.md` lists `commands/workflow/status.test.ts` twice (lines 602 and 696). That was already so before this cycle.
  - `docs/testing.md` still has no rows for `checks/before/repo.test.ts`, `ledgers/telemetry.test.ts`, `commands/stats.test.ts` or `commands/workflow/disk.test.ts`. The table is a partial inventory, and those files had no rows before.
- Agent memory: `MEMORY.md` holds only pointers and nothing about the retired lite surface. One entry, `reference_zsh_colon_modifier_in_label_names.md`, uses `next:<phase>:lite` as its worked example. The zsh lesson still holds, so I left it. The caller may reword the example.

## Pending Items

From `ship-pending-items.md`, 12 deferral rows for `715-retire-lite-workflows`, all for human review. Nothing was written to `docs/deferrals.jsonl`.

Declared out of scope (`reason` `scope-declared`):

- `715-historical-audit-report-mentions`: dated `docs/audits/202610/*.md` reports keep their lite mentions.
- `715-consumer-lite-content-migration`: a consumer's lite content is preserved in a stub, not converted into a workflow.
- `715-tracker-label-definitions-unchanged`: existing GitHub `next:*:lite` label definitions are not deleted.
- `715-debug-publish-mode-unchanged`: debug's `PUSH_MODE` and CI-wait are unchanged.
- `715-build-verification-unchanged`: build verification, challenge, worktree and dev-push behaviour are unchanged.
- `715-build-docs-sync-stays-in-ship`: docs sync stays in `/bkit-ship`.
- `715-no-batch-publish-verb`: no `bkit ship --batch` verb.

Build challenge findings (`reason` `low-severity`):

- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269`: a `publish=true` substring in pasted prompt text overrides `publish.local: false`. Needs an owner decision.
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-232`: `takeLock` replaces a stale lock non-atomically.
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-245`: a sweep that runs longer than `LOCK_STALE_MS` never renews its lock.
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-559`: a timed-out low-disk setup wait still stamps the `--auto` step files.
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-audits-workflows-ship-verdict-integration-test-ts-302`: the landing test's `openPr` runs only part of ship Step 2's no-PR fence.

## Blockers

None
