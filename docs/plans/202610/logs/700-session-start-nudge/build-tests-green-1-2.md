Enforced: true
Gaps: 5
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/700-session-start-nudge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "emits the rules advisory on a Claude IDE session" | recorded 2026-10-26T07:27:16Z | no | passed |
| 1 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "names .agents/rules.md and never AGENTS.md" | recorded 2026-10-26T07:28:08Z | no | passed |
| 1 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "a cloud session prints one JSON document carrying the advisory and the Linear guard result" | recorded 2026-10-26T07:28:09Z | no | passed |
| 1 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "a Cursor session emits the advisory without python3 and exits 0" | recorded 2026-10-26T07:28:11Z | no | passed |
| 2 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "opencode plugin appends the rules advisory to the first tool result" | recorded 2026-10-26T07:31:22Z | added lines only | passed |
| 2 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "opencode plugin appends nothing on the second call in the same session" | recorded 2026-10-26T07:31:24Z | added lines only | passed |
| 2 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "opencode plugin fails open on a malformed hook input" | recorded 2026-10-26T07:31:25Z | added lines only | passed |
| 2 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "the shared advisory names .agents/rules.md and not AGENTS.md" | recorded 2026-10-26T07:31:27Z | added lines only | passed |
| 2 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "the shell part and the JS part hold the byte-identical advisory string" | recorded 2026-10-26T07:31:29Z | added lines only | passed |
| 3 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "codex hook writes the rules advisory as additionalContext once per session" | recorded 2026-10-26T07:34:43Z | yes | passed |
| 3 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "codex hook fails open on an empty payload" | recorded 2026-10-26T07:34:46Z | yes | passed |
| 3 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "an unknown session id still yields the advisory once and never throws" | recorded 2026-10-26T07:34:49Z | yes | passed |
| 3 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "antigravity hook denies the first call once with the advisory and allows the retry" | recorded 2026-10-26T07:34:51Z | yes | passed |
| 3 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "every rendered advisory hook names .agents/rules.md and not AGENTS.md" | recorded 2026-10-26T07:34:53Z | yes | passed |

## Gaps

- Task 3 `test-changed` — `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` differs from its red snapshot for "codex hook writes the rules advisory as additionalContext once per session" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` differs from its red snapshot for "codex hook fails open on an empty payload" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` differs from its red snapshot for "an unknown session id still yields the advisory once and never throws" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` differs from its red snapshot for "antigravity hook denies the first call once with the advisory and allows the retry" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` differs from its red snapshot for "every rendered advisory hook names .agents/rules.md and not AGENTS.md" (diff below)

## Late-red check

- Task 1 — not checked: no plan-execute step commit's log records `DONE — TASK 1`, so when its code landed is unknown
- Task 2 — not checked: no plan-execute step commit's log records `DONE — TASK 2`, so when its code landed is unknown
- Task 3 — not checked: no plan-execute step commit's log records `DONE — TASK 3`, so when its code landed is unknown

## Diff since red — Task 2 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-1.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index f9fe7bf4b..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-1.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -7,6 +7,7 @@
 // The Codex and Antigravity hooks are spawned as their host runs them: rendered hook,
 // JSON on stdin, JSON on stdout.

+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -177,6 +178,126 @@ describe("opencode plugin — the rules-read advisory", () => {
   });
 });

+// ---------------------------------------------------------------------------
+// Codex and Antigravity — rendered hooks, spawned as their host runs them: the hook file
+// install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
+// ---------------------------------------------------------------------------
+
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
+function renderHook(rel: string): string {
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
+  fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
+  return out;
+}
+
+const CODEX_HOOK = renderHook(path.join(".codex", "hooks", "bkit-rules.cjs"));
+const ANTIGRAVITY_HOOK = renderHook(
+  path.join(".agents", "plugins", "bkit", "hooks", "bkit-rules.cjs"),
+);
+
+function runHook(
+  hook: string,
+  input: string,
+): { status: number | null; stdout: string; stderr: string } {
+  const result = spawnSync(process.execPath, [hook], { input, encoding: "utf-8", timeout: 10_000 });
+  return {
+    status: result.status,
+    stdout: result.stdout ?? "",
+    stderr: result.stderr ?? "",
+  };
+}
+
+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
+describe("codex hook — the rules-read advisory", () => {
+  it("codex hook writes the rules advisory as additionalContext once per session", () => {
+    const payload = JSON.stringify({
+      tool_name: "apply_patch",
+      session_id: newSession(),
+      cwd: "/w",
+    });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+
+  it("codex hook fails open on an empty payload", () => {
+    const result = runHook(CODEX_HOOK, "");
+    expect(result.status).toBe(0);
+    expect(result.stdout).toBe("");
+  });
+
+  it("an unknown session id still yields the advisory once and never throws", () => {
+    // No session id: the advisory must still reach the model (fail-open), and must not
+    // repeat on the next call.
+    const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+});
+
+describe("antigravity hook — the rules-read advisory", () => {
+  it("antigravity hook denies the first call once with the advisory and allows the retry", () => {
+    const payload = JSON.stringify({
+      conversationId: newSession(),
+      toolCall: { name: "view_file", args: { AbsolutePath: "/tmp/x.ts" } },
+      workspacePaths: ["/w"],
+    });
+    const first = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(first.status).toBe(0);
+    const decision = JSON.parse(first.stdout);
+    expect(decision.decision).toBe("deny");
+    expect(decision.reason).toContain(".agents/rules.md");
+
+    const retry = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(retry.status).toBe(0);
+    expect(JSON.parse(retry.stdout).decision).toBe("allow");
+  });
+});
+
+describe("every rendered advisory hook", () => {
+  it("every rendered advisory hook names .agents/rules.md and not AGENTS.md", () => {
+    const sessions: Array<[string, string]> = [
+      [
+        CODEX_HOOK,
+        JSON.stringify({ tool_name: "apply_patch", session_id: newSession(), cwd: "/w" }),
+      ],
+      [
+        ANTIGRAVITY_HOOK,
+        JSON.stringify({ conversationId: newSession(), toolCall: { name: "view_file", args: {} } }),
+      ],
+    ];
+    for (const [hook, payload] of sessions) {
+      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
+      const result = runHook(hook, payload);
+      expect(result.status, hook).toBe(0);
+      const advisory = emittedAdvisory(result.stdout);
+      expect(advisory, hook).toContain(".agents/rules.md");
+      expect(advisory, hook).not.toContain("AGENTS.md");
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // The shared advisory text — one sentence, declared once per language, held together by
 // these two assertions.
```

## Diff since red — Task 2 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-2.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index f9fe7bf4b..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-2.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -7,6 +7,7 @@
 // The Codex and Antigravity hooks are spawned as their host runs them: rendered hook,
 // JSON on stdin, JSON on stdout.

+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -177,6 +178,126 @@ describe("opencode plugin — the rules-read advisory", () => {
   });
 });

+// ---------------------------------------------------------------------------
+// Codex and Antigravity — rendered hooks, spawned as their host runs them: the hook file
+// install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
+// ---------------------------------------------------------------------------
+
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
+function renderHook(rel: string): string {
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
+  fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
+  return out;
+}
+
+const CODEX_HOOK = renderHook(path.join(".codex", "hooks", "bkit-rules.cjs"));
+const ANTIGRAVITY_HOOK = renderHook(
+  path.join(".agents", "plugins", "bkit", "hooks", "bkit-rules.cjs"),
+);
+
+function runHook(
+  hook: string,
+  input: string,
+): { status: number | null; stdout: string; stderr: string } {
+  const result = spawnSync(process.execPath, [hook], { input, encoding: "utf-8", timeout: 10_000 });
+  return {
+    status: result.status,
+    stdout: result.stdout ?? "",
+    stderr: result.stderr ?? "",
+  };
+}
+
+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
+describe("codex hook — the rules-read advisory", () => {
+  it("codex hook writes the rules advisory as additionalContext once per session", () => {
+    const payload = JSON.stringify({
+      tool_name: "apply_patch",
+      session_id: newSession(),
+      cwd: "/w",
+    });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+
+  it("codex hook fails open on an empty payload", () => {
+    const result = runHook(CODEX_HOOK, "");
+    expect(result.status).toBe(0);
+    expect(result.stdout).toBe("");
+  });
+
+  it("an unknown session id still yields the advisory once and never throws", () => {
+    // No session id: the advisory must still reach the model (fail-open), and must not
+    // repeat on the next call.
+    const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+});
+
+describe("antigravity hook — the rules-read advisory", () => {
+  it("antigravity hook denies the first call once with the advisory and allows the retry", () => {
+    const payload = JSON.stringify({
+      conversationId: newSession(),
+      toolCall: { name: "view_file", args: { AbsolutePath: "/tmp/x.ts" } },
+      workspacePaths: ["/w"],
+    });
+    const first = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(first.status).toBe(0);
+    const decision = JSON.parse(first.stdout);
+    expect(decision.decision).toBe("deny");
+    expect(decision.reason).toContain(".agents/rules.md");
+
+    const retry = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(retry.status).toBe(0);
+    expect(JSON.parse(retry.stdout).decision).toBe("allow");
+  });
+});
+
+describe("every rendered advisory hook", () => {
+  it("every rendered advisory hook names .agents/rules.md and not AGENTS.md", () => {
+    const sessions: Array<[string, string]> = [
+      [
+        CODEX_HOOK,
+        JSON.stringify({ tool_name: "apply_patch", session_id: newSession(), cwd: "/w" }),
+      ],
+      [
+        ANTIGRAVITY_HOOK,
+        JSON.stringify({ conversationId: newSession(), toolCall: { name: "view_file", args: {} } }),
+      ],
+    ];
+    for (const [hook, payload] of sessions) {
+      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
+      const result = runHook(hook, payload);
+      expect(result.status, hook).toBe(0);
+      const advisory = emittedAdvisory(result.stdout);
+      expect(advisory, hook).toContain(".agents/rules.md");
+      expect(advisory, hook).not.toContain("AGENTS.md");
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // The shared advisory text — one sentence, declared once per language, held together by
 // these two assertions.
```

## Diff since red — Task 2 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-3.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index f9fe7bf4b..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-3.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -7,6 +7,7 @@
 // The Codex and Antigravity hooks are spawned as their host runs them: rendered hook,
 // JSON on stdin, JSON on stdout.

+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -177,6 +178,126 @@ describe("opencode plugin — the rules-read advisory", () => {
   });
 });

+// ---------------------------------------------------------------------------
+// Codex and Antigravity — rendered hooks, spawned as their host runs them: the hook file
+// install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
+// ---------------------------------------------------------------------------
+
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
+function renderHook(rel: string): string {
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
+  fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
+  return out;
+}
+
+const CODEX_HOOK = renderHook(path.join(".codex", "hooks", "bkit-rules.cjs"));
+const ANTIGRAVITY_HOOK = renderHook(
+  path.join(".agents", "plugins", "bkit", "hooks", "bkit-rules.cjs"),
+);
+
+function runHook(
+  hook: string,
+  input: string,
+): { status: number | null; stdout: string; stderr: string } {
+  const result = spawnSync(process.execPath, [hook], { input, encoding: "utf-8", timeout: 10_000 });
+  return {
+    status: result.status,
+    stdout: result.stdout ?? "",
+    stderr: result.stderr ?? "",
+  };
+}
+
+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
+describe("codex hook — the rules-read advisory", () => {
+  it("codex hook writes the rules advisory as additionalContext once per session", () => {
+    const payload = JSON.stringify({
+      tool_name: "apply_patch",
+      session_id: newSession(),
+      cwd: "/w",
+    });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+
+  it("codex hook fails open on an empty payload", () => {
+    const result = runHook(CODEX_HOOK, "");
+    expect(result.status).toBe(0);
+    expect(result.stdout).toBe("");
+  });
+
+  it("an unknown session id still yields the advisory once and never throws", () => {
+    // No session id: the advisory must still reach the model (fail-open), and must not
+    // repeat on the next call.
+    const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+});
+
+describe("antigravity hook — the rules-read advisory", () => {
+  it("antigravity hook denies the first call once with the advisory and allows the retry", () => {
+    const payload = JSON.stringify({
+      conversationId: newSession(),
+      toolCall: { name: "view_file", args: { AbsolutePath: "/tmp/x.ts" } },
+      workspacePaths: ["/w"],
+    });
+    const first = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(first.status).toBe(0);
+    const decision = JSON.parse(first.stdout);
+    expect(decision.decision).toBe("deny");
+    expect(decision.reason).toContain(".agents/rules.md");
+
+    const retry = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(retry.status).toBe(0);
+    expect(JSON.parse(retry.stdout).decision).toBe("allow");
+  });
+});
+
+describe("every rendered advisory hook", () => {
+  it("every rendered advisory hook names .agents/rules.md and not AGENTS.md", () => {
+    const sessions: Array<[string, string]> = [
+      [
+        CODEX_HOOK,
+        JSON.stringify({ tool_name: "apply_patch", session_id: newSession(), cwd: "/w" }),
+      ],
+      [
+        ANTIGRAVITY_HOOK,
+        JSON.stringify({ conversationId: newSession(), toolCall: { name: "view_file", args: {} } }),
+      ],
+    ];
+    for (const [hook, payload] of sessions) {
+      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
+      const result = runHook(hook, payload);
+      expect(result.status, hook).toBe(0);
+      const advisory = emittedAdvisory(result.stdout);
+      expect(advisory, hook).toContain(".agents/rules.md");
+      expect(advisory, hook).not.toContain("AGENTS.md");
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // The shared advisory text — one sentence, declared once per language, held together by
 // these two assertions.
```

## Diff since red — Task 2 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-4.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index f9fe7bf4b..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-4.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -7,6 +7,7 @@
 // The Codex and Antigravity hooks are spawned as their host runs them: rendered hook,
 // JSON on stdin, JSON on stdout.

+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -177,6 +178,126 @@ describe("opencode plugin — the rules-read advisory", () => {
   });
 });

+// ---------------------------------------------------------------------------
+// Codex and Antigravity — rendered hooks, spawned as their host runs them: the hook file
+// install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
+// ---------------------------------------------------------------------------
+
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
+function renderHook(rel: string): string {
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
+  fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
+  return out;
+}
+
+const CODEX_HOOK = renderHook(path.join(".codex", "hooks", "bkit-rules.cjs"));
+const ANTIGRAVITY_HOOK = renderHook(
+  path.join(".agents", "plugins", "bkit", "hooks", "bkit-rules.cjs"),
+);
+
+function runHook(
+  hook: string,
+  input: string,
+): { status: number | null; stdout: string; stderr: string } {
+  const result = spawnSync(process.execPath, [hook], { input, encoding: "utf-8", timeout: 10_000 });
+  return {
+    status: result.status,
+    stdout: result.stdout ?? "",
+    stderr: result.stderr ?? "",
+  };
+}
+
+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
+describe("codex hook — the rules-read advisory", () => {
+  it("codex hook writes the rules advisory as additionalContext once per session", () => {
+    const payload = JSON.stringify({
+      tool_name: "apply_patch",
+      session_id: newSession(),
+      cwd: "/w",
+    });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+
+  it("codex hook fails open on an empty payload", () => {
+    const result = runHook(CODEX_HOOK, "");
+    expect(result.status).toBe(0);
+    expect(result.stdout).toBe("");
+  });
+
+  it("an unknown session id still yields the advisory once and never throws", () => {
+    // No session id: the advisory must still reach the model (fail-open), and must not
+    // repeat on the next call.
+    const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+});
+
+describe("antigravity hook — the rules-read advisory", () => {
+  it("antigravity hook denies the first call once with the advisory and allows the retry", () => {
+    const payload = JSON.stringify({
+      conversationId: newSession(),
+      toolCall: { name: "view_file", args: { AbsolutePath: "/tmp/x.ts" } },
+      workspacePaths: ["/w"],
+    });
+    const first = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(first.status).toBe(0);
+    const decision = JSON.parse(first.stdout);
+    expect(decision.decision).toBe("deny");
+    expect(decision.reason).toContain(".agents/rules.md");
+
+    const retry = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(retry.status).toBe(0);
+    expect(JSON.parse(retry.stdout).decision).toBe("allow");
+  });
+});
+
+describe("every rendered advisory hook", () => {
+  it("every rendered advisory hook names .agents/rules.md and not AGENTS.md", () => {
+    const sessions: Array<[string, string]> = [
+      [
+        CODEX_HOOK,
+        JSON.stringify({ tool_name: "apply_patch", session_id: newSession(), cwd: "/w" }),
+      ],
+      [
+        ANTIGRAVITY_HOOK,
+        JSON.stringify({ conversationId: newSession(), toolCall: { name: "view_file", args: {} } }),
+      ],
+    ];
+    for (const [hook, payload] of sessions) {
+      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
+      const result = runHook(hook, payload);
+      expect(result.status, hook).toBe(0);
+      const advisory = emittedAdvisory(result.stdout);
+      expect(advisory, hook).toContain(".agents/rules.md");
+      expect(advisory, hook).not.toContain("AGENTS.md");
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // The shared advisory text — one sentence, declared once per language, held together by
 // these two assertions.
```

## Diff since red — Task 2 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-5.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index f9fe7bf4b..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-2-5.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -7,6 +7,7 @@
 // The Codex and Antigravity hooks are spawned as their host runs them: rendered hook,
 // JSON on stdin, JSON on stdout.

+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -177,6 +178,126 @@ describe("opencode plugin — the rules-read advisory", () => {
   });
 });

+// ---------------------------------------------------------------------------
+// Codex and Antigravity — rendered hooks, spawned as their host runs them: the hook file
+// install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
+// ---------------------------------------------------------------------------
+
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
+function renderHook(rel: string): string {
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
+  fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
+  return out;
+}
+
+const CODEX_HOOK = renderHook(path.join(".codex", "hooks", "bkit-rules.cjs"));
+const ANTIGRAVITY_HOOK = renderHook(
+  path.join(".agents", "plugins", "bkit", "hooks", "bkit-rules.cjs"),
+);
+
+function runHook(
+  hook: string,
+  input: string,
+): { status: number | null; stdout: string; stderr: string } {
+  const result = spawnSync(process.execPath, [hook], { input, encoding: "utf-8", timeout: 10_000 });
+  return {
+    status: result.status,
+    stdout: result.stdout ?? "",
+    stderr: result.stderr ?? "",
+  };
+}
+
+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
+describe("codex hook — the rules-read advisory", () => {
+  it("codex hook writes the rules advisory as additionalContext once per session", () => {
+    const payload = JSON.stringify({
+      tool_name: "apply_patch",
+      session_id: newSession(),
+      cwd: "/w",
+    });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+
+  it("codex hook fails open on an empty payload", () => {
+    const result = runHook(CODEX_HOOK, "");
+    expect(result.status).toBe(0);
+    expect(result.stdout).toBe("");
+  });
+
+  it("an unknown session id still yields the advisory once and never throws", () => {
+    // No session id: the advisory must still reach the model (fail-open), and must not
+    // repeat on the next call.
+    const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
+    const first = runHook(CODEX_HOOK, payload);
+    expect(first.status).toBe(0);
+    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
+      ".agents/rules.md",
+    );
+
+    const second = runHook(CODEX_HOOK, payload);
+    expect(second.status).toBe(0);
+    expect(second.stdout.trim()).toBe("");
+  });
+});
+
+describe("antigravity hook — the rules-read advisory", () => {
+  it("antigravity hook denies the first call once with the advisory and allows the retry", () => {
+    const payload = JSON.stringify({
+      conversationId: newSession(),
+      toolCall: { name: "view_file", args: { AbsolutePath: "/tmp/x.ts" } },
+      workspacePaths: ["/w"],
+    });
+    const first = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(first.status).toBe(0);
+    const decision = JSON.parse(first.stdout);
+    expect(decision.decision).toBe("deny");
+    expect(decision.reason).toContain(".agents/rules.md");
+
+    const retry = runHook(ANTIGRAVITY_HOOK, payload);
+    expect(retry.status).toBe(0);
+    expect(JSON.parse(retry.stdout).decision).toBe("allow");
+  });
+});
+
+describe("every rendered advisory hook", () => {
+  it("every rendered advisory hook names .agents/rules.md and not AGENTS.md", () => {
+    const sessions: Array<[string, string]> = [
+      [
+        CODEX_HOOK,
+        JSON.stringify({ tool_name: "apply_patch", session_id: newSession(), cwd: "/w" }),
+      ],
+      [
+        ANTIGRAVITY_HOOK,
+        JSON.stringify({ conversationId: newSession(), toolCall: { name: "view_file", args: {} } }),
+      ],
+    ];
+    for (const [hook, payload] of sessions) {
+      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
+      const result = runHook(hook, payload);
+      expect(result.status, hook).toBe(0);
+      const advisory = emittedAdvisory(result.stdout);
+      expect(advisory, hook).toContain(".agents/rules.md");
+      expect(advisory, hook).not.toContain("AGENTS.md");
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // The shared advisory text — one sentence, declared once per language, held together by
 // these two assertions.
```

## Diff since red — Task 3 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-1.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index 7e2b563d6..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-1.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -183,9 +183,12 @@ describe("opencode plugin — the rules-read advisory", () => {
 // install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
 // ---------------------------------------------------------------------------

-/** The hook as install generates it (shared parts spliced in), in the temp dir. */
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
 function renderHook(rel: string): string {
-  const out = path.join(GENERATED, path.basename(rel));
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
   fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
   return out;
 }
@@ -207,6 +210,12 @@ function runHook(
   };
 }

+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
 describe("codex hook — the rules-read advisory", () => {
   it("codex hook writes the rules advisory as additionalContext once per session", () => {
     const payload = JSON.stringify({
@@ -282,8 +291,7 @@ describe("every rendered advisory hook", () => {
       expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
       const result = runHook(hook, payload);
       expect(result.status, hook).toBe(0);
-      const doc = JSON.parse(result.stdout);
-      const advisory = doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+      const advisory = emittedAdvisory(result.stdout);
       expect(advisory, hook).toContain(".agents/rules.md");
       expect(advisory, hook).not.toContain("AGENTS.md");
     }
```

## Diff since red — Task 3 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-2.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index 7e2b563d6..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-2.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -183,9 +183,12 @@ describe("opencode plugin — the rules-read advisory", () => {
 // install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
 // ---------------------------------------------------------------------------

-/** The hook as install generates it (shared parts spliced in), in the temp dir. */
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
 function renderHook(rel: string): string {
-  const out = path.join(GENERATED, path.basename(rel));
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
   fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
   return out;
 }
@@ -207,6 +210,12 @@ function runHook(
   };
 }

+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
 describe("codex hook — the rules-read advisory", () => {
   it("codex hook writes the rules advisory as additionalContext once per session", () => {
     const payload = JSON.stringify({
@@ -282,8 +291,7 @@ describe("every rendered advisory hook", () => {
       expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
       const result = runHook(hook, payload);
       expect(result.status, hook).toBe(0);
-      const doc = JSON.parse(result.stdout);
-      const advisory = doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+      const advisory = emittedAdvisory(result.stdout);
       expect(advisory, hook).toContain(".agents/rules.md");
       expect(advisory, hook).not.toContain("AGENTS.md");
     }
```

## Diff since red — Task 3 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-3.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index 7e2b563d6..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-3.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -183,9 +183,12 @@ describe("opencode plugin — the rules-read advisory", () => {
 // install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
 // ---------------------------------------------------------------------------

-/** The hook as install generates it (shared parts spliced in), in the temp dir. */
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
 function renderHook(rel: string): string {
-  const out = path.join(GENERATED, path.basename(rel));
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
   fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
   return out;
 }
@@ -207,6 +210,12 @@ function runHook(
   };
 }

+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
 describe("codex hook — the rules-read advisory", () => {
   it("codex hook writes the rules advisory as additionalContext once per session", () => {
     const payload = JSON.stringify({
@@ -282,8 +291,7 @@ describe("every rendered advisory hook", () => {
       expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
       const result = runHook(hook, payload);
       expect(result.status, hook).toBe(0);
-      const doc = JSON.parse(result.stdout);
-      const advisory = doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+      const advisory = emittedAdvisory(result.stdout);
       expect(advisory, hook).toContain(".agents/rules.md");
       expect(advisory, hook).not.toContain("AGENTS.md");
     }
```

## Diff since red — Task 3 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-4.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index 7e2b563d6..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-4.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -183,9 +183,12 @@ describe("opencode plugin — the rules-read advisory", () => {
 // install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
 // ---------------------------------------------------------------------------

-/** The hook as install generates it (shared parts spliced in), in the temp dir. */
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
 function renderHook(rel: string): string {
-  const out = path.join(GENERATED, path.basename(rel));
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
   fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
   return out;
 }
@@ -207,6 +210,12 @@ function runHook(
   };
 }

+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
 describe("codex hook — the rules-read advisory", () => {
   it("codex hook writes the rules advisory as additionalContext once per session", () => {
     const payload = JSON.stringify({
@@ -282,8 +291,7 @@ describe("every rendered advisory hook", () => {
       expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
       const result = runHook(hook, payload);
       expect(result.status, hook).toBe(0);
-      const doc = JSON.parse(result.stdout);
-      const advisory = doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+      const advisory = emittedAdvisory(result.stdout);
       expect(advisory, hook).toContain(".agents/rules.md");
       expect(advisory, hook).not.toContain("AGENTS.md");
     }
```

## Diff since red — Task 3 `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-5.snapshot b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
index 7e2b563d6..d832e0cf3 100644
--- a/docs/plans/202610/logs/700-session-start-nudge/build-task-red-1-3-5.snapshot
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -183,9 +183,12 @@ describe("opencode plugin — the rules-read advisory", () => {
 // install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
 // ---------------------------------------------------------------------------

-/** The hook as install generates it (shared parts spliced in), in the temp dir. */
+/**
+ * The hook as install generates it (shared parts spliced in), in the temp dir. The host
+ * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
+ */
 function renderHook(rel: string): string {
-  const out = path.join(GENERATED, path.basename(rel));
+  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
   fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
   return out;
 }
@@ -207,6 +210,12 @@ function runHook(
   };
 }

+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {
+  const doc = JSON.parse(stdout);
+  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+}
+
 describe("codex hook — the rules-read advisory", () => {
   it("codex hook writes the rules advisory as additionalContext once per session", () => {
     const payload = JSON.stringify({
@@ -282,8 +291,7 @@ describe("every rendered advisory hook", () => {
       expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
       const result = runHook(hook, payload);
       expect(result.status, hook).toBe(0);
-      const doc = JSON.parse(result.stdout);
-      const advisory = doc.hookSpecificOutput?.additionalContext ?? doc.reason;
+      const advisory = emittedAdvisory(result.stdout);
       expect(advisory, hook).toContain(".agents/rules.md");
       expect(advisory, hook).not.toContain("AGENTS.md");
     }
```
