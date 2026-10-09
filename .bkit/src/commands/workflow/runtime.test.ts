import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { normFlag, runtimeCommand } from "./runtime";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

/** A git repo to detect from, and a PATH holding a fake `gh` driven by FAKE_GH_* env. */
let cwd: string;
let bin: string;
beforeEach(() => {
  cwd = tmp("bkit-runtime-");
  spawnSync("git", ["init", "-q", cwd]);
  bin = tmp("bkit-runtime-bin-");
  fs.writeFileSync(
    path.join(bin, "gh"),
    [
      "#!/bin/sh",
      'if [ "$1" = auth ] && [ "$2" = status ]; then',
      '  if [ "${FAKE_GH_AUTH_OK:-1}" = 1 ]; then echo "Logged in to github.com" >&2; exit 0; fi',
      "  printf 'first line\\n%s\\n\\n' \"${FAKE_GH_ERR:-You are not logged into any GitHub hosts}\" >&2",
      "  exit 1",
      "fi",
      "exit 1",
      "",
    ].join("\n"),
    { mode: 0o755 },
  );
  // The runner's own env must not leak a runtime into these cases.
  for (const k of ["BKIT_RUNTIME", "CLAUDE_CODE_REMOTE", "GITHUB_ACTIONS", "CI", "FAKE_GH_ERR"]) {
    vi.stubEnv(k, "");
  }
  vi.stubEnv("FAKE_GH_AUTH_OK", "1");
  vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[], at = cwd) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["runtime", ...argv], [runtimeCommand], {
    classicVerbs: new Set(),
    cwd: at,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const detect = () => run(["detect", "--fid=42-x"]);

describe("normFlag", () => {
  it.each([
    ["true", "true"],
    ["1", "true"],
    ["YES", "true"],
    [undefined, "false"],
    ["", "false"],
    ["False", "false"],
    ["0", "false"],
    ["NO", "false"],
    ["no", "false"],
    ["yes", "true"],
    ["banana", "ambiguous"],
  ])("%j -> %s", (value, expected) => {
    expect(normFlag(value)).toBe(expected);
  });
});

describe("bkit runtime detect — the table", () => {
  it("local (no primitives) -> LOCAL, worktrees and dev pushes", async () => {
    const r = await detect();
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      runtime: "LOCAL",
      runtimeWorktrees: true,
      runtimeDevPushes: true,
    });
  });

  it("GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable", async () => {
    vi.stubEnv("GITHUB_ACTIONS", "true");
    expect((await detect()).json).toMatchObject({
      runtime: "GITHUB_ACTION",
      runtimeWorktrees: true,
      runtimeDevPushes: true,
    });
  });

  it("CI=true -> GITHUB_ACTION", async () => {
    vi.stubEnv("CI", "true");
    expect((await detect()).json.runtime).toBe("GITHUB_ACTION");
  });

  it("CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability", async () => {
    vi.stubEnv("CLAUDE_CODE_REMOTE", "true");
    expect((await detect()).json).toMatchObject({
      runtime: "CLOUD_CLAUDE",
      runtimeWorktrees: false,
      runtimeDevPushes: false,
    });
  });

  it("explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL", async () => {
    vi.stubEnv("GITHUB_ACTIONS", "false");
    vi.stubEnv("CI", "false");
    expect((await detect()).json).toMatchObject({ runtime: "LOCAL", runtimeWorktrees: true });
  });

  it("a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud", async () => {
    vi.stubEnv("CI", "banana");
    const r = await detect();
    expect(r.json).toMatchObject({
      runtime: "UNKNOWN",
      runtimeWorktrees: false,
      runtimeDevPushes: false,
    });
    expect(r.err).toContain("ambiguous detection primitives");
  });

  it("the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability", async () => {
    fs.mkdirSync(path.join(cwd, ".bkit"));
    fs.writeFileSync(path.join(cwd, ".bkit", ".runtime-cursor"), "");
    expect((await detect()).json).toMatchObject({
      runtime: "CLOUD_CURSOR",
      runtimeWorktrees: true,
      runtimeDevPushes: true,
    });
  });

  it("the marker is read from the main checkout even when run inside a linked worktree", async () => {
    spawnSync(
      "git",
      ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "i"],
      { cwd },
    );
    spawnSync("git", ["worktree", "add", "-q", "-b", "feat/42-x", ".worktrees/42-x"], { cwd });
    fs.mkdirSync(path.join(cwd, ".bkit"));
    fs.writeFileSync(path.join(cwd, ".bkit", ".runtime-cursor"), "");
    const r = await run(["detect", "--fid=42-x"], path.join(cwd, ".worktrees", "42-x"));
    expect(r.json.runtime).toBe("CLOUD_CURSOR");
    expect(r.json.worktreePath).toBe(path.join(cwd, ".worktrees", "42-x"));
  });

  it("BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly", async () => {
    vi.stubEnv("GITHUB_ACTIONS", "true");
    vi.stubEnv("BKIT_RUNTIME", "CLOUD_CLAUDE");
    expect((await detect()).json.runtime).toBe("CLOUD_CLAUDE");
    vi.stubEnv("BKIT_RUNTIME", "nonsense");
    const r = await detect();
    expect(r.json.runtime).toBe("UNKNOWN");
    expect(r.err).toContain("is not a valid runtime");
  });

  it("the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker", async () => {
    fs.mkdirSync(path.join(cwd, ".bkit"));
    fs.writeFileSync(path.join(cwd, ".bkit", ".runtime-cursor"), "");
    vi.stubEnv("CLAUDE_CODE_REMOTE", "true");
    expect((await detect()).json).toMatchObject({
      runtime: "CLOUD_CURSOR",
      runtimeWorktrees: true,
      runtimeDevPushes: true,
      worktreePath: path.join(cwd, ".worktrees", "42-x"),
    });
    vi.stubEnv("BKIT_RUNTIME", "CLOUD_CLAUDE");
    expect((await detect()).json).toMatchObject({
      runtime: "CLOUD_CLAUDE",
      runtimeWorktrees: false,
      worktreePath: cwd,
    });
  });
});

describe("bkit runtime detect — the gh probe", () => {
  it("runtimeGithubCli=true when gh auth status succeeds", async () => {
    expect((await detect()).json).toMatchObject({
      runtimeGithubCli: true,
      runtimeGithubCliExit: 0,
    });
  });

  it("runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails", async () => {
    vi.stubEnv("FAKE_GH_AUTH_OK", "0");
    const r = await detect();
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      runtimeGithubCli: false,
      runtimeGithubCliExit: 1,
      runtimeGithubCliErr: "You are not logged into any GitHub hosts",
    });
    expect(r.err).toContain("gh-preflight: runtimeGithubCli=false");
  });

  it("gh not on PATH -> exit 127, 'gh not found on PATH'", async () => {
    const onlyGit = tmp("bkit-runtime-onlygit-");
    const gitBin = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(gitBin, path.join(onlyGit, "git"));
    vi.stubEnv("PATH", onlyGit);
    const r = await detect();
    expect(r.json).toMatchObject({
      runtimeGithubCli: false,
      runtimeGithubCliExit: 127,
      runtimeGithubCliErr: "gh not found on PATH",
    });
  });
});

describe("bkit runtime detect — worktree path and contract", () => {
  it("worktrees allowed (local) -> mints <root>/.worktrees/<fid>", async () => {
    expect((await detect()).json.worktreePath).toBe(path.join(cwd, ".worktrees", "42-x"));
  });

  it("worktrees not allowed (cloud) -> adopts the repo root", async () => {
    vi.stubEnv("CLAUDE_CODE_REMOTE", "true");
    expect((await detect()).json.worktreePath).toBe(cwd);
  });

  it("a missing --fid is a usage error (exit 2), distinct from a least-capable answer", async () => {
    const r = await run(["detect"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("--fid");
  });

  it("outside a git repo is a usage error", async () => {
    const r = await run(["detect", "--fid=42-x"], tmp("bkit-runtime-nogit-"));
    expect(r.code).toBe(2);
  });

  it("re-derives per call: one run's answer does not leak into the next", async () => {
    vi.stubEnv("CLAUDE_CODE_REMOTE", "true");
    expect((await detect()).json.runtime).toBe("CLOUD_CLAUDE");
    vi.stubEnv("CLAUDE_CODE_REMOTE", "");
    expect((await detect()).json.runtime).toBe("LOCAL");
  });
});

describe("bkit runtime row", () => {
  const AT = "2026-07-24T00:00:00Z";

  it("builds the runtime-resolved row; runtimeGithubCli round-trips through it", async () => {
    vi.stubEnv("FAKE_GH_AUTH_OK", "0");
    vi.stubEnv("CLAUDE_CODE_REMOTE", "true");
    const r = await run(["row", "--workflow=build", `--at=${AT}`]);
    expect(r.code).toBe(0);
    expect(r.json.file).toBeNull();
    expect(r.json.row).toEqual({
      type: "runtime-resolved",
      workflow: "build",
      at: AT,
      runtime: "CLOUD_CLAUDE",
      runtimeWorktrees: false,
      runtimeDevPushes: false,
      runtimeGithubCli: false,
      runtimeGithubCliExit: 1,
      runtimeGithubCliErr: "You are not logged into any GitHub hosts",
      baseSha: "",
    });
  });

  it("carries --base-sha; defaults --at to now in whole UTC seconds", async () => {
    const r = await run(["row", "--workflow=design", "--base-sha=deadbeef1234"]);
    expect(r.json.row.baseSha).toBe("deadbeef1234");
    expect(r.json.row.at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  });

  it("fails closed (exit 2, nothing on stdout) when --workflow is empty or missing", async () => {
    for (const argv of [
      ["row", "--workflow=", `--at=${AT}`],
      ["row", `--at=${AT}`],
    ]) {
      const r = await run(argv);
      expect(r.code).toBe(2);
      expect(r.json).toBeUndefined();
    }
  });

  it("a backslash or quote in the gh error stays valid JSON, verbatim (regression)", async () => {
    vi.stubEnv("FAKE_GH_AUTH_OK", "0");
    vi.stubEnv("FAKE_GH_ERR", 'x509: cert C:\\Users\\ca "quoted"');
    const r = await run(["row", "--workflow=build", `--at=${AT}`, "--file=status.jsonl"]);
    const line = fs.readFileSync(path.join(cwd, "status.jsonl"), "utf-8");
    expect(JSON.parse(line).runtimeGithubCliErr).toBe('x509: cert C:\\Users\\ca "quoted"');
    expect(r.json.row.runtimeGithubCliErr).toBe('x509: cert C:\\Users\\ca "quoted"');
  });

  it("--file appends one line per call, so the ledger stays NDJSON", async () => {
    await run(["row", "--workflow=build", `--at=${AT}`, "--file=status.jsonl"]);
    const r = await run(["row", "--workflow=ship", `--at=${AT}`, "--file=status.jsonl"]);
    expect(r.json.file).toBe(path.join(cwd, "status.jsonl"));
    const lines = fs.readFileSync(path.join(cwd, "status.jsonl"), "utf-8").trimEnd().split("\n");
    expect(lines.map((l) => JSON.parse(l).workflow)).toEqual(["build", "ship"]);
  });

  it("--file into a missing directory is refused, not created", async () => {
    const r = await run(["row", "--workflow=build", "--file=no/such/status.jsonl"]);
    expect(r.code).toBe(2);
    expect(fs.existsSync(path.join(cwd, "no"))).toBe(false);
  });
});

describe("bkit runtime assert", () => {
  const write = (...rows: unknown[]) =>
    fs.writeFileSync(
      path.join(cwd, "status.jsonl"),
      rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
    );
  const resolved = (over: Record<string, unknown> = {}) => ({
    type: "runtime-resolved",
    workflow: "build",
    at: "2026-07-24T00:00:00Z",
    runtime: "CLOUD_CLAUDE",
    runtimeWorktrees: false,
    runtimeDevPushes: false,
    runtimeGithubCli: false,
    runtimeGithubCliExit: 1,
    runtimeGithubCliErr: "e",
    baseSha: "abc",
    ...over,
  });

  it("an explicit false (least-capable) resolution passes and reads back", async () => {
    write({ type: "workflow-started", workflow: "build", at: "t" }, resolved());
    const r = await run(["assert", "--file=status.jsonl"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      runtime: "CLOUD_CLAUDE",
      runtimeGithubCli: false,
      baseSha: "abc",
    });
  });

  it("reads the LATEST row, optionally for one workflow", async () => {
    write(resolved({ runtime: "LOCAL", runtimeGithubCli: true }), resolved({ workflow: "ship" }));
    expect((await run(["assert", "--file=status.jsonl"])).json.workflow).toBe("ship");
    const r = await run(["assert", "--file=status.jsonl", "--workflow=build"]);
    expect(r.json).toMatchObject({ runtime: "LOCAL", runtimeGithubCli: true });
  });

  it("no runtime-resolved row -> exit 4, loudly", async () => {
    write({ type: "workflow-started", workflow: "build", at: "t" });
    const r = await run(["assert", "--file=status.jsonl"]);
    expect(r.code).toBe(4);
    expect(r.err).toContain("no runtime-resolved row");
  });

  it.each([
    ["an empty runtime", { runtime: "" }, "runtime"],
    ["a string boolean", { runtimeWorktrees: "true" }, "runtimeWorktrees"],
    ["a missing flag", { runtimeGithubCli: undefined }, "runtimeGithubCli"],
  ])("%s -> exit 5, naming the unresolved field", async (_, over, field) => {
    write(resolved(over));
    const r = await run(["assert", "--file=status.jsonl"]);
    expect(r.code).toBe(5);
    expect(r.err).toContain(`${field} is UNRESOLVED`);
    expect(r.json).toBeUndefined();
  });

  it("a missing or malformed status file -> exit 3", async () => {
    expect((await run(["assert", "--file=status.jsonl"])).code).toBe(3);
    fs.writeFileSync(path.join(cwd, "status.jsonl"), "{not json\n");
    expect((await run(["assert", "--file=status.jsonl"])).code).toBe(3);
  });
});
