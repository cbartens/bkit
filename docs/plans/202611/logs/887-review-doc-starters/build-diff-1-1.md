diff --git a/.bkit/core/.agents/docs.md b/.bkit/core/.agents/docs.md
index 3955c9db4..ffcba51c9 100644
--- a/.bkit/core/.agents/docs.md
+++ b/.bkit/core/.agents/docs.md
@@ -45,7 +45,7 @@
 | `.bkit/jsonl.md` | ○ | ○ | ○ | ○ | ○ | Row format for the `*.jsonl` ledgers — envelope, per-kind fields, dedup tuples, write idiom. |
 | `.bkit/authoring.md` | ○ | ○ | ○ | ○ | ○ | Authoring rules for agent-read markdown — docs, prompts, workflows; punctuation and capitals. |
 
-> `Project Documents` below `bkit:end` belongs to the project, so `bkit install` never overwrites it and `bkit check` reports no drift for it. Add project-specific docs there. The ten recommended project documents (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) start as copies of `.bkit/templates/docs/`. Copy one into `docs/` and add its row there; an indexed document at another path stands in for its topic when its Scope names the recommended path (`Equivalent to docs/security.md`).
+> `Project Documents` below `bkit:end` belongs to the project, so `bkit install` never overwrites it and `bkit check` reports no drift for it. Add project-specific docs there. The ten recommended project documents (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) start as copies of `.bkit/templates/docs/`. Copy one into `docs/` and add its row there; an indexed document at another path stands in for its topic when its Scope names the recommended path (`Equivalent to docs/security.md`). Fill them in the order in `.bkit/templates.md` § Project docs — adoption order.
 
 <!-- bkit:end -->
 
diff --git a/.bkit/core/.bkit/authoring.md b/.bkit/core/.bkit/authoring.md
index d2a67384d..215c5f0f8 100644
--- a/.bkit/core/.bkit/authoring.md
+++ b/.bkit/core/.bkit/authoring.md
@@ -225,7 +225,7 @@ This section applies to `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md`,
 
 ## Docs
 
-This section applies to `.agents/**`, `.bkit/*.md` and `docs/*.md`. § All Agent-Read Files applies as well.
+This section applies to `.agents/**`, `.bkit/*.md`, `docs/*.md` and `.bkit/templates/docs/*.md`. § All Agent-Read Files applies as well.
 
 - **Rules header:** Open every doc with a `> [!CAUTION]` box holding `**Purpose:**` and `**Rules:**`.
   - Why: The box tells an agent what belongs in the doc and how to edit it before it reads the rest. The **Authoring** rule in `.agents/rules.md` has every agent follow it.
@@ -238,6 +238,31 @@ This section applies to `.agents/**`, `.bkit/*.md` and `docs/*.md`. § All Agent
 - **Index:** Give each new doc one row in `.agents/docs.md`, with the phases that read it and a one-line scope, and copy no text from the doc into it.
   - Why: The index is how agents find docs. Every prompt's Process starts by reading `.agents/docs.md` and loading the docs it lists for the task.
 
+- **Mermaid for diagrams:** Draw every diagram of flow, order, dependency or relationship as Mermaid; directory trees and command output stay plain text.
+  - Why: Mermaid renders on GitHub and reads as text to an agent, while ASCII art breaks when edited and misreads in a diff. A doc needs no chart, but a chart it has follows this rule.
+  - Say in one sentence what the arrows mean, and use node names from the doc's tables.
+  - Keep a chart to about 15 nodes, and split larger ones with `subgraph` or a second chart.
+  - Use only `flowchart`, `sequenceDiagram`, `erDiagram` or `stateDiagram-v2`, quote every label, and set no colours, `style` or `classDef`.
+  - Example: `.bkit/core/.bkit/templates.md` § Project docs — adoption order.
+
+- **Project-doc starters:** A starter in `.bkit/templates/docs/*.md` opens with a rules box holding **Purpose**, the rules, **Not here** and **Update when**.
+  - Why: The adopter fills a starter by hand, and no prompt does it for them, so the starter carries what a prompt would.
+  - **Purpose** says what the doc holds and the question it answers, with no "Read before …" clause, because the phase columns of `.agents/docs.md` say when to read it.
+  - **Not here** names what belongs elsewhere and where. **Update when** names the events that change the doc.
+  - A section marked `> **bkit practice:**` keeps its heading text and stays a separate section from the project's blanks.
+  - Example: `.bkit/templates/docs/components.md`.
+
+- **Current facts only:** Write the current state with no history, take every fact from code, config or an approved spec, and never copy template example text as a fact.
+  - Why: Agents act on what a doc says, so a stale or invented line causes wrong work.
+  - Put each unknown under `## Open questions`.
+
+- **Write once, link elsewhere:** Write each topic once, link to it from other docs, and name the file that holds a value instead of typing the value.
+  - Why: A second copy of a value goes stale and contradicts the first.
+  - Use a table for facts, and prose only for reasoning.
+
+- **Empty state:** Write `Not applicable: {reason}` for a doc, or a section, that does not apply to the project.
+  - Why: A reason separates a doc that does not apply from one nobody filled in.
+
 ## Prompts and Workflows
 
 This section applies to `.bkit/core/prompts/*.md`, the subagent prompts, and `.bkit/core/workflows/*.md`, the orchestrator prompts behind the slash commands. § All Agent-Read Files applies as well. § Output Formatting covers what these files ask an agent to write. § Prompts Only and § Workflows Only add rules for one kind of file.
@@ -485,8 +510,9 @@ A doc template is the skeleton of a document an agent fills in: the plan (`docs/
 | Build | `@bkit-build-plan-tasks` | Works each task until its `DONE WHEN` holds, and logs `DONE` or `BLOCKED`. It never edits a planned test and never ticks a task box. |
 | Verify | `@bkit-build-plan-verify`, then `bkit tasks tick` | Checks each task against the code. The engine ticks the tasks that pass. |
 
-- **Template is shape, prompt owns rules:** A template holds headings, tables, placeholders, checkbox labels, owner callouts and the markers the engine parses, and nothing else.
+- **Fill-in steps in the template, acting rules in the prompt:** A template holds headings, tables, placeholders, checkbox labels, owner callouts, the markers the engine parses and the instructions for filling it in; the rules for acting on it live in the prompts.
   - Why: Different agents write, review, convert, build and verify the plan, and a rule in the template reaches all of them, whether it applies or not.
+  - Project-doc starters in `.bkit/templates/docs/*.md` carry their own fill-in steps, because no prompt fills them.
   - Every rule for filling, reviewing or acting on a template lives in the prompt that acts on it, as a labelled Contract bullet worded the same in every prompt that carries it. `.bkit/instructions.md` § Template Instructions names the prompts that carry each rule and keeps their wording identical.
   - Exception: **Audit templates carry their procedure**.
   - Example (`docs/templates/bkit-plan.md` § Agent Execution Runbook): the plan template holds the shape of a task block.
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 63db1b022..86b4561aa 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -13,7 +13,7 @@
 
 ## What each template is for
 
-The adoption order is the `bkit tips` order. The machine lock has no tip, so adopt it when test gates or local services need to run one at a time across checkouts. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
+The adoption order of the tool templates is the `bkit tips` order; for the project docs it is § Project docs — adoption order. The machine lock has no tip, so adopt it when test gates or local services need to run one at a time across checkouts. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
 
 <!-- prettier-ignore -->
 | Template | What it's for | Skip it and |
@@ -659,7 +659,59 @@ Issues are the first input every workflow reads. There is one form per way work
 
 ## Project documents — starters and the index
 
-The ten project docs (architecture, technology, security, data-schema, testing, deployments, observability, design, noise, setup) ship as starters in `.bkit/templates/docs/`. Copy a starter to `docs/{topic}.md` and add a matching row to `.agents/docs.md` `## Project Documents` in the same change; install and upgrade refresh only the starter, never your copy. A doc you keep under another name takes a row whose Scope says `Equivalent to docs/{topic}.md`, and install then adds no second row. A prompt that reads one of these docs applies it only when the doc is present and warns when it is not.
+The ten project docs (architecture, technology, security, data-schema, testing, deployments, observability, design, noise, setup) ship as starters in `.bkit/templates/docs/`. Copy a starter to `docs/{topic}.md` and add a matching row to `.agents/docs.md` `## Project Documents` in the same change; install and upgrade refresh only the starter, never your copy. A doc you keep under another name takes a row whose Scope says `Equivalent to docs/{topic}.md`, and install then adds no second row. A prompt that reads one of these docs applies it only when the doc is present and warns when it is not. Fill the starters in the order of § Project docs — adoption order.
+
+## Project docs — adoption order
+
+Fill the project docs in waves, because each doc reads facts the earlier ones record. Each starter's **Fill these first** line lists the docs in the **Fill these first** column below.
+
+<!-- prettier-ignore -->
+| Wave | Doc | Fill these first |
+| --- | --- | --- |
+| 1 | `docs/idea.md` | — |
+| 2 | `docs/components.md` | `docs/idea.md` |
+| 3 | `docs/technology.md` | `docs/components.md` |
+| 3 | `docs/design.md` | `docs/components.md` |
+| 4 | `docs/architecture.md` | `docs/components.md`, `docs/technology.md` |
+| 4 | `docs/setup.md` | `docs/technology.md` |
+| 5 | `docs/security.md` | `docs/architecture.md` |
+| 5 | `docs/testing.md` | `docs/technology.md`, `docs/architecture.md` |
+| 5 | `docs/observability.md` | `docs/architecture.md` |
+| 6 | `docs/data-schema.md` | `docs/architecture.md` |
+| 6 | `docs/deployments.md` | `docs/architecture.md` |
+| 6 | `docs/noise.md` | `docs/observability.md` |
+| 7 | `docs/capabilities.md` | `docs/components.md` |
+
+A solid arrow means the first doc must exist before the second is started. A dotted arrow means the second doc is finished against the first, so come back to it once the first exists.
+
+```mermaid
+flowchart LR
+  IDEA["docs/idea.md"] --> COMP["components"]
+  COMP --> TECH["technology"]
+  COMP --> DESIGN["design"]
+  COMP --> ARCH["architecture"]
+  TECH --> ARCH
+  TECH --> SETUP["setup"]
+  TECH --> TEST["testing"]
+  ARCH --> TEST
+  ARCH --> SEC["security"]
+  ARCH --> OBS["observability"]
+  ARCH --> DATA["data-schema"]
+  ARCH --> DEPLOY["deployments"]
+  OBS --> NOISE["noise"]
+  COMP --> CAP["capabilities"]
+  SETUP -.-> TEST
+  DEPLOY -.-> TEST
+  DATA -.-> SEC
+  NOISE -.-> OBS
+```
+
+- **setup → testing:** the commands that start local services in `docs/setup.md` are the ones the testing doc's "Running locally" names.
+- **deployments → testing:** the CI lanes in `docs/testing.md` are finished against the release path in `docs/deployments.md`.
+- **data-schema → security:** the "Where stored" column of the PII table in `docs/security.md` is finished against `docs/data-schema.md`.
+- **noise → observability:** each noise entry is checked against the signals in `docs/observability.md`.
+
+`docs/idea.md` is the owner's free-form notes on the problem, the users and what the app must and must not do. It has no template, is not indexed in `.agents/docs.md`, and stays after `docs/components.md` exists.
 
 ## Component map — purpose and responsibilities
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index cab868a65..dccd3da55 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -24,7 +24,7 @@
 | `## Permissions` | Shipped `deny` / `ask` / `allow` patterns by group |
 | `## Special Behaviors` | `.bkit/prompts.md` § Special Behaviors rows |
 | `## Authoring Rules` | The workflow anatomy sections of `.bkit/workflows.md` |
-| `## Template Instructions` | The prompts carrying each instruction the shape-only plan and audit templates leave out |
+| `## Template Instructions` | The prompts carrying each instruction the plan and audit templates leave out |
 | `## Local Instructions` | Every standing line no clause matches, shared lines first, then file by file |
 
 Rule section lines:
@@ -9888,7 +9888,7 @@ Every command has a `🤖 Failure Path` section before Step 1. Any step, tool or
 
 ## Template Instructions
 
-The plan template holds shape only: headings, tables, placeholders, checkbox labels, owner callouts and the lines engine code parses. An audit template holds shape plus what only it knows: its probe steps and its own rules. Every other instruction lives in the prompts that act on it. Plan rules sit in each prompt's **Contract** as a labelled bullet, word for word across prompts; `.agents/rules.md` rules sit in its `**Rules:**` block, named by the rule's `- carry:` line.
+The plan template holds headings, tables, placeholders, checkbox labels, owner callouts and the lines engine code parses; the rules for acting on it live in the prompts. An audit template holds shape plus what only it knows: its probe steps and its own rules. Every other instruction lives in the prompts that act on it. Plan rules sit in each prompt's **Contract** as a labelled bullet, word for word across prompts; `.agents/rules.md` rules sit in its `**Rules:**` block, named by the rule's `- carry:` line.
 
 ### Plan template
 
