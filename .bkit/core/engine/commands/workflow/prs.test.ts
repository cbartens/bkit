import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { EXIT_BASE_MAIN, EXIT_BASE_NOT_DEV, prBody, prMarker, prsCommand } from "./prs";

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
if [ -f "$d/$verb-exit" ]; then
  if [ "$verb" = merge ]; then
    [ ! -f "$d/view-after.json" ] || cp "$d/view-after.json" "$d/view.json"
    [ ! -f "$d/after-view-exit" ] || cp "$d/after-view-exit" "$d/view-exit"
  fi
  echo "gh $verb failed" >&2; exit "$(cat "$d/$verb-exit")"
fi
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
  const code = await runCommand([...argv, "--json"], [prsCommand], {
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
  const GH = { tracker: { default: "github" } };
  const open = (cwd: string, ...extra: string[]) =>
    run(cwd, ["prs", "open", "--fid=12-x", "--title=feat(12-x): thing", ...extra]);

  it("creates the PR with the github marker first and the plan in the bkit block", async () => {
    const cwd = repo("feat/12-x", { tracker: { default: "github" } });
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

  it("--file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3", async () => {
    const cwd = repo("feat/12-x", GH);
    const file = path.join(tmp("bkit-prs-status-"), "status.jsonl");
    gh.view(pr());
    const first = await open(cwd, `--file=${file}`, "--workflow=ship");
    expect(first.code).toBe(0);
    const rows = fs
      .readFileSync(file, "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(rows).toEqual([
      expect.objectContaining({
        type: "engine-action",
        action: "pr-open",
        ref: "https://github.com/o/r/pull/7",
      }),
    ]);
    gh.list([pr()]);
    const again = await open(cwd, `--file=${file}`, "--workflow=ship");
    expect(again.code).toBe(0);
    expect(again.json).toMatchObject({ created: false, number: 7 });
    expect(gh.calls().filter((c) => c.startsWith("pr create"))).toHaveLength(1);
    // Without the row, an open PR still refuses a blind create.
    expect((await open(cwd)).code).toBe(3);
  });

  it("--file needs --workflow", async () => {
    const cwd = repo("feat/12-x", GH);
    expect((await open(cwd, "--file=s.jsonl")).code).toBe(2);
  });

  it("always writes the marker, even with no plan", async () => {
    const cwd = repo("feat/12-x", { tracker: { default: "github" } });
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
      const cwd = repo(`feat/${fid}`, { tracker: { default: tracker } });
      gh.view(pr());
      const r = await run(cwd, ["prs", "open", `--fid=${fid}`, `--issue=${issue}`, "--title=t"]);
      expect(r.json.body).toBe(`<!-- bkit:issue=${issue} bkit:fid=${fid} -->\n`);
    },
  );

  it("prMarker writes a FID-only marker with github wired and no issue", async () => {
    expect(prMarker("github", "dev-ci-failures", undefined)).toBe(
      "<!-- bkit:fid=dev-ci-failures -->",
    );
    expect(prMarker("linear", "dev-ci-failures", "")).toBe("<!-- bkit:fid=dev-ci-failures -->");
    expect(prMarker("jira", "dev-ci-failures", "")).toBe("<!-- bkit:fid=dev-ci-failures -->");
    const cwd = repo("feat/dev-ci-failures", GH);
    gh.view(pr({ headRefName: "feat/dev-ci-failures" }));
    const r = await run(cwd, ["prs", "open", "--fid=dev-ci-failures", "--title=t"]);
    expect(r.code).toBe(0);
    expect(r.json.body).toBe("<!-- bkit:fid=dev-ci-failures -->\n");
    expect(gh.sent("body")).toBe("<!-- bkit:fid=dev-ci-failures -->\n");
  });

  it("a FID-only marker takes any slug, a tracker-shaped one included", () => {
    for (const fid of ["12-x", "fix-2-retry", "upgrade-react-19", "2024-roadmap"]) {
      expect(prMarker("github", fid, undefined)).toBe(`<!-- bkit:fid=${fid} -->`);
      expect(prMarker("linear", fid, "")).toBe(`<!-- bkit:fid=${fid} -->`);
    }
    expect(() => prMarker("github", "Fix_CI", undefined)).toThrow(/not a slug/);
  });

  it("a marker with an issue needs the FID to embed that same issue", () => {
    expect(prMarker("github", "123-foo", "123")).toBe("<!-- bkit:issue=#123 bkit:fid=123-foo -->");
    expect(() => prMarker("github", "123-foo", "456")).toThrow(/embeds issue 123, not the run's/);
    expect(() => prMarker("linear", "abc-1-x", "ABC-2")).toThrow(/embeds issue ABC-1/);
    expect(() => prMarker("jira", "mba-7-x", "MBA-8")).toThrow(/embeds issue MBA-7/);
  });

  it("writes the no-tracker marker shape", () => {
    expect(prMarker("none", "x-y", undefined)).toBe("<!-- bkit:fid=x-y -->");
  });

  it.each([
    ["github", "../../etc", "12"],
    ["github", "12-x", "abc"],
    ["github", "12-x", "13"],
    ["linear", "12-x", "ABC-1"],
    ["linear", "ab2-1-x", "AB2-1"],
    ["jira", "mba-7-x", "mba-7"],
    ["jira", "12-x", "MBA-7"],
    ["none", "-x", undefined],
  ])("refuses a %s marker with fid %j issue %j (exit 2)", async (tracker, fid, issue) => {
    const cwd = repo("feat/12-x", { tracker: { default: tracker } });
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
    expect(fs.readFileSync(auth.json.bodyFile, "utf-8")).toBe(auth.json.body);

    // `gh` off PATH but `git` still present: openPrFor resolves the repo root with git first.
    const noGh = tmp("bkit-prs-no-gh-");
    const gitBin = spawnSync("which", ["git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(gitBin, path.join(noGh, "git"));
    process.env.PATH = noGh;
    const missing = await open(cwd, "--issue=12", "--head=feat/12-x");
    expect(missing.code).toBe(80);
    expect(missing.json.useMcp).toBe(true);
  });

  it("prs open refuses --base=main", async () => {
    const cwd = repo("feat/12-x", GH);
    gh.view(pr({ baseRefName: "main" }));
    const r = await open(cwd, "--issue=12", "--base=main");
    expect(r.code).toBe(EXIT_BASE_MAIN);
    expect(r.err).toContain("main");
    expect(gh.calls()).toEqual([]);
    expect(r.out).toBe("");
  });

  it.each(["refs/heads/main", "origin/main", "heads/main", "refs/remotes/origin/main"])(
    "prs open refuses --base=%s, the same branch as main",
    async (base) => {
      const cwd = repo("feat/12-x", GH);
      gh.view(pr({ baseRefName: "main" }));
      const r = await open(cwd, "--issue=12", `--base=${base}`);
      expect(r.code).toBe(EXIT_BASE_MAIN);
      expect(gh.calls()).toEqual([]);
    },
  );

  it("prs open still opens against any other base", async () => {
    const cwd = repo("feat/12-x", GH);
    gh.view(pr({ baseRefName: "release" }));
    const r = await open(cwd, "--issue=12", "--base=release");
    expect(r.code).toBe(0);
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

describe("bkit prs probe ship entry", () => {
  function mergedFeature() {
    const cwd = repo();
    const origin = tmp("bkit-prs-ship-origin-");
    git(origin, "init", "-q", "--bare", "-b", "dev");
    git(cwd, "remote", "add", "origin", origin);
    git(cwd, "push", "-q", "origin", "HEAD:dev", "HEAD:feat/12-x");
    const mergedHead = git(cwd, "rev-parse", "HEAD");
    const merged = pr({
      state: "MERGED",
      headRefOid: mergedHead,
      mergeCommit: { oid: mergedHead },
    });
    gh.list([merged]);
    return { cwd, origin, merged, mergedHead };
  }

  const shipProbe = (cwd: string, ...extra: string[]) =>
    run(cwd, [
      "prs",
      "probe",
      "--head=feat/12-x",
      "--base=dev",
      "--state=all",
      "--ship-entry",
      ...extra,
    ]);

  it("does not adopt a merged PR when the feature has newer work", async () => {
    const local = mergedFeature();
    const unchanged = await shipProbe(local.cwd);
    expect(unchanged.code, unchanged.err).toBe(0);
    expect(unchanged.json).toMatchObject({
      found: true,
      state: "MERGED",
      headRefOid: local.mergedHead,
    });
    fs.writeFileSync(path.join(local.cwd, "new-fix.ts"), "export const fix = true;\n");
    git(local.cwd, "add", "new-fix.ts");
    git(local.cwd, "commit", "-qm", "fix: newer local work");
    const newerLocal = await shipProbe(local.cwd);
    expect(newerLocal.code, newerLocal.err).toBe(1);
    expect(newerLocal.json).toMatchObject({ found: false });
    const generic = await run(local.cwd, ["prs", "probe", "--head=feat/12-x", "--state=all"]);
    expect(generic.code).toBe(0);
    expect(generic.json.state).toBe("MERGED");

    const remote = mergedFeature();
    const cloud = tmp("bkit-prs-newer-cloud-");
    git(cloud, "clone", "-q", "-b", "feat/12-x", remote.origin, ".");
    fs.writeFileSync(path.join(cloud, "cloud-fix.ts"), "export const cloud = true;\n");
    git(cloud, "add", "cloud-fix.ts");
    git(cloud, "commit", "-qm", "fix: newer remote work");
    expect(sh(cloud, "push", "-q", "origin", "HEAD:feat/12-x").status).toBe(0);
    const newerRemote = await shipProbe(remote.cwd);
    expect(newerRemote.code, newerRemote.err).toBe(1);
    expect(newerRemote.json).toMatchObject({ found: false });
    gh.list([remote.merged, pr({ number: 8, headRefOid: git(cloud, "rev-parse", "HEAD") })]);
    const open = await shipProbe(remote.cwd);
    expect(open.code).toBe(0);
    expect(open.json).toMatchObject({ found: true, number: 8, state: "OPEN" });
  });

  it("refuses merged entry when current feature evidence cannot be read", async () => {
    const f = mergedFeature();
    git(f.cwd, "remote", "set-url", "origin", path.join(f.cwd, "missing-origin.git"));
    const result = await shipProbe(f.cwd);
    expect(result.code).not.toBe(0);
    expect(result.code).not.toBe(1);
    expect(result.err).toMatch(/fetch|feature.*evidence|remote.*read/i);
    expect(git(f.cwd, "rev-parse", "HEAD")).toBe(f.mergedHead);
    expect(git(f.cwd, "branch", "--list", "feat/12-x")).toContain("feat/12-x");
  });

  it("qualifies MCP merged PR facts against newer feature work without gh", async () => {
    const f = mergedFeature();
    const facts = path.join(fake, "ship-entry-facts.json");
    fs.writeFileSync(
      facts,
      JSON.stringify({
        ownerRepo: "o/r",
        headRefName: "feat/12-x",
        baseRefName: "dev",
        pr: f.merged,
      }),
    );
    gh.exit("list", 127);
    const unchanged = await shipProbe(f.cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
    expect(unchanged.code, unchanged.err).toBe(0);
    expect(unchanged.json).toMatchObject({ found: true, state: "MERGED" });
    fs.writeFileSync(path.join(f.cwd, "mcp-fix.ts"), "export const mcpFix = true;\n");
    git(f.cwd, "add", "mcp-fix.ts");
    git(f.cwd, "commit", "-qm", "fix: newer work after merge");
    const newer = await shipProbe(f.cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
    expect(newer.code, newer.err).toBe(1);
    expect(newer.json).toMatchObject({ found: false });
    fs.writeFileSync(facts, JSON.stringify({ pr: f.merged }));
    const unscoped = await shipProbe(f.cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
    expect(unscoped.code).not.toBe(0);
    expect(unscoped.code).not.toBe(1);
    expect(unscoped.err).toMatch(/scope|ownerRepo|headRefName|baseRefName/);
    expect(gh.calls().filter((call) => call.startsWith("pr list"))).toEqual([]);
  });
});

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

describe("bkit prs merge ship retry", () => {
  const pinned = "a".repeat(40);
  const moved = "b".repeat(40);
  function refusal(after: Record<string, unknown>) {
    for (const file of ["view-exit", "merge-exit", "after-view-exit", "view-after.json", "calls"]) {
      fs.rmSync(path.join(fake, file), { force: true });
    }
    gh.view(pr({ headRefOid: pinned, mergeable: "MERGEABLE" }));
    gh.viewAfterMerge(pr({ headRefOid: pinned, mergeable: "MERGEABLE", ...after }));
    gh.exit("merge", 1);
  }
  const shipMerge = (cwd: string, ...extra: string[]) =>
    run(cwd, [
      "prs",
      "merge",
      "--number=7",
      `--match-head=${pinned}`,
      "--subject=feat(12-x): ship",
      "--expect-merged",
      "--ship-retry",
      ...extra,
    ]);

  it("classifies a refused merge whose pinned head moved as revalidation", async () => {
    refusal({ headRefOid: moved, mergeable: "CONFLICTING" });
    const result = await shipMerge(repo());
    expect(result.code, result.err).toBe(9);
    expect(result.json).toMatchObject({ merged: false, state: "OPEN", route: "revalidate" });
    expect(result.json.reason).toMatch(/head|mov/i);
    expect(gh.calls().filter((call) => call.startsWith("pr view"))).toHaveLength(2);
    expect(gh.calls().filter((call) => call.startsWith("pr merge"))).toHaveLength(1);
    expect(gh.calls().find((call) => call.startsWith("pr merge"))).toContain(
      `--match-head-commit ${pinned}`,
    );
    expect(gh.calls().find((call) => call.startsWith("pr merge"))).not.toContain("--delete-branch");
  });

  it("classifies a refused merge with a new dev conflict as integration", async () => {
    refusal({ mergeable: "CONFLICTING" });
    const result = await shipMerge(repo());
    expect(result.code, result.err).toBe(10);
    expect(result.json).toMatchObject({ merged: false, state: "OPEN", route: "integrate" });
    expect(result.json.reason).toMatch(/conflict|dev|base/i);
    expect(gh.calls().filter((call) => call.startsWith("pr merge"))).toHaveLength(1);
    expect(gh.calls().filter((call) => call.startsWith("pr view"))).toHaveLength(2);
  });

  it("returns an explicit terminal reason for other merge refusals", async () => {
    refusal({ mergeable: "MERGEABLE" });
    const result = await shipMerge(repo());
    expect(result.code, result.err).toBe(7);
    expect(result.json).toMatchObject({ merged: false, route: "stop" });
    expect(result.json.reason).toMatch(/refus|merge/i);

    refusal({ mergeable: "MERGEABLE" });
    fs.writeFileSync(path.join(fake, "after-view-exit"), "1");
    const unreadable = await shipMerge(repo());
    expect(unreadable.code).toBe(5);
    expect(unreadable.json).toMatchObject({ merged: false, route: "stop" });
    expect(unreadable.json.reason).toMatch(/read|unavailable|view/i);

    refusal({ mergeable: "MERGEABLE" });
    gh.view(pr({ baseRefName: "main", headRefOid: pinned }));
    const wrongBase = await shipMerge(repo());
    expect(wrongBase.code).toBe(EXIT_BASE_NOT_DEV);
    expect(gh.calls().filter((call) => call.startsWith("pr merge"))).toEqual([]);
  });

  it("classifies independent MCP merge refusal facts without gh", async () => {
    const cwd = repo();
    const facts = path.join(fake, "merge-facts.json");
    const scope = {
      ownerRepo: "o/r",
      prNumber: 7,
      headRefName: "feat/12-x",
      baseRefName: "dev",
      matchHead: pinned,
      before: pr({ headRefOid: pinned, mergeable: "MERGEABLE" }),
    };
    gh.exit("view", 127);
    fs.writeFileSync(
      facts,
      JSON.stringify({ ...scope, after: pr({ headRefOid: moved, mergeable: "CONFLICTING" }) }),
    );
    const headMoved = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
    expect(headMoved.code, headMoved.err).toBe(9);
    expect(headMoved.json.route).toBe("revalidate");
    fs.writeFileSync(
      facts,
      JSON.stringify({ ...scope, after: pr({ headRefOid: pinned, mergeable: "CONFLICTING" }) }),
    );
    const conflict = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
    expect(conflict.code, conflict.err).toBe(10);
    expect(conflict.json.route).toBe("integrate");
    fs.writeFileSync(facts, JSON.stringify(scope));
    const noReread = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
    expect(noReread.code).not.toBe(0);
    expect(["integrate", "revalidate"]).not.toContain(noReread.json?.route);
    fs.writeFileSync(
      facts,
      JSON.stringify({ ...scope, ownerRepo: "other/repo", after: pr({ headRefOid: moved }) }),
    );
    const wrongScope = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
    expect(wrongScope.code).not.toBe(0);
    expect(["integrate", "revalidate"]).not.toContain(wrongScope.json?.route);
    expect(wrongScope.err).toMatch(/scope|repository|ownerRepo/i);
    expect(gh.calls()).toEqual([]);
  });
});

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

  it("drops the force-build marker from the title subject", async () => {
    gh.view(pr({ title: "feat(12-x): thing bkit [force build]" }));
    gh.viewAfterMerge(pr({ state: "MERGED" }));
    expect((await merge()).json.subject).toBe("feat(12-x): thing (#7)");
    expect(mergeCall()).toContain("--subject feat(12-x): thing (#7) --body");
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

  it("prs merge refuses a PR whose base is main", async () => {
    gh.view(pr({ baseRefName: "main" }));
    gh.viewAfterMerge(pr({ baseRefName: "main", state: "MERGED" }));
    const r = await merge();
    expect(r.code).toBe(EXIT_BASE_NOT_DEV);
    expect(r.err).toContain("main");
    expect(r.json).toMatchObject({ merged: false, verdict: "FAIL" });
    expect(mergeCall()).toBe("");
  });

  it("prs merge fails loudly when the base changed between the check and the merge", async () => {
    gh.view(pr());
    gh.viewAfterMerge(pr({ baseRefName: "main", state: "MERGED", mergeCommit: { oid: "s" } }));
    const r = await merge();
    expect(r.code).toBe(EXIT_BASE_NOT_DEV);
    expect(r.err).toContain("INTEGRITY FAILURE");
    expect(r.err).toContain("merged into main");
    expect(r.json).toMatchObject({ merged: true, verdict: "FAIL", failures: 1 });
  });

  it("prs merge refuses when the PR base is unknown", async () => {
    gh.view(pr({ baseRefName: undefined }));
    gh.viewAfterMerge(pr({ state: "MERGED" }));
    const r = await merge();
    expect(r.code).toBe(EXIT_BASE_NOT_DEV);
    expect(mergeCall()).toBe("");
  });

  it("prs merge reads the base from the one pr view it already makes", async () => {
    gh.view(pr());
    gh.viewAfterMerge(pr({ state: "MERGED" }));
    await merge("--subject=s");
    expect(gh.calls().filter((c) => c.startsWith("pr view"))).toHaveLength(2);
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
      cancelled: 0,
      pending: 0,
      green: true,
      failing: [],
    });
  });

  it("counts a cancelled, action-required or stale check apart from failed, and not green", async () => {
    rollup(
      { name: "a", status: "COMPLETED", conclusion: "CANCELLED" },
      { name: "b", status: "COMPLETED", conclusion: "ACTION_REQUIRED" },
      { name: "c", status: "COMPLETED", conclusion: "STALE" },
      { name: "d", status: "COMPLETED", conclusion: "SUCCESS" },
    );
    const r = await checks();
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({
      total: 4,
      passing: 1,
      failed: 0,
      cancelled: 3,
      green: false,
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
