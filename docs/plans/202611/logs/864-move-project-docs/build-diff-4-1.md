diff --git a/.bkit/core/engine/checks/after/tools.test.ts b/.bkit/core/engine/checks/after/tools.test.ts
index 4b4b4ccab..9152d0798 100644
--- a/.bkit/core/engine/checks/after/tools.test.ts
+++ b/.bkit/core/engine/checks/after/tools.test.ts
@@ -12,7 +12,7 @@ import {
   buildDepUpdaterSetupAdvisory,
   detectProjectDocs,
 } from "./tools";
-import { LEGACY_STARTER_SOURCE_REVISION } from "../../install/project-docs";
+import { LEGACY_STARTER_SOURCE_REVISION, syncProjectDocs } from "../../install/project-docs";
 
 // ---------------------------------------------------------------------------
 // Module-level mock for node:child_process
@@ -627,4 +627,62 @@ describe("detectProjectDocs", () => {
       fs.rmSync(outside, { recursive: true, force: true });
     }
   });
+  /** The v6.1.1 shipped text of a topic as it was rendered into a consumer repo. */
+  async function renderedV611(topic: string, branch: string): Promise<string> {
+    const cp = await vi.importActual<typeof import("node:child_process")>("node:child_process");
+    const raw = cp.execFileSync("git", ["show", `v6.1.1:.bkit/shared/docs/${topic}.md`], {
+      encoding: "utf8",
+      stdio: ["ignore", "pipe", "pipe"],
+      cwd: originalCwd,
+    });
+    return raw
+      .replace(
+        "{{BKIT_MANAGED_MARKER}}",
+        "<!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->",
+      )
+      .replace(/\{\{DEFAULT_BRANCH\}\}/g, branch);
+  }
+
+  it("recognizes the v6.1.1 untouched security starter as unpopulated", async () => {
+    writeDoc("docs/security.md", await renderedV611("security", "main"));
+    writeIndex([{ doc: "docs/security.md" }]);
+    const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id === "project-docs-unpopulated");
+    expect(unpopulated).toBeDefined();
+    expect(unpopulated!.detect).toContain("docs/security.md");
+  });
+
+  it("recognizes a legacy deployments starter rendered with default branch dev", async () => {
+    writeDoc("docs/deployments.md", await renderedV611("deployments", "dev"));
+    writeIndex([{ doc: "docs/deployments.md" }]);
+    const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id === "project-docs-unpopulated");
+    expect(unpopulated).toBeDefined();
+    expect(unpopulated!.detect).toContain("docs/deployments.md");
+  });
+
+  it("returns an advisory instead of throwing when docs is a regular file", () => {
+    fs.writeFileSync(path.join(tmpDir, "docs"), "not a directory\n");
+    writeIndex([{ doc: "docs/security.md" }]);
+    let findings: ReturnType<typeof detectProjectDocs> = [];
+    expect(() => {
+      findings = detectProjectDocs(tmpDir);
+    }).not.toThrow();
+    const ambiguous = findings.find((f) => f.id === "project-docs-ambiguous");
+    expect(ambiguous).toBeDefined();
+    expect(ambiguous!.severity).toBe("advisory");
+    expect(ambiguous!.detect).toContain("docs/");
+  });
+
+  it("does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent", () => {
+    writeDoc("docs/security.md", POPULATED);
+    writeDoc("engineering/security.md", POPULATED);
+    writeIndex([{ doc: "engineering/security.md", scope: "Equivalent to docs/security.md" }]);
+    syncProjectDocs(tmpDir, { dryRun: false });
+    const promised = detectProjectDocs(tmpDir)
+      .filter((f) => f.id === "project-docs-unindexed")
+      .filter((f) => f.detect.includes("docs/security.md"))
+      .map((f) => f.action)
+      .join("\n");
+    // Sync either registered the doc (no advisory) or the advisory must not promise upgrade will.
+    expect(promised).not.toContain("bkit upgrade");
+  });
 });
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index 5d61664a7..9c80852c2 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -14,6 +14,7 @@ import {
   type ProjectDocTopic,
   findIndexedEquivalent,
   inspectRepoFile,
+  isInTreePath,
   legacyStarterTopic,
   normalizeLegacyText,
   projectDocPath,
@@ -444,12 +445,6 @@ function readStarterText(cwd: string, topic: ProjectDocTopic): string | null {
   return null;
 }
 
-/** True when `rel` is a repo-relative path with no parent or absolute segments. */
-function isInTreePath(rel: string): boolean {
-  if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel)) return false;
-  return !rel.split(/[\\/]/).includes("..");
-}
-
 type DocAssessment = "empty" | "unpopulated" | "candidate";
 
 /** Mechanical read of a project document: empty, an untouched starter, or a candidate. */
@@ -489,6 +484,7 @@ export function detectProjectDocs(
   const empty: string[] = [];
   const unpopulated: string[] = [];
   const unindexed: string[] = [];
+  const duplicates: string[] = [];
   const ambiguous: string[] = [];
 
   for (const topic of PROJECT_DOC_TOPICS) {
@@ -524,7 +520,16 @@ export function detectProjectDocs(
     const assessed = assessDocText(cwd, topic, read.text);
     if (assessed === "empty") empty.push(target);
     else if (assessed === "unpopulated") unpopulated.push(target);
-    else if (index.status === "ok" && !indexedPaths.has(target)) unindexed.push(target);
+    else if (index.status === "ok" && !indexedPaths.has(target)) {
+      const covering = findIndexedEquivalent(
+        rows,
+        topic,
+        (row) => isInTreePath(row) && inspectRepoFile(cwd, row) === "regular",
+      );
+      if (covering !== null && target === recommended)
+        duplicates.push(`${target} (beside ${covering})`);
+      else unindexed.push(target);
+    }
   }
 
   const findings: PreflightFinding[] = [];
@@ -570,6 +575,14 @@ export function detectProjectDocs(
       action: `Add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH}, or run \`bkit upgrade\` to register the default paths.`,
     });
   }
+  if (duplicates.length > 0) {
+    findings.push({
+      id: "project-docs-unindexed",
+      severity: "advisory",
+      detect: `These project documents exist but ${PROJECT_INDEX_PATH} lists another document for the same topic: ${duplicates.join(", ")}.`,
+      action: `bkit does not register them while the other document is indexed. Keep one: delete the unused file, or add a row for the second one by hand under \`## Project Documents\` in ${PROJECT_INDEX_PATH}.`,
+    });
+  }
   if (ambiguous.length > 0) {
     findings.push({
       id: "project-docs-ambiguous",
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 89e03a1a5..c0e6fd349 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -996,4 +996,88 @@ describe("buildSummary", () => {
     expect(s.markdown).toContain("PRETTY-ACTION");
     expect(s.markdown).toContain("ONELINE-ACTION");
   });
+  it("excludes raw tracker text in related-issues.md from documentation warnings", () => {
+    const text = [
+      "# Related issues",
+      "",
+      "## Documentation Warnings",
+      "",
+      "```jsonl",
+      JSON.stringify({
+        topic: "security",
+        gap: "starter-only",
+        recommendedPath: "docs/security.md",
+        alternativeEvidence: "TRACKER-EVIDENCE",
+        action: "TRACKER-INJECTED-ACTION",
+      }),
+      "```",
+      "",
+    ].join("\n");
+    const s = buildSummary(
+      input({
+        rows: [
+          {
+            type: "step-done",
+            step: "plan-fetch-context",
+            verdict: "PASS",
+            artifacts: [
+              "log/related-issues.md",
+              "log/related-failures.md",
+              "log/related-deferrals.md",
+            ],
+          },
+        ],
+        read: reader({
+          "log/related-issues.md": text,
+          "log/related-failures.md": text,
+          "log/related-deferrals.md": text,
+        }),
+      }),
+    );
+    expect(s.markdown).not.toContain("TRACKER-INJECTED-ACTION");
+    expect(s.markdown).not.toContain("## Documentation Warnings");
+  });
+
+  it("ignores warning records inside an UNTRUSTED fence", () => {
+    const rec = (action: string) =>
+      JSON.stringify({
+        topic: "security",
+        gap: "starter-only",
+        recommendedPath: "docs/security.md",
+        alternativeEvidence: "e",
+        action,
+      });
+    const text = [
+      "Verdict: PASS",
+      "",
+      "## Documentation Warnings",
+      "",
+      "```jsonl",
+      rec("KEEP-ACTION"),
+      "===== BEGIN UNTRUSTED =====",
+      rec("UNTRUSTED-ACTION"),
+      "===== END UNTRUSTED =====",
+      "```",
+      "",
+      "===== BEGIN UNTRUSTED =====",
+      "## Documentation Warnings",
+      "",
+      "```jsonl",
+      rec("UNTRUSTED-SECTION-ACTION"),
+      "```",
+      "===== END UNTRUSTED =====",
+      "",
+    ].join("\n");
+    const s = buildSummary(
+      input({
+        rows: [
+          { type: "step-done", step: "build-plan-tasks", verdict: "PASS", artifacts: ["log/a.md"] },
+        ],
+        read: reader({ "log/a.md": text }),
+      }),
+    );
+    expect(s.markdown).toContain("KEEP-ACTION");
+    expect(s.markdown).not.toContain("UNTRUSTED-ACTION");
+    expect(s.markdown).not.toContain("UNTRUSTED-SECTION-ACTION");
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index 51852041d..3bdc0e263 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -150,7 +150,15 @@ const WARNING_FIELDS = [
   "action",
 ] as const;
 /** Raw inputs (`*-input-N.md`) are untrusted: never a source of warnings. */
-const isRawInput = (rel: string) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel);
+const isRawInput = (rel: string) =>
+  /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel) ||
+  /(^|\/)related-(issues|failures|deferrals)\.md$/.test(rel);
+/** Text between the untrusted-content markers is external data: never a source of warnings. */
+const stripUntrusted = (text: string) =>
+  text.replace(
+    /^[^\n]*={5} BEGIN UNTRUSTED ={5}[\s\S]*?(?:={5} END UNTRUSTED ={5}[^\n]*(?:\r?\n|$)|(?![\s\S]))/gm,
+    "",
+  );
 
 /**
  * The top-level `{...}` objects in a fence body, in order. Each may span several lines (prettier
@@ -201,8 +209,9 @@ function documentationWarnings(rows: Row[], read: (rel: string) => string | null
     for (const rel of artifactsOf(row)) {
       if (!rel.endsWith(".md") || isRawInput(rel) || seenFiles.has(rel)) continue;
       seenFiles.add(rel);
-      const text = read(rel);
-      if (text === null) continue;
+      const raw = read(rel);
+      if (raw === null) continue;
+      const text = stripUntrusted(raw);
       const section = /^## Documentation Warnings[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
         text,
       );
diff --git a/.bkit/core/engine/install/managed-block.test.ts b/.bkit/core/engine/install/managed-block.test.ts
index 997351244..d41d109cc 100644
--- a/.bkit/core/engine/install/managed-block.test.ts
+++ b/.bkit/core/engine/install/managed-block.test.ts
@@ -10,6 +10,7 @@ import {
   extractManagedBlock,
   findLineAnchoredMarkers,
   findUnmarkedCopy,
+  stripManagedWrapper,
 } from "./managed-block";
 
 // ---------------------------------------------------------------------------
@@ -326,3 +327,33 @@ describe("findUnmarkedCopy", () => {
     expect(findUnmarkedCopy(rows(12), rows(12))).toBeNull();
   });
 });
+
+describe("stripManagedWrapper historical notices", () => {
+  const wrap = (notice: string) =>
+    ["<!-- bkit:start -->", "", notice, "", "# Doc", "", "Body.", "", "<!-- bkit:end -->", ""].join(
+      "\n",
+    );
+
+  it("removes a v5 PolyForm-licensed notice with the wrapper", () => {
+    const notice =
+      "<!-- bkit:managed v5.0.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->";
+    const r = stripManagedWrapper(wrap(notice));
+    expect(r.status).toBe("removed");
+    expect(r.content).not.toContain("bkit:managed");
+    expect(r.content).not.toContain("PolyForm");
+    expect(r.content).toBe("# Doc\n\nBody.\n");
+  });
+
+  it("removes a pre-6.0 do NOT edit notice with the wrapper", () => {
+    const notice =
+      "<!-- bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do NOT edit; run `bkit upgrade` to refresh -->";
+    const plain = "<!-- bkit:managed v4.5.0 — do NOT edit; run `bkit upgrade` to refresh -->";
+    for (const n of [notice, plain]) {
+      const r = stripManagedWrapper(wrap(n));
+      expect(r.status).toBe("removed");
+      expect(r.content).not.toContain("bkit:managed");
+      expect(r.content).not.toContain("do NOT edit");
+      expect(r.content).toBe("# Doc\n\nBody.\n");
+    }
+  });
+});
diff --git a/.bkit/core/engine/install/managed-block.ts b/.bkit/core/engine/install/managed-block.ts
index af3be1720..594371a53 100644
--- a/.bkit/core/engine/install/managed-block.ts
+++ b/.bkit/core/engine/install/managed-block.ts
@@ -253,7 +253,7 @@ export function updateManagedBlock(
 
 /** The generated notice line a managed block carries: `<!-- bkit:managed vX — do not edit; … -->`. */
 const MANAGED_NOTICE_RE =
-  /^<!-- bkit:managed v\S+ — do not edit; run `bkit upgrade` to refresh -->$/;
+  /^<!-- bkit:managed v\S+ — (?:.* — )?do (?:not|NOT) edit; run `bkit upgrade` to refresh -->$/;
 
 /** Why a wrapper could not be removed without guessing. */
 export type WrapperProblem =
diff --git a/.bkit/core/engine/install/project-docs.test.ts b/.bkit/core/engine/install/project-docs.test.ts
index b49a160c8..9f7f9f2d7 100644
--- a/.bkit/core/engine/install/project-docs.test.ts
+++ b/.bkit/core/engine/install/project-docs.test.ts
@@ -132,6 +132,8 @@ describe("syncProjectDocs", () => {
 
   it("adds no row when an indexed equivalent covers the topic", () => {
     fs.writeFileSync(path.join(root, "docs/noise.md"), "# Noise\n");
+    fs.mkdirSync(path.join(root, "docs/other"));
+    fs.writeFileSync(path.join(root, "docs/other/noise.md"), "# Our noise\n");
     fs.appendFileSync(
       path.join(root, ".agents/docs.md"),
       "| `docs/other/noise.md` | Equivalent to docs/noise.md |\n",
@@ -140,4 +142,32 @@ describe("syncProjectDocs", () => {
     expect(r.registered).toEqual([]);
     expect(r.equivalent).toHaveLength(1);
   });
+  it("reports instead of throwing when docs is a regular file", () => {
+    fs.rmSync(path.join(root, "docs"), { recursive: true });
+    fs.writeFileSync(path.join(root, "docs"), "not a directory\n");
+    const before = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
+    let report: ReturnType<typeof syncProjectDocs> | undefined;
+    expect(() => {
+      report = syncProjectDocs(root, { dryRun: false });
+    }).not.toThrow();
+    expect(report!.migrated).toEqual([]);
+    expect(report!.registered).toEqual([]);
+    expect(report!.unsafe.length).toBeGreaterThan(0);
+    for (const u of report!.unsafe) expect(u.path).toMatch(/^docs\/.+\.md$/);
+    for (const u of report!.unsafe) expect(u.reason.length).toBeGreaterThan(0);
+    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(before);
+  });
+
+  it("registers a present default doc when its only equivalent row points at a missing file", () => {
+    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n\nReal content.\n");
+    fs.appendFileSync(
+      path.join(root, ".agents/docs.md"),
+      "| `engineering/security.md` | Equivalent to docs/security.md |\n",
+    );
+    const r = syncProjectDocs(root, { dryRun: false });
+    expect(r.registered).toEqual(["docs/security.md"]);
+    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toContain(
+      "`docs/security.md`",
+    );
+  });
 });
diff --git a/.bkit/core/engine/install/project-docs.ts b/.bkit/core/engine/install/project-docs.ts
index ce2eb062d..09b8783d7 100644
--- a/.bkit/core/engine/install/project-docs.ts
+++ b/.bkit/core/engine/install/project-docs.ts
@@ -129,7 +129,22 @@ export function topicOfPath(rel: string): ProjectDocTopic | null {
 export const LEGACY_STARTER_SOURCE_REVISION = "45f4254bd";
 
 const LEGACY_NOTICE_RE =
-  /^<!-- bkit:managed v\S+ — do not edit; run `bkit upgrade` to refresh -->$/;
+  /^<!-- bkit:managed v\S+ — (?:.* — )?do (?:not|NOT) edit; run `bkit upgrade` to refresh -->$/;
+
+const BRANCH = "[A-Za-z0-9._/-]+";
+/** The contexts the shipped starters render the project's default branch into. */
+const BRANCH_CONTEXTS: ReadonlyArray<[RegExp, string]> = [
+  [new RegExp(`(\`dev\`\\s*(?:/|or)\\s*\`)${BRANCH}(\`)`, "g"), "$1main$2"],
+  [new RegExp(`(push to \`)${BRANCH}(\`)`, "g"), "$1main$2"],
+  [new RegExp(`(refs/heads/)${BRANCH}(')`, "g"), "$1main$2"],
+  [new RegExp(`((?:On|queues on) \`)${BRANCH}(\`)`, "g"), "$1main$2"],
+];
+/** A rendered default branch in a starter's known contexts, replaced by `main`. */
+function anyBranch(line: string): string {
+  let out = line;
+  for (const [re, to] of BRANCH_CONTEXTS) out = out.replace(re, to);
+  return out;
+}
 
 /**
  * Normalize a document for comparison with a legacy starter: LF line endings, the former
@@ -140,7 +155,7 @@ const LEGACY_NOTICE_RE =
 export function normalizeLegacyText(text: string): string {
   const kept: string[] = [];
   for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
-    const line = raw.replace(/\{\{DEFAULT_BRANCH\}\}/g, "main").replace(/[ \t]+$/, "");
+    const line = anyBranch(raw.replace(/\{\{DEFAULT_BRANCH\}\}/g, "main")).replace(/[ \t]+$/, "");
     if (line === "<!-- bkit:start -->" || line === "<!-- bkit:end -->") continue;
     if (line === "{{BKIT_MANAGED_MARKER}}" || LEGACY_NOTICE_RE.test(line)) continue;
     kept.push(line);
@@ -170,10 +185,83 @@ export const LEGACY_STARTER_DIGESTS: Readonly<Record<ProjectDocTopic, string>> =
   setup: "7da0f1a4e639ee2a2194c11a0ba762e9f4014826e1d01f7f61f9391de8c462a8",
 };
 
+/** Digests of every released shipped starter text per topic (each tag that installed .bkit/shared/docs/) plus the recorded revision. */
+export const LEGACY_STARTER_DIGEST_HISTORY: Readonly<Record<ProjectDocTopic, readonly string[]>> = {
+  architecture: [
+    "cba1e5a333c26b5a797c6b73aa1efd6d0d4644372482e5d8a697b34708257ac0",
+    "1e52e99285ebe88454253965fedd92efad7e2c5fbfd95062f9dfecf77ac8995b",
+    "b949b773e10f9d0a797189c942a5884a4c971805da43520883138118226ad845",
+  ],
+  technology: [
+    "75446a8a702c822dfdfb24593c4807d30b0291e1e116b664ba7031f9af0530ba",
+    "d8167d2e9ce3b1ab18fdeecf5f5b9480e4cac7361a9e7ace7e135ff4ec43f3a4",
+    "723fd7fa4c001c1c3d562bd9de18f9830df3beebdcd45b54afeee159ce7bf2f0",
+  ],
+  security: [
+    "be84dc3b19cc34a13cdfc58062970d00a3564eacbcf05a0336646efe84f54630",
+    "752ae21e35128e17fc3a2fd6e009bf38751f6ccaa6c76d1723c1c99aff462335",
+    "5627543777d4f0bd4b8885df23e32d9ff9cc03c8b706894943bb018ec71c8cab",
+    "38bd66f0a66c7b2f3e454132df182b31538e045141f2fd6f761c57af2890c422",
+    "040408ccd16e3872d5eced55d36172fc163dcde548e89f382eafa992282f027c",
+    "26b8927e8df45b989422b417df8f406cd8b8c594811e42919756d26e807133c0",
+    "c8b631886a5a748199e1d731eabf50de9a07738912ecae392b5bac4636b90806",
+    "bdc2046e0f1b91a88fe272c8a1f5260429bb07ad548d57721b6a8b2fc623e345",
+  ],
+  "data-schema": [
+    "cc8f7b971e1714b9dde60a89738495fdf30b112536a94cd45e94a2e2cc5cc155",
+    "6af1f76b57568dd1bbd9bd48dd5fe55ffb64c08f12ac2e361576131a912be32e",
+    "2cd1f2eedc508af1d609ce5b53b0e1836cc33c8fd4e67fb2ad4c821f83043c5f",
+  ],
+  testing: [
+    "c20736efb9cf7b3e2b2aea237fb2ea902e83cba7c590402c3ebc3bbe9d00ad0a",
+    "b4b7786ce58a4c20589246f9c3a6f3a6d391fb479dc20708eff638329c7769d0",
+    "15a92687e35c1b902ff51c229e9b3abd821e3ceea0c1d7649b6ff4f977400940",
+    "22c3d9df343affec39423f61f1943a8e5be29b9a109c8b20b1a52b01ee7a4ba9",
+    "dc2b3553910be2879a15e379abd5e0718509bf7f690d31f1c8ba619857880433",
+    "a99cc2244c94b52ebcc67110c2c12905941f26e885bf6f07557876f21e3dcbb6",
+    "c96f8a8a1f2720c18915d9c24e0af28ad46a5d97814adaad3f7538f53e5ba6a2",
+  ],
+  deployments: [
+    "46c46cd2c2bb97676c9e9ecfa16184913124e5d32f9433142a6a33782f63ab43",
+    "9ccd487486549b5756401b2242d4a557a180f790bd43124800a33038ee116ecc",
+    "cb90552aba937c04949d6ab881f07eee51eff7bdebf6af679fb351267489c17c",
+    "09eec0a36879f31e18cae2c0669a81f4dac874cd530098bd2cbae65ac91e6463",
+    "9313b73cd5ee572c9c8a655167d31e72b960a5e7dd06ccddb2f7cf6c2581ce28",
+    "59e5a148c20d431b5fcf890f1a3848d80a6f599852042ae4e28f1887fb2fdbf9",
+    "44a277e16553554bef3c986b6651fd329d51aaf285846fc39ca8d3bfeef18a96",
+    "d337db11cbc8ab535db2a07fd06bf1c9d769f38b96c59b3485833997a318fe48",
+    "ac5f9f45397d816e0780029c00e52a203a5676cc443dc4b06c342424343389df",
+    "997062bf3456a3ce7cc7bb87c94dc04b64888f6f0c82c9e3c84109f6ad900335",
+    "6b091b3f43af189e6818838a506511aa25fc2ba99e467dc513466ae7469423b7",
+    "960a206511793814cef4d01db7a23f06fe0387dd7ee7d7d2b9fbb296b8303fcd",
+  ],
+  observability: [
+    "3541333403d2f87f34c0846a533dbb2bd9d92af6e92937d094381bd25e3686c6",
+    "793007002a287d51f77c4df4ec78ada5a04756d2047d938b315de51a491ec7f4",
+    "bebf67757c55db829ed4c429cefadf28b31175361f40e253b014d50e73dd5a65",
+  ],
+  design: [
+    "aba4ddee5522d53fa7f179d370bbab0764ee7f3976cf771f95ac008222926b34",
+    "1b170ada4eafe88488f34e7f3ed943a6582948b642ecfcd72a6ded95ceb17c46",
+    "2e680b2857679af9672b1112cf06d7e1282c75c739e36428e49cf13be33bfc92",
+  ],
+  noise: [
+    "19506086100971104bb04f3a5fe7d1304f293193fa056d13d0bc1727af1f7f9f",
+    "09d861b868b413f5d58edf097892f12d855aa72bae8ec5f02ed2bffb5d0aa2cb",
+    "64ddcda2d9ee14efbe1a210c1f5177e6cc4dfa10417d410825d8765628307773",
+  ],
+  setup: [
+    "b3827a1e70fcea5c9c12585a2e3f43cf895ad8eb3bf2bcf66ed8ac19783273b6",
+    "d130a83010ddfb870f21f30a8b271880101ee2d103cc361d193262a1a3147e16",
+    "a6114f7fc2a8d80460892d5892b6d9d2d59b6ed90974d094b0ddf9f68a2b26fa",
+    "7da0f1a4e639ee2a2194c11a0ba762e9f4014826e1d01f7f61f9391de8c462a8",
+  ],
+};
+
 /** The topic whose legacy starter `text` equals once normalized, or null. */
 export function legacyStarterTopic(text: string): ProjectDocTopic | null {
   const digest = legacyDigest(text);
-  return PROJECT_DOC_TOPICS.find((t) => LEGACY_STARTER_DIGESTS[t] === digest) ?? null;
+  return PROJECT_DOC_TOPICS.find((t) => LEGACY_STARTER_DIGEST_HISTORY[t].includes(digest)) ?? null;
 }
 
 // ---------------------------------------------------------------------------
@@ -188,17 +276,33 @@ export type FileState = "absent" | "regular" | { unsafe: string };
  * outside the repository are `unsafe` with the reason.
  */
 export function inspectRepoFile(root: string, rel: string): FileState {
-  const abs = path.join(root, rel);
-  const stat = fs.lstatSync(abs, { throwIfNoEntry: false });
-  if (stat === undefined) return "absent";
-  if (stat.isSymbolicLink()) return { unsafe: "it is a symbolic link" };
-  if (!stat.isFile()) return { unsafe: "it is not a regular file" };
-  const realRoot = fs.realpathSync(root);
-  const realParent = fs.realpathSync(path.dirname(abs));
-  if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) {
-    return { unsafe: "it resolves outside the repository" };
+  try {
+    const abs = path.join(root, rel);
+    const stat = fs.lstatSync(abs, { throwIfNoEntry: false });
+    if (stat === undefined) return "absent";
+    if (stat.isSymbolicLink()) return { unsafe: "it is a symbolic link" };
+    if (!stat.isFile()) return { unsafe: "it is not a regular file" };
+    const realRoot = fs.realpathSync(root);
+    const realParent = fs.realpathSync(path.dirname(abs));
+    if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) {
+      return { unsafe: "it resolves outside the repository" };
+    }
+    return "regular";
+  } catch (error) {
+    return { unsafe: `it could not be inspected (${errorReason(error)})` };
   }
-  return "regular";
+}
+
+/** A short, path-free reason for a filesystem error. */
+function errorReason(error: unknown): string {
+  const code = (error as { code?: unknown } | null)?.code;
+  return typeof code === "string" ? code : "filesystem error";
+}
+
+/** True when `rel` is a repo-relative path with no parent or absolute segments. */
+export function isInTreePath(rel: string): boolean {
+  if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel)) return false;
+  return !rel.split(/[\\/]/).includes("..");
 }
 
 // ---------------------------------------------------------------------------
@@ -236,7 +340,15 @@ export function readProjectIndex(root: string): ProjectIndex {
   if (state !== "regular") {
     return { status: "unreadable", reason: `${PROJECT_INDEX_PATH} is not a safe regular file` };
   }
-  const text = fs.readFileSync(path.join(root, PROJECT_INDEX_PATH), "utf-8");
+  let text: string;
+  try {
+    text = fs.readFileSync(path.join(root, PROJECT_INDEX_PATH), "utf-8");
+  } catch (error) {
+    return {
+      status: "unreadable",
+      reason: `${PROJECT_INDEX_PATH} could not be read (${errorReason(error)})`,
+    };
+  }
   const eol = text.includes("\r\n") ? "\r\n" : "\n";
   const ends = findLineAnchoredMarkers(text.replace(/\r/g, ""), "<!-- bkit:end -->");
   if (ends.length === 0) {
@@ -303,11 +415,12 @@ export function projectDocRow(topic: ProjectDocTopic): string {
 export function findIndexedEquivalent(
   rows: readonly IndexRow[],
   topic: ProjectDocTopic,
+  usable: (rel: string) => boolean = () => true,
 ): string | null {
   const recommended = projectDocPath(topic);
   const base = `${topic}.md`;
   for (const row of rows) {
-    if (row.path === recommended) continue;
+    if (row.path === recommended || !usable(row.path)) continue;
     if (path.posix.basename(row.path) === base) return row.path;
     const mentions = new RegExp(
       `equivalent\\s+to\\s+\`?${recommended.replace(".", "\\.")}\`?`,
@@ -376,15 +489,24 @@ export function syncProjectDocs(root: string, opts: { dryRun: boolean }): Projec
       report.unsafe.push({ path: rel, reason: state.unsafe });
       continue;
     }
-    present.push(topic);
     const abs = path.join(root, rel);
-    const before = fs.readFileSync(abs, "utf-8");
-    const result = stripManagedWrapper(before);
-    if (result.status === "ambiguous") {
-      report.ambiguous.push({ path: rel, problem: result.problem });
-    } else if (result.status === "removed") {
-      if (!opts.dryRun) fs.writeFileSync(abs, result.content, "utf-8");
-      report.migrated.push(rel);
+    try {
+      const before = fs.readFileSync(abs, "utf-8");
+      const result = stripManagedWrapper(before);
+      present.push(topic);
+      if (result.status === "ambiguous") {
+        report.ambiguous.push({ path: rel, problem: result.problem });
+      } else if (result.status === "removed") {
+        if (!opts.dryRun) fs.writeFileSync(abs, result.content, "utf-8");
+        report.migrated.push(rel);
+      }
+    } catch (error) {
+      const at = present.indexOf(topic);
+      if (at !== -1) present.splice(at, 1);
+      report.unsafe.push({
+        path: rel,
+        reason: `it could not be read or written (${errorReason(error)})`,
+      });
     }
   }
 
@@ -396,7 +518,11 @@ export function syncProjectDocs(root: string, opts: { dryRun: boolean }): Projec
     if (report.ambiguous.some((a) => a.path === rel)) continue;
     if (index.status === "ok") {
       if (index.rows.some((r) => r.path === rel)) continue;
-      const indexed = findIndexedEquivalent(index.rows, topic);
+      const indexed = findIndexedEquivalent(
+        index.rows,
+        topic,
+        (row) => isInTreePath(row) && inspectRepoFile(root, row) === "regular",
+      );
       if (indexed !== null && !migrated.has(rel)) {
         report.equivalent.push({ path: rel, indexed });
         continue;
@@ -416,9 +542,13 @@ export function syncProjectDocs(root: string, opts: { dryRun: boolean }): Projec
       const insertion = (index.needsEol ? index.eol : "") + rows.join(index.eol) + index.eol;
       const next =
         index.text.slice(0, index.insertAt) + insertion + index.text.slice(index.insertAt);
-      if (!opts.dryRun) fs.writeFileSync(path.join(root, PROJECT_INDEX_PATH), next, "utf-8");
-      report.registered.push(...edits);
-      index = { ...index, text: next };
+      try {
+        if (!opts.dryRun) fs.writeFileSync(path.join(root, PROJECT_INDEX_PATH), next, "utf-8");
+        report.registered.push(...edits);
+        index = { ...index, text: next };
+      } catch (error) {
+        report.indexProblem = `${PROJECT_INDEX_PATH} could not be written (${errorReason(error)})`;
+      }
     }
   }
 
@@ -437,6 +567,11 @@ function logReport(report: ProjectDocsReport, tag: string): void {
       `${LOG_PREFIX} ${tag}register: ${rel} in ${PROJECT_INDEX_PATH} (Project Documents)`,
     );
   }
+  for (const e of report.equivalent) {
+    console.log(
+      `${LOG_PREFIX} ${tag}skip: ${e.path} — ${PROJECT_INDEX_PATH} already lists ${e.indexed} for this topic, so no row was added. Add a row by hand if both documents matter.`,
+    );
+  }
   for (const a of report.ambiguous) {
     console.warn(
       `${LOG_PREFIX} ${a.path}: left as it is — ${PROBLEM_TEXT[a.problem]}, so bkit cannot tell its wrapper from your text. Delete any \`bkit:start\` / \`bkit:end\` / \`bkit:managed\` lines by hand; the file is yours.`,
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index ef184d4c1..d1267b389 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -6,7 +6,7 @@ import { spawnSync } from "node:child_process";
 import { readPackageJson } from "../../shared/package-json.js";
 import { readTextFile } from "../../shared/json.js";
 import { getPkgRoot } from "../../shared/package-roots.js";
-import { PROJECT_DOC_TOPICS, PROJECT_INDEX_PATH, findIndexedEquivalent, inspectRepoFile, legacyStarterTopic, normalizeLegacyText, projectDocPath, readProjectIndex, starterPath, } from "../../install/project-docs.js";
+import { PROJECT_DOC_TOPICS, PROJECT_INDEX_PATH, findIndexedEquivalent, inspectRepoFile, isInTreePath, legacyStarterTopic, normalizeLegacyText, projectDocPath, readProjectIndex, starterPath, } from "../../install/project-docs.js";
 import { isAdvisorySuppressed } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import { DEP_UPDATER_NAMES, findDepUpdaterConfigs, } from "../../shared/dep-updater.js";
@@ -349,12 +349,6 @@ function readStarterText(cwd, topic) {
     }
     return null;
 }
-/** True when `rel` is a repo-relative path with no parent or absolute segments. */
-function isInTreePath(rel) {
-    if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel))
-        return false;
-    return !rel.split(/[\\/]/).includes("..");
-}
 /** Mechanical read of a project document: empty, an untouched starter, or a candidate. */
 function assessDocText(cwd, topic, text) {
     if (text.trim() === "")
@@ -389,6 +383,7 @@ export function detectProjectDocs(cwd, onSuppressed) {
     const empty = [];
     const unpopulated = [];
     const unindexed = [];
+    const duplicates = [];
     const ambiguous = [];
     for (const topic of PROJECT_DOC_TOPICS) {
         const recommended = projectDocPath(topic);
@@ -425,8 +420,13 @@ export function detectProjectDocs(cwd, onSuppressed) {
             empty.push(target);
         else if (assessed === "unpopulated")
             unpopulated.push(target);
-        else if (index.status === "ok" && !indexedPaths.has(target))
-            unindexed.push(target);
+        else if (index.status === "ok" && !indexedPaths.has(target)) {
+            const covering = findIndexedEquivalent(rows, topic, (row) => isInTreePath(row) && inspectRepoFile(cwd, row) === "regular");
+            if (covering !== null && target === recommended)
+                duplicates.push(`${target} (beside ${covering})`);
+            else
+                unindexed.push(target);
+        }
     }
     const findings = [];
     if (index.status === "missing") {
@@ -472,6 +472,14 @@ export function detectProjectDocs(cwd, onSuppressed) {
             action: `Add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH}, or run \`bkit upgrade\` to register the default paths.`,
         });
     }
+    if (duplicates.length > 0) {
+        findings.push({
+            id: "project-docs-unindexed",
+            severity: "advisory",
+            detect: `These project documents exist but ${PROJECT_INDEX_PATH} lists another document for the same topic: ${duplicates.join(", ")}.`,
+            action: `bkit does not register them while the other document is indexed. Keep one: delete the unused file, or add a row for the second one by hand under \`## Project Documents\` in ${PROJECT_INDEX_PATH}.`,
+        });
+    }
     if (ambiguous.length > 0) {
         findings.push({
             id: "project-docs-ambiguous",
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index 6bc4c428e..9890bbb7f 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -76,7 +76,10 @@ const WARNING_FIELDS = [
     "action",
 ];
 /** Raw inputs (`*-input-N.md`) are untrusted: never a source of warnings. */
-const isRawInput = (rel) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel);
+const isRawInput = (rel) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel) ||
+    /(^|\/)related-(issues|failures|deferrals)\.md$/.test(rel);
+/** Text between the untrusted-content markers is external data: never a source of warnings. */
+const stripUntrusted = (text) => text.replace(/^[^\n]*={5} BEGIN UNTRUSTED ={5}[\s\S]*?(?:={5} END UNTRUSTED ={5}[^\n]*(?:\r?\n|$)|(?![\s\S]))/gm, "");
 /**
  * The top-level `{...}` objects in a fence body, in order. Each may span several lines (prettier
  * rewrites a one-line record into that shape); braces inside strings are ignored. Text outside
@@ -135,9 +138,10 @@ function documentationWarnings(rows, read) {
             if (!rel.endsWith(".md") || isRawInput(rel) || seenFiles.has(rel))
                 continue;
             seenFiles.add(rel);
-            const text = read(rel);
-            if (text === null)
+            const raw = read(rel);
+            if (raw === null)
                 continue;
+            const text = stripUntrusted(raw);
             const section = /^## Documentation Warnings[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(text);
             const fence = section === null ? null : /```jsonl[ \t]*\r?\n([\s\S]*?)```/.exec(section[1]);
             if (fence === null)
diff --git a/dist/install/managed-block.js b/dist/install/managed-block.js
index e64f8d760..fc309f065 100644
--- a/dist/install/managed-block.js
+++ b/dist/install/managed-block.js
@@ -220,7 +220,7 @@ export function updateManagedBlock(filePath, newContent, dryRun = false, markerS
 // Wrapper-only removal — the ownership metadata of a document that becomes the project's own
 // ---------------------------------------------------------------------------
 /** The generated notice line a managed block carries: `<!-- bkit:managed vX — do not edit; … -->`. */
-const MANAGED_NOTICE_RE = /^<!-- bkit:managed v\S+ — do not edit; run `bkit upgrade` to refresh -->$/;
+const MANAGED_NOTICE_RE = /^<!-- bkit:managed v\S+ — (?:.* — )?do (?:not|NOT) edit; run `bkit upgrade` to refresh -->$/;
 /** Lines with their terminators, so removing a line keeps every other byte, CRLF included. */
 function splitKeepingEol(content) {
     return content.match(/[^\n]*\n|[^\n]+$/g) ?? [];
diff --git a/dist/install/project-docs.js b/dist/install/project-docs.js
index 4c9c48f0b..98d183cb3 100644
--- a/dist/install/project-docs.js
+++ b/dist/install/project-docs.js
@@ -102,7 +102,22 @@ export function topicOfPath(rel) {
 // ---------------------------------------------------------------------------
 /** Commit the legacy starter text was read from. */
 export const LEGACY_STARTER_SOURCE_REVISION = "45f4254bd";
-const LEGACY_NOTICE_RE = /^<!-- bkit:managed v\S+ — do not edit; run `bkit upgrade` to refresh -->$/;
+const LEGACY_NOTICE_RE = /^<!-- bkit:managed v\S+ — (?:.* — )?do (?:not|NOT) edit; run `bkit upgrade` to refresh -->$/;
+const BRANCH = "[A-Za-z0-9._/-]+";
+/** The contexts the shipped starters render the project's default branch into. */
+const BRANCH_CONTEXTS = [
+    [new RegExp(`(\`dev\`\\s*(?:/|or)\\s*\`)${BRANCH}(\`)`, "g"), "$1main$2"],
+    [new RegExp(`(push to \`)${BRANCH}(\`)`, "g"), "$1main$2"],
+    [new RegExp(`(refs/heads/)${BRANCH}(')`, "g"), "$1main$2"],
+    [new RegExp(`((?:On|queues on) \`)${BRANCH}(\`)`, "g"), "$1main$2"],
+];
+/** A rendered default branch in a starter's known contexts, replaced by `main`. */
+function anyBranch(line) {
+    let out = line;
+    for (const [re, to] of BRANCH_CONTEXTS)
+        out = out.replace(re, to);
+    return out;
+}
 /**
  * Normalize a document for comparison with a legacy starter: LF line endings, the former
  * ownership lines (`bkit:start`, `bkit:end`, the `bkit:managed` notice and the unrendered
@@ -112,7 +127,7 @@ const LEGACY_NOTICE_RE = /^<!-- bkit:managed v\S+ — do not edit; run `bkit upg
 export function normalizeLegacyText(text) {
     const kept = [];
     for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
-        const line = raw.replace(/\{\{DEFAULT_BRANCH\}\}/g, "main").replace(/[ \t]+$/, "");
+        const line = anyBranch(raw.replace(/\{\{DEFAULT_BRANCH\}\}/g, "main")).replace(/[ \t]+$/, "");
         if (line === "<!-- bkit:start -->" || line === "<!-- bkit:end -->")
             continue;
         if (line === "{{BKIT_MANAGED_MARKER}}" || LEGACY_NOTICE_RE.test(line))
@@ -141,10 +156,82 @@ export const LEGACY_STARTER_DIGESTS = {
     noise: "64ddcda2d9ee14efbe1a210c1f5177e6cc4dfa10417d410825d8765628307773",
     setup: "7da0f1a4e639ee2a2194c11a0ba762e9f4014826e1d01f7f61f9391de8c462a8",
 };
+/** Digests of every released shipped starter text per topic (each tag that installed .bkit/shared/docs/) plus the recorded revision. */
+export const LEGACY_STARTER_DIGEST_HISTORY = {
+    architecture: [
+        "cba1e5a333c26b5a797c6b73aa1efd6d0d4644372482e5d8a697b34708257ac0",
+        "1e52e99285ebe88454253965fedd92efad7e2c5fbfd95062f9dfecf77ac8995b",
+        "b949b773e10f9d0a797189c942a5884a4c971805da43520883138118226ad845",
+    ],
+    technology: [
+        "75446a8a702c822dfdfb24593c4807d30b0291e1e116b664ba7031f9af0530ba",
+        "d8167d2e9ce3b1ab18fdeecf5f5b9480e4cac7361a9e7ace7e135ff4ec43f3a4",
+        "723fd7fa4c001c1c3d562bd9de18f9830df3beebdcd45b54afeee159ce7bf2f0",
+    ],
+    security: [
+        "be84dc3b19cc34a13cdfc58062970d00a3564eacbcf05a0336646efe84f54630",
+        "752ae21e35128e17fc3a2fd6e009bf38751f6ccaa6c76d1723c1c99aff462335",
+        "5627543777d4f0bd4b8885df23e32d9ff9cc03c8b706894943bb018ec71c8cab",
+        "38bd66f0a66c7b2f3e454132df182b31538e045141f2fd6f761c57af2890c422",
+        "040408ccd16e3872d5eced55d36172fc163dcde548e89f382eafa992282f027c",
+        "26b8927e8df45b989422b417df8f406cd8b8c594811e42919756d26e807133c0",
+        "c8b631886a5a748199e1d731eabf50de9a07738912ecae392b5bac4636b90806",
+        "bdc2046e0f1b91a88fe272c8a1f5260429bb07ad548d57721b6a8b2fc623e345",
+    ],
+    "data-schema": [
+        "cc8f7b971e1714b9dde60a89738495fdf30b112536a94cd45e94a2e2cc5cc155",
+        "6af1f76b57568dd1bbd9bd48dd5fe55ffb64c08f12ac2e361576131a912be32e",
+        "2cd1f2eedc508af1d609ce5b53b0e1836cc33c8fd4e67fb2ad4c821f83043c5f",
+    ],
+    testing: [
+        "c20736efb9cf7b3e2b2aea237fb2ea902e83cba7c590402c3ebc3bbe9d00ad0a",
+        "b4b7786ce58a4c20589246f9c3a6f3a6d391fb479dc20708eff638329c7769d0",
+        "15a92687e35c1b902ff51c229e9b3abd821e3ceea0c1d7649b6ff4f977400940",
+        "22c3d9df343affec39423f61f1943a8e5be29b9a109c8b20b1a52b01ee7a4ba9",
+        "dc2b3553910be2879a15e379abd5e0718509bf7f690d31f1c8ba619857880433",
+        "a99cc2244c94b52ebcc67110c2c12905941f26e885bf6f07557876f21e3dcbb6",
+        "c96f8a8a1f2720c18915d9c24e0af28ad46a5d97814adaad3f7538f53e5ba6a2",
+    ],
+    deployments: [
+        "46c46cd2c2bb97676c9e9ecfa16184913124e5d32f9433142a6a33782f63ab43",
+        "9ccd487486549b5756401b2242d4a557a180f790bd43124800a33038ee116ecc",
+        "cb90552aba937c04949d6ab881f07eee51eff7bdebf6af679fb351267489c17c",
+        "09eec0a36879f31e18cae2c0669a81f4dac874cd530098bd2cbae65ac91e6463",
+        "9313b73cd5ee572c9c8a655167d31e72b960a5e7dd06ccddb2f7cf6c2581ce28",
+        "59e5a148c20d431b5fcf890f1a3848d80a6f599852042ae4e28f1887fb2fdbf9",
+        "44a277e16553554bef3c986b6651fd329d51aaf285846fc39ca8d3bfeef18a96",
+        "d337db11cbc8ab535db2a07fd06bf1c9d769f38b96c59b3485833997a318fe48",
+        "ac5f9f45397d816e0780029c00e52a203a5676cc443dc4b06c342424343389df",
+        "997062bf3456a3ce7cc7bb87c94dc04b64888f6f0c82c9e3c84109f6ad900335",
+        "6b091b3f43af189e6818838a506511aa25fc2ba99e467dc513466ae7469423b7",
+        "960a206511793814cef4d01db7a23f06fe0387dd7ee7d7d2b9fbb296b8303fcd",
+    ],
+    observability: [
+        "3541333403d2f87f34c0846a533dbb2bd9d92af6e92937d094381bd25e3686c6",
+        "793007002a287d51f77c4df4ec78ada5a04756d2047d938b315de51a491ec7f4",
+        "bebf67757c55db829ed4c429cefadf28b31175361f40e253b014d50e73dd5a65",
+    ],
+    design: [
+        "aba4ddee5522d53fa7f179d370bbab0764ee7f3976cf771f95ac008222926b34",
+        "1b170ada4eafe88488f34e7f3ed943a6582948b642ecfcd72a6ded95ceb17c46",
+        "2e680b2857679af9672b1112cf06d7e1282c75c739e36428e49cf13be33bfc92",
+    ],
+    noise: [
+        "19506086100971104bb04f3a5fe7d1304f293193fa056d13d0bc1727af1f7f9f",
+        "09d861b868b413f5d58edf097892f12d855aa72bae8ec5f02ed2bffb5d0aa2cb",
+        "64ddcda2d9ee14efbe1a210c1f5177e6cc4dfa10417d410825d8765628307773",
+    ],
+    setup: [
+        "b3827a1e70fcea5c9c12585a2e3f43cf895ad8eb3bf2bcf66ed8ac19783273b6",
+        "d130a83010ddfb870f21f30a8b271880101ee2d103cc361d193262a1a3147e16",
+        "a6114f7fc2a8d80460892d5892b6d9d2d59b6ed90974d094b0ddf9f68a2b26fa",
+        "7da0f1a4e639ee2a2194c11a0ba762e9f4014826e1d01f7f61f9391de8c462a8",
+    ],
+};
 /** The topic whose legacy starter `text` equals once normalized, or null. */
 export function legacyStarterTopic(text) {
     const digest = legacyDigest(text);
-    return PROJECT_DOC_TOPICS.find((t) => LEGACY_STARTER_DIGESTS[t] === digest) ?? null;
+    return PROJECT_DOC_TOPICS.find((t) => LEGACY_STARTER_DIGEST_HISTORY[t].includes(digest)) ?? null;
 }
 /**
  * Whether `rel` under `root` is a regular file bkit may read or edit. A symlink (to anywhere), a
@@ -152,20 +239,36 @@ export function legacyStarterTopic(text) {
  * outside the repository are `unsafe` with the reason.
  */
 export function inspectRepoFile(root, rel) {
-    const abs = path.join(root, rel);
-    const stat = fs.lstatSync(abs, { throwIfNoEntry: false });
-    if (stat === undefined)
-        return "absent";
-    if (stat.isSymbolicLink())
-        return { unsafe: "it is a symbolic link" };
-    if (!stat.isFile())
-        return { unsafe: "it is not a regular file" };
-    const realRoot = fs.realpathSync(root);
-    const realParent = fs.realpathSync(path.dirname(abs));
-    if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) {
-        return { unsafe: "it resolves outside the repository" };
+    try {
+        const abs = path.join(root, rel);
+        const stat = fs.lstatSync(abs, { throwIfNoEntry: false });
+        if (stat === undefined)
+            return "absent";
+        if (stat.isSymbolicLink())
+            return { unsafe: "it is a symbolic link" };
+        if (!stat.isFile())
+            return { unsafe: "it is not a regular file" };
+        const realRoot = fs.realpathSync(root);
+        const realParent = fs.realpathSync(path.dirname(abs));
+        if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) {
+            return { unsafe: "it resolves outside the repository" };
+        }
+        return "regular";
     }
-    return "regular";
+    catch (error) {
+        return { unsafe: `it could not be inspected (${errorReason(error)})` };
+    }
+}
+/** A short, path-free reason for a filesystem error. */
+function errorReason(error) {
+    const code = error?.code;
+    return typeof code === "string" ? code : "filesystem error";
+}
+/** True when `rel` is a repo-relative path with no parent or absolute segments. */
+export function isInTreePath(rel) {
+    if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel))
+        return false;
+    return !rel.split(/[\\/]/).includes("..");
 }
 const ROW_RE = /^\|\s*`([^`]+)`\s*\|/;
 /** The `Project Documents` table of the index: the heading below the last `bkit:end`, then the first table. */
@@ -176,7 +279,16 @@ export function readProjectIndex(root) {
     if (state !== "regular") {
         return { status: "unreadable", reason: `${PROJECT_INDEX_PATH} is not a safe regular file` };
     }
-    const text = fs.readFileSync(path.join(root, PROJECT_INDEX_PATH), "utf-8");
+    let text;
+    try {
+        text = fs.readFileSync(path.join(root, PROJECT_INDEX_PATH), "utf-8");
+    }
+    catch (error) {
+        return {
+            status: "unreadable",
+            reason: `${PROJECT_INDEX_PATH} could not be read (${errorReason(error)})`,
+        };
+    }
     const eol = text.includes("\r\n") ? "\r\n" : "\n";
     const ends = findLineAnchoredMarkers(text.replace(/\r/g, ""), "<!-- bkit:end -->");
     if (ends.length === 0) {
@@ -246,11 +358,11 @@ export function projectDocRow(topic) {
  * The indexed document that already covers `topic` at another path: a same-basename row, or a
  * row whose Scope names the recommended path as its equivalent (`Equivalent to docs/x.md`).
  */
-export function findIndexedEquivalent(rows, topic) {
+export function findIndexedEquivalent(rows, topic, usable = () => true) {
     const recommended = projectDocPath(topic);
     const base = `${topic}.md`;
     for (const row of rows) {
-        if (row.path === recommended)
+        if (row.path === recommended || !usable(row.path))
             continue;
         if (path.posix.basename(row.path) === base)
             return row.path;
@@ -298,17 +410,28 @@ export function syncProjectDocs(root, opts) {
             report.unsafe.push({ path: rel, reason: state.unsafe });
             continue;
         }
-        present.push(topic);
         const abs = path.join(root, rel);
-        const before = fs.readFileSync(abs, "utf-8");
-        const result = stripManagedWrapper(before);
-        if (result.status === "ambiguous") {
-            report.ambiguous.push({ path: rel, problem: result.problem });
+        try {
+            const before = fs.readFileSync(abs, "utf-8");
+            const result = stripManagedWrapper(before);
+            present.push(topic);
+            if (result.status === "ambiguous") {
+                report.ambiguous.push({ path: rel, problem: result.problem });
+            }
+            else if (result.status === "removed") {
+                if (!opts.dryRun)
+                    fs.writeFileSync(abs, result.content, "utf-8");
+                report.migrated.push(rel);
+            }
         }
-        else if (result.status === "removed") {
-            if (!opts.dryRun)
-                fs.writeFileSync(abs, result.content, "utf-8");
-            report.migrated.push(rel);
+        catch (error) {
+            const at = present.indexOf(topic);
+            if (at !== -1)
+                present.splice(at, 1);
+            report.unsafe.push({
+                path: rel,
+                reason: `it could not be read or written (${errorReason(error)})`,
+            });
         }
     }
     let index = readProjectIndex(root);
@@ -321,7 +444,7 @@ export function syncProjectDocs(root, opts) {
         if (index.status === "ok") {
             if (index.rows.some((r) => r.path === rel))
                 continue;
-            const indexed = findIndexedEquivalent(index.rows, topic);
+            const indexed = findIndexedEquivalent(index.rows, topic, (row) => isInTreePath(row) && inspectRepoFile(root, row) === "regular");
             if (indexed !== null && !migrated.has(rel)) {
                 report.equivalent.push({ path: rel, indexed });
                 continue;
@@ -340,10 +463,15 @@ export function syncProjectDocs(root, opts) {
             const rows = edits.map((rel) => projectDocRow(topicOfPath(rel)));
             const insertion = (index.needsEol ? index.eol : "") + rows.join(index.eol) + index.eol;
             const next = index.text.slice(0, index.insertAt) + insertion + index.text.slice(index.insertAt);
-            if (!opts.dryRun)
-                fs.writeFileSync(path.join(root, PROJECT_INDEX_PATH), next, "utf-8");
-            report.registered.push(...edits);
-            index = { ...index, text: next };
+            try {
+                if (!opts.dryRun)
+                    fs.writeFileSync(path.join(root, PROJECT_INDEX_PATH), next, "utf-8");
+                report.registered.push(...edits);
+                index = { ...index, text: next };
+            }
+            catch (error) {
+                report.indexProblem = `${PROJECT_INDEX_PATH} could not be written (${errorReason(error)})`;
+            }
         }
     }
     logReport(report, tag);
@@ -356,6 +484,9 @@ function logReport(report, tag) {
     for (const rel of report.registered) {
         console.log(`${LOG_PREFIX} ${tag}register: ${rel} in ${PROJECT_INDEX_PATH} (Project Documents)`);
     }
+    for (const e of report.equivalent) {
+        console.log(`${LOG_PREFIX} ${tag}skip: ${e.path} — ${PROJECT_INDEX_PATH} already lists ${e.indexed} for this topic, so no row was added. Add a row by hand if both documents matter.`);
+    }
     for (const a of report.ambiguous) {
         console.warn(`${LOG_PREFIX} ${a.path}: left as it is — ${PROBLEM_TEXT[a.problem]}, so bkit cannot tell its wrapper from your text. Delete any \`bkit:start\` / \`bkit:end\` / \`bkit:managed\` lines by hand; the file is yours.`);
     }
diff --git a/docs/observability.md b/docs/observability.md
index 12c051c03..75572dcb3 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -204,7 +204,7 @@ Post-install findings via `formatChecklist(ctx.advisories)` (`.bkit/core/engine/
 | `project-docs-missing` | A recommended topic has no document and no indexed equivalent |
 | `project-docs-empty` | A covering document is empty |
 | `project-docs-unpopulated` | A covering document is still a current or legacy starter, or only headings |
-| `project-docs-unindexed` | A populated candidate exists but the index does not list it |
+| `project-docs-unindexed` | A populated candidate exists but the index does not list it, or lists another document for the same topic |
 | `project-docs-ambiguous` | An index row or target is unsafe, unreadable or malformed |
 
 A document that differs from every starter is a candidate for agent assessment; the check does not claim it is complete.
