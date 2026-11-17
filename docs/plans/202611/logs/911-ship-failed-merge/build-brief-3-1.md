# Brief: group 3 — Docs and hand-authored copies

Plan: Ship: remove the unreachable Failure Diagnose / Remediate steps Implementation Plan

## Why and what

### Context & Goals

**Workstream dependencies:** None — the plan covers the whole issue (`Workstreams: []`), and no parent design exists.

`/bkit-ship` (`.bkit/core/workflows/bkit-ship.md`) carries two steps for a failed merge, Step 11 — Failure Diagnose and Step 12 — Failure Remediate, that no route reaches. Every route out of Step 10 goes to Step 13, Step 9, Step 3, the Merge Question or the Failure Path, and Step 10 sub-step 4 says "Recoverable merge refusals never enter Steps 11–12". Only a resumed run whose last row is `ship-failure-diagnose` or `ship-failure-remediate` enters them, and such a run holds none of the `MERGE_ASK` / `MERGE_ROUNDS` / `MERGE_MAX` values Step 11 reads. Step 11 also starts `bkit-debug-failure-diagnose` with no `Strategy`, which that prompt answers with `Verdict: FAIL` and an unfilled report.

The owner decided (issue comment, 2026-11-10T06:50:12Z) that a failed merge gets no diagnose-and-fix round inside ship:

- The cases a code fix could help with already have their own routes since #896: a moved head goes to Step 9, and a conflict with `dev` goes to Step 3.
- A red CI run already goes to the Failure Path from the Step 10 merge gate (`runs gate` exit 12), unless every failed CI step is a generated file.
- `/bkit-debug` is the tool for a red CI run at ship time, because it reads the CI run's evidence, reproduces the failure as a failing test and soaks unknown causes, which Steps 11-12 never did.

**Goals:**

- Remove Steps 11-12, every route and sentence that names them, and their step keys from the engine, the workflow checks and the docs.
- Renumber Steps 13-14 to 11-12, so the step numbers stay contiguous.
- Keep status files written before the change readable: `bkit status resume` and `bkit workflows summary` still handle their `ship-failure-*` rows.
- Name `/bkit-debug {FID}` as the next step when ship stops on a red CI run: the Step 2 CI wait on a PR ship opened, the Step 10 merge gate (including a Stop at the Merge Question on a used-up red run) and the post-merge squash capstone. Today neither the failure comment nor the final message names a next step.
- Keep the shared agents `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate`, which build and debug still use.

The two `docs/failures.jsonl` rows the issue cites (`ship-failure-diagnose-remediate-steps-reachable-only-on-resume`, `ship-failure-diagnose-invoked-without-strategy`) exist on local `dev` only and are not in this branch's base (`f6914f3c9`).

**Related Issues:**

- #911 — Ship: a failed merge never reaches the diagnose and fix steps (OPEN)
- #750 — Workflow optimisation (OPEN)
- #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (OPEN)
- #904 — Question advisor: a fresh top-tier agent behind every owner question (OPEN)
- #896 — feat(842-ship-fails-local): ship no longer fails when the local branch differs from GitHub's (MERGED)
- #902 — Show every choice made without asking in each workflow's summary (OPEN)
- #849 — WS-9 retires ship Step 13 (Update Local Dev), which renumbers ship again (OPEN); sequence it after this change and rebase its step numbers on this plan's 1-12 numbering
- #811 — Failure Path flush (OPEN); overlaps § Failure Path in `bkit-ship.md` and `.bkit/core/.bkit/workflows.md`

---

### Narrative

The owner runs `/bkit-ship` on a PR whose CI is red; ship stops at the merge gate and names `/bkit-debug {FID}` as the next step, and the workflow holds no diagnose or fix step that no route reaches.

### Success Criteria

1. `bkit-ship.md` has no Failure Diagnose or Failure Remediate step and names no `ship-failure-*` key.
2. Ship's steps are numbered 1-12 in the workflow, the step table and the docs.
3. A red CI run at the Step 2 CI wait, the merge gate or the post-merge capstone ends with `Next step: /bkit-debug {FID}` in the failure comment and the final message, and an owner's Stop at the Merge Question on a used-up red run ends with it in the handover and the final message.
4. `bkit status resume` and `bkit workflows summary` exit 0 on a status file holding `ship-failure-*` rows, and resume lands at the merge step.
5. `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate` keep serving build and debug unchanged.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the `Strategy` field (`STANDARD` / `PIVOT` / `FINAL`) from the build and debug fix loops | No Success Criterion, test row or scope bullet needs it: ship's missing-`Strategy` defect ends with Step 11, and the owner's scope says "Nothing else is needed for it"; the issue's References say #911 "does not wait for" #907 | #907 (deferral `911-ship-strategy-field-removal-via-907`) |

## Where it fits

- Group 1: Remove ship Steps 11-12 — done
  - TASK 1: Remove the ship failure steps from the engine and renumber ship to 12 steps there — done
  - TASK 2: Remove Failure Diagnose and Failure Remediate from the ship workflow, and renumber Steps 13-14 to 11-12 — done
- Group 2: Name `/bkit-debug` when ship stops on a red CI run — done
  - TASK 3: Add `--next-step` to `bkit workflows fail`, and refresh the capability register for this change's engine edits — done
  - TASK 4: Hold `NEXT_STEP` = `/bkit-debug {FID}` on every red-CI stop in ship, and pass it through the Failure Path and the Merge Question — done
- Group 3: Docs and hand-authored copies — this group
  - TASK 5: Rewrite the bkit docs that ship with the package — open
  - TASK 6: Rewrite the repo docs, the shipped `pre-push` comment and the hand-authored `utility-pre-release-check` copies — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Rewrite the bkit docs that ship with the package
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: every item in its `Documentation Updates` row, including every ship Step 13/14 citation, the `ship.merge` Asks column (line 1012), the merge-loop row (line 1673) and the § Failure Path `workflows fail` signature (line 801, gains `[--next-step=]`)
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the cross-phase reuse sentence drops "Ship Steps 11-12" and "in-ship merge failures"
  - **UPDATE:** `.bkit/core/.bkit/README.md`: the Ship row's step count 14 → 12
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: the `§ \`/bkit-ship\` — 14 steps` reference → 12 steps
  - **UPDATE:** `.bkit/instructions.md`: the `failure-path` local entry for `.bkit/core/.bkit/workflows.md` § Failure Path (around line 9612), rewritten by hand to match the new signature, per knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** `grep -n 'ship-failure\|Ship Steps 11\|bkit-ship\` — 14\|14 steps\|Failure Diagnose\|Failure Remediate fix' .bkit/core/.bkit/workflows.md .bkit/core/.bkit/prompts.md .bkit/core/.bkit/templates.md`prints nothing; every remaining hit of`grep -n 'Step 1[34]' .bkit/core/.bkit/workflows.md`names a build or debug step, not a ship step;`grep -n '| Ship | \`/bkit-ship\` | 12 |' .bkit/core/.bkit/README.md`prints one line;`grep -n 'next-step' .bkit/core/.bkit/workflows.md`hits the § Failure Path signature;`pnpm tsx .bkit/core/engine/tools/instructions.ts`(check) passes;`pnpm tsx .bkit/core/engine/cli.ts upgrade`refreshed the mirrors, and`pnpm tsx .bkit/core/engine/cli.ts check` reports no mirror drift
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Rewrite the repo docs, the shipped `pre-push` comment and the hand-authored `utility-pre-release-check` copies
  - **UPDATE:** `docs/testing.md`: "canonical 14 step keys" → 12; the pre-merge push list drops "Failure Remediate"
  - **UPDATE:** `docs/setup.md`: the `§ \`/bkit-ship\` — 14 steps` reference → 12 steps
  - **UPDATE:** `docs/deployments.md`: line 345 drops "and a Failure Remediate fix"; the Step 14 citations at lines 611 and 634 → Step 12 (a project-owned file; no managed block)
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: the `§ \`/bkit-ship\` — 14 steps`anchor in the`--scope=pr` comment (line 116) → 12 steps
  - **UPDATE:** `.husky/pre-push`: the same comment (line 173), with the same text as the template line
  - **UPDATE:** `.bkit/instructions.md`: the pre-release-check example names a debug step (`debug-failure-remediate` must read `debug-failure-diagnose`) instead of `ship-failure-remediate`
  - **UPDATE:** `.claude/agents/utility-pre-release-check.md`: the same example, by hand
  - **UPDATE:** `.opencode/agents/utility-pre-release-check.md`: the same example, by hand
  - **UPDATE:** `.codex/agents/utility-pre-release-check.toml`: the same example, by hand
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -rn 'ship-failure\|Failure Remediate fix\|bkit-ship\` — 14' docs/testing.md docs/deployments.md docs/setup.md .bkit/templates/.husky/pre-push .husky/pre-push .bkit/instructions.md .claude/agents/utility-pre-release-check.md .opencode/agents/utility-pre-release-check.md .codex/agents/utility-pre-release-check.toml`prints nothing;`grep -n 'Step 14' docs/deployments.md`prints no ship citation; the three agent copies hold the same example line;`pnpm tsx .bkit/core/engine/cli.ts upgrade`ran and`pnpm tsx .bkit/core/engine/cli.ts check`exits 0 with no managed-block drift;`pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` passes
  - **TEST FIRST:** n/a — docs and agent prompt wording only, no behaviour change

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Remove Failure Diagnose and Failure Remediate from the ship workflow, and renumber Steps 13-14 to 11-12 — `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`, `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`
- TASK 4 (group 2, done): Hold `NEXT_STEP` = `/bkit-debug {FID}` on every red-CI stop in ship, and pass it through the Failure Path and the Merge Question — `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`
