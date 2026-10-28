// audits/repo/bats-setup-suite.integration.test.ts — tests/setup_suite.bash, which bats runs
// around every `bats tests/*.bats` run, keeps the shell tier off the repo it runs from.
//
// The pre-push hook runs the bats tier. From a linked worktree it exports
// GIT_DIR=<main>/.git/worktrees/<name>, which beats a test's `-C` and cwd, so
// `git -C "$tmp" init -q` rewrites the main checkout's shared config with core.bare=true.
// Each probe runs the real setup_suite.bash with that GIT_DIR against a throwaway checkout.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const ROOT = process.cwd();
const BATS = path.join(ROOT, "node_modules", ".bin", "bats");
const SETUP_SUITE = path.join(ROOT, "tests", "setup_suite.bash");

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function git(cwd: string, ...args: string[]): void {
  const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
  expect(res.status, `git ${args.join(" ")}: ${res.stderr}`).toBe(0);
}

function configValue(file: string, key: string): string | null {
  const res = spawnSync("git", ["config", "--file", file, "--get", key], { encoding: "utf-8" });
  return res.status === 0 ? res.stdout.trim() : null;
}

interface Run {
  status: number | null;
  output: string;
  config: string;
}

// A main checkout with a linked worktree; the probe test runs from the worktree with the
// GIT_DIR its pre-push hook would export. `suite` false runs the probe without setup_suite.bash.
function runProbe(body: string, suite = true): Run {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-bats-suite-")));
  temps.push(tmp);
  const main = path.join(tmp, "main");
  const worktree = path.join(main, ".worktrees", "feat");
  git(tmp, "init", "-q", "-b", "dev", main);
  git(
    main,
    "-c",
    "user.email=a@b",
    "-c",
    "user.name=a",
    "commit",
    "-q",
    "--allow-empty",
    "-m",
    "i",
  );
  git(main, "worktree", "add", "-q", "-b", "feat", worktree, "dev");
  const probe = path.join(tmp, "probe.bats");
  fs.writeFileSync(probe, `@test "probe" {\n  ${body}\n}\n`);
  const args = suite ? ["--setup-suite-file", SETUP_SUITE, probe] : [probe];
  const res = spawnSync(BATS, args, {
    cwd: worktree,
    encoding: "utf-8",
    env: { ...process.env, GIT_DIR: path.join(main, ".git", "worktrees", "feat") },
  });
  return {
    status: res.status,
    output: `${res.stdout}${res.stderr}`,
    config: path.join(main, ".git", "config"),
  };
}

describe("tests/setup_suite.bash", () => {
  it("CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare", () => {
    const run = runProbe('git -C "$BATS_TEST_TMPDIR" init -q', false);
    expect(run.status, run.output).toBe(0);
    expect(configValue(run.config, "core.bare")).toBe("true");
  });

  it("clears every GIT_* variable, so the same init stays in the temp dir", () => {
    const run = runProbe('git -C "$BATS_TEST_TMPDIR" init -q');
    expect(run.status, run.output).toBe(0);
    expect(configValue(run.config, "core.bare")).toBe("false");
  });

  it("fails the run when a test writes an identity into the checkout, and removes it", () => {
    const run = runProbe("git config user.email t@t.t && git config user.name t");
    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/teardown_suite/);
    expect(run.output).toMatch(/user\.email t@t\.t/);
    expect(configValue(run.config, "user.email")).toBeNull();
    expect(configValue(run.config, "user.name")).toBeNull();
    expect(configValue(run.config, "core.bare")).toBe("false");
  });

  it("fails the run when a test sets core.bare in the checkout, and puts it back", () => {
    const run = runProbe("git config core.bare true");
    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/core\.bare true/);
    expect(configValue(run.config, "core.bare")).toBe("false");
  });
});
