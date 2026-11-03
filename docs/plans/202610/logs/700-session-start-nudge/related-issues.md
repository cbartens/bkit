## #684 — Where agent instructions live (closed)

### Problem

The instructions bkit agents follow live in many places, and nothing records which agent needs which instruction:

<!-- prettier-ignore -->
| Where | What goes wrong |
| --- | --- |
| `.agents/rules.md` | Every subagent reads all of it from its first turn: about 26KB, 6.6k tokens. Roughly a third of the rules (tracker, push, PR, merge) are for the orchestrator only, so subagents carry them for nothing. |
| Typed into prompts by hand | `**No commits:**`, `**Destructive git PROHIBITED:**`, `**Code reads:**` and others. Only five rules reach agents word for word, each through a `.bkit/wording.md` clause. The rest are rewordings that nothing checks against the original, so they drift. |
| Hooks and permissions | The same rule is enforced a second time, and the copies disagree. R56 forbids `git reset --hard`, but the shipped permissions only ask, so one approval runs it. |
| Plan and audit templates | About a quarter of `.bkit/core/docs/templates/bkit-plan.md` (35KB) is rules: the CRITICAL blocks, the gate "tick all boxes, do not stop for permission" lines, the Dashboard Ban. Every plan copies them, so 10 to 16 percent of each plan is text no reader of that plan needs (the #651 plan: 13KB of 127KB; #650 sub-plan 1: 17KB of 106KB). Every agent that reads a plan carries that text on every turn. An agent that never opens that part of the plan never sees those rules at all. |

The template problem is why this part of #663 comes before the per-task slices in #668. A slice cut from a plan full of rules carries the rules into every brief.

### Outcome

Each instruction has one home and one exact wording, and reaches only the agents that act on it.

- **One store.** `.bkit/wording.md` becomes `.bkit/instructions.md`: every instruction bkit gives an agent (rules, shared clauses, hook text, permissions, authoring rules, template instructions and every remaining local line), each with the list of files that carry it and how. It stays repo-only tooling; consumers never receive it.
- **Text stays in the files agents already load.** The wording is hard-coded in the workflow and prompt files, as today. A test checks both ways: nothing missing from the store, and nothing in the store without a live, matching carrier.
- **Subagents stop reading bkit's rules at run time.** They read only `## Project Rules` of `.agents/rules.md`. Each bkit rule an agent acts on is hard-coded into that agent's prompt. `.agents/rules.md` itself stays whole for agents used directly without bkit.
- **Templates hold layout only.** Plan and audit templates keep headings, table headers, `PENDING` placeholders and the gate checkbox lists. Each rule moves to the prompt of the agent that acts on it, through the store. A rule that already sits in `rules.md` is deleted from the template and hard-coded into the prompts that need it.
- **Plain grammar.** Instruction text is written in normal English, so agents editing it have no clipped style to drift away from.
- **The doctrine flips.** `.bkit/core/.bkit/prompts.md` § Prompt Authoring Rules, "Template owns its rules", becomes "template is layout, prompt owns rules", with a `docs/decisions.jsonl` row giving the why.

<!-- prettier-ignore -->
| Order | Issue | Part |
| --- | --- | --- |
| 1 | #666 — Rename wording.md to instructions.md: one store for every instruction — https://github.com/cbartens/bkit/issues/666 | The store, the both-ways test, subagents reading only Project Rules |
| 2 | #667 — Plan and audit templates hold shape only; rules move to prompts — https://github.com/cbartens/bkit/issues/667 | Empty the templates into the store and the prompts |
| alongside | #669 — Audit adjust singular vs plural in prompts and docs — https://github.com/cbartens/bkit/issues/669 | The plain-grammar rule. Existing text is reworded once, when #666 settles the canonical texts |

#667 is blocked by #666: the rules removed from the templates need the store as their home, not eight hand-copied prompts.

### Success criteria

- Every instruction bkit gives an agent has one exact wording in `.bkit/instructions.md` and a list of the files that carry it. The test fails when a listed file lacks it, an unlisted file carries it, or a copy has drifted.
- No subagent reads bkit's own rules from `.agents/rules.md` at run time.
- The plan and audit templates carry no rule text, and a new plan copies none of the removed blocks.
- The "tick all boxes, do not stop for permission" instruction appears once, in `bkit-build-plan-execute`, not four times in every plan.
- Canonical instruction text follows `.bkit/core/.bkit/prompts.md` § Notation, Grammar.

### Constraints and non-goals

- Nothing is written into agent files at `bkit install` time. This replaces the install-time rendering in the WS-1 workstream proposed on #663.
- Consumer `Project Rules` are never copied into shipped prompts. Subagents keep reading them from `.agents/rules.md`.
- Works on every host bkit supports. The instructions are plain text in files the hosts already load.
- Not a big token saving on its own: `rules.md` was about 1.3% of #650's tokens. The direct savings are about 6.6k tokens per subagent and 10 to 16 percent off every plan. The main gains are no drift and clean input for #668's slices.

### Decisions already made

Settled with the owner on 2026-10-23:

- The store is named `instructions.md` and is the central record that workflows and prompts are checked against.
- The text is hard-coded in workflows and prompts and never written at install time.
- The store maps which orchestrator workflows and which subagent prompts get which instruction.
- Subagents read only `## Project Rules` of `.agents/rules.md`.
- `.agents/rules.md` stays whole, as the complete rule set an agent reads when used directly without bkit (2026-10-24). Rules are copied from it into prompts, never moved out of it.
- Rules that today live only in the plan template and apply beyond bkit's workflow steps (such as the Dashboard Ban) are added to `.agents/rules.md` when #667 takes them out of the template (2026-10-24).
- The store covers every instruction surface, not only rules; #666 grows to match the draft.
- #669 belongs here: instruction text is written in plain grammar (`docs/decisions.jsonl` key `669-plain-grammar-in-agent-text`).

### Open questions

None at this level. The store's open questions (which copy is the master per section, admission bar, how agents look up one entry) are on #666.

### References

- #663 — Workflow prompt process optimisation — https://github.com/cbartens/bkit/issues/663 (comments "Quick win 5 in detail, and what the history data says about WS-1" and "I'd split #663 into eight workstreams")
- #668 — Build in task slices: symbol refs per task, 120k cap per agent — https://github.com/cbartens/bkit/issues/668 (comes after this)
- `.bkit/instructions.md` § Format
- `.bkit/wording.md`, `.bkit/core/engine/tools/wording.test.ts`
- `.bkit/core/docs/templates/bkit-plan.md`, `.bkit/core/docs/templates/bkit-audit-*.md`
- `.bkit/core/.bkit/prompts.md` § Prompt Authoring Rules, § Notation
- `.agents/rules.md` (`bkit Rules`; `Project Rules`)

## Where agent instructions live: done

All three sub-issues are built and committed on `feat/684-instructions-store`. The branch was made from local `dev` at `ce802b48` and is **not yet pushed**. Full suite: 7077 of 7077 pass. `bkit check`, the store check, typecheck, lint, lint:prose and prettier are all clean.

### Commits

<!-- prettier-ignore -->
| Commit | Issue | What it does |
| --- | --- | --- |
| `65beec5e` | #666, #669 | `.bkit/wording.md` becomes `.bkit/instructions.md`, the one store for every instruction. Each of the 49 subagent prompts carries, word for word, the rules it acts on in a `**bkit Rules:**` block. Subagents read `.agents/rules.md` only below `bkit:end`. #669: the debug trigger commit no longer runs `git add -A`, and failure paths remove only files the run created by mistake. |
| `bf0ca008` | #666 | Closes all 226 places where a prompt or workflow contradicted a rule, per the owner decisions in https://github.com/cbartens/bkit/issues/666#issuecomment-6377861485 |
| `4a47525b` | #666 | The shell-edit warning hook lists the new R24 log-append exception. |
| `d9e77cfa` | #667 | Plan and audit templates hold shape only, and the prompts own the rules. Nine rules join `rules.md`. |
| `69311d20` | all | CHANGELOG `Unreleased` entries. |

### How it works now

1. **One store.** `.bkit/instructions.md` holds every rule, shared clause, hook message and permission, and names every file that carries each one (`- carry:` lines). `pnpm instructions:sync` rewrites stale copies. `.bkit/core/engine/tools/instructions.ts` and its tests fail when a copy differs from the store, or when a carrier contradicts a rule without a recorded `kept:` reason.
2. **Prompts carry their rules.** Each prompt gets:
   - the rules the store lists for it;
   - R56/R57 when it has Bash, and R23/R24 when it has Edit or Write;
   - R93 always.

   That is 7 to 22 rules per prompt. Subagents no longer read the whole bkit block of `rules.md`; they still read everything below `bkit:end`, because `## Project Settings` holds the MCP identifiers.

3. **`rules.md` stays whole** for agents working without bkit. It gained nine rules that used to live only in the plan template: New file locations, UI design, Dependencies, Tests discriminate, Test-only files, Explicit logging, CLIs over dashboards, Server-side validation, Multi-store writes.
4. **Templates are shape only.** The plan template keeps headings, tables, checkbox labels, owner callouts and the engine-read lines: `**Ledger rows:**`, Gate 2 `Test first`, and the example tasks. Each rule moved to the prompt that acts on it. The 35 audit templates dropped their shared boilerplate, which `bkit-audit-generate` now carries once. The doctrine in `.bkit/prompts.md` reads "Template is shape, prompt owns rules" (decision `667-template-is-shape-prompt-owns-rules`), and `template-shape.test.ts` guards it.
5. **Gates.** `bkit-build-plan-execute` ticks every applicable Pre-Flight and Gate 1-4 box as it passes, and never stops to ask. That line exists only in its prompt.

### Sizes and load (rough)

- **Plan template:** 35.5 KB to 15.3 KB. Every new plan is about 20 KB smaller, and about eight agents read each plan in a plan-and-build cycle.
- **Audit templates:** 781 KB to 666 KB across the 35. `bkit-audit-generate` grew by 3.3 KB, about what each audit run saves on its template.
- **Prompts:** grew by about 51 KB in total across the 12 plan, build and audit prompts that took over template rules (largest: plan-generate 7.6 to 18.9 KB, execute 8.8 to 17.1 KB). The rules blocks from #666 added 1 to 4.9 KB per prompt.

### Owner decisions

- #666 departures and the 226 contradictions: https://github.com/cbartens/bkit/issues/666#issuecomment-6377861485
- #667 assumptions: https://github.com/cbartens/bkit/issues/667#issuecomment-6377861884
- Six rules were sharpened:
  - R24: log append to your own output file is allowed.
  - R43: standing audit parents excepted.
  - R61: docs-only landings may push straight to `dev`.
  - R62: an explicit empty merge body is fine.
  - R94: a workflow's named decision points excepted.
  - R98: `feat/{FID}` branch when no tracker is wired.
- `bkit-utility-update-tracker` never comments on issues.

### Where agents departed from the plans (accepted or verified)

- **New wording for the code-reads rule.** It now names `grep -l` before `grep -n`, reads whole files only when short or being rewritten, and allows a re-read after context was summarised.
- **The `**Tools:**` header is renamed `**Verify tools:**`** in every prompt.
- **New checker features:** `if-search` mode, `repo-agent` modes and `syncCarry`.
- **The pre-release test install stays outside the repo,** against R26. Inside the repo it would pick up the repo's pnpm workspace and `node_modules` and hide packaging bugs. Recorded as a kept reason.
- **Milestones are still read with `gh api`,** as the fallback, because the GitHub MCP has no milestone read.
- **#667:**
  - Only the `### Spec` wrapper heading was removed; its subsections stay, and nothing referenced it.
  - 18 audit clauses were deleted rather than kept as forbidden. The store fails unused clauses, and `template-shape.test.ts` catches the text returning.
  - The data-change (CDC) checklist was dropped from the plan; `docs/data-schema.md` owns it.
  - `bkit-build-plan-gaps-remediate` also carries the Reuse Inventory and testing-strategy rules.
  - The Gate 1 agent callouts were replaced by one sentence in execute's gate rule.
  - bkit's own `Project Instructions` in `docs/templates/bkit-audit-prompts.md:215` now point at the gate rules in the two prompts.
- **The `Test first` limits** in `.bkit/core/workflows/bkit-build.md:143` and `.bkit/core/.bkit/trackers.md:109` now defer to the caps `bkit tests plan-check` enforces (10 tests, 3 test files per task, from `MAX_TESTS_PER_TASK` / `MAX_TEST_FILES_PER_TASK` in `.bkit/core/engine/commands/workflow/tests.ts`).

### Still open

- **The slop gate (`slop:delta`) fails** with "added 6 … net findings 5". It compares against `694f2c86`, and every finding is in files from earlier commits on `dev` that this branch does not touch (e.g. `commands/workflow/context.ts`, `ledgers.ts`, `run-facts.ts`, `tests.ts`). The pre-push hook will refuse until those are fixed or the base moves.
- **Not done yet:** push and land on `dev`, and a test install on a scratch project.
- **The shipped permissions** still only ask before destructive git commands (R56/R58). This is a recorded exception until a separate guard hook exists.

**How the prompt growth nets out against #668 (2026-10-24).**

Overall, about even on tokens. This issue's gain is that each rule reaches the agents that act on it, in one checked wording. Nobody has measured whether that improves what agents do; the dogfood run is the first chance.

- **Prompts grew about 51KB in total**, but each agent carries only its own prompt's growth. Execute grew 8.8 → 17.1KB (about 2k tokens) and plan-generate 7.6 → 18.9KB (about 2.8k).
- **Each plan is about 20KB smaller.** That helps every agent that still reads the whole plan: the plan reviewers, the scope check, plan-update and plan-current. For them it's a clear win, carried on every turn.
- **It is not a saving on top of #668.** Once #668 lands, execute, verify and gaps-remediate read a 3–6KB brief, not the plan. #668's model already assumed the briefs carry no rule blocks. Execute then pays about 2k extra per turn and gets nothing back, roughly 2% of its cost.
- **Subagents no longer read bkit's rules from `.agents/rules.md`**, which is about 6.6k tokens per subagent. That probably more than pays for the bigger prompts. It isn't clear whether #668's model already counted it.
- **Audit:** `bkit-audit-generate` grew by about what its template lost (3.3KB). Even.
- **20KB vs measured:** the body above measured 13KB of rules on the #651 plan and 17KB on #650 sub-plan 1. 20KB is a little above both, and I haven't checked where the extra comes from.

Detail and a rerun of the cap replay: https://github.com/cbartens/bkit/issues/668 (correction comment of 2026-10-24).

## Review of `feat/684-instructions-store` (HEAD `69311d20`) before merge

Read the branch in the worktree against local `dev` (`004dd4c1`). Questions asked: is the plan template still sound for tasks and task groups, do plan-generate, build-plan-execute and build-plan-verify consume it consistently, and is the changed step logic right. Short answer: the design holds and the engine-facing lines survived. Two gates in the done comment were misread. Four things are worth fixing before or just after merge, none of them blockers.

### Gates: both red marks were environmental

- **slop:delta.** The done comment records a FAIL with base `694f2c86`. That is `origin/dev`, which is 27 commits behind local `dev`, so the delta compared this branch against code it never touched. Re-run with the real base and it is clean:
  ```
  SLOP_BASE_REF=dev pnpm slop:delta
  [bkit-ci] base 004dd4c1 (dev) vs working tree
  [bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
  ```
  Nothing to fix in the branch. A `git fetch` or a push of `dev` makes the default base right again.
- **Tests.** Running the touched directories together with slop:delta gave 5 timeouts in `.bkit/core/engine/commands/workflow/runs.test.ts` (5000ms each). The branch changes no file under `commands/workflow/`. Alone, `runs.test.ts` and `context.test.ts` pass 225/225 in 26.6s. Load flake, not a regression.
- `git merge-tree --write-tree dev HEAD` produces a clean tree: no conflicts with the two docs-only commits that landed on `dev` after the branch point.

### What is sound

- **Every line the engine parses is still in the template and now pinned by a test.** `**Ledger rows:**` (`LEDGER_ROWS_LINE`, `commands/workflow/ledgers.ts:1169`), `**Task N:**` and `**Test first:**` (`TASK_LINE`, `GATE_TEST_FIRST_LINE`, `tests.ts`), the Gate 2 `- [ ] **Test first:**` item and all section headings are asserted in the new `.bkit/core/engine/audits/templates/template-shape.test.ts`. Template went from 35.5KB to 15.3KB.
- **Task ticking is now consistent, and it was not before.** The old template said "tick `[x]` as you go" in Step Isolation while the prompts said verify ticks and execute never does. The new execute Contract bullet **Plan gates** ("Never tick a task box or a human-confirmation box") matches the standing doctrine "Plan task ticking owned by verify" in `.bkit/core/.bkit/prompts.md`, matches verify step 9 (ticks `[x]` when `Done when` holds), and matches the handover design in #668 — Build in task slices: symbol refs per task, 160k cap per agent — https://github.com/cbartens/bkit/issues/668 ("Implemented: execute writes `DONE — TASK N`. Verified: verify ticks `[x]`. Execute never ticks."). Resume logic (execute step 4 starts at the first `[ ]` task, skipping those with a `DONE` log line) still works because both signals have one writer each. This is a fix, not a regression.
- **Gate boxes: one writer, one place.** "Tick every applicable gate box, never stop to ask for permission" now sits once in `bkit-build-plan-execute.md` instead of four times per plan, and `template-shape.test.ts` asserts no other plan prompt carries it. Human-confirmation boxes left `[ ]` fail the gate item that checks them, which is the right failure shape.
- **Adopted copy matches shipped.** `docs/templates/bkit-plan.md` and `.bkit/core/docs/templates/bkit-plan.md` differ only in the managed-marker line.
- **Audit side.** 35 templates lost the shared Rules bullets, Checkpoint, Credentials, Permissions, Step 1 and Severity prose; `bkit-audit-generate.md` carries them once. `bkit-debug.md:717` no longer runs `git add -A` before the empty commit. Both decision rows (`666-instructions-store-masters`, `667-template-is-shape-prompt-owns-rules`) are in `docs/decisions.jsonl`.

### Findings and recommendations

**1. The planner no longer learns the test caps until Step 9.** `bkit-plan-generate.md` **Test first** now says "stay within the caps `bkit tests plan-check` enforces; more → split the task", without the numbers. `bkit-build.md:143` ("Fix now" task text) and `.bkit/core/.bkit/trackers.md:109` (change-shape Tasks line, read by whoever writes an issue) say the same. The caps are `MAX_TESTS_PER_TASK = 10` and `MAX_TEST_FILES_PER_TASK = 3` (`commands/workflow/tests.ts:238-239`). The brief in `bkit-plan.md` Step 3 does not pass them either. So a planner who writes 12 tests on one task first hears about it at Step 9 (`bkit-plan.md:455-457`), after two review rounds and two update rounds, and the answer is SPLIT and rework. Dropping the counting rule was decided on #667 — Plan and audit templates hold shape only; rules move to prompts — https://github.com/cbartens/bkit/issues/667 ("no agent needs the counting rule"), which is right for counting. But sizing needs the number.
Recommendation, pick one: (a) name the two numbers in the three places, guarded by a parity test against the two constants so they cannot drift; or (b) make the Step 3 sub-step 4 `plan-check` run, which already computes the SPLIT verdict on the draft (`tests.ts:1119`, `:1167`), feed its over-cap task list into the Step 5 plan-update brief, so the first update round fixes sizing. (a) is a 3-line change; (b) keeps the prompts number-free but needs a brief change. Either one removes a full plan round in the worst case. #668 will reshape `Test first` into sub-bullets, so whichever lands here should be written against the constants, not the syntax.

**2. "Read `.agents/rules.md` below `<!-- bkit:end -->`" does not save what #666 promised.** 49 prompts now carry that line. The intent in #666 — Rename wording.md to instructions.md: one store for every instruction — https://github.com/cbartens/bkit/issues/666 was about 6.6k tokens saved per subagent. In the worktree `.agents/rules.md` is 28,493 bytes and the marker is on line 172. A Read of the file loads all of it; no prompt says how to find the marker first (a `grep -n 'bkit:end'` followed by an offset read), and no orchestrator brief passes the Project Rules in. So today each subagent still loads the whole file and is merely told to ignore most of it. The correctness goal (rules hard-coded in prompts) is met; the token goal is not yet.
Recommendation: either give the `**Rules:**` line a concrete two-step read ("find the line of `<!-- bkit:end -->`, read from there"), or add a tiny `bkit` command that prints only the Project Rules and have the line call that. The second is host-independent and testable; the first is zero engine work. Worth a small follow-up issue rather than a hold on this merge.

**3. The Template Instructions table is documentation, not a check.** `.bkit/instructions.md` § Template Instructions (lines 5249-5288) maps 23 Contract labels to their carrier prompts, and the doctrine says each label is "worded the same in every prompt". Only four of those labels reach the 5-carrier bar and became drift-checked clauses (`plan-out-of-scope`, `plan-reuse-inventory`, `plan-ledger-rows`, `plan-runbook-tasks`). The other 19 are not checked at all; `instructions-sources.test.ts:329` asserts only that the heading exists. Today the copies are identical where they should be (Test first ×4, Testing strategy ×4, Verification Plan ×4, Supersession Inventory ×4, Issue tasks ×4, Checkboxes ×3, Test-order exception ×3 and so on each have exactly one distinct wording; Pre-Flight and Example tools differ only between the audit and plan families, on purpose). That is the same unguarded state `wording.md` had before #684, just for a new set of sentences. The first edit to one of the four `Test first` copies will not fail any test.
Recommendation: one test that, for each row of the table, the labelled bullet is byte-identical across its listed carriers and that the carrier list equals the set of prompts that actually contain the label. About 30 lines, no new store format. Alternatively lower the clause bar to 2+ carriers for Contract bullets only.

**4. Two bkit rules dropped out of the executor's view.** `bkit-build-plan-execute.md`'s `**bkit Rules:**` block omits "Local pre-push" and "Check gotchas first". Before this branch, the template named the full gate suite in the Gate 4 prose and the knowledge/decisions fold idiom in Pre-Flight; both are gone from the template, as intended, but neither was re-homed into execute. Execute step 9 still runs only `pnpm bkit:gate:static`, and its Pre-Flight item is now just "relevant rows read". The build orchestrator runs the wider suite later, so this is a gap in what the executor knows, not in what the workflow enforces.
Recommendation: add both rules to the execute block (they are already verbatim in `rules.md`), and list execute as a carrier in the store.

**5. Small.** Audit reports now render three gate boxes as bare labels (`- [ ] **No placeholders**`, `- [ ] **Permissions**`, `- [ ] **Process Improvements**`) because their prose moved to the prompt; a reader of the report, not the prompt, no longer sees what the box means. A four-word tail on each in the template would keep the report self-explaining. `#### [new]` in the plan template is lowercase while every other heading is Title Case; pre-existing, and #668 renames these to CREATE / UPDATE / DELETE anyway, so leave it.

### Not done on this branch, as the done comment says

No push, no scratch-project install, and the shipped permissions still `ask` rather than `deny` for destructive git (recorded exception). The install path matters here because 462 files changed and 35 audit templates plus the plan template are adopted copies on consumers; `bkit upgrade` on a scratch project with a locally edited `docs/templates/bkit-plan.md` is the one check I would run before `/bkit-ship`.

## Review findings fixed: `aea3c813`

This answers https://github.com/cbartens/bkit/issues/684#issuecomment-6378971492. Still on `feat/684-instructions-store`, not pushed.

**Correction to the done comment.** The slop gate does not fail. I measured it against `origin/dev`, which is 27 commits behind local `dev`. Against local `dev`, `SLOP_BASE_REF=dev pnpm slop:delta` gives `added 0, resolved 0, worsened 0; net findings 0`. Nothing blocks the push.

**Gates on `aea3c813`:**

- Full suite `Tests 7082 passed (7082)`.
- `bkit check`: `0 write(s) would occur`.
- Store check: no findings.
- Typecheck, lint and lint:prose: clean.
- Prettier: clean.

### Per finding

1. **Test caps are named again, and a test guards them.** The new wording, word for word in the `Test first` bullet of plan-generate, plan-update and scope-check-1/2: "At most 10 `Test first` tests across at most 3 test files per task (the caps `bkit tests plan-check` enforces); more → split the task." The same caps are now stated in `.bkit/core/workflows/bkit-build.md` (the Fix now task text) and `.bkit/core/.bkit/trackers.md:109`. A new test in `.bkit/core/engine/commands/workflow/tests.test.ts` fails if any of these states numbers other than `MAX_TESTS_PER_TASK` / `MAX_TEST_FILES_PER_TASK`.
2. **Subagents now read only below `bkit:end`.**
   - The 44 prompts that can search get: "Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`."
   - The 5 summary prompts have no Grep or Bash, so they keep the plain line, through a new store mode, `if-no-search`.
   - This delivers the token saving #666 aimed for.
3. **The Template Instructions are checked.**
   - The audit labels in `.bkit/instructions.md` moved into their own table. `Pre-Flight` and `Example tools` get one row per family, plan and audit.
   - Two new tests in `instructions.test.ts`. Each row's bullet must be byte-identical across its listed prompts. Each label's rows together must list exactly the prompts that carry the label.
   - The second test caught `bkit-audit-generate` missing from two rows.
4. **Execute carries `Check gotchas first`.** It does **not** carry `Local pre-push`. The owner decided that rule applies before a push, and subagents never push (#666 decisions, group 3). The kept reason on execute now says this explicitly.
5. **The audit gate boxes explain themselves.** In all 35 templates and the adopted copies:
   - "**No placeholders:** no `PENDING` left"
   - "**Permissions:** blocked calls recorded"
   - "**Process Improvements:** `Universal` and `Project` filled"

   A new test fails on any bare `- [ ] **Label**` box. `#### [new]` is left alone, as recommended.

### Scratch upgrade test

This used a consumer on the pre-branch build (packed from `ce802b48`), upgraded to this branch's tarball.

- **An edit below `bkit:end`** (a `### Permissions` section in `docs/templates/bkit-audit-logs.md`) **survived.**
- **An edit inside the managed block** of `docs/templates/bkit-plan.md` was **replaced, without a warning.**
  - `bkit check` before the upgrade did report it: `DRIFT DETECTED`, naming the file.
  - `bkit upgrade` only logged `upgrade (merge): docs/templates/bkit-plan.md`.
  - That is existing behaviour, not caused by this branch, but this branch rewrites the managed blocks of 36 templates, so consumers with local edits there will lose them silently.
- **After the upgrade,** `bkit check` exits 0. The new gate-box tails and both `**Rules:**` line variants are in place.

### Test flakes seen

The fix agent's two full-suite runs each hit one timeout (`gateguard-opencode.test.ts`, then `ci-scripts.test.ts`), each in a file this branch does not touch. Run alone, each file passed. My own full run then passed 7082/7082. `docs/failures.jsonl` already tracks this (`subprocess-integration-tests-time-out-at-5000ms-under-high-load`).

## Re-check of `aea3c813`: all five findings closed, gates green

Answers https://github.com/cbartens/bkit/issues/684#issuecomment-6379238036. Checked in the worktree, tree clean at `aea3c813`.

**Gates, re-run by me:**

- Full suite: `Test Files 188 passed (188)`, `Tests 7082 passed (7082)`, 276s, no timeouts this run.
- `bkit check`: exit 0, `0 write(s) would occur`, tree still clean afterwards.
- `SLOP_BASE_REF=dev pnpm slop:delta`: `added 0, resolved 0, worsened 0; net findings 0`.
- `git merge-tree --write-tree dev HEAD`: clean, no conflicts with `004dd4c1`.

**Per finding:**

1. **Test caps.** The sentence "At most 10 `Test first` tests across at most 3 test files per task (the caps `bkit tests plan-check` enforces); more → split the task." is byte-identical in plan-generate:53, plan-update:48, scope-check-1:42 and scope-check-2:42. `bkit-build.md:143` and `.bkit/core/.bkit/trackers.md:109` state the same numbers. The guard in `tests.test.ts` regex-matches every carrier (the four bullets, build, trackers) and asserts each states exactly `[MAX_TESTS_PER_TASK, MAX_TEST_FILES_PER_TASK]`. Right shape: it fails on a wrong number and on a dropped sentence alike.
2. **Rules read.** 44 prompts carry the `grep -n` variant, 5 carry the plain one. I checked each prompt's front-matter `tools` against its variant: every prompt with Grep or Bash has the search line, every prompt without either has the plain line, no mismatches. `.claude/agents/` mirrors match 44/5. Below the marker, bkit's own `rules.md` has `## Project Rules` → `### Universal Rules`, so "follow its Universal Rules" resolves.
3. **Template Instructions.** Two tables (`### Plan template`, `### Audit templates`) plus `### Shared lines`. The new tests in `instructions.test.ts:976-1030` assert byte-identical bullets per row and that the row set per label equals the prompts that actually carry it. That is the check I asked for; both pass.
4. **Execute rules.** `bkit-build-plan-execute.md:76` carries `Check gotchas first`. The store's kept note on `Local pre-push` (`instructions.md:293`) records the reason: subagents never push, the orchestrator runs the full pre-push gate. Accepted.
5. **Gate boxes.** 35 templates carry `No placeholders: no PENDING left` and `Process Improvements: Universal and Project filled`; 34 carry `Permissions: blocked calls recorded` and `bkit-audit-dependencies` keeps its longer HTTP-403 wording, as the comment says. No bare `- [ ] **Label**` boxes remain; the one match for my bare-box grep is `- [ ] **Step 6 — Answer Engines:**` in `bkit-audit-aio-seo.md:89`, which is a step box, not a gate box, and the new test ignores it on purpose. Adopted `docs/templates/` copies differ from shipped only in the managed-marker line and in bkit's own sections below `bkit:end`; `dogfood-templates.test.ts` passes.

**One residual to carry forward, not from this branch.** The scratch upgrade showed `bkit upgrade` replacing a consumer's edit inside a managed block with only an `upgrade (merge)` log line, while `bkit check` beforehand did flag `DRIFT DETECTED`. This branch rewrites 36 managed template blocks, so the first consumer upgrade after release is where that silent replace would bite. Worth its own issue: `bkit upgrade` should print the drift warning itself, or refuse without `--force`, when it is about to overwrite a block `bkit check` reported as drifted.

Nothing blocks the push.

### Reopened: a line repeated in two files becomes a shared clause

**Decision (owner, 2026-10-25).** A sentence in 2 or more prompts, or 2 or more workflows, gets one master wording in `.bkit/instructions.md` § Clauses. Until now the cut-off was 5 prompts, 3 workflows and 5 audit templates (`SHARED_MIN` in `.bkit/core/engine/tools/instructions.ts`). The new values are prompts 2 and workflows 2. Audit templates stay at 5.

**Why.** Once a sentence appears more than once, it should be owned and checked in one place. Decision `467-wording-md-single-source-for-shared-sentences` set the 5, but it gives no reason for that number.

**What a clause gives that a "Shared lines" entry does not:**

- **Edit once, sync rewrites every copy.** A shared-lines entry only records the copies. When one copy changes, the coverage test fails, but making it pass means editing the store's list. The other copies are never brought back in line.
- **Near copies are caught.** A slightly reworded copy in a new file is flagged only for clauses.
- **Old wordings get rewritten, and files that should carry the text are named.** A carrier that drops the sentence fails the check.

**What changes:**

1. `SHARED_MIN` becomes `{ prompt: 2, workflow: 2, audit: 5 }`.
2. Every § Local Instructions › Shared lines entry carried by 2 or more prompts, or 2 or more workflows, becomes a clause. That is roughly 80 entries, including `Out of Scope` and `Ledger rows line`, which the #663 integration had to demote to shared lines.
3. Some sentences differ on purpose between two files. One example is the "read the diff" line in `bkit-build-challenge-1` and `-2`, where `-2` adds a security clause. Each such pair is marked `distinct-from` or stays local with a `keep:` reason. Neither copy is rewritten.
4. The decision row for 467 is corrected to state the new cut-off and this reason.

Being implemented on `dev` alongside the #663 integration, staged and uncommitted for owner review.

Filed #692 — Prompt header blocks: define Protocol, Contract and Rules — https://github.com/cbartens/bkit/issues/692 as a sub-issue.

A review of the prompt headers found that nothing defines the three blocks each prompt opens with. Contract has no written definition at all. `Code reads` appears twice in all 39 prompts, once shortened in the CAUTION box and once in full in bkit Rules. Agreed today: the blocks become `Protocol` / `Contract` / `Rules`, each with a stated test for what belongs in it. The CAUTION box is dropped, any line that is also a rule in `.agents/rules.md` lives only in Rules, and the store gets a field per clause naming its block so the check can enforce placement. No code changed yet; #692 is set to `next:plan`.

### Authoring-rules pass over `.bkit/instructions.md` (2026-10-25)

I checked the shared sentences in `.bkit/instructions.md` against `.bkit/core/.bkit/authoring.md`. These are the sentences `pnpm instructions:sync` copies into every prompt, workflow, audit template and doc. Most already followed the rules; the ones that didn't are fixed below. Nothing is committed yet.

**Shared sentences reworded** (old wording moved to each clause's `retired` block, then synced into every carrier):

<!-- prettier-ignore -->
| Clause | Change | Rule it broke |
| --- | --- | --- |
| `workflow-plain-english-offer` | "sentences, NOT nouns" → "not nouns" | Capitals are only for `NEVER` / `ALWAYS` / `MUST` / `ONLY` / `PROHIBITED` |
| `doc-drop-fresh-resource` | "DROP both" → "Drop both" | Capitals |
| `workflow-no-issue-warning` | "WARNING:" → "Warning:" | Capitals (no capitals inside a label) |
| `debug-external-signals-pointers` | "narrow WHERE to look" → "where" | Capitals used for emphasis |
| `stop-non-zero`, `audit-not-applicable-stop` | bare `STOP` → `**STOP**` | The stop marker is bold |
| `stop` | Only `**STOP**` is bold now, not the whole sentence | Bold is for structure only, never emphasis |
| `audit-gate-1/2/3-verified` | "Gate 1 - Verified" → "Gate 1 — Verified" | A hyphen is never used as a dash |
| `plan-open-questions` | Removed "so the human can decide from the page alone" | No reason clauses except on hard limits |
| `workflow-superseded-context-only` | `(if present — superseded plan, context only, not a constraint)` | Brackets never hold a second instruction |
| `plan-review-sort-findings`, `update-optional-items`, `multi-lens-merge`, `update-verdict-pass`, `update-verdict-concerns` | `OPTIONAL` / `OUT OF SCOPE` now backticked, like `CRITICAL` | In prompts, words from a fixed set of values get backticks |

**Also fixed**

- Five prompt lines that use `OPTIONAL` but aren't shared clauses (`bkit-design-review-2`, `bkit-plan-scope-check`, `bkit-plan-review-1`, `bkit-design-update`, `bkit-plan-update`), plus their `## Local Instructions` entries.
- The rules box at the top of `.bkit/instructions.md` said "NO filler"; it now says "no filler" like every other doc.
- `authoring.md` broke its own rules: "sigil OPTIONAL", two phrases bolded for emphasis, broken backticks in the managed-version-marker line, and "so …" reason clauses. All fixed. One reason stays, on the `$0` ban, because that is a hard limit, where one short reason is allowed.
- The stop line in the two hand-written `.claude/agents/utility-*.md` agents now matches the new `stop` wording.
- Tests that checked the old exact text: `instructions.test.ts`, `workflow-shape.test.ts`, `trackers.test.ts`, and one line each in `bkit-design.none.txt` / `bkit-plan.none.txt`.

**Sync problem found.** The first sync run rewrote every Gate 3 line in the 35 audit templates (both copies, 70 lines) to say "Gate 2". `syncClauses` in `.bkit/core/engine/tools/instructions.ts` rewrites near-copies before it swaps retired wordings. Mid-run, the old Gate 3 line was a near-copy of the new Gate 2 sentence. I put all 70 back, and a second sync left them alone. Renaming similar-looking clauses together will hit this again until the order is fixed. The fix is not made yet.

**Checks.** `instructions.test.ts`, `instructions-sources.test.ts` and `audits/workflows/**` all pass (941 passed, 1 skipped). Prettier and `pnpm lint:prose` are clean. Six other tests fail because of another session's unfinished edits, not this work: five render baselines (workflow edits), `rules-sync` and `instructions-coverage` (an `.agents/rules.md` edit), and the guardrails mirror check (a `guardrails-shell.js` edit).

**Not done**

- The installed copies (`.bkit/authoring.md`, the rendered agents and commands) haven't been regenerated. `bkit upgrade` would also pull in the other session's unfinished edits, so it waits until those are committed.
- The GateGuard hook messages still use the old capitals style ("do NOT", "THIS file", "BEFORE editing"). They're built in the JS hook code and copied to all five hosts, so changing them is its own piece of work.

### Follow-up: hook messages, `rules.md`, `CLAUDE.md` and ASCII operators (2026-10-25)

This extends the authoring-rules pass in the comment above. Still nothing committed.

**Hook messages.** GateGuard and ReadGuard messages are prompts the agent reads, so they now follow `authoring.md` as well:

- Capitals only on hard limits: `do NOT` → `do not`, `BEFORE` → `before`, `THIS file` → `this file`, `FIXING` → `fixing`, `IS the record` → `is the record`, and so on.
- `—` replaces the spaced hyphen ("this session — confirm the following").
- Brackets hold no instructions any more: "(search code / read source, do NOT assume)" became ": search code / read source, do not assume".
- The two reason sentences are gone: "Self-review is weak; …" and "Bolt-on drift starts here; …" ("Evolve existing code first." stays).

Changed together so all hosts stay identical:

- `.bkit/core/hooks/gateguard-engine.js` and `readguard-engine.js`
- the copies under `.claude/hooks/`, `.codex/hooks/`, `.cursor/hooks/`, `.agents/plugins/bkit/hooks/` and `.opencode/plugin/`
- the repo-only `bkitDocAuthoringAdvisory`
- `.bkit/instructions.md` § Hook Text
- four hook tests that used the dropped sentences as markers

The guardrails messages passed the capitals and dash checks and are unchanged.

**`.agents/rules.md`** (both copies, then synced into every prompt's Rules block):

- `STOP ONLY for explicit HARD STOPs` → `stop ONLY at an explicit **STOP**`
- `Title MAX 70` → `at most 70`
- `ANY` / `ONE` / `SKIP` / `ALL` / `IN FULL` / `NOT` / `BEFORE` / `bash-ONLY` → lowercase
- bare `STOP` → `**STOP**`
- `≠` → `!=`
- **New files:** now "Put each new file where `docs/architecture.md` places its kind; when it doesn't place that kind, add it there in the same change and say why." (owner's wording)

**`CLAUDE.md`** and `.bkit/shared/CLAUDE.md`: `POINTERS` → `pointers`. `AGENTS.md` needed no changes.

**ASCII operators.** 487 lines across the audit templates, the `.bkit` and `docs` docs, and their installed copies: `≠ ≥ ≤ ⇒ ≈` → `!= >= <= => ~`, and `×` → `x`. An en dash between two values became `-`; a spaced en dash used as a dash became `—`. Text inside backticks and code blocks is unchanged. The engine parsers accept `—`, `–` and `-` alike.

**Checks.** Tests across `engine/tools`, `audits`, `render`, `commands` and `install`: 6431 passed, 5 failed, 1 skipped. The 5 failures are render baselines broken by another session's unfinished workflow edits; none of their differences come from this work. Prettier and `pnpm lint:prose` are clean.

**Not done.** The rendered agent and command files and the installed `.bkit/authoring.md` still need `bkit upgrade`. It waits until the other session's workflow edits are committed.
