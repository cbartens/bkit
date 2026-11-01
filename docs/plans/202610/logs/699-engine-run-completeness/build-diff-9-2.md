diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index 2e4fa9395..49a2b139a 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -216,10 +216,11 @@ describe("source derivation", () => {
       const md = flowMd(name);
       const contract = deriveContract(md, name);
       const inSteps = stepSections(md).reduce((n, s) => n + s.body.split('"{BKIT}"').length - 1, 0);
+      // Every literal is a step call or a workflow-level call (calls outside the journal window move there).
       expect(
-        contract.steps.reduce((n, s) => n + s.calls.length, 0),
+        contract.steps.reduce((n, s) => n + s.calls.length, 0) + contract.workflowCalls.length,
         name,
-      ).toBe(inSteps);
+      ).toBe(md.split('"{BKIT}"').length - 1);
       expect(inSteps, name).toBeGreaterThan(0);
     }
     expect(callWords('steps finish --a="x y" | tee')).toEqual(["steps", "finish", '--a="x y"']);
@@ -898,6 +899,8 @@ describe("check — hole classes", () => {
         u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
+          // A fresh run finds no active run at `workflows start`, so the journal never holds it.
+          .filter((c) => !(c.noun === "workflows" && c.verb === "start"))
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
       const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
@@ -1028,6 +1031,58 @@ describe("check — hole classes", () => {
     }
   });
 
+  it("calls outside the journal window are matched but never required", () => {
+    const md = [
+      "## 🧠 Step 1 — Preflight",
+      ...fence("branches check", FINISH("build-a", 1)),
+      "## 🧠 Step 2 — Start",
+      ...fence("workflows start --workflow=build", FINISH("build-b", 2)),
+      "## 🧠 Step 3 — Close",
+      ...fence("tests run --gate=a", "workflows close --workflow=build", "prs probe"),
+      ...fence(FINISH("build-c", 3)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const required = contractUnits(contract).flatMap((u) =>
+      u.calls.map((c) => `${c.noun} ${c.verb}`),
+    );
+    expect(required).not.toContain("branches check");
+    expect(required).not.toContain("prs probe");
+    expect(required).toContain("tests run");
+    const inWindow = [
+      callRow("build", "steps", "finish"),
+      stepRow("build", "build-a"),
+      callRow("build", "steps", "finish"),
+      stepRow("build", "build-b"),
+      callRow("build", "tests", "run"),
+      callRow("build", "workflows", "close"),
+      callRow("build", "steps", "finish"),
+      stepRow("build", "build-c"),
+    ] as StatusRow[];
+    const clean = check(inWindow, contract);
+    expect(clean.evidenceHoles).toEqual([]);
+    expect(clean.verdict).toBe("CLEAN");
+    // An outside call the journal does hold is matched, never unexpected.
+    expect(
+      check([callRow("build", "prs", "probe") as StatusRow, ...inWindow], contract).unexpected,
+    ).toEqual([]);
+    // An in-window call that is missing still reads HOLEY.
+    const missing = inWindow.filter((r) => r["noun"] !== "tests");
+    expect(check(missing, contract).verdict).toBe("HOLEY");
+  });
+
+  it("never requires the workflows start call, which a fresh run cannot journal", () => {
+    for (const name of FLOWS) {
+      const contract = deriveContract(flowMd(name), name);
+      const required = contractUnits(contract).flatMap((u) =>
+        u.calls.map((c) => `${c.noun} ${c.verb}`),
+      );
+      expect(required, name).not.toContain("workflows start");
+      const verdict = check(replay(name, false), contract);
+      expect(verdict.evidenceHoles, name).toEqual([]);
+      expect(verdict.verdict, name).toBe("CLEAN");
+    }
+  });
+
   it("reports an untaken route arm as unexercised", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step12 = build.steps.find((s) => s.number === 12)!;
diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index b41292674..11316e26f 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -252,7 +252,7 @@ function branchLines(lines: string[]): boolean[] {
 }
 
 /** The `"{BKIT}"` calls of one step section, each tagged with its position (R3) and branch flag (R1). */
-function sectionCalls(body: string): RequiredCall[] {
+function sectionCalls(body: string): Array<RequiredCall & { line: number }> {
   const lines = body.split("\n");
   const branch = branchLines(lines);
   const logical: Array<{ text: string; branch: boolean }> = [];
@@ -274,6 +274,7 @@ function sectionCalls(body: string): RequiredCall[] {
       ...c,
       position: i > lastFinish && lastFinish !== -1 ? ("post" as const) : ("pre" as const),
       branch: logical[i]!.branch,
+      line: i,
     })),
   );
 }
@@ -309,14 +310,39 @@ export function isConditionalSection(body: string): boolean {
  */
 export function deriveContract(workflowMd: string, workflow: string): Contract {
   const sections = stepSections(workflowMd);
-  const steps: ContractStep[] = sections.map((s) => ({
-    number: s.number,
-    title: s.title,
-    keys: stepKeys(s.body),
-    writes: stepWrites(s.body),
-    calls: sectionCalls(s.body),
-    conditional: isConditionalSection(s.body),
-  }));
+  // The journal window runs from the first `workflows start` call to the `workflows close`
+  // call: a call written above or below it is matched when journaled, never required.
+  const lineOf = (offset: number) => workflowMd.slice(0, offset).split("\n").length - 1;
+  const absLine = (s: { body: string }, line: number) => lineOf(workflowMd.indexOf(s.body)) + line;
+  const marks = (noun: string, verb: string) =>
+    sections.flatMap((s) =>
+      sectionCalls(s.body)
+        .filter((c) => c.noun === noun && c.verb === verb)
+        .map((c) => absLine(s, c.line)),
+    );
+  const starts = marks("workflows", "start");
+  const closes = marks("workflows", "close");
+  const windowStart = starts.length > 0 ? Math.min(...starts) : -1;
+  const windowEnd = closes.length > 0 ? Math.max(...closes) : Number.POSITIVE_INFINITY;
+  const outsideWindow: WorkflowCall[] = [];
+  const steps: ContractStep[] = sections.map((s) => {
+    const inside: RequiredCall[] = [];
+    for (const { line, ...c } of sectionCalls(s.body)) {
+      const at = absLine(s, line);
+      // `workflows start` itself is outside: a fresh run has no active run to journal it under.
+      const isStart = c.noun === "workflows" && c.verb === "start";
+      if (isStart || at < windowStart || at > windowEnd) outsideWindow.push(c);
+      else inside.push(c);
+    }
+    return {
+      number: s.number,
+      title: s.title,
+      keys: stepKeys(s.body),
+      writes: stepWrites(s.body),
+      calls: inside,
+      conditional: isConditionalSection(s.body),
+    };
+  });
   const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();
 
   // Text outside every step section: the md minus each section body.
@@ -335,7 +361,7 @@ export function deriveContract(workflowMd: string, workflow: string): Contract {
     workflow,
     steps,
     universe,
-    workflowCalls: requiredCalls(outside),
+    workflowCalls: [...requiredCalls(outside), ...outsideWindow],
     sourceSha: createHash("sha256").update(workflowMd).digest("hex"),
     orphanSteps: stepKeys(outside)
       .filter((k) => k.startsWith(`${workflow}-`) && !universe.includes(k))
diff --git a/.bkit/core/engine/commands/lib.test.ts b/.bkit/core/engine/commands/lib.test.ts
index 506e806ef..7745b0d5f 100644
--- a/.bkit/core/engine/commands/lib.test.ts
+++ b/.bkit/core/engine/commands/lib.test.ts
@@ -207,6 +207,7 @@ const ODD: CommandSpec = {
   verbs: {
     odd: {
       summary: "exits 9, which it does not declare",
+      use: "by-hand",
       flags: [],
       output: { odd: "n" },
       run: (ctx) => {
@@ -216,15 +217,23 @@ const ODD: CommandSpec = {
     },
     declared: {
       summary: "exits 4, which it declares",
+      use: "by-hand",
       flags: [],
       output: {},
       exitCodes: { 4: "declared" },
       run: () => 4,
     },
-    fine: { summary: "exits 0", flags: [], output: {}, run: () => EXIT.OK },
-    "needs-human": { summary: "exits 82", flags: [], output: {}, run: () => EXIT.NEEDS_HUMAN },
+    fine: { summary: "exits 0", use: "by-hand", flags: [], output: {}, run: () => EXIT.OK },
+    "needs-human": {
+      summary: "exits 82",
+      use: "by-hand",
+      flags: [],
+      output: {},
+      run: () => EXIT.NEEDS_HUMAN,
+    },
     boom: {
       summary: "throws",
+      use: "by-hand",
       flags: [],
       output: {},
       run: () => {
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index cde20f107..8865a9dbc 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -1066,6 +1066,18 @@ describe("bkit workflows close", () => {
     expect(all[at + 1]).toMatchObject({ type: "workflow-done", workflow: "build" });
   });
 
+  it("prints one telemetry line on stderr when the journal looks dead at close", async () => {
+    const cwd = closable("build");
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const lines = r.err.split("\n").filter((l) => l.includes("journal looks dead"));
+    expect(lines).toHaveLength(1);
+    expect(lines[0]).toContain("[bkit-telemetry] journal looks dead at close");
+    // stdout is still the one output object, with no journal field.
+    expect(JSON.stringify(r.json)).not.toContain("journal looks dead");
+    expect(r.json).not.toHaveProperty("journalSuspect");
+  });
+
   it("writes one completeness row per close", async () => {
     const cwd = closable("build");
     expect((await run(cwd, wf("close", "build"))).code).toBe(0);
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index af5fef8cb..242c0a7f0 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -1081,6 +1081,11 @@ function writeCompletenessRow(
     });
     const row: StatusRow = { type: "completeness", ...verdict, at: statusTimestamp(), parentSha };
     fs.appendFileSync(file, appendLine(row));
+    if (verdict.journalSuspect) {
+      log(
+        "[bkit-telemetry] journal looks dead at close: no engine-call rows for this run; the completeness verdict cannot be trusted",
+      );
+    }
   } catch (err) {
     // The check is advisory: report the failure and close without the row.
     log(`[bkit-telemetry] completeness row not written: ${(err as Error).message}`);
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index 39e16f2ee..28458cdda 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -24,12 +24,14 @@ const ODD: CommandSpec = {
   verbs: {
     odd: {
       summary: "exits 9, which it does not declare",
+      use: "by-hand",
       flags: [{ name: "step", type: "string", help: "step" }],
       output: {},
       run: () => 9,
     },
     "needs-human": {
       summary: "exits 82",
+      use: "by-hand",
       flags: [],
       output: {},
       run: () => 82,
diff --git a/.bkit/version b/.bkit/version
index ba7d4743d..872833555 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -14,7 +14,7 @@
     "docs/data-schema.md": "207fcd01c72d938f00990ac40cf6ec1083857efa2474fe248a07b4b511094c0b",
     ".gitattributes": "fd2a1fbd7dfd31e3683623eff18b939b7af64ebb9a03b0cb8a94c77e97bf8769",
     ".cursor/hooks.json": "cf9861764a08d8ad4a4892f4d097811f8f77838b16e27c140a544903a8d4bf05",
-    "docs/observability.md": "d35b8ce7b8c8e9cb8be48004b45f301ca9168657c1c8eaa3a5e298b475a610b1",
+    "docs/observability.md": "073a6bda650fcf9e75196492db01b5276b5268a5a2033b51232ee5b49b3db6ad",
     ".gitignore": "9a7f418d4a8aafbddbd9995b6a9cee5b5dc54a8ec47440263a17d388652d79e3",
     "docs/security.md": "f9c50965df581f9a17774d64ef9b98bcfe986b20a70d9c6a72d2ffaed4c470f7",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index bd3b614c7..746dafbb9 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -193,6 +193,7 @@ function sectionCalls(body) {
         ...c,
         position: i > lastFinish && lastFinish !== -1 ? "post" : "pre",
         branch: logical[i].branch,
+        line: i,
     })));
 }
 /** Row keys a section writes (not merely names in a `steps gate --step=` read). */
@@ -221,14 +222,38 @@ export function isConditionalSection(body) {
  */
 export function deriveContract(workflowMd, workflow) {
     const sections = stepSections(workflowMd);
-    const steps = sections.map((s) => ({
-        number: s.number,
-        title: s.title,
-        keys: stepKeys(s.body),
-        writes: stepWrites(s.body),
-        calls: sectionCalls(s.body),
-        conditional: isConditionalSection(s.body),
-    }));
+    // The journal window runs from the first `workflows start` call to the `workflows close`
+    // call: a call written above or below it is matched when journaled, never required.
+    const lineOf = (offset) => workflowMd.slice(0, offset).split("\n").length - 1;
+    const absLine = (s, line) => lineOf(workflowMd.indexOf(s.body)) + line;
+    const marks = (noun, verb) => sections.flatMap((s) => sectionCalls(s.body)
+        .filter((c) => c.noun === noun && c.verb === verb)
+        .map((c) => absLine(s, c.line)));
+    const starts = marks("workflows", "start");
+    const closes = marks("workflows", "close");
+    const windowStart = starts.length > 0 ? Math.min(...starts) : -1;
+    const windowEnd = closes.length > 0 ? Math.max(...closes) : Number.POSITIVE_INFINITY;
+    const outsideWindow = [];
+    const steps = sections.map((s) => {
+        const inside = [];
+        for (const { line, ...c } of sectionCalls(s.body)) {
+            const at = absLine(s, line);
+            // `workflows start` itself is outside: a fresh run has no active run to journal it under.
+            const isStart = c.noun === "workflows" && c.verb === "start";
+            if (isStart || at < windowStart || at > windowEnd)
+                outsideWindow.push(c);
+            else
+                inside.push(c);
+        }
+        return {
+            number: s.number,
+            title: s.title,
+            keys: stepKeys(s.body),
+            writes: stepWrites(s.body),
+            calls: inside,
+            conditional: isConditionalSection(s.body),
+        };
+    });
     const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();
     // Text outside every step section: the md minus each section body.
     let outside = workflowMd;
@@ -249,7 +274,7 @@ export function deriveContract(workflowMd, workflow) {
         workflow,
         steps,
         universe,
-        workflowCalls: requiredCalls(outside),
+        workflowCalls: [...requiredCalls(outside), ...outsideWindow],
         sourceSha: createHash("sha256").update(workflowMd).digest("hex"),
         orphanSteps: stepKeys(outside)
             .filter((k) => k.startsWith(`${workflow}-`) && !universe.includes(k))
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 77a71afee..4b928d41a 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -843,6 +843,9 @@ function writeCompletenessRow(file, workflow, startAt, parentSha, log) {
         });
         const row = { type: "completeness", ...verdict, at: statusTimestamp(), parentSha };
         fs.appendFileSync(file, appendLine(row));
+        if (verdict.journalSuspect) {
+            log("[bkit-telemetry] journal looks dead at close: no engine-call rows for this run; the completeness verdict cannot be trusted");
+        }
     }
     catch (err) {
         // The check is advisory: report the failure and close without the row.
diff --git a/docs/capabilities.md b/docs/capabilities.md
index f3e5f6aa9..faba21535 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -27,7 +27,7 @@
 > - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because `assert-routes-reachable.mjs` is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `df185da0b`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `f9898949a`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -174,7 +174,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from df185da0b75da62af965c3030f6b693535ff3ef7 — do not edit
+  %% Generated by bkit-graphify-rollup.py from f9898949a2ab7512d00348fabfb3317377db07c0 — do not edit
   n_bkit_core[".bkit/core<br/>2749 symbols · 125 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   nscripts_harvest -->|21| n_bkit_core
@@ -199,7 +199,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from df185da0b75da62af965c3030f6b693535ff3ef7 — do not edit
+  %% Generated by bkit-graphify-rollup.py from f9898949a2ab7512d00348fabfb3317377db07c0 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 26be9f09f..dff3d5c5d 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -112,3 +112,7 @@
 {"schema":3,"ts":1793140927438,"firstTs":1793140927438,"updates":1,"kind":"knowledge","key":"scan-diff-removal-case-diffs-a-commit-not-the-branch","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"summary":"A removal-only case for `bkit branches scan-diff --disabled-tests` must diff a commit whose parent already holds the test file: against `origin/dev` a file the branch itself creates nets to a pure addition, so the deleted line never appears and the test false-greens","description":"- **Category:** tooling\n- **Symptom:** a `branches.test.ts` case asserting that a removed test-file line is (or is not) reported passes while the scanner still over-reports, and the same case fails for the wrong reason after a `--base` change.\n- **Root cause:** `--base=origin/dev` diffs the whole branch, so a test file added inside the branch shows as one `+` block with its final content; a line added in an earlier commit and deleted in a later one is net-absent from the diff and its removal branch never runs.\n- **Fix or rule:** give the fixture a commit holding the file first, then diff `--base=HEAD~1` (or a base that already carries the file) so the deletion appears as a `-` line; keep `origin/dev` for added-marker cases.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Git's diff is per range, not per commit: a line that exists only between two commits of the range cancels out, so a removal-only assertion has nothing to read.","remediation":"Seed the file in an earlier commit and diff `--base=HEAD~1`, or land the file on `dev` before branching."}
 {"schema":3,"ts":1793148317642,"firstTs":1793148317642,"updates":1,"kind":"knowledge","key":"workflow-ledgers-importing-tests-closes-a-steps-cycle","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash-1017"},"references":[".bkit/core/engine/commands/workflow/ledgers.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/engine/commands/workflow/tests.ts"],"summary":"A new `ledgers.ts` -> `tests.ts` import crashes every `bkit` invocation at startup with `ReferenceError: Cannot access 'EXIT_FOREIGN_PATH' before initialization`; `tsc` and the file's own tests stay green, so only a built CLI exposes it","description":"- **Category:** tooling\n- **Symptom:** after adding an import edge between two workflow command modules, `node dist/cli.js help` (and every other verb, `--version` included) dies while loading `dist/commands/workflow/steps.js` with `ReferenceError: Cannot access 'EXIT_FOREIGN_PATH' before initialization`; `pnpm build` passes and the touched test file passes.\n- **Root cause:** `steps.ts` imports `EXIT_FOREIGN_PATH` from `ledgers.ts` and `tests.ts` imports `writeStepRow` from `steps.ts`. An edge `ledgers.ts` -> `tests.ts` closes the cycle `ledgers -> tests -> steps -> ledgers`, so ESM evaluates `steps.js` first and its module-level `exitCodes` object reads the `const` before `ledgers.js` initialises it.\n- **Fix or rule:** never import `tests.js`, `steps.js` or `context.js` from `ledgers.ts`; a value two of them need (e.g. `NO_MARKERS_REASON`) lives in the leaf reader `plan-blocks.ts`, which imports nothing from the command layer. Verify with `pnpm build && node dist/cli.js help` — a cycle that type-checks is only visible on the built CLI.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The workflow command modules are one import graph with a cycle already (steps -> ledgers, tests -> steps); any new edge into that graph reorders ESM evaluation and a module-level read of another module's `const` becomes a TDZ error at startup.","remediation":"Put shared constants and pure readers in a leaf module (`plan-blocks.ts`) and import the command modules only from the layer above them; after any new cross-module import, run the built CLI, not only `pnpm build` and vitest."}
 {"schema":3,"ts":1793151909872,"firstTs":1793151909872,"updates":1,"kind":"knowledge","key":"matrix-row-count-prose-drifts-on-append","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek-v4.1-flash-1017"},"references":["docs/plans/202610/701-engine-work-build-plan.md"],"summary":"A plan's `Derived Test Matrix` row-count prose — the intro sentence's `rows N-M` range and the Verification Plan's \"the N `Derived Test Matrix` rows\" — is hand-written: `tests plan-check` proves every test-bearing task has a row but never checks the stated total, so appended rows leave both sentences stale","description":"- **Category:** docs\n- **Symptom:** after appending `Derived Test Matrix` rows to a plan, `node dist/cli.js tests plan-check --plan=...` exits 0 with `problems: []`, yet the table's intro sentence still ends its row range at the old last row and the Verification Plan still reads `the {old count} Derived Test Matrix rows`.\n- **Root cause:** the engine computes each row's `Task` mapping but not the prose count; both count sentences are authored text in the plan.\n- **Fix or rule:** when adding matrix rows, update the intro sentence's row range and the Verification Plan's row count in the same edit. Verify the total by counting table body rows between the `### Derived Test Matrix` heading and the next heading, minus the header and separator lines.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The plan format carries the row-to-task mapping in the `Task` column (engine-checked) but its row-count prose in two hand-written sentences (not checked), so the two drift independently.","remediation":"Edit both count sentences whenever the matrix gains or loses rows; `tests plan-check` proves mapping only, not the stated total."}
+{"schema":3,"ts":1793258153184,"firstTs":1793258153184,"updates":1,"kind":"knowledge","key":"journal-write-root-is-runs-own-book-root","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"claude-sonnet-5-5"},"references":[".bkit/core/engine/commands/lib.ts",".bkit/core/engine/ledgers/journal.integration.test.ts"],"summary":"The engine-call / friction journal must write under the active run's own book root (the worktree), not repoRoot(cwd), which from .worktrees/{fid} resolves to the main checkout","description":"- **Category:** tooling\n- **Symptom:** journal rows land in the main checkout's .bkit/friction.jsonl and never ride the run's PR, so the run's completeness check reads an empty journal.\n- **Root cause:** repoRoot(cwd) from a .worktrees/{fid} checkout resolves to the main checkout, a different inode from the worktree that holds the run's status.jsonl.\n- **Fix or rule:** Resolve the write root from the directory that holds the run's status.jsonl; assert it with a real git worktree test (journal.integration.test.ts).\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"repoRoot(cwd) from a .worktrees/{fid} checkout resolves to the main checkout, a different inode from the worktree that holds the run's status.jsonl.","remediation":"Resolve the write root from the directory that holds the run's status.jsonl; assert it with a real git worktree test (journal.integration.test.ts)."}
+{"schema":3,"ts":1793258153186,"firstTs":1793258153186,"updates":1,"kind":"knowledge","key":"journal-step-fallback-noun-verb-mandatory","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"claude-sonnet-5-5"},"references":[".bkit/core/engine/commands/lib.ts"],"summary":"A journaled friction row must always carry a non-empty by.step; when no step can be resolved the <noun>-<verb> fallback is mandatory","description":"- **Category:** tooling\n- **Symptom:** a friction row with an empty by.step is refused by the ledger validator and the row is lost.\n- **Root cause:** Step attribution is resolve-or-skip from the run's rows; commands run before any step row has nothing to resolve.\n- **Fix or rule:** Fall back to <noun>-<verb> as by.step on every path; never write an empty step.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Step attribution is resolve-or-skip from the run's rows; commands run before any step row has nothing to resolve.","remediation":"Fall back to <noun>-<verb> as by.step on every path; never write an empty step."}
+{"schema":3,"ts":1793258153187,"firstTs":1793258153187,"updates":1,"kind":"knowledge","key":"mark-rows-copies-must-stay-in-parity","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"claude-sonnet-5-5"},"references":[".bkit/core/engine/commands/workflow/ledgers.ts"],"summary":"The two MARK_ROWS copies must skip the same row types; a new status.jsonl row type added to one copy only is counted as a mark by the other reader","description":"- **Category:** tooling\n- **Symptom:** a new row type (engine-call, completeness) is treated as a step mark by one reader and ignored by the other, so counts disagree.\n- **Root cause:** MARK_ROWS is duplicated across two readers with no shared source.\n- **Fix or rule:** Update both copies in the same change; the harvest parity test pins them equal.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"MARK_ROWS is duplicated across two readers with no shared source.","remediation":"Update both copies in the same change; the harvest parity test pins them equal."}
+{"schema":3,"ts":1793259166164,"firstTs":1793258153187,"updates":2,"kind":"knowledge","key":"mark-rows-copies-must-stay-in-parity","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"claude-sonnet-5-5"},"references":[".bkit/core/engine/commands/workflow/run-facts.ts:354","scripts/harvest/bkit-harvest.mjs:1478"],"summary":"The two MARK_ROWS copies must skip the same row types; a new status.jsonl row type added to one copy only is counted as a mark by the other reader","description":"- **Category:** tooling\n- **Symptom:** a new row type (engine-call, completeness) is treated as a step mark by one reader and ignored by the other, so counts disagree.\n- **Root cause:** MARK_ROWS is duplicated across two readers with no shared source.\n- **Fix or rule:** Update both copies in the same change; the harvest parity test pins them equal.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"MARK_ROWS is duplicated across two readers with no shared source.","remediation":"Update both copies in the same change; the harvest parity test pins them equal."}
diff --git a/docs/observability.md b/docs/observability.md
index 1ad004ed7..b0971b03e 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -60,6 +60,7 @@ Compliance grader stderr. Canonical grep patterns:
 - `[bkit-telemetry] outcome not restated: {reason}` / `no {workflow} workflow-done row with parentSha — outcome not restated` / `no {workflow} outcome row for {sha} — outcome not restated` — dispatch re-append skipped.
 - `[bkit-telemetry] {kind} row {key} not written: {reason}` — harvest scan row failing its totals check, on stderr; not appended.
 - `[bkit-telemetry] {kind} row not written: {reason}` — a `completeness` row the close could not append (`{kind}` is `completeness`); the close continues.
+- `[bkit-telemetry] journal looks dead at close: no engine-call rows for this run; the completeness verdict cannot be trusted` — `bkit workflows close` found no `engine-call` row for the run; one line per close on stderr, stdout and the exit code unchanged.
 - `[bkit-telemetry] journal write failed: {message}` — the engine-call / friction journal at command dispatch could not write a row; logged once per command run, the command's exit code is unchanged.
 
 The journal seam writes `engine-call` and `friction` rows to the active run's `status.jsonl` / `.bkit/friction.jsonl`. `BKIT_ENGINE_JOURNAL=off` is its kill switch: any other value (or unset) leaves it on. Rows are evidence for `bkit completeness check`; the seam never changes an exit code.
