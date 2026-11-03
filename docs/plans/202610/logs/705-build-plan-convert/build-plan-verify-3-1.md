Verdict: FAIL
Failures: 1
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3` (tasks 3, 4, 5).

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verification attempt for group 3.

## Notes

- TASK 4 and TASK 5 have no test-first audit gap and their `DONE WHEN` holds in the codebase; both are ticked. TASK 3's `DONE WHEN` also holds, but the audit reports a `red-mismatch` gap on it, so by protocol it stays unticked and the verdict is FAIL.
- TASK 3 `DONE WHEN`, checked against the tree rather than the execute log's claim:
  - `.bkit/core/.bkit/workflows.md`'s build table reads `1 — Start Workflow` … `16 — Close Workflow & Create PR` with `3 — Branch Sync` cut back to `branches sync --merge-docs` (line 875) and a new `4 — Plan Convert` row holding the plan check, the `@bkit-build-plan-convert` dispatch and the re-check (line 876); rows 5-16 renumbered (5 — Plan Current, 6 — Skills, 7 — Execute Plan, 8 — Verify Plan, 9 — Remediate Gaps, 10 — Holistic, 11 — Build Challenge, 12 — Run Tests, 13 — Diagnose, 14 — Remediate Failure, 15 — Summary, 16 — Close Workflow). No prose reference to an old number seen in the build section.
  - `grep -n "Plan Convert" .bkit/core/.bkit/workflows.md` shows the new row (line 876); `.bkit/workflows.md` carries the matching `| 4 — Plan Convert |` row (line 876).
  - `pnpm instructions:sync` exits 0 and a second run leaves `git status --short .bkit/instructions.md` empty — the mirrored § Cross-step invariants is in sync and the sync is idempotent.
  - `npx vitest run .bkit/core/engine/tools/instructions.test.ts` → 1 file, 96 tests passed.
- TASK 4 `DONE WHEN`: `pnpm bkit check` exits 0 (no managed file needing a re-render); `pnpm bkit:check:dist` exits 0 (`rm -rf dist && tsc` then `git diff --exit-code dist/` — `dist/` matches the engine sources); the five host mirrors `.claude/commands/bkit-build.md`, `.cursor/commands/bkit-build.md`, `.opencode/commands/bkit-build.md`, `.agents/skills/bkit-build/SKILL.md`, `.agents/plugins/bkit/skills/bkit-build/SKILL.md` each carry exactly one `Step 4 — Plan Convert` heading (count 1 each). Ticked.
- TASK 5 `DONE WHEN`: `docs/testing.md:630` (`workflow-shape.test.ts` row) reads "build Branch Sync merging its docs, Plan Convert checking the plan, converting one with no task markers and checking again, Step 7 taking the next group's brief, Step 8 verifying the group's own diff; build Step 11 running `challenge gate` …" — names Plan Convert and the shifted numbers, no old build step number. `docs/knowledge.jsonl` holds 4 rows for the `plan-line-anchors-…` key; the newest row (`ts` 1793072007945, schema 3) references `.bkit/core/workflows/bkit-build.md (Step 5 — Plan Current)` and `#705` and its `rootCause` reads `build Step 5 — Plan Current`, with no `Step 4 — Plan Current` left in it (the two remaining `Step 4 — Plan Current` hits sit in older append-only rows, which are never edited). `git show --numstat d46dae778 -- docs/knowledge.jsonl` reads `1 0` — one appended line, no existing line removed or rewritten. `pnpm lint:prose` exits 0 (147 files, 0 findings). Ticked.
- Group-3 test-first audit re-run here, not taken on trust: `bkit tests green --file=docs/plans/202610/logs/705-build-plan-convert/status.jsonl --workflow=build --group=3 --plan=docs/plans/202610/705-build-plan-convert-plan.md --log=/tmp/verify3-green.md` → `enforced: true`, one gap, `testOrderOnly: true`, `lateRedUnchecked: []`, matching `build-tests-green-3-1.md`.
- TASK 3 `red-mismatch` — why it is `Fixable: false`. The plan's TASK 3 `TEST FIRST` line names `.bkit/core/engine/tools/instructions.test.ts` "sync has nothing left to rewrite"; the audit records no red for it (it passes against the stale store) and the red actually recorded is `.bkit/core/engine/tools/instructions-sources.test.ts` "each Special Behaviors row and authoring section has one equal entry". That recorded test is not the planned one renamed or moved — different file, different name, different drift mechanism — so the `red-mismatch` rule yields `Fixable: false`. No agent can make the plan-named test go red, so only the owner can settle it (a TEST EXCEPTION at the Decision Pause). Nothing is rewritten here per the round instruction.
  - The record supports the execute agent's account: `build-task-red-3-3-1.md` shows `instructions-sources.test.ts` genuinely failing before the catalogue edit with `cross-step-invariants: text differs — run pnpm instructions:sync` (1 failed / 20 passed, exit 1) and the sync test passing now. The evidence is honest.
  - Fault lies with the plan line, not the evidence: `syncClauses` / `syncStore` only cover `## Clauses`, so a `## Special Behaviors` / authoring-section drift is invisible to `instructions.test.ts` "sync has nothing left to rewrite" — the brief's claim that this test (and `instructions-coverage.test.ts`) breaks on a stale store does not hold. A correctly-authored `TEST FIRST` line would have named the sources test. This is noted, not fixed, by this step.
- Groups 1 and 2 not undone, checked in the tree: `.bkit/core/workflows/bkit-build.md` still reads `Step 1 — Start Workflow` … `Step 16 — Close Workflow & Create PR`; Step 3's body holds only `branches sync --merge-docs` plus its own `--number=3 --post --title="Branch Sync"` finish; Step 4 is `Plan Convert`; Step 5 — Plan Current carries two `steps finish --step=build-plan-current` calls, both `--number=5 --post` (line 415 the no-agent / no-artifact skip with `--comment-field="Status=skipped (no plan anchor)"`, line 424 the agent route). `.bkit/instructions.md`'s `#### bkit-build` block still holds the group-1 remediation shape: its `**Plan:**` line reads "One group runs per pass of Steps 7-9" and its Decision Pause derivation text carries the renumbered routes (`PAUSE_STEP` = 8, `test-order gap … ["Accept", "Stop"]`), matching `build-plan-gaps-remediate-1-2-log.md`'s renumbered entry list.
- No `Derived Test Matrix` in the plan, so no rows to check. No `Documentation Updates` row is missing — all four (`.bkit/core/.bkit/workflows.md`, `.bkit/instructions.md`, `docs/testing.md`, `docs/knowledge.jsonl`) are done and verified above. No `docs/deferrals.jsonl` row and no `BLOCKED` line is offered as evidence.
- TASK 4 and TASK 5 are ticked `[x]`; TASK 3 is left `[ ]`. Nothing else was ticked, and nothing was committed by this step.

## Identified Gaps Log

- TASK 3: `.bkit/core/engine/tools/instructions.test.ts` "sync has nothing left to rewrite" — `red-mismatch` — no red for the plan-named test; the recorded red for `.bkit/core/engine/tools/instructions-sources.test.ts` "each Special Behaviors row and authoring section has one equal entry" is not the planned test renamed or moved (different file, name and drift mechanism) — Fixable: false
