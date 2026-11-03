# Brief: group 2 — The corpus states one option layout, and an audit holds it

Plan: 703 — Standardise Question Option Labels Implementation Plan

## Why and what

### Context & Goals

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

## Where it fits

- Group 1: The decision engine letters its options — done
  - TASK 1: Letter the Decision Pause's options and recommendation in the renderer, and strip the letter back off in the parser — done
- Group 2: The corpus states one option layout, and an audit holds it — this group
  - TASK 2: Pin the option layout in the canonical description and add the audit that holds the whole corpus to it — open
  - TASK 3: Letter every option line the five phase workflows state, and refresh the `none` render baselines — open
  - TASK 4: Letter the open-question and audit decision-question option shape in the prompts and templates — open
- Group 3: The regenerated artifacts and the final gate run — next
  - TASK 5: Regenerate the installed mirrors and the instruction store from the changed sources — open
  - TASK 6: Rebuild `dist/` from the changed engine source — open
  - TASK 7: Run the four verification commands on the final tree and fix any fallout — open

## The work

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Pin the option layout in the canonical description and add the audit that holds the whole corpus to it
  - **CREATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the corpus audit — every `Options:` line in `.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`, `.bkit/core/docs/templates/*.md` and `.bkit/core/.bkit/*.md` letters each entry `A) … / B) …`; every `Recommended:` line in the workflows names a letter; every open-question rule in the prompts names the lettered form; a not-vacuous guard that counts the option lines found per directory; RED-PROOF cases feeding a synthetic `Options: A / B` and a synthetic `Options: Accept / Fix now` and asserting the rule fires
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `§ Ask points` **Question layout** bullet — `Options: A) … / B) …` and `Recommended: A) X — {reason}`
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: `§ Human questions` — pin the options as lettered `A)`, `B)`, `C)`, including options that carry a name; record behaviour only, never this issue's number
  - **DONE WHEN:** the audit file exists; its not-vacuous guard, its RED-PROOF cases and `the canonical layout letters every option and recommendation` pass; `every option line in the workflows letters every entry`, `every recommendation line in the workflows names a letter`, `every open-question rule in the prompts names the lettered option form` and `the plan template letters every option of its Open Questions placeholder` still fail on today's letterless lines, which TASK 3 and TASK 4 fix
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical layout letters every option and recommendation` fails while `.bkit/core/.bkit/workflows.md` states `Options: A / B`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Letter every option line the five phase workflows state, and refresh the `none` render baselines
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

- [ ] **TASK 4:** Letter the open-question and audit decision-question option shape in the prompts and templates
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

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| One option layout enforced across workflows, prompts and templates | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | `grep -rln "Options:" .bkit/core`; reads of `prompt-notation.test.ts`, `counter-prose-audit.test.ts`, `workflow-shape.test.ts`, `owner-wait-rows.test.ts` | `prompt-notation.test.ts` is `PROMPT_DIR`-scoped, `counter-prose-audit.test.ts` is counter-wiring-scoped, `workflow-shape.test.ts` reads the workflows (plus two prompts) for command and route shape — none scans workflows + prompts + templates + `.bkit/*.md` for one question-option rule | NEW | Reason (b): extending `prompt-notation.test.ts` breaks its declared prompt-only contract, and extending `counter-prose-audit.test.ts` breaks its declared counter-wiring contract; both are single-rule audits. |

Reuse Inventory rows left out: 4; Architecture entries left out: 0 — read them in docs/plans/202610/703-standardise-question-option-plan.md § Reuse Inventory and § Architecture & Component Changes.
