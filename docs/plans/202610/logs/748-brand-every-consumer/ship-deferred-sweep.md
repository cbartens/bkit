Verdict: PASS
Failures: 0
Lazy: 3

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md` (no design file). Judged on the worktree at `37792f032`, diff base `origin/dev` (`0d66dcfab`). The run diff `tmp/bkit-diff-748-brand-every-consumer.md` is partial diff coverage (14722 lines across 177 files), so engine files were read directly in the worktree.

Test runs this step (worktree, `pnpm exec vitest run`):

- Unit: `manifest.test.ts`, `template-ci-yml.test.ts`, `templates.test.ts`, `templates-content.test.ts`, `branding.test.ts`, `dogfood-templates.test.ts`, `core.test.ts`, `tools.test.ts`, `catalogue.test.ts`, `v6-fixtures.test.ts`, `version-file.test.ts`, `ci-scripts.test.ts`: 12 files, 694 tests passed, exit 0.
- Integration: `core.integration.test.ts`, `upgrade.integration.test.ts`, `template-copies.integration.test.ts`, `husky-pre-push.integration.test.ts`, `index.integration.test.ts`: 5 files, 453 tests passed, exit 0.
- Planned test titles: 62 TEST FIRST titles extracted from the runbook; 60 exist in their target files. The 2 absent (`upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing`, `a second template-file migration and a dry run write and move nothing`) were replaced by Tasks 13 and 14 on the owner decision in `build-decision-1-1.md` / `build-decision-1-2.md`; both replacements exist and pass.
- `node dist/cli.js check`: exit 0, `0 write(s) would occur.`
- `pnpm bkit:graph:check`: `docs/capabilities.md matches a rebuild at 37792f032.`
- `pnpm exec tsx .bkit/core/engine/tools/instructions.ts`: exit 0.

Acceptance Scenario:

- SC1 (bkit-running script names start with `bkit:`; generic slots keep names): `Delivered` — `branding.test.ts` `consumer-facing names carry the bkit prefix > template script names that run bkit code` passes; root `package.json` has no `lint:prose` / `slop:delta` / `graph*` key (`jq '.scripts|keys'`).
- SC2 (every workflow `name:` and job display name in `.bkit/templates/.github/workflows/*.yml` starts with `bkit-`): `Delivered` — YAML parse of `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-health.yml`, `bkit-renovate.yml`, `bkit-trivy.yml`: all names `bkit-*` (name, else job id).
- SC3 (shipped Vale style `Bkit`; `.vale.ini` and every doc reference name `Bkit.*`): `Delivered` for the style and config — `.bkit/templates/.vale/styles/` holds only `Bkit/`, `.bkit/templates/.vale.ini:8` `BasedOnStyles = Bkit`, `Bkit.*` toggles; word-bounded `House` grep over `.bkit/templates .bkit/core/.bkit .bkit/core/engine` (non-test) hits only the migration in `core.ts:1234-1349`. The `docs/knowledge.jsonl` doc references are `Lazy` (see Lazy Deferrals).
- SC4 (`bkit upgrade` renames old names in package.json, husky hooks, CI workflow, workflow / Vale copies; second run changes nothing): `Delivered` — real-CLI old-shape upgrade tests in `upgrade.integration.test.ts` (`branded script migration is idempotent and dry-run writes nothing`, `a second check-name migration writes nothing`, `a second Vale migration and a dry run write nothing`, Task 13 / 14 replacements) pass.
- SC5 (branding guard fails on unprefixed name; rule; decision): `Delivered` — `branding.test.ts` seeded negatives pass; `.agents/rules.md:185` Branding bullet; `docs/decisions.jsonl` key `748-consumer-facing-names-carry-bkit-prefix`.
- Process Sketch, Concrete Example and Edge Cases: `Delivered` — each row maps to a passing integration test in `core.integration.test.ts` / `upgrade.integration.test.ts` (both files green above); the residual-name warning row works but over-reports (Lazy item 3).
- Derived Test Matrix (56 rows): `Delivered` — every row's test exists and passes, Task 7 / 8 rows via the Task 13 / 14 replacements.

Runbook DONE WHEN:

- Task 1: `Delivered` — `lint:prose` / `slop:delta` grep (non-test, `.bkit/core/engine`, `.bkit/templates/.github`, `.bkit/templates/.husky`, `.bkit/core/.bkit/templates.md`) hits only `BKIT_SCRIPT_RENAMES` (`core.ts:729-730`); `detectValeMissing` reads `scripts["bkit:lint:prose"]` (`tools.ts:35`); `tools.test.ts` old-name grep empty; tests pass.
- Task 2: `Delivered` — `find .bkit/templates/scripts .bkit/templates/context -type f ! -name 'bkit-*'` empty; launchd old-path `git grep` empty.
- Task 3: `Delivered` — no `pnpm graph` without `bkit:` under `.bkit/templates`, `.bkit/core/.bkit`, `.bkit/core/engine/checks`, `docs/templates/bkit-audit-duplication.md`; `bkit:generate` calls `pnpm bkit:graph:refresh`; graph check passes.
- Task 4: `Delivered` — `renameScriptTokens` / `migrateBrandedScriptNames` (`core.ts:819`, `:854`); tests pass.
- Task 5: `Delivered` — see SC2.
- Task 6: `Delivered` — see SC3; `template-copies.integration.test.ts` passes.
- Task 7: `Delivered` — `WriteEntry.unhashed?: true` (`write.ts:617`); `.bkit/core/.bkit/templates.md:11` and `version-file.ts:158` state the brand-migration exception.
- Task 8: `Delivered` — `SHIPPED_CI_SCRIPT_HASHES` (`core.ts:997`), `migrateBrandedTemplateFiles` (`core.ts:1039`); integration tests pass.
- Task 9: `Delivered` — `BRANDED_WORKFLOWS` / `migrateBrandedCheckNames` (`core.ts:1133`, `:1147`); tests pass.
- Task 10: `Delivered` — `SHIPPED_HOUSE_RULE_HASHES` / `migrateValeHouseStyle` (`core.ts:1237`, `:1266`); `v6-fixtures.test.ts` hash rows pass.
- Task 11: `Delivered` — rules bullet present; instructions tool exit 0; the DONE WHEN grep hits the `retired` block (`.bkit/instructions.md:1826-1828`) and one pre-existing context line `.bkit/core/.bkit/templates.md:229` that names old CI-script file names to describe the `ci-scripts-old-names` advisory (met in substance).
- Task 12: `Delivered` except one doc line — `.bkit` greps clean bar allowed classes (migration tables, tests, `.bkit/issues.jsonl:2` ledger, `catalogue.ts:397` deliberate old-path probe); `CHANGELOG.md:13` breaking-change entry; `bkit check` 0 writes; graph check passes; packed-tarball dogfood recorded DONE in `build-plan-tasks-5-log.md` (not repeated here; the real-CLI old-shape upgrade tests stand in). The docs grep also hits `README.md:344` → `Lazy` (see Lazy Deferrals).
- Tasks 13, 14: `Delivered` — replacement tests exist and pass.
- Tasks 15-23: `Delivered` — every TEST FIRST title exists and passes (composite-action scan, job `name:` insert guard, package-selector and recursive flag forms, other-workflow warning, symlink refusals, linear-time flag pattern `core.ts:826`); `dist/install/modules/core.js` carries `linkedPath`, `SHIPPED_HOUSE_RULE_HASHES`, `otherWorkflows` and the `-recursive` selector.
- Plan § Documentation Updates row `docs/knowledge.jsonl`: `Lazy` (see Lazy Deferrals).

## Blocking Deferrals

None

- `bkit branches scan-diff --disabled-tests --base=origin/dev` (run as `node dist/cli.js`): exit 0, `found: false`, `disabled: []`.
- No intended deliverable is absent, a stub or wrong against its plan wording; no guard was weakened; no shipped surface tells a consumer to run something that fails.

## Exempt Deferrals

Ledger rows (`bkit ledgers triage --fid=748-brand-every-consumer --plan=docs/plans/202610/748-brand-every-consumer-plan.md`, bucket `Exempt`, 0 rows written):

- `748-names-outside-the-branding-rule` — `scope-declared`; leaves generic stack scripts (`typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare`), tool-fixed file names, engine-internal names and job ids unprefixed. Declared in issue #748 § Out of Scope and plan § Out of Scope (plan time). Triage: in-scope-surface fails, own-declaration fails.
- `748-rename-unprefixed-template-script-files` — `needs-decision`, `TRIAGED`; the decision was taken (Open Question 2 → A, decision `748-upgrade-moves-unedited-ci-script-copies`) and the work landed in Tasks 2 and 8. Triage: no-external-blocker fails.
- Seven `low-severity` LOW build-challenge rows (declared at build-challenge, 2026-11-02; not tested by triage, per `.bkit/jsonl.md` § Deferral Reason):
  - `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-896` — unparseable `package.json` still lets the hook / CI token pass rename to `bkit:` names.
  - `…-core-ts-1201` — a consumer `House/Filler` (no `.yml`) or `House/Filler/` entry is filtered out of `remaining`, so `fs.rmSync(houseDir, { recursive: true })` deletes it (confirmed at `core.ts:1317-1322`).
  - `…-core-ts-1112` — trailing comment or CRLF on the `trivy:` / `renovate:` line: no job `name:` inserted, but the log names `bkit-trivy / bkit-trivy`.
  - `…-core-ts-884` — nested monorepo `packages/<x>/scripts/ci/check-*.mjs` paths are rewritten to files that do not exist.
  - `…-core-ts-911` — a `bkit.testing.ciWorkflow` value like `../../../x.yml` makes the migration write outside `.github/workflows/`.
  - `…-core-ts-1301` — a symlinked `.vale.ini` leaves `House` config after the rules move.
  - `…-core-ts-941` — a symlinked `.husky` / `.github` parent directory is written through by `migrateBrandedFileTokens` / `migrateBrandedCheckNames`.

Plan-declared, no ledger row needed:

- Branding guard over docs prose — plan § Alternative Approaches, "Future phase"; prose is covered by the Task 11 / 12 greps.
- Plan § Suggested Scope Expansion, all "Keep separate": #719 `bkit-cloud-codex` job; #745 Notation Vale rules go in `Bkit/`; failure `capability-register-drift-shipped-by-pr-708-reds-dev-capstone`; #724 machine-wide lock; deferrals `724-gate-templates-pass-test-workers`, `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo`; failure `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`.
- Open Question 3 → D: no migration touches a copied `smoke.yml` / `health.yml` (decision `748-smoke-stub-retired-for-health-template`, issue comment 2026-10-30).
- Open Question 4 → A: consumer `scripts/graphify/*` copies keep `pnpm graph*` hints (decision `748-graphify-copy-hints-left-for-consumer`).
- Edge cases: machine-local launchd files (`~/Library/LaunchAgents/ai.bkit.launchd.plist`, `~/.config/bkit/launchd.env`) and required branch-protection checks are not touched (Open Question 1 → C: upgrade log line, delivered in Task 9).
- Assumptions: `lint:slop`, job ids and bkit-repo-only scripts keep their names.
- Advisory process items (never deliverables): plan Gates 1-4 checkboxes, the Mandatory Tasks list, the Verification Plan boxes and Manual Verification Steps 1-3 are unticked in the plan.

Declared elsewhere this run:

- `debug-handover.md` § Out-of-Scope Recommendations: `instructions.test.ts:55` load-scaled timeout (#814); `.agents/context.md:171` picks the newest run of any workflow; `.github/workflows/bkit-ci.yml:672` integration checkout fetches no tags (owner sign-off needed).
- `build-plan-verify-holistic.md` § Notes: `scripts/gate/bkit-gate-changed.mjs` passes symlinked `.claude/skills/*` paths to prettier (propose separately; not this plan's work).
- Issue comment 2026-11-03: rebase resolver run-log conflict, filed as #838.

## Lazy Deferrals

Each row below was appended this step to `docs/deferrals.jsonl` with `reason` `unjustified`, `status` `TRIAGED` and `references` naming `748-brand-every-consumer`; triage then bucketed each `Lazy` and wrote nothing more.

1. `748-brand-every-consumer-knowledge-rows-name-old-script-and-style-names`
   - Gap: plan § Documentation Updates row `docs/knowledge.jsonl` (and SC3 "every doc reference") asks for superseding rows; `git diff origin/dev...HEAD -- docs/knowledge.jsonl` is empty. ACTIVE rows still name the old names: `kn-29-bkit-lints-itself-with-a-narrower-lint-prose-than-it-ships` (`lint:prose`, "never writes or overwrites" a `.vale.ini`), `capability-register-drift-reached-dev-through-warn-only-pre-push` (`pnpm graph:refresh`), `kn-lint-prose-gitignored-styles-silently-disable-gate-in-worktrees` (`lint:prose`, `styles/House`), `kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba` (`slop:delta`). Also raised by `build-plan-verify-holistic.md` and left open.
   - Blocking tests failed: none apply (ledger doc drift; no runtime surface).
   - Remediation: one superseding same-key row per key via `bkit ledgers append --ledger=knowledge`, with the new names.
2. `748-brand-every-consumer-readme-names-pnpm-graph-refresh`
   - Gap: Task 12 DONE WHEN docs grep must hit only `docs/migrations.md`; it also hits `README.md:344` ("`pnpm graph:refresh` redraws it from the code"). The line came from dev (`1bd70cb79`) and survived the rebase.
   - Blocking tests failed: none apply (prose about bkit's own map; nothing a consumer runs fails).
   - Remediation: `README.md:344` `pnpm graph:refresh` → `pnpm bkit:graph:refresh`.
3. `748-brand-every-consumer-old-name-warning-matches-prose-graph`
   - Gap: `findOldScriptNames` (`.bkit/core/engine/install/modules/core.ts:836-850`) matches the English word "graph" anywhere in a line, and the `graph` pair stays active whenever `package.json` has no `graph` key. Probe on the shipped `.bkit/templates/.github/workflows/bkit-ci.yml` returns lines 266, 666 and 683 (comments); `node dist/cli.js check` on bkit prints `.husky/pre-push:363 still runs the old script name "graph"; rename it to "bkit:graph" by hand` and the same for `.github/workflows/bkit-ci.yml:527`. The build called it known and out of scope with no ledger row (`build-plan-verify-holistic.md` § Notes; issue comment 2026-11-02).
   - Blocking tests failed: none apply (a false warning; nothing fails at runtime; the confirmed plan assumption has bare words warn). Deferral tests: bounded, in a touched file, no blocker, declared only at avoidance.
   - Remediation: report a `graph*` name only inside a `pnpm [flags] [run]` call, or skip comment lines and `.`-suffixed words; add a `core.test.ts` case that the shipped `bkit-ci.yml` template yields no `graph` hit.

## Handover Notes

None
