diff --git a/.bkit/core/engine/commands/workflow/step-base.test.ts b/.bkit/core/engine/commands/workflow/step-base.test.ts
index dd4e9a70e..c64a16af1 100644
--- a/.bkit/core/engine/commands/workflow/step-base.test.ts
+++ b/.bkit/core/engine/commands/workflow/step-base.test.ts
@@ -134,4 +134,20 @@ describe("stepBase", () => {
     expect(fix).not.toBe(c2);
     expect(stepBase({ cwd, step: "build-plan-b" })).toBe(c2);
   });
+
+  it("with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress", () => {
+    repo();
+    git("checkout", "-q", "-B", "dev");
+    const other = path.join(cwd, "docs/plans/202611/logs/2-y/status.jsonl");
+    fs.mkdirSync(path.dirname(other), { recursive: true });
+    fs.writeFileSync(other, `${JSON.stringify(started("2026-11-01T09:00:00Z"))}\n`);
+    commit("another feature's run start");
+    git("checkout", "-q", "-B", "claude/session");
+    appendRow(started("2026-11-01T10:00:00Z"));
+    const c1 = commit("run start");
+    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
+    const c2 = commit("step a");
+    expect(c2).not.toBe(c1);
+    expect(stepBase({ cwd })).toBe(c2);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/step-base.ts b/.bkit/core/engine/commands/workflow/step-base.ts
index cd786a8fc..a793eab06 100644
--- a/.bkit/core/engine/commands/workflow/step-base.ts
+++ b/.bkit/core/engine/commands/workflow/step-base.ts
@@ -20,6 +20,38 @@ function branchFid(cwd: string): string | undefined {
   return m === null || m === undefined ? undefined : m[1];
 }
 
+/** Branches a feature branch is cut from, tried in order when looking for its merge base. */
+const BASE_BRANCHES = ["dev", "origin/dev", "main", "origin/main"];
+
+/**
+ * The one in-progress run whose `status.jsonl` this checkout changed (commits since the
+ * merge base with the trunk branch, working tree, or untracked); undefined when none or
+ * several. Finds the checkout's own run on a branch that is not `feat/{FID}`.
+ */
+function ownChangedRun(cwd: string): ReturnType<typeof resolveActiveRun> {
+  const top = git(cwd, ["rev-parse", "--show-toplevel"]);
+  if (top === null) return undefined;
+  const spec = ":(glob)docs/plans/*/logs/*/status.jsonl";
+  const changed = new Set<string>();
+  const add = (out: string | null): void => {
+    for (const l of (out ?? "").split("\n")) if (l.trim() !== "") changed.add(l.trim());
+  };
+  let mb: string | null = null;
+  for (const b of BASE_BRANCHES) {
+    mb = git(top, ["merge-base", "HEAD", b]);
+    if (mb !== null && mb !== "") break;
+    mb = null;
+  }
+  add(git(top, ["diff", "--name-only", mb ?? "HEAD", "--", spec]));
+  add(git(top, ["ls-files", "--others", "--exclude-standard", "--", spec]));
+  const runs = new Map<string, NonNullable<ReturnType<typeof resolveActiveRun>>>();
+  for (const rel of changed) {
+    const run = resolveActiveRun({ cwd: top, file: path.join(top, rel) });
+    if (run !== undefined) runs.set(run.file, run);
+  }
+  return runs.size === 1 ? [...runs.values()][0] : undefined;
+}
+
 /** The earliest commit that adds a row stamped `at` to `file`; null when none does. */
 function commitOfRow(file: string, at: unknown): string | null {
   if (typeof at !== "string" || at === "") return null;
@@ -47,7 +79,8 @@ export function stepBase(opts: { cwd: string; step?: string; file?: string }): s
   const fid = opts.file === undefined ? branchFid(opts.cwd) : undefined;
   const run =
     (fid === undefined ? undefined : resolveActiveRun({ cwd: opts.cwd, fid })) ??
-    resolveActiveRun({ cwd: opts.cwd, file: opts.file });
+    resolveActiveRun({ cwd: opts.cwd, file: opts.file }) ??
+    (opts.file === undefined && fid === undefined ? ownChangedRun(opts.cwd) : undefined);
   if (run === undefined) return null;
   const rows = readStatusRows(run.file);
   let start = -1;
diff --git a/.bkit/core/engine/commands/workflow/tests-changed.test.ts b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
index d31b0bb67..ae8c0d156 100644
--- a/.bkit/core/engine/commands/workflow/tests-changed.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
@@ -529,4 +529,31 @@ describe("tests changed default base", () => {
     expect(r.json?.files).toContain("src/a.ts");
     expect(r.json?.files).not.toContain("src/foreign.ts");
   });
+
+  it("lists the subagent's committed file on an adopted branch when another feature's run is also in progress", async () => {
+    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
+    git("checkout", "-q", "-B", "dev");
+    write(
+      "docs/plans/202611/logs/2-y/status.jsonl",
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T09:00:00Z" })}\n`,
+    );
+    commit("another feature's run start");
+    git("checkout", "-q", "-B", "claude/session");
+    appendRow({ type: "workflow-started", workflow: "build", at: "2026-11-01T10:00:00Z" });
+    const start = commit("run start");
+    appendRow({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-prev",
+      status: "DONE",
+      at: "2026-11-01T10:05:00Z",
+      parentSha: start,
+      artifacts: [],
+    });
+    commit("previous step");
+    write("src/a.ts", "subagent edit\n");
+    commit("subagent commit");
+    const r = await changed([]);
+    expect(r.json?.files).toEqual(["src/a.ts"]);
+  });
 });
diff --git a/dist/commands/workflow/step-base.js b/dist/commands/workflow/step-base.js
index 850c175e8..a6c284afe 100644
--- a/dist/commands/workflow/step-base.js
+++ b/dist/commands/workflow/step-base.js
@@ -15,6 +15,41 @@ function branchFid(cwd) {
     const m = branch === null ? null : /^feat\/(.+)$/.exec(branch);
     return m === null || m === undefined ? undefined : m[1];
 }
+/** Branches a feature branch is cut from, tried in order when looking for its merge base. */
+const BASE_BRANCHES = ["dev", "origin/dev", "main", "origin/main"];
+/**
+ * The one in-progress run whose `status.jsonl` this checkout changed (commits since the
+ * merge base with the trunk branch, working tree, or untracked); undefined when none or
+ * several. Finds the checkout's own run on a branch that is not `feat/{FID}`.
+ */
+function ownChangedRun(cwd) {
+    const top = git(cwd, ["rev-parse", "--show-toplevel"]);
+    if (top === null)
+        return undefined;
+    const spec = ":(glob)docs/plans/*/logs/*/status.jsonl";
+    const changed = new Set();
+    const add = (out) => {
+        for (const l of (out ?? "").split("\n"))
+            if (l.trim() !== "")
+                changed.add(l.trim());
+    };
+    let mb = null;
+    for (const b of BASE_BRANCHES) {
+        mb = git(top, ["merge-base", "HEAD", b]);
+        if (mb !== null && mb !== "")
+            break;
+        mb = null;
+    }
+    add(git(top, ["diff", "--name-only", mb ?? "HEAD", "--", spec]));
+    add(git(top, ["ls-files", "--others", "--exclude-standard", "--", spec]));
+    const runs = new Map();
+    for (const rel of changed) {
+        const run = resolveActiveRun({ cwd: top, file: path.join(top, rel) });
+        if (run !== undefined)
+            runs.set(run.file, run);
+    }
+    return runs.size === 1 ? [...runs.values()][0] : undefined;
+}
 /** The earliest commit that adds a row stamped `at` to `file`; null when none does. */
 function commitOfRow(file, at) {
     if (typeof at !== "string" || at === "")
@@ -41,7 +76,8 @@ function commitOfRow(file, at) {
 export function stepBase(opts) {
     const fid = opts.file === undefined ? branchFid(opts.cwd) : undefined;
     const run = (fid === undefined ? undefined : resolveActiveRun({ cwd: opts.cwd, fid })) ??
-        resolveActiveRun({ cwd: opts.cwd, file: opts.file });
+        resolveActiveRun({ cwd: opts.cwd, file: opts.file }) ??
+        (opts.file === undefined && fid === undefined ? ownChangedRun(opts.cwd) : undefined);
     if (run === undefined)
         return null;
     const rows = readStatusRows(run.file);
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 1c3c289f5..0308282b0 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -479,3 +479,4 @@
 {"schema":3,"ts":1794967094877,"firstTs":1794967094877,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-step-base-ts-20","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Two commits land in the same second, the first holding any row stamped with that second (an `engine-call` or `engine-action` row), and `commitOfRow` finds the row by its second-precision `at` alone, so it returns the earlier commit and the base takes in the previous step's own commit","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/step-base.ts:20: Two commits land in the same second, the first holding any row stamped with that second (an `engine-call` or `engine-action` row), and `commitOfRow` finds the row by its second-precision `at` alone, so it returns the earlier commit and the base takes in the previous step's own commit. Done when: `commitOfRow` looks the row up by a key only that row carries (its full serialized line, or `at` together with `step` and `parentSha`), so a row of another type stamped with the same second never selects an earlier commit.","source":".bkit/core/engine/commands/workflow/step-base.ts:20","status":"OPEN"}
 {"schema":3,"ts":1794967094878,"firstTs":1794967094878,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-steps-ts-452","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A by-hand `steps finish --field=uncommitted=true` on a committed step sets the new routing flag, and `stepBase` then returns the row's `parentSha`, so the next step's base includes that step's own commit","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:452: A by-hand `steps finish --field=uncommitted=true` on a committed step sets the new routing flag, and `stepBase` then returns the row's `parentSha`, so the next step's base includes that step's own commit. Done when: `uncommitted` is in `CORE_ROW_KEYS`, so `--field` cannot set it and only `--commit=none` stamps it.","source":".bkit/core/engine/commands/workflow/steps.ts:452","status":"OPEN"}
 {"schema":3,"ts":1794967094879,"firstTs":1794967094879,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-tests-changed-ts-207","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A person runs `bkit tests changed` by hand on `dev`, where the only in-progress run is another feature's abandoned run, and the default base silently becomes that run's last step-done commit, so the gate runs over every file changed on `dev` since then instead of the uncommitted files","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-changed.ts:207: A person runs `bkit tests changed` by hand on `dev`, where the only in-progress run is another feature's abandoned run, and the default base silently becomes that run's last step-done commit, so the gate runs over every file changed on `dev` since then instead of the uncommitted files. Done when: The owner decides whether a run the checkout does not name (no `feat/{FID}` branch, no shared-checkout record) may set the default base. No agent can settle it: the planned `step-base.test.ts` case `returns the commit that holds the last step-done row` encodes \"the single in-progress run sets the base on any branch\", and the planned-test lock refuses an edit to it. Either that case changes and `stepBase` returns null for a run the checkout does not name, or the by-hand behaviour stays and `.bkit/core/.bkit/cli.md` says so.","source":".bkit/core/engine/commands/workflow/tests-changed.ts:207","status":"OPEN"}
+{"schema":3,"ts":1794975197247,"firstTs":1794975197247,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-step-base-ts-19","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A collaborator pushes a branch named `feat/1-x/nested` (git accepts nested names and characters such as `;$(id)`), and `stepBase` takes everything after `feat/` as the FID with no slug allowlist, so `statusLocation` builds a path from it and a status file the branch name spells, in the main checkout or a nested log folder, sets the base of `bkit tests changed`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/step-base.ts:19: A collaborator pushes a branch named `feat/1-x/nested` (git accepts nested names and characters such as `;$(id)`), and `stepBase` takes everything after `feat/` as the FID with no slug allowlist, so `statusLocation` builds a path from it and a status file the branch name spells, in the main checkout or a nested log folder, sets the base of `bkit tests changed`. Done when: `branchFid` returns a FID only for a branch that matches the engine's FID slug allowlist (`^feat/([a-z0-9][a-z0-9-]*)$`, as `FEAT_BRANCH` in `.bkit/core/engine/commands/ci/ci.ts` and the branch pattern in `fids.ts` use), so a branch name that is not a FID slug never reaches `statusLocation` path construction and `stepBase` falls back to the in-progress-run scan, as `docs/security.md` § CI Auto-Route Trust requires of every FID resolution site.","source":".bkit/core/engine/commands/workflow/step-base.ts:19","status":"OPEN"}
