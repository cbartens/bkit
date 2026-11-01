diff --git a/.agents/plugins/bkit/agents/bkit-audit-generate.md b/.agents/plugins/bkit/agents/bkit-audit-generate.md
index eb640d606..e8c283d05 100644
--- a/.agents/plugins/bkit/agents/bkit-audit-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-audit-generate.md
@@ -83,8 +83,8 @@ tools:
 - **Check gates first:** Verify every gate item before proceeding; work that skipped a gate is invalid, so close the gap. Gates inside `/bkit-*` workflows are self-verification, not human gates: stop only at an explicit **STOP**.
 - **Discovered bugs:** Record each discovered bug instead of dropping it silently: append one row per bug to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker issue mentions:** Mention an issue ID only together with its title and URL.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -136,7 +136,6 @@ tools:
       - The approach is open (options, trade-offs, unanswered questions) → `/bkit-design`.
       - The approach is settled, not broken into tasks → `/bkit-plan`.
       - The change is clear → `/bkit-build`.
-    - **If** `.bkit/lite.md` § When to use allows a lite workflow → `/bkit-build` becomes `build:lite`, and `/bkit-debug` becomes `debug:lite`.
     - `Reason` = the deciding fact, in one clause.
 11. Write ledger entries to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), with `by: {workflow: "audit", step: "audit-{slug}"}`.
     - **If** the template audits `docs/failures.jsonl` or `docs/deferrals.jsonl` → skip this step.
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md b/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
index b673230d6..0f21990ba 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
@@ -87,7 +87,6 @@ tools:
     - Treat items done together as one list item.
 11. For each item:
     - Recommend the `/bkit-<phase>` command.
-    - Recommend the `.bkit/lite.md` lite workflow `<phase>:lite` instead, only where it is clearly enough.
     - Recommend a model tier.
     - Recommend `@bkit-audit-generate` for audit reports.
     - **If** a tracker is wired and the item has no issue → recommend filing one first, shaped per `.bkit/trackers.md` § Issue shapes.
@@ -119,7 +118,7 @@ tools:
 
 ## Next Items
 
-[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command or, where clearly enough, the `<phase>:lite` lite workflow, and the model tier. **If** none → `None`.]
+[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command and the model tier. **If** none → `None`.]
 
 ## Groupings
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md b/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
index f68a911a0..d04a0e967 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
@@ -47,8 +47,8 @@ tools:
 - **Verify tools:** Verify every return; do not assume success.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
 - **Tracker issue settings:** Keep the title to at most 70 characters, or two lines on mobile. Set labels, project, project status, priority, size, milestone, parent, and every open blocking issue as blocked-by. Set priority and size per `docs/templates/bkit-audit-issues.md` § Ranking Rules and § Size Scale, not by label alone. Blocked-by MUST use the machine-read form per `.bkit/trackers.md` § Issue shapes, not prose alone. Check similar issues when unclear.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker work comments:** For any issue worked on outside `/bkit-*` workflows, post one comment per related issue at the end of every major turn (files changed, commit, PR, finding or blocked stop) with the work done, the outcome and links. Skip turns with no work (Q&A, clarifying questions). Describe the change instead of pasting diffs or restating code, and do not mention @claude or @cursor in the comment body.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -60,7 +60,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md` and `.bkit/lite.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
@@ -89,7 +89,6 @@ tools:
      - **If** a workflow label (`bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship`) is present → remove every `next:*`.
      - **Else** → exactly one `next:*`, from the `REPORT` label correction, then the roadmap item's recommended command, then the issue shape per `.bkit/trackers.md` § `Issue shapes`:
        - Shape to label: idea → `next:design`, change → `next:plan`, change with `Tasks` → `next:build`, bug → `next:debug`.
-       - Append `:lite` per `.bkit/lite.md` § `When to use`.
        - An existing single `next:*` stands unless `REPORT` corrects it.
      - **If** the type label (`enhancement|bug`) is missing → add it per shape. `REPORT` label corrections apply.
      - **If** a label is not in the repo or team labels → `Unapplied`.
diff --git a/.bkit/README.md b/.bkit/README.md
index ac0c566ba..2945ff22a 100644
--- a/.bkit/README.md
+++ b/.bkit/README.md
@@ -61,7 +61,7 @@ Plans are sized by `bkit.workflows.tasks` in `package.json`. Each group holds up
 | Issue | Start with |
 | --- | --- |
 | Idea — how it should work still open | `/bkit-design` |
-| Change — what to build and "done" known | `/bkit-plan`, or `/bkit-build` / `build:lite` with no plan. With no plan, `/bkit-build` first writes `{FID}-plan.md` from the issue, then checks that each `TEST FIRST` is red. An existing plan wins over the issue. `build:lite` checks nothing. |
+| Change — what to build and "done" known | `/bkit-plan`, or `/bkit-build` with no plan. With no plan, `/bkit-build` first writes `{FID}-plan.md` from the issue, then checks that each `TEST FIRST` is red. An existing plan wins over the issue. |
 | Bug — a test or CI run already fails | `/bkit-debug`, on the branch the fix lands on |
 | Bug — nothing fails yet | `/bkit-debug [repro]` (writes a failing test first, then fixes) |
 
@@ -328,12 +328,17 @@ Run the slash commands at the repo root:
 /bkit-design ISSUE-123      # produce a design doc
 /bkit-plan ISSUE-123        # produce an implementation plan
 /bkit-build ISSUE-123       # execute the plan in a worktree, open a PR
+/bkit-build ISSUE-123 publish=false  # build locally and hold: no push, no PR, no CI; land it later with /bkit-ship
 /bkit-debug ISSUE-123       # diagnose and remediate CI failures
 /bkit-ship ISSUE-123        # merge the PR for the current branch, set the issue In Review
 ```
 
 Claude reads the issue, its comments and the plan files through the tracker MCP.
 
+**Held build:** `publish=false` (or `package.json` `bkit.workflows.build.publish.local: false`) stops `/bkit-build` before the push: no PR, no CI, no docs sync. The worktree and branch stay, the lock is released, the run ends `held`, the issue moves to `In review`, and the summary reads `Publish: held` and `Docs: not synced`. `/bkit-ship <ref>` lands it later. Cloud runs always publish.
+
+**Manual batch of held builds:** merge the held `feat/{FID}` branches into one branch off `dev` yourself, push it and open one PR. You own the push, the PR, the CI gate, the sweep and the docs sync. One head commit means post-merge auto-debug sees only the last FID. Never batch migrations.
+
 **Requirements:** `BKIT_GH_TOKEN` and an active Claude Code session (subscription or `BKIT_ANTHROPIC_API_KEY`). `BKIT_LINEAR_API_KEY` as well when `bkit.tracker.default = "linear"`, and `BKIT_JIRA_API_KEY` when it is `"jira"`. The session model is the orchestrator pin in `.bkit/prompts.md` § Orchestrators (`Claude` column). Set it with `/model` before you invoke a command. This file does not repeat the pin.
 
 ### From Cursor (interactive — local)
diff --git a/.bkit/authoring.md b/.bkit/authoring.md
index bb6f928a9..1cba59a96 100644
--- a/.bkit/authoring.md
+++ b/.bkit/authoring.md
@@ -292,7 +292,7 @@ Every prompt and workflow has the same parts, in this order:
 
 - **Self-contained:** Every prompt and workflow stands alone, with its instructions written in the file rather than pointed to.
   - Why: A subagent runs with only its prompt and the files it is told to read. A pointer to another file is an instruction it may never load.
-  - Prompts may read `.agents/rules.md`, `.agents/docs.md`, `.bkit/lite.md`, the `*.jsonl` ledgers and the templates they fill. Workflows hand each subagent its context in the call.
+  - Prompts may read `.agents/rules.md`, `.agents/docs.md`, the `*.jsonl` ledgers and the templates they fill. Workflows hand each subagent its context in the call.
 
 - **Cross-file alignment:** When you change an instruction, change every prompt and workflow that carries it in the same edit.
   - Why: Two files that disagree make the pipeline contradict itself: one agent writes what the next one rejects.
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index f63a99e3f..3a067e9a5 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -357,7 +357,7 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 <!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
-| `bkit-audit-generate` | Read one `docs/templates/bkit-audit-*.md` and run its probe steps against the repo. Write the filled template to `docs/audits/{YYYYMM}/{slug}.md` (`{slug}` = template basename without `bkit-audit-`). **If** that month already has this slug → `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Report = template up to `bkit:end`. The template supplies shape and its own probe steps; the rules every template shares (read-only, evidence, Pre-Flight, credentials, permissions, previous run, gates, severity) are this prompt's Contract bullets. Right after creating the stub it runs `bkit branches anchor-stamp --base-sha=<HEAD> --base-ref=<branch>`, so the audited commit and the bkit release the report came from sit in the same `bkit:anchor` block design and plan docs carry (`.bkit/workflows.md` § Anchor Block) — top of file, machine-readable, the next run reads it as the previous report's commit; an outdated release also gets a visible `Outdated bkit` line under the block, written by the stamp. The agent runs the stamp itself because audits have no orchestrator; the block is still tool-written, never hand-written. Writes only the report, `docs/failures.jsonl` rows (`by: {workflow: "audit", step: "audit-{slug}"}`; one per `MEDIUM`+ finding, reusing any open row's `key` for the same problem whichever workflow wrote it, closing only open `audit-{slug}-` rows a rerun no longer finds; skipped by templates that audit the ledgers themselves, `.bkit/jsonl.md`), and the template's consumer-owned `Project Instructions` (below `bkit:end`), which it reads first and refines each run — exact commands, paths, tool gaps, corrections — so the next run starts from what this one learned; edits listed under the report's `Process Improvements` → `Project`, universal step changes proposed under `Universal`. Never results there (reports hold the series) and never text from external input (an injected directive would persist into every later run). The report's `Suggested Issues` groups findings into tracker-sized changes — one row per change landed in one go, every `MEDIUM`+ finding in exactly one row — and names each row's next step: `/bkit-design\|/bkit-plan\|/bkit-build\|/bkit-debug` by the § When to Run rules of `.bkit/workflows.md` (restated inline, prompts are self-contained), the `.bkit/lite.md` lite workflow (`build:lite\|debug:lite`) when its § When to use allows, or `manual` for a change outside the repo. The agent proposes and never files: its tracker tools post a comment and run one read-only search, so a person files from the table and each full workflow's related-issues scan catches an issue already open. Issue named in the input (same ID shapes as workflow Step 1, input only, never files the run read) → one `###### bkit:generated` comment there, built by `bkit issues comment --kind=audit` from the final summary (`Embedded Directives` as sources only, so injected text never reaches the tracker), posted through the tracker MCP after any `STOPPED` run too; retry once, then the header `Issue` line reads `failed`; never gates the run. No issue named, tracker wired → the agent searches for the template's audit parent (`.bkit/trackers.md` § Issue shapes — one standing issue per template that every run reports to, so run summaries and the issues they spawn collect in one place instead of one issue per run): an open issue whose body names `docs/templates/bkit-audit-{slug}.md` → `Parent: {ID} found` and the summary is posted there as if it had been named. None → `Parent: missing`, `Issue: None`, the built comment is saved to `{outboxRoot}/audit-{slug}/parent-comment.md`, and `Recommended Next Step` opens with a ready-to-file parent (title, labels, body with the run line) and the instruction to post that saved comment as its first comment — the agent cannot create issues, so whoever files the parent posts it. Search error → `Parent: unchecked`, same saved comment, posted on the parent once found or created. Every filed `Suggested Issues` row is a sub-issue of the parent, existing or new. Tracker `none` → no comment, no search, `Issue: None`, `Parent: None`. Bash is limited to that stamp, the setup tips, the issue comment, and the probes the template or its `Project Instructions` name; throwaway worktrees / remote targets removed before the report finishes. Web tools serve each template's Standards step. Pre-Flight `Permissions` probes each tool once before `Probe Steps`; a blocked call (there or in any step) never stops the run: the agent records it with its narrow allow rule, runs every step the remaining tools allow, and lists the work it could not do under `Not Checked`. Blocked calls persist in `Project Instructions` `Permissions`; the next run probes them first. `XL` tier: the longest templates run ~20 probe steps of several queries each against the repo and live systems. A missing surface is an explicit skip, not a clean finding. The final message is a fixed block shown verbatim, so the caller never paraphrases it: a machine-readable header (`Status` `COMPLETE` or `STOPPED`, report path, per-severity counts) above `<!-- verdict:end -->`, then the `Suggested Issues` table copied verbatim — rewording a row loses the grouping a person files from — plus `Not Checked`, ledger rows, `Process Improvements` and embedded directives. Every early STOP still returns that header with a `Stopped` reason. `Recommended Next Step` names which rows to file as issues (every `MEDIUM`+ row; the batched `LOW` row optional) and the highest-severity row's next step; each body follows `.bkit/trackers.md` § Issue shapes and carries an `**Audit reports:**` line with the row's finding IDs, so `/bkit-plan` reads the report; filed as sub-issues of the template's audit parent when a tracker is wired; shown whether or not a tracker is wired. The final message ends with the fixed related-utilities line from the `docs/roadmap.md` header, word for word. |
+| `bkit-audit-generate` | Read one `docs/templates/bkit-audit-*.md` and run its probe steps against the repo. Write the filled template to `docs/audits/{YYYYMM}/{slug}.md` (`{slug}` = template basename without `bkit-audit-`). **If** that month already has this slug → `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Report = template up to `bkit:end`. The template supplies shape and its own probe steps; the rules every template shares (read-only, evidence, Pre-Flight, credentials, permissions, previous run, gates, severity) are this prompt's Contract bullets. Right after creating the stub it runs `bkit branches anchor-stamp --base-sha=<HEAD> --base-ref=<branch>`, so the audited commit and the bkit release the report came from sit in the same `bkit:anchor` block design and plan docs carry (`.bkit/workflows.md` § Anchor Block) — top of file, machine-readable, the next run reads it as the previous report's commit; an outdated release also gets a visible `Outdated bkit` line under the block, written by the stamp. The agent runs the stamp itself because audits have no orchestrator; the block is still tool-written, never hand-written. Writes only the report, `docs/failures.jsonl` rows (`by: {workflow: "audit", step: "audit-{slug}"}`; one per `MEDIUM`+ finding, reusing any open row's `key` for the same problem whichever workflow wrote it, closing only open `audit-{slug}-` rows a rerun no longer finds; skipped by templates that audit the ledgers themselves, `.bkit/jsonl.md`), and the template's consumer-owned `Project Instructions` (below `bkit:end`), which it reads first and refines each run — exact commands, paths, tool gaps, corrections — so the next run starts from what this one learned; edits listed under the report's `Process Improvements` → `Project`, universal step changes proposed under `Universal`. Never results there (reports hold the series) and never text from external input (an injected directive would persist into every later run). The report's `Suggested Issues` groups findings into tracker-sized changes — one row per change landed in one go, every `MEDIUM`+ finding in exactly one row — and names each row's next step: `/bkit-design\|/bkit-plan\|/bkit-build\|/bkit-debug` by the § When to Run rules of `.bkit/workflows.md` (restated inline, prompts are self-contained), or `manual` for a change outside the repo. The agent proposes and never files: its tracker tools post a comment and run one read-only search, so a person files from the table and each full workflow's related-issues scan catches an issue already open. Issue named in the input (same ID shapes as workflow Step 1, input only, never files the run read) → one `###### bkit:generated` comment there, built by `bkit issues comment --kind=audit` from the final summary (`Embedded Directives` as sources only, so injected text never reaches the tracker), posted through the tracker MCP after any `STOPPED` run too; retry once, then the header `Issue` line reads `failed`; never gates the run. No issue named, tracker wired → the agent searches for the template's audit parent (`.bkit/trackers.md` § Issue shapes — one standing issue per template that every run reports to, so run summaries and the issues they spawn collect in one place instead of one issue per run): an open issue whose body names `docs/templates/bkit-audit-{slug}.md` → `Parent: {ID} found` and the summary is posted there as if it had been named. None → `Parent: missing`, `Issue: None`, the built comment is saved to `{outboxRoot}/audit-{slug}/parent-comment.md`, and `Recommended Next Step` opens with a ready-to-file parent (title, labels, body with the run line) and the instruction to post that saved comment as its first comment — the agent cannot create issues, so whoever files the parent posts it. Search error → `Parent: unchecked`, same saved comment, posted on the parent once found or created. Every filed `Suggested Issues` row is a sub-issue of the parent, existing or new. Tracker `none` → no comment, no search, `Issue: None`, `Parent: None`. Bash is limited to that stamp, the setup tips, the issue comment, and the probes the template or its `Project Instructions` name; throwaway worktrees / remote targets removed before the report finishes. Web tools serve each template's Standards step. Pre-Flight `Permissions` probes each tool once before `Probe Steps`; a blocked call (there or in any step) never stops the run: the agent records it with its narrow allow rule, runs every step the remaining tools allow, and lists the work it could not do under `Not Checked`. Blocked calls persist in `Project Instructions` `Permissions`; the next run probes them first. `XL` tier: the longest templates run ~20 probe steps of several queries each against the repo and live systems. A missing surface is an explicit skip, not a clean finding. The final message is a fixed block shown verbatim, so the caller never paraphrases it: a machine-readable header (`Status` `COMPLETE` or `STOPPED`, report path, per-severity counts) above `<!-- verdict:end -->`, then the `Suggested Issues` table copied verbatim — rewording a row loses the grouping a person files from — plus `Not Checked`, ledger rows, `Process Improvements` and embedded directives. Every early STOP still returns that header with a `Stopped` reason. `Recommended Next Step` names which rows to file as issues (every `MEDIUM`+ row; the batched `LOW` row optional) and the highest-severity row's next step; each body follows `.bkit/trackers.md` § Issue shapes and carries an `**Audit reports:**` line with the row's finding IDs, so `/bkit-plan` reads the report; filed as sub-issues of the template's audit parent when a tracker is wired; shown whether or not a tracker is wired. The final message ends with the fixed related-utilities line from the `docs/roadmap.md` header, word for word. |
 
 Every template under `docs/templates/bkit-audit-*.md`:
 
@@ -409,7 +409,7 @@ Every template under `docs/templates/bkit-audit-*.md`:
 | `bkit-utility-update-failures` | Same over `docs/failures.jsonl`, judged on whether the bug still reproduces from the code. A flaky row closes only on a landed determinism fix, never a green run. Same `TRIAGED` promotion on an open tracker issue; a `failure` carries no `reason` field, so its `TRIAGED` rows only ever mean issue-promotion, unlike `deferral` where `bkit-ship-deferred-sweep` also writes `TRIAGED` alongside `reason` = `unjustified`. Same locator append. Same cross-ledger impact report. Same closing compact, on `failures`; a flaky row's flake count is its winner's `updates`, which survives the compaction. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory. Final message is the output format verbatim. |
 | `bkit-utility-update-decisions` | Fold `docs/decisions.jsonl` by `key`, highest `ts` wins → read only winning rows where `status` is `ACTIVE` or absent. Classify `HOLDS` / `CONTRADICTED` / `OBSOLETE` / `AMBIGUOUS` against `docs/` and the codebase. `CONTRADICTED` with one unambiguous replacement appends the corrected decision `ACTIVE`; `OBSOLETE` (nothing replaced it) appends `SUPERSEDED`. An unambiguous stale locator is folded into the same append and does not reclassify. One append per `key` per run. `AMBIGUOUS` and unresolved locators are left. Doc sentences that restate a corrected row are edited to match; implementation code is not. Same cross-ledger impact report and closing compact (on `decisions`) as `bkit-utility-update-deferrals`. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory. Final message is the output format verbatim. |
 | `bkit-utility-update-knowledge` | Fold `docs/knowledge.jsonl` by `key`, highest `ts` wins → read only winning rows where `status` is `ACTIVE` or absent. Classify `HOLDS` / `CONTRADICTED` / `OBSOLETE` / `AMBIGUOUS`. An entry about upstream behaviour is never retracted from absence of local evidence. `OBSOLETE` appends same-`key` `SUPERSEDED`; `CONTRADICTED` appends the corrected lesson `ACTIVE`. Same locator append. Same doc-sentence edit; implementation code is not. Same cross-ledger impact report. Same closing compact, on `knowledge`. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory. Final message is the output format verbatim. |
-| `bkit-utility-update-roadmap` | Rank next best steps from the board, both `## Notes` blocks, `.bkit/issues.jsonl` and open deferrals / failures. When a tracker is wired, always names the next milestone and the next distinct umbrella; a child is included only when open, unblocked, and able to start now. Those containers stay visible and enter the list only by priority, one row each, action = those children. List length is `package.json` `bkit.prompts.roadmapNext` (positive integer; absent or invalid → 25). Due audits compete by priority (risk covered first, then how overdue) for at most 3 rows. The length hint sits in the generated `roadmap-status` header. The full workflow is the default recommendation; names the `.bkit/lite.md` lite workflow (`<phase>:lite`) only where it is clearly enough. An item with no tracker issue (ledger row, due audit) gets a file-an-issue-first recommendation, shaped per `.bkit/trackers.md` § Issue shapes, when a tracker is wired. Rewrites only the `roadmap-analysis` block; bugs and deferrals it finds go under `Found Bugs` in its output for the caller to record. Appends no ledger rows; its one ledger write is a closing best-effort `bkit ledgers compact --ledger=issues` (`.bkit/jsonl.md` § Compaction), which removes superseded `feature` rows and adds none — `.bkit/issues.jsonl` has no updater of its own, and this is the utility that already folds it. |
+| `bkit-utility-update-roadmap` | Rank next best steps from the board, both `## Notes` blocks, `.bkit/issues.jsonl` and open deferrals / failures. When a tracker is wired, always names the next milestone and the next distinct umbrella; a child is included only when open, unblocked, and able to start now. Those containers stay visible and enter the list only by priority, one row each, action = those children. List length is `package.json` `bkit.prompts.roadmapNext` (positive integer; absent or invalid → 25). Due audits compete by priority (risk covered first, then how overdue) for at most 3 rows. The length hint sits in the generated `roadmap-status` header. The full workflow is the default recommendation. An item with no tracker issue (ledger row, due audit) gets a file-an-issue-first recommendation, shaped per `.bkit/trackers.md` § Issue shapes, when a tracker is wired. Rewrites only the `roadmap-analysis` block; bugs and deferrals it finds go under `Found Bugs` in its output for the caller to record. Appends no ledger rows; its one ledger write is a closing best-effort `bkit ledgers compact --ledger=issues` (`.bkit/jsonl.md` § Compaction), which removes superseded `feature` rows and adds none — `.bkit/issues.jsonl` has no updater of its own, and this is the utility that already folds it. |
 | `bkit-utility-update-tracker` | Bring every open issue (or the issues named in input) in line with `.agents/rules.md` tracker rules: title <=70 characters, type label plus exactly one `next:*` when no workflow label, board status from the workflow label, priority and size, milestone, parent, blocked-by. Sources in order: newest issues audit report `Proposal` / `Triage` / `Links`, then `docs/templates/bkit-audit-issues.md` § `Ranking Rules` and § `Size Scale`, then `docs/roadmap.md` `roadmap-analysis`. A report value overwrites a set field; its own judgement only fills empty ones and lists the rest under `Proposed`, so a human's manual setting survives unless an audit disagreed. Re-reads each issue right before writing and writes the full label set from that read, so concurrent workflow label changes survive; GitHub blocked-by goes in the body `###### bkit:blocked-by` block build reads, every other body byte unchanged. Never creates, closes, reopens or comments; never touches `bkit:*` labels or a done state; never removes a link; new milestones, parents and roadmap items with no issue are suggestions only. `Follow-ups` names the issues audit when due and the roadmap when priorities or links changed. No file writes. Bugs it finds go under `Found Bugs` in its output for the caller to record. |
 | `bkit-utility-compress-markdown` | Token-optimize a single markdown file; preserve 100 % load-bearing tokens. **Destructive** (overwrites target). |
 | `bkit-utility-update-documentation` | Sync every doc in `.agents/docs.md` with system state — drift cleanup across multiple plans. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory. |
diff --git a/.bkit/templates.md b/.bkit/templates.md
index ea5aba9a2..084797dd7 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -599,14 +599,13 @@ Issues are the first input every workflow reads. There is one form per way work

<!-- prettier-ignore -->
 | Form | Use when | Next step | Asks for |
 | --- | --- | --- | --- |
 | `bkit-idea.yml` | How it should work is still open | `/bkit-design #N` | problem, outcome, success criteria, constraints and non-goals, decisions already made, open questions |
-| `bkit-change.yml` | What to build and "done" are known | `/bkit-plan #N`, or `/bkit-build #N` / `build:lite` with no plan | the plan in short: narrative, success criteria, edge cases, test matrix, tasks with `DONE WHEN` + `TEST FIRST` as task group and task blocks showing every plan task field (`CREATE` / `READ` / `UPDATE` / `DELETE`, `DEPENDS ON`, `DONE WHEN`, `TEST FIRST`, `TEST EXCEPTION`), breaking changes and names, out of scope |
+| `bkit-change.yml` | What to build and "done" are known | `/bkit-plan #N`, or `/bkit-build #N` with no plan | the plan in short: narrative, success criteria, edge cases, test matrix, tasks with `DONE WHEN` + `TEST FIRST` as task group and task blocks showing every plan task field (`CREATE` / `READ` / `UPDATE` / `DELETE`, `DEPENDS ON`, `DONE WHEN`, `TEST FIRST`, `TEST EXCEPTION`), breaking changes and names, out of scope |
 | `bkit-bug.yml` | Something does not work | a test or CI run already fails → `/bkit-debug #N`; nothing fails yet → `/bkit-debug #N [repro]` | failing test or CI run, what happened, what should, repro steps, how often, affected area, where and when, evidence |
 
 - Every form ends with References. The change form shows the lines workflows read: `**Parent design:**` and `**Audit reports:**` (plan), and the blocked-by block (build). Other references are not fetched. Write exact paths, ledger `key`s and `#N — title`.
 - A change issue is the plan's source when no design or audit report exists. Its narrative, success criteria, edge cases, test rows and tasks carry over verbatim.
   - `/bkit-build` with no plan first writes `{FID}-plan.md` from them (`@bkit-build-plan-convert`). Then it builds the tasks, and checks that each `TEST FIRST` test failed before its code.
   - An existing `{FID}-plan.md` wins, and the issue text is not read.
-  - `build:lite` checks nothing.
   - Nothing ticks the boxes.
 - Debug commits to the branch it runs on, so start it on the branch the fix lands on.
 - Copy the folder and commit it on the default branch, because GitHub reads forms from there only. Blank issues stay enabled.
diff --git a/.bkit/trackers.md b/.bkit/trackers.md
index 4a8df7097..78cbd44d8 100644
--- a/.bkit/trackers.md
+++ b/.bkit/trackers.md
@@ -111,7 +111,7 @@ Workflows read an issue's body and comments (`bkit issues text`), never its titl

<!-- prettier-ignore -->
 | Shape | When | Next command | Sections (**required**) |
 | --- | --- | --- | --- |
 | idea | how it should work still open | `/bkit-design #N` | **Problem**, **Outcome**, Success criteria, Constraints and non-goals, Decisions already made, Open questions, References |
-| change | what to build + how to tell done both known | `/bkit-plan #N`; or `/bkit-build #N` / `build:lite` straight from issue | **Narrative**, **Success Criteria**, Edge Cases, **Derived Test Matrix**, **Tasks**, Open Questions & Assumptions, Breaking Changes & Naming, Out of Scope, References |
+| change | what to build + how to tell done both known | `/bkit-plan #N`; or `/bkit-build #N` straight from issue | **Narrative**, **Success Criteria**, Edge Cases, **Derived Test Matrix**, **Tasks**, Open Questions & Assumptions, Breaking Changes & Naming, Out of Scope, References |
 | bug | worked / should work, does not | test or CI run already fails → `/bkit-debug #N` on branch fix lands on (`[soak]` if intermittent); nothing fails → `/bkit-debug #N [repro]` (failing test first; `[soak]` too if intermittent) | **Failing test or CI run** (`none yet` allowed), **What happened**, **What should happen**, **Steps to reproduce**, How often, Affected area, Where and when, Evidence, References |
 
 **Change shape syntax** (the plan keeps it word for word):
@@ -153,7 +153,7 @@ Workflows read an issue's body and comments (`bkit issues text`), never its titl
   <!-- bkit:group 1 end -->
   ```
 
-- `/bkit-build` with no plan converts the issue into a plan first. `build:lite` checks neither `DONE WHEN` nor `TEST FIRST`. Nothing ticks issue boxes.
+- `/bkit-build` with no plan converts the issue into a plan first. Nothing ticks issue boxes.
 
 **Machine-read lines** — exact syntax, anywhere in the body. Nothing else in References is fetched:
 
@@ -175,7 +175,7 @@ Workflows read an issue's body and comments (`bkit issues text`), never its titl
 | Source | Shape | Carry |
 | --- | --- | --- |
 | audit run, tracker wired, no open audit parent for its template (`Parent: missing`) | audit parent (below) | template path line |
-| audit `Suggested Issues` row | by `Next Step`: `/bkit-design` → idea; `/bkit-plan`, `/bkit-build`, `build:lite` → change; `/bkit-debug`, `debug:lite` → bug; `manual` → plain task | `**Audit reports:**` line with row's finding IDs; sub-issue of the template's audit parent (linear → `parentId`; jira → `parent`) |
+| audit `Suggested Issues` row | by `Next Step`: `/bkit-design` → idea; `/bkit-plan`, `/bkit-build` → change; `/bkit-debug` → bug; `manual` → plain task | `**Audit reports:**` line with row's finding IDs; sub-issue of the template's audit parent (linear → `parentId`; jira → `parent`) |
 | design `Suggested Plans` (`P-N`; 2+ → design summary next step; 1 → planned on the design's own issue) | one issue per plan, never per workstream; title = plan name; body = its deliverable and covered workstream scopes, spec left to design; filed in `Requires` order | `**Parent design:**` line; `**Workstreams:**` line = its `Covers` ids; blocked-by block = plan issues filed for its `Requires` (linear → `blockedBy` relation; jira → `Blocks` link, `inwardIssue` = blocker) |
 | roadmap item with no issue (ledger row, audit candidate) | by recommended command, as audit row | ledger `key` / report path in References |
 
diff --git a/.bkit/version b/.bkit/version
index 8857820a2..08a703959 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -176,11 +176,11 @@
     ".cursor/agents/bkit-utility-update-failures.md": "67fd033fbb7e67c130c9054385dc49af179700762ea7eaf1e02b0e911872a168",
     ".claude/agents/bkit-utility-update-knowledge.md": "a380c8c6d6276b66e7d788fe0a6d887f55c607a0f8c3e9883472f3a858cae4b1",
     ".cursor/agents/bkit-utility-update-knowledge.md": "3e637269c6747e947c401c9636677111a622b85ed7b9703826243866ddfd7141",
-    ".opencode/agents/bkit-audit-generate.md": "6fc3f94b4bc79b5adc39ecb51cb6deb54e78cde34e6fc6ac9577ba3f1cf52377",
-    ".codex/agents/bkit-audit-generate.toml": "2a1f65e359f748b1ecb3f84c70f8850aae1b9120f30f53fd251ae6b7c44d7f7d",
+    ".opencode/agents/bkit-audit-generate.md": "0bb226914999abdedded9b20431dd142fd2716b8858d75e2c960d6a37c7ce5de",
+    ".codex/agents/bkit-audit-generate.toml": "4352c56096df140d610b1db47b2c73b1ac0e0bac1b4c16609698dc101f7128df",
     "docs/templates/bkit-plan.md": "661eb082fb226de83a02a40032ae5531908a8baa0d7619bd238b59bb3e541e77",
-    ".claude/agents/bkit-audit-generate.md": "da5ef52d4c323b913029123cd1192d360029b0dff513f88417e9992cd30192ad",
-    ".cursor/agents/bkit-audit-generate.md": "149a22747bf3d5b5fe4f2e300af5d3f8348e459e1d84c7ac1b7856dd6f93f488",
+    ".claude/agents/bkit-audit-generate.md": "6d7f3aca6c94f8a09b9e9a429d81febad36a8e50fbab660737fef4a2a68a5b0c",
+    ".cursor/agents/bkit-audit-generate.md": "dfb59264fe173fcb02b385fe2d0385de1b86ab50a44b63ed458e8f447e1cb8e5",
     "docs/templates/bkit-audit-accessibility.md": "a8e9487950d24ea1afec8947b4b2ddc13feb63997ea582632dd912cbd6b6e030",
     "docs/templates/bkit-audit-app-performance.md": "f94bc67df993ee8371cad1c0e43929b152430a53cb032bd0330c537719c99fd6",
     "docs/templates/bkit-audit-architecture.md": "98df7d9afc7e6884aa8fdf8601ad62dd33bb93fc59347b97005609c253e1c166",
@@ -197,8 +197,8 @@
     "docs/templates/bkit-audit-slop.md": "ed2f455d8d15f5324127a91f15958838589110098265fc58e7c6b4b2751316b5",
     "docs/templates/bkit-audit-usability.md": "4beca4d9e7c6e9599a41c99f15a97668c13ebb315f44c7cd1ed6a417c61d4b80",
     "docs/templates/bkit-audit-testing.md": "d507ead6cd0785576bafa3164e5b078db4fce8188624a170689ad1084ef34b35",
-    ".opencode/agents/bkit-utility-update-roadmap.md": "ac6954d757cd5b17c83aa70c6a75450e42416b86035a2224dba5b5cdb06972a9",
-    ".codex/agents/bkit-utility-update-roadmap.toml": "97bd0914205aa56e0bf99f3b5358dc50fae4f16164b37419a680837e3afe9e88",
+    ".opencode/agents/bkit-utility-update-roadmap.md": "9290a5b03179a4b8325366a270a03f7daa7511a7a90ef3d37542fc77acd9e2e3",
+    ".codex/agents/bkit-utility-update-roadmap.toml": "8cc745abc06a8898d16bbad526db274dbeb0f25f46787f35621b3b3e90c8d540",
     "docs/templates/bkit-audit-aio-seo.md": "e4c534912e661050887d5a1d1adf31798710a95bc27ecd27aa842a69e07c981c",
     "docs/templates/bkit-audit-analytics.md": "f60006aa52e4cef09a2d455d7094d11eb9c10b5aff5ed95e81446fbefc5e6bc0",
     "docs/templates/bkit-audit-annotations.md": "4cc6b4912817c88a39cb852cd0557d39100df6852d03785da6eebefcdf45ceed",
@@ -215,21 +215,21 @@
     "docs/templates/bkit-audit-logs.md": "653bd8210bd26f35a0dc33c8ee5410e0fa9691f981a5cdb24df6d4b5428fb6a0",
     "docs/templates/bkit-audit-models.md": "30206b68bb70d7d9245ed66bc3f493150c18fcc5d06330f1932c71f8f61808ba",
     "docs/templates/bkit-audit-reliability.md": "8692890b49608d803641200cf0eeadb0842d725dceca4c5b69a73f7085b06724",
-    ".claude/agents/bkit-utility-update-roadmap.md": "b2d54efdc21c5a68c87a00483d7da1fbe95b76bf690028de10df03cf20c12ccf",
-    ".cursor/agents/bkit-utility-update-roadmap.md": "ea7081672a0fe44a1d2eaf40958c008a7631d329345d11d6a7ca4439a156bf25",
+    ".claude/agents/bkit-utility-update-roadmap.md": "e20f6d932688e26bee8860a2958d75c9d63303d00296aa9db26d7532dd099b8b",
+    ".cursor/agents/bkit-utility-update-roadmap.md": "b31d11ee339a23e0f27981519149073d4319b998fa1ffba8026a27d7b3c1ed27",
     "docs/templates/bkit-audit-agents.md": "39f34db396db4e50742d230304ecdeb0ceb367ee99e03aaba740872ff8fdd858",
     "docs/templates/bkit-audit-prompts.md": "6ec46e60dafdc8caafcc59e6b60fab75b286106bef4e3c7f8fb2ed5c0b59b8c0",
-    ".bkit/templates.md": "2c8226e3b0a06cdfef14002d2126d27c49b1ef2f7ffc7b5edc18980031908da3",
+    ".bkit/templates.md": "b86b27ae16fb76ef36a568d48c4e0a2de1719d3f14bbec1e0d4dc59290bb333e",
     "docs/templates/bkit-audit-adoption.md": "09fa8636f0529f95ab7a46f4c74727da85fde7180d43979e74cdbb3ea3557794",
     ".bkit/cloud.md": "7594f46d9003bcf77650cf57c3ff934278690187434e58bc57159ccbd1c52524",
     ".bkit/comparison.md": "1ab7924388e037438a73a87c1826f5846f7ae38a5a41479eb6bb7454ae782d07",
     ".bkit/install.md": "eb4b839c4647ffb42aa1beca76cffbfa2ba6f45a46e1c5712f4d823f5820dcf0",
     ".bkit/jsonl.md": "f9195ce4f895c4eee3063446006468297971bf5abc51f8b464cb3f87bc135dc7",
     ".bkit/providers.md": "953f73d978c548b28b5a036296cf826db7f375cbbe0eee46066f7b3088627f3c",
-    ".bkit/prompts.md": "d760a7f5a757fd9482fea6a3033f4b504ab5d6b326ba3dfc44e652344ba0c6e4",
-    ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "d853ef6311803f9163d7817d27e3629934d4623fddb7840e8c5468462902bbfc",
-    ".bkit/README.md": "568713c54e83104c05f1538cde50c20d44ddcd92518f11d2fe06a99cbff265f4",
+    ".bkit/prompts.md": "53a39d3aed93cd807b6548b69fb5f5e7da7bc7752b541aea8b26e174774febcf",
+    ".bkit/trackers.md": "2d3a3eb425bf698a8dfac5ef8157986e12cba43edd94f4f0daffbfcbdd00619c",
+    ".bkit/workflows.md": "646e9279dcb085a59e91216efa350f01253b5da4e731b393b77667151fe5ec73",
+    ".bkit/README.md": "0d1d2f36117f6dc60aa145a4467aaa1f7a8d05c01c05dc74adf95977befa7ea4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
     ".claude/hooks/bkit-guardrails.cjs": "cf9e03228d75d0746f92fd0f88840e64185bdeec7818a94d7c09037af6156b51",
@@ -252,10 +252,10 @@
     ".opencode/agents/bkit-debug-failure-reproduce.md": "a9ee838c38569aa1e24346e7c4b84cff3fbdb41e2f82487758720fae9fa2046c",
     ".codex/agents/bkit-debug-failure-reproduce.toml": "b7dbd96e701567aab36827e479f1abf98783fc5642058f157e77c9f37dbe654e",
     ".bkit/allowlist.json": "47f68886cd8488cd0ff0b77ac7bd985b9e33bc0484db2c4cbfca3b84c694fbce",
-    ".claude/agents/bkit-utility-update-tracker.md": "f7d925fd1a5592e89acae321ed290a385de70aed47fa6d37fd728c995d2b245b",
-    ".cursor/agents/bkit-utility-update-tracker.md": "51a09d7610cdf2da42277b2c7d3d58783eaf1c5353f5b889bd103e990db561c1",
-    ".opencode/agents/bkit-utility-update-tracker.md": "0cbd6184dfcd3b35812b2f1ba671e957e99f9351eda5624ae3a6fbae0553dd9e",
-    ".codex/agents/bkit-utility-update-tracker.toml": "014fb27fcaa7b91966797adb54264bb734c35aeb513f52b7955eaaaca5f93357",
+    ".claude/agents/bkit-utility-update-tracker.md": "d93f21198cbb89c759a301bad1d0df55caa67604741f8a86950b9d1a6b4f75e8",
+    ".cursor/agents/bkit-utility-update-tracker.md": "0e100ab1d0b7cfbd66812b587359066de3e5755b3ada807ebf7baea7583fda0e",
+    ".opencode/agents/bkit-utility-update-tracker.md": "58f95b4e802bebc7d868caabeb89b744c0feb930b999289cc3bc0532dea66e75",
+    ".codex/agents/bkit-utility-update-tracker.toml": "8fe382c561fc027be8f4e86ff4c89212c1e2d549cdadcfad4b417e08ec14fff8",
     ".claude/agents/bkit-plan-scope-check.md": "9c2480cc95fef33ed0d6c9d355489e8b435cfa8c81157a9201c8ae1989d6bd07",
     ".cursor/agents/bkit-plan-scope-check.md": "b269ddb5f61338f54bca9d47076d3221e160944ca3ba54bb6c791dfe7874353e",
     ".opencode/agents/bkit-plan-scope-check.md": "66a96ef2e767346aa7049f152cc288db8f9bc6d101e2778a6974df15913f6dba",
@@ -264,7 +264,7 @@
     ".cursor/agents/bkit-build-plan-convert.md": "cd9f01d39d1c06a2c1cb8b70d37522469bdcaf6becd2d4dd57783267a93517a0",
     ".opencode/agents/bkit-build-plan-convert.md": "c7d4f872ed7d8d59c6a3f70f9c8d5a0b2d0b0c8f44234d1414e892a4b54d186f",
     ".codex/agents/bkit-build-plan-convert.toml": "05d6950764be9af8b3517fe6c755747b67c0cdb2908ec4d4be0e8b2247b4963e",
-    ".bkit/authoring.md": "bd89415378ed538a833d65c87d52596cbb09abb256c31187f01a9418abc3f697",
+    ".bkit/authoring.md": "29d40107042c09f0d1cd12ee9a476ace1ca61fd3f1d9b398e43696ee6369b99f",
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 32cb3ca67..86d1ebe80 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -33,7 +33,7 @@ The source files live in `.bkit/core/workflows/`. `bkit install` regenerates `.c
 | --- | --- | --- | --- |
 | `/bkit-design` | yes | yes | `docs/plans/{YYYYMM}/{FID}-design.md` |
 | `/bkit-plan` | yes | yes | `docs/plans/{YYYYMM}/{FID}-plan.md` |
-| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL |
+| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL; with `publish=false` (local only), no push or PR: the build is held on `feat/{FID}` for `/bkit-ship` |
 | `/bkit-debug` | yes | no | Remediated commit pushed to feature branch |
 | `/bkit-ship` | yes | yes | Squash-merged PR; plans canonical at `docs/plans/{YYYYMM}/` (no archive move — `{YYYYMM}` = creation month); worktree gone |
 | `/bkit-auto` | args `{PHASE} {ARG}` (`{ARG}` = PR number **or** FID slug for ship / debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; same session continues into the dispatched skill |
@@ -896,6 +896,8 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 
 **Goal:** implementation and PR creation. CI takes over once the PR exists. The workflow stops on PR creation; there is no human gate within build itself.
 
+**Publish resolution:** `bkit status route` resolves `{PUBLISH}` from the `publish=true|false` session token, else `package.json` `bkit.workflows.build.publish` (`local` on a local run, `remote` elsewhere, both default `true`). `remote` accepts only `true` (`false` → advisory `bkit-build-publish-remote`, resolves `true`), and a token `false` on a non-local run is coerced to `true` with a warning. `PUBLISH` false holds the run: no branch push, no PR, no CI, no docs sync; the worktree and branch stay, the lock is released and the close writes `ending: held`, `publish: false`. The issue moves to `In review` with the "built locally, not published" comment, and the summary reads `Publish: held` / `Docs: not synced`. `/bkit-ship <ref>` lands a held build.
+
 **Build never reads the CI conclusion (by design):** the Step 16 CI-Dispatch Gate proves only that a run started (`bkit runs dispatch`). `/bkit-ship` owns the result (`bkit runs gate` refuses to merge on red). A red PR → `/bkit-debug` (manual, or auto-routed by `bkit-cloud.yml`). Waiting in build would add the full CI duration to every run and race the cloud auto-router on the same branch. The final message says so.
 
 **Group loop (Steps 7-9):** build works from one file, `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups within the `bkit.workflows.tasks` caps (§ Test-first). One pass of Steps 7-9 per group, in group order; `bkit context brief --next` picks the first group with a task neither ticked nor logged `DONE`, so a resumed run starts where the last one stopped. `VERIFY_ATTEMPT` is derived per group (`bkit counters derive --group={GROUP}`), so each group starts at 1. Between groups the unit gate runs (§ Group gate). Only verify ticks tasks; the execute log's `DONE` lines are the handover between Steps 7 and 8.
diff --git a/.claude/agents/bkit-audit-generate.md b/.claude/agents/bkit-audit-generate.md
index 1dda613a0..32e1e701c 100644
--- a/.claude/agents/bkit-audit-generate.md
+++ b/.claude/agents/bkit-audit-generate.md
@@ -86,8 +86,8 @@ autoCompactWindow: 300000
 - **Check gates first:** Verify every gate item before proceeding; work that skipped a gate is invalid, so close the gap. Gates inside `/bkit-*` workflows are self-verification, not human gates: stop only at an explicit **STOP**.
 - **Discovered bugs:** Record each discovered bug instead of dropping it silently: append one row per bug to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker issue mentions:** Mention an issue ID only together with its title and URL.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -139,7 +139,6 @@ autoCompactWindow: 300000
       - The approach is open (options, trade-offs, unanswered questions) → `/bkit-design`.
       - The approach is settled, not broken into tasks → `/bkit-plan`.
       - The change is clear → `/bkit-build`.
-    - **If** `.bkit/lite.md` § When to use allows a lite workflow → `/bkit-build` becomes `build:lite`, and `/bkit-debug` becomes `debug:lite`.
     - `Reason` = the deciding fact, in one clause.
 11. Write ledger entries to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), with `by: {workflow: "audit", step: "audit-{slug}"}`.
     - **If** the template audits `docs/failures.jsonl` or `docs/deferrals.jsonl` → skip this step.
diff --git a/.claude/agents/bkit-utility-update-roadmap.md b/.claude/agents/bkit-utility-update-roadmap.md
index be049c691..8ad0dbc09 100644
--- a/.claude/agents/bkit-utility-update-roadmap.md
+++ b/.claude/agents/bkit-utility-update-roadmap.md
@@ -90,7 +90,6 @@ autoCompactWindow: 300000
     - Treat items done together as one list item.
 11. For each item:
     - Recommend the `/bkit-<phase>` command.
-    - Recommend the `.bkit/lite.md` lite workflow `<phase>:lite` instead, only where it is clearly enough.
     - Recommend a model tier.
     - Recommend `@bkit-audit-generate` for audit reports.
     - **If** a tracker is wired and the item has no issue → recommend filing one first, shaped per `.bkit/trackers.md` § Issue shapes.
@@ -122,7 +121,7 @@ autoCompactWindow: 300000
 
 ## Next Items
 
-[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command or, where clearly enough, the `<phase>:lite` lite workflow, and the model tier. **If** none → `None`.]
+[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command and the model tier. **If** none → `None`.]
 
 ## Groupings
 
diff --git a/.claude/agents/bkit-utility-update-tracker.md b/.claude/agents/bkit-utility-update-tracker.md
index 78494ac9c..6c9c9ef77 100644
--- a/.claude/agents/bkit-utility-update-tracker.md
+++ b/.claude/agents/bkit-utility-update-tracker.md
@@ -50,8 +50,8 @@ autoCompactWindow: 300000
 - **Verify tools:** Verify every return; do not assume success.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
 - **Tracker issue settings:** Keep the title to at most 70 characters, or two lines on mobile. Set labels, project, project status, priority, size, milestone, parent, and every open blocking issue as blocked-by. Set priority and size per `docs/templates/bkit-audit-issues.md` § Ranking Rules and § Size Scale, not by label alone. Blocked-by MUST use the machine-read form per `.bkit/trackers.md` § Issue shapes, not prose alone. Check similar issues when unclear.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker work comments:** For any issue worked on outside `/bkit-*` workflows, post one comment per related issue at the end of every major turn (files changed, commit, PR, finding or blocked stop) with the work done, the outcome and links. Skip turns with no work (Q&A, clarifying questions). Describe the change instead of pasting diffs or restating code, and do not mention @claude or @cursor in the comment body.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -63,7 +63,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md` and `.bkit/lite.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
@@ -92,7 +92,6 @@ autoCompactWindow: 300000
      - **If** a workflow label (`bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship`) is present → remove every `next:*`.
      - **Else** → exactly one `next:*`, from the `REPORT` label correction, then the roadmap item's recommended command, then the issue shape per `.bkit/trackers.md` § `Issue shapes`:
        - Shape to label: idea → `next:design`, change → `next:plan`, change with `Tasks` → `next:build`, bug → `next:debug`.
-       - Append `:lite` per `.bkit/lite.md` § `When to use`.
        - An existing single `next:*` stands unless `REPORT` corrects it.
      - **If** the type label (`enhancement|bug`) is missing → add it per shape. `REPORT` label corrections apply.
      - **If** a label is not in the repo or team labels → `Unapplied`.
diff --git a/.codex/agents/bkit-audit-generate.toml b/.codex/agents/bkit-audit-generate.toml
index 66a7badc1..57b06448b 100644
--- a/.codex/agents/bkit-audit-generate.toml
+++ b/.codex/agents/bkit-audit-generate.toml
@@ -69,8 +69,8 @@ developer_instructions = """
 - **Check gates first:** Verify every gate item before proceeding; work that skipped a gate is invalid, so close the gap. Gates inside `/bkit-*` workflows are self-verification, not human gates: stop only at an explicit **STOP**.
 - **Discovered bugs:** Record each discovered bug instead of dropping it silently: append one row per bug to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker issue mentions:** Mention an issue ID only together with its title and URL.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -122,7 +122,6 @@ developer_instructions = """
       - The approach is open (options, trade-offs, unanswered questions) → `/bkit-design`.
       - The approach is settled, not broken into tasks → `/bkit-plan`.
       - The change is clear → `/bkit-build`.
-    - **If** `.bkit/lite.md` § When to use allows a lite workflow → `/bkit-build` becomes `build:lite`, and `/bkit-debug` becomes `debug:lite`.
     - `Reason` = the deciding fact, in one clause.
 11. Write ledger entries to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), with `by: {workflow: "audit", step: "audit-{slug}"}`.
     - **If** the template audits `docs/failures.jsonl` or `docs/deferrals.jsonl` → skip this step.
diff --git a/.codex/agents/bkit-utility-update-roadmap.toml b/.codex/agents/bkit-utility-update-roadmap.toml
index 87678a3c2..86a452851 100644
--- a/.codex/agents/bkit-utility-update-roadmap.toml
+++ b/.codex/agents/bkit-utility-update-roadmap.toml
@@ -75,7 +75,6 @@ developer_instructions = """
     - Treat items done together as one list item.
 11. For each item:
     - Recommend the `/bkit-<phase>` command.
-    - Recommend the `.bkit/lite.md` lite workflow `<phase>:lite` instead, only where it is clearly enough.
     - Recommend a model tier.
     - Recommend `@bkit-audit-generate` for audit reports.
     - **If** a tracker is wired and the item has no issue → recommend filing one first, shaped per `.bkit/trackers.md` § Issue shapes.
@@ -107,7 +106,7 @@ developer_instructions = """
 
 ## Next Items
 
-[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command or, where clearly enough, the `<phase>:lite` lite workflow, and the model tier. **If** none → `None`.]
+[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command and the model tier. **If** none → `None`.]
 
 ## Groupings
 
diff --git a/.codex/agents/bkit-utility-update-tracker.toml b/.codex/agents/bkit-utility-update-tracker.toml
index c64a0edbc..157701a77 100644
--- a/.codex/agents/bkit-utility-update-tracker.toml
+++ b/.codex/agents/bkit-utility-update-tracker.toml
@@ -32,8 +32,8 @@ developer_instructions = """
 - **Verify tools:** Verify every return; do not assume success.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
 - **Tracker issue settings:** Keep the title to at most 70 characters, or two lines on mobile. Set labels, project, project status, priority, size, milestone, parent, and every open blocking issue as blocked-by. Set priority and size per `docs/templates/bkit-audit-issues.md` § Ranking Rules and § Size Scale, not by label alone. Blocked-by MUST use the machine-read form per `.bkit/trackers.md` § Issue shapes, not prose alone. Check similar issues when unclear.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker work comments:** For any issue worked on outside `/bkit-*` workflows, post one comment per related issue at the end of every major turn (files changed, commit, PR, finding or blocked stop) with the work done, the outcome and links. Skip turns with no work (Q&A, clarifying questions). Describe the change instead of pasting diffs or restating code, and do not mention @claude or @cursor in the comment body.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -45,7 +45,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md` and `.bkit/lite.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
@@ -74,7 +74,6 @@ developer_instructions = """
      - **If** a workflow label (`bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship`) is present → remove every `next:*`.
      - **Else** → exactly one `next:*`, from the `REPORT` label correction, then the roadmap item's recommended command, then the issue shape per `.bkit/trackers.md` § `Issue shapes`:
        - Shape to label: idea → `next:design`, change → `next:plan`, change with `Tasks` → `next:build`, bug → `next:debug`.
-       - Append `:lite` per `.bkit/lite.md` § `When to use`.
        - An existing single `next:*` stands unless `REPORT` corrects it.
      - **If** the type label (`enhancement|bug`) is missing → add it per shape. `REPORT` label corrections apply.
      - **If** a label is not in the repo or team labels → `Unapplied`.
diff --git a/.cursor/agents/bkit-audit-generate.md b/.cursor/agents/bkit-audit-generate.md
index c73cc6a5f..1c513ceb0 100644
--- a/.cursor/agents/bkit-audit-generate.md
+++ b/.cursor/agents/bkit-audit-generate.md
@@ -83,8 +83,8 @@ tools:
 - **Check gates first:** Verify every gate item before proceeding; work that skipped a gate is invalid, so close the gap. Gates inside `/bkit-*` workflows are self-verification, not human gates: stop only at an explicit **STOP**.
 - **Discovered bugs:** Record each discovered bug instead of dropping it silently: append one row per bug to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker issue mentions:** Mention an issue ID only together with its title and URL.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -136,7 +136,6 @@ tools:
       - The approach is open (options, trade-offs, unanswered questions) → `/bkit-design`.
       - The approach is settled, not broken into tasks → `/bkit-plan`.
       - The change is clear → `/bkit-build`.
-    - **If** `.bkit/lite.md` § When to use allows a lite workflow → `/bkit-build` becomes `build:lite`, and `/bkit-debug` becomes `debug:lite`.
     - `Reason` = the deciding fact, in one clause.
 11. Write ledger entries to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), with `by: {workflow: "audit", step: "audit-{slug}"}`.
     - **If** the template audits `docs/failures.jsonl` or `docs/deferrals.jsonl` → skip this step.
diff --git a/.cursor/agents/bkit-utility-update-roadmap.md b/.cursor/agents/bkit-utility-update-roadmap.md
index 9d58ae2b0..78e553e12 100644
--- a/.cursor/agents/bkit-utility-update-roadmap.md
+++ b/.cursor/agents/bkit-utility-update-roadmap.md
@@ -87,7 +87,6 @@ tools:
     - Treat items done together as one list item.
 11. For each item:
     - Recommend the `/bkit-<phase>` command.
-    - Recommend the `.bkit/lite.md` lite workflow `<phase>:lite` instead, only where it is clearly enough.
     - Recommend a model tier.
     - Recommend `@bkit-audit-generate` for audit reports.
     - **If** a tracker is wired and the item has no issue → recommend filing one first, shaped per `.bkit/trackers.md` § Issue shapes.
@@ -119,7 +118,7 @@ tools:
 
 ## Next Items
 
-[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command or, where clearly enough, the `<phase>:lite` lite workflow, and the model tier. **If** none → `None`.]
+[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command and the model tier. **If** none → `None`.]
 
 ## Groupings
 
diff --git a/.cursor/agents/bkit-utility-update-tracker.md b/.cursor/agents/bkit-utility-update-tracker.md
index 38df13cf9..950f496f5 100644
--- a/.cursor/agents/bkit-utility-update-tracker.md
+++ b/.cursor/agents/bkit-utility-update-tracker.md
@@ -47,8 +47,8 @@ tools:
 - **Verify tools:** Verify every return; do not assume success.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
 - **Tracker issue settings:** Keep the title to at most 70 characters, or two lines on mobile. Set labels, project, project status, priority, size, milestone, parent, and every open blocking issue as blocked-by. Set priority and size per `docs/templates/bkit-audit-issues.md` § Ranking Rules and § Size Scale, not by label alone. Blocked-by MUST use the machine-read form per `.bkit/trackers.md` § Issue shapes, not prose alone. Check similar issues when unclear.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker work comments:** For any issue worked on outside `/bkit-*` workflows, post one comment per related issue at the end of every major turn (files changed, commit, PR, finding or blocked stop) with the work done, the outcome and links. Skip turns with no work (Q&A, clarifying questions). Describe the change instead of pasting diffs or restating code, and do not mention @claude or @cursor in the comment body.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -60,7 +60,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md` and `.bkit/lite.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
@@ -89,7 +89,6 @@ tools:
      - **If** a workflow label (`bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship`) is present → remove every `next:*`.
      - **Else** → exactly one `next:*`, from the `REPORT` label correction, then the roadmap item's recommended command, then the issue shape per `.bkit/trackers.md` § `Issue shapes`:
        - Shape to label: idea → `next:design`, change → `next:plan`, change with `Tasks` → `next:build`, bug → `next:debug`.
-       - Append `:lite` per `.bkit/lite.md` § `When to use`.
        - An existing single `next:*` stands unless `REPORT` corrects it.
      - **If** the type label (`enhancement|bug`) is missing → add it per shape. `REPORT` label corrections apply.
      - **If** a label is not in the repo or team labels → `Unapplied`.
diff --git a/.opencode/agents/bkit-audit-generate.md b/.opencode/agents/bkit-audit-generate.md
index c376f08d1..51844f593 100644
--- a/.opencode/agents/bkit-audit-generate.md
+++ b/.opencode/agents/bkit-audit-generate.md
@@ -84,8 +84,8 @@ tools:
 - **Check gates first:** Verify every gate item before proceeding; work that skipped a gate is invalid, so close the gap. Gates inside `/bkit-*` workflows are self-verification, not human gates: stop only at an explicit **STOP**.
 - **Discovered bugs:** Record each discovered bug instead of dropping it silently: append one row per bug to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker issue mentions:** Mention an issue ID only together with its title and URL.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -137,7 +137,6 @@ tools:
       - The approach is open (options, trade-offs, unanswered questions) → `/bkit-design`.
       - The approach is settled, not broken into tasks → `/bkit-plan`.
       - The change is clear → `/bkit-build`.
-    - **If** `.bkit/lite.md` § When to use allows a lite workflow → `/bkit-build` becomes `build:lite`, and `/bkit-debug` becomes `debug:lite`.
     - `Reason` = the deciding fact, in one clause.
 11. Write ledger entries to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), with `by: {workflow: "audit", step: "audit-{slug}"}`.
     - **If** the template audits `docs/failures.jsonl` or `docs/deferrals.jsonl` → skip this step.
diff --git a/.opencode/agents/bkit-utility-update-roadmap.md b/.opencode/agents/bkit-utility-update-roadmap.md
index 119392c51..4fef62828 100644
--- a/.opencode/agents/bkit-utility-update-roadmap.md
+++ b/.opencode/agents/bkit-utility-update-roadmap.md
@@ -88,7 +88,6 @@ tools:
     - Treat items done together as one list item.
 11. For each item:
     - Recommend the `/bkit-<phase>` command.
-    - Recommend the `.bkit/lite.md` lite workflow `<phase>:lite` instead, only where it is clearly enough.
     - Recommend a model tier.
     - Recommend `@bkit-audit-generate` for audit reports.
     - **If** a tracker is wired and the item has no issue → recommend filing one first, shaped per `.bkit/trackers.md` § Issue shapes.
@@ -120,7 +119,7 @@ tools:
 
 ## Next Items
 
-[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command or, where clearly enough, the `<phase>:lite` lite workflow, and the model tier. **If** none → `None`.]
+[Each item, in priority order: what to do, a short priority rationale, the recommended `/bkit-<phase>` command and the model tier. **If** none → `None`.]
 
 ## Groupings
 
diff --git a/.opencode/agents/bkit-utility-update-tracker.md b/.opencode/agents/bkit-utility-update-tracker.md
index f760b42ed..5d4965c9e 100644
--- a/.opencode/agents/bkit-utility-update-tracker.md
+++ b/.opencode/agents/bkit-utility-update-tracker.md
@@ -48,8 +48,8 @@ tools:
 - **Verify tools:** Verify every return; do not assume success.
 - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
 - **Tracker issue settings:** Keep the title to at most 70 characters, or two lines on mobile. Set labels, project, project status, priority, size, milestone, parent, and every open blocking issue as blocked-by. Set priority and size per `docs/templates/bkit-audit-issues.md` § Ranking Rules and § Size Scale, not by label alone. Blocked-by MUST use the machine-read form per `.bkit/trackers.md` § Issue shapes, not prose alone. Check similar issues when unclear.
-- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
-- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+- **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+- **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
 - **Tracker work comments:** For any issue worked on outside `/bkit-*` workflows, post one comment per related issue at the end of every major turn (files changed, commit, PR, finding or blocked stop) with the work done, the outcome and links. Skip turns with no work (Q&A, clarifying questions). Describe the change instead of pasting diffs or restating code, and do not mention @claude or @cursor in the comment body.
 - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.
 - **Commits:** Commit early and often, without asking for confirmation; subagents do not commit. Assume other agents are editing the same working tree in parallel, so commit only the files you touched, named explicitly (`git commit -- {paths}`), and never whatever is already staged. Use `git add -A` / `git add .` / `git commit -a` only when the whole tree is your task; otherwise add your own paths by name. **If** a file you touched also carries another agent's edits → **STOP** and ask. Do not stage `.DS_Store`, `*.log`, editor swaps or dependency / build dirs (e.g. `node_modules/`).
@@ -61,7 +61,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md` and `.bkit/lite.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
@@ -90,7 +90,6 @@ tools:
      - **If** a workflow label (`bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship`) is present → remove every `next:*`.
      - **Else** → exactly one `next:*`, from the `REPORT` label correction, then the roadmap item's recommended command, then the issue shape per `.bkit/trackers.md` § `Issue shapes`:
        - Shape to label: idea → `next:design`, change → `next:plan`, change with `Tasks` → `next:build`, bug → `next:debug`.
-       - Append `:lite` per `.bkit/lite.md` § `When to use`.
        - An existing single `next:*` stands unless `REPORT` corrects it.
      - **If** the type label (`enhancement|bug`) is missing → add it per shape. `REPORT` label corrections apply.
      - **If** a label is not in the repo or team labels → `Unapplied`.
