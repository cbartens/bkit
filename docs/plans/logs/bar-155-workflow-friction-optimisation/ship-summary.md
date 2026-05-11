Verdict: PASS

<!-- verdict:end -->

# Ship Summary — bar-155-workflow-friction-optimisation

## Overview

BAR-155 shipped six friction-reduction fixes to bkit `.agents/` prompts and workflows:

| Fix | Scope | Files touched |
| --- | --- | --- |
| 1b | Freeform stub-first directive (`echo {finding} >> {output}`, eager `Verdict:` flip-on-FAIL) | 4 target prompts (`bkit-build-challenge-1`, `-2`, `bkit-build-plan-verify`, `bkit-build-challenge-tests`) |
| 2 | Deterministic task-count gate (>15 tasks → SPLIT) in `bkit-plan` Step 8 | 2 files (`bkit-plan.md` workflow, `bkit-plan-complexity-check.md` prompt) |
| 3 | Scoped BAR-N detection (>1 in `## Linear Issue:` section only) in `bkit-plan` Step 3 | 1 file (`bkit-plan.md` workflow) |
| 4a–d | Parallel challenge pair (`-1`/`-2`) + reconciler (`-reconcile`) replacing single agent; `bkit-build.md` Steps 9–18 wired | 8 files (3 new challenge prompts, 1 deleted, 2 workflows, 2 index docs) |
| 5 | Rebase failure routing via sentinel file (`.rebase-failed`) instead of bare `exit 1` | 1 file (`bkit-ship.md` workflow) |
| 6 | Always-on long-branch advisory in `bkit-build` Step 1 | 1 file (`bkit-build.md` workflow) |

PR #17 **squash-merged** to `dev` at **2026-05-10T11:03:09Z**, SHA `21c9bdc`. All six fixes landed atomically in single commit.

## Outcome Metrics

- **PR additions/deletions:** 744 lines added, 87 lines deleted (net: 657 lines) across `.agents/prompts/`, `.agents/workflows/`, `.agents/*.md` index docs, `docs/decisions.md`, `docs/pending.md`.
- **Files changed:** 18 files touched (3 new agents, 1 deleted, 6 workflow/prompt edits, 2 index docs, 6 decision/friction/pending appends).
- **Commits:** 1 squash-merged PR (original 18 commits in build phase + 10 commits in plan phase collapsed to single merge).
- **CI status:** Merge-blocking CI run `25627041858` **SUCCESS** (green first attempt, no retries). Build tests PASS (39 new regression tests, 744 total tests passing). All pre-push hooks clean.

## Ship Phase Details

**Build workflow outcome (2026-05-09 03:58–05:00 UTC):** All 18 steps DONE, summary verdict PASS. Step 9 build-challenge CONCERNS → remediated Step 10 PASS. All verification gates cleared; no regressions introduced.

**Plan workflow outcome (2026-05-09 01:35–02:37 UTC):** All steps DONE, plan-execute PASS, scope-check CONCERNS (4 failures remediated), complexity SINGLE (10 tasks ≤ 15). Deliverable: `docs/plans/active/bar-155-workflow-friction-optimisation-plan.md`.

**Ship Phase (2026-05-10 10:55–11:05 UTC):**
- Step 1 (Start Workflow) — transitioned issue State to "In Progress".
- Step 2 (Worktree Setup) — rebase friction: bare `git rebase origin/dev` failed with `docs/pending.md` conflict despite branch already containing full origin/dev history via merge commit. Operator switched to `git rebase --rebase-merges origin/dev` — succeeded. Friction recorded in `.agents/friction.md` (BAR-169 filed).
- Step 3 (Merge PR) — PR #17 **squash-merged** SUCCESS, `21c9bdc` landed on `dev`.
- Step 4 (Switch to dev) — dev branch synced.

## Friction Surfaced This Ship

**Rebase conflict on merge-integrated branch (bkit-ship Step 2):**
- **Description:** Bare `git rebase origin/dev` failed at commit `880921c` with `docs/pending.md` conflict despite branch containing full origin/dev integration via merge commit `4725094`. Additive merge-resolved conflict re-introduced when replaying individual commits.
- **Recovery:** Operator switched to `git rebase --rebase-merges origin/dev` (preserves merge structure) — succeeded immediately with no conflicts.
- **Issue filed:** BAR-169 created to track rebase-conflict gap (out of scope for BAR-155 Fix 5 sentinel routing, which ships in this merge but does not address root cause of rebase anti-pattern on long-lived branches with merges).
- **Status:** OPEN (friction recorded; BAR-169 deferred for separate follow-up).
- **Reference:** `.agents/friction.md` entry "bkit-ship Step 2 bare `git rebase` fails on branches with merge commits" (Status: OPEN).

## Follow-ups

**No blocking items.** Ship complete:

1. **BAR-169 (Deferred):** Rebase-conflict root-cause investigation and fix (`git rebase --rebase-merges` vs detection of already-integrated branches) — tracked separately, not part of BAR-155 Fix 5 scope.

2. **Pre-existing friction (open, not addressed by BAR-155):**
   - `.husky/pre-push` stdin-sensitivity issue causing advisory-only exit-1 (blocks commit push out-of-band — operator unblocked manually). Recorded in friction.md; candidate for future hook-fix follow-up.
   - `bkit-build-challenge-remediate` skipped `bkit install` post-canonical-edit (bar-148-option-1, resolved; friction recorded as pattern to watch).

3. **Deferred plan items (in `docs/pending.md`):**
   - `task-range` parameter for `bkit-build-plan-execute` (revisit if Fix 2 task-count gate proves insufficient).
   - KN/DE auto-renumber on rebase conflicts (deferred; sed regex cross-platform fragility risk).
   - Focused-brief mode for challenge (deferred; diversity > narrowing per ADR decision).
   - `bkit-build.md` Step 2 same `git rebase || exit 1` anti-pattern (carry-over for follow-up issue; Fix 5 addresses ship-phase variant only).

4. **Mirror regeneration:** Deferred to end-of-session per `bkit Repo Authoring` rules. `bkit install` not yet run; `.claude/agents/` and `.cursor/commands/` mirrors will be regenerated after ship-phase completion.
