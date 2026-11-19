diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 83c8047b3..5b3ee4388 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -193,7 +193,7 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index c533cacfe..fd8fd6f0c 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -193,7 +193,7 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index b432503e2..20a1555a8 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -1010,6 +1010,30 @@ describe("bkit decisions check", () => {
     }
   });
 
+  it("refuses a decision file whose question count no longer matches the engine file's loop options", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
+    fs.writeFileSync(
+      engineOf(file),
+      [
+        "Source changed: false",
+        "",
+        "build verify: attempt 2 of 2",
+        "",
+        "## Progress",
+        "",
+        "**Q1 \u2014 Verify:** another fix round, or stop here?",
+        "A) Try again \u2014 one more fix round runs",
+        "B) Stop \u2014 the run ends here with a handover; the next run resumes here",
+        "Recommended: B) Stop \u2014 no question is left to decide",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("decisions counts");
+  });
+
   it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
     const { root, logs } = checkout();
     const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 7d9476cc3..ce2c29b08 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -177,6 +177,14 @@ export function itemProblem(text: string, engineText: string | null): string | n
     return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}"; write an em dash (—) after the number`;
   if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
     return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the engine file holds no loop question)';
+  if (engineHasLoop) {
+    // The loop question was built for the question count `decisions counts` saw.
+    const own = text.split(ITEM_SPLIT).length - 1;
+    const offersStop = /^B\)[ \t]+Stop\b/m.test(engineText ?? "");
+    const offersDecide = /^B\)[ \t]+Decide\b/m.test(engineText ?? "");
+    if ((own > 0 && offersStop) || (own === 0 && offersDecide))
+      return "the engine file's loop question was built for a different question count; re-run `decisions counts` with the same flags, then check again";
+  }
   for (const part of text.split(ITEM_SPLIT).slice(1)) {
     const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
     const q = `Q${n}`;
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index ad8d0c3cd..9f0782b12 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -976,6 +976,68 @@ describe("bkit workflows fail", () => {
     }
   });
 
+  it("redacts credentials beyond the tracker keys from the error and stderr files", async () => {
+    const cwd = repo();
+    const token = "svc_fakeTokenValue9876543210";
+    const password = "fakePassw0rdValue";
+    const before = process.env["BKIT_TEST_SERVICE_TOKEN"];
+    process.env["BKIT_TEST_SERVICE_TOKEN"] = token;
+    try {
+      const body = `migration failed: ${token} at postgres://app:${password}@db/app\n`;
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
+        expect(text, f).not.toContain(token);
+        expect(text, f).not.toContain(password);
+        expect(text, f).toContain("<BKIT_TEST_SERVICE_TOKEN>");
+        expect(text, f).toContain("<redacted>");
+      }
+    } finally {
+      restoreEnvironment("BKIT_TEST_SERVICE_TOKEN", before);
+    }
+  });
+
+  it("writes the stderr file with the checkout path made relative and the home directory as ~", async () => {
+    const cwd = repo();
+    const home = os.homedir();
+    write(
+      cwd,
+      "tmp/stderr.md",
+      [`Error at ${cwd}/src/a.ts:10`, `    at load (${home}/.cache/tool/index.js:3)`, ""].join(
+        "\n",
+      ),
+    );
+    const r = await run(
+      cwd,
+      wf(
+        "fail",
+        "build",
+        "--step-number=14",
+        "--step-title=Run Tests",
+        "--stderr-file=tmp/stderr.md",
+      ),
+    );
+    expect(r.code).toBe(0);
+    const text = fs.readFileSync(path.join(cwd, "tmp/stderr.md"), "utf8");
+    expect(text).not.toContain(cwd);
+    expect(text).not.toContain(home);
+    expect(text).toContain("src/a.ts:10");
+    expect(text).toContain("~/.cache/tool/index.js:3");
+  });
+
   it("prints the failure comment from --error-file, naming a lock it could not remove", async () => {
     const cwd = repo();
     write(cwd, "tmp/error.md", "tests failed: 3\n\n");
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index d79d10873..6a330fe97 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -357,6 +357,40 @@ const NEXT_STEP_SHAPE = /^\/bkit-[a-z0-9-]+(?: [#A-Za-z0-9._-]+)*$/;
  * Rewrite the failure's error and stderr files in place before any commit or comment: configured
  * secret values become `<NAME>`, and the stderr file keeps its last 20 lines (what the comment posts).
  */
+const CREDENTIAL_NAME = /TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL/i;
+const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i;
+
+/** Credentials, URL passwords and local account paths replaced in `input`. */
+function scrubSecrets(input: string, cwd: string): string {
+  let text = input;
+  const values: Array<[string, string]> = [];
+  for (const [name, value] of Object.entries(process.env)) {
+    if (value === undefined || value.length < 4) continue;
+    const marked =
+      CREDENTIAL_NAME.test(name) || (/(?:_URL|DSN)$/i.test(name) && URL_PASSWORD.test(value));
+    if (marked) values.push([name, value]);
+  }
+  // Longest value first, so a value holding another is replaced whole.
+  values.sort((x, y) => y[1].length - x[1].length);
+  for (const [name, value] of values) text = text.split(value).join(`<${name}>`);
+  text = text.replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:)[^\s/@]+(@)/gi, "$1<redacted>$2");
+  const roots = new Set<string>();
+  for (const base of [repoRoot(cwd), cwd]) {
+    roots.add(base);
+    try {
+      roots.add(fs.realpathSync(base));
+    } catch {
+      // A missing directory has no real path.
+    }
+  }
+  for (const r of [...roots].sort((x, y) => y.length - x.length)) {
+    if (r.length > 1) text = text.split(`${r}/`).join("").split(r).join(".");
+  }
+  const home = os.homedir();
+  if (home.length > 1) text = text.split(home).join("~");
+  return text;
+}
+
 function scrubFailureFiles(cwd: string, errorFile?: string, stderrFile?: string): void {
   for (const [rel, keep] of [
     [errorFile, false],
@@ -365,7 +399,7 @@ function scrubFailureFiles(cwd: string, errorFile?: string, stderrFile?: string)
     if (rel === undefined || rel === "") continue;
     const abs = path.resolve(cwd, rel);
     if (!fs.existsSync(abs)) continue;
-    let text = redact(fs.readFileSync(abs, "utf-8"));
+    let text = scrubSecrets(redact(fs.readFileSync(abs, "utf-8")), cwd);
     if (keep) {
       const lines = text.replace(/\n+$/, "").split("\n");
       text = `${lines.slice(-20).join("\n")}\n`;
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 991b584c4..bfa785372 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -184,7 +184,7 @@ _No tracker connected, skip step._
    "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 025ba0298..08f5ba71b 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -211,7 +211,7 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 8315768b5..ef7e89596 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10156,7 +10156,7 @@ Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tes
 One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
 Offer only the file's options for each question; NEVER add one.
 **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
-**If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+**If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 **If** exit 4 **and** `RUNTIME_HEADLESS` = true → **Failure Path** naming each printed `hardBlockers` question.
 **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
 Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
diff --git a/.bkit/version b/.bkit/version
index 9b16b2ec3..36186f0fe 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -12,7 +12,7 @@
     ".bkit/.env.example": "6bf0e90fae894711f951811a122424eb8eaec00bcc0c0bfdafcc2750927b4daf",
     ".opencode/opencode.json": "37a299e11dd7e9d28fd3a212fdf3ac990ba656998263d47731285d30192f0397",
     ".claude/commands/bkit-auto.md": "023c394a82a09e02bd7cc28affba340720bfc193807366b1d560e189d542b560",
-    ".claude/commands/bkit-build.md": "13b0c603a35829f3035b99a6dd7b164e88f857c8f4972c0e4d5a8b286dc3dcee",
+    ".claude/commands/bkit-build.md": "ec6e058029a79451a372ef359742a99a8a944dd543f6bd9ca77e3b75c84aca08",
     ".claude/commands/bkit-debug.md": "0a808196dd61fdbcca0252ad6b1c9b4a8e1581e7cce38f21f130b80f83be1ef9",
     ".claude/commands/bkit-design.md": "48f04d5ec7015ba1a03f7b4664316207db87a2183359d9f6476f74bc1fcef8da",
     ".claude/commands/bkit-plan.md": "55167e19e60a97557c514dd348a42282e4b9cab710442480b689af33ba2b3a06",
@@ -44,7 +44,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "73709aceb5e80f5715a0dcba275f07ed3edb84fe02950230b6632fcfc18c4890",
     ".claude/agents/bkit-utility-update-documentation.md": "5006f0bf8be7ca10d048fa6050e2f71dc9b82c445c150b0bd64e8884d4bf6897",
     ".cursor/commands/bkit-auto.md": "215bd415eed342587ed2af5c15de381cf58831f461ff8d7bcea76cb0dfd88728",
-    ".cursor/commands/bkit-build.md": "ed471360c5cd1c4484604ca08a79b5f51f4920c79340fa51b86b57e7b9d3770d",
+    ".cursor/commands/bkit-build.md": "f10874d569bdbe5976e59509c3426aaf3512f6274c407d4571ca66b1bdc79da2",
     ".cursor/commands/bkit-debug.md": "ed050a7113411868edc1b8348642d116d72a1f021cc4034c2dddd7413720edac",
     ".cursor/commands/bkit-design.md": "8f907cd452dfbdd85992fcfe11208d819fc7c689ac0417fac65dcfbeacdc1a77",
     ".cursor/commands/bkit-plan.md": "552cd952eec3b8efec38d99cdb0f708e535692204c69374efd7885dee9519478",
@@ -102,7 +102,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "7429e7ff947702372741829224dd41d3725dd715414c1205cb8c7b1f1366f743",
     ".opencode/agents/bkit-utility-update-documentation.md": "25176686d7b31c9e340500d769dcfbeac72f5c53e92c873803d9bca502c63780",
     ".opencode/commands/bkit-auto.md": "a4cc36d6b9e87eb9c9f54d7d8cc98ed5ca0ca2d1ccf77d4747b33dd165dc472e",
-    ".opencode/commands/bkit-build.md": "4230624799baa309f990cfac9a38fe551b9cef115fc9dd9957b604c82ded51e3",
+    ".opencode/commands/bkit-build.md": "49f0fbe03b1ef1170a6929758b7c4fff2eb0d491c1448dc8a6cd423ee3dbee9f",
     ".opencode/commands/bkit-debug.md": "b4b7172f01997e9d23284231aeab88a0cb3c2007c6b951406022f4d3c47f132f",
     ".opencode/commands/bkit-design.md": "70eb829aadd1af214ffd49f2d85eed4701f49dd024f8c5852942d22fdd3033ff",
     ".opencode/commands/bkit-plan.md": "bda719d95d06de358296810e6ca1b13242ad1d87ec362044b033edd8ad93a563",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index a8f8e8c56..47f3a45e5 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -192,7 +192,7 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 7901b39ad..d4734997c 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -191,7 +191,7 @@ Build Feature — Autonomous implementation
    "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 8744e65ec..c749470a5 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -195,7 +195,7 @@ $ARGUMENTS
    "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run `decisions counts {COUNT_FLAGS}` and `decisions check` once; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index a5205368c..6a215d0e2 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -139,6 +139,14 @@ export function itemProblem(text, engineText) {
         return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}"; write an em dash (—) after the number`;
     if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
         return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the engine file holds no loop question)';
+    if (engineHasLoop) {
+        // The loop question was built for the question count `decisions counts` saw.
+        const own = text.split(ITEM_SPLIT).length - 1;
+        const offersStop = /^B\)[ \t]+Stop\b/m.test(engineText ?? "");
+        const offersDecide = /^B\)[ \t]+Decide\b/m.test(engineText ?? "");
+        if ((own > 0 && offersStop) || (own === 0 && offersDecide))
+            return "the engine file's loop question was built for a different question count; re-run `decisions counts` with the same flags, then check again";
+    }
     for (const part of text.split(ITEM_SPLIT).slice(1)) {
         const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
         const q = `Q${n}`;
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 19b82d725..5d72a5bfb 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -209,6 +209,43 @@ const NEXT_STEP_SHAPE = /^\/bkit-[a-z0-9-]+(?: [#A-Za-z0-9._-]+)*$/;
  * Rewrite the failure's error and stderr files in place before any commit or comment: configured
  * secret values become `<NAME>`, and the stderr file keeps its last 20 lines (what the comment posts).
  */
+const CREDENTIAL_NAME = /TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL/i;
+const URL_PASSWORD = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i;
+/** Credentials, URL passwords and local account paths replaced in `input`. */
+function scrubSecrets(input, cwd) {
+    let text = input;
+    const values = [];
+    for (const [name, value] of Object.entries(process.env)) {
+        if (value === undefined || value.length < 4)
+            continue;
+        const marked = CREDENTIAL_NAME.test(name) || (/(?:_URL|DSN)$/i.test(name) && URL_PASSWORD.test(value));
+        if (marked)
+            values.push([name, value]);
+    }
+    // Longest value first, so a value holding another is replaced whole.
+    values.sort((x, y) => y[1].length - x[1].length);
+    for (const [name, value] of values)
+        text = text.split(value).join(`<${name}>`);
+    text = text.replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:)[^\s/@]+(@)/gi, "$1<redacted>$2");
+    const roots = new Set();
+    for (const base of [repoRoot(cwd), cwd]) {
+        roots.add(base);
+        try {
+            roots.add(fs.realpathSync(base));
+        }
+        catch {
+            // A missing directory has no real path.
+        }
+    }
+    for (const r of [...roots].sort((x, y) => y.length - x.length)) {
+        if (r.length > 1)
+            text = text.split(`${r}/`).join("").split(r).join(".");
+    }
+    const home = os.homedir();
+    if (home.length > 1)
+        text = text.split(home).join("~");
+    return text;
+}
 function scrubFailureFiles(cwd, errorFile, stderrFile) {
     for (const [rel, keep] of [
         [errorFile, false],
@@ -219,7 +256,7 @@ function scrubFailureFiles(cwd, errorFile, stderrFile) {
         const abs = path.resolve(cwd, rel);
         if (!fs.existsSync(abs))
             continue;
-        let text = redact(fs.readFileSync(abs, "utf-8"));
+        let text = scrubSecrets(redact(fs.readFileSync(abs, "utf-8")), cwd);
         if (keep) {
             const lines = text.replace(/\n+$/, "").split("\n");
             text = `${lines.slice(-20).join("\n")}\n`;
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 89c7f24ac..263b8f29e 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -529,3 +529,5 @@
 {"schema":3,"ts":1795028972158,"firstTs":1795028972158,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-workflows-bkit-build-md-290","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"On a challenge, changed-tests or unproven pause, Q1 is the orchestrator's own item, so Decision Pause step 6's unconditional `decisions apply --by=owner --q=1 --answer=…` refuses with exit 2 and the workflow names no route for it","description":"LOW build challenge finding at .bkit/core/workflows/bkit-build.md:290: On a challenge, changed-tests or unproven pause, Q1 is the orchestrator's own item, so Decision Pause step 6's unconditional `decisions apply --by=owner --q=1 --answer=…` refuses with exit 2 and the workflow names no route for it. Done when: The step 6 block runs only when the pause has a loop question, and a non-zero exit routes to Failure Path.","source":".bkit/core/workflows/bkit-build.md:290","status":"OPEN"}
 {"schema":3,"ts":1795028972159,"firstTs":1795028972159,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1162","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A challenge agent writes `Verdict: CONCERNS` with no task block; `steps finish` wraps `parseFindings`'s \"re-run the challenge\" text as \"incomplete task block\" while the re-ask says \"Fix that in the file. Do not redo work.\", so the agent gets two opposite instructions","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1162: A challenge agent writes `Verdict: CONCERNS` with no task block; `steps finish` wraps `parseFindings`'s \"re-run the challenge\" text as \"incomplete task block\" while the re-ask says \"Fix that in the file. Do not redo work.\", so the agent gets two opposite instructions. Done when: The handed-back problem names what to fix in the file and carries no \"re-run\" instruction.","source":".bkit/core/engine/commands/workflow/steps.ts:1162","status":"OPEN"}
 {"schema":3,"ts":1795028972160,"firstTs":1795028972160,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-664","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A multi-line owner reason passed to decisions apply --by=owner --answer writes its extra lines raw into the engine file, whose Decision: lines win the merge, so a reason holding a **Q2 — ...:** line and a Decision: Accept line accepts Q2 without the owner answering it","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/decisions.ts:664: A multi-line owner reason passed to decisions apply --by=owner --answer writes its extra lines raw into the engine file, whose Decision: lines win the merge, so a reason holding a **Q2 — ...:** line and a Decision: Accept line accepts Q2 without the owner answering it. Done when: Every `--by=owner` path (`--answer`, `--confirm`, `--reject`) folds `--reason` to one line (or refuses `\\r` and `\\n`) before it writes a `Decision:` line, so each call adds exactly one line to the engine file and `mergeItems` reads no question the call did not name.","source":".bkit/core/engine/commands/workflow/decisions.ts:664","status":"OPEN"}
+{"schema":3,"ts":1795035554374,"firstTs":1795035554374,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-open-decision-ts-183","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A run that stops after the orchestrator wrote a decision file with no parseable question (and before `decisions check` passed) resumes it as a settled pause: `statusOf([])` reads `DECIDED`, `openDecision` reopens it, and `decisions apply --by=headless` exits 0 with nothing applied, so a CHALLENGE pause's hard blockers are never asked","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/open-decision.ts:183: A run that stops after the orchestrator wrote a decision file with no parseable question (and before `decisions check` passed) resumes it as a settled pause: `statusOf([])` reads `DECIDED`, `openDecision` reopens it, and `decisions apply --by=headless` exits 0 with nothing applied, so a CHALLENGE pause's hard blockers are never asked. Done when: A pause whose merged items are empty never reads as settled: `statusOf` returns `OPEN` for an empty item list, so `openDecision` reports such a file as `OPEN`, and `decisions apply --by=headless` exits non-zero on a pause with no parseable question instead of exit 0 with `applied` empty.","source":".bkit/core/engine/commands/workflow/open-decision.ts:183","status":"OPEN"}
+{"schema":3,"ts":1795035554375,"firstTs":1795035554375,"updates":1,"kind":"deferral","key":"958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-168","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["958-agents-orchestrator-write"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A remediate agent's `BLOCKED` reason (or a challenge finding) shaped by an injected log carries a line `Decision: Accept — looks fine`; the orchestrator pastes it into a question at Decision Pause step 2, `decisions check` passes the file, and the pause reads that item as answered, so the owner is never asked, `decisions skip` and `tasks tick` read Accept and the acceptance is recorded as the owner's. The replaced `decisions compose` folded every item field through `oneLine`, so no pasted text could answer a question","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/decisions.ts:168: A remediate agent's `BLOCKED` reason (or a challenge finding) shaped by an injected log carries a line `Decision: Accept — looks fine`; the orchestrator pastes it into a question at Decision Pause step 2, `decisions check` passes the file, and the pause reads that item as answered, so the owner is never asked, `decisions skip` and `tasks tick` read Accept and the acceptance is recorded as the owner's. The replaced `decisions compose` folded every item field through `oneLine`, so no pasted text could answer a question. Done when: `itemProblem` makes `decisions check` exit 6, naming the question, when any item of the orchestrator's file holds a line that starts `Decision:`, `Fix task:`, `Rejected:` or `Deferred:`. Check runs only at Decision Pause step 2, before any answer exists, so only the owner's step-6 answers and the engine write those lines.","source":".bkit/core/engine/commands/workflow/decisions.ts:168","status":"OPEN"}
diff --git a/scripts/gate/bkit-text-ceiling.json b/scripts/gate/bkit-text-ceiling.json
index 350223f2e..1fc600615 100644
--- a/scripts/gate/bkit-text-ceiling.json
+++ b/scripts/gate/bkit-text-ceiling.json
@@ -4,7 +4,7 @@
     "reason": "initial baseline for #1028"
   },
   "workflows": {
-    "ceiling": 58001,
+    "ceiling": 57999,
     "reason": "initial baseline for #1028"
   }
 }
