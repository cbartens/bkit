diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 7e3e6ab0d..827b8aade 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -230,6 +230,30 @@ describe("bkit ledgers commit (tests/book-commit.bats)", () => {
     expect(head(r)).toBe(before);
   });
 
+  it("a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit", async () => {
+    const r = repo();
+    put(r, "docs/plans/202608/logs/446l/status.jsonl", "{}\n");
+    commitAll(r);
+    add(r, "docs/plans/202608/logs/446l/status.jsonl", '{"more":1}\n');
+    put(r, "docs/plans/202608/logs/446l/status.jsonl.bkit-lock", "");
+    const res = await run(
+      r,
+      commitArgs(
+        r,
+        "--month=202608",
+        "--fid=446l",
+        "--scope=core",
+        "--mode=commit",
+        "--message=lock test",
+      ),
+    );
+    expect(res.code).toBe(0);
+    const files = git(r, "show", "--name-only", "--format=", "HEAD");
+    expect(files).toContain("status.jsonl");
+    expect(files).not.toContain("status.jsonl.bkit-lock");
+    expect(git(r, "ls-files", "--", "*.bkit-lock")).toBe("");
+  });
+
   it("empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit", async () => {
     const r = repo();
     put(r, "README.md", "x\n");
@@ -2074,6 +2098,47 @@ describe("bkit ledgers append --invocation", () => {
     expect(fs.readFileSync(path.join(r, "docs/knowledge.jsonl"), "utf-8")).toContain('"x"');
   });
 
+  it("the correction-events file has mode 0600", async () => {
+    const r = repo();
+    const out: string[] = [];
+    await runCommand(
+      [
+        "status",
+        "invocation",
+        "--standalone=audit",
+        "--name=bkit-audit-example",
+        "--agent=bkit-build-plan-tests",
+        "--observed-model=m",
+        "--json",
+      ],
+      COMMANDS,
+      {
+        classicVerbs: new Set(["status"]),
+        cwd: r,
+        io: { stdout: (t) => out.push(t), stderr: () => {} },
+      },
+    );
+    const id = (JSON.parse(out.join("")) as { invocation: string }).invocation;
+    const invoke = [`--invocation=${id}`];
+    const rejected = await appendWith(
+      r,
+      "knowledge",
+      [knowledge({ key: "x", ts: "2026-11-09T10:00:00Z" })],
+      [...invoke, "--operation=op-1"],
+    );
+    expect(rejected.code).toBe(EXIT_ROW_REFUSED);
+    const fixed = await appendWith(
+      r,
+      "knowledge",
+      [knowledge({ key: "x" })],
+      [...invoke, "--operation=op-2", "--correction-of=op-1"],
+    );
+    expect(fixed.code).toBe(0);
+    const events = path.join(r, ".git/bkit-outbox/invocation-context", `${id}.corrections.jsonl`);
+    expect(fs.existsSync(events)).toBe(true);
+    expect(fs.statSync(events).mode & 0o777).toBe(0o600);
+  });
+
   it("issues the same operation for rows whose keys are reordered", async () => {
     const r = buildRepo();
     const id = await issue(r, ["--agent=bkit-build-plan-tests"]);
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index cf54942ae..c020bf21c 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -1270,6 +1270,7 @@ export function commitBookkeeping(
     "--exclude-standard",
     "--",
     ...specs,
+    ":(exclude,glob)**/*.bkit-lock",
   ]);
   if (listed.status !== 0) {
     throw new CommandError(
@@ -1649,7 +1650,7 @@ function correctionBook(
   const dir = invocationDir(cwd);
   if (dir === null) return null;
   const file = path.join(dir, `${invocation.id}.corrections.jsonl`);
-  fs.appendFileSync(file, "");
+  fs.appendFileSync(file, "", { mode: 0o600 });
   return { file, ...key };
 }
 
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index 31c50b74d..94abb885c 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -59,7 +59,7 @@ for name in ["decisions", "knowledge"]:
 
 ## Write Idiom
 
-**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
+**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing when the ledger still holds them, and is refused with the reason when they are gone, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
 
 - **Fills:** `schema: 3`, a minted `ts` per row, `repo` when absent, and `bkit.version` from `.bkit/version`. On `deferral` / `failure` / `knowledge` / `decision` rows, it also fills `firstTs` and `updates` from the entry's earlier rows (§ Compaction), replacing any supplied values.
 - **Checks** every row before writing any: validation, and the author against § Ledgers & Writers. One refused row → exit 8, and nothing is written.
diff --git a/.bkit/shared/gitignore b/.bkit/shared/gitignore
index b3c418334..d3d7e31ab 100644
--- a/.bkit/shared/gitignore
+++ b/.bkit/shared/gitignore
@@ -42,6 +42,8 @@ tmp/**
 .worktrees/
 docs/plans/*/logs/**/raw/
 docs/plans/*/logs/**/.lock
+# Leftover ledger lock files must never be staged by bookkeeping.
+*.bkit-lock
 # Per-run sentinels sit in BOOK_PATHS-staged logs — without these lines a Failure
 # Path commit captures them and the next `rm -f` shows as a tracked deletion.
 docs/plans/*/logs/**/.deferred-blocked
diff --git a/.bkit/version b/.bkit/version
index 87f591c0f..6c44d2aa7 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -10,7 +10,7 @@
     "CLAUDE.md": "f10a4f2eef97c6db12ea336a14a062a4089f97d042d5a007259c7738e0883e8e",
     ".gitattributes": "3fdc7d0fc2655afc90d395cf52cda7f99f211b991184dfafaecd84d93c5da336",
     ".cursor/hooks.json": "9d31305b0c496c261dc951b1ab6904028f8e96722286b67d0371ddef59da6bca",
-    ".gitignore": "1e074d244eb42a494f5319bbc769dd9fe7157cbada3caf703b6f4b61ff390f32",
+    ".gitignore": "2a7c4b102d37db5adcd723327c84f03484965b4af2f87c20f7a96f1810b0d3e1",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
     ".bkit/.env.example": "6bf0e90fae894711f951811a122424eb8eaec00bcc0c0bfdafcc2750927b4daf",
     ".opencode/opencode.json": "37a299e11dd7e9d28fd3a212fdf3ac990ba656998263d47731285d30192f0397",
@@ -210,7 +210,7 @@
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
     ".bkit/install.md": "08d1daa2edba56dc34470d8462418aa5e1d479ac1b5bc596b69debdac025be94",
-    ".bkit/jsonl.md": "f9c0466c9092f42abb986a13a231b1d453edd7fee6fbf78a40ce6da59f7d12c8",
+    ".bkit/jsonl.md": "23ed4f34eb65b1e07140a76f29b3f5f0db7c6643bd210fd51da5650cc37b8f8c",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "85913cc84a994cd14a6c0948a8f6b63611a776b1be80cf9a902e5cb994add0c2",
diff --git a/.gitignore b/.gitignore
index 474c27441..5f0d1764f 100644
--- a/.gitignore
+++ b/.gitignore
@@ -52,6 +52,8 @@ graphify-out/
 .worktrees/
 docs/plans/*/logs/**/raw/
 docs/plans/*/logs/**/.lock
+# Leftover ledger lock files must never be staged by bookkeeping.
+*.bkit-lock
 # Per-run sentinels sit in BOOK_PATHS-staged logs — without these lines a Failure
 # Path commit captures them and the next `rm -f` shows as a tracked deletion.
 docs/plans/*/logs/**/.deferred-blocked
diff --git a/DETAILS.md b/DETAILS.md
index 35098bdf1..40c0475c1 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -349,12 +349,12 @@ flowchart LR
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1955 symbols · 57 files"]
     n_bkit_core_engine_install["install<br/>366 symbols · 21 files"]
-    n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
+    n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|472| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|219| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index edcc55776..3102ddfb6 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -1018,6 +1018,7 @@ export function commitBookkeeping(o, log) {
         "--exclude-standard",
         "--",
         ...specs,
+        ":(exclude,glob)**/*.bkit-lock",
     ]);
     if (listed.status !== 0) {
         throw new CommandError(EXIT_ROOT, `'git ls-files' failed while building the pathspec: ${listed.stderr}`);
@@ -1321,7 +1322,7 @@ function correctionBook(cwd, invocation) {
     if (dir === null)
         return null;
     const file = path.join(dir, `${invocation.id}.corrections.jsonl`);
-    fs.appendFileSync(file, "");
+    fs.appendFileSync(file, "", { mode: 0o600 });
     return { file, ...key };
 }
 /** The `{key, ts}` of each row in prepared `block` bytes. */
diff --git a/docs/capabilities.md b/docs/capabilities.md
index c74b2e76d..abb3d2434 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -128,12 +128,12 @@ flowchart LR
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1955 symbols · 57 files"]
     n_bkit_core_engine_install["install<br/>366 symbols · 21 files"]
-    n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
+    n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|472| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|219| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
@@ -321,7 +321,7 @@ flowchart LR
     subgraph gn_bkit_core_engine_ledgers[".bkit/core/engine/ledgers"]
       n_bkit_core_engine_ledgers_compact["compact<br/>8 symbols · 1 files"]
       n_bkit_core_engine_ledgers_journal["journal<br/>18 symbols · 1 files"]
-      n_bkit_core_engine_ledgers_status["status<br/>82 symbols · 1 files"]
+      n_bkit_core_engine_ledgers_status["status<br/>83 symbols · 1 files"]
     end
     subgraph gn_bkit_core_engine_render[".bkit/core/engine/render"]
       n_bkit_core_engine_render_hosts["hosts<br/>29 symbols · 1 files"]
@@ -346,8 +346,8 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_ledgers -->|52| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|51| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_worktrees -->|46| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_ledgers -->|43| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_issues -->|41| n_bkit_core_engine_commands_workflow_tracker
-  n_bkit_core_engine_commands_workflow_ledgers -->|41| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_ci_ci -->|38| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_steps -->|37| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_issues -->|32| n_bkit_core_engine_commands_lib
