import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { tierTimeouts } from "../../../../../vitest.timeout-budget";
import { requireTsx } from "../../../../../vitest.tsx-bin";
import { actionHash } from "../../ledgers/status";

const CLI = path.resolve(".bkit/core/engine/cli.ts");
const DISPATCHER = path.resolve("tests/fixtures/gh/bin/gh");
const FID = "12-progress";
const MONTH = "202611";
const REL = `docs/plans/${MONTH}/logs/${FID}/status.jsonl`;
const BUDGET = tierTimeouts(true);
let root: string;
let cwd: string;
let stateFile: string;
let env: NodeJS.ProcessEnv;

interface RemoteComment {
  id: number;
  node_id: string;
  body: string;
  html_url: string;
  user: { id: number; node_id: string };
  created_at: string;
  updated_at: string;
}
interface RemoteState {
  comments: RemoteComment[];
  calls: Array<{ method: string; endpoint: string; body?: string }>;
  fault?: string;
}

// A real child-process transport with durable state across separate CLI invocations.
const GH_SERVER = String.raw`
import fs from "node:fs";
const file = process.env.BKIT_PROGRESS_REMOTE;
const state = JSON.parse(fs.readFileSync(file, "utf8"));
const args = process.argv.slice(2);
if (args[0] === "repo") { console.log("o/r"); process.exit(0); }
if (args[0] === "auth") process.exit(0);
const endpoint = args[1];
const methodAt = args.indexOf("--method");
const method = methodAt < 0 ? "GET" : args[methodAt + 1];
const input = args.includes("--input") ? JSON.parse(fs.readFileSync(0, "utf8")) : {};
state.calls.push({ method, endpoint, body: input.body });
const save = () => fs.writeFileSync(file, JSON.stringify(state));
const fail = () => { save(); console.error("HTTP 503: disposable transport fault"); process.exit(1); };
if (endpoint === "graphql") {
  if (["read", "all", "reconciliation"].includes(state.fault)) fail();
  save();
  console.log(JSON.stringify({ data: { repository: { issue: { comments: {
    nodes: state.comments.map(c => ({ id:c.node_id, databaseId:c.id, body:c.body, url:c.html_url,
      author:{id:c.user.node_id,databaseId:c.user.id,__typename:"User"},
      createdAt:c.created_at, updatedAt:c.updated_at })),
    pageInfo:{hasPreviousPage:false,hasNextPage:false,startCursor:"first"}
  } } } } }));
  process.exit(0);
}
if (method === "POST" || method === "PATCH") {
  if (state.fault === "all" || state.fault === "create" && method === "POST" ||
      ["append", "reconciliation"].includes(state.fault) && method === "PATCH") fail();
  let comment;
  if (method === "PATCH") {
    const id = endpoint.split("/").at(-1);
    comment = state.comments.find(c => String(c.id) === id || c.node_id === id);
    if (!comment) fail();
    comment.body = input.body;
    comment.updated_at = "2026-11-01T01:02:00Z";
  } else {
    const id = state.comments.length + 101;
    comment = { id, node_id:"IC_"+id, body:input.body,
      html_url:"https://github.com/o/r/issues/12#issuecomment-"+id,
      user:{id:7,node_id:"U_7"},
      created_at:new Date(Date.UTC(2026,10,1,1,0,state.comments.length)).toISOString(),
      updated_at:"2026-11-01T01:01:00Z" };
    state.comments.push(comment);
  }
  save();
  if (state.fault === "lost-terminal" && input.body.includes("Completion")) fail();
  console.log(JSON.stringify(comment));
  process.exit(0);
}
save();
console.error("unexpected gh fixture call");
process.exit(1);
`;

// Inject I/O faults only at the comment boundary; substantive status writes use real fs.
const FAULT_PRELOAD = String.raw`
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
const fault = process.env.BKIT_PROGRESS_IO_FAULT;
for (const method of ["writeFileSync", "appendFileSync", "openSync", "readFileSync"]) {
  const original = fs[method];
  fs[method] = function(file, ...args) {
    const name = String(file);
    const body = typeof args[0] === "string" ? args[0] : "";
    const hit = fault === "preparation" && name.includes("bkit-comment-") && method === "writeFileSync"
      || fault === "cache" && name.includes("/progress/") && method === "writeFileSync"
      || fault === "receipt" && method === "appendFileSync" && body.includes('"type":"engine-action"')
      || fault === "lock" && name.includes("publication-locks") && method === "openSync"
      || fault === "diagnostic" && name.endsWith("friction.jsonl") && method === "appendFileSync";
    if (hit) throw new Error("injected comment boundary unavailable");
    return original.call(this, file, ...args);
  };
}
syncBuiltinESMExports();
`;

function write(file: string, body: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
}

function git(at: string, ...args: string[]): string {
  const result = spawnSync("git", args, { cwd: at, env, encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

function cli(at: string, args: string[], extra: NodeJS.ProcessEnv = {}) {
  const result = spawnSync(
    requireTsx(),
    ["--import", path.join(root, "faults.mjs"), CLI, ...args, "--json"],
    { cwd: at, env: { ...env, ...extra }, encoding: "utf8", timeout: BUDGET.testTimeout },
  );
  return {
    code: result.status,
    stderr: result.stderr,
    out: result.stdout ? (JSON.parse(result.stdout) as Record<string, unknown>) : {},
  };
}

function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
  const result = cli(at, args, extra);
  expect(result.code, result.stderr).toBe(0);
  return result.out;
}

function remote(): RemoteState {
  return JSON.parse(fs.readFileSync(stateFile, "utf8"));
}

function fault(name?: string): void {
  const state = remote();
  state.fault = name;
  fs.writeFileSync(stateFile, JSON.stringify(state));
}

function session(at = cwd): string {
  const info = ok(at, ["repo", "info"]);
  expect(info.sessionDir).toEqual(expect.any(String));
  return String(info.sessionDir);
}

function start(at: string, sessionDir: string, workflow = "build") {
  return ok(at, [
    "workflows",
    "start",
    `--workflow=${workflow}`,
    `--fid=${FID}`,
    `--month=${MONTH}`,
    `--session-dir=${sessionDir}`,
  ]);
}

function report(
  at: string,
  title: string,
  options: {
    sessionDir?: string;
    workflow?: string;
    file?: string;
    issue?: string;
    number?: number;
  } = {},
) {
  return ok(at, [
    "issues",
    "comment",
    "--post",
    `--issue=${options.issue ?? "12"}`,
    `--workflow=${options.workflow ?? "build"}`,
    `--step-number=${options.number ?? 3}`,
    `--step-title=${title}`,
    ...(options.sessionDir ? [`--session-dir=${options.sessionDir}`] : []),
    ...(options.file ? [`--file=${options.file}`] : []),
  ]);
}

function rows(at: string): Array<Record<string, unknown>> {
  return fs
    .readFileSync(path.join(at, REL), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function finish(at: string, verdict: "PASS" | "FAIL", extra: NodeJS.ProcessEnv = {}) {
  return cli(
    at,
    [
      "steps",
      "finish",
      "--workflow=build",
      "--step=build-branch-sync",
      `--file=${REL}`,
      "--commit=none",
      "--number=3",
      "--title=Branch Sync",
      "--post",
      `--verdict=${verdict}`,
      `--failures=${verdict === "PASS" ? 0 : 1}`,
    ],
    extra,
  );
}

function close(at: string, sessionDir: string) {
  return ok(at, [
    "workflows",
    "close",
    "--workflow=build",
    `--fid=${FID}`,
    `--month=${MONTH}`,
    "--ending=held",
    "--publish=false",
    "--post",
    "--number=16",
    "--title=Completion",
    "--owner-repo=o/r",
    `--session-dir=${sessionDir}`,
  ]);
}

function executionRoots(): string[] {
  const separate = path.join(root, "separate-worktree");
  git(cwd, "worktree", "add", "-q", "-b", "feat/separate", separate);
  return [cwd, separate];
}

function lastBody(): string {
  return remote().comments.at(-1)?.body ?? "";
}

function mixedAutoPhase(bodies: string[]): boolean {
  return bodies.some((body) => body.includes("Auto dispatch") && body.includes("Build start"));
}

function faultForBoundary(boundary: string): void {
  fault(
    ["read", "append", "create", "reconciliation"].includes(boundary)
      ? boundary
      : boundary === "diagnostic"
        ? "all"
        : undefined,
  );
}

function failuresFor(verdict: string): number {
  return verdict === "PASS" ? 0 : 1;
}

function gitCalls(): string[] {
  return fs.readFileSync(path.join(root, "git-calls"), "utf8").split("\n").filter(Boolean);
}

function isPushCall(call: string): boolean {
  for (const argument of call.split(" ")) {
    if (argument === "push") return true;
  }
  return false;
}

beforeEach(() => {
  root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-progress-cli-")));
  cwd = path.join(root, "consumer");
  stateFile = path.join(root, "remote.json");
  env = {
    ...process.env,
    BKIT_ENGINE_JOURNAL: "off",
    BKIT_NO_UPDATE_CHECK: "1",
    BKIT_PROGRESS_REMOTE: stateFile,
    BKIT_GH_TOKEN: "disposable-fixture-token",
  };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith("GIT_") ||
      [
        "BKIT_LINEAR_API_KEY",
        "BKIT_JIRA_API_KEY",
        "NODE_OPTIONS",
        "BKIT_FAKE_TOOL_SCRIPT",
        "BKIT_PROGRESS_IO_FAULT",
      ].includes(key)
    )
      delete env[key];
  }
  fs.mkdirSync(cwd);
  const bin = path.join(root, "bin");
  fs.mkdirSync(bin);
  fs.symlinkSync(DISPATCHER, path.join(bin, "gh"));
  fs.symlinkSync(DISPATCHER, path.join(bin, "git"));
  write(path.join(root, "gh-server.mjs"), GH_SERVER);
  write(
    path.join(root, "gh-body.sh"),
    'case "$1" in api|repo|auth) exec "$BKIT_PROGRESS_NODE" "$BKIT_PROGRESS_SERVER" "$@" ;; esac\nprintf "%s\\n" "$*" >> "$BKIT_PROGRESS_GIT_CALLS"\nfor arg in "$@"; do case "$arg" in push|fetch|ls-remote) echo "unexpected network git operation" >&2; exit 97 ;; esac; done\nexec "$BKIT_PROGRESS_REAL_GIT" "$@"\n',
  );
  write(path.join(root, "faults.mjs"), FAULT_PRELOAD);
  env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ""}`;
  env.BKIT_FAKE_TOOL_SCRIPT = path.join(root, "gh-body.sh");
  env.BKIT_PROGRESS_NODE = process.execPath;
  env.BKIT_PROGRESS_SERVER = path.join(root, "gh-server.mjs");
  env.BKIT_PROGRESS_REAL_GIT = spawnSync("which", ["git"], { encoding: "utf8" }).stdout.trim();
  env.BKIT_PROGRESS_GIT_CALLS = path.join(root, "git-calls");
  fs.writeFileSync(stateFile, JSON.stringify({ comments: [], calls: [] }));
  git(cwd, "init", "-q", "-b", `feat/${FID}`);
  git(cwd, "config", "user.name", "Fixture");
  git(cwd, "config", "user.email", "fixture@example.invalid");
  git(cwd, "config", "commit.gpgsign", "false");
  git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
  write(
    path.join(cwd, "package.json"),
    JSON.stringify({ name: "fixture", version: "1.0.0", bkit: { tracker: { default: "github" } } }),
  );
  write(path.join(cwd, ".bkit/version"), JSON.stringify({ pinnedVersion: "6.1.1" }));
  write(path.join(cwd, ".gitignore"), "tmp/\n.worktrees/\n");
  git(cwd, "add", "package.json", ".bkit/version", ".gitignore");
  git(cwd, "commit", "-qm", "fixture");
});

afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

function workflowCommandFlags(
  command: string | undefined,
  flags: Array<[string, string[]]>,
): string[] {
  return [
    ...flags.flatMap(([needle, args]) => (command?.includes(needle) ? args : [])),
    ...(command?.includes("--purpose=terminal") ? ["--purpose=terminal"] : []),
  ];
}

describe("workflow comment lifecycle across real CLI processes", () => {
  it("keeps auto startup with PR metadata and dispatch in one progress comment", () => {
    const dir = session();
    const startup = ok(cwd, [
      "issues",
      "comment",
      "--post",
      "--issue=12",
      "--workflow=auto",
      "--workflow-heading",
      "--step-number=1",
      "--step-title=Start Workflow",
      "--field=Phase=ship",
      "--owner-repo=o/r",
      `--tree=feat/${FID}`,
      "--pr-number=99",
      "--pr-url=https://github.com/o/r/pull/99",
      "--run-id=111",
      `--session-dir=${dir}`,
    ]);
    expect(startup.tracker).toMatchObject({ done: true });
    const dispatched = ok(cwd, [
      "issues",
      "comment",
      "--post",
      "--issue=12",
      "--workflow=auto",
      "--step-number=2",
      "--step-title=Dispatch",
      "--field=Phase=ship",
      `--session-dir=${dir}`,
    ]);
    expect(dispatched.tracker).toMatchObject({ done: true });
    expect(remote().comments).toHaveLength(1);
    const progress = remote().comments[0]?.body;
    expect(progress).toContain("bkit:progress");
    expect(progress).toContain("Start Workflow");
    expect(progress).toContain("Dispatch");
    expect(remote().calls.filter((call) => call.method === "POST")).toHaveLength(1);
    expect(remote().calls.filter((call) => call.method === "PATCH")).toHaveLength(1);
    const completion = ok(cwd, [
      "issues",
      "comment",
      "--post",
      "--issue=12",
      "--workflow=auto",
      "--purpose=terminal",
      "--step-number=3",
      "--step-title=Completion",
      "--owner-repo=o/r",
      "--pr-number=99",
      "--pr-url=https://github.com/o/r/pull/99",
      `--session-dir=${dir}`,
    ]);
    expect(completion.tracker).toMatchObject({ done: true });
    expect(remote().comments).toHaveLength(2);
    expect(remote().comments[0]?.body).toBe(progress);
    expect(remote().comments[1]?.body).toContain("Completion");
    expect(remote().comments[1]?.body).not.toContain("bkit:progress");
    expect(remote().comments[1]?.body).toContain("https://github.com/o/r/pull/99");
  });

  it("redacts malformed Jira authorization from live probe diagnostics", () => {
    const probe = path.resolve(
      "docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts",
    );
    const networkAttempts = path.join(root, "network-attempts");
    const guard = path.join(root, "network-guard.mjs");
    write(
      guard,
      'import fs from "node:fs"; import net from "node:net";\nnet.Socket.prototype.connect = function() { fs.appendFileSync(process.env.BKIT_NETWORK_ATTEMPTS, "connect\\n"); throw new Error("network forbidden in probe regression"); };\n',
    );
    const observed: Array<{ token: string; output: string }> = [];
    for (const token of [
      "synthetic-jira-prefix-1234\nsynthetic-jira-tail-5678",
      `synthetic-jira-long-prefix-${"x".repeat(750)}\nsynthetic-jira-long-tail`,
    ]) {
      const result = spawnSync(requireTsx(), ["--import", guard, probe, "--discover"], {
        cwd,
        env: {
          ...env,
          BKIT_GH_TOKEN: "",
          GH_TOKEN: "",
          BKIT_LINEAR_API_KEY: "",
          BKIT_JIRA_API_KEY: token,
          BKIT_NETWORK_ATTEMPTS: networkAttempts,
        },
        encoding: "utf8",
        timeout: BUDGET.testTimeout,
      });
      expect(result.status, result.stderr).toBe(0);
      expect(fs.existsSync(networkAttempts)).toBe(false);
      const diagnostics: Array<{ stage: string; value: unknown }> = result.stdout
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));
      expect(diagnostics.find((row) => row.stage === "jira-schema-unavailable")).toMatchObject({
        value: { name: "TypeError", message: expect.any(String) },
      });
      observed.push({ token, output: result.stdout + result.stderr });
    }
    for (const { token, output } of observed) {
      expect(output).not.toContain(token.split("\n")[0]);
      expect(output).not.toContain(token.split("\n")[1]);
      expect(output).not.toContain("synthetic-jira-");
    }
  });

  it("keeps published build completion and PR links in one terminal comment", () => {
    const workflow = fs.readFileSync(path.resolve(".bkit/core/workflows/bkit-build.md"), "utf8");
    const closeCommand = workflow
      .split("\n")
      .find((line) => line.includes('--message="chore({FID}): close-workflow"'));
    const prCommand = workflow
      .split("\n")
      .find((line) => line.includes('--step-title="Create PR"'));
    expect(closeCommand).toBeDefined();
    expect(prCommand).toBeDefined();
    const dir = session();
    report(cwd, "Start Workflow", { sessionDir: dir, number: 1 });
    start(cwd, dir);
    report(cwd, "Summary", { file: REL, number: 15 });
    const completed = ok(cwd, [
      "workflows",
      "close",
      "--workflow=build",
      `--fid=${FID}`,
      `--month=${MONTH}`,
      "--number=16",
      "--title=Completion",
      "--owner-repo=o/r",
      `--session-dir=${dir}`,
      ...workflowCommandFlags(closeCommand, [["--post", ["--post"]]]),
    ]);
    ok(cwd, [
      "issues",
      "comment",
      "--post",
      "--issue=12",
      "--step-number=16",
      "--step-title=Create PR",
      "--owner-repo=o/r",
      "--pr-number=99",
      "--pr-url=https://github.com/o/r/pull/99",
      `--session-dir=${dir}`,
      ...workflowCommandFlags(prCommand, [
        ["--body-file=", [`--body-file=${String(completed.commentFile)}`]],
        ["--workflow=build", ["--workflow=build"]],
        ['--file="{STATUS}"', [`--file=${REL}`]],
      ]),
    ]);
    expect(remote().comments).toHaveLength(2);
    expect(remote().comments[1]?.body).toContain("Completion");
    expect(remote().comments[1]?.body).toContain("https://github.com/o/r/pull/99");
    expect(remote().comments[0]?.body).not.toContain("Completion");
    expect(fs.readdirSync(path.join(cwd, ".git/bkit-outbox/progress"))).toHaveLength(0);
  });

  it("continues after the prepared completion source disappears", () => {
    const dir = session();
    start(cwd, dir);
    const result = cli(cwd, [
      "issues",
      "comment",
      "--post",
      "--issue=12",
      "--workflow=build",
      `--file=${REL}`,
      "--step-number=16",
      "--step-title=Create PR",
      "--pr-number=99",
      "--owner-repo=o/r",
      "--body-file=tmp/missing-completion.md",
    ]);
    expect(result.code).toBe(0);
    expect(result.out.tracker).toMatchObject({ done: false, reason: "preparation" });
    expect(result.out.commentFile).toBeNull();
    expect(fs.readFileSync(path.join(cwd, ".bkit/friction.jsonl"), "utf8")).toContain(
      '"step":"comment-delivery"',
    );
    expect(finish(cwd, "PASS").code).toBe(0);
  });

  it("records preparation and session association failures despite successful delivery", () => {
    const dir = session();
    const prepared = ok(
      cwd,
      [
        "issues",
        "comment",
        "--post",
        "--issue=12",
        "--workflow=build",
        "--step-number=1",
        "--step-title=Preparation",
        `--session-dir=${dir}`,
      ],
      { BKIT_PROGRESS_IO_FAULT: "preparation" },
    );
    expect(prepared.tracker).toMatchObject({ done: true });
    expect(prepared.commentFile).toBeNull();
    const frictionFile = path.join(cwd, ".bkit/friction.jsonl");
    const preparationRows = fs.readFileSync(frictionFile, "utf8");
    expect(preparationRows).toContain('"step":"comment-source"');
    fs.rmSync(dir, { recursive: true, force: true });
    report(cwd, "Missing association", { sessionDir: dir, number: 2 });
    const associationRows = fs.readFileSync(frictionFile, "utf8");
    expect(associationRows).toContain('"step":"comment-association"');
    expect(associationRows).not.toContain(dir);
    expect(remote().comments).toHaveLength(2);
  });

  it("associates startup and run across restart or starts fresh safely", () => {
    const dir = session();
    report(cwd, "Start Workflow", { sessionDir: dir, number: 1 });
    const started = start(cwd, dir);
    report(cwd, "Worktree Setup", { file: String(started.file), number: 2 });
    expect(remote().comments).toHaveLength(1);
    expect(remote().comments[0]?.body).toContain("Start Workflow");
    expect(remote().comments[0]?.body).toContain("Worktree Setup");
    fs.rmSync(dir, { recursive: true, force: true });
    report(cwd, "After missing session", { sessionDir: dir, number: 4 });
    expect(remote().comments).toHaveLength(2);
    expect(remote().comments[1]?.body).not.toContain("Start Workflow");
  });

  it("keeps successive phase runs separate in adopted and worktree execution", () => {
    for (const at of executionRoots()) {
      const first = session(at);
      start(at, first);
      report(at, `First ${path.basename(at)}`, { sessionDir: first, number: 1 });
      close(at, first);
      const before = remote().comments.length;
      const second = session(at);
      start(at, second);
      report(at, `Second ${path.basename(at)}`, { sessionDir: second, number: 1 });
      expect(remote().comments).toHaveLength(before + 1);
      const last = lastBody();
      expect(last).toContain(`Second ${path.basename(at)}`);
      expect(last).not.toContain(`First ${path.basename(at)}`);
    }
  });

  it("keeps auto and phase progress separate across worktrees", () => {
    const auto = session();
    report(cwd, "Auto dispatch", { workflow: "auto", sessionDir: auto, number: 1 });
    const separate = path.join(root, "phase-worktree");
    git(cwd, "worktree", "add", "-q", "-b", "feat/phase", separate);
    const phase = session(separate);
    start(separate, phase);
    report(separate, "Build start", { sessionDir: phase, number: 1 });
    report(cwd, "Auto continuation", { workflow: "auto", sessionDir: auto, number: 2 });
    const bodies = remote().comments.map((c) => c.body);
    expect(mixedAutoPhase(bodies)).toBe(false);
    expect(bodies.filter((body) => body.includes("Build start"))).toHaveLength(1);
    fs.rmSync(phase, { recursive: true, force: true });
    const result = report(separate, "Build continues", { file: REL, number: 4 });
    expect(result.tracker).toMatchObject({ done: true });
  });

  it("continues close and cleanup after lost terminal response", () => {
    const dir = session();
    const worktree = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", "-b", "feat/cleanup", worktree);
    write(path.join(cwd, ".git/bkit-outbox", FID, ".worktree-owned"), "fixture ownership\n");
    start(worktree, dir);
    report(worktree, "Routine work", { file: REL });
    fault("lost-terminal");
    close(worktree, dir);
    expect(rows(worktree).some((row) => row.type === "workflow-done")).toBe(true);
    expect(fs.existsSync(dir)).toBe(false);
    expect(gitCalls().filter(isPushCall)).toEqual([]);
    const committed = git(worktree, "ls-files");
    expect(committed).not.toMatch(/progress\/|terminal-journal|pending-delivery/);
    const remaining = fs.readdirSync(path.join(cwd, ".git/bkit-outbox"), { recursive: true });
    expect(remaining.join("\n")).not.toMatch(/terminal-journal|pending-delivery/);
    const removed = ok(cwd, ["worktrees", "remove", `--fid=${FID}`]);
    expect(removed.removed).toBe(true);
    expect(fs.existsSync(worktree)).toBe(false);
    write(path.join(cwd, "after-close.txt"), "substantive work continues\n");
    expect(fs.readFileSync(path.join(cwd, "after-close.txt"), "utf8")).toContain("continues");
  });

  it("starts fresh progress after cleanup and on a fresh clone", () => {
    const dir = session();
    start(cwd, dir);
    report(cwd, "Old progress", { file: REL });
    fs.rmSync(path.join(cwd, ".git/bkit-outbox"), { recursive: true, force: true });
    report(cwd, "After cleanup", { file: REL, number: 4 });
    expect(remote().comments).toHaveLength(2);
    const cloned = path.join(root, "clone");
    git(root, "clone", "-q", cwd, cloned);
    git(cloned, "remote", "set-url", "origin", "https://github.com/o/r.git");
    const fresh = session(cloned);
    start(cloned, fresh);
    report(cloned, "Fresh clone", { file: REL, number: 5 });
    expect(remote().comments).toHaveLength(3);
    expect(remote().comments.at(-1)?.body).not.toContain("Old progress");
  });

  it("preserves substantive step results under every comment boundary fault", () => {
    const dir = session();
    start(cwd, dir);
    report(cwd, "Initial progress", { file: REL });
    for (const boundary of [
      "preparation",
      "cache",
      "receipt",
      "lock",
      "read",
      "append",
      "create",
      "reconciliation",
      "diagnostic",
    ]) {
      fault();
      report(cwd, `Before ${boundary}`, { file: REL, number: 6 });
      faultForBoundary(boundary);
      for (const verdict of ["PASS", "FAIL"] as const) {
        const result = finish(cwd, verdict, { BKIT_PROGRESS_IO_FAULT: boundary });
        expect(result.code, `${boundary}: ${result.stderr}`).toBe(0);
        const done = rows(cwd)
          .filter((row) => row.type === "step-done")
          .at(-1);
        expect(done).toMatchObject({ verdict, failures: failuresFor(verdict) });
        const subsequent = ok(cwd, [
          "status",
          "row",
          `--file=${REL}`,
          "--workflow=build",
          "--type=owner-answer",
        ]);
        expect(subsequent).toBeDefined();
        expect(rows(cwd).at(-1)?.type).toBe("owner-answer");
      }
    }
  });

  it("keeps clean build progress and completion to two comments", () => {
    const dir = session();
    report(cwd, "Start Workflow", { sessionDir: dir, number: 1 });
    start(cwd, dir);
    for (const [number, title] of [
      [2, "Worktree Setup"],
      [7, "Plan Execute"],
      [8, "Plan Verify"],
      [12, "Run Tests"],
      [15, "Summary"],
    ] as const)
      report(cwd, title, { file: REL, number });
    close(cwd, dir);
    expect(remote().comments).toHaveLength(2);
    const [progress, completion] = remote().comments;
    for (const title of [
      "Start Workflow",
      "Worktree Setup",
      "Plan Execute",
      "Plan Verify",
      "Run Tests",
      "Summary",
    ])
      expect(progress?.body).toContain(title);
    expect(completion?.body).toContain("Completion");
    expect(completion?.body).not.toContain("Start Workflow");
    expect(rows(cwd).at(-1)?.type).toBe("workflow-done");
  });

  it("preserves legacy receipts issue less skips and exact fallback through resume", () => {
    const dir = session();
    start(cwd, dir);
    const draft = ok(cwd, [
      "issues",
      "comment",
      "--issue=12",
      "--workflow=build",
      "--step-number=3",
      "--step-title=Legacy",
    ]);
    fs.appendFileSync(
      path.join(cwd, REL),
      `${JSON.stringify({ type: "engine-action", action: "comment", key: "build/1/step/3/-/-/comment", hash: actionHash(String(draft.comment)), ref: "https://github.com/o/r/issues/12#issuecomment-99", at: "2026-11-01T00:00:01Z" })}\n`,
    );
    const before = remote().calls.length;
    const legacy = report(cwd, "Legacy", { file: REL });
    expect(legacy.tracker).toMatchObject({ done: true, deduped: true });
    expect(remote().calls).toHaveLength(before);
    const skipped = report(cwd, "Issue less", { issue: "", number: 4 });
    expect(skipped.tracker).toMatchObject({ skipped: "no-issue" });
    expect(remote().calls).toHaveLength(before);
    fault("all");
    const failed = report(cwd, "Exact fallback 😀", { file: REL, number: 5 });
    expect(failed.tracker).toMatchObject({ done: false });
    const bytes = fs.readFileSync(String(failed.commentFile), "utf8");
    expect(bytes).toBe(failed.comment);
    fault();
    start(cwd, dir);
    const resumed = report(cwd, "Exact fallback 😀", { file: REL, number: 5 });
    expect(fs.readFileSync(String(resumed.commentFile), "utf8")).toBe(bytes);
    expect(remote().comments.at(-1)?.body).toContain("Exact fallback 😀");
  });
});
