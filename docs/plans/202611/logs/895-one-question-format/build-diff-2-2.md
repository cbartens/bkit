diff --git a/.bkit/core/.bkit/authoring.md b/.bkit/core/.bkit/authoring.md
index d2a67384d..155ac0c03 100644
--- a/.bkit/core/.bkit/authoring.md
+++ b/.bkit/core/.bkit/authoring.md
@@ -628,17 +628,26 @@ This section applies to `.bkit/core/workflows/*.md`. § Prompts and Workflows ap
     - [ ] Each unconfirmed item deferred (`decisions pending --defer`)
     ```
 
-- **Human questions:** Only the orchestrator asks the owner, in the session, with every question of the round in one plain-text message, never through a subagent or a host question tool.
+- **Human questions:** Only the orchestrator asks the owner, in the session, in plain text, never through a subagent or a host question tool, at every question point.
   - Why: The owner answers a whole round at once and may answer with one word, so "yes" must safely take the recommendations and a letter must map to exactly one option. Recording the wait and the reply lets a resumed run see where it stopped.
   - Each question takes this shape:
     ```markdown
-    **Q{n} — {title}:** {the question, worded so that "yes" accepts the recommendation}
-    Options: A) {option} / B) {option}
-    Recommended: A) {option}
+    **Q{n} — {title}:** {what you are deciding, in plain English, worded so "yes" takes the recommendation}
+    A) {option} — {what happens if you pick it}
+    B) {option} — {what happens if you pick it}
+    Recommended: A) {option} — {why}
+    Default if unanswered: {what happens}
     ```
-  - A question no agent can settle (a hard blocker) has `No recommendation` in place of the `Recommended:` line.
-  - Number questions from `Q1`, and letter options `A)`, `B)`, `C)` in order.
-  - Say what the owner must decide and what each option does, in plain English, before naming any file, test or identifier.
+  - Number questions from `Q1`, and letter options `A)`, `B)`, `C)` in order, one option per line.
+  - Say what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+  - `Default if unanswered:` takes one phrase from this closed set, and joins two with `; `: `the run waits for you`, `taken as A when nobody can be asked`, `the run stops when nobody can be asked`, `the plan assumes A`, `the plan stops at Gate 1 until you answer`, `the design assumes A`, `written as a needs-decision deferral`.
+  - A point that never has a recommendation drops the "yes" half of the question and of the reply line.
+  - A question no agent can settle (a hard blocker) has `Recommended: none — {why}` in place of a recommendation, and "yes" never answers it.
+  - The stop option reads `Stop — the run ends here with a handover; the next run resumes here` mid-run, and `Stop — nothing changes; the run can be started again` at Step 1.
+  - End each message once with the reply line, naming what "stop" does at that point: `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
+  - When a round has 3 or more questions, add `Or say "one by one" and I'll ask them one at a time.` The "one by one" route counts as the one turn or pause it replaces, and follows the count of questions asked in the message.
+  - A step that needs an action, not a decision, writes `**Action needed — {title}:** {what to do}. Then say "continue".`
+  - Before a status file exists, write no status rows. Wait with `end turn → wait for the answer; no status file yet`.
   - Look facts up in the repo, docs and tools. Ask the owner only for decisions.
   - Run each round in this order:
     1. Narrate the round.
@@ -646,11 +655,21 @@ This section applies to `.bkit/core/workflows/*.md`. § Prompts and Workflows ap
     3. End the turn.
     4. When the reply arrives, record it with `bkit status row --type=owner-answer` before doing anything else.
   - Before the branches of a step that routes on the answer, say that a reply naming a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-  - Example (`bkit-debug.md` § Loop Question): "yes" stops the loop, which is the recommendation. The question already gives the reason, so the `Recommended:` line needs none.
+  - Example (`bkit-debug.md` § Loop Question): the count did not fall.
     ```markdown
     **Q1 — Fix:** The count did not fall between the first and the last round (4 → 4). Stop here instead of trying again?
-    Options: A) Stop / B) Try again
-    Recommended: A) Stop
+    A) Stop — the run ends here with a handover; the next run resumes here
+    B) Try again — another round runs with the same limit
+    Recommended: A) Stop — another round is unlikely to change a count that stayed at 4
+    Default if unanswered: the run waits for you
+    ```
+  - Example (`bkit-build.md` § Verify gap): a task fails its check.
+    ```markdown
+    **Q1 — Gap:** Task 3 still fails its check after the fix. Accept it as it is?
+    A) Accept — the task is logged as accepted and the build continues
+    B) Fix now — the fix runs again before the build continues
+    Recommended: B) Fix now — the failing check is in code this plan changed
+    Default if unanswered: taken as A when nobody can be asked
     ```
   - Example (`bkit-design.md` § Step 3 — Grill): the shape for a round of several questions.
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d21b9a0e4..b5d582d4c 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1022,7 +1022,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 - **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
 - **Headless** (`runtimeHeadless` true, GitHub Actions only) behaves as `ask: false` at every point. `bkit counters route` and `counters max` print `ask` already false when headless.
 - **`ask: false`:** loop questions take the recommendation; `Fix now` is applied; `Accept` is recorded as assumed. Hard blockers are still asked in a session and go to the Failure Path headless.
-- **Question layout**, every point: the `{workflow} {point}: attempt {n} of {max}` line (loop questions; `turn` for the grill), then per question `**Q{n} — {title}:** {question}`, `Options: A) … / B) …`, and `Recommended: A) X — {reason}` or `No recommendation — {why}`, each title and question stating what the owner must decide and what each option does, in plain English, before naming any file, test or identifier; then `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.` Option names: `Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`. Each step routing on the owner's answer reads a lettered reply (`B`, `B)`, `B) {option}`) as the option it labels; `parseDecisionItems` reads a `Decision:` line the same way (`optionAnswer`).
+- **Question layout**, every point: the `{workflow} {point}: attempt {n} of {max}` line (loop questions; `turn` for the grill), then the shape in `.bkit/authoring.md` § Human questions. Option names: `Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`. Each step routing on the owner's answer reads a lettered reply (`B`, `B)`, `B) {option}`) as the option it labels; `parseDecisionItems` reads a `Decision:` line the same way (`optionAnswer`).
 - **Progress report:** `bkit counters progress --check=<step> --fix=<step>` (and `decisions compose --loop`) → the `## Progress` block of a loop question. Counted from `status.jsonl` and git, never judged by an agent:
 
   <!-- prettier-ignore -->
diff --git a/.bkit/core/engine/audits/workflows/question-option-format.test.ts b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 9a8b144d4..6b99dd0a9 100644
--- a/.bkit/core/engine/audits/workflows/question-option-format.test.ts
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -73,7 +73,9 @@ const OPTIONS_WORD = /\boptions\b/i;
 /** An option entry that carries its letter. */
 const LETTER = /[A-Z]\)/;
 /** A recommendation tail that opens on its letter, after an optional `{` or bold marker. */
-const RECOMMENDED_LETTER = /^[*{\s]*[A-Z]\)/;
+const RECOMMENDED_LETTER = /^[*{\s]*(?:[A-Z]\)|none — )/;
+/** One option on its own line: `A) {option} — {effect}`, optionally bulleted. */
+const OPTION_LINE = /^\s*(?:[-*]\s+)?([A-Z])\) (.*)$/;
 /**
  * The sentence every step routing on the owner's answer carries, so a reply by
  * letter reaches the option it labels instead of the `**Else**` branch.
@@ -151,6 +153,38 @@ function optionLists(text: string): OptionList[] {
   return out;
 }
 
+/**
+ * The per-line option blocks of one text: each run of consecutive lines opening
+ * on a letter and `)`, as the shared question shape writes them.
+ */
+function optionLineBlocks(text: string): Array<{ no: number; lines: string[] }> {
+  const out: Array<{ no: number; lines: string[] }> = [];
+  let open = false;
+  text.split("\n").forEach((line, i) => {
+    if (OPTION_LINE.test(line)) {
+      if (!open) out.push({ no: i + 1, lines: [] });
+      out.at(-1)!.lines.push(line.trim().replace(/^[-*]\s+/, ""));
+      open = true;
+    } else open = false;
+  });
+  return out;
+}
+
+/** Why a per-line option block misses its letter or its effect. */
+function optionLineViolations(file: string, text: string, offset = 0): string[] {
+  return optionLineBlocks(text).flatMap(({ no, lines }) =>
+    lines.flatMap((entry, i) => {
+      const want = String.fromCharCode("A".charCodeAt(0) + i);
+      const at = no + i + offset;
+      if (!entry.startsWith(`${want}) `))
+        return [`${file}:${at}: \`${entry}\` — write \`${want}) {option} — {effect}\``];
+      return /\S\s+—\s+\S/.test(entry)
+        ? []
+        : [`${file}:${at}: \`${entry}\` — say what happens if it is picked, after a \`—\``];
+    }),
+  );
+}
+
 /**
  * The `Recommended:` tails, empty where the line only names the label. Every
  * label on the line is read; a tail runs to the next backtick or the next label.
@@ -172,14 +206,17 @@ function recommendationTails(text: string): Hit[] {
 
 /** Why one file's `Options:` lines do not letter every entry, in line order. */
 function optionViolations(file: string, text: string, offset = 0): string[] {
-  return optionLists(text).flatMap(({ no, entries }) =>
-    entries.flatMap((entry, i) => {
-      const want = String.fromCharCode("A".charCodeAt(0) + i);
-      return new RegExp(`^${want}\\)`).test(entry)
-        ? []
-        : [`${file}:${no + offset}: \`${entry}\` — write \`${want}) {option}\``];
-    }),
-  );
+  return [
+    ...optionLists(text).flatMap(({ no, entries }) =>
+      entries.flatMap((entry, i) => {
+        const want = String.fromCharCode("A".charCodeAt(0) + i);
+        return new RegExp(`^${want}\\)`).test(entry)
+          ? []
+          : [`${file}:${no + offset}: \`${entry}\` — write \`${want}) {option}\``];
+      }),
+    ),
+    ...optionLineViolations(file, text, offset),
+  ];
 }
 
 /** Why one file's `Recommended:` lines do not name the letter they recommend. */
@@ -255,7 +292,10 @@ function scanCounts(): Array<{ dir: string; files: number; optionLines: number }
     return {
       dir,
       files: files.length,
-      optionLines: files.flatMap((f) => optionLists(f.text)).length,
+      optionLines: files.reduce(
+        (n, f) => n + optionLists(f.text).length + optionLineBlocks(f.text).length,
+        0,
+      ),
     };
   });
 }
@@ -328,8 +368,8 @@ describe("question option format: one layout across the corpus", () => {
   });
 
   it("the canonical layout letters every option and recommendation", () => {
-    expect(layoutBullet(), `no \`Options: A) … / B) …\` in ${CANONICAL}`).toContain("Options: A)");
-    expect(layoutBullet(), `no \`Recommended: A) X — {reason}\` in ${CANONICAL}`).toContain(
+    expect(humanQuestions(), `no lettered option line in ${AUTHORING_DOC}`).toMatch(/^\s*A\) /m);
+    expect(humanQuestions(), `no \`Recommended: A) X — {reason}\` in ${AUTHORING_DOC}`).toContain(
       "Recommended: A)",
     );
   });
@@ -505,3 +545,108 @@ describe("question option format: the rules fire on a synthetic list", () => {
     expect(recommendationViolations("synthetic.md", line)).toEqual([]);
   });
 });
+
+const AUTHORING_DOC = ".bkit/core/.bkit/authoring.md";
+const PHASE_WORKFLOWS = ["bkit-design", "bkit-plan", "bkit-build", "bkit-debug", "bkit-ship"];
+const DEFAULT_SET = [
+  "the run waits for you",
+  "taken as A when nobody can be asked",
+  "the run stops when nobody can be asked",
+  "the plan assumes A",
+  "the plan stops at Gate 1 until you answer",
+  "the design assumes A",
+  "written as a needs-decision deferral",
+];
+
+/** The `Human questions` bullet of the authoring doc, with its sub-bullets and code block. */
+function humanQuestions(): string {
+  const lines = read(AUTHORING_DOC).split("\n");
+  const start = lines.findIndex((l) => l.startsWith("- **Human questions:**"));
+  if (start < 0) return "";
+  const end = lines.findIndex((l, i) => i > start && /^- \*\*/.test(l));
+  return lines.slice(start, end === -1 ? undefined : end).join("\n");
+}
+
+describe("question option format: the shared shape in § Human questions", () => {
+  it("the canonical shape puts each option on its own line with its effect", () => {
+    const doc = humanQuestions();
+    expect(doc, "§ Human questions still shows the inline Options line").not.toMatch(
+      /^\s*Options: A\)/m,
+    );
+    expect(doc).toMatch(/^\s*A\) \{option\} — \{what happens if you pick it\}$/m);
+    expect(doc).toMatch(/^\s*B\) \{option\} — \{what happens if you pick it\}$/m);
+  });
+
+  it("the canonical shape carries a Default if unanswered line from the fixed set", () => {
+    const doc = humanQuestions();
+    expect(doc).toContain("Default if unanswered:");
+    expect(DEFAULT_SET.filter((phrase) => !doc.includes(phrase))).toEqual([]);
+  });
+
+  it("the canonical shape gives a hard blocker Recommended: none", () => {
+    const doc = humanQuestions();
+    expect(doc).toContain("Recommended: none — ");
+    expect(doc).not.toContain("No recommendation");
+  });
+
+  it("the canonical shape ends a message with the reply line and the one-by-one offer", () => {
+    const doc = humanQuestions();
+    expect(doc).toContain(
+      'Reply with a letter per question, or "yes" to take every recommendation.',
+    );
+    expect(doc).toContain('Or say "one by one" and I\'ll ask them one at a time.');
+  });
+
+  it("the canonical shape keeps the plain-English rule for the question, each option and the recommendation's reason", () => {
+    const doc = humanQuestions();
+    expect(doc).toContain("the reason for the recommendation");
+    expect(doc).toContain("in plain English");
+  });
+
+  it("the Question layout bullet points to § Human questions", () => {
+    const bullet = layoutBullet();
+    expect(bullet).toContain("Human questions");
+    expect(bullet).not.toContain("Options: A)");
+    expect(bullet).not.toContain("Reply per question.");
+  });
+
+  it("RED-PROOF: an option line with no effect fires the option-line rule", () => {
+    expect(
+      optionViolations("synthetic.md", "A) Accept\nB) Fix now — the fix runs again").length,
+    ).toBeGreaterThan(0);
+    expect(
+      optionViolations(
+        "synthetic.md",
+        "A) Accept — the item stays\nB) Fix now — the fix runs again",
+      ),
+    ).toEqual([]);
+  });
+});
+
+describe("question option format: the reply-line clauses reach the workflows", () => {
+  it("no workflow carries the retired reply wording", () => {
+    const hits = mdFiles(WORKFLOWS).flatMap((f) =>
+      ['"stop" writes a handover', 'Reply per question. "yes" takes every recommendation.']
+        .filter((wording) => f.text.includes(wording))
+        .map((wording) => `${f.file}: ${wording}`),
+    );
+    expect(hits).toEqual([]);
+  });
+
+  it("bkit-build: the Decision Pause yes line uses the shared reply wording", () => {
+    const text = read(`${WORKFLOWS}/bkit-build.md`);
+    expect(text).toContain(
+      'Reply with a letter per question, or "yes" to take every recommendation.',
+    );
+    expect(text).not.toContain('"yes" takes every recommendation; it never answers');
+  });
+
+  it("every workflow that asks the owner states the question, each option and the recommendation's reason in plain English", () => {
+    const sentence =
+      "State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.";
+    const missing = PHASE_WORKFLOWS.filter(
+      (name) => read(`${WORKFLOWS}/${name}.md`).split(sentence).length - 1 < 1,
+    );
+    expect(missing).toEqual([]);
+  });
+});
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 8724717bc..875b371ca 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -110,7 +110,7 @@ _No tracker connected, skip step._
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
+2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -166,7 +166,7 @@ _No tracker connected, skip step._
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
-   - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
+   - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=build --type=owner-pause --field=reason=decision >/dev/null || exit 1
      ```
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index f56667e32..108dadd32 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -107,7 +107,7 @@ _No tracker connected, skip step._
    **If** exit non-zero → **Failure Path**.
    Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
    **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
-3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
+3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
      - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
@@ -115,7 +115,7 @@ _No tracker connected, skip step._
      - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
      - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
-   - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
+   - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
      Record the wait → end turn → wait for the answer:
    ```bash
    "{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=loop >/dev/null || exit 1
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
index fb6b5fa8d..a159834ec 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
@@ -199,7 +199,7 @@ _No tracker connected, skip step._
      - Write `**Q{n} — {title}:** {question}` and its options lettered `A)`, `B)`, `C)`, then `Recommended: A) {answer}` on its own line.
      - Number the questions from `Q1` across turns, and word each so "yes" accepts the recommendation.
      - Ask in plain text, not through a host question tool.
-     - State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier.
+     - State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
    - Look up facts in the repo, docs and tools, and never ask the owner for them. Pending lookups hold back only the questions that depend on them.
    - Decide nothing on the owner's behalf.
    - Narrate `design grill: turn {k} of {GRILL_TURNS}` → record the wait → end turn → wait for answers:
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index 066953cdd..fee52c32b 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -419,7 +419,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
 4.
 5. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP** — do not invoke `/bkit-build`.
 6. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
-7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
+7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
 8. **If** the user answers one or more `Open Questions` items (in the one-by-one pass, once its last question is answered, or in any chat message) → record the round in this order:
    - Obtain the round's invocation id and keep the printed `invocation` as `INVOCATION`:
      ```bash
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 0830ab3c5..c3bca8a26 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -303,7 +303,7 @@ _No tracker connected, skip step._
    - **If** `ASSUMED_COUNT` = 0 → return to Step 2.
    - **If** `RUNTIME_HEADLESS` = true → step 4, since there is no one to ask.
    - **Else** → step 2.
-2. Ask the owner in this session. Write in plain text, not through a host question tool. NEVER hand the questions to subagents. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Send one message:
+2. Ask the owner in this session. Write in plain text, not through a host question tool. NEVER hand the questions to subagents. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Send one message:
    - For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then `Options: A) Confirm / B) Reject`, then `No recommendation — only you can accept it`.
    - End the message with the line `Reply per question. Ship merges either way; anything not confirmed is written as a needs-decision deferral.`
 
@@ -734,7 +734,7 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
 1. Ask the human in this session, in plain text, in one message:
    - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
-   - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
+   - End the message with the line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
 
    Record the wait → end turn → wait for the answer:
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 1c57db049..fc0c705f4 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -137,7 +137,7 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
+2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -193,7 +193,7 @@ description: "Build Feature — Autonomous implementation"
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
-   - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
+   - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=build --type=owner-pause --field=reason=decision >/dev/null || exit 1
      ```
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index b8a482f88..1b91c41cc 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -134,7 +134,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    **If** exit non-zero → **Failure Path**.
    Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
    **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
-3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
+3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
      - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
@@ -142,7 +142,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
      - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
      - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
-   - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
+   - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
      Record the wait → end turn → wait for the answer:
    ```bash
    "{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=loop >/dev/null || exit 1
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index c6df22872..5ae3b04cf 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -276,7 +276,7 @@ description: "Design Feature — Autonomous design phase"
      - Write `**Q{n} — {title}:** {question}` and its options lettered `A)`, `B)`, `C)`, then `Recommended: A) {answer}` on its own line.
      - Number the questions from `Q1` across turns, and word each so "yes" accepts the recommendation.
      - Ask in plain text, not through a host question tool.
-     - State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier.
+     - State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
    - Look up facts in the repo, docs and tools, and never ask the owner for them. Pending lookups hold back only the questions that depend on them.
    - Decide nothing on the owner's behalf.
    - Narrate `design grill: turn {k} of {GRILL_TURNS}` → record the wait → end turn → wait for answers:
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 99898872d..2c5355062 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -535,7 +535,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    <!-- bkit:tracker true end -->
 5. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP** — do not invoke `/bkit-build`.
 6. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
-7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
+7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
 8. **If** the user answers one or more `Open Questions` items (in the one-by-one pass, once its last question is answered, or in any chat message) → record the round in this order:
    - Obtain the round's invocation id and keep the printed `invocation` as `INVOCATION`:
      ```bash
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 8e7427ec7..8d1179c42 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -383,7 +383,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** `ASSUMED_COUNT` = 0 → return to Step 2.
    - **If** `RUNTIME_HEADLESS` = true → step 4, since there is no one to ask.
    - **Else** → step 2.
-2. Ask the owner in this session. Write in plain text, not through a host question tool. NEVER hand the questions to subagents. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Send one message:
+2. Ask the owner in this session. Write in plain text, not through a host question tool. NEVER hand the questions to subagents. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Send one message:
    - For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then `Options: A) Confirm / B) Reject`, then `No recommendation — only you can accept it`.
    - End the message with the line `Reply per question. Ship merges either way; anything not confirmed is written as a needs-decision deferral.`
 
@@ -821,7 +821,7 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
 1. Ask the human in this session, in plain text, in one message:
    - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
-   - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
+   - End the message with the line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
 
    Record the wait → end turn → wait for the answer:
 
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 328e10ada..e85e08a7c 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -209,3 +209,5 @@
 {"schema":3,"ts":1794610706525,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":17,"lastConfirmed":1794610706525}
 {"schema":3,"ts":1794616434019,"kind":"friction","key":"ledgers-append/plan-generate-deferrals","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate"},"references":["887-review-doc-starters","https://github.com/cbartens/bkit/issues/887"],"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"plan-generate cannot write deferral rows under its step invocation","description":"In /bkit-plan #887 run 2, @bkit-plan-generate ran `bkit ledgers append --ledger=deferrals` with the step invocation from `bkit status invocation --step=plan-generate`. The engine refused the batch (exit 8: the plan orchestrator does not write deferral rows) because the invocation carries no subagent, so the rows count as written by the orchestrator. Seven rows were lost: reference updates for six 887-* Out of Scope deferrals and moving 864-...-project-docs-ts-429 to TRIAGED. The decision row from the same agent landed but with no subagent or model in `by`.","source":"orchestrator","status":"OPEN","recurrenceCount":1}
 {"schema":3,"ts":1794617726109,"kind":"friction","key":"ledgers-check/plan-summary-unbackticked","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-summary"},"references":["887-review-doc-starters","https://github.com/cbartens/bkit/issues/887"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"plan-update wrote the Ledger rows line with bare keys, which ledgers check reads as unfilled","description":"In /bkit-plan #887 run 2, @bkit-plan-update wrote `**Ledger rows:**` with 15 bare keys. `bkit ledgers check` only reads backticked keys, so it exited 11 with `is unfilled` though every key was on disk. Neither plan-check nor the update agent caught it; the orchestrator added the backticks and the check passed.","source":"orchestrator","status":"OPEN","recurrenceCount":1}
+{"schema":3,"ts":1794661059521,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":14,"lastConfirmed":1794661059521}
+{"schema":3,"ts":1794662486235,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":15,"lastConfirmed":1794662486235}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index d4e10c2d0..f16e5172e 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -5873,12 +5873,16 @@ NEVER run `workflows fail`:
 never `workflows fail`:
 ```
 
-### workflow-yes-takes-all
+### workflow-question-reply-line
 
 - workflow: where-used
 - carriers: workflow `bkit-build`, `bkit-debug`, `bkit-ship`
 
 ```text
+Reply with a letter per question, or "yes" to take every recommendation.
+```
+
+```retired
 "yes" takes every recommendation.
 ```
 
@@ -5888,7 +5892,12 @@ never `workflows fail`:
 - carriers: workflow `bkit-debug`, `bkit-ship`
 
 ```text
+"stop" ends here with a handover; the next run resumes here.
+```
+
+```retired
 "stop" writes a handover; the run can be resumed.
+"stop" ends here with a handover; the run can be resumed.
 ```
 
 ### workflow-record-reply
@@ -7133,9 +7142,13 @@ word each so "yes" accepts the recommendation.
 ### workflow-question-plain
 
 - workflow: where-used
-- carriers: workflow all except `bkit-auto`, `bkit-plan`
+- carriers: workflow all except `bkit-auto`
 
 ```text
+State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+```
+
+```retired
 State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier.
 ```
 
@@ -10363,7 +10376,7 @@ Read the loop's progress:
 **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
 **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
 `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
-The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
+The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
 Record the wait → end turn → wait for the answer:
 Record the reply before anything else:
 **If** the answer is `Try again` **and** `LOOP_LIMIT` = true → give soak one more full allowance, clear `LOOP_LIMIT` → return to the calling step:
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index 91d19bbe2..bd6df812a 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -351,3 +351,4 @@
 {"schema":3,"ts":1794620219191,"firstTs":1794620219191,"updates":1,"kind":"failure","key":"audit-dependencies-cross-spawn-the-first-runtime-dependency-has-had","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit:dependencies"},"references":["docs/audits/202611/dependencies.md","dependencies-5","bcd1b8fc3fae7ec6e8f61fcd39ac0bd67802e1cc"],"summary":"cross-spawn, the first runtime dependency, has had no release for 726 days and has no recorded decision","severity":"MEDIUM","description":"cross-spawn, the first runtime dependency, has had no release for 726 days and has no recorded decision (package.json:246); audit dependencies finding dependencies-5","status":"OPEN"}
 {"schema":3,"ts":1794620219192,"firstTs":1794620219192,"updates":1,"kind":"failure","key":"audit-dependencies-release-age-check-never-clears-for-updates-with-","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit:dependencies"},"references":["docs/audits/202611/dependencies.md","dependencies-6","bcd1b8fc3fae7ec6e8f61fcd39ac0bd67802e1cc"],"summary":"Release-age check never clears for updates with no release timestamp (lock file maintenance #735, ubuntu digest #898)","severity":"LOW","description":"Release-age check never clears for updates with no release timestamp (lock file maintenance #735, ubuntu digest #898) (.github/renovate.json5:75); audit dependencies finding dependencies-6","status":"OPEN"}
 {"schema":3,"ts":1794620219193,"firstTs":1794620219193,"updates":1,"kind":"failure","key":"audit-dependencies-trivy-0-76-2-is-detected-on-the-dashboard-but-ne","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit:dependencies"},"references":["docs/audits/202611/dependencies.md","dependencies-7","bcd1b8fc3fae7ec6e8f61fcd39ac0bd67802e1cc"],"summary":"Trivy 0.76.2 is detected on the dashboard but never reaches a PR","severity":"LOW","description":"Trivy 0.76.2 is detected on the dashboard but never reaches a PR (.github/workflows/bkit-trivy.yml:64); audit dependencies finding dependencies-7","status":"OPEN"}
+{"schema":3,"ts":1794654675254,"firstTs":1793715051563,"updates":3,"kind":"failure","key":".bkit/core/engine/commands/land.test.ts pushToDev > dev moved before every push: exhausted, nothing landed","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":[".bkit/core/engine/commands/land.test.ts"],"summary":"git worktree unlock timed out under machine load in the 895 group-2 gate; passes alone","severity":"MEDIUM","status":"OPEN","description":"Failed once in bkit:gate:static-unit (spawnSync git ETIMEDOUT at dropLandTree, land.ts:90) while another worktree held the machine busy; the file passes 45/45 on a solo rerun with no code change."}
