diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index 5b77f7e3a..5b3d10f0d 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -744,7 +744,6 @@ export function auditEntries(result: AuditResult): AuditEntry[] {
 export function auditLedgerRows(result: AuditResult): Array<Record<string, unknown>> {
   return auditEntries(result).map((e) => ({
     kind: "failure",
-    by: { workflow: "audit", step: `audit-${result.slug}` },
     key: e.key,
     summary: e.title,
     severity: e.severity,
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 3e6d3fa44..d7de3d44e 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -1568,7 +1568,9 @@ export function appendLedgerRows(
   const made = mkdirp(path.dirname(abs));
   if (made) throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(file)}: ${made}`);
   const ops = path.join(root, LEDGER_OPERATIONS_FILE);
-  const hash = actionHash(JSON.stringify({ ledger, rows, invocation: invocation?.id ?? null }));
+  // The request is the ledger and rows alone: an operation stays reconcilable after its
+  // invocation goes stale, and replay writes the recorded bytes, never a re-derived `by`.
+  const hash = actionHash(JSON.stringify({ ledger, rows }));
   if (options.operation !== undefined && options.issueOperation === true)
     throw new CommandError(
       EXIT.USAGE,
@@ -1724,10 +1726,17 @@ export function appendLedgerRows(
             options.checkpoint?.("receipted");
             return result(intent, intent.block, true);
           }
-          if (seg.length > 0 && have.length === intent.offset + seg.length)
+          let landedBytes = 0;
+          while (
+            landedBytes < seg.length &&
+            landedBytes < want.length &&
+            seg[landedBytes] === want[landedBytes]
+          )
+            landedBytes++;
+          if (landedBytes > 0 || (seg.length > 0 && have.length === intent.offset + seg.length))
             throw new UncertainEffect(
               EXIT_STAGE,
-              `operation ${operation}: ${file} holds ${seg.length} of ${want.length} prepared bytes; the effect is uncertain, nothing was truncated or retried`,
+              `operation ${operation}: ${file} holds ${landedBytes} of ${want.length} prepared bytes at the recorded offset; the effect is uncertain, nothing was truncated or retried`,
             );
           if (have.length === intent.offset) {
             // Nothing landed: write the exact prepared bytes again.
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index 820af1c40..ba5a60ea3 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -1097,10 +1097,11 @@ export async function ciDispatchGate(
           return false;
         }
         if (tip !== cur.commit) {
-          const tracking = git(o.cwd, ["rev-parse", "-q", "--verify", `origin/${branch}`]);
+          // Whatever `origin/<branch>` holds, a tip that is not behind the re-trigger commit is
+          // someone else's work: a lease taken against an up-to-date tracking ref would overwrite it.
           const fastForward =
             tip === "" || runGit(o.cwd, ["merge-base", "--is-ancestor", tip, cur.commit]).ok;
-          if (!fastForward && tip !== tracking) {
+          if (!fastForward) {
             deps.log(
               `re-trigger push blocked: ${branch} moved on the remote to ${tip.slice(0, 12)} after the re-trigger commit was made`,
             );
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 0c94ffa81..189b9fe85 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -2477,4 +2477,58 @@ describe("bkit steps stub --result-file", () => {
     expect(bad.code).not.toBe(0);
     expect(fs.existsSync(path.join(cwd, "logs/c.md"))).toBe(false);
   });
+
+  it("audit result render keeps an existing anchored report intact", async () => {
+    const cwd = repo();
+    const report = [
+      "# Security audit",
+      "",
+      "<!-- bkit:anchor baseSha=abc1234 -->",
+      "<!-- bkit:outdated -->",
+      "",
+      "## Probe Steps",
+      "",
+      "1. Grepped every handler for unchecked input: MARKER-PROBE-STEPS",
+      "",
+      "## Findings",
+      "",
+      "### security-1 token leak in logs: MARKER-FINDINGS",
+      "",
+      "## Project Instructions",
+      "",
+      "Read CLAUDE.md first: MARKER-INSTRUCTIONS",
+      "",
+    ].join("\n");
+    fs.mkdirSync(path.join(cwd, "docs/audits"), { recursive: true });
+    write(cwd, "docs/audits/security.md", report);
+    write(
+      cwd,
+      "logs/a.json",
+      JSON.stringify({
+        slug: "security",
+        status: "COMPLETE",
+        report: "docs/audits/security.md",
+        findings: [{ severity: "HIGH", title: "Token leak", location: "src/a.ts:1" }],
+        notChecked: [],
+      }),
+    );
+    await run(cwd, [
+      "steps",
+      "stub",
+      "--agent=bkit-audit-generate",
+      "--result-file=logs/a.json",
+      "--to=docs/audits/security.md",
+    ]);
+    const after = fs.readFileSync(path.join(cwd, "docs/audits/security.md"), "utf-8");
+    for (const kept of [
+      "<!-- bkit:anchor baseSha=abc1234 -->",
+      "## Probe Steps",
+      "MARKER-PROBE-STEPS",
+      "## Findings",
+      "MARKER-FINDINGS",
+      "## Project Instructions",
+      "MARKER-INSTRUCTIONS",
+    ])
+      expect(after).toContain(kept);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 18f07cd87..d6a3cde6b 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -2297,7 +2297,8 @@ export const stepsCommand: CommandSpec = {
         },
       ],
       output: {
-        file: "the artifact written",
+        file: "the artifact written (an audit summary whose --to already holds a report goes to <result-file>.summary.md)",
+        reportKept: "audit result: the existing report at --to, left untouched",
         stripped: "the prior header was dropped (copy mode)",
         fingerprint: "with --result-file: the Fingerprint header value",
         ids: "audit result: the report-local finding IDs, in report order",
@@ -2323,11 +2324,24 @@ export const stepsCommand: CommandSpec = {
               String(ctx.flags.agent),
               readResult(ctx.cwd, String(ctx.flags.resultFile)),
             );
-            const to = path.resolve(ctx.cwd, String(ctx.flags.to));
+            const requested = path.resolve(ctx.cwd, String(ctx.flags.to));
+            // An audit's --to is the finished report; the summary never replaces it.
+            const keepsReport =
+              ctx.flags.agent === AUDIT_AGENT &&
+              fs.existsSync(requested) &&
+              fs.statSync(requested).size > 0;
+            const resultFile = path.resolve(ctx.cwd, String(ctx.flags.resultFile));
+            const to = keepsReport
+              ? path.join(
+                  path.dirname(resultFile),
+                  `${path.basename(resultFile, path.extname(resultFile))}.summary.md`,
+                )
+              : requested;
             fs.mkdirSync(path.dirname(to), { recursive: true });
             fs.writeFileSync(to, rendered.text);
             ctx.emit({
-              file: String(ctx.flags.to),
+              file: keepsReport ? path.relative(ctx.cwd, to) : String(ctx.flags.to),
+              ...(keepsReport ? { reportKept: String(ctx.flags.to) } : {}),
               fingerprint: rendered.fingerprint,
               ...rendered.extra,
             });
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index fa27d07fa..40009bdcc 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -13,7 +13,13 @@ import * as path from "node:path";
 
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
-import { INVOCATION_FLAG, runCommand, type CommandSpec, type GhResult } from "../commands/lib";
+import {
+  INVOCATION_FLAG,
+  resolveInvocation,
+  runCommand,
+  type CommandSpec,
+  type GhResult,
+} from "../commands/lib";
 import { COMMANDS } from "../commands/registry";
 import { branchesCommand } from "../commands/workflow/branches";
 import {
@@ -854,6 +860,150 @@ describe("replay-safe ledger appends on real files", () => {
     expect(fs.readFileSync(path.join(repo, "docs", "failures.jsonl"), "utf-8")).toBe(before);
     expect(fs.existsSync(path.join(repo, "docs", "plans"))).toBe(false);
   });
+
+  it("resolves a pending ledger intent after its invocation is stale", async () => {
+    // The ledger already holds a row, so a later union takes the existing-file path.
+    appendLedgerRows(worktree, "failures", [failureRow({ key: "earlier-row" })]);
+    const first = resolveInvocation(worktree, await issue(worktree), {});
+    const rowNoBy = {
+      kind: "failure",
+      key: "lost-row",
+      summary: "a lost row",
+      severity: "HIGH",
+      status: "OPEN",
+    };
+
+    // The response is lost after the intent is recorded and before the bytes land.
+    expect(() =>
+      appendLedgerRows(worktree, "failures", [rowNoBy], first, {
+        operation: "op-stale",
+        checkpoint: failAt("prepared"),
+      }),
+    ).toThrow();
+    const intents = rows(path.join(worktree, ".bkit", "ledger-operations.jsonl")).filter(
+      (r) => r["type"] === "ledger-intent",
+    );
+    expect(intents).toHaveLength(1);
+
+    // A newer run of the same workflow starts: the first invocation is stale.
+    fs.appendFileSync(
+      path.join(worktree, STATUS_REL),
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T12:00:00Z" })}\n`,
+    );
+    expect(() => resolveInvocation(worktree, first.id, {})).toThrow(/stale/);
+    const second = resolveInvocation(worktree, await issue(worktree), {});
+
+    // The operation is still reachable: replaying it by id completes it with exactly one row.
+    const replay = appendLedgerRows(worktree, "failures", [rowNoBy], second, {
+      operation: "op-stale",
+    });
+    expect(replay.receipt).toMatchObject({ operation: "op-stale", rows: [{ key: "lost-row" }] });
+    const ledger = rows(path.join(worktree, "docs", "failures.jsonl"));
+    expect(ledger.map((r) => r["key"])).toEqual(["earlier-row", "lost-row"]);
+
+    // A teardown union into this checkout is no longer blocked by the intent.
+    fs.mkdirSync(path.join(main, "docs"), { recursive: true });
+    fs.writeFileSync(
+      path.join(main, "docs", "failures.jsonl"),
+      `${JSON.stringify(failureRow({ key: "from-elsewhere", ts: 1, schema: 1 }))}\n`,
+    );
+    const unioned = await call(
+      worktree,
+      [ledgersCommand],
+      ["ledgers", "union", `--src=${main}`, `--dst=${worktree}`],
+    );
+    expect(unioned.code).toBe(0);
+    expect(unioned.err).not.toContain("replay them first");
+  });
+
+  it("appends the printed audit ledgerRows verbatim under the standalone invocation", async () => {
+    const repo = bookRoot();
+    fs.writeFileSync(path.join(repo, "README.md"), "x\n");
+    git(repo, ["add", "."]);
+    git(repo, ["commit", "-q", "-m", "init"]);
+    const inv = await call(repo, COMMANDS, [
+      "status",
+      "invocation",
+      "--standalone=audit",
+      "--name=security",
+    ]);
+    expect(inv.code).toBe(0);
+    fs.writeFileSync(
+      path.join(repo, "result.json"),
+      JSON.stringify({
+        slug: "security",
+        status: "COMPLETE",
+        report: "docs/audits/202611/security.md",
+        findings: [
+          { severity: "HIGH", title: "Token logged", location: "src/a.ts:10" },
+          { severity: "LOW", title: "Verbose error", location: "src/b.ts:2" },
+        ],
+        notChecked: [],
+      }),
+    );
+    const stub = await call(repo, COMMANDS, [
+      "steps",
+      "stub",
+      "--agent=bkit-audit-generate",
+      "--result-file=result.json",
+      "--to=docs/audits/202611/security-summary.md",
+    ]);
+    expect(stub.code).toBe(0);
+    // The printed rows go in exactly as printed, `by` included.
+    const printed = stub.json!["ledgerRows"] as Array<Record<string, unknown>>;
+    expect(printed).toHaveLength(2);
+    fs.writeFileSync(path.join(repo, "rows.json"), JSON.stringify(printed));
+    const appended = await call(
+      repo,
+      [ledgersCommand],
+      [
+        "ledgers",
+        "append",
+        `--root=${repo}`,
+        "--ledger=failures",
+        `--rows=${path.join(repo, "rows.json")}`,
+        `--invocation=${inv.json!["invocation"] as string}`,
+      ],
+    );
+    expect(appended.err).not.toContain("disagrees with invocation");
+    expect(appended.code).toBe(0);
+    expect(rows(path.join(repo, "docs", "failures.jsonl")).map((r) => r["key"])).toEqual(
+      printed.map((r) => r["key"]),
+    );
+  });
+
+  it("refuses to re-append a partly landed block after a foreign writer appended", () => {
+    const root = bookRoot();
+    const file = path.join(root, "docs", "failures.jsonl");
+    const request = [failureRow({ key: "first-landed" }), failureRow({ key: "second-torn" })];
+    expect(() =>
+      appendLedgerRows(root, "failures", request, undefined, {
+        operation: "op-partial",
+        checkpoint: failAt("prepared"),
+      }),
+    ).toThrow();
+    const intent = rows(path.join(root, ".bkit", "ledger-operations.jsonl")).find(
+      (r) => r["type"] === "ledger-intent",
+    )!;
+    const lines = String(intent["block"])
+      .split("\n")
+      .filter((l) => l !== "");
+    expect(lines).toHaveLength(2);
+
+    // The first row and half of the second landed; the response was lost; the lock was cleared.
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, `${lines[0]}\n${lines[1]!.slice(0, Math.floor(lines[1]!.length / 2))}`);
+    // A plain append from another writer lands next; it checks no pending intent.
+    appendLedgerRows(root, "failures", [failureRow({ key: "foreign-writer" })]);
+    const before = fs.readFileSync(file, "utf-8");
+
+    expect(() =>
+      appendLedgerRows(root, "failures", request, undefined, { operation: "op-partial" }),
+    ).toThrow(/uncertain/i);
+    const after = fs.readFileSync(file, "utf-8");
+    expect(after).toBe(before);
+    expect(after.split('"key":"first-landed"')).toHaveLength(2);
+  });
 });
 
 describe("persistent CI handoff on a real local remote", () => {
@@ -1096,6 +1246,40 @@ describe("persistent CI handoff on a real local remote", () => {
       retrigger: { state: "receipt-completed", remote: shared.tip(), receipt: "handoff-1" },
     });
   });
+
+  it("blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it", async () => {
+    const moved = remoteRepo("feat/1-x", false);
+    await expect(
+      ciDispatchGate(options(moved, { checkpoint: crashAt("commit-created") }), {
+        gh: pollingGh(none(30)).gh,
+        ...quiet(),
+      }),
+    ).rejects.toThrow("process lost at commit-created");
+
+    // Someone else pushes, and a fetch moves origin/<branch> onto their commit.
+    const other = path.join(moved.root, "other");
+    git(moved.root, ["clone", "-q", "-b", "feat/1-x", moved.remote, other]);
+    git(other, ["commit", "-q", "--allow-empty", "-m", "someone else moved the branch"]);
+    git(other, ["push", "-q", "origin", "feat/1-x"]);
+    const foreign = moved.tip();
+    git(moved.work, ["fetch", "-q", "origin"]);
+    expect(git(moved.work, ["rev-parse", "origin/feat/1-x"])).toBe(foreign);
+
+    const blocked = await ciDispatchGate(options(moved), {
+      gh: pollingGh([FOUND]).gh,
+      ...quiet(),
+    });
+    expect(blocked).toMatchObject({ handoff: 6, ciDispatch: null });
+    expect(moved.tip()).toBe(foreign);
+    expect(moved.log()[0]).toBe("someone else moved the branch");
+    expect(moved.retriggers()).toBe(0);
+    expect(handoffRows(moved).at(-1)).toMatchObject({ retrigger: { state: "commit-created" } });
+    expect(
+      handoffRows(moved).filter(
+        (row) => (row["retrigger"] as { state?: string } | undefined)?.state === "push-completed",
+      ),
+    ).toHaveLength(0);
+  });
 });
 
 describe("bounded correction on real ledgers", () => {
diff --git a/.bkit/core/prompts/bkit-audit-generate.md b/.bkit/core/prompts/bkit-audit-generate.md
index a15be721a..926ed939a 100644
--- a/.bkit/core/prompts/bkit-audit-generate.md
+++ b/.bkit/core/prompts/bkit-audit-generate.md
@@ -161,7 +161,7 @@ autoCompactWindow: 300000
     - The engine fills `by` and the model fields from the invocation; never write `by` or a model name into a row.
     - **If** the template audits `docs/failures.jsonl` or `docs/deferrals.jsonl` → skip this step.
     - Complete the report first.
-    - Serialize the findings once: write the audit result JSON `{slug, status, report, findings: [{severity, title, location, priorKey}], notChecked}` (plus `stopped`, `overview`, `issue`, `parent` when they apply) to a scratch file, then render the summary with `bkit steps stub --agent=bkit-audit-generate --result-file=<json> --to=<Create>`. The engine assigns the finding IDs, the totals and the header, and prints `ledgerRows` for the append below. Leave `priorKey` out for a new problem; the engine derives its `key`.
+    - Serialize the findings once: write the audit result JSON `{slug, status, report, findings: [{severity, title, location, priorKey}], notChecked}` (plus `stopped`, `overview`, `issue`, `parent` when they apply) to a scratch file, then render the summary with `bkit steps stub --agent=bkit-audit-generate --result-file=<json> --to=<Create>`. A report that already exists at `<Create>` is never overwritten: the summary goes to `<json>`'s sibling `.summary.md` (printed as `file`). The engine assigns the finding IDs, the totals and the header, and prints `ledgerRows` for the append below. Leave `priorKey` out for a new problem; the engine derives its `key`.
     - Open rows = the winners of `bkit ledgers query --ledger=failures` (follow `nextCursor` until `coverage.clean` is true), `status` != `CLOSED`, covering every `key`, whichever workflow wrote it.
     - Same problem = the same defect at the same `file:line`, test title, or error signature. A finding that only cites an open row's `file:line` is a different problem.
     - For each `MEDIUM`+ finding:
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index f2754e7bf..654b1d141 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -581,7 +581,6 @@ export function auditEntries(result) {
 export function auditLedgerRows(result) {
     return auditEntries(result).map((e) => ({
         kind: "failure",
-        by: { workflow: "audit", step: `audit-${result.slug}` },
         key: e.key,
         summary: e.title,
         severity: e.severity,
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 1af4bd661..fa4393944 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -1246,7 +1246,9 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
     if (made)
         throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(file)}: ${made}`);
     const ops = path.join(root, LEDGER_OPERATIONS_FILE);
-    const hash = actionHash(JSON.stringify({ ledger, rows, invocation: invocation?.id ?? null }));
+    // The request is the ledger and rows alone: an operation stays reconcilable after its
+    // invocation goes stale, and replay writes the recorded bytes, never a re-derived `by`.
+    const hash = actionHash(JSON.stringify({ ledger, rows }));
     if (options.operation !== undefined && options.issueOperation === true)
         throw new CommandError(EXIT.USAGE, "--issue-operation and --operation are exclusive: the engine issues the id, or the caller names it");
     if (options.issueOperation === true && invocation === undefined)
@@ -1383,8 +1385,13 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                         options.checkpoint?.("receipted");
                         return result(intent, intent.block, true);
                     }
-                    if (seg.length > 0 && have.length === intent.offset + seg.length)
-                        throw new UncertainEffect(EXIT_STAGE, `operation ${operation}: ${file} holds ${seg.length} of ${want.length} prepared bytes; the effect is uncertain, nothing was truncated or retried`);
+                    let landedBytes = 0;
+                    while (landedBytes < seg.length &&
+                        landedBytes < want.length &&
+                        seg[landedBytes] === want[landedBytes])
+                        landedBytes++;
+                    if (landedBytes > 0 || (seg.length > 0 && have.length === intent.offset + seg.length))
+                        throw new UncertainEffect(EXIT_STAGE, `operation ${operation}: ${file} holds ${landedBytes} of ${want.length} prepared bytes at the recorded offset; the effect is uncertain, nothing was truncated or retried`);
                     if (have.length === intent.offset) {
                         // Nothing landed: write the exact prepared bytes again.
                         writePrepared(abs, intent.block, intent.offset);
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 046afbaca..d91484862 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -785,9 +785,10 @@ export async function ciDispatchGate(o, deps) {
                     return false;
                 }
                 if (tip !== cur.commit) {
-                    const tracking = git(o.cwd, ["rev-parse", "-q", "--verify", `origin/${branch}`]);
+                    // Whatever `origin/<branch>` holds, a tip that is not behind the re-trigger commit is
+                    // someone else's work: a lease taken against an up-to-date tracking ref would overwrite it.
                     const fastForward = tip === "" || runGit(o.cwd, ["merge-base", "--is-ancestor", tip, cur.commit]).ok;
-                    if (!fastForward && tip !== tracking) {
+                    if (!fastForward) {
                         deps.log(`re-trigger push blocked: ${branch} moved on the remote to ${tip.slice(0, 12)} after the re-trigger commit was made`);
                         return false;
                     }
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 89e222128..136bf286e 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -1921,7 +1921,8 @@ export const stepsCommand = {
                 },
             ],
             output: {
-                file: "the artifact written",
+                file: "the artifact written (an audit summary whose --to already holds a report goes to <result-file>.summary.md)",
+                reportKept: "audit result: the existing report at --to, left untouched",
                 stripped: "the prior header was dropped (copy mode)",
                 fingerprint: "with --result-file: the Fingerprint header value",
                 ids: "audit result: the report-local finding IDs, in report order",
@@ -1941,11 +1942,20 @@ export const stepsCommand = {
                         throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
                     try {
                         const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), readResult(ctx.cwd, String(ctx.flags.resultFile)));
-                        const to = path.resolve(ctx.cwd, String(ctx.flags.to));
+                        const requested = path.resolve(ctx.cwd, String(ctx.flags.to));
+                        // An audit's --to is the finished report; the summary never replaces it.
+                        const keepsReport = ctx.flags.agent === AUDIT_AGENT &&
+                            fs.existsSync(requested) &&
+                            fs.statSync(requested).size > 0;
+                        const resultFile = path.resolve(ctx.cwd, String(ctx.flags.resultFile));
+                        const to = keepsReport
+                            ? path.join(path.dirname(resultFile), `${path.basename(resultFile, path.extname(resultFile))}.summary.md`)
+                            : requested;
                         fs.mkdirSync(path.dirname(to), { recursive: true });
                         fs.writeFileSync(to, rendered.text);
                         ctx.emit({
-                            file: String(ctx.flags.to),
+                            file: keepsReport ? path.relative(ctx.cwd, to) : String(ctx.flags.to),
+                            ...(keepsReport ? { reportKept: String(ctx.flags.to) } : {}),
                             fingerprint: rendered.fingerprint,
                             ...rendered.extra,
                         });
