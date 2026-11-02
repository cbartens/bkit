Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Diff coverage: partial diff coverage. The run diff `tmp/bkit-diff-748-brand-every-consumer.md` shows 500 lines of `.bkit/core/engine/install/modules/core.ts`; the group 6 changes were read whole from `git diff 25c06ea5d HEAD -- .bkit/core/engine/install/modules/core.ts` and the current file. Findings stay within the group 6 fixes (tasks 15-19) and the code they touch.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A consumer's `trivy:` / `renovate:` job that holds a comment at job-key indent (`  # owner: security team`) above its own `name:` still gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1177`
  - **DONE WHEN:** the job-block scan in `migrateBrandedCheckNames` ends only at the next 2-space job key or a column-0 key, skipping blank and comment lines (`rest.search(/^(?: {2}[^\s#]|[^\s#])/m)` today stops at `  #` and `#`), and the rewritten workflow is checked with `parseYaml` before `finish` writes it; a result that does not parse is not written and logs one `console.warn` naming the file and the manual rename. Probed with `tsx` on the shipped v6.0.0 `bkit-trivy.yml` seeded with `  # owner: security team` after `  trivy:` and `    name: our trivy` after `    runs-on:`: the output holds `    name: bkit-trivy` and `    name: our trivy` under `  trivy:`, and `parseYaml` throws "Map keys must be unique at line 39". Task 16's DONE WHEN ("the result parses with `parseYaml`") is met only by the test, not by the code, and the `docs/migrations.md` "Branded check names" row ("when the job has none") does not hold for this shape
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when a job-indent comment sits above the job's own name` fails on the shipped v6.0.0 `bkit-trivy.yml`, seeded with `  # owner: security team` after `  trivy:` and `    name: our trivy` after `    runs-on:`, coming out with two `    name:` lines under `  trivy:` and `parseYaml` throwing

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** `pnpm -r lint:prose` (also `pnpm --recursive slop:delta`, `pnpm -r run graph:update`) in a hook or CI step is rewritten to `pnpm -r bkit:lint:prose`. A recursive run skips the workspace root by default and runs the script in the sub-packages, whose `lint:prose` keys the migration never renames, so after upgrade pnpm fails with "None of the selected packages has a "bkit:lint:prose" script"
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:810`
  - **DONE WHEN:** the package-selector lookahead in `renameScriptTokens` also leaves calls with `-r` / `--recursive` alone (as it does for `-F`, `-C`, `--filter`, `--dir` and `--prefix`), so `findOldScriptNames` reports them for the manual-rename warning; `-w` / `--workspace-root` (which selects the root) keeps being rewritten. Probed with `tsx`: `renameScriptTokens("pnpm -r lint:prose", BKIT_SCRIPT_RENAMES)` returns `pnpm -r bkit:lint:prose`, and `pnpm --recursive slop:delta` returns `pnpm --recursive bkit:slop:delta`. Same failure as Task 17, through a selector the fix did not list
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens leaves recursive flag forms alone` fails on `pnpm -r lint:prose`, `pnpm --recursive slop:delta` or `pnpm -r run graph:update` coming back with a `bkit:` name

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `migrateBrandedTemplateFiles` deletes a shipped `scripts/ci/` unit while a reference the path pass never rewrites still names it: a composite action (`.github/actions/audit/action.yml` with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`) or a symlinked `.husky/pre-push` (the shipped hook guards `[ -f scripts/ci/lanes/resolve-push-base.mjs ]`). The guarded step or hook branch then skips silently, so the dependency audit or the push-base resolution is off with no log line
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1047`
  - **DONE WHEN:** the Task 15 reference scan also reads every `.github/actions/**/action.yml` / `action.yaml` file, and treats any path-pass file (`.husky/pre-commit`, `.husky/pre-push`, `ciWorkflowPath(".")`, `bkit-trivy.yml`) that exists but is not a regular file as an unreached reference: the unit stays and one `console.warn` names the file and the manual move. Today `otherWorkflows` reads only `.github/workflows/*.yml` / `*.yaml`, the scan skips the path-pass files on the assumption that `migrateBrandedFileTokens` rewrites them, and `migrateBrandedFileTokens` (`core.ts:941`) skips a symlinked one with no warning, so Task 15's invariant ("an irreversible delete never runs while an unreached reference remains") does not hold for these files
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a composite action still names` fails on shipped v6.0.0 `scripts/ci/check-dependency-audit.mjs` being removed while `.github/actions/audit/action.yml` holds `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit a symlinked hook still names` fails on shipped v6.0.0 `scripts/ci/lanes/resolve-push-base.mjs` being removed while `.husky/pre-push` is a symlink to `hooks/pre-push` holding `[ -f scripts/ci/lanes/resolve-push-base.mjs ]`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** With `.vale.ini` committed as a symlink, `migrateValeHouseStyle` moves the four shipped rules to `Bkit/` and removes `House/`, then returns at the `.vale.ini` check with no warning. The config still says `BasedOnStyles = House` and `House.<rule>` toggles, so Vale reports the `House` style as missing and `pnpm bkit:lint:prose` fails on every run, or (with own rules left in `House/`) loads none of the moved rules
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1301`
  - **DONE WHEN:** `migrateValeHouseStyle` checks `.vale.ini` with `fs.lstatSync` before moving any rule; a `.vale.ini` that exists but is not a regular file leaves every rule in `House/` and logs one `console.warn` naming `.vale.ini` and the manual move, matching the Task 19 refusal for symlinked `.vale`, `.vale/styles`, `House` and `Bkit`. An absent `.vale.ini` keeps its planned behaviour (rules move, no write)
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > leaves the House rules when .vale.ini is a symlink` fails on the shipped `House/Filler.yml` being moved (or `House/` removed) while `.vale.ini` is a symlink to `config/vale.ini` holding `BasedOnStyles = House`, or on no warning naming `.vale.ini`

<!-- bkit:task 4 end -->
