# Brief: group 5 — Challenge round 2 findings

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
- Group 3: Docs and hand-authored copies — done
  - TASK 5: Rewrite the bkit docs that ship with the package — done
  - TASK 6: Rewrite the repo docs, the shipped `pre-push` comment and the hand-authored `utility-pre-release-check` copies — done
- Group 4: Challenge round 1 findings — done
  - TASK 7: A workflows fail usage error unrelated to --next-step (e.g. a non-numeric --step-number thrown by buildComment after failState already wrote) triggers the Failure Path retry, which appends a second workflow-failed row and drops a valid NEXT_STEP from the final message — done
- Group 5: Challenge round 2 findings — this group
  - TASK 8: A Failure Path that passes the fence's `--next-step="{NEXT_STEP}"` unsubstituted (or holds `/bkit-debug {FID}` verbatim) gets exit 2 from the flag parser's placeholder guard, not exit 6, so the retry never fires and the run ends with no workflow-failed row, the lock still held, and no failure comment or bkit:failed label — open

## The work

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** A Failure Path that passes the fence's `--next-step="{NEXT_STEP}"` unsubstituted (or holds `/bkit-debug {FID}` verbatim) gets exit 2 from the flag parser's placeholder guard, not exit 6, so the retry never fires and the run ends with no workflow-failed row, the lock still held, and no failure comment or bkit:failed label
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:101` · **Round:** 2
  - **DONE WHEN:** A `--next-step` value refused for any reason before a write (the `/bkit-*` shape check in failVerb, `.bkit/core/engine/commands/workflow/workflows.ts:411`, and the `{UPPER}` placeholder guard that `parseFlags` raises at `.bkit/core/engine/commands/lib.ts:265`) exits 6, for example through a per-flag placeholder exit code on the `next-step` FlagSpec, so the ship Failure Path's exit-6 retry records the failure, releases the lock and posts the comment; every other flag's placeholder refusal still exits 2.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit` fails on `--next-step=/bkit-debug {FID}` and `--next-step={NEXT_STEP}` exiting 2 (`--next-step carries the unsubstituted placeholder`) instead of 6, with the status file unchanged and the lock still held

<!-- bkit:task 8 end -->
