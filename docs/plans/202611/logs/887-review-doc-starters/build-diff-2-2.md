diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 7b8ef4263..39c87d201 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -484,6 +484,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/architecture.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Architecture\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -494,6 +499,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/technology.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Technology\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -554,6 +564,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/design.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Design\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -574,6 +589,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/setup.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Setup\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -587,7 +607,7 @@ const ADOPTED: Record<string, Entry> = {
       {
         kind: "adapt",
         what: "remove the template's copy instructions",
-        region: { template: ["> Example document.", "# Components"], copy: ["", ""] },
+        region: { template: ["> Starter document.", "# Components"], copy: ["", ""] },
       },
       {
         kind: "adapt",
diff --git a/.bkit/core/engine/audits/templates/templates-content.test.ts b/.bkit/core/engine/audits/templates/templates-content.test.ts
index 4af766b26..0e0430a28 100644
--- a/.bkit/core/engine/audits/templates/templates-content.test.ts
+++ b/.bkit/core/engine/audits/templates/templates-content.test.ts
@@ -713,7 +713,7 @@ describe("templates", () => {
     expect(templates).toContain(path.join(".github", "workflows", "bkit-ci.yml"));
     for (const rel of templates) {
       const text = fs.readFileSync(path.join(root, rel), "utf-8");
-      expect(text, rel).toMatch(/Example/);
+      expect(text, rel).toMatch(/Example|Starter document\./);
       expect(text, rel).toMatch(/does not write this file|does not write it/);
     }
   });
diff --git a/.bkit/core/engine/audits/templates/templates.test.ts b/.bkit/core/engine/audits/templates/templates.test.ts
index fc240db24..0a866393f 100644
--- a/.bkit/core/engine/audits/templates/templates.test.ts
+++ b/.bkit/core/engine/audits/templates/templates.test.ts
@@ -108,11 +108,31 @@ function unresolvedBkitDocAnchors(content: string): string[] {
 }
 
 /** Starter sections no audit can check, keyed `<doc> § <heading>`, each with its reason. */
+const UNAUDITED_REASON =
+  "prompts for the project's own facts; the project's content is checked by the documentation audit";
 const UNAUDITED_DOC_SECTIONS: Record<string, string> = Object.fromEntries(
-  ["architecture", "data-schema", "deployments", "setup", "technology", "testing"].map((doc) => [
-    `${doc}.md § Project facts to record`,
-    "prompts for the project's own facts; the project's content is checked by the documentation audit",
-  ]),
+  [
+    ...["data-schema", "deployments", "testing"].map(
+      (doc) => `${doc}.md § Project facts to record`,
+    ),
+    ...[
+      "Containers",
+      "Environments",
+      "File placement",
+      "Open questions",
+      "Package boundaries",
+      "System context",
+    ].map((h) => `architecture.md § ${h}`),
+    ...[
+      "Environment variables",
+      "Everyday commands",
+      "First-time setup",
+      "Local services",
+      "Open questions",
+      "Troubleshooting",
+    ].map((h) => `setup.md § ${h}`),
+    ...["Conventions", "Not used", "Open questions", "Stack"].map((h) => `technology.md § ${h}`),
+  ].map((key) => [key, UNAUDITED_REASON]),
 );
 
 /**
diff --git a/.bkit/core/engine/install/project-docs.test.ts b/.bkit/core/engine/install/project-docs.test.ts
index 6a0ebbfbc..b36b0c902 100644
--- a/.bkit/core/engine/install/project-docs.test.ts
+++ b/.bkit/core/engine/install/project-docs.test.ts
@@ -12,7 +12,9 @@ import {
   PROJECT_DOC_TOPICS,
   legacyDigest,
   legacyStarterTopic,
+  projectDocRow,
   syncProjectDocs,
+  type ProjectDocTopic,
 } from "./project-docs";
 
 const WRAPPED = [
@@ -191,3 +193,281 @@ describe("syncProjectDocs", () => {
     expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(before);
   });
 });
+
+// ---------------------------------------------------------------------------
+// Starter shape: every project-doc starter carries the same fill-in introduction,
+// rules box and skeleton.
+// ---------------------------------------------------------------------------
+
+const ADOPTION_HEADING = "## Project docs — adoption order";
+
+/** Arrow sources into each doc's node, read from the adoption-order chart. */
+function adoptionArrows(): { solid: Map<string, string[]>; dotted: Map<string, string[]> } {
+  const text = fs.readFileSync(path.join(getPkgRoot(), ".bkit/core/.bkit/templates.md"), "utf8");
+  const section = text.slice(text.indexOf(ADOPTION_HEADING));
+  const chart = /```mermaid\n([\s\S]*?)```/.exec(section)?.[1] ?? "";
+  const labels = new Map<string, string>();
+  for (const m of chart.matchAll(/(\w+)\["([^"]*)"\]/g)) labels.set(m[1] ?? "", m[2] ?? "");
+  const docOf = (id: string): string => {
+    const label = labels.get(id) ?? id;
+    return label.endsWith(".md") ? `docs/${label}` : `docs/${label}.md`;
+  };
+  const solid = new Map<string, string[]>();
+  const dotted = new Map<string, string[]>();
+  for (const m of chart.matchAll(/(\w+)(?:\["[^"]*"\])?\s*(-->|-\.->)\s*(\w+)/g)) {
+    const target = docOf(m[3] ?? "");
+    const into = m[2] === "-->" ? solid : dotted;
+    into.set(target, [...(into.get(target) ?? []), docOf(m[1] ?? "")]);
+  }
+  return { solid, dotted };
+}
+
+/** A starter's lines with the blockquote marker removed. */
+function starterLines(topic: string): string[] {
+  const file = path.join(getPkgRoot(), ".bkit/templates/docs", `${topic}.md`);
+  return fs
+    .readFileSync(file, "utf8")
+    .split("\n")
+    .map((l) => l.replace(/^\s*>\s?/, ""));
+}
+
+function docPaths(line: string): string[] {
+  const found: string[] = [];
+  for (const m of line.matchAll(/docs\/[a-z-]+\.md/g)) found.push(m[0]);
+  return found.sort();
+}
+
+function labelLine(lines: string[], label: string): string {
+  return lines.find((l) => l.trimStart().startsWith(`**${label}:**`)) ?? "";
+}
+
+/** The starter's index row (the last pipe-delimited cell is its Scope), or "". */
+function givenRow(lines: string[], topic: string): string {
+  const line = lines.find((l) => l.includes(`| \`docs/${topic}.md\` |`)) ?? "";
+  const from = line.indexOf(`| \`docs/${topic}.md\` |`);
+  return from === -1 ? "" : line.slice(from, line.lastIndexOf("|") + 1).trim();
+}
+
+function rowScope(row: string): string {
+  const cells = row.replace(/^\||\|$/g, "").split(" | ");
+  return (cells[cells.length - 1] ?? "").trim();
+}
+
+function purposeText(lines: string[]): string {
+  const line = lines.find((l) => l.startsWith("**Purpose:**")) ?? "";
+  return line.replace("**Purpose:**", "").trim();
+}
+
+/** Lines of each `## ` section below the title, keyed by heading. */
+function sections(lines: string[]): Map<string, string[]> {
+  const out = new Map<string, string[]>();
+  let current = "";
+  for (const l of lines.slice(titleIndex(lines) + 1)) {
+    if (l.startsWith("## ")) {
+      current = l.trim();
+      out.set(current, []);
+    } else if (current !== "") out.get(current)?.push(l);
+  }
+  return out;
+}
+
+function titleIndex(lines: string[]): number {
+  return lines.findIndex((l) => l.startsWith("# "));
+}
+
+/** Tables in a section as arrays of their body-row lines (header and separator excluded). */
+function tableBodies(section: string[]): string[][] {
+  const tables: string[][] = [];
+  let run: string[] = [];
+  for (const l of [...section, ""]) {
+    if (l.trimStart().startsWith("|")) run.push(l);
+    else if (run.length > 0) {
+      tables.push(run.slice(2));
+      run = [];
+    }
+  }
+  return tables;
+}
+
+function starterProblems(topic: string, headings: string[]): string[] {
+  const lines = starterLines(topic);
+  const title = titleIndex(lines);
+  const intro = lines.slice(0, title);
+  const rulesBox = lines.slice(
+    title + 1,
+    lines.findIndex((l, i) => i > title && l.startsWith("## ")),
+  );
+  const body = sections(lines);
+  const problems: string[] = [];
+  const need = (ok: boolean, what: string): number => (ok ? 0 : problems.push(what));
+
+  need(
+    intro.some((l) => l.startsWith("Starter document.")),
+    "opener line 'Starter document.'",
+  );
+  for (const label of [
+    "Fill these first",
+    "Finish against",
+    "Where the facts come from",
+    "If it does not apply",
+    "Completion checks",
+  ])
+    need(
+      intro.some((l) => l.trimStart().startsWith(`**${label}:**`)),
+      `intro label ${label}`,
+    );
+  need(
+    intro.some((l) => /^\d+\.\s/.test(l)),
+    "numbered fill steps",
+  );
+  need(!intro.some((l) => l.startsWith("#")), "no heading in the introduction");
+  for (const label of ["Purpose", "Not here", "Update when"])
+    need(
+      rulesBox.some((l) => l.startsWith(`**${label}:**`)),
+      `rules box ${label}`,
+    );
+  const purpose = purposeText(lines);
+  need(purpose !== "", "Purpose line has text");
+  need(!/Read before|Read when/.test(purpose), "Purpose line holds no Read before / Read when");
+  const hasPractice = lines.some((l) => l.startsWith("**bkit practice:**"));
+  const boxPractice = rulesBox.some((l) => l.startsWith("**bkit practice:**"));
+  need(
+    hasPractice === boxPractice,
+    "bkit practice marker in the rules box iff the starter holds one",
+  );
+  need(body.has("## Open questions"), "## Open questions");
+  for (const h of headings) need(body.has(h), `heading ${h}`);
+  need(!body.has("## Project facts to record"), "no ## Project facts to record");
+  const skeleton = [...body.values()].flat().join("\n");
+  need(/\[[^\]]+\](?!\()/.test(skeleton), "bracketed fields in the skeleton");
+  for (const [heading, sectionLines] of body) {
+    if (sectionLines.some((l) => l.startsWith("**bkit practice:**"))) continue;
+    for (const rows of tableBodies(sectionLines)) {
+      if (topic === "noise") need(rows.length === 0, `${heading}: header-only table`);
+      else
+        need(
+          rows.some((r) => r.includes("[e.g.,")),
+          `${heading}: a [e.g., row in every table`,
+        );
+    }
+  }
+  return problems;
+}
+
+/** Problems with the Fill these first / Finish against lines against the adoption chart. */
+function adoptionProblems(topic: string): string[] {
+  const lines = starterLines(topic);
+  const { solid, dotted } = adoptionArrows();
+  const target = `docs/${topic}.md`;
+  const problems: string[] = [];
+  const pairs: [string, string[]][] = [
+    ["Fill these first", [...(solid.get(target) ?? [])].sort()],
+    ["Finish against", [...(dotted.get(target) ?? [])].sort()],
+  ];
+  for (const [label, want] of pairs) {
+    const line = labelLine(lines, label);
+    const got = docPaths(line);
+    if (JSON.stringify(got) !== JSON.stringify(want))
+      problems.push(`${label}: got ${got.join(", ")}, want ${want.join(", ")}`);
+    if (want.length === 0 && !/none/i.test(line)) problems.push(`${label}: says none`);
+  }
+  return problems;
+}
+
+/** Every mismatch of a starter against the shared shape; empty when it conforms. */
+function starterShape(topic: string, headings: string[]): Record<string, string[]> {
+  const lines = starterLines(topic);
+  const row = givenRow(lines, topic);
+  const rowProblems: string[] = [];
+  if (topic !== "components" && row !== projectDocRow(topic as ProjectDocTopic))
+    rowProblems.push(`register row is not projectDocRow(${topic}): ${row}`);
+  if (rowScope(row) !== purposeText(lines))
+    rowProblems.push("register row Scope differs from the Purpose line");
+  return {
+    shape: starterProblems(topic, headings),
+    adoption: adoptionProblems(topic),
+    row: rowProblems,
+  };
+}
+
+const CONFORMS = { shape: [], adoption: [], row: [] };
+
+describe("starter docs", () => {
+  it("starter shape: components", () => {
+    expect(
+      starterShape("components", ["## Repository purpose", "## Constraints", "## Open questions"]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("components register row Scope equals its Purpose line", () => {
+    const lines = starterLines("components");
+    const row = givenRow(lines, "components");
+    expect(row).not.toBe("");
+    expect(rowScope(row)).toBe(purposeText(lines));
+    expect(purposeText(lines)).not.toBe("");
+  });
+
+  it("components Fill these first matches the adoption order", () => {
+    expect(docPaths(labelLine(starterLines("components"), "Fill these first"))).toEqual([
+      "docs/idea.md",
+    ]);
+    expect(adoptionProblems("components")).toEqual([]);
+  });
+
+  it("starter shape: technology", () => {
+    expect(
+      starterShape("technology", [
+        "## Stack",
+        "## Conventions",
+        "## Not used",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("starter shape: design", () => {
+    expect(
+      starterShape("design", [
+        "## Tokens",
+        "## Typography",
+        "## Spacing and layout",
+        "## Components",
+        "## Accessibility",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("starter shape: architecture", () => {
+    expect(
+      starterShape("architecture", [
+        "## System context",
+        "## Containers",
+        "## Package boundaries",
+        "## File placement",
+        "## Environments",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("starter shape: setup", () => {
+    expect(
+      starterShape("setup", [
+        "## Prerequisites",
+        "## First-time setup",
+        "## Environment variables",
+        "## Local services",
+        "## Everyday commands",
+        "## Troubleshooting",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("setup index row marks Build and Debug as read when relevant", () => {
+    const row = projectDocRow("setup");
+    expect(row).toContain("| — | — | ○ | ○ | — |");
+    expect(row).not.toContain("Humans only");
+  });
+});
diff --git a/.bkit/core/engine/install/project-docs.ts b/.bkit/core/engine/install/project-docs.ts
index af01cbfbc..415984d98 100644
--- a/.bkit/core/engine/install/project-docs.ts
+++ b/.bkit/core/engine/install/project-docs.ts
@@ -44,12 +44,13 @@ interface TopicInfo {
 const TOPIC_INFO: Record<ProjectDocTopic, TopicInfo> = {
   architecture: {
     phases: ["●", "●", "●", "○", "○"],
-    scope: "System design — service boundaries, deployment topology, integration sketch.",
+    scope:
+      "How the system is built and where it runs: runtimes, package boundaries, file placement and environments.",
   },
   technology: {
     phases: ["●", "●", "○", "○", "○"],
     scope:
-      "Chosen frameworks, libraries, styling systems, coding conventions. Why a choice was made goes in `decisions.jsonl`.",
+      "Which frameworks, libraries and styling systems the project uses, and the coding conventions a reviewer enforces. Why a choice was made goes in `decisions.jsonl`.",
   },
   security: {
     phases: ["●", "●", "●", "○", "○"],
@@ -77,7 +78,8 @@ const TOPIC_INFO: Record<ProjectDocTopic, TopicInfo> = {
   },
   design: {
     phases: ["○", "○", "○", "—", "—"],
-    scope: "Design system — palette, typography, components, spacing, a11y, layout tokens.",
+    scope:
+      "The project's design system: tokens, typography, spacing and layout, components and accessibility rules.",
   },
   noise: {
     phases: ["—", "—", "○", "●", "○"],
@@ -85,8 +87,9 @@ const TOPIC_INFO: Record<ProjectDocTopic, TopicInfo> = {
       "Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds.",
   },
   setup: {
-    phases: ["—", "—", "—", "—", "—"],
-    scope: "Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.",
+    phases: ["—", "—", "○", "○", "—"],
+    scope:
+      "How a developer sets up and runs the project locally: prerequisites, first-time setup, environment variables, local services, everyday commands and troubleshooting.",
   },
 };
 
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 3c1077581..d334b5a60 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -207,3 +207,4 @@
 {"schema":3,"ts":1794610706525,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":17,"lastConfirmed":1794610706525}
 {"schema":3,"ts":1794616434019,"kind":"friction","key":"ledgers-append/plan-generate-deferrals","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate"},"references":["887-review-doc-starters","https://github.com/cbartens/bkit/issues/887"],"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"plan-generate cannot write deferral rows under its step invocation","description":"In /bkit-plan #887 run 2, @bkit-plan-generate ran `bkit ledgers append --ledger=deferrals` with the step invocation from `bkit status invocation --step=plan-generate`. The engine refused the batch (exit 8: the plan orchestrator does not write deferral rows) because the invocation carries no subagent, so the rows count as written by the orchestrator. Seven rows were lost: reference updates for six 887-* Out of Scope deferrals and moving 864-...-project-docs-ts-429 to TRIAGED. The decision row from the same agent landed but with no subagent or model in `by`.","source":"orchestrator","status":"OPEN","recurrenceCount":1}
 {"schema":3,"ts":1794617726109,"kind":"friction","key":"ledgers-check/plan-summary-unbackticked","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-summary"},"references":["887-review-doc-starters","https://github.com/cbartens/bkit/issues/887"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"plan-update wrote the Ledger rows line with bare keys, which ledgers check reads as unfilled","description":"In /bkit-plan #887 run 2, @bkit-plan-update wrote `**Ledger rows:**` with 15 bare keys. `bkit ledgers check` only reads backticked keys, so it exited 11 with `is unfilled` though every key was on disk. Neither plan-check nor the update agent caught it; the orchestrator added the backticks and the check passed.","source":"orchestrator","status":"OPEN","recurrenceCount":1}
+{"schema":3,"ts":1794638603554,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"acknowledges only complete selected blocks on verified routes\", `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"reserves notices inside conservative host budgets\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"efc2e5a5eaf9dac459eebceed27d170bd50f5066"},"recurrenceCount":3,"lastConfirmed":1794638603554}
diff --git a/.bkit/templates/docs/architecture.md b/.bkit/templates/docs/architecture.md
index 63df08fd3..543a4c3a7 100644
--- a/.bkit/templates/docs/architecture.md
+++ b/.bkit/templates/docs/architecture.md
@@ -1,21 +1,98 @@
-# Architecture
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/architecture.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/technology.md`.
+>
+> **Finish against:** none.
+>
+> **Where the facts come from:** the repository's top-level folders and package manifests, the build and deploy configuration, the CI configuration and the infrastructure files.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/architecture.md`.
+> 2. List the top-level source folders and the package manifests, and group them into runtimes: parts that run in one process or one place.
+> 3. Draw `## System context` as one chart with a `subgraph` per runtime, and name each runtime and external system as the tables below name them.
+> 4. Fill `## Containers` with one row per runtime and what it owns.
+> 5. Fill `## Package boundaries` with who may call whom, and name the check that enforces each boundary.
+> 6. Fill `## File placement` with one row per kind of file the repository holds. Agents place every new file by this table.
+> 7. Fill `## Environments` with where each part runs. Leave each environment's branch, URL and release trigger to `docs/deployments.md`.
+> 8. Record unresolved facts under `## Open questions`.
+> 9. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/architecture.md` | ● | ● | ● | ○ | ○ | How the system is built and where it runs: runtimes, package boundaries, file placement and environments. |
+> 10. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** every project has a structure. Write `Not applicable: {reason}` under a section that does not apply, such as `## Package boundaries` for a single-package repository.
+>
+> **Completion checks:**
+>
+> - Exactly one Mermaid chart, and it renders in a Mermaid-capable viewer.
+> - Every runtime in the chart has a row in `## Containers`.
+> - Every top-level source folder appears in a row of `## File placement`.
+> - Every environment names where it runs, with no branch, URL or release trigger.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/architecture.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Architecture
 
 > [!CAUTION]
-> **Purpose:** The system design: service boundaries, deployment topology and an integration sketch.
+> **Purpose:** How the system is built and where it runs: runtimes, package boundaries, file placement and environments.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
-> - Hold topology and boundaries only. Operational rules and library lists go in the domain docs.
-> - Update this file when a package is added or removed, or a boundary shifts.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
+> - Hold topology and boundaries only. Library lists and operational rules go in the domain docs.
+> - Cite the repository evidence for each fact: a path, a configuration file or a CI job.
+>
+> **Not here:** The chosen libraries go in `docs/technology.md`. Each environment's branch, URL and release trigger go in `docs/deployments.md` § Environments. Purpose-based responsibilities go in `docs/components.md`.
+>
+> **Update when:** A package, runtime or kind of file is added or removed, a boundary shifts, or an environment is added or removed.
+
+## System context
+
+[The runtimes of the system and the external systems each one talks to. The arrows show which part calls which.]
+
+```mermaid
+flowchart LR
+    subgraph CLIENT["Client runtime"]
+        UI["User interface"]
+    end
+    subgraph SERVER["Server runtime"]
+        API["Report service"]
+    end
+    STORE["Record storage"]
+    UI --> API
+    API --> STORE
+```
+
+## Containers
+
+<!-- prettier-ignore -->
+| Runtime | Owns | Talks to |
+| --- | --- | --- |
+| [Runtime name] | [What it is responsible for.] | [Other runtimes and external systems.] |
+| [e.g., Report service] | Report preparation and saving. | The user interface and record storage. |
+
+## Package boundaries
+
+<!-- prettier-ignore -->
+| Package or folder | May call | Must not call | Enforced by |
+| --- | --- | --- | --- |
+| [Package or folder] | [What it may depend on.] | [What it must not depend on.] | [Check or review step.] |
+| [e.g., Report service] | The shared library. | The user interface. | The import-boundary lint rule. |
+
+## File placement
+
+<!-- prettier-ignore -->
+| Kind of file | Goes in | Naming |
+| --- | --- | --- |
+| [Kind of file] | [Folder.] | [Name pattern.] |
+| [e.g., Unit test] | Next to the file it tests. | The source file's name with a test suffix. |
+
+## Environments
 
-## Project facts to record
+<!-- prettier-ignore -->
+| Environment | Hosting | Data store | Who uses it |
+| --- | --- | --- | --- |
+| [Environment] | [Where the parts run.] | [Which store it uses.] | [Who uses it.] |
+| [e.g., Production] | A managed hosting platform. | The production database. | End users. |
 
-Replace this section with the project's own content. Cite the repository evidence for each fact (a path, a config file, a CI job).
+## Open questions
 
-- Services, packages or apps, and what each one owns.
-- Boundaries and who may call whom.
-- Deployment topology: where each part runs.
-- An integration sketch: the main data flows between parts.
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/components.md b/.bkit/templates/docs/components.md
index 598a27e2e..707d7cd45 100644
--- a/.bkit/templates/docs/components.md
+++ b/.bkit/templates/docs/components.md
@@ -1,19 +1,26 @@
-> Example document. The populated `docs/components.md` belongs to the project. `bkit install` does not write this file and does not overwrite a copy.
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/components.md`, fill it in, then delete this introduction.
 >
-> **Populate this document:**
+> **Fill these first:** `docs/idea.md`.
 >
-> 1. Copy this template to `docs/components.md`.
-> 2. Read the relevant documents listed in `.agents/docs.md`, plus the repository's README and any product guide or approved specification.
-> 3. **If** an implementation exists → check its main entry points and representative behavior against those documents before describing anything as current.
+> **Finish against:** none.
+>
+> **Where the facts come from:** `docs/idea.md`, the repository's README, any approved specification and, once code exists, its main entry points.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/components.md`.
+> 2. Read `docs/idea.md`, the README and any approved specification.
+> 3. **If** an implementation exists → check its main entry points and representative behavior against those sources before describing anything as current.
 > 4. **If** no implementation exists → use the approved specification as the source for a planned view.
 > 5. **If** neither source establishes the purpose, intended users or main journey → ask the owner for that missing context before filling the affected sections.
 > 6. Select components by distinct responsibilities or outcomes, including supporting work the main journeys depend on. Code that serves one purpose can share a component; separate a responsibility when it has its own outcome or a meaningful handoff.
-> 7. Replace the bracketed fields and example content with the project's facts, keeping the rules header.
-> 8. Omit optional sections that do not apply, including delivery and ownership for a repository without distinct distributed content. Core, Shared and Templates are examples, not required categories.
-> 9. Record unresolved facts as open questions in Scope, separate from current behavior and approved plans.
-> 10. Register `docs/components.md` under `Project Documents` in `.agents/docs.md`, with conditional reads for Design, Plan, Build, Debug and Ship.
-> 11. Check the populated document against each completion check below.
-> 12. Remove this introduction and its completion checks from the adopted document.
+> 7. Replace the bracketed fields and example rows with the project's facts, keeping the rules box.
+> 8. Fill `## Constraints` from `docs/idea.md`, and name the source of each row.
+> 9. Record unresolved facts under `## Open questions`, separate from current behavior and approved plans.
+> 10. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/components.md` | ○ | ● | ○ | ○ | ○ | A purpose-based view of what the repository does, its major responsibilities and how they work together, readable without inspecting the code. |
+> 11. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** every repository has components. Write `Not applicable: {reason}` under a section that does not apply, such as Delivery and ownership for a repository without distinct distributed content. Core, Shared and Templates are examples, not required categories.
 >
 > **Completion checks:**
 >
@@ -23,6 +30,7 @@
 > - Exactly one Mermaid chart uses names consistent with the tables and explains what its arrows mean.
 > - The chart renders in a Mermaid-capable viewer.
 > - Every claimed current responsibility is supported by the implementation or project evidence; planned responsibilities and unknowns are labelled separately.
+> - Every constraint names its source in `docs/idea.md`.
 > - References link to existing documents; missing optional views are marked as unavailable rather than linked to nonexistent files.
 > - Implementation detail stays in its canonical document rather than being copied into this overview.
 > - No instructional placeholders or unrelated example content remain.
@@ -34,12 +42,15 @@
 >
 > **Rules:**
 >
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
 > - Group components by the purpose they serve, independently of files, packages and deployment units.
 > - Describe each component's responsibility and its relationships in plain language.
-> - Keep implementation boundaries and deployment topology in `docs/architecture.md`.
-> - Reference `docs/capabilities.md` when present for implementation ownership and drift. Components and capabilities may have different names, counts and boundaries.
 > - Distinguish current behavior from agreed scope, proposals and later candidates.
-> - Update this document when the repository's purpose, responsibilities or main journeys change.
+> - Components and capabilities may have different names, counts and boundaries.
+>
+> **Not here:** Implementation boundaries and deployment topology go in `docs/architecture.md`. Implementation ownership and drift go in `docs/capabilities.md` when present. Issue state and delivery plans stay in the tracker.
+>
+> **Update when:** The repository's purpose, responsibilities, constraints or main journeys change.
 
 ## Repository purpose
 
@@ -47,6 +58,20 @@
 
 [The core concepts expressed as responsibilities, with links to the existing product guide or specification for detail.]
 
+## Constraints
+
+[The platforms, offline behavior, live-update needs, scale and hard external requirements the repository must meet.]
+
+<!-- prettier-ignore -->
+| Constraint | What it requires | Source in `docs/idea.md` |
+| --- | --- | --- |
+| [Constraint] | [What it requires of the repository.] | [The `docs/idea.md` passage that states it.] |
+| [e.g., Works offline] | Reports open and save without a network connection. | The "Field use" notes. |
+
+## Open questions
+
+[Each unresolved fact, who can answer it and which section it affects.]
+
 ## Primary workflows
 
 [The main workflows, including any optional stages, direct entry points and recovery paths.]
@@ -112,5 +137,6 @@ flowchart LR
 | `docs/architecture.md`, when present | How is the system implemented and deployed? |
 | `docs/capabilities.md`, when present | Where is a capability implemented, and do callers use its owner? |
 | `floorplan/`, when present | How can I explore the code's files, connections and guided flows? |
+| [e.g., Product guide] | What does the product do, for whom? |
 
 [Links to the available views above and the repository's product guide or specification. Missing views identified as unavailable.]
diff --git a/.bkit/templates/docs/design.md b/.bkit/templates/docs/design.md
index 39e2270c6..d9aeeec28 100644
--- a/.bkit/templates/docs/design.md
+++ b/.bkit/templates/docs/design.md
@@ -1,28 +1,111 @@
-# Design
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/design.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/components.md`.
+>
+> **Finish against:** `docs/technology.md`, once it names the styling tool; the token table in `## Tokens` waits for it.
+>
+> **Where the facts come from:** the stylesheet variables and theme files, the rendered style guide or design files, the user interface components in the repository and the accessibility settings.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/design.md`.
+> 2. **If** the project has no user interface → write `Not applicable: no user interface` under the title, keep the rules box, and go to step 9.
+> 3. Fill `## Tokens` with one row per colour, spacing and sizing variable, read from the implementation.
+> 4. Fill `## Typography` with the font families, sizes and weights in use.
+> 5. Fill `## Spacing and layout` with the scale, breakpoints and layout rules.
+> 6. Fill `## Components` with the shared interface components and when each is used.
+> 7. Confirm or change each default in `## Accessibility`.
+> 8. Follow the steps in `## Machine-checked reference` for the token table the gates read, and keep its two rules.
+> 9. Record unresolved facts under `## Open questions`.
+> 10. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/design.md` | ○ | ○ | ○ | — | — | The project's design system: tokens, typography, spacing and layout, components and accessibility rules. |
+> 11. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** write `Not applicable: no user interface` under the title and delete the skeleton sections.
+>
+> **Completion checks:**
+>
+> - Every token in the implementation has a row in `## Tokens`, or an entry that says why it is undocumented.
+> - Every default in `## Accessibility` is confirmed or replaced.
+> - The token table in `## Machine-checked reference` has a header row and no row left as an example.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/design.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Design
 
 > [!CAUTION]
-> **Purpose:** The design system: palette, typography, components, spacing, a11y and layout tokens.
+> **Purpose:** The project's design system: tokens, typography, spacing and layout, components and accessibility rules.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
-> - Use theme tokens only, with no ad-hoc hex.
-> - All colours must support Dark Mode.
-> - Touch targets must be >=44x44px.
-> - Contrast must meet WCAG 2.1 AA.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
+> - Name each token once, in the table that holds its value.
+> - Mark a value read from the implementation as transcribed until a human confirms it.
+>
+> **bkit practice:** `## Machine-checked reference` keeps its heading and its two rules, because the gates audit and the CI workflow cite it.
+>
+> **Not here:** Test lanes and design assertions go in `docs/testing.md`. The styling tool and its version go in `docs/technology.md`. Component ownership goes in `docs/components.md`.
+>
+> **Update when:** A token, a font, a shared component or an accessibility rule is added, changed or removed.
+
+## Tokens
+
+[The colour, spacing and sizing variables, read from the implementation, with the light and dark value of each.]
+
+<!-- prettier-ignore -->
+| Token | Light | Dark | Use |
+| --- | --- | --- | --- |
+| [Token name] | [Light value.] | [Dark value.] | [Where it is used.] |
+| [e.g., Background] | The page surface colour. | The dark page surface colour. | Page surface. |
+
+## Typography
+
+<!-- prettier-ignore -->
+| Role | Family | Size and weight | Use |
+| --- | --- | --- | --- |
+| [Role] | [Font family.] | [Size and weight.] | [Where it is used.] |
+| [e.g., Body text] | The project's text font. | Regular, base size. | Paragraphs. |
+
+## Spacing and layout
+
+[The spacing scale, the breakpoints and the layout rules the interface follows.]
+
+<!-- prettier-ignore -->
+| Step | Value | Use |
+| --- | --- | --- |
+| [Step name] | [Value.] | [Where it is used.] |
+| [e.g., Small gap] | The scale's second step. | Between a label and its field. |
+
+## Components
+
+<!-- prettier-ignore -->
+| Component | Use it for | Do not use it for |
+| --- | --- | --- |
+| [Component] | [When to use it.] | [What to use instead.] |
+| [e.g., Primary button] | The one main action of a screen. | A second action on the same screen. |
+
+## Accessibility
+
+[Each default below is a starting point. Confirm it or change it, and say why when it changes.]
+
+- [Default: every colour comes from a theme token, with no ad-hoc hex value.]
+- [Default: every colour supports a dark mode.]
+- [Default: touch targets are at least 44 by 44 pixels.]
+- [Default: text contrast meets WCAG 2.1 level AA.]
 
 ## Machine-checked reference
 
-This table is the sole hand-maintained source for token values. Nothing generates it, so changing an expected value forces a human to restate the intent in the same PR diff. To keep the gate honest:
+> **bkit practice:** This table is the sole hand-maintained source for token values. Nothing generates it, so changing an expected value forces a human to restate the intent in the same pull request. Keep the section heading, because the gates audit and the CI workflow cite it.
+
+Fill it in this way:
 
-- **Select the table by its header row**, never by "any row containing a hex", because this doc may hold >1 hex table. Renaming the header renames the contract, so update the parser in the same change.
+- **Select the table by its header row**, never by "any row containing a hex", because this document may hold more than one hex table. Renaming the header renames the contract, so update the parser in the same change.
 - **Assert each implementation separately** (stylesheet variables, theme object, rendered style guide), so a red names its own culprit.
-- **No silent gap.** Every implementation token maps to a row here, or to an explicit "intentionally undocumented" entry with a reason. A dropped token must red, not vanish.
-- **Transcribed != ratified.** A row read out of the implementation is tautological on day one, so mark it as transcribed until a human confirms the value is intended.
 
-An example shape follows. Choose your own columns, then pin them, because the header row is the contract:
+Two rules survive adoption:
+
+- **No silent gap.** Every implementation token maps to a row here, or to an explicit "intentionally undocumented" entry with a reason. A dropped token must go red, not vanish.
+- **Transcribed is not ratified.** A row read out of the implementation is tautological on day one, so mark it as transcribed until a human confirms the value is intended.
+
+Choose your own columns, then pin them, because the header row is the contract. An example shape:
 
 <!-- prettier-ignore -->
 | Token | Light | Dark | Use |
@@ -32,3 +115,7 @@ An example shape follows. Choose your own columns, then pin them, because the he
 | Primary (`--primary`) | `#2563EB` | `#2563EB` | Aligned L+D — buttons / active. **Transcribed-not-ratified**: read from source, pending human confirmation |
 
 Lane map, tagging, cache rules: `testing.md` § "Design assertions are a dimension, not a lane".
+
+## Open questions
+
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/setup.md b/.bkit/templates/docs/setup.md
index e4e7c5621..45c904f38 100644
--- a/.bkit/templates/docs/setup.md
+++ b/.bkit/templates/docs/setup.md
@@ -1,20 +1,93 @@
-# Setup
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/setup.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/technology.md`.
+>
+> **Finish against:** `docs/architecture.md` for `## Local services`, and `docs/security.md` for `## Environment variables`; both sections wait for the secrets and services those docs name.
+>
+> **Where the facts come from:** the package manifests and their scripts, the example environment file, the local service configuration, the CI configuration and a clean checkout run on a fresh machine.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/setup.md`.
+> 2. Fill `## Prerequisites` with the tools a developer installs first, and name the file that holds each required version.
+> 3. Run the setup on a clean checkout, and write each command into `## First-time setup` in the order that worked.
+> 4. Fill `## Environment variables` with what a developer sets on their own machine. Write names and where each value comes from, and never a secret value.
+> 5. Fill `## Local services` with each local service, its start command and its reset command. An integration test run needs both.
+> 6. Fill `## Everyday commands` with the commands a developer runs most, read from the manifest scripts.
+> 7. Fill `## Troubleshooting` with the failures new contributors hit and the fix for each.
+> 8. Record unresolved facts under `## Open questions`.
+> 9. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/setup.md` | — | — | ○ | ○ | — | How a developer sets up and runs the project locally: prerequisites, first-time setup, environment variables, local services, everyday commands and troubleshooting. |
+> 10. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** write `Not applicable: {reason}` under a section that does not apply, such as `## Local services` for a project with none.
+>
+> **Completion checks:**
+>
+> - The first-time commands ran in order on a clean checkout.
+> - Every local service has a start command and a reset command.
+> - No secret value appears in the document.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/setup.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Setup
 
 > [!CAUTION]
-> **Purpose:** Local development setup for humans: CLIs, configuration, secrets and troubleshooting.
+> **Purpose:** How a developer sets up and runs the project locally: prerequisites, first-time setup, environment variables, local services, everyday commands and troubleshooting.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
-> - Local seed / test fixtures must NEVER run against remote projects.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
+> - Never write a secret value. Write its name and where it comes from.
+> - Local seed data and test fixtures must NEVER run against a remote project.
+>
+> **Not here:** Secret names, stores and rotation go in `docs/security.md` § Secrets. How a deployed environment gets its configuration goes in `docs/deployments.md` § Secrets and env config. Agent host and remote access setup is in `.bkit/install.md`.
+>
+> **Update when:** A prerequisite, a setup command, an environment variable, a local service or a script changes.
+
+## Prerequisites
+
+<!-- prettier-ignore -->
+| Tool | Needed for | Version from |
+| --- | --- | --- |
+| [Tool] | [What it is used for.] | [File that holds the version.] |
+| [e.g., Language runtime] | Running and testing the project. | The version file in the repository root. |
+
+## First-time setup
+
+1. [The first command, and what it does.]
+2. [The next command, and what it does.]
+
+## Environment variables
+
+<!-- prettier-ignore -->
+| Variable | Used by | Where the value comes from |
+| --- | --- | --- |
+| [Variable name] | [What reads it.] | [Where a developer gets the value.] |
+| [e.g., DATABASE_URL] | The local database client. | The example environment file. |
+
+## Local services
+
+<!-- prettier-ignore -->
+| Service | Start command | Reset command |
+| --- | --- | --- |
+| [Service] | [Command that starts it.] | [Command that resets it to a clean state.] |
+| [e.g., Local database] | The project's start script. | The project's reset script. |
+
+## Everyday commands
+
+<!-- prettier-ignore -->
+| Task | Command |
+| --- | --- |
+| [Task] | [Command.] |
+| [e.g., Run the unit tests] | The project's test script. |
+
+## Troubleshooting
 
-## Project facts to record
+<!-- prettier-ignore -->
+| Symptom | Cause | Fix |
+| --- | --- | --- |
+| [What the developer sees.] | [Why it happens.] | [What to do.] |
+| [e.g., The database connection is refused] | The local database is not running. | Start the local services. |
 
-Replace this section with the project's own content.
+## Open questions
 
-- The CLIs and versions a developer installs.
-- Configuration files and environment variables, and where their values come from.
-- Troubleshooting steps for the failures new contributors hit.
-- Agent host and remote access setup is in `.bkit/install.md`; the template copy-and-own steps are in `.bkit/templates.md`.
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/technology.md b/.bkit/templates/docs/technology.md
index 53d116260..9bcdb0d1c 100644
--- a/.bkit/templates/docs/technology.md
+++ b/.bkit/templates/docs/technology.md
@@ -1,19 +1,70 @@
-# Technology
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/technology.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/components.md`.
+>
+> **Finish against:** none.
+>
+> **Where the facts come from:** the package manifests and lockfiles, the build and tool configuration files, the CI configuration and the lint and format settings.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/technology.md`.
+> 2. List every layer the components in `docs/components.md` need, and read each layer's technology from the manifest or configuration file that declares it.
+> 3. Fill `## Stack` with one row per technology. In `Version from`, name the file that holds the version, and never type the number.
+> 4. Fill `## Conventions` with each rule a reviewer enforces, and name the tool or review step that enforces it.
+> 5. Fill `## Not used` with technologies a contributor might expect, and name what the project uses instead.
+> 6. Record unresolved facts under `## Open questions`.
+> 7. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/technology.md` | ● | ● | ○ | ○ | ○ | Which frameworks, libraries and styling systems the project uses, and the coding conventions a reviewer enforces. Why a choice was made goes in `decisions.jsonl`. |
+> 8. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** every project uses some technology. Write `Not applicable: {reason}` under a section that does not apply, such as `## Not used` for a project with no alternatives in play.
+>
+> **Completion checks:**
+>
+> - Every layer in `docs/components.md` has a row in `## Stack`.
+> - Every `Version from` cell names an existing file, and no version number is typed in the document.
+> - Every convention names what enforces it.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/technology.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Technology
 
 > [!CAUTION]
-> **Purpose:** The project's chosen frameworks, libraries, styling systems and coding conventions. Why a choice was made goes in `decisions.jsonl`.
+> **Purpose:** Which frameworks, libraries and styling systems the project uses, and the coding conventions a reviewer enforces. Why a choice was made goes in `decisions.jsonl`.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
-> - List each technology and how it is used. Put the reason for a choice in `decisions.jsonl`.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
+> - Name the file that holds a version, and never type a version number.
+> - List each technology once, with how it is used.
+>
+> **Not here:** The reason for a choice goes in `decisions.jsonl`. Service boundaries and deployment topology go in `docs/architecture.md`. Setup commands go in `docs/setup.md`.
+>
+> **Update when:** A framework, library or styling system is added, replaced or removed, or a convention a reviewer enforces changes.
+
+## Stack
+
+<!-- prettier-ignore -->
+| Layer | Technology | Version from | Chosen for |
+| --- | --- | --- | --- |
+| [Layer] | [Technology] | [File that holds the version.] | [What it is used for.] |
+| [e.g., Web interface] | A component framework | The package manifest. | Rendering the report screens. |
+
+## Conventions
+
+<!-- prettier-ignore -->
+| Convention | Rule | Enforced by |
+| --- | --- | --- |
+| [Convention] | [What a contributor does.] | [Tool or review step.] |
+| [e.g., Formatting] | One formatter settings file for the whole repository. | The formatter check in CI. |
+
+## Not used
 
-## Project facts to record
+<!-- prettier-ignore -->
+| Technology | Use instead |
+| --- | --- |
+| [Technology a contributor might expect] | [What the project uses.] |
+| [e.g., A second test runner] | The project's one test runner. |
 
-Replace this section with the project's own content.
+## Open questions
 
-- Runtime, language and framework versions.
-- Libraries and styling systems, and how each is used.
-- Coding conventions that a reviewer enforces.
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/dist/install/project-docs.js b/dist/install/project-docs.js
index 520c75471..0274975fb 100644
--- a/dist/install/project-docs.js
+++ b/dist/install/project-docs.js
@@ -31,11 +31,11 @@ export const PROJECT_DOC_TOPICS = [
 const TOPIC_INFO = {
     architecture: {
         phases: ["●", "●", "●", "○", "○"],
-        scope: "System design — service boundaries, deployment topology, integration sketch.",
+        scope: "How the system is built and where it runs: runtimes, package boundaries, file placement and environments.",
     },
     technology: {
         phases: ["●", "●", "○", "○", "○"],
-        scope: "Chosen frameworks, libraries, styling systems, coding conventions. Why a choice was made goes in `decisions.jsonl`.",
+        scope: "Which frameworks, libraries and styling systems the project uses, and the coding conventions a reviewer enforces. Why a choice was made goes in `decisions.jsonl`.",
     },
     security: {
         phases: ["●", "●", "●", "○", "○"],
@@ -59,15 +59,15 @@ const TOPIC_INFO = {
     },
     design: {
         phases: ["○", "○", "○", "—", "—"],
-        scope: "Design system — palette, typography, components, spacing, a11y, layout tokens.",
+        scope: "The project's design system: tokens, typography, spacing and layout, components and accessibility rules.",
     },
     noise: {
         phases: ["—", "—", "○", "●", "○"],
         scope: "Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds.",
     },
     setup: {
-        phases: ["—", "—", "—", "—", "—"],
-        scope: "Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.",
+        phases: ["—", "—", "○", "○", "—"],
+        scope: "How a developer sets up and runs the project locally: prerequisites, first-time setup, environment variables, local services, everyday commands and troubleshooting.",
     },
 };
 /** The recommended repo-relative path of a topic's project document. */
diff --git a/docs/components.md b/docs/components.md
index ece89d809..6d9211379 100644
--- a/docs/components.md
+++ b/docs/components.md
@@ -5,12 +5,15 @@
 >
 > **Rules:**
 >
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
 > - Group components by the purpose they serve, independently of files, packages and deployment units.
 > - Describe each component's responsibility and its relationships in plain language.
-> - Keep implementation boundaries and deployment topology in `docs/architecture.md`.
-> - Reference `docs/capabilities.md` when present for implementation ownership and drift. Components and capabilities may have different names, counts and boundaries.
 > - Distinguish current behavior from agreed scope, proposals and later candidates.
-> - Update this document when the repository's purpose, responsibilities or main journeys change.
+> - Components and capabilities may have different names, counts and boundaries.
+>
+> **Not here:** Implementation boundaries and deployment topology go in `docs/architecture.md`. Implementation ownership and drift go in `docs/capabilities.md` when present. Issue state and delivery plans stay in the tracker.
+>
+> **Update when:** The repository's purpose, responsibilities, constraints or main journeys change.
 
 ## Repository purpose
 
