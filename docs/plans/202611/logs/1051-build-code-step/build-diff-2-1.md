diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index df68c6901..7d6d4417a 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1025,7 +1025,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 | `ship.merge` | `{ "ask": true, "maxAttempts": 2 }` | Failed arrivals at Step 10: gate refusals plus failed merges | `Q1 — Merge: …` when the allowance is used up on a refusal |
 
 - **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.holistic`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
-- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
+- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. The check reads `bkit.workflows` before a code step's `bkit:generate` runs: a difference from `HEAD` is the step's own edit and exits 13 everywhere; a difference `bkit:generate` makes also exits 13, except in bkit's own repository (its main checkout is the engine's package root) when it only adds keys, which ride the step's commit and are listed in the output and the `step-done` row as `generatedWorkflows`. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
 - **Headless** (`runtimeHeadless` true, GitHub Actions only) behaves as `ask: false` at every point. `bkit counters route` and `counters max` print `ask` already false when headless.
 - **`ask: false`:** loop questions take the recommendation; `Fix now` is applied; `Accept` is recorded as assumed. Hard blockers are still asked in a session and go to the Failure Path headless.
 - **Question layout**, every point: the `{workflow} {point}: attempt {n} of {max}` line (loop questions; `turn` for the grill), then the shape in `.bkit/authoring.md` § Human questions. Option names: `Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`. Each step routing on the owner's answer reads a lettered reply (`B`, `B)`, `B) {option}`) as the option it labels; `parseDecisionItems` reads a `Decision:` line the same way (`optionAnswer`).
@@ -1747,7 +1747,7 @@ Dependency inspection: `bkit:deps:outdated` / `bkit:deps:audit` exist so prompts
 `bkit:generate` is not a gate either: it rewrites every generated file and saved baseline (snapshots, coverage lists, generated docs) from the current working tree, in place, so a commit never carries code whose generated output is stale.
 
 - **Contract:** no arguments; idempotent, so a second run changes nothing; exit 0 on success, non-zero on failure.
-- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit, and `bkit steps finish` runs it again before the commit of each build code step (exit 16 when it fails); `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
+- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit, and `bkit steps finish` runs it again before the commit of each build code step (a failure is logged, appends a friction row and never stops the step); `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
 - **Undeclared:** every caller skips it.
 
 Not seeded, because which files a stack generates is the stack's business. A regenerated baseline is never a `TEST FIRST` test: regenerating it makes it pass, so it cannot fail first.
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 099aef413..7f9d151d4 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -23,10 +23,24 @@ import {
 } from "./steps";
 import { blockHash, runPlanPath } from "./tests";
 
+/** A scratch root the engine's package-root lookup answers with, or null for the real one. */
+const pkgRootOverride = vi.hoisted(() => ({ dir: null as string | null }));
+vi.mock("node:url", async (importOriginal) => {
+  const actual = await importOriginal<typeof import("node:url")>();
+  const fileURLToPath = (u: string | URL, o?: { windows?: boolean }) => {
+    const s = String(u);
+    if (pkgRootOverride.dir !== null && /\/shared\/package-roots\.(ts|js)$/.test(s))
+      return `${pkgRootOverride.dir}/.bkit/core/engine/shared/package-roots.ts`;
+    return actual.fileURLToPath(u, o);
+  };
+  return { ...actual, fileURLToPath, default: { ...actual, fileURLToPath } };
+});
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 
 const dirs: string[] = [];
 afterEach(() => {
+  pkgRootOverride.dir = null;
   for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
 });
 
@@ -3567,14 +3581,74 @@ describe("bkit steps finish — a build code step makes the generated output cur
     expect(fs.readFileSync(path.join(cwd, "built.txt"), "utf-8")).toBe("v1\n");
   });
 
+  const BOOM = "echo generate-boom >&2; exit 3";
+  const failedLog = (cwd: string, verdict: string) =>
+    write(
+      cwd,
+      "logs/execute-1-log.md",
+      `Verdict: ${verdict}\n\n<!-- verdict:end -->\n\n# Build Plan\n\nBLOCKED — bkit:generate: generate-boom\n`,
+    );
+  const frictionRows = (cwd: string) => {
+    const p = path.join(cwd, ".bkit/friction.jsonl");
+    return fs.existsSync(p)
+      ? fs
+          .readFileSync(p, "utf-8")
+          .trim()
+          .split("\n")
+          .filter((l) => l !== "")
+          .map((l) => JSON.parse(l) as Record<string, unknown>)
+      : [];
+  };
+  async function landsDespiteFailedGenerate(verdict: string) {
+    const cwd = stale(BOOM, "#!/bin/sh\nexit 0\n");
+    failedLog(cwd, verdict);
+    const head = git(cwd, "rev-parse", "HEAD");
+    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
+    const r = await run(cwd, EXECUTE);
+    vi.unstubAllEnvs();
+    expect(r.code).toBe(0);
+    expect(r.err).toContain("generate-boom");
+    expect(r.json.generate).toBe("failed");
+    expect(git(cwd, "rev-parse", "HEAD")).not.toBe(head);
+    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).not.toBe(SEED);
+    expect(frictionRows(cwd)).toHaveLength(1);
+    return { cwd, r };
+  }
+
+  it("a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs", async () => {
+    const { r } = await landsDespiteFailedGenerate("FAIL");
+    expect(r.json.verdict).toBe("FAIL");
+  });
+
+  it("a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens", async () => {
+    const { r } = await landsDespiteFailedGenerate("HANDOVER");
+    expect(r.json.verdict).toBe("HANDOVER");
+  });
+
+  it("a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit", async () => {
+    const { cwd, r } = await landsDespiteFailedGenerate("PASS");
+    expect(r.json.verdict).toBe("PASS");
+    expect(frictionRows(cwd)[0]).toEqual(
+      expect.objectContaining({
+        kind: "friction",
+        by: { workflow: "build", step: "build-plan-tasks" },
+      }),
+    );
+    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toContain("build-plan-tasks");
+  });
+
   it("a failing bkit:generate exits 16 with nothing written and nothing committed", async () => {
-    const cwd = stale("echo generate-boom >&2; exit 3");
+    const cwd = stale(BOOM, "#!/bin/sh\nexit 0\n");
     const head = git(cwd, "rev-parse", "HEAD");
+    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
     const r = await run(cwd, EXECUTE);
-    expect(r.code).toBe(16);
+    vi.unstubAllEnvs();
+    expect(r.code).toBe(0);
+    expect(r.code).not.toBe(16);
     expect(r.err).toContain("generate-boom");
-    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
-    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED);
+    expect(git(cwd, "rev-parse", "HEAD")).not.toBe(head);
+    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).not.toBe(SEED);
+    expect(frictionRows(cwd)).toHaveLength(1);
   });
 
   it("a hook refusal about something else stays exit 8 after bkit:generate ran", async () => {
@@ -3594,4 +3668,91 @@ describe("bkit steps finish — a build code step makes the generated output cur
     expect(r.json.generate).toBeNull();
     expect(fs.existsSync(path.join(cwd, "generate-ran.txt"))).toBe(false);
   });
+
+  const ADD_KEY =
+    'node -e \'const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf-8"));p.bkit={workflows:{...(p.bkit&&p.bkit.workflows),seeded:true}};fs.writeFileSync("package.json",JSON.stringify(p,null,2)+"\\n")\'';
+  const SET_LIMIT =
+    'node -e \'const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf-8"));p.bkit.workflows.limit=2;fs.writeFileSync("package.json",JSON.stringify(p,null,2)+"\\n")\'';
+  const OK_HOOK = "#!/bin/sh\nexit 0\n";
+  const stepRows = (cwd: string) =>
+    fs
+      .readFileSync(path.join(cwd, STATUS), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>)
+      .filter((r) => r.step === "build-plan-tasks");
+  /** Name the scratch repo as the engine's package root, with the prompts the engine reads from it. */
+  function asBkitRepo(cwd: string) {
+    fs.cpSync(path.join(REPO_ROOT, ".bkit/core/prompts"), path.join(cwd, ".bkit/core/prompts"), {
+      recursive: true,
+    });
+    pkgRootOverride.dir = cwd;
+  }
+  /** Commit a package.json carrying `bkit.workflows.limit` = 1 so the repo has an existing key. */
+  function withLimit(cwd: string, generate: string) {
+    write(
+      cwd,
+      "package.json",
+      `${JSON.stringify({ name: "x", scripts: { "bkit:generate": generate }, bkit: { workflows: { limit: 1 } } }, null, 2)}\n`,
+    );
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-q", "-m", "limit");
+  }
+
+  it("a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing", async () => {
+    const cwd = stale(ADD_KEY, OK_HOOK);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(r.err).toContain("bkit:generate");
+    expect(r.err).toContain("seeded");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED);
+  });
+
+  it("in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row", async () => {
+    const cwd = stale(ADD_KEY, OK_HOOK);
+    asBkitRepo(cwd);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(0);
+    expect(git(cwd, "rev-parse", "HEAD")).not.toBe(head);
+    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("package.json");
+    expect(JSON.parse(git(cwd, "show", "HEAD:package.json")).bkit.workflows.seeded).toBe(true);
+    expect(JSON.stringify(r.json)).toContain("seeded");
+    const rows = stepRows(cwd);
+    expect(rows).toHaveLength(1);
+    expect(JSON.stringify(rows[0])).toContain("seeded");
+  });
+
+  it("in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit", async () => {
+    const cwd = stale(COPY, OK_HOOK);
+    withLimit(cwd, COPY);
+    asBkitRepo(cwd);
+    const head = git(cwd, "rev-parse", "HEAD");
+    write(
+      cwd,
+      "package.json",
+      `${JSON.stringify({ name: "x", scripts: { "bkit:generate": COPY }, bkit: { workflows: { limit: 9 } } }, null, 2)}\n`,
+    );
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(r.err).toContain("limit");
+    expect(r.err).toContain("own edit");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED);
+  });
+
+  it("in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate", async () => {
+    const cwd = stale(SET_LIMIT, OK_HOOK);
+    withLimit(cwd, SET_LIMIT);
+    asBkitRepo(cwd);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(13);
+    expect(r.err).toContain("bkit:generate");
+    expect(r.err).toContain("limit");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 887e28565..e64e395a0 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -29,7 +29,7 @@ import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { scriptCommand } from "../../shared/package-manager.js";
-import { getPromptsRoot } from "../../shared/package-roots.js";
+import { getPromptsRoot, isBkitOwnRepo } from "../../shared/package-roots.js";
 import { readTextFile } from "../../shared/json.js";
 import {
   CommandError,
@@ -122,6 +122,29 @@ function recordTestLockFriction(top: string, step: string, named: string): void
   appendFrictionRow(top, row);
 }
 
+/**
+ * An `agent-rework` friction row for a failed `bkit:generate` at a code step's finish: the
+ * step still lands, so `bkit stats` counts it. Best effort.
+ */
+function recordGenerateFriction(top: string, step: string, status: string): void {
+  if (!journalEnabled()) return;
+  const row = frictionRow({
+    workflow: "build",
+    step,
+    noun: "steps",
+    verb: "finish",
+    code: null,
+    bookRoot: top,
+    parentSha: git(top, ["rev-parse", "HEAD"]) ?? undefined,
+  });
+  row["category"] = "agent-rework";
+  row["severity"] = "LOW";
+  row["summary"] = "bkit:generate failed at a code step's finish";
+  row["description"] =
+    `\`bkit steps finish\` ran the repo's \`bkit:generate\` for ${step} and it exited ${status}; the step landed and the generated output may be stale.`;
+  appendFrictionRow(top, row);
+}
+
 const VERDICT_END = "<!-- verdict:end -->";
 const DEFAULT_VERDICTS = ["PASS", "CONCERNS", "FAIL"];
 const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];
@@ -142,8 +165,6 @@ export const EXIT_LATER_ATTEMPT = 12;
 export const EXIT_WORKFLOWS_CHANGED = 13;
 /** finish (build plan-tests): the tests step's commit changes a file that is not one of the group's planned tests. */
 export const EXIT_SOURCE_TOUCHED = 15;
-/** finish (build code step): the repo's declared `bkit:generate` exited non-zero before the commit. */
-export const EXIT_GENERATE_FAILED = 16;
 
 /** The step whose subagent writes the group's TEST FIRST tests, before any task code. */
 export const PLAN_TESTS_STEP = "build-plan-tests";
@@ -1087,19 +1108,30 @@ function recordedPath(cwd: string, fid: string | undefined, rel: string): boolea
   return rec !== null && rec.paths.some((p) => p.path === rel);
 }
 
-function workflowsChange(cwd: string): string[] {
-  const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
+/** The `bkit.workflows` object of HEAD's or the working tree's package.json; `{}` when unreadable. */
+function readWorkflows(top: string, side: "head" | "work"): unknown {
   const file = path.join(top, "package.json");
-  const head = runGit(top, ["cat-file", "-e", "HEAD:package.json"]).ok
-    ? parseJson(runGit(top, ["show", "HEAD:package.json"]).stdout)
-    : { ok: true as const, value: {} };
-  const work = fs.existsSync(file)
-    ? parseJson(fs.readFileSync(file, "utf-8"))
-    : { ok: true as const, value: {} };
-  if (!head.ok || !work.ok) return [];
-  const workflows = (pkg: unknown) =>
-    (isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined) ?? {};
-  return changedKeys(workflows(head.value), workflows(work.value));
+  const parsed =
+    side === "head"
+      ? runGit(top, ["cat-file", "-e", "HEAD:package.json"]).ok
+        ? parseJson(runGit(top, ["show", "HEAD:package.json"]).stdout)
+        : { ok: true as const, value: {} }
+      : fs.existsSync(file)
+        ? parseJson(fs.readFileSync(file, "utf-8"))
+        : { ok: true as const, value: {} };
+  if (!parsed.ok) return {};
+  const pkg = parsed.value;
+  return (isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined) ?? {};
+}
+
+/** True when the dotted key path exists in `obj`. */
+function hasKeyPath(obj: unknown, dotted: string): boolean {
+  let at: unknown = obj;
+  for (const k of dotted.split(".")) {
+    if (!isRecord(at) || !(k in at)) return false;
+    at = at[k];
+  }
+  return true;
 }
 
 /** `soakAttempt` → `Soak Attempt`, for a comment header. */
@@ -1422,12 +1454,15 @@ async function finish(ctx: RunContext): Promise<number> {
   // ordinary code-step work the verifier reads in the diff. The holistic fix spans every group.
   // A code step's commit carries the repo's generated output: run the declared `bkit:generate`
   // first, so the lock, the workflows check and the commit all judge the committed tree.
-  let generate: "ran" | "undeclared" | null = null;
+  let generate: "ran" | "undeclared" | "failed" | null = null;
+  let workflowsBefore: unknown;
+  let addedWorkflowKeys: string[] = [];
   if (workflow === "build" && CODE_STEPS.has(step) && commit === "auto") {
     const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
     if (resolveGate(top, ["bkit:generate"]) === null) generate = "undeclared";
     else {
       const argv = scriptCommand("bkit:generate");
+      workflowsBefore = readWorkflows(top, "work");
       const res = spawnSync(argv[0]!, argv.slice(1), {
         cwd: top,
         encoding: "utf-8",
@@ -1435,15 +1470,14 @@ async function finish(ctx: RunContext): Promise<number> {
         maxBuffer: 1 << 26,
       });
       if (res.status !== 0) {
-        ctx.log(
-          `${argv.join(" ")} exited ${String(res.status ?? res.error?.message)}: fix it, then finish again (nothing written)`,
-        );
+        const status = String(res.status ?? res.error?.message);
+        ctx.log(`${argv.join(" ")} exited ${status}: the step lands anyway`);
         const out = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim();
         if (out !== "") for (const line of out.split("\n").slice(-20)) ctx.log(`  ${line}`);
-        ctx.emit({ pass: false, generate: "failed" });
-        return EXIT_GENERATE_FAILED;
-      }
-      generate = "ran";
+        recordGenerateFriction(top, step, status);
+        ctx.log("generate: failed");
+        generate = "failed";
+      } else generate = "ran";
     }
   }
 
@@ -1677,14 +1711,33 @@ async function finish(ctx: RunContext): Promise<number> {
   // package.json that was already dirty when the run started stays out of it: a recorded
   // one the run then changed is refused as foreign by the commit itself.
   if (commit === "auto" && !recordedPath(ctx.cwd, fidOfStatusFile(file), "package.json")) {
-    const changed = workflowsChange(ctx.cwd);
-    if (changed.length > 0) {
+    const wfTop = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
+    const wfHead = readWorkflows(wfTop, "head");
+    const wfAfter = readWorkflows(wfTop, "work");
+    const wfBefore = workflowsBefore === undefined ? wfAfter : workflowsBefore;
+    const own = changedKeys(wfHead, wfBefore);
+    if (own.length > 0) {
       ctx.log(
-        `the step's commit would change bkit.workflows in package.json (${changed.join(", ")}): restore HEAD's values, then finish again (nothing written)`,
+        `the step's own edit changes bkit.workflows in package.json (${own.join(", ")}): restore HEAD's values, then finish again (nothing written)`,
       );
-      ctx.emit({ pass: false, changed });
+      ctx.emit({ pass: false, changed: own });
       return EXIT_WORKFLOWS_CHANGED;
     }
+    const generated = changedKeys(wfBefore, wfAfter);
+    if (generated.length > 0) {
+      const allAdded = generated.every((k) => !hasKeyPath(wfBefore, k));
+      if (allAdded && isBkitOwnRepo(wfTop)) {
+        extras.generatedWorkflows = generated;
+        ctx.log(`bkit:generate added bkit.workflows keys to package.json: ${generated.join(", ")}`);
+        addedWorkflowKeys = generated;
+      } else {
+        ctx.log(
+          `bkit:generate changed bkit.workflows in package.json (${generated.join(", ")}): the step's commit may not carry it; fix the script or restore HEAD's values, then finish again (nothing written)`,
+        );
+        ctx.emit({ pass: false, changed: generated });
+        return EXIT_WORKFLOWS_CHANGED;
+      }
+    }
   }
 
   if (f.docsOnly === true && commit === "auto") {
@@ -1829,6 +1882,7 @@ async function finish(ctx: RunContext): Promise<number> {
     ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
     pass,
     generate,
+    ...(addedWorkflowKeys.length > 0 ? { generatedWorkflows: addedWorkflowKeys } : {}),
     checks,
     comment,
     // Written after the step's commit, so the commit never carries it.
@@ -2134,7 +2188,7 @@ export const stepsCommand: CommandSpec = {
         parentSha: "the row's parentSha: HEAD before the step's commit",
         commit: "the new commit's sha, or null with --commit=none",
         generate:
-          "a build code step's `bkit:generate`: ran, undeclared, failed (exit 16), or null (not a code step, or --commit=none)",
+          "a build code step's `bkit:generate`: ran, undeclared, failed (the step still lands; its last 20 lines are logged and a friction row is appended), or null (not a code step, or --commit=none)",
         pass: "every gate check passed",
         progressLine: "the exact chat progress line after a successful numbered completion",
         checks: "[{check, ok, detail}] per gate check",
@@ -2177,11 +2231,9 @@ export const stepsCommand: CommandSpec = {
         [EXIT_LATER_ATTEMPT]:
           "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
         [EXIT_WORKFLOWS_CHANGED]:
-          "the commit would change bkit.workflows in package.json (`changed` names the keys) (nothing written)",
+          "the commit would change bkit.workflows in package.json: the step's own edit, or a change `bkit:generate` made (`changed` names the keys); in bkit's own repository a generated change that only adds keys rides the commit instead and is listed in `generatedWorkflows` (nothing written)",
         [EXIT_SOURCE_TOUCHED]:
           "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
-        [EXIT_GENERATE_FAILED]:
-          "build code step: the repo's declared `bkit:generate` exited non-zero (its last 20 lines are logged) (nothing written)",
       },
       run: finish,
     },
diff --git a/.bkit/core/engine/install/payload-links.ts b/.bkit/core/engine/install/payload-links.ts
index 1367f5c2c..40a6612ff 100644
--- a/.bkit/core/engine/install/payload-links.ts
+++ b/.bkit/core/engine/install/payload-links.ts
@@ -5,7 +5,7 @@
 
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { getCoreRoot, getPkgRoot, getSharedRoot } from "../shared/package-roots.js";
+import { getCoreRoot, getSharedRoot, isBkitOwnRepo } from "../shared/package-roots.js";
 
 // The two view links: a symlink at the consumer-relative `relPath` pointing at the
 // package payload dir `target()` resolves to. Relative targets, so the link keeps
@@ -70,7 +70,7 @@ export function syncPayloadLinks(cwd: string, opts: { dryRun: boolean }): Payloa
     skippedRealDir: [],
     failed: [],
   };
-  if (path.resolve(cwd) === getPkgRoot()) return changes;
+  if (isBkitOwnRepo(cwd)) return changes;
 
   for (const { relPath, target } of PAYLOAD_LINKS) {
     const linkAbs = path.join(cwd, relPath);
diff --git a/.bkit/core/engine/install/template-copies.ts b/.bkit/core/engine/install/template-copies.ts
index 2254a8975..e2719b5a1 100644
--- a/.bkit/core/engine/install/template-copies.ts
+++ b/.bkit/core/engine/install/template-copies.ts
@@ -5,7 +5,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import {
   NPM_STRIP_REMAP,
-  getPkgRoot,
+  isBkitOwnRepo,
   getTemplatesRoot,
   TEMPLATE_COPIES_DIR,
 } from "../shared/package-roots.js";
@@ -59,7 +59,7 @@ export function syncTemplateCopies(
   opts: { dryRun: boolean; ws: WriteSet },
 ): TemplateCopyChanges {
   const changes: TemplateCopyChanges = { changed: [], added: [], removed: [] };
-  if (path.resolve(cwd) === getPkgRoot()) return changes;
+  if (isBkitOwnRepo(cwd)) return changes;
   const srcRoot = getTemplatesRoot();
   const dstRoot = path.join(cwd, TEMPLATE_COPIES_DIR);
 
@@ -181,7 +181,7 @@ function formatGateRunsBareLintStaged(cwd: string): boolean {
 // fix after the calling command's `logPrefix`. Prints in a dry run too; writes nothing. Returns
 // true when it printed. No-op in dogfood.
 export function warnMissingLintStagedConfig(cwd: string, logPrefix: string): boolean {
-  if (path.resolve(cwd) === getPkgRoot()) return false;
+  if (isBkitOwnRepo(cwd)) return false;
   if (!formatGateRunsBareLintStaged(cwd)) return false;
   if (!readDependencyNames(cwd).includes("lint-staged")) return false;
   if (hasLintStagedConfig(cwd)) return false;
diff --git a/.bkit/core/engine/shared/package-roots.ts b/.bkit/core/engine/shared/package-roots.ts
index 0ed29c454..8c4ffdaef 100644
--- a/.bkit/core/engine/shared/package-roots.ts
+++ b/.bkit/core/engine/shared/package-roots.ts
@@ -1,7 +1,8 @@
 // shared/package-roots.ts — resolves the bkit package root and the roots under it
 // (core, shared, templates) from wherever the engine runs.
-// Imports allowed: node:path, node:url, node:fs only.
+// Imports allowed: node:path, node:url, node:fs, node:child_process only.
 
+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { fileURLToPath } from "node:url";
@@ -44,6 +45,22 @@ export function getPkgRoot(): string {
     : path.resolve(engineDir, "..");
 }
 
+/**
+ * True when `cwd` is the package root or belongs to bkit's own repository: its main checkout
+ * (the parent of the git common dir) is the package root. `pkgRoot` defaults to the engine's own root.
+ */
+export function isBkitOwnRepo(cwd: string, pkgRoot: string = getPkgRoot()): boolean {
+  if (path.resolve(cwd) === path.resolve(pkgRoot)) return true;
+  const res = spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
+    cwd,
+    encoding: "utf-8",
+  });
+  if (res.status !== 0) return false;
+  const common = res.stdout.trim();
+  if (common === "") return false;
+  return path.resolve(common, "..") === path.resolve(pkgRoot);
+}
+
 // ---------------------------------------------------------------------------
 // The three payload roots. Each folder carries one install behaviour; a file's
 // path inside its folder is where it lands in the consumer repo.
diff --git a/.bkit/version b/.bkit/version
index 57e59dacf..d586926cb 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "194175488cbeed73d3d8a92bc6d2b50efa6ad2c8cda691213056fdbbdcecf4ab",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "d0ca6536bd7eaf83286701e395880d8457cf71f6dee733c062eda99c1ea2976c",
+    ".bkit/workflows.md": "393e23653b8404b3399b1560425113ff4ae84f8b1f80e7f7a7f193056166390f",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 65356820e..22319fa3a 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1025,7 +1025,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 | `ship.merge` | `{ "ask": true, "maxAttempts": 2 }` | Failed arrivals at Step 10: gate refusals plus failed merges | `Q1 — Merge: …` when the allowance is used up on a refusal |
 
 - **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.holistic`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
-- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
+- **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. The check reads `bkit.workflows` before a code step's `bkit:generate` runs: a difference from `HEAD` is the step's own edit and exits 13 everywhere; a difference `bkit:generate` makes also exits 13, except in bkit's own repository (its main checkout is the engine's package root) when it only adds keys, which ride the step's commit and are listed in the output and the `step-done` row as `generatedWorkflows`. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
 - **Headless** (`runtimeHeadless` true, GitHub Actions only) behaves as `ask: false` at every point. `bkit counters route` and `counters max` print `ask` already false when headless.
 - **`ask: false`:** loop questions take the recommendation; `Fix now` is applied; `Accept` is recorded as assumed. Hard blockers are still asked in a session and go to the Failure Path headless.
 - **Question layout**, every point: the `{workflow} {point}: attempt {n} of {max}` line (loop questions; `turn` for the grill), then the shape in `.bkit/authoring.md` § Human questions. Option names: `Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`. Each step routing on the owner's answer reads a lettered reply (`B`, `B)`, `B) {option}`) as the option it labels; `parseDecisionItems` reads a `Decision:` line the same way (`optionAnswer`).
@@ -1747,7 +1747,7 @@ Dependency inspection: `bkit:deps:outdated` / `bkit:deps:audit` exist so prompts
 `bkit:generate` is not a gate either: it rewrites every generated file and saved baseline (snapshots, coverage lists, generated docs) from the current working tree, in place, so a commit never carries code whose generated output is stale.
 
 - **Contract:** no arguments; idempotent, so a second run changes nothing; exit 0 on success, non-zero on failure.
-- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit, and `bkit steps finish` runs it again before the commit of each build code step (exit 16 when it fails); `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
+- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit, and `bkit steps finish` runs it again before the commit of each build code step (a failure is logged, appends a friction row and never stops the step); `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
 - **Undeclared:** every caller skips it.
 
 Not seeded, because which files a stack generates is the stack's business. A regenerated baseline is never a `TEST FIRST` test: regenerating it makes it pass, so it cannot fail first.
diff --git a/DETAILS.md b/DETAILS.md
index 6f1dff5e4..62e659cdc 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>2002 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>2004 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>381 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -355,7 +355,7 @@ flowchart LR
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|494| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|426| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|429| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|224| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index d80d416fb..3b952c0a5 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -17,7 +17,7 @@ import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { scriptCommand } from "../../shared/package-manager.js";
-import { getPromptsRoot } from "../../shared/package-roots.js";
+import { getPromptsRoot, isBkitOwnRepo } from "../../shared/package-roots.js";
 import { readTextFile } from "../../shared/json.js";
 import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, } from "../lib.js";
 import { activeRunStart, savedPointLimit } from "./counters.js";
@@ -59,6 +59,29 @@ function recordTestLockFriction(top, step, named) {
         `\`bkit steps finish\` refused ${step} with exit ${EXIT_TESTS_TOUCHED}: ${named} changed after the group's red; the step reruns.`;
     appendFrictionRow(top, row);
 }
+/**
+ * An `agent-rework` friction row for a failed `bkit:generate` at a code step's finish: the
+ * step still lands, so `bkit stats` counts it. Best effort.
+ */
+function recordGenerateFriction(top, step, status) {
+    if (!journalEnabled())
+        return;
+    const row = frictionRow({
+        workflow: "build",
+        step,
+        noun: "steps",
+        verb: "finish",
+        code: null,
+        bookRoot: top,
+        parentSha: git(top, ["rev-parse", "HEAD"]) ?? undefined,
+    });
+    row["category"] = "agent-rework";
+    row["severity"] = "LOW";
+    row["summary"] = "bkit:generate failed at a code step's finish";
+    row["description"] =
+        `\`bkit steps finish\` ran the repo's \`bkit:generate\` for ${step} and it exited ${status}; the step landed and the generated output may be stale.`;
+    appendFrictionRow(top, row);
+}
 const VERDICT_END = "<!-- verdict:end -->";
 const DEFAULT_VERDICTS = ["PASS", "CONCERNS", "FAIL"];
 const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];
@@ -78,8 +101,6 @@ export const EXIT_LATER_ATTEMPT = 12;
 export const EXIT_WORKFLOWS_CHANGED = 13;
 /** finish (build plan-tests): the tests step's commit changes a file that is not one of the group's planned tests. */
 export const EXIT_SOURCE_TOUCHED = 15;
-/** finish (build code step): the repo's declared `bkit:generate` exited non-zero before the commit. */
-export const EXIT_GENERATE_FAILED = 16;
 /** The step whose subagent writes the group's TEST FIRST tests, before any task code. */
 export const PLAN_TESTS_STEP = "build-plan-tests";
 /** The step whose subagent closes the group's verification gaps: a code step, like plan-execute. */
@@ -853,19 +874,30 @@ function recordedPath(cwd, fid, rel) {
     const rec = fid === undefined ? null : activeRecord(cwd, fid);
     return rec !== null && rec.paths.some((p) => p.path === rel);
 }
-function workflowsChange(cwd) {
-    const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
+/** The `bkit.workflows` object of HEAD's or the working tree's package.json; `{}` when unreadable. */
+function readWorkflows(top, side) {
     const file = path.join(top, "package.json");
-    const head = runGit(top, ["cat-file", "-e", "HEAD:package.json"]).ok
-        ? parseJson(runGit(top, ["show", "HEAD:package.json"]).stdout)
-        : { ok: true, value: {} };
-    const work = fs.existsSync(file)
-        ? parseJson(fs.readFileSync(file, "utf-8"))
-        : { ok: true, value: {} };
-    if (!head.ok || !work.ok)
-        return [];
-    const workflows = (pkg) => (isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined) ?? {};
-    return changedKeys(workflows(head.value), workflows(work.value));
+    const parsed = side === "head"
+        ? runGit(top, ["cat-file", "-e", "HEAD:package.json"]).ok
+            ? parseJson(runGit(top, ["show", "HEAD:package.json"]).stdout)
+            : { ok: true, value: {} }
+        : fs.existsSync(file)
+            ? parseJson(fs.readFileSync(file, "utf-8"))
+            : { ok: true, value: {} };
+    if (!parsed.ok)
+        return {};
+    const pkg = parsed.value;
+    return (isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined) ?? {};
+}
+/** True when the dotted key path exists in `obj`. */
+function hasKeyPath(obj, dotted) {
+    let at = obj;
+    for (const k of dotted.split(".")) {
+        if (!isRecord(at) || !(k in at))
+            return false;
+        at = at[k];
+    }
+    return true;
 }
 /** `soakAttempt` → `Soak Attempt`, for a comment header. */
 const titleCase = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
@@ -1149,12 +1181,15 @@ async function finish(ctx) {
     // A code step's commit carries the repo's generated output: run the declared `bkit:generate`
     // first, so the lock, the workflows check and the commit all judge the committed tree.
     let generate = null;
+    let workflowsBefore;
+    let addedWorkflowKeys = [];
     if (workflow === "build" && CODE_STEPS.has(step) && commit === "auto") {
         const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
         if (resolveGate(top, ["bkit:generate"]) === null)
             generate = "undeclared";
         else {
             const argv = scriptCommand("bkit:generate");
+            workflowsBefore = readWorkflows(top, "work");
             const res = spawnSync(argv[0], argv.slice(1), {
                 cwd: top,
                 encoding: "utf-8",
@@ -1162,15 +1197,18 @@ async function finish(ctx) {
                 maxBuffer: 1 << 26,
             });
             if (res.status !== 0) {
-                ctx.log(`${argv.join(" ")} exited ${String(res.status ?? res.error?.message)}: fix it, then finish again (nothing written)`);
+                const status = String(res.status ?? res.error?.message);
+                ctx.log(`${argv.join(" ")} exited ${status}: the step lands anyway`);
                 const out = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim();
                 if (out !== "")
                     for (const line of out.split("\n").slice(-20))
                         ctx.log(`  ${line}`);
-                ctx.emit({ pass: false, generate: "failed" });
-                return EXIT_GENERATE_FAILED;
+                recordGenerateFriction(top, step, status);
+                ctx.log("generate: failed");
+                generate = "failed";
             }
-            generate = "ran";
+            else
+                generate = "ran";
         }
     }
     if (workflow === "build" && CODE_STEPS.has(step)) {
@@ -1373,12 +1411,30 @@ async function finish(ctx) {
     // package.json that was already dirty when the run started stays out of it: a recorded
     // one the run then changed is refused as foreign by the commit itself.
     if (commit === "auto" && !recordedPath(ctx.cwd, fidOfStatusFile(file), "package.json")) {
-        const changed = workflowsChange(ctx.cwd);
-        if (changed.length > 0) {
-            ctx.log(`the step's commit would change bkit.workflows in package.json (${changed.join(", ")}): restore HEAD's values, then finish again (nothing written)`);
-            ctx.emit({ pass: false, changed });
+        const wfTop = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
+        const wfHead = readWorkflows(wfTop, "head");
+        const wfAfter = readWorkflows(wfTop, "work");
+        const wfBefore = workflowsBefore === undefined ? wfAfter : workflowsBefore;
+        const own = changedKeys(wfHead, wfBefore);
+        if (own.length > 0) {
+            ctx.log(`the step's own edit changes bkit.workflows in package.json (${own.join(", ")}): restore HEAD's values, then finish again (nothing written)`);
+            ctx.emit({ pass: false, changed: own });
             return EXIT_WORKFLOWS_CHANGED;
         }
+        const generated = changedKeys(wfBefore, wfAfter);
+        if (generated.length > 0) {
+            const allAdded = generated.every((k) => !hasKeyPath(wfBefore, k));
+            if (allAdded && isBkitOwnRepo(wfTop)) {
+                extras.generatedWorkflows = generated;
+                ctx.log(`bkit:generate added bkit.workflows keys to package.json: ${generated.join(", ")}`);
+                addedWorkflowKeys = generated;
+            }
+            else {
+                ctx.log(`bkit:generate changed bkit.workflows in package.json (${generated.join(", ")}): the step's commit may not carry it; fix the script or restore HEAD's values, then finish again (nothing written)`);
+                ctx.emit({ pass: false, changed: generated });
+                return EXIT_WORKFLOWS_CHANGED;
+            }
+        }
     }
     if (f.docsOnly === true && commit === "auto") {
         addAllButCopied(ctx.cwd);
@@ -1506,6 +1562,7 @@ async function finish(ctx) {
         ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
         pass,
         generate,
+        ...(addedWorkflowKeys.length > 0 ? { generatedWorkflows: addedWorkflowKeys } : {}),
         checks,
         comment,
         // Written after the step's commit, so the commit never carries it.
@@ -1792,7 +1849,7 @@ export const stepsCommand = {
                 row: "the appended step-done row",
                 parentSha: "the row's parentSha: HEAD before the step's commit",
                 commit: "the new commit's sha, or null with --commit=none",
-                generate: "a build code step's `bkit:generate`: ran, undeclared, failed (exit 16), or null (not a code step, or --commit=none)",
+                generate: "a build code step's `bkit:generate`: ran, undeclared, failed (the step still lands; its last 20 lines are logged and a friction row is appended), or null (not a code step, or --commit=none)",
                 pass: "every gate check passed",
                 progressLine: "the exact chat progress line after a successful numbered completion",
                 checks: "[{check, ok, detail}] per gate check",
@@ -1820,9 +1877,8 @@ export const stepsCommand = {
                 [EXIT_OUTSIDE_DOCS]: "--docs-only and the step staged a file outside the artifact tree (nothing written)",
                 [EXIT_TESTS_TOUCHED]: "build plan-execute / plan-gaps-remediate: a planned test case (of any group) differs from the lines recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back, or to keep the edit and log ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (Gap {N} in a gaps fix) in the step's log, which lets that change through and records it in the row's `changedTests`; other edits to the file stay (nothing written; an agent-rework friction row is appended). A BLOCKED test that removes lines of a ticked task's planned test is contradicted instead: no BLOCKED line keeps it, the engine adds a takeover task and its build-takeover row (once per test, however often the finish runs) and lists it in `contradicts`; the agent puts it back",
                 [EXIT_LATER_ATTEMPT]: "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
-                [EXIT_WORKFLOWS_CHANGED]: "the commit would change bkit.workflows in package.json (`changed` names the keys) (nothing written)",
+                [EXIT_WORKFLOWS_CHANGED]: "the commit would change bkit.workflows in package.json: the step's own edit, or a change `bkit:generate` made (`changed` names the keys); in bkit's own repository a generated change that only adds keys rides the commit instead and is listed in `generatedWorkflows` (nothing written)",
                 [EXIT_SOURCE_TOUCHED]: "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
-                [EXIT_GENERATE_FAILED]: "build code step: the repo's declared `bkit:generate` exited non-zero (its last 20 lines are logged) (nothing written)",
             },
             run: finish,
         },
diff --git a/dist/install/payload-links.js b/dist/install/payload-links.js
index 613a84509..d8ca7df99 100644
--- a/dist/install/payload-links.js
+++ b/dist/install/payload-links.js
@@ -4,7 +4,7 @@
 // copying. Views, not copies — always the installed version, never hashed.
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { getCoreRoot, getPkgRoot, getSharedRoot } from "../shared/package-roots.js";
+import { getCoreRoot, getSharedRoot, isBkitOwnRepo } from "../shared/package-roots.js";
 // The two view links: a symlink at the consumer-relative `relPath` pointing at the
 // package payload dir `target()` resolves to. Relative targets, so the link keeps
 // working when the repo moves; both dangle on a fresh clone or in CI (no
@@ -49,7 +49,7 @@ export function syncPayloadLinks(cwd, opts) {
         skippedRealDir: [],
         failed: [],
     };
-    if (path.resolve(cwd) === getPkgRoot())
+    if (isBkitOwnRepo(cwd))
         return changes;
     for (const { relPath, target } of PAYLOAD_LINKS) {
         const linkAbs = path.join(cwd, relPath);
diff --git a/dist/install/template-copies.js b/dist/install/template-copies.js
index ff9659897..d4b3cd5aa 100644
--- a/dist/install/template-copies.js
+++ b/dist/install/template-copies.js
@@ -2,7 +2,7 @@
 // refreshes them, and the dotfile remap they share with the install/upgrade walk.
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { NPM_STRIP_REMAP, getPkgRoot, getTemplatesRoot, TEMPLATE_COPIES_DIR, } from "../shared/package-roots.js";
+import { NPM_STRIP_REMAP, isBkitOwnRepo, getTemplatesRoot, TEMPLATE_COPIES_DIR, } from "../shared/package-roots.js";
 import { hasLintStagedConfig } from "../checks/tips/detect.js";
 import { readDependencyNames, readPackageJson } from "../shared/package-json.js";
 import { adoptedProjectDocPath, inspectRepoFile, PROJECT_DOC_TOPICS, } from "./project-docs.js";
@@ -38,7 +38,7 @@ export function remapTemplateDest(rel) {
 // flags a stale copy. No-op in dogfood: there the folder IS the package's template source.
 export function syncTemplateCopies(cwd, opts) {
     const changes = { changed: [], added: [], removed: [] };
-    if (path.resolve(cwd) === getPkgRoot())
+    if (isBkitOwnRepo(cwd))
         return changes;
     const srcRoot = getTemplatesRoot();
     const dstRoot = path.join(cwd, TEMPLATE_COPIES_DIR);
@@ -158,7 +158,7 @@ function formatGateRunsBareLintStaged(cwd) {
 // fix after the calling command's `logPrefix`. Prints in a dry run too; writes nothing. Returns
 // true when it printed. No-op in dogfood.
 export function warnMissingLintStagedConfig(cwd, logPrefix) {
-    if (path.resolve(cwd) === getPkgRoot())
+    if (isBkitOwnRepo(cwd))
         return false;
     if (!formatGateRunsBareLintStaged(cwd))
         return false;
diff --git a/dist/shared/package-roots.js b/dist/shared/package-roots.js
index df2992fc5..1ccd591aa 100644
--- a/dist/shared/package-roots.js
+++ b/dist/shared/package-roots.js
@@ -1,6 +1,7 @@
 // shared/package-roots.ts — resolves the bkit package root and the roots under it
 // (core, shared, templates) from wherever the engine runs.
-// Imports allowed: node:path, node:url, node:fs only.
+// Imports allowed: node:path, node:url, node:fs, node:child_process only.
+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { fileURLToPath } from "node:url";
@@ -38,6 +39,24 @@ export function getPkgRoot() {
         ? path.resolve(engineDir, "..", "..", "..")
         : path.resolve(engineDir, "..");
 }
+/**
+ * True when `cwd` is the package root or belongs to bkit's own repository: its main checkout
+ * (the parent of the git common dir) is the package root. `pkgRoot` defaults to the engine's own root.
+ */
+export function isBkitOwnRepo(cwd, pkgRoot = getPkgRoot()) {
+    if (path.resolve(cwd) === path.resolve(pkgRoot))
+        return true;
+    const res = spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
+        cwd,
+        encoding: "utf-8",
+    });
+    if (res.status !== 0)
+        return false;
+    const common = res.stdout.trim();
+    if (common === "")
+        return false;
+    return path.resolve(common, "..") === path.resolve(pkgRoot);
+}
 // ---------------------------------------------------------------------------
 // The three payload roots. Each folder carries one install behaviour; a file's
 // path inside its folder is where it lands in the consumer repo.
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 8d5b6be45..4eda4bed3 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -126,7 +126,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>2002 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>2004 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>381 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -134,7 +134,7 @@ flowchart LR
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|494| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|426| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|429| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|224| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
@@ -295,7 +295,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_status["status<br/>40 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_base["step-base<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_table["step-table<br/>15 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_steps["steps<br/>73 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_steps["steps<br/>75 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary["summary<br/>35 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>23 symbols · 1 files"]
@@ -387,6 +387,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|17| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_counters -->|17| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|17| n_bkit_core_engine_commands_workflow_ledgers
+  n_bkit_core_engine_commands_workflow_steps -->|17| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_tasks -->|17| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_branches -->|16| n_bkit_core_engine_commands_workflow_ledgers
@@ -404,7 +405,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_prs -->|15| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_roadmap -->|15| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|15| n_bkit_core_engine_commands_workflow_status
-  n_bkit_core_engine_commands_workflow_steps -->|15| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_tests -->|15| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_install_modules_opencode -->|15| n_bkit_core_engine_install_write
   n_bkit_core_engine_checks_tips_catalogue -->|15| n_bkit_core_engine_checks_tips_detect
diff --git a/docs/testing.md b/docs/testing.md
index daaa1da13..c25ea4e13 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -945,7 +945,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/lib.test.ts` | Unit (boundary: real temp git repo + linked worktree) | Flag parsing and usage errors (a literal `{UPPER}` placeholder in any flag or positional value refused, exit 2), the `invocation-context/` folder is `0700` whether created or found, dispatch and classic-verb collision (`bkit status`), help rendering, exit-code mapping, UTC month, skip-CI tokens, repo root from a worktree, `status.jsonl` location per workflow kind, the active run a call is journaled under (`--fid` never matches another feature's run, and finds its own run from an earlier month); the tests-lock status file (`readLockStatus`, `classifyLockOutcome`): a give-up or refusal is read from the file and the exit code alone, a reworded script sentence changes nothing, and an absent, empty or other-lock file reads as a gate result. |
 | `commands/workflow/status.test.ts` | Unit | `bkit status path / route / meta / resume` (debug's resume prints Step 3's test round as `counters derive` and `status route` read it, exit 4 past Step 3 with none): location per workflow kind, active-run verdict / failures, the step's last `parentSha` and `source` per group, all-runs strategy, `nextStrategy` / `repeatTests` from repeated failing tests on the fix step's test step, run-level mode over step mode, `--require` failures, `route --expect=field=value` (exit 4 when it differs or is missing), meta append + validation; the fold skips a row it does not model, a line that is not JSON exits 3; `route --workflow=build` publish: the `publish=true\|false` token over `publish.local`, `local` read on LOCAL, `false` coerced to `true` on any other runtime, an unknown token value falling through to config, and `publishSource` (`token` / `local` / `remote` / `coerced`); `route --step` prints no `cleanBase` field; The engine-only row types `decision-counts` and `decision-answer` are refused by `status row`; `status resume` `gateRerun` true (with `rerunFrom` the `From` header, `holistic` included) only for the active run's `OPEN` `Gate: FAIL` pause whose loop question is its only undecided question (the pause may be laid out in two files), false when another question is undecided, the pause is closed or no run is active; a verify, holistic, tests or fix-step pause written before `decisions counts` ran resumes exactly as a run with no file does (Step 8, 10 or 12, or Step 8 after `build-plan-gaps-remediate` and Step 7 after `build-plan-gaps-remediate-holistic`), with `counters derive --step=build-decision --position=next` still on the same decision number. |
 | `commands/workflow/counters.test.ts` | Unit | `bkit counters derive / run / route / max`: the three positions, `current` refusing 0, active-run scoping, group isolation (empty `--group` rejected), `--all-runs`, de-dupe, metacharacter step names, run numbering incl. resume + interleave (a resumed build after an interleaved debug run keeps its run and budget), fail-closed value / max (max 0: value 0 continues, value 1 routes to `exceeded`), `--point` (limit and `ask`, `max --point`), `route --of=<step>:<pos>` deriving the value (group scoped, `current` with no own row → exit 4), `route --of=<step>,<step>:count` summing several steps (off `:count`, repeated or empty entry → exit 2), `--of` plus `--rows` summed; holistic fix rounds counted within the run with no reset after a clean check (`build.holistic`, falling back to the current `package.json` setting when the run's frozen limits lack it); `--since-clean` refused on `route` and `grant` as an unknown flag (exit 2). |
-| `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit (8: row rolled back and the index restored byte-for-byte — a pre-staged status.jsonl, a partly staged file, a caller-staged path a bracketed new path glob-matches, a status.jsonl the hook removed; 82: another writer's row appended during the commit stays), header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope` (a `build-holistic-gate` row without `scope` refused), `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, each declared count rule checked against the report body (a wrong count or missing verdict is refused and handed back to its writer), attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents, a `true \| false` field true when any agent sets it; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`, `--ref` reading the file as committed on a ref (3 when the ref lacks it). `steps finish` locks a recorded red test only while a `TEST FIRST` line in the run's plan (beside its status file, `runPlanPath`) still names it; a name the plan dropped locks nothing. `steps finish --step=build-decision --field=route=continue` refuses (exit 1, no row) a decision file `decisions skip` would refuse. A build code step's `steps finish` runs the repo's `bkit:generate` before the commit: declared (a stale-output hook lets the commit through), undeclared and empty (nothing runs, the hook still exits 8), not a code step, failing (exit 16, no row, no commit), an unrelated hook refusal (still 8), `--commit=none` (nothing runs). |
+| `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit (8: row rolled back and the index restored byte-for-byte — a pre-staged status.jsonl, a partly staged file, a caller-staged path a bracketed new path glob-matches, a status.jsonl the hook removed; 82: another writer's row appended during the commit stays), header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope` (a `build-holistic-gate` row without `scope` refused), `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, each declared count rule checked against the report body (a wrong count or missing verdict is refused and handed back to its writer), attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents, a `true \| false` field true when any agent sets it; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`, `--ref` reading the file as committed on a ref (3 when the ref lacks it). `steps finish` locks a recorded red test only while a `TEST FIRST` line in the run's plan (beside its status file, `runPlanPath`) still names it; a name the plan dropped locks nothing. `steps finish --step=build-decision --field=route=continue` refuses (exit 1, no row) a decision file `decisions skip` would refuse. A build code step's `steps finish` runs the repo's `bkit:generate` before the commit: declared (a stale-output hook lets the commit through), undeclared and empty (nothing runs, the hook still exits 8), not a code step, failing (the step still lands with a friction row and `generate: failed`, whatever its verdict), a generated `bkit.workflows` key (exit 13 outside bkit's own repo; in it an added key rides the commit and the row, an edited or removed one and the step's own edit exit 13), an unrelated hook refusal (still 8), `--commit=none` (nothing runs). |
 | `commands/workflow/runtime.test.ts` | Unit (fake `gh` on `PATH`) | `bkit runtime detect / row / assert` — see § Runtime detection. |
 | `commands/workflow/repo.test.ts` | Unit (boundary: real temp git repo) | `bkit repo info`: owner / repo from `gh`, else the origin remote; neither → exit 3; detached HEAD → exit 4 unless `--allow-detached`; `behindDev` / `divergedAgo`, null (never a false 0) when `origin/dev` is unknown; `--fetch` failure logged, not fatal; `repoRoot` / `bkit` / `outboxRoot` name the main checkout from a worktree too; `sessionDir` is a new empty `sessions/<utc-time>-<random>/` folder per call, with name-stamped folders older than 7 days pruned; `bkitVersion` / `bkitLatest` / `bkitOutdated` / `bkitAdvisory` from a seeded cache: advisory printed when the pin is older, quiet when current or ahead, null (never an error) on a remembered registry failure or an unpinned repo; `buildPublishRemote` / `buildPublishLocal` printed, with the defaults when `package.json` omits them. |
 | `shared/bkit-latest.test.ts` | Unit (boundary: temp dirs, fake `pnpm` on PATH) | Outdated-bkit check: `compareSemver` numeric order (5.10.0 > 5.9.0) and prerelease order; unpinned and `BKIT_NO_UPDATE_CHECK` skip the registry (`0` does not); one lookup per day, a failed lookup remembered for an hour, corrupt / future-dated cache rewritten, no git dir → no cache; `lookupLatestPublished` null on a pnpm failure, non-version output, or no pnpm. |
