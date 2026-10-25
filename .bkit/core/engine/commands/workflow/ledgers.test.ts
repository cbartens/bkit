import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import {
  EXIT_ROWS_MISSING,
  EXIT_ROW_REFUSED,
  bookPathspecs,
  ledgersCommand,
  newRecord,
  readRecord,
  writeRecord,
} from "./ledgers";

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
  const code = await runCommand(["ledgers", ...argv, "--json"], [ledgersCommand], {
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
    git(r, "switch", "-q", "-c", "feat/452d");
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
    git(r, "switch", "-q", "-c", "feat/452n");
    const res = await run(
      r,
      commitArgs(r, "--month=202610", "--fid=452n", "--scope=pr", "--mode=commit", "--message=pr"),
    );
    expect(res.code).toBe(0);
    expect(stat(r)).not.toContain("other-plan.md");
    expect(stat(r)).not.toContain("bkit-plan.md");
  });

  it.each([
    ["main", ["switch", "-q", "main"]],
    ["dev", ["switch", "-q", "-c", "dev"]],
    ["a detached HEAD", ["switch", "-q", "--detach"]],
  ])(
    "scope=pr refuses to commit on %s (exit 12) with nothing committed",
    async (_where, switchArgs) => {
      const r = repo();
      put(r, "docs/plans/202610/logs/452p/status.jsonl", "{}\n");
      commitAll(r);
      git(r, ...switchArgs);
      add(r, "docs/plans/202610/logs/452p/status.jsonl", '{"a":1}\n');
      const before = head(r);
      const res = await run(
        r,
        commitArgs(
          r,
          "--month=202610",
          "--fid=452p",
          "--scope=pr",
          "--mode=commit",
          "--message=pr",
        ),
      );
      expect(res.code).toBe(12);
      expect(res.err).toContain("refusing");
      expect(head(r)).toBe(before);
    },
  );

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

  it("--stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping", async () => {
    const r = repo();
    put(r, "docs/plans/202608/logs/1-a/status.jsonl", "{}\n");
    put(r, "src.ts", "a\n");
    commitAll(r);
    add(r, "src.ts", "b\n");
    add(r, "docs/plans/202608/logs/1-a/status.jsonl", "{}\n");
    put(r, "scratch.txt", "x\n");
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=1-a",
        "--scope=full",
        "--mode=commit",
        "--stage-tracked-updates",
        "--message=chore(1-a): conflict-resolve bkit [skip ci]",
      ),
    );
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("committed");
    expect(git(r, "show", "--name-only", "--format=", "HEAD").split("\n").sort()).toEqual([
      "docs/plans/202608/logs/1-a/status.jsonl",
      "src.ts",
    ]);
    expect(git(r, "status", "--porcelain")).toBe("?? scratch.txt");
  });

  it("--stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed", async () => {
    const r = repo();
    put(r, "docs/plans/202608/logs/1-a/status.jsonl", "{}\n");
    put(r, "src.ts", "a\n");
    commitAll(r);
    add(r, "src.ts", "b\n");
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202608",
        "--fid=1-a",
        "--scope=full",
        "--mode=commit",
        "--stage-tracked-updates",
        "--message=m",
      ),
    );
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("committed");
    expect(git(r, "show", "--name-only", "--format=", "HEAD")).toBe("src.ts");
  });
});

describe("bkit ledgers commit --path", () => {
  function planRepo() {
    const r = repo();
    put(r, "docs/plans/202610/679-x-plan.md", "plan\n");
    put(r, "src.ts", "a\n");
    commitAll(r);
    return r;
  }
  const args = (r: string, ...flags: string[]) =>
    commitArgs(r, "--month=202610", "--fid=679-x", ...flags);

  it("commits the named path alone, leaving every other change in the tree", async () => {
    const r = planRepo();
    add(r, "docs/plans/202610/679-x-plan.md", "exception\n");
    add(r, "src.ts", "b\n");
    git(r, "add", "src.ts");
    const res = await run(
      r,
      args(r, "--mode=commit", "--path=docs/plans/202610/679-x-plan.md", "--message=docs: x"),
    );
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("committed");
    expect(res.json.paths).toEqual(["docs/plans/202610/679-x-plan.md"]);
    expect(git(r, "show", "--name-only", "--format=", "HEAD")).toBe(
      "docs/plans/202610/679-x-plan.md",
    );
    expect(staged(r)).toBe("src.ts");
  });

  it("an unchanged path is nothing-to-commit under --mode=commit", async () => {
    const r = planRepo();
    const before = head(r);
    const res = await run(
      r,
      args(r, "--mode=commit", "--path=docs/plans/202610/679-x-plan.md", "--message=m"),
    );
    expect(res.code).toBe(0);
    expect(res.json.outcome).toBe("nothing-to-commit");
    expect(head(r)).toBe(before);
  });

  it("refuses --path with --mode=stage or --stage-tracked-updates", async () => {
    const r = planRepo();
    const p = "--path=docs/plans/202610/679-x-plan.md";
    expect((await run(r, args(r, "--mode=stage", p))).code).toBe(2);
    expect(
      (await run(r, args(r, "--mode=commit", p, "--stage-tracked-updates", "--message=m"))).code,
    ).toBe(2);
  });

  it("a path outside the checkout exits 6 with nothing committed", async () => {
    const r = planRepo();
    const before = head(r);
    const res = await run(r, args(r, "--mode=commit", "--path=../elsewhere.md", "--message=m"));
    expect(res.code).toBe(6);
    expect(head(r)).toBe(before);
  });
});

describe("bkit ledgers commit — a run in place on dev that shares its checkout", () => {
  const FID = "650-shared";
  const LOGS = `docs/plans/202610/logs/${FID}`;
  const row = (id: string) => `${JSON.stringify({ id })}\n`;
  const base = ["--month=202610", `--fid=${FID}`, "--scope=core"];

  /** A dev checkout with a foreign edit and a foreign ledger row in flight, and the run's record. */
  function shared() {
    const r = repo();
    git(r, "switch", "-q", "-c", "dev");
    put(r, "src/a.txt", "a\n");
    put(r, "src/own.txt", "own\n");
    put(r, ".bkit/issues.jsonl", row("base"));
    put(r, `${LOGS}/status.jsonl`, "{}\n");
    commitAll(r);
    add(r, "src/a.txt", "foreign\n");
    add(r, ".bkit/issues.jsonl", row("foreign"));
    writeRecord(r, newRecord(r, FID, "dev"));
    return r;
  }

  it("stageTrackedUpdates skips recorded paths", async () => {
    const r = shared();
    add(r, "src/own.txt", "run edit\n");
    const res = await run(r, commitArgs(r, ...base, "--mode=stage", "--stage-tracked-updates"));
    expect(res.code).toBe(0);
    const list = staged(r).split("\n");
    expect(list).toContain("src/own.txt");
    expect(list).not.toContain("src/a.txt");
  });

  it("--path records its commit on the run's record, like every other commit mode", async () => {
    const r = shared();
    add(r, `${LOGS}/exception.md`, "test-order exception\n");
    const res = await run(
      r,
      commitArgs(
        r,
        "--month=202610",
        `--fid=${FID}`,
        "--mode=commit",
        `--path=${LOGS}/exception.md`,
        "--message=docs: x",
      ),
    );
    expect(res.code).toBe(0);
    expect(readRecord(r, FID)?.commits).toEqual([head(r)]);
  });

  it("a recorded ledger commits only the rows the run appended", async () => {
    const r = shared();
    add(r, ".bkit/issues.jsonl", row("run"));
    const res = await run(r, commitArgs(r, ...base, "--mode=commit", "--message=book"));
    expect(res.code).toBe(0);
    expect(git(r, "show", "HEAD:.bkit/issues.jsonl")).toBe(`${row("base")}${row("run")}`.trimEnd());
    expect(fs.readFileSync(path.join(r, ".bkit/issues.jsonl"), "utf-8")).toBe(
      `${row("base")}${row("foreign")}${row("run")}`,
    );
  });

  it("a ledger the user staged before the run keeps their rows in the index after the run's commit", async () => {
    const r = shared();
    git(r, "add", ".bkit/issues.jsonl");
    add(r, ".bkit/issues.jsonl", row("run"));
    const res = await run(r, commitArgs(r, ...base, "--mode=commit", "--message=book"));
    expect(res.code).toBe(0);
    expect(git(r, "show", "HEAD:.bkit/issues.jsonl")).toBe(`${row("base")}${row("run")}`.trimEnd());
    // The index is HEAD's rows plus the user's staged row, so their next plain commit adds only that row.
    expect(git(r, "show", ":.bkit/issues.jsonl")).toBe(
      `${row("base")}${row("run")}${row("foreign")}`.trimEnd(),
    );
    expect(git(r, "diff", "--cached", "-U0", "--", ".bkit/issues.jsonl")).toContain(
      `+${JSON.stringify({ id: "foreign" })}`,
    );
    expect(git(r, "diff", "--cached", "-U0", "--", ".bkit/issues.jsonl")).not.toContain("-{");
  });

  it("a recorded ledger under an eol attribute still commits only the run's rows", async () => {
    const r = repo();
    git(r, "switch", "-q", "-c", "dev");
    put(r, ".gitattributes", ".bkit/issues.jsonl text eol=crlf\n");
    put(r, "src/a.txt", "a\n");
    put(r, ".bkit/issues.jsonl", `${row("base").trimEnd()}\r\n`);
    put(r, `${LOGS}/status.jsonl`, "{}\n");
    commitAll(r);
    add(r, "src/a.txt", "foreign\n");
    add(r, ".bkit/issues.jsonl", `${row("foreign").trimEnd()}\r\n`);
    writeRecord(r, newRecord(r, FID, "dev"));
    add(r, ".bkit/issues.jsonl", `${row("run").trimEnd()}\r\n`);
    const res = await run(r, commitArgs(r, ...base, "--mode=commit", "--message=book"));
    expect(res.code).toBe(0);
    const inHead = git(r, "show", "HEAD:.bkit/issues.jsonl");
    expect(inHead).toContain('"run"');
    expect(inHead).not.toContain('"foreign"');
  });

  it("commitBookkeeping refuses when a recorded path changed", async () => {
    const r = shared();
    const before = head(r);
    add(r, "src/a.txt", "changed mid-run\n");
    add(r, `${LOGS}/status.jsonl`, "{}\n");
    const res = await run(
      r,
      commitArgs(r, ...base, "--mode=commit", "--message=book", "--stage-tracked-updates"),
    );
    expect(res.code).toBe(10);
    expect(res.err).toContain("src/a.txt");
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

  // A dirty tracked non-bookkeeping file alone does not exit 6.
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

// The frozen bookkeeping allow-list: every ship stage/commit resolves through
// bookPathspecs — never `-A`, never a bare `docs/`.
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
    // An entry is reached as itself or as its `/*` glob; list every one that is neither.
    const unreached = BOOK_PATHS_ALLOW_LIST.filter((p) => !pr.includes(p)).filter(
      (p) => !pr.includes(`${p}/*`),
    );
    expect(unreached).toEqual([]);
    expect(pr).toContain("docs/plans/202610/logs/1-x/*");
    expect(pr).toContain("docs/*.jsonl"); // .bkit/issues.jsonl's route is the .bkit/*.jsonl glob
  });
});

describe("bkit ledgers append", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const failure = (o: Record<string, unknown> = {}) => ({
    kind: "failure",
    by: { workflow: "build", step: "build-challenge" },
    key: "parser-drops-last-line",
    summary: "parser drops the last line",
    severity: "HIGH",
    status: "OPEN",
    ...o,
  });

  const outcome = (o: Record<string, unknown> = {}) => ({
    kind: "outcome",
    by: { workflow: "build", step: "build-close-workflow" },
    run: { parentSha: "a".repeat(40) },
    time: null,
    ending: "done",
    ledgers: { deferrals: { repo: 0 }, failures: { repo: 0 }, friction: {} },
    ...o,
  });

  async function append(r: string, ledger: string, rows: unknown) {
    const file = path.join(tmp(), "rows.json");
    fs.writeFileSync(file, JSON.stringify(rows));
    return run(r, ["append", `--root=${r}`, `--ledger=${ledger}`, `--rows=${file}`]);
  }

  const lines = (r: string, rel: string) =>
    fs
      .readFileSync(path.join(r, rel), "utf-8")
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as Record<string, unknown>);

  it("append mints ts and fills the top section: schema, repo and bkit.version", async () => {
    const r = repo();
    put(r, ".bkit/version", JSON.stringify({ pinnedVersion: "5.5.1", canonicalHashes: {} }));
    const before = Date.now();
    const res = await append(r, "failures", [failure(), failure({ key: "second" })]);
    expect(res.code).toBe(0);
    expect(res.json).toEqual({
      ledger: "failures",
      file: "docs/failures.jsonl",
      appended: 2,
      keys: ["parser-drops-last-line", "second"],
    });
    const [a, b] = lines(r, "docs/failures.jsonl");
    expect(a.ts).toBeGreaterThanOrEqual(before);
    expect(b.ts).toBeGreaterThan(a.ts as number);
    expect(Object.keys(a).slice(0, 7)).toEqual([
      "schema",
      "ts",
      "kind",
      "key",
      "repo",
      "bkit",
      "by",
    ]);
    expect(a).toMatchObject({
      schema: 3,
      repo: "unknown/repo",
      bkit: { version: "5.5.1" },
      by: { workflow: "build", step: "build-challenge" },
      summary: "parser drops the last line",
    });
  });

  it("append keeps a row's own repo", async () => {
    const r = repo();
    const res = await append(r, "failures", [failure({ repo: "o/r" })]);
    expect(res.code).toBe(0);
    expect(lines(r, "docs/failures.jsonl")[0]).toMatchObject({
      repo: "o/r",
      bkit: { version: "unknown" },
    });
  });

  it("append refuses a supplied ts", async () => {
    const r = repo();
    const res = await append(r, "failures", [failure({ ts: 1787788800123 })]);
    expect(res.code).toBe(EXIT_ROW_REFUSED);
    expect(res.err).toContain("row 1: carries ts");
    expect(fs.existsSync(path.join(r, "docs/failures.jsonl"))).toBe(false);
  });

  it("append refuses a supplied schema or bkit", async () => {
    const r = repo();
    const schema = await append(r, "failures", [failure({ schema: 2 })]);
    expect(schema.code).toBe(EXIT_ROW_REFUSED);
    expect(schema.err).toContain("row 1: carries schema");
    const bkit = await append(r, "failures", [failure(), failure({ bkit: { version: "1.2.3" } })]);
    expect(bkit.code).toBe(EXIT_ROW_REFUSED);
    expect(bkit.err).toContain("row 2: carries bkit");
    expect(fs.existsSync(path.join(r, "docs/failures.jsonl"))).toBe(false);
  });

  it("append refuses a flat top-level field the top section moved into by", async () => {
    const r = repo();
    const res = await append(r, "failures", [failure({ workflow: "build" })]);
    expect(res.code).toBe(EXIT_ROW_REFUSED);
    expect(res.err).toContain("workflow is not a top-level field");
  });

  it("append writes nothing when one row is invalid", async () => {
    const r = repo();
    put(r, "docs/failures.jsonl", '{"kept":true}\n');
    const res = await append(r, "failures", [
      failure(),
      failure({ severity: "SEVERE" }),
      failure(),
    ]);
    expect(res.code).toBe(EXIT_ROW_REFUSED);
    expect(res.err).toContain("row 2:");
    expect(res.err).toContain("severity");
    expect(fs.readFileSync(path.join(r, "docs/failures.jsonl"), "utf-8")).toBe('{"kept":true}\n');
  });

  it("append refuses a row whose kind is not the ledger's", async () => {
    const r = repo();
    const res = await append(r, "knowledge", [failure()]);
    expect(res.code).toBe(EXIT_ROW_REFUSED);
    expect(res.err).toContain("kind must be knowledge in --ledger=knowledge (got failure)");
  });

  it("append --ledger=stats takes compliance, counter and outcome rows", async () => {
    const r = repo();
    const sha = "a".repeat(40);
    const by = { workflow: "build", step: "build-close-workflow" };
    const res = await append(r, "stats", [
      {
        kind: "compliance",
        by,
        run: { parentSha: sha },
        rule: { id: "no-mirror-edit", verdict: "pass" },
      },
      {
        kind: "counter",
        by,
        run: { parentSha: sha },
        counter: { name: "BUILD_ATTEMPT", value: 1, source: "shell-bus" },
      },
      outcome(),
    ]);
    expect(res.code).toBe(0);
    expect(res.json).toMatchObject({ ledger: "stats", file: ".bkit/stats.jsonl", appended: 3 });
    const rows = lines(r, ".bkit/stats.jsonl");
    expect(rows.map((x) => x.kind)).toEqual(["compliance", "counter", "outcome"]);
    expect(rows.map((x) => [x.schema, (x.run as { parentSha: string }).parentSha])).toEqual([
      [3, sha],
      [3, sha],
      [3, sha],
    ]);
  });

  it("append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts", async () => {
    const r = repo();
    const kind = await append(r, "stats", [failure()]);
    expect(kind.code).toBe(EXIT_ROW_REFUSED);
    expect(kind.err).toContain("kind must be compliance | counter | outcome in --ledger=stats");
    const writer = await append(r, "stats", [
      outcome({ by: { workflow: "audit", step: "audit-close" } }),
    ]);
    expect(writer.code).toBe(EXIT_ROW_REFUSED);
    expect(writer.err).toContain("the audit orchestrator does not write outcome rows");
    const none = { added: 0, deleted: 0, files: 0 };
    const totals = await append(r, "stats", [
      outcome({
        lines: {
          total: { added: 5, deleted: 0, changed: 5, files: 1 },
          code: { added: 4, deleted: 0, files: 1 },
          tests: none,
          docs: none,
          merges: 0,
        },
      }),
    ]);
    expect(totals.code).toBe(EXIT_ROW_REFUSED);
    expect(totals.err).toContain("lines.total.added");
    expect(fs.existsSync(path.join(r, ".bkit/stats.jsonl"))).toBe(false);
  });

  it("append bumps a round-second mint", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1787788800000);
    const r = repo();
    const res = await append(r, "failures", [failure()]);
    expect(res.code).toBe(0);
    expect(lines(r, "docs/failures.jsonl")[0].ts).toBe(1787788800001);
  });

  it("append refuses an empty rows file", async () => {
    const r = repo();
    expect((await append(r, "failures", [])).code).toBe(2);
    const empty = path.join(tmp(), "empty.json");
    fs.writeFileSync(empty, "");
    const res = await run(r, ["append", `--root=${r}`, "--ledger=failures", `--rows=${empty}`]);
    expect(res.code).toBe(2);
  });

  it("append refuses an unknown or issues ledger", async () => {
    const r = repo();
    const res = await append(r, "issues", [failure()]);
    expect(res.code).toBe(2);
    expect(res.err).toContain("--ledger must be one of");
  });

  it("append refuses a writer not listed for the kind", async () => {
    const r = repo();
    const knowledge = {
      kind: "knowledge",
      by: { workflow: "build", step: "build-challenge" },
      key: "k",
      summary: "s",
    };
    const as = (subagent: string) => ({
      ...knowledge,
      by: { ...knowledge.by, subagent, model: "m" },
    });
    const bySubagent = await append(r, "knowledge", [as("bkit-plan-generate")]);
    expect(bySubagent.code).toBe(EXIT_ROW_REFUSED);
    expect(bySubagent.err).toContain("subagent bkit-plan-generate does not write knowledge rows");
    const byOrchestrator = await append(r, "knowledge", [knowledge]);
    expect(byOrchestrator.code).toBe(EXIT_ROW_REFUSED);
    expect(byOrchestrator.err).toContain("the build orchestrator does not write knowledge rows");
    expect(fs.existsSync(path.join(r, "docs/knowledge.jsonl"))).toBe(false);
    const ok = await append(r, "knowledge", [as("bkit-utility-update-knowledge")]);
    expect(ok.code).toBe(0);
  });

  it("append starts a new line when the ledger lacks its final newline", async () => {
    const r = repo();
    put(r, "docs/failures.jsonl", '{"kept":true}');
    expect((await append(r, "failures", [failure()])).code).toBe(0);
    expect(lines(r, "docs/failures.jsonl")).toHaveLength(2);
  });

  it("append creates the ledger and its directory", async () => {
    const r = repo();
    const res = await append(r, "friction", [
      {
        kind: "friction",
        by: { workflow: "ship", step: "ship-close-gate" },
        key: "f",
        summary: "s",
        severity: "LOW",
      },
    ]);
    expect(res.code).toBe(0);
    expect(lines(r, ".bkit/friction.jsonl")).toHaveLength(1);
  });
});

describe("bkit ledgers check", () => {
  const row = (kind: string, key: string) =>
    JSON.stringify({ schema: 2, ts: 1792720147039, kind, key, repo: "o/r", summary: key });

  async function check(r: string, plan: string) {
    put(r, "plan.md", `# Plan\n\n## Architecture & Component Changes\n\n${plan}\n`);
    return run(r, ["check", `--root=${r}`, "--plan=plan.md"]);
  }

  it("passes when every key on the Ledger rows line has a decision or deferral row", async () => {
    const r = tmp();
    put(r, "docs/decisions.jsonl", `${row("decision", "1338-skip-line")}\n`);
    put(r, "docs/deferrals.jsonl", `${row("deferral", "1338-later")}\n`);
    const res = await check(r, "**Ledger rows:** `1338-skip-line`, `1338-later`");
    expect(res.code).toBe(0);
    expect(res.json).toEqual({
      plan: "plan.md",
      keys: ["1338-skip-line", "1338-later"],
      missing: [],
    });
  });

  it("names the keys no row carries and exits EXIT_ROWS_MISSING", async () => {
    const r = tmp();
    put(r, "docs/decisions.jsonl", `${row("decision", "1338-skip-line")}\n`);
    put(r, "docs/knowledge.jsonl", `${row("knowledge", "1338-not-a-decision")}\n`);
    const res = await check(r, "**Ledger rows:** `1338-skip-line`, `1338-not-a-decision`");
    expect(res.code).toBe(EXIT_ROWS_MISSING);
    expect(res.json).toMatchObject({ missing: ["1338-not-a-decision"] });
  });

  it("passes on None", async () => {
    const res = await check(tmp(), "**Ledger rows:** None");
    expect(res.code).toBe(0);
    expect(res.json).toMatchObject({ keys: [], missing: [] });
    expect((await check(tmp(), '**Ledger rows:** "None".')).code).toBe(0);
  });

  it("refuses a plan with no Ledger rows line or an unfilled one", async () => {
    expect((await check(tmp(), "No line here.")).code).toBe(EXIT_ROWS_MISSING);
    expect((await check(tmp(), "**Ledger rows:** PENDING")).code).toBe(EXIT_ROWS_MISSING);
  });
});
