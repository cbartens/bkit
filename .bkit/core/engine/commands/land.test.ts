import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { landBackoffMs, pushToDev } from "./land";

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
