diff --git a/.bkit/core/engine/install/modules/core.test.ts b/.bkit/core/engine/install/modules/core.test.ts
index 074f0b3f7..25c670bc1 100644
--- a/.bkit/core/engine/install/modules/core.test.ts
+++ b/.bkit/core/engine/install/modules/core.test.ts
@@ -312,4 +312,17 @@ describe("renameScriptTokens", () => {
       "pnpm --workspace-root bkit:slop:delta",
     );
   });
+
+  it("renameScriptTokens returns a many-flag line in bounded time", () => {
+    const flags = Array.from(
+      { length: 30 },
+      (_, i) => `--${String.fromCharCode(97 + (i % 26))}${i}`,
+    );
+    const line = `pnpm ${flags.join(" ")}`;
+    const start = performance.now();
+    const out = renameScriptTokens(line, renames);
+    const elapsed = performance.now() - start;
+    expect(out).toBe(line);
+    expect(elapsed).toBeLessThan(500);
+  });
 });
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 15b07c1d7..c4161b051 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -821,7 +821,7 @@ export function renameScriptTokens(
   const names = Object.keys(renames).sort((a, b) => b.length - a.length);
   if (names.length === 0) return text;
   const re = new RegExp(
-    `\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|r|-filter|-dir|-prefix|-recursive))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
+    `\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|r|-filter|-dir|-prefix|-recursive))--?\\w[\\w-]*(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
     "g",
   );
   return text.replace(
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 4d8b67420..628ff9d70 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -698,7 +698,7 @@ export function renameScriptTokens(text, renames) {
     const names = Object.keys(renames).sort((a, b) => b.length - a.length);
     if (names.length === 0)
         return text;
-    const re = new RegExp(`\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|r|-filter|-dir|-prefix|-recursive))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`, "g");
+    const re = new RegExp(`\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|r|-filter|-dir|-prefix|-recursive))--?\\w[\\w-]*(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`, "g");
     return text.replace(re, (_m, flags, gap, old) => `pnpm${flags}${gap}${renames[old]}`);
 }
 /** Each old script name still in `text`, with its 1-based line. */
