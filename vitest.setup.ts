// vitest.setup.ts — runs in every test worker before its test files load.
//
// Two jobs: strip inherited git environment variables (below), and re-read the
// load-scaled test budget as each test file starts (bottom, via
// vitest.timeout-budget.ts).
//
// `globals` is not enabled in vitest.config.ts, so these are imported, not free.
import { expect, vi } from "vitest";

import { tierTimeouts } from "./vitest.timeout-budget.ts";

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

// No test asks the npm registry for the newest bkit (`shared/bkit-latest.ts`): a temp
// repo pinned to an old release would otherwise hit the network on every stamp.
// Tests of that lookup clear it with `vi.stubEnv("BKIT_NO_UPDATE_CHECK", "")`.
process.env.BKIT_NO_UPDATE_CHECK = "1";

// Budget: re-read once per test file from `vitest.timeout-budget.ts`, scaled by how
// contended the machine is RIGHT NOW.
//
// WHY: both tiers spawn real subprocesses — `git`, `tsx`, the bkit CLI, fake
// binaries — so a budget fixed when the run starts goes stale. The box ramps under
// the run (a parallel agent session, a build), and a file that starts late runs
// several times slower against a number read minutes earlier. That reads as a flaky
// product but is only ever a starved subprocess: `Error: Test timed out in 5000ms`
// on a DIFFERENT test each run, all green in isolation. `pnpm test` is a pre-push
// gate (.husky/pre-push -> bkit:gate:static-unit), so that starvation blocks pushes
// on a green tree, and `--no-verify` is prohibited (.agents/rules.md). See
// docs/failures.jsonl `subprocess-integration-tests-time-out-at-5000ms-under-high-load`.
//
// setupFiles run once per test FILE, so `testPath` here is that file, and the
// re-read lands as each file starts. The config's own `...unitTimeouts()` sampled
// the same budget once at load; this overrides it per file. CI pins the factor to 1
// (in `loadFactor`), so the gate stays strict there.
const testPath = expect.getState().testPath ?? "";
vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")));
