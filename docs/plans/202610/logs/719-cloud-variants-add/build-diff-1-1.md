diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
index 0db9e202c..c741c4d84 100644
--- a/.bkit/core/.bkit/providers.md
+++ b/.bkit/core/.bkit/providers.md
@@ -304,7 +304,7 @@ Per-action gates on all five hosts, subagents included. This section is an overv
 | `guardrails-shell.js` | Claude, Cursor, Codex, Google Antigravity `guardrails` | shell parsing (`shellSegments`, `shellWords`, `commandWords`, `commandLines`: `sh -c` scripts, `$(…)`, backticks, `( … )`), curl / wget host allowlist (`.bkit/allowlist.json` located from `hookDirs(payload)`), shell-as-edit-channel detection (quote-aware redirects) |
 | `guardrails-tiers.js` | Cursor, Codex, Google Antigravity `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
 | `guardrails-read.js` | Cursor, Google Antigravity `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
-| `preflight-linear.sh` | Claude, Cursor `preflight` | Linear key / issue checks, GraphQL query, `bkit:auto` + terminal-state guards |
+| `preflight-tracker.sh` | Claude, Cursor `preflight` | Tracker guard: GitHub (REST) and Linear (GraphQL) key / issue checks, `bkit:auto` + terminal-by-category guards |
 | `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
 | `session-rules-advisory.js` | opencode, Codex, Google Antigravity `rules` | the rules-read advisory sentence plus the once-per-session helper (`rulesReadAdviceOnce`, per-user OS-temp state, 24h GC) |
 
diff --git a/.bkit/core/.claude/hooks/bkit-preflight.sh b/.bkit/core/.claude/hooks/bkit-preflight.sh
index 77261dc4b..f03b81eda 100755
--- a/.bkit/core/.claude/hooks/bkit-preflight.sh
+++ b/.bkit/core/.claude/hooks/bkit-preflight.sh
@@ -15,7 +15,7 @@
 # informational only.
 #
 # bkit generates the managed block at install: the Linear guard and the rules-read
-# advisory are shared with the Cursor hook (bkit's `hooks/preflight-linear.sh` and
+# advisory are shared with the Cursor hook (bkit's `hooks/preflight-tracker.sh` and
 # `hooks/preflight-rules.sh`); the trigger, the brew check and the output shape below
 # are Claude's own.
 
@@ -100,6 +100,6 @@ if [[ "$(uname)" == "Darwin" ]]; then
   fi
 fi
 
-# {{BKIT_PART preflight-linear.sh}}
+# {{BKIT_PART preflight-tracker.sh}}
 
 # <!-- bkit:end -->
diff --git a/.bkit/core/.cursor/hooks/bkit-preflight.sh b/.bkit/core/.cursor/hooks/bkit-preflight.sh
index 3e2208b71..7b6f8d1a8 100755
--- a/.bkit/core/.cursor/hooks/bkit-preflight.sh
+++ b/.bkit/core/.cursor/hooks/bkit-preflight.sh
@@ -13,7 +13,7 @@
 # `additional_context` so the user sees the reason.
 #
 # bkit generates the managed block at install: the Linear guard and the rules-read
-# advisory are shared with the Claude hook (bkit's `hooks/preflight-linear.sh` and
+# advisory are shared with the Claude hook (bkit's `hooks/preflight-tracker.sh` and
 # `hooks/preflight-rules.sh`); the trigger, the runtime marker and the output shape
 # below are Cursor's own.
 
@@ -93,6 +93,6 @@ fi
 # pre-installed via .cursor/Dockerfile, so the laptop-side brew check makes no sense here.
 # (Claude variant: validates required CLIs are on PATH; missing → HARD STOP with brew install hint.)
 
-# {{BKIT_PART preflight-linear.sh}}
+# {{BKIT_PART preflight-tracker.sh}}
 
 # <!-- bkit:end -->
diff --git a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
index 02b27e26d..16d8f8a9b 100644
--- a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
@@ -36,7 +36,7 @@ function runPreflight(
   hook: string,
   env: Record<string, string | undefined>,
   input = "{}",
-  opts: { path?: string } = {},
+  opts: { path?: string; cwd?: string } = {},
 ): { status: number | null; stdout: string; stderr: string } {
   // Strip undefined keys so we don't leak the parent process env back in.
   const cleanEnv: Record<string, string> = {};
@@ -45,7 +45,7 @@ function runPreflight(
   }
   // cwd outside any git repo: Cursor's runtime marker write is skipped.
   const result = spawnSync("bash", [hook], {
-    cwd: GENERATED,
+    cwd: opts.cwd ?? GENERATED,
     env: { PATH: opts.path ?? process.env.PATH ?? "", ...cleanEnv },
     input,
     encoding: "utf-8",
@@ -173,10 +173,10 @@ describe("preflight.sh — the rules-read advisory", () => {
   });
 });
 
-describe("preflight.sh — generated from one Linear guard", () => {
+describe("preflight.sh — generated from one tracker guard", () => {
   it("both generated hooks carry the shared guard verbatim and never call bkit", () => {
     const guard = fs
-      .readFileSync(path.join(HOOK_SOURCES, "hooks", "preflight-linear.sh"), "utf-8")
+      .readFileSync(path.join(HOOK_SOURCES, "hooks", "preflight-tracker.sh"), "utf-8")
       .trimEnd();
     for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {
       const text = fs.readFileSync(hook, "utf-8");
@@ -230,3 +230,128 @@ describe("BAR-186 — SessionStart preflight.sh source-level checks", () => {
     expect(darwinIdx).toBeLessThan(brewBinsIdx);
   });
 });
+
+// ---------------------------------------------------------------------------
+// Tracker-aware guard (preflight-tracker.sh): GitHub REST and Linear by state category.
+// Each case runs in its own fixture repo (package.json with bkit.tracker.default, an
+// origin remote, a feat/{FID} branch) with a `curl` stub first on PATH.
+// ---------------------------------------------------------------------------
+
+const BACKGROUND = '{"is_background_agent": true}';
+
+/** A fixture consumer repo on `feat/12-thing`, its tracker set in package.json. */
+function fixtureRepo(tracker: string): string {
+  const cwd = fs.mkdtempSync(path.join(GENERATED, "repo-"));
+  spawnSync("git", ["init", "-q", "-b", "feat/12-thing"], { cwd });
+  spawnSync("git", ["remote", "add", "origin", "https://github.com/o/r.git"], { cwd });
+  fs.writeFileSync(
+    path.join(cwd, "package.json"),
+    JSON.stringify({ bkit: { tracker: { default: tracker } } }),
+  );
+  return cwd;
+}
+
+/**
+ * A `curl` stub: prints `body` and exits `exit` (or fails with 22 and no output). Its
+ * directory is returned as a PATH that puts the stub before the real curl.
+ */
+function curlStub(body: string, exit = 0): string {
+  const bin = fs.mkdtempSync(path.join(GENERATED, "curl-"));
+  const file = path.join(bin, "curl");
+  fs.writeFileSync(path.join(bin, "reply"), body);
+  fs.writeFileSync(
+    file,
+    `#!/bin/sh\n[ ${exit} -eq 0 ] && cat "${path.join(bin, "reply")}"\nexit ${exit}\n`,
+  );
+  fs.chmodSync(file, 0o755);
+  return `${bin}${path.delimiter}${process.env.PATH ?? ""}`;
+}
+
+const githubIssue = (state: string, labels: string[]) =>
+  JSON.stringify({ state, labels: labels.map((name) => ({ name })) });
+
+/** The one JSON document on stdout, parsed; fails the case when there are more lines. */
+function onlyDocument(stdout: string): string {
+  expect(stdout.trim().split("\n")).toHaveLength(1);
+  return emittedContext(stdout);
+}
+
+describe("preflight-tracker.sh — GitHub tracker", () => {
+  const run = (reply: string, env: Record<string, string | undefined> = {}, curlExit = 0) =>
+    runPreflight(
+      CURSOR_HOOK,
+      { BKIT_GH_TOKEN: "ghp_x", GITHUB_ISSUE_ID: "12", ...env },
+      BACKGROUND,
+      { cwd: fixtureRepo("github"), path: curlStub(reply, curlExit) },
+    );
+
+  it("github issue without bkit:auto stops the Cursor background session", () => {
+    const result = run(githubIssue("open", ["enhancement"]));
+    expect(result.status).toBe(1);
+    const context = onlyDocument(result.stdout);
+    expect(context).toContain("HARD STOP");
+    expect(context).toContain("bkit:auto");
+  });
+
+  it("github closed issue stops the session and an open labelled one passes", () => {
+    const closed = run(githubIssue("closed", ["bkit:auto"]));
+    expect(closed.status).toBe(1);
+    expect(onlyDocument(closed.stdout)).toContain("HARD STOP");
+    const open = run(githubIssue("open", ["bkit:auto"]));
+    expect(open.status).toBe(0);
+    const context = onlyDocument(open.stdout);
+    expect(context).toContain("PASS");
+    expect(context).not.toContain("HARD STOP");
+  });
+
+  it.each([
+    ["curl failure", { BKIT_GH_TOKEN: "ghp_x" }, 22, /github.*(could not|failed)/i],
+    ["BKIT_GH_TOKEN unset", { BKIT_GH_TOKEN: undefined }, 0, /BKIT_GH_TOKEN/],
+  ])(
+    "github read failure stops the session naming the tracker and the reason",
+    (_n, env, curlExit, reason) => {
+      const result = run(githubIssue("open", ["bkit:auto"]), env, curlExit);
+      expect(result.status).toBe(1);
+      const context = onlyDocument(result.stdout);
+      expect(context).toContain("HARD STOP");
+      expect(context).toMatch(reason);
+    },
+  );
+});
+
+describe("preflight-tracker.sh — Linear tracker by state category", () => {
+  it("linear completed state renamed Shipped stops the session", () => {
+    const reply = JSON.stringify({
+      data: {
+        issue: {
+          identifier: "ENG-4",
+          title: "T",
+          state: { name: "Shipped", type: "completed" },
+          labels: { nodes: [{ name: "bkit:auto" }] },
+        },
+      },
+    });
+    const result = runPreflight(
+      CURSOR_HOOK,
+      { BKIT_LINEAR_API_KEY: "k", LINEAR_ISSUE_ID: "ENG-4" },
+      BACKGROUND,
+      { cwd: fixtureRepo("linear"), path: curlStub(reply) },
+    );
+    expect(result.status).toBe(1);
+    const context = onlyDocument(result.stdout);
+    expect(context).toContain("HARD STOP");
+    expect(context).toContain("terminal");
+  });
+});
+
+describe("preflight-tracker.sh — one shared part", () => {
+  it("generated Claude and Cursor hooks carry the one preflight-tracker.sh part", () => {
+    const part = path.join(HOOK_SOURCES, "hooks", "preflight-tracker.sh");
+    expect(fs.existsSync(part)).toBe(true);
+    const guard = fs.readFileSync(part, "utf-8").trimEnd();
+    for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {
+      expect(fs.readFileSync(hook, "utf-8"), hook).toContain(guard);
+    }
+    expect(fs.existsSync(path.join(HOOK_SOURCES, "hooks", "preflight-linear.sh"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/issues.test.ts b/.bkit/core/engine/commands/workflow/issues.test.ts
index 6ec82ccf1..bc7c0757d 100644
--- a/.bkit/core/engine/commands/workflow/issues.test.ts
+++ b/.bkit/core/engine/commands/workflow/issues.test.ts
@@ -955,6 +955,7 @@ describe("bkit issues fetch", () => {
       url: "https://linear.app/x/issue/ENG-4",
       state: "Todo",
       labels: ["bkit:design"],
+      terminal: false,
       files: {
         description: path.join(out, "issue-description.md"),
         comments: path.join(out, "issue-comments.json"),
@@ -971,6 +972,7 @@ describe("bkit issues fetch", () => {
       url: "https://linear.app/x/issue/ENG-4",
       state: "Todo",
       labels: ["bkit:design"],
+      terminal: false,
     });
     // The files feed `issues text` unchanged.
     const text = await run(cwd, [
@@ -982,6 +984,44 @@ describe("bkit issues fetch", () => {
     expect(text.json.text).toBe("The ask.\n<!-- raw html stays -->\n\nfirst\n\nsecond");
   });
 
+  it("fetch prints terminal in its facts and in issue-facts.json", async () => {
+    process.env.BKIT_LINEAR_API_KEY = "k";
+    const cwd = dir({ tracker: { default: "linear" } });
+    vi.stubGlobal(
+      "fetch",
+      vi.fn(
+        async () =>
+          new Response(
+            JSON.stringify({
+              data: {
+                issue: {
+                  identifier: "ENG-4",
+                  title: "Export CSV",
+                  url: "https://linear.app/x/issue/ENG-4",
+                  description: "d",
+                  state: { name: "Shipped", type: "completed" },
+                  labels: { nodes: [{ name: "bkit:auto" }] },
+                  comments: { nodes: [] },
+                },
+              },
+            }),
+          ),
+      ),
+    );
+    const out = path.join(cwd, "session-terminal");
+    const r = await run(cwd, ["issues", "fetch", "--issue=ENG-4", `--session-dir=${out}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.terminal).toBe(true);
+    const facts = JSON.parse(fs.readFileSync(path.join(out, "issue-facts.json"), "utf-8"));
+    expect(facts).toEqual({
+      title: "Export CSV",
+      url: "https://linear.app/x/issue/ENG-4",
+      state: "Shipped",
+      labels: ["bkit:auto"],
+      terminal: true,
+    });
+  });
+
   it("needs --session-dir or --outbox; skips tracker none and an issue-less run", async () => {
     expect(
       (await run(dir({ tracker: { default: "linear" } }), ["issues", "fetch", "--issue=ENG-4"]))
diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index 29a1c0146..2b3a9f0fd 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -733,7 +733,13 @@ async function fetchVerb(ctx: RunContext): Promise<number> {
     comments: path.join(dir, "issue-comments.json"),
     facts: path.join(dir, "issue-facts.json"),
   };
-  const facts = { title: issue.title, url: issue.url, state: issue.state, labels: issue.labels };
+  const facts = {
+    title: issue.title,
+    url: issue.url,
+    state: issue.state,
+    labels: issue.labels,
+    terminal: issue.terminal,
+  };
   fs.mkdirSync(dir, { recursive: true });
   fs.writeFileSync(files.description, issue.body);
   const comments = sortOldestFirst(issue.comments).comments;
@@ -854,12 +860,15 @@ export const issuesCommand: CommandSpec = {
         title: "issue title",
         url: "issue URL",
         state: "tracker state name (GitHub: open | closed)",
-        labels: "label names",
+        labels: "label names (the bkit-cloud.yml router reads bkit:auto here)",
+        terminal:
+          "true when the tracker's state category is finished (GitHub closed, Linear completed / canceled, Jira done), whatever the state is named",
         files:
-          "{description, comments, facts}: raw description, comments oldest first as JSON, {title, url, state, labels} as JSON",
-        skipped: "no-issue | tracker-none: nothing read, nothing written",
+          "{description, comments, facts}: raw description, comments oldest first as JSON, {title, url, state, labels, terminal} as JSON",
+        skipped:
+          "no-issue | tracker-none: nothing read, nothing written (the bkit-cloud.yml router reads this as skipped)",
         reason:
-          "exit 80: network | auth | scope | rate-limit | not-found | http-<n>; read the issue via the tracker MCP",
+          "exit 80 (the bkit-cloud.yml router fails closed on it): network | auth | scope | rate-limit | not-found | http-<n>; read the issue via the tracker MCP",
       },
       exitCodes: {},
       run: fetchVerb,
diff --git a/.bkit/core/engine/commands/workflow/tracker.test.ts b/.bkit/core/engine/commands/workflow/tracker.test.ts
index 31fa5a71a..f645ed4b2 100644
--- a/.bkit/core/engine/commands/workflow/tracker.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.test.ts
@@ -313,6 +313,18 @@ describe("github client", () => {
     });
     expect(issue.comments.map((c) => c.body)).toEqual(["second", "first"]);
   });
+
+  it("github fetch marks a closed issue terminal and an open one not", async () => {
+    const reply = (state: string) =>
+      JSON.stringify({ title: "T", html_url: "u", state, labels: [], body: "" });
+    gh.resp("repos/o/r/issues/12", reply("closed"));
+    gh.resp("repos/o/r/issues/12/comments?per_page=100", "");
+    const closed = await fetchIssue(trackerTarget(github(), { fid: "12-x" }));
+    expect((closed as { terminal?: boolean }).terminal).toBe(true);
+    gh.resp("repos/o/r/issues/12", reply("open"));
+    const open = await fetchIssue(trackerTarget(github(), { fid: "12-x" }));
+    expect((open as { terminal?: boolean }).terminal).toBe(false);
+  });
 });
 
 // ---------------------------------------------------------------------------
@@ -320,6 +332,37 @@ describe("github client", () => {
 // ---------------------------------------------------------------------------
 
 describe("linear client", () => {
+  const linearReply = (name: string, type: string) =>
+    json({
+      data: {
+        issue: {
+          identifier: "ENG-4",
+          title: "T",
+          url: "https://linear.app/x/ENG-4",
+          description: "",
+          state: { name, type },
+          labels: { nodes: [] },
+          comments: { nodes: [], pageInfo: { hasNextPage: false } },
+        },
+      },
+    });
+
+  it("linear fetch marks a completed state renamed Shipped terminal", async () => {
+    process.env.BKIT_LINEAR_API_KEY = "k";
+    stubFetch(linearReply("Shipped", "completed"));
+    const issue = await fetchIssue(trackerTarget(linear(), { fid: "eng-4-x" }));
+    expect(issue.state).toBe("Shipped");
+    expect((issue as { terminal?: boolean }).terminal).toBe(true);
+  });
+
+  it("linear fetch marks a canceled state terminal and a started state not", async () => {
+    process.env.BKIT_LINEAR_API_KEY = "k";
+    const calls = stubFetch(linearReply("Dropped", "canceled"), linearReply("Doing", "started"));
+    const t = trackerTarget(linear(), { fid: "eng-4-x" });
+    expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal).toBe(true);
+    expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal).toBe(false);
+    expect(String(bodyOf(calls[0]!.init).query)).toMatch(/state \{[^}]*\btype\b/);
+  });
   it("posts through GraphQL commentCreate with the API key as Authorization", async () => {
     process.env.BKIT_LINEAR_API_KEY = "lin_api_secret";
     const calls = stubFetch(
@@ -490,6 +533,25 @@ describe("jira client (MCP over HTTP)", () => {
     expect(tools[2].arguments.inputs.startAt).toBe(1);
   });
 
+  it("jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not", async () => {
+    process.env.BKIT_JIRA_API_KEY = "k";
+    const issueOf = (name: string, key: string) => ({
+      key: "PROJ-9",
+      fields: {
+        summary: "S",
+        status: { name, statusCategory: { key } },
+        labels: [],
+        description: "",
+      },
+    });
+    const empty = { comments: [], isLast: true };
+    jiraMcp(issueOf("Shipped", "done"), empty);
+    const t = trackerTarget(jira(), { fid: "proj-9-x" });
+    expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal).toBe(true);
+    jiraMcp(issueOf("Done", "indeterminate"), empty);
+    expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal).toBe(false);
+  });
+
   it("pins the Rovo tool names .bkit/trackers.md lists", () => {
     const doc = fs.readFileSync(path.resolve(__dirname, "../../../.bkit/trackers.md"), "utf-8");
     for (const name of Object.values(JIRA_TOOLS)) expect(doc, name).toContain(name);
diff --git a/.bkit/core/engine/commands/workflow/tracker.ts b/.bkit/core/engine/commands/workflow/tracker.ts
index 7ddc0d538..4bc739b55 100644
--- a/.bkit/core/engine/commands/workflow/tracker.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.ts
@@ -540,6 +540,8 @@ export interface FetchedIssue {
   url: string;
   state: string;
   labels: string[];
+  /** Finished by the tracker's state category (never by state name). */
+  terminal: boolean;
   /** The description, raw. */
   body: string;
   /** In the order the tracker returned them; callers sort. */
@@ -548,6 +550,17 @@ export interface FetchedIssue {
 
 const str = (v: unknown): string => (typeof v === "string" ? v : "");
 
+/**
+ * One terminal judgement for every tracker, by state category: GitHub `closed`, Linear
+ * state type `completed` / `canceled`, Jira status category `done`. Renamed states
+ * stay judged right because the name is never read.
+ */
+function isTerminal(tracker: "github" | "linear" | "jira", state: string, category: string) {
+  if (tracker === "github") return state === "closed";
+  if (tracker === "linear") return category === "completed" || category === "canceled";
+  return category === "done";
+}
+
 // ADF nodes whose children are inline text; every other node's children are blocks, one per line.
 const ADF_INLINE = new Set(["paragraph", "heading", "codeBlock", "mediaSingle"]);
 
@@ -605,6 +618,7 @@ export async function fetchIssue(t: TrackerTarget): Promise<FetchedIssue> {
       labels: (Array.isArray(issue.labels) ? issue.labels : []).map((l) =>
         typeof l === "string" ? l : str(asRecord(l).name),
       ),
+      terminal: isTerminal("github", str(issue.state), ""),
       body: str(issue.body),
       comments,
     };
@@ -612,7 +626,7 @@ export async function fetchIssue(t: TrackerTarget): Promise<FetchedIssue> {
   if (t.tracker === "linear") {
     const page = "nodes { body createdAt } pageInfo { hasNextPage endCursor }";
     const data = await linearGql(
-      `query($id: String!) { issue(id: $id) { identifier title url description state { name } labels { nodes { name } } comments(first: 250) { ${page} } } }`,
+      `query($id: String!) { issue(id: $id) { identifier title url description state { name type } labels { nodes { name } } comments(first: 250) { ${page} } } }`,
       { id: t.issue },
     );
     const issue = asRecord(data.issue);
@@ -637,6 +651,7 @@ export async function fetchIssue(t: TrackerTarget): Promise<FetchedIssue> {
       url: str(issue.url),
       state: str(asRecord(issue.state).name),
       labels: nodes(issue.labels).map((l) => str(asRecord(l).name)),
+      terminal: isTerminal("linear", "", str(asRecord(issue.state).type)),
       body: str(issue.description),
       comments,
     };
@@ -648,6 +663,7 @@ export async function fetchIssue(t: TrackerTarget): Promise<FetchedIssue> {
       await jira.call(JIRA_TOOLS.getIssue, {
         cloudId: site,
         issueIdOrKey: t.issue,
+        // The evidence view carries `fields.status` with its `statusCategory`, read below.
         view: "evidence",
       }),
     );
@@ -686,6 +702,7 @@ export async function fetchIssue(t: TrackerTarget): Promise<FetchedIssue> {
       url: `${site}/browse/${t.issue}`,
       state: str(asRecord(fields.status).name),
       labels: (Array.isArray(fields.labels) ? fields.labels : []).map((l) => String(l)),
+      terminal: isTerminal("jira", "", str(asRecord(asRecord(fields.status).statusCategory).key)),
       body: textOf(description),
       comments,
     };
@@ -885,7 +902,7 @@ export async function readBlockers(t: TrackerTarget): Promise<Blocker[]> {
     const numbers = parseBlockedBy(str(asRecord(parsed.ok ? parsed.value : null).body));
     return numbers.map((n) => {
       const state = gh(t, ["api", `repos/${t.ownerRepo}/issues/${n}`, "--jq", ".state"]).trim();
-      return { id: `#${n}`, state, open: state !== "closed" };
+      return { id: `#${n}`, state, open: !isTerminal("github", state, "") };
     });
   }
   if (t.tracker === "linear") {
@@ -904,7 +921,7 @@ export async function readBlockers(t: TrackerTarget): Promise<Blocker[]> {
         return {
           id: str(issue.identifier),
           state: str(state.name),
-          open: !["completed", "canceled"].includes(str(state.type)),
+          open: !isTerminal("linear", "", str(state.type)),
         };
       });
   }
@@ -924,7 +941,7 @@ export async function readBlockers(t: TrackerTarget): Promise<Blocker[]> {
       return {
         id: str(issue.key),
         state: str(status.name),
-        open: str(asRecord(status.statusCategory).key) !== "done",
+        open: !isTerminal("jira", "", str(asRecord(status.statusCategory).key)),
       };
     });
   }
diff --git a/.bkit/core/hooks/preflight-linear.sh b/.bkit/core/hooks/preflight-linear.sh
deleted file mode 100644
index 4ebdfb4a6..000000000
--- a/.bkit/core/hooks/preflight-linear.sh
+++ /dev/null
@@ -1,73 +0,0 @@
-# --- Linear guard: identical in the Claude and Cursor preflight hooks (bkit renders it
-# from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
-# which the host's code above defines in that host's output shape.
-
-# BKIT_LINEAR_API_KEY required to call the Linear GraphQL API.
-if [[ -z "${BKIT_LINEAR_API_KEY:-}" ]]; then
-  echo "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY not set, so ${LINEAR_ISSUE_ID:-(unset)} cannot be validated." >&2
-  emit_context "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check ${LINEAR_ISSUE_ID:-(unset)}. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
-  exit 1
-fi
-
-# LINEAR_ISSUE_ID required (Claude's trigger above already demands it; a Cursor Cloud
-# Agent sets it from workflow context).
-if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
-  echo "Guard pre-check: FAIL. LINEAR_ISSUE_ID not set." >&2
-  emit_context "Guard pre-check: FAIL. LINEAR_ISSUE_ID is not set. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
-  exit 1
-fi
-
-# Query Linear for issue state and labels.
-QUERY='query($id: String!) { issue(id: $id) { identifier title state { name } labels { nodes { name } } } }'
-
-BODY=$(LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" Q="$QUERY" python3 -c '
-import json, os
-print(json.dumps({"query": os.environ["Q"], "variables": {"id": os.environ["LINEAR_ISSUE_ID"]}}))
-')
-
-RESPONSE=$(curl -sS \
-  -X POST \
-  -H "Content-Type: application/json" \
-  -H "Authorization: ${BKIT_LINEAR_API_KEY}" \
-  --data "$BODY" \
-  "https://api.linear.app/graphql" 2>/dev/null) || {
-    echo "Guard pre-check: FAIL. Linear API request failed for ${LINEAR_ISSUE_ID}." >&2
-    emit_context "Guard pre-check: FAIL. The Linear API could not be reached for ${LINEAR_ISSUE_ID}. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
-    exit 1
-  }
-
-# Parse response: identifier, state, labels.
-read -r ISSUE_ID_DISPLAY ISSUE_STATE LABELS < <(RESPONSE="$RESPONSE" LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" python3 -c '
-import json, os, sys
-try:
-    d = json.loads(os.environ["RESPONSE"])
-except Exception:
-    print(os.environ["LINEAR_ISSUE_ID"], "UNKNOWN", "")
-    sys.exit(0)
-issue = (d.get("data") or {}).get("issue") or {}
-ident = issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"]
-state = (issue.get("state") or {}).get("name") or "UNKNOWN"
-labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
-print(ident, state, labels if labels else "-")
-')
-
-FAIL_REASON=""
-
-# Guard 1: `bkit:auto` label must be present.
-if [[ ",${LABELS}," != *",bkit:auto,"* ]]; then
-  FAIL_REASON="bkit:auto label missing (labels: ${LABELS})"
-fi
-
-# Guard 2: Issue must not be in a terminal state.
-if [[ "$ISSUE_STATE" == "Cancelled" || "$ISSUE_STATE" == "Done" ]]; then
-  FAIL_REASON="the issue is in a terminal state (${ISSUE_STATE})"
-fi
-
-if [[ -n "$FAIL_REASON" ]]; then
-  echo "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}" >&2
-  emit_context "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}. HARD STOP: refuse any Linear-related work on this issue. Report the failure to the user, then stop."
-  exit 1
-fi
-
-emit_context "Guard pre-check: PASS | issue: ${ISSUE_ID_DISPLAY} | status: ${ISSUE_STATE} | labels: ${LABELS}"
-exit 0
diff --git a/.bkit/core/hooks/preflight-tracker.sh b/.bkit/core/hooks/preflight-tracker.sh
new file mode 100644
index 000000000..b780e9993
--- /dev/null
+++ b/.bkit/core/hooks/preflight-tracker.sh
@@ -0,0 +1,151 @@
+# --- Tracker guard: identical in the Claude and Cursor preflight hooks (bkit renders it
+# from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
+# which the host's code above defines in that host's output shape. Dispatches on
+# `bkit.tracker.default` in the repo's package.json (unreadable -> linear, the original
+# guard). Passes only on a readable issue that carries `bkit:auto` and is not finished by
+# the tracker's state category; any unreadable answer is a HARD STOP naming tracker + reason.
+
+CURL_LIMITS=(--connect-timeout 5 --max-time 15)
+
+# bkit_guard_fail TRACKER ID REASON — HARD STOP naming the tracker and the reason.
+bkit_guard_fail() {
+  echo "Guard pre-check: FAIL. ${1} issue ${2}: ${3}" >&2
+  emit_context "Guard pre-check: FAIL. ${1} issue ${2}: ${3}. HARD STOP: refuse any ${1}-related work on this issue. Report the failure to the user, then stop."
+  exit 1
+}
+
+BKIT_GUARD_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
+BKIT_GUARD_TRACKER=$(ROOT="$BKIT_GUARD_ROOT" python3 -c '
+import json, os
+try:
+    with open(os.path.join(os.environ["ROOT"], "package.json")) as f:
+        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "linear")
+except Exception:
+    print("linear")
+' 2>/dev/null || echo linear)
+
+case "$BKIT_GUARD_TRACKER" in
+  github)
+    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
+    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
+      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
+      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
+      exit 1
+    fi
+    # Issue id: GITHUB_ISSUE_ID, else the leading digits of the `feat/{FID}` branch.
+    GH_ISSUE="${GITHUB_ISSUE_ID:-}"
+    if [[ -z "$GH_ISSUE" ]]; then
+      GH_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
+      if [[ "$GH_BRANCH" =~ ^feat/([0-9]+) ]]; then GH_ISSUE="${BASH_REMATCH[1]}"; fi
+    fi
+    if [[ -z "$GH_ISSUE" ]]; then
+      bkit_guard_fail "GitHub" "(unknown)" "no issue id (GITHUB_ISSUE_ID unset and the branch is not feat/{number}-...)"
+    fi
+    GH_REMOTE=$(git remote get-url origin 2>/dev/null || true)
+    GH_REPO=$(printf '%s' "$GH_REMOTE" | sed -E 's#^(https://([^@/]*@)?|ssh://git@|git@)github\.com[:/]##; s#\.git$##')
+    if [[ "$GH_REPO" != */* ]]; then
+      bkit_guard_fail "GitHub" "#${GH_ISSUE}" "could not read owner/repo from the origin remote"
+    fi
+    GH_RESPONSE=$(curl -sS --fail "${CURL_LIMITS[@]}" \
+      -H "Authorization: Bearer ${BKIT_GH_TOKEN}" \
+      -H "Accept: application/vnd.github+json" \
+      "https://api.github.com/repos/${GH_REPO}/issues/${GH_ISSUE}" 2>/dev/null) \
+      || bkit_guard_fail "GitHub" "#${GH_ISSUE}" "the GitHub API request failed (network, auth or not found)"
+    IFS=$'\t' read -r ISSUE_STATE LABELS < <(RESPONSE="$GH_RESPONSE" python3 -c '
+import json, os
+try:
+    d = json.loads(os.environ["RESPONSE"])
+    state = d["state"]
+    labels = ",".join((l["name"] if isinstance(l, dict) else str(l)) for l in (d.get("labels") or []))
+    print(state + "\t" + (labels if labels else "-"))
+except Exception:
+    print("UNKNOWN\t-")
+')
+    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
+      bkit_guard_fail "GitHub" "#${GH_ISSUE}" "the GitHub API answer could not be read"
+    fi
+    ISSUE_ID_DISPLAY="#${GH_ISSUE}"
+    TRACKER_NAME="GitHub"
+    TERMINAL="false"
+    [[ "$ISSUE_STATE" == "closed" ]] && TERMINAL="true"
+    ;;
+  linear)
+    # BKIT_LINEAR_API_KEY required to call the Linear GraphQL API.
+    if [[ -z "${BKIT_LINEAR_API_KEY:-}" ]]; then
+      echo "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY not set, so ${LINEAR_ISSUE_ID:-(unset)} cannot be validated." >&2
+      emit_context "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check ${LINEAR_ISSUE_ID:-(unset)}. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
+      exit 1
+    fi
+
+    # LINEAR_ISSUE_ID required (Claude's trigger above already demands it; a Cursor Cloud
+    # Agent sets it from workflow context).
+    if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
+      echo "Guard pre-check: FAIL. LINEAR_ISSUE_ID not set." >&2
+      emit_context "Guard pre-check: FAIL. LINEAR_ISSUE_ID is not set. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
+      exit 1
+    fi
+
+    # Query Linear for issue state (name + category type) and labels.
+    QUERY='query($id: String!) { issue(id: $id) { identifier title state { name type } labels { nodes { name } } } }'
+
+    BODY=$(LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" Q="$QUERY" python3 -c '
+import json, os
+print(json.dumps({"query": os.environ["Q"], "variables": {"id": os.environ["LINEAR_ISSUE_ID"]}}))
+')
+
+    RESPONSE=$(curl -sS "${CURL_LIMITS[@]}" \
+      -X POST \
+      -H "Content-Type: application/json" \
+      -H "Authorization: ${BKIT_LINEAR_API_KEY}" \
+      --data "$BODY" \
+      "https://api.linear.app/graphql" 2>/dev/null) \
+      || bkit_guard_fail "Linear" "$LINEAR_ISSUE_ID" "the Linear API request failed (could not be reached)"
+
+    # Parse response: identifier, state name, state type, labels (tab-separated, "-" empty).
+    IFS=$'\t' read -r ISSUE_ID_DISPLAY ISSUE_STATE STATE_TYPE LABELS < <(RESPONSE="$RESPONSE" LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" python3 -c '
+import json, os
+try:
+    d = json.loads(os.environ["RESPONSE"])
+except Exception:
+    d = {}
+issue = (d.get("data") or {}).get("issue")
+if not issue:
+    print(os.environ["LINEAR_ISSUE_ID"] + "\tUNKNOWN\t-\t-")
+else:
+    state = issue.get("state") or {}
+    labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
+    print("\t".join([issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"], state.get("name") or "-", state.get("type") or "-", labels if labels else "-"]))
+')
+    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
+      bkit_guard_fail "Linear" "$LINEAR_ISSUE_ID" "the Linear API answer carried no issue"
+    fi
+    TRACKER_NAME="Linear"
+    TERMINAL="false"
+    [[ "$STATE_TYPE" == "completed" || "$STATE_TYPE" == "canceled" ]] && TERMINAL="true"
+    ;;
+  *)
+    # Jira and tracker none: no guard here.
+    exit 0
+    ;;
+esac
+
+FAIL_REASON=""
+
+# Guard 1: `bkit:auto` label must be present.
+if [[ ",${LABELS}," != *",bkit:auto,"* ]]; then
+  FAIL_REASON="bkit:auto label missing (labels: ${LABELS})"
+fi
+
+# Guard 2: Issue must not be finished (terminal by state category, never by name).
+if [[ "$TERMINAL" == "true" ]]; then
+  FAIL_REASON="the issue is in a terminal state (${ISSUE_STATE})"
+fi
+
+if [[ -n "$FAIL_REASON" ]]; then
+  echo "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}" >&2
+  emit_context "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}. HARD STOP: refuse any ${TRACKER_NAME}-related work on this issue. Report the failure to the user, then stop."
+  exit 1
+fi
+
+emit_context "Guard pre-check: PASS | issue: ${ISSUE_ID_DISPLAY} | status: ${ISSUE_STATE} | labels: ${LABELS}"
+exit 0
diff --git a/.bkit/providers.md b/.bkit/providers.md
index 7afd31f8d..a52a93f8d 100644
--- a/.bkit/providers.md
+++ b/.bkit/providers.md
@@ -304,7 +304,7 @@ Per-action gates on all five hosts, subagents included. This section is an overv
 | `guardrails-shell.js` | Claude, Cursor, Codex, Google Antigravity `guardrails` | shell parsing (`shellSegments`, `shellWords`, `commandWords`, `commandLines`: `sh -c` scripts, `$(…)`, backticks, `( … )`), curl / wget host allowlist (`.bkit/allowlist.json` located from `hookDirs(payload)`), shell-as-edit-channel detection (quote-aware redirects) |
 | `guardrails-tiers.js` | Cursor, Codex, Google Antigravity `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
 | `guardrails-read.js` | Cursor, Google Antigravity `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
-| `preflight-linear.sh` | Claude, Cursor `preflight` | Linear key / issue checks, GraphQL query, `bkit:auto` + terminal-state guards |
+| `preflight-tracker.sh` | Claude, Cursor `preflight` | Tracker guard: GitHub (REST) and Linear (GraphQL) key / issue checks, `bkit:auto` + terminal-by-category guards |
 | `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
 | `session-rules-advisory.js` | opencode, Codex, Google Antigravity `rules` | the rules-read advisory sentence plus the once-per-session helper (`rulesReadAdviceOnce`, per-user OS-temp state, 24h GC) |
 
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index ecfa8311b..768d8eea1 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -591,7 +591,13 @@ async function fetchVerb(ctx) {
         comments: path.join(dir, "issue-comments.json"),
         facts: path.join(dir, "issue-facts.json"),
     };
-    const facts = { title: issue.title, url: issue.url, state: issue.state, labels: issue.labels };
+    const facts = {
+        title: issue.title,
+        url: issue.url,
+        state: issue.state,
+        labels: issue.labels,
+        terminal: issue.terminal,
+    };
     fs.mkdirSync(dir, { recursive: true });
     fs.writeFileSync(files.description, issue.body);
     const comments = sortOldestFirst(issue.comments).comments;
@@ -708,10 +714,11 @@ export const issuesCommand = {
                 title: "issue title",
                 url: "issue URL",
                 state: "tracker state name (GitHub: open | closed)",
-                labels: "label names",
-                files: "{description, comments, facts}: raw description, comments oldest first as JSON, {title, url, state, labels} as JSON",
-                skipped: "no-issue | tracker-none: nothing read, nothing written",
-                reason: "exit 80: network | auth | scope | rate-limit | not-found | http-<n>; read the issue via the tracker MCP",
+                labels: "label names (the bkit-cloud.yml router reads bkit:auto here)",
+                terminal: "true when the tracker's state category is finished (GitHub closed, Linear completed / canceled, Jira done), whatever the state is named",
+                files: "{description, comments, facts}: raw description, comments oldest first as JSON, {title, url, state, labels, terminal} as JSON",
+                skipped: "no-issue | tracker-none: nothing read, nothing written (the bkit-cloud.yml router reads this as skipped)",
+                reason: "exit 80 (the bkit-cloud.yml router fails closed on it): network | auth | scope | rate-limit | not-found | http-<n>; read the issue via the tracker MCP",
             },
             exitCodes: {},
             run: fetchVerb,
diff --git a/dist/commands/workflow/tracker.js b/dist/commands/workflow/tracker.js
index 31135baec..bacb53ac4 100644
--- a/dist/commands/workflow/tracker.js
+++ b/dist/commands/workflow/tracker.js
@@ -461,6 +461,18 @@ export async function recentComments(t, n) {
     return issue.comments.slice(-n).map((c) => ({ body: c.body, url: null }));
 }
 const str = (v) => (typeof v === "string" ? v : "");
+/**
+ * One terminal judgement for every tracker, by state category: GitHub `closed`, Linear
+ * state type `completed` / `canceled`, Jira status category `done`. Renamed states
+ * stay judged right because the name is never read.
+ */
+function isTerminal(tracker, state, category) {
+    if (tracker === "github")
+        return state === "closed";
+    if (tracker === "linear")
+        return category === "completed" || category === "canceled";
+    return category === "done";
+}
 // ADF nodes whose children are inline text; every other node's children are blocks, one per line.
 const ADF_INLINE = new Set(["paragraph", "heading", "codeBlock", "mediaSingle"]);
 /** An Atlassian Document Format node as text: headings as `#` lines, blocks one per line. */
@@ -517,13 +529,14 @@ export async function fetchIssue(t) {
             url: str(issue.html_url),
             state: str(issue.state),
             labels: (Array.isArray(issue.labels) ? issue.labels : []).map((l) => typeof l === "string" ? l : str(asRecord(l).name)),
+            terminal: isTerminal("github", str(issue.state), ""),
             body: str(issue.body),
             comments,
         };
     }
     if (t.tracker === "linear") {
         const page = "nodes { body createdAt } pageInfo { hasNextPage endCursor }";
-        const data = await linearGql(`query($id: String!) { issue(id: $id) { identifier title url description state { name } labels { nodes { name } } comments(first: 250) { ${page} } } }`, { id: t.issue });
+        const data = await linearGql(`query($id: String!) { issue(id: $id) { identifier title url description state { name type } labels { nodes { name } } comments(first: 250) { ${page} } } }`, { id: t.issue });
         const issue = asRecord(data.issue);
         if (!data.issue)
             throw new TrackerError("not-found", `linear: ${t.issue} not found`);
@@ -544,6 +557,7 @@ export async function fetchIssue(t) {
             url: str(issue.url),
             state: str(asRecord(issue.state).name),
             labels: nodes(issue.labels).map((l) => str(asRecord(l).name)),
+            terminal: isTerminal("linear", "", str(asRecord(issue.state).type)),
             body: str(issue.description),
             comments,
         };
@@ -554,6 +568,7 @@ export async function fetchIssue(t) {
         const raw = asRecord(await jira.call(JIRA_TOOLS.getIssue, {
             cloudId: site,
             issueIdOrKey: t.issue,
+            // The evidence view carries `fields.status` with its `statusCategory`, read below.
             view: "evidence",
         }));
         const fields = asRecord(raw.fields);
@@ -590,6 +605,7 @@ export async function fetchIssue(t) {
             url: `${site}/browse/${t.issue}`,
             state: str(asRecord(fields.status).name),
             labels: (Array.isArray(fields.labels) ? fields.labels : []).map((l) => String(l)),
+            terminal: isTerminal("jira", "", str(asRecord(asRecord(fields.status).statusCategory).key)),
             body: textOf(description),
             comments,
         };
@@ -751,7 +767,7 @@ export async function readBlockers(t) {
         const numbers = parseBlockedBy(str(asRecord(parsed.ok ? parsed.value : null).body));
         return numbers.map((n) => {
             const state = gh(t, ["api", `repos/${t.ownerRepo}/issues/${n}`, "--jq", ".state"]).trim();
-            return { id: `#${n}`, state, open: state !== "closed" };
+            return { id: `#${n}`, state, open: !isTerminal("github", state, "") };
         });
     }
     if (t.tracker === "linear") {
@@ -768,7 +784,7 @@ export async function readBlockers(t) {
             return {
                 id: str(issue.identifier),
                 state: str(state.name),
-                open: !["completed", "canceled"].includes(str(state.type)),
+                open: !isTerminal("linear", "", str(state.type)),
             };
         });
     }
@@ -786,7 +802,7 @@ export async function readBlockers(t) {
             return {
                 id: str(issue.key),
                 state: str(status.name),
-                open: str(asRecord(status.statusCategory).key) !== "done",
+                open: !isTerminal("jira", "", str(asRecord(status.statusCategory).key)),
             };
         });
     }
