Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A repo that commits `.lintstagedrc.json` as a dangling symlink (for example to `../../.config/x/planted.json`), keeps the old `.bkit/templates/.lintstagedrc.json` and gates format on `lint-staged` makes `bkit install` / `bkit upgrade` create a file outside the repo, because `hasLintStagedConfig` (`fs.existsSync`) reads the dangling link as absent and `fs.copyFileSync` writes through it
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:164`
  - **DONE WHEN:** `migrateLintStagedSample` checks the root `.lintstagedrc.json` with `fs.lstatSync(p, { throwIfNoEntry: false })` before the copy and, when any entry exists there (a symlink, dangling or not, or any non-file), writes nothing, pushes no write, and logs one warning naming the manual copy from `.bkit/templates/lintstagedrc.example.json`, matching the symlink guards of the other migrations in `.bkit/core/engine/install/modules/core.ts` (`migrateSlopTypeSuppression`, `migrateValeHouseStyle`); the dry run reports the same skip.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/template-copies.test.ts` `migrateLintStagedSample writes nothing through a dangling .lintstagedrc.json symlink` fails on `fs.existsSync(path.join(outside, "planted.json"))` being true and the return value being true after calling `migrateLintStagedSample(tmpDir, { dryRun: false, ws: { writes: [] }, logPrefix: "[t]" })` on a consumer holding `.bkit/templates/.lintstagedrc.json`, `package.json` `scripts["bkit:gate:format"] = "pnpm lint-staged"` and a root `.lintstagedrc.json` symlinked to a not-yet-existing file in a sibling temp folder

<!-- bkit:task 1 end -->
