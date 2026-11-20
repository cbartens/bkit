Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Running `bkit install` or `bkit upgrade` with bkit's main-checkout engine on a non-git folder inside that checkout (a scratch consumer at `tmp/scratch`) now classes the folder as bkit's own repository, so install writes the rest of the payload there but silently skips the `.bkit/templates/` copies, the `.bkit/core` / `.bkit/shared` view links and the lint-staged warning
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/shared/package-roots.ts:52`
  - **DONE WHEN:** `isBkitOwnRepo` answers true only for the package root itself, or for the top level of a checkout (`git rev-parse --show-toplevel` equals the resolved `cwd`) whose git common dir's parent is the package root. A folder inside a checkout that is not its own repository is then a consumer again at `syncPayloadLinks` (`.bkit/core/engine/install/payload-links.ts:73`), `syncTemplateCopies` (`.bkit/core/engine/install/template-copies.ts:62`) and `warnMissingLintStagedConfig` (`.bkit/core/engine/install/template-copies.ts:184`), as it was before this diff. The three call sites keep calling the helper, as plan task 4 requires. A linked worktree of the package root's checkout still answers true, and the `steps finish` use at `.bkit/core/engine/commands/workflow/steps.ts:1729`, whose input is already a top level, is unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/package-roots.test.ts` `isBkitOwnRepo answers false for a folder inside the package root's checkout that is not its own repository` fails on the helper returning true, "expected true to be false". Fixture: `root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), ...)))`, resolved with `realpath` because macOS `os.tmpdir()` is a `/var` symlink to `/private/var`, and an unresolved root never matches git's output, so the test would pass already. Then `git init` the root, create `root/tmp/consumer` with no `git init`, and call `isBkitOwnRepo(path.join(root, "tmp", "consumer"), root)`.

<!-- bkit:task 1 end -->
