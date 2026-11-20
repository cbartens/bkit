diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 7d6d4417a..369927ab5 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1025,7 +1025,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 | `ship.merge` | `{ "ask": true, "maxAttempts": 2 }` | Failed arrivals at Step 10: gate refusals plus failed merges | `Q1 — Merge: …` when the allowance is used up on a refusal |
 
 - **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.holistic`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
-- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. The check reads `bkit.workflows` before a code step's `bkit:generate` runs: a difference from `HEAD` is the step's own edit and exits 13 everywhere; a difference `bkit:generate` makes also exits 13, except in bkit's own repository (its main checkout is the engine's package root) when it only adds keys, which ride the step's commit and are listed in the output and the `step-done` row as `generatedWorkflows`. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
+- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. The check reads `bkit.workflows` before a code step's `bkit:generate` runs: a difference from `HEAD` is the step's own edit and exits 13 everywhere; a difference `bkit:generate` makes also exits 13, except in bkit's own repository (its main checkout is the engine's package root) when it only adds keys, which ride the step's commit and are listed in the output and the `step-done` row as `generatedWorkflows`. In bkit's own repository finish also judges a difference already in the working file (a key the agent's own `bkit:generate` run seeded, or one an earlier refused finish left) by what `bkit:generate` makes of `HEAD`'s values: it sets the working `bkit.workflows` aside, writes `HEAD`'s into `package.json`, runs `bkit:generate`, and a working reading equal to the result was generated and rides; any other difference is the step's own edit, the working reading is written back untouched and finish exits 13, and so does a failed `bkit:generate` with such a difference. Elsewhere finish never rewrites `package.json`. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
 - **Headless** (`runtimeHeadless` true, GitHub Actions only) behaves as `ask: false` at every point. `bkit counters route` and `counters max` print `ask` already false when headless.
 - **`ask: false`:** loop questions take the recommendation; `Fix now` is applied; `Accept` is recorded as assumed. Hard blockers are still asked in a session and go to the Failure Path headless.
 - **Question layout**, every point: the `{workflow} {point}: attempt {n} of {max}` line (loop questions; `turn` for the grill), then the shape in `.bkit/authoring.md` § Human questions. Option names: `Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`. Each step routing on the owner's answer reads a lettered reply (`B`, `B)`, `B) {option}`) as the option it labels; `parseDecisionItems` reads a `Decision:` line the same way (`optionAnswer`).
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 7f9d151d4..95bed3456 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -5,6 +5,7 @@ import * as path from "node:path";
 
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
+import { appendFrictionRow, frictionRow } from "../../ledgers/journal";
 import { DEFERRAL_WRITERS, KIND_WRITERS } from "../../ledgers/telemetry";
 import { parseText } from "../../shared/text";
 import { runCommand } from "../lib";
@@ -3755,4 +3756,132 @@ describe("bkit steps finish — a build code step makes the generated output cur
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
     expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED);
   });
+
+  /** Rewrite the working package.json so `bkit.workflows` carries `workflows`, and return the exact text written. */
+  function writeWorkflows(cwd: string, workflows: Record<string, unknown>) {
+    const p = path.join(cwd, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(p, "utf-8")) as Record<string, unknown>;
+    pkg["bkit"] = { workflows };
+    fs.writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`);
+    return fs.readFileSync(p, "utf-8");
+  }
+  const pkgText = (cwd: string) => fs.readFileSync(path.join(cwd, "package.json"), "utf-8");
+
+  it("in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit", async () => {
+    const cwd = stale(ADD_KEY, OK_HOOK);
+    asBkitRepo(cwd);
+    const own = spawnSync("sh", ["-c", ADD_KEY], { cwd, encoding: "utf-8" });
+    expect(own.status).toBe(0);
+    expect(JSON.parse(pkgText(cwd)).bkit.workflows.seeded).toBe(true);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.err).not.toContain("own edit");
+    expect(r.code).toBe(0);
+    expect(git(cwd, "rev-parse", "HEAD")).not.toBe(head);
+    expect(JSON.parse(git(cwd, "show", "HEAD:package.json")).bkit.workflows.seeded).toBe(true);
+    const rows = stepRows(cwd);
+    expect(rows).toHaveLength(1);
+    expect(JSON.stringify(rows[0])).toContain("seeded");
+  });
+
+  it("in bkit's own repo a generated added key left by a finish the hook refused rides the re-run", async () => {
+    const cwd = stale(
+      ADD_KEY,
+      "#!/bin/sh\nif [ ! -f .git/hook-once ]; then touch .git/hook-once; echo first refusal >&2; exit 1; fi\nexit 0\n",
+    );
+    asBkitRepo(cwd);
+    const first = await run(cwd, EXECUTE);
+    expect(first.code).toBe(8);
+    const second = await run(cwd, EXECUTE);
+    expect(second.err).not.toContain("own edit");
+    expect(second.code).toBe(0);
+    expect(JSON.parse(git(cwd, "show", "HEAD:package.json")).bkit.workflows.seeded).toBe(true);
+    const rows = stepRows(cwd);
+    expect(rows).toHaveLength(1);
+    expect(JSON.stringify(rows[0])).toContain("seeded");
+  });
+
+  it("in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it", async () => {
+    const cwd = stale(ADD_KEY, OK_HOOK);
+    asBkitRepo(cwd);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const written = writeWorkflows(cwd, { hand: true });
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(r.err).toContain("hand");
+    expect(r.err).toContain("own edit");
+    expect(pkgText(cwd)).toBe(written);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value", async () => {
+    const cwd = stale(ADD_KEY, OK_HOOK);
+    asBkitRepo(cwd);
+    const head = git(cwd, "rev-parse", "HEAD");
+    writeWorkflows(cwd, { seeded: false });
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(r.err).toContain("seeded");
+    expect(r.err).toContain("own edit");
+    expect(JSON.parse(pkgText(cwd)).bkit.workflows.seeded).toBe(false);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json", async () => {
+    const cwd = stale("cp package.json generate-saw.json", OK_HOOK);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const written = writeWorkflows(cwd, { hand: true });
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(fs.readFileSync(path.join(cwd, "generate-saw.json"), "utf-8")).toContain("hand");
+    expect(pkgText(cwd)).toBe(written);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13", async () => {
+    const cwd = stale(`${ADD_KEY}; exit 3`, OK_HOOK);
+    asBkitRepo(cwd);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const written = writeWorkflows(cwd, { hand: true });
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(r.err).toContain("own edit");
+    expect(pkgText(cwd)).toBe(written);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("in bkit's own repo a bkit:generate that leaves package.json unparseable gets the step's original package.json back and exits 13", async () => {
+    const cwd = stale('echo "{broken" > package.json; exit 3', OK_HOOK);
+    asBkitRepo(cwd);
+    const written = writeWorkflows(cwd, { hand: true });
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(r.err).toContain("original package.json");
+    expect(pkgText(cwd)).toBe(written);
+  });
+
+  it("a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step", async () => {
+    const cwd = stale(BOOM, OK_HOOK);
+    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
+    const seed = frictionRow({
+      workflow: "build",
+      step: "build-plan-tasks",
+      noun: "steps",
+      verb: "finish",
+      code: 11,
+      bookRoot: cwd,
+    });
+    seed["category"] = "agent-rework";
+    seed["severity"] = "LOW";
+    seed["summary"] = "a code step edited a planned test case";
+    seed["description"] = "refused build-plan-tasks with exit 11: a test changed";
+    expect(appendFrictionRow(cwd, seed).ok).toBe(true);
+    const r = await run(cwd, EXECUTE);
+    vi.unstubAllEnvs();
+    expect(r.code).toBe(0);
+    const rows = frictionRows(cwd);
+    expect(rows.length).toBeGreaterThanOrEqual(2);
+    expect(rows[rows.length - 1]?.["summary"]).toBe("bkit:generate failed at a code step's finish");
+    expect(rows[0]?.["summary"]).toBe("a code step edited a planned test case");
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index e64e395a0..82a800f94 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -137,6 +137,7 @@ function recordGenerateFriction(top: string, step: string, status: string): void
     bookRoot: top,
     parentSha: git(top, ["rev-parse", "HEAD"]) ?? undefined,
   });
+  row["key"] = `steps-finish-generate/${step}`;
   row["category"] = "agent-rework";
   row["severity"] = "LOW";
   row["summary"] = "bkit:generate failed at a code step's finish";
@@ -1108,8 +1109,8 @@ function recordedPath(cwd: string, fid: string | undefined, rel: string): boolea
   return rec !== null && rec.paths.some((p) => p.path === rel);
 }
 
-/** The `bkit.workflows` object of HEAD's or the working tree's package.json; `{}` when unreadable. */
-function readWorkflows(top: string, side: "head" | "work"): unknown {
+/** HEAD's or the working tree's package.json parsed; `null` when it cannot be read as JSON. */
+function readPackage(top: string, side: "head" | "work"): unknown {
   const file = path.join(top, "package.json");
   const parsed =
     side === "head"
@@ -1119,9 +1120,53 @@ function readWorkflows(top: string, side: "head" | "work"): unknown {
       : fs.existsSync(file)
         ? parseJson(fs.readFileSync(file, "utf-8"))
         : { ok: true as const, value: {} };
-  if (!parsed.ok) return {};
-  const pkg = parsed.value;
-  return (isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined) ?? {};
+  return parsed.ok ? parsed.value : null;
+}
+
+/** The raw `bkit.workflows` of a side's package.json: `undefined` when absent. */
+function rawWorkflows(top: string, side: "head" | "work"): unknown {
+  const pkg = readPackage(top, side);
+  return isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined;
+}
+
+/** The `bkit.workflows` object of HEAD's or the working tree's package.json; `{}` when unreadable. */
+function readWorkflows(top: string, side: "head" | "work"): unknown {
+  return rawWorkflows(top, side) ?? {};
+}
+
+/**
+ * Write `workflows` into the working package.json's `bkit.workflows` and leave the rest of the
+ * file as parsed (`undefined` removes the key). False when the file cannot be read or written.
+ */
+function writeWorkflows(top: string, workflows: unknown): boolean {
+  const file = path.join(top, "package.json");
+  const pkg = readPackage(top, "work");
+  if (!isRecord(pkg) || !fs.existsSync(file)) return false;
+  const bkit = isRecord(pkg.bkit) ? { ...pkg.bkit } : {};
+  if (workflows === undefined) delete bkit.workflows;
+  else bkit.workflows = workflows;
+  if (Object.keys(bkit).length > 0 || isRecord(pkg.bkit)) pkg.bkit = bkit;
+  try {
+    fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
+    return true;
+  } catch {
+    return false;
+  }
+}
+
+/**
+ * Write the set-aside `bkit.workflows` reading back; when the structured write fails (the file is
+ * unreadable after generate) the step's original package.json bytes go back instead. False only
+ * when neither write lands.
+ */
+function restoreKept(top: string, kept: { value: unknown; bytes: string }): boolean {
+  if (writeWorkflows(top, kept.value)) return true;
+  try {
+    fs.writeFileSync(path.join(top, "package.json"), kept.bytes);
+  } catch {
+    return false;
+  }
+  return false;
 }
 
 /** True when the dotted key path exists in `obj`. */
@@ -1456,13 +1501,39 @@ async function finish(ctx: RunContext): Promise<number> {
   // first, so the lock, the workflows check and the commit all judge the committed tree.
   let generate: "ran" | "undeclared" | "failed" | null = null;
   let workflowsBefore: unknown;
+  /** Keys of a `bkit.workflows` difference that `bkit:generate` cannot account for (bkit's own repo only). */
+  let ownWorkflowKeys: string[] = [];
   let addedWorkflowKeys: string[] = [];
+  /** The kept reading could not be written back: the step's own bytes are restored and finish refuses. */
+  const refuseWriteBack = (): number => {
+    ctx.log(
+      "the step's own bkit.workflows reading could not be written back after bkit:generate; its original package.json is restored: fix package.json, then finish again (nothing written)",
+    );
+    ctx.emit({ pass: false, changed: [] });
+    return EXIT_WORKFLOWS_CHANGED;
+  };
   if (workflow === "build" && CODE_STEPS.has(step) && commit === "auto") {
     const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
     if (resolveGate(top, ["bkit:generate"]) === null) generate = "undeclared";
     else {
       const argv = scriptCommand("bkit:generate");
       workflowsBefore = readWorkflows(top, "work");
+      // In bkit's own repo a generated `bkit.workflows` change is what `bkit:generate` makes of
+      // HEAD's values: a working difference is set aside, generate runs from HEAD's values, and
+      // the working reading comes back unless generate produced exactly it.
+      let kept: { value: unknown; bytes: string } | undefined;
+      if (
+        isBkitOwnRepo(top) &&
+        !recordedPath(ctx.cwd, fidOfStatusFile(file), "package.json") &&
+        changedKeys(readWorkflows(top, "head"), workflowsBefore).length > 0
+      ) {
+        const keptValue = rawWorkflows(top, "work");
+        const keptBytes = fs.readFileSync(path.join(top, "package.json"), "utf-8");
+        if (writeWorkflows(top, rawWorkflows(top, "head"))) {
+          kept = { value: keptValue, bytes: keptBytes };
+          workflowsBefore = readWorkflows(top, "head");
+        }
+      }
       const res = spawnSync(argv[0]!, argv.slice(1), {
         cwd: top,
         encoding: "utf-8",
@@ -1477,7 +1548,22 @@ async function finish(ctx: RunContext): Promise<number> {
         recordGenerateFriction(top, step, status);
         ctx.log("generate: failed");
         generate = "failed";
-      } else generate = "ran";
+        if (kept !== undefined) {
+          if (!restoreKept(top, kept)) return refuseWriteBack();
+          ownWorkflowKeys = changedKeys(readWorkflows(top, "head"), readWorkflows(top, "work"));
+        }
+      } else {
+        generate = "ran";
+        if (kept !== undefined) {
+          const generated = readWorkflows(top, "work");
+          const kept0 = kept.value ?? {};
+          const diff = changedKeys(kept0, generated);
+          if (diff.length > 0) {
+            if (!restoreKept(top, kept)) return refuseWriteBack();
+            ownWorkflowKeys = diff;
+          }
+        }
+      }
     }
   }
 
@@ -1715,7 +1801,7 @@ async function finish(ctx: RunContext): Promise<number> {
     const wfHead = readWorkflows(wfTop, "head");
     const wfAfter = readWorkflows(wfTop, "work");
     const wfBefore = workflowsBefore === undefined ? wfAfter : workflowsBefore;
-    const own = changedKeys(wfHead, wfBefore);
+    const own = ownWorkflowKeys.length > 0 ? ownWorkflowKeys : changedKeys(wfHead, wfBefore);
     if (own.length > 0) {
       ctx.log(
         `the step's own edit changes bkit.workflows in package.json (${own.join(", ")}): restore HEAD's values, then finish again (nothing written)`,
@@ -2231,7 +2317,7 @@ export const stepsCommand: CommandSpec = {
         [EXIT_LATER_ATTEMPT]:
           "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
         [EXIT_WORKFLOWS_CHANGED]:
-          "the commit would change bkit.workflows in package.json: the step's own edit, or a change `bkit:generate` made (`changed` names the keys); in bkit's own repository a generated change that only adds keys rides the commit instead and is listed in `generatedWorkflows` (nothing written)",
+          "the commit would change bkit.workflows in package.json: the step's own edit, or a change `bkit:generate` made (`changed` names the keys); in bkit's own repository a generated change that only adds keys (a working difference `bkit:generate` reproduces from HEAD's values counts as generated) rides the commit instead and is listed in `generatedWorkflows` (nothing written)",
         [EXIT_SOURCE_TOUCHED]:
           "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
       },
diff --git a/.bkit/version b/.bkit/version
index d586926cb..bf5f0170c 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "194175488cbeed73d3d8a92bc6d2b50efa6ad2c8cda691213056fdbbdcecf4ab",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "393e23653b8404b3399b1560425113ff4ae84f8b1f80e7f7a7f193056166390f",
+    ".bkit/workflows.md": "da1f256557bfa611c00a7778e352b9db105d852ee74c58280543f0fbc4f302fb",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 22319fa3a..6c32b9e3a 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1025,7 +1025,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 | `ship.merge` | `{ "ask": true, "maxAttempts": 2 }` | Failed arrivals at Step 10: gate refusals plus failed merges | `Q1 — Merge: …` when the allowance is used up on a refusal |
 
 - **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.holistic`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
-- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. The check reads `bkit.workflows` before a code step's `bkit:generate` runs: a difference from `HEAD` is the step's own edit and exits 13 everywhere; a difference `bkit:generate` makes also exits 13, except in bkit's own repository (its main checkout is the engine's package root) when it only adds keys, which ride the step's commit and are listed in the output and the `step-done` row as `generatedWorkflows`. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
+- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. The check reads `bkit.workflows` before a code step's `bkit:generate` runs: a difference from `HEAD` is the step's own edit and exits 13 everywhere; a difference `bkit:generate` makes also exits 13, except in bkit's own repository (its main checkout is the engine's package root) when it only adds keys, which ride the step's commit and are listed in the output and the `step-done` row as `generatedWorkflows`. In bkit's own repository finish also judges a difference already in the working file (a key the agent's own `bkit:generate` run seeded, or one an earlier refused finish left) by what `bkit:generate` makes of `HEAD`'s values: it sets the working `bkit.workflows` aside, writes `HEAD`'s into `package.json`, runs `bkit:generate`, and a working reading equal to the result was generated and rides; any other difference is the step's own edit, the working reading is written back untouched and finish exits 13, and so does a failed `bkit:generate` with such a difference. Elsewhere finish never rewrites `package.json`. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
 - **Headless** (`runtimeHeadless` true, GitHub Actions only) behaves as `ask: false` at every point. `bkit counters route` and `counters max` print `ask` already false when headless.
 - **`ask: false`:** loop questions take the recommendation; `Fix now` is applied; `Accept` is recorded as assumed. Hard blockers are still asked in a session and go to the Failure Path headless.
 - **Question layout**, every point: the `{workflow} {point}: attempt {n} of {max}` line (loop questions; `turn` for the grill), then the shape in `.bkit/authoring.md` § Human questions. Option names: `Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`. Each step routing on the owner's answer reads a lettered reply (`B`, `B)`, `B) {option}`) as the option it labels; `parseDecisionItems` reads a `Decision:` line the same way (`optionAnswer`).
diff --git a/DETAILS.md b/DETAILS.md
index 62e659cdc..7b0524b78 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,15 +347,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>2004 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>2008 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>381 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
-    n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
+    n_bkit_core_engine_shared["shared<br/>158 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|494| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|429| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|497| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|224| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 3b952c0a5..0cadc769c 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -75,6 +75,7 @@ function recordGenerateFriction(top, step, status) {
         bookRoot: top,
         parentSha: git(top, ["rev-parse", "HEAD"]) ?? undefined,
     });
+    row["key"] = `steps-finish-generate/${step}`;
     row["category"] = "agent-rework";
     row["severity"] = "LOW";
     row["summary"] = "bkit:generate failed at a code step's finish";
@@ -874,8 +875,8 @@ function recordedPath(cwd, fid, rel) {
     const rec = fid === undefined ? null : activeRecord(cwd, fid);
     return rec !== null && rec.paths.some((p) => p.path === rel);
 }
-/** The `bkit.workflows` object of HEAD's or the working tree's package.json; `{}` when unreadable. */
-function readWorkflows(top, side) {
+/** HEAD's or the working tree's package.json parsed; `null` when it cannot be read as JSON. */
+function readPackage(top, side) {
     const file = path.join(top, "package.json");
     const parsed = side === "head"
         ? runGit(top, ["cat-file", "-e", "HEAD:package.json"]).ok
@@ -884,10 +885,56 @@ function readWorkflows(top, side) {
         : fs.existsSync(file)
             ? parseJson(fs.readFileSync(file, "utf-8"))
             : { ok: true, value: {} };
-    if (!parsed.ok)
-        return {};
-    const pkg = parsed.value;
-    return (isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined) ?? {};
+    return parsed.ok ? parsed.value : null;
+}
+/** The raw `bkit.workflows` of a side's package.json: `undefined` when absent. */
+function rawWorkflows(top, side) {
+    const pkg = readPackage(top, side);
+    return isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined;
+}
+/** The `bkit.workflows` object of HEAD's or the working tree's package.json; `{}` when unreadable. */
+function readWorkflows(top, side) {
+    return rawWorkflows(top, side) ?? {};
+}
+/**
+ * Write `workflows` into the working package.json's `bkit.workflows` and leave the rest of the
+ * file as parsed (`undefined` removes the key). False when the file cannot be read or written.
+ */
+function writeWorkflows(top, workflows) {
+    const file = path.join(top, "package.json");
+    const pkg = readPackage(top, "work");
+    if (!isRecord(pkg) || !fs.existsSync(file))
+        return false;
+    const bkit = isRecord(pkg.bkit) ? { ...pkg.bkit } : {};
+    if (workflows === undefined)
+        delete bkit.workflows;
+    else
+        bkit.workflows = workflows;
+    if (Object.keys(bkit).length > 0 || isRecord(pkg.bkit))
+        pkg.bkit = bkit;
+    try {
+        fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
+        return true;
+    }
+    catch {
+        return false;
+    }
+}
+/**
+ * Write the set-aside `bkit.workflows` reading back; when the structured write fails (the file is
+ * unreadable after generate) the step's original package.json bytes go back instead. False only
+ * when neither write lands.
+ */
+function restoreKept(top, kept) {
+    if (writeWorkflows(top, kept.value))
+        return true;
+    try {
+        fs.writeFileSync(path.join(top, "package.json"), kept.bytes);
+    }
+    catch {
+        return false;
+    }
+    return false;
 }
 /** True when the dotted key path exists in `obj`. */
 function hasKeyPath(obj, dotted) {
@@ -1182,7 +1229,15 @@ async function finish(ctx) {
     // first, so the lock, the workflows check and the commit all judge the committed tree.
     let generate = null;
     let workflowsBefore;
+    /** Keys of a `bkit.workflows` difference that `bkit:generate` cannot account for (bkit's own repo only). */
+    let ownWorkflowKeys = [];
     let addedWorkflowKeys = [];
+    /** The kept reading could not be written back: the step's own bytes are restored and finish refuses. */
+    const refuseWriteBack = () => {
+        ctx.log("the step's own bkit.workflows reading could not be written back after bkit:generate; its original package.json is restored: fix package.json, then finish again (nothing written)");
+        ctx.emit({ pass: false, changed: [] });
+        return EXIT_WORKFLOWS_CHANGED;
+    };
     if (workflow === "build" && CODE_STEPS.has(step) && commit === "auto") {
         const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
         if (resolveGate(top, ["bkit:generate"]) === null)
@@ -1190,6 +1245,20 @@ async function finish(ctx) {
         else {
             const argv = scriptCommand("bkit:generate");
             workflowsBefore = readWorkflows(top, "work");
+            // In bkit's own repo a generated `bkit.workflows` change is what `bkit:generate` makes of
+            // HEAD's values: a working difference is set aside, generate runs from HEAD's values, and
+            // the working reading comes back unless generate produced exactly it.
+            let kept;
+            if (isBkitOwnRepo(top) &&
+                !recordedPath(ctx.cwd, fidOfStatusFile(file), "package.json") &&
+                changedKeys(readWorkflows(top, "head"), workflowsBefore).length > 0) {
+                const keptValue = rawWorkflows(top, "work");
+                const keptBytes = fs.readFileSync(path.join(top, "package.json"), "utf-8");
+                if (writeWorkflows(top, rawWorkflows(top, "head"))) {
+                    kept = { value: keptValue, bytes: keptBytes };
+                    workflowsBefore = readWorkflows(top, "head");
+                }
+            }
             const res = spawnSync(argv[0], argv.slice(1), {
                 cwd: top,
                 encoding: "utf-8",
@@ -1206,9 +1275,25 @@ async function finish(ctx) {
                 recordGenerateFriction(top, step, status);
                 ctx.log("generate: failed");
                 generate = "failed";
+                if (kept !== undefined) {
+                    if (!restoreKept(top, kept))
+                        return refuseWriteBack();
+                    ownWorkflowKeys = changedKeys(readWorkflows(top, "head"), readWorkflows(top, "work"));
+                }
             }
-            else
+            else {
                 generate = "ran";
+                if (kept !== undefined) {
+                    const generated = readWorkflows(top, "work");
+                    const kept0 = kept.value ?? {};
+                    const diff = changedKeys(kept0, generated);
+                    if (diff.length > 0) {
+                        if (!restoreKept(top, kept))
+                            return refuseWriteBack();
+                        ownWorkflowKeys = diff;
+                    }
+                }
+            }
         }
     }
     if (workflow === "build" && CODE_STEPS.has(step)) {
@@ -1415,7 +1500,7 @@ async function finish(ctx) {
         const wfHead = readWorkflows(wfTop, "head");
         const wfAfter = readWorkflows(wfTop, "work");
         const wfBefore = workflowsBefore === undefined ? wfAfter : workflowsBefore;
-        const own = changedKeys(wfHead, wfBefore);
+        const own = ownWorkflowKeys.length > 0 ? ownWorkflowKeys : changedKeys(wfHead, wfBefore);
         if (own.length > 0) {
             ctx.log(`the step's own edit changes bkit.workflows in package.json (${own.join(", ")}): restore HEAD's values, then finish again (nothing written)`);
             ctx.emit({ pass: false, changed: own });
@@ -1877,7 +1962,7 @@ export const stepsCommand = {
                 [EXIT_OUTSIDE_DOCS]: "--docs-only and the step staged a file outside the artifact tree (nothing written)",
                 [EXIT_TESTS_TOUCHED]: "build plan-execute / plan-gaps-remediate: a planned test case (of any group) differs from the lines recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back, or to keep the edit and log ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (Gap {N} in a gaps fix) in the step's log, which lets that change through and records it in the row's `changedTests`; other edits to the file stay (nothing written; an agent-rework friction row is appended). A BLOCKED test that removes lines of a ticked task's planned test is contradicted instead: no BLOCKED line keeps it, the engine adds a takeover task and its build-takeover row (once per test, however often the finish runs) and lists it in `contradicts`; the agent puts it back",
                 [EXIT_LATER_ATTEMPT]: "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
-                [EXIT_WORKFLOWS_CHANGED]: "the commit would change bkit.workflows in package.json: the step's own edit, or a change `bkit:generate` made (`changed` names the keys); in bkit's own repository a generated change that only adds keys rides the commit instead and is listed in `generatedWorkflows` (nothing written)",
+                [EXIT_WORKFLOWS_CHANGED]: "the commit would change bkit.workflows in package.json: the step's own edit, or a change `bkit:generate` made (`changed` names the keys); in bkit's own repository a generated change that only adds keys (a working difference `bkit:generate` reproduces from HEAD's values counts as generated) rides the commit instead and is listed in `generatedWorkflows` (nothing written)",
                 [EXIT_SOURCE_TOUCHED]: "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
             },
             run: finish,
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 4eda4bed3..81365a721 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -126,15 +126,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>2004 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>2008 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>381 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
-    n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
+    n_bkit_core_engine_shared["shared<br/>158 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|494| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|429| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|497| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|224| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
@@ -226,7 +226,7 @@ flowchart LR
     n_bkit_core_engine_install_modules_index[".bkit/core/engine/install/modules/index<br/>12 symbols · 1 files"]
     n_bkit_core_engine_install_version_file[".bkit/core/engine/install/version-file<br/>18 symbols · 1 files"]
     n_bkit_core_engine_install_write[".bkit/core/engine/install/write<br/>41 symbols · 1 files"]
-    n_bkit_core_engine_shared_package_roots[".bkit/core/engine/shared/package-roots<br/>14 symbols · 1 files"]
+    n_bkit_core_engine_shared_package_roots[".bkit/core/engine/shared/package-roots<br/>15 symbols · 1 files"]
   end
   subgraph gncustom_telemetry["Telemetry"]
     n_bkit_core_engine_commands_analysis[".bkit/core/engine/commands/analysis<br/>36 symbols · 1 files"]
@@ -295,7 +295,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_status["status<br/>40 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_base["step-base<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_table["step-table<br/>15 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_steps["steps<br/>75 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_steps["steps<br/>79 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary["summary<br/>35 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>23 symbols · 1 files"]
@@ -457,6 +457,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_ledgers -->|10| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_runtime -->|10| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_steps -->|10| n_bkit_core_engine_ledgers_journal
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_workflow_branches
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_checks_status_holes
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_land
@@ -531,7 +532,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_locks
-  n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
   n_bkit_core_engine_commands_workflow_summary -->|7| n_bkit_core_engine_commands_workflow_open_decision
   n_bkit_core_engine_commands_workflow_summary -->|7| n_bkit_core_engine_commands_workflow_plans
   n_bkit_core_engine_commands_workflow_workflows -->|7| n_bkit_core_engine_commands_workflow_summary
@@ -848,7 +848,7 @@ flowchart LR
   linkStyle 156 stroke:#59636eb3,stroke-width:3px
   linkStyle 157 stroke:#59636eb3,stroke-width:3px
   linkStyle 158 stroke:#59636eb3,stroke-width:3px
-  linkStyle 159 stroke:#59636e80,stroke-width:2px
+  linkStyle 159 stroke:#59636eb3,stroke-width:3px
   linkStyle 160 stroke:#59636e80,stroke-width:2px
   linkStyle 161 stroke:#59636e80,stroke-width:2px
   linkStyle 162 stroke:#59636e80,stroke-width:2px
diff --git a/docs/testing.md b/docs/testing.md
index c25ea4e13..66ae7ebcc 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -945,7 +945,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/lib.test.ts` | Unit (boundary: real temp git repo + linked worktree) | Flag parsing and usage errors (a literal `{UPPER}` placeholder in any flag or positional value refused, exit 2), the `invocation-context/` folder is `0700` whether created or found, dispatch and classic-verb collision (`bkit status`), help rendering, exit-code mapping, UTC month, skip-CI tokens, repo root from a worktree, `status.jsonl` location per workflow kind, the active run a call is journaled under (`--fid` never matches another feature's run, and finds its own run from an earlier month); the tests-lock status file (`readLockStatus`, `classifyLockOutcome`): a give-up or refusal is read from the file and the exit code alone, a reworded script sentence changes nothing, and an absent, empty or other-lock file reads as a gate result. |
 | `commands/workflow/status.test.ts` | Unit | `bkit status path / route / meta / resume` (debug's resume prints Step 3's test round as `counters derive` and `status route` read it, exit 4 past Step 3 with none): location per workflow kind, active-run verdict / failures, the step's last `parentSha` and `source` per group, all-runs strategy, `nextStrategy` / `repeatTests` from repeated failing tests on the fix step's test step, run-level mode over step mode, `--require` failures, `route --expect=field=value` (exit 4 when it differs or is missing), meta append + validation; the fold skips a row it does not model, a line that is not JSON exits 3; `route --workflow=build` publish: the `publish=true\|false` token over `publish.local`, `local` read on LOCAL, `false` coerced to `true` on any other runtime, an unknown token value falling through to config, and `publishSource` (`token` / `local` / `remote` / `coerced`); `route --step` prints no `cleanBase` field; The engine-only row types `decision-counts` and `decision-answer` are refused by `status row`; `status resume` `gateRerun` true (with `rerunFrom` the `From` header, `holistic` included) only for the active run's `OPEN` `Gate: FAIL` pause whose loop question is its only undecided question (the pause may be laid out in two files), false when another question is undecided, the pause is closed or no run is active; a verify, holistic, tests or fix-step pause written before `decisions counts` ran resumes exactly as a run with no file does (Step 8, 10 or 12, or Step 8 after `build-plan-gaps-remediate` and Step 7 after `build-plan-gaps-remediate-holistic`), with `counters derive --step=build-decision --position=next` still on the same decision number. |
 | `commands/workflow/counters.test.ts` | Unit | `bkit counters derive / run / route / max`: the three positions, `current` refusing 0, active-run scoping, group isolation (empty `--group` rejected), `--all-runs`, de-dupe, metacharacter step names, run numbering incl. resume + interleave (a resumed build after an interleaved debug run keeps its run and budget), fail-closed value / max (max 0: value 0 continues, value 1 routes to `exceeded`), `--point` (limit and `ask`, `max --point`), `route --of=<step>:<pos>` deriving the value (group scoped, `current` with no own row → exit 4), `route --of=<step>,<step>:count` summing several steps (off `:count`, repeated or empty entry → exit 2), `--of` plus `--rows` summed; holistic fix rounds counted within the run with no reset after a clean check (`build.holistic`, falling back to the current `package.json` setting when the run's frozen limits lack it); `--since-clean` refused on `route` and `grant` as an unknown flag (exit 2). |
-| `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit (8: row rolled back and the index restored byte-for-byte — a pre-staged status.jsonl, a partly staged file, a caller-staged path a bracketed new path glob-matches, a status.jsonl the hook removed; 82: another writer's row appended during the commit stays), header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope` (a `build-holistic-gate` row without `scope` refused), `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, each declared count rule checked against the report body (a wrong count or missing verdict is refused and handed back to its writer), attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents, a `true \| false` field true when any agent sets it; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`, `--ref` reading the file as committed on a ref (3 when the ref lacks it). `steps finish` locks a recorded red test only while a `TEST FIRST` line in the run's plan (beside its status file, `runPlanPath`) still names it; a name the plan dropped locks nothing. `steps finish --step=build-decision --field=route=continue` refuses (exit 1, no row) a decision file `decisions skip` would refuse. A build code step's `steps finish` runs the repo's `bkit:generate` before the commit: declared (a stale-output hook lets the commit through), undeclared and empty (nothing runs, the hook still exits 8), not a code step, failing (the step still lands with a friction row and `generate: failed`, whatever its verdict), a generated `bkit.workflows` key (exit 13 outside bkit's own repo; in it an added key rides the commit and the row, an edited or removed one and the step's own edit exit 13), an unrelated hook refusal (still 8), `--commit=none` (nothing runs). |
+| `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit (8: row rolled back and the index restored byte-for-byte — a pre-staged status.jsonl, a partly staged file, a caller-staged path a bracketed new path glob-matches, a status.jsonl the hook removed; 82: another writer's row appended during the commit stays), header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope` (a `build-holistic-gate` row without `scope` refused), `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, each declared count rule checked against the report body (a wrong count or missing verdict is refused and handed back to its writer), attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents, a `true \| false` field true when any agent sets it; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`, `--ref` reading the file as committed on a ref (3 when the ref lacks it). `steps finish` locks a recorded red test only while a `TEST FIRST` line in the run's plan (beside its status file, `runPlanPath`) still names it; a name the plan dropped locks nothing. `steps finish --step=build-decision --field=route=continue` refuses (exit 1, no row) a decision file `decisions skip` would refuse. A build code step's `steps finish` runs the repo's `bkit:generate` before the commit: declared (a stale-output hook lets the commit through), undeclared and empty (nothing runs, the hook still exits 8), not a code step, failing (the step still lands with a friction row and `generate: failed`, whatever its verdict), a generated `bkit.workflows` key (exit 13 outside bkit's own repo; in it an added key rides the commit and the row, an edited or removed one and the step's own edit exit 13; a working key the agent's own `bkit:generate` run or a refused finish left rides when `bkit:generate` reproduces it from HEAD's values, else exit 13 with `package.json` as the step wrote it, also after a failed generate; outside it `package.json` is never rewritten), a failed generate's friction row is its own row, not folded into the step's exit-11 row, an unrelated hook refusal (still 8), `--commit=none` (nothing runs). |
 | `commands/workflow/runtime.test.ts` | Unit (fake `gh` on `PATH`) | `bkit runtime detect / row / assert` — see § Runtime detection. |
 | `commands/workflow/repo.test.ts` | Unit (boundary: real temp git repo) | `bkit repo info`: owner / repo from `gh`, else the origin remote; neither → exit 3; detached HEAD → exit 4 unless `--allow-detached`; `behindDev` / `divergedAgo`, null (never a false 0) when `origin/dev` is unknown; `--fetch` failure logged, not fatal; `repoRoot` / `bkit` / `outboxRoot` name the main checkout from a worktree too; `sessionDir` is a new empty `sessions/<utc-time>-<random>/` folder per call, with name-stamped folders older than 7 days pruned; `bkitVersion` / `bkitLatest` / `bkitOutdated` / `bkitAdvisory` from a seeded cache: advisory printed when the pin is older, quiet when current or ahead, null (never an error) on a remembered registry failure or an unpinned repo; `buildPublishRemote` / `buildPublishLocal` printed, with the defaults when `package.json` omits them. |
 | `shared/bkit-latest.test.ts` | Unit (boundary: temp dirs, fake `pnpm` on PATH) | Outdated-bkit check: `compareSemver` numeric order (5.10.0 > 5.9.0) and prerelease order; unpinned and `BKIT_NO_UPDATE_CHECK` skip the registry (`0` does not); one lookup per day, a failed lookup remembered for an hour, corrupt / future-dated cache rewritten, no git dir → no cache; `lookupLatestPublished` null on a pnpm failure, non-version output, or no pnpm. |
