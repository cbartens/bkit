import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCommand } from "../lib";
import {
  FID_PATTERNS,
  fidProblem,
  featureIssueIds,
  fidsCommand,
  freeFid,
  fromBranch,
  fromMarker,
  ISSUE_ID_PATTERNS,
  ISSUE_LESS_FID,
  issueIdOf,
  readIssueTracker,
} from "./fids";

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

/** Writes `.bkit/issues.jsonl` with one feature row per FID key (plus a non-feature row). */
function features(dir: string, ...keys: string[]) {
  fs.mkdirSync(path.join(dir, ".bkit"), { recursive: true });
  const rows = [
    { kind: "decision", key: "999-not-a-feature" },
    ...keys.map((key) => ({ kind: "feature", key })),
  ];
  fs.writeFileSync(
    path.join(dir, ".bkit", "issues.jsonl"),
    `${rows.map((r) => JSON.stringify(r)).join("\n")}\nnot json\n`,
  );
  return dir;
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
  it.each(["github", "linear", "jira"])("reads bkit.issueTracker %s", (tracker) => {
    expect(readIssueTracker(project(tracker))).toBe(tracker);
  });

  it("missing, invalid or unparseable falls back to none", () => {
    expect(readIssueTracker(project())).toBe("none");
    expect(readIssueTracker(project("asana"))).toBe("none");
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
    ["linear", "ab2-1-x", false, null], // Linear team keys are letters only
    ["jira", "mba-7-slug", true, "MBA-7"],
    ["jira", "MBA-7-slug", true, "MBA-7"], // the issue key is lowercased first
    ["jira", "ab2-7-slug", true, "AB2-7"], // a Jira project key may carry digits after its first letter
    ["jira", "m-7-slug", false, null], // project keys are at least two characters
    ["jira", "2ab-7-slug", false, null],
    ["jira", "341-slug", false, null],
    ["none", "my-feature", true, null],
    ["none", "-leading-dash", false, null],
    ["none", "has/slash", false, null],
    ["none", "a", true, null],
    ["none", "341", true, null],
    ["none", "x_y", false, null],
    ["any", "341-x", true, "341"],
    ["any", "abc-123-x", true, "ABC-123"],
    ["any", "ab2-7-x", true, "AB2-7"],
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

  it.each(["linear", "jira"])("lowercases a %s FID in its output", async (tracker) => {
    const r = await run(project(), ["check", "--fid=ABC-123-slug", `--tracker=${tracker}`]);
    expect(r.json.fid).toBe("abc-123-slug");
  });

  it("takes the tracker from package.json when --tracker is absent", async () => {
    const r = await run(project("github"), ["check", "--fid=abc-123-slug"]);
    expect(r.code).toBe(1);
    expect(r.json.tracker).toBe("github");
    expect((await run(project(), ["check", "--fid=abc-123-slug"])).json.tracker).toBe("none");
  });

  it.each([
    ["linear", "ABC-123-slug", "ABC-123"],
    ["jira", "AB2-7-slug", "AB2-7"],
  ])("takes %s from package.json, lowercasing the key", async (tracker, fid, issueId) => {
    const r = await run(project(tracker), ["check", `--fid=${fid}`]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ tracker, fid: fid.toLowerCase(), valid: true, issueId });
  });

  it("an unknown --tracker is a usage error", async () => {
    expect((await run(project(), ["check", "--fid=1-x", "--tracker=asana"])).code).toBe(2);
  });
});

describe("bkit fids check --issue", () => {
  const WIRED = ["github", "linear", "jira"] as const;

  it('check --issue="" accepts dev-ci-failures under github', async () => {
    const r = await run(project(), [
      "check",
      "--fid=dev-ci-failures",
      "--tracker=github",
      "--issue=",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ valid: true, issueId: null });
  });

  it.each(["linear", "jira"])(
    'check --issue="" accepts dev-ci-failures under %s',
    async (tracker) => {
      const r = await run(project(), [
        "check",
        "--fid=dev-ci-failures",
        `--tracker=${tracker}`,
        "--issue=",
      ]);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ valid: true, issueId: null });
    },
  );

  it('check --issue="" accepts any slug under every wired tracker, all-digit words included', async () => {
    for (const tracker of WIRED) {
      for (const fid of ["123-fix", "fix-2-retry", "dev-123-x", "upgrade-react-19"]) {
        const r = await run(project(), [
          "check",
          `--fid=${fid}`,
          `--tracker=${tracker}`,
          "--issue=",
        ]);
        expect(r.code, `${tracker} ${fid}`).toBe(0);
        expect(r.json).toMatchObject({ valid: true });
      }
    }
  });

  it('check --issue="" rejects a non-slug under every wired tracker', async () => {
    for (const tracker of WIRED) {
      for (const fid of ["Fix_CI", "-lead", "has/slash"]) {
        const r = await run(project(), [
          "check",
          `--fid=${fid}`,
          `--tracker=${tracker}`,
          "--issue=",
        ]);
        expect(r.code, `${tracker} ${fid}`).toBe(1);
        expect(r.json).toMatchObject({ valid: false });
        expect(r.err).toContain("not a slug");
      }
    }
  });

  it('check --tracker=any --issue="" applies the slug rule', async () => {
    const ok = await run(project(), ["check", "--fid=123-fix", "--tracker=any", "--issue="]);
    expect(ok.code).toBe(0);
    const bad = await run(project(), ["check", "--fid=Fix_CI", "--tracker=any", "--issue="]);
    expect(bad.code).toBe(1);
    expect(bad.err).toContain("not a slug");
  });

  it("check --issue=N requires the FID to embed that same issue", async () => {
    const same = await run(project(), [
      "check",
      "--fid=123-foo",
      "--tracker=github",
      "--issue=123",
    ]);
    expect(same.code).toBe(0);
    const other = await run(project(), [
      "check",
      "--fid=123-foo",
      "--tracker=github",
      "--issue=456",
    ]);
    expect(other.code).toBe(1);
    expect(other.err).toContain("embeds issue 123, not the run's issue 456");
    const linear = await run(project(), [
      "check",
      "--fid=abc-1-x",
      "--tracker=linear",
      "--issue=ABC-2",
    ]);
    expect(linear.code).toBe(1);
  });

  it("check --issue=650 requires the github shape and a github issue id", async () => {
    expect(
      (await run(project(), ["check", "--fid=650-x", "--tracker=github", "--issue=650"])).code,
    ).toBe(0);
    expect(
      (await run(project(), ["check", "--fid=dev-ci", "--tracker=github", "--issue=650"])).code,
    ).toBe(1);
    expect(
      (await run(project(), ["check", "--fid=650-x", "--tracker=github", "--issue=ABC-1"])).code,
    ).toBe(1);
    expect(
      (await run(project(), ["check", "--fid=abc-1-x", "--tracker=linear", "--issue=ABC-1"])).code,
    ).toBe(0);
    expect(
      (await run(project(), ["check", "--fid=mba-7-x", "--tracker=jira", "--issue=MBA-7"])).code,
    ).toBe(0);
    expect(
      (await run(project(), ["check", "--fid=650-x", "--tracker=any", "--issue=650"])).code,
    ).toBe(0);
    expect(
      (await run(project(), ["check", "--fid=dev-ci", "--tracker=any", "--issue=650"])).code,
    ).toBe(1);
  });

  it("check under none ignores --issue", async () => {
    for (const issue of ["--issue=", "--issue=650"]) {
      expect((await run(project(), ["check", "--fid=123-fix", "--tracker=none", issue])).code).toBe(
        0,
      );
    }
  });

  it('check takes the tracker from package.json with --issue=""', async () => {
    expect(
      (await run(project("github"), ["check", "--fid=dev-ci-failures", "--issue="])).code,
    ).toBe(0);
    expect((await run(project("github"), ["check", "--fid=123-fix", "--issue="])).code).toBe(0);
    expect((await run(project("github"), ["check", "--fid=Fix_CI", "--issue="])).code).toBe(1);
  });

  it("fidProblem with --issue absent matches today", () => {
    expect(fidProblem("341-x", "github")).toBeUndefined();
    expect(fidProblem("dev-ci", "github")).toContain("does not match the github shape");
    expect(fidProblem("123-fix", "none")).toBeUndefined();
    expect(fidProblem("x_y", "none")).toContain("does not match the none shape");
  });

  it("fidProblem holds an issue-less FID to the slug rule and an issue's FID to its id", () => {
    expect(fidProblem("dev-ci-failures", "linear", "")).toBeUndefined();
    expect(fidProblem("fix-2-retry", "linear", "")).toBeUndefined();
    expect(fidProblem("upgrade-react-19", "github", "")).toBeUndefined();
    expect(fidProblem("Dev", "github", "")).toContain("not a slug");
    expect(fidProblem("123-foo", "github", "123")).toBeUndefined();
    expect(fidProblem("123-foo", "github", "456")).toContain("embeds issue 123, not the run's");
    expect(fidProblem("abc-1-x", "linear", "ABC-1")).toBeUndefined();
    expect(fidProblem("abc-1-x", "linear", "ABC-2")).toContain("embeds issue ABC-1");
  });

  it("ISSUE_LESS_FID is a slug with no all-digit word", () => {
    for (const ok of ["dev-ci-failures", "a1-b", "x", "dev-v2"])
      expect(ISSUE_LESS_FID.test(ok)).toBe(true);
    for (const bad of ["123", "123-fix", "fix-2", "fix-2-retry", "dev-123-x", "-x", "x_y", "A-b"])
      expect(ISSUE_LESS_FID.test(bad)).toBe(false);
  });

  it("ISSUE_ID_PATTERNS match each tracker's issue id", () => {
    expect(ISSUE_ID_PATTERNS.github.test("650")).toBe(true);
    expect(ISSUE_ID_PATTERNS.github.test("ABC-1")).toBe(false);
    expect(ISSUE_ID_PATTERNS.linear.test("ABC-12")).toBe(true);
    expect(ISSUE_ID_PATTERNS.linear.test("AB2-12")).toBe(false);
    expect(ISSUE_ID_PATTERNS.jira.test("AB2-12")).toBe(true);
    expect(ISSUE_ID_PATTERNS.jira.test("A-1")).toBe(false);
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

  it("jira: marker issue key and lowercased FID", async () => {
    const r = await run(project("jira"), [
      "parse",
      "--marker=<!-- bkit:issue=AB2-7 bkit:fid=AB2-7-slug -->",
    ]);
    expect(r.json).toEqual({
      fid: "ab2-7-slug",
      issueId: "AB2-7",
      source: "marker",
      tracker: "jira",
    });
  });

  it("none: the fid-only marker", async () => {
    const r = await run(project(), ["parse", "--marker=<!-- bkit:fid=my-feature -->"]);
    expect(r.json).toEqual({ fid: "my-feature", issueId: null, source: "marker", tracker: "none" });
  });

  it.each([
    ["github", "#341", "feat/341-three-runtimes", "341-three-runtimes", "341"],
    ["linear", "ABC-12", "feat/abc-12-slug", "abc-12-slug", "ABC-12"],
    ["jira", "AB2-7", "feat/ab2-7-slug", "ab2-7-slug", "AB2-7"],
  ])(
    "%s: a malformed marker falls through to the branch",
    async (tracker, issue, branch, fid, issueId) => {
      const r = await run(features(project(tracker), fid), [
        "parse",
        `--marker=<!-- bkit:issue=${issue} bkit:fid=Not_A_Slug -->`,
        `--branch=${branch}`,
      ]);
      expect(r.json).toMatchObject({ fid, issueId, source: "branch" });
      expect(r.err).toContain("trying the branch");
    },
  );

  it.each([
    ["none", GH_BODY],
    ["jira", GH_BODY],
    ["github", "<!-- bkit:issue=AB2-7 bkit:fid=ab2-7-slug -->"],
    ["linear", "<!-- bkit:issue=AB2-7 bkit:fid=ab2-7-slug -->"],
  ])("%s: a marker for another tracker is not this tracker's marker", async (tracker, body) => {
    const r = await run(project(tracker), ["parse", `--marker=${body}`]);
    expect(r.code).toBe(3);
  });

  it.each([
    ["github", "feat/341-three-runtimes", "341-three-runtimes", "341"],
    ["github", "feat/341", "341", "341"],
    ["linear", "feat/abc-123-slug", "abc-123-slug", "ABC-123"],
    ["jira", "feat/mba-7-slug", "mba-7-slug", "MBA-7"],
    ["jira", "feat/ab2-7-slug", "ab2-7-slug", "AB2-7"],
  ])(
    "%s branch %s with a feature row for its issue -> FID %s, issueId %j (linked)",
    async (tracker, branch, fid, issueId) => {
      const r = await run(features(project(tracker), fid), ["parse", `--branch=${branch}`]);
      expect(r.code).toBe(0);
      expect(r.json).toEqual({ fid, issueId, source: "branch", tracker });
    },
  );

  it.each([
    ["github", "feat/341-three-runtimes", "341-three-runtimes"],
    ["github", "feat/341", "341"],
    ["linear", "feat/abc-123-slug", "abc-123-slug"],
    ["jira", "feat/mba-7-slug", "mba-7-slug"],
    ["github", "feat/upgrade-react-19", "upgrade-react-19"],
    ["linear", "feat/upgrade-react-19", "upgrade-react-19"],
    ["jira", "feat/upgrade-react-19", "upgrade-react-19"],
    ["none", "feat/anything-goes", "anything-goes"],
    ["github", "feat/abc-x", "abc-x"],
    ["github", "feat/dev-ci-failures", "dev-ci-failures"],
    ["linear", "feat/dev-ci-failures", "dev-ci-failures"],
    ["jira", "feat/dev-ci-failures", "dev-ci-failures"],
  ])(
    "%s branch %s with no feature row for its issue -> issue-less, FID %s verbatim",
    async (tracker, branch, fid) => {
      const r = await run(features(project(tracker), "999-other"), ["parse", `--branch=${branch}`]);
      expect(r.code).toBe(0);
      expect(r.json).toEqual({ fid, issueId: null, source: "branch", tracker });
    },
  );

  it("a branch with no issues.jsonl at all is issue-less", async () => {
    const r = await run(project("github"), ["parse", "--branch=feat/341-three-runtimes"]);
    expect(r.json).toEqual({
      fid: "341-three-runtimes",
      issueId: null,
      source: "branch",
      tracker: "github",
    });
  });

  it("a feature row for another issue does not link, and a row for the same issue links any FID with it", async () => {
    const d = features(project("github"), "341-first");
    expect((await run(d, ["parse", "--branch=feat/341-second"])).json.issueId).toBe("341");
    expect((await run(d, ["parse", "--branch=feat/342-second"])).json.issueId).toBeNull();
  });

  it.each([
    ["github", "dev", "is not feat/{FID}"],
    ["github", "feat/", "is not a slug"],
    ["github", "feat/Upper-case", "is not a slug"],
    ["github", "feat/Fix_CI", "is not a slug"],
    ["linear", "feat/Fix_CI", "is not a slug"],
    ["jira", "feat/fix_ci", "is not a slug"],
    ["none", "feat/Fix_CI", "is not a slug"],
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

describe("issue-less FID recovery", () => {
  const FID_ONLY = "<!-- bkit:fid=dev-ci-failures -->";

  it("fromMarker returns issueId null for a FID-only marker under github", () => {
    expect(fromMarker(FID_ONLY, "github")).toEqual({
      fid: "dev-ci-failures",
      issueId: null,
      source: "marker",
    });
  });

  it.each(["linear", "jira", "none"] as const)(
    "fromMarker returns issueId null for a FID-only marker under %s",
    (tracker) => {
      expect(fromMarker(FID_ONLY, tracker)).toMatchObject({
        fid: "dev-ci-failures",
        issueId: null,
      });
    },
  );

  it("fromBranch returns issueId null for feat/dev-ci-failures under linear", () => {
    expect(fromBranch("feat/dev-ci-failures", "linear")).toEqual({
      ok: true,
      parsed: { fid: "dev-ci-failures", issueId: null, source: "branch" },
    });
  });

  it.each(["github", "jira"] as const)(
    "fromBranch returns issueId null for feat/dev-ci-failures under %s",
    (tracker) => {
      expect(fromBranch("feat/dev-ci-failures", tracker)).toMatchObject({
        ok: true,
        parsed: { issueId: null },
      });
    },
  );

  it("a tracker-shaped marker or branch still parses as its issue", () => {
    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=341-x -->", "github")).toMatchObject({
      issueId: "341",
    });
    expect(fromBranch("feat/341-x", "github")).toMatchObject({
      ok: true,
      parsed: { issueId: "341" },
    });
  });

  it("a FID-only marker holding an all-digit word is not issue-less", () => {
    for (const fid of ["341-x", "123", "dev-123-x", "fix-2-retry"]) {
      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "github")).toBeNull();
      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "linear")).toBeNull();
    }
    expect(fromMarker("<!-- bkit:fid=341-x -->", "none")).toMatchObject({ issueId: null });
  });

  it("a malformed tracker marker does not fall back to the FID-only shape", () => {
    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=Not_A_Slug -->", "github")).toBeNull();
  });

  it("fids parse recovers an issue-less FID from the marker and from the branch", async () => {
    const m = await run(project("github"), ["parse", `--marker=${FID_ONLY}`]);
    expect(m.json).toEqual({
      fid: "dev-ci-failures",
      issueId: null,
      source: "marker",
      tracker: "github",
    });
    const b = await run(project("jira"), ["parse", "--branch=feat/dev-ci-failures"]);
    expect(b.json).toEqual({
      fid: "dev-ci-failures",
      issueId: null,
      source: "branch",
      tracker: "jira",
    });
  });
});

describe("fromBranch with the repo's known issue ids", () => {
  const known = new Set(["341", "ABC-12"]);

  it("links an embedded issue id the repo knows", () => {
    expect(fromBranch("feat/341-x", "github", known)).toEqual({
      ok: true,
      parsed: { fid: "341-x", issueId: "341", source: "branch" },
    });
    expect(fromBranch("feat/abc-12-x", "linear", known)).toMatchObject({
      parsed: { issueId: "ABC-12" },
    });
  });

  it("takes any slug verbatim as an issue-less FID when the id is not known", () => {
    for (const [branch, fid] of [
      ["feat/342-x", "342-x"],
      ["feat/upgrade-react-19", "upgrade-react-19"],
      ["feat/2024-roadmap", "2024-roadmap"],
    ] as const) {
      expect(fromBranch(branch, "github", known)).toEqual({
        ok: true,
        parsed: { fid, issueId: null, source: "branch" },
      });
    }
  });

  it("refuses a non-slug suffix and a non-feat branch", () => {
    expect(fromBranch("feat/Fix_CI", "github", known)).toMatchObject({ ok: false });
    expect(fromBranch("dev", "github", known)).toMatchObject({ ok: false });
  });

  it("without known, a shape-less FID with an all-digit word is still refused (the auto path)", () => {
    expect(fromBranch("feat/upgrade-react-19", "github")).toMatchObject({ ok: false });
    expect(fromBranch("feat/341-x", "linear")).toMatchObject({ ok: false });
    expect(fromBranch("feat/m-7-x", "jira")).toMatchObject({ ok: false });
  });
});

describe("featureIssueIds", () => {
  it("collects the issue ids feature rows carry, per the tracker shape", () => {
    const d = features(project(), "341-x", "abc-12-y", "mba-7-z", "plain-slug");
    expect([...featureIssueIds(d, "github")]).toEqual(["341"]);
    expect([...featureIssueIds(d, "linear")].sort()).toEqual(["ABC-12", "MBA-7"]);
    expect([...featureIssueIds(d, "jira")].sort()).toEqual(["ABC-12", "MBA-7"]);
    expect(featureIssueIds(d, "none").size).toBe(0);
  });

  it("is empty with no issues.jsonl", () => {
    expect(featureIssueIds(project(), "github").size).toBe(0);
  });
});

describe("issueIdOf", () => {
  it("matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased)", () => {
    expect(issueIdOf("12-34-x", "any")).toBe("12");
    expect(issueIdOf("abc-123-x", "any")).toBe("ABC-123");
    expect(issueIdOf("ab2-7-x", "any")).toBe("AB2-7");
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

  it.each([
    ["Linear", "ABC-12", "abc-12-thing"],
    ["Jira", "AB2-12", "ab2-12-thing"],
  ])("matches a %s issue case-insensitively", async (_tracker, issue, fid) => {
    const d = logged(`202605/logs/${fid}`);
    expect((await run(d, ["find", `--issue=${issue}`])).json.fid).toBe(fid);
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

describe("bkit fids free", () => {
  /** A git repo with a status log per `[month, fid, events]`. */
  function logs(...entries: [month: string, fid: string, events: string[]][]) {
    const d = project();
    spawnSync("git", ["init", "-q"], { cwd: d });
    for (const [month, fid, events] of entries) {
      const dir = path.join(d, "docs", "plans", month, "logs", fid);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "status.jsonl"),
        events
          .map(
            (type) =>
              `${JSON.stringify({ type, workflow: "debug", at: "2026-10-01T00:00:00Z" })}\n`,
          )
          .join(""),
      );
    }
    return d;
  }
  const finished = ["workflow-started", "workflow-done"];

  it("returns the minted name when no run used it", async () => {
    const d = logs(["202610", "other-thing", finished]);
    expect(await run(d, ["free", "--fid=dev-ci", "--workflow=debug"])).toMatchObject({
      code: 0,
      json: { fid: "dev-ci", requested: "dev-ci", suffixed: false },
    });
  });

  it("takes -b when a finished run used the name, then -c, in any month bucket", async () => {
    const d = logs(["202609", "dev-ci", finished]);
    expect((await run(d, ["free", "--fid=dev-ci", "--workflow=debug"])).json).toEqual({
      fid: "dev-ci-b",
      requested: "dev-ci",
      suffixed: true,
    });
    const e = logs(
      ["202609", "dev-ci", finished],
      ["202610", "dev-ci-b", ["workflow-started", "workflow-failed"]],
    );
    expect((await run(e, ["free", "--fid=dev-ci", "--workflow=debug"])).json.fid).toBe("dev-ci-c");
  });

  it("continues a name whose last run of the workflow is IN_PROGRESS", async () => {
    const d = logs(["202610", "dev-ci", ["workflow-started"]]);
    expect((await run(d, ["free", "--fid=dev-ci", "--workflow=debug"])).json).toMatchObject({
      fid: "dev-ci",
      suffixed: false,
    });
    const e = logs(["202610", "dev-ci", finished], ["202610", "dev-ci-b", ["workflow-started"]]);
    expect((await run(e, ["free", "--fid=dev-ci", "--workflow=debug"])).json.fid).toBe("dev-ci-b");
  });

  it("a log folder with no run of this workflow counts as used", async () => {
    const d = logs(["202610", "dev-ci", finished]);
    expect((await run(d, ["free", "--fid=dev-ci", "--workflow=build"])).json.fid).toBe("dev-ci-b");
  });

  it("exits 1 for a FID that is not an issue-less FID (an all-digit word, not a slug)", async () => {
    for (const fid of ["123-fix", "fix-2-retry", "Fix_CI"]) {
      const r = await run(logs(), ["free", `--fid=${fid}`, "--workflow=debug"]);
      expect(r.code, fid).toBe(1);
      expect(r.json).toBeUndefined();
      expect(r.err).toContain("not an issue-less FID");
    }
  });

  it("exits 5 when the name and every suffix are used", async () => {
    const used = ["dev-ci", ..."bcdefghijklmnopqrstuvwxyz".split("").map((x) => `dev-ci-${x}`)];
    const d = logs(...used.map((fid): [string, string, string[]] => ["202610", fid, finished]));
    const r = await run(d, ["free", "--fid=dev-ci", "--workflow=debug"]);
    expect(r.code).toBe(5);
    expect(r.err).toContain("every -b");
  });

  it("freeFid looks in every root it is given", () => {
    const d = logs(["202610", "dev-ci", finished]);
    expect(freeFid([d], "dev-ci", "debug")).toBe("dev-ci-b");
    const other = logs();
    expect(freeFid([other, d], "dev-ci", "debug")).toBe("dev-ci-b");
    expect(freeFid([other], "dev-ci", "debug")).toBe("dev-ci");
  });
});
