// audits/repo/vitest-repo-config-guard.test.ts — the repo-config guard vitest.setup.ts runs
// after every test: a test that changes user.name / user.email / core.bare / core.worktree in
// the repo the suite runs from fails, and the old values are put back.
//
// The leak is reproduced as it happens in a push from a linked worktree: the pre-push hook
// exports GIT_DIR=<main>/.git/worktrees/<name>, which beats a child's cwd and `-C`, so a temp
// repo's `git init` rewrites the main checkout's shared config with core.bare=true and its
// `git config user.email` lands there too.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { guardRepoConfig, repoConfigFile } from "../../../../../vitest.repo-config-guard";

const ROOT = process.cwd();
const temps: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function git(cwd: string, args: string[], env: NodeJS.ProcessEnv = process.env): string {
  const res = spawnSync("git", args, { cwd, env, encoding: "utf-8" });
  expect(res.status, `git ${args.join(" ")}: ${res.stderr}`).toBe(0);
  return res.stdout.trim();
}

function configValue(file: string, key: string): string | null {
  const res = spawnSync("git", ["config", "--file", file, "--get", key], { encoding: "utf-8" });
  return res.status === 0 ? res.stdout.trim() : null;
}

interface Checkout {
  main: string;
  worktree: string;
  worktreeGitDir: string;
  config: string;
  elsewhere: string;
}

// A main checkout with one linked worktree, as a workflow run has, plus a plain temp dir.
function checkout(): Checkout {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-config-guard-")));
  temps.push(tmp);
  const main = path.join(tmp, "main");
  const worktree = path.join(main, ".worktrees", "feat");
  const elsewhere = path.join(tmp, "elsewhere");
  fs.mkdirSync(elsewhere);
  git(tmp, ["init", "-q", "-b", "dev", main]);
  git(main, [
    "-c",
    "user.email=a@b",
    "-c",
    "user.name=a",
    "commit",
    "-q",
    "--allow-empty",
    "-m",
    "i",
  ]);
  git(main, ["worktree", "add", "-q", "-b", "feat", worktree, "dev"]);
  return {
    main,
    worktree,
    worktreeGitDir: path.join(main, ".git", "worktrees", "feat"),
    config: path.join(main, ".git", "config"),
    elsewhere,
  };
}

// What a pre-push hook run from a linked worktree hands every process it starts.
const hookEnv = (c: Checkout): NodeJS.ProcessEnv => ({ ...process.env, GIT_DIR: c.worktreeGitDir });

describe("repoConfigFile", () => {
  it("names the main checkout's shared config from a linked worktree", () => {
    const c = checkout();
    expect(repoConfigFile(c.worktree)).toBe(c.config);
  });

  it("answers for the cwd, not an inherited GIT_DIR", () => {
    const c = checkout();
    const other = checkout();
    vi.stubEnv("GIT_DIR", other.worktreeGitDir);
    expect(repoConfigFile(c.worktree)).toBe(c.config);
  });

  it("is undefined outside a repo", () => {
    expect(repoConfigFile(checkout().elsewhere)).toBeUndefined();
  });
});

describe("guardRepoConfig", () => {
  it("passes when nothing changed", () => {
    const c = checkout();
    const guard = guardRepoConfig(c.config);
    expect(() => guard.check("a.test.ts > reads only")).not.toThrow();
  });

  it("passes when only another key changed, such as a branch's upstream", () => {
    const c = checkout();
    const guard = guardRepoConfig(c.config);
    git(c.main, ["config", "branch.dev.remote", "origin"]);
    expect(() => guard.check("a.test.ts > sets an upstream")).not.toThrow();
  });

  it("fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back", () => {
    const c = checkout();
    const guard = guardRepoConfig(c.config);
    git(c.elsewhere, ["-C", c.elsewhere, "init", "-q"], hookEnv(c));
    expect(configValue(c.config, "core.bare")).toBe("true");
    expect(() => guard.check("probe.test.ts > inits a temp repo")).toThrow(
      /probe\.test\.ts > inits a temp repo[\s\S]*core\.bare: false -> true/,
    );
    expect(configValue(c.config, "core.bare")).toBe("false");
  });

  it("fails a fixture identity written through a leaked GIT_DIR, and removes it", () => {
    const c = checkout();
    const guard = guardRepoConfig(c.config);
    git(c.elsewhere, ["config", "user.email", "t@t.t"], hookEnv(c));
    git(c.elsewhere, ["config", "user.name", "t"], hookEnv(c));
    expect(() => guard.check("probe.test.ts > sets an identity")).toThrow(
      /user\.name: \(unset\) -> t\n[\s\S]*user\.email: \(unset\) -> t@t\.t/,
    );
    expect(configValue(c.config, "user.email")).toBeNull();
    expect(configValue(c.config, "user.name")).toBeNull();
  });

  it("fails a write from a test whose cwd is the checkout itself, and restores the old identity", () => {
    const c = checkout();
    git(c.main, ["config", "user.email", "me@example.com"]);
    const guard = guardRepoConfig(c.config);
    git(c.worktree, ["config", "user.email", "t@t"]);
    expect(() => guard.check("probe.test.ts > runs git with no cwd")).toThrow(
      /user\.email: me@example\.com -> t@t/,
    );
    expect(configValue(c.config, "user.email")).toBe("me@example.com");
  });

  it("checks nothing when the suite runs outside a repo", () => {
    expect(() => guardRepoConfig(undefined).check("a.test.ts > anything")).not.toThrow();
  });
});

describe("vitest.setup.ts runs the guard around every test", () => {
  const setup = fs
    .readFileSync(path.join(ROOT, "vitest.setup.ts"), "utf-8")
    .replace(/^\s*\/\/.*$/gm, "");

  it("imports the guard", () => {
    expect(setup).toMatch(
      /import \{ guardRepoConfig, repoConfigFile \} from "\.\/vitest\.repo-config-guard\.ts"/,
    );
  });

  it("guards the repo the suite runs from", () => {
    expect(setup).toMatch(/guardRepoConfig\(repoConfigFile\(process\.cwd\(\)\)\)/);
  });

  it("checks after each test and after the file's own hooks", () => {
    expect(setup).toMatch(/afterEach\(\(\) => \{\s*repoConfig\.check\(/);
    expect(setup).toMatch(/afterAll\(\(\) => \{\s*repoConfig\.check\(/);
  });
});
