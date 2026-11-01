// vitest.setup.ts — runs in every test worker before its test files load.
//
// Four jobs: strip inherited git environment variables (below), fail any test that
// changes the git identity or core.bare of the repo the suite runs from, point the bkit
// config and cache folders at an empty temp folder, and re-read the load-scaled test
// budget as each test file starts (bottom, via vitest.timeout-budget.ts).
//
// `globals` is not enabled in vitest.config.ts, so these are imported, not free.
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, afterEach, expect, vi } from "vitest";

import { guardRepoConfig, repoConfigFile } from "./vitest.repo-config-guard.ts";
import { tierTimeouts } from "./vitest.timeout-budget.ts";

// Strip inherited git environment variables so no test can accidentally operate
// on the real bkit repo.
//
// WHY: when the suite is invoked from inside a git hook (`.husky/pre-push` runs
// both vitest tiers through `bkit:gate:static-unit-integration`), git exports GIT_DIR / GIT_WORK_TREE / GIT_INDEX_FILE /
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

// The strip above covers inherited variables only. A test whose git command still reaches
// the real repo — a cwd or `-C` path outside its temp dir — writes its fixture identity or
// core.bare=true into the checkout's shared `.git/config`. The guard reads user.name /
// user.email / core.bare / core.worktree there before the file runs and after each test
// (and after the file's own hooks), fails the test that changed one, and puts the old
// values back (vitest.repo-config-guard.ts).
const testPath = expect.getState().testPath ?? "";
const testFile = path.relative(process.cwd(), testPath);
const repoConfig = guardRepoConfig(repoConfigFile(process.cwd()));
afterEach(() => {
  repoConfig.check(`${testFile} > ${expect.getState().currentTestName ?? "(unnamed test)"}`);
});
afterAll(() => {
  repoConfig.check(`${testFile} (beforeAll / afterAll hooks)`);
});

// No test asks the npm registry for the newest bkit (`shared/bkit-latest.ts`): a temp
// repo pinned to an old release would otherwise hit the network on every stamp.
// Tests of that lookup clear it with `vi.stubEnv("BKIT_NO_UPDATE_CHECK", "")`.
process.env.BKIT_NO_UPDATE_CHECK = "1";

// No test reads the developer's real Claude Code transcripts: `workflows close` finds the
// running session's subagent transcripts from `CLAUDE_CODE_SESSION_ID` under
// `CLAUDE_CONFIG_DIR` (`commands/workflow/run-facts.ts`). A test of that read sets both.
delete process.env.CLAUDE_CODE_SESSION_ID;
delete process.env.CLAUDE_CONFIG_DIR;

// No test journals into a real run: `runCommand` appends `engine-call` rows to the active
// run's `status.jsonl` found from the cwd, and a test run from this repo's own worktree would
// write into the live run. A test of the journal sets `BKIT_ENGINE_JOURNAL` itself.
process.env.BKIT_ENGINE_JOURNAL = "off";

// No test reads or writes the developer's real bkit config and cache folders: a real
// `~/.config/bkit/disk-prune.mjs` holds delete steps, and any test that mints a worktree
// runs `bkit disk prune`'s low-disk check (`commands/workflow/disk.ts`). Each worker gets
// an empty folder of its own; a test that needs one sets its own.
const xdg = path.join(os.tmpdir(), `bkit-test-xdg-${process.pid}`);
process.env.XDG_CONFIG_HOME = path.join(xdg, "config");
process.env.XDG_CACHE_HOME = path.join(xdg, "cache");

// Budget: re-read once per test file from `vitest.timeout-budget.ts`, scaled by how
// contended the machine is RIGHT NOW.
//
// WHY: both tiers spawn real subprocesses — `git`, `tsx`, the bkit CLI, fake
// binaries — so a budget fixed when the run starts goes stale. The box ramps under
// the run (a parallel agent session, a build), and a file that starts late runs
// several times slower against a number read minutes earlier. That reads as a flaky
// product but is only ever a starved subprocess: `Error: Test timed out in 5000ms`
// on a DIFFERENT test each run, all green in isolation. Both tiers are pre-push gates
// (.husky/pre-push -> bkit:gate:static-unit-integration), so that starvation blocks pushes
// on a green tree, and `--no-verify` is prohibited (.agents/rules.md). See
// docs/failures.jsonl `subprocess-integration-tests-time-out-at-5000ms-under-high-load`.
//
// setupFiles run once per test FILE, so `testPath` here is that file, and the
// re-read lands as each file starts. The config's own `...unitTimeouts()` sampled
// the same budget once at load; this overrides it per file. CI pins the factor to 1
// (in `loadFactor`), so the gate stays strict there.
vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")));

// Every test runs as on a laptop: GitHub Actions sets `GITHUB_ACTIONS` and `CI`, and the
// engine reads those (and the cloud markers) as "headless, nobody to ask"
// (`commands/workflow/runtime.ts`, `checks/before/env.ts`). Left set, a test passes on the
// laptop and fails in CI. Cleared after the budget above has read `CI`. A test of another
// runtime sets its own with `vi.stubEnv`.
for (const key of [
  "BKIT_RUNTIME",
  "CLAUDE_CODE_REMOTE",
  "CURSOR_REMOTE_AGENT",
  "GITHUB_ACTIONS",
  "CI",
]) {
  delete process.env[key];
}
