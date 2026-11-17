diff --git a/.bkit/core/engine/checks/tips/catalogue.test.ts b/.bkit/core/engine/checks/tips/catalogue.test.ts
index 7b0556950..9475c8377 100644
--- a/.bkit/core/engine/checks/tips/catalogue.test.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.test.ts
@@ -677,6 +677,8 @@ describe("SETUP_TIPS — detection", () => {
   });
 
   describe("project-goals", () => {
+    /** The ask the person sees: the per-repo `resolve` text when the tip has one. */
+    const askFor = (t: SetupTip, dir: string): string => (t.resolve?.(dir) ?? t).ask;
     const rules = (goals: string | null) =>
       write(
         ".agents/rules.md",
@@ -702,6 +704,39 @@ describe("SETUP_TIPS — detection", () => {
       rules("- **Correct over fast:** A wrong answer costs more than a slow one.");
       expect(tip("project-goals").fires(cwd)).toBe(false);
     });
+
+    it("project-goals stays quiet when a second Project Goals section holds a goal", () => {
+      write(
+        ".agents/rules.md",
+        "<!-- bkit:end -->\n\n## Project Rules\n\n## Project Goals\n\n<!-- Examples:\n- x\n-->\n\n" +
+          "## Project Settings\n\nnone\n\n## Project Goals\n\n- **Correct over fast:** x\n",
+      );
+      expect(tip("project-goals").fires(cwd)).toBe(false);
+    });
+
+    it("project-goals ask says to fill the section when the heading already exists", () => {
+      rules("What this project optimises for.\n\n<!-- Examples:\n- x\n-->\n");
+      const t = tip("project-goals");
+      expect(t.fires(cwd)).toBe(true);
+      const ask = askFor(t, cwd);
+      expect(ask).toMatch(/fill/i);
+      expect(ask).toMatch(/already|existing/i);
+      expect(ask).not.toMatch(/^Add a `## Project Goals` section/);
+    });
+
+    it("project-goals stays quiet when the goals are a numbered list", () => {
+      rules("1. **Correct over fast:** x");
+      expect(tip("project-goals").fires(cwd)).toBe(false);
+      rules("1) **Correct over fast:** x");
+      expect(tip("project-goals").fires(cwd)).toBe(false);
+    });
+
+    it("project-goals stays quiet when the goals use * bullets", () => {
+      rules("* **Correct over fast:** x");
+      expect(tip("project-goals").fires(cwd)).toBe(false);
+      rules("+ **Correct over fast:** x");
+      expect(tip("project-goals").fires(cwd)).toBe(false);
+    });
   });
 
   describe("share-friction", () => {
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 00e2e9d04..5351aba93 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -51,6 +51,7 @@ import {
   hasLintStagedConfig,
   hasMcpServer,
   hasNoProjectGoals,
+  hasProjectGoalsHeading,
   hasNewerBkit,
   hasTestLinter,
   hasUnsharedFriction,
@@ -420,6 +421,12 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     why: "Design and plan agents choose between options on every run. The rules say what is allowed, not what matters most here, so each agent weighs speed, cost and polish its own way.",
     ask: "Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first.",
     steps: "`.bkit/prompts.md` § Special Behaviors, where the Project Goals row sits.",
+    resolve: (cwd) => ({
+      ask: hasProjectGoalsHeading(cwd)
+        ? "Fill the `## Project Goals` section that already exists in .agents/rules.md instead of adding a second one, with a few goals in priority order. Ask me what this project optimises for first."
+        : "Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first.",
+      steps: "`.bkit/prompts.md` § Special Behaviors, where the Project Goals row sits.",
+    }),
     fires: hasNoProjectGoals,
   },
   {
diff --git a/.bkit/core/engine/checks/tips/detect.ts b/.bkit/core/engine/checks/tips/detect.ts
index b1329a8d8..135443751 100644
--- a/.bkit/core/engine/checks/tips/detect.ts
+++ b/.bkit/core/engine/checks/tips/detect.ts
@@ -231,18 +231,29 @@ export function readsBkitText(cwd: string): string[] {
   });
 }
 
+/** `.agents/rules.md` below `<!-- bkit:end -->` with HTML comments removed; null without the file. */
+function rulesBelowEnd(cwd: string): string | null {
+  const text = readText(cwd, ".agents/rules.md");
+  if (!text) return null;
+  const end = text.indexOf("<!-- bkit:end -->");
+  return (end === -1 ? text : text.slice(end)).replace(/<!--[\s\S]*?-->/g, "");
+}
+
+/** True when the rules file already has a `## Project Goals` heading below `<!-- bkit:end -->`. */
+export function hasProjectGoalsHeading(cwd: string): boolean {
+  return /^## Project Goals/m.test(rulesBelowEnd(cwd) ?? "");
+}
+
 /**
- * True when `.agents/rules.md` exists and its `## Project Goals` section, read below
- * `<!-- bkit:end -->`, is missing or holds no `- ` bullet once HTML comments are removed.
+ * True when `.agents/rules.md` exists and no `## Project Goals` section, read below
+ * `<!-- bkit:end -->`, holds a list item (`-`, `*`, `+` or `1.` / `1)`) once HTML comments
+ * are removed.
  */
 export function hasNoProjectGoals(cwd: string): boolean {
-  const text = readText(cwd, ".agents/rules.md");
-  if (!text) return false;
-  const end = text.indexOf("<!-- bkit:end -->");
-  const below = (end === -1 ? text : text.slice(end)).replace(/<!--[\s\S]*?-->/g, "");
-  const m = /^## Project Goals[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(below);
-  if (!m) return true;
-  return !/^\s*- /m.test(m[1]);
+  const below = rulesBelowEnd(cwd);
+  if (below === null) return false;
+  const sections = [...below.matchAll(/^## Project Goals[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)];
+  return !sections.some((m) => /^\s*(?:[-*+]|\d+[.)])\s/m.test(m[1] ?? ""));
 }
 
 /**
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 1db234b19..f87c84276 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -33,7 +33,7 @@ import { buildTrackerSetupAdvisory } from "../after/github.js";
 import { buildDepUpdaterSetupAdvisory, detectProjectDocs } from "../after/tools.js";
 import { detectInstalledHostModules } from "../../install/hosts.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { anyWorkflowMentions, claudeSettingsHas, codexTopLevelHas, exists, hasJsTestRunner, hasLintStagedConfig, hasMcpServer, hasNoProjectGoals, hasNewerBkit, hasTestLinter, hasUnsharedFriction, readsBkitText, unlockedMcpServers, } from "./detect.js";
+import { anyWorkflowMentions, claudeSettingsHas, codexTopLevelHas, exists, hasJsTestRunner, hasLintStagedConfig, hasMcpServer, hasNoProjectGoals, hasProjectGoalsHeading, hasNewerBkit, hasTestLinter, hasUnsharedFriction, readsBkitText, unlockedMcpServers, } from "./detect.js";
 const hosts = (cwd) => detectInstalledHostModules(cwd);
 /** Every phase workflow. A value import of `COMPLY_PHASES` would cycle through cli.ts. */
 export const ALL_WORKFLOWS = ["design", "plan", "build", "debug", "ship"];
@@ -342,6 +342,12 @@ export const SETUP_TIPS = [
         why: "Design and plan agents choose between options on every run. The rules say what is allowed, not what matters most here, so each agent weighs speed, cost and polish its own way.",
         ask: "Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first.",
         steps: "`.bkit/prompts.md` § Special Behaviors, where the Project Goals row sits.",
+        resolve: (cwd) => ({
+            ask: hasProjectGoalsHeading(cwd)
+                ? "Fill the `## Project Goals` section that already exists in .agents/rules.md instead of adding a second one, with a few goals in priority order. Ask me what this project optimises for first."
+                : "Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first.",
+            steps: "`.bkit/prompts.md` § Special Behaviors, where the Project Goals row sits.",
+        }),
         fires: hasNoProjectGoals,
     },
     {
diff --git a/dist/checks/tips/detect.js b/dist/checks/tips/detect.js
index fe999120f..7360f58fe 100644
--- a/dist/checks/tips/detect.js
+++ b/dist/checks/tips/detect.js
@@ -210,20 +210,29 @@ export function readsBkitText(cwd) {
         return text.split("\n").some((line) => READS_BKIT_TEXT.some((re) => re.test(line)));
     });
 }
+/** `.agents/rules.md` below `<!-- bkit:end -->` with HTML comments removed; null without the file. */
+function rulesBelowEnd(cwd) {
+    const text = readText(cwd, ".agents/rules.md");
+    if (!text)
+        return null;
+    const end = text.indexOf("<!-- bkit:end -->");
+    return (end === -1 ? text : text.slice(end)).replace(/<!--[\s\S]*?-->/g, "");
+}
+/** True when the rules file already has a `## Project Goals` heading below `<!-- bkit:end -->`. */
+export function hasProjectGoalsHeading(cwd) {
+    return /^## Project Goals/m.test(rulesBelowEnd(cwd) ?? "");
+}
 /**
- * True when `.agents/rules.md` exists and its `## Project Goals` section, read below
- * `<!-- bkit:end -->`, is missing or holds no `- ` bullet once HTML comments are removed.
+ * True when `.agents/rules.md` exists and no `## Project Goals` section, read below
+ * `<!-- bkit:end -->`, holds a list item (`-`, `*`, `+` or `1.` / `1)`) once HTML comments
+ * are removed.
  */
 export function hasNoProjectGoals(cwd) {
-    const text = readText(cwd, ".agents/rules.md");
-    if (!text)
+    const below = rulesBelowEnd(cwd);
+    if (below === null)
         return false;
-    const end = text.indexOf("<!-- bkit:end -->");
-    const below = (end === -1 ? text : text.slice(end)).replace(/<!--[\s\S]*?-->/g, "");
-    const m = /^## Project Goals[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(below);
-    if (!m)
-        return true;
-    return !/^\s*- /m.test(m[1]);
+    const sections = [...below.matchAll(/^## Project Goals[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)];
+    return !sections.some((m) => /^\s*(?:[-*+]|\d+[.)])\s/m.test(m[1] ?? ""));
 }
 /**
  * True when `.bkit/friction.jsonl` holds an entry worth sending to bkit: its fold winner
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 14c3e397c..7ab136286 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -453,3 +453,5 @@
 {"schema":3,"ts":1794869019412,"firstTs":1794746800360,"updates":2,"kind":"deferral","key":"957-workflows-skip-re-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-219","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["957-workflows-skip-re"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"An accepted verify gap with no task number, titled with its verifier-written description such as `No test covers the retry path that task 2 adds`, ticks task 2 as done, because the case-insensitive, unanchored title match added by the Task 9 fix finds a task number anywhere in the title, so an unfinished task passes the summary's unticked-task gate","description":"Closed: fixed by issue 989. An accepted item ticks a task only when its trimmed title starts with `Task {N}` (`/^task\\s+(\\d+)\\b/i`); tested in `tasks.test.ts`. Original finding: LOW build challenge finding at .bkit/core/engine/commands/workflow/tasks.ts:219: An accepted verify gap with no task number, titled with its verifier-written description such as `No test covers the retry path that task 2 adds`, ticks task 2 as done, because the case-insensitive, unanchored title match added by the Task 9 fix finds a task number anywhere in the title, so an unfinished task passes the summary's unticked-task gate. Done when: `tasks tick --decision` reads a task number only from a title that starts with it (`/^task\\s+(\\d+)\\b/i`), so `TASK 3` and `Task 3 gap` still tick task 3 and a task number later in the title ticks nothing","source":".bkit/core/engine/commands/workflow/tasks.ts:219","status":"CLOSED"}
 {"schema":3,"ts":1794869019413,"firstTs":1794730815881,"updates":2,"kind":"deferral","key":"951-build-repeat-whole-challenge-low-bkit-core-workflows-bkit-build-md-165","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["951-build-repeat-whole"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Every holistic limit pause now tells the owner \"build holistic: attempt 3 of 2\", because the pause fires only on exit 1 and passes the refused `:next` fix round as the attempt","description":"Closed: fixed by issue 990. `decisions compose --loop` prints the rounds run: an `--attempt` above `--max` is the round the limit refused and prints as `--max`, so the line never reads `attempt 3 of 2`; tested in `decisions.test.ts`. Original finding: LOW build challenge finding at .bkit/core/workflows/bkit-build.md:165: Every holistic limit pause now tells the owner \"build holistic: attempt 3 of 2\", because the pause fires only on exit 1 and passes the refused `:next` fix round as the attempt. Done when: The holistic `LOOP_FLAGS` pass the number of fix rounds already run in the active run (the `:next` value minus one, or a `counters derive` count), so the first limit pause reads `build holistic: attempt 2 of 2` and a pause after one grant reads `attempt 4 of 4`; the mirrors and render snapshots are regenerated.","source":".bkit/core/workflows/bkit-build.md:165","status":"CLOSED"}
 {"schema":3,"ts":1794872642759,"firstTs":1794365934213,"updates":3,"kind":"deferral","key":"787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-637","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["787-show-authoring-rules","967","https://github.com/cbartens/bkit/issues/967"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`perl -lpi -e … docs/testing.md` (or `-0pi`) edits in place, but `perlFlag` stops scanning the flag cluster at `l` / `0` before it reaches `i`","description":"Closed: fixed by issue 999. perlFlag reads -l and -0 as taking only octal digits, so perl -lpi and perl -0777pi are seen as in-place edits (guardrails-cursor.integration.test.ts). Original finding: LOW build challenge finding at .bkit/core/hooks/guardrails-shell.js:685 (`perlFlag`, used by the `perl` and `ruby` entries of `KNOWN_WRITERS`): `perl -lpi -e … docs/testing.md` (or `-0pi`) edits in place, but the scan returns at `l` / `0` (the `\"IMmFlx0\"` set) before it reaches `i`. Done when: `-l` and `-0` consume only their optional octal digits and the scan continues through the rest of the cluster, so `-lpi`, `-0pi` and `-0777pi` set in-place; `-Mmodule`, `-Idir` and `-F` patterns still end the cluster. Probe today: `perl -lpi -e s/a/b/ docs/testing.md` and `perl -0pi -e s/a/b/ docs/testing.md` return `{\"targets\":[],\"uncertain\":[],\"limit\":null}`; `perl -pi -e s/a/b/ docs/testing.md` returns `docs/testing.md`.","source":".bkit/core/hooks/guardrails-shell.js:685","status":"CLOSED"}
+{"schema":3,"ts":1794886685484,"firstTs":1794886685484,"updates":1,"kind":"deferral","key":"1011-rules-ship-project-challenge-low-bkit-core-engine-checks-tips-detect-ts-242","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["1011-rules-ship-project"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A Project Rules bullet that quotes an unclosed HTML comment opener in a code span makes the comment strip swallow everything up to the next comment closer, including the `## Project Goals` heading, so the tip fires although the goals are filled","description":"LOW build challenge finding at .bkit/core/engine/checks/tips/detect.ts:242: A Project Rules bullet that quotes an unclosed HTML comment opener in a code span makes the comment strip swallow everything up to the next comment closer, including the `## Project Goals` heading, so the tip fires although the goals are filled. Done when: an unclosed comment opener outside the `## Project Goals` section can no longer remove the heading or its bullets; for example the detector finds the section on the raw text below `<!-- bkit:end -->` first and strips HTML comments only inside the section","source":".bkit/core/engine/checks/tips/detect.ts:242"}
+{"schema":3,"ts":1794886685485,"firstTs":1794886685485,"updates":1,"kind":"deferral","key":"1011-rules-ship-project-challenge-low-bkit-instructions-md-2573","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["1011-rules-ship-project"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A goal that rewards finishing unattended (bkit's own `Runs finish unattended`) tips a security challenger's borderline CRITICAL down to HIGH, so the gate reports CONCERNS instead of FAIL","description":"LOW build challenge finding at .bkit/instructions.md:2573: A goal that rewards finishing unattended (bkit's own `Runs finish unattended`) tips a security challenger's borderline CRITICAL down to HIGH, so the gate reports CONCERNS instead of FAIL. Done when: The owner has decided whether `Project Goals` may break ties in the severity and verdict calls of gate agents (`bkit-build-challenge-*`, `bkit-build-plan-verify`, `bkit-*-review-*`, `bkit-plan-scope-check`, `bkit-ship-deferred-sweep`). Then either clause `rules-leaf` states the limit (for example \"goals never lower a severity or a verdict\"), or `docs/decisions.jsonl` records the accepted risk. No agent can settle this alone: the plan records the owner's decision to put one clause in all 40 prompts, and its recorded reasons cover scope creep only, not gate calls.","source":".bkit/instructions.md:2573"}
