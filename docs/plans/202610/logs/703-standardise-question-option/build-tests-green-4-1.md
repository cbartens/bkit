Enforced: true
Gaps: 4
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/703-standardise-question-option-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "RED-PROOF: a second Options: list on one line still fires the option rule" | recorded 2026-10-26T20:37:35Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "an option list whose entries span code spans letters every entry" | recorded 2026-10-26T20:37:37Z | yes | passed |
| 9 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "every recommendation line in the templates and the prompts names a letter" | recorded 2026-10-26T20:38:13Z | yes | passed |
| 10 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "every open-question rule in the prompts index names the lettered option form" | recorded 2026-10-26T20:38:55Z | yes | passed |

## Gaps

- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/question-option-format.test.ts` differs from its red snapshot for "RED-PROOF: a second Options: list on one line still fires the option rule" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/question-option-format.test.ts` differs from its red snapshot for "an option list whose entries span code spans letters every entry" (diff below)
- Task 9 `test-changed` — `.bkit/core/engine/audits/workflows/question-option-format.test.ts` differs from its red snapshot for "every recommendation line in the templates and the prompts names a letter" (diff below)
- Task 10 `test-changed` — `.bkit/core/engine/audits/workflows/question-option-format.test.ts` differs from its red snapshot for "every open-question rule in the prompts index names the lettered option form" (diff below)

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-8-1.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 9b963df05..ef97ef18f 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-8-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -35,12 +35,16 @@ const SCAN_DIRS = [WORKFLOWS, PROMPTS, TEMPLATES, AUTHORING];
 /** The canonical description of the layout, and the plan template's placeholder. */
 const CANONICAL = ".bkit/core/.bkit/workflows.md";
 const PLAN_TEMPLATE = ".bkit/core/docs/templates/bkit-plan.md";
+/** The prompts index source, and the rendered mirror the dogfood install copies it into. */
+const PROMPTS_INDEX = ".bkit/core/.bkit/prompts.md";
+const PROMPTS_INDEX_MIRROR = ".bkit/prompts.md";
 
 /**
- * The label opening an option list. The lookbehind keeps headers that merely end
- * in `Options` (`X-Content-Type-Options: nosniff`) out of the scan.
+ * The label opening an option list. Global, so every list a line carries is read,
+ * not just the first. The lookbehind keeps headers that merely end in `Options`
+ * (`X-Content-Type-Options: nosniff`) out of the scan.
  */
-const OPTIONS_LABEL = /(?<![-\w])Options:/;
+const OPTIONS_LABEL = /(?<![-\w])Options:/g;
 const RECOMMENDED_LABEL = /(?<![-\w])Recommended:/;
 /** Separators between the entries of one list: `A) … / B) …` and `A) … · B) …`. */
 const ENTRY_SEPARATOR = /\s*(?:\/|·)\s*/;
@@ -77,22 +81,33 @@ function mdFiles(dir: string): Array<{ file: string; text: string }> {
     .map((n) => ({ file: `${dir}/${n}`, text: fs.readFileSync(path.join(abs, n), "utf-8") }));
 }
 
+/** Character ranges covered by the inline code spans of one line. */
+function codeSpans(line: string): Array<[number, number]> {
+  return [...line.matchAll(/`[^`]*`/g)].map((m) => [m.index!, m.index! + m[0].length]);
+}
+
 /**
  * A list sits either inside a code span or at the end of the line. A line that
  * only names the label carries a bare `Options:` and no entries, so it is not a
- * list and the rule has nothing to letter.
+ * list and the rule has nothing to letter. Every label on the line is read: a
+ * list whose label sits inside a span runs to that span's own closing backtick,
+ * one whose label sits outside runs to the next label (or the line's end). The
+ * span backticks are dropped, so an entry wrapped in its own code span still
+ * reads as one entry.
  */
 function optionLists(text: string): OptionList[] {
   const out: OptionList[] = [];
   text.split("\n").forEach((line, i) => {
-    const m = OPTIONS_LABEL.exec(line);
-    if (m === null) return;
-    const raw = line
-      .slice(m.index + m[0].length)
-      .split("`")[0]!
-      .trim();
-    if (raw === "") return;
-    out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
+    const matches = [...line.matchAll(OPTIONS_LABEL)];
+    const spans = codeSpans(line);
+    matches.forEach((m, at) => {
+      const after = m.index + m[0].length;
+      const span = spans.find(([start, end]) => after >= start && after < end);
+      const end = span ? span[1] : (matches[at + 1]?.index ?? line.length);
+      const raw = line.slice(after, end).replace(/`/g, "").trim();
+      if (raw === "") return;
+      out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
+    });
   });
   // A `**Options:**` label closes its bold right after the colon, so the first
   // entry of that list carries the closing marker.
@@ -192,6 +207,15 @@ function openQuestionRules(): Array<{ file: string; no: number; text: string }>
   );
 }
 
+/** Every row of a prompts index that names open questions and the options they carry. */
+function indexOpenQuestionRules(file: string): Array<{ no: number; text: string }> {
+  return read(file)
+    .split("\n")
+    .flatMap((text, i) =>
+      OPEN_QUESTION.test(text) && OPTIONS_WORD.test(text) ? [{ no: i + 1, text }] : [],
+    );
+}
+
 /** The `Open Questions` placeholder of the plan template, and how many lines precede it. */
 function planTemplateOpenQuestions(): { text: string; offset: number } {
   const doc = read(PLAN_TEMPLATE);
@@ -230,6 +254,10 @@ describe("question option format: one layout across the corpus", () => {
     expect(recommendationViolationsIn([WORKFLOWS])).toEqual([]);
   });
 
+  it("every recommendation line in the templates and the prompts names a letter", () => {
+    expect(recommendationViolationsIn([PROMPTS, TEMPLATES, AUTHORING])).toEqual([]);
+  });
+
   it("every open-question rule in the prompts names the lettered option form", () => {
     expect(
       openQuestionRules().length,
@@ -241,6 +269,21 @@ describe("question option format: one layout across the corpus", () => {
     expect(bad).toEqual([]);
   });
 
+  it("every open-question rule in the prompts index names the lettered option form", () => {
+    const rules = indexOpenQuestionRules(PROMPTS_INDEX);
+    expect(rules.length, "the prompts index states no open-question rule").toBeGreaterThanOrEqual(
+      5,
+    );
+    const bad = rules
+      .filter((rule) => !LETTER.test(rule.text))
+      .map((rule) => `${PROMPTS_INDEX}:${rule.no}: ${rule.text.trim()}`);
+    expect(bad).toEqual([]);
+    expect(
+      indexOpenQuestionRules(PROMPTS_INDEX_MIRROR).map((rule) => rule.text),
+      `${PROMPTS_INDEX_MIRROR} is stale — run the dogfood install`,
+    ).toEqual(rules.map((rule) => rule.text));
+  });
+
   it("the plan template letters every option of its Open Questions placeholder", () => {
     const open = planTemplateOpenQuestions();
     expect(
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-8-2.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 9b963df05..ef97ef18f 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-8-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -35,12 +35,16 @@ const SCAN_DIRS = [WORKFLOWS, PROMPTS, TEMPLATES, AUTHORING];
 /** The canonical description of the layout, and the plan template's placeholder. */
 const CANONICAL = ".bkit/core/.bkit/workflows.md";
 const PLAN_TEMPLATE = ".bkit/core/docs/templates/bkit-plan.md";
+/** The prompts index source, and the rendered mirror the dogfood install copies it into. */
+const PROMPTS_INDEX = ".bkit/core/.bkit/prompts.md";
+const PROMPTS_INDEX_MIRROR = ".bkit/prompts.md";
 
 /**
- * The label opening an option list. The lookbehind keeps headers that merely end
- * in `Options` (`X-Content-Type-Options: nosniff`) out of the scan.
+ * The label opening an option list. Global, so every list a line carries is read,
+ * not just the first. The lookbehind keeps headers that merely end in `Options`
+ * (`X-Content-Type-Options: nosniff`) out of the scan.
  */
-const OPTIONS_LABEL = /(?<![-\w])Options:/;
+const OPTIONS_LABEL = /(?<![-\w])Options:/g;
 const RECOMMENDED_LABEL = /(?<![-\w])Recommended:/;
 /** Separators between the entries of one list: `A) … / B) …` and `A) … · B) …`. */
 const ENTRY_SEPARATOR = /\s*(?:\/|·)\s*/;
@@ -77,22 +81,33 @@ function mdFiles(dir: string): Array<{ file: string; text: string }> {
     .map((n) => ({ file: `${dir}/${n}`, text: fs.readFileSync(path.join(abs, n), "utf-8") }));
 }
 
+/** Character ranges covered by the inline code spans of one line. */
+function codeSpans(line: string): Array<[number, number]> {
+  return [...line.matchAll(/`[^`]*`/g)].map((m) => [m.index!, m.index! + m[0].length]);
+}
+
 /**
  * A list sits either inside a code span or at the end of the line. A line that
  * only names the label carries a bare `Options:` and no entries, so it is not a
- * list and the rule has nothing to letter.
+ * list and the rule has nothing to letter. Every label on the line is read: a
+ * list whose label sits inside a span runs to that span's own closing backtick,
+ * one whose label sits outside runs to the next label (or the line's end). The
+ * span backticks are dropped, so an entry wrapped in its own code span still
+ * reads as one entry.
  */
 function optionLists(text: string): OptionList[] {
   const out: OptionList[] = [];
   text.split("\n").forEach((line, i) => {
-    const m = OPTIONS_LABEL.exec(line);
-    if (m === null) return;
-    const raw = line
-      .slice(m.index + m[0].length)
-      .split("`")[0]!
-      .trim();
-    if (raw === "") return;
-    out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
+    const matches = [...line.matchAll(OPTIONS_LABEL)];
+    const spans = codeSpans(line);
+    matches.forEach((m, at) => {
+      const after = m.index + m[0].length;
+      const span = spans.find(([start, end]) => after >= start && after < end);
+      const end = span ? span[1] : (matches[at + 1]?.index ?? line.length);
+      const raw = line.slice(after, end).replace(/`/g, "").trim();
+      if (raw === "") return;
+      out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
+    });
   });
   // A `**Options:**` label closes its bold right after the colon, so the first
   // entry of that list carries the closing marker.
@@ -192,6 +207,15 @@ function openQuestionRules(): Array<{ file: string; no: number; text: string }>
   );
 }
 
+/** Every row of a prompts index that names open questions and the options they carry. */
+function indexOpenQuestionRules(file: string): Array<{ no: number; text: string }> {
+  return read(file)
+    .split("\n")
+    .flatMap((text, i) =>
+      OPEN_QUESTION.test(text) && OPTIONS_WORD.test(text) ? [{ no: i + 1, text }] : [],
+    );
+}
+
 /** The `Open Questions` placeholder of the plan template, and how many lines precede it. */
 function planTemplateOpenQuestions(): { text: string; offset: number } {
   const doc = read(PLAN_TEMPLATE);
@@ -230,6 +254,10 @@ describe("question option format: one layout across the corpus", () => {
     expect(recommendationViolationsIn([WORKFLOWS])).toEqual([]);
   });
 
+  it("every recommendation line in the templates and the prompts names a letter", () => {
+    expect(recommendationViolationsIn([PROMPTS, TEMPLATES, AUTHORING])).toEqual([]);
+  });
+
   it("every open-question rule in the prompts names the lettered option form", () => {
     expect(
       openQuestionRules().length,
@@ -241,6 +269,21 @@ describe("question option format: one layout across the corpus", () => {
     expect(bad).toEqual([]);
   });
 
+  it("every open-question rule in the prompts index names the lettered option form", () => {
+    const rules = indexOpenQuestionRules(PROMPTS_INDEX);
+    expect(rules.length, "the prompts index states no open-question rule").toBeGreaterThanOrEqual(
+      5,
+    );
+    const bad = rules
+      .filter((rule) => !LETTER.test(rule.text))
+      .map((rule) => `${PROMPTS_INDEX}:${rule.no}: ${rule.text.trim()}`);
+    expect(bad).toEqual([]);
+    expect(
+      indexOpenQuestionRules(PROMPTS_INDEX_MIRROR).map((rule) => rule.text),
+      `${PROMPTS_INDEX_MIRROR} is stale — run the dogfood install`,
+    ).toEqual(rules.map((rule) => rule.text));
+  });
+
   it("the plan template letters every option of its Open Questions placeholder", () => {
     const open = planTemplateOpenQuestions();
     expect(
```

## Diff since red — Task 9 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-9-1.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 53eb50ff7..ef97ef18f 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-9-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -35,6 +35,9 @@ const SCAN_DIRS = [WORKFLOWS, PROMPTS, TEMPLATES, AUTHORING];
 /** The canonical description of the layout, and the plan template's placeholder. */
 const CANONICAL = ".bkit/core/.bkit/workflows.md";
 const PLAN_TEMPLATE = ".bkit/core/docs/templates/bkit-plan.md";
+/** The prompts index source, and the rendered mirror the dogfood install copies it into. */
+const PROMPTS_INDEX = ".bkit/core/.bkit/prompts.md";
+const PROMPTS_INDEX_MIRROR = ".bkit/prompts.md";
 
 /**
  * The label opening an option list. Global, so every list a line carries is read,
@@ -101,10 +104,7 @@ function optionLists(text: string): OptionList[] {
       const after = m.index + m[0].length;
       const span = spans.find(([start, end]) => after >= start && after < end);
       const end = span ? span[1] : (matches[at + 1]?.index ?? line.length);
-      const raw = line
-        .slice(after, end)
-        .replace(/`/g, "")
-        .trim();
+      const raw = line.slice(after, end).replace(/`/g, "").trim();
       if (raw === "") return;
       out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
     });
@@ -207,6 +207,15 @@ function openQuestionRules(): Array<{ file: string; no: number; text: string }>
   );
 }
 
+/** Every row of a prompts index that names open questions and the options they carry. */
+function indexOpenQuestionRules(file: string): Array<{ no: number; text: string }> {
+  return read(file)
+    .split("\n")
+    .flatMap((text, i) =>
+      OPEN_QUESTION.test(text) && OPTIONS_WORD.test(text) ? [{ no: i + 1, text }] : [],
+    );
+}
+
 /** The `Open Questions` placeholder of the plan template, and how many lines precede it. */
 function planTemplateOpenQuestions(): { text: string; offset: number } {
   const doc = read(PLAN_TEMPLATE);
@@ -260,6 +269,21 @@ describe("question option format: one layout across the corpus", () => {
     expect(bad).toEqual([]);
   });
 
+  it("every open-question rule in the prompts index names the lettered option form", () => {
+    const rules = indexOpenQuestionRules(PROMPTS_INDEX);
+    expect(rules.length, "the prompts index states no open-question rule").toBeGreaterThanOrEqual(
+      5,
+    );
+    const bad = rules
+      .filter((rule) => !LETTER.test(rule.text))
+      .map((rule) => `${PROMPTS_INDEX}:${rule.no}: ${rule.text.trim()}`);
+    expect(bad).toEqual([]);
+    expect(
+      indexOpenQuestionRules(PROMPTS_INDEX_MIRROR).map((rule) => rule.text),
+      `${PROMPTS_INDEX_MIRROR} is stale — run the dogfood install`,
+    ).toEqual(rules.map((rule) => rule.text));
+  });
+
   it("the plan template letters every option of its Open Questions placeholder", () => {
     const open = planTemplateOpenQuestions();
     expect(
```

## Diff since red — Task 10 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-10-1.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 116d0ff23..ef97ef18f 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-4-10-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -104,10 +104,7 @@ function optionLists(text: string): OptionList[] {
       const after = m.index + m[0].length;
       const span = spans.find(([start, end]) => after >= start && after < end);
       const end = span ? span[1] : (matches[at + 1]?.index ?? line.length);
-      const raw = line
-        .slice(after, end)
-        .replace(/`/g, "")
-        .trim();
+      const raw = line.slice(after, end).replace(/`/g, "").trim();
       if (raw === "") return;
       out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
     });
@@ -274,10 +271,9 @@ describe("question option format: one layout across the corpus", () => {
 
   it("every open-question rule in the prompts index names the lettered option form", () => {
     const rules = indexOpenQuestionRules(PROMPTS_INDEX);
-    expect(
-      rules.length,
-      "the prompts index states no open-question rule",
-    ).toBeGreaterThanOrEqual(5);
+    expect(rules.length, "the prompts index states no open-question rule").toBeGreaterThanOrEqual(
+      5,
+    );
     const bad = rules
       .filter((rule) => !LETTER.test(rule.text))
       .map((rule) => `${PROMPTS_INDEX}:${rule.no}: ${rule.text.trim()}`);
```
