# Brief: group 6 — Challenge round 1 findings

Plan: Brand Every Consumer-Facing Name Implementation Plan

## Why and what

### Context & Goals

**Workstreams:** none — no parent design; the plan covers issue #748 whole. Required workstream dependencies: None.

Names a consumer types or sees still lack the bkit brand (issue #748 § Narrative lists them). Facts found while planning that correct the issue text:

<!-- prettier-ignore -->
| Issue says | Codebase shows | Plan does |
| --- | --- | --- |
| `GATE_TOOL_SCRIPTS` in `.bkit/core/engine/install/manifest.ts` | No such constant; `manifest.test.ts:397` parses `.bkit/core/.bkit/templates.md` § Gate tool scripts into a test-local `GATE_TOOL_SCRIPTS` | Renames keys in the `templates.md` block; no new constant |
| `bkit-renovate.yml` / `bkit-trivy.yml` show as `Renovate` / `Trivy` | Their jobs (`renovate`, `trivy`) carry no `name:`, so the job half of the check shows the bare id | Adds `name: bkit-renovate` / `name: bkit-trivy` to the workflow and the job |
| File names under `scripts/**` already carry `bkit-` | c491ae133 renamed the ten CI template files under `.bkit/templates/scripts/ci/` and bkit's own copies; the two launchd templates (`ai.bkit.launchd.plist`, `launchd.env.example`) still lack it; consumer copies of the CI scripts keep their old names (only the `ci-scripts-old-names` advisory names them); the health check already ships as the `bkit-health.yml` template, and the CI template carries no smoke stub | Renames the two launchd templates (Task 2), moves unedited consumer CI-script copies in an upgrade migration (Task 8) and rewrites the old health stub text in consumer CI copies (Task 9); guard has no exception list (Open Question 2, answered) |
| `House` named in `.bkit/instructions.md`, `bkit-supabase.md` | No `House` style hits; `bkit-supabase.md:18` names `ClickHouse` | Not touched; `House` checks are word-bounded |
| `pnpm graph:*` in `bkit-audit-duplication.md` | No hits in `.bkit/core/docs/templates/bkit-audit-duplication.md`; bkit's own `docs/templates/bkit-audit-duplication.md` project part (lines 242, 246, 249) names `pnpm graph:check`, `pnpm graph:update`, `pnpm graph:rollup` | Renamed in Task 3 |
| Copy-and-own copies are never written by bkit | `.bkit/core/.bkit/templates.md:12`, `.bkit/core/engine/install/modules/cloud.ts:57`, `:113`, `:166`, `.bkit/core/engine/install/version-file.ts:155-157` state it | Restated with the exact-shipped-text brand-migration carve-out (Tasks 7, 9) |
| Migration example: `ci-scripts-old-names` advisory | `detectCiScriptsOldNames` and `CI_SCRIPT_RENAMES` in `.bkit/core/engine/checks/after/ci-yml.ts` (c491ae133); `docs/migrations.md` row `ci-scripts-old-names` advisory | Task 8 reuses `CI_SCRIPT_RENAMES` for the move; the advisory stays for copies the migration leaves; follows the `migrateBkitLayout` / `migrateShortcutsToLite` write patterns |

Goals: rename in templates, engine text, shipped docs and bkit's own adopted copies; upgrade migrations registered in `docs/migrations.md`; a branding guard test; the rule in `.agents/rules.md` § Naming Conventions.

**Related Issues:**

- #748 — Brand every consumer-facing script, check and style name bkit-* (OPEN)
- #719 — Cloud variants: add --auto=codex and allow any tracker (OPEN)
- #745 — Enforce the authoring.md Notation rules on docs automatically (OPEN)
- #724 — Machine-wide test lock: one test run at a time across agents (OPEN; wraps `bkit:gate:*` values, edits `.bkit/core/.bkit/templates.md`)
- #489 — Own only what a workflow runs; ship the rest as templates (CLOSED)

---

### Narrative

Branding: every name a consumer or their agent runs or sees in a consumer repo carries `bkit-` (package.json script names `bkit:`), so bkit's value shows wherever it works. An upgrade migration (`docs/migrations.md`) brings them current, so `bkit upgrade` alone is enough.

### Success Criteria

- Every package.json script name `.bkit/templates.md` seeds or lists whose command runs bkit code starts with `bkit:`; `typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare` keep their names.
- Every workflow `name:` and job display name in `.bkit/templates/.github/workflows/*.yml` starts with `bkit-`.
- The shipped Vale style is `Bkit`; `.vale.ini` and every doc reference name `Bkit.*`.
- `bkit upgrade` on a consumer with the old names renames them in package.json, `.husky/pre-commit`, `.husky/pre-push`, the `bkit.testing.ciWorkflow` file and bkit's shipped workflow / Vale copies; a second run changes nothing.
- A branding guard test fails when a new consumer-facing script, check or style name lacks the prefix; `.agents/rules.md` § Naming Conventions states the rule and `docs/decisions.jsonl` records why.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Generic stack scripts (`typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare`), file names a third-party tool fixes (`.oxlintrc.json`, `dependabot.yml`, `.vale.ini`, `.lintstagedrc.json`, `.serena/project.yml`, `slop-scan.config.json`, `.husky/*`), engine-internal names (`.bkit/core/engine/shared/bkit-latest.ts`), job ids | Issue #748 § Out of Scope declares them outside the rule; Success Criterion 1 names the generic scripts as keeping their names; no criterion, scenario or test row needs them renamed | Issue #748 § Out of Scope; deferral `748-names-outside-the-branding-rule` |

## Where it fits

- Group 1: Rename bkit-powered package.json scripts and template files — done
  - TASK 1: Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` everywhere they are wired — done
  - TASK 2: Rename the two unprefixed launchd template files to `bkit-*` — done
  - TASK 3: Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names — done
- Group 2: Migrate script names; brand check names — done
  - TASK 4: Upgrade migration for package.json script names — done
  - TASK 5: Brand workflow and job display names — done
- Group 3: Brand the Vale style; migrate hook and CI tokens and CI script files — done
  - TASK 6: Rename Vale style `House` → `Bkit` — done
  - TASK 7: Unhashed write class and the husky / CI token migration — done
  - TASK 8: Upgrade migration for the renamed CI script files — done
  - TASK 13: Scope the second-upgrade check of the hook and CI token migration to its own log line — done
  - TASK 14: Leave the per-upgrade cache-bust file out of the second-run snapshot of the CI script move — done
- Group 4: Check-name and Vale migrations — done
  - TASK 9: Upgrade migration for workflow check names and the old health stub — done
  - TASK 10: Upgrade migration for the Vale style — done
- Group 5: Rule, docs, mirrors and dogfood — done
  - TASK 11: Write the rule; sweep the shared instruction and remaining shipped docs — done
  - TASK 12: Repo docs, mirror regeneration, build and old-shape dogfood — done
- Group 6: Challenge round 1 findings — this group
  - TASK 15: `migrateBrandedTemplateFiles` deletes `scripts/ci/check-dependency-audit.mjs` even when a workflow the path pass does not reach still guards its step with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`. That workflow might be a renamed CI file with no `bkit.testing.ciWorkflow`, or a separate nightly security workflow. The step then skips silently, and the dependency-audit gate is off with no log line — open
  - TASK 16: A consumer whose `trivy:` / `renovate:` job sets `name:` below another key (for example after `runs-on:`) gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running — open
  - TASK 17: `pnpm --filter=web lint:prose` (also `--dir=pkg` and `--prefix=pkg`) is rewritten to `pnpm --filter=web bkit:lint:prose`. Only the root `package.json` keys are renamed, so the sub-package has no `bkit:lint:prose`, and the hook or CI step fails with a missing script after upgrade — open
  - TASK 18: A consumer who adopted the v3 / v4 CI template as `.github/workflows/ci.yml` and never set `bkit.testing.ciWorkflow` gets `lint:prose` / `slop:delta` renamed in `package.json`. `ciWorkflowPath(".")` looks only for `bkit-ci.yml`, so their CI keeps `run: pnpm lint:prose` and fails with a missing script, and the upgrade log says nothing about that file — open
  - TASK 19: A symlink committed under `scripts/ci/` or `.vale/styles/` makes `bkit upgrade` write outside the repo or copy an out-of-repo file into it — open

## The work

<!-- bkit:task 15 start -->
- [ ] **TASK 15:** `migrateBrandedTemplateFiles` deletes `scripts/ci/check-dependency-audit.mjs` even when a workflow the path pass does not reach still guards its step with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`. That workflow might be a renamed CI file with no `bkit.testing.ciWorkflow`, or a separate nightly security workflow. The step then skips silently, and the dependency-audit gate is off with no log line
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1024` · **Round:** 1
  - **DONE WHEN:** before moving a unit, `migrateBrandedTemplateFiles` searches every `.github/workflows/*.yml` / `*.yaml` file outside the path pass (`ciWorkflowPath(".")`, `bkit-trivy.yml`) for each old path in the unit. A hit leaves the unit in place and logs one `console.warn` naming the file, the line and the manual move, so an irreversible delete never runs while an unreached reference remains
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a workflow outside the path pass still names` fails on shipped v6.0.0 `scripts/ci/check-dependency-audit.mjs` being removed while `.github/workflows/security.yml` holds `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`
<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->
- [ ] **TASK 16:** A consumer whose `trivy:` / `renovate:` job sets `name:` below another key (for example after `runs-on:`) gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1109` · **Round:** 1
  - **DONE WHEN:** `migrateBrandedCheckNames` inserts the job `name:` only when no 4-space `name:` key exists anywhere in that job's block (up to the next 2-space job key or the end of `jobs:`), and the result parses with `parseYaml`. The `docs/migrations.md` "Branded check names" row ("when the job has none") then holds
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the job sets name below another key` fails on the shipped v6.0.0 `bkit-trivy.yml`, with `    name: our trivy` placed after `    runs-on:`, coming out with two `name:` keys under `  trivy:` (`parseYaml` throws "Map keys must be unique", reproduced in `node` with the same two regexes)
<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->
- [ ] **TASK 17:** `pnpm --filter=web lint:prose` (also `--dir=pkg` and `--prefix=pkg`) is rewritten to `pnpm --filter=web bkit:lint:prose`. Only the root `package.json` keys are renamed, so the sub-package has no `bkit:lint:prose`, and the hook or CI step fails with a missing script after upgrade
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:784` · **Round:** 1
  - **DONE WHEN:** `renameScriptTokens` leaves a call unchanged when its flags select another package or directory (`--filter=…`, `-F…`, `--dir=…`, `-C…`, `--prefix=…`), as it already does for the space-separated `--filter web` form. `findOldScriptNames` then reports the call for the manual-rename warning that the `docs/migrations.md` "Branded script tokens in hooks and CI" row promises
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens leaves package-selecting flag forms alone` fails on `pnpm --filter=web lint:prose` coming back as `pnpm --filter=web bkit:lint:prose` (current output, probed with `tsx`)
<!-- bkit:task 17 end -->

<!-- bkit:task 18 start -->
- [ ] **TASK 18:** A consumer who adopted the v3 / v4 CI template as `.github/workflows/ci.yml` and never set `bkit.testing.ciWorkflow` gets `lint:prose` / `slop:delta` renamed in `package.json`. `ciWorkflowPath(".")` looks only for `bkit-ci.yml`, so their CI keeps `run: pnpm lint:prose` and fails with a missing script, and the upgrade log says nothing about that file
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:908` · **Round:** 1
  - **DONE WHEN:** after the rewrite pass, `migrateBrandedFileTokens` runs `findOldScriptNames` over every other `.github/workflows/*.yml` / `*.yaml` file for the active pairs, as a warning with no write. Each surviving `pnpm <old>` call outside the migrated files then logs one warning with file and line
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > warns on an old script name in a workflow it does not rewrite` fails on a run over `package.json` `{ "scripts": { "lint:prose": "bkit ci prose" } }` plus `.github/workflows/ci.yml` holding `run: pnpm lint:prose` that prints no warning naming `.github/workflows/ci.yml` and `lint:prose`
<!-- bkit:task 18 end -->

<!-- bkit:task 19 start -->
- [ ] **TASK 19:** A symlink committed under `scripts/ci/` or `.vale/styles/` makes `bkit upgrade` write outside the repo or copy an out-of-repo file into it
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1028` · **Round:** 1
  - **DONE WHEN:** `migrateBrandedTemplateFiles` and `migrateValeHouseStyle` check every source, target and target directory with `fs.lstatSync` (as `migrateBrandedFileTokens` and `migrateBrandedCheckNames` already do) and treat a symlink as "not moved" with one `console.warn` naming the path. Today `fs.existsSync(to)` follows links, so a dangling `scripts/ci/bkit-accepted-advisories.json` link counts as absent, and `fs.copyFileSync(from, to)` (`core.ts:1028`) writes the data file's committed bytes to wherever the link points. A symlinked `scripts/ci/accepted-advisories.json` is read through the link and lands in the tree as a regular file holding the target's bytes, for example `~/.npmrc`. A data file needs no shipped hash, and a unit holding only the data file still moves. The same follow-through applies to `.vale/styles/Bkit` (or `Bkit/<rule>.yml`) at `core.ts:1193`, which writes shipped-rule bytes into a linked-to directory. Cross-ref `docs/security.md` § Untrusted Content & Prompt Injection (repo content is untrusted data) and § PII ("NEVER log consumer repo content verbatim"); no symlink rule exists there yet.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > does not write through a dangling bkit- target symlink` fails on the planted file: seed `scripts/ci/accepted-advisories.json` and a dangling `scripts/ci/bkit-accepted-advisories.json` link pointing into a sibling tmp dir; after `runBkitDocs` the linked-to path exists with the payload
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a symlinked old data file in place` fails on `scripts/ci/bkit-accepted-advisories.json` becoming a regular file that holds the out-of-repo target's bytes
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > does not move rules into a symlinked Bkit directory` fails on the shipped `Filler.yml` being written into the linked-to directory
<!-- bkit:task 19 end -->
