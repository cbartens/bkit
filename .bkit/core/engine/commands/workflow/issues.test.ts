import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import {
  cutEarlier,
  headingAnchor,
  isGenerated,
  issueText,
  issuesCommand,
  sortOldestFirst,
  transitionLabels,
} from "./issues";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function dir(bkit?: unknown) {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-issues-")));
  dirs.push(cwd);
  spawnSync("git", ["init", "-q", "-b", "main"], { cwd });
  if (bkit !== undefined)
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ bkit }));
  return cwd;
}

const write = (cwd: string, rel: string, body: string) => {
  fs.writeFileSync(path.join(cwd, rel), body);
  return rel;
};

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(argv, [issuesCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

// ---------------------------------------------------------------------------
// text
// ---------------------------------------------------------------------------

describe("bkit issues text", () => {
  const GEN = "###### bkit:generated";
  const CUT = "###### bkit:ignore-earlier";

  it("drops comments whose first line is the generated marker, keeps human ones", () => {
    const r = issueText("The ask.", [
      { body: `${GEN}\n### Step 1 — Start Workflow` },
      { body: "Please also cover X." },
      { body: `  \n${GEN}  \nleading blank line still counts` },
    ]);
    expect(r).toEqual({
      text: "The ask.\n\nPlease also cover X.",
      kept: 1,
      dropped: 2,
      cut: false,
    });
  });

  it("a comment that only MENTIONS the marker later on is human input", () => {
    expect(isGenerated(`See the ${GEN} comments above.`)).toBe(false);
    expect(isGenerated(`Note:\n${GEN}`)).toBe(false);
  });

  it("keeps only what follows the LAST whole-line cut marker, marker dropped", () => {
    const r = issueText("Old plan.", [
      { body: `${CUT}\nSecond plan.` },
      { body: `Revised again.\n  ${CUT}\t\nThird plan.` },
      { body: "Follow-up." },
    ]);
    expect(r.cut).toBe(true);
    expect(r.text).toBe("Third plan.\n\nFollow-up.");
  });

  it("an inline mention of the cut token does not cut", () => {
    const text = `Use \`${CUT}\` to restart; inline ${CUT} here.`;
    expect(cutEarlier(text)).toEqual({ text, cut: false });
  });

  it("drops generated comments BEFORE cutting, so a marker inside bkit's own comment never cuts", () => {
    const r = issueText("Keep me.", [{ body: `${GEN}\n${CUT}\nbkit output` }]);
    expect(r).toMatchObject({ text: "Keep me.", cut: false, dropped: 1 });
  });

  it("sorts oldest first when every comment has a timestamp, else keeps the given order", () => {
    const newestFirst = [
      { body: "b", createdAt: "2026-10-02T00:00:00Z" },
      { body: "a", createdAt: "2026-10-01T00:00:00Z" },
    ];
    expect(sortOldestFirst(newestFirst).comments.map((c) => c.body)).toEqual(["a", "b"]);
    expect(sortOldestFirst([{ body: "b" }, newestFirst[1]!]).sorted).toBe(false);
  });

  it("reads files: GitHub created_at array and Linear {comments} wrapper; cut honours sort order", async () => {
    const cwd = dir();
    write(cwd, "desc.md", "Desc.\n");
    write(
      cwd,
      "gh.json",
      JSON.stringify([
        { body: `${CUT}\nnewest`, created_at: "2026-10-03T00:00:00Z" },
        { body: "older", created_at: "2026-10-01T00:00:00Z" },
        { body: `${GEN}\nstep`, created_at: "2026-10-02T00:00:00Z" },
      ]),
    );
    const r = await run(cwd, [
      "issues",
      "text",
      "--description-file=desc.md",
      "--comments-file=gh.json",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ text: "newest", kept: 2, dropped: 1, cut: true });

    write(
      cwd,
      "lin.json",
      JSON.stringify({ comments: [{ body: "one", createdAt: "2026-10-01T00:00:00Z" }] }),
    );
    expect((await run(cwd, ["issues", "text", "--comments-file=lin.json"])).json.text).toBe("one");
  });

  it("exits 3 on a missing or malformed file and 2 with no input at all", async () => {
    const cwd = dir();
    write(cwd, "bad.json", '[{"text":"no body"}]');
    expect((await run(cwd, ["issues", "text", "--comments-file=bad.json"])).code).toBe(3);
    expect((await run(cwd, ["issues", "text", "--comments-file=none.json"])).code).toBe(3);
    write(cwd, "nojson.json", "nope");
    expect((await run(cwd, ["issues", "text", "--comments-file=nojson.json"])).code).toBe(3);
    expect((await run(cwd, ["issues", "text"])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// labels
// ---------------------------------------------------------------------------

describe("bkit issues labels", () => {
  const labels = (cwd: string, ...args: string[]) => run(cwd, ["issues", "labels", ...args]);

  it("a new phase drops the old phase, next:* and bkit:failed, keeps bkit:auto and foreign labels", async () => {
    const r = await labels(
      dir(),
      "--label=bug",
      "--label=bkit:design",
      "--label=bkit:auto",
      "--label=bkit:failed",
      "--label=next:plan:lite",
      "--label=nextjs",
      "--phase=plan",
    );
    expect(r.json).toEqual({
      add: ["bkit:plan"],
      remove: ["bkit:design", "next:plan:lite", "bkit:failed"],
      labels: ["bug", "bkit:auto", "nextjs", "bkit:plan"],
      changed: true,
      autoRouteSuffix: " bkit [auto route]",
      trackerState: null,
      board: null,
      boardSkipped: null,
    });
  });

  it("drops every other phase label, however many there are", () => {
    expect(
      transitionLabels(["bkit:design", "bkit:plan", "bkit:build"], { phase: "build" }),
    ).toEqual({
      add: [],
      remove: ["bkit:design", "bkit:plan"],
      labels: ["bkit:build"],
    });
  });

  it("debug is a phase: it replaces the phase it debugs and clears bkit:failed", async () => {
    const r = await labels(dir(), "--label=bkit:build", "--label=bkit:failed", "--phase=debug");
    expect(r.json).toMatchObject({
      add: ["bkit:debug"],
      remove: ["bkit:build", "bkit:failed"],
      labels: ["bkit:debug"],
      trackerState: null,
    });
    expect(transitionLabels(["bkit:debug"], { phase: "ship" }).labels).toEqual(["bkit:ship"]);
  });

  it("a Failure Path keeps the phase label and next:* is left alone without a phase", () => {
    expect(transitionLabels(["bkit:build", "next:ship"], { failed: true })).toEqual({
      add: ["bkit:failed"],
      remove: [],
      labels: ["bkit:build", "next:ship", "bkit:failed"],
    });
  });

  it("failed on adds, failed off removes, and a no-op reports changed=false", async () => {
    expect((await labels(dir(), "--label=bkit:build", "--failed=on")).json.add).toEqual([
      "bkit:failed",
    ]);
    expect((await labels(dir(), "--label=bkit:failed", "--failed=off")).json.remove).toEqual([
      "bkit:failed",
    ]);
    const noop = await labels(dir(), "--label=bkit:build", "--phase=build");
    expect(noop.json).toMatchObject({ add: [], remove: [], changed: false });
  });

  it("merged drops every phase label and bkit:failed; refuses --failed=on with it", async () => {
    const r = await labels(
      dir(),
      "--label=bkit:ship",
      "--label=bkit:failed",
      "--label=bkit:auto",
      "--phase=merged",
    );
    expect(r.json).toMatchObject({
      add: ["bkit:merged"],
      remove: ["bkit:ship", "bkit:failed"],
      labels: ["bkit:auto", "bkit:merged"],
      trackerState: null,
    });
    expect((await labels(dir(), "--phase=merged", "--failed=on")).code).toBe(2);
    expect((await labels(dir(), "--phase=build", "--failed=on")).code).toBe(2);
  });

  it("autoRouteSuffix follows an exact bkit:auto label, with or without a transition", async () => {
    expect((await labels(dir(), "--label=bkit:build", "--label=bkit:auto")).json).toMatchObject({
      changed: false,
      autoRouteSuffix: " bkit [auto route]",
    });
    expect((await labels(dir(), "--label=bkit:build")).json.autoRouteSuffix).toBe("");
    expect((await labels(dir(), "--label=bkit:automatic")).json.autoRouteSuffix).toBe("");
    expect((await labels(dir())).json.autoRouteSuffix).toBe("");
  });

  it("refuses an unknown phase or on/off value", async () => {
    expect((await labels(dir(), "--phase=lite")).code).toBe(2);
    expect((await labels(dir(), "--failed=yes")).code).toBe(2);
    expect((await labels(dir(), "--board=done")).code).toBe(2);
  });

  const project = {
    owner: "acme",
    number: 3,
    statusFieldId: 350038178,
    progressOptionId: "47fc9ee4",
    reviewOptionId: "98236657",
    doneOptionId: "x",
  };

  it("builds the three board payloads from bkit.githubProject", async () => {
    const cwd = dir({ issueTracker: "github", githubProject: project });
    const r = await labels(
      cwd,
      "--label=bkit:plan",
      "--phase=build",
      "--board=progress",
      "--issue=12",
      "--owner-repo=acme/app",
    );
    expect(r.json.boardSkipped).toBeNull();
    expect(r.json.board).toEqual({
      addItem: {
        method: "add_project_item",
        owner: "acme",
        owner_type: "org",
        project_number: 3,
        item_type: "issue",
        item_owner: "acme",
        item_repo: "app",
        issue_number: 12,
      },
      listItems: {
        method: "list_project_items",
        owner: "acme",
        owner_type: "org",
        project_number: 3,
        query: "12",
      },
      updateItem: {
        method: "update_project_item",
        owner: "acme",
        owner_type: "org",
        project_number: 3,
        updated_field: { id: 350038178, value: "47fc9ee4" },
      },
    });
    const review = await labels(cwd, "--board=review", "--issue=12", "--owner-repo=acme/app");
    expect(review.json.board.updateItem.updated_field.value).toBe("98236657");
    expect(review.json.trackerState).toBeNull();
  });

  it.each([
    [{ issueTracker: "github", githubProject: false }, "opted-out"],
    [{ issueTracker: "github" }, "not-configured"],
    [
      { issueTracker: "github", githubProject: { ...project, statusFieldId: "PVTSSF_abc" } },
      "status-field-id-not-number",
    ],
    [
      { issueTracker: "github", githubProject: { ...project, progressOptionId: "" } },
      "option-id-missing",
    ],
    [{ issueTracker: "linear", githubProject: project }, "tracker-linear"],
    [{}, "tracker-none"],
  ])("board is null with a reason for %j", async (bkit, reason) => {
    const r = await labels(dir(bkit), "--board=progress", "--issue=12", "--owner-repo=acme/app");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ board: null, boardSkipped: reason });
  });

  it.each([
    [{ issueTracker: "linear" }, "started", "In Review"],
    [{ issueTracker: "linear", linear: { review: "Code Review" } }, "started", "Code Review"],
    [{ issueTracker: "jira" }, "In Progress", "In Review"],
    [{ issueTracker: "jira", jira: { progress: "Doing", review: "QA" } }, "Doing", "QA"],
    [{ issueTracker: "github" }, null, null],
    [{}, null, null],
  ])("trackerState for %j: phase start %j, hand-off %j", async (bkit, progress, review) => {
    const cwd = dir(bkit);
    expect((await labels(cwd, "--phase=build")).json.trackerState).toBe(progress);
    expect((await labels(cwd, "--board=progress")).json.trackerState).toBe(progress);
    expect((await labels(cwd, "--phase=merged")).json.trackerState).toBe(review);
    expect((await labels(cwd, "--failed=on")).json.trackerState).toBe(review);
    expect((await labels(cwd, "--board=review")).json.trackerState).toBe(review);
    expect((await labels(cwd, "--failed=off")).json.trackerState).toBeNull();
  });

  it("accepts a digits-only string statusFieldId", async () => {
    const cwd = dir({
      issueTracker: "github",
      githubProject: { ...project, statusFieldId: "350038178" },
    });
    const r = await labels(cwd, "--board=progress", "--issue=12", "--owner-repo=acme/app");
    expect(r.json.board.updateItem.updated_field.id).toBe(350038178);
  });

  it("--board on a configured board needs --issue and --owner-repo", async () => {
    const cwd = dir({ issueTracker: "github", githubProject: project });
    expect((await labels(cwd, "--board=progress", "--owner-repo=acme/app")).code).toBe(2);
    expect((await labels(cwd, "--board=progress", "--issue=12", "--owner-repo=acme")).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// comment
// ---------------------------------------------------------------------------

describe("bkit issues comment", () => {
  const comment = async (cwd: string, ...args: string[]) => {
    const r = await run(cwd, ["issues", "comment", ...args]);
    return { ...r, body: r.json?.comment as string | undefined };
  };

  it("Step 1 with the workflow heading and the tree link", async () => {
    const r = await comment(
      dir(),
      "--workflow=build",
      "--workflow-heading",
      "--step-number=1",
      "--step-title=Start Workflow",
      "--owner-repo=o/r",
      "--tree=feat/1-x",
    );
    expect(r.body).toBe(
      "###### bkit:generated\n## Build Workflow\n### Step 1 — Start Workflow\n[o/r/tree/feat/1-x](https://github.com/o/r/tree/feat/1-x)",
    );
    expect(
      (
        await comment(
          dir(),
          "--workflow=auto",
          "--workflow-heading",
          "--step-number=1",
          "--step-title=Start Workflow",
          "--field=Phase=build",
        )
      ).body,
    ).toBe("###### bkit:generated\n## bkit Auto\n### Step 1 — Start Workflow - Phase: build");
  });

  it("renders header fields in the order the flags were given", async () => {
    const verify = await comment(
      dir(),
      "--step-number=7",
      "--step-title=Plan Verify",
      "--verdict=FAIL",
      "--failures=2",
      "--sub-plan=1",
      "--sub-plan-count=3",
      "--attempt=2",
    );
    expect(verify.body).toBe(
      "###### bkit:generated\n### Step 7 — Plan Verify - Verdict: FAIL - Failures: 2 - Sub-plan: 1/3 - Attempt: 2",
    );
    const gaps = await comment(
      dir(),
      "--step-number=8",
      "--step-title=Plan Gaps Remediate",
      "--verdict=PASS",
      "--sub-plan=1",
      "--sub-plan-count=1",
      "--attempt=1",
      "--strategy=PIVOT",
    );
    expect(gaps.body).toContain("- Sub-plan: 1/1 - Attempt: 1 - Strategy: PIVOT");
    const diag = await comment(
      dir(),
      "--step-number=15",
      "--step-title=Failure Diagnose",
      "--verdict=PASS",
      "--strategy=STANDARD",
      "--attempt=1",
    );
    expect(diag.body).toContain(
      "Failure Diagnose - Verdict: PASS - Strategy: STANDARD - Attempt: 1",
    );
    const soak = await comment(
      dir(),
      "--step-number=7",
      "--step-title=Failure Remediate Soak",
      "--verdict=PASS",
      "--field=Soak Attempt=2/3",
      "--field=Normal Attempt=1",
    );
    expect(soak.body).toContain("- Verdict: PASS - Soak Attempt: 2/3 - Normal Attempt: 1");
    const push = await comment(
      dir(),
      "--step-number=8",
      "--step-title=Push Remediation",
      "--attempt=2",
    );
    expect(push.body).toBe("###### bkit:generated\n### Step 8 — Push Remediation - Attempt: 2");
  });

  it("summary: artifact link at --ref, then the artifact verbatim", async () => {
    const cwd = dir();
    write(cwd, "summary.md", "# Summary\n\nAll good.\n\n");
    const r = await comment(
      cwd,
      "--step-number=17",
      "--step-title=Summary",
      "--verdict=PASS",
      "--owner-repo=o/r",
      "--ref=feat/1-x",
      "--artifact=docs/plans/202610/logs/1-x/build-summary.md",
      "--body-file=summary.md",
    );
    expect(r.body).toBe(
      [
        "###### bkit:generated",
        "### Step 17 — Summary - Verdict: PASS",
        "[build-summary.md](https://github.com/o/r/blob/feat/1-x/docs/plans/202610/logs/1-x/build-summary.md)",
        "# Summary\n\nAll good.",
      ].join("\n"),
    );
  });

  it("artifact path#Heading links that section of the rendered doc", async () => {
    const r = await comment(
      dir(),
      "--step-number=10",
      "--step-title=Summary",
      "--owner-repo=o/r",
      "--ref=dev",
      "--artifact=docs/plans/202610/641-x-design.md#Risks & Open Questions",
    );
    expect(r.body).toBe(
      [
        "###### bkit:generated",
        "### Step 10 — Summary",
        "[641-x-design.md § Risks & Open Questions](https://github.com/o/r/blob/dev/docs/plans/202610/641-x-design.md#risks--open-questions)",
      ].join("\n"),
    );
  });

  it.each([
    ["Overview", "overview"],
    ["Step 2 — Worktree Setup", "step-2--worktree-setup"],
    ["`bkit issues comment` (v4.9)", "bkit-issues-comment-v49"],
    ["snake_case and-hyphen", "snake_case-and-hyphen"],
    ["Ünïcode Überschrift", "ünïcode-überschrift"],
  ])("headingAnchor(%j) is GitHub's %j", (heading, anchor) => {
    expect(headingAnchor(heading)).toBe(anchor);
  });

  it("close: tree, PR and run links, then Artifacts and Telemetry sections", async () => {
    const cwd = dir();
    write(cwd, "a.md", "- a.md\n");
    write(cwd, "t.md", "runs: 1\n");
    const r = await comment(
      cwd,
      "--step-number=10",
      "--step-title=Close Workflow",
      "--owner-repo=o/r",
      "--tree=feat/1-x",
      "--pr-number=7",
      "--pr-url=https://github.com/o/r/pull/7",
      "--run-id=99",
      "--section=Artifacts=a.md",
      "--section=Telemetry=t.md",
    );
    expect(r.body).toBe(
      [
        "###### bkit:generated",
        "### Step 10 — Close Workflow",
        "[o/r/tree/feat/1-x](https://github.com/o/r/tree/feat/1-x)",
        "[o/r/pull/7](https://github.com/o/r/pull/7)",
        "[o/r/actions/run/99](https://github.com/o/r/actions/runs/99)",
        "#### Artifacts",
        "- a.md",
        "#### Telemetry",
        "runs: 1",
      ].join("\n"),
    );
  });

  it("raw lines follow the links (Fetch Context's not-configured line)", async () => {
    const r = await comment(
      dir(),
      "--step-number=4",
      "--step-title=Fetch Context",
      "--verdict=CONCERNS",
      "--field=Contexts=2",
      "--owner-repo=o/r",
      "--ref=b",
      "--artifact=docs/x/ctx.md",
      "--line=context=logs NOT CONFIGURED — that evidence was not checked this attempt",
    );
    expect(r.body!.split("\n").slice(2)).toEqual([
      "[ctx.md](https://github.com/o/r/blob/b/docs/x/ctx.md)",
      "context=logs NOT CONFIGURED — that evidence was not checked this attempt",
    ]);
  });

  it("failure: step, sub-step, error, and the last 20 stderr lines fenced", async () => {
    const cwd = dir();
    write(cwd, "err.txt", Array.from({ length: 25 }, (_, i) => `line ${i + 1}`).join("\n") + "\n");
    const r = await comment(
      cwd,
      "--kind=failure",
      "--step-number=7",
      "--step-title=Plan Verify",
      "--sub-step=3",
      "--error=gate exited 1",
      "--stderr-file=err.txt",
    );
    const lines = r.body!.split("\n");
    expect(lines.slice(0, 5)).toEqual([
      "###### bkit:generated",
      "### Workflow Failure",
      "Step: 7 — Plan Verify; Sub-step: 3",
      "Error: gate exited 1",
      "Stderr:",
    ]);
    expect(lines[5]).toBe("```text");
    expect(lines[6]).toBe("line 6");
    expect(lines.at(-2)).toBe("line 25");
    expect(lines.at(-1)).toBe("```");
    const bare = await comment(
      cwd,
      "--kind=failure",
      "--step-number=2",
      "--step-title=Worktree Setup",
      "--error=x",
    );
    expect(bare.body).toBe(
      "###### bkit:generated\n### Workflow Failure\nStep: 2 — Worktree Setup\nError: x",
    );
  });

  it("failure: --error-file carries the error text, trailing newlines dropped; a missing file exits 3", async () => {
    const cwd = dir();
    write(cwd, "error.md", "gh pr merge refused: head moved\n\n");
    const r = await comment(
      cwd,
      "--kind=failure",
      "--step-number=10",
      "--step-title=Merge",
      "--error-file=error.md",
    );
    expect(r.body).toBe(
      "###### bkit:generated\n### Workflow Failure\nStep: 10 — Merge\nError: gh pr merge refused: head moved",
    );
    const missing = await run(cwd, [
      "issues",
      "comment",
      "--kind=failure",
      "--step-number=1",
      "--step-title=S",
      "--error-file=none.md",
    ]);
    expect(missing.code).toBe(3);
  });

  it("a stderr capture holding backticks cannot close its fence", async () => {
    const cwd = dir();
    write(cwd, "err.txt", "```\ninjected\n");
    const r = await comment(
      cwd,
      "--kind=failure",
      "--step-number=1",
      "--step-title=S",
      "--error=e",
      "--stderr-file=err.txt",
    );
    expect(r.body).toContain("````text\n```\ninjected\n````");
  });

  it("handover: link and handover content", async () => {
    const cwd = dir();
    write(cwd, "h.md", "Stuck on X.\n");
    const r = await comment(
      cwd,
      "--kind=handover",
      "--owner-repo=o/r",
      "--ref=feat/1-x",
      "--artifact=docs/plans/202610/logs/1-x/build-handover.md",
      "--body-file=h.md",
    );
    expect(r.body).toBe(
      "###### bkit:generated\n### Workflow Handover\n[build-handover.md](https://github.com/o/r/blob/feat/1-x/docs/plans/202610/logs/1-x/build-handover.md)\nStuck on X.",
    );
  });

  it("audit: slug heading, header fields, and the summary", async () => {
    const cwd = dir();
    write(cwd, "a.md", "## Overview\n\nAll clear.\n");
    const r = await comment(
      cwd,
      "--kind=audit",
      "--audit-slug=security",
      "--field=Status=COMPLETE",
      "--field=Findings=CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2",
      "--line=Report: docs/audits/202610/security.md",
      "--body-file=a.md",
    );
    expect(r.body).toBe(
      "###### bkit:generated\n### Audit Summary: security - Status: COMPLETE - Findings: CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2\nReport: docs/audits/202610/security.md\n## Overview\n\nAll clear.",
    );
  });

  it("defuses a whole-line cut marker copied in from an artifact", async () => {
    const cwd = dir();
    write(cwd, "s.md", "Above.\n###### bkit:ignore-earlier\nBelow.\n");
    const r = await comment(cwd, "--step-number=9", "--step-title=Summary", "--body-file=s.md");
    expect(r.body).toContain("Above.\n`###### bkit:ignore-earlier`\nBelow.");
    expect(cutEarlier(r.body!).cut).toBe(false);
  });

  it("every body opens with the generated marker, so the next run's text drops it", async () => {
    const r = await comment(dir(), "--step-number=3", "--step-title=Branch Sync");
    expect(isGenerated(r.body!)).toBe(true);
  });

  it.each([
    [["--step-title=X"]],
    [["--step-number=1"]],
    [["--step-number=x1", "--step-title=X"]],
    [["--kind=failure", "--step-number=1", "--step-title=X"]],
    [["--kind=other"]],
    [["--step-number=1", "--step-title=X", "--tree=dev"]],
    [["--step-number=1", "--step-title=X", "--owner-repo=o/r", "--artifact=a.md"]],
    [["--step-number=1", "--step-title=X", "--owner-repo=o/r", "--ref=dev", "--artifact=a.md#"]],
    [["--step-number=1", "--step-title=X", "--field=novalue"]],
    [["--step-number=1", "--step-title=X", "--sub-plan-count=2"]],
    [["--step-number=1", "--step-title=X", "--workflow-heading"]],
    [["--kind=audit"]],
    [["--kind=audit", "--audit-slug=Bad Slug"]],
  ])("refuses %j (exit 2)", async (args) => {
    expect((await comment(dir(), ...args)).code).toBe(2);
  });

  it("exits 3 when a body, section or stderr file is missing", async () => {
    expect(
      (await comment(dir(), "--step-number=1", "--step-title=X", "--body-file=nope.md")).code,
    ).toBe(3);
    expect(
      (await comment(dir(), "--step-number=1", "--step-title=X", "--section=A=nope.md")).code,
    ).toBe(3);
  });
});

describe("issues stays off the tracker", () => {
  it("never shells out — tracker reads and writes go through MCP", () => {
    const src = fs.readFileSync(path.join(__dirname, "issues.ts"), "utf-8");
    expect(src).not.toMatch(/node:child_process|spawnSync|execSync/);
  });
});
