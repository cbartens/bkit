# Debug Abort Handover

## The Short Version

The automated "roadmap board" feature (#380) is code-complete and mostly working, but the last checkpoint found 5 small gaps where different parts of the feature don't quite line up with each other. Before anyone could look at those gaps, today's automated attempt to sync the work branch with the team's shared branch hit a scary-looking but routine conflict (3 files edited on both sides) and stopped itself rather than guess — nothing is broken or lost, it just needs a person (or the next automated run) to say which side wins for each of the 3 files, then go fix the 5 gaps.

## What's Actually Happening

**Symptom:** Debug Step 2 (Worktree Setup) aborted with a `.rebase-failed` sentinel; the workflow routed to the Failure Path before any test or diagnosis ran.

**Trigger:** The feature branch (`feat/380-roadmap-analysis-refresh`) is 31 commits ahead of the merge-base (`b0d5b150`) — genuinely #380's own work — and 7 commits behind `origin/dev` (33 commits replayed during the rebase attempt, since a rebase replays ahead-commits on top of the new base, not just the raw behind-count). Both figures are real; this is expected churn on a long-lived branch, not a bug, and not the "stale worktree base" corruption case (ruled out — see Persistent Errors § 3).

**Proximate cause:** `git rebase origin/dev` hit content/modify-delete conflicts beyond the routine `pnpm-lock.yaml` case the workflow auto-resolves, in 3 files:

- `.bkit/src/bkit-manifest.test.ts` — content conflict (both sides edited the same lines)
- `.bkit/workflows.md` — content conflict (both sides edited the same lines)
- `docs/completed.md` — modify/delete: the feature branch DELETED this file (via #380's own migration to `docs/roadmap.jsonl`, a load-bearing part of the design), while `dev` MODIFIED it (some other change landed on `docs/completed.md` after this branch forked, before #380's own migration removed it there too, presumably via a later ship).

**Root cause (design fragility, not a defect):** None — this is the normal shape of a long-running branch (31 commits, spanning multiple sub-plans and several days) rebasing onto a shared branch that has also moved. The workflow's automated conflict-resolution only covers the single known-safe case (`pnpm-lock.yaml`); anything else is intentionally routed to a human/next-attempt decision rather than guessed.

**Contributing factors:** `docs/completed.md`'s modify/delete conflict is a direct consequence of #380's own scope — it is the file this feature deletes as part of migrating to `docs/roadmap.jsonl`. If `dev` shipped an unrelated `docs/completed.md` edit (or another feature's own migration-adjacent touch) between when this branch forked and now, that edit needs to be reconciled against the deletion, not blindly discarded.

The rebase was aborted cleanly; the branch sits at its pre-rebase HEAD `9ebd3361` — no commits were lost, nothing was force-pushed, working tree is clean at that point.

## Rot Signals

None. No diagnose attempt ran this cycle (aborted at Worktree Setup, before Step 3), so no rot-signal extraction was possible. `.agents/docs.md` and `docs/knowledge.jsonl` were consulted for handover-writing only; no rot signal was raised against them.

## Out-of-Scope Recommendations

None. No diagnose attempt ran this cycle, so none were produced.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| n/a (Debug Step 2, DEBUG_ATTEMPT 1) | Worktree Setup rebased `feat/380-roadmap-analysis-refresh` (31 commits ahead) onto `origin/dev` (33 commits replayed) to pick up shared-branch changes before running tests/diagnosis. | Conflicts beyond the auto-resolved `pnpm-lock.yaml` case appeared in 3 files (2 content, 1 modify/delete) — the workflow does not attempt to resolve these itself and correctly routed to the Failure Path. No tests ran, no `debug-diagnose` attempt was made. |

The unresolved **build** failure this debug run was meant to address (from the prior `build` workflow, `build-plan-verify-holistic`, attempt 1, `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`) is a separate, later concern — see Persistent Errors below. It was never reached this cycle.

## Verified Resolutions (DO NOT ROLL BACK)

None from this cycle — no remediation was attempted. Everything landed by the prior `build` workflow (all 3 sub-plans PASS per their own verify logs: `build-plan-verify-1-4.md`, `-2-4.md`, `-3-3.md`) remains as committed on the branch at `9ebd3361`; do not revert any of that work while resolving the rebase.

## Persistent Errors

**1. Rebase conflict (this cycle's abort cause) — NOT YET RESOLVED:**

- `.bkit/src/bkit-manifest.test.ts` — content conflict.
- `.bkit/workflows.md` — content conflict.
- `docs/completed.md` — modify/delete (deleted on `feat/380-roadmap-analysis-refresh`, modified on `origin/dev`).
- Event sequence: `git fetch origin dev` → `git rebase origin/dev` (auto-resolve `pnpm-lock.yaml` only) → conflict on the 3 files above → `git rebase --abort` → `.rebase-failed` sentinel written → workflow routed to Failure Path. Branch HEAD is unmoved at `9ebd3361`; no force-push occurred.

**2. `build-plan-verify-holistic` FAIL (5 integration gaps) — carried over, NOT YET DIAGNOSED this cycle:**

Full detail in `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`. Summary of the 5 gaps (all cross-sub-plan, none catchable by a per-sub-plan verify pass):

1. `bkit-ship.md` never calls `bkit_roadmap_fold` — the board still shows a shipped FID under Build/Debug until some unrelated FID's design/plan/build/debug close happens to regenerate it. Sub-plan 1 explicitly deferred this to sub-plans 2/3; neither picked it up.
2. `bkit-roadmap-fold.sh:180-181` renders a literal `### Ship _(in flight — populated by ship-close wiring, sub-plans 2/3)_` plus hardcoded `_(none)_` into every consumer's `docs/roadmap.md` — bkit-internal sub-plan numbering leaking into shipped surface, and the six-state ladder has no in-flight-ship state to ever populate that section.
3. `/bkit-roadmap` (`bkit-roadmap.md`) never appends a `ROADMAP_SCAN_COVERAGE` counter row — the `shell-bus` derivation decision was implemented in `bkit-ship.md` only, not the on-demand path.
4. `.bkit/.roadmap-refresh-on-demand.md` is called "gitignored" in the shipped prose but is absent from both `.gitignore` and `.bkit/templates/gitignore` (unlike its two sibling `#380` scratch paths) — a stray report can get swept into a build/debug `git add -A` close commit.
5. Committed `docs/roadmap.md` (4-column, no `### Ship` section) does not match the current `bkit-roadmap-fold.sh` output (5-column, with `### Ship`) — a stale Task 15 dogfood artifact.

Gate suite at that verify pass was fully green (`pnpm test`, `pnpm test:bats`, `pnpm typecheck`, `pnpm check:dist`, `pnpm slop:delta`, `pnpm bkit check`, `pnpm lint:prose`, `pnpm format:check` — see the log for exact output). The 5 gaps are integration-only defects, not implementation breakage.

**3. Large Diff Guard data (confirmed by the coordinator; this session had no shell/Bash tool of its own):**

Branch state: HEAD = `9ebd3361` (unmoved, as assumed above). Working tree has exactly 5 entries, all expected from this handover's own writes: modified `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl`, plus untracked `debug-handover.md`. Merge-base with `origin/dev` = `b0d5b150`. Full `git diff origin/dev..HEAD` = 20835 lines — per-file budget mode applies. Top 20 files by lines changed (`--numstat`, added+deleted):

<!-- prettier-ignore -->
| Lines | File |
| --- | --- |
| 1757 | `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-input.md` |
| 1577 | `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-input.md` |
| 753 | `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-input.md` |
| 641 | `.bkit/src/bkit-cloud-ctx-step.integration.test.ts` |
| 632 | `.github/workflows/bkit-cloud.yml` |
| 632 | `.bkit/templates/.github/workflows/bkit-cloud.yml` |
| 486 | `.bkit/src/bkit-telemetry-migrate.ts` |
| 427 | `dist/bkit-telemetry-migrate.js` |
| 314 | `.bkit/src/bkit-roadmap-sync.integration.test.ts` |
| 264 | `.bkit/version` |
| 264 | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| 258 | `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md` |
| 229 | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |
| 205 | `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` |
| 205 | `.bkit/scripts/bkit-roadmap-fold.sh` |
| 200 | `.bkit/workflows/bkit-ship.md` |
| 199 | `.bkit/src/bkit-roadmap-refresh-prompt.test.ts` |
| 190 | `docs/completed.md` |
| 186 | `.opencode/commands/bkit-ship.md` |
| 186 | `.cursor/commands/bkit-ship.md` |

**Verified: this is an ordinary behind-by-7 branch, NOT the "stale `origin/dev` ref" corruption case.** Measured directly: the branch is 31 commits ahead of the merge-base AND 7 commits behind `origin/dev`; both figures are real, and the 31 genuinely are #380's own work. `git diff b0d5b150..HEAD --shortstat` (merge-base baseline — #380's real change) = **123 files changed, 7968 insertions(+), 454 deletions(-)**. `git diff origin/dev..HEAD --shortstat` = **187 files changed, 8594 insertions(+), 8330 deletions(-)**. The `363-widen-bkit-cloud-trigger` artifacts (`ship-input.md`, `build-input.md`) do show as pure deletions in the `origin/dev..HEAD` diff, but the reason is benign: those files exist on `origin/dev` (landed via 7 commits this branch hasn't rebased in yet) and simply aren't on this branch, because the branch is behind, not because #380 deletes them or was cut from a stale ref. None of the 7 dev-only commits (`702426ae`, `fe289e67`, `fbd46ad0`, `a62dc54d`, `b8bf1bfd`, `ded52461`, `a924c9a4`) is an ancestor of HEAD. **Consequence for anyone sizing #380: `origin/dev..HEAD` overcounts by roughly 2.5x (20835 vs. the real 8422 merge-base lines) because it also carries the diff of everything dev gained in those 7 commits.** The honest baseline for reviewing #380 is `git diff b0d5b150..HEAD` (the merge-base), or `origin/dev..HEAD` re-taken only AFTER the rebase actually lands. The Step 2 rebase already attempted is exactly the correct fix for this — it must be completed, not worked around.

Dev-side history of the 3 conflicting files since merge-base `b0d5b150` (each has exactly one dev-side commit, all inside the 7-commit behind range):

<!-- prettier-ignore -->
| File | Dev commit | Subject |
| --- | --- | --- |
| `.bkit/workflows.md` | `fbd46ad0` | fix(363-widen-bkit-cloud-trigger): emit the auto-route marker; close challenge F1-F11 (#407) |
| `.bkit/src/bkit-manifest.test.ts` | `a62dc54d` | fix(lint-prose): stop the prose gate silently self-disabling in worktrees |
| `docs/completed.md` | `fe289e67` | docs(363-widen-bkit-cloud-trigger): ship DONE bkit [skip ci] |

This resolves the open question from the earlier draft of this section: `docs/completed.md`'s dev-side edit is FID `363`'s ship-DONE completion row (190 lines changed) — not an unrelated migration touch. See the sharpened resolution rule below; carrying that row forward as a `docs/roadmap.jsonl` entry before accepting the deletion is now a **required** step, not merely something to check.

## Recommended Next Steps

**Option A — Resolve the 3 rebase conflicts by hand, then re-run debug (recommended).**
✅ FIXES: unblocks Debug Step 2 so tests + diagnosis of the 5 holistic gaps can finally run.
❌ DOES NOT FIX: the 5 holistic-verify integration gaps themselves — those still need a real `debug-diagnose` + `debug-failure-remediate` pass after the rebase lands.
⚠️ COST: ~15-30 minutes of careful manual conflict resolution (2 content conflicts need line-level review of both sides; the `docs/completed.md` modify/delete needs a judgment call — see resolution rule below); low risk since nothing is force-pushed until resolution is verified.

**Option B — Skip the rebase for this debug cycle (proceed against the branch's current base) and defer sync to ship.**
✅ FIXES: nothing blocks Debug Step 3+ immediately; the 5 holistic gaps could be diagnosed sooner.
❌ DOES NOT FIX: `origin/dev` and the feature branch keep diverging, so the eventual ship-time integration/rebase gets larger and riskier the longer this is deferred; also whatever `dev` changed in `.bkit/workflows.md` / `bkit-manifest.test.ts` / `docs/completed.md` stays un-integrated into this branch's own gap-fixing work, which is a plausible source of new conflicts later.
⚠️ COST: requires whatever mechanism this workflow has (if any) to explicitly opt out of the mandatory rebase step — may not be a supported path at all; treat as a fallback only if Option A is blocked.

**Option C — Re-run Debug Step 2 unattended and let the workflow retry the rebase.**
✅ FIXES: nothing — the conflict is deterministic (same 3 files, same content) and will reproduce identically on a bare retry with no `origin/dev` movement in between.
❌ DOES NOT FIX: anything; wastes a debug attempt.
⚠️ COST: burns `DEBUG_ATTEMPT` budget for zero progress; only sensible if `origin/dev` has since moved further in a way that might resolve the conflict (unlikely for a modify/delete).

## Recommended Path

**Option A.** Resolve the 3 conflicts by hand using the repo's own doctrine (below), then let debug proceed from Step 2. This is the only option that makes forward progress on both the rebase AND the 5 real bugs waiting behind it, and the conflict set is small (3 files) and well-understood — none of them are surprising given #380's own scope (it deletes `docs/completed.md`) and the repo's shared-doctrine files (`.bkit/workflows.md`) are exactly the kind of file the repo's own conflict-resolution rule already covers.

**Per-file resolution rule** (per `.agents/rules.md` and repo doctrine — take `dev` for shared doctrine files under `.bkit/workflows`/`.bkit/prompts`/`.agents/rules.md`; take the feature branch for its own code and plan artifacts):

- **`.bkit/workflows.md`** — shared doctrine file under `.bkit/workflows`. Confirmed: dev's side is `fbd46ad0` "fix(363-widen-bkit-cloud-trigger): emit the auto-route marker; close challenge F1-F11 (#407)" — this is exactly the kind of shared-doctrine edit the carve-out means to preserve, and it must survive. But this file is also one #380 itself edits (per the plan's own Sub-Plan 1/2/3 task lists — the roadmap-status wiring, `bkit_roadmap_fold` call sites, Telemetry Ledgers row for `docs/roadmap.jsonl`). This is NOT a pure "take dev" case — do a real three-way merge: start from `dev`'s side (keeping `fbd46ad0`'s auto-route-marker doctrine intact), then re-apply #380's specific edits on top (`git log --oneline feat/380-roadmap-analysis-refresh -- .bkit/workflows.md` to see exactly what #380 changed) — neither side's edit should be dropped.
- **`.bkit/src/bkit-manifest.test.ts`** — a test file, not itself named in the shared-doctrine carve-out (`.bkit/workflows`/`.bkit/prompts`/`.agents/rules.md`), so it falls under "feature branch for its own code" for #380's own assertions (e.g. `docs/completed.md` removed from the manifest, `docs/roadmap.jsonl` merge-strategy entries) — but dev's side is confirmed as `a62dc54d` "fix(lint-prose): stop the prose gate silently self-disabling in worktrees", a real bug fix unrelated to #380 that must be re-applied, not discarded. Resolution: keep #380's manifest assertions from the feature branch AND re-apply `a62dc54d`'s prose-gate/worktree-detection fix from dev on top — both sides are required, this is an additive merge, not a pick-one.
- **`docs/completed.md`** — modify/delete. Confirmed: dev's side is `fe289e67` "docs(363-widen-bkit-cloud-trigger): ship DONE bkit [skip ci]" — FID `363`'s own ship-DONE completion row (190 lines changed), not incidental churn. #380 deletes this file as part of its migration to `docs/roadmap.jsonl` (Directive 2, sub-plan 1 Tasks 1/2/5, confirmed intact in the plan file). **Required resolution, not optional:** before accepting the deletion, carry FID `363`'s completion forward as a `docs/roadmap.jsonl` row (`kind:"feature"`, `key:"363-widen-bkit-cloud-trigger"` or its minted FID slug, `status:"SHIPPED"`) using `fe289e67`'s diff (`git show fe289e67 -- docs/completed.md`) as the source content, in the same shape the migration's own bootstrap-seed logic produces for other legacy rows (see `.bkit/src/bkit-telemetry-migrate.ts`, and the sibling `380-bootstrap-seed-key-namespace-mismatch...` OPEN deferral in `docs/deferrals.jsonl` for the seed-key convention). Only once that row is appended should `docs/completed.md`'s deletion be accepted for the merge.

This is not a corruption case needing a workaround — the branch is simply 7 commits behind `origin/dev`, and the Step 2 rebase already attempted is exactly the correct fix. Proceed straight to the per-file resolution rules above; no separate stale-base check is needed.

After resolving, verify with a fresh `git status` and `git diff b0d5b150..HEAD --shortstat` (the honest #380-only baseline — do not re-judge change size from `origin/dev..HEAD` until AFTER the rebase lands, since pre-rebase that diff still overcounts by the 7-commits-behind delta) before continuing debug, and let Debug Step 2 finish (push if `PUSH_MODE` requires it) before proceeding to Step 3 (tests) and `debug-diagnose` against the 5 holistic gaps in Persistent Errors.

## Reference Docs

- `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl` — full workflow history (design DONE, plan DONE, build FAILED at `build-plan-verify-holistic` attempt 1 with 5 failures, this debug run FAILED at Step 2).
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md` — the 5 integration gaps this debug cycle exists to fix; not yet reached.
- `docs/plans/202607/380-roadmap-analysis-refresh-plan.md` — master plan index; confirms `docs/completed.md` deletion is intentional #380 scope (Directive 2).
- No `debug-*.md` diagnose artifacts exist for this attempt — none were produced (aborted before Step 3).
- `docs/failures.jsonl` / `docs/deferrals.jsonl` — new rows appended by this handover (see below) recording the rebase-conflict block and the still-open 5 holistic gaps.
- `.agents/rules.md` — source of the shared-doctrine-vs-feature-branch conflict-resolution rule applied above.
