# Authoring Rules

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

> [!CAUTION]
> **Purpose:** One set of authoring rules for every agent-read markdown file — docs, prompts, workflows. § All Agent-Read Files binds every file; the later sections add the rules for one kind of file.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - Ships to consumers: describe the current setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - A rule binding more than one kind of file goes in § All Agent-Read Files or § Prompts and Workflows, never in two places.

## All Agent-Read Files

Binds `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md`, `.agents/**`, `.bkit/**`, `docs/**`, `AGENTS.md` and `CLAUDE.md`.

- **Dense:** → `.agents/rules.md` `Format`.
- **Current state:** describe current state / rules, not reasons / history; state what to do, not why. only exceptions: docs where purpose is the record.
- **Notation:** one job per mark — § `Notation`.
- **ASCII operators:** ASCII comparison / logic only — `!=`, `>=`, `<=`, `=>` — and `x` for times / dimensions. never Unicode math glyphs. Flow-arrow `→` in procedural conditionals / dispatch tables is **sole intentional non-ASCII glyph** — uniform documented flow notation (clearer than `->`, overloaded as member-access). Do not convert `→`.
- **Removal = delete:** drop instruction outright; never leave removal explanations.

### Notation

One job per mark; capitals and bold carry one meaning each. Binds every file § All Agent-Read Files binds; the docs `Rules` headers point here instead of restating it.

<!-- prettier-ignore -->
| Mark | Its only job |
| --- | --- |
| `→` | "then / goes to": the result of a condition, the next step, key to value, or a pointer to a file. A line holding only a jump (`→ Step 11.`) is allowed. |
| `.` | Ends a statement. It is the only thing that ends an `**If**` condition's scope. |
| `;` | Adds another instruction under the same rule or the same condition. Also splits lists of `A → B` pairs. |
| `,` | Separates list items only. never adds a second action after `→` — use `;`. |
| `:` | Introduces a breakdown or a label (`**Label:**`, `**If** X:` followed by sub-cases). |
| `—` | Attaches an explanation to the thing just named (term — what it is, step headings, empty table cells). never stands in for "because", "so" or "but": write the word, which costs the same tokens. |
| `-` | Hyphen for compound words and number ranges (`2-3`). never a dash, never an en dash `–`. |
| `/` | "Any of these, treated the same". Spaced between words (`build / debug`). Unspaced only in fixed terms (`I/O`, `CI/CD`, `try/catch`), rates (`1/run`) and inside backticks. Closed value sets are one tight backticked union (`DONE\|BLOCKED`), never a spaced slash between separately backticked values. Binds all three folders, not just prompts. |
| `()` | A short note on the word just before it: its members, a definition, a reference, an example or a scope limit. never a branch (`else …`, `**If**`), never a second instruction, never a reason. If the note needs one of those, it becomes its own sentence. |

**Capitals.** A word takes capitals only when it marks a hard limit: an action that is destructive, irreversible or security-sensitive, or a required field / machine-parsed invariant the run cannot proceed without. Closed list: `NEVER`, `ALWAYS`, `MUST`, `ONLY`, `PROHIBITED`. Everything else is lowercase, scope quantifiers and joining words included (`all`, `any`, `every`, `not`, `before`, `once`, `new`). One capitalised word per clause; never inside a label, a parenthetical or a description, never on a joining word.

**`NEVER` vs `do not`.** `NEVER` = forbidden everywhere, at all times (a hard limit). `do not` = forbidden in this step. The mixed-case `do NOT` is retired.

**Reason clauses.** At most one short reason clause, and only on a hard limit whose boundary a model would otherwise misread or over-apply — the single exception to § `Dense instructions only`. Elsewhere write the rule plainly.

**Bold.** Structure only, never emphasis: clause and field labels, conditional operators (`**If**`, `**Else**`, `**and**`, `**or**`), jump targets and terminal markers (`**STOP**`, `**Failure Path**`), and the prompt I/O markers (`**Create**`, `**Read**`, `**Update**`). No italics for emphasis. Bold and capitals together only on stop / route markers.

**Grammar.** Write normal English sentences, with articles and singular or plural as the meaning needs. Keep text dense by cutting filler, reasons, repetition and restating, never by dropping grammar words. When the number of items matters, say `each {item}` or `one {thing} per {item}` (`append one row per flaky test`). A subject and its pronoun agree in number (`files … them`, `a file … it`).

## Docs

Binds `.agents/**`, `.bkit/*.md` and `docs/*.md`; § All Agent-Read Files applies on top.

- **Rules header:** every doc opens with a `> [!CAUTION]` box holding `**Purpose:**` and `**Rules:**`; read the box of the file you edit and follow it.
- **One home per topic:** check the `.agents/docs.md` index first and confirm the topic belongs in this doc, not another. Two docs covering the same topic is a bug — pick a canonical home, link from the other.
- **Index:** a new doc gets one row in `.agents/docs.md` — phase columns and a one-line scope; pointers only, never text copied from the doc.
- **Shared wording:** every sentence 2+ shipped docs carry inside their `bkit:start` / `bkit:end` blocks, header bullets included, lives in `.bkit/instructions.md` § Clauses. Edit the clause, then run `pnpm instructions:sync`. Enforced by `.bkit/core/engine/tools/instructions.test.ts`.

## Prompts and Workflows

`.bkit/core/prompts/*.md` (subagents) and `.bkit/core/workflows/*.md` (orchestrators) are AI-only execution surfaces; every byte is paid on every run. § All Agent-Read Files applies on top; § Prompts Only and § Workflows Only add the rules for one kind.

- **These files are their own template:** always `grep` the folder of the file you edit (`.bkit/core/prompts/` or `.bkit/core/workflows/`) for closest existing cases and copy shapes verbatim before inventing wording / formatting (phrasing, variables, operators, conditionals, routes, jump targets, bolding, backticks, indentation, line breaks, punctuation, spacing). Match shapes for repeated sections: contract clauses, process steps, output format blocks, verdict mappings in prompts; subagent invocations, `bash` blocks, conditional routes, comment fences, gate checklists in workflows.
  - **Procedural conditionals:** Flow-gating conditional → bold `**If** {condition} → {action}.` (`**Else** → {action}.` for branches), any syntactic shape. Test: reordering reads as "If {X}, {Y}" naturally → it is one. Excludes inline qualifiers (`if any`, `if defined`), dispatch tables (`PASS = …`, `STANDARD → …`), iteration (`For each …`), bash in backticks; workflows also exclude output-template placeholders.
  - **Slash separator:** Alternation slash always spaced — `task / gate`, `CRITICAL / HIGH`. Fixed abbreviations (`I/O`) and anything inside backticks (paths, commands, enum unions) keep the bare form.
  - **Variable references:** One name, one marker — the marker says who resolves it, and when. `{VAR}` = orchestrator substitutes before the text is used (paths, JSON, commit msgs, Context payloads, output templates). `$VAR` = bash expands at run time; it must be assigned in the same fenced block (shell state does not persist between blocks). Model-held value needed inside bash → assign it once at the top of the block (`VERDICT="{VERDICT}"`), then use `$VERDICT` below. `{lower}` / `{plain words}` = free text the writing agent fills in — never asserted non-empty. `{{VAR}}` = install-time token substituted by `bkit install` — distinct, do not unify. Enum sets are one tight backticked union in canonical order (`PASS|CONCERNS|FAIL`) — never spaced slashes or pipes; the spaced-slash rule does not apply inside backticks. Operators outside (`VERIFY_ATTEMPT` = 0). never `${VAR}` outside bash fences, except inline shell quoted as an instruction (`OWNER="${OWNER_REPO%/*}"`). § Prompts Only and § Workflows Only hold the rules that differ between the two.
- **Header blocks:** After `**Role:**` / `**Scope:**`, every prompt has three blocks, in this order: `**Protocol:**`, `**Contract:**`, `**Rules:**`. Each opens with a column-0 label line carrying its fixed lead-in (the `protocol-lead`, `contract-lead` and `rules-lead` clauses in `.bkit/instructions.md`), then one bullet per line. No `> [!CAUTION]` box. Workflows are orchestrator prompts and take the same three blocks.
  - **Protocol:** how to work through this file; a line belongs here only when it would read the same in a file with a completely different job. `**Rules file:**` first, then `**Order:**`, `**No improv:**`; workflows add `**Narrate:**`, ``**`Failures`:**``, `**Placeholders:**`, `**Commands:**`, `**Timeouts:**`, `**CI wait turn-loop:**`.
  - **Contract:** the deal between this agent and whoever runs it: the orchestrator for a prompt; the person who started it and the bkit engine (status rows, locks, tracker updates) for a workflow. What it is handed, what it may and may not do, what it must hand back, and the rules for filling in its deliverable: `**Read / Update / Create:**`, `**Mandate:**`, `**No commits:**`, then every line specific to this agent's job. A workflow's tracker groups (`<!-- bkit:tracker {name} start -->` to `end`) sit inside it.
  - **Rules:** `.agents/rules.md` bullets copied word for word, in `rules.md` order. Nothing else.
  - **Which block:** a line copied from `.agents/rules.md` → Rules. **Else** a line about the deal → Contract. **Else** → Protocol. A line saying what a bkit rule says, in any words, is that rule → the agent carries the rule in Rules and the line goes. A Protocol or Contract bullet copying a bkit rule's text, whole or cut short, fails `.bkit/core/engine/tools/instructions.ts`; a bullet sharing only a rule's label passes. Each header clause names its block (`- block:` in `.bkit/instructions.md`); the check fails a carrier holding it in another block.
- **Dense instructions only:** No rationale, commentary, parentheticals explaining why, or inline comments justifying behaviour — one exception: a single reason clause on a hard limit a model would otherwise misread (§ `Notation`). Every byte is paid on every run; explanations, decisions, trade-offs, history and commentary live in the catalogue of the file's kind (`.bkit/prompts.md`, `.bkit/workflows.md`).
  - **Banned shapes:** a parenthetical explaining why a clause exists or a gate exists, an inline comment justifying behaviour or a step's behaviour, a note on what a previous version did, `we don't do X because Y`.
- **Cross-file alignment:** Check for shared instructions and change in all prompts / workflows using them. Each prompt copies, word for word, the bkit rules its agent acts on into its `**Rules:**` block (the rule's `- carry:` line in `.bkit/instructions.md` names the prompts).
  - **Shared wording:** every sentence shared by 2+ prompts or 2+ workflows, header bullets included, and the header sentences workflows share with prompts live in `.bkit/instructions.md` § Clauses; a shared line carrying per-workflow detail is a `{{slot}}` template there. Edit the master (`.agents/rules.md` or the clause), then run `pnpm instructions:sync`. Enforced by `.bkit/core/engine/tools/instructions.test.ts`.
- **Self-contained:** every file must stand alone; inline all instructions; no file references. Exceptions: prompts — `.agents/rules.md`, `.agents/docs.md`, `.bkit/lite.md`, `*.jsonl` ledgers, supplied templates (plan, audit), read for shape only; workflows — subagent context.

## Prompts Only

Binds `.bkit/core/prompts/*.md`; § Prompts and Workflows applies on top. Per-agent frontmatter, models and catalogue rows → `.bkit/prompts.md`.

- **Standalone-runnable:** Works outside any workflow. Inputs via orchestrator-supplied Read paths. Multi-agent coordination: `**Parallel:**` + `**Lens discipline:**` Contract clauses.
- **Generic Role, specific Process:** `Role:` / `description:` anchor seniority titles ("Senior X", "Veteran X"). Lens behaviour in Process. Sibling lenses may name their lens in `Role:` / `description:`; siblings share seniority anchor. Same-audit diversity pairs (only model differs) → identical `Role:` lines.
- **Bold in body:** Only the `**Create**` / `**Read**` / `**Update**` I/O markers and the conditional operators (`**If**`, `**Else**`, `**and**`, `**or**`); § `Notation` holds the bold rule. Contract clause labels (`- **Mandate:**`) are the sole addition; bold inside a code span is literal output, not formatting.
- **Variable references:** `{lower.dotted}` = config key read from `package.json`. `<shape>` inside an output template describes the type of a value (`<integer >= 0>`), not a substitution. Closed-vocabulary tokens are backticked in prose, names and values alike (`` `severity` ``, `` `CRITICAL` ``, `` `OPTIONAL` ``, `` `PASS` ``, `` `DONE` ``), whether or not the literal is being compared. Field labels match their own Output format block verbatim, lowercase. Emphasis words stay bare; § `Notation` sets their capitals. Fenced output-format blocks stay literal: never add backticks inside them. Doc section citations name the title only (`docs/templates/bkit-plan.md` § `Open Questions & Assumptions`) — never carry the `##` heading marker.
- **Output section shape** content drives format:
  - **Short structured fields** (single-phrase values, enum picks, one-sentence answers) → flat bracket: `[Field1 (hint), Field2 (hint), Field3 (hint)]`. One line, comma-separated.
  - **Freeform, multi-finding, or multi-paragraph** (prose, prioritised lists, per-item findings, tables) → own heading + bracketed instruction: `## Section\n\n[Instructions describing what goes here; initially set to PENDING.]`
  - Mixed (short fields + freeform) → H3 sub-headings under one H2; each follows rule above.
  - **Conditionals inside `[…]`** carry the same bold form as procedural conditionals — never a bare `If X: …` or `If X then …`. Two shapes only. **Section gate** (whole section applies only under a verdict) leads, names the field, values bare: ``[**If** `Verdict` = CONCERNS or FAIL → {content}. **Else** → `None`.]``. **Empty case** (section always applies, may have nothing to report) trails: ``[{content}. **If** none → `None`; initially set to PENDING.]``. `→` carries the consequent, so `:` stays free for the per-item breakdown inside `{content}`.
  - **Shape, not rules:** `[…]` states WHAT a section holds — fields, columns, format, empty case, `PENDING` init. Rules deciding content (defaults, allowed / banned values, trace requirements, verdict triggers) live in Process only; never restate them in Output format.
- **Output Lens line:** Parallel-sibling outputs: one `Lens:` line under H1 (deliverable name). Pattern: `Lens: {Name} — {comma-separated qualifiers}.` or compact `Lens: {field list}.` Single-line, no blank inside; blank line before next heading.
- **Template is shape, prompt owns rules:** a supplied template holds headings, tables, placeholders, checkbox labels, owner callouts and the lines engine code parses; every rule for filling, reviewing or acting on it lives in the prompt that acts on it, as a labelled Contract bullet worded the same in every prompt that carries it (`.bkit/instructions.md` § Template Instructions names the carriers). An audit template also keeps its own probe steps and template-specific rules.
- **Enforced elsewhere:** step numbers by `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`, the managed-version marker by `.bkit/core/engine/audits/workflows/prompt-notation.test.ts`, shared sentences, the header blocks, the `**Rules file:**` bullet, and the `.agents/rules.md` group headings by `.bkit/core/engine/tools/instructions.test.ts` — the GateGuard advisory omits them because a test is the gate.
  - **No step numbers:** never cite a step number — this prompt's own, the workflow's, or a supplied template's step / gate. Numbering shifts the moment a step is inserted. Name the action or section instead, or signal through `Verdict` and let the orchestrator route.
  - **Managed-version marker:** `bkit install` / `upgrade` stamps ``<!-- bkit:managed vX.Y.Z — do not edit; run `bkit upgrade` to refresh -->`` into each rendered agent after the frontmatter, one blank line below (`stampManagedVersion`). never add the version line to a source prompt. `bkit check` flags `bkit-managed-stale` on marker drift: a hard blocker on `main` / `dev` and on PRs into them, an advisory on feature branches.

## Workflows Only

Binds `.bkit/core/workflows/*.md`; § Prompts and Workflows applies on top. Step catalogue, anatomy and per-phase tables → `.bkit/workflows.md`.

- **Bash decides, prose routes:** fenced block determines outcome → prose branches on **exit code** (`**If** exit non-zero → **Failure Path**.`) — never domain restatement (`**If** an open PR exists → …`). Internal constraints: imperative lead-in (`— NEVER onto a branch with an open PR:`), not `**If**`. 1 process branch → inline; 2+ branches → labeled decision / route block.
  - **Labeled decision blocks:** 2+ branches → labeled heading-row + `-` bullets (one per branch) — never inline one line, never across numbered sub-steps. Labels: `Route:` (next Step / Failure Path); `Decide \`VAR\`:` (variable value). Single-branch (`**If** {X} → **Failure Path**`) stays inline.
- **Sibling-blind subagent Context:** `Context:` stays generic; agent prompts own lens via Process. Canonical: "You are a subagent in the {Phase} phase running in parallel with N other agents"; reconcilers: "Inputs carry distinct lenses — merge across them, max-wins on CRITICAL findings".
- **Bold is structural:** Conditional operators (`**If**`, `**Else**`, `**and**`, `**or**`, `**Run only if**`, `**Skip if**`), jump targets and terminal markers (`**Failure Path**`, `**STOP**`, named paths and guards; `Step N` stays unbolded), and block field labels (`**Subagent:**`, `**Tracker:**`, `**PROHIBITED:**`); § `Notation` holds the bold rule. Never bold an ordinary word for emphasis. Lowercase `**if**` is always wrong — the operator is `**If**`.
- **Variable references:** Standalone prose mention: backticked, sigil optional. Literal enum plain (**If** `VERDICT` = PASS). Fenced output blocks and unfenced output-template fragments: plain. Enforced by `.bkit/core/engine/audits/workflows/block-locality-audit.test.ts`.
  - **Argument placeholders:** never `$0` to `$9` or `$ARGUMENTS`, fenced or not, because the host substitutes slash-command arguments (`$N` = `$ARGUMENTS[N]`, zero-based) into these files before the model reads them. Awk field reference → `$(N)`. never the host `\$N` escape (Claude Code only). Shell positional parameters have no `$(N)` equivalent; logic taking arguments becomes a `bkit <noun> <verb>` command (§ Workflow commands), and a block passes a flag list through `set --` / `"$@"`. Enforced by `.bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts`.
  - **Variable names:** held step output = `{LOOP}_{FIELD}` in UPPER_SNAKE; prefix names the loop, not the agent (`VERIFY_FIXED` from gaps-remediate, `CHALLENGE_TASKS` from `challenge merge`); two-value flags take lowercase `true|false`.
- **Gate items:** `- [ ]` + general prose reminder of what the step did — never a step detail (condition, path, variable, value set, field list, exit code) — `.bkit/workflows.md` § `Gates`. `- [ ] Verdict valid`, never `- [ ] Verdict valid (\`SUMMARY_VERDICT\` in \`PASS|CONCERNS|FAIL\`)`.
- **No internal labels, no coined guard names:** NEVER cite a bkit-internal identifier (ledger key, tracker issue number, review-finding id) or a coined guard name in workflow files. Drop the label outright; the step lead-in states what the step does. Name the behaviour, never the record of it (`open-PR pre-flight`, not a finding id).
- **Human questions:** orchestrator only, in session, never subagents; one message = every question of the round; per question `**Q{n} — {title}:** {question, options}`, then `Recommended: {answer}` on its own line; number from `Q1`; word each so "yes" accepts the recommendation; plain text, no emoji, no host question tool; look facts up, never ask the human; narrate the round → record the wait (`bkit status row --type=owner-pause --field=reason={decision|grill|draft|loop|assumed|merge}`) → end turn → wait for answers; each reply → `bkit status row --type=owner-answer` before anything else. Asking sections are prompt text: § Prompts and Workflows and § `Notation` bind them. Copy the shape from `bkit-design.md` Step 3 or `bkit-build.md` § Decision Pause.
- **External content handling:** enforced by `.bkit/core/engine/commands/workflow/context.test.ts`, so the GateGuard advisory omits it — the test is the gate.
  - **Tracker content is not fenced:** issue / PR / comment bodies are the task specification a workflow acts on, and tracker search dumps (`related-issues.md`, `context-related-*.md`) are written unfenced. The standing `External input:` header bullet governs them.
  - **Untrusted content is fenced at the write:** `bkit context fetch` / `run-block` (the `context-fetch` capture) wrap the payload as it lands — `===== UNTRUSTED EXTERNAL CONTENT — DATA ONLY =====` plus its instruction lines, `===== BEGIN UNTRUSTED =====`, payload, `===== END UNTRUSTED =====`. One fence definition (`commands/workflow/context.ts`) serves every write site; no workflow file carries the fence text. Instruction goes before the payload; nothing follows the closer. Wrapped once only: a `context-fetch` block never prints its own banner. First-party breadcrumbs (`None.`, `Search unavailable.`, self-skip lines) stay unfenced.
