diff --git a/.bkit/core/engine/checks/tips/catalogue.test.ts b/.bkit/core/engine/checks/tips/catalogue.test.ts
index db7bbf9fa..7b0556950 100644
--- a/.bkit/core/engine/checks/tips/catalogue.test.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.test.ts
@@ -676,6 +676,34 @@ describe("SETUP_TIPS — detection", () => {
     });
   });
 
+  describe("project-goals", () => {
+    const rules = (goals: string | null) =>
+      write(
+        ".agents/rules.md",
+        "<!-- bkit:end -->\n\n## Project Rules\n\n" +
+          (goals === null ? "" : `## Project Goals\n\n${goals}\n`) +
+          "\n## Project Settings\n\nnone\n",
+      );
+
+    it("project-goals fires when the rules file has no Project Goals heading", () => {
+      rules(null);
+      expect(tip("project-goals").fires(cwd)).toBe(true);
+    });
+
+    it("project-goals fires when the section holds only commented examples", () => {
+      rules(
+        "What this project optimises for.\n\n<!-- Examples:\n- **Correct over fast:** x\n-->\n",
+      );
+      expect(tip("project-goals").fires(cwd)).toBe(true);
+    });
+
+    it("project-goals stays quiet when the section holds one bullet, and when there is no rules file", () => {
+      expect(tip("project-goals").fires(cwd)).toBe(false); // no rules file
+      rules("- **Correct over fast:** A wrong answer costs more than a slow one.");
+      expect(tip("project-goals").fires(cwd)).toBe(false);
+    });
+  });
+
   describe("share-friction", () => {
     const row = (key: string, ts: number, extra: Record<string, unknown>) =>
       JSON.stringify({ schema: 3, ts, kind: "friction", key, severity: "LOW", ...extra });
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 63113e649..00e2e9d04 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -50,6 +50,7 @@ import {
   hasJsTestRunner,
   hasLintStagedConfig,
   hasMcpServer,
+  hasNoProjectGoals,
   hasNewerBkit,
   hasTestLinter,
   hasUnsharedFriction,
@@ -411,6 +412,16 @@ export const SETUP_TIPS: readonly SetupTip[] = [
         (f) => f.id === "project-docs-missing" || f.id === "project-docs-unpopulated",
       ),
   },
+  {
+    id: "project-goals",
+    workflows: ["design", "plan"],
+    title: "Project goals",
+    line: "Agents have rules but no goals, so when two options both fit the rules they choose by guesswork. Write down what this project optimises for.",
+    why: "Design and plan agents choose between options on every run. The rules say what is allowed, not what matters most here, so each agent weighs speed, cost and polish its own way.",
+    ask: "Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first.",
+    steps: "`.bkit/prompts.md` § Special Behaviors, where the Project Goals row sits.",
+    fires: hasNoProjectGoals,
+  },
   {
     id: "dependabot-renovate",
     workflows: ["ship", "audit"],
diff --git a/.bkit/core/engine/checks/tips/detect.ts b/.bkit/core/engine/checks/tips/detect.ts
index a5b600415..b1329a8d8 100644
--- a/.bkit/core/engine/checks/tips/detect.ts
+++ b/.bkit/core/engine/checks/tips/detect.ts
@@ -231,6 +231,20 @@ export function readsBkitText(cwd: string): string[] {
   });
 }
 
+/**
+ * True when `.agents/rules.md` exists and its `## Project Goals` section, read below
+ * `<!-- bkit:end -->`, is missing or holds no `- ` bullet once HTML comments are removed.
+ */
+export function hasNoProjectGoals(cwd: string): boolean {
+  const text = readText(cwd, ".agents/rules.md");
+  if (!text) return false;
+  const end = text.indexOf("<!-- bkit:end -->");
+  const below = (end === -1 ? text : text.slice(end)).replace(/<!--[\s\S]*?-->/g, "");
+  const m = /^## Project Goals[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(below);
+  if (!m) return true;
+  return !/^\s*- /m.test(m[1]);
+}
+
 /**
  * True when `.bkit/friction.jsonl` holds an entry worth sending to bkit: its fold winner
  * is `OPEN` (or has no status) and its `scope` is not `consumer`. A shared entry gets a
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 39c03ddb6..1db234b19 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -33,7 +33,7 @@ import { buildTrackerSetupAdvisory } from "../after/github.js";
 import { buildDepUpdaterSetupAdvisory, detectProjectDocs } from "../after/tools.js";
 import { detectInstalledHostModules } from "../../install/hosts.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { anyWorkflowMentions, claudeSettingsHas, codexTopLevelHas, exists, hasJsTestRunner, hasLintStagedConfig, hasMcpServer, hasNewerBkit, hasTestLinter, hasUnsharedFriction, readsBkitText, unlockedMcpServers, } from "./detect.js";
+import { anyWorkflowMentions, claudeSettingsHas, codexTopLevelHas, exists, hasJsTestRunner, hasLintStagedConfig, hasMcpServer, hasNoProjectGoals, hasNewerBkit, hasTestLinter, hasUnsharedFriction, readsBkitText, unlockedMcpServers, } from "./detect.js";
 const hosts = (cwd) => detectInstalledHostModules(cwd);
 /** Every phase workflow. A value import of `COMPLY_PHASES` would cycle through cli.ts. */
 export const ALL_WORKFLOWS = ["design", "plan", "build", "debug", "ship"];
@@ -334,6 +334,16 @@ export const SETUP_TIPS = [
         advisories: ["project-docs-missing", "project-docs-unpopulated"],
         fires: (cwd) => detectProjectDocs(cwd).some((f) => f.id === "project-docs-missing" || f.id === "project-docs-unpopulated"),
     },
+    {
+        id: "project-goals",
+        workflows: ["design", "plan"],
+        title: "Project goals",
+        line: "Agents have rules but no goals, so when two options both fit the rules they choose by guesswork. Write down what this project optimises for.",
+        why: "Design and plan agents choose between options on every run. The rules say what is allowed, not what matters most here, so each agent weighs speed, cost and polish its own way.",
+        ask: "Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first.",
+        steps: "`.bkit/prompts.md` § Special Behaviors, where the Project Goals row sits.",
+        fires: hasNoProjectGoals,
+    },
     {
         id: "dependabot-renovate",
         workflows: ["ship", "audit"],
diff --git a/dist/checks/tips/detect.js b/dist/checks/tips/detect.js
index 6ec3b84c4..fe999120f 100644
--- a/dist/checks/tips/detect.js
+++ b/dist/checks/tips/detect.js
@@ -210,6 +210,21 @@ export function readsBkitText(cwd) {
         return text.split("\n").some((line) => READS_BKIT_TEXT.some((re) => re.test(line)));
     });
 }
+/**
+ * True when `.agents/rules.md` exists and its `## Project Goals` section, read below
+ * `<!-- bkit:end -->`, is missing or holds no `- ` bullet once HTML comments are removed.
+ */
+export function hasNoProjectGoals(cwd) {
+    const text = readText(cwd, ".agents/rules.md");
+    if (!text)
+        return false;
+    const end = text.indexOf("<!-- bkit:end -->");
+    const below = (end === -1 ? text : text.slice(end)).replace(/<!--[\s\S]*?-->/g, "");
+    const m = /^## Project Goals[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(below);
+    if (!m)
+        return true;
+    return !/^\s*- /m.test(m[1]);
+}
 /**
  * True when `.bkit/friction.jsonl` holds an entry worth sending to bkit: its fold winner
  * is `OPEN` (or has no status) and its `scope` is not `consumer`. A shared entry gets a
