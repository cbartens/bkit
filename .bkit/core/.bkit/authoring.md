# Authoring Rules

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** How to write the files bkit's agents read (prompts, workflows, doc templates and docs) so that every model bkit runs on follows them the same way.
>
> **Rules:**
>
> - Read § How to Read This File and § All Agent-Read Files, then every section that applies to the kind of file you are editing or the change you are making. Each section opens by saying when it applies.
> - Before you add a rule, search this file and `.agents/rules.md` for it. Each rule has one home.
> - This file ships to every project that installs bkit. Describe the current setup only.

## How to Read This File

This file follows its own rules, so every rule has the same shape:

- The first line is `- **Lead:** {the rule}`. It must make sense on its own, because GateGuard (the hook that reminds an agent of these rules while it edits a prompt or workflow) quotes only that line.
- `Why:` gives the reason. Every rule here has one because this file teaches. A prompt gives a reason only where a rule's edge is not obvious (§ All Agent-Read Files, **Reasons where the edge is not obvious**). Which maker's guide backs a rule is in § Who Says What, and nowhere else.
- The bullets after `Why:` give the rule's detail: its conditions, its limits and any `Exception:`.
- `Example:` names a bkit file and section, and shows that passage written to every rule here, or points to an example elsewhere in this file. Where the file itself reads differently, the example is the target.
- `Checked by:` names the test that enforces the rule, when there is one. Breaking a rule with a test fails CI. Every other rule relies on you.
- The sub-bullets of every rule run in that order: `Why:`, the detail, `Example:`, `Checked by:`.

The owner is the person who runs a workflow, answers its questions and approves its work.

### Where the Rules Come From

One prompt text runs on every model bkit pins. `bkit install` renders the same source for each host, and the hosts fall into two tiers:

<!-- prettier-ignore -->
| Tier | Host | Models |
| --- | --- | --- |
| 1 | Claude Code | Anthropic Claude Opus 5.5 and Claude Sonnet 5.5 |
| 1 | Codex | OpenAI GPT-6.1 Sol and GPT-6 Astra |
| 1 | Antigravity | Google Gemini 4 Argon |
| 2 | Cursor | Cursor Composer 2.5 and xAI Grok 4.5 |
| 2 | OpenCode, Ollama | DeepSeek V4.1 Flash, with a tier-1 model on the key gates |

Tier 1 is where bkit runs day to day, on each maker's latest models. Tier 2 takes over when a subscription runs out. Which agent runs on which model, and at what effort, is in `.bkit/prompts.md` § Models.

## All Agent-Read Files

This section applies to `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md`, `.agents/**`, `.bkit/**`, `docs/**` (doc templates included), `AGENTS.md`, `CLAUDE.md` and `GEMINI.md`.

- **Write for every model:** Write first for the current tier-1 models (§ Where the Rules Come From), and make the text plain enough for tier-2 models wherever that does not conflict with a tier-1 guide.
  - Why: Current tier-1 models act on emphasis and step-by-step detail more readily than older models did, so wording written to push an older model now makes them over-apply a rule or stop too early. A tier-2 model fills gaps with guesses, so state the order of work, the exact file names and what "done" means. One text usually serves both.
  - Example (`bkit-build-install-skills.md` § Process, steps 6-7): every threshold is a number, and the step says how to check that it worked.
    ```markdown
    6. For each gap, run `npx skills find {technology}`:
       - Accept a candidate only when an official publisher ships it, or when it has at least 1000 installs and its repo has at least 100 stars.
       - Hold the accepted skill's exact `{owner/repo}@{skill}`.
    7. For each accepted skill, run `npx skills add {owner/repo}@{skill} -y`:
       - Name one skill, never a bare repo. A bare repo installs the publisher's whole catalogue.
       - Check that the skill's folder now appears under `.agents/skills/`.
       - Install at most 10 new skills in one run.
    ```

- **Say what to do:** Write each instruction as the action to take. Add what not to do only where a model would otherwise do it, and name the exact pattern and its alternative.
  - Why: A ban alone leaves the model to guess which action is allowed.
  - Example (`bkit-design-spike.md` § Contract, **Probe size**): "One minimal probe per claim. Mark a claim that needs more than a single-file probe `BLOCKED`, rather than growing the probe." The rule names what to do when a probe would grow, so the model has an action in place of the growth.
  - Example (`bkit-debug-failure-reproduce.md` § Process, step 5): "Write one test per reported behaviour, named for it and built from the reported steps, the affected areas and the `context-*` evidence. Assert the outcome the report expects, not the broken behaviour it describes." The second sentence keeps its negative because a model reproducing a bug would otherwise assert the bug, and it names the alternative first.

- **One instruction per bullet:** Give each instruction its own bullet or numbered step, and join clauses in one sentence only when they are one action.
  - Why: Separate lines make each instruction visible, countable and checkable, for the model and for the person reviewing the prompt. They also show the order of work.
  - Use `;` only as ordinary English does, never to chain separate instructions.
  - Example (`bkit-design-review-2.md` § Process, step 6): one check per line, and the finding they lead to on a line of its own, not as a fourth check.
    ```markdown
    6. For each failure mode, check that the design specifies or assumes each of these:
       - Structured logs at the point of failure, with the project's `[Context]` prefix.
       - A metric or counter for how often the failure happens.
       - A trace span or correlation id for a flow that crosses services.
       - **If** a `CRITICAL` failure mode lacks any of them → raise a `CRITICAL` finding.
    ```

- **Conditions on their own lines:** Put a condition that covers more than one instruction on its own line, with the instructions it covers as sub-bullets beneath it.
  - Why: In a run-on line, nothing shows where a condition's reach ends, and different models end it in different places. Indentation shows every model the same thing.
  - A condition on one short instruction may stay in its sentence ("Accept a candidate only when …"), or on one line as `**If** {condition} → {action}.`
  - Example (`bkit-ship-conflict-resolve.md` § Process, step 11): a condition inside a condition, with the reach of each shown by its indentation.
    ```markdown
    11. **If** `Verdict` = `FAIL`:
        - **If** `git status` reports a rebase in progress:
          - Run `git rebase --abort`.
          - **If** it exits non-zero → append its error to the log word for word.
        - Confirm that the working tree is clean with `git status --short`.
        - Leave the sentinel in place.
        - Append the log entry `ABORTED — clean tree restored`.
    ```

- **Reasons where the edge is not obvious:** Add a short reason, or the fact that decides the case, wherever a model could misread where a rule stops or would over-apply it.
  - Why: A reason lets the model handle a case the rule did not foresee, and it stops a strong model from stretching the rule. Reasons cost length on every run, so spend them where the edge is unclear.
  - Leave a rule with a plain edge bare.
  - The long story goes elsewhere: trade-offs go in the catalogue for the kind of file (`.bkit/prompts.md`, `.bkit/workflows.md`), and decisions in `docs/decisions.jsonl`.
  - Example (`bkit-audit-issues.md` § Size Scale): "Size the work, not the issue body. A long evidence write-up can describe a one-file fix." Without the second sentence, a model would reasonably size a long issue as large.
  - Example (`bkit-utility-update-tracker.md` § Process, step 9): "Change labels with `addLabels` and `removeLabels`, NEVER `labels`. `labels` replaces the issue's whole label set." Without the second sentence, `labels` looks like the simpler call. The reason also explains the capitals: one wrong call deletes every other label on the issue.

- **Capitals only for invariants:** Write `NEVER`, `ALWAYS`, `MUST`, `ONLY` or `PROHIBITED` in capitals only where breaking the rule once would destroy data, leak a secret, publish or push something, skip the owner's approval, or break a field a program parses.
  - Why: Current models act on capitals more strongly than older ones did, so capitals on an ordinary instruction override the judgement the task needs, and a strongly worded boundary can stop work the owner wanted done. Rare capitals also keep their force.
  - To decide, ask what breaks if the model ignores the rule once:
    - **If** the answer is one of the five harms above → capitals.
    - **Else** → lowercase. A worse result that a later step can catch is not one of the five harms.
  - Use at most one of the five words per clause. Write each one bare, never inside backticks, a label, a heading or a compound word, except where a rule names the word itself, as this one does.
  - Lowercase `never` and `do not` are ordinary instructions.
  - Never bold one of the five words. Bold already marks structure, so `**NEVER**` stacks two signals and the model over-applies the rule.
  - Bold and capitals meet in two places only: the `**STOP**` marker, and field names a program parses. A plan's task labels (`**TASK 2:**`, `**DONE WHEN:**`, `**TEST FIRST:**`) are names, not emphasis, and stay in capitals because the plan parser rejects any other case (§ Doc Templates, **Machine markers stay exact**).
  - Example (`bkit-audit-repo.md` § Rules): "NEVER delete, prune, push, drop a stash or rewrite history. Name the command in the finding, and leave it unrun." An audit that runs the command destroys work or publishes it.
  - Example (`bkit-design.md` § Step 3 — Grill, step 2): "Ask the owner in this session. NEVER hand a question to a subagent." A subagent that answers in the owner's place skips the owner's approval.
  - Example (`bkit-build-challenge-1.md` § Contract, **Output header**): "Every line above `<!-- verdict:end -->` MUST stay machine-parseable." The engine parses those lines.
  - Example (`bkit-build-plan-current.md` § Contract, **Evidence not distance**): "A task is affected only where a path, symbol, signature or contract it depends on has moved. Commit count and elapsed time never decide the verdict." This stays lowercase: a wrong verdict here is a worse result that a later step can catch, not one of the five harms.

- **Examples where format or judgement matters:** Show a filled example wherever the output has a fixed format, or wherever the model makes a judgement that a rule cannot fully state.
  - Why: An example settles format and judgement where a description leaves doubt. Models copy examples closely, details included, so an example shows only what you want copied. When you give several, vary the details that should vary.
  - Show the target only, never a wrong version to avoid. Positive examples work better than negative ones, a model may copy the wrong version, and a quoted wrong version goes stale once the file it came from is fixed.
  - Exception: a prompt whose job is rewriting text shows input → output pairs, because the input is what the model is given, not a wrong version. Every pair shows the right output. Where the right output is the input left as it was, the pair says `unchanged`.
  - Where examples go: in a template, as `[e.g., …]` placeholders and example rows. In a prompt, as the `**Output format:**` block, plus a filled sample where a later step parses the output and the shape alone leaves doubt.
  - Example (`bkit-utility-compress-markdown.md` § Process, step 6, shortened): pairs that change the text, and pairs that keep it.
    ```markdown
    6. Match these pairs:
       - `In order to verify the build, we will need to run the test suite and check the output for any failures.` → `To verify the build, run the test suite and check the output for failures.`
       - `[docs/security.md](../../docs/security.md)` → `docs/security.md`
       - `Retry at most 3 times.` → unchanged
       - `## Verification Record` → unchanged
    ```
  - Example (`docs/templates/bkit-plan.md` § Reuse Inventory, shortened): the first row's cells say what goes in each column and decide `EXTEND`. The `[e.g., …]` row decides `NEW`, so the filling agent sees both outcomes, not one to copy.
    ```markdown
    <!-- prettier-ignore -->
    | Capability | File | Search performed | Existing candidates | Decision | Justification |
    | --- | --- | --- | --- | --- | --- |
    | [what the plan must do] | `path/to/existing` | `grep -rn "..."`, references to `{symbol}`, `docs/capabilities.md`, `{framework} {capability} built-in` | `path/to/existing` — covers [X], missing [Y] | EXTEND | [what changes in it to close the gap] |
    | [e.g., status change action] | `packages/api/src/items/setStatus.ts` | [the exact commands and queries run] | None — [what was searched] | NEW | [reason a, b or c] |
    ```
  - Example (`bkit-build-challenge-2.md` § Process, step 7): several varied cases per class, so the model learns where the line between the classes runs instead of copying one case.
    ```markdown
    - `class: mechanical` = a surgical edit with no redesign, such as a missing soft-delete filter, auth check, input validator or redaction, or a hardcoded secret to move into an env var → `fixable: true`.
    - `class: architectural` = a redesign, such as a wrong auth model, a tenancy boundary in the wrong layer, a data-access policy broken by design, or work that needs the plan or design redone → `fixable: false`.
    ```

- **Decision rules for judgement calls:** When the model must choose, give it the rule that decides: the cases in order, and which one wins when several fit.
  - Why: "Use your judgement" makes each model choose differently, and so does a vague threshold such as "important".
  - Example (`bkit-design-generate.md` § Process, step 6): a default for each kind of answer, the only grounds to depart from it, and what to record when the model does.
    ```markdown
    6. Weigh the input's `Grill decisions`, with the owner's answers, against the brainstorms. Treat them as strong pointers, not hard constraints:
       - `Settled` → follow the answer.
         - **If** a brainstorm shows the answer breaks a named contract, rests on a disproven assumption or carries a cost the question did not surface:
           - Depart from the answer.
           - Add a `Decisions` row naming the departed `Q{n}` and why.
           - Add a `Risks & Open Questions` item asking the owner to confirm the departure.
       - `Assumed, not confirmed` → use the answer as the default. Override it only with a reason stated in `Decisions`.
       - `Open` → add one `Risks & Open Questions` item for each.
    ```
  - Example: the verdict mapping under § Prompts Only, **Verdicts are decision rules**.

- **Only what a model can't find:** Write down what a model cannot learn by reading the repo, or would have to dig for on every run: decisions, gotchas, commands and contracts. Leave out what the code already shows, such as the file layout.
  - Why: A model reads the code faster than a description of it, and every line of an agent-read file is read on every run. The longer the file, the more likely the model misses the line that mattered.
  - Example (`.bkit/prompts.md` § Orchestrators (slash commands)): the warning never to set `CLAUDE_CODE_EFFORT_LEVEL`, because the variable overrides every subagent's `effort:` frontmatter. No file in the repo shows that the variable wins.

- **Say it once:** State each rule in one place, and change shared wording only through the tools that copy it.
  - Why: Repeating a rule for emphasis makes current models over-apply it. Copies drift until they contradict each other, and a model that meets conflicting guidance may pause or follow either copy.
  - Within a file: one rule, one bullet.
  - Between docs: § Docs, **One home per topic**.
  - Between prompts and workflows: § Prompts and Workflows, **Cross-file alignment**.

- **Shared wording:** Change a sentence that two or more shipped files carry word for word only in its one home, `.bkit/instructions.md` § Clauses.
  - Why: The sync tool writes the clause into every file that carries it, so the copies cannot drift.
  - A shared line with per-file detail is a `{{slot}}` template in that section. The slot matches each file's own detail, so the sync tool leaves that detail in place.
  - After the edit, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first. It reports what would change and writes nothing.
  - Run `pnpm instructions:sync`, which writes the change into every file, only when that report shows the change you expect.
  - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.

- **Current state:** Describe how things work now, and leave out history: what an older version did, why it changed, or which incident caused it.
  - Why: An agent acts on what it reads, so a sentence about old behaviour gets followed as if it were current. Decisions go in `docs/decisions.jsonl`, and incidents in `docs/knowledge.jsonl`.
  - A reason is not history. A reason explains the rule as it stands. History explains how the rule came to be.
  - Exception: files whose purpose is the record, such as ledgers and audit reports.

- **No internal labels:** Name the behaviour, never an internal record of it: no tracker issue numbers, ledger keys, review-finding ids or coined guard names.
  - Why: These files ship to projects that cannot see bkit's tracker or ledgers, so the label means nothing to their agents.
  - Example: write "the open-PR pre-flight", not the id of the finding that led to it.

- **Plain, complete sentences:** Write normal English sentences, with their articles and grammar words, and keep them short by cutting filler, hedges and repetition, not grammar.
  - Why: Clipped text saves few tokens and is where weaker models misread who does what. Each word that remains should carry meaning.
  - When an instruction covers more than one item, say which: `each {item}`, `every {item}`, or `one {thing} per {item}` ("append one row per flaky test"). A literal reader applies an instruction only to what it names.
  - A subject and its pronoun agree in number: "files … them", "a file … it".
  - Call one thing by one name throughout a file. A reader who meets two names looks for two things.

- **Removal = delete:** To remove an instruction, delete it, with no note saying it was removed or what replaced it.
  - Why: A removal note is history, and a model may act on the removed rule it names.

- **Notation:** Each symbol has one job, listed in § Notation, and nothing else marks structure.
  - Why: One meaning per mark lets every model read the structure the same way.

### Notation

<!-- prettier-ignore -->
| Mark | Its one job | Example |
| --- | --- | --- |
| `→` | "Then" or "goes to": a condition's result, the next step, a key's value, or a pointer to a file. Never written `->`. | `**If** exit non-zero → **Failure Path**.` |
| `=` | "Is" or "is set to": defines a value, or sets a held variable. | `` `PASS` = no task is affected `` |
| `**If**`, `**Else**`, `**and**`, `**or**` | Condition operators, always bold and spelled exactly so. Workflows add `**Run only if**` and `**Skip if**`. | `**Else** → Step 8.` |
| `/` | "Any of these, treated the same." Spaced between words, and unspaced in fixed terms (`I/O`, `CI/CD`) and inside backticks. | `build / debug` |
| `` `A\|B\|C` `` | A closed set of values, where a line states the whole set: one backticked union, in canonical order. | `` `PASS\|CONCERNS\|FAIL` `` |
| Backticks | Anything literal: paths, commands, fields, values, variables and closed-vocabulary words. In a workflow, a value compared with a variable stays plain (§ Workflows Only, **Variable names**). | `` `DONE WHEN` ``, `` `CRITICAL` `` |
| `—` | Attaches a short explanation to the thing just named. Write "because", "so" or "but" for those meanings. | `Step 7 — Plan Execute` |
| `-` | A hyphen in compound words and number ranges (`2-3`), never a dash. | `read-only` |
| `()` | A short note on what comes just before it: its members, a definition, an example, or the file or section that covers it. Never a condition, a second instruction or a reason. | `` (`DONE` or `BLOCKED`) `` |
| `§` | Cites a section by its title, without `#` marks. | `docs/templates/bkit-plan.md` § Open Questions & Assumptions |
| `!=`, `>=`, `<=`, `=>` | Comparison and logic operators, in ASCII only. `x` for dimensions. | `exit >= 2` |
| `**…**` | Structure only: rule leads and field labels, a rule's name where it is cited, condition operators, jump targets and stop markers, and a prompt's I/O markers. Never emphasis, because emphasis bold works on a model like capitals. | `**Mandate:**`, `**Failure Path**`, `**STOP**`, `**Read**` |
| `⛔`, `🔒`, `👤` | Fixed markers: `⛔` opens a prompt's Stop line, `🔒` a gate heading, and `👤` the heading of a section the owner must read. Any other emoji in a fixed heading is part of its text and stays exact. | `### 🔒 Gate {n} — {step name}` |
| `_…_` | The title of a published work. Nothing else. | `_Agentic Design Patterns_` |

## Docs

This section applies to `.agents/**`, `.bkit/*.md` and `docs/*.md`. § All Agent-Read Files applies as well.

- **Rules header:** Open every doc with a `> [!CAUTION]` box holding `**Purpose:**` and `**Rules:**`.
  - Why: The box tells an agent what belongs in the doc and how to edit it before it reads the rest. The **Authoring** rule in `.agents/rules.md` has every agent follow it.
  - Example: the box at the top of this file.

- **One home per topic:** Before you write, find the topic's home in the `.agents/docs.md` index, and write there.
  - Why: Agents load docs by topic from the index. A second copy gets loaded too, goes stale and contradicts the first.
  - Two docs covering one topic is a bug. Pick one home, and link to it from the other.

- **Index:** Give each new doc one row in `.agents/docs.md`, with the phases that read it and a one-line scope, and copy no text from the doc into it.
  - Why: The index is how agents find docs. Every prompt's Process starts by reading `.agents/docs.md` and loading the docs it lists for the task.

## Prompts and Workflows

This section applies to `.bkit/core/prompts/*.md`, the subagent prompts, and `.bkit/core/workflows/*.md`, the orchestrator prompts behind the slash commands. § All Agent-Read Files applies as well. § Output Formatting covers what these files ask an agent to write. § Prompts Only and § Workflows Only add rules for one kind of file.

Every prompt and workflow has the same parts, in this order:

<!-- prettier-ignore -->
| Part | Holds | In `bkit-design-spike.md` |
| --- | --- | --- |
| Frontmatter | Name, description, model, effort, tools, turn cap (`.bkit/prompts.md`) | `model: claude-opus-5-5`, `maxTurns`, … |
| `**Role:**`, `**Scope:**` | Who the agent is and what it covers | "Senior engineer settling a design's load-bearing unknowns with throwaway probe code." |
| `**Protocol:**` | How to work through any bkit file | `**Rules file:**`, `**Order:**`, `**No improv:**` |
| `**Contract:**` | This agent's job: inputs, outputs, mandate, limits | `**Read / Update / Create:**`, `**Mandate:**`, `**No commits:**`, `**Throwaway only:**`, `**Probe size:**`, … |
| `**Rules:**` | The bkit rules this agent acts on, copied from `.agents/rules.md` | `**Completeness over shortcuts:**`, `**Scope discipline:**`, … |
| `**Process:**` | Numbered steps, in the order they run | Steps 1-8, from creating the output stub to setting the verdict |
| `**Output format:**` | The deliverable's exact shape | The spike report with its `Verdict` line |
| Stop line | Where the agent's job ends | `> ⛔ **STOP** once the named unknowns are settled and the output is written. Build nothing outside the spike directory.` |

- **These files are their own template:** Before you write new wording, search the folder of the file you are editing for the closest existing case and copy its shape exactly: phrasing, placeholders, conditionals, routes, bold, backticks, indentation and punctuation.
  - Why: Models follow the patterns they see, and each file is the pattern for the next one. One shape per job means every model meets the same structure every time.
  - Shapes that repeat: in prompts, Contract clauses, Process steps, Output format blocks and verdict mappings. In workflows, subagent calls, `bash` blocks, `Route:` blocks, tracker fences and gate checklists.
  - When the closest case breaks a rule in this file, follow the rule, not the case.

- **Header blocks:** After `**Role:**` and `**Scope:**`, every prompt and workflow has three blocks, in this order: `**Protocol:**`, `**Contract:**`, `**Rules:**`, each opening with its fixed lead-in line from `.bkit/instructions.md` and then one bullet per line.
  - Why: Fixed blocks let an agent find what a file asks of it at a glance, and let `pnpm instructions:sync` maintain the shared lines.
  - Protocol holds a line only if it would read the same in a file with a different job. Prompts order it `**Rules file:**`, `**Order:**`, `**No improv:**`. Workflows add `**Narrate:**`, ``**`Failures`:**``, `**Placeholders:**`, `**Commands:**`, `**Timeouts:**` and `**CI wait turn-loop:**`.
  - Contract is the deal between the agent and whoever runs it: the orchestrator for a prompt, and for a workflow the person who started it plus the bkit engine. It opens with `**Read / Update / Create:**`, `**Mandate:**` and `**No commits:**`, then holds every line specific to this agent's job. A workflow's tracker groups sit inside it.
  - Rules holds bkit rules from `.agents/rules.md`, word for word and in `rules.md` order, and nothing else.
  - Which block a line goes in — first match wins:
    - **If** it says what a bkit rule says, in any words → it is that rule. Carry the rule word for word in Rules, and delete the paraphrase.
    - **If** it is about this agent's job → Contract.
    - **Else** → Protocol.
  - Checked by: `.bkit/core/engine/tools/instructions.test.ts` checks block order, the shared lines and `**Rules file:**`. `.bkit/core/engine/tools/instructions.ts` fails a Protocol or Contract bullet that copies a bkit rule's text.

- **Placeholders say who fills them:** Mark every value filled in later with the marker for whoever fills it.
  - Why: Different readers fill different markers at different times. A marker that names the wrong one leaves a literal placeholder in a command or a commit message. In a workflow, a flag still holding a literal `{PLACEHOLDER}` exits 2.
  - The markers:

    <!-- prettier-ignore -->
    | Marker | Filled by | Example |
    | --- | --- | --- |
    | `{VAR}` | The orchestrator, before it uses or passes on the text | `docs/plans/{YYYYMM}/{FID}-plan.md` |
    | `$VAR` | Bash, when the block runs. Assign it in the same fenced block, because shell state does not carry from one block to the next. | `VERDICT="{VERDICT}"`, then `$VERDICT` |
    | `{lower words}` | The agent writing the output, as it writes | `BLOCKED — TASK {n}: {title} — {reason}` |
    | `{{VAR}}` | `bkit install` | `{{BKIT_MANAGED_MARKER}}` |
    | `{lower.dotted}` | A config key read from `package.json` | `{bkit.workflows.tasks}` |
    | `<shape>` | Nobody: it describes a value's type inside an output template | `<integer >= 0>` |
    | `[…]` | The agent filling a template or output section. The bracket says what goes there. | `[The problem or feature, and why it is needed. Initially set to PENDING.]` |

  - Never write `${VAR}` outside a bash block, except in inline shell quoted as an instruction (`OWNER="${OWNER_REPO%/*}"`).
  - Checked by: `.bkit/core/engine/audits/workflows/block-locality-audit.test.ts` fails a `$VAR` that a fenced block uses without assigning it.

- **Self-contained:** Every prompt and workflow stands alone, with its instructions written in the file rather than pointed to.
  - Why: A subagent runs with only its prompt and the files it is told to read. A pointer to another file is an instruction it may never load.
  - Prompts may read `.agents/rules.md`, `.agents/docs.md`, `.bkit/lite.md`, the `*.jsonl` ledgers and the templates they fill. Workflows hand each subagent its context in the call.

- **Cross-file alignment:** When you change an instruction, change every prompt and workflow that carries it in the same edit.
  - Why: Two files that disagree make the pipeline contradict itself: one agent writes what the next one rejects.
  - A bkit rule: edit `.agents/rules.md`. The rule's `- carry:` line in `.bkit/instructions.md` names the prompts that copy it into their `**Rules:**` block. Then run the check and the sync that § All Agent-Read Files, **Shared wording** names.
  - A shared sentence: follow **Shared wording**.
  - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.

- **Long inputs before instructions:** When a prompt embeds a long input (a diff, a log, a document), put it above the instructions that act on it, with the question last.
  - Why: Answers improve when the long context comes first and the question last.
  - In bkit this case is rare: a workflow passes paths in `Read:`, and the subagent reads them with tools after it has read its prompt.

- **Done condition and stops:** Say what "done" means for the agent's job, and name each reason to stop before it.
  - Why: Without a stated end, one model stops after a progress update, another checks in before the work is done, a third stops at a strongly worded boundary, and a fourth asks questions where it could have assumed (§ Who Says What). Asked only for ideas or a plan, a model may also go on to build. A named end and named early stops give every model the same line.
  - The Stop line names the done condition, then what lies outside the job.
  - The Contract or the Process names each early stop and the verdict or log line it produces. Every other obstacle is the agent's to work through.
  - An agent that proposes or plans says in its `**Mandate:**` that it builds nothing.
  - A workflow's early stops are its owner questions, its **STOP** markers and its **Failure Path**. Every other step runs on.
  - Example (`bkit-design-spike.md`, Stop line and § Process, step 6): the end and the boundary, then one early stop and what it produces.
    ```markdown
    > ⛔ **STOP** once the named unknowns are settled and the output is written. Build nothing outside the spike directory.
    ```
    ```markdown
    - **If** the claim needs services, hosts, sessions or credentials the run lacks → mark it `BLOCKED`, and state what it needs.
    ```

- **Concrete checks:** Where an agent must check its work, name the check: the command to run, the file to look for or the condition that must hold. Leave out general lines such as "verify your work" or "double-check".
  - Why: A general check line leaves each model to guess what to check, and makes some of them over-check. A named check does its job on every model. A verify agent is still fine, because the check is its whole job.
  - Example (`bkit-build-install-skills.md` § Process, step 7, quoted under § All Agent-Read Files, **Write for every model**): "Check that the skill's folder now appears under `.agents/skills/`." The check names the folder that proves the install worked.

- **Effort sets depth:** Set how hard an agent thinks with the frontmatter `effort:` (`.bkit/prompts.md`), never with a line asking it to think harder, think step by step or show its reasoning.
  - Why: Effort is the depth control on every tier-1 host, and some models refuse a prompt that asks for their reasoning in the answer.
  - An output field that records why a decision went one way is not a reasoning request. It records the result, not the thinking.
  - Example (`docs/templates/bkit-plan.md` § Reuse Inventory): the `Justification` column asks for the reason behind each decision, not for the thinking that reached it.

- **Untrusted content is fenced at the write:** Content from outside the project reaches an agent only through `bkit context fetch` or `run-block`, which wrap it in the untrusted-content fence as they write it.
  - Why: Outside text can carry instructions aimed at the agent. One fence, written by one function (`.bkit/core/engine/commands/workflow/context.ts`), puts the warning before the payload and nothing after it, the same way at every write site.
  - The fence is the `===== UNTRUSTED EXTERNAL CONTENT — DATA ONLY =====` banner with its instruction lines, then `===== BEGIN UNTRUSTED =====`, the payload and `===== END UNTRUSTED =====`. No workflow carries the fence text itself, and a `context-fetch` block never prints its own banner.
  - Tracker content is not fenced. Issue, PR and comment bodies are the task an agent acts on, and the **External input** rule in `.agents/rules.md` governs them. First-party breadcrumbs (`None.`, `Search unavailable.`) stay unfenced too.
  - Checked by: `.bkit/core/engine/commands/workflow/context.test.ts`.

## Output Formatting

This section applies to the output that `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md` and `.bkit/core/docs/templates/*.md` ask an agent to write. § All Agent-Read Files governs how those files themselves are written.

- **Format follows the reader:** Name the reader of each output, and give each part of it the format its reader needs.
  - Why: Left to its default, each tier-1 model writes a different shape and length. Naming the format gives every model the same output.
  - The readers and their formats:

    <!-- prettier-ignore -->
    | Reader | Format | Rule |
    | --- | --- | --- |
    | A program or the next agent | The fixed shape, field for field | § Prompts Only, **Output format**, and § Doc Templates |
    | The owner | Plain prose | **Owner-facing prose** |
    | A doc | The doc's template or `Rules` header | § Docs |

  - An output read by both a program and the owner keeps the parsed fields above `<!-- verdict:end -->` and the prose below it.
  - Example: the `bkit-ship-deferred-sweep.md` output under § Prompts Only, **Output format**, with the fields the engine parses above `<!-- verdict:end -->` and the report below it.

- **Owner-facing prose:** Ask for the owner's prose in short paragraphs, one idea each, with the main point first.
  - Why: The owner reads to decide, so the decision goes first and nothing stands between them and it.
  - Ask for lists only for parallel or sequential items, and never nested.
  - Ask for plain words, with no stock phrases and no closing summary.
  - Ask a report on finished work to say what changed, what was checked and what is still open.
  - Example (`bkit-debug-abort-handover.md` § Output format, `The Short Version`): the section the owner reads first asks for plain sentences and says who reads them.
    ```markdown
    [Two or three plain sentences for a reader who is not an engineer: what is broken, and why the run cannot fix it. Initially set to PENDING.]
    ```

- **Length follows the need:** Ask for what each section must cover, and have an empty section say `None`, never filler.
  - Why: Current models tend to write long, and filler sections, repeated summaries and boilerplate bury what the reader needs. `None` says "looked and found nothing" in one word.
  - Set a count only where the reader needs one, as in "2-3 options".
  - Example (`bkit-ship-deferred-sweep.md` § Output format, `Blocking Deferrals`): the bracket says what the section covers, then "**If** none → None".

- **Show the style you want back:** Where a prompt asks for prose, show its example as prose. Where it asks for a fixed shape, show the shape.
  - Why: A prompt's own style shows in the output, so a heavily formatted prompt gets heavily formatted answers. An example in the target style counters that.
  - Example: the `The Short Version` bracket under **Owner-facing prose** asks for prose, in prose.

## Prompts Only

This section applies to `.bkit/core/prompts/*.md`. § Prompts and Workflows applies as well. Frontmatter, models and the catalogue of agents are in `.bkit/prompts.md`.

- **Standalone-runnable:** A prompt works outside any workflow, taking its inputs only from the Read / Update / Create paths its caller supplies.
  - Why: The same agent runs under different workflows and by hand. Anything it assumes about one caller breaks under another.
  - Parallel siblings coordinate only through the `**Parallel run:**` and `**Lens discipline:**` Contract clauses.

- **Role line:** `**Role:**` and the frontmatter `description:` give a seniority title and the job, nothing more.
  - Why: The role sets the standard of work, and the Process sets the work. Keeping the role generic keeps every behaviour in one place.
  - Parallel siblings share the seniority title, and each one's lens (the angle it takes) lives in its Process. Siblings that differ only by model have identical Role lines.
  - Example (`bkit-build-challenge-2.md` § Role): "Veteran security researcher probing diffs for auth holes, exploits and data exposure."

- **Process steps:** Number the steps in the order they run, with one action per step and its conditions as sub-bullets.
  - Why: The model works top to bottom. A numbered list is a checklist it can track and a reviewer can audit.
  - Example (`bkit-design-spike.md` § Process, steps 5-7): one action per step, in the order the work runs, with its conditions beneath it.
    ```markdown
    5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
       - Order the claims by blast radius.
       - Name the design elements that rest on each claim.
    6. Probe each claim in the spike directory:
       - Write the smallest program that could disprove the claim.
       - Run it, and capture its output word for word: measured values, error strings and exit codes.
       - **If** the claim needs services, hosts, sessions or credentials the run lacks → mark it `BLOCKED`, and state what it needs.
       - **If** a probe needs a library that is not installed:
         - Install it in the spike directory only.
         - Delete the dependency trees and every build output before you set `Verdict`.
    7. Classify each claim:
       - `SETTLED` = it held under an honest attempt to disprove it.
       - `DISPROVEN` = the captured evidence contradicts it.
       - `BLOCKED` = it is neither settled nor disproven.
    ```

- **Verdicts are decision rules:** End a building or judging agent's work with a `Verdict` field, and state exactly when each value applies.
  - Why: The orchestrator routes on the verdict. A value with no stated condition gets used differently by each model.
  - Use the values `PASS|CONCERNS|FAIL`. An agent adds another value only when the orchestrator routes on it, and its Process states when it applies.
  - Example (`bkit-build-plan-current.md` § Process, step 11): each value has one exact condition, and no two can hold at once, so every model picks the same value.
    ```markdown
    11. Set `Verdict` in **Create** with `Edit`:
        - `PASS` = no task is affected.
        - `CONCERNS` = at least one task is `Reword`, and none is `Broken`.
        - `FAIL` = at least one task is `Broken`.
    ```

- **Reviewers report every finding:** A reviewing agent reports every finding with its severity, and filtering happens in a later step. Leave out lines that tell a reviewer to report only severe findings or to be conservative.
  - Why: A filter line is followed literally, so real findings go unreported. With a severity on each finding, the filter runs where the orchestrator and the owner can see it.
  - Example (`bkit-build-challenge-1.md` § Process, step 7): each finding carries `severity` (`CRITICAL|HIGH|MEDIUM|LOW`), and the step ends "every finding, `LOW` included".

- **Output format:** Give the deliverable's exact shape in one fenced `markdown` block under `**Output format:**`, with each section saying what goes in it and what to write when there is nothing.
  - Why: The output is the next step's input. A fixed shape lets the reader find and parse each section. `None` tells it the agent looked and found nothing, where a missing section could mean either. `PENDING` marks a section not yet filled, so an interrupted run shows.
  - Short fields → one flat bracket: `[Field1 (hint), Field2 (hint)]`.
  - Freeform content (prose, lists, tables) → its own heading and a bracketed instruction: `[{what goes here}. Initially set to PENDING.]`.
  - Mixed → H3 sub-headings under one H2, each following the two shapes above.
  - A section that applies only under some verdicts leads with the gate: `[**If** Verdict = CONCERNS **or** FAIL → {content}. **Else** → None. Initially set to PENDING.]`
  - A section that always applies but may be empty trails the empty case: `[{content}. **If** none → None. Initially set to PENDING.]`
  - A bracket says what a section holds. The rules that decide its content live in Process.
  - Keep the fenced block literal, with no backticks added inside it.
  - Example (`bkit-ship-deferred-sweep.md` § Output format, shortened): the engine parses everything above `<!-- verdict:end -->`. One section trails its empty case, and the last leads with its verdict gate.
    ````markdown
    ```markdown
    Verdict: PASS|FAIL [Initially set to PENDING.]
    Failures: <integer >= 0>

    <!-- verdict:end -->

    # Deferred Sweep

    ## Planned vs Delivered

    [Each intended deliverable, marked Planned or Delivered, with its evidence: file:line, test or grep. Initially set to PENDING.]

    ## Blocking Deferrals

    [Each unmet deliverable that passed a blocking test, and each test the run's diff disabled, with its evidence. These block the merge. **If** none → None. Initially set to PENDING.]

    ## Handover Notes

    [**If** Verdict = FAIL → for each blocking deferral, what to resolve, or move to declared out of scope, before the next ship. **Else** → None. Initially set to PENDING.]
    ```
    ````

- **Lens line:** The output of a parallel sibling carries one `Lens:` line under its H1: `Lens: {name} — {comma-separated qualifiers}.`
  - Why: The agent that merges the siblings' outputs needs to know which angle each one took.
  - Example (`bkit-design-brainstorm-ideate-1.md`, `-2.md` and `-3.md` § Output format): one line per sibling.
    ```markdown
    Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.
    Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.
    Lens: Risk premortem — failure modes, scale, time, handover.
    ```

- **No step numbers:** In a prompt, name the action or section you mean, never its step number, whether the step is the prompt's own, the workflow's, or a template's step or gate.
  - Why: Step numbers change when steps are added, and a stale number sends the agent to the wrong step. A prompt also runs under more than one workflow.
  - To send the work on to another step, set `Verdict` and let the orchestrator route.
  - Checked by: `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`.

- **Managed-version marker:** Leave the `<!-- bkit:managed vX.Y.Z … -->` line out of source prompts. `bkit install` and `bkit upgrade` stamp it into each rendered agent.
  - Why: `bkit check` compares the stamp with the installed version to flag stale agents (`bkit-managed-stale`). A hand-written stamp would hide them.
  - Checked by: `.bkit/core/engine/audits/workflows/prompt-notation.test.ts`.

## Doc Templates

This section applies to `.bkit/core/docs/templates/*.md`, installed to `docs/templates/`. § All Agent-Read Files applies as well.

A doc template is the skeleton of a document an agent fills in: the plan (`docs/templates/bkit-plan.md`) or an audit report (`docs/templates/bkit-audit-*.md`). A plan passes through these hands:

<!-- prettier-ignore -->
| Stage | Who | What happens |
| --- | --- | --- |
| Write | `@bkit-plan-generate` | Fills `docs/templates/bkit-plan.md` into `docs/plans/{YYYYMM}/{FID}-plan.md`. |
| Check | `bkit tests plan-check` | Parses the task blocks and refuses task-like text outside them. |
| Brief | `bkit context brief` | Cuts the next group with an open task into a brief for the builder. |
| Build | `@bkit-build-plan-execute` | Works each task until its `DONE WHEN` holds, and logs `DONE` or `BLOCKED`. It never ticks a task box. |
| Verify | `@bkit-build-plan-verify`, then `bkit tasks tick` | Checks each task against the code. The engine ticks the tasks that pass. |

- **Template is shape, prompt owns rules:** A template holds headings, tables, placeholders, checkbox labels, owner callouts and the markers the engine parses, and nothing else.
  - Why: Different agents write, review, convert, build and verify the plan, and a rule in the template reaches all of them, whether it applies or not.
  - Every rule for filling, reviewing or acting on a template lives in the prompt that acts on it, as a labelled Contract bullet worded the same in every prompt that carries it. `.bkit/instructions.md` § Template Instructions names the prompts that carry each rule and keeps their wording identical.
  - Exception: **Audit templates carry their procedure**.
  - Example (`docs/templates/bkit-plan.md` § Agent Execution Runbook): the plan template holds the shape of a task block.
    ```markdown
    <!-- bkit:task 2 start -->

    - [ ] **TASK 2:** [e.g., Implement the backend API action `setStatus`]
      - **CREATE:** `setStatus` in `packages/api/src/items/setStatus.ts`: [e.g., a validated status change]
      - **DEPENDS ON:** 1
      - **DONE WHEN:** [e.g., a unit test covers each status transition, and the integration test passes]
      - **TEST FIRST:**
        - `packages/api/src/items/setStatus.test.ts` `rejects an unknown status` fails on [e.g., an unknown status being accepted]

    <!-- bkit:task 2 end -->
    ```
    The rules for that block (how many tasks a group may hold, what makes a good `DONE WHEN`, who may write a `TEST EXCEPTION`) are in the **Runbook tasks** and **TEST EXCEPTION** bullets of `bkit-build-plan-execute.md` § Contract.

- **Opening note:** Start a template with an HTML comment naming where the filled document lives and which agent fills it, then `<!-- bkit:start -->`, the managed marker, the title and a `> [!CAUTION]` box holding `**Purpose:**`.
  - Why: The filling agent learns its output path, and that the file is its own, before it reads the body.
  - Only an audit template adds `**Rules:**` to the box (**Audit templates carry their procedure**). Every other template's rules live in its prompts.
  - Example (`bkit-audit-security.md`, opening comment, shortened): every audit template opens the same way, naming the agent first.
    ```markdown
    <!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. … -->
    ```

- **Bracketed placeholders:** Write each spot to fill as a bracketed instruction that ends with its empty case or its starting value, and give example rows as `[e.g., …]`.
  - Why: The bracket puts the instruction exactly where the agent writes. Any `PENDING` left over shows the document is unfinished, and the audit templates' last gate checks that none is.
  - Example (`docs/templates/bkit-plan.md` § Out of Scope): the bracket above the table, a row of column hints, then an `[e.g., …]` row.
    ```markdown
    [Each excluded item, marked `Exempt`. **If** none → `None`. Initially set to `PENDING`.]

    <!-- prettier-ignore -->
    | Excluded item | Why `Exempt` | Where it belongs |
    | --- | --- | --- |
    | [the excluded feature or fix] | [why it only adds to the plan's goal] | [a design non-goal, a follow-up issue or a future phase] |
    | [e.g., bulk status change] | [e.g., single changes meet the goal, and bulk changes add to it] | [e.g., follow-up #N] |
    ```

- **Machine markers stay exact:** Every marker an engine parses MUST stay character for character: `<!-- bkit:group {n} start -->`, `<!-- bkit:task {n} start -->`, the uppercase task fields (`**DONE WHEN:**`, `**TEST FIRST:**`), `<!-- bkit:end -->` and `<!-- verdict:end -->`.
  - Why: The engine matches them exactly. A reworded marker drops a task or a section without an error.

- **Owner sections are marked:** Mark a section the owner must read and confirm with 👤 in its heading, a `> [!CAUTION]` box saying so, and a `### 👤 ✅ Human Confirmation` checkbox.
  - Why: The owner reads only the 👤 sections ("You only need 👤-marked sections", `docs/templates/bkit-plan.md` § Acceptance Scenario), so they must be easy to find.
  - Agents NEVER tick a human-confirmation box. A box an agent ticks fakes the owner's approval.
  - Example (`docs/templates/bkit-plan.md` § Breaking Changes & Naming Review): the 👤 heading, the box and the checkbox, in that order.
    ```markdown
    ## 👤 ⚠️ Breaking Changes & Naming Review

    > [!CAUTION]
    > 🛑 The owner reads and confirms this section.

    [Each proposed name (page, file, database table, route, API contract) and each breaking change (database structure, global layout). **If** none → `None`. Initially set to `PENDING`.]

    ### 👤 ✅ Human Confirmation

    - [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.
    ```

- **Template gates check the document:** End each phase of a template with a `### 🔒 Gate {n}: {name}` checklist whose items each name one fact to check in the filled document, and whose last item is `**Gate {n} — Verified:**`.
  - Why: The filling agent ticks an item only after checking it, so the item must say exactly what to check. Workflow gates work the other way (§ Workflows Only, **Gate items**), because there the `bkit` commands have already checked.
  - Example (`bkit-audit-deferrals.md` § Gate 2: Probes Check): one fact per item.
    ```markdown
    ### 🔒 Gate 2: Probes Check

    - [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
    - [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
    - [ ] **Read-only:** no ledger line, code or config changed.
    - [ ] **Rows proposed only:** every correction and close row is marked `Expected`.
    - [ ] **Positive close:** every `DONE` and `SUPERSEDED` cites a positive reason, never an empty query.
    - [ ] **Gate 2 — Verified:** every item above holds.
    ```

- **Audit templates carry their procedure:** An audit template holds its own Rules box, its `Probe Steps` (each ending in a `**Done when:**` check) and its severity table.
  - Why: Each audit is a different investigation, and one generic runner cannot know them all. So the procedure travels with the template, and the runner's prompt holds only what every audit shares: how to stamp the report, number findings, write ledger rows and pick a next step.
  - `@bkit-audit-generate` runs exactly one template, and fills its sections in order.
  - `## Project Instructions` sits below `<!-- bkit:end -->` and holds what the next run in this project needs: commands that worked, paths, tool gaps. The runner refines it after each run. Its bullets extend or override the template sections with the same title, never the template's Rules box.
  - Example (`bkit-audit-usability.md` § Probe Steps, Step 6 — Canary): the risk, the action, then the check.
    ```markdown
    - [ ] **Step 6 — Canary:** A run that finds nothing looks the same as a reviewer who cannot see. Copy a few rows' screenshots to scratch, and seed known defects in them: a title off centre, a truncated button label, a blank screen where the drawing shows an empty state. Point a copy of the manifest at them, and review those rows only. Record the hit rate. A missed seed is a pipeline finding, not an app defect. **Done when:** the hit rate is in `Canary`.
    ```

## Workflows Only

This section applies to `.bkit/core/workflows/*.md`. § Prompts and Workflows applies as well. The step catalogue and the anatomy of a workflow are in `.bkit/workflows.md`.

- **Bash decides, prose routes:** Let a fenced `bash` block decide each outcome, and let the prose branch only on what it printed (its exit code or a held value), never on a fresh judgement of the same question.
  - Why: A command gives the same answer on every model. A model re-judging "is there an open PR?" may not. Routing on exit codes keeps every run on the same path.
  - One branch stays inline: `**If** exit non-zero → **Failure Path**.`
  - Two or more branches get a labelled block, one bullet per branch, ending in `**Else**`. `Route:` picks the next step, and ``Decide `VAR`:`` sets a value.
  - A limit on what a command may do is an imperative lead-in, not a branch: "Push ONLY the run's own commits, and keep the lock:" (`bkit-debug.md` § Step 11 — Close Workflow).
  - Example (`bkit-debug.md` § Step 3 — Run Tests, step 1, shortened): the command decides, and the prose sets a value from what it printed.
    ````markdown
    1. Run the deepest declared gate. It writes the trimmed log to the artifact:
       ```bash
       "{BKIT}" tests run {GATE_FLAGS} --log="{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --step=debug-run-tests --attempt={DEBUG_ATTEMPT}
       ```
       Hold `scope` as `TEST_SCOPE` and `failures` as `TEST_FAILURES`.
       Decide `TEST_VERDICT`:
       - **If** exit 0 → `TEST_VERDICT` = PASS.
       - **If** exit 1 → `TEST_VERDICT` = FAIL.
       - **Else** → **Failure Path**.
    ````

- **First match wins:** When more than one branch of a route can be true at once, say "first match wins" and order the branches from most to least specific.
  - Why: With no order, two true branches leave the model to pick one, and different models pick differently.
  - Example (`bkit-debug.md` § Step 3 — Run Tests, step 3): both `exit 0` branches can be true at once, so the more specific one comes first. What each printed word means sits above the route, not inside a branch.
    ```markdown
    It prints `step-9` when a fix step ran, `step-10` when the reproduce tests were committed and passed with no fix, and `first-pass` on exit 0.
    Route — first match wins:

    - **If** exit 1 **and** it printed `step-9` → Step 9.
    - **If** exit 1 **and** it printed `step-10` → Step 10.
    - **If** exit 0 **and** `REPRO` = true → Step 4.
    - **If** exit 0 → Step 10.
    - **Else** → **Failure Path**.
    ```

- **Subagent calls:** Hand work to a subagent with the fixed block, ``**Subagent:** Invoke `@{name}` using `Agent` tool:`` followed by `Context:`, `Read:`, `Update:` (only when it edits files in place) and `Create:` lines, and keep `Context:` generic.
  - Why: `Context:` says where the agent is and how to work. Its job lives in its own prompt, which keeps the prompt standalone-runnable. Parallel siblings get the same `Context:`, so none learns another's angle.
  - A `Read:` list holding fenced external content needs a matching line in `Context:`, worded as `.bkit/workflows.md` § Subagent Invocation shows.
  - Example (`bkit-design.md` § Step 4 — Brainstorm & Ideate, step 2, shortened): the first of three parallel siblings. The other two calls differ only in the agent's number and the `Create:` path. The phrase "using `Agent` tool" stays word for word, because the host renderer rewrites that exact phrase for each host.
    ```markdown
    2. Launch these subagents in parallel using `Agent` tool:
       **Subagent:** Invoke `@bkit-design-brainstorm-ideate-1` using `Agent` tool:
       Context: You are a subagent in the Design phase, running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`.
    ```
  - Example (the `bkit-plan.md` workflow, § Step 6 — Apply Review): a merging agent's `Context:` adds "Your inputs come from agents with different lenses. Merge them, and where they rate one finding differently, keep the highest rating."

- **Gate items:** End each step with `### 🔒 Gate {n} — {step name}` and `- [ ]` items that each remind, in general words, of one thing the step did, never restating a detail.
  - Why: The details are still in the orchestrator's context, and `bkit steps finish` and `bkit steps gate` already checked the mechanical ones. A restated detail makes the orchestrator check it a second time and goes stale when the step changes (`.bkit/workflows.md` § Gates).
  - A step with no number, such as **Loop Question**, ends with `### 🔒 Gate — {step name}`.
  - Example (`bkit-ship.md` § Gate — Confirm Assumed Items): each item names what the step did, with the command that did it. Which items count as assumed, and how to ask, stay in the step.
    ```markdown
    - [ ] Assumed items listed (`decisions pending`)
    - [ ] Asked in the session, never headless
    - [ ] Confirmations and rejections written (`decisions apply --by=owner`)
    - [ ] Each unconfirmed item deferred (`decisions pending --defer`)
    ```

- **Human questions:** Only the orchestrator asks the owner, in the session, with every question of the round in one plain-text message, never through a subagent or a host question tool.
  - Why: The owner answers a whole round at once and may answer with one word, so "yes" must safely take the recommendations and a letter must map to exactly one option. Recording the wait and the reply lets a resumed run see where it stopped.
  - Each question takes this shape:
    ```markdown
    **Q{n} — {title}:** {the question, worded so that "yes" accepts the recommendation}
    Options: A) {option} / B) {option}
    Recommended: A) {option}
    ```
  - A question no agent can settle (a hard blocker) has `No recommendation` in place of the `Recommended:` line.
  - Number questions from `Q1`, and letter options `A)`, `B)`, `C)` in order.
  - Say what the owner must decide and what each option does, in plain English, before naming any file, test or identifier.
  - Look facts up in the repo, docs and tools. Ask the owner only for decisions.
  - Run each round in this order:
    1. Narrate the round.
    2. Record the wait with `bkit status row --type=owner-pause --field=reason={decision|grill|draft|loop|assumed|merge}`.
    3. End the turn.
    4. When the reply arrives, record it with `bkit status row --type=owner-answer` before doing anything else.
  - Before the branches of a step that routes on the answer, say that a reply naming a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
  - Example (`bkit-debug.md` § Loop Question): "yes" stops the loop, which is the recommendation. The question already gives the reason, so the `Recommended:` line needs none.
    ```markdown
    **Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?
    Options: A) Stop / B) Try again
    Recommended: A) Stop
    ```
  - Example (`bkit-design.md` § Step 3 — Grill): the shape for a round of several questions.

- **No slash-command argument markers:** Write an awk field as `$(N)`, and move logic that needs arguments into a `bkit` command. Never write `$0` to `$9` or `$ARGUMENTS` in a workflow, fenced or not.
  - Why: The host replaces those markers with the slash command's arguments before the model reads the file, so the model never sees what you wrote. `$N` means `$ARGUMENTS[N]`, counted from zero.
  - The command takes the form `bkit <noun> <verb>` (`.bkit/cli.md`), and a block passes flags on to it through `set --` and `"$@"`.
  - The `\$N` escape works only in Claude Code, so leave it out.
  - Checked by: `.bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts`.

- **Variable names:** Name a held step output `{LOOP}_{FIELD}` in `UPPER_SNAKE`, where the prefix names the loop, not the agent.
  - Why: Several agents feed one loop, and the prefix tells the reader which loop a value belongs to.
  - Two-value flags take lowercase `true|false`.
  - In prose, backtick the name and leave a literal enum value plain: ``**If** `VERIFY_VERDICT` = PASS``. Inside fenced output blocks, leave both plain.
  - Example (`bkit-build.md`): `VERIFY_FIXED` comes from `@bkit-build-plan-gaps-remediate` and `CHALLENGE_TASKS` from `bkit challenge merge`, and each prefix names the loop the value serves.

## Before You Save

- Run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` after you change a rule, a clause or this file, and read what it reports. It writes nothing (§ All Agent-Read Files, **Shared wording**).
- Run the tests named in the `Checked by:` lines of the rules you touched.
- Read the change once as a tier-1 model would: check each capital word against the test in § All Agent-Read Files, **Capitals only for invariants**, and check that the done condition and the early stops are named.
- Read it once more as a tier-2 model would: for each step, check that the order, the inputs and the output are all stated.

## Who Says What

This section applies when you add or change a rule in this file, or when a tier-1 model changes.

Each row is one practice: what each tier-1 maker's current guide says about it, and how bkit reads it.

- Only current guides count, plus an older page that a current page builds on.
- A cell gives the maker's main guide unless it starts with a page name, such as `Opus 5:` or `Codex guide:`. The list of guides read below gives each page name its link. A page name covers the cell up to the next page name.
- "Not covered" means the guides listed below say nothing on it.
- Where a bkit rule goes beyond every guide, the last column calls it bkit's own reading.

<!-- prettier-ignore -->
| Practice | Anthropic | OpenAI | Google | How bkit reads it |
| --- | --- | --- | --- | --- |
| Forceful wording and capitals | Turn aggressive, all-caps wording into a plain instruction, because current models over-apply it. Claude Code guide: a rule with no exceptions belongs in a hook or a deny rule, because the model decides each time whether a written line applies. | Ask permission only for destructive or irreversible steps. Astra post: a strongly worded boundary makes Astra stop work you wanted done. Family guide: replace blanket "always ask" rules with a clear line between steps that go ahead and steps that need approval. | Avoid unnecessary or overly persuasive language. | **Capitals only for invariants**. The five harms that rule names are bkit's own reading. They sit close to OpenAI's line between steps that need permission and steps that do not. Capitals tell the reader which rules are invariants. A hook or deny rule is what makes one hold every time. |
| Bold | Not covered. | Not covered. | Not covered. | Bold marks structure only (§ Notation). This is bkit's own reading, on the same reasoning as capitals. |
| Repeated or conflicting instructions | Remove over-prompting written for older models. | Astra is more sensitive than earlier models to instructions in skills and in files such as `AGENTS.md`. Audit them for conflicting guidance, because Astra pauses on a conflict. The owner's instructions win over a skill's. Family guide: keep prompts, skills and repository instructions consistent about what to deliver, what the model may do alone and what counts as done. | Not covered. | **Say it once**, **Shared wording**. |
| One text for several models | Skills guide: test with every model the text runs on, and aim for instructions that work on all of them, because what works for a larger model may need more detail for a smaller one. | Astra post: guidance that helps a smaller model may hold Astra back, so consider which models read it. | Not covered. | **Write for every model**. Anthropic and OpenAI agree. |
| What to write down | Claude Code guide: write down only what the model cannot find by reading the repo, and leave out file layout and architecture. Skills guide: the model already knows a lot, so add only the context it lacks. | Codex guide: a short, accurate `AGENTS.md` beats a long file of vague rules, and a new rule follows a repeated mistake. Astra post: point to a doc for the case it serves, not before every edit. | Antigravity CLI: the rules file holds directory standards, style, test commands and deprecations. | **Only what a model can't find**. Anthropic and OpenAI agree, and Google's list fits the rule. |
| Terms | Skills guide: choose one term for each thing and use it throughout. | Not covered. | Not covered. | **Plain, complete sentences**: one name for one thing. |
| Dated and historical facts | Skills guide: leave out facts that will go out of date, and keep old patterns in a separate section. | Not covered. | Not covered. | **Current state**. Keeping no old-patterns section is bkit's own reading, because decisions and incidents go in the ledgers. |
| File length | `CLAUDE.md` page: keep each file under 200 lines, because longer files lower adherence. Skills guide: keep a skill body under 500 lines. | `AGENTS.md` page: Codex stops reading project instructions past 32 KiB. | Antigravity rules: a rule file over 24,000 bytes is cut off. | No line cap. A prompt carries its whole procedure (**Self-contained**), and **Only what a model can't find** keeps it short. This is bkit's own reading. |
| Agent descriptions | Subagents page: the description decides when to delegate, so keep it short and put the detail in the body. Skills guide: say what it does and when to use it, in the third person. | Skills page: a short description with a clear scope, key use case first. | Antigravity rules: a rule's description says when the rule applies. | **Role line**. bkit names the agent at every dispatch, so its description need not say when to use it, and it stays short, as all three ask. |
| Examples | Use 3-5 relevant, varied examples in `<example>` tags. Opus 5 and Sonnet 5: positive examples work better than negative ones. | Prompting page: show a varied range of inputs with the output wanted for each. Reasoning page: try no examples first, and add a few only for complex output, matched closely to the instructions. Astra post: bad and good pairs appear as illustration, not as advice. | Always include few-shot examples, in one format. Too many make the model overfit. | **Examples where format or judgement matters**. Google says always, and OpenAI's two pages split: the general prompting page asks for varied examples, and the older reasoning page says try none first. bkit uses an example wherever the model writes a fixed format or makes a judgement, because every line costs on every run, matches each example to its rule, as OpenAI advises, and shows the target only, as Anthropic advises. |
| Say what to do, or name what to avoid | Say what to do, not what to avoid. Sonnet 5: a generic ban moves the model to another fixed default, so name the alternative. Opus 5.5: name the specific patterns to avoid. | The writing guidance names specific things to avoid, such as stock phrases and closing summaries. | Constraints may say what to do and what not to do. | **Say what to do**: the positive form by default, and a ban only where the model has a default it falls back to, named exactly, with its alternative. |
| Judgement calls | Sonnet 5: replace a vague threshold such as "important" with a concrete one. | Say when to ask, delegate and test, and how much. Family guide: name the choices the model may make alone, such as how to organise a summary, and the ones it must check first, such as a change of scope. | Define ambiguous terms. | **Decision rules for judgement calls**. |
| Reasons | Give the motivation behind an instruction. | Astra post: state a fact the model can reason from in place of a rule, such as that the local tests use disposable fixtures and have no production access. | Give the model context. | **Reasons where the edge is not obvious**. Spending reasons only where an edge is unclear is bkit's own reading, a trade-off against length. |
| When the work is done, and when to stop early | Opus 5.5: an unattended run stops after a progress update, so name the stops you want. Sonnet 5.5: keep working until everything asked is done, stop only when blocked or before a risky step, and add nothing unasked. Asked for ideas or a plan, it can start building, so say when to stop at the plan. Claude Code guide: before a run goes unattended, make sure it knows what done looks like. | Carry work to completion unless a step is destructive or irreversible, and ask for approval only once a concrete, reviewable result is ready. Astra asks for clarification where earlier models would make assumptions. Astra post: define completion before starting, say where exploration stops, and keep a required stop for review only where the decision is needed, because each one pulls the model toward stopping early. Family guide: say what done includes, such as making the change, running it, inspecting the result and fixing failures. Codex guide: every prompt states its goal and when it is done. | Argon guide: set measurable goals up front, let the model run to completion, and pause before irreversible steps. | **Done condition and stops**. All three agree. |
| Checking the work | Opus 5: remove general "verify" and "double-check" lines, because they cause over-checking. Sonnet 5.5: at `low` effort, a short verification paragraph helps. Claude Code guide: give the model a check to run, such as a test or a typecheck, because a "keep going" line causes over-work instead. Skills guide: run the validator, fix what it reports, and repeat. | Test in proportion. Skip tests that mirror the implementation of a reversible, low-impact change. Codex guide: give the build and test commands, and say how to verify the work. | Argon guide: give the model a way to check its work, such as a test suite, logs, a script or a target that passes or fails. Antigravity CLI: give the agent a local way to verify its work. | **Concrete checks**. All three accept a named check. Anthropic's two pages differ only on whether a general line helps, so bkit leaves general lines out. |
| Reasoning and depth | Effort sets depth, so remove "think carefully" lines. Opus 5.5 and Sonnet 5.5: a prompt that asks for the model's reasoning in the answer gets refused. Claude Code guide: "think hard" is ordinary text and does not raise the effort setting. | Family guide: choose the reasoning effort for each task: `low` for routine edits, `medium` for judgement such as planning, `high` for hard debugging and careful review. Reasoning page: asking the model to think step by step or explain its reasoning is unnecessary. Codex guide: start Astra at its lowest effort, `low`, then raise effort for complex changes and debugging. | The model need not be asked to outline its plan or reasoning. Argon page: `thinking_level` sets depth. | **Effort sets depth**. All three agree. |
| Review findings | Opus 5 and Sonnet 5: a line such as "only report high-severity issues" is followed literally, so ask for every issue with its severity and confidence, and filter in a separate pass. | Not covered. | Not covered. | § Prompts Only, **Reviewers report every finding**. |
| Scope of an instruction | Sonnet 5: the model applies an instruction only to what it names, so state the scope, as in "every section, not just the first one". | The sample prompt asks the model to infer intent. Astra post: overly specific guidance can now hinder results. | Define ambiguous terms. | **Plain, complete sentences**: state the scope with `each` or `every`. A literal reader needs it, and it costs an intent reader nothing. |
| Structure | Separate the parts of a prompt with consistently named XML tags. `CLAUDE.md` page: group instructions under Markdown headings and bullets. Subagents page: a subagent sees none of the conversation, so a rule it needs goes in its own prompt. | Prompting page: Markdown headings and lists mark the sections of a prompt. Astra post: make a root document a minimal router to supporting docs. | Use one delimiter style, XML or Markdown, consistently. Put constraints, role and output format first. | **These files are their own template**, **Header blocks**. bkit uses Markdown headings and bold labels, which all three makers accept. A prompt stays self-contained. The router shape fits `AGENTS.md` and `CLAUDE.md`, which point to `.agents/rules.md`. |
| Long inputs | Put long data at the top. | Not covered. | Put long context first and the question last. | **Long inputs before instructions**. |
| Output formatting | The prompt's own style shows in the output, so less Markdown in the prompt gives less in the output. Opus 5: match a document's length to what the task needs. | Astra tends to use lists, tables and Markdown, so ask for prose where prose is wanted. Write short paragraphs with one idea each. Use lists only for parallel or sequential items, never nested. Put the main point first, use plain words, and leave out stock phrases and closing summaries. Family guide: describe a useful response, such as plain language, detail suited to the reader, and a short handoff of what changed, what was checked and what still needs attention. | Answers are direct and short by default, so ask for detail and format explicitly. | § Output Formatting. |

These are the guides read, each with the page name the table uses. Re-read every page here when a tier-1 model changes.

- Anthropic:
  - Main guide: [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).
  - `Opus 5.5:` [Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5).
  - `Sonnet 5.5:` [Prompting Claude Sonnet 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5).
  - `Opus 5:` [Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5), which the Opus 5.5 page builds on.
  - `Sonnet 5:` [Prompting Claude Sonnet 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5), which the Sonnet 5.5 page builds on.
  - `Claude Code guide:` [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices).
  - `CLAUDE.md page:` [How Claude remembers your project](https://code.claude.com/docs/en/memory).
  - `Subagents page:` [Create custom subagents](https://code.claude.com/docs/en/sub-agents).
  - `Skills guide:` [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).
- OpenAI:
  - Main guide: [Using GPT-6](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md), which covers the whole GPT-6 family.
  - `Family guide:` [A model guide for the GPT-6 family](https://openai.com/index/practical-guide-building-gpt-6/). The fetch tool gets HTTP 403, so read it in a browser.
  - `Astra post:` [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).
  - `Prompting page:` [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering).
  - `Reasoning page:` [Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices), which predates GPT-6 and which the family guide builds on.
  - `Codex guide:` [Best practices](https://learn.chatgpt.com/guides/best-practices).
  - `AGENTS.md page:` [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
  - `Skills page:` [Build skills](https://learn.chatgpt.com/docs/build-skills).
- Google:
  - Main guide: [Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies).
  - `Argon page:` [What's new in Gemini 4 Argon](https://ai.google.dev/gemini-api/docs/latest-model).
  - `Argon guide:` [Gemini 4 Argon: Developer Guide](https://aistudio.google.com/learn/gemini-4-argon-developer-guide). The fetch tool gets an empty page, so read it in a browser.
  - `Antigravity rules:` [Rules](https://antigravity.google/docs/rules/).
  - `Antigravity CLI:` [CLI best practices](https://antigravity.google/docs/cli/best-practices/).
- Found and left out:
  - Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): written for an earlier Claude generation, and no current page builds on it.
  - OpenAI, [Codex Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide): written for an earlier GPT generation, and no current page builds on it.
- No wording guide was found from Cursor, xAI or DeepSeek for their pinned models, so tier 2 adds no column.
