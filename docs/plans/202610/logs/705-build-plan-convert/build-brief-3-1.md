# Brief: group 3 — Shipped reference and generated copies

Plan: Build Step Comments Carry Their Own Numbers Implementation Plan

## Why and what

### Context & Goals

A `/bkit-build` run's issue comments must line up one-to-one with the workflow's numbered steps. Today Plan Convert hides inside Branch Sync's Step 3 and posts under its number and heading, and Plan Current posts nothing when `anchor-read` self-skips, so a run's comments jump Step 3 to Step 5 with two Step 3 posts.

Plan Convert becomes its own Step 4, Branch Sync keeps Step 3, Plan Current moves to Step 5 and posts on both routes, and every later step shifts by one: Steps 5-15 become 6-16.

**Related Issues:**

- `#705` — build step comments get their own numbers (this plan).
- `#703` — the run the defect was found in (the comment sequence and status rows cited in the input).

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| When a plan must be converted, the plan check, the convert prompt's scope | The step only moves to its own number; its rules stay as they are | follow-up issue if a rule proves wrong |
| Stamping a `bkit:anchor` during `/bkit-build` | A converted plan carries no anchor by design; Plan Current names the skip instead | `/bkit-plan` (the workflow that stamps anchors) |
| Any other workflow's step numbering | Design, plan, debug, ship and auto are untouched | separate issue per workflow |

## Where it fits

- Group 1: Plan Convert becomes its own numbered step — done
  - TASK 1: Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps — done
- Group 2: Plan Current posts on both routes — done
  - TASK 2: Post a Plan Current comment whether the step runs or self-skips — done
- Group 3: Shipped reference and generated copies — this group
  - TASK 3: Record the new step in the shipped workflow catalogue and re-sync the clauses drawn from it — open
  - TASK 4: Regenerate the host mirrors and the built CLI — open
  - TASK 5: Bring the testing doc and the knowledge ledger onto the new step numbers — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Record the new step in the shipped workflow catalogue and re-sync the clauses drawn from it
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the build step table gains `4 — Plan Convert` holding what the convert does today, `3 — Branch Sync` cut back to the docs merge, rows 5-16 renumbered, and the prose references moved with them (§ Anchor Block, § Cross-step invariants, the Group loop paragraph, the "No plan" note, the convert and plan-current agent rows)
  - **UPDATE:** `.bkit/instructions.md`: re-synced from the edited catalogue with `pnpm instructions:sync`, so the mirrored § Cross-step invariants names the new build step numbers
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the build step table reads steps 1-16 with Plan Convert at 4 and no prose reference to an old number; `grep -n "Plan Convert" .bkit/core/.bkit/workflows.md` shows the new row; `pnpm instructions:sync` leaves the working tree unchanged on a second run; `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `sync has nothing left to rewrite` fails on the mirrored § Cross-step invariants still naming the old build step numbers

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Regenerate the host mirrors and the built CLI
  - **UPDATE:** `.bkit/workflows.md`: regenerated from `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `.claude/commands/bkit-build.md`: regenerated from the edited workflow
  - **UPDATE:** `.cursor/commands/bkit-build.md`: regenerated from the edited workflow
  - **UPDATE:** `.opencode/commands/bkit-build.md`: regenerated from the edited workflow
  - **UPDATE:** `.agents/skills/bkit-build/SKILL.md`: regenerated from the edited workflow
  - **UPDATE:** `.agents/plugins/bkit/skills/bkit-build/SKILL.md`: regenerated from the edited workflow
  - **UPDATE:** `dist/cli.js`: rebuilt from the edited engine sources with `pnpm build`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** `pnpm bkit install --tracker=github` re-renders every installed host and `pnpm build` rewrites `dist/`; `pnpm bkit check` exits 0 with no managed file needing a re-render, and the mirrors carry the `Step 4 — Plan Convert` heading; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:** n/a — generated copies of sources already tested; `pnpm bkit check` is their gate

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Bring the testing doc and the knowledge ledger onto the new step numbers
  - **UPDATE:** `docs/testing.md`: the `workflow-shape.test.ts` row names Plan Convert instead of Branch Sync and carries the shifted build step numbers
  - **UPDATE:** `docs/knowledge.jsonl`: one same-`key` append through `bkit ledgers append --ledger=knowledge` to the winning `plan-line-anchors-…` row, its `references` and its sentences reading `Step 5 — Plan Current`; no existing line edited, and the row goes in through a writer `.bkit/core/.bkit/jsonl.md` § Ledgers & Writers allows (the plan-execute agent is one)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `docs/testing.md` row reads `Plan Convert` and no build step number from the old table; `.bkit/core/.bkit/jsonl.md`'s fold reports one entry for that `key` whose newest row names `Step 5 — Plan Current`; `pnpm lint:prose` passes
  - **TEST FIRST:** n/a — docs prose and an append-only ledger row; no behaviour change

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps — `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/commands/workflow/step-table.test.ts`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`
- TASK 2 (group 2, done): Post a Plan Current comment whether the step runs or self-skips — `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| The shipped catalogue of build steps | `.bkit/core/.bkit/workflows.md` | `grep -n "plan-convert\|Branch Sync\|Plan Current" .bkit/core/.bkit/workflows.md`; read the build step table, § Anchor Block, § Cross-step invariants | the build step table rows 1-15, the agent rows, the "No plan" note | EXTEND | rows renumbered and a Plan Convert row added in the same table |
| The mirrored clauses drawn from the catalogue | `.bkit/instructions.md` | `grep -n "source: \`.bkit/core/.bkit/workflows.md\`" .bkit/instructions.md`; `pnpm instructions:show --file workflows` | § Cross-step invariants mirror carries "build Steps 9, 10" and "group verify (Step 7)" | EXTEND | `pnpm instructions:sync` rewrites it from the edited catalogue |
| The stale step reference in the knowledge ledger | `docs/knowledge.jsonl` | `grep -n "plan-line-anchors" docs/knowledge.jsonl`; read `.bkit/core/.bkit/jsonl.md` § Updating a Row and § Writers | the winning `plan-line-anchors-…` row cites `build Step 4 — Plan Current` | EXTEND | a same-`key` append corrects the reference; lines are never edited |

### Architecture entries

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- Build step table: a `4 — Plan Convert` row holding what the convert does today, `3 — Branch Sync` cut back to the docs merge, every later row renumbered; the prose references move with them (§ Anchor Block's `Step 4` → `Step 5`, § Cross-step invariants' build numbers, the Group loop paragraph, the "No plan" note, the convert / plan-current agent rows).

#### [MODIFY] `docs/testing.md`

- The `workflow-shape.test.ts` row names Plan Convert instead of Branch Sync and carries the shifted build step numbers.

#### [MODIFY] `docs/knowledge.jsonl`

- One same-`key` append to the winning `plan-line-anchors-…` row, its `references` and the sentences naming the step reading `Step 5 — Plan Current`; no existing line edited.
