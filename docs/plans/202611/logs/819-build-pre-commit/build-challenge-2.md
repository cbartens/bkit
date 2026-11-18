Verdict: CONCERNS
Failures: 1
Fingerprint: bca8fd2f367d8f2dc56c6c481375ac3c19d58ef9b9ee24b9f3b8e8eace74f92b
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff `tmp/bkit-diff-819-build-pre-commit.md` read in full (no `partial diff coverage` line): new `scripts/gate/bkit-check-dist.mjs`, `package.json` `bkit:check:dist` now calls that script, new `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`, `docs/testing.md`, and one new `docs/deferrals.jsonl` row.
- Callers on the trust path read to place the script: `.husky/pre-commit:22`, `.husky/pre-push:395`, `.github/workflows/bkit-ci.yml:516` (static lane), `.github/workflows/release.yml:63` (`Verify dist/ is fresh`, the only content check before `npm publish`). `package.json` `files` ships `dist/` and `bin` points `bkit` at `./dist/cli.js`.
- Docs: `docs/security.md` (full, § Release path and § Shell Injection), `.agents/docs.md`, `docs/architecture.md` `scripts/gate/` entry, `docs/data-schema.md` (no schema), `docs/knowledge.jsonl` (KN-7 dist staleness), `docs/failures.jsonl` (`precommit-check-dist-blocks-parallel-agents`), `tsconfig.json`.
- Probe: a scratch git repo confirmed `git hash-object --no-filters` ignores a `working-tree-encoding` attribute (git stored the filtered blob `c6003325…`; `--no-filters` hashed the raw bytes `ab145edf…`), so the round-1 gitattributes bypass is closed. Nothing was written in the worktree apart from this file.

## Notes

- Both round-1 HIGH findings are fixed in this diff, and I re-checked each against the committed script:
  - The staged-entry parser keeps the whole path after the first tab (`line.slice(tab + 1)`), refuses a repeated `dist/` path, and compares in both directions with a `size` check (`scripts/gate/bkit-check-dist.mjs:83-96`), so a tab-named twin no longer shadows a payload file.
  - The compile output is hashed with `git hash-object --no-filters` (`:85`), which I confirmed ignores `working-tree-encoding`, so a `.gitattributes` rule on the scratch path can no longer re-encode the scratch bytes to match a committed payload's hash.
- The script fails closed: a non-zero `git` throws and the top-level catch sets exit 1; a `checkout-index` or `tsc` failure returns 1. Every subprocess uses `spawnSync` with an argument array and no shell (`docs/security.md` § Shell Injection). The scratch directory is `mkdtemp` (random name, 0700) under the git-ignored `tmp/` and removed in `finally`; `node_modules` is symlinked, not installed, so a staged `package.json` edit runs no install script. Modes are compared (`cli.js` forced to 755), so a mode flip is caught. The exported set matches `tsconfig.json` (`rootDir` `.bkit/core/engine`, `include` `.bkit/core/engine/**/*.ts`, `outDir` `dist`, no `extends`), so the compile scope is complete.
- The one finding (empty compile counted as fresh) is already recorded as an OPEN row in this diff's `docs/deferrals.jsonl` (key `819-build-pre-commit-challenge-low-scripts-gate-bkit-check-dist-mjs-67`). I log it because no plan task or test fixes it, and flag the deferral so it is settled once, not twice. It cannot inject code: the worst outcome is publishing an empty or broken `dist/`, and it needs a `tsconfig.json` change plus a full `dist/` removal, both glaring in review.
- Related integrity edge (not a separate task — cannot inject code): the check compares the compile against `git ls-files -s dist/` (index blobs), but `npm publish` ships the checked-out working-tree bytes. A `.gitattributes` `eol` or `working-tree-encoding` rule on `dist/**` would make those two diverge, so the published `cli.js` could differ from what the check validated. Attribute-driven conversions cannot insert attacker code (a smudge/clean driver needs local git config, which a repo cannot ship), so the worst case is a re-encoded or CRLF benign file that breaks the CLI, and any such rule is a glaring `.gitattributes` addition.
- Plan gap: `Security & Privacy` (plan line 127) says None and the Documentation Consultation marks `docs/security.md` as not applying, but this script is the release gate at `release.yml:63`, the last content check before `npm publish` (`docs/security.md` § Release path).
- Trust level: every residual gap needs a commit merged to `main` (write access, or a write-token agent steered by untrusted text). Such a committer could also edit the script openly, so the concern is a weakening that survives review, not an unauthenticated bypass — that is why nothing here is CRITICAL or HIGH.
- Out-of-lens: at `.husky/pre-push:395` the check reads the index, not the commits being pushed, so another agent's staged edits in the shared checkout could make a pre-push run pass or refuse on files not in the push; CI and `release.yml` re-run on clean checkouts, so this is not a release bypass.
- Docs read but holding no security rule for this diff: `.bkit/workflows.md`, `.bkit/prompts.md`, `.agents/skills.md`, `docs/capabilities.md`, `docs/observability.md`; `docs/testing.md` read through the diff hunks only.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** The dist freshness check counts an empty compile as fresh: a commit that sets noEmit or moves outDir in tsconfig.json and drops dist/ from the index passes `Verify dist/ is fresh`, so the release gate no longer guarantees a non-empty dist/ before npm publish; the old chain refused this at `chmod +x dist/cli.js`
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-check-dist.mjs:83` · **Round:** 1
  - **DONE WHEN:** The check exits 1 with a named reason when the scratch compile writes no file under dist/ (for example tsconfig.json sets noEmit or moves outDir away from dist), so a staged tree whose compile emits nothing and whose index carries no dist/ is refused rather than counted as fresh. This is already an OPEN row in docs/deferrals.jsonl (key 819-build-pre-commit-challenge-low-scripts-gate-bkit-check-dist-mjs-67); settle it there or with a fix, not twice.
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/check-dist.integration.test.ts `refuses a staged tree whose compile emits no dist` fails on the check exiting 0 after tsconfig.json is staged with "outDir": "out" and dist/ is removed from the index with git rm -r --cached dist
<!-- bkit:task 1 end -->
