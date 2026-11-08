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
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index f194b9661..45ed08278 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -21,3 +21,5 @@
 {"schema":3,"ts":1793517758819,"kind":"friction","key":"ship-update-docs-changelog-outside-pr-scope","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["699-engine-run-completeness","https://github.com/cbartens/bkit/pull/786"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship-update-docs edits CHANGELOG.md but ledgers commit --scope=pr does not stage it, so the docs sync's changelog entry is left uncommitted","description":"Step 6's docs agent added an [Unreleased] bullet to the root CHANGELOG.md. Step 8's ledgers commit --scope=pr allow-list covers docs/*.md, ledgers and skills but not CHANGELOG.md, so the bullet stayed dirty in the worktree and does not ride the PR.","remediation":"Either add CHANGELOG.md to the --scope=pr pathspecs (and the runs gate bookkeeping allow-list), or tell bkit-ship-update-docs not to edit files outside docs/.","source":".bkit/core/engine/commands/workflow/ledgers.ts:99"}
 {"schema":3,"ts":1793538646877,"kind":"friction","key":"ship-worktree-setup-adopts-when-run-inside-feature-worktree","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-start-workflow"},"references":["715-retire-lite-workflows"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship worktrees setup run from inside the feature's own worktree picks adopt mode and exits 7","description":"Step 1 sub-step 7 ran from .worktrees/715-retire-lite-workflows, whose current branch is the ship target, so worktrees setup chose adopt mode (session branch = target), tried to switch the main checkout onto feat/715-retire-lite-workflows, and git refused because the worktree already holds that branch. It exits 7, which the workflow routes as a ship of dev or main and stops. Re-running the same block from the repo root resumed the worktree.","remediation":"In worktrees setup, treat a session already inside the target's registered worktree as resumed, or give this refusal its own exit code."}
 {"schema":3,"ts":1793539461063,"kind":"friction","key":"ship-docs-sync-leaves-padded-table-row","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["715-retire-lite-workflows"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship docs sync edits a docs table row with padding, so the Step 8 bookkeeping push is refused by format:tables:check","description":"The ship update-docs agent rewrote a row of a prettier-ignore table in docs/testing.md with fixed-width padding. ledgers commit committed it, and the pre-push gate's format:tables:check refused the push (branches push exit 8). Step 8 has no route for a refused push, so the only written path is the Failure Path, which would end the run over a whitespace fix. The orchestrator ran bkit-insert-ignore.mjs on the file, committed it, and re-ran the push.","remediation":"Run the table formatter on docs the ship docs agent touched before ledgers commit, or give Step 8 a route for a hook-refused push: fix what the hook names, commit, re-run the push."}
+{"schema":3,"ts":1793586529615,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"90c5e692e71146c42305c59cbd12a8320c048336"},"recurrenceCount":1}
+{"schema":3,"ts":1793587252363,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"90c5e692e71146c42305c59cbd12a8320c048336"},"recurrenceCount":2,"lastConfirmed":1793587252363}
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
 
diff --git a/.bkit/version b/.bkit/version
index dcaf03e2d..2336fa026 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "3ec96b5c34bdcf6204c0103f508c1d0b2d968b1935e646c17913f7c7f4475557",
+    "docs/testing.md": "04d591fb6ab9f66ad269a58d457d03a38a15b6c5c6d7e3a8af51d31feb697320",
     ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -18,7 +18,7 @@
     ".gitignore": "9a7f418d4a8aafbddbd9995b6a9cee5b5dc54a8ec47440263a17d388652d79e3",
     "docs/security.md": "c78ac513273cbad510cf412efedf6fb62f1d84193e909cabc9c758f992f6b047",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "1b20322f960e2a2b55f77581784288dda48f14866a0cc1c096e2b3ba1411ea5d",
+    "docs/architecture.md": "a423a73e76c2c752e689c262a6e131cf3fb3cfba66560fcaa34e6c6ceb8816a9",
     "docs/technology.md": "69f00bc76a6546c98d6ee6a3fc21808ccbcc81909d0ee1ff9c1dd9f7b8cb2c58",
     ".bkit/.env.example": "3eae6dd3d96a33aed1745fc6b069000ae7272fbdab99617250015e9c233e6200",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
@@ -229,12 +229,12 @@
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
     ".claude/hooks/bkit-guardrails.cjs": "cf9e03228d75d0746f92fd0f88840e64185bdeec7818a94d7c09037af6156b51",
-    ".claude/hooks/bkit-preflight.sh": "1afd1b29aca74cc96f78c6e64bcf52872aee53a77afa1a655426a70d28a54ab9",
+    ".claude/hooks/bkit-preflight.sh": "1c119106c2019efe915bfeb8de3b66c4f48474197b8483087aed765f4768c524",
     ".codex/hooks/bkit-gateguard.cjs": "9fd295d0ed494a90a97c41338cedbf4373c12590143a6cec09f2f612d16a3f9a",
     ".codex/hooks/bkit-guardrails.cjs": "59d5f8e7f395c5bc8349ead09a0f4d72e62efaf2d840930b0cd4f0e82df0734e",
     ".cursor/hooks/bkit-gateguard.cjs": "fde8f973aa9ab4849186ba92dc40f52be8cc23fc44e64532a8b69a13a7157a42",
     ".cursor/hooks/bkit-guardrails.cjs": "f1b84f9ce3cce9177155118a55e875060751db2f2f5611de3ce1f0da2bc0af0d",
-    ".cursor/hooks/bkit-preflight.sh": "55e61ca03c59e627035873327302751f8e7ec4146efc1e624fbfca085e15086f",
+    ".cursor/hooks/bkit-preflight.sh": "0ca788171aafd2107b426240502dabb94c0e8fd5b81b1d40fa723eeaf196370e",
     ".opencode/plugin/bkit-gateguard.js": "2cb76c1e70d8278f8c0c7a1bd1db90bea953ca383409fbfdbc2a802f921ec8f4",
     ".bkit/LICENSE.md": "e768db6af8e05dceec02eaff78e8a8478cd8705f5f06522377f98a5a513bc027",
     "GEMINI.md": "76391511fab40ff8251ad50990a5eb3139e8aedee3944814bfd98894354733a2",
diff --git a/.claude/hooks/bkit-preflight.sh b/.claude/hooks/bkit-preflight.sh
index 04f4f790f..51f16f718 100755
--- a/.claude/hooks/bkit-preflight.sh
+++ b/.claude/hooks/bkit-preflight.sh
@@ -106,58 +106,136 @@ if [[ "$(uname)" == "Darwin" ]]; then
   fi
 fi
 
-# --- Linear guard: identical in the Claude and Cursor preflight hooks (bkit renders it
+# --- Tracker guard: identical in the Claude and Cursor preflight hooks (bkit renders it
 # from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
-# which the host's code above defines in that host's output shape.
+# which the host's code above defines in that host's output shape. Dispatches on
+# `bkit.tracker.default` in the repo's package.json (unreadable -> linear, the original
+# guard). Passes only on a readable issue that carries `bkit:auto` and is not finished by
+# the tracker's state category; any unreadable answer is a HARD STOP naming tracker + reason.
 
-# BKIT_LINEAR_API_KEY required to call the Linear GraphQL API.
-if [[ -z "${BKIT_LINEAR_API_KEY:-}" ]]; then
-  echo "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY not set, so ${LINEAR_ISSUE_ID:-(unset)} cannot be validated." >&2
-  emit_context "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check ${LINEAR_ISSUE_ID:-(unset)}. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
-  exit 1
-fi
+CURL_LIMITS=(--connect-timeout 5 --max-time 15)
 
-# LINEAR_ISSUE_ID required (Claude's trigger above already demands it; a Cursor Cloud
-# Agent sets it from workflow context).
-if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
-  echo "Guard pre-check: FAIL. LINEAR_ISSUE_ID not set." >&2
-  emit_context "Guard pre-check: FAIL. LINEAR_ISSUE_ID is not set. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
+# bkit_guard_fail TRACKER ID REASON — HARD STOP naming the tracker and the reason.
+bkit_guard_fail() {
+  echo "Guard pre-check: FAIL. ${1} issue ${2}: ${3}" >&2
+  emit_context "Guard pre-check: FAIL. ${1} issue ${2}: ${3}. HARD STOP: refuse any ${1}-related work on this issue. Report the failure to the user, then stop."
   exit 1
-fi
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
 
-# Query Linear for issue state and labels.
-QUERY='query($id: String!) { issue(id: $id) { identifier title state { name } labels { nodes { name } } } }'
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
 
-BODY=$(LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" Q="$QUERY" python3 -c '
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
 import json, os
 print(json.dumps({"query": os.environ["Q"], "variables": {"id": os.environ["LINEAR_ISSUE_ID"]}}))
 ')
 
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
+    RESPONSE=$(curl -sS "${CURL_LIMITS[@]}" \
+      -X POST \
+      -H "Content-Type: application/json" \
+      -H "Authorization: ${BKIT_LINEAR_API_KEY}" \
+      --data "$BODY" \
+      "https://api.linear.app/graphql" 2>/dev/null) \
+      || bkit_guard_fail "Linear" "$LINEAR_ISSUE_ID" "the Linear API request failed (could not be reached)"
 
-# Parse response: identifier, state, labels.
-read -r ISSUE_ID_DISPLAY ISSUE_STATE LABELS < <(RESPONSE="$RESPONSE" LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" python3 -c '
-import json, os, sys
+    # Parse response: identifier, state name, state type, labels (tab-separated, "-" empty).
+    IFS=$'\t' read -r ISSUE_ID_DISPLAY ISSUE_STATE STATE_TYPE LABELS < <(RESPONSE="$RESPONSE" LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" python3 -c '
+import json, os
 try:
     d = json.loads(os.environ["RESPONSE"])
 except Exception:
-    print(os.environ["LINEAR_ISSUE_ID"], "UNKNOWN", "")
-    sys.exit(0)
-issue = (d.get("data") or {}).get("issue") or {}
-ident = issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"]
-state = (issue.get("state") or {}).get("name") or "UNKNOWN"
-labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
-print(ident, state, labels if labels else "-")
+    d = {}
+issue = (d.get("data") or {}).get("issue")
+if not issue:
+    print(os.environ["LINEAR_ISSUE_ID"] + "\tUNKNOWN\t-\t-")
+else:
+    state = issue.get("state") or {}
+    labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
+    print("\t".join([issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"], state.get("name") or "-", state.get("type") or "-", labels if labels else "-"]))
 ')
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
 
 FAIL_REASON=""
 
@@ -166,14 +244,14 @@ if [[ ",${LABELS}," != *",bkit:auto,"* ]]; then
   FAIL_REASON="bkit:auto label missing (labels: ${LABELS})"
 fi
 
-# Guard 2: Issue must not be in a terminal state.
-if [[ "$ISSUE_STATE" == "Cancelled" || "$ISSUE_STATE" == "Done" ]]; then
+# Guard 2: Issue must not be finished (terminal by state category, never by name).
+if [[ "$TERMINAL" == "true" ]]; then
   FAIL_REASON="the issue is in a terminal state (${ISSUE_STATE})"
 fi
 
 if [[ -n "$FAIL_REASON" ]]; then
   echo "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}" >&2
-  emit_context "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}. HARD STOP: refuse any Linear-related work on this issue. Report the failure to the user, then stop."
+  emit_context "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}. HARD STOP: refuse any ${TRACKER_NAME}-related work on this issue. Report the failure to the user, then stop."
   exit 1
 fi
 
diff --git a/.cursor/hooks/bkit-preflight.sh b/.cursor/hooks/bkit-preflight.sh
index 48a654379..286255f82 100755
--- a/.cursor/hooks/bkit-preflight.sh
+++ b/.cursor/hooks/bkit-preflight.sh
@@ -99,58 +99,136 @@ fi
 # pre-installed via .cursor/Dockerfile, so the laptop-side brew check makes no sense here.
 # (Claude variant: validates required CLIs are on PATH; missing → HARD STOP with brew install hint.)
 
-# --- Linear guard: identical in the Claude and Cursor preflight hooks (bkit renders it
+# --- Tracker guard: identical in the Claude and Cursor preflight hooks (bkit renders it
 # from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
-# which the host's code above defines in that host's output shape.
+# which the host's code above defines in that host's output shape. Dispatches on
+# `bkit.tracker.default` in the repo's package.json (unreadable -> linear, the original
+# guard). Passes only on a readable issue that carries `bkit:auto` and is not finished by
+# the tracker's state category; any unreadable answer is a HARD STOP naming tracker + reason.
 
-# BKIT_LINEAR_API_KEY required to call the Linear GraphQL API.
-if [[ -z "${BKIT_LINEAR_API_KEY:-}" ]]; then
-  echo "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY not set, so ${LINEAR_ISSUE_ID:-(unset)} cannot be validated." >&2
-  emit_context "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check ${LINEAR_ISSUE_ID:-(unset)}. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
-  exit 1
-fi
+CURL_LIMITS=(--connect-timeout 5 --max-time 15)
 
-# LINEAR_ISSUE_ID required (Claude's trigger above already demands it; a Cursor Cloud
-# Agent sets it from workflow context).
-if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
-  echo "Guard pre-check: FAIL. LINEAR_ISSUE_ID not set." >&2
-  emit_context "Guard pre-check: FAIL. LINEAR_ISSUE_ID is not set. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
+# bkit_guard_fail TRACKER ID REASON — HARD STOP naming the tracker and the reason.
+bkit_guard_fail() {
+  echo "Guard pre-check: FAIL. ${1} issue ${2}: ${3}" >&2
+  emit_context "Guard pre-check: FAIL. ${1} issue ${2}: ${3}. HARD STOP: refuse any ${1}-related work on this issue. Report the failure to the user, then stop."
   exit 1
-fi
-
-# Query Linear for issue state and labels.
-QUERY='query($id: String!) { issue(id: $id) { identifier title state { name } labels { nodes { name } } } }'
+}
 
-BODY=$(LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" Q="$QUERY" python3 -c '
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
 import json, os
 print(json.dumps({"query": os.environ["Q"], "variables": {"id": os.environ["LINEAR_ISSUE_ID"]}}))
 ')
 
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
 try:
     d = json.loads(os.environ["RESPONSE"])
 except Exception:
-    print(os.environ["LINEAR_ISSUE_ID"], "UNKNOWN", "")
-    sys.exit(0)
-issue = (d.get("data") or {}).get("issue") or {}
-ident = issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"]
-state = (issue.get("state") or {}).get("name") or "UNKNOWN"
-labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
-print(ident, state, labels if labels else "-")
+    d = {}
+issue = (d.get("data") or {}).get("issue")
+if not issue:
+    print(os.environ["LINEAR_ISSUE_ID"] + "\tUNKNOWN\t-\t-")
+else:
+    state = issue.get("state") or {}
+    labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
+    print("\t".join([issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"], state.get("name") or "-", state.get("type") or "-", labels if labels else "-"]))
 ')
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
 
 FAIL_REASON=""
 
@@ -159,14 +237,14 @@ if [[ ",${LABELS}," != *",bkit:auto,"* ]]; then
   FAIL_REASON="bkit:auto label missing (labels: ${LABELS})"
 fi
 
-# Guard 2: Issue must not be in a terminal state.
-if [[ "$ISSUE_STATE" == "Cancelled" || "$ISSUE_STATE" == "Done" ]]; then
+# Guard 2: Issue must not be finished (terminal by state category, never by name).
+if [[ "$TERMINAL" == "true" ]]; then
   FAIL_REASON="the issue is in a terminal state (${ISSUE_STATE})"
 fi
 
 if [[ -n "$FAIL_REASON" ]]; then
   echo "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}" >&2
-  emit_context "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}. HARD STOP: refuse any Linear-related work on this issue. Report the failure to the user, then stop."
+  emit_context "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}. HARD STOP: refuse any ${TRACKER_NAME}-related work on this issue. Report the failure to the user, then stop."
   exit 1
 fi
 
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
diff --git a/docs/architecture.md b/docs/architecture.md
index 56ab034f1..71226a6ee 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -174,7 +174,7 @@ Workflow / prompt sources not shipped into consumer `.agents/`; live in installe
 - `.codex/agents/` + `.codex/hooks.json` + `.codex/hooks/` — additive Codex CLI host; opt-in `bkit install --codex`. Also generates gitignored `.codex/bkit-cloud.md` (Codex Cloud paste doc, live secrets). No `.codex/config.toml`: `openai` is a reserved built-in provider id, so bkit has nothing to declare. Project-local hooks load only once the `.codex/` layer is trusted.
 - `.agents/plugins/bkit/` (`plugin.json` + `skills/bkit-*/SKILL.md` + `agents/bkit-*.md` + `hooks.json` + `hooks/`) + `GEMINI.md` — additive Google Antigravity host installed as a workspace **plugin**; opt-in `bkit install --antigravity`; `.agents/` root stays the dedicated Codex install; workflows ship as plugin skills, subagents as in-session prompts loaded with `view_file`. See `docs/technology.md` § Execution Hosts.
 
-`.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` and `.opencode/plugin/bkit-gateguard.js` (the GateGuard advisory hooks — pre-edit on Claude / Cursor / Codex / Antigravity, appended to the tool result on opencode), the same five paths with `bkit-readguard` (the ReadGuard repeat-read advisory hooks, `.bkit/providers.md` § ReadGuard), `.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs` and `.opencode/plugin/bkit-rules.js` (the rules-read advisory hooks — the advisory at the first tool call on Codex, Antigravity and opencode; `.bkit/providers.md` § Rules-read advisory), plus `.claude/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` (shell gates: destructive ops, secret exposure, URL-host checks and shell-as-edit-channel) — like the two `bkit-preflight.sh` hooks, both carrying the rules-read advisory in the one session-start document, generated at install from a per-host template plus the shared parts in `.bkit/core/hooks/`, spliced in by `render/parts.ts` (the folder also holds the advisory parts `preflight-rules.sh` and `session-rules-advisory.js`, and `preflight-linear.sh`, the Linear guard both `bkit-preflight.sh` hooks share; `.bkit/providers.md` § Hooks lists every part) — are markered-text (slash-comment: `// bkit:start` / `// bkit:end`) — bkit owns only the pure advisory engine between the markers; the stdin / stdout driver (Claude) or exported plugin (opencode) around it is consumer-owned from first install onward, so a consumer can add their own advisories without losing them on upgrade. A pre-markers install (no markers, hash matches a prior canonical hash) is replaced wholesale on the next install / upgrade; a genuinely consumer-authored file (no markers, unknown hash) gets the block appended plus printed wiring instructions.
+`.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` and `.opencode/plugin/bkit-gateguard.js` (the GateGuard advisory hooks — pre-edit on Claude / Cursor / Codex / Antigravity, appended to the tool result on opencode), the same five paths with `bkit-readguard` (the ReadGuard repeat-read advisory hooks, `.bkit/providers.md` § ReadGuard), `.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs` and `.opencode/plugin/bkit-rules.js` (the rules-read advisory hooks — the advisory at the first tool call on Codex, Antigravity and opencode; `.bkit/providers.md` § Rules-read advisory), plus `.claude/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` (shell gates: destructive ops, secret exposure, URL-host checks and shell-as-edit-channel) — like the two `bkit-preflight.sh` hooks, both carrying the rules-read advisory in the one session-start document, generated at install from a per-host template plus the shared parts in `.bkit/core/hooks/`, spliced in by `render/parts.ts` (the folder also holds the advisory parts `preflight-rules.sh` and `session-rules-advisory.js`, and `preflight-tracker.sh`, the tracker guard (GitHub, Linear) both `bkit-preflight.sh` hooks share; `.bkit/providers.md` § Hooks lists every part) — are markered-text (slash-comment: `// bkit:start` / `// bkit:end`) — bkit owns only the pure advisory engine between the markers; the stdin / stdout driver (Claude) or exported plugin (opencode) around it is consumer-owned from first install onward, so a consumer can add their own advisories without losing them on upgrade. A pre-markers install (no markers, hash matches a prior canonical hash) is replaced wholesale on the next install / upgrade; a genuinely consumer-authored file (no markers, unknown hash) gets the block appended plus printed wiring instructions.
 
 Every non-JSON file bkit writes or refreshes carries the managed-version marker, one text in the file's comment syntax: `<!-- bkit:managed vX.Y.Z … -->` (markdown), `# <!-- bkit:managed vX.Y.Z … -->` (shell, `.gitignore`, `.gitattributes`, `.env.example`, codex TOML), `// bkit:managed vX.Y.Z …` (JS hooks, `.mjs`). The full MIT text and copyright notice travel at `.bkit/LICENSE.md` (`runBkitDocs`). Rendered agents / commands / skills are stamped by `stampManagedVersion`; every other file carries `{{BKIT_MANAGED_MARKER}}` in its source, resolved by `applyTokens`. The stamped version, the `.bkit/version` pin and the staleness check all read `readInstallingVersion()`; a damaged package stops the command instead of stamping a guessed version. The marker sits on the first line inside the `bkit:start` block, or below the first heading of a whole file. `listStampedFiles` (`.bkit/core/engine/install/modules/index.ts`) derives the set from the core templates, the manifest and the rendered mirrors; marker drift on any of them → `bkit check` emits `bkit-managed-stale` (never consumer plans). **Branch-scoped** (`isOnProtectedBranch`): blocker on `main` / `dev` (or PR into them via `GITHUB_BASE_REF`); advisory on feature branches (listed in the checklist, does not block push).
 
diff --git a/docs/capabilities.md b/docs/capabilities.md
index b79cb18f8..5837629c4 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -27,7 +27,7 @@
 > - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `00e258265`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `195a882a9`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -155,8 +155,8 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 00e2582656e3ae13f033200f4c006c17e75bc607 — do not edit
-  n_bkit_core[".bkit/core<br/>2890 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
+  %% Generated by bkit-graphify-rollup.py from 195a882a9cc0dee671a51868bbb1230b696992f9 — do not edit
+  n_bkit_core[".bkit/core<br/>2891 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   nscripts_harvest -->|21| n_bkit_core
   style n_bkit_core stroke:#65a30d,stroke-width:4px,stroke-dasharray:8 4,fill:#ffcc80,color:#1f2328
@@ -180,7 +180,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 00e2582656e3ae13f033200f4c006c17e75bc607 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 195a882a9cc0dee671a51868bbb1230b696992f9 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -262,7 +262,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests["tests<br/>104 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>72 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>73 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>55 symbols · 1 files"]
       end
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index 17a156e23..3ad00da7c 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -119,3 +119,5 @@
 {"schema":3,"ts":1793580704225,"firstTs":1787778000000,"updates":6,"kind":"failure","key":"block-locality-audit-quote-mask-pairs-comment-apostrophe-across-lines","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-failures","model":"claude-opus-5-5"},"references":["docs/audits/202610/testing.md","testing-13","5f5a097cc9e4e6dd44cf46ad74457064a2a798c5"],"category":"tooling","summary":"maskNonExpansions quote mask is not comment-aware (re-observed by the testing audit)","severity":"LOW","description":".bkit/core/engine/audits/workflows/block-locality-audit.test.ts:161 maskNonExpansions still runs a quote-mask regex (:182) with no awareness of # comments, so an apostrophe in a comment pairs with a later quote and blanks real assignments. Still open at 5f5a097c.","remediation":"Make the mask comment-aware, or strip # comment spans before the quote-mask regex.","status":"OPEN"}
 {"schema":3,"ts":1793580704226,"firstTs":1792632974729,"updates":2,"kind":"failure","key":"plan-update-stub-keeps-prior-verdict-header","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-failures","model":"claude-opus-5-5"},"references":["651",".bkit/core/prompts/bkit-plan-update.md",".bkit/core/prompts/bkit-design-update.md",".bkit/core/engine/commands/workflow/steps.ts","docs/plans/202610/logs/651-sops-env-backup/plan-v3-checked.md"],"category":"agentic","severity":"LOW","status":"OPEN","summary":"bkit-plan-update seeds plan-v3-checked.md with the prior verdict header still in the body","description":".bkit/core/prompts/bkit-plan-update.md:78 runs `bkit steps stub` without `--strip-header`. The same prompt serves plan-apply-review (v1 has no header, so nothing leaks) and plan-apply-scope (v2 carries its own `Verdict:` + `<!-- verdict:end -->` header). On the apply-scope pass the stub writes the new PENDING header on top of the full v2 text, so v3 holds two headers: the stale `Verdict: CONCERNS` line and a second verdict:end marker sit below the real header and flow into the canonical plan via `workflows promote` (which copies headers as-is). Hit on 651-sops-env-backup: stub emitted `stripped:false`; the stale header was removed by hand with Edit. bkit-design-update.md:57 has the same stub call shape.","rootCause":"The stub call in bkit-plan-update.md (and bkit-design-update.md) omits `--strip-header`, which bkit-design-organise.md:55 passes; `steps stub` keeps the prior header by default (.bkit/core/engine/commands/workflow/steps.ts:1770-1773).","remediation":"Pass `--strip-header` in the stub command of .bkit/core/prompts/bkit-plan-update.md (and bkit-design-update.md if its prior versions carry headers); stripHeader is a no-op guard needed only when the prior file has a verdict:end line, so check that it leaves a header-less v1 intact before switching; update .bkit/prompts.md in the same change and run bkit install for mirrors."}
 {"schema":3,"ts":1793581080719,"firstTs":1792238860082,"updates":3,"kind":"failure","key":"audit-dead-code-readme-pngs-unread","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["docs/audits/202610/dead-code.md","dead-code-6","docs/audits/202611/failures.md","failures-9","816"],"category":"docs","summary":"Themed README PNGs are wanted: social media cannot use the SVG twins","severity":"MEDIUM","description":"Refuted by the owner on #816 (closed not planned): the .github/assets/bkit-*-{dark,light}.png files that scripts/readme/readme-art.mjs:2615-2621 writes beside each .svg are kept because social media cannot use SVG. They are not dead output.","status":"CLOSED"}
+{"schema":3,"ts":1793587536230,"firstTs":1793090478986,"updates":5,"kind":"failure","key":"instructions-corpus-store-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":["715","instructions-retired-clause-timeout-under-full-gate","814","719"],"category":"testing","summary":"instructions.test.ts \"the corpus matches the instructions store > has no findings\" timed out at 60s under the full gate, passed in isolation","severity":"LOW","description":"Seen again 2026-11-01 on feat/715-retire-lite-workflows after its rebase onto dev: `pnpm bkit:gate:static-unit-integration` (unit stage) reported `Test timed out in 60000ms` for the case after 93815ms. Run alone with cli-doc.test.ts it passed (103/103, 54.0s wall). Seen again 2026-11-02 on feat/719-cloud-variants-add at the group-1 gate (`pnpm bkit:gate:static-unit`), in three of four runs, with load average 24-33 on 10 cores: \"has no findings\" timed out (115s in the last run). Re-run alone, instructions.test.ts passed 96/96; with json-parse-owner.test.ts the pair passed 100/100 in 67s. `pnpm instructions:sync` rewrote nothing and the branch left the store and corpus unchanged.","rootCause":"the corpus-versus-store comparison walks the whole agent-read corpus and takes near its 60s budget in-repo; under a heavily loaded full parallel gate it exceeds it, while the store and corpus are unchanged and green","remediation":"give the corpus-comparison case an explicit longer per-test timeout, or reduce the corpus walk the gate performs","status":"TRIAGED"}
+{"schema":3,"ts":1793587536231,"firstTs":1793496030566,"updates":3,"kind":"failure","key":"json-parse-owner-audit-timeout-under-load","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":["715","instructions-corpus-store-timeout-under-full-gate","814","719"],"category":"testing","summary":"json-parse-owner.test.ts \"no engine source parses JSON inside its own try\" timed out at 60s under the full gate, passed in isolation","severity":"LOW","description":"Seen 2026-11-01 on feat/715-retire-lite-workflows in `pnpm bkit:gate:static-unit-integration`, load average 28-40 on 10 cores: the case reported 60263ms and `Test timed out in 60000ms`. Run alone with disk.test.ts, both files passed 39/39 in 7.2s wall. Seen again 2026-11-02 on feat/719-cloud-variants-add in two of four group-1 gate runs (`pnpm bkit:gate:static-unit`), load average 24-33 on 10 cores: timed out at 60s. Re-run alone with instructions.test.ts the pair passed 100/100 in 67s; the branch left the audited sources unchanged.","rootCause":"the audit parses every engine source and runs near its 60s budget only when the machine is heavily loaded","remediation":"give the whole-tree audit case an explicit longer per-test timeout, or narrow the files it parses","status":"TRIAGED"}
