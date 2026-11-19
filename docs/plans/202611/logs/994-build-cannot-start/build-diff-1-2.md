diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 548e6bec1..b01d419c8 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -298,6 +298,30 @@ describe("branches rebase: classification", () => {
     expect(classifyConflict(p)).toBe("refuse");
   });
 
+  it("classifies only the feature's own plan files as the plan-log shape", () => {
+    const fid = "994-x";
+    const none = new Map<string, string>();
+    const own = `docs/plans/202611/logs/${fid}`;
+    expect(classifyConflict(`${own}/plan-v2-reviewed.md`, none, fid)).toBe("planlog");
+    expect(classifyConflict(`${own}/deep/er/notes.md`, none, fid)).toBe("planlog");
+    expect(classifyConflict(`docs/plans/202611/${fid}-plan.md`, none, fid)).toBe("planlog");
+    // The ledger check still wins inside the feature's own folder.
+    expect(classifyConflict(`${own}/status.jsonl`, none, fid)).toBe("ledger");
+    // Another feature, a prefix-sharing id, a sibling doc: no plan-log shape.
+    expect(classifyConflict("docs/plans/202611/logs/995-y/plan-v2-reviewed.md", none, fid)).toBe(
+      "refuse",
+    );
+    expect(classifyConflict(`docs/plans/202611/logs/${fid}-more/plan.md`, none, fid)).toBe(
+      "refuse",
+    );
+    expect(classifyConflict(`docs/plans/202611/${fid}-more-plan.md`, none, fid)).toBe("refuse");
+    expect(classifyConflict(`docs/plans/202611/${fid}-design.md`, none, fid)).toBe("refuse");
+    // Without a feature id, nothing is a plan log.
+    expect(classifyConflict(`${own}/plan-v2-reviewed.md`)).toBe("refuse");
+    expect(classifyConflict(`${own}/plan-v2-reviewed.md`, none)).toBe("refuse");
+    expect(classifyConflict(`docs/plans/202611/${fid}-plan.md`)).toBe("refuse");
+  });
+
   it("matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match", () => {
     expect(classifyConflict("docs/plans/a/b/c/status.jsonl")).toBe("ledger");
     expect(classifyConflict("docs/plans/status.jsonl")).toBe("refuse");
@@ -1000,6 +1024,147 @@ describe("branches rebase: behaviour", { timeout: GIT_TIMEOUT }, () => {
   });
 });
 
+// ---------------------------------------------------------------------------
+// rebase — a plan-closed branch with a leftover push
+// ---------------------------------------------------------------------------
+
+describe(
+  "branches rebase: plan-closed branch with a leftover push",
+  { timeout: GIT_TIMEOUT },
+  () => {
+    const PC_FID = "994-x";
+    const PC_LOG = `docs/plans/202611/logs/${PC_FID}/plan-v2-reviewed.md`;
+    const PC_PLAN = `docs/plans/202611/${PC_FID}-plan.md`;
+    const PC_RULE = "plan file of this feature";
+
+    /** `branch` carries `featCommits` one by one; `main` holds the plan close's copy. Rebase stopped. */
+    function planClosed(
+      name: string,
+      branch: string,
+      featCommits: Record<string, string>[],
+      main: Record<string, string>,
+    ): string {
+      const dir = makeRepo(name);
+      git(dir, "checkout", "-q", "-b", branch);
+      featCommits.forEach((files, i) => commit(dir, files, `feat ${i + 1}`));
+      git(dir, "checkout", "-q", "main");
+      commit(dir, main, "plan close");
+      git(dir, "checkout", "-q", branch);
+      git(dir, "rebase", "main");
+      return dir;
+    }
+
+    it("takes the rebase target's copy of a plan log both sides added, and completes the rebase", async () => {
+      const dir = planClosed("pc-add", `feat/${PC_FID}`, [{ [PC_LOG]: "branch copy\n" }], {
+        [PC_LOG]: "dev copy\n",
+      });
+      const r = await run(dir, ["rebase"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({
+        outcome: "resolved",
+        resolved: [{ path: PC_LOG, how: "dev" }],
+        refused: null,
+      });
+      expect(read(dir, PC_LOG)).toBe("dev copy\n");
+      expect(inRebase(dir)).toBe(false);
+      expect(r.err).toContain(`RESOLVED ${PC_LOG} — took the rebase target's copy`);
+    });
+
+    it("takes the target's copy in each round when the branch changed the plan log in a later commit", async () => {
+      const dir = planClosed(
+        "pc-later",
+        `feat/${PC_FID}`,
+        [{ [PC_LOG]: "v1\n" }, { [PC_LOG]: "v2\n" }],
+        { [PC_LOG]: "dev copy\n" },
+      );
+      const r = await run(dir, ["rebase"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ outcome: "resolved", refused: null });
+      expect(read(dir, PC_LOG)).toBe("dev copy\n");
+      expect(inRebase(dir)).toBe(false);
+    });
+
+    it("completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit", async () => {
+      const dir = planClosed(
+        "pc-same",
+        `feat/${PC_FID}`,
+        [{ [PC_LOG]: "v1\n" }, { [PC_LOG]: "dev copy\n" }],
+        { [PC_LOG]: "dev copy\n" },
+      );
+      const r = await run(dir, ["rebase"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ outcome: "resolved", refused: null });
+      expect(read(dir, PC_LOG)).toBe("dev copy\n");
+      expect(inRebase(dir)).toBe(false);
+    });
+
+    it("settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass", async () => {
+      const status = `docs/plans/202611/logs/${PC_FID}/status.jsonl`;
+      const dir = planClosed(
+        "pc-mixed",
+        `feat/${PC_FID}`,
+        [{ [PC_PLAN]: "branch plan\n", [status]: '{"key":"B","ts":2}\n' }],
+        { [PC_PLAN]: "dev plan\n", [status]: '{"key":"C","ts":3}\n' },
+      );
+      const r = await run(dir, ["rebase"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ outcome: "resolved", refused: null });
+      expect(r.json?.resolved).toEqual(
+        expect.arrayContaining([
+          { path: PC_PLAN, how: "dev" },
+          { path: status, how: "union" },
+        ]),
+      );
+      expect(read(dir, PC_PLAN)).toBe("dev plan\n");
+      const keys = read(dir, status)
+        .split("\n")
+        .filter(Boolean)
+        .map((l) => (JSON.parse(l) as { key: string }).key);
+      expect(keys.sort()).toEqual(["B", "C"]);
+      expect(inRebase(dir)).toBe(false);
+    });
+
+    it("refuses another feature's plan log and names the rule in the reason", async () => {
+      const other = "docs/plans/202611/logs/995-y/plan-v2-reviewed.md";
+      const dir = planClosed("pc-other", `feat/${PC_FID}`, [{ [other]: "branch copy\n" }], {
+        [other]: "dev copy\n",
+      });
+      const r = await run(dir, ["rebase"]);
+      expect(r.code).toBe(3);
+      expect(r.json).toMatchObject({ outcome: "refused", refused: other, aborted: true });
+      expect(r.json?.reason).toContain(PC_RULE);
+      expect(inRebase(dir)).toBe(false);
+    });
+
+    it("refuses a code conflict beside the plan logs, leaving the plan log unresolved", async () => {
+      const dir = planClosed(
+        "pc-code",
+        `feat/${PC_FID}`,
+        [{ [PC_LOG]: "branch copy\n", "src.txt": "feat\n" }],
+        { [PC_LOG]: "dev copy\n", "src.txt": "main\n" },
+      );
+      const r = await run(dir, ["rebase"]);
+      expect(r.code).toBe(3);
+      expect(r.json).toMatchObject({ outcome: "refused", refused: "src.txt", aborted: true });
+      expect(r.json?.resolved).toEqual([]);
+      expect(r.json?.reason).toContain(PC_RULE);
+      expect(r.err).not.toContain(`RESOLVED ${PC_LOG}`);
+      expect(inRebase(dir)).toBe(false);
+    });
+
+    it("gives a branch not named feat/{fid} no plan-log rule", async () => {
+      const dir = planClosed("pc-branch", "feat", [{ [PC_LOG]: "branch copy\n" }], {
+        [PC_LOG]: "dev copy\n",
+      });
+      const r = await run(dir, ["rebase"]);
+      expect(r.code).toBe(3);
+      expect(r.json).toMatchObject({ outcome: "refused", refused: PC_LOG, aborted: true });
+      expect(r.json?.reason).toContain(PC_RULE);
+      expect(inRebase(dir)).toBe(false);
+    });
+  },
+);
+
 // ---------------------------------------------------------------------------
 // anchor-stamp / anchor-read
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index 7f99c62e4..d97fc8792 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -254,7 +254,14 @@ export function embedDocs(top: string): Map<string, string> {
   return out;
 }
 
-export type ConflictKind = "ledger" | "lockfile" | "register" | "embed" | "record" | "refuse";
+export type ConflictKind =
+  "ledger" | "lockfile" | "register" | "embed" | "record" | "planlog" | "refuse";
+
+/** A file under the feature's own plan-log folder, or its plan file. */
+function isOwnPlanFile(file: string, fid: string): boolean {
+  const esc = fid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+  return new RegExp(`^docs/plans/\\d{6}/(logs/${esc}/.+|${esc}-plan\\.md)$`).test(file);
+}
 
 /**
  * How a conflicted path may be resolved. Only repo-root lockfiles count: the regenerate
@@ -263,12 +270,14 @@ export type ConflictKind = "ledger" | "lockfile" | "register" | "embed" | "recor
 export function classifyConflict(
   file: string,
   embeds: ReadonlyMap<string, string> = new Map(),
+  fid?: string,
 ): ConflictKind {
   if (Object.hasOwn(REGISTERS, file)) return "register";
   if (embeds.has(file)) return "embed";
   if (file === INSTALL_RECORD) return "record";
   if (Object.hasOwn(LOCKFILE_REGENERATE, file)) return "lockfile";
   if (LEDGER_PATTERNS.some((re) => re.test(file))) return "ledger";
+  if (fid !== undefined && fid !== "" && isOwnPlanFile(file, fid)) return "planlog";
   return "refuse";
 }
 
@@ -520,10 +529,11 @@ export interface RebaseResult {
 }
 
 const NOT_RESOLVABLE =
-  "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record";
+  "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one, the install record or a plan file of this feature's own branch";
 
 /** How a rebase settled each kind of conflict, for its log. */
-const REBASE_HOW: Record<Exclude<Resolution["how"], "dev">, string> = {
+const REBASE_HOW: Record<Resolution["how"], string> = {
+  dev: "took the rebase target's copy",
   union: "union (append-only ledger)",
   lockfile: "took rebase target + regenerated",
   register: "took rebase target's copy of a generated register",
@@ -531,6 +541,19 @@ const REBASE_HOW: Record<Exclude<Resolution["how"], "dev">, string> = {
   record: "merged the install record entry by entry, rebase target's value where both changed",
 };
 
+/**
+ * Take the integration target's side of a conflicted file and stage it, or `git rm`
+ * it when that side deleted it. `dev` names the stage: `ours` in a rebase,
+ * `theirs` in a merge of origin/dev.
+ */
+function takeDevSide(top: string, file: string, dev: "ours" | "theirs"): boolean {
+  const stage = dev === "ours" ? 2 : 3;
+  const devHasIt = runGit(top, ["cat-file", "-e", `:${stage}:${file}`]).ok;
+  return devHasIt
+    ? runGit(top, ["checkout", `--${dev}`, "--", file]).ok && runGit(top, ["add", "--", file]).ok
+    : runGit(top, ["rm", "-q", "--", file]).ok;
+}
+
 /**
  * Drive an in-progress rebase to completion, auto-resolving each stop. Loops
  * because `--continue` replays the next commit, which can conflict in turn; the
@@ -562,13 +585,14 @@ export function resolveRebase(
   };
 
   const embeds = embedDocs(top);
+  const fid = rebasedFid(top)?.fid;
   while (result.rounds < 100) {
     result.rounds++;
     const conflicts = unmergedPaths(top);
     if (conflicts.length > 0) {
       // Classify the whole set before resolving any of it, so a refused path
       // never leaves half the set rewritten.
-      const refused = conflicts.find((f) => classifyConflict(f, embeds) === "refuse");
+      const refused = conflicts.find((f) => classifyConflict(f, embeds, fid) === "refuse");
       if (refused !== undefined) {
         return refuse(
           `REFUSE ${refused} — ${NOT_RESOLVABLE}; routing to Failure Path`,
@@ -577,7 +601,15 @@ export function resolveRebase(
         );
       }
       for (const f of conflicts) {
-        const kind = classifyConflict(f, embeds);
+        const kind = classifyConflict(f, embeds, fid);
+        if (kind === "planlog") {
+          if (!takeDevSide(top, f, "ours")) {
+            return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
+          }
+          result.resolved.push({ path: f, how: "dev" });
+          log(`RESOLVED ${f} — ${REBASE_HOW.dev}`);
+          continue;
+        }
         const settled =
           kind === "register"
             ? registerResolve(top, f, "ours")
@@ -859,18 +891,24 @@ function rebaseVerb(ctx: RunContext): number {
 
 /** The branch tip the in-progress rebase started from. */
 function rebaseOrigHead(top: string): string | null {
+  return readRebaseState(top, "orig-head");
+}
+
+/** Read one state file of the in-progress rebase, or null. */
+function readRebaseState(top: string, name: string): string | null {
   for (const dir of ["rebase-merge", "rebase-apply"]) {
-    const file = git(top, [
-      "rev-parse",
-      "--path-format=absolute",
-      "--git-path",
-      `${dir}/orig-head`,
-    ]);
+    const file = git(top, ["rev-parse", "--path-format=absolute", "--git-path", `${dir}/${name}`]);
     if (file !== null && fs.existsSync(file)) return fs.readFileSync(file, "utf-8").trim();
   }
   return null;
 }
 
+/** The feature id of the `feat/{fid}` branch being rebased, or null for any other branch. */
+function rebasedFid(top: string): { fid: string } | null {
+  const m = /^refs\/heads\/feat\/(.+)$/.exec(readRebaseState(top, "head-name") ?? "");
+  return m ? { fid: m[1]! } : null;
+}
+
 export interface PushOutcome {
   code: number;
   out: {
@@ -2202,10 +2240,7 @@ function resolvePath(
     if (!file.startsWith("docs/")) return { refused: "outside docs/ and the ledgers" };
     // In a merge `--theirs` is the branch merged in: dev. Dev deleting the file
     // leaves no stage 3, and taking dev's side means deleting it here too.
-    const devHasIt = runGit(top, ["cat-file", "-e", `:3:${file}`]).ok;
-    const ok = devHasIt
-      ? runGit(top, ["checkout", "--theirs", "--", file]).ok && runGit(top, ["add", "--", file]).ok
-      : runGit(top, ["rm", "-q", "--", file]).ok;
+    const ok = takeDevSide(top, file, "theirs");
     return ok ? "dev" : { refused: `taking ${DEV}'s side failed` };
   }
   if (kind === "lockfile") {
diff --git a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
index f060bf271..b9f870d46 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
@@ -140,6 +140,7 @@ function fixture(): Fixture {
 /** Commit `body` to `file` on origin's `dev`. */
 function advanceDev(f: Fixture, file: string, body: string): string {
   git(f.seed, "pull", "-q", "origin", "dev");
+  fs.mkdirSync(path.dirname(path.join(f.seed, file)), { recursive: true });
   fs.writeFileSync(path.join(f.seed, file), body);
   git(f.seed, "add", file);
   git(f.seed, "commit", "-q", "-m", `dev: ${file}`);
@@ -679,6 +680,76 @@ describe("bkit worktrees setup — mint (resume)", () => {
     },
   );
 
+  describe("a plan-closed branch with a leftover push", () => {
+    const PLAN_LOG = `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`;
+    const RULE = "plan file of this feature";
+
+    async function branchesRebase(cwd: string) {
+      const out: string[] = [];
+      const err: string[] = [];
+      const code = await runCommand(["branches", "rebase", "--json"], [branchesCommand], {
+        classicVerbs: new Set(),
+        cwd,
+        io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
+      });
+      return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
+    }
+
+    /** The branch holds its own plan log and pushed it; the plan close then put its copy on dev. */
+    function leftoverPush(f: Fixture, branchFiles: Record<string, string>) {
+      for (const [rel, body] of Object.entries(branchFiles)) {
+        fs.mkdirSync(path.dirname(path.join(wtOf(f), rel)), { recursive: true });
+        fs.writeFileSync(path.join(wtOf(f), rel), body);
+        git(wtOf(f), "add", "-f", rel);
+      }
+      git(wtOf(f), "commit", "-q", "-m", "plan: branch copy");
+      expect(g(wtOf(f), "push", "-q", "origin", `HEAD:refs/heads/feat/${FID}`).status).toBe(0);
+    }
+
+    it("a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts", async () => {
+      const f = await minted();
+      leftoverPush(f, { [PLAN_LOG]: "branch copy\n" });
+      advanceDev(f, PLAN_LOG, "dev copy\n");
+
+      const stopped = await setup(f.repo, "build", "--worktrees");
+      expect(stopped.code).toBe(3);
+      expect(stopped.json).toMatchObject({ rebaseConflict: true });
+      expect(git(wtOf(f), "diff", "--name-only", "--diff-filter=U")).toBe(PLAN_LOG);
+
+      const rebased = await branchesRebase(wtOf(f));
+      expect(rebased.code, rebased.err).toBe(0);
+      expect(rebased.json).toMatchObject({
+        outcome: "resolved",
+        resolved: [{ path: PLAN_LOG, how: "dev" }],
+        refused: null,
+      });
+      expect(rebased.err).toContain(`RESOLVED ${PLAN_LOG} — took the rebase target's copy`);
+      expect(fs.readFileSync(path.join(wtOf(f), PLAN_LOG), "utf-8")).toBe("dev copy\n");
+
+      const started = await setup(f.repo, "build", "--worktrees");
+      expect(started.code, started.err).toBe(0);
+      expect(started.json).toMatchObject({ mode: "resumed", rebaseConflict: false });
+    });
+
+    it("a code conflict beside the plan logs still stops the start, and the reason names the rule", async () => {
+      const f = await minted();
+      leftoverPush(f, { [PLAN_LOG]: "branch copy\n", "a.txt": "feature\n" });
+      advanceDev(f, "a.txt", "dev\n");
+      advanceDev(f, PLAN_LOG, "dev copy\n");
+
+      const stopped = await setup(f.repo, "build", "--worktrees");
+      expect(stopped.code).toBe(3);
+      expect(stopped.json).toMatchObject({ rebaseConflict: true });
+      expect(fs.existsSync(stopped.json.sentinel)).toBe(true);
+
+      const rebased = await branchesRebase(wtOf(f));
+      expect(rebased.code).toBe(3);
+      expect(rebased.json).toMatchObject({ outcome: "refused", refused: "a.txt", aborted: true });
+      expect(rebased.json.reason).toContain(RULE);
+      expect(fs.existsSync(stopped.json.sentinel)).toBe(true);
+    });
+  });
+
   it("rebases onto local dev while it is ahead of origin/dev, without rewriting its commits", async () => {
     const f = await minted();
     git(wtOf(f), "commit", "-q", "--allow-empty", "-m", "feature");
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index ee81a7330..d06264cc3 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -167,11 +167,16 @@ export function embedDocs(top) {
     }
     return out;
 }
+/** A file under the feature's own plan-log folder, or its plan file. */
+function isOwnPlanFile(file, fid) {
+    const esc = fid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+    return new RegExp(`^docs/plans/\\d{6}/(logs/${esc}/.+|${esc}-plan\\.md)$`).test(file);
+}
 /**
  * How a conflicted path may be resolved. Only repo-root lockfiles count: the regenerate
  * runs there. `embeds` is the repo's `embedDocs`.
  */
-export function classifyConflict(file, embeds = new Map()) {
+export function classifyConflict(file, embeds = new Map(), fid) {
     if (Object.hasOwn(REGISTERS, file))
         return "register";
     if (embeds.has(file))
@@ -182,6 +187,8 @@ export function classifyConflict(file, embeds = new Map()) {
         return "lockfile";
     if (LEDGER_PATTERNS.some((re) => re.test(file)))
         return "ledger";
+    if (fid !== undefined && fid !== "" && isOwnPlanFile(file, fid))
+        return "planlog";
     return "refuse";
 }
 /** First-occurrence-wins line de-dup; a non-empty result always ends with a newline. */
@@ -389,15 +396,28 @@ export function recordResolve(top, dev) {
     fs.writeFileSync(path.join(top, INSTALL_RECORD), serializeBkitVersion(merged));
     return { ok: true };
 }
-const NOT_RESOLVABLE = "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record";
+const NOT_RESOLVABLE = "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one, the install record or a plan file of this feature's own branch";
 /** How a rebase settled each kind of conflict, for its log. */
 const REBASE_HOW = {
+    dev: "took the rebase target's copy",
     union: "union (append-only ledger)",
     lockfile: "took rebase target + regenerated",
     register: "took rebase target's copy of a generated register",
     embed: "took rebase target's copy of the generated block, merged the rest",
     record: "merged the install record entry by entry, rebase target's value where both changed",
 };
+/**
+ * Take the integration target's side of a conflicted file and stage it, or `git rm`
+ * it when that side deleted it. `dev` names the stage: `ours` in a rebase,
+ * `theirs` in a merge of origin/dev.
+ */
+function takeDevSide(top, file, dev) {
+    const stage = dev === "ours" ? 2 : 3;
+    const devHasIt = runGit(top, ["cat-file", "-e", `:${stage}:${file}`]).ok;
+    return devHasIt
+        ? runGit(top, ["checkout", `--${dev}`, "--", file]).ok && runGit(top, ["add", "--", file]).ok
+        : runGit(top, ["rm", "-q", "--", file]).ok;
+}
 /**
  * Drive an in-progress rebase to completion, auto-resolving each stop. Loops
  * because `--continue` replays the next commit, which can conflict in turn; the
@@ -425,18 +445,27 @@ export function resolveRebase(top, onLog = () => undefined) {
         return result;
     };
     const embeds = embedDocs(top);
+    const fid = rebasedFid(top)?.fid;
     while (result.rounds < 100) {
         result.rounds++;
         const conflicts = unmergedPaths(top);
         if (conflicts.length > 0) {
             // Classify the whole set before resolving any of it, so a refused path
             // never leaves half the set rewritten.
-            const refused = conflicts.find((f) => classifyConflict(f, embeds) === "refuse");
+            const refused = conflicts.find((f) => classifyConflict(f, embeds, fid) === "refuse");
             if (refused !== undefined) {
                 return refuse(`REFUSE ${refused} — ${NOT_RESOLVABLE}; routing to Failure Path`, refused, NOT_RESOLVABLE);
             }
             for (const f of conflicts) {
-                const kind = classifyConflict(f, embeds);
+                const kind = classifyConflict(f, embeds, fid);
+                if (kind === "planlog") {
+                    if (!takeDevSide(top, f, "ours")) {
+                        return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
+                    }
+                    result.resolved.push({ path: f, how: "dev" });
+                    log(`RESOLVED ${f} — ${REBASE_HOW.dev}`);
+                    continue;
+                }
                 const settled = kind === "register"
                     ? registerResolve(top, f, "ours")
                     : kind === "embed"
@@ -680,18 +709,22 @@ function rebaseVerb(ctx) {
 }
 /** The branch tip the in-progress rebase started from. */
 function rebaseOrigHead(top) {
+    return readRebaseState(top, "orig-head");
+}
+/** Read one state file of the in-progress rebase, or null. */
+function readRebaseState(top, name) {
     for (const dir of ["rebase-merge", "rebase-apply"]) {
-        const file = git(top, [
-            "rev-parse",
-            "--path-format=absolute",
-            "--git-path",
-            `${dir}/orig-head`,
-        ]);
+        const file = git(top, ["rev-parse", "--path-format=absolute", "--git-path", `${dir}/${name}`]);
         if (file !== null && fs.existsSync(file))
             return fs.readFileSync(file, "utf-8").trim();
     }
     return null;
 }
+/** The feature id of the `feat/{fid}` branch being rebased, or null for any other branch. */
+function rebasedFid(top) {
+    const m = /^refs\/heads\/feat\/(.+)$/.exec(readRebaseState(top, "head-name") ?? "");
+    return m ? { fid: m[1] } : null;
+}
 /** Git collapses a failing pre-push hook's status, so the hook's tests-lock status file alone decides. */
 function runPush(cwd, args, branch) {
     const who = `bkit branches push ${branch}`;
@@ -1813,10 +1846,7 @@ function resolvePath(top, file, policy, embeds) {
             return { refused: "outside docs/ and the ledgers" };
         // In a merge `--theirs` is the branch merged in: dev. Dev deleting the file
         // leaves no stage 3, and taking dev's side means deleting it here too.
-        const devHasIt = runGit(top, ["cat-file", "-e", `:3:${file}`]).ok;
-        const ok = devHasIt
-            ? runGit(top, ["checkout", "--theirs", "--", file]).ok && runGit(top, ["add", "--", file]).ok
-            : runGit(top, ["rm", "-q", "--", file]).ok;
+        const ok = takeDevSide(top, file, "theirs");
         return ok ? "dev" : { refused: `taking ${DEV}'s side failed` };
     }
     if (kind === "lockfile") {
