Verdict: SPLIT
<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 22 (`^- \[ \] \*\*Task` matches), organized into 5 waves (skip recording, input tolerance, applicability predicates, routing, ledgers/docs/mirrors).
- **Gates:** 4 (`Gate 1` Prerequisites, `Gate 2` Code Implementation, `Gate 3` Testing & Documentation, `Gate 4` Automated Verification) plus 4 Manual Verification live-run scenarios (Steps 1-5, including sub-steps 2b/2c).
- **Domain areas covered:**
  - Shell primitives (`.bkit/templates/.bkit/scripts/bkit-status-route.sh` — new emitter function + fail-closed validation)
  - TypeScript engine (`.bkit/src/bkit-status.ts` header/doc-only, plus four new `.bkit/src/*-audit.test.ts` files: skip-recording, input-tolerance, applicability, plus extensions to `bkit-config-keys.test.ts`, `bkit-catalog-parity.test.ts`, `bkit-verdict-vocabulary.test.ts`, `bkit-install.integration.test.ts`)
  - Shell/bats tests (new `tests/step-skipped-row.bats`, extensions to `tests/counter-derive.bats`)
  - Workflow prose across all five workflow files (`bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`) — 28 existing conditional steps retrofitted, plus new `**Run lens only if**` construct, new Step 3.5, new predicate tables
  - Prompt files (`bkit-design-generate.md`, `bkit-design-review-1/2.md`, `bkit-plan-generate.md`; deletion of `bkit-plan-scope-check-2.md`)
  - Documentation surface (`README.md`, `.bkit/workflows.md`, `.bkit/prompts.md`, `.bkit/comparison.md`, `docs/testing.md`, `docs/knowledge.jsonl`)
  - Ledgers (`docs/decisions.jsonl`, `docs/deferrals.jsonl` — verification of 3 decision rows + 8 deferral rows)
  - Consumer-facing config (`bkit.sensitivePaths` new `package.json` key)
  - Install/mirror regeneration and integration testing (`.claude/`, `.cursor/`, `.opencode/` mirror prune verification)

## Session Fit Estimate

Well over the ~85K threshold on both axes used by the mapping rule. Task count alone (22) exceeds the `<= 12` ceiling nearly twofold. The plan document itself is 833 lines and states in its own Open Questions section that it expects `/bkit-plan` Step 9's `complexity-check` to return `SPLIT` on this very runbook, and pre-names Task 4 as the natural seam. Beyond raw task count, the token estimate is large by any read: 22 tasks each carrying dense multi-clause `Done when` verification lines (several individual tasks — e.g. Task 4, Task 9, Task 12, Task 15, Task 21, Task 22 — read as 200-400+ words each), five separate wave-gated new test files to author from scratch, a 28-site mechanical retrofit across five workflow files, and a cross-cutting documentation sweep across six+ non-code files. Executing this in one session would require holding the full predicate/enum/continuity-hard-set model (spanning shell, TypeScript, markdown-prose workflow files, and prompt files simultaneously) in context for the entire run, which realistically consumes far more than 85K tokens once tool-call overhead, file reads of the five workflow files (each hundreds of lines), and test-writing/verification loops are included.

## Rationale

Verdict is SPLIT: task count (22) exceeds the `<= 12` ceiling, and the estimated token cost of a single session executing all 5 waves plus 4 gates plus documentation and ledger sweeps clears 85K by a wide margin.

**Proposed domain groupings** (the plan's own dependency graph — stated `Requires:` edges — supports clean per-wave splits since waves 1-2 are declared "behaviour-neutral" and safe to land independently, and wave boundaries never point backwards):

1. **Sub-plan A — Wave 1 (skip recording, pure logging).** Tasks 1-5: add `route_append_step_skipped` emitter, bats + reducer coverage, documentation of the row type, retrofit to all 28 conditional steps, and the derived presence audit. Self-contained; zero behaviour change. Fits one session (5 tasks, one new shell function, one new test file, mechanical retrofit across known line numbers).

2. **Sub-plan B — Wave 2 (input tolerance, partial-width fan-out).** Tasks 6-10: `(if present)` read-list tolerance, latest-present version-chain resolution, `Failures:` header addition to design reviewers, partial-width fan-out rewrite of the two review steps, and the derived tolerance audit. Depends on Wave 1's artifacts existing but not on its tasks completing in the same session — could run after Sub-plan A merges. Fits one session (5 tasks, mechanical rewrites to known constructs).

3. **Sub-plan C — Wave 3 (applicability predicates, design and plan).** Tasks 11-15: new design-doc signal sections, wiring design predicates + continuity hard-sets, wiring plan predicates, deleting `bkit-plan-scope-check-2` and its full caller inventory, and the derived applicability audit. This is the plan's most conceptually dense wave (enum completeness, force-on-only sensitive-path semantics, sole-emitter continuity) and the one gated by an open human decision (Open Question 8). Fits one session on its own (5 tasks) but should not be combined with another wave given its density.

4. **Sub-plan D — Wave 4 (routing) + Wave 5 (ledgers/docs/mirrors).** Tasks 16-22: escalation verdict emission, plan Step 3.5, debug entry-gap fix, routing-audit extension, doc/rationale rehoming, ledger verification, and the final install-integration + full-gate-suite pass. Task 22 in particular ("run the whole local gate set and a packed-tarball dogfood") is naturally a session-closing task and depends on all prior waves being merged, so this sub-plan is the integration/closeout session. 7 tasks, fits one session.

Each sub-plan should carry forward the shared Acceptance Scenario, Breaking Changes, and Open Questions sections as read-only context rather than re-litigating them, and each should inherit the same Gate structure scoped to its own wave's `Done when` lines. The split seam matches the plan's own wave boundaries exactly — no re-derivation needed.
