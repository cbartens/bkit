# Brief: group 7 — Challenge round 2 findings (tests)

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
- Group 7: Challenge round 2 findings — this group
  - TASK 20: A consumer's `trivy:` / `renovate:` job that holds a comment at job-key indent (`  # owner: security team`) above its own `name:` still gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running — open
  - TASK 21: `pnpm -r lint:prose` (also `pnpm --recursive slop:delta`, `pnpm -r run graph:update`) in a hook or CI step is rewritten to `pnpm -r bkit:lint:prose`. A recursive run skips the workspace root by default and runs the script in the sub-packages, whose `lint:prose` keys the migration never renames, so after upgrade pnpm fails with "None of the selected packages has a "bkit:lint:prose" script" — open
  - TASK 22: A consumer whose dependency-audit step lives in a local composite action (`.github/actions/audit/action.yml` with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`) gets the shipped audit unit moved to `scripts/ci/bkit-*`, because the Task 15 reference scan reads only `.github/workflows/*.yml` / `*.yaml`. The composite step then skips on every run, the dependency-audit gate is off and CI stays green with no log line — open

## The work

<!-- bkit:task 20 start -->
- [ ] **TASK 20:** A consumer's `trivy:` / `renovate:` job that holds a comment at job-key indent (`  # owner: security team`) above its own `name:` still gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1177` · **Round:** 2
  - **DONE WHEN:** the job-block scan in `migrateBrandedCheckNames` ends only at the next 2-space job key or a column-0 key, skipping blank and comment lines (`rest.search(/^(?: {2}[^\s#]|[^\s#])/m)` today stops at `  #` and `#`), and the rewritten workflow is checked with `parseYaml` before `finish` writes it; a result that does not parse is not written and logs one `console.warn` naming the file and the manual rename. Probed with `tsx` on the shipped v6.0.0 `bkit-trivy.yml` seeded with `  # owner: security team` after `  trivy:` and `    name: our trivy` after `    runs-on:`: the output holds `    name: bkit-trivy` and `    name: our trivy` under `  trivy:`, and `parseYaml` throws "Map keys must be unique at line 39". Task 16's DONE WHEN ("the result parses with `parseYaml`") is met only by the test, not by the code, and the `docs/migrations.md` "Branded check names" row ("when the job has none") does not hold for this shape
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when a job-indent comment sits above the job's own name` fails on the shipped v6.0.0 `bkit-trivy.yml`, seeded with `  # owner: security team` after `  trivy:` and `    name: our trivy` after `    runs-on:`, coming out with two `    name:` lines under `  trivy:` and `parseYaml` throwing
<!-- bkit:task 20 end -->

<!-- bkit:task 21 start -->
- [ ] **TASK 21:** `pnpm -r lint:prose` (also `pnpm --recursive slop:delta`, `pnpm -r run graph:update`) in a hook or CI step is rewritten to `pnpm -r bkit:lint:prose`. A recursive run skips the workspace root by default and runs the script in the sub-packages, whose `lint:prose` keys the migration never renames, so after upgrade pnpm fails with "None of the selected packages has a "bkit:lint:prose" script"
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:810` · **Round:** 2
  - **DONE WHEN:** the package-selector lookahead in `renameScriptTokens` also leaves calls with `-r` / `--recursive` alone (as it does for `-F`, `-C`, `--filter`, `--dir` and `--prefix`), so `findOldScriptNames` reports them for the manual-rename warning; `-w` / `--workspace-root` (which selects the root) keeps being rewritten. Probed with `tsx`: `renameScriptTokens("pnpm -r lint:prose", BKIT_SCRIPT_RENAMES)` returns `pnpm -r bkit:lint:prose`, and `pnpm --recursive slop:delta` returns `pnpm --recursive bkit:slop:delta`. Same failure as Task 17, through a selector the fix did not list
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens leaves recursive flag forms alone` fails on `pnpm -r lint:prose`, `pnpm --recursive slop:delta` or `pnpm -r run graph:update` coming back with a `bkit:` name
<!-- bkit:task 21 end -->

<!-- bkit:task 22 start -->
- [ ] **TASK 22:** A consumer whose dependency-audit step lives in a local composite action (`.github/actions/audit/action.yml` with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`) gets the shipped audit unit moved to `scripts/ci/bkit-*`, because the Task 15 reference scan reads only `.github/workflows/*.yml` / `*.yaml`. The composite step then skips on every run, the dependency-audit gate is off and CI stays green with no log line
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1047` · **Round:** 2
  - **DONE WHEN:** the reference scan in `migrateBrandedTemplateFiles` also reads every regular `action.yml` / `action.yaml` file under `.github/actions/` (the files a `uses: ./.github/actions/<name>` step runs, whose `runs.steps[*].if` accepts `hashFiles`). A hit leaves the unit in place and logs one `console.warn` naming the file, the line and the manual move, as a workflow hit does today, so the irreversible delete never runs while a composite action still names the old path. The `docs/migrations.md` "Branded CI script files" row, which today says "a workflow outside the path pass", then names composite actions too
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a composite action still names` fails on shipped v6.0.0 `scripts/ci/check-dependency-audit.mjs` and `.test.mjs` being removed (and `scripts/ci/bkit-check-dependency-audit.mjs` written) while `.github/actions/audit/action.yml` holds `runs:\n  using: composite\n  steps:\n    - if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''\n      run: node scripts/ci/check-dependency-audit.mjs\n      shell: bash\n`, with no warning naming `.github/actions/audit/action.yml`
<!-- bkit:task 22 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Upgrade renames old script keys, keeps custom values | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites `pnpm <old>` tokens in script values and the old default gate chains | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade leaves the old key when the new key exists | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites old tokens in `.husky/*` and the CI workflow file | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| Upgrade rewrites shipped old workflow / job `name:` lines, leaves customised ones | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| Upgrade moves shipped-hash Vale rules to `Bkit/`, keeps own and edited rules in `House` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| Gate advisory names the missing tool scripts by their `bkit:` names | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 1 |
| Token rewrite changes whole `pnpm <old>` / `pnpm run <old>` tokens only | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 4 |
| Token rewrite reaches `pnpm` flag forms (`pnpm -s <old>`, `pnpm run --silent <old>`) | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 4 |
| A foreign `graph*` script (value not running `scripts/graphify/bkit-`) keeps its key and its `pnpm graph` tokens | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| An old name the rewrite cannot reach (`pnpm --filter web lint:prose`) logs one warning naming file and line | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| `package.json` that is not valid JSON gets no migration write and the error reaches the upgrade output | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Shipped-content CI script units move to `bkit-` names with their data files, and their `scripts/ci/` paths are rewritten | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| An edited CI script unit, or one whose `bkit-` target exists, stays and is logged | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| The upgrade log names each renamed check with the branch-protection fix | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A `renovate:` / `trivy:` job that already carries a `name:` gets none inserted | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A custom `bkit.testing.ciWorkflow` file gets the health-stub rewrite; `bkit-ci.yml` is not looked for | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| `.vale.ini` names moved rules `Bkit.*` and lists both styles while `House` keeps files | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| Every `House` rule moved → `House/` removed, `BasedOnStyles` names `Bkit` alone, toggles read `Bkit.<rule>` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| `.vale/` present, `.vale.ini` absent → rules move, no `.vale.ini` write | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a workflow outside the path pass still names | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 15 |
| migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the job sets name below another key | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 16 |
| renameScriptTokens leaves package-selecting flag forms alone | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 17 |
| migrateBrandedFileTokens (via runBkitDocs) > warns on an old script name in a workflow it does not rewrite | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 18 |
| migrateBrandedTemplateFiles (via runBkitDocs) > does not write through a dangling bkit- target symlink | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 19 |
| migrateBrandedTemplateFiles (via runBkitDocs) > leaves a symlinked old data file in place | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 19 |
| migrateValeHouseStyle (via runBkitDocs) > does not move rules into a symlinked Bkit directory | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 19 |
| migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when a job-indent comment sits above the job's own name | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 20 |
| renameScriptTokens leaves recursive flag forms alone | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 21 |
| migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a composite action still names | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 22 |
