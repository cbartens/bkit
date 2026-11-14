diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 2731f1831..ae1d56d06 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1686,7 +1686,12 @@ describe(".husky/pre-push PR conflict", () => {
 
   const push = (
     hook: string,
-    opts: { branch?: string; pathEnv?: string; env?: Record<string, string> } = {},
+    opts: {
+      branch?: string;
+      pathEnv?: string;
+      env?: Record<string, string>;
+      args?: string[];
+    } = {},
   ) => {
     const branch = opts.branch ?? "feat/1-x";
     fs.rmSync(path.join(tmp, "pnpm.log"), { force: true });
@@ -1700,7 +1705,7 @@ describe(".husky/pre-push PR conflict", () => {
       ...opts.env,
     };
     for (const key of Object.keys(env)) if (key.startsWith("GIT_")) delete env[key];
-    const r = spawnSync("sh", [path.join(REPO, hook)], {
+    const r = spawnSync("sh", [path.join(REPO, hook), ...(opts.args ?? [])], {
       cwd: work,
       input: `refs/heads/${branch} ${sha} refs/heads/${branch} ${ZERO}\n`,
       encoding: "utf-8",
@@ -1962,4 +1967,106 @@ describe(".husky/pre-push PR conflict", () => {
       expect(r.gated, hook).toBe(true);
     }
   });
+
+  it("fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard", () => {
+    setup(false);
+    fs.writeFileSync(
+      path.join(tmp, "bin", "pnpm"),
+      [
+        "#!/bin/sh",
+        `echo "$*" >> "${tmp}/pnpm.log"`,
+        'case "$*" in *skip-token*) exit 0 ;; esac',
+        'case "$*" in *bookkeeping-push*) exit 1 ;; esac',
+        "exit 0",
+        "",
+      ].join("\n"),
+      { mode: 0o755 },
+    );
+    fs.writeFileSync(
+      path.join(tmp, "bin", "gh"),
+      [
+        "#!/bin/sh",
+        `echo "$*" >> "${tmp}/gh.log"`,
+        'while [ $# -gt 0 ]; do case "$1" in --jq) shift; F="$1" ;; esac; shift; done',
+        `echo '[{"number":7,"baseRefName":"dev","isCrossRepository":true,"headRepositoryOwner":{"login":"contrib"},"headRepository":{"name":"repo"}}]' | jq -r "$F"`,
+        "",
+      ].join("\n"),
+      { mode: 0o755 },
+    );
+    for (const hook of HOOKS) {
+      const r = push(hook, { args: ["origin", "https://github.com/contrib/repo.git"] });
+      expect(r.status, hook).toBe(1);
+      expect(r.stderr, hook).toContain("BLOCKED");
+      expect(r.stderr, hook).toContain("PR #7 is open");
+      expect(r.gated, hook).toBe(false);
+    }
+  });
+
+  it("full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR", () => {
+    setup(false);
+    fs.writeFileSync(
+      path.join(tmp, "bin", "pnpm"),
+      [
+        "#!/bin/sh",
+        `echo "$*" >> "${tmp}/pnpm.log"`,
+        'case "$*" in *skip-token*) exit 0 ;; esac',
+        'case "$*" in *bookkeeping-push*) exit 1 ;; esac',
+        "exit 0",
+        "",
+      ].join("\n"),
+      { mode: 0o755 },
+    );
+    fs.writeFileSync(
+      path.join(tmp, "bin", "gh"),
+      [
+        "#!/bin/sh",
+        `echo "$*" >> "${tmp}/gh.log"`,
+        'while [ $# -gt 0 ]; do case "$1" in --jq) shift; F="$1" ;; esac; shift; done',
+        `jq -n '[range(1000)|{number:(100+.),baseRefName:"other",isCrossRepository:true,headRepositoryOwner:{login:"evil"},headRepository:{name:"repo"}}]' | jq -r "$F"`,
+        "",
+      ].join("\n"),
+      { mode: 0o755 },
+    );
+    for (const hook of HOOKS) {
+      const r = push(hook, { args: ["origin", "https://github.com/owner/repo.git"] });
+      expect(r.status, hook).toBe(1);
+      expect(r.stderr, hook).toContain("BLOCKED");
+      expect(r.stderr, hook).toContain("1000 open PRs");
+      expect(r.gated, hook).toBe(false);
+    }
+  });
+
+  it("fork PRs past gh's page limit → same-repo PR still found, conflict blocked", () => {
+    setup(true);
+    installPnpm(false);
+    // Stub gh emulates GitHub: 30 newer fork PRs plus the same-repo PR 7. `pr list` applies the
+    // hook's --jq to the first --limit entries only; `api` with head=<owner>: returns the same-repo PR.
+    fs.writeFileSync(
+      path.join(tmp, "bin", "gh"),
+      [
+        "#!/bin/sh",
+        `echo "$*" >> "${tmp}/gh.log"`,
+        'MODE="$1"; L=30; F=""; HEADQ=""',
+        'for a in "$@"; do case "$a" in *head=*:*) HEADQ=1 ;; esac; done',
+        'while [ $# -gt 0 ]; do case "$1" in --jq) shift; F="$1" ;; --limit|-L) shift; L="$1" ;; esac; shift; done',
+        `SAME='{"number":7,"baseRefName":"dev","isCrossRepository":false,"headRepositoryOwner":{"login":"owner"},"headRepository":{"name":"repo"},"base":{"ref":"dev"},"head":{"repo":{"full_name":"owner/repo","name":"repo","owner":{"login":"owner"}}}}'`,
+        'if [ "$MODE" = "api" ]; then',
+        '  if [ -n "$HEADQ" ]; then echo "[$SAME]" | jq -r "${F:-.}"; else echo "[]" | jq -r "${F:-.}"; fi',
+        "  exit 0",
+        "fi",
+        `FORK='{"baseRefName":"other","isCrossRepository":true,"headRepositoryOwner":{"login":"evil"},"headRepository":{"name":"repo"},"base":{"ref":"other"},"head":{"repo":{"full_name":"evil/repo","name":"repo","owner":{"login":"evil"}}}}'`,
+        `jq -n --argjson fork "$FORK" --argjson same "$SAME" --argjson l "$L" '([range(30)|$fork + {number:(100+.)}] + [$same])[0:$l]' | jq -r "$F"`,
+        "",
+      ].join("\n"),
+      { mode: 0o755 },
+    );
+    for (const hook of HOOKS) {
+      const r = push(hook, { args: ["origin", "https://github.com/owner/repo.git"] });
+      expect(r.status, hook).toBe(1);
+      expect(r.stderr, hook).toContain("BLOCKED");
+      expect(r.stderr, hook).toContain("f.txt");
+      expect(r.gated, hook).toBe(false);
+      expect(r.checked, hook).toBe(false);
+    }
+  });
 });
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index 59eebd9b9..91aacdadf 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -139,13 +139,28 @@ esac
 OPEN_PR=""
 PR_BASE=""
 PR_LOOKUP=""
+PR_LOOKUP_FULL=0
 case "$BRANCH" in
   dev|main|"") ;;
   *)
     if command -v gh >/dev/null 2>&1; then
       # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
-      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName,isCrossRepository --jq 'map(select(.isCrossRepository | not)) | .[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
-        PR_LOOKUP=ok
+      # push target owner/name from the URL in $2: a PR from that repo counts even when gh reports it cross-repository (a fork checkout)
+      PR_TARGET=${2%.git}
+      PR_TARGET_NAME=${PR_TARGET##*/}
+      PR_TARGET_OWNER=${PR_TARGET%/*}
+      PR_TARGET_OWNER=${PR_TARGET_OWNER##*[/:]}
+      case "$PR_TARGET_OWNER$PR_TARGET_NAME" in *[!A-Za-z0-9._-]*|"") PR_TARGET_OWNER=""; PR_TARGET_NAME="" ;; esac
+      # --limit 1000: fork PRs sharing the head name must not push the same-repo PR off the page; a full page with no match is an unknown, not "no PR"
+      PR_JQ='map(select((.isCrossRepository | not) or (.headRepositoryOwner.login == "'"$PR_TARGET_OWNER"'" and .headRepository.name == "'"$PR_TARGET_NAME"'"))) as $m | if ($m | length) > 0 then "\($m[0].number) \($m[0].baseRefName)" elif length >= 1000 then "FULL" else empty end'
+      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --limit 1000 --json number,baseRefName,isCrossRepository,headRepositoryOwner,headRepository --jq "$PR_JQ" < /dev/null 2>/dev/null); then
+        if [ "$PR_INFO" = "FULL" ]; then
+          PR_LOOKUP="1000 open PRs share this head branch name and none is from this repo"
+          PR_LOOKUP_FULL=1
+          PR_INFO=""
+        else
+          PR_LOOKUP=ok
+        fi
         OPEN_PR=${PR_INFO%% *}
         case "$PR_INFO" in *" "*) PR_BASE=${PR_INFO#* } ;; esac
       else
@@ -183,6 +198,10 @@ case "$BRANCH" in
             echo "[pre-push] Add a clean trigger commit and re-push:  git commit --allow-empty -m \"chore: trigger CI\" && git push" >&2
             exit 1
           fi
+        elif [ "$PR_LOOKUP_FULL" = "1" ]; then
+          echo "[pre-push] BLOCKED: HEAD on '$BRANCH' carries a CI-suppressing token and $PR_LOOKUP — an open PR for this branch cannot be ruled out." >&2
+          echo "[pre-push] Add a clean trigger commit and re-push:  git commit --allow-empty -m \"chore: trigger CI\" && git push" >&2
+          exit 1
         fi
       else
         echo "[pre-push] WARN: HEAD on '$BRANCH' carries a CI-suppressing token but gh is unavailable to check for an open PR; allowing. If a PR is open, ensure HEAD triggers CI." >&2
diff --git a/.husky/pre-push b/.husky/pre-push
index 66c81c2e6..af4010b91 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -196,13 +196,28 @@ esac
 OPEN_PR=""
 PR_BASE=""
 PR_LOOKUP=""
+PR_LOOKUP_FULL=0
 case "$BRANCH" in
   dev|main|"") ;;
   *)
     if command -v gh >/dev/null 2>&1; then
       # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
-      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName,isCrossRepository --jq 'map(select(.isCrossRepository | not)) | .[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
-        PR_LOOKUP=ok
+      # push target owner/name from the URL in $2: a PR from that repo counts even when gh reports it cross-repository (a fork checkout)
+      PR_TARGET=${2%.git}
+      PR_TARGET_NAME=${PR_TARGET##*/}
+      PR_TARGET_OWNER=${PR_TARGET%/*}
+      PR_TARGET_OWNER=${PR_TARGET_OWNER##*[/:]}
+      case "$PR_TARGET_OWNER$PR_TARGET_NAME" in *[!A-Za-z0-9._-]*|"") PR_TARGET_OWNER=""; PR_TARGET_NAME="" ;; esac
+      # --limit 1000: fork PRs sharing the head name must not push the same-repo PR off the page; a full page with no match is an unknown, not "no PR"
+      PR_JQ='map(select((.isCrossRepository | not) or (.headRepositoryOwner.login == "'"$PR_TARGET_OWNER"'" and .headRepository.name == "'"$PR_TARGET_NAME"'"))) as $m | if ($m | length) > 0 then "\($m[0].number) \($m[0].baseRefName)" elif length >= 1000 then "FULL" else empty end'
+      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --limit 1000 --json number,baseRefName,isCrossRepository,headRepositoryOwner,headRepository --jq "$PR_JQ" < /dev/null 2>/dev/null); then
+        if [ "$PR_INFO" = "FULL" ]; then
+          PR_LOOKUP="1000 open PRs share this head branch name and none is from this repo"
+          PR_LOOKUP_FULL=1
+          PR_INFO=""
+        else
+          PR_LOOKUP=ok
+        fi
         OPEN_PR=${PR_INFO%% *}
         case "$PR_INFO" in *" "*) PR_BASE=${PR_INFO#* } ;; esac
       else
@@ -240,6 +255,10 @@ case "$BRANCH" in
             echo "[pre-push] Add a clean trigger commit and re-push:  git commit --allow-empty -m \"chore: trigger CI\" && git push" >&2
             exit 1
           fi
+        elif [ "$PR_LOOKUP_FULL" = "1" ]; then
+          echo "[pre-push] BLOCKED: HEAD on '$BRANCH' carries a CI-suppressing token and $PR_LOOKUP — an open PR for this branch cannot be ruled out." >&2
+          echo "[pre-push] Add a clean trigger commit and re-push:  git commit --allow-empty -m \"chore: trigger CI\" && git push" >&2
+          exit 1
         fi
       else
         echo "[pre-push] WARN: HEAD on '$BRANCH' carries a CI-suppressing token but gh is unavailable to check for an open PR; allowing. If a PR is open, ensure HEAD triggers CI." >&2
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index db21f5a6b..7384d1da7 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -361,3 +361,7 @@
 {"schema":3,"ts":1794617614037,"firstTs":1794617614037,"updates":1,"kind":"deferral","key":"887-bkit-own-docs-starter-rules","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["887",".bkit/core/.bkit/authoring.md","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"Starter-scoped § Docs rules (Not here, Update when and the fill rules) in bkit's own .agents/**, .bkit/*.md and docs/*.md files","description":"The new § Docs rules other than the Mermaid rule apply to the starters in .bkit/templates/docs/*.md. Bringing bkit's own docs' rules boxes and values in line with them, with tests, is a follow-up issue; the plan's Out of Scope row declares it.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794644038957,"firstTs":1794644038957,"updates":1,"kind":"deferral","key":"923-pre-push-block-challenge-low-bkit-core-engine-audits-templates-husky-pre-push-integration-test-ts-466","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["923-pre-push-block"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"On a machine or CI runner without `jq`, the stub `gh` in `fork PR with the same head branch name → ignored, gates run` exits 127 with no output; the hook reads that as a failed lookup, warns and runs the gates, so the test passes whatever the hook's fork filter does","description":"LOW build challenge finding at .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:466: On a machine or CI runner without `jq`, the stub `gh` in `fork PR with the same head branch name → ignored, gates run` exits 127 with no output; the hook reads that as a failed lookup, warns and runs the gates, so the test passes whatever the hook's fork filter does. Done when: The fork-PR test proves the lookup itself succeeded: it asserts `r.stderr` holds no `gh pr list failed`, and either skips with a named reason when `command -v jq` finds nothing or uses a stub `gh` that does not need `jq` (for example one that prints the filtered answer for the fixed input). A hook whose filter keeps the fork PR then fails the test on every machine.","source":".bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:466"}
 {"schema":3,"ts":1794644038960,"firstTs":1794644038960,"updates":1,"kind":"deferral","key":"923-pre-push-block-challenge-low-bkit-templates-husky-pre-push-248","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["923-pre-push-block"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A collaborator creates a base branch named `base;id` (a valid ref name), retargets the PR to it, and the hook's BLOCKED Fix line prints `git fetch origin base;id && git merge origin/base;id`, which an agent pasting the printed fix runs as `id`","description":"LOW build challenge finding at .bkit/templates/.husky/pre-push:248: A collaborator creates a base branch named `base;id` (a valid ref name), retargets the PR to it, and the hook's BLOCKED Fix line prints `git fetch origin base;id && git merge origin/base;id`, which an agent pasting the printed fix runs as `id`. Done when: both hook copies (`.bkit/templates/.husky/pre-push:232` and `.husky/pre-push:289`) check `PR_BASE` before the fetch: `git check-ref-format --branch \"$PR_BASE\"` passes and the name matches `^[A-Za-z0-9._/][A-Za-z0-9._/-]*$`; a base that fails prints `[pre-push] WARN: PR conflict check skipped — ...` and skips the fetch and the trial merge; the Fix line (`.bkit/templates/.husky/pre-push:248`, `.husky/pre-push:305`) prints only a base that passed the check","source":".bkit/templates/.husky/pre-push:248"}
+{"schema":3,"ts":1794661530930,"firstTs":1794661530930,"updates":1,"kind":"deferral","key":"923-pre-push-block-challenge-low-bkit-core-workflows-bkit-plan-md-480","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["923-pre-push-block"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`/bkit-plan` or `/bkit-design` re-runs on a feature branch that already has an open PR, and `dev` has gained a row in a `merge=union` ledger that the branch also appended to; the summary push is BLOCKED by the PR conflict check, the run takes the Failure Path, and the handover never pushes onto a branch with an open PR, so the summary commits exist only in the local worktree","description":"LOW build challenge finding at .bkit/core/workflows/bkit-plan.md:480: `/bkit-plan` or `/bkit-design` re-runs on a feature branch that already has an open PR, and `dev` has gained a row in a `merge=union` ledger that the branch also appended to; the summary push is BLOCKED by the PR conflict check, the run takes the Failure Path, and the handover never pushes onto a branch with an open PR, so the summary commits exist only in the local worktree. Done when: The feature-branch summary pushes in `.bkit/core/workflows/bkit-plan.md:480` and `.bkit/core/workflows/bkit-design.md:534` start with `BKIT_PR_CONFLICT_CHECK=false`, the same as the debug pushes of plan Task 11. The owner's answer at decision pause 1 (`build-decision-2-1.md`) was \"fix all with flag that require it\", and these pushes carry only bookkeeping, so blocking them fixes nothing: the PR already conflicts, and `/bkit-ship` Step 4 merges `dev` in. `.bkit/core/.bkit/templates.md` § Git hooks — Husky (the switch bullet, line 329) names plan and design next to debug, `bkit install` regenerates `.bkit/templates.md`, and the rendered snapshots `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt` and `bkit-design.none.txt` plus the host mirrors match the workflows. Neither workflow probes for an open PR before this push, and their shared handover (`.bkit/core/workflows/bkit-plan.md:106`) already handles an open PR on `{BRANCH}`, so this path is reachable.","source":".bkit/core/workflows/bkit-plan.md:480"}
+{"schema":3,"ts":1794661530932,"firstTs":1794661530932,"updates":1,"kind":"deferral","key":"923-pre-push-block-challenge-low-bkit-templates-husky-pre-push-239","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["923-pre-push-block"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"In a repo with submodules, the base fetch follows git's default `fetch.recurseSubmodules=on-demand` and also fetches every submodule whose pointer the new base commits move; a slow or unreachable submodule remote stalls the push before the gates or fails the fetch, so the check is skipped with `could not fetch '<base>' from origin` although the base itself was fetched","description":"LOW build challenge finding at .bkit/templates/.husky/pre-push:239: In a repo with submodules, the base fetch follows git's default `fetch.recurseSubmodules=on-demand` and also fetches every submodule whose pointer the new base commits move; a slow or unreachable submodule remote stalls the push before the gates or fails the fetch, so the check is skipped with `could not fetch '<base>' from origin` although the base itself was fetched. Done when: The base fetch in both hook copies (`.bkit/templates/.husky/pre-push:239`, `.husky/pre-push:296`) passes `--no-recurse-submodules`. The trial merge reads only the superproject's trees and gitlink entries, never submodule objects, so a base commit that moves a submodule pointer to a commit on an unreachable submodule remote still gets a conflict verdict. Verified by hand on git 2.56.0 in the scratchpad: with a populated submodule, a `dev` commit on `origin` that moves its pointer, and the submodule remote removed, the hook's exact fetch line exits 1 (`Errors during submodule fetch: sub`) although `refs/remotes/origin/dev` was updated to the new tip; the same fetch with `--no-recurse-submodules` exits 0.","source":".bkit/templates/.husky/pre-push:239"}
+{"schema":3,"ts":1794661530933,"firstTs":1794661530933,"updates":1,"kind":"deferral","key":"923-pre-push-block-challenge-low-bkit-templates-husky-pre-push-149","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["923-pre-push-block"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch has two open same-repo PRs, one to `main` that merges cleanly and an older one to `dev` that conflicts; the lookup keeps only `.[0]`, the newest PR, so the hook trial-merges against `main`, lets the push through, and the `dev` PR's CI never starts","description":"LOW build challenge finding at .bkit/templates/.husky/pre-push:149: A branch has two open same-repo PRs, one to `main` that merges cleanly and an older one to `dev` that conflicts; the lookup keeps only `.[0]`, the newest PR, so the hook trial-merges against `main`, lets the push through, and the `dev` PR's CI never starts. Done when: The lookup in both hook copies (`.bkit/templates/.husky/pre-push:147-150`, `.husky/pre-push:204-207`) keeps every same-repo open PR on the branch, one `<number> <base>` line each, and the `PR conflict` block trial-merges the pushed commit against each base in turn; any conflict blocks and names that PR's number and base, and a fetch or `git merge-tree` failure for one base warns for that base only. The CI-suppressor guard still blocks when any of those PRs is open. GitHub allows several open PRs from one head branch to different bases, and `gh pr list` returns them newest first.","source":".bkit/templates/.husky/pre-push:149"}
+{"schema":3,"ts":1794661530934,"firstTs":1794661530934,"updates":1,"kind":"deferral","key":"923-pre-push-block-challenge-low-bkit-templates-husky-pre-push-250","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["923-pre-push-block"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A collaborator renames a file the victim's branch edits to a name holding a terminal escape sequence (for example `x<ESC>[2Jy.txt`) on the PR's base; git prints the conflicting path quoted as `\"x\\033[2Jy.txt\"`, but the hook's `echo \"$PR_MERGE_OUT\"` under `sh` (macOS bash 3.2 in POSIX mode, Debian / Ubuntu dash) turns `\\033` back into a raw ESC byte, so the pusher's terminal runs the sequence","description":"LOW build challenge finding at .bkit/templates/.husky/pre-push:250: A collaborator renames a file the victim's branch edits to a name holding a terminal escape sequence (for example `x<ESC>[2Jy.txt`) on the PR's base; git prints the conflicting path quoted as `\"x\\033[2Jy.txt\"`, but the hook's `echo \"$PR_MERGE_OUT\"` under `sh` (macOS bash 3.2 in POSIX mode, Debian / Ubuntu dash) turns `\\033` back into a raw ESC byte, so the pusher's terminal runs the sequence. Done when: both hook copies (`.bkit/templates/.husky/pre-push:250` and `.husky/pre-push:307`) print the conflicting files with `printf '%s\\n' \"$PR_MERGE_OUT\"` (or another form that interprets no backslash escapes) instead of `echo`, so each path reaches stderr exactly as git quoted it; verified by hand on macOS `/bin/sh` (GNU bash 3.2.57): a rename-plus-edit conflict made `git merge-tree --name-only` print `\"x\\033[2Jy.txt\"`, and the hook's exact `echo ... | sed ...` line wrote byte 033 to stderr","source":".bkit/templates/.husky/pre-push:250"}
