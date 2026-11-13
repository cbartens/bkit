diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index e7cd5ca67..a0594f376 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -716,6 +716,7 @@ function addWordTarget(st, cmd, text, cwd, force) {
 function matchParen(text, from) {
   let depth = 1;
   let quote = "";
+  const heredocs = [];
   for (let i = from; i < text.length; i++) {
     const ch = text[i];
     if (quote) {
@@ -723,6 +724,33 @@ function matchParen(text, from) {
       else if (ch === quote) quote = "";
       continue;
     }
+    if (ch === "<" && text[i + 1] === "<" && text[i + 2] !== "<" && text[i + 2] !== "(") {
+      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z0-9_.-]+))/.exec(
+        text.slice(i, i + 200),
+      );
+      if (m) {
+        heredocs.push({ delim: m[2] ?? m[3] ?? m[4], strip: m[1] === "-" });
+        i += m[0].length - 1;
+        continue;
+      }
+    }
+    if (ch === "\n" && heredocs.length > 0) {
+      // Heredoc bodies are data: skip to the line holding each delimiter.
+      let pos = i + 1;
+      for (const h of heredocs) {
+        while (pos < text.length) {
+          let eol = text.indexOf("\n", pos);
+          if (eol < 0) eol = text.length;
+          let line = text.slice(pos, eol);
+          if (h.strip) line = line.replace(/^\t+/, "");
+          pos = eol + 1;
+          if (line === h.delim) break;
+        }
+      }
+      heredocs.length = 0;
+      i = pos - 2;
+      continue;
+    }
     if (ch === "\\") i++;
     else if (ch === "'" || ch === '"') quote = ch;
     else if (ch === "(") depth++;
@@ -1164,6 +1192,187 @@ function awkFiles(args) {
   return pos;
 }
 
+const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
+const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
+
+/** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
+function isDirDest(dest, cwd) {
+  if (dest.endsWith("/")) return true;
+  if (cwd === null && !path.isAbsolute(dest)) return false;
+  try {
+    return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
+  } catch {
+    return false;
+  }
+}
+
+/** `cp` / `mv` destination as a produced file: the lone literal source's body, else unknown. */
+function markCopied(st, cmd, ops, cwd) {
+  const dest = ops[ops.length - 1];
+  if (cmd.dyn.has(dest)) return;
+  if (isDirDest(dest, cwd)) {
+    for (const src of ops.slice(0, -1)) {
+      if (cmd.dyn.has(src)) continue;
+      const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
+      markProduced(
+        st,
+        made,
+        cwd,
+        ops.length === 2 && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(made)
+          ? readBoundedSource(st, src, cwd)
+          : null,
+      );
+    }
+    return;
+  }
+  let body = null;
+  if (ops.length === 2 && !cmd.dyn.has(ops[0]) && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(dest)) {
+    body = readBoundedSource(st, ops[0], cwd);
+  }
+  markProduced(st, dest, cwd, body);
+}
+
+const FETCH_SHORT_VALUE = {
+  curl: new Set("AbcCdDeEFHKmoPQrTuUwXxyYz"),
+  wget: new Set("oaOPeiBtTwQlARDIXUYC"),
+};
+const FETCH_LONG_VALUE = {
+  curl: new Set([
+    "output",
+    "output-dir",
+    "config",
+    "header",
+    "data",
+    "data-raw",
+    "data-binary",
+    "user-agent",
+    "request",
+    "proxy",
+    "user",
+    "cookie",
+    "cookie-jar",
+    "referer",
+    "max-time",
+    "write-out",
+    "form",
+    "upload-file",
+    "range",
+    "connect-timeout",
+    "retry",
+    "dump-header",
+  ]),
+  wget: new Set([
+    "output-document",
+    "directory-prefix",
+    "input-file",
+    "output-file",
+    "append-output",
+    "header",
+    "user-agent",
+    "post-data",
+    "post-file",
+    "execute",
+    "tries",
+    "timeout",
+    "referer",
+    "user",
+    "password",
+    "wait",
+    "base",
+  ]),
+};
+
+/**
+ * One pass over curl / wget arguments: output files, output directory, remote-name mode, positionals.
+ * Handles bundled short flags, attached or separate values, and `--long=value` / `--long value`.
+ */
+function readFetchOptions(program, args) {
+  const res = {
+    outputs: [],
+    outDir: null,
+    remoteName: false,
+    remoteNameAll: false,
+    serverName: false,
+    layout: false,
+    noWrite: false,
+    positionals: [],
+    unresolved: false,
+  };
+  const curl = program === "curl";
+  const shortValue = FETCH_SHORT_VALUE[program];
+  const longValue = FETCH_LONG_VALUE[program];
+  const useShort = (flag, value) => {
+    if (curl) {
+      if (flag === "o") {
+        if (!value.startsWith("=")) res.outputs.push(value);
+      } else if (flag === "K") res.unresolved = true;
+    } else if (flag === "O") res.outputs.push(value);
+    else if (flag === "P") res.outDir = value;
+    else if (flag === "i") res.unresolved = true;
+    else if (flag === "e" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  const useLong = (name, value) => {
+    if (curl) {
+      if (name === "output") res.outputs.push(value);
+      else if (name === "output-dir") res.outDir = value;
+      else if (name === "config") res.unresolved = true;
+    } else if (name === "output-document") res.outputs.push(value);
+    else if (name === "directory-prefix") res.outDir = value;
+    else if (name === "input-file") res.unresolved = true;
+    else if (name === "execute" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  let rest = false;
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (rest || a === "-" || !a.startsWith("-")) {
+      res.positionals.push(a);
+      continue;
+    }
+    if (a === "--") {
+      rest = true;
+      continue;
+    }
+    if (a.startsWith("--")) {
+      const eq = a.indexOf("=");
+      const name = eq < 0 ? a.slice(2) : a.slice(2, eq);
+      if (name === "remote-name" || name === "remote-name-all") res.remoteName = true;
+      if (name === "remote-name-all") res.remoteNameAll = true;
+      if (name === "remote-header-name" || name === "content-disposition") res.serverName = true;
+      if (name === "trust-server-names") res.serverName = true;
+      if (!curl && ["recursive", "mirror", "force-directories"].includes(name)) res.layout = true;
+      if (name === "spider" || (curl && name === "head")) res.noWrite = true;
+      if (eq >= 0) useLong(name, a.slice(eq + 1));
+      else if (longValue.has(name)) {
+        if (args[i + 1] === undefined) continue;
+        useLong(name, args[++i]);
+      }
+      continue;
+    }
+    for (let k = 1; k < a.length; k++) {
+      const c = a[k];
+      if (!curl && c === "n") {
+        k++; // wget `-nv`, `-nc`, `-nd`, `-nH`, `-np` are two-letter flags
+        continue;
+      }
+      if (curl && c === "O") res.remoteName = true;
+      if (curl && c === "J") res.serverName = true;
+      if (curl && c === "I") res.noWrite = true;
+      if (!curl && (c === "r" || c === "m" || c === "x")) res.layout = true;
+      if (shortValue.has(c)) {
+        const attached = a.slice(k + 1);
+        if (attached !== "") useShort(c, attached);
+        else if (args[i + 1] !== undefined) useShort(c, args[++i]);
+        break;
+      }
+    }
+  }
+  return res;
+}
+
 function evalCommand(cmd, st, depth, cwd) {
   const { words, viaXargs } = stripCommandPrefix(cmd.words);
   for (const target of cmd.redirects) {
@@ -1219,6 +1428,11 @@ function evalCommand(cmd, st, depth, cwd) {
     case "ruby": {
       const files = perlRubyFiles(args);
       if (files) inPlaceTargets(files);
+      else if (!args.some((a) => /^-[A-Za-z]*[eE]/.test(a) && !a.startsWith("--"))) {
+        // A script file run by an interpreter that is not analysed: effects are unknown.
+        if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+          st.uncertain.add("unknown-script-effect");
+      }
       return cwd;
     }
     case "awk":
@@ -1236,11 +1450,68 @@ function evalCommand(cmd, st, depth, cwd) {
       }
       if (args.some((a) => a === "-t" || a.startsWith("--target-directory"))) {
         st.uncertain.add("unresolved-target");
-      } else if (ops.length > 1) addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+      } else if (ops.length > 1) {
+        addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+        markCopied(st, cmd, ops, cwd);
+      }
       return cwd;
     }
     case "mv": {
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      const ops = operands(args);
+      for (const f of ops) addWordTarget(st, cmd, f, cwd, false);
+      if (!args.some((a) => a === "-t" || a.startsWith("--target-directory")) && ops.length > 1) {
+        markCopied(st, cmd, ops, cwd);
+      }
+      return cwd;
+    }
+    case "curl":
+    case "wget": {
+      const opts = readFetchOptions(program, args);
+      if (opts.unresolved) st.uncertain.add("unresolved-target");
+      const dirDyn = opts.outDir !== null && cmd.dyn.has(opts.outDir);
+      const inDir = (name) =>
+        opts.outDir !== null && program === "curl" ? `${opts.outDir}/${name}` : name;
+      for (const out of opts.outputs) {
+        if (out === "-") continue;
+        if (!cmd.dyn.has(out) && !dirDyn) markProduced(st, inDir(out), cwd, null);
+        else st.uncertain.add("unresolved-target");
+      }
+      // Remote-name downloads: record a local name only when it is exactly the URL's last path
+      // segment of a plain http(s) URL; every other file-writing shape is an unresolved target.
+      const remote = program === "wget" || opts.remoteName;
+      if (remote && !opts.noWrite && opts.positionals.length > 0) {
+        const mixed =
+          program === "curl" && opts.outputs.length > 0 && (opts.remoteName || opts.remoteNameAll);
+        const wgetNamed = program === "wget" && opts.outputs.length > 0;
+        if (!wgetNamed) {
+          if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
+          else if (opts.outputs.length === 0) {
+            for (const a of opts.positionals) {
+              const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
+              if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
+              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+            }
+          }
+        }
+      }
+      return cwd;
+    }
+    case "tsx":
+    case "ts-node":
+    case "bun":
+    case "deno":
+      if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+        st.uncertain.add("unknown-script-effect");
+      return cwd;
+    case "npx":
+    case "pnpx":
+    case "bunx":
+    case "pnpm":
+    case "yarn": {
+      const idx = args.findIndex((a) => RUNNER_PROGRAMS.has(a));
+      if (idx >= 0 && !args.slice(0, idx).some((a) => a === "--")) {
+        evalCommand({ ...cmd, words: args.slice(idx), redirects: [] }, st, depth, cwd);
+      }
       return cwd;
     }
     case "bash":
@@ -1315,6 +1586,8 @@ function evalCommand(cmd, st, depth, cwd) {
           [words[0], ...args],
           cwd,
         );
+      } else if (/\//.test(words[0]) && SCRIPT_FILE_RE.test(words[0])) {
+        st.uncertain.add("unknown-script-effect");
       }
       return cwd;
   }
diff --git a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
index 1c6df1ad2..323634e42 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
@@ -616,6 +616,70 @@ describe("cursor guardrails.cjs — shell edit evidence", () => {
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
+  it("flags a script produced by a directory copy or a bundled or remote-name download", () => {
+    const dir = workDir("producers");
+    fs.writeFileSync(path.join(dir, "tpl.py"), "open('src/copied.py','w').write('x')\n");
+    const commands = [
+      "cp tpl.py /tmp/ && python3 /tmp/tpl.py",
+      "curl -fsSLo /tmp/bkit-s.py https://api.github.com/s.py && python3 /tmp/bkit-s.py",
+      "wget -qO /tmp/bkit-w.py https://api.github.com/s.py && python3 /tmp/bkit-w.py",
+      "curl -O https://api.github.com/bkit-s.py && python3 bkit-s.py",
+      "wget https://api.github.com/bkit-w.py && python3 bkit-w.py",
+      "wget -P /tmp/d https://api.github.com/bkit-w.py && python3 /tmp/d/bkit-w.py",
+      "wget --directory-prefix=/tmp/d https://api.github.com/bkit-w.py && python3 /tmp/d/bkit-w.py",
+      "curl --output-dir /tmp/d -O https://api.github.com/bkit-s.py && python3 /tmp/d/bkit-s.py",
+      "wget -P $D https://api.github.com/bkit-w.py && python3 bkit-w.py",
+      "curl --output-dir $D -O https://api.github.com/bkit-s.py && python3 bkit-s.py",
+      "wget -qP /tmp/d https://api.github.com/bkit-w.py && python3 /tmp/d/bkit-w.py",
+      "wget -nvP /tmp/d https://api.github.com/bkit-w.py && python3 /tmp/d/bkit-w.py",
+      "wget -o /tmp/log.txt https://api.github.com/bkit-w.py && python3 bkit-w.py",
+      "wget -c https://api.github.com/bkit-w.py && python3 bkit-w.py",
+      "curl -sLo/tmp/bkit-s.py https://api.github.com/s.py && python3 /tmp/bkit-s.py",
+      "curl -K /tmp/cfg https://api.github.com/s.py && python3 bkit-s.py",
+      "wget -i /tmp/urls.txt https://api.github.com/x && python3 bkit-w.py",
+    ];
+    for (const command of commands) {
+      const r = advise(command, dir);
+      expect({ command, text: r.text }).toEqual({
+        command,
+        text: expect.stringMatching(/src\/copied\.py|cannot be determined/i),
+      });
+    }
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
diff --git a/.bkit/core/engine/install/write.ts b/.bkit/core/engine/install/write.ts
index b5f4f0dec..6b2c47227 100644
--- a/.bkit/core/engine/install/write.ts
+++ b/.bkit/core/engine/install/write.ts
@@ -239,18 +239,43 @@ function mergeManagedList(base: JsonValue[], override: JsonValue[]): JsonValue[]
         if (file) templateCommands.add(`bkit-file:${file}`);
       }
     }
+    const isTemplateCommand = (c: string): boolean => {
+      const file = bkitHookFile(c);
+      return (
+        templateCommands.has(c) || (file !== undefined && templateCommands.has(`bkit-file:${file}`))
+      );
+    };
     const templateKeys = new Set(override.map((g) => JSON.stringify(g)));
-    const kept = base.filter((g) => {
-      if (templateKeys.has(JSON.stringify(g))) return false;
-      return !groupCommands(g as { [k: string]: JsonValue }).some((c) => {
-        const file = bkitHookFile(c);
-        return (
-          templateCommands.has(c) ||
-          (file !== undefined && templateCommands.has(`bkit-file:${file}`))
-        );
-      });
-    });
-    return [...override, ...kept];
+    const merged = override.map((g) => ({ ...(g as { [k: string]: JsonValue }) }));
+    const kept: JsonValue[] = [];
+    for (const g of base) {
+      if (templateKeys.has(JSON.stringify(g))) continue;
+      const group = g as { [k: string]: JsonValue };
+      const cmds = groupCommands(group);
+      if (!cmds.some(isTemplateCommand)) {
+        kept.push(g);
+        continue;
+      }
+      // A replaced bkit group: its consumer-added hooks move into the matching template group.
+      if (!Array.isArray(group.hooks)) continue;
+      const extras = group.hooks.filter(
+        (h) => isPlainObject(h) && typeof h.command === "string" && !isTemplateCommand(h.command),
+      );
+      if (extras.length === 0) continue;
+      const target = merged.find((t) =>
+        groupCommands(t).some((c) =>
+          cmds.some(
+            (bc) =>
+              bc === c || (bkitHookFile(c) !== undefined && bkitHookFile(c) === bkitHookFile(bc)),
+          ),
+        ),
+      );
+      if (!target || !Array.isArray(target.hooks)) continue;
+      const have = new Set(target.hooks.map((h) => JSON.stringify(h)));
+      const add = extras.filter((h) => !have.has(JSON.stringify(h)));
+      target.hooks = [...target.hooks, ...add];
+    }
+    return [...merged, ...kept];
   }
   const seen = new Set(override.map((e) => JSON.stringify(e)));
   const extras = base.filter((e) => !seen.has(JSON.stringify(e)));
diff --git a/.bkit/core/hooks/guardrails-shell.js b/.bkit/core/hooks/guardrails-shell.js
index d4ddf9ae7..0d72b8e57 100644
--- a/.bkit/core/hooks/guardrails-shell.js
+++ b/.bkit/core/hooks/guardrails-shell.js
@@ -265,6 +265,7 @@ function addWordTarget(st, cmd, text, cwd, force) {
 function matchParen(text, from) {
   let depth = 1;
   let quote = "";
+  const heredocs = [];
   for (let i = from; i < text.length; i++) {
     const ch = text[i];
     if (quote) {
@@ -272,6 +273,33 @@ function matchParen(text, from) {
       else if (ch === quote) quote = "";
       continue;
     }
+    if (ch === "<" && text[i + 1] === "<" && text[i + 2] !== "<" && text[i + 2] !== "(") {
+      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z0-9_.-]+))/.exec(
+        text.slice(i, i + 200),
+      );
+      if (m) {
+        heredocs.push({ delim: m[2] ?? m[3] ?? m[4], strip: m[1] === "-" });
+        i += m[0].length - 1;
+        continue;
+      }
+    }
+    if (ch === "\n" && heredocs.length > 0) {
+      // Heredoc bodies are data: skip to the line holding each delimiter.
+      let pos = i + 1;
+      for (const h of heredocs) {
+        while (pos < text.length) {
+          let eol = text.indexOf("\n", pos);
+          if (eol < 0) eol = text.length;
+          let line = text.slice(pos, eol);
+          if (h.strip) line = line.replace(/^\t+/, "");
+          pos = eol + 1;
+          if (line === h.delim) break;
+        }
+      }
+      heredocs.length = 0;
+      i = pos - 2;
+      continue;
+    }
     if (ch === "\\") i++;
     else if (ch === "'" || ch === '"') quote = ch;
     else if (ch === "(") depth++;
@@ -713,6 +741,187 @@ function awkFiles(args) {
   return pos;
 }
 
+const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
+const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
+
+/** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
+function isDirDest(dest, cwd) {
+  if (dest.endsWith("/")) return true;
+  if (cwd === null && !path.isAbsolute(dest)) return false;
+  try {
+    return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
+  } catch {
+    return false;
+  }
+}
+
+/** `cp` / `mv` destination as a produced file: the lone literal source's body, else unknown. */
+function markCopied(st, cmd, ops, cwd) {
+  const dest = ops[ops.length - 1];
+  if (cmd.dyn.has(dest)) return;
+  if (isDirDest(dest, cwd)) {
+    for (const src of ops.slice(0, -1)) {
+      if (cmd.dyn.has(src)) continue;
+      const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
+      markProduced(
+        st,
+        made,
+        cwd,
+        ops.length === 2 && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(made)
+          ? readBoundedSource(st, src, cwd)
+          : null,
+      );
+    }
+    return;
+  }
+  let body = null;
+  if (ops.length === 2 && !cmd.dyn.has(ops[0]) && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(dest)) {
+    body = readBoundedSource(st, ops[0], cwd);
+  }
+  markProduced(st, dest, cwd, body);
+}
+
+const FETCH_SHORT_VALUE = {
+  curl: new Set("AbcCdDeEFHKmoPQrTuUwXxyYz"),
+  wget: new Set("oaOPeiBtTwQlARDIXUYC"),
+};
+const FETCH_LONG_VALUE = {
+  curl: new Set([
+    "output",
+    "output-dir",
+    "config",
+    "header",
+    "data",
+    "data-raw",
+    "data-binary",
+    "user-agent",
+    "request",
+    "proxy",
+    "user",
+    "cookie",
+    "cookie-jar",
+    "referer",
+    "max-time",
+    "write-out",
+    "form",
+    "upload-file",
+    "range",
+    "connect-timeout",
+    "retry",
+    "dump-header",
+  ]),
+  wget: new Set([
+    "output-document",
+    "directory-prefix",
+    "input-file",
+    "output-file",
+    "append-output",
+    "header",
+    "user-agent",
+    "post-data",
+    "post-file",
+    "execute",
+    "tries",
+    "timeout",
+    "referer",
+    "user",
+    "password",
+    "wait",
+    "base",
+  ]),
+};
+
+/**
+ * One pass over curl / wget arguments: output files, output directory, remote-name mode, positionals.
+ * Handles bundled short flags, attached or separate values, and `--long=value` / `--long value`.
+ */
+function readFetchOptions(program, args) {
+  const res = {
+    outputs: [],
+    outDir: null,
+    remoteName: false,
+    remoteNameAll: false,
+    serverName: false,
+    layout: false,
+    noWrite: false,
+    positionals: [],
+    unresolved: false,
+  };
+  const curl = program === "curl";
+  const shortValue = FETCH_SHORT_VALUE[program];
+  const longValue = FETCH_LONG_VALUE[program];
+  const useShort = (flag, value) => {
+    if (curl) {
+      if (flag === "o") {
+        if (!value.startsWith("=")) res.outputs.push(value);
+      } else if (flag === "K") res.unresolved = true;
+    } else if (flag === "O") res.outputs.push(value);
+    else if (flag === "P") res.outDir = value;
+    else if (flag === "i") res.unresolved = true;
+    else if (flag === "e" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  const useLong = (name, value) => {
+    if (curl) {
+      if (name === "output") res.outputs.push(value);
+      else if (name === "output-dir") res.outDir = value;
+      else if (name === "config") res.unresolved = true;
+    } else if (name === "output-document") res.outputs.push(value);
+    else if (name === "directory-prefix") res.outDir = value;
+    else if (name === "input-file") res.unresolved = true;
+    else if (name === "execute" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  let rest = false;
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (rest || a === "-" || !a.startsWith("-")) {
+      res.positionals.push(a);
+      continue;
+    }
+    if (a === "--") {
+      rest = true;
+      continue;
+    }
+    if (a.startsWith("--")) {
+      const eq = a.indexOf("=");
+      const name = eq < 0 ? a.slice(2) : a.slice(2, eq);
+      if (name === "remote-name" || name === "remote-name-all") res.remoteName = true;
+      if (name === "remote-name-all") res.remoteNameAll = true;
+      if (name === "remote-header-name" || name === "content-disposition") res.serverName = true;
+      if (name === "trust-server-names") res.serverName = true;
+      if (!curl && ["recursive", "mirror", "force-directories"].includes(name)) res.layout = true;
+      if (name === "spider" || (curl && name === "head")) res.noWrite = true;
+      if (eq >= 0) useLong(name, a.slice(eq + 1));
+      else if (longValue.has(name)) {
+        if (args[i + 1] === undefined) continue;
+        useLong(name, args[++i]);
+      }
+      continue;
+    }
+    for (let k = 1; k < a.length; k++) {
+      const c = a[k];
+      if (!curl && c === "n") {
+        k++; // wget `-nv`, `-nc`, `-nd`, `-nH`, `-np` are two-letter flags
+        continue;
+      }
+      if (curl && c === "O") res.remoteName = true;
+      if (curl && c === "J") res.serverName = true;
+      if (curl && c === "I") res.noWrite = true;
+      if (!curl && (c === "r" || c === "m" || c === "x")) res.layout = true;
+      if (shortValue.has(c)) {
+        const attached = a.slice(k + 1);
+        if (attached !== "") useShort(c, attached);
+        else if (args[i + 1] !== undefined) useShort(c, args[++i]);
+        break;
+      }
+    }
+  }
+  return res;
+}
+
 function evalCommand(cmd, st, depth, cwd) {
   const { words, viaXargs } = stripCommandPrefix(cmd.words);
   for (const target of cmd.redirects) {
@@ -768,6 +977,11 @@ function evalCommand(cmd, st, depth, cwd) {
     case "ruby": {
       const files = perlRubyFiles(args);
       if (files) inPlaceTargets(files);
+      else if (!args.some((a) => /^-[A-Za-z]*[eE]/.test(a) && !a.startsWith("--"))) {
+        // A script file run by an interpreter that is not analysed: effects are unknown.
+        if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+          st.uncertain.add("unknown-script-effect");
+      }
       return cwd;
     }
     case "awk":
@@ -785,11 +999,69 @@ function evalCommand(cmd, st, depth, cwd) {
       }
       if (args.some((a) => a === "-t" || a.startsWith("--target-directory"))) {
         st.uncertain.add("unresolved-target");
-      } else if (ops.length > 1) addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+      } else if (ops.length > 1) {
+        addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+        markCopied(st, cmd, ops, cwd);
+      }
       return cwd;
     }
     case "mv": {
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      const ops = operands(args);
+      for (const f of ops) addWordTarget(st, cmd, f, cwd, false);
+      if (!args.some((a) => a === "-t" || a.startsWith("--target-directory")) && ops.length > 1) {
+        markCopied(st, cmd, ops, cwd);
+      }
+      return cwd;
+    }
+    case "curl":
+    case "wget": {
+      const opts = readFetchOptions(program, args);
+      if (opts.unresolved) st.uncertain.add("unresolved-target");
+      const dirDyn = opts.outDir !== null && cmd.dyn.has(opts.outDir);
+      const inDir = (name) =>
+        opts.outDir !== null && program === "curl" ? `${opts.outDir}/${name}` : name;
+      for (const out of opts.outputs) {
+        if (out === "-") continue;
+        if (!cmd.dyn.has(out) && !dirDyn) markProduced(st, inDir(out), cwd, null);
+        else st.uncertain.add("unresolved-target");
+      }
+      // Remote-name downloads: record a local name only when it is exactly the URL's last path
+      // segment of a plain http(s) URL; every other file-writing shape is an unresolved target.
+      const remote = program === "wget" || opts.remoteName;
+      if (remote && !opts.noWrite && opts.positionals.length > 0) {
+        const mixed =
+          program === "curl" && opts.outputs.length > 0 && (opts.remoteName || opts.remoteNameAll);
+        const wgetNamed = program === "wget" && opts.outputs.length > 0;
+        if (!wgetNamed) {
+          if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
+          else if (opts.outputs.length === 0) {
+            for (const a of opts.positionals) {
+              const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
+              if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
+              else
+                markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+            }
+          }
+        }
+      }
+      return cwd;
+    }
+    case "tsx":
+    case "ts-node":
+    case "bun":
+    case "deno":
+      if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+        st.uncertain.add("unknown-script-effect");
+      return cwd;
+    case "npx":
+    case "pnpx":
+    case "bunx":
+    case "pnpm":
+    case "yarn": {
+      const idx = args.findIndex((a) => RUNNER_PROGRAMS.has(a));
+      if (idx >= 0 && !args.slice(0, idx).some((a) => a === "--")) {
+        evalCommand({ ...cmd, words: args.slice(idx), redirects: [] }, st, depth, cwd);
+      }
       return cwd;
     }
     case "bash":
@@ -864,6 +1136,8 @@ function evalCommand(cmd, st, depth, cwd) {
           [words[0], ...args],
           cwd,
         );
+      } else if (/\//.test(words[0]) && SCRIPT_FILE_RE.test(words[0])) {
+        st.uncertain.add("unknown-script-effect");
       }
       return cwd;
   }
diff --git a/.bkit/version b/.bkit/version
index 629b0cd50..7b9b0824b 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -228,12 +228,12 @@
     ".bkit/README.md": "3eab3725aca61c812345c2867a375c71434e4f3482d9961587fb41dd2ede7ae6",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "11ac4050fa9d0a87bf4b7aaddd3849fe76ed1cee1220c6d65e224ce59d867520",
-    ".claude/hooks/bkit-guardrails.cjs": "bda429e6b128bb965369550f66a5099130b5776d8decced855c80ea6268335b9",
+    ".claude/hooks/bkit-guardrails.cjs": "759dad5c32de35490573aa836c74ffba54d8df90e1aeaf093b591ae76474a087",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "ea84bfe4499bc2e5348476ae6b8f82cb3e2957b75fd94859b93ff8667c12049d",
-    ".codex/hooks/bkit-guardrails.cjs": "89e4c812ade04925fbdd5881290a9978e8eb47619d54f16990ae6200b3b2de3d",
+    ".codex/hooks/bkit-guardrails.cjs": "8a95abfec7cb8a8d21f333a2c42e7707edf51f4749d58794ed4ff8e4755dd262",
     ".cursor/hooks/bkit-gateguard.cjs": "afe98fc5081fc44d7a8d0ea04d52d5fbf55f26fcd4e154676b881ca1057b3df8",
-    ".cursor/hooks/bkit-guardrails.cjs": "52e3e6aba004f101e1f5b8985e040aa40db0cec05e77a3aa15cf09aff067647e",
+    ".cursor/hooks/bkit-guardrails.cjs": "9dd5fc0b6329ec0cca5203201f6c1752049d561e1cd4e314a7122c77da2fef41",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "a08c31417eed59bf2a8150d87b5ef4654f8055e57394e646d7d64b759b8ab6fa",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
diff --git a/.claude/hooks/bkit-guardrails.cjs b/.claude/hooks/bkit-guardrails.cjs
index 6affdb01d..93357ab22 100644
--- a/.claude/hooks/bkit-guardrails.cjs
+++ b/.claude/hooks/bkit-guardrails.cjs
@@ -711,6 +711,7 @@ function addWordTarget(st, cmd, text, cwd, force) {
 function matchParen(text, from) {
   let depth = 1;
   let quote = "";
+  const heredocs = [];
   for (let i = from; i < text.length; i++) {
     const ch = text[i];
     if (quote) {
@@ -718,6 +719,33 @@ function matchParen(text, from) {
       else if (ch === quote) quote = "";
       continue;
     }
+    if (ch === "<" && text[i + 1] === "<" && text[i + 2] !== "<" && text[i + 2] !== "(") {
+      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z0-9_.-]+))/.exec(
+        text.slice(i, i + 200),
+      );
+      if (m) {
+        heredocs.push({ delim: m[2] ?? m[3] ?? m[4], strip: m[1] === "-" });
+        i += m[0].length - 1;
+        continue;
+      }
+    }
+    if (ch === "\n" && heredocs.length > 0) {
+      // Heredoc bodies are data: skip to the line holding each delimiter.
+      let pos = i + 1;
+      for (const h of heredocs) {
+        while (pos < text.length) {
+          let eol = text.indexOf("\n", pos);
+          if (eol < 0) eol = text.length;
+          let line = text.slice(pos, eol);
+          if (h.strip) line = line.replace(/^\t+/, "");
+          pos = eol + 1;
+          if (line === h.delim) break;
+        }
+      }
+      heredocs.length = 0;
+      i = pos - 2;
+      continue;
+    }
     if (ch === "\\") i++;
     else if (ch === "'" || ch === '"') quote = ch;
     else if (ch === "(") depth++;
@@ -1159,6 +1187,187 @@ function awkFiles(args) {
   return pos;
 }
 
+const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
+const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
+
+/** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
+function isDirDest(dest, cwd) {
+  if (dest.endsWith("/")) return true;
+  if (cwd === null && !path.isAbsolute(dest)) return false;
+  try {
+    return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
+  } catch {
+    return false;
+  }
+}
+
+/** `cp` / `mv` destination as a produced file: the lone literal source's body, else unknown. */
+function markCopied(st, cmd, ops, cwd) {
+  const dest = ops[ops.length - 1];
+  if (cmd.dyn.has(dest)) return;
+  if (isDirDest(dest, cwd)) {
+    for (const src of ops.slice(0, -1)) {
+      if (cmd.dyn.has(src)) continue;
+      const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
+      markProduced(
+        st,
+        made,
+        cwd,
+        ops.length === 2 && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(made)
+          ? readBoundedSource(st, src, cwd)
+          : null,
+      );
+    }
+    return;
+  }
+  let body = null;
+  if (ops.length === 2 && !cmd.dyn.has(ops[0]) && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(dest)) {
+    body = readBoundedSource(st, ops[0], cwd);
+  }
+  markProduced(st, dest, cwd, body);
+}
+
+const FETCH_SHORT_VALUE = {
+  curl: new Set("AbcCdDeEFHKmoPQrTuUwXxyYz"),
+  wget: new Set("oaOPeiBtTwQlARDIXUYC"),
+};
+const FETCH_LONG_VALUE = {
+  curl: new Set([
+    "output",
+    "output-dir",
+    "config",
+    "header",
+    "data",
+    "data-raw",
+    "data-binary",
+    "user-agent",
+    "request",
+    "proxy",
+    "user",
+    "cookie",
+    "cookie-jar",
+    "referer",
+    "max-time",
+    "write-out",
+    "form",
+    "upload-file",
+    "range",
+    "connect-timeout",
+    "retry",
+    "dump-header",
+  ]),
+  wget: new Set([
+    "output-document",
+    "directory-prefix",
+    "input-file",
+    "output-file",
+    "append-output",
+    "header",
+    "user-agent",
+    "post-data",
+    "post-file",
+    "execute",
+    "tries",
+    "timeout",
+    "referer",
+    "user",
+    "password",
+    "wait",
+    "base",
+  ]),
+};
+
+/**
+ * One pass over curl / wget arguments: output files, output directory, remote-name mode, positionals.
+ * Handles bundled short flags, attached or separate values, and `--long=value` / `--long value`.
+ */
+function readFetchOptions(program, args) {
+  const res = {
+    outputs: [],
+    outDir: null,
+    remoteName: false,
+    remoteNameAll: false,
+    serverName: false,
+    layout: false,
+    noWrite: false,
+    positionals: [],
+    unresolved: false,
+  };
+  const curl = program === "curl";
+  const shortValue = FETCH_SHORT_VALUE[program];
+  const longValue = FETCH_LONG_VALUE[program];
+  const useShort = (flag, value) => {
+    if (curl) {
+      if (flag === "o") {
+        if (!value.startsWith("=")) res.outputs.push(value);
+      } else if (flag === "K") res.unresolved = true;
+    } else if (flag === "O") res.outputs.push(value);
+    else if (flag === "P") res.outDir = value;
+    else if (flag === "i") res.unresolved = true;
+    else if (flag === "e" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  const useLong = (name, value) => {
+    if (curl) {
+      if (name === "output") res.outputs.push(value);
+      else if (name === "output-dir") res.outDir = value;
+      else if (name === "config") res.unresolved = true;
+    } else if (name === "output-document") res.outputs.push(value);
+    else if (name === "directory-prefix") res.outDir = value;
+    else if (name === "input-file") res.unresolved = true;
+    else if (name === "execute" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  let rest = false;
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (rest || a === "-" || !a.startsWith("-")) {
+      res.positionals.push(a);
+      continue;
+    }
+    if (a === "--") {
+      rest = true;
+      continue;
+    }
+    if (a.startsWith("--")) {
+      const eq = a.indexOf("=");
+      const name = eq < 0 ? a.slice(2) : a.slice(2, eq);
+      if (name === "remote-name" || name === "remote-name-all") res.remoteName = true;
+      if (name === "remote-name-all") res.remoteNameAll = true;
+      if (name === "remote-header-name" || name === "content-disposition") res.serverName = true;
+      if (name === "trust-server-names") res.serverName = true;
+      if (!curl && ["recursive", "mirror", "force-directories"].includes(name)) res.layout = true;
+      if (name === "spider" || (curl && name === "head")) res.noWrite = true;
+      if (eq >= 0) useLong(name, a.slice(eq + 1));
+      else if (longValue.has(name)) {
+        if (args[i + 1] === undefined) continue;
+        useLong(name, args[++i]);
+      }
+      continue;
+    }
+    for (let k = 1; k < a.length; k++) {
+      const c = a[k];
+      if (!curl && c === "n") {
+        k++; // wget `-nv`, `-nc`, `-nd`, `-nH`, `-np` are two-letter flags
+        continue;
+      }
+      if (curl && c === "O") res.remoteName = true;
+      if (curl && c === "J") res.serverName = true;
+      if (curl && c === "I") res.noWrite = true;
+      if (!curl && (c === "r" || c === "m" || c === "x")) res.layout = true;
+      if (shortValue.has(c)) {
+        const attached = a.slice(k + 1);
+        if (attached !== "") useShort(c, attached);
+        else if (args[i + 1] !== undefined) useShort(c, args[++i]);
+        break;
+      }
+    }
+  }
+  return res;
+}
+
 function evalCommand(cmd, st, depth, cwd) {
   const { words, viaXargs } = stripCommandPrefix(cmd.words);
   for (const target of cmd.redirects) {
@@ -1214,6 +1423,11 @@ function evalCommand(cmd, st, depth, cwd) {
     case "ruby": {
       const files = perlRubyFiles(args);
       if (files) inPlaceTargets(files);
+      else if (!args.some((a) => /^-[A-Za-z]*[eE]/.test(a) && !a.startsWith("--"))) {
+        // A script file run by an interpreter that is not analysed: effects are unknown.
+        if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+          st.uncertain.add("unknown-script-effect");
+      }
       return cwd;
     }
     case "awk":
@@ -1231,11 +1445,68 @@ function evalCommand(cmd, st, depth, cwd) {
       }
       if (args.some((a) => a === "-t" || a.startsWith("--target-directory"))) {
         st.uncertain.add("unresolved-target");
-      } else if (ops.length > 1) addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+      } else if (ops.length > 1) {
+        addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+        markCopied(st, cmd, ops, cwd);
+      }
       return cwd;
     }
     case "mv": {
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      const ops = operands(args);
+      for (const f of ops) addWordTarget(st, cmd, f, cwd, false);
+      if (!args.some((a) => a === "-t" || a.startsWith("--target-directory")) && ops.length > 1) {
+        markCopied(st, cmd, ops, cwd);
+      }
+      return cwd;
+    }
+    case "curl":
+    case "wget": {
+      const opts = readFetchOptions(program, args);
+      if (opts.unresolved) st.uncertain.add("unresolved-target");
+      const dirDyn = opts.outDir !== null && cmd.dyn.has(opts.outDir);
+      const inDir = (name) =>
+        opts.outDir !== null && program === "curl" ? `${opts.outDir}/${name}` : name;
+      for (const out of opts.outputs) {
+        if (out === "-") continue;
+        if (!cmd.dyn.has(out) && !dirDyn) markProduced(st, inDir(out), cwd, null);
+        else st.uncertain.add("unresolved-target");
+      }
+      // Remote-name downloads: record a local name only when it is exactly the URL's last path
+      // segment of a plain http(s) URL; every other file-writing shape is an unresolved target.
+      const remote = program === "wget" || opts.remoteName;
+      if (remote && !opts.noWrite && opts.positionals.length > 0) {
+        const mixed =
+          program === "curl" && opts.outputs.length > 0 && (opts.remoteName || opts.remoteNameAll);
+        const wgetNamed = program === "wget" && opts.outputs.length > 0;
+        if (!wgetNamed) {
+          if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
+          else if (opts.outputs.length === 0) {
+            for (const a of opts.positionals) {
+              const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
+              if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
+              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+            }
+          }
+        }
+      }
+      return cwd;
+    }
+    case "tsx":
+    case "ts-node":
+    case "bun":
+    case "deno":
+      if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+        st.uncertain.add("unknown-script-effect");
+      return cwd;
+    case "npx":
+    case "pnpx":
+    case "bunx":
+    case "pnpm":
+    case "yarn": {
+      const idx = args.findIndex((a) => RUNNER_PROGRAMS.has(a));
+      if (idx >= 0 && !args.slice(0, idx).some((a) => a === "--")) {
+        evalCommand({ ...cmd, words: args.slice(idx), redirects: [] }, st, depth, cwd);
+      }
       return cwd;
     }
     case "bash":
@@ -1310,6 +1581,8 @@ function evalCommand(cmd, st, depth, cwd) {
           [words[0], ...args],
           cwd,
         );
+      } else if (/\//.test(words[0]) && SCRIPT_FILE_RE.test(words[0])) {
+        st.uncertain.add("unknown-script-effect");
       }
       return cwd;
   }
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index 55f1016d2..486e32272 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -713,6 +713,7 @@ function addWordTarget(st, cmd, text, cwd, force) {
 function matchParen(text, from) {
   let depth = 1;
   let quote = "";
+  const heredocs = [];
   for (let i = from; i < text.length; i++) {
     const ch = text[i];
     if (quote) {
@@ -720,6 +721,33 @@ function matchParen(text, from) {
       else if (ch === quote) quote = "";
       continue;
     }
+    if (ch === "<" && text[i + 1] === "<" && text[i + 2] !== "<" && text[i + 2] !== "(") {
+      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z0-9_.-]+))/.exec(
+        text.slice(i, i + 200),
+      );
+      if (m) {
+        heredocs.push({ delim: m[2] ?? m[3] ?? m[4], strip: m[1] === "-" });
+        i += m[0].length - 1;
+        continue;
+      }
+    }
+    if (ch === "\n" && heredocs.length > 0) {
+      // Heredoc bodies are data: skip to the line holding each delimiter.
+      let pos = i + 1;
+      for (const h of heredocs) {
+        while (pos < text.length) {
+          let eol = text.indexOf("\n", pos);
+          if (eol < 0) eol = text.length;
+          let line = text.slice(pos, eol);
+          if (h.strip) line = line.replace(/^\t+/, "");
+          pos = eol + 1;
+          if (line === h.delim) break;
+        }
+      }
+      heredocs.length = 0;
+      i = pos - 2;
+      continue;
+    }
     if (ch === "\\") i++;
     else if (ch === "'" || ch === '"') quote = ch;
     else if (ch === "(") depth++;
@@ -1161,6 +1189,187 @@ function awkFiles(args) {
   return pos;
 }
 
+const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
+const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
+
+/** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
+function isDirDest(dest, cwd) {
+  if (dest.endsWith("/")) return true;
+  if (cwd === null && !path.isAbsolute(dest)) return false;
+  try {
+    return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
+  } catch {
+    return false;
+  }
+}
+
+/** `cp` / `mv` destination as a produced file: the lone literal source's body, else unknown. */
+function markCopied(st, cmd, ops, cwd) {
+  const dest = ops[ops.length - 1];
+  if (cmd.dyn.has(dest)) return;
+  if (isDirDest(dest, cwd)) {
+    for (const src of ops.slice(0, -1)) {
+      if (cmd.dyn.has(src)) continue;
+      const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
+      markProduced(
+        st,
+        made,
+        cwd,
+        ops.length === 2 && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(made)
+          ? readBoundedSource(st, src, cwd)
+          : null,
+      );
+    }
+    return;
+  }
+  let body = null;
+  if (ops.length === 2 && !cmd.dyn.has(ops[0]) && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(dest)) {
+    body = readBoundedSource(st, ops[0], cwd);
+  }
+  markProduced(st, dest, cwd, body);
+}
+
+const FETCH_SHORT_VALUE = {
+  curl: new Set("AbcCdDeEFHKmoPQrTuUwXxyYz"),
+  wget: new Set("oaOPeiBtTwQlARDIXUYC"),
+};
+const FETCH_LONG_VALUE = {
+  curl: new Set([
+    "output",
+    "output-dir",
+    "config",
+    "header",
+    "data",
+    "data-raw",
+    "data-binary",
+    "user-agent",
+    "request",
+    "proxy",
+    "user",
+    "cookie",
+    "cookie-jar",
+    "referer",
+    "max-time",
+    "write-out",
+    "form",
+    "upload-file",
+    "range",
+    "connect-timeout",
+    "retry",
+    "dump-header",
+  ]),
+  wget: new Set([
+    "output-document",
+    "directory-prefix",
+    "input-file",
+    "output-file",
+    "append-output",
+    "header",
+    "user-agent",
+    "post-data",
+    "post-file",
+    "execute",
+    "tries",
+    "timeout",
+    "referer",
+    "user",
+    "password",
+    "wait",
+    "base",
+  ]),
+};
+
+/**
+ * One pass over curl / wget arguments: output files, output directory, remote-name mode, positionals.
+ * Handles bundled short flags, attached or separate values, and `--long=value` / `--long value`.
+ */
+function readFetchOptions(program, args) {
+  const res = {
+    outputs: [],
+    outDir: null,
+    remoteName: false,
+    remoteNameAll: false,
+    serverName: false,
+    layout: false,
+    noWrite: false,
+    positionals: [],
+    unresolved: false,
+  };
+  const curl = program === "curl";
+  const shortValue = FETCH_SHORT_VALUE[program];
+  const longValue = FETCH_LONG_VALUE[program];
+  const useShort = (flag, value) => {
+    if (curl) {
+      if (flag === "o") {
+        if (!value.startsWith("=")) res.outputs.push(value);
+      } else if (flag === "K") res.unresolved = true;
+    } else if (flag === "O") res.outputs.push(value);
+    else if (flag === "P") res.outDir = value;
+    else if (flag === "i") res.unresolved = true;
+    else if (flag === "e" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  const useLong = (name, value) => {
+    if (curl) {
+      if (name === "output") res.outputs.push(value);
+      else if (name === "output-dir") res.outDir = value;
+      else if (name === "config") res.unresolved = true;
+    } else if (name === "output-document") res.outputs.push(value);
+    else if (name === "directory-prefix") res.outDir = value;
+    else if (name === "input-file") res.unresolved = true;
+    else if (name === "execute" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  let rest = false;
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (rest || a === "-" || !a.startsWith("-")) {
+      res.positionals.push(a);
+      continue;
+    }
+    if (a === "--") {
+      rest = true;
+      continue;
+    }
+    if (a.startsWith("--")) {
+      const eq = a.indexOf("=");
+      const name = eq < 0 ? a.slice(2) : a.slice(2, eq);
+      if (name === "remote-name" || name === "remote-name-all") res.remoteName = true;
+      if (name === "remote-name-all") res.remoteNameAll = true;
+      if (name === "remote-header-name" || name === "content-disposition") res.serverName = true;
+      if (name === "trust-server-names") res.serverName = true;
+      if (!curl && ["recursive", "mirror", "force-directories"].includes(name)) res.layout = true;
+      if (name === "spider" || (curl && name === "head")) res.noWrite = true;
+      if (eq >= 0) useLong(name, a.slice(eq + 1));
+      else if (longValue.has(name)) {
+        if (args[i + 1] === undefined) continue;
+        useLong(name, args[++i]);
+      }
+      continue;
+    }
+    for (let k = 1; k < a.length; k++) {
+      const c = a[k];
+      if (!curl && c === "n") {
+        k++; // wget `-nv`, `-nc`, `-nd`, `-nH`, `-np` are two-letter flags
+        continue;
+      }
+      if (curl && c === "O") res.remoteName = true;
+      if (curl && c === "J") res.serverName = true;
+      if (curl && c === "I") res.noWrite = true;
+      if (!curl && (c === "r" || c === "m" || c === "x")) res.layout = true;
+      if (shortValue.has(c)) {
+        const attached = a.slice(k + 1);
+        if (attached !== "") useShort(c, attached);
+        else if (args[i + 1] !== undefined) useShort(c, args[++i]);
+        break;
+      }
+    }
+  }
+  return res;
+}
+
 function evalCommand(cmd, st, depth, cwd) {
   const { words, viaXargs } = stripCommandPrefix(cmd.words);
   for (const target of cmd.redirects) {
@@ -1216,6 +1425,11 @@ function evalCommand(cmd, st, depth, cwd) {
     case "ruby": {
       const files = perlRubyFiles(args);
       if (files) inPlaceTargets(files);
+      else if (!args.some((a) => /^-[A-Za-z]*[eE]/.test(a) && !a.startsWith("--"))) {
+        // A script file run by an interpreter that is not analysed: effects are unknown.
+        if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+          st.uncertain.add("unknown-script-effect");
+      }
       return cwd;
     }
     case "awk":
@@ -1233,11 +1447,68 @@ function evalCommand(cmd, st, depth, cwd) {
       }
       if (args.some((a) => a === "-t" || a.startsWith("--target-directory"))) {
         st.uncertain.add("unresolved-target");
-      } else if (ops.length > 1) addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+      } else if (ops.length > 1) {
+        addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+        markCopied(st, cmd, ops, cwd);
+      }
       return cwd;
     }
     case "mv": {
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      const ops = operands(args);
+      for (const f of ops) addWordTarget(st, cmd, f, cwd, false);
+      if (!args.some((a) => a === "-t" || a.startsWith("--target-directory")) && ops.length > 1) {
+        markCopied(st, cmd, ops, cwd);
+      }
+      return cwd;
+    }
+    case "curl":
+    case "wget": {
+      const opts = readFetchOptions(program, args);
+      if (opts.unresolved) st.uncertain.add("unresolved-target");
+      const dirDyn = opts.outDir !== null && cmd.dyn.has(opts.outDir);
+      const inDir = (name) =>
+        opts.outDir !== null && program === "curl" ? `${opts.outDir}/${name}` : name;
+      for (const out of opts.outputs) {
+        if (out === "-") continue;
+        if (!cmd.dyn.has(out) && !dirDyn) markProduced(st, inDir(out), cwd, null);
+        else st.uncertain.add("unresolved-target");
+      }
+      // Remote-name downloads: record a local name only when it is exactly the URL's last path
+      // segment of a plain http(s) URL; every other file-writing shape is an unresolved target.
+      const remote = program === "wget" || opts.remoteName;
+      if (remote && !opts.noWrite && opts.positionals.length > 0) {
+        const mixed =
+          program === "curl" && opts.outputs.length > 0 && (opts.remoteName || opts.remoteNameAll);
+        const wgetNamed = program === "wget" && opts.outputs.length > 0;
+        if (!wgetNamed) {
+          if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
+          else if (opts.outputs.length === 0) {
+            for (const a of opts.positionals) {
+              const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
+              if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
+              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+            }
+          }
+        }
+      }
+      return cwd;
+    }
+    case "tsx":
+    case "ts-node":
+    case "bun":
+    case "deno":
+      if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+        st.uncertain.add("unknown-script-effect");
+      return cwd;
+    case "npx":
+    case "pnpx":
+    case "bunx":
+    case "pnpm":
+    case "yarn": {
+      const idx = args.findIndex((a) => RUNNER_PROGRAMS.has(a));
+      if (idx >= 0 && !args.slice(0, idx).some((a) => a === "--")) {
+        evalCommand({ ...cmd, words: args.slice(idx), redirects: [] }, st, depth, cwd);
+      }
       return cwd;
     }
     case "bash":
@@ -1312,6 +1583,8 @@ function evalCommand(cmd, st, depth, cwd) {
           [words[0], ...args],
           cwd,
         );
+      } else if (/\//.test(words[0]) && SCRIPT_FILE_RE.test(words[0])) {
+        st.uncertain.add("unknown-script-effect");
       }
       return cwd;
   }
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index e112a1460..58ac39e10 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -705,6 +705,7 @@ function addWordTarget(st, cmd, text, cwd, force) {
 function matchParen(text, from) {
   let depth = 1;
   let quote = "";
+  const heredocs = [];
   for (let i = from; i < text.length; i++) {
     const ch = text[i];
     if (quote) {
@@ -712,6 +713,33 @@ function matchParen(text, from) {
       else if (ch === quote) quote = "";
       continue;
     }
+    if (ch === "<" && text[i + 1] === "<" && text[i + 2] !== "<" && text[i + 2] !== "(") {
+      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z0-9_.-]+))/.exec(
+        text.slice(i, i + 200),
+      );
+      if (m) {
+        heredocs.push({ delim: m[2] ?? m[3] ?? m[4], strip: m[1] === "-" });
+        i += m[0].length - 1;
+        continue;
+      }
+    }
+    if (ch === "\n" && heredocs.length > 0) {
+      // Heredoc bodies are data: skip to the line holding each delimiter.
+      let pos = i + 1;
+      for (const h of heredocs) {
+        while (pos < text.length) {
+          let eol = text.indexOf("\n", pos);
+          if (eol < 0) eol = text.length;
+          let line = text.slice(pos, eol);
+          if (h.strip) line = line.replace(/^\t+/, "");
+          pos = eol + 1;
+          if (line === h.delim) break;
+        }
+      }
+      heredocs.length = 0;
+      i = pos - 2;
+      continue;
+    }
     if (ch === "\\") i++;
     else if (ch === "'" || ch === '"') quote = ch;
     else if (ch === "(") depth++;
@@ -1153,6 +1181,187 @@ function awkFiles(args) {
   return pos;
 }
 
+const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
+const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
+
+/** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
+function isDirDest(dest, cwd) {
+  if (dest.endsWith("/")) return true;
+  if (cwd === null && !path.isAbsolute(dest)) return false;
+  try {
+    return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
+  } catch {
+    return false;
+  }
+}
+
+/** `cp` / `mv` destination as a produced file: the lone literal source's body, else unknown. */
+function markCopied(st, cmd, ops, cwd) {
+  const dest = ops[ops.length - 1];
+  if (cmd.dyn.has(dest)) return;
+  if (isDirDest(dest, cwd)) {
+    for (const src of ops.slice(0, -1)) {
+      if (cmd.dyn.has(src)) continue;
+      const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
+      markProduced(
+        st,
+        made,
+        cwd,
+        ops.length === 2 && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(made)
+          ? readBoundedSource(st, src, cwd)
+          : null,
+      );
+    }
+    return;
+  }
+  let body = null;
+  if (ops.length === 2 && !cmd.dyn.has(ops[0]) && /\.(?:py|js|mjs|cjs|sh|bash|zsh)$/.test(dest)) {
+    body = readBoundedSource(st, ops[0], cwd);
+  }
+  markProduced(st, dest, cwd, body);
+}
+
+const FETCH_SHORT_VALUE = {
+  curl: new Set("AbcCdDeEFHKmoPQrTuUwXxyYz"),
+  wget: new Set("oaOPeiBtTwQlARDIXUYC"),
+};
+const FETCH_LONG_VALUE = {
+  curl: new Set([
+    "output",
+    "output-dir",
+    "config",
+    "header",
+    "data",
+    "data-raw",
+    "data-binary",
+    "user-agent",
+    "request",
+    "proxy",
+    "user",
+    "cookie",
+    "cookie-jar",
+    "referer",
+    "max-time",
+    "write-out",
+    "form",
+    "upload-file",
+    "range",
+    "connect-timeout",
+    "retry",
+    "dump-header",
+  ]),
+  wget: new Set([
+    "output-document",
+    "directory-prefix",
+    "input-file",
+    "output-file",
+    "append-output",
+    "header",
+    "user-agent",
+    "post-data",
+    "post-file",
+    "execute",
+    "tries",
+    "timeout",
+    "referer",
+    "user",
+    "password",
+    "wait",
+    "base",
+  ]),
+};
+
+/**
+ * One pass over curl / wget arguments: output files, output directory, remote-name mode, positionals.
+ * Handles bundled short flags, attached or separate values, and `--long=value` / `--long value`.
+ */
+function readFetchOptions(program, args) {
+  const res = {
+    outputs: [],
+    outDir: null,
+    remoteName: false,
+    remoteNameAll: false,
+    serverName: false,
+    layout: false,
+    noWrite: false,
+    positionals: [],
+    unresolved: false,
+  };
+  const curl = program === "curl";
+  const shortValue = FETCH_SHORT_VALUE[program];
+  const longValue = FETCH_LONG_VALUE[program];
+  const useShort = (flag, value) => {
+    if (curl) {
+      if (flag === "o") {
+        if (!value.startsWith("=")) res.outputs.push(value);
+      } else if (flag === "K") res.unresolved = true;
+    } else if (flag === "O") res.outputs.push(value);
+    else if (flag === "P") res.outDir = value;
+    else if (flag === "i") res.unresolved = true;
+    else if (flag === "e" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  const useLong = (name, value) => {
+    if (curl) {
+      if (name === "output") res.outputs.push(value);
+      else if (name === "output-dir") res.outDir = value;
+      else if (name === "config") res.unresolved = true;
+    } else if (name === "output-document") res.outputs.push(value);
+    else if (name === "directory-prefix") res.outDir = value;
+    else if (name === "input-file") res.unresolved = true;
+    else if (name === "execute" && /(?:dir_prefix|output_document|dirprefix)/i.test(value)) {
+      res.unresolved = true;
+    }
+  };
+  let rest = false;
+  for (let i = 0; i < args.length; i++) {
+    const a = args[i];
+    if (rest || a === "-" || !a.startsWith("-")) {
+      res.positionals.push(a);
+      continue;
+    }
+    if (a === "--") {
+      rest = true;
+      continue;
+    }
+    if (a.startsWith("--")) {
+      const eq = a.indexOf("=");
+      const name = eq < 0 ? a.slice(2) : a.slice(2, eq);
+      if (name === "remote-name" || name === "remote-name-all") res.remoteName = true;
+      if (name === "remote-name-all") res.remoteNameAll = true;
+      if (name === "remote-header-name" || name === "content-disposition") res.serverName = true;
+      if (name === "trust-server-names") res.serverName = true;
+      if (!curl && ["recursive", "mirror", "force-directories"].includes(name)) res.layout = true;
+      if (name === "spider" || (curl && name === "head")) res.noWrite = true;
+      if (eq >= 0) useLong(name, a.slice(eq + 1));
+      else if (longValue.has(name)) {
+        if (args[i + 1] === undefined) continue;
+        useLong(name, args[++i]);
+      }
+      continue;
+    }
+    for (let k = 1; k < a.length; k++) {
+      const c = a[k];
+      if (!curl && c === "n") {
+        k++; // wget `-nv`, `-nc`, `-nd`, `-nH`, `-np` are two-letter flags
+        continue;
+      }
+      if (curl && c === "O") res.remoteName = true;
+      if (curl && c === "J") res.serverName = true;
+      if (curl && c === "I") res.noWrite = true;
+      if (!curl && (c === "r" || c === "m" || c === "x")) res.layout = true;
+      if (shortValue.has(c)) {
+        const attached = a.slice(k + 1);
+        if (attached !== "") useShort(c, attached);
+        else if (args[i + 1] !== undefined) useShort(c, args[++i]);
+        break;
+      }
+    }
+  }
+  return res;
+}
+
 function evalCommand(cmd, st, depth, cwd) {
   const { words, viaXargs } = stripCommandPrefix(cmd.words);
   for (const target of cmd.redirects) {
@@ -1208,6 +1417,11 @@ function evalCommand(cmd, st, depth, cwd) {
     case "ruby": {
       const files = perlRubyFiles(args);
       if (files) inPlaceTargets(files);
+      else if (!args.some((a) => /^-[A-Za-z]*[eE]/.test(a) && !a.startsWith("--"))) {
+        // A script file run by an interpreter that is not analysed: effects are unknown.
+        if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+          st.uncertain.add("unknown-script-effect");
+      }
       return cwd;
     }
     case "awk":
@@ -1225,11 +1439,68 @@ function evalCommand(cmd, st, depth, cwd) {
       }
       if (args.some((a) => a === "-t" || a.startsWith("--target-directory"))) {
         st.uncertain.add("unresolved-target");
-      } else if (ops.length > 1) addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+      } else if (ops.length > 1) {
+        addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
+        markCopied(st, cmd, ops, cwd);
+      }
       return cwd;
     }
     case "mv": {
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      const ops = operands(args);
+      for (const f of ops) addWordTarget(st, cmd, f, cwd, false);
+      if (!args.some((a) => a === "-t" || a.startsWith("--target-directory")) && ops.length > 1) {
+        markCopied(st, cmd, ops, cwd);
+      }
+      return cwd;
+    }
+    case "curl":
+    case "wget": {
+      const opts = readFetchOptions(program, args);
+      if (opts.unresolved) st.uncertain.add("unresolved-target");
+      const dirDyn = opts.outDir !== null && cmd.dyn.has(opts.outDir);
+      const inDir = (name) =>
+        opts.outDir !== null && program === "curl" ? `${opts.outDir}/${name}` : name;
+      for (const out of opts.outputs) {
+        if (out === "-") continue;
+        if (!cmd.dyn.has(out) && !dirDyn) markProduced(st, inDir(out), cwd, null);
+        else st.uncertain.add("unresolved-target");
+      }
+      // Remote-name downloads: record a local name only when it is exactly the URL's last path
+      // segment of a plain http(s) URL; every other file-writing shape is an unresolved target.
+      const remote = program === "wget" || opts.remoteName;
+      if (remote && !opts.noWrite && opts.positionals.length > 0) {
+        const mixed =
+          program === "curl" && opts.outputs.length > 0 && (opts.remoteName || opts.remoteNameAll);
+        const wgetNamed = program === "wget" && opts.outputs.length > 0;
+        if (!wgetNamed) {
+          if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
+          else if (opts.outputs.length === 0) {
+            for (const a of opts.positionals) {
+              const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
+              if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
+              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+            }
+          }
+        }
+      }
+      return cwd;
+    }
+    case "tsx":
+    case "ts-node":
+    case "bun":
+    case "deno":
+      if (operands(args).some((a) => SCRIPT_FILE_RE.test(a)))
+        st.uncertain.add("unknown-script-effect");
+      return cwd;
+    case "npx":
+    case "pnpx":
+    case "bunx":
+    case "pnpm":
+    case "yarn": {
+      const idx = args.findIndex((a) => RUNNER_PROGRAMS.has(a));
+      if (idx >= 0 && !args.slice(0, idx).some((a) => a === "--")) {
+        evalCommand({ ...cmd, words: args.slice(idx), redirects: [] }, st, depth, cwd);
+      }
       return cwd;
     }
     case "bash":
@@ -1304,6 +1575,8 @@ function evalCommand(cmd, st, depth, cwd) {
           [words[0], ...args],
           cwd,
         );
+      } else if (/\//.test(words[0]) && SCRIPT_FILE_RE.test(words[0])) {
+        st.uncertain.add("unknown-script-effect");
       }
       return cwd;
   }
diff --git a/DETAILS.md b/DETAILS.md
index 5f815305c..28846e52c 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -348,7 +348,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1719 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>310 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>315 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
diff --git a/dist/install/write.js b/dist/install/write.js
index 7dc1da358..88fd69146 100644
--- a/dist/install/write.js
+++ b/dist/install/write.js
@@ -177,17 +177,36 @@ function mergeManagedList(base, override) {
                     templateCommands.add(`bkit-file:${file}`);
             }
         }
+        const isTemplateCommand = (c) => {
+            const file = bkitHookFile(c);
+            return (templateCommands.has(c) || (file !== undefined && templateCommands.has(`bkit-file:${file}`)));
+        };
         const templateKeys = new Set(override.map((g) => JSON.stringify(g)));
-        const kept = base.filter((g) => {
+        const merged = override.map((g) => ({ ...g }));
+        const kept = [];
+        for (const g of base) {
             if (templateKeys.has(JSON.stringify(g)))
-                return false;
-            return !groupCommands(g).some((c) => {
-                const file = bkitHookFile(c);
-                return (templateCommands.has(c) ||
-                    (file !== undefined && templateCommands.has(`bkit-file:${file}`)));
-            });
-        });
-        return [...override, ...kept];
+                continue;
+            const group = g;
+            const cmds = groupCommands(group);
+            if (!cmds.some(isTemplateCommand)) {
+                kept.push(g);
+                continue;
+            }
+            // A replaced bkit group: its consumer-added hooks move into the matching template group.
+            if (!Array.isArray(group.hooks))
+                continue;
+            const extras = group.hooks.filter((h) => isPlainObject(h) && typeof h.command === "string" && !isTemplateCommand(h.command));
+            if (extras.length === 0)
+                continue;
+            const target = merged.find((t) => groupCommands(t).some((c) => cmds.some((bc) => bc === c || (bkitHookFile(c) !== undefined && bkitHookFile(c) === bkitHookFile(bc)))));
+            if (!target || !Array.isArray(target.hooks))
+                continue;
+            const have = new Set(target.hooks.map((h) => JSON.stringify(h)));
+            const add = extras.filter((h) => !have.has(JSON.stringify(h)));
+            target.hooks = [...target.hooks, ...add];
+        }
+        return [...merged, ...kept];
     }
     const seen = new Set(override.map((e) => JSON.stringify(e)));
     const extras = base.filter((e) => !seen.has(JSON.stringify(e)));
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 277e6b70c..3bea11a67 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -165,7 +165,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1719 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>310 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>315 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -263,7 +263,7 @@ flowchart LR
     n_bkit_core_engine_install_manifest[".bkit/core/engine/install/manifest<br/>34 symbols · 1 files"]
     n_bkit_core_engine_install_modules_index[".bkit/core/engine/install/modules/index<br/>10 symbols · 1 files"]
     n_bkit_core_engine_install_version_file[".bkit/core/engine/install/version-file<br/>17 symbols · 1 files"]
-    n_bkit_core_engine_install_write[".bkit/core/engine/install/write<br/>23 symbols · 1 files"]
+    n_bkit_core_engine_install_write[".bkit/core/engine/install/write<br/>28 symbols · 1 files"]
     n_bkit_core_engine_shared_package_roots[".bkit/core/engine/shared/package-roots<br/>14 symbols · 1 files"]
   end
   subgraph gncustom_telemetry["Telemetry"]
