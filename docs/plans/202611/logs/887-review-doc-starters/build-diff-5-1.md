diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d21b9a0e4..d7a2ab6ab 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1295,7 +1295,7 @@ Confirm both before running phase closes from a cloud agent session.
 - **Path A** (`dev` has not moved) resumes read-only: no merge, no bookkeeping commits, no push. Then it merges.
 - **Path B** (`dev` moved) merges `origin/dev` into the feature branch locally with `bkit branches sync --merge`, pushes it plain, and re-validates the merged head. The block commits the run's uncommitted work first, unions the append-only ledgers, takes a conflicted lockfile from `dev` before regenerating it, takes a conflicted generated register (`docs/capabilities.md`) from `dev` before rebuilding it, with `dev`'s copy of the generated block in a doc the register's script copies that block into, and merges a conflicted install record (`.bkit/version`) entry by entry, with `dev`'s value where both sides changed an entry; a conflict outside those goes to `@bkit-ship-conflict-resolve`, which hand-resolves it and re-runs the block. A server-side update-branch is never used, because GitHub ignores `merge=union` and reports a ledger-only divergence as a conflict.
 
-Both paths end at the same gate: `bkit runs gate --head=<current> --fresh-base` exits 0 (capstone concluded `success`) at the current PR head. `--fresh-base` also requires a freshly fetched `dev` to be an ancestor of the validated code head, before any override or bookkeeping carry-forward. Stale `dev` exits 19 and returns to the Step 4 integration; missing or mismatched base evidence exits 20. Merge refusals are classified by `bkit prs merge --ship-retry` from an independent reread: a moved head returns to validation, a new conflict with `dev` returns to integration, and any other refusal stops with its reason. All of these consume the same `bkit.workflows.ship.merge.maxAttempts` allowance. The merge API does not pin the base SHA, so a `dev` update between the final read and the merge remains a residual race; the post-merge capstone check reports it. Exit codes: `docs/observability.md` § `[bkit-runs]` prefix — ship merge gate.
+Both paths end at the same gate: `bkit runs gate --head=<current> --fresh-base` exits 0 (capstone concluded `success`) at the current PR head. `--fresh-base` also requires a freshly fetched `dev` to be an ancestor of the validated code head, before any override or bookkeeping carry-forward. Stale `dev` exits 19 and returns to the Step 4 integration; missing or mismatched base evidence exits 20. Merge refusals are classified by `bkit prs merge --ship-retry` from an independent reread: a moved head returns to validation, a new conflict with `dev` returns to integration, and any other refusal stops with its reason. All of these consume the same `bkit.workflows.ship.merge.maxAttempts` allowance. The merge API does not pin the base SHA, so a `dev` update between the final read and the merge remains a residual race; the post-merge capstone check reports it. Exit codes: `bkit runs gate --help`.
 
 ### Consumer CI contract — `pull_request` resolves to `run_level=full`
 
diff --git a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
index d9a34ed12..bb8c376b7 100644
--- a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
+++ b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
@@ -422,3 +422,91 @@ describe("documentation warning contracts", () => {
     expect(managedStarterProblems()).toEqual([]);
   });
 });
+
+// ---------------------------------------------------------------------------
+// Section citations of the project-document starters
+// ---------------------------------------------------------------------------
+
+const STARTER_TOPICS = [...TOPICS, "components", "capabilities"];
+const CITATION_SKIP_DIRS = new Set(["__fixtures__", "dist", "node_modules"]);
+
+/** Every shipped file under `.bkit/core/` and `.bkit/templates/`, relative to the repo root. */
+function shippedFiles(dir: string): string[] {
+  const out: string[] = [];
+  for (const ent of fs.readdirSync(path.join(REPO_ROOT, dir), { withFileTypes: true })) {
+    const rel = path.posix.join(dir, ent.name);
+    if (ent.isDirectory()) {
+      if (!CITATION_SKIP_DIRS.has(ent.name)) out.push(...shippedFiles(rel));
+    } else if (ent.isFile() && !ent.name.endsWith(".test.ts")) out.push(rel);
+  }
+  return out;
+}
+
+/** The `##`, `###` and `####` headings of a starter, outside fenced blocks. */
+function starterHeadings(topic: string): string[] {
+  let inFence = false;
+  const out: string[] = [];
+  for (const line of readRepo(`.bkit/templates/docs/${topic}.md`).split("\n")) {
+    if (/^\s*(`{3,})/.test(line)) inFence = !inFence;
+    else if (!inFence) {
+      const m = /^#{2,4}\s+(.+?)\s*$/.exec(line);
+      if (m) {
+        out.push(normaliseCitation(m[1]));
+        const bare = normaliseCitation(m[1].replace(/\s*[([].*$/, ""));
+        if (bare) out.push(bare);
+      }
+    }
+  }
+  return out;
+}
+
+/** Quotes and backticks removed, lower case. */
+function normaliseCitation(text: string): string {
+  return text
+    .replace(/["'`‘’“”]/g, "")
+    .trim()
+    .toLowerCase();
+}
+
+/** A citation resolves when a heading starts the cited text, or the cited text's first clause starts a heading. */
+function resolvesToHeading(cited: string, headings: string[]): boolean {
+  const full = normaliseCitation(cited);
+  const clause = full.split(/[\]),;:.]/)[0].trim();
+  return headings.some((h) => full.startsWith(h) || (clause.length > 0 && h.startsWith(clause)));
+}
+
+const CITATION = new RegExp(
+  `(?<![\\w-])(?:docs/)?(${STARTER_TOPICS.join("|")})\\.md[\`\\]]?\\s*§\\s*([^\\n]+)`,
+  "g",
+);
+
+/** `file:line` of every citation that matches no starter heading. */
+function unresolvedCitations(): string[] {
+  const headingsByTopic = new Map(STARTER_TOPICS.map((t) => [t, starterHeadings(t)]));
+  const problems: string[] = [];
+  const files = [...shippedFiles(".bkit/core"), ...shippedFiles(".bkit/templates")];
+  for (const rel of files) {
+    const raw = fs.readFileSync(path.join(REPO_ROOT, rel));
+    if (raw.includes(0)) continue;
+    raw
+      .toString("utf-8")
+      .split("\n")
+      .forEach((line, i) => {
+        for (const m of line.matchAll(CITATION)) {
+          const cited = m[2].trim();
+          if (cited.startsWith("{")) continue;
+          if (!resolvesToHeading(cited, headingsByTopic.get(m[1]) ?? []))
+            problems.push(`${rel}:${i + 1}: ${m[1]}.md § ${cited.slice(0, 80)}`);
+        }
+      });
+  }
+  return problems;
+}
+
+describe("starter section citations", () => {
+  it("every shipped docs/{topic}.md § citation resolves to a starter heading", () => {
+    expect(shippedFiles(".bkit/templates").length).toBeGreaterThan(20);
+    expect(starterHeadings("testing").length).toBeGreaterThan(3);
+    expect(unresolvedCitations()).toEqual([]);
+  });
+});
diff --git a/.bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml b/.bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
index 1dcf4a030..49e7e60bf 100644
--- a/.bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
+++ b/.bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
@@ -52,5 +52,5 @@ body:
       description: Related issues with their titles, earlier attempts, docs paths, and ledger rows by `key`. Nothing fetches these, so write exact paths and keys that agents can search for.
       placeholder: |
         Related: #<number> — <its title>
-        Docs: docs/architecture.md § Sync
+        Docs: docs/architecture.md § Containers
         Ledger: docs/decisions.jsonl key `offline-first-sync`
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index 1b8e8c3db..723a7e5fa 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -55,7 +55,7 @@ fi
 
 # The bkit tooling keys are unset for the gate: its tests, lint plugins and dependency code never
 # need them, and their output lands in the agent-readable log. Two sources: the fixed list
-# (docs/security.md § `.bkit/.env` scope), whichever path loaded them (cloud dashboard env, an app
+# (.bkit/templates.md § Git hooks — Husky), whichever path loaded them (cloud dashboard env, an app
 # env file, ~/.zshrc, launchd), and every key `.bkit/.env` names, in direnv's dotenv grammar
 # (`KEY=v`, `KEY = v`, `KEY: v`, optional `export `).
 for gate_key in BKIT_GH_TOKEN BKIT_LINEAR_API_KEY BKIT_JIRA_API_KEY BKIT_ANTHROPIC_API_KEY \
diff --git a/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py b/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py
index e1de5ac7b..54b2c3469 100644
--- a/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py
+++ b/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py
@@ -11,7 +11,7 @@ OWN interpreter — it imports graphify itself.
     bkit-graphify-graphml.py <graph.json> <out.graphml>
 
 The graphify CLI has no --graphml flag (only the /graphify skill has one, which
-this repo does not install; see docs/setup.md § Code Graph, "Never run"), so this
+this repo does not install; see .bkit/templates.md § graphify — map), so this
 calls to_graphml() directly. Community IDs are carried through so Gephi can
 partition on them.
 """
diff --git a/.bkit/version b/.bkit/version
index 28736d4e3..dc97dfc51 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -214,7 +214,7 @@
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
     ".bkit/prompts.md": "40c140b8c9d4e6d3ee91b8d106cbe78d1bff751343c4341668064decd0f4eb1e",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "6f0c596eb9878a4cdb8ee0b47af44524aa24bb1ba614173011ed5bd5ececf8dc",
+    ".bkit/workflows.md": "34b11a414b36c0a11a9991db7171aa080f6e47e0fe7cf84f30fb4c20865455bc",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "c49a6b4aa6289f9eacf5cda6fced12a9811a244bd50948c2ef5cdb2741ea848f",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 2aae23e0b..73ae6850a 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1295,7 +1295,7 @@ Confirm both before running phase closes from a cloud agent session.
 - **Path A** (`dev` has not moved) resumes read-only: no merge, no bookkeeping commits, no push. Then it merges.
 - **Path B** (`dev` moved) merges `origin/dev` into the feature branch locally with `bkit branches sync --merge`, pushes it plain, and re-validates the merged head. The block commits the run's uncommitted work first, unions the append-only ledgers, takes a conflicted lockfile from `dev` before regenerating it, takes a conflicted generated register (`docs/capabilities.md`) from `dev` before rebuilding it, with `dev`'s copy of the generated block in a doc the register's script copies that block into, and merges a conflicted install record (`.bkit/version`) entry by entry, with `dev`'s value where both sides changed an entry; a conflict outside those goes to `@bkit-ship-conflict-resolve`, which hand-resolves it and re-runs the block. A server-side update-branch is never used, because GitHub ignores `merge=union` and reports a ledger-only divergence as a conflict.
 
-Both paths end at the same gate: `bkit runs gate --head=<current> --fresh-base` exits 0 (capstone concluded `success`) at the current PR head. `--fresh-base` also requires a freshly fetched `dev` to be an ancestor of the validated code head, before any override or bookkeeping carry-forward. Stale `dev` exits 19 and returns to the Step 4 integration; missing or mismatched base evidence exits 20. Merge refusals are classified by `bkit prs merge --ship-retry` from an independent reread: a moved head returns to validation, a new conflict with `dev` returns to integration, and any other refusal stops with its reason. All of these consume the same `bkit.workflows.ship.merge.maxAttempts` allowance. The merge API does not pin the base SHA, so a `dev` update between the final read and the merge remains a residual race; the post-merge capstone check reports it. Exit codes: `docs/observability.md` § `[bkit-runs]` prefix — ship merge gate.
+Both paths end at the same gate: `bkit runs gate --head=<current> --fresh-base` exits 0 (capstone concluded `success`) at the current PR head. `--fresh-base` also requires a freshly fetched `dev` to be an ancestor of the validated code head, before any override or bookkeeping carry-forward. Stale `dev` exits 19 and returns to the Step 4 integration; missing or mismatched base evidence exits 20. Merge refusals are classified by `bkit prs merge --ship-retry` from an independent reread: a moved head returns to validation, a new conflict with `dev` returns to integration, and any other refusal stops with its reason. All of these consume the same `bkit.workflows.ship.merge.maxAttempts` allowance. The merge API does not pin the base SHA, so a `dev` update between the final read and the merge remains a residual race; the post-merge capstone check reports it. Exit codes: `bkit runs gate --help`.
 
 ### Consumer CI contract — `pull_request` resolves to `run_level=full`
 
diff --git a/.github/ISSUE_TEMPLATE/bkit-idea.yml b/.github/ISSUE_TEMPLATE/bkit-idea.yml
index 1dcf4a030..49e7e60bf 100644
--- a/.github/ISSUE_TEMPLATE/bkit-idea.yml
+++ b/.github/ISSUE_TEMPLATE/bkit-idea.yml
@@ -52,5 +52,5 @@ body:
       description: Related issues with their titles, earlier attempts, docs paths, and ledger rows by `key`. Nothing fetches these, so write exact paths and keys that agents can search for.
       placeholder: |
         Related: #<number> — <its title>
-        Docs: docs/architecture.md § Sync
+        Docs: docs/architecture.md § Containers
         Ledger: docs/decisions.jsonl key `offline-first-sync`
diff --git a/.husky/pre-push b/.husky/pre-push
index 847c42253..a0e59c5c0 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -55,7 +55,7 @@ fi
 
 # The bkit tooling keys are unset for the gate: its tests, lint plugins and dependency code never
 # need them, and their output lands in the agent-readable log. Two sources: the fixed list
-# (docs/security.md § `.bkit/.env` scope), whichever path loaded them (cloud dashboard env, an app
+# (.bkit/templates.md § Git hooks — Husky), whichever path loaded them (cloud dashboard env, an app
 # env file, ~/.zshrc, launchd), and every key `.bkit/.env` names, in direnv's dotenv grammar
 # (`KEY=v`, `KEY = v`, `KEY: v`, optional `export `).
 for gate_key in BKIT_GH_TOKEN BKIT_LINEAR_API_KEY BKIT_JIRA_API_KEY BKIT_ANTHROPIC_API_KEY \
diff --git a/scripts/graphify/bkit-graphify-graphml.py b/scripts/graphify/bkit-graphify-graphml.py
index e1de5ac7b..54b2c3469 100644
--- a/scripts/graphify/bkit-graphify-graphml.py
+++ b/scripts/graphify/bkit-graphify-graphml.py
@@ -11,7 +11,7 @@ OWN interpreter — it imports graphify itself.
     bkit-graphify-graphml.py <graph.json> <out.graphml>
 
 The graphify CLI has no --graphml flag (only the /graphify skill has one, which
-this repo does not install; see docs/setup.md § Code Graph, "Never run"), so this
+this repo does not install; see .bkit/templates.md § graphify — map), so this
 calls to_graphml() directly. Community IDs are carried through so Gephi can
 partition on them.
 """
