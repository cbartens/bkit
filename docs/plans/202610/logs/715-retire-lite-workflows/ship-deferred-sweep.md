Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md` (anchor `baseSha: e0542d74e`, last committed 2026-11-01T04:26:21Z; the copy in `ship-input-2.md` § Plan is byte-identical). No design doc exists. Judged at `bda284bed` (working tree clean apart from ship-run logs). Diff file `tmp/bkit-diff-715-retire-lite-workflows.md` is partial diff coverage (131 files, 20 largest shown), so the code was read directly.

Checks run by this sweep:

- `pnpm exec vitest run` on the 19 unit files the plan's `DONE WHEN` lines name: 19 files, 1691 passed.
- `pnpm exec vitest run` on `core.integration`, `upgrade.integration`, `install.integration`, `close-squash.integration`, `ship-verdict.integration`: 5 files, 253 passed.
- `pnpm test:harvest`: 61 tests, 61 pass, 0 fail.
- `node dist/cli.js check`: exit 0, `0 write(s) would occur`, no `DRIFT DETECTED`.
- `pnpm bkit:gate:static-unit`: exit 1 at `prettier --check .`, whose only warning is `docs/plans/202610/logs/715-retire-lite-workflows/ship-input-2.md`, the untracked input file this ship run wrote. It is not in the branch. Every other part was then run alone and passed: typecheck and lint (before the stop), `format:tables:check` exit 0, `lint:prose` exit 0, `slop:delta` exit 0, `test:coverage:unit` exit 0 (165 files, 6885 passed, 2 skipped), `bkit:test:bats` exit 0.
- `pnpm instructions:sync` (it runs with `--write`): the working tree was unchanged afterwards, so the store is in sync.
- `pnpm bkit:gate:static-unit-integration` and a full `pnpm vitest run` were not re-run by this sweep. `run-tests-1.md` records `static-unit-integration` PASS for the build.

## Planned vs Delivered

Success criteria (plan § Acceptance Scenario § Success Criteria, copied from issue #715):

- `Delivered` SC1 — install / upgrade leave no managed lite block and keep consumer content below `bkit:end`. Evidence: `.bkit/core/.bkit/lite.md` and the root `.bkit/lite.md` are absent; `manifest.ts` has no `lite.md` entry; `migrateRetiredLite` at `.bkit/core/engine/install/modules/core.ts:425` with `RETIRED_LITE_STUB_SENTINEL` at `core.ts:410`, called at `core.ts:329`; the migration cases in `core.integration.test.ts` and `upgrade.integration.test.ts` pass.
- `Delivered` SC2 — no current doc, prompt, workflow or label rule names a `<phase>:lite` workflow or a `next:*:lite` label. Evidence: the Task 14 grep over `.bkit/core/.agents`, `.bkit/core/prompts`, `.bkit/core/.bkit` and both `bkit-change.yml` forms returns nothing; the Task 15 grep over `README.md` and `docs/roadmap.md` returns nothing; across `.claude`, `.cursor`, `.opencode`, `.codex`, `.agents`, `.bkit/*.md`, `.bkit/core/workflows` and `docs/templates` the only hit is `.bkit/instructions.md:1015-1018`, inside the `retired` fence of `### tracker-next-labels`. That fence holds the retired text on purpose, and `instructions-sources.test.ts:187` strips it before asserting no lite text. The remaining `:lite` hits in `.bkit/core/engine` are the guard tests' own regexes.
- `Delivered` SC3 — small-change guidance points at `/bkit-build #N`. Evidence: `README.md:100` and `README.md:106`, `.bkit/core/.bkit/trackers.md:114`, `.bkit/core/.bkit/templates.md:607`, `.github/ISSUE_TEMPLATE/bkit-change.yml:13`, `.bkit/core/.bkit/README.md:64` and `:331`; `templates.test.ts` passes.
- `Delivered` SC4 — `publish` defaults to `{ remote: true, local: true }`, `local: false` holds, `remote: false` is refused with an advisory. Evidence: `settings.ts:196` defaults; `settings.ts:253-258` (`remote` is always `true`); `invalidBuildPublish` at `settings.ts:241`; advisories `bkit-build-publish-remote` / `bkit-build-publish-invalid` at `.bkit/core/engine/checks/before/repo.ts:103` and `:114`; `package.json:206-209` is seeded; `settings.test.ts`, `checks/before/repo.test.ts` and `index.test.ts` pass.
- `Delivered` SC5 — a `publish=false` run pushes nothing, opens no PR and starts no CI, keeps the worktree and branch, releases the lock, ends `held`, and leaves the issue `In review` with the comment, `Publish: held` and `Docs: not synced`. Evidence: `.bkit/core/workflows/bkit-build.md:1027-1036` (held close with `--ending=held --publish=false`, title "Built locally, not published"); `summary.ts:312-313`; `telemetry.ts:618` (`OUTCOME_ENDINGS` includes `held`); `close-squash.integration.test.ts` (remote refs unchanged, lock released, rows and summary lines) passes.
- `Delivered` SC6 — a `publish=true` run behaves as today. Evidence: `bkit-build.md:1172` keeps the probe, push, PR and dispatch under `PUBLISH` = true; the `workflow-shape.test.ts` case for the `publish=true` close path passes; the `bkit-build` none-render baseline in `render/trackers.test.ts` passes.
- `Delivered` SC7 — a non-LOCAL `publish=false` coerces to `true` with a visible warning. Evidence: `publishRoute` at `.bkit/core/engine/commands/workflow/status.ts:287-305` (`publishSource: "coerced"`); `bkit-build.md:397` emits the warning; `status.test.ts` passes.
- `Delivered` SC8 — `/bkit-ship <ref>` lands a held build end to end. Evidence: `ship-verdict.integration.test.ts` (push to a bare origin, `pr create` base `dev`, `runs gate`, `pr merge --match-head-commit`) passes. A LOW gap in how that test runs the no-PR fence is deferred (`...ship-verdict-integration-test-ts-302`, below).
- `Delivered` SC9 — `pnpm bkit:gate:static-unit` and `bkit check` pass. Evidence: `bkit check` exit 0. The gate's only failure is prettier on the untracked ship-run input file `ship-input-2.md`, which is not part of the branch. Every gate part passed when run alone (see checks above).

Runbook `DONE WHEN` lines (all 20 tasks `[x]` in the plan):

- `Delivered` Tasks 1-5 (settings, `repo info`, advisories, `status route` publish, summary lines). Evidence: `settings.test.ts`, `commands/workflow/repo.test.ts` (`repo.ts:245-246` prints `buildPublishRemote` / `buildPublishLocal`), `checks/before/repo.test.ts`, `checks/before/index.test.ts`, `status.test.ts`, `summary.test.ts` and `workflows.test.ts` all pass.
- `Delivered` Tasks 6, 7, 17 (install seed, retired-lite migration, source doc deleted). Evidence: `core.integration.test.ts`, `upgrade.integration.test.ts`, `install.integration.test.ts`, `manifest.test.ts` and `templates.test.ts` pass; `ls .bkit/core/.bkit/lite.md` fails.
- `Delivered` Task 8. Evidence: `grep -n lite.md .bkit/core/.bkit/README.md .bkit/core/.agents/docs.md` prints nothing.
- `Delivered` Task 9. Evidence: `uninstall.ts:384-385` keeps the retired path; `uninstall.test.ts` passes.
- `Delivered` Tasks 10-11 (close rows, telemetry, stats, harvest). Evidence: `workflows.test.ts`, `telemetry.test.ts` and `stats.test.ts` pass; `pnpm test:harvest` 61/61. The Task 11 test-order gaps the build summary lists as BLOCKED were accepted by the owner (`build-decision-1-2.md`) and carry `TEST EXCEPTION` fields in the plan.
- `Delivered` Task 12. Evidence: `workflow-shape.test.ts`, `render/trackers.test.ts` and `instructions-coverage.test.ts` pass.
- `Delivered` Task 13. Evidence: `close-squash.integration.test.ts` and `ship-verdict.integration.test.ts` pass.
- `Delivered` Tasks 14-15. Evidence: both greps return nothing; `instructions:sync` leaves a clean tree; `workflow-shape`, `instructions-sources`, `instructions`, `templates` and `issues` tests pass; `README.md:108-113` holds the batch recipe with both limitations.
- `Delivered` Task 16. Evidence: `.bkit/lite.md` is absent; `bkit check` exit 0 with 0 writes; `instructions:sync` is clean; the gate result is as for SC9.
- `Delivered` Task 18. Evidence: `TIMEOUTS.DISK_SETUP_SWEEP_WAIT_S: 60` at `.bkit/core/engine/shared/timeouts.ts:28`; `ensureDiskSpace` passes `maxWaitMs` at `disk.ts:606`; `waitForLock` takes the bound at `disk.ts:250-254`; `disk.test.ts` passes.
- `Delivered` Tasks 19-20. Evidence: Failure Path step 5 at `bkit-build.md:93-99` passes `--push` only in the Else branch, and "`PUBLISH` = false **or** `PUBLISH` is not held yet" takes `--ref="{BRANCH}"`; the Decision Pause at `bkit-build.md:237-243` makes the same split; `workflow-shape.test.ts` passes. Task 19's test-order gap was accepted by the owner (`build-decision-1-5.md`).

Not plan deliverables. These were observed and reported, and they do not affect the verdict:

- `package.json:196` raises `bkit.workflows.build.verify.maxAttempts` from 2 to 5. This is a bundled bkit-repo run setting that no task asks for (issue comment 2026-11-01T04:21:54Z, MEDIUM).
- `CHANGELOG.md` is unchanged against `origin/dev`. The plan's § Documentation Updates does not list it.
- On a held run, the handover `--ref="{BRANCH}"`, the held close `--tree={BRANCH}` and the Step 15 `--link-ref={BRANCH}` links point at a branch that is not on `origin` until ship pushes it. The holistic verify notes that no `DONE WHEN` covers this.

## Blocking Deferrals

None

`bkit branches scan-diff --disabled-tests --base=origin/dev` exit 0: `found: false`, `disabled: []`.

## Exempt Deferrals

Ledger rows (`bkit ledgers triage --fid=715-retire-lite-workflows --plan=docs/plans/202610/715-retire-lite-workflows-plan.md`: 12 rows, all `bucket: Exempt`, 0 written):

- `715-no-batch-publish-verb` — no `bkit ship --batch` verb. Declared 2026-10-28 in plan § Out of Scope and issue #715 § Out of scope. `reason` `scope-declared`. Tests: in-scope-surface and own-declaration fail.
- `715-build-docs-sync-stays-in-ship` — docs sync is not moved into build or the PR. Declared 2026-10-28 in plan § Out of Scope. `reason` `scope-declared`. Tests: in-scope-surface and own-declaration fail.
- `715-build-verification-unchanged` — build verification, challenge sizing, worktree model and `dev` push are unchanged. Declared 2026-10-28 in plan § Out of Scope. `reason` `scope-declared`. Tests: in-scope-surface and own-declaration fail.
- `715-debug-publish-mode-unchanged` — debug's `PUSH_MODE` is unchanged. Declared 2026-10-28 in plan § Out of Scope. `reason` `scope-declared`. Tests: in-scope-surface and own-declaration fail.
- `715-tracker-label-definitions-unchanged` — existing `next:*:lite` GitHub label definitions are not deleted. Declared 2026-10-28 in plan § Out of Scope. `reason` `scope-declared`. Tests: in-scope-surface and own-declaration fail.
- `715-consumer-lite-content-migration` — consumer lite content is preserved in a stub, not converted. Declared 2026-10-28 in plan § Out of Scope. `reason` `scope-declared`. Tests: in-scope-surface and own-declaration fail.
- `715-historical-audit-report-mentions` — dated `docs/audits/**` reports and `CHANGELOG.md` keep their lite mentions. Declared 2026-10-28 in plan § Out of Scope, which cites issue #715 § Success criteria (historical records exempt). `reason` `scope-declared`. Tests: in-scope-surface fails.
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-232` — non-atomic stale-lock replacement in `takeLock`. Build challenge round 1. `reason` `low-severity` (not tested).
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269` — a `publish=true` substring in pasted prompt text overrides `publish.local: false`; this needs an owner decision. Build challenge. `reason` `low-severity` (not tested).
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-245` — a sweep running longer than `LOCK_STALE_MS` never renews its lock. Build challenge round 1. `reason` `low-severity` (not tested).
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-559` — a timed-out low-disk setup wait still stamps the `--auto` step files. Build challenge round 1. `reason` `low-severity` (not tested).
- `715-retire-lite-workflows-challenge-low-bkit-core-engine-audits-workflows-ship-verdict-integration-test-ts-302` — the landing test's `openPr` runs only part of ship Step 2's no-PR fence. Build challenge round 1. `reason` `low-severity` (not tested).

Plan items declared future work (plan § Suggested Scope Expansion and § Alternative Approaches, 2026-10-28, each marked "Keep deferred"):

- A `bkit builds --held` listing verb. No consumer need yet.
- `bkit plan --publish` for plan / design closes. Design and plan always push their record.
- A `publish` value on `bkit status meta` for resume. `status route` re-derives it on every run.
- `main-checkout-left-core-bare-true` (HIGH, open). This is repo hygiene, not this feature.
- The full-gate timeout cluster (`instructions-retired-clause-timeout-under-full-gate` and three `resolve-push-base` timeouts). These are known flakes.
- `650-debug-dev-ci-live-round-trip`. It needs a real GitHub Actions round trip, so it is hard-blocked.

Advisory preconditions and process boxes (never blocking):

- Gate 1 human-confirmation boxes (Acceptance Scenario, Breaking Changes, Open Questions) and the other Gate 1-4 and Verification Plan checkboxes are unticked in the plan. Each one is a precondition or build-process step. The owner accepted the test-order exceptions in `build-decision-1-1.md` to `build-decision-1-6.md`.
- The Manual Verification steps 1-4 are owner-run and advisory by the plan's own wording.
- The build summary's "BLOCKED" Risks are resolved. Gap 9 (`lite.md` still shipped) was fixed by Task 17, and `install.integration.test.ts` passes. The Task 11 and Task 19 test-order gaps were accepted by the owner.

## Lazy Deferrals

None

## Handover Notes

None
