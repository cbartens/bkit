Verdict: CONCERNS
Failures: 7

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

- **Task 1:**
  - Files: `.bkit/core/engine/shared/settings.ts`, `.bkit/core/engine/shared/settings.test.ts`.
  - Symbols: `BkitConfig` (type), `CONFIG_DEFAULTS`, `readBkitConfig`, `invalidBuildPublish` (new export).
  - Consumers: `commands/workflow/repo.ts`, `commands/workflow/tracker.ts`, `commands/workflow/issues.ts`, `commands/workflow/tests.ts`, `commands/workflow/step-table.ts`, `checks/before/repo.ts`, `install/modules/core.ts`.
- **Task 2:**
  - Files: `.bkit/core/engine/commands/workflow/repo.ts`, `.bkit/core/engine/commands/workflow/repo.test.ts`.
  - Symbols / CLI surface: `repoCommand.verbs.info` (`bkit repo info` output adds `buildPublishRemote`, `buildPublishLocal`).
  - Consumers: `.bkit/core/workflows/bkit-build.md` Step 1.
- **Task 3:**
  - Files: `.bkit/core/engine/checks/before/repo.ts`, `.bkit/core/engine/checks/before/index.ts`, `.bkit/core/engine/checks/before/repo.test.ts`, `.bkit/core/engine/checks/before/index.test.ts`.
  - Symbols / Advisories: `detectBuildPublish` (new export), `runPreflight` (`bkit-build-publish-remote`, `bkit-build-publish-invalid` advisories).
  - Consumers: `bkit install`, `bkit check`, `bkit doctor`, `bkit upgrade` (`runUpgradeAdvisories`).
- **Task 4:**
  - Files: `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`.
  - Symbols: `SEEDED_BKIT_DEFAULTS`, `seedBkitDefaults`.
  - Consumers: `seedCorePackageJsonScripts` (called by `runCoreModule` and `renderManagedOutputs`), `commands/install/uninstall.ts` (`seededValue`).
- **Task 5:**
  - Files: `.bkit/core/.bkit/lite.md` (delete), `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/.bkit/README.md`, `.bkit/core/.agents/docs.md`.
  - Symbols: `CORE_MANIFEST` (`getInstallManifest`), `BKIT_CANONICAL_DOCS`, `GROUP_A_MD_FILES`.
  - Consumers: `runBkitDocs`, `listStampedFiles` (`install/modules/index.ts`), `buildDecisionTable` (`commands/install/uninstall.ts`), `runUpgradeCommand` (`commands/install/upgrade.ts`).
- **Task 6:**
  - Files: `.bkit/core/engine/install/modules/core.ts`, `docs/migrations.md`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`.
  - Symbols: `migrateShortcutsToLite` → `migrateRetiredLite` (called by `runBkitDocs`).
  - Consumers: `runCoreModule`, `renderManagedOutputs` (`install/modules/index.ts`).
- **Task 7:**
  - Files: `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/summary.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`.
  - Symbols / CLI surface: `SummaryInput`, `buildSummary`, `workflowsCommand.verbs.summary` (`bkit workflows summary --publish`).
  - Consumers: `.bkit/core/workflows/bkit-build.md` Step 15.
- **Task 8:**
  - Files: `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`, `.bkit/core/engine/ledgers/telemetry.test.ts`.
  - Symbols / Schemas: `CloseInput`, `closeWorkflow`, `workflowsCommand.verbs.close` (`bkit workflows close --ending --publish`), `OUTCOME_ENDINGS`, `RUN_ENDINGS`, `OutcomePayload`, `RunPayload`, `validate`, `status.jsonl` `workflow-done` row.
  - Consumers: `ledgers/status.ts` (`StatusEvent`), `commands/workflow/run-facts.ts` (`restateOutcome`), `commands/analysis.ts`, `commands/stats.ts`, `scripts/harvest/bkit-harvest.mjs`, `.bkit/core/.bkit/jsonl.md`, `docs/observability.md`.
- **Task 9:**
  - Files: `scripts/harvest/bkit-harvest.mjs`, `scripts/harvest/bkit-harvest.test.mjs`, `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/ledgers/telemetry.test.ts`.
  - Symbols: `endingOf`, `workflowTelemetry`.
  - Consumers: `pnpm harvest` (`harvest/stats.jsonl`, `harvest/stats.md`), `closeWorkflow` telemetry report.
- **Task 10:**
  - Files: `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/render/trackers.test.ts`.
  - Symbols / Workflow steps: `bkit-build.md` Steps 1, 2, 15, 16.
  - Consumers: `.bkit/instructions.md` (`## Local Instructions › #### bkit-build`), `audits/workflows/ci-dispatch-gate-alignment.test.ts`, `audits/workflows/runtime-prose-audit.test.ts`, host mirrors (`.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/plugins/bkit/`).
- **Task 11:**
  - Files: `.bkit/core/.agents/rules.md`, `.bkit/core/.agents/docs.md`, `.bkit/core/prompts/bkit-audit-generate.md`, `.bkit/core/prompts/bkit-utility-update-roadmap.md`, `.bkit/core/prompts/bkit-utility-update-tracker.md`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/authoring.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/README.md`, `.bkit/core/.bkit/workflows.md`, `.github/ISSUE_TEMPLATE/bkit-change.yml`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/tools/instructions-sources.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`.
  - Consumers: `.bkit/instructions.md` (`## Clauses`, `## Local Instructions`), dogfood mirrors (`.bkit/*.md`, `.agents/*.md`, host mirrors).
- **Task 12:**
  - Files: `README.md`, `docs/roadmap.md`, `.bkit/core/.bkit/README.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/templates/templates.test.ts`.

## CRITICAL

1. **Cross-block shell variable `{PUBLISH}` in `bkit-build.md` violates `bkit-runtime-shim-state-does-not-survive-bash-call-boundary` (`docs/knowledge.jsonl`):**
   - **Surface:** Task 10 (`.bkit/core/workflows/bkit-build.md` Steps 2, 15, 16).
   - **Defect:** Task 10 resolves `{PUBLISH}` in Step 2 sub-step 3 after `runtime assert` (`>/dev/null` today at `.bkit/core/workflows/bkit-build.md:331`) and consumes `{PUBLISH}` in Step 15 and Step 16. Per `docs/knowledge.jsonl` (`bkit-runtime-shim-state-does-not-survive-bash-call-boundary`) and `.bkit/workflows.md:508`: shell variables do not survive across fenced bash blocks, and on a resumed build (`bkit status resume` after Step 2), Steps 3–14 are skipped or re-entered without running Step 2's resolution unless Step 2 always runs and emits the resolved value on stdout for the orchestrator to hold, or a command derives it. Furthermore, `bkit runtime assert` at `.bkit/core/workflows/bkit-build.md:331` currently redirects stdout to `>/dev/null`, so `runtime` is never printed to the orchestrator unless `>/dev/null` is removed (as in `bkit-design.md:195`).
   - **Fix:** Remove `>/dev/null` from `bkit runtime assert` in `.bkit/core/workflows/bkit-build.md` Step 2 sub-step 3 (or resolve `publish` inside an engine command such as `bkit status route --prompt-file=` / `bkit runtime assert` / `bkit workflows summary|close`) so `{RUNTIME}` and `{PUBLISH}` are deterministically printed and held on every run and resume.

2. **Editing standing lines in `.bkit/core/workflows/bkit-build.md` and `.bkit/core/prompts/*.md` without updating `.bkit/instructions.md` (`## Clauses` and `## Local Instructions`) breaks instruction gates (`instructions-store-clause-text-and-local-entries-need-hand-edits` in `docs/knowledge.jsonl`):**
   - **Surface:** Task 10 (`.bkit/core/workflows/bkit-build.md`) and Task 11 (`.bkit/core/.agents/rules.md`, `.bkit/core/prompts/bkit-audit-generate.md`, `.bkit/core/prompts/bkit-utility-update-roadmap.md`, `.bkit/core/prompts/bkit-utility-update-tracker.md`, `.bkit/core/.agents/docs.md`).
   - **Defect:** Reuse Inventory line 313 and Task 11 line 782 state `"No hand edit: run pnpm instructions:sync after the rules / prompts change"`. Per `docs/knowledge.jsonl` key `instructions-store-clause-text-and-local-entries-need-hand-edits`, `pnpm instructions:sync` rewrites neither `## Clauses` (`tracker-next-labels`, `tracker-workflow-labels`, `doc-local-section` carrying `lite` at `.bkit/instructions.md:818-850, 5731`) nor `## Local Instructions` (`bkit-build`, `bkit-audit-generate`, `bkit-utility-update-roadmap`, `bkit-utility-update-tracker` at `.bkit/instructions.md:7179-7200, 7544, 8246, 8266`). Leaving those unedited causes `instructions.test.ts` and `instructions-coverage.test.ts` to fail.
   - **Fix:** Add `.bkit/instructions.md` to Task 10 and Task 11 `**UPDATE:**` lists (update clause texts and move old texts to `retired` for `tracker-next-labels` and `tracker-workflow-labels`, remove `lite` from `doc-local-section` carriers, and update `## Local Instructions` for `bkit-build`, `bkit-audit-generate`, `bkit-utility-update-roadmap`, and `bkit-utility-update-tracker`), then run `pnpm instructions:sync`.

3. **Dogfood mirror and `.bkit/lite.md` cleanup missing before Task 11/12 gates (`dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit` in `docs/knowledge.jsonl`):**
   - **Surface:** Task 5, Task 10, Task 11, Task 12.
   - **Defect:** Task 5 deletes `.bkit/core/.bkit/lite.md`, and Tasks 5, 10, 11, 12 edit `.bkit/core/.bkit/*.md`, `.bkit/core/.agents/*.md`, `.bkit/core/prompts/*.md`, and `.bkit/core/workflows/bkit-build.md`. However, no task runs `pnpm build` and `node dist/cli.js install --claude --cursor --codex --antigravity --opencode=openrouter` (or deletes the repo's own root `.bkit/lite.md` mirror, which currently has no consumer lines below `## Project Lite Workflows`). Task 12's `DONE WHEN` runs `pnpm bkit:gate:static-unit-integration` and `node dist/cli.js check`, which will fail with drift and stale `dist/` because no task in the runbook builds `dist/` or re-renders the repo's dogfood mirrors and `.bkit/version`.
   - **Fix:** Include building `dist/` and running the repo's own `bkit install` (which runs `migrateRetiredLite` to delete the root `.bkit/lite.md` and refreshes `.bkit/*.md`, `.agents/*.md`, host mirrors, `package.json` `bkit.workflows.build.publish`, and `.bkit/version`) in the runbook tasks before Task 12's `node dist/cli.js check` and `pnpm bkit:gate:static-unit-integration` gate.

4. **Missing design-coverage for `bkit uninstall` surface (`plan-input-1.md:528`):**
   - **Surface:** `.bkit/core/engine/commands/install/uninstall.ts` (`CORE_TEMPLATE_DOCTRINE` at lines 376–383).
   - **Defect:** Issue #715 § Retirement scope (`plan-input-1.md:528`) explicitly specifies: `"remove .bkit/lite.md from manifest.ts (markered-text, module core), the core module doc list in core.ts, the uninstall list, .agents/docs.md index, and the core-doc test enumeration"`. Also `docs/migrations.md:21` cites `.bkit/core/engine/commands/install/uninstall.ts` (`CORE_TEMPLATE_DOCTRINE`). Once `.bkit/lite.md` is removed from `CORE_MANIFEST`, `bkit uninstall` on an un-upgraded 5.2.5–6.0.0 consumer repo would leave the managed `.bkit/lite.md` block behind unless `.bkit/lite.md` is handled in `CORE_TEMPLATE_DOCTRINE` (alongside `.agents/shortcuts.md`) or `uninstall.ts` is updated to match `docs/migrations.md`. Neither `uninstall.ts` nor `uninstall.test.ts` is touched in the plan.
   - **Fix:** Update `CORE_TEMPLATE_DOCTRINE` in `.bkit/core/engine/commands/install/uninstall.ts` (and `docs/migrations.md`) so `bkit uninstall` strips `.bkit/lite.md` (and `.agents/shortcuts.md`) on un-upgraded installs, with a unit test in `.bkit/core/engine/commands/install/uninstall.test.ts`.

5. **Schema / documentation coverage gap in `.bkit/core/.bkit/jsonl.md` and `docs/observability.md` for telemetry `ending: "held"` and `publish`:**
   - **Surface:** Task 8, Task 9, Task 11, Task 12.
   - **Defect:**
     1. `plan-v1-draft.md` § Documentation Updates (line 541) requires updating `docs/observability.md` to record `ending: held` and optional `publish` on the outcome row and `workflow-done` row, but no runbook task (`Task 1`–`Task 12`) lists `docs/observability.md` under `**UPDATE:**`.
     2. `.bkit/core/.bkit/jsonl.md` lines 104 and 112 define the schema contract for `outcome` (`ending:"done"|"close-failed"`) and `run` (`ending:"done"|"close-failed"|"failed"|"decision-pause"|"stopped"`). `utility-pre-release-check` (`.bkit/instructions.md:8346`) audits `.bkit/jsonl.md` against `.bkit/core/engine/ledgers/telemetry.ts`. Neither `.bkit/core/.bkit/jsonl.md` nor `docs/observability.md` is updated in any task.
     3. In `.bkit/core/engine/ledgers/telemetry.ts:1671`, the validation error message is hardcoded as `` `outcome ending must be done|close-failed (got: ${String(e["ending"])})` `` instead of using `OUTCOME_ENDINGS`; Task 8 must update that message and validate `publish` (boolean when present) on `outcome` rows.
   - **Fix:** Add `.bkit/core/.bkit/jsonl.md` and `docs/observability.md` to `**UPDATE:**` in Task 8/9 or Task 11/12, and ensure `telemetry.ts` `validate()` checks optional `publish` boolean and includes `held` in the `OUTCOME_ENDINGS` error string.

6. **`StatusEvent` type in `.bkit/core/engine/ledgers/status.ts` not updated for `workflow-done` fields `ending` and `publish`:**
   - **Surface:** Task 8 (`.bkit/core/engine/commands/workflow/workflows.ts:1145`, `.bkit/core/engine/ledgers/status.ts:57`).
   - **Defect:** Task 8 updates `closeWorkflow` to write `ending: "held"` and `publish: false` onto the `workflow-done` row in `status.jsonl`. In `.bkit/core/engine/ledgers/status.ts:57`, `StatusEvent` types `workflow-done` as `{ type: "workflow-done"; workflow: string; at: string; parentSha?: string }`. While `appendLine` accepts `StatusEvent | StatusRow`, typing `row` in `closeWorkflow` (`const row = { type: "workflow-done" as const, ... }`) or reading `StatusEvent` in callers without updating `StatusEvent` leaves the canonical `StatusEvent` union out of sync with the emitted row shape.
   - **Fix:** Update `StatusEvent` in `.bkit/core/engine/ledgers/status.ts` to include optional `ending?: "done" | "held"` and `publish?: boolean` on the `workflow-done` variant.

7. **Duplicate conflicting `UPDATE` entries across Task 5, Task 11, and Task 12:**
   - **Surface:** `.bkit/core/.agents/docs.md`, `.bkit/core/.bkit/README.md`, `.bkit/core/.bkit/workflows.md`.
   - **Defect:**
     - `.bkit/core/.agents/docs.md`: Task 5 line 650 says `delete the .bkit/lite.md index row`, and Task 11 line 768 repeats `delete the .bkit/lite.md index row`. Once Task 5 deletes the row, Task 11 has nothing to edit in that file.
     - `.bkit/core/.bkit/README.md` and `.bkit/core/.bkit/workflows.md`: Task 5 (line 649), Task 11 (lines 776–777), and Task 12 (lines 796–797) all `UPDATE` the same sections of these two files.
   - **Fix:** Consolidate each file's edits into a single owning task (or disjoint sections per task) so later tasks do not attempt already-applied edits.

## OPTIONAL

1. **`bkit stats` / `commands/analysis.ts` handling of `ending: "held"` outcome rows:**
   - `commands/analysis.ts` counts all `kind: "outcome"` rows in `computeElapsedStats` and `computeRegression` regardless of `ending` (`done`, `close-failed`, `held`). Confirm whether `bkit stats` should continue including `held` build runs in duration and size-regression buckets (which is consistent with `close-failed`), or surface `held` counts separately.
2. **Guard `restateOutcome` in `.bkit/core/engine/commands/workflow/run-facts.ts:493`:**
   - `restateOutcome` is only called by `bkit runs dispatch`, which is skipped on a held close. However, if `runs dispatch` were ever invoked manually after a held close, line 493 `{ ...draft, ending: entry.status === "unresolved" ? "close-failed" : "done", ci }` would overwrite `ending: "held"` with `"done"`, which is actually appropriate if CI was subsequently dispatched for that run.

## OUT OF SCOPE

1. **`bkit builds --held` listing command:** Suggested in the plan's `Suggested Scope Expansion` and excluded by Issue #715 § Out of scope.
2. **Moving `@bkit-ship-update-docs` into `/bkit-build`:** Explicitly excluded by Issue #715 § Docs stay in ship.
