Verdict: CONCERNS
Failures: 0
Coverage: partial diff coverage

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A symlink committed under `scripts/ci/` or `.vale/styles/` makes `bkit upgrade` write outside the repo or copy an out-of-repo file into it
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1028`
  - **DONE WHEN:** `migrateBrandedTemplateFiles` and `migrateValeHouseStyle` check every source, target and target directory with `fs.lstatSync` (as `migrateBrandedFileTokens` and `migrateBrandedCheckNames` already do) and treat a symlink as "not moved" with one `console.warn` naming the path. Today `fs.existsSync(to)` follows links, so a dangling `scripts/ci/bkit-accepted-advisories.json` link counts as absent, and `fs.copyFileSync(from, to)` (`core.ts:1028`) writes the data file's committed bytes to wherever the link points. A symlinked `scripts/ci/accepted-advisories.json` is read through the link and lands in the tree as a regular file holding the target's bytes, for example `~/.npmrc`. A data file needs no shipped hash, and a unit holding only the data file still moves. The same follow-through applies to `.vale/styles/Bkit` (or `Bkit/<rule>.yml`) at `core.ts:1193`, which writes shipped-rule bytes into a linked-to directory. Cross-ref `docs/security.md` § Untrusted Content & Prompt Injection (repo content is untrusted data) and § PII ("NEVER log consumer repo content verbatim"); no symlink rule exists there yet.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > does not write through a dangling bkit- target symlink` fails on the planted file: seed `scripts/ci/accepted-advisories.json` and a dangling `scripts/ci/bkit-accepted-advisories.json` link pointing into a sibling tmp dir; after `runBkitDocs` the linked-to path exists with the payload
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a symlinked old data file in place` fails on `scripts/ci/bkit-accepted-advisories.json` becoming a regular file that holds the out-of-repo target's bytes
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > does not move rules into a symlinked Bkit directory` fails on the shipped `Filler.yml` being written into the linked-to directory

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A monorepo CI workflow's nested `packages/<x>/scripts/ci/check-dependency-audit.mjs` path is rewritten to a file that does not exist, so its `hashFiles` guard skips the dependency audit and CI stays green
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:884`
  - **DONE WHEN:** `renamePathTokens` rewrites a `scripts/ci/<old>` token only when no path character comes before it: start of text, or a character outside `[\w./-]`, with an optional leading `./` kept. A path like `packages/api/scripts/ci/check-dependency-audit.mjs` or `vendor/scripts/ci/accepted-advisories.json` stays byte-identical. Today the regex anchors only the right side (`(?![\w.-])`). Once the root unit moves, or is already moved, every nested copy's path in the CI workflow, `.husky/*`, `bkit-trivy.yml` and package.json values is rewritten to a `bkit-` file the migration never created. The `ci-yml.ts` doc comment names the effect: a `hashFiles(...)`-guarded audit step silently skips. Cross-ref `docs/security.md` § Supply-Chain (GitHub Actions): the dependency-audit and scanner steps are security controls, and a silent skip removes one without a red check.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > leaves a nested package's scripts/ci path untouched` fails on the rewritten nested path: seed `scripts/ci/bkit-check-dependency-audit.mjs` with the old root file absent (an already-applied rename), plus `ci.yml` with `if: hashFiles('packages/api/scripts/ci/check-dependency-audit.mjs') != ''` and `run: node packages/api/scripts/ci/check-dependency-audit.mjs`. After `runBkitDocs`, both lines name `packages/api/scripts/ci/bkit-check-dependency-audit.mjs`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A `bkit.testing.ciWorkflow` value such as `../../../x.yml` makes `bkit upgrade` rewrite a file outside `.github/workflows/`, even outside the repo
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:911`
  - **DONE WHEN:** The brand migrations write the CI workflow only when `bkit.testing.ciWorkflow` is a bare file name: no `/`, no `\`, no `..`, ending `.yml` or `.yaml`. Any other value logs one `console.warn` and gets no write. The check can sit in the resolver (`.bkit/core/engine/shared/settings.ts:364`, which today accepts any non-empty string) or at the two write sites (`core.ts:911` in `migrateBrandedFileTokens`, `core.ts:1115` in `migrateBrandedCheckNames`). Before this diff every `ciWorkflowPath` caller only read the file. This diff makes it a write target, and `lstatSync(...).isFile()` checks only the last path segment, so `.github/workflows/../../../x.yml` resolves outside the checkout. The write is limited to `pnpm` token, `scripts/ci/` path and health-stub rewrites, hence LOW. Cross-ref `docs/security.md` § CI Auto-Route Trust: path-bearing values from collaborator-editable files get an allowlist before path construction ("rejecting `/`, `.`, `..`").
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > does not write a ciWorkflow that escapes .github/workflows` fails on the outside file being rewritten: package.json holds `"lint:prose": "custom"` and `bkit.testing.ciWorkflow: "../../../outside.yml"`, and the file one level above the tmp repo holds `run: pnpm lint:prose`. After `runBkitDocs` it reads `pnpm bkit:lint:prose`

<!-- bkit:task 3 end -->
