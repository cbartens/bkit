Verdict: CONCERNS
Failures: 1
Fingerprint: 53736e26c872898ea9ea4847d4d4af4c210359c63b3ef24492598ecfb173bef1
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1055-worktree-removal-says.md`, read in full (full coverage, no `partial diff coverage` line). Surfaces: `devHeldEntry` and its call in `notOnDev` (`.bkit/core/engine/commands/workflow/worktrees.ts:805-838`) and the `dist/commands/workflow/worktrees.js` copy; new cases in `branches.test.ts` and `worktrees.test.ts`; two `.bkit/friction.jsonl` rows; `docs/observability.md` line 221; two `docs/testing.md` rows.
- Callers read, unchanged: `removeWorktree` local and remote checks (`worktrees.ts:1046`, `:1058`) and `branches land` (`branches.ts:3284`).
- Plan read: `docs/plans/202611/1055-worktree-removal-says-plan.md`.
- Docs loaded: `.agents/docs.md`, `docs/security.md` (full), `docs/decisions.jsonl` key `842-ship-preserves-unlanded-work`; `docs/knowledge.jsonl`, `docs/failures.jsonl` and `docs/capabilities.md` searched for the landed check and pathspec handling (no hits).

## Notes

- Core safety property holds: every commit `devHeldEntry` accepts comes from `{base}..origin/dev`, so the branch's exact tree entry (mode, type and blob) for that path stays reachable from `origin/dev` after the branch is deleted. Revert-then-delete and coincidental equal content lose no file content.
- Failure paths stay on the safe side: a failed `rev-list` throws into the existing catch and the branch is preserved; an over-large output fails `spawnSync` the same way; a shallow history only lists fewer commits, which preserves more.
- Shell injection (`docs/security.md` § Shell Injection): git runs through `spawnSync` with an argv array, the path follows `--`, and `base` is a SHA from `merge-base`. Compliant.
- Pathspec handling was checked with read-only git commands in this worktree (git 2.56.0): `ls-tree HEAD -- ':/package.json'` resolves to the repo-root file, `rev-list -- ':/package.json'` accepts the same magic, `ls-tree` treats `?` literally, `ls-tree -- ':!x'` fails with "pathspec magic not supported", and `GIT_LITERAL_PATHSPECS=1` makes `:/package.json` match nothing. A scratch-repo reproduction was refused by the permission check and was not retried another way. Task 1's first case is new in this diff (pre-diff code named `:/src.txt`, since `dev`'s tip `src.txt` differed); the second case already existed through the unchanged `feature === dev` line, and the same literal-pathspec fix closes both.
- `.bkit/friction.jsonl` rows: no secrets, no PII, no consumer names; the main checkout is written as `<main checkout>`.
- No new dependency, no auth, session, tenancy or data-access policy surface, no secret, no network input.
- Out of lens, not a finding: `devHeldEntry` spawns one `ls-tree` per `origin/dev` commit that touched each differing path, so a long-lived branch with often-changed ledgers (`*.jsonl`) now costs many more git processes per cleanup.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:805` · **Round:** 1
  - **DONE WHEN:** every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `a path under a directory named ":" is compared as itself, not as the repo-root file` fails on `notOnDev` returning `[]` for a branch that adds `:/src.txt` while `dev` deletes `src.txt`, re-adds it as `code v0` and then appends a later edit
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `a path under a directory named ":" that dev never touched is not reported landed` fails on `notOnDev` returning `[]` for a branch that adds `:/src.txt` while `dev` leaves `src.txt` unchanged
<!-- bkit:task 1 end -->
