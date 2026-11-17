diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 4a7d9ccc4..922e79d82 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -211,7 +211,7 @@ Tracker payloads (issue text, label transitions, comments); --post / --write sen
 | `related` | workflow | **`--hits-file`** **`--out`** `--top` `--fid` `--issue` | Fetch each hit of the orchestrator's related-issue search and write the related-issues file. |
 | `blocked-by` | by hand | `--fid` `--issue` | The issues blocking the run's issue, with their states and the ones still open. |
 | `labels` | workflow | `--label` `--phase` `--failed` `--board` `--issue` `--owner-repo` `--write` `--fid` | Label arithmetic for a transition, the tracker state, and the board payload. |
-| `comment` | workflow | `--kind` `--purpose` `--audit-slug` `--result-file` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
+| `comment` | workflow | `--kind` `--purpose` `--audit-slug` `--result-file` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment; workflow steps only, never for ad-hoc comments. |
 
 ### `ledgers`
 
diff --git a/.bkit/core/engine/commands/workflow/issues.test.ts b/.bkit/core/engine/commands/workflow/issues.test.ts
index af74663d1..98043efa6 100644
--- a/.bkit/core/engine/commands/workflow/issues.test.ts
+++ b/.bkit/core/engine/commands/workflow/issues.test.ts
@@ -32,6 +32,10 @@ function dir(bkit?: unknown) {
   return cwd;
 }
 
+/** A `--session-dir` flag naming a session folder in `cwd`'s private outbox: a workflow-run proof. */
+const proofFlag = (cwd: string, name = "s1") =>
+  `--session-dir=${path.join(cwd, ".git", "bkit-outbox", "sessions", name)}`;
+
 const write = (cwd: string, rel: string, body: string) => {
   fs.writeFileSync(path.join(cwd, rel), body);
   return rel;
@@ -441,7 +445,7 @@ describe("bkit issues comment", () => {
   // `body` is the comment with its marker unstamped; every call checks the stamp is
   // the hash of the body below it.
   const comment = async (cwd: string, ...args: string[]) => {
-    const r = await run(cwd, ["issues", "comment", ...args]);
+    const r = await run(cwd, ["issues", "comment", proofFlag(cwd), ...args]);
     const printed = r.json?.comment as string | undefined;
     const body = printed?.replace(/^(###### bkit:generated) [0-9a-f]{12}/, "$1");
     if (body !== undefined) expect(stampMarker(body)).toBe(printed);
@@ -697,6 +701,7 @@ describe("bkit issues comment", () => {
     const missing = await run(cwd, [
       "issues",
       "comment",
+      proofFlag(cwd),
       "--kind=failure",
       "--step-number=1",
       "--step-title=S",
@@ -780,7 +785,9 @@ describe("bkit issues comment", () => {
     [["--kind=audit"]],
     [["--kind=audit", "--audit-slug=Bad Slug"]],
   ])("refuses %j (exit 2)", async (args) => {
-    expect((await comment(dir(), ...args)).code).toBe(2);
+    const r = await comment(dir(), ...args);
+    expect(r.code).toBe(2);
+    expect(r.err).not.toContain("workflow steps only");
   });
 
   it("exits 3 when a body, section or stderr file is missing", async () => {
@@ -803,6 +810,8 @@ describe("issues reaches the tracker only through tracker.ts", () => {
 
 describe("bkit issues comment --post", () => {
   const STEP = ["issues", "comment", "--step-number=3", "--step-title=Plan Verify"];
+  // Every call here carries a session path under the repo's outbox, the workflow-run proof.
+  const proven = (cwd: string, argv: string[]) => run(cwd, [...argv, proofFlag(cwd)]);
   const saved = process.env.BKIT_LINEAR_API_KEY;
   beforeEach(() => {
     delete process.env.BKIT_LINEAR_API_KEY;
@@ -816,7 +825,7 @@ describe("bkit issues comment --post", () => {
   it("without --post prints no tracker key and calls nothing", async () => {
     const fetch = vi.fn();
     vi.stubGlobal("fetch", fetch);
-    const r = await run(dir({ tracker: { default: "linear" } }), STEP);
+    const r = await proven(dir({ tracker: { default: "linear" } }), STEP);
     expect(r.code).toBe(0);
     expect(r.json).not.toHaveProperty("tracker");
     expect(fetch).not.toHaveBeenCalled();
@@ -824,11 +833,11 @@ describe("bkit issues comment --post", () => {
 
   it("skips tracker none and an issue-less FID", async () => {
     expect(
-      (await run(dir({ tracker: { default: "none" } }), [...STEP, "--post", "--fid=x"])).json
+      (await proven(dir({ tracker: { default: "none" } }), [...STEP, "--post", "--fid=x"])).json
         .tracker,
     ).toEqual({ skipped: "tracker-none" });
     expect(
-      (await run(dir({ tracker: { default: "linear" } }), [...STEP, "--post", "--fid=dev-ci-x"]))
+      (await proven(dir({ tracker: { default: "linear" } }), [...STEP, "--post", "--fid=dev-ci-x"]))
         .json.tracker,
     ).toEqual({ skipped: "no-issue" });
   });
@@ -837,10 +846,10 @@ describe("bkit issues comment --post", () => {
     process.env.BKIT_LINEAR_API_KEY = "k";
     const cwd = dir({ tracker: { default: "linear" } });
     const sent = linearCommentServer();
-    const first = await run(cwd, [...STEP, "--post", "--fid=eng-4-x"]);
+    const first = await proven(cwd, [...STEP, "--post", "--fid=eng-4-x"]);
     expect(first.json.tracker).toEqual({ done: true, action: "comment", url: "https://l/c" });
     expect(sent).toEqual([first.json.comment]);
-    const again = await run(cwd, [...STEP, "--post", "--fid=eng-4-x"]);
+    const again = await proven(cwd, [...STEP, "--post", "--fid=eng-4-x"]);
     expect(again.json.tracker).toMatchObject({ done: true, deduped: true });
     expect(sent).toHaveLength(1);
   });
@@ -863,19 +872,19 @@ describe("bkit issues comment --post", () => {
     write(cwd, "r.json", JSON.stringify(result));
 
     // The result renders the very comment the hand-written flags render: same counts, same link.
-    const manual = await run(cwd, [
+    const manual = await proven(cwd, [
       ...AUDIT,
       "--field=Status=COMPLETE",
       "--field=Findings=CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2",
       "--line=Report: docs/audits/202610/security.md",
       "--body-file=a.md",
     ]);
-    const derived = await run(cwd, [...AUDIT, "--result-file=r.json", "--body-file=a.md"]);
+    const derived = await proven(cwd, [...AUDIT, "--result-file=r.json", "--body-file=a.md"]);
     expect(derived.code).toBe(0);
     expect(derived.json.comment).toBe(manual.json.comment);
 
     // A hand-written count beside the result could disagree with it, so it is refused.
-    const conflicting = await run(cwd, [
+    const conflicting = await proven(cwd, [
       ...AUDIT,
       "--result-file=r.json",
       "--field=Findings=CRITICAL 9 · HIGH 9 · MEDIUM 9 · LOW 9",
@@ -895,7 +904,7 @@ describe("bkit issues comment --post", () => {
         findings: [{ severity: "SEVERE", title: "x", location: "a:1" }],
       }),
     );
-    const invalid = await run(badDir, [
+    const invalid = await proven(badDir, [
       ...AUDIT,
       "--result-file=bad.json",
       "--post",
@@ -906,23 +915,33 @@ describe("bkit issues comment --post", () => {
 
     // Tracker none still skips, and Linear still posts the printed body once, deduplicated on a re-run.
     expect(
-      (await run(cwd, [...AUDIT, "--result-file=r.json", "--post", "--fid=x"])).json.tracker,
+      (await proven(cwd, [...AUDIT, "--result-file=r.json", "--post", "--fid=x"])).json.tracker,
     ).toEqual({ skipped: "tracker-none" });
     const linear = dir({ tracker: { default: "linear" } });
     write(linear, "r.json", JSON.stringify(result));
-    const first = await run(linear, [...AUDIT, "--result-file=r.json", "--post", "--fid=eng-4-x"]);
+    const first = await proven(linear, [
+      ...AUDIT,
+      "--result-file=r.json",
+      "--post",
+      "--fid=eng-4-x",
+    ]);
     expect(first.json.tracker).toMatchObject({ done: true, action: "comment" });
     expect(sent).toEqual([first.json.comment]);
     expect(first.json.comment).toContain(
       "Audit Summary: security - Status: COMPLETE - Findings: CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2",
     );
-    const again = await run(linear, [...AUDIT, "--result-file=r.json", "--post", "--fid=eng-4-x"]);
+    const again = await proven(linear, [
+      ...AUDIT,
+      "--result-file=r.json",
+      "--post",
+      "--fid=eng-4-x",
+    ]);
     expect(again.json.tracker).toMatchObject({ done: true, deduped: true });
     expect(sent).toHaveLength(1);
   });
 
   it("a failed post exits 0 with done false and the reason", async () => {
-    const r = await run(dir({ tracker: { default: "linear" } }), [
+    const r = await proven(dir({ tracker: { default: "linear" } }), [
       ...STEP,
       "--post",
       "--issue=ENG-4",
@@ -933,7 +952,7 @@ describe("bkit issues comment --post", () => {
 
   it("prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback", async () => {
     const cwd = dir({ tracker: { default: "linear" } });
-    const r = await run(cwd, [
+    const r = await proven(cwd, [
       ...STEP,
       "--line=first",
       "--line=back\\slash",
@@ -954,18 +973,196 @@ describe("bkit issues comment --post", () => {
       `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-24T00:00:00Z" })}\n`,
     );
     const sent = linearCommentServer();
-    const first = await run(cwd, [...STEP, "--post", "--issue=ENG-4", `--file=${file}`]);
+    const first = await proven(cwd, [...STEP, "--post", "--issue=ENG-4", `--file=${file}`]);
     expect(first.json.tracker).toEqual({ done: true, action: "comment", url: "https://l/c" });
     const row = JSON.parse(fs.readFileSync(file, "utf-8").trim().split("\n").at(-1)!);
     expect(row).toMatchObject({ type: "engine-action", action: "comment" });
     expect(row.key).toBe("build/1/step/3/-/-/comment");
     vi.stubGlobal("fetch", vi.fn());
-    const again = await run(cwd, [...STEP, "--post", "--issue=ENG-4", `--file=${file}`]);
+    const again = await proven(cwd, [...STEP, "--post", "--issue=ENG-4", `--file=${file}`]);
     expect(again.json.tracker).toMatchObject({ done: true, deduped: true, url: "https://l/c" });
     expect(sent).toHaveLength(1);
   });
 });
 
+describe("bkit issues comment workflow-run proof", () => {
+  const STEP = ["issues", "comment", "--step-number=3", "--step-title=Plan Verify"];
+  const sessions = (cwd: string) => path.join(cwd, ".git", "bkit-outbox", "sessions");
+  const saved = process.env.BKIT_LINEAR_API_KEY;
+  beforeEach(() => {
+    delete process.env.BKIT_LINEAR_API_KEY;
+  });
+  afterEach(() => {
+    vi.unstubAllGlobals();
+    if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
+    else process.env.BKIT_LINEAR_API_KEY = saved;
+  });
+
+  it("refuses a call with no workflow-run proof and prints no body", async () => {
+    const cwd = dir();
+    write(cwd, "secret-body.md", "Private body.\n");
+    const bare = await run(cwd, STEP);
+    expect(bare.code).toBe(2);
+    expect(bare.err).toContain("workflow steps only");
+    expect(bare.err).toContain("plain markdown");
+    expect(bare.json?.comment).toBeUndefined();
+
+    const outside = "/nowhere/secret-session";
+    const given = await run(cwd, [
+      ...STEP,
+      `--session-dir=${outside}`,
+      "--file=secret-status.jsonl",
+      "--body-file=secret-body.md",
+    ]);
+    expect(given.code).toBe(2);
+    expect(given.err).toContain("workflow steps only");
+    expect(given.json?.comment).toBeUndefined();
+    expect(given.err).not.toContain("secret-session");
+    expect(given.err).not.toContain("secret-status");
+    expect(given.err).not.toContain("secret-body");
+    expect(given.err).not.toContain("Private body");
+  });
+
+  it("refuses an unproven post before any tracker request", async () => {
+    process.env.BKIT_LINEAR_API_KEY = "k";
+    const fetch = vi.fn();
+    vi.stubGlobal("fetch", fetch);
+    const cwd = dir({ tracker: { default: "linear" } });
+    const r = await run(cwd, [...STEP, "--post", "--issue=ENG-4"]);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("workflow steps only");
+    expect(fetch).not.toHaveBeenCalled();
+    expect(fs.existsSync(path.join(cwd, "tmp"))).toBe(false);
+  });
+
+  it("session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it", async () => {
+    const cwd = dir();
+    const root = sessions(cwd);
+    fs.mkdirSync(path.join(root, "live"), { recursive: true });
+    expect((await run(cwd, [...STEP, `--session-dir=${path.join(root, "live")}`])).code).toBe(0);
+
+    // Outside the sessions folder, or nested below a session, is no proof.
+    fs.mkdirSync(path.join(cwd, "other"));
+    fs.mkdirSync(path.join(root, "live", "nested"));
+    for (const bad of [path.join(cwd, "other"), path.join(root, "live", "nested"), root]) {
+      const r = await run(cwd, [...STEP, `--session-dir=${bad}`]);
+      expect(r.code, bad).toBe(2);
+      expect(r.err).toContain("workflow steps only");
+    }
+
+    // A session folder that was cleaned up still proves the call.
+    fs.rmSync(path.join(root, "live"), { recursive: true });
+    expect((await run(cwd, [...STEP, `--session-dir=${path.join(root, "live")}`])).code).toBe(0);
+
+    // With the whole outbox gone, a non-canonical spelling of a session path still resolves.
+    fs.rmSync(path.join(cwd, ".git", "bkit-outbox"), { recursive: true, force: true });
+    const spelled = `${root}/../sessions/./gone`;
+    expect((await run(cwd, [...STEP, `--session-dir=${spelled}`])).code).toBe(0);
+    const escaped = `${root}/../elsewhere`;
+    expect((await run(cwd, [...STEP, `--session-dir=${escaped}`])).code).toBe(2);
+  });
+
+  it("status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run", async () => {
+    const cwd = dir();
+    const row = (workflow: string) =>
+      `${JSON.stringify({ type: "workflow-started", workflow, at: "2026-10-24T00:00:00Z" })}\n`;
+    write(cwd, "build.jsonl", row("build"));
+    write(cwd, "plan.jsonl", row("plan"));
+    write(cwd, "empty.jsonl", "");
+
+    const ok = await run(cwd, [...STEP, "--workflow=build", "--file=build.jsonl"]);
+    expect(ok.code).toBe(0);
+    expect(ok.json.comment).toContain("Plan Verify");
+    expect((await run(cwd, [...STEP, "--file=build.jsonl"])).code).toBe(0);
+
+    for (const bad of [
+      ["--workflow=build", "--file=missing.jsonl"],
+      ["--workflow=build", "--file=plan.jsonl"],
+      ["--workflow=build", "--file=empty.jsonl"],
+      ["--file=empty.jsonl"],
+    ]) {
+      const r = await run(cwd, [...STEP, ...bad]);
+      expect(r.code, bad.join(" ")).toBe(2);
+      expect(r.err).toContain("workflow steps only");
+    }
+  });
+
+  it("audit proof accepts a body file in its own audit outbox folder and refuses one elsewhere", async () => {
+    const cwd = dir();
+    const outbox = path.join(cwd, ".git", "bkit-outbox");
+    const AUDIT = ["issues", "comment", "--kind=audit", "--audit-slug=security"];
+    for (const rel of [
+      "audit-security/body.md",
+      "audit-other/body.md",
+      "audit-security/nested/body.md",
+    ]) {
+      fs.mkdirSync(path.dirname(path.join(outbox, rel)), { recursive: true });
+      fs.writeFileSync(path.join(outbox, rel), "## Overview\n\nAll clear.\n");
+    }
+    write(cwd, "plain.md", "## Overview\n\nAll clear.\n");
+
+    const ok = await run(cwd, [
+      ...AUDIT,
+      `--body-file=${path.join(outbox, "audit-security/body.md")}`,
+    ]);
+    expect(ok.code).toBe(0);
+    expect(ok.json.comment).toContain("Audit Summary: security");
+
+    for (const bad of [
+      path.join(outbox, "audit-other/body.md"),
+      path.join(outbox, "audit-security/nested/body.md"),
+      path.join(cwd, "plain.md"),
+    ]) {
+      const r = await run(cwd, [...AUDIT, `--body-file=${bad}`]);
+      expect(r.code, bad).toBe(2);
+      expect(r.err).toContain("workflow steps only");
+    }
+  });
+
+  it("refuses a call whose proof cannot be resolved", async () => {
+    const outside = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-nogit-")));
+    dirs.push(outside);
+    const noRepo = await run(outside, [
+      ...STEP,
+      `--session-dir=${path.join(outside, ".git", "bkit-outbox", "sessions", "s1")}`,
+    ]);
+    expect(noRepo.code).toBe(2);
+    expect(noRepo.err).toContain("workflow steps only");
+
+    const cwd = dir();
+    fs.mkdirSync(path.join(cwd, "status-dir"));
+    const asDir = await run(cwd, [...STEP, "--workflow=build", "--file=status-dir"]);
+    expect(asDir.code).toBe(2);
+    expect(asDir.err).toContain("workflow steps only");
+  });
+
+  it("checks the run proof before skipping an issue-less call", async () => {
+    const cases: Array<[unknown, string, string]> = [
+      [{ tracker: { default: "linear" } }, "--fid=dev-ci-x", "no-issue"],
+      [{ tracker: { default: "none" } }, "--fid=x", "tracker-none"],
+    ];
+    for (const [bkit, fid, skipped] of cases) {
+      const cwd = dir(bkit);
+      const bare = await run(cwd, [...STEP, "--post", fid]);
+      expect(bare.code, fid).toBe(2);
+      expect(bare.err).toContain("workflow steps only");
+      expect(bare.json?.tracker).toBeUndefined();
+
+      const proven = await run(cwd, [...STEP, "--post", fid, proofFlag(cwd)]);
+      expect(proven.code, fid).toBe(0);
+      expect(proven.json.tracker).toEqual({ skipped });
+    }
+  });
+});
+
+describe("bkit issues comment summary", () => {
+  it("the comment verb's summary says it is for workflow steps only", () => {
+    expect(issuesCommand.verbs.comment!.summary).toContain(
+      "workflow steps only, never for ad-hoc comments",
+    );
+  });
+});
+
 // ---------------------------------------------------------------------------
 // fetch / related — the engine reads the issue straight to files
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index 8e6685740..8d7f02132 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -30,6 +30,7 @@ import {
   classifyFailure,
   commentDiagnostic,
   commentFileOf,
+  commentRunProof,
   endedRunActionKey,
   fetchIssue,
   moveOnBoard,
@@ -1199,7 +1200,7 @@ export const issuesCommand: CommandSpec = {
     },
     comment: {
       summary:
-        "The exact body of a ###### bkit:generated step, failure, handover, or audit comment.",
+        "The exact body of a ###### bkit:generated step, failure, handover, or audit comment; workflow steps only, never for ad-hoc comments.",
       use: "workflow",
       flags: [
         { name: "kind", type: "string", help: "step (default) | failure | handover | audit" },
@@ -1302,6 +1303,11 @@ export const issuesCommand: CommandSpec = {
           (["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
             ? "attention"
             : "routine");
+        if (commentRunProof(ctx) === null)
+          throw new CommandError(
+            EXIT.USAGE,
+            "bkit issues comment is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP",
+          );
         let comment: string;
         try {
           comment = commentBody(ctx);
diff --git a/.bkit/core/engine/commands/workflow/tracker.integration.test.ts b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
index 2a53230e4..f18fc7b57 100644
--- a/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
@@ -727,6 +727,7 @@ describe("workflow comment lifecycle across real CLI processes", () => {
       "--workflow=build",
       "--step-number=3",
       "--step-title=Legacy",
+      `--session-dir=${dir}`,
     ]);
     fs.appendFileSync(
       path.join(cwd, REL),
@@ -736,7 +737,7 @@ describe("workflow comment lifecycle across real CLI processes", () => {
     const legacy = report(cwd, "Legacy", { file: REL });
     expect(legacy.tracker).toMatchObject({ done: true, deduped: true });
     expect(remote().calls).toHaveLength(before);
-    const skipped = report(cwd, "Issue less", { issue: "", number: 4 });
+    const skipped = report(cwd, "Issue less", { issue: "", number: 4, sessionDir: dir });
     expect(skipped.tracker).toMatchObject({ skipped: "no-issue" });
     expect(remote().calls).toHaveLength(before);
     fault("all");
@@ -750,4 +751,41 @@ describe("workflow comment lifecycle across real CLI processes", () => {
     expect(fs.readFileSync(String(resumed.commentFile), "utf8")).toBe(bytes);
     expect(remote().comments.at(-1)?.body).toContain("Exact fallback 😀");
   });
+
+  it("an ad-hoc comment with no run proof exits 2 and reaches no tracker", () => {
+    const before = remote().calls.length;
+    const result = cli(cwd, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--step-number=3",
+      "--step-title=Ad hoc research",
+    ]);
+    expect(result.code).toBe(2);
+    expect(result.stderr).toContain("workflow steps only");
+    expect(result.out.comment).toBeUndefined();
+    expect(remote().comments).toHaveLength(0);
+    expect(remote().calls).toHaveLength(before);
+  });
+
+  it("accepts a session minted in the main checkout from a linked worktree", () => {
+    const dir = session();
+    const linked = path.join(root, "linked-worktree");
+    git(cwd, "worktree", "add", "-q", "-b", "feat/linked", linked);
+    const result = cli(linked, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--workflow=build",
+      "--step-number=3",
+      "--step-title=From worktree",
+      `--session-dir=${dir}`,
+    ]);
+    expect(result.stderr).not.toContain("workflow steps only");
+    expect(result.code, result.stderr).toBe(0);
+    expect(remote().comments).toHaveLength(1);
+    expect(lastBody()).toContain("From worktree");
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/tracker.ts b/.bkit/core/engine/commands/workflow/tracker.ts
index 443fa1657..fb0269300 100644
--- a/.bkit/core/engine/commands/workflow/tracker.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.ts
@@ -1970,6 +1970,69 @@ export function commentFileOf(
   }
 }
 
+/** This repository's private outbox `sessions/` folder; null outside a Git repository. */
+export function sessionsRoot(cwd: string): string | null {
+  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+  return common ? path.join(common, "bkit-outbox", "sessions") : null;
+}
+
+/** The real path of `p`, resolving its nearest existing ancestor when `p` itself is gone. */
+function canonicalPath(p: string): string {
+  const abs = path.resolve(p);
+  const tail: string[] = [];
+  let head = abs;
+  while (!fs.existsSync(head)) {
+    const parent = path.dirname(head);
+    if (parent === head) return abs;
+    tail.unshift(path.basename(head));
+    head = parent;
+  }
+  return path.join(fs.realpathSync(head), ...tail);
+}
+
+/**
+ * Proof that a workflow or audit run is making a `bkit issues comment` call: a session
+ * folder directly under the outbox `sessions/` folder (it may be deleted by now), a
+ * status file holding a run, or an audit body file in its own audit outbox folder.
+ * Null with no proof or on any lookup error.
+ */
+export function commentRunProof(ctx: RunContext): "session" | "status" | "audit" | null {
+  try {
+    const session = str(ctx.flags.sessionDir);
+    if (session !== undefined) {
+      const root = sessionsRoot(ctx.cwd);
+      if (
+        root &&
+        path.dirname(canonicalPath(path.resolve(ctx.cwd, session))) === canonicalPath(root)
+      )
+        return "session";
+    }
+    const file = str(ctx.flags.file);
+    if (file !== undefined) {
+      const abs = path.resolve(ctx.cwd, file);
+      if (
+        fs.statSync(abs).isFile() &&
+        endedRunActionKey(abs, str(ctx.flags.workflow) || undefined, "proof") !== undefined
+      )
+        return "status";
+    }
+    const slug = str(ctx.flags.auditSlug);
+    const body = str(ctx.flags.bodyFile);
+    if (str(ctx.flags.kind) === "audit" && slug !== undefined && body !== undefined) {
+      const root = sessionsRoot(ctx.cwd);
+      if (
+        root &&
+        path.dirname(canonicalPath(path.resolve(ctx.cwd, body))) ===
+          path.join(canonicalPath(path.dirname(root)), `audit-${slug}`)
+      )
+        return "audit";
+    }
+    return null;
+  } catch {
+    return null;
+  }
+}
+
 /** Optional session ownership, validated against this repository's private outbox. */
 export function sessionPublication(
   cwd: string,
@@ -1977,9 +2040,8 @@ export function sessionPublication(
   workflow: string | undefined,
 ): RunContext["publication"] {
   if (!session || !workflow) return undefined;
-  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
-  if (!common) throw new Error("session association repository unavailable");
-  const sessions = path.join(common, "bkit-outbox", "sessions");
+  const sessions = sessionsRoot(cwd);
+  if (!sessions) throw new Error("session association repository unavailable");
   const dir = fs.realpathSync(path.resolve(cwd, session));
   if (path.dirname(dir) !== fs.realpathSync(sessions) || !fs.statSync(dir).isDirectory())
     throw new Error("session association directory unavailable");
@@ -2041,7 +2103,7 @@ export function runActionKey(
  */
 export function endedRunActionKey(
   file: string | undefined,
-  workflow: string,
+  workflow: string | undefined,
   ...parts: Array<string | number | undefined | null>
 ): string | undefined {
   const latest = (runs: WorkflowRun[], name: string) =>
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index a4141f9b3..d9d6c6a51 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -833,13 +833,22 @@ describe("replay-safe ledger appends on real files", () => {
     const persisted = rows(path.join(repo, "docs", "failures.jsonl"));
     expect(persisted).toHaveLength(3);
 
-    // 3. The tracker draft is rendered from the same result.
+    // 3. The tracker draft is rendered from the same result; the audit body file in its
+    // own audit outbox folder is the run proof.
+    const auditDir = path.join(
+      git(repo, ["rev-parse", "--path-format=absolute", "--git-common-dir"]),
+      "bkit-outbox",
+      "audit-security",
+    );
+    fs.mkdirSync(auditDir, { recursive: true });
+    fs.writeFileSync(path.join(auditDir, "body.md"), "Audit body\n");
     const draft = await call(repo, COMMANDS, [
       "issues",
       "comment",
       "--kind=audit",
       "--audit-slug=security",
       "--result-file=result.json",
+      `--body-file=${path.join(auditDir, "body.md")}`,
     ]);
     expect(draft.code).toBe(0);
     expect(draft.json!["comment"]).toContain(`Findings: ${totals}`);
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index 7467d7ec0..5f31d95fb 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -12,7 +12,7 @@ import { CommandError, EXIT, parseJson, repoRoot, } from "../lib.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { str } from "./status.js";
 import { isCloudOrCi } from "../../checks/before/env.js";
-import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, POST_FLAG, TRACKER_OUTPUT, attempt, classifyFailure, commentDiagnostic, commentFileOf, endedRunActionKey, fetchIssue, moveOnBoard, postForVerb, readBlockers, readLabels, redact, runActionKey, skipOf, stampMarker, trackerTarget, writeLabels, } from "./tracker.js";
+import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, POST_FLAG, TRACKER_OUTPUT, attempt, classifyFailure, commentDiagnostic, commentFileOf, commentRunProof, endedRunActionKey, fetchIssue, moveOnBoard, postForVerb, readBlockers, readLabels, redact, runActionKey, skipOf, stampMarker, trackerTarget, writeLabels, } from "./tracker.js";
 /** Exit code: an input file is missing or not in the expected shape. */
 export const EXIT_BAD_INPUT = 3;
 function readInput(cwd, file, flag) {
@@ -982,7 +982,7 @@ export const issuesCommand = {
             run: labelsVerb,
         },
         comment: {
-            summary: "The exact body of a ###### bkit:generated step, failure, handover, or audit comment.",
+            summary: "The exact body of a ###### bkit:generated step, failure, handover, or audit comment; workflow steps only, never for ad-hoc comments.",
             use: "workflow",
             flags: [
                 { name: "kind", type: "string", help: "step (default) | failure | handover | audit" },
@@ -1081,6 +1081,8 @@ export const issuesCommand = {
                     (["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
                         ? "attention"
                         : "routine");
+                if (commentRunProof(ctx) === null)
+                    throw new CommandError(EXIT.USAGE, "bkit issues comment is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP");
                 let comment;
                 try {
                     comment = commentBody(ctx);
diff --git a/dist/commands/workflow/tracker.js b/dist/commands/workflow/tracker.js
index c50e4a844..a188a10ce 100644
--- a/dist/commands/workflow/tracker.js
+++ b/dist/commands/workflow/tracker.js
@@ -1636,14 +1636,69 @@ export function commentFileOf(cwd, comment, ctx) {
         return null;
     }
 }
+/** This repository's private outbox `sessions/` folder; null outside a Git repository. */
+export function sessionsRoot(cwd) {
+    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+    return common ? path.join(common, "bkit-outbox", "sessions") : null;
+}
+/** The real path of `p`, resolving its nearest existing ancestor when `p` itself is gone. */
+function canonicalPath(p) {
+    const abs = path.resolve(p);
+    const tail = [];
+    let head = abs;
+    while (!fs.existsSync(head)) {
+        const parent = path.dirname(head);
+        if (parent === head)
+            return abs;
+        tail.unshift(path.basename(head));
+        head = parent;
+    }
+    return path.join(fs.realpathSync(head), ...tail);
+}
+/**
+ * Proof that a workflow or audit run is making a `bkit issues comment` call: a session
+ * folder directly under the outbox `sessions/` folder (it may be deleted by now), a
+ * status file holding a run, or an audit body file in its own audit outbox folder.
+ * Null with no proof or on any lookup error.
+ */
+export function commentRunProof(ctx) {
+    try {
+        const session = str(ctx.flags.sessionDir);
+        if (session !== undefined) {
+            const root = sessionsRoot(ctx.cwd);
+            if (root &&
+                path.dirname(canonicalPath(path.resolve(ctx.cwd, session))) === canonicalPath(root))
+                return "session";
+        }
+        const file = str(ctx.flags.file);
+        if (file !== undefined) {
+            const abs = path.resolve(ctx.cwd, file);
+            if (fs.statSync(abs).isFile() &&
+                endedRunActionKey(abs, str(ctx.flags.workflow) || undefined, "proof") !== undefined)
+                return "status";
+        }
+        const slug = str(ctx.flags.auditSlug);
+        const body = str(ctx.flags.bodyFile);
+        if (str(ctx.flags.kind) === "audit" && slug !== undefined && body !== undefined) {
+            const root = sessionsRoot(ctx.cwd);
+            if (root &&
+                path.dirname(canonicalPath(path.resolve(ctx.cwd, body))) ===
+                    path.join(canonicalPath(path.dirname(root)), `audit-${slug}`))
+                return "audit";
+        }
+        return null;
+    }
+    catch {
+        return null;
+    }
+}
 /** Optional session ownership, validated against this repository's private outbox. */
 export function sessionPublication(cwd, session, workflow) {
     if (!session || !workflow)
         return undefined;
-    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
-    if (!common)
+    const sessions = sessionsRoot(cwd);
+    if (!sessions)
         throw new Error("session association repository unavailable");
-    const sessions = path.join(common, "bkit-outbox", "sessions");
     const dir = fs.realpathSync(path.resolve(cwd, session));
     if (path.dirname(dir) !== fs.realpathSync(sessions) || !fs.statSync(dir).isDirectory())
         throw new Error("session association directory unavailable");
