diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 2aec4f9ce..6192c6ab1 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -1191,7 +1191,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
+   "{BKIT}" issues comment --post --purpose=terminal --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
    Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index c91c078c5..c1f01384c 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -1191,7 +1191,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
+   "{BKIT}" issues comment --post --purpose=terminal --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
    Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
diff --git a/.bkit/cli.md b/.bkit/cli.md
index e12d206ce..49ce424fb 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -208,7 +208,7 @@ Tracker payloads (issue text, label transitions, comments); --post / --write sen
 | `related` | workflow | **`--hits-file`** **`--out`** `--top` `--fid` `--issue` | Fetch each hit of the orchestrator's related-issue search and write the related-issues file. |
 | `blocked-by` | by hand | `--fid` `--issue` | The issues blocking the run's issue, with their states and the ones still open. |
 | `labels` | workflow | `--label` `--phase` `--failed` `--board` `--issue` `--owner-repo` `--write` `--fid` | Label arithmetic for a transition, the tracker state, and the board payload. |
-| `comment` | workflow | `--kind` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
+| `comment` | workflow | `--kind` `--purpose` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
 
 ### `ledgers`
 
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 458a2b954..2008423bc 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -208,7 +208,7 @@ Tracker payloads (issue text, label transitions, comments); --post / --write sen
 | `related` | workflow | **`--hits-file`** **`--out`** `--top` `--fid` `--issue` | Fetch each hit of the orchestrator's related-issue search and write the related-issues file. |
 | `blocked-by` | by hand | `--fid` `--issue` | The issues blocking the run's issue, with their states and the ones still open. |
 | `labels` | workflow | `--label` `--phase` `--failed` `--board` `--issue` `--owner-repo` `--write` `--fid` | Label arithmetic for a transition, the tracker state, and the board payload. |
-| `comment` | workflow | `--kind` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
+| `comment` | workflow | `--kind` `--purpose` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
 
 ### `ledgers`
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 993e9b66b..768309ca8 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -46,7 +46,7 @@ Every phase carries its explicit repo-info session into fileless reports and wor
 
 Routine reports may append to an eligible engine-owned progress comment. Attention reports and terminal summaries create new comments. All tracker reporting, including preparation, MCP fallback and friction, is nonfatal: attempt the report or an applicable skip, then continue substantive work. When fallback is available, publish `commentFile` byte-for-byte as one new comment and never edit prior tracker content. See `.bkit/trackers.md` § Workflow comment delivery for ownership, reconciliation and recovery.
 
-A published build prepares its close report before the push and includes that report in its single Create PR completion comment. A held build posts its close report directly. The published completion retains its own exact fallback file after the PR link is added.
+A published build prepares its close report before the push and includes that report in its single Create PR completion comment with explicit `--purpose=terminal`. Ordinary PR-link metadata keeps the kind-based purpose, so auto's startup and Dispatch share routine progress. A held build posts its close report directly. The published completion retains its own exact fallback file after the PR link is added.
 
 ## When to Run
 
diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index f538f94cc..8855557b1 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -966,6 +966,11 @@ export const issuesCommand: CommandSpec = {
       use: "workflow",
       flags: [
         { name: "kind", type: "string", help: "step (default) | failure | handover | audit" },
+        {
+          name: "purpose",
+          type: "string",
+          help: "routine | attention | terminal; defaults from kind, never from PR metadata",
+        },
         { name: "audit-slug", type: "string", help: "audit: template slug, e.g. security" },
         { name: "step-number", type: "string", help: "step number in the heading" },
         { name: "step-title", type: "string", help: "step title in the heading, e.g. Plan Verify" },
@@ -1044,6 +1049,17 @@ export const issuesCommand: CommandSpec = {
           "without --post: a --body-file / --section / --stderr-file / --error-file file is missing",
       },
       run: async (ctx) => {
+        const explicitPurpose = str(ctx.flags.purpose);
+        if (
+          explicitPurpose !== undefined &&
+          !["routine", "attention", "terminal"].includes(explicitPurpose)
+        )
+          throw new CommandError(EXIT.USAGE, "--purpose must be routine, attention or terminal");
+        const purpose =
+          explicitPurpose ??
+          (["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
+            ? "attention"
+            : "routine");
         let comment: string;
         try {
           comment = commentBody(ctx);
@@ -1081,19 +1097,14 @@ export const issuesCommand: CommandSpec = {
         ];
         const workflow = str(ctx.flags.workflow);
         const key =
-          ctx.flags.prNumber !== undefined && workflow !== undefined
+          purpose === "terminal" && workflow !== undefined
             ? endedRunActionKey(file, workflow, ...keyParts)
             : runActionKey(file, workflow, ...keyParts);
         const tracker = await postForVerb(ctx, comment, {
           fid: str(ctx.flags.fid),
           issue: str(ctx.flags.issue),
           ...(key === undefined ? {} : { file, key }),
-          purpose:
-            ctx.flags.prNumber !== undefined
-              ? "terminal"
-              : ["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
-                ? "attention"
-                : "routine",
+          purpose,
         });
         ctx.emit({ comment, commentFile, tracker });
         return EXIT.OK;
diff --git a/.bkit/core/engine/commands/workflow/tracker.integration.test.ts b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
index 1d2f86418..ac98a6855 100644
--- a/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
@@ -340,10 +340,120 @@ function workflowCommandFlags(
   command: string | undefined,
   flags: Array<[string, string[]]>,
 ): string[] {
-  return flags.flatMap(([needle, args]) => (command?.includes(needle) ? args : []));
+  return [
+    ...flags.flatMap(([needle, args]) => (command?.includes(needle) ? args : [])),
+    ...(command?.includes("--purpose=terminal") ? ["--purpose=terminal"] : []),
+  ];
 }
 
 describe("workflow comment lifecycle across real CLI processes", () => {
+  it("keeps auto startup with PR metadata and dispatch in one progress comment", () => {
+    const dir = session();
+    const startup = ok(cwd, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--workflow=auto",
+      "--workflow-heading",
+      "--step-number=1",
+      "--step-title=Start Workflow",
+      "--field=Phase=ship",
+      "--owner-repo=o/r",
+      `--tree=feat/${FID}`,
+      "--pr-number=99",
+      "--pr-url=https://github.com/o/r/pull/99",
+      "--run-id=111",
+      `--session-dir=${dir}`,
+    ]);
+    expect(startup.tracker).toMatchObject({ done: true });
+    const dispatched = ok(cwd, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--workflow=auto",
+      "--step-number=2",
+      "--step-title=Dispatch",
+      "--field=Phase=ship",
+      `--session-dir=${dir}`,
+    ]);
+    expect(dispatched.tracker).toMatchObject({ done: true });
+    expect(remote().comments).toHaveLength(1);
+    const progress = remote().comments[0]?.body;
+    expect(progress).toContain("bkit:progress");
+    expect(progress).toContain("Start Workflow");
+    expect(progress).toContain("Dispatch");
+    expect(remote().calls.filter((call) => call.method === "POST")).toHaveLength(1);
+    expect(remote().calls.filter((call) => call.method === "PATCH")).toHaveLength(1);
+    const completion = ok(cwd, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--workflow=auto",
+      "--purpose=terminal",
+      "--step-number=3",
+      "--step-title=Completion",
+      "--owner-repo=o/r",
+      "--pr-number=99",
+      "--pr-url=https://github.com/o/r/pull/99",
+      `--session-dir=${dir}`,
+    ]);
+    expect(completion.tracker).toMatchObject({ done: true });
+    expect(remote().comments).toHaveLength(2);
+    expect(remote().comments[0]?.body).toBe(progress);
+    expect(remote().comments[1]?.body).toContain("Completion");
+    expect(remote().comments[1]?.body).not.toContain("bkit:progress");
+    expect(remote().comments[1]?.body).toContain("https://github.com/o/r/pull/99");
+  });
+
+  it("redacts malformed Jira authorization from live probe diagnostics", () => {
+    const probe = path.resolve(
+      "docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts",
+    );
+    const networkAttempts = path.join(root, "network-attempts");
+    const guard = path.join(root, "network-guard.mjs");
+    write(
+      guard,
+      'import fs from "node:fs"; import net from "node:net";\nnet.Socket.prototype.connect = function() { fs.appendFileSync(process.env.BKIT_NETWORK_ATTEMPTS, "connect\\n"); throw new Error("network forbidden in probe regression"); };\n',
+    );
+    const observed: Array<{ token: string; output: string }> = [];
+    for (const token of [
+      "synthetic-jira-prefix-1234\nsynthetic-jira-tail-5678",
+      `synthetic-jira-long-prefix-${"x".repeat(750)}\nsynthetic-jira-long-tail`,
+    ]) {
+      const result = spawnSync(requireTsx(), ["--import", guard, probe, "--discover"], {
+        cwd,
+        env: {
+          ...env,
+          BKIT_GH_TOKEN: "",
+          GH_TOKEN: "",
+          BKIT_LINEAR_API_KEY: "",
+          BKIT_JIRA_API_KEY: token,
+          BKIT_NETWORK_ATTEMPTS: networkAttempts,
+        },
+        encoding: "utf8",
+        timeout: BUDGET.testTimeout,
+      });
+      expect(result.status, result.stderr).toBe(0);
+      expect(fs.existsSync(networkAttempts)).toBe(false);
+      const diagnostics: Array<{ stage: string; value: unknown }> = result.stdout
+        .trim()
+        .split("\n")
+        .map((line) => JSON.parse(line));
+      expect(diagnostics.find((row) => row.stage === "jira-schema-unavailable")).toMatchObject({
+        value: { name: "TypeError", message: expect.any(String) },
+      });
+      observed.push({ token, output: result.stdout + result.stderr });
+    }
+    for (const { token, output } of observed) {
+      expect(output).not.toContain(token.split("\n")[0]);
+      expect(output).not.toContain(token.split("\n")[1]);
+      expect(output).not.toContain("synthetic-jira-");
+    }
+  });
+
   it("keeps published build completion and PR links in one terminal comment", () => {
     const workflow = fs.readFileSync(path.resolve(".bkit/core/workflows/bkit-build.md"), "utf8");
     const closeCommand = workflow
diff --git a/.bkit/core/engine/commands/workflow/tracker.test.ts b/.bkit/core/engine/commands/workflow/tracker.test.ts
index cce723be1..bd3752146 100644
--- a/.bkit/core/engine/commands/workflow/tracker.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.test.ts
@@ -222,6 +222,7 @@ function publicationFixture() {
     failEdits: 0,
     failCreates: 0,
     loseEditResponse: false,
+    lostEditCorrection: "",
     postflightHuman: false,
     repeatedPages: false,
   };
@@ -286,7 +287,11 @@ function publicationFixture() {
       comment.body = request.variables.input?.body ?? "";
       comment.updatedAt = "2026-11-01T01:02:00.000Z";
       if (state.postflightHuman) state.comments.push(make("intervening reply", "human-account"));
-      if (state.loseEditResponse) throw new Error("response lost after successful mutation");
+      if (state.loseEditResponse) {
+        comment.body += state.lostEditCorrection;
+        if (state.lostEditCorrection) comment.updatedAt = "2026-11-01T01:03:00.000Z";
+        throw new Error("response lost after successful mutation");
+      }
       return Response.json({ data: { commentUpdate: { success: true, comment } } });
     }),
   );
@@ -616,6 +621,28 @@ describe("bounded nonfatal publication", () => {
     expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(1);
   });
 
+  it("preserves a human correction after lost append recognition and a later report", async () => {
+    const f = publicationFixture();
+    expect(await f.publish("first")).toMatchObject({ done: true });
+    const corrected = soleComment(f);
+    const correction = "\nHuman correction retained after acknowledgment was lost\n";
+    f.state.loseEditResponse = true;
+    f.state.lostEditCorrection = correction;
+    const recognized = await f.publish("ack lost");
+    expect(requireOutcomeUrl(recognized)).toBe(corrected.url);
+    expect(corrected.body).toContain("ack lost");
+    expect(corrected.body).toContain(correction);
+    const correctedBody = corrected.body;
+    const before = f.state.requests.length;
+    f.state.loseEditResponse = false;
+    expect(await f.publish("later routine report")).toMatchObject({ done: true });
+    expect(corrected.body).toBe(correctedBody);
+    expect(f.state.comments).toHaveLength(2);
+    expect(f.state.comments.at(-1)?.body).toBe(f.report("later routine report"));
+    expect(f.state.requests.slice(before).filter((r) => r.operation === "edit")).toHaveLength(0);
+    expect(f.state.requests.slice(before).filter((r) => r.operation === "create")).toHaveLength(1);
+  });
+
   it("contains exhausted append and create failures without fabricated success", async () => {
     const f = publicationFixture();
     await f.publish("first");
diff --git a/.bkit/core/engine/commands/workflow/tracker.ts b/.bkit/core/engine/commands/workflow/tracker.ts
index 54b9704fb..395a4cd62 100644
--- a/.bkit/core/engine/commands/workflow/tracker.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.ts
@@ -1680,6 +1680,7 @@ export async function postCommentOnce(
       }
     }
   };
+  let retain = true;
   try {
     try {
       try {
@@ -1819,8 +1820,11 @@ export async function postCommentOnce(
               latest.evidence.authorId === cached.comment.evidence.authorId &&
               section &&
               latest.evidence.sectionIds.includes(section.id)
-            )
+            ) {
               posted = { url: latest.url, parts: 1, evidence: latest.evidence };
+              // A section proves delivery, not authority to overwrite a changed revision.
+              retain = latest.evidence.fingerprint === actionHash(outgoing);
+            }
           } catch {
             commentDiagnostic(o, "[bkit-tracker] append recognition unavailable", warnings);
           }
@@ -1841,11 +1845,11 @@ export async function postCommentOnce(
       seal();
       return { done: false, action, reason };
     }
-    let retain = true;
     if (aggregate && posted.evidence) {
       try {
         const latest = (await recentComments(t, 1, budget)).at(-1)?.evidence;
         retain =
+          retain &&
           latest?.id === posted.evidence.id &&
           latest.fingerprint === posted.evidence.fingerprint &&
           latest.authorId === posted.evidence.authorId &&
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 2763c3a21..9b4318589 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -1239,7 +1239,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
 7. <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
+   "{BKIT}" issues comment --post --purpose=terminal --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
    Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
    <!-- bkit:tracker true end -->
diff --git a/.bkit/version b/.bkit/version
index 0e4afa71d..10fd18b64 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "e012c407c66e2b8da22a9ebc9b632237c42ea84c704f61cfb06d0144edd01536",
     ".claude/commands/bkit-auto.md": "cf0e2d6d29a873669c3e718bf6a83e0af3e8e8b6d71325bf5e968a7f3f315f22",
-    ".claude/commands/bkit-build.md": "e46a6eb1b8211384245ff936e76edb528f739533250f2739211cc41036521bb2",
+    ".claude/commands/bkit-build.md": "a79b9f0f91d249d26f2618fd6466fb934915f04f5c0c2ef1dffeec3c98a15a71",
     ".claude/commands/bkit-debug.md": "f1304c91860d5e0f5bd3cf1b83262cb062004b2e62a4362254d91991a7796024",
     ".claude/commands/bkit-design.md": "e7b100d353cf886b88ba95572d3eb8f88ac09e584417f2823e6c817de6b21cf5",
     ".claude/commands/bkit-plan.md": "72b4b5b7461d58621715c10f684bcbafcfa343efce541c2481f6a45be2f2fbc1",
@@ -56,7 +56,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "48aee178590ac282a2de281a33454833d3df07065d2e174a73373e1f74dd2be3",
     ".claude/agents/bkit-utility-update-documentation.md": "aa2d0541c2b77b0f647ee0d046c38446d90598ad23af0ea8907a52b471b39768",
     ".cursor/commands/bkit-auto.md": "4c152651b33c0ba41f323ade39b9d578d6af66e3cea25d9464a408eb357e4a05",
-    ".cursor/commands/bkit-build.md": "09044773ec64cb5b484766b38af48f7f934a14b6258dc37ea1eef91ee2ffffa8",
+    ".cursor/commands/bkit-build.md": "a228a745edb9333a67d93ab7fa302a97f1d8c85e2e19e5a5a78526f74ec0ef80",
     ".cursor/commands/bkit-debug.md": "c02ad2c9c5b1e44a1c50f422b3244bc81f71006a31717e8e594fbe5744961b4b",
     ".cursor/commands/bkit-design.md": "505e4909b51ec35696974a567c6b720a5f2a20e0b9ae4dccd814060319497dfd",
     ".cursor/commands/bkit-plan.md": "a0328b0487eff4968a76907eebb76e5f7cb25a3c46f961458ef5fb5c1753b935",
@@ -114,7 +114,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "6eeac027ab801c0ad404351a6b1ee043a45442c0cf268f444a028071a8bafd7a",
     ".opencode/agents/bkit-utility-update-documentation.md": "5fd081ae119984018573f62444493240b66411a75ec2aeafe6bdd1b1de903390",
     ".opencode/commands/bkit-auto.md": "3440ae6b925da8906394459788c702adaebd1acfe9c3fa0eddc3b40102596606",
-    ".opencode/commands/bkit-build.md": "bec0b15ed3112e45044c582559461c24eb2964a5db7417951a2a4fd2f32d3d7b",
+    ".opencode/commands/bkit-build.md": "392c6607c64d62d0cd5295fdd0f4b156ba21abcbd58c1f309d10c37b39df1908",
     ".opencode/commands/bkit-debug.md": "508ad6d28451d31b85933f4f866fb33338543d75a1d7da4004227ac4b11b0fe8",
     ".opencode/commands/bkit-design.md": "b26082616675924b1617cbd56a3be75b9045ca6abe809e7d93a6bff203ca1bff",
     ".opencode/commands/bkit-plan.md": "75e9b3ce72892071c9a1de753cef3d5ff124aa1dee2b0c1917adcb2c87fb9b97",
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "556318e0b5573604d0d56acfa315af47ea45c26a71e2e59600514d2cb3c431fc",
     ".bkit/prompts.md": "5c584b31cb1349e80e073b44ee9ab497fbc316ed75ffbca4a58dac787e34b49b",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "c1ea2895be374e33798804c3e6b7e428f38060a8b1829c7ab08d35cd5261bc79",
+    ".bkit/workflows.md": "e112c9aed4c10cabdc2a09d78222b8a5d3029ca57263bb76fc5bb08e3eb625de",
     ".bkit/README.md": "30c3136159e0a5e8a1fa49c88de861147db7c63914fd319c52e1e7ea87437b25",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "94db45116e7b408547444d6d5fc1f88e86730a1fd3b21aaee13e4aa23e627741",
+    ".bkit/cli.md": "04cbf363ac0da35ca16e6f5b15c17fce28e22b9d0377501feed384741d91a07c",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 8fecfddaa..fab2ed8f2 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -46,7 +46,7 @@ Every phase carries its explicit repo-info session into fileless reports and wor
 
 Routine reports may append to an eligible engine-owned progress comment. Attention reports and terminal summaries create new comments. All tracker reporting, including preparation, MCP fallback and friction, is nonfatal: attempt the report or an applicable skip, then continue substantive work. When fallback is available, publish `commentFile` byte-for-byte as one new comment and never edit prior tracker content. See `.bkit/trackers.md` § Workflow comment delivery for ownership, reconciliation and recovery.
 
-A published build prepares its close report before the push and includes that report in its single Create PR completion comment. A held build posts its close report directly. The published completion retains its own exact fallback file after the PR link is added.
+A published build prepares its close report before the push and includes that report in its single Create PR completion comment with explicit `--purpose=terminal`. Ordinary PR-link metadata keeps the kind-based purpose, so auto's startup and Dispatch share routine progress. A held build posts its close report directly. The published completion retains its own exact fallback file after the PR link is added.
 
 ## When to Run
 
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 8e94e84dd..6008c6458 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -1190,7 +1190,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
+   "{BKIT}" issues comment --post --purpose=terminal --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
    Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index f14df86ce..9b577a378 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -1189,7 +1189,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
+   "{BKIT}" issues comment --post --purpose=terminal --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
    Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index df029be4c..2dfdd95f8 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -1193,7 +1193,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
+   "{BKIT}" issues comment --post --purpose=terminal --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
    Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
diff --git a/DETAILS.md b/DETAILS.md
index a5cb49d25..416a232fd 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -345,7 +345,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1713 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1714 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index 0fb4dad50..05b71913e 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -808,6 +808,11 @@ export const issuesCommand = {
             use: "workflow",
             flags: [
                 { name: "kind", type: "string", help: "step (default) | failure | handover | audit" },
+                {
+                    name: "purpose",
+                    type: "string",
+                    help: "routine | attention | terminal; defaults from kind, never from PR metadata",
+                },
                 { name: "audit-slug", type: "string", help: "audit: template slug, e.g. security" },
                 { name: "step-number", type: "string", help: "step number in the heading" },
                 { name: "step-title", type: "string", help: "step title in the heading, e.g. Plan Verify" },
@@ -885,6 +890,14 @@ export const issuesCommand = {
                 [EXIT_BAD_INPUT]: "without --post: a --body-file / --section / --stderr-file / --error-file file is missing",
             },
             run: async (ctx) => {
+                const explicitPurpose = str(ctx.flags.purpose);
+                if (explicitPurpose !== undefined &&
+                    !["routine", "attention", "terminal"].includes(explicitPurpose))
+                    throw new CommandError(EXIT.USAGE, "--purpose must be routine, attention or terminal");
+                const purpose = explicitPurpose ??
+                    (["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
+                        ? "attention"
+                        : "routine");
                 let comment;
                 try {
                     comment = commentBody(ctx);
@@ -916,18 +929,14 @@ export const issuesCommand = {
                     str(ctx.flags.attempt),
                 ];
                 const workflow = str(ctx.flags.workflow);
-                const key = ctx.flags.prNumber !== undefined && workflow !== undefined
+                const key = purpose === "terminal" && workflow !== undefined
                     ? endedRunActionKey(file, workflow, ...keyParts)
                     : runActionKey(file, workflow, ...keyParts);
                 const tracker = await postForVerb(ctx, comment, {
                     fid: str(ctx.flags.fid),
                     issue: str(ctx.flags.issue),
                     ...(key === undefined ? {} : { file, key }),
-                    purpose: ctx.flags.prNumber !== undefined
-                        ? "terminal"
-                        : ["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
-                            ? "attention"
-                            : "routine",
+                    purpose,
                 });
                 ctx.emit({ comment, commentFile, tracker });
                 return EXIT.OK;
diff --git a/dist/commands/workflow/tracker.js b/dist/commands/workflow/tracker.js
index 1d27dbda2..accc777ff 100644
--- a/dist/commands/workflow/tracker.js
+++ b/dist/commands/workflow/tracker.js
@@ -1377,6 +1377,7 @@ export async function postCommentOnce(t, body, o) {
             }
         }
     };
+    let retain = true;
     try {
         try {
             try {
@@ -1500,8 +1501,11 @@ export async function postCommentOnce(t, body, o) {
                         if (latest?.evidence?.id === cached.comment.evidence.id &&
                             latest.evidence.authorId === cached.comment.evidence.authorId &&
                             section &&
-                            latest.evidence.sectionIds.includes(section.id))
+                            latest.evidence.sectionIds.includes(section.id)) {
                             posted = { url: latest.url, parts: 1, evidence: latest.evidence };
+                            // A section proves delivery, not authority to overwrite a changed revision.
+                            retain = latest.evidence.fingerprint === actionHash(outgoing);
+                        }
                     }
                     catch {
                         commentDiagnostic(o, "[bkit-tracker] append recognition unavailable", warnings);
@@ -1524,12 +1528,12 @@ export async function postCommentOnce(t, body, o) {
             seal();
             return { done: false, action, reason };
         }
-        let retain = true;
         if (aggregate && posted.evidence) {
             try {
                 const latest = (await recentComments(t, 1, budget)).at(-1)?.evidence;
                 retain =
-                    latest?.id === posted.evidence.id &&
+                    retain &&
+                        latest?.id === posted.evidence.id &&
                         latest.fingerprint === posted.evidence.fingerprint &&
                         latest.authorId === posted.evidence.authorId &&
                         latest.updatedAt === posted.evidence.updatedAt;
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 60c974b44..ee2fdbaa8 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,7 +164,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1713 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1714 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -334,7 +334,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests["tests<br/>108 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>86 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>87 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>55 symbols · 1 files"]
       end
