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
// code inside; `create-fails` counts down failed creates. `api` reads dev's
// rulesets from dev-rules.json (none when absent) and its classic protection
// from the dev-protected marker; `api-exit` fails every api call. Every call is logged.
const FAKE_GH = `#!/bin/sh
d="$FAKE_GH_DIR"
printf '%s\\n' "$*" >> "$d/calls"
if [ "$1" = "api" ]; then
  if [ -f "$d/api-exit" ]; then echo "gh api failed" >&2; exit "$(cat "$d/api-exit")"; fi
  case "$2" in
    */rules/branches/dev) cat "$d/dev-rules.json" 2>/dev/null || echo '[]' ;;
    */protection/required_status_checks) [ -f "$d/dev-protected" ] || { echo "Branch not protected" >&2; exit 1; } ;;
    *) exit 1 ;;
  esac
  exit 0
fi
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
  merge) if [ -f "$d/view-after.json" ]; then cp "$d/view-after.json" "$d/view.json"; fi ;;
  update-branch) ;;
  edit) ;;
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
  /** What `pr view` prints once `pr merge` has run. */
  viewAfterMerge: (pr: object) =>
    fs.writeFileSync(path.join(fake, "view-after.json"), JSON.stringify(pr)),
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

/** The `--issue=` flag for an issue number, or no flag when there is none. */
const issueArgs = (issue: string | undefined) => (issue === undefined ? [] : [`--issue=${issue}`]);

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
  const GH = { issueTracker: "github" };
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

  it.each([
    ["linear", "abc-1-x", "ABC-1"],
    ["jira", "ab2-7-x", "AB2-7"],
  ])(
    "writes the %s marker shape, taking the tracker from package.json",
    async (tracker, fid, issue) => {
      const cwd = repo(`feat/${fid}`, { issueTracker: tracker });
      gh.view(pr());
      const r = await run(cwd, ["prs", "open", `--fid=${fid}`, `--issue=${issue}`, "--title=t"]);
      expect(r.json.body).toBe(`<!-- bkit:issue=${issue} bkit:fid=${fid} -->\n`);
    },
  );

  it("writes the no-tracker marker shape", () => {
    expect(prMarker("none", "x-y", undefined)).toBe("<!-- bkit:fid=x-y -->");
  });

  it.each([
    ["github", "../../etc", "12"],
    ["github", "12-x", undefined],
    ["github", "12-x", "abc"],
    ["linear", "12-x", "ABC-1"],
    ["linear", "abc-1-x", undefined],
    ["linear", "ab2-1-x", "AB2-1"],
    ["jira", "mba-7-x", "mba-7"],
    ["jira", "12-x", "MBA-7"],
    ["jira", "mba-7-x", undefined],
    ["none", "-x", undefined],
  ])("refuses a %s marker with fid %j issue %j (exit 2)", async (tracker, fid, issue) => {
    const cwd = repo("feat/12-x", { issueTracker: tracker });
    const r = await run(cwd, ["prs", "open", `--fid=${fid}`, "--title=t", ...issueArgs(issue)]);
    expect(r.code).toBe(2);
    expect(gh.calls()).toEqual([]);
  });

  it.each([["[skip ci]"], ["[CI SKIP]"], ["[no ci]"], ["[skip actions]"], ["[actions skip]"]])(
    "refuses a title carrying %s before calling gh (exit 4)",
    async (token) => {
      const cwd = repo("feat/12-x", GH);
      const r = await run(cwd, [
        "prs",
        "open",
        "--fid=12-x",
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
      const r = await open(repo("feat/12-x", GH), "--issue=12", `--head=${head}`);
      expect(r.code).toBe(2);
    }
    expect((await open(repo("feat/12-x", GH), "--issue=12", "--base=x", "--head=x")).code).toBe(2);
  });

  it("exits 3 when the branch already has an open PR, and reuses it with --existing=reuse", async () => {
    const cwd = repo("feat/12-x", GH);
    gh.list([pr()]);
    const fail = await open(cwd, "--issue=12");
    expect(fail.code).toBe(3);
    expect(fail.json.number).toBe(7);
    const reuse = await open(cwd, "--issue=12", "--existing=reuse");
    expect(reuse.code).toBe(0);
    expect(reuse.json).toMatchObject({ created: false, number: 7 });
    expect(gh.calls().some((c) => c.startsWith("pr create"))).toBe(false);
  });

  it("retries a failed create once, and exits 5 when it fails twice", async () => {
    const cwd = repo("feat/12-x", GH);
    gh.view(pr());
    gh.createFails(1);
    expect((await open(cwd, "--issue=12")).json.created).toBe(true);
    gh.createFails(2);
    const r = await open(cwd, "--issue=12");
    expect(r.code).toBe(5);
    expect(r.err).toContain("failed twice");
  });

  it("exits 5 when the open-PR probe errors", async () => {
    gh.exit("list", 1);
    expect((await open(repo("feat/12-x", GH), "--issue=12")).code).toBe(5);
  });

  it("exits 80 with the title and body when gh needs auth (exit 4) or is missing", async () => {
    const cwd = repo("feat/12-x", GH);
    gh.exit("list", 4);
    const auth = await open(cwd, "--issue=12");
    expect(auth.code).toBe(80);
    expect(auth.json).toMatchObject({
      useMcp: true,
      created: false,
      title: "feat(12-x): thing",
      body: "<!-- bkit:issue=#12 bkit:fid=12-x -->\n",
      base: "dev",
      head: "feat/12-x",
    });

    // `gh` off PATH but `git` still present: openPrFor resolves the repo root with git first.
    const noGh = tmp("bkit-prs-no-gh-");
    const gitBin = spawnSync("which", ["git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(gitBin, path.join(noGh, "git"));
    process.env.PATH = noGh;
    const missing = await open(cwd, "--issue=12", "--head=feat/12-x");
    expect(missing.code).toBe(80);
    expect(missing.json.useMcp).toBe(true);
  });

  it("exits 6 when the created PR's base is not --base", async () => {
    gh.view(pr({ baseRefName: "main" }));
    const r = await open(repo("feat/12-x", GH), "--issue=12");
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
// scan-body and cross-check
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
  reason: "runtimeGithubCli=false",
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

// ---------------------------------------------------------------------------
// merge
// ---------------------------------------------------------------------------

describe("bkit prs merge", () => {
  const merge = (...extra: string[]) => run(repo(), ["prs", "merge", "--number=7", ...extra]);
  const mergeCall = () => gh.calls().find((c) => c.startsWith("pr merge")) ?? "";

  it("squash-merges with an empty body and the title subject, then reads MERGED back", async () => {
    gh.view(pr());
    gh.viewAfterMerge(pr({ state: "MERGED", mergeCommit: { oid: "squash1" } }));
    const r = await merge("--match-head=abc", "--delete-branch");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      merged: true,
      alreadyMerged: false,
      state: "MERGED",
      mergeCommitOid: "squash1",
      subject: "feat(12-x): thing (#7)",
      verdict: "PASS",
      failures: 0,
    });
    expect(mergeCall()).toContain("pr merge 7 --squash --subject feat(12-x): thing (#7) --body");
    expect(mergeCall()).toContain("--delete-branch --match-head-commit abc");
  });

  it("appends the auto-route marker on an exact bkit:auto label only", async () => {
    gh.view(pr());
    gh.viewAfterMerge(pr({ state: "MERGED" }));
    expect((await merge("--label=bkit:ship", "--label=bkit:auto")).json.subject).toBe(
      "feat(12-x): thing (#7) bkit [auto route]",
    );
    gh.view(pr());
    expect((await merge("--label=bkit:auto-paused")).json.subject).toBe("feat(12-x): thing (#7)");
  });

  it("takes an explicit --subject", async () => {
    gh.view(pr());
    gh.viewAfterMerge(pr({ state: "MERGED" }));
    expect((await merge("--subject=docs(12-x): ship DONE bkit [skip ci]")).json.subject).toBe(
      "docs(12-x): ship DONE bkit [skip ci]",
    );
  });

  it("runs no merge when the PR is already MERGED", async () => {
    gh.view(pr({ state: "MERGED", mergeCommit: { oid: "s" } }));
    const r = await merge();
    expect(r.json).toMatchObject({ merged: true, alreadyMerged: true, verdict: "PASS" });
    expect(mergeCall()).toBe("");
  });

  it("reports a merge that did not land as FAIL, and --expect-merged exits 7", async () => {
    gh.view(pr());
    const r = await merge();
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ merged: false, state: "OPEN", verdict: "FAIL", failures: 1 });
    gh.view(pr());
    expect((await merge("--expect-merged")).code).toBe(7);
  });

  it("exits 80 when gh needs auth, and 2 on a bad --number", async () => {
    gh.exit("view", 4);
    expect((await merge()).code).toBe(80);
    expect((await run(repo(), ["prs", "merge", "--number=x"])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// update-branch
// ---------------------------------------------------------------------------

describe("bkit prs update-branch", () => {
  const update = () => run(repo(), ["prs", "update-branch", "--number=7"]);
  const updateCall = () => gh.calls().find((c) => c.startsWith("pr update-branch")) ?? "";

  it("asks gh to refresh the PR head server-side", async () => {
    const r = await update();
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ number: "7", updated: true });
    expect(updateCall()).toBe("pr update-branch 7");
  });

  it("exits 80 when gh needs auth, and logs the MCP tool for the fallback", async () => {
    gh.exit("update-branch", 4);
    const r = await update();
    expect(r.code).toBe(80);
    expect(r.err).toContain("update_pull_request_branch");
  });

  it("exits 5 when gh fails, naming the 403 scope hint", async () => {
    gh.exit("update-branch", 1);
    const r = await update();
    expect(r.code).toBe(5);
    expect(r.err).toContain("403 = actions:write scope");
  });

  it("exits 2 on a bad --number", async () => {
    expect((await run(repo(), ["prs", "update-branch", "--number=x"])).code).toBe(2);
  });

  it("never reads dev's required checks without --only-if-required", async () => {
    await update();
    expect(gh.calls().some((c) => c.startsWith("api "))).toBe(false);
  });
});

describe("bkit prs update-branch --only-if-required", () => {
  const onGithub = () => {
    const cwd = repo();
    git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    return cwd;
  };
  const update = () =>
    run(onGithub(), ["prs", "update-branch", "--number=7", "--only-if-required"]);
  const updated = () => gh.calls().some((c) => c.startsWith("pr update-branch"));

  it("skips the update when dev requires no status checks", async () => {
    const r = await update();
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ number: "7", updated: false });
    expect(updated()).toBe(false);
    expect(gh.calls()).toContain("api repos/o/r/rules/branches/dev");
    expect(r.err).toContain("dev push run tests the merged result");
  });

  it("updates when a dev ruleset requires status checks", async () => {
    fs.writeFileSync(
      path.join(fake, "dev-rules.json"),
      JSON.stringify([{ type: "deletion" }, { type: "required_status_checks" }]),
    );
    const r = await update();
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ number: "7", updated: true });
    expect(updated()).toBe(true);
  });

  it("updates when dev's branch protection requires status checks", async () => {
    fs.writeFileSync(path.join(fake, "dev-protected"), "");
    const r = await update();
    expect(r.json).toEqual({ number: "7", updated: true });
    expect(updated()).toBe(true);
  });

  it("ignores dev rulesets that require no checks", async () => {
    fs.writeFileSync(path.join(fake, "dev-rules.json"), JSON.stringify([{ type: "deletion" }]));
    const r = await update();
    expect(r.json).toEqual({ number: "7", updated: false });
    expect(updated()).toBe(false);
  });

  it("updates when the repo cannot be resolved", async () => {
    const r = await run(repo(), ["prs", "update-branch", "--number=7", "--only-if-required"]);
    expect(r.json).toEqual({ number: "7", updated: true });
    expect(updated()).toBe(true);
    expect(r.err).toContain("cannot resolve the repo");
  });

  it("exits 80 without updating when gh cannot read dev's required checks", async () => {
    gh.exit("api", 4);
    const r = await update();
    expect(r.code).toBe(80);
    expect(r.err).toContain("update_pull_request_branch");
    expect(updated()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checks
// ---------------------------------------------------------------------------

describe("bkit prs checks", () => {
  const rollup = (...checks: object[]) => gh.view({ statusCheckRollup: checks });
  const checks = () => run(repo(), ["prs", "checks", "--number=7"]);

  it("is green when every check finished successfully", async () => {
    rollup(
      { name: "bkit-tests-unit", status: "COMPLETED", conclusion: "SUCCESS" },
      { context: "Vercel", state: "SUCCESS" },
    );
    const r = await checks();
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      number: "7",
      total: 2,
      passing: 2,
      failed: 0,
      pending: 0,
      green: true,
      failing: [],
    });
  });

  it("is not green when a check failed, naming it (exit 1)", async () => {
    rollup(
      { name: "bkit-tests-unit", status: "COMPLETED", conclusion: "SUCCESS" },
      { name: "bkit-tests-live", status: "COMPLETED", conclusion: "FAILURE" },
    );
    const r = await checks();
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({
      total: 2,
      passing: 1,
      failed: 1,
      green: false,
      failing: ["bkit-tests-live"],
    });
  });

  it("counts an unfinished check run and a PENDING commit status as pending", async () => {
    rollup({ name: "a", status: "IN_PROGRESS" }, { context: "b", state: "PENDING" });
    const r = await checks();
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ total: 2, pending: 2, green: false });
  });

  it("is not green on an empty rollup (total 0)", async () => {
    rollup();
    const r = await checks();
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ total: 0, green: false });
  });

  it("treats NEUTRAL and SKIPPED conclusions as passing", async () => {
    rollup(
      { name: "a", status: "COMPLETED", conclusion: "NEUTRAL" },
      { name: "b", status: "COMPLETED", conclusion: "SKIPPED" },
    );
    expect((await checks()).json.green).toBe(true);
  });

  it("exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number", async () => {
    gh.exit("view", 1);
    expect((await checks()).code).toBe(4);
    gh.exit("view", 4);
    expect((await checks()).code).toBe(80);
    expect((await run(repo(), ["prs", "checks", "--number=x"])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// verbose-ci
// ---------------------------------------------------------------------------

describe("bkit prs verbose-ci", () => {
  const verbose = (state: string) =>
    run(repo(), ["prs", "verbose-ci", "--number=7", `--state=${state}`]);
  const editCall = () => gh.calls().find((c) => c.startsWith("pr edit")) ?? "";

  it("adds the marker to the title", async () => {
    gh.view(pr());
    const r = await verbose("on");
    expect(r.json).toEqual({ title: "feat(12-x): thing bkit [verbose ci]", changed: true });
    expect(editCall()).toBe("pr edit 7 --title feat(12-x): thing bkit [verbose ci]");
  });

  it("is a no-op when the title already says so", async () => {
    gh.view(pr({ title: "feat(12-x): thing bkit [verbose ci]" }));
    expect((await verbose("on")).json.changed).toBe(false);
    expect(editCall()).toBe("");
  });

  it("strips the marker, with or without its bkit prefix", async () => {
    gh.view(pr({ title: "feat(12-x): thing bkit [verbose ci]" }));
    expect((await verbose("off")).json.title).toBe("feat(12-x): thing");
    gh.view(pr({ title: "feat(12-x): thing [verbose ci]" }));
    expect((await verbose("off")).json.title).toBe("feat(12-x): thing");
  });

  it("exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state", async () => {
    gh.view(pr());
    gh.exit("edit", 1);
    expect((await verbose("on")).code).toBe(5);
    gh.exit("view", 4);
    expect((await verbose("on")).code).toBe(80);
    expect((await verbose("maybe")).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// transport-row --scan / --cross-check
// ---------------------------------------------------------------------------

describe("bkit prs transport-row --kind=close --scan", () => {
  function landed(...messages: string[]) {
    const cwd = repo("dev");
    git(cwd, "commit", "-q", "--allow-empty", ...messages.flatMap((m) => ["-m", m]));
    const file = path.join(cwd, "status.jsonl");
    fs.writeFileSync(file, "");
    return { cwd, file, sha: git(cwd, "rev-parse", "HEAD") };
  }
  const audit = (cwd: string, file: string, sha: string, ...extra: string[]) =>
    run(cwd, [
      "prs",
      "transport-row",
      `--file=${file}`,
      "--kind=close",
      "--shape=push",
      `--sha=${sha}`,
      ...extra,
    ]);

  it("scans a clean landed body and records the close-transport row", async () => {
    const { cwd, file, sha } = landed("chore(1-x): close-workflow");
    const r = await audit(cwd, file, sha, "--scan");
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({
      type: "close-transport",
      shape: "push",
      sha,
      scanResult: "clean",
    });
  });

  it("records a skip token found in the body, then exits 1", async () => {
    const { cwd, file, sha } = landed("docs(1-x): close", "* chore: setup bkit [skip ci]");
    const r = await audit(cwd, file, sha, "--scan");
    expect(r.code).toBe(1);
    expect(r.json.row.scanResult).toBe("skip-token-found");
    expect(fs.readFileSync(file, "utf-8")).toContain("skip-token-found");
  });

  it("exits 8 on an unreadable commit, writing nothing", async () => {
    const { cwd, file } = landed("x");
    expect(
      (await audit(cwd, file, "0123456789abcdef0123456789abcdef01234567", "--scan")).code,
    ).toBe(8);
    expect(fs.readFileSync(file, "utf-8")).toBe("");
  });

  it("--cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded", async () => {
    const { cwd, file, sha } = landed("x");
    fs.writeFileSync(file, `${JSON.stringify(resolved(true, true, false))}\n`);
    const r = await audit(cwd, file, sha, "--scan", "--cross-check=mcp");
    expect(r.code).toBe(1);
    expect(fs.readFileSync(file, "utf-8")).not.toContain("close-transport");
    expect((await audit(cwd, file, sha, "--scan", "--cross-check=gh")).code).toBe(0);
  });

  it("needs --scan or --scan-result", async () => {
    const { cwd, file, sha } = landed("x");
    expect((await audit(cwd, file, sha, "--cross-check=gh")).code).toBe(2);
  });
});
