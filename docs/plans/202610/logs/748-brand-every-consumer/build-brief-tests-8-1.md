# Brief: group 8 — Challenge round 2 finding left without a task (tests)

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
- Group 6: Challenge round 1 findings — done
  - TASK 15: `migrateBrandedTemplateFiles` deletes `scripts/ci/check-dependency-audit.mjs` even when a workflow the path pass does not reach still guards its step with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`. That workflow might be a renamed CI file with no `bkit.testing.ciWorkflow`, or a separate nightly security workflow. The step then skips silently, and the dependency-audit gate is off with no log line — done
  - TASK 16: A consumer whose `trivy:` / `renovate:` job sets `name:` below another key (for example after `runs-on:`) gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running — done
  - TASK 17: `pnpm --filter=web lint:prose` (also `--dir=pkg` and `--prefix=pkg`) is rewritten to `pnpm --filter=web bkit:lint:prose`. Only the root `package.json` keys are renamed, so the sub-package has no `bkit:lint:prose`, and the hook or CI step fails with a missing script after upgrade — done
  - TASK 18: A consumer who adopted the v3 / v4 CI template as `.github/workflows/ci.yml` and never set `bkit.testing.ciWorkflow` gets `lint:prose` / `slop:delta` renamed in `package.json`. `ciWorkflowPath(".")` looks only for `bkit-ci.yml`, so their CI keeps `run: pnpm lint:prose` and fails with a missing script, and the upgrade log says nothing about that file — done
  - TASK 19: A symlink committed under `scripts/ci/` or `.vale/styles/` makes `bkit upgrade` write outside the repo or copy an out-of-repo file into it — done
- Group 7: Challenge round 2 findings — done
  - TASK 20: A consumer's `trivy:` / `renovate:` job that holds a comment at job-key indent (`  # owner: security team`) above its own `name:` still gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running — done
  - TASK 21: `pnpm -r lint:prose` (also `pnpm --recursive slop:delta`, `pnpm -r run graph:update`) in a hook or CI step is rewritten to `pnpm -r bkit:lint:prose`. A recursive run skips the workspace root by default and runs the script in the sub-packages, whose `lint:prose` keys the migration never renames, so after upgrade pnpm fails with "None of the selected packages has a "bkit:lint:prose" script" — done
  - TASK 22: A consumer whose dependency-audit step lives in a local composite action (`.github/actions/audit/action.yml` with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`) gets the shipped audit unit moved to `scripts/ci/bkit-*`, because the Task 15 reference scan reads only `.github/workflows/*.yml` / `*.yaml`. The composite step then skips on every run, the dependency-audit gate is off and CI stays green with no log line — done
- Group 8: Challenge round 2 finding left without a task — this group
  - TASK 23: The pattern in `renameScriptTokens` that skips package-selecting flags backtracks exponentially, so a short committed line can hang `bkit check`, `bkit install` and `bkit upgrade` — open

## The work

<!-- bkit:task 23 start -->

- [ ] **TASK 23:** The pattern in `renameScriptTokens` that skips package-selecting flags backtracks exponentially, so a short committed line can hang `bkit check`, `bkit install` and `bkit upgrade`
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts` (`renameScriptTokens`, the flag part `-{1,2}[\w-]+`) · **Round:** 2
  - **DONE WHEN:** no pattern in `core.ts` (and so none in the built `dist/install/modules/core.js`) can match the same flag text in two ways: `--a` currently matches as `-` + `-a` or as `--` + `a`, so when the overall match fails the engine tries every combination and the time doubles with each extra flag. Measured on the old pattern: 24 flags take 59 ms, 28 flags 968 ms, 30 flags 3933 ms, and 40 flags (about 160 bytes) would take over an hour. The input can be any `package.json` script value, `.husky/pre-commit`, `.husky/pre-push` or the CI workflow file, and it runs on every check and upgrade. Every existing `renameScriptTokens` and `findOldScriptNames` test keeps passing with the same output
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens returns a many-flag line in bounded time` fails on a `pnpm` line with 30 flags (`--a --b ...`) and no script name taking longer than 500 ms, measured with `performance.now()` around the call because a vitest timeout cannot stop a synchronous regex

<!-- bkit:task 23 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Token rewrite changes whole `pnpm <old>` / `pnpm run <old>` tokens only | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 4 |
| Token rewrite reaches `pnpm` flag forms (`pnpm -s <old>`, `pnpm run --silent <old>`) | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 4 |
| renameScriptTokens leaves package-selecting flag forms alone | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 17 |
| renameScriptTokens leaves recursive flag forms alone | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 21 |
| renameScriptTokens returns a many-flag line in bounded time | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 23 |
