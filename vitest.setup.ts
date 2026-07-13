// vitest.setup.ts — runs in every test worker before its test files load.
//
// Strip inherited git environment variables so no test can accidentally operate
// on the real bkit repo.
//
// WHY: when the suite is invoked from inside a git hook (the `.husky/pre-push`
// hook runs `pnpm test`), git exports GIT_DIR / GIT_WORK_TREE / GIT_INDEX_FILE /
// GIT_COMMON_DIR / GIT_OBJECT_DIRECTORY / … into the environment for the hook and
// every child process. Integration tests that run `git` in an `os.tmpdir()`
// scratch repo via child_process inherit these, and they OVERRIDE the child's
// `cwd` — so `git init` / `git add` / `git commit` operate on the REAL repo, not
// the temp dir. On 2026-07-13 this hijacked the checked-out `feat/dev-wip-park`
// branch (moving it onto a test's fixture commits) and the in-flight `git push`
// then shipped that garbage to origin. See project memory
// "No concurrent bkit workflows on one clone" (2026-07-13 incident).
//
// Deleting GIT_* here makes temp-repo git commands discover their repository
// purely from `cwd`, and read-only tests that DO want the real repo already use
// an explicit `git -C <REPO_ROOT> …` (which ignores GIT_DIR), so they are
// unaffected. In a normal `pnpm test` run (not from a hook) no GIT_* vars are
// set, so this is a no-op.
for (const key of Object.keys(process.env)) {
  if (key.startsWith("GIT_")) {
    delete process.env[key];
  }
}
