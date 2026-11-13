# Brief: group 4 — Docs and generated copies

Plan: Build: Owner's Fix Now Answer Reaches the Agents and the Summary Implementation Plan

## Why and what

### Context & Goals

The owner answers at `/bkit-build`'s Decision Pause, and a later step ignores the answer. The issue has four parts; this plan covers the three that can be scoped today and states what Part 3 holds as of 2026-11-11.

<!-- prettier-ignore -->
| Part | Defect | Where (re-check after #891 merges) |
| --- | --- | --- |
| 1 | A `Fix now` answer with a direction on a `**Fixable:** false` challenge task never reaches the build agents. Decision Pause step 5 keeps the task "as it is", so its `DONE WHEN` and `TEST FIRST` still describe the option the owner turned down. `tests red` reads the plan's `TEST FIRST`, so a test writer that follows the owner records the wrong test `missing`, and one that follows the plan logs `BLOCKED`. A hard blocker answered `Fix now` with no direction has no route. | `.bkit/core/workflows/bkit-build.md` § Decision Pause steps 4-6, Contract **Owner decisions** bullet |
| 2 | `buildSummary` clears a failed group only through a later passing verify of the **same** group. After a verify-gaps pause answered `Fix now`, the fix runs as a new task in a new group, the old group is never verified again, and its `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` FAIL rows stay. Every such run summarises as FAIL and Step 15 sends it to the Failure Path with no PR. Nothing links a `Fix now` item to the task that carries its fix. | `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts` (the `answer` lookup); `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts` |
| 3 | Whatever #891's build leaves undone. #891 is not shipped: `feat/891-build-gate-stuck` has all 22 plan tasks ticked and holistic verify attempt 5 `PASS`, and its remaining steps (challenge, final run, summary, ship) are still to run. Compared with its issue body, the parts it does not deliver were dropped by the owner's rescope (accept-once of base-red tests, `/bkit-ship` showing them) or recorded as its own deferrals. None of them is an owner answer that a later step ignores, except the headless `Stop` route its plan lists as a scope candidate. | Open Question Q1 |
| 4 | `RESOLVED_BY` has no entry for `build/build-failure-remediate` or `debug/debug-failure-remediate`. A test-fix step that ends FAIL (for example because the machine-wide tests lock blocked its own confirming re-run) stays a summary failure even when the next full test run passes on the same scope. `/bkit-debug` reaches its summary in that state: Step 7 → Step 3 (`TEST_VERDICT` = PASS) → Step 9 → Step 10. | `RESOLVED_BY` and the `answer` lookup in `.bkit/core/engine/commands/workflow/summary.ts` |

**Goals:**

- The plan's task block is the one place a `Fix now` direction reaches the test writer, the code writer, `tests red` and verify.
- The decision file records which task carries each `Fix now` item's fix, so the summary can check that evidence instead of guessing.
- The summary clears a failure only on evidence its contract assesses (`.bkit/workflows.md` § Summary / handover step, **Resolution evidence**), and keeps it when evidence is missing.

**Checks the issue asks for (Part 1's "also check"):**

- **Steps 8-10:** Step 8 verify (`@bkit-build-plan-verify`) and Steps 9-10 gap remediation (`@bkit-build-plan-gaps-remediate`) already get the decision file in their `Read:` lists and read its `Decision:` lines (`.bkit/core/.bkit/workflows.md` § Decision Pause **Fixer reads the answer**; `bkit-build-plan-verify.md` and `bkit-build-plan-gaps-remediate.md` decision-record clauses). Step 8 also judges against the rewritten task block, so no Step 8-10 prompt changes.
- **`/bkit-debug`:** it has no Decision Pause. Its only owner question is the **Loop Question** (`bkit-debug.md` § Loop Question: `Try again` or stop), which has no `Fix now` answer, so Part 1 does not reach it.
- **Contract-change trace (`.agents/rules.md` § Contract changes):** `grep -l 'build-decision-'` over `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` finds only `bkit-build.md`. `grep -l 'Decision:'` over the same folders also finds `bkit-build-plan-verify.md` and `bkit-build-plan-gaps-remediate.md`, which read `Decision:` lines only, so a new `Fix task:` line changes nothing for them; the other hits (`bkit-design.md`, `bkit-plan.md`, `bkit-design-update.md`, `bkit-plan-update.md`, `bkit-debug-failure-diagnose.md`, `bkit-audit-gates.md`) use `Decision:` for their own records, not the build decision file. In the engine, `challenge merge` and `challengeResolution` read the decision file through `parseDecisionItems`, which keeps every existing field. On the resume path, a run resumed after step 5 wrote a task block but before step 6 wrote its `Fix task:` line keeps the group's FAIL, which is the safe side; the per-group loop and the remediation paths read no new field.

**Related Issues:**

- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (open)
- #899 — Build: owner's Fix now direction never reaches the build agents (closed)
- #900 — Build: summary says FAIL after Fix now moved a group's gaps elsewhere (closed)
- #864 — Move project docs to templates with adoption warnings (open)
- #843 — Friction triage (open)

---

### Narrative

The owner answers `Fix now` at `/bkit-build`'s Decision Pause, giving a direction where the item needs one, and the build builds that direction, and the summary credits the verified fix instead of reporting FAIL. A test-fix step that ended FAIL no longer fails the summary once the next test run on the same scope passes.

### Success Criteria

The owner approved this wording at plan approval; it is drawn from the issue's `What should happen` text for Parts 1, 2 and 4.

1. A `**Fixable:** false` challenge task answered `Fix now` with a direction has its `DONE WHEN` and `TEST FIRST` rewritten to that direction before Step 7 runs.
2. A hard blocker answered `Fix now` with no direction gets a follow-up question, and no task is built for it until the owner gives the direction.
3. A group whose verify pause answered every item, with each `Fix now` task ticked and verified `PASS` in its own group after the pause, has no FAIL reason in `workflows summary`; each accepted item stays a concern. A verify pause that answered every item `Accept`, with no `Fix now`, clears the same FAIL rows, and its accepted items stay a concern.
4. An unanswered item, a `Fix now` item with a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the paused group's FAIL.
5. A `build-failure-remediate` or `debug-failure-remediate` FAIL counts as resolved when a later test run in the same run passes with 0 failures on the same scope, and stays a failure without one.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The Part 4 rule for `debug-failure-soak`: debug Step 8 can finish FAIL and routes to Step 3, so a debug run can reach its summary with a soak FAIL that `RESOLVED_BY` has no entry for | Part 4 names only `build-failure-remediate` and `debug-failure-remediate`; no matrix row, edge case or decision needs the soak step. A soak iteration hunts an intermittent failure, so whether one later pass proves it gone is an owner decision, not a mechanical copy of Part 4. | Deferral `903-debug-soak-fail-resolved-by-later-passing-run` (`needs-decision`, options A-C in its `description`). |
| The Part 4 rule for the diagnose steps: `build-failure-diagnose` (build Step 13) and `debug-failure-diagnose` (debug Step 6) can end FAIL, and `RESOLVED_BY` has no entry for them, so a later passing test run on the same scope leaves the summary at FAIL | The issue names only the two remediate steps; no Success Criterion, matrix row, edge case or decision needs the diagnose steps. A diagnose step that ends FAIL may have found no cause at all, so whether a later pass settles it is an owner decision, beside the soak step's. | Deferral `903-diagnose-fail-resolved-by-later-passing-run` (`needs-decision`, options in its `description`). |

## Where it fits

- Group 1: A test-fix FAIL is cleared by the next passing test run (Part 4) — done
  - TASK 1: Resolve a failed test-fix step by a later passing test run on the same scope — done
- Group 2: A verified Fix now task or an Accept-only pause clears its paused group's FAIL (Part 2) — done
  - TASK 2: Parse the `Fix task:` line and the decision file's header block — done
  - TASK 3: Resolve a verify pause's group FAIL rows once each `Fix now` task is verified — done
  - TASK 4: Resolve a verify pause's group FAIL rows when every item is answered `Accept` — done
- Group 3: The Decision Pause carries the owner's Fix now direction (Part 1) — done
  - TASK 5: Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}` — done
- Group 4: Docs and generated copies — this group
  - TASK 6: Document the two resolution rules and the reshaped Decision Pause — open
  - TASK 7: Regenerate the built and mirrored copies — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Document the two resolution rules and the reshaped Decision Pause
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Summary / handover step **Resolution evidence** table gains the verify-pause group row (a `Fix now` pause with verified fix tasks, or an `Accept`-only pause; FAIL rows only; remediation warnings stay concerns) and the failed test-fix row (with the Q2 answer on the flake), and the existing "Failed group execution or gap remediation" row points at the new verify-pause row; § Decision Pause **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** bullets match Task 5, with **Fixer reads the answer** naming the task block for Step 7 and the decision file for Steps 8-10, and its `STANDARD → PIVOT → FINAL` sentence left as it is.
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/summary.test.ts` row's scope names the new resolution cases (the `Fix now` group, the `Accept`-only pause's group, the test-fix FAIL).
  - **DEPENDS ON:** 3, 4, 5
  - **DONE WHEN:** both table rows, the pointer on the existing row and the four bullets are in `.bkit/core/.bkit/workflows.md`, and the verify-pause row names the `Accept`-only case; the `docs/testing.md` row names all three cases; `pnpm prettier --check .bkit/core/.bkit/workflows.md docs/testing.md` passes; `.bkit/core/engine/tools/instructions-coverage.test.ts` still passes.
  - **TEST FIRST:** n/a — docs only, no behaviour change.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Regenerate the built and mirrored copies
  - **READ:** `.bkit/instructions.md`: run the no-flag check `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first; it must exit 0, because Task 5 already hand-edited the local entries.
  - **UPDATE:** `.bkit/workflows.md`: re-rendered by `pnpm bkit:generate` (its `bkit upgrade`).
  - **READ:** `dist/commands/workflow/summary.js`: with the rest of `dist/`, already rebuilt and staged by Tasks 1, 2, 3 and 4; `pnpm bkit:generate`'s `pnpm build` must leave it unchanged.
  - **READ:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: owned by Task 5; `pnpm bkit:generate`'s render must leave it unchanged.
  - **UPDATE:** `docs/capabilities.md`: refreshed by `pnpm bkit:generate` when graphify is installed.
  - **DEPENDS ON:** 6
  - **DONE WHEN:** `pnpm bkit:generate` exits 0; `pnpm bkit check` passes with no drift; `.bkit/workflows.md` holds Task 6's rows; `dist/commands/workflow/summary.js` contains `build/build-failure-remediate`; `git diff --exit-code dist/ .bkit/core/engine/render/__snapshots__/bkit-build.none.txt` shows no change from the generate run; dogfood replay: after `pnpm build`, a scratch folder holding `feat/864-move-project-docs:docs/plans/202611/logs/864-move-project-docs/status.jsonl` (Step 14 FAIL, then a passing `build-run-tests`) and its plan, run with `node dist/cli.js workflows summary --workflow=build --file={scratch status.jsonl}`, lists `build-failure-remediate` under `Resolved Findings`.
  - **TEST FIRST:** n/a — regenerated copies only, no behaviour change.

<!-- bkit:task 7 end -->

### Earlier tasks this group depends on

- TASK 3 (group 2, done): Resolve a verify pause's group FAIL rows once each `Fix now` task is verified — `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/summary.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`, `dist/commands/workflow/summary.js`
- TASK 4 (group 2, done): Resolve a verify pause's group FAIL rows when every item is answered `Accept` — `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/summary.test.ts`, `dist/commands/workflow/summary.js`
- TASK 5 (group 3, done): Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}` — `.bkit/core/workflows/bkit-build.md`, `.bkit/instructions.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Document the two new resolution rules and the reshaped `Fix now` | `.bkit/core/.bkit/workflows.md` | `grep -n 'Resolution evidence\|Fix now'` over `.bkit/workflows.md` and `.bkit/core/.bkit/workflows.md` | § Summary / handover step **Resolution evidence** table; § Decision Pause **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** bullets | EXTEND | Add two table rows and reword the four bullets; `.bkit/workflows.md` is re-rendered by `bkit upgrade`. |

### Architecture entries

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Summary / handover step and § Decision Pause bullets read on HEAD.
- **Resolution evidence** table: add a row "Failed group execution, verification or gap remediation before a verify pause that answered every item `Fix now` or `Accept`" → "The pause's decision file answers every item, and each `Fix now` item's `Fix task` is ticked and covered by its own group's later passing verification; a pause whose gap items are all `Accept` needs no fix task. Accepted items remain concerns." Add a row "Failed test-fix step (build Step 14, debug Step 7)" → "A later passing test run with 0 failures on the same scope as the run the fix followed", plus the flake wording Q2 settles. The `Fix now` row clears FAIL rows only; remediation warnings stay concerns.
- The existing row "Failed group execution or gap remediation → The latest passing verification of the same group" gains a pointer to the new `Fix now` row, so an agent does not read same-group verification as the only evidence.
- Decision Pause bullets: **Fix now** (a challenge task is rewritten to the owner's direction in place, keeping its meta line; each item gets a `Fix task:` line), **Hard blockers** (`Fix now` needs the owner's direction), **Record** (the item layout gains `Fix task: {N}`), **Fixer reads the answer** (Step 7's agents read the direction from the task block in their brief; Steps 8-10 keep reading the decision file's `Decision:` lines). The bullet's `STANDARD → PIVOT → FINAL` sentence stays as it is (#907 owns it).

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists; § Counter derivation test coverage row for `commands/workflow/summary.test.ts` read.
- Extend the `summary.test.ts` row's scope with "a verify pause's `Fix now` group resolved by its verified fix tasks, and an `Accept`-only pause's group resolved by the pause; a test-fix FAIL resolved by a later same-scope passing run".
