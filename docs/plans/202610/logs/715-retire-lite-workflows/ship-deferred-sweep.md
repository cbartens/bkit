Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md` (byte-identical to the copy embedded in `ship-input-3.md`, last committed 2026-11-01T14:26:21+10:00). Intended deliverables = § Acceptance Scenario › Success Criteria (S1-S9, declared 2026-10-28 from issue #715 § Success criteria) plus the 20 runbook tasks' `DONE WHEN` lines (T1-T20). Evidence gathered 2026-11-02 in `.worktrees/715-retire-lite-workflows` at `1f17923a0`.

Test runs used as evidence:

- `pnpm build` → exit 0, `git status --short dist` empty (dist is fresh).
- `pnpm vitest run` over the 19 unit files the plan names (`settings`, `repo`, `checks/before/repo`, `checks/before/index`, `status`, `summary`, `workflows`, `manifest`, `templates`, `uninstall`, `telemetry`, `stats`, `workflow-shape`, `render/trackers`, `instructions-coverage`, `instructions-sources`, `instructions`, `issues`, `disk`) → 19 files, 1693 tests passed.
- `pnpm vitest run` over the 5 integration files the plan names (`core.integration`, `upgrade.integration`, `install.integration`, `close-squash.integration`, `ship-verdict.integration`) → 5 files, 253 tests passed.
- `pnpm test:harvest` → 61 tests, 61 pass, 0 fail.
- `node dist/cli.js check` → exit 0, "0 write(s) would occur", no `DRIFT DETECTED`, 0 blockers.
- `pnpm tsx .bkit/core/engine/tools/instructions.ts` (the check mode of `instructions:sync`) → exit 0, tree unchanged.
- `pnpm bkit:gate:static-unit` → exit 0: static checks pass, unit coverage run 165 files / 6907 passed / 2 skipped (no skip added by this diff, see Blocking Deferrals), bats 36 ok / 0 not ok.
- `pnpm test:integration` → exit 0, 50 files / 1700 passed (so `bkit:gate:static-unit-integration` holds).

<!-- prettier-ignore -->
| Id | Deliverable (where declared) | Status | Evidence |
| --- | --- | --- | --- |
| S1 | Install / upgrade leave no managed lite block; consumer content below `bkit:end` kept (plan:50) | Delivered | `migrateRetiredLite` at `.bkit/core/engine/install/modules/core.ts:403-442`; `core.integration.test.ts` `strips the managed block and keeps consumer lines`, `logs no fix and writes nothing on a second install over its own stub`; `upgrade.integration.test.ts` `upgrade from a 5.2.4 lite.md keeps the consumer section` — all pass |
| S2 | No current doc, prompt, workflow or label rule names a `<phase>:lite` workflow or `next:*:lite` label (plan:51) | Delivered | `git grep` over tracked files minus `docs/plans`, `docs/audits`, `CHANGELOG.md`, `*.jsonl`: remaining hits are absence-asserting tests, the migration / uninstall code naming the retired path, the `docs/migrations.md` row, and the `retired` history block at `.bkit/instructions.md:1014-1019` — none is a current rule or recommendation |
| S3 | Every "small change" recommendation points at `/bkit-build #N` (plan:52) | Delivered | `README.md:99-113`, `.bkit/core/.bkit/README.md:331-340`, `.bkit/core/.bkit/templates.md:607`, `.github/ISSUE_TEMPLATE/bkit-change.yml:12-13` (template copy identical); `templates.test.ts` `the root README points small changes at /bkit-build` passes |
| S4 | `publish` defaults `{ remote: true, local: true }`; `local: false` holds; `remote: false` refused with advisory (plan:53) | Delivered | `settings.test.ts` `defaults build.publish to true`, `coerces publish.remote false to true`; `checks/before/repo.test.ts` `reports only the remote advisory when remote is false and local is valid` — pass |
| S5 | `publish=false` run: no push / PR / CI, worktree + branch kept, lock released, ending `held`, In review comment, `Publish: held`, `Docs: not synced` (plan:54) | Delivered | `close-squash.integration.test.ts` `held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock` and `held close records the rows, summary and worktree-only roadmap row`; `workflow-shape.test.ts` held-close cases — pass |
| S6 | `publish=true` run behaves as today (plan:55) | Delivered | `workflow-shape.test.ts` `keeps the publish=true close path`; `summary.test.ts` `keeps the verdict and next step unchanged by publish` — pass |
| S7 | Non-LOCAL `publish=false` coerces to `true` with visible warning (plan:56) | Delivered | `status.test.ts` `coerces publish false to true on a non-LOCAL runtime`; `workflow-shape.test.ts` `warns when a non-LOCAL run resolves publish false` — pass |
| S8 | `/bkit-ship <ref>` lands a held build end to end (plan:57) | Delivered | `ship-verdict.integration.test.ts` `ship pushes the held branch and opens a dev PR`, `ship gates on CI and merges the pinned head` — pass |
| S9 | `pnpm bkit:gate:static-unit` and `bkit check` pass (plan:58) | Delivered | `bkit check` exit 0; `pnpm bkit:gate:static-unit` exit 0 (above) |
| T1 | settings parse / validate (plan:710) | Delivered | `settings.test.ts` passes; `invalidBuildPublish` exported from `.bkit/core/engine/shared/settings.ts` |
| T2 | `repo info` publish keys (plan:728) | Delivered | `repo.test.ts` `prints buildPublishRemote and buildPublishLocal` passes |
| T3 | `bkit check` publish advisories (plan:743) | Delivered | `checks/before/repo.test.ts`, `checks/before/index.test.ts` pass |
| T4 | `status route` resolves `{PUBLISH}` (plan:769) | Delivered | `status.test.ts` passes, incl. `refuses publish without a runtime-resolved row` |
| T5 | summary `Publish:` / `Docs:` lines (plan:790) | Delivered | `summary.test.ts`, `workflows.test.ts` pass |
| T6 | install / upgrade seed `build.publish` (plan:814) | Delivered | `core.integration.test.ts` seed cases pass; `package.json` carries `bkit.workflows.build.publish` |
| T7 | retired-lite migration (plan:837) | Delivered | `core.integration.test.ts`, `upgrade.integration.test.ts` pass |
| T17 | delete shipped `lite.md` source (plan:869) | Delivered | `ls .bkit/core/.bkit/lite.md` fails (no such file); `install.integration`, `manifest`, `templates` tests pass |
| T8 | drop lite doc from install docs (plan:888) | Delivered | `grep -n lite.md .bkit/core/.bkit/README.md .bkit/core/.agents/docs.md` → exit 1, no output |
| T9 | `bkit uninstall` retired lite path (plan:901) | Delivered | `.bkit/core/engine/commands/install/uninstall.ts:384-385`; `uninstall.test.ts` `strips a managed lite.md block` passes |
| T10 | close row `ending: held` / `publish: false` (plan:926) | Delivered | `workflows.test.ts` `records ending held and publish false on the workflow-done row`, `telemetry.test.ts` pass |
| T11 | held ending in stats / harvest (plan:948) | Delivered | `pnpm test:harvest` 61/61; `telemetry.test.ts`, `stats.test.ts` pass |
| T12 | `bkit-build.md` publish branch (plan:980) | Delivered | `workflow-shape.test.ts`, `render/trackers.test.ts`, `instructions-coverage.test.ts` pass |
| T13 | held close + deferred landing vs real boundaries (plan:1008) | Delivered | `close-squash.integration.test.ts`, `ship-verdict.integration.test.ts` pass after `pnpm build` |
| T14 | remove lite guidance (plan:1047) | Delivered | The source grep over `.bkit/core/.agents .bkit/core/prompts .bkit/core/.bkit` and both `bkit-change.yml` copies → exit 1, no output. `grep -rn ':lite' .bkit/core/engine` hits only the regexes inside the absence-asserting tests (`instructions-sources.test.ts:175-189`, `workflow-shape.test.ts:1108`, `templates.test.ts:409-421`) that this task's own `TEST FIRST` requires; no engine source hit. Instructions check clean; the five named test files pass |
| T15 | README / roadmap guidance, held handoff, batch recipe (plan:1071) | Delivered | `grep -niE '(:lite\|lite\.md\|[Ll]ite workflows?)' README.md docs/roadmap.md` → exit 1; batch recipe with both limitations at `README.md:108-113`; `templates.test.ts` passes |
| T16 | dist, mirrors, gate (plan:1099) | Delivered | `pnpm build` leaves `dist/` unchanged; `bkit check` 0 writes, no drift; `.bkit/lite.md` absent; instructions check clean; `pnpm test:harvest` passes; `pnpm bkit:gate:static-unit` and `pnpm test:integration` exit 0. The repo `bkit install` itself was not re-run here (this sweep does not install); `bkit check`'s 0-write dry run is the observable result |
| T18 | bounded low-disk sweep wait (plan:1114) | Delivered | `disk.test.ts` `worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock` passes |
| T19 | held Failure Path / Decision Pause never push (plan:1123) | Delivered | `workflow-shape.test.ts` `bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch` passes |
| T20 | unresolved-publish Failure Path never pushes (plan:1140) | Delivered | `workflow-shape.test.ts` `bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch` passes |

## Blocking Deferrals

None. All 29 intended deliverables (S1-S9, T1-T20) are `Delivered`. `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` → exit 0, `found: false`, `disabled: []`.

## Exempt Deferrals

**Ledger rows** (`bkit ledgers triage --fid=715-retire-lite-workflows --plan=docs/plans/202610/715-retire-lite-workflows-plan.md` → 12 rows, every `bucket` = `Exempt`, 0 written):

<!-- prettier-ignore -->
| Key | Leaves uncovered | Declared (where, when) | Reason | Triage tests |
| --- | --- | --- | --- | --- |
| `715-no-batch-publish-verb` | No `bkit ship --batch`; batching held builds stays a user script | plan § Out of Scope (plan:286); issue #715 § Out of scope; row by `plan-generate`, 2026-10-28 | `scope-declared` | in-scope-surface fails, own-declaration fails |
| `715-build-docs-sync-stays-in-ship` | Docs sync not moved into build or the PR | plan:287; issue § Out of scope; `plan-generate`, 2026-10-28 | `scope-declared` | in-scope-surface fails, own-declaration fails |
| `715-build-verification-unchanged` | Build verification, challenge sizing, plan-convert, worktree model, `dev` push rules untouched | plan:288; issue § Out of scope; `plan-generate`, 2026-10-28 | `scope-declared` | in-scope-surface fails, own-declaration fails |
| `715-debug-publish-mode-unchanged` | Debug's `PUSH_MODE` / behaviour untouched | plan:289; issue § Out of scope; `plan-generate`, 2026-10-28 | `scope-declared` | in-scope-surface fails, own-declaration fails |
| `715-tracker-label-definitions-unchanged` | Existing `next:*:lite` GitHub label definitions not deleted | plan:290; issue § Out of scope; `plan-generate`, 2026-10-28 | `scope-declared` | in-scope-surface fails, own-declaration fails |
| `715-consumer-lite-content-migration` | Consumer lite content preserved, not converted | plan:291; issue § Out of scope; `plan-generate`, 2026-10-28 | `scope-declared` | in-scope-surface fails, own-declaration fails |
| `715-historical-audit-report-mentions` | Dated `docs/audits/**` reports and `CHANGELOG.md` keep lite mentions | plan:292; issue § Success criteria exemption; `plan-generate`, 2026-10-28 | `scope-declared` | in-scope-surface fails (own-declaration holds) |
| `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-232` | Two `--wait` sweeps can each `rmSync` the other's fresh lock (`disk.ts:232`) | `build-challenge`, 2026-11-01 | `low-severity` | not tested (LOW) |
| `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269` | A `publish=true` substring anywhere in the prompt overrides `publish.local: false` (`status.ts:269`) | `build-challenge`, 2026-11-01 | `low-severity` | not tested (LOW) |
| `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-245` | A sweep longer than `LOCK_STALE_MS` can be joined by a second sweep (`disk.ts:245`) | `build-challenge`, 2026-11-01 | `low-severity` | not tested (LOW) |
| `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-559` | A low-disk setup that gives up after 60s has already stamped the sweep cadence (`disk.ts:559`) | `build-challenge`, 2026-11-01 | `low-severity` | not tested (LOW) |
| `715-retire-lite-workflows-challenge-low-bkit-core-engine-audits-workflows-ship-verdict-integration-test-ts-302` | The deferred-landing test runs only the push and `prs open` lines, not the exit-surfacing `case` lines (`ship-verdict.integration.test.ts:302`) | `build-challenge`, 2026-11-01 | `low-severity` | not tested (LOW) |

**Declared future work with no ledger row** (plan § Suggested Scope Expansion, plan:299-305, declared at plan time 2026-10-28, each marked "Keep deferred"): a `bkit builds --held` listing verb; retiring the `.agents/shortcuts.md` migration (kept inside `migrateRetiredLite` instead); `bkit plan --publish`; a `publish` value on `bkit status meta`; `main-checkout-left-core-bare-true`; the full-gate timeout cluster; `650-debug-dev-ci-live-round-trip`. All are outside this feature's deliverables; the last three are rows of other FIDs.

**Advisory plan conditions** (preconditions and process steps, advisory only per this sweep's contract):

- Gate 1 / Gate 2 / Gate 3 / Gate 4 checkboxes and the three 👤 Human Confirmation boxes are unticked (plan:210, 238, 268, 333-338, 1151-1166, 1172-1184). The build ran through them; no deliverable depends on the tick.
- § Manual Verification Steps 1-4 (plan:1191-1194) are marked "advisory only" by the plan itself.
- Task 16's repo `bkit install` run and second zero-write install (plan:1099) are build process steps; `bkit check` reporting 0 writes and no drift stands in as the observable result.

## Lazy Deferrals

None. No intended deliverable was left `Planned`, and `bkit ledgers triage` bucketed every one of the 12 deferral rows for this FID `Exempt` (`written: 0`), so no `unjustified` row was appended to `docs/deferrals.jsonl`.

## Handover Notes

None
