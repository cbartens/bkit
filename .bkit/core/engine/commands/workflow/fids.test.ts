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
  fromBranch,
  fromMarker,
  ISSUE_ID_PATTERNS,
  ISSUE_LESS_FID,
  issueIdOf,
  mintFid,
  readIssueTracker,
  slugWords,
} from "./fids";

const dirs: string[] = [];

afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** A directory whose package.json declares `bkit.tracker.default` (or no package.json at all). */
function project(tracker?: string, raw?: string) {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fids-")));
  dirs.push(d);
  if (raw !== undefined) fs.writeFileSync(path.join(d, "package.json"), raw);
  else if (tracker !== undefined) {
    fs.writeFileSync(
      path.join(d, "package.json"),
      JSON.stringify({ bkit: { tracker: { default: tracker } } }),
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
  const code = await runCommand(["fids", ...argv, "--json"], [fidsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

describe("readIssueTracker", () => {
  it.each(["github", "linear", "jira"])("reads bkit.tracker.default %s", (tracker) => {
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

  it('check --issue="#677" strips the # like find and resolve', async () => {
    const r = await run(project(), ["check", "--fid=677-foo", "--tracker=github", "--issue=#677"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ valid: true, issueId: "677" });
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

/** A git repo on `branch` with bkit.tracker.default = `tracker`, one commit, and `files` written. */
function gitRepo(tracker: string, branch = "dev", files: Record<string, string> = {}) {
  const d = project(tracker);
  const g = (...a: string[]) =>
    spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...a], { cwd: d });
  g("init", "-q", "-b", branch);
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true });
    fs.writeFileSync(path.join(d, rel), body);
  }
  g("add", "-A");
  g("commit", "-q", "--allow-empty", "-m", "base");
  return { d, g };
}

/** Writes the prompt (and any extra files) into the repo's tmp/ and returns its path. */
function promptFile(d: string, text: string, name = "prompt.md") {
  const file = path.join(d, "tmp", name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return file;
}

describe("bkit fids parse --prompt-file", () => {
  async function parse(tracker: string, text: string, files: Record<string, string> = {}) {
    const { d } = gitRepo(tracker, "dev", files);
    return run(d, ["parse", `--prompt-file=${promptFile(d, text)}`]);
  }

  it.each([
    "please do #12 today",
    "<id>12</id>",
    "<github_issue>12</github_issue>",
    "GitHub issue: #12",
    "ISSUE-12 needs work",
    "see o/r#12",
    "https://github.com/o/r/issues/12",
    "(#12)",
  ])("github reads %j as issue 12", async (text) => {
    expect(await parse("github", text)).toMatchObject({
      code: 0,
      json: { source: "github", issue: "12", ref: "#12", fidNamed: null },
    });
  });

  it.each([
    "<id>ABC-12</id>",
    "<linear_issue>ABC-12</linear_issue>",
    "Linear issue: ABC-12",
    "issue ABC-12",
    "ISSUE-ABC-12",
    "https://linear.app/acme/issue/ABC-12/some-title",
    "https://linear.app/acme/issue/abc-12/some-title",
  ])("linear reads %j as ABC-12", async (text) => {
    expect((await parse("linear", text)).json).toMatchObject({
      source: "linear",
      issue: "ABC-12",
      ref: "ABC-12",
    });
  });

  it.each([
    "issue PROJ2-7",
    "<id>PROJ2-7</id>",
    "<jira_issue>PROJ2-7</jira_issue>",
    "Jira issue: PROJ2-7",
    "ISSUE-PROJ2-7",
    "https://acme.atlassian.net/browse/PROJ2-7",
  ])("jira reads %j as PROJ2-7", async (text) => {
    expect((await parse("jira", text)).json).toMatchObject({
      source: "jira",
      issue: "PROJ2-7",
      ref: "PROJ2-7",
    });
  });

  it.each([
    ["github", "12"],
    ["github", "fix it in 12 steps"],
    ["github", "fix ABC-12"],
    ["linear", "#12"],
    ["jira", "https://github.com/o/r/issues/12"],
    ["none", "#12 and ABC-12"],
  ])("%s: %j names no issue (source none)", async (tracker, text) => {
    expect(await parse(tracker, text)).toMatchObject({
      code: 0,
      json: { source: "none", issue: "", ref: "", fidNamed: null },
    });
  });

  it("an explicit form wins over a bare mention, with a warning naming the other", async () => {
    const r = await parse("github", "do #7 after https://github.com/o/r/issues/9 and #7");
    expect(r).toMatchObject({ code: 0, json: { issue: "9", ref: "#9" } });
    expect(r.err).toContain("#7");
  });

  it.each([
    ["priority #1, then GitHub issue: #677", "677"],
    ["priority #1, then issue #677", "677"],
    ["priority #1, then <id>677</id>", "677"],
    ["priority #1, then https://github.com/o/r/issues/677", "677"],
    ["set color: #123456 for the header, see #677", "677"],
    ["header { background-color: #333; } and fix #677", "677"],
    ["fix #677 (UTF-8 output)", "677"],
  ])("github: %j reads as issue %s", async (text, issue) => {
    expect(await parse("github", text)).toMatchObject({
      code: 0,
      json: { source: "github", issue },
    });
  });

  it("github: a 3- or 6-digit #N outside a colour context stays an issue", async () => {
    expect((await parse("github", "fixes: #123")).json).toMatchObject({ issue: "123" });
  });

  it("two bare mentions of different issues exit 8 and print them as ambiguous", async () => {
    const r = await parse("github", "this is priority #1, then fix #677");
    expect(r.code).toBe(8);
    expect(r.json).toEqual({ ambiguous: ["#1", "#677"] });
    expect(r.err).toContain("#N");
  });

  it("two explicit forms naming different issues exit 8", async () => {
    const r = await parse("github", "GitHub issue: #5 and https://github.com/o/r/issues/6");
    expect(r.code).toBe(8);
    expect(r.json).toEqual({ ambiguous: ["#5", "#6"] });
  });

  /** package.json wiring the tracker with `bkit.tracker.linear.team` / `bkit.tracker.jira.project` set to `key`. */
  const keyed = (tracker: string, key: string) => ({
    "package.json": JSON.stringify({
      bkit: {
        tracker: {
          default: tracker,
          [tracker]: tracker === "linear" ? { team: key } : { project: key },
        },
      },
    }),
  });

  it.each([
    ["linear", "ABC", "Migrate hashing to SHA-256 for ABC-12", "ABC-12"],
    ["linear", "abc", "fix ABC-12 (UTF-8 output)", "ABC-12"],
    ["jira", "PROJ2", "Migrate hashing to SHA-256 for PROJ2-7", "PROJ2-7"],
    ["jira", "PROJ2", "Linear issue: nope, Jira issue: PROJ2-7, UTF-8", "PROJ2-7"],
  ])("%s with key %s configured: %j reads as %s", async (t, key, text, issue) => {
    expect(await parse(t, text, keyed(t, key))).toMatchObject({
      code: 0,
      json: { source: t, issue },
    });
  });

  it("linear with a team configured: a bare key of another prefix names no issue", async () => {
    const r = await parse("linear", "fix #677 (UTF-8 output)", keyed("linear", "ENG"));
    expect(r).toMatchObject({ code: 0, json: { source: "none", issue: "" } });
  });

  it("linear with an explicit form: the tag wins whatever the configured team", async () => {
    const r = await parse("linear", "<id>OPS-4</id> see SHA-256", keyed("linear", "ENG"));
    expect(r.json).toMatchObject({ source: "linear", issue: "OPS-4" });
  });

  it.each([
    ["linear", "bkit.tracker.linear.team"],
    ["jira", "bkit.tracker.jira.project"],
  ])(
    "%s with no key configured: a bare key names no issue, with a hint naming %s",
    async (t, setting) => {
      for (const text of ["Migrate to SHA-256", "Migrate hashing to SHA-256 for ABC-12"]) {
        const r = await parse(t, text);
        expect(r).toMatchObject({ code: 0, json: { source: "none", issue: "" } });
        expect(r.err).toContain("SHA-256");
        expect(r.err).toContain(setting);
      }
    },
  );

  it.each(["linear", "jira"])(
    "%s with no key configured: a labelled key still counts",
    async (t) => {
      const r = await parse(t, "issue ABC-12, then SHA-256");
      expect(r).toMatchObject({ code: 0, json: { source: t, issue: "ABC-12" } });
      expect(r.err).not.toContain(`bkit.${t}`);
    },
  );

  /** A github repo whose origin is `url`. */
  async function parseWithOrigin(url: string, text: string) {
    const { d, g } = gitRepo("github");
    g("remote", "add", "origin", url);
    return run(d, ["parse", `--prompt-file=${promptFile(d, text)}`]);
  }

  it.each([
    ["see https://github.com/other/repo/issues/9 and fix #677", "677"],
    ["see https://github.com/Other/Repo/issues/9", ""],
    ["see https://github.com/o/r/issues/9 and fix #677", "9"],
    ["see https://github.com/O/R/issues/9 and fix #677", "9"],
    ["see other/repo#9 and fix #677", "677"],
    ["see other/repo#9", ""],
    ["see o/r#9 and fix #677", "9"],
    ["see O/R#9", "9"],
  ])("github with origin O/r: %j reads as %j", async (text, issue) => {
    const r = await parseWithOrigin("git@github.com:O/r.git", text);
    expect(r).toMatchObject({ code: 0, json: { issue } });
  });

  /** package.json wiring jira with `bkit.tracker.jira` set to `jira`. */
  const jiraCfg = (jira: Record<string, string>) => ({
    "package.json": JSON.stringify({ bkit: { tracker: { default: "jira", jira } } }),
  });

  it.each([
    ["see https://linear.app/acme/issue/OPS-4/x and fix ABC-12", "ABC-12"],
    ["see https://linear.app/acme/issue/OPS-4/x", ""],
    ["see https://linear.app/acme/issue/abc-9/x and fix ABC-12", "ABC-9"],
  ])("linear with team ABC: %j reads as %j", async (text, issue) => {
    const r = await parse("linear", text, keyed("linear", "ABC"));
    expect(r).toMatchObject({ code: 0, json: { issue } });
  });

  it.each([
    [
      { site: "https://acme.atlassian.net/", project: "PROJ2" },
      "see https://other.atlassian.net/browse/PROJ2-9 and fix PROJ2-7",
      "PROJ2-7",
    ],
    [
      { site: "https://acme.atlassian.net", project: "PROJ2" },
      "see https://acme.atlassian.net/browse/OPS-9 and fix PROJ2-7",
      "PROJ2-7",
    ],
    [
      { site: "https://ACME.atlassian.net", project: "PROJ2" },
      "see https://acme.atlassian.net/browse/PROJ2-9 and fix PROJ2-7",
      "PROJ2-9",
    ],
    [{ site: "https://acme.atlassian.net" }, "see https://other.atlassian.net/browse/PROJ2-9", ""],
    [
      { site: "https://acme.atlassian.net" },
      "see https://acme.atlassian.net/browse/OPS-9",
      "OPS-9",
    ],
    [
      { project: "PROJ2" },
      "see https://any.atlassian.net/browse/PROJ2-9 and fix PROJ2-7",
      "PROJ2-9",
    ],
  ])("jira with %j: %j reads as %j", async (jira, text, issue) => {
    const r = await parse("jira", text, jiraCfg(jira));
    expect(r).toMatchObject({ code: 0, json: { issue } });
  });

  it("a bare number with no issue prints a hint to write #N", async () => {
    const r = await parse("github", "/bkit-build 123");
    expect(r).toMatchObject({ code: 0, json: { source: "none", issue: "" } });
    expect(r.err).toContain("123 reads as a bare number; write #123");
  });

  it("fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder", async () => {
    const logged = { "docs/plans/202610/logs/12-old-thing/status.jsonl": "" };
    expect((await parse("github", "resume feat/12-old-thing please", logged)).json.fidNamed).toBe(
      "12-old-thing",
    );
    expect((await parse("github", "read docs/plans/202609/30-x-y-plan.md")).json.fidNamed).toBe(
      "30-x-y",
    );
    expect((await parse("github", "see docs/plans/202609/30-x-y-design.md")).json.fidNamed).toBe(
      "30-x-y",
    );
    expect(
      (await parse("github", "see docs/plans/202609/logs/30-x-y/status.jsonl")).json.fidNamed,
    ).toBe("30-x-y");
    expect((await parse("github", "continue 12-old-thing", logged)).json.fidNamed).toBe(
      "12-old-thing",
    );
    expect((await parse("github", "continue 12-old-thing")).json.fidNamed).toBeNull();
  });

  it("a missing prompt file exits 7; --prompt-file with --branch is a usage error", async () => {
    const { d } = gitRepo("github");
    expect((await run(d, ["parse", `--prompt-file=${path.join(d, "nope.md")}`])).code).toBe(7);
    const file = promptFile(d, "#1");
    expect((await run(d, ["parse", `--prompt-file=${file}`, "--branch=feat/1-x"])).code).toBe(2);
  });
});

describe("slugWords and mintFid", () => {
  it("drops stopwords and all-digit words, keeps the first three in text order", () => {
    expect(slugWords("Engine resolves Step 1: the issue id, FID")).toEqual([
      "engine",
      "resolves",
      "step",
      "issue",
      "id",
      "fid",
    ]);
  });

  it("folds non-ASCII letters to ASCII and drops what cannot fold", () => {
    expect(slugWords("Café über naïve 日本")).toEqual(["cafe", "uber", "naive"]);
  });

  it("ignores URLs, tags and slash commands", () => {
    expect(slugWords("/bkit-debug <id>4</id> https://x.io/a fix login")).toEqual(["fix", "login"]);
  });

  it("mints {issue}-{slug} from the title, else the prompt, else the workflow", () => {
    expect(mintFid({ issue: "12", title: "Export the CSV report now", prompt: "x" })).toBe(
      "12-export-csv-report",
    );
    expect(mintFid({ issue: "ABC-3", title: "The and of", prompt: "Sync calendar" })).toBe(
      "abc-3-sync-calendar",
    );
    expect(mintFid({ issue: "12", title: "", prompt: "the", workflow: "design" })).toBe(
      "12-design",
    );
  });

  it("issue-less: the branch's last segment leads and does not count toward three words", () => {
    expect(mintFid({ issue: "", prompt: "Fix the flaky login test today", branch: "dev" })).toBe(
      "dev-fix-flaky-login",
    );
    expect(mintFid({ issue: "", prompt: "fix login", branch: "claude/tidy-up-2-things" })).toBe(
      "tidy-up-things-fix-login",
    );
    expect(mintFid({ issue: "", prompt: "fix login", branch: null })).toBe("fix-login");
  });
});

describe("bkit fids resolve", () => {
  const finished = (wf = "debug") =>
    `${JSON.stringify({ type: "workflow-started", workflow: wf, at: "2026-10-01T00:00:00Z" })}\n${JSON.stringify({ type: "workflow-done", workflow: wf, at: "2026-10-01T01:00:00Z" })}\n`;

  async function resolve(
    d: string,
    o: { prompt: string; issue?: string; title?: string; workflow?: string },
  ) {
    const argv = [
      "resolve",
      `--prompt-file=${promptFile(d, o.prompt)}`,
      `--issue=${o.issue ?? ""}`,
      `--workflow=${o.workflow ?? "design"}`,
    ];
    if (o.title !== undefined) argv.push(`--title-file=${promptFile(d, o.title, "title.txt")}`);
    return run(d, argv);
  }

  it("1. a FID the prompt names wins", async () => {
    const { d } = gitRepo("github", "feat/12-branch-one");
    const r = await resolve(d, { prompt: "resume feat/12-named-one", issue: "12", title: "T" });
    expect(r).toMatchObject({
      code: 0,
      json: { fid: "12-named-one", source: "prompt", existing: false, month: null },
    });
  });

  it("2. the current feat/ branch, when it embeds the issue", async () => {
    const { d } = gitRepo("github", "feat/12-branch-one", {
      "docs/plans/202610/logs/12-branch-one/status.jsonl": "",
    });
    expect((await resolve(d, { prompt: "#12", issue: "12", title: "T" })).json).toEqual({
      fid: "12-branch-one",
      source: "branch",
      month: "202610",
      existing: true,
      fids: [],
    });
    const other = await resolve(d, { prompt: "#13", issue: "13", title: "New thing" });
    expect(other.json).toMatchObject({ fid: "13-new-thing", source: "minted" });
  });

  it("2. an issue-less run takes any feat/ slug", async () => {
    const { d } = gitRepo("github", "feat/upgrade-react-19");
    expect((await resolve(d, { prompt: "go" })).json).toMatchObject({
      fid: "upgrade-react-19",
      source: "branch",
    });
  });

  it("3. a FID logged for the issue on origin/dev, even when the working tree lacks it", async () => {
    const { d, g } = gitRepo("github", "dev", {
      "docs/plans/202609/logs/12-old-name/status.jsonl": "{}\n",
    });
    g("update-ref", "refs/remotes/origin/dev", "HEAD");
    g("checkout", "-q", "--orphan", "work");
    g("rm", "-rq", "--cached", ".");
    fs.rmSync(path.join(d, "docs"), { recursive: true, force: true });
    const r = await resolve(d, { prompt: "#12", issue: "12", title: "A fresh title" });
    expect(r.json).toMatchObject({ fid: "12-old-name", source: "logged", fids: ["12-old-name"] });
  });

  it("3. several FIDs logged for the issue exit 4 and list them", async () => {
    const { d } = gitRepo("github", "dev", {
      "docs/plans/202609/logs/12-a/status.jsonl": "",
      "docs/plans/202610/logs/12-b/status.jsonl": "",
    });
    const r = await resolve(d, { prompt: "#12", issue: "12", title: "T" });
    expect(r.code).toBe(4);
    expect(r.json.fids).toEqual(["12-a", "12-b"]);
  });

  it("4. mints from the title file; a JSON file with a title key also works", async () => {
    const { d } = gitRepo("linear", "dev");
    expect(
      (await resolve(d, { prompt: "ABC-3", issue: "ABC-3", title: "Sync the Calendar feed" })).json,
    ).toMatchObject({ fid: "abc-3-sync-calendar-feed", source: "minted", existing: false });
    const json = JSON.stringify({ title: "Export CSV", url: "u", state: "open", labels: [] });
    expect((await resolve(d, { prompt: "ABC-3", issue: "ABC-3", title: json })).json.fid).toBe(
      "abc-3-export-csv",
    );
  });

  it("4. a stopword-only title falls back to the prompt; non-ASCII titles fold", async () => {
    const { d } = gitRepo("github", "dev");
    expect(
      (await resolve(d, { prompt: "#5 rework café menu", issue: "5", title: "The and of" })).json
        .fid,
    ).toBe("5-rework-cafe-menu");
    expect(
      (await resolve(d, { prompt: "#5", issue: "5", title: "Crème brûlée über" })).json.fid,
    ).toBe("5-creme-brulee-uber");
  });

  it("5. an issue-less mint a finished run used takes the next free suffix", async () => {
    const { d } = gitRepo("github", "claude/tidy-2", {
      "docs/plans/202610/logs/tidy-fix-login/status.jsonl": finished(),
    });
    const r = await resolve(d, { prompt: "Fix the login", workflow: "debug" });
    expect(r.json).toMatchObject({ fid: "tidy-fix-login-b", source: "suffixed", existing: false });
  });

  it("refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number", async () => {
    const { d } = gitRepo("github", "dev");
    const r = await resolve(d, { prompt: "/bkit-build 123", workflow: "build" });
    expect(r.code).toBe(9);
    expect(r.err).toContain("123 reads as a bare number; write #123");
    expect(r.json).toBeUndefined();
  });

  it("a bare number beside words still mints from the words; tracker none mints from the workflow", async () => {
    const { d } = gitRepo("github", "dev");
    expect(
      (await resolve(d, { prompt: "fix 2 flaky tests", workflow: "build" })).json,
    ).toMatchObject({ fid: "dev-fix-flaky-tests", source: "minted" });
    const none = gitRepo("none", "dev");
    expect((await resolve(none.d, { prompt: "123", workflow: "build" })).json).toMatchObject({
      fid: "dev-build",
      source: "minted",
    });
  });

  it("6. a FID that fails the format check exits 1", async () => {
    const { d } = gitRepo("github", "dev");
    const r = await resolve(d, { prompt: "resume feat/13-other", issue: "12", title: "T" });
    expect(r.code).toBe(1);
    expect(r.err).toContain("13-other");
  });

  it("a missing title or prompt file exits 7", async () => {
    const { d } = gitRepo("github", "dev");
    const r = await run(d, [
      "resolve",
      `--prompt-file=${promptFile(d, "#1")}`,
      "--issue=1",
      `--title-file=${path.join(d, "tmp", "gone.txt")}`,
      "--workflow=design",
    ]);
    expect(r.code).toBe(7);
  });
});

describe("bkit fids plans", () => {
  async function plans(files: string[]) {
    const { d } = gitRepo("github", "dev", Object.fromEntries(files.map((f) => [f, "# p\n"])));
    return run(d, ["plans", "--fid=12-x", "--month=202610"]);
  }

  it("none: no plan file at all", async () => {
    expect((await plans(["docs/plans/202610/13-x-plan.md"])).json).toEqual({
      source: "none",
      plan: null,
    });
  });

  it("single: the plan; numbered files beside it are not plans", async () => {
    const r = await plans([
      "docs/plans/202610/12-x-plan.md",
      "docs/plans/202610/12-x-plan-1.md",
      "docs/plans/202610/12-x-design.md",
    ]);
    expect(r.json).toEqual({ source: "single", plan: "docs/plans/202610/12-x-plan.md" });
  });
});

describe("bkit fids design --description-file --prompt-file", () => {
  const DESIGN = "docs/plans/202609/40-parent-design.md";
  async function design(files: Record<string, string>, description?: string, prompt = "go") {
    const { d } = gitRepo("github", "dev", { [DESIGN]: "# d\n", ...files });
    const argv = ["design", "--fid=50-sync", "--month=202610"];
    argv.push(`--prompt-file=${promptFile(d, prompt)}`);
    if (description !== undefined)
      argv.push(`--description-file=${promptFile(d, description, "description.md")}`);
    return run(d, argv);
  }

  it("the issue's Parent design link wins; audit paths are listed in order", async () => {
    const r = await design(
      {
        "docs/plans/202610/50-sync-design.md": "# own\n",
        "docs/audits/202609/a.md": "a",
        "docs/audits/202609/b.md": "b",
      },
      `**Parent design:** [40-parent-design.md](https://github.com/o/r/blob/dev/${DESIGN})\n**Audit reports:** docs/audits/202609/b.md, [a](docs/audits/202609/a.md)\n`,
    );
    expect(r).toMatchObject({
      code: 0,
      json: {
        parentFid: "40-parent",
        parentMonth: "202609",
        parentPath: DESIGN,
        parentSource: "link",
        auditPaths: ["docs/audits/202609/b.md", "docs/audits/202609/a.md"],
      },
    });
  });

  it("a plan issue's Workstreams line lists the workstreams the plan covers", async () => {
    const r = await design(
      {},
      `**Parent design:** [40-parent-design.md](https://github.com/o/r/blob/dev/${DESIGN})\n**Workstreams:** WS-1, WS-3\n`,
      "also WS-9 in prose",
    );
    expect(r).toMatchObject({ code: 0, json: { workstreams: ["WS-1", "WS-3"] } });
    const none = await design({}, "**Parent design:** none\n");
    expect(none.json.workstreams).toEqual([]);
  });

  it("no link: the feature's own design doc", async () => {
    const r = await design({ "docs/plans/202610/50-sync-design.md": "# own\n" }, "nothing here");
    expect(r.json).toMatchObject({
      parentFid: "50-sync",
      parentMonth: "202610",
      parentPath: "docs/plans/202610/50-sync-design.md",
      parentSource: "fid",
      auditPaths: [],
    });
  });

  it("none: no link and no own design doc (exit 1, nulls); a named audit path must exist", async () => {
    const r = await design({}, undefined, "audit at docs/audits/202609/a.md");
    expect(r.code).toBe(7);
    const ok = await design(
      { "docs/audits/202609/a.md": "a" },
      undefined,
      "see docs/audits/202609/a.md",
    );
    expect(ok).toMatchObject({
      code: 1,
      json: { parentFid: null, parentSource: null, auditPaths: ["docs/audits/202609/a.md"] },
    });
  });

  it("a missing description file exits 7", async () => {
    const { d } = gitRepo("github", "dev");
    const r = await run(d, [
      "design",
      "--fid=50-sync",
      `--description-file=${path.join(d, "tmp", "gone.md")}`,
    ]);
    expect(r.code).toBe(7);
  });
});
