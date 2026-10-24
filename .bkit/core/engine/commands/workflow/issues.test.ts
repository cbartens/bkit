import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

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
import { stampMarker } from "./tracker";

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
  const code = await runCommand([...argv, "--json"], [issuesCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/**
 * A Linear GraphQL stub: `commentCreate` appends to the issue's comments and to the
 * returned `sent`; any other query answers the issue with those comments.
 */
function linearCommentServer(): string[] {
  const sent: string[] = [];
  const comments: Array<{ body: string; createdAt: string }> = [];
  const create = (body: string) => {
    sent.push(body);
    comments.push({ body, createdAt: "2026-10-24T00:00:00Z" });
    return { data: { commentCreate: { success: true, comment: { url: "https://l/c" } } } };
  };
  const read = () => ({
    data: {
      issue: {
        identifier: "ENG-4",
        title: "t",
        url: "u",
        description: "",
        state: { name: "Todo" },
        labels: { nodes: [] },
        comments: { nodes: comments },
      },
    },
  });
  const answers: Record<string, (q: { variables: any }) => object> = {
    create: (q) => create(q.variables.input.body),
    read,
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_u: string, init: RequestInit) => {
      const q = JSON.parse(String(init.body)) as { query: string; variables: any };
      const kind = ["read", "create"][Number(q.query.includes("commentCreate"))]!;
      return new Response(JSON.stringify(answers[kind]!(q)));
    }),
  );
  return sent;
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

  it("a stamped marker and Jira's HTML <h6> markers count; HTML prose does not", () => {
    expect(isGenerated(`${GEN} 0123456789ab\n### Step 1`)).toBe(true);
    expect(isGenerated("<h6>bkit:generated</h6><p>x</p>")).toBe(true);
    expect(isGenerated('<h6 id="bkitgenerated">bkit:generated 0123456789ab</h6><p>x</p>')).toBe(
      true,
    );
    expect(isGenerated("<p>see <h6>bkit:generated</h6></p>")).toBe(false);
    expect(isGenerated(`${GEN} not-a-hash\nx`)).toBe(false);
    const r = issueText("Old plan.", [
      { body: "<p>first</p><h6>bkit:ignore-earlier</h6><p>Second plan.</p>" },
      { body: "Follow-up." },
    ]);
    expect(r).toMatchObject({ text: "<p>Second plan.</p>\n\nFollow-up.", cut: true });
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

    // Jira's listJiraIssueComments: a `data` envelope, `created` with a +hhmm offset.
    write(
      cwd,
      "jira.json",
      JSON.stringify({
        data: {
          appliedContentFormat: "markdown",
          comments: [
            { body: "new", created: "2026-10-21T15:06:23.863+1000" },
            { body: "old", created: "2026-10-21T15:06:23.398+1000" },
          ],
        },
      }),
    );
    expect((await run(cwd, ["issues", "text", "--comments-file=jira.json"])).json.text).toBe(
      "old\n\nnew",
    );
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

  const project = { project: "https://github.com/orgs/acme/projects/3/views/1" };

  it("builds the two board payloads from bkit.github.project", async () => {
    const cwd = dir({ issueTracker: "github", github: project });
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
      updateItem: {
        method: "update_project_item",
        owner: "acme",
        owner_type: "org",
        project_number: 3,
        item_owner: "acme",
        item_repo: "app",
        issue_number: 12,
        updated_field: { name: "Status", value: "In progress" },
      },
    });
    const review = await labels(cwd, "--board=review", "--issue=12", "--owner-repo=acme/app");
    expect(review.json.board.updateItem.updated_field.value).toBe("In review");
    expect(review.json.trackerState).toBeNull();
  });

  it.each([
    [{ issueTracker: "github", github: { project: false } }, "opted-out"],
    [{ issueTracker: "github" }, "not-configured"],
    [{ issueTracker: "github", github: { review: "QA" } }, "not-configured"],
    [
      { issueTracker: "github", github: { project: "https://github.com/acme/app" } },
      "project-url-invalid",
    ],
    [{ issueTracker: "linear", github: project }, "tracker-linear"],
    [{ issueTracker: "jira", github: project }, "tracker-jira"],
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
    [{ issueTracker: "jira", jira: { review: "Code Review" } }, "In Progress", "Code Review"],
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

  it("targets a personal board as owner_type user, with the Status option names overridden", async () => {
    const cwd = dir({
      issueTracker: "github",
      github: {
        project: "https://github.com/users/me/projects/1",
        progress: "Doing",
        review: "QA",
      },
    });
    const r = await labels(cwd, "--board=progress", "--issue=12", "--owner-repo=acme/app");
    expect(r.json.board.addItem).toMatchObject({
      owner: "me",
      owner_type: "user",
      project_number: 1,
    });
    expect(r.json.board.updateItem.updated_field).toEqual({ name: "Status", value: "Doing" });
    const review = await labels(cwd, "--board=review", "--issue=12", "--owner-repo=acme/app");
    expect(review.json.board.updateItem.updated_field.value).toBe("QA");
  });

  it("--board on a configured board needs --issue and --owner-repo", async () => {
    const cwd = dir({ issueTracker: "github", github: project });
    expect((await labels(cwd, "--board=progress", "--owner-repo=acme/app")).code).toBe(2);
    expect((await labels(cwd, "--board=progress", "--issue=12", "--owner-repo=acme")).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// comment
// ---------------------------------------------------------------------------

describe("bkit issues comment", () => {
  // `body` is the comment with its marker unstamped; every call checks the stamp is
  // the hash of the body below it.
  const comment = async (cwd: string, ...args: string[]) => {
    const r = await run(cwd, ["issues", "comment", ...args]);
    const printed = r.json?.comment as string | undefined;
    const body = printed?.replace(/^(###### bkit:generated) [0-9a-f]{12}/, "$1");
    if (body !== undefined) expect(stampMarker(body)).toBe(printed);
    return { ...r, body };
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

describe("issues reaches the tracker only through tracker.ts", () => {
  it("never shells out or fetches itself", () => {
    const src = fs.readFileSync(path.join(__dirname, "issues.ts"), "utf-8");
    expect(src).not.toMatch(/node:child_process|spawnSync|execSync|\bfetch\(/);
    expect(src).toContain('from "./tracker.js"');
  });
});

describe("bkit issues comment --post", () => {
  const STEP = ["issues", "comment", "--step-number=3", "--step-title=Plan Verify"];
  const saved = process.env.BKIT_LINEAR_API_KEY;
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
    else process.env.BKIT_LINEAR_API_KEY = saved;
  });

  it("without --post prints no tracker key and calls nothing", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const r = await run(dir({ issueTracker: "linear" }), STEP);
    expect(r.code).toBe(0);
    expect(r.json).not.toHaveProperty("tracker");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("skips tracker none and an issue-less FID", async () => {
    expect(
      (await run(dir({ issueTracker: "none" }), [...STEP, "--post", "--fid=x"])).json.tracker,
    ).toEqual({ skipped: "tracker-none" });
    expect(
      (await run(dir({ issueTracker: "linear" }), [...STEP, "--post", "--fid=dev-ci-x"])).json
        .tracker,
    ).toEqual({ skipped: "no-issue" });
  });

  it("posts the printed body; an identical recent comment is not posted twice", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear" });
    const sent = linearCommentServer();
    const first = await run(cwd, [...STEP, "--post", "--fid=eng-4-x"]);
    expect(first.json.tracker).toEqual({ done: true, action: "comment", url: "https://l/c" });
    expect(sent).toEqual([first.json.comment]);
    const again = await run(cwd, [...STEP, "--post", "--fid=eng-4-x"]);
    expect(again.json.tracker).toMatchObject({ done: true, deduped: true });
    expect(sent).toHaveLength(1);
  });

  it("a failed post exits 0 with done false and the reason", async () => {
    const r = await run(dir({ issueTracker: "linear" }), [...STEP, "--post", "--issue=ENG-4"]);
    expect(r.code).toBe(0);
    expect(r.json.tracker).toEqual({ done: false, action: "comment", reason: "auth" });
  });

  it("prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback", async () => {
    const cwd = dir({ issueTracker: "linear" });
    const r = await run(cwd, [
      ...STEP,
      "--line=first",
      "--line=back\\slash",
      "--post",
      "--issue=ENG-4",
    ]);
    expect(r.json.tracker).toMatchObject({ done: false });
    expect(r.json.comment).toContain("\nfirst\nback\\slash");
    expect(fs.readFileSync(r.json.commentFile, "utf-8")).toBe(r.json.comment);
  });

  it("--file: an engine-action row per run dedups a re-run without reading the issue", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear" });
    const file = path.join(cwd, "status.jsonl");
    fs.writeFileSync(
      file,
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-24T00:00:00Z" })}\n`,
    );
    const sent = linearCommentServer();
    const first = await run(cwd, [...STEP, "--post", "--issue=ENG-4", `--file=${file}`]);
    expect(first.json.tracker).toEqual({ done: true, action: "comment", url: "https://l/c" });
    const row = JSON.parse(fs.readFileSync(file, "utf-8").trim().split("\n").at(-1)!);
    expect(row).toMatchObject({ type: "engine-action", action: "comment" });
    expect(row.key).toBe("build/1/step/3/-/-/comment");
    vi.stubGlobal("fetch", vi.fn());
    const again = await run(cwd, [...STEP, "--post", "--issue=ENG-4", `--file=${file}`]);
    expect(again.json.tracker).toMatchObject({ done: true, deduped: true, url: "https://l/c" });
    expect(sent).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// fetch / related — the engine reads the issue straight to files
// ---------------------------------------------------------------------------

/** A Linear GraphQL stub answering `issue(id:)` from `issues`, keyed by identifier. */
function linearIssues(
  issues: Record<
    string,
    { title: string; state: string; description: string; comments: object[]; labels?: string[] }
  >,
) {
  const calls: string[] = [];
  const fetch = vi.fn(async (_u: string, init: RequestInit) => {
    const q = JSON.parse(String(init.body)) as { query: string; variables: { id: string } };
    calls.push(q.variables.id);
    const i = issues[q.variables.id];
    return new Response(
      JSON.stringify({
        data: {
          issue: i
            ? {
                identifier: q.variables.id,
                title: i.title,
                url: `https://linear.app/x/issue/${q.variables.id}`,
                description: i.description,
                state: { name: i.state },
                labels: { nodes: (i.labels ?? []).map((name) => ({ name })) },
                comments: { nodes: i.comments },
              }
            : null,
        },
      }),
    );
  });
  vi.stubGlobal("fetch", fetch);
  return calls;
}

describe("bkit issues fetch", () => {
  const saved = process.env.BKIT_LINEAR_API_KEY;
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
    else process.env.BKIT_LINEAR_API_KEY = saved;
  });

  it("writes the description raw, comments oldest first and the facts; prints facts, never the body", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear" });
    linearIssues({
      "ENG-4": {
        title: "Export CSV",
        state: "Todo",
        labels: ["bkit:design"],
        description: "The ask.\n<!-- raw html stays -->",
        comments: [
          { body: "second", createdAt: "2026-10-02T00:00:00Z" },
          { body: "first", createdAt: "2026-10-01T00:00:00Z" },
        ],
      },
    });
    const out = path.join(cwd, "session");
    const r = await run(cwd, ["issues", "fetch", "--fid=eng-4-export-csv", `--session-dir=${out}`]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      title: "Export CSV",
      url: "https://linear.app/x/issue/ENG-4",
      state: "Todo",
      labels: ["bkit:design"],
      files: {
        description: path.join(out, "issue-description.md"),
        comments: path.join(out, "issue-comments.json"),
        facts: path.join(out, "issue-facts.json"),
      },
    });
    expect(fs.readFileSync(path.join(out, "issue-description.md"), "utf-8")).toBe(
      "The ask.\n<!-- raw html stays -->",
    );
    const comments = JSON.parse(fs.readFileSync(path.join(out, "issue-comments.json"), "utf-8"));
    expect(comments.map((c: { body: string }) => c.body)).toEqual(["first", "second"]);
    expect(JSON.parse(fs.readFileSync(path.join(out, "issue-facts.json"), "utf-8"))).toEqual({
      title: "Export CSV",
      url: "https://linear.app/x/issue/ENG-4",
      state: "Todo",
      labels: ["bkit:design"],
    });
    // The files feed `issues text` unchanged.
    const text = await run(cwd, [
      "issues",
      "text",
      `--description-file=${path.join(out, "issue-description.md")}`,
      `--comments-file=${path.join(out, "issue-comments.json")}`,
    ]);
    expect(text.json.text).toBe("The ask.\n<!-- raw html stays -->\n\nfirst\n\nsecond");
  });

  it("needs --session-dir or --outbox; skips tracker none and an issue-less run", async () => {
    expect(
      (await run(dir({ issueTracker: "linear" }), ["issues", "fetch", "--issue=ENG-4"])).code,
    ).toBe(2);
    const none = await run(dir({ issueTracker: "none" }), [
      "issues",
      "fetch",
      "--fid=x",
      "--outbox=o",
    ]);
    expect(none.code).toBe(0);
    expect(none.json).toEqual({ skipped: "tracker-none" });
    const noIssue = await run(dir({ issueTracker: "linear" }), [
      "issues",
      "fetch",
      "--fid=dev-ci-x",
      "--outbox=o",
    ]);
    expect(noIssue.json).toEqual({ skipped: "no-issue" });
  });

  it("exits 80 with the reason on a network failure and writes nothing", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ENOTFOUND" } });
      }),
    );
    const r = await run(cwd, ["issues", "fetch", "--issue=ENG-4", "--outbox=o"]);
    expect(r.code).toBe(80);
    expect(r.json).toEqual({ reason: "network" });
    expect(fs.existsSync(path.join(cwd, "o"))).toBe(false);
  });

  it("exits 80 with reason auth when the key is unset, never printing a key", async () => {
    delete process.env.BKIT_LINEAR_API_KEY;
    const r = await run(dir({ issueTracker: "linear" }), [
      "issues",
      "fetch",
      "--issue=ENG-4",
      "--outbox=o",
    ]);
    expect(r.code).toBe(80);
    expect(r.json).toEqual({ reason: "auth" });
  });
});

function linearBlockers(nodes: object[] | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: { issue: nodes && { inverseRelations: { nodes } } },
          }),
        ),
    ),
  );
}

function failingFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("nope", { status: 401 })),
  );
}

describe("bkit issues blocked-by", () => {
  const saved = process.env.BKIT_LINEAR_API_KEY;
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
    else process.env.BKIT_LINEAR_API_KEY = saved;
  });

  it("prints each blocker's state and how many are still open", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear" });
    linearBlockers([
      {
        type: "blocks",
        issue: { identifier: "ENG-1", state: { name: "Done", type: "completed" } },
      },
      {
        type: "related",
        issue: { identifier: "ENG-2", state: { name: "Todo", type: "unstarted" } },
      },
      {
        type: "blocks",
        issue: { identifier: "ENG-3", state: { name: "Todo", type: "unstarted" } },
      },
    ]);
    const r = await run(cwd, ["issues", "blocked-by", "--issue=ENG-4"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      blockers: [
        { id: "ENG-1", state: "Done" },
        { id: "ENG-3", state: "Todo" },
      ],
      open: 1,
    });
  });

  it("skips with tracker none", async () => {
    const cwd = dir({ issueTracker: "none" });
    const r = await run(cwd, ["issues", "blocked-by", "--issue=4"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ skipped: "tracker-none" });
  });

  it("exits 80 with the reason when the tracker read fails", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear" });
    failingFetch();
    const r = await run(cwd, ["issues", "blocked-by", "--issue=ENG-4"]);
    expect(r.code).toBe(80);
    expect(r.json).toEqual({ reason: "auth" });
  });
});

describe("bkit issues related", () => {
  const saved = process.env.BKIT_LINEAR_API_KEY;
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
    else process.env.BKIT_LINEAR_API_KEY = saved;
  });

  it("fetches each hit in rank order, up to --top, and writes the related-issues layout", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear" });
    const calls = linearIssues({
      "ENG-9": {
        title: "Nine",
        state: "Done",
        description: "nine body",
        comments: [
          { body: "###### bkit:generated\n### Step 1", createdAt: "2026-10-01T00:00:00Z" },
          { body: "human", createdAt: "2026-10-02T00:00:00Z" },
        ],
      },
      "ENG-2": { title: "Two", state: "Todo", description: "two body", comments: [] },
      "ENG-3": { title: "Three", state: "Todo", description: "three", comments: [] },
    });
    write(
      cwd,
      "hits.json",
      JSON.stringify([{ identifier: "ENG-9", title: "x" }, "eng-2", "ENG-4", "ENG-3"]),
    );
    const r = await run(cwd, [
      "issues",
      "related",
      "--hits-file=hits.json",
      "--issue=ENG-4",
      "--top=2",
      "--out=related-issues.md",
    ]);
    expect(r.code).toBe(0);
    expect(calls).toEqual(["ENG-9", "ENG-2"]);
    expect(r.json).toEqual({ path: "related-issues.md", bytes: expect.any(Number), hits: 2 });
    const text = fs.readFileSync(path.join(cwd, "related-issues.md"), "utf-8");
    expect(r.json.bytes).toBe(Buffer.byteLength(text));
    expect(text).toBe(
      "## ENG-9 — Nine (Done)\n\nnine body\n\nhuman\n\n## ENG-2 — Two (Todo)\n\ntwo body\n",
    );
  });

  it("GitHub headings carry #N; no hits writes None.", async () => {
    const cwd = dir({ issueTracker: "linear" });
    write(cwd, "hits.json", "[]");
    const r = await run(cwd, ["issues", "related", "--hits-file=hits.json", "--out=r.md"]);
    expect(r.json.hits).toBe(0);
    expect(fs.readFileSync(path.join(cwd, "r.md"), "utf-8")).toBe("None.\n");
  });

  it("a hit that cannot be fetched exits 80 and writes nothing", async () => {
    delete process.env.BKIT_LINEAR_API_KEY;
    const cwd = dir({ issueTracker: "linear" });
    write(cwd, "hits.json", '["ENG-9"]');
    const r = await run(cwd, ["issues", "related", "--hits-file=hits.json", "--out=r.md"]);
    expect(r.code).toBe(80);
    expect(r.json).toEqual({ reason: "auth" });
    expect(fs.existsSync(path.join(cwd, "r.md"))).toBe(false);
  });

  it("a hits file that is not a list of ids exits 3", async () => {
    const cwd = dir({ issueTracker: "linear" });
    write(cwd, "hits.json", '{"a":1}');
    expect(
      (await run(cwd, ["issues", "related", "--hits-file=hits.json", "--out=r.md"])).code,
    ).toBe(3);
  });
});

describe("bkit issues labels --write", () => {
  const saved = {
    key: process.env.BKIT_LINEAR_API_KEY,
    path: process.env.PATH,
    ci: process.env.CI,
  };
  afterEach(() => {
    vi.unstubAllGlobals();
    for (const [k, v] of [
      ["BKIT_LINEAR_API_KEY", saved.key],
      ["PATH", saved.path],
      ["CI", saved.ci],
    ] as const) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("reads the labels itself, writes the transition and the state, prints tracker done", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = dir({ issueTracker: "linear", linear: { progress: "In Progress" } });
    const bodies: Array<{ query: string; variables: any }> = [];
    const answers = [
      { data: { issue: { labels: { nodes: [{ name: "bkit:plan" }, { name: "next:build" }] } } } },
      {
        data: {
          issue: {
            id: "u4",
            team: { id: "t", states: { nodes: [{ id: "s2", name: "In Progress" }] } },
          },
          issueLabels: {
            nodes: [
              { id: "l-build", name: "bkit:build", team: null },
              { id: "l-plan", name: "bkit:plan", team: null },
              { id: "l-next", name: "next:build", team: null },
            ],
          },
        },
      },
      { data: { issueUpdate: { success: true } } },
      { data: { issueUpdate: { success: true } } },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_u: string, init: RequestInit) => {
        bodies.push(JSON.parse(String(init.body)));
        return new Response(JSON.stringify(answers.shift()));
      }),
    );
    const r = await run(cwd, ["issues", "labels", "--phase=build", "--write", "--fid=eng-4-x"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      add: ["bkit:build"],
      remove: ["bkit:plan", "next:build"],
      trackerState: "In Progress",
      tracker: { done: true, action: "labels" },
      boardWrite: null,
    });
    expect(bodies[2]!.variables.input).toEqual({
      addedLabelIds: ["l-build"],
      removedLabelIds: ["l-plan", "l-next"],
    });
    expect(bodies[3]!.variables.input).toEqual({ stateId: "s2" });
  });

  it("a failed read prints done false and the transition of the given --label set", async () => {
    delete process.env.BKIT_LINEAR_API_KEY;
    const r = await run(dir({ issueTracker: "linear" }), [
      "issues",
      "labels",
      "--label=bkit:plan",
      "--phase=build",
      "--write",
      "--issue=ENG-4",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      labels: ["bkit:build"],
      tracker: { done: false, action: "labels", reason: "auth" },
    });
  });

  it("skips tracker none and a run with no issue", async () => {
    const none = await run(dir({ issueTracker: "none" }), [
      "issues",
      "labels",
      "--phase=build",
      "--write",
    ]);
    expect(none.json.tracker).toEqual({ skipped: "tracker-none" });
  });

  it("a malformed board target is refused before any label is written", async () => {
    const cwd = dir({
      issueTracker: "github",
      github: { project: "https://github.com/orgs/acme/projects/3/views/1" },
    });
    const bin = path.join(cwd, "bin");
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, "gh"),
      `#!/bin/sh\nprintf '%s\\n' "$*" >> "${path.join(cwd, "gh-calls")}"\necho '[]'\n`,
      { mode: 0o755 },
    );
    fs.writeFileSync(path.join(cwd, "gh-calls"), "");
    process.env.PATH = [bin, saved.path].join(":");
    delete process.env.CI;
    const r = await run(cwd, [
      "issues",
      "labels",
      "--phase=build",
      "--board=progress",
      "--write",
      "--issue=12",
      "--owner-repo=not-a-slug",
    ]);
    expect(r.code).toBe(2);
    expect(fs.readFileSync(path.join(cwd, "gh-calls"), "utf-8")).not.toMatch(
      /--method (POST|DELETE)/,
    );
  });

  it("on a cloud or CI runtime the board is skipped:cloud and never called", async () => {
    const cwd = dir({
      issueTracker: "github",
      github: { project: "https://github.com/orgs/acme/projects/3/views/1" },
    });
    spawnSync("git", ["remote", "add", "origin", "https://github.com/acme/app.git"], { cwd });
    const bin = path.join(cwd, "bin");
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, "gh"),
      `#!/bin/sh\nprintf '%s\\n' "$*" >> "${path.join(cwd, "gh-calls")}"\necho '[]'\n`,
      { mode: 0o755 },
    );
    process.env.PATH = [bin, saved.path].join(":");
    process.env.CI = "true";
    const r = await run(cwd, [
      "issues",
      "labels",
      "--phase=build",
      "--board=progress",
      "--write",
      "--issue=12",
    ]);
    expect(r.json).toMatchObject({ board: null, boardSkipped: "cloud", boardWrite: null });
    expect(fs.readFileSync(path.join(cwd, "gh-calls"), "utf-8")).not.toContain("graphql");
  });
});
