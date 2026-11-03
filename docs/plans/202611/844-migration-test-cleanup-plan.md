# Migration and test cleanup implementation plan

> [!CAUTION]
> **Purpose:** Remove verified redundant tests and unused migration-era fixtures while preserving current behavior and public-release upgrade support.
> **Rules:** Keep changes inside this worktree. Follow `.agents/rules.md`. Record verification and the final commit in the related issue comments.

## Context & Goals

The owner approved implementation in a worktree. [Migration cleanup](https://github.com/cbartens/bkit/issues/844) owns historical artifacts; [Testing audit](https://github.com/cbartens/bkit/issues/480) owns redundant tests; [Dead code audit](https://github.com/cbartens/bkit/issues/476) remains the parent. Public support starts at stable 5.0.0. Existing registered migrations cover public versions and stay.

## Acceptance Scenario

The remaining suites exercise the same current behavior, each deleted duplicate has a surviving owner, and install/upgrade/uninstall preserve consumer customizations. Unused fixtures and obsolete test descriptions no longer imply support for private-era versions.

## Reuse Inventory

- Keep the shipped standalone CI-script suites and the Vitest runner that executes them.
- Keep the template/adopted-script identity checks and the genuine host-specific subagent tests.
- Keep current workflow/catalog consistency checks when removing redundant checks of old names.

## Out of Scope

Public-release migration removal, production behavior changes, CI workflow edits, dependency changes, pushes and merges are outside this cleanup.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Remove redundant coverage and unused artifacts

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Remove verified duplicate tests and their exclusive helpers.
  - **DELETE:** `.bkit/core/engine/audits/repo/resolve-push-base.test.ts` after matching its 17 cases to the standalone suite.
  - **UPDATE:** `.bkit/core/engine/audits/templates/ci-scripts.test.ts`, `templates-content.test.ts`, `audits/hooks/gateguard-parity.integration.test.ts` and `install/write.integration.test.ts`: remove the identified six, one, five and one redundant cases respectively.
  - **DONE WHEN:** Surviving suites run the same behaviors; the removal count is checked against baseline execution and review.
  - **TEST FIRST:** n/a — test-only deduplication; run affected existing suites before and after.

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [x] **TASK 2:** Remove unused historical fixtures and modernize misleading test narratives.
  - **DELETE:** `tests/fixtures/heavy-customised-consumer/.agents/.bkit-version` and `tests/fixtures/shortcuts-5.2.4/shortcuts.md.txt` after checking direct and dynamic readers.
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `uninstall.integration.test.ts` and `install/modules/claude.integration.test.ts`: describe preservation behavior and use a public baseline where versions are incidental.
  - **DONE WHEN:** Fixture consumers pass; no current migration is removed; the main checkout's pre-existing deletions are untouched.
  - **TEST FIRST:** n/a — unused fixtures and test setup/comments only; existing preservation tests verify the change.

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [x] **TASK 3:** Assess remaining historical absence checks and migration branches.
  - **READ:** `docs/migrations.md`, the install/upgrade readers, catalog/workflow/lite-label/verdict guards and their current-contract equivalents.
  - **UPDATE:** Only historical test checks proven redundant with surviving current-contract coverage.
  - **DONE WHEN:** Each assessed candidate has a remove or keep verdict with evidence; no public-version compatibility or current rule is lost.
  - **TEST FIRST:** n/a — no new behavior; run each changed suite and its surviving coverage owner.

<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->

- [x] **TASK 4:** Verify, review and document the cleanup.
  - **UPDATE:** `docs/testing.md` where its inventory names removed coverage; this plan's checklist and verification record.
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** Affected unit/integration suites, changed-file lint/format and the build pass; a fresh scratch consumer installs, upgrades and checks successfully; independent review is resolved and this record names the evidence. Post the scoped commit and evidence to the related issues at handoff.
  - **TEST FIRST:** n/a — verification and documentation only.

<!-- bkit:task 4 end -->
<!-- bkit:group 1 end -->

## Verification Plan

Run affected Vitest files with `--maxWorkers=2`, including the standalone-script runner, template identity suite, hook parity and actual host subagent suites, and install/upgrade/uninstall fixture consumers. Run Oxlint on changed TypeScript tests, Prettier on changed files, `pnpm build`, and `pnpm bkit:typecheck:tests`. Run the built CLI on a fresh consumer under `tmp/`, then inspect the generated manifest and hook files. Review `git diff --check` and the complete diff before committing explicit paths.

## Rollback Strategy

The cleanup lands as a scoped commit on the worktree branch. Revert that commit if the retained suites reveal a coverage loss. No runtime migration or external state is changed.

## Verification Record

- Removed 39 test cases: 17 push-base duplicates, 6 accepted-divergence duplicates, 1 weaker install-command assertion, 5 ordinary-edit cases mislabeled as subagent checks, 1 unused fixture-directory check, and 9 historical name-absence checks. Shipped standalone suites, actual host subagent cases, current catalog/workflow/writer/verdict contracts and preservation assertions remain.
- Removed the unused manifest and shortcuts fixture. Fixture consumers enumerate their inputs; no runtime or test reader references either deleted file. Public shortcuts migration tests seed their old shape inline. Antigravity 5.1.0 fixtures remain in use.
- The bounded compatibility sweep covered install/upgrade readers, version-file defaults, ledger normalization and the migration register. All 19 registered migrations cover public releases. Missing-hash defaults still protect consumer data; ledger readers still normalize old rows reintroduced by union merges; unmarked-file checks still prevent duplicate writes. No exclusively private-era production branch was proven removable.
- Unit and integration verification: 1,446 tests passed across 17 affected suites, plus 66 template-identity tests. The final upgrade-helper cleanup passed its 63-test integration suite again. The CI-script runner executes the surviving standalone suites as child processes.
- `pnpm build`, `pnpm bkit:typecheck:tests`, changed-file Oxlint, Prettier and `git diff --check` passed. Build output was unchanged. The two documentation files passed the prose gate with four existing warnings on untouched lines of `docs/testing.md`.
- A fresh scratch consumer passed the built CLI's install (Claude, Cursor and Antigravity), upgrade, check and uninstall. Inspection confirmed the version pin and all three host hook surfaces; the consumer README survived every command, and uninstall removed the version manifest.
- Independent review found no blocking findings. Its redundant old-layout directory setup finding was removed and the upgrade integration suite rerun.
- The preliminary run passed 558 tests but was not a clean baseline: it tried to import the duplicate push-base file after cleanup deleted it. The completed-file-set runs above passed without retries for test failures.
- The original checkout's pre-existing deletions were left untouched. The worktree uses existing dependencies without copied credential files. Keep the branch local until a push is authorized; record the final commit in issues #844, #480 and #476.
