/**
 * bkit-ledgers-parity.test.ts — `bkit ledgers` does what `bkit-book-commit.sh`
 * does, while both exist.
 *
 * Each scenario builds one fixture repo, copies it, runs the script on one copy
 * and the command on the other, then compares the exit code, what landed in the
 * new commit, and what is left staged. Retire with the script.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { runCommand } from "./commands/lib";
import { ledgersCommand } from "./commands/workflow/ledgers";

const SCRIPT = path.resolve(__dirname, "../templates/.bkit/scripts/bkit-book-commit.sh");
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledgers-parity-")));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();
const put = (root: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.appendFileSync(path.join(root, rel), body);
};
const commitAll = (root: string, msg = "init") => {
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", msg);
};

/** Scenario: build the fixture in `r`, then the flags both sides run with ({root} substituted). */
interface Scenario {
  build(r: string): void;
  args: string[];
}

const SCENARIOS: Record<string, Scenario> = {
  "modified FID ledger, core commit": {
    build: (r) => {
      put(r, "docs/plans/202608/logs/1-a/status.jsonl", '{"a":1}\n');
      commitAll(r);
      put(r, "docs/plans/202608/logs/1-a/status.jsonl", '{"a":2}\n');
    },
    args: ["--month=202608", "--fid=1-a", "--scope=core", "--mode=commit", "--message=m"],
  },
  "skill deletion, full commit": {
    build: (r) => {
      put(r, ".claude/skills/foo.md", "x\n");
      put(r, "docs/plans/202608/logs/1-a/status.jsonl", "{}\n");
      commitAll(r);
      fs.rmSync(path.join(r, ".claude/skills/foo.md"));
    },
    args: ["--month=202608", "--fid=1-a", "--scope=full", "--mode=commit", "--message=m"],
  },
  "nothing changed": {
    build: (r) => {
      put(r, "docs/plans/202608/logs/1-a/status.jsonl", "{}\n");
      commitAll(r);
    },
    args: ["--month=202608", "--fid=1-a", "--scope=core", "--mode=commit", "--message=m"],
  },
  "empty pathspec with something staged": {
    build: (r) => {
      put(r, "README.md", "x\n");
      commitAll(r);
      put(r, "unrelated.txt", "x\n");
      git(r, "add", "unrelated.txt");
    },
    args: ["--month=202608", "--fid=nope", "--scope=core", "--mode=commit", "--message=m"],
  },
  "stage mode with tracked updates": {
    build: (r) => {
      put(r, "docs/plans/202608/logs/1-a/status.jsonl", "{}\n");
      put(r, "src.ts", "a\n");
      commitAll(r);
      put(r, "src.ts", "b\n");
      put(r, ".bkit/new.jsonl", "{}\n");
    },
    args: [
      "--month=202608",
      "--fid=1-a",
      "--scope=full",
      "--mode=stage",
      "--stage-tracked-updates",
    ],
  },
  "pr scope picks up top-level docs only": {
    build: (r) => {
      put(r, "docs/architecture.md", "a\n");
      put(r, "docs/templates/t.md", "a\n");
      put(r, "docs/plans/202610/other-plan.md", "a\n");
      commitAll(r);
      put(r, "docs/architecture.md", "b\n");
      put(r, "docs/templates/t.md", "b\n");
      put(r, "docs/plans/202610/other-plan.md", "b\n");
    },
    args: ["--month=202610", "--fid=1-a", "--scope=pr", "--mode=commit", "--message=m"],
  },
  "squash close with another staged file": {
    build: (r) => {
      put(r, "docs/plans/202610/logs/1-a/status.jsonl", "{}\n");
      put(r, "docs/plans/202610/gone.md", "old\n");
      git(r, "checkout", "-q", "-b", "dev");
      commitAll(r);
      git(r, "checkout", "-q", "-b", "feat/1-a");
      put(r, "docs/plans/202610/1-a-plan.md", "plan\n");
      git(r, "rm", "-q", "docs/plans/202610/gone.md");
      commitAll(r, "feat");
      git(r, "checkout", "-q", "dev");
      put(r, "docs/plans/202610/OTHER.md", "x\n");
      git(r, "add", "docs/plans/202610/OTHER.md");
      git(r, "merge", "-q", "--squash", "feat/1-a");
      put(r, "docs/plans/202610/logs/1-a/status.jsonl", '{"close":1}\n');
    },
    args: [
      "--month=202610",
      "--fid=1-a",
      "--scope=core",
      "--mode=commit-allow-empty",
      "--squash-of=feat/1-a",
      "--message=m",
    ],
  },
};

function fixture(name: string, scenario: Scenario): [string, string] {
  const base = path.join(dir, name.replace(/\W+/g, "-"));
  const a = path.join(base, "shell");
  fs.mkdirSync(a, { recursive: true });
  git(a, "init", "-q", "-b", "main");
  git(a, "config", "user.email", "t@t.t");
  git(a, "config", "user.name", "t");
  scenario.build(a);
  const b = path.join(base, "command");
  fs.cpSync(a, b, { recursive: true });
  return [a, b];
}

/** What a run left behind: the new commit's paths and the index's staged paths. */
const outcome = (r: string, before: string) => ({
  committed:
    git(r, "rev-parse", "HEAD") === before
      ? ""
      : git(r, "show", "--name-status", "--format=", "HEAD"),
  staged: git(r, "diff", "--cached", "--name-status"),
});

async function command(argv: string[], cwd: string) {
  return (await runCommand(["ledgers", ...argv], [ledgersCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: () => undefined, stderr: () => undefined },
  }))!;
}

describe("bkit-book-commit.sh = bkit ledgers commit", () => {
  it.each(Object.keys(SCENARIOS))("%s", async (name) => {
    const scenario = SCENARIOS[name]!;
    const [a, b] = fixture(name, scenario);
    const beforeA = git(a, "rev-parse", "HEAD");
    const beforeB = git(b, "rev-parse", "HEAD");
    const sh = spawnSync("bash", [SCRIPT, `--root=${a}`, ...scenario.args], { encoding: "utf-8" });
    const code = await command(["commit", `--root=${b}`, ...scenario.args], b);
    expect(code, sh.stderr).toBe(sh.status);
    expect(outcome(b, beforeB)).toEqual(outcome(a, beforeA));
  });
});

describe("union-ledgers = bkit ledgers union", () => {
  it("appends the same rows and skips .bkit/issues.jsonl", async () => {
    const base = path.join(dir, "union");
    const src = path.join(base, "src");
    fs.mkdirSync(src, { recursive: true });
    git(src, "init", "-q");
    put(src, "docs/plans/202608/logs/1-a/status.jsonl", '{"r":1}\n{"r":2}\n{"r":2}\n');
    put(src, ".bkit/issues.jsonl", '{"s":"SHIPPED"}\n');
    put(src, "docs/deferrals.jsonl", '{"d":1}\n');
    commitAll(src);
    const seed = (dst: string) => {
      put(dst, "docs/plans/202608/logs/1-a/status.jsonl", '{"r":1}\n');
      put(dst, ".bkit/issues.jsonl", '{"s":"BUILT"}\n');
    };
    const [a, b] = [path.join(base, "dst-shell"), path.join(base, "dst-command")];
    seed(a);
    seed(b);
    const sh = spawnSync("bash", [SCRIPT, "union-ledgers", `--src=${src}`, `--dst=${a}`], {
      encoding: "utf-8",
    });
    const code = await command(["union", `--src=${src}`, `--dst=${b}`], base);
    expect(code).toBe(sh.status);
    for (const rel of [
      "docs/plans/202608/logs/1-a/status.jsonl",
      ".bkit/issues.jsonl",
      "docs/deferrals.jsonl",
    ]) {
      expect(fs.readFileSync(path.join(b, rel), "utf-8"), rel).toBe(
        fs.readFileSync(path.join(a, rel), "utf-8"),
      );
    }
  });
});

describe("only-bookkeeping = bkit ledgers only-bookkeeping", () => {
  const r = path.join(dir, "only");
  fs.mkdirSync(r, { recursive: true });
  git(r, "init", "-q");
  put(r, "src/a.ts", "a\n");
  put(r, "docs/architecture.md", "a\n");
  commitAll(r);
  const c0 = git(r, "rev-parse", "HEAD");
  put(r, "docs/architecture.md", "b\n");
  put(r, "docs/plans/202610/logs/1-a/summary.md", "s\n");
  commitAll(r, "book");
  const c1 = git(r, "rev-parse", "HEAD");
  put(r, "src/a.ts", "b\n");
  commitAll(r, "code");
  const c2 = git(r, "rev-parse", "HEAD");

  it.each([
    ["bookkeeping only", c0, c1],
    ["code in range", c0, c2],
    ["not an ancestor", c2, c0],
    ["unknown commit", "deadbeef", c1],
  ])("%s", async (_, from, to) => {
    const flags = [`--root=${r}`, "--month=202610", "--fid=1-a", `--from=${from}`, `--to=${to}`];
    const sh = spawnSync("bash", [SCRIPT, "only-bookkeeping", ...flags], { encoding: "utf-8" });
    expect(await command(["only-bookkeeping", ...flags], r)).toBe(sh.status);
  });
});
