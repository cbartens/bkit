import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { repoCommand, resolveBkitBinary, splitSlug } from "./repo";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

/** A repo on feat/1-x with one commit; a fake `gh` that answers `repo view` with FAKE_GH_REPO, or fails. */
let cwd: string;
beforeEach(() => {
  cwd = tmp("bkit-repo-");
  git(cwd, "init", "-q", "-b", "feat/1-x");
  git(cwd, "commit", "-q", "--allow-empty", "-m", "base");
  const bin = tmp("bkit-repo-bin-");
  fs.writeFileSync(
    path.join(bin, "gh"),
    '#!/bin/sh\nif [ "$1 $2" = "repo view" ] && [ -n "$FAKE_GH_REPO" ]; then echo "$FAKE_GH_REPO"; exit 0; fi\nif [ "$1" = "api" ]; then\n  if [ -n "$FAKE_GH_API_FAIL" ]; then echo "gh: api failed" >&2; exit "$FAKE_GH_API_FAIL"; fi\n  echo \'{"enabled":true,"allowed_actions":"all"}\'; exit 0\nfi\necho "gh: not authed" >&2; exit 1\n',
    { mode: 0o755 },
  );
  vi.stubEnv("FAKE_GH_REPO", "");
  vi.stubEnv("FAKE_GH_API_FAIL", "");
  vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["repo", "info", ...argv], [repoCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

describe("splitSlug", () => {
  it.each([
    ["cbartens/bkit", { owner: "cbartens", repo: "bkit" }],
    [" o/r\n", { owner: "o", repo: "r" }],
    ["o/", null],
    ["/r", null],
    ["o/r/x", null],
    ["", null],
  ])("%j -> %j", (slug, expected) => {
    expect(splitSlug(slug)).toEqual(expected);
  });
});

describe("resolveBkitBinary", () => {
  it("prefers the repo-pinned binary over anything on PATH", () => {
    const root = tmp("bkit-root-");
    const pinned = path.join(root, "node_modules", ".bin");
    fs.mkdirSync(pinned, { recursive: true });
    fs.writeFileSync(path.join(pinned, "bkit"), "", { mode: 0o755 });
    const onPath = tmp("bkit-path-");
    fs.writeFileSync(path.join(onPath, "bkit"), "", { mode: 0o755 });
    vi.stubEnv("PATH", onPath);
    expect(resolveBkitBinary(root)).toBe(path.join(pinned, "bkit"));
  });

  it("falls back to `bkit` on PATH when the repo has no pinned binary", () => {
    const root = tmp("bkit-root-");
    const onPath = tmp("bkit-path-");
    const bin = path.join(onPath, "bkit");
    fs.writeFileSync(bin, "", { mode: 0o755 });
    vi.stubEnv("PATH", onPath);
    expect(resolveBkitBinary(root)).toBe(bin);
  });

  it("names the pinned location when neither exists", () => {
    const root = tmp("bkit-root-");
    vi.stubEnv("PATH", tmp("bkit-path-"));
    expect(resolveBkitBinary(root)).toBe(path.join(root, "node_modules", ".bin", "bkit"));
  });
});

describe("bkit repo info", () => {
  it("takes owner/repo from gh when it answers", async () => {
    vi.stubEnv("FAKE_GH_REPO", "cbartens/bkit");
    git(cwd, "remote", "add", "origin", "git@github.com:someone/else.git");
    const r = await run([]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      ownerRepo: "cbartens/bkit",
      owner: "cbartens",
      repo: "bkit",
      source: "gh",
      branch: "feat/1-x",
    });
  });

  it.each([
    ["https://github.com/o/r.git"],
    ["git@github.com:o/r.git"],
    ["https://github.com/o/r"],
    ["http://local_proxy@127.0.0.1:18080/git/o/r"],
  ])("parses the origin remote when gh is unavailable: %s", async (url) => {
    git(cwd, "remote", "add", "origin", url);
    const r = await run(["--allow-detached"]);
    expect(r.json).toMatchObject({ ownerRepo: "o/r", owner: "o", repo: "r", source: "remote" });
    expect(r.err).toContain("parsed from the origin remote");
  });

  it("gh not on PATH at all also falls back to the remote", async () => {
    const onlyGit = tmp("bkit-repo-onlygit-");
    const gitBin = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(gitBin, path.join(onlyGit, "git"));
    vi.stubEnv("PATH", onlyGit);
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    expect((await run([])).json.source).toBe("remote");
  });

  it("neither gh nor a remote -> exit 3, nothing emitted", async () => {
    const r = await run([]);
    expect(r.code).toBe(3);
    expect(r.json).toBeUndefined();
    expect(r.err).toContain("could not resolve owner/repo");
  });

  it("a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok", async () => {
    vi.stubEnv("FAKE_GH_REPO", "o/r");
    git(cwd, "checkout", "-q", "--detach");
    const r = await run([]);
    expect(r.code).toBe(4);
    expect(r.json.branch).toBeNull();
    expect((await run(["--allow-detached"])).code).toBe(0);
  });

  it("counts commits behind origin/dev and the divergence age", async () => {
    vi.stubEnv("FAKE_GH_REPO", "o/r");
    const base = git(cwd, "rev-parse", "HEAD");
    git(cwd, "checkout", "-q", "-b", "other");
    git(cwd, "commit", "-q", "--allow-empty", "-m", "d1");
    git(cwd, "commit", "-q", "--allow-empty", "-m", "d2");
    git(cwd, "update-ref", "refs/remotes/origin/dev", "HEAD");
    git(cwd, "checkout", "-q", "feat/1-x");
    expect(git(cwd, "rev-parse", "HEAD")).toBe(base);
    const r = await run([]);
    expect(r.json.behindDev).toBe(2);
    expect(r.json.divergedAgo).toMatch(/ago$/);
    expect(r.err).toContain("2 commits behind dev");
  });

  it("origin/dev unknown -> behindDev null, never a false '0 behind' (fix)", async () => {
    vi.stubEnv("FAKE_GH_REPO", "o/r");
    const r = await run([]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ behindDev: null, divergedAgo: null });
    expect(r.err).toContain("origin/dev not found locally");
  });

  it("--fetch fetches origin dev first, and a failed fetch is logged, not fatal", async () => {
    vi.stubEnv("FAKE_GH_REPO", "o/r");
    const upstream = tmp("bkit-repo-upstream-");
    git(upstream, "init", "-q", "-b", "dev");
    git(upstream, "commit", "-q", "--allow-empty", "-m", "u1");
    git(cwd, "remote", "add", "origin", upstream);
    const r = await run(["--fetch"]);
    expect(r.code).toBe(0);
    expect(typeof r.json.behindDev).toBe("number");

    git(cwd, "remote", "set-url", "origin", path.join(upstream, "gone"));
    const failed = await run(["--fetch"]);
    expect(failed.code).toBe(0);
    expect(failed.err).toContain("git fetch origin dev failed");
  });
});

describe("bkit repo info — where bkit, the repo root and the outbox live", () => {
  it("prints the main checkout, the bkit binary there, and the outbox in the git common dir", async () => {
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    const pinned = path.join(cwd, "node_modules", ".bin");
    fs.mkdirSync(pinned, { recursive: true });
    fs.writeFileSync(path.join(pinned, "bkit"), "", { mode: 0o755 });
    const r = await run([]);
    expect(r.code).toBe(0);
    expect(r.json.repoRoot).toBe(cwd);
    expect(r.json.bkit).toBe(path.join(cwd, "node_modules", ".bin", "bkit"));
    expect(r.json.outboxRoot).toBe(path.join(cwd, ".git", "bkit-outbox"));
  });

  it("from a worktree, still names the main checkout and its outbox", async () => {
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    const pinned = path.join(cwd, "node_modules", ".bin");
    fs.mkdirSync(pinned, { recursive: true });
    fs.writeFileSync(path.join(pinned, "bkit"), "", { mode: 0o755 });
    const wt = path.join(cwd, ".worktrees", "1-x");
    git(cwd, "worktree", "add", "-q", wt, "-b", "feat/1-y");
    const out: string[] = [];
    const code = await runCommand(["repo", "info"], [repoCommand], {
      classicVerbs: new Set(),
      cwd: wt,
      io: { stdout: (t) => out.push(t), stderr: () => undefined },
    });
    expect(code).toBe(0);
    const json = JSON.parse(out.join(""));
    expect(json.repoRoot).toBe(cwd);
    expect(json.bkit).toBe(path.join(cwd, "node_modules", ".bin", "bkit"));
    expect(json.outboxRoot).toBe(path.join(cwd, ".git", "bkit-outbox"));
  });
});

describe("bkit repo info — where the wired tracker's issues live", () => {
  const pkg = (bkit: Record<string, unknown>) =>
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ name: "x", bkit }));
  beforeEach(() => git(cwd, "remote", "add", "origin", "https://github.com/o/r.git"));

  it("prints the Linear team and project under linear", async () => {
    pkg({
      issueTracker: "linear",
      linear: { team: "ENG", project: "Mobile" },
      jira: { site: "x" },
    });
    expect((await run([])).json).toMatchObject({
      trackerTeam: "ENG",
      trackerProject: "Mobile",
      trackerSite: null,
    });
  });

  it("prints the Jira site and project under jira", async () => {
    pkg({
      issueTracker: "jira",
      linear: { team: "ENG" },
      jira: { site: "https://a.atlassian.net/", project: "MBA" },
    });
    expect((await run([])).json).toMatchObject({
      trackerTeam: null,
      trackerProject: "MBA",
      trackerSite: "https://a.atlassian.net",
    });
  });

  it("prints nulls under github, and for keys left unset", async () => {
    pkg({ issueTracker: "github", linear: { team: "ENG" } });
    expect((await run([])).json).toMatchObject({
      trackerTeam: null,
      trackerProject: null,
      trackerSite: null,
    });
    pkg({ issueTracker: "linear" });
    expect((await run([])).json).toMatchObject({ trackerTeam: null, trackerProject: null });
  });
});

describe("bkit repo info — whether this repo's bkit is behind the newest release", () => {
  beforeEach(() => vi.stubEnv("BKIT_NO_UPDATE_CHECK", ""));
  const pin = (version: string) => {
    fs.mkdirSync(path.join(cwd, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, ".bkit", "version"),
      JSON.stringify({ pinnedVersion: version, canonicalHashes: {} }),
    );
  };
  const cacheLatest = (latest: string | null) =>
    fs.writeFileSync(
      path.join(cwd, ".git", "bkit-latest-version.json"),
      JSON.stringify({ latest, checkedAt: Date.now() }),
    );

  it("prints the upgrade advisory when the pin is older than the newest release", async () => {
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    pin("5.2.4");
    cacheLatest("5.10.0");
    const r = await run([]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      bkitVersion: "5.2.4",
      bkitLatest: "5.10.0",
      bkitOutdated: true,
      bkitAdvisory: "running bkit 5.2.4; 5.10.0 is out. Upgrade: pnpm bkit upgrade --latest",
    });
    expect(r.err).toContain("running bkit 5.2.4; 5.10.0 is out");
  });

  it("stays quiet when the pin is current or ahead (the bkit repo's own dev)", async () => {
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    pin("5.3.0");
    cacheLatest("5.2.4");
    const r = await run([]);
    expect(r.json).toMatchObject({ bkitOutdated: false, bkitAdvisory: null });
    expect(r.err).not.toContain("is out");
  });

  it("an unknown newest release (remembered registry failure) is null, never an error", async () => {
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    pin("5.2.4");
    cacheLatest(null);
    const r = await run([]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ bkitVersion: "5.2.4", bkitLatest: null, bkitOutdated: null });
  });

  it("an unpinned repo reports nulls and asks no registry", async () => {
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    const r = await run([]);
    expect(r.json).toMatchObject({
      bkitVersion: null,
      bkitLatest: null,
      bkitOutdated: null,
      bkitAdvisory: null,
    });
    expect(fs.existsSync(path.join(cwd, ".git", "bkit-latest-version.json"))).toBe(false);
  });
});

describe("bkit repo preflight", () => {
  async function preflight(...argv: string[]) {
    const out: string[] = [];
    const err: string[] = [];
    const code = await runCommand(["repo", "preflight", ...argv], [repoCommand], {
      classicVerbs: new Set(),
      cwd,
      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
    });
    return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
  }

  it("reports the Actions permissions read is available, advisory false", async () => {
    const r = await preflight("--owner-repo=o/r");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      ownerRepo: "o/r",
      actionsPermissionsReadable: true,
      status: 0,
      warning: null,
    });
  });

  it("warns and carries on (exit 0, no MCP route) when the gh api read fails", async () => {
    vi.stubEnv("FAKE_GH_API_FAIL", "1");
    const r = await preflight("--owner-repo=o/r");
    expect(r.code).toBe(0);
    expect(r.json.actionsPermissionsReadable).toBe(false);
    expect(r.json.warning).toContain("may 403");
    expect(r.err).toContain("actions:write preflight");
  });

  it("resolves owner/repo from the origin remote when --owner-repo is absent", async () => {
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    expect((await preflight()).json.ownerRepo).toBe("o/r");
  });

  it("exits 3 when owner/repo cannot be resolved, or the flag is malformed", async () => {
    expect((await preflight()).code).toBe(3);
    expect((await preflight("--owner-repo=o")).code).toBe(3);
  });
});
