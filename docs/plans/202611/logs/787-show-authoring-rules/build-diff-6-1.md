diff --git a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
index 1c6df1ad2..cc4b17b72 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
@@ -616,6 +616,39 @@ describe("cursor guardrails.cjs — shell edit evidence", () => {
     expect(r.ms).toBeLessThan(1000);
   });
 
+  it("keeps commands after a heredoc substitution that holds an apostrophe", () => {
+    const dir = workDir("heredocapos");
+    const r = advise(
+      "git commit -m \"$(cat <<'EOF'\nFix: don't break\nEOF\n)\" && sed -i s/a/b/ src/after-commit.ts",
+      dir,
+    );
+    expect(r.permission).toBe("allow");
+    expect(r.text).toMatch(/src\/after-commit\.ts|cannot be determined/i);
+  });
+
+  it("flags a script an earlier copy or move produced", () => {
+    const dir = workDir("copyrun");
+    fs.writeFileSync(path.join(dir, "tpl.py"), "open('src/copied.py','w').write('x')\n");
+    const cp = advise("cp tpl.py /tmp/bkit-run.py && python3 /tmp/bkit-run.py", dir);
+    expect(cp.text).toMatch(/src\/copied\.py|cannot be determined/i);
+    const mv = advise("mv tpl.py /tmp/bkit-mv.py && python3 /tmp/bkit-mv.py", dir);
+    expect(mv.text).toMatch(/src\/copied\.py|cannot be determined/i);
+    expect(cp.permission).toBe("allow");
+    expect(mv.permission).toBe("allow");
+  });
+
+  it("marks scripts run by unanalysed interpreters as uncertain", () => {
+    const dir = workDir("otherinterp");
+    for (const command of ["ruby fix.rb", "perl fix.pl", "npx tsx gen.ts"]) {
+      const r = advise(command, dir);
+      expect({ command, permission: r.permission }).toEqual({ command, permission: "allow" });
+      expect({ command, text: r.text }).toEqual({
+        command,
+        text: expect.stringMatching(UNCERTAIN),
+      });
+    }
+  });
+
   describe("in-process evidence seams", () => {
     type Evidence = { targets: string[]; uncertain: string[]; limit: string | null };
     function loadEvidence(): (cmd: string, ctx: { cwd: string; root: string }) => Evidence {
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index bcc0e4461..c6e16b670 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -2655,4 +2655,49 @@ describe("shared hook behaviour footprint (fresh install and upgrade)", () => {
     dispatchModules(modules, ctx());
     expect([claudePath, cursorPath, agyPath].map(read)).toEqual(snapshot);
   });
+
+  it("upgrades a shipped Claude edit group without dropping a consumer hook inside it", () => {
+    const shippedRun = spawnSync("git", ["show", "da97be38:.bkit/shared/.claude/settings.json"], {
+      cwd: getPkgRoot(),
+      encoding: "utf-8",
+      maxBuffer: 16 * 1024 * 1024,
+    });
+    expect(shippedRun.status, "git show .claude/settings.json").toBe(0);
+    const claudePath = path.join(tmpDir, ".claude", "settings.json");
+    fs.mkdirSync(path.dirname(claudePath), { recursive: true });
+
+    const consumerHook = { type: "command", command: "node scripts/my-check.js" };
+    const shipped = JSON.parse(shippedRun.stdout) as {
+      hooks: { PreToolUse: { hooks: object[] }[] };
+    };
+    const gateGroup = shipped.hooks.PreToolUse.find((g) =>
+      JSON.stringify(g.hooks).includes("bkit-gateguard.cjs"),
+    );
+    expect(gateGroup, "shipped gateguard group").toBeDefined();
+    gateGroup?.hooks.push(consumerHook);
+    fs.writeFileSync(claudePath, JSON.stringify(shipped, null, 2) + "\n", "utf-8");
+
+    const modules = new Set<import("../../cli").ModuleFlag>(["core", "claude"] as never);
+    const ctx = (): ModuleContext => {
+      const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
+      return makeCtx({
+        modelLookup: parseModelLookup(promptsMd),
+        codexModelLookup: buildOpencodeModelLookup(promptsMd, "openai"),
+        antigravityModelLookup: buildAntigravityModelLookup(promptsMd),
+        effortMap: parseEffortMap(promptsMd),
+      });
+    };
+    dispatchModules(modules, ctx());
+
+    const after = JSON.parse(fs.readFileSync(claudePath, "utf-8")) as {
+      hooks: { PreToolUse: { matcher?: string; hooks: object[] }[] };
+    };
+    const groups = after.hooks.PreToolUse;
+    const upgraded = groups.filter((g) => JSON.stringify(g.hooks).includes("bkit-gateguard.cjs"));
+    // The new matcher arrives, the group is not duplicated, and the consumer hook survives in it.
+    expect(upgraded).toHaveLength(1);
+    expect(upgraded[0].matcher).toContain("NotebookEdit");
+    expect(upgraded[0].hooks).toContainEqual(consumerHook);
+    expect(JSON.stringify(groups).split("scripts/my-check.js")).toHaveLength(2);
+  });
 });
diff --git a/.bkit/core/engine/install/write.test.ts b/.bkit/core/engine/install/write.test.ts
index 460e255de..475bb60dc 100644
--- a/.bkit/core/engine/install/write.test.ts
+++ b/.bkit/core/engine/install/write.test.ts
@@ -995,4 +995,31 @@ describe("mergeManagedJson", () => {
     const dm = deepMergeJson(existing, template) as Record<string, Record<string, JsonValue>>;
     expect(dm.permissions.allow).toEqual(["Bash(a)", "Bash(b)"]);
   });
+
+  it("keeps a consumer hook placed inside a bkit hook group", () => {
+    const bkitHook: JsonValue = {
+      type: "command",
+      command: "node .claude/hooks/bkit-gateguard.cjs",
+    };
+    const mine: JsonValue = { type: "command", command: "node scripts/my-check.js" };
+    const existing = {
+      hooks: {
+        PreToolUse: [{ matcher: "Edit|Write|MultiEdit", hooks: [bkitHook, mine] }],
+      },
+    } as JsonValue;
+    const template = {
+      hooks: {
+        PreToolUse: [{ matcher: "Edit|Write|MultiEdit|NotebookEdit", hooks: [bkitHook] }],
+      },
+    } as JsonValue;
+
+    const merged = mergeManagedJson(existing, template) as Record<string, JsonValue>;
+    const groups = (merged.hooks as Record<string, JsonValue[]>).PreToolUse;
+    // The template group replaces bkit's matcher and hook, and the consumer hook rides along.
+    expect(groups).toEqual([
+      { matcher: "Edit|Write|MultiEdit|NotebookEdit", hooks: [bkitHook, mine] },
+    ]);
+    // A second run is a no-op.
+    expect(mergeManagedJson(merged, template)).toEqual(merged);
+  });
 });
