// bkit disk prune: which step files load, which steps run, the daily and hourly limits
// of `--auto`, the one-sweep lock, the notes `bkit tips` shows, and the worktree low-disk
// check. Every step writes a
// marker file in a temp repo; nothing outside the temp folders is touched.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { runTipsCommand } from "../tips";
import {
  diskCommand,
  ensureDiskSpace,
  formatNotes,
  machineStepsPath,
  readNotes,
  REPO_STEPS,
  schedule,
  type Mode,
} from "./disk";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

let cache: string;
beforeEach(() => {
  vi.stubEnv("CI", "");
  vi.stubEnv("CLAUDE_CODE_REMOTE", "");
  vi.stubEnv("CURSOR_REMOTE_AGENT", "");
  vi.stubEnv("XDG_CONFIG_HOME", tmp("bkit-disk-config-"));
  cache = tmp("bkit-disk-cache-");
  vi.stubEnv("XDG_CACHE_HOME", cache);
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** A git repo with `steps` (module source) as its repo step file, when given. */
function repo(steps?: string) {
  const cwd = tmp("bkit-disk-repo-");
  spawnSync("git", ["init", "-q"], { cwd });
  if (steps !== undefined) {
    fs.mkdirSync(path.join(cwd, path.dirname(REPO_STEPS)), { recursive: true });
    fs.writeFileSync(path.join(cwd, REPO_STEPS), steps);
  }
  return cwd;
}

function machineSteps(source: string) {
  fs.mkdirSync(path.dirname(machineStepsPath()), { recursive: true });
  fs.writeFileSync(machineStepsPath(), source);
}

/** A step that appends `name` to `<cwd>/order` — order and cwd both show in the file. */
const marks = (...steps: [string, Mode][]) =>
  `export default [${steps
    .map(([name, mode]) => `{ name: "${name}", mode: "${mode}", run: "echo ${name} >> order" }`)
    .join(", ")}];\n`;
const order = (cwd: string) =>
  fs.existsSync(path.join(cwd, "order"))
    ? fs.readFileSync(path.join(cwd, "order"), "utf-8").trim().split("\n")
    : [];

async function prune(cwd: string, ...argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["disk", "prune", ...argv, "--json"], [diskCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

describe("bkit disk prune — usage", () => {
  it("refuses a mode other than min or max", async () => {
    expect((await prune(repo(), "--mode=all")).code).toBe(2);
  });

  it("refuses --auto with --dry-run", async () => {
    const r = await prune(repo(), "--mode=min", "--auto", "--dry-run");
    expect(r.code).toBe(2);
    expect(r.err).toContain("not both");
  });
});

describe("bkit disk prune — step files", () => {
  it("with no step files runs nothing and names both templates", async () => {
    const r = await prune(repo(), "--mode=max");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ reason: "no-steps", steps: [] });
    expect(r.err).toContain("bkit-disk-prune.mjs");
    expect(r.err).toContain("bkit-disk-prune.machine.mjs");
  });

  it("min runs only min steps; max runs both", async () => {
    const steps = marks(["a", "min"], ["b", "max"], ["c", "min"]);
    const minRepo = repo(steps);
    expect((await prune(minRepo, "--mode=min")).code).toBe(0);
    expect(order(minRepo)).toEqual(["a", "c"]);
    const maxRepo = repo(steps);
    const r = await prune(maxRepo, "--mode=max");
    expect(order(maxRepo)).toEqual(["a", "b", "c"]);
    expect(r.json.steps.map((s: { outcome: string }) => s.outcome)).toEqual(["ran", "ran", "ran"]);
    expect(r.json.freeBefore).toBeGreaterThan(0);
  });

  it("runs repo steps from the checkout top, then machine steps from the home folder", async () => {
    const cwd = repo(
      'export default [{ name: "r", mode: "min", run: ({ cwd }) => { globalThis.diskOrder = [["repo", cwd]]; } }];\n',
    );
    machineSteps(
      'export default [{ name: "m", mode: "min", run: ({ cwd }) => { globalThis.diskOrder.push(["machine", cwd]); } }];\n',
    );
    fs.mkdirSync(path.join(cwd, "sub"));
    expect((await prune(path.join(cwd, "sub"), "--mode=min")).code).toBe(0);
    expect((globalThis as { diskOrder?: unknown }).diskOrder).toEqual([
      ["repo", cwd],
      ["machine", os.homedir()],
    ]);
  });

  it("a failing or throwing step is reported and the next step still runs", async () => {
    const cwd = repo(
      `export default [
        { name: "fails", mode: "min", run: "exit 3" },
        { name: "throws", mode: "min", run: () => { throw new Error("boom"); } },
        { name: "after", mode: "min", run: "echo after >> order" },
      ];\n`,
    );
    const r = await prune(cwd, "--mode=min");
    expect(r.code).toBe(1);
    expect(order(cwd)).toEqual(["after"]);
    expect(r.json.steps).toMatchObject([
      { name: "fails", outcome: "failed", detail: "exit 3" },
      { name: "throws", outcome: "failed", detail: "boom" },
      { name: "after", outcome: "ran" },
    ]);
  });

  it("a broken file is reported and the other file's steps still run", async () => {
    const cwd = repo("export default 'not a list';\n");
    machineSteps(marks(["m", "min"]).replace("echo m >> order", `echo m >> ${cwd}/order`));
    const r = await prune(cwd, "--mode=min");
    expect(r.code).toBe(1);
    expect(r.json.files[0]).toMatchObject({
      scope: "repo",
      error: expect.stringContaining("not a list"),
    });
    expect(order(cwd)).toEqual(["m"]);
  });

  it("drops an invalid step and runs the valid ones", async () => {
    const cwd = repo(
      `export default [{ name: "bad", mode: "sometimes", run: "true" }, { name: "ok", mode: "min", run: "echo ok >> order" }];\n`,
    );
    const r = await prune(cwd, "--mode=max");
    expect(r.code).toBe(1);
    expect(r.json.files[0].error).toContain('mode must be "min" or "max"');
    expect(order(cwd)).toEqual(["ok"]);
  });

  it("skips a step whose skip check says so", async () => {
    const cwd = repo(
      `export default [
        { name: "shell", mode: "min", skip: "true", run: "echo shell >> order" },
        { name: "fn", mode: "min", skip: () => "busy", run: "echo fn >> order" },
        { name: "no", mode: "min", skip: () => false, run: "echo no >> order" },
      ];\n`,
    );
    const r = await prune(cwd, "--mode=min");
    expect(r.code).toBe(0);
    expect(order(cwd)).toEqual(["no"]);
    expect(r.json.steps).toMatchObject([
      { outcome: "skipped" },
      { outcome: "skipped", detail: "busy" },
      { outcome: "ran" },
    ]);
  });

  it("--dry-run runs nothing and sizes each step's paths", async () => {
    const cwd = repo(
      'export default [{ name: "cache", mode: "max", paths: ["cache/*"], run: "rm -rf cache" }];\n',
    );
    fs.mkdirSync(path.join(cwd, "cache"));
    fs.writeFileSync(path.join(cwd, "cache", "big"), Buffer.alloc(64 * 1024));
    const r = await prune(cwd, "--mode=max", "--dry-run");
    expect(r.code).toBe(0);
    expect(fs.existsSync(path.join(cwd, "cache", "big"))).toBe(true);
    expect(r.json.steps[0]).toMatchObject({ outcome: "would-run" });
    expect(r.json.steps[0].bytes).toBeGreaterThanOrEqual(64 * 1024);
  });

  it("runs nothing on CI or in a cloud session", async () => {
    vi.stubEnv("CLAUDE_CODE_REMOTE", "true");
    const cwd = repo(marks(["a", "min"]));
    const r = await prune(cwd, "--mode=min");
    expect(r.json.reason).toBe("ci");
    expect(order(cwd)).toEqual([]);
  });
});

describe("bkit disk prune — lock", () => {
  const lock = () => path.join(cache, "bkit", "disk-prune.lock");
  const holdLock = (pid: number, ageMs = 0) => {
    fs.mkdirSync(path.dirname(lock()), { recursive: true });
    fs.writeFileSync(lock(), `${new Date().toISOString()} ${pid}\n`);
    const t = (Date.now() - ageMs) / 1000;
    fs.utimesSync(lock(), t, t);
  };

  it("does not run while a live sweep holds the lock", async () => {
    holdLock(process.pid);
    const cwd = repo(marks(["a", "min"]));
    const r = await prune(cwd, "--mode=min");
    expect(r.json.reason).toBe("locked");
    expect(order(cwd)).toEqual([]);
    expect(fs.existsSync(lock())).toBe(true);
  });

  it("replaces a lock whose process is gone, or that is an hour old, and releases it", async () => {
    const dead = spawnSync("sh", ["-c", "echo $$"], { encoding: "utf-8" });
    for (const [pid, age] of [
      [Number(dead.stdout.trim()), 0],
      [process.pid, 2 * 60 * 60 * 1000],
    ]) {
      holdLock(pid!, age);
      const cwd = repo(marks(["a", "min"]));
      expect((await prune(cwd, "--mode=min")).json.reason).toBeNull();
      expect(order(cwd)).toEqual(["a"]);
      expect(fs.existsSync(lock())).toBe(false);
    }
  });
});

describe("bkit disk prune --auto", () => {
  const HOUR = 60 * 60 * 1000;
  const plan = (cwd: string, mode: Mode, minFreeGb: number, now = Date.now()) => {
    const started: Mode[] = [];
    const r = schedule({ cwd, mode, minFreeGb, now, start: (m) => started.push(m) });
    return { ...r, calls: started };
  };

  it("starts nothing without step files", () => {
    expect(plan(repo(), "min", 0)).toEqual({ started: null, reason: "no-steps", calls: [] });
  });

  it("starts a mode at most once a day; max also counts as that day's min", () => {
    const cwd = repo(marks(["a", "min"]));
    expect(plan(cwd, "min", 0)).toMatchObject({ started: "min", reason: "due", calls: ["min"] });
    expect(plan(cwd, "min", 0)).toMatchObject({ started: null, reason: "not-due", calls: [] });
    expect(plan(cwd, "max", 0)).toMatchObject({ started: "max", reason: "due" });
    expect(plan(cwd, "max", 0).reason).toBe("not-due");
    expect(plan(cwd, "min", 0, Date.now() + 25 * HOUR).started).toBe("min");
  });

  it("starts max at most hourly while free disk is under the threshold", () => {
    const cwd = repo(marks(["a", "min"]));
    expect(plan(cwd, "min", 1e9)).toMatchObject({ started: "max", reason: "low-disk" });
    expect(plan(cwd, "min", 1e9).reason).toBe("not-due");
    expect(plan(cwd, "min", 1e9, Date.now() + 2 * HOUR).started).toBe("max");
    // The low-disk run also counts as today's min and max.
    expect(plan(cwd, "min", 0).reason).toBe("not-due");
  });

  it("starts nothing on CI", () => {
    vi.stubEnv("CI", "1");
    expect(plan(repo(marks(["a", "min"])), "min", 0).reason).toBe("ci");
  });

  it("always exits 0 and runs no step in the hook's own process", async () => {
    const cwd = repo(marks(["a", "min"]));
    // Threshold 0 and today's min already started, so nothing is spawned from the test.
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { disk: { minFreeGb: 0 } } }),
    );
    plan(cwd, "min", 0);
    const r = await prune(cwd, "--mode=min", "--auto");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "min", started: null, reason: "not-due" });
    expect(order(cwd)).toEqual([]);
  });
});

describe("ensureDiskSpace", () => {
  const check = (cwd: string, minFreeGb: number) =>
    ensureDiskSpace({ cwd, minFreeGb, log: () => {} });

  it("checks nothing without step files", async () => {
    expect(await check(repo(), 1e9)).toBeNull();
  });

  it("runs no step while free disk is over the threshold", async () => {
    const cwd = repo(marks(["a", "max"]));
    expect(await check(cwd, 0)).toBeNull();
    expect(order(cwd)).toEqual([]);
  });

  it("under the threshold runs the max steps, then says why it is still too low", async () => {
    const cwd = repo(marks(["a", "min"], ["b", "max"]));
    const why = await check(cwd, 1e9);
    expect(order(cwd)).toEqual(["a", "b"]);
    expect(why).toContain("still under bkit.disk.minFreeGb");
  });
});

describe("bkit disk prune — notes", () => {
  /** A repo whose one step notes each line of its `to-note` file, `notes` to begin with. */
  const noting = (...notes: string[]) => {
    const cwd = repo(
      `import fs from "node:fs";
      export default [{ name: "n", mode: "min", run: ({ cwd, note }) => {
        for (const n of fs.readFileSync(cwd + "/to-note", "utf-8").split("\\n").filter(Boolean)) note(n);
      } }];\n`,
    );
    toNote(cwd, ...notes);
    return cwd;
  };
  const toNote = (cwd: string, ...notes: string[]) =>
    fs.writeFileSync(path.join(cwd, "to-note"), notes.join("\n"));
  const DAY = 24 * 60 * 60 * 1000;

  it("a sweep reports its notes and keeps them for that checkout until the next sweep", async () => {
    const cwd = noting("one", "two");
    const r = await prune(cwd, "--mode=min");
    expect(r.code).toBe(0);
    expect(r.json.notes).toEqual(["one", "two"]);
    expect(r.err).toContain("to review: one");
    expect(readNotes(cwd)).toEqual(["one", "two"]);
    expect(readNotes(repo())).toEqual([]);

    toNote(cwd);
    await prune(cwd, "--mode=min");
    expect(readNotes(cwd)).toEqual([]);
  });

  it("a dry run keeps no notes", async () => {
    const cwd = noting("one");
    await prune(cwd, "--mode=min", "--dry-run");
    expect(readNotes(cwd)).toEqual([]);
  });

  it("drops notes after 7 days without a sweep", async () => {
    const cwd = noting("one");
    await prune(cwd, "--mode=min");
    expect(readNotes(cwd, Date.now() + 6 * DAY)).toEqual(["one"]);
    expect(readNotes(cwd, Date.now() + 7 * DAY)).toEqual([]);
  });

  it("a worktree of the checkout sees the main checkout's notes", async () => {
    const cwd = noting("one");
    const g = (...args: string[]) =>
      spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], { cwd });
    g("commit", "-q", "--allow-empty", "-m", "init");
    const wt = path.join(tmp("bkit-disk-wt-"), "wt");
    expect(g("worktree", "add", "-q", wt).status).toBe(0);
    await prune(cwd, "--mode=min");
    expect(readNotes(wt)).toEqual(["one"]);
  });

  it("bkit tips prints the notes first, as a list with what to ask", async () => {
    const cwd = noting("`.worktrees/x`: uncommitted files");
    await prune(cwd, "--mode=min");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    runTipsCommand(false, null, cwd);
    const printed = String(log.mock.calls[0]?.[0]);
    log.mockRestore();
    expect(printed.startsWith(formatNotes(["`.worktrees/x`: uncommitted files"]))).toBe(true);
    expect(formatNotes(["a"])).toMatch(
      /^\*\*Found by the disk clean-up[^\n]*\n- a\nAsk your agent/,
    );
    expect(formatNotes([])).toBe("");
  });
});
