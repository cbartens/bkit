Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Diff coverage: partial diff coverage. The run diff `tmp/bkit-diff-748-brand-every-consumer.md` omits the focus files, so `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/write.ts`, `.bkit/core/engine/commands/install/upgrade.ts` and `.bkit/core/engine/checks/after/ci-yml.ts` were read whole from `git diff origin/dev...HEAD`. Findings stay within those four files and the behaviour they drive.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `migrateBrandedTemplateFiles` deletes `scripts/ci/check-dependency-audit.mjs` even when a workflow the path pass does not reach still guards its step with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`. That workflow might be a renamed CI file with no `bkit.testing.ciWorkflow`, or a separate nightly security workflow. The step then skips silently, and the dependency-audit gate is off with no log line
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1024`
  - **DONE WHEN:** before moving a unit, `migrateBrandedTemplateFiles` searches every `.github/workflows/*.yml` / `*.yaml` file outside the path pass (`ciWorkflowPath(".")`, `bkit-trivy.yml`) for each old path in the unit. A hit leaves the unit in place and logs one `console.warn` naming the file, the line and the manual move, so an irreversible delete never runs while an unreached reference remains
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a workflow outside the path pass still names` fails on shipped v6.0.0 `scripts/ci/check-dependency-audit.mjs` being removed while `.github/workflows/security.yml` holds `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A consumer whose `trivy:` / `renovate:` job sets `name:` below another key (for example after `runs-on:`) gets a second `name:` inserted, so GitHub rejects the workflow file and the scan stops running
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1109`
  - **DONE WHEN:** `migrateBrandedCheckNames` inserts the job `name:` only when no 4-space `name:` key exists anywhere in that job's block (up to the next 2-space job key or the end of `jobs:`), and the result parses with `parseYaml`. The `docs/migrations.md` "Branded check names" row ("when the job has none") then holds
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the job sets name below another key` fails on the shipped v6.0.0 `bkit-trivy.yml`, with `    name: our trivy` placed after `    runs-on:`, coming out with two `name:` keys under `  trivy:` (`parseYaml` throws "Map keys must be unique", reproduced in `node` with the same two regexes)

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `pnpm --filter=web lint:prose` (also `--dir=pkg` and `--prefix=pkg`) is rewritten to `pnpm --filter=web bkit:lint:prose`. Only the root `package.json` keys are renamed, so the sub-package has no `bkit:lint:prose`, and the hook or CI step fails with a missing script after upgrade
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:784`
  - **DONE WHEN:** `renameScriptTokens` leaves a call unchanged when its flags select another package or directory (`--filter=…`, `-F…`, `--dir=…`, `-C…`, `--prefix=…`), as it already does for the space-separated `--filter web` form. `findOldScriptNames` then reports the call for the manual-rename warning that the `docs/migrations.md` "Branded script tokens in hooks and CI" row promises
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens leaves package-selecting flag forms alone` fails on `pnpm --filter=web lint:prose` coming back as `pnpm --filter=web bkit:lint:prose` (current output, probed with `tsx`)

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A consumer who adopted the v3 / v4 CI template as `.github/workflows/ci.yml` and never set `bkit.testing.ciWorkflow` gets `lint:prose` / `slop:delta` renamed in `package.json`. `ciWorkflowPath(".")` looks only for `bkit-ci.yml`, so their CI keeps `run: pnpm lint:prose` and fails with a missing script, and the upgrade log says nothing about that file
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:908`
  - **DONE WHEN:** after the rewrite pass, `migrateBrandedFileTokens` runs `findOldScriptNames` over every other `.github/workflows/*.yml` / `*.yaml` file for the active pairs, as a warning with no write. Each surviving `pnpm <old>` call outside the migrated files then logs one warning with file and line
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > warns on an old script name in a workflow it does not rewrite` fails on a run over `package.json` `{ "scripts": { "lint:prose": "bkit ci prose" } }` plus `.github/workflows/ci.yml` holding `run: pnpm lint:prose` that prints no warning naming `.github/workflows/ci.yml` and `lint:prose`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** With a `package.json` that does not parse (a merge-conflict marker, say), `migrateBrandedScriptNames` keeps the old keys, but `migrateBrandedFileTokens` treats every pair as active and rewrites `.husky/pre-push` to `pnpm bkit:slop:delta`. Once the JSON is fixed, the hook calls a script that does not exist, and a foreign `graph` script's `pnpm graph` call is rebranded for good
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:896`
  - **DONE WHEN:** `migrateBrandedFileTokens` skips the script-token pass when `package.json` exists but `parseJson` fails or `scripts` is not an object, and logs a warning naming the skip. The path-rename pass may still run. The hooks and the CI file keep names that match the unrenamed keys
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > leaves hook tokens alone when package.json is not valid JSON` fails on `.husky/pre-push` holding `pnpm bkit:slop:delta` after a run over `{ "name": "x", "scripts": { "slop:delta": "x", ` and a hook running `pnpm slop:delta`

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** A consumer entry in `.vale/styles/House/` named like a moved rule without `.yml` (a `Filler/` folder, a `Verbose` file) is filtered out of `remaining`. `House/` then counts as empty, and `fs.rmSync(houseDir, { recursive: true })` deletes that consumer content
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1201`
  - **DONE WHEN:** `remaining` excludes only the exact `${rule}.yml` names in `moved`, so any other entry keeps `House/` and its `BasedOnStyles` entry in place
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > keeps House when it holds an entry named like a moved rule` fails on `.vale/styles/House/Filler/notes.txt` being deleted after the four shipped v6.0.0 rules move

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** When the `  trivy:` / `  renovate:` line carries a trailing comment or a CRLF ending, the workflow `name:` is rebranded but no job `name:` is inserted. The log still says the check is now `bkit-trivy / bkit-trivy`, so a maintainer who follows it sets a required check that never reports, and PRs wait forever
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1112`
  - **DONE WHEN:** `migrateBrandedCheckNames` builds the logged new check name from what it wrote (job `name:` inserted, already present, or not inserted), so the log names the job's real display name. The insert tolerates `\r\n` and a trailing `# comment` on the job line
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > logs the check name the file really carries` fails on the shipped v6.0.0 `bkit-trivy.yml`, saved with CRLF endings, getting no job `name:` while the log says `-> bkit-trivy / bkit-trivy` (reproduced in `node` with the same two regexes)

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** A line ending in `pnpm`, followed by a line that starts with an old script name (`command -v pnpm`, then `graph --help`), is rewritten across the newline to `bkit:graph --help`, because the flag and gap groups use `\s+`
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:784`
  - **DONE WHEN:** the `renameScriptTokens` pattern separates `pnpm`, its flags and the script name with horizontal whitespace only (`[ \t]+`), so no match spans a line break
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens never matches across a line break` fails on `"command -v pnpm\ngraph --help"` coming back as `"command -v pnpm\nbkit:graph --help"` (current output, probed with `tsx`)

<!-- bkit:task 8 end -->
