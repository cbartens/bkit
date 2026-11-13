# Brief: group 3 — The Decision Pause carries the owner's Fix now direction (Part 1)

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
- Group 3: The Decision Pause carries the owner's Fix now direction (Part 1) — this group
  - TASK 5: Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}` — open
- Group 4: Docs and generated copies — next
  - TASK 6: Document the two resolution rules and the reshaped Decision Pause — open
  - TASK 7: Regenerate the built and mirrored copies — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4 route (a hard blocker answered `Fix now` with no direction still lacks a decision), step 5 **Fix now** challenge branch (rewrite `**DONE WHEN:**`, `**TEST FIRST:**` and the task's `Derived Test Matrix` rows to the owner's direction; keep number, title, group and meta line, `**Fixable:** false` included; no "runs as it is" branch, because every challenge-task item is a hard blocker), step 5 reuse (an item that already has a `Fix task:` line reuses that task and writes no second block), step 6 (`Fix task: {N}` under each `Fix now` item), the Contract **Owner decisions** bullet (reword its "only by reading the decision file" sentence: the decision file for `Accept`, `Try again` and `Stop`, the task block for a `Fix now` direction; the ban on restating answers in `Context` stays), and `### 🔒 Gate — Decision Pause` (`- [ ] Fix now tasks shaped to the owner's direction, each named on a Fix task line`).
  - **UPDATE:** `.bkit/instructions.md`: hand-edit the `#### bkit-build` local entries for every rewritten or added standing line (delete retired lines, add the new wording); `pnpm instructions:sync` cannot drop or rewrite a changed entry.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: four new cases in `describe("build")`, using the `section(build, /Decision Pause/)` helper. Each case asserts the instruction itself (the field names it rewrites, the `Fix task: {N}` line, the reworded contract), not the absence of "runs as it is".
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: re-rendered with `vitest run .bkit/core/engine/render -u`, which `.bkit/core/engine/render/trackers.test.ts` checks. This task is the snapshot's one owner.
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file bkit-build.md` before editing.
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: the `## The work` brief section that carries the rewritten block to Step 7's agents.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the Decision Pause section holds no "It runs as it is" for a challenge task; step 5's challenge branch names `**DONE WHEN:**`, `**TEST FIRST:**` and the `Derived Test Matrix` rows as rewritten and the meta line as kept; step 5 reuses a task an existing `Fix task:` line names; step 4's route names a hard blocker's `Fix now` with no direction; step 6 names `Fix task: {N}`; the Contract **Owner decisions** bullet names the task block as the carrier of a `Fix now` direction and no longer says a subagent learns the answers "only" from the decision file; `### 🔒 Gate — Decision Pause` holds the `Fix task` line item; the four new cases, the existing `a Fix now edit is checked with plan-check before the loop goes on` case and `.bkit/core/engine/render/trackers.test.ts` pass; `.bkit/core/engine/tools/instructions-coverage.test.ts` (`the repo` → `has no coverage findings`) and `.bkit/core/engine/tools/instructions.test.ts` pass; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a Fix now challenge task is rewritten to the owner's direction in place` fails on step 5's challenge branch naming no `**DONE WHEN:**`, `**TEST FIRST:**` and `Derived Test Matrix` rewrite of the challenge task
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a hard blocker answered Fix now with no direction is asked again` fails on step 4's route having no branch for a hard blocker's missing direction
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `each Fix now item records its Fix task line before the decision row is finished` fails on step 6 writing no `Fix task:` line, or step 5 not reusing the task an existing `Fix task:` line names
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the owner decisions contract names the task block as the Fix now carrier` fails on the Contract **Owner decisions** bullet naming only the decision file, or the Decision Pause gate having no `Fix task` line item

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 2 (group 2, done): Parse the `Fix task:` line and the decision file's header block — `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`, `dist/commands/workflow/decisions.js`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A `Fix now` direction on a challenge task reaches the build agents | `.bkit/core/workflows/bkit-build.md` | `grep -n 'Fix now\|build-decision-{RUN}'` over `bkit-build.md`; `grep -rln 'Deviations'` over engine, prompts and workflows; read `context.ts` brief writer (`## The work`, `## Deviations`); read Step 7-10 `Read:` lists | Decision Pause step 5 already shapes a new task block "by the owner's direction" — covers new tasks, missing the challenge task kept "as it is"; the brief's `## Deviations` section carries session run instructions, not per-task decisions | EXTEND | Step 5's challenge branch rewrites the task's `DONE WHEN` and `TEST FIRST` in place, the same way the new-task branch shapes them; the brief then carries it with no `Read:` change. |
| A hard blocker answered `Fix now` with no direction is asked again | `.bkit/core/workflows/bkit-build.md` | `grep -n 'still lacks a decision\|noRecommendation\|hard blocker'` over `bkit-build.md`; `.bkit/core/.bkit/workflows.md` § Decision Pause bullets | Decision Pause step 4 route "**If** any asked item still lacks a decision" → follow-ups — covers unanswered items, missing the direction rule | EXTEND | A hard blocker's `Fix now` without a direction counts as lacking a decision, so the existing follow-up branch asks for it. |

Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in docs/plans/202611/903-build-owner-s-plan.md § Reuse Inventory and § Architecture & Component Changes.
