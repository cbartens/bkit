diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 63ce97e14..ea8d957be 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -269,9 +269,9 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Record the owner's loop answer:
+   - Loop answer, owner's words in `--reason-file`:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
      ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index a6017d339..83617b55e 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -269,9 +269,9 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Record the owner's loop answer:
+   - Loop answer, owner's words in `--reason-file`:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
      ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/.bkit/cli.md b/.bkit/cli.md
index c0672f2c6..95088df52 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -174,7 +174,7 @@ Build decision files: check the orchestrator's questions, write the engine's cou
 | --- | --- | --- | --- |
 | `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
 | `counts` | workflow | **`--out`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 0b9e076f6..cc32b3106 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -174,7 +174,7 @@ Build decision files: check the orchestrator's questions, write the engine's cou
 | --- | --- | --- | --- |
 | `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
 | `counts` | workflow | **`--out`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index deb726095..801a61a73 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -178,6 +178,15 @@ describe("engine calls", () => {
     expect({ prompts, workflows }).toEqual({ prompts: [], workflows: [] });
   });
 
+  it("no bkit-build bash block puts the owner's words inside a double-quoted argument", () => {
+    const text = workflow("build");
+    const blocks = [...text.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => String(m[1]));
+    const quoted = blocks
+      .flatMap((b) => b.split("\n"))
+      .filter((l) => /"[^"\n]*\{owner's words\}[^"\n]*"/.test(l));
+    expect(quoted).toEqual([]);
+  });
+
   it("the steps finish re-ask passes the printed problem", () => {
     const asks = ALL.flatMap((name) =>
       workflow(name)
diff --git a/.bkit/core/engine/commands/workflow/audit-report.test.ts b/.bkit/core/engine/commands/workflow/audit-report.test.ts
index e560a7780..83a59f222 100644
--- a/.bkit/core/engine/commands/workflow/audit-report.test.ts
+++ b/.bkit/core/engine/commands/workflow/audit-report.test.ts
@@ -90,4 +90,17 @@ describe("parseAuditReport", () => {
     const text = report("| None |");
     expect(parseAuditReport(text, "security").findings).toEqual([]);
   });
+
+  it("refuses a row whose Location is not path:line, naming its ID", () => {
+    for (const location of ["", "—", "src/a.ts:10-20", "src/a.ts:1, src/b.ts:2", "src/a.ts"]) {
+      const text = report(
+        row("security-1", "HIGH", "Token logged", "src/a.ts:10", "new"),
+        row("security-2", "LOW", "Verbose error", location, "new"),
+      );
+      expect(() => parseAuditReport(text, "security")).toThrow(/security-2/);
+      expect(() => parseAuditReport(text, "security")).toThrow(/Location/);
+    }
+    const ok = report(row("security-1", "HIGH", "Token logged", "`src/a.ts:10`", "new"));
+    expect(parseAuditReport(ok, "security").findings).toHaveLength(1);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/audit-report.ts b/.bkit/core/engine/commands/workflow/audit-report.ts
index 16355f9cb..d715fbc6c 100644
--- a/.bkit/core/engine/commands/workflow/audit-report.ts
+++ b/.bkit/core/engine/commands/workflow/audit-report.ts
@@ -201,6 +201,11 @@ export function parseAuditReport(text: string, slug: string): AuditReport {
       throw bad(`${id} has an unknown Severity "${severity}"; use ${AUDIT_SEVERITIES.join("|")}`);
     const title = (row["Title"] ?? "").trim();
     if (title === "") throw bad(`${id} has an empty Title`);
+    const location = bare(row["Location"]);
+    if (!/^[^\s:,]+:\d+$/.test(location))
+      throw bad(
+        `${id} has a Location "${location}" that is not \`path:line\`; write one \`path:line\``,
+      );
     const key = bare(row["Key"]);
     if (key === "") throw bad(`${id} has an empty Key; write \`new\` or the prior key`);
     if (key !== "new" && !key.startsWith(`audit-${slug}-`))
@@ -213,7 +218,7 @@ export function parseAuditReport(text: string, slug: string): AuditReport {
       id,
       severity: severity as AuditSeverity,
       title,
-      location: bare(row["Location"]),
+      location,
       ...(key === "new" ? {} : { priorKey: key }),
     });
   }
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index dbb7bb9e2..b432503e2 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -1603,4 +1603,45 @@ describe("bkit decisions apply --by=owner and pending", () => {
     expect(engine).toContain("one more round");
     expect(engine).not.toMatch(/^Status:/m);
   });
+
+  it("--answer reads the owner's reason from --reason-file", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
+    fs.writeFileSync(
+      engineOf(out),
+      [
+        "Source changed: false",
+        "Gate: FAIL",
+        "",
+        "build verify: attempt 2 of 2",
+        "",
+        "## Progress",
+        "",
+        "**Q1 — Verify:** decide the items below instead of another round?",
+        "A) Try again — one more fix round runs",
+        "B) Decide — the questions below are asked instead of another round",
+        "Recommended: B) Decide — another round is unlikely to help",
+        "",
+      ].join("\n"),
+    );
+    const reasonFile = path.join(logs, "owner-reason.md");
+    const words = "run `touch pwned` and $(echo hi) once more";
+    fs.writeFileSync(reasonFile, `${words}\n`);
+    const r = await run(
+      [
+        "decisions",
+        "apply",
+        "--by=owner",
+        `--file=${out}`,
+        "--q=1",
+        "--answer=Try again",
+        `--reason-file=${reasonFile}`,
+      ],
+      root,
+    );
+    expect(r.code).toBe(0);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toMatch(/Decision: Try again/);
+    expect(engine).toContain(words);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index f227bcbed..7d9476cc3 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -570,6 +570,11 @@ export const decisionsCommand: CommandSpec = {
           help: "--by=owner: the owner's answer to the loop question: Try again | Decide | Stop",
         },
         { name: "reason", type: "string", help: "--by=owner: the owner's words" },
+        {
+          name: "reason-file",
+          type: "string",
+          help: "--by=owner: a file holding the owner's words, read as plain text (instead of --reason)",
+        },
         {
           name: "root",
           type: "string",
@@ -648,7 +653,16 @@ export const decisionsCommand: CommandSpec = {
         if (by !== "owner")
           throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
         const n = positiveInt(ctx.flags.q, "q");
-        const reason = str(ctx.flags.reason);
+        const reasonFile = str(ctx.flags.reasonFile);
+        if (reasonFile !== undefined && str(ctx.flags.reason) !== undefined)
+          throw new CommandError(EXIT.USAGE, "--reason and --reason-file are one or the other");
+        const reasonPath = reasonFile === undefined ? undefined : path.resolve(ctx.cwd, reasonFile);
+        if (reasonPath !== undefined && !fs.existsSync(reasonPath))
+          throw new CommandError(EXIT.USAGE, `--reason-file ${reasonFile} does not exist`);
+        const reason =
+          reasonPath === undefined
+            ? str(ctx.flags.reason)
+            : fs.readFileSync(reasonPath, "utf-8").trim();
         const answer = str(ctx.flags.answer);
         const choices = [
           ctx.flags.confirm === true,
@@ -658,7 +672,7 @@ export const decisionsCommand: CommandSpec = {
         if (n === undefined || reason === undefined || choices.filter(Boolean).length !== 1)
           throw new CommandError(
             EXIT.USAGE,
-            "--by=owner needs --q, --reason and one of --confirm / --reject / --answer",
+            "--by=owner needs --q, --reason or --reason-file and one of --confirm / --reject / --answer",
           );
         const it = pause.items.find((i) => i.n === n);
         if (answer !== undefined) {
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 265873ac4..ad8d0c3cd 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -941,6 +941,41 @@ describe("bkit workflows fail", () => {
     expect(r.json.trackerState).toBe(state);
   });
 
+  it("rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines", async () => {
+    const cwd = repo();
+    const secret = "ghp_fakeSecretValue1234567890";
+    const before = process.env["BKIT_GH_TOKEN"];
+    process.env["BKIT_GH_TOKEN"] = secret;
+    try {
+      const stderr = Array.from({ length: 30 }, (_, i) => `line ${i + 1} token=${secret}`);
+      write(cwd, "tmp/error.md", `tests failed with ${secret}\n`);
+      write(cwd, "tmp/stderr.md", `${stderr.join("\n")}\n`);
+      const r = await run(
+        cwd,
+        wf(
+          "fail",
+          "build",
+          "--step-number=14",
+          "--step-title=Run Tests",
+          "--error-file=tmp/error.md",
+          "--stderr-file=tmp/stderr.md",
+        ),
+      );
+      expect(r.code).toBe(0);
+      const errorText = fs.readFileSync(path.join(cwd, "tmp/error.md"), "utf8");
+      const stderrText = fs.readFileSync(path.join(cwd, "tmp/stderr.md"), "utf8");
+      expect(errorText).not.toContain(secret);
+      expect(errorText).toContain("<BKIT_GH_TOKEN>");
+      expect(stderrText).not.toContain(secret);
+      expect(stderrText).toContain("<BKIT_GH_TOKEN>");
+      expect(stderrText.split("\n").filter((l) => l !== "")).toHaveLength(20);
+      expect(stderrText).toContain("line 30 ");
+      expect(stderrText).not.toContain("line 10 ");
+    } finally {
+      restoreEnvironment("BKIT_GH_TOKEN", before);
+    }
+  });
+
   it("prints the failure comment from --error-file, naming a lock it could not remove", async () => {
     const cwd = repo();
     write(cwd, "tmp/error.md", "tests failed: 3\n\n");
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 8c7aaad12..d79d10873 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -152,6 +152,7 @@ import {
   sessionPublication,
   issueRef,
   readLabels,
+  redact,
   runActionKey,
   skipOf,
   trackerTarget,
@@ -352,6 +353,27 @@ const EXIT_NEXT_STEP_REFUSED = 6;
  */
 const NEXT_STEP_SHAPE = /^\/bkit-[a-z0-9-]+(?: [#A-Za-z0-9._-]+)*$/;
 
+/**
+ * Rewrite the failure's error and stderr files in place before any commit or comment: configured
+ * secret values become `<NAME>`, and the stderr file keeps its last 20 lines (what the comment posts).
+ */
+function scrubFailureFiles(cwd: string, errorFile?: string, stderrFile?: string): void {
+  for (const [rel, keep] of [
+    [errorFile, false],
+    [stderrFile, true],
+  ] as const) {
+    if (rel === undefined || rel === "") continue;
+    const abs = path.resolve(cwd, rel);
+    if (!fs.existsSync(abs)) continue;
+    let text = redact(fs.readFileSync(abs, "utf-8"));
+    if (keep) {
+      const lines = text.replace(/\n+$/, "").split("\n");
+      text = `${lines.slice(-20).join("\n")}\n`;
+    }
+    fs.writeFileSync(abs, text);
+  }
+}
+
 async function failVerb(ctx: RunContext): Promise<number> {
   const workflow = workflowName(String(ctx.flags.workflow));
   // An empty value is a placeholder not held yet (the failure came before it was set).
@@ -364,6 +386,8 @@ async function failVerb(ctx: RunContext): Promise<number> {
   if (nextStep !== undefined && !NEXT_STEP_SHAPE.test(nextStep))
     throw new CommandError(EXIT_NEXT_STEP_REFUSED, "--next-step must be one /bkit-* command line");
 
+  scrubFailureFiles(ctx.cwd, str(ctx.flags.errorFile), str(ctx.flags.stderrFile));
+
   // State only for a run that took the lock: without the token the failure came
   // before Step 1 locked, and nothing here is this run's to change.
   const state =
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 69ef87c55..75b403ce3 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -260,9 +260,9 @@ _No tracker connected, skip step._
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Record the owner's loop answer:
+   - Loop answer, owner's words in `--reason-file`:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
      ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 5aacff44b..b034d32f9 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -287,9 +287,9 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Record the owner's loop answer:
+   - Loop answer, owner's words in `--reason-file`:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
      ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index ac81effca..9da4b414a 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10214,7 +10214,7 @@ Then check the plan:
 Write the decisions into the decision file:
 Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
 Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-Record the owner's loop answer:
+Loop answer, owner's words in `--reason-file`:
 Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 [commits] **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 **If** `From: challenge` **and** either an item was answered `Fix now` **or** a task of `CHALLENGE_TASKS` was not an item:
diff --git a/.bkit/version b/.bkit/version
index 31956c84a..9b6afd83f 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -12,7 +12,7 @@
     ".bkit/.env.example": "6bf0e90fae894711f951811a122424eb8eaec00bcc0c0bfdafcc2750927b4daf",
     ".opencode/opencode.json": "37a299e11dd7e9d28fd3a212fdf3ac990ba656998263d47731285d30192f0397",
     ".claude/commands/bkit-auto.md": "023c394a82a09e02bd7cc28affba340720bfc193807366b1d560e189d542b560",
-    ".claude/commands/bkit-build.md": "9f1c36e2da7cd5f40552656207dc9f1f28780815b23e7653f95c956fbb27179d",
+    ".claude/commands/bkit-build.md": "4d1f49ffaa06ceb124582b3252b0b3dec4e061399cdd2a4e95f995b3110e76b4",
     ".claude/commands/bkit-debug.md": "0a808196dd61fdbcca0252ad6b1c9b4a8e1581e7cce38f21f130b80f83be1ef9",
     ".claude/commands/bkit-design.md": "48f04d5ec7015ba1a03f7b4664316207db87a2183359d9f6476f74bc1fcef8da",
     ".claude/commands/bkit-plan.md": "55167e19e60a97557c514dd348a42282e4b9cab710442480b689af33ba2b3a06",
@@ -44,7 +44,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "73709aceb5e80f5715a0dcba275f07ed3edb84fe02950230b6632fcfc18c4890",
     ".claude/agents/bkit-utility-update-documentation.md": "5006f0bf8be7ca10d048fa6050e2f71dc9b82c445c150b0bd64e8884d4bf6897",
     ".cursor/commands/bkit-auto.md": "215bd415eed342587ed2af5c15de381cf58831f461ff8d7bcea76cb0dfd88728",
-    ".cursor/commands/bkit-build.md": "160b2c8c368aaec3fd7cd5c56d258cdd10f2dd49abd9dd5848f84dbc9eb668e3",
+    ".cursor/commands/bkit-build.md": "e86f0cbc9f92e9e0dcd6de3b66c4e10c7ec75b7c834a3c28934786760e01b1ec",
     ".cursor/commands/bkit-debug.md": "ed050a7113411868edc1b8348642d116d72a1f021cc4034c2dddd7413720edac",
     ".cursor/commands/bkit-design.md": "8f907cd452dfbdd85992fcfe11208d819fc7c689ac0417fac65dcfbeacdc1a77",
     ".cursor/commands/bkit-plan.md": "552cd952eec3b8efec38d99cdb0f708e535692204c69374efd7885dee9519478",
@@ -102,7 +102,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "7429e7ff947702372741829224dd41d3725dd715414c1205cb8c7b1f1366f743",
     ".opencode/agents/bkit-utility-update-documentation.md": "25176686d7b31c9e340500d769dcfbeac72f5c53e92c873803d9bca502c63780",
     ".opencode/commands/bkit-auto.md": "a4cc36d6b9e87eb9c9f54d7d8cc98ed5ca0ca2d1ccf77d4747b33dd165dc472e",
-    ".opencode/commands/bkit-build.md": "1e7746a3ac68c68979867424ae5e9f433b6a2c6b97d21b4742b311d659c6828c",
+    ".opencode/commands/bkit-build.md": "b69523c59a8633076bc8012c41c04fa2cbd6b4a9cd1ecc199511a596ccf18104",
     ".opencode/commands/bkit-debug.md": "b4b7172f01997e9d23284231aeab88a0cb3c2007c6b951406022f4d3c47f132f",
     ".opencode/commands/bkit-design.md": "70eb829aadd1af214ffd49f2d85eed4701f49dd024f8c5852942d22fdd3033ff",
     ".opencode/commands/bkit-plan.md": "bda719d95d06de358296810e6ca1b13242ad1d87ec362044b033edd8ad93a563",
@@ -251,7 +251,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "e78096b5f2f09d1701ad99a2383a88b455320964b78e8fbbd148eb60428b7399",
+    ".bkit/cli.md": "a58e59624579af0433c3789e9200c7a9613206ae0abaaae5ec1ac85f08c87b75",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index ef50d97d4..d2217a127 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -268,9 +268,9 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Record the owner's loop answer:
+   - Loop answer, owner's words in `--reason-file`:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
      ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 58758ef3e..cad0dc0dc 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -267,9 +267,9 @@ Build Feature — Autonomous implementation
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Record the owner's loop answer:
+   - Loop answer, owner's words in `--reason-file`:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
      ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 7b03ca4c7..388c0bd13 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -271,9 +271,9 @@ $ARGUMENTS
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Record the owner's loop answer:
+   - Loop answer, owner's words in `--reason-file`:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
      ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/dist/commands/workflow/audit-report.js b/dist/commands/workflow/audit-report.js
index f211b2de7..30ccb694a 100644
--- a/dist/commands/workflow/audit-report.js
+++ b/dist/commands/workflow/audit-report.js
@@ -154,6 +154,9 @@ export function parseAuditReport(text, slug) {
         const title = (row["Title"] ?? "").trim();
         if (title === "")
             throw bad(`${id} has an empty Title`);
+        const location = bare(row["Location"]);
+        if (!/^[^\s:,]+:\d+$/.test(location))
+            throw bad(`${id} has a Location "${location}" that is not \`path:line\`; write one \`path:line\``);
         const key = bare(row["Key"]);
         if (key === "")
             throw bad(`${id} has an empty Key; write \`new\` or the prior key`);
@@ -168,7 +171,7 @@ export function parseAuditReport(text, slug) {
             id,
             severity: severity,
             title,
-            location: bare(row["Location"]),
+            location,
             ...(key === "new" ? {} : { priorKey: key }),
         });
     }
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 36747f3db..a5205368c 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -463,6 +463,11 @@ export const decisionsCommand = {
                     help: "--by=owner: the owner's answer to the loop question: Try again | Decide | Stop",
                 },
                 { name: "reason", type: "string", help: "--by=owner: the owner's words" },
+                {
+                    name: "reason-file",
+                    type: "string",
+                    help: "--by=owner: a file holding the owner's words, read as plain text (instead of --reason)",
+                },
                 {
                     name: "root",
                     type: "string",
@@ -529,7 +534,15 @@ export const decisionsCommand = {
                 if (by !== "owner")
                     throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
                 const n = positiveInt(ctx.flags.q, "q");
-                const reason = str(ctx.flags.reason);
+                const reasonFile = str(ctx.flags.reasonFile);
+                if (reasonFile !== undefined && str(ctx.flags.reason) !== undefined)
+                    throw new CommandError(EXIT.USAGE, "--reason and --reason-file are one or the other");
+                const reasonPath = reasonFile === undefined ? undefined : path.resolve(ctx.cwd, reasonFile);
+                if (reasonPath !== undefined && !fs.existsSync(reasonPath))
+                    throw new CommandError(EXIT.USAGE, `--reason-file ${reasonFile} does not exist`);
+                const reason = reasonPath === undefined
+                    ? str(ctx.flags.reason)
+                    : fs.readFileSync(reasonPath, "utf-8").trim();
                 const answer = str(ctx.flags.answer);
                 const choices = [
                     ctx.flags.confirm === true,
@@ -537,7 +550,7 @@ export const decisionsCommand = {
                     answer !== undefined,
                 ];
                 if (n === undefined || reason === undefined || choices.filter(Boolean).length !== 1)
-                    throw new CommandError(EXIT.USAGE, "--by=owner needs --q, --reason and one of --confirm / --reject / --answer");
+                    throw new CommandError(EXIT.USAGE, "--by=owner needs --q, --reason or --reason-file and one of --confirm / --reject / --answer");
                 const it = pause.items.find((i) => i.n === n);
                 if (answer !== undefined) {
                     if (it === undefined || !it.options.includes(answer))
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 1f86ce5d7..19b82d725 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -43,7 +43,7 @@ import { highestVersion } from "./plan-versions.js";
 import { mergePr, probePr } from "./prs.js";
 import { FEATURE_STATUS } from "./roadmap.js";
 import { EXIT_NO_STATUS, WORKFLOW_FLAG, positiveInt, readRuns, readStatusEvents, readStatusRows, str, } from "./status.js";
-import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, attempt, commentFileOf, postForVerb, commentDiagnostic, sessionPublication, issueRef, readLabels, runActionKey, skipOf, trackerTarget, writeLabels, } from "./tracker.js";
+import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, attempt, commentFileOf, postForVerb, commentDiagnostic, sessionPublication, issueRef, readLabels, redact, runActionKey, skipOf, trackerTarget, writeLabels, } from "./tracker.js";
 import { tipsText } from "../tips.js";
 import { EXIT_NO_RECORD, requireRecordOnShared, writeStepRow } from "./steps.js";
 import { addAllButCopied, removeWorktree } from "./worktrees.js";
@@ -205,6 +205,28 @@ const EXIT_NEXT_STEP_REFUSED = 6;
  * failure comment, so nothing that could end the span or start markdown or HTML gets through.
  */
 const NEXT_STEP_SHAPE = /^\/bkit-[a-z0-9-]+(?: [#A-Za-z0-9._-]+)*$/;
+/**
+ * Rewrite the failure's error and stderr files in place before any commit or comment: configured
+ * secret values become `<NAME>`, and the stderr file keeps its last 20 lines (what the comment posts).
+ */
+function scrubFailureFiles(cwd, errorFile, stderrFile) {
+    for (const [rel, keep] of [
+        [errorFile, false],
+        [stderrFile, true],
+    ]) {
+        if (rel === undefined || rel === "")
+            continue;
+        const abs = path.resolve(cwd, rel);
+        if (!fs.existsSync(abs))
+            continue;
+        let text = redact(fs.readFileSync(abs, "utf-8"));
+        if (keep) {
+            const lines = text.replace(/\n+$/, "").split("\n");
+            text = `${lines.slice(-20).join("\n")}\n`;
+        }
+        fs.writeFileSync(abs, text);
+    }
+}
 async function failVerb(ctx) {
     const workflow = workflowName(String(ctx.flags.workflow));
     // An empty value is a placeholder not held yet (the failure came before it was set).
@@ -216,6 +238,7 @@ async function failVerb(ctx) {
     const nextStep = str(ctx.flags.nextStep) || undefined;
     if (nextStep !== undefined && !NEXT_STEP_SHAPE.test(nextStep))
         throw new CommandError(EXIT_NEXT_STEP_REFUSED, "--next-step must be one /bkit-* command line");
+    scrubFailureFiles(ctx.cwd, str(ctx.flags.errorFile), str(ctx.flags.stderrFile));
     // State only for a run that took the lock: without the token the failure came
     // before Step 1 locked, and nothing here is this run's to change.
     const state = token === undefined || fid === undefined
