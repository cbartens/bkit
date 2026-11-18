diff --git a/.agents/rules.md b/.agents/rules.md
index 29565a151..56796043d 100644
--- a/.agents/rules.md
+++ b/.agents/rules.md
@@ -194,6 +194,8 @@
 - **Edit source:** Edit only the sources in `.bkit/core/*`, `.bkit/shared/*` and `.bkit/templates/*`, then mirror them. Do not edit the mirrors in `.claude/*`, `.cursor/*`, `.opencode/*` and `.codex/*` directly. In `.agents/*`, edit only the text below `bkit:end` in its `.md` files; `bkit install` or a skill installer writes the rest.
 - **Authoring sections:** Before editing an agent-read file, read the `.bkit/authoring.md` sections that § Which Sections Apply lists for it, and follow them. Before you finish, work through § Before You Save.
 - **Shared instructions:** Before editing sentences in `.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`, the `bkit:start` / `bkit:end` block of `.agents/rules.md` or a `bkit-audit-*` template, run `pnpm instructions:show --file {basename}` (or `grep` `.bkit/instructions.md`).
+- **Shared wording sync:** After a clause edit in `.bkit/instructions.md` § Clauses, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first; it reports what would change and writes nothing. Run `pnpm instructions:sync` only when the report shows the change you expect. After editing a bkit rule, run the same check and sync. Checked by `.bkit/core/engine/tools/instructions.test.ts`.
+- **Save checklist:** After changing a rule, a clause or `.bkit/authoring.md`, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` and read what it reports. Run the tests named in the `Checked by:` lines of the rules you touched.
 - **Contract changes:** Before changing fields, artifacts or verdicts that workflows or prompts pass between steps, run `grep -l` across `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/`, read every hit in full whatever `Code reads` says about ranges, and trace the change through the resume, no-plan convert, per-group loop and remediation paths.
 - **Provider parity:** Make every agent-facing change (workflows, prompts, permissions, hooks, shell) work across all providers: verify it on each provider, and keep shell POSIX-portable.
 - **Stack-agnostic:** The engine, workflows and prompts assume no app stack. Express a stack-specific need only as a `package.json` script name plus its I/O contract (`.bkit/workflows.md` § Local gate scripts); the consumer owns the implementation.
diff --git a/.bkit/authoring.md b/.bkit/authoring.md
index 58d3a581a..ebe1dd846 100644
--- a/.bkit/authoring.md
+++ b/.bkit/authoring.md
@@ -178,9 +178,6 @@ This section applies to `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md`,
 - **Shared wording:** Change a sentence that two or more shipped files carry word for word only in its one home, `.bkit/instructions.md` § Clauses.
   - Why: The sync tool writes the clause into every file that carries it, so the copies cannot drift.
   - A shared line with per-file detail is a `{{slot}}` template in that section. The slot matches each file's own detail, so the sync tool leaves that detail in place.
-  - After the edit, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first. It reports what would change and writes nothing.
-  - Run `pnpm instructions:sync`, which writes the change into every file, only when that report shows the change you expect.
-  - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.
 
 - **Current state:** Describe how things work now, and leave out history: what an older version did, why it changed, or which incident caused it.
   - Why: An agent acts on what it reads, so a sentence about old behaviour gets followed as if it were current. Decisions go in `docs/decisions.jsonl`, and incidents in `docs/knowledge.jsonl`.
@@ -287,7 +284,7 @@ Every prompt and workflow has the same parts, in this order:
   - When the closest case breaks a rule in this file, follow the rule, not the case.
 
 - **Header blocks:** After `**Role:**` and `**Scope:**`, every prompt and workflow has three blocks, in this order: `**Protocol:**`, `**Contract:**`, `**Rules:**`, each opening with its fixed lead-in line from `.bkit/instructions.md` and then one bullet per line.
-  - Why: Fixed blocks let an agent find what a file asks of it at a glance, and let `pnpm instructions:sync` maintain the shared lines.
+  - Why: Fixed blocks let an agent find what a file asks of it at a glance, and let the sync tool maintain the shared lines.
   - Protocol holds a line only if it would read the same in a file with a different job. Prompts order it `**Rules file:**`, `**Order:**`, `**No improv:**`. Workflows add `**Narrate:**`, ``**`Failures`:**``, `**Placeholders:**`, `**Commands:**`, `**Timeouts:**` and `**CI wait turn-loop:**`.
   - Contract is the deal between the agent and whoever runs it: the orchestrator for a prompt, and for a workflow the person who started it plus the bkit engine. It opens with `**Read / Update / Create:**`, `**Mandate:**` and `**No commits:**`, then holds every line specific to this agent's job. A workflow's tracker groups sit inside it.
   - Rules holds bkit rules from `.agents/rules.md`, word for word and in `rules.md` order, and nothing else.
@@ -295,7 +292,6 @@ Every prompt and workflow has the same parts, in this order:
     - **If** it says what a bkit rule says, in any words → it is that rule. Carry the rule word for word in Rules, and delete the paraphrase.
     - **If** it is about this agent's job → Contract.
     - **Else** → Protocol.
-  - Checked by: `.bkit/core/engine/tools/instructions.test.ts` checks block order, the shared lines and `**Rules file:**`. `.bkit/core/engine/tools/instructions.ts` fails a Protocol or Contract bullet that copies a bkit rule's text.
 
 - **Placeholders say who fills them:** Mark every value filled in later with the marker for whoever fills it.
   - Why: Different readers fill different markers at different times. A marker that names the wrong one leaves a literal placeholder in a command or a commit message. In a workflow, a flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -321,9 +317,8 @@ Every prompt and workflow has the same parts, in this order:
 
 - **Cross-file alignment:** When you change an instruction, change every prompt and workflow that carries it in the same edit.
   - Why: Two files that disagree make the pipeline contradict itself: one agent writes what the next one rejects.
-  - A bkit rule: edit `.agents/rules.md`. The rule's `- carry:` line in `.bkit/instructions.md` names the prompts that copy it into their `**Rules:**` block. Then run the check and the sync that § All Agent-Read Files, **Shared wording** names.
+  - A bkit rule: edit `.agents/rules.md`. The rule's `- carry:` line in `.bkit/instructions.md` names the prompts that copy it into their `**Rules:**` block.
   - A shared sentence: follow **Shared wording**.
-  - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.
 
 - **Long inputs before instructions:** When a prompt embeds a long input (a diff, a log, a document), put it above the instructions that act on it, with the question last.
   - Why: Answers improve when the long context comes first and the question last.
@@ -718,8 +713,6 @@ This section applies to `.bkit/core/workflows/*.md`. § Prompts and Workflows ap
 ## Before You Save
 
 - Re-read every added or edited passage once for token efficiency, cutting filler, repetition and wording with a shorter equivalent. Keep the original wording wherever shortening would lose meaning, clarity or compliance with the applicable rules.
-- Run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` after you change a rule, a clause or this file, and read what it reports. It writes nothing (§ All Agent-Read Files, **Shared wording**).
-- Run the tests named in the `Checked by:` lines of the rules you touched.
 - Read the change once as a tier-1 model would: check each capital word against the test in § All Agent-Read Files, **Capitals only for invariants**, and check that the done condition and the early stops are named.
 - Read it once more as a tier-2 model would: for each step, check that the order, the inputs and the output are all stated.
 
diff --git a/.bkit/core/.bkit/authoring.md b/.bkit/core/.bkit/authoring.md
index 4e37d6add..41b18b065 100644
--- a/.bkit/core/.bkit/authoring.md
+++ b/.bkit/core/.bkit/authoring.md
@@ -178,9 +178,6 @@ This section applies to `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md`,
 - **Shared wording:** Change a sentence that two or more shipped files carry word for word only in its one home, `.bkit/instructions.md` § Clauses.
   - Why: The sync tool writes the clause into every file that carries it, so the copies cannot drift.
   - A shared line with per-file detail is a `{{slot}}` template in that section. The slot matches each file's own detail, so the sync tool leaves that detail in place.
-  - After the edit, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first. It reports what would change and writes nothing.
-  - Run `pnpm instructions:sync`, which writes the change into every file, only when that report shows the change you expect.
-  - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.
 
 - **Current state:** Describe how things work now, and leave out history: what an older version did, why it changed, or which incident caused it.
   - Why: An agent acts on what it reads, so a sentence about old behaviour gets followed as if it were current. Decisions go in `docs/decisions.jsonl`, and incidents in `docs/knowledge.jsonl`.
@@ -287,7 +284,7 @@ Every prompt and workflow has the same parts, in this order:
   - When the closest case breaks a rule in this file, follow the rule, not the case.
 
 - **Header blocks:** After `**Role:**` and `**Scope:**`, every prompt and workflow has three blocks, in this order: `**Protocol:**`, `**Contract:**`, `**Rules:**`, each opening with its fixed lead-in line from `.bkit/instructions.md` and then one bullet per line.
-  - Why: Fixed blocks let an agent find what a file asks of it at a glance, and let `pnpm instructions:sync` maintain the shared lines.
+  - Why: Fixed blocks let an agent find what a file asks of it at a glance, and let the sync tool maintain the shared lines.
   - Protocol holds a line only if it would read the same in a file with a different job. Prompts order it `**Rules file:**`, `**Order:**`, `**No improv:**`. Workflows add `**Narrate:**`, ``**`Failures`:**``, `**Placeholders:**`, `**Commands:**`, `**Timeouts:**` and `**CI wait turn-loop:**`.
   - Contract is the deal between the agent and whoever runs it: the orchestrator for a prompt, and for a workflow the person who started it plus the bkit engine. It opens with `**Read / Update / Create:**`, `**Mandate:**` and `**No commits:**`, then holds every line specific to this agent's job. A workflow's tracker groups sit inside it.
   - Rules holds bkit rules from `.agents/rules.md`, word for word and in `rules.md` order, and nothing else.
@@ -295,7 +292,6 @@ Every prompt and workflow has the same parts, in this order:
     - **If** it says what a bkit rule says, in any words → it is that rule. Carry the rule word for word in Rules, and delete the paraphrase.
     - **If** it is about this agent's job → Contract.
     - **Else** → Protocol.
-  - Checked by: `.bkit/core/engine/tools/instructions.test.ts` checks block order, the shared lines and `**Rules file:**`. `.bkit/core/engine/tools/instructions.ts` fails a Protocol or Contract bullet that copies a bkit rule's text.
 
 - **Placeholders say who fills them:** Mark every value filled in later with the marker for whoever fills it.
   - Why: Different readers fill different markers at different times. A marker that names the wrong one leaves a literal placeholder in a command or a commit message. In a workflow, a flag still holding a literal `{PLACEHOLDER}` exits 2.
@@ -321,9 +317,8 @@ Every prompt and workflow has the same parts, in this order:
 
 - **Cross-file alignment:** When you change an instruction, change every prompt and workflow that carries it in the same edit.
   - Why: Two files that disagree make the pipeline contradict itself: one agent writes what the next one rejects.
-  - A bkit rule: edit `.agents/rules.md`. The rule's `- carry:` line in `.bkit/instructions.md` names the prompts that copy it into their `**Rules:**` block. Then run the check and the sync that § All Agent-Read Files, **Shared wording** names.
+  - A bkit rule: edit `.agents/rules.md`. The rule's `- carry:` line in `.bkit/instructions.md` names the prompts that copy it into their `**Rules:**` block.
   - A shared sentence: follow **Shared wording**.
-  - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.
 
 - **Long inputs before instructions:** When a prompt embeds a long input (a diff, a log, a document), put it above the instructions that act on it, with the question last.
   - Why: Answers improve when the long context comes first and the question last.
@@ -718,8 +713,6 @@ This section applies to `.bkit/core/workflows/*.md`. § Prompts and Workflows ap
 ## Before You Save
 
 - Re-read every added or edited passage once for token efficiency, cutting filler, repetition and wording with a shorter equivalent. Keep the original wording wherever shortening would lose meaning, clarity or compliance with the applicable rules.
-- Run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` after you change a rule, a clause or this file, and read what it reports. It writes nothing (§ All Agent-Read Files, **Shared wording**).
-- Run the tests named in the `Checked by:` lines of the rules you touched.
 - Read the change once as a tier-1 model would: check each capital word against the test in § All Agent-Read Files, **Capitals only for invariants**, and check that the done condition and the early stops are named.
 - Read it once more as a tier-2 model would: for each step, check that the order, the inputs and the output are all stated.
 
diff --git a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
index d1b891f1b..2265ee6cf 100644
--- a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
+++ b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
@@ -508,3 +508,19 @@ describe("starter section citations", () => {
     expect(unresolvedCitations()).toEqual([]);
   });
 });
+
+// ---------------------------------------------------------------------------
+// The shipped authoring doc names no bkit-repo-only command
+// ---------------------------------------------------------------------------
+
+/** Commands and files that exist only in the bkit repo, never in a consumer repo. */
+const BKIT_ONLY_COMMANDS =
+  /instructions\.ts|instructions:sync|instructions:show|instructions\.test\.ts/;
+
+describe("shipped authoring doc", () => {
+  it("the shipped authoring.md names no command that exists only in the bkit repo", () => {
+    const rel = ".bkit/core/.bkit/authoring.md";
+    expect(fs.existsSync(path.join(REPO_ROOT, rel))).toBe(true);
+    expect(allLines(rel, BKIT_ONLY_COMMANDS)).toEqual([]);
+  });
+});
diff --git a/.bkit/version b/.bkit/version
index 3996bb507..8014acd32 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -250,7 +250,7 @@
     ".cursor/agents/bkit-build-plan-convert.md": "1cb63488d3c8a57f92c3f846701f20952d6793f0aa6c7c621ab06560ab580c42",
     ".opencode/agents/bkit-build-plan-convert.md": "e1404b09e11aa8acf2ed59bbcfa209a9b54ab7b52c29ddce3f88c35b75e257c9",
     ".codex/agents/bkit-build-plan-convert.toml": "fce652a70c366daad32c6135a12d43705e4ea0fbca39c9c410d51bc6e635922f",
-    ".bkit/authoring.md": "434a94955b38d39f86e2b05ef296bc176d483c2e456258e15b743670fb19be18",
+    ".bkit/authoring.md": "87bbb124721417bed8baade6c80a2a85877dad24a571c9645b22bc9ae71be7c8",
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
diff --git a/docs/testing.md b/docs/testing.md
index dbc6b1cf1..f98926ef6 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -736,7 +736,7 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 - `checks/after/tools.test.ts` and `checks/after/index.test.ts` cover `detectProjectDocs` states, equivalents, unsafe paths, suppression and the advisory-only severity.
 - `install/project-docs.test.ts` (starter shape, `adoptedProjectDocPath`, equivalence), `checks/tips/catalogue.test.ts` (the `project-docs` tip), `checks/after/tools.test.ts` (advisory text and equivalence), `install/template-copies.integration.test.ts` and `commands/install/upgrade.integration.test.ts` (the adopted-starter marker in the upgrade report) cover the adoption pointers.
 - `commands/workflow/summary.test.ts` and `commands/workflow/workflows.integration.test.ts` cover warning aggregation for the active run through the real `workflows summary` command.
-- `audits/repo/shipped-docs-refs.test.ts` covers the responsibility inventory in the workflow and prompt catalogs, the named references and the warning contracts.
+- `audits/repo/shipped-docs-refs.test.ts` covers the responsibility inventory in the workflow and prompt catalogs, the named references and the warning contracts. It also fails when the shipped `authoring.md` names a command that exists only in the bkit repo.
 
 ## Key test files
 
