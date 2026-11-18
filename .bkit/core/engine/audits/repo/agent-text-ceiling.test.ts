// audits/repo/agent-text-ceiling.test.ts — #1028 — repo-only word ceiling for the text agents read.
//
// Runs scripts/gate/bkit-text-ceiling.mjs as a real process against fixture folders under
// os.tmpdir(). The record holds one ceiling per folder: { workflows: { ceiling, reason },
// prompts: { ceiling, reason } }.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/gate/bkit-text-ceiling.mjs");

const made: string[] = [];
afterEach(() => {
  for (const dir of made.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

const words = (n: number): string => Array.from({ length: n }, (_, i) => `w${i}`).join(" ") + "\n";

interface Fixture {
  root: string;
  record: string;
}

function makeFixture(
  workflowFiles: Record<string, number>,
  promptFiles: Record<string, number>,
  ceilings?: { workflows: number; prompts: number },
): Fixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-text-ceiling-"));
  made.push(root);
  const wf = path.join(root, ".bkit/core/workflows");
  const pr = path.join(root, ".bkit/core/prompts");
  fs.mkdirSync(wf, { recursive: true });
  fs.mkdirSync(pr, { recursive: true });
  for (const [name, n] of Object.entries(workflowFiles))
    fs.writeFileSync(path.join(wf, name), words(n));
  for (const [name, n] of Object.entries(promptFiles))
    fs.writeFileSync(path.join(pr, name), words(n));
  const sum = (o: Record<string, number>): number => Object.values(o).reduce((a, b) => a + b, 0);
  const c = ceilings ?? { workflows: sum(workflowFiles), prompts: sum(promptFiles) };
  const record = path.join(root, "scripts/gate/bkit-text-ceiling.json");
  fs.mkdirSync(path.dirname(record), { recursive: true });
  fs.writeFileSync(
    record,
    JSON.stringify(
      {
        prompts: { ceiling: c.prompts, reason: "prompts reason" },
        workflows: { ceiling: c.workflows, reason: "workflows reason" },
      },
      null,
      2,
    ) + "\n",
  );
  return { root, record };
}

/** process.env without the git variables a hook can leak, so git only sees the fixture repo. */
function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.GIT_DIR;
  delete env.GIT_WORK_TREE;
  delete env.GIT_INDEX_FILE;
  return env;
}

function run(args: string[], fx: Fixture, cwd?: string) {
  const r = spawnSync("node", [SCRIPT, ...args, "--root", fx.root, "--record", fx.record], {
    encoding: "utf-8",
    cwd: cwd ?? fx.root,
    env: cleanEnv(),
  });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

function gitIn(fx: Fixture) {
  return (...a: string[]) => {
    const r = spawnSync(
      "git",
      ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...a],
      { cwd: fx.root, encoding: "utf-8", env: cleanEnv() },
    );
    return { status: r.status, out: `${r.stdout}${r.stderr}` };
  };
}

const promptFile = (fx: Fixture, name: string): string =>
  path.join(fx.root, ".bkit/core/prompts", name);

type Side = (fx: Fixture) => void | Promise<void>;

/** A git repo on branch main with prompts p1.md (5) + p2.md (5) at a committed record of 10. */
function repoFixture() {
  const fx = makeFixture({ "a.md": 10 }, { "p1.md": 5, "p2.md": 5 });
  const git = gitIn(fx);
  expect(git("init", "-q", "-b", "main").status).toBe(0);
  expect(git("add", "-A").status).toBe(0);
  expect(git("commit", "-q", "-m", "baseline").status).toBe(0);
  const commit = async (side: Side, message: string) => {
    await side(fx);
    expect(git("commit", "-q", "-am", message).status).toBe(0);
  };
  const unmergedNames = () =>
    git("diff", "--name-only", "--diff-filter=U").out.trim().split("\n").filter(Boolean);
  return { fx, git, commit, unmergedNames };
}

/**
 * repoFixture, branch `b` from it, `sideA` committed on main and `sideB` on `b`, then
 * `git merge b` on main, or with `rebase`, `git rebase main` on `b`.
 */
async function mergeFixture(sideA: Side, sideB: Side, mode: "merge" | "rebase" = "merge") {
  const { fx, git, commit, unmergedNames } = repoFixture();
  expect(git("branch", "b").status).toBe(0);
  await commit(sideA, "side a");
  expect(git("checkout", "-q", "b").status).toBe(0);
  await commit(sideB, "side b");
  const setup = mode === "merge" ? [["checkout", "-q", "main"]] : [];
  for (const args of setup) expect(git(...args).status).toBe(0);
  const merge =
    mode === "merge" ? git("merge", "-q", "--no-edit", "b") : git("rebase", "-q", "main");
  return { fx, git, merge, unmerged: unmergedNames() };
}

const shorten = (name: string, n: number) => (fx: Fixture) => {
  fs.writeFileSync(promptFile(fx, name), words(n));
  expect(run(["lower"], fx).status).toBe(0);
};

const raiseTo = (name: string, n: number, reason: string) => async (fx: Fixture) => {
  fs.writeFileSync(promptFile(fx, name), words(n));
  await callRaise({ root: fx.root, record: fx.record, reason, confirm: () => true });
};

const RECORD = "scripts/gate/bkit-text-ceiling.json";

interface RaiseOptions {
  root: string;
  record: string;
  reason: string;
  confirm: (...shown: unknown[]) => boolean | Promise<boolean>;
}

/** The script's exported write path for `raise`: takes the typed confirmation as a callback. */
async function callRaise(opts: RaiseOptions): Promise<void> {
  const mod: { raiseCeilings?: (o: RaiseOptions) => unknown } = await import(
    pathToFileURL(SCRIPT).href
  );
  expect(typeof mod.raiseCeilings).toBe("function");
  await Promise.resolve(mod.raiseCeilings?.(opts));
}

function readRecord(fx: Fixture): {
  workflows: { ceiling: number; reason: string };
  prompts: { ceiling: number; reason: string };
} {
  return JSON.parse(fs.readFileSync(fx.record, "utf-8"));
}

describe("bkit-text-ceiling check", () => {
  it("fails above the ceiling and names total, ceiling, grown files and the raise command", () => {
    const fx = makeFixture(
      { "a.md": 10, "b.md": 10 },
      { "p.md": 5 },
      { workflows: 12, prompts: 5 },
    );
    const r = run(["check"], fx);
    expect(r.status).toBe(1);
    expect(r.out).toContain("20");
    expect(r.out).toContain("12");
    expect(r.out).toMatch(/\b8\b/);
    expect(r.out).toMatch(/a\.md|b\.md/);
    expect(r.out).not.toContain('raise --reason "<why>"');
    expect(r.out).toContain("pnpm bkit:text:ceiling raise --reason");
    expect(r.out.toLowerCase()).toContain("only the owner");
    expect(r.out.toLowerCase()).toContain("terminal");
  });

  it("passes when a total equals its ceiling", () => {
    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 });
    const r = run(["check"], fx);
    expect(r.status).toBe(0);
  });

  it("fails below the ceiling and names the lower command", () => {
    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 }, { workflows: 10, prompts: 9 });
    const r = run(["check"], fx);
    expect(r.status).toBe(1);
    expect(r.out).toContain("pnpm bkit:text:ceiling lower");
  });

  it("names only the files that grew since the record's last commit", () => {
    const fx = makeFixture({ "grew.md": 10, "same.md": 10 }, { "p.md": 5 });
    const git = (...a: string[]) =>
      spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...a], {
        cwd: fx.root,
        encoding: "utf-8",
      });
    expect(git("init", "-q").status).toBe(0);
    expect(git("add", "-A").status).toBe(0);
    expect(git("commit", "-q", "-m", "baseline").status).toBe(0);
    fs.writeFileSync(path.join(fx.root, ".bkit/core/workflows/grew.md"), words(25));
    const r = run(["check"], fx);
    expect(r.status).toBe(1);
    expect(r.out).toContain("grew.md");
    expect(r.out).not.toContain("same.md");
  });
});

describe("bkit-text-ceiling lower and raise", () => {
  it("raise without a reason refuses and leaves the record unchanged", async () => {
    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
    const before = fs.readFileSync(fx.record, "utf-8");
    await expect(
      callRaise({ root: fx.root, record: fx.record, reason: "", confirm: () => true }),
    ).rejects.toThrow(/reason/);
    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
    await expect(
      callRaise({ root: fx.root, record: fx.record, reason: "  ", confirm: () => true }),
    ).rejects.toThrow(/reason/);
    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
  });

  it("raise with a reason rewrites both ceilings and stores the reason on the folder that grew", async () => {
    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
    await callRaise({
      root: fx.root,
      record: fx.record,
      reason: "needed for new step",
      confirm: () => true,
    });
    const rec = readRecord(fx);
    expect(rec.workflows.ceiling).toBe(20);
    expect(rec.prompts.ceiling).toBe(5);
    expect(rec.workflows.reason).toBe("needed for new step");
    expect(rec.prompts.reason).toBe("prompts reason");
    expect(run(["check"], fx).status).toBe(0);
  });

  it("raise from a non-interactive caller refuses and leaves the record unchanged", () => {
    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
    const before = fs.readFileSync(fx.record, "utf-8");
    const variants: { extra: string[]; env: Record<string, string> }[] = [
      { extra: [], env: {} },
      { extra: ["--yes"], env: {} },
      { extra: ["--force"], env: {} },
      { extra: [], env: { CI: "1" } },
    ];
    for (const v of variants) {
      const r = spawnSync(
        "node",
        [SCRIPT, "raise", "--reason", "x", ...v.extra, "--root", fx.root, "--record", fx.record],
        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "RAISE\n" },
      );
      expect(r.status).not.toBe(0);
      expect(r.status).not.toBeNull();
      expect(r.stdout + r.stderr).toMatch(/runs only at a terminal/);
      expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
    }
  });

  it("raise at a terminal shows the old and new ceilings and writes only after the typed confirmation", async () => {
    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
    const before = fs.readFileSync(fx.record, "utf-8");
    const shown: string[] = [];
    await expect(
      callRaise({
        root: fx.root,
        record: fx.record,
        reason: "needed",
        confirm: (...a) => {
          shown.push(JSON.stringify(a));
          return false;
        },
      }),
    ).rejects.toThrow(/cancelled|confirmation/);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.join("\n")).toContain("10");
    expect(shown.join("\n")).toContain("20");
    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
    await callRaise({
      root: fx.root,
      record: fx.record,
      reason: "needed",
      confirm: () => true,
    });
    expect(readRecord(fx).workflows.ceiling).toBe(20);
  });

  it("check run through a symlinked script path still starts and exits 1 above the ceiling", () => {
    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
    const link = path.join(fx.root, "linked-script.mjs");
    fs.symlinkSync(SCRIPT, link);
    const r = spawnSync("node", [link, "check", "--root", fx.root, "--record", fx.record], {
      encoding: "utf-8",
      cwd: fx.root,
    });
    expect(r.status).toBe(1);
  });

  it("lower rewrites both ceilings and keeps each reason", () => {
    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 }, { workflows: 30, prompts: 9 });
    const r = run(["lower"], fx);
    expect(r.status).toBe(0);
    const rec = readRecord(fx);
    expect(rec.workflows.ceiling).toBe(10);
    expect(rec.prompts.ceiling).toBe(5);
    expect(rec.workflows.reason).toBe("workflows reason");
    expect(rec.prompts.reason).toBe("prompts reason");
    expect(run(["check"], fx).status).toBe(0);
  });

  it("lower refuses when a total is above its ceiling", () => {
    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 9 });
    const before = fs.readFileSync(fx.record, "utf-8");
    const r = run(["lower"], fx);
    expect(r.status).toBe(1);
    expect(r.out).toContain("raise --reason");
    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
  });
});

describe("bkit-text-ceiling missing folders and a broken record", () => {
  it("check fails and lower refuses when a text folder is missing or empty", () => {
    for (const mode of ["missing", "empty"] as const) {
      const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 });
      const dir = path.join(fx.root, ".bkit/core/prompts");
      fs.rmSync(path.join(dir, "p.md"));
      const removed = { missing: dir, empty: path.join(dir, "none") };
      fs.rmSync(removed[mode], { recursive: true, force: true });
      const before = fs.readFileSync(fx.record, "utf-8");
      const c = run(["check"], fx);
      expect(c.status).toBe(1);
      expect(c.out).toContain(".bkit/core/prompts");
      for (const args of [["lower"], ["raise", "--reason", "why"]]) {
        const r = run(args, fx);
        expect(r.status).not.toBe(0);
        expect(r.out).toContain(".bkit/core/prompts");
        expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
      }
    }
  });

  it("check, lower and raise each fail with one line naming the record when it is not valid JSON", () => {
    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 });
    fs.writeFileSync(
      fx.record,
      '{\n<<<<<<< HEAD\n  "prompts": { "ceiling": 5, "reason": "a" },\n=======\n  "prompts": { "ceiling": 4, "reason": "b" },\n>>>>>>> other\n}\n',
    );
    const before = fs.readFileSync(fx.record, "utf-8");
    for (const args of [["check"], ["lower"], ["raise", "--reason", "why"]]) {
      const r = run(args, fx);
      expect(r.status).not.toBe(0);
      expect(r.status).not.toBeNull();
      const lines = r.out.split("\n").filter((l) => l.trim() !== "");
      expect(lines).toHaveLength(1);
      expect(r.out).toContain("scripts/gate/bkit-text-ceiling.json");
      expect(r.out).toContain("not valid JSON");
      expect(r.out).toContain("restore it from a commit where it is valid");
      expect(r.out).toContain("pnpm bkit:text:ceiling lower");
      expect(r.out).not.toContain("Take either side");
      expect(r.out).not.toContain("SyntaxError");
      expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
    }
  });

  it("the not-valid-JSON line names the --record path the script read", () => {
    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 });
    const other = { root: fx.root, record: path.join(fx.root, "elsewhere/ceiling-record.json") };
    fs.mkdirSync(path.dirname(other.record), { recursive: true });
    fs.writeFileSync(other.record, "{ not json\n");
    const r = run(["check"], other);
    expect(r.status).toBe(1);
    expect(r.out).toContain("elsewhere/ceiling-record.json");
    expect(r.out).not.toContain("scripts/gate/bkit-text-ceiling.json");
  });
});

describe("bkit-text-ceiling on a record in a merge conflict", () => {
  it("merging two branches that each lowered the prompts ceiling leaves a record that check passes", async () => {
    const { fx, git, merge, unmerged } = await mergeFixture(
      shorten("p1.md", 3),
      shorten("p2.md", 4),
    );
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual(["scripts/gate/bkit-text-ceiling.json"]);
    const r = run(["lower"], fx);
    expect(r.out).toContain("git add scripts/gate/bkit-text-ceiling.json");
    expect(r.status).toBe(0);
    expect(git("ls-files", "-u", "--", RECORD).out).toContain(RECORD);
    expect(git("add", "scripts/gate/bkit-text-ceiling.json").status).toBe(0);
    expect(run(["check"], fx).status).toBe(0);
    expect(readRecord(fx).prompts.ceiling).toBe(7);
    expect(readRecord(fx).prompts.reason).toBe("prompts reason");
  });

  it("lower settles a rebase conflict between two lowering branches to a record check passes", async () => {
    const { fx, git, merge, unmerged } = await mergeFixture(
      shorten("p1.md", 3),
      shorten("p2.md", 4),
      "rebase",
    );
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual([RECORD]);
    expect(run(["lower"], fx).status).toBe(0);
    expect(git("add", RECORD).status).toBe(0);
    expect(run(["check"], fx).status).toBe(0);
    expect(readRecord(fx).prompts.ceiling).toBe(7);
  });

  it("lower applies the merge rule to a rebase that carries a raise above ours' ceiling", async () => {
    const { fx, merge, unmerged } = await mergeFixture(
      shorten("p1.md", 3),
      raiseTo("p2.md", 9, "rebased raise"),
      "rebase",
    );
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual([RECORD]);
    const r = run(["lower"], fx);
    expect(r.status).toBe(0);
    expect(r.out).toContain("settled from both sides of the merge");
    expect(readRecord(fx).prompts.ceiling).toBe(12);
    expect(readRecord(fx).prompts.reason).toBe("rebased raise");
  });

  it("lower keeps the reason of theirs when theirs is higher and settles a total below the allowed number to the total", async () => {
    const { fx, merge, unmerged } = await mergeFixture(
      shorten("p1.md", 3),
      raiseTo("p2.md", 9, "theirs raise"),
    );
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual([RECORD]);
    fs.writeFileSync(promptFile(fx, "p1.md"), words(2));
    expect(run(["lower"], fx).status).toBe(0);
    expect(readRecord(fx).prompts.ceiling).toBe(11);
    expect(readRecord(fx).prompts.reason).toBe("theirs raise");
  });

  it("lower keeps the reason of ours when both sides hold the same ceiling", async () => {
    const { fx, merge, unmerged } = await mergeFixture(
      raiseTo("p1.md", 7, "ours raise"),
      raiseTo("p2.md", 7, "theirs raise"),
    );
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual([RECORD]);
    fs.writeFileSync(promptFile(fx, "p1.md"), words(5));
    expect(run(["lower"], fx).status).toBe(0);
    expect(readRecord(fx).prompts.ceiling).toBe(12);
    expect(readRecord(fx).prompts.reason).toBe("ours raise");
  });

  it("a record checked out from one side but still unmerged is a merge conflict, and lower uses the stages", async () => {
    const { fx, git, merge, unmerged } = await mergeFixture(
      shorten("p1.md", 3),
      raiseTo("p2.md", 9, "theirs raise"),
    );
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual([RECORD]);
    expect(git("checkout", "--theirs", "--", RECORD).status).toBe(0);
    expect(readRecord(fx).prompts.ceiling).toBe(14);
    const c = run(["check"], fx);
    expect(c.status).toBe(1);
    expect(c.out).toContain("is in a merge conflict");
    expect(c.out).toContain("pnpm bkit:text:ceiling lower");
    fs.writeFileSync(promptFile(fx, "p1.md"), words(4));
    const before = fs.readFileSync(fx.record);
    const r = run(["lower"], fx);
    expect(r.status).toBe(1);
    expect(r.out).toContain("allowed 12");
    expect(fs.readFileSync(fx.record).equals(before)).toBe(true);
  });

  it("lower carries an owner raise on one side through a merge with a lowered other side", async () => {
    const { fx, git, merge, unmerged } = await mergeFixture(
      async (f) => {
        fs.writeFileSync(promptFile(f, "p1.md"), words(8));
        await callRaise({
          root: f.root,
          record: f.record,
          reason: "owner raise",
          confirm: () => true,
        });
      },
      shorten("p2.md", 4),
    );
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual(["scripts/gate/bkit-text-ceiling.json"]);
    const r = run(["lower"], fx);
    expect(r.status).toBe(0);
    expect(git("add", "scripts/gate/bkit-text-ceiling.json").status).toBe(0);
    expect(run(["check"], fx).status).toBe(0);
    expect(readRecord(fx).prompts.ceiling).toBe(12);
    expect(readRecord(fx).prompts.reason).toBe("owner raise");
  });

  it("lower refuses a merged total above what both sides allow and leaves the conflicted record unchanged", async () => {
    const { fx, merge } = await mergeFixture(shorten("p1.md", 3), shorten("p2.md", 4));
    expect(merge.status).not.toBe(0);
    fs.writeFileSync(promptFile(fx, "p1.md"), words(6));
    const before = fs.readFileSync(fx.record);
    const r = run(["lower"], fx);
    expect(r.status).toBe(1);
    expect(fs.readFileSync(fx.record).equals(before)).toBe(true);
    expect(r.out).toContain("10 words");
    expect(r.out).toContain("allowed 7");
    expect(r.out).toContain("ours 8 + theirs 9 - base 10 = 7");
    expect(r.out).toContain("Only the owner raises the ceiling");
    expect(r.out).not.toContain('--reason "<why>"');
  });

  it("lower refuses when both sides raised and the merged total is above the higher side", async () => {
    const grow = (name: string, n: number) => async (f: Fixture) => {
      fs.writeFileSync(promptFile(f, name), words(n));
      await callRaise({ root: f.root, record: f.record, reason: "raise", confirm: () => true });
    };
    const { fx, merge, unmerged } = await mergeFixture(grow("p1.md", 8), grow("p2.md", 7));
    expect(merge.status).not.toBe(0);
    expect(unmerged).toEqual(["scripts/gate/bkit-text-ceiling.json"]);
    const before = fs.readFileSync(fx.record);
    const r = run(["lower"], fx);
    expect(r.status).toBe(1);
    expect(fs.readFileSync(fx.record).equals(before)).toBe(true);
    expect(r.out).toContain("15 words");
    expect(r.out).toContain("allowed 13");
    expect(r.out).toContain("ours 13 + theirs 12 - base 10 = 15");
    expect(r.out).toContain("higher side 13");
    expect(r.out).not.toContain('--reason "<why>"');
  });

  it("lower refuses while a text file is still unmerged", async () => {
    const { fx, merge, unmerged } = await mergeFixture(shorten("p1.md", 3), shorten("p1.md", 4));
    expect(merge.status).not.toBe(0);
    expect(unmerged).toContain(".bkit/core/prompts/p1.md");
    const before = fs.readFileSync(fx.record);
    const r = run(["lower"], fx);
    expect(r.status).toBe(1);
    expect(r.out.split("\n").filter((l) => l.trim() !== "")).toHaveLength(1);
    expect(r.out).toContain(".bkit/core/prompts/p1.md");
    expect(r.out).toContain("unmerged");
    expect(fs.readFileSync(fx.record).equals(before)).toBe(true);
  });

  it("check and raise on a record in a merge conflict name the lower command", async () => {
    const { fx, merge } = await mergeFixture(shorten("p1.md", 3), shorten("p2.md", 4));
    expect(merge.status).not.toBe(0);
    const before = fs.readFileSync(fx.record);
    const c = run(["check"], fx);
    expect(c.status).toBe(1);
    expect(c.out.split("\n").filter((l) => l.trim() !== "")).toHaveLength(1);
    expect(c.out).toContain("is in a merge conflict");
    expect(c.out).toContain("resolve the text files");
    expect(c.out).toContain("pnpm bkit:text:ceiling lower");
    expect(c.out).not.toContain("Take either side");
    await expect(
      callRaise({ root: fx.root, record: fx.record, reason: "why", confirm: () => true }),
    ).rejects.toThrow(/is in a merge conflict.*pnpm bkit:text:ceiling lower/);
    expect(fs.readFileSync(fx.record).equals(before)).toBe(true);
  });
});

describe("bkit-text-ceiling on a record conflict that is not a merge or a rebase", () => {
  const OURS_ONLY = "only a merge or a rebase carries a raise from the other side";

  /** main: A trims p1 to 1 (record 6), B trims p2 to 4 (record 5); `replay` then undoes A. */
  async function lowerUndone(
    replay: (repo: ReturnType<typeof repoFixture>) => { status: number | null },
  ) {
    const repo = repoFixture();
    await repo.commit(shorten("p1.md", 1), "A");
    await repo.commit(shorten("p2.md", 4), "B");
    expect(replay(repo).status).not.toBe(0);
    expect(repo.unmergedNames()).toEqual([RECORD]);
    return repo;
  }

  /** main: A grows p1 to 7 and raises (record 12), B trims p2 to 4 (record 11), then reverts A. */
  async function raiseReverted() {
    const repo = repoFixture();
    await repo.commit(raiseTo("p1.md", 7, "owner raise"), "A");
    await repo.commit(shorten("p2.md", 4), "B");
    expect(repo.git("revert", "--no-edit", "HEAD~1").status).not.toBe(0);
    expect(repo.unmergedNames()).toEqual([RECORD]);
    return repo;
  }

  /** main: R grows p1 to 7 and raises (record 12), C trims p1 to 5 and p2 to 4 (record 9). */
  async function raiseLanded() {
    const repo = repoFixture();
    await repo.commit(raiseTo("p1.md", 7, "owner raise"), "R");
    const sha = repo.git("rev-parse", "HEAD").out.trim();
    await repo.commit((f) => {
      fs.writeFileSync(promptFile(f, "p1.md"), words(5));
      shorten("p2.md", 4)(f);
    }, "C");
    return { ...repo, sha };
  }

  function expectRefused(fx: Fixture, allowed: number) {
    const before = fs.readFileSync(fx.record);
    const r = run(["lower"], fx);
    expect(r.status).toBe(1);
    expect(fs.readFileSync(fx.record).equals(before)).toBe(true);
    expect(r.out).toContain(`allowed ${allowed}`);
    expect(r.out).toContain(OURS_ONLY);
    expect(r.out).toContain("Only the owner raises the ceiling");
    return r;
  }

  it("lower refuses a revert conflict whose merge-rule allowance is above ours' ceiling", async () => {
    const { fx } = await lowerUndone((repo) => repo.git("revert", "--no-edit", "HEAD~1"));
    expect(expectRefused(fx, 5).out).toContain("9 words");
  });

  it("lower refuses a replay that leaves no state file above the ours-only allowance", async () => {
    const { fx } = await lowerUndone((repo) => {
      const patch = path.join(scratchDir(), "undo-a.patch");
      fs.writeFileSync(patch, repo.git("diff", "--binary", "HEAD~1", "HEAD~2").out);
      return repo.git("apply", "-3", patch);
    });
    expect(expectRefused(fx, 5).out).toContain("9 words");
  });

  it("lower settles a revert of a raise at ours' ceiling less the lowering theirs carries", async () => {
    const { fx } = await raiseReverted();
    const r = run(["lower"], fx);
    expect(r.status).toBe(0);
    expect(r.out).toContain("settled against this branch's own ceiling");
    expect(r.out).toContain(`git add ${RECORD}`);
    expect(readRecord(fx).prompts.ceiling).toBe(9);
  });

  it("lower refuses a revert of a raise whose total sits between that allowance and ours' ceiling", async () => {
    const { fx } = await raiseReverted();
    fs.writeFileSync(promptFile(fx, "p1.md"), words(6));
    expect(expectRefused(fx, 9).out).toContain("ours 11 + theirs 10 - base 12 = 9");
  });

  it("lower refuses a cherry-pick of a raise that already landed", async () => {
    const { fx, git, sha, unmergedNames } = await raiseLanded();
    expect(git("cherry-pick", sha).status).not.toBe(0);
    expect(unmergedNames()).toEqual([RECORD]);
    expectRefused(fx, 9);
  });

  it("lower refuses a revert run while a rebase is paused", async () => {
    const { fx } = await lowerUndone((repo) => {
      expect(repo.git("rebase", "-q", "--exec", "false", "HEAD~1").status).not.toBe(0);
      return repo.git("revert", "--no-edit", "HEAD~1");
    });
    expect(expectRefused(fx, 5).out).toContain("9 words");
  });

  it("lower refuses a cherry-pick -n run while a rebase is paused", async () => {
    const { fx, git, sha, unmergedNames } = await raiseLanded();
    expect(git("rebase", "-q", "--exec", "false", "HEAD~1").status).not.toBe(0);
    expect(git("cherry-pick", "-n", sha).status).not.toBe(0);
    expect(unmergedNames()).toEqual([RECORD]);
    expectRefused(fx, 9);
  });

  it("lower refuses git am -3 of a raise patch that already landed", async () => {
    const { fx, git, sha, unmergedNames } = await raiseLanded();
    const patch = path.join(scratchDir(), "raise.patch");
    fs.writeFileSync(patch, git("format-patch", "-1", "--stdout", sha).out);
    expect(git("am", "-3", patch).status).not.toBe(0);
    expect(unmergedNames()).toEqual([RECORD]);
    expectRefused(fx, 9);
  });
});

/** A fresh scratch folder outside the fixture repo, removed after the test. */
function scratchDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-text-ceiling-patch-"));
  made.push(dir);
  return dir;
}

describe("bkit-text-ceiling on the real repo", () => {
  it("bkit's own workflow and prompt folders sit exactly at the committed ceilings", () => {
    const r = spawnSync("node", [SCRIPT, "check"], { encoding: "utf-8", cwd: path.resolve(".") });
    expect(`${r.stdout}${r.stderr}`).not.toContain("raise --reason");
    expect(r.status).toBe(0);
  });
});
