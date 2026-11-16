diff --git a/.bkit/core/engine/install/project-docs.test.ts b/.bkit/core/engine/install/project-docs.test.ts
index 3011e8e8c..f985e207e 100644
--- a/.bkit/core/engine/install/project-docs.test.ts
+++ b/.bkit/core/engine/install/project-docs.test.ts
@@ -265,11 +265,22 @@ describe("adoptedProjectDocPath", () => {
 
 const ADOPTION_HEADING = "## Project docs — adoption order";
 
-/** Arrow sources into each doc's node, read from the adoption-order chart. */
-function adoptionArrows(): { solid: Map<string, string[]>; dotted: Map<string, string[]> } {
+/** The adoption-order chart text in `.bkit/templates.md`. */
+function adoptionChart(): string {
   const text = fs.readFileSync(path.join(getPkgRoot(), ".bkit/core/.bkit/templates.md"), "utf8");
   const section = text.slice(text.indexOf(ADOPTION_HEADING));
-  const chart = /```mermaid\n([\s\S]*?)```/.exec(section)?.[1] ?? "";
+  return /```mermaid\n([\s\S]*?)```/.exec(section)?.[1] ?? "";
+}
+
+/**
+ * Arrow sources into each doc's node, read from the adoption-order chart.
+ * Reads edge labels (`-->|x|`), chained edges (`A --> B --> C`) and `&` groups; throws on
+ * an arrow line it cannot parse, so no edge is dropped silently.
+ */
+function adoptionArrows(chart: string = adoptionChart()): {
+  solid: Map<string, string[]>;
+  dotted: Map<string, string[]>;
+} {
   const labels = new Map<string, string>();
   for (const m of chart.matchAll(/(\w+)\["([^"]*)"\]/g)) labels.set(m[1] ?? "", m[2] ?? "");
   const docOf = (id: string): string => {
@@ -278,10 +289,26 @@ function adoptionArrows(): { solid: Map<string, string[]>; dotted: Map<string, s
   };
   const solid = new Map<string, string[]>();
   const dotted = new Map<string, string[]>();
-  for (const m of chart.matchAll(/(\w+)(?:\["[^"]*"\])?\s*(-->|-\.->)\s*(\w+)/g)) {
-    const target = docOf(m[3] ?? "");
-    const into = m[2] === "-->" ? solid : dotted;
-    into.set(target, [...(into.get(target) ?? []), docOf(m[1] ?? "")]);
+  const nodeIds = (group: string, line: string): string[] =>
+    group.split("&").map((part) => {
+      const m = /^\s*(\w+)(?:\["[^"]*"\])?\s*$/.exec(part);
+      if (!m) throw new Error(`Unparsable adoption chart edge: ${line.trim()}`);
+      return m[1] ?? "";
+    });
+  for (const line of chart.split("\n")) {
+    if (!/[-=.]{2,}[>ox]|---|-\.-|-\.\s/.test(line)) continue;
+    const pieces = line.split(/(-->|-\.+->|-\.\s[^.]*?\s\.+->)(?:\|[^|]*\|)?/);
+    if (pieces.length < 3 || pieces.length % 2 === 0) {
+      throw new Error(`Unparsable adoption chart edge: ${line.trim()}`);
+    }
+    for (let i = 1; i < pieces.length; i += 2) {
+      const into = pieces[i] === "-->" ? solid : dotted;
+      const from = nodeIds(pieces[i - 1] ?? "", line);
+      const to = nodeIds(pieces[i + 1] ?? "", line);
+      for (const t of to) {
+        for (const f of from) into.set(docOf(t), [...(into.get(docOf(t)) ?? []), docOf(f)]);
+      }
+    }
   }
   return { solid, dotted };
 }
@@ -297,7 +324,7 @@ function starterLines(topic: string): string[] {
 
 function docPaths(line: string): string[] {
   const found: string[] = [];
-  for (const m of line.matchAll(/docs\/[a-z-]+\.md/g)) found.push(m[0]);
+  for (const m of line.matchAll(/(?<![/\w])docs\/[a-z-]+\.md(?!\w|\.\w)/g)) found.push(m[0]);
   return found.sort();
 }
 
@@ -677,3 +704,44 @@ describe("starter docs", () => {
     expect(intro.join("\n")).toContain("bkit-graph-drift-rules.json");
   });
 });
+
+describe("adoption chart helpers", () => {
+  it("adoptionArrows reads labelled, chained and grouped edges", () => {
+    const chart = [
+      "flowchart TD",
+      '  DATA["data-schema"] -->|schema| DEP["deployments"]',
+      '  A["architecture"] --> B["security"] --> C["testing"]',
+      '  X["technology"] & Y["design"] --> Z["setup"]',
+    ].join("\n");
+    // Pass the chart text as an argument; the helper must read every edge form.
+    const { solid } = (adoptionArrows as (chart: string) => ReturnType<typeof adoptionArrows>)(
+      chart,
+    );
+    expect(solid.get("docs/deployments.md")).toEqual(["docs/data-schema.md"]);
+    expect(solid.get("docs/security.md")).toEqual(["docs/architecture.md"]);
+    expect(solid.get("docs/testing.md")).toEqual(["docs/security.md"]);
+    expect([...solid.get("docs/setup.md")!].sort()).toEqual([
+      "docs/design.md",
+      "docs/technology.md",
+    ]);
+  });
+
+  it("adoptionArrows reads dotted-label and longer dotted edges", () => {
+    const chart = [
+      "flowchart TD",
+      '  P["product"] -. why .-> Q["roadmap"]',
+      '  R["rules"] -..-> S["skills"]',
+    ].join("\n");
+    const { dotted } = adoptionArrows(chart);
+    expect(dotted.get("docs/roadmap.md")).toEqual(["docs/product.md"]);
+    expect(dotted.get("docs/skills.md")).toEqual(["docs/rules.md"]);
+  });
+
+  it("docPaths ignores template paths and longer suffixes", () => {
+    expect(docPaths("see .bkit/templates/docs/technology.md and docs/noise.mdx")).toEqual([]);
+    expect(docPaths("read docs/technology.md, then (docs/noise.md).")).toEqual([
+      "docs/noise.md",
+      "docs/technology.md",
+    ]);
+  });
+});
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 68ec25893..cd8d11679 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -209,3 +209,5 @@
 {"schema":3,"ts":1794617726109,"kind":"friction","key":"ledgers-check/plan-summary-unbackticked","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-summary"},"references":["887-review-doc-starters","https://github.com/cbartens/bkit/issues/887"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"plan-update wrote the Ledger rows line with bare keys, which ledgers check reads as unfilled","description":"In /bkit-plan #887 run 2, @bkit-plan-update wrote `**Ledger rows:**` with 15 bare keys. `bkit ledgers check` only reads backticked keys, so it exited 11 with `is unfilled` though every key was on disk. Neither plan-check nor the update agent caught it; the orchestrator added the backticks and the check passed.","source":"orchestrator","status":"OPEN","recurrenceCount":1}
 {"schema":3,"ts":1794638603554,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"acknowledges only complete selected blocks on verified routes\", `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"reserves notices inside conservative host budgets\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"efc2e5a5eaf9dac459eebceed27d170bd50f5066"},"recurrenceCount":3,"lastConfirmed":1794638603554}
 {"schema":3,"ts":1794660669716,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":18,"lastConfirmed":1794660669716}
+{"schema":3,"ts":1794689068714,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":5,"lastConfirmed":1794689068714}
+{"schema":3,"ts":1794690844302,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"acknowledges only complete selected blocks on verified routes\", `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"reserves notices inside conservative host budgets\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"efc2e5a5eaf9dac459eebceed27d170bd50f5066"},"recurrenceCount":4,"lastConfirmed":1794690844302}
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index b2d77eaa0..1a8fdbfac 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -359,3 +359,6 @@
 {"schema":3,"ts":1794614634380,"firstTs":1794614634380,"updates":1,"kind":"deferral","key":"887-adopted-copy-migrations","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["887","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"Migrations for already-adopted project-doc copies","description":"No #887 criterion asks to rewrite adopted docs; a future advisory or migration handles adopted copies when bkit's practice changes.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794614634381,"firstTs":1794614634381,"updates":1,"kind":"deferral","key":"887-starter-vendor-content","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["887",".agents/rules.md","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"Vendor-specific starter content","description":"Starters stay stack-agnostic and vendor names stay marked as examples, per the stack-agnostic rule in .agents/rules.md.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794617614037,"firstTs":1794617614037,"updates":1,"kind":"deferral","key":"887-bkit-own-docs-starter-rules","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["887",".bkit/core/.bkit/authoring.md","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"Starter-scoped § Docs rules (Not here, Update when and the fill rules) in bkit's own .agents/**, .bkit/*.md and docs/*.md files","description":"The new § Docs rules other than the Mermaid rule apply to the starters in .bkit/templates/docs/*.md. Bringing bkit's own docs' rules boxes and values in line with them, with tests, is a follow-up issue; the plan's Out of Scope row declares it.","source":"phase","status":"OPEN"}
+{"schema":3,"ts":1794663307642,"firstTs":1794663307642,"updates":1,"kind":"deferral","key":"887-review-doc-starters-challenge-low-bkit-core-engine-install-project-docs-test-ts-460","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["887-review-doc-starters"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A testing.md or deployments.md section whose first line is plain text but which quotes a Project slot or bkit practice marker further down passes 'marks every section slot or practice', and a slot section holding a nested practice marker skips the [e.g., table check, because sectionMarks and starterProblems use lines.some instead of the first non-blank line","description":"LOW build challenge finding at .bkit/core/engine/install/project-docs.test.ts:460: A testing.md or deployments.md section whose first line is plain text but which quotes a Project slot or bkit practice marker further down passes 'marks every section slot or practice', and a slot section holding a nested practice marker skips the [e.g., table check, because sectionMarks and starterProblems use lines.some instead of the first non-blank line. Done when: sectionMarks and the practice skip in starterProblems (line 408) classify a ## section by its first non-blank line only, as the plan's slot/practice marker contract states (the first line under every ## heading), and a section with the marker further down reads as none.","source":".bkit/core/engine/install/project-docs.test.ts:460"}
+{"schema":3,"ts":1794663307643,"firstTs":1794663307643,"updates":1,"kind":"deferral","key":"887-review-doc-starters-challenge-low-bkit-core-engine-install-project-docs-test-ts-396","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["887-review-doc-starters"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A starter that carries the bkit-practice rules-box line but has no section marked bkit practice passes the 'rules box iff the starter holds one' check, because hasPractice scans the whole file and counts the rules-box line itself","description":"LOW build challenge finding at .bkit/core/engine/install/project-docs.test.ts:396: A starter that carries the bkit-practice rules-box line but has no section marked bkit practice passes the 'rules box iff the starter holds one' check, because hasPractice scans the whole file and counts the rules-box line itself. Done when: hasPractice reads only the ## sections below the rules box (the body map), so a rules-box line with no practice section and a practice section with no rules-box line both add a problem.","source":".bkit/core/engine/install/project-docs.test.ts:396"}
+{"schema":3,"ts":1794663307644,"firstTs":1794663307644,"updates":1,"kind":"deferral","key":"887-review-doc-starters-challenge-low-bkit-core-engine-install-project-docs-test-ts-476","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["887-review-doc-starters"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"An ASCII lane diagram drawn with │, ─, └, ┘, ├ or ► (or in an indented code block or a ~~~ fence) passes 'testing ... has no box-drawing diagram', because boxDrawingLines looks only for [▼▲┌┐] inside triple-backtick fences","description":"LOW build challenge finding at .bkit/core/engine/install/project-docs.test.ts:476: An ASCII lane diagram drawn with │, ─, └, ┘, ├ or ► (or in an indented code block or a ~~~ fence) passes 'testing ... has no box-drawing diagram', because boxDrawingLines looks only for [▼▲┌┐] inside triple-backtick fences. Done when: boxDrawingLines flags any Unicode box-drawing character (U+2500-U+257F) or triangle arrowhead (▲, ▼, ►, ◄) inside any non-Mermaid code block, indented code blocks and ~~~ fences included, without flagging the ● / ○ phase symbols of the register row.","source":".bkit/core/engine/install/project-docs.test.ts:476"}
