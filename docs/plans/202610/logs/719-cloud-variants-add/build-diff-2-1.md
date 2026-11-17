diff --git a/.bkit/core/.claude/hooks/bkit-preflight.sh b/.bkit/core/.claude/hooks/bkit-preflight.sh
index f03b81eda..226cadfff 100755
--- a/.bkit/core/.claude/hooks/bkit-preflight.sh
+++ b/.bkit/core/.claude/hooks/bkit-preflight.sh
@@ -1,12 +1,12 @@
 #!/usr/bin/env bash
 # bkit-preflight.sh — Claude Code SessionStart hook
 #
-# Validates Linear issue state before any background/cloud session does bkit
+# Validates tracker issue state before any issue-carrying session does bkit
 # work. Refuses the session if the issue isn't approved for automation.
 #
-# Trigger:  LINEAR_ISSUE_ID env var present (proxy for non-IDE session).
-# Guards:   `bkit:auto` label present; issue state not in {Cancelled, Done}.
-# Setup:    See `.bkit/README.md` § Linear setup.
+# Trigger:  LINEAR_ISSUE_ID or GITHUB_ISSUE_ID env var present.
+# Guards:   `bkit:auto` label present; issue state not terminal by category.
+# Setup:    See `.bkit/README.md` for the configured tracker.
 #
 # IMPORTANT — Claude Code SessionStart hooks CANNOT block the session: any
 # non-zero exit is treated as non-blocking (docs.claude.com/docs/en/hooks.md).
@@ -14,7 +14,7 @@
 # HARD STOP instruction) AND `stderr` (visible to the user). Exit code is
 # informational only.
 #
-# bkit generates the managed block at install: the Linear guard and the rules-read
+# bkit generates the managed block at install: the tracker guard and the rules-read
 # advisory are shared with the Cursor hook (bkit's `hooks/preflight-tracker.sh` and
 # `hooks/preflight-rules.sh`); the trigger, the brew check and the output shape below
 # are Claude's own.
@@ -32,7 +32,7 @@ INPUT=$(cat)
 # emit_context — Claude SessionStart expects ONE JSON document
 # { hookSpecificOutput: { hookEventName, additionalContext } } on stdout. Each call
 # accumulates its string; the EXIT trap writes the document once, so the advisory and
-# the Linear guard result ride one document (two documents are unparseable).
+# the tracker guard result ride one document (two documents are unparseable).
 # (Cursor variant: emits { additional_context: ... } directly.)
 BKIT_CONTEXT=""
 emit_context() {
@@ -52,7 +52,7 @@ bkit_json_escape() {
   s=${s//$'\t'/\\t}
   # The rest of the C0 range (U+0000–U+001F) — bash cannot hold NUL, so 1–31 minus the
   # three above. A raw control byte makes the whole document unparseable and the host
-  # discards it, taking the advisory and the Linear guard result with it.
+  # discards it, taking the advisory and the tracker guard result with it.
   for (( i = 1; i < 32; i++ )); do
     case $i in 9 | 10 | 13) continue ;; esac
     printf -v oct '%03o' "$i"
@@ -74,9 +74,9 @@ trap bkit_write_document EXIT
 # {{BKIT_PART preflight-rules.sh}}
 
 # IDE session detection — the advisory above already fired; nothing else runs here.
-# Claude has no native is-background flag, so we use empty LINEAR_ISSUE_ID as the proxy.
+# Claude has no native is-background flag, so we use the issue env vars as the proxy.
 # (Cursor variant: parses `is_background_agent` from stdin JSON.)
-if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
+if [[ -z "${LINEAR_ISSUE_ID:-}" && -z "${GITHUB_ISSUE_ID:-}" ]]; then
   exit 0
 fi
 
diff --git a/.bkit/core/.cursor/hooks/bkit-preflight.sh b/.bkit/core/.cursor/hooks/bkit-preflight.sh
index 7b6f8d1a8..ce9b0a6c0 100755
--- a/.bkit/core/.cursor/hooks/bkit-preflight.sh
+++ b/.bkit/core/.cursor/hooks/bkit-preflight.sh
@@ -1,18 +1,18 @@
 #!/usr/bin/env bash
 # bkit-preflight.sh — Cursor Cloud sessionStart hook (failClosed: true)
 #
-# Validates Linear issue state before any background/cloud session does bkit
+# Validates tracker issue state before any background/cloud session does bkit
 # work. Refuses the session if the issue isn't approved for automation.
 #
 # Trigger:  is_background_agent === true (received via stdin JSON).
-# Guards:   `bkit:auto` label present; issue state not in {Cancelled, Done}.
-# Setup:    See `.bkit/README.md` § Linear setup.
+# Guards:   `bkit:auto` label present; issue state not terminal by category.
+# Setup:    See `.bkit/README.md` for the configured tracker.
 #
 # Cursor honours non-zero exit as a hard stop (failClosed: true) — non-zero
 # blocks the session before the agent starts. Failures are also surfaced via
 # `additional_context` so the user sees the reason.
 #
-# bkit generates the managed block at install: the Linear guard and the rules-read
+# bkit generates the managed block at install: the tracker guard and the rules-read
 # advisory are shared with the Claude hook (bkit's `hooks/preflight-tracker.sh` and
 # `hooks/preflight-rules.sh`); the trigger, the runtime marker and the output shape
 # below are Cursor's own.
@@ -29,7 +29,7 @@ INPUT=$(cat)
 
 # emit_context — Cursor sessionStart expects ONE JSON document { additional_context: ... }
 # on stdout. Each call accumulates its string; the EXIT trap writes the document once, so
-# the advisory and the Linear guard result ride one document. Defined above the bail so an
+# the advisory and the tracker guard result ride one document. Defined above the bail so an
 # IDE session gets the advisory too, and built with no python3: failClosed:true blocks the
 # session on a non-zero exit, and an IDE session may not have python3 at all.
 # (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
@@ -73,7 +73,7 @@ trap bkit_write_document EXIT
 # IDE session bailout — grep only, no python3 on the skip path (failClosed:true in
 # .cursor/hooks.json blocks the session if this exits non-zero). Background-agent
 # sessions run inside the bkit Dockerfile, where python3 is present for the code below.
-# (Claude variant: uses empty LINEAR_ISSUE_ID env var as the proxy.)
+# (Claude variant: uses the issue env vars as the proxy.)
 if ! printf '%s' "$INPUT" | grep -q '"is_background_agent"[[:space:]]*:[[:space:]]*true'; then
   exit 0
 fi
diff --git a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
index 16d8f8a9b..7a6447fdf 100644
--- a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
@@ -1,6 +1,6 @@
 // audits/hooks/preflight-sh.integration.test.ts — SessionStart hook (preflight.sh)
 // runtime behaviour. Spawns the hook as install generates it (the host template with
-// the shared Linear guard spliced in) as a bash child process, plus one source-level
+// the shared tracker guard spliced in) as a bash child process, plus one source-level
 // (no-subprocess) check of the Claude hook.
 //
 // The Claude hook runs as a Claude SessionStart hook, the Cursor one as a Cursor Cloud
@@ -9,9 +9,8 @@
 //     carrying the rules-read advisory, built without python3.
 //   - Missing BKIT_LINEAR_API_KEY / LINEAR_ISSUE_ID hard-stop, in each host's own
 //     output shape, with the advisory riding the same one JSON document.
-//   - Neither hook calls bkit: both run with no node_modules at all.
-//   - Jira has no preflight guard: a Jira session passes through, and neither hook
-//     reads the Jira token or calls Atlassian.
+//   - Jira sessions read issue facts through bkit, with missing binaries and failed
+//     reads stopping the session; the hook never calls Atlassian directly.
 
 import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
@@ -36,7 +35,7 @@ function runPreflight(
   hook: string,
   env: Record<string, string | undefined>,
   input = "{}",
-  opts: { path?: string; cwd?: string } = {},
+  opts: { path?: string; cwd?: string; timeout?: number } = {},
 ): { status: number | null; stdout: string; stderr: string } {
   // Strip undefined keys so we don't leak the parent process env back in.
   const cleanEnv: Record<string, string> = {};
@@ -49,7 +48,7 @@ function runPreflight(
     env: { PATH: opts.path ?? process.env.PATH ?? "", ...cleanEnv },
     input,
     encoding: "utf-8",
-    timeout: 10_000,
+    timeout: opts.timeout ?? 10_000,
   });
   return {
     status: result.status,
@@ -112,7 +111,7 @@ describe("BAR-186 — Claude SessionStart preflight.sh runtime behaviour", () =>
   });
 });
 
-describe("Claude SessionStart preflight.sh — no Jira guard", () => {
+describe("Claude SessionStart preflight.sh — Jira session without an issue", () => {
   it("a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0", () => {
     const result = runPreflight(CLAUDE_HOOK, { BKIT_JIRA_API_KEY: "t" });
     expect(result.status).toBe(0);
@@ -139,7 +138,9 @@ describe("Cursor sessionStart preflight.sh runtime behaviour", () => {
   });
 
   it("a background agent without BKIT_LINEAR_API_KEY hard-stops in Cursor's shape", () => {
-    const result = runPreflight(CURSOR_HOOK, {}, '{"is_background_agent": true}');
+    const result = runPreflight(CURSOR_HOOK, {}, '{"is_background_agent": true}', {
+      cwd: fixtureRepo("linear"),
+    });
     expect(result.status).toBe(1);
     expect(result.stderr).toContain("BKIT_LINEAR_API_KEY not set");
     expect(JSON.parse(result.stdout).additional_context).toContain("HARD STOP");
@@ -150,6 +151,7 @@ describe("Cursor sessionStart preflight.sh runtime behaviour", () => {
       CURSOR_HOOK,
       { BKIT_LINEAR_API_KEY: "k" },
       '{"is_background_agent": true}',
+      { cwd: fixtureRepo("linear") },
     );
     expect(result.status).toBe(1);
     expect(result.stderr).toContain("LINEAR_ISSUE_ID not set");
@@ -240,13 +242,13 @@ describe("BAR-186 — SessionStart preflight.sh source-level checks", () => {
 const BACKGROUND = '{"is_background_agent": true}';
 
 /** A fixture consumer repo on `feat/12-thing`, its tracker set in package.json. */
-function fixtureRepo(tracker: string): string {
+function fixtureRepo(tracker: string | undefined, branch = "feat/12-thing"): string {
   const cwd = fs.mkdtempSync(path.join(GENERATED, "repo-"));
-  spawnSync("git", ["init", "-q", "-b", "feat/12-thing"], { cwd });
+  spawnSync("git", ["init", "-q", "-b", branch], { cwd });
   spawnSync("git", ["remote", "add", "origin", "https://github.com/o/r.git"], { cwd });
   fs.writeFileSync(
     path.join(cwd, "package.json"),
-    JSON.stringify({ bkit: { tracker: { default: tracker } } }),
+    JSON.stringify(tracker ? { bkit: { tracker: { default: tracker } } } : {}),
   );
   return cwd;
 }
@@ -270,6 +272,42 @@ function curlStub(body: string, exit = 0): string {
 const githubIssue = (state: string, labels: string[]) =>
   JSON.stringify({ state, labels: labels.map((name) => ({ name })) });
 
+function jiraFixture(
+  terminal: boolean,
+  labels = ["bkit:auto"],
+  failure?: "auth" | "timeout",
+): { cwd: string; env: Record<string, string>; calls: string } {
+  const cwd = fixtureRepo("jira", "feat/ab2-12-thing");
+  const bin = path.join(cwd, "node_modules", ".bin");
+  fs.mkdirSync(bin, { recursive: true });
+  fs.symlinkSync(path.resolve("tests/fixtures/gh/bin/gh"), path.join(bin, "bkit"));
+  const calls = path.join(cwd, "fetch-args");
+  const body = path.join(cwd, "fetch-body.sh");
+  const reply = path.join(cwd, "fetch-reply.json");
+  fs.writeFileSync(
+    reply,
+    JSON.stringify(
+      failure === "auth"
+        ? { reason: "auth" }
+        : {
+            title: "Fixture issue",
+            url: "https://example.atlassian.net/browse/AB2-12",
+            state: terminal ? "Shipped" : "In progress",
+            labels,
+            terminal,
+            files: {},
+          },
+    ),
+  );
+  fs.writeFileSync(
+    body,
+    `printf '%s\\n' "$@" > '${calls}'\n` +
+      (failure === "timeout" ? "sleep 21\n" : `cat '${reply}'\n`) +
+      `exit ${failure === "auth" ? 80 : 0}\n`,
+  );
+  return { cwd, env: { BKIT_FAKE_TOOL_SCRIPT: body }, calls };
+}
+
 /** The one JSON document on stdout, parsed; fails the case when there are more lines. */
 function onlyDocument(stdout: string): string {
   expect(stdout.trim().split("\n")).toHaveLength(1);
@@ -344,6 +382,115 @@ describe("preflight-tracker.sh — Linear tracker by state category", () => {
   });
 });
 
+describe("preflight-tracker.sh — Jira and session issue sources", () => {
+  it("jira terminal issue stops the Cursor background session", () => {
+    const terminal = jiraFixture(true);
+    const stopped = runPreflight(CURSOR_HOOK, terminal.env, BACKGROUND, {
+      cwd: terminal.cwd,
+    });
+    expect(stopped.status).toBe(1);
+    const context = onlyDocument(stopped.stdout);
+    expect(context).toContain("HARD STOP");
+    expect(context).toMatch(/Jira/i);
+    expect(context).toMatch(/terminal|finished|Shipped/i);
+    expect(context).not.toContain('"terminal"');
+    const args = fs.readFileSync(terminal.calls, "utf-8").trim().split("\n");
+    expect(args.slice(0, 2)).toEqual(["issues", "fetch"]);
+    expect(args.join(" ")).toMatch(/--issue(?:=| )AB2-12(?: |$)/);
+    expect(args.join(" ")).toMatch(/--outbox(?:=| )\S+/);
+    expect(args).toContain("--json");
+
+    const open = jiraFixture(false);
+    const passed = runPreflight(CURSOR_HOOK, open.env, BACKGROUND, { cwd: open.cwd });
+    expect(passed.status).toBe(0);
+    expect(onlyDocument(passed.stdout)).toContain("PASS");
+
+    const unlabelled = jiraFixture(false, []);
+    const optedOut = runPreflight(CURSOR_HOOK, unlabelled.env, BACKGROUND, {
+      cwd: unlabelled.cwd,
+    });
+    expect(optedOut.status).toBe(1);
+    expect(onlyDocument(optedOut.stdout)).toContain("bkit:auto");
+  });
+
+  it("jira session without node_modules/.bin/bkit stops naming the missing bin", () => {
+    const result = runPreflight(CURSOR_HOOK, {}, BACKGROUND, {
+      cwd: fixtureRepo("jira", "feat/ab2-12-thing"),
+    });
+    expect(result.status).toBe(1);
+    const context = onlyDocument(result.stdout);
+    expect(context).toContain("HARD STOP");
+    expect(context).toMatch(/Jira/i);
+    expect(context).toContain("node_modules/.bin/bkit");
+    expect(context).toMatch(/missing|absent|not (?:found|installed|available)/i);
+  });
+
+  it("jira fetch %s stops the session naming the tracker and the reason", () => {
+    for (const [reason, message] of [
+      ["auth", /auth/i],
+      ["timeout", /timeout|timed out/i],
+    ] as const) {
+      const fixture = jiraFixture(false, ["bkit:auto"], reason);
+      const result = runPreflight(CURSOR_HOOK, fixture.env, BACKGROUND, {
+        cwd: fixture.cwd,
+        timeout: 25_000,
+      });
+      expect(result.status, reason).toBe(1);
+      const context = onlyDocument(result.stdout);
+      expect(context, reason).toContain("HARD STOP");
+      expect(context, reason).toMatch(/Jira/i);
+      expect(context, reason).toMatch(message);
+      expect(fs.existsSync(fixture.calls), reason).toBe(true);
+    }
+  }, 30_000);
+
+  it("%s session with no issue id records bkit:auto not verified and exits 0", () => {
+    for (const tracker of ["github", "jira"]) {
+      const result = runPreflight(CURSOR_HOOK, {}, BACKGROUND, {
+        cwd: fixtureRepo(tracker, "work/session"),
+      });
+      expect(result.status, tracker).toBe(0);
+      const context = onlyDocument(result.stdout);
+      expect(context, tracker).toContain(
+        "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified",
+      );
+      expect(context, tracker).toContain(".agents/rules.md");
+      expect(context, tracker).not.toContain("HARD STOP");
+      expect(result.stderr, tracker).toBe("");
+    }
+  });
+
+  it("Claude session carrying GITHUB_ISSUE_ID runs the tracker guard", () => {
+    const result = runPreflight(
+      CLAUDE_HOOK,
+      { GITHUB_ISSUE_ID: "12", BKIT_GH_TOKEN: "fixture-token" },
+      "{}",
+      {
+        cwd: fixtureRepo("github", "work/session"),
+        path: curlStub(githubIssue("open", [])),
+      },
+    );
+    expect(result.status).toBe(1);
+    const context = onlyDocument(result.stdout);
+    expect(context).toContain("HARD STOP");
+    expect(context).toContain("bkit:auto");
+    expect(context).toContain(".agents/rules.md");
+  });
+
+  it("unset tracker without LINEAR_ISSUE_ID adds advisory context and exits 0", () => {
+    for (const tracker of [undefined, "none"]) {
+      const result = runPreflight(CURSOR_HOOK, {}, BACKGROUND, {
+        cwd: fixtureRepo(tracker),
+      });
+      expect(result.status, String(tracker)).toBe(0);
+      const context = onlyDocument(result.stdout);
+      expect(context).toContain(".agents/rules.md");
+      expect(context).not.toContain("HARD STOP");
+      expect(result.stderr).toBe("");
+    }
+  });
+});
+
 describe("preflight-tracker.sh — one shared part", () => {
   it("generated Claude and Cursor hooks carry the one preflight-tracker.sh part", () => {
     const part = path.join(HOOK_SOURCES, "hooks", "preflight-tracker.sh");
diff --git a/.bkit/core/hooks/preflight-tracker.sh b/.bkit/core/hooks/preflight-tracker.sh
index b780e9993..9035f8424 100644
--- a/.bkit/core/hooks/preflight-tracker.sh
+++ b/.bkit/core/hooks/preflight-tracker.sh
@@ -1,8 +1,8 @@
 # --- Tracker guard: identical in the Claude and Cursor preflight hooks (bkit renders it
-# from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
+# from one source). Uses bash + python3 + curl, and bkit for Jira. Needs `emit_context`,
 # which the host's code above defines in that host's output shape. Dispatches on
-# `bkit.tracker.default` in the repo's package.json (unreadable -> linear, the original
-# guard). Passes only on a readable issue that carries `bkit:auto` and is not finished by
+# `bkit.tracker.default` in the repo's package.json. An unset tracker uses Linear only
+# when LINEAR_ISSUE_ID is present. Passes on a readable issue carrying `bkit:auto` that is not finished by
 # the tracker's state category; any unreadable answer is a HARD STOP naming tracker + reason.
 
 CURL_LIMITS=(--connect-timeout 5 --max-time 15)
@@ -19,27 +19,36 @@ BKIT_GUARD_TRACKER=$(ROOT="$BKIT_GUARD_ROOT" python3 -c '
 import json, os
 try:
     with open(os.path.join(os.environ["ROOT"], "package.json")) as f:
-        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "linear")
+        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "none")
 except Exception:
-    print("linear")
-' 2>/dev/null || echo linear)
+    print("none")
+' 2>/dev/null || echo none)
+
+if [[ "$BKIT_GUARD_TRACKER" == "none" ]]; then
+  if [[ -n "${LINEAR_ISSUE_ID:-}" ]]; then
+    BKIT_GUARD_TRACKER="linear"
+  else
+    exit 0
+  fi
+fi
 
 case "$BKIT_GUARD_TRACKER" in
   github)
-    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
-    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
-      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
-      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
-      exit 1
-    fi
     # Issue id: GITHUB_ISSUE_ID, else the leading digits of the `feat/{FID}` branch.
     GH_ISSUE="${GITHUB_ISSUE_ID:-}"
     if [[ -z "$GH_ISSUE" ]]; then
-      GH_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
+      GH_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
       if [[ "$GH_BRANCH" =~ ^feat/([0-9]+) ]]; then GH_ISSUE="${BASH_REMATCH[1]}"; fi
     fi
     if [[ -z "$GH_ISSUE" ]]; then
-      bkit_guard_fail "GitHub" "(unknown)" "no issue id (GITHUB_ISSUE_ID unset and the branch is not feat/{number}-...)"
+      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
+      exit 0
+    fi
+    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
+    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
+      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
+      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
+      exit 1
     fi
     GH_REMOTE=$(git remote get-url origin 2>/dev/null || true)
     GH_REPO=$(printf '%s' "$GH_REMOTE" | sed -E 's#^(https://([^@/]*@)?|ssh://git@|git@)github\.com[:/]##; s#\.git$##')
@@ -123,8 +132,61 @@ else:
     TERMINAL="false"
     [[ "$STATE_TYPE" == "completed" || "$STATE_TYPE" == "canceled" ]] && TERMINAL="true"
     ;;
+  jira)
+    JIRA_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
+    JIRA_ISSUE=""
+    if [[ "$JIRA_BRANCH" =~ ^feat/([A-Za-z][A-Za-z0-9]*-[0-9]+)(-|$) ]]; then
+      JIRA_ISSUE=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:lower:]' '[:upper:]')
+    fi
+    if [[ -z "$JIRA_ISSUE" ]]; then
+      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
+      exit 0
+    fi
+    BKIT_JIRA_BIN="$BKIT_GUARD_ROOT/node_modules/.bin/bkit"
+    if [[ ! -x "$BKIT_JIRA_BIN" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "node_modules/.bin/bkit is missing or not executable"
+    fi
+    BKIT_JIRA_TMPDIR=$(mktemp -d "${TMPDIR:-/tmp}/bkit-guard.XXXXXX") \
+      || bkit_guard_fail "Jira" "$JIRA_ISSUE" "could not create a temporary issue outbox"
+    JIRA_FETCH=("$BKIT_JIRA_BIN" issues fetch --issue "$JIRA_ISSUE" --outbox "$BKIT_JIRA_TMPDIR" --json)
+    if command -v timeout >/dev/null 2>&1; then
+      JIRA_FETCH=(timeout 20 "${JIRA_FETCH[@]}")
+    fi
+    JIRA_STATUS=0
+    JIRA_RESPONSE=$("${JIRA_FETCH[@]}" 2>/dev/null) || JIRA_STATUS=$?
+    rm -rf -- "$BKIT_JIRA_TMPDIR"
+    if [[ "$JIRA_STATUS" == "124" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch timed out"
+    fi
+    if [[ "$JIRA_STATUS" != "0" ]]; then
+      JIRA_REASON=$(RESPONSE="$JIRA_RESPONSE" python3 -c '
+import json, os
+try:
+    reason = json.loads(os.environ["RESPONSE"]).get("reason")
+    print(reason if reason in {"auth", "network", "not-found", "unavailable"} else "unreadable reply")
+except Exception:
+    print("unreadable reply")
+')
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch failed (exit ${JIRA_STATUS}, ${JIRA_REASON})"
+    fi
+    IFS=$'\t' read -r ISSUE_STATE TERMINAL LABELS < <(RESPONSE="$JIRA_RESPONSE" python3 -c '
+import json, os
+try:
+    d = json.loads(os.environ["RESPONSE"])
+    state, terminal, labels = d["state"], d["terminal"], d["labels"]
+    if not isinstance(state, str) or not state or not isinstance(terminal, bool) or not isinstance(labels, list) or not all(isinstance(label, str) for label in labels):
+        raise ValueError("invalid issue facts")
+    print(state + "\t" + str(terminal).lower() + "\t" + (",".join(labels) or "-"))
+except Exception:
+    print("UNKNOWN\t-\t-")
+')
+    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch answer could not be read"
+    fi
+    ISSUE_ID_DISPLAY="$JIRA_ISSUE"
+    TRACKER_NAME="Jira"
+    ;;
   *)
-    # Jira and tracker none: no guard here.
     exit 0
     ;;
 esac
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 9ccb0a3bd..d65db3a82 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -76,3 +76,4 @@
 {"schema":3,"ts":1793587252363,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"90c5e692e71146c42305c59cbd12a8320c048336"},"recurrenceCount":2,"lastConfirmed":1793587252363}
 {"schema":3,"ts":1793589173762,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"90c5e692e71146c42305c59cbd12a8320c048336"},"recurrenceCount":3,"lastConfirmed":1793589173762}
 {"schema":3,"ts":1793862612535,"kind":"friction","key":"build-719-resume-rebase-manual-recovery","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-worktree-setup"},"references":["docs/plans/202610/logs/719-cloud-variants-add/status.jsonl"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"Resume rebase required explicit owner-authorized conflict resolution","description":"The engine refused skills-lock.json and then providers documentation; its generated untracked recovery log also blocked abort. The failure handler succeeded after preserving the log. On explicit owner instruction to solve conflicts and continue, manual resolutions preserved current skills plus Vitest, current provider names plus the tracker guard, and current generated records and graphs. The rebase completed and worktrees setup passed.","remediation":"Preserved the failed attempt artifacts outside the worktree, completed manual rebase recovery, and restarted the build workflow.","source":"orchestrator","status":"CLOSED"}
+{"schema":3,"ts":1793863389368,"kind":"friction","key":"build-719-skills-content-mismatch-rework","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-install-skills"},"references":["docs/plans/202610/logs/719-cloud-variants-add/build-install-skills.md"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"A discovered Node.js skill required removal after content review","description":"The skills installer selected mcollina/skills nodejs-core from discovery metadata, then found its instructions focused on Node core C++ development rather than this TypeScript CLI. It removed the unsuitable installation and retained four matching skills.","remediation":"Reviewed skill content, removed the mismatch, and verified retained installs and host discovery.","source":"orchestrator","status":"CLOSED"}
diff --git a/.bkit/version b/.bkit/version
index 1e22fdb11..11b7db0c6 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -18,7 +18,7 @@
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
     "docs/security.md": "ccf6c376c8a347972a335a43232f3d5db49acb9d0c9083f6c52c73de3013cb10",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "26fc0be395978a806ebc35fc85d3fb4e26297ebdb58115117efccb38c5b6dccb",
+    "docs/architecture.md": "37439a080956614ce27340c3e262b45933d64313adaafc6c142d337b9767b5cb",
     "docs/technology.md": "8111c0a3262df6f8eeedb3fbe83559ec8ce23c847a593b98cc83f9e24eca128e",
     ".bkit/.env.example": "817fa9ffb183f34a004f824a5d58416cc7ed1f336218024262dd7ada68c44641",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
@@ -229,12 +229,12 @@
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
     ".claude/hooks/bkit-guardrails.cjs": "5cdf3dc7a58a15280d70b9241b02b07eccd346063589ebebf235ebc74c5222ad",
-    ".claude/hooks/bkit-preflight.sh": "7df0e67d13c58242de82a537e2fd199ad7b4a3945e1c0c70f7ef3187671ec5b7",
+    ".claude/hooks/bkit-preflight.sh": "44d8cb78d79837e376f5c68aa394d79faa026ee6d0fa861838534f5fc3bb0741",
     ".codex/hooks/bkit-gateguard.cjs": "157502c7370e7a00e0cb2727f9efaeb65581c36b001cd450393dad98d1f180ff",
     ".codex/hooks/bkit-guardrails.cjs": "d5823a109b64d44682a91ef88cc263d9ca4f82385e1b2cf3547711198c1eeb43",
     ".cursor/hooks/bkit-gateguard.cjs": "f48b778f3c8e5af5e55cc5d84a4a4b125b208b50f39ca409d23cb014924cfcf4",
     ".cursor/hooks/bkit-guardrails.cjs": "8d14809ab0b85cb8f00934cc325824e87df3c534916bc3f470844db603d2c8cc",
-    ".cursor/hooks/bkit-preflight.sh": "2afc29492bd25942789a3fc0b2e54ecf02285547369823e89da8b1b8be4f3174",
+    ".cursor/hooks/bkit-preflight.sh": "111b1d27138318fbd19b4d16d11f559af8be27c1aa324c7711b3efede0853a81",
     ".opencode/plugin/bkit-gateguard.js": "c7c0f7980b05abf6dbdfb26d53f6e33b8342f181d18d8f8494a4e81d2ba9c74c",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
     "GEMINI.md": "29a57ff0a56385c4d9b36032fb5be4e42e34ad6992d0b4a4ed105423211cda64",
diff --git a/.claude/hooks/bkit-preflight.sh b/.claude/hooks/bkit-preflight.sh
index 2199b0b13..dac12161c 100755
--- a/.claude/hooks/bkit-preflight.sh
+++ b/.claude/hooks/bkit-preflight.sh
@@ -31,7 +31,7 @@ INPUT=$(cat)
 # emit_context — Claude SessionStart expects ONE JSON document
 # { hookSpecificOutput: { hookEventName, additionalContext } } on stdout. Each call
 # accumulates its string; the EXIT trap writes the document once, so the advisory and
-# the Linear guard result ride one document (two documents are unparseable).
+# the tracker guard result ride one document (two documents are unparseable).
 # (Cursor variant: emits { additional_context: ... } directly.)
 BKIT_CONTEXT=""
 emit_context() {
@@ -51,7 +51,7 @@ bkit_json_escape() {
   s=${s//$'\t'/\\t}
   # The rest of the C0 range (U+0000–U+001F) — bash cannot hold NUL, so 1–31 minus the
   # three above. A raw control byte makes the whole document unparseable and the host
-  # discards it, taking the advisory and the Linear guard result with it.
+  # discards it, taking the advisory and the tracker guard result with it.
   for (( i = 1; i < 32; i++ )); do
     case $i in 9 | 10 | 13) continue ;; esac
     printf -v oct '%03o' "$i"
@@ -80,9 +80,9 @@ BKIT_RULES_ADVISORY='[bkit] Required reading before any other action: read `.age
 emit_context "$BKIT_RULES_ADVISORY"
 
 # IDE session detection — the advisory above already fired; nothing else runs here.
-# Claude has no native is-background flag, so we use empty LINEAR_ISSUE_ID as the proxy.
+# Claude has no native is-background flag, so we use the issue env vars as the proxy.
 # (Cursor variant: parses `is_background_agent` from stdin JSON.)
-if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
+if [[ -z "${LINEAR_ISSUE_ID:-}" && -z "${GITHUB_ISSUE_ID:-}" ]]; then
   exit 0
 fi
 
@@ -107,10 +107,10 @@ if [[ "$(uname)" == "Darwin" ]]; then
 fi
 
 # --- Tracker guard: identical in the Claude and Cursor preflight hooks (bkit renders it
-# from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
+# from one source). Uses bash + python3 + curl, and bkit for Jira. Needs `emit_context`,
 # which the host's code above defines in that host's output shape. Dispatches on
-# `bkit.tracker.default` in the repo's package.json (unreadable -> linear, the original
-# guard). Passes only on a readable issue that carries `bkit:auto` and is not finished by
+# `bkit.tracker.default` in the repo's package.json. An unset tracker uses Linear only
+# when LINEAR_ISSUE_ID is present. Passes on a readable issue carrying `bkit:auto` that is not finished by
 # the tracker's state category; any unreadable answer is a HARD STOP naming tracker + reason.
 
 CURL_LIMITS=(--connect-timeout 5 --max-time 15)
@@ -127,27 +127,36 @@ BKIT_GUARD_TRACKER=$(ROOT="$BKIT_GUARD_ROOT" python3 -c '
 import json, os
 try:
     with open(os.path.join(os.environ["ROOT"], "package.json")) as f:
-        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "linear")
+        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "none")
 except Exception:
-    print("linear")
-' 2>/dev/null || echo linear)
+    print("none")
+' 2>/dev/null || echo none)
+
+if [[ "$BKIT_GUARD_TRACKER" == "none" ]]; then
+  if [[ -n "${LINEAR_ISSUE_ID:-}" ]]; then
+    BKIT_GUARD_TRACKER="linear"
+  else
+    exit 0
+  fi
+fi
 
 case "$BKIT_GUARD_TRACKER" in
   github)
-    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
-    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
-      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
-      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
-      exit 1
-    fi
     # Issue id: GITHUB_ISSUE_ID, else the leading digits of the `feat/{FID}` branch.
     GH_ISSUE="${GITHUB_ISSUE_ID:-}"
     if [[ -z "$GH_ISSUE" ]]; then
-      GH_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
+      GH_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
       if [[ "$GH_BRANCH" =~ ^feat/([0-9]+) ]]; then GH_ISSUE="${BASH_REMATCH[1]}"; fi
     fi
     if [[ -z "$GH_ISSUE" ]]; then
-      bkit_guard_fail "GitHub" "(unknown)" "no issue id (GITHUB_ISSUE_ID unset and the branch is not feat/{number}-...)"
+      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
+      exit 0
+    fi
+    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
+    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
+      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
+      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
+      exit 1
     fi
     GH_REMOTE=$(git remote get-url origin 2>/dev/null || true)
     GH_REPO=$(printf '%s' "$GH_REMOTE" | sed -E 's#^(https://([^@/]*@)?|ssh://git@|git@)github\.com[:/]##; s#\.git$##')
@@ -231,8 +240,61 @@ else:
     TERMINAL="false"
     [[ "$STATE_TYPE" == "completed" || "$STATE_TYPE" == "canceled" ]] && TERMINAL="true"
     ;;
+  jira)
+    JIRA_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
+    JIRA_ISSUE=""
+    if [[ "$JIRA_BRANCH" =~ ^feat/([A-Za-z][A-Za-z0-9]*-[0-9]+)(-|$) ]]; then
+      JIRA_ISSUE=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:lower:]' '[:upper:]')
+    fi
+    if [[ -z "$JIRA_ISSUE" ]]; then
+      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
+      exit 0
+    fi
+    BKIT_JIRA_BIN="$BKIT_GUARD_ROOT/node_modules/.bin/bkit"
+    if [[ ! -x "$BKIT_JIRA_BIN" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "node_modules/.bin/bkit is missing or not executable"
+    fi
+    BKIT_JIRA_TMPDIR=$(mktemp -d "${TMPDIR:-/tmp}/bkit-guard.XXXXXX") \
+      || bkit_guard_fail "Jira" "$JIRA_ISSUE" "could not create a temporary issue outbox"
+    JIRA_FETCH=("$BKIT_JIRA_BIN" issues fetch --issue "$JIRA_ISSUE" --outbox "$BKIT_JIRA_TMPDIR" --json)
+    if command -v timeout >/dev/null 2>&1; then
+      JIRA_FETCH=(timeout 20 "${JIRA_FETCH[@]}")
+    fi
+    JIRA_STATUS=0
+    JIRA_RESPONSE=$("${JIRA_FETCH[@]}" 2>/dev/null) || JIRA_STATUS=$?
+    rm -rf -- "$BKIT_JIRA_TMPDIR"
+    if [[ "$JIRA_STATUS" == "124" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch timed out"
+    fi
+    if [[ "$JIRA_STATUS" != "0" ]]; then
+      JIRA_REASON=$(RESPONSE="$JIRA_RESPONSE" python3 -c '
+import json, os
+try:
+    reason = json.loads(os.environ["RESPONSE"]).get("reason")
+    print(reason if reason in {"auth", "network", "not-found", "unavailable"} else "unreadable reply")
+except Exception:
+    print("unreadable reply")
+')
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch failed (exit ${JIRA_STATUS}, ${JIRA_REASON})"
+    fi
+    IFS=$'\t' read -r ISSUE_STATE TERMINAL LABELS < <(RESPONSE="$JIRA_RESPONSE" python3 -c '
+import json, os
+try:
+    d = json.loads(os.environ["RESPONSE"])
+    state, terminal, labels = d["state"], d["terminal"], d["labels"]
+    if not isinstance(state, str) or not state or not isinstance(terminal, bool) or not isinstance(labels, list) or not all(isinstance(label, str) for label in labels):
+        raise ValueError("invalid issue facts")
+    print(state + "\t" + str(terminal).lower() + "\t" + (",".join(labels) or "-"))
+except Exception:
+    print("UNKNOWN\t-\t-")
+')
+    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch answer could not be read"
+    fi
+    ISSUE_ID_DISPLAY="$JIRA_ISSUE"
+    TRACKER_NAME="Jira"
+    ;;
   *)
-    # Jira and tracker none: no guard here.
     exit 0
     ;;
 esac
diff --git a/.cursor/hooks/bkit-preflight.sh b/.cursor/hooks/bkit-preflight.sh
index c5198b13e..643fe3be0 100755
--- a/.cursor/hooks/bkit-preflight.sh
+++ b/.cursor/hooks/bkit-preflight.sh
@@ -28,7 +28,7 @@ INPUT=$(cat)
 
 # emit_context — Cursor sessionStart expects ONE JSON document { additional_context: ... }
 # on stdout. Each call accumulates its string; the EXIT trap writes the document once, so
-# the advisory and the Linear guard result ride one document. Defined above the bail so an
+# the advisory and the tracker guard result ride one document. Defined above the bail so an
 # IDE session gets the advisory too, and built with no python3: failClosed:true blocks the
 # session on a non-zero exit, and an IDE session may not have python3 at all.
 # (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
@@ -79,7 +79,7 @@ emit_context "$BKIT_RULES_ADVISORY"
 # IDE session bailout — grep only, no python3 on the skip path (failClosed:true in
 # .cursor/hooks.json blocks the session if this exits non-zero). Background-agent
 # sessions run inside the bkit Dockerfile, where python3 is present for the code below.
-# (Claude variant: uses empty LINEAR_ISSUE_ID env var as the proxy.)
+# (Claude variant: uses the issue env vars as the proxy.)
 if ! printf '%s' "$INPUT" | grep -q '"is_background_agent"[[:space:]]*:[[:space:]]*true'; then
   exit 0
 fi
@@ -100,10 +100,10 @@ fi
 # (Claude variant: validates required CLIs are on PATH; missing → HARD STOP with brew install hint.)
 
 # --- Tracker guard: identical in the Claude and Cursor preflight hooks (bkit renders it
-# from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
+# from one source). Uses bash + python3 + curl, and bkit for Jira. Needs `emit_context`,
 # which the host's code above defines in that host's output shape. Dispatches on
-# `bkit.tracker.default` in the repo's package.json (unreadable -> linear, the original
-# guard). Passes only on a readable issue that carries `bkit:auto` and is not finished by
+# `bkit.tracker.default` in the repo's package.json. An unset tracker uses Linear only
+# when LINEAR_ISSUE_ID is present. Passes on a readable issue carrying `bkit:auto` that is not finished by
 # the tracker's state category; any unreadable answer is a HARD STOP naming tracker + reason.
 
 CURL_LIMITS=(--connect-timeout 5 --max-time 15)
@@ -120,27 +120,36 @@ BKIT_GUARD_TRACKER=$(ROOT="$BKIT_GUARD_ROOT" python3 -c '
 import json, os
 try:
     with open(os.path.join(os.environ["ROOT"], "package.json")) as f:
-        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "linear")
+        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "none")
 except Exception:
-    print("linear")
-' 2>/dev/null || echo linear)
+    print("none")
+' 2>/dev/null || echo none)
+
+if [[ "$BKIT_GUARD_TRACKER" == "none" ]]; then
+  if [[ -n "${LINEAR_ISSUE_ID:-}" ]]; then
+    BKIT_GUARD_TRACKER="linear"
+  else
+    exit 0
+  fi
+fi
 
 case "$BKIT_GUARD_TRACKER" in
   github)
-    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
-    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
-      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
-      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
-      exit 1
-    fi
     # Issue id: GITHUB_ISSUE_ID, else the leading digits of the `feat/{FID}` branch.
     GH_ISSUE="${GITHUB_ISSUE_ID:-}"
     if [[ -z "$GH_ISSUE" ]]; then
-      GH_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
+      GH_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
       if [[ "$GH_BRANCH" =~ ^feat/([0-9]+) ]]; then GH_ISSUE="${BASH_REMATCH[1]}"; fi
     fi
     if [[ -z "$GH_ISSUE" ]]; then
-      bkit_guard_fail "GitHub" "(unknown)" "no issue id (GITHUB_ISSUE_ID unset and the branch is not feat/{number}-...)"
+      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
+      exit 0
+    fi
+    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
+    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
+      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
+      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
+      exit 1
     fi
     GH_REMOTE=$(git remote get-url origin 2>/dev/null || true)
     GH_REPO=$(printf '%s' "$GH_REMOTE" | sed -E 's#^(https://([^@/]*@)?|ssh://git@|git@)github\.com[:/]##; s#\.git$##')
@@ -224,8 +233,61 @@ else:
     TERMINAL="false"
     [[ "$STATE_TYPE" == "completed" || "$STATE_TYPE" == "canceled" ]] && TERMINAL="true"
     ;;
+  jira)
+    JIRA_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
+    JIRA_ISSUE=""
+    if [[ "$JIRA_BRANCH" =~ ^feat/([A-Za-z][A-Za-z0-9]*-[0-9]+)(-|$) ]]; then
+      JIRA_ISSUE=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:lower:]' '[:upper:]')
+    fi
+    if [[ -z "$JIRA_ISSUE" ]]; then
+      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
+      exit 0
+    fi
+    BKIT_JIRA_BIN="$BKIT_GUARD_ROOT/node_modules/.bin/bkit"
+    if [[ ! -x "$BKIT_JIRA_BIN" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "node_modules/.bin/bkit is missing or not executable"
+    fi
+    BKIT_JIRA_TMPDIR=$(mktemp -d "${TMPDIR:-/tmp}/bkit-guard.XXXXXX") \
+      || bkit_guard_fail "Jira" "$JIRA_ISSUE" "could not create a temporary issue outbox"
+    JIRA_FETCH=("$BKIT_JIRA_BIN" issues fetch --issue "$JIRA_ISSUE" --outbox "$BKIT_JIRA_TMPDIR" --json)
+    if command -v timeout >/dev/null 2>&1; then
+      JIRA_FETCH=(timeout 20 "${JIRA_FETCH[@]}")
+    fi
+    JIRA_STATUS=0
+    JIRA_RESPONSE=$("${JIRA_FETCH[@]}" 2>/dev/null) || JIRA_STATUS=$?
+    rm -rf -- "$BKIT_JIRA_TMPDIR"
+    if [[ "$JIRA_STATUS" == "124" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch timed out"
+    fi
+    if [[ "$JIRA_STATUS" != "0" ]]; then
+      JIRA_REASON=$(RESPONSE="$JIRA_RESPONSE" python3 -c '
+import json, os
+try:
+    reason = json.loads(os.environ["RESPONSE"]).get("reason")
+    print(reason if reason in {"auth", "network", "not-found", "unavailable"} else "unreadable reply")
+except Exception:
+    print("unreadable reply")
+')
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch failed (exit ${JIRA_STATUS}, ${JIRA_REASON})"
+    fi
+    IFS=$'\t' read -r ISSUE_STATE TERMINAL LABELS < <(RESPONSE="$JIRA_RESPONSE" python3 -c '
+import json, os
+try:
+    d = json.loads(os.environ["RESPONSE"])
+    state, terminal, labels = d["state"], d["terminal"], d["labels"]
+    if not isinstance(state, str) or not state or not isinstance(terminal, bool) or not isinstance(labels, list) or not all(isinstance(label, str) for label in labels):
+        raise ValueError("invalid issue facts")
+    print(state + "\t" + str(terminal).lower() + "\t" + (",".join(labels) or "-"))
+except Exception:
+    print("UNKNOWN\t-\t-")
+')
+    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
+      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch answer could not be read"
+    fi
+    ISSUE_ID_DISPLAY="$JIRA_ISSUE"
+    TRACKER_NAME="Jira"
+    ;;
   *)
-    # Jira and tracker none: no guard here.
     exit 0
     ;;
 esac
diff --git a/DETAILS.md b/DETAILS.md
index c9cfad801..f22dac208 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -345,7 +345,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1694 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1695 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
diff --git a/docs/capabilities.md b/docs/capabilities.md
index b52e76dbb..2c89aff10 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,7 +164,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1694 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1695 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -334,7 +334,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests["tests<br/>108 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>72 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>73 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>55 symbols · 1 files"]
       end
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 00faadcd0..ec61daafa 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -151,3 +151,4 @@
 {"schema":3,"ts":1793668591094,"firstTs":1793668591094,"updates":1,"kind":"knowledge","key":"vitest-cli-filters-live-on-runner-filename-pattern","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["vitest.test-lock.ts","docs/testing.md"],"summary":"Read actual Vitest CLI filters when deciding whether a raw run needs the tests lock","description":"Vitest 5 stores CLI file filters on vitest.filenamePattern before global setup. Its resolved config does not carry config.filters. Reading config.filters alone treats an explicit existing-file run as an unfiltered heavy run and waits unnecessarily.","rootCause":"CLI run selection and the resolved test configuration are separate runner state.","remediation":"Preserve an explicit config.filters input and fall back to vitest.filenamePattern. Verify the real bkit:test:file command completes while another worktree holds the raw-run lock.","status":"ACTIVE"}
 {"schema":3,"ts":1793677148479,"firstTs":1793677148479,"updates":1,"kind":"knowledge","key":"machine-lock-wrapper-cancellation-keeps-foreground-owner-alive","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"A lock wrapper must remain alive until its foreground gate stops","rootCause":"The Perl holder follows the wrapper owner. Terminating only that wrapper releases the lock while its foreground gate can continue running.","remediation":"Defer TERM, INT and HUP cancellation until the foreground command completes naturally; retain the lock owner until then and return the signal status after release. Verify a competing run stays excluded and preserve ordinary command statuses and inherited-owner reuse.","status":"ACTIVE"}
 {"schema":3,"ts":1793677148482,"firstTs":1793677148482,"updates":1,"kind":"knowledge","key":"workflow-push-retry-keeps-close-effects-and-original-return-once","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/workflows/bkit-build.md",".bkit/core/engine/audits/workflows/local-gate-audit.test.ts"],"summary":"Keep workflow close effects outside a retryable push block","rootCause":"Retrying a fence that closes the workflow before pushing repeats append-only status and publishing effects. Close also removes its session, so a repeated close can lose the original final-return issue facts.","remediation":"Close once, retain commentFile, tracker and finalReturn immediately, retry only the push on exit 81, and release the workflow lock after push success.","status":"ACTIVE"}
+{"schema":3,"ts":1793864375991,"firstTs":1793864375991,"updates":1,"kind":"knowledge","key":"preflight-branch-reads-support-unborn-refs","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/hooks/preflight-tracker.sh",".bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts"],"summary":"Read a session guard's branch with git symbolic-ref so fresh repositories retain their issue id","description":"The Jira guard's recorded-reply fixture initializes a feat branch without a commit. git rev-parse --abbrev-ref HEAD fails on that unborn branch, incorrectly selecting the no-issue skip path.","rootCause":"Resolving HEAD as a commit requires a first commit, while the symbolic branch name already exists.","remediation":"Use git symbolic-ref --quiet --short HEAD for issue-id branch discovery; detached HEAD still yields no branch. The Jira terminal, missing-bin, auth, and timeout cases exercise this through fresh fixture repositories.","status":"ACTIVE"}
