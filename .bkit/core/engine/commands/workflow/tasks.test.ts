/**
 * commands/workflow/tasks.test.ts — `bkit tasks`: the plan tick, the group's open set
 * and the path / symbol match against landed changes.
 *
 * Each test writes a plan and (for `open`) an execute log in a temp folder and reads
 * the command's one output object; the plan file's other lines are compared byte for
 * byte, because the tick rewrites one heading line and nothing else. `currency` runs
 * against a real temp git repo: the commit range is its subject, so a stub diff would
 * test nothing.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { tasksCommand } from "./tasks";

const dirs: string[] = [];
const tmp = () => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tasks-")));
  dirs.push(d);
  return d;
};
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  cwd = "";
});

const task = (n: number, tick = " ") => [
  `<!-- bkit:task ${n} start -->`,
  `- [${tick}] **TASK ${n}:** Task ${n} title.`,
  "  - **DONE WHEN:** done",
  "  - **TEST FIRST:** n/a — docs only",
  `<!-- bkit:task ${n} end -->`,
];
const group = (n: number, ...tasks: string[][]) => [
  `<!-- bkit:group ${n} start -->`,
  `### GROUP ${n}: Group ${n} title`,
  "",
  ...tasks.flatMap((t) => [...t, ""]),
  `<!-- bkit:group ${n} end -->`,
];
/** A plan with the given groups and prose after them, so an untouched trailing line is real. */
const planText = (...groups: string[][]) =>
  [
    "# Plan",
    "",
    "## The work",
    "",
    ...groups.flatMap((g) => [...g, ""]),
    "## Tail",
    "",
    "| left | right |",
    "| --- | --- |",
    "| a | b |",
    "",
  ].join("\n");

let cwd = "";
/** The test's temp folder, created on first use. */
const dir = () => {
  if (cwd === "") cwd = tmp();
  return cwd;
};
const write = (name: string, text: string) => {
  const file = path.join(dir(), name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return file;
};
const read = (file: string) => fs.readFileSync(file, "utf-8");

/** git in a fixture repo; a non-zero exit is the fixture's bug, so it throws. */
const git = (repo: string, ...args: string[]) => {
  const r = spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd: repo,
    encoding: "utf-8",
  });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return (r.stdout ?? "").trim();
};
const writeIn = (repo: string, rel: string, body: string) => {
  const abs = path.join(repo, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
};
const commit = (repo: string, message: string) => {
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", message);
  return git(repo, "rev-parse", "HEAD");
};
/** A fixture repo on `main` holding `files`, its first commit made. */
const repo = (files: Record<string, string>) => {
  const d = tmp();
  git(d, "init", "-q", "-b", "main");
  for (const [rel, body] of Object.entries(files)) writeIn(d, rel, body);
  commit(d, "base");
  return d;
};
/** A plan whose one task refs `refs` as `` `symbol` in `file`: what `` UPDATE lines. */
const refPlan = (...refs: string[]) =>
  planText(
    group(1, [
      "<!-- bkit:task 4 start -->",
      "- [ ] **TASK 4:** Currency task.",
      ...refs.map((r) => `  - **UPDATE:** ${r}`),
      "  - **DONE WHEN:** done",
      "  - **TEST FIRST:** n/a — docs only",
      "<!-- bkit:task 4 end -->",
    ]),
  );

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["tasks", ...argv, "--json"], [tasksCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** The heading line of task `n` in `text`: the line a tick rewrites. */
const headOf = (text: string, n: number) =>
  text.split("\n").find((l) => l.includes(`**TASK ${n}:**`))!;
const tickOf = (text: string, n: number) => /^- \[([ x])\]/.exec(headOf(text, n))![1];

describe("bkit tasks tick", () => {
  it("tick marks only the named tasks", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([2]);
    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
      " ",
      "x",
      " ",
    ]);
  });

  it("tick refuses a task in another group", async () => {
    const text = planText(group(1, task(1)), group(2, task(2)));
    const plan = write("other-group.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("TASK 2");
    expect(r.err).toContain("group 2");
    expect(read(plan)).toBe(text);
  });

  it("tick refuses a plan with no task blocks", async () => {
    const plan = write("no-blocks.md", "# Plan\n\nNo task blocks here.\n");
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1"]);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/no task markers/);
  });

  it("tick narrows the group's gap-free tasks by --tasks", async () => {
    const plan = write("gapped.md", planText(group(1, task(1), task(2))));
    const green = write(
      "green.md",
      [
        "Enforced: true",
        "Verdict: CONCERNS",
        "Gaps: 1",
        "",
        "<!-- verdict:end -->",
        "",
        "## Gaps",
        "",
        "- Task 2 `not-green` — `.bkit/x.test.ts` `b` does not exist — Fixable: true — log: TASK 2: not-green",
        "",
      ].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2", `--green=${green}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1]);
    expect(tickOf(read(plan), 2)).toBe(" ");
  });

  it("tick is idempotent on an already-ticked task", async () => {
    const plan = write("idempotent.md", planText(group(1, task(1), task(2))));
    const first = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2"]);
    expect(first.code).toBe(0);
    const once = read(plan);
    const second = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2"]);
    expect(second.code).toBe(0);
    expect(second.json.ticked).toEqual([]);
    expect(read(plan)).toBe(once);
  });

  it("tick refuses a --tasks value that is not a task number", async () => {
    const text = planText(group(1, task(1)));
    const plan = write("bad-number.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=one"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("--tasks");
    expect(read(plan)).toBe(text);
  });

  it("tick refuses a --plan that is no file", async () => {
    dir();
    const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("no-such-plan.md");
  });

  it("tick treats the header's none as nothing to tick", async () => {
    const text = planText(group(1, task(1), task(2)));
    const plan = write("none.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=none"]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([]);
    expect(read(plan)).toBe(text);
  });

  it("tick leaves every other plan line byte-identical", async () => {
    const text = planText(group(1, task(1), task(2)), group(2, task(3)));
    const plan = write("bytes.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
    expect(r.code).toBe(0);
    const after = read(plan).split("\n");
    const before = text.split("\n");
    expect(after).toHaveLength(before.length);
    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
  });

  it("tick refuses a call with no --group or with neither selector", async () => {
    const text = planText(group(1, task(1)));
    const plan = write("no-group.md", text);
    const noGroup = await run(["tick", `--plan=${plan}`, "--tasks=1"]);
    expect(noGroup.code).toBe(2);
    expect(noGroup.err).toContain("--group");
    const noSelector = await run(["tick", `--plan=${plan}`, "--group=1"]);
    expect(noSelector.code).toBe(2);
    expect(noSelector.err).toMatch(/--tasks|--green/);
    expect(read(plan)).toBe(text);
  });
});

describe("bkit tasks open", () => {
  it("open lists tasks with no done line", async () => {
    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
    const log = write(
      "open-log.md",
      [
        "DONE — TASK 1: First — implemented (a.ts)",
        "BLOCKED — TASK 2: Second — the migration is missing",
        "",
      ].join("\n"),
    );
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([3]);
    expect(r.json.handover).toBe(true);
  });

  it("open sets handover only when a task is open", async () => {
    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
    const log = write(
      "open-all-log.md",
      [
        "DONE — TASK 1: First — implemented (a.ts)",
        "BLOCKED — TASK 2: Second — the migration is missing",
        "",
      ].join("\n"),
    );
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([]);
    expect(r.json.handover).toBe(false);
  });

  it("open lists a ticked task with no log line", async () => {
    const plan = write("open-ticked.md", planText(group(1, task(1, "x"), task(2, "x"))));
    const log = write("open-ticked-log.md", "DONE — TASK 1: First — implemented (a.ts)\n");
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([2]);
    expect(r.json.handover).toBe(true);
  });

  it("open refuses a plan with no task blocks", async () => {
    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
    const log = write("open-plain-log.md", "");
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/no task markers/);
  });
});

describe("bkit tasks currency", () => {
  it("currency matches a task on a moved symbol", async () => {
    cwd = repo({ "src/money.ts": "export const price = 1;\n" });
    const base = git(cwd, "rev-parse", "HEAD");
    writeIn(cwd, "src/money.ts", "export const total = 1;\n");
    commit(cwd, "rename price to total");
    const plan = write(
      "currency-symbol.md",
      refPlan("`total` in `src/money.ts`: renamed from price"),
    );
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
    expect(r.code).toBe(0);
    expect(r.json.tasks.map((t: { task: number }) => t.task)).toEqual([4]);
    expect(r.json.tasks[0].paths).toEqual(["src/money.ts"]);
    expect(r.json.tasks[0].needles).toEqual(["total"]);
    expect(r.json.tasks[0].hunks.join("\n")).toContain("total");
  });

  it("currency emits no hunk outside the matched set", async () => {
    cwd = repo({
      "src/matched.ts": "export const alpha = 1;\n",
      "src/other.ts": "export const beta = 1;\n",
    });
    const base = git(cwd, "rev-parse", "HEAD");
    writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
    writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
    commit(cwd, "both change");
    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
    expect(r.code).toBe(0);
    const hunks = r.json.tasks[0].hunks.join("\n");
    expect(hunks).toContain("src/matched.ts");
    expect(hunks).not.toContain("src/other.ts");
  });

  it("currency refuses a plan with no task blocks", async () => {
    cwd = repo({ "src/x.ts": "x\n" });
    const plan = write("currency-plain.md", "# Plan\n\nNo task blocks here.\n");
    const r = await run(["currency", `--plan=${plan}`]);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/no task markers/);
  });

  it("currency exits 0 with no hunks when no task matches", async () => {
    cwd = repo({ "src/untouched.ts": "one\n", "src/elsewhere.ts": "one\n" });
    const base = git(cwd, "rev-parse", "HEAD");
    writeIn(cwd, "src/elsewhere.ts", "two\n");
    commit(cwd, "elsewhere changed");
    const plan = write(
      "currency-nomatch.md",
      refPlan("`absent` in `src/untouched.ts`: nothing moved"),
    );
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([]);
  });

  it("currency judges base...against (origin/dev), not base...HEAD", async () => {
    cwd = repo({
      "src/base.ts": "base\n",
      "src/dev-moved.ts": "one\n",
      "src/branch-moved.ts": "one\n",
    });
    const base = git(cwd, "rev-parse", "HEAD");
    git(cwd, "checkout", "-q", "-b", "dev");
    writeIn(cwd, "src/dev-moved.ts", "two\n");
    commit(cwd, "dev moves");
    git(cwd, "checkout", "-q", "-b", "feature", base);
    writeIn(cwd, "src/branch-moved.ts", "two\n");
    commit(cwd, "branch moves");
    const plan = write(
      "currency-range.md",
      refPlan(
        "`devMoved` in `src/dev-moved.ts`: moved on dev",
        "`branchMoved` in `src/branch-moved.ts`: moved on the branch",
      ),
    );
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=dev"]);
    expect(r.code).toBe(0);
    expect(r.json.tasks[0].paths).toEqual(["src/dev-moved.ts"]);
    expect(r.json.tasks[0].hunks.join("\n")).not.toContain("branch-moved");
  });
});
