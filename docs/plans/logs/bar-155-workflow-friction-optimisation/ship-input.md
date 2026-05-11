# Ship Input — bar-155-workflow-friction-optimisation

## Session prompt

> ok now follow bkit-ship to merge bar-155 into dev

User invoked `/bkit-ship BAR-155` after manually resolving an additive merge conflict in `docs/pending.md` (BAR-155 deferred entries vs BAR-167 deferred entry from dev) and creating BAR-169 to track the rebase-conflict gap. PR #17 status at workflow entry: **MERGEABLE**, CI **SUCCESS**, HEAD `3b8f575`.

## Linear Issue: BAR-155 — bkit workflow friction optimisation

**State at ship entry:** In Progress (transitioned from In Review by Step 1)
**Labels:** Ship
**Project:** bkit / Workflow Agent Optimisation

### Description

Friction-reduction fixes to bkit `.agents/` prompts and workflows, surfaced from `.agents/friction.md` entries collected 2026-05-06 → 2026-05-08.

Six fixes shipped on this branch:

| Fix  | What changed                                                                                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1b   | `echo {finding} >> {output}` stub-first + eager `Verdict:` flip on FAIL added to `bkit-build-challenge-1`, `-2`, `bkit-build-plan-verify`, `bkit-build-challenge-tests`    |
| 2    | `bkit-plan` Step 8 hard task-count gate (>15 → SPLIT, deterministic, no LLM judgement)                                                                                     |
| 3    | `bkit-plan` Step 3 scoped BAR-N detection (>1 in `## Linear Issue:` section → Failure Path)                                                                                |
| 4a–d | Single `bkit-build-challenge.md` → parallel pair (`-1` Opus/high, `-2` Sonnet/medium) + reconciler (`-reconcile` Opus/xhigh); `bkit-build.md` Steps 9–18 wired accordingly |
| 5    | `bkit-ship.md` Step 2 rebase failure: bare `exit 1` → sentinel-file Failure Path routing                                                                                   |
| 6    | `bkit-build.md` Step 1 always-on long-branch advisory (`N commits behind dev / M ago since divergence`)                                                                    |

Out-of-scope items deferred to `docs/pending.md`. KN/DE auto-renumber, focused-brief mode, and template-vs-canonical preference rule explicitly dropped (rationale recorded in DE-16).

## Workflow history (prior comments, latest first)

### Build Workflow comment (2026-05-09 03:58 UTC, updated 05:00 UTC)

All 18 build steps DONE. 744 tests passing (39 new regression tests). All pre-push hooks clean. Plan tasks 1–10 PASS. Build summary recorded `docs/plans/logs/bar-155-workflow-friction-optimisation/build-summary.md`.

Step verdicts:

- Step 5 Plan Execute — PASS
- Step 6 Plan Verify — CONCERNS attempt 1 → PASS attempt 2
- Step 7 Plan Gaps Remediate — PASS attempt 1 (STANDARD)
- Step 9 Build Challenge — CONCERNS
- Step 10 Build Challenge Remediate — PASS attempt 1
- Step 11 Build Challenge Tests — PASS attempt 1
- Step 13 Run Tests — PASS attempt 1
- Step 16 Summary — PASS

### Plan Workflow comment (2026-05-09 01:35 UTC, updated 02:37 UTC)

Plan generated, reviewed, scope-checked. Verdicts: Step 4 CONCERNS (8 failures) → Step 5 Apply Review PASS → Step 6 Scope Check CONCERNS (4 failures) → Step 7 Apply Scope CONCERNS → Step 8 Complexity SINGLE → Step 10 Summary CONCERNS. Pre-push hook stdin-sensitivity friction (`pnpm bkit check` ≠ husky-forwarded stdin) recorded; user unblocked push out-of-band.

## Friction observed during ship Step 2

- Bare `git rebase origin/dev` failed at commit `880921c` with `docs/pending.md` conflict despite branch already containing full origin/dev history via merge commit `4725094`. Switched to `git rebase --rebase-merges origin/dev` — succeeded 50/50. Recorded as new friction entry (OPEN); deviation from literal workflow command but step goal achieved. See `.agents/friction.md` "bkit-ship Step 2 bare `git rebase` fails on branches with merge commits" entry.

## Plan deliverable

See `docs/plans/active/bar-155-workflow-friction-optimisation-plan.md` for the full task breakdown (10 tasks, single-shot SINGLE complexity).
