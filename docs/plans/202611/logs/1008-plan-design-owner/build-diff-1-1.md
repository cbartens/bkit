diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index 8d7f02132..6933508f4 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -31,7 +31,6 @@ import {
   commentDiagnostic,
   commentFileOf,
   commentRunProof,
-  endedRunActionKey,
   fetchIssue,
   moveOnBoard,
   postForVerb,
@@ -1344,10 +1343,7 @@ export const issuesCommand: CommandSpec = {
           str(ctx.flags.attempt),
         ];
         const workflow = str(ctx.flags.workflow);
-        const key =
-          purpose === "terminal" && workflow !== undefined
-            ? endedRunActionKey(file, workflow, ...keyParts)
-            : runActionKey(file, workflow, ...keyParts);
+        const key = runActionKey(file, workflow, ...keyParts);
         const tracker = await postForVerb(ctx, comment, {
           fid: str(ctx.flags.fid),
           issue: str(ctx.flags.issue),
diff --git a/.bkit/core/engine/commands/workflow/repo.test.ts b/.bkit/core/engine/commands/workflow/repo.test.ts
index 8f107ac8a..ea5e7c0bf 100644
--- a/.bkit/core/engine/commands/workflow/repo.test.ts
+++ b/.bkit/core/engine/commands/workflow/repo.test.ts
@@ -235,6 +235,18 @@ describe("bkit repo info — the per-run session folder", () => {
     expect(a.json.sessionDir).not.toBe(b.json.sessionDir);
   });
 
+  it("writes a random progress id into each new session folder", async () => {
+    const a = await run([]);
+    const b = await run([]);
+    const ids = [a, b].map((r) => {
+      const file = path.join(r.json.sessionDir, "progress-id");
+      expect(fs.statSync(file).mode & 0o777).toBe(0o600);
+      return fs.readFileSync(file, "utf8").trim();
+    });
+    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{16,}$/);
+    expect(ids[0]).not.toBe(ids[1]);
+  });
+
   it("prunes session folders older than 7 days and keeps newer ones and foreign names", async () => {
     const sessions = path.join(cwd, ".git", "bkit-outbox", "sessions");
     const old = path.join(sessions, "20200101T000000Z-deadbeef");
diff --git a/.bkit/core/engine/commands/workflow/repo.ts b/.bkit/core/engine/commands/workflow/repo.ts
index fbe948f83..5002b32ce 100644
--- a/.bkit/core/engine/commands/workflow/repo.ts
+++ b/.bkit/core/engine/commands/workflow/repo.ts
@@ -126,6 +126,7 @@ export function newSessionDir(outboxRoot: string, now: Date = new Date()): strin
     .replace(/\.\d{3}/, "");
   const dir = path.join(sessions, `${stamp}-${randomBytes(4).toString("hex")}`);
   fs.mkdirSync(dir);
+  fs.writeFileSync(path.join(dir, "progress-id"), randomBytes(16).toString("hex"), { mode: 0o600 });
   return dir;
 }
 
@@ -161,7 +162,7 @@ export const repoCommand: CommandSpec = {
         bkit: "the bkit binary the workflow blocks call: <repoRoot>/node_modules/.bin/bkit, else `bkit` on PATH",
         outboxRoot: "<git common dir>/bkit-outbox: per-run scratch files, never committed",
         sessionDir:
-          "<outboxRoot>/sessions/<utc-time>-<random>/: a new, empty folder per invocation for prompt.md and issue files; pass it explicitly as --session-dir for workflow progress ownership; folders older than 7 days are pruned",
+          "<outboxRoot>/sessions/<utc-time>-<random>/: a new folder per invocation, holding its progress-id file, for prompt.md and issue files; pass it explicitly as --session-dir for workflow progress ownership; folders older than 7 days are pruned",
         bkitVersion:
           ".bkit/version pinnedVersion: the release this repo's bkit files came from (null when unpinned)",
         bkitLatest:
diff --git a/.bkit/core/engine/commands/workflow/tracker.integration.test.ts b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
index 84ad01027..ce29040fa 100644
--- a/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
@@ -785,4 +785,136 @@ describe("workflow comment lifecycle across real CLI processes", () => {
     expect(remote().comments).toHaveLength(1);
     expect(lastBody()).toContain("From worktree");
   });
+
+  it("keeps one progress comment when the status file moves to the main checkout", () => {
+    const dir = session();
+    const linked = path.join(root, "moved-worktree");
+    git(cwd, "worktree", "add", "-q", "-b", "feat/moved", linked);
+    start(linked, dir);
+    report(linked, "Worktree Setup", { file: REL, number: 2 });
+    write(path.join(cwd, REL), fs.readFileSync(path.join(linked, REL), "utf8"));
+    report(cwd, "Plan Execute", { file: REL, number: 7 });
+    expect(remote().comments).toHaveLength(1);
+    expect(remote().comments[0]?.body).toContain("Worktree Setup");
+    expect(remote().comments[0]?.body).toContain("Plan Execute");
+    expect(rows(cwd).at(-1)?.type).toBe("workflow-started");
+  });
+
+  it("keeps one progress comment across checkouts for a run started with no session", () => {
+    const linked = path.join(root, "nosession-worktree");
+    git(cwd, "worktree", "add", "-q", "-b", "feat/nosession", linked);
+    ok(cwd, ["workflows", "start", "--workflow=build", `--fid=${FID}`, `--month=${MONTH}`]);
+    report(cwd, "Worktree Setup", { file: REL, number: 2 });
+    write(path.join(linked, REL), fs.readFileSync(path.join(cwd, REL), "utf8"));
+    report(linked, "Plan Execute", { file: REL, number: 7 });
+    expect(remote().comments).toHaveLength(1);
+    expect(remote().comments[0]?.body).toContain("Worktree Setup");
+    expect(remote().comments[0]?.body).toContain("Plan Execute");
+  });
+
+  function closePlan(at: string, dir: string, post: boolean) {
+    return ok(at, [
+      "workflows",
+      "close",
+      "--workflow=plan",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      "--ending=held",
+      "--publish=false",
+      ...(post ? ["--post", "--number=9", "--title=Completion", "--owner-repo=o/r"] : []),
+      `--session-dir=${dir}`,
+    ]);
+  }
+
+  function answers(at: string, text: string) {
+    const bodyFile = path.join(root, "plan-answers.md");
+    fs.writeFileSync(bodyFile, text);
+    return cli(at, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--workflow=plan",
+      "--step-number=8",
+      "--step-title=Owner Answers",
+      `--body-file=${bodyFile}`,
+      `--file=${REL}`,
+    ]);
+  }
+
+  const isWrite = (c: { method: string }) => ["POST", "PATCH"].includes(c.method);
+
+  function answerActions() {
+    return rows(cwd).filter((r) => r.type === "engine-action" && String(r.key).includes("/8/"));
+  }
+
+  function noAssociationNoise(result: { stderr: string }) {
+    expect(result.stderr).not.toContain("invocation association unavailable");
+    const friction = path.join(cwd, ".bkit/friction.jsonl");
+    const text = fs.existsSync(friction) ? fs.readFileSync(friction, "utf8") : "";
+    expect(text).not.toContain("comment-association");
+  }
+
+  it("joins the run's progress comment with the Owner Answers after workflows close", () => {
+    const dir = session();
+    report(cwd, "Start Workflow", { workflow: "plan", sessionDir: dir, number: 1 });
+    start(cwd, dir, "plan");
+    report(cwd, "Plan Draft", { workflow: "plan", file: REL, number: 4 });
+    closePlan(cwd, dir, false);
+    expect(fs.existsSync(dir)).toBe(false);
+    const result = answers(cwd, "Q1: A, as proposed.\n");
+    expect(result.code, result.stderr).toBe(0);
+    noAssociationNoise(result);
+    expect(remote().comments).toHaveLength(1);
+    expect(remote().comments[0]?.body).toContain("Plan Draft");
+    expect(remote().comments[0]?.body).toContain("Owner Answers");
+  });
+
+  it("keeps two Owner Answers rounds in one comment after a terminal close comment", () => {
+    const dir = session();
+    report(cwd, "Start Workflow", { workflow: "plan", sessionDir: dir, number: 1 });
+    start(cwd, dir, "plan");
+    closePlan(cwd, dir, true);
+    const before = remote().comments.length;
+    const first = answers(cwd, "Round one answers.\n");
+    expect(first.code, first.stderr).toBe(0);
+    noAssociationNoise(first);
+    const second = answers(cwd, "Round two answers.\n");
+    expect(second.code, second.stderr).toBe(0);
+    noAssociationNoise(second);
+    expect(remote().comments).toHaveLength(before + 1);
+    expect(lastBody()).toContain("Round one answers.");
+    expect(lastBody()).toContain("Round two answers.");
+    const actions = answerActions();
+    expect(actions).toHaveLength(2);
+    expect(actions[0]?.key).toBe(actions[1]?.key);
+    expect(actions[0]?.hash).not.toBe(actions[1]?.hash);
+    const calls = remote().calls.length;
+    const again = answers(cwd, "Round two answers.\n");
+    expect(again.code, again.stderr).toBe(0);
+    expect(again.out.tracker).toMatchObject({ done: true, deduped: true });
+    expect(remote().comments).toHaveLength(before + 1);
+    expect(answerActions()).toHaveLength(2);
+    expect(remote().calls.slice(calls).filter(isWrite)).toHaveLength(0);
+  });
+
+  it("a --file post whose status file holds no run of the workflow exits 2", () => {
+    const dir = session();
+    start(cwd, dir, "build");
+    const before = remote().calls.length;
+    const result = cli(cwd, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--workflow=plan",
+      "--step-number=8",
+      "--step-title=Owner Answers",
+      `--file=${REL}`,
+    ]);
+    expect(result.code).toBe(2);
+    expect(result.stderr).toContain("workflow steps only");
+    expect(remote().comments).toHaveLength(0);
+    expect(remote().calls).toHaveLength(before);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/tracker.test.ts b/.bkit/core/engine/commands/workflow/tracker.test.ts
index 0be147db8..520118f17 100644
--- a/.bkit/core/engine/commands/workflow/tracker.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.test.ts
@@ -26,6 +26,8 @@ import {
   readBlockers,
   readLabels,
   runActionKey,
+  sessionPublication,
+  sessionsRoot,
   splitAt,
   trackerTarget,
   writeLabels,
@@ -854,6 +856,50 @@ function jiraMcp(...results: Array<unknown>) {
 // target
 // ---------------------------------------------------------------------------
 
+describe("sessionPublication: the link comes from the folder's progress id", () => {
+  const sessionIn = (cwd: string, name: string, id?: string) => {
+    const dir = path.join(sessionsRoot(cwd) as string, name);
+    fs.mkdirSync(dir, { recursive: true });
+    if (id !== undefined) fs.writeFileSync(path.join(dir, "progress-id"), id);
+    return dir;
+  };
+
+  it("gives two session folders holding the same progress id the same link", () => {
+    const cwd = github();
+    const a = sessionIn(cwd, "20260101T000000Z-aaaaaaaa", "deadbeefcafe");
+    const b = sessionIn(cwd, "20260101T000001Z-bbbbbbbb", "deadbeefcafe");
+    const other = sessionIn(cwd, "20260101T000002Z-cccccccc", "0123456789ab");
+    const one = sessionPublication(cwd, a, "plan");
+    expect(one?.invocation).toBeTruthy();
+    expect(sessionPublication(cwd, b, "plan")?.invocation).toBe(one?.invocation);
+    expect(sessionPublication(cwd, other, "plan")?.invocation).not.toBe(one?.invocation);
+  });
+
+  it("throws for a session folder whose progress id is missing or empty", () => {
+    const cwd = github();
+    const missing = sessionIn(cwd, "20260101T000000Z-aaaaaaaa");
+    const empty = sessionIn(cwd, "20260101T000001Z-bbbbbbbb", "");
+    expect(() => sessionPublication(cwd, missing, "plan")).toThrow();
+    expect(() => sessionPublication(cwd, empty, "plan")).toThrow();
+  });
+});
+
+describe("runActionKey after the run ended", () => {
+  it("runActionKey names the latest run after it ended", () => {
+    const cwd = github();
+    const file = path.join(cwd, "docs/plans/202611/logs/12-x/status.jsonl");
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    const rows = [
+      { type: "workflow-started", workflow: "plan", at: "2026-11-01T01:00:00Z" },
+      { type: "workflow-done", workflow: "plan", at: "2026-11-01T01:05:00Z" },
+    ];
+    fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
+    const key = runActionKey(file, "plan", "owner-answers");
+    expect(key).toContain("plan/1/");
+    expect(key).not.toContain("plan/2/");
+  });
+});
+
 describe("trackerTarget", () => {
   it("github: the issue from the FID, owner/repo from origin", () => {
     const t = trackerTarget(github(), { fid: "12-thing" });
diff --git a/.bkit/core/engine/commands/workflow/tracker.ts b/.bkit/core/engine/commands/workflow/tracker.ts
index fb0269300..351de656b 100644
--- a/.bkit/core/engine/commands/workflow/tracker.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.ts
@@ -13,14 +13,7 @@ import * as path from "node:path";
 
 import type { IssueTracker } from "../../install/manifest.js";
 import { appendFrictionRow, frictionRow } from "../../ledgers/journal.js";
-import {
-  actionHash,
-  actionKey,
-  alreadyDone,
-  recordAction,
-  runNumber,
-  type WorkflowRun,
-} from "../../ledgers/status.js";
+import { actionHash, actionKey, alreadyDone, recordAction } from "../../ledgers/status.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { readBkitConfig, type BkitConfig } from "../../shared/settings.js";
 import { git, parseJson, runGh, type FlagSpec, type GhResult, type RunContext } from "../lib.js";
@@ -1452,14 +1445,10 @@ function progressBinding(t: TrackerTarget, o: OnceOptions): ProgressBinding | "c
   const issue = issueIdOf(fid, t.tracker);
   if (issue !== null && issue !== t.issue) return "conflict";
   if (issue === null) return null;
-  let invocation = actionHash([path.resolve(o.file), workflow, runText, run.startedAt].join("\0"));
-  const association = runPublicationFile(common, o.file, workflow, run.startedAt);
-  if (fs.existsSync(association)) {
-    const parsed = parseJson(fs.readFileSync(association, "utf-8"));
-    const saved = asRecord(parsed.ok ? parsed.value : null);
-    if (saved.version === 1 && saved.workflow === workflow && typeof saved.invocation === "string")
-      invocation = saved.invocation;
-  }
+  const invocation =
+    typeof run.progress === "string" && run.progress !== ""
+      ? run.progress
+      : actionHash([workflow, runText, run.startedAt, fid].join("\0"));
   const at = run.steps.find(
     (row) =>
       row.step === step &&
@@ -2012,7 +2001,7 @@ export function commentRunProof(ctx: RunContext): "session" | "status" | "audit"
       const abs = path.resolve(ctx.cwd, file);
       if (
         fs.statSync(abs).isFile() &&
-        endedRunActionKey(abs, str(ctx.flags.workflow) || undefined, "proof") !== undefined
+        runActionKey(abs, str(ctx.flags.workflow) || undefined, "proof") !== undefined
       )
         return "status";
     }
@@ -2045,83 +2034,33 @@ export function sessionPublication(
   const dir = fs.realpathSync(path.resolve(cwd, session));
   if (path.dirname(dir) !== fs.realpathSync(sessions) || !fs.statSync(dir).isDirectory())
     throw new Error("session association directory unavailable");
-  return { invocation: actionHash(`${dir}\0${workflow}`), workflow };
-}
-
-function runPublicationFile(common: string, file: string, workflow: string, at: string): string {
-  return path.join(
-    common,
-    "bkit-outbox",
-    "invocations",
-    `${actionHash([path.resolve(file), workflow, at].join("\0"))}.json`,
-  );
-}
-
-/** Bind only the exact run opened by workflows start; loss of this cache is harmless. */
-export function bindRunPublication(
-  ctx: RunContext,
-  file: string,
-  workflow: string,
-  run: number,
-): void {
-  try {
-    const publication = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), workflow);
-    const current = readRunsLenient(file).filter((r) => r.workflow === workflow)[run - 1];
-    const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
-    if (!publication || !current || !common) return;
-    const destination = runPublicationFile(common, file, workflow, current.startedAt);
-    if (fs.existsSync(destination)) return;
-    fs.mkdirSync(path.dirname(destination), { recursive: true });
-    fs.writeFileSync(destination, JSON.stringify({ version: 1, ...publication }), {
-      mode: 0o600,
-      flag: "wx",
-    });
-  } catch {
-    commentDiagnostic(
-      { cwd: ctx.cwd, workflow, log: (line) => ctx.log(line) },
-      "[bkit-tracker] invocation association unavailable; progress may start fresh",
-      [],
-    );
-  }
+  const id = fs.readFileSync(path.join(dir, "progress-id"), "utf-8").trim();
+  if (!id) throw new Error("session association id unavailable");
+  return { invocation: actionHash(`${id}\0${workflow}`), workflow };
 }
 
 /**
- * The engine-action key of a comment in `file`'s current run of `workflow` (the
- * latest run's workflow when omitted); undefined with no status.jsonl or no run.
+ * The engine-action key of a comment in `file`'s latest run of `workflow` (the
+ * latest run's workflow when omitted), active or ended; undefined with no status.jsonl or no run.
  */
 export function runActionKey(
   file: string | undefined,
   workflow: string | undefined,
   ...parts: Array<string | number | undefined | null>
 ): string | undefined {
-  return commentKey(file, workflow, runNumber, parts);
-}
-
-/**
- * The same key for the latest run of `workflow` once it has ended (a failure
- * comment written after the workflow-failed row): that run's number, not the next.
- */
-export function endedRunActionKey(
-  file: string | undefined,
-  workflow: string | undefined,
-  ...parts: Array<string | number | undefined | null>
-): string | undefined {
-  const latest = (runs: WorkflowRun[], name: string) =>
-    runs.filter((r) => r.workflow === name).length;
-  return commentKey(file, workflow, latest, parts);
+  return commentKey(file, workflow, parts);
 }
 
 function commentKey(
   file: string | undefined,
   workflow: string | undefined,
-  numberOf: (runs: WorkflowRun[], name: string) => number,
   parts: Array<string | number | undefined | null>,
 ): string | undefined {
   if (file === undefined || !fs.existsSync(file)) return undefined;
   const runs = readRunsLenient(file);
   const name = workflow ?? runs.at(-1)?.workflow;
   if (name === undefined) return undefined;
-  const n = numberOf(runs, name);
+  const n = runs.filter((r) => r.workflow === name).length;
   return n === 0 ? undefined : actionKey(name, n, ...parts, "comment");
 }
 
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 1dd2f4e19..8a47448f2 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -14,6 +14,7 @@ import { tipsText } from "../tips";
 import { newRecord, writeRecord } from "./ledgers";
 import { EXIT_LOCK_BUSY, locksCommand } from "./locks";
 import { chatFingerprint } from "./run-facts";
+import { sessionPublication } from "./tracker";
 import { workflowsCommand } from "./workflows";
 
 useGateRunner();
@@ -3909,3 +3910,51 @@ describe("bkit workflows summary", () => {
     expect((await summarize(cwd, "release")).code).toBe(2);
   });
 });
+
+describe("bkit workflows start — the run's progress link", () => {
+  const sessionWith = (cwd: string, name: string, id?: string) => {
+    const common = git(cwd, "rev-parse", "--path-format=absolute", "--git-common-dir");
+    const dir = path.join(common, "bkit-outbox", "sessions", name);
+    fs.mkdirSync(dir, { recursive: true });
+    if (id !== undefined) fs.writeFileSync(path.join(dir, "progress-id"), id);
+    return dir;
+  };
+
+  it("start with --session-dir writes the session's link as progress on the workflow-started row", async () => {
+    const cwd = repo();
+    const dir = sessionWith(cwd, "20261024T010203Z-0a1b2c3d", "feedfacecafe0001");
+    const r = await run(cwd, wf("start", "plan", `--session-dir=${dir}`));
+    expect(r.code, r.err).toBe(0);
+    const started = rows(statusOf(cwd)).filter((row) => row.type === "workflow-started");
+    expect(started).toHaveLength(1);
+    expect(started[0]?.progress).toBe(sessionPublication(cwd, dir, "plan")?.invocation);
+    expect(started[0]?.progress).toEqual(expect.any(String));
+  });
+
+  it("a resumed start with another session keeps the run's first link", async () => {
+    const cwd = repo();
+    const first = sessionWith(cwd, "20261024T010203Z-0a1b2c3d", "feedfacecafe0001");
+    const second = sessionWith(cwd, "20261024T010204Z-0a1b2c3e", "feedfacecafe0002");
+    await run(cwd, wf("start", "plan", `--session-dir=${first}`));
+    const r = await run(cwd, wf("start", "plan", `--session-dir=${second}`));
+    expect(r.code, r.err).toBe(0);
+    expect(r.json).toMatchObject({ resumed: true });
+    const started = rows(statusOf(cwd)).filter((row) => row.type === "workflow-started");
+    expect(started).toHaveLength(1);
+    expect(started[0]?.progress).toBe(sessionPublication(cwd, first, "plan")?.invocation);
+    expect(started[0]?.progress).not.toBe(sessionPublication(cwd, second, "plan")?.invocation);
+  });
+
+  it("start with a session folder that holds no progress id writes the row without progress and records association friction", async () => {
+    const cwd = repo();
+    const dir = sessionWith(cwd, "20261024T010203Z-0a1b2c3d");
+    const r = await run(cwd, wf("start", "plan", `--session-dir=${dir}`));
+    expect(r.code, r.err).toBe(0);
+    const started = rows(statusOf(cwd)).filter((row) => row.type === "workflow-started");
+    expect(started).toHaveLength(1);
+    expect(started[0]).not.toHaveProperty("progress");
+    expect(r.err).toContain("invocation association unavailable");
+    const friction = fs.readFileSync(path.join(cwd, ".bkit/friction.jsonl"), "utf-8");
+    expect(friction).toContain("comment-association");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index b9030a65c..bc05d3e64 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -148,10 +148,11 @@ import {
   attempt,
   commentFileOf,
   postForVerb,
-  bindRunPublication,
+  commentDiagnostic,
+  sessionPublication,
   issueRef,
   readLabels,
-  endedRunActionKey,
+  runActionKey,
   skipOf,
   trackerTarget,
   writeLabels,
@@ -417,7 +418,7 @@ async function failVerb(ctx: RunContext): Promise<number> {
   if (ctx.flags.post === true && comment === null)
     throw new CommandError(EXIT.USAGE, "--post needs --step-number");
   // Once per run and step: an engine-action row where the run's status.jsonl exists.
-  const key = endedRunActionKey(
+  const key = runActionKey(
     state.status,
     workflow,
     "failure",
@@ -2206,11 +2207,22 @@ export const workflowsCommand: CommandSpec = {
           const limits = Object.fromEntries(
             ASK_POINTS.filter((p) => p.startsWith(`${workflow}.`)).map((p) => [p, asks[p]]),
           );
+          let progress: string | undefined;
+          try {
+            progress = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), workflow)?.invocation;
+          } catch {
+            commentDiagnostic(
+              { cwd: ctx.cwd, workflow, log: (line) => ctx.log(line) },
+              "[bkit-tracker] invocation association unavailable; progress may start fresh",
+              [],
+            );
+          }
           row = {
             type: "workflow-started",
             workflow,
             at: statusTimestamp(),
             parentSha: headSha(path.dirname(file)),
+            ...(progress === undefined ? {} : { progress }),
             ...(Object.keys(limits).length === 0 ? {} : { limits }),
           };
           fs.appendFileSync(file, appendLine(row as StatusEvent));
@@ -2218,7 +2230,6 @@ export const workflowsCommand: CommandSpec = {
         recordChat(file, workflow, process.env);
         const runs = fold(readStatusEvents(file));
         const run = runNumber(runs, workflow);
-        bindRunPublication(ctx, file, workflow, run);
         const current = resumed ? lastRun(runs, workflow) : undefined;
         ctx.emit({
           lock,
diff --git a/.bkit/core/engine/ledgers/status.test.ts b/.bkit/core/engine/ledgers/status.test.ts
index f5c537869..2c4710e9c 100644
--- a/.bkit/core/engine/ledgers/status.test.ts
+++ b/.bkit/core/engine/ledgers/status.test.ts
@@ -190,6 +190,22 @@ describe("fold — event log → run array", () => {
     expect((runs[0].steps[0] as Record<string, unknown>).workflow).toBeUndefined();
   });
 
+  it("carries the workflow-started progress link onto its run", () => {
+    const withLink = fold([
+      {
+        type: "workflow-started",
+        workflow: "plan",
+        at: "2026-05-01T00:00:00Z",
+        progress: "abc123",
+      },
+    ] as StatusEvent[]);
+    expect((withLink[0] as Record<string, unknown>).progress).toBe("abc123");
+    const without = fold([
+      { type: "workflow-started", workflow: "plan", at: "2026-05-01T00:00:00Z" },
+    ]);
+    expect("progress" in without[0]).toBe(false);
+  });
+
   it("preserves multiple phase runs in one log (design → plan → build)", () => {
     const events: StatusEvent[] = [
       { type: "workflow-started", workflow: "design", at: "2026-05-01T00:00:00Z" },
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 8e9431c64..692ef611f 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -381,7 +381,7 @@ export type WorkflowRun = {
 // One appended line of `status.jsonl`. `step-done` carries the full `Step` shape
 // plus the routing `type`/`workflow`; the rest are workflow-level transitions.
 export type StatusEvent =
-  | { type: "workflow-started"; workflow: string; at: string }
+  | { type: "workflow-started"; workflow: string; at: string; progress?: string }
   | ({ type: "step-done"; workflow: string } & Step)
   | ({ type: "workflow-meta"; workflow: string; at: string } & Record<string, unknown>)
   // `parentSha`: HEAD at close, the run's join key (`run.parentSha` on its ledger rows).
@@ -437,7 +437,13 @@ export function fold(events: StatusEvent[]): WorkflowRun[] {
   const runs: WorkflowRun[] = [];
   for (const e of ordered) {
     if (e.type === "workflow-started") {
-      runs.push({ workflow: e.workflow, startedAt: e.at, status: "IN_PROGRESS", steps: [] });
+      runs.push({
+        workflow: e.workflow,
+        startedAt: e.at,
+        status: "IN_PROGRESS",
+        steps: [],
+        ...(typeof e.progress === "string" ? { progress: e.progress } : {}),
+      });
     } else if (e.type === "step-done") {
       const i = lastIndexOfWorkflow(runs, e.workflow);
       if (i < 0) {
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 19be5a510..a5b4fcf1d 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -299,3 +299,4 @@
 {"schema":3,"ts":1794967427068,"kind":"friction","key":"1028-resume-rebase-stopped-on-local-changes","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-branch-sync"},"references":["#1028","5d908d631"],"category":"repeated-tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"a resumed build's rebase stopped on 'local changes would be overwritten' in package-json.test.ts and branches rebase aborted with exit 3","description":"On the first resume of 1028-gate-fails-workflow run 3, `bkit branches rebase` stopped because git said local changes to package-json.test.ts would be overwritten, then aborted with exit 3. The cause was not established. After the run's own files were committed and Steps 1-2 re-ran, the rebase onto 5d908d631 went through cleanly.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794973968097,"kind":"friction","key":"review-agent-turn-limit/plan-review-2","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"plan","step":"plan-review"},"references":["1008-plan-design-owner","#1008"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"@bkit-plan-review-2 stopped at its 100-turn limit with no result file, so the orchestrator resumed it to finish","description":"@bkit-plan-review-2 used all 100 turns reading code for the 1008 plan and stopped before writing its result JSON; its review file was partly written. The orchestrator sent it one message to finish from what it had found, and it wrote the result file on the resumed turn.","remediation":"Raise the review agent's turn cap or have it write its result file before its last turns, as was done for the utility agents.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794977744207,"kind":"friction","key":"plan-tasks-gate-wait/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1039-ledger-query-status","#1039"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code agent handed back PASS but left its own changed-files gate running for 30 minutes under load, so it was stopped","description":"@bkit-build-plan-tasks (group 1) logged DONE for all 3 tasks and Verdict: PASS, then stayed alive waiting on a second `bkit:gate:changed` run that was still going 30 minutes after it started, with the load average at 23-34 from parallel builds. The orchestrator stopped the agent, which ended its gate processes, and finished the step from the PASS log. Same pattern as build 1030 group 3.","remediation":"Have the code agent's changed-files gate respect the machine load, or drop the agent-side gate when the workflow's own group and holistic gates re-run the same checks.","source":"orchestrator","status":"OPEN"}
+{"schema":3,"ts":1794997586929,"kind":"friction","key":"plan-tasks-no-log-at-timer/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1008-plan-design-owner","#1008"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code agent wrote no log file in 20 minutes, so the orchestrator stopped it and ran the step again","description":"@bkit-build-plan-tasks (group 1, four tasks) had edited five engine files and rebuilt dist/ but had not created its build-plan-tasks-1-log.md after 20 minutes, so the orchestrator's 20-minute timer stopped it per the run rules and launched a fresh agent on the same brief, which found the edits in the tree.","remediation":"Have the code agent write its log with a PENDING header and one line per task as it finishes each, so a timer can tell slow progress from a stall.","source":"orchestrator","status":"OPEN"}
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index 5f31d95fb..9585a1854 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -12,7 +12,7 @@ import { CommandError, EXIT, parseJson, repoRoot, } from "../lib.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { str } from "./status.js";
 import { isCloudOrCi } from "../../checks/before/env.js";
-import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, POST_FLAG, TRACKER_OUTPUT, attempt, classifyFailure, commentDiagnostic, commentFileOf, commentRunProof, endedRunActionKey, fetchIssue, moveOnBoard, postForVerb, readBlockers, readLabels, redact, runActionKey, skipOf, stampMarker, trackerTarget, writeLabels, } from "./tracker.js";
+import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, POST_FLAG, TRACKER_OUTPUT, attempt, classifyFailure, commentDiagnostic, commentFileOf, commentRunProof, fetchIssue, moveOnBoard, postForVerb, readBlockers, readLabels, redact, runActionKey, skipOf, stampMarker, trackerTarget, writeLabels, } from "./tracker.js";
 /** Exit code: an input file is missing or not in the expected shape. */
 export const EXIT_BAD_INPUT = 3;
 function readInput(cwd, file, flag) {
@@ -1114,9 +1114,7 @@ export const issuesCommand = {
                     str(ctx.flags.attempt),
                 ];
                 const workflow = str(ctx.flags.workflow);
-                const key = purpose === "terminal" && workflow !== undefined
-                    ? endedRunActionKey(file, workflow, ...keyParts)
-                    : runActionKey(file, workflow, ...keyParts);
+                const key = runActionKey(file, workflow, ...keyParts);
                 const tracker = await postForVerb(ctx, comment, {
                     fid: str(ctx.flags.fid),
                     issue: str(ctx.flags.issue),
diff --git a/dist/commands/workflow/repo.js b/dist/commands/workflow/repo.js
index d46029e2e..57197f095 100644
--- a/dist/commands/workflow/repo.js
+++ b/dist/commands/workflow/repo.js
@@ -111,6 +111,7 @@ export function newSessionDir(outboxRoot, now = new Date()) {
         .replace(/\.\d{3}/, "");
     const dir = path.join(sessions, `${stamp}-${randomBytes(4).toString("hex")}`);
     fs.mkdirSync(dir);
+    fs.writeFileSync(path.join(dir, "progress-id"), randomBytes(16).toString("hex"), { mode: 0o600 });
     return dir;
 }
 export const repoCommand = {
@@ -143,7 +144,7 @@ export const repoCommand = {
                 repoRoot: "the main checkout (the same from any worktree)",
                 bkit: "the bkit binary the workflow blocks call: <repoRoot>/node_modules/.bin/bkit, else `bkit` on PATH",
                 outboxRoot: "<git common dir>/bkit-outbox: per-run scratch files, never committed",
-                sessionDir: "<outboxRoot>/sessions/<utc-time>-<random>/: a new, empty folder per invocation for prompt.md and issue files; pass it explicitly as --session-dir for workflow progress ownership; folders older than 7 days are pruned",
+                sessionDir: "<outboxRoot>/sessions/<utc-time>-<random>/: a new folder per invocation, holding its progress-id file, for prompt.md and issue files; pass it explicitly as --session-dir for workflow progress ownership; folders older than 7 days are pruned",
                 bkitVersion: ".bkit/version pinnedVersion: the release this repo's bkit files came from (null when unpinned)",
                 bkitLatest: "newest published @cbartens/bkit, asked at most once a day (null when offline, opted out via BKIT_NO_UPDATE_CHECK, or unpinned)",
                 bkitOutdated: "true when bkitVersion is older than bkitLatest (null when either is unknown)",
diff --git a/dist/commands/workflow/tracker.js b/dist/commands/workflow/tracker.js
index a188a10ce..f90172c01 100644
--- a/dist/commands/workflow/tracker.js
+++ b/dist/commands/workflow/tracker.js
@@ -10,7 +10,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { appendFrictionRow, frictionRow } from "../../ledgers/journal.js";
-import { actionHash, actionKey, alreadyDone, recordAction, runNumber, } from "../../ledgers/status.js";
+import { actionHash, actionKey, alreadyDone, recordAction } from "../../ledgers/status.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { git, parseJson, runGh } from "../lib.js";
@@ -1173,14 +1173,9 @@ function progressBinding(t, o) {
         return "conflict";
     if (issue === null)
         return null;
-    let invocation = actionHash([path.resolve(o.file), workflow, runText, run.startedAt].join("\0"));
-    const association = runPublicationFile(common, o.file, workflow, run.startedAt);
-    if (fs.existsSync(association)) {
-        const parsed = parseJson(fs.readFileSync(association, "utf-8"));
-        const saved = asRecord(parsed.ok ? parsed.value : null);
-        if (saved.version === 1 && saved.workflow === workflow && typeof saved.invocation === "string")
-            invocation = saved.invocation;
-    }
+    const invocation = typeof run.progress === "string" && run.progress !== ""
+        ? run.progress
+        : actionHash([workflow, runText, run.startedAt, fid].join("\0"));
     const at = run.steps.find((row) => row.step === step &&
         (group === "-" || row.group === Number(group)) &&
         (attempt === "-" || row.attempt === Number(attempt)))?.at;
@@ -1674,7 +1669,7 @@ export function commentRunProof(ctx) {
         if (file !== undefined) {
             const abs = path.resolve(ctx.cwd, file);
             if (fs.statSync(abs).isFile() &&
-                endedRunActionKey(abs, str(ctx.flags.workflow) || undefined, "proof") !== undefined)
+                runActionKey(abs, str(ctx.flags.workflow) || undefined, "proof") !== undefined)
                 return "status";
         }
         const slug = str(ctx.flags.auditSlug);
@@ -1702,55 +1697,26 @@ export function sessionPublication(cwd, session, workflow) {
     const dir = fs.realpathSync(path.resolve(cwd, session));
     if (path.dirname(dir) !== fs.realpathSync(sessions) || !fs.statSync(dir).isDirectory())
         throw new Error("session association directory unavailable");
-    return { invocation: actionHash(`${dir}\0${workflow}`), workflow };
-}
-function runPublicationFile(common, file, workflow, at) {
-    return path.join(common, "bkit-outbox", "invocations", `${actionHash([path.resolve(file), workflow, at].join("\0"))}.json`);
-}
-/** Bind only the exact run opened by workflows start; loss of this cache is harmless. */
-export function bindRunPublication(ctx, file, workflow, run) {
-    try {
-        const publication = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), workflow);
-        const current = readRunsLenient(file).filter((r) => r.workflow === workflow)[run - 1];
-        const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
-        if (!publication || !current || !common)
-            return;
-        const destination = runPublicationFile(common, file, workflow, current.startedAt);
-        if (fs.existsSync(destination))
-            return;
-        fs.mkdirSync(path.dirname(destination), { recursive: true });
-        fs.writeFileSync(destination, JSON.stringify({ version: 1, ...publication }), {
-            mode: 0o600,
-            flag: "wx",
-        });
-    }
-    catch {
-        commentDiagnostic({ cwd: ctx.cwd, workflow, log: (line) => ctx.log(line) }, "[bkit-tracker] invocation association unavailable; progress may start fresh", []);
-    }
+    const id = fs.readFileSync(path.join(dir, "progress-id"), "utf-8").trim();
+    if (!id)
+        throw new Error("session association id unavailable");
+    return { invocation: actionHash(`${id}\0${workflow}`), workflow };
 }
 /**
- * The engine-action key of a comment in `file`'s current run of `workflow` (the
- * latest run's workflow when omitted); undefined with no status.jsonl or no run.
+ * The engine-action key of a comment in `file`'s latest run of `workflow` (the
+ * latest run's workflow when omitted), active or ended; undefined with no status.jsonl or no run.
  */
 export function runActionKey(file, workflow, ...parts) {
-    return commentKey(file, workflow, runNumber, parts);
-}
-/**
- * The same key for the latest run of `workflow` once it has ended (a failure
- * comment written after the workflow-failed row): that run's number, not the next.
- */
-export function endedRunActionKey(file, workflow, ...parts) {
-    const latest = (runs, name) => runs.filter((r) => r.workflow === name).length;
-    return commentKey(file, workflow, latest, parts);
+    return commentKey(file, workflow, parts);
 }
-function commentKey(file, workflow, numberOf, parts) {
+function commentKey(file, workflow, parts) {
     if (file === undefined || !fs.existsSync(file))
         return undefined;
     const runs = readRunsLenient(file);
     const name = workflow ?? runs.at(-1)?.workflow;
     if (name === undefined)
         return undefined;
-    const n = numberOf(runs, name);
+    const n = runs.filter((r) => r.workflow === name).length;
     return n === 0 ? undefined : actionKey(name, n, ...parts, "comment");
 }
 /**
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index b1da2c701..a8bb70a56 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -43,7 +43,7 @@ import { highestVersion } from "./plan-versions.js";
 import { mergePr, probePr } from "./prs.js";
 import { FEATURE_STATUS } from "./roadmap.js";
 import { EXIT_NO_STATUS, WORKFLOW_FLAG, positiveInt, readRuns, readStatusEvents, readStatusRows, str, } from "./status.js";
-import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, attempt, commentFileOf, postForVerb, bindRunPublication, issueRef, readLabels, endedRunActionKey, skipOf, trackerTarget, writeLabels, } from "./tracker.js";
+import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, attempt, commentFileOf, postForVerb, commentDiagnostic, sessionPublication, issueRef, readLabels, runActionKey, skipOf, trackerTarget, writeLabels, } from "./tracker.js";
 import { tipsText } from "../tips.js";
 import { EXIT_NO_RECORD, requireRecordOnShared, writeStepRow } from "./steps.js";
 import { addAllButCopied, removeWorktree } from "./worktrees.js";
@@ -267,7 +267,7 @@ async function failVerb(ctx) {
     if (ctx.flags.post === true && comment === null)
         throw new CommandError(EXIT.USAGE, "--post needs --step-number");
     // Once per run and step: an engine-action row where the run's status.jsonl exists.
-    const key = endedRunActionKey(state.status, workflow, "failure", stepNumber, str(ctx.flags.subStep) || undefined);
+    const key = runActionKey(state.status, workflow, "failure", stepNumber, str(ctx.flags.subStep) || undefined);
     const tracker = ctx.flags.post === true && comment !== null
         ? await postForVerb(ctx, comment, {
             fid,
@@ -1807,11 +1807,19 @@ export const workflowsCommand = {
                     // The run's limits, frozen here: `counters route` reads them for the whole run.
                     const asks = readBkitConfig(where.tree).asks;
                     const limits = Object.fromEntries(ASK_POINTS.filter((p) => p.startsWith(`${workflow}.`)).map((p) => [p, asks[p]]));
+                    let progress;
+                    try {
+                        progress = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), workflow)?.invocation;
+                    }
+                    catch {
+                        commentDiagnostic({ cwd: ctx.cwd, workflow, log: (line) => ctx.log(line) }, "[bkit-tracker] invocation association unavailable; progress may start fresh", []);
+                    }
                     row = {
                         type: "workflow-started",
                         workflow,
                         at: statusTimestamp(),
                         parentSha: headSha(path.dirname(file)),
+                        ...(progress === undefined ? {} : { progress }),
                         ...(Object.keys(limits).length === 0 ? {} : { limits }),
                     };
                     fs.appendFileSync(file, appendLine(row));
@@ -1819,7 +1827,6 @@ export const workflowsCommand = {
                 recordChat(file, workflow, process.env);
                 const runs = fold(readStatusEvents(file));
                 const run = runNumber(runs, workflow);
-                bindRunPublication(ctx, file, workflow, run);
                 const current = resumed ? lastRun(runs, workflow) : undefined;
                 ctx.emit({
                     lock,
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index aa1975856..750a7a2be 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -317,7 +317,13 @@ export function fold(events) {
     const runs = [];
     for (const e of ordered) {
         if (e.type === "workflow-started") {
-            runs.push({ workflow: e.workflow, startedAt: e.at, status: "IN_PROGRESS", steps: [] });
+            runs.push({
+                workflow: e.workflow,
+                startedAt: e.at,
+                status: "IN_PROGRESS",
+                steps: [],
+                ...(typeof e.progress === "string" ? { progress: e.progress } : {}),
+            });
         }
         else if (e.type === "step-done") {
             const i = lastIndexOfWorkflow(runs, e.workflow);
