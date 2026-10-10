// vitest.setup.ts — runs in every test worker before its test files load.
//
// Two jobs: strip inherited git environment variables (below), and give the
// integration suite a test budget that matches what it actually does (bottom).
//
// `globals` is not enabled in vitest.config.ts, so these are imported, not free.
import { expect, vi } from "vitest";

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

// Give `*.integration.test.ts` a 30s budget; unit tests keep vitest's 5s default.
//
// WHY: 5s is a unit-test budget and the integration suite is not unit work — it
// spawns the bkit CLI under `tsx` in a temp repo, so one `it` pays process
// startup plus real fs and git work. Each is fast alone (all of
// .bkit/core/engine/commands/install/upgrade.integration.test.ts runs in ~6s), but the full suite runs those
// spawns in parallel and on a loaded machine they lose the race against 5s. It
// surfaces as `Error: Test timed out in 5000ms` on a DIFFERENT test each run —
// the upgrade and check-opencode integration tests traded places across 7 full-suite runs on
// 2026-08-27 — which reads as a flaky product but is only ever a starved
// subprocess. `pnpm test` is a pre-push gate (.husky/pre-push ->
// bkit:gate:static-unit), so that starvation blocks pushes on a green tree, and
// `--no-verify` is prohibited (.agents/rules.md).
//
// Scoped here rather than as a global `testTimeout` in vitest.config.ts so the
// unit suite keeps the strict 5s ceiling: a unit test that needs longer is a
// unit test doing real I/O, and that should still fail. The cost is that a
// genuinely hung integration test now takes 30s to surface instead of 5s.
//
// setupFiles run once per test FILE, so `testPath` here is that file.
const testPath = expect.getState().testPath ?? "";
if (testPath.endsWith(".integration.test.ts")) {
  vi.setConfig({ testTimeout: 30_000 });
}
