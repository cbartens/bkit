diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
index e36b0d2f7..73425e354 100644
--- a/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
+++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs
@@ -43,7 +43,13 @@ const crypto = require("node:crypto");
 
 // Antigravity's file-writing tools. `write_to_file` creates or overwrites a whole file;
 // `replace_file_content` edits in place. `Edit` / `Write` are accepted as matchers too.
-const EDIT_TOOLS = new Set(["write_to_file", "replace_file_content", "Edit", "Write"]);
+const EDIT_TOOLS = new Set([
+  "write_to_file",
+  "replace_file_content",
+  "multi_replace_file_content",
+  "Edit",
+  "Write",
+]);
 
 // Antigravity names the touched path `TargetFile`; `file_path` / `path` / `target_file`
 // cover a consumer's own matcher. Resolved against cwd.
@@ -69,14 +75,29 @@ function bkitGateguard(payload) {
   const input = p.tool_input || {};
   const cwd = typeof p.cwd === "string" ? p.cwd : "";
   const sessionId = dedupKey(p.session_id, p.agent_id);
-  const target = parseEditTargets(input, cwd).find((t) => !alreadyWarned(sessionId, t.file));
-  if (!target) return null;
-  // A write_to_file to a not-yet-existing path is a NEW file and gets the reuse checklist;
-  // replace_file_content is always an in-place edit of an existing file.
-  const isNew = p.tool_name === "write_to_file" && !fs.existsSync(target.file);
-  const result = firstTouchAdvice(target.file, sessionId, isNew);
-  if (!result) return null;
-  return adviseOnce("gateguard", sessionId, agCallSignature(p.tool_name, input), result.context);
+  // Prepare every unwarned target (nothing recorded), select complete blocks inside the
+  // budget, and acknowledge them only once the deny-once transport has delivered them.
+  const blocks = [];
+  const seen = new Set();
+  for (const t of parseEditTargets(input, cwd)) {
+    // A write_to_file to a not-yet-existing path is a NEW file and gets the reuse
+    // checklist; the replace tools always edit an existing file in place.
+    const isNew = p.tool_name === "write_to_file" && !fs.existsSync(t.file);
+    const prepared = prepareAdvice(t.file, sessionId, isNew, cwd);
+    if (!prepared || seen.has(prepared.key)) continue;
+    seen.add(prepared.key);
+    blocks.push(prepared);
+  }
+  if (blocks.length === 0) return null;
+  const { selected, context } = selectAdvice(blocks, ADVICE_BUDGETS.antigravity);
+  const sent = adviseOnceDelivery(
+    "gateguard",
+    sessionId,
+    agCallSignature(p.tool_name, input),
+    context,
+  );
+  if (sent.delivered) acknowledgeSelected(selected);
+  return sent.decision;
 }
 
 // bkit:end
diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index 228daeab9..be28ad470 100644
--- a/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -42,6 +42,8 @@ const os = require("node:os");
 const path = require("node:path");
 const crypto = require("node:crypto");
 
+// {{BKIT_PART gateguard-engine.js}}
+
 // {{BKIT_PART guardrails-shell.js}}
 
 // {{BKIT_PART guardrails-tiers.js}}
@@ -116,12 +118,30 @@ function bkitGuardrails(payload) {
       reason: `bkit Antigravity guardrails: this command reads ${tier.path}, an env, secrets or private-key file, which may expose secrets. Prefer direnv or documented non-secret examples. Command: ${cmd}`,
     };
   }
-  const advisory =
+  const ctx = hookContext(p);
+  const notice = tier.edits ? shellEditAdvisory(tier.edits) : "";
+  const blocks = tier.edits
+    ? shellTargetBlocks(tier.edits.targets, ctx, p.session_id, p.agent_id)
+    : [];
+  const fetchLine =
     tier.tier === "fetch"
-      ? `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${cmd}` +
-        (tier.edits ? `\n\n${shellEditAdvisory(tier.edits)}` : "")
-      : shellEditAdvisory(tier.edits);
-  return adviseOnce("guardrails", p.session_id, agCallSignature(tool, input), advisory);
+      ? `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${cmd}`
+      : "";
+  // The fetch line, shell notice and retry text count against the budget with the blocks.
+  const fixed = [fetchLine, notice].filter(Boolean).join("\n\n");
+  const unit = ADVICE_BUDGETS.antigravity.unit;
+  const fixedCost = adviceSize(fixed, unit) + adviceSize(AG_RETRY_SUFFIX, unit) + (fixed ? 2 : 0);
+  const selection =
+    blocks.length > 0 ? selectAdvice(blocks, ADVICE_BUDGETS.antigravity, fixedCost) : null;
+  const advisory = [fixed, selection ? selection.context : ""].filter(Boolean).join("\n\n");
+  const sent = adviseOnceDelivery(
+    "guardrails",
+    p.session_id,
+    agCallSignature(tool, input),
+    advisory,
+  );
+  if (sent.delivered && selection) acknowledgeSelected(selection.selected);
+  return sent.decision;
 }
 
 // bkit:end
diff --git a/.bkit/core/.claude/hooks/bkit-guardrails.cjs b/.bkit/core/.claude/hooks/bkit-guardrails.cjs
index 3141a45f6..0171d2ed5 100644
--- a/.bkit/core/.claude/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.claude/hooks/bkit-guardrails.cjs
@@ -34,8 +34,11 @@
 // {{BKIT_MANAGED_MARKER}}
 
 const fs = require("node:fs");
+const os = require("node:os");
 const path = require("node:path");
 
+// {{BKIT_PART gateguard-engine.js}}
+
 // {{BKIT_PART guardrails-shell.js}}
 
 const SHELL_TOOL_NAMES = new Set(["Bash", "bash"]);
@@ -63,7 +66,19 @@ function bkitGuardrails(payload) {
     );
   }
   const edits = shellEditTargets(c, hookContext(payload));
-  if (hasEditEvidence(edits)) notes.push(shellEditAdvisory(edits));
+  if (hasEditEvidence(edits)) {
+    notes.push(
+      shellEditContext(
+        shellEditAdvisory(edits),
+        edits,
+        hookContext(payload),
+        payload.session_id,
+        payload.agent_id,
+        ADVICE_BUDGETS.claude,
+        notes.join("\n\n"),
+      ),
+    );
+  }
 
   return notes.length > 0 ? { context: notes.join("\n\n") } : null;
 }
diff --git a/.bkit/core/.codex/hooks/bkit-guardrails.cjs b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
index b14a23bff..668657130 100644
--- a/.bkit/core/.codex/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
@@ -36,8 +36,11 @@
 // {{BKIT_MANAGED_MARKER}}
 
 const fs = require("node:fs");
+const os = require("node:os");
 const path = require("node:path");
 
+// {{BKIT_PART gateguard-engine.js}}
+
 // {{BKIT_PART guardrails-shell.js}}
 
 // {{BKIT_PART guardrails-tiers.js}}
@@ -60,7 +63,7 @@ function deny(reason) {
  * @param {string[]} dirs where to look for the network allowlist (`hookDirs`)
  * @param {{ cwd?: string, root?: string }} ctx the call's directories (`hookContext`)
  */
-function decideShell(cmd, dirs, ctx) {
+function decideShell(cmd, dirs, ctx, session) {
   const c = String(cmd || "").trim();
   const v = classifyShell(c, dirs, ctx);
   if (!v) return allow();
@@ -83,7 +86,16 @@ function decideShell(cmd, dirs, ctx) {
       );
     default:
       // Shell-as-edit-channel: advisory on every host, never a block.
-      return ask(shellEditAdvisory(v.edits));
+      return ask(
+        shellEditContext(
+          shellEditAdvisory(v.edits),
+          v.edits,
+          ctx,
+          session,
+          undefined,
+          ADVICE_BUDGETS.codex,
+        ),
+      );
   }
 }
 
@@ -105,7 +117,7 @@ function bkitGuardrails(payload) {
   // Codex passes the command as a string, or as an argv array for some shells.
   const cmd = Array.isArray(input.command) ? input.command.join(" ") : input.command;
   if (typeof cmd !== "string") return null;
-  const decision = decideShell(cmd, hookDirs(payload), hookContext(payload));
+  const decision = decideShell(cmd, hookDirs(payload), hookContext(payload), payload.session_id);
   return decision.verdict === "allow" ? null : decision;
 }
 
diff --git a/.bkit/core/.cursor/hooks/bkit-guardrails.cjs b/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
index 1180bbe92..4fe468580 100644
--- a/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
@@ -28,8 +28,11 @@
 // {{BKIT_MANAGED_MARKER}}
 
 const fs = require("node:fs");
+const os = require("node:os");
 const path = require("node:path");
 
+// {{BKIT_PART gateguard-engine.js}}
+
 // {{BKIT_PART guardrails-shell.js}}
 
 // {{BKIT_PART guardrails-tiers.js}}
@@ -61,7 +64,7 @@ function deny(userMessage, agentMessage) {
  * @param {string[]} dirs where to look for the network allowlist (`hookDirs`)
  * @param {{ cwd?: string, root?: string }} ctx the call's directories (`hookContext`)
  */
-function decideShell(cmd, dirs, ctx) {
+function decideShell(cmd, dirs, ctx, session) {
   const c = cmd.trim();
   const v = classifyShell(c, dirs, ctx);
   if (!v) return allow();
@@ -86,7 +89,17 @@ function decideShell(cmd, dirs, ctx) {
     default:
       // Shell-as-edit-channel: ADVISORY, never a block — allow plus an `agent_message`
       // naming the edited paths.
-      return { permission: "allow", agent_message: shellEditAdvisory(v.edits) };
+      return {
+        permission: "allow",
+        agent_message: shellEditContext(
+          shellEditAdvisory(v.edits),
+          v.edits,
+          ctx,
+          session,
+          undefined,
+          ADVICE_BUDGETS.cursor,
+        ),
+      };
   }
 }
 
@@ -118,7 +131,12 @@ function bkitGuardrails(payload) {
     payload.tool_name == null &&
     payload.tool_input == null
   ) {
-    return decideShell(payload.command, hookDirs(payload), hookContext(payload));
+    return decideShell(
+      payload.command,
+      hookDirs(payload),
+      hookContext(payload),
+      payload.session_id || payload.conversation_id,
+    );
   }
 
   // preToolUse Read/TabRead: { tool_name, tool_input: { path|file_path|target_file|... } }
diff --git a/.bkit/core/.opencode/plugin/bkit-gateguard.js b/.bkit/core/.opencode/plugin/bkit-gateguard.js
index 987b4d43a..d595db014 100644
--- a/.bkit/core/.opencode/plugin/bkit-gateguard.js
+++ b/.bkit/core/.opencode/plugin/bkit-gateguard.js
@@ -187,12 +187,18 @@ function advisoryFor(tool, targets, sessionID, isNewFile) {
   const mode = process.env.BKIT_GATEGUARD;
   if (mode === "off" || mode === "deny") return null;
   if (!EDIT_TOOLS.has(tool)) return null;
-  const contexts = [];
+  // Every target is prepared (nothing recorded); only complete blocks inside the OpenCode
+  // budget are shown and acknowledged. Alias spellings of one file share one identity.
+  const blocks = [];
+  const seen = new Set();
   for (const target of targets) {
-    const result = firstTouchAdvice(target.file, sessionID, target.isNew ?? isNewFile);
-    if (result) contexts.push(result.context);
+    const prepared = prepareAdvice(target.file, sessionID, target.isNew ?? isNewFile);
+    if (!prepared || seen.has(prepared.key)) continue;
+    seen.add(prepared.key);
+    blocks.push(prepared);
   }
-  return contexts.length > 0 ? contexts.join("\n\n") : null;
+  const delivered = deliverAdvice(blocks, ADVICE_BUDGETS.opencode, true);
+  return delivered ? delivered.context : null;
 }
 
 /** OpenCode 1.x before hook: `(input, output)`, tool args on `output.args`. */
diff --git a/.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts b/.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts
index a837d2d3b..a3de2fb58 100644
--- a/.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts
@@ -300,3 +300,112 @@ describe("gateguard hook — docs/*.md density advisory (#422)", () => {
     expect(hookOutput(r)["additionalContext"]).toContain("docs/*.md authoring");
   });
 });
+
+const GUARD = path.join(GENERATED, "guardrails.cjs");
+fs.writeFileSync(GUARD, readTemplate(path.resolve(".bkit/core/.claude/hooks/bkit-guardrails.cjs")));
+
+function runGuard(payload: unknown): { status: number | null; raw: string; context: string } {
+  const res = spawnSync("node", [GUARD], {
+    input: JSON.stringify(payload),
+    encoding: "utf-8",
+    env: { ...process.env, BKIT_GATEGUARD: undefined },
+  });
+  const out = res.stdout.trim()
+    ? (JSON.parse(res.stdout.trim()) as { hookSpecificOutput: Record<string, unknown> })
+    : { hookSpecificOutput: { additionalContext: "" } };
+  expect(out.hookSpecificOutput["permissionDecision"]).toBeUndefined();
+  return {
+    status: res.status,
+    raw: res.stdout,
+    context: String(out.hookSpecificOutput["additionalContext"]),
+  };
+}
+
+describe("gateguard hook — shell and notebook advice (shared identity)", () => {
+  it("routes Claude notebook and shell targets through shared advice", () => {
+    // Matcher and payload agree: the registered edit matcher names NotebookEdit.
+    const settings = JSON.parse(
+      fs.readFileSync(path.resolve(".bkit/shared/.claude/settings.json"), "utf-8"),
+    ) as { hooks: { PreToolUse: { matcher?: string; hooks: { command: string }[] }[] } };
+    const gate = settings.hooks.PreToolUse.find((g) =>
+      g.hooks.some((h) => h.command.includes("bkit-gateguard.cjs")),
+    );
+    expect(String(gate?.matcher).split("|")).toEqual(
+      expect.arrayContaining(["Edit", "Write", "MultiEdit", "NotebookEdit"]),
+    );
+
+    const ws = fs.mkdtempSync(path.join(GENERATED, "ws-"));
+    const session = newSession();
+
+    // NotebookEdit carries `notebook_path`, not `file_path`.
+    const nb = path.join(ws, "docs", "analysis.ipynb");
+    const notebook = run({
+      session_id: session,
+      hook_event_name: "PreToolUse",
+      tool_name: "NotebookEdit",
+      tool_input: { notebook_path: nb, new_source: "x = 1", edit_mode: "replace" },
+    });
+    expect(notebook.status).toBe(0);
+    const nbCtx = String(hookOutput(notebook)["additionalContext"]);
+    expect(nbCtx).toContain("analysis.ipynb");
+    expect(nbCtx).toContain("First edit to");
+    expect(hookOutput(notebook)["permissionDecision"]).toBeUndefined();
+    // Acknowledged: the same notebook is silent next time.
+    expect(
+      run({
+        session_id: session,
+        tool_name: "NotebookEdit",
+        tool_input: { notebook_path: nb, new_source: "y", edit_mode: "replace" },
+      }).raw.trim(),
+    ).toBe("");
+
+    // A shell edit of two exact targets gets the per-file checklist for each, plus the
+    // general authoring reminder, in one response.
+    const shell = runGuard({
+      session_id: session,
+      tool_name: "Bash",
+      cwd: ws,
+      tool_input: { command: "sed -i s/a/b/ docs/one.md docs/two.md" },
+    });
+    expect(shell.status).toBe(0);
+    expect(shell.context).toContain("edits files through the shell");
+    expect(shell.context).toContain("one.md");
+    expect(shell.context).toContain("two.md");
+    expect(shell.context.split("First edit to")).toHaveLength(3);
+    expect(shell.context).toContain(".bkit/authoring.md");
+    expect(shell.context).toContain("Which Sections Apply");
+
+    // The shell acknowledgement and the edit tool share one warning record.
+    const afterShell = run(editPayload(path.join(ws, "docs", "one.md"), session));
+    expect(afterShell.raw.trim()).toBe("");
+
+    // And the other direction: an edit-tool warning silences the shell checklist.
+    run(editPayload(path.join(ws, "docs", "three.md"), session));
+    const again = runGuard({
+      session_id: session,
+      tool_name: "Bash",
+      cwd: ws,
+      tool_input: { command: "sed -i s/a/b/ docs/three.md" },
+    });
+    expect(again.context).toContain("three.md");
+    expect(again.context).not.toContain("First edit to");
+
+    // Uncertain script effects stay explicit and read-only commands stay quiet.
+    const unknown = runGuard({
+      session_id: newSession(),
+      tool_name: "Bash",
+      cwd: ws,
+      tool_input: { command: "python3 gen.py" },
+    });
+    expect(unknown.context).toContain("cannot be determined");
+    expect(unknown.context).toContain(".bkit/authoring.md");
+    expect(
+      runGuard({
+        session_id: newSession(),
+        tool_name: "Bash",
+        cwd: ws,
+        tool_input: { command: "cat docs/one.md" },
+      }).raw.trim(),
+    ).toBe("");
+  });
+});
diff --git a/.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts b/.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts
index d752f8cbf..76d45040f 100644
--- a/.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts
@@ -192,3 +192,70 @@ describe("gateguard managed-block parity — cursor vs claude", () => {
     expect(src.split("process.stdout.write").length - 1).toBe(1);
   });
 });
+
+describe("cursor gateguard — delete and shell advice", () => {
+  const GUARD = path.join(GENERATED, "guardrails.cjs");
+  fs.writeFileSync(
+    GUARD,
+    readTemplate(path.resolve(".bkit/core/.cursor/hooks/bkit-guardrails.cjs")),
+  );
+
+  function runShell(command: string, session: string) {
+    const res = spawnSync("node", [GUARD], {
+      cwd: workspace,
+      input: JSON.stringify({
+        command,
+        cwd: workspace,
+        conversation_id: session,
+        session_id: session,
+        workspace_roots: [workspace],
+        hook_event_name: "beforeShellExecution",
+      }),
+      encoding: "utf-8",
+      env: { ...process.env, BKIT_GATEGUARD: undefined },
+    });
+    return JSON.parse(res.stdout.trim()) as { permission?: string; agent_message?: string };
+  }
+
+  it("routes Cursor delete and shell targets without replacing its driver", () => {
+    // Matcher and payload agree: the registered edit surface names Delete.
+    const hooks = JSON.parse(
+      fs.readFileSync(path.resolve(".bkit/shared/.cursor/hooks.json"), "utf-8"),
+    ) as { hooks: { preToolUse: { command: string; matcher?: string }[] } };
+    const gate = hooks.hooks.preToolUse.find((h) => h.command.includes("bkit-gateguard.cjs"));
+    expect(String(gate?.matcher).split("|")).toEqual(expect.arrayContaining(["Write", "Delete"]));
+
+    // A Delete payload reaches the shared advice with the same allow envelope.
+    fs.mkdirSync(path.join(workspace, "docs"));
+    fs.writeFileSync(path.join(workspace, "docs", "gone.md"), "x\n", "utf-8");
+    const session = newSession();
+    const del = run({
+      ...writePayload("docs/gone.md", session),
+      tool_name: "Delete",
+      tool_input: { file_path: "docs/gone.md" },
+    });
+    expect(del.out["permission"]).toBe("allow");
+    expect(String(del.out["additional_context"])).toContain("gone.md");
+    expect(String(del.out["additional_context"])).toContain("First edit to");
+
+    // A shell edit gets the per-file checklist and the general reminder in agent_message,
+    // still an allow, and shares the warning record with the edit tools.
+    const shell = runShell("sed -i s/a/b/ docs/shell.md", session);
+    expect(shell.permission).toBe("allow");
+    expect(String(shell.agent_message)).toContain("edits files through the shell");
+    expect(String(shell.agent_message)).toContain("First edit to");
+    expect(String(shell.agent_message)).toContain("Which Sections Apply");
+    const after = run(writePayload("docs/shell.md", session));
+    expect(after.out["additional_context"]).toBeUndefined();
+
+    // The outer driver is untouched: still the single emitter and the same envelope.
+    const src = fs.readFileSync(HOOK, "utf-8");
+    const driver = src.slice(src.indexOf("// bkit:end"));
+    expect(driver).toContain("resolveAgainstWorkspace(");
+    expect(driver).toContain('emit({ permission: "allow", additional_context: result.context })');
+    expect(driver).toContain(
+      'emit(\n        result.mode === "deny"\n          ? { permission: "deny", agent_message: result.context, user_message: result.context }',
+    );
+    expect(src.split("process.stdout.write").length - 1).toBe(1);
+  });
+});
diff --git a/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts b/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts
index d40da5187..838a809ac 100644
--- a/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts
@@ -847,3 +847,259 @@ describe("codex gateguard — complete-block batching", () => {
     expect(codexPatch(session, [small], tmp)).toBe("");
   });
 });
+
+// ---------------------------------------------------------------------------
+// Task 8: Codex complete patches and initial shell commands.
+// ---------------------------------------------------------------------------
+
+const CODEX_GUARD = path.join(GENERATED, "codex-guardrails.cjs");
+fs.writeFileSync(
+  CODEX_GUARD,
+  readTemplate(path.resolve(".bkit/core/.codex/hooks/bkit-guardrails.cjs")),
+);
+
+function codexBash(session: string, command: string, tmp: string, toolName = "Bash") {
+  const res = spawnSync("node", [CODEX_GUARD], {
+    input: JSON.stringify({
+      tool_name: toolName,
+      tool_input: { command },
+      session_id: session,
+      cwd: process.cwd(),
+    }),
+    encoding: "utf-8",
+    env: { ...process.env, BKIT_GATEGUARD: undefined, TMPDIR: tmp },
+  });
+  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
+  return {
+    context: String(out.hookSpecificOutput?.additionalContext ?? ""),
+    denied: out.hookSpecificOutput?.permissionDecision === "deny",
+  };
+}
+
+describe("codex gateguard — complete patches and shell", () => {
+  it("routes Codex complete patches and initial shell commands", () => {
+    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
+    const root = process.cwd();
+
+    // Every add / update / delete / move target of one patch is prepared; each is either
+    // shown as a complete block or counted as omitted and left eligible.
+    const session = newSession();
+    const command = [
+      "*** Begin Patch",
+      "*** Add File: src/p-add.ts",
+      "+x",
+      "*** Delete File: src/p-del.ts",
+      "*** Update File: src/p-upd.ts",
+      "*** Move to: src/p-moved.ts",
+      "@@",
+      "-a",
+      "+b",
+      "*** End Patch",
+    ].join("\n");
+    const res = spawnSync("node", [CODEX_HOOK], {
+      input: JSON.stringify({
+        tool_name: "apply_patch",
+        tool_input: { command },
+        session_id: session,
+        cwd: root,
+      }),
+      encoding: "utf-8",
+      env: { ...process.env, BKIT_GATEGUARD: undefined, TMPDIR: tmp },
+    });
+    const patchAdvice = String(JSON.parse(res.stdout.trim()).hookSpecificOutput.additionalContext);
+    const names = ["p-add.ts", "p-del.ts", "p-upd.ts", "p-moved.ts"];
+    const shown = names.filter((n) => patchAdvice.includes(n));
+    expect(Buffer.byteLength(patchAdvice, "utf-8")).toBeLessThanOrEqual(CODEX_BUDGET_BYTES);
+    expect(shown.length + Number(omittedCount(patchAdvice))).toBe(names.length);
+    expect(warnedFiles(tmp, session)).toHaveLength(shown.length);
+    // The omitted targets are still eligible for a later patch.
+    const hidden = names.filter((n) => !shown.includes(n));
+    for (const n of hidden) expect(codexPatch(session, [`src/${n}`], tmp)).toContain(n);
+
+    // Initial Bash payloads reach the shared formatter: exact targets get the per-file
+    // checklist, the shell notice stays advisory, and the warning record is shared.
+    const shellSession = newSession();
+    const shell = codexBash(shellSession, "sed -i s/a/b/ src/from-shell.ts", tmp);
+    expect(shell.denied).toBe(false);
+    expect(shell.context).toContain("edits files through the shell");
+    expect(shell.context).toContain("from-shell.ts");
+    expect(shell.context).toContain("First edit to");
+    expect(warnedFiles(tmp, shellSession)).toEqual([path.resolve(root, "src/from-shell.ts")]);
+    expect(codexPatch(shellSession, ["src/from-shell.ts"], tmp)).toBe("");
+
+    // Uncertain script effects stay explicit.
+    const unknown = codexBash(newSession(), "python3 gen.py", tmp);
+    expect(unknown.context).toContain("cannot be determined");
+
+    // Interactive input is outside the pre-tool coverage: not registered, not advised.
+    const hooks = JSON.parse(
+      fs.readFileSync(path.resolve(".bkit/shared/.codex/hooks.json"), "utf-8"),
+    ) as { hooks: { PreToolUse: { matcher: string }[] } };
+    const matchers = hooks.hooks.PreToolUse.map((g) => g.matcher);
+    expect(matchers).toEqual(expect.arrayContaining(["apply_patch", "Bash"]));
+    expect(matchers.join("|")).not.toContain("write_stdin");
+    expect(codexBash(newSession(), "sed -i s/a/b/ src/x.ts", tmp, "write_stdin").context).toBe("");
+  });
+});
+
+// ---------------------------------------------------------------------------
+// Task 9: OpenCode edit coverage and the after-execute boundary, on the real V1 and V2
+// drivers.
+// ---------------------------------------------------------------------------
+
+interface OpencodeDrivers {
+  v1After: (input: object, output: { output: string }) => Promise<void>;
+  v1Before: (input: object, output: object) => Promise<void>;
+  v2: Record<string, (event: object) => Promise<void>>;
+}
+
+async function opencodeDrivers(): Promise<OpencodeDrivers> {
+  const { default: plugin } = await import(pathToFileURL(OPENCODE_PLUGIN).href);
+  const v2: Record<string, (event: object) => Promise<void>> = {};
+  await plugin.setup({
+    tool: {
+      hook: async (name: string, cb: (event: object) => Promise<void>) => {
+        v2[name] = cb;
+      },
+    },
+  });
+  const v1 = await plugin.server();
+  return {
+    v1Before: v1["tool.execute.before"],
+    v1After: v1["tool.execute.after"],
+    v2,
+  };
+}
+
+describe("opencode gateguard — edit coverage and boundary", () => {
+  it("preserves OpenCode edit coverage and after-execute boundary", async () => {
+    const d = await opencodeDrivers();
+    const root = process.cwd();
+    const patch = (names: string[]) =>
+      [
+        "*** Begin Patch",
+        ...names.flatMap((n) => [`*** Update File: src/${n}`, "@@", "-a", "+b"]),
+        "*** End Patch",
+      ].join("\n");
+
+    // V2: before never advises (no shell interception, no before-edit claim); the after
+    // hook appends one complete block per patch target, each exactly once.
+    const v2Session = newSession();
+    const v2Names = ["oc2-a.ts", "oc2-b.ts", "oc2-c.ts"];
+    const v2Event = {
+      tool: "apply_patch",
+      sessionID: v2Session,
+      id: "oc-v2-1",
+      input: { patchText: patch(v2Names) },
+    };
+    await d.v2["execute.before"](v2Event);
+    const v2Result: { content: { type: string; text: string }[] } = { content: [] };
+    await d.v2["execute.after"]({ ...v2Event, status: "completed", result: v2Result });
+    const v2Text = v2Result.content.map((c) => c.text).join("");
+    for (const n of v2Names) expect(v2Text).toContain(n);
+    expect(v2Text.split("[bkit GateGuard] First edit to")).toHaveLength(v2Names.length + 1);
+
+    // A later edit that reaches the same file by an absolute alias is silent.
+    const alias: { content: { type: string; text: string }[] } = { content: [] };
+    await d.v2["execute.after"]({
+      tool: "edit",
+      sessionID: v2Session,
+      id: "oc-v2-2",
+      status: "completed",
+      input: { path: path.join(root, "src", v2Names[0]!) },
+      result: alias,
+    });
+    expect(alias.content).toEqual([]);
+
+    // V1: same coverage through the server() hooks, output on `output.output`.
+    const v1Session = newSession();
+    const v1Names = ["oc1-a.ts", "oc1-b.ts"];
+    const v1Args = { patchText: patch(v1Names) };
+    await d.v1Before(
+      { tool: "apply_patch", sessionID: v1Session, callID: "oc-v1-1" },
+      { args: v1Args },
+    );
+    const v1Out = { output: "" };
+    await d.v1After(
+      { tool: "apply_patch", sessionID: v1Session, callID: "oc-v1-1", args: v1Args },
+      v1Out,
+    );
+    for (const n of v1Names) expect(v1Out.output).toContain(n);
+    const v1Alias = { output: "" };
+    await d.v1After(
+      {
+        tool: "edit",
+        sessionID: v1Session,
+        callID: "oc-v1-2",
+        args: { filePath: path.join(root, "src", v1Names[1]!) },
+      },
+      v1Alias,
+    );
+    expect(v1Alias.output).toBe("");
+
+    // A relative spelling after an absolute one is also the same file.
+    const v1Rel = { output: "" };
+    const absFirst = path.join(root, "src", "oc1-abs.ts");
+    await d.v1After(
+      { tool: "edit", sessionID: v1Session, callID: "oc-v1-3", args: { filePath: absFirst } },
+      { output: "" },
+    );
+    await d.v1After(
+      {
+        tool: "edit",
+        sessionID: v1Session,
+        callID: "oc-v1-4",
+        args: { filePath: "src/oc1-abs.ts" },
+      },
+      v1Rel,
+    );
+    expect(v1Rel.output).toBe("");
+
+    // A large patch stays inside the widest conservative host budget (8,000 characters):
+    // only whole blocks are shown, the omitted count is exact, and anything a block did
+    // not show stays eligible for its own later edit.
+    const manySession = newSession();
+    const many = Array.from({ length: 60 }, (_, i) => `oc-many-${i}.ts`);
+    const manyResult: { content: { type: string; text: string }[] } = { content: [] };
+    await d.v2["execute.after"]({
+      tool: "apply_patch",
+      sessionID: manySession,
+      id: "oc-v2-many",
+      status: "completed",
+      input: { patchText: patch(many) },
+      result: manyResult,
+    });
+    const manyText = manyResult.content.map((c) => c.text).join("");
+    expect(manyText.length).toBeLessThanOrEqual(8000);
+    const { started, finished } = completeBlocks(manyText);
+    expect(finished).toBe(started);
+    expect(omittedCount(manyText)).toBe(many.length - started);
+    const missing = many.filter((n) => !manyText.includes(n));
+    expect(missing).toHaveLength(many.length - started);
+    for (const n of missing.slice(0, 3)) {
+      const one: { content: { type: string; text: string }[] } = { content: [] };
+      await d.v2["execute.after"]({
+        tool: "edit",
+        sessionID: manySession,
+        id: `oc-v2-${n}`,
+        status: "completed",
+        input: { path: `src/${n}` },
+        result: one,
+      });
+      expect(one.content.map((c) => c.text).join("")).toContain(n);
+    }
+
+    // The plugin registers edit hooks only: no shell hook and no extra phase.
+    expect(Object.keys(d.v2).sort()).toEqual(["execute.after", "execute.before"]);
+    const shellResult: { content: { type: string; text: string }[] } = { content: [] };
+    await d.v2["execute.after"]({
+      tool: "bash",
+      sessionID: newSession(),
+      id: "oc-shell",
+      status: "completed",
+      input: { command: "sed -i s/a/b/ src/oc-shell.ts" },
+      result: shellResult,
+    });
+    expect(shellResult.content).toEqual([]);
+  });
+});
diff --git a/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
index 7ea81c016..0c91b96e4 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
@@ -212,3 +212,113 @@ describe("antigravity guardrails.cjs — network allowlist from the plugin dir",
     ).toBe("deny");
   });
 });
+
+describe("antigravity gateguard — multi-replace, shell targets and retry transport", () => {
+  const GATE = path.join(GENERATED, "gateguard.cjs");
+  fs.writeFileSync(
+    GATE,
+    readTemplate(path.resolve(".bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs")),
+  );
+  const UID = process.getuid!();
+
+  function edit(
+    name: string,
+    target: string,
+    conversationId: string,
+    env: Record<string, string | undefined> = {},
+  ): { decision?: string; reason?: string } {
+    const res = spawnSync("node", [GATE], {
+      input: JSON.stringify({
+        conversationId,
+        toolCall: {
+          name,
+          args: {
+            TargetFile: target,
+            ReplacementChunks: [{ TargetContent: "a", ReplacementContent: "b" }],
+            toolAction: "Editing file",
+          },
+        },
+        workspacePaths: [GENERATED],
+      }),
+      encoding: "utf-8",
+      env: { ...process.env, BKIT_GATEGUARD: undefined, ...env },
+    });
+    expect(res.status).toBe(0);
+    return JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
+  }
+
+  it("routes Antigravity multi-replace and shell targets", () => {
+    // Matcher and payload agree.
+    const hooks = JSON.parse(
+      fs.readFileSync(path.resolve(".bkit/shared/.agents/plugins/bkit/hooks.json"), "utf-8"),
+    ) as { hooks: { PreToolUse: { matcher: string; hooks: { command: string }[] }[] } };
+    const gate = hooks.hooks.PreToolUse.find((g) =>
+      g.hooks.some((h) => h.command.includes("bkit-gateguard.cjs")),
+    );
+    expect(String(gate?.matcher).split("|")).toEqual(
+      expect.arrayContaining([
+        "write_to_file",
+        "replace_file_content",
+        "multi_replace_file_content",
+      ]),
+    );
+
+    // A multi-replace keeps its target: deny once with the checklist, identical retry passes.
+    const conversation = newConversation();
+    const target = path.join(GENERATED, "src", "multi.ts");
+    const first = edit("multi_replace_file_content", target, conversation);
+    expect(first.decision).toBe("deny");
+    expect(first.reason).toContain("multi.ts");
+    expect(first.reason).toContain("First edit to");
+    expect(first.reason).toContain("Repeat the same call to proceed.");
+    expect(edit("multi_replace_file_content", target, conversation)).toEqual({ decision: "allow" });
+
+    // A shell edit of an exact target gets the per-file checklist inside the same deny-once
+    // transport, and its acknowledgement silences the edit tool for that file.
+    const shellConversation = newConversation();
+    const shell = run("sed -i s/a/b/ docs/shell-ag.md", shellConversation);
+    expect(shell.decision).toBe("deny");
+    expect(shell.reason).toContain("edits files through the shell");
+    expect(shell.reason).toContain("First edit to");
+    expect(shell.reason).toContain("Which Sections Apply");
+    expect(run("sed -i s/a/b/ docs/shell-ag.md", shellConversation)).toEqual({
+      decision: "allow",
+    });
+    expect(
+      edit("replace_file_content", path.join(GENERATED, "docs", "shell-ag.md"), shellConversation),
+    ).toEqual({ decision: "allow" });
+
+    // Neither retry store keeps raw command or path text.
+    const store = path.join(os.tmpdir(), `bkit-antigravity-retry-${UID}`);
+    const stored = fs
+      .readdirSync(store)
+      .filter((f) => f.includes(shellConversation))
+      .map((f) => fs.readFileSync(path.join(store, f), "utf-8"));
+    for (const text of stored) {
+      expect(text).not.toContain("sed -i");
+      expect(text).not.toContain("shell-ag.md");
+    }
+  });
+
+  it("leaves Antigravity targets eligible when retry transport cannot deliver", () => {
+    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
+    const retryDir = path.join(tmp, `bkit-antigravity-retry-${UID}`);
+    fs.mkdirSync(retryDir, { mode: 0o555 });
+    const env = { TMPDIR: tmp };
+    const conversation = newConversation();
+    const target = path.join(GENERATED, "src", "undeliverable.ts");
+
+    // The retry store cannot be written: the established fail-open bare allow, twice.
+    expect(edit("replace_file_content", target, conversation, env)).toEqual({ decision: "allow" });
+    expect(edit("replace_file_content", target, conversation, env)).toEqual({ decision: "allow" });
+
+    // Nothing was delivered, so nothing was acknowledged: once the store works, the
+    // target still gets its deny-once checklist.
+    fs.chmodSync(retryDir, 0o755);
+    const later = edit("replace_file_content", target, conversation, env);
+    expect(later.decision).toBe("deny");
+    expect(later.reason).toContain("undeliverable.ts");
+    expect(later.reason).toContain("First edit to");
+    expect(edit("replace_file_content", target, conversation, env)).toEqual({ decision: "allow" });
+  });
+});
diff --git a/.bkit/core/hooks/antigravity-hook.js b/.bkit/core/hooks/antigravity-hook.js
index 97d8fef38..9f76203bc 100644
--- a/.bkit/core/hooks/antigravity-hook.js
+++ b/.bkit/core/hooks/antigravity-hook.js
@@ -60,6 +60,19 @@ function agRetryFile(hook, sessionId) {
  * its own process, so a deny it cannot record would block every retry.
  */
 function adviseOnce(hook, sessionId, signature, advisory) {
+  return adviseOnceDelivery(hook, sessionId, signature, advisory).decision;
+}
+
+/**
+ * `adviseOnce` with its transport outcome: `{ decision, delivered }`. `delivered` is true
+ * only when the call was denied with the advisory as the reason. An identical retry or an
+ * unusable retry store returns the bare allow with `delivered` false, so the caller leaves
+ * the advised targets unacknowledged.
+ */
+const AG_RETRY_SUFFIX =
+  "\nThis call was held once so you see this advisory. Repeat the same call to proceed.";
+
+function adviseOnceDelivery(hook, sessionId, signature, advisory) {
   const file = agRetryFile(hook, sessionId);
   // One-way digest of the call signature: the retry store is world-readable and has no
   // TTL, so no tool argument (a shell command line with an inline secret, a file path)
@@ -69,15 +82,18 @@ function adviseOnce(hook, sessionId, signature, advisory) {
     const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
     if (last === digest) {
       fs.rmSync(file, { force: true });
-      return { decision: "allow" };
+      return { decision: { decision: "allow" }, delivered: false };
     }
     fs.mkdirSync(path.dirname(file), { recursive: true });
     fs.writeFileSync(file, digest, "utf-8");
   } catch {
-    return { decision: "allow" };
+    return { decision: { decision: "allow" }, delivered: false };
   }
   return {
-    decision: "deny",
-    reason: `${advisory}\nThis call was held once so you see this advisory. Repeat the same call to proceed.`,
+    decision: {
+      decision: "deny",
+      reason: `${advisory}${AG_RETRY_SUFFIX}`,
+    },
+    delivered: true,
   };
 }
diff --git a/.bkit/core/hooks/gateguard-edit-payload.js b/.bkit/core/hooks/gateguard-edit-payload.js
index cca4883d0..ec6dd06f1 100644
--- a/.bkit/core/hooks/gateguard-edit-payload.js
+++ b/.bkit/core/hooks/gateguard-edit-payload.js
@@ -1,6 +1,8 @@
-// Edit / Write / MultiEdit payload adapter, shared by the Claude Code and Cursor hooks:
-// `{ tool_name, tool_input: { file_path | path }, session_id }`.
-const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);
+// Edit / Write / MultiEdit / NotebookEdit / Delete payload adapter, shared by the Claude Code
+// and Cursor hooks: `{ tool_name, tool_input: { file_path | path | notebook_path }, session_id,
+// cwd }`. `NotebookEdit` (Claude) names its target `notebook_path`; `Delete` (Cursor) uses
+// `file_path`.
+const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit", "Delete"]);
 
 // Pure: takes the already-parsed hook payload, returns the advisory to emit or
 // null. Never touches process.stdin / process.stdout — the driver below owns both.
@@ -10,9 +12,10 @@ const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);
 function bkitGateguard(payload) {
   if (!EDIT_TOOLS.has(payload.tool_name)) return null;
   const input = payload.tool_input || {};
-  const filePath = input.file_path || input.path;
+  const filePath = input.file_path || input.path || input.notebook_path;
   // A Write to a not-yet-existing path is a NEW file and gets the reuse checklist.
   const isNewFile =
     payload.tool_name === "Write" && typeof filePath === "string" && !fs.existsSync(filePath);
-  return firstTouchAdvice(filePath, dedupKey(payload.session_id, payload.agent_id), isNewFile);
+  const cwd = typeof payload.cwd === "string" ? payload.cwd : undefined;
+  return firstTouchAdvice(filePath, dedupKey(payload.session_id, payload.agent_id), isNewFile, cwd);
 }
diff --git a/.bkit/core/hooks/gateguard-engine.js b/.bkit/core/hooks/gateguard-engine.js
index 84dedfab1..5bb31518e 100644
--- a/.bkit/core/hooks/gateguard-engine.js
+++ b/.bkit/core/hooks/gateguard-engine.js
@@ -299,47 +299,109 @@ const ADVICE_BUDGETS = {
   codex: { limit: 2000, unit: "bytes" },
   cursor: { limit: 2000, unit: "bytes" },
   antigravity: { limit: 2000, unit: "bytes" },
+  opencode: { limit: 8000, unit: "chars" },
 };
-const ADVICE_NOTICE_RESERVE = 512;
+
+const ADVICE_NOTICE_RESERVE = 300;
 
 function adviceSize(text, unit) {
   return unit === "bytes" ? Buffer.byteLength(text, "utf-8") : text.length;
 }
 
-// Delivers prepared advice blocks inside `budget`: only whole blocks, in order, with
-// `ADVICE_NOTICE_RESERVE` units kept for the omitted-target notice. Acknowledges exactly
-// the selected blocks, and only when `verified` says the route reaches the model. Returns
-// `{ mode, context }` or null when there is nothing to say.
-function deliverAdvice(blocks, budget, verified) {
-  if (blocks.length === 0) return null;
+// Selects prepared advice blocks inside `budget`: only whole blocks, in order, with
+// `ADVICE_NOTICE_RESERVE` units kept for the omitted-target notice. Pure: acknowledges
+// nothing. `fixedCost` is the size (in the budget's unit) of text the caller adds around
+// the blocks, so the whole composed advice fits. Returns `{ selected, context }`
+// (`context` includes the omitted-target notice).
+function selectAdvice(blocks, budget, fixedCost = 0) {
   const sep = "\n\n";
-  const room = budget.limit - ADVICE_NOTICE_RESERVE;
-  const selected = [];
-  const omitted = [];
-  let used = 0;
-  for (const b of blocks) {
-    const cost = adviceSize(b.context, budget.unit) + (selected.length > 0 ? sep.length : 0);
-    if (used + cost <= room) {
-      selected.push(b);
-      used += cost;
-    } else {
-      omitted.push(b);
+  const pick = (room) => {
+    const selected = [];
+    const omitted = [];
+    let used = 0;
+    for (const b of blocks) {
+      const cost = adviceSize(b.context, budget.unit) + (selected.length > 0 ? sep.length : 0);
+      if (used + cost <= room) {
+        selected.push(b);
+        used += cost;
+      } else {
+        omitted.push(b);
+      }
     }
-  }
-  const texts = selected.map((b) => b.context);
-  if (omitted.length > 0) {
+    return { selected, omitted };
+  };
+  const omittedNotice = (omitted) => {
     const reminder = omitted.some((b) => b.agentRead)
       ? " Agent-read files: see `.bkit/authoring.md` § Which Sections Apply."
       : "";
-    texts.push(
-      `[bkit GateGuard] ${omitted.length} target${omitted.length === 1 ? "" : "s"} omitted (output limit); they stay unacknowledged and are advised on a later edit.${reminder}`,
-    );
+    return `[bkit GateGuard] ${omitted.length} target${omitted.length === 1 ? "" : "s"} omitted (output limit); they stay unacknowledged and are advised on a later edit.${reminder}`;
+  };
+  let { selected, omitted } = pick(
+    budget.limit - (fixedCost > 0 ? 0 : ADVICE_NOTICE_RESERVE) - fixedCost,
+  );
+  if (fixedCost > 0 && omitted.length > 0) {
+    // Composed advice counts its own text, so the omitted-target notice is sized exactly
+    // (worst case: every block omitted) instead of by the fixed reserve.
+    const noticeRoom = adviceSize(omittedNotice(blocks), budget.unit) + sep.length;
+    ({ selected, omitted } = pick(budget.limit - fixedCost - noticeRoom));
   }
-  let mode = "advisory";
-  if (verified) {
-    let durable = true;
-    for (const b of selected) if (!acknowledgeAdvice(b)) durable = false;
-    mode = selected.length > 0 && (durable || processPersists()) ? selected[0].mode : "advisory";
+  const texts = selected.map((b) => b.context);
+  if (omitted.length > 0) texts.push(omittedNotice(omitted));
+  return { selected, context: texts.join(sep) };
+}
+
+// Records the selected blocks once their route has delivered them. Returns the mode to
+// report: a deny only when every record is durable (or the process outlives the call).
+function acknowledgeSelected(selected) {
+  if (selected.length === 0) return "advisory";
+  let durable = true;
+  for (const b of selected) if (!acknowledgeAdvice(b)) durable = false;
+  return durable || processPersists() ? selected[0].mode : "advisory";
+}
+
+// Delivers prepared advice blocks inside `budget` (see `selectAdvice`). Acknowledges exactly
+// the selected blocks, and only when `verified` says the route reaches the model. Returns
+// `{ mode, context }` or null when there is nothing to say.
+function deliverAdvice(blocks, budget, verified, fixedCost = 0) {
+  if (blocks.length === 0) return null;
+  const { selected, context } = selectAdvice(blocks, budget, fixedCost);
+  return { mode: verified ? acknowledgeSelected(selected) : "advisory", context };
+}
+
+// Prepared per-file blocks for the exact targets of a shell edit. Shell targets are
+// relative to the evidence root (`ctx.root`, else `ctx.cwd`); they normalize to the same
+// absolute identity the edit tools record, so both channels share one warning. A shell
+// edit is advisory only and never a new-file reuse check: the file may not exist yet.
+function shellTargetBlocks(targets, ctx, sessionId, agentId) {
+  const base = (ctx && (ctx.root || ctx.cwd)) || process.cwd();
+  const sid = dedupKey(sessionId, agentId);
+  const blocks = [];
+  const seen = new Set();
+  for (const t of targets || []) {
+    const prepared = prepareAdvice(t, sid, false, base);
+    if (!prepared || seen.has(prepared.key)) continue;
+    seen.add(prepared.key);
+    // The record carries only the normalized path: the relative spelling is shell-local.
+    prepared.spelling = prepared.key;
+    blocks.push(prepared);
   }
-  return { mode, context: texts.join(sep) };
+  return blocks;
+}
+
+// The shell `notice` plus the per-file checklists for the evidence's exact targets, inside
+// `budget`. Always advisory text (never a deny); acknowledges the delivered blocks. The
+// notice and `outside` (text the caller joins around the result) count against `budget`.
+function shellEditContext(notice, edits, ctx, sessionId, agentId, budget, outside = "") {
+  const sepSize = 2;
+  const fixedCost =
+    adviceSize(notice, budget.unit) +
+    sepSize +
+    (outside ? adviceSize(outside, budget.unit) + sepSize : 0);
+  const delivered = deliverAdvice(
+    shellTargetBlocks(edits.targets, ctx, sessionId, agentId),
+    budget,
+    true,
+    fixedCost,
+  );
+  return delivered ? `${notice}\n\n${delivered.context}` : notice;
 }
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 3d7933f80..bfdac518f 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -8761,7 +8761,7 @@ Advisory: proceed once satisfied.
 - hook: GateGuard
 - fires: Advice for some targets does not fit the host's output limit
 - hosts: All five
-- source: `.bkit/core/hooks/gateguard-engine.js` `deliverAdvice`
+- source: `.bkit/core/hooks/gateguard-engine.js` `selectAdvice`
 
 ```text
 [bkit GateGuard] ${omitted.length} target${omitted.length === 1 ? "" : "s"} omitted (output limit); they stay unacknowledged and are advised on a later edit.${reminder}
diff --git a/.bkit/shared/.agents/plugins/bkit/hooks.json b/.bkit/shared/.agents/plugins/bkit/hooks.json
index a9df089ec..f20c09949 100644
--- a/.bkit/shared/.agents/plugins/bkit/hooks.json
+++ b/.bkit/shared/.agents/plugins/bkit/hooks.json
@@ -2,7 +2,7 @@
   "hooks": {
     "PreToolUse": [
       {
-        "matcher": "write_to_file|replace_file_content",
+        "matcher": "write_to_file|replace_file_content|multi_replace_file_content",
         "hooks": [
           {
             "type": "command",
diff --git a/.bkit/shared/.claude/settings.json b/.bkit/shared/.claude/settings.json
index b3aaccbc4..8be918962 100644
--- a/.bkit/shared/.claude/settings.json
+++ b/.bkit/shared/.claude/settings.json
@@ -120,7 +120,7 @@
     ],
     "PreToolUse": [
       {
-        "matcher": "Edit|Write|MultiEdit",
+        "matcher": "Edit|Write|MultiEdit|NotebookEdit",
         "hooks": [
           {
             "type": "command",
diff --git a/.bkit/shared/.cursor/hooks.json b/.bkit/shared/.cursor/hooks.json
index c04f9b3fb..17c03dd26 100644
--- a/.bkit/shared/.cursor/hooks.json
+++ b/.bkit/shared/.cursor/hooks.json
@@ -19,7 +19,7 @@
       },
       {
         "command": "node .cursor/hooks/bkit-gateguard.cjs",
-        "matcher": "Write"
+        "matcher": "Write|Delete"
       },
       {
         "command": "node .cursor/hooks/bkit-readguard.cjs",
