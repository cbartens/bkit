import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { replayBuild } from "./workflow/branches";
import {
  devMoved,
  devRefRace,
  devRefused,
  landBackoffMs,
  landDir,
  pushToDev,
  withoutHooks,
} from "./land";

vi.mock("../shared/timeouts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../shared/timeouts")>();
  return { TIMEOUTS: { ...actual.TIMEOUTS, LAND_ATTEMPTS: 3, LAND_BACKOFF_START_S: 0 } };
});

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});
const tmp = (tag: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), `bkit-land-${tag}-`)));
  dirs.push(d);
  return d;
};
const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

/** A main checkout on dev pushed to a bare remote. */
function fixture() {
  const remote = tmp("remote");
  const root = tmp("main");
  git(remote, "init", "-q", "--bare", "-b", "dev");
  git(root, "init", "-q", "-b", "dev");
  // The engine's own git calls (the replay's cherry-pick) carry no -c identity.
  git(root, "config", "user.email", "t@t");
  git(root, "config", "user.name", "t");
  fs.writeFileSync(path.join(root, ".gitignore"), ".worktrees/\n");
  fs.writeFileSync(path.join(root, "notes.txt"), "base\n");
  git(root, "add", "-A");
  git(root, "commit", "-qm", "init");
  git(root, "remote", "add", "origin", remote);
  git(root, "push", "-q", "origin", "dev");
  return { root, remote, dir: path.join(root, ".worktrees", "_land-x") };
}

/** Commit `file` = `body` in the throwaway checkout. */
const commitIn = (dir: string, file: string, body: string) => {
  fs.writeFileSync(path.join(dir, file), body);
  git(dir, "add", file);
  git(dir, "commit", "-qm", `land ${file}`);
};

/** Land a foreign commit on the remote's dev, the way a racing session would. */
const race = (remote: string) => {
  const c = tmp("race");
  git(c, "clone", "-q", remote, ".");
  git(c, "commit", "-q", "--allow-empty", "-m", "foreign");
  git(c, "push", "-q", "origin", "HEAD:dev");
};

/** A landing log that records every line and removes `lock` once the fetch race is retried. */
const releaseOnRetry = (log: string[], lock: string) => (line: string) => {
  log.push(line);
  if (line.includes("origin/dev during the fetch")) fs.rmSync(lock, { force: true });
};

/** `fn` on the first call only. */
function once(fn: () => void): () => void {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    fn();
  };
}

describe("landBackoffMs", () => {
  it("doubles from the start wait, caps it, and jitters down by at most half", () => {
    const top = () => 1;
    expect([1, 2, 3, 4, 5, 9].map((n) => landBackoffMs(n, top, 2, 30))).toEqual([
      2000, 4000, 8000, 16000, 30000, 30000,
    ]);
    expect(landBackoffMs(1, () => 0, 2, 30)).toBe(1000);
  });

  it("ten tries wait at most three minutes in all", () => {
    const total = [1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(
      (t, n) => t + landBackoffMs(n, () => 1, 2, 30),
      0,
    );
    expect(total).toBe(180_000);
  });
});

describe("devMoved / devRefused", () => {
  const before = " ! [rejected]        HEAD -> dev (fetch first)\nerror: failed to push some refs";
  const nonFf = " ! [rejected]        HEAD -> dev (non-fast-forward)";
  const during = " ! [remote rejected] HEAD -> dev (incorrect old value provided)";
  const lockRace =
    " ! [remote rejected] HEAD -> dev (cannot lock ref 'refs/heads/dev': is at 1 but expected 2)";
  const hook = " ! [remote rejected] HEAD -> dev (pre-receive hook declined)";
  const ruleset = "remote: error: GH013: Repository rule violations found for refs/heads/dev.";
  const http = "error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403";
  const network = "fatal: unable to access 'https://github.com/o/r.git/': Could not resolve host";

  it("dev moved before or while the push was sent: retry", () => {
    for (const e of [before, nonFf, during, lockRace]) {
      expect(devMoved(e), e).toBe(true);
      expect(devRefused(e), e).toBe(false);
    }
  });
  it("a server refusal (hook, ruleset, HTTP 403): the PR route", () => {
    for (const e of [hook, ruleset, http]) {
      expect(devMoved(e), e).toBe(false);
      expect(devRefused(e), e).toBe(true);
    }
  });
  it("no server answer: neither", () => {
    expect(devMoved(network)).toBe(false);
    expect(devRefused(network)).toBe(false);
  });
});

describe("devRefRace", () => {
  it("another fetch moved or holds origin/dev: retry", () => {
    const moved =
      "error: cannot lock ref 'refs/remotes/origin/dev': is at d849eac but expected 49576d1";
    const held =
      "error: cannot lock ref 'refs/remotes/origin/dev': Unable to create '/r/.git/refs/remotes/origin/dev.lock': File exists.";
    for (const e of [moved, held]) expect(devRefRace(e), e).toBe(true);
  });
  it("any other fetch failure, or another ref: not a race", () => {
    const network = "fatal: unable to access 'https://github.com/o/r.git/': Could not resolve host";
    const other = "error: cannot lock ref 'refs/remotes/origin/main': is at 1 but expected 2";
    for (const e of [network, other]) expect(devRefRace(e), e).toBe(false);
  });
});

describe("landDir", () => {
  it("names the throwaway beside the feature worktrees", () => {
    expect(landDir("/r", "639-land")).toBe(path.join("/r", ".worktrees", "_land-639-land"));
  });
  it.each(["../x", "a/b", "", ".hidden", "a..b"])("refuses %j as a feature id", (fid) => {
    expect(() => landDir("/r", fid)).toThrow("is not a feature id");
  });
});

describe("withoutHooks", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("points core.hooksPath nowhere for the call, then restores the environment", async () => {
    vi.stubEnv("GIT_CONFIG_COUNT", "1");
    vi.stubEnv("GIT_CONFIG_KEY_0", "user.name");
    vi.stubEnv("GIT_CONFIG_VALUE_0", "kept");
    const seen = await withoutHooks(() => ({
      count: process.env.GIT_CONFIG_COUNT,
      key: process.env.GIT_CONFIG_KEY_1,
      kept: process.env.GIT_CONFIG_KEY_0,
    }));
    expect(seen).toEqual({ count: "2", key: "core.hooksPath", kept: "user.name" });
    expect(process.env.GIT_CONFIG_COUNT).toBe("1");
    expect(process.env.GIT_CONFIG_KEY_1).toBeUndefined();
    expect(process.env.GIT_CONFIG_VALUE_1).toBeUndefined();
  });
});

describe("pushToDev", () => {
  it("lands the commit on origin/dev and leaves the main checkout alone", async () => {
    const { root, remote, dir } = fixture();
    git(root, "checkout", "-q", "-b", "other");
    fs.writeFileSync(path.join(root, "notes.txt"), "edited\n");
    fs.writeFileSync(path.join(root, "staged.txt"), "staged\n");
    git(root, "add", "staged.txt");
    const res = await pushToDev({
      root,
      dir,
      build: (d) => commitIn(d, "row.txt", "row\n"),
      log: () => {},
    });
    expect(res).toEqual({ kind: "landed", attempts: 1, sha: git(remote, "rev-parse", "dev") });
    expect(git(remote, "show", "dev:row.txt")).toBe("row");
    expect(git(root, "branch", "--show-current")).toBe("other");
    expect(git(root, "status", "--porcelain")).toBe("M notes.txt\nA  staged.txt");
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("never pushes local dev commits missing from origin/dev", async () => {
    const { root, remote, dir } = fixture();
    git(root, "commit", "-q", "--allow-empty", "-m", "wip");
    const res = await pushToDev({
      root,
      dir,
      build: (d) => commitIn(d, "row.txt", "row\n"),
      log: () => {},
    });
    expect(res.kind).toBe("landed");
    expect(git(remote, "log", "--format=%s", "dev")).not.toContain("wip");
    expect(git(root, "log", "-1", "--format=%s", "dev")).toBe("wip");
  });

  it("dev moved: rebuilds on the new dev and pushes again", async () => {
    const { root, remote, dir } = fixture();
    const log: string[] = [];
    const raceFirst = once(() => race(remote));
    const res = await pushToDev({
      root,
      dir,
      build: (d) => {
        commitIn(d, "row.txt", "row\n");
        raceFirst();
      },
      log: (l) => log.push(l),
    });
    expect(res).toMatchObject({ kind: "landed", attempts: 2 });
    expect(git(remote, "log", "-2", "--format=%s", "dev")).toBe("land row.txt\nforeign");
    expect(log.join("\n")).toContain("dev moved before push 1 of 3");
  });

  it("dev moved before every push: exhausted, nothing landed", async () => {
    const { root, remote, dir } = fixture();
    const res = await pushToDev({
      root,
      dir,
      build: (d) => {
        commitIn(d, "row.txt", "row\n");
        race(remote);
      },
      log: () => {},
    });
    expect(res).toEqual({ kind: "exhausted", attempts: 3 });
    expect(git(remote, "log", "--format=%s", "dev")).not.toContain("land row.txt");
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("any other refusal is returned, not retried", async () => {
    const { root, remote, dir } = fixture();
    fs.writeFileSync(
      path.join(remote, "hooks", "pre-receive"),
      '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
      { mode: 0o755 },
    );
    let builds = 0;
    const seen: string[] = [];
    const res = await pushToDev({
      root,
      dir,
      build: (d) => {
        builds++;
        commitIn(d, "row.txt", "row\n");
      },
      refused: async (d, stderr) => {
        seen.push(git(d, "log", "-1", "--format=%s"), stderr);
      },
      log: () => {},
    });
    expect(res).toEqual({ kind: "refused", stderr: expect.stringContaining("dev is protected") });
    expect(builds).toBe(1);
    expect(seen).toEqual(["land row.txt", expect.stringContaining("dev is protected")]);
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("pushToDev replays a commit range onto origin/dev", async () => {
    const { root, remote, dir } = fixture();
    // Local dev holds a foreign commit, then two commits of a run.
    git(root, "commit", "-q", "--allow-empty", "-m", "foreign wip");
    fs.writeFileSync(path.join(root, "one.txt"), "1\n");
    git(root, "add", "one.txt");
    git(root, "commit", "-qm", "run one");
    const one = git(root, "rev-parse", "HEAD");
    fs.writeFileSync(path.join(root, "two.txt"), "2\n");
    git(root, "add", "two.txt");
    git(root, "commit", "-qm", "run two");
    const two = git(root, "rev-parse", "HEAD");
    const res = await pushToDev({ root, dir, build: replayBuild([one, two]), log: () => {} });
    expect(res).toEqual({ kind: "landed", attempts: 1, sha: git(remote, "rev-parse", "dev") });
    expect(git(remote, "log", "--format=%s", "dev")).toBe("run two\nrun one\ninit");
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("a replay retries on the new dev when dev moved", async () => {
    const { root, remote, dir } = fixture();
    fs.writeFileSync(path.join(root, "one.txt"), "1\n");
    git(root, "add", "one.txt");
    git(root, "commit", "-qm", "run one");
    const one = git(root, "rev-parse", "HEAD");
    const replay = replayBuild([one]);
    const raceFirst = once(() => race(remote));
    const res = await pushToDev({
      root,
      dir,
      build: (d) => {
        replay(d);
        raceFirst();
      },
      log: () => {},
    });
    expect(res).toMatchObject({ kind: "landed", attempts: 2 });
    expect(git(remote, "log", "-2", "--format=%s", "dev")).toBe("run one\nforeign");
  });

  it("pushToDev log line names what it lands", async () => {
    const { root, dir } = fixture();
    const log: string[] = [];
    await pushToDev({
      root,
      dir,
      build: (d) => commitIn(d, "row.txt", "row\n"),
      log: (l) => log.push(l),
    });
    const line = log.find((l) => l.startsWith("git hooks skipped"));
    expect(line).toContain("it lands bookkeeping, or the commits a debug run on dev made");
    expect(log.join("\n")).not.toContain("bookkeeping only");
  });

  it("runs no git hooks in the throwaway checkout, and says so", async () => {
    const { root, remote, dir } = fixture();
    const hooks = path.join(root, ".git", "hooks");
    for (const h of ["pre-commit", "pre-push"])
      fs.writeFileSync(path.join(hooks, h), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    const log: string[] = [];
    const res = await pushToDev({
      root,
      dir,
      build: (d) => commitIn(d, "row.txt", "row\n"),
      log: (l) => log.push(l),
    });
    expect(res.kind).toBe("landed");
    expect(git(remote, "show", "dev:row.txt")).toBe("row");
    expect(log.join("\n")).toContain("git hooks skipped in the throwaway dev checkout");
  });

  it("removes a locked throwaway a killed landing left behind, then lands", async () => {
    const { root, remote, dir } = fixture();
    git(root, "worktree", "add", "--lock", "--detach", dir, "HEAD");
    fs.writeFileSync(path.join(dir, "stray.txt"), "left\n");
    const res = await pushToDev({
      root,
      dir,
      build: (d) => {
        expect(fs.existsSync(path.join(d, "stray.txt"))).toBe(false);
        commitIn(d, "row.txt", "row\n");
      },
      log: () => {},
    });
    expect(res.kind).toBe("landed");
    expect(git(remote, "show", "dev:row.txt")).toBe("row");
    expect(fs.existsSync(dir)).toBe(false);
    expect(git(root, "worktree", "list", "--porcelain")).not.toContain("_land-x");
  });

  it("a push that fails without a server answer is returned once, never retried", async () => {
    const { root, dir } = fixture();
    git(root, "remote", "set-url", "--push", "origin", path.join(root, "no-such-remote"));
    let builds = 0;
    const res = await pushToDev({
      root,
      dir,
      build: (d) => {
        builds++;
        commitIn(d, "row.txt", "row\n");
      },
      log: () => {},
    });
    expect(res.kind).toBe("push-failed");
    expect(builds).toBe(1);
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("a failed fetch is returned before anything is built", async () => {
    const { root, remote, dir } = fixture();
    fs.rmSync(remote, { recursive: true, force: true });
    const res = await pushToDev({
      root,
      dir,
      build: () => {
        throw new Error("built");
      },
      log: () => {},
    });
    expect(res.kind).toBe("fetch-failed");
  });

  it("a fetch that loses the origin/dev ref race retries and lands", async () => {
    const { root, remote, dir } = fixture();
    race(remote);
    // Another landing's fetch holds refs/remotes/origin/dev while this one's runs.
    const lock = path.join(root, ".git", "refs", "remotes", "origin", "dev.lock");
    fs.writeFileSync(lock, "");
    const log: string[] = [];
    const res = await pushToDev({
      root,
      dir,
      build: (d) => commitIn(d, "row.txt", "row\n"),
      log: releaseOnRetry(log, lock),
    });
    expect(res).toMatchObject({ kind: "landed", attempts: 2 });
    expect(git(remote, "log", "-2", "--format=%s", "dev")).toBe("land row.txt\nforeign");
    expect(log.join("\n")).toContain("another git process updated origin/dev during the fetch");
  });

  it("a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed", async () => {
    const { root, remote, dir } = fixture();
    race(remote);
    fs.writeFileSync(path.join(root, ".git", "refs", "remotes", "origin", "dev.lock"), "");
    let builds = 0;
    const res = await pushToDev({
      root,
      dir,
      build: () => {
        builds++;
      },
      log: () => {},
    });
    expect(res).toMatchObject({
      kind: "fetch-failed",
      stderr: expect.stringContaining("cannot lock ref"),
    });
    expect(builds).toBe(0);
  });

  it("lands from a clone whose fetch refspec omits dev", async () => {
    const { root, remote, dir } = fixture();
    git(root, "config", "remote.origin.fetch", "+refs/heads/main:refs/remotes/origin/main");
    race(remote);
    const res = await pushToDev({
      root,
      dir,
      build: (d) => commitIn(d, "row.txt", "row\n"),
      log: () => {},
    });
    expect(res).toMatchObject({ kind: "landed", attempts: 1 });
    expect(git(remote, "log", "-2", "--format=%s", "dev")).toBe("land row.txt\nforeign");
  });

  it("build throwing stops the landing and removes the throwaway checkout", async () => {
    const { root, remote, dir } = fixture();
    const before = git(remote, "rev-parse", "dev");
    await expect(
      pushToDev({
        root,
        dir,
        build: () => {
          throw new Error("refused by the build");
        },
        log: () => {},
      }),
    ).rejects.toThrow("refused by the build");
    expect(git(remote, "rev-parse", "dev")).toBe(before);
    expect(fs.existsSync(dir)).toBe(false);
  });
});
