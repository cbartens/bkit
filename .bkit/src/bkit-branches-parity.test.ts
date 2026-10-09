/**
 * bkit-branches-parity.test.ts — `bkit branches rebase|anchor-stamp|anchor-read`
 * answer exactly as the shell functions they replace, while both exist.
 *
 * The workflows still source `bkit-rebase-resolve.sh` (`bkit_rebase_resolve`,
 * `bkit_rebase_classify`) and `bkit-runtime.sh` (`bkit_anchor_stamp`,
 * `bkit_anchor_read`) until they are rewritten onto `bkit branches`. Each
 * fixture runs through both and any disagreement fails, except the two
 * shell bugs the command fixes, which are pinned here as known differences.
 * Retire this file together with those functions.
 *
 * `push`, `sync` and `switch` have no shell counterpart: they replace inline
 * workflow blocks, which `branches.test.ts` covers case by case.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { runCommand } from "./commands/lib";
import { LOCKFILE_REGENERATE } from "./commands/shared/package-manager";
import { branchesCommand, classifyConflict } from "./commands/workflow/branches";

const SCRIPTS = path.resolve(__dirname, "../templates/.bkit/scripts");
const REBASE_SH = path.join(SCRIPTS, "bkit-rebase-resolve.sh");
const RUNTIME_SH = path.join(SCRIPTS, "bkit-runtime.sh");
const TIMEOUT = 60_000;

const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-branches-parity-")));
afterAll(() => fs.rmSync(root, { recursive: true, force: true }));
let seq = 0;
const tmp = (name: string) => {
  const d = path.join(root, `${seq++}-${name}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};

// Pinned dates, so the shell's and the command's fixture repos get the same
// commit hashes and conflict markers compare equal.
const FIXED_DATE = "2026-10-01T00:00:00Z";
const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    env: { ...process.env, GIT_AUTHOR_DATE: FIXED_DATE, GIT_COMMITTER_DATE: FIXED_DATE },
    encoding: "utf-8",
  });

const sh = (script: string, cwd?: string, env: NodeJS.ProcessEnv = process.env) => {
  const r = spawnSync("sh", ["-c", script], { cwd, encoding: "utf-8", env, maxBuffer: 1 << 26 });
  return { code: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};

async function command(cwd: string, argv: string[], env: Record<string, string> = {}) {
  const saved = { ...process.env };
  Object.assign(process.env, env);
  const out: string[] = [];
  try {
    const code = (await runCommand(["branches", ...argv], [branchesCommand], {
      classicVerbs: new Set(),
      cwd,
      io: { stdout: (t) => out.push(t), stderr: () => undefined },
    }))!;
    return {
      code,
      json: out.length ? (JSON.parse(out.join("")) as Record<string, unknown>) : undefined,
    };
  } finally {
    process.env = saved;
  }
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

describe("classification parity", { timeout: TIMEOUT }, () => {
  it("bkit_rebase_classify and classifyConflict agree on every path", () => {
    const paths = [
      "docs/knowledge.jsonl",
      "docs/decisions.jsonl",
      "docs/deferrals.jsonl",
      "docs/failures.jsonl",
      ".bkit/issues.jsonl",
      "docs/roadmap.md",
      ".bkit/stats.jsonl",
      ".bkit/friction.jsonl",
      "docs/plans/202608/logs/234-x/status.jsonl",
      "docs/plans/a/b/c/status.jsonl",
      "docs/plans/status.jsonl",
      ...Object.keys(LOCKFILE_REGENERATE),
      "packages/a/Cargo.lock",
      "src.txt",
      "package.json",
      "docs/testing.md",
      "docs/plans/202608/234-plan.md",
      "apps/web/data.jsonl",
      "docs/plans/202608/logs/234-x/other.jsonl",
      "docs/knowledgexjsonl",
      "xdocs/knowledge.jsonl",
    ];
    const body = paths
      .map((p) => `printf '%s\\t%s\\n' '${p}' "$(bkit_rebase_classify '${p}')"`)
      .join("\n");
    const res = sh(`. "${REBASE_SH}"\n${body}`);
    const shell = Object.fromEntries(
      res.stdout
        .trim()
        .split("\n")
        .map((l) => l.split("\t") as [string, string]),
    );
    for (const p of paths) expect(classifyConflict(p), p).toBe(shell[p]);
  });
});

// ---------------------------------------------------------------------------
// Rebase resolution
// ---------------------------------------------------------------------------

type Files = Record<string, string>;
interface Fixture {
  base?: Files;
  /** One entry per feature commit. */
  feat: Files[];
  main: Files;
}

function append(dir: string, files: Files) {
  for (const [f, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.appendFileSync(path.join(dir, f), body);
  }
  git(dir, "add", "-A");
}

/** A repo stopped mid-rebase of feat onto main on the fixture's conflict. */
function stopped(name: string, fx: Fixture): string {
  const dir = tmp(name);
  git(dir, "init", "-q", "-b", "main");
  append(dir, {
    "docs/knowledge.jsonl": '{"key":"A","ts":1}\n',
    "src.txt": "code v0\n",
    ...fx.base,
  });
  git(dir, "commit", "-q", "-m", "base");
  git(dir, "checkout", "-q", "-b", "feat");
  fx.feat.forEach((files, i) => {
    append(dir, files);
    git(dir, "commit", "-q", "-m", `feat ${i}`);
  });
  git(dir, "checkout", "-q", "main");
  append(dir, fx.main);
  git(dir, "commit", "-q", "-m", "main");
  git(dir, "checkout", "-q", "feat");
  git(dir, "rebase", "main");
  return dir;
}

/** Worktree files (not .git) and whether a rebase is still in progress. */
function snapshot(dir: string) {
  const files: Record<string, string> = {};
  const walk = (rel: string) => {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (r === ".git") continue;
      if (e.isDirectory()) walk(r);
      else files[r] = fs.readFileSync(path.join(dir, r), "utf-8");
    }
  };
  walk("");
  const inRebase = ["rebase-merge", "rebase-apply"].some((d) =>
    fs.existsSync(path.join(dir, ".git", d)),
  );
  return { files, inRebase, log: git(dir, "log", "--format=%s", "main..HEAD").stdout.trim() };
}

async function both(name: string, fx: Fixture, env: Record<string, string> = {}) {
  const shellDir = stopped(`${name}-sh`, fx);
  const cmdDir = stopped(`${name}-cmd`, fx);
  const shell = sh(`. "${REBASE_SH}" && bkit_rebase_resolve`, shellDir, { ...process.env, ...env });
  const cmd = await command(cmdDir, ["rebase"], env);
  return {
    shell: { ok: shell.code === 0, ...snapshot(shellDir) },
    cmd: { ok: cmd.code === 0, ...snapshot(cmdDir) },
  };
}

const ledger = (key: string, ts: number) => `{"key":"${key}","ts":${ts}}\n`;

const AGREEING: Record<string, Fixture> = {
  ledger: {
    feat: [{ "docs/knowledge.jsonl": ledger("B", 2) }],
    main: { "docs/knowledge.jsonl": ledger("C", 3) },
  },
  code: { feat: [{ "src.txt": "feat\n" }], main: { "src.txt": "main\n" } },
  mixed: {
    feat: [{ "src.txt": "feat\n", "docs/knowledge.jsonl": ledger("B", 2) }],
    main: { "src.txt": "main\n", "docs/knowledge.jsonl": ledger("C", 3) },
  },
  "multi-row": {
    feat: [{ "docs/knowledge.jsonl": ledger("B", 5) + ledger("B2", 6) }],
    main: { "docs/knowledge.jsonl": ledger("C", 7) },
  },
  "no-trailing-newline": {
    feat: [{ "docs/knowledge.jsonl": '{"key":"B","ts":2}' }],
    main: { "docs/knowledge.jsonl": ledger("C", 3) },
  },
  "emptied-commit": {
    feat: [{ "docs/knowledge.jsonl": ledger("SAME", 2) }],
    main: { "docs/knowledge.jsonl": ledger("SAME", 2) + ledger("D", 4) },
  },
  "two-ledgers": {
    base: {
      ".bkit/friction.jsonl": ledger("F", 1),
      "docs/plans/202610/logs/1-x/status.jsonl": ledger("S", 1),
    },
    feat: [
      {
        ".bkit/friction.jsonl": ledger("F2", 2),
        "docs/plans/202610/logs/1-x/status.jsonl": ledger("S2", 2),
      },
    ],
    main: {
      ".bkit/friction.jsonl": ledger("F3", 3),
      "docs/plans/202610/logs/1-x/status.jsonl": ledger("S3", 3),
    },
  },
  roadmap: {
    base: { "docs/roadmap.md": "# Roadmap\n" },
    feat: [{ "docs/roadmap.md": "## A\n## A\n" }],
    main: { "docs/roadmap.md": "## B\n" },
  },
  "two-commits-both-resolvable": {
    feat: [{ "docs/knowledge.jsonl": ledger("B", 2) }, { "docs/knowledge.jsonl": ledger("B3", 4) }],
    main: { "docs/knowledge.jsonl": ledger("C", 3) },
  },
};

describe("rebase parity", { timeout: TIMEOUT }, () => {
  it.each(Object.entries(AGREEING))("%s: same outcome, same files", async (name, fx) => {
    const { shell, cmd } = await both(name, fx);
    expect(cmd).toEqual(shell);
  });

  it("known difference: after skipping an emptied commit, the shell refuses the next conflict; the command resolves it", async () => {
    const { shell, cmd } = await both("skip-then-conflict", {
      feat: [
        { "docs/knowledge.jsonl": ledger("SAME", 2) },
        { "docs/knowledge.jsonl": ledger("B", 5) },
      ],
      main: { "docs/knowledge.jsonl": ledger("SAME", 2) + ledger("D", 4) },
    });
    expect(shell.ok).toBe(false);
    expect(shell.inRebase).toBe(true);
    expect(cmd.ok).toBe(true);
    expect(cmd.inRebase).toBe(false);
  });

  it("known difference: the shell regenerates a lockfile from the feature's copy; the command from the rebase target's", async () => {
    const lockfile = "uv.lock";
    const bin = tmp("bin");
    fs.writeFileSync(path.join(bin, LOCKFILE_REGENERATE[lockfile]![0]!), "#!/bin/sh\nexit 0\n", {
      mode: 0o755,
    });
    const { shell, cmd } = await both(
      "lockfile",
      {
        base: { [lockfile]: "lock v0\n" },
        feat: [{ [lockfile]: "feat pin\n" }],
        main: { [lockfile]: "dev pin\n" },
      },
      { PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}` },
    );
    expect(shell.ok && cmd.ok).toBe(true);
    expect(shell.files[lockfile]).toBe("lock v0\nfeat pin\n");
    expect(cmd.files[lockfile]).toBe("lock v0\ndev pin\n");
  });
});

// ---------------------------------------------------------------------------
// Anchor stamp / read
// ---------------------------------------------------------------------------

const ANCHOR_INPUTS: Record<string, string> = {
  unstamped: "# Some Design\n\nBody.\n",
  empty: "",
  "no-trailing-newline": "# Title\nlast line",
  stamped: "<!-- bkit:anchor\nbaseSha: abc\nbaseRef: origin/dev\n-->\n# Doc\n",
  "stamped-plan":
    "<!-- bkit:anchor\nbaseSha: abc\nbaseRef: origin/dev\ndesignPath: d.md\ndesignBaseSha: def\n-->\n# Plan\n",
  "two-blocks":
    "<!-- bkit:anchor\nbaseSha: one\n-->\n# Doc\n<!-- bkit:anchor\nbaseSha: two\n-->\ntail\n",
  unterminated: "# Doc\n<!-- bkit:anchor\nbaseSha: x\nbody after\n",
  "body-lookalike": "# Plan\n\nbaseSha: not-really-an-anchor\n<!-- bkit:anchor -->\n",
  "close-on-open-line": "<!-- bkit:anchor\n-->\nbaseSha: outside\n",
  "empty-field": "<!-- bkit:anchor\nbaseSha: \n-->\n",
};

describe("anchor parity", { timeout: TIMEOUT }, () => {
  it.each([
    ["design form", ["abc123"]],
    ["plan form", ["abc123", "docs/plans/202608/x-design.md", "def456"]],
  ] as const)("bkit_anchor_stamp and anchor-stamp write the same bytes (%s)", async (_, args) => {
    const shellDir = tmp("stamp-sh");
    const cmdDir = tmp("stamp-cmd");
    if (args.length === 3) {
      // The command reads the design's own baseSha from the file it names.
      fs.mkdirSync(path.join(cmdDir, "docs/plans/202608"), { recursive: true });
      fs.writeFileSync(path.join(cmdDir, args[1]), `<!-- bkit:anchor\nbaseSha: ${args[2]}\n-->\n`);
    }
    const calls: string[] = [];
    for (const [name, body] of Object.entries(ANCHOR_INPUTS)) {
      fs.writeFileSync(path.join(shellDir, `${name}.md`), body);
      fs.writeFileSync(path.join(cmdDir, `${name}.md`), body);
      calls.push(`bkit_anchor_stamp '${name}.md' ${args.map((a) => `'${a}'`).join(" ")}`);
    }
    const res = sh(`. "${RUNTIME_SH}"\n${calls.join("\n")}`, shellDir);
    expect(res.code, res.stderr).toBe(0);
    for (const name of Object.keys(ANCHOR_INPUTS)) {
      const argv = ["anchor-stamp", `--file=${name}.md`, `--base-sha=${args[0]}`];
      if (args.length === 3) argv.push(`--design=${args[1]}`);
      expect((await command(cmdDir, argv)).code).toBe(0);
      expect(fs.readFileSync(path.join(cmdDir, `${name}.md`), "utf-8"), name).toBe(
        fs.readFileSync(path.join(shellDir, `${name}.md`), "utf-8"),
      );
    }
  });

  it("bkit_anchor_read and anchor-read return the same value for every field", async () => {
    const dir = tmp("read");
    const fields = ["baseSha", "baseRef", "designPath", "designBaseSha"];
    const calls: string[] = [];
    for (const [name, body] of Object.entries(ANCHOR_INPUTS)) {
      fs.writeFileSync(path.join(dir, `${name}.md`), body);
      for (const f of fields) {
        calls.push(
          `printf '%s\\t%s\\t%s\\n' '${name}' '${f}' "$(bkit_anchor_read '${name}.md' '${f}')"`,
        );
      }
    }
    const res = sh(`. "${RUNTIME_SH}"\n${calls.join("\n")}`, dir);
    const shell = new Map(
      res.stdout
        .trimEnd()
        .split("\n")
        .map((l) => {
          const [name, field, value] = l.split("\t");
          return [`${name}/${field}`, value ?? ""] as const;
        }),
    );
    for (const name of Object.keys(ANCHOR_INPUTS)) {
      for (const f of fields) {
        const r = await command(dir, ["anchor-read", `--file=${name}.md`, `--field=${f}`]);
        expect(r.code).toBe(0);
        expect(r.json?.value ?? "", `${name} ${f}`).toBe(shell.get(`${name}/${f}`));
      }
    }
  });
});
