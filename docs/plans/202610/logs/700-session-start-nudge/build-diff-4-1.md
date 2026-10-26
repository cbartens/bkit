diff --git a/.agents/plugins/bkit/hooks/bkit-gateguard.cjs b/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
index f0b4a4330..496d979a8 100644
--- a/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
@@ -39,6 +39,7 @@
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
+const crypto = require("node:crypto");

// Antigravity's file-writing tools. `write_to_file` creates or overwrites a whole file;
// `replace_file_content` edits in place. `Edit` / `Write` are accepted as matchers too.
@@ -259,8 +260,8 @@ function firstTouchAdvice(filePath, sessionId, isNewFile) {
}

// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
-// it from one source). Needs `fs`, `os` and `path` in scope; the host's own code above
-// declares them.
+// it from one source). Needs `fs`, `os`, `path` and `crypto` in scope; the host's own code
+// above declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
 // args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
@@ -314,13 +315,17 @@ function agRetryFile(hook, sessionId) {
*/
function adviseOnce(hook, sessionId, signature, advisory) {
const file = agRetryFile(hook, sessionId);

- // One-way digest of the call signature: the retry store is world-readable and has no
- // TTL, so no tool argument (a shell command line with an inline secret, a file path)
- // may rest on disk in cleartext.
- const digest = crypto.createHash("sha256").update(signature).digest("hex");
  const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";

* if (last === signature) {

- if (last === digest) {
  fs.rmSync(file, { force: true });
  return { decision: "allow" };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });

* fs.writeFileSync(file, signature, "utf-8");

- fs.writeFileSync(file, digest, "utf-8");
  return {
  decision: "deny",
  reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
  diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
  index 2b185bda8..31e7e59f9 100644
  --- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
  +++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
  @@ -40,6 +40,7 @@
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  +const crypto = require("node:crypto");

// --- Shell detection: identical in every host's guardrails hook (bkit renders it from
// one source). Needs `fs` and `path` in scope; the host's own code above declares them.
@@ -647,8 +648,8 @@ function classifyRead(filePath) {
}

// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
-// it from one source). Needs `fs`, `os` and `path` in scope; the host's own code above
-// declares them.
+// it from one source). Needs `fs`, `os`, `path` and `crypto` in scope; the host's own code
+// above declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
 // args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
@@ -702,13 +703,17 @@ function agRetryFile(hook, sessionId) {
*/
function adviseOnce(hook, sessionId, signature, advisory) {
const file = agRetryFile(hook, sessionId);

- // One-way digest of the call signature: the retry store is world-readable and has no
- // TTL, so no tool argument (a shell command line with an inline secret, a file path)
- // may rest on disk in cleartext.
- const digest = crypto.createHash("sha256").update(signature).digest("hex");
  const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";

* if (last === signature) {

- if (last === digest) {
  fs.rmSync(file, { force: true });
  return { decision: "allow" };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });

* fs.writeFileSync(file, signature, "utf-8");

- fs.writeFileSync(file, digest, "utf-8");
  return {
  decision: "deny",
  reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
  diff --git a/.agents/plugins/bkit/hooks/bkit-readguard.cjs b/.agents/plugins/bkit/hooks/bkit-readguard.cjs
  index c4796f9fe..3564eb70d 100644
  --- a/.agents/plugins/bkit/hooks/bkit-readguard.cjs
  +++ b/.agents/plugins/bkit/hooks/bkit-readguard.cjs
  @@ -35,6 +35,7 @@
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  +const crypto = require("node:crypto");

// --- ReadGuard engine: identical in every host's hook (bkit renders it from one source).
// Needs `fs`, `os` and `path` in scope; the host's own code above declares them.
@@ -365,8 +366,8 @@ function bkitReadguard(payload) {
}

// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
-// it from one source). Needs `fs`, `os` and `path` in scope; the host's own code above
-// declares them.
+// it from one source). Needs `fs`, `os`, `path` and `crypto` in scope; the host's own code
+// above declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
 // args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
@@ -420,13 +421,17 @@ function agRetryFile(hook, sessionId) {
*/
function adviseOnce(hook, sessionId, signature, advisory) {
const file = agRetryFile(hook, sessionId);

- // One-way digest of the call signature: the retry store is world-readable and has no
- // TTL, so no tool argument (a shell command line with an inline secret, a file path)
- // may rest on disk in cleartext.
- const digest = crypto.createHash("sha256").update(signature).digest("hex");
  const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";

* if (last === signature) {

- if (last === digest) {
  fs.rmSync(file, { force: true });
  return { decision: "allow" };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });

* fs.writeFileSync(file, signature, "utf-8");

- fs.writeFileSync(file, digest, "utf-8");
  return {
  decision: "deny",
  reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
  diff --git a/.agents/plugins/bkit/hooks/bkit-rules.cjs b/.agents/plugins/bkit/hooks/bkit-rules.cjs
  index 1ec48ad23..917665558 100644
  --- a/.agents/plugins/bkit/hooks/bkit-rules.cjs
  +++ b/.agents/plugins/bkit/hooks/bkit-rules.cjs
  @@ -35,6 +35,7 @@
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  +const crypto = require("node:crypto");

// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
// source into every host hook whose host has no session-start event: opencode, Codex,
@@ -89,8 +90,8 @@ function rulesReadAdviceOnce(sessionId) {
}

// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
-// it from one source). Needs `fs`, `os` and `path` in scope; the host's own code above
-// declares them.
+// it from one source). Needs `fs`, `os`, `path` and `crypto` in scope; the host's own code
+// above declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
 // args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
@@ -144,13 +145,17 @@ function agRetryFile(hook, sessionId) {
*/
function adviseOnce(hook, sessionId, signature, advisory) {
const file = agRetryFile(hook, sessionId);

- // One-way digest of the call signature: the retry store is world-readable and has no
- // TTL, so no tool argument (a shell command line with an inline secret, a file path)
- // may rest on disk in cleartext.
- const digest = crypto.createHash("sha256").update(signature).digest("hex");
  const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";

* if (last === signature) {

- if (last === digest) {
  fs.rmSync(file, { force: true });
  return { decision: "allow" };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });

* fs.writeFileSync(file, signature, "utf-8");

- fs.writeFileSync(file, digest, "utf-8");
  return {
  decision: "deny",
  reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
  diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
  index 03fb99676..e36b0d2f7 100644
  --- a/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
  +++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
  @@ -39,6 +39,7 @@
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  +const crypto = require("node:crypto");

// Antigravity's file-writing tools. `write_to_file` creates or overwrites a whole file;
// `replace_file_content` edits in place. `Edit` / `Write` are accepted as matchers too.
diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index 36cfae53a..5599234cf 100644
--- a/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -40,6 +40,7 @@
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
+const crypto = require("node:crypto");

// {{BKIT_PART guardrails-shell.js}}

diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-readguard.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-readguard.cjs
index faed71bc1..397058a98 100644
--- a/.bkit/core/.agents/plugins/bkit/hooks/bkit-readguard.cjs
+++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-readguard.cjs
@@ -40,6 +40,7 @@
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
+const crypto = require("node:crypto");

// {{BKIT_PART readguard-engine.js}}

diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs
index f1c05f4cd..93882b5bf 100644
--- a/.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs
+++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs
@@ -35,6 +35,7 @@
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
+const crypto = require("node:crypto");

// {{BKIT_PART session-rules-advisory.js}}

diff --git a/.bkit/core/.claude/hooks/bkit-preflight.sh b/.bkit/core/.claude/hooks/bkit-preflight.sh
index f1c1e5923..77261dc4b 100755
--- a/.bkit/core/.claude/hooks/bkit-preflight.sh
+++ b/.bkit/core/.claude/hooks/bkit-preflight.sh
@@ -44,12 +44,22 @@ emit_context() {

# document. No python3 on this path: a python3-less IDE session must still get the

# advisory (Claude cannot block, so a lost advisory would be silent).

bkit_json_escape() {

- local s=$1

* local s=$1 i oct ch esc
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/\\r}
  s=${s//$'\t'/\\t}
* # The rest of the C0 range (U+0000–U+001F) — bash cannot hold NUL, so 1–31 minus the
* # three above. A raw control byte makes the whole document unparseable and the host
* # discards it, taking the advisory and the Linear guard result with it.
* for (( i = 1; i < 32; i++ )); do
* case $i in 9 | 10 | 13) continue ;; esac
* printf -v oct '%03o' "$i"
* printf -v ch "\\$oct"
* printf -v esc '\\u%04x' "$i"
* s=${s//$ch/$esc}
* done
  printf '%s' "$s"
  }

diff --git a/.bkit/core/.cursor/hooks/bkit-preflight.sh b/.bkit/core/.cursor/hooks/bkit-preflight.sh
index bd5a58090..3e2208b71 100755
--- a/.bkit/core/.cursor/hooks/bkit-preflight.sh
+++ b/.bkit/core/.cursor/hooks/bkit-preflight.sh
@@ -42,12 +42,22 @@ emit_context() {

# JSON-escape one string, so a context carrying a quote or a backslash cannot break the

# document.

bkit_json_escape() {

- local s=$1

* local s=$1 i oct ch esc
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/\\r}
  s=${s//$'\t'/\\t}
* # The rest of the C0 range (U+0000–U+001F) — bash cannot hold NUL, so 1–31 minus the
* # three above. A raw control byte makes the whole document unparseable and the host
* # discards it, taking the advisory and the Linear guard result with it.
* for (( i = 1; i < 32; i++ )); do
* case $i in 9 | 10 | 13) continue ;; esac
* printf -v oct '%03o' "$i"
* printf -v ch "\\$oct"
* printf -v esc '\\u%04x' "$i"
* s=${s//$ch/$esc}
* done
  printf '%s' "$s"
  }

diff --git a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
index 44682eaa5..02b27e26d 100644
--- a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
@@ -100,6 +100,16 @@ describe("BAR-186 — Claude SessionStart preflight.sh runtime behaviour", () =>
expect(result.stderr).toContain("BKIT_LINEAR_API_KEY not set");
expect(JSON.parse(result.stdout).hookSpecificOutput.additionalContext).toContain("HARD STOP");
}); +

- it("a context carrying a control character still yields one parseable JSON document", () => {
- // The Linear guard interpolates LINEAR_ISSUE_ID verbatim into the key-missing FAIL
- // message. A control byte in it must not yield a document the host discards whole,
- // which would silently drop the HARD STOP and the advisory with it.
- const result = runPreflight(CLAUDE_HOOK, { LINEAR_ISSUE_ID: "BAR-186-\u000b-test" });
- expect(result.status).toBe(1);
- const doc = JSON.parse(result.stdout);
- expect(doc.hookSpecificOutput.additionalContext).toContain("HARD STOP");
- });
  });

describe("Claude SessionStart preflight.sh — no Jira guard", () => {
diff --git a/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index bc8a08a2f..6c63e4391 100644
--- a/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -330,6 +330,39 @@ describe("antigravity hook — the rules-read advisory", () => {
expect(retry.status).toBe(0);
expect(JSON.parse(retry.stdout).decision).toBe("allow");
}); +

- it("the antigravity retry store never persists a raw command line", () => {
- const session = newSession();
- const marker = `AWS_SECRET_ACCESS_KEY=secret-${session}`;
- const payload = JSON.stringify({
-      conversationId: session,
-      toolCall: { name: "run_command", args: { CommandLine: `export ${marker}`, Cwd: "/w" } },
-      workspacePaths: ["/w"],
- });
- const retryFile = path.join(
-      os.tmpdir(),
-      "bkit-antigravity-retry",
-      `rules.${safeKey(session)}.json`,
- );
- try {
-      const first = runHook(ANTIGRAVITY_HOOK, payload);
-      expect(first.status).toBe(0);
-      expect(JSON.parse(first.stdout).decision).toBe("deny");
-
-      // The deny-once store is world-readable, has no TTL and is left behind when the
-      // agent rephrases instead of retrying, so it must hold a one-way digest of the
-      // call signature — never the command line, which can carry an inline secret.
-      const stored = fs.readFileSync(retryFile, "utf-8");
-      expect(stored).not.toContain(marker);
-      expect(stored).not.toContain("AWS_SECRET_ACCESS_KEY");
-
-      const retry = runHook(ANTIGRAVITY_HOOK, payload);
-      expect(retry.status).toBe(0);
-      expect(JSON.parse(retry.stdout).decision).toBe("allow");
- } finally {
-      fs.rmSync(retryFile, { force: true });
- }
- });
  });

describe("every rendered advisory hook", () => {
diff --git a/.bkit/core/hooks/antigravity-hook.js b/.bkit/core/hooks/antigravity-hook.js
index a8b80f8cc..949c5c08c 100644
--- a/.bkit/core/hooks/antigravity-hook.js
+++ b/.bkit/core/hooks/antigravity-hook.js
@@ -1,6 +1,6 @@
// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
-// it from one source). Needs `fs`, `os` and `path` in scope; the host's own code above
-// declares them.
+// it from one source). Needs `fs`, `os`, `path` and `crypto` in scope; the host's own code
+// above declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
 // args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
@@ -54,13 +54,17 @@ function agRetryFile(hook, sessionId) {
*/
function adviseOnce(hook, sessionId, signature, advisory) {
const file = agRetryFile(hook, sessionId);

- // One-way digest of the call signature: the retry store is world-readable and has no
- // TTL, so no tool argument (a shell command line with an inline secret, a file path)
- // may rest on disk in cleartext.
- const digest = crypto.createHash("sha256").update(signature).digest("hex");
  const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";

* if (last === signature) {

- if (last === digest) {
  fs.rmSync(file, { force: true });
  return { decision: "allow" };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });

* fs.writeFileSync(file, signature, "utf-8");

- fs.writeFileSync(file, digest, "utf-8");
  return {
  decision: "deny",
  reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
  diff --git a/.bkit/version b/.bkit/version
  index 1a8195649..d767573f2 100644
  --- a/.bkit/version
  +++ b/.bkit/version
  @@ -233,12 +233,12 @@
  ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
  ".claude/hooks/bkit-gateguard.cjs": "839a1e2c52484956a310f763df6ce749d649e4dab9ac035f52b462b4b69609d6",
  ".claude/hooks/bkit-guardrails.cjs": "82776a4c2d7d2f2cb5ca4c14087ab5364587f3c1b4049778c6806b0da8de925a",

* ".claude/hooks/bkit-preflight.sh": "a7f8a3c35cf04891423218ecc1bb036251988fa5a021066ff2812af827b8c688",

- ".claude/hooks/bkit-preflight.sh": "df1b32377c4d1a508ddeddc827f6c97907e5fdba5a882917367b341ba6ca7b42",
  ".codex/hooks/bkit-gateguard.cjs": "e6e347a7dacd9a0f425bb576143c3c7ec1fc5c08674526b2e56fa2255adecbee",
  ".codex/hooks/bkit-guardrails.cjs": "fc147e816a26be47009c656a048ecc1aed4cbe349d53bb9899783aa44def8cd2",
  ".cursor/hooks/bkit-gateguard.cjs": "1b79611ea218a03fdb80ecf12fbd2bfaa66952bafa7d89d7a95e96bc41dd3696",
  ".cursor/hooks/bkit-guardrails.cjs": "5be877200b11dfe7d44237d3b0a1cf14b843888005cc372db8df2c207b89fc10",

* ".cursor/hooks/bkit-preflight.sh": "c2532cfa550719ba815163cb8dc4a234344520dd8825a281560ed6455cde8f16",

- ".cursor/hooks/bkit-preflight.sh": "5e3c05e59ccf0df10935a1b48731614ef8cae751d1e86d99a206138675be4906",
  ".opencode/plugin/bkit-gateguard.js": "ae5f36dfd1bf08bc487adea65c28cc5b16b2bb1f457ab11c421694fa0fbfdcb6",
  ".bkit/LICENSE.md": "e768db6af8e05dceec02eaff78e8a8478cd8705f5f06522377f98a5a513bc027",
  "GEMINI.md": "bcda8fa4805a544dd2ecd475f3864543db52dc45e9947b8aaa6f864c612f0442",
  diff --git a/.claude/hooks/bkit-preflight.sh b/.claude/hooks/bkit-preflight.sh
  index fe0db104c..51e1cbeff 100755
  --- a/.claude/hooks/bkit-preflight.sh
  +++ b/.claude/hooks/bkit-preflight.sh
  @@ -43,12 +43,22 @@ emit_context() {

# document. No python3 on this path: a python3-less IDE session must still get the

# advisory (Claude cannot block, so a lost advisory would be silent).

bkit_json_escape() {

- local s=$1

* local s=$1 i oct ch esc
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/\\r}
  s=${s//$'\t'/\\t}
* # The rest of the C0 range (U+0000–U+001F) — bash cannot hold NUL, so 1–31 minus the
* # three above. A raw control byte makes the whole document unparseable and the host
* # discards it, taking the advisory and the Linear guard result with it.
* for (( i = 1; i < 32; i++ )); do
* case $i in 9 | 10 | 13) continue ;; esac
* printf -v oct '%03o' "$i"
* printf -v ch "\\$oct"
* printf -v esc '\\u%04x' "$i"
* s=${s//$ch/$esc}
* done
  printf '%s' "$s"
  }

diff --git a/.cursor/hooks/bkit-preflight.sh b/.cursor/hooks/bkit-preflight.sh
index 520dce000..7a4e847e9 100755
--- a/.cursor/hooks/bkit-preflight.sh
+++ b/.cursor/hooks/bkit-preflight.sh
@@ -41,12 +41,22 @@ emit_context() {

# JSON-escape one string, so a context carrying a quote or a backslash cannot break the

# document.

bkit_json_escape() {

- local s=$1

* local s=$1 i oct ch esc
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/\\r}
  s=${s//$'\t'/\\t}
* # The rest of the C0 range (U+0000–U+001F) — bash cannot hold NUL, so 1–31 minus the
* # three above. A raw control byte makes the whole document unparseable and the host
* # discards it, taking the advisory and the Linear guard result with it.
* for (( i = 1; i < 32; i++ )); do
* case $i in 9 | 10 | 13) continue ;; esac
* printf -v oct '%03o' "$i"
* printf -v ch "\\$oct"
* printf -v esc '\\u%04x' "$i"
* s=${s//$ch/$esc}
* done
  printf '%s' "$s"
  }
