diff --git a/.bkit/cli.md b/.bkit/cli.md
index 0878b0123..86a6a1e80 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -26,7 +26,7 @@ Mechanical step work runs as `bkit <noun> <verb> --flag=value` (also `--flag val
 | Exit `3`-`79` | Command-specific; listed in that verb's `--help`. |
 | Exit `80` / `81` / `82` | Do it via MCP (`runtimeGithubCli=false`) / hand the wait back to the agent turn loop / needs a human. |
 | Month | `YYYYMM` in UTC. |
-| `status.jsonl` | design / plan / build / debug: `.worktrees/{FID}/` copy when present, else main checkout. ship: current worktree top (`{WORKTREE_PATH}`). |
+| `status.jsonl` | design / plan / build / debug: `.worktrees/{FID}/` copy when present, else the copy in a worktree the host made (the session's linked worktree holding the run), else main checkout. ship: current worktree top (`{WORKTREE_PATH}`). |
 
 **Invocation:** Step 1's first block runs `repo info` through the lookup expression
 
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 2aeea5874..4a0f31ba2 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -26,7 +26,7 @@ Mechanical step work runs as `bkit <noun> <verb> --flag=value` (also `--flag val
 | Exit `3`-`79` | Command-specific; listed in that verb's `--help`. |
 | Exit `80` / `81` / `82` | Do it via MCP (`runtimeGithubCli=false`) / hand the wait back to the agent turn loop / needs a human. |
 | Month | `YYYYMM` in UTC. |
-| `status.jsonl` | design / plan / build / debug: `.worktrees/{FID}/` copy when present, else main checkout. ship: current worktree top (`{WORKTREE_PATH}`). |
+| `status.jsonl` | design / plan / build / debug: `.worktrees/{FID}/` copy when present, else the copy in a worktree the host made (the session's linked worktree holding the run), else main checkout. ship: current worktree top (`{WORKTREE_PATH}`). |
 
 **Invocation:** Step 1's first block runs `repo info` through the lookup expression
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 43a2cb1c4..fcff6301c 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -210,7 +210,7 @@ Every phase command (`design`, `plan`, `build`, `debug`, `ship`) shares this ske
 
 **Worktree isolation (no Step 1 dev sync gate):** in every phase, Step 1 makes zero commits on `dev` and does not assert that local `dev` is in sync with `origin/dev`. Step 1 only fetches `origin dev` (`bkit repo info --fetch`, which reports `behindDev`). Work happens in `.worktrees/{FID}` on `feat/{FID}`, which Step 2 cuts from, or rebases onto, its base:
 
-- `design` / `plan`: the base is `origin/dev`. Their close lands docs and ledgers only, so it can never land a branch carrying unpushed `dev` work. A resumed branch that carries such work is refused at Step 2 (exit 7).
+- `design` / `plan`: the base is `origin/dev`. Their close lands docs and ledgers only, so it can never land a branch carrying unpushed `dev` work. A resumed or adopted branch that carries such work is refused at Step 2 (exit 7).
 - `build` / `ship`: the base is local `dev` while it is a fast-forward of `origin/dev`. The run narrates the unpushed count, so publish `dev` before the feature PR. The base is `origin/dev` when the two have diverged.
 - `debug`: setup adopts or resumes the existing branch without starting a rebase, preserving the original failed commit for CI evidence ancestry checks. It prepares the worktree's inputs and dependencies, and reports any rebase already in progress for resolution before proceeding.
 
diff --git a/.bkit/version b/.bkit/version
index e50dfff4f..4227bf90e 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "6d2f16924cca415081313eea660f4d67a70f7dc51c377011a2b5fc9593d15f33",
+    ".bkit/workflows.md": "dbee9a50949995f3b83b4a1239e2c344b1e533a2bc9f97f858c837c9e8f7e5ed",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
@@ -251,7 +251,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "af388cd07a23a97499ea17fe31af94df5d55d96e27eacc3dfd66be6318a9f924",
+    ".bkit/cli.md": "24e755862663a423b54d216d482ce58e9eeaf916dcde708c0018eee792261efa",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index af0cfa7a0..4da9b9019 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -210,7 +210,7 @@ Every phase command (`design`, `plan`, `build`, `debug`, `ship`) shares this ske
 
 **Worktree isolation (no Step 1 dev sync gate):** in every phase, Step 1 makes zero commits on `dev` and does not assert that local `dev` is in sync with `origin/dev`. Step 1 only fetches `origin dev` (`bkit repo info --fetch`, which reports `behindDev`). Work happens in `.worktrees/{FID}` on `feat/{FID}`, which Step 2 cuts from, or rebases onto, its base:
 
-- `design` / `plan`: the base is `origin/dev`. Their close lands docs and ledgers only, so it can never land a branch carrying unpushed `dev` work. A resumed branch that carries such work is refused at Step 2 (exit 7).
+- `design` / `plan`: the base is `origin/dev`. Their close lands docs and ledgers only, so it can never land a branch carrying unpushed `dev` work. A resumed or adopted branch that carries such work is refused at Step 2 (exit 7).
 - `build` / `ship`: the base is local `dev` while it is a fast-forward of `origin/dev`. The run narrates the unpushed count, so publish `dev` before the feature PR. The base is `origin/dev` when the two have diverged.
 - `debug`: setup adopts or resumes the existing branch without starting a rebase, preserving the original failed commit for CI evidence ancestry checks. It prepares the worktree's inputs and dependencies, and reports any rebase already in progress for resolution before proceeding.
 
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 5fb09b705..d9ea63fb6 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -525,3 +525,4 @@
 {"schema":3,"ts":1795011322096,"firstTs":1795011322096,"updates":1,"kind":"deferral","key":"1053-upgrade-leaves-stale-challenge-low-bkit-core-engine-install-modules-index-ts-202","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1053-upgrade-leaves-stale"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`","description":"LOW build challenge finding at .bkit/core/engine/install/modules/index.ts:202: A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`. Done when: `listRenderedOutputs` lists only regular files: a mirror entry whose own path is a symlink or not a regular file (`fs.lstatSync(abs).isFile()` false) is left out, while a regular file inside a symlinked host folder (the supported dotfiles `.codex` setup) is still listed; neither the install `postDispatch` (`core.ts:2119`) nor `updateCanonicalHashesAfterUpgrade` (via `upgrade.ts:1050`) reads or records a hash for such a path, so the docs/security.md § Secrets rule that machine-local secret files stay out of `canonicalHashes` holds. Today `listRenderedMirrors` takes every `bkit-*` name in every `RENDERED_MIRRORS` dir on disk, and orphan removal runs only for detected hosts (`hosts.ts` detects by `<host>/agents`), so a `.cursor/commands/` or `.opencode/commands/` entry with no `agents/` sibling survives the run, and `hashFile` / `readFileSync` follow the link.","source":".bkit/core/engine/install/modules/index.ts:202","status":"OPEN"}
 {"schema":3,"ts":1795005854792,"firstTs":1795005854792,"updates":1,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1055-worktree-removal-says"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"OPEN"}
 {"schema":3,"ts":1795059081290,"firstTs":1795005854792,"updates":2,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["1055-worktree-removal-says","1058-cleanup-check-reads"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"CLOSED"}
+{"schema":3,"ts":1795071082209,"firstTs":1794996842922,"updates":2,"kind":"deferral","key":"919-worktree-setup-tries-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1258","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["919-worktree-setup-tries"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Closed by #1050: design, plan and build setup now exit 7 in any main checkout, a git submodule's included","description":"Fixed in #1050 (host-made worktrees, row 1): the main-checkout refusal compares the git dir with the common git dir, so a submodule's main checkout is refused.","source":".bkit/core/engine/commands/workflow/worktrees.ts:1258","status":"CLOSED"}
