diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 39c87d201..6347cd231 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -514,6 +514,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/security.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Security\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -524,6 +529,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/data-schema.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Data Schema\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -534,6 +544,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/testing.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Testing\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -544,6 +559,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/deployments.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Deployments\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -554,6 +574,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/observability.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Observability\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
@@ -579,6 +604,11 @@ const ADOPTED: Record<string, Entry> = {
   "docs/noise.md": {
     status: "adopted",
     edits: [
+      {
+        kind: "adapt",
+        what: "remove the starter's introduction",
+        region: { template: ["> Starter document.", "# Noise\n"], copy: ["", ""] },
+      },
       {
         kind: "adapt",
         what: "this repo's own facts, recorded over the starter",
diff --git a/.bkit/core/engine/audits/templates/templates-content.test.ts b/.bkit/core/engine/audits/templates/templates-content.test.ts
index 0e0430a28..835fc8991 100644
--- a/.bkit/core/engine/audits/templates/templates-content.test.ts
+++ b/.bkit/core/engine/audits/templates/templates-content.test.ts
@@ -713,7 +713,7 @@ describe("templates", () => {
     expect(templates).toContain(path.join(".github", "workflows", "bkit-ci.yml"));
     for (const rel of templates) {
       const text = fs.readFileSync(path.join(root, rel), "utf-8");
-      expect(text, rel).toMatch(/Example|Starter document\./);
+      expect(text, rel).toMatch(/Example|Starter document\.|Generated document\./);
       expect(text, rel).toMatch(/does not write this file|does not write it/);
     }
   });
diff --git a/.bkit/core/engine/audits/templates/templates.test.ts b/.bkit/core/engine/audits/templates/templates.test.ts
index 0a866393f..1f64bcda1 100644
--- a/.bkit/core/engine/audits/templates/templates.test.ts
+++ b/.bkit/core/engine/audits/templates/templates.test.ts
@@ -112,9 +112,6 @@ const UNAUDITED_REASON =
   "prompts for the project's own facts; the project's content is checked by the documentation audit";
 const UNAUDITED_DOC_SECTIONS: Record<string, string> = Object.fromEntries(
   [
-    ...["data-schema", "deployments", "testing"].map(
-      (doc) => `${doc}.md § Project facts to record`,
-    ),
     ...[
       "Containers",
       "Environments",
@@ -132,6 +129,21 @@ const UNAUDITED_DOC_SECTIONS: Record<string, string> = Object.fromEntries(
       "Troubleshooting",
     ].map((h) => `setup.md § ${h}`),
     ...["Conventions", "Not used", "Open questions", "Stack"].map((h) => `technology.md § ${h}`),
+    ...["Functions", "Open questions", "Overview", "[Table name]"].map(
+      (h) => `data-schema.md § ${h}`,
+    ),
+    ...["Branch protection", "Open questions", "Release path", "Secrets and env config"].map(
+      (h) => `deployments.md § ${h}`,
+    ),
+    ...[
+      "Open questions",
+      "Running locally",
+      "Stack",
+      "Test data",
+      "Test reports",
+      "Tiers this project has",
+      "Where tests live",
+    ].map((h) => `testing.md § ${h}`),
   ].map((key) => [key, UNAUDITED_REASON]),
 );
 
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index b05a4634d..36a81c360 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -301,7 +301,7 @@ export function detectBkitStubs(cwd: string): PreflightFinding[] {
       detect: `${ciRel} contains the bkit-stub:${stub.id} sentinel — a commented-in block shipped disabled by default.`,
       action:
         `${stub.description}\n\n` +
-        `Before enabling a CI lane, read docs/testing.md § CI test tiers and docs/deployments.md (one run per branch, push base, promote after the capstone). The FULL CI SCAFFOLD REFERENCE in ${ciRel} is the job graph: needs, if, step names. Write the job from that graph and from those docs. Uncomment only a block that is already commented YAML or shell.\n\n` +
+        `Before enabling a CI lane, read docs/testing.md § CI test tiers and docs/deployments.md (one run per branch, push base). The FULL CI SCAFFOLD REFERENCE in ${ciRel} is the job graph: needs, if, step names. Write the job from that graph and from those docs. Uncomment only a block that is already commented YAML or shell.\n\n` +
         `Decide with the user: (a) enable — uncomment the YAML/shell block AND delete the \`# bkit-stub:${stub.id} — ...\` header line; (b) customise — adjust paths/secrets/conditions before uncommenting; (c) dismiss — delete the entire stub block (header + commented body).\n\n` +
         `Until the sentinel is removed, this advisory fires every install / check.`,
     });
diff --git a/.bkit/core/engine/install/project-docs.test.ts b/.bkit/core/engine/install/project-docs.test.ts
index b36b0c902..84326f466 100644
--- a/.bkit/core/engine/install/project-docs.test.ts
+++ b/.bkit/core/engine/install/project-docs.test.ts
@@ -392,6 +392,38 @@ function starterShape(topic: string, headings: string[]): Record<string, string[
 
 const CONFORMS = { shape: [], adoption: [], row: [] };
 
+/** How each `## ` section of a starter is marked: a project slot, bkit practice or neither. */
+function sectionMarks(text: string): Map<string, "slot" | "practice" | "none"> {
+  const marks = new Map<string, "slot" | "practice" | "none">();
+  for (const [heading, lines] of sections(text.split("\n").map((l) => l.replace(/^\s*>\s?/, "")))) {
+    if (lines.some((l) => l.startsWith("**bkit practice:**"))) marks.set(heading, "practice");
+    else if (lines.some((l) => l.startsWith("**Project slot:**"))) marks.set(heading, "slot");
+    else marks.set(heading, "none");
+  }
+  return marks;
+}
+
+/** Fenced-code lines that hold a box-drawing character (the same set Task 14 checks). */
+function boxDrawingLines(text: string): string[] {
+  const hits: string[] = [];
+  let fenced = false;
+  for (const l of text.split("\n")) {
+    if (l.trimStart().startsWith("```")) fenced = !fenced;
+    else if (fenced && /[▼▲┌┐]/.test(l)) hits.push(l);
+  }
+  return hits;
+}
+
+function starterText(topic: string): string {
+  return fs.readFileSync(path.join(getPkgRoot(), ".bkit/templates/docs", `${topic}.md`), "utf8");
+}
+
+function unmarkedSections(topic: string): string[] {
+  return [...sectionMarks(starterText(topic))]
+    .filter(([heading, mark]) => mark === "none" && heading !== "## Open questions")
+    .map(([heading]) => heading);
+}
+
 describe("starter docs", () => {
   it("starter shape: components", () => {
     expect(
@@ -470,4 +502,114 @@ describe("starter docs", () => {
     expect(row).toContain("| — | — | ○ | ○ | — |");
     expect(row).not.toContain("Humans only");
   });
+
+  it("starter shape: security", () => {
+    expect(
+      starterShape("security", [
+        "## Trust boundaries",
+        "## Authentication",
+        "## Authorization",
+        "## Input validation",
+        "## Rate limiting",
+        "## Secrets",
+        "## PII",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("starter shape: observability", () => {
+    expect(
+      starterShape("observability", [
+        "## Signal pipeline",
+        "## Log format",
+        "## Signals",
+        "## Correlation",
+        "## Error tracking",
+        "## Alerts",
+        "## Where to look",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("starter shape: testing", () => {
+    expect(
+      starterShape("testing", [
+        "## Stack",
+        "## Tiers this project has",
+        "## Where tests live",
+        "## Test data",
+        "## CI lanes",
+        "## Test reports",
+        "## Running locally",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("testing marks every section slot or practice and has no box-drawing diagram", () => {
+    expect(unmarkedSections("testing")).toEqual([]);
+    expect(boxDrawingLines(starterText("testing"))).toEqual([]);
+    expect([...sectionMarks(starterText("testing")).values()]).toContain("practice");
+    expect(sectionMarks(starterText("testing")).get("## Test first")).toBe("practice");
+  });
+
+  it("starter shape: data-schema", () => {
+    expect(
+      starterShape("data-schema", ["## Overview", "## Functions", "## Open questions"]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("starter shape: deployments", () => {
+    expect(
+      starterShape("deployments", [
+        "## Environments",
+        "## Release path",
+        "## Secrets and env config",
+        "## Branch protection",
+        "## Open questions",
+      ]),
+    ).toEqual(CONFORMS);
+  });
+
+  it("deployments marks every section slot or practice", () => {
+    expect(unmarkedSections("deployments")).toEqual([]);
+    expect(sectionMarks(starterText("deployments")).get("## Production rollback runbook")).toBe(
+      "slot",
+    );
+    expect(sectionMarks(starterText("deployments")).get("## Dev rollback runbook")).toBe("slot");
+  });
+
+  it("starter shape: noise", () => {
+    expect(starterShape("noise", ["## Open questions"])).toEqual(CONFORMS);
+    expect(starterText("noise")).toContain(
+      "| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |",
+    );
+  });
+
+  it("capabilities names rollup and refresh and when to run each", () => {
+    const intro = starterLines("capabilities").slice(0, titleIndex(starterLines("capabilities")));
+    const rollup = intro.filter((l) => l.includes("pnpm bkit:graph:rollup")).join(" ");
+    const refresh = intro.filter((l) => l.includes("pnpm bkit:graph:refresh")).join(" ");
+    expect(rollup).toMatch(/working tree/);
+    expect(refresh).toMatch(/staged/);
+    expect(refresh).toMatch(/throwaway checkout/);
+    expect(intro.join("\n")).toMatch(/\bwhen\b/i);
+  });
+
+  it("capabilities starter has the Generated document opener, Fill these first, register row and completion checks", () => {
+    const lines = starterLines("capabilities");
+    const intro = lines.slice(0, titleIndex(lines));
+    expect(intro.some((l) => l.startsWith("Generated document."))).toBe(true);
+    expect(intro.some((l) => l.startsWith("Example output."))).toBe(false);
+    expect(adoptionArrows().solid.get("docs/capabilities.md")).toEqual(["docs/deployments.md"]);
+    expect(docPaths(labelLine(intro, "Fill these first"))).toEqual(["docs/deployments.md"]);
+    const row = givenRow(lines, "capabilities");
+    expect(row).not.toBe("");
+    expect(rowScope(row)).toBe(purposeText(lines));
+    expect(purposeText(lines)).not.toBe("");
+    expect(labelLine(intro, "Completion checks")).toContain("docs/components.md");
+    expect(intro.join("\n")).toContain("bkit-graph-drift-rules.json");
+  });
 });
diff --git a/.bkit/core/engine/install/project-docs.ts b/.bkit/core/engine/install/project-docs.ts
index 415984d98..9b8944313 100644
--- a/.bkit/core/engine/install/project-docs.ts
+++ b/.bkit/core/engine/install/project-docs.ts
@@ -55,26 +55,27 @@ const TOPIC_INFO: Record<ProjectDocTopic, TopicInfo> = {
   security: {
     phases: ["●", "●", "●", "○", "○"],
     scope:
-      "Authentication, authorization, input validation, rate limiting, secrets management, PII handling.",
+      "Authentication, authorization, input validation, rate limiting, secrets management and PII handling.",
   },
   "data-schema": {
     phases: ["○", "○", "●", "○", "○"],
     scope:
-      "Active production database schema — entities / tables, fields, access policies (e.g. RLS), indices, functions, triggers.",
+      "The active production schema: tables, fields, access policies, indices, functions and triggers.",
   },
   testing: {
     phases: ["○", "●", "●", "●", "—"],
     scope:
-      "Testing strategy — tier boundaries, framework choices, naming conventions, CI lane graph (names, needs, when a lane runs).",
+      "Testing strategy: tier boundaries, framework choices, naming conventions and the CI lane graph.",
   },
   deployments: {
     phases: ["○", "○", "○", "●", "●"],
     scope:
-      "Deployment / CI/CD — secrets, branch protection, one-run concurrency, push base, promote after the capstone.",
+      "Deployment and CI/CD: environments, release path, secrets, branch protection, run-level tiers and rollback.",
   },
   observability: {
     phases: ["○", "○", "●", "●", "○"],
-    scope: "Logging architecture, correlation tracing, telemetry pipelines, log drains.",
+    scope:
+      "Logging architecture, correlation tracing, telemetry pipelines, error tracking and alerts.",
   },
   design: {
     phases: ["○", "○", "○", "—", "—"],
@@ -84,7 +85,7 @@ const TOPIC_INFO: Record<ProjectDocTopic, TopicInfo> = {
   noise: {
     phases: ["—", "—", "○", "●", "○"],
     scope:
-      "Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds.",
+      "Intentional signal downgrades: log levels, error-tracker archives and mutes, and alert thresholds, each with its trigger and reason.",
   },
   setup: {
     phases: ["—", "—", "○", "○", "—"],
diff --git a/.bkit/templates/docs/capabilities.md b/.bkit/templates/docs/capabilities.md
index c4adfe896..bf68a576b 100644
--- a/.bkit/templates/docs/capabilities.md
+++ b/.bkit/templates/docs/capabilities.md
@@ -1,6 +1,20 @@
-> Example output. Copy it to `docs/capabilities.md` and own it. `bkit install` does not write this file and does not overwrite a copy.
+> Generated document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/capabilities.md`, build it with the command below, then delete this introduction.
 >
-> `pnpm bkit:graph:rollup` rewrites everything outside the Overrides block, so do not edit the generated body. To add a capability, add it in `scripts/graphify/bkit-graph-drift-rules.json`. How to run the tools is in `.bkit/templates.md`.
+> **Fill these first:** `docs/deployments.md`.
+>
+> **Prerequisites:** the code exists, and the graphify templates are adopted as `.bkit/templates.md` § graphify — map describes.
+>
+> **Build it:**
+>
+> 1. Copy this starter to `docs/capabilities.md`.
+> 2. Add each capability to `scripts/graphify/bkit-graph-drift-rules.json`. That file is the source of truth, and it stays hand-maintained.
+> 3. Run `pnpm bkit:graph:rollup` to build the register from the working tree. Run it while you edit, when you want to see the result before staging.
+> 4. Run `pnpm bkit:graph:refresh` to build the register from the staged files in a throwaway checkout. Run it before a commit, so the committed file matches the committed code.
+> 5. Keep only the Overrides block by hand. Every other part is rewritten on each run, so do not edit it.
+> 6. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/capabilities.md` | ● | ● | ● | — | ○ | One row per capability, with its owner module, the literal marker that finds every use of it, and whether anything bypasses the owner. |
+> 7. Check the document against each completion check, then delete this introduction.
+>
+> **Completion checks:** the register has a row for every capability in `scripts/graphify/bkit-graph-drift-rules.json`, every responsibility in `docs/components.md` that owns a capability appears in both documents, and no row reads `Not built`.
 
 # Capabilities
 
diff --git a/.bkit/templates/docs/data-schema.md b/.bkit/templates/docs/data-schema.md
index 77b9f81de..3e3c57245 100644
--- a/.bkit/templates/docs/data-schema.md
+++ b/.bkit/templates/docs/data-schema.md
@@ -1,19 +1,87 @@
-# Data Schema
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/data-schema.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/security.md`.
+>
+> **Finish against:** none.
+>
+> **Where the facts come from:** the migration files, the schema definition or model files, the access-policy definitions, and a generated schema export when the database tool can produce one.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/data-schema.md`.
+> 2. Fill `## Overview` with the stores the project uses, and draw each table's keys and relationships in the chart.
+> 3. Copy the `## [Table name]` section once per table, and fill its fields, indices, access policies and `Pending` list. Read the personal-data fields from `docs/security.md` § PII, and add each one's table and field to the "Where stored" column there.
+> 4. Fill `## Functions` with each stored function and trigger.
+> 5. Record unresolved facts under `## Open questions`.
+> 6. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/data-schema.md` | ○ | ○ | ● | ○ | ○ | The active production schema: tables, fields, access policies, indices, functions and triggers. |
+> 7. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** write `Not applicable: no persistent store` under `## Overview` and remove the other sections except `## Open questions`.
+>
+> **Completion checks:**
+>
+> - Every table in the migration files has a section.
+> - Every key and relationship in the chart matches a field in a table section.
+> - Every personal-data field in `docs/security.md` § PII appears in a table section.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/data-schema.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Data Schema
 
 > [!CAUTION]
-> **Purpose:** The active production database schema: entities / tables, fields, access policies (e.g. RLS), indices and triggers.
+> **Purpose:** The active production schema: tables, fields, access policies, indices, functions and triggers.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
 > - Give each table one section, holding a `Field | Type | Unique | Notes` table, `Indices` and `Pending`.
+> - `Pending` means a change a migration on an open branch will make and the production schema does not yet have. Move it into the table when the migration deploys.
+> - When the database tool generates a schema export, link it instead of copying it here.
 > - For a field whose existence is a decision, link its ADR in `decisions.jsonl`, and do not restate the rationale.
+>
+> **Not here:** How personal data is protected goes in `docs/security.md` § PII. Migration order and deploy steps go in `docs/deployments.md` § Applying migrations at deploy time. Test fixtures go in `docs/testing.md` § Test data.
+>
+> **Update when:** A table, field, index, access policy, function or trigger is added, changed or removed in production.
+
+## Overview
+
+[The stores the project uses, and how its tables relate.]
+
+```mermaid
+erDiagram
+    ACCOUNT ||--o{ REPORT : owns
+    ACCOUNT {
+        uuid id PK
+    }
+    REPORT {
+        uuid id PK
+        uuid account_id FK
+    }
+```
+
+## [Table name]
+
+[What the table holds.]
+
+<!-- prettier-ignore -->
+| Field | Type | Unique | Notes |
+| --- | --- | --- | --- |
+| [Field name] | [Type.] | [Yes or no.] | [Default, constraint or link to a decision.] |
+| [e.g., id] | uuid | Yes | Primary key. |
+
+**Indices:** [Each index and the query it serves.]
+
+**Access policies:** [Who may read and write each row.]
+
+**Pending:** [Changes a migration on an open branch will make, or none.]
+
+## Functions
 
-## Project facts to record
+<!-- prettier-ignore -->
+| Function or trigger | Fires on | Does |
+| --- | --- | --- |
+| [Name] | [Call or event.] | [What it does.] |
+| [e.g., set_updated_at] | Update of a report row. | Sets the update time. |
 
-Replace this section with the project's own schema. Leave it out when the project has no database.
+## Open questions
 
-- One section per table: the `Field | Type | Unique | Notes` table, `Indices` and `Pending`.
-- Access policies, functions and triggers.
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/deployments.md b/.bkit/templates/docs/deployments.md
index 1eb99bfca..028fd54f8 100644
--- a/.bkit/templates/docs/deployments.md
+++ b/.bkit/templates/docs/deployments.md
@@ -1,27 +1,97 @@
-# Deployments
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/deployments.md`, fill the project slots, keep the bkit practice sections, then delete this introduction.
+>
+> **Fill these first:** `docs/observability.md`, `docs/testing.md`.
+>
+> **Finish against:** `docs/data-schema.md` for `### This project` under `## Applying migrations at deploy time`, which waits for the schema.
+>
+> **Where the facts come from:** the CI and deploy workflow files, the hosting configuration, the branch protection settings, the secret stores and the release history.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/deployments.md`.
+> 2. Fill `## Environments` with one row per environment: its branch, URL and when it deploys. Read hosting and the data store from `docs/architecture.md` § Environments.
+> 3. Redraw `## Release path` as the route a change takes from a branch to production.
+> 4. Fill `## Secrets and env config` with how each environment's config is synced. Read the secret names from `docs/security.md` § Secrets.
+> 5. Fill `## Branch protection` with the required checks and rules of each protected branch.
+> 6. Replace the example steps in `## Production rollback runbook` and `## Dev rollback runbook` with the project's own. Keep both headings.
+> 7. Fill the `### This project` slot under `## Applying migrations at deploy time` with what applies migrations, and when.
+> 8. Keep every section marked `bkit practice`. Edit its text only to correct it for the stack, and never change its heading.
+> 9. Record unresolved facts under `## Open questions`.
+> 10. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/deployments.md` | ○ | ○ | ○ | ● | ● | Deployment and CI/CD: environments, release path, secrets, branch protection, run-level tiers and rollback. |
+> 11. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** write `Not applicable: {reason}` under a project slot that does not apply, such as `## Branch protection` for a project with no protected branch.
+>
+> **Completion checks:**
+>
+> - Every environment in `docs/architecture.md` § Environments has a row in `## Environments`.
+> - The chart in `## Release path` names every environment that a release reaches.
+> - Every secret in `docs/security.md` § Secrets has a sync route in `## Secrets and env config`.
+> - Both rollback runbooks hold the project's own steps, with no example step left.
+> - Every section is marked as a project slot or as bkit practice.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/deployments.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Deployments
 
 > [!CAUTION]
-> **Purpose:** The rules for deployment, environment config and the CI/CD pipeline: secrets sync, branch protection and run-level tiers.
+> **Purpose:** Deployment and CI/CD: environments, release path, secrets, branch protection, run-level tiers and rollback.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
-> - Pre-push runs the project's gate set locally (see "Pre-push checklist" below).
-> - Never use `--no-verify`.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
+> - Pre-push runs the project's gate set locally. The gate scripts are in `docs/testing.md`.
+>
+> **bkit practice:** every section marked `bkit practice` is bkit's own advice. Keep it, because bkit's CI template, advisories and audits cite its heading by name. Every section marked `Project slot` holds the project's own facts.
+>
+> **Not here:** Commit-message tags, phase-close prerequisites, post-merge routing and the ship gate go in `.bkit/workflows.md` § Test and release mechanics. Hosting and the data store go in `docs/architecture.md` § Environments. Secret names go in `docs/security.md` § Secrets.
+>
+> **Update when:** An environment, release step, secret route, protected branch or rollback step is added, changed or removed.
 
-## Project facts to record
+## Environments
+
+> **Project slot:** one row per environment. Hosting and the data store are in `docs/architecture.md` § Environments.
+
+<!-- prettier-ignore -->
+| Environment | Branch | URL | Deploys when |
+| --- | --- | --- | --- |
+| [Environment] | [Branch it deploys from.] | [Address.] | [Event that starts a deploy.] |
+| [e.g., Production] | The default branch. | [e.g., the public site address.] | A release pull request merges. |
+
+## Release path
+
+> **Project slot:** the route a change takes to production.
+
+```mermaid
+flowchart LR
+    FEATURE["Feature branch"] --> DEV["Integration branch"]
+    DEV --> MAIN["Default branch"]
+    MAIN --> PROD["Production"]
+```
+
+## Secrets and env config
+
+> **Project slot:** how each environment's config is synced. The secret names are in `docs/security.md` § Secrets.
+
+<!-- prettier-ignore -->
+| Environment | Config store | Synced by | Checked by |
+| --- | --- | --- | --- |
+| [Environment] | [Store that holds its config.] | [Command or workflow that syncs it.] | [How a mismatch is found.] |
+| [e.g., Production] | The hosting platform's environment settings. | A sync script run by the release workflow. | A comparison step that prints no values. |
 
-Replace the generic text below with the project's own deployment facts where they differ.
+## Branch protection
 
-- Hosts, environments and how a release reaches production.
-- Secrets sync and branch protection.
-- Rollback and deploy decisions specific to this project.
-- Commit-message tags, phase-close prerequisites, post-merge routing and the ship gate are bkit mechanics in `.bkit/workflows.md` § Test and release mechanics.
+> **Project slot:** the rules on each protected branch.
+
+<!-- prettier-ignore -->
+| Branch | Required checks | Other rules |
+| --- | --- | --- |
+| [Branch] | [Checks that must pass.] | [Reviews, history and push rules.] |
+| [e.g., Default branch] | The capstone check. | No force pushes. |
 
 ## Production rollback runbook
 
+> **Project slot:** replace the example steps with this project's own; keep the heading, because plans cite it.
+
 > Use this runbook when a bad release is live. Move production back to the last good deployment, then fix forward through `dev`. Production moves first, and `main` keeps its history. The steps work on any host. The commands use Vercel as the example.
 
 ### Preconditions
@@ -32,14 +102,9 @@ Replace the generic text below with the project's own deployment facts where the
 ### Playbook
 
 1. **Move production back** to the last good deployment. Do not rebuild, and make no git change. Move every production host the release moved (the site, and webhook or background-job aliases), never the website alone. With `bkit-tests-deploy` adopted, run the switch from a `workflow_dispatch` rollback workflow in the deploy job's `concurrency:` group (`cancel-in-progress: false`), so a release and a rollback never switch production at once. For example, on Vercel:
-   ```bash
-   vercel ls --meta githubCommitSha=<green-sha>
-   vercel promote <prior-deployment-url>
-   ```
+   [e.g., list the deployments of the green commit with the host's CLI, then promote the prior deployment.]
 2. **Mark the bad deployment** when `bkit-tests-deploy` is adopted. `bkit-tests-deploy` refuses the deployment id in repo variable `ROLLED_BACK_DEPLOYMENT_ID` (§ Promote before the lanes), so a "Re-run all jobs" of the bad run cannot promote it again.
-   ```bash
-   gh variable set ROLLED_BACK_DEPLOYMENT_ID --body <bad-deployment-id>
-   ```
+   [e.g., set the repository variable `ROLLED_BACK_DEPLOYMENT_ID` to the bad deployment id with the `gh` CLI.]
 3. **Verify** the rollback with § Post-rollback verification.
 4. **Fix forward through `dev`.** Revert the bad change on a `revert-*` branch off `dev`, or ship the fix. Open a PR into `dev`, then release `dev` → `main` as usual. Hold every other release PR into `main` until it carries the fix, because a release cut from `main`'s tip ships the bad commit again. The release descends from the commit production serves, so `bkit-tests-deploy` promotes it. Never rewind or re-seed the database. Ship a corrective migration instead (§ Applying migrations at deploy time). The rolled-back build must work on the newer schema, so expand first and contract later.
 5. **Reset `main` — last resort.** Do this only when `main` holds commits that a `dev` release cannot undo (for example, a squash that landed on `main` without going through `dev`), and only after step 1. If you reset first, `bkit-tests-deploy` refuses every release until production moves, including the run the reset starts, because production's commit is no longer an ancestor of `main`. The reset is a push to `main`. With `bkit-tests-deploy`, it starts a release run that builds and promotes a fresh deployment of `<green-sha>`. You need `jq`, a local repo on `main` and a clean tree.
@@ -69,6 +134,8 @@ Replace the generic text below with the project's own deployment facts where the
 
 ## Dev rollback runbook
 
+> **Project slot:** replace the example steps with this project's own; keep the heading, because plans cite it.
+
 > Use this runbook to unwind a bad commit on `dev` to the prior known-good SHA when the rolled-out range included applied migrations. A code-only rollback leaves the dev DB ahead of the code, so schema-aware tests (schema introspection, access-policy integration) fail on an otherwise clean tree. The steps work with any database. The commands use Supabase as the example.
 
 ### Preconditions
@@ -85,11 +152,8 @@ Replace the generic text below with the project's own deployment facts where the
    git revert --no-edit <green-sha>..HEAD
    git diff --stat <green-sha> HEAD   # empty = tree matches known-good
    ```
-2. **Reset the dev DB.** Drop every schema your migrations create (`CASCADE`), then truncate the migration ledger. Name only your own app-managed schemas. For example, on Supabase (`public` is shown; add each schema your migrations create):
-   ```bash
-   psql "$SUPABASE_DB_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE;'
-   psql "$SUPABASE_DB_URL" -c 'TRUNCATE supabase_migrations.schema_migrations;'
-   ```
+2. **Reset the dev DB.** Drop every schema your migrations create (`CASCADE`), then truncate the migration ledger. Name only your own app-managed schemas. Name each schema your migrations create.
+   [e.g., drop each schema the migrations create with `DROP SCHEMA ... CASCADE`, then truncate the migration ledger table.]
 3. **Push the revert.** The push run's `bkit-tests-migration` re-applies every migration on the reverted tree, because an empty ledger makes every migration new. NEVER apply by hand. **If** `dev` is protected → push the revert on a `revert-*` branch and merge its PR. The apply then runs on the merge push to `dev`.
    ```bash
    git push origin dev
@@ -112,6 +176,8 @@ Replace the generic text below with the project's own deployment facts where the
 
 ## Run-level decision matrix
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 bkit ships a mostly flat, wide scaffold. `bkit-tests-scope` always runs. It reads the markers once, computes `run_level`, the optional `run_migration` and `tenant_target`, and emits the `bkit-test-plan` JSON. It fans out to every lane (`bkit-tests-static` / `-unit` / `-build-web` / `-build-ios` / `-build-android` / `-integration` / `-e2e-web` / `-e2e-ios` / `-e2e-android` / `-live-web` / `-migration` / `-reset` / `-cleanup`), and `bkit-tests-check` joins them. `bkit-tests-deploy` runs on a push to the default branch only, promotes the release before the E2E / `@live` lanes run, and is not required. Static/unit/integration/build wait only on the planner.
 
 **Ordering edges:**
@@ -135,6 +201,8 @@ Device lanes follow `plan.run_native_*`, not `run_level`. The same rule holds on
 
 ## One run per branch or pull request
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 ```yaml
 group: ci-${{ github.workflow }}-${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.pull_request.number) || github.ref }}
 cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
@@ -236,6 +304,8 @@ This is optional. A same-repo promotion PR into the default branch (head `dev`,
 
 ## Workflow-file limits GitHub does not enforce visibly
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 **The 21,000-character expression cap.** GitHub compiles every block scalar containing a `${{ … }}` expression as one expression and refuses to compile the workflow past 21,000 characters:
 
 ```
@@ -250,6 +320,8 @@ The cap is undocumented and invisible to the toolchain, because the file stays v
 
 ## Smoke trigger plumbing
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 Smoke runs after the deploy, in its own workflow, off the merge gate (what it actually probes is in `testing.md` § Smoke). When `bkit-tests-deploy` promotes inside CI, that probe is `bkit-health.yml` (`.bkit/templates.md` § Health check): one workflow, not a second smoke file. Pick the trigger by where the deploy happens, not by habit:
 
 - **If** the deploy happens inside CI → key smoke to `workflow_run` (the CI workflow `completed`, any conclusion), and probe only when production serves that run's commit. The deploy promotes before the tenant lanes, so a red run can still have put a release live. Fail, rather than skip, when production's commit cannot be read. Mind the 3-level `workflow_run` chain cap, because a fourth chained workflow will not fire.
@@ -260,6 +332,8 @@ Smoke runs after the deploy, in its own workflow, off the merge gate (what it ac
 
 ## Applying migrations at deploy time
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 The deploy-time apply and the test-time replay gate are different guarantees. Keep both, preferably in the same always-on lane (`bkit-tests-migration`):
 
 - **Apply (deploy path):** push only the new migrations onto the already-migrated remote. The apply is idempotent: it applies what is not yet in the ledger, so it is safe to retry. It never replays from empty and never runs the seed.
@@ -275,8 +349,16 @@ The deploy-time apply and the test-time replay gate are different guarantees. Ke
 - Do not assume the deploy-time apply also validates a clean from-scratch install or the seed, because it does neither.
 - Do not put the remote push inside e2e while live is not gated on e2e.
 
+### This project
+
+> **Project slot:** what applies this project's migrations, and when.
+
+[What applies migrations to each environment, and when it runs.]
+
 ## Build-vs-migration race
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 When your host auto-deploys on push (Vercel / Netlify Git integration) while CI applies migrations as a separate, unordered step, the deploy's build and the migration race. A build-time DB read that lands before the migration creates its object makes the first deploy that ships it fail with a hard error. Build-time reads come from any statically rendered or build-generated route. Examples in Next.js: `sitemap.ts` / `robots.ts`, `generateStaticParams` / `generateMetadata`, an OG-image route, a static (non-dynamic) page's server read, or marking a DB route `force-static` / ISR. The missing-object error signatures in Postgres, for example, are `42P01` (relation), `42703` (column), `42704` (type) and `3F000` (schema).
 
 **Fingerprint:** prod keeps serving the prior deployment, and a redeploy of the same SHA clears the error. A genuinely bad migration would not clear itself on a redeploy.
@@ -290,6 +372,8 @@ The race stays hidden until the first build-time DB read lands, so flag it in re
 
 ## Promote before the lanes (`bkit-tests-deploy`)
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 With `bkit-tests-deploy` adopted, the host does not auto-build the default branch. `bkit-tests-build-web` creates this SHA's deployment, polls it until it is ready, and publishes `deployment_url` + `deployment_id`. The production alias still serves the previous release. `bkit-tests-deploy` `needs: [bkit-tests-migration, bkit-tests-build-web]`, runs on a push to the default branch only, and is not a required check. It promotes the exact `deployment_id` the build lane published, without looking the deployment up again by SHA. A `409` counts as success only when the body says this id is already current production. On `main` it runs before the E2E / `@live` lanes. Each of those lanes `needs:` it and starts by proving, by deployment id, that production serves this run's build. A re-run after a rollback therefore refuses, instead of testing the old build and going green. A red deploy job means the release did not happen, and production still serves the previous deployment.
 
 Before it promotes, the job refuses and moves nothing in either of these cases:
@@ -310,6 +394,8 @@ The capstone `needs:` `bkit-tests-deploy`, so on a default-branch push a skipped
 
 ## Disable GitHub Code Quality billing
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 GitHub Code Quality (coverage-on-PR plus the `Code Quality: CodeQL` runs) bills per active committer, plus Actions minutes, plus AI credits. It is opt-out: a repo with default setup enabled is billed silently until it is turned off.
 
 - **If** your repo has Code Quality default setup enabled → either disable it in repo → **Settings → Code security → Code Quality** (turn off default setup), or accept the per-committer charge.
@@ -317,6 +403,8 @@ GitHub Code Quality (coverage-on-PR plus the `Code Quality: CodeQL` runs) bills
 
 ## GitHub Actions pinning
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 **Pin every third-party dependency to an immutable digest, and pair each pin with an updater.** A floating ref (a `@v{N}` tag, a `ubuntu:26.04` image, an unversioned `curl … | bash`) is mutable, because a compromised maintainer can re-point it, on their next push, to malicious code that runs with your runner token. It is one exposure class across three surfaces:
 
 - **Actions:** pin every `uses:` to a 40-character commit SHA, never `@v{N}`. Resolve it with `git ls-remote https://github.com/<owner>/<repo>.git 'refs/tags/vX.Y.Z'`, and append a `# vX.Y.Z` comment so the version stays human-readable:
@@ -433,3 +521,7 @@ Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs against `dev` imm
    - **If** the parent itself cannot upgrade → override the transitive to a fixed version (for example, a `pnpm.overrides` entry; with Renovate, fence it, see **Fence a `pnpm.overrides` pin**), or add the transitive as a direct dev dependency (for example, in `devDependencies`) to force the resolution.
 4. Open a PR against `dev` titled `fix(security): bump <pkg> >=<fixed-version> (CVE-XXXX-YYYY)`. After the merge to `dev → main`, the alert closes automatically once GitHub re-scans the default branch.
 5. **If** a CVE has no impact on your usage pattern (for example, a dev-server-only vuln in a build tool that you never run as a server) → dismiss it in the GitHub UI with the "Vulnerable code is not actually used" reason and a one-line justification. Do not dismiss an alert without documenting why.
+
+## Open questions
+
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/noise.md b/.bkit/templates/docs/noise.md
index 7a6babec4..37d9c0ff2 100644
--- a/.bkit/templates/docs/noise.md
+++ b/.bkit/templates/docs/noise.md
@@ -1,20 +1,55 @@
-# Noise
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/noise.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/observability.md`.
+>
+> **Finish against:** none.
+>
+> **Where the facts come from:** the log-level changes in the code, the error tracker's archived and muted issues, and the alert rules whose thresholds were raised.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/noise.md`. The table starts empty, because the file is append-only.
+> 2. Add one row for each signal already downgraded: a log-level reduction, an archived or muted error-tracker issue or a raised alert threshold.
+> 3. Add a row in the same change as every later downgrade, before the signal goes quiet.
+> 4. Record unresolved facts under `## Open questions`.
+> 5. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/noise.md` | — | — | ○ | ● | ○ | Intentional signal downgrades: log levels, error-tracker archives and mutes, and alert thresholds, each with its trigger and reason. |
+> 6. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** a project with no downgraded signal keeps the empty table.
+>
+> **Completion checks:**
+>
+> - Every downgraded signal has one row with a trigger and a reason it is safe.
+> - Every row names the signal in the way `docs/observability.md` § Signals names it.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/noise.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Noise
 
 > [!CAUTION]
-> **Purpose:** The registry of intentional signal downgrades (log-level reductions, error-tracker issue archives / mutes, alert-threshold raises), each with its trigger and rationale.
+> **Purpose:** Intentional signal downgrades: log levels, error-tracker archives and mutes, and alert thresholds, each with its trigger and reason.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
 > - This file is append-only.
-> - Add one entry per downgraded file / line, archived issue or raised threshold.
-> - Downgrade a signal only when its trigger is known / expected.
+> - Add one row per downgraded file or line, archived issue or raised threshold.
+> - Downgrade a signal only when its trigger is known and expected.
 > - Record the trigger, not just the verdict.
 > - Never silence a signal at its source. Log it at a lower level instead.
-> - Archive or mute an issue only when it is captured here.
+> - Archive or mute an issue only when it is recorded here.
+>
+> **Not here:** The signals themselves and the alerts go in `docs/observability.md`.
+>
+> **Update when:** A signal is downgraded, or a recheck condition in a row is met.
+
+## Downgrades
+
+[One row per downgraded signal, added at the bottom.]
+
+<!-- prettier-ignore -->
+| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |
+| --- | --- | --- | --- | --- | --- | --- |
 
-## Project entries
+## Open questions
 
-Replace this section with one entry per downgraded signal. Each entry names the file or issue, the trigger and the reason.
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/observability.md b/.bkit/templates/docs/observability.md
index 23a84b36d..94d1d1dc4 100644
--- a/.bkit/templates/docs/observability.md
+++ b/.bkit/templates/docs/observability.md
@@ -1,21 +1,99 @@
-# Observability
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/observability.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/architecture.md`.
+>
+> **Finish against:** `docs/security.md` for `## Log format`, which is checked against the personal data that doc lists, so none of it gets logged.
+>
+> **Where the facts come from:** the logger module and its configuration, the code that emits named log events, spans and metrics, the error-tracker and log-drain configuration, and the alert rules.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/observability.md`.
+> 2. Redraw `## Signal pipeline` as the path a signal takes from the application to the people who act on it.
+> 3. Fill `## Log format` by naming the logger module and the call every log line goes through, then the fields each line carries.
+> 4. Fill `## Signals` with one row per named log event, span, metric or audit record that an alert, a test, a `docs/noise.md` row or another doc relies on. Leave out ordinary log lines.
+> 5. Fill `## Correlation` with the identifier that ties one request together across runtimes, and where it is set.
+> 6. Fill `## Error tracking` with the tool that collects errors and how an error reaches it.
+> 7. Fill `## Alerts` with one row per alert: what fires it, the threshold and who is told.
+> 8. Fill `## Where to look` with where to read each kind of signal when something fails.
+> 9. Record unresolved facts under `## Open questions`.
+> 10. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/observability.md` | ○ | ○ | ● | ● | ○ | Logging architecture, correlation tracing, telemetry pipelines, error tracking and alerts. |
+> 11. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** write `Not applicable: {reason}` under a section that does not apply, such as `## Alerts` for a project with none.
+>
+> **Completion checks:**
+>
+> - The chart names every place a signal is sent to.
+> - `## Log format` names a logger module that exists in the code.
+> - Every signal an alert reads has a row in `## Signals`.
+> - `## Log format` lists no field that `docs/security.md` marks as personal data.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/observability.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Observability
 
 > [!CAUTION]
-> **Purpose:** The project's logging architecture, correlation tracing, telemetry pipelines and log drains.
+> **Purpose:** Logging architecture, correlation tracing, telemetry pipelines, error tracking and alerts.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
 > - NEVER log PII. Scrub sensitive fields at the source.
 > - Observability never blocks business logic.
+>
+> **Not here:** Smoke checks that probe a deployed release go in `docs/testing.md`. Downgraded signals go in `docs/noise.md`. Failure-evidence fetching for `/bkit-debug` is configured in `.agents/context.md`.
+>
+> **Update when:** A logger, signal, correlation identifier, error tracker, alert or log drain is added, changed or removed.
+
+## Signal pipeline
+
+[The path a signal takes from the application to the people who act on it.]
+
+```mermaid
+flowchart LR
+    APP["Application"] --> LOGS["Log drain"]
+    APP --> ERR["Error tracker"]
+    LOGS --> ALERT["Alert rules"]
+    ERR --> ALERT
+    ALERT --> PEOPLE["On-call people"]
+```
+
+## Log format
+
+[The logger module, the call every log line goes through, and the fields each line carries.]
+
+## Signals
+
+<!-- prettier-ignore -->
+| Signal | Kind | Emitted from | Lands in |
+| --- | --- | --- | --- |
+| [Signal name] | [Log event, span, metric or audit record.] | [Module that emits it.] | [Where it is stored or shown.] |
+| [e.g., report.saved] | Log event | The report service. | The log drain. |
+
+## Correlation
+
+[The identifier that ties one request together across runtimes, and where it is set.]
+
+## Error tracking
+
+[The tool that collects errors and how an error reaches it.]
+
+## Alerts
+
+<!-- prettier-ignore -->
+| Alert | Fires when | Threshold | Notifies |
+| --- | --- | --- | --- |
+| [Alert name] | [Signal or condition.] | [Limit and window.] | [Who is told.] |
+| [e.g., Report failures] | The report service logs errors. | 5 in 10 minutes. | The on-call channel. |
+
+## Where to look
 
-## Project facts to record
+<!-- prettier-ignore -->
+| Question | Look in |
+| --- | --- |
+| [Question a person asks.] | [Tool and view.] |
+| [e.g., Why did a report fail?] | The error tracker, then the log drain filtered by request identifier. |
 
-Replace this section with the project's own content.
+## Open questions
 
-- The structured logger and where log lines go.
-- Correlation ids and how a request is traced end to end.
-- Telemetry pipelines, log drains and error trackers.
-- Failure-evidence fetching for `/bkit-debug` is configured in `.agents/context.md`, not here.
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/security.md b/.bkit/templates/docs/security.md
index 84e57d7d9..784f2f3d2 100644
--- a/.bkit/templates/docs/security.md
+++ b/.bkit/templates/docs/security.md
@@ -1,17 +1,117 @@
-# Security
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/security.md`, fill it in, then delete this introduction.
+>
+> **Fill these first:** `docs/architecture.md`.
+>
+> **Finish against:** `docs/data-schema.md` for the "Where stored" column of the `## PII` table.
+>
+> **Where the facts come from:** the authentication and session code, the route and permission definitions, the input-validation schemas, the secret stores and the CI secret configuration, and the data models that hold personal data.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/security.md`.
+> 2. Fill `## Trust boundaries` with where untrusted input enters the system. Read the runtimes from `docs/architecture.md`.
+> 3. Fill `## Authentication` with how a user or service proves who it is. Redraw the sequence chart for one authenticated request.
+> 4. Fill `## Authorization` with one row per role or service account and what it may do.
+> 5. Fill `## Input validation` with where each kind of input is checked, on the server.
+> 6. Fill `## Rate limiting` with each limited route or action and its limit.
+> 7. Fill `## Secrets` with one row per secret: its name, the store that holds it, who can read it and how it rotates. Write names, never values.
+> 8. Fill `## PII` with each kind of personal data and how it is protected. Leave "Where stored" to be finished once `docs/data-schema.md` exists.
+> 9. Fill the `### This project` slot under `## Supply-Chain (GitHub Actions)` with the project's own dependency and CI rules. Keep the rest of that section.
+> 10. Record unresolved facts under `## Open questions`.
+> 11. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/security.md` | ● | ● | ● | ○ | ○ | Authentication, authorization, input validation, rate limiting, secrets management and PII handling. |
+> 12. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** write `Not applicable: {reason}` under a section that does not apply, such as `## Authentication` for a tool with no users.
+>
+> **Completion checks:**
+>
+> - The sequence chart matches the authentication code path.
+> - Every secret the CI configuration or the code reads has a row in `## Secrets`.
+> - Every service account has a row in `## Authorization`.
+> - Every kind of personal data in `docs/data-schema.md` has a row in `## PII`.
+> - No secret value appears in the document.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/security.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Security
 
 > [!CAUTION]
-> **Purpose:** The project's authentication, authorization, input validation, rate limiting, secrets management and PII handling.
+> **Purpose:** Authentication, authorization, input validation, rate limiting, secrets management and PII handling.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
 > - Auth standards live only here. Other docs link to this file and do not restate them.
+> - Never write a secret value. Write its name and the store that holds it.
+>
+> **bkit practice:** `## Supply-Chain (GitHub Actions)` is bkit's own practice. Keep it and its heading, and put the project's own rules in its `### This project` slot.
+>
+> **Not here:** The variables a developer sets locally go in `docs/setup.md` § Environment variables. How each environment's config is synced goes in `docs/deployments.md` § Secrets and env config. The tables and fields that hold personal data go in `docs/data-schema.md`.
+>
+> **Update when:** A role, service account, secret, validation point, limit or kind of personal data is added, changed or removed.
+
+## Trust boundaries
+
+[Where untrusted input enters the system, and which runtime checks it.]
+
+## Authentication
+
+[How a user or service proves who it is, and how a session or token is kept.]
+
+```mermaid
+sequenceDiagram
+    participant U as User
+    participant A as Application
+    participant S as Session store
+    U->>A: Request with credentials
+    A->>S: Check the session
+    S-->>A: Identity
+    A-->>U: Response
+```
+
+## Authorization
+
+<!-- prettier-ignore -->
+| Role or service account | Kind | May | Granted by |
+| --- | --- | --- | --- |
+| [Role or service account] | [User role or service account.] | [What it may do.] | [Where the grant is defined.] |
+| [e.g., Reviewer] | User role | Read and comment on reports. | The role table in the application. |
+
+## Input validation
+
+<!-- prettier-ignore -->
+| Input | Checked in | How |
+| --- | --- | --- |
+| [Kind of input] | [Handler or layer.] | [Schema or rule.] |
+| [e.g., Report form] | The report service handler. | A schema parsed on the server. |
+
+## Rate limiting
+
+<!-- prettier-ignore -->
+| Route or action | Limit | Keyed by |
+| --- | --- | --- |
+| [Route or action] | [Requests per window.] | [User, address or token.] |
+| [e.g., Sign-in] | 5 requests per minute. | Network address. |
+
+## Secrets
+
+<!-- prettier-ignore -->
+| Secret name | Store | Who can read it | Rotation |
+| --- | --- | --- | --- |
+| [Secret name] | [Store that holds it.] | [Roles and service accounts.] | [How and how often it rotates.] |
+| [e.g., SESSION_KEY] | The hosting platform's secret store. | The report service. | Every 90 days. |
+
+## PII
+
+<!-- prettier-ignore -->
+| Personal data | Why it is held | Protection | Where stored |
+| --- | --- | --- | --- |
+| [Kind of personal data] | [Why the project holds it.] | [Encryption, masking or retention.] | [Table and field, from `docs/data-schema.md`.] |
+| [e.g., Email address] | Account sign-in. | Never logged. | Users table, email field. |
 
 ## Supply-Chain (GitHub Actions)
 
+> **bkit practice:** keep this section; bkit's audits and advisories cite its heading by name, so leave the heading text unchanged.
+
 Action SHA-pinning and the dependency-update pipeline (Renovate / Dependabot, Trivy scan, CVE handling) are described in `deployments.md` § Dependency updaters. This section holds the security invariants only.
 
 **Token isolation:**
@@ -24,12 +124,14 @@ Action SHA-pinning and the dependency-update pipeline (Renovate / Dependabot, Tr
 
 **Scanner isolation:** The CI vulnerability scanner (e.g. `bkit-trivy.yml`) runs with `contents: read`, `persist-credentials: false` and no secret. Its image or action is pinned by digest, never by a floating tag. Setup is in `.bkit/templates.md` § Trivy.
 
-## Project facts to record
+The untrusted-content rules bkit applies to every workflow are in `.bkit/prompts.md` § Untrusted Content & Prompt Injection.
+
+### This project
+
+> **Project slot:** the project's own dependency and CI rules, such as which updater it runs and who reviews its pull requests.
+
+[The project's dependency and CI supply-chain rules.]
 
-Replace this section with the project's own content.
+## Open questions
 
-- How users and services authenticate, and how access is authorized.
-- Input validation and rate limiting.
-- Where secrets live and who can read them.
-- Which personal data the project holds and how it is protected.
-- The untrusted-content rules bkit applies to every workflow are in `.bkit/prompts.md` § Untrusted Content & Prompt Injection.
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/.bkit/templates/docs/testing.md b/.bkit/templates/docs/testing.md
index 8af40880b..f543d124a 100644
--- a/.bkit/templates/docs/testing.md
+++ b/.bkit/templates/docs/testing.md
@@ -1,13 +1,44 @@
-# Testing
+> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/testing.md`, fill the project slots, keep the bkit practice sections, then delete this introduction.
+>
+> **Fill these first:** `docs/architecture.md`.
+>
+> **Finish against:** `docs/data-schema.md` for `## Test data`, which waits for the fixtures, the seed and the fresh store each tier needs.
+>
+> **Where the facts come from:** the package manifest scripts, the test runner configuration, the folders that hold test files, the CI configuration and the shared test helpers.
+>
+> **Fill in:**
+>
+> 1. Copy this starter to `docs/testing.md`.
+> 2. Fill `## Stack` with the runner and framework each tier uses.
+> 3. Fill `## Tiers this project has` with one row per tier. Write `Not applicable` in a tier the project does not have.
+> 4. Fill `## Where tests live` with the folder, file naming and shared helpers of each tier. Record every new test file pattern here.
+> 5. Fill `## Test data` with the shared login setup that UI tests reuse, the typed factories that build test data and the fresh store each tier starts from.
+> 6. Fill `## CI lanes` with the lanes the project runs, what each needs and when it runs.
+> 7. Fill `## Test reports` with where each tier writes its report, and the `bkit:test:file` command.
+> 8. Fill `## Running locally` with the commands that run each tier.
+> 9. Keep every section marked `bkit practice`. Edit its text only to correct it for the stack, and never change its heading.
+> 10. Record unresolved facts under `## Open questions`.
+> 11. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/testing.md` | ○ | ● | ● | ● | — | Testing strategy: tier boundaries, framework choices, naming conventions and the CI lane graph. |
+> 12. Check the document against each completion check, then delete this introduction.
+>
+> **If it does not apply:** write `Not applicable: {reason}` under a project slot that does not apply, such as `## Test data` for a project with no stored data.
+>
+> **Completion checks:**
+>
+> - Every tier named in `## Which tier does a behaviour need?` has a row in `## Tiers this project has`.
+> - Every lane in the CI configuration appears in `## CI lanes`.
+> - Every tier with a runner has a command in `## Running locally`.
+> - Every section is marked as a project slot or as bkit practice.
+> - No example row remains.
 
-> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/testing.md` and add its row to `.agents/docs.md` `## Project Documents`.
+# Testing
 
 > [!CAUTION]
-> **Purpose:** The testing strategy: tier boundaries, framework choices, naming conventions and CI execution.
+> **Purpose:** Testing strategy: tier boundaries, framework choices, naming conventions and the CI lane graph.
 >
 > **Rules:**
 >
-> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
+> - Follow `.bkit/authoring.md` § Docs when you edit this file.
 > - Keep the tiers strictly separate: Static · Unit · Integration · E2E · @live · Smoke.
 > - Pre-push runs `bkit check`, then selects one gate script in this order:
 >   - **If** `bkit ci min-push` accepts every outgoing ref → pre-push runs `pnpm bkit:gate:min`.
@@ -18,55 +49,143 @@
 > - A gate runs its tiers one after another, never two at once. A push gate stops at the first red tier. The E2E gate runs every tier after a red one, reports each, and runs the whole E2E suite. Keep parallel work inside a tier. A cached task replay reports the earlier run's result, not a fresh run.
 > - Integration runs at pre-push once its gate is declared. Local services, such as a Docker database, are fine there.
 > - E2E, @live and tests against a deployed service are excluded from pre-push. They run in CI (see below).
-> - Never bypass the hooks with `--no-verify`.
+>
+> **bkit practice:** every section marked `bkit practice` is bkit's own advice. Keep it, because bkit's CI template, advisories and audits cite its heading by name. Every section marked `Project slot` holds the project's own facts.
+>
+> **Not here:** Live alerts and log signals go in `docs/observability.md`. The runner, gate, lock and JUnit requirements bkit adds go in `.bkit/workflows.md` § Test and release mechanics. Deploy promotion and branch protection go in `docs/deployments.md`.
+>
+> **Update when:** A tier, runner, test folder, shared helper, CI lane or test command is added, changed or removed.
 
-## Project facts to record
+## Stack
 
-Replace the generic text below with the project's own tiers and lanes where they differ.
+> **Project slot:** the runner and framework each tier uses.
 
-- Which tiers exist, the framework for each and where its tests live.
-- The gate scripts in `package.json` and what each one runs.
-- The CI lanes, their `needs` and when each runs.
-- The runner, gate, lock and JUnit requirements bkit adds are in `.bkit/workflows.md` § Test and release mechanics.
+<!-- prettier-ignore -->
+| Tier | Runner | Framework or tool |
+| --- | --- | --- |
+| [Tier] | [Command that runs it.] | [Framework or tool.] |
+| [e.g., Unit] | The package's test script. | A test runner and its assertion library. |
 
-## CI test tiers (the bkit scaffold)
+## Tiers this project has
 
-CI runs the tiers through the bkit scaffold as one parallel lane (job) per tier, not as steps in one job. The step-by-step shape is in `.github/workflows/bkit-ci.yml` § "full CI scaffold reference", and the run-level shape is in `deployments.md` § Run-level decision matrix.
+> **Project slot:** one row per tier. Names match § Which tier does a behaviour need?, because a plan's `Derived Test Matrix` copies the tier name from here.
+
+<!-- prettier-ignore -->
+| Tier | Has it | Covers |
+| --- | --- | --- |
+| Static | [Yes or no.] | [What it checks.] |
+| Unit | [Yes or no.] | [What it checks.] |
+| Integration | [Yes or no.] | [What it checks.] |
+| @live (golden) | [Yes or no.] | [What it checks.] |
+| E2E | [Yes or no.] | [What it checks.] |
+| fresh-DB replay | [Yes or no.] | [What it checks.] |
+| Smoke | [Yes or no.] | [What it checks.] |
+| [e.g., Unit] | Yes | Pure logic in the report service. |
+
+## Where tests live
+
+> **Project slot:** where each tier's files sit. Record a new test file or pattern here.
+
+<!-- prettier-ignore -->
+| Tier | Folder | File naming | Shared helpers |
+| --- | --- | --- | --- |
+| [Tier] | [Folder.] | [Name pattern.] | [Helper modules.] |
+| [e.g., Unit] | Next to the file it tests. | The source file's name with a test suffix. | The shared test utilities folder. |
+
+## Test data
+
+> **Project slot:** the login setup, the factories and the fresh store.
+
+[The shared login setup whose saved auth state UI tests reuse, the typed factories that build test data, and the fresh store each tier starts from.]
 
-The graph is flat and wide for static / unit / build / integration: scope fans out, and the capstone joins. **One exception:** when `bkit-tests-migration` owns the shared-remote migration apply, e2e / live `needs:` that lane for ordering. Never gate live behind static / unit / build / e2e:
+## CI lanes
 
+> **Project slot:** the lanes this project runs, as a chart and a table. § CI test tiers (the bkit scaffold) holds bkit's full lane graph.
+
+```mermaid
+flowchart LR
+    STATIC["static"] --> CHECK["check"]
+    UNIT["unit"] --> CHECK
 ```
-  bkit-tests-scope ─┬─ bkit-tests-static
-    always-on        ├─ bkit-tests-unit
-    never skips      ├─ bkit-tests-build-web ─────────────────────┐
-    (~15s)           ├─ bkit-tests-integration                    │
-                     ├─ bkit-tests-build-ios                      │
-                     ├─ bkit-tests-build-android                  │
-                     └─ bkit-tests-migration ─┬─→ bkit-tests-deploy (default-branch push only; promotes)
-                                              │            │
-                                              │            ▼
-                                              └─→ bkit-tests-reset ─┬─→ bkit-tests-e2e-web
-                                                    (lease)         ├─→ bkit-tests-live-web
-                                                                    ├─→ bkit-tests-e2e-ios
-                                                                    └─→ bkit-tests-e2e-android
-                                          │
-                                          ▼
-                               bkit-tests-cleanup (always(); releases the lease)
-                                          │
-                                          ▼
-                               bkit-tests-check (needs: scope + every lane you have, deploy included)
-
-  static/unit/integration/build-*: needs:[bkit-tests-scope]; if: run_level != 'none'
-  bkit-tests-migration:            needs:[bkit-tests-scope]; no job-level if (always-on)
-  bkit-tests-deploy:               needs:[bkit-tests-migration, bkit-tests-build-web]; default-branch push only
-  bkit-tests-reset:                needs:[scope, migration]; if: tenant_target != ''
-  e2e-web / live-web / e2e-ios / e2e-android:
-                                   needs:[scope, migration, deploy, reset, <build>];
-                                   if: !cancelled() && scope==success && <own gate>
-                                   && migration != 'failure' && deploy != 'failure'
-                                   && reset != 'failure'
+
+<!-- prettier-ignore -->
+| Lane | Needs | Runs when |
+| --- | --- | --- |
+| [Lane] | [Lanes it waits for.] | [Event or condition.] |
+| [e.g., unit] | scope | Every push and pull request. |
+
+## Test reports
+
+> **Project slot:** where each tier writes its report.
+
+<!-- prettier-ignore -->
+| Tier | Report format | Path |
+| --- | --- | --- |
+| [Tier] | [Format.] | [Where it is written.] |
+| [e.g., Unit] | JUnit XML | The path in `$BKIT_TEST_REPORT`. |
+
+## Running locally
+
+> **Project slot:** the commands a developer runs for each tier.
+
+<!-- prettier-ignore -->
+| Tier | Command |
+| --- | --- |
+| [Tier] | [Command.] |
+| [e.g., Unit] | `pnpm test` |
+
+## CI test tiers (the bkit scaffold)
+
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
+CI runs the tiers through the bkit scaffold as one parallel lane (job) per tier, not as steps in one job. The step-by-step shape is in `.github/workflows/bkit-ci.yml` § "full CI scaffold reference", and the run-level shape is in `deployments.md` § Run-level decision matrix.
+
+The graph is flat and wide for static / unit / build / integration: scope fans out, and the capstone joins. **One exception:** when `bkit-tests-migration` owns the shared-remote migration apply, e2e / live `needs:` that lane for ordering. Never gate live behind static / unit / build / e2e.
+
+```mermaid
+flowchart LR
+    SCOPE["bkit-tests-scope"] --> STATIC["bkit-tests-static"]
+    SCOPE --> UNIT["bkit-tests-unit"]
+    SCOPE --> BWEB["bkit-tests-build-web"]
+    SCOPE --> INTEG["bkit-tests-integration"]
+    SCOPE --> BIOS["bkit-tests-build-ios"]
+    SCOPE --> BAND["bkit-tests-build-android"]
+    SCOPE --> MIG["bkit-tests-migration"]
+    MIG --> DEPLOY["bkit-tests-deploy"]
+    BWEB --> DEPLOY
+    MIG --> RESET["bkit-tests-reset"]
+    DEPLOY --> E2EW["bkit-tests-e2e-web"]
+    DEPLOY --> LIVE["bkit-tests-live-web"]
+    DEPLOY --> E2EI["bkit-tests-e2e-ios"]
+    DEPLOY --> E2EA["bkit-tests-e2e-android"]
+    RESET --> E2EW
+    RESET --> LIVE
+    RESET --> E2EI
+    RESET --> E2EA
+    E2EW --> CLEAN["bkit-tests-cleanup"]
+    LIVE --> CLEAN
+    E2EI --> CLEAN
+    E2EA --> CLEAN
+    CLEAN --> CHECK["bkit-tests-check"]
+    STATIC --> CHECK
+    UNIT --> CHECK
+    INTEG --> CHECK
 ```
 
+Each lane's `needs:` and `if:` are in this table.
+
+<!-- prettier-ignore -->
+| Lane | `needs:` | `if:` |
+| --- | --- | --- |
+| `bkit-tests-scope` | none | always on; never skips (~15s) |
+| `bkit-tests-static` / `-unit` / `-integration` / `-build-*` | `bkit-tests-scope` | `run_level != 'none'` |
+| `bkit-tests-migration` | `bkit-tests-scope` | no job-level `if:` (always on) |
+| `bkit-tests-deploy` | `bkit-tests-migration`, `bkit-tests-build-web` | default-branch push only |
+| `bkit-tests-reset` | scope, migration | `tenant_target != ''` |
+| `-e2e-web` / `-live-web` / `-e2e-ios` / `-e2e-android` | scope, migration, deploy, reset, the lane's build | `!cancelled() && scope == success && <own gate> && migration != 'failure' && deploy != 'failure' && reset != 'failure'` |
+| `bkit-tests-cleanup` | the lanes that use the lease | `always()`; releases the lease |
+| `bkit-tests-check` | scope and every lane you have, deploy included | always |
+
 Adopt only lanes your repo has. Add a lane the moment its tier exists, because a tier with no lane is a tier nothing gates. The jobs above the reference in `bkit-ci.yml` are the starter: `bkit-tests-static` and `bkit-tests-unit`, joined by the `bkit-tests-check` capstone `/bkit-ship` merges on. Every lane you add joins the capstone's `needs:` and its assert. The reference is the target. A starter stub that still sits inside `bkit-tests-unit` is the pre-split shape.
 
 Adopt in this order, and stop at the first tier this repo does not have. You write the step bodies. These files name the job, the `needs`, the `if`, and the rule.
@@ -281,6 +400,8 @@ Two further axes share the same root cause:
 
 ## Which tier does a behaviour need?
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 Assign every behaviour its **lowest sufficient tier(s)**: the lowest tier that actually exercises it. A behaviour may need more than one. Never substitute a lower or mocked tier for a boundary that a higher tier validates. **Under-tiering** is a defect, not a shortcut. It means using a lower or mocked tier where the rubric demands a higher or `@live` one, for example a user-visible flow with no E2E row, an external-API behaviour tested only against a local fixture, or a migration with no fresh-DB replay.
 
 <!-- prettier-ignore -->
@@ -300,6 +421,8 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 
 ## What each tier must do
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 Each tier lists the rule to follow, then a **Not:** line naming the failure the rule prevents. Stack tools (Vitest / Playwright / a Supabase-style local stack / a Vercel-style preview) appear only as worked examples, because the rule is the principle. Implement it for your stack.
 
 ### Static
@@ -367,6 +490,8 @@ Each tier lists the rule to follow, then a **Not:** line naming the failure the
 
 ## Test first
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 `/bkit-build` runs each plan task's `**TEST FIRST:**` tests before their code and records each one failing (red) before the code step. This covers the unit and integration tiers only. The runners below are examples; declare the one the project uses.
 
 - **Declare `bkit:test:file`:** it runs the one test file bkit appends as its argument (a repo-relative path), and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"`. pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`. jest: `jest --runTestsByPath` with the `jest-junit` reporter and `JEST_JUNIT_OUTPUT_FILE="$BKIT_TEST_REPORT"`. Node: `node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination="$BKIT_TEST_REPORT"`; write Node tests with `node:test` (`test` / `describe` + `it`).
@@ -378,6 +503,8 @@ Each tier lists the rule to follow, then a **Not:** line naming the failure the
 
 ## Design assertions are a dimension, not a lane
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 **Never add a design lane.** The lane axis is **resource profile** (a millisecond file read vs a booted app + browser), not subject matter, because design assertions span both. A `bkit-tests-design` job (or a design-only browser project) splits one concern across two profiles and buys nothing that the existing lanes do not already provide. Fold each assertion into the tier that already fits it. The CI topology, the capstone's `needs:` and the browser-project partition all stay unchanged. A real consumer's full design-system rollout landed with `bkit-ci.yml` byte-unchanged.
 
 <!-- prettier-ignore -->
@@ -407,6 +534,8 @@ Each tier lists the rule to follow, then a **Not:** line naming the failure the
 
 ## Schema-invariant DB checks (e.g. RLS coverage)
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 Access-policy coverage is stack-specific. bkit ships the pattern (the two routes below), not a drop-in test. Supabase / PostgREST is the worked example. Implement it for your backing store by swapping the catalog source and the anon probe for your stack's equivalent.
 
 Assert DB-level invariants (for example, "every public table has RLS enabled", with no hardcoded list) in one of two co-equal ways. Pick by deploy topology, not by whether you can run a local DB-test runner (for example, pgTAP):
@@ -419,6 +548,8 @@ An auto-discovering access-policy suite belongs in `bkit-tests-live-web`. For RL
 
 ## Provision backing services fresh
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 A tier that needs a stateful backing service (database, cache, queue, search index) must run against a freshly-provisioned instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is not evidence of reproducibility. A migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove that a fresh provision + seed succeeds in CI: for example, an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote / dev instance for the `@live` tier and push-side E2E, because they validate the real deployed schema. It is never the integration tier's source of truth.
 
 bkit's `bkit-tests-migration` lane (`bkit-stub:bkit-tests-migration`) is the ready-made home.
@@ -447,6 +578,8 @@ bkit's `bkit-tests-migration` lane (`bkit-stub:bkit-tests-migration`) is the rea
 
 ## Optional hardening (adopt when the cost is justified)
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 Beyond the gates above, three practices raise confidence further. They are opt-in, not baseline.
 
 - **Mutation testing** (for example, StrykerJS over a Vitest suite) automates the "executed != exercised" intent. It injects bugs into production code and fails when no test catches them.
@@ -458,6 +591,8 @@ Beyond the gates above, three practices raise confidence further. They are opt-i
 
 ## Coverage on PRs
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 Shipped stubs target Vitest (`bkit-stub:coverage`) and Playwright (`bkit-stub:e2e-coverage`). On another runner, keep the rules (per-tier, report-only, ratchet from current) and swap the tooling.
 
 Report coverage on each PR without a paid product or a third-party service. For example, the `bkit-stub:coverage` block in `.github/workflows/bkit-ci.yml` runs `davelosert/vitest-coverage-report-action` entirely inside Actions with `GITHUB_TOKEN`, and posts sticky per-PR comments. That is safe for private repos, because no coverage data leaves the runner. It replaces GitHub Code Quality's coverage-on-PR value (`deployments.md` § Disable GitHub Code Quality billing). It does not replace CodeQL security scanning, which is a separate product.
@@ -504,6 +639,8 @@ The E2E tier (`bkit-stub:e2e-coverage`) reports Playwright coverage in the same
 
 ## CI verbosity (`[verbose ci]`)
 
+> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.
+
 See `.bkit/workflows.md` § Test and release mechanics (Commit-message force tags) for the marker mechanics. That covers where to put it: the PR title for feature-branch pushes, and the commit message for a direct push to `dev` / `main`. This section covers the testing-specific knobs.
 
 **Knobs flipped under the marker.** The shipped stub flips turbo / Node / Vercel / Supabase / Playwright knobs. Add your stack's equivalents.
@@ -521,3 +658,7 @@ See `.bkit/workflows.md` § Test and release mechanics (Commit-message force tag
 **Hostile gap: Playwright `--reporter=line` override.** **If** your `playwright test` invocation passes `--reporter=line` → drop it. With the marker on, traces are written but no reporter surfaces them, so the artifact upload is wasted. `bkit install` flags this as an advisory.
 
 **Artifact paths** (already in `.gitignore` via the bkit template): `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/`. Never commit these, because traces alone run 1-50MB each.
+
+## Open questions
+
+[Each unresolved fact, who can answer it and which section it affects.]
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index 5e917b4e6..229e1ed48 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -223,7 +223,7 @@ export function detectBkitStubs(cwd) {
             severity: "advisory",
             detect: `${ciRel} contains the bkit-stub:${stub.id} sentinel — a commented-in block shipped disabled by default.`,
             action: `${stub.description}\n\n` +
-                `Before enabling a CI lane, read docs/testing.md § CI test tiers and docs/deployments.md (one run per branch, push base, promote after the capstone). The FULL CI SCAFFOLD REFERENCE in ${ciRel} is the job graph: needs, if, step names. Write the job from that graph and from those docs. Uncomment only a block that is already commented YAML or shell.\n\n` +
+                `Before enabling a CI lane, read docs/testing.md § CI test tiers and docs/deployments.md (one run per branch, push base). The FULL CI SCAFFOLD REFERENCE in ${ciRel} is the job graph: needs, if, step names. Write the job from that graph and from those docs. Uncomment only a block that is already commented YAML or shell.\n\n` +
                 `Decide with the user: (a) enable — uncomment the YAML/shell block AND delete the \`# bkit-stub:${stub.id} — ...\` header line; (b) customise — adjust paths/secrets/conditions before uncommenting; (c) dismiss — delete the entire stub block (header + commented body).\n\n` +
                 `Until the sentinel is removed, this advisory fires every install / check.`,
         });
diff --git a/dist/install/project-docs.js b/dist/install/project-docs.js
index 0274975fb..6088a72b7 100644
--- a/dist/install/project-docs.js
+++ b/dist/install/project-docs.js
@@ -39,23 +39,23 @@ const TOPIC_INFO = {
     },
     security: {
         phases: ["●", "●", "●", "○", "○"],
-        scope: "Authentication, authorization, input validation, rate limiting, secrets management, PII handling.",
+        scope: "Authentication, authorization, input validation, rate limiting, secrets management and PII handling.",
     },
     "data-schema": {
         phases: ["○", "○", "●", "○", "○"],
-        scope: "Active production database schema — entities / tables, fields, access policies (e.g. RLS), indices, functions, triggers.",
+        scope: "The active production schema: tables, fields, access policies, indices, functions and triggers.",
     },
     testing: {
         phases: ["○", "●", "●", "●", "—"],
-        scope: "Testing strategy — tier boundaries, framework choices, naming conventions, CI lane graph (names, needs, when a lane runs).",
+        scope: "Testing strategy: tier boundaries, framework choices, naming conventions and the CI lane graph.",
     },
     deployments: {
         phases: ["○", "○", "○", "●", "●"],
-        scope: "Deployment / CI/CD — secrets, branch protection, one-run concurrency, push base, promote after the capstone.",
+        scope: "Deployment and CI/CD: environments, release path, secrets, branch protection, run-level tiers and rollback.",
     },
     observability: {
         phases: ["○", "○", "●", "●", "○"],
-        scope: "Logging architecture, correlation tracing, telemetry pipelines, log drains.",
+        scope: "Logging architecture, correlation tracing, telemetry pipelines, error tracking and alerts.",
     },
     design: {
         phases: ["○", "○", "○", "—", "—"],
@@ -63,7 +63,7 @@ const TOPIC_INFO = {
     },
     noise: {
         phases: ["—", "—", "○", "●", "○"],
-        scope: "Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds.",
+        scope: "Intentional signal downgrades: log levels, error-tracker archives and mutes, and alert thresholds, each with its trigger and reason.",
     },
     setup: {
         phases: ["—", "—", "○", "○", "—"],
