diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 67265c365..056c092d6 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -926,6 +926,64 @@ describe("bkit decisions apply --by=owner and pending", () => {
     expect(items[0]!.recommended).toBe("Accept");
   });
 
+  /** An old per-line file with two assumed Accepts, and the confirm of Q1. */
+  async function oldTwoAssumed() {
+    const { root, logs } = checkout();
+    const out = path.join(logs, "build-decision-1-1.md");
+    const item = (n: number, title: string) => [
+      `**Q${n} — ${title}:** MEDIUM: the retry has no cap. Accept it?`,
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: A) Accept — the caller already caps it",
+      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+      "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
+      "",
+    ];
+    fs.writeFileSync(
+      out,
+      [
+        "Status: ASSUMED",
+        "",
+        ...item(1, "Task 3 [src/a.ts:10]"),
+        ...item(2, "Task 6 [src/d.ts:4]"),
+      ].join("\n"),
+    );
+    seedStatus(logs);
+    const fineFile = path.join(logs, "fine.md");
+    fs.writeFileSync(fineFile, "fine\n");
+    const owner = (q: string) =>
+      run(
+        [
+          "decisions",
+          "apply",
+          "--by=owner",
+          `--file=${out}`,
+          `--q=${q}`,
+          "--confirm",
+          `--reason-file=${fineFile}`,
+        ],
+        root,
+      );
+    return { root, out, owner };
+  }
+
+  it("confirming Q1 of an old per-line file with two assumed Accepts leaves Q2 confirmable", async () => {
+    const { owner } = await oldTwoAssumed();
+    expect((await owner("1")).code).toBe(0);
+    const second = await owner("2");
+    expect(second.code).toBe(0);
+    expect(second.json.decisionKey).toBe("7-x-accepted-task-6-src-d-ts-4");
+  });
+
+  it("pending lists the second assumed Accept of an old per-line file after the first is confirmed", async () => {
+    const { root, owner } = await oldTwoAssumed();
+    expect((await owner("1")).code).toBe(0);
+    const r = await pending(root);
+    expect(r.code).toBe(0);
+    expect(r.json.count).toBe(1);
+    expect(r.json.items[0]).toMatchObject({ q: 2, state: "pending" });
+  });
+
   it("refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject", async () => {
     const { root, out } = await assumed();
     const why = path.join(path.dirname(out), "why.md");
diff --git a/.bkit/core/engine/commands/workflow/open-decision.test.ts b/.bkit/core/engine/commands/workflow/open-decision.test.ts
index 150aa81aa..315010db5 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.test.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.test.ts
@@ -288,6 +288,13 @@ describe("skipProblem", () => {
     );
   });
 
+  it("an old file keeps its Source changed header after a row names it", () => {
+    const { read, rel } = rowDir(oldFile({ q2: "Accept — the id is above" }), [
+      answerRow(1, "Accept — the owner confirmed it"),
+    ]);
+    expect(skipProblem(read, rel)).toBeNull();
+  });
+
   it("is null when all five conditions hold", () => {
     expect(skipProblem(pause({ headers: SETTLED, loop: "B" }))).toBeNull();
     expect(skipProblem(pause({ headers: SETTLED }))).toBeNull();
@@ -313,7 +320,42 @@ describe("skipProblem", () => {
   });
 });
 
+/** An old verify decision file: its Status, From, Group and Source changed headers, then Q1 and Q2 each decided in the file. */
+const oldFile = (o: { q1?: string | null; q2?: string | null } = {}) =>
+  [
+    "Question: CHALLENGE",
+    "Status: DECIDED",
+    "From: verify",
+    "Group: 1",
+    "Source changed: false",
+    "",
+    "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+    "A) Accept — the item is recorded as accepted",
+    "B) Fix now — a fix task is added to the plan",
+    "Recommended: A) Accept — the caller already caps it",
+    ...(o.q1 === null ? [] : [`Decision: ${o.q1 ?? "Accept (assumed) — the caller caps it"}`]),
+    "",
+    "**Q2 — Task 4 [src/b.ts:20]:** MEDIUM: the log line has no id. Accept it?",
+    "A) Accept — the item is recorded as accepted",
+    "B) Fix now — a fix task is added to the plan",
+    "Recommended: A) Accept — the id is in the line above",
+    ...(o.q2 === null ? [] : [`Decision: ${o.q2 ?? "Accept (assumed) — the id is above"}`]),
+    "",
+  ].join("\n");
+
 describe("decision rows", () => {
+  it("an old file keeps the in-file answers of questions no row names", () => {
+    const { read, rel } = rowDir(oldFile(), [
+      answerRow(1, "Accept — the owner confirmed it", { by: "owner" }),
+    ]);
+    const items = decisionItems(read, rel);
+    const q1 = items.find((i) => i.n === 1)!;
+    const q2 = items.find((i) => i.n === 2)!;
+    expect(q1.decision).toBe("Accept — the owner confirmed it");
+    expect(q2.decision).toBe("Accept (assumed) — the id is above");
+    expect(q2.assumed).toBe(true);
+  });
+
   it("the row appended last wins even when its at is earlier", () => {
     const { read, rel } = rowDir(orchestratorFile(), [
       countsRow(),
diff --git a/.bkit/core/engine/commands/workflow/open-decision.ts b/.bkit/core/engine/commands/workflow/open-decision.ts
index 91a05c5ff..e457d890f 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.ts
@@ -178,15 +178,20 @@ function foldDecision(read: ReadText, rel: string, answersOf?: string, textOnly
     return { items: own, header, hasLoop: hasProgress(text) };
   }
   const counts = lastOf<DecisionCountsRow>(rows, "decision-counts");
-  const items: DecisionItem[] = own.map((i) => ({
-    ...i,
-    decision: null,
-    fixTask: null,
-    assumed: false,
-    rejected: false,
-    deferred: false,
-    by: null,
-  }));
+  const old = hasEngineLines(header);
+  const items: DecisionItem[] = own.map((i) =>
+    old
+      ? i
+      : {
+          ...i,
+          decision: null,
+          fixTask: null,
+          assumed: false,
+          rejected: false,
+          deferred: false,
+          by: null,
+        },
+  );
   const loop = counts?.loop;
   if (loop !== undefined && !items.some((i) => i.n === 1)) {
     items.push({
@@ -224,10 +229,10 @@ function foldDecision(read: ReadText, rel: string, answersOf?: string, textOnly
     };
   });
   const out = { ...header };
-  for (const k of ["Status", "Source changed", "Gate"]) delete out[k];
+  if (!old) for (const k of ["Status", "Source changed", "Gate"]) delete out[k];
   if (counts?.sourceChanged !== undefined) out["Source changed"] = String(counts.sourceChanged);
   if (counts?.gate !== undefined) out.Gate = counts.gate;
-  return { items: folded, header: out, hasLoop: loop !== undefined };
+  return { items: folded, header: out, hasLoop: loop !== undefined || (old && hasProgress(text)) };
 }
 
 /** Whether a file's text before its first item holds the `## Progress` block. */
@@ -237,8 +242,8 @@ const hasProgress = (text: string | null | undefined): boolean =>
 /**
  * The items of the decision file `rel`: its questions, the loop question `Q1` from the last
  * `decision-counts` row, each answer from the row appended last for its question. `read` returns
- * a path's text, or null when the file is absent. An old file (no row names it, its header has a
- * `Status` line) is read as written. `answersOf` keeps only that
+ * a path's text, or null when the file is absent. An old file (its header has a `Status` line) is the base: its in-file
+ * answers stand, and a row overrides only the question it names. `answersOf` keeps only that
  * workflow's answer rows.
  */
 export function decisionItems(read: ReadText, rel: string, answersOf?: string): DecisionItem[] {
@@ -264,7 +269,7 @@ export function statusOf(items: DecisionItem[]): "OPEN" | "ASSUMED" | "DECIDED"
 }
 
 /**
- * The `Status` of a pause: an old file (no row names it) that carries a written `Status:` line
+ * The `Status` of a pause: an old file that carries a written `Status:` line
  * is read as written; otherwise the status its folded items leave it in.
  */
 export function pauseStatus(source: DecisionSource, rel?: string): string {
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index be258e4fd..655606c79 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -1011,6 +1011,106 @@ describe("bkit workflows fail", () => {
     }
   });
 
+  it("redacts token-shaped values that no environment variable holds from the error and stderr files", async () => {
+    const cwd = repo();
+    const bearer = ["fakeBearer", "Value", "0123456789abcdef"].join("");
+    const pemBody = ["MIIFakeKeyBody", "LineOne0123456789", "LineTwoABCDEFGHIJ"].join("");
+    const ghp = ["ghp", "_", "fakeGithubTokenValue", "1234567890"].join("");
+    const body = [
+      `curl failed: Authorization: Bearer ${bearer}`,
+      "-----BEGIN RSA PRIVATE KEY-----",
+      pemBody,
+      "-----END RSA PRIVATE KEY-----",
+      `read from .env: ${ghp}`,
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
+      expect(text, f).not.toContain(bearer);
+      expect(text, f).not.toContain(pemBody);
+      expect(text, f).not.toContain(ghp);
+      expect(text, f).toContain("<redacted>");
+    }
+  });
+
+  it("redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files", async () => {
+    const cwd = repo();
+    const values: Record<string, string> = {
+      BKIT_TEST_SERVICE_ROLE_KEY: ["fakeServiceRole", "Value", "98765"].join(""),
+      BKIT_TEST_SMTP_PASS: ["fakeSmtp", "Pass", "Value4321"].join(""),
+      BKIT_TEST_ALERT_WEBHOOK_URL: `https://hooks.example.test/services/${["T0FAKE", "B0FAKE", "xyz123"].join("/")}`,
+    };
+    const before = Object.fromEntries(Object.keys(values).map((k) => [k, process.env[k]]));
+    for (const [k, v] of Object.entries(values)) process.env[k] = v;
+    try {
+      const body = `${Object.values(values)
+        .map((v) => `failed with ${v}`)
+        .join("\n")}\n`;
+      write(cwd, "tmp/error.md", body);
+      write(cwd, "tmp/stderr.md", body);
+      const r = await run(
+        cwd,
+        wf(
+          "fail",
+          "build",
+          "--step-number=14",
+          "--step-title=Run Tests",
+          "--error-file=tmp/error.md",
+          "--stderr-file=tmp/stderr.md",
+        ),
+      );
+      expect(r.code).toBe(0);
+      for (const f of ["tmp/error.md", "tmp/stderr.md"]) {
+        const text = fs.readFileSync(path.join(cwd, f), "utf8");
+        for (const [k, v] of Object.entries(values)) {
+          expect(text, `${f} ${k}`).not.toContain(v);
+          expect(text, `${f} ${k}`).toContain(`<${k}>`);
+        }
+      }
+    } finally {
+      for (const [k, v] of Object.entries(before)) restoreEnvironment(k, v);
+    }
+  });
+
+  it("redacts the password of a URL with an empty user name from the error and stderr files", async () => {
+    const cwd = repo();
+    const password = ["fakeRedis", "Passw0rd", "Value"].join("");
+    const body = `connect failed: redis://:${password}@cache:6379/0\n`;
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
+      expect(text, f).not.toContain(password);
+      expect(text, f).toContain("redis://:<redacted>@cache:6379/0");
+    }
+  });
+
   it("writes the stderr file with the checkout path made relative and the home directory as ~", async () => {
     const cwd = repo();
     const home = os.homedir();
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index b3792257f..3af9044a8 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -353,8 +353,17 @@ const EXIT_NEXT_STEP_REFUSED = 6;
  */
 const NEXT_STEP_SHAPE = /^\/bkit-[a-z0-9-]+(?: [#A-Za-z0-9._-]+)*$/;
 
-const CREDENTIAL_NAME = /TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL/i;
-const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i;
+const CREDENTIAL_NAME =
+  /TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL|WEBHOOK|SESSION|(?:KEY|PASS|AUTH|PAT)$|PWD$/i;
+const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]*:[^\s/@]+@/i;
+
+/** Token-shaped values scrubbed whatever the environment holds. */
+const TOKEN_SHAPES: Array<[RegExp, string]> = [
+  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "<redacted>"],
+  [/(Authorization:\s*(?:Bearer|Basic)\s+)[^\s"']+/gi, "$1<redacted>"],
+  [/\b((?:access_)?token=)(?!<)[^\s&"']+/gi, "$1<redacted>"],
+  [/\b(?:gh[pos]_|github_pat_|glpat-|xox[abpr]-|sk-|AKIA)[A-Za-z0-9_-]{8,}/g, "<redacted>"],
+];
 
 /** Credentials, URL passwords and local account paths replaced in `input`. */
 function scrubSecrets(input: string, cwd: string): string {
@@ -363,13 +372,15 @@ function scrubSecrets(input: string, cwd: string): string {
   for (const [name, value] of Object.entries(process.env)) {
     if (value === undefined || value.length < 4) continue;
     const marked =
-      CREDENTIAL_NAME.test(name) || (/(?:_URL|DSN)$/i.test(name) && URL_PASSWORD.test(value));
+      (CREDENTIAL_NAME.test(name) && !/^(?:OLD)?PWD$/i.test(name)) ||
+      (/(?:_URL|DSN)$/i.test(name) && URL_PASSWORD.test(value));
     if (marked) values.push([name, value]);
   }
   // Longest value first, so a value holding another is replaced whole.
   values.sort((x, y) => y[1].length - x[1].length);
   for (const [name, value] of values) text = text.split(value).join(`<${name}>`);
-  text = text.replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:)[^\s/@]+(@)/gi, "$1<redacted>$2");
+  text = text.replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]*:)[^\s/@]+(@)/gi, "$1<redacted>$2");
+  for (const [re, to] of TOKEN_SHAPES) text = text.replace(re, to);
   const roots = new Set<string>();
   for (const base of [repoRoot(cwd), cwd]) {
     roots.add(base);
diff --git a/dist/commands/workflow/open-decision.js b/dist/commands/workflow/open-decision.js
index ea0650d7f..3b7d677d9 100644
--- a/dist/commands/workflow/open-decision.js
+++ b/dist/commands/workflow/open-decision.js
@@ -123,15 +123,18 @@ function foldDecision(read, rel, answersOf, textOnly = false) {
         return { items: own, header, hasLoop: hasProgress(text) };
     }
     const counts = lastOf(rows, "decision-counts");
-    const items = own.map((i) => ({
-        ...i,
-        decision: null,
-        fixTask: null,
-        assumed: false,
-        rejected: false,
-        deferred: false,
-        by: null,
-    }));
+    const old = hasEngineLines(header);
+    const items = own.map((i) => old
+        ? i
+        : {
+            ...i,
+            decision: null,
+            fixTask: null,
+            assumed: false,
+            rejected: false,
+            deferred: false,
+            by: null,
+        });
     const loop = counts?.loop;
     if (loop !== undefined && !items.some((i) => i.n === 1)) {
         items.push({
@@ -169,21 +172,22 @@ function foldDecision(read, rel, answersOf, textOnly = false) {
         };
     });
     const out = { ...header };
-    for (const k of ["Status", "Source changed", "Gate"])
-        delete out[k];
+    if (!old)
+        for (const k of ["Status", "Source changed", "Gate"])
+            delete out[k];
     if (counts?.sourceChanged !== undefined)
         out["Source changed"] = String(counts.sourceChanged);
     if (counts?.gate !== undefined)
         out.Gate = counts.gate;
-    return { items: folded, header: out, hasLoop: loop !== undefined };
+    return { items: folded, header: out, hasLoop: loop !== undefined || (old && hasProgress(text)) };
 }
 /** Whether a file's text before its first item holds the `## Progress` block. */
 const hasProgress = (text) => text != null && /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
 /**
  * The items of the decision file `rel`: its questions, the loop question `Q1` from the last
  * `decision-counts` row, each answer from the row appended last for its question. `read` returns
- * a path's text, or null when the file is absent. An old file (no row names it, its header has a
- * `Status` line) is read as written. `answersOf` keeps only that
+ * a path's text, or null when the file is absent. An old file (its header has a `Status` line) is the base: its in-file
+ * answers stand, and a row overrides only the question it names. `answersOf` keeps only that
  * workflow's answer rows.
  */
 export function decisionItems(read, rel, answersOf) {
@@ -208,7 +212,7 @@ export function statusOf(items) {
     return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
 }
 /**
- * The `Status` of a pause: an old file (no row names it) that carries a written `Status:` line
+ * The `Status` of a pause: an old file that carries a written `Status:` line
  * is read as written; otherwise the status its folded items leave it in.
  */
 export function pauseStatus(source, rel) {
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index c44e26e16..13d5de601 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -205,8 +205,15 @@ const EXIT_NEXT_STEP_REFUSED = 6;
  * failure comment, so nothing that could end the span or start markdown or HTML gets through.
  */
 const NEXT_STEP_SHAPE = /^\/bkit-[a-z0-9-]+(?: [#A-Za-z0-9._-]+)*$/;
-const CREDENTIAL_NAME = /TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL/i;
-const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i;
+const CREDENTIAL_NAME = /TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL|WEBHOOK|SESSION|(?:KEY|PASS|AUTH|PAT)$|PWD$/i;
+const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]*:[^\s/@]+@/i;
+/** Token-shaped values scrubbed whatever the environment holds. */
+const TOKEN_SHAPES = [
+    [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "<redacted>"],
+    [/(Authorization:\s*(?:Bearer|Basic)\s+)[^\s"']+/gi, "$1<redacted>"],
+    [/\b((?:access_)?token=)(?!<)[^\s&"']+/gi, "$1<redacted>"],
+    [/\b(?:gh[pos]_|github_pat_|glpat-|xox[abpr]-|sk-|AKIA)[A-Za-z0-9_-]{8,}/g, "<redacted>"],
+];
 /** Credentials, URL passwords and local account paths replaced in `input`. */
 function scrubSecrets(input, cwd) {
     let text = input;
@@ -214,7 +221,8 @@ function scrubSecrets(input, cwd) {
     for (const [name, value] of Object.entries(process.env)) {
         if (value === undefined || value.length < 4)
             continue;
-        const marked = CREDENTIAL_NAME.test(name) || (/(?:_URL|DSN)$/i.test(name) && URL_PASSWORD.test(value));
+        const marked = (CREDENTIAL_NAME.test(name) && !/^(?:OLD)?PWD$/i.test(name)) ||
+            (/(?:_URL|DSN)$/i.test(name) && URL_PASSWORD.test(value));
         if (marked)
             values.push([name, value]);
     }
@@ -222,7 +230,9 @@ function scrubSecrets(input, cwd) {
     values.sort((x, y) => y[1].length - x[1].length);
     for (const [name, value] of values)
         text = text.split(value).join(`<${name}>`);
-    text = text.replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:)[^\s/@]+(@)/gi, "$1<redacted>$2");
+    text = text.replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]*:)[^\s/@]+(@)/gi, "$1<redacted>$2");
+    for (const [re, to] of TOKEN_SHAPES)
+        text = text.replace(re, to);
     const roots = new Set();
     for (const base of [repoRoot(cwd), cwd]) {
         roots.add(base);
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 263b8f29e..bc525046d 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -531,3 +531,5 @@
 {"schema":3,"ts":1795028972160,"firstTs":1795028972160,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-664","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A multi-line owner reason passed to decisions apply --by=owner --answer writes its extra lines raw into the engine file, whose Decision: lines win the merge, so a reason holding a **Q2 — ...:** line and a Decision: Accept line accepts Q2 without the owner answering it","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/decisions.ts:664: A multi-line owner reason passed to decisions apply --by=owner --answer writes its extra lines raw into the engine file, whose Decision: lines win the merge, so a reason holding a **Q2 — ...:** line and a Decision: Accept line accepts Q2 without the owner answering it. Done when: Every `--by=owner` path (`--answer`, `--confirm`, `--reject`) folds `--reason` to one line (or refuses `\\r` and `\\n`) before it writes a `Decision:` line, so each call adds exactly one line to the engine file and `mergeItems` reads no question the call did not name.","source":".bkit/core/engine/commands/workflow/decisions.ts:664","status":"OPEN"}
 {"schema":3,"ts":1795035554374,"firstTs":1795035554374,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-open-decision-ts-183","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A run that stops after the orchestrator wrote a decision file with no parseable question (and before `decisions check` passed) resumes it as a settled pause: `statusOf([])` reads `DECIDED`, `openDecision` reopens it, and `decisions apply --by=headless` exits 0 with nothing applied, so a CHALLENGE pause's hard blockers are never asked","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/open-decision.ts:183: A run that stops after the orchestrator wrote a decision file with no parseable question (and before `decisions check` passed) resumes it as a settled pause: `statusOf([])` reads `DECIDED`, `openDecision` reopens it, and `decisions apply --by=headless` exits 0 with nothing applied, so a CHALLENGE pause's hard blockers are never asked. Done when: A pause whose merged items are empty never reads as settled: `statusOf` returns `OPEN` for an empty item list, so `openDecision` reports such a file as `OPEN`, and `decisions apply --by=headless` exits non-zero on a pause with no parseable question instead of exit 0 with `applied` empty.","source":".bkit/core/engine/commands/workflow/open-decision.ts:183","status":"OPEN"}
 {"schema":3,"ts":1795035554375,"firstTs":1795035554375,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-168","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A remediate agent's `BLOCKED` reason (or a challenge finding) shaped by an injected log carries a line `Decision: Accept — looks fine`; the orchestrator pastes it into a question at Decision Pause step 2, `decisions check` passes the file, and the pause reads that item as answered, so the owner is never asked, `decisions skip` and `tasks tick` read Accept and the acceptance is recorded as the owner's. The replaced `decisions compose` folded every item field through `oneLine`, so no pasted text could answer a question","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/decisions.ts:168: A remediate agent's `BLOCKED` reason (or a challenge finding) shaped by an injected log carries a line `Decision: Accept — looks fine`; the orchestrator pastes it into a question at Decision Pause step 2, `decisions check` passes the file, and the pause reads that item as answered, so the owner is never asked, `decisions skip` and `tasks tick` read Accept and the acceptance is recorded as the owner's. The replaced `decisions compose` folded every item field through `oneLine`, so no pasted text could answer a question. Done when: `itemProblem` makes `decisions check` exit 6, naming the question, when any item of the orchestrator's file holds a line that starts `Decision:`, `Fix task:`, `Rejected:` or `Deferred:`. Check runs only at Decision Pause step 2, before any answer exists, so only the owner's step-6 answers and the engine write those lines.","source":".bkit/core/engine/commands/workflow/decisions.ts:168","status":"OPEN"}
+{"schema":3,"ts":1795088869277,"firstTs":1795088869277,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1123","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A verify report that quotes a line ending Fixable: true inside a code fence under its gaps log is refused although its header is right, and the re-asked agent can only pass by inflating Failures and Fixable","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1123: A verify report that quotes a line ending Fixable: true inside a code fence under its gaps log is refused although its header is right, and the re-asked agent can only pass by inflating Failures and Fixable. Done when: fixableLines reads the gaps-log body through unfencedLines, as the items rule already does, so a fenced line never counts as a gap line or flips the Fixable check; the test below passes and every existing bkit steps finish test still passes","source":".bkit/core/engine/commands/workflow/steps.ts:1123","status":"OPEN"}
+{"schema":3,"ts":1795088869278,"firstTs":1795088869278,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1244","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A run stops after the Failure Path writes `{LOG_DIR}/{workflow}-stderr.md` but before `workflows fail` rewrites it (session crash or interrupt, or a `workflows fail` usage error thrown before `workflows.ts:421`); the only scrub is in `failVerb`, and the next run's bookkeeping commit stages the whole log folder (`ledgers.ts:124`), so the raw stderr lands in git history","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1244: A run stops after the Failure Path writes `{LOG_DIR}/{workflow}-stderr.md` but before `workflows fail` rewrites it (session crash or interrupt, or a `workflows fail` usage error thrown before `workflows.ts:421`); the only scrub is in `failVerb`, and the next run's bookkeeping commit stages the whole log folder (`ledgers.ts:124`), so the raw stderr lands in git history. Done when: `commitBookkeeping` scrubs every `*-error.md` and `*-stderr.md` in the run's log folder with the same `scrubSecrets` rules before it stages them (the scrubber moves to a module both `workflows.ts` and `ledgers.ts` import), so no engine commit carries an unscrubbed failure file.","source":".bkit/core/engine/commands/workflow/ledgers.ts:1244","status":"OPEN"}
