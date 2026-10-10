import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { prBody, prMarker, prsCommand } from "./prs";

const dirs: string[] = [];
const ORIGINAL_PATH = process.env.PATH;
let fake: string;

const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

// A `gh` stand-in driven by files in $FAKE_GH_DIR: list.json / view.json are
// printed for `pr list` / `pr view`; `<verb>-exit` makes that verb exit with the
// code inside; `create-fails` counts down failed creates. Every call is logged.
const FAKE_GH = `#!/bin/sh
d="$FAKE_GH_DIR"
printf '%s\\n' "$*" >> "$d/calls"
verb="$2"
if [ -f "$d/$verb-exit" ]; then echo "gh $verb failed" >&2; exit "$(cat "$d/$verb-exit")"; fi
case "$verb" in
  list) cat "$d/list.json" ;;
  view) cat "$d/view.json" ;;
  create)
    n=$(cat "$d/create-fails" 2>/dev/null || echo 0)
    if [ "$n" -gt 0 ]; then echo $((n - 1)) > "$d/create-fails"; echo "transient" >&2; exit 1; fi
    while [ $# -gt 0 ]; do
      case "$1" in --body) printf '%s' "$2" > "$d/body"; shift ;; --title) printf '%s' "$2" > "$d/title"; shift ;; esac
      shift
    done
    echo "https://github.com/o/r/pull/7" ;;
  *) exit 1 ;;
esac
`;

beforeEach(() => {
  fake = tmp("bkit-prs-gh-");
  fs.mkdirSync(path.join(fake, "bin"));
  fs.writeFileSync(path.join(fake, "bin", "gh"), FAKE_GH, { mode: 0o755 });
  fs.writeFileSync(path.join(fake, "list.json"), "[]");
  process.env.PATH = `${path.join(fake, "bin")}:${ORIGINAL_PATH ?? ""}`;
  process.env.FAKE_GH_DIR = fake;
});

afterEach(() => {
  process.env.PATH = ORIGINAL_PATH;
  delete process.env.FAKE_GH_DIR;
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const gh = {
  list: (prs: object[]) => fs.writeFileSync(path.join(fake, "list.json"), JSON.stringify(prs)),
  view: (pr: object) => fs.writeFileSync(path.join(fake, "view.json"), JSON.stringify(pr)),
  exit: (verb: string, code: number) =>
    fs.writeFileSync(path.join(fake, `${verb}-exit`), String(code)),
  createFails: (n: number) => fs.writeFileSync(path.join(fake, "create-fails"), String(n)),
  calls: () =>
    fs.existsSync(path.join(fake, "calls"))
      ? fs.readFileSync(path.join(fake, "calls"), "utf-8").trim().split("\n")
      : [],
  sent: (what: "body" | "title") => fs.readFileSync(path.join(fake, what), "utf-8"),
};

const pr = (extra: Record<string, unknown> = {}) => ({
  number: 7,
  url: "https://github.com/o/r/pull/7",
  state: "OPEN",
  baseRefName: "dev",
  headRefName: "feat/12-x",
  headRefOid: "abc",
  title: "feat(12-x): thing",
  mergeCommit: null,
  ...extra,
});

const sh = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  });
const git = (cwd: string, ...args: string[]) => sh(cwd, ...args).stdout.trim();

function repo(branch = "feat/12-x", bkit?: Record<string, unknown>) {
  const cwd = tmp("bkit-prs-");
  git(cwd, "init", "-q", "-b", branch);
  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
  if (bkit) fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ bkit }));
  return cwd;
}

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(argv, [prsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return {
    code,
    json: out.length ? JSON.parse(out.join("")) : undefined,
    out: out.join(""),
    err: err.join(""),
  };
}

// ---------------------------------------------------------------------------
// open
// ---------------------------------------------------------------------------

describe("bkit prs open", () => {
  const open = (cwd: string, ...extra: string[]) =>
    run(cwd, ["prs", "open", "--fid=12-x", "--title=feat(12-x): thing", ...extra]);

  it("creates the PR with the github marker first and the plan in the bkit block", async () => {
    const cwd = repo("feat/12-x", { issueTracker: "github" });
    fs.mkdirSync(path.join(cwd, "docs"));
    fs.writeFileSync(path.join(cwd, "docs/12-x-plan.md"), "plan");
    gh.view(pr());
    const r = await open(cwd, "--issue=12", "--plan=docs/12-x-plan.md");
    expect(r.code).toBe(0);
    const body =
      "<!-- bkit:issue=#12 bkit:fid=12-x -->\n<!-- bkit:start -->\ndocs/12-x-plan.md\n<!-- bkit:end -->\n";
    expect(r.json).toEqual({
      created: true,
      useMcp: false,
      number: 7,
      url: "https://github.com/o/r/pull/7",
      base: "dev",
      head: "feat/12-x",
      title: "feat(12-x): thing",
      body,
    });
    expect(gh.sent("body")).toBe(body);
    expect(gh.calls().find((c) => c.startsWith("pr create"))).toContain(
      "--base dev --head feat/12-x",
    );
  });

  it("always writes the marker, even with no plan", async () => {
    const cwd = repo("feat/12-x", { issueTracker: "github" });
    gh.view(pr());
    const r = await open(cwd, "--issue=#12", "--plan=docs/missing-plan.md");
    expect(r.code).toBe(0);
    expect(r.json.body).toBe("<!-- bkit:issue=#12 bkit:fid=12-x -->\n");
    expect(r.err).toContain("not present");
  });

  it("puts notes above the plan path", () => {
    expect(prBody("<!-- m -->", ["opened by ship"], "p.md")).toBe(
      "<!-- m -->\n<!-- bkit:start -->\nopened by ship\np.md\n<!-- bkit:end -->\n",
    );
  });

  it("writes the linear and no-tracker marker shapes, taking the tracker from package.json", async () => {
    const lin = repo("feat/abc-1-x", { issueTracker: "linear" });
    gh.view(pr());
    const r = await run(lin, ["prs", "open", "--fid=abc-1-x", "--issue=ABC-1", "--title=t"]);
    expect(r.json.body).toBe("<!-- bkit:issue=ABC-1 bkit:fid=abc-1-x -->\n");
    expect(prMarker("none", "x-y", undefined)).toBe("<!-- bkit:fid=x-y -->");
  });

  it.each([
    ["github", "../../etc", "12"],
    ["github", "12-x", undefined],
    ["github", "12-x", "abc"],
    ["linear", "12-x", "ABC-1"],
    ["none", "-x", undefined],
  ])("refuses a %s marker with fid %j issue %j (exit 2)", async (tracker, fid, issue) => {
    const cwd = repo();
    const r = await run(cwd, [
      "prs",
      "open",
      `--fid=${fid}`,
      `--tracker=${tracker}`,
      "--title=t",
      ...(issue === undefined ? [] : [`--issue=${issue}`]),
    ]);
    expect(r.code).toBe(2);
    expect(gh.calls()).toEqual([]);
  });

  it.each([["[skip ci]"], ["[CI SKIP]"], ["[no ci]"], ["[skip actions]"], ["[actions skip]"]])(
    "refuses a title carrying %s before calling gh (exit 4)",
    async (token) => {
      const cwd = repo();
      const r = await run(cwd, [
        "prs",
        "open",
        "--fid=12-x",
        "--tracker=github",
        "--issue=12",
        `--title=feat: x ${token}`,
      ]);
      expect(r.code).toBe(4);
      expect(r.out).toBe("");
      expect(gh.calls()).toEqual([]);
    },
  );

  it("refuses a PR from dev, main, or the base itself", async () => {
    for (const head of ["dev", "main"]) {
      const r = await open(repo(), "--tracker=github", "--issue=12", `--head=${head}`);
      expect(r.code).toBe(2);
    }
    expect(
      (await open(repo(), "--tracker=github", "--issue=12", "--base=x", "--head=x")).code,
    ).toBe(2);
  });

  it("exits 3 when the branch already has an open PR, and reuses it with --existing=reuse", async () => {
    const cwd = repo();
    gh.list([pr()]);
    const fail = await open(cwd, "--tracker=github", "--issue=12");
    expect(fail.code).toBe(3);
    expect(fail.json.number).toBe(7);
    const reuse = await open(cwd, "--tracker=github", "--issue=12", "--existing=reuse");
    expect(reuse.code).toBe(0);
    expect(reuse.json).toMatchObject({ created: false, number: 7 });
    expect(gh.calls().some((c) => c.startsWith("pr create"))).toBe(false);
  });

  it("retries a failed create once, and exits 5 when it fails twice", async () => {
    const cwd = repo();
    gh.view(pr());
    gh.createFails(1);
    expect((await open(cwd, "--tracker=github", "--issue=12")).json.created).toBe(true);
    gh.createFails(2);
    const r = await open(cwd, "--tracker=github", "--issue=12");
    expect(r.code).toBe(5);
    expect(r.err).toContain("failed twice");
  });

  it("exits 5 when the open-PR probe errors", async () => {
    gh.exit("list", 1);
    expect((await open(repo(), "--tracker=github", "--issue=12")).code).toBe(5);
  });

  it("exits 80 with the title and body when gh needs auth (exit 4) or is missing", async () => {
    const cwd = repo();
    gh.exit("list", 4);
    const auth = await open(cwd, "--tracker=github", "--issue=12");
    expect(auth.code).toBe(80);
    expect(auth.json).toMatchObject({
      useMcp: true,
      created: false,
      title: "feat(12-x): thing",
      body: "<!-- bkit:issue=#12 bkit:fid=12-x -->\n",
      base: "dev",
      head: "feat/12-x",
    });

    process.env.PATH = tmp("bkit-prs-empty-path-");
    const missing = await open(cwd, "--tracker=github", "--issue=12", "--head=feat/12-x");
    expect(missing.code).toBe(80);
    expect(missing.json.useMcp).toBe(true);
  });

  it("exits 6 when the created PR's base is not --base", async () => {
    gh.view(pr({ baseRefName: "main" }));
    const r = await open(repo(), "--tracker=github", "--issue=12");
    expect(r.code).toBe(6);
    expect(r.json.base).toBe("main");
  });
});

// ---------------------------------------------------------------------------
// probe
// ---------------------------------------------------------------------------

describe("bkit prs probe", () => {
  it("returns the open PR for the current branch, filtering by --base when given", async () => {
    const cwd = repo();
    gh.list([pr()]);
    const r = await run(cwd, ["prs", "probe", "--base=dev"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ found: true, number: 7, state: "OPEN", baseRefName: "dev" });
    expect(gh.calls()[0]).toContain("--head feat/12-x --state open");
    expect(gh.calls()[0]).toContain("--base dev");
    await run(cwd, ["prs", "probe"]);
    expect(gh.calls()[1]).not.toContain("--base");
  });

  it("exits 1 with found=false when there is none", async () => {
    const r = await run(repo(), ["prs", "probe"]);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ found: false, number: null });
  });

  it("--state=all prefers OPEN, then MERGED, and never picks CLOSED", async () => {
    const cwd = repo();
    gh.list([
      pr({ number: 1, state: "CLOSED" }),
      pr({ number: 2, state: "MERGED", mergeCommit: { oid: "m" } }),
      pr({ number: 3 }),
    ]);
    expect((await run(cwd, ["prs", "probe", "--state=all"])).json.number).toBe(3);
    gh.list([
      pr({ number: 1, state: "CLOSED" }),
      pr({ number: 2, state: "MERGED", mergeCommit: { oid: "m" } }),
    ]);
    expect((await run(cwd, ["prs", "probe", "--state=all"])).json).toMatchObject({
      number: 2,
      mergeCommitOid: "m",
    });
    gh.list([pr({ number: 1, state: "CLOSED" })]);
    expect((await run(cwd, ["prs", "probe", "--state=all"])).code).toBe(1);
  });

  it("--number reads one PR, mergeable included", async () => {
    gh.view(pr({ mergeable: "CONFLICTING" }));
    const r = await run(repo(), ["prs", "probe", "--number=7"]);
    expect(r.json).toMatchObject({ number: 7, mergeable: "CONFLICTING" });
    expect(gh.calls()[0]).toMatch(/^pr view 7 /);
  });

  it("reports a CI-suppressing token in the title, any spelling, else null", async () => {
    gh.view(pr({ title: "feat: thing [CI Skip]" }));
    expect((await run(repo(), ["prs", "probe", "--number=7"])).json.titleSkipToken).toBe(
      "[CI Skip]",
    );
    gh.view(pr({ title: "feat: thing" }));
    expect((await run(repo(), ["prs", "probe", "--number=7"])).json.titleSkipToken).toBeNull();
  });

  it("exits 4 when gh errors and 80 when it needs auth", async () => {
    gh.exit("list", 1);
    expect((await run(repo(), ["prs", "probe"])).code).toBe(4);
    gh.exit("list", 4);
    expect((await run(repo(), ["prs", "probe"])).code).toBe(80);
  });

  it("refuses a bad --state or --number", async () => {
    expect((await run(repo(), ["prs", "probe", "--state=closed"])).code).toBe(2);
    expect((await run(repo(), ["prs", "probe", "--number=7;x"])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// guard-checkout
// ---------------------------------------------------------------------------

const resolved = (worktrees: boolean, devPushes: boolean, githubCli = true) => ({
  type: "runtime-resolved",
  workflow: "design",
  at: "2026-07-24T00:00:00Z",
  runtime: "LOCAL",
  runtimeWorktrees: worktrees,
  runtimeDevPushes: devPushes,
  runtimeGithubCli: githubCli,
});

function statusLog(rows: object[]) {
  const d = tmp("bkit-prs-status-");
  const file = path.join(d, "status.jsonl");
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
  return file;
}

describe("bkit prs scan-body", () => {
  function commit(...messages: string[]) {
    const cwd = repo("main");
    git(cwd, "commit", "-q", "--allow-empty", ...messages.flatMap((m) => ["-m", m]));
    return { cwd, sha: git(cwd, "rev-parse", "HEAD") };
  }
  const scan = (cwd: string, sha: string, ...extra: string[]) =>
    run(cwd, ["prs", "scan-body", `--sha=${sha}`, ...extra]);

  it.each([
    ["[skip ci]"],
    ["[ci skip]"],
    ["[no ci]"],
    ["[skip actions]"],
    ["[actions skip]"],
    ["[SKIP CI]"],
  ])("flags %s in the landed commit body (exit 1)", async (token) => {
    const { cwd, sha } = commit("docs(x): close", `* chore(y): worktree-setup bkit ${token}`);
    const r = await scan(cwd, sha);
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ sha, scanResult: "skip-token-found", token });
    expect(r.err).toContain("inherited a CI-suppression token");
  });

  it("passes a token-free body", async () => {
    const { cwd, sha } = commit("docs(x): close DONE");
    const r = await scan(cwd, sha);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ sha, scanResult: "clean", token: null });
  });

  it("passes a deliberate token in the SUBJECT with a clean body (docs-only close)", async () => {
    const { cwd, sha } = commit("docs(x): design DONE bkit [skip ci]");
    expect((await scan(cwd, sha)).code).toBe(0);
  });

  it("exits 2 on an empty or option-like sha, 3 on an unreadable one", async () => {
    const { cwd } = commit("x");
    expect((await scan(cwd, "")).code).toBe(2);
    expect((await scan(cwd, "--output=/tmp/x")).code).toBe(2);
    expect((await scan(cwd, "0000000000000000000000000000000000000000")).code).toBe(3);
  });

  it("a failed --remote-ref fetch is logged and the local commit is still scanned", async () => {
    const { cwd, sha } = commit("docs(x): close DONE");
    const r = await scan(cwd, sha, "--remote-ref=dev");
    expect(r.code).toBe(0);
    expect(r.err).toContain("git fetch origin dev failed");
  });
});

// ---------------------------------------------------------------------------
// cross-check
// ---------------------------------------------------------------------------

const fallbackRow = {
  type: "transport-fallback",
  from: "gh pr merge",
  to: "merge_pull_request",
  reason: "RUNTIME_GITHUBCLI=false",
  assertedBy: "pull_request_read",
  at: "2026-07-24T00:01:00Z",
};

describe("bkit prs cross-check", () => {
  const check = (file: string, transport: string) =>
    run(os.tmpdir(), ["prs", "cross-check", `--file=${file}`, `--transport=${transport}`]);

  it("fails an mcp close with gh recorded unavailable and no transport-fallback row", async () => {
    const r = await check(statusLog([resolved(true, true, false)]), "mcp");
    expect(r.code).toBe(1);
    expect(r.json).toEqual({
      ok: false,
      runtimeGithubCli: false,
      transport: "mcp",
      fallbackRows: 0,
    });
    expect(r.err).toContain("no transport-fallback row exists");
  });

  it("passes when the fallback row is present", async () => {
    expect((await check(statusLog([resolved(true, true, false), fallbackRow]), "mcp")).code).toBe(
      0,
    );
  });

  it.each([["gh"], ["git"]])(
    "exempts transport %s even with gh recorded unavailable",
    async (t) => {
      expect((await check(statusLog([resolved(true, true, false)]), t)).code).toBe(0);
    },
  );

  it("passes when gh was available, or no runtime-resolved row exists", async () => {
    expect((await check(statusLog([resolved(true, true, true)]), "mcp")).code).toBe(0);
    const none = await check(statusLog([]), "mcp");
    expect(none.code).toBe(0);
    expect(none.json.runtimeGithubCli).toBeNull();
  });

  it("reads the LATEST runtime-resolved row", async () => {
    const file = statusLog([resolved(true, true, true), resolved(true, true, false)]);
    expect((await check(file, "mcp")).code).toBe(1);
  });

  it("a runtime-resolved row with backslashes in its gh error does not make the log unreadable", async () => {
    const row = { ...resolved(true, true, false), runtimeGithubCliErr: 'proxy C:\\Users "q"' };
    expect((await check(statusLog([row, fallbackRow]), "mcp")).code).toBe(0);
  });

  it("exits 3 on a missing or malformed log and 2 on an unknown transport", async () => {
    expect((await check(path.join(os.tmpdir(), "no-such-status.jsonl"), "mcp")).code).toBe(3);
    const bad = statusLog([]);
    fs.writeFileSync(bad, "{not json\n");
    expect((await check(bad, "mcp")).code).toBe(3);
    expect((await check(statusLog([]), "carrier-pigeon")).code).toBe(2);
  });

  it("a malformed log exits 3 for every transport: the gh / git exemption never hides it", async () => {
    const bad = statusLog([]);
    fs.writeFileSync(bad, "{not json\n");
    for (const t of ["mcp", "gh", "git"]) expect((await check(bad, t)).code, t).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// transport-row
// ---------------------------------------------------------------------------

describe("bkit prs transport-row", () => {
  const row = (file: string, ...args: string[]) =>
    run(os.tmpdir(), ["prs", "transport-row", `--file=${file}`, ...args]);
  const lines = (file: string) =>
    fs
      .readFileSync(file, "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);

  it("appends a fallback row, keeping backslash arguments verbatim", async () => {
    const file = statusLog([resolved(true, true, false)]);
    const r = await row(
      file,
      "--kind=fallback",
      "--from=gh pr merge",
      "--to=merge_pull_request",
      "--reason=C:\\temp\\new",
      "--asserted-by=reread",
    );
    expect(r.code).toBe(0);
    const written = lines(file).at(-1)!;
    expect(written).toEqual(r.json.row);
    expect(Object.keys(written)).toEqual(["type", "from", "to", "reason", "assertedBy", "at"]);
    expect(written.reason).toBe("C:\\temp\\new");
    expect(String(written.at)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    // and the cross-check now sees it
    expect(
      (await run(os.tmpdir(), ["prs", "cross-check", `--file=${file}`, "--transport=mcp"])).code,
    ).toBe(0);
  });

  it("appends a close-transport row", async () => {
    const file = statusLog([]);
    const r = await row(
      file,
      "--kind=close",
      "--shape=push",
      "--sha=deadbeef",
      "--scan-result=clean",
    );
    expect(r.code).toBe(0);
    expect(Object.keys(lines(file)[0]!)).toEqual(["type", "shape", "sha", "scanResult", "at"]);
    expect(r.json.row).toMatchObject({
      type: "close-transport",
      shape: "push",
      sha: "deadbeef",
      scanResult: "clean",
    });
  });

  it.each([
    [["--kind=close", "--shape=A", "--sha=x", "--scan-result=clean"]],
    [["--kind=close", "--shape=pr", "--sha=x", "--scan-result=dirty"]],
    [["--kind=close", "--shape=pr", "--scan-result=clean"]],
    [["--kind=fallback", "--from=", "--to=t", "--reason=r", "--asserted-by=a"]],
    [["--kind=other"]],
  ])("refuses %j (exit 2, nothing written)", async (args) => {
    const file = statusLog([]);
    expect((await row(file, ...args)).code).toBe(2);
    expect(fs.readFileSync(file, "utf-8")).toBe("");
  });

  it("exits 3 when status.jsonl does not exist", async () => {
    const file = path.join(tmp("bkit-prs-"), "status.jsonl");
    expect(
      (await row(file, "--kind=close", "--shape=pr", "--sha=x", "--scan-result=clean")).code,
    ).toBe(3);
    expect(fs.existsSync(file)).toBe(false);
  });
});
