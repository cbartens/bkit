diff --git a/.bkit/core/engine/commands/workflow/challenge.test.ts b/.bkit/core/engine/commands/workflow/challenge.test.ts
index 867fc1ae9..2b3311740 100644
--- a/.bkit/core/engine/commands/workflow/challenge.test.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.test.ts
@@ -565,6 +565,43 @@ describe("bkit challenge merge", () => {
     ]);
   });
 
+  it("acceptedLocations reads a lettered decision in a per-line file as Accept", () => {
+    const opts = [
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+    ];
+    write(
+      `${LOG}/build-decision-1-1.md`,
+      [
+        "Status: DECIDED",
+        "Question: CHALLENGE",
+        "",
+        "**Q1 — Null deref in `src/a.ts:10`:** the handler reads a missing field.",
+        ...opts,
+        "Recommended: A) Accept — guarded upstream",
+        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+        "Decision: A) Accept — fine by me",
+        "",
+        "**Q2 — Retry loop in `src/b.ts:4`:** spins forever.",
+        ...opts,
+        "Recommended: B) Fix now — real bug",
+        "Default if unanswered: the run waits for you; taken as B when nobody can be asked",
+        "Decision: B",
+        "",
+        "**Q3 — Stale cache in `src/c.ts:7`:** serves old data.",
+        ...opts,
+        "Recommended: B) Fix now — real bug",
+        "Default if unanswered: the run waits for you; taken as B when nobody can be asked",
+        "Decision: A",
+        "",
+      ].join("\n"),
+    );
+    expect([...acceptedLocations(path.join(cwd, LOG), cwd)].sort()).toEqual([
+      "src/a.ts:10",
+      "src/c.ts:7",
+    ]);
+  });
+
   it("deferred counts the rows written", async () => {
     write(PLAN, plan(2));
     write(R1, report({ sev: "LOW", loc: "src/c.ts:1" }));
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 8b302420f..aaeba3e1c 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -47,14 +47,20 @@ const ITEMS = [
   {
     title: "Task 3 [src/a.ts:10]",
     question: "MEDIUM: the retry has no cap. Accept it?",
-    options: ["Accept", "Fix now"],
+    options: [
+      { name: "Accept", effect: "the item is recorded as accepted" },
+      { name: "Fix now", effect: "a fix task is added to the plan" },
+    ],
     recommended: "Accept",
     reason: "the caller already caps it",
   },
   {
     title: "Task 4 [src/b.ts:2]",
     question: "HIGH: the token is logged. Fix it now?",
-    options: ["Accept", "Fix now"],
+    options: [
+      { name: "Accept", effect: "the item is recorded as accepted" },
+      { name: "Fix now", effect: "a fix task is added to the plan" },
+    ],
     recommended: "Fix now",
     reason: "a secret reaches the log",
   },
@@ -62,7 +68,11 @@ const ITEMS = [
 const BLOCKER = {
   title: "Task 5 [src/c.ts:1]",
   question: "no test-first evidence. Accept it?",
-  options: ["Accept", "Fix now", "Stop"],
+  options: [
+    { name: "Accept", effect: "the item is recorded as accepted" },
+    { name: "Fix now", effect: "a fix task is added to the plan" },
+    { name: "Stop", effect: "the run ends here with a handover; the next run resumes here" },
+  ],
   noRecommendation: "only the owner can waive test-first",
 };
 
@@ -101,19 +111,20 @@ describe("bkit decisions compose", () => {
       "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
     );
     expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
-    expect(text).toContain("No recommendation — only the owner can waive test-first");
-    expect(text.trimEnd().split("\n").at(-1)).toBe(
-      'Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.',
-    );
+    expect(text).toContain("Recommended: none — only the owner can waive test-first");
+    expect(text).toContain("A) Accept — the item is recorded as accepted");
+    expect(text).not.toContain("Options:");
+    expect(text).toContain("Default if unanswered:");
   });
 
   it("compose letters every option and the recommended one", async () => {
     const { root, logs } = checkout();
     const { out } = await compose(root, logs, [ITEMS[1]]);
     const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Options: A) Accept / B) Fix now");
+    expect(text).toContain("A) Accept — the item is recorded as accepted\n");
+    expect(text).toContain("B) Fix now — a fix task is added to the plan\n");
     expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
-    expect(text).not.toContain("Options: Accept / Fix now");
+    expect(text).not.toContain("Options:");
   });
 
   it("refuses an item whose recommendation is not one of its options", async () => {
@@ -124,23 +135,172 @@ describe("bkit decisions compose", () => {
 
   it("refuses an item with more options than letters", async () => {
     const { root, logs } = checkout();
-    const options = Array.from({ length: 27 }, (_, i) => `Option ${i + 1}`);
+    const options = Array.from({ length: 27 }, (_, i) => ({
+      name: `Option ${i + 1}`,
+      effect: `option ${i + 1} happens`,
+    }));
     const bad = [{ ...ITEMS[0], options, recommended: "Option 27" }];
-    expect((await compose(root, logs, bad)).r.code).toBe(2);
+    const { r } = await compose(root, logs, bad);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("at most 26 options");
   });
 
   it("round-trips the last lettered option through parseDecisionItems", async () => {
     const { root, logs } = checkout();
-    const options = Array.from({ length: 26 }, (_, i) => `Option ${i + 1}`);
+    const options = Array.from({ length: 26 }, (_, i) => ({
+      name: `Option ${i + 1}`,
+      effect: `option ${i + 1} happens`,
+    }));
     const { r, out } = await compose(root, logs, [
       { ...ITEMS[0], options, recommended: "Option 26" },
     ]);
     expect(r.code).toBe(0);
-    const item = parseDecisionItems(fs.readFileSync(out, "utf-8"))[0]!;
-    expect(item.options).toEqual(options);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("Z) Option 26 — option 26 happens");
+    const item = parseDecisionItems(text)[0]!;
+    expect(item.options).toEqual(options.map((o) => o.name));
     expect(item.recommended).toBe("Option 26");
   });
 
+  const REPLY_LINE =
+    'Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.';
+  const ONE_BY_ONE = 'Or say "one by one" and I\'ll ask them one at a time.';
+
+  it("compose writes each option on its own line with its effect", async () => {
+    const { root, logs } = checkout();
+    const { r, out } = await compose(root, logs, [ITEMS[0]]);
+    expect(r.code).toBe(0);
+    const lines = fs.readFileSync(out, "utf-8").split("\n");
+    const q = lines.findIndex((l) => l.startsWith("**Q1 — "));
+    expect(lines[q + 1]).toBe("A) Accept — the item is recorded as accepted");
+    expect(lines[q + 2]).toBe("B) Fix now — a fix task is added to the plan");
+    expect(lines.some((l) => l.startsWith("Options:"))).toBe(false);
+  });
+
+  it("compose refuses an option without an effect", async () => {
+    for (const options of [
+      ["Accept", "Maybe"],
+      [{ name: "Accept", effect: "the item is recorded as accepted" }, { name: "Fix now" }],
+    ]) {
+      const { root, logs } = checkout();
+      const { r, out } = await compose(root, logs, [
+        { ...ITEMS[0], options, recommended: "Accept" },
+      ]);
+      expect(r.code).toBe(2);
+      expect(fs.existsSync(out)).toBe(false);
+    }
+  });
+
+  it("compose writes the default effect for a bare fixed option name", async () => {
+    const { root, logs } = checkout();
+    const { r, out } = await compose(root, logs, [
+      { ...ITEMS[0], options: ["Accept", "Stop"], recommended: "Accept" },
+    ]);
+    expect(r.code).toBe(0);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("A) Accept — the item is recorded as accepted");
+    expect(text).toContain(
+      "B) Stop — the run ends here with a handover; the next run resumes here",
+    );
+  });
+
+  it("compose refuses an option name that contains a spaced dash", async () => {
+    const { root, logs } = checkout();
+    const options = [
+      { name: "Keep it — as is", effect: "nothing changes" },
+      { name: "Fix now", effect: "a fix task is added to the plan" },
+    ];
+    const { r, out } = await compose(root, logs, [
+      { ...ITEMS[0], options, recommended: "Fix now" },
+    ]);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("Keep it — as is");
+    expect(r.err).toContain("Q1");
+    expect(r.err).toMatch(/—|dash/);
+    expect(r.err).toMatch(/name/);
+    expect(fs.existsSync(out)).toBe(false);
+  });
+
+  it("compose writes a Default if unanswered line for each question", async () => {
+    const { root, logs } = checkout();
+    const { out } = await compose(root, logs, [ITEMS[1], BLOCKER]);
+    const text = fs.readFileSync(out, "utf-8");
+    const [, q1, q2] = text.split(/^(?=\*\*Q\d+ — )/m);
+    expect(q1).toContain(
+      "Default if unanswered: the run waits for you; taken as B when nobody can be asked",
+    );
+    expect(q2).toContain(
+      "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
+    );
+  });
+
+  it("compose writes Recommended: none for a hard blocker", async () => {
+    const { root, logs } = checkout();
+    const { out } = await compose(root, logs, [BLOCKER]);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("Recommended: none — only the owner can waive test-first");
+    expect(text).not.toContain("No recommendation");
+  });
+
+  it("compose ends with the shared reply line", async () => {
+    const { root, logs } = checkout();
+    const { out } = await compose(root, logs, ITEMS);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text.trimEnd().split("\n").at(-1)).toBe(REPLY_LINE);
+    expect(text).not.toContain("Reply per question.");
+  });
+
+  it("compose offers one by one from three questions on, not for two", async () => {
+    const { root, logs } = checkout();
+    const two = fs.readFileSync((await compose(root, logs, ITEMS)).out, "utf-8");
+    expect(two).not.toContain("one by one");
+    const three = fs.readFileSync((await compose(root, logs, [...ITEMS, BLOCKER])).out, "utf-8");
+    expect(three).toContain(REPLY_LINE);
+    expect(three.trimEnd().endsWith(ONE_BY_ONE)).toBe(true);
+  });
+
+  it("--loop writes an effect for each loop option", async () => {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        {
+          type: "step-done",
+          workflow: "build",
+          step: "build-plan-verify",
+          status: "DONE",
+          at: "2026-10-01T00:10:00Z",
+          group: 1,
+          failures: 2,
+        },
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { out } = await compose(root, logs, [], "--loop=verify", `--file=${status}`, "--group=1");
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("A) Try again — one more fix round runs");
+    expect(text).toContain(
+      "B) Stop — the run ends here with a handover; the next run resumes here",
+    );
+    expect(text).not.toContain("Options:");
+  });
+
+  it("round-trips an item with effects through parseDecisionItems", async () => {
+    const { root, logs } = checkout();
+    const { r, out } = await compose(root, logs, [ITEMS[1], BLOCKER]);
+    expect(r.code).toBe(0);
+    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
+    expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
+    expect(items[0]!.recommended).toBe("Fix now");
+    expect(items[0]!.reason).toBe("a secret reaches the log");
+    expect(items[1]!.options).toEqual(["Accept", "Fix now", "Stop"]);
+    expect(items[1]!.recommended).toBeNull();
+    expect(items[1]!.reason).toBe("only the owner can waive test-first");
+  });
+
   it("--loop adds the attempt line, the progress block and the loop question as Q1", async () => {
     const { root, logs } = checkout();
     const status = path.join(logs, "status.jsonl");
@@ -179,7 +339,8 @@ describe("bkit decisions compose", () => {
     expect(text).toContain("build verify: attempt 2 of 2");
     expect(text).toContain("Problems after each round: 4 → 4");
     expect(text).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
-    expect(text).toContain("Options: A) Try again / B) Decide");
+    expect(text).toContain("A) Try again — one more fix round runs");
+    expect(text).toContain("B) Decide — ");
     expect(text).toContain("**Q2 — Task 3 [src/a.ts:10]:**");
   });
 
@@ -212,8 +373,9 @@ describe("bkit decisions compose", () => {
       "--group=1",
     );
     const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Options: A) Try again / B) Decide");
-    expect(text).not.toContain("Options: Try again / Decide");
+    expect(text).toContain("A) Try again — one more fix round runs");
+    expect(text).toContain("B) Decide — ");
+    expect(text).not.toContain("Options:");
     expect(text).toMatch(/Recommended: [AB]\) (Try again|Decide) — /);
   });
 
@@ -679,7 +841,7 @@ describe("bkit decisions compose", () => {
       for (const items of [[], ITEMS]) {
         const { text } = await composeWithBase(over, items);
         expect(text, `${String(over.verdict)} with ${items.length} items`).toMatch(
-          /\*\*Q1 — Verify:\*\*[^\n]*\nOptions: A\) Try again \/ B\) (Decide|Stop)/,
+          /\*\*Q1 — Verify:\*\*[^\n]*\nA\) Try again — [^\n]*\nB\) (Decide|Stop) — /,
         );
       }
     }
@@ -894,6 +1056,29 @@ describe("bkit decisions apply --by=headless", () => {
     expect(fs.readFileSync(out, "utf-8")).toContain("(ask:false, LOCAL, ");
   });
 
+  it("apply --by=headless leaves a Recommended: none item for the owner", async () => {
+    const { root, logs } = checkout();
+    const out = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(
+      out,
+      [
+        "Status: OPEN",
+        "",
+        "**Q1 — Task 5 [src/c.ts:1]:** no test-first evidence. Accept it?",
+        "A) Accept — the item is recorded as accepted",
+        "B) Stop — the run ends here with a handover; the next run resumes here",
+        "Recommended: none — only the owner can waive test-first",
+        "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
+        "",
+      ].join("\n"),
+    );
+    process.env.BKIT_RUNTIME = "LOCAL";
+    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
+    expect(r.code).toBe(EXIT_HARD_BLOCKERS);
+    expect(r.json).toMatchObject({ status: "OPEN", applied: [], hardBlockers: [1] });
+    expect(fs.readFileSync(out, "utf-8")).not.toContain("Decision:");
+  });
+
   it("labels the runtime from the main checkout's Cursor marker when run in a build worktree", async () => {
     const { root } = checkout();
     spawnSync(
@@ -980,6 +1165,90 @@ describe("parseDecisionItems", () => {
     expect(decided("C — no such option")).toBe("C — no such option");
   });
 
+  const PER_LINE = [
+    "Status: OPEN",
+    "",
+    "**Q1 — Task 3 [src/a.ts:10]:** accept it?",
+    "A) Accept — the item is recorded as accepted",
+    "B) Fix now — a fix task is added to the plan",
+    "Recommended: B) Fix now — a secret reaches the log",
+    "Default if unanswered: the run waits for you; taken as B when nobody can be asked",
+  ];
+
+  it("parseDecisionItems reads one option per line and drops each effect", () => {
+    const item = parseDecisionItems([...PER_LINE, ""].join("\n"))[0]!;
+    expect(item.options).toEqual(["Accept", "Fix now"]);
+    expect(item.recommended).toBe("Fix now");
+    expect(item.reason).toBe("a secret reaches the log");
+  });
+
+  it("parseDecisionItems reads Recommended: none as a hard blocker", () => {
+    const text = [
+      "Status: OPEN",
+      "",
+      "**Q1 — Task 5 [src/c.ts:1]:** accept it?",
+      "A) Accept — the item is recorded as accepted",
+      "B) Stop — the run ends here with a handover; the next run resumes here",
+      "Recommended: none — only the owner can waive test-first",
+      "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
+      "",
+    ].join("\n");
+    const item = parseDecisionItems(text)[0]!;
+    expect(item.recommended).toBeNull();
+    expect(item.reason).toBe("only the owner can waive test-first");
+    expect(item.options).toEqual(["Accept", "Stop"]);
+  });
+
+  it("a lettered decision in a per-line file reads as the option its letter labels", () => {
+    const decided = (decision: string) =>
+      parseDecisionItems([...PER_LINE, `Decision: ${decision}`, ""].join("\n"))[0]!.decision;
+    expect(decided("B")).toBe("Fix now");
+    expect(decided("B) Fix now — a secret reaches the log")).toBe(
+      "Fix now — a secret reaches the log",
+    );
+    expect(decided("A) Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)")).toBe(
+      "Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)",
+    );
+  });
+
+  it("a per-line option whose text holds a slash or a middle dot stays one option", () => {
+    const text = [
+      "Status: OPEN",
+      "",
+      "**Q1 — Layout:** how do we store it?",
+      "A) keep the read/write split — reads and writes stay in two files · tests stay as they are",
+      "B) merge them — one file holds both / the tests move",
+      "Recommended: A) keep the read/write split — less churn",
+      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+      "",
+    ].join("\n");
+    const item = parseDecisionItems(text)[0]!;
+    expect(item.options).toEqual(["keep the read/write split", "merge them"]);
+    expect(item.recommended).toBe("keep the read/write split");
+  });
+
+  it("a file mixing both layouts parses each item in its own layout", () => {
+    const text = [
+      "Status: OPEN",
+      "",
+      "**Q1 — Old:** accept it?",
+      "Options: A) Accept / B) Fix now",
+      "Recommended: A) Accept — minor",
+      "",
+      "**Q2 — New:** accept it?",
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: none — only the owner can say",
+      "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
+      "",
+    ].join("\n");
+    const items = parseDecisionItems(text);
+    expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
+    expect(items[0]!.recommended).toBe("Accept");
+    expect(items[1]!.options).toEqual(["Accept", "Fix now"]);
+    expect(items[1]!.recommended).toBeNull();
+  });
+
   it("reads the task a Fix now item names on its Fix task line", () => {
     const item = (decision: string, fixLines: string[]) =>
       [
@@ -1137,6 +1406,36 @@ describe("bkit decisions apply --by=owner and pending", () => {
     ]);
   });
 
+  it("apply --by=owner --confirm confirms an assumed item in a per-line file", async () => {
+    const { root, logs } = checkout();
+    const out = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(
+      out,
+      [
+        "Status: ASSUMED",
+        "",
+        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "A) Accept — the item is recorded as accepted",
+        "B) Fix now — a fix task is added to the plan",
+        "Recommended: A) Accept — the caller already caps it",
+        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+        "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(
+      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
+      root,
+    );
+    expect(r.code).toBe(0);
+    expect(r.json.decisionKey).toBe("7-x-accepted-task-3-src-a-ts-10");
+    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
+    expect(items[0]!.decision).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
+    expect(items[0]!.assumed).toBe(false);
+    expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
+    expect(items[0]!.recommended).toBe("Accept");
+  });
+
   it("refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject", async () => {
     const { root, out } = await assumed();
     const base = ["decisions", "apply", "--by=owner", `--file=${out}`, "--reason=x"];
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 6dc2ce023..0a60c99fd 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -4,11 +4,16 @@
 // lines, an optional progress block, then one item per question:
 //
 //   **Q{n} — {title}:** {question}
-//   Options: A) {A} / B) {B}
-//   Recommended: A) {A} — {reason}       (a hard blocker: `No recommendation — {why}`)
+//   A) {name} — {what happens if it is picked}
+//   B) {name} — {what happens if it is picked}
+//   Recommended: A) {name} — {reason}    (a hard blocker: `Recommended: none — {why}`)
+//   Default if unanswered: {what happens}
 //   Decision: {answer} — {words}         (once decided)
 //   Fix task: {N}                        (a `Fix now` item: the plan task that carries its fix)
 //
+// The old layout is still read: one `Options: A) {A} / B) {B}` line in place of the option lines,
+// and `No recommendation — {why}` in place of `Recommended: none — {why}`.
+//
 // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
 // `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
 // `docs/decisions.jsonl` row or a `TEST EXCEPTION`: only the owner's words do. Ship lists the
@@ -107,12 +112,18 @@ export function parseDecisionItems(text: string): DecisionItem[] {
     .map((part) => {
       const head = /^\*\*Q(\d+) — (.+?):\*\*/.exec(part);
       const rec = lineOf(part, "Recommended");
-      const none = /^No recommendation\b/m.test(part);
       const [option, ...why] = (rec ?? "").split(" — ");
-      const options = (lineOf(part, "Options") ?? "")
-        .split(" / ")
-        .map((o) => bareName(o.trim()))
-        .filter(Boolean);
+      const none = /^No recommendation\b/m.test(part) || /^none$/i.test((option ?? "").trim());
+      const perLine = [...part.matchAll(/^[A-Z]\)[ \t]+(.+?)[ \t]*$/gm)].map((m) =>
+        (m[1] ?? "").split(" — ")[0]!.trim(),
+      );
+      const options =
+        perLine.length > 0
+          ? perLine.filter(Boolean)
+          : (lineOf(part, "Options") ?? "")
+              .split(" / ")
+              .map((o) => bareName(o.trim()))
+              .filter(Boolean);
       const answer = lineOf(part, "Decision");
       const decision = answer === null ? null : optionAnswer(answer, options);
       return {
@@ -179,10 +190,15 @@ const slug = (s: string) =>
 // compose
 // ---------------------------------------------------------------------------
 
+interface ComposeOption {
+  name: string;
+  effect: string;
+}
+
 interface ComposeItem {
   title: string;
   question: string;
-  options: string[];
+  options: ComposeOption[];
   recommended?: string;
   reason?: string;
   /** Set for a hard blocker: why no agent can settle it. No recommendation is written. */
@@ -271,18 +287,54 @@ function readBaseCheck(file: string): BaseCheck {
   };
 }
 
+/** The effect a bare fixed option name gets. */
+const FIXED_EFFECTS: Record<string, string> = {
+  Accept: "the item is recorded as accepted and the build moves on",
+  "Fix now": "one more fix round runs before the build moves on",
+  Stop: "the run ends here with a handover; the next run resumes here",
+  "Try again": "one more fix round runs",
+  Decide: "the questions below are asked instead of another round",
+};
+
 function composeItems(raw: unknown): ComposeItem[] {
   if (!Array.isArray(raw)) throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
   return raw.map((r, i) => {
     const o = (r ?? {}) as Record<string, unknown>;
     const s = (k: string) =>
       typeof o[k] === "string" ? (o[k] as string).replace(/[\r\n]+/g, " ").trim() : "";
-    const options = Array.isArray(o.options) ? o.options.filter((x) => typeof x === "string") : [];
-    if (s("title") === "" || s("question") === "" || options.length === 0)
+    const rawOptions: unknown[] = Array.isArray(o.options) ? o.options : [];
+    if (s("title") === "" || s("question") === "" || rawOptions.length === 0)
       throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
-    if (options.length > MAX_OPTIONS)
+    if (rawOptions.length > MAX_OPTIONS)
       throw new CommandError(EXIT.USAGE, `item ${i + 1}: at most ${MAX_OPTIONS} options (A-Z)`);
-    if (s("noRecommendation") === "" && !options.includes(s("recommended")))
+    const options: ComposeOption[] = rawOptions.map((x, k) => {
+      const bad = () =>
+        new CommandError(
+          EXIT.USAGE,
+          `item ${i + 1} (Q${i + 1}): option ${letterAt(k)} needs a name and an effect`,
+        );
+      let name: string;
+      let effect: string;
+      if (typeof x === "string") {
+        name = x.trim();
+        const fixed = FIXED_EFFECTS[name];
+        if (fixed === undefined) throw bad();
+        effect = fixed;
+      } else {
+        const ob = (x ?? {}) as Record<string, unknown>;
+        if (typeof ob.name !== "string" || typeof ob.effect !== "string") throw bad();
+        name = ob.name.replace(/[\r\n]+/g, " ").trim();
+        effect = ob.effect.replace(/[\r\n]+/g, " ").trim();
+        if (name === "" || effect === "") throw bad();
+      }
+      if (name.includes("—"))
+        throw new CommandError(
+          EXIT.USAGE,
+          `item ${i + 1} (Q${i + 1}): option name "${name}" must not contain a dash (—); put it in the effect`,
+        );
+      return { name, effect };
+    });
+    if (s("noRecommendation") === "" && !options.some((x) => x.name === s("recommended")))
       throw new CommandError(
         EXIT.USAGE,
         `item ${i + 1}: recommended must be one of its options, or set noRecommendation`,
@@ -290,7 +342,7 @@ function composeItems(raw: unknown): ComposeItem[] {
     return {
       title: s("title"),
       question: s("question"),
-      options: options as string[],
+      options,
       recommended: s("recommended"),
       reason: s("reason"),
       noRecommendation: s("noRecommendation"),
@@ -300,16 +352,22 @@ function composeItems(raw: unknown): ComposeItem[] {
 
 const itemLines = (n: number, it: ComposeItem): string[] => {
   const rec = it.recommended ?? "";
-  const letter = letterOf(it.options, rec);
+  const names = it.options.map((o) => o.name);
+  const letter = letterOf(names, rec);
   return [
     `**Q${n} — ${it.title}:** ${it.question}`,
-    `Options: ${letteredOptions(it.options)}`,
+    ...it.options.map((o, i) => `${letterAt(i)}) ${o.name} — ${o.effect}`),
     it.noRecommendation
-      ? `No recommendation — ${it.noRecommendation}`
+      ? `Recommended: none — ${it.noRecommendation}`
       : `Recommended: ${letter === null ? rec : `${letter}) ${rec}`} — ${it.reason || "the orchestrator's call"}`,
+    it.noRecommendation || letter === null
+      ? "Default if unanswered: the run waits for you; the run stops when nobody can be asked"
+      : `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
   ];
 };
 
+const fixed = (name: string): ComposeOption => ({ name, effect: FIXED_EFFECTS[name]! });
+
 // ---------------------------------------------------------------------------
 // apply
 // ---------------------------------------------------------------------------
@@ -417,7 +475,7 @@ export const decisionsCommand: CommandSpec = {
         {
           name: "items",
           type: "string",
-          help: "JSON file: [{title, question, options, recommended, reason} | {…, noRecommendation}]",
+          help: "JSON file: [{title, question, options: [{name, effect}], recommended, reason} | {…, noRecommendation}]",
         },
         {
           name: "loop",
@@ -536,7 +594,10 @@ export const decisionsCommand: CommandSpec = {
                 loopRecommended === "Try again"
                   ? `another fix round? ${p.trendLine}`
                   : `decide the items below instead of another round? ${p.trendLine}`,
-              options: items.length > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
+              options:
+                items.length > 0
+                  ? [fixed("Try again"), fixed("Decide")]
+                  : [fixed("Try again"), fixed("Stop")],
               recommended:
                 items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
               reason,
@@ -547,10 +608,12 @@ export const decisionsCommand: CommandSpec = {
         }
         const first = loopName === undefined ? 1 : 2;
         items.forEach((it, i) => lines.push(...itemLines(first + i, it), ""));
+        const questionCount = items.length + (loopName === undefined ? 0 : 1);
         lines.push(
-          'Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.',
-          "",
+          'Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.',
         );
+        if (questionCount >= 3) lines.push('Or say "one by one" and I\'ll ask them one at a time.');
+        lines.push("");
         fs.mkdirSync(path.dirname(out), { recursive: true });
         fs.writeFileSync(out, lines.join("\n"), "utf-8");
         ctx.emit({
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 7a1b6705c..02c288e5f 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -1201,6 +1201,43 @@ describe("buildSummary", () => {
     );
   });
 
+  it("buildSummary reads a lettered decision in a per-line file as Accept", () => {
+    const decision = [
+      "Status: ASSUMED",
+      "**Q1 — Gap:** accept it?",
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: A) Accept — minor",
+      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+      "Decision: A",
+      "",
+      "**Q2 — Other gap:** accept it?",
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: A) Accept — minor",
+      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+      "Decision: A) Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)",
+      "",
+    ].join("\n");
+    const s = buildSummary(
+      input({
+        rows: [
+          {
+            type: "step-done",
+            step: "build-decision",
+            attempt: 1,
+            artifacts: ["log/build-decision-1-1.md"],
+          },
+        ],
+        decisionFiles: ["log/build-decision-1-1.md"],
+        read: reader({ "log/build-decision-1-1.md": decision }),
+      }),
+    );
+    expect(s.markdown).toContain("1 item(s) accepted at the Decision Pause");
+    expect(s.markdown).toContain("1 item(s) accepted without the owner");
+    expect(s.markdown).toContain("- Accepted: log/build-decision-1-1.md: Decision: Accept");
+  });
+
   it("reads pretty-printed and one-line warning records from a jsonl fence", () => {
     const pretty = JSON.stringify(
       {
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index b0deeb4f3..cb5b88de9 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -4,11 +4,16 @@
 // lines, an optional progress block, then one item per question:
 //
 //   **Q{n} — {title}:** {question}
-//   Options: A) {A} / B) {B}
-//   Recommended: A) {A} — {reason}       (a hard blocker: `No recommendation — {why}`)
+//   A) {name} — {what happens if it is picked}
+//   B) {name} — {what happens if it is picked}
+//   Recommended: A) {name} — {reason}    (a hard blocker: `Recommended: none — {why}`)
+//   Default if unanswered: {what happens}
 //   Decision: {answer} — {words}         (once decided)
 //   Fix task: {N}                        (a `Fix now` item: the plan task that carries its fix)
 //
+// The old layout is still read: one `Options: A) {A} / B) {B}` line in place of the option lines,
+// and `No recommendation — {why}` in place of `Recommended: none — {why}`.
+//
 // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
 // `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
 // `docs/decisions.jsonl` row or a `TEST EXCEPTION`: only the owner's words do. Ship lists the
@@ -81,12 +86,15 @@ export function parseDecisionItems(text) {
         .map((part) => {
         const head = /^\*\*Q(\d+) — (.+?):\*\*/.exec(part);
         const rec = lineOf(part, "Recommended");
-        const none = /^No recommendation\b/m.test(part);
         const [option, ...why] = (rec ?? "").split(" — ");
-        const options = (lineOf(part, "Options") ?? "")
-            .split(" / ")
-            .map((o) => bareName(o.trim()))
-            .filter(Boolean);
+        const none = /^No recommendation\b/m.test(part) || /^none$/i.test((option ?? "").trim());
+        const perLine = [...part.matchAll(/^[A-Z]\)[ \t]+(.+?)[ \t]*$/gm)].map((m) => (m[1] ?? "").split(" — ")[0].trim());
+        const options = perLine.length > 0
+            ? perLine.filter(Boolean)
+            : (lineOf(part, "Options") ?? "")
+                .split(" / ")
+                .map((o) => bareName(o.trim()))
+                .filter(Boolean);
         const answer = lineOf(part, "Decision");
         const decision = answer === null ? null : optionAnswer(answer, options);
         return {
@@ -213,23 +221,55 @@ function readBaseCheck(file) {
         adopt,
     };
 }
+/** The effect a bare fixed option name gets. */
+const FIXED_EFFECTS = {
+    Accept: "the item is recorded as accepted and the build moves on",
+    "Fix now": "one more fix round runs before the build moves on",
+    Stop: "the run ends here with a handover; the next run resumes here",
+    "Try again": "one more fix round runs",
+    Decide: "the questions below are asked instead of another round",
+};
 function composeItems(raw) {
     if (!Array.isArray(raw))
         throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
     return raw.map((r, i) => {
         const o = (r ?? {});
         const s = (k) => typeof o[k] === "string" ? o[k].replace(/[\r\n]+/g, " ").trim() : "";
-        const options = Array.isArray(o.options) ? o.options.filter((x) => typeof x === "string") : [];
-        if (s("title") === "" || s("question") === "" || options.length === 0)
+        const rawOptions = Array.isArray(o.options) ? o.options : [];
+        if (s("title") === "" || s("question") === "" || rawOptions.length === 0)
             throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
-        if (options.length > MAX_OPTIONS)
+        if (rawOptions.length > MAX_OPTIONS)
             throw new CommandError(EXIT.USAGE, `item ${i + 1}: at most ${MAX_OPTIONS} options (A-Z)`);
-        if (s("noRecommendation") === "" && !options.includes(s("recommended")))
+        const options = rawOptions.map((x, k) => {
+            const bad = () => new CommandError(EXIT.USAGE, `item ${i + 1} (Q${i + 1}): option ${letterAt(k)} needs a name and an effect`);
+            let name;
+            let effect;
+            if (typeof x === "string") {
+                name = x.trim();
+                const fixed = FIXED_EFFECTS[name];
+                if (fixed === undefined)
+                    throw bad();
+                effect = fixed;
+            }
+            else {
+                const ob = (x ?? {});
+                if (typeof ob.name !== "string" || typeof ob.effect !== "string")
+                    throw bad();
+                name = ob.name.replace(/[\r\n]+/g, " ").trim();
+                effect = ob.effect.replace(/[\r\n]+/g, " ").trim();
+                if (name === "" || effect === "")
+                    throw bad();
+            }
+            if (name.includes("—"))
+                throw new CommandError(EXIT.USAGE, `item ${i + 1} (Q${i + 1}): option name "${name}" must not contain a dash (—); put it in the effect`);
+            return { name, effect };
+        });
+        if (s("noRecommendation") === "" && !options.some((x) => x.name === s("recommended")))
             throw new CommandError(EXIT.USAGE, `item ${i + 1}: recommended must be one of its options, or set noRecommendation`);
         return {
             title: s("title"),
             question: s("question"),
-            options: options,
+            options,
             recommended: s("recommended"),
             reason: s("reason"),
             noRecommendation: s("noRecommendation"),
@@ -238,15 +278,20 @@ function composeItems(raw) {
 }
 const itemLines = (n, it) => {
     const rec = it.recommended ?? "";
-    const letter = letterOf(it.options, rec);
+    const names = it.options.map((o) => o.name);
+    const letter = letterOf(names, rec);
     return [
         `**Q${n} — ${it.title}:** ${it.question}`,
-        `Options: ${letteredOptions(it.options)}`,
+        ...it.options.map((o, i) => `${letterAt(i)}) ${o.name} — ${o.effect}`),
         it.noRecommendation
-            ? `No recommendation — ${it.noRecommendation}`
+            ? `Recommended: none — ${it.noRecommendation}`
             : `Recommended: ${letter === null ? rec : `${letter}) ${rec}`} — ${it.reason || "the orchestrator's call"}`,
+        it.noRecommendation || letter === null
+            ? "Default if unanswered: the run waits for you; the run stops when nobody can be asked"
+            : `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
     ];
 };
+const fixed = (name) => ({ name, effect: FIXED_EFFECTS[name] });
 // ---------------------------------------------------------------------------
 // apply
 // ---------------------------------------------------------------------------
@@ -340,7 +385,7 @@ export const decisionsCommand = {
                 {
                     name: "items",
                     type: "string",
-                    help: "JSON file: [{title, question, options, recommended, reason} | {…, noRecommendation}]",
+                    help: "JSON file: [{title, question, options: [{name, effect}], recommended, reason} | {…, noRecommendation}]",
                 },
                 {
                     name: "loop",
@@ -437,7 +482,9 @@ export const decisionsCommand = {
                         question: loopRecommended === "Try again"
                             ? `another fix round? ${p.trendLine}`
                             : `decide the items below instead of another round? ${p.trendLine}`,
-                        options: items.length > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
+                        options: items.length > 0
+                            ? [fixed("Try again"), fixed("Decide")]
+                            : [fixed("Try again"), fixed("Stop")],
                         recommended: items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
                         reason,
                     }), "");
@@ -446,7 +493,11 @@ export const decisionsCommand = {
                 }
                 const first = loopName === undefined ? 1 : 2;
                 items.forEach((it, i) => lines.push(...itemLines(first + i, it), ""));
-                lines.push('Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.', "");
+                const questionCount = items.length + (loopName === undefined ? 0 : 1);
+                lines.push('Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.');
+                if (questionCount >= 3)
+                    lines.push('Or say "one by one" and I\'ll ask them one at a time.');
+                lines.push("");
                 fs.mkdirSync(path.dirname(out), { recursive: true });
                 fs.writeFileSync(out, lines.join("\n"), "utf-8");
                 ctx.emit({
