diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 056c092d6..effb6ac67 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -1142,6 +1142,57 @@ describe("bkit decisions check", () => {
     expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1 \u2013");
   });
 
+  it("refuses a question whose bold closes before the colon, naming the line", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
+    fs.writeFileSync(
+      file,
+      fs.readFileSync(file, "utf-8").replace("[src/a.ts:10]:**", "[src/a.ts:10]**:"),
+    );
+    expect(fs.readFileSync(file, "utf-8")).toContain("**Q1 \u2014 Task 3 [src/a.ts:10]**: MEDIUM");
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1 \u2014 Task 3 [src/a.ts:10]**:");
+  });
+
+  it("refuses a question line behind a list marker on a loop pause, naming the line", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Gap 1"], 2);
+    fs.writeFileSync(
+      file,
+      fs.readFileSync(file, "utf-8").replace("**Q2 \u2014 ", "- **Q2 \u2014 "),
+    );
+    countsRow(logs, file, {
+      title: "Verify",
+      question: "another fix round, or stop here?",
+      options: ["Try again", "Stop"],
+      recommended: "Stop",
+      reason: "no question is left to decide",
+    });
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("- **Q2 \u2014 Gap 1:**");
+  });
+
+  it("refuses a question written as **Question 2 on a loop pause, naming the line", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Gap 1"], 2);
+    fs.writeFileSync(
+      file,
+      fs.readFileSync(file, "utf-8").replace("**Q2 \u2014 ", "**Question 2 \u2014 "),
+    );
+    countsRow(logs, file, {
+      title: "Verify",
+      question: "another fix round, or stop here?",
+      options: ["Try again", "Stop"],
+      recommended: "Stop",
+      reason: "no question is left to decide",
+    });
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("**Question 2 \u2014 Gap 1:**");
+  });
+
   it("accepts a correctly written question numbered Q10", async () => {
     const { root, logs } = checkout();
     const items = Array.from({ length: 10 }, (_, i) => `Task ${i + 3} [src/a.ts:${i + 1}]`);
@@ -2046,6 +2097,26 @@ describe("bkit decisions apply --by=headless", () => {
   });
 });
 
+describe("bkit decisions apply --by=headless", () => {
+  it("exits 6 on a loop pause whose own questions decisions check refuses", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Gap 1"], 2);
+    fs.writeFileSync(out, fs.readFileSync(out, "utf-8").replace("**Q2 \u2014 ", "**Q2 \u2013 "));
+    countsRow(logs, out, {
+      title: "Verify",
+      question: "decide the items below instead of another round?",
+      options: ["Try again", "Decide"],
+      recommended: "Decide",
+      reason: "another round is unlikely to help",
+    });
+    process.env.BKIT_RUNTIME = "LOCAL";
+    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q2 \u2013");
+    expect(statusRows(out).filter((x) => x.type === "decision-answer")).toEqual([]);
+  });
+});
+
 describe("bkit decisions answers", () => {
   const answerLine = (root: string, file: string, q: number, answer: string, extra: object) => ({
     type: "decision-answer",
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index ed7295b63..64bfa7c17 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -41,8 +41,8 @@ import {
   decisionFileHeader,
   decisionItems,
   decisionRows,
-  ITEM_SPLIT,
-  decisionHeader,
+  itemProblem,
+  pauseProblem,
   letterAt,
   pauseStatus,
   parseDecisionItems,
@@ -146,65 +146,6 @@ export const EXIT_BAD_DECISION = 6;
 const readIf = (file: string): string | null =>
   fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
 
-/**
- * The first item rule a decision file breaks, naming the question, or null. Each question needs
- * lettered options in order (`A) {name} — {effect}`), a `Recommended:` line that names one of
- * them (or `none` for a hard blocker) and a `Default if unanswered:` line; no number repeats; and
- * `Q1` is the engine's when the `decision-counts` row holds the loop question.
- */
-export function itemProblem(text: string, loop: { options: string[] } | null): string | null {
-  const seen = new Set<number>();
-  const engineHasLoop = loop !== null;
-  for (const name of ["Status", "Source changed", "Gate"]) {
-    if (name in decisionHeader(text))
-      return `the header holds a "${name}:" line; the engine writes it as a row, so delete it`;
-  }
-  const stray = /^(?:\*\*Q\d+(?!\d| — )|#+[ \t]*Q\d+\b).*$/m.exec(text);
-  if (stray !== null)
-    return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}"; write an em dash (—) after the number`;
-  if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
-    return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the `decision-counts` row holds no loop question)';
-  if (engineHasLoop) {
-    // The loop question was built for the question count `decisions counts` saw.
-    const own = text.split(ITEM_SPLIT).length - 1;
-    const offersStop = loop.options.includes("Stop");
-    const offersDecide = loop.options.includes("Decide");
-    if ((own > 0 && offersStop) || (own === 0 && offersDecide))
-      return "the `decision-counts` row's loop question was built for a different question count; re-run `decisions counts` with the same flags, then check again";
-  }
-  for (const part of text.split(ITEM_SPLIT).slice(1)) {
-    const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
-    const q = `Q${n}`;
-    if (seen.has(n)) return `${q} appears twice; number each question once`;
-    seen.add(n);
-    if (n === 1 && engineHasLoop)
-      return "Q1 is the loop question the `decision-counts` row holds; number your questions from Q2";
-    const answerLine = /^(Decision|Fix task|Rejected|Deferred):/m.exec(part);
-    if (answerLine !== null)
-      return `${q} holds a "${answerLine[1]}:" line; answers are rows the engine writes (\`decisions apply\`), so delete it`;
-    const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
-    if (optionLines.length === 0)
-      return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
-    for (const [i, m] of optionLines.entries()) {
-      if (m[1] !== letterAt(i))
-        return `${q}: option letters must run A, B, C in order; found ${m[1]}) where ${letterAt(i)}) belongs`;
-      const [name, ...effect] = (m[2] ?? "").split(" — ");
-      if ((name ?? "").trim() === "" || effect.join(" — ").trim() === "")
-        return `${q}: option ${m[1]} needs a name and an effect: "${m[1]}) {name} — {what happens}"`;
-    }
-    const rec = /^Recommended:[ \t]*(.+?)[ \t]*$/m.exec(part)?.[1];
-    if (rec === undefined)
-      return `${q} has no Recommended: line; write "Recommended: A) {name} — {reason}" or "Recommended: none — {why}"`;
-    const names = optionLines.map((m) => (m[2] ?? "").split(" — ")[0]!.trim());
-    const recName = (rec.split(" — ")[0] ?? "").replace(/^[A-Z]\)[ \t]*/, "").trim();
-    if (!/^none\b/i.test(recName) && !names.includes(recName))
-      return `${q}: the recommended option "${recName}" is not one of its options`;
-    if (!/^Default if unanswered:[ \t]*\S/m.test(part))
-      return `${q} has no Default if unanswered: line`;
-  }
-  return null;
-}
-
 /** The effect a bare fixed option name gets. */
 const FIXED_EFFECTS: Record<string, string> = {
   "Try again": "one more fix round runs",
@@ -648,6 +589,19 @@ export const decisionsCommand: CommandSpec = {
             ctx.log(problem);
             return EXIT_BAD_DECISION;
           }
+          const refused = pauseProblem(readIf, file);
+          if (refused !== null) {
+            ctx.emit({
+              status: "OPEN",
+              applied: [],
+              hardBlockers: [],
+              loop: null,
+              fixNow: [],
+              problem: refused,
+            });
+            ctx.log(`${path.basename(file)}: ${refused}`);
+            return EXIT_BAD_DECISION;
+          }
           const runtime = classifyAt(ctx.cwd);
           const r = applyRecommendations(
             pause.items,
diff --git a/.bkit/core/engine/commands/workflow/open-decision.test.ts b/.bkit/core/engine/commands/workflow/open-decision.test.ts
index 315010db5..5a717ce63 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.test.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.test.ts
@@ -392,6 +392,16 @@ describe("decision rows", () => {
     expect(openDecision(logDir, tree, "build", 1)).toMatchObject({ status: "OPEN", questions: 0 });
   });
 
+  it("a loop pause whose questions decisions check refuses resumes to Decision Pause step 2, not a gate re-run", () => {
+    const refused = orchestratorFile({ from: "verify" }).replace("**Q2 — ", "**Q2 \u2013 ");
+    expect(refused).toContain("**Q2 \u2013 Task 3");
+    const { tree, logDir, read, rel } = rowDir(refused, [countsRow()]);
+    const open = openDecision(logDir, tree, "build", 1);
+    expect(open).toMatchObject({ from: "verify", gate: "FAIL", status: "OPEN" });
+    expect(open?.questions).toBe(0);
+    expect(gateRerun(open, read, rel)).toEqual({ gateRerun: false, rerunFrom: null });
+  });
+
   it("a decision file with no readable question reads OPEN with questions 0", () => {
     expect(statusOf([])).toBe("OPEN");
     const empty = ["Question: CHALLENGE", "From: verify", "Group: 1", ""].join("\n");
diff --git a/.bkit/core/engine/commands/workflow/open-decision.ts b/.bkit/core/engine/commands/workflow/open-decision.ts
index e457d890f..98e5aa2a1 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.ts
@@ -303,6 +303,87 @@ export function undecidedBesidesLoop(
   return { hasLoop, undecided };
 }
 
+/**
+ * The first item rule a decision file breaks, naming the question, or null. Each question needs
+ * lettered options in order (`A) {name} — {effect}`), a `Recommended:` line that names one of
+ * them (or `none` for a hard blocker) and a `Default if unanswered:` line; no number repeats; and
+ * `Q1` is the engine's when the `decision-counts` row holds the loop question.
+ */
+export function itemProblem(
+  text: string,
+  loop: { options: string[] } | null,
+  checkCount = true,
+): string | null {
+  const seen = new Set<number>();
+  const engineHasLoop = loop !== null;
+  for (const name of ["Status", "Source changed", "Gate"]) {
+    if (name in decisionHeader(text))
+      return `the header holds a "${name}:" line; the engine writes it as a row, so delete it`;
+  }
+  const stray =
+    /^(?:\*\*Q\d+(?!\d| — )|#+[ \t]*Q\d+\b|[ \t]*(?:[-*+]|\d+[.)])[ \t]+\*\*Q(?:uestion[ \t]*)?\d+|\*\*Question[ \t]*\d+).*$/m.exec(
+      text,
+    );
+  if (stray !== null)
+    return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}" at the start of a line; write an em dash (—) after the number, no list marker, close the bold after the colon`;
+  if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
+    return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the `decision-counts` row holds no loop question)';
+  if (engineHasLoop && checkCount) {
+    // The loop question was built for the question count `decisions counts` saw.
+    const own = text.split(ITEM_SPLIT).length - 1;
+    const offersStop = loop.options.includes("Stop");
+    const offersDecide = loop.options.includes("Decide");
+    if ((own > 0 && offersStop) || (own === 0 && offersDecide))
+      return "the `decision-counts` row's loop question was built for a different question count; re-run `decisions counts` with the same flags, then check again";
+  }
+  for (const part of text.split(ITEM_SPLIT).slice(1)) {
+    const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
+    const headLine = part.split("\n", 1)[0] ?? "";
+    if (!/^\*\*Q\d+ — .+?:\*\*/.test(headLine))
+      return `"${headLine.slice(0, 60)}" is not "**Q{n} — {title}:** {question}"; close the bold after the colon (\`:**\`)`;
+    const q = `Q${n}`;
+    if (seen.has(n)) return `${q} appears twice; number each question once`;
+    seen.add(n);
+    if (n === 1 && engineHasLoop)
+      return "Q1 is the loop question the `decision-counts` row holds; number your questions from Q2";
+    const answerLine = /^(Decision|Fix task|Rejected|Deferred):/m.exec(part);
+    if (answerLine !== null)
+      return `${q} holds a "${answerLine[1]}:" line; answers are rows the engine writes (\`decisions apply\`), so delete it`;
+    const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
+    if (optionLines.length === 0)
+      return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
+    for (const [i, m] of optionLines.entries()) {
+      if (m[1] !== letterAt(i))
+        return `${q}: option letters must run A, B, C in order; found ${m[1]}) where ${letterAt(i)}) belongs`;
+      const [name, ...effect] = (m[2] ?? "").split(" — ");
+      if ((name ?? "").trim() === "" || effect.join(" — ").trim() === "")
+        return `${q}: option ${m[1]} needs a name and an effect: "${m[1]}) {name} — {what happens}"`;
+    }
+    const rec = /^Recommended:[ \t]*(.+?)[ \t]*$/m.exec(part)?.[1];
+    if (rec === undefined)
+      return `${q} has no Recommended: line; write "Recommended: A) {name} — {reason}" or "Recommended: none — {why}"`;
+    const names = optionLines.map((m) => (m[2] ?? "").split(" — ")[0]!.trim());
+    const recName = (rec.split(" — ")[0] ?? "").replace(/^[A-Z]\)[ \t]*/, "").trim();
+    if (!/^none\b/i.test(recName) && !names.includes(recName))
+      return `${q}: the recommended option "${recName}" is not one of its options`;
+    if (!/^Default if unanswered:[ \t]*\S/m.test(part))
+      return `${q} has no Default if unanswered: line`;
+  }
+  return null;
+}
+
+/**
+ * The item problem of a loop pause: the `decision-counts` row holds a loop question and the
+ * orchestrator's file breaks an item rule. Null when the pause has no counts row or no loop.
+ */
+export function pauseProblem(read: ReadText, rel: string): string | null {
+  const counts = decisionRows(read, rel)
+    .filter((r) => r.type === "decision-counts")
+    .at(-1) as DecisionCountsRow | undefined;
+  if (counts?.loop === undefined) return null;
+  return itemProblem(read(rel) ?? "", counts.loop, false);
+}
+
 /** The checks a red-gate pause re-runs, by the decision file's `From` header. */
 export const RERUN_FROM = ["verify", "holistic", "tests"] as const;
 export type RerunFrom = (typeof RERUN_FROM)[number];
@@ -320,6 +401,7 @@ export function gateRerun(
   const from = RERUN_FROM.find((f) => f === open?.from);
   const { hasLoop, undecided } = undecidedBesidesLoop(source, rel);
   const rerun =
+    pauseProblem(sourceOf(source, rel).read, sourceOf(source, rel).rel) === null &&
     open?.gate === "FAIL" &&
     open.status === "OPEN" &&
     from !== undefined &&
@@ -427,7 +509,7 @@ export function openDecision(
       gate: header.Gate ?? null,
       sourceChanged: header["Source changed"] ?? null,
       status,
-      questions: items.length,
+      questions: pauseProblem(read, rel) === null ? items.length : 0,
     };
   }
   return null;
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 655606c79..1a6cef9cc 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -1111,6 +1111,37 @@ describe("bkit workflows fail", () => {
     }
   });
 
+  it("redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files", async () => {
+    const cwd = repo();
+    const dump = ["eyJfakeRuntime", "MintedJwt", "Value.abc123"].join("");
+    const jsonDump = ["eyJfakeJson", "BearerJwt", "Value.def456"].join("");
+    const body = [
+      `AxiosError: Request failed { headers: { Authorization: 'Bearer ${dump}' } }`,
+      `{"Authorization":"Bearer ${jsonDump}"}`,
+      "",
+    ].join("\n");
+    write(cwd, "tmp/error.md", body);
+    write(cwd, "tmp/stderr.md", body);
+    const r = await run(
+      cwd,
+      wf(
+        "fail",
+        "build",
+        "--step-number=14",
+        "--step-title=Run Tests",
+        "--error-file=tmp/error.md",
+        "--stderr-file=tmp/stderr.md",
+      ),
+    );
+    expect(r.code).toBe(0);
+    for (const f of ["tmp/error.md", "tmp/stderr.md"]) {
+      const text = fs.readFileSync(path.join(cwd, f), "utf8");
+      expect(text, f).not.toContain(dump);
+      expect(text, f).not.toContain(jsonDump);
+      expect(text, f).toContain("<redacted>");
+    }
+  });
+
   it("writes the stderr file with the checkout path made relative and the home directory as ~", async () => {
     const cwd = repo();
     const home = os.homedir();
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 3af9044a8..4fd65b18f 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -360,7 +360,7 @@ const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]*:[^\s/@]+@/i;
 /** Token-shaped values scrubbed whatever the environment holds. */
 const TOKEN_SHAPES: Array<[RegExp, string]> = [
   [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "<redacted>"],
-  [/(Authorization:\s*(?:Bearer|Basic)\s+)[^\s"']+/gi, "$1<redacted>"],
+  [/(Authorization["']?\s*:\s*["']?(?:Bearer|Basic)\s+)[^\s"']+/gi, "$1<redacted>"],
   [/\b((?:access_)?token=)(?!<)[^\s&"']+/gi, "$1<redacted>"],
   [/\b(?:gh[pos]_|github_pat_|glpat-|xox[abpr]-|sk-|AKIA)[A-Za-z0-9_-]{8,}/g, "<redacted>"],
 ];
diff --git a/DETAILS.md b/DETAILS.md
index b88329dc1..207d74c55 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1977 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>1978 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index aa77ccd17..da218a24d 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -35,7 +35,7 @@ import { CommandError, EXIT, git } from "../lib.js";
 import { loopProgress } from "./counters.js";
 import { appendLedgerRows, monthAndFid } from "./ledgers.js";
 import { LOOPS, loopGateStep } from "./loops.js";
-import { decisionFileHeader, decisionItems, decisionRows, ITEM_SPLIT, decisionHeader, letterAt, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
+import { decisionFileHeader, decisionItems, decisionRows, itemProblem, pauseProblem, letterAt, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
 import { classifyAt } from "./runtime.js";
 import { positiveInt, str } from "./status.js";
 /** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
@@ -110,65 +110,6 @@ function readBaseCheck(file) {
 export const EXIT_BAD_DECISION = 6;
 /** A decision file's text, or null when the path is missing. */
 const readIf = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
-/**
- * The first item rule a decision file breaks, naming the question, or null. Each question needs
- * lettered options in order (`A) {name} — {effect}`), a `Recommended:` line that names one of
- * them (or `none` for a hard blocker) and a `Default if unanswered:` line; no number repeats; and
- * `Q1` is the engine's when the `decision-counts` row holds the loop question.
- */
-export function itemProblem(text, loop) {
-    const seen = new Set();
-    const engineHasLoop = loop !== null;
-    for (const name of ["Status", "Source changed", "Gate"]) {
-        if (name in decisionHeader(text))
-            return `the header holds a "${name}:" line; the engine writes it as a row, so delete it`;
-    }
-    const stray = /^(?:\*\*Q\d+(?!\d| — )|#+[ \t]*Q\d+\b).*$/m.exec(text);
-    if (stray !== null)
-        return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}"; write an em dash (—) after the number`;
-    if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
-        return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the `decision-counts` row holds no loop question)';
-    if (engineHasLoop) {
-        // The loop question was built for the question count `decisions counts` saw.
-        const own = text.split(ITEM_SPLIT).length - 1;
-        const offersStop = loop.options.includes("Stop");
-        const offersDecide = loop.options.includes("Decide");
-        if ((own > 0 && offersStop) || (own === 0 && offersDecide))
-            return "the `decision-counts` row's loop question was built for a different question count; re-run `decisions counts` with the same flags, then check again";
-    }
-    for (const part of text.split(ITEM_SPLIT).slice(1)) {
-        const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
-        const q = `Q${n}`;
-        if (seen.has(n))
-            return `${q} appears twice; number each question once`;
-        seen.add(n);
-        if (n === 1 && engineHasLoop)
-            return "Q1 is the loop question the `decision-counts` row holds; number your questions from Q2";
-        const answerLine = /^(Decision|Fix task|Rejected|Deferred):/m.exec(part);
-        if (answerLine !== null)
-            return `${q} holds a "${answerLine[1]}:" line; answers are rows the engine writes (\`decisions apply\`), so delete it`;
-        const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
-        if (optionLines.length === 0)
-            return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
-        for (const [i, m] of optionLines.entries()) {
-            if (m[1] !== letterAt(i))
-                return `${q}: option letters must run A, B, C in order; found ${m[1]}) where ${letterAt(i)}) belongs`;
-            const [name, ...effect] = (m[2] ?? "").split(" — ");
-            if ((name ?? "").trim() === "" || effect.join(" — ").trim() === "")
-                return `${q}: option ${m[1]} needs a name and an effect: "${m[1]}) {name} — {what happens}"`;
-        }
-        const rec = /^Recommended:[ \t]*(.+?)[ \t]*$/m.exec(part)?.[1];
-        if (rec === undefined)
-            return `${q} has no Recommended: line; write "Recommended: A) {name} — {reason}" or "Recommended: none — {why}"`;
-        const names = optionLines.map((m) => (m[2] ?? "").split(" — ")[0].trim());
-        const recName = (rec.split(" — ")[0] ?? "").replace(/^[A-Z]\)[ \t]*/, "").trim();
-        if (!/^none\b/i.test(recName) && !names.includes(recName))
-            return `${q}: the recommended option "${recName}" is not one of its options`;
-        if (!/^Default if unanswered:[ \t]*\S/m.test(part))
-            return `${q} has no Default if unanswered: line`;
-    }
-    return null;
-}
 /** The effect a bare fixed option name gets. */
 const FIXED_EFFECTS = {
     "Try again": "one more fix round runs",
@@ -536,6 +477,19 @@ export const decisionsCommand = {
                         ctx.log(problem);
                         return EXIT_BAD_DECISION;
                     }
+                    const refused = pauseProblem(readIf, file);
+                    if (refused !== null) {
+                        ctx.emit({
+                            status: "OPEN",
+                            applied: [],
+                            hardBlockers: [],
+                            loop: null,
+                            fixNow: [],
+                            problem: refused,
+                        });
+                        ctx.log(`${path.basename(file)}: ${refused}`);
+                        return EXIT_BAD_DECISION;
+                    }
                     const runtime = classifyAt(ctx.cwd);
                     const r = applyRecommendations(pause.items, runtime, runtime === "GITHUB_ACTION" ? "headless" : "ask:false");
                     for (const d of r.decisions) {
diff --git a/dist/commands/workflow/open-decision.js b/dist/commands/workflow/open-decision.js
index 3b7d677d9..d7b0ed2b2 100644
--- a/dist/commands/workflow/open-decision.js
+++ b/dist/commands/workflow/open-decision.js
@@ -237,6 +237,80 @@ export function undecidedBesidesLoop(source, rel) {
         .map((i) => `Q${i.n}`);
     return { hasLoop, undecided };
 }
+/**
+ * The first item rule a decision file breaks, naming the question, or null. Each question needs
+ * lettered options in order (`A) {name} — {effect}`), a `Recommended:` line that names one of
+ * them (or `none` for a hard blocker) and a `Default if unanswered:` line; no number repeats; and
+ * `Q1` is the engine's when the `decision-counts` row holds the loop question.
+ */
+export function itemProblem(text, loop, checkCount = true) {
+    const seen = new Set();
+    const engineHasLoop = loop !== null;
+    for (const name of ["Status", "Source changed", "Gate"]) {
+        if (name in decisionHeader(text))
+            return `the header holds a "${name}:" line; the engine writes it as a row, so delete it`;
+    }
+    const stray = /^(?:\*\*Q\d+(?!\d| — )|#+[ \t]*Q\d+\b|[ \t]*(?:[-*+]|\d+[.)])[ \t]+\*\*Q(?:uestion[ \t]*)?\d+|\*\*Question[ \t]*\d+).*$/m.exec(text);
+    if (stray !== null)
+        return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}" at the start of a line; write an em dash (—) after the number, no list marker, close the bold after the colon`;
+    if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
+        return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the `decision-counts` row holds no loop question)';
+    if (engineHasLoop && checkCount) {
+        // The loop question was built for the question count `decisions counts` saw.
+        const own = text.split(ITEM_SPLIT).length - 1;
+        const offersStop = loop.options.includes("Stop");
+        const offersDecide = loop.options.includes("Decide");
+        if ((own > 0 && offersStop) || (own === 0 && offersDecide))
+            return "the `decision-counts` row's loop question was built for a different question count; re-run `decisions counts` with the same flags, then check again";
+    }
+    for (const part of text.split(ITEM_SPLIT).slice(1)) {
+        const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
+        const headLine = part.split("\n", 1)[0] ?? "";
+        if (!/^\*\*Q\d+ — .+?:\*\*/.test(headLine))
+            return `"${headLine.slice(0, 60)}" is not "**Q{n} — {title}:** {question}"; close the bold after the colon (\`:**\`)`;
+        const q = `Q${n}`;
+        if (seen.has(n))
+            return `${q} appears twice; number each question once`;
+        seen.add(n);
+        if (n === 1 && engineHasLoop)
+            return "Q1 is the loop question the `decision-counts` row holds; number your questions from Q2";
+        const answerLine = /^(Decision|Fix task|Rejected|Deferred):/m.exec(part);
+        if (answerLine !== null)
+            return `${q} holds a "${answerLine[1]}:" line; answers are rows the engine writes (\`decisions apply\`), so delete it`;
+        const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
+        if (optionLines.length === 0)
+            return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
+        for (const [i, m] of optionLines.entries()) {
+            if (m[1] !== letterAt(i))
+                return `${q}: option letters must run A, B, C in order; found ${m[1]}) where ${letterAt(i)}) belongs`;
+            const [name, ...effect] = (m[2] ?? "").split(" — ");
+            if ((name ?? "").trim() === "" || effect.join(" — ").trim() === "")
+                return `${q}: option ${m[1]} needs a name and an effect: "${m[1]}) {name} — {what happens}"`;
+        }
+        const rec = /^Recommended:[ \t]*(.+?)[ \t]*$/m.exec(part)?.[1];
+        if (rec === undefined)
+            return `${q} has no Recommended: line; write "Recommended: A) {name} — {reason}" or "Recommended: none — {why}"`;
+        const names = optionLines.map((m) => (m[2] ?? "").split(" — ")[0].trim());
+        const recName = (rec.split(" — ")[0] ?? "").replace(/^[A-Z]\)[ \t]*/, "").trim();
+        if (!/^none\b/i.test(recName) && !names.includes(recName))
+            return `${q}: the recommended option "${recName}" is not one of its options`;
+        if (!/^Default if unanswered:[ \t]*\S/m.test(part))
+            return `${q} has no Default if unanswered: line`;
+    }
+    return null;
+}
+/**
+ * The item problem of a loop pause: the `decision-counts` row holds a loop question and the
+ * orchestrator's file breaks an item rule. Null when the pause has no counts row or no loop.
+ */
+export function pauseProblem(read, rel) {
+    const counts = decisionRows(read, rel)
+        .filter((r) => r.type === "decision-counts")
+        .at(-1);
+    if (counts?.loop === undefined)
+        return null;
+    return itemProblem(read(rel) ?? "", counts.loop, false);
+}
 /** The checks a red-gate pause re-runs, by the decision file's `From` header. */
 export const RERUN_FROM = ["verify", "holistic", "tests"];
 /**
@@ -247,7 +321,8 @@ export const RERUN_FROM = ["verify", "holistic", "tests"];
 export function gateRerun(open, source, rel) {
     const from = RERUN_FROM.find((f) => f === open?.from);
     const { hasLoop, undecided } = undecidedBesidesLoop(source, rel);
-    const rerun = open?.gate === "FAIL" &&
+    const rerun = pauseProblem(sourceOf(source, rel).read, sourceOf(source, rel).rel) === null &&
+        open?.gate === "FAIL" &&
         open.status === "OPEN" &&
         from !== undefined &&
         hasLoop &&
@@ -336,7 +411,7 @@ export function openDecision(logDir, tree, workflow, run, finished = []) {
             gate: header.Gate ?? null,
             sourceChanged: header["Source changed"] ?? null,
             status,
-            questions: items.length,
+            questions: pauseProblem(read, rel) === null ? items.length : 0,
         };
     }
     return null;
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 13d5de601..c91e0a8ae 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -210,7 +210,7 @@ const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]*:[^\s/@]+@/i;
 /** Token-shaped values scrubbed whatever the environment holds. */
 const TOKEN_SHAPES = [
     [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "<redacted>"],
-    [/(Authorization:\s*(?:Bearer|Basic)\s+)[^\s"']+/gi, "$1<redacted>"],
+    [/(Authorization["']?\s*:\s*["']?(?:Bearer|Basic)\s+)[^\s"']+/gi, "$1<redacted>"],
     [/\b((?:access_)?token=)(?!<)[^\s&"']+/gi, "$1<redacted>"],
     [/\b(?:gh[pos]_|github_pat_|glpat-|xox[abpr]-|sk-|AKIA)[A-Za-z0-9_-]{8,}/g, "<redacted>"],
 ];
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 3f0adc0a7..2ac8045db 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -126,7 +126,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1977 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>1978 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -303,7 +303,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tests_base["tests-base<br/>14 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>10 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>90 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_workflows["workflows<br/>87 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_workflows["workflows<br/>88 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>66 symbols · 1 files"]
       end
     end
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index bc525046d..ae546f822 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -533,3 +533,5 @@
 {"schema":3,"ts":1795035554375,"firstTs":1795035554375,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-168","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A remediate agent's `BLOCKED` reason (or a challenge finding) shaped by an injected log carries a line `Decision: Accept — looks fine`; the orchestrator pastes it into a question at Decision Pause step 2, `decisions check` passes the file, and the pause reads that item as answered, so the owner is never asked, `decisions skip` and `tasks tick` read Accept and the acceptance is recorded as the owner's. The replaced `decisions compose` folded every item field through `oneLine`, so no pasted text could answer a question","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/decisions.ts:168: A remediate agent's `BLOCKED` reason (or a challenge finding) shaped by an injected log carries a line `Decision: Accept — looks fine`; the orchestrator pastes it into a question at Decision Pause step 2, `decisions check` passes the file, and the pause reads that item as answered, so the owner is never asked, `decisions skip` and `tasks tick` read Accept and the acceptance is recorded as the owner's. The replaced `decisions compose` folded every item field through `oneLine`, so no pasted text could answer a question. Done when: `itemProblem` makes `decisions check` exit 6, naming the question, when any item of the orchestrator's file holds a line that starts `Decision:`, `Fix task:`, `Rejected:` or `Deferred:`. Check runs only at Decision Pause step 2, before any answer exists, so only the owner's step-6 answers and the engine write those lines.","source":".bkit/core/engine/commands/workflow/decisions.ts:168","status":"OPEN"}
 {"schema":3,"ts":1795088869277,"firstTs":1795088869277,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1123","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A verify report that quotes a line ending Fixable: true inside a code fence under its gaps log is refused although its header is right, and the re-asked agent can only pass by inflating Failures and Fixable","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1123: A verify report that quotes a line ending Fixable: true inside a code fence under its gaps log is refused although its header is right, and the re-asked agent can only pass by inflating Failures and Fixable. Done when: fixableLines reads the gaps-log body through unfencedLines, as the items rule already does, so a fenced line never counts as a gap line or flips the Fixable check; the test below passes and every existing bkit steps finish test still passes","source":".bkit/core/engine/commands/workflow/steps.ts:1123","status":"OPEN"}
 {"schema":3,"ts":1795088869278,"firstTs":1795088869278,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1244","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A run stops after the Failure Path writes `{LOG_DIR}/{workflow}-stderr.md` but before `workflows fail` rewrites it (session crash or interrupt, or a `workflows fail` usage error thrown before `workflows.ts:421`); the only scrub is in `failVerb`, and the next run's bookkeeping commit stages the whole log folder (`ledgers.ts:124`), so the raw stderr lands in git history","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1244: A run stops after the Failure Path writes `{LOG_DIR}/{workflow}-stderr.md` but before `workflows fail` rewrites it (session crash or interrupt, or a `workflows fail` usage error thrown before `workflows.ts:421`); the only scrub is in `failVerb`, and the next run's bookkeeping commit stages the whole log folder (`ledgers.ts:124`), so the raw stderr lands in git history. Done when: `commitBookkeeping` scrubs every `*-error.md` and `*-stderr.md` in the run's log folder with the same `scrubSecrets` rules before it stages them (the scrubber moves to a module both `workflows.ts` and `ledgers.ts` import), so no engine commit carries an unscrubbed failure file.","source":".bkit/core/engine/commands/workflow/ledgers.ts:1244","status":"OPEN"}
+{"schema":3,"ts":1795092207152,"firstTs":1795092207152,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-364","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A failed e2e test prints an OAuth callback URL carrying `refresh_token=` / `id_token=`, or a tool prints a `ghu_` / `ghr_` GitHub token, a Stripe `sk_live_` / `rk_live_` key, an `ASIA` AWS session key id, an `AIza` Google key or an `npm_` token that no env var holds; the `token=` rule anchors `\\b` before `token`, so `refresh_token=` and `id_token=` never match, and the prefix list stops at `gh[pos]_` and `sk-`, so each value lands raw in the committed failure files on a repo without push protection, and the refresh token gets past push protection too","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:364: A failed e2e test prints an OAuth callback URL carrying `refresh_token=` / `id_token=`, or a tool prints a `ghu_` / `ghr_` GitHub token, a Stripe `sk_live_` / `rk_live_` key, an `ASIA` AWS session key id, an `AIza` Google key or an `npm_` token that no env var holds; the `token=` rule anchors `\\b` before `token`, so `refresh_token=` and `id_token=` never match, and the prefix list stops at `gh[pos]_` and `sk-`, so each value lands raw in the committed failure files on a repo without push protection, and the refresh token gets past push protection too. Done when: `scrubSecrets` redacts the value of any `*_token=` query or fragment parameter (`refresh_token`, `id_token`, `access_token`, `token`) and values with the prefixes `ghu_`, `ghr_`, `sk_live_`, `rk_live_`, `ASIA`, `AIza` and `npm_`, whatever the env holds, in both failure files; the Task 48 prefixes still pass.","source":".bkit/core/engine/commands/workflow/workflows.ts:364","status":"OPEN"}
+{"schema":3,"ts":1795092207154,"firstTs":1795092207154,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-362","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A failed command's stderr ends with a private key longer than 20 lines; the Failure Path tells the orchestrator to write only the last 20 lines, so the `-----BEGIN … PRIVATE KEY-----` line is cut before the engine sees the file, the PEM rule needs both BEGIN and END, and up to 19 base64 lines of key material land raw in the committed `{LOG_DIR}/{workflow}-stderr.md`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:362: A failed command's stderr ends with a private key longer than 20 lines; the Failure Path tells the orchestrator to write only the last 20 lines, so the `-----BEGIN … PRIVATE KEY-----` line is cut before the engine sees the file, the PEM rule needs both BEGIN and END, and up to 19 base64 lines of key material land raw in the committed `{LOG_DIR}/{workflow}-stderr.md`. Done when: `scrubSecrets` also redacts the key body that runs up to an `-----END … PRIVATE KEY-----` line with no matching BEGIN line in the file (from the file start, or from the run of base64 lines right before the END line), so a stderr file that holds only the tail of a key keeps none of its body; a full BEGIN…END block is still redacted whole.","source":".bkit/core/engine/commands/workflow/workflows.ts:362","status":"OPEN"}
