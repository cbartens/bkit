diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index 492d2f364..c0b99ce7b 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -453,7 +453,27 @@ function shellEditContext(notice, edits, ctx, sessionId, agentId, budget, outsid
 // one source). Needs `fs` and `path` in scope; the host's own code above declares them.
 
 /** Wrappers that precede the real command; skipped when finding a command's program. */
-const CMD_WRAPPERS = new Set(["sudo", "env", "time", "nohup", "nice", "command", "exec", "xargs"]);
+const CMD_WRAPPERS = new Set([
+  "sudo",
+  "env",
+  "time",
+  "nohup",
+  "nice",
+  "command",
+  "exec",
+  "xargs",
+  "timeout",
+]);
+
+/** Short options of each wrapper that take the next word as their argument. */
+const WRAPPER_OPTION_ARGS = {
+  xargs: new Set(["-I", "-n", "-P", "-L", "-s", "-d", "-E", "-a", "-J"]),
+  sudo: new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U", "-r", "-t"]),
+  nice: new Set(["-n"]),
+  env: new Set(["-u", "-C", "-S"]),
+  timeout: new Set(["-k", "-s"]),
+  exec: new Set(["-a"]),
+};
 
 /** Split a command line into pipeline / list segments. */
 function shellSegments(cmd) {
@@ -605,6 +625,7 @@ function newEvidence(ctx) {
     limit: null,
     halted: false,
     commands: 0,
+    produced: new Map(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -740,6 +761,7 @@ function lexShell(text, st, depth) {
       else if (r.op === "<") cmd.stdinFile = word.t;
       else if (r.op === "<<<") cmd.hereString = word.t;
       else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
+      else if (r.op === ">" && r.dup && !/^(\d+|-)$/.test(word.t)) cmd.redirects.push(word.t);
       return;
     }
     cmd.words.push(word.t);
@@ -890,7 +912,7 @@ function lexShell(text, st, depth) {
         i++;
       } else if (text[i + 1] === ">") {
         pushWord();
-        pending = { op: ">", ignore: true };
+        pending = { op: ">", ignore: false };
         i += text[i + 2] === ">" ? 2 : 1;
       } else {
         endCommand(false);
@@ -912,18 +934,22 @@ function lexShell(text, st, depth) {
     }
     if (ch === ">" || ch === "<") {
       let fd = false;
+      let stdoutFd = false;
       if (cur.started && cur.digits && !cur.quoted) {
         fd = true;
+        stdoutFd = ch === ">" && cur.t === "1";
         cur = newLexWord();
       } else pushWord();
       let op = ch;
       let strip = false;
-      let ignore = fd;
+      let ignore = fd && !stdoutFd;
+      let dup = false;
       let j = i + 1;
       if (ch === ">") {
         if (text[j] === ">" || text[j] === "|") j++;
         else if (text[j] === "&") {
           ignore = true;
+          dup = !fd || stdoutFd;
           j++;
         }
       } else if (text[j] === "<") {
@@ -946,7 +972,7 @@ function lexShell(text, st, depth) {
         j++;
       }
       i = j - 1;
-      pending = { op, strip, ignore };
+      pending = { op, strip, ignore, dup };
       continue;
     }
     if (!cur.started && ch === "~") cur.dyn = true;
@@ -984,8 +1010,17 @@ function stripCommandPrefix(words) {
       CMD_WRAPPERS.has(words[i]) ||
       KEYWORD_PREFIX.has(words[i]))
   ) {
-    if (words[i] === "xargs") viaXargs = true;
+    const wrapper = words[i];
+    if (wrapper === "xargs") viaXargs = true;
     i++;
+    if (!CMD_WRAPPERS.has(wrapper)) continue;
+    const withArg = WRAPPER_OPTION_ARGS[wrapper];
+    while (i < words.length && words[i].startsWith("-") && words[i].length > 1) {
+      const opt = words[i++];
+      if (opt === "--") break;
+      if (withArg && withArg.has(opt)) i++;
+    }
+    if (wrapper === "timeout" && i < words.length) i++;
   }
   return { words: words.slice(i), viaXargs };
 }
@@ -1130,10 +1165,20 @@ function evalCommand(cmd, st, depth, cwd) {
         st.uncertain.add("unresolved-target");
       }
     } else if (!target.startsWith("&")) addEvidenceTarget(st, target, cwd, false);
+    if (!cmd.dyn.has(target) && !target.startsWith("&")) {
+      const sole = cmd.words.length === 1 && cmd.words[0].replace(/^.*\//, "") === "cat";
+      markProduced(
+        st,
+        target,
+        cwd,
+        sole && cmd.heredoc && cmd.heredoc.quoted ? cmd.heredoc.body : null,
+      );
+    }
   }
   if (words.length === 0) return cwd;
   const program = words[0].replace(/^.*\//, "");
   const args = words.slice(1);
+  if (viaXargs) cmd.dyn.add("{}");
   const inPlaceTargets = (files) => {
     for (const f of files) addWordTarget(st, cmd, f, cwd, true);
     if (viaXargs) st.uncertain.add("unknown-stdin");
@@ -1150,7 +1195,10 @@ function evalCommand(cmd, st, depth, cwd) {
     case "popd":
       return null;
     case "tee":
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      for (const f of operands(args)) {
+        addWordTarget(st, cmd, f, cwd, false);
+        if (!cmd.dyn.has(f)) markProduced(st, f, cwd, null);
+      }
       return cwd;
     case "sed": {
       const files = sedFiles(args);
@@ -1191,11 +1239,25 @@ function evalCommand(cmd, st, depth, cwd) {
     case "dash":
     case "ksh": {
       const c = args.findIndex((w) => /^-[a-z]*c$/.test(w));
-      if (c < 0 || args[c + 1] === undefined) return cwd;
-      const script = args[c + 1];
-      if (cmd.dyn.has(script)) {
-        st.uncertain.add("unknown-script-effect");
-        return cwd;
+      let script = null;
+      if (c >= 0 && args[c + 1] !== undefined) {
+        script = args[c + 1];
+        if (cmd.dyn.has(script)) {
+          st.uncertain.add("unknown-script-effect");
+          return cwd;
+        }
+      } else {
+        const file = operands(args)[0];
+        if (file !== undefined) {
+          if (cmd.dyn.has(file)) {
+            st.uncertain.add("unavailable-source");
+            return cwd;
+          }
+          script = readBoundedSource(st, file, cwd);
+        } else if (cmd.heredoc || cmd.hereString !== null || cmd.stdinFile || cmd.piped) {
+          script = knownStdin(cmd, st, cwd);
+        }
+        if (script === null) return cwd;
       }
       if (depth + 1 > EVIDENCE_LIMITS.depth) {
         evidenceLimit(st, "depth");
@@ -1204,6 +1266,18 @@ function evalCommand(cmd, st, depth, cwd) {
       evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
       return cwd;
     }
+    case "find": {
+      const start = args.findIndex((w) => /^-(exec|execdir|ok|okdir)$/.test(w));
+      if (start < 0) return cwd;
+      let end = start + 1;
+      while (end < args.length && args[end] !== ";" && args[end] !== "+") end++;
+      const sub = args.slice(start + 1, end);
+      if (sub.length === 0) return cwd;
+      const dyn = new Set(cmd.dyn);
+      dyn.add("{}");
+      evalCommand({ ...cmd, words: sub, dyn, redirects: [] }, st, depth, cwd);
+      return cwd;
+    }
     case "git":
       if (args[0] === "apply") evalPatch(cmd, st, "git", args.slice(1), cwd);
       return cwd;
@@ -1217,7 +1291,13 @@ function evalCommand(cmd, st, depth, cwd) {
       evalInterpreter(cmd, st, program.startsWith("python") ? "python" : "js", args, cwd);
       return cwd;
     default:
-      if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
+      if (/\//.test(words[0]) && /\.(sh|bash|zsh)$/.test(words[0])) {
+        const script = readBoundedSource(st, words[0], cwd);
+        if (script !== null) {
+          if (depth + 1 > EVIDENCE_LIMITS.depth) evidenceLimit(st, "depth");
+          else evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
+        }
+      } else if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
         evalInterpreter(
           cmd,
           st,
@@ -1232,12 +1312,25 @@ function evalCommand(cmd, st, depth, cwd) {
 
 // --- Bounded source reads ----------------------------------------------------
 
+/** Remember a file an earlier command of the line writes, with its body when it is literal. */
+function markProduced(st, file, cwd, body) {
+  if (cwd === null && !path.isAbsolute(file)) return;
+  st.produced.set(path.resolve(cwd === null ? path.sep : cwd, file), body);
+}
+
 /** Text of a directly named regular file, or null with uncertainty / a limit recorded. */
 function readBoundedSource(st, file, cwd) {
   if (cwd === null && !path.isAbsolute(file)) {
     st.uncertain.add("unresolved-directory");
     return null;
   }
+  // A file an earlier command of the same line writes is read from that command, not disk.
+  const made = path.resolve(cwd === null ? path.sep : cwd, file);
+  if (st.produced.has(made)) {
+    const body = st.produced.get(made);
+    if (body === null) st.uncertain.add("unknown-script-effect");
+    return body;
+  }
   const max = EVIDENCE_LIMITS.sourceBytes;
   try {
     const abs = path.resolve(cwd === null ? path.sep : cwd, file);
diff --git a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
index 78b810397..5a63c03c9 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
@@ -529,6 +529,53 @@ describe("cursor guardrails.cjs — shell edit evidence", () => {
     expect(huge.text).toMatch(LIMIT);
   });
 
+  it("flags a script the same command writes before running it", () => {
+    const dir = workDir("selfwrite");
+    const heredoc = advise(
+      "cat > /tmp/bkit-w.py <<'PY'\nopen('src/tmp-script.py','w').write('x')\nPY\npython3 /tmp/bkit-w.py",
+      dir,
+    );
+    expect(heredoc.text).toMatch(/src\/tmp-script\.py|cannot be determined/i);
+    expect(heredoc.permission).toBe("allow");
+
+    const printed = advise("printf x > gen.py && python3 gen.py", dir);
+    expect(printed.text).toContain("gen.py");
+    expect(printed.text).toMatch(UNCERTAIN);
+  });
+
+  it("marks shell scripts run by name or on stdin", () => {
+    const dir = workDir("shscript");
+    fs.writeFileSync(path.join(dir, "fix.sh"), "sed -i s/a/b/ src/sh-named.ts\n");
+    for (const command of ["bash fix.sh", "./fix.sh"]) {
+      const r = advise(command, dir);
+      expect({ command, text: r.text }).toEqual({
+        command,
+        text: expect.stringMatching(/src\/sh-named\.ts|cannot be determined/i),
+      });
+      expect(r.permission).toBe("allow");
+    }
+    const here = advise("bash <<'SH'\nsed -i s/a/b/ src/sh-heredoc.ts\nSH", dir);
+    expect(here.text).toMatch(/src\/sh-heredoc\.ts|cannot be determined/i);
+
+    expect(advise("cat fix.sh | bash", dir).text).toMatch(UNCERTAIN);
+  });
+
+  it("follows wrapper options and find -exec to the edit they run", () => {
+    const dir = workDir("wrapopts");
+    expect(advise("sudo -u me sed -i s/a/b/ src/sudo-u.ts", dir).text).toContain("src/sudo-u.ts");
+    expect(advise("timeout 5 sed -i s/a/b/ src/timeout.ts", dir).text).toContain("src/timeout.ts");
+    expect(advise("xargs -I{} sed -i s/a/b/ {} < list.txt", dir).text).toMatch(UNCERTAIN);
+    expect(advise("find src -name '*.ts' -exec sed -i s/a/b/ {} +", dir).text).toMatch(UNCERTAIN);
+  });
+
+  it("treats stdout-carrying fd redirects as edits", () => {
+    const dir = workDir("fdredir");
+    expect(advise("echo x &> src/amp.ts", dir).text).toContain("src/amp.ts");
+    expect(advise("echo x &>> src/amp-append.ts", dir).text).toContain("src/amp-append.ts");
+    expect(advise("echo x 1> src/fd1.ts", dir).text).toContain("src/fd1.ts");
+    expect(advise("echo x 2> src/err.ts", dir).text).toBe("");
+  });
+
   describe("in-process evidence seams", () => {
     type Evidence = { targets: string[]; uncertain: string[]; limit: string | null };
     function loadEvidence(): (cmd: string, ctx: { cwd: string; root: string }) => Evidence {
diff --git a/.bkit/core/hooks/guardrails-shell.js b/.bkit/core/hooks/guardrails-shell.js
index fa0005d3b..85a062ab2 100644
--- a/.bkit/core/hooks/guardrails-shell.js
+++ b/.bkit/core/hooks/guardrails-shell.js
@@ -2,7 +2,27 @@
 // one source). Needs `fs` and `path` in scope; the host's own code above declares them.
 
 /** Wrappers that precede the real command; skipped when finding a command's program. */
-const CMD_WRAPPERS = new Set(["sudo", "env", "time", "nohup", "nice", "command", "exec", "xargs"]);
+const CMD_WRAPPERS = new Set([
+  "sudo",
+  "env",
+  "time",
+  "nohup",
+  "nice",
+  "command",
+  "exec",
+  "xargs",
+  "timeout",
+]);
+
+/** Short options of each wrapper that take the next word as their argument. */
+const WRAPPER_OPTION_ARGS = {
+  xargs: new Set(["-I", "-n", "-P", "-L", "-s", "-d", "-E", "-a", "-J"]),
+  sudo: new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U", "-r", "-t"]),
+  nice: new Set(["-n"]),
+  env: new Set(["-u", "-C", "-S"]),
+  timeout: new Set(["-k", "-s"]),
+  exec: new Set(["-a"]),
+};
 
 /** Split a command line into pipeline / list segments. */
 function shellSegments(cmd) {
@@ -154,6 +174,7 @@ function newEvidence(ctx) {
     limit: null,
     halted: false,
     commands: 0,
+    produced: new Map(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -289,6 +310,7 @@ function lexShell(text, st, depth) {
       else if (r.op === "<") cmd.stdinFile = word.t;
       else if (r.op === "<<<") cmd.hereString = word.t;
       else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
+      else if (r.op === ">" && r.dup && !/^(\d+|-)$/.test(word.t)) cmd.redirects.push(word.t);
       return;
     }
     cmd.words.push(word.t);
@@ -439,7 +461,7 @@ function lexShell(text, st, depth) {
         i++;
       } else if (text[i + 1] === ">") {
         pushWord();
-        pending = { op: ">", ignore: true };
+        pending = { op: ">", ignore: false };
         i += text[i + 2] === ">" ? 2 : 1;
       } else {
         endCommand(false);
@@ -461,18 +483,22 @@ function lexShell(text, st, depth) {
     }
     if (ch === ">" || ch === "<") {
       let fd = false;
+      let stdoutFd = false;
       if (cur.started && cur.digits && !cur.quoted) {
         fd = true;
+        stdoutFd = ch === ">" && cur.t === "1";
         cur = newLexWord();
       } else pushWord();
       let op = ch;
       let strip = false;
-      let ignore = fd;
+      let ignore = fd && !stdoutFd;
+      let dup = false;
       let j = i + 1;
       if (ch === ">") {
         if (text[j] === ">" || text[j] === "|") j++;
         else if (text[j] === "&") {
           ignore = true;
+          dup = !fd || stdoutFd;
           j++;
         }
       } else if (text[j] === "<") {
@@ -495,7 +521,7 @@ function lexShell(text, st, depth) {
         j++;
       }
       i = j - 1;
-      pending = { op, strip, ignore };
+      pending = { op, strip, ignore, dup };
       continue;
     }
     if (!cur.started && ch === "~") cur.dyn = true;
@@ -533,8 +559,17 @@ function stripCommandPrefix(words) {
       CMD_WRAPPERS.has(words[i]) ||
       KEYWORD_PREFIX.has(words[i]))
   ) {
-    if (words[i] === "xargs") viaXargs = true;
+    const wrapper = words[i];
+    if (wrapper === "xargs") viaXargs = true;
     i++;
+    if (!CMD_WRAPPERS.has(wrapper)) continue;
+    const withArg = WRAPPER_OPTION_ARGS[wrapper];
+    while (i < words.length && words[i].startsWith("-") && words[i].length > 1) {
+      const opt = words[i++];
+      if (opt === "--") break;
+      if (withArg && withArg.has(opt)) i++;
+    }
+    if (wrapper === "timeout" && i < words.length) i++;
   }
   return { words: words.slice(i), viaXargs };
 }
@@ -679,10 +714,20 @@ function evalCommand(cmd, st, depth, cwd) {
         st.uncertain.add("unresolved-target");
       }
     } else if (!target.startsWith("&")) addEvidenceTarget(st, target, cwd, false);
+    if (!cmd.dyn.has(target) && !target.startsWith("&")) {
+      const sole = cmd.words.length === 1 && cmd.words[0].replace(/^.*\//, "") === "cat";
+      markProduced(
+        st,
+        target,
+        cwd,
+        sole && cmd.heredoc && cmd.heredoc.quoted ? cmd.heredoc.body : null,
+      );
+    }
   }
   if (words.length === 0) return cwd;
   const program = words[0].replace(/^.*\//, "");
   const args = words.slice(1);
+  if (viaXargs) cmd.dyn.add("{}");
   const inPlaceTargets = (files) => {
     for (const f of files) addWordTarget(st, cmd, f, cwd, true);
     if (viaXargs) st.uncertain.add("unknown-stdin");
@@ -699,7 +744,10 @@ function evalCommand(cmd, st, depth, cwd) {
     case "popd":
       return null;
     case "tee":
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      for (const f of operands(args)) {
+        addWordTarget(st, cmd, f, cwd, false);
+        if (!cmd.dyn.has(f)) markProduced(st, f, cwd, null);
+      }
       return cwd;
     case "sed": {
       const files = sedFiles(args);
@@ -740,11 +788,25 @@ function evalCommand(cmd, st, depth, cwd) {
     case "dash":
     case "ksh": {
       const c = args.findIndex((w) => /^-[a-z]*c$/.test(w));
-      if (c < 0 || args[c + 1] === undefined) return cwd;
-      const script = args[c + 1];
-      if (cmd.dyn.has(script)) {
-        st.uncertain.add("unknown-script-effect");
-        return cwd;
+      let script = null;
+      if (c >= 0 && args[c + 1] !== undefined) {
+        script = args[c + 1];
+        if (cmd.dyn.has(script)) {
+          st.uncertain.add("unknown-script-effect");
+          return cwd;
+        }
+      } else {
+        const file = operands(args)[0];
+        if (file !== undefined) {
+          if (cmd.dyn.has(file)) {
+            st.uncertain.add("unavailable-source");
+            return cwd;
+          }
+          script = readBoundedSource(st, file, cwd);
+        } else if (cmd.heredoc || cmd.hereString !== null || cmd.stdinFile || cmd.piped) {
+          script = knownStdin(cmd, st, cwd);
+        }
+        if (script === null) return cwd;
       }
       if (depth + 1 > EVIDENCE_LIMITS.depth) {
         evidenceLimit(st, "depth");
@@ -753,6 +815,18 @@ function evalCommand(cmd, st, depth, cwd) {
       evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
       return cwd;
     }
+    case "find": {
+      const start = args.findIndex((w) => /^-(exec|execdir|ok|okdir)$/.test(w));
+      if (start < 0) return cwd;
+      let end = start + 1;
+      while (end < args.length && args[end] !== ";" && args[end] !== "+") end++;
+      const sub = args.slice(start + 1, end);
+      if (sub.length === 0) return cwd;
+      const dyn = new Set(cmd.dyn);
+      dyn.add("{}");
+      evalCommand({ ...cmd, words: sub, dyn, redirects: [] }, st, depth, cwd);
+      return cwd;
+    }
     case "git":
       if (args[0] === "apply") evalPatch(cmd, st, "git", args.slice(1), cwd);
       return cwd;
@@ -766,7 +840,13 @@ function evalCommand(cmd, st, depth, cwd) {
       evalInterpreter(cmd, st, program.startsWith("python") ? "python" : "js", args, cwd);
       return cwd;
     default:
-      if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
+      if (/\//.test(words[0]) && /\.(sh|bash|zsh)$/.test(words[0])) {
+        const script = readBoundedSource(st, words[0], cwd);
+        if (script !== null) {
+          if (depth + 1 > EVIDENCE_LIMITS.depth) evidenceLimit(st, "depth");
+          else evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
+        }
+      } else if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
         evalInterpreter(
           cmd,
           st,
@@ -781,12 +861,25 @@ function evalCommand(cmd, st, depth, cwd) {
 
 // --- Bounded source reads ----------------------------------------------------
 
+/** Remember a file an earlier command of the line writes, with its body when it is literal. */
+function markProduced(st, file, cwd, body) {
+  if (cwd === null && !path.isAbsolute(file)) return;
+  st.produced.set(path.resolve(cwd === null ? path.sep : cwd, file), body);
+}
+
 /** Text of a directly named regular file, or null with uncertainty / a limit recorded. */
 function readBoundedSource(st, file, cwd) {
   if (cwd === null && !path.isAbsolute(file)) {
     st.uncertain.add("unresolved-directory");
     return null;
   }
+  // A file an earlier command of the same line writes is read from that command, not disk.
+  const made = path.resolve(cwd === null ? path.sep : cwd, file);
+  if (st.produced.has(made)) {
+    const body = st.produced.get(made);
+    if (body === null) st.uncertain.add("unknown-script-effect");
+    return body;
+  }
   const max = EVIDENCE_LIMITS.sourceBytes;
   try {
     const abs = path.resolve(cwd === null ? path.sep : cwd, file);
diff --git a/.bkit/version b/.bkit/version
index 047435784..bd0d8b2fa 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -228,12 +228,12 @@
     ".bkit/README.md": "3eab3725aca61c812345c2867a375c71434e4f3482d9961587fb41dd2ede7ae6",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "11ac4050fa9d0a87bf4b7aaddd3849fe76ed1cee1220c6d65e224ce59d867520",
-    ".claude/hooks/bkit-guardrails.cjs": "56d7c8d1d73678c279349224b1876c1a0079aebd28fa88d7235c88f229e41844",
+    ".claude/hooks/bkit-guardrails.cjs": "addcbcb5be29e4a60f88fc12053629bdeeec46b9b8f6878e3673c09445e6ff6a",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "ea84bfe4499bc2e5348476ae6b8f82cb3e2957b75fd94859b93ff8667c12049d",
-    ".codex/hooks/bkit-guardrails.cjs": "b046c732f1b067b5bea859702663368b10f59ca284d2d72378c9818f989167a6",
+    ".codex/hooks/bkit-guardrails.cjs": "def0afc822749f4de6df960cb72312be27dd0e3cf18edccd19b0adfe4bc7bbcc",
     ".cursor/hooks/bkit-gateguard.cjs": "afe98fc5081fc44d7a8d0ea04d52d5fbf55f26fcd4e154676b881ca1057b3df8",
-    ".cursor/hooks/bkit-guardrails.cjs": "f9c3ed917e43a709eff0a0b078d8de4799a30e40dfb434f300870819ab8acd29",
+    ".cursor/hooks/bkit-guardrails.cjs": "10e614ae26a7c212f11a43118967b60c7c13cfd36d7e6fa9b4a8d355a491ed6b",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "a08c31417eed59bf2a8150d87b5ef4654f8055e57394e646d7d64b759b8ab6fa",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
diff --git a/.claude/hooks/bkit-guardrails.cjs b/.claude/hooks/bkit-guardrails.cjs
index df68837c2..9c2d37715 100644
--- a/.claude/hooks/bkit-guardrails.cjs
+++ b/.claude/hooks/bkit-guardrails.cjs
@@ -448,7 +448,27 @@ function shellEditContext(notice, edits, ctx, sessionId, agentId, budget, outsid
 // one source). Needs `fs` and `path` in scope; the host's own code above declares them.
 
 /** Wrappers that precede the real command; skipped when finding a command's program. */
-const CMD_WRAPPERS = new Set(["sudo", "env", "time", "nohup", "nice", "command", "exec", "xargs"]);
+const CMD_WRAPPERS = new Set([
+  "sudo",
+  "env",
+  "time",
+  "nohup",
+  "nice",
+  "command",
+  "exec",
+  "xargs",
+  "timeout",
+]);
+
+/** Short options of each wrapper that take the next word as their argument. */
+const WRAPPER_OPTION_ARGS = {
+  xargs: new Set(["-I", "-n", "-P", "-L", "-s", "-d", "-E", "-a", "-J"]),
+  sudo: new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U", "-r", "-t"]),
+  nice: new Set(["-n"]),
+  env: new Set(["-u", "-C", "-S"]),
+  timeout: new Set(["-k", "-s"]),
+  exec: new Set(["-a"]),
+};
 
 /** Split a command line into pipeline / list segments. */
 function shellSegments(cmd) {
@@ -600,6 +620,7 @@ function newEvidence(ctx) {
     limit: null,
     halted: false,
     commands: 0,
+    produced: new Map(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -735,6 +756,7 @@ function lexShell(text, st, depth) {
       else if (r.op === "<") cmd.stdinFile = word.t;
       else if (r.op === "<<<") cmd.hereString = word.t;
       else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
+      else if (r.op === ">" && r.dup && !/^(\d+|-)$/.test(word.t)) cmd.redirects.push(word.t);
       return;
     }
     cmd.words.push(word.t);
@@ -885,7 +907,7 @@ function lexShell(text, st, depth) {
         i++;
       } else if (text[i + 1] === ">") {
         pushWord();
-        pending = { op: ">", ignore: true };
+        pending = { op: ">", ignore: false };
         i += text[i + 2] === ">" ? 2 : 1;
       } else {
         endCommand(false);
@@ -907,18 +929,22 @@ function lexShell(text, st, depth) {
     }
     if (ch === ">" || ch === "<") {
       let fd = false;
+      let stdoutFd = false;
       if (cur.started && cur.digits && !cur.quoted) {
         fd = true;
+        stdoutFd = ch === ">" && cur.t === "1";
         cur = newLexWord();
       } else pushWord();
       let op = ch;
       let strip = false;
-      let ignore = fd;
+      let ignore = fd && !stdoutFd;
+      let dup = false;
       let j = i + 1;
       if (ch === ">") {
         if (text[j] === ">" || text[j] === "|") j++;
         else if (text[j] === "&") {
           ignore = true;
+          dup = !fd || stdoutFd;
           j++;
         }
       } else if (text[j] === "<") {
@@ -941,7 +967,7 @@ function lexShell(text, st, depth) {
         j++;
       }
       i = j - 1;
-      pending = { op, strip, ignore };
+      pending = { op, strip, ignore, dup };
       continue;
     }
     if (!cur.started && ch === "~") cur.dyn = true;
@@ -979,8 +1005,17 @@ function stripCommandPrefix(words) {
       CMD_WRAPPERS.has(words[i]) ||
       KEYWORD_PREFIX.has(words[i]))
   ) {
-    if (words[i] === "xargs") viaXargs = true;
+    const wrapper = words[i];
+    if (wrapper === "xargs") viaXargs = true;
     i++;
+    if (!CMD_WRAPPERS.has(wrapper)) continue;
+    const withArg = WRAPPER_OPTION_ARGS[wrapper];
+    while (i < words.length && words[i].startsWith("-") && words[i].length > 1) {
+      const opt = words[i++];
+      if (opt === "--") break;
+      if (withArg && withArg.has(opt)) i++;
+    }
+    if (wrapper === "timeout" && i < words.length) i++;
   }
   return { words: words.slice(i), viaXargs };
 }
@@ -1125,10 +1160,20 @@ function evalCommand(cmd, st, depth, cwd) {
         st.uncertain.add("unresolved-target");
       }
     } else if (!target.startsWith("&")) addEvidenceTarget(st, target, cwd, false);
+    if (!cmd.dyn.has(target) && !target.startsWith("&")) {
+      const sole = cmd.words.length === 1 && cmd.words[0].replace(/^.*\//, "") === "cat";
+      markProduced(
+        st,
+        target,
+        cwd,
+        sole && cmd.heredoc && cmd.heredoc.quoted ? cmd.heredoc.body : null,
+      );
+    }
   }
   if (words.length === 0) return cwd;
   const program = words[0].replace(/^.*\//, "");
   const args = words.slice(1);
+  if (viaXargs) cmd.dyn.add("{}");
   const inPlaceTargets = (files) => {
     for (const f of files) addWordTarget(st, cmd, f, cwd, true);
     if (viaXargs) st.uncertain.add("unknown-stdin");
@@ -1145,7 +1190,10 @@ function evalCommand(cmd, st, depth, cwd) {
     case "popd":
       return null;
     case "tee":
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      for (const f of operands(args)) {
+        addWordTarget(st, cmd, f, cwd, false);
+        if (!cmd.dyn.has(f)) markProduced(st, f, cwd, null);
+      }
       return cwd;
     case "sed": {
       const files = sedFiles(args);
@@ -1186,11 +1234,25 @@ function evalCommand(cmd, st, depth, cwd) {
     case "dash":
     case "ksh": {
       const c = args.findIndex((w) => /^-[a-z]*c$/.test(w));
-      if (c < 0 || args[c + 1] === undefined) return cwd;
-      const script = args[c + 1];
-      if (cmd.dyn.has(script)) {
-        st.uncertain.add("unknown-script-effect");
-        return cwd;
+      let script = null;
+      if (c >= 0 && args[c + 1] !== undefined) {
+        script = args[c + 1];
+        if (cmd.dyn.has(script)) {
+          st.uncertain.add("unknown-script-effect");
+          return cwd;
+        }
+      } else {
+        const file = operands(args)[0];
+        if (file !== undefined) {
+          if (cmd.dyn.has(file)) {
+            st.uncertain.add("unavailable-source");
+            return cwd;
+          }
+          script = readBoundedSource(st, file, cwd);
+        } else if (cmd.heredoc || cmd.hereString !== null || cmd.stdinFile || cmd.piped) {
+          script = knownStdin(cmd, st, cwd);
+        }
+        if (script === null) return cwd;
       }
       if (depth + 1 > EVIDENCE_LIMITS.depth) {
         evidenceLimit(st, "depth");
@@ -1199,6 +1261,18 @@ function evalCommand(cmd, st, depth, cwd) {
       evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
       return cwd;
     }
+    case "find": {
+      const start = args.findIndex((w) => /^-(exec|execdir|ok|okdir)$/.test(w));
+      if (start < 0) return cwd;
+      let end = start + 1;
+      while (end < args.length && args[end] !== ";" && args[end] !== "+") end++;
+      const sub = args.slice(start + 1, end);
+      if (sub.length === 0) return cwd;
+      const dyn = new Set(cmd.dyn);
+      dyn.add("{}");
+      evalCommand({ ...cmd, words: sub, dyn, redirects: [] }, st, depth, cwd);
+      return cwd;
+    }
     case "git":
       if (args[0] === "apply") evalPatch(cmd, st, "git", args.slice(1), cwd);
       return cwd;
@@ -1212,7 +1286,13 @@ function evalCommand(cmd, st, depth, cwd) {
       evalInterpreter(cmd, st, program.startsWith("python") ? "python" : "js", args, cwd);
       return cwd;
     default:
-      if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
+      if (/\//.test(words[0]) && /\.(sh|bash|zsh)$/.test(words[0])) {
+        const script = readBoundedSource(st, words[0], cwd);
+        if (script !== null) {
+          if (depth + 1 > EVIDENCE_LIMITS.depth) evidenceLimit(st, "depth");
+          else evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
+        }
+      } else if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
         evalInterpreter(
           cmd,
           st,
@@ -1227,12 +1307,25 @@ function evalCommand(cmd, st, depth, cwd) {
 
 // --- Bounded source reads ----------------------------------------------------
 
+/** Remember a file an earlier command of the line writes, with its body when it is literal. */
+function markProduced(st, file, cwd, body) {
+  if (cwd === null && !path.isAbsolute(file)) return;
+  st.produced.set(path.resolve(cwd === null ? path.sep : cwd, file), body);
+}
+
 /** Text of a directly named regular file, or null with uncertainty / a limit recorded. */
 function readBoundedSource(st, file, cwd) {
   if (cwd === null && !path.isAbsolute(file)) {
     st.uncertain.add("unresolved-directory");
     return null;
   }
+  // A file an earlier command of the same line writes is read from that command, not disk.
+  const made = path.resolve(cwd === null ? path.sep : cwd, file);
+  if (st.produced.has(made)) {
+    const body = st.produced.get(made);
+    if (body === null) st.uncertain.add("unknown-script-effect");
+    return body;
+  }
   const max = EVIDENCE_LIMITS.sourceBytes;
   try {
     const abs = path.resolve(cwd === null ? path.sep : cwd, file);
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index 4cf966b92..1165a9954 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -450,7 +450,27 @@ function shellEditContext(notice, edits, ctx, sessionId, agentId, budget, outsid
 // one source). Needs `fs` and `path` in scope; the host's own code above declares them.
 
 /** Wrappers that precede the real command; skipped when finding a command's program. */
-const CMD_WRAPPERS = new Set(["sudo", "env", "time", "nohup", "nice", "command", "exec", "xargs"]);
+const CMD_WRAPPERS = new Set([
+  "sudo",
+  "env",
+  "time",
+  "nohup",
+  "nice",
+  "command",
+  "exec",
+  "xargs",
+  "timeout",
+]);
+
+/** Short options of each wrapper that take the next word as their argument. */
+const WRAPPER_OPTION_ARGS = {
+  xargs: new Set(["-I", "-n", "-P", "-L", "-s", "-d", "-E", "-a", "-J"]),
+  sudo: new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U", "-r", "-t"]),
+  nice: new Set(["-n"]),
+  env: new Set(["-u", "-C", "-S"]),
+  timeout: new Set(["-k", "-s"]),
+  exec: new Set(["-a"]),
+};
 
 /** Split a command line into pipeline / list segments. */
 function shellSegments(cmd) {
@@ -602,6 +622,7 @@ function newEvidence(ctx) {
     limit: null,
     halted: false,
     commands: 0,
+    produced: new Map(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -737,6 +758,7 @@ function lexShell(text, st, depth) {
       else if (r.op === "<") cmd.stdinFile = word.t;
       else if (r.op === "<<<") cmd.hereString = word.t;
       else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
+      else if (r.op === ">" && r.dup && !/^(\d+|-)$/.test(word.t)) cmd.redirects.push(word.t);
       return;
     }
     cmd.words.push(word.t);
@@ -887,7 +909,7 @@ function lexShell(text, st, depth) {
         i++;
       } else if (text[i + 1] === ">") {
         pushWord();
-        pending = { op: ">", ignore: true };
+        pending = { op: ">", ignore: false };
         i += text[i + 2] === ">" ? 2 : 1;
       } else {
         endCommand(false);
@@ -909,18 +931,22 @@ function lexShell(text, st, depth) {
     }
     if (ch === ">" || ch === "<") {
       let fd = false;
+      let stdoutFd = false;
       if (cur.started && cur.digits && !cur.quoted) {
         fd = true;
+        stdoutFd = ch === ">" && cur.t === "1";
         cur = newLexWord();
       } else pushWord();
       let op = ch;
       let strip = false;
-      let ignore = fd;
+      let ignore = fd && !stdoutFd;
+      let dup = false;
       let j = i + 1;
       if (ch === ">") {
         if (text[j] === ">" || text[j] === "|") j++;
         else if (text[j] === "&") {
           ignore = true;
+          dup = !fd || stdoutFd;
           j++;
         }
       } else if (text[j] === "<") {
@@ -943,7 +969,7 @@ function lexShell(text, st, depth) {
         j++;
       }
       i = j - 1;
-      pending = { op, strip, ignore };
+      pending = { op, strip, ignore, dup };
       continue;
     }
     if (!cur.started && ch === "~") cur.dyn = true;
@@ -981,8 +1007,17 @@ function stripCommandPrefix(words) {
       CMD_WRAPPERS.has(words[i]) ||
       KEYWORD_PREFIX.has(words[i]))
   ) {
-    if (words[i] === "xargs") viaXargs = true;
+    const wrapper = words[i];
+    if (wrapper === "xargs") viaXargs = true;
     i++;
+    if (!CMD_WRAPPERS.has(wrapper)) continue;
+    const withArg = WRAPPER_OPTION_ARGS[wrapper];
+    while (i < words.length && words[i].startsWith("-") && words[i].length > 1) {
+      const opt = words[i++];
+      if (opt === "--") break;
+      if (withArg && withArg.has(opt)) i++;
+    }
+    if (wrapper === "timeout" && i < words.length) i++;
   }
   return { words: words.slice(i), viaXargs };
 }
@@ -1127,10 +1162,20 @@ function evalCommand(cmd, st, depth, cwd) {
         st.uncertain.add("unresolved-target");
       }
     } else if (!target.startsWith("&")) addEvidenceTarget(st, target, cwd, false);
+    if (!cmd.dyn.has(target) && !target.startsWith("&")) {
+      const sole = cmd.words.length === 1 && cmd.words[0].replace(/^.*\//, "") === "cat";
+      markProduced(
+        st,
+        target,
+        cwd,
+        sole && cmd.heredoc && cmd.heredoc.quoted ? cmd.heredoc.body : null,
+      );
+    }
   }
   if (words.length === 0) return cwd;
   const program = words[0].replace(/^.*\//, "");
   const args = words.slice(1);
+  if (viaXargs) cmd.dyn.add("{}");
   const inPlaceTargets = (files) => {
     for (const f of files) addWordTarget(st, cmd, f, cwd, true);
     if (viaXargs) st.uncertain.add("unknown-stdin");
@@ -1147,7 +1192,10 @@ function evalCommand(cmd, st, depth, cwd) {
     case "popd":
       return null;
     case "tee":
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      for (const f of operands(args)) {
+        addWordTarget(st, cmd, f, cwd, false);
+        if (!cmd.dyn.has(f)) markProduced(st, f, cwd, null);
+      }
       return cwd;
     case "sed": {
       const files = sedFiles(args);
@@ -1188,11 +1236,25 @@ function evalCommand(cmd, st, depth, cwd) {
     case "dash":
     case "ksh": {
       const c = args.findIndex((w) => /^-[a-z]*c$/.test(w));
-      if (c < 0 || args[c + 1] === undefined) return cwd;
-      const script = args[c + 1];
-      if (cmd.dyn.has(script)) {
-        st.uncertain.add("unknown-script-effect");
-        return cwd;
+      let script = null;
+      if (c >= 0 && args[c + 1] !== undefined) {
+        script = args[c + 1];
+        if (cmd.dyn.has(script)) {
+          st.uncertain.add("unknown-script-effect");
+          return cwd;
+        }
+      } else {
+        const file = operands(args)[0];
+        if (file !== undefined) {
+          if (cmd.dyn.has(file)) {
+            st.uncertain.add("unavailable-source");
+            return cwd;
+          }
+          script = readBoundedSource(st, file, cwd);
+        } else if (cmd.heredoc || cmd.hereString !== null || cmd.stdinFile || cmd.piped) {
+          script = knownStdin(cmd, st, cwd);
+        }
+        if (script === null) return cwd;
       }
       if (depth + 1 > EVIDENCE_LIMITS.depth) {
         evidenceLimit(st, "depth");
@@ -1201,6 +1263,18 @@ function evalCommand(cmd, st, depth, cwd) {
       evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
       return cwd;
     }
+    case "find": {
+      const start = args.findIndex((w) => /^-(exec|execdir|ok|okdir)$/.test(w));
+      if (start < 0) return cwd;
+      let end = start + 1;
+      while (end < args.length && args[end] !== ";" && args[end] !== "+") end++;
+      const sub = args.slice(start + 1, end);
+      if (sub.length === 0) return cwd;
+      const dyn = new Set(cmd.dyn);
+      dyn.add("{}");
+      evalCommand({ ...cmd, words: sub, dyn, redirects: [] }, st, depth, cwd);
+      return cwd;
+    }
     case "git":
       if (args[0] === "apply") evalPatch(cmd, st, "git", args.slice(1), cwd);
       return cwd;
@@ -1214,7 +1288,13 @@ function evalCommand(cmd, st, depth, cwd) {
       evalInterpreter(cmd, st, program.startsWith("python") ? "python" : "js", args, cwd);
       return cwd;
     default:
-      if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
+      if (/\//.test(words[0]) && /\.(sh|bash|zsh)$/.test(words[0])) {
+        const script = readBoundedSource(st, words[0], cwd);
+        if (script !== null) {
+          if (depth + 1 > EVIDENCE_LIMITS.depth) evidenceLimit(st, "depth");
+          else evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
+        }
+      } else if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
         evalInterpreter(
           cmd,
           st,
@@ -1229,12 +1309,25 @@ function evalCommand(cmd, st, depth, cwd) {
 
 // --- Bounded source reads ----------------------------------------------------
 
+/** Remember a file an earlier command of the line writes, with its body when it is literal. */
+function markProduced(st, file, cwd, body) {
+  if (cwd === null && !path.isAbsolute(file)) return;
+  st.produced.set(path.resolve(cwd === null ? path.sep : cwd, file), body);
+}
+
 /** Text of a directly named regular file, or null with uncertainty / a limit recorded. */
 function readBoundedSource(st, file, cwd) {
   if (cwd === null && !path.isAbsolute(file)) {
     st.uncertain.add("unresolved-directory");
     return null;
   }
+  // A file an earlier command of the same line writes is read from that command, not disk.
+  const made = path.resolve(cwd === null ? path.sep : cwd, file);
+  if (st.produced.has(made)) {
+    const body = st.produced.get(made);
+    if (body === null) st.uncertain.add("unknown-script-effect");
+    return body;
+  }
   const max = EVIDENCE_LIMITS.sourceBytes;
   try {
     const abs = path.resolve(cwd === null ? path.sep : cwd, file);
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index d654bcc58..8830f3b13 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -442,7 +442,27 @@ function shellEditContext(notice, edits, ctx, sessionId, agentId, budget, outsid
 // one source). Needs `fs` and `path` in scope; the host's own code above declares them.
 
 /** Wrappers that precede the real command; skipped when finding a command's program. */
-const CMD_WRAPPERS = new Set(["sudo", "env", "time", "nohup", "nice", "command", "exec", "xargs"]);
+const CMD_WRAPPERS = new Set([
+  "sudo",
+  "env",
+  "time",
+  "nohup",
+  "nice",
+  "command",
+  "exec",
+  "xargs",
+  "timeout",
+]);
+
+/** Short options of each wrapper that take the next word as their argument. */
+const WRAPPER_OPTION_ARGS = {
+  xargs: new Set(["-I", "-n", "-P", "-L", "-s", "-d", "-E", "-a", "-J"]),
+  sudo: new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U", "-r", "-t"]),
+  nice: new Set(["-n"]),
+  env: new Set(["-u", "-C", "-S"]),
+  timeout: new Set(["-k", "-s"]),
+  exec: new Set(["-a"]),
+};
 
 /** Split a command line into pipeline / list segments. */
 function shellSegments(cmd) {
@@ -594,6 +614,7 @@ function newEvidence(ctx) {
     limit: null,
     halted: false,
     commands: 0,
+    produced: new Map(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -729,6 +750,7 @@ function lexShell(text, st, depth) {
       else if (r.op === "<") cmd.stdinFile = word.t;
       else if (r.op === "<<<") cmd.hereString = word.t;
       else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
+      else if (r.op === ">" && r.dup && !/^(\d+|-)$/.test(word.t)) cmd.redirects.push(word.t);
       return;
     }
     cmd.words.push(word.t);
@@ -879,7 +901,7 @@ function lexShell(text, st, depth) {
         i++;
       } else if (text[i + 1] === ">") {
         pushWord();
-        pending = { op: ">", ignore: true };
+        pending = { op: ">", ignore: false };
         i += text[i + 2] === ">" ? 2 : 1;
       } else {
         endCommand(false);
@@ -901,18 +923,22 @@ function lexShell(text, st, depth) {
     }
     if (ch === ">" || ch === "<") {
       let fd = false;
+      let stdoutFd = false;
       if (cur.started && cur.digits && !cur.quoted) {
         fd = true;
+        stdoutFd = ch === ">" && cur.t === "1";
         cur = newLexWord();
       } else pushWord();
       let op = ch;
       let strip = false;
-      let ignore = fd;
+      let ignore = fd && !stdoutFd;
+      let dup = false;
       let j = i + 1;
       if (ch === ">") {
         if (text[j] === ">" || text[j] === "|") j++;
         else if (text[j] === "&") {
           ignore = true;
+          dup = !fd || stdoutFd;
           j++;
         }
       } else if (text[j] === "<") {
@@ -935,7 +961,7 @@ function lexShell(text, st, depth) {
         j++;
       }
       i = j - 1;
-      pending = { op, strip, ignore };
+      pending = { op, strip, ignore, dup };
       continue;
     }
     if (!cur.started && ch === "~") cur.dyn = true;
@@ -973,8 +999,17 @@ function stripCommandPrefix(words) {
       CMD_WRAPPERS.has(words[i]) ||
       KEYWORD_PREFIX.has(words[i]))
   ) {
-    if (words[i] === "xargs") viaXargs = true;
+    const wrapper = words[i];
+    if (wrapper === "xargs") viaXargs = true;
     i++;
+    if (!CMD_WRAPPERS.has(wrapper)) continue;
+    const withArg = WRAPPER_OPTION_ARGS[wrapper];
+    while (i < words.length && words[i].startsWith("-") && words[i].length > 1) {
+      const opt = words[i++];
+      if (opt === "--") break;
+      if (withArg && withArg.has(opt)) i++;
+    }
+    if (wrapper === "timeout" && i < words.length) i++;
   }
   return { words: words.slice(i), viaXargs };
 }
@@ -1119,10 +1154,20 @@ function evalCommand(cmd, st, depth, cwd) {
         st.uncertain.add("unresolved-target");
       }
     } else if (!target.startsWith("&")) addEvidenceTarget(st, target, cwd, false);
+    if (!cmd.dyn.has(target) && !target.startsWith("&")) {
+      const sole = cmd.words.length === 1 && cmd.words[0].replace(/^.*\//, "") === "cat";
+      markProduced(
+        st,
+        target,
+        cwd,
+        sole && cmd.heredoc && cmd.heredoc.quoted ? cmd.heredoc.body : null,
+      );
+    }
   }
   if (words.length === 0) return cwd;
   const program = words[0].replace(/^.*\//, "");
   const args = words.slice(1);
+  if (viaXargs) cmd.dyn.add("{}");
   const inPlaceTargets = (files) => {
     for (const f of files) addWordTarget(st, cmd, f, cwd, true);
     if (viaXargs) st.uncertain.add("unknown-stdin");
@@ -1139,7 +1184,10 @@ function evalCommand(cmd, st, depth, cwd) {
     case "popd":
       return null;
     case "tee":
-      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
+      for (const f of operands(args)) {
+        addWordTarget(st, cmd, f, cwd, false);
+        if (!cmd.dyn.has(f)) markProduced(st, f, cwd, null);
+      }
       return cwd;
     case "sed": {
       const files = sedFiles(args);
@@ -1180,11 +1228,25 @@ function evalCommand(cmd, st, depth, cwd) {
     case "dash":
     case "ksh": {
       const c = args.findIndex((w) => /^-[a-z]*c$/.test(w));
-      if (c < 0 || args[c + 1] === undefined) return cwd;
-      const script = args[c + 1];
-      if (cmd.dyn.has(script)) {
-        st.uncertain.add("unknown-script-effect");
-        return cwd;
+      let script = null;
+      if (c >= 0 && args[c + 1] !== undefined) {
+        script = args[c + 1];
+        if (cmd.dyn.has(script)) {
+          st.uncertain.add("unknown-script-effect");
+          return cwd;
+        }
+      } else {
+        const file = operands(args)[0];
+        if (file !== undefined) {
+          if (cmd.dyn.has(file)) {
+            st.uncertain.add("unavailable-source");
+            return cwd;
+          }
+          script = readBoundedSource(st, file, cwd);
+        } else if (cmd.heredoc || cmd.hereString !== null || cmd.stdinFile || cmd.piped) {
+          script = knownStdin(cmd, st, cwd);
+        }
+        if (script === null) return cwd;
       }
       if (depth + 1 > EVIDENCE_LIMITS.depth) {
         evidenceLimit(st, "depth");
@@ -1193,6 +1255,18 @@ function evalCommand(cmd, st, depth, cwd) {
       evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
       return cwd;
     }
+    case "find": {
+      const start = args.findIndex((w) => /^-(exec|execdir|ok|okdir)$/.test(w));
+      if (start < 0) return cwd;
+      let end = start + 1;
+      while (end < args.length && args[end] !== ";" && args[end] !== "+") end++;
+      const sub = args.slice(start + 1, end);
+      if (sub.length === 0) return cwd;
+      const dyn = new Set(cmd.dyn);
+      dyn.add("{}");
+      evalCommand({ ...cmd, words: sub, dyn, redirects: [] }, st, depth, cwd);
+      return cwd;
+    }
     case "git":
       if (args[0] === "apply") evalPatch(cmd, st, "git", args.slice(1), cwd);
       return cwd;
@@ -1206,7 +1280,13 @@ function evalCommand(cmd, st, depth, cwd) {
       evalInterpreter(cmd, st, program.startsWith("python") ? "python" : "js", args, cwd);
       return cwd;
     default:
-      if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
+      if (/\//.test(words[0]) && /\.(sh|bash|zsh)$/.test(words[0])) {
+        const script = readBoundedSource(st, words[0], cwd);
+        if (script !== null) {
+          if (depth + 1 > EVIDENCE_LIMITS.depth) evidenceLimit(st, "depth");
+          else evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
+        }
+      } else if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
         evalInterpreter(
           cmd,
           st,
@@ -1221,12 +1301,25 @@ function evalCommand(cmd, st, depth, cwd) {
 
 // --- Bounded source reads ----------------------------------------------------
 
+/** Remember a file an earlier command of the line writes, with its body when it is literal. */
+function markProduced(st, file, cwd, body) {
+  if (cwd === null && !path.isAbsolute(file)) return;
+  st.produced.set(path.resolve(cwd === null ? path.sep : cwd, file), body);
+}
+
 /** Text of a directly named regular file, or null with uncertainty / a limit recorded. */
 function readBoundedSource(st, file, cwd) {
   if (cwd === null && !path.isAbsolute(file)) {
     st.uncertain.add("unresolved-directory");
     return null;
   }
+  // A file an earlier command of the same line writes is read from that command, not disk.
+  const made = path.resolve(cwd === null ? path.sep : cwd, file);
+  if (st.produced.has(made)) {
+    const body = st.produced.get(made);
+    if (body === null) st.uncertain.add("unknown-script-effect");
+    return body;
+  }
   const max = EVIDENCE_LIMITS.sourceBytes;
   try {
     const abs = path.resolve(cwd === null ? path.sep : cwd, file);
