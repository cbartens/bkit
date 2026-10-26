# 703 — Standardise Question Option Labels Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

bkit asks the owner questions in five workflows and labels the answer options three different ways — `Options: A — … · B — …` (the plan template), `Options: Accept / Fix now` (the build Decision Pause, rendered by `bkit decisions compose`), `Options: Try again / Stop` (debug's Loop Question), `Options: Confirm / Reject` (ship's Confirm Assumed Items), and `Options: A / B` (the canonical description in `.bkit/workflows.md`) — so the same Q&A reads differently from run to run. This plan makes every owner-facing question render `**Q{n} — {title}:**` with lettered answer options `A)`, `B)`, `C)` — including options that already carry a name (`Options: A) Accept / B) Fix now`) — and makes the plan / design open questions keep their trade-off as `A) {option} — {trade-off} · B) …`, while `bkit decisions apply` keeps resolving its recommendation by the bare option name (the parser strips the letter), so headless / `ask:false` routing is unchanged.

**Related Issues:**

- `#703 — Standardise the question option labels (open)`

**Scope mapping — where the issue's touched surfaces actually carry the shape:**

- The engine is the only site that composes a whole option list mechanically (`bkit decisions compose`), so the Decision Pause's letters come from `decisions.ts`, not from `bkit-build.md`.
- The plan / design open questions are prose the agents author: the shape lives in the plan template, in the shared `plan-open-questions` clause and in the design / plan prompts that state the rule.
- The audit surfaces (`bkit-audit-generate.md`, `.bkit/core/docs/templates/bkit-audit-*.md`) carry no `Options:` line today; the only audit decision-question shape is the `Proposal` question (`.bkit/core/docs/templates/bkit-audit-models.md` step 9), which this plan pins. The new audit in `GROUP 2` scans **every** prompt and **every** template, so the audit surfaces are held to the one layout without an invented edit.
- `.bkit/core/prompts/bkit-plan-review-2.md` carries no open-question or option rule; it needs no edit and is covered by the same scan.
- Shipped docs and prompts must not name this issue: `audits/repo/shipped-docs-refs.test.ts` rejects a tracker number, ledger key or finding id at the package source, so every prose edit records behaviour only.

---

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| The Decision Pause's option list rendered, recommended and parsed lettered | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -rn "Options:" .bkit/core/engine`; references to `itemLines`, `parseDecisionItems`, `deferralRow`; `grep -n "options\|Recommended" .bkit/core/engine/commands/workflow/challenge.ts` | `decisions.ts` — `itemLines` renders the question, its options and its recommendation, `parseDecisionItems` splits the option list and reads the recommendation, `deferralRow` writes the option text into the ship deferral; covers render, parse and the row, missing only the letter | EXTEND | Letter each option by index in `itemLines` and in `deferralRow`, and strip a leading `{A-Z}) ` in `parseDecisionItems` so `options` and `recommended` stay bare names for `applyRecommendations` and `apply --by=owner`. |
| One option layout enforced across workflows, prompts and templates | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | `grep -rln "Options:" .bkit/core`; reads of `prompt-notation.test.ts`, `counter-prose-audit.test.ts`, `workflow-shape.test.ts`, `owner-wait-rows.test.ts` | `prompt-notation.test.ts` is `PROMPT_DIR`-scoped, `counter-prose-audit.test.ts` is counter-wiring-scoped, `workflow-shape.test.ts` reads the workflows (plus two prompts) for command and route shape — none scans workflows + prompts + templates + `.bkit/*.md` for one question-option rule | NEW | Reason (b): extending `prompt-notation.test.ts` breaks its declared prompt-only contract, and extending `counter-prose-audit.test.ts` breaks its declared counter-wiring contract; both are single-rule audits. |
| The shared open-question wording reaching the four plan prompts | `.bkit/instructions.md` | `grep -n "plan-open-questions" .bkit/instructions.md`; `grep -rn "Open questions:" .bkit/core/prompts/*.md`; `grep -n "syncClauses\|syncSources" .bkit/core/engine/tools/instructions.ts` | the `### plan-open-questions` clause — canonical `text`, a `retired` wording and four `carriers` — carries one sentence into `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check` and `bkit-plan-update` | EXTEND | Move today's canonical text to `retired`, write the lettered wording as canonical, run `pnpm instructions:sync` so all four carriers take it. |
| The canonical description of the question layout | `.bkit/core/.bkit/workflows.md` | `grep -n "Question layout" .bkit/core/.bkit/workflows.md` | the `§ Ask points` **Question layout** bullet — states `Options: A / B` and `Recommended: X — {reason}` | EXTEND | Widen it to `Options: A) … / B) …` and `Recommended: A) X — {reason}`. |
| The human-question notation rule | `.bkit/core/.bkit/authoring.md` | `grep -n "Human questions" .bkit/core/.bkit/authoring.md` | `§ Human questions` — states the per-question shape without pinning the option format, which is why each site invented its own | EXTEND | Pin the options as lettered `A)`, `B)`, `C)`, including options that carry a name. |
| The plan template's open-question placeholder | `.bkit/core/docs/templates/bkit-plan.md` | `grep -n "Options" .bkit/core/docs/templates/bkit-plan.md` | `§ Open Questions` — `**Options:** A — [option, trade-off] · B — …` | EXTEND | Letter every option: `A) [option] — [trade-off] · B) …`. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### GROUP 1: The decision engine letters its options

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Letter the Decision Pause's options and recommendation in the renderer, and strip the letter back off in the parser
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: `itemLines` renders `Options: A) {A} / B) {B}` and `Recommended: A) {A} — {reason}`, lettering each option and the recommended one by its index in `options`; `No recommendation — {why}` stays as it is
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: `parseDecisionItems` strips a leading `{A-Z}) ` from each `Options:` entry and from the `Recommended:` value, so `options` and `recommended` stay bare names (`Accept`, `Fix now`, `Try again`, `Decide`, `Stop`); a file written before the letters parses unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: `deferralRow`'s `description` letters the options it quotes, and the file-header layout comment names the lettered forms
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: the `DecisionItem` fields `options` and `recommended` every caller compares
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: `applyRecommendations` — its `Accept (assumed)` branch and its `options.includes("Try again")` loop detection need bare names
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the compose and loop assertions that expect the letterless form, plus the new cases
  - **DONE WHEN:** `bkit decisions compose` writes `Options: A) … / B) …` and `Recommended: A) … — …`; `parseDecisionItems` returns bare names for `Options: A) Accept / B) Fix now` and for a legacy `Options: Accept / Fix now`; `apply --by=headless` still writes `Accept (assumed)` / `Fix now` and still reports the `Try again` loop; `challenge.test.ts`'s letterless fixture keeps parsing; `pnpm vitest run .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose letters every option and the recommended one` fails while the option and recommendation lines render with no letter
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems keeps the bare option name, dropping the letter` fails while `A) Accept` stays the option value, so the loop detection and the `Accept` routing see no bare name
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a decision file written before the letters still parses` fails while a legacy `Options: Accept / Fix now` file yields no options
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop letters the loop question's options and recommendation` fails while the loop question renders `Options: Try again / Decide` letterless
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--defer letters the options in the deferral row` fails while the row's description lists `Accept / Fix now` letterless
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a lettered recommendation still settles its item by name` fails while an item whose options carry letters is left undecided by `applyRecommendations`

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: The corpus states one option layout, and an audit holds it

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Pin the option layout in the canonical description and add the audit that holds the whole corpus to it
  - **CREATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the corpus audit — every `Options:` line in `.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`, `.bkit/core/docs/templates/*.md` and `.bkit/core/.bkit/*.md` letters each entry `A) … / B) …`; every `Recommended:` line in the workflows names a letter; every open-question rule in the prompts names the lettered form; a not-vacuous guard that counts the option lines found per directory; RED-PROOF cases feeding a synthetic `Options: A / B` and a synthetic `Options: Accept / Fix now` and asserting the rule fires
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `§ Ask points` **Question layout** bullet — `Options: A) … / B) …` and `Recommended: A) X — {reason}`
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: `§ Human questions` — pin the options as lettered `A)`, `B)`, `C)`, including options that carry a name; record behaviour only, never this issue's number
  - **DONE WHEN:** the audit file exists; its not-vacuous guard, its RED-PROOF cases and `the canonical layout letters every option and recommendation` pass; `every option line in the workflows letters every entry`, `every recommendation line in the workflows names a letter`, `every open-question rule in the prompts names the lettered option form` and `the plan template letters every option of its Open Questions placeholder` still fail on today's letterless lines, which TASK 3 and TASK 4 fix
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical layout letters every option and recommendation` fails while `.bkit/core/.bkit/workflows.md` states `Options: A / B`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Letter every option line the five phase workflows state, and refresh the `none` render baselines
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Loop Question's `Options: Try again / Stop` line and its `Recommended:` line — `Options: A) Try again / B) Stop`, the recommendation naming the chosen letter
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Confirm Assumed Items line — `Options: A) Confirm / B) Reject`; the merge fix-round line — `Options: A) Try again / B) Stop`, its `Recommended:` naming the chosen letter
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the `§ Decision Pause` step 4 rendering line — name the lettered `Options:` and `Recommended:` lines the question carries
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: the Step 3 Grill step 2 per-question shape — pin the question's options as lettered `A)`, `B)`, `C)`
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the open-questions-one-by-one line — pin the plan's lettered options
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated by `vitest -u` for the changed prose
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated by `vitest -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated by `vitest -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated by `vitest -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated by `vitest -u`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `every option line in the workflows letters every entry` and `every recommendation line in the workflows names a letter` pass; the five `none` baselines match their renders (`pnpm vitest run .bkit/core/engine/render/trackers.test.ts`); no workflow states a letterless option list or a letterless recommendation; the edits record behaviour only, never this issue's number
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every option line in the workflows letters every entry` fails while `bkit-debug.md` states `Options: Try again / Stop` and `bkit-ship.md` states `Options: Confirm / Reject`
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every recommendation line in the workflows names a letter` fails while `bkit-debug.md` and `bkit-ship.md` recommend `{Try again|Stop}` with no letter

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Letter the open-question and audit decision-question option shape in the prompts and templates
  - **UPDATE:** `.bkit/instructions.md`: the `### plan-open-questions` clause — its today's canonical text moves to the `retired` block and the new canonical text states each open question's options lettered `A) {option} — {trade-off} · B) …`; `pnpm instructions:sync` then writes it into the four carriers (`bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`), never edited by hand
  - **UPDATE:** `.bkit/core/prompts/bkit-design-generate.md`: the `Risks & Open Questions` rule — an open question carries lettered options and a lettered `Recommended`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-update.md`: the `Risks & Open Questions` rule — the same lettered option shape
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-2.md`: the `Risks & Open Questions` finding rule — a question lacking lettered options is the missing part it names
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: `§ Open Questions` — `**Options:** A) [option] — [trade-off] · B) [option] — [trade-off] · C) [option] — [trade-off, optional]`
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-models.md`: the Step 9 `Proposal` question — lettered options and a lettered `Recommended`
  - **UPDATE:** `.bkit/core/prompts/bkit-audit-generate.md`: the report-shape rule — where the report poses an open decision question, its options are lettered `A)`, `B)` and the recommendation names a letter
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `every open-question rule in the prompts names the lettered option form` and `the plan template letters every option of its Open Questions placeholder` pass; `pnpm instructions:sync` leaves no drift after two runs; `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts` passes; every edit records behaviour only, never this issue's number
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts names the lettered option form` fails while the `Open questions:` rule in `bkit-plan-generate.md` and the `Risks & Open Questions` rule in `bkit-design-generate.md` state their options with no letter
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the plan template letters every option of its Open Questions placeholder` fails while `§ Open Questions` reads `**Options:** A — [option, trade-off] · B — …`

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: The regenerated artifacts and the final gate run

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Regenerate the installed mirrors and the instruction store from the changed sources
  - **UPDATE:** `.bkit/workflows.md`: regenerated by the dogfood install from `.bkit/core/.bkit/workflows.md`, never hand-edited
  - **UPDATE:** `.bkit/authoring.md`: regenerated by the dogfood install from `.bkit/core/.bkit/authoring.md`
  - **UPDATE:** `.bkit/instructions.md`: regenerated by `pnpm instructions:sync`
  - **UPDATE:** `docs/templates/bkit-plan.md`: regenerated by the dogfood install from `.bkit/core/docs/templates/bkit-plan.md`
  - **UPDATE:** `docs/templates/bkit-audit-models.md`: regenerated by the dogfood install from `.bkit/core/docs/templates/bkit-audit-models.md`
  - **UPDATE:** `.claude/commands/bkit-build.md`: regenerated by the dogfood install from `.bkit/core/workflows/bkit-build.md`
  - **UPDATE:** `.claude/commands/bkit-debug.md`: regenerated by the dogfood install
  - **UPDATE:** `.claude/commands/bkit-ship.md`: regenerated by the dogfood install
  - **UPDATE:** `.claude/commands/bkit-design.md`: regenerated by the dogfood install
  - **UPDATE:** `.claude/commands/bkit-plan.md`: regenerated by the dogfood install
  - **UPDATE:** `.cursor/commands/bkit-build.md`: regenerated by the dogfood install
  - **UPDATE:** `.opencode/commands/bkit-build.md`: regenerated by the dogfood install
  - **UPDATE:** `.agents/skills/bkit-build/SKILL.md`: regenerated by the dogfood install (Codex host)
  - **UPDATE:** `.agents/plugins/bkit/skills/bkit-build/SKILL.md`: regenerated by the dogfood install (Antigravity host)
  - **UPDATE:** `.claude/agents/bkit-plan-generate.md`: regenerated by the dogfood install from `.bkit/core/prompts/bkit-plan-generate.md`
  - **UPDATE:** `.claude/agents/bkit-design-generate.md`: regenerated by the dogfood install
  - **UPDATE:** `.claude/agents/bkit-audit-generate.md`: regenerated by the dogfood install
  - **UPDATE:** `.opencode/agents/bkit-plan-generate.md`: regenerated by the dogfood install
  - **UPDATE:** `.codex/agents/bkit-plan-generate.toml`: regenerated by the dogfood install
  - **UPDATE:** `.bkit/version`: the `canonicalHashes` of every regenerated mirror, written by the install
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** the dogfood install (`pnpm tsx .bkit/core/engine/cli.ts install --claude --cursor --codex --antigravity --opencode=openrouter`; `--tracker=github` re-renders every installed host in one call) writes every mirror above; a second run changes nothing; `pnpm tsx .bkit/core/engine/cli.ts check` is drift-clean
  - **TEST FIRST:** n/a — install regeneration of generated artifacts; no behaviour of its own

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Rebuild `dist/` from the changed engine source
  - **UPDATE:** `dist/commands/workflow/decisions.js`: rebuilt by `pnpm build` from `.bkit/core/engine/commands/workflow/decisions.ts`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm build` succeeds and `pnpm bkit:check:dist` reports no diff between a fresh build and the committed `dist/`
  - **TEST FIRST:** n/a — compiled output of TASK 1's change; `bkit:check:dist` is the check

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Run the four verification commands on the final tree and fix any fallout
  - **READ:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the audit the gate run must turn green
  - **READ:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: the baseline the gate run must keep byte-equal
  - **DEPENDS ON:** 2, 5, 6
  - **DONE WHEN:** `pnpm test`, `pnpm typecheck`, `pnpm lint:prose` and `pnpm format:check` each exit 0 on the final tree, and `pnpm format:check` leaves no reformat of the new audit or the edited prose
  - **TEST FIRST:** n/a — the whole change is verified by the four commands, which are the check

<!-- bkit:task 7 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: Challenge round 1 findings

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** The corpus audit reads only the first `Options:` label on a line, so the second list on `.bkit/core/.bkit/authoring.md:114` can revert to `Options: Accept / Fix now` and the suite stays green
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:88` · **Round:** 1
  - **DONE WHEN:** `optionLists` reports every `Options:` list a line carries — each match of the label, not just the first, and each list's entries read to its own closing code span — and the four corpus assertions (`every option line in the workflows letters every entry`, `every option line in the prompts, the templates and the authoring docs letters every entry`, `the plan template letters every option of its Open Questions placeholder`, the not-vacuous guard) still pass on the untouched corpus. Reproduction on this tree: with the audit's own `optionLists` / `optionViolations`, reverting the second list of `.bkit/core/.bkit/authoring.md:114` from `` `Options: A) Accept / B) Fix now` `` to `` `Options: Accept / Fix now` `` yields **zero** violations, while reverting the first list yields two.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `RED-PROOF: a second Options: list on one line still fires the option rule` fails while the label match is the first per line, so the second, letterless list is never inspected
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `an option list whose entries span code spans letters every entry` fails while the raw list is cut at the first backtick, dropping every entry after it

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [ ] **TASK 9:** The `Recommended:` rule runs over the workflows only, so the plan template's `Recommended: [A] — [why, 1 line]` diverges from the canonical `Recommended: A) X — {reason}` with nothing holding it
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:230` · **Round:** 1
  - **DONE WHEN:** the recommendation rule runs over `PROMPTS`, `TEMPLATES` and `AUTHORING` as well as `WORKFLOWS`, and `.bkit/core/docs/templates/bkit-plan.md:108` plus its `docs/templates/bkit-plan.md` mirror state the lettered form (`**Recommended:** A) [option] — [why, 1 line]`) — so the Open Questions block every plan is generated from shows the same recommendation shape as the canonical `**Question layout**` bullet the audit names, and no other template, prompt or authoring line fails the widened rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every recommendation line in the templates and the prompts names a letter` fails while `**Recommended:** [A] — [why, 1 line]` carries no `{letter})` and the rule never reads that directory

<!-- bkit:task 9 end -->
<!-- bkit:task 10 start -->

- [ ] **TASK 10:** The prompts index is left stating the pre-change option rule for the prompts this change edited — the same-change index update the repo rules mandate, with no gate behind it
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/prompts.md:267` · **Round:** 1
  - **DONE WHEN:** every row of the prompts index that states the open-question option rule names the lettered form the prompt now states — at least `bkit-design-generate` (:255), `bkit-design-review-2` (:257), `bkit-plan-generate` (:267), `bkit-plan-scope-check` (:270) and the `bkit-plan-update` row — the dogfood install re-renders `.bkit/prompts.md` from that source so the two agree, and a test holds the agreement instead of a reader's memory.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts index names the lettered option form` fails while `.bkit/core/.bkit/prompts.md:267` reads `… carries 2-3 concrete options with trade-offs, a Recommended option and a Default if unanswered`

<!-- bkit:task 10 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against the issue's acceptance criteria and edge cases:** the lettered render, the bare-name routing, the letterless-file parse, the loop detection and the corpus invariant each sit in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** errors logged and traced per `docs/observability.md`; no log line changes.
- [ ] **Update documentation:** the shipped docs this change touches state the lettered layout.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every shipped doc this change touches states the lettered option layout; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **`pnpm test`:** the full vitest suite (never scoped) passes — `decisions.test.ts`, `challenge.test.ts`, `render/trackers.test.ts`, `tools/instructions.test.ts` and the new `audits/workflows/question-option-format.test.ts` included.
- [ ] **`pnpm typecheck`:** `tsc --noEmit` plus `tsc -p tsconfig.test.json` pass over the changed `decisions.ts` and the new audit test.
- [ ] **`pnpm lint:prose`:** vale passes over every shipped prompt, workflow, template and `.bkit/*.md` this plan edits.
- [ ] **`pnpm format:check`:** prettier reports no reformat of the new audit test, the edited prose or this plan.
- [ ] **`pnpm bkit:check:dist`:** the committed `dist/` equals a fresh `pnpm build` (task 6).
- [ ] **`pnpm tsx .bkit/core/engine/cli.ts check`:** no drift in the regenerated mirrors (task 5).
- [ ] **Test Synchronization:** `render/__snapshots__/*.none.txt` regenerated by `vitest -u` for the workflows this plan edits; a snapshot change is reviewed line by line, never accepted blind.
- [ ] **Build Configuration:** no new test-only config; the new audit stays under `.bkit/core/engine/audits/workflows/`, excluded from the production build as today.
- [ ] **Apply local migrations:** N/A — no database.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Read a rendered question end to end — the debug Loop Question and ship's Confirm Assumed Items — and confirm every option carries its letter and the recommendation points at one.
- [ ] **Step 2:** Compose a Decision Pause and apply it headless (`bkit decisions apply --by=headless`), then confirm the file reads `Options: A) Accept / B) Fix now`, that an `Accept` is written `Accept (assumed)`, and that a `Try again` loop still settles the loop alone.

<!-- bkit:end -->
