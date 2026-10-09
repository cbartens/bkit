import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  CommandError,
  EXIT,
  SKIP_CI_TOKEN,
  commandHelp,
  parseFlags,
  repoRoot,
  runCommand,
  statusLocation,
  utcMonth,
  verbHelp,
  type CommandSpec,
  type FlagSpec,
} from "./lib";

const FLAGS: FlagSpec[] = [
  { name: "fid", type: "string", required: true, help: "feature id" },
  { name: "sub-plan", type: "string", help: "sub-plan number" },
  { name: "artifact", type: "string", repeatable: true, help: "artifact path" },
  { name: "dry-run", type: "boolean", help: "report only" },
];

const usage = (fn: () => unknown) => {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(CommandError);
    expect((err as CommandError).code).toBe(EXIT.USAGE);
    return (err as CommandError).message;
  }
  throw new Error("expected a usage error");
};

describe("parseFlags", () => {
  it("accepts --flag=value and --flag value, camelCases kebab names", () => {
    expect(parseFlags(["--fid=467", "--sub-plan", "2"], FLAGS)).toEqual({
      fid: "467",
      subPlan: "2",
    });
  });

  it("collects repeatable flags and sets booleans", () => {
    expect(parseFlags(["--fid=1", "--artifact=a", "--artifact", "b", "--dry-run"], FLAGS)).toEqual({
      fid: "1",
      artifact: ["a", "b"],
      dryRun: true,
    });
  });

  it.each([
    [["--fid=1", "--nope=x"], "unknown flag --nope"],
    [["--sub-plan=1"], "missing required flag --fid"],
    [["--fid=1", "--fid=2"], "--fid given twice"],
    [["--fid"], "--fid needs a value"],
    [["--fid", "--dry-run"], "--fid needs a value"],
    [["--fid=1", "--dry-run=yes"], "--dry-run takes no value"],
    [["467"], 'unexpected argument "467" — commands take flags only'],
  ])("%j is a usage error", (argv, message) => {
    expect(usage(() => parseFlags(argv, FLAGS))).toBe(message);
  });
});

const CMD: CommandSpec = {
  noun: "widgets",
  summary: "Count widgets.",
  verbs: {
    count: {
      summary: "Count them.",
      flags: FLAGS,
      output: { count: "how many" },
      exitCodes: { 3: "no widgets at all" },
      run: (ctx) => {
        ctx.log(`counting ${String(ctx.flags.fid)}`);
        ctx.emit({ count: 2 });
        return ctx.flags.dryRun ? 3 : EXIT.OK;
      },
    },
    twice: {
      summary: "Emits twice.",
      flags: [],
      output: {},
      run: (ctx) => {
        ctx.emit({});
        ctx.emit({});
        return EXIT.OK;
      },
    },
    fails: {
      summary: "Refuses.",
      flags: [],
      output: {},
      run: () => {
        throw new CommandError(EXIT.NEEDS_HUMAN, "a human has to look");
      },
    },
  },
};

const STATUS_CMD: CommandSpec = { ...CMD, noun: "status" };

function harness() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    out,
    err,
    run: (argv: string[], commands: CommandSpec[] = [CMD, STATUS_CMD]) =>
      runCommand(argv, commands, {
        classicVerbs: new Set(["status"]),
        io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
      }),
  };
}

describe("runCommand", () => {
  it("returns null for anything that is not a registered noun", async () => {
    expect(await harness().run(["install", "--claude"])).toBeNull();
  });

  it("runs a verb: one JSON object on stdout, tagged log on stderr", async () => {
    const h = harness();
    expect(await h.run(["widgets", "count", "--fid=467"])).toBe(EXIT.OK);
    expect(h.out).toEqual(['{"count":2}\n']);
    expect(h.err).toEqual(["[bkit-widgets] counting 467\n"]);
  });

  it("passes the verb's own exit code through", async () => {
    expect(await harness().run(["widgets", "count", "--fid=1", "--dry-run"])).toBe(3);
  });

  it("maps a usage error to exit 2 with a tagged message", async () => {
    const h = harness();
    expect(await h.run(["widgets", "count"])).toBe(EXIT.USAGE);
    expect(h.err).toEqual(["[bkit-widgets] missing required flag --fid\n"]);
  });

  it("maps a CommandError to its code", async () => {
    const h = harness();
    expect(await h.run(["widgets", "fails"])).toBe(EXIT.NEEDS_HUMAN);
    expect(h.err).toEqual(["[bkit-widgets] a human has to look\n"]);
  });

  it("refuses a second JSON object", async () => {
    await expect(harness().run(["widgets", "twice"])).rejects.toThrow("emitted twice");
  });

  it("prints noun help: exit 0 for --help, exit 2 for no verb", async () => {
    const h = harness();
    expect(await h.run(["widgets", "--help"])).toBe(EXIT.OK);
    expect(await h.run(["widgets"])).toBe(EXIT.USAGE);
    expect(h.out[0]).toContain("Exit codes:");
  });

  it("rejects an unknown verb", async () => {
    const h = harness();
    expect(await h.run(["widgets", "nope"])).toBe(EXIT.USAGE);
    expect(h.err[0]).toContain('unknown verb "nope"');
  });

  it("prints verb help without running the verb", async () => {
    const h = harness();
    expect(await h.run(["widgets", "count", "--help"])).toBe(EXIT.OK);
    expect(h.out[0]).toBe(verbHelp(CMD, "count"));
    expect(h.err).toEqual([]);
  });

  it("leaves a classic verb alone unless the second word is one of the command's verbs", async () => {
    const h = harness();
    expect(await h.run(["status"])).toBeNull();
    expect(await h.run(["status", "--help"])).toBeNull();
    expect(await h.run(["status", "count", "--fid=1"])).toBe(EXIT.OK);
  });
});

describe("help", () => {
  it("noun help lists every verb and the shared exit codes", () => {
    const help = commandHelp(CMD);
    for (const v of ["count", "twice", "fails"]) expect(help).toContain(v);
    for (const code of ["0", "1", "2", "80", "81", "82"])
      expect(help).toMatch(new RegExp(`^  ${code} `, "m"));
  });

  it("verb help lists flags with required / repeatable, output keys, and own exit codes", () => {
    const help = verbHelp(CMD, "count");
    expect(help).toContain("--fid=<value>");
    expect(help).toContain("feature id (required)");
    expect(help).toContain("artifact path (repeatable)");
    expect(help).toContain("--dry-run ");
    expect(help).toMatch(/^ {2}count +how many$/m);
    expect(help).toMatch(/^ {2}3 +no widgets at all$/m);
  });
});

describe("utcMonth", () => {
  it("uses UTC, not local time, at a month boundary", () => {
    expect(utcMonth(new Date("2026-09-30T23:30:00Z"))).toBe("202609");
    expect(utcMonth(new Date("2026-10-01T00:30:00+10:00"))).toBe("202609");
    expect(utcMonth(new Date("2026-12-31T23:59:59Z"))).toBe("202612");
  });
});

describe("SKIP_CI_TOKEN", () => {
  it.each(["[skip ci]", "[ci skip]", "[no ci]", "[skip actions]", "[actions skip]", "[SKIP CI]"])(
    "matches %s",
    (token) => expect(SKIP_CI_TOKEN.test(`docs(1): x bkit ${token}`)).toBe(true),
  );
  it.each(["skip ci", "[skip-ci]", "[force full]"])("does not match %s", (text) =>
    expect(SKIP_CI_TOKEN.test(text)).toBe(false),
  );
});

describe("repo facts on a real repository", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });

  const sh = (cwd: string, ...args: string[]) => {
    const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
    if (res.status !== 0) throw new Error(res.stderr);
  };

  function repoWithWorktree() {
    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lib-")));
    dirs.push(root);
    sh(root, "init", "-q", "-b", "dev");
    sh(
      root,
      "-c",
      "user.email=t@t",
      "-c",
      "user.name=t",
      "commit",
      "-q",
      "--allow-empty",
      "-m",
      "init",
    );
    sh(root, "worktree", "add", "-q", "-b", "feat/9-x", path.join(root, ".worktrees", "9-x"));
    return { root, worktree: path.join(root, ".worktrees", "9-x") };
  }

  const touch = (file: string) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "");
  };

  it("repoRoot resolves the main checkout from inside a linked worktree", () => {
    const { root, worktree } = repoWithWorktree();
    expect(repoRoot(worktree)).toBe(root);
    expect(repoRoot(root)).toBe(root);
  });

  it("repoRoot outside a repository is a usage error", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-norepo-"));
    dirs.push(dir);
    expect(usage(() => repoRoot(dir))).toContain("not inside a git repository");
  });

  it("design / plan / build / debug: worktree copy when it exists, else the main checkout", () => {
    const { root, worktree } = repoWithWorktree();
    const rel = path.join("docs", "plans", "202610", "logs", "9-x", "status.jsonl");
    const opts = { cwd: root, workflow: "build", fid: "9-x", month: "202610" };
    expect(statusLocation(opts)).toEqual({ bookRoot: root, path: path.join(root, rel) });
    touch(path.join(worktree, rel));
    expect(statusLocation(opts)).toEqual({ bookRoot: worktree, path: path.join(worktree, rel) });
  });

  it("ship: main checkout when the runtime pushes to dev, else the current worktree", () => {
    const { root, worktree } = repoWithWorktree();
    const base = { cwd: worktree, workflow: "ship", fid: "9-x", month: "202610" };
    expect(statusLocation({ ...base, devPushes: true }).bookRoot).toBe(root);
    expect(statusLocation({ ...base, devPushes: false }).bookRoot).toBe(worktree);
    expect(statusLocation(base).bookRoot).toBe(worktree);
  });
});
