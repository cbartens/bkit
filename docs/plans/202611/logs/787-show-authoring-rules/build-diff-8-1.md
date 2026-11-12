diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index 720a00a84..71f1f672a 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -1823,7 +1823,7 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
     source = knownStdin(cmd, st, cwd);
   }
   if (source === null) return;
-  const result = lang === "python" ? analyzePython(source) : analyzeJs(source);
+  const result = lang === "python" ? analyzePython(source, st) : analyzeJs(source, st);
   for (const t of result.writes) addEvidenceTarget(st, t, cwd, true);
   if (result.unknown) st.uncertain.add("unknown-script-effect");
 }
@@ -1832,11 +1832,12 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
  * Tokens of a Python or JS source: `{ k: "id"|"str"|"dstr"|"num"|"p"|"nl", v }`, or null
  * when the text cannot be tokenized. `dstr` is a string that is not a plain literal.
  */
-function tokenizeSource(src, lang) {
+function tokenizeSource(src, lang, st) {
   const out = [];
   let depth = 0;
   const n = src.length;
   for (let i = 0; i < n; i++) {
+    if (st && i % 512 === 0 && evidenceExpired(st)) return null;
     const ch = src[i];
     if (ch === "\n") {
       if (depth === 0) out.push({ k: "nl", v: "\n" });
@@ -1916,6 +1917,7 @@ function tokenizeSource(src, lang) {
     }
     return null;
   }
+  for (let k = 0; k < out.length; k++) out[k].i = k;
   return out;
 }
 
@@ -2081,13 +2083,14 @@ const PY_OS_OK = new Set([
 ]);
 
 /** Python source effects: literal write targets plus whether anything is unrecognized. */
-function analyzePython(src) {
-  const tokens = tokenizeSource(src, "python");
+function analyzePython(src, st) {
+  const tokens = tokenizeSource(src, "python", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k === "id" && t.v === "open" && tokens[i - 1]?.v !== ".") {
       const ok =
@@ -2115,7 +2118,9 @@ function analyzePython(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     if (first.k === "id" && (first.v === "import" || first.v === "from")) {
       const names = [];
@@ -2170,12 +2175,11 @@ function analyzePython(src) {
         const viaPath = recv?.v === "path" && stmt[j - 3]?.v === ".";
         if (recv?.v === "os" && bound.has("os")) {
           if (!PY_OS_OK.has(t.v)) unknown = true;
-        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(tokens.indexOf(t)))
-          unknown = true;
+        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(t.i)) unknown = true;
         continue;
       }
       if (t.v === "open") {
-        if (!recognized.has(tokens.indexOf(t))) unknown = true;
+        if (!recognized.has(t.i)) unknown = true;
         continue;
       }
       if (PY_EXPR_WORDS.has(t.v) || PY_BUILTINS.has(t.v) || bound.has(t.v)) continue;
@@ -2314,13 +2318,14 @@ const JS_WRITE_DEST = new Set(["copyFileSync", "copyFile"]);
 const JS_WRITE_TWO = new Set(["renameSync", "rename"]);
 
 /** JavaScript source effects, on the same terms as `analyzePython`. */
-function analyzeJs(src) {
-  const tokens = tokenizeSource(src, "js");
+function analyzeJs(src, st) {
+  const tokens = tokenizeSource(src, "js", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k !== "id" || tokens[i + 1]?.v !== "(") continue;
     const arg1 = tokens[i + 2];
@@ -2347,7 +2352,9 @@ function analyzeJs(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     let start = 0;
     if (first.k === "id" && ["const", "let", "var"].includes(first.v)) {
@@ -2368,7 +2375,7 @@ function analyzeJs(src) {
         continue;
       }
       if (t.k !== "id") continue;
-      const idx = tokens.indexOf(t);
+      const idx = t.i;
       if (stmt[j - 1]?.v === ".") {
         if (!JS_ATTR_OK.has(t.v) && !recognized.has(idx)) unknown = true;
         continue;
diff --git a/.bkit/core/.cursor/hooks/bkit-guardrails.cjs b/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
index 4fe468580..061fb5caf 100644
--- a/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.cursor/hooks/bkit-guardrails.cjs
@@ -81,11 +81,23 @@ function decideShell(cmd, dirs, ctx, session) {
         "bkit Cursor guardrails: confirm a shell read of an env, secrets or private-key file.",
         `Reading ${v.path} through the shell may expose secrets.\nPrefer direnv or documented non-secret examples.\nCommand: ${c}`,
       );
-    case "fetch":
+    case "fetch": {
+      const fetchLine = `Command requires confirmation: ${c}`;
       return ask(
         "bkit Cursor guardrails: confirm an outbound curl or wget to a host that is not on the network allowlist.",
-        `Command requires confirmation: ${c}`,
+        v.edits
+          ? shellEditContext(
+              shellEditAdvisory(v.edits),
+              v.edits,
+              ctx,
+              session,
+              undefined,
+              ADVICE_BUDGETS.cursor,
+              fetchLine,
+            )
+          : fetchLine,
       );
+    }
     default:
       // Shell-as-edit-channel: ADVISORY, never a block — allow plus an `agent_message`
       // naming the edited paths.
diff --git a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
index 0dacdcc9a..2d877dc6c 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
@@ -686,6 +686,24 @@ describe("cursor guardrails.cjs — shell edit evidence", () => {
     }
   });
 
+  it("keeps edit advice beside an off-list fetch", () => {
+    const dir = workDir("fetchedit");
+    const r = advise(
+      "curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ src/fetch-edit.ts",
+      dir,
+    );
+    expect(r.permission).toBe("ask");
+    expect(r.text).toContain("edits files through the shell");
+    expect(r.text).toContain("src/fetch-edit.ts");
+  });
+
+  it("analyses dense script sources in linear time", () => {
+    const dir = workDir("dense");
+    const r = advise("node -e '" + "a;".repeat(125 * 1024) + "'", dir);
+    expect(r.permission).toBe("allow");
+    expect(r.ms).toBeLessThan(1000);
+  });
+
   it("marks scripts run by unanalysed interpreters as uncertain", () => {
     const dir = workDir("otherinterp");
     for (const command of ["ruby fix.rb", "perl fix.pl", "npx tsx gen.ts"]) {
diff --git a/.bkit/core/hooks/guardrails-shell.js b/.bkit/core/hooks/guardrails-shell.js
index 674e8a1b3..93c91aab3 100644
--- a/.bkit/core/hooks/guardrails-shell.js
+++ b/.bkit/core/hooks/guardrails-shell.js
@@ -1372,7 +1372,7 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
     source = knownStdin(cmd, st, cwd);
   }
   if (source === null) return;
-  const result = lang === "python" ? analyzePython(source) : analyzeJs(source);
+  const result = lang === "python" ? analyzePython(source, st) : analyzeJs(source, st);
   for (const t of result.writes) addEvidenceTarget(st, t, cwd, true);
   if (result.unknown) st.uncertain.add("unknown-script-effect");
 }
@@ -1381,11 +1381,12 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
  * Tokens of a Python or JS source: `{ k: "id"|"str"|"dstr"|"num"|"p"|"nl", v }`, or null
  * when the text cannot be tokenized. `dstr` is a string that is not a plain literal.
  */
-function tokenizeSource(src, lang) {
+function tokenizeSource(src, lang, st) {
   const out = [];
   let depth = 0;
   const n = src.length;
   for (let i = 0; i < n; i++) {
+    if (st && i % 512 === 0 && evidenceExpired(st)) return null;
     const ch = src[i];
     if (ch === "\n") {
       if (depth === 0) out.push({ k: "nl", v: "\n" });
@@ -1465,6 +1466,7 @@ function tokenizeSource(src, lang) {
     }
     return null;
   }
+  for (let k = 0; k < out.length; k++) out[k].i = k;
   return out;
 }
 
@@ -1630,13 +1632,14 @@ const PY_OS_OK = new Set([
 ]);
 
 /** Python source effects: literal write targets plus whether anything is unrecognized. */
-function analyzePython(src) {
-  const tokens = tokenizeSource(src, "python");
+function analyzePython(src, st) {
+  const tokens = tokenizeSource(src, "python", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k === "id" && t.v === "open" && tokens[i - 1]?.v !== ".") {
       const ok =
@@ -1664,7 +1667,9 @@ function analyzePython(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     if (first.k === "id" && (first.v === "import" || first.v === "from")) {
       const names = [];
@@ -1719,12 +1724,11 @@ function analyzePython(src) {
         const viaPath = recv?.v === "path" && stmt[j - 3]?.v === ".";
         if (recv?.v === "os" && bound.has("os")) {
           if (!PY_OS_OK.has(t.v)) unknown = true;
-        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(tokens.indexOf(t)))
-          unknown = true;
+        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(t.i)) unknown = true;
         continue;
       }
       if (t.v === "open") {
-        if (!recognized.has(tokens.indexOf(t))) unknown = true;
+        if (!recognized.has(t.i)) unknown = true;
         continue;
       }
       if (PY_EXPR_WORDS.has(t.v) || PY_BUILTINS.has(t.v) || bound.has(t.v)) continue;
@@ -1863,13 +1867,14 @@ const JS_WRITE_DEST = new Set(["copyFileSync", "copyFile"]);
 const JS_WRITE_TWO = new Set(["renameSync", "rename"]);
 
 /** JavaScript source effects, on the same terms as `analyzePython`. */
-function analyzeJs(src) {
-  const tokens = tokenizeSource(src, "js");
+function analyzeJs(src, st) {
+  const tokens = tokenizeSource(src, "js", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k !== "id" || tokens[i + 1]?.v !== "(") continue;
     const arg1 = tokens[i + 2];
@@ -1896,7 +1901,9 @@ function analyzeJs(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     let start = 0;
     if (first.k === "id" && ["const", "let", "var"].includes(first.v)) {
@@ -1917,7 +1924,7 @@ function analyzeJs(src) {
         continue;
       }
       if (t.k !== "id") continue;
-      const idx = tokens.indexOf(t);
+      const idx = t.i;
       if (stmt[j - 1]?.v === ".") {
         if (!JS_ATTR_OK.has(t.v) && !recognized.has(idx)) unknown = true;
         continue;
diff --git a/.bkit/version b/.bkit/version
index d3a14d716..9d59141f1 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -228,12 +228,12 @@
     ".bkit/README.md": "3eab3725aca61c812345c2867a375c71434e4f3482d9961587fb41dd2ede7ae6",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "11ac4050fa9d0a87bf4b7aaddd3849fe76ed1cee1220c6d65e224ce59d867520",
-    ".claude/hooks/bkit-guardrails.cjs": "20e5e35554e7f48be5fe50fb04d86892922574403ce401399b5b7ece0c5cd279",
+    ".claude/hooks/bkit-guardrails.cjs": "b7a412d2cf54d18e9a9e516f4ae7130abd7fa46e0f39b5875a3ec29e708397b2",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "ea84bfe4499bc2e5348476ae6b8f82cb3e2957b75fd94859b93ff8667c12049d",
-    ".codex/hooks/bkit-guardrails.cjs": "12e062d9428e0396256476ea62ffa15bda2e0e5f1620bc35a365f6f8e39db12f",
+    ".codex/hooks/bkit-guardrails.cjs": "fa6e6431ce37485bcf2165d738dcb8b1f025e6f655c577dd0dd1cc7a4e0f5c6f",
     ".cursor/hooks/bkit-gateguard.cjs": "afe98fc5081fc44d7a8d0ea04d52d5fbf55f26fcd4e154676b881ca1057b3df8",
-    ".cursor/hooks/bkit-guardrails.cjs": "53b4877022157f6fcad784780793311c8b8e81d286eb4b1df8db292c1540f9e7",
+    ".cursor/hooks/bkit-guardrails.cjs": "526350b808749cf3cd0152c068620fe4f49245ed4c48d8e8bd3ca20ff28ada1f",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "a08c31417eed59bf2a8150d87b5ef4654f8055e57394e646d7d64b759b8ab6fa",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
diff --git a/.claude/hooks/bkit-guardrails.cjs b/.claude/hooks/bkit-guardrails.cjs
index 87a80707a..355effbea 100644
--- a/.claude/hooks/bkit-guardrails.cjs
+++ b/.claude/hooks/bkit-guardrails.cjs
@@ -1818,7 +1818,7 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
     source = knownStdin(cmd, st, cwd);
   }
   if (source === null) return;
-  const result = lang === "python" ? analyzePython(source) : analyzeJs(source);
+  const result = lang === "python" ? analyzePython(source, st) : analyzeJs(source, st);
   for (const t of result.writes) addEvidenceTarget(st, t, cwd, true);
   if (result.unknown) st.uncertain.add("unknown-script-effect");
 }
@@ -1827,11 +1827,12 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
  * Tokens of a Python or JS source: `{ k: "id"|"str"|"dstr"|"num"|"p"|"nl", v }`, or null
  * when the text cannot be tokenized. `dstr` is a string that is not a plain literal.
  */
-function tokenizeSource(src, lang) {
+function tokenizeSource(src, lang, st) {
   const out = [];
   let depth = 0;
   const n = src.length;
   for (let i = 0; i < n; i++) {
+    if (st && i % 512 === 0 && evidenceExpired(st)) return null;
     const ch = src[i];
     if (ch === "\n") {
       if (depth === 0) out.push({ k: "nl", v: "\n" });
@@ -1911,6 +1912,7 @@ function tokenizeSource(src, lang) {
     }
     return null;
   }
+  for (let k = 0; k < out.length; k++) out[k].i = k;
   return out;
 }
 
@@ -2076,13 +2078,14 @@ const PY_OS_OK = new Set([
 ]);
 
 /** Python source effects: literal write targets plus whether anything is unrecognized. */
-function analyzePython(src) {
-  const tokens = tokenizeSource(src, "python");
+function analyzePython(src, st) {
+  const tokens = tokenizeSource(src, "python", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k === "id" && t.v === "open" && tokens[i - 1]?.v !== ".") {
       const ok =
@@ -2110,7 +2113,9 @@ function analyzePython(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     if (first.k === "id" && (first.v === "import" || first.v === "from")) {
       const names = [];
@@ -2165,12 +2170,11 @@ function analyzePython(src) {
         const viaPath = recv?.v === "path" && stmt[j - 3]?.v === ".";
         if (recv?.v === "os" && bound.has("os")) {
           if (!PY_OS_OK.has(t.v)) unknown = true;
-        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(tokens.indexOf(t)))
-          unknown = true;
+        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(t.i)) unknown = true;
         continue;
       }
       if (t.v === "open") {
-        if (!recognized.has(tokens.indexOf(t))) unknown = true;
+        if (!recognized.has(t.i)) unknown = true;
         continue;
       }
       if (PY_EXPR_WORDS.has(t.v) || PY_BUILTINS.has(t.v) || bound.has(t.v)) continue;
@@ -2309,13 +2313,14 @@ const JS_WRITE_DEST = new Set(["copyFileSync", "copyFile"]);
 const JS_WRITE_TWO = new Set(["renameSync", "rename"]);
 
 /** JavaScript source effects, on the same terms as `analyzePython`. */
-function analyzeJs(src) {
-  const tokens = tokenizeSource(src, "js");
+function analyzeJs(src, st) {
+  const tokens = tokenizeSource(src, "js", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k !== "id" || tokens[i + 1]?.v !== "(") continue;
     const arg1 = tokens[i + 2];
@@ -2342,7 +2347,9 @@ function analyzeJs(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     let start = 0;
     if (first.k === "id" && ["const", "let", "var"].includes(first.v)) {
@@ -2363,7 +2370,7 @@ function analyzeJs(src) {
         continue;
       }
       if (t.k !== "id") continue;
-      const idx = tokens.indexOf(t);
+      const idx = t.i;
       if (stmt[j - 1]?.v === ".") {
         if (!JS_ATTR_OK.has(t.v) && !recognized.has(idx)) unknown = true;
         continue;
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index bd4d6daa7..c6b983168 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -1820,7 +1820,7 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
     source = knownStdin(cmd, st, cwd);
   }
   if (source === null) return;
-  const result = lang === "python" ? analyzePython(source) : analyzeJs(source);
+  const result = lang === "python" ? analyzePython(source, st) : analyzeJs(source, st);
   for (const t of result.writes) addEvidenceTarget(st, t, cwd, true);
   if (result.unknown) st.uncertain.add("unknown-script-effect");
 }
@@ -1829,11 +1829,12 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
  * Tokens of a Python or JS source: `{ k: "id"|"str"|"dstr"|"num"|"p"|"nl", v }`, or null
  * when the text cannot be tokenized. `dstr` is a string that is not a plain literal.
  */
-function tokenizeSource(src, lang) {
+function tokenizeSource(src, lang, st) {
   const out = [];
   let depth = 0;
   const n = src.length;
   for (let i = 0; i < n; i++) {
+    if (st && i % 512 === 0 && evidenceExpired(st)) return null;
     const ch = src[i];
     if (ch === "\n") {
       if (depth === 0) out.push({ k: "nl", v: "\n" });
@@ -1913,6 +1914,7 @@ function tokenizeSource(src, lang) {
     }
     return null;
   }
+  for (let k = 0; k < out.length; k++) out[k].i = k;
   return out;
 }
 
@@ -2078,13 +2080,14 @@ const PY_OS_OK = new Set([
 ]);
 
 /** Python source effects: literal write targets plus whether anything is unrecognized. */
-function analyzePython(src) {
-  const tokens = tokenizeSource(src, "python");
+function analyzePython(src, st) {
+  const tokens = tokenizeSource(src, "python", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k === "id" && t.v === "open" && tokens[i - 1]?.v !== ".") {
       const ok =
@@ -2112,7 +2115,9 @@ function analyzePython(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     if (first.k === "id" && (first.v === "import" || first.v === "from")) {
       const names = [];
@@ -2167,12 +2172,11 @@ function analyzePython(src) {
         const viaPath = recv?.v === "path" && stmt[j - 3]?.v === ".";
         if (recv?.v === "os" && bound.has("os")) {
           if (!PY_OS_OK.has(t.v)) unknown = true;
-        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(tokens.indexOf(t)))
-          unknown = true;
+        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(t.i)) unknown = true;
         continue;
       }
       if (t.v === "open") {
-        if (!recognized.has(tokens.indexOf(t))) unknown = true;
+        if (!recognized.has(t.i)) unknown = true;
         continue;
       }
       if (PY_EXPR_WORDS.has(t.v) || PY_BUILTINS.has(t.v) || bound.has(t.v)) continue;
@@ -2311,13 +2315,14 @@ const JS_WRITE_DEST = new Set(["copyFileSync", "copyFile"]);
 const JS_WRITE_TWO = new Set(["renameSync", "rename"]);
 
 /** JavaScript source effects, on the same terms as `analyzePython`. */
-function analyzeJs(src) {
-  const tokens = tokenizeSource(src, "js");
+function analyzeJs(src, st) {
+  const tokens = tokenizeSource(src, "js", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k !== "id" || tokens[i + 1]?.v !== "(") continue;
     const arg1 = tokens[i + 2];
@@ -2344,7 +2349,9 @@ function analyzeJs(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     let start = 0;
     if (first.k === "id" && ["const", "let", "var"].includes(first.v)) {
@@ -2365,7 +2372,7 @@ function analyzeJs(src) {
         continue;
       }
       if (t.k !== "id") continue;
-      const idx = tokens.indexOf(t);
+      const idx = t.i;
       if (stmt[j - 1]?.v === ".") {
         if (!JS_ATTR_OK.has(t.v) && !recognized.has(idx)) unknown = true;
         continue;
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index b6ddac6c7..735d0db89 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -1812,7 +1812,7 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
     source = knownStdin(cmd, st, cwd);
   }
   if (source === null) return;
-  const result = lang === "python" ? analyzePython(source) : analyzeJs(source);
+  const result = lang === "python" ? analyzePython(source, st) : analyzeJs(source, st);
   for (const t of result.writes) addEvidenceTarget(st, t, cwd, true);
   if (result.unknown) st.uncertain.add("unknown-script-effect");
 }
@@ -1821,11 +1821,12 @@ function evalInterpreter(cmd, st, lang, args, cwd) {
  * Tokens of a Python or JS source: `{ k: "id"|"str"|"dstr"|"num"|"p"|"nl", v }`, or null
  * when the text cannot be tokenized. `dstr` is a string that is not a plain literal.
  */
-function tokenizeSource(src, lang) {
+function tokenizeSource(src, lang, st) {
   const out = [];
   let depth = 0;
   const n = src.length;
   for (let i = 0; i < n; i++) {
+    if (st && i % 512 === 0 && evidenceExpired(st)) return null;
     const ch = src[i];
     if (ch === "\n") {
       if (depth === 0) out.push({ k: "nl", v: "\n" });
@@ -1905,6 +1906,7 @@ function tokenizeSource(src, lang) {
     }
     return null;
   }
+  for (let k = 0; k < out.length; k++) out[k].i = k;
   return out;
 }
 
@@ -2070,13 +2072,14 @@ const PY_OS_OK = new Set([
 ]);
 
 /** Python source effects: literal write targets plus whether anything is unrecognized. */
-function analyzePython(src) {
-  const tokens = tokenizeSource(src, "python");
+function analyzePython(src, st) {
+  const tokens = tokenizeSource(src, "python", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k === "id" && t.v === "open" && tokens[i - 1]?.v !== ".") {
       const ok =
@@ -2104,7 +2107,9 @@ function analyzePython(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     if (first.k === "id" && (first.v === "import" || first.v === "from")) {
       const names = [];
@@ -2159,12 +2164,11 @@ function analyzePython(src) {
         const viaPath = recv?.v === "path" && stmt[j - 3]?.v === ".";
         if (recv?.v === "os" && bound.has("os")) {
           if (!PY_OS_OK.has(t.v)) unknown = true;
-        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(tokens.indexOf(t)))
-          unknown = true;
+        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(t.i)) unknown = true;
         continue;
       }
       if (t.v === "open") {
-        if (!recognized.has(tokens.indexOf(t))) unknown = true;
+        if (!recognized.has(t.i)) unknown = true;
         continue;
       }
       if (PY_EXPR_WORDS.has(t.v) || PY_BUILTINS.has(t.v) || bound.has(t.v)) continue;
@@ -2303,13 +2307,14 @@ const JS_WRITE_DEST = new Set(["copyFileSync", "copyFile"]);
 const JS_WRITE_TWO = new Set(["renameSync", "rename"]);
 
 /** JavaScript source effects, on the same terms as `analyzePython`. */
-function analyzeJs(src) {
-  const tokens = tokenizeSource(src, "js");
+function analyzeJs(src, st) {
+  const tokens = tokenizeSource(src, "js", st);
   if (!tokens) return { writes: [], unknown: true };
   const writes = [];
   const recognized = new Set();
   let unknown = false;
   for (let i = 0; i < tokens.length; i++) {
+    if (i % 512 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const t = tokens[i];
     if (t.k !== "id" || tokens[i + 1]?.v !== "(") continue;
     const arg1 = tokens[i + 2];
@@ -2336,7 +2341,9 @@ function analyzeJs(src) {
     }
   }
   const bound = new Set();
+  let stmtCount = 0;
   for (const stmt of splitStatements(tokens)) {
+    if (++stmtCount % 256 === 0 && st && evidenceExpired(st)) return { writes, unknown: true };
     const first = stmt[0];
     let start = 0;
     if (first.k === "id" && ["const", "let", "var"].includes(first.v)) {
@@ -2357,7 +2364,7 @@ function analyzeJs(src) {
         continue;
       }
       if (t.k !== "id") continue;
-      const idx = tokens.indexOf(t);
+      const idx = t.i;
       if (stmt[j - 1]?.v === ".") {
         if (!JS_ATTR_OK.has(t.v) && !recognized.has(idx)) unknown = true;
         continue;
@@ -2911,11 +2918,23 @@ function decideShell(cmd, dirs, ctx, session) {
         "bkit Cursor guardrails: confirm a shell read of an env, secrets or private-key file.",
         `Reading ${v.path} through the shell may expose secrets.\nPrefer direnv or documented non-secret examples.\nCommand: ${c}`,
       );
-    case "fetch":
+    case "fetch": {
+      const fetchLine = `Command requires confirmation: ${c}`;
       return ask(
         "bkit Cursor guardrails: confirm an outbound curl or wget to a host that is not on the network allowlist.",
-        `Command requires confirmation: ${c}`,
+        v.edits
+          ? shellEditContext(
+              shellEditAdvisory(v.edits),
+              v.edits,
+              ctx,
+              session,
+              undefined,
+              ADVICE_BUDGETS.cursor,
+              fetchLine,
+            )
+          : fetchLine,
       );
+    }
     default:
       // Shell-as-edit-channel: ADVISORY, never a block — allow plus an `agent_message`
       // naming the edited paths.
diff --git a/DETAILS.md b/DETAILS.md
index 28846e52c..68b32166d 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1719 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1720 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>315 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 3bea11a67..5b814f275 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,7 +164,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1719 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1720 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>315 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -332,7 +332,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_summary["summary<br/>21 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>6 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tests["tests<br/>108 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tests["tests<br/>109 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>88 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
@@ -506,6 +506,7 @@ flowchart LR
   n_bkit_core_engine_commands_install_upgrade -->|8| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_workflow_challenge -->|8| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_context -->|8| n_bkit_core_engine_commands_workflow_tests
+  n_bkit_core_engine_commands_workflow_steps -->|8| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_summary -->|8| n_bkit_core_engine_commands_workflow_plans
   n_bkit_core_engine_commands_workflow_workflows -->|8| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_install_modules_antigravity -->|8| n_bkit_core_engine_install_write
@@ -566,7 +567,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_counters -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_plans -->|6| n_bkit_core_engine_commands_workflow_tracker
-  n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_step_table
   n_bkit_core_engine_commands_workflow_tracker -->|6| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_prs
@@ -820,7 +820,7 @@ flowchart LR
   linkStyle 134 stroke:#59636eb3,stroke-width:3px
   linkStyle 135 stroke:#59636eb3,stroke-width:3px
   linkStyle 136 stroke:#59636eb3,stroke-width:3px
-  linkStyle 137 stroke:#59636e80,stroke-width:2px
+  linkStyle 137 stroke:#59636eb3,stroke-width:3px
   linkStyle 138 stroke:#59636e80,stroke-width:2px
   linkStyle 139 stroke:#59636e80,stroke-width:2px
   linkStyle 140 stroke:#59636e80,stroke-width:2px
