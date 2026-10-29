diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 5140ce538..cdc95aaa4 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -337,7 +337,8 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -349,12 +350,18 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 8420c2fa1..2e146de24 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -337,7 +337,8 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -349,12 +350,18 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.bkit/authoring.md b/.bkit/authoring.md
index 2a996ce81..640847da5 100644
--- a/.bkit/authoring.md
+++ b/.bkit/authoring.md
@@ -109,6 +109,7 @@ Binds `.bkit/core/workflows/*.md`; § Prompts and Workflows applies on top. Step
 - **Variable references:** Standalone prose mention: backticked, sigil optional. Literal enum plain (**If** `VERDICT` = PASS). Fenced output blocks and unfenced output-template fragments: plain. Enforced by `.bkit/core/engine/audits/workflows/block-locality-audit.test.ts`.
   - **Argument placeholders:** never `$0` to `$9` or `$ARGUMENTS`, fenced or not, because the host substitutes slash-command arguments (`$N` = `$ARGUMENTS[N]`, zero-based) into these files before the model reads them. Awk field reference → `$(N)`. never the host `\$N` escape (Claude Code only). Shell positional parameters have no `$(N)` equivalent; logic taking arguments becomes a `bkit <noun> <verb>` command (§ Workflow commands), and a block passes a flag list through `set --` / `"$@"`. Enforced by `.bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts`.
   - **Variable names:** held step output = `{LOOP}_{FIELD}` in UPPER_SNAKE; prefix names the loop, not the agent (`VERIFY_FIXED` from gaps-remediate, `CHALLENGE_TASKS` from `challenge merge`); two-value flags take lowercase `true|false`.
+- **Step conditionality and rows:** The completeness check (`checks/status-holes.ts`) reads a step as conditional only when a column-0 `**Run only if**` / `**Skip if**` line sits anywhere in its section, or its heading carries a `(Path X only)` marker; a marker indented under a numbered sub-step, or in a section no step owns, marks nothing. Every step writes its own `steps finish` / `steps done` row on every route toward the next step (a no-agent skip row where no work runs), or carries a column-0 marker; a step that routes onward with no row and no marker reads as a step hole on every run.
 - **Gate items:** `- [ ]` + general prose reminder of what the step did — never a step detail (condition, path, variable, value set, field list, exit code) — `.bkit/workflows.md` § `Gates`. `- [ ] Verdict valid`, never `- [ ] Verdict valid (\`SUMMARY_VERDICT\` in \`PASS|CONCERNS|FAIL\`)`.
 - **No internal labels, no coined guard names:** NEVER cite a bkit-internal identifier (ledger key, tracker issue number, review-finding id) or a coined guard name in workflow files. Drop the label outright; the step lead-in states what the step does. Name the behaviour, never the record of it (`open-PR pre-flight`, not a finding id).
 - **Human questions:** orchestrator only, in session, never subagents; one message = every question of the round; per question `**Q{n} — {title}:** {question}` and the lettered option list `Options: A) {option} / B) {option}`, then `Recommended: A) {answer}` on its own line; options letter `A)`, `B)`, `C)` in order, a named option included (`Options: A) Accept / B) Fix now`); number from `Q1`; word each so "yes" accepts the recommendation; state what the owner must decide and what each option does, in plain English, before naming any file, test or identifier; plain text, no emoji, no host question tool; look facts up, never ask the human; narrate the round → record the wait (`bkit status row --type=owner-pause --field=reason={decision|grill|draft|loop|assumed|merge}`) → end turn → wait for answers; each reply → `bkit status row --type=owner-answer` before anything else; a step routing on the answer states the lettered-reply clause before its branches. Asking sections are prompt text: § Prompts and Workflows and § `Notation` bind them. Copy the shape from `bkit-design.md` Step 3 or `bkit-build.md` § Decision Pause.
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index a1488ce0a..f8d4fbf17 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -50,7 +50,7 @@ One file per `kind`; writers:
 | `counter` | `.bkit/stats.jsonl` | `bkit workflows close` of design / plan / build / debug / ship (attempt counters) |
 | `chat` | `harvest/stats.jsonl` (bkit repo only) | bkit's harvest script: per agent chat on the maintainer's machine, any repo or host |
 | `run` | `harvest/stats.jsonl` (bkit repo only) | Same script: per workflow run in the run logs of every repo a chat ran in |
-| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design / plan / build / debug / ship / auto) on observed friction |
+| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design / plan / build / debug / ship / auto) on observed friction; the engine itself, as the active workflow, on a bkit command's undeclared non-zero exit (`category: "tool-failure"`, `scope: "bkit-repo"`, in the active run's own book root; `BKIT_ENGINE_JOURNAL=off` disables it) |
 | `deferral` | `docs/deferrals.jsonl` | `@bkit-design-generate`, `@bkit-plan-generate`, `@bkit-plan-update`, `@bkit-debug-abort-handover`, `@bkit-ship-deferred-sweep` (adjudication only), `@bkit-utility-update-deferrals` (close / triage / locator), build orchestrator (`LOW` challenge finding → `low-severity`, through `bkit challenge merge`), ship orchestrator (assumed accept nobody confirmed → `needs-decision`, through `bkit decisions pending --defer`) |
 | `failure` | `docs/failures.jsonl` | any agent on a discovered bug; `@bkit-debug-abort-handover`; `@bkit-audit-generate` (`MEDIUM`+ findings; rerun closes rows it no longer finds); `@bkit-utility-update-failures` (close / triage / locator) |
 | `knowledge` | `docs/knowledge.jsonl` | `@bkit-build-plan-execute`, `@bkit-build-plan-gaps-remediate`, `@bkit-debug-failure-remediate` (after verified fix), `@bkit-utility-update-knowledge` (supersede / correct) |
@@ -112,7 +112,7 @@ Same name, same shape on `outcome` and `run`:
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Cursor, Antigravity); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
-| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
+| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind or the `engine-call` / `completeness` rows the engine journals after a terminator (so `afterEnd` and `scan.rows` grow without a rewind); `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
 | `feature` | `key` (the FID), `category` (§ Categories), `summary?`, `description`, `status:"DESIGNED"\|"PLANNED"\|"BUILT"\|"DEBUGGED"\|"SHIPPED"\|"ABANDONED"` (required — no severity; see `docs/roadmap.md`), `shippedAt:number?` (§ Ship Date). |
 
 ## Who Wrote It — `by.step` vs `by.subagent` vs `by.model`
@@ -260,7 +260,7 @@ Free-form; closest term, `other` if none. `deferral` + `failure` → domain set;
 | `permission-prompt` | tool / permission approval prompt |
 | `agent-rework` | agent redo / self-correction |
 | `manual-install` | manual dependency / tool install |
-| `tool-failure` | tool / command error |
+| `tool-failure` | tool / command error; the engine writes it on a bkit command's exit that is neither a shared routing code nor one of the verb's own `exitCodes`, or on a non-`CommandError` throw. `key` = `<noun>-<verb>/<step>` (`<step>` = the command's `--step=`, else `<noun>-<verb>`), kept under 60 chars because the identity-gated prune truncates a friction key at about 68; a recurrence raises `recurrenceCount` on the one row |
 | `destructive-backout` | reverted a destructive action |
 | `other` | none of the above |
 
diff --git a/.bkit/version b/.bkit/version
index b9e205b1b..c614b7e19 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "d94e1187629e6728e5a914c6a162d3d9d8a5acdb34254e454a2627f18b219cf2",
-    "docs/testing.md": "6976a1c868c1bd2905c1b01854d525c709ae46b6cb57819b24ebc086c4d127a8",
+    "docs/testing.md": "f4d8b619491b6bb1d72b826230e3517d9e2a1ba08f10b2e0af1171b9e5c21e4e",
     ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -14,7 +14,7 @@
     "docs/data-schema.md": "207fcd01c72d938f00990ac40cf6ec1083857efa2474fe248a07b4b511094c0b",
     ".gitattributes": "fd2a1fbd7dfd31e3683623eff18b939b7af64ebb9a03b0cb8a94c77e97bf8769",
     ".cursor/hooks.json": "cf9861764a08d8ad4a4892f4d097811f8f77838b16e27c140a544903a8d4bf05",
-    "docs/observability.md": "e6b52b4bed5e612398f962671f8cabac01aaa373aa711570ac7386f379748219",
+    "docs/observability.md": "d35b8ce7b8c8e9cb8be48004b45f301ca9168657c1c8eaa3a5e298b475a610b1",
     ".gitignore": "9a7f418d4a8aafbddbd9995b6a9cee5b5dc54a8ec47440263a17d388652d79e3",
     "docs/security.md": "f9c50965df581f9a17774d64ef9b98bcfe986b20a70d9c6a72d2ffaed4c470f7",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
@@ -24,7 +24,7 @@
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "ca5146835a83d6e22e28e990b11e2df619096482b02c6d6e2567592cff2bea41",
     ".claude/commands/bkit-auto.md": "0f0a4f496d1a5f4ba274c5f47e7b53df02c8bd399d18db2bdf2e1dcc0579f85b",
-    ".claude/commands/bkit-build.md": "fb18ead9f1332e42f594cf4cb75c65c2de69a6ba974feb101d8401b460be9aae",
+    ".claude/commands/bkit-build.md": "e1f8a39ee65017c7b03457b99d42d9e7b1161b7ac0d30a2a400ad21c8e7d6a63",
     ".claude/commands/bkit-debug.md": "3ea39e60edf093c00534002025ab6228e0b43ef39525c014a73ecb5ababf306c",
     ".claude/commands/bkit-design.md": "e616b8e283a066071e38521c36b6593a9dc8ffd8d130ca9ce25e4bc1d9d4c4af",
     ".claude/commands/bkit-plan.md": "b59d51054721e7050ab6f1c6ddf4a6a840018fdf3743b75eedb9c371816b6ecd",
@@ -57,7 +57,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "d404394530701291608ee60e0762a88562e72d5ab816e8d0a93928bd1778b7ae",
     ".claude/agents/bkit-utility-update-documentation.md": "4364b0fda303d45a20df44a7885ab9862ed628e0412784d8e8ae0452c536bafa",
     ".cursor/commands/bkit-auto.md": "c7529c630eab40cb88df138a386f7418e3edf02275344d430697c56a1d511a2e",
-    ".cursor/commands/bkit-build.md": "f2e78751457f61836ef344a01bf50fb47482e657cb9344abf901bcce5897c596",
+    ".cursor/commands/bkit-build.md": "fcff938a12f2bdbbb8e245eb8b472dbff214f38ec3f22bb93f3582c131400ee9",
     ".cursor/commands/bkit-debug.md": "d9e943968d0e9e9706b9e5e27977f987c20df645ef87770e1aa437ffd0cc0750",
     ".cursor/commands/bkit-design.md": "541151e4a3a4e8a46e1210be648efa2acdcd84a0ca9efcb374bc3ade64e18b58",
     ".cursor/commands/bkit-plan.md": "3386890d0ac9fb808c007c27c56a41e81af0864b6d330901751ae31aa5da73d5",
@@ -117,7 +117,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "817e890c062a40f0826b4cce33877afbb3302a23864d27fb23288b2c5c6b018b",
     ".opencode/agents/bkit-utility-update-documentation.md": "14d0908a30b0d47e9754c1802b283478eb1b57af38236530780e06b2d46bd19b",
     ".opencode/commands/bkit-auto.md": "5e8e9b3a2092de9fca48e787c3b60c33a4d86845a063a269fc6ee7a4dea13501",
-    ".opencode/commands/bkit-build.md": "0199579dbab33291e64e9a4d3b0deeacd10df1f34e646cb2599cb757cd81b60b",
+    ".opencode/commands/bkit-build.md": "229208e96a2b1630126b26b52c1310654190db03513df764d8f081cef3ee0e1a",
     ".opencode/commands/bkit-debug.md": "307cbdf5c06fb11d0ce23bb54a71ec01335d3a9e045babac6749a5d1860230a2",
     ".opencode/commands/bkit-design.md": "3578f6f648d3c75da8d7f688c3fb0112a5e02e0b17bb4a44d69b7c6bb7a9fb23",
     ".opencode/commands/bkit-plan.md": "1fb480720c705d161de7107fe388eee4e59cd611b1e686386782c91120f33b48",
@@ -224,11 +224,11 @@
     ".bkit/cloud.md": "c06cf16e2553d0e1ecfac5ae16c1ca4439c488b6eb68300cbb38b0524f72ed47",
     ".bkit/comparison.md": "55c9cc956a824f699898e66dd9a9bd7534d984d29e095187e37ed0229e9e01e5",
     ".bkit/install.md": "406ba71349bc016d164a2119eeb35836bb0451eae03b92f54e134df07e921c46",
-    ".bkit/jsonl.md": "d9fd4f0baa623a6a79232dba5758c1945180de72dcc6b3b4d8d187a2aa736e5d",
+    ".bkit/jsonl.md": "695977e48afc4615d89e9cf6fd215e04e09f0e72d2ec0f0dfd6396a398cdeb2b",
     ".bkit/providers.md": "9b1486ca46eb2ee3c6637700ddcf7e2cadf32979e85d0336c12378de23d61ca5",
     ".bkit/prompts.md": "11073ff6c2402286452b27472d8b104d89fdf34eb50080adbc3255bd795a7c11",
     ".bkit/trackers.md": "189cac5e7f50b729b2c1a3e7b7e5bee875556a227273521d904537b748e11986",
-    ".bkit/workflows.md": "fda3dcf0d10c3d4ca7a0bc9a39cc51163eb4ac18ce03bd92af972d7792fe7f93",
+    ".bkit/workflows.md": "722165e0a077da10bb82138599c974e7ce48c6225acc4a59e419b3943f083441",
     ".bkit/README.md": "530e36472878d389d8b4770ce20ff21ead9df87637da4b592e5c6c7a0be962dd",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "da12015783a8f8e31f41912ccd216ad9d5f537dd5b3c08e24f3abba6327b1a15",
@@ -265,7 +265,7 @@
     ".cursor/agents/bkit-build-plan-convert.md": "684437a0a31a15c7c5722a38cd22500935d23966fcac6ce51c9d2607f707effd",
     ".opencode/agents/bkit-build-plan-convert.md": "66a904bcc7bbba81868c30200652dbf4549bc063762246461f2b22462bc49338",
     ".codex/agents/bkit-build-plan-convert.toml": "eb153d9e55bb1bf2b3cc722aab32fcd5a738790b138e5432a789ecd31c0fe3c3",
-    ".bkit/authoring.md": "6dfadbc8b23ba89f68874e2bf8605d7b28499dc53572e19bb090c4801ef46cc6",
+    ".bkit/authoring.md": "e223ec7bbcc5860feb9ee63bd7704ac079dbdc23ab61e6f4302f9b40ec369b6b",
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "a29b576543c024b483c01683fe1b81397005a85ba95367ab18326737b9c0980e"
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 8698dc5b9..b90a105d4 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -272,6 +272,8 @@ Rationale: per-run state on `feat/{FID}` removes dev↔feat divergence at source
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
+| `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. Not folded; step minutes skip it. |
+| `completeness` | `{type, workflow, at, verdict, preJournal, journalSuspect, observed, evidenceHoles, stepHoles, unexercised, unexpected, unattributable, sourceSha}` | The run's completeness verdict, appended at close. `verdict` `CLEAN\|HOLEY` (evidence + step holes only); `preJournal` = the run has no `engine-call` rows (steps-only); `journalSuspect` = closing engine journals but recorded none. A run that closes twice carries one per close; the read path takes the last. Not folded; step minutes skip it. |
 | `ship-gate-refusal` | `{type, workflow, at, exitCode, head}` | One `bkit runs gate` refusal at Step 10, with the gate's exit code and the head it asserted against. Not folded. |
 | `ship-merge-ci` | `{type, workflow, at, sha, run, verdict, reason}` | Step 14's squash-merge CI verdict, written before routing: `verdict` `PASS|FAIL`, `reason` empty on PASS. A red merge is recorded, never inferred from a missing close row. Not folded. |
 | `ship-revalidate-timeout` | `{type, workflow, at, attempt, timeout_s}` | One Step 9 CI wait that ran out: `attempt` = polls made, `timeout_s` = seconds waited. Written by `bkit status row`, not folded. |
@@ -873,7 +875,7 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 | 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels, comments and the blocker check skipped). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Resolve `FID`, then lock (missing month bucket → current month). no commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
 | 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 7). |
 | 3 — Branch Sync | — | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). |
-| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes no row and posts no comment. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
+| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment; otherwise a skip row)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes a no-agent skip row (`build-plan-convert`, `--attempt=1`, comment `Status=skipped (plan already in task-block form)`) and goes to Step 5. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 5 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the judgement, no agent, no artifact, its own comment naming the skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 6; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 7 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 6 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
 | 7 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index ca889e692..07b30dc77 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -336,7 +336,8 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -348,12 +349,18 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 49f2c2685..7bbb1c3da 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -335,7 +335,8 @@ Build Feature — Autonomous implementation
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -347,12 +348,18 @@ Build Feature — Autonomous implementation
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 682939a5f..d4e1f8e8c 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -339,7 +339,8 @@ $ARGUMENTS
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -351,12 +352,18 @@ $ARGUMENTS
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 31438a218..07e7e7653 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -27,7 +27,7 @@
 > - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because `assert-routes-reachable.mjs` is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `b590db710`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `62346df3c`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -77,15 +77,15 @@ Not scanned; run the rollup with `--reachability`.
 
 ## Import-time side effects
 
-14 module-scope side effects in 5 of 110 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, because under Jest that is a mandatory stub in tests that never touch the thing. Sorted by reach.
+14 module-scope side effects in 5 of 112 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, because under Jest that is a mandatory stub in tests that never touch the thing. Sorted by reach.
 
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 176 | 105 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 167 | 100 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 167 | 100 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 167 | 100 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 181 | 108 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 171 | 102 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 171 | 102 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 171 | 102 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -174,8 +174,8 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from b590db710294eff96f6cb2de18a39f044f1cdaca — do not edit
-  n_bkit_core[".bkit/core<br/>2665 symbols · 121 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
+  %% Generated by bkit-graphify-rollup.py from 62346df3c8877e94e74b47d42eea89541112fd9a — do not edit
+  n_bkit_core[".bkit/core<br/>2722 symbols · 123 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   nscripts_harvest -->|21| n_bkit_core
   style n_bkit_core stroke:#65a30d,stroke-width:4px,stroke-dasharray:8 4,fill:#ffcc80,color:#1f2328
@@ -199,7 +199,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from b590db710294eff96f6cb2de18a39f044f1cdaca — do not edit
+  %% Generated by bkit-graphify-rollup.py from 62346df3c8877e94e74b47d42eea89541112fd9a — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -238,6 +238,7 @@ flowchart LR
         n_bkit_core_engine_checks_before_files["files<br/>8 symbols · 1 files"]
         n_bkit_core_engine_checks_before_repo["repo<br/>12 symbols · 1 files"]
       end
+      n_bkit_core_engine_checks_status_holes["status-holes<br/>42 symbols · 1 files"]
       subgraph gn_bkit_core_engine_checks_tips[".bkit/core/engine/checks/tips"]
         n_bkit_core_engine_checks_tips_catalogue["catalogue<br/>6 symbols · 1 files"]
         n_bkit_core_engine_checks_tips_detect["detect<br/>23 symbols · 1 files"]
@@ -248,11 +249,12 @@ flowchart LR
       n_bkit_core_engine_commands_ci_ci[".bkit/core/engine/commands/ci/ci<br/>41 symbols · 1 files"]
       n_bkit_core_engine_commands_install_doctor[".bkit/core/engine/commands/install/doctor<br/>6 symbols · 1 files"]
       n_bkit_core_engine_commands_land["land<br/>14 symbols · 1 files"]
-      n_bkit_core_engine_commands_lib["lib<br/>53 symbols · 1 files"]
+      n_bkit_core_engine_commands_lib["lib<br/>63 symbols · 1 files"]
       n_bkit_core_engine_commands_setup_setup[".bkit/core/engine/commands/setup/setup<br/>11 symbols · 1 files"]
       subgraph gn_bkit_core_engine_commands_workflow[".bkit/core/engine/commands/workflow"]
         n_bkit_core_engine_commands_workflow_branches["branches<br/>96 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_challenge["challenge<br/>34 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>86 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_counters["counters<br/>15 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_decisions["decisions<br/>27 symbols · 1 files"]
@@ -275,7 +277,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests["tests<br/>85 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>72 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_workflows["workflows<br/>81 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_workflows["workflows<br/>85 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>50 symbols · 1 files"]
       end
     end
@@ -293,6 +295,7 @@ flowchart LR
     end
     subgraph gn_bkit_core_engine_ledgers[".bkit/core/engine/ledgers"]
       n_bkit_core_engine_ledgers_compact["compact<br/>8 symbols · 1 files"]
+      n_bkit_core_engine_ledgers_journal["journal<br/>13 symbols · 1 files"]
       n_bkit_core_engine_ledgers_status["status<br/>28 symbols · 1 files"]
     end
     subgraph gn_bkit_core_engine_render[".bkit/core/engine/render"]
@@ -312,7 +315,7 @@ flowchart LR
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands_workflow_branches -->|107| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_workflows -->|77| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_workflows -->|78| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|54| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|53| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|38| n_bkit_core_engine_commands_lib
@@ -321,8 +324,8 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_issues -->|31| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_run_facts
   n_bkit_core_engine_commands_ci_ci -->|28| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_workflows -->|28| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_workflows -->|28| n_bkit_core_engine_commands_workflow_tracker
-  n_bkit_core_engine_commands_workflow_workflows -->|27| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_steps -->|26| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_context -->|24| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_status -->|24| n_bkit_core_engine_ledgers_status
@@ -331,6 +334,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_tools_instructions -->|21| n_bkit_core_engine_tools_instructions_sources
+  n_bkit_core_engine_commands_workflow_workflows -->|20| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_checks_after_index -->|19| n_bkit_core_engine_checks_after_ci_yml
   n_bkit_core_engine_commands_workflow_status -->|19| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|19| n_bkit_core_engine_commands_workflow_issues
@@ -342,7 +346,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_counters -->|17| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_branches -->|16| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_workflows -->|16| n_bkit_core_engine_ledgers_telemetry
-  n_bkit_core_engine_commands_workflow_workflows -->|16| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_install_modules_claude -->|16| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_write -->|16| n_bkit_core_engine_install_managed_block
   n_bkit_core_engine_commands_install_uninstall -->|15| n_bkit_core_engine_install_version_file
@@ -362,6 +365,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tracker -->|14| n_bkit_core_engine_ledgers_status
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_github
+  n_bkit_core_engine_commands_lib -->|13| n_bkit_core_engine_ledgers_journal
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|13| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_worktrees -->|13| n_bkit_core_engine_commands_workflow_ledgers
@@ -381,6 +385,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
+  n_bkit_core_engine_ledgers_journal -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_shared_settings -->|11| n_bkit_core_engine_install_manifest
   n_bkit_core_engine_checks_tips_catalogue -->|11| n_bkit_core_engine_checks_tips_detect
   n_bkit_core_engine_checks_before_index -->|10| n_bkit_core_engine_checks_before_context_fetch
@@ -394,6 +399,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tests -->|10| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_tracker -->|10| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_workflow_branches
+  n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_checks_status_holes
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_land
   n_bkit_core_engine_install_modules_antigravity -->|10| n_bkit_core_engine_install_modules_core
   n_bkit_core_engine_install_modules_claude -->|10| n_bkit_core_engine_install_modules_core
@@ -475,6 +481,7 @@ flowchart LR
   n_bkit_core_engine_commands_install_uninstall -->|6| n_bkit_core_engine_install_cloud_env
   n_bkit_core_engine_commands_install_upgrade -->|6| n_bkit_core_engine_shared_package_json
   n_bkit_core_engine_commands_install_upgrade -->|6| n_bkit_core_engine_install_write
+  n_bkit_core_engine_commands_lib -->|6| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_challenge -->|6| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_counters -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
@@ -487,6 +494,7 @@ flowchart LR
   n_bkit_core_engine_install_modules_antigravity -->|6| n_bkit_core_engine_render_hosts
   n_bkit_core_engine_install_modules_opencode -->|6| n_bkit_core_engine_shared_json
   n_bkit_core_engine_checks_tips_catalogue -->|6| n_bkit_core_engine_checks_before_env
+  n_bkit_core_engine_commands_workflow_completeness -->|6| n_bkit_core_engine_checks_status_holes
   style n_bkit_core_engine_checks_after_index stroke:#0f766e,stroke-width:2px
   style n_bkit_core_engine_checks_before_index stroke:#8b949e,stroke-width:2px
   style n_bkit_core_engine_cli stroke:#8b949e,stroke-width:2px
@@ -513,6 +521,7 @@ flowchart LR
   style n_bkit_core_engine_checks_before_env stroke:#c026d3,stroke-width:2px
   style n_bkit_core_engine_checks_before_files stroke:#c2410c,stroke-width:2px
   style n_bkit_core_engine_checks_before_repo stroke:#0969da,stroke-width:2px
+  style n_bkit_core_engine_checks_status_holes stroke:#65a30d,stroke-width:2px
   style n_bkit_core_engine_checks_tips_catalogue stroke:#8b949e,stroke-width:2px
   style n_bkit_core_engine_checks_tips_detect stroke:#0891b2,stroke-width:2px
   style n_bkit_core_engine_checks_tips_index stroke:#a21caf,stroke-width:2px
@@ -523,6 +532,7 @@ flowchart LR
   style n_bkit_core_engine_commands_setup_setup stroke:#8b949e,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_branches stroke:#d73a4a,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_challenge stroke:#8b949e,stroke-width:2px
+  style n_bkit_core_engine_commands_workflow_completeness stroke:#8b949e,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_context stroke:#8b949e,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_counters stroke:#8b949e,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_decisions stroke:#8b949e,stroke-width:2px
@@ -556,6 +566,7 @@ flowchart LR
   style n_bkit_core_engine_install_modules_opencode stroke:#b45309,stroke-width:2px
   style n_bkit_core_engine_install_template_copies stroke:#bf3989,stroke-width:2px
   style n_bkit_core_engine_ledgers_compact stroke:#8b949e,stroke-width:2px
+  style n_bkit_core_engine_ledgers_journal stroke:#7c3aed,stroke-width:2px
   style n_bkit_core_engine_ledgers_status stroke:#2563eb,stroke-width:2px
   style n_bkit_core_engine_render_hosts stroke:#d73a4a,stroke-width:2px
   style n_bkit_core_engine_render_models stroke:#be123c,stroke-width:2px
@@ -586,18 +597,18 @@ flowchart LR
   linkStyle 17 stroke:#b45309,stroke-width:2px
   linkStyle 18 stroke:#0e7490,stroke-width:2px
   linkStyle 19 stroke:#bf3989,stroke-width:2px
-  linkStyle 20 stroke:#9a6700,stroke-width:2px
-  linkStyle 21 stroke:#be123c,stroke-width:2px
-  linkStyle 22 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 23 stroke:#b91c1c,stroke-width:2px
-  linkStyle 24 stroke:#2563eb,stroke-width:2px
-  linkStyle 25 stroke:#be123c,stroke-width:2px
-  linkStyle 26 stroke:#0969da,stroke-width:2px
-  linkStyle 27 stroke:#0891b2,stroke-width:2px
+  linkStyle 20 stroke:#2563eb,stroke-width:2px
+  linkStyle 21 stroke:#9a6700,stroke-width:2px
+  linkStyle 22 stroke:#be123c,stroke-width:2px
+  linkStyle 23 stroke:#4d7c0f,stroke-width:2px
+  linkStyle 24 stroke:#b91c1c,stroke-width:2px
+  linkStyle 25 stroke:#2563eb,stroke-width:2px
+  linkStyle 26 stroke:#be123c,stroke-width:2px
+  linkStyle 27 stroke:#0969da,stroke-width:2px
   linkStyle 28 stroke:#0891b2,stroke-width:2px
-  linkStyle 29 stroke:#9a6700,stroke-width:2px
-  linkStyle 30 stroke:#65a30d,stroke-width:2px
-  linkStyle 31 stroke:#2563eb,stroke-width:2px
+  linkStyle 29 stroke:#0891b2,stroke-width:2px
+  linkStyle 30 stroke:#9a6700,stroke-width:2px
+  linkStyle 31 stroke:#65a30d,stroke-width:2px
   linkStyle 32 stroke:#1a7f37,stroke-width:2px
   linkStyle 33 stroke:#be123c,stroke-width:2px
   linkStyle 34 stroke:#bf3989,stroke-width:2px
@@ -617,129 +628,134 @@ flowchart LR
   linkStyle 48 stroke:#2563eb,stroke-width:2px
   linkStyle 49 stroke:#65a30d,stroke-width:2px
   linkStyle 50 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 51 stroke:#65a30d,stroke-width:2px
-  linkStyle 52 stroke:#9a6700,stroke-width:2px
-  linkStyle 53 stroke:#b45309,stroke-width:2px
-  linkStyle 54 stroke:#be123c,stroke-width:2px
-  linkStyle 55 stroke:#9a6700,stroke-width:2px
-  linkStyle 56 stroke:#be123c,stroke-width:2px
-  linkStyle 57 stroke:#bf3989,stroke-width:2px
-  linkStyle 58 stroke:#be123c,stroke-width:2px
+  linkStyle 51 stroke:#7c3aed,stroke-width:2px
+  linkStyle 52 stroke:#65a30d,stroke-width:2px
+  linkStyle 53 stroke:#9a6700,stroke-width:2px
+  linkStyle 54 stroke:#b45309,stroke-width:2px
+  linkStyle 55 stroke:#be123c,stroke-width:2px
+  linkStyle 56 stroke:#9a6700,stroke-width:2px
+  linkStyle 57 stroke:#be123c,stroke-width:2px
+  linkStyle 58 stroke:#bf3989,stroke-width:2px
   linkStyle 59 stroke:#be123c,stroke-width:2px
   linkStyle 60 stroke:#be123c,stroke-width:2px
   linkStyle 61 stroke:#be123c,stroke-width:2px
-  linkStyle 62 stroke:#65a30d,stroke-width:2px
-  linkStyle 63 stroke:#5b8c00,stroke-width:2px
-  linkStyle 64 stroke:#1a7f37,stroke-width:2px
-  linkStyle 65 stroke:#b45309,stroke-width:2px
-  linkStyle 66 stroke:#0891b2,stroke-width:2px
-  linkStyle 67 stroke:#be123c,stroke-width:2px
+  linkStyle 62 stroke:#be123c,stroke-width:2px
+  linkStyle 63 stroke:#65a30d,stroke-width:2px
+  linkStyle 64 stroke:#5b8c00,stroke-width:2px
+  linkStyle 65 stroke:#1a7f37,stroke-width:2px
+  linkStyle 66 stroke:#b45309,stroke-width:2px
+  linkStyle 67 stroke:#0891b2,stroke-width:2px
   linkStyle 68 stroke:#be123c,stroke-width:2px
-  linkStyle 69 stroke:#5b8c00,stroke-width:2px
-  linkStyle 70 stroke:#b45309,stroke-width:2px
-  linkStyle 71 stroke:#0891b2,stroke-width:2px
-  linkStyle 72 stroke:#a21caf,stroke-width:2px
-  linkStyle 73 stroke:#b45309,stroke-width:2px
-  linkStyle 74 stroke:#be123c,stroke-width:2px
-  linkStyle 75 stroke:#2563eb,stroke-width:2px
-  linkStyle 76 stroke:#0891b2,stroke-width:2px
-  linkStyle 77 stroke:#9a6700,stroke-width:2px
+  linkStyle 69 stroke:#be123c,stroke-width:2px
+  linkStyle 70 stroke:#5b8c00,stroke-width:2px
+  linkStyle 71 stroke:#65a30d,stroke-width:2px
+  linkStyle 72 stroke:#b45309,stroke-width:2px
+  linkStyle 73 stroke:#0891b2,stroke-width:2px
+  linkStyle 74 stroke:#a21caf,stroke-width:2px
+  linkStyle 75 stroke:#b45309,stroke-width:2px
+  linkStyle 76 stroke:#be123c,stroke-width:2px
+  linkStyle 77 stroke:#2563eb,stroke-width:2px
   linkStyle 78 stroke:#0891b2,stroke-width:2px
-  linkStyle 79 stroke:#b45309,stroke-width:2px
+  linkStyle 79 stroke:#9a6700,stroke-width:2px
   linkStyle 80 stroke:#0891b2,stroke-width:2px
-  linkStyle 81 stroke:#d73a4a,stroke-width:2px
-  linkStyle 82 stroke:#d73a4a,stroke-width:2px
-  linkStyle 83 stroke:#b91c1c,stroke-width:2px
-  linkStyle 84 stroke:#c026d3,stroke-width:2px
-  linkStyle 85 stroke:#c026d3,stroke-width:2px
-  linkStyle 86 stroke:#c026d3,stroke-width:2px
-  linkStyle 87 stroke:#1a7f37,stroke-width:2px
+  linkStyle 81 stroke:#b45309,stroke-width:2px
+  linkStyle 82 stroke:#0891b2,stroke-width:2px
+  linkStyle 83 stroke:#d73a4a,stroke-width:2px
+  linkStyle 84 stroke:#d73a4a,stroke-width:2px
+  linkStyle 85 stroke:#65a30d,stroke-width:2px
+  linkStyle 86 stroke:#b91c1c,stroke-width:2px
+  linkStyle 87 stroke:#c026d3,stroke-width:2px
   linkStyle 88 stroke:#c026d3,stroke-width:2px
   linkStyle 89 stroke:#c026d3,stroke-width:2px
-  linkStyle 90 stroke:#c026d3,stroke-width:2px
-  linkStyle 91 stroke:#9a6700,stroke-width:2px
+  linkStyle 90 stroke:#1a7f37,stroke-width:2px
+  linkStyle 91 stroke:#c026d3,stroke-width:2px
   linkStyle 92 stroke:#c026d3,stroke-width:2px
   linkStyle 93 stroke:#c026d3,stroke-width:2px
-  linkStyle 94 stroke:#c2410c,stroke-width:2px
-  linkStyle 95 stroke:#0f766e,stroke-width:2px
-  linkStyle 96 stroke:#a21caf,stroke-width:2px
-  linkStyle 97 stroke:#2563eb,stroke-width:2px
-  linkStyle 98 stroke:#be123c,stroke-width:2px
-  linkStyle 99 stroke:#c2410c,stroke-width:2px
+  linkStyle 94 stroke:#9a6700,stroke-width:2px
+  linkStyle 95 stroke:#c026d3,stroke-width:2px
+  linkStyle 96 stroke:#c026d3,stroke-width:2px
+  linkStyle 97 stroke:#c2410c,stroke-width:2px
+  linkStyle 98 stroke:#0f766e,stroke-width:2px
+  linkStyle 99 stroke:#a21caf,stroke-width:2px
   linkStyle 100 stroke:#2563eb,stroke-width:2px
-  linkStyle 101 stroke:#d73a4a,stroke-width:2px
-  linkStyle 102 stroke:#0891b2,stroke-width:2px
-  linkStyle 103 stroke:#be123c,stroke-width:2px
-  linkStyle 104 stroke:#c2410c,stroke-width:2px
-  linkStyle 105 stroke:#5b8c00,stroke-width:2px
-  linkStyle 106 stroke:#5b8c00,stroke-width:2px
-  linkStyle 107 stroke:#5b8c00,stroke-width:2px
-  linkStyle 108 stroke:#d73a4a,stroke-width:2px
-  linkStyle 109 stroke:#bf3989,stroke-width:2px
+  linkStyle 101 stroke:#be123c,stroke-width:2px
+  linkStyle 102 stroke:#c2410c,stroke-width:2px
+  linkStyle 103 stroke:#2563eb,stroke-width:2px
+  linkStyle 104 stroke:#d73a4a,stroke-width:2px
+  linkStyle 105 stroke:#0891b2,stroke-width:2px
+  linkStyle 106 stroke:#be123c,stroke-width:2px
+  linkStyle 107 stroke:#c2410c,stroke-width:2px
+  linkStyle 108 stroke:#5b8c00,stroke-width:2px
+  linkStyle 109 stroke:#5b8c00,stroke-width:2px
   linkStyle 110 stroke:#5b8c00,stroke-width:2px
-  linkStyle 111 stroke:#5b8c00,stroke-width:2px
-  linkStyle 112 stroke:#c2410c,stroke-width:2px
-  linkStyle 113 stroke:#c2410c,stroke-width:2px
-  linkStyle 114 stroke:#bf3989,stroke-width:2px
-  linkStyle 115 stroke:#a21caf,stroke-width:2px
-  linkStyle 116 stroke:#1a7f37,stroke-width:2px
-  linkStyle 117 stroke:#1a7f37,stroke-width:2px
-  linkStyle 118 stroke:#5b8c00,stroke-width:2px
-  linkStyle 119 stroke:#b45309,stroke-width:2px
-  linkStyle 120 stroke:#9a6700,stroke-width:2px
-  linkStyle 121 stroke:#a21caf,stroke-width:2px
-  linkStyle 122 stroke:#0891b2,stroke-width:2px
-  linkStyle 123 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 124 stroke:#0891b2,stroke-width:2px
-  linkStyle 125 stroke:#b45309,stroke-width:2px
-  linkStyle 126 stroke:#65a30d,stroke-width:2px
-  linkStyle 127 stroke:#5b8c00,stroke-width:2px
-  linkStyle 128 stroke:#0f766e,stroke-width:2px
-  linkStyle 129 stroke:#c026d3,stroke-width:2px
-  linkStyle 130 stroke:#c026d3,stroke-width:2px
-  linkStyle 131 stroke:#b45309,stroke-width:2px
-  linkStyle 132 stroke:#b45309,stroke-width:2px
-  linkStyle 133 stroke:#be123c,stroke-width:2px
-  linkStyle 134 stroke:#5b8c00,stroke-width:2px
-  linkStyle 135 stroke:#c026d3,stroke-width:2px
-  linkStyle 136 stroke:#bf3989,stroke-width:2px
-  linkStyle 137 stroke:#0e7490,stroke-width:2px
-  linkStyle 138 stroke:#0e7490,stroke-width:2px
-  linkStyle 139 stroke:#be123c,stroke-width:2px
-  linkStyle 140 stroke:#be123c,stroke-width:2px
-  linkStyle 141 stroke:#0891b2,stroke-width:2px
+  linkStyle 111 stroke:#d73a4a,stroke-width:2px
+  linkStyle 112 stroke:#bf3989,stroke-width:2px
+  linkStyle 113 stroke:#5b8c00,stroke-width:2px
+  linkStyle 114 stroke:#5b8c00,stroke-width:2px
+  linkStyle 115 stroke:#c2410c,stroke-width:2px
+  linkStyle 116 stroke:#c2410c,stroke-width:2px
+  linkStyle 117 stroke:#bf3989,stroke-width:2px
+  linkStyle 118 stroke:#a21caf,stroke-width:2px
+  linkStyle 119 stroke:#1a7f37,stroke-width:2px
+  linkStyle 120 stroke:#1a7f37,stroke-width:2px
+  linkStyle 121 stroke:#5b8c00,stroke-width:2px
+  linkStyle 122 stroke:#b45309,stroke-width:2px
+  linkStyle 123 stroke:#9a6700,stroke-width:2px
+  linkStyle 124 stroke:#a21caf,stroke-width:2px
+  linkStyle 125 stroke:#0891b2,stroke-width:2px
+  linkStyle 126 stroke:#4d7c0f,stroke-width:2px
+  linkStyle 127 stroke:#0891b2,stroke-width:2px
+  linkStyle 128 stroke:#b45309,stroke-width:2px
+  linkStyle 129 stroke:#65a30d,stroke-width:2px
+  linkStyle 130 stroke:#5b8c00,stroke-width:2px
+  linkStyle 131 stroke:#0f766e,stroke-width:2px
+  linkStyle 132 stroke:#c026d3,stroke-width:2px
+  linkStyle 133 stroke:#c026d3,stroke-width:2px
+  linkStyle 134 stroke:#b45309,stroke-width:2px
+  linkStyle 135 stroke:#b45309,stroke-width:2px
+  linkStyle 136 stroke:#be123c,stroke-width:2px
+  linkStyle 137 stroke:#5b8c00,stroke-width:2px
+  linkStyle 138 stroke:#c026d3,stroke-width:2px
+  linkStyle 139 stroke:#bf3989,stroke-width:2px
+  linkStyle 140 stroke:#0e7490,stroke-width:2px
+  linkStyle 141 stroke:#0e7490,stroke-width:2px
   linkStyle 142 stroke:#be123c,stroke-width:2px
-  linkStyle 143 stroke:#9a6700,stroke-width:2px
-  linkStyle 144 stroke:#b45309,stroke-width:2px
-  linkStyle 145 stroke:#5b8c00,stroke-width:2px
+  linkStyle 143 stroke:#be123c,stroke-width:2px
+  linkStyle 144 stroke:#0891b2,stroke-width:2px
+  linkStyle 145 stroke:#be123c,stroke-width:2px
   linkStyle 146 stroke:#9a6700,stroke-width:2px
-  linkStyle 147 stroke:#0e7490,stroke-width:2px
-  linkStyle 148 stroke:#2563eb,stroke-width:2px
-  linkStyle 149 stroke:#1a7f37,stroke-width:2px
-  linkStyle 150 stroke:#d73a4a,stroke-width:2px
-  linkStyle 151 stroke:#bf3989,stroke-width:2px
-  linkStyle 152 stroke:#5b8c00,stroke-width:2px
-  linkStyle 153 stroke:#0891b2,stroke-width:2px
-  linkStyle 154 stroke:#d73a4a,stroke-width:2px
+  linkStyle 147 stroke:#b45309,stroke-width:2px
+  linkStyle 148 stroke:#5b8c00,stroke-width:2px
+  linkStyle 149 stroke:#9a6700,stroke-width:2px
+  linkStyle 150 stroke:#0e7490,stroke-width:2px
+  linkStyle 151 stroke:#2563eb,stroke-width:2px
+  linkStyle 152 stroke:#1a7f37,stroke-width:2px
+  linkStyle 153 stroke:#d73a4a,stroke-width:2px
+  linkStyle 154 stroke:#bf3989,stroke-width:2px
   linkStyle 155 stroke:#5b8c00,stroke-width:2px
-  linkStyle 156 stroke:#d73a4a,stroke-width:2px
-  linkStyle 157 stroke:#be123c,stroke-width:2px
-  linkStyle 158 stroke:#d73a4a,stroke-width:2px
-  linkStyle 159 stroke:#be123c,stroke-width:2px
-  linkStyle 160 stroke:#d73a4a,stroke-width:2px
-  linkStyle 161 stroke:#bf3989,stroke-width:2px
-  linkStyle 162 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 163 stroke:#1a7f37,stroke-width:2px
-  linkStyle 164 stroke:#8250df,stroke-width:2px
-  linkStyle 165 stroke:#9a6700,stroke-width:2px
-  linkStyle 166 stroke:#9a6700,stroke-width:2px
-  linkStyle 167 stroke:#0891b2,stroke-width:2px
-  linkStyle 168 stroke:#9a6700,stroke-width:2px
-  linkStyle 169 stroke:#1d4ed8,stroke-width:2px
-  linkStyle 170 stroke:#bf3989,stroke-width:2px
-  linkStyle 171 stroke:#5b8c00,stroke-width:2px
-  linkStyle 172 stroke:#5b8c00,stroke-width:2px
-  linkStyle 173 stroke:#d73a4a,stroke-width:2px
-  linkStyle 174 stroke:#d73a4a,stroke-width:2px
-  linkStyle 175 stroke:#c026d3,stroke-width:2px
+  linkStyle 156 stroke:#0891b2,stroke-width:2px
+  linkStyle 157 stroke:#d73a4a,stroke-width:2px
+  linkStyle 158 stroke:#5b8c00,stroke-width:2px
+  linkStyle 159 stroke:#d73a4a,stroke-width:2px
+  linkStyle 160 stroke:#be123c,stroke-width:2px
+  linkStyle 161 stroke:#d73a4a,stroke-width:2px
+  linkStyle 162 stroke:#be123c,stroke-width:2px
+  linkStyle 163 stroke:#d73a4a,stroke-width:2px
+  linkStyle 164 stroke:#bf3989,stroke-width:2px
+  linkStyle 165 stroke:#4d7c0f,stroke-width:2px
+  linkStyle 166 stroke:#1a7f37,stroke-width:2px
+  linkStyle 167 stroke:#65a30d,stroke-width:2px
+  linkStyle 168 stroke:#8250df,stroke-width:2px
+  linkStyle 169 stroke:#9a6700,stroke-width:2px
+  linkStyle 170 stroke:#9a6700,stroke-width:2px
+  linkStyle 171 stroke:#0891b2,stroke-width:2px
+  linkStyle 172 stroke:#9a6700,stroke-width:2px
+  linkStyle 173 stroke:#1d4ed8,stroke-width:2px
+  linkStyle 174 stroke:#bf3989,stroke-width:2px
+  linkStyle 175 stroke:#5b8c00,stroke-width:2px
+  linkStyle 176 stroke:#5b8c00,stroke-width:2px
+  linkStyle 177 stroke:#d73a4a,stroke-width:2px
+  linkStyle 178 stroke:#d73a4a,stroke-width:2px
+  linkStyle 179 stroke:#c026d3,stroke-width:2px
+  linkStyle 180 stroke:#65a30d,stroke-width:2px
 ```
diff --git a/docs/testing.md b/docs/testing.md
index e97c571d6..fe3507473 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -253,7 +253,7 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) is the per-featur
 
 `/bkit-build` writes each task's tests before its code and proves them: each test fails against stubs (red), then passes once the code exists (green). Unit and integration tiers only; E2E and `@live` rows run in CI and stay planned in the `Derived Test Matrix`. Each plan task names its tests on a `**Test first:**` line (`;`-separated), or `n/a — {reason}`.
 
-- **Declare `bkit:test:file`:** runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"` (this repo's `scripts/ci/test-file.sh` also routes a `*.bats` file to `bats --report-formatter junit`); pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`; jest needs the `jest-junit` reporter. Undeclared → build reports test-first as not enforced.
+- **Declare `bkit:test:file`:** runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"`; pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`; jest needs the `jest-junit` reporter. Undeclared → build reports test-first as not enforced.
 - **Declare `bkit:lint:file`:** lints the ONE test file bkit appends (repo-relative path) with the static gate's linter config, exit 0 when clean. ESLint: `eslint --max-warnings=0`; Ruff: `ruff check`. Build lints each new test before its red; undeclared → the red is recorded unlinted, and a lint rewrite after it reads as an edited test.
 - **Call the runner directly:** a task runner that caches results or runs dependent packages' suites first breaks the one-file contract. A monorepo routes the path to the package and config owning it; an integration file gets the same environment setup the integration suite gets.
 - **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero like a real failure. A red counts only when the named test ran and failed; green only when it ran and passed.
