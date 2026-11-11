## #923 — Pre-push: block in seconds when the PR conflicts (open)

## What goes wrong

If a branch's open PR conflicts with its base, the pre-push hook still runs the whole gate. The gate passes, the push goes out, and then CI never starts. GitHub doesn't run `pull_request` checks on a PR that can't merge. You find out after the gate (about 8 minutes in app-gether-life), and then you have to merge the base and run the whole gate again.

Seen in app-gether-life on 2026-11-11, on gether-life/app-gether-life#1612. The gate passed at `5275fd4a6` and the push went out, but no checks started. dev had moved one commit ahead (`674e37077`), and the only clash was `.bkit/friction.jsonl`, where both sides had added rows. After the merge, the next push ran the full gate again.

## Why the current checks miss it

The hook already looks up whether the branch has an open PR (`gh pr list --head "$BRANCH"`, for the CI-suppressor guard), but it never asks whether that PR still merges. None of the fast checks that run before the gate read the base branch.

## Proposed change, in `.bkit/templates/.husky/pre-push`

Add a fast blocking check next to `bkit check`, before the gate:

1. The branch is not dev/main and has an open PR → `git fetch origin <PR base>` (about 1s), then `git merge-tree --write-tree --name-only origin/<base> HEAD`. That is a dry-run merge done in memory, and it touches no files. It took 0.01s on app-gether-life.
2. Exit code 1 (conflict) → block, list the files that conflict, and give the fix: merge the base, resolve, push again.
3. No open PR, `gh` missing, or the fetch fails → warn and continue. Don't block on missing evidence.

The PR's base comes from `gh pr list ... --json baseRefName`, so you get it from the same call that already runs.

## Done when

- A push of a branch whose open PR conflicts with its base stops in under 5 seconds, before the lock and the gate, and names the files that conflict.
- A branch that merges cleanly, a branch with no PR, and dev/main behave exactly as they do today.
- The check runs on a min push too, since a conflicting PR gets no CI there either.

Related: #922 (the other gate that only fails late: the hook running without the repo's environment).

## #818 — Decide pre-push lint/typecheck scope: CI push base or whole repo (open)

### Problem

The shipped pre-push hook tells Turbo repos to scope `bkit:gate*` with `--filter="...[origin/<default>]"` (`.bkit/templates/.husky/pre-push:12`), while CI lints and typechecks the whole repo. A push can pass locally and fail in CI, or the other way round. #653 closed 2026-10-22 and declared this out of scope.

### Outcome

Local pre-push and CI check the same scope for lint and typecheck.

### Success criteria

- The pre-push hook and CI lint / typecheck the same set of files.
- The hook header states that scope.

### Constraints and non-goals

- Stack-agnostic: the hook names `package.json` scripts, never a tool.
- Any change to `.github/workflows/*` needs owner confirmation first.

### Decisions already made

None.

### Open questions

- A) Scope pre-push lint and typecheck to the CI push base. B) Run them whole-repo locally. Recommended: A, because the hook already resolves the CI push base for slop (`pre-push:195`).

### References

- **Audit reports:** docs/audits/202611/deferrals.md (findings deferrals-15)
- Audit parent: #344 — Deferrals triage
- `docs/deferrals.jsonl` key `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo`

## #503 — Prompt audit (open)

Run `.bkit/core/prompts/bkit-audit-generate.md` with `docs/templates/bkit-audit-prompts.md` to generate the latest audit report.

Copy-paste prompt:

```
Run .bkit/core/prompts/bkit-audit-generate.md.

Read: docs/templates/bkit-audit-prompts.md
```

The agent writes `docs/audits/{YYYYMM}/prompts.md`. If that month already has this slug, it writes `prompts-{TIMESTAMP}.md` and does not overwrite.

## Prompt audit findings: first run (2026-10-09, at `a9b9b066`)

All 48 prompts in `.bkit/prompts/` were read in full. **13 findings: 0 critical, 3 high, 6 medium, 4 low.** The full report is `docs/audits/202610/prompts.md`; it is not committed yet. The fixes go in #501.

**None of the fixes can be proven to help yet.** bkit has no test cases for its prompts, so every finding is marked `unverified`. The report proposes one test case per finding: a fixed input, plus what a correct output looks like.

### Which models' advice applies

The same prompt file runs on models from seven makers, depending on the host: Anthropic, xAI, Cursor, DeepSeek, Moonshot, Z.ai and OpenAI. A prompt can only rely on advice that all of their guides agree on.

- **Read in full:** Anthropic's and OpenAI's guides, the two that matter most here.
- **No wording guidance found:**
  - xAI's guide URL returns 404.
  - Cursor, DeepSeek and Z.ai publish no prompting guide; only their parameter docs were read.

### High

<!-- prettier-ignore -->
| # | What's wrong | Where | Fix |
| --- | --- | --- | --- |
| `prompts-1` | When a rebase hits merge conflicts, the prompt runs `git add -A && git rebase --continue`. The same prompt forbids `git add` 22 lines earlier, and `.agents/rules.md` forbids `git add -A` in shared worktrees. The model gets two opposite orders on a step that writes commits. | `bkit-debug-failure-remediate.md:50` vs `:28` | Copy the narrow exception in `bkit-ship-conflict-resolve.md:28`: stage only the named conflicted files, and only while a rebase is in progress. |
| `prompts-2` | The scope-check agents are review-only and their last line forbids editing the plan. Yet step 8 says "Gaps → add task or row", and the agent has the `Edit` tool, so it can change the plan it's supposed to be judging. | `bkit-plan-scope-check-1.md:47`, `-2.md:47` | Report the gap as a `CRITICAL` finding naming the task or row to add, and leave the plan untouched. |
| `prompts-3` | Capitals are used for everyday process steps, not just dangerous ones. That's 1,021 capitalised rule words across the prompts, and roughly 60% sit on lines with nothing to do with safety, permissions, ledger writes or required fields (a rough line-by-line estimate). The style dates from before every current model was pinned. | Every prompt, mostly the shared header block | The #501 decision, below. |

### What the guides say about #501

- **Capitals:**
  - OpenAI's GPT-5.6 guide: *"Use ALWAYS, NEVER, must, and only for true invariants such as safety rules, required fields, or actions that should never happen."*
  - Anthropic's guide says to dial back aggressive wording.
  - No guide supports capitals on judgement calls.
- **`NEVER` vs `do NOT`:** no guide gives them different meanings. What every guide supports:
  - capitalised `NEVER` only for real hard limits;
  - plain lower-case "do not" everywhere else.
  - The mixed-case "do NOT" adds emphasis without marking anything as a hard limit.
- **One-clause reasons:**
  - Anthropic asks for them, and no guide forbids them.
  - `.bkit/prompts.md:37` ("NO rationale") is a recorded deliberate choice, so the audit lists it as a choice rather than a finding. It also judged the choice once: Anthropic's guide says the opposite, and no other guide backs it.
- **Bold:** no guide covers it. 1,169 of the 1,217 bold spans in the prompts are structural (labels, `**If**`, `**Create**`). The exception is the bold `⛔` STOP line at the end of every prompt (`prompts-10`).

### Medium

- **`prompts-4`: a number nobody defined.** Six prompts must output a `Failures:` number, which the workflows copy into `status.jsonl`. No prompt says what it counts, so past runs wrote anything from 0 to 20 with no shared meaning (`bkit-plan-review-1/2/3`, `bkit-plan-scope-check-1/2`, `bkit-build-plan-verify`). `bkit-build-challenge-1.md:56` already shows a defined version.
- **`prompts-5`: a length cap that always loses.** The summary writers are told to keep output under 500 tokens, and also to list every acceptance item and open question word for word. The 36 existing design and plan summaries have a median of 1,686 words, and 35 of the 36 are over the cap. `bkit-ship-summary` has no cap, though `.bkit/prompts.md` says it does.
- **`prompts-6`: a verdict rule that can never fire.** `bkit-debug-summary.md:47` fails a run when a remediation output has a non-empty `Blockers` section. No remediation output has that section; they log `BLOCKED —` lines instead.
- **`prompts-7`: an unreachable verdict.** `bkit-build-plan-verify.md:46` fails immediately on any unmet task. So the `CONCERNS` verdict for gaps that gap-remediate could fix (`:50`) can never happen.
- **`prompts-8`: empty-case rules keyed on the wrong thing.** In `bkit-ship-update-docs.md:56` and `:60`, the "nothing to report" cases depend on whether there were blockers, not on whether anything was edited. A docs sync with two edits and no blockers could therefore list nothing. `:68` also describes a `FAIL` the prompt never produces.
- **`prompts-9`: extra re-check steps that cost tokens for nothing.** Five Opus-pinned prompts end with a separate "re-read the output and check it" step: `bkit-audit-generate`, `bkit-plan-generate`, `bkit-design-update`, `bkit-plan-update` and `bkit-utility-update-roadmap`. Anthropic's Opus 5 guide: *"instructions like these cause over-verification on Claude Opus 5, and removing them reduces wasted tokens with no loss in quality."*

### Low

- **`prompts-10`:** the bold `⛔` STOP line at the end of every prompt breaks bkit's own "never bold for emphasis" rule, and repeats the `Mandate`. On the five summary writers, it forbids editing files after a process that edits its output file.
- **`prompts-11`:** the "split this plan?" decision depends on an "estimated agent tokens" figure that nothing says how to estimate (`bkit-plan-complexity-check.md:40`).
- **`prompts-12`:** the ideate-1 and ideate-2 prompts ask for a "Reuse vs new" or "Friction vs ideal" analysis, then leave it out of their output format.
- **`prompts-13`:** `bkit-debug-failure-soak.md:38`, "Do NOT declare fix evidence does not support", is missing a word and reads two ways. It should be "Do not declare a fix the evidence does not support."

### Outside the prompts, but the same problem

- **The audit templates have the same problem.**
  - The 35 templates under `.bkit/templates/docs/templates/` repeat `**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT … **DO NOT stop for user permission.**` on 106 gate lines, plus `🚨` headings.
  - What these lines ask (tick the boxes, then carry on without asking) is fine; the shouting isn't.
  - A plain line keeps the instruction: "Tick each box once it holds, then continue to `Probe Steps` without asking."
- **`.agents/rules.md` uses the same capitals style**, and every agent reads it. Changing only the prompts would leave the old style one file away.
- **`bkit-utility-compress-markdown` only protects capitalised rule words.** If rules are rewritten in plain case, a later compression run could paraphrase them away unless that prompt changes too.

## Suggested addition to the audit process: Claude Code's `/doctor prompt-audit`

This came up in [#747 — Prompting practice: align authoring.md with tier-1 makers' guides](https://github.com/cbartens/bkit/issues/747) ([comment](https://github.com/cbartens/bkit/issues/747#issuecomment-6511252468), finding 10). I'm recording it here because it's about how the prompt audit runs, not about authoring.md. Nobody has run it yet.

### What it is

Claude Code has a built-in check called `/doctor prompt-audit` ([CLAUDE.md and memory](https://code.claude.com/docs/en/memory) § Audit your instruction files). I re-read that page on 2026-10-30 to confirm the following:

- It looks for instructions written for older models, pointers to files or commands that don't exist, and files that contradict each other.
- By default it covers `CLAUDE.md`, `CLAUDE.local.md` and `AGENTS.md`, plus the rules, skills, commands, subagents and output styles under `.claude/` and `~/.claude/`. You can point it at one file or folder instead, for example `/doctor prompt-audit .claude/agents`.
- It writes a report with proposed edits, and changes nothing until you tell it to apply them.
- It needs Claude Code v2.1.283 or later. It runs through the bundled `/claude-api` skill, so it won't work if that skill is switched off.

### Why it fits this audit

The quarterly audit reads the sources in `.bkit/core/prompts/` against the template in `docs/templates/bkit-audit-prompts.md`. `/doctor prompt-audit` reads the rendered copies an agent actually loads: `.claude/agents/`, `.claude/commands/`, `CLAUDE.md` and `AGENTS.md`. Running both catches two different kinds of problem:

- **The template's checks:** problems it was written to find, such as capitals, undefined numbers and verdicts that can never be reached.
- **Mechanical drift:** dead file pointers, rules that contradict each other across files, and wording aimed at older models. A one-off audit easily misses these.

Running it costs one command.

### Limits to write into the step

- **Fix the source, not the copy.** Its proposed edits target the rendered files under `.claude/`, which `bkit install` overwrites. Each fix goes into `.bkit/core/prompts/`, `.bkit/core/workflows/` or `.agents/` instead, with `bkit install` run afterwards.
- **It judges by Anthropic's guidance only.** "Written for older models" means older Claude models. Under the tier-1-first rule from #747, a finding that pulls against the OpenAI or Google guides counts as input, not a verdict.
- **Claude only.** I found no equivalent in Codex or Antigravity. It covers every host's prompts only because they all share the same sources.
- **Not tested headless.** It's a slash command. I haven't checked whether `@bkit-audit-generate` (a subagent) can run it. If it can't, the owner runs it by hand and pastes the report in as an extra input.

### Suggested change

Add an optional step to the prompt-audit template: run `/doctor prompt-audit` on the rendered copies, map each finding back to its source file, and merge it into the report under its own heading, marked as coming from that tool.

## Findings from the authoring.md review, and ideas for the prompts audit

These came out of the second search for tier-1 guides on [#747 — Prompt authoring rules for every tier-1 model](https://github.com/cbartens/bkit/issues/747) (details in [this comment](https://github.com/cbartens/bkit/issues/747#issuecomment-6511252468)). Each item gives the finding as of 2026-10-30, then how `.bkit/core/docs/templates/bkit-audit-prompts.md` could catch it on every run. Nothing is edited yet.

### 1. Instruction files measured against each host's size cut-off

**Finding:** `.agents/rules.md` is 30,413 bytes and 216 lines.
- **Antigravity:** its [rules page](https://antigravity.google/docs/rules/) says a rule file over 24,000 bytes is cut off. Past that point, `.agents/rules.md` holds the Orchestrator Rules and all the Project Rules.
- **Codex:** it stops reading project instructions past 32 KiB, per the [AGENTS.md page](https://learn.chatgpt.com/docs/agent-configuration/agents-md). That leaves 2,355 bytes of headroom.
- **Claude Code:** Anthropic's [CLAUDE.md page](https://code.claude.com/docs/en/memory) asks for under 200 lines, and the file is 16 lines over.

Each host reaches the file through a short pointer file (`GEMINI.md`, `AGENTS.md`, `CLAUDE.md`), so the agent probably reads it as an ordinary file and the cut-offs don't apply. That is not tested on Antigravity or Codex. If either host does load it as a rule file, the end of the file is silently dropped.

**Audit idea:** in Step 8 — Efficiency, measure every always-loaded instruction file, and every file it points to, against each host's published limit in bytes and lines. Report the headroom. For files reached through a pointer, record whether the cut-off was tested on that host or only assumed.

### 2. Workflow length against skill-size guidance

**Finding:** Codex and Antigravity install each workflow as a skill (`SKILL.md`, per the comment at `.bkit/core/engine/install/modules/antigravity.ts:31-39`). Anthropic's [skills guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) puts a skill body under 500 lines. Four workflows are longer:
- `bkit-build.md`: 1,014 lines, 82,851 bytes
- `bkit-debug.md`: 758 lines
- `bkit-ship.md`: 738 lines
- `bkit-design.md`: 567 lines

On Claude Code these files are slash commands, not skills, and the OpenAI and Google pages read give no line figure. So this is a signal, not a rule that applies.

**Audit idea:** in Step 2 — Inventory, record the form each prompt takes on each host (skill, slash command, subagent, rule file). Then Steps 6 and 8 can apply each maker's guidance for the form its host actually loads, instead of one figure for all.

### 3. Which hard limits a hook actually enforces

**Finding:** the [Claude Code guide](https://code.claude.com/docs/en/best-practices) says a rule with no exceptions belongs in a hook or a deny rule, because the model decides each time whether a written line applies. bkit has GateGuard and deny rules for some of the five harms: destroying data, leaking a secret, publishing or pushing, skipping the owner's approval, and breaking a field a program parses. Nobody has mapped which harms rest on capitals alone. [#462 — Review and adopt Krohn patterns](https://github.com/cbartens/bkit/issues/462) (closed) made the same point.

**Audit idea:** in Step 6 — Model Fit, where each capitalised absolute is already sorted, add a column for what enforces it: a hook, a deny rule, a script check, or prose only. A hard limit enforced by prose only is a finding.

### 4. Claude Code's built-in check for stale instructions

**Finding:** the memory page documents `/doctor prompt-audit`, which needs Claude Code v2.1.283 or later. It flags instructions written for older models, pointers to files that don't exist, and files that contradict each other. It covers `CLAUDE.md`, `AGENTS.md`, and the rules, skills, commands and subagents under `.claude/`. It reports proposed edits and changes nothing until asked. It hasn't been run on bkit.

**Audit idea:** in Step 11 — Anything Else, run it on the rendered `.claude/` copies as an independent second check. List each thing it flags that the audit missed, and each thing it flags that the audit judged fine.

### 5. A fixed list of guides to re-read

**Finding:** the first pass on #747 missed ten tier-1 pages, including the Codex, AGENTS.md, skills and Antigravity rules pages. Step 3 — Guides asks for "the current prompting guide and model-specific page", which leaves out the host pages about instruction files, skills and subagents. Those pages hold most of the size limits and description rules above.

**Audit idea:** once the #747 draft lands, Step 3 reads every page in `.bkit/authoring.md` § Who Says What's list of guides read, then searches for anything new. Every page the search adds goes into that list in the same change, so the next run starts from it. This needs the line 35 rule ("relies only on practice every one of those guides supports") changed to tier-1-first in the same change, as #747 already plans.

## Two more ideas for the prompts audit, from compressing the authoring.md draft

These came from compressing the `tmp/authoring.md` draft for [#747](https://github.com/cbartens/bkit/issues/747) on 2026-10-30. The pattern is the same as above: the finding, then how `.bkit/core/docs/templates/bkit-audit-prompts.md` could catch it on every run. The template is not edited yet.

### 6. A file too big for the agent's file-read tool to read in one go

**Finding:** the draft was 79,098 bytes, about 29,100 tokens. Claude Code's Read tool returns at most 25,000 tokens per call. When I read the draft, it stopped at line 536 of 735, with a note that more lines were left. So a model that reads the file in one call and doesn't notice the note never sees § Doc Templates or § Workflows Only. Nothing fails or warns. The agent just works without those rules.

The fix in the draft was to move the maker-guide comparison (§ Who Says What) to the end, and to tell readers to read it only when they add or change a rule. The part a normal reader needs is now 61,777 bytes, about 22,700 tokens, which fits in one read.

Step 8 — Efficiency already counts tokens, but only for each prompt's own fixed part. It doesn't count the docs that a prompt or a rule tells the agent to read, such as `.bkit/authoring.md` from the **Prose edits** and **Workflow edits** rules in `.agents/rules.md`.

**Audit idea:** in Step 8, also count the tokens in each doc that a prompt or a rule tells an agent to read. Compare the total with each host's per-call file-read limit. Where a rule sends the agent to named sections only, count just those sections. Report the headroom. A doc over the limit is a finding. So is a doc that only fits because the agent is expected to skip sections, if nothing tells it which ones to skip. I've only checked Claude Code's limit. Codex, Antigravity, Cursor and OpenCode are not checked yet.

### 7. Catching clipped text by counting articles

**Finding:** `pnpm grammar:density` (`.bkit/core/engine/tools/grammar-density.ts`) counts `a`, `an` and `the` per 1,000 words of agent-read text. Clipped text drops the articles first ("Append row to defer log"), so a falling count is a cheap sign that wording was squeezed past plain English. I used it before and after compressing the draft:

<!-- prettier-ignore -->
| File | Words | Articles per 1,000 words |
| --- | --- | --- |
| `tmp/authoring.md` before | 12,313 | 100.4 |
| `tmp/authoring.md` after | 12,032 | 100.6 |

Here are the figures for each group on `dev` at `c6e55423b`, as a first baseline:

<!-- prettier-ignore -->
| Group | Words | Articles per 1,000 words |
| --- | --- | --- |
| rules | 3,918 | 60.7 |
| prompts | 60,732 | 40.6 |
| workflows | 42,001 | 36.0 |
| clauses | 7,509 | 53.4 |
| store-rules | 3,635 | 64.4 |

Prompts and workflows score well below the rules file. That fits the plain-English rewrite in `c6e55423b`, which covered the rules more fully than the prompts. It doesn't prove that any single file is clipped, though, because a file with lots of code and field names scores low anyway.

**Audit idea:** in Step 4 — Clarity, run the count for each group and for each file, and compare it with the previous report's figures. A file that drops by more than a set amount since the last run, or that sits far below its group, gets a closer read for clipped sentences. The count only flags files to read. Clipped text is a finding only once someone has seen it in the sentences.

One catch: `grammar-density.ts` is tooling for the bkit repo only. It doesn't ship to consumers, but the audit template does. So the step needs one of two things: ship the count as a `bkit` command, or have the audit count the articles itself with a short script. The second fits the template's rule that counts use local tools only.

IMPORTANT: We should integrate .bkit/authoring.md best practice into the audit, i.e. check all found prompts against its basic best practice principles

## README now describes the finished prompt audit

Commit `793d02a8c` on `dev` (not pushed yet) changes `README.md` in two places:

- **The "Researched and battle-tested" paragraph** now says that one rulebook, `.bkit/authoring.md`, sets how agent instructions are written. It says the rulebook is matched against the current prompting guides from Anthropic, OpenAI and Google, so the same text works on Claude, GPT and Gemini. It also says that the prompt audit checks every prompt against the rulebook, and that every prompt passes.
- **The docs table entry for `.bkit/authoring.md`** now says the rulebook is matched against those three makers' guides.

**The wording describes this issue as finished, on purpose.** The owner asked for it, because the README goes out in the same release as this issue's changes. Until then, two parts of it are ahead of the repo:

- The audit template, `docs/templates/bkit-audit-prompts.md`, doesn't check prompts against `.bkit/authoring.md` yet.
- No audit has run against the new rulebook, so "every prompt passes" isn't proven yet.

One thing to line up before the release: the audits table in `.bkit/pipeline.md:312` says the `prompts` audit covers "Product prompts". The README now links to that table for the claim about bkit's own prompts, so that row should describe the new scope once the template changes.

`prettier --check README.md` passes, and so does `.bkit/core/engine/audits/repo/readme-models.test.ts` (unit, 6 tests).

## README claim widened to every file agents read

Commit `10aebfa09` on `dev` (not pushed yet) rewords the README claim from the previous comment and gives it its own paragraph, right after "Researched and battle-tested". It now says that every file bkit gives agents to read follows Anthropic's, OpenAI's and Google's own prompting advice. That covers prompts, workflows, rules and project docs, not only prompts. It also says the prompt audit checks every one of those files against `.bkit/authoring.md`, and that every one passes.

**This widens what the audit has to cover before the release.** The README now promises it checks every agent-read file, not just `.bkit/core/prompts/`. That is the same scope `.bkit/authoring.md` § All Agent-Read Files lists: `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md`, `.agents/**`, `.bkit/**`, `docs/**` (doc templates included), `AGENTS.md`, `CLAUDE.md` and `GEMINI.md`. The template `docs/templates/bkit-audit-prompts.md` needs to read that full set, and the `prompts` row at `.bkit/pipeline.md:312` should say so.

`prettier --check README.md` passes.

## README: writing rules added to the What's inside table

Commit `d340fe9c8` on `dev` (not pushed yet) makes three changes to `README.md`:

- **What's inside** gains a "Writing rules" row that links to `.bkit/authoring.md`. It lists 50+ rules on how every prompt, workflow, rule and doc is worded, matched practice by practice against Anthropic's, OpenAI's and Google's prompting guides, so one text works on every model.
- **The line under the table** now says the files are written to those writing rules.
- **The prompting-advice paragraph** now calls `.bkit/authoring.md` "writing rules" instead of "rulebook". The Agent rules row already uses "rulebook" for `.agents/rules.md`, and each name should mean one thing.

**Why it's different** is unchanged. That section argues that bkit relies on checks in code, not on prompts, so a line there about prompt quality would cut against its own point.

`prettier --check README.md` passes, and so does `.bkit/core/engine/audits/repo/readme-models.test.ts` (unit, 6 tests).

## README: the prompting-advice claims now link to the evidence

Commit `31c6a3a50` on `dev` (not pushed yet) adds two links. Both turn the words "matched practice by practice" into a link to `.bkit/authoring.md#who-says-what`, the table that sets each practice beside what Anthropic's, OpenAI's and Google's guides say about it:

- the Writing rules row in What's inside;
- the prompting-advice paragraph near the top.

Readers can now check the claim instead of taking it on trust. `prettier --check README.md` passes, and the `## Who Says What` heading the link points to exists.

## #483 — Repo audit (open)

Run `.bkit/core/prompts/bkit-audit-generate.md` with `docs/templates/bkit-audit-repo.md` to generate the latest audit report.

Copy-paste prompt:

```
Run .bkit/core/prompts/bkit-audit-generate.md.

Read: docs/templates/bkit-audit-repo.md
```

The agent writes `docs/audits/{YYYYMM}/repo.md`. If that month already has this slug, it writes `repo-{TIMESTAMP}.md` and does not overwrite.

## #774 — Check prompts against .bkit/authoring.md in bkit-audit-prompts (closed)

### Narrative

On 2026-10-30 the owner asked on three prompt-audit parents (bkit #503 — Prompt audit, consumer A #1441, consumer B #490) for the prompt audit to check prompts against bkit's own authoring rules. Today no audit template names `.bkit/authoring.md`: `git grep -c authoring f2805f4c2 -- .bkit/core/docs/templates/` finds nothing, and the control search finds hits. The file ships to consumers, so its advice goes unchecked.

### Success Criteria

- `bkit-audit-prompts` Anchor Standards lists `.bkit/authoring.md`, read at the installed bkit version.
- Step 5 — Structure: "check each prompt against its principles, one row per principle."
- The audit coverage tests in `.bkit/core/engine/audits/templates/templates.test.ts` still pass.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer has no `.bkit/authoring.md` (older install) | Pre-Flight fallback + `Not Checked`, not a pass |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Template still passes shape and coverage tests | unit | `.bkit/core/engine/audits/templates/templates.test.ts` (existing) |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Prompts template
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add the anchor standard and the Step 5 row rule
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-prompts.md`: Anchor Standards, Step 5 — Structure
  - **READ:** `.bkit/core/.bkit/authoring.md`: section titles after #747 lands
  - **DONE WHEN:** `bkit install` and `bkit check` clean
  - **TEST FIRST:** n/a — template text
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### References

- **Audit reports:** docs/audits/202610/audit-improvements-20261031T034130Z.md (findings audit-improvements-11)
- #503 — Prompt audit (https://github.com/cbartens/bkit/issues/503)
- Parent: #627 — Audit improvements

###### bkit:blocked-by start
- #747
###### bkit:blocked-by end

Fixed on branch `feat/627` in commit a006a23ef (not pushed yet).

`.bkit/core/docs/templates/bkit-audit-prompts.md` now names `.bkit/authoring.md` as its anchor. It also asks for one row per authoring principle, so each prompt is checked against every rule in that file rather than against a general sense of quality.

## #841 — Ship Step 4 merge push is blocked by the pre-push skip-ci guard (closed)

### Failing test or CI run

none yet. The fix adds a failing test first: `.bkit/core/engine/commands/workflow/branches.test.ts` asserts the `--merge` merge commit carries no skip token.

### What happened

When `dev` has moved since the PR's last push, `/bkit-ship` takes Path B. Step 4 runs `bkit branches sync --merge`, which merges `origin/dev` into the feature branch and then pushes it plain. Every commit that merge makes is marked `bkit [skip ci]`: `merge dev`, `rebuild … after merging dev` and `regenerate after merging dev`.

The pre-push hook blocks that push. Its CI-suppressor HEAD guard (`.husky/pre-push`, the block under "CI-suppressor HEAD guard") refuses a feature-branch push when all three hold:

- the newest commit carries a skip token;
- the branch has an open PR;
- the push changes more than bookkeeping files since the remote head.

The Step 4 push always has all three, because the merge brings `dev`'s code onto the branch. The push fails, so ship goes to its Failure Path at Step 4.

Moving the merge into the Step 8 bookkeeping push does not avoid it. That push would carry the same code under a `[skip ci]` bookkeeping commit on top, which is the same blocked shape.

### What should happen

The Step 4 merge push goes through. CI starts on the merged head straight away, and Step 9 `bkit runs revalidate` finds that run instead of starting its own. The probe-then-dispatch logic in `.bkit/core/engine/commands/workflow/runs.ts` already does this.

### Steps to reproduce

1. Take a feature branch with an open PR into `dev`, while `dev` has new commits that touch code.
2. Run `/bkit-ship` on it, or run `bkit branches sync --merge --fid={FID} --file={STATUS} --sentinel=…` and then `bkit branches push --mode=plain`, from a checkout where the husky hooks are installed (`.husky/_` exists).
3. The hook prints `[pre-push] BLOCKED: HEAD on 'feat/…' carries a CI-suppressing token and PR #N is open — its checks would stay vacuously green.` and the push exits 1.

### How often

Every Path B ship run on a branch with an open PR, wherever the hooks are installed. No ship run has reached a Step 4 merge since #799 landed on 2026-11-01, so no real run has hit it yet.

### Affected area

- `mergeDev` and `regenerate` in `.bkit/core/engine/commands/workflow/branches.ts`: the `full` merge policy adds the `bkit [skip ci]` tag.
- `.bkit/core/workflows/bkit-ship.md` Step 4: "Each commit the block makes carries `bkit [skip ci]`".
- `.bkit/core/.bkit/workflows.md`: § ship skip-token placement and the commit-message table.
- `.bkit/instructions.md` § Clauses › `docs-commits`: the `kept` drift entry for `bkit-ship:395`.

### Where and when

Found on 2026-11-03 while preparing to ship #825 (PR #839). `dev` was 21 commits ahead and PR #839 was open.

### Evidence

A throwaway merge commit (no ref, nothing pushed) built with ship's exact message `chore(825-show-progress-bar): merge dev bkit [skip ci]`, with the PR head and `origin/dev` as parents, fails the hook's checks:

- `bkit ci skip-token --ref=<merge>` → exit 0, `token: [skip ci]`
- `bkit ci bookkeeping-push --from=<PR head> --to=<merge> --branch=feat/825-show-progress-bar` → exit 1, with code files outside the allow-list (e.g. `scripts/graphify/bkit-graphify.sh`)
- `gh pr list --head feat/825-show-progress-bar --state open` → `839`

The hook's own test pins this shape: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "[skip ci] head that also changes code, open PR → blocked before any gate".

### Fix

Drop the skip token from every commit the `full` merge policy makes, as the `docs` policy already does. The merge commit carries code, so `.agents/rules.md` § Docs commits says it must not carry the tag.

- The push then passes the guard, and the hook runs the full local gate as for any code push.
- GitHub CI starts at Step 4 and runs while Steps 5–7 work. Step 9 waits on that run instead of dispatching a new one after Step 8, so ship finishes no later than before.
- The `kept` drift entry under `docs-commits` reasoned that Step 9 starts CI itself, so a push trigger adds nothing. It is retired, because a merge commit carrying `[skip ci]` cannot be pushed past the guard at all.

### References

- #799 — ship Step 4 merges origin/dev locally (https://github.com/cbartens/bkit/issues/799)
- #825 — the ship run that found it (https://github.com/cbartens/bkit/issues/825)
- `docs/decisions.jsonl` key `799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase`
- `docs/knowledge.jsonl` key `kn-11-pr-statuscheckrollup-stays-empty-when-skip-ci-is-head`
- `.bkit/instructions.md` § Clauses › docs-commits

Fixed in ba4e3fb91 on `dev`. It is committed but not pushed yet.

**What changed**
- `bkit branches sync --merge` no longer adds `bkit [skip ci]` to any commit it makes: the carried work, the `dev` merge and the regenerated files all get plain `chore({FID}): …` subjects. The `skipCi` option on `regenerate` is gone.
- The pre-push hook therefore lets ship's Step 4 push through even when the PR is open and the merge brings `dev`'s code.
- The push starts CI at the merged head. Step 9's probe (`bkit runs revalidate`) polls for a run before it dispatches, so it finds that run and waits on it instead of starting a second one. I checked this in `waitFor` in `.bkit/core/engine/commands/workflow/runs.ts`.
- Docs updated to match: `bkit-ship.md` Step 4 sub-step 1, `.bkit/core/.bkit/workflows.md` (the marker section, the step table and the commit-message table), `.bkit/shared/docs/deployments.md`, and the `.bkit/instructions.md` local copy. The old "kept" drift note that defended the skip tag is removed.
- I appended an updated row to the decision record `799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase`. The installed mirrors, the ship render baseline and `dist/` are regenerated.

**Checks**
- Unit: 3690 passed (audits, render, instructions, branches).
- Integration: 77 passed (auto-route marker, ship verdict, workflow lock snippet).
- Typecheck, lint and `bkit check` are clean.
- Red-to-green on the branches tests: 7 failed before the fix, 245/245 passed after.

**Not done:** not pushed, and no live ship run has been done since the fix.

## #782 — Add board, retention, CI-source and retry checks to bkit-audit-logs (closed)

### Narrative

Two consumer B log runs (consumer B `docs/audits/202610/logs.md:468`, `:469`, `:473`; `logs-20261029T051504Z.md:473`) found four ways `.bkit/core/docs/templates/bkit-audit-logs.md` miscounts (lines at `f2805f4c2`):

- Step 3 — Board (`:102`) takes the unresolved count from an issue search, but issue search drops groups whose events have expired (`-40`).
- Step 3 never compares the error tracker's event retention with the audit window. Retention is checked only for logs (`:148`) (`-41`).
- Step 11 — Runtime Logs never names CI as a log source, even when CI writes to production resources (`-42`).
- Step 11 counts each retry log line as a failure, without joining it to the request's final outcome (`-43`).

### Success Criteria

- Step 3: "Take the unresolved count from per-id lookup; issue search drops groups whose events expired." and "Compare tracker event retention with the window before trusting any board figure."
- Step 11: "When CI writes to production resources, name CI as a runtime-log source." and "Join retry log lines to the final request outcome before counting failures."

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Template still passes shape and coverage tests | unit | `.bkit/core/engine/audits/templates/templates.test.ts` (existing) |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Logs template
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Apply the four changes
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-logs.md`: Step 3 — Board, Step 11 — Runtime Logs
  - **DONE WHEN:** `bkit install` and `bkit check` clean
  - **TEST FIRST:** n/a — template text
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Out of Scope

- The scheduled-job outcome clause for Step 12 — Alarms is in a separate sub-issue of #627 (audit-improvements-4).

### References

- **Audit reports:** docs/audits/202610/audit-improvements-20261031T034130Z.md (findings audit-improvements-40, audit-improvements-41, audit-improvements-42, audit-improvements-43)
- Parent: #627 — Audit improvements

Fixed on branch `feat/627` in commit a006a23ef (not pushed yet).

`.bkit/core/docs/templates/bkit-audit-logs.md` now:

- counts board items per id;
- checks log retention against how far back the audit needs to look;
- records which CI run each log came from;
- joins retries to the original attempt, so one failure that was retried is not counted as several.

## #635 — Add revert-the-fix, CI skips and child clocks to bkit-audit-testing (closed)

### Narrative

The 2026-10-17 testing run on bkit (`docs/audits/202610/testing.md`, at `5f5a097c`) found three places where following `bkit-audit-testing` exactly would give a false all-clear. All three gaps are still in the canonical template at `HEAD` (`.bkit/core/docs/templates/bkit-audit-testing.md`):

1. **"A test exists" was not proof the fix is guarded (`audit-improvements-31`).** Step 3's failures-ledger row (`:113`) says "each fixed row needs test red if fix reverted" but gives no way to check it. The run first read the test names and concluded the closed `HIGH` `antigravity-hook-commands-wrong-cwd` was covered. It then reverted the fix as a hand mutant (M23, `.bkit/shared/.agents/plugins/bkit/hooks.json:9`), and all 5624 tests stayed green: no test ran the hook command from the directory the host runs it in. That became `testing-2`, since closed (`docs/failures.jsonl` key `audit-testing-antigravity-hook-command-cwd-untested`). A run that only reads test names reports this row as guarded.
2. **Local skip counts hid CI skips (`audit-improvements-32`).** Step 9 (`:153`) asks for env-dependent skips but not where to count them. Locally 0 tests skipped. On CI run `39022562685`, unit reported "4438 passed | 2 skipped" and integration "1178 passed | 6 skipped". 8 tests (zsh and actionlint checks) never run on CI at all (`testing-6`). A run that counts locally reports "no skips". `grep -i -E 'CI (runner )?log|runner log|on CI'` over the template → 0 hits.
3. **Pinning the clock left subprocesses on the real clock (`audit-improvements-33`).** Step 10 (`:154`) pins the clock with e.g. `vi.setSystemTime` / Playwright `page.clock`, which fakes time only inside the test process. The run pinned 15 date-touching suites, and their child `git` / `node` processes kept the real clock (report § Time, "Pin limit"). This repo has 32 unit-named files that spawn subprocesses (`testing-8`). The run reported the date tests as pinned when only the in-process half was. `TZ` is different: Step 10 already sets it on the process before workers spawn, and child processes inherit it. `subprocess|GIT_AUTHOR_DATE|faketime` → 0 hits.

This issue adds one sentence to each of Step 3, Step 9 and Step 10, with tools named only as examples.

### Success Criteria

- Step 3 tells a run to check each fixed `HIGH` / `CRITICAL` failures-ledger row by reverting the fix as a Step 6 hand mutant, and says a test named for the row is not proof.
- Step 9 tells a run to read skip counts per file from the CI runner log as well as local runs.
- Step 10 says a clock pin covers in-process time only, names how to set a child process's clock, and sends an unpinned subprocess half to `Not Checked`.
- The installed copy `docs/templates/bkit-audit-testing.md` matches the canonical template, and `.bkit/core/engine/audits/templates/templates.test.ts` and `.bkit/core/engine/tools/wording.test.ts` pass.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Fixed row's `references` name an issue and a file but no commit (e.g. key `antigravity-hook-commands-wrong-cwd`: `#550`, `hooks.json`) | Find the fix by `git log -S` / `--grep` on the key or file; none found → that row `Not Checked` |
| Fix cannot be reverted locally (applied migration, remote setting, vendor dashboard) | Row `Not Checked` with the reason; never "guarded" |
| Revert conflicts with later edits | Hand-revert only the fixed behaviour; restore the tree per the template Rules (`:23`) |
| Fixed `MEDIUM` / `LOW` rows | Not required; the revert check is for `HIGH` / `CRITICAL` only, to bound cost |
| No CI, or the CI log has expired | Local counts only; CI half → `Not Checked` |
| Runner prints totals, not per-file skips | Use a per-file reporter (e.g. verbose or JUnit output); otherwise totals plus `Not Checked` per file |
| Suite spawns no subprocess | New Step 10 sentence does not apply; nothing to record |
| Child clock cannot be set (binary ignores env, no faketime on the host) | Subprocess half → `Not Checked`; in-process result still recorded |
| New sentence is 80%+ similar to a shared clause | `wording.test.ts` flags a near-copy; reword it locally. Never add a clause: one template is below the 5-template threshold (`.bkit/wording.md:10`) |
| `pnpm bkit upgrade` in a dirty tree rewrites other managed files too | Stage and commit only the two `bkit-audit-testing.md` files |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Installed copy's managed block equals the canonical one except for the version stamp | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` |
| New sentences are local: no near-copy of a shared clause, no unlisted shared sentence, in either copy | Unit | `.bkit/core/engine/tools/wording.test.ts` |
| Neither copy carries a leaked host path | Unit | `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` |

No new test. The changes are prose, and a test asserting the new sentences exist would only pin the wording.

### Tasks

- [ ] **Task 1:** Step 3 failures-ledger bullet (`.bkit/core/docs/templates/bkit-audit-testing.md:113`), after "(each fixed row needs test red if fix reverted).", add: "Check it per fixed `HIGH` / `CRITICAL` row by reverting the fix as a Step 6 hand mutant; a test named for the row is not proof." **Done when:** `grep -n "reverting the fix" .bkit/core/docs/templates/bkit-audit-testing.md` hits line 113. **Test first:** n/a — template wording only; no test asserts step text.
- [ ] **Task 2:** Step 9 (`:153`), after "env-dependent skips.", add: "Skip counts per file from the CI runner log too (e.g. the job log's `N skipped` lines), not only local runs; a tool missing on the runner skips there only." **Done when:** `grep -n "CI runner log" .bkit/core/docs/templates/bkit-audit-testing.md` hits Step 9. **Test first:** n/a — template wording only; no test asserts step text.
- [ ] **Task 3:** Step 10 (`:154`), after "throwaway setup removed after.", add: "A clock pin covers in-process time only: suites spawning subprocesses (e.g. `git`, `node`) need the child's clock set too (e.g. `GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE`, a faketime wrapper), else the subprocess half → `Not Checked`." **Done when:** `grep -n "in-process time only" .bkit/core/docs/templates/bkit-audit-testing.md` hits Step 10. **Test first:** n/a — template wording only; no test asserts step text.
- [ ] **Task 4:** Apply `.bkit/core/prompts/bkit-utility-compress-markdown.md` Process rules to the three new sentences (`.agents/rules.md` § Prose edits), then refresh the installed copy with `pnpm bkit upgrade`. Check `git config core.bare` reads `false`, and stage only `.bkit/core/docs/templates/bkit-audit-testing.md` and `docs/templates/bkit-audit-testing.md` (its `## Project Instructions` stay untouched). **Done when:** `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/tools/wording.test.ts .bkit/core/engine/audits/templates/template-no-userpath.test.ts` passes; `pnpm lint:prose` and `pnpm format:check` pass. **Test first:** `.bkit/core/engine/audits/templates/templates.test.ts` `%s dogfood managed block differs only by the managed-version stamp` fails for `docs/templates/bkit-audit-testing.md` on the `upToEnd(dogfood)` `toBe` assertion after Tasks 1-3 and before the upgrade.
- [ ] **Task 5:** Add one `CHANGELOG.md` `## [Unreleased]` `### Changed` bullet for the three testing-audit checks, next to the existing "The testing audit looks for test linters…" entry. **Done when:** `grep -n "revert" CHANGELOG.md` hits the `[Unreleased]` block. **Test first:** n/a — release notes only.

### Open Questions & Assumptions

- **This repo's own `Project Instructions`** (`docs/templates/bkit-audit-testing.md`, below `bkit:end`) already say "check each by a revert-the-fix mutant" (Step 3), give the CI-log skip command (Step 9) and give the `mergeConfig` clock-pin procedure (Step 10). Options: (a) leave them, (b) prune the generic half now in the template. Recommend (a): they hold the repo's exact commands, and the next `@bkit-audit-generate` run refines them. Default (a).
- **Should Step 6 also name the Step 3 revert mutants?** Step 6 (`:132`) already says "break by hand, run test, watch red, restore" for code the tool cannot reach, and Task 1 points at Step 6 by name. Recommend no Step 6 edit. Default: none.
- **Assumption:** `lite:build` fits. `.bkit/lite.md` § When to use bars schema, public API, dependencies, secrets / config, auth / security and large refactors; this is prose in one shipped template. Because lite skips CI, run Task 4's tests locally before pushing.

### Breaking Changes & Naming

None. No step is renamed, renumbered or removed; consumers get the new text on their next `bkit upgrade`, below-`bkit:end` content untouched.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Gitignored inputs missing in a throwaway mutation worktree (Step 6) | Shared wording across templates | `audit-improvements-45`, Suggested Issues row 5 of `docs/audits/202610/audit-improvements.md` |
| Host shell traps (zsh word-splitting, unmatched globs) | One shared rule for every audit | `audit-improvements-44`, Suggested Issues row 2 |
| Separate lane and count for shipped copy-and-own test files (Step 9) | `ALREADY IN` (`:153` "Every test file has a lane"); the separate count is this repo's layout | `audit-improvements-51`; this repo's `Project Instructions` |
| "Registration-only hook test" as a new Step 7 shape | Seen once; watch item | `audit-improvements-52` |
| Product findings `testing-1` … `testing-14` (e.g. the 8 CI-skipped tests) | About bkit's tests, not the template | `docs/audits/202610/testing.md` § Suggested Issues |

### References

**Audit reports:** docs/audits/202610/audit-improvements.md (findings audit-improvements-31, audit-improvements-32, audit-improvements-33)

- Source run: `docs/audits/202610/testing.md` § Process Improvements (`Universal`, bullets 1, 2, 4); § Scores (M23); § Runs (env-dependent skips); § Time ("Pin limit").
- Canonical template: `.bkit/core/docs/templates/bkit-audit-testing.md` Rules `:23`, Step 3 `:113`, Step 6 `:122-132`, Step 9 `:153`, Step 10 `:154`. Installed copy: `docs/templates/bkit-audit-testing.md` (same line numbers).
- Ledger rows: `docs/failures.jsonl` key `antigravity-hook-commands-wrong-cwd`; `docs/failures.jsonl` key `audit-testing-antigravity-hook-command-cwd-untested`.
- `.bkit/wording.md` § Format (near-copy rule), `.bkit/trackers.md` § Issue shapes, `.bkit/lite.md` § When to use.
- Related: #480 — Testing audit; #627 — Audit improvements.

Landed on `dev` in 8a1dbd56 (not pushed yet). Canonical template and bkit's own copy under `docs/templates/` both updated; the issue's line numbers had drifted 1 to 2 lines, so every edit uses the lines at HEAD.

`bkit-audit-testing` now:

- **Step 3:** checks each fixed `HIGH` / `CRITICAL` failures-ledger row by reverting the fix as a hand mutant. A test named after the row is not proof. A fix that can't be found or reverted locally → `Not Checked` with the reason.
- **Step 9:** reads per-file skip counts from the CI runner log too, because a tool missing on the runner skips only there.
- **Step 10:** a clock pin fakes time only inside the test process. Suites that spawn subprocesses set the child's clock too, or that half is `Not Checked`.

Tests: wording, templates, prompt-notation, shipped-docs-refs and dogfood parity pass; `bkit check` exits 0.

## #586 — bkit branches push fails when a pre-push hook prints more than 1MB (closed)

## What happens

In a repo whose pre-push hook prints a lot of output, every `git push` bkit makes fails:

- `bkit branches push --mode=feature` exits 8 and prints `{"pushed":false,...}`.
- The logged error cuts off partway through the hook's output and never names a cause.

The hook isn't actually failing. Running `git push --dry-run` by hand on the same branch runs the same hook, and it exits 0.

## Why

`runGit` (`.bkit/core/engine/commands/lib.ts:335`, published as `dist/commands/lib.js:257` in 5.2.4) calls `spawnSync("git", args, { cwd, encoding: "utf-8", env: gitEnv() })` with no `maxBuffer`. Node's default output limit for `spawnSync` is 1MB. Git sends pre-push hook output to its own stderr, so a chatty hook passes that limit; Node then kills `git push` mid-hook and sets `res.error` to `ENOBUFS`. `runGit` only checks `res.status`, so it reports an ordinary failure and the reason is lost.

The other helpers that run commands already raise this limit, so `runGit` is the odd one out:

- `runTool` (`lib.ts:382`): `maxBuffer: 1 << 26`
- `ci/ci.ts:215`: `1 << 28`
- `workflow/context.ts:923`: `1 << 29`
- `workflow/worktrees.ts:176`: `1 << 26`
- `workflow/ledgers.ts:92`: `1 << 28`

## Affected commands (every push that goes through `runGit`)

- `bkit branches push`: `workflow/branches.ts:625`
- `bkit branches land`, the `dev` push: `workflow/branches.ts:1008`. This one is worse: it fails after the squash commit is already made on `dev` in the main checkout, leaving an unpushed commit on a shared branch.
- The ship `dev` sync push: `workflow/branches.ts:843`
- `workflow/runs.ts:313-314`, `workflow/roadmap.ts:475`, `workflow/workflows.ts:402/927/938/944`, `workflow/worktrees.ts:221` (remote branch delete)

## How to reproduce

Any repo whose pre-push hook writes more than 1MB, e.g. a full unit run with coverage. In gether-life/app-gether-life (bkit 5.2.4, Node v24.16.0) the hook writes about 7MB:

1. `bkit branches push --mode=feature` → exit 8, three times in a row.
2. `git push --dry-run --force-with-lease origin <branch>` → hook passes, exit 0.
3. Plain `git push origin <branch>` → succeeds.

## Fix

- Give `runGit` the same `maxBuffer: 1 << 26` as `runTool`.
- Check `res.error` in `runGit` and put it in `stderr`, naming `ENOBUFS` and the limit, so an output overflow can't pass as an ordinary push failure.
- `runTool` reports any `res.error` as "`<cmd>` not found on PATH" and sets `found: false`. An `ENOBUFS` there gets the wrong message, and for `gh` it wrongly sends callers down the "gh missing" MCP fallback. Only a spawn failure (`ENOENT`) should mean not found.

Streaming the hook output straight to the terminal (`stdio: inherit`) was considered and not taken: bkit commands print their one JSON result on stdout, and callers log the captured stderr when a push fails.

## Workaround until it ships

Make the hook quieter (send test output to a log file, print only failures), or push with plain `git push` when bkit reports exit 8.

## Fixed in 540cd87d (on `dev`, not yet released)

**Cause confirmed.** `runGit` kept git's output in memory under Node's 1MB default. Git passes a pre-push hook's output through as its own stderr, so a hook printing more than 1MB got `git push` killed partway through the hook. bkit then reported it as an ordinary failed push (exit 8) with a cut-off log and no reason.

### What changed (`.bkit/core/engine/commands/lib.ts`)

- `runGit` now allows 64 MiB of output, the same limit as `runTool`. Both share one `OUTPUT_LIMIT` constant.
- When Node itself fails to run the command, as opposed to the command exiting non-zero, the reason now goes first in `stderr`. An overflow reads `git push: output passed the 64 MiB limit (ENOBUFS)`, followed by whatever output was captured. Other errors use Node's own message, which names the error code (e.g. `ENOENT`).
- `runTool` now reports `found: false` ("not found on PATH") only when the program couldn't be started at all. Before, an overflow also looked like "gh is not installed" and sent callers down the GitHub MCP fallback.
- Every push listed in the issue body goes through `runGit`, so they are all covered: `branches push`, `branches land`, ship's `dev` sync, `runs.ts`, `roadmap.ts`, `workflows.ts` and `worktrees.ts`. No call sites needed changing.

**Not done:** letting the hook output go straight to the terminal. bkit commands print their one JSON result on stdout, and callers need the captured stderr to log why a push failed.

### Tests

- `lib.test.ts`, new `runGit / runTool output limit` block:
  - `runGit` returns 2MB of output intact.
  - `runGit` names `ENOBUFS` and the limit when output passes 64 MiB.
  - `runGit` surfaces a failed start (missing working directory → `ENOENT`).
  - `runTool` reports an overflow as found, with a non-zero status and the reason.
  - `runTool` still reports a missing program as not found.
- `branches.test.ts`, `branches push`: pushes when a real pre-push hook prints 2MB. With the limit temporarily set back to 1MB this test fails with exit 8, the failure reported here.
- `pnpm vitest run`: 170 files, 5630 tests, all passed. `pnpm bkit:gate:static-unit`: passed.
- Real run: after `pnpm build`, ran `node dist/cli.js branches push --mode=feature` in a fresh scratch repo whose pre-push hook prints 7MB, the same size as app-gether-life's. It exited 0 and the remote branch SHA matched local HEAD.

### Also in the commit

- `CHANGELOG.md`: entry under `[Unreleased]` → `Fixed`.
- `dist/commands/lib.js`: rebuilt.

### Getting it to consumers

The fix reaches consumers in the next bkit release, after they run `bkit upgrade`. Until then the workaround above still applies: make the hook quieter, or use plain `git push` when bkit exits 8.

## Follow-up fix in 42202368 (on `dev`, not yet released)

**What went wrong.** 540cd87d made `runTool` report an over-limit command as "found, but failed". On GitHub's Linux CI machines its new test then failed: `runTool reports ENOBUFS as found, with the cause, not as missing from PATH` (`.bkit/core/engine/commands/lib.test.ts:400`) got exit status `0`.

**Cause.** When a command prints more than the 64 MiB limit, Node stops reading and raises `ENOBUFS`. Sometimes the command has already finished with exit 0 by then, so `runTool` passed that 0 straight through. `runGh` checks only the status, so it treated cut-off `gh` output as a success. Whether you get 0 depends on timing, not on the OS. A probe that printed 64 MiB+ got exit 0 two runs out of five on macOS, and was killed (SIGTERM) on Linux in Docker. On CI, `git cat-file` happened to finish first.

**Fix.**

- `runTool` (`.bkit/core/engine/commands/lib.ts`): a spawn error is never a success. If Node raised an error and the command exited 0, the status becomes `1`.
- `gitRaw` in `.bkit/core/engine/commands/workflow/ledgers.ts` (used by `bkit ledgers`) had the same gap, with a 256 MiB limit: it ignored the error entirely. It gets the same rule.
- `runGit` was already correct (`ok: !res.error && res.status === 0`).
- Not changed: `context.ts` never reads the exit status. `worktrees.ts` already treats an error as status 127. The slop-scan step in `ci.ts` writes stdout to a file, so the limit only covers stderr there.
- The CHANGELOG entry for #586 gains one sentence covering this.

**Verified.**

- The same macOS probe now reports `1` (or `143` when killed) instead of `0`.
- The full unit suite passes locally (5653 tests).
- On GitHub, bkit-ci passed on 42202368 (it failed on 72baf71f): https://github.com/cbartens/bkit/actions?query=branch%3Adev

## #528 — ci: reuse the dev push run for promotion PRs (adopt release-PR mirror mode in bkit's own CI) (closed)

## Problem

bkit's own `bkit-ci` runs the full suite twice for one commit when promoting `release/*` → `main`. The `dev` push run and the promotion PR's run have the same head SHA, and the PR run adds nothing: the tree is identical and already green.

bkit already ships the fix — the **release-PR mirror** mode (`docs/deployments.md` § One CI run per dev commit, decision `release-pr-mirrors-dev-push-run`, adopted from `gether-life/app-gether-life`) — as an opt-in scaffold in `.bkit/templates/.github/workflows/bkit-ci.yml`. bkit's own `.github/workflows/bkit-ci.yml` does not enable it, so this repo pays the duplicate on every promotion.

## Evidence (PR #527)

<!-- prettier-ignore -->
| Run | Event | Head SHA | Time | Result |
| --- | --- | --- | --- | --- |
| `38150686541` (#11) | push `dev` | `6f3ce659…` | 15:17:53 | green, `run_level=full` |
| `38150872681` (#12) | pull_request `release/5.0.1` → `main` | `6f3ce659…` | 15:20:35 | green, `run_level=full` |

Same commit, two full runs, ~3 minutes apart.

`Decide Run Level` on the push run logged `ran-because:dev-push-direct-escalated` — `commits/{sha}/pulls` returned empty at 15:18 and the PR was opened at 15:20 — so that push run was `full` and the mirror's precondition 1 held for this commit.

## Why `Check SHA Cache` cannot catch it

The cache matches on `$GITHUB_SHA`:

```bash
--jq "[.[] | select(.headSha == \"$GITHUB_SHA\") | select(.createdAt > \"$SINCE\")] | length"
```

On a `pull_request` event `github.sha` is the synthetic merge commit (`refs/pull/527/merge` = `395fffec…`), while `gh run list --json headSha` reports the real head (`6f3ce659…`). The predicate never matches, so `skip=false` and every lane runs. The step log confirms it: no `::notice`, no `skip=true`.

Even when it does match (a push re-run at the same SHA), it is a short-circuit *after* the run is green — it cannot serve as the PR's verdict, which is what mirror mode needs.

## Proposal

Adopt mirror mode in bkit's own `bkit-ci.yml`.

1. **Planner** — add `Decide Release Mirror` to `bkit-tests-scope`: same-repo PR + head ref is a promotion branch + base == default branch → `mirror_push_run=true`, `run_level=none`, `run_e2e` / `run_live` / `run_migration` / `web_affected=false`. The field stays required in the plan (`false` otherwise).
2. **Capstone** — add `Mirror Push Run` to `bkit-tests-check`, before `Assert Test Plan Followed`: `bkit runs mirror --head="$PR_HEAD_SHA" --branch=dev --max-minutes=170`. That job currently has no checkout and no install, so it needs both.
3. **Widen the trigger predicate.** The template predicate is `head_ref == 'dev'`. bkit promotes via `release/*` → `main` (`main only ever moves via a release PR (release/* -> main)`), so `dev` alone never matches. Accept `dev` and `release/**` and let `bkit runs mirror` resolve the push run **by SHA** — a `release/*` head with no green `dev` push run then fails red (exit 3) instead of silently passing.
4. **Drop the merged-PR → `light` arm** in `Decide Run Level` (`bkit-ci.yml:163-165`). Precondition 1 requires every `dev` push to be `full`: a `light` push skips tiers and the promotion PR would inherit that. bkit escalates a *direct* `dev` push to full but still leaves a merged-PR `dev` push light.

Preconditions 2 and 3 already hold: the push diff base is the last green push run (`resolve-push-base.mjs`, logged `base=c2ef493e… source=last-green-run`), and bkit has no deploy job to rewire.

## Design considerations / open questions

- **`release/*` soundness.** Mirroring assumes the PR head is the dev tip. A `release/*` branch carrying extra commits has no push run at that SHA, so `bkit runs mirror` fails red — safe, but noisy. Decide whether to keep `release/*` PRs mirror-only or to require the release branch to be exactly the dev tip.
- **First promotion after enabling.** The mirror needs a completed green push run at the head. Opening the promotion PR before `dev` is green makes the check wait (`--max-minutes 170`; job `timeout-minutes` 180 in this mode only).
- **Lost PR-only output.** Mirror mode gives up coverage comments and PR-only coverage measurement on promotion PRs. None of that blocks a merge.
- **Do not skip the required check instead.** A skipped required check can read as passed on the PR while the push run is red — mirror mode deliberately keeps a real, non-skipped capstone.
- **Cost of dropping `light`.** Removing the merged-PR → `light` arm raises the cost of every merged-PR `dev` push. That is the price of precondition 1 and is already the template's stated requirement.

## Rejected alternatives

- **Rely on `Check SHA Cache`** — it keys on the merge-commit SHA for PRs, and even when it hits it is not the PR's verdict.
- **Skip the promotion PR's required check** — a skipped required check can pass while the push run is red.
- **Inline the poll loop in the workflow YAML** — the required check's logic must be unit-tested; `bkit runs mirror` already exists and is tested.
- **Enable the template verbatim** — its `head_ref == 'dev'` predicate does not match bkit's `release/*` promotion flow.

## Acceptance criteria

- [ ] A `release/*` → `main` PR whose head has a green `dev` push run skips its lanes, and its `bkit-tests-check` mirrors that push run's capstone verdict.
- [ ] A PR whose head has no green push run, or a red / cancelled push run, fails the capstone red — never silently passes.
- [ ] `mirror_push_run` is present and `false` in the plan for every other event / head / base pair; feature → `dev` PRs still resolve `run_level=full`.
- [ ] A merged-PR `dev` push resolves `run_level=full` (precondition 1).
- [ ] `docs/deployments.md` § One CI run per dev commit reflects the `release/*` predicate and bkit's own adoption.
- [ ] `bkit check` and actionlint clean; the template scaffold and the live workflow stay in step.

## References

- `docs/deployments.md` § One CI run per dev commit
- decision `release-pr-mirrors-dev-push-run` in `docs/decisions.jsonl` — adopted from `gether-life/app-gether-life`
- `.bkit/templates/.github/workflows/bkit-ci.yml:799` (`Decide Release Mirror`), `:1014` (`Mirror Push Run`)
- `.bkit/core/engine/commands/workflow/runs.ts` — `bkit runs mirror`
- PR #527 (run `38150872681`), `dev` push run `38150686541`
- #485 — the CI-template update that added mirror mode to the scaffold

**Status:** this issue is set to **In review** on the project board. Commit `f6c7f0dd` is local only — not pushed.

**Outcome:** release-PR mirror mode is now adopted in bkit's own `.github/workflows/bkit-ci.yml`.

- Planner `Decide Release Mirror` (`bkit-tests-scope`): same-repo PR, head `dev` or `release/*`, base == default branch → `mirror_push_run=true`; `Generate Test Plan` forces `run_level=none` and emits `mirror_push_run` (required, `false` otherwise).
- Capstone `Mirror Push Run` (`bkit-tests-check`): `bkit runs mirror --head=$PR_HEAD_SHA --branch=dev --max-minutes=170`; the job now checks out + installs, and raises its timeout to 180 only in mirror mode.
- `Decide Run Level`: dropped the merged-PR → `light` arm, so every `dev` push resolves `full` (mirror precondition 1); removed the now-unused `pull-requests: read` scope.
- Template scaffold (`.bkit/templates/.github/workflows/bkit-ci.yml`) and `docs/deployments.md` § One CI run per dev commit: predicate widened to `dev` / `release/*`, bkit's own adoption recorded.

**Verification:** `actionlint` clean on the live workflow; the predicate + plan JSON simulated across dev / release/* / feature / fork / push inputs; full `vitest run` green for this change; `bkit check` clean for the touched files; dogfood template-parity test and snapshot updated.

**Unrelated, pre-existing:** commit `2db988a8` left the raw `{{BKIT_MANAGED_MARKER}}` token in `.agents/rules.md`, so `bkit check` (`bkit-managed-stale`) plus the `rules-sync` / `wording` tests are red at HEAD. That is not from this change — re-running `bkit install` re-renders `.agents/rules.md`.

## Verification findings — all acceptance criteria met

Independent verification pass over commit `f6c7f0dd` (local `dev` HEAD, **not pushed** per instructions). Findings only — no code changed by this pass.

### Acceptance criteria

<!-- prettier-ignore -->
| # | Criterion | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `release/*` → `main` PR with a green `dev` push run skips lanes; capstone mirrors the push verdict | ✅ | `Decide Release Mirror` (`.github/workflows/bkit-ci.yml:165`) sets `mirror_push_run=true`; `Generate Test Plan` forces `run_level=none` (`:218`); capstone `Mirror Push Run` (`:788`) runs `bkit runs mirror --head="$PR_HEAD_SHA" --branch=dev --max-minutes=170` before the assert, neither step `continue-on-error` |
| 2 | No green push run / red / cancelled → capstone fails red, never silently passes | ✅ | `bkit runs mirror` resolves the push run by SHA and exits non-zero on red/cancelled/absent/timeout/API-error; the required check stays a real (non-skipped) job; docs table in `docs/deployments.md` § One CI run per dev commit matches the implementation's messages |
| 3 | `mirror_push_run` present and `false` for every other event/head/base; feature → `dev` PRs stay `full` | ✅ | Field emitted via `--argjson` (`:229`) and enforced in the required-field loop (`:260`). Predicate simulation: `dev`→main ✓true, `release/x`→main ✓true, `release/x`→dev ✓false, feature→main ✓false, feature→dev ✓false, fork ✓false, push ✓false, empty default branch ✓false |
| 4 | Merged-PR `dev` push resolves `run_level=full` (precondition 1) | ✅ | `Decide Run Level` (`:147`): `dev` push → `full` unconditionally; the merged-PR → `light` arm and its `commits/{sha}/pulls` lookup are gone; `pull-requests: read` scope dropped from `permissions:` (`:14-18`) |
| 5 | `docs/deployments.md` reflects the `release/*` predicate and bkit's adoption | ✅ | § One CI run per dev commit: predicate documents `dev` + `release/*`, explicit "bkit's own CI adopts this" bullet; run-level table notes mirror mode. Source `.bkit/shared/docs/deployments.md` edited, mirror regenerated with the real renderer |
| 6 | `bkit check` and actionlint clean; template scaffold and live workflow in step | ✅ | See below |

### Quality checks (all green)

- `actionlint .github/workflows/bkit-ci.yml` — clean, exit 0
- `pnpm bkit check` — exit 0, `0 write(s) would occur` (9 pre-existing advisories, none from this change)
- Dogfood live-vs-template parity: 51/51 passed; template content snapshot: 72/72 passed
- Workflow command suite (incl. `runs.test.ts` for `bkit runs mirror`): 942/942 passed
- `pnpm typecheck` exit 0; `pnpm bkit:check:dist` fresh; prettier clean on all 6 touched files
- Template scaffold (`.bkit/templates/.github/workflows/bkit-ci.yml:799,:1017`) documents the same `dev`|`release/*` predicate — live and scaffold in step

### Deferred / scope notes

- Nothing in issue scope deferred. No new `docs/decisions.jsonl` row written (issue references the existing `release-pr-mirrors-dev-push-run` decision; a new row was never in scope).
- Pre-existing, unrelated: commit `2db988a8` had left a raw `{{BKIT_MANAGED_MARKER}}` in rendered `.agents/rules.md`. Running `bkit check` during this verification self-healed it in the working tree (uncommitted, not part of `f6c7f0dd`). Unrelated uncommitted `providers.md` edits also remain in the tree.
- Caveat by design: the end-to-end mirror (a real promotion PR copying a real `dev` push verdict) is observable only on the first promotion after this lands and is pushed — the issue's own "First promotion after enabling" note. Static verification, predicate simulation, and the unit-tested `bkit runs mirror` cover everything verifiable pre-merge.

**Verdict: all done — closing.**

Verified complete — see findings above. Implementation in local commit f6c7f0dd (dev, unpushed).
