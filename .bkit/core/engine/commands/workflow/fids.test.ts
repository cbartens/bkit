import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { FID_PATTERNS, fidsCommand, issueIdOf, readIssueTracker } from "./fids";
import { fromBranch, fromMarker } from "./fids";

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
  it.each([
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
  ])("tracker %s, FID %j -> valid %s, issueId %j", async (tracker, fid, valid, issueId) => {
    const r = await run(project(), ["check", `--fid=${fid}`, `--tracker=${tracker}`]);
    expect(r.code).toBe(valid ? 0 : 1);
    expect(r.json).toMatchObject({ tracker, valid, issueId });
    if (!valid) expect(r.err).toContain("does not match");
  });

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

// ---------------------------------------------------------------------------
// auto-fid-guard
// ---------------------------------------------------------------------------
// auto-fid-guard — FID slug allowlist.
//
// bkit-auto resolves {FID} PRIMARILY from the PR-body marker (`<!-- bkit:fid={FID} -->`).
// The PR body is collaborator-trusted, not commit-signed (docs/security.md § CI Auto-Route
// Trust), and {FID} flows into filesystem paths (docs/plans/{YYYYMM}/logs/{FID}/…,
// .worktrees/{FID}) and downstream /bkit-* dispatch.
//
// The allowlist lives in `bkit fids` (commands/workflow/fids.ts). This audit asserts BOTH
// halves of the guard:
//   (i)  every FID entry point in bkit-auto.md goes through the command — the
//        CI_DEV argument through `bkit fids check --tracker=any`, the PR-body
//        marker and branch fallback through `bkit fids parse` — and no block
//        recovers a FID from the marker by hand;
//   (ii) the command's allowlists actually REJECT path-traversal / shell-
//        metacharacter FIDs (including inside a PR-body marker) and ACCEPT
//        the well-formed FID each tracker mints.
describe("auto-fid-guard", () => {
  const REPO_ROOT = path.resolve(__dirname, "../../../../..");
  const AUTO = fs.readFileSync(path.resolve(REPO_ROOT, ".bkit/workflows/bkit-auto.md"), "utf-8");

  /** Every ```bash block body in bkit-auto.md. */
  const BASH_BLOCKS = [...AUTO.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]!);

  // Attack vectors every allowlist MUST reject — path traversal, absolute
  // paths, nested writes, and shell metacharacters reachable from an
  // attacker-edited PR-body marker.
  const MALICIOUS_FIDS = [
    "../../elsewhere",
    "..",
    "../341-three-runtimes",
    "341-three-runtimes/../../etc",
    "a/b",
    "/etc/passwd",
    "341;rm -rf /",
    "$(whoami)",
    "`id`",
    "341 three",
    "341-three-runtimes\n../evil",
  ] as const;

  describe("bkit-auto FID slug guard (#341 F4 — path-traversal rejection)", () => {
    describe("(i) every FID entry point goes through bkit fids", () => {
      it("the CI_DEV FID argument is checked by `bkit fids check --tracker=any` before use", () => {
        const block = BASH_BLOCKS.find((b) => b.includes("MODE=CI_DEV"));
        expect(block, "the CI / CI_DEV discrimination block").toBeDefined();
        const check = block!.indexOf('fids check --fid="$ARG" --tracker=any');
        expect(check).toBeGreaterThan(-1);
        // The check runs before the CI_DEV mode line is printed, and a failed
        // check exits the block (never falls through to CI_DEV).
        expect(check).toBeLessThan(block!.indexOf("MODE=CI_DEV"));
        expect(block!.slice(check).split("\n")[0]).toMatch(/\|\|\s*\{[^}]*exit 1;\s*\}/);
      });

      it("the PR-body marker and the branch fallback are resolved by `bkit fids parse`", () => {
        const block = BASH_BLOCKS.find((b) => b.includes("fids parse"));
        expect(block, "the FID recovery block").toBeDefined();
        expect(block).toMatch(/fids parse --marker="\$MARKER" --branch="\{BRANCH\}"/);
      });

      it("no bash block recovers a FID from the marker by hand (sed/grep/jq on bkit:fid=)", () => {
        for (const b of BASH_BLOCKS) expect(b).not.toMatch(/bkit:fid=/);
      });
    });

    describe("(ii) each allowlist rejects traversal/injection and accepts its valid FID", () => {
      for (const [tracker, re] of Object.entries(FID_PATTERNS)) {
        for (const evil of MALICIOUS_FIDS) {
          it(`${tracker} rejects ${JSON.stringify(evil)}`, () => {
            expect(re.test(evil)).toBe(false);
          });
        }
      }

      it("a traversal FID inside a PR-body marker is refused, never returned", () => {
        for (const evil of MALICIOUS_FIDS) {
          expect(fromMarker(`<!-- bkit:issue=#341 bkit:fid=${evil} -->`, "github")).toBeNull();
          expect(fromMarker(`<!-- bkit:issue=ABC-1 bkit:fid=${evil} -->`, "linear")).toBeNull();
          expect(fromMarker(`<!-- bkit:fid=${evil} -->`, "none")).toBeNull();
          expect(fromBranch(`feat/${evil}`, "none").ok).toBe(false);
        }
      });

      it("github accepts a well-formed numeric-issue FID", () => {
        expect(FID_PATTERNS.github.test("341-three-runtimes")).toBe(true);
      });
      it("linear accepts a well-formed alpha-prefixed FID", () => {
        expect(FID_PATTERNS.linear.test("bar-341-three-runtimes")).toBe(true);
      });
      it("none accepts a well-formed branch-derived FID", () => {
        expect(FID_PATTERNS.none.test("341-three-runtimes")).toBe(true);
        expect(FID_PATTERNS.none.test("my-feature-branch")).toBe(true);
      });
      it("any (CI_DEV) accepts both tracker shapes", () => {
        expect(FID_PATTERNS.any.test("341-three-runtimes")).toBe(true);
        expect(FID_PATTERNS.any.test("bar-341-three-runtimes")).toBe(true);
      });
    });
  });
});
