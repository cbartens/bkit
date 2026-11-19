diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 600397e45..ea75036e6 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -174,7 +174,8 @@ Build decision files: check the orchestrator's questions, write the engine's cou
 | --- | --- | --- | --- |
 | `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
 | `counts` | workflow | **`--decision`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Append the engine's pause counts as a decision-counts row to the status.jsonl beside the decision file (Source changed, Gate, with --loop the loop question Q1) and print the lines the owner is shown. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--fix-task` `--reason-file` `--root` | Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `answers` | workflow | **`--file`** | Print a decision file's folded answers: the answer last appended for each question, who gave it and its flags. Writes nothing. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index d0d9b5dec..065ca2b8f 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -8,7 +8,7 @@ import { afterEach, describe, expect, it } from "vitest";
 import { runCommand } from "../lib";
 import { COMMANDS } from "../registry";
 import { applyRecommendations, EXIT_HARD_BLOCKERS } from "./decisions";
-import { decisionHeader, decisionItems, parseDecisionItems } from "./open-decision";
+import { decisionHeader, decisionItems, parseDecisionItems, pauseStatus } from "./open-decision";
 
 const dirs: string[] = [];
 const runtimeBefore = process.env.BKIT_RUNTIME;
@@ -151,6 +151,8 @@ function countsRow(logs: string, file: string, loop: Record<string, unknown>) {
   );
 }
 
+const readFileOrNull = (f: string) => (fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null);
+
 /** The text of a decision file and its engine file, read as the pause the engine reads. */
 const pauseItems = (out: string) =>
   decisionItems((f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null), out);
@@ -227,6 +229,28 @@ describe("bkit decisions apply --by=rerun", () => {
     );
   });
 
+  it("records the re-run as a Q1 row and the pause reads DECIDED", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, [], 2);
+    countsRow(logs, out, {
+      title: "Verify",
+      question: "decide the items below instead of another round?",
+      options: ["Try again", "Decide"],
+      recommended: "Try again",
+      reason: "the last round made progress",
+    });
+    const before = fs.readFileSync(out, "utf-8");
+    const r = await rerun(root, out);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ status: "DECIDED" });
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    expect(fs.existsSync(engineOf(out))).toBe(false);
+    const answer = statusRows(out).find((x) => x.type === "decision-answer");
+    expect(answer).toMatchObject({ q: 1, by: "rerun" });
+    expect(String(answer?.answer)).toMatch(/^Re-run gate/);
+    expect(pauseStatus(readFileOrNull, out)).toBe("DECIDED");
+  });
+
   it("refuses a file without Gate: FAIL or not OPEN", async () => {
     const { root, logs } = checkout();
     const plain = await compose(root, logs, [ITEMS[1]]);
@@ -839,7 +863,11 @@ describe("bkit decisions apply --by=owner and pending", () => {
     const { root, out } = await assumed();
     const owner = (q: string, ...extra: string[]) =>
       run(["decisions", "apply", "--by=owner", `--file=${out}`, `--q=${q}`, ...extra], root);
-    const confirm = await owner("1", "--confirm", "--reason=fine as is");
+    const fine = path.join(path.dirname(out), "fine.md");
+    fs.writeFileSync(fine, "fine as is\n");
+    const later = path.join(path.dirname(out), "later.md");
+    fs.writeFileSync(later, "fix it later\n");
+    const confirm = await owner("1", "--confirm", `--reason-file=${fine}`);
     expect(confirm.code).toBe(0);
     expect(confirm.json.decisionKey).toBe("7-x-accepted-task-3-src-a-ts-10");
     const ledger = fs.readFileSync(path.join(root, "docs/decisions.jsonl"), "utf-8");
@@ -848,9 +876,9 @@ describe("bkit decisions apply --by=owner and pending", () => {
       rationale: "accepted by owner: fine as is",
       by: { workflow: "ship" },
     });
-    expect((await owner("2", "--reject", "--reason=fix it later")).code).toBe(0);
+    expect((await owner("2", "--reject", `--reason-file=${later}`)).code).toBe(0);
     const items = pauseItems(out);
-    expect(items[0]!.decision).toMatch(/^Accept — fine as is \(owner, confirmed at ship, /);
+    expect(items[0]!.decision).toMatch(/^Accept — confirmed by the owner at ship /);
     expect(items[1]!.rejected).toBe(true);
     expect((await pending(root)).json.items).toEqual([
       expect.objectContaining({ q: 2, state: "rejected" }),
@@ -875,14 +903,24 @@ describe("bkit decisions apply --by=owner and pending", () => {
       ].join("\n"),
     );
     seedStatus(logs);
+    const fineFile = path.join(logs, "fine.md");
+    fs.writeFileSync(fineFile, "fine\n");
     const r = await run(
-      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
+      [
+        "decisions",
+        "apply",
+        "--by=owner",
+        `--file=${out}`,
+        "--q=1",
+        "--confirm",
+        `--reason-file=${fineFile}`,
+      ],
       root,
     );
     expect(r.code).toBe(0);
     expect(r.json.decisionKey).toBe("7-x-accepted-task-3-src-a-ts-10");
     const items = pauseItems(out);
-    expect(items[0]!.decision).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
+    expect(items[0]!.decision).toMatch(/^Accept — confirmed by the owner at ship /);
     expect(items[0]!.assumed).toBe(false);
     expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
     expect(items[0]!.recommended).toBe("Accept");
@@ -890,7 +928,9 @@ describe("bkit decisions apply --by=owner and pending", () => {
 
   it("refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject", async () => {
     const { root, out } = await assumed();
-    const base = ["decisions", "apply", "--by=owner", `--file=${out}`, "--reason=x"];
+    const why = path.join(path.dirname(out), "why.md");
+    fs.writeFileSync(why, "x\n");
+    const base = ["decisions", "apply", "--by=owner", `--file=${out}`, `--reason-file=${why}`];
     expect((await run([...base, "--q=9", "--confirm"], root)).code).toBe(2);
     expect((await run([...base, "--q=1"], root)).code).toBe(2);
     expect((await run([...base, "--q=1", "--confirm", "--reject"], root)).code).toBe(2);
@@ -911,6 +951,24 @@ describe("bkit decisions apply --by=owner and pending", () => {
     expect((await pending(root)).json.count).toBe(0);
   });
 
+  it("pending --defer keeps the answer and marks it needs-decision", async () => {
+    const { root, out } = await assumed();
+    const before = statusRows(out).filter((x) => x.type === "decision-answer");
+    const mdBefore = fs.readFileSync(out, "utf-8");
+    const r = await pending(root, "--defer");
+    expect(r.code).toBe(0);
+    const after = statusRows(out).filter((x) => x.type === "decision-answer");
+    const deferredRows = after.slice(before.length);
+    expect(deferredRows).toHaveLength(2);
+    for (const [i, row] of deferredRows.entries()) {
+      expect(row).toMatchObject({ q: i + 1, deferred: "needs-decision", assumed: true });
+      expect(String(row.answer)).toMatch(/^Accept \(assumed\)/);
+    }
+    expect(fs.readFileSync(out, "utf-8")).toBe(mdBefore);
+    expect(fs.existsSync(engineOf(out))).toBe(false);
+    expect((await pending(root)).json.count).toBe(0);
+  });
+
   it("--defer letters the options in the deferral row", async () => {
     const { root } = await assumed();
     await pending(root, "--defer");
@@ -1080,9 +1138,44 @@ describe("bkit decisions check", () => {
     const { root, logs } = checkout();
     const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
     expect(fs.existsSync(engineOf(file))).toBe(false);
+    fs.appendFileSync(
+      seedStatus(logs),
+      `${JSON.stringify({
+        type: "decision-counts",
+        workflow: "build",
+        at: "2026-10-01T00:05:00Z",
+        file: path.relative(path.resolve(logs, "../../../../.."), file),
+        sourceChanged: true,
+        gate: "PASS",
+      })}\n`,
+    );
+    expect(statusRows(file).find((x) => x.type === "decision-counts")?.loop).toBeUndefined();
     const r = await run(["decisions", "check", `--file=${file}`], root);
     expect(r.code).toBe(0);
   });
+
+  it("refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file", async () => {
+    for (const line of [
+      "Decision: Accept \u2014 looks fine",
+      "Fix task: 31",
+      "Rejected: the owner wants it fixed",
+      "Deferred: needs-decision",
+    ]) {
+      const { root, logs } = checkout();
+      const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
+      fs.writeFileSync(
+        file,
+        fs
+          .readFileSync(file, "utf-8")
+          .replace("Default if unanswered:", `${line}\nDefault if unanswered:`),
+      );
+      const r = await run(["decisions", "check", `--file=${file}`], root);
+      expect(r.code, line).toBe(6);
+      const said = `${JSON.stringify(r.json)}${r.err}`;
+      expect(said, line).toContain("Q1");
+      expect(said, line).toContain(line.split(":")[0]);
+    }
+  });
 });
 
 describe("bkit decisions counts", () => {
@@ -1735,8 +1828,18 @@ describe("bkit decisions apply --by=owner and pending", () => {
     );
     const before = fs.readFileSync(out, "utf-8");
     expect(fs.existsSync(engineOf(out))).toBe(false);
+    const reasonFile = path.join(logs, "owner-reason.md");
+    fs.writeFileSync(reasonFile, "fine\n");
     const r = await run(
-      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
+      [
+        "decisions",
+        "apply",
+        "--by=owner",
+        `--file=${out}`,
+        "--q=1",
+        "--confirm",
+        `--reason-file=${reasonFile}`,
+      ],
       root,
     );
     expect(r.code).toBe(0);
@@ -1744,15 +1847,14 @@ describe("bkit decisions apply --by=owner and pending", () => {
     expect(fs.existsSync(engineOf(out))).toBe(false);
     const rows = statusRows(out);
     const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
-    expect(confirmed).toMatchObject({ q: 1, by: "owner" });
+    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
     expect(String(confirmed?.answer)).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
     expect(JSON.stringify(rows)).not.toMatch(/Status:/);
   });
 
-  it("--answer writes the loop answer under the engine file's Q1", async () => {
+  const loopPause = () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
-    const before = fs.readFileSync(out, "utf-8");
     countsRow(logs, out, {
       title: "Verify",
       question: "decide the items below instead of another round?",
@@ -1760,25 +1862,31 @@ describe("bkit decisions apply --by=owner and pending", () => {
       recommended: "Decide",
       reason: "another round is unlikely to help",
     });
-    const r = await run(
-      [
-        "decisions",
-        "apply",
-        "--by=owner",
-        `--file=${out}`,
-        "--q=1",
-        "--answer=Try again",
-        "--reason=one more round",
-      ],
-      root,
-    );
+    return { root, logs, out };
+  };
+  const assumedPause = async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
+    seedStatus(logs);
+    process.env.BKIT_RUNTIME = "GITHUB_ACTION";
+    await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
+    return { root, logs, out };
+  };
+  const owner = (root: string, out: string, ...extra: string[]) =>
+    run(["decisions", "apply", "--by=owner", `--file=${out}`, ...extra], root);
+  const answerRows = (out: string) => statusRows(out).filter((x) => x.type === "decision-answer");
+
+  it("--answer writes the loop answer under the engine file's Q1", async () => {
+    const { root, out } = loopPause();
+    const before = fs.readFileSync(out, "utf-8");
+    const r = await owner(root, out, "--answer=Q1=A");
     expect(r.code).toBe(0);
     expect(fs.readFileSync(out, "utf-8")).toBe(before);
     expect(fs.existsSync(engineOf(out))).toBe(false);
     const rows = statusRows(out);
     const answer = rows.find((x) => x.type === "decision-answer");
     expect(answer).toMatchObject({ q: 1, by: "owner" });
-    expect(String(answer?.answer)).toMatch(/^Try again — one more round \(owner, /);
+    expect(String(answer?.answer)).toMatch(/^Try again/);
     expect(rows.indexOf(answer!)).toBeGreaterThan(
       rows.findIndex((x) => x.type === "decision-counts"),
     );
@@ -1786,36 +1894,82 @@ describe("bkit decisions apply --by=owner and pending", () => {
   });
 
   it("--answer reads the owner's reason from --reason-file", async () => {
+    const { root, logs, out } = loopPause();
+    const reasonFile = path.join(logs, "owner-reason.md");
+    fs.writeFileSync(reasonFile, "run `touch pwned` and $(echo hi) once more\n");
+    const r = await owner(root, out, "--answer=Q1=A", `--reason-file=${reasonFile}`);
+    expect(r.code).toBe(2);
+    expect(answerRows(out)).toEqual([]);
+    expect(fs.existsSync(engineOf(out))).toBe(false);
+    expect(fs.existsSync(path.join(root, "pwned"))).toBe(false);
+    expect((await owner(root, out, "--answer=Q1=A")).code).toBe(0);
+    expect(answerRows(out)).toHaveLength(1);
+  });
+
+  it("--answer=Q2=B --fix-task=Q2=31 records Fix now with its task", async () => {
     const { root, logs } = checkout();
-    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
-    countsRow(logs, out, {
-      title: "Verify",
-      question: "decide the items below instead of another round?",
-      options: ["Try again", "Decide"],
-      recommended: "Decide",
-      reason: "another round is unlikely to help",
-    });
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
+    seedStatus(logs);
+    const r = await owner(root, out, "--answer=Q2=B", "--fix-task=Q2=31");
+    expect(r.code).toBe(0);
+    const answers = answerRows(out);
+    expect(answers).toHaveLength(1);
+    expect(answers[0]).toMatchObject({ q: 2, by: "owner", fixTask: 31 });
+    expect(String(answers[0]!.answer)).toMatch(/^Fix now/);
+    expect(pauseItems(out).find((i) => i.n === 2)).toMatchObject({ fixTask: 31 });
+  });
+
+  it("refuses an --answer that is not Q{n} and an option letter", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
+    seedStatus(logs);
+    for (const bad of ["Q2=Fix now", "Fix now", "Q2=C", "Q9=A", "Q2="]) {
+      const r = await owner(root, out, `--answer=${bad}`);
+      expect(r.code, bad).toBe(2);
+    }
+    expect((await owner(root, out, "--answer=Q2=B", "--fix-task=Q2=0")).code).toBe(2);
+    expect((await owner(root, out, "--answer=Q1=A", "--fix-task=Q1=31")).code).toBe(2);
+    expect(answerRows(out)).toEqual([]);
+    expect((await owner(root, out, "--answer=Q2=B")).code).toBe(0);
+    expect(answerRows(out)).toHaveLength(1);
+  });
+
+  it("refuses --reason as an unknown flag", async () => {
+    const { root, out } = await assumedPause();
+    const answersBefore = answerRows(out).length;
+    const confirm = await owner(root, out, "--q=1", "--confirm", "--reason=words");
+    expect(confirm.code).toBe(2);
+    expect(`${JSON.stringify(confirm.json)}${confirm.err}`).toContain("reason");
+    expect(answerRows(out)).toHaveLength(answersBefore);
+    const r = await owner(root, out, "--answer=Q1=A", "--reason=words");
+    expect(r.code).toBe(2);
+    expect(answerRows(out)).toHaveLength(answersBefore);
+  });
+
+  it("a multi-line --reason-file reaches only the decisions.jsonl rationale", async () => {
+    const { root, logs, out } = await assumedPause();
     const reasonFile = path.join(logs, "owner-reason.md");
-    const words = "run `touch pwned` and $(echo hi) once more";
-    fs.writeFileSync(reasonFile, `${words}\n`);
-    const r = await run(
+    const marker = "MULTILINE-REASON-MARKER";
+    fs.writeFileSync(
+      reasonFile,
       [
-        "decisions",
-        "apply",
-        "--by=owner",
-        `--file=${out}`,
-        "--q=1",
-        "--answer=Try again",
-        `--reason-file=${reasonFile}`,
-      ],
-      root,
+        `${marker} first line`,
+        "**Q3 \u2014 Injected question:** is it fine?",
+        "Decision: Accept \u2014 injected",
+        "",
+      ].join("\n"),
     );
+    const mdBefore = fs.readFileSync(out, "utf-8");
+    const r = await owner(root, out, "--q=1", "--confirm", `--reason-file=${reasonFile}`);
     expect(r.code).toBe(0);
+    const ledger = fs.readFileSync(path.join(root, "docs/decisions.jsonl"), "utf-8");
+    expect(ledger).toContain(marker);
+    expect(ledger).toContain("Injected question");
+    expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).not.toContain(marker);
+    expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).not.toContain("Injected");
+    expect(fs.readFileSync(out, "utf-8")).toBe(mdBefore);
     expect(fs.existsSync(engineOf(out))).toBe(false);
-    const answer = statusRows(out).find((x) => x.type === "decision-answer");
-    expect(answer).toMatchObject({ q: 1, by: "owner" });
-    expect(String(answer?.answer)).toMatch(/^Try again/);
-    expect(String(answer?.answer)).toContain(words);
+    expect(pauseItems(out).some((i) => i.n === 3)).toBe(false);
   });
 });
 
@@ -1831,3 +1985,96 @@ describe("bkit decisions apply --by=headless", () => {
     expect(`${JSON.stringify(r.json)}${r.err}`).toContain("build-decision-1-1.md");
   });
 });
+
+describe("bkit decisions answers", () => {
+  const answerLine = (root: string, file: string, q: number, answer: string, extra: object) => ({
+    type: "decision-answer",
+    workflow: "build",
+    at: "2026-11-17T00:01:00Z",
+    file: path.relative(root, file),
+    q,
+    answer,
+    ...extra,
+  });
+
+  it("prints the last appended answer per question with its writer", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
+    const before = fs.readFileSync(file, "utf-8");
+    const rows = [
+      answerLine(
+        root,
+        file,
+        1,
+        "Accept (assumed) \u2014 the caller caps it (headless, LOCAL, 2026-11-17)",
+        {
+          by: "headless",
+          assumed: true,
+        },
+      ),
+      answerLine(
+        root,
+        file,
+        2,
+        "Accept (assumed) \u2014 the caller caps it (headless, LOCAL, 2026-11-17)",
+        {
+          by: "headless",
+          assumed: true,
+        },
+      ),
+      answerLine(root, file, 2, "Fix now \u2014 the owner wants it fixed (owner, 2026-11-17)", {
+        by: "owner",
+        fixTask: 31,
+      }),
+    ];
+    fs.appendFileSync(seedStatus(logs), rows.map((x) => `${JSON.stringify(x)}\n`).join(""));
+    const r = await run(["decisions", "answers", `--file=${file}`], root);
+    expect(r.code).toBe(0);
+    expect(r.json.items).toHaveLength(2);
+    expect(r.json.items[0]).toMatchObject({
+      q: 1,
+      title: "Task 3 [src/a.ts:10]",
+      by: "headless",
+      assumed: true,
+    });
+    expect(r.json.items[1]).toMatchObject({
+      q: 2,
+      title: "Task 4 [src/b.ts:2]",
+      by: "owner",
+      assumed: false,
+      fixTask: 31,
+    });
+    expect(String(r.json.items[1].answer)).toMatch(/^Fix now/);
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+    expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).not.toContain("answers");
+  });
+
+  it("prints an old single-file decision's in-file answers", async () => {
+    const { root, logs } = checkout();
+    const file = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(
+      file,
+      [
+        "Status: DECIDED",
+        "Question: CHALLENGE",
+        "From: challenge",
+        "",
+        "**Q1 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "A) Accept \u2014 the item is recorded as accepted",
+        "B) Fix now \u2014 a fix task is added to the plan",
+        "Recommended: A) Accept \u2014 the caller already caps it",
+        "Default if unanswered: the run waits for you",
+        "Decision: B) Fix now \u2014 the owner wants it fixed (owner, 2026-10-28)",
+        "Fix task: 31",
+        "",
+      ].join("\n"),
+    );
+    seedStatus(logs);
+    const r = await run(["decisions", "answers", `--file=${file}`], root);
+    expect(r.code).toBe(0);
+    expect(r.json.status).toBe("DECIDED");
+    expect(r.json.items).toHaveLength(1);
+    expect(r.json.items[0]).toMatchObject({ q: 1, title: "Task 3 [src/a.ts:10]", fixTask: 31 });
+    expect(String(r.json.items[0].answer)).toMatch(/^Fix now/);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 8d2ee9e0e..7895ee0b4 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -1,4 +1,4 @@
-// bkit decisions check|counts|apply|skip|pending — the build's decision files, from question to ship.
+// bkit decisions check|counts|apply|answers|skip|pending — the build's decision files, from question to ship.
 // `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
 //
 // A pause is the orchestrator's decision file (`build-decision-{RUN}-{N}.md`: its header and its
@@ -179,6 +179,9 @@ export function itemProblem(text: string, loop: { options: string[] } | null): s
     seen.add(n);
     if (n === 1 && engineHasLoop)
       return "Q1 is the loop question the engine file holds; number your questions from Q2";
+    const answerLine = /^(Decision|Fix task|Rejected|Deferred):/m.exec(part);
+    if (answerLine !== null)
+      return `${q} holds a "${answerLine[1]}:" line; answers are rows the engine writes (\`decisions apply\`), so delete it`;
     const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
     if (optionLines.length === 0)
       return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
@@ -587,19 +590,25 @@ export const decisionsCommand: CommandSpec = {
       flags: [
         { name: "file", type: "string", required: true, help: "the decision file" },
         { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
-        { name: "q", type: "string", help: "--by=owner: the question number" },
+        { name: "q", type: "string", help: "--by=owner --confirm / --reject: the question number" },
         { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
         { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
         {
           name: "answer",
           type: "string",
-          help: "--by=owner: the owner's answer to the loop question: Try again | Decide | Stop",
+          repeatable: true,
+          help: "--by=owner: one answer, Q{n}={option letter}, e.g. Q2=B; repeat for each question",
+        },
+        {
+          name: "fix-task",
+          type: "string",
+          repeatable: true,
+          help: "--by=owner: Q{n}={task number} for a question answered Fix now in the same call",
         },
-        { name: "reason", type: "string", help: "--by=owner: the owner's words" },
         {
           name: "reason-file",
           type: "string",
-          help: "--by=owner: a file holding the owner's words, read as plain text (instead of --reason)",
+          help: "--by=owner --confirm / --reject: a file holding the owner's words, read as plain text",
         },
         {
           name: "root",
@@ -695,39 +704,85 @@ export const decisionsCommand: CommandSpec = {
         }
         if (by !== "owner")
           throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
-        const n = positiveInt(ctx.flags.q, "q");
+        const answers = (ctx.flags.answer as string[] | undefined) ?? [];
+        const fixTasks = (ctx.flags.fixTask as string[] | undefined) ?? [];
         const reasonFile = str(ctx.flags.reasonFile);
-        if (reasonFile !== undefined && str(ctx.flags.reason) !== undefined)
-          throw new CommandError(EXIT.USAGE, "--reason and --reason-file are one or the other");
-        const reasonPath = reasonFile === undefined ? undefined : path.resolve(ctx.cwd, reasonFile);
-        if (reasonPath !== undefined && !fs.existsSync(reasonPath))
-          throw new CommandError(EXIT.USAGE, `--reason-file ${reasonFile} does not exist`);
-        const reason =
-          reasonPath === undefined
-            ? str(ctx.flags.reason)
-            : fs.readFileSync(reasonPath, "utf-8").trim();
-        const answer = str(ctx.flags.answer);
-        const choices = [
-          ctx.flags.confirm === true,
-          ctx.flags.reject === true,
-          answer !== undefined,
-        ];
-        if (n === undefined || reason === undefined || choices.filter(Boolean).length !== 1)
-          throw new CommandError(
-            EXIT.USAGE,
-            "--by=owner needs --q, --reason or --reason-file and one of --confirm / --reject / --answer",
-          );
-        const it = pause.items.find((i) => i.n === n);
-        if (answer !== undefined) {
-          if (it === undefined || !it.options.includes(answer))
+        if (answers.length > 0) {
+          if (
+            ctx.flags.confirm === true ||
+            ctx.flags.reject === true ||
+            ctx.flags.q !== undefined ||
+            reasonFile !== undefined
+          )
             throw new CommandError(
               EXIT.USAGE,
-              `Q${n} has no option "${answer}" in ${path.basename(file)}`,
+              "--answer stands alone: --confirm, --reject, --q and --reason-file go with a confirmation, not an answer",
+            );
+          const picked = new Map<number, string>();
+          for (const a of answers) {
+            const m = /^Q([1-9][0-9]*)=([A-Z])$/.exec(a);
+            if (m === null)
+              throw new CommandError(
+                EXIT.USAGE,
+                `--answer=${a} is not Q{n}={option letter}, e.g. Q2=B`,
+              );
+            const q = Number(m[1]);
+            const it = pause.items.find((i) => i.n === q);
+            const option = it?.options[m[2]!.charCodeAt(0) - 65];
+            if (option === undefined)
+              throw new CommandError(
+                EXIT.USAGE,
+                `Q${q} has no option ${m[2]} in ${path.basename(file)}`,
+              );
+            if (picked.has(q)) throw new CommandError(EXIT.USAGE, `Q${q} is answered twice`);
+            picked.set(q, option);
+          }
+          const tasks = new Map<number, number>();
+          for (const f of fixTasks) {
+            const m = /^Q([1-9][0-9]*)=([1-9][0-9]*)$/.exec(f);
+            if (m === null)
+              throw new CommandError(
+                EXIT.USAGE,
+                `--fix-task=${f} is not Q{n}={task number}, a positive whole number`,
+              );
+            if (picked.get(Number(m[1])) !== "Fix now")
+              throw new CommandError(
+                EXIT.USAGE,
+                `--fix-task=${f}: Q${m[1]} is not answered Fix now in this call`,
+              );
+            tasks.set(Number(m[1]), Number(m[2]));
+          }
+          for (const [q, option] of picked)
+            answerRow(
+              file,
+              ctx.cwd,
+              q,
+              `${option} \u2014 the owner's choice (owner, ${today()})`,
+              "owner",
+              {
+                ...(tasks.has(q) ? { fixTask: tasks.get(q) } : {}),
+              },
             );
-          answerRow(file, ctx.cwd, n, `${answer} — ${reason} (owner, ${today()})`, "owner");
           ctx.emit({ status: statusNow(), decisionKey: null });
           return EXIT.OK;
         }
+        if (fixTasks.length > 0)
+          throw new CommandError(EXIT.USAGE, "--fix-task goes with an --answer of Fix now");
+        const n = positiveInt(ctx.flags.q, "q");
+        if (
+          n === undefined ||
+          reasonFile === undefined ||
+          [ctx.flags.confirm === true, ctx.flags.reject === true].filter(Boolean).length !== 1
+        )
+          throw new CommandError(
+            EXIT.USAGE,
+            "--by=owner needs --answer=Q{n}={letter}, or --q, --reason-file and one of --confirm / --reject",
+          );
+        const reasonPath = path.resolve(ctx.cwd, reasonFile);
+        if (!fs.existsSync(reasonPath))
+          throw new CommandError(EXIT.USAGE, `--reason-file ${reasonFile} does not exist`);
+        const reason = fs.readFileSync(reasonPath, "utf-8").trim();
+        const it = pause.items.find((i) => i.n === n);
         if (it === undefined || !it.assumed)
           throw new CommandError(
             EXIT.USAGE,
@@ -742,21 +797,54 @@ export const decisionsCommand: CommandSpec = {
             file,
             ctx.cwd,
             n,
-            `Accept — ${reason} (owner, confirmed at ship, ${today()})`,
+            `Accept \u2014 confirmed by the owner at ship (owner, ${today()})`,
             "owner",
             { workflow: "ship" },
           );
         } else {
+          const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
           answerRow(file, ctx.cwd, n, it.decision ?? "Accept (assumed)", "owner", {
             workflow: "ship",
             assumed: true,
             rejected: true,
+            reasonFile: path.relative(top, reasonPath),
           });
         }
         ctx.emit({ status: statusNow(), decisionKey });
         return EXIT.OK;
       },
     },
+    answers: {
+      summary:
+        "Print a decision file's folded answers: the answer last appended for each question, who gave it and its flags. Writes nothing.",
+      use: "workflow",
+      flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
+      output: {
+        file: "the decision file read",
+        status: "the pause's Status: OPEN | ASSUMED | DECIDED",
+        items:
+          "[{q, title, answer, by, assumed, rejected, deferred, fixTask}], answer null while unanswered",
+      },
+      run: (ctx) => {
+        const file = path.resolve(ctx.cwd, String(ctx.flags.file));
+        const items = pauseOf(file).items;
+        ctx.emit({
+          file: path.relative(ctx.cwd, file),
+          status: pauseStatus(readIf, file),
+          items: items.map((i) => ({
+            q: i.n,
+            title: i.title,
+            answer: i.decision,
+            by: i.by,
+            assumed: i.assumed,
+            rejected: i.rejected,
+            deferred: i.deferred,
+            fixTask: i.fixTask,
+          })),
+        });
+        return EXIT.OK;
+      },
+    },
     skip: {
       summary:
         "Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails.",
@@ -824,7 +912,7 @@ export const decisionsCommand: CommandSpec = {
                 workflow: "ship",
                 assumed: true,
                 rejected: it.rejected,
-                deferred: true,
+                deferred: "needs-decision",
               });
             }
           }
diff --git a/.bkit/core/engine/commands/workflow/open-decision.ts b/.bkit/core/engine/commands/workflow/open-decision.ts
index 5566a1ebf..91a05c5ff 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.ts
@@ -35,6 +35,8 @@ export interface DecisionItem {
   assumed: boolean;
   rejected: boolean;
   deferred: boolean;
+  /** Who wrote the answer (the row's `by`); null for an unanswered or an in-file answer. */
+  by: string | null;
 }
 
 /** Splits a decision file before each `**Q{n} — ` item line. */
@@ -115,6 +117,7 @@ export function parseDecisionItems(text: string): DecisionItem[] {
         assumed: decision !== null && /^Accept \(assumed\)/.test(decision),
         rejected: lineOf(part, "Rejected") !== null,
         deferred: lineOf(part, "Deferred") !== null,
+        by: null,
       };
     });
 }
@@ -182,6 +185,7 @@ function foldDecision(read: ReadText, rel: string, answersOf?: string, textOnly
     assumed: false,
     rejected: false,
     deferred: false,
+    by: null,
   }));
   const loop = counts?.loop;
   if (loop !== undefined && !items.some((i) => i.n === 1)) {
@@ -199,6 +203,7 @@ function foldDecision(read: ReadText, rel: string, answersOf?: string, textOnly
       assumed: false,
       rejected: false,
       deferred: false,
+      by: null,
     });
   }
   items.sort((a, b) => a.n - b.n);
@@ -213,7 +218,8 @@ function foldDecision(read: ReadText, rel: string, answersOf?: string, textOnly
       decision: optionAnswer(String(a.answer), i.options),
       assumed: a.assumed === true,
       rejected: a.rejected === true,
-      deferred: a.deferred === true,
+      deferred: a.deferred !== undefined && a.deferred !== false,
+      by: typeof a.by === "string" ? a.by : null,
       fixTask: fixTaskOf(a.fixTask === undefined ? null : String(a.fixTask)),
     };
   });
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 640bde0a3..26fdee7a3 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -526,7 +526,8 @@ export type DecisionAnswerRow = {
   by: string;
   assumed?: boolean;
   rejected?: boolean;
-  deferred?: boolean;
+  /** `needs-decision` once ship deferred the assumed item. */
+  deferred?: string | boolean;
   fixTask?: number;
   reasonFile?: string;
   runtime?: string;
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 3d06f938e..bb0a869c9 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -401,9 +401,9 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write it:
+   - **If** the answer is `Confirm` → write the human's words to `{WORKTREE_PATH}/{LOG_DIR}/ship-owner-reason-{Q}.md` with the file tool, then write the answer:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason="{human's words}" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/{LOG_DIR}/ship-owner-reason-{Q}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 29bb0bcfe..d0a94dd74 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -1,4 +1,4 @@
-// bkit decisions check|counts|apply|skip|pending — the build's decision files, from question to ship.
+// bkit decisions check|counts|apply|answers|skip|pending — the build's decision files, from question to ship.
 // `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
 //
 // A pause is the orchestrator's decision file (`build-decision-{RUN}-{N}.md`: its header and its
@@ -144,6 +144,9 @@ export function itemProblem(text, loop) {
         seen.add(n);
         if (n === 1 && engineHasLoop)
             return "Q1 is the loop question the engine file holds; number your questions from Q2";
+        const answerLine = /^(Decision|Fix task|Rejected|Deferred):/m.exec(part);
+        if (answerLine !== null)
+            return `${q} holds a "${answerLine[1]}:" line; answers are rows the engine writes (\`decisions apply\`), so delete it`;
         const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
         if (optionLines.length === 0)
             return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
@@ -476,19 +479,25 @@ export const decisionsCommand = {
             flags: [
                 { name: "file", type: "string", required: true, help: "the decision file" },
                 { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
-                { name: "q", type: "string", help: "--by=owner: the question number" },
+                { name: "q", type: "string", help: "--by=owner --confirm / --reject: the question number" },
                 { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
                 { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
                 {
                     name: "answer",
                     type: "string",
-                    help: "--by=owner: the owner's answer to the loop question: Try again | Decide | Stop",
+                    repeatable: true,
+                    help: "--by=owner: one answer, Q{n}={option letter}, e.g. Q2=B; repeat for each question",
+                },
+                {
+                    name: "fix-task",
+                    type: "string",
+                    repeatable: true,
+                    help: "--by=owner: Q{n}={task number} for a question answered Fix now in the same call",
                 },
-                { name: "reason", type: "string", help: "--by=owner: the owner's words" },
                 {
                     name: "reason-file",
                     type: "string",
-                    help: "--by=owner: a file holding the owner's words, read as plain text (instead of --reason)",
+                    help: "--by=owner --confirm / --reject: a file holding the owner's words, read as plain text",
                 },
                 {
                     name: "root",
@@ -567,32 +576,57 @@ export const decisionsCommand = {
                 }
                 if (by !== "owner")
                     throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
-                const n = positiveInt(ctx.flags.q, "q");
+                const answers = ctx.flags.answer ?? [];
+                const fixTasks = ctx.flags.fixTask ?? [];
                 const reasonFile = str(ctx.flags.reasonFile);
-                if (reasonFile !== undefined && str(ctx.flags.reason) !== undefined)
-                    throw new CommandError(EXIT.USAGE, "--reason and --reason-file are one or the other");
-                const reasonPath = reasonFile === undefined ? undefined : path.resolve(ctx.cwd, reasonFile);
-                if (reasonPath !== undefined && !fs.existsSync(reasonPath))
-                    throw new CommandError(EXIT.USAGE, `--reason-file ${reasonFile} does not exist`);
-                const reason = reasonPath === undefined
-                    ? str(ctx.flags.reason)
-                    : fs.readFileSync(reasonPath, "utf-8").trim();
-                const answer = str(ctx.flags.answer);
-                const choices = [
-                    ctx.flags.confirm === true,
-                    ctx.flags.reject === true,
-                    answer !== undefined,
-                ];
-                if (n === undefined || reason === undefined || choices.filter(Boolean).length !== 1)
-                    throw new CommandError(EXIT.USAGE, "--by=owner needs --q, --reason or --reason-file and one of --confirm / --reject / --answer");
-                const it = pause.items.find((i) => i.n === n);
-                if (answer !== undefined) {
-                    if (it === undefined || !it.options.includes(answer))
-                        throw new CommandError(EXIT.USAGE, `Q${n} has no option "${answer}" in ${path.basename(file)}`);
-                    answerRow(file, ctx.cwd, n, `${answer} — ${reason} (owner, ${today()})`, "owner");
+                if (answers.length > 0) {
+                    if (ctx.flags.confirm === true ||
+                        ctx.flags.reject === true ||
+                        ctx.flags.q !== undefined ||
+                        reasonFile !== undefined)
+                        throw new CommandError(EXIT.USAGE, "--answer stands alone: --confirm, --reject, --q and --reason-file go with a confirmation, not an answer");
+                    const picked = new Map();
+                    for (const a of answers) {
+                        const m = /^Q([1-9][0-9]*)=([A-Z])$/.exec(a);
+                        if (m === null)
+                            throw new CommandError(EXIT.USAGE, `--answer=${a} is not Q{n}={option letter}, e.g. Q2=B`);
+                        const q = Number(m[1]);
+                        const it = pause.items.find((i) => i.n === q);
+                        const option = it?.options[m[2].charCodeAt(0) - 65];
+                        if (option === undefined)
+                            throw new CommandError(EXIT.USAGE, `Q${q} has no option ${m[2]} in ${path.basename(file)}`);
+                        if (picked.has(q))
+                            throw new CommandError(EXIT.USAGE, `Q${q} is answered twice`);
+                        picked.set(q, option);
+                    }
+                    const tasks = new Map();
+                    for (const f of fixTasks) {
+                        const m = /^Q([1-9][0-9]*)=([1-9][0-9]*)$/.exec(f);
+                        if (m === null)
+                            throw new CommandError(EXIT.USAGE, `--fix-task=${f} is not Q{n}={task number}, a positive whole number`);
+                        if (picked.get(Number(m[1])) !== "Fix now")
+                            throw new CommandError(EXIT.USAGE, `--fix-task=${f}: Q${m[1]} is not answered Fix now in this call`);
+                        tasks.set(Number(m[1]), Number(m[2]));
+                    }
+                    for (const [q, option] of picked)
+                        answerRow(file, ctx.cwd, q, `${option} \u2014 the owner's choice (owner, ${today()})`, "owner", {
+                            ...(tasks.has(q) ? { fixTask: tasks.get(q) } : {}),
+                        });
                     ctx.emit({ status: statusNow(), decisionKey: null });
                     return EXIT.OK;
                 }
+                if (fixTasks.length > 0)
+                    throw new CommandError(EXIT.USAGE, "--fix-task goes with an --answer of Fix now");
+                const n = positiveInt(ctx.flags.q, "q");
+                if (n === undefined ||
+                    reasonFile === undefined ||
+                    [ctx.flags.confirm === true, ctx.flags.reject === true].filter(Boolean).length !== 1)
+                    throw new CommandError(EXIT.USAGE, "--by=owner needs --answer=Q{n}={letter}, or --q, --reason-file and one of --confirm / --reject");
+                const reasonPath = path.resolve(ctx.cwd, reasonFile);
+                if (!fs.existsSync(reasonPath))
+                    throw new CommandError(EXIT.USAGE, `--reason-file ${reasonFile} does not exist`);
+                const reason = fs.readFileSync(reasonPath, "utf-8").trim();
+                const it = pause.items.find((i) => i.n === n);
                 if (it === undefined || !it.assumed)
                     throw new CommandError(EXIT.USAGE, `Q${n} is not an assumed Accept in ${path.basename(file)}`);
                 let decisionKey = null;
@@ -600,19 +634,50 @@ export const decisionsCommand = {
                     const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
                     appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
                     decisionKey = String(row.key);
-                    answerRow(file, ctx.cwd, n, `Accept — ${reason} (owner, confirmed at ship, ${today()})`, "owner", { workflow: "ship" });
+                    answerRow(file, ctx.cwd, n, `Accept \u2014 confirmed by the owner at ship (owner, ${today()})`, "owner", { workflow: "ship" });
                 }
                 else {
+                    const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                     answerRow(file, ctx.cwd, n, it.decision ?? "Accept (assumed)", "owner", {
                         workflow: "ship",
                         assumed: true,
                         rejected: true,
+                        reasonFile: path.relative(top, reasonPath),
                     });
                 }
                 ctx.emit({ status: statusNow(), decisionKey });
                 return EXIT.OK;
             },
         },
+        answers: {
+            summary: "Print a decision file's folded answers: the answer last appended for each question, who gave it and its flags. Writes nothing.",
+            use: "workflow",
+            flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
+            output: {
+                file: "the decision file read",
+                status: "the pause's Status: OPEN | ASSUMED | DECIDED",
+                items: "[{q, title, answer, by, assumed, rejected, deferred, fixTask}], answer null while unanswered",
+            },
+            run: (ctx) => {
+                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
+                const items = pauseOf(file).items;
+                ctx.emit({
+                    file: path.relative(ctx.cwd, file),
+                    status: pauseStatus(readIf, file),
+                    items: items.map((i) => ({
+                        q: i.n,
+                        title: i.title,
+                        answer: i.decision,
+                        by: i.by,
+                        assumed: i.assumed,
+                        rejected: i.rejected,
+                        deferred: i.deferred,
+                        fixTask: i.fixTask,
+                    })),
+                });
+                return EXIT.OK;
+            },
+        },
         skip: {
             summary: "Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails.",
             use: "workflow",
@@ -680,7 +745,7 @@ export const decisionsCommand = {
                                 workflow: "ship",
                                 assumed: true,
                                 rejected: it.rejected,
-                                deferred: true,
+                                deferred: "needs-decision",
                             });
                         }
                     }
diff --git a/dist/commands/workflow/open-decision.js b/dist/commands/workflow/open-decision.js
index bf983761c..ea0650d7f 100644
--- a/dist/commands/workflow/open-decision.js
+++ b/dist/commands/workflow/open-decision.js
@@ -84,6 +84,7 @@ export function parseDecisionItems(text) {
             assumed: decision !== null && /^Accept \(assumed\)/.test(decision),
             rejected: lineOf(part, "Rejected") !== null,
             deferred: lineOf(part, "Deferred") !== null,
+            by: null,
         };
     });
 }
@@ -129,6 +130,7 @@ function foldDecision(read, rel, answersOf, textOnly = false) {
         assumed: false,
         rejected: false,
         deferred: false,
+        by: null,
     }));
     const loop = counts?.loop;
     if (loop !== undefined && !items.some((i) => i.n === 1)) {
@@ -144,6 +146,7 @@ function foldDecision(read, rel, answersOf, textOnly = false) {
             assumed: false,
             rejected: false,
             deferred: false,
+            by: null,
         });
     }
     items.sort((a, b) => a.n - b.n);
@@ -160,7 +163,8 @@ function foldDecision(read, rel, answersOf, textOnly = false) {
             decision: optionAnswer(String(a.answer), i.options),
             assumed: a.assumed === true,
             rejected: a.rejected === true,
-            deferred: a.deferred === true,
+            deferred: a.deferred !== undefined && a.deferred !== false,
+            by: typeof a.by === "string" ? a.by : null,
             fixTask: fixTaskOf(a.fixTask === undefined ? null : String(a.fixTask)),
         };
     });
