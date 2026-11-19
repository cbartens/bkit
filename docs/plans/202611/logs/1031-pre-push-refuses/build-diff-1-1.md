diff --git a/.bkit/cli.md b/.bkit/cli.md
index 0878b0123..46fd5cc40 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -117,7 +117,7 @@ Gates CI and the git hooks run.
 | `slop` | by hand | `--base` | Fail when the working tree adds or worsens slop on net against a base ref. |
 | `prose` | by hand | `--glob` | Run Vale over tracked and unignored Markdown, or explicit globs; fail when sources, Vale or required styles are unavailable. |
 | `skip-token` | by hand | `--ref` | Whether a commit message carries a GitHub skip-CI token ([skip ci] and kin). |
-| `min-push` | by hand | `--ref` `--base` `--update` | Exit 0 when every file a push changes is one bkit writes or bkit.testing.minPushPaths / ciSkipPaths adds (the pre-push light gate). |
+| `min-push` | by hand | `--ref` `--base` `--target` `--update` | Exit 0 when every file a push changes is one bkit writes or bkit.testing.minPushPaths / ciSkipPaths adds (the pre-push light gate). |
 | `push-gate` | by hand | **`--gate`** | Run a consumer push gate and record successful full-gate proof for the exact clean commit. |
 | `bookkeeping-push` | by hand | **`--from`** `--to` `--branch` | Exit 0 when a feature-branch push adds bookkeeping only on top of the remote head (ship's --scope=pr allow-list). |
 | `pins` | by hand | `--file` | Download each *_VERSION + *_SHA256 pinned tool in the files and fail when a hash differs. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 2aeea5874..8b0ceca90 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -117,7 +117,7 @@ Gates CI and the git hooks run.
 | `slop` | by hand | `--base` | Fail when the working tree adds or worsens slop on net against a base ref. |
 | `prose` | by hand | `--glob` | Run Vale over tracked and unignored Markdown, or explicit globs; fail when sources, Vale or required styles are unavailable. |
 | `skip-token` | by hand | `--ref` | Whether a commit message carries a GitHub skip-CI token ([skip ci] and kin). |
-| `min-push` | by hand | `--ref` `--base` `--update` | Exit 0 when every file a push changes is one bkit writes or bkit.testing.minPushPaths / ciSkipPaths adds (the pre-push light gate). |
+| `min-push` | by hand | `--ref` `--base` `--target` `--update` | Exit 0 when every file a push changes is one bkit writes or bkit.testing.minPushPaths / ciSkipPaths adds (the pre-push light gate). |
 | `push-gate` | by hand | **`--gate`** | Run a consumer push gate and record successful full-gate proof for the exact clean commit. |
 | `bookkeeping-push` | by hand | **`--from`** `--to` `--branch` | Exit 0 when a feature-branch push adds bookkeeping only on top of the remote head (ship's --scope=pr allow-list). |
 | `pins` | by hand | `--file` | Download each *_VERSION + *_SHA256 pinned tool in the files and fail when a hash differs. |
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index bd6321b16..b011ea576 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -321,6 +321,7 @@ chmod +x .husky/pre-commit .husky/pre-push
   - With a PR open, `bkit ci bookkeeping-push --from=<remote head>` lets the push through when every file changed since the head the remote holds is on ship's `--scope=pr` allow-list. Such a push adds nothing that CI has not tested at that head.
   - A rewritten head or a code file still blocks.
   - On `dev` / `main`, the skip-CI check uses the complete branch diff, independently of local gate receipts. Code cannot skip CI merely because its local gate passed.
+  - Audit reports and audit templates' project sections may skip CI on `dev` only. For a push to `main` the hook adds `--target=main` to `bkit ci min-push`, which also diffs against `origin/main` and refuses those files with the trigger-commit fix; an unresolved `origin/main` is not proven.
 - PR conflict check:
   - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
   - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 97c882ccd..9f6a2dd6a 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1225,6 +1225,7 @@ describe(".husky/pre-push min push", () => {
       const r = push(hook, head, "refs/heads/dev");
       expect(r.status).toBe(0);
       expect(r.stderr).not.toContain("CI-suppressing token");
+      expect(r.stderr).not.toContain("BLOCKED");
       expect(r.calls).toContain("bkit:gate:min");
       expect(r.calls).not.toContain("bkit:gate:static-unit");
     });
@@ -1242,10 +1243,75 @@ describe(".husky/pre-push min push", () => {
       const r = push(hook, head, "refs/heads/dev", remote);
       expect(r.status).toBe(0);
       expect(r.stderr).not.toContain("CI-suppressing token");
+      expect(r.stderr).not.toContain("BLOCKED");
       expect(r.calls).toContain("bkit:gate:min");
       expect(r.calls).not.toContain("bkit:gate:static-unit");
     });
 
+    /** `origin/main` at the base commit `origin/dev` holds. */
+    const mainAtBase = () =>
+      gitIn(
+        "update-ref",
+        "refs/remotes/origin/main",
+        gitIn("rev-parse", "refs/remotes/origin/dev"),
+      );
+    const TEMPLATE_FILE = "docs/templates/bkit-audit-x.md";
+    const template = (project: string) =>
+      `<!-- bkit:start -->\n<!-- managed-version: 1 -->\nblock\n<!-- bkit:end -->\n\n## Project Instructions\n${project}\n`;
+
+    it(`${hook}: audit report to main under a [skip ci] head → blocked before any gate`, () => {
+      mainAtBase();
+      const head = commitFiles(
+        { "docs/audits/202611/security.md": "# Report\n" },
+        "docs(1): audit report bkit [skip ci]",
+      );
+      const r = push(hook, head, "refs/heads/main");
+      expect(r.status).toBe(1);
+      expect(r.stderr).toContain("docs/audits/202611/security.md");
+      expect(r.calls).toEqual([]);
+    });
+
+    it(`${hook}: audit-template project section to main under a [skip ci] head → blocked before any gate`, () => {
+      const remote = commitFiles({ [TEMPLATE_FILE]: template("old") }, "docs(1): add template");
+      gitIn("update-ref", "refs/remotes/origin/dev", remote);
+      gitIn("update-ref", "refs/remotes/origin/main", remote);
+      const head = commitFiles(
+        { [TEMPLATE_FILE]: template("new project text") },
+        "docs(1): audit project section bkit [skip ci]",
+      );
+      const r = push(hook, head, "refs/heads/main", remote);
+      expect(r.status).toBe(1);
+      expect(r.stderr).toContain(TEMPLATE_FILE);
+      expect(r.calls).toEqual([]);
+    });
+
+    it(`${hook}: plans-only change to main under a [skip ci] head → allowed, light gate`, () => {
+      mainAtBase();
+      const r = push(hook, commitFiles(PLAN, "docs(1): plan bkit [skip ci]"), "refs/heads/main");
+      expect(r.status).toBe(0);
+      expect(r.stderr).not.toContain("BLOCKED");
+      expect(r.calls).toContain("bkit:gate:min");
+      expect(r.calls).not.toContain("bkit:gate:static-unit");
+    });
+
+    it(`${hook}: one push updating dev and main with an audit-only [skip ci] head → blocked before any gate`, () => {
+      mainAtBase();
+      const head = commitFiles(
+        { "docs/audits/202611/security.md": "# Report\n" },
+        "docs(1): audit report bkit [skip ci]",
+      );
+      const r = push(
+        hook,
+        head,
+        "refs/heads/dev",
+        ZERO,
+        `refs/heads/feat/1-x ${head} refs/heads/main ${ZERO}\n`,
+      );
+      expect(r.status).toBe(1);
+      expect(r.stderr).toContain("docs/audits/202611/security.md");
+      expect(r.calls).toEqual([]);
+    });
+
     it(`${hook}: code to dev with a clean head → not blocked, full gate`, () => {
       const r = push(hook, commitFiles({ "src/a.ts": "b\n" }, "feat(1): a"), "refs/heads/dev");
       expect(r.status).toBe(0);
diff --git a/.bkit/core/engine/commands/ci/ci.test.ts b/.bkit/core/engine/commands/ci/ci.test.ts
index d764faaf1..1283601ff 100644
--- a/.bkit/core/engine/commands/ci/ci.test.ts
+++ b/.bkit/core/engine/commands/ci/ci.test.ts
@@ -1259,4 +1259,99 @@ describe("bkit ci min-push", () => {
     expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
     expect(r.json.outside).toEqual(["src/a.ts"]);
   });
+
+  /** `pushedFrom` with `origin/main` also at the base commit (the commit `origin/dev` holds). */
+  function pushedToMain(
+    before: Record<string, string>,
+    after: Record<string, string | null>,
+    pkg?: unknown,
+  ) {
+    const p = pushedFrom(before, after, pkg);
+    git(p.cwd, "update-ref", "refs/remotes/origin/main", p.base);
+    return p;
+  }
+
+  it("--target=main refuses a docs/audits change even when minPushPaths matches it", async () => {
+    const { cwd, head } = pushedToMain(
+      {},
+      { "docs/audits/202611/security.md": "# Report\n" },
+      { bkit: { testing: { minPushPaths: ["docs/audits/**"] } } },
+    );
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json.minPush).toBe(false);
+    expect(r.err).toContain("docs/audits/202611/security.md");
+    const plain = await run(cwd, [`--ref=${head}`], "min-push");
+    expect(plain.code).toBe(0);
+  });
+
+  it("--target=main refuses a change to an audit template's project section only", async () => {
+    const { cwd, head } = pushedToMain(belowOnly.before, belowOnly.after);
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json.minPush).toBe(false);
+    expect(r.err).toContain(T1);
+    const plain = await run(cwd, [`--ref=${head}`], "min-push");
+    expect(plain.code).toBe(0);
+  });
+
+  it("--target=main accepts a plans-only range", async () => {
+    const { cwd, head } = pushedToMain(
+      {},
+      { "docs/plans/202610/logs/1-x/status.jsonl": "{}\n", "docs/decisions.jsonl": "{}\n" },
+    );
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ minPush: true, reason: null, outside: [] });
+  });
+
+  it("--target=main finds an audit report already on origin/dev but not on origin/main", async () => {
+    const cwd = mkdir("bkit-ci-main-");
+    git(cwd, "init", "-q", "-b", "feat/1-x");
+    write(cwd, "src/a.ts", "export {};\n");
+    const onMain = commit(cwd, "main");
+    git(cwd, "update-ref", "refs/remotes/origin/main", onMain);
+    write(cwd, "docs/audits/202611/security.md", "# Report\n");
+    const onDev = commit(cwd, "docs(1): audit bkit [skip ci]");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", onDev);
+    write(cwd, "docs/plans/202611/logs/1-x/status.jsonl", "{}\n");
+    const head = commit(cwd, "docs(1): plan bkit [skip ci]");
+    const plain = await run(cwd, [`--ref=${head}`], "min-push");
+    expect(plain.code).toBe(0);
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json.minPush).toBe(false);
+    expect(r.err).toContain("docs/audits/202611/security.md");
+  });
+
+  it("--target=main accepts a range that looks empty against origin/dev and adds no audit file", async () => {
+    const cwd = mkdir("bkit-ci-main-");
+    git(cwd, "init", "-q", "-b", "feat/1-x");
+    write(cwd, "src/a.ts", "export {};\n");
+    const onMain = commit(cwd, "main");
+    git(cwd, "update-ref", "refs/remotes/origin/main", onMain);
+    write(cwd, "docs/plans/202611/logs/1-x/status.jsonl", "{}\n");
+    const head = commit(cwd, "docs(1): plan bkit [skip ci]");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", head);
+    const plain = await run(cwd, [`--ref=${head}`], "min-push");
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(plain.code);
+    expect(r.json.reason).toBe(plain.json.reason);
+    expect(r.json.outside).toEqual([]);
+    expect(r.err).not.toContain("docs/audits");
+  });
+
+  it("--target=main is not proven a min push when origin/main does not resolve", async () => {
+    const { cwd, head } = pushedFrom({}, { "docs/decisions.jsonl": "{}\n" });
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(7);
+    expect(r.json).toMatchObject({ minPush: false, reason: "unknown" });
+  });
+
+  it("without --target, an audit-only range is still a min push", async () => {
+    const { cwd, head } = pushedToMain({}, { "docs/audits/202611/security.md": "# Report\n" });
+    const r = await run(cwd, [`--ref=${head}`], "min-push");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ minPush: true, reason: null, outside: [] });
+  });
 });
diff --git a/.bkit/core/engine/commands/ci/ci.ts b/.bkit/core/engine/commands/ci/ci.ts
index e20e21ce6..c6a8ad7d3 100644
--- a/.bkit/core/engine/commands/ci/ci.ts
+++ b/.bkit/core/engine/commands/ci/ci.ts
@@ -664,6 +664,23 @@ export function minPushOutside(
   return { ok: true, changed: diff.changed, outside, sections };
 }
 
+/**
+ * Audit files a pushed commit brings onto `main`: every changed file against its merge-base with
+ * `origin/main` that sits under `docs/audits/**` or is an audit template changed only below its
+ * managed block. `null` when `origin/main` does not resolve or the diff cannot be read.
+ */
+function mainAuditFiles(root: string, sha: string, paths: readonly string[]): string[] | null {
+  if (!runGit(root, ["rev-parse", "--verify", "--quiet", "origin/main"]).ok) return null;
+  const mb = runGit(root, ["merge-base", sha, "origin/main"]);
+  if (!mb.ok || !mb.stdout) return null;
+  const names = runGit(root, ["diff", "--name-only", mb.stdout, sha]);
+  if (!names.ok) return null;
+  const diff = minPushOutside(root, mb.stdout, sha, paths);
+  if (!diff.ok) return null;
+  const audits = names.stdout.split("\n").filter((f) => f.startsWith("docs/audits/"));
+  return [...new Set([...audits, ...diff.sections])];
+}
+
 const sectionNote = (file: string) =>
   `${file}: only its project section below <!-- bkit:end --> changed`;
 
@@ -674,7 +691,14 @@ function minPush(ctx: RunContext): number {
   const refs = Array.isArray(given) && given.length > 0 ? given.map(String) : ["HEAD"];
   const baseFlag = typeof ctx.flags.base === "string" && ctx.flags.base ? ctx.flags.base : null;
   const paths = minPushPathspecs(readBkitConfig(top.stdout));
+  const target = typeof ctx.flags.target === "string" && ctx.flags.target ? ctx.flags.target : null;
+  if (target !== null && target !== "main") {
+    throw new CommandError(EXIT.USAGE, `--target accepts only 'main', got '${target}'`);
+  }
   const updates = ctx.flags.update;
+  if (target !== null && Array.isArray(updates) && updates.length > 0) {
+    throw new CommandError(EXIT.USAGE, "--update cannot be combined with --target");
+  }
   if (Array.isArray(updates) && updates.length > 0) {
     if ((Array.isArray(given) && given.length > 0) || baseFlag) {
       throw new CommandError(EXIT.USAGE, "--update cannot be combined with --ref or --base");
@@ -685,6 +709,7 @@ function minPush(ctx: RunContext): number {
   const changed = new Set<string>();
   const outside = new Set<string>();
   const sections = new Set<string>();
+  const auditFiles = new Set<string>();
   for (const ref of refs) {
     const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
     const base = sha ? (baseFlag ?? pushBase(ctx.cwd, sha)) : null;
@@ -702,8 +727,31 @@ function minPush(ctx: RunContext): number {
     for (const p of diff.changed) changed.add(p);
     for (const p of diff.outside) outside.add(p);
     for (const p of diff.sections) sections.add(p);
+    if (target === "main") {
+      const onMain = sha ? mainAuditFiles(top.stdout, sha, paths) : null;
+      if (onMain === null) {
+        ctx.log(`no origin/main base for ${ref} (or its git diff failed) — not proven a min push`);
+        ctx.emit({ minPush: false, reason: "unknown", changed: 0, outside: [], paths });
+        return EXIT_RANGE_UNKNOWN;
+      }
+      for (const p of onMain) auditFiles.add(p);
+    }
   }
   for (const p of [...sections].sort()) ctx.log(sectionNote(p));
+  if (auditFiles.size > 0) {
+    const list = [...auditFiles].sort();
+    ctx.log(
+      `this push brings audit files onto main under a skip-CI head, so no workflow would run: ${list.join(", ")}`,
+    );
+    ctx.emit({
+      minPush: false,
+      reason: "audit",
+      changed: changed.size,
+      outside: list,
+      paths,
+    });
+    return EXIT.NO;
+  }
 
   const result = (reason: string | null, code: number, message: string) => {
     ctx.log(message);
@@ -933,6 +981,11 @@ export const ciCommand: CommandSpec = {
           help: "a pushed commit (default HEAD); its range starts at its merge-base with origin/dev, else origin/main",
         },
         { name: "base", type: "string", help: "start every range here instead" },
+        {
+          name: "target",
+          type: "string",
+          help: "main: also refuse a push that brings a docs/audits/** file or an audit template's project section onto origin/main (not proven when origin/main does not resolve); excludes --update",
+        },
         {
           name: "update",
           type: "string",
@@ -943,7 +996,7 @@ export const ciCommand: CommandSpec = {
       output: {
         minPush:
           "true when every changed file matches a min-push path, or is a docs/templates/bkit-audit-*.md changed only below its <!-- bkit:end -->",
-        reason: "null when a min push; else no-changes | outside | unknown",
+        reason: "null when a min push; else no-changes | outside | audit | unknown",
         changed: "files the push changes, across every ref",
         outside:
           "the changed files no min-push path matches (an audit template changed only below its <!-- bkit:end --> is not listed)",
diff --git a/.bkit/templates.md b/.bkit/templates.md
index fe5ba735d..067b48487 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -321,6 +321,7 @@ chmod +x .husky/pre-commit .husky/pre-push
   - With a PR open, `bkit ci bookkeeping-push --from=<remote head>` lets the push through when every file changed since the head the remote holds is on ship's `--scope=pr` allow-list. Such a push adds nothing that CI has not tested at that head.
   - A rewritten head or a code file still blocks.
   - On `dev` / `main`, the skip-CI check uses the complete branch diff, independently of local gate receipts. Code cannot skip CI merely because its local gate passed.
+  - Audit reports and audit templates' project sections may skip CI on `dev` only. For a push to `main` the hook adds `--target=main` to `bkit ci min-push`, which also diffs against `origin/main` and refuses those files with the trigger-commit fix; an unresolved `origin/main` is not proven.
 - PR conflict check:
   - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
   - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index 31b992fcb..8b169070b 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -105,6 +105,7 @@ PUSH_BRANCH_SHA=""
 PUSH_SHAS=""
 PUSH_UPDATES=""
 PUSH_SHARED_SHAS=""
+PUSH_MAIN_SHAS=""
 PUSH_BRANCH_REMOTE_SHA=""
 if [ ! -t 0 ]; then
   while read -r _push_local_ref push_local_sha push_remote_ref push_remote_sha; do
@@ -123,6 +124,7 @@ if [ ! -t 0 ]; then
         case "$push_remote_ref" in
           refs/heads/dev|refs/heads/main) PUSH_SHARED_SHAS="$PUSH_SHARED_SHAS $push_local_sha" ;;
         esac
+        [ "$push_remote_ref" = "refs/heads/main" ] && PUSH_MAIN_SHAS="$PUSH_MAIN_SHAS $push_local_sha"
         ;;
     esac
   done
@@ -235,8 +237,13 @@ fi
 # the open-PR guard above (workflows push `[skip ci]` code heads mid-run).
 for push_sha in $PUSH_SHARED_SHAS; do
   if pnpm -s bkit ci skip-token --ref="$push_sha" < /dev/null > /dev/null; then
-    if ! pnpm -s bkit ci min-push --ref="$push_sha" < /dev/null > /dev/null; then
+    # A push to main also runs the audit check: audit reports may skip CI on dev only.
+    push_target=""
+    case " $PUSH_MAIN_SHAS " in *" $push_sha "*) push_target="--target=main" ;; esac
+    # shellcheck disable=SC2086 # the target flag is one fixed word or empty
+    if ! pnpm -s bkit ci min-push --ref="$push_sha" $push_target < /dev/null > /dev/null; then
       echo "[pre-push] BLOCKED: $push_sha carries a CI-suppressing token and changes files outside the min-push paths (what bkit writes, plus bkit.testing.minPushPaths) — that code would land on dev / main with no CI run." >&2
+      [ -z "$push_target" ] || echo "[pre-push] Audit reports and audit-template project sections may skip CI on dev only; a push to main must not bring them under a skip-CI head (the files are named above)." >&2
       echo "[pre-push] Add a clean trigger commit and re-push:  git commit --allow-empty -m \"chore: trigger CI\" && git push" >&2
       exit 1
     fi
diff --git a/.bkit/version b/.bkit/version
index e50dfff4f..892f801ce 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -202,7 +202,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "18c26161534caefd8c43c585ad868eaa5e26b4aff000afebb105d338a5f455b7",
     "docs/templates/bkit-audit-agents.md": "aebbd89d40f221122c76983f74a3320d306c863fdf621bac0d62a016370f2a7f",
     "docs/templates/bkit-audit-prompts.md": "c996e6e26d5ee7e5e19cc02b259e2f7e6356233f78eb3dab4fec160a7d1497ee",
-    ".bkit/templates.md": "c6362c1b0f2f7a4e182697517cc8ea8523e5648335616791f5d22664f3eac3c8",
+    ".bkit/templates.md": "f6a6e8f33c9370a40063852a60097b746f9d14e7d3613e0cadc5f2d6917e4c0f",
     "docs/templates/bkit-audit-adoption.md": "e5c51a0e1b815044a83c405af7ce1e51e5690c99b937a61a7e3fcc2fddc8fe7f",
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
@@ -251,7 +251,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "af388cd07a23a97499ea17fe31af94df5d55d96e27eacc3dfd66be6318a9f924",
+    ".bkit/cli.md": "6ebe60fb558104f6d702d9be7bc3ae776972a9fd596d1e2340ccd6e8725cbe4b",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/.husky/pre-push b/.husky/pre-push
index a98ff2117..b264354dc 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -162,6 +162,7 @@ PUSH_BRANCH_SHA=""
 PUSH_SHAS=""
 PUSH_UPDATES=""
 PUSH_SHARED_SHAS=""
+PUSH_MAIN_SHAS=""
 PUSH_BRANCH_REMOTE_SHA=""
 if [ ! -t 0 ]; then
   while read -r _push_local_ref push_local_sha push_remote_ref push_remote_sha; do
@@ -180,6 +181,7 @@ if [ ! -t 0 ]; then
         case "$push_remote_ref" in
           refs/heads/dev|refs/heads/main) PUSH_SHARED_SHAS="$PUSH_SHARED_SHAS $push_local_sha" ;;
         esac
+        [ "$push_remote_ref" = "refs/heads/main" ] && PUSH_MAIN_SHAS="$PUSH_MAIN_SHAS $push_local_sha"
         ;;
     esac
   done
@@ -292,8 +294,13 @@ fi
 # the open-PR guard above (workflows push `[skip ci]` code heads mid-run).
 for push_sha in $PUSH_SHARED_SHAS; do
   if pnpm -s bkit ci skip-token --ref="$push_sha" < /dev/null > /dev/null; then
-    if ! pnpm -s bkit ci min-push --ref="$push_sha" < /dev/null > /dev/null; then
+    # A push to main also runs the audit check: audit reports may skip CI on dev only.
+    push_target=""
+    case " $PUSH_MAIN_SHAS " in *" $push_sha "*) push_target="--target=main" ;; esac
+    # shellcheck disable=SC2086 # the target flag is one fixed word or empty
+    if ! pnpm -s bkit ci min-push --ref="$push_sha" $push_target < /dev/null > /dev/null; then
       echo "[pre-push] BLOCKED: $push_sha carries a CI-suppressing token and changes files outside the min-push paths (what bkit writes, plus bkit.testing.minPushPaths) — that code would land on dev / main with no CI run." >&2
+      [ -z "$push_target" ] || echo "[pre-push] Audit reports and audit-template project sections may skip CI on dev only; a push to main must not bring them under a skip-CI head (the files are named above)." >&2
       echo "[pre-push] Add a clean trigger commit and re-push:  git commit --allow-empty -m \"chore: trigger CI\" && git push" >&2
       exit 1
     fi
diff --git a/dist/commands/ci/ci.js b/dist/commands/ci/ci.js
index c78d3390f..9670f050e 100644
--- a/dist/commands/ci/ci.js
+++ b/dist/commands/ci/ci.js
@@ -577,6 +577,26 @@ export function minPushOutside(root, from, to, paths) {
     }
     return { ok: true, changed: diff.changed, outside, sections };
 }
+/**
+ * Audit files a pushed commit brings onto `main`: every changed file against its merge-base with
+ * `origin/main` that sits under `docs/audits/**` or is an audit template changed only below its
+ * managed block. `null` when `origin/main` does not resolve or the diff cannot be read.
+ */
+function mainAuditFiles(root, sha, paths) {
+    if (!runGit(root, ["rev-parse", "--verify", "--quiet", "origin/main"]).ok)
+        return null;
+    const mb = runGit(root, ["merge-base", sha, "origin/main"]);
+    if (!mb.ok || !mb.stdout)
+        return null;
+    const names = runGit(root, ["diff", "--name-only", mb.stdout, sha]);
+    if (!names.ok)
+        return null;
+    const diff = minPushOutside(root, mb.stdout, sha, paths);
+    if (!diff.ok)
+        return null;
+    const audits = names.stdout.split("\n").filter((f) => f.startsWith("docs/audits/"));
+    return [...new Set([...audits, ...diff.sections])];
+}
 const sectionNote = (file) => `${file}: only its project section below <!-- bkit:end --> changed`;
 function minPush(ctx) {
     const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
@@ -586,7 +606,14 @@ function minPush(ctx) {
     const refs = Array.isArray(given) && given.length > 0 ? given.map(String) : ["HEAD"];
     const baseFlag = typeof ctx.flags.base === "string" && ctx.flags.base ? ctx.flags.base : null;
     const paths = minPushPathspecs(readBkitConfig(top.stdout));
+    const target = typeof ctx.flags.target === "string" && ctx.flags.target ? ctx.flags.target : null;
+    if (target !== null && target !== "main") {
+        throw new CommandError(EXIT.USAGE, `--target accepts only 'main', got '${target}'`);
+    }
     const updates = ctx.flags.update;
+    if (target !== null && Array.isArray(updates) && updates.length > 0) {
+        throw new CommandError(EXIT.USAGE, "--update cannot be combined with --target");
+    }
     if (Array.isArray(updates) && updates.length > 0) {
         if ((Array.isArray(given) && given.length > 0) || baseFlag) {
             throw new CommandError(EXIT.USAGE, "--update cannot be combined with --ref or --base");
@@ -596,6 +623,7 @@ function minPush(ctx) {
     const changed = new Set();
     const outside = new Set();
     const sections = new Set();
+    const auditFiles = new Set();
     for (const ref of refs) {
         const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
         const base = sha ? (baseFlag ?? pushBase(ctx.cwd, sha)) : null;
@@ -616,9 +644,31 @@ function minPush(ctx) {
             outside.add(p);
         for (const p of diff.sections)
             sections.add(p);
+        if (target === "main") {
+            const onMain = sha ? mainAuditFiles(top.stdout, sha, paths) : null;
+            if (onMain === null) {
+                ctx.log(`no origin/main base for ${ref} (or its git diff failed) — not proven a min push`);
+                ctx.emit({ minPush: false, reason: "unknown", changed: 0, outside: [], paths });
+                return EXIT_RANGE_UNKNOWN;
+            }
+            for (const p of onMain)
+                auditFiles.add(p);
+        }
     }
     for (const p of [...sections].sort())
         ctx.log(sectionNote(p));
+    if (auditFiles.size > 0) {
+        const list = [...auditFiles].sort();
+        ctx.log(`this push brings audit files onto main under a skip-CI head, so no workflow would run: ${list.join(", ")}`);
+        ctx.emit({
+            minPush: false,
+            reason: "audit",
+            changed: changed.size,
+            outside: list,
+            paths,
+        });
+        return EXIT.NO;
+    }
     const result = (reason, code, message) => {
         ctx.log(message);
         ctx.emit({
@@ -819,6 +869,11 @@ export const ciCommand = {
                     help: "a pushed commit (default HEAD); its range starts at its merge-base with origin/dev, else origin/main",
                 },
                 { name: "base", type: "string", help: "start every range here instead" },
+                {
+                    name: "target",
+                    type: "string",
+                    help: "main: also refuse a push that brings a docs/audits/** file or an audit template's project section onto origin/main (not proven when origin/main does not resolve); excludes --update",
+                },
                 {
                     name: "update",
                     type: "string",
@@ -828,7 +883,7 @@ export const ciCommand = {
             ],
             output: {
                 minPush: "true when every changed file matches a min-push path, or is a docs/templates/bkit-audit-*.md changed only below its <!-- bkit:end -->",
-                reason: "null when a min push; else no-changes | outside | unknown",
+                reason: "null when a min push; else no-changes | outside | audit | unknown",
                 changed: "files the push changes, across every ref",
                 outside: "the changed files no min-push path matches (an audit template changed only below its <!-- bkit:end --> is not listed)",
                 paths: "the min-push pathspecs in force: ship's pr bookkeeping allow-list (with bkit.testing.ciSkipPaths), docs/plans/**, docs/audits/**, bkit.testing.minPushPaths",
diff --git a/docs/deployments.md b/docs/deployments.md
index 7c98e6906..801cdb789 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -583,6 +583,8 @@ The full pre-push gate checks the same static, unit and integration tiers as CI.
 
 **direnv load (pre-push, before every gate):** when the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the logged inner run goes through `direnv exec .`, so the gate sees `.envrc`'s variables whatever shell pushed. An untrusted `.envrc` → blocked before `bkit check`, with the `direnv allow .` fix. Every path then unsets the bkit tooling keys (`docs/security.md` § `.bkit/.env` scope). Contract: `.bkit/templates.md` § Git hooks — Husky.
 
+**Audit check on `main` (pre-push, with the CI-suppressor guard):** the audit allowance covers `dev` only. A push to `main` whose last commit carries a skip-CI token also runs `bkit ci min-push --target=main`, which diffs the pushed commit against its merge-base with `origin/main`. It refuses a `docs/audits/**` file or an audit template's project-section change, names the file, and gives the trigger-commit fix. When `origin/main` does not resolve, the push is not proven a min push and is blocked.
+
 **Delete-only push (pre-push, first):** every stdin ref carries an all-zero local SHA (`git push origin --delete <branch>`) → exit 0, no gates. Any ref with a non-zero local SHA, empty stdin, or stdin a terminal (hook run by hand) → all gates run.
 
 **CI-suppressor HEAD guard (pre-push, before gates):** it applies on a branch other than `dev` / `main` whose HEAD carries a skip-CI token (`[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`), which `bkit ci skip-token` reports with exit 0. The hook then probes `gh pr list --head <branch> --state open`. First match wins:
diff --git a/docs/security.md b/docs/security.md
index c3f9bee89..0b2154d8a 100644
--- a/docs/security.md
+++ b/docs/security.md
@@ -98,7 +98,7 @@ The shared untrusted-content contract lives in `.bkit/prompts.md` § Untrusted C
 
 Self-hosted Renovate runs with `BKIT_GH_TOKEN`. Its job token has read-only contents permission. The update classes eligible for automatic merge and the major updates that require review are defined in `.github/renovate.json5`. The Trivy workflow uses a digest-pinned scanner. Dependency checks and the advisory register are described in `docs/deployments.md` § Dependency updaters.
 
-**Accepted risk (audit reports and `[skip ci]`):** `docs/audits/**` sits in the files bkit writes (`minPushPathspecs`), so the pre-push hook lets an audit report reach `dev` or `main` under a `[skip ci]` head. No workflow runs on that push, the secret scan included. Audit reports are written from untrusted logs and CI evidence, so a report that quotes a leaked token lands unscanned. The owner accepted this risk; the decision is in `docs/decisions.jsonl`.
+**Accepted risk (audit reports and `[skip ci]`):** `docs/audits/**` sits in the files bkit writes (`minPushPathspecs`), so the pre-push hook lets an audit report reach `dev` under a `[skip ci]` head. On `main` the hook refuses it (`bkit ci min-push --target=main`). No workflow runs on that push, the secret scan included. Audit reports are written from untrusted logs and CI evidence, so a report that quotes a leaked token lands unscanned. The owner accepted this risk; the decision is in `docs/decisions.jsonl`.
 
 ## Untrusted Content & Prompt Injection
 
diff --git a/docs/testing.md b/docs/testing.md
index f077f2d2b..bfae630de 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -976,7 +976,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/ledgers/compact.test.ts` | Unit | Keyed-ledger compaction: superseded rows dropped, winner kept in place (equal `ts` → later line); fold unchanged apart from `firstTs` / `updates`; winners stamped `firstTs` / `updates` right after `ts`, stale values corrected; idempotent; malformed, non-object, blank, keyless and other-kind lines kept byte-for-byte; CRLF and missing final newline kept; union-resurrected rows dropped again with the count kept; parallel same-key updates both counted; same-`ts` copies counted once; old-shape rows folded by identity; `compactLedgers` writes via temp file, dry run counts only, an already-compact or missing ledger untouched. |
 | `.bkit/core/engine/ledgers/clamp-log.test.ts` | Unit | Clamp record log path (checkout `tmp/`, attempt suffix, non-git fallback) and reading (never drained, malformed line reported, missing log empty). |
 | `commands/workflow/plans.test.ts` | Unit | `bkit plans parse / comment`: `WS-N` and `P-N` blocks with `Covers` and `Requires`, one implicit plan per workstream when no `## Suggested Plans`, none → exit 3, comment body lists each plan with its covered workstreams. |
-| `commands/ci/ci.test.ts` | Unit + real `slop-scan` | `bkit ci slop`: net-finding / net-score gate, net-new / worsened findings named (line-shift pairs dropped), base resolution (`--base`, bare argument, `$SLOP_BASE_REF`, merge-base fallbacks, skip when absent or HEAD), slop-scan could-not-run vs failed, base worktree removed on SIGTERM. `bkit ci prose` (fake vale): glob selection, vale exit mapping, fail when Vale/styles are unavailable; skip a valid empty file selection, write-good restore from the main worktree else `vale sync`. `bkit ci skip-token`: token in subject or body, `--ref`, unreadable commit. `bkit ci min-push`: the floor (`docs/plans/**`, `docs/audits/**`, `minPushPaths`, `ciSkipPaths`), every `--ref` checked, and the audit-template exception: accepted only when the text through `<!-- bkit:end -->` is unchanged; a new, deleted or renamed template, a second marker, `bkit-plan.md` or a nested template is refused; `--update` logs an accepted template once. |
+| `commands/ci/ci.test.ts` | Unit + real `slop-scan` | `bkit ci slop`: net-finding / net-score gate, net-new / worsened findings named (line-shift pairs dropped), base resolution (`--base`, bare argument, `$SLOP_BASE_REF`, merge-base fallbacks, skip when absent or HEAD), slop-scan could-not-run vs failed, base worktree removed on SIGTERM. `bkit ci prose` (fake vale): glob selection, vale exit mapping, fail when Vale/styles are unavailable; skip a valid empty file selection, write-good restore from the main worktree else `vale sync`. `bkit ci skip-token`: token in subject or body, `--ref`, unreadable commit. `bkit ci min-push`: the floor (`docs/plans/**`, `docs/audits/**`, `minPushPaths`, `ciSkipPaths`), every `--ref` checked, and the audit-template exception: accepted only when the text through `<!-- bkit:end -->` is unchanged; a new, deleted or renamed template, a second marker, `bkit-plan.md` or a nested template is refused; `--update` logs an accepted template once. `--target=main`: refuses a `docs/audits/**` file or an audit template's project section measured against `origin/main` (even when `minPushPaths` matches), accepts plans-only and origin/dev-empty ranges, exits 7 when `origin/main` does not resolve; without it an audit-only range stays a min push. |
 | `commands/setup/setup.test.ts` | Unit (stub `gh`) | `bkit setup protect-main`: policy payload requiring `bkit.testing.ciCapstone`, pre-flight on the CI workflow and job name, `--dry-run`, `--print`, unauthenticated vs missing `gh`. |
 | `.bkit/core/engine/shared/settings.test.ts`, `json.test.ts`, `package-json.test.ts`, `package-manager.test.ts`, `timeouts.test.ts`, `egress.test.ts`, `branches.test.ts` | Unit | `package.json` `bkit` settings with per-key defaults (`testing.ciWorkflow`, `testing.ciCapstone`, `testing.ciGenerated` and `ciGeneratedSteps` = `CI_GENERATED_FLOOR` plus the key, `workflows.worktree.copy` / `install`, ask points (`ask` and limit per point, bad values falling back), tracker, board, required lanes, OpenCode providers, cloud variant, dependency-updater opt-out, which of tracker / cloud variant were explicitly set, an unknown tracker value kept as written); `package.json` edits; `parseJson` / `readJsonFile` (not JSON, a missing file and a directory all give `{ ok: false }`, never a throw); the installing-version reader (`readInstallingVersion`: the package's own version, and a throw naming the file when `package.json` is missing, not a JSON object, or lacks a non-empty string `version`); package-manager commands and could-not-run codes; the `TIMEOUTS` table; egress registry shape (bare lowercase hostnames, no duplicates, provider key placeholders); shared-branch rule (`isSharedBranch` true for `dev` / `main` only, false for look-alikes and the empty string); `workflows.build.publish` (default `true`, an explicit `local: false`, `remote: false` coerced to `true`, every invalid key listed, a non-object block reported). |
 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | Unit (markdown-invariant) | Shapes commands and routes depend on: one bkit lookup per workflow held as `{BKIT}`, Step 1 prompt file + `fids parse --prompt-file` + `fids resolve` + gated FID / lock in every phase workflow, `status resume` Resume and build's `openDecision` (a red gate re-run taken from `gateRerun` and `rerunFrom`, with no `GATE_RERUN` in `bkit-build.md`), build Decision Pause `Fix now` (a challenge task rewritten in place to the owner's direction, a hard blocker with no direction asked again, each item's `Fix task:` line written before `tests plan-check`, no second acceptance on a reopened `DECIDED` / `ASSUMED` pause, a verify or holistic pause routed `continue` ahead of the re-runs only through `decisions skip` (holistic through `tasks tick --decision` without `--group` before the decision row, then Step 11; verify through `tasks tick --decision` before the decision row, a non-zero exit to the Failure Path, then Step 7; both `VERIFY_GAPS` lists titling items `Task {N}`), the **Owner decisions** contract naming the task block), ship `fids plans`, plan `fids design` with files, pre-worktree commit `--root`, one `workflows fail` per Failure Path (error via `--error-file`, no heredoc), design / plan / build / debug keep the record through one `handover --push --worktree="{WORKTREE_PATH}"` skipped without a worktree, and ship `--flush`, build and debug gate logs written by `tests run --artifact` with failures from the engine's count, the committed test log and Step 13 reading it, challenge attempt via `--attempt-of`, PR URL in `artifacts`, the exit 5 / 6 re-ask Finish line and no `steps verdict`, the four `status route --require=strategy` sites, each holding `repeatTests` and passing `Repeat tests` to its agent, with the gaps-remediate and failure-diagnose prompts applying `PIVOT` and `FINAL` to `Repeat tests` only, auto's single `runs context`, a fresh `context diff` file written right before each agent that reads the diff, debug Step 1 decided by one `status route --prompt-file`, ship `runs gate --squash-of` / `branches sync-dev` / skill prune / `runs revalidate` / `prs merge` / `workflows close --flush` removing the worktree then returning to `{REPO_ROOT}`, design / plan close through `promote` → `land` → `links`, Locks lines without a lock-age wait, issue-less runs (no Step 1 STOP on a missing issue, the true-block `fids parse` Route with its exit 3 STOP for a non-slug branch, the `base.ref` = `dev` assert on every MCP merge fallback, every issue-tied call behind `**Skip if** ISSUE_ID empty`, `fids resolve` / `steps gate` carrying `--issue`, kill-switch checks skipped) and debug on `dev` (`{BASE_FLAG}` on every `context diff` and non-marker `branches scan-diff` line, `--base={startSha}` in place on dev and empty otherwise, the no-leak scan taking `{NOLEAK_BASE}` (`--base={startSha}` in place on dev, else `--base=origin/dev`), the build migration scan and the ship `context diff` lines passing `--base=origin/dev`, no push in Steps 9 / 10, the `EXIT_FOREIGN_PATH` stop-and-ask); plan's single review round (two reviewers + scope check), `tests plan-check --existence=refuse` after every plan-writing step, no workflow naming a removed plan flag; build Branch Sync merging its docs, Plan Convert checking the plan, converting one with no task markers and checking again, Step 7 taking the next group's brief, Step 8 verifying the group's own diff; build Step 10 routing a red holistic gate to the holistic fix round with a `Holistic gate` Context line, a holistic pause with a red gate asking the loop question and never routing `continue`, the Decision Pause reading the holistic gate log for the base check, and no `cleanBase` or `HOLISTIC_BASE`; build Step 11 running `challenge gate` before the reviewers; build publish ending (`publish` resolved through `status route`, re-derived on resume, the non-LOCAL coercion warning, a held close skipping push / PR / CI and appending the held roadmap row, the `publish=true` close path kept, Gate 15 conditional, only the close gate on the held path, no push on a held or pre-publish Failure Path and Decision Pause). |
