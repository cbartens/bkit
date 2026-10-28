diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index b4db59629..7ba8ca8e8 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1607,6 +1607,127 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json?.disabled).toEqual([]);
   });
 
+  it("scan-diff ignores a removed comment in a test file", async () => {
+    const { clone } = featureBranch("scan-disabled-comment");
+    write(clone, "src/a.test.ts", testFile("// should not be reached"));
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "comment gone");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+    expect(r.json?.disabled).toEqual([]);
+  });
+
+  it("scan-diff ignores an assertion moved within the file", async () => {
+    const { clone } = featureBranch("scan-disabled-move");
+    write(
+      clone,
+      "src/a.test.ts",
+      [
+        "it('keeps a', () => {",
+        "  expect(1).toBe(1);",
+        "});",
+        "",
+        "it('keeps b', () => {",
+        "  expect(2).toBe(2);",
+        "});",
+        "",
+      ].join("\n"),
+    );
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "src/a.test.ts",
+      [
+        "it('keeps a', () => {",
+        "  expect(1).toBe(1);",
+        "  expect(2).toBe(2);",
+        "});",
+        "",
+        "it('keeps b', () => {",
+        "  doSomething();",
+        "});",
+        "",
+      ].join("\n"),
+    );
+    commit(clone, {}, "move");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+    expect(r.json?.disabled).toEqual([]);
+  });
+
+  it("scan-diff still reports a removed assertion", async () => {
+    const { clone } = featureBranch("scan-disabled-drop");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join(
+        "\n",
+      ),
+    );
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
+    );
+    commit(clone, {}, "drop");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 3, test: "keeps a" }]);
+  });
+
+  it("scan-diff finds an added pytest mark skip", async () => {
+    const { clone } = featureBranch("scan-disabled-pytest");
+    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "tests/test_a.py",
+      ['@pytest.mark.skip(reason="flaky")', "def test_a():", "    assert 1 == 1", ""].join("\n"),
+    );
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 1, test: "test_a" }]);
+  });
+
+  it("scan-diff finds an added unittest skip", async () => {
+    const { clone } = featureBranch("scan-disabled-unittest");
+    const body = (decorator: string[]) =>
+      [
+        "import unittest",
+        "",
+        "class A(unittest.TestCase):",
+        ...decorator,
+        "    def test_a(self):",
+        "        self.assertEqual(1, 1)",
+        "",
+      ].join("\n");
+    write(clone, "tests/test_a.py", body([]));
+    commit(clone, {}, "test");
+    write(clone, "tests/test_a.py", body(['    @unittest.skip("flaky")']));
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 4, test: "test_a" }]);
+  });
+
+  it("scan-diff finds an added bare skip call", async () => {
+    const { clone } = featureBranch("scan-disabled-pyskip");
+    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "tests/test_a.py",
+      ["def test_a():", '    pytest.skip("flaky")', "    assert 1 == 1", ""].join("\n"),
+    );
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 2, test: "test_a" }]);
+  });
+
   it("needs exactly one of --paths, --marker, --code; an unknown base exits 23", async () => {
     const { clone } = featureBranch("scan-usage");
     expect((await run(clone, ["scan-diff", "--base=origin/dev"])).code).toBe(2);
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index cc6e89ee9..b9b75d3c5 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -1080,8 +1080,27 @@ const DISABLED_MARKERS = [
   /@Disabled\b/,
 ];
 
-/** An assertion call a change deletes from a test file. */
-const ASSERTION = /\b(?:expect|assert\w*|should|should_\w+)\b/;
+/** Added-line markers only a test file carries: Python's decorators and a bare `skip` call. */
+const TEST_FILE_MARKERS = [/@pytest\.mark\.skip\b/, /@unittest\.skip\b/, /\.skip\s*\(/];
+
+/** Every added-line marker, test file or not. */
+const ALL_MARKERS = [...DISABLED_MARKERS, ...TEST_FILE_MARKERS];
+
+/** The markers that apply to an added line of `file`. */
+const markersFor = (file: string) => (TEST_FILE.test(file) ? ALL_MARKERS : DISABLED_MARKERS);
+
+/** An assertion call a change deletes from a test file: `expect(…)`, `assert.equal(…)`, `should(…)`. */
+const ASSERTION = /(?<![\w$])(?:expect|assert\w*|should_\w+|should)\s*[(.]/;
+
+/** Python's bare `assert x` statement, which calls nothing but asserts. */
+const BARE_ASSERT = /^\s*assert\s+\S/;
+
+/** A commented-out line: its words are prose, not a call. */
+const COMMENT = /^\s*(?:\/\/|\/\*|\*|#|--)/;
+
+/** True when a removed `line` takes an assertion, rather than being a comment or an import. */
+const isAssertion = (line: string) =>
+  !COMMENT.test(line) && (ASSERTION.test(line) || BARE_ASSERT.test(line));
 
 /** A test declaration's name on `line`, or null when the line declares no test. */
 function declaredName(line: string): string | null {
@@ -1104,7 +1123,15 @@ function declaredName(line: string): string | null {
 function testAt(body: string | null, line: string, at: number): string {
   if (body !== null) {
     const lines = body.split(/\r?\n/);
-    for (let i = Math.min(at, lines.length) - 1; i >= 0; i--) {
+    const from = Math.min(at, lines.length) - 1;
+    // A decorator (`@pytest.mark.skip`) names the test it sits on, which is below it.
+    if (line.trimStart().startsWith("@")) {
+      for (let i = from + 1; i < lines.length; i++) {
+        const name = declaredName(lines[i]!);
+        if (name !== null) return name;
+      }
+    }
+    for (let i = from; i >= 0; i--) {
       const name = declaredName(lines[i]!);
       if (name !== null) return name;
     }
@@ -1116,7 +1143,8 @@ const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
 
 /**
  * The added lines of a `--no-renames` unified diff that disable a test, and the removed
- * assertion lines of a test file: each with its new-file line and the test it sits in.
+ * assertion lines of a test file the same diff does not add back: each with its new-file
+ * line and the test it sits in.
  */
 export function disabledTestsIn(diff: string, root: string): DisabledTest[] {
   const out: DisabledTest[] = [];
@@ -1133,6 +1161,9 @@ export function disabledTestsIn(diff: string, root: string): DisabledTest[] {
     }
     return bodies.get(rel)!;
   };
+  /** Trimmed texts of the added lines, so a removed assertion re-added elsewhere is not a drop. */
+  const readded = new Map<string, number>();
+  const removed: Array<{ file: string; line: number; text: string }> = [];
   let file = "";
   let next = 0;
   for (const raw of diff.split("\n")) {
@@ -1148,14 +1179,25 @@ export function disabledTestsIn(diff: string, root: string): DisabledTest[] {
     }
     if (raw.startsWith("+")) {
       const text = raw.slice(1);
-      if (DISABLED_MARKERS.some((m) => m.test(text)))
+      if (markersFor(file).some((m) => m.test(text)))
         out.push({ file, line: next, test: testAt(body(file), text, next) });
+      const key = text.trim();
+      readded.set(key, (readded.get(key) ?? 0) + 1);
       next++;
     } else if (raw.startsWith("-")) {
-      if (TEST_FILE.test(file) && ASSERTION.test(raw.slice(1)))
-        out.push({ file, line: next, test: testAt(body(file), raw.slice(1), next) });
+      const text = raw.slice(1);
+      if (TEST_FILE.test(file) && isAssertion(text)) removed.push({ file, line: next, text });
     } else if (raw.startsWith(" ")) next++;
   }
+  for (const r of removed) {
+    const key = r.text.trim();
+    const left = readded.get(key) ?? 0;
+    if (left > 0) {
+      readded.set(key, left - 1);
+      continue;
+    }
+    out.push({ file: r.file, line: r.line, test: testAt(body(r.file), r.text, r.line) });
+  }
   return out;
 }
 
@@ -2272,7 +2314,7 @@ export const branchesCommand: CommandSpec = {
         {
           name: "disabled-tests",
           type: "boolean",
-          help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`) or a test file loses an assertion; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+          help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, a test file's `@pytest.mark.skip` / `@unittest.skip`) or a test file drops an assertion no line adds back; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
         },
         {
           name: "expect-none",
@@ -2284,7 +2326,7 @@ export const branchesCommand: CommandSpec = {
         found: "something matched",
         paths: "the matching paths",
         disabled:
-          "[{file, line, test}]: added lines that disable a test, and removed assertion lines of a test file (only with --disabled-tests)",
+          "[{file, line, test}]: added lines that disable a test, and removed assertion lines of a test file that no added line re-adds (only with --disabled-tests)",
       },
       exitCodes: {
         [EXIT_DIFF_FAILED]: "--base does not resolve, or git diff failed",
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 8432ae98e..aa83ee1bd 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1389,6 +1389,24 @@ describe("bkit ledgers triage", () => {
     expect(lines(r)).toHaveLength(1);
   });
 
+  it("triage keeps an own-cycle deferral exempt", async () => {
+    const r = triageRepo([
+      deferral({ key: "701-new-architecture", reason: "own-cycle", status: "OPEN" }),
+    ]);
+    const res = await triage(r);
+    expect(res.code).toBe(0);
+    expect(res.json.rows.map((x: { key: string; bucket: string }) => [x.key, x.bucket])).toEqual([
+      ["701-new-architecture", "Exempt"],
+    ]);
+    expect(held(res.json.rows[0])).toEqual([
+      "in-scope-surface",
+      "no-external-blocker",
+      "own-declaration",
+    ]);
+    expect(res.json.written).toBe(0);
+    expect(lines(r)).toHaveLength(1);
+  });
+
   it("triage marks an unjustified deferral lazy", async () => {
     const r = triageRepo([deferral()]);
     const res = await triage(r);
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 20cd1d906..b0b41aec6 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -1723,7 +1723,8 @@ export function triageDeferrals(root: string, fid: string, planPath: string): Tr
     }
     const paths = namedPaths(row);
     const verdicts: Record<DeferralTest, boolean> = {
-      "bounded-remediation": existsIn(root, paths),
+      // Test 1 reads "not a new architecture": an `own-cycle` row declares itself plan-sized.
+      "bounded-remediation": row["reason"] !== "own-cycle" && existsIn(root, paths),
       "in-scope-surface": paths.some((p) => scope.some((s) => within(p, s))),
       "no-external-blocker": row["reason"] !== "hard-blocked" && row["reason"] !== "needs-decision",
       "own-declaration": !declares(row, fid, issue, declared),
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 850262cbc..3ebfcae6f 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -868,8 +868,20 @@ const DISABLED_MARKERS = [
     /#\[ignore\b/,
     /@Disabled\b/,
 ];
-/** An assertion call a change deletes from a test file. */
-const ASSERTION = /\b(?:expect|assert\w*|should|should_\w+)\b/;
+/** Added-line markers only a test file carries: Python's decorators and a bare `skip` call. */
+const TEST_FILE_MARKERS = [/@pytest\.mark\.skip\b/, /@unittest\.skip\b/, /\.skip\s*\(/];
+/** Every added-line marker, test file or not. */
+const ALL_MARKERS = [...DISABLED_MARKERS, ...TEST_FILE_MARKERS];
+/** The markers that apply to an added line of `file`. */
+const markersFor = (file) => (TEST_FILE.test(file) ? ALL_MARKERS : DISABLED_MARKERS);
+/** An assertion call a change deletes from a test file: `expect(…)`, `assert.equal(…)`, `should(…)`. */
+const ASSERTION = /(?<![\w$])(?:expect|assert\w*|should_\w+|should)\s*[(.]/;
+/** Python's bare `assert x` statement, which calls nothing but asserts. */
+const BARE_ASSERT = /^\s*assert\s+\S/;
+/** A commented-out line: its words are prose, not a call. */
+const COMMENT = /^\s*(?:\/\/|\/\*|\*|#|--)/;
+/** True when a removed `line` takes an assertion, rather than being a comment or an import. */
+const isAssertion = (line) => !COMMENT.test(line) && (ASSERTION.test(line) || BARE_ASSERT.test(line));
 /** A test declaration's name on `line`, or null when the line declares no test. */
 function declaredName(line) {
     const call = /\b(?:it|test|suite|describe|context|bench)(?:\.[a-z]+)*\s*\(\s*(["'`])(.+?)\1/.exec(line);
@@ -891,7 +903,16 @@ function declaredName(line) {
 function testAt(body, line, at) {
     if (body !== null) {
         const lines = body.split(/\r?\n/);
-        for (let i = Math.min(at, lines.length) - 1; i >= 0; i--) {
+        const from = Math.min(at, lines.length) - 1;
+        // A decorator (`@pytest.mark.skip`) names the test it sits on, which is below it.
+        if (line.trimStart().startsWith("@")) {
+            for (let i = from + 1; i < lines.length; i++) {
+                const name = declaredName(lines[i]);
+                if (name !== null)
+                    return name;
+            }
+        }
+        for (let i = from; i >= 0; i--) {
             const name = declaredName(lines[i]);
             if (name !== null)
                 return name;
@@ -902,7 +923,8 @@ function testAt(body, line, at) {
 const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
 /**
  * The added lines of a `--no-renames` unified diff that disable a test, and the removed
- * assertion lines of a test file: each with its new-file line and the test it sits in.
+ * assertion lines of a test file the same diff does not add back: each with its new-file
+ * line and the test it sits in.
  */
 export function disabledTestsIn(diff, root) {
     const out = [];
@@ -916,6 +938,9 @@ export function disabledTestsIn(diff, root) {
         }
         return bodies.get(rel);
     };
+    /** Trimmed texts of the added lines, so a removed assertion re-added elsewhere is not a drop. */
+    const readded = new Map();
+    const removed = [];
     let file = "";
     let next = 0;
     for (const raw of diff.split("\n")) {
@@ -932,17 +957,29 @@ export function disabledTestsIn(diff, root) {
         }
         if (raw.startsWith("+")) {
             const text = raw.slice(1);
-            if (DISABLED_MARKERS.some((m) => m.test(text)))
+            if (markersFor(file).some((m) => m.test(text)))
                 out.push({ file, line: next, test: testAt(body(file), text, next) });
+            const key = text.trim();
+            readded.set(key, (readded.get(key) ?? 0) + 1);
             next++;
         }
         else if (raw.startsWith("-")) {
-            if (TEST_FILE.test(file) && ASSERTION.test(raw.slice(1)))
-                out.push({ file, line: next, test: testAt(body(file), raw.slice(1), next) });
+            const text = raw.slice(1);
+            if (TEST_FILE.test(file) && isAssertion(text))
+                removed.push({ file, line: next, text });
         }
         else if (raw.startsWith(" "))
             next++;
     }
+    for (const r of removed) {
+        const key = r.text.trim();
+        const left = readded.get(key) ?? 0;
+        if (left > 0) {
+            readded.set(key, left - 1);
+            continue;
+        }
+        out.push({ file: r.file, line: r.line, test: testAt(body(r.file), r.text, r.line) });
+    }
     return out;
 }
 function scanDiffVerb(ctx) {
@@ -1885,7 +1922,7 @@ export const branchesCommand = {
                 {
                     name: "disabled-tests",
                     type: "boolean",
-                    help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`) or a test file loses an assertion; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+                    help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, a test file's `@pytest.mark.skip` / `@unittest.skip`) or a test file drops an assertion no line adds back; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
                 },
                 {
                     name: "expect-none",
@@ -1896,7 +1933,7 @@ export const branchesCommand = {
             output: {
                 found: "something matched",
                 paths: "the matching paths",
-                disabled: "[{file, line, test}]: added lines that disable a test, and removed assertion lines of a test file (only with --disabled-tests)",
+                disabled: "[{file, line, test}]: added lines that disable a test, and removed assertion lines of a test file that no added line re-adds (only with --disabled-tests)",
             },
             exitCodes: {
                 [EXIT_DIFF_FAILED]: "--base does not resolve, or git diff failed",
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 65931843c..0b7220184 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -1447,7 +1447,8 @@ export function triageDeferrals(root, fid, planPath) {
         }
         const paths = namedPaths(row);
         const verdicts = {
-            "bounded-remediation": existsIn(root, paths),
+            // Test 1 reads "not a new architecture": an `own-cycle` row declares itself plan-sized.
+            "bounded-remediation": row["reason"] !== "own-cycle" && existsIn(root, paths),
             "in-scope-surface": paths.some((p) => scope.some((s) => within(p, s))),
             "no-external-blocker": row["reason"] !== "hard-blocked" && row["reason"] !== "needs-decision",
             "own-declaration": !declares(row, fid, issue, declared),
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index de803a477..d12fa0919 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -284,3 +284,6 @@
 {"schema":3,"ts":1793048933941,"kind":"deferral","key":"703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-55","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["703-standardise-question-option"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The recommendation rule passes on any `X)` anywhere in the tail, so a line can revert to a letterless `Recommended:` and stay green — `Recommended: Fix now — the A) path already caps it` reports zero violations","description":"LOW build challenge finding at .bkit/core/engine/audits/workflows/question-option-format.test.ts:55: The recommendation rule passes on any `X)` anywhere in the tail, so a line can revert to a letterless `Recommended:` and stay green — `Recommended: Fix now — the A) path already caps it` reports zero violations. Done when: the rule requires the tail to name the recommended option's own letter — a leading `{letter}) `, as `Recommended: A) Fix now — …` writes it — so `Recommended: Fix now — the A) path already caps it` fails, and the corpus's four real `Recommended:` tails (`.bkit/core/workflows/bkit-debug.md:108`, `bkit-ship.md:601`, `bkit-design.md:243` and `:263`) plus the plan template's still pass.","source":".bkit/core/engine/audits/workflows/question-option-format.test.ts:55"}
 {"schema":3,"ts":1793048933942,"kind":"deferral","key":"703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-50","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["703-standardise-question-option"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Every `/` inside an option's own text splits that entry, so a legitimate list such as `Options: A) keep the read/write split · B) merge them` reports two bogus violations and tells the writer to letter entries `B)` and `C)` that do not exist","description":"LOW build challenge finding at .bkit/core/engine/audits/workflows/question-option-format.test.ts:50: Every `/` inside an option's own text splits that entry, so a legitimate list such as `Options: A) keep the read/write split · B) merge them` reports two bogus violations and tells the writer to letter entries `B)` and `C)` that do not exist. Done when: an entry whose own text carries `/` (`A) n/a`, `A) read/write`) reads as one entry, while `A) Accept / B) Fix now` and `` `Options: A) {option} — {trade-off} · B) …` `` still read as two, and the four corpus assertions plus the not-vacuous guard stay green.","source":".bkit/core/engine/audits/workflows/question-option-format.test.ts:50"}
 {"schema":3,"ts":1793090492339,"kind":"deferral","key":"703-standardise-question-option-roadmap-duplicate-refreshed-stamp","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-deferred-sweep","subagent":"bkit-ship-deferred-sweep","model":"deepseek/deepseek-v4.1-flash"},"references":["703-standardise-question-option","docs/plans/202610/logs/703-standardise-question-option/ship-input-1.md"],"type":"issue","category":"docs","severity":"LOW","reason":"unjustified","summary":"docs/roadmap.md carries a duplicated `_(refreshed …)_` stamp this run's diff adds, left as a tracker-comment follow-up instead of fixed","description":"Declared deferred work with no valid `reason`: the run's issue comment (2026-10-27) records `docs/roadmap.md` carrying a duplicated `_(refreshed …)_` stamp, `left as a follow-up rather than adding another commit`, and `git diff origin/dev -- docs/roadmap.md` shows this run's diff adding the second stamp at `docs/roadmap.md:17`. No enum value fits — not `scope-declared` (no doc called it out before work started), not `hard-blocked` (no external blocker), not `needs-decision`, not `own-cycle` (a one-line mechanical fix), not `low-severity` (not a challenge finding) — so per `.bkit/jsonl.md` § Deferral Reason it is unfinished work. All four `unjustified` tests hold: remediation is bounded (delete `docs/roadmap.md:17`, or let the close step's `bkit roadmap fold` collapse it); the surface sits in a file this cycle touched (`docs/roadmap.md` is in the run diff); no external blocker; and the declaration exists only in the run's own tracker comment, written at the moment of avoidance. Cosmetic — no gate catches it and `bkit roadmap fold` collapses it at workflow close — so it never blocks the merge.","remediation":"Delete the duplicate `_(refreshed …)_` line at `docs/roadmap.md:17`, or run `bkit roadmap fold` once before the merge so the stamp block carries a single line.","source":"docs/roadmap.md:17","status":"TRIAGED"}
+{"schema":3,"ts":1793140354969,"kind":"deferral","key":"701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-266","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["701-engine-work-build"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`tasks open` drops ticked tasks before matching the log, so a ticked task holding neither a `DONE` nor a `BLOCKED` line is never listed and `handover` stays false — the contract says the verb lists exactly the tasks holding neither line","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tasks.ts:266: `tasks open` drops ticked tasks before matching the log, so a ticked task holding neither a `DONE` nor a `BLOCKED` line is never listed and `handover` stays false — the contract says the verb lists exactly the tasks holding neither line. Done when: the group's open set is the tasks with neither line, whatever their box, and the output names the ticked-but-unlogged task; the handover route in `.bkit/core/workflows/bkit-build.md` Step 6 reads the same list","source":".bkit/core/engine/commands/workflow/tasks.ts:266"}
+{"schema":3,"ts":1793140354970,"kind":"deferral","key":"701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-branches-ts-1126","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["701-engine-work-build"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`scan-diff --disabled-tests` reads the working-tree body of each test file named by the diff through `path.resolve(root, rel)` with no containment or symlink check, so a repo test file that is a symlink to an outside file (`~/.aws/credentials`, a consumer's env file) has its content scanned and a declaration-shaped line of the target surfaces as the `test` name in stderr and the emitted `disabled` payload — one line of an arbitrary local file leaking into the sweep's report artifact","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:1126: `scan-diff --disabled-tests` reads the working-tree body of each test file named by the diff through `path.resolve(root, rel)` with no containment or symlink check, so a repo test file that is a symlink to an outside file (`~/.aws/credentials`, a consumer's env file) has its content scanned and a declaration-shaped line of the target surfaces as the `test` name in stderr and the emitted `disabled` payload — one line of an arbitrary local file leaking into the sweep's report artifact. Done when: the `body` read in `disabledTestsIn` resolves the diff path inside the repo root and refuses symlink escapes — the same guard `existsIn` in `ledgers.ts` (this diff) carries (`path.relative(root, abs)` non-`..`, non-absolute), plus `lstat` symlink detection as `worktrees.ts` does — so a symlinked test file's outside target is never opened, while an ordinary in-repo test file still resolves its test name","source":".bkit/core/engine/commands/workflow/branches.ts:1126"}
+{"schema":3,"ts":1793140354971,"kind":"deferral","key":"701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-challenge-ts-269","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["701-engine-work-build"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`challenge merge`'s `matrixRows` interpolates a finding's backticked test file and name into the plan's `Derived Test Matrix` row unsanitised (a `|` in either span breaks the row's cells and shifts its `Task` mapping — finding text derived from untrusted diff content), and the merge gate `planProblems` filters plan-check problems to the appended task range only, so the corrupt matrix row inserted near the plan's top is never checked and the broken plan is written","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/challenge.ts:269: `challenge merge`'s `matrixRows` interpolates a finding's backticked test file and name into the plan's `Derived Test Matrix` row unsanitised (a `|` in either span breaks the row's cells and shifts its `Task` mapping — finding text derived from untrusted diff content), and the merge gate `planProblems` filters plan-check problems to the appended task range only, so the corrupt matrix row inserted near the plan's top is never checked and the broken plan is written. Done when: `matrixRows` strips or refuses table-breaking markup (`|`, leading/trailing cell whitespace tricks) from the file and name spans before interpolation — the same sanitisation the no-spans fallback (`entry.replace(/[`|]/g, \"\")`) already applies — and a row that would break the table refuses the merge with exit 1 naming the finding, never writing a corrupt plan","source":".bkit/core/engine/commands/workflow/challenge.ts:269"}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index edb21e65c..f88851ff8 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -320,3 +320,4 @@
 {"schema":3,"ts":1793103134789,"kind":"knowledge","key":"workflow-reads-artifact-header-fields-after-steps-finish","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/audits/workflows/workflow-shape.test.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/workflows/bkit-build.md"],"summary":"A workflow reads an artifact header's fields from `steps finish`'s `fields` output, so a verb that needs one runs in the sub-step after the finish, never before it","description":"- **Category:** tooling\n- **Symptom:** a workflow step that needs a subagent artifact's header field before the step's commit makes `workflow-shape.test.ts` fail with `<workflow> never reads a verdict outside `steps finish``.\n- **Root cause:** `bkit steps verdict` is barred from workflow files, and `steps finish` prints `fields` only once it has written the row and committed; a sub-step placed before the finish has no way to hold a declared field such as the verify artifact's task numbers.\n- **Fix or rule:** read the field from `steps finish`'s output and run the verb that consumes it in the sub-step after the finish; the edit it makes rides the next step's commit.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent"}
 {"schema":3,"ts":1793107857006,"kind":"knowledge","key":"slop-gate-suppression-flags-skip-literals-in-test-fixtures","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":["scripts/slop/bkit-slop-type-suppression.mjs","slop-scan.config.json",".bkit/core/engine/commands/workflow/branches.ts"],"summary":"A test fixture that spells `it.skip(...)` fails `bkit ci slop`'s boundary/gate-suppression rule; compose the marker from two pieces as the plugin composes its own patterns","description":"- **Category:** tooling\n- **Symptom:** `pnpm slop:delta` fails with `netFindingCount: 1` on a test file that only holds skip markers inside fixture strings, never calling a skip.\n- **Root cause:** `bkit-slop-type-suppression.mjs` scans raw file text for `.skip` / `.only` / x-prefixed test calls and only skips comments, so a fixture string that builds a skip marker is indistinguishable from a disabled test; the plugin avoids its own patterns with character classes and string composition.\n- **Fix or rule:** spell a fixture's marker in two pieces (`const SKIP = `${`it`}.${`skip`}`;`) with a comment saying why, and keep the fixture's assertions unchanged; a scoped `boundary/gate-suppression` override in `slop-scan.config.json` is a gate opt-out and needs the owner.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The rule reads text, not syntax, so any string carrying a skip marker counts; test fixtures are its main false positive and no override exists for them.","remediation":"Compose the marker in two pieces inside a helper or constant, as the plugin composes its own patterns, so the file carries no literal the scanner matches."}
 {"schema":3,"ts":1793110852612,"kind":"knowledge","key":"plan-derived-test-matrix-needs-a-task-column","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/challenge.ts",".bkit/core/docs/templates/bkit-plan.md"],"summary":"`bkit tests plan-check` refuses a `Derived Test Matrix` header with no `Task` column, so every matrix the build writes (converted, challenge-merged, Fix now) carries one cell naming exactly one runbook task","description":"- **Category:** process\n- **Symptom:** `bkit tests plan-check` exits 1 with `the Derived Test Matrix header has no `Task` column`, then `Derived Test Matrix row maps to no task`, `maps to TASK {n}, which the plan does not define`, or `TASK {n} names TEST FIRST tests but no Derived Test Matrix row maps to it`.\n- **Root cause:** the matrix-to-runbook mapping is a plan contract with one right answer, so `plan-check` derives it from the table; a plan converted from an issue body carries the issue's three-column matrix (`Test description | Type | Target file`) with no mapping, and a task appended later (challenge merge, Decision Pause Fix now) adds its test to `TEST FIRST` without a row.\n- **Fix or rule:** write the matrix as `Test description | Type | Target file | Task`, one task number per row, and append one row per test every later task adds; `bkit challenge merge` and the Fix-now task writer add both together.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The issue's change shape carries a three-column matrix while the plan's table is the runbook's coverage map; converting one to the other adds the column only if the writer knows the mapping is checked.","remediation":"Give the table a `Task` column, name one defined task per row, and add a row beside every test a later task appends; run `bkit tests plan-check` after any plan write."}
+{"schema":3,"ts":1793140927438,"kind":"knowledge","key":"scan-diff-removal-case-diffs-a-commit-not-the-branch","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"summary":"A removal-only case for `bkit branches scan-diff --disabled-tests` must diff a commit whose parent already holds the test file: against `origin/dev` a file the branch itself creates nets to a pure addition, so the deleted line never appears and the test false-greens","description":"- **Category:** tooling\n- **Symptom:** a `branches.test.ts` case asserting that a removed test-file line is (or is not) reported passes while the scanner still over-reports, and the same case fails for the wrong reason after a `--base` change.\n- **Root cause:** `--base=origin/dev` diffs the whole branch, so a test file added inside the branch shows as one `+` block with its final content; a line added in an earlier commit and deleted in a later one is net-absent from the diff and its removal branch never runs.\n- **Fix or rule:** give the fixture a commit holding the file first, then diff `--base=HEAD~1` (or a base that already carries the file) so the deletion appears as a `-` line; keep `origin/dev` for added-marker cases.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Git's diff is per range, not per commit: a line that exists only between two commits of the range cancels out, so a removal-only assertion has nothing to read.","remediation":"Seed the file in an earlier commit and diff `--base=HEAD~1`, or land the file on `dev` before branching."}
diff --git a/docs/testing.md b/docs/testing.md
index 133753730..57bd2a953 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -616,7 +616,7 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed, `--lock-held`, `lastDoneStep` and the run's own `OPEN` decision as `openDecision` on a resume; failed row, own-lock release, rebase abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused push keeping the record in the book with exit 10); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs). |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
-| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; docs-from-dev merge; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `update-branch` then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --disabled-tests`: an added `.skip` / `@Disabled` / `t.Skip()` exits 1 with each hit's `file:line` and test name, a diff adding none exits 0 with an empty `disabled`. |
+| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; docs-from-dev merge; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `update-branch` then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --disabled-tests`: an added `.skip` / `@Disabled` / `t.Skip()`, and a test file's `@pytest.mark.skip` / `@unittest.skip` / bare `.skip(`, exits 1 with each hit's `file:line` and the test it sits in, a diff adding none exits 0 with an empty `disabled`; a removed comment, a removed non-assertion statement and an assertion re-added in the same diff are not reported, a removed assertion no line re-adds is. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
 | `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
