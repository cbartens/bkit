// vitest.repo-config-guard.ts — catches a test that changes the git identity or layout of the
// repo the suite runs from. vitest.setup.ts guards that repo around every test.
//
// A git command in a test that resolves to the real repo instead of its temp repo (an inherited
// GIT_DIR, or a cwd / `-C` path outside the temp dir) writes the fixture identity and
// core.bare=true into the checkout's shared `.git/config`: every later commit there is authored
// by the fixture, and every working-tree command fails. The guard reads the keys below before a
// test and after it; a change fails that test, names the keys, and puts the old values back.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const GUARDED_KEYS = ["user.name", "user.email", "core.bare", "core.worktree"];

const KEYS_PATTERN = `^(${GUARDED_KEYS.map((k) => k.replace(".", "\\.")).join("|")})$`;

type Values = Map<string, string>;

// git with no inherited GIT_* variable, so it answers for the path it is given.
function git(args: string[], cwd?: string) {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
  );
  return spawnSync("git", args, { cwd, env, encoding: "utf-8" });
}

/** The shared config file of the repo at `cwd` (its common git dir), or undefined outside a repo. */
export function repoConfigFile(cwd: string): string | undefined {
  const res = git(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd);
  if (res.status !== 0) return undefined;
  return path.join(res.stdout.trim(), "config");
}

function readValues(file: string): Values {
  const res = git(["config", "--file", file, "--get-regexp", KEYS_PATTERN]);
  const values: Values = new Map();
  for (const line of res.stdout.split("\n")) {
    const space = line.indexOf(" ");
    if (space > 0) values.set(line.slice(0, space), line.slice(space + 1));
  }
  return values;
}

function stamp(file: string): string {
  const st = fs.statSync(file, { throwIfNoEntry: false });
  return st ? `${st.ino}:${st.size}:${st.mtimeMs}` : "";
}

const shown = (value: string | undefined) => value ?? "(unset)";

export interface RepoConfigGuard {
  /** Throws when a guarded key changed since the last check; `where` names the test. */
  check(where: string): void;
}

export function guardRepoConfig(file: string | undefined): RepoConfigGuard {
  if (file === undefined) return { check: () => {} };
  const before = readValues(file);
  let seen = stamp(file);
  return {
    check(where) {
      const now = stamp(file);
      if (now === seen) return;
      const after = readValues(file);
      const changed = GUARDED_KEYS.filter((key) => before.get(key) !== after.get(key));
      if (changed.length === 0) {
        seen = now;
        return;
      }
      for (const key of changed) {
        const value = before.get(key);
        git(
          value === undefined
            ? ["config", "--file", file, "--unset-all", key]
            : ["config", "--file", file, "--replace-all", key, value],
        );
      }
      seen = stamp(file);
      const lines = changed.map((k) => `  ${k}: ${shown(before.get(k))} -> ${shown(after.get(k))}`);
      throw new Error(
        [
          `The git config of the repo these tests run from (${file}) changed while "${where}" ran:`,
          ...lines,
          "The old values are back. A git command in a test reached this repo instead of its temp repo:",
          "an inherited GIT_DIR, or a cwd or -C path outside the temp dir. Another test file running",
          "at the same time can also be the writer; rerun with --no-file-parallelism to pin it down.",
        ].join("\n"),
      );
    },
  };
}
