diff --git a/.bkit/core/docs/templates/bkit-plan.md b/.bkit/core/docs/templates/bkit-plan.md
index 932240a9c..ac636cb90 100644
--- a/.bkit/core/docs/templates/bkit-plan.md
+++ b/.bkit/core/docs/templates/bkit-plan.md
@@ -193,17 +193,7 @@ Carry each required read and each doc update into the runbook task that needs it
 
 ## Documentation Warnings
 
-[One JSON object per line in a fenced `jsonl` block, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`, all non-empty (`"None available"` when no alternative evidence exists). **If** every applicable topic is covered → write `None`. A warning never blocks the plan. Initially set to `PENDING`.]
-
-```jsonl
-{
-  "topic": "security",
-  "gap": "starter-only",
-  "recommendedPath": "docs/security.md",
-  "alternativeEvidence": "The CI configuration defines token permissions.",
-  "action": "Populate the security document with the project's credential and permission boundaries."
-}
-```
+[One JSON object per line in a fenced `jsonl` block, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`, all non-empty (`"None available"` when no alternative evidence exists). Example line: `{"topic": "security", "gap": "starter-only", "recommendedPath": "docs/security.md", "alternativeEvidence": "The CI configuration defines token permissions.", "action": "Populate the security document with the project's credential and permission boundaries."}`. **If** every applicable topic is covered → write `None`. A warning never blocks the plan. Initially set to `PENDING`.]
 
 ## Data Schema Integration
 
diff --git a/.bkit/core/engine/checks/after/tools.test.ts b/.bkit/core/engine/checks/after/tools.test.ts
index 9152d0798..b5d2f9d38 100644
--- a/.bkit/core/engine/checks/after/tools.test.ts
+++ b/.bkit/core/engine/checks/after/tools.test.ts
@@ -685,4 +685,42 @@ describe("detectProjectDocs", () => {
     // Sync either registered the doc (no advisory) or the advisory must not promise upgrade will.
     expect(promised).not.toContain("bkit upgrade");
   });
+
+  it("reports an ambiguous legacy wrapper left in a project document", () => {
+    writeDoc(
+      "docs/security.md",
+      "<!-- bkit:start -->\n# Security\n\nAuth uses session cookies issued by the api service.\n",
+    );
+    writeIndex([{ doc: "docs/security.md" }]);
+    const findings = detectProjectDocs(tmpDir);
+    const text = allText(findings);
+    expect(text).toContain("docs/security.md");
+    expect(text).toContain("bkit:start");
+    const cleanup = findings.find((f) => f.detect.includes("bkit:start"));
+    expect(cleanup).toBeDefined();
+    expect(cleanup!.severity).toBe("advisory");
+  });
+
+  it("reports an index row through a regular file as ambiguous instead of throwing", () => {
+    fs.writeFileSync(path.join(tmpDir, "README.md"), "# readme\n");
+    writeIndex([{ doc: "README.md/security.md" }]);
+    let findings: ReturnType<typeof detectProjectDocs> = [];
+    expect(() => {
+      findings = detectProjectDocs(tmpDir);
+    }).not.toThrow();
+    const ambiguous = findings.find((f) => f.id === "project-docs-ambiguous");
+    expect(ambiguous).toBeDefined();
+    expect(ambiguous!.severity).toBe("advisory");
+  });
+
+  it("reports a NUL-byte index path as ambiguous instead of throwing", () => {
+    writeIndex([{ doc: "docs/a\u0000/security.md" }]);
+    let findings: ReturnType<typeof detectProjectDocs> = [];
+    expect(() => {
+      findings = detectProjectDocs(tmpDir);
+    }).not.toThrow();
+    const ambiguous = findings.find((f) => f.id === "project-docs-ambiguous");
+    expect(ambiguous).toBeDefined();
+    expect(ambiguous!.severity).toBe("advisory");
+  });
 });
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index 9c80852c2..734602e99 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -21,6 +21,7 @@ import {
   readProjectIndex,
   starterPath,
 } from "../../install/project-docs.js";
+import { stripManagedWrapper } from "../../install/managed-block.js";
 import { isAdvisorySuppressed, type SuppressionReporter } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import {
@@ -486,6 +487,7 @@ export function detectProjectDocs(
   const unindexed: string[] = [];
   const duplicates: string[] = [];
   const ambiguous: string[] = [];
+  const cleanup: string[] = [];
 
   for (const topic of PROJECT_DOC_TOPICS) {
     const recommended = projectDocPath(topic);
@@ -517,6 +519,8 @@ export function detectProjectDocs(
       ambiguous.push(`${target} (it could not be read)`);
       continue;
     }
+    const wrapper = stripManagedWrapper(read.text);
+    if (wrapper.status === "ambiguous") cleanup.push(`${target} (${wrapper.problem})`);
     const assessed = assessDocText(cwd, topic, read.text);
     if (assessed === "empty") empty.push(target);
     else if (assessed === "unpopulated") unpopulated.push(target);
@@ -583,6 +587,14 @@ export function detectProjectDocs(
       action: `bkit does not register them while the other document is indexed. Keep one: delete the unused file, or add a row for the second one by hand under \`## Project Documents\` in ${PROJECT_INDEX_PATH}.`,
     });
   }
+  if (cleanup.length > 0) {
+    findings.push({
+      id: "project-docs-cleanup",
+      severity: "advisory",
+      detect: `These project documents still carry a bkit ownership wrapper (\`<!-- bkit:start -->\` / \`<!-- bkit:end -->\` lines or the \`bkit:managed\` notice) that bkit could not remove safely: ${cleanup.join("; ")}.`,
+      action: `Edit each file by hand: delete the \`<!-- bkit:start -->\` and \`<!-- bkit:end -->\` lines and the \`bkit:managed\` notice line, keeping the text between them. These documents belong to the project now; bkit changes none of them itself.`,
+    });
+  }
   if (ambiguous.length > 0) {
     findings.push({
       id: "project-docs-ambiguous",
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index c0e6fd349..aaac0e933 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -1,3 +1,5 @@
+import * as fs from "node:fs";
+import * as path from "node:path";
 import { describe, expect, it } from "vitest";
 
 import { buildSummary, NEXT_STEP, refOf, type SummaryInput } from "./summary";
@@ -1080,4 +1082,23 @@ describe("buildSummary", () => {
     expect(s.markdown).not.toContain("UNTRUSTED-ACTION");
     expect(s.markdown).not.toContain("UNTRUSTED-SECTION-ACTION");
   });
+
+  it("a plan built from the unfilled bkit-plan.md template yields no documentation warning", () => {
+    const template = fs.readFileSync(
+      path.resolve(__dirname, "../../../docs/templates/bkit-plan.md"),
+      "utf8",
+    );
+    const filled = template.replace(/(## Documentation Warnings\n\n)\[[^\n]*\]/, "$1None");
+    expect(filled).not.toBe(template);
+    const s = buildSummary(
+      input({
+        rows: [
+          { type: "step-done", step: "plan-write", verdict: "PASS", artifacts: ["log/plan.md"] },
+        ],
+        read: reader({ "log/plan.md": filled }),
+      }),
+    );
+    expect(s.markdown).not.toContain("**security** (starter-only)");
+    expect(s.markdown).not.toContain("## Documentation Warnings");
+  });
 });
diff --git a/.bkit/core/engine/install/project-docs.ts b/.bkit/core/engine/install/project-docs.ts
index 09b8783d7..3394658f9 100644
--- a/.bkit/core/engine/install/project-docs.ts
+++ b/.bkit/core/engine/install/project-docs.ts
@@ -302,6 +302,10 @@ function errorReason(error: unknown): string {
 /** True when `rel` is a repo-relative path with no parent or absolute segments. */
 export function isInTreePath(rel: string): boolean {
   if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel)) return false;
+  for (const ch of rel) {
+    const code = ch.charCodeAt(0);
+    if (code < 0x20 || code === 0x7f) return false;
+  }
   return !rel.split(/[\\/]/).includes("..");
 }
 
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index d1267b389..0469a8dcc 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -7,6 +7,7 @@ import { readPackageJson } from "../../shared/package-json.js";
 import { readTextFile } from "../../shared/json.js";
 import { getPkgRoot } from "../../shared/package-roots.js";
 import { PROJECT_DOC_TOPICS, PROJECT_INDEX_PATH, findIndexedEquivalent, inspectRepoFile, isInTreePath, legacyStarterTopic, normalizeLegacyText, projectDocPath, readProjectIndex, starterPath, } from "../../install/project-docs.js";
+import { stripManagedWrapper } from "../../install/managed-block.js";
 import { isAdvisorySuppressed } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import { DEP_UPDATER_NAMES, findDepUpdaterConfigs, } from "../../shared/dep-updater.js";
@@ -385,6 +386,7 @@ export function detectProjectDocs(cwd, onSuppressed) {
     const unindexed = [];
     const duplicates = [];
     const ambiguous = [];
+    const cleanup = [];
     for (const topic of PROJECT_DOC_TOPICS) {
         const recommended = projectDocPath(topic);
         const equivalent = findIndexedEquivalent(rows, topic);
@@ -415,6 +417,9 @@ export function detectProjectDocs(cwd, onSuppressed) {
             ambiguous.push(`${target} (it could not be read)`);
             continue;
         }
+        const wrapper = stripManagedWrapper(read.text);
+        if (wrapper.status === "ambiguous")
+            cleanup.push(`${target} (${wrapper.problem})`);
         const assessed = assessDocText(cwd, topic, read.text);
         if (assessed === "empty")
             empty.push(target);
@@ -480,6 +485,14 @@ export function detectProjectDocs(cwd, onSuppressed) {
             action: `bkit does not register them while the other document is indexed. Keep one: delete the unused file, or add a row for the second one by hand under \`## Project Documents\` in ${PROJECT_INDEX_PATH}.`,
         });
     }
+    if (cleanup.length > 0) {
+        findings.push({
+            id: "project-docs-cleanup",
+            severity: "advisory",
+            detect: `These project documents still carry a bkit ownership wrapper (\`<!-- bkit:start -->\` / \`<!-- bkit:end -->\` lines or the \`bkit:managed\` notice) that bkit could not remove safely: ${cleanup.join("; ")}.`,
+            action: `Edit each file by hand: delete the \`<!-- bkit:start -->\` and \`<!-- bkit:end -->\` lines and the \`bkit:managed\` notice line, keeping the text between them. These documents belong to the project now; bkit changes none of them itself.`,
+        });
+    }
     if (ambiguous.length > 0) {
         findings.push({
             id: "project-docs-ambiguous",
diff --git a/dist/install/project-docs.js b/dist/install/project-docs.js
index 98d183cb3..b7db4eb86 100644
--- a/dist/install/project-docs.js
+++ b/dist/install/project-docs.js
@@ -268,6 +268,11 @@ function errorReason(error) {
 export function isInTreePath(rel) {
     if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel))
         return false;
+    for (const ch of rel) {
+        const code = ch.charCodeAt(0);
+        if (code < 0x20 || code === 0x7f)
+            return false;
+    }
     return !rel.split(/[\\/]/).includes("..");
 }
 const ROW_RE = /^\|\s*`([^`]+)`\s*\|/;
