diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index d640e88f9..18f14ecbf 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -1774,6 +1774,43 @@ const startedThenFailed = (workflow: string, start: number) =>
     { type: "workflow-failed", workflow, at: new Date(start + 500).toISOString() },
   ]);
 
+/** A gh on PATH that records its calls and answers one open PR on `head`, merging on request. */
+function ghStub(head: string, base: "dev" | "none" = "dev") {
+  const bin = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-gh-")));
+  dirs.push(bin);
+  const baseField = base === "dev" ? ',"baseRefName":"dev"' : "";
+  fs.writeFileSync(
+    path.join(bin, "gh"),
+    [
+      "#!/bin/sh",
+      `echo "$*" >> "${bin}/calls"`,
+      'case "$1 $2" in',
+      '  "pr create") exit 0 ;;',
+      `  "pr list") echo '[{"number":9,"url":"https://github.com/o/r/pull/9","state":"OPEN"${baseField},"headRefName":"${head}"}]' ;;`,
+      `  "pr view") if [ -f "${bin}/merged" ]; then echo '{"number":9,"state":"MERGED","baseRefName":"dev","mergeCommit":{"oid":"abc"}}'; else echo '{"number":9,"state":"OPEN"${baseField}}'; fi ;;`,
+      `  "pr merge") : > "${bin}/merged"; exit 0 ;;`,
+      "esac",
+      "",
+    ].join("\n"),
+    { mode: 0o755 },
+  );
+  const calls = () =>
+    fs.existsSync(path.join(bin, "calls"))
+      ? fs.readFileSync(path.join(bin, "calls"), "utf-8").trim().split("\n")
+      : [];
+  return { bin, calls };
+}
+
+async function withGhOnPath<T>(bin: string, fn: () => Promise<T>): Promise<T> {
+  const saved = process.env.PATH;
+  process.env.PATH = `${bin}${path.delimiter}${saved ?? ""}`;
+  try {
+    return await fn();
+  } finally {
+    process.env.PATH = saved;
+  }
+}
+
 describe("bkit workflows handover", () => {
   function withRemote() {
     const cwd = repo();
@@ -1936,7 +1973,7 @@ describe("bkit workflows handover", () => {
     expect(r.json.handover).toBe(`${REL}/ship-handover.md`);
   });
 
-  it("--flush refused by dev keeps the record in the book and exits 10", async () => {
+  it("--flush refused by dev with the PR path failing keeps the record and exits 10", async () => {
     const { remote, wt } = withDevRemote();
     const hook = path.join(remote, "hooks", "pre-receive");
     fs.writeFileSync(hook, "#!/bin/sh\necho protected >&2\nexit 1\n", { mode: 0o755 });
@@ -1948,6 +1985,50 @@ describe("bkit workflows handover", () => {
     expect(r.err).toContain(`ship FAILED record kept in ${wt}`);
     expect(git(remote, "rev-parse", "dev")).toBe(before);
     expect(fs.existsSync(path.join(wt, REL, "status.jsonl"))).toBe(true);
+    expect(r.err).toContain("dev refused the push");
+    expect(r.err).toMatch(/branch push failed/);
+  });
+
+  /** A remote whose hook refuses only dev, so a ship-failed branch push goes through. */
+  function devOnlyRefused() {
+    const s = withDevRemote();
+    fs.writeFileSync(
+      path.join(s.remote, "hooks", "pre-receive"),
+      '#!/bin/sh\nwhile read o n ref; do [ "$ref" = refs/heads/dev ] && { echo "dev is protected" >&2; exit 1; }; done\nexit 0\n',
+      { mode: 0o755 },
+    );
+    write(s.wt, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "ship" }]));
+    return s;
+  }
+
+  it("--flush refused by dev publishes the FAILED record through a PR", async () => {
+    const { remote, wt } = devOnlyRefused();
+    const before = git(remote, "rev-parse", "dev");
+    const gh = ghStub(`ship-failed/${FID}`);
+    const r = await withGhOnPath(gh.bin, () =>
+      run(wt, wf("handover", "ship", `--month=${M}`, "--flush")),
+    );
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ pushed: true, ref: `ship-failed/${FID}` });
+    expect(git(remote, "rev-parse", "dev")).toBe(before);
+    expect(git(remote, "log", "-1", "--format=%s", `ship-failed/${FID}`)).toBe(
+      "chore(12-export-csv): ship FAILED bkit [skip ci]",
+    );
+    expect(git(remote, "show", `ship-failed/${FID}:${REL}/status.jsonl`)).toContain(
+      "workflow-failed",
+    );
+    expect(gh.calls().some((c) => c.startsWith("pr merge"))).toBe(true);
+  });
+
+  it("closePr titles the PR by the record it carries", async () => {
+    const { wt } = devOnlyRefused();
+    const gh = ghStub(`ship-failed/${FID}`);
+    await withGhOnPath(gh.bin, () => run(wt, wf("handover", "ship", `--month=${M}`, "--flush")));
+    const create = gh.calls().filter((c) => c.startsWith("pr create"));
+    expect(create).toHaveLength(1);
+    expect(create[0]).toContain("--title chore(12-export-csv): ship FAILED");
+    expect(create[0]).toContain(`--head ship-failed/${FID}`);
+    expect(create[0]).not.toContain("ship DONE");
   });
 
   describe("route and message: every exit the handover reaches ends the run as a stop", () => {
@@ -2526,39 +2607,9 @@ describe("bkit workflows close --flush (ship)", () => {
         '#!/bin/sh\nwhile read o n ref; do [ "$ref" = refs/heads/dev ] && { echo "dev is protected" >&2; exit 1; }; done\nexit 0\n',
         { mode: 0o755 },
       );
-      const bin = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-gh-")));
-      dirs.push(bin);
-      const baseField = base === "dev" ? ',"baseRefName":"dev"' : "";
-      fs.writeFileSync(
-        path.join(bin, "gh"),
-        [
-          "#!/bin/sh",
-          `echo "$*" >> "${bin}/calls"`,
-          'case "$1 $2" in',
-          '  "pr create") exit 0 ;;',
-          `  "pr list") echo '[{"number":9,"url":"https://github.com/o/r/pull/9","state":"OPEN"${baseField},"headRefName":"ship-close/${FID}"}]' ;;`,
-          `  "pr view") if [ -f "${bin}/merged" ]; then echo '{"number":9,"state":"MERGED","baseRefName":"dev","mergeCommit":{"oid":"abc"}}'; else echo '{"number":9,"state":"OPEN"${baseField}}'; fi ;;`,
-          `  "pr merge") : > "${bin}/merged"; exit 0 ;;`,
-          "esac",
-          "",
-        ].join("\n"),
-        { mode: 0o755 },
-      );
-      const calls = () =>
-        fs.existsSync(path.join(bin, "calls"))
-          ? fs.readFileSync(path.join(bin, "calls"), "utf-8").trim().split("\n")
-          : [];
-      return { ...s, bin, calls };
+      return { ...s, ...ghStub(`ship-close/${FID}`, base) };
     }
-    const withGh = async <T>(bin: string, fn: () => Promise<T>) => {
-      const saved = process.env.PATH;
-      process.env.PATH = `${bin}${path.delimiter}${saved ?? ""}`;
-      try {
-        return await fn();
-      } finally {
-        process.env.PATH = saved;
-      }
-    };
+    const withGh = withGhOnPath;
 
     it("closePr with base dev still merges", async () => {
       const { wt, close, bin, calls } = refusedDev("dev");
@@ -2566,6 +2617,9 @@ describe("bkit workflows close --flush (ship)", () => {
       expect(r.code).toBe(0);
       expect(r.json.landed).toEqual({ ref: `ship-close/${FID}`, via: "close-pr" });
       expect(calls().some((c) => c.startsWith("pr merge"))).toBe(true);
+      expect(calls().find((c) => c.startsWith("pr create"))).toContain(
+        `--title docs(${FID}): ship DONE`,
+      );
     });
 
     it("closePr refuses when the PR base is unknown", async () => {
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 69e513aa4..2036728d6 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -717,7 +717,14 @@ const NOTHING_TO_LAND = new Error("no bookkeeping delta");
  */
 async function landFailedRecord(
   ctx: RunContext,
-  o: { workflow: string; fid: string; month: string; book: string; shared: boolean },
+  o: {
+    workflow: string;
+    fid: string;
+    month: string;
+    book: string;
+    shared: boolean;
+    viaPr: boolean;
+  },
 ): Promise<{
   code: number;
   pushed: boolean;
@@ -743,10 +750,25 @@ async function landFailedRecord(
   const startMs = starts.length > 0 ? Math.max(...starts) : NaN;
   let carried: Carried | undefined;
   let res: DevPush;
+  let pr: { ref: string; via: string } | { failed: string } | null = null;
+  let refusal = "";
   try {
     res = await pushToDev({
       root,
       dir: landDir(root, o.fid),
+      refused: o.viaPr
+        ? async (dir, stderr) => {
+            refusal = stderr;
+            ctx.log(
+              `dev refused the ${o.workflow} FAILED push — publishing it through a PR: ${stderr}`,
+            );
+            pr = closePr(ctx, dir, {
+              title: `chore(${o.fid}): ${o.workflow} FAILED`,
+              branch: `ship-failed/${o.fid}`,
+              subject: `chore(${o.fid}): ${o.workflow} FAILED bkit [skip ci]`,
+            });
+          }
+        : undefined,
       build: (dir) => {
         if (o.shared)
           carried = carryOwnBook(
@@ -791,8 +813,16 @@ async function landFailedRecord(
   switch (res.kind) {
     case "landed":
       return { code: EXIT.OK, pushed: true, ref: DEV, skipped: null, sha: res.sha, carried };
-    case "refused":
-      return stop(EXIT_PUSH_FAILED, `dev refused the push: ${res.stderr}`);
+    case "refused": {
+      const landedPr = pr as { ref: string; via: string } | { failed: string } | null;
+      if (landedPr === null) return stop(EXIT_PUSH_FAILED, `dev refused the push: ${res.stderr}`);
+      if ("failed" in landedPr)
+        return stop(
+          EXIT_PUSH_FAILED,
+          `dev refused the push: ${refusal || res.stderr}; the PR path failed too: ${landedPr.failed}`,
+        );
+      return { code: EXIT.OK, pushed: true, ref: landedPr.ref, skipped: null };
+    }
     case "push-failed":
       return stop(EXIT_PUSH_FAILED, `dev push failed without a server answer: ${res.stderr}`);
     case "exhausted":
@@ -864,7 +894,14 @@ async function handoverVerb(ctx: RunContext): Promise<number> {
     writeParkedCommits(tree, workflow, rec);
   }
   if (push && shared) {
-    const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
+    const r = await landFailedRecord(ctx, {
+      workflow,
+      fid,
+      month,
+      book: tree,
+      shared,
+      viaPr: false,
+    });
     if (r.sha !== undefined && r.carried !== undefined) handed = { sha: r.sha, carried: r.carried };
     code = r.code;
     pushed = r.pushed;
@@ -887,7 +924,14 @@ async function handoverVerb(ctx: RunContext): Promise<number> {
           ? EXIT_OPEN_PR_KEPT
           : EXIT_PUSH_FAILED;
   } else if (flush) {
-    const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
+    const r = await landFailedRecord(ctx, {
+      workflow,
+      fid,
+      month,
+      book: tree,
+      shared,
+      viaPr: true,
+    });
     if (r.sha !== undefined && r.carried !== undefined) handed = { sha: r.sha, carried: r.carried };
     code = r.code;
     pushed = r.pushed;
@@ -1428,19 +1472,18 @@ export function closeWorkflow(
 }
 
 /**
- * Publish a close commit dev refused through its own `ship-close/{fid}` PR,
+ * Publish a commit dev refused through its own `branch` PR titled `title`,
  * merged with an empty body. Returns where it landed, or why it did not.
  */
 function closePr(
   ctx: RunContext,
   dir: string,
-  fid: string,
-  subject: string,
+  o: { title: string; branch: string; subject: string },
 ): { ref: string; via: string } | { failed: string } {
-  const branch = `ship-close/${fid}`;
+  const { branch, title, subject } = o;
   const head = headSha(dir);
   if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
-    return { failed: `close branch push failed` };
+    return { failed: `close branch push failed for ${branch}` };
   const created = runGh(dir, [
     "pr",
     "create",
@@ -1449,7 +1492,7 @@ function closePr(
     "--head",
     branch,
     "--title",
-    `docs(${fid}): ship DONE`,
+    title,
     "--body",
     "",
   ]);
@@ -1462,7 +1505,8 @@ function closePr(
     { number: String(number), subject, matchHead: head, deleteBranch: true },
     ctx.log,
   );
-  if (!merged.out.merged) ctx.log(`close PR #${number} opened but not merged — merge it by hand`);
+  if (!merged.out.merged)
+    ctx.log(`close PR #${number} (${branch}) opened but not merged — merge it by hand`);
   return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open" };
 }
 
@@ -1510,7 +1554,11 @@ async function shipClose(
       },
       refused: async (dir, stderr) => {
         ctx.log(`dev refused the close push — publishing it through a PR: ${stderr}`);
-        viaPr = closePr(ctx, dir, o.fid, subject);
+        viaPr = closePr(ctx, dir, {
+          title: `docs(${o.fid}): ship DONE`,
+          branch: `ship-close/${o.fid}`,
+          subject,
+        });
       },
       log: ctx.log,
     });
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index dec376638..bb5aebc1b 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -550,10 +550,23 @@ async function landFailedRecord(ctx, o) {
     const startMs = starts.length > 0 ? Math.max(...starts) : NaN;
     let carried;
     let res;
+    let pr = null;
+    let refusal = "";
     try {
         res = await pushToDev({
             root,
             dir: landDir(root, o.fid),
+            refused: o.viaPr
+                ? async (dir, stderr) => {
+                    refusal = stderr;
+                    ctx.log(`dev refused the ${o.workflow} FAILED push — publishing it through a PR: ${stderr}`);
+                    pr = closePr(ctx, dir, {
+                        title: `chore(${o.fid}): ${o.workflow} FAILED`,
+                        branch: `ship-failed/${o.fid}`,
+                        subject: `chore(${o.fid}): ${o.workflow} FAILED bkit [skip ci]`,
+                    });
+                }
+                : undefined,
             build: (dir) => {
                 if (o.shared)
                     carried = carryOwnBook(book, dir, {
@@ -594,8 +607,14 @@ async function landFailedRecord(ctx, o) {
     switch (res.kind) {
         case "landed":
             return { code: EXIT.OK, pushed: true, ref: DEV, skipped: null, sha: res.sha, carried };
-        case "refused":
-            return stop(EXIT_PUSH_FAILED, `dev refused the push: ${res.stderr}`);
+        case "refused": {
+            const landedPr = pr;
+            if (landedPr === null)
+                return stop(EXIT_PUSH_FAILED, `dev refused the push: ${res.stderr}`);
+            if ("failed" in landedPr)
+                return stop(EXIT_PUSH_FAILED, `dev refused the push: ${refusal || res.stderr}; the PR path failed too: ${landedPr.failed}`);
+            return { code: EXIT.OK, pushed: true, ref: landedPr.ref, skipped: null };
+        }
         case "push-failed":
             return stop(EXIT_PUSH_FAILED, `dev push failed without a server answer: ${res.stderr}`);
         case "exhausted":
@@ -659,7 +678,14 @@ async function handoverVerb(ctx) {
         writeParkedCommits(tree, workflow, rec);
     }
     if (push && shared) {
-        const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
+        const r = await landFailedRecord(ctx, {
+            workflow,
+            fid,
+            month,
+            book: tree,
+            shared,
+            viaPr: false,
+        });
         if (r.sha !== undefined && r.carried !== undefined)
             handed = { sha: r.sha, carried: r.carried };
         code = r.code;
@@ -688,7 +714,14 @@ async function handoverVerb(ctx) {
                     : EXIT_PUSH_FAILED;
     }
     else if (flush) {
-        const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
+        const r = await landFailedRecord(ctx, {
+            workflow,
+            fid,
+            month,
+            book: tree,
+            shared,
+            viaPr: true,
+        });
         if (r.sha !== undefined && r.carried !== undefined)
             handed = { sha: r.sha, carried: r.carried };
         code = r.code;
@@ -1114,14 +1147,14 @@ export function closeWorkflow(cwd, o, log) {
     };
 }
 /**
- * Publish a close commit dev refused through its own `ship-close/{fid}` PR,
+ * Publish a commit dev refused through its own `branch` PR titled `title`,
  * merged with an empty body. Returns where it landed, or why it did not.
  */
-function closePr(ctx, dir, fid, subject) {
-    const branch = `ship-close/${fid}`;
+function closePr(ctx, dir, o) {
+    const { branch, title, subject } = o;
     const head = headSha(dir);
     if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
-        return { failed: `close branch push failed` };
+        return { failed: `close branch push failed for ${branch}` };
     const created = runGh(dir, [
         "pr",
         "create",
@@ -1130,7 +1163,7 @@ function closePr(ctx, dir, fid, subject) {
         "--head",
         branch,
         "--title",
-        `docs(${fid}): ship DONE`,
+        title,
         "--body",
         "",
     ]);
@@ -1142,7 +1175,7 @@ function closePr(ctx, dir, fid, subject) {
         return { failed: `close PR not found for ${branch}` };
     const merged = mergePr(dir, { number: String(number), subject, matchHead: head, deleteBranch: true }, ctx.log);
     if (!merged.out.merged)
-        ctx.log(`close PR #${number} opened but not merged — merge it by hand`);
+        ctx.log(`close PR #${number} (${branch}) opened but not merged — merge it by hand`);
     return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open" };
 }
 /**
@@ -1182,7 +1215,11 @@ async function shipClose(ctx, o, token) {
             },
             refused: async (dir, stderr) => {
                 ctx.log(`dev refused the close push — publishing it through a PR: ${stderr}`);
-                viaPr = closePr(ctx, dir, o.fid, subject);
+                viaPr = closePr(ctx, dir, {
+                    title: `docs(${o.fid}): ship DONE`,
+                    branch: `ship-close/${o.fid}`,
+                    subject,
+                });
             },
             log: ctx.log,
         });
