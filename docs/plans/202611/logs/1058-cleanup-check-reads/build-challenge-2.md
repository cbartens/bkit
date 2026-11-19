Verdict: PASS
Failures: 0
Fingerprint: 2b8771f8a7d4f0f5e3685d7704adff9ab45ab071154403a949925ed7e30242f4
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1058-cleanup-check-reads.md`, full coverage (no `partial diff coverage` line). It matches `git diff $(git merge-base dev HEAD) HEAD` exactly: 4 files.
- Surfaces challenged: `cleanupRead`, `treeEntry`, `devHeldEntry` and `dirtyWork` in `.bkit/core/engine/commands/workflow/worktrees.ts`; the same hunks in `dist/commands/workflow/worktrees.js`; the two new tests in `.bkit/core/engine/commands/workflow/branches.test.ts`; the closing row in `docs/deferrals.jsonl`.

## Notes

- Input validation (pathspec magic): read-only probes with git 2.56.0 confirm the fix. `git ls-tree HEAD -- ':/package.json'` returns the top-level `package.json`, and with `--literal-pathspecs` it returns nothing. `git show 'HEAD::/package.json'` fails with 'path ':/package.json' does not exist in 'HEAD'', so `committedLines` (`worktrees.ts:802`) already reads the path literally and needs no flag. Glob characters in a changed path are no longer pattern matches in `rev-list` either.
- Fail closed: `gitEnv()` (`.bkit/core/engine/ledgers/telemetry.ts:62`) passes an inherited `GIT_GLOB_PATHSPECS` or `GIT_ICASE_PATHSPECS` through. With either set, git exits 128 ('global 'literal' pathspec setting is incompatible with all other global pathspec settings'). Every changed call then fails closed: `treeEntry` and `devHeldEntry` throw, `notOnDev` returns the message (`worktrees.ts:850`), and cleanup keeps the branch (`worktrees.ts:1048`); `dirtyWork` counts the file as dirty (`worktrees.ts:886`, `worktrees.ts:916`). The pre-change `ls-tree` already exited 128 under both settings ('pathspec magic not supported by this command'), so the change opens no new data-loss or bypass path. `GIT_NOGLOB_PATHSPECS` works with the flag.
- `:(exclude)` entries: the `status` call in `dirtyWork` stays non-literal (`worktrees.ts:857`), so the `copyExcludes` magic keeps working, as `docs/testing.md:809` describes.
- Argument injection: the flag is a fixed first array element, every changed path still follows `--`, and the call stays `spawnSync` with an argument array and no shell, as `docs/security.md` § Shell Injection requires.
- Secrets, PII and data exposure: none added. The `docs/deferrals.jsonl` row carries only the repo slug, FIDs and the finding text, with no consumer name, token or personal data. The error and log texts are unchanged lines.
- Auth, data-access policies and tenancy: not applicable, because bkit has no login, session store or database (`docs/security.md` § Authentication, § RLS).
- Supply chain: no dependency added; `package.json` and `pnpm-lock.yaml` are untouched.
- Tests: the `commit` helper (`branches.test.ts:237`) stages with `git add -A`, so both new tests really commit `:/src.txt`.
- Docs consulted through `.agents/docs.md` (Build column): `docs/security.md` in full, `docs/testing.md` (lines 809, 863, 966), `docs/knowledge.jsonl` (no pathspec row), `docs/capabilities.md` (no cleanup or pathspec row) and `docs/architecture.md`. The change conflicts with none of them.
- Skipped: a scratch-repo probe that needed `git add` and `git commit` was denied and not retried, because this agent's contract forbids both. The read-only probes above test the same pathspec parsing against the worktree's own history. The test suite was not run and `dist/` was not rebuilt (mandate: no build); the `dist/` hunks were compared with the source hunks by reading.
- Out-of-scope leads, on unchanged lines and unverified, so not logged as findings:
  - Cleanup log lines print branch-controlled file names raw (`worktrees.ts:1049`, `worktrees.ts:1062`, `worktrees.ts:1081`), so a name that holds a newline could forge a line in output an agent reads.
  - `worktreeCopyLists` (`worktrees.ts:452`) reads the worktree's own `package.json`, so a branch that adds an entry to `bkit.workflows.worktree.copy` hides that path's uncommitted edits from `dirtyWork` before `git worktree remove --force`.
