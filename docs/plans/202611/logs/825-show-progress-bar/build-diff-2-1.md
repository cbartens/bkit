diff --git a/.agents/plugins/bkit/skills/bkit-auto/SKILL.md b/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
index 13c36f958..65abd0d35 100644
--- a/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
@@ -14,7 +14,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index a81fccfbe..ee233a2fa 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -14,7 +14,7 @@ description: "Build Feature — Autonomous implementation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -328,7 +328,7 @@ description: "Build Feature — Autonomous implementation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=build --step=build-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=build --step=build-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index 9204f9c3c..7df310ff0 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -14,7 +14,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -214,7 +214,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -630,7 +630,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit. `{LIVE_SKIPPED}` = `--field="testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out)."` when `TEST_SCOPE` lacks `live`, else empty:
    ```bash
-   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
+   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none || exit 1
    "{BKIT}" prs transport-row --file="{STATUS}" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
    ```
 4. Set `TRIGGER_PR`:
diff --git a/.agents/plugins/bkit/skills/bkit-design/SKILL.md b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
index 1c2eed4d5..125432fe2 100644
--- a/.agents/plugins/bkit/skills/bkit-design/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
@@ -14,7 +14,7 @@ description: "Design Feature — Autonomous design phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -124,7 +124,7 @@ description: "Design Feature — Autonomous design phase"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=design --step=design-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=design --step=design-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
index b388b35f4..63069eb23 100644
--- a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
@@ -14,7 +14,7 @@ description: "Plan Feature — Autonomous plan generation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -134,7 +134,7 @@ description: "Plan Feature — Autonomous plan generation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 240be606c..433a561dc 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -14,7 +14,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -176,7 +176,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
+"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -341,7 +341,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 3 — Base Check
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --placeholder=BASE_PATH={BASE_PATH}
+"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3 --placeholder=BASE_PATH={BASE_PATH}
 ```
 
 - [ ] Ancestor verdict determined
@@ -449,7 +449,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
+   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -526,7 +526,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 9 — Re-validate
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
+"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
 ```
 
 - [ ] Validated head resolved
diff --git a/.agents/skills/bkit-auto/SKILL.md b/.agents/skills/bkit-auto/SKILL.md
index 51214d3fa..f36e57576 100644
--- a/.agents/skills/bkit-auto/SKILL.md
+++ b/.agents/skills/bkit-auto/SKILL.md
@@ -14,7 +14,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 4ec497dc7..030184083 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -14,7 +14,7 @@ description: "Build Feature — Autonomous implementation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -328,7 +328,7 @@ description: "Build Feature — Autonomous implementation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=build --step=build-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=build --step=build-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index b6c7e99dc..3da562c7f 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -14,7 +14,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -214,7 +214,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -630,7 +630,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit. `{LIVE_SKIPPED}` = `--field="testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out)."` when `TEST_SCOPE` lacks `live`, else empty:
    ```bash
-   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
+   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none || exit 1
    "{BKIT}" prs transport-row --file="{STATUS}" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
    ```
 4. Set `TRIGGER_PR`:
diff --git a/.agents/skills/bkit-design/SKILL.md b/.agents/skills/bkit-design/SKILL.md
index ccc7735fe..86d82fca1 100644
--- a/.agents/skills/bkit-design/SKILL.md
+++ b/.agents/skills/bkit-design/SKILL.md
@@ -14,7 +14,7 @@ description: "Design Feature — Autonomous design phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -124,7 +124,7 @@ description: "Design Feature — Autonomous design phase"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=design --step=design-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=design --step=design-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.agents/skills/bkit-plan/SKILL.md b/.agents/skills/bkit-plan/SKILL.md
index 610fa45ec..17f8717d0 100644
--- a/.agents/skills/bkit-plan/SKILL.md
+++ b/.agents/skills/bkit-plan/SKILL.md
@@ -14,7 +14,7 @@ description: "Plan Feature — Autonomous plan generation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -134,7 +134,7 @@ description: "Plan Feature — Autonomous plan generation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index aab1bbcab..81b2a5ac8 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -14,7 +14,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -176,7 +176,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
+"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -341,7 +341,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 3 — Base Check
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --placeholder=BASE_PATH={BASE_PATH}
+"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3 --placeholder=BASE_PATH={BASE_PATH}
 ```
 
 - [ ] Ancestor verdict determined
@@ -449,7 +449,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
+   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -526,7 +526,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 9 — Re-validate
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
+"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
 ```
 
 - [ ] Validated head resolved
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 3d8e25d8c..2ce5a9712 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -40,6 +40,8 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 
 **Step endings:** a step that writes a `step-done` row ends in one `bkit steps finish` call: it reads each `--agent`'s verdict header from the `--artifact` in the same position (worst verdict wins, `Failures` summed, the prompt's declared header fields required, `Strategy` recorded on the row), derives the attempt (`--attempt=next`, `--attempt-of=<step>:<next|current|count>`; `<attempt>` in a path or message becomes it), runs the gate's mechanical checks before writing, writes the row, commits (`--message`, `<done>` = the log's first `DONE` line), and prints the step's tracker `comment` (`--number` / `--title`); `--post` posts it first and prints `tracker`. Exit 5 / 6 print `reask` = `{agent, artifact}` for the header-only re-ask. A gate whose step ends in `steps finish` relies on that call's checks; a gate with no finish (Step 1, closes, Step 3 / 9 of ship) runs `bkit steps gate`.
 
+**Progress output:** Successful numbered completions expose `progressLine` in the ordinary text object and `--json` object. The string is derived from the selected run, current plan groups and saved retry allowance; it adds no status fields. Completion writers expose it only after their write and commit succeed. `steps gate --progress-number=N` renders an explicitly numbered gate completion after its existing validation, using a status file or the held Step 1 feature/month lock context. A gate without that flag emits no line. The workflow narration, formulas and duplicate handling live in `.bkit/workflows.md` § Progress Lines.
+
 **`{OUTBOX}`** = `{OUTBOX_ROOT}/{FID}` = `<main checkout>/.git/bkit-outbox/{FID}/` (git common dir): temporary command inputs and outputs — re-read issue files from `bkit issues fetch --outbox`, related-issue hits, close artifact and telemetry lines, ship's pre-merge snapshot and close worktree, the `.worktree-owned` marker. `{OUTBOX_ROOT}/error.md` carries the Failure Path's error text to `bkit workflows fail --error-file`. Outside every worktree, so it survives worktree removal; never committed.
 
 CI check names come from `package.json` `bkit.testing.ciCapstone` (default `bkit-tests-check`) and `bkit.testing.ciWorkflow` (default `bkit-ci.yml`) — no command hard-codes a check, workflow file, or app folder.
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index cd4d622dd..52061afd0 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -40,6 +40,8 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 
 **Step endings:** a step that writes a `step-done` row ends in one `bkit steps finish` call: it reads each `--agent`'s verdict header from the `--artifact` in the same position (worst verdict wins, `Failures` summed, the prompt's declared header fields required, `Strategy` recorded on the row), derives the attempt (`--attempt=next`, `--attempt-of=<step>:<next|current|count>`; `<attempt>` in a path or message becomes it), runs the gate's mechanical checks before writing, writes the row, commits (`--message`, `<done>` = the log's first `DONE` line), and prints the step's tracker `comment` (`--number` / `--title`); `--post` posts it first and prints `tracker`. Exit 5 / 6 print `reask` = `{agent, artifact}` for the header-only re-ask. A gate whose step ends in `steps finish` relies on that call's checks; a gate with no finish (Step 1, closes, Step 3 / 9 of ship) runs `bkit steps gate`.
 
+**Progress output:** Successful numbered completions expose `progressLine` in the ordinary text object and `--json` object. The string is derived from the selected run, current plan groups and saved retry allowance; it adds no status fields. Completion writers expose it only after their write and commit succeed. `steps gate --progress-number=N` renders an explicitly numbered gate completion after its existing validation, using a status file or the held Step 1 feature/month lock context. A gate without that flag emits no line. The workflow narration, formulas and duplicate handling live in `.bkit/workflows.md` § Progress Lines.
+
 **`{OUTBOX}`** = `{OUTBOX_ROOT}/{FID}` = `<main checkout>/.git/bkit-outbox/{FID}/` (git common dir): temporary command inputs and outputs — re-read issue files from `bkit issues fetch --outbox`, related-issue hits, close artifact and telemetry lines, ship's pre-merge snapshot and close worktree, the `.worktree-owned` marker. `{OUTBOX_ROOT}/error.md` carries the Failure Path's error text to `bkit workflows fail --error-file`. Outside every worktree, so it survives worktree removal; never committed.
 
 CI check names come from `package.json` `bkit.testing.ciCapstone` (default `bkit-tests-check`) and `bkit.testing.ciWorkflow` (default `bkit-ci.yml`) — no command hard-codes a check, workflow file, or app folder.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index c1dc74b2c..cb5cc4162 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -214,7 +214,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 | **Rules file** | Protocol | all 6 | Read `.agents/rules.md` → follow all rules. First Protocol bullet (`rules-orchestrator`). |
 | **Order** | Protocol | all 6 | Execute steps sequentially unless stated otherwise. The `order` clause shared with every prompt. |
 | **No improv** | Protocol | all 6 | Skip no step, and add no step of your own; how deeply you investigate within a step is your call. The `no-improv` clause shared with every prompt; `Scope discipline` in `.agents/rules.md` covers scope. |
-| **Narrate** | Protocol | all 6 | User-visible lines at step start, subagent return, pivot, blocker; Auto-apply does not mean silent. |
+| **Narrate** | Protocol | all 6 | User-visible lines at step start, subagent return, pivot and blocker; after each numbered completion, show the engine's `progressLine` word for word as plain text outside code blocks. Delayed bookkeeping and repeated validation gates add no duplicate. Auto forwards its delegated workflow's lines; headless runs show them without acknowledgement. |
 | **Failures** | Protocol | all 6 | Any step, tool, command failure, or gate that cannot pass → **Failure Path**. |
 | **Placeholders** | Protocol | all 6 | Assert required `{PLACEHOLDERS}` non-empty before tool calls → else **Failure Path**. auto and plan name their own placeholders; auto derives `{OWNER}` / `{REPO}` from `{OWNER_REPO}` at Step 1. |
 | **Commands** | Protocol | all 6 | Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info` (before it, the lookup expression); stdout is `key: value` text (see `.bkit/cli.md`); exit non-zero with no `Route:` → **Failure Path**; exit 80 → mapped MCP tool (auto: **Failure Path**); exit 81 → end turn, re-run block; a flag still holding a literal `{PLACEHOLDER}` exits 2. |
@@ -663,6 +663,23 @@ Every stamp (design, plan, audit report) adds 2 more when `.bkit/version` exists
 
 **Read by build's Plan Current step** (`/bkit-build` Step 5), the only consumer of `baseSha` on a plan doc. `designPath` / `designBaseSha` are provenance only and have no consumer: once a plan exists it is judged against the codebase, never against its design. Absent or unreachable `baseSha` skips the judgement, never fails it.
 
+### Progress Lines
+
+The engine returns `progressLine` after a successful numbered completion. The orchestrator shows that string word for word as plain text outside a code block, including skipped steps and retries. Each completed row gets one line. A delayed Step 1 bookkeeping row and a repeated validation gate do not add a duplicate. `/bkit-auto` forwards the selected workflow's lines; headless runs use the same output without waiting for acknowledgement.
+
+```text
+Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3
+Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3
+```
+
+The line describes the current numbered position, rather than elapsed time or a count of completed rows. Flat workflows divide the current number by their distinct numbered positions. Build expands Steps 7–9 for each current plan group: with `G` groups its total is `6 + 3G + 7`; inside group ordinal `g`, completed units are `6 + 3(g - 1) + (n - 6)`, and after the loop they are `6 + 3G + (n - 9)`. Sparse group markers map to their order in the plan. A missing plan uses one group, and each emission reads the plan again, so added groups immediately change the denominator.
+
+The percentage uses nearest-integer rounding, and the ten-cell bar uses nearest-ten rounding. Nonfinal positions are capped at 99%; the final numbered position reaches 100%. Returning to an earlier step can lower progress. Build loop lines add `Group {g} of {G}`. Retries above one add `Attempt {a} of {allowance}` from saved limits and grants, or `Attempt {a}` when no budget is known. Debug soak uses its saved cross-run soak count and grants.
+
+`steps finish`, `steps done`, recorded `context finalise`, recorded `runs dispatch` and a close that records its step expose eligible completion lines. Invalid input, a refused completion write or commit, decision and owner-pause rows, and unnumbered bookkeeping expose none. Progress is derived output and is never stored in status rows. A resume selects the same run and saved counter context.
+
+`steps gate --progress-number` explicitly renders a gate-only completion after validation, without appending a completion row. The five Step 1 gates use their feature, month and held lock; ship's Base Check and Re-validate gates use their status file and numbers 3 and 9. Their existing step validation remains in force. Gates without the flag remain read-only validation and print no progress line; ordinary command journaling still applies.
+
 ### Gates
 
 Every step ends with `### 🔒 Gate N — {Step Name}` and a checklist.
diff --git a/.bkit/core/engine/commands/workflow/progress.integration.test.ts b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
index 59c6dc474..90032b16d 100644
--- a/.bkit/core/engine/commands/workflow/progress.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
@@ -474,6 +474,27 @@ describe("workflow progress command wiring", () => {
     expect(landed.filter((row) => row.step === "ship-close-workflow")).toHaveLength(1);
   });
 
+  it("progress accepts the ship base-check regression guard gate", async () => {
+    const cwd = repo("ship");
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      jsonl([completed(cwd, "ship", "ship-regression-guard")]),
+    );
+    const before = domainRows(cwd);
+    const result = await run(cwd, [
+      "steps",
+      "gate",
+      "--workflow=ship",
+      `--file=${STATUS}`,
+      "--step=ship-regression-guard",
+      "--progress-number=3",
+      "--placeholder=BASE_PATH=A",
+    ]);
+    expect(result.code).toBe(0);
+    expect(result.json?.progressLine).toBe("Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check");
+    expect(domainRows(cwd)).toEqual(before);
+  });
+
   it("progress gate only completions", async () => {
     vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
     vi.stubEnv("GIT_EXEC_PATH", "");
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index c70dc9898..dbb1b6243 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -1837,7 +1837,8 @@ export const stepsCommand: CommandSpec = {
           const step = String(f.step);
           const recordedNumber = WORKFLOW_STEPS[workflow].find((s) => s.step === step)?.number;
           const gateNumber =
-            workflow === "ship" && step === "ship-worktree-setup"
+            workflow === "ship" &&
+            (step === "ship-worktree-setup" || step === "ship-regression-guard")
               ? 3
               : workflow === "ship" && step === "ship-bookkeeping-push"
                 ? 9
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index cdbbf30a5..c04eb33bf 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -12,7 +12,7 @@ description: "Build Feature — Autonomous implementation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -289,7 +289,7 @@ _No tracker connected, skip step._
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=build --step=build-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=build --step=build-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index dea361525..38e158439 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -12,7 +12,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -183,7 +183,7 @@ _No tracker connected, skip step._
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -578,7 +578,7 @@ _No tracker connected, skip step._
 
 3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit. `{LIVE_SKIPPED}` = `--field="testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out)."` when `TEST_SCOPE` lacks `live`, else empty:
    ```bash
-   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
+   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none || exit 1
    "{BKIT}" prs transport-row --file="{STATUS}" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
    ```
 4. Set `TRIGGER_PR`:
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
index d81e6c0fc..b7e1dac3f 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
@@ -12,7 +12,7 @@ description: "Design Feature — Autonomous design phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -93,7 +93,7 @@ _No tracker connected, skip step._
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=design --step=design-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=design --step=design-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index d6dcbc7c1..89a843a35 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -12,7 +12,7 @@ description: "Plan Feature — Autonomous plan generation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -101,7 +101,7 @@ _No tracker connected, skip step._
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index b10f4e4a9..ccf098a70 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -12,7 +12,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -144,7 +144,7 @@ _No tracker connected, skip step._
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
+"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -305,7 +305,7 @@ _No tracker connected, skip step._
 ### 🔒 Gate 3 — Base Check
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --placeholder=BASE_PATH={BASE_PATH}
+"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3 --placeholder=BASE_PATH={BASE_PATH}
 ```
 
 - [ ] Ancestor verdict determined
@@ -413,7 +413,7 @@ _No tracker connected, skip step._
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
+   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -490,7 +490,7 @@ _No tracker connected, skip step._
 ### 🔒 Gate 9 — Re-validate
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
+"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
 ```
 
 - [ ] Validated head resolved
diff --git a/.bkit/core/engine/render/hosts.test.ts b/.bkit/core/engine/render/hosts.test.ts
index 6cc97c768..157a10be8 100644
--- a/.bkit/core/engine/render/hosts.test.ts
+++ b/.bkit/core/engine/render/hosts.test.ts
@@ -704,6 +704,57 @@ describe("#386: line 1 of a rendered command is a description, never the marker"
 // Antigravity — tool map, prompt frontmatter, skill, invocation rewrite
 // ---------------------------------------------------------------------------
 
+describe("workflow progress narration", () => {
+  const src = path.join(REPO_ROOT, ".bkit/core/workflows");
+  const files = fs.readdirSync(src).filter((file) => /^bkit-.*\.md$/.test(file));
+
+  for (const file of files) {
+    const raw = fs.readFileSync(path.join(src, file), "utf8");
+    const name = file.slice(0, -3);
+    const narration = raw.match(/^- \*\*Narrate:\*\* (.+)$/m)?.[1];
+    const tracked = substituteWorkflow(raw, DEFAULT_ISSUE_TRACKER).output;
+    const renderedHosts = [
+      tracked,
+      applyT2(applyT1(tracked)),
+      applyCodexSkill(raw, name, DEFAULT_ISSUE_TRACKER),
+      applyAntigravitySkill(tracked, name),
+      applyOpencodeCommand(tracked),
+    ];
+    const firstGates = renderedHosts.map((rendered) =>
+      rendered.split("\n").find((line) => /steps gate.*-start-workflow/.test(line)),
+    );
+    it(`preserves the progress contract across hosts: ${file}`, () => {
+      expect(narration).toContain("`progressLine`");
+      expect(narration).toContain("word for word");
+      expect(narration).toContain("plain text outside code blocks");
+      expect(narration).toContain("Headless");
+      for (const rendered of renderedHosts) {
+        expect(rendered).toContain(narration);
+        expect(rendered).not.toMatch(
+          /(?:steps finish --workflow=ship --step=ship-update-docs|steps done[^\n]*--step=debug-close-workflow)[^\n]*>\/dev\/null/,
+        );
+      }
+    });
+    if (name !== "bkit-auto") {
+      it(`retains explicit first-step gates: ${file}`, () => {
+        for (const gate of firstGates) expect(gate).toContain("--progress-number=1");
+      });
+    }
+    if (name === "bkit-ship") {
+      it("retains explicit rowless ship gates", () => {
+        for (const rendered of renderedHosts) {
+          expect(rendered).toContain(
+            'steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3',
+          );
+          expect(rendered).toContain(
+            'steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9',
+          );
+        }
+      });
+    }
+  }
+});
+
 describe("antigravityToolsBlock", () => {
   it("maps Claude tool names to Antigravity's vocabulary, keeping list shape", () => {
     const out = antigravityToolsBlock("tools:\n  - Read\n  - Write\n  - Edit\n  - Bash");
diff --git a/.bkit/core/workflows/bkit-auto.md b/.bkit/core/workflows/bkit-auto.md
index 69014cb07..615b3c825 100644
--- a/.bkit/core/workflows/bkit-auto.md
+++ b/.bkit/core/workflows/bkit-auto.md
@@ -12,7 +12,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index c348ad4d7..5f68fb310 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -12,7 +12,7 @@ description: "Build Feature — Autonomous implementation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -365,7 +365,7 @@ description: "Build Feature — Autonomous implementation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=build --step=build-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=build --step=build-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index 8b4e008f4..a21fcad1a 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -12,7 +12,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -252,7 +252,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -686,7 +686,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit. `{LIVE_SKIPPED}` = `--field="testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out)."` when `TEST_SCOPE` lacks `live`, else empty:
    ```bash
-   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
+   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none || exit 1
    "{BKIT}" prs transport-row --file="{STATUS}" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
    ```
 4. Set `TRIGGER_PR`:
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index d99c60e92..2af3cfcf2 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -12,7 +12,7 @@ description: "Design Feature — Autonomous design phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -162,7 +162,7 @@ description: "Design Feature — Autonomous design phase"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=design --step=design-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=design --step=design-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 5cef605b0..75b08ed33 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -12,7 +12,7 @@ description: "Plan Feature — Autonomous plan generation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -174,7 +174,7 @@ description: "Plan Feature — Autonomous plan generation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 759e1b73f..13b40bf50 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -12,7 +12,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -216,7 +216,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
+"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue="{ISSUE_ID}"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -385,7 +385,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 3 — Base Check
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --placeholder=BASE_PATH={BASE_PATH}
+"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3 --placeholder=BASE_PATH={BASE_PATH}
 ```
 
 - [ ] Ancestor verdict determined
@@ -493,7 +493,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
+   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -570,7 +570,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 9 — Re-validate
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
+"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
 ```
 
 - [ ] Validated head resolved
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 62b5ad8e6..2d67562b9 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -2587,10 +2587,11 @@ One `### {name}` per clause, in the lines of § Format, Clause section lines. He
 - carriers: workflow all
 
 ```text
-**Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+**Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 ```
 
 ```retired
+**Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
 **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does NOT mean silent.
 ```
 
@@ -9166,7 +9167,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 | **Rules file** | Protocol | all 6 | Read `.agents/rules.md` → follow all rules. First Protocol bullet (`rules-orchestrator`). |
 | **Order** | Protocol | all 6 | Execute steps sequentially unless stated otherwise. The `order` clause shared with every prompt. |
 | **No improv** | Protocol | all 6 | Skip no step, and add no step of your own; how deeply you investigate within a step is your call. The `no-improv` clause shared with every prompt; `Scope discipline` in `.agents/rules.md` covers scope. |
-| **Narrate** | Protocol | all 6 | User-visible lines at step start, subagent return, pivot, blocker; Auto-apply does not mean silent. |
+| **Narrate** | Protocol | all 6 | User-visible lines at step start, subagent return, pivot and blocker; after each numbered completion, show the engine's `progressLine` word for word as plain text outside code blocks. Delayed bookkeeping and repeated validation gates add no duplicate. Auto forwards its delegated workflow's lines; headless runs show them without acknowledgement. |
 | **Failures** | Protocol | all 6 | Any step, tool, command failure, or gate that cannot pass → **Failure Path**. |
 | **Placeholders** | Protocol | all 6 | Assert required `{PLACEHOLDERS}` non-empty before tool calls → else **Failure Path**. auto and plan name their own placeholders; auto derives `{OWNER}` / `{REPO}` from `{OWNER_REPO}` at Step 1. |
 | **Commands** | Protocol | all 6 | Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info` (before it, the lookup expression); stdout is `key: value` text (see `.bkit/cli.md`); exit non-zero with no `Route:` → **Failure Path**; exit 80 → mapped MCP tool (auto: **Failure Path**); exit 81 → end turn, re-run block; a flag still holding a literal `{PLACEHOLDER}` exits 2. |
diff --git a/.bkit/version b/.bkit/version
index 62e7394f5..9fe67043e 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "04d591fb6ab9f66ad269a58d457d03a38a15b6c5c6d7e3a8af51d31feb697320",
+    "docs/testing.md": "a9252f89aa597bd5d4ace5509849c416a1aed3671c14c24545f12e9121cc25c3",
     ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -23,12 +23,12 @@
     ".bkit/.env.example": "3eae6dd3d96a33aed1745fc6b069000ae7272fbdab99617250015e9c233e6200",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "05d888d6188c44f518bd1d10b4c01ae6af373a6ce79da72fbaf10d5d45154e15",
-    ".claude/commands/bkit-auto.md": "260073c68e7557e6b3477b5dd0f56427a74993877dcd3cfada11d65be2ea85f4",
-    ".claude/commands/bkit-build.md": "c40d7ce9ebabee268d3162fef41459fe06b2c4a165276cb009a86fbdceb606b0",
-    ".claude/commands/bkit-debug.md": "1a59a2c43d718d9d71b67219848d56a72aa91779fa3aac656c5ab0721318dab8",
-    ".claude/commands/bkit-design.md": "f1bdf372f6226877037902ba395d5bc01b9aca784cef3f1e0cbbb9939c068a8c",
-    ".claude/commands/bkit-plan.md": "0e6ce306b016e4241d16379638a0ca776358d8b1b209202d7b6075092f19b7b3",
-    ".claude/commands/bkit-ship.md": "9aae4f2aa76205821934bec573d2b97d6944cc6d39480acc9f20682c3dbee5ec",
+    ".claude/commands/bkit-auto.md": "37517452fe7075a0254898926dadbcc8cdd130ddbd5f7a8e2e1a66409fb52afe",
+    ".claude/commands/bkit-build.md": "ae36b36ac67d695941ce1620e10253168a05ca8dd82abb3eccc271f15c546215",
+    ".claude/commands/bkit-debug.md": "c9b172e07ee7435260792fffd1845708029db1cc23fa57f21545af2a021eba71",
+    ".claude/commands/bkit-design.md": "ca9fb3559db81799ee1275ba12c090e5f86ce9ea401a45044636da5287f0b490",
+    ".claude/commands/bkit-plan.md": "6927abc6b116c26e514e87bad89dcccce412d91aa654a8988c0834c21aa70712",
+    ".claude/commands/bkit-ship.md": "d0a44b205f0c6e9b02295ab5bb65797d513da8bc9bc565f3e1a717e94162d760",
     ".claude/agents/bkit-build-challenge-1.md": "cdd3c2ac8dff17591adacf9cccae4162fa5b8d1fdb02f409e50acff40f8826f3",
     ".claude/agents/bkit-build-challenge-2.md": "05bd003c57e9d176ab68484d0356f730db95fb7d62536cbe2bc995c1524c349b",
     ".claude/agents/bkit-build-install-skills.md": "6e933518e6be37d8a384b9592293b47c8683247e6e96cda82e6c0bfff1fd641b",
@@ -55,12 +55,12 @@
     ".claude/agents/bkit-ship-update-docs.md": "9b024d359eb389675a830bb6131d08fa4c8aa2c641058c4c535b96fd56274335",
     ".claude/agents/bkit-utility-compress-markdown.md": "b43e14949abd2218e1407fa587ee542bd5951caf543c4bd0718b7a78eea128c7",
     ".claude/agents/bkit-utility-update-documentation.md": "0b3d4145acaf8ce46ace5328fe2e13f904d3c8aba8823aa1c2bff6a4cc5f7d3e",
-    ".cursor/commands/bkit-auto.md": "dd1637833fa6c64e05678a6357d1d3f322e782e668d56d423f170f08218f374d",
-    ".cursor/commands/bkit-build.md": "984d8d56ddb67968862c703d331aadcac114bf11661c9e7cf27038638be0a580",
-    ".cursor/commands/bkit-debug.md": "f457c40362c2817c3950352932f5c7b7b341a3dbda291908031d3824896cbc62",
-    ".cursor/commands/bkit-design.md": "6fc9344768b275f1f76585a816d4fa7775b789edd3085a87056abbea789c2b50",
-    ".cursor/commands/bkit-plan.md": "c2580c73e36848a5f7a830ebf1491daf97400ab90cc9934eac9341f242ce3c93",
-    ".cursor/commands/bkit-ship.md": "3723c3e9e7a2fd7e612ce8ac73ffdd0438b9713c420b6aeed84ac93267c0d04b",
+    ".cursor/commands/bkit-auto.md": "a4f6eece5e839cec7bb63e39e4a8a52b8278f5b6e6b7f120b258ae81187edddb",
+    ".cursor/commands/bkit-build.md": "4c4c10071b85ed63840270215fa5376802572f9b37b160c67181724511807610",
+    ".cursor/commands/bkit-debug.md": "5a8f72155d08c40b62846672ebedd56d7ee613db9486e1b9ec2e3744c7ae91bd",
+    ".cursor/commands/bkit-design.md": "4d3de59f1bf8a5745bf2ba56115862a6e4716c845b1e13fea51154aee346d8d7",
+    ".cursor/commands/bkit-plan.md": "e798820e591eae497c658621956144200ec1deb157283ba1e43d06c3d9ca7e60",
+    ".cursor/commands/bkit-ship.md": "8b33608f9ade819f22529ab0fe21f31db693d84fefb306174734baab9bebe956",
     ".cursor/agents/bkit-build-challenge-1.md": "093141086374b85fd0fc944cafb575ec60a80df88fed1e471ac18640bc5cbe61",
     ".cursor/agents/bkit-build-challenge-2.md": "b4998b1d36bff4fc827cbd8310650fe9c4f2f9647685e243bca33984ddde9ef6",
     ".cursor/agents/bkit-build-install-skills.md": "b1a9b1ebb7272c08186f150fee495808bec6a2c98dd840724bf2e92ad3df5dd9",
@@ -113,12 +113,12 @@
     ".opencode/agents/bkit-ship-update-docs.md": "f9a27c878eac9daf331f94172fee19c769aebe8229910793c70c52e78225ec25",
     ".opencode/agents/bkit-utility-compress-markdown.md": "8265357e11e5bd3d358281b2f712e09dff81cb5d278436ab7584355784b09f7f",
     ".opencode/agents/bkit-utility-update-documentation.md": "e494bd347aa52ca97786a094d9083721ad264070f1e3a0c90efeac23789dcc2a",
-    ".opencode/commands/bkit-auto.md": "aaaa897a5cd1766f875ce084fdd89ab97282d78ec0b3fe6fd66e790e96f3c047",
-    ".opencode/commands/bkit-build.md": "e44c5272f6a12c3355af0111a6610779e642ace02687a3814258feeab3cf1294",
-    ".opencode/commands/bkit-debug.md": "007252b0514f6ba49df2a1938fd4c0170f3523af918734d39957976771a01d38",
-    ".opencode/commands/bkit-design.md": "741a2ac077cdfb19c79146314fd32ae2961d930ccff9563df81ebc90bdbb81f1",
-    ".opencode/commands/bkit-plan.md": "afa884bb468e4411e9914be71e3783b906c53734f9dede7af92b0c98af89bd76",
-    ".opencode/commands/bkit-ship.md": "878681a251cfcc4ba1cef3bce1db1b6cb8029c9072e09bd26b72d34b1890c09d",
+    ".opencode/commands/bkit-auto.md": "df00c67382a594bb0e78b10832e09d9081f118b337ae4f7f9ad97407331ada5a",
+    ".opencode/commands/bkit-build.md": "417dedc4632bcb065b7dbeb660d78dec8af0cbe568203c7fd09ca26fd10de81e",
+    ".opencode/commands/bkit-debug.md": "1d13c57cf69e123b0b602a7eac78fd0e781f87114f25d6f4a941f5236c5b782c",
+    ".opencode/commands/bkit-design.md": "c6563145e966021148da675da15273785d17ef5b15712c9a226a7cfbc1187852",
+    ".opencode/commands/bkit-plan.md": "dd2d37b57c223f62a51732af1b3790c1ec30366d483e39d864eb1802713fbbb5",
+    ".opencode/commands/bkit-ship.md": "00c01ee43cdf06c635d34fde67820916b2583c31e8dcead43a4ed6bef9c732f5",
     ".claude/agents/bkit-design-spike.md": "179985ceaeac1d1105321e1b44774830372e715fab2d2bff3eeb306d2b87506a",
     ".cursor/agents/bkit-design-spike.md": "748e208e6debd4ef6253bcbe775c153a004940fbc710a85c1df1ea07bffedd74",
     ".opencode/agents/bkit-design-spike.md": "a57d8e46156607813cb72addbb58b38cf5b5e73fbc9f4b37d833abd84d2e347d",
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "f55e9e3e06f53afec0ba2aed6d0981307469cfc4c1aba7b99f176cc3a8cde6eb",
     ".bkit/prompts.md": "05bef1112ac15f6ffdb8877f132d0b85e2718ca682be4dca0a7dbebdd798ab05",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "ae27e98559f30fa343cf9a2c8e794f449af22a3c2b2e2c660464e6d0896c967c",
+    ".bkit/workflows.md": "35b69cebbfcbe5b2a1c1281faa79dfb46b244b929710cf72d5135c6aae9e4052",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "41c0710dfcaf06f930f7f0cbbb4cadb0fb1938923984cf5393be7d60a051100c",
+    ".bkit/cli.md": "562df81cbcb381ec10d8ca663138f3dbac9787490c46b9e6bb592f96416eaa67",
     ".claude/agents/bkit-build-plan-tests.md": "eda75f0bbc0c1ddc3e69a2cdaef8c3b00a8fff7153b968eb7db24ae5dd98b58f",
     ".cursor/agents/bkit-build-plan-tests.md": "50a613fa58a0c00db0c3f79f5e908c955515234b5ec0676c1348a3bfe188b37a",
     ".opencode/agents/bkit-build-plan-tests.md": "9e654f6a332ec5659059158a0dee0853e487a4bd55f9063c86e82aa5791a03ee",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 0f42060f1..b713c16a3 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -214,7 +214,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 | **Rules file** | Protocol | all 6 | Read `.agents/rules.md` → follow all rules. First Protocol bullet (`rules-orchestrator`). |
 | **Order** | Protocol | all 6 | Execute steps sequentially unless stated otherwise. The `order` clause shared with every prompt. |
 | **No improv** | Protocol | all 6 | Skip no step, and add no step of your own; how deeply you investigate within a step is your call. The `no-improv` clause shared with every prompt; `Scope discipline` in `.agents/rules.md` covers scope. |
-| **Narrate** | Protocol | all 6 | User-visible lines at step start, subagent return, pivot, blocker; Auto-apply does not mean silent. |
+| **Narrate** | Protocol | all 6 | User-visible lines at step start, subagent return, pivot and blocker; after each numbered completion, show the engine's `progressLine` word for word as plain text outside code blocks. Delayed bookkeeping and repeated validation gates add no duplicate. Auto forwards its delegated workflow's lines; headless runs show them without acknowledgement. |
 | **Failures** | Protocol | all 6 | Any step, tool, command failure, or gate that cannot pass → **Failure Path**. |
 | **Placeholders** | Protocol | all 6 | Assert required `{PLACEHOLDERS}` non-empty before tool calls → else **Failure Path**. auto and plan name their own placeholders; auto derives `{OWNER}` / `{REPO}` from `{OWNER_REPO}` at Step 1. |
 | **Commands** | Protocol | all 6 | Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info` (before it, the lookup expression); stdout is `key: value` text (see `.bkit/cli.md`); exit non-zero with no `Route:` → **Failure Path**; exit 80 → mapped MCP tool (auto: **Failure Path**); exit 81 → end turn, re-run block; a flag still holding a literal `{PLACEHOLDER}` exits 2. |
@@ -663,6 +663,23 @@ Every stamp (design, plan, audit report) adds 2 more when `.bkit/version` exists
 
 **Read by build's Plan Current step** (`/bkit-build` Step 5), the only consumer of `baseSha` on a plan doc. `designPath` / `designBaseSha` are provenance only and have no consumer: once a plan exists it is judged against the codebase, never against its design. Absent or unreachable `baseSha` skips the judgement, never fails it.
 
+### Progress Lines
+
+The engine returns `progressLine` after a successful numbered completion. The orchestrator shows that string word for word as plain text outside a code block, including skipped steps and retries. Each completed row gets one line. A delayed Step 1 bookkeeping row and a repeated validation gate do not add a duplicate. `/bkit-auto` forwards the selected workflow's lines; headless runs use the same output without waiting for acknowledgement.
+
+```text
+Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3
+Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3
+```
+
+The line describes the current numbered position, rather than elapsed time or a count of completed rows. Flat workflows divide the current number by their distinct numbered positions. Build expands Steps 7–9 for each current plan group: with `G` groups its total is `6 + 3G + 7`; inside group ordinal `g`, completed units are `6 + 3(g - 1) + (n - 6)`, and after the loop they are `6 + 3G + (n - 9)`. Sparse group markers map to their order in the plan. A missing plan uses one group, and each emission reads the plan again, so added groups immediately change the denominator.
+
+The percentage uses nearest-integer rounding, and the ten-cell bar uses nearest-ten rounding. Nonfinal positions are capped at 99%; the final numbered position reaches 100%. Returning to an earlier step can lower progress. Build loop lines add `Group {g} of {G}`. Retries above one add `Attempt {a} of {allowance}` from saved limits and grants, or `Attempt {a}` when no budget is known. Debug soak uses its saved cross-run soak count and grants.
+
+`steps finish`, `steps done`, recorded `context finalise`, recorded `runs dispatch` and a close that records its step expose eligible completion lines. Invalid input, a refused completion write or commit, decision and owner-pause rows, and unnumbered bookkeeping expose none. Progress is derived output and is never stored in status rows. A resume selects the same run and saved counter context.
+
+`steps gate --progress-number` explicitly renders a gate-only completion after validation, without appending a completion row. The five Step 1 gates use their feature, month and held lock; ship's Base Check and Re-validate gates use their status file and numbers 3 and 9. Their existing step validation remains in force. Gates without the flag remain read-only validation and print no progress line; ordinary command journaling still applies.
+
 ### Gates
 
 Every step ends with `### 🔒 Gate N — {Step Name}` and a checklist.
diff --git a/.claude/commands/bkit-auto.md b/.claude/commands/bkit-auto.md
index d81ff3bc8..30e7750e2 100644
--- a/.claude/commands/bkit-auto.md
+++ b/.claude/commands/bkit-auto.md
@@ -13,7 +13,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 2b85c7145..289558edb 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -13,7 +13,7 @@ description: "Build Feature — Autonomous implementation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -327,7 +327,7 @@ description: "Build Feature — Autonomous implementation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=build --step=build-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=build --step=build-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index 3fcfa6578..800ec8bde 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -13,7 +13,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -213,7 +213,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -629,7 +629,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit. `{LIVE_SKIPPED}` = `--field="testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out)."` when `TEST_SCOPE` lacks `live`, else empty:
    ```bash
-   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
+   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none || exit 1
    "{BKIT}" prs transport-row --file="{STATUS}" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
    ```
 4. Set `TRIGGER_PR`:
diff --git a/.claude/commands/bkit-design.md b/.claude/commands/bkit-design.md
index 80abae567..d2125ad7f 100644
--- a/.claude/commands/bkit-design.md
+++ b/.claude/commands/bkit-design.md
@@ -13,7 +13,7 @@ description: "Design Feature — Autonomous design phase"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -123,7 +123,7 @@ description: "Design Feature — Autonomous design phase"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=design --step=design-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=design --step=design-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.claude/commands/bkit-plan.md b/.claude/commands/bkit-plan.md
index 2df1ed98f..e25770927 100644
--- a/.claude/commands/bkit-plan.md
+++ b/.claude/commands/bkit-plan.md
@@ -13,7 +13,7 @@ description: "Plan Feature — Autonomous plan generation"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -133,7 +133,7 @@ description: "Plan Feature — Autonomous plan generation"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 760d7d7a3..5ae97b06c 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -13,7 +13,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -175,7 +175,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
+"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -340,7 +340,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 3 — Base Check
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --placeholder=BASE_PATH={BASE_PATH}
+"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3 --placeholder=BASE_PATH={BASE_PATH}
 ```
 
 - [ ] Ancestor verdict determined
@@ -448,7 +448,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
+   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -525,7 +525,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ### 🔒 Gate 9 — Re-validate
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
+"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
 ```
 
 - [ ] Validated head resolved
diff --git a/.cursor/commands/bkit-auto.md b/.cursor/commands/bkit-auto.md
index 83710a9d6..1c66abd14 100644
--- a/.cursor/commands/bkit-auto.md
+++ b/.cursor/commands/bkit-auto.md
@@ -12,7 +12,7 @@ Auto — Phase-routed dispatch of any bkit phase
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index ad6c15d8b..0011cab06 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -12,7 +12,7 @@ Build Feature — Autonomous implementation
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -326,7 +326,7 @@ Build Feature — Autonomous implementation
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=build --step=build-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=build --step=build-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index 621f2a158..b477d622f 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -12,7 +12,7 @@ Debug Feature — Autonomous diagnosis and remediation
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -212,7 +212,7 @@ Debug Feature — Autonomous diagnosis and remediation
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -628,7 +628,7 @@ Debug Feature — Autonomous diagnosis and remediation
 
 3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit. `{LIVE_SKIPPED}` = `--field="testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out)."` when `TEST_SCOPE` lacks `live`, else empty:
    ```bash
-   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
+   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none || exit 1
    "{BKIT}" prs transport-row --file="{STATUS}" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
    ```
 4. Set `TRIGGER_PR`:
diff --git a/.cursor/commands/bkit-design.md b/.cursor/commands/bkit-design.md
index 1e36a62d4..22028513c 100644
--- a/.cursor/commands/bkit-design.md
+++ b/.cursor/commands/bkit-design.md
@@ -12,7 +12,7 @@ Design Feature — Autonomous design phase
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -122,7 +122,7 @@ Design Feature — Autonomous design phase
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=design --step=design-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=design --step=design-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.cursor/commands/bkit-plan.md b/.cursor/commands/bkit-plan.md
index ffa66a609..543967266 100644
--- a/.cursor/commands/bkit-plan.md
+++ b/.cursor/commands/bkit-plan.md
@@ -12,7 +12,7 @@ Plan Feature — Autonomous plan generation
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -132,7 +132,7 @@ Plan Feature — Autonomous plan generation
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 2c579104b..7eba53a6c 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -12,7 +12,7 @@ Ship Feature — Autonomous merge and archive
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -174,7 +174,7 @@ Ship Feature — Autonomous merge and archive
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
+"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -339,7 +339,7 @@ Ship Feature — Autonomous merge and archive
 ### 🔒 Gate 3 — Base Check
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --placeholder=BASE_PATH={BASE_PATH}
+"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3 --placeholder=BASE_PATH={BASE_PATH}
 ```
 
 - [ ] Ancestor verdict determined
@@ -447,7 +447,7 @@ Ship Feature — Autonomous merge and archive
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
+   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -524,7 +524,7 @@ Ship Feature — Autonomous merge and archive
 ### 🔒 Gate 9 — Re-validate
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
+"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
 ```
 
 - [ ] Validated head resolved
diff --git a/.opencode/commands/bkit-auto.md b/.opencode/commands/bkit-auto.md
index 146cabe67..f3646d2b9 100644
--- a/.opencode/commands/bkit-auto.md
+++ b/.opencode/commands/bkit-auto.md
@@ -16,7 +16,7 @@ $ARGUMENTS
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 434a5dabd..4083e227d 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -16,7 +16,7 @@ $ARGUMENTS
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -330,7 +330,7 @@ $ARGUMENTS
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=build --step=build-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=build --step=build-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index 21cc1c643..3c6dc7473 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -16,7 +16,7 @@ $ARGUMENTS
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -216,7 +216,7 @@ $ARGUMENTS
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=debug --step=debug-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -632,7 +632,7 @@ $ARGUMENTS
 
 3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit. `{LIVE_SKIPPED}` = `--field="testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out)."` when `TEST_SCOPE` lacks `live`, else empty:
    ```bash
-   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
+   "{BKIT}" steps done --file="{STATUS}" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none || exit 1
    "{BKIT}" prs transport-row --file="{STATUS}" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
    ```
 4. Set `TRIGGER_PR`:
diff --git a/.opencode/commands/bkit-design.md b/.opencode/commands/bkit-design.md
index 82ac90a45..8c1e77e72 100644
--- a/.opencode/commands/bkit-design.md
+++ b/.opencode/commands/bkit-design.md
@@ -16,7 +16,7 @@ $ARGUMENTS
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -126,7 +126,7 @@ $ARGUMENTS
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=design --step=design-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=design --step=design-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.opencode/commands/bkit-plan.md b/.opencode/commands/bkit-plan.md
index 51eb3df23..17d3efb90 100644
--- a/.opencode/commands/bkit-plan.md
+++ b/.opencode/commands/bkit-plan.md
@@ -16,7 +16,7 @@ $ARGUMENTS
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -136,7 +136,7 @@ $ARGUMENTS
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
+"{BKIT}" steps gate --workflow=plan --step=plan-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 1b12b7a47..06994dde1 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -16,7 +16,7 @@ $ARGUMENTS
 - **Rules file:** Read `.agents/rules.md` → follow all rules.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
-- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
+- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
 - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -178,7 +178,7 @@ $ARGUMENTS
 ### 🔒 Gate 1 — Start Workflow
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
+"{BKIT}" steps gate --workflow=ship --step=ship-start-workflow --progress-number=1 --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --issue="{ISSUE_ID}" --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=RUNTIME_WORKTREES={RUNTIME_WORKTREES}
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
@@ -343,7 +343,7 @@ $ARGUMENTS
 ### 🔒 Gate 3 — Base Check
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --placeholder=BASE_PATH={BASE_PATH}
+"{BKIT}" steps gate --workflow=ship --step=ship-regression-guard --file="{STATUS}" --progress-number=3 --placeholder=BASE_PATH={BASE_PATH}
 ```
 
 - [ ] Ancestor verdict determined
@@ -451,7 +451,7 @@ $ARGUMENTS
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
+   "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -528,7 +528,7 @@ $ARGUMENTS
 ### 🔒 Gate 9 — Re-validate
 
 ```bash
-"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
+"{BKIT}" steps gate --workflow=ship --step=ship-bookkeeping-push --file="{STATUS}" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
 ```
 
 - [ ] Validated head resolved
diff --git a/CHANGELOG.md b/CHANGELOG.md
index 3f80b4516..67888030c 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -10,6 +10,8 @@ Format: `## [version] — YYYY-MM-DD`
 
 ### Added
 
+- **Workflow steps show an engine-derived progress line.** Each numbered completion returns an exact ten-cell bar, percentage and step title for the agent to show as plain text. Build lines reflect current task groups, retries show the saved attempt allowance, and resuming recomputes the same position from the run's status and plan. Explicit gate-only completions use the same format without adding status rows. `bkit upgrade` installs the narration on every supported host.
+
 - **A setup tip tells you when a newer bkit is out.** `bkit tips` shows `bkit-upgrade` first, ahead of every other tip in every workflow, while the newest release `bkit repo info` last saw (cached once a day in git's common dir) is newer than `.bkit/version`. The tip only reads that cache and never asks the registry itself, so it stays quiet until a workflow has run once. It cannot be silenced: `bkit.advisories.ignore` skips it, a workflow's silence line never names it, and `BKIT_NO_UPDATE_CHECK=1` stops only the lookup, not a release already seen. Its ask points the agent at `.bkit/install.md` § Upgrade — already installed.
 - **A setup tip offers to send your bkit friction and stats to bkit's makers as one issue.** `bkit tips` shows `share-friction` while `.bkit/friction.jsonl` holds an `OPEN` entry that is not `consumer` scope. Its paste block, `.bkit/README.md` § Share friction with bkit, has the agent refresh `.bkit/stats.md`, strip each entry to the fields bkit needs, remove anything that names the project, show you the exact issue before posting, and then mark each entry `TRIAGED` with the issue link, so the tip returns only when new friction arrives. It never fires in bkit's own repo.
 - **`bkit ci bookkeeping-push` tells the pre-push hook when a `[skip ci]` push to an open PR is safe.** Ship's Step 8 pushes its docs, logs, ledgers and skill removals as one `[skip ci]` commit onto the PR, and the merge gate then checks CI at the last tested head (validated-head carry-forward). The hook's CI-suppressor guard blocked exactly that push, so every ship run stopped at Step 8. The hook now hands the head the remote holds to `bkit ci bookkeeping-push --from=<sha>`, which exits 0 when every file changed since that head is on ship's `--scope=pr` allow-list, and lets the push through with a line saying why; a rewritten head, a code file, or no remote head still blocks. Both hook copies carry the change. Your `.husky/pre-push` is your own copy and `bkit upgrade` never touches it: paste the `CI-suppressor HEAD guard` block and the `PUSH_BRANCH_REMOTE_SHA` lines of the ref loop from `.bkit/templates/.husky/pre-push`. #699
diff --git a/README.md b/README.md
index e490fac7c..40ab5a87d 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 70d6d544822bf4d3195bcb9e34acd54e900536af — do not edit
+  %% Generated by bkit-graphify-rollup.py from 81473759228a674d709baedef96d0a2e23032f22 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 6d5281550..362bffd3b 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -1545,7 +1545,8 @@ export const stepsCommand = {
                 if (progressNumber !== undefined && isResumable(workflow)) {
                     const step = String(f.step);
                     const recordedNumber = WORKFLOW_STEPS[workflow].find((s) => s.step === step)?.number;
-                    const gateNumber = workflow === "ship" && step === "ship-worktree-setup"
+                    const gateNumber = workflow === "ship" &&
+                        (step === "ship-worktree-setup" || step === "ship-regression-guard")
                         ? 3
                         : workflow === "ship" && step === "ship-bookkeeping-push"
                             ? 9
diff --git a/docs/capabilities.md b/docs/capabilities.md
index e577dc3c5..2f9769233 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `70d6d5448`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `814737592`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 70d6d544822bf4d3195bcb9e34acd54e900536af — do not edit
+  %% Generated by bkit-graphify-rollup.py from 81473759228a674d709baedef96d0a2e23032f22 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 70d6d544822bf4d3195bcb9e34acd54e900536af — do not edit
+  %% Generated by bkit-graphify-rollup.py from 81473759228a674d709baedef96d0a2e23032f22 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/testing.md b/docs/testing.md
index 1c268740d..032a454e6 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -661,9 +661,14 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 
 ## Key test files
 
+Workflow progress has focused Unit coverage for position math and command output, Integration coverage for real saved status/plan files and completion producers, and renderer coverage for each supported host. The external Claude app's 375px layout is an owner-run check: `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` records its procedure, screenshots and explicit outcome. A character-count assertion does not verify app typography.
+
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
+| `.bkit/core/engine/commands/workflow/step-table.test.ts` | Unit | Exact progress strings across all five workflow tables, build groups and sparse markers, changing group totals, loop backtracking, retry suffixes, ten-cell width and final-only 100%. |
+| `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | Integration | Fresh plan reads, saved-run isolation and frozen allowances, cross-run soak attempts/grants, specialized completion producers, numeric gates preserving validation and command journaling, invalid inputs and refused commits without false completion. |
+| `.bkit/core/engine/render/hosts.test.ts` | Unit | Progress narration and explicit gate numbers survive Claude, Cursor, Codex, Antigravity and opencode rendering; sole completion output remains observable. |
 | `.bkit/core/engine/commands/install/doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 and Phase 1 and Phase 3 advisory replay. |
 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | Integration | design / plan close `branches land` line run verbatim (local runtime) against a real remote + worktree: a conflict-dropped doc keeps `feat/{FID}` and leaves `dev` unmoved; another session's uncommitted edit, staged doc, local-only `dev` commit or other checked-out branch never blocks the close and is left as it was (local `dev` fast-forwards only when it can); clean close lands the branch copy, then deletes the branch. The `bkit-build.md` held close, run verbatim: origin refs unchanged, branch and worktree kept, lock released; the rows, summary and worktree-only roadmap row recorded. |
 | `.bkit/core/engine/commands/install/uninstall.test.ts` | Unit | `runUninstall` orchestrator — format-aware decision matrix (fully-managed / markered-text / byte-equal-text), dry-run, idempotency, `--nuke`; `docs/*.md` block strip (managed marker included, consumer content kept) and `docs/templates/bkit-*.md` deletion on a full uninstall only; a managed `.bkit/lite.md` block stripped with the consumer section kept. |
