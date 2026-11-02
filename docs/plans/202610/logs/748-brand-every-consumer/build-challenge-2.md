Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

Diff coverage: partial diff coverage (12080 diff lines across 166 files; `.bkit/core/engine/install/modules/core.ts` read whole in the worktree and through `git diff origin/dev...HEAD`).

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A committed line such as `pnpm --a --a … --a x` (40 value-less flags, about 160 bytes) in a `package.json` script value, `.husky/pre-commit`, `.husky/pre-push` or the CI workflow hangs `renameScriptTokens` for over an hour, so every `bkit check` (the CI step `run: pnpm bkit check` in `bkit-tests-static`, which has no `timeout-minutes`, so up to GitHub's 360-minute default) and every `bkit install` / `bkit upgrade` stalls
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:810`
  - **DONE WHEN:** the flag part of the `renameScriptTokens` pattern matches each flag token in exactly one way. Today `-{1,2}[\w-]+` can split `--a` as `-` + `-a` or as `--` + `a`, so a failed match backtracks through 2^n splits (probed with `node`: 24 flags 59 ms, 28 flags 968 ms, 30 flags 3933 ms, doubling per flag). The fix makes the dash count unambiguous (for example `--?(?!-)[\w][\w-]*` or a tokeniser), keeps every current `renameScriptTokens` test green, and returns in linear time on a long run of flags with no old name after it. The pattern runs on every check and upgrade, not only on the first migration, because a pair whose old key is gone stays active. Cross-ref `docs/security.md` § Untrusted Content & Prompt Injection (committed repo content is untrusted data); the doc has no rule on regex backtracking over repo content
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens returns quickly on a pnpm call with many flags and no old name` fails on `renameScriptTokens("pnpm" + " --a".repeat(28) + " x", BKIT_SCRIPT_RENAMES)` taking longer than 100 ms, measured with `performance.now()` around the call (about 1000 ms today; a vitest timeout cannot stop a synchronous regex, so the test measures elapsed time on a size that still finishes)

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A consumer whose dependency-audit step lives in a local composite action (`.github/actions/audit/action.yml` with `if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''`) gets the shipped audit unit moved to `scripts/ci/bkit-*`, because the Task 15 reference scan reads only `.github/workflows/*.yml` / `*.yaml`. The composite step then skips on every run, the dependency-audit gate is off and CI stays green with no log line
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1047`
  - **DONE WHEN:** the reference scan in `migrateBrandedTemplateFiles` also reads every regular `action.yml` / `action.yaml` file under `.github/actions/` (the files a `uses: ./.github/actions/<name>` step runs, whose `runs.steps[*].if` accepts `hashFiles`). A hit leaves the unit in place and logs one `console.warn` naming the file, the line and the manual move, as a workflow hit does today, so the irreversible delete never runs while a composite action still names the old path. The `docs/migrations.md` "Branded CI script files" row, which today says "a workflow outside the path pass", then names composite actions too
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a composite action still names` fails on shipped v6.0.0 `scripts/ci/check-dependency-audit.mjs` and `.test.mjs` being removed (and `scripts/ci/bkit-check-dependency-audit.mjs` written) while `.github/actions/audit/action.yml` holds `runs:\n  using: composite\n  steps:\n    - if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''\n      run: node scripts/ci/check-dependency-audit.mjs\n      shell: bash\n`, with no warning naming `.github/actions/audit/action.yml`

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A committed `.husky` or `.github` symlink (for example `.husky -> ../other-repo/.husky`) makes `bkit upgrade` rewrite files outside the repo: `migrateBrandedFileTokens` and `migrateBrandedCheckNames` check only the last path part with `fs.lstatSync(file)?.isFile()`, which follows a linked parent directory, so `.husky/pre-push`, `.github/workflows/bkit-trivy.yml`, `bkit-renovate.yml`, `bkit-cloud.yml` and the CI workflow are read and written through the link. The Task 19 fix added `linkedPath` for exactly this case but applied it only to `migrateBrandedTemplateFiles`
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:941`
  - **DONE WHEN:** `migrateBrandedFileTokens` (`core.ts:941`) and `migrateBrandedCheckNames` (`readFile`, `core.ts:1148`) skip a file for which `linkedPath(file)` is true, with one `console.warn` naming the repo-relative path and the manual rename, so neither function writes through a symlinked `.husky`, `.github` or `.github/workflows`. The written bytes are limited to the brand renames, which keeps this LOW, but the write still lands in a file the consumer did not run the upgrade on. The `docs/migrations.md` rows "Branded script tokens in hooks and CI" and "Branded check names" then state the symlink skip, as the "Branded CI script files" row already does; `docs/security.md` has no symlink rule
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > does not rewrite a hook through a symlinked .husky directory` fails on a run over `package.json` `{ "scripts": { "lint:prose": "bkit ci prose" } }` and a `.husky` symlink to a sibling tmp dir whose `pre-push` holds `pnpm lint:prose\n`: after `runBkitDocs` the out-of-repo `pre-push` reads `pnpm bkit:lint:prose`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > does not rewrite a workflow through a symlinked .github directory` fails on a `.github` symlink to a sibling tmp dir whose `workflows/bkit-trivy.yml` holds the shipped v6.0.0 text: after `runBkitDocs` the out-of-repo file carries `name: bkit-trivy`

<!-- bkit:task 3 end -->
