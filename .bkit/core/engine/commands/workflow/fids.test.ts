import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCommand } from "../lib";
import { FID_PATTERNS, fidsCommand, issueIdOf, readIssueTracker } from "./fids";

const dirs: string[] = [];

afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** A directory whose package.json declares `bkit.issueTracker` (or no package.json at all). */
function project(tracker?: string, raw?: string) {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fids-")));
  dirs.push(d);
  if (raw !== undefined) fs.writeFileSync(path.join(d, "package.json"), raw);
  else if (tracker !== undefined) {
    fs.writeFileSync(
      path.join(d, "package.json"),
      JSON.stringify({ bkit: { issueTracker: tracker } }),
    );
  }
  return d;
}

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["fids", ...argv], [fidsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

describe("readIssueTracker", () => {
  it("reads bkit.issueTracker; missing, invalid or unparseable falls back to none", () => {
    expect(readIssueTracker(project("linear"))).toBe("linear");
    expect(readIssueTracker(project())).toBe("none");
    expect(readIssueTracker(project("jira"))).toBe("none");
    expect(readIssueTracker(project(undefined, "{oops"))).toBe("none");
  });

  it("reads the main checkout's package.json from inside a linked worktree", () => {
    const root = project("github");
    const g = (...a: string[]) =>
      spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...a], { cwd: root });
    g("init", "-q");
    g("commit", "-q", "--allow-empty", "-m", "i");
    g("worktree", "add", "-q", "-b", "feat/1-x", ".worktrees/1-x");
    fs.writeFileSync(path.join(root, ".worktrees/1-x/package.json"), "{}");
    expect(readIssueTracker(path.join(root, ".worktrees/1-x"))).toBe("github");
  });
});

describe("bkit fids check", () => {
  const FID_CASES: [tracker: string, fid: string, valid: boolean, issueId: string | null][] = [
    ["github", "341-three-runtimes", true, "341"],
    ["github", "341", false, null],
    ["github", "abc-1-x", false, null],
    ["github", "341-Upper", false, null],
    ["github", "12-34-x", true, "12"],
    ["github", "x_y", false, null],
    ["linear", "abc-123-slug", true, "ABC-123"],
    ["linear", "ABC-123-slug", true, "ABC-123"], // the issue id is lowercased first
    ["linear", "341-slug", false, null],
    ["linear", "abc-x", false, null],
    ["none", "my-feature", true, null],
    ["none", "-leading-dash", false, null],
    ["none", "has/slash", false, null],
    ["none", "a", true, null],
    ["none", "341", true, null],
    ["none", "x_y", false, null],
    ["any", "341-x", true, "341"],
    ["any", "abc-123-x", true, "ABC-123"],
    ["any", "plain-slug", false, null],
  ];

  it.each(FID_CASES.filter(([, , valid]) => valid))(
    "tracker %s, FID %j -> valid %s, issueId %j",
    async (tracker, fid, valid, issueId) => {
      const r = await run(project(), ["check", `--fid=${fid}`, `--tracker=${tracker}`]);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ tracker, valid, issueId });
    },
  );

  it.each(FID_CASES.filter(([, , valid]) => !valid))(
    "tracker %s, FID %j -> valid %s, issueId %j",
    async (tracker, fid, valid, issueId) => {
      const r = await run(project(), ["check", `--fid=${fid}`, `--tracker=${tracker}`]);
      expect(r.code).toBe(1);
      expect(r.json).toMatchObject({ tracker, valid, issueId });
      expect(r.err).toContain("does not match");
    },
  );

  it("lowercases a linear FID in its output", async () => {
    const r = await run(project(), ["check", "--fid=ABC-123-slug", "--tracker=linear"]);
    expect(r.json.fid).toBe("abc-123-slug");
  });

  it("takes the tracker from package.json when --tracker is absent", async () => {
    const r = await run(project("github"), ["check", "--fid=abc-123-slug"]);
    expect(r.code).toBe(1);
    expect(r.json.tracker).toBe("github");
    expect((await run(project(), ["check", "--fid=abc-123-slug"])).json.tracker).toBe("none");
  });

  it("an unknown --tracker is a usage error", async () => {
    expect((await run(project(), ["check", "--fid=1-x", "--tracker=jira"])).code).toBe(2);
  });
});

describe("bkit fids parse", () => {
  const GH_BODY =
    "intro\n<!-- bkit:issue=#341 bkit:fid=341-three-runtimes -->\n<!-- bkit:start -->";

  it("github: the marker wins over the branch", async () => {
    const r = await run(project("github"), [
      "parse",
      `--marker=${GH_BODY}`,
      "--branch=feat/9-other",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      fid: "341-three-runtimes",
      issueId: "341",
      source: "marker",
      tracker: "github",
    });
  });

  it("linear: marker issue id and lowercased FID", async () => {
    const r = await run(project("linear"), [
      "parse",
      "--marker=<!-- bkit:issue=ABC-12 bkit:fid=ABC-12-slug -->",
    ]);
    expect(r.json).toEqual({
      fid: "abc-12-slug",
      issueId: "ABC-12",
      source: "marker",
      tracker: "linear",
    });
  });

  it("none: the fid-only marker", async () => {
    const r = await run(project(), ["parse", "--marker=<!-- bkit:fid=my-feature -->"]);
    expect(r.json).toEqual({ fid: "my-feature", issueId: null, source: "marker", tracker: "none" });
  });

  it("a malformed marker falls through to the branch", async () => {
    const r = await run(project("github"), [
      "parse",
      "--marker=<!-- bkit:issue=#341 bkit:fid=Not_A_Slug -->",
      "--branch=feat/341-three-runtimes",
    ]);
    expect(r.json).toMatchObject({ fid: "341-three-runtimes", issueId: "341", source: "branch" });
    expect(r.err).toContain("trying the branch");
  });

  it("a marker for another tracker is not this tracker's marker", async () => {
    const r = await run(project("none"), ["parse", `--marker=${GH_BODY}`]);
    expect(r.code).toBe(3);
  });

  it.each([
    ["github", "feat/341-three-runtimes", "341-three-runtimes", "341"],
    ["github", "feat/341", "341", "341"],
    ["linear", "feat/abc-123-slug", "abc-123-slug", "ABC-123"],
    ["none", "feat/anything-goes", "anything-goes", null],
  ])("%s branch %s -> FID %s, issueId %j", async (tracker, branch, fid, issueId) => {
    const r = await run(project(tracker), ["parse", `--branch=${branch}`]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ fid, issueId, source: "branch", tracker });
  });

  it.each([
    ["github", "dev", "is not feat/{FID}"],
    ["github", "feat/", "is not a slug"],
    ["github", "feat/Upper-case", "is not a slug"],
    ["github", "feat/abc-x", "embeds no github issue id"],
    ["linear", "feat/341-x", "embeds no linear issue id"],
  ])("%s branch %j -> exit 3 (%s)", async (tracker, branch, why) => {
    const r = await run(project(tracker), ["parse", `--branch=${branch}`]);
    expect(r.code).toBe(3);
    expect(r.json).toBeUndefined();
    expect(r.err).toContain(why);
  });

  it("needs --marker or --branch", async () => {
    expect((await run(project(), ["parse"])).code).toBe(2);
  });

  it("marker absent and no branch -> exit 3", async () => {
    expect((await run(project("github"), ["parse", "--marker=no marker here"])).code).toBe(3);
  });
});

describe("issueIdOf", () => {
  it("matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased)", () => {
    expect(issueIdOf("12-34-x", "any")).toBe("12");
    expect(issueIdOf("abc-123-x", "any")).toBe("ABC-123");
    expect(FID_PATTERNS.any.test("12-34-x")).toBe(true);
  });
});

describe("bkit fids find", () => {
  /** A git repo with the given `docs/plans/<month>/logs/<fid>` folders. */
  function logged(...rels: string[]) {
    const d = project();
    spawnSync("git", ["init", "-q"], { cwd: d });
    for (const rel of rels) fs.mkdirSync(path.join(d, "docs", "plans", rel), { recursive: true });
    return d;
  }

  it("names the one feature logged for the issue (exit 0), never a longer issue number", async () => {
    const d = logged("202605/logs/68-agent-mvp", "202608/logs/680-longer", "202608/logs/70-other");
    expect(await run(d, ["find", "--issue=68"])).toMatchObject({
      code: 0,
      json: { fid: "68-agent-mvp", fids: ["68-agent-mvp"] },
    });
    expect((await run(d, ["find", "--issue=#68"])).json.fid).toBe("68-agent-mvp");
  });

  it("matches a Linear issue case-insensitively", async () => {
    const d = logged("202605/logs/abc-12-thing");
    expect((await run(d, ["find", "--issue=ABC-12"])).json.fid).toBe("abc-12-thing");
  });

  it("lists every feature when several are logged (exit 4)", async () => {
    const d = logged("202605/logs/68-first", "202606/logs/68-second");
    const r = await run(d, ["find", "--issue=68"]);
    expect(r.code).toBe(4);
    expect(r.json).toEqual({ fid: null, fids: ["68-first", "68-second"] });
  });

  it("exits 1 when nothing is logged, or docs/plans does not exist", async () => {
    expect((await run(logged("202605/logs/12-x"), ["find", "--issue=99"])).code).toBe(1);
    expect((await run(logged(), ["find", "--issue=99"])).code).toBe(1);
  });

  it("ignores a non-month folder and a file named like a feature", async () => {
    const d = logged("archive/logs/68-old");
    fs.mkdirSync(path.join(d, "docs/plans/202605/logs"), { recursive: true });
    fs.writeFileSync(path.join(d, "docs/plans/202605/logs/68-file"), "");
    expect((await run(d, ["find", "--issue=68"])).code).toBe(1);
  });
});

describe("bkit fids design", () => {
  function plans(...files: string[]) {
    const d = project();
    spawnSync("git", ["init", "-q"], { cwd: d });
    for (const rel of files) {
      fs.mkdirSync(path.dirname(path.join(d, "docs", "plans", rel)), { recursive: true });
      fs.writeFileSync(path.join(d, "docs", "plans", rel), "# Design\n");
    }
    return d;
  }

  it("finds the feature's design doc in the given bucket (exit 0)", async () => {
    const d = plans("202609/50-sync-design.md", "202610/50-sync-design.md");
    expect(await run(d, ["design", "--fid=50-sync", "--month=202609"])).toMatchObject({
      code: 0,
      json: { fid: "50-sync", month: "202609", path: "docs/plans/202609/50-sync-design.md" },
    });
  });

  it("falls back to the newest bucket holding it when the given bucket has none", async () => {
    const d = plans("202608/50-sync-design.md", "202609/50-sync-design.md");
    expect((await run(d, ["design", "--fid=50-sync", "--month=202610"])).json.month).toBe("202609");
    expect((await run(d, ["design", "--fid=50-sync"])).json.month).toBe("202609");
  });

  it("exits 1 for no design doc, another feature's doc, a plan only, or no docs/plans", async () => {
    const d = plans(
      "202610/51-other-design.md",
      "202610/50-sync-plan.md",
      "archive/50-sync-design.md",
    );
    expect(await run(d, ["design", "--fid=50-sync", "--month=202610"])).toMatchObject({
      code: 1,
      json: { fid: null, month: null, path: null },
    });
    expect((await run(plans(), ["design", "--fid=50-sync"])).code).toBe(1);
  });
});
