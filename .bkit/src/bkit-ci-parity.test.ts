/**
 * bkit-ci-parity.test.ts — `bkit ci slop` and `bkit setup protect-main` decide
 * exactly as the shell scripts they replace, while both exist.
 *
 * `package.json` `slop:delta` still runs `bkit-slop-delta.sh`, and consumers are
 * still told to run `bkit-protect-main.sh`, until both are pointed at the
 * commands. Each fixture runs through the script and the command with the same
 * fake `slop-scan` / `gh` on PATH, and any disagreement fails. Retire this file
 * together with the two scripts.
 *
 * Exit codes are compared as classes: the scripts exit 1 for every refusal, the
 * commands give each refusal its own code.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import { ciCommand } from "./commands/ci/ci";
import { runCommand, type CommandSpec } from "./commands/lib";
import { setupCommand } from "./commands/setup/setup";

const SCRIPTS = path.resolve(__dirname, "../templates/.bkit/scripts");
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ci-parity-")));
afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

let n = 0;
const mkdir = (name: string) => {
  const d = path.join(root, `${name}-${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};

const ENV_KEYS = ["PATH", "SLOP_BASE_REF", "FAKE_OUT", "FAKE_EXIT", "FAKE_LOG", "FAKE_STDIN"];
let saved: Record<string, string | undefined> = {};
beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  delete process.env.SLOP_BASE_REF;
});
afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

const write = (cwd: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};

/** Put `name` (a shell script body) first on PATH for both runs. */
function fakeBin(name: string, body: string, env: Record<string, string>) {
  const bin = mkdir("bin");
  fs.writeFileSync(path.join(bin, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
  process.env.PATH = `${bin}${path.delimiter}${saved.PATH ?? ""}`;
  for (const [k, v] of Object.entries(env)) process.env[k] = v;
  return bin;
}

const shell = (cwd: string, script: string, args: string[] = []) =>
  spawnSync("bash", [path.join(SCRIPTS, script), ...args], {
    cwd,
    encoding: "utf-8",
    env: process.env,
  });

async function command(spec: CommandSpec, cwd: string, argv: string[]) {
  const out: string[] = [];
  const code = await runCommand(argv, [spec], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  });
  return {
    code,
    json: out.length ? (JSON.parse(out.join("")) as Record<string, unknown>) : undefined,
  };
}

const outcome = (code: number | null) => (code === 0 ? "ok" : code === 1 ? "no" : "error");

// ---------------------------------------------------------------------------
// slop
// ---------------------------------------------------------------------------

function slopRepo() {
  const cwd = mkdir("slop-repo");
  git(cwd, "init", "-q");
  const shas = ["one", "two", "three"].map((m) => {
    write(cwd, "marker", `${m}\n`);
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", m);
    return git(cwd, "rev-parse", "HEAD");
  });
  return { cwd, first: shas[0]! };
}

/** Fake slop-scan: prints `$FAKE_OUT`, exits `$FAKE_EXIT`, logs the base worktree's marker. */
function fakeSlop(summary: Record<string, number>, exit = 0) {
  const dir = mkdir("slop-fake");
  const out = path.join(dir, "out.json");
  fs.writeFileSync(out, JSON.stringify({ summary }));
  fakeBin(
    "slop-scan",
    [
      'b=""; p=""; for a in "$@"; do [ "$p" = "--base" ] && b="$a"; p="$a"; done',
      'cat "$b/marker" >> "$FAKE_LOG"',
      'cat "$FAKE_OUT"',
      'exit "$FAKE_EXIT"',
    ].join("\n"),
    { FAKE_OUT: out, FAKE_EXIT: String(exit), FAKE_LOG: path.join(dir, "log") },
  );
  return () =>
    fs.existsSync(path.join(dir, "log")) ? fs.readFileSync(path.join(dir, "log"), "utf-8") : "";
}

const S = (o: Record<string, number> = {}) => ({
  addedCount: 0,
  resolvedCount: 0,
  worsenedCount: 0,
  netFindingCount: 0,
  netRepoScore: 0,
  ...o,
});

describe("slop: bkit-slop-delta.sh vs bkit ci slop", () => {
  it.each([
    ["net-new finding", S({ addedCount: 1, netFindingCount: 1, netRepoScore: 3.5 })],
    ["net score rise only", S({ worsenedCount: 1, netRepoScore: 0.5 })],
    ["line-shift (added = resolved)", S({ addedCount: 1, resolvedCount: 1 })],
    ["score at the epsilon", S({ netRepoScore: 0.001 })],
    ["score just over the epsilon", S({ netRepoScore: 0.0011 })],
    ["only resolved", S({ resolvedCount: 2, netFindingCount: -2, netRepoScore: -7 })],
  ])(
    "agrees on %s",
    async (_, summary) => {
      const { cwd, first } = slopRepo();
      const markers = fakeSlop(summary);
      const sh = shell(cwd, "bkit-slop-delta.sh", [first]);
      const cmd = await command(ciCommand, cwd, ["ci", "slop", `--base=${first}`]);
      expect(outcome(cmd.code)).toBe(outcome(sh.status));
      expect(markers()).toBe("one\none\n");
      expect(git(cwd, "worktree", "list").split("\n")).toHaveLength(1);
    },
    30_000,
  );

  it.each([
    ["an explicit base", (first: string) => ({ args: [first], env: {} })],
    ["$SLOP_BASE_REF", (first: string) => ({ args: [], env: { SLOP_BASE_REF: first } })],
    ["the merge-base with origin/dev", () => ({ args: [], env: {}, dev: true })],
    ["HEAD~1 with no remote branches", () => ({ args: [], env: {} })],
  ])(
    "resolve the same base from %s",
    async (_, setup) => {
      const { cwd, first } = slopRepo();
      const c = setup(first) as { args: string[]; env: Record<string, string>; dev?: boolean };
      if (c.dev) git(cwd, "update-ref", "refs/remotes/origin/dev", first);
      const markers = fakeSlop(S());
      for (const [k, v] of Object.entries(c.env)) process.env[k] = v;
      const sh = shell(cwd, "bkit-slop-delta.sh", c.args);
      const cmd = await command(ciCommand, cwd, [
        "ci",
        "slop",
        ...c.args.map((a) => `--base=${a}`),
      ]);
      expect(sh.status).toBe(0);
      expect(cmd.code).toBe(0);
      const [fromShell, fromCommand] = markers().trim().split("\n");
      expect(fromCommand).toBe(fromShell);
    },
    30_000,
  );

  it.each([
    ["a base that is not present", ["origin/nope"]],
    ["a base that is HEAD", ["HEAD"]],
  ])(
    "both skip, exit 0, without scanning, on %s",
    async (_, args) => {
      const { cwd } = slopRepo();
      const markers = fakeSlop(S({ netFindingCount: 9 }));
      const sh = shell(cwd, "bkit-slop-delta.sh", args);
      const cmd = await command(ciCommand, cwd, ["ci", "slop", `--base=${args[0]}`]);
      expect(sh.status).toBe(0);
      expect(cmd.code).toBe(0);
      expect(cmd.json?.skipped).not.toBeNull();
      expect(markers()).toBe("");
    },
    30_000,
  );

  it("both refuse when slop-scan fails", async () => {
    const { cwd, first } = slopRepo();
    fakeSlop(S(), 2);
    const sh = shell(cwd, "bkit-slop-delta.sh", [first]);
    const cmd = await command(ciCommand, cwd, ["ci", "slop", `--base=${first}`]);
    expect(sh.status).not.toBe(0);
    expect(cmd.code).not.toBe(0);
    expect(git(cwd, "worktree", "list").split("\n")).toHaveLength(1);
  }, 30_000);
});

// ---------------------------------------------------------------------------
// protect-main
// ---------------------------------------------------------------------------

const CI_YML =
  "jobs:\n  bkit-tests:\n    runs-on: x\n  bkit-tests-check:\n    needs: [bkit-tests]\n";

function protectRepo(opts: { capstone?: string; ci?: string | null } = {}) {
  const cwd = mkdir("protect-repo");
  git(cwd, "init", "-q");
  if (opts.capstone)
    write(cwd, "package.json", JSON.stringify({ bkit: { capstoneJob: opts.capstone } }));
  if (opts.ci !== null) write(cwd, ".github/workflows/ci.yml", opts.ci ?? CI_YML);
  return cwd;
}

/** Fake gh; each run gets a fresh stdin capture. `rule` is the current protection (absent = 404). */
function fakeGh(opts: { authFail?: boolean; rule?: unknown } = {}) {
  const dir = mkdir("gh-fake");
  const rule = path.join(dir, "rule.json");
  if (opts.rule !== undefined) fs.writeFileSync(rule, JSON.stringify(opts.rule));
  fakeBin(
    "gh",
    [
      'case "$1 $2" in',
      `  "auth status") exit ${opts.authFail ? 1 : 0} ;;`,
      '  "repo view") echo o/r; exit 0 ;;',
      "esac",
      'if [ "$2" = "-X" ]; then cat > "$FAKE_STDIN"; echo "{}"; exit 0; fi',
      `if [ -f "${rule}" ]; then cat "${rule}"; exit 0; fi`,
      'echo "gh: Branch not protected (HTTP 404)" >&2; exit 1',
    ].join("\n"),
    {},
  );
  const capture = (name: string) => {
    process.env.FAKE_STDIN = path.join(dir, name);
    return () =>
      fs.existsSync(path.join(dir, name)) ? fs.readFileSync(path.join(dir, name), "utf-8") : "";
  };
  return capture;
}

describe("protect-main: bkit-protect-main.sh vs bkit setup protect-main", () => {
  it.each([
    ["the default capstone", {}],
    ["a configured capstone", { capstone: "bkit-tests" }],
  ])(
    "send the same payload for %s",
    async (_, opts) => {
      const cwd = protectRepo(opts);
      const capture = fakeGh();
      const shIn = capture("sh.json");
      const sh = shell(cwd, "bkit-protect-main.sh");
      const cmdIn = capture("cmd.json");
      const cmd = await command(setupCommand, cwd, ["setup", "protect-main"]);
      expect(sh.status).toBe(0);
      expect(cmd.code).toBe(0);
      expect(JSON.parse(cmdIn())).toEqual(JSON.parse(shIn()));
    },
    30_000,
  );

  it("print the same payload on a dry run, and write nothing", async () => {
    const cwd = protectRepo();
    const capture = fakeGh();
    const written = capture("any.json");
    const sh = shell(cwd, "bkit-protect-main.sh", ["--dry-run"]);
    const cmd = await command(setupCommand, cwd, ["setup", "protect-main", "--dry-run"]);
    const shPayload = sh.stdout.slice(sh.stdout.indexOf("{"), sh.stdout.lastIndexOf("}") + 1);
    expect(cmd.json?.payload).toEqual(JSON.parse(shPayload));
    expect(written()).toBe("");
  }, 30_000);

  it.each([
    ["the CI workflow is missing", { ci: null }, {}],
    ["no job carries the capstone name", { ci: "jobs:\n  bkit-tests:\n    runs-on: x\n" }, {}],
    ["gh is not authenticated", {}, { authFail: true }],
  ])(
    "both refuse, writing nothing, when %s",
    async (_, repoOpts, ghOpts) => {
      const cwd = protectRepo(repoOpts);
      const capture = fakeGh(ghOpts);
      const written = capture("any.json");
      const sh = shell(cwd, "bkit-protect-main.sh");
      const cmd = await command(setupCommand, cwd, ["setup", "protect-main"]);
      expect(sh.status).not.toBe(0);
      expect(cmd.code).not.toBe(0);
      expect(written()).toBe("");
    },
    30_000,
  );

  it.each([
    ["a protected main", { enforce_admins: { enabled: true } }],
    ["an unprotected main", undefined],
  ])(
    "--print reports the same rule for %s",
    async (_, rule) => {
      const cwd = protectRepo();
      fakeGh({ rule });
      const sh = shell(cwd, "bkit-protect-main.sh", ["--print"]);
      const cmd = await command(setupCommand, cwd, ["setup", "protect-main", "--print"]);
      expect(sh.status).toBe(0);
      expect(cmd.code).toBe(0);
      const shJson = JSON.parse(sh.stdout) as Record<string, unknown>;
      if (rule === undefined) {
        expect(shJson).toEqual({ error: "main has no protection rule" });
        expect(cmd.json).toMatchObject({ protected: false, protection: null });
      } else {
        expect(cmd.json).toMatchObject({ protected: true, protection: shJson });
      }
    },
    30_000,
  );
});
