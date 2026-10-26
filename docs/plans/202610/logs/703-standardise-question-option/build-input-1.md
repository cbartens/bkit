## Session Prompt — this run's, newer than everything below

#703

## Issue description — oldest

## Problem

bkit asks the owner questions in several places — the design grill, the plan / design open questions, the build Decision Pause, the debug Loop Question, and ship's Confirm Assumed Items and merge question. Question numbering is already `Q{n}` almost everywhere, but **answer options are labelled three different ways**, so the same Q&A reads differently from run to run:

<!-- prettier-ignore -->
| Where | Today |
| --- | --- |
| `docs/templates/bkit-plan.md` § Open Questions | `Options: A — … · B — …` |
| `bkit decisions compose` (build Decision Pause) | `Options: Accept / Fix now` |
| `bkit-debug` Loop Question | `Options: Try again / Stop` |
| `bkit-ship` Confirm Assumed Items | `Options: Confirm / Reject` |
| `bkit-ship` merge fix round | `Options: Try again / Stop` |
| `.bkit/workflows.md` § Ask points (the canonical description) | `Options: A / B` |

`.bkit/authoring.md` § Human questions and the design grill describe the shape as `**Q{n} — {title}:** {question, options}` without pinning the option format, so each site invented its own.

## Decisions (agreed with the owner)

1. **Questions** are always `**Q{n} — {title}:** …`, numbered from `Q1`.
2. **Answer options** are always lettered `A)`, `B)`, `C)` … — including options that already carry a name, e.g. `Options: A) Accept / B) Fix now`.
3. **Plan / design open questions** keep the option text and its trade-off: `A) {option} — {trade-off} · B) …`.
4. **Scope:** every workflow (design, plan, build, debug, ship) plus the design / plan / audit generate prompts and the plan / audit templates.

## Findings — touchpoints

**Source of truth (`.bkit/core/`):**

- `.bkit/core/.bkit/workflows.md` § Ask points — question layout
- `.bkit/core/.bkit/authoring.md` § Human questions
- `.bkit/core/workflows/bkit-design.md` (Grill), `bkit-build.md` (Decision Pause), `bkit-debug.md` (Loop Question), `bkit-ship.md` (Confirm Assumed Items, merge), `bkit-plan.md`
- `.bkit/core/prompts/bkit-design-generate.md`, `bkit-plan-generate.md`, `bkit-plan-review-1.md`, `bkit-plan-review-2.md`, `bkit-plan-scope-check.md`, `bkit-plan-update.md`, `bkit-design-update.md`, `bkit-design-review-2.md`
- `.bkit/core/docs/templates/bkit-plan.md` § Open Questions
- Engine: `.bkit/core/engine/commands/workflow/decisions.ts` — `itemLines` renders `Options: … / …`, `parseDecisionItems` splits on `/`, `deferralRow` builds the option text

**Generated mirrors** (regenerated, never hand-edited): `.bkit/*.md`, `.bkit/instructions.md`, `.claude/commands/`, `.cursor/commands/`, `.opencode/commands/`, `.agents/skills/`, `.agents/plugins/bkit/skills/`, `docs/templates/bkit-plan.md`, `dist/**`.

**Tests and snapshots:** `decisions.test.ts`, `challenge.test.ts`, `engine/render/__snapshots__/*.txt`.

## Acceptance criteria

- Every owner-facing question renders `Q1`, `Q2`, … and options `A)`, `B)`, `C)`.
- `bkit decisions compose` writes `Options: A) … / B) …` and `Recommended: A) … — …`; `bkit decisions apply` still resolves the recommendation by option name (the parser strips the letter), so headless / `ask:false` routing is unchanged.
- No workflow, prompt or template shows `Options: A / B` or a letterless named option.
- `pnpm test`, `pnpm typecheck`, `pnpm lint:prose`, `pnpm format:check` pass; `dist/` rebuilt.
- Generated mirrors and `.bkit/instructions.md` regenerated and consistent.

## Edge cases

- A decision file written before this change (no letters) must still parse — the parser must accept both `Options: Accept / Fix now` and `Options: A) Accept / B) Fix now`.
- `Recommended:` must keep resolving to an option name, or `decisions apply --by=headless` and the `loop` detection (`options.includes("Try again")`) break.
- The plan / design open-question format is prose the agents author, not engine-rendered — the templates and generate prompts must state the letter format explicitly.

## Out of scope

- Changing the number of questions, the ask points, or the loop / attempt limits.
- Any behavioural change to the decision engine beyond the label format.

## References

- `.bkit/core/.bkit/workflows.md` § Ask points
- `.bkit/core/.bkit/authoring.md` § Human questions
- `.bkit/core/docs/templates/bkit-plan.md` § Open Questions

## Issue comment — posted 2026-10-26T07:31:23.000Z

## Work done

**Investigation** — mapped every place bkit asks the owner a question and how it labels the options. The full inventory and the touchpoints are in the issue body above.

**Decisions agreed with the owner:**

- Questions: always `Q1`, `Q2`, … numbered from `Q1`.
- Options: always `A)`, `B)`, `C)` — including named options (`Options: A) Accept / B) Fix now`).
- Plan / design open questions: `A) {option} — {trade-off} · B) …`.
- Scope: every workflow (design, plan, build, debug, ship) plus the design / plan / audit generate prompts and the plan / audit templates.

**Key risk identified:** `bkit decisions compose` renders `Options: … / …` and `parseDecisionItems` splits on `/`; `applyRecommendations` and the loop detection compare `recommended` / options to bare option names (`Accept`, `Try again`, `Stop`). The parser must strip the `A)` prefix and tolerate files written before this change, or headless / `ask:false` routing breaks.

**Planned change set:**

1. Source of truth under `.bkit/core/` — workflows, prompts, `.bkit/*.md`, `docs/templates/bkit-plan.md`.
2. Engine — `decisions.ts` render + parse, with `decisions.test.ts` / `challenge.test.ts` and `render/__snapshots__/*.txt` updated.
3. Rebuild `dist/`; regenerate the IDE mirrors (`.claude/`, `.cursor/`, `.opencode/`, `.agents/`) and `.bkit/instructions.md`.
4. Verify `pnpm test`, `pnpm typecheck`, `pnpm lint:prose`, `pnpm format:check`.

**Status:** investigation and decisions complete; implementation not started.
