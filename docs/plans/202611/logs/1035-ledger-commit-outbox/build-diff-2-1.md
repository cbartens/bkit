diff --git a/.bkit/core/engine/commands/lib.test.ts b/.bkit/core/engine/commands/lib.test.ts
index d949507cf..6a40e685a 100644
--- a/.bkit/core/engine/commands/lib.test.ts
+++ b/.bkit/core/engine/commands/lib.test.ts
@@ -27,6 +27,9 @@ import {
   statusLocation,
   utcMonth,
   verbHelp,
+  invocationDir,
+  writeInvocation,
+  type Invocation,
   type CommandSpec,
   type FlagSpec,
   type RunContext,
@@ -1149,3 +1152,57 @@ describe("tests-lock status file", () => {
     }
   });
 });
+
+describe("writeInvocation folder mode", () => {
+  const roots: string[] = [];
+  afterEach(() => {
+    for (const d of roots.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+  });
+  const gitRepo = () => {
+    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lib-invmode-")));
+    roots.push(root);
+    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
+    return root;
+  };
+  const invocation = (root: string): Invocation => ({
+    id: `inv-${"a".repeat(32)}`,
+    version: 1,
+    scope: "outbox",
+    workflow: null,
+    step: null,
+    number: null,
+    title: null,
+    run: null,
+    statusPath: null,
+    bookRoot: null,
+    group: null,
+    attempt: null,
+    agent: null,
+    host: null,
+    configuredModel: null,
+    observedModel: null,
+    standalone: "audit",
+    name: "bkit-audit-example",
+    declaredStep: "audit:bkit-audit-example",
+    allowedAgent: null,
+    worktree: root,
+    issuedAt: "2026-11-18T10:00:00Z",
+  });
+
+  it("writeInvocation creates invocation-context owner-only", () => {
+    const r = gitRepo();
+    writeInvocation(r, invocation(r));
+    const dir = invocationDir(r) as string;
+    expect(fs.statSync(dir).mode & 0o777).toBe(0o700);
+  });
+
+  it("writeInvocation narrows an existing invocation-context to 0700", () => {
+    const r = gitRepo();
+    const dir = invocationDir(r) as string;
+    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
+    fs.chmodSync(dir, 0o755);
+    expect(fs.statSync(dir).mode & 0o777).toBe(0o755);
+    writeInvocation(r, invocation(r));
+    expect(fs.statSync(dir).mode & 0o777).toBe(0o700);
+  });
+});
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 55a551d1a..041ea7397 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -24,7 +24,7 @@ import {
   rebasePaused,
   shouldRecordFriction,
 } from "../ledgers/journal.js";
-import { fold, isInvocationEvent, type StatusEvent } from "../ledgers/status.js";
+import { fold, isInvocationEvent, privateDir, type StatusEvent } from "../ledgers/status.js";
 import { gitEnv, resolveGitSha } from "../ledgers/telemetry.js";
 import { parseJson } from "../shared/json.js";
 import { renderText } from "../shared/text.js";
@@ -664,8 +664,8 @@ export function invocationDir(cwd: string): string | null {
 export function writeInvocation(cwd: string, inv: Invocation): string {
   const dir = invocationDir(cwd);
   if (dir === null) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${cwd}`);
-  fs.mkdirSync(dir, { recursive: true });
   const file = path.join(dir, `${inv.id}.json`);
+  privateDir(file);
   fs.writeFileSync(file, `${JSON.stringify(inv)}\n`, { mode: 0o600, flag: "wx" });
   return file;
 }
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 59a4cd728..8658cd42b 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -2272,6 +2272,50 @@ describe("bkit ledgers append --invocation", () => {
     expect(fs.statSync(events).mode & 0o777).toBe(0o600);
   });
 
+  it("a correction-events file left at 0644 is 0600 after a corrected append", async () => {
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
+    const events = path.join(r, ".git/bkit-outbox/invocation-context", `${id}.corrections.jsonl`);
+    fs.writeFileSync(events, "", { mode: 0o644 });
+    fs.chmodSync(events, 0o644);
+    expect(fs.statSync(events).mode & 0o777).toBe(0o644);
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
+    expect(fixed.json.correction).toMatchObject({ used: 1 });
+    expect(fs.statSync(events).mode & 0o777).toBe(0o600);
+  });
+
   it("issues the same operation for rows whose keys are reordered", async () => {
     const r = buildRepo();
     const id = await issue(r, ["--agent=bkit-build-plan-tests"]);
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 0c968883a..fb2c833b4 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -1687,6 +1687,7 @@ function correctionBook(
   if (dir === null) return null;
   const file = path.join(dir, `${invocation.id}.corrections.jsonl`);
   fs.appendFileSync(file, "", { mode: 0o600 });
+  fs.chmodSync(file, 0o600);
   return { file, ...key };
 }
 
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 8e9431c64..f53287bd2 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -724,9 +724,11 @@ export function ledgerOperationsFile(root: string, prepare = false): string | nu
   return file;
 }
 
-/** Create the private directory chain of `file`'s parent (0700). */
-function privateDir(file: string): void {
-  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
+/** Create the private directory chain of `file`'s parent (0700), and narrow a parent that already existed. */
+export function privateDir(file: string): void {
+  const dir = path.dirname(file);
+  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
+  fs.chmodSync(dir, 0o700);
 }
 
 /**
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index 0c63b2bc4..c609ebd66 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -13,7 +13,7 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { appendFrictionRow, appendJournalRow, engineCallRow, frictionRow, journalEnabled, launchedByGit, rebasePaused, shouldRecordFriction, } from "../ledgers/journal.js";
-import { fold, isInvocationEvent } from "../ledgers/status.js";
+import { fold, isInvocationEvent, privateDir } from "../ledgers/status.js";
 import { gitEnv, resolveGitSha } from "../ledgers/telemetry.js";
 import { parseJson } from "../shared/json.js";
 import { renderText } from "../shared/text.js";
@@ -449,8 +449,8 @@ export function writeInvocation(cwd, inv) {
     const dir = invocationDir(cwd);
     if (dir === null)
         throw new CommandError(EXIT.USAGE, `not inside a git repository: ${cwd}`);
-    fs.mkdirSync(dir, { recursive: true });
     const file = path.join(dir, `${inv.id}.json`);
+    privateDir(file);
     fs.writeFileSync(file, `${JSON.stringify(inv)}\n`, { mode: 0o600, flag: "wx" });
     return file;
 }
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 057af9d27..4a9fe8d29 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -1352,6 +1352,7 @@ function correctionBook(cwd, invocation) {
         return null;
     const file = path.join(dir, `${invocation.id}.corrections.jsonl`);
     fs.appendFileSync(file, "", { mode: 0o600 });
+    fs.chmodSync(file, 0o600);
     return { file, ...key };
 }
 /** The `{key, ts}` of each row in prepared `block` bytes. */
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index aa1975856..f45c819b3 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -524,9 +524,11 @@ export function ledgerOperationsFile(root, prepare = false) {
         privateDir(file);
     return file;
 }
-/** Create the private directory chain of `file`'s parent (0700). */
-function privateDir(file) {
-    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
+/** Create the private directory chain of `file`'s parent (0700), and narrow a parent that already existed. */
+export function privateDir(file) {
+    const dir = path.dirname(file);
+    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
+    fs.chmodSync(dir, 0o700);
 }
 /**
  * The landed effect of a receipted operation: offset and bytes from the receipt, the block from
