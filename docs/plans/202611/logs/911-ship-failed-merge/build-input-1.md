## Session Prompt — this run's, newer than everything below

#911

## Issue description — oldest

### Failing test or CI run

none yet. Both defects were found by reading `.bkit/core/workflows/bkit-ship.md`. Neither has been seen in a run.

### What happened

`/bkit-ship` has two steps for a merge that fails: Step 11 — Failure Diagnose (an agent works out why) and Step 12 — Failure Remediate (an agent applies the fix). Read as written, they cannot do their job, for two separate reasons.

**1. No route leads to them.** Every route out of Step 10 — Merge Gate + Merge PR goes somewhere else (`bkit-ship.md:764-783`):

- merged → Step 13;
- the gate asks for a new CI run → Step 9;
- the branch needs the base merged in → Step 3;
- the limit is used up → the Merge Question or the Failure Path;
- anything else → the Failure Path.

Line 783 says it outright: "Recoverable merge refusals never enter Steps 11–12." No step routes to Step 11. Step 12 is named only by Step 11 and by the Resume rule in the header (`bkit-ship.md:42`). So the only way in is a resumed run whose last finished step happens to be 10 or 11.

A run that arrives that way is missing what Step 11 needs. Its sub-step 3 (`bkit-ship.md:861`) tests `MERGE_ASK` and narrates `MERGE_ROUNDS` and `MERGE_MAX`. Only Step 10's `counters route` call sets those three, and a resumed run does not hold them.

**2. Step 11 starts the diagnose agent without a value it requires.** The Context that Step 11 hands to `bkit-debug-failure-diagnose` names no `Strategy` (`bkit-ship.md:851-854`). The agent's prompt says what to do then (`.bkit/core/prompts/bkit-debug-failure-diagnose.md:67`): set `Verdict` = `FAIL`, change no other file, and return. So the diagnosis file comes back with every section still `PENDING`.

What follows depends on the setting `bkit.workflows.ship.merge.ask`:

- on → Step 11 asks the owner the Merge Question as if no clear cause had been found;
- off → Step 12 runs `bkit-debug-failure-remediate` against a diagnosis that contains no fix.

Build Step 13 and debug Step 6 pass `Strategy` to the same agent. Ship passes it only to the fix agent in Step 12.

### What should happen

One of two things, and the choice is the first thing to decide:

- **A failed merge gets a diagnose-and-fix round.** Step 10 routes to Step 11, Step 11 holds the three counter values itself, and the diagnose agent gets every value its prompt requires.
- **A failed merge does not get one.** Steps 11 and 12 are removed, together with the Merge Question's Step 11 entry (`bkit-ship.md:798`) and the `ship-failure-diagnose` / `ship-failure-remediate` step rows.

Either way, no step is left in the file that no route can reach.

### Steps to reproduce

Not reproduced. A first attempt:

1. In a test repo, start `/bkit-ship` on a PR whose merge is refused for a reason Step 10 treats as terminal.
2. Check which step runs next. The file says the Failure Path, never Step 11.
3. Separately, start `bkit-debug-failure-diagnose` with the Context from `bkit-ship.md:851-854` and check that it returns `FAIL` with a `PENDING` report.

### How often

Defect 1: every ship run whose merge fails. Defect 2: every run that does reach Step 11.

### Affected area

- `.bkit/core/workflows/bkit-ship.md` Step 10 (routes), Step 11, Step 12, the Merge Question and the Resume rule.
- `.bkit/core/prompts/bkit-debug-failure-diagnose.md` Process step 5.
- `.bkit/core/engine/commands/workflow/steps.ts` and `status.ts` (the step rows, and what `status resume` returns).

### Where and when

Read on `dev`, 2026-11-10, bkit 6.1.1.

### Evidence

- `docs/failures.jsonl` key `ship-failure-diagnose-remediate-steps-reachable-only-on-resume`
- `docs/failures.jsonl` key `ship-failure-diagnose-invoked-without-strategy`
- Not checked: whether `status resume` can return step number 11 at all. If it cannot, Steps 11 and 12 are fully dead.
- Not written down anywhere: why line 783 keeps recoverable refusals out of Steps 11-12 while the steps stay in the file.

### References

- #750 — Workflow optimisation (https://github.com/cbartens/bkit/issues/750): parent.
- #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (https://github.com/cbartens/bkit/issues/907): would remove the `Strategy` field, which ends defect 2 by another route. It is blocked and far off, so this issue does not wait for it.
- #904 — Question advisor: a fresh top-tier agent behind every owner question (https://github.com/cbartens/bkit/issues/904): its open question 6 is whether the advisor covers the Merge Question, which Step 11 asks.
- `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-build.md` Step 13, `.bkit/core/workflows/bkit-debug.md` Step 6

## Issue comment — posted 2026-11-10T06:11:17.000Z

**Label changed: `next:debug` → `next:design`**

Both defects were found by reading `bkit-ship.md`, and nothing has failed in a run, so debug has no failure to diagnose. The issue's first step is a choice between two options: wire a failed merge into Steps 11-12, or remove those steps. That choice is design's job (`.bkit/workflows.md:58`).

If the owner makes the choice in a comment here, design is no longer needed and the next step becomes `/bkit-plan 911`.

## Issue comment — posted 2026-11-10T06:50:12.000Z

### Owner decision: remove Steps 11-12 (design no longer needed)

**Decision:** a failed merge does not get a diagnose-and-fix round inside ship. Steps 11 and 12 are removed. When ship stops on a failure, the fix is a separate `/bkit-debug` run.

**Why.**

- **Nothing reaches the steps any more, and the cases that used to are now handled elsewhere.** Before #896, Step 11 ran only when the merge gate had passed (CI green) and GitHub still refused the merge. #896 moved the two cases a code fix could help with to their own routes: head moved after the gate → Step 9 (re-validate), conflict with `dev` → Step 3 (integrate). What is left goes to a stop: base not `dev`, PR not open, head unreadable, or GitHub refusing for a policy reason such as a missing review or a branch rule. An agent editing code cannot fix any of those.
- **A failing CI run never went to Step 11.** At least since `3b8d94681` (2026-10-11), the merge gate in Step 10 sub-step 1 sends a red run (exit 12) to the Failure Path, unless every failed step is a generated file, which ship regenerates. That is unchanged.
- **Debug is the right tool for a red CI run at ship time.** The change already passed build's local tests, so a CI failure in ship is usually CI-only (machine, environment, secrets, a test that fails at random), or new code brought in from `dev` by the Step 3 merge. `/bkit-debug` has steps for that which Steps 11-12 never had: Step 4 reads the actual CI run's evidence, Step 5 reproduces the failure as a failing test, and Step 8 soaks causes nobody has found yet. Steps 11-12 were diagnose and fix only, with no CI evidence and no `Strategy` value. Copying the rest of debug into ship would mean keeping two copies in step.
- Build keeps its own Steps 13-14. There the failing tests come from code the same run just wrote, with the plan at hand, so a diagnose-and-fix loop fits.

**Scope for the plan.**

- `.bkit/core/workflows/bkit-ship.md`: remove Steps 11 and 12, the Merge Question's "diagnosis found no clear cause" branch (keep the used-up-limit branch), the "Recoverable merge refusals never enter Steps 11-12" sentence, and Step 11/12 from the Resume rule. Renumber the steps that follow, or say why the numbers stay.
- Step names `ship-failure-diagnose` and `ship-failure-remediate`: remove from `.bkit/core/engine/commands/workflow/step-table.ts`, `steps.ts`, `.bkit/core/engine/checks/status-holes.ts`, their tests, the workflow checks (`ship-invariants.test.ts`, `workflow-shape.test.ts`, `counter-prose-audit.test.ts`) and the `bkit-ship.none.txt` snapshot.
- Docs that name the steps: `.bkit/workflows.md` and `.bkit/instructions.md`. `utility-pre-release-check` names them too; it is hand-authored in three copies (`.claude/agents/`, `.opencode/agents/`, `.codex/agents/`).
- Keep the shared agents `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate`. Debug uses both, and build Step 13 uses the diagnose agent.
- Status files from runs started before the change can still hold `ship-failure-*` rows. A resumed run, and `bkit workflows summary`, must still handle them.
- When ship stops on a red CI run, the stop message names `/bkit-debug {FID}` as the next step. Check whether the Failure Path handover already says this; add it if not.
- Defect 2 (Step 11 starting the diagnose agent without `Strategy`) goes away with Step 11. Nothing else is needed for it.

**Side effect:** #902's table loses its ship Step 11 row.

Next step: `/bkit-plan 911`.

## Issue comment — posted 2026-11-10T23:20:39.000Z

**Stays In review: Open Question 1 needs an owner answer.** It is the only question without a default.

`docs/plans/202611/911-ship-failed-merge-plan.md` passes `bkit tests plan-check` with 0 problems, but its Narrative and Success Criteria are marked "⚠️ MISSING". Open Question 1 asks whether to:

- **A:** adopt the proposed wording, or
- **B:** write your own.

Until that is settled, the plan has no Acceptance Scenario to build against. Open Questions 2 and 3 default to A (accept `unexpected` entries; all three red-CI stops name `/bkit-debug`).

Blocker note: this issue now blocks [#849 — Keep local dev synchronized after workflow close](https://github.com/cbartens/bkit/issues/849), [#894 — Show the progress line at step start and at task group boundaries](https://github.com/cbartens/bkit/issues/894) and [#913 — Owner Stop writes the full handover in debug, build and ship](https://github.com/cbartens/bkit/issues/913). All three change the ship step list or ship's Stop answer that this issue changes first. So answering Open Question 1 unblocks the most work in v6.2.

## Issue comment — posted 2026-11-13T04:07:19.000Z

Plan confirmed by the owner. The three owner confirmation boxes in `docs/plans/202611/911-ship-failed-merge-plan.md` are now ticked: Acceptance Scenario, Breaking Changes, and Open Questions & Assumptions.

- Commit: `49a2eee50` on local `dev` (docs only, not pushed yet).
- Outcome: the plan is ready for `/bkit-build`. Nothing blocks it.
- Watch for: the plan was written before `7ae1a3e8b` (#860), which changed `steps.ts`, `status.ts`, `bkit-ship.md` and the diagnose prompt. Some of the plan's line references are now out of date. The bug is still present, though: `bkit-ship.md:795` still keeps recoverable refusals out of Steps 11–12. The build's plan-currency check will decide whether the plan needs adjusting.

## Plan — docs/plans/202611/911-ship-failed-merge-plan.md — last committed 2026-11-13T04:07:03.000Z

<!-- bkit:anchor
baseSha: f6914f3c9c88e68faa4b8806406c0d562d2d6c7c
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

# Ship: remove the unreachable Failure Diagnose / Remediate steps Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

The owner runs `/bkit-ship` on a PR whose CI is red; ship stops at the merge gate and names `/bkit-debug {FID}` as the next step, and the workflow holds no diagnose or fix step that no route reaches.

### Success Criteria

1. `bkit-ship.md` has no Failure Diagnose or Failure Remediate step and names no `ship-failure-*` key.
2. Ship's steps are numbered 1-12 in the workflow, the step table and the docs.
3. A red CI run at the Step 2 CI wait, the merge gate or the post-merge capstone ends with `Next step: /bkit-debug {FID}` in the failure comment and the final message, and an owner's Stop at the Merge Question on a used-up red run ends with it in the handover and the final message.
4. `bkit status resume` and `bkit workflows summary` exit 0 on a status file holding `ship-failure-*` rows, and resume lands at the merge step.
5. `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate` keep serving build and debug unchanged.

### Process Sketch

- **WHEN** a ship run's merge gate finds the CI run red and regenerating cannot fix it, or the CI wait on a PR ship just opened ends with a failed check **→ THEN** the run takes the Failure Path, and the failure comment and the final message name `/bkit-debug {FID}` as the next step.
- **WHEN** the merge attempts are used up with `ship.merge.ask` on, in a session **→ THEN** the Merge Question asks Stop or Try again, and asks no diagnosis question; on a red run, Stop names `/bkit-debug {FID}` in the handover and the final message, and Try again clears it.
- **WHEN** the post-merge squash capstone is red at Close Workflow **→ THEN** the Failure Path names `/bkit-debug {FID}` the same way.
- **WHEN** GitHub refuses the merge for a reason no code fix can address **→ THEN** the run stops at the Failure Path naming the reason, and no diagnose or fix step runs.
- **IF** a run started before the change is resumed after a `ship-failure-diagnose` or `ship-failure-remediate` row **→ THEN** `bkit status resume` ignores those rows and resumes after the run's last `ship-merge-pr` row, which ship turns into a return to Step 3.
- **IF** `bkit workflows fail` gets a `--next-step` value that is not one line starting `/bkit-` **→ THEN** it exits 2 and writes nothing.

### Concrete Example

**Setup:** The owner runs `/bkit-ship 911-ship-failed-merge` in a session. The PR is open against `dev`, and CI at the validated head is red in a unit test (not a generated file).

**Steps:**

1. The run reaches Step 10 → `bkit runs gate` exits 12 with `regenerable` = false.
2. Step 10 holds `/bkit-debug 911-ship-failed-merge` as `NEXT_STEP` → the run takes the Failure Path.
3. The Failure Path runs `bkit workflows fail --post ... --next-step="/bkit-debug 911-ship-failed-merge"` → the issue gets a `### Workflow Failure` comment ending `Next step: `/bkit-debug 911-ship-failed-merge``.
4. The Failure Path flushes the book and stops → the final message ends with the same `Next step:` line.

**Outcome:** The owner sees, on the issue and in the session, that the PR's CI is red at Step 10 and that `/bkit-debug 911-ship-failed-merge` is the next command. No Failure Diagnose or Failure Remediate step ran, and `bkit-ship.md` has no such step.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A run started before the change is resumed after a `ship-failure-remediate` row with verdict `PASS` | `bkit status resume` ignores the row and prints `step` = `ship-merge-pr`, `number` = 10, `after` = `ship-merge-pr`; ship returns to Step 3, as for any merge-step resume |
| A run started before the change is resumed after a `ship-failure-diagnose` row | Same as above: the row places no resume point |
| `bkit workflows summary` reads a ship run holding `ship-failure-*` rows | The rows appear in the step table as any other row; the command exits 0 |
| The advisory hole detector (`bkit:audit:status`) reads a run holding `ship-failure-*` rows | The rows are listed under `unexpected`, no step is `missing` on their account, and the CLI still exits 0 |
| A regenerable red run (exit 12, `regenerable` = true) is fixed by `bkit branches regenerate` | The run re-validates at Step 9 as today; no `NEXT_STEP` is held |
| A regenerable red run is not fixed (`outcome` = `unchanged` or `undeclared`), or the merge attempts run out on it | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` |
| The merge attempts run out on a regenerable red run with `ship.merge.ask` off, or outside a session | The used-up arm holds `NEXT_STEP` = `/bkit-debug {FID}` and takes the Failure Path |
| The merge attempts run out on a regenerable red run with `ship.merge.ask` on, in a session | The arm holds `NEXT_STEP` = `/bkit-debug {FID}` before the Merge Question, which asks Stop or Try again with no diagnosis variant. `Stop` writes the handover with the line `Next step: /bkit-debug {FID}` and ends the final message with it; `Try again` clears `NEXT_STEP` and grants a fresh allowance |
| The merge attempts run out on a refusal that is not a red run (exit 11, 14 or 10), with `ship.merge.ask` on | The Merge Question asks Stop or Try again; no `NEXT_STEP` is held, so `Stop` names no next step |
| Ship opened the PR itself and the Step 2 CI wait ends with `prs checks` exit 1 and `failed` > 0, or the MCP fallback reads a failed check | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` |
| The Step 2 CI wait fails for a reason other than a failed check (no check, a pending check, `runs wait` timeout, unreadable rollup) | The Failure Path names the reason and no next-step line, as today |
| The Failure Path's `workflows fail --next-step` call exits 2 (the held value was refused) | The Failure Path re-runs the same `workflows fail` call without `--next-step`, so the run still records the failure, releases the lock and posts the comment |
| The merge gate refuses for a reason other than a red run (13, 15, 16, 18, 20) | The Failure Path names the gate's reason and no next-step line |
| `--next-step` holds a line break, or does not start with `/bkit-` | `bkit workflows fail` exits 2 (usage) before any write: no row, no lock release, no comment |
| `bkit workflows fail` runs without `--next-step`, or with an empty one (a value not held yet, as for `--fid` and `--token`) | `nextStep` prints null and the failure comment has no `Next step:` line, as today |
| The post-merge squash capstone is red at Step 12 (Close Workflow after the renumber) | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` (owner answer A, decision `911-ship-red-ci-next-step-flag`) |
| The post-merge capstone check exits non-zero for any other reason | The Failure Path names the reason and no next-step line, as today |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit-ship.md` has no Failure Diagnose or Failure Remediate step, names no `ship-failure-*` key, and its steps run 1-12 ending at Close Workflow | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |
| The Merge Question asks only when the merge attempts are used up, and `Try again` always grants a fresh allowance | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |
| The ship step-key set is the canonical 12 keys, with no `ship-failure-*` key written or named | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 2 |
| Close Workflow (Step 12) runs `workflows close` with `--flush` and `--branch=` | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 2 |
| `status route --require=strategy` is used at exactly four sites, none in ship | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |
| A run resumed after old `ship-failure-*` rows resumes at the merge step (Step 10), after `ship-merge-pr` | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Ship's progress line counts 12 steps (`Step 3/12 Base Check`, `Step 10/12 Merge Gate + Merge PR`, with and without the attempt suffix) | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| `bkit workflow progress` on a ship run prints 12-step lines (`Step 3/12 Base Check`, `Step 9/12 Re-validate`, `100% · Step 12/12 Close Workflow`) | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 1 |
| A pre-change run holding `ship-failure-*` rows reports them as `unexpected` and no step as `missing` | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 1 |
| `bkit workflows summary` on a ship run holding `ship-failure-*` rows still lists them and exits 0 after the removal (a regression guard: it passes before and after, so the code step lands it and `DONE WHEN` names it) | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| `workflows fail --next-step` adds a `Next step:` line to the failure comment and prints `nextStep` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
| `workflows fail` refuses a multi-line or non-`/bkit-` `--next-step` before any write, and treats an empty one as absent | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
| Every route that takes a red CI run to the Failure Path (Step 2 CI wait on a PR ship opened, Step 10 merge gate, Step 12 squash capstone) or to the Merge Question (a used-up regenerable red run) holds `/bkit-debug {FID}` as `NEXT_STEP`, and no other route does | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Merge Question's `Stop` arm writes `Next step: {NEXT_STEP}` into the handover and the final message when `NEXT_STEP` is held, and `Try again` clears `NEXT_STEP` | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Failure Path passes `--next-step` to `workflows fail` only when `NEXT_STEP` is held, and ends the final message with it after any verbatim `ship-summary.md` content | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Failure Path re-runs `workflows fail` without `--next-step` when the call exits 2 | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The rendered `none`-tracker ship workflow matches its baseline | Unit | `.bkit/core/engine/render/trackers.test.ts` (`bkit-ship.none.txt`) | 4 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Change | Kind | Who it affects | Handling |
| --- | --- | --- | --- |
| Ship Step 13 — Update Local Dev becomes Step 11, and Step 14 — Close Workflow becomes Step 12 (`--number=11` / `--number=12`, Gate 11 / Gate 12) | Renumber | Progress lines, tracker step comments, docs and tests that cite the numbers | Every in-repo citation is rewritten in the runbook; old tracker comments keep the old numbers as history (Assumption 4) |
| Step keys `ship-failure-diagnose` and `ship-failure-remediate` are removed from `WORKFLOW_STEPS.ship`, `ROW_FIELDS`, `SHIP_STEP_ORDER` and the canonical key set | Removed name | Status files written before the change | Resume ignores the rows; summary lists them; the hole detector lists them as `unexpected` (owner answer A, decision `911-status-holes-retired-ship-rows-unexpected`) |
| Decision `467-ship-step-names-frozen` changes from 14 names to 12 | Frozen-contract change | Anything that counts ship's keys | Same-key decision row; `CANONICAL_SHIP_STEP_KEYS` drops the two keys, and its comment drops "Keys are added, never renamed" in favour of the current rule |
| The `/bkit-ship` catalog heading `### \`/bkit-ship\` — 14 steps` becomes `— 12 steps` | Anchor change | Links to the heading's anchor | `docs/setup.md` and the `.husky/pre-push` comment are rewritten in Task 6, `.bkit/templates/.husky/pre-push` in Task 6, and `.bkit/core/.bkit/templates.md` in Task 5 |
| `bkit workflows fail` gains the optional flag `--next-step` and the output key `nextStep` | New name (additive) | Callers of `workflows fail` | Optional: without it, the output carries `nextStep: null` and the comment is unchanged |
| The Merge Question loses its "diagnosis found no clear cause" variant; it is asked only when the merge attempts are used up | Behaviour removal | Owners who read the question | The removed variant was reachable only from the removed Step 11 |
| The Failure Path's abort-handover subagent no longer reads `ship-failure-diagnose-*.md` / `ship-failure-remediate-*-log.md` | Removed input | The `bkit-debug-abort-handover` agent in ship | No new run writes these files; the agent's prompt is shared and unchanged |

**Naming review:** `--next-step` and `nextStep` follow `workflows summary`'s existing `nextStep` key; `NEXT_STEP` follows the workflow's held-name style (`LIMIT_NEXT`, `MERGE_ASK`).

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption:** Every `ship-failure-*` row in an old status file follows a `ship-merge-pr` row, because Step 11's finish used `--attempt-of=ship-merge-pr:current`. → If wrong, a resumed old run lands after its last earlier step instead of the merge step; ship still returns to Step 3 for any number from 3 to 10.
- **Assumption:** A run stopped between a `ship-failure-remediate` `PASS` row and its fix commit is too rare to need its own route, because Steps 11-12 have been reachable only on resume since #896. → If wrong, the uncommitted fix sits in the worktree when the resumed run returns to Step 3, and the owner commits or discards it by hand.
- **Assumption:** `bkit workflows summary` keeps its generic row handling, so a `FAIL` `ship-failure-diagnose` row in a resumed old run still makes a refreshed Step 6 summary `FAIL`, exactly as it does today. → If wrong (the owner wants old rows ignored), such a run stops at Step 6; a fresh `/bkit-ship` run starts a new run without the old rows and proceeds.
- **Assumption:** No external contract parses ship's step numbers: resume keys on step names, and old tracker comments that say "Step 13" or "Step 14" are history. → If wrong, a consumer script that matches `Step 13 — Update Local Dev` breaks after the renumber.
- **Assumption:** The two `docs/failures.jsonl` rows that describe these defects reach `origin/dev` through the owner's own push of local `dev`, and are closed by the ship of this change. → If wrong, the rows stay `OPEN` after the defect is gone, until a `/bkit-utility-update-failures` pass closes them.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Alternative | Why rejected |
| --- | --- |
| Wire a failed merge into Steps 11-12 (the issue's first option): route Step 10 to Step 11, hold the counters there, pass `Strategy` | The owner rejected it: no Step 10 refusal left after #896 is one a code fix can address, and a red CI run needs debug's CI evidence, reproduction and soak, which would have to be copied into ship and kept in step |
| Keep Steps 13-14 at their numbers and leave a gap | `runProgress` (`step-table.ts`) counts distinct step numbers and shows 100% only when a step's number equals that count, so Close Workflow would print `Step 14/12` and never reach 100%; `workflow-shape.test.ts` also holds the table to the headings |
| Map the old `ship-failure-*` rows in `RETIRED_STEPS` to `ship-merge-pr` | The resume point is the same without an entry: the existing rule ignores rows of steps a workflow no longer has, and the `ship-merge-pr` row before them already resumes at the merge step. An entry would only change `after`, which no ship text reads any more |
| Put the next step in the error text the Failure Path writes to `error.md` | It mixes the next command into `Error:` and depends on the orchestrator writing it every time; a flag puts the wording in one engine function with a test |
| A generic `--line` flag on `workflows fail` (as on `issues comment`) | It would work, but leaves the `Next step:` wording to each workflow; `--next-step` gives one format, a validated value and a printed `nextStep` the final message can reuse |
| Teach the hole detector the retired step names | The owner rejected it (decision `911-status-holes-retired-ship-rows-unexpected`): the build workflow's retired `build-challenge-*` rows already show as `unexpected`, `unexpected` never changes a verdict, and the CLI exits 0 |
| Have `bkit workflows fail` derive the next step from the step key (red-CI steps map to `/bkit-debug`) instead of a `--next-step` flag | Fewer call sites to keep in step, but the engine cannot tell a red-CI stop from another failure of the same step (Step 10 fails for many reasons), so the workflow would still have to pass which arm it took; the explicit flag matches the existing held-value pattern. Noted for the owner |
| Drop an invalid `--next-step` with a warning instead of exiting 2 | It keeps the run from stranding, but a silent drop hides a malformed workflow line; the Failure Path re-runs the call without the flag on exit 2 instead (Edge Cases) |

**Recommendations for a future phase:**

- #907 removes the `Strategy` field from the fix loops; nothing here depends on it.
- #902's per-workflow table of choices made without asking loses its ship Step 11 row.
- Build Steps 13-14 keep their own diagnose-and-fix loop, because the failing tests there come from code the same run just wrote.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the `Strategy` field (`STANDARD` / `PIVOT` / `FINAL`) from the build and debug fix loops | No Success Criterion, test row or scope bullet needs it: ship's missing-`Strategy` defect ends with Step 11, and the owner's scope says "Nothing else is needed for it"; the issue's References say #911 "does not wait for" #907 | #907 (deferral `911-ship-strategy-field-removal-via-907`) |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Close the two failure rows this change fixes (`ship-failure-diagnose-remediate-steps-reachable-only-on-resume`, `ship-failure-diagnose-invoked-without-strategy`) | `docs/failures.jsonl` on local `dev`, not in this branch's base | The defects Tasks 1-2 remove | Keep for `/bkit-utility-update-failures` after the rows reach `origin/dev` (Assumption 5) |
| Tell the owner at `/bkit-ship` when a red PR CI check also fails on the base commit | `docs/deferrals.jsonl` `891-ship-base-red-notice` (`OPEN`, `LOW`) | The Step 10 red-run route Task 4 edits | Keep deferred; it adds advice beside `NEXT_STEP` and needs its own issue |
| The `none`-tracker render baselines miss the read-only helper recovery text | `docs/failures.jsonl` `workflow-none-render-baselines-miss-read-only-helper-recovery` (`OPEN`) | Tasks 2 and 4 regenerate `bkit-ship.none.txt` only; all five `*.none.txt` baselines in this tree already hold "Read-only helper recovery", so the row looks stale | Verify it; if stale, close it through `/bkit-utility-update-failures`. Do not fold it into this plan |
| #849 retires ship Step 13 (Update Local Dev) in WS-9 | `related-issues.md` | The same step table, the renumbered citations and the `/bkit-ship` heading's step count | Keep separate; sequence #849 after #911 and rebase its step numbers on 1-12 |
| #811 Failure Path flush | `related-issues.md` | § Failure Path in `bkit-ship.md` and `.bkit/core/.bkit/workflows.md`, which Task 4 and Task 5 edit | Keep separate |
| `.bkit/core/.bkit/prompts.md` says "Build Steps 12-13" for the steps build numbers 13-14 | Found while planning | The sentence Task 5 edits for ship | Needs a human decision: fixing it is outside #911's scope, but it sits in the same sentence |
| Promote the status-hole detector from advisory to gate | `docs/deferrals.jsonl` `384-promote-status-hole-detector-from-advisory-to-gate` | `checks/status-holes.ts`, which Task 1 edits; a gate would turn old `unexpected` rows into failures | Keep deferred; if promoted, teaching the detector the retired names (the alternative decision `911-status-holes-retired-ship-rows-unexpected` rejects) becomes required |
| Whether the question advisor covers the Merge Question | #904 (open question 6) | The Merge Question Task 2 trims | Keep in #904; the trimmed question is still the one #904 asks about |
| #902's table of choices made without asking | #902 | Ship's old Step 11 row in that table | Note on #902; no file in this branch holds the table |

## Security & Privacy

- [ ] **User Input** — `bkit workflows fail --next-step` is validated in `failVerb`, the handler that receives it, before any write: one line starting `/bkit-`, else exit 2. The value goes into a tracker comment inside backticks.

None of the other rows apply — no new API route, DB table, role-gated mutation, PII, redirect URL, webhook, or secret.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** No package is added or removed; `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-10) lists dev-only minor and major bumps (`oxlint` 1.89.0 → 1.90.0, `oxlint-tsgolint`, `vitest` and `@vitest/coverage-v8` 5.0.5 → 5.1.0, `@types/node` 24 → 26, `vite` 6 → 8); none blocks this change. Toolchain: Node v24.16.0 (`engines.node` `>=24`), pnpm 10.34.7 (matches `packageManager`), `gh` 2.102.0.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** Every file the runbook names was opened in this session. No user information is missing.
- [ ] **Project Context:** Read `docs/decisions.jsonl` (`467-ship-step-names-frozen`, `842-ship-revalidates-moving-base-before-merge`, `715-lite-workflows-retired`) and `docs/knowledge.jsonl` (`renumbering-a-workflow-leaves-instructions-md-local-entries-stale`: a renumbered workflow's `- source:` block in `.bkit/instructions.md` must be rewritten by hand before `pnpm instructions:sync` passes).
- [ ] **Testing & Quality:** Every behaviour is a Unit row (engine commands in process, markdown invariants, the render baseline), except the `bkit workflow progress` CLI wiring, which is an Integration row (`progress.integration.test.ts` drives the CLI), per `docs/testing.md` § Which tier does a behaviour need?. No row crosses a database, network or model boundary. The planning run could not execute tests: the machine `tests` lock was held by another checkout's `bkit:gate:changed` run.
- [ ] **Render baselines clean before build:** `pnpm vitest run .bkit/core/engine/render/trackers.test.ts` passes on the unchanged tree. All five `*.none.txt` baselines already hold "Read-only helper recovery", so it is expected to pass. **If** another baseline fails → that drift predates this change: report it to the owner, and scope the `trackers.test.ts` `DONE WHEN` clauses to the `bkit-ship` case, instead of regenerating the other baselines here.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** Not applicable — no credential or env var is added.
- [ ] **Schema State:** Not applicable — no database. The `status.jsonl` row shapes in `.bkit/workflows.md` § `status.jsonl` — workflow state SoT are unchanged; only two step names stop being written.
- [ ] **Architecture & UI:** No new file kind, so `docs/architecture.md` needs no change; no UI.
- [ ] **Observability:** No log, audit table or trace is added. The failure comment gains one optional `Next step:` line; `[bkit-*]` stderr prefixes are unchanged.
- [ ] **Notifications:** Not applicable — `.agents/docs.md` lists no notifications doc, and the tracker comment kind (`failure`) is unchanged.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

No database. The plan reads and writes `status.jsonl` only through existing commands, and changes no row shape.

### Data Schema Usage

- **Input (Read):** `status.jsonl` `step-done` rows (`step`, `verdict`, `attempt`) through `bkit status resume`, `bkit workflows summary` and `checks/status-holes.ts`.
- **Output (Write):** the `status.jsonl` `workflow-failed` row through `bkit workflows fail`, unchanged; the tracker failure comment body gains an optional `Next step:` line.

### Data Schema Changes

None — `ship-failure-diagnose` and `ship-failure-remediate` rows stop being written, and old rows stay valid input.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Name the next command on a workflow's failure comment | `.bkit/core/engine/commands/workflow/workflows.ts` | `grep -rln '/bkit-debug' .bkit/core/engine` (no hit in the fail or comment code); `grep -n 'lines?:' commands/workflow/issues.ts`; `grep -n 'nextStep' commands/workflow/summary.ts commands/workflow/workflows.ts`; `grep -n '"line"' commands/workflow/*.ts` | `workflows fail` (`workflows.ts`) builds the comment through `buildComment` (`issues.ts`), whose `CommentInput.lines` already appends raw lines after the links; `issues comment --line` feeds it; `workflows summary` prints a `nextStep` | EXTEND | Add `--next-step` to `fail`: validate it, pass `Next step: \`{value}\`` through `CommentInput.lines`, print `nextStep` |
| Hold the next command on every red-CI stop in ship | `.bkit/core/workflows/bkit-ship.md` | `grep -n 'exit 12\|regenerable\|Failure Path' .bkit/core/workflows/bkit-ship.md`; read Step 10 sub-step 1, Step 14 sub-step 1 and the Failure Path | Step 10 sub-step 1 already splits exit 12 by `regenerable`; the Failure Path already holds optional flags (`--max-exceeded`, `--pr`) | EXTEND | Hold `NEXT_STEP` on the Step 2 failed-check arms, the Step 10 exit-12 arms (Failure Path and Merge Question) and on a red squash capstone; pass it to `workflows fail`; end the final message (and the Merge Question's Stop handover) with it |
| Resume a pre-change run past its `ship-failure-*` rows | `.bkit/core/engine/commands/workflow/step-table.ts` | `grep -rn 'RETIRED_STEPS\|WORKFLOW_STEPS' .bkit/core/engine`; read `resumePoint`; read `step-table.test.ts` "ignores plan rows for steps the plan workflow no longer has" | `resumePoint` ignores rows of steps the table lacks; `RETIRED_STEPS` maps rows that still place a resume point | EXTEND | Delete the two rows from `WORKFLOW_STEPS.ship` and renumber; the existing ignore rule covers old rows, so no `RETIRED_STEPS` entry |
| Ship's step-key set without the failure steps | `.bkit/core/engine/checks/status-holes.ts` | `grep -n 'RETRY_LOOP_STEPS\|SHIP_STEP_ORDER\|MERGED_ON_ENTRY_SKIP' checks/status-holes.ts` | `SHIP_STEP_ORDER`, `RETRY_LOOP_STEPS` and their uses in `computeMandatoryForPath` / `detectHoles` | EXTEND | Drop the two keys from `SHIP_STEP_ORDER`, delete `RETRY_LOOP_STEPS` and its filters, fix the header comment's step numbers |
| Row fields and loop budget without the failure steps | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n 'ship-failure' commands/workflow/steps.ts` | `ROW_FIELDS` (two entries) and `progressPoint` (one list) | EXTEND | Delete the two `ROW_FIELDS` entries and drop the two names from the `ship.merge` list |
| One Merge Question variant | `.bkit/core/workflows/bkit-ship.md` | `grep -n 'LIMIT_NEXT\|calling step\|diagnosis' .bkit/core/workflows/bkit-ship.md` | The Merge Question's `LIMIT_NEXT` branch already covers the used-up limit | EXTEND | Keep the used-up-limit question as the only one; fold the two `Try again` arms into the grant arm |

## Architecture & Component Changes

Sources only: `.bkit/core/workflows/`, `.bkit/core/.bkit/` and the engine. The mirrors (`.bkit/workflows.md`, `.bkit/prompts.md`, `.bkit/README.md`, `.bkit/templates.md`, `.bkit/cli.md`, `.claude/commands/bkit-ship.md`, `.cursor/`, `.opencode/`, `.agents/skills/bkit-ship/SKILL.md`, `.agents/plugins/bkit/skills/bkit-ship/SKILL.md`) and `dist/` are regenerated by the `REGEN` procedure (`Agent Execution Runbook`) in Tasks 2 and 4, and by `pnpm tsx .bkit/core/engine/cli.ts upgrade` in Tasks 3, 5 and 6, never hand-edited. `docs/deployments.md`'s managed block is rendered from `.bkit/shared/docs/deployments.md` the same way.

**Ledger rows:** `911-ship-failed-merge-steps-removed`, `911-ship-steps-renumbered`, `467-ship-step-names-frozen`, `911-ship-red-ci-next-step-flag`, `911-ship-strategy-field-removal-via-907`, `911-status-holes-retired-ship-rows-unexpected`

### Database Migrations

None — no database.

### Workflow

The ship workflow loses Steps 11-12, renumbers 13-14 to 11-12, and holds `NEXT_STEP` on every red-CI stop.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** the file exists (984 lines).
- **Header:**
  - **Resume:** delete the sentence "`after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS."; the shared clause and the Step 3 return stay.
  - **Limits:** replace "Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides." with "Within the limit, ship never asks."
  - **Locks** and **Worktrees:** "Step 14" → "Step 12".
- **Failure Path:**
  - Step 1: add `--next-step="{NEXT_STEP}"` to the `workflows fail` fence, with "drop `--next-step` when `NEXT_STEP` is not held" in the flag list.
  - Step 1 `Route:`: "**If** exit 2 **and** `--next-step` was passed → re-run the same block without `--next-step`, then route on that exit." This keeps a refused value from leaving the run `IN_PROGRESS` with the lock held.
  - **[DELETE]** Step 4: the two `ship-failure-*` globs in the abort-handover `Read:` line.
  - Step 6: "**If** `NEXT_STEP` is held → end the final message with the line `Next step: {NEXT_STEP}`, after the verbatim `ship-summary.md` content and as the message's last line."
- **Step 2:**
  - The MERGED route "→ Step 13" → "→ Step 11".
  - Sub-step 5 (CI wait on a PR ship opened): drop `>/dev/null` from `prs checks`, hold `failed` as `CHECKS_FAILED`, and add "**If** exit 1 **and** `CHECKS_FAILED` > 0 → the CI run is red; hold `NEXT_STEP` = `/bkit-debug {FID}` → **Failure Path**." before the final `Else`. The exit-80 MCP arm splits the same way: any failed check → hold `NEXT_STEP` → **Failure Path**; no check or a pending check → **Failure Path** with no `NEXT_STEP`.
- **Step 10 sub-step 1:**
  - Regenerable arm (exit 12, `regenerable` = true): the regenerate `Else` arm holds `NEXT_STEP` = `/bkit-debug {FID}` when `REGEN_OUTCOME` = `unchanged` or `undeclared`, then → **Failure Path**; the used-up `Else` arm (exit 1) holds it too.
  - Regenerable arm, exit 1 **and** `MERGE_ASK` = true: hold `NEXT_STEP` = `/bkit-debug {FID}` before → **Merge Question**.
  - New arm before the final `Else`: "**If** exit 12 → the CI run is red; hold `NEXT_STEP` = `/bkit-debug {FID}` → **Failure Path**."
  - The final `Else` lists 13, 15, 16, 18 or 20.
- **Step 10 sub-step 4:** "→ Step 13" → "→ Step 11"; **[DELETE]** "Recoverable merge refusals never enter Steps 11–12."
- **Merge Question:**
  - Lead line: "Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)."
  - Q1 keeps only the used-up-limit wording; **[DELETE]** the `**Else**` variant.
  - The two `Try again` arms become one: grant, clear `LIMIT_NEXT` and `NEXT_STEP`, go to the step `LIMIT_NEXT` named.
  - `Stop` arm: **If** `NEXT_STEP` is held → the handover gains the line `Next step: {NEXT_STEP}` after the resume line, and the final message ends with the same line.
- **[DELETE]** `## 🧠 Step 11 — Failure Diagnose` and `## 🧠 Step 12 — Failure Remediate`, with their gates.
- **Renumber** `## 🤖 Step 13 — Update Local Dev` → Step 11 (`--number=11`, `### 🔒 Gate 11`), and `## 🤖 Step 14 — Close Workflow` → Step 12 (`--number=12`, `### 🔒 Gate 12`).
- **Step 12 (Close Workflow) sub-step 1:** add `Route:` after the `runs gate --squash-of ... --capstone-only` fence: exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2; exit 12 → the squash commit's CI is red, hold `NEXT_STEP` = `/bkit-debug {FID}` → **Failure Path**; **Else** → **Failure Path**. The `Else` arm is today's behaviour through the header rule "Exit non-zero with no `Route:` → **Failure Path**".

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** the file exists.
- **[DELETE]** `WORKFLOW_STEPS.ship`: the `ship-failure-diagnose` (11) and `ship-failure-remediate` (12, `resumeAt: ship-merge-pr`, `resumeOnVerdict: PASS`) entries and their comments.
- `WORKFLOW_STEPS.ship`: `ship-switch-to-dev` → 11, `ship-close-workflow` → 12; the "a merged PR goes on to Step 13" comment → Step 11.
- No `RETIRED_STEPS` entry: `resumePoint` already ignores rows of steps the table lacks.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** the file exists.
- **[DELETE]** `ROW_FIELDS`: `"ship/ship-failure-diagnose"` and `"ship/ship-failure-remediate"`.
- `progressPoint`: the `ship.merge` check list becomes `["ship-merge-pr"]`.

#### [MODIFY] `.bkit/core/engine/checks/status-holes.ts`

- **Existence Check:** the file exists.
- `SHIP_STEP_ORDER`: drop the two keys.
- **[DELETE]** `RETRY_LOOP_STEPS` and its four filters.
- The header comment and the `MERGED_ON_ENTRY_SKIP` comment cite Steps 11-12 by the new numbers and drop the retry-loop note.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** the file exists; the `syncDevVerb` doc comment at line 2704.
- The comment "Ship Step 13: after the merge, bring local dev up to origin/dev …" → Step 11. Comment only, no behaviour change.

#### [MODIFY] `docs/capabilities.md`

- **Existence Check:** the file exists; it records per-module symbol counts (`status-holes`, `step-table`, `steps`, `workflows`).
- Regenerated by `pnpm bkit:graph:refresh` after the engine edits are staged (the refresh reads the staged tree), never hand-edited; `.husky/pre-push` and CI's Check Capability Register block on drift.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** the file exists; `failVerb` at line 393.
- `failVerb`: read `str(ctx.flags.nextStep)` at the top, beside the `--token needs --fid` check, so a bad value exits before `failState` writes anything. Empty → absent. A value with a line break, or one not starting `/bkit-` → `CommandError(EXIT.USAGE, "--next-step must be one /bkit-* command line")`.
- The `buildComment` call passes `lines` = one line, `Next step: ` followed by the value in backticks, when the value is held.
- `ctx.emit` adds `nextStep` (the value, or `null`).
- The `fail` verb's flag spec and output doc gain `--next-step` / `nextStep`, which `pnpm cli:sync` copies into `.bkit/core/.bkit/cli.md`.
- `.bkit/core/engine/commands/workflow/issues.ts` (`buildComment`, `CommentInput.lines`) is reused unchanged.

### Tests

#### [MODIFY] the tests the runbook names

- `audits/workflows/workflow-shape.test.ts`, `audits/workflows/ship-invariants.test.ts`, `audits/workflows/counter-prose-audit.test.ts`, `commands/workflow/step-table.test.ts`, `commands/workflow/progress.integration.test.ts`, `commands/workflow/steps.test.ts`, `checks/status-holes.test.ts` and `commands/workflow/workflows.test.ts`, all under `.bkit/core/engine/`; and the regenerated baseline `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`.

### Docs and agent copies

#### [MODIFY] the docs in `Documentation Updates`

- The catalog, prompts, README and templates sources under `.bkit/core/.bkit/`; `docs/testing.md`; `.bkit/shared/docs/deployments.md` (the managed-block source) and the project-owned lines of `docs/deployments.md`; `docs/setup.md`; `.bkit/templates/.husky/pre-push` and `.husky/pre-push`; `.bkit/instructions.md`; and the three `utility-pre-release-check` agent copies.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `## 🧠 Step 11 — Failure Diagnose` and `## 🧠 Step 12 — Failure Remediate`, with their gates, in `.bkit/core/workflows/bkit-ship.md` | The Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` | DELETE | No route reaches them; decision `911-ship-failed-merge-steps-removed` (Task 2) |
| The Merge Question's "diagnosis found no clear cause" Q1 variant and its separate `Try again` arm | The used-up-limit Q1 and the grant arm | DELETE | Asked only from the removed Step 11 (Task 2) |
| `ship-failure-diagnose` and `ship-failure-remediate` in `WORKFLOW_STEPS.ship` in `.bkit/core/engine/commands/workflow/step-table.ts` | The existing ignore rule for rows of removed steps | DELETE | Task 1 |
| `"ship/ship-failure-diagnose"` and `"ship/ship-failure-remediate"` in `ROW_FIELDS`, and the two names in `progressPoint`, in `.bkit/core/engine/commands/workflow/steps.ts` | — | DELETE | Task 1 |
| The two keys in `SHIP_STEP_ORDER`, and `RETRY_LOOP_STEPS` with its filters, in `.bkit/core/engine/checks/status-holes.ts` | — | DELETE | Task 1 |
| The two entries in `COUNTER_STEP_MAP` (`counter-prose-audit.test.ts`), the two keys in `CANONICAL_SHIP_STEP_KEYS` (`ship-invariants.test.ts`), and the test "ship takes a merge fix round without asking when the diagnosis found the cause" (`workflow-shape.test.ts`) | — | DELETE | Task 2 |
| `retryLoopPathBStatus` and the "does NOT flag absence of failure-diagnose/remediate" checks (`status-holes.test.ts`) | The test that old rows are `unexpected` and nothing is `missing` | DELETE | Task 1 |
| The two `ship-failure-*` rows and the Step 11-12 sentences in the `/bkit-ship` catalog (`.bkit/core/.bkit/workflows.md`) | — | DELETE | Task 5 |
| The `ship-failure-*` globs in the Failure Path's abort-handover `Read:` line | — | DELETE | Task 2; no new run writes those files |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (source of `.bkit/workflows.md`) | "14 steps" → 12 in the overview and the `### \`/bkit-ship\` — 12 steps` heading; delete the Step 11-12 table rows, the `Ship merge loop` row of the fix-loop table, the resume bullet for a last `ship-failure-remediate` row, and every sentence naming the failure round (pre-merge pushes, "These refusals do not enter CI diagnosis or remediation.", the Step 12 fix commit); renumber every ship Step 13/14 citation to 11/12 (lines 29, 141, 146, 149, 217, 219, 300, 306, 338, 1076-1135, 1207, 1242, 1253, 1255, 1328, 1353, 1420-1422 and 1673 at planning time); the `ship.merge` Asks column (line 1012) and the `merge` owner-pause reason name only the used-up limit; "canonical 14 step keys" → 12; § Failure Path (line 801) adds `[--next-step=]` to the documented `workflows fail` signature |
| `.bkit/core/.bkit/prompts.md` | The sentence naming the agents' callers drops "Ship Steps 11-12" |
| `.bkit/core/.bkit/README.md` | Ship's step count 14 → 12 |
| `.bkit/core/.bkit/templates.md` | The `§ \`/bkit-ship\` — 14 steps` reference → 12 steps |
| `.bkit/core/.bkit/cli.md` | Regenerated by `pnpm cli:sync`: the `fail` flag list gains `--next-step` |
| `docs/testing.md` | "canonical 14 step keys" → 12; the pre-merge push list drops "Failure Remediate" |
| `.bkit/shared/docs/deployments.md` (source of the `docs/deployments.md` managed block, lines 1-541) | Line 349: drop "and a Failure Remediate fix"; `pnpm tsx .bkit/core/engine/cli.ts upgrade` renders it into `docs/deployments.md` |
| `docs/deployments.md` | Below `bkit:end` only: the "Step 14" citations at lines 617 and 640 → Step 12. Line 349 changes only through the shared source |
| `docs/setup.md` | The `§ \`/bkit-ship\` — 14 steps` reference → 12 steps |
| `.bkit/templates/.husky/pre-push` (line 116) and `.husky/pre-push` (line 173) | The `§ \`/bkit-ship\` — 14 steps` anchor in the `--scope=pr` comment → 12 steps, the same text in both |
| `.bkit/instructions.md` | Hand-rewrite the `bkit-ship.md` `- source:` block (around line 10341: delete the lines for the removed steps, renumber the rest) and the `failure-path` local entry for `.bkit/core/.bkit/workflows.md` § Failure Path (around line 9612: the `workflows fail` signature gains `--next-step`), per knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`; the pre-release-check example (line 11900) names a debug step key instead of `ship-failure-remediate` |
| `.claude/agents/utility-pre-release-check.md`, `.opencode/agents/utility-pre-release-check.md`, `.codex/agents/utility-pre-release-check.toml` | The same example, changed by hand in all three copies |
| `docs/decisions.jsonl` | Written at plan time: `911-ship-failed-merge-steps-removed`, `911-ship-steps-renumbered`, `467-ship-step-names-frozen` (same-key update), `911-ship-red-ci-next-step-flag` |
| `docs/deferrals.jsonl` | Written at plan time: `911-ship-strategy-field-removal-via-907` |
| `docs/capabilities.md` | Regenerated by `pnpm bkit:graph:refresh` in Task 3 after the engine edits are staged |
| `CHANGELOG.md` | No change in this plan: the file has no `Unreleased` section, and its entries are written by the release-prep commit (`chore(release): prepare …`) from the merged changes |
| `docs/knowledge.jsonl`, `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` | No change: no new learning, file kind, library, schema, UI or log |

## Rollback Strategy

Code-only — `git revert` sufficient.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database |
| **Code** | `git revert {COMMIT}` of the change's commits, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` to refresh `dist/` and the mirrors | A status file written after the change holds no `ship-failure-*` row, so the reverted engine reads it unchanged |
| **Risk window** | None | Consumers get the change only with a bkit release |

## Agent Execution Runbook

**Integration shape (advice only):** one PR for all six tasks is fine; a commit per task keeps each regenerated mirror beside its source change.

**Test-file ownership (the test freeze):** each task's `TEST FIRST` files are edited only by that task's tests step; once their red is recorded, the code step does not touch them (`steps finish` exit 11). Each task's code step edits only the test files its `UPDATE` lines mark `code step —`, which no `TEST FIRST` line in the same group names (`steps finish` exit 15 refuses a tests-step edit to such a file).

**Regenerate after a `bkit-ship.md` edit** (named `REGEN` below; run in this order):

1. Hand-rewrite the `bkit-ship.md` `- source:` block in `.bkit/instructions.md` to match the edited workflow (knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`).
2. `pnpm tsx .bkit/core/engine/tools/instructions.ts` (check only), then `pnpm instructions:sync` once the check names only the intended lines.
3. `pnpm build`, then `pnpm tsx .bkit/core/engine/cli.ts upgrade` to refresh `dist/` and the host-render mirrors (`.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/`, `.bkit/`).
4. `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u -t "bkit-ship: the none render matches its baseline byte for byte"`, never `pnpm bkit:generate` (it regenerates every baseline and the register outside this change's scope).
5. Read the `bkit-ship.none.txt` diff: it holds only the intended workflow changes, with no stub line left where a `bkit:tracker true` block was cut (knowledge `tracker-true-block-between-group-and-false-block-breaks-none-render`).
6. Run `git diff --stat .bkit/core/engine/render/__snapshots__/`: it lists `bkit-ship.none.txt` only.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Remove ship Steps 11-12

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Remove the ship failure steps from the engine and renumber ship to 12 steps there
  - **UPDATE:** `WORKFLOW_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`: delete the two ship failure entries, renumber `ship-switch-to-dev` 11 and `ship-close-workflow` 12, fix the "Step 13" comment
  - **UPDATE:** `ROW_FIELDS` in `.bkit/core/engine/commands/workflow/steps.ts`: delete the two ship failure entries
  - **UPDATE:** `progressPoint` in `.bkit/core/engine/commands/workflow/steps.ts`: the `ship.merge` check list becomes `ship-merge-pr` alone
  - **UPDATE:** `SHIP_STEP_ORDER` in `.bkit/core/engine/checks/status-holes.ts`: drop the two keys, and renumber the header and `MERGED_ON_ENTRY_SKIP` comments
  - **DELETE:** `RETRY_LOOP_STEPS` in `.bkit/core/engine/checks/status-holes.ts`: the list and its four filters
  - **UPDATE:** `syncDevVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: the doc comment "Ship Step 13: after the merge…" → Step 11 (comment only)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.test.ts`: tests step — replace the `it.each` "a ship failure-remediate %s row resumes at %o" with the old-row test; `runProgress all workflow numbers` (lines 131, 134), `runProgress flat workflow` (line 64) and `runProgress attempt suffix` (lines 158, 161, 163) expect ship total 12
  - **UPDATE:** `.bkit/core/engine/commands/workflow/progress.integration.test.ts`: tests step — the ship progress lines at 471 (`100% · Step 12/12 Close Workflow`), 497 and 510 (`Step 3/12 Base Check`) and 511 (`Step 9/12 Re-validate`), with their recomputed percentages
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: tests step — delete `retryLoopPathBStatus`, the retry-loop exclusions in `computeMandatoryForPath` and "does NOT flag absence of failure-diagnose/remediate (retry-loop steps)"; replace "retry-loop Path B: no holes (failure steps optional)" with the old-row test, whose expected universe is `[...SHIP_STEP_ORDER]`, not a hand list; the "Step 13" comments → Step 11
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: code step — "names every missing field at once" uses `build-failure-remediate`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: code step — in `bkit workflows summary`, add the guard test `lists ship-failure rows from a run started before their removal`, which passes before and after the change and so is not a `TEST FIRST` test
  - **READ:** `resumePoint` in `.bkit/core/engine/commands/workflow/step-table.ts`: the ignore rule for rows of removed steps
  - **DONE WHEN:** `grep -n 'ship-failure' .bkit/core/engine/commands/workflow/step-table.ts .bkit/core/engine/commands/workflow/steps.ts .bkit/core/engine/checks/status-holes.ts` prints nothing; `grep -n 'Ship Step 13' .bkit/core/engine/commands/workflow/branches.ts` prints nothing; `pnpm vitest run` on `step-table.test.ts`, `progress.integration.test.ts`, `status-holes.test.ts`, `steps.test.ts` and `workflows.test.ts` passes, including `bkit workflows summary` `lists ship-failure rows from a run started before their removal`. The `ship` case of `workflow-shape.test.ts` "the step table matches the step headings and their --step= calls" stays red until Task 2 renumbers the headings
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `bkit status resume ignores ship rows for the removed failure steps` fails on a remediate `PASS` row resuming at `ship-failure-remediate` instead of `ship-merge-pr`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `workflow progress runProgress all workflow numbers` fails on the ship line reading "Step 3/14 Base Check"
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `workflow progress runProgress flat workflow` fails on the ship line reading "71% · Step 10/14 Merge Gate + Merge PR"
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `workflow progress runProgress attempt suffix` fails on the attempt lines reading "Step 10/14 Merge Gate + Merge PR · Attempt 2"
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `workflow progress command wiring progress specialized completion producers` fails on the close line reading "Step 14/14 Close Workflow"
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `workflow progress command wiring progress accepts the ship base-check regression guard gate` fails on the progress line reading "21% · Step 3/14 Base Check"
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `workflow progress command wiring progress gate only completions` fails on the re-validate line reading "Step 9/14 Re-validate"
    - `.bkit/core/engine/checks/status-holes.test.ts` `detectHoles reports a pre-change run's ship-failure rows as unexpected and no step as missing` fails on `ship-failure-diagnose` being accepted as a known step instead of listed as unexpected

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Remove Failure Diagnose and Failure Remediate from the ship workflow, and renumber Steps 13-14 to 11-12
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the header (Resume, Limits, Locks, Worktrees), the Failure Path step 4 `Read:` line, the Step 2 MERGED route and the Step 10 routes, the Merge Question, the deleted Steps 11-12, and the renumbered Steps 11-12, per `Architecture & Component Changes` § Workflow (the `NEXT_STEP` lines and the Step 2 sub-step 5 split are Task 4)
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: tests step — add the Step 1-12 shape test and the Merge Question test; the `--require=strategy` test expects four sites; `Step 14 — Close Workflow` / `Step 13 — Update Local Dev` section matchers → Step 12 / Step 11; delete "ship takes a merge fix round without asking when the diagnosis found the cause"
  - **UPDATE:** `CANONICAL_SHIP_STEP_KEYS` in `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: tests step — 12 keys, with its comment and describe titles at 12; the push-timing list drops Failure Remediate; "wires bkit ledgers into exactly 2 bash regions" → 1; the `Step 11` exclusion in the gate-movement test names `Failure Diagnose`; `Step 14.3 labels skip` → Step 12
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: tests step — in "passes the actual merge target and defers branch deletion to guarded close" (line 264), `step(ship, 14)` → `step(ship, 12)`
  - **UPDATE:** `COUNTER_STEP_MAP` in `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts`: code step — delete the two ship failure entries
  - **UPDATE:** `.bkit/instructions.md`: the `bkit-ship.md` `- source:` block, through `REGEN`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated through `REGEN`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n 'ship-failure\|Failure Diagnose\|Failure Remediate' .bkit/core/workflows/bkit-ship.md` prints nothing; `REGEN` ran; `git diff --exit-code -- .bkit/core/prompts/bkit-debug-failure-diagnose.md .bkit/core/prompts/bkit-debug-failure-remediate.md` prints nothing; `pnpm vitest run` on `workflow-shape.test.ts`, `ship-invariants.test.ts`, `counter-prose-audit.test.ts`, `step-table.test.ts`, `progress.integration.test.ts`, `steps.test.ts`, `status-holes.test.ts`, `workflows.test.ts`, `trackers.test.ts` and `.bkit/core/engine/tools/instructions-coverage.test.ts` passes, including `bkit-ship.md — canonical 12 ship-* step-key set` and the `ship` case of "the step table matches the step headings and their --step= calls"
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12` fails on the heading "Step 11 — Failure Diagnose" still being present
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `status route --require=strategy is used at exactly the four strategy-routing sites` fails on the site list still holding "ship-failure-remediate"
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship asks the Merge Question only when the merge attempts are used up` fails on the Merge Question still holding "the diagnosis found no clear cause"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `bkit-ship.md — canonical 12 ship-* step-key set publishes the canonical 12 ship-* step-key set (no invented names)` fails on the workflow still naming "ship-failure-diagnose"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close` fails on Step 12 being Failure Remediate, with no "workflows close" fence

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Name `/bkit-debug` when ship stops on a red CI run

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Add `--next-step` to `bkit workflows fail`, and refresh the capability register for this change's engine edits
  - **UPDATE:** `failVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: validate `--next-step` before `failState` (empty → absent; a line break or no `/bkit-` prefix → `EXIT.USAGE` with "--next-step must be one /bkit-* command line"), pass the `Next step:` line through `CommentInput.lines`, emit `nextStep`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: the `fail` verb spec gains the `next-step` flag with its help text, and `nextStep` in the output doc
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: tests step — three tests in `bkit workflows fail`
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated by `pnpm cli:sync`
  - **UPDATE:** `docs/capabilities.md`: regenerated by `pnpm bkit:graph:refresh`, run after the engine edits of Tasks 1 and 3 are staged, because the refresh reads the staged tree
  - **READ:** `buildComment` in `.bkit/core/engine/commands/workflow/issues.ts`: appends `lines` after the links
  - **READ:** `CommentInput` in `.bkit/core/engine/commands/workflow/issues.ts`: the optional `lines` field
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `fail` spec in `workflows.ts` declares `next-step`; `.bkit/core/.bkit/cli.md` names `--next-step` in the `fail` flag list; `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` refreshed `dist/` and the mirrors; `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts` passes; `pnpm bkit:graph:refresh` ran and `pnpm bkit:graph:check` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep` fails on the comment missing "Next step: `/bkit-debug"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write` fails on the refusal not naming "must be one /bkit-* command line", or on a `workflow-failed` row being written
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail treats an empty --next-step as absent` fails on the flag being refused as unknown, or on `nextStep` not printing null

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Hold `NEXT_STEP` = `/bkit-debug {FID}` on every red-CI stop in ship, and pass it through the Failure Path and the Merge Question
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Step 2 sub-step 5 failed-check arms (CLI and exit-80 MCP); the Step 10 sub-step 1 exit-12 arms (new non-regenerable arm; the regenerate `Else` arm on `unchanged` / `undeclared`; the used-up regenerable arm, with `MERGE_ASK` false and true); the Merge Question's `Try again` (clears `NEXT_STEP`) and `Stop` (names it) arms; the Step 12 (Close Workflow) sub-step 1 `Route:`; and Failure Path step 1 (flag and exit-2 retry) and step 6 (last line, after any verbatim summary), per `Architecture & Component Changes` § Workflow
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: tests step — six tests in a new `bkit-ship.md — red CI names /bkit-debug` describe
  - **UPDATE:** `.bkit/instructions.md`: the `bkit-ship.md` `- source:` block, through `REGEN`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated through `REGEN`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** `REGEN` ran; `pnpm vitest run` on `ship-invariants.test.ts`, `workflow-shape.test.ts`, `trackers.test.ts` and `instructions-coverage.test.ts` passes, including the six `bkit-ship.md — red CI names /bkit-debug` tests
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other` fails on the exit-12 arm reaching the Failure Path with "no NEXT_STEP held"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened` fails on the `prs checks` failed-check arm reaching the Failure Path with "Step 2 failed check holds no NEXT_STEP"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it` fails on the Stop handover lacking "Next step: {NEXT_STEP}"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP` fails on sub-step 1 having "no Route: after runs gate --capstone-only"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it` fails on the `workflows fail` fence lacking "--next-step=", or on the `Next step:` line sitting before the verbatim `ship-summary.md` content
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path re-runs workflows fail without --next-step on exit 2` fails on Failure Path step 1 having "no exit 2 retry without --next-step"

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Docs and hand-authored copies

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
  - **UPDATE:** `.bkit/shared/docs/deployments.md`: line 349 drops "and a Failure Remediate fix" (the managed-block source; `pnpm tsx .bkit/core/engine/cli.ts upgrade` renders it into `docs/deployments.md`)
  - **UPDATE:** `docs/deployments.md`: below `bkit:end` only, the Step 14 citations at lines 617 and 640 → Step 12
  - **UPDATE:** `docs/setup.md`: the `§ \`/bkit-ship\` — 14 steps` reference → 12 steps
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: the `§ \`/bkit-ship\` — 14 steps`anchor in the`--scope=pr` comment (line 116) → 12 steps
  - **UPDATE:** `.husky/pre-push`: the same comment (line 173), with the same text as the template line
  - **UPDATE:** `.bkit/instructions.md`: the pre-release-check example names a debug step (`debug-failure-remediate` must read `debug-failure-diagnose`) instead of `ship-failure-remediate`
  - **UPDATE:** `.claude/agents/utility-pre-release-check.md`: the same example, by hand
  - **UPDATE:** `.opencode/agents/utility-pre-release-check.md`: the same example, by hand
  - **UPDATE:** `.codex/agents/utility-pre-release-check.toml`: the same example, by hand
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -rn 'ship-failure\|Failure Remediate fix\|bkit-ship\` — 14' docs/testing.md docs/deployments.md .bkit/shared/docs/deployments.md docs/setup.md .bkit/templates/.husky/pre-push .husky/pre-push .bkit/instructions.md .claude/agents/utility-pre-release-check.md .opencode/agents/utility-pre-release-check.md .codex/agents/utility-pre-release-check.toml`prints nothing;`grep -n 'Step 14' docs/deployments.md`prints no ship citation; the three agent copies hold the same example line;`pnpm tsx .bkit/core/engine/cli.ts upgrade`ran and`pnpm tsx .bkit/core/engine/cli.ts check`exits 0 with no managed-block drift;`pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` passes
  - **TEST FIRST:** n/a — docs and agent prompt wording only, no behaviour change

<!-- bkit:task 6 end -->

<!-- bkit:group 3 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `pnpm tsx .bkit/core/engine/cli.ts check` pass.
- [ ] **Test Synchronization:** no E2E test exists for these surfaces; the markdown-invariant tests (`workflow-shape.test.ts`, `ship-invariants.test.ts`, `counter-prose-audit.test.ts`) and `instructions-coverage.test.ts` change with the workflow in Tasks 2 and 4.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` keeps `**/*.test.ts` out of `dist/`; no test-only file is added.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/step-table.test.ts`, `.bkit/core/engine/checks/status-holes.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`):** the old-row resume, the 12-step progress line, the `unexpected` report, the summary guard and the three `--next-step` tests, each on a temporary status file the test writes.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/progress.integration.test.ts`):** the `bkit workflow progress` CLI prints the 12-step ship lines, through `pnpm test` (which includes `*.integration.test.ts`).
- [ ] **Capability register:** `pnpm bkit:graph:check` exits 0 after Task 3's refresh.
- [ ] **Unit (`.bkit/core/engine/render/trackers.test.ts`):** only `bkit-ship.none.txt` changes; `git diff --stat .bkit/core/engine/render/__snapshots__/` lists no other baseline.
- [ ] **Advisory hole sweep:** `pnpm bkit:audit:status` exits 0, and `docs/plans/202610/logs/719-cloud-variants-add/status.jsonl` lists its `ship-failure-*` rows under `unexpected` and nothing new under `missing`.
- [ ] **Apply local migrations:** not applicable — no database.
- [ ] **Run all tests:** `pnpm test` passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** After `pnpm build`, copy `docs/plans/202610/logs/719-cloud-variants-add/status.jsonl` to a scratch path, cut the copy after its last `ship-failure-*` row (its runs ended, so the cut leaves one `IN_PROGRESS` run), and run `node dist/cli.js status resume --workflow=ship --file={copy}`: it exits 0 and names `ship-merge-pr` / Step 10, not a failure step.
- [ ] **Step 2:** Run `node dist/cli.js workflows summary` on the same copy: it exits 0 and lists the old `ship-failure-*` rows.
- [ ] **Step 3:** Run `node dist/cli.js workflows fail --workflow=ship --step-number=10 --step-title="Merge Gate + Merge PR" --error="CI red" --next-step="/bkit-debug 911-ship-failed-merge"` in a scratch repo: the printed comment ends with ``Next step: `/bkit-debug 911-ship-failed-merge` `` and `nextStep` holds the value; `--next-step="git push"` exits 2. The run omits `--post` on purpose: `--post` sends the same body `buildComment` prints, so the printed `comment` proves the line, and a scratch repo has no tracker to post to. An owner who wants the live post can repeat the call with `--post --issue={scratch issue}` on a scratch GitHub issue.
- [ ] **Step 4:** Pack the package (`pnpm pack`), install it into a clean scratch consumer with `bkit install`, and read the rendered `.claude/commands/bkit-ship.md`: no Failure Diagnose or Failure Remediate step, Steps 1-12, and `NEXT_STEP` on the Step 2 failed-check arms, the Step 10 exit-12 arms (including the one before the Merge Question) and the Step 12 capstone route.
- [ ] **Step 5:** Run `bkit upgrade` in an existing scratch consumer on the previous release: the upgraded `bkit-ship.md` matches Step 4's render.
