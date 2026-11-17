diff --git a/.agents/docs.md b/.agents/docs.md
index a7903f096..98ef75e77 100644
--- a/.agents/docs.md
+++ b/.agents/docs.md
@@ -79,10 +79,10 @@
 | `.bkit/comparison.md` | — | — | — | — | — | Peer-framework + agentic-patterns comparison. Humans only. |
 | `docs/architecture.md` | ● | ● | ● | ○ | ○ | System design — service boundaries, deployment topology, integration sketch. |
 | `docs/technology.md` | ● | ● | ○ | ○ | ○ | Chosen frameworks, libraries, styling systems, coding conventions. Why a choice was made goes in `decisions.jsonl`. |
-| `docs/security.md` | ● | ● | ● | ○ | ○ | Authentication, authorization, input validation, rate limiting, secrets management, PII handling. |
-| `docs/data-schema.md` | ○ | ○ | ● | ○ | ○ | Active production database schema — entities / tables, fields, access policies (e.g. RLS), indices, functions, triggers. |
-| `docs/testing.md` | ○ | ● | ● | ● | — | Testing strategy — tier boundaries, framework choices, naming conventions, CI lane graph (names, needs, when a lane runs). |
-| `docs/deployments.md` | ○ | ○ | ○ | ● | ● | Deployment / CI/CD — secrets, branch protection, one-run concurrency, push base, promote after the capstone. |
+| `docs/security.md` | ● | ● | ● | ○ | ○ | The project's authentication, authorization, input validation, rate limiting, secrets management and PII handling. |
+| `docs/data-schema.md` | ○ | ○ | ● | ○ | ○ | The active production database schema: entities / tables, fields, access policies (e.g. RLS), indices and triggers. |
+| `docs/testing.md` | ○ | ● | ● | ● | — | The testing strategy: tier boundaries, framework choices, naming conventions and CI execution. |
+| `docs/deployments.md` | ○ | ○ | ○ | ● | ● | The rules for deployment, environment config and the CI/CD pipeline: secrets sync, branch protection and run-level tiers. |
 | `docs/observability.md` | ○ | ○ | ● | ● | ○ | Logging architecture, correlation tracing, telemetry pipelines, log drains. |
 | `docs/design.md` | ○ | ○ | ○ | — | — | Design system — palette, typography, components, spacing, a11y, layout tokens. |
 | `docs/noise.md` | — | — | ○ | ● | ○ | Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds. |
diff --git a/.bkit/core/engine/checks/after/index.ts b/.bkit/core/engine/checks/after/index.ts
index d1b189c47..96538f0e3 100644
--- a/.bkit/core/engine/checks/after/index.ts
+++ b/.bkit/core/engine/checks/after/index.ts
@@ -45,7 +45,11 @@ import {
   detectTestIntegrationEnv,
   detectTurboIntegrationInputs,
 } from "./ci-yml.js";
-import { type SuppressionNote, type SuppressionReporter } from "./suppression.js";
+import {
+  isAdvisorySuppressed,
+  type SuppressionNote,
+  type SuppressionReporter,
+} from "./suppression.js";
 import {
   dropTipSilencedAdvisories,
   setupTipsChecklistLines,
@@ -475,7 +479,10 @@ export function runPostInstallCheck(
   for (const stub of detectBkitStubs(cwd)) phase3.push(stub);
 
   // Project documents (docs/*.md): missing, empty, starter-only or unindexed. Advisory only.
-  for (const f of detectProjectDocs(cwd, onSuppressed)) phase3.push(f);
+  for (const f of detectProjectDocs(cwd)) {
+    if (!isAdvisorySuppressed(cwd, f.id, f.severity)) phase3.push(f);
+    else onSuppressed?.({ id: f.id, scope: "." });
+  }
 
   // turbo.json inputs for cache-replay safety (KN-24).
   for (const f of detectTurboIntegrationInputs(cwd)) phase3.push(f);
diff --git a/.bkit/core/engine/checks/after/tools.test.ts b/.bkit/core/engine/checks/after/tools.test.ts
index 63acda43b..e6d6071c7 100644
--- a/.bkit/core/engine/checks/after/tools.test.ts
+++ b/.bkit/core/engine/checks/after/tools.test.ts
@@ -504,7 +504,7 @@ describe("detectProjectDocs", () => {
     expect(missing!.action).toContain(".bkit/templates/docs/");
     expect(missing!.action).toContain(".agents/docs.md");
 
-    const empty = findings.find((f) => f.id === "project-docs-empty");
+    const empty = findings.find((f) => f.id === "project-docs-unpopulated");
     expect(empty).toBeDefined();
     expect(empty!.detect).toContain("docs/testing.md");
     expect(empty!.detect).toContain("docs/setup.md");
@@ -517,6 +517,45 @@ describe("detectProjectDocs", () => {
     expect(findings.some((f) => f.id === "project-docs-index-missing")).toBe(false);
   });
 
+  it("missing and unpopulated advisories name the adoption-order section", () => {
+    writeDoc(
+      "docs/architecture.md",
+      fs.readFileSync(path.join(STARTER_DIR, "architecture.md"), "utf-8"),
+    );
+    writeIndex([{ doc: "docs/architecture.md" }]);
+    const findings = detectProjectDocs(tmpDir);
+    for (const id of ["project-docs-missing", "project-docs-unpopulated"]) {
+      const finding = findings.find((f) => f.id === id);
+      expect(finding, id).toBeDefined();
+      expect(finding!.action, id).toContain("Project docs \u2014 adoption order");
+    }
+  });
+
+  it("an empty project doc is reported as project-docs-unpopulated", () => {
+    writeDoc("docs/testing.md", "  \n");
+    writeDoc("docs/security.md", POPULATED);
+    writeIndex([{ doc: "docs/testing.md" }, { doc: "docs/security.md" }]);
+    const findings = detectProjectDocs(tmpDir);
+    const unpopulated = findings.find((f) => f.id === "project-docs-unpopulated");
+    expect(unpopulated).toBeDefined();
+    expect(unpopulated!.detect).toContain("docs/testing.md");
+    expect(unpopulated!.detect).not.toContain("docs/security.md");
+    expect(findings.map((f) => f.id)).not.toContain("project-docs-empty");
+  });
+
+  it("a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing", () => {
+    writeDoc("handbook/sec-negated.md", POPULATED);
+    writeDoc("handbook/sec-mdx.md", POPULATED);
+    writeIndex([
+      { doc: "handbook/sec-negated.md", scope: "Not equivalent to `docs/security.md`" },
+      { doc: "handbook/sec-mdx.md", scope: "Equivalent to `docs/security.mdx`" },
+    ]);
+    const findings = detectProjectDocs(tmpDir);
+    const missing = findings.find((f) => f.id === "project-docs-missing");
+    expect(missing).toBeDefined();
+    expect(missing!.detect).toContain("docs/security.md");
+  });
+
   it("recognizes current and migrated untouched starters", () => {
     const starter = fs.readFileSync(path.join(STARTER_DIR, "architecture.md"), "utf-8");
     // Current starter copied verbatim; a lightly edited placeholder-only copy of another starter.
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index 36a81c360..53aef39f6 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -23,7 +23,6 @@ import {
   starterPath,
 } from "../../install/project-docs.js";
 import { stripManagedWrapper } from "../../install/managed-block.js";
-import { isAdvisorySuppressed, type SuppressionReporter } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import {
   DEP_UPDATER_NAMES,
@@ -475,15 +474,11 @@ function assessDocText(cwd: string, topic: ProjectDocTopic, text: string): DocAs
  * file outside the repository. A document that differs from every starter is a candidate for
  * the agent to assess; the mechanical read makes no claim about what it covers.
  */
-export function detectProjectDocs(
-  cwd: string,
-  onSuppressed?: SuppressionReporter,
-): PreflightFinding[] {
+export function detectProjectDocs(cwd: string): PreflightFinding[] {
   const index = readProjectIndex(cwd);
   const rows = index.status === "ok" ? index.rows : [];
   const indexedPaths = new Set(rows.map((r) => r.path));
   const missing: string[] = [];
-  const empty: string[] = [];
   const unpopulated: string[] = [];
   const unindexed: string[] = [];
   const unindexedWrapped: string[] = [];
@@ -535,8 +530,7 @@ export function detectProjectDocs(
     const wrapper = stripManagedWrapper(read.text);
     if (wrapper.status === "ambiguous") cleanup.push(`${target} (${wrapper.problem})`);
     const assessed = assessDocText(cwd, topic, read.text);
-    if (assessed === "empty") empty.push(target);
-    else if (assessed === "unpopulated") unpopulated.push(target);
+    if (assessed === "empty" || assessed === "unpopulated") unpopulated.push(target);
     else if (index.status === "ok" && !indexedPaths.has(target)) {
       const covering = findIndexedEquivalent(
         rows,
@@ -571,23 +565,15 @@ export function detectProjectDocs(
       id: "project-docs-missing",
       severity: "advisory",
       detect: `No project document covers: ${missing.join(", ")}.`,
-      action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply.`,
-    });
-  }
-  if (empty.length > 0) {
-    findings.push({
-      id: "project-docs-empty",
-      severity: "advisory",
-      detect: `These project documents are empty: ${empty.join(", ")}.`,
-      action: `Write the project's facts into each file, or delete it and remove its row from ${PROJECT_INDEX_PATH}. Agents cannot use an empty document.`,
+      action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply. Fill the docs in the order of .bkit/templates.md § Project docs — adoption order.`,
     });
   }
   if (unpopulated.length > 0) {
     findings.push({
       id: "project-docs-unpopulated",
       severity: "advisory",
-      detect: `These project documents still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
-      action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes.`,
+      detect: `These project documents are empty or still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
+      action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes. Fill the docs in the order of .bkit/templates.md § Project docs — adoption order.`,
     });
   }
   if (unindexed.length > 0) {
@@ -639,9 +625,5 @@ export function detectProjectDocs(
     });
   }
 
-  return findings.filter((f) => {
-    if (!isAdvisorySuppressed(cwd, f.id, f.severity)) return true;
-    onSuppressed?.({ id: f.id, scope: "." });
-    return false;
-  });
+  return findings;
 }
diff --git a/.bkit/core/engine/checks/tips/catalogue.test.ts b/.bkit/core/engine/checks/tips/catalogue.test.ts
index 953a75308..e69c667d6 100644
--- a/.bkit/core/engine/checks/tips/catalogue.test.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.test.ts
@@ -6,7 +6,8 @@ import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 import { getCoreRoot, getTemplatesRoot } from "../../shared/package-roots";
 import { detectContextFetchMissing } from "../before/context-fetch";
 import { buildTrackerSetupAdvisory } from "../after/github";
-import { buildDepUpdaterSetupAdvisory } from "../after/tools";
+import { buildDepUpdaterSetupAdvisory, detectProjectDocs } from "../after/tools";
+import { PROJECT_DOC_TOPICS, projectDocPath } from "../../install/project-docs";
 import { COMPLY_PHASES, TIPS_CONTEXTS } from "../../cli";
 import { ALL_WORKFLOWS, EVERY_CONTEXT, SETUP_TIPS, type SetupTip } from "./catalogue";
 import {
@@ -519,6 +520,105 @@ describe("SETUP_TIPS — detection", () => {
     expect(tip("bkit-output-json").fires(cwd)).toBe(false);
   });
 
+  describe("project-docs", () => {
+    const POPULATED_DOC =
+      "# Doc\n\nThe api service issues session cookies; the edge proxy applies the rate limits.\n";
+    const INDEX_HEAD =
+      "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n" +
+      "| Doc | Design | Plan | Build | Debug | Ship | Scope |\n| --- | --- | --- | --- | --- | --- | --- |\n";
+
+    /** The `project-docs` tip, asserted present so a missing entry fails with a clear message. */
+    const projectDocsTip = (): SetupTip => {
+      const found = SETUP_TIPS.find((t) => t.id === "project-docs");
+      expect(found, "project-docs tip is in the catalogue").toBeDefined();
+      return found!;
+    };
+
+    /** Write every project doc as `texts[topic]` (populated by default) and index them all. */
+    const writeProjectDocs = (texts: Partial<Record<string, string>> = {}) => {
+      const rows: string[] = [];
+      for (const topic of PROJECT_DOC_TOPICS) {
+        const rel = projectDocPath(topic);
+        write(rel, texts[topic] ?? POPULATED_DOC);
+        rows.push(`| \`${rel}\` | ○ | ○ | ○ | ○ | ○ | Project doc. |\n`);
+      }
+      write(".agents/docs.md", INDEX_HEAD + rows.join(""));
+    };
+
+    const starterText = (topic: string): string =>
+      fs.readFileSync(path.join(getTemplatesRoot(), "docs", `${topic}.md`), "utf-8");
+
+    it("project-docs tip fires when a project doc is missing", () => {
+      writeProjectDocs();
+      fs.rmSync(path.join(cwd, "docs", "security.md"));
+      expect(detectProjectDocs(cwd).map((f) => f.id)).toContain("project-docs-missing");
+      expect(projectDocsTip().fires(cwd)).toBe(true);
+    });
+
+    it("project-docs tip stays silent when every project doc is populated and indexed", () => {
+      writeProjectDocs();
+      expect(detectProjectDocs(cwd).map((f) => f.id)).toEqual([]);
+      expect(projectDocsTip().fires(cwd)).toBe(false);
+    });
+
+    it("project-docs tip names the two project-docs advisory ids", () => {
+      const t = projectDocsTip();
+      expect([...advisoriesOf(t)]).toEqual(["project-docs-missing", "project-docs-unpopulated"]);
+      expect(t.caution).toBeTruthy();
+    });
+
+    it("project-docs tip stays silent for a Not applicable data-schema and a header-only noise", () => {
+      writeProjectDocs({
+        "data-schema":
+          "# Data schema\n\n## Overview\n\nNot applicable: no persistent store\n\n## Open questions\n",
+        noise:
+          "# Noise\n\n## Downgrades\n\n| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |\n| --- | --- | --- | --- | --- | --- | --- |\n",
+      });
+      expect(detectProjectDocs(cwd).map((f) => f.id)).toEqual([]);
+      expect(projectDocsTip().fires(cwd)).toBe(false);
+    });
+
+    it("project-docs tip fires when a project doc is an unchanged starter copy", () => {
+      writeProjectDocs({ architecture: starterText("architecture") });
+      expect(detectProjectDocs(cwd).map((f) => f.id)).toContain("project-docs-unpopulated");
+      expect(projectDocsTip().fires(cwd)).toBe(true);
+    });
+
+    it("project-docs tip fires when a project doc is empty", () => {
+      writeProjectDocs({ testing: "" });
+      expect(detectProjectDocs(cwd).map((f) => f.id)).toContain("project-docs-unpopulated");
+      expect(projectDocsTip().fires(cwd)).toBe(true);
+    });
+
+    it("project-docs tip stays silent when project-docs-missing is ignored", () => {
+      pkg({ advisories: { ignore: ["project-docs-missing"] } });
+      writeProjectDocs();
+      fs.rmSync(path.join(cwd, "docs", "security.md"));
+      expect(projectDocsTip().fires(cwd)).toBe(true);
+      const result = collectTips(cwd);
+      expect(result.tips.map((t) => t.id)).not.toContain("project-docs");
+      expect(result.suppressed.map((s) => s.id)).toContain("project-docs");
+    });
+
+    it("ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing", () => {
+      pkg({ advisories: { ignore: ["project-docs-missing"] } });
+      write("docs/architecture.md", starterText("architecture"));
+      const findings = detectProjectDocs(cwd);
+      const ids = findings.map((f) => f.id);
+      expect(ids).toEqual(
+        expect.arrayContaining([
+          "project-docs-missing",
+          "project-docs-unpopulated",
+          "project-docs-index-missing",
+        ]),
+      );
+      const kept = dropTipSilencedAdvisories(findings, cwd).map((f) => f.id);
+      expect(kept).not.toContain("project-docs-missing");
+      expect(kept).not.toContain("project-docs-unpopulated");
+      expect(kept).toContain("project-docs-index-missing");
+    });
+  });
+
   describe("bkit-upgrade", () => {
     const pin = (version: string) =>
       write(".bkit/version", JSON.stringify({ pinnedVersion: version }));
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 7bb343554..5270ae68c 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -14,7 +14,7 @@
 // Text rules: `line`, `why`, `caution` and `ask` are for the person, in plain English, and
 // never name an outside service — examples of specific services go in `steps`, which is
 // for the agent. A template's benefit reads the same here, in its `.bkit/templates.md`
-// section opener and in the README's "Templates ready to adopt" row; change all three in
+// section opener and in `DETAILS.md` § Templates ready to adopt; change all three in
 // the same commit.
 //
 // Detection rules: every `fires` is local (files, settings, environment) — no network. The
@@ -38,7 +38,7 @@ import {
 } from "../before/env.js";
 import { detectGhMcpToken, hasGithubMcpServer } from "../after/auth.js";
 import { buildTrackerSetupAdvisory } from "../after/github.js";
-import { buildDepUpdaterSetupAdvisory } from "../after/tools.js";
+import { buildDepUpdaterSetupAdvisory, detectProjectDocs } from "../after/tools.js";
 import { detectInstalledHostModules } from "../../install/hosts.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import type { ComplyPhase, TipsContext } from "../../cli.js";
@@ -395,6 +395,22 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     steps: "`.bkit/templates.md` § graphify.",
     fires: (cwd) => !exists(cwd, "scripts/graphify"),
   },
+  {
+    id: "project-docs",
+    workflows: ["design", "plan", "build"],
+    title: "Project docs",
+    line: "Fill the project docs in waves, because each doc reads facts the earlier ones record.",
+    why: "Agents read your architecture, testing and security docs before they plan and build. A doc that is missing or still holds the starter text gives them nothing to go on, so they guess from the code each time.",
+    caution:
+      "Ignoring either the missing-doc advisory or the unfilled-doc advisory also silences this tip and the other advisory.",
+    ask: "Fill in my project docs in the order of .bkit/templates.md § Project docs — adoption order: copy each missing starter from .bkit/templates/docs/ to docs/, fill it from the repository, and add its row to .agents/docs.md.",
+    steps: "`.bkit/templates.md` § Project docs — adoption order.",
+    advisories: ["project-docs-missing", "project-docs-unpopulated"],
+    fires: (cwd) =>
+      detectProjectDocs(cwd).some(
+        (f) => f.id === "project-docs-missing" || f.id === "project-docs-unpopulated",
+      ),
+  },
   {
     id: "dependabot-renovate",
     workflows: ["ship", "audit"],
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index ac326fc39..1a363f915 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -395,6 +395,35 @@ describe("issue #129 §5 — upgrade does not force-create opt-in module files",
     expect(after).not.toContain("bkit:start");
     expect(after).not.toContain("bkit:end");
   });
+
+  it("bkit upgrade prints the adopted marker for a changed starter with a project copy", () => {
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer" }),
+      "utf-8",
+    );
+    writeVersionFile();
+    // The project's own architecture doc, plus a stale copy of the starter that the upgrade replaces.
+    fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, "docs", "architecture.md"),
+      "# Architecture\n\nThe api service talks to the worker over a queue.\n",
+      "utf-8",
+    );
+    fs.mkdirSync(path.join(tmpDir, ".bkit", "templates", "docs"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, ".bkit", "templates", "docs", "architecture.md"),
+      "# Stale starter\n",
+      "utf-8",
+    );
+
+    const result = runBkitUpgrade();
+
+    expect(result.status).toBe(0);
+    expect(combinedOutput(result)).toContain(
+      "changed: .bkit/templates/docs/architecture.md — adopted at docs/architecture.md, review your copy",
+    );
+  }, 180_000);
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/commands/install/upgrade.ts b/.bkit/core/engine/commands/install/upgrade.ts
index bb1178817..f86c8aae6 100644
--- a/.bkit/core/engine/commands/install/upgrade.ts
+++ b/.bkit/core/engine/commands/install/upgrade.ts
@@ -816,7 +816,7 @@ export async function runUpgradeCommand(upgradeFlags: UpgradeFlags): Promise<voi
     dryRun: upgradeFlags.dryRun,
     ws: { writes: [] },
   });
-  const templateReport = formatTemplateChanges(templateChanges);
+  const templateReport = formatTemplateChanges(templateChanges, process.cwd());
   if (templateReport) console.log(`${LOG_PREFIX} ${templateReport}`);
 
   // Payload view links — the same sync install runs (`.bkit/core` + `.bkit/shared`
diff --git a/.bkit/core/engine/install/project-docs.test.ts b/.bkit/core/engine/install/project-docs.test.ts
index 84326f466..3011e8e8c 100644
--- a/.bkit/core/engine/install/project-docs.test.ts
+++ b/.bkit/core/engine/install/project-docs.test.ts
@@ -10,6 +10,7 @@ import {
   LEGACY_STARTER_DIGESTS,
   LEGACY_STARTER_SOURCE_REVISION,
   PROJECT_DOC_TOPICS,
+  adoptedProjectDocPath,
   legacyDigest,
   legacyStarterTopic,
   projectDocRow,
@@ -183,6 +184,22 @@ describe("syncProjectDocs", () => {
     expect(after).not.toContain("`docs/security.md`");
   });
 
+  it("syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row", () => {
+    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n\nReal content.\n");
+    fs.mkdirSync(path.join(root, "engineering"));
+    fs.writeFileSync(path.join(root, "engineering/security-notes.md"), "# Notes\n\nOther.\n");
+    fs.appendFileSync(
+      path.join(root, ".agents/docs.md"),
+      "| `engineering/security-notes.md` | Not equivalent to `docs/security.md` |\n",
+    );
+    const r = syncProjectDocs(root, { dryRun: false });
+    expect(r.registered).toEqual(["docs/security.md"]);
+    expect(r.equivalent).toEqual([]);
+    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toContain(
+      "`docs/security.md`",
+    );
+  });
+
   it("adds no row and reports a problem when the index has a row it cannot read", () => {
     fs.writeFileSync(path.join(root, "docs/noise.md"), "# Noise\n");
     fs.appendFileSync(path.join(root, ".agents/docs.md"), "| **docs/noise.md** | Noise |\n");
@@ -194,6 +211,53 @@ describe("syncProjectDocs", () => {
   });
 });
 
+describe("adoptedProjectDocPath", () => {
+  let root: string;
+  const writeIndexRows = (rows: string): void =>
+    fs.writeFileSync(
+      path.join(root, ".agents/docs.md"),
+      "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n| Document | Scope |\n| --- | --- |\n" +
+        rows,
+    );
+  beforeEach(() => {
+    root = fs.mkdtempSync(path.join(os.tmpdir(), "adopted-doc-"));
+    fs.mkdirSync(path.join(root, "docs"));
+    fs.mkdirSync(path.join(root, "handbook"));
+    fs.mkdirSync(path.join(root, ".agents"));
+  });
+  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
+
+  it("adoptedProjectDocPath returns the recommended path, an indexed equivalent or null", () => {
+    // No index at all: only the recommended path counts.
+    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n");
+    expect(adoptedProjectDocPath(root, "security")).toBe("docs/security.md");
+    expect(adoptedProjectDocPath(root, "testing")).toBeNull();
+
+    // An indexed equivalent at another path counts; a negated or longer-suffix row does not.
+    fs.writeFileSync(path.join(root, "handbook/ops-testing.md"), "# Testing\n");
+    fs.writeFileSync(path.join(root, "handbook/ops-design.md"), "# Design\n");
+    fs.writeFileSync(path.join(root, "handbook/ops-noise.md"), "# Noise\n");
+    writeIndexRows(
+      "| `handbook/ops-testing.md` | Equivalent to `docs/testing.md` |\n" +
+        "| `handbook/ops-design.md` | Not equivalent to `docs/design.md` |\n" +
+        "| `handbook/ops-noise.md` | Equivalent to `docs/noise.mdx` |\n",
+    );
+    expect(adoptedProjectDocPath(root, "testing")).toBe("handbook/ops-testing.md");
+    expect(adoptedProjectDocPath(root, "design")).toBeNull();
+    expect(adoptedProjectDocPath(root, "noise")).toBeNull();
+
+    // The recommended path wins over an indexed equivalent.
+    fs.writeFileSync(path.join(root, "docs/testing.md"), "# Testing\n");
+    expect(adoptedProjectDocPath(root, "testing")).toBe("docs/testing.md");
+
+    // A symlink or directory at the recommended path is not an adopted copy.
+    fs.symlinkSync(path.join(root, "handbook/ops-design.md"), path.join(root, "docs/design.md"));
+    fs.mkdirSync(path.join(root, "docs/setup.md"));
+    expect(adoptedProjectDocPath(root, "design")).toBeNull();
+    expect(adoptedProjectDocPath(root, "setup")).toBeNull();
+  });
+});
+
 // ---------------------------------------------------------------------------
 // Starter shape: every project-doc starter carries the same fill-in introduction,
 // rules box and skeleton.
diff --git a/.bkit/core/engine/install/project-docs.ts b/.bkit/core/engine/install/project-docs.ts
index 9b8944313..a92873f15 100644
--- a/.bkit/core/engine/install/project-docs.ts
+++ b/.bkit/core/engine/install/project-docs.ts
@@ -441,7 +441,7 @@ export function projectDocRow(topic: ProjectDocTopic): string {
 
 /**
  * The indexed document that already covers `topic` at another path: a same-basename row, or a
- * row whose Scope names the recommended path as its equivalent (`Equivalent to docs/x.md`).
+ * row whose Scope affirms the recommended path as its equivalent (`Equivalent to docs/x.md`).
  */
 export function findIndexedEquivalent(
   rows: readonly IndexRow[],
@@ -458,7 +458,12 @@ export function listIndexedEquivalents(
 ): string[] {
   const recommended = projectDocPath(topic);
   const base = `${topic}.md`;
-  const mentions = new RegExp(`equivalent\\s+to\\s+\`?${recommended.replace(".", "\\.")}\`?`, "i");
+  // Affirmative only (no `not` / `non` before it), and the path ends at a non-word character,
+  // so `docs/x.mdx` and `docs/x.md.bak` name no equivalent.
+  const mentions = new RegExp(
+    `(?<!\\b(?:not|non)[-\\s]*)equivalent\\s+to\\s+\`?${recommended.replace(".", "\\.")}(?![\\w-]|\\.\\w)`,
+    "i",
+  );
   const found: string[] = [];
   for (const row of rows) {
     if (row.path === recommended) continue;
@@ -467,6 +472,23 @@ export function listIndexedEquivalents(
   return found;
 }
 
+/**
+ * Where the project keeps its copy of `topic`'s starter: the recommended path when it is a
+ * regular file, else the indexed equivalent that is an in-tree regular file, else null. A missing
+ * or unreadable index leaves only the recommended-path check.
+ */
+export function adoptedProjectDocPath(root: string, topic: ProjectDocTopic): string | null {
+  const recommended = projectDocPath(topic);
+  if (inspectRepoFile(root, recommended) === "regular") return recommended;
+  const index = readProjectIndex(root);
+  if (index.status !== "ok") return null;
+  return findIndexedEquivalent(
+    index.rows,
+    topic,
+    (rel) => isInTreePath(rel) && inspectRepoFile(root, rel) === "regular",
+  );
+}
+
 // ---------------------------------------------------------------------------
 // Synchronisation: migrate legacy wrappers, then register present documents
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/install/template-copies.integration.test.ts b/.bkit/core/engine/install/template-copies.integration.test.ts
index 4669c3947..df00a4fe7 100644
--- a/.bkit/core/engine/install/template-copies.integration.test.ts
+++ b/.bkit/core/engine/install/template-copies.integration.test.ts
@@ -172,11 +172,14 @@ describe("install copies the template set into .bkit/templates/", () => {
 
 describe("formatTemplateChanges", () => {
   it("names every changed, added and removed path, then points at templates.md", () => {
-    const text = formatTemplateChanges({
-      changed: [".envrc"],
-      added: [path.join(".husky", "pre-push")],
-      removed: ["old.yml"],
-    });
+    const text = formatTemplateChanges(
+      {
+        changed: [".envrc"],
+        added: [path.join(".husky", "pre-push")],
+        removed: ["old.yml"],
+      },
+      tmpDir,
+    );
     expect(text).toContain(path.join(COPIES, ".envrc"));
     expect(text).toContain(path.join(COPIES, ".husky", "pre-push"));
     expect(text).toContain(path.join(COPIES, "old.yml"));
@@ -184,23 +187,161 @@ describe("formatTemplateChanges", () => {
   });
 
   it("names the consequence when a changed template's adopted copy backs a gate", () => {
-    const text = formatTemplateChanges({
-      changed: ["slop-scan.config.json"],
-      added: [],
-      removed: [],
-    });
+    const text = formatTemplateChanges(
+      {
+        changed: ["slop-scan.config.json"],
+        added: [],
+        removed: [],
+      },
+      tmpDir,
+    );
     expect(text).toContain(path.join(COPIES, "slop-scan.config.json"));
     expect(text).toContain("slop gate may go red");
   });
 
   it("leaves a changed template with no gate consequence unannotated", () => {
-    const text = formatTemplateChanges({ changed: [".envrc"], added: [], removed: [] });
+    const text = formatTemplateChanges({ changed: [".envrc"], added: [], removed: [] }, tmpDir);
     expect(text).toContain(path.join(COPIES, ".envrc"));
     expect(text).not.toContain("slop gate may go red");
   });
 
   it("is empty when nothing changed", () => {
-    expect(formatTemplateChanges({ changed: [], added: [], removed: [] })).toBe("");
+    expect(formatTemplateChanges({ changed: [], added: [], removed: [] }, tmpDir)).toBe("");
+  });
+});
+
+describe("formatTemplateChanges marks adopted doc starters", () => {
+  const REVIEW = "review your copy";
+
+  /** The report line for each changed template, keyed by its path under the templates root. */
+  const changedLines = (changed: string[]): Map<string, string> => {
+    const report = formatTemplateChanges({ changed, added: [], removed: [] }, tmpDir);
+    const lines = report.split("\n");
+    return new Map(
+      changed.map((rel) => [
+        rel,
+        lines.find((l) => l.startsWith(`  changed: ${path.join(COPIES, rel)}`)) ?? "",
+      ]),
+    );
+  };
+
+  const writeFile = (rel: string, text = "# Doc\n\nProject text.\n"): void => {
+    fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
+    fs.writeFileSync(path.join(tmpDir, rel), text, "utf-8");
+  };
+
+  const writeIndexRows = (rows: string[]): void =>
+    writeFile(
+      ".agents/docs.md",
+      "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n| Document | Scope |\n| --- | --- |\n" +
+        rows.map((r) => `${r}\n`).join(""),
+    );
+
+  it("changed doc starter with a project copy is marked adopted", () => {
+    writeFile("docs/architecture.md");
+    writeFile("docs/components.md");
+    const lines = changedLines(["docs/architecture.md", "docs/components.md"]);
+    expect(lines.get("docs/architecture.md")).toContain(
+      "\u2014 adopted at docs/architecture.md, review your copy",
+    );
+    expect(lines.get("docs/components.md")).toContain(
+      "\u2014 adopted at docs/components.md, review your copy",
+    );
+  });
+
+  it("changed doc starter indexed under another path is marked adopted", () => {
+    writeFile("handbook/ops-testing.md");
+    writeIndexRows(["| `handbook/ops-testing.md` | Equivalent to `docs/testing.md` |"]);
+    const lines = changedLines(["docs/testing.md"]);
+    expect(lines.get("docs/testing.md")).toContain(
+      "adopted at handbook/ops-testing.md, review your copy",
+    );
+  });
+
+  it("changed doc starter with no copy and changed non-doc template are not marked", () => {
+    writeFile("docs/architecture.md");
+    const lines = changedLines(["docs/architecture.md", "docs/technology.md", ".envrc"]);
+    expect(lines.get("docs/architecture.md")).toContain(REVIEW);
+    expect(lines.get("docs/technology.md")).toContain(path.join(COPIES, "docs", "technology.md"));
+    expect(lines.get("docs/technology.md")).not.toContain(REVIEW);
+    expect(lines.get(".envrc")).toContain(path.join(COPIES, ".envrc"));
+    expect(lines.get(".envrc")).not.toContain(REVIEW);
+  });
+
+  it("changed doc starter whose recommended path is a symlink is not marked adopted", () => {
+    writeFile("docs/architecture.md");
+    fs.symlinkSync(
+      path.join(tmpDir, "docs", "architecture.md"),
+      path.join(tmpDir, "docs", "technology.md"),
+    );
+    const lines = changedLines(["docs/architecture.md", "docs/technology.md"]);
+    expect(lines.get("docs/architecture.md")).toContain(REVIEW);
+    expect(lines.get("docs/technology.md")).toContain(path.join(COPIES, "docs", "technology.md"));
+    expect(lines.get("docs/technology.md")).not.toContain(REVIEW);
+  });
+
+  it("changed doc starter whose recommended path is a directory is not marked adopted", () => {
+    writeFile("docs/architecture.md");
+    fs.mkdirSync(path.join(tmpDir, "docs", "security.md"));
+    const lines = changedLines(["docs/architecture.md", "docs/security.md"]);
+    expect(lines.get("docs/architecture.md")).toContain(REVIEW);
+    expect(lines.get("docs/security.md")).toContain(path.join(COPIES, "docs", "security.md"));
+    expect(lines.get("docs/security.md")).not.toContain(REVIEW);
+  });
+
+  it("changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted", () => {
+    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-doc-"));
+    try {
+      fs.writeFileSync(path.join(outside, "noise.md"), "# Outside\n", "utf-8");
+      writeFile("handbook/ops-testing.md");
+      writeFile("handbook/real-design.md");
+      fs.symlinkSync(
+        path.join(tmpDir, "handbook", "real-design.md"),
+        path.join(tmpDir, "handbook", "design-link.md"),
+      );
+      writeIndexRows([
+        "| `handbook/ops-testing.md` | Equivalent to `docs/testing.md` |",
+        "| `handbook/design-link.md` | Equivalent to `docs/design.md` |",
+        `| \`../${path.basename(outside)}/noise.md\` | Equivalent to \`docs/noise.md\` |`,
+      ]);
+      const lines = changedLines(["docs/testing.md", "docs/design.md", "docs/noise.md"]);
+      expect(lines.get("docs/testing.md")).toContain(REVIEW);
+      expect(lines.get("docs/design.md")).toContain(path.join(COPIES, "docs", "design.md"));
+      expect(lines.get("docs/design.md")).not.toContain(REVIEW);
+      expect(lines.get("docs/noise.md")).toContain(path.join(COPIES, "docs", "noise.md"));
+      expect(lines.get("docs/noise.md")).not.toContain(REVIEW);
+    } finally {
+      fs.rmSync(outside, { recursive: true, force: true });
+    }
+  });
+
+  it("changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted", () => {
+    writeFile("handbook/arch.md");
+    writeFile("handbook/sec-negated.md");
+    writeFile("handbook/setup-mdx.md");
+    writeIndexRows([
+      "| `handbook/arch.md` | Equivalent to `docs/architecture.md` |",
+      "| `handbook/sec-negated.md` | Not equivalent to `docs/security.md` |",
+      "| `handbook/setup-mdx.md` | Equivalent to `docs/setup.mdx` |",
+    ]);
+    const lines = changedLines(["docs/architecture.md", "docs/security.md", "docs/setup.md"]);
+    expect(lines.get("docs/architecture.md")).toContain(REVIEW);
+    expect(lines.get("docs/security.md")).toContain(path.join(COPIES, "docs", "security.md"));
+    expect(lines.get("docs/security.md")).not.toContain(REVIEW);
+    expect(lines.get("docs/setup.md")).toContain(path.join(COPIES, "docs", "setup.md"));
+    expect(lines.get("docs/setup.md")).not.toContain(REVIEW);
+  });
+
+  it("missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report", () => {
+    writeFile("docs/architecture.md");
+    expect(changedLines(["docs/architecture.md"]).get("docs/architecture.md")).toContain(
+      "adopted at docs/",
+    );
+    fs.mkdirSync(path.join(tmpDir, ".agents", "docs.md"), { recursive: true });
+    const lines = changedLines(["docs/architecture.md", "docs/technology.md"]);
+    expect(lines.get("docs/architecture.md")).toContain("adopted at docs/architecture.md");
+    expect(lines.get("docs/technology.md")).toContain(path.join(COPIES, "docs", "technology.md"));
+    expect(lines.get("docs/technology.md")).not.toContain(REVIEW);
   });
 });
 
diff --git a/.bkit/core/engine/install/template-copies.ts b/.bkit/core/engine/install/template-copies.ts
index e1df52b90..2254a8975 100644
--- a/.bkit/core/engine/install/template-copies.ts
+++ b/.bkit/core/engine/install/template-copies.ts
@@ -11,6 +11,12 @@ import {
 } from "../shared/package-roots.js";
 import { hasLintStagedConfig } from "../checks/tips/detect.js";
 import { readDependencyNames, readPackageJson } from "../shared/package-json.js";
+import {
+  adoptedProjectDocPath,
+  inspectRepoFile,
+  PROJECT_DOC_TOPICS,
+  type ProjectDocTopic,
+} from "./project-docs.js";
 import type { WriteSet } from "./write.js";
 
 export function listFilesRecursive(dir: string): string[] {
@@ -113,20 +119,39 @@ export const TEMPLATE_CHANGE_CONSEQUENCES: Readonly<Record<string, string>> = {
     "your adopted copy's guardrails exemptions are now stale; your slop gate may go red",
 };
 
-/** `  changed: <dest>`, plus the consequence when that template's adopted copy backs a gate. */
-function formatChangedLine(rel: string): string {
+/** Where the project keeps its copy of a changed `docs/{topic}.md` starter, or null. */
+function adoptedDocCopy(rel: string, cwd: string): string | null {
+  const match = /^docs\/([^/]+)\.md$/.exec(rel);
+  if (match === null) return null;
+  const topic = match[1];
+  if (topic === "components") return inspectRepoFile(cwd, rel) === "regular" ? rel : null;
+  return PROJECT_DOC_TOPICS.includes(topic as ProjectDocTopic)
+    ? adoptedProjectDocPath(cwd, topic as ProjectDocTopic)
+    : null;
+}
+
+/**
+ * `  changed: <dest>`, plus the consequence when that template's adopted copy backs a gate, and
+ * `adopted at <path>, review your copy` when the project keeps a copy of a changed doc starter.
+ */
+function formatChangedLine(rel: string, cwd: string): string {
   const line = `  changed: ${path.join(TEMPLATE_COPIES_DIR, rel)}`;
   const note = TEMPLATE_CHANGE_CONSEQUENCES[rel];
-  return note === undefined ? line : `${line} — ${note}`;
+  const adopted = adoptedDocCopy(rel, cwd);
+  const parts = [
+    ...(note === undefined ? [] : [note]),
+    ...(adopted === null ? [] : [`adopted at ${adopted}, review your copy`]),
+  ];
+  return parts.length === 0 ? line : `${line} \u2014 ${parts.join("; ")}`;
 }
 
 /**
  * The upgrade report for a template sync: one line per changed, added or removed
  * template, then where to read about adopting them. Empty when nothing changed.
  */
-export function formatTemplateChanges(changes: TemplateCopyChanges): string {
+export function formatTemplateChanges(changes: TemplateCopyChanges, cwd: string): string {
   const lines = [
-    ...changes.changed.map(formatChangedLine),
+    ...changes.changed.map((rel) => formatChangedLine(rel, cwd)),
     ...changes.added.map((p) => `  added:   ${path.join(TEMPLATE_COPIES_DIR, p)}`),
     ...changes.removed.map((p) => `  removed: ${path.join(TEMPLATE_COPIES_DIR, p)}`),
   ];
diff --git a/DETAILS.md b/DETAILS.md
index c92263423..30eb17f77 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -322,6 +322,7 @@ The ones that matter most, in the order to adopt them:
 | **Context connectors** | `/bkit-debug` reads the real errors instead of guessing from the code: 10+ ready-made connectors for CI, error trackers, hosting, databases, payments, email, queues and the web. |
 | **Secrets sync** | Keeps every password and key the same everywhere: one local file, one command to push it to Vercel, GitHub Actions, Google Cloud, Supabase, Expo and Cursor's cloud agents, another to prove every copy matches without printing a value. Prevents "works for me, broken in production". |
 | **graphify** | Draws your code as a map (`docs/capabilities.md`), so agents check what already exists before building it again. The map marks likely problems in red, and the check fails when the map falls behind the code ([bkit's own map below](#code-map)). |
+| **Project docs** | Fill the project docs in waves, because each doc reads facts the earlier ones record. |
 | **Dependency updates** | Small, grouped update pull requests from Renovate or Dependabot instead of one big risky upgrade later. GitHub Actions stay pinned, and security fixes skip the queue. |
 | **Security scan** | Trivy fails the check when a change adds a known-vulnerable library in any language, a risky container or cluster setting, or a committed password. A daily run catches problems that have no fix yet, which an updater never shows. |
 | **Audits** | 35 specialist checklists, one per area: testing, security, privacy, reliability, cost and more. Already installed in `docs/templates/`, so there's nothing to copy: name one to `@bkit-audit-generate` and hand its report to `/bkit-plan` ([above](#audits)). |
@@ -348,7 +349,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1857 symbols · 54 files"]
-    n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
+    n_bkit_core_engine_install["install<br/>361 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>156 symbols · 13 files<br/>1 open finding"]
diff --git a/dist/checks/after/index.js b/dist/checks/after/index.js
index 2b6b9a251..9a16939f7 100644
--- a/dist/checks/after/index.js
+++ b/dist/checks/after/index.js
@@ -13,6 +13,7 @@ import { buildCloudDashboardsAdvisory, detectCiRouterSecrets, detectGhMcpToken }
 import { buildCloudSetupAdvisory, buildGithubProjectAdvisory, buildGithubProjectTokenScopeAdvisory, buildTrackerSetupAdvisory, buildTrivyProtectionAdvisory, detectActionsWritePermissions, detectMainBranchProtection, } from "./github.js";
 import { buildDepUpdaterSetupAdvisory, detectBkitStubs, detectProjectDocs, detectValeMissing, detectValePackageNotSynced, detectWorkflowLintToolsMissing, } from "./tools.js";
 import { detectBkitCloudYmlAlwaysTrueGate, detectCiScriptsOldNames, detectCiYmlCapstoneContractDrift, detectCiYmlMissingActionlint, detectCiYmlRunInjection, detectGhaFloatingTags, detectRunLevelsNotComposed, detectTaggedTestsWithoutCiHome, detectTestIntegrationEnv, detectTurboIntegrationInputs, } from "./ci-yml.js";
+import { isAdvisorySuppressed, } from "./suppression.js";
 import { dropTipSilencedAdvisories, setupTipsChecklistLines, setupTipsMarkdownLines, } from "../tips/index.js";
 // ---------------------------------------------------------------------------
 // formatChecklist — pure renderer
@@ -373,8 +374,12 @@ export function runPostInstallCheck(preflightAdvisories, cwd = process.cwd(), su
     for (const stub of detectBkitStubs(cwd))
         phase3.push(stub);
     // Project documents (docs/*.md): missing, empty, starter-only or unindexed. Advisory only.
-    for (const f of detectProjectDocs(cwd, onSuppressed))
-        phase3.push(f);
+    for (const f of detectProjectDocs(cwd)) {
+        if (!isAdvisorySuppressed(cwd, f.id, f.severity))
+            phase3.push(f);
+        else
+            onSuppressed?.({ id: f.id, scope: "." });
+    }
     // turbo.json inputs for cache-replay safety (KN-24).
     for (const f of detectTurboIntegrationInputs(cwd))
         phase3.push(f);
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index 229e1ed48..caf15a472 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -8,7 +8,6 @@ import { readTextFile } from "../../shared/json.js";
 import { getPkgRoot } from "../../shared/package-roots.js";
 import { PROJECT_DOC_TOPICS, PROJECT_INDEX_PATH, findIndexedEquivalent, listIndexedEquivalents, inspectRepoFile, isInTreePath, legacyStarterTopic, normalizeLegacyText, projectDocPath, readProjectIndex, starterPath, } from "../../install/project-docs.js";
 import { stripManagedWrapper } from "../../install/managed-block.js";
-import { isAdvisorySuppressed } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import { DEP_UPDATER_NAMES, findDepUpdaterConfigs, } from "../../shared/dep-updater.js";
 /** True when `cmd --version` runs (binary on PATH, exits 0). */
@@ -376,12 +375,11 @@ function assessDocText(cwd, topic, text) {
  * file outside the repository. A document that differs from every starter is a candidate for
  * the agent to assess; the mechanical read makes no claim about what it covers.
  */
-export function detectProjectDocs(cwd, onSuppressed) {
+export function detectProjectDocs(cwd) {
     const index = readProjectIndex(cwd);
     const rows = index.status === "ok" ? index.rows : [];
     const indexedPaths = new Set(rows.map((r) => r.path));
     const missing = [];
-    const empty = [];
     const unpopulated = [];
     const unindexed = [];
     const unindexedWrapped = [];
@@ -431,9 +429,7 @@ export function detectProjectDocs(cwd, onSuppressed) {
         if (wrapper.status === "ambiguous")
             cleanup.push(`${target} (${wrapper.problem})`);
         const assessed = assessDocText(cwd, topic, read.text);
-        if (assessed === "empty")
-            empty.push(target);
-        else if (assessed === "unpopulated")
+        if (assessed === "empty" || assessed === "unpopulated")
             unpopulated.push(target);
         else if (index.status === "ok" && !indexedPaths.has(target)) {
             const covering = findIndexedEquivalent(rows, topic, (row) => isInTreePath(row) && inspectRepoFile(cwd, row) === "regular");
@@ -469,23 +465,15 @@ export function detectProjectDocs(cwd, onSuppressed) {
             id: "project-docs-missing",
             severity: "advisory",
             detect: `No project document covers: ${missing.join(", ")}.`,
-            action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply.`,
-        });
-    }
-    if (empty.length > 0) {
-        findings.push({
-            id: "project-docs-empty",
-            severity: "advisory",
-            detect: `These project documents are empty: ${empty.join(", ")}.`,
-            action: `Write the project's facts into each file, or delete it and remove its row from ${PROJECT_INDEX_PATH}. Agents cannot use an empty document.`,
+            action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply. Fill the docs in the order of .bkit/templates.md § Project docs — adoption order.`,
         });
     }
     if (unpopulated.length > 0) {
         findings.push({
             id: "project-docs-unpopulated",
             severity: "advisory",
-            detect: `These project documents still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
-            action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes.`,
+            detect: `These project documents are empty or still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
+            action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes. Fill the docs in the order of .bkit/templates.md § Project docs — adoption order.`,
         });
     }
     if (unindexed.length > 0) {
@@ -536,10 +524,5 @@ export function detectProjectDocs(cwd, onSuppressed) {
             action: `Replace each with a regular file inside the repository (no symbolic link, no \`..\` path), or repair the \`## Project Documents\` table in ${PROJECT_INDEX_PATH}. bkit changes none of them itself.`,
         });
     }
-    return findings.filter((f) => {
-        if (!isAdvisorySuppressed(cwd, f.id, f.severity))
-            return true;
-        onSuppressed?.({ id: f.id, scope: "." });
-        return false;
-    });
+    return findings;
 }
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 7c5df7f9f..32444cef1 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -14,7 +14,7 @@
 // Text rules: `line`, `why`, `caution` and `ask` are for the person, in plain English, and
 // never name an outside service — examples of specific services go in `steps`, which is
 // for the agent. A template's benefit reads the same here, in its `.bkit/templates.md`
-// section opener and in the README's "Templates ready to adopt" row; change all three in
+// section opener and in `DETAILS.md` § Templates ready to adopt; change all three in
 // the same commit.
 //
 // Detection rules: every `fires` is local (files, settings, environment) — no network. The
@@ -30,7 +30,7 @@ import { detectContextFetchMissing } from "../before/context-fetch.js";
 import { detectBlankDotenvKeys, detectDirenvMissing, detectDirenvNotAllowed, detectMissingDotenv, isCloudOrCi, } from "../before/env.js";
 import { detectGhMcpToken, hasGithubMcpServer } from "../after/auth.js";
 import { buildTrackerSetupAdvisory } from "../after/github.js";
-import { buildDepUpdaterSetupAdvisory } from "../after/tools.js";
+import { buildDepUpdaterSetupAdvisory, detectProjectDocs } from "../after/tools.js";
 import { detectInstalledHostModules } from "../../install/hosts.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { anyWorkflowMentions, claudeSettingsHas, codexTopLevelHas, exists, hasJsTestRunner, hasLintStagedConfig, hasMcpServer, hasNewerBkit, hasTestLinter, hasUnsharedFriction, readsBkitText, unlockedMcpServers, } from "./detect.js";
@@ -322,6 +322,18 @@ export const SETUP_TIPS = [
         steps: "`.bkit/templates.md` § graphify.",
         fires: (cwd) => !exists(cwd, "scripts/graphify"),
     },
+    {
+        id: "project-docs",
+        workflows: ["design", "plan", "build"],
+        title: "Project docs",
+        line: "Fill the project docs in waves, because each doc reads facts the earlier ones record.",
+        why: "Agents read your architecture, testing and security docs before they plan and build. A doc that is missing or still holds the starter text gives them nothing to go on, so they guess from the code each time.",
+        caution: "Ignoring either the missing-doc advisory or the unfilled-doc advisory also silences this tip and the other advisory.",
+        ask: "Fill in my project docs in the order of .bkit/templates.md § Project docs — adoption order: copy each missing starter from .bkit/templates/docs/ to docs/, fill it from the repository, and add its row to .agents/docs.md.",
+        steps: "`.bkit/templates.md` § Project docs — adoption order.",
+        advisories: ["project-docs-missing", "project-docs-unpopulated"],
+        fires: (cwd) => detectProjectDocs(cwd).some((f) => f.id === "project-docs-missing" || f.id === "project-docs-unpopulated"),
+    },
     {
         id: "dependabot-renovate",
         workflows: ["ship", "audit"],
diff --git a/dist/commands/install/upgrade.js b/dist/commands/install/upgrade.js
index f5b0868ea..4789a9799 100644
--- a/dist/commands/install/upgrade.js
+++ b/dist/commands/install/upgrade.js
@@ -581,7 +581,7 @@ export async function runUpgradeCommand(upgradeFlags) {
         dryRun: upgradeFlags.dryRun,
         ws: { writes: [] },
     });
-    const templateReport = formatTemplateChanges(templateChanges);
+    const templateReport = formatTemplateChanges(templateChanges, process.cwd());
     if (templateReport)
         console.log(`${LOG_PREFIX} ${templateReport}`);
     // Payload view links — the same sync install runs (`.bkit/core` + `.bkit/shared`
diff --git a/dist/install/project-docs.js b/dist/install/project-docs.js
index 6088a72b7..97ed7ae41 100644
--- a/dist/install/project-docs.js
+++ b/dist/install/project-docs.js
@@ -386,7 +386,7 @@ export function projectDocRow(topic) {
 }
 /**
  * The indexed document that already covers `topic` at another path: a same-basename row, or a
- * row whose Scope names the recommended path as its equivalent (`Equivalent to docs/x.md`).
+ * row whose Scope affirms the recommended path as its equivalent (`Equivalent to docs/x.md`).
  */
 export function findIndexedEquivalent(rows, topic, usable = () => true) {
     return listIndexedEquivalents(rows, topic).find(usable) ?? null;
@@ -395,7 +395,9 @@ export function findIndexedEquivalent(rows, topic, usable = () => true) {
 export function listIndexedEquivalents(rows, topic) {
     const recommended = projectDocPath(topic);
     const base = `${topic}.md`;
-    const mentions = new RegExp(`equivalent\\s+to\\s+\`?${recommended.replace(".", "\\.")}\`?`, "i");
+    // Affirmative only (no `not` / `non` before it), and the path ends at a non-word character,
+    // so `docs/x.mdx` and `docs/x.md.bak` name no equivalent.
+    const mentions = new RegExp(`(?<!\\b(?:not|non)[-\\s]*)equivalent\\s+to\\s+\`?${recommended.replace(".", "\\.")}(?![\\w-]|\\.\\w)`, "i");
     const found = [];
     for (const row of rows) {
         if (row.path === recommended)
@@ -405,6 +407,20 @@ export function listIndexedEquivalents(rows, topic) {
     }
     return found;
 }
+/**
+ * Where the project keeps its copy of `topic`'s starter: the recommended path when it is a
+ * regular file, else the indexed equivalent that is an in-tree regular file, else null. A missing
+ * or unreadable index leaves only the recommended-path check.
+ */
+export function adoptedProjectDocPath(root, topic) {
+    const recommended = projectDocPath(topic);
+    if (inspectRepoFile(root, recommended) === "regular")
+        return recommended;
+    const index = readProjectIndex(root);
+    if (index.status !== "ok")
+        return null;
+    return findIndexedEquivalent(index.rows, topic, (rel) => isInTreePath(rel) && inspectRepoFile(root, rel) === "regular");
+}
 const PROBLEM_TEXT = {
     "missing-partner": "one of `bkit:start` / `bkit:end` is missing",
     inverted: "`bkit:end` comes before `bkit:start`",
diff --git a/dist/install/template-copies.js b/dist/install/template-copies.js
index eaf8b10df..ff9659897 100644
--- a/dist/install/template-copies.js
+++ b/dist/install/template-copies.js
@@ -5,6 +5,7 @@ import * as path from "node:path";
 import { NPM_STRIP_REMAP, getPkgRoot, getTemplatesRoot, TEMPLATE_COPIES_DIR, } from "../shared/package-roots.js";
 import { hasLintStagedConfig } from "../checks/tips/detect.js";
 import { readDependencyNames, readPackageJson } from "../shared/package-json.js";
+import { adoptedProjectDocPath, inspectRepoFile, PROJECT_DOC_TOPICS, } from "./project-docs.js";
 export function listFilesRecursive(dir) {
     if (!fs.existsSync(dir))
         return [];
@@ -97,19 +98,39 @@ export const TEMPLATES_POINTER = "Templates (adopt, do not skip): read .bkit/tem
 export const TEMPLATE_CHANGE_CONSEQUENCES = {
     "slop-scan.config.json": "your adopted copy's guardrails exemptions are now stale; your slop gate may go red",
 };
-/** `  changed: <dest>`, plus the consequence when that template's adopted copy backs a gate. */
-function formatChangedLine(rel) {
+/** Where the project keeps its copy of a changed `docs/{topic}.md` starter, or null. */
+function adoptedDocCopy(rel, cwd) {
+    const match = /^docs\/([^/]+)\.md$/.exec(rel);
+    if (match === null)
+        return null;
+    const topic = match[1];
+    if (topic === "components")
+        return inspectRepoFile(cwd, rel) === "regular" ? rel : null;
+    return PROJECT_DOC_TOPICS.includes(topic)
+        ? adoptedProjectDocPath(cwd, topic)
+        : null;
+}
+/**
+ * `  changed: <dest>`, plus the consequence when that template's adopted copy backs a gate, and
+ * `adopted at <path>, review your copy` when the project keeps a copy of a changed doc starter.
+ */
+function formatChangedLine(rel, cwd) {
     const line = `  changed: ${path.join(TEMPLATE_COPIES_DIR, rel)}`;
     const note = TEMPLATE_CHANGE_CONSEQUENCES[rel];
-    return note === undefined ? line : `${line} — ${note}`;
+    const adopted = adoptedDocCopy(rel, cwd);
+    const parts = [
+        ...(note === undefined ? [] : [note]),
+        ...(adopted === null ? [] : [`adopted at ${adopted}, review your copy`]),
+    ];
+    return parts.length === 0 ? line : `${line} \u2014 ${parts.join("; ")}`;
 }
 /**
  * The upgrade report for a template sync: one line per changed, added or removed
  * template, then where to read about adopting them. Empty when nothing changed.
  */
-export function formatTemplateChanges(changes) {
+export function formatTemplateChanges(changes, cwd) {
     const lines = [
-        ...changes.changed.map(formatChangedLine),
+        ...changes.changed.map((rel) => formatChangedLine(rel, cwd)),
         ...changes.added.map((p) => `  added:   ${path.join(TEMPLATE_COPIES_DIR, p)}`),
         ...changes.removed.map((p) => `  removed: ${path.join(TEMPLATE_COPIES_DIR, p)}`),
     ];
diff --git a/docs/architecture.md b/docs/architecture.md
index b29be96bd..732d0a07b 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -28,7 +28,7 @@ Workflow commands pass explicit session or exact-run ownership into the shared t
 
 ## Project documents boundary
 
-The ten project documents (`docs/architecture.md` ... `docs/setup.md`) are consumer-owned. Their starters ship in `.bkit/templates/docs/`, which `bkit install` and `bkit upgrade` refresh as plain template copies. The installer never creates a project document. `.bkit/core/engine/install/project-docs.ts` holds the one topic catalog, the legacy-starter digests and two surgical edits: remove the ownership wrapper lines of a document an older release installed as a managed block (every other byte stays), and insert a `Project Documents` row in `.agents/docs.md` below the closing `bkit:end`. An ambiguous wrapper, an unsafe path or an unreadable index is left as it is and reported. `bkit check` and `bkit doctor` only detect: `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts` raises advisories through the shared checklist and the `bkit.advisories.ignore` opt-out. Uninstall removes the template folder and keeps every adopted document.
+The ten project documents (`docs/architecture.md` ... `docs/setup.md`) are consumer-owned. Their starters ship in `.bkit/templates/docs/`, which `bkit install` and `bkit upgrade` refresh as plain template copies. The installer never creates a project document. `.bkit/core/engine/install/project-docs.ts` holds the one topic catalog, the legacy-starter digests and two surgical edits: remove the ownership wrapper lines of a document an older release installed as a managed block (every other byte stays), and insert a `Project Documents` row in `.agents/docs.md` below the closing `bkit:end`. An ambiguous wrapper, an unsafe path or an unreadable index is left as it is and reported. `bkit check` and `bkit doctor` only detect: `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts` raises advisories through the shared checklist and the `bkit.advisories.ignore` opt-out. Uninstall removes the template folder and keeps every adopted document. `bkit upgrade` marks a changed doc starter whose project copy exists, found by `adoptedProjectDocPath` through the same affirmative equivalence `detectProjectDocs` uses.
 
 ## Package Boundaries
 
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 8e082c7a0..387023b49 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -165,7 +165,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1857 symbols · 54 files"]
-    n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
+    n_bkit_core_engine_install["install<br/>361 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>156 symbols · 13 files<br/>1 open finding"]
@@ -351,8 +351,8 @@ flowchart LR
         n_bkit_core_engine_install_modules_cursor["cursor<br/>3 symbols · 1 files"]
         n_bkit_core_engine_install_modules_opencode["opencode<br/>10 symbols · 1 files"]
       end
-      n_bkit_core_engine_install_project_docs["project-docs<br/>33 symbols · 1 files"]
-      n_bkit_core_engine_install_template_copies["template-copies<br/>13 symbols · 1 files"]
+      n_bkit_core_engine_install_project_docs["project-docs<br/>34 symbols · 1 files"]
+      n_bkit_core_engine_install_template_copies["template-copies<br/>14 symbols · 1 files"]
     end
     subgraph gn_bkit_core_engine_ledgers[".bkit/core/engine/ledgers"]
       n_bkit_core_engine_ledgers_compact["compact<br/>8 symbols · 1 files"]
@@ -561,6 +561,7 @@ flowchart LR
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_render_hosts
   n_bkit_core_engine_install_modules_opencode -->|7| n_bkit_core_engine_install_cloud_env
+  n_bkit_core_engine_install_template_copies -->|7| n_bkit_core_engine_install_project_docs
   n_bkit_core_engine_commands_workflow_completeness -->|7| n_bkit_core_engine_checks_status_holes
   n_bkit_core_engine_commands_workflow_runtime -->|7| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_checks_before_files -->|6| n_bkit_core_engine_shared_package_roots
@@ -925,4 +926,5 @@ flowchart LR
   linkStyle 217 stroke:#59636e80,stroke-width:2px
   linkStyle 218 stroke:#59636e80,stroke-width:2px
   linkStyle 219 stroke:#59636e80,stroke-width:2px
+  linkStyle 220 stroke:#59636e80,stroke-width:2px
 ```
diff --git a/docs/observability.md b/docs/observability.md
index 4f1596b53..5247456c5 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -215,8 +215,7 @@ Post-install findings via `formatChecklist(ctx.advisories)` (`.bkit/core/engine/
 | --- | --- |
 | `project-docs-index-missing` | `.agents/docs.md` is absent |
 | `project-docs-missing` | A recommended topic has no document and no indexed equivalent |
-| `project-docs-empty` | A covering document is empty |
-| `project-docs-unpopulated` | A covering document is still a current or legacy starter, or only headings |
+| `project-docs-unpopulated` | A covering document is empty, still a current or legacy starter, or only headings |
 | `project-docs-unindexed` | A populated candidate exists but the index does not list it, or lists another document for the same topic |
 | `project-docs-cleanup` | A project document keeps a bkit ownership wrapper (`bkit:start` / `bkit:end` lines or the `bkit:managed` notice) that could not be removed safely |
 | `project-docs-ambiguous` | An index row or target is unsafe, unreadable or malformed |
diff --git a/docs/testing.md b/docs/testing.md
index 05aae41f4..031f370c5 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -32,27 +32,33 @@ CI runs the tiers through the bkit scaffold as one parallel lane (job) per tier,
 
 The graph is flat and wide for static / unit / build / integration: scope fans out, and the capstone joins. **One exception:** when `bkit-tests-migration` owns the shared-remote migration apply, e2e / live `needs:` that lane for ordering. Never gate live behind static / unit / build / e2e:
 
+Each arrow points from a lane to a lane that waits for it (`needs:`); the dashed arrow marks a wait that is only ordering.
+
+```mermaid
+flowchart LR
+    scope["bkit-tests-scope (always on, never skips, ~15s)"] --> static["bkit-tests-static"]
+    scope --> unit["bkit-tests-unit"]
+    scope --> integration["bkit-tests-integration"]
+    scope --> buildweb["bkit-tests-build-web"]
+    scope --> buildios["bkit-tests-build-ios"]
+    scope --> buildandroid["bkit-tests-build-android"]
+    scope --> migration["bkit-tests-migration"]
+    migration --> deploy["bkit-tests-deploy (default-branch push only; promotes)"]
+    buildweb --> deploy
+    migration --> reset["bkit-tests-reset (lease)"]
+    reset --> e2eweb["bkit-tests-e2e-web"]
+    reset --> liveweb["bkit-tests-live-web"]
+    reset --> e2eios["bkit-tests-e2e-ios"]
+    reset --> e2eandroid["bkit-tests-e2e-android"]
+    deploy -.-> reset
+    e2eweb --> cleanup["bkit-tests-cleanup (always(); releases the lease)"]
+    liveweb --> cleanup
+    e2eios --> cleanup
+    e2eandroid --> cleanup
+    cleanup --> check["bkit-tests-check (needs: scope + every lane you have, deploy included)"]
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
 
+```
   static/unit/integration/build-*: needs:[bkit-tests-scope]; if: run_level != 'none'
   bkit-tests-migration:            needs:[bkit-tests-scope]; no job-level if (always-on)
   bkit-tests-deploy:               needs:[bkit-tests-migration, bkit-tests-build-web]; default-branch push only
@@ -718,6 +724,7 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 
 - `install/project-docs.test.ts` and the install and upgrade integration tests cover template refresh, the ownership migration, index registration and uninstall preserving adopted documents.
 - `checks/after/tools.test.ts` and `checks/after/index.test.ts` cover `detectProjectDocs` states, equivalents, unsafe paths, suppression and the advisory-only severity.
+- `install/project-docs.test.ts` (starter shape, `adoptedProjectDocPath`, equivalence), `checks/tips/catalogue.test.ts` (the `project-docs` tip), `checks/after/tools.test.ts` (advisory text and equivalence), `install/template-copies.integration.test.ts` and `commands/install/upgrade.integration.test.ts` (the adopted-starter marker in the upgrade report) cover the adoption pointers.
 - `commands/workflow/summary.test.ts` and `commands/workflow/workflows.integration.test.ts` cover warning aggregation for the active run through the real `workflows summary` command.
 - `audits/repo/shipped-docs-refs.test.ts` covers the responsibility inventory in the workflow and prompt catalogs, the named references and the warning contracts.
 
