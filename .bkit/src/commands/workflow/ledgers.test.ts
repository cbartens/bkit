import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { bookPathspecs, ledgersCommand } from "./ledgers";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

function tmp() {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledgers-")));
  dirs.push(d);
  return d;
}

function repo(dir = path.join(tmp(), "repo")) {
  fs.mkdirSync(dir, { recursive: true });
  git(dir, "init", "-q", "-b", "main");
  git(dir, "config", "user.email", "t@t.t");
  git(dir, "config", "user.name", "t");
  return dir;
}

const put = (root: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), body);
};
const add = (root: string, rel: string, body: string) =>
  fs.appendFileSync(path.join(root, rel), body);
const commitAll = (root: string, msg = "init") => {
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", msg);
};
const head = (root: string) => git(root, "rev-parse", "HEAD");
const stat = (root: string) => git(root, "show", "--stat", "--summary", "HEAD");
const staged = (root: string) => git(root, "diff", "--cached", "--name-only");

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["ledgers", ...argv], [ledgersCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const commitArgs = (root: string, ...flags: string[]) => ["commit", `--root=${root}`, ...flags];

describe("bkit ledgers commit (tests/book-commit.bats)", () => {
  it("modified ledger under the FID logdir is staged and committed", async () => {
    const r = repo();
    put(r, "docs/plans/202608/logs/446-book/status.jsonl", '{"a":1}\n');
    commitAll(r);
    add(r, "docs/plans/202608/logs/446-book/status.jsonl", '{"a":2}\n');
    const before = head(r);
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=446-book",
        "--scope=core",
        "--mode=commit",
        "--message=test commit",
      ),
    );
    expect(res.code).toBe(0);
    expect(head(r)).not.toBe(before);
    expect(stat(r)).toContain("status.jsonl");
    expect(res.json).toMatchObject({ outcome: "committed", commit: head(r) });
  });

  it("tracked-but-deleted skill mirror is staged as a deletion (scope=full)", async () => {
    const r = repo();
    put(r, ".claude/skills/foo.md", "x\n");
    put(r, "docs/plans/202608/logs/446d/status.jsonl", "{}\n");
    commitAll(r);
    fs.rmSync(path.join(r, ".claude/skills/foo.md"));
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=446d",
        "--scope=full",
        "--mode=commit",
        "--message=deletion test",
      ),
    );
    expect(res.code).toBe(0);
    expect(stat(r)).toContain("delete mode");
    expect(stat(r)).toContain("foo.md");
  });

  it("brand-new untracked ledger is staged and committed", async () => {
    const r = repo();
    put(r, "README.md", "x\n");
    commitAll(r);
    put(r, ".bkit/newledger.jsonl", '{"x":1}\n');
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=nomatch",
        "--scope=full",
        "--mode=commit",
        "--message=new ledger test",
      ),
    );
    expect(res.code).toBe(0);
    expect(stat(r)).toContain("newledger.jsonl");
  });

  it("unmatched plan-logs glob does not abort the sweep of other ledgers", async () => {
    const r = repo();
    put(r, "README.md", "x\n");
    commitAll(r);
    put(r, ".bkit/onlyledger.jsonl", '{"only":1}\n');
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=nomatch",
        "--scope=full",
        "--mode=commit",
        "--message=sweep",
      ),
    );
    expect(res.code).toBe(0);
    expect(stat(r)).toContain("onlyledger.jsonl");
  });

  it("path containing a space is staged and committed", async () => {
    const r = repo();
    put(r, "README.md", "x\n");
    commitAll(r);
    put(r, "docs/plans/202608/logs/446 space/status.jsonl", '{"a":1}\n');
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=446 space",
        "--scope=core",
        "--mode=commit",
        "--message=space test",
      ),
    );
    expect(res.code).toBe(0);
    expect(stat(r)).toContain("446 space/status.jsonl");
  });

  it("nothing changed: exit 0, 'nothing to commit', no new commit", async () => {
    const r = repo();
    put(r, "docs/plans/202608/logs/446n/status.jsonl", '{"a":1}\n');
    commitAll(r);
    const before = head(r);
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=446n",
        "--scope=core",
        "--mode=commit",
        "--message=should not create",
      ),
    );
    expect(res.code).toBe(0);
    expect(res.err).toContain("nothing to commit");
    expect(res.json).toMatchObject({ outcome: "nothing-to-commit", commit: null });
    expect(head(r)).toBe(before);
  });

  it("staging failure: exit 4 and no commit is created, no false success", async () => {
    const r = repo();
    put(r, "docs/plans/202608/logs/446f/status.jsonl", "{}\n");
    commitAll(r);
    add(r, "docs/plans/202608/logs/446f/status.jsonl", '{"more":1}\n');
    const before = head(r);
    // A held index.lock makes `git add` refuse for every uid, root included.
    fs.writeFileSync(path.join(r, ".git/index.lock"), "");
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=446f",
        "--scope=core",
        "--mode=commit",
        "--message=should fail",
      ),
    );
    fs.rmSync(path.join(r, ".git/index.lock"));
    expect(res.code).toBe(4);
    expect(res.err).not.toContain("nothing to commit");
    expect(head(r)).toBe(before);
  });

  it("empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit", async () => {
    const r = repo();
    put(r, "README.md", "x\n");
    commitAll(r);
    put(r, "unrelated.txt", "staged\n");
    git(r, "add", "unrelated.txt");
    const before = head(r);
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=nope",
        "--scope=core",
        "--mode=commit",
        "--message=empty test",
      ),
    );
    expect(res.code).toBe(6);
    expect(head(r)).toBe(before);
    expect(staged(r)).toContain("unrelated.txt");
  });

  it("empty pathspec list under commit-allow-empty also exits 6, no commit created", async () => {
    const r = repo();
    put(r, "README.md", "x\n");
    commitAll(r);
    const before = head(r);
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=nope",
        "--scope=full",
        "--mode=commit-allow-empty",
        "--message=ce test",
      ),
    );
    expect(res.code).toBe(6);
    expect(head(r)).toBe(before);
  });

  it("--mode=stage stages the sweep but creates no commit", async () => {
    const r = repo();
    put(r, "docs/plans/202608/logs/446s/status.jsonl", "{}\n");
    commitAll(r);
    add(r, "docs/plans/202608/logs/446s/status.jsonl", '{"m":1}\n');
    const before = head(r);
    const res = await run(
      r,
      commitArgs(r, "--month=202608", "--fid=446s", "--scope=core", "--mode=stage"),
    );
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("staged");
    expect(head(r)).toBe(before);
    expect(staged(r)).toContain("status.jsonl");
  });

  it("top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full", async () => {
    const r = repo();
    put(r, "docs/plans/202610/logs/452d/status.jsonl", "{}\n");
    put(r, "docs/architecture.md", "a\n");
    commitAll(r);
    add(r, "docs/architecture.md", "b\n");
    add(r, "docs/plans/202610/logs/452d/status.jsonl", '{"a":1}\n');
    const base = ["--month=202610", "--fid=452d", "--mode=commit"];

    expect((await run(r, commitArgs(r, ...base, "--scope=core", "--message=core"))).code).toBe(0);
    expect(stat(r)).not.toContain("architecture.md");
    add(r, "docs/plans/202610/logs/452d/status.jsonl", '{"a":2}\n');
    expect((await run(r, commitArgs(r, ...base, "--scope=full", "--message=full"))).code).toBe(0);
    expect(stat(r)).not.toContain("architecture.md");
    expect((await run(r, commitArgs(r, ...base, "--scope=pr", "--message=pr"))).code).toBe(0);
    expect(stat(r)).toContain("docs/architecture.md");
  });

  it("scope=pr does not reach nested docs (another FID's plan, docs/templates/**)", async () => {
    const r = repo();
    put(r, "docs/plans/202610/logs/452n/status.jsonl", "{}\n");
    put(r, "docs/plans/202609/other-plan.md", "a\n");
    put(r, "docs/templates/bkit-plan.md", "a\n");
    commitAll(r);
    add(r, "docs/plans/202609/other-plan.md", "b\n");
    add(r, "docs/templates/bkit-plan.md", "b\n");
    add(r, "docs/plans/202610/logs/452n/status.jsonl", '{"a":1}\n');
    const res = await run(
      r,
      commitArgs(r, "--month=202610", "--fid=452n", "--scope=pr", "--mode=commit", "--message=pr"),
    );
    expect(res.code).toBe(0);
    expect(stat(r)).not.toContain("other-plan.md");
    expect(stat(r)).not.toContain("bkit-plan.md");
  });

  it.each([
    [["--scope=wide", "--mode=commit", "--message=m"], "--scope must be"],
    [["--scope=core", "--mode=push", "--message=m"], "--mode must be"],
    [["--scope=core", "--mode=commit"], "--message is required"],
  ])("usage error %j exits 2", async (flags, problem) => {
    const r = repo();
    const res = await run(r, commitArgs(r, "--month=202610", "--fid=x", ...flags));
    expect(res.code).toBe(2);
    expect(res.err).toContain(problem);
  });

  it("root that is not a directory or not a repo exits 3", async () => {
    const t = tmp();
    const base = ["--month=202610", "--fid=x", "--scope=core", "--mode=stage"];
    expect((await run(t, commitArgs(path.join(t, "missing"), ...base))).code).toBe(3);
    expect((await run(t, commitArgs(t, ...base))).code).toBe(3);
  });

  it("--root defaults to the working directory", async () => {
    const r = repo();
    put(r, ".bkit/x.jsonl", "{}\n");
    const res = await run(r, [
      "commit",
      "--month=202610",
      "--fid=x",
      "--scope=core",
      "--mode=commit",
      "--message=m",
    ]);
    expect(res.code).toBe(0);
    expect(stat(r)).toContain(".bkit/x.jsonl");
  });

  it("--stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones", async () => {
    const r = repo();
    put(r, "docs/plans/202608/logs/1-a/status.jsonl", "{}\n");
    put(r, "src.ts", "a\n");
    commitAll(r);
    add(r, "src.ts", "b\n");
    put(r, ".bkit/new.jsonl", "{}\n");
    put(r, "scratch.txt", "x\n");
    const before = head(r);
    const base = ["--month=202608", "--fid=1-a", "--scope=full", "--mode=stage"];

    expect((await run(r, commitArgs(r, ...base))).code).toBe(0);
    expect(staged(r).split("\n")).toEqual([".bkit/new.jsonl"]);

    const res = await run(r, commitArgs(r, ...base, "--stage-tracked-updates"));
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("staged");
    expect(staged(r).split("\n").sort()).toEqual([".bkit/new.jsonl", "src.ts"]);
    expect(head(r)).toBe(before);
  });
});

describe("--squash-of (tests/book-commit.bats, #493)", () => {
  function squashBase() {
    const r = repo();
    put(r, "docs/plans/202610/logs/493s/status.jsonl", "{}\n");
    put(r, "docs/plans/202610/gone.md", "old\n");
    git(r, "checkout", "-q", "-b", "dev");
    commitAll(r);
    git(r, "checkout", "-q", "-b", "feat/493s");
    put(r, "docs/plans/202610/493s-plan.md", "plan\n");
    git(r, "rm", "-q", "docs/plans/202610/gone.md");
    commitAll(r, "feat");
    git(r, "checkout", "-q", "dev");
    return r;
  }

  it("commits the squashed paths (deletion included) and bookkeeping, not another staged file", async () => {
    const r = squashBase();
    put(r, "docs/plans/202610/OTHER-plan.md", "other\n");
    git(r, "add", "docs/plans/202610/OTHER-plan.md");
    git(r, "merge", "-q", "--squash", "feat/493s");
    add(r, "docs/plans/202610/logs/493s/status.jsonl", '{"close":1}\n');
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202610",
        "--fid=493s",
        "--scope=core",
        "--mode=commit-allow-empty",
        "--squash-of=feat/493s",
        "--message=close",
      ),
    );
    expect(res.code).toBe(0);
    const landed = git(r, "show", "--name-status", "--format=", "HEAD");
    expect(landed).toContain("A\tdocs/plans/202610/493s-plan.md");
    expect(landed).toContain("D\tdocs/plans/202610/gone.md");
    expect(landed).toContain("status.jsonl");
    expect(landed).not.toContain("OTHER-plan.md");
    expect(staged(r)).toBe("docs/plans/202610/OTHER-plan.md");
    expect(res.json.squashPaths.sort()).toEqual([
      "docs/plans/202610/493s-plan.md",
      "docs/plans/202610/gone.md",
    ]);
  });

  it("under --mode=commit counts the squashed paths as something to commit", async () => {
    const r = squashBase();
    git(r, "merge", "-q", "--squash", "feat/493s");
    const before = head(r);
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202610",
        "--fid=493s",
        "--scope=core",
        "--mode=commit",
        "--squash-of=feat/493s",
        "--message=close",
      ),
    );
    expect(res.code).toBe(0);
    expect(head(r)).not.toBe(before);
    expect(git(r, "show", "--name-only", "--format=", "HEAD")).toContain("493s-plan.md");
  });

  it("stage mode exits 2; an unknown ref exits 3 with no commit", async () => {
    const r = squashBase();
    const before = head(r);
    const base = ["--month=202610", "--fid=493s", "--scope=core"];
    expect(
      (await run(r, commitArgs(r, ...base, "--mode=stage", "--squash-of=feat/493s"))).code,
    ).toBe(2);
    expect(
      (
        await run(
          r,
          commitArgs(
            r,
            ...base,
            "--mode=commit-allow-empty",
            "--squash-of=feat/nope",
            "--message=close",
          ),
        )
      ).code,
    ).toBe(3);
    expect(head(r)).toBe(before);
  });
});

describe("--only-if-dirty-tracked (build / design / plan Step 2)", () => {
  const args = (r: string) =>
    commitArgs(
      r,
      "--month=202610",
      "--fid=9-x",
      "--scope=core",
      "--mode=commit",
      "--only-if-dirty-tracked",
      "--message=chore(9-x): pre-worktree",
    );

  it("does nothing when only untracked files are present", async () => {
    const r = repo();
    put(r, ".bkit/a.jsonl", "{}\n");
    commitAll(r);
    put(r, "new-untracked.txt", "x\n");
    put(r, ".bkit/b.jsonl", "{}\n");
    const before = head(r);
    const res = await run(r, args(r));
    expect(res.code).toBe(0);
    expect(res.json).toMatchObject({ outcome: "clean", commit: null });
    expect(head(r)).toBe(before);
    expect(staged(r)).toBe("");
  });

  it("commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty", async () => {
    const r = repo();
    put(r, ".bkit/a.jsonl", "{}\n");
    put(r, "src.ts", "a\n");
    commitAll(r);
    add(r, ".bkit/a.jsonl", '{"b":1}\n');
    add(r, "src.ts", "b\n");
    const res = await run(r, args(r));
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("committed");
    const landed = git(r, "show", "--name-only", "--format=", "HEAD");
    expect(landed).toBe(".bkit/a.jsonl");
    expect(res.err).toContain("src.ts");
  });

  // Exiting 6 here would fail Step 2 on a fresh consumer repo whose only change
  // is a dirty tracked non-bookkeeping file.
  it("a dirty tree with no bookkeeping at all is nothing to commit, not exit 6", async () => {
    const r = repo();
    put(r, "README.md", "a\n");
    commitAll(r);
    add(r, "README.md", "b\n");
    const before = head(r);
    const res = await run(r, args(r));
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("nothing-to-commit");
    expect(head(r)).toBe(before);
  });
});

describe("bkit ledgers union (union-ledgers)", () => {
  it("merges rows append-only without duplicating existing ones", async () => {
    const t = tmp();
    const src = repo(path.join(t, "src"));
    const dst = path.join(t, "dst");
    put(src, "docs/plans/202608/logs/446u/status.jsonl", '{"row":1}\n{"row":2}\n');
    commitAll(src, "srcinit");
    put(dst, "docs/plans/202608/logs/446u/status.jsonl", '{"row":1}\n');
    const res = await run(t, ["union", `--src=${src}`, `--dst=${dst}`]);
    expect(res.code).toBe(0);
    expect(
      fs.readFileSync(path.join(dst, "docs/plans/202608/logs/446u/status.jsonl"), "utf-8"),
    ).toBe('{"row":1}\n{"row":2}\n');
    expect(res.json).toEqual({ unioned: 1, files: ["docs/plans/202608/logs/446u/status.jsonl"] });
  });

  it("an unmatched glob in src does not abort; exits 0 with nothing unioned", async () => {
    const t = tmp();
    const src = repo(path.join(t, "src2"));
    put(src, "README.md", "x\n");
    commitAll(src, "srcinit");
    fs.mkdirSync(path.join(t, "dst2"));
    const res = await run(t, ["union", `--src=${src}`, `--dst=${path.join(t, "dst2")}`]);
    expect(res.code).toBe(0);
    expect(res.json.unioned).toBe(0);
  });

  it("never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev)", async () => {
    const t = tmp();
    const src = repo(path.join(t, "src3"));
    const dst = path.join(t, "dst3");
    put(src, ".bkit/issues.jsonl", '{"kind":"feature","key":"452x","status":"SHIPPED"}\n');
    put(src, ".bkit/friction.jsonl", '{"row":1}\n');
    commitAll(src, "srcinit");
    put(dst, ".bkit/issues.jsonl", '{"kind":"feature","key":"452x","status":"BUILT"}\n');
    const res = await run(t, ["union", `--src=${src}`, `--dst=${dst}`]);
    expect(res.code).toBe(0);
    expect(fs.readFileSync(path.join(dst, ".bkit/issues.jsonl"), "utf-8").trim()).toBe(
      '{"kind":"feature","key":"452x","status":"BUILT"}',
    );
    expect(fs.readFileSync(path.join(dst, ".bkit/friction.jsonl"), "utf-8").trim()).toBe(
      '{"row":1}',
    );
  });

  it("carries untracked ledgers too", async () => {
    const t = tmp();
    const src = repo(path.join(t, "src4"));
    put(src, "README.md", "x\n");
    commitAll(src, "srcinit");
    put(src, "docs/deferrals.jsonl", '{"d":1}\n');
    const dst = path.join(t, "dst4");
    expect((await run(t, ["union", `--src=${src}`, `--dst=${dst}`])).code).toBe(0);
    expect(fs.readFileSync(path.join(dst, "docs/deferrals.jsonl"), "utf-8")).toBe('{"d":1}\n');
  });

  // The script appends straight after the last byte, gluing two rows into one
  // line that is not JSON when the destination lacks its final newline.
  it("keeps rows on separate lines when the destination has no final newline", async () => {
    const t = tmp();
    const src = repo(path.join(t, "src5"));
    put(src, ".bkit/friction.jsonl", '{"row":1}\n{"row":2}\n');
    commitAll(src, "srcinit");
    const dst = path.join(t, "dst5");
    put(dst, ".bkit/friction.jsonl", '{"row":1}');
    await run(t, ["union", `--src=${src}`, `--dst=${dst}`]);
    expect(fs.readFileSync(path.join(dst, ".bkit/friction.jsonl"), "utf-8")).toBe(
      '{"row":1}\n{"row":2}\n',
    );
  });

  it("src that is not a git repo exits 3", async () => {
    const t = tmp();
    expect((await run(t, ["union", `--src=${t}`, `--dst=${path.join(t, "d")}`])).code).toBe(3);
  });
});

describe("bkit ledgers only-bookkeeping", () => {
  function base() {
    const r = repo();
    put(r, "src/a.ts", "a\n");
    put(r, "docs/architecture.md", "a\n");
    fs.mkdirSync(path.join(r, "docs/plans/202610/logs/452b"), { recursive: true });
    return r;
  }
  const check = (r: string, from: string, to: string) =>
    run(r, [
      "only-bookkeeping",
      `--root=${r}`,
      "--month=202610",
      "--fid=452b",
      `--from=${from}`,
      `--to=${to}`,
    ]);

  it("docs, FID logs, ledgers and skill removals only: exit 0", async () => {
    const r = base();
    put(r, ".agents/skills/foo/SKILL.md", "x\n");
    commitAll(r);
    const from = head(r);
    add(r, "docs/architecture.md", "b\n");
    put(r, "docs/plans/202610/logs/452b/ship-summary.md", "s\n");
    put(r, "docs/deferrals.jsonl", '{"k":1}\n');
    fs.rmSync(path.join(r, ".agents/skills/foo"), { recursive: true });
    commitAll(r, "book");
    const res = await check(r, from, head(r));
    expect(res.code).toBe(0);
    expect(res.json).toEqual({ onlyBookkeeping: true, ancestor: true, outside: [] });
  });

  it("a source file in the range: exit 7, path listed", async () => {
    const r = base();
    commitAll(r);
    const from = head(r);
    add(r, "docs/architecture.md", "b\n");
    add(r, "src/a.ts", "b\n");
    commitAll(r, "mixed");
    const res = await check(r, from, head(r));
    expect(res.code).toBe(7);
    expect(res.err).toContain("src/a.ts");
    expect(res.err).not.toContain("  docs/architecture.md");
    expect(res.json.outside).toEqual(["src/a.ts"]);
  });

  it("another FID's plan file in the range: exit 7", async () => {
    const r = base();
    commitAll(r);
    const from = head(r);
    put(r, "docs/plans/202610/9-other-plan.md", "p\n");
    commitAll(r, "plan");
    expect((await check(r, from, head(r))).code).toBe(7);
  });

  it("from not an ancestor of to: exit 7", async () => {
    const r = base();
    commitAll(r);
    const first = head(r);
    add(r, "docs/architecture.md", "b\n");
    commitAll(r, "book");
    const res = await check(r, head(r), first);
    expect(res.code).toBe(7);
    expect(res.err).toContain("not an ancestor");
    expect(res.json.ancestor).toBe(false);
  });

  it("unknown commit exits 3; a missing flag exits 2", async () => {
    const r = base();
    commitAll(r);
    expect((await check(r, "deadbeef", head(r))).code).toBe(3);
    const missing = await run(r, [
      "only-bookkeeping",
      `--root=${r}`,
      "--month=202610",
      "--fid=452b",
      `--from=${head(r)}`,
    ]);
    expect(missing.code).toBe(2);
  });
});

describe("bookPathspecs", () => {
  it("grows core -> full -> pr", () => {
    const core = bookPathspecs("202610", "1-x", "core");
    const full = bookPathspecs("202610", "1-x", "full");
    const pr = bookPathspecs("202610", "1-x", "pr");
    expect(core[0]).toBe("docs/plans/202610/logs/1-x/*");
    expect(full.slice(0, core.length)).toEqual(core);
    expect(pr).toEqual([...full, ":(glob)docs/*.md"]);
  });
});

// The frozen bookkeeping allow-list (design § `BOOK_ROOT` / `BOOK_PATHS`, #446):
// every ship stage/commit resolves through bookPathspecs — never `-A`, never a
// bare `docs/`. A path dropped from the builder strands that ledger dirty.
const BOOK_PATHS_ALLOW_LIST: readonly string[] = [
  // A .md, so the `docs/*.jsonl` glob does not reach it: named literally.
  "docs/roadmap.md",
  "docs/deferrals.jsonl",
  "docs/failures.jsonl",
  "docs/knowledge.jsonl",
  "docs/decisions.jsonl",
  ".bkit/friction.jsonl",
  // Close telemetry, appended before the close commit.
  ".bkit/stats.jsonl",
  ".agents/skills",
  "skills-lock.json",
  // Host skill mirrors `npx skills remove` deletes alongside .agents/skills/<name>.
  ".claude/skills",
  ".cursor/skills",
  ".opencode/skills",
  // Top-level project docs the ship docs sync edits — `--scope=pr` only.
  ":(glob)docs/*.md",
];

describe("bookPathspecs — frozen bookkeeping allow-list", () => {
  it("scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob", () => {
    const pr = bookPathspecs("202610", "1-x", "pr");
    for (const p of BOOK_PATHS_ALLOW_LIST) {
      expect(
        pr.some((s) => s === p || s === `${p}/*`),
        p,
      ).toBe(true);
    }
    expect(pr).toContain("docs/plans/202610/logs/1-x/*");
    expect(pr).toContain("docs/*.jsonl"); // .bkit/issues.jsonl's route is the .bkit/*.jsonl glob
  });

  it("never names docs/completed.md (#380)", () => {
    for (const scope of ["core", "full", "pr"] as const) {
      expect(bookPathspecs("202610", "1-x", scope)).not.toContain("docs/completed.md");
    }
  });
});
